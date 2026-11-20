#!/usr/bin/env bash
# Executed on the Linux server, as an unprivileged deployment user.
set -Eeuo pipefail
root=$1
release=$2
site_url=${3%/}
umask 022

exec 9>"$root/.deploy.lock"
flock -w 120 9
mkdir -p "$root/releases"
destination="$root/releases/$release"
archive="$root/incoming/$release.tar.gz"
[[ ! -e "$destination" ]]
if [[ -e "$root/current" && ! -L "$root/current" ]]; then
  echo "current must be a symlink, not a real directory" >&2
  exit 1
fi
previous=$(readlink "$root/current" || true)
switched=false
cleanup() {
  status=$?
  trap - EXIT
  if (( status != 0 )) && [[ "$switched" == true ]]; then
    if [[ -n "$previous" ]]; then
      ln -s "$previous" "$root/.rollback-$release"
      mv -Tf "$root/.rollback-$release" "$root/current"
      echo "Deployment failed; previous release restored." >&2
    else
      rm -f "$root/current"
      echo "First deployment failed; current removed." >&2
    fi
  fi
  rm -f "$archive" "$root/.current-$release"
  exit "$status"
}
trap cleanup EXIT
mkdir "$destination"
tar -xzf "$archive" --no-same-owner --no-same-permissions -C "$destination"
test -s "$destination/index.html"
[[ "$(cat "$destination/deploy-version.txt")" == "$release" ]]
chmod -R u=rwX,go=rX "$destination"
ln -s "$destination" "$root/.current-$release"
switched=true
mv -Tf "$root/.current-$release" "$root/current"

# Verify the actual release through HTTPS/Nginx; never ignore TLS failures.
healthy=false
for attempt in {1..6}; do
  actual=$(curl --fail --silent --show-error --connect-timeout 5 --max-time 15 \
    -H 'Cache-Control: no-cache' "$site_url/deploy-version.txt?release=$release") || actual=''
  if [[ "$actual" == "$release" ]] && curl --fail --silent --show-error \
    --connect-timeout 5 --max-time 15 "$site_url/" -o /dev/null; then
    healthy=true
    break
  fi
  sleep 5
done
[[ "$healthy" == true ]]
echo "Deployed release $release"
