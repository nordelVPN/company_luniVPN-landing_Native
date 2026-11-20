<?php
declare(strict_types=1);
require dirname(__DIR__, 2) . '/tg-bot/common.php';

function check(bool $ok, string $name): void {
    if (!$ok) throw new RuntimeException($name);
}

$dir = sys_get_temp_dir() . '/luni-wishlist-' . bin2hex(random_bytes(8));
mkdir($dir);
$file = $dir . '/wishlist.json';
try {
    $alice = ['id' => 123, 'username' => 'alice', 'first_name' => 'Alice'];
    saveUser($file, $alice);
    $first = json_decode(file_get_contents($file), true, 512, JSON_THROW_ON_ERROR);
    check(count($first) === 1 && $first[0]['telegramId'] === 123, 'first insert');
    $alice['username'] = 'changed';
    saveUser($file, $alice);
    $second = json_decode(file_get_contents($file), true, 512, JSON_THROW_ON_ERROR);
    check(count($second) === 1 && $second[0]['createdAt'] === $first[0]['createdAt'] && $second[0]['username'] === 'changed', 'upsert');
    saveUser($file, ['id' => 456, 'username' => 'changed']);
    check(count(json_decode(file_get_contents($file), true)) === 2, 'identity is Telegram ID');
    $before = file_get_contents($file);
    foreach (['/start', '/start arg', '/start@bot'] as $command) {
        try {
            handleUpdate(['message' => ['text' => $command, 'chat' => ['type' => 'private', 'id' => 123], 'from' => ['id' => 'invalid']]], 'unused');
            throw new RuntimeException('command was not matched');
        } catch (InvalidArgumentException) {
            // Valid /start syntax reached input validation before any network call.
        }
    }
    handleUpdate(['message' => ['text' => '/start', 'chat' => ['type' => 'group', 'id' => -1], 'from' => $alice]], 'unused');
    handleUpdate(['message' => ['text' => '/starter', 'chat' => ['type' => 'private', 'id' => 123], 'from' => $alice]], 'unused');
    check(file_get_contents($file) === $before, 'ignored messages');
    file_put_contents($file, '{"broken":true}');
    try {
        saveUser($file, $alice);
        throw new RuntimeException('corrupt file was overwritten');
    } catch (RuntimeException $error) {
        check($error->getMessage() === 'Invalid wishlist', 'corrupt file rejected');
    }
    check(file_get_contents($file) === '{"broken":true}', 'corrupt file preserved');
    echo "storage and filtering: ok\n";
} finally {
    foreach (glob($dir . '/*') ?: [] as $item) unlink($item);
    rmdir($dir);
}
