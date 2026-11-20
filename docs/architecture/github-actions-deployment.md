# GitHub Actions → SSH / Nginx

Статус: pipeline подготовлен заранее по выбору пользователя. Исходников frontend и доступа к серверу пока нет; реальное развертывание не выполнено. D09 определён частично: собственный Linux-сервер, SSH и Nginx. Домен и параметры сервера задаются при подключении.

## Файлы и поведение

- `.github/workflows/deploy.yml`: PR — сборка; push в `main` или ручной запуск из `main` — сборка и deploy.
- `scripts/ci/verify-build.mjs`: обязательный index.html, запрет симлинков, docs/fixtures/node_modules/.git, .env, source maps и файлов ключей внутри сборки. Это проверка упаковки, не полноценный сканер секретов.
- `scripts/deploy/upload.sh`: проверенные known_hosts, временный SSH-ключ, передача только архива сборки.
- `scripts/deploy/activate.sh`: отдельный каталог релиза, блокировка flock, атомарная замена симлинка current, проверка release ID и главной через HTTPS. При обычной ошибке проверки — возврат предыдущего current. При первом неуспешном релизе current удаляется. Принудительное завершение процесса/сбой сервера требуют ручной проверки.

Build job не получает SSH-секретов. Deploy job использует environment production. Публикации сериализованы без отмены уже выполняющегося деплоя. Старые релизы сохраняются; очистка диска выполняется администратором после проверки current и необходимых точек отката. GitHub-артефакт хранится 14 дней. Порядок ожидающих запусков GitHub не гарантирует: не перезапускайте старые runs без намерения развернуть старую версию.

## Контракт будущего frontend

В корне нужны `package.json`, `package-lock.json`, `.nvmrc` с точной совместимой версией Node в формате X.Y.Z. Pipeline выполняет `npm ci`, `npm run lint`, `npm run build:prod`. Отсутствие исходников или любой из этих команд блокирует публикацию, а не даёт фиктивный успешный deploy.

Production-сборка должна создавать `build/prod/index.html` и необходимые страницы/ресурсы. Публикуется только содержимое build/prod. Размещение предусмотрено в корне домена: BASE_PATH=/, APP_ENV=production. Demo/live-режим должен быть явно определён frontend до первого релиза. Проверки согласованных маршрутов, ресурсов, browser QA и требований продукта добавляются при реализации сайта; текущий pipeline не подтверждает их прохождение.

Ветка по умолчанию в шаблоне — main. Если используется другая, измените и push.branches, и условие jobs.deploy.if.

## GitHub Environment production

Создайте environment `production` в настройках репозитория и ограничьте deployment branch веткой main.

| Тип | Имя | Значение |
|---|---|---|
| Variable | SSH_HOST | DNS-имя или IPv4 сервера, без протокола |
| Variable | SSH_PORT | Порт SSH; по умолчанию 22 |
| Variable | SSH_USER | Отдельный непривилегированный пользователь, например deploy |
| Variable | DEPLOY_PATH | Абсолютный путь без пробелов, например /srv/lunivpn |
| Variable | SITE_URL | HTTPS origin без подкаталога, например https://vpn.example.com |
| Secret | SSH_PRIVATE_KEY | Полный приватный ключ выделенного deployment-пользователя без passphrase |
| Secret | SSH_KNOWN_HOSTS | Проверенная запись known_hosts сервера; для нестандартного порта — [host]:port |

Ключи не помещаются в репозиторий. Публичную часть ключа добавьте в authorized_keys deployment-пользователя. Fingerprint сервера сверяйте через доверенный канал администратора; pipeline не принимает ключ сервера через слепой ssh-keyscan.

## Подготовка сервера

Нужны Linux, Bash, OpenSSH/SFTP, tar, curl, coreutils, flock (util-linux), Nginx и настроенный HTTPS-сертификат. Порты SSH и HTTPS должны быть доступны; сервер должен обращаться к своему SITE_URL через HTTPS. Deployment-пользователю не требуется sudo. Создайте каталог, например:

```sh
sudo install -d -o deploy -g deploy -m 755 /srv/lunivpn
```

Nginx должен иметь право прохода до current и чтения файлов релиза. В существующем HTTPS server-блоке настройте (домен, сертификаты и путь заменяет администратор):

```nginx
root /srv/lunivpn/current;
index index.html;

location / {
    try_files $uri $uri/ =404;
    add_header Cache-Control "no-cache" always;
}

location = /deploy-version.txt {
    add_header Cache-Control "no-store" always;
}
```

Нет SPA fallback. Эти location не должны конфликтовать с имеющимися правилами. Если используется CDN, исключите deploy-version.txt из кеширования. После настройки выполните `sudo nginx -t`, затем reload. Сам pipeline не редактирует конфигурацию Nginx и не управляет сертификатами.

До первого успешного deploy current отсутствует и сайт ещё не доступен. После появления frontend выполните ручной запуск workflow из main, проверьте журнал и реальные страницы сайта. Домен должен указывать на этот сервер; редирект SITE_URL на другой origin не поддерживается health-check.

## Ручной откат

Выберите существующий проверенный каталог releases/<release-id>. На сервере от имени deployment-пользователя выполните, заменив путь и ID:

```sh
(
  set -eu
  root=/srv/lunivpn
  release=REPLACE_WITH_RELEASE_ID
  exec 9>"$root/.deploy.lock"
  flock -w 120 9
  test -s "$root/releases/$release/index.html"
  ln -s "$root/releases/$release" "$root/.manual-rollback-$$"
  mv -Tf "$root/.manual-rollback-$$" "$root/current"
)
```

Проверьте /deploy-version.txt, главную и остальные маршруты через публичный HTTPS URL. Не удаляйте активный или предыдущий рабочий релиз. Для первого неуспешного развертывания предыдущей версии нет.

## Выполненная проверка и ограничения

Локально: Bash syntax check обоих скриптов, Node syntax check, разбор YAML; проверка валидатора на временных данных: отсутствующая сборка, корректный HTML, .env, ключ, source map и каталог docs. Все перечисленные проверки прошли. Проверка GitHub Actions, реального SSH/Nginx, HTTPS и отката на сервере пока не выполнена. Локальный разбор YAML не заменяет проверку workflow самим GitHub.

Используются официальные actions: [checkout](https://github.com/actions/checkout), [setup-node](https://github.com/actions/setup-node), [upload-artifact](https://github.com/actions/upload-artifact), [download-artifact](https://github.com/actions/download-artifact). Версии major указаны в workflow; при принятой в проекте политике immutable dependencies закрепите их на проверенные commit SHA.
