<?php

declare(strict_types=1);

$root = dirname(__DIR__);
$moduleSource = (string) file_get_contents($root . '/cci_nice_menu.php');
$translationSource = (string) file_get_contents($root . '/src/Admin/CciNiceMenuAdminTranslations.php');

preg_match_all(
    '~\$adminTranslations\[\'([^\']+)\'\]~',
    $moduleSource,
    $readMatches
);
preg_match_all(
    '~^\s*\'([^\']+)\'\s*=>\s*\$translator->trans\(~m',
    $translationSource,
    $definedMatches
);

$readKeys = array_values(array_unique($readMatches[1] ?? []));
$definedKeys = array_values(array_unique($definedMatches[1] ?? []));
if ($definedKeys === []) {
    fwrite(STDERR, "No admin translation definitions were found.\n");
    exit(1);
}

// Core labels are translated by PrestaShop rather than the module catalogue.
preg_match_all(
    '~^\s*\'([^\']+)\'\s*=>\s*\$this->trans\(~m',
    $moduleSource,
    $coreMatches
);
$definedKeys = array_values(array_unique(array_merge($definedKeys, $coreMatches[1] ?? [])));

$files = new RecursiveIteratorIterator(new RecursiveDirectoryIterator($root . '/src/admin-v2'));
foreach ($files as $file) {
    if (!$file->isFile() || !in_array($file->getExtension(), ['js', 'jsx'], true)) {
        continue;
    }
    preg_match_all(
        '~__\(\s*\'((?:[^\'\\\\]|\\\\.)+)\'\s*,~',
        (string) file_get_contents($file->getPathname()),
        $frontendMatches
    );
    foreach ($frontendMatches[1] ?? [] as $key) {
        $readKeys[] = str_replace(["\\'", "\\\\"], ["'", "\\"], $key);
    }
}
$readKeys = array_values(array_unique($readKeys));

$missingKeys = array_values(array_diff($readKeys, $definedKeys));

if ($missingKeys !== []) {
    fwrite(STDERR, 'Missing admin translation keys: ' . implode(', ', $missingKeys) . PHP_EOL);
    exit(1);
}

echo "CCI Nice Menu admin translation keys smoke test passed.\n";
