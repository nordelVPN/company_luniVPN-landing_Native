# Документация LuniVPN

Рабочий продукт — **один лендинг**, семь последовательных секций по PNG 01–07 из [list-screens](images/concept/desktop/list-screens/):

Home → The app → Why Luni → Support → Plans → Checkout → Account.

Навигация — якорями внутри index.html. Checkout и Account — demo-секции. Wishlist включает интерфейс сайта и запись через Telegram. Состав принят пользователем; дополнительного согласования количества страниц не требуется.

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

Исходный webpack/pages.js пока собирает шесть HTML. Документация задаёт переход к одному документу; миграция кода и визуальная приёмка нового лендинга ещё не подтверждены. Backend Telegram-вишлиста учитывается отдельно в его отчёте. Наличие требований не означает успешного теста или готовой интеграции.

Исторические детали/отчёты дочерних задач сохранены под соответствующим заголовком; актуальный объём указан в начале каждой карточки. [Правила проверки коммитов](commit-review.md) сохраняются. В этой итерации менялась документация; коммит и публикация не выполнялись.
