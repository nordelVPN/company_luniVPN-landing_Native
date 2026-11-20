# task-017 · Увеличить типографическую шкалу и убрать технические заглушечные фразы

**Исполнитель:** Frontend  
**Статус:** запланировано  
**Связь:** [task-001](task-001.md), [task-006](task-006.md), [task-007](task-007.md), [concept-specification.md](concept-specification.md)  
**Первый показ:** увеличенные, уверенные размеры шрифтов по пропорциям макетов `01-home.png` – `07-account.png` и чистый публичный текст без служебных оговорок вроде `"Currency and billing details will be confirmed before launch."`.

## Выявленные проблемы

1. **Шрифты выглядят слишком мелкими:** заголовки (`h1`, `.section-display-title`), подзаголовки (`.hero-kicker`, `.section-lead`), описания (`.hero-description`) и тексты карточек уступают по масштабу референсам (по [concept-specification.md](concept-specification.md) двухстрочный заголовок hero занимает около 19% высоты кадра).
2. **Лишние технические фразы в публичном интерфейсе:** в `src/data/pages/index.js` (строка 117, `plansSection.footnote`) выводится `"Currency and billing details will be confirmed before launch."`, и аналогичные канцелярские оговорки засоряют публичные секции лендинга.

## Объём работ

- [ ] Увеличить типографическую шкалу в `src/styles/tokens/_typography.scss`, `src/styles/base/` и `src/styles/pages/index.scss` с визуальной сверкой по `01-home.png` – `07-account.png`:
  - `h1` и `.section-display-title` — крупнее, с плотным антиквенным интерлиньяжем;
  - `.hero-kicker`, `.hero-description`, `.section-lead` — повысить размер и читаемость;
  - заголовки и тексты карточек `.feature`, `.plan-card`, `.luni-way-copy`, пункты навигации и кнопки — привести к гармоничной пропорции.
- [ ] Проверить адаптивное масштабирование (`clamp(...)`) на `1440px`, `768px` и `375px`, чтобы крупные заголовки не вызывали горизонтальный скролл и не ломали переносы.
- [ ] Удалить `plansSection.footnote` (`"Currency and billing details will be confirmed before launch."`) из `src/data/pages/index.js` и шаблона секции `#plans`.
- [ ] Провести ревизию остальных публичных текстов в `src/data/pages/index.js`, `src/data/plans.js` и шаблонах секций (`home.hbs`, `the-app.hbs`, `why-luni.hbs`, `support.hbs`, `plans.hbs`): убрать лишние служебные оговорки «будет подтверждено перед запуском / скоро появится», сохранив естественные тексты по дизайну (при этом demo-ограничения в `#checkout` и `#account` остаются честными и не имитируют реальную оплату).

## Проверка результата

1. Визуальные пропорции заголовков и основного текста на `1440px` соответствуют эталонам `01-home.png` – `07-account.png`; на `375px` и `768px` нет переполнений и сломанных переносов.
2. Фраза `"Currency and billing details will be confirmed before launch."` и аналогичные служебные заглушки полностью удалены из публичных секций и итоговой сборки.
3. Сборка (`npm run build:prod`) и `npm run lint` проходят без ошибок.

## Материалы

- [Визуальная спецификация](concept-specification.md)
- [Референсы list-screens](images/concept/desktop/list-screens/)
- [Реестр задач](tasks.md)
