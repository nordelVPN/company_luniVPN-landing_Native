# Модель данных и владение состоянием

## Изменение: один лендинг

Актуальное решение — [requirements](../requirements.md) и [frontend](../frontend/architecture.md): один index.html, секции home → the-app → why-luni → support → plans → checkout → account по PNG 01–07. Старые отдельные страницы/entries относятся к прежней реализации и подлежат объединению. Checkout/Account остаются demo внутри документа. Metadata, canonical и robots задаются всему HTML; отдельный noindex якорю невозможен. Выбор plan обновляет сводку в одном документе, прямая ссылка допустима как ?plan=monthly#checkout. Миграция и её проверки не подтверждены.

Ниже сохранены схемы и инфраструктурные детали; требования об отдельных HTML заменены решением выше.

Статус: проектные схемы. Поля не означают наличие БД или согласованных тарифов. Demo-данные принадлежат первой реализации; серверные сущности — этапу C.

## Контент сайта

| Сущность | Поля | Источник |
|---|---|---|
| Site | brandName, navigation[], defaultLanguage, supportContact? | src/data/site.js |
| Page | pageId, title, description, lang, sections | src/data/pages/<id>.js |
| NavigationItem | id, label, href?, unavailableReason? | Общие данные сайта |
| Asset | src, width, height, alt, decorative, licenseReference | Подготовленные ресурсы / реестр лицензий |
| SupportCategory | id, title, description, action | Данные Support |
| Article (позднее) | id, slug, title, categoryId, body, updatedAt | Согласованный корпус статей |

Если href неизвестен, задаётся unavailableReason; шаблон не превращает его в фиктивную ссылку. Текст статьи не вставляется как произвольный непроверенный HTML.

## Каталог планов

Проектная схема:

```json
{
  "planId": "monthly",
  "displayName": "Monthly Plan",
  "billingPeriod": "month",
  "priceMinor": null,
  "currency": null,
  "features": [],
  "available": false,
  "mode": "demo"
}
```

monthly/yearly — стабильные идентификаторы первой версии, month/year — период. available означает возможность реальной покупки, а не возможность открыть demo-checkout. Список features заполняется из согласованного контента.

priceMinor — целое число минимальных денежных единиц либо null. Нулевая цена и неизвестная цена различаются. При null отображается «—», не «0». Валюта не угадывается. До согласования коммерческих условий Annual savings и другие вычисленные скидки не показываются.

UI сверяет параметр plan с каталогом. Сервер этапа C повторно проверяет план, доступность и цену. Браузер никогда не определяет итоговую сумму реального заказа.

## Checkout и оплата

| Сущность | Предложенные поля | Владелец |
|---|---|---|
| CheckoutView | mode, selectedPlan?, summary, availability, message? | Frontend / адаптер |
| CheckoutSession | id, userId?, planId, orderId, status, redirectUrl?, expiresAt | Backend |
| Order | id, userId, planId, amountMinor, currency, status, createdAt | Backend |
| PaymentEvent | provider, eventId, orderId, processingStatus, receivedAt | Backend |

Предложенные состояния заказа: pending → paid / failed / cancelled / expired. Конкретные переходы и поведение позднего success после timeout согласовать с провайдером. Состояние «пользователь закрыл вкладку» не является доказательством отменённого платежа.

Сумма заказа фиксируется сервером при создании. Для изменений каталога предусмотреть version/price reference; созданный заказ не пересчитывается браузером. События провайдера имеют уникальность по provider + eventId. Повторная доставка не создаёт второй заказ или вторую активацию.

## Профиль и подписка

| Сущность | Поля | Ограничения |
|---|---|---|
| User | id, displayName, email, emailVerified, createdAt | Только собственный профиль, проверка на сервере |
| Subscription | id, userId, planId, status, currentPeriodEnd?, cancelAtPeriodEnd | Статусы и правила продления подтверждаются продуктом |
| PaymentMethodSummary | providerReference, brand, last4, expiry? | Только маскированное представление |
| BillingEntry | id, orderId, amountMinor, currency, status, createdAt, receiptUrl? | Доступ только владельцу |

Account demo использует явно синтетические значения; не копировать персональные данные из истории или системного профиля. Платёжные реквизиты, пароль и секреты не являются частью frontend data.

## Связи будущего backend

```mermaid
erDiagram
  USER ||--o{ ORDER : places
  PLAN ||--o{ ORDER : selected
  USER ||--o{ SUBSCRIPTION : owns
  PLAN ||--o{ SUBSCRIPTION : defines
  ORDER ||--o{ PAYMENT_EVENT : receives
```

Это логическая модель, не готовая схема миграций. Тип БД и физические индексы выбираются при реализации. Требуются уникальность обработанного eventId, связь заказа с владельцем, транзакционная согласованность оплаты и подписки.

## Хранение, время и ошибки

- Статические публичные данные версионируются в Git; fixtures отделены от live.
- Выбранный план хранится в URL; email, секреты и платёжные реквизиты в URL не помещаются.
- Даты API — строки UTC ISO 8601; форматирование выполняет UI с явно заданной локалью.
- Известная пустая выборка отличается от ошибки и недоступной функции.
- Ответ API валидируется на границе адаптера, неизвестный статус превращается в безопасное состояние, а не «успех».
- Сроки хранения персональных данных, удаления и журналов определить до live-релиза; архитектура не назначает их произвольными числами.
