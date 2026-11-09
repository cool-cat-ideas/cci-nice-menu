<?php

declare(strict_types=1);

define('_PS_VERSION_', '9.0.0');
define('_DB_PREFIX_', 'ps_');

class Context
{
    public static object $current;

    public static function getContext(): object
    {
        return self::$current;
    }
}

class Db
{
    public static int $reads = 0;

    public static function getInstance(): self
    {
        return new self();
    }

    public function getValue(string $sql): int
    {
        ++self::$reads;

        return 0;
    }

    public function getRow(string $sql): array
    {
        ++self::$reads;

        return ['name' => 'Category ' . Context::$current->language->id, 'link_rewrite' => 'category'];
    }

    public function executeS(string $sql): array
    {
        ++self::$reads;

        return [['id_category' => 5, 'name' => 'Children', 'link_rewrite' => 'children']];
    }
}

require dirname(__DIR__) . '/src/Core/CciNiceMenuCore.php';

$reflection = new ReflectionClass(CCI\NiceMenu\Core\CciNiceMenuCore::class);
$core = $reflection->newInstanceWithoutConstructor();
$invoke = static fn (string $method, ...$args) => $reflection->getMethod($method)->invoke($core, ...$args);
$check = static function (bool $condition, string $message): void {
    if (!$condition) {
        throw new RuntimeException($message);
    }
};
Context::$current = (object) ['shop' => (object) ['id' => 1], 'language' => (object) ['id' => 1]];

$check($invoke('getCategoryProductCount', 5) === 0, 'Empty categories still report zero.');
$invoke('getCategoryProductCount', 5);
$check(Db::$reads === 1, 'A zero product count must be reused.');
Context::$current->shop->id = 2;
$invoke('getCategoryProductCount', 5);
$check(Db::$reads === 2, 'Counts must not cross shop boundaries.');

$invoke('getCategoryChildrenRows', 2, 12);
$check($invoke('getCategoryLinkRewrite', 5) === 'children', 'Reuse the slug returned with category children.');
$check(Db::$reads === 3, 'A known category must not require another language query.');
$invoke('getCategoryChildrenRows', 2, 12);
$check(Db::$reads === 3, 'An identical category listing must be reused.');
$invoke('getCategoryChildrenRows', 2, 6);
$check(Db::$reads === 4, 'Different listing limits must not share incomplete results.');
Context::$current->language->id = 2;
$invoke('getCategoryLinkRewrite', 5);
$check(Db::$reads === 5, 'Category labels and slugs must not cross language boundaries.');
$core->buildMenuMarkup([]);
$invoke('getCategoryLinkRewrite', 5);
$check(Db::$reads === 6, 'Starting another render must refresh read data after possible edits.');

echo "Category read reuse, context isolation and render invalidation passed.\n";
