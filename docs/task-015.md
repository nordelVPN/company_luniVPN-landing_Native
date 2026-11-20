# task-015 · Очистить `the-app-devices` и починить пустой `src` в `.luni-way-visual`

**Исполнитель:** Frontend  
**Статус:** запланировано  
**Связь:** [task-004](task-004.md), [task-008](task-008.md), [visual-assets-spec.md](frontend/visual-assets-spec.md)  
**Первый показ:** в `#the-app` отображается чистая композиция устройств без лишней буквы и фонового прямоугольника; в `.luni-way-visual` секции `#why-luni` корректно загружается изображение.

## Выявленные проблемы

1. В ассете `src/assets/illustrations/the-app-devices.png` / `.webp` (в сборке `the-app-devices.a604df42.png`) остались **лишняя буква** (фрагмент заголовка с исходного скриншота `02-the-app.png`) и **видимый фон**, из-за чего картинка конфликтует с фоном и волной секции `#the-app`.
2. В `src/templates/partials/sections/why-luni.hbs` внутри `.luni-way-visual` у `<img src="{{assets.luniWayLeafPng}}">` (и `<source srcset="{{assets.luniWayLeafWebp}}">`) в итоговом HTML **отсутствует `src`** — переменные `assets.luniWayLeafPng` и `assets.luniWayLeafWebp` не проброшены в контекст шаблона, хотя файлы `src/assets/illustrations/luni-way-leaf.png` и `.webp` присутствуют в репозитории.

## Объём работ

- [ ] Переработать `src/assets/illustrations/the-app-devices.png` и `.webp`:
  - полностью удалить лишнюю букву слева;
  - убрать непрозрачный фоновый прямоугольник (перевести фон в чистый альфа-канал с аккуратными краями и мягкими тенями устройств), чтобы композиция органично ложилась поверх секции `#the-app` и её canvas-волны.
- [ ] Подключить `luniWayLeafPng` и `luniWayLeafWebp` в контекст сборки/шаблона (там же, где пробрасываются `theAppDevicesPng` / `cardWavePng`) и проверить, что в `why-luni.hbs` формируются валидные пути `src` и `srcset`.
- [ ] Проверить сам ассет `luni-way-leaf.png` / `.webp` на отсутствие лишнего фона и артефактов обрезки.
- [ ] Пересобрать проект (`npm run build:dev` и `npm run build:prod`) и убедиться в отсутствии битых картинок (`naturalWidth > 0`) на всех секциях.

## Проверка результата

1. В `#the-app` на `the-app-devices` нет обрывков букв и заметной фоновой рамки на `#FAF0E5` и поверх canvas-волны.
2. В `.luni-way-visual` у `<img>` и `<source>` присутствуют валидные непустые `src`/`srcset`, картинка загружается с `naturalWidth > 0` и без ошибок 404 в консоли.
3. Вес оптимизированных WebP-файлов в пределах бюджета (до 180 KB для `the-app-devices.webp`).

## Материалы

- [Спецификация графики](frontend/visual-assets-spec.md)
- [Референсы 02-the-app.png и 03-why-luni.png](images/concept/desktop/list-screens/)
- [Реестр задач](tasks.md)
