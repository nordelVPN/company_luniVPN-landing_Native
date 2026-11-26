# Документация LuniVPN

> **Единый стандарт экосистемы (приоритет):** все 4 лендинга экосистемы `VPN_commerce` имеют единое функциональное поведение и отличаются **только внешним видом (дизайном, палитрой, брендом)** и назначенной тарифной сеткой. См. [общую документацию VPN_commerce](../../docs/README.md).

## Профиль проекта по единому стандарту

- **Тарифная сетка:** **Сетка A** (общая с NordelVPN), основная валюта — **EUR (`€`)**:
  - `Trial` — 5 дней · `€0.50` · 10 устройств · Все возможности
  - `Basic` — 1 месяц · `€7` · 5 устройств · 3 сервера
  - `Plus` — 6 месяцев · `€25` · 5 устройств · Все серверы + расширение браузера
  - `Complete` — 12 месяцев · `€55` · 10 устройств · Все серверы + расширенные + блокировщик рекламы + менеджер паролей + облако данных
- **Целевые языки (единые для всех 4 сайтов, 12 языков):** `en` (по умолчанию), `pl`, `uk`, `lt`, `tr`, `ro`, `de`, `sk`, `hr`, `sr`, `bg`, `hu` (см. [единый контракт i18n](../../docs/architecture/i18n.md)). *(Прежнее ограничение «только EN» в ранних задачах заменено единым стандартом 12 языков.)*
- **Целевой состав страниц и функций (единый для всех 4 сайтов):** основной лендинг (`index.html` с 7 визуальными секциями по PNG 01–07 + Telegram-вишлист на PHP 8.4), а также целевые auth/account-страницы: регистрация (`create-account.html`), вход (`login.html`), восстановление пароля (`forgot-password.html`), личный кабинет (`account.html`). Подробнее — [единый состав страниц](../../docs/product/pages-and-flows.md).

---

## Визуальная структура лендинга

Основной лендинг — семь последовательных секций по PNG 01–07 из [list-screens](images/concept/desktop/list-screens/):

Home → The app → Why Luni → Support → Plans → Checkout → Account.

Навигация — якорями внутри `index.html`. Checkout и Account на этапе MVP работают как demo-секции. Wishlist включает интерфейс сайта и запись через Telegram (`tg-bot/` на PHP 8.4).

## Передача frontend

1. [task-001](task-001.md) — единый объём поставки.
2. [Требования](requirements.md) — сценарии, ограничения и границы.
3. [Спецификация](concept-specification.md) — последовательность макетов, палитра и графика.
4. [Графика и инфографика правых зон](frontend/visual-assets-spec.md) — ТЗ на замену `.device-art`/волн, кроп из референсов и промпты 2× Retina.
5. [Архитектура frontend](frontend/architecture.md), [компоненты](frontend/landing-components.md), [разработка](frontend/landing-development.md).
6. [FRONT-001](frontend/tasks/001-public-site.md), [матрица приёмки](frontend/tasks/001-validation.md) и [визуальный аудит vs list-screens](frontend/qa/visual-audit-list-screens.md).
7. [Wishlist](task-012.md), [backend status](backend/status.md), [WL-01–14](backend/wishlist-requirements.md).
8. [Реестр задач](tasks.md).

## Архитектура

[Обзор](architecture/overview.md) · [ADR-001](architecture/adr/001-static-mpa.md) · [Структура](architecture/project-structure.md) · [Данные](architecture/data-model.md) · [Доставка](architecture/deployment.md) · [Будущий API](backend/api-contracts.md).

## Фактическое состояние

Исходный `webpack/pages.js` пока собирает шесть HTML. Документация задаёт переход к единому лендингу + стандартным auth/account-страницам, подключение 12 языков и валюты `€`. Backend Telegram-вишлиста учитывается отдельно в его отчёте. Наличие требований не означает успешного теста или готовой интеграции.

Исторические детали/отчёты дочерних задач сохранены под соответствующим заголовком; актуальный объём указан в начале каждой карточки. [Правила проверки коммитов](commit-review.md) сохраняются.
