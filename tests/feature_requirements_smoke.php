<?php
declare(strict_types=1);

define('_PS_VERSION_', '9.0.0');

if (!class_exists('Module', false)) {
    class Module
    {
    }
}

require_once dirname(__DIR__) . '/src/Core/CciNiceMenuFeatureRegistry.php';
require_once dirname(__DIR__) . '/src/Core/CciNiceMenuCore.php';

$registry = new \CCI\NiceMenu\Core\CciNiceMenuFeatureRegistry(new Module());
$core = new \CCI\NiceMenu\Core\CciNiceMenuCore(new Module());

function menuPayload(array $children, string $hookName = 'displayTop', array $settings = []): array
{
    return [
        'hook_name' => $hookName,
        'settings' => array_merge([
            'layout' => 'classic',
            'theme' => 'clean-light',
        ], $settings),
        'tree' => [
            [
                'type' => 'row',
                'children' => [
                    [
                        'type' => 'column',
                        'column_span' => 6,
                        'children' => [
                            [
                                'type' => 'block',
                                'children' => $children,
                            ],
                        ],
                    ],
                    [
                        'type' => 'column',
                        'column_span' => 6,
                        'children' => [],
                    ],
                ],
            ],
        ],
    ];
}

function assertRequirements(
    \CCI\NiceMenu\Core\CciNiceMenuFeatureRegistry $registry,
    array $payload,
    array $expected,
    string $message,
    int $existingMenuCount = 0,
    bool $isNew = false
): void {
    $actual = $registry->getMenuPayloadRequiredFeatures($payload, $existingMenuCount, $isNew);
    sort($actual);
    sort($expected);

    if ($actual !== $expected) {
        throw new RuntimeException(sprintf(
            "%s\nExpected: %s\nActual: %s",
            $message,
            json_encode($expected),
            json_encode($actual)
        ));
    }
}

assertRequirements(
    $registry,
    menuPayload([
        ['type' => 'custom', 'label' => 'Sale', 'link' => '/sale'],
        ['type' => 'cms_page', 'entity_id' => 1],
        ['type' => 'category', 'entity_id' => 2],
        ['type' => 'product', 'entity_id' => 3],
    ]),
    [],
    'Rows, columns, grouping blocks and standard links must work in the base edition.',
    0,
    true
);

assertRequirements(
    $registry,
    menuPayload([['type' => 'blog_categories']]),
    [],
    'A CCI Blog category list must remain available in the base edition.'
);

$defaultTreeMethod = new ReflectionMethod($core, 'getDefaultTree');
$defaultTree = $defaultTreeMethod->invoke($core);
assertRequirements(
    $registry,
    [
        'hook_name' => 'displayTop',
        'settings' => [
            'layout' => 'classic',
            'theme' => 'clean-light',
        ],
        'tree' => $defaultTree,
    ],
    [],
    'A fresh base-module installation must not seed a menu that requires Pro.'
);

assertRequirements(
    $registry,
    menuPayload([['type' => 'custom', 'link' => '/sale']]),
    ['multiple_menus'],
    'A second menu must require the multiple menus feature.',
    1,
    true
);

assertRequirements(
    $registry,
    menuPayload([['type' => 'custom', 'link' => '/sale']], 'displayNavFullWidth'),
    ['multiple_hooks'],
    'A non-default hook must require the multiple hooks feature.'
);

assertRequirements(
    $registry,
    menuPayload([['type' => 'custom', 'link' => '/sale']], 'displayTop', ['theme' => 'custom-theme']),
    ['theme_presets'],
    'An additional appearance preset must require the theme presets feature.'
);

assertRequirements(
    $registry,
    menuPayload([['type' => 'block', 'component_variant' => 'showcase_card_list']]),
    ['showcase_blocks'],
    'Showcase variants must require the showcase blocks feature.'
);

assertRequirements(
    $registry,
    menuPayload([['type' => 'block', 'css_class' => 'cci-nice-menu-showcase-card-list']]),
    ['showcase_blocks'],
    'Legacy showcase classes from imported JSON must require the showcase blocks feature.'
);

assertRequirements(
    $registry,
    menuPayload([['type' => 'block', 'css_class' => 'customer-menu-block']]),
    [],
    'A custom legacy CSS class must not turn a base block into a Pro feature.'
);

assertRequirements(
    $registry,
    menuPayload([['type' => 'column', 'layout_role' => 'tabs']]),
    ['showcase_blocks'],
    'Tabs and other special layout roles must require the showcase blocks feature.'
);

foreach (['banner', 'video', 'image', 'map'] as $type) {
    assertRequirements(
        $registry,
        menuPayload([['type' => $type]]),
        ['media_blocks'],
        sprintf('%s nodes must require the media blocks feature.', $type)
    );
}

assertRequirements(
    $registry,
    menuPayload([['type' => 'product_tile', 'entity_id' => 3]]),
    ['commerce_blocks'],
    'Product tiles must require the commerce blocks feature.'
);

foreach (['blog_post', 'blog_list', 'blog_carousel', 'blog_popular'] as $type) {
    assertRequirements(
        $registry,
        menuPayload([['type' => $type]]),
        ['extension_blocks'],
        sprintf('%s nodes must require the extension blocks feature.', $type)
    );
}

assertRequirements(
    $registry,
    menuPayload([['type' => 'hook', 'hook_name' => 'displayHome']]),
    ['hook_blocks'],
    'Hook nodes must require the hook blocks feature.'
);

assertRequirements(
    $registry,
    menuPayload([
        [
            'type' => 'custom',
            'link' => '/',
            'display_options' => ['hide_mobile' => true],
        ],
    ]),
    ['responsive_visibility'],
    'Per-device visibility must require the responsive visibility feature.'
);

assertRequirements(
    $registry,
    menuPayload([['type' => 'category_tree']]),
    [],
    'The dynamic category tree must remain available in the base edition.'
);

$freeRuntimePayload = $registry->prepareMenuForRuntime(
    menuPayload([
        [
            'type' => 'block',
            'component_variant' => 'showcase_card_list',
            'layout_role' => 'tabs',
            'css_class' => 'customer-menu-block cci-nice-menu-showcase-card-list',
            'display_options' => ['hide_mobile' => true],
            'children' => [
                ['type' => 'custom', 'label' => 'Sale', 'link' => '/sale'],
                ['type' => 'banner', 'label' => 'Pro banner'],
                ['type' => 'category_tree'],
                ['type' => 'product_tile', 'entity_id' => 3],
                ['type' => 'hook', 'hook_name' => 'displaySearch'],
                ['type' => 'blog_post', 'entity_id' => 1],
            ],
        ],
        [
            'type' => 'column',
            'label' => 'Campaign',
            'children' => [
                [
                    'type' => 'block',
                    'label' => 'Summer sale',
                    'children' => [['type' => 'banner', 'label' => 'Pro-only campaign']],
                ],
            ],
        ],
        ['type' => 'category', 'entity_id' => 2],
    ], 'displayTop', ['theme' => 'custom-theme', 'layout' => 'showcase']),
    []
);

if (!is_array($freeRuntimePayload)) {
    throw new RuntimeException('The displayTop menu must remain available without a Pro license.');
}
if (($freeRuntimePayload['settings']['theme'] ?? '') !== 'custom-theme'
    || ($freeRuntimePayload['settings']['layout'] ?? '') !== 'showcase'
) {
    throw new RuntimeException('Runtime filtering must preserve the saved menu presentation.');
}

$freeRuntimeJson = (string) json_encode($freeRuntimePayload);
foreach (['Pro banner', 'Pro-only campaign', 'Summer sale', 'Campaign', 'product_tile', 'displaySearch', 'blog_post'] as $forbiddenValue) {
    if (str_contains($freeRuntimeJson, $forbiddenValue)) {
        throw new RuntimeException('Free runtime still contains Pro-only data: ' . $forbiddenValue);
    }
}
foreach (['component_variant', 'layout_role', 'hide_mobile', 'cci-nice-menu-showcase-', 'customer-menu-block', 'Sale', '/sale', 'category', 'category_tree'] as $requiredValue) {
    if (!str_contains($freeRuntimeJson, $requiredValue)) {
        throw new RuntimeException('Free runtime removed base menu content: ' . $requiredValue);
    }
}

if ($registry->prepareMenuForRuntime(
    menuPayload([['type' => 'custom', 'label' => 'Account']], 'displayNav1'),
    []
) !== null) {
    throw new RuntimeException('An additional menu hook must remain unavailable without its Pro feature.');
}

echo "Feature requirements smoke test passed.\n";
