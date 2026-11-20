#!/usr/bin/env bash
set -Eeuo pipefail

: "${SSH_HOST:?Set production variable SSH_HOST}"
: "${SSH_USER:?Set production variable SSH_USER}"
: "${SSH_PORT:?Set production variable SSH_PORT}"
: "${DEPLOY_PATH:?Set production variable DEPLOY_PATH}"
: "${SITE_URL:?Set production variable SITE_URL}"
: "${SSH_PRIVATE_KEY:?Set production secret SSH_PRIVATE_KEY}"
: "${SSH_KNOWN_HOSTS:?Set production secret SSH_KNOWN_HOSTS}"

# Values also cross a remote shell boundary: allow only the documented forms.
[[ "$SSH_HOST" =~ ^[a-zA-Z0-9][a-zA-Z0-9.-]*$ ]]
[[ "$SSH_USER" =~ ^[a-z_][a-z0-9_-]*$ ]]
[[ "$SSH_PORT" =~ ^[0-9]{1,5}$ ]] && (( 10#$SSH_PORT > 0 && 10#$SSH_PORT <= 65535 ))
[[ "$DEPLOY_PATH" =~ ^/[a-zA-Z0-9_/-]+$ && "$DEPLOY_PATH" != "/" ]]
[[ "$SITE_URL" =~ ^https://[a-zA-Z0-9][a-zA-Z0-9.-]*(:[0-9]+)?/?$ ]]
release="$GITHUB_SHA-$GITHUB_RUN_ID-$GITHUB_RUN_ATTEMPT"
[[ "$release" =~ ^[a-f0-9]{40}-[0-9]+-[0-9]+$ ]]

ssh_dir=$(mktemp -d)
trap 'rm -rf -- "$ssh_dir"' EXIT
chmod 700 "$ssh_dir"
printf '%s\n' "$SSH_PRIVATE_KEY" > "$ssh_dir/key"
printf '%s\n' "$SSH_KNOWN_HOSTS" > "$ssh_dir/known_hosts"
chmod 600 "$ssh_dir/key" "$ssh_dir/known_hosts"
opts=(-i "$ssh_dir/key" -o BatchMode=yes -o IdentitiesOnly=yes
      -o StrictHostKeyChecking=yes -o "UserKnownHostsFile=$ssh_dir/known_hosts"
      -o ConnectTimeout=15 -o ServerAliveInterval=15 -o ServerAliveCountMax=3)
target="$SSH_USER@$SSH_HOST"

ssh "${opts[@]}" -p "$SSH_PORT" "$target" "mkdir -p '$DEPLOY_PATH/incoming'"
scp "${opts[@]}" -P "$SSH_PORT" site.tar.gz "$target:$DEPLOY_PATH/incoming/$release.tar.gz"
ssh "${opts[@]}" -p "$SSH_PORT" "$target" \
  "bash -s -- '$DEPLOY_PATH' '$release' '$SITE_URL'" < scripts/deploy/activate.sh
