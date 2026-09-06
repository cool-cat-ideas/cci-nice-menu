<?php

declare(strict_types=1);

$root = dirname(__DIR__);
$visibleController = (string) file_get_contents($root . '/controllers/admin/AdminCciNiceMenuController.php');
$module = (string) file_get_contents($root . '/cci_nice_menu.php');
$configurationController = (string) file_get_contents($root . '/controllers/admin/AdminCciNiceMenuConfigurationController.php');

assertContains('extends AdminCciNiceMenuConfigurationController', $visibleController, 'visible controller renders the Nice Menu admin shell');
assertNotContains('redirectAdmin(', $visibleController, 'visible controller does not leave the CCI menu branch');
assertContains("getAdminLink('AdminCciNiceMenu')", $module, 'module configuration opens the visible controller');
assertContains('renderAdminContent($this->controller_name)', $configurationController, 'admin API token follows the visible controller');
assertContains("controller_name === 'AdminCciNiceMenuConfiguration'", $configurationController, 'legacy hidden route redirects to the visible controller');
assertContains('!Validate::isLoadedObject($this->context->employee)', $module, 'AJAX requires an authenticated back-office employee');
assertContains('!$this->isValidAdminToken((string) Tools::getValue(\'token\', \'\'))', $module, 'AJAX always validates the admin token');
assertNotContains('if (!$this->isDevelopmentMode() && !$this->isValidAdminToken', $module, 'development mode never bypasses AJAX token validation');

echo "CCI Nice Menu admin menu context smoke test passed.\n";

function assertContains(string $needle, string $haystack, string $label): void
{
    if (strpos($haystack, $needle) === false) {
        fwrite(STDERR, "FAIL: {$label}\n");
        exit(1);
    }
}

function assertNotContains(string $needle, string $haystack, string $label): void
{
    if (strpos($haystack, $needle) !== false) {
        fwrite(STDERR, "FAIL: {$label}\n");
        exit(1);
    }
}
