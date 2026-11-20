# Архитектура LuniVPN

Цель — один статический лендинг из семи секций по [требованиям](../requirements.md). Порядок: Home → The app → Why Luni → Support → Plans → Checkout → Account. PNG 01–07 из list-screens — визуальная основа.

## Слои и исполнение

Webpack собирает Handlebars-шаблон и контент в index.html, SCSS — в CSS, vanilla JS — в браузерные модули. Сайт обслуживается статическим хостингом. Общая шапка и якоря связывают секции без router и перезагрузки. Данные, шаблоны, стили, поведение и сервисы разделены.

Каталог из четырёх тарифов (`Trial` / `Basic` / `Plus` / `Complete`, см. [модель данных](data-model.md)) общий для Plans и Checkout. Выбор обновляет summary (название и цену) в документе и перемещает к `#checkout`. Checkout и Account используют синтетические demo-данные, без оплаты и авторизации. Реальное Account/Billing API остаётся будущей интеграцией.

## Wishlist

Посетитель → диалог сайта → Telegram-бот → Start → HTTPS webhook → PHP → JSON в постоянном volume → подтверждение ботом. UI не объявляет регистрацию после одного перехода. Backend независим от будущей оплаты. Фактическая готовность — в [backend/status](../backend/status.md), требования — в [task-012](../task-012.md).

## Текущее состояние

Проверенный webpack/pages.js ещё содержит шесть HTML. Их объединение, добавление Why Luni по 03 и проверки нового лендинга предстоят. Документация не является подтверждением миграции кода. VPN-клиент и инфраструктура VPN не входят в лендинг.

[Frontend](../frontend/architecture.md) · [ADR](adr/001-static-mpa.md) · [QA](../frontend/tasks/001-validation.md).
