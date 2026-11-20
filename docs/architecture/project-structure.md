# Структура репозитория

## Изменение: один лендинг

Актуальное решение — [requirements](../requirements.md) и [frontend](../frontend/architecture.md): один index.html, секции home → the-app → why-luni → support → plans → checkout → account по PNG 01–07. Старые отдельные страницы/entries относятся к прежней реализации и подлежат объединению. Checkout/Account остаются demo внутри документа. Metadata, canonical и robots задаются всему HTML; отдельный noindex якорю невозможен. Выбор plan обновляет сводку в одном документе, прямая ссылка допустима как ?plan=monthly#checkout. Миграция и её проверки не подтверждены.

Ниже сохранены схемы и инфраструктурные детали; требования об отдельных HTML заменены решением выше.

Статус: фактическая структура проверена при подготовке документа; целевое дерево ниже — план создания исходников. Пустые каталоги специально не создаются.

## Фактически существует

```text
/
├── .git/                       служебные данные Git
├── .idea/                      локальные настройки IDE
├── README.md                   вход в проект
└── docs/
    ├── README.md               карта документации
    ├── requirements.md         требования и открытые решения
    ├── task-001.md             задача на шесть экранов
    ├── concept-specification.md
    ├── images/concept/
    │   ├── desktop/            7 PNG, включая логотип
    │   └── mobile/             11 PNG, включая парный вид
    ├── architecture/           общая архитектура и ADR
    ├── frontend/               UI, разработка, задачи и приёмка
    └── backend/                границы интеграций и API
```

Нет package.json, node_modules, исходников сайта, build и запущенного через этот проект сервиса. Файлы .idea не являются архитектурной конфигурацией приложения.

## Целевое дерево первой реализации

```text
/
├── README.md
├── package.json
├── package-lock.json
├── .gitignore
├── .env.example                только при появлении конфигурации окружения
├── eslint.config.js
├── postcss.config.js
├── .github/workflows/
│   └── ci.yml                  установка, lint, сборка, проверки
├── pages/
│   ├── index.hbs
│   ├── app.hbs
│   ├── support.hbs
│   ├── plans.hbs
│   ├── checkout.hbs
│   └── account.hbs
├── src/
│   ├── entries/                один entry на страницу
│   │   ├── index.js
│   │   ├── app.js
│   │   ├── support.js
│   │   ├── plans.js
│   │   ├── checkout.js
│   │   └── account.js
│   ├── config/
│   │   └── public.js           публичная конфигурация и base path
│   ├── data/
│   │   ├── site.js             бренд, навигация, общие подписи
│   │   ├── plans.js            единый каталог demo-планов
│   │   ├── pages/              данные шести страниц
│   │   └── fixtures/           явно синтетические account/checkout
│   ├── templates/
│   │   ├── layouts/main.hbs
│   │   └── partials/
│   │       ├── shared/         logo, header, navigation, button, field
│   │       ├── home/           hero, features
│   │       ├── app/            devices, app-features
│   │       ├── support/        search, categories
│   │       ├── plans/          plan-card, plan-details
│   │       ├── checkout/       selected-plan, summary, demo-payment
│   │       └── account/        nav, profile, subscription, billing
│   ├── styles/
│   │   ├── tokens/             цвета, размеры, слои, типографика
│   │   ├── base.scss           reset, база, глобальный фокус
│   │   ├── components/         общие компоненты
│   │   └── pages/              композиция шести страниц
│   ├── modules/
│   │   ├── navigation.js
│   │   ├── plan-selection.js
│   │   ├── checkout.js
│   │   ├── account.js
│   │   └── support.js
│   ├── services/
│   │   ├── index.js            явный выбор demo/live адаптера
│   │   ├── demo/               каталог, checkout, профиль
│   │   └── api/                только на этапе C
│   ├── utils/                  URL, форматирование, проверка значений
│   └── assets/
│       ├── brand/
│       ├── illustrations/
│       ├── icons/
│       └── fonts/
├── public/                     ресурсы с фиксированным именем, если нужны
├── webpack/
│   ├── pages.js                список страниц, entry, data, template
│   ├── webpack.common.js
│   ├── webpack.dev.js
│   └── webpack.prod.js
├── scripts/                    проверки ссылок, сборки, сценариев
├── tests/
│   ├── unit/                   planId, преобразования, состояния
│   └── e2e/                    переходы, адаптивность, доступность
├── build/
│   ├── dev/
│   └── prod/
└── docs/
```

Имена файлов проектные. Новые файлы создавать по необходимости; структура не требует пустых модулей или тестов каждого partial. Footer добавлять после определения его содержимого; наличие shared/ само по себе не расширяет дизайн.

## Владение и правила размещения

| Каталог | Что допустимо | Чего не должно быть |
|---|---|---|
| pages | Композиция экранов | Дублированная шапка и бизнес-логика |
| data | Контент, metadata, синтетические fixtures | Секреты и реальные пользовательские данные |
| templates | Семантическая разметка | Запросы API, inline-обработчики |
| modules | Поведение UI | Токены сервера и расчёт цены покупки |
| services | Источник данных и нормализация ответа | Прямые операции с DOM |
| styles | Токены, геометрия, адаптивность | Контент страниц |
| assets | Подготовленные ресурсы | Полные PNG-концепты вместо интерфейса |
| public | robots/favicon и подобное | Необработанные секретные конфиги |
| build | Только результат сборки | Ручные изменения |
| docs | Требования, решения, доказательства | Фиктивные успешные отчёты |

Регистр имён: lowercase-kebab-case; partial регистрируется с namespace, например shared/header. В отличие от регистрации только верхнего уровня в Nordel, сборщик должен рекурсивно регистрировать partials с относительным именем и обнаруживать конфликты.

В Git хранятся исходники, lock-файл, конфигурация без секретов и документация. node_modules, build, .env и временные результаты не коммитятся. Политику хранения крупных QA-снимков выбрать явно: краткий отчёт в Git, полные артефакты в CI либо согласованный каталог docs/frontend/qa. .idea не изменяется в рамках архитектурной задачи.

## Будущее расширение

Backend не добавляется пустой папкой для вида. Если будет выбран один репозиторий, будущий server/ содержит собственные зависимости, конфигурацию, миграции, тесты и pipeline. Если выбран отдельный сервис — здесь остаются API-контракт и браузерный адаптер. Для вишлиста уже запланированы tg-bot/, docker/ и compose.yaml по образцу Nordel; это отдельный контур от будущего server/ для Account/Billing.

## Дополнение: backend вишлиста

По запросу пользователя целевая структура дополняется:

```text
tg-bot/
  common.php
  webhook.php
  webhook-admin.php
  bot.php                     опциональный polling
  README.md
docker/
  bot.Dockerfile
  site.Dockerfile
  ngrok.yml
compose.yaml
.env.example
tests/backend/
```

Также добавить wishlist.js и shared/wishlist.hbs при выборе окна на сайте. Постоянные данные /data/wishlist.json находятся в отдельном volume, не в репозитории и не в frontend-релизе. Назначение каждого файла и требования переноса — [wishlist-requirements](../backend/wishlist-requirements.md).
