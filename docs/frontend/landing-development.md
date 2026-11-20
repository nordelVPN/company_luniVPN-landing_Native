# Разработка LuniVPN

## Цель и текущее состояние

Целевой артефакт — один index.html с семью секциями 01–07 по [архитектуре](architecture.md). Текущий webpack/pages.js содержит index/app/support/plans/checkout/account: это прежняя сборка, её предстоит объединить. Новая приёмка не запускалась.

Webpack, Handlebars, SCSS и vanilla JS сохраняются. Не добавлять отдельные страницы или SPA-router для секций.

## Миграция

1. Сохранить одну запись index в манифесте.
2. Собрать Home, The app, Why Luni, Support, Plans, Checkout, Account в pages/index.hbs; повторяющиеся части вынести в partials.
3. Подключить стили/модули секций из общего entry; сохранить разделение data/templates/styles/modules/assets.
4. Обновить ссылки на якоря, выбор тарифа и сводку в одном DOM. Не перезагружать документ при Choose plan.
5. Подключить WishlistDialog и публичную ссылку собственного бота.
6. Обновить build verification и тесты: один HTML, семь секций, локальные ресурсы, прямые hash/query, адаптивность.

## Команды проекта

`npm ci`, `npm run start`, `npm run build:dev`, `npm run build:prod`, `npm run lint`, `node scripts/ci/verify-build.mjs`. Это перечень команд, а не отчёт об их выполнении. Версия Node берётся из .nvmrc, зависимости — из lock-файла.

Сборочный конфиг и существующие тесты нужно проверить после миграции: прежняя проверка шести страниц не подтверждает один лендинг. BASE_PATH учитывать для ресурсов и query/hash-ссылок.

Один lang/title/description/pageId для документа. Robots относится ко всему HTML, а не отдельно к #checkout/#account. Demo не заменяет недоступный live API фиктивным успехом.

[Задача](../task-001.md) · [План приёмки](tasks/001-validation.md).
