# task-005 · Создать сборку и каркас MPA

## Актуальный объём: единый лендинг

Перевести существующий каркас с шести HTML на один index.html. Подключить семь секций, общий entry, якоря и актуальную проверку артефакта.

Основа: [requirements](requirements.md) и [task-001](task-001.md). Порядок: Home → The app → Why Luni → Support → Plans → Checkout → Account. Эта запись заменяет прежние требования об отдельных страницах и ожидании согласования количества экранов. Выполнение миграции и QA пока не подтверждены.

## Ранее зафиксированные детали и отчёты

Ниже сохранены детали прежней реализации. Упоминания MPA, отдельных HTML и старых зависимостей являются историческими; применять актуальный объём выше.


**Исполнитель:** Frontend  
**Статус:** в работе  
**Первый показ:** главная-заготовка, открытая через dev-сервер и из production-сборки.

## Объём работ

- [ ] Закрепить совместимые версии Node/npm и зависимостей; .nvmrc должен содержать точную версию X.Y.Z согласно существующему workflow.
- [ ] Настроить Webpack + Handlebars + SCSS + vanilla JS; команды start, build:dev, build:prod, build и lint. Вывод — build/dev и build/prod.
- [ ] Создать единый манифест pages.js с id/output/template/data/entry; рекурсивную регистрацию namespaced partials с обнаружением конфликтов; проверку обязательных metadata.
- [ ] Рендерить site + page data в layout, экранировать строки; стили подключать через entry ровно один раз. Настроить watch шаблонов, данных и стилей.
- [ ] Поддержать BASE_PATH и разрешённые публичные настройки; DATA_MODE по умолчанию demo, неподдерживаемый live не подменяется demo. Не экспортировать process.env целиком.
- [ ] Согласовать выход с имеющимися deploy.yml и verify-build.mjs; обновить фактическую инструкцию запуска, исключить build/node_modules/.env из Git.

**Планируемые файлы:** package.json, package-lock.json, .nvmrc, .gitignore, eslint.config.js, postcss.config.js, webpack/*, pages/index.hbs, src/entries/index.js, src/config/public.js, src/data/site.js, src/data/pages/index.js, src/templates/layouts/main.hbs.

## Рабочие допущения

**Зависимости:** Нет зависимостей от контента и backend. Состав экранов итерации уточняется в task-002; начать с index, остальные подключать по мере реализации.

На момент постановки исходники frontend и package.json отсутствуют. Эта карточка описывает недостающую реализацию, а не выполненную работу. Стек и разделение слоёв берём из обновлённой архитектуры. Этап C, реальная оплата, авторизация и VPN в задачу не входят.

## Проверка результата

1. На чистой установке проходят npm ci, lint, build:dev, build:prod и build; start отдаёт HTML, изменения шаблона видны без ручной пересборки.
2. Production index.html и его ресурсы доступны по HTTP в корне и под /preview/; относительные URL не теряют base path.
3. node scripts/ci/verify-build.mjs проходит на созданном артефакте; metadata валидируются, ошибочные данные завершают сборку ошибкой.
4. Документированы версии, порт, команды и необходимость перезапуска при изменении манифеста. Ни deploy, ни удалённая публикация не требуются для приёмки.

## Материалы

- [Архитектура frontend](frontend/architecture.md)
- [Структура проекта](architecture/project-structure.md)
- [Модель данных](architecture/data-model.md)
- [Разработка и команды](frontend/landing-development.md)
- [Визуальная спецификация](concept-specification.md)
- [Сборка и доставка](architecture/deployment.md)
- [Реестр и порядок выполнения](tasks.md)

## Отчёт исполнителя

Созданы package.json/package-lock.json, .nvmrc, конфигурация Webpack/ESLint/PostCSS, `pages/index.hbs`, `src/entries/index.js`, общие шаблоны, данные и SCSS. Node 24.21.0. На локальном Windows-окружении успешно выполнены `npm ci`, `npm run lint`, `npm run build:dev`, `npm run build:prod`, `npm run build`, `node scripts/ci/verify-build.mjs`. Отдельная сборка с `BASE_PATH=/preview/` подтвердила ссылки на ресурсы и index. HTTP-проверка всех шести маршрутов через dev-сервер (порт 8099) прошла; наблюдение live-reload пока не выполнено. Шесть HTML и хешированные CSS/JS/SVG собираются в `build/prod`. Checkout и Account — demo, визуальная приёмка не выполнена. Deploy не запускался.
