# Локальный запуск Telegram-вишлиста

Рабочая конфигурация — [compose.yaml](../../compose.yaml): статический сайт (`site`), PHP webhook (`bot`), локальный HTTPS-туннель (`ngrok`) и именованный volume `luni-vpn_wishlist`. Project name — `luni-vpn`. Нужны Docker Desktop с Linux containers и Compose v2.

## Переменные и старт

Скопировать `.env.example` в `.env` и заполнить своими значениями. Не переносить Nordel `.env` или volume. `.env` исключён из Git и Docker build context. `TELEGRAM_BOT_TOKEN` — токен собственного бота; `TELEGRAM_WEBHOOK_SECRET` — 1–256 символов `A-Z a-z 0-9 _ -`; `NGROK_AUTHTOKEN` — токен ngrok. `WISHLIST_FILE=/data/wishlist.json` задаётся Compose. Порты `SITE_PORT`, `BOT_PORT`, `NGROK_PORT` по умолчанию 3000, 8080, 4040, доступны только на 127.0.0.1; при одновременном Nordel выбрать другие.

```powershell
Copy-Item .env.example .env
docker compose --env-file .env config --quiet
docker compose up -d --build
docker compose ps
docker compose logs --tail 50 bot ngrok
```

Сайт: `http://localhost:3000`; health бота: `http://localhost:8080/health`; панель ngrok: `http://localhost:4040` (с учётом портов). Панель держать локально, поскольку она показывает входящие запросы. Только backend: `docker compose up -d --build bot ngrok`. Health проверяет конфигурацию процесса, но не Telegram и запись.

## Webhook

В панели ngrok взять назначенный HTTPS origin, проверить `https://<origin>/health`, затем:

```powershell
docker compose exec bot php webhook-admin.php set https://your-domain.ngrok-free.app
docker compose exec bot php webhook-admin.php info
```

`set` принимает HTTPS origin без пути, добавляет `/webhook`, передаёт секрет, `allowed_updates=["message"]` и `max_connections=1`. Регистрация явная; при смене URL или секрета повторить `set`. Использовать отдельного тестового бота: регистрация меняет доставку его обновлений. `info` не выводит секрет.

Остановка: `docker compose down` сохраняет volume и webhook Telegram. `down -v` удаляет данные. Для polling сначала `docker compose exec bot php webhook-admin.php delete`, затем остановить webhook-процесс и запустить единственный `php bot.php` с тем же хранилищем и токеном. Одновременно webhook и polling не запускать.

## Backup и восстановление

Для согласованного backup остановить writer: `docker compose stop bot`. Скопировать `/data/wishlist.json` из volume в защищённый каталог с помощью `docker cp` из остановленного контейнера или временного контейнера, проверить JSON и уникальность `telegramId`, затем `docker compose start bot`. Не помещать копию в Git или web root; она содержит персональные данные.

Перед рабочим восстановлением проверить копию в отдельном тестовом volume: JSON-массив, уникальные ID, права UID 1000 и чтение PHP. На рабочем окружении остановить bot, сохранить аварийную копию текущего JSON, заменить файл в volume, проверить и запустить bot. При живом writer нужно соблюдать файловый lock; остановка bot устраняет конкурирующую запись. Процедура на реальном volume пока не проверена.

## Production

Локальные `php -S` и ngrok не подходят для production. Нужны PHP-FPM с Nginx либо другой production HTTP-server, стабильный HTTPS origin, публичный только `/webhook` и при необходимости `/health`, отдельный деплой backend, постоянное хранилище вне frontend release directories, мониторинг, backup и политика персональных данных. `common.php`, CLI, `/data`, токены и копии не публиковать. JSON-хранилище не масштабируется горизонтально. Rollback кода не откатывает данные.
