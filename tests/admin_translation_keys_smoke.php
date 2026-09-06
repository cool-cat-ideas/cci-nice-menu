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
    '~^\s*\'([^\']+)\'\s*=>\s*\$module->trans\(~m',
    $translationSource,
    $definedMatches
);

$readKeys = array_values(array_unique($readMatches[1] ?? []));
$definedKeys = array_values(array_unique($definedMatches[1] ?? []));
$missingKeys = array_values(array_diff($readKeys, $definedKeys));

if ($missingKeys !== []) {
    fwrite(STDERR, 'Missing admin translation keys: ' . implode(', ', $missingKeys) . PHP_EOL);
    exit(1);
}

echo "CCI Nice Menu admin translation keys smoke test passed.\n";
