# task-016 · Привести логотип и `.feature-icon` в точное соответствие с дизайном

**Исполнитель:** Frontend / Дизайнер  
**Статус:** запланировано  
**Связь:** [task-004](task-004.md), [concept-specification.md](concept-specification.md)  
**Первый показ:** обновлённый логотип LuniVPN в шапке и футере точно повторяет `logo-concept-new.png`, а все `.feature-icon` в `#home`, `#the-app` и `#support` заменены на крупные, выразительные цветные иконки из дизайна.

## Выявленные проблемы

1. **Логотип не соответствует дизайну:** текущие `src/assets/brand/luni-mark.svg` и `src/templates/partials/shared/logo.hbs` расходятся по силуэту, пропорциям и цветовой проработке с эталоном [logo-concept-new.png](images/concept/desktop/logo-concept-new.png).
2. **Иконки `.feature-icon` слишком мелкие и простые:** текущие контурные иконки в `src/templates/partials/shared/icon.hbs` не соответствуют крупным цветным мягко затенённым иконкам с дизайн-референсов `01-home.png`, `02-the-app.png` и `04-support.png`.

## Объём работ

- [ ] Обновить логотип (`src/assets/brand/luni-mark.svg`, `src/templates/partials/shared/logo.hbs` и стили `.brand` / `.brand-mark`) строго по [logo-concept-new.png](images/concept/desktop/logo-concept-new.png):
  - два заострённых листа, поднимающихся слева направо, соединённых светлой диагональной перемычкой;
  - точные пропорции, просветы и палитра (`#143622`, `#7D8F59`, `#98A472`, `#F2E2B5`);
  - контрастное сочетание `Luni` (антиква) + `VPN` (прямой гротеск), согласованное по высоте со знаком.
- [ ] Выделить из дизайн-референсов (или детально отрисовать в SVG/PNG 2× с сохранением мягких градиентов и объёма) все иконки `.feature-icon`:
  - **`01-home.png` (`#home`):** лист (*Freedom to explore*), щит с замком (*Privacy by design*), молния (*Simple and seamless*);
  - **`02-the-app.png` (`#the-app`):** лист (*Ease, by design*), метка локации (*Locations that fit you*), группа устройств (*Across your devices*);
  - **`04-support.png` (`#support`):** play (*Getting started*), Wi-Fi (*Connection*), карта (*Account and billing*), гарнитура (*Contact support*).
- [ ] Увеличить размер `.feature-icon` (ориентир по референсам — крупные выразительные символы `56–68px`, заметно крупнее текущих) и выровнять отступы до заголовков карточек в `src/styles/pages/index.scss`.
- [ ] Проверить чёткость логотипа и иконок на 1× и 2× Retina, на десктопе и мобильном.

## Проверка результата

1. Логотип в шапке (и везде, где используется `.brand`) визуально совпадает с `logo-concept-new.png`.
2. Все 10 `.feature-icon` в `#home`, `#the-app` и `#support` соответствуют дизайну по форме, цвету, объёму и увеличенному масштабу.
3. Нет размытия, обрезанных краёв и сдвига вертикального ритма карточек на 375/768/1440 px.

## Материалы

- [Эталон логотипа](images/concept/desktop/logo-concept-new.png)
- [Референсы 01-home.png, 02-the-app.png, 04-support.png](images/concept/desktop/list-screens/)
- [Визуальная спецификация](concept-specification.md)
- [Реестр задач](tasks.md)
