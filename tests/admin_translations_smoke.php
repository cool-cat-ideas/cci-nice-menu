<?php

declare(strict_types=1);

// Match PrestaShop visibility: external helpers must use getTranslator().
class Module
{
    protected function trans($id, array $parameters = [], $domain = null)
    {
        throw new RuntimeException('Protected translation API must not be called externally.');
    }

    public function __call($name, $arguments)
    {
        return '';
    }

    public function getTranslator()
    {
        return new class {
            public function trans($id, array $parameters = [], $domain = null)
            {
                if ($domain !== 'Modules.CciNiceMenu.Admin') {
                    throw new RuntimeException('Wrong translation domain.');
                }

                return 'translated:' . $id;
            }
        };
    }
}
require dirname(__DIR__) . '/src/Admin/CciNiceMenuAdminTranslations.php';
$strings = CciNiceMenuAdminTranslations::get(new Module());
foreach ($strings as $source => $translated) {
    if ($translated !== 'translated:' . $source) {
        throw new RuntimeException('Missing translation: ' . $source);
    }
}
foreach (['Choose local image', 'Search images', 'Image location', 'Use image', 'Load more'] as $required) {
    if (empty($strings[$required])) {
        throw new RuntimeException('Missing media label: ' . $required);
    }
}
echo 'PASS: all ' . count($strings) . " admin labels use the public translator.\n";
