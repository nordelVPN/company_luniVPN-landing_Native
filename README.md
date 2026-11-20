# LuniVPN site

Статический многостраничный frontend на Webpack, Handlebars, SCSS и vanilla JS. Реализованы шесть маршрутов: `index.html`, `app.html`, `support.html`, `plans.html`, `checkout.html`, `account.html`. Checkout и Account — только demo: оплата, аккаунт и VPN-соединение не работают. Визуальные SVG пока служат самостоятельными временными иллюстрациями; окончательная графика и шрифты ожидают task-004.

## Запуск

Node 24.21.0 (`.nvmrc`).

```sh
npm ci
npm run start
```

По умолчанию dev-сервер слушает `127.0.0.1:8080`. При занятом порте задайте `PORT` (например, `8099`). Production: `npm run build:prod`, артефакт — `build/prod`. Проверки: `npm run lint` и `node scripts/ci/verify-build.mjs` после сборки.

Для размещения в подкаталоге задайте `BASE_PATH=/preview/` при сборке. `DATA_MODE=demo` используется по умолчанию; `live` пока не поддерживается и вызывает ошибку. `PUBLIC_SITE_URL` задаётся только для известного HTTPS origin. Манифест страниц — `webpack/pages.js`; после его изменения перезапустите dev-сервер.

- [Документация](docs/README.md)
- [Архитектура frontend](docs/frontend/architecture.md)
- [Задачи](docs/tasks.md)

## Backend вишлиста

Локальный Telegram-вишлист реализован на PHP по образцу Nordel. Конфигурация — `compose.yaml` и `.env.example`; запуск и регистрация webhook — [docs/backend/docker-compose.md](docs/backend/docker-compose.md), фактическое поведение и проверки — [docs/backend/status.md](docs/backend/status.md). Для сквозного запуска нужны собственные токены Telegram/ngrok и URL бота.
