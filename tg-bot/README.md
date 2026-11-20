# Telegram-вишлист LuniVPN

Код бота: `common.php` хранит пользователей и вызывает Telegram API; `webhook.php` принимает события; `webhook-admin.php` управляет webhook; `bot.php` — альтернативный polling. Полная эксплуатационная инструкция: [docs/backend/docker-compose.md](../docs/backend/docker-compose.md). Фактическое поведение и ограничения: [docs/backend/status.md](../docs/backend/status.md).

Секреты задаются в `.env`, не в этом каталоге. Основной режим — webhook. `/start` в личном чате записывает пользователя в `/data/wishlist.json` и отправляет приветствие. Повторная доставка может повторить сообщение, но не создать дубль пользователя.
