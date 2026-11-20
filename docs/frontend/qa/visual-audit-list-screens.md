# Глубокий визуальный и контентный аудит сайта vs `list-screens` (01–07)

**Дата проверки:** 2026-11-20  
**Проверяемая сборка:** локальный `build/prod/index.html` и `build/prod/account.html` (после миграции на 4 тарифа)  
**Эталоны:**
- `docs/images/concept/desktop/list-screens/01-home.png` .. `07-account.png` (7 листов `1670–1672 × 941 px`)
- `docs/requirements.md` (актуальная сетка из 4 тарифов `Trial / Basic / Plus / Complete`)
- `docs/concept-specification.md` (палитра, типографика, композиция)

**Методика проверки:**
1. Извлечение всех текстовых строк и их координат (`[x, y, w×h]`) из каждого PNG `01–07` (`en-US` OCR по оригинальным листам).
2. Инструментальные замеры реального рендера `build/prod/index.html` и `build/prod/account.html` в headless Chrome на вьюпортах `1670×941`, `1440×900`, `768×1024`, `375×812` (computed-шрифты, геометрия секций, `.hero`, `.features`, `canvas.home-wave-canvas`, `.plans-grid`, высоты карточек, горизонтальный скролл).
3. Построчная сверка шаблонов (`pages/`, `src/templates/`), данных (`src/data/`) и стилей (`src/styles/`).

---

## 1. Сводка критических расхождений

| ID | Приоритет | Область | Суть расхождения | Файлы |
|---|---|---|---|---|
| **VA-01** | **P0** | `#home` (`01-home.png`) | `.features` вложен в `<section id="home">`, из-за чего `canvas.home-wave-canvas` растянут на всю секцию (`822px` на desktop, `1111px` на 375px), вместо того чтобы покрывать только контейнер hero; отсутствует центральный вводный блок перед 3 колонками (`A VPN for a more private, open internet.`) | `src/templates/partials/sections/home.hbs`, `src/styles/pages/index.scss` |
| **VA-02** | **P0** | Типографика (все экраны) | Используются системные `Georgia, serif` и `Arial, sans-serif` без подключения фирменных веб-шрифтов; кнопки CTA набраны `700 15px Arial` вместо антиквы | `src/styles/base.scss`, `src/styles/components/_buttons.scss`, `src/styles/components/_header.scss` |
| **VA-03** | **P0** | `#why-luni` (`03-why-luni.png`) | Тексты, заголовки, eyebrow, CTA и все 3 колонки не соответствуют `03-why-luni.png`; полностью отсутствует нижний блок `THE LUNI WAY — A more thoughtful way to be online.` | `src/data/pages/index.js`, `src/templates/partials/sections/why-luni.hbs` |
| **VA-04** | **P0** | Тексты `01`, `02`, `04`, `05`, `07` | Тексты hero, подзаголовков, кнопок (`Discover Luni / See how it works` вместо `Get Luni / Learn more`) и карточек преимуществ/поддержки расходятся с актуальными `list-screens` | `src/data/pages/index.js`, `src/data/pages/account.js` |
| **VA-05** | **P1** | `#plans` (`05-plans.png` + `requirements.md`) | Новые 4 тарифа внедрены в код, но `05-plans.png` всё ещё показывает старые 2 тарифа без цен; в карточках нет коротких описаний, иконок у пунктов и листа у `Best Value`; на `768px` перепад высоты рядов `165px` (`337px` vs `502px`), на `1440px` пустой разрыв в коротких карточках `Trial`/`Basic` | `src/data/plans.js`, `src/templates/partials/plans/plan-card.hbs`, `src/styles/pages/index.scss` |
| **VA-06** | **P1** | Иконки (все экраны) | Вместо фирменных векторных SVG-иконок (лист, щит с замком, молния, пин, устройства, play, Wi-Fi, карта, гарнитура, замок, подарок, карандаш, шевроны, иконки меню) используются юникод-глифы (`✦`, `◈`, `ϟ`, `◎`, `▣`, `▷`, `⌁`, `▤`, `◉`, `✓`) | `src/data/pages/index.js`, `src/templates/partials/**`, `src/styles/pages/index.scss` |
| **VA-07** | **P0/P1** | `#checkout` (`06-checkout.png` + UX-сценарий) | **UX:** форма Checkout с реквизитами сейчас постоянно открыта отдельной секцией в потоке лендинга, а должна открываться **в виде окна (диалога) после нажатия кнопки оплаты/выбора тарифа или триала**. **Визуал:** в `Selected plan` и `Order summary` вместо фирменных карточек с логотипом, подзаголовком и угловой волной выведена простая текстовая плашка; поля `Card details` оформлены пунктиром `border: dashed` без иконки карты; лишний eyebrow `DEMO CHECKOUT` | `src/templates/partials/sections/checkout.hbs`, `src/templates/partials/checkout/summary.hbs`, `src/modules/checkout.js`, `src/styles/pages/index.scss` |
| **VA-08** | **P1** | `account.html` (`07-account.png`) и документация | Вынос `Your account` на отдельную страницу `account.html` с демо-входом расходится с `requirements.md` / `task-001.md` (где `#account` — 7-я секция `index.html`); в самом интерфейсе отсутствуют иконки левого меню, шевроны в `Billing`, табличный вид `Profile` с кнопкой `Edit profile` | `pages/account.hbs`, `docs/requirements.md`, `docs/task-001.md` |
| **VA-09** | **P2** | Фоновые волны и шапка | `.landing-section::before` натягивает `section-wave` на `100%` (`cover`) на всех 6 секциях и `account.html`, тогда как в `02`, `05`, `06`, `07` волна локализована; в шапке добавлены `Your account` и `Join the wishlist`, что уплотняет правую часть на `920–1150px` | `src/styles/pages/index.scss`, `src/styles/components/_header.scss` |
| **VA-10** | **P1** | Footer и страницы `Privacy` / `Terms` | Текущий `footer.hbs` содержит только 2 текстовые строки (`LuniVPN` и `More room to explore.`); требуется оформить `footer` **по структуре `header`** (логотип, навигация, действия, ссылки на правовые документы) и добавить отдельные страницы **`privacy.html`** (Privacy Policy) и **`terms.html`** (Terms of Service) | `src/templates/partials/shared/footer.hbs`, `webpack/pages.js`, `pages/privacy.hbs`, `pages/terms.hbs`, `src/data/site.js`, `scripts/ci/verify-build.mjs` |

---

## 2. Инструментальные замеры текущей сборки (headless Chrome)

Горизонтальное переполнение (`overflowX`) отсутствует на всех проверенных ширинах (`1670`, `1440`, `768`, `375 px`), но геометрия и типографика выявили конкретные дефекты:

| Страница | Viewport | `overflowX` | Computed-шрифты (`body` / `h1`) | `#home` (`h`) | `.hero` (`h`) | `.features` (`h`) | `canvas` (`h`) | `.plans-grid` (колонки / высоты карточек) |
|---|---|---|---|---|---|---|---|---|
| `index.html` | `1670×941` | `false` | `Arial` / `Georgia 84px` | `822px` | `520px` | `222px` | `822px` (захватывает `.features`) | `4` / `[534, 534, 534, 534]` |
| `index.html` | `1440×900` | `false` | `Arial` / `Georgia 77.76px` | `818px` | `520px` | `218px` | `818px` (захватывает `.features`) | `4` / `[530, 530, 530, 530]` |
| `index.html` | `768×1024` | `false` | `Arial` / `Georgia 42px` | `995px` | `287px` | `628px` | `995px` (захватывает `.features`) | `2` / `[337, 337, 502, 502]` |
| `index.html` | `375×812` | `false` | `Arial` / `Georgia 42px` | `1111px` | `423px` | `628px` | `1111px` (захватывает `.features`) | `1` / `[337, 337, 371, 502]` |
| `account.html` | `1440×900` | `false` | `Arial` / `Georgia 77.76px` | — | — | — | — | `2×2` (внутри вкладки `Plans`) |
| `account.html` | `768×1024` | `false` | `Arial` / `Georgia 42px` | — | — | — | — | `2×2` (внутри вкладки `Plans`) |
| `account.html` | `375×812` | `false` | `Arial` / `Georgia 42px` | — | — | — | — | `1` (внутри вкладки `Plans`) |

---

## 3. Глобальные расхождения

### 3.1. Шрифты и типографика (`VA-02`)
- **Сейчас:** `html { font-family: Arial, sans-serif; }`, `h1, h2, h3 { font-family: Georgia, serif; }`, `.button { font: 700 15px Arial, sans-serif; }`, `.brand { font-family: Georgia, serif; font-weight: 700; }`.
- **По макетам (`01–07`) и `concept-specification.md`:**
  - Заголовки (`h1`, `h2`, названия тарифов и карточек, часть основных CTA) набраны высокой контрастной редакционной антиквой с тонкими штрихами (рекомендуется подключить локальный `.woff2` семейства *Cormorant Garamond* / *Playfair Display* / *Instrument Serif* с нормальным весом `400/500`, без грубого `700`).
  - Интерфейсный гротеск (навигация, абзацы, списки, поля, подписи) — чистый неогротеск (рекомендуется локальный `.woff2` *Inter* / *DM Sans* / *Plus Jakarta Sans* вместо `Arial`).
  - В логотипе `LuniVPN` часть `Luni` — тонкая контрастная антиква (не жирный `Georgia 700`), `VPN` — ровный гротеск.

### 3.2. Иконки (`VA-06`)
- Вместо юникод-символов (`✦`, `◈`, `ϟ`, `◎`, `▣`, `▷`, `⌁`, `▤`, `◉`) требуется единый набор линейных/двухтонных SVG-иконок в фирменных оттенках `#7D8F59` / `#143622` (лист, щит с замком, молния, метка локации, группа устройств, play, Wi-Fi, карта, гарнитура, замок, слои, подарок, лупа, шеврон, карандаш, пользователь, документ, шестерёнка).

### 3.3. Шапка, подвал и фоновые волны (`VA-09`, `VA-10`)
- **Шапка:** в `list-screens` справа только `The app`, `Why Luni`, `Support` и компактная оливковая кнопка `Get Luni`. В текущей сборке добавлены `Your account` и `Join the wishlist` (`button-outline`). Нужно пересмотреть отступы и порог мобильного меню (сейчас `920px`, при 6 элементах на `930–1100px` шапка выглядит перегруженной).
- **Подвал (`VA-10`):** сейчас в `src/templates/partials/shared/footer.hbs` только две текстовые строки (`LuniVPN` и `More room to explore.`). Требуется сделать `footer` **по структуре аналогичным `header`**: фирменный логотип `LuniVPN` слева, основные навигационные ссылки (`The app`, `Why Luni`, `Support`, `Your account`), юридические ссылки **`Privacy`** (`{{basePath}}privacy.html`) и **`Terms`** (`{{basePath}}terms.html`), а также кнопки действий (`Join the wishlist`, `Get Luni`) с корректной адаптацией на планшете и мобильном.
- **Страницы `privacy.html` и `terms.html` (`VA-10`):** добавить в сборку (`webpack/pages.js`) отдельные страницы **Privacy Policy** (`privacy.html`) и **Terms of Service** (`terms.html`) в едином фирменном стиле (общая шапка, подвал, диалог Wishlist, `BASE_PATH`, один `<h1>`). До финального юридического утверждения владельцем продукта пометить тексты как предварительные (`Draft / Preview`), без выдуманных реквизитов юрлица и почтовых адресов.
- **Волны:** сейчас `.landing-section::before` задаёт `background-size: cover` на всю высоту каждой секции. По `list-screens` волна должна быть полноразмерным фоном **внутри hero-контейнера** (а не под нижним блоком преимуществ), в `Why Luni` / `Support` — акцентом в правой верхней зоне, а в `Plans` / `Checkout` / `Account` — тонкой декоративной полосой, не мешающей чтению карточек и форм.

---

## 4. Поэкранный разбор (`01-home.png` — `07-account.png`)

### Экран 01 — Home (`#home` vs `01-home.png`)

1. **Композиция Hero + Canvas + Features (`VA-01`):**
   - **Сейчас:** `<canvas class="home-wave-canvas">` лежит в `<section id="home">`, куда вложены и `.hero`, и `.features`. В результате canvas (`h = 822px` на desktop, `1111px` на mobile) уходит под 3 колонки преимуществ.
   - **По `01-home.png`:**
     - Верхний блок `.hero-stage` (или `.home-hero`) занимает свой контейнер целиком, и **именно в этом контейнере** `canvas.home-wave-canvas` и статический фон `home-wave` должны заполнять **весь контейнер hero** (`inset: 0; width: 100%; height: 100%`).
     - Блок преимуществ выносится **ниже hero-контейнера** (в отдельный подблок без hero-canvas под ним) и открывается **центрированным заголовком и подзаголовком**, которых сейчас нет в HTML:
       - Заголовок: `A VPN for a more private, open internet.`
       - Подзаголовок: `LuniVPN helps you browse, work, and explore online with greater privacy, security, and freedom.`
2. **Несостыковки текстов:**

| Элемент | Эталон `01-home.png` | Текущий `src/data/pages/index.js` |
|---|---|---|
| Абзац hero | `A VPN for online privacy and freedom — protect your connection, keep your activity private, and enjoy a more open internet.` | `Enjoy a simpler way to protect your connection and keep your online world your own.` |
| Основная CTA | `Get Luni` | `Discover Luni` *(взято со старого `main_page_screen_1.png`)* |
| Вторичная CTA | `Learn more` | `See how it works` *(взято со старого `main_page_screen_1.png`)* |
| Заголовок над 3 колонками | `A VPN for a more private, open internet.` | **Отсутствует** |
| Подзаголовок над 3 колонками | `LuniVPN helps you browse, work, and explore online with greater privacy, security, and freedom.` | **Отсутствует** |
| Колонка 1 (`Freedom to explore.`) | `Access your favorite sites, apps, and content without unnecessary limits.` | `Make room for more of the content you love.` |
| Колонка 2 (`Privacy by design.`) | `Keep your activity private with a VPN built around your privacy.` | `A more private connection, made simple.` |
| Колонка 3 (`Simple and seamless.`) | `A clean, intuitive app that just works, across your devices.` | `Feel at home across your devices.` |

---

### Экран 02 — The app (`#the-app` vs `02-the-app.png`)

1. **Лишний элемент:** в коде выводится eyebrow `THE APP` — на `02-the-app.png` его нет.
2. **Несостыковки текстов:**

| Элемент | Эталон `02-the-app.png` | Текущий `src/data/pages/index.js` |
|---|---|---|
| Подзаголовок (`kicker`) | `The LuniVPN app for a simpler, more open online experience.` | `Simple by design.` |
| Абзац | `A clean, thoughtful app that helps you explore, stay private, and enjoy the internet — across all the devices you use.` | `Stay connected to the things you love with an experience that feels effortless.` |
| Колонка 1 (`Ease, by design.`) | `A clean, intuitive app that's simple to set up and a pleasure to use every day.` | `A clear, calm experience from the first tap.` |
| Колонка 2 (`Locations that fit you.`) | `A growing selection of countries so you can explore more of the internet, your way.` | `Choose the location that works for you.` |
| Колонка 3 (`Across your devices.`) | `One app that works beautifully across your phone, tablet, and computer.` | `A familiar feel wherever you connect.` |

---

### Экран 03 — Why Luni (`#why-luni` vs `03-why-luni.png`)

Самое крупное расхождение: секция сверстана «по мотивам», а не по `03-why-luni.png`.

| Элемент | Эталон `03-why-luni.png` | Текущий `src/data/pages/index.js` / `why-luni.hbs` |
|---|---|---|
| Eyebrow | `PRIVACY · FREEDOM · SIMPLICITY` | `WHY LUNI` |
| Заголовок | `A more open internet, on your terms.` | `Calm protection, built around your day.` |
| Абзац | `LuniVPN gives you a more private, more flexible, and more effortless way to go online — so you can explore, connect, and enjoy the internet with greater freedom.` | `LuniVPN removes the clutter so privacy feels natural rather than technical.` |
| Кнопки CTA | **2 кнопки:** `Get Luni` + `Learn more` | 1 кнопка: `See plans` |
| Колонка 1 | `More privacy.` — `Keep your online activity to yourself with a more private connection.` | `Quiet privacy first.` — выдуманный текст |
| Колонка 2 | `More freedom.` — `Explore your favorite sites, apps, and content with greater flexibility.` | `Thoughtful simplicity.` — выдуманный текст |
| Колонка 3 | `More simplicity.` — `A clean, intuitive app that works across your devices.` | `Consistent everywhere.` — выдуманный текст |
| Нижний блок `THE LUNI WAY` | Eyebrow `THE LUNI WAY`, заголовок `A more thoughtful way to be online.`, 2 абзаца справа от визуала | **Полностью отсутствует** |

---

### Экран 04 — Support (`#support` vs `04-support.png`)

1. **Визуал:**
   - В поле поиска отсутствует иконка лупы слева внутри капсулы.
   - В 4 карточках категорий вместо контурных кнопок с шевроном (`Explore articles >`, `Get in touch >` в disabled/unavailable-состоянии) выведен простой серый текст `Explore articles — Articles coming soon`.
2. **Несостыковки текстов:**

| Элемент | Эталон `04-support.png` | Текущий `src/data/pages/index.js` |
|---|---|---|
| Подзаголовок | `Find answers, get setup guidance, and learn how to make the most of LuniVPN.` | `Find your way with LuniVPN support.` |
| `Getting started` | `Set up LuniVPN and get familiar with the basics.` | `The basics for a smooth beginning.` |
| `Connection` | `Troubleshoot common issues and improve your experience.` | `Help with your connection.` |
| `Account and billing` | `Manage your account, subscription, and payment details.` | `Questions about plans and account.` |
| `Contact support` | `Reach our support team for further help.` | `Get in touch when you need help.` |

---

### Экран 05 — Plans (`#plans` vs `05-plans.png` + новые требования `requirements.md`)

1. **Изменение тарифных планов (`requirements.md` имеет приоритет над `05-plans.png`):**
   - В `05-plans.png` изображены устаревшие 2 тарифа (`Monthly Plan` / `Yearly Plan`) без цен.
   - В `src/data/plans.js` уже реализованы **4 актуальных тарифа** из `requirements.md`:
     - `Trial` — `0.50` / `5 days`, 10 устройств, все возможности
     - `Basic` — `7` / `1 month`, 5 устройств, 3 сервера
     - `Plus` — `25` / `6 months`, 5 устройств, все сервера + расширение браузера
     - `Complete` — `55` / `12 months`, 10 устройств, все сервера + расширенные + блокировщик рекламы + менеджер паролей + облако данных
   - **Важно:** валюта по-прежнему не подтверждена владельцем продукта (`currency: null`), поэтому отображаются числовые значения (`0.50`, `7`, `25`, `55`).
2. **Визуальные и текстовые несостыковки с `05-plans.png`:**
   - Лишний eyebrow `PLANS` над заголовком `Find your space online.`.
   - Подзаголовок в `05-plans.png`: `Simple, private, and more open internet access. Choose the plan that fits you.` В коде сейчас техническая строка `Choose Trial, Basic, Plus, or Complete. Currency and real purchases will be confirmed before launch.` (уведомление о валюте и demo лучше вынести в аккуратный footnote под карточками, а вводный текст вернуть из макета).
   - В карточках нет короткого подзаголовка под названием/ценой (как в `05-plans.png`), у бейджа `Best value` нет иконки листа, а у пунктов списка — тематических иконок.
   - **Баланс высот:** на `1440px` карточки вытянуты до `530px` по самой длинной `Complete` (6 пунктов), из-за чего в `Trial` и `Basic` (2 пункта) образуется ~`160px` пустого пространства над кнопкой; на `768px` (2×2) верхний ряд имеет высоту `337px`, а нижний — `502px` (перепад `165px`).

---

### Экран 06 — Checkout (`#checkout` vs `06-checkout.png` + новый UX-сценарий)

1. **UX-сценарий открытия формы реквизитов (новое требование пользователя):**
   - Сейчас `#checkout` постоянно отображается внизу лендинга как открытая секция с пустым состоянием `Choose a plan first`.
   - По требованию пользователя форма Checkout с реквизитами должна **появляться в отдельном окне (модальном диалоге) только после нажатия на кнопку оплаты/выбора тарифа или триала** (`Choose Trial` / `Choose Basic` / `Choose Plus` / `Choose Complete`), сразу с подставленным выбранным тарифом, сроком и ценой в сводке (`Order summary`).
   - Для модального окна Checkout обязательно обеспечить доступность: `role="dialog"`, `aria-modal="true"`, удержание фокуса (`Tab`/`Shift+Tab`), закрытие по `Escape`/кнопке/клику по фону, возврат фокуса на вызвавшую кнопку, а также сохранение прямой ссылки `?plan=trial|basic|plus|complete#checkout` (автооткрытие окна при валидном `plan`) и честного demo-статуса без реальной оплаты.
2. **Визуальные несостыковки с `06-checkout.png`:**
   - Лишний eyebrow `DEMO CHECKOUT` (достаточно одного `.demo-notice`).
   - В `Selected plan` (слева) и `Order summary` (справа) по `06-checkout.png` должны быть **мини-карточки выбранного тарифа с логотипом LuniVPN, названием, кратким описанием и угловой волной**, а не однострочный бежевый прямоугольник.
   - Поля `Email` и `Card details` в коде выглядят как технические пунктирные блоки `1px dashed`, а не как светлые скруглённые поля с иконкой банковской карты из `06-checkout.png` (при сохранении их неинтерактивного синтетического demo-статуса).

---

### Экран 07 — Account (`account.html` vs `07-account.png`)

1. **Рассинхрон с документацией:** в `docs/requirements.md`, `docs/task-001.md` и `docs/frontend/landing-components.md` `#account` всё ещё описан как 7-я секция `index.html`, хотя по запросу пользователя он вынесен на отдельную страницу `account.html` с демо-входом и 5 вкладками (`Account`, `Subscription`, `Plans`, `Checkout`, `Help`). Документацию нужно синхронизировать с принятым решением.
2. **Визуальные расхождения с `07-account.png`:**
   - Подзаголовок в макете: `Manage your profile, subscription, and billing.` (в коде: `Manage your demo profile, subscription, plans, checkout preview, and help in one place.`).
   - В левом меню отсутствуют иконки рядом с названиями вкладок.
   - В карточке `Profile` на `07-account.png` показаны пары `Name` / `Email` и контурная кнопка `Edit profile` с карандашом (редактирование открывается по клику, а не занимает отдельную форму сразу).
   - В списке `Billing` отсутствуют правые шевроны (`>`).

---

## 5. Рекомендуемый порядок исправлений

1. **Этап 1 (P0 — структура, шрифты, тексты, UX Checkout):**
   - Подключить локальные веб-шрифты (редакционная антиква для заголовков/CTA + современный гротеск для UI) и обновить `base.scss`, `_buttons.scss`, `_header.scss`.
   - Разделить `#home` на верхний `hero`-контейнер (с `canvas.home-wave-canvas` строго на весь hero-контейнер) и нижний блок преимуществ с добавлением центрального заголовка и подзаголовка из `01-home.png`.
   - Синхронизировать все тексты `01-home`, `02-the-app`, `03-why-luni` (включая добавление нижнего блока `THE LUNI WAY`), `04-support`, `05-plans` (подзаголовок + 4 новых тарифа), `06-checkout`, `07-account`.
   - Перевести форму Checkout с реквизитами в модальное окно, открывающееся после нажатия кнопки оплаты/выбора любого тарифа или триала (`Trial`, `Basic`, `Plus`, `Complete`), с сохранением доступности и demo-статуса.
2. **Этап 2 (P1 — визуальная детализация, иконки, Footer и Privacy/Terms):**
   - Заменить все юникод-глифы на единый набор фирменных SVG-иконок.
   - Доработать карточки 4 тарифов (подзаголовки, иконки, баланс высот на `1440`/`768`/`375px`, вынос пояснения про валюту в footnote).
   - Обновить карточки `Selected plan` / `Order summary` и поля `Card details` в окне Checkout, а также иконки/шевроны в `account.html`.
   - Переработать `footer.hbs` по структуре `header` (логотип, навигация, ссылки `Privacy` и `Terms`, действия) и добавить страницы `privacy.html` и `terms.html` в сборку и `verify-build.mjs`.
3. **Этап 3 (P2 — полировка и синхронизация docs):**
   - Локализовать фоновые волны по макетам `01–07`, настроить брейкпоинт шапки для 6 элементов.
   - Обновить `docs/requirements.md` / `docs/task-001.md` / `docs/frontend/landing-components.md` / `docs/task-009.md` в части модального окна Checkout, отдельной страницы `account.html`, обновлённого `footer` и страниц `privacy.html` / `terms.html`, затем зафиксировать повторные проверки после правок.
