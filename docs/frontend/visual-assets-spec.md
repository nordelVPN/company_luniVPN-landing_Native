# Спецификация графики и инфографики правых зон лендинга

Документ задаёт требования к замене примитивных SVG-заглушек ([device-preview.svg](../../src/assets/illustrations/device-preview.svg), [hero-wave.svg](../../src/assets/illustrations/hero-wave.svg)) и оформлению правых визуальных областей секций единого лендинга по референсам [list-screens](../images/concept/desktop/list-screens/).

## Проблема текущей реализации

1. **`.device-art` в секции `#the-app`** ([the-app.hbs](../../src/templates/partials/sections/the-app.hbs)) использует [device-preview.svg](../../src/assets/illustrations/device-preview.svg) — 10 плоских векторных фигур без глубины, теней, стекла, металлических кромок и интерфейса на экранах.
2. **`.hero-art` в секции `#home`** ([home.hbs](../../src/templates/partials/sections/home.hbs)) и `.plan-art` в карточках тарифов используют упрощённый трёхслойный [hero-wave.svg](../../src/assets/illustrations/hero-wave.svg), который не передаёт полупрозрачные световые ленты концепта.
3. **Секции `#why-luni` и `#support`** ([why-luni.hbs](../../src/templates/partials/sections/why-luni.hbs), [support.hbs](../../src/templates/partials/sections/support.hbs)) свёрстаны одноколоночным `.section-intro` без правой визуальной колонки, хотя на [03-why-luni.png](../images/concept/desktop/list-screens/03-why-luni.png) и [04-support.png](../images/concept/desktop/list-screens/04-support.png) справа от текста расположена фирменная волна-лента.

---

## Инвентарь правых зон по референсам (`1670–1672 × 941 px`)

| Секция | Референс | Правая область (px) | Граница текста слева | Содержание правой зоны | Целевой файл ассета |
|---|---|---|---|---|---|
| `01 Home` | [01-home.png](../images/concept/desktop/list-screens/01-home.png) | `x: 780..1650`, `y: 94..580` | `x ≈ 770` | Крупная полупрозрачная многослойная лента-волна (шалфейно-оливковая с песочно-золотым свечением) | `src/assets/illustrations/home-wave.webp` (+ `.png`) |
| `02 The app` | [02-the-app.png](../images/concept/desktop/list-screens/02-the-app.png) | `x: 770..1650`, `y: 102..618` | `x ≈ 760` | **Композиция устройств (`.device-art`)**: ноутбук слева, крупный смартфон с экраном LuniVPN (знак + кольцо подключения + волны) на переднем плане, малый смартфон и планшет справа поверх полупрозрачных лент | `src/assets/illustrations/the-app-devices.webp` (+ `.png`) |
| `03 Why Luni` | [03-why-luni.png](../images/concept/desktop/list-screens/03-why-luni.png) | `x: 780..1650`, `y: 94..520` | `x ≈ 770` | Фирменная полупрозрачная лента-волна справа от вводного блока | `src/assets/illustrations/section-wave.webp` (или общий с Home) |
| `04 Support` | [04-support.png](../images/concept/desktop/list-screens/04-support.png) | `x: 820..1650`, `y: 94..580` | `x ≈ 820` | Крупная волна-лента справа от заголовка и поля поиска | `src/assets/illustrations/section-wave.webp` |
| `05 Plans` / `06 Checkout` | [05-plans.png](../images/concept/desktop/list-screens/05-plans.png) | правый верхний угол карточек | — | Мягкий угловой фрагмент ленты, обрезанный по `border-radius` карточки | `src/assets/illustrations/card-wave.webp` |

Фоновый цвет полотна на референсах: `#FAF0E5` / `#FBEFE4` (совпадает с токеном `$cream` на сайте).

---

## Способы получения ассетов

### Способ A · Извлечение из референсов (быстрый рабочий вариант)

Подходит для быстрого перехода от примитивных SVG к виду концепта без внешних зависимостей:

1. **Для `.device-art`:** вырезать область `x: 770..1660, y: 95..625` (`890 × 530 px`) из [02-the-app.png](../images/concept/desktop/list-screens/02-the-app.png).
2. **Для `.hero-art` и волн секций:** вырезать область `x: 780..1660, y: 90..585` (`880 × 495 px`) из [01-home.png](../images/concept/desktop/list-screens/01-home.png).
3. **Обработка краёв:** перевести фон `#FBEFE4` в альфа-канал (color-to-alpha с мягким порогом) либо применить плавный прозрачный градиент (feather `32–48 px`) по левому, верхнему и нижнему краю, чтобы при наложении на `#FAF0E5` не было видимой прямоугольной границы.
4. **Ограничение:** разрешение кропа `~890 × 530 px` достаточно для 1× десктопа, но на 2× Retina (экраны от 1440 px) будет мягче нативного 2× рендера.

### Способ B · Гибрид на базе мобильных референсов (высокая чёткость)

В [docs/images/concept/mobile](../images/concept/mobile/) есть детальные рендеры приложения (`1024 × 1536 px`):
- [main_page_state_ready_to_connect_mobile.png](../images/concept/mobile/main_page_state_ready_to_connect_mobile.png) — экран с кольцом `Ready to connect`;
- [main_page_state_connected_mobile.png](../images/concept/mobile/main_page_state_connected_mobile.png) — состояние `Connected`;
- [location_page_state_list_languages_mobile.png](../images/concept/mobile/location_page_state_list_languages_mobile.png) — список стран;
- [mobile.png](../images/concept/mobile/mobile.png) (`1536 × 1024 px`) — парная композиция.

Эти экраны можно использовать как чёткий 2× контент внутри композиции устройств в секции `#the-app` поверх фирменной волны.

### Способ C · Генерация / 3D-рендер в 2× Retina (рекомендуемый финал)

Целевые параметры для генерации или дизайнера:
- **Формат:** PNG с прозрачным фоном (или сплошным `#FAF0E5` для последующего вырезания) + экспорт в WebP (качество `82–88`, вес до `150–180 KB`).
- **Размер:** минимум `1800 × 1100 px` для `the-app-devices` и `1800 × 1200 px` для `home-wave`.
- **Палитра (строго по концепту):** фон `#FAF0E5`, хвойный `#143622`, оливковый `#6A7849`, листовой `#7D8F59`, шалфейный `#98A472`, серо-зелёный `#B0B690`, песочно-золотой `#E5D29B` / `#F2E2B5`.

#### Промпт 1 · Композиция устройств для `#the-app` (`the-app-devices`)

> Clean editorial product photography and 3D device mockup composition for a calm minimalist VPN brand, isolated on a flat uniform warm cream background (#FAF0E5). Arrangement from left to right: a sleek open silver-and-dark-bezel laptop angled slightly inward on the left, a prominent modern flagship smartphone standing in the center foreground, a smaller compact phone and a slim tablet resting to the right. Every screen displays serene flowing translucent sage-green, olive (#7D8F59, #98A472) and warm sand-gold (#E5D29B) silk-like abstract wave ribbons on a warm cream (#FAF0E5) interface; the center flagship phone also shows a minimalist dark forest-green (#143622) botanical twin-leaf logo at the top and a luminous translucent green circular connection ring in the middle. Soft translucent sage and golden silk ribbons flow organically behind and around the devices. Soft natural studio lighting, subtle realistic glass reflections and delicate contact shadows, calm luxury editorial aesthetic, no extra text, no watermarks, high detail 2x retina, wide 16:10 composition with generous breathing room on all sides.

#### Промпт 2 · Полупрозрачная волна-лента для `#home`, `#why-luni`, `#support` (`home-wave`)

> Minimalist organic abstract translucent silk ribbon wave flowing diagonally from bottom-left to top-right on a flat uniform warm cream background (#FAF0E5). Layered overlapping semi-transparent leaf-like ribbons in sage green (#98A472), olive (#7D8F59), muted grey-green (#B0B690), and luminous warm sand-gold (#E5D29B, #F2E2B5) highlights. Soft diffused studio light, silky smooth gradients, delicate overlapping folds, airy editorial luxury aesthetic, zero text, zero icons, no hard edges on the left or bottom so it blends seamlessly into #FAF0E5, ultra clean high resolution 16:10.

#### Промпт 3 · Угловой декор для карточек `#plans` (`card-wave`)

> Subtle minimalist corner accent of translucent sage green (#98A472) and warm gold (#E5D29B) silk ribbon waves emerging softly from the top-right corner on a pure warm cream background (#FAF0E5), delicate low-contrast transparency, smooth airy folds, editorial aesthetic, no text, seamless fade into #FAF0E5.

---

## Требования к интеграции на frontend

1. **Разметка:**
   - В `#the-app` заменить фоновый `div.device-art` на `<picture>` с `<source type="image/webp">` и `<img>` (с явными `width`, `height`, `loading="lazy"`, `decoding="async"` и содержательным `alt`, например: `"LuniVPN app preview across laptop, smartphone and tablet"`).
   - Для декоративных волн (`#home`, `#why-luni`, `#support`, карточки `#plans`) использовать `aria-hidden="true"` и `alt=""`; в `#home` (первый экран) не ставить `loading="lazy"`.
2. **Сетка секций `#why-luni` и `#support`:**
   - Привести вводную часть `#why-luni` и `#support` к двухколоночной сетке (текст слева, `RibbonArt` справа) по аналогии с `.hero`, чтобы правая область не пустовала на десктопе.
3. **Адаптив (`max-width: 820px`):**
   - Текст и кнопки идут первыми, иллюстрация устройств — ниже по центру (`width: 100%; height: auto; max-width: 560px`).
   - Декоративные волны на узком экране приглушаются или сдвигаются в фон без создания горизонтального скролла.
4. **Проверка качества:**
   - Отсутствие видимых стыков/рамок между изображением и фоном `#FAF0E5`.
   - Отсутствие артефактов обрезки текста с исходного референса (при использовании способа A).
   - Вес каждого WebP-ассета в пределах `180 KB`, отсутствие деградации LCP на `#home`.


## Анимация Home

[task-013](../task-013.md) задаёт отдельную frontend-поставку: переливающаяся home-wave на canvas, выбор Canvas 2D/WebGL/Three.js по прототипу, бюджет кадра и остановка вне viewport. Существующие home-wave.webp/png сохраняются как визуальная основа и статический fallback. На момент постановки волна уже подключена через `.section-home::before` в src/styles/pages/index.scss; сведения о SVG-заглушке выше описывают исходную проблему. Остальные волны в этой поставке остаются статическими.
