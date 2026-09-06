<?php

declare(strict_types=1);

$moduleRoot = dirname(__DIR__);
$tree = json_decode(
    (string) file_get_contents($moduleRoot . '/views/data/retail_showcase_tree.json'),
    true,
    512,
    JSON_THROW_ON_ERROR
);
$builderSource = (string) file_get_contents(
    $moduleRoot . '/src/admin-v2/components/MenuBuilderPanel.jsx'
);
$builtAdmin = (string) file_get_contents($moduleRoot . '/views/js/ccinice-menu-admin.js');

$assert = static function (bool $condition, string $message): void {
    if (!$condition) {
        fwrite(STDERR, "FAIL: {$message}\n");
        exit(1);
    }
};

$findTopEntry = static function (array $nodes, string $label) use (&$findTopEntry): ?array {
    foreach ($nodes as $node) {
        if (
            ($node['label'] ?? '') === $label
            && ($node['component_variant'] ?? '') === 'showcase_entry'
        ) {
            return $node;
        }

        $match = $findTopEntry(is_array($node['children'] ?? null) ? $node['children'] : [], $label);
        if ($match !== null) {
            return $match;
        }
    }

    return null;
};

foreach ([
    'Inspiration' => ['Inspiration library', 'compass'],
    'Blog' => ['From our blog', 'file-text'],
] as $entryLabel => [$headerLabel, $icon]) {
    $entry = $findTopEntry($tree, $entryLabel);
    $assert($entry !== null, "Missing {$entryLabel} showcase entry.");

    $headerColumn = $entry['children'][0] ?? [];
    $header = $headerColumn['children'][0]['children'][0] ?? [];
    $assert(
        ($headerColumn['component_variant'] ?? '') === 'showcase_header_column',
        "{$entryLabel} must start with a showcase header column."
    );
    $assert(($header['label'] ?? '') === $headerLabel, "Unexpected {$entryLabel} header label.");
    $assert(($header['icon'] ?? '') === $icon, "Unexpected {$entryLabel} header icon.");
}

foreach ([
    'Discover creative ideas, media and every content block available in the menu.',
    'Discover featured guides, latest articles and popular reads.',
] as $description) {
    $assert(str_contains($builderSource, $description), 'The preset builder is missing a showcase header.');
    $assert(str_contains($builtAdmin, $description), 'The compiled admin bundle is stale.');
}

fwrite(STDOUT, "OK: Inspiration and Blog use the shared showcase header component.\n");
