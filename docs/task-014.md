# task-014 · Canvas-волна переливов на всех секциях и статичный слепок в карточках тарифов

**Исполнитель:** Frontend  
**Статус:** запланировано  
**Связь:** [task-001](task-001.md), [task-004](task-004.md), [task-013](task-013.md), [visual-assets-spec.md](frontend/visual-assets-spec.md)  
**Первый показ:** единая переливающаяся canvas-волна работает на всех секциях лендинга (`#home`, `#the-app`, `#why-luni`, `#support`, `#checkout`, `#account`), а в `.plan-card` отображается корректный статичный слепок этой же волны, развёрнутый слева направо.

## Выявленные проблемы

1. На дизайн-референсах `01-home.png` – `07-account.png` фоновый элемент с переливающейся волной присутствует на всех экранах, как в `#home`.
2. Сейчас у `.section-why-luni::before`, `.section-support::before`, `.account-page::before` (в `src/styles/pages/index.scss`) и у секции `#support` (`src/templates/partials/sections/support.hbs`) используется некорректный статический `background-image` вместо переливающегося canvas, как в hero (`src/modules/home-wave.js`, `src/modules/home-wave-renderer.js`).
3. В `.plan-card` (`src/templates/partials/plans/plan-card.hbs`) у `<img>` (`card-wave.webp` / `card-wave.png`) подключено неверное изображение: по дизайну (`05-plans.png`) в верхнем правом углу карточки должен быть **статичный слепок той же canvas-волны, развёрнутый слева направо** и обрезанный по скруглению карточки.

## Объём работ

- [ ] Обобщить `src/modules/home-wave.js` и `src/modules/home-wave-renderer.js` для инициализации нескольких canvas-экземпляров на странице (например, по единому data-атрибуту `[data-wave-canvas]` с параметрами позиции/масштаба/прозрачности под конкретную секцию).
- [ ] Подключить переливающийся canvas-слой на секциях `#home`, `#the-app`, `#why-luni`, `#support`, `#checkout`, `#account` и удалить некорректные статические `background-image` у `.section-why-luni::before`, `.section-support::before`, `.account-page::before` в `src/styles/pages/index.scss`.
- [ ] Добавить приостановку анимации для секций вне видимой области (`IntersectionObserver`) и статичный первый кадр при `prefers-reduced-motion: reduce`, чтобы несколько canvas не создавали лишней нагрузки.
- [ ] Подготовить корректный статичный ассет для `.plan-card` (`src/assets/illustrations/card-wave.webp` и `.png`): чистый статичный слепок canvas-волны, зеркально развёрнутый слева направо, без жёстких границ и постороннего фона.
- [ ] Проверить отображение волн на десктопе (`1440px`), планшете (`768px`) и мобильном (`375px`): текст и кнопки всегда лежат поверх декора, горизонтального скролла нет.

## Проверка результата

1. На `#why-luni`, `#support`, `#account` (и остальных секциях лендинга) нет битых/некорректных `background-image` в `::before`; вместо них работает единый переливающийся canvas, визуально согласованный с `#home`.
2. Анимация активна только для видимой секции; при `prefers-reduced-motion: reduce` рисуется статичный кадр.
3. В карточках `.plan-card` (`Trial`, `Basic`, `Plus`, `Complete`) отображается статичный слепок canvas-волны, развёрнутый слева направо, аккуратно обрезанный по радиусу карточки.
4. Production-сборка (`npm run build:prod`) и `npm run lint` проходят без ошибок.

## Материалы

- [task-013 · Canvas-анимация home-wave](task-013.md)
- [Спецификация графики](frontend/visual-assets-spec.md)
- [Референсы list-screens](images/concept/desktop/list-screens/)
- [Реестр задач](tasks.md)
