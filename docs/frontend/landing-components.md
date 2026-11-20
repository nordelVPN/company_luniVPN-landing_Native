# Компоненты единого лендинга

Источник — PNG 01–07 в [list-screens](../images/concept/desktop/list-screens/). Один документ, одна шапка, последовательные секции.

| № / секция | Компоненты / источник | Поведение |
|---|---|---|
| 01 Home | Hero, RibbonArt, преимущества · 01-home.png | Discover Luni → #plans; See how it works → #the-app |
| 02 The app | AppHero, композиция устройств (`DeviceArt`) · 02-the-app.png | Get Luni → #plans; Explore the app → #the-app |
| 03 Why Luni | Вводный блок с `RibbonArt` справа и секция преимуществ · 03-why-luni.png | Пункт Why Luni → #why-luni |
| 04 Support | Заголовок, поиск, `RibbonArt` справа, категории · 04-support.png | Без корпуса статей поиск явно недоступен; контакт не придумывать |
| 05 Plans | PlanCard (4 карточки: `Trial`, `Basic`, `Plus`, `Complete`), PlanChoice, `card-wave` · стиль 05-plans.png | Общий каталог из 4 тарифов (`0.50` / `7` / `25` / `55`, валюта уточняется); выбор обновляет summary и ведёт к `#checkout` |
| 06 Checkout | SelectedPlan, FormField, OrderSummary · 06-checkout.png | Demo; показывает цену выбранного плана (Total «—» при невыбранном/неверном `plan`), без реальной оплаты |
| 07 Account | AccountNav, Profile, Subscription, Billing · 07-account.png | Синтетический demo-профиль; действия не имитируют серверный успех |

Общие компоненты: логотип, Header, MobileNav, Button/Link, Icon, Field, RibbonArt, DeviceArt и WishlistDialog. Шапки отдельных кадров не повторяются в каждом разделе. Текст и кнопки — HTML, декор и композиция устройств — отдельные растровые/гибридные ассеты вместо плоских SVG-заглушек (подробные требования, кроп и промпты 2× — в [visual-assets-spec.md](visual-assets-spec.md)). Палитра и типографика — в [спецификации](../concept-specification.md).

## Контракты

Ссылка отвечает за переход; button — за действие. Поля имеют label и связанное сообщение ошибки. PlanChoice хранит `planId` (`trial`, `basic`, `plus`, `complete`) из общего каталога с ценами, сроками, лимитом устройств и возможностями по [requirements.md](../requirements.md); валюта не угадывается до подтверждения. Query `plan` проверяется; отсутствие выбора не скрывает Checkout.

Меню имеет aria-expanded, клавиатурное управление и закрытие по Escape. WishlistDialog имеет доступный заголовок, удержание/возврат фокуса и состояние отсутствующей ссылки. Сценарий и строки — в [task-012](../task-012.md).

На телефоне порядок 01–07 сохраняется: текст перед иллюстрацией, четыре карточки тарифов вертикально, summary после формы. Макеты приложения — демонстрационные материалы, а не мобильный layout сайта. Приёмка — по [матрице](tasks/001-validation.md).
