<?php

/**
 * CCI Nice Menu for PrestaShop.
 *
 * @author    Cool Cat Ideas <info@coolcatideas.com>
 * @copyright 2025-2026 Cool Cat Ideas
 * @license   https://opensource.org/license/afl-3-0-php Academic Free License 3.0 (AFL-3.0)
 */

declare(strict_types=1);

if (!defined('_PS_VERSION_')) {
    exit;
}
require_once __DIR__ . '/src/Core/CciNiceMenuCore.php';
require_once __DIR__ . '/src/Shared/CciSharedLicenseEnvironment.php';
require_once __DIR__ . '/src/Core/CciNiceMenuFeatureRegistry.php';
require_once __DIR__ . '/src/Admin/CciNiceMenuAdminTranslations.php';

use CCI\NiceMenu\Core\CciNiceMenuCore;
use CCI\NiceMenu\Core\CciNiceMenuFeatureRegistry;

class Cci_Nice_Menu extends Module
{
    private const PRODUCT_HOME_URL = 'https://coolcatideas.com/products/cci-nice-menu';
    private const MARKETPLACE_API_BASE = 'https://coolcatideas.com';
    private const MARKETPLACE_API_BASE_OVERRIDE = 'CCI_MARKETPLACE_API_BASE';
    private const MARKETPLACE_PRODUCT_SLUG = 'cci-nice-menu';
    private const PRO_MODULE_NAME = 'cci_nice_menu_pro';
    private const ADMIN_PARENT_TAB_CLASS = 'AdminCciParent';

    private const MODULE_SETTINGS_CONFIG_KEY = 'CCI_NICE_MENU_MODULE_SETTINGS';
    private const DEFAULT_MODULE_SETTINGS = [
        'frontendCss' => true,
        'frontendJs' => true,
        'loadStrategy' => 'hook',
        'iconLibrary' => 'none',
        'iconSource' => 'local',
        'owlAssetsSource' => 'module',
    ];
    private const ADMIN_TABS = [
        'AdminCciNiceMenu',
        'AdminCciNiceMenuConfiguration',
    ];

    private const FRONT_HOOKS = [
        'displayTop',
        'displayNav1',
        'displayNav2',
        'displayNavFullWidth',
    ];

    private CciNiceMenuCore $core;
    private static array $renderCache = [];
    private static bool $frontAssetsInjected = false;
    private CciNiceMenuFeatureRegistry $featureRegistry;

    public function __construct()
    {
        $this->name = 'cci_nice_menu';
        $this->tab = 'front_office_features';
        $this->version = '1.0.1';
        $this->author = 'Cool Cat Ideas';
        $this->need_instance = 0;
        $this->bootstrap = true;
        $this->ps_versions_compliancy = [
            'min' => '9.0.0',
            'max' => '9.2.0',
        ];

        parent::__construct();

        $this->displayName = $this->trans('CCI Nice Menu', [], 'Modules.CciNiceMenu.Admin');
        $this->description = $this->trans('Build a responsive PrestaShop menu from categories, products, CMS pages and custom links, then arrange its desktop and mobile dropdown content visually.', [], 'Modules.CciNiceMenu.Admin');
        $this->confirmUninstall = $this->trans('Do you really want to uninstall CCI Nice Menu?', [], 'Modules.CciNiceMenu.Admin');

        $this->core = new CciNiceMenuCore($this);
        $this->featureRegistry = new CciNiceMenuFeatureRegistry($this);
    }

    public function install(): bool
    {
        return parent::install()
          && $this->installTabs()
          && $this->registerHook(array_merge(self::FRONT_HOOKS, ['actionAdminControllerSetMedia', 'actionFrontControllerSetMedia'], $this->featureRegistry->integrationHooks()))
          && $this->core->install();
    }

    public function uninstall(): bool
    {
        return $this->core->uninstall()
          && $this->uninstallTabs()
          && parent::uninstall();
    }

    public function getContent()
    {
        if (Tools::isSubmit('ajax')) {
            return $this->handleAjaxRequest();
        }

        $this->installTabs();
        $this->ensureIntegrationHooks();

        Tools::redirectAdmin(
            Context::getContext()->link->getAdminLink('AdminCciNiceMenu')
        );

        return '';
    }

    public function renderAdminContent(string $tokenController = 'AdminModules'): string
    {
        if (!in_array($tokenController, ['AdminModules', 'AdminCciNiceMenu', 'AdminCciNiceMenuConfiguration'], true)) {
            $tokenController = 'AdminModules';
        }

        $shopId = (int) $this->context->shop->id;
        $this->ensureIntegrationHooks();
        $menus = $this->core->getMenus($shopId);
        $activeMenu = $this->core->getActiveMenu($shopId, 'displayTop');

        if (!$activeMenu && !empty($menus)) {
            $activeMenu = $menus[0];
        }

        $baseAdminUrl = Tools::getHttpHost(true) . (string) ($_SERVER['REQUEST_URI'] ?? '');
        $frontHooks = self::FRONT_HOOKS;
        $availableHooks = $this->getAvailableHookNames();
        $menuHooks = $this->filterDisplayHooks($availableHooks, $frontHooks);
        $license = $this->getDecoratedLicensePayload($shopId);
        $features = is_array($license['availableFeatures'] ?? null) ? $license['availableFeatures'] : [];
        $extensions = $this->featureRegistry->getAdminExtensions($this->featureMap($features));
        $adminExtensionScripts = $this->getAdminExtensionScripts($shopId);
        $marketplaceFeedEndpoint = $this->getMarketplaceFeedEndpoint();
        $adminTranslations = $this->getAdminTranslations();
        $jsonFlags = JSON_UNESCAPED_UNICODE
          | JSON_UNESCAPED_SLASHES
          | JSON_HEX_TAG
          | JSON_HEX_APOS
          | JSON_HEX_AMP
          | JSON_HEX_QUOT;

        $this->context->smarty->assign([
            'modulePath' => $this->getPathUri(),
            'adminAssetVersion' => (string) max(
                @filemtime(__DIR__ . '/views/js/ccinice-menu-admin.js') ?: 0,
                @filemtime(__DIR__ . '/views/css/cci_nice_menu_admin.css') ?: 0
            ),
            'adminLoadingLabel' => $this->getAdminLoadingLabel(),
            'adminToken' => json_encode(Tools::getAdminTokenLite($tokenController), $jsonFlags),
            'adminAjaxEndpoint' => json_encode($baseAdminUrl, $jsonFlags),
            'license' => json_encode($license, $jsonFlags),
            'features' => json_encode($features, $jsonFlags),
            'enabledFeatures' => json_encode($license['enabledFeatures'] ?? [], $jsonFlags),
            'multistore' => json_encode($this->getMultistoreContext($shopId), $jsonFlags),
            'extensions' => json_encode($extensions, $jsonFlags),
            'schemaVersion' => $this->core->getSchemaVersion(),
            'hooks' => json_encode($menuHooks, $jsonFlags),
            'availableHooks' => json_encode($availableHooks, $jsonFlags),
            'presetLayouts' => json_encode($this->core->getPresetLayouts(), $jsonFlags),
            'defaultSettings' => json_encode($this->core->getDefaultSettings(), $jsonFlags),
            'themePresets' => json_encode($this->core->getThemePresets(), $jsonFlags),
            'moduleVersion' => json_encode($this->version, $jsonFlags),
            'moduleSettings' => json_encode($this->getModuleSettings(), $jsonFlags),
            'documentationUrl' => json_encode(self::PRODUCT_HOME_URL, $jsonFlags),
            'upgradeUrl' => json_encode(self::PRODUCT_HOME_URL, $jsonFlags),
            'marketplaceFeedEndpoint' => json_encode($marketplaceFeedEndpoint, $jsonFlags),
            'extensionStoreEndpoint' => json_encode($marketplaceFeedEndpoint, $jsonFlags),
            'adminDate' => json_encode($this->getAdminDateConfig(), $jsonFlags),
            'diagnostics' => json_encode($this->getDiagnosticsPayload($shopId), $jsonFlags),
            'adminExtensionScripts' => $adminExtensionScripts,
            'adminI18n' => json_encode([
                'dashboard' => $adminTranslations['Menus'],
                'extensions' => $adminTranslations['Extensions'],
                'settings' => $adminTranslations['Settings'],
                'menu' => $adminTranslations['Menu'],
                'save' => $this->trans('Save', [], 'Admin.Actions'),
                'cancel' => $this->trans('Cancel', [], 'Admin.Actions'),
                'edit' => $this->trans('Edit', [], 'Admin.Actions'),
                'delete' => $this->trans('Delete', [], 'Admin.Actions'),
                'duplicate' => $this->trans('Duplicate', [], 'Admin.Actions'),
                'addNew' => $this->trans('Add new', [], 'Admin.Actions'),
                'title' => $this->trans('Title', [], 'Admin.Global'),
                'status' => $this->trans('Status', [], 'Admin.Global'),
                'date' => $this->trans('Date', [], 'Admin.Global'),
                'active' => $adminTranslations['Active'],
                'inactive' => $adminTranslations['Inactive'],
                'version' => $adminTranslations['Version'],
                'translations' => $adminTranslations,
                'localMediaLibrary' => [
                    'title' => $adminTranslations['Choose local image'],
                    'description' => $adminTranslations['Select an existing image from this store. Uploading, deleting and renaming files are disabled.'],
                    'search' => $adminTranslations['Search images'],
                    'source' => $adminTranslations['Image location'],
                    'root' => $adminTranslations['Root'],
                    'folders' => $adminTranslations['Folders'],
                    'folder' => $adminTranslations['Folder'],
                    'loadMore' => $adminTranslations['Load more'],
                    'choose' => $adminTranslations['Use image'],
                    'cancel' => $adminTranslations['Cancel'],
                    'close' => $adminTranslations['Close'],
                    'loading' => $adminTranslations['Loading images...'],
                    'empty' => $adminTranslations['No matching images found.'],
                    'error' => $adminTranslations['Images could not be loaded.'],
                    'readOnly' => $adminTranslations['Read-only library'],
                    'limited' => $adminTranslations['The search limit was reached. Open a narrower folder or refine the search.'],
                ],
            ], $jsonFlags),
            'initialPayload' => json_encode([
                'menus' => $menus,
                'activeMenu' => $activeMenu,
                'hooks' => $menuHooks,
                'presets' => $this->core->getPresetLayouts(),
                'themePresets' => $this->core->getThemePresets(),
                'defaultSettings' => $this->core->getDefaultSettings(),
                'license' => $license,
                'features' => $features,
                'enabledFeatures' => $license['enabledFeatures'] ?? [],
                'multistore' => $this->getMultistoreContext($shopId),
                'extensions' => $extensions,
                'marketplaceFeedEndpoint' => $marketplaceFeedEndpoint,
                'extensionStoreEndpoint' => $marketplaceFeedEndpoint,
                'adminDate' => $this->getAdminDateConfig(),
                'upgradeUrl' => self::PRODUCT_HOME_URL,
                'adminLinks' => [
                    'documentation' => self::PRODUCT_HOME_URL,
                    'store' => self::PRODUCT_HOME_URL,
                ],
            ], $jsonFlags),
        ]);

        return $this->display(__FILE__, 'views/templates/admin/configure.tpl');
    }

    private function getAdminDateConfig(): array
    {
        $language = $this->context->language;
        $dateFormat = (string) ($language->date_format_lite ?? 'Y-m-d');
        $dateTimeFormat = (string) ($language->date_format_full ?? '');

        return [
            'locale' => (string) ($language->locale ?? $language->language_code ?? $language->iso_code ?? 'en-US'),
            'dateFormat' => $dateFormat,
            'timeFormat' => 'H:i',
            'dateTimeFormat' => $dateTimeFormat !== '' ? $dateTimeFormat : trim($dateFormat . ' H:i'),
            'timeZone' => (string) (Configuration::get('PS_TIMEZONE') ?: date_default_timezone_get()),
        ];
    }

    private function getAdminLoadingLabel(): string
    {
        return $this->trans('Loading CCI Nice Menu...', [], 'Modules.CciNiceMenu.Admin');
    }

    private function getAdminTranslations(): array
    {
        $translations = array_merge(
            CciNiceMenuAdminTranslations::get($this),
            $this->getCoreAdminTranslations()
        );

        $proModule = Module::getInstanceByName('cci_nice_menu_pro');
        if ($proModule instanceof Module && $proModule->active && method_exists($proModule, 'getCciAdminTranslations')) {
            $translations = array_merge($translations, (array) $proModule->getCciAdminTranslations());
        }

        return $translations;
    }

    private function getCoreAdminTranslations(): array
    {
        return [
            'Save' => $this->trans('Save', [], 'Admin.Actions'),
            'Cancel' => $this->trans('Cancel', [], 'Admin.Actions'),
            'Edit' => $this->trans('Edit', [], 'Admin.Actions'),
            'Delete' => $this->trans('Delete', [], 'Admin.Actions'),
            'Duplicate' => $this->trans('Duplicate', [], 'Admin.Actions'),
            'Add new' => $this->trans('Add new', [], 'Admin.Actions'),
            'Search' => $this->trans('Search', [], 'Admin.Actions'),
            'Close' => $this->trans('Close', [], 'Admin.Actions'),
            'Reset' => $this->trans('Reset', [], 'Admin.Actions'),
            'View' => $this->trans('View', [], 'Admin.Actions'),
            'Enable' => $this->trans('Enable', [], 'Admin.Actions'),
            'Disable' => $this->trans('Disable', [], 'Admin.Actions'),
            'Update' => $this->trans('Update', [], 'Admin.Actions'),
            'Remove' => $this->trans('Remove', [], 'Admin.Actions'),
            'Back' => $this->trans('Back', [], 'Admin.Actions'),
            'Next' => $this->trans('Next', [], 'Admin.Actions'),
            'Previous' => $this->trans('Previous', [], 'Admin.Actions'),
            'Continue' => $this->trans('Continue', [], 'Admin.Actions'),
            'Apply' => $this->trans('Apply', [], 'Admin.Actions'),
            'Import' => $this->trans('Import', [], 'Admin.Actions'),
            'Export' => $this->trans('Export', [], 'Admin.Actions'),
            'Upload' => $this->trans('Upload', [], 'Admin.Actions'),
            'Download' => $this->trans('Download', [], 'Admin.Actions'),
            'Name' => $this->trans('Name', [], 'Admin.Global'),
            'Author' => $this->trans('Author', [], 'Admin.Global'),
            'Title' => $this->trans('Title', [], 'Admin.Global'),
            'Status' => $this->trans('Status', [], 'Admin.Global'),
            'Date' => $this->trans('Date', [], 'Admin.Global'),
            'Description' => $this->trans('Description', [], 'Admin.Global'),
            'Type' => $this->trans('Type', [], 'Admin.Global'),
            'Position' => $this->trans('Position', [], 'Admin.Global'),
            'Enabled' => $this->trans('Enabled', [], 'Admin.Global'),
            'Disabled' => $this->trans('Disabled', [], 'Admin.Global'),
            'Active' => $this->trans('Active', [], 'Admin.Global'),
            'Inactive' => $this->trans('Inactive', [], 'Admin.Global'),
            'Yes' => $this->trans('Yes', [], 'Admin.Global'),
            'No' => $this->trans('No', [], 'Admin.Global'),
            'Language' => $this->trans('Language', [], 'Admin.Global'),
            'Shop' => $this->trans('Shop', [], 'Admin.Global'),
            'ID' => $this->trans('ID', [], 'Admin.Global'),
            'Actions' => $this->trans('Actions', [], 'Admin.Global'),
            'URL' => $this->trans('URL', [], 'Admin.Global'),
            'Version' => $this->trans('Version', [], 'Admin.Global'),
            'Settings' => $this->trans('Settings', [], 'Admin.Global'),
        ];
    }

    private function getMarketplaceFeedEndpoint(): string
    {
        $base = $this->getMarketplaceApiBase();

        $locale = strtolower(substr((string) ($this->context->language->iso_code ?? 'en'), 0, 2));
        if (!in_array($locale, ['en', 'pl'], true)) {
            $locale = 'en';
        }

        return $base
          . '/api/products/' . rawurlencode(self::MARKETPLACE_PRODUCT_SLUG) . '/plugin-feed/?'
          . http_build_query(['locale' => $locale, 'limit' => 20]);
    }

    private function getMarketplaceApiBase(): string
    {
        $base = trim((string) getenv(self::MARKETPLACE_API_BASE_OVERRIDE));
        if ($base === '') {
            $base = self::MARKETPLACE_API_BASE;
        }

        $parts = parse_url($base);
        if (!is_array($parts) || !in_array($parts['scheme'] ?? '', ['http', 'https'], true) || empty($parts['host'])) {
            $base = self::MARKETPLACE_API_BASE;
        }

        return rtrim($base, '/');
    }

    private function getAdminExtensionScripts(int $shopId): array
    {
        $raw = Hook::exec('displayCciNiceMenuAdminAssets', [
            'shop_id' => $shopId,
            'module' => $this->name,
        ], null, true);

        $scripts = [];
        foreach ((array) $raw as $moduleAssets) {
            $assets = is_array($moduleAssets) ? $moduleAssets : [];
            foreach ((array) ($assets['scripts'] ?? []) as $script) {
                if (!is_array($script) || empty($script['src'])) {
                    continue;
                }

                $scripts[] = [
                    'src' => (string) $script['src'],
                    'version' => (string) ($script['version'] ?? $this->version),
                ];
            }
        }

        return $scripts;
    }

    private function installTabs(): bool
    {
        if ($this->ensureCciParentTab() <= 0) {
            return false;
        }

        $tabs = [
            [
                'class_name' => 'AdminCciNiceMenu',
                'name' => 'CCI Nice Menu',
                'parent' => self::ADMIN_PARENT_TAB_CLASS,
                'icon' => 'menu',
                'position' => 3,
            ],
            [
                'class_name' => 'AdminCciNiceMenuConfiguration',
                'name' => 'CCI Nice Menu',
                'parent' => 'AdminCciNiceMenu',
                'icon' => 'settings',
                'active' => 0,
            ],
        ];

        foreach ($tabs as $tabData) {
            if (!$this->upsertTab($tabData)) {
                return false;
            }
        }

        return $this->normalizeCciMenuPositions((int) Tab::getIdFromClassName(self::ADMIN_PARENT_TAB_CLASS));
    }

    private function uninstallTabs(): bool
    {
        $this->deleteTabs(array_reverse(self::ADMIN_TABS));

        return $this->removeCciParentTabIfEmpty();
    }

    public function ensureIntegrationHooks(): void
    {
        foreach ($this->featureRegistry->integrationHooks() as $hookName) {
            $this->registerHook($hookName);
        }
    }

    private function getDecoratedLicensePayload(int $shopId): array
    {
        return $this->featureRegistry->decorateLicensePayload(
            $this->getRawLicensePayload($shopId)
        );
    }

    private function decorateLicenseResponse(array $response, int $shopId): array
    {
        $license = is_array($response['license'] ?? null)
          ? (array) $response['license']
          : $this->getRawLicensePayload($shopId);
        $decorated = $this->featureRegistry->decorateLicensePayload($license);

        $response['license'] = $decorated;
        $response['features'] = $decorated['availableFeatures'] ?? [];
        $response['enabledFeatures'] = $decorated['enabledFeatures'] ?? [];

        return $response;
    }

    private function getRawLicensePayload(int $shopId): array
    {
        $proModule = $this->getProLicenseModule();
        if ($proModule instanceof Module && method_exists($proModule, 'getCciLicensePayload')) {
            $payload = $proModule->getCciLicensePayload($shopId);

            return is_array($payload) ? $payload : $this->getFreeLicensePayload($shopId, $this->trans('CCI Nice Menu Pro returned an invalid license payload.', [], 'Modules.CciNiceMenu.Admin'));
        }

        return $this->getFreeLicensePayload($shopId, $this->trans('Install and activate CCI Nice Menu Pro to unlock paid features.', [], 'Modules.CciNiceMenu.Admin'));
    }

    private function handleLicenseAction(string $action, int $shopId, array $payload = []): array
    {
        $proModule = $this->getProLicenseModule();
        if ($proModule instanceof Module && method_exists($proModule, 'handleCciLicenseAction')) {
            $response = $proModule->handleCciLicenseAction($action, $shopId, $payload);

            return is_array($response) ? $response : [
                'success' => false,
                'error' => $this->trans('CCI Nice Menu Pro returned an invalid license response.', [], 'Modules.CciNiceMenu.Admin'),
                'license' => $this->getRawLicensePayload($shopId),
            ];
        }

        return [
            'success' => false,
            'code' => 'cci_pro_module_missing',
            'errorCode' => 'cci_pro_module_missing',
            'warning' => $this->trans('Install and activate CCI Nice Menu Pro before managing a Pro license.', [], 'Modules.CciNiceMenu.Admin'),
            'license' => $this->getFreeLicensePayload($shopId, $this->trans('CCI Nice Menu Pro is not installed or not enabled.', [], 'Modules.CciNiceMenu.Admin')),
        ];
    }

    private function getProLicenseModule(): ?Module
    {
        if (!Module::isInstalled('cci_nice_menu_pro')) {
            return null;
        }

        if (method_exists(Module::class, 'isEnabled') && !Module::isEnabled('cci_nice_menu_pro')) {
            return null;
        }

        $module = Module::getInstanceByName('cci_nice_menu_pro');
        if ($module instanceof Module && !empty($module->active)) {
            if (method_exists($module, 'ensureIntegrationHooks')) {
                $module->ensureIntegrationHooks();
            }

            return $module;
        }

        return null;
    }

    private function getFreeLicensePayload(int $shopId, string $message = ''): array
    {
        $siteIdentity = CciSharedLicenseEnvironment::siteIdentity($this->currentLicenseSiteUrl());

        return [
            'status' => 'inactive',
            'label' => $this->trans('Free', [], 'Modules.CciNiceMenu.Admin'),
            'isActive' => false,
            'canUse' => false,
            'runtimeAllowed' => false,
            'locked' => false,
            'writeLocked' => false,
            'canManage' => false,
            'proModuleAvailable' => false,
            'product' => 'CCI Nice Menu',
            'productSlug' => 'cci-nice-menu',
            'productUrl' => self::PRODUCT_HOME_URL,
            'siteUrl' => $siteIdentity['site_url'],
            'domain' => $siteIdentity['domain'],
            'environment' => $siteIdentity['environment'],
            'features' => [],
            'enabledFeatures' => [],
            'availableFeatures' => [],
            'checkedAt' => 0,
            'message' => $message ?: $this->trans('Free features are available. Pro features require CCI Nice Menu Pro.', [], 'Modules.CciNiceMenu.Admin'),
            'source' => $this->name,
        ];
    }

    private function currentLicenseSiteUrl(): string
    {
        $shop = $this->context->shop ?? null;
        if (is_object($shop) && method_exists($shop, 'getBaseURL')) {
            $url = (string) ($shop->getBaseURL(true) ?? '');
            if ($url !== '') {
                return $url;
            }
        }

        return 'https://' . (string) Tools::getHttpHost();
    }

    private function featureMap(array $features): array
    {
        $map = [];
        foreach ($features as $feature) {
            if (!is_array($feature)) {
                continue;
            }

            $key = trim((string) ($feature['key'] ?? ''));
            if ($key !== '') {
                $map[$key] = $feature;
            }
        }

        return $map;
    }

    private function guardMenuFeatureAccess(array $payload, int $shopId, bool $isNew): ?array
    {
        $license = $this->getDecoratedLicensePayload($shopId);
        $features = $this->featureMap(is_array($license['availableFeatures'] ?? null) ? $license['availableFeatures'] : []);
        $requirements = $this->featureRegistry->getMenuPayloadRequiredFeatures(
            $payload,
            $this->core->countMenus($shopId),
            $isNew
        );

        if (!$isNew && !empty($license['writeLocked'])) {
            $existing = $this->core->getMenu($shopId, (int) ($payload['id_menu'] ?? 0));
            if ($existing) {
                $requirements = array_values(array_unique(array_merge($requirements, $this->featureRegistry->getMenuPayloadRequiredFeatures($existing))));
            }
        }

        if ($this->featureRegistry->requirementsMet($requirements, $features)) {
            return null;
        }

        $missingLabels = $this->featureRegistry->missingRequirementLabels($requirements, $features);

        return [
            'success' => false,
            'error' => $this->trans('This menu uses Pro features.', [], 'Modules.CciNiceMenu.Admin'),
            'details' => $this->trans('Install or activate CCI Nice Menu Pro to save:', [], 'Modules.CciNiceMenu.Admin') . ' ' . implode(', ', $missingLabels),
            'code' => 'ccinm_pro_feature_required',
            'errorCode' => 'ccinm_pro_feature_required',
            'requiredFeatures' => $requirements,
            'missingFeatures' => $missingLabels,
            'license' => $license,
            'features' => array_values($features),
            'enabledFeatures' => $license['enabledFeatures'] ?? [],
        ];
    }

    private function upsertTab(array $tabData): bool
    {
        $id = (int) Tab::getIdFromClassName($tabData['class_name']);
        $tab = $id > 0 ? new Tab($id) : new Tab();

        $tab->active = (int) ($tabData['active'] ?? 1);
        $tab->class_name = $tabData['class_name'];
        $tab->icon = (string) ($tabData['icon'] ?? '');
        $tab->id_parent = (int) Tab::getIdFromClassName($tabData['parent']);
        $tab->module = $this->name;

        foreach (Language::getLanguages(false) as $lang) {
            $tab->name[(int) $lang['id_lang']] = (string) $tabData['name'];
        }

        $saved = $id > 0 ? (bool) $tab->update() : (bool) $tab->add();
        if (!$saved) {
            return false;
        }

        if (isset($tabData['position'])) {
            $tab = new Tab((int) $tab->id);
            $desiredPosition = (int) $tabData['position'];
            if ((int) $tab->position !== $desiredPosition) {
                $tab->updatePosition((int) $tab->position < $desiredPosition, $desiredPosition);
            }
        }

        return true;
    }

    private function ensureCciParentTab(): int
    {
        $improveTabId = (int) Tab::getIdFromClassName('IMPROVE');
        if ($improveTabId <= 0) {
            return 0;
        }

        $tabId = (int) Tab::getIdFromClassName(self::ADMIN_PARENT_TAB_CLASS);
        $tab = $tabId > 0 ? new Tab($tabId) : new Tab();
        $tab->active = 1;
        $tab->class_name = self::ADMIN_PARENT_TAB_CLASS;
        $tab->id_parent = $improveTabId;
        $tab->icon = 'pets';
        $tab->module = '';

        foreach (Language::getLanguages(false) as $language) {
            $tab->name[(int) $language['id_lang']] = 'Cool Cat Ideas';
        }

        $saved = $tabId > 0 ? (bool) $tab->update() : (bool) $tab->add();
        if (!$saved) {
            return 0;
        }

        $modulesTabId = (int) Tab::getIdFromClassName('AdminParentModulesSf');
        if ($modulesTabId > 0) {
            $modulesTab = new Tab($modulesTabId);
            $tab = new Tab((int) $tab->id);
            if ((int) $modulesTab->id_parent === $improveTabId) {
                $desiredPosition = (int) $modulesTab->position + 1;
                if ((int) $tab->position !== $desiredPosition) {
                    $tab->updatePosition((int) $tab->position < $desiredPosition, $desiredPosition);
                }
            }
        }

        $tab->cleanPositions($improveTabId);

        return (int) $tab->id;
    }

    private function normalizeCciMenuPositions(int $parentId): bool
    {
        $tabs = Db::getInstance()->executeS(
            'SELECT `id_tab`, `class_name`, `position` FROM `' . _DB_PREFIX_ . 'tab`'
            . ' WHERE `id_parent` = ' . $parentId
        );
        if (!is_array($tabs)) {
            return false;
        }

        $priorities = [
            'AdminCciBlog' => 10,
            'AdminCciWithdrawal' => 20,
            'AdminCciConsentHistory' => 25,
            'AdminCciNiceMenu' => 30,
            'AdminCciCategoryGrid' => 40,
            'AdminCciCourierCashOnDelivery' => 50,
        ];
        usort($tabs, static function (array $left, array $right) use ($priorities): int {
            $leftPriority = $priorities[$left['class_name']] ?? 1000 + (int) $left['position'];
            $rightPriority = $priorities[$right['class_name']] ?? 1000 + (int) $right['position'];

            return $leftPriority <=> $rightPriority ?: (int) $left['id_tab'] <=> (int) $right['id_tab'];
        });

        foreach ($tabs as $index => $tabData) {
            if (!Db::getInstance()->update('tab', ['position' => $index + 1], 'id_tab = ' . (int) $tabData['id_tab'])) {
                return false;
            }
        }

        return true;
    }

    private function removeCciParentTabIfEmpty(): bool
    {
        $parentId = (int) Tab::getIdFromClassName(self::ADMIN_PARENT_TAB_CLASS);
        if ($parentId <= 0) {
            return true;
        }

        $remainingChildren = (int) Db::getInstance()->getValue(
            'SELECT COUNT(*) FROM `' . _DB_PREFIX_ . 'tab` WHERE `id_parent` = ' . $parentId
        );

        return $remainingChildren > 0 || (bool) (new Tab($parentId))->delete();
    }

    private function deleteTabs(array $classNames): void
    {
        foreach ($classNames as $className) {
            $id = (int) Tab::getIdFromClassName($className);
            if ($id > 0) {
                (new Tab($id))->delete();
            }
        }
    }

    public function hookActionAdminControllerSetMedia(array $params)
    {
        $version = (string) (@filemtime(__DIR__ . '/views/css/cci_nice_menu_admin.css') ?: $this->version);
        $this->context->controller->addCSS($this->getPathUri() . 'views/css/cci_nice_menu_admin.css?v=' . rawurlencode($version), 'all');
        $this->registerIconStylesheet($this->getModuleSettings());
    }

    public function hookActionFrontControllerSetMedia(array $params)
    {
        $settings = $this->getModuleSettings();
        $runtimeCssVersion = (string) (@filemtime(__DIR__ . '/views/css/cci_nice_menu_front_runtime.css') ?: $this->version);
        $jsVersion = (string) (@filemtime(__DIR__ . '/views/js/cci_nice_menu_front.js') ?: $this->version);

        if (!empty($settings['frontendCss'])) {
            $this->context->controller->addCSS($this->getPathUri() . 'views/css/cci_nice_menu_front_runtime.css?v=' . rawurlencode($runtimeCssVersion), 'all');
            if (method_exists($this->context->controller, 'registerStylesheet')) {
                $this->context->controller->registerStylesheet(
                    'cci-nice-menu-front-runtime',
                    'modules/' . $this->name . '/views/css/cci_nice_menu_front_runtime.css?v=' . rawurlencode($runtimeCssVersion),
                    ['media' => 'all', 'priority' => 141]
                );
            }
        }

        $this->registerIconStylesheet($settings);

        if (!empty($settings['frontendJs'])) {
            $this->context->controller->addJS($this->getPathUri() . 'views/js/cci_nice_menu_front.js?v=' . rawurlencode($jsVersion));
            $this->context->controller->registerJavascript(
                'cci-nice-menu-front',
                'modules/' . $this->name . '/views/js/cci_nice_menu_front.js?v=' . rawurlencode($jsVersion),
                ['position' => 'bottom', 'priority' => 140]
            );
        }
    }

    public function __call(string $name, array $arguments = [])
    {
        if (str_starts_with($name, 'hookDisplay')) {
            $rawName = substr($name, 10);
            if ($rawName === '') {
                return '';
            }

            $hookName = lcfirst($rawName);
            if (!preg_match('/^[A-Za-z][A-Za-z0-9_]{0,63}$/', $hookName)) {
                return '';
            }

            return $this->renderMenuForHook($hookName);
        }

        return '';
    }

    public function hookDisplayTop(array $params)
    {
        return $this->renderMenuForHook('displayTop');
    }

    public function hookDisplayNav1(array $params)
    {
        return $this->renderMenuForHook('displayNav1');
    }

    public function hookDisplayNav2(array $params)
    {
        return $this->renderMenuForHook('displayNav2');
    }

    public function hookDisplayNavFullWidth(array $params)
    {
        return $this->renderMenuForHook('displayNavFullWidth');
    }

    public function hookDisplayCciNiceMenuFeatures(array $params): array
    {
        return [];
    }

    public function hookDisplayCciNiceMenuAdminExtensions(array $params): array
    {
        return [];
    }

    private function renderMenuForHook(string $hookName): string
    {
        $menu = $this->core->getActiveMenu((int) $this->context->shop->id, $hookName);
        if (!$menu) {
            return '';
        }

        $cacheKey = 'hook-' . $hookName . '-shop-' . (int) $this->context->shop->id . '-menu-' . (int) $menu['id_menu'];
        if (isset(self::$renderCache[$cacheKey])) {
            return self::$renderCache[$cacheKey];
        }

        $license = $this->getRawLicensePayload((int) $this->context->shop->id);
        $features = $this->featureRegistry->getFeatures($license, true);
        $runtimePayload = $this->featureRegistry->prepareMenuForRuntime([
            'hook_name' => $hookName,
            'settings' => is_array($menu['settings'] ?? null) ? $menu['settings'] : $this->core->getDefaultSettings(),
            'tree' => is_array($menu['tree'] ?? null) ? $menu['tree'] : [],
        ], $features);
        if ($runtimePayload === null) {
            self::$renderCache[$cacheKey] = '';

            return '';
        }

        $settings = is_array($runtimePayload['settings'] ?? null) ? $runtimePayload['settings'] : $this->core->getDefaultSettings();
        $tree = is_array($runtimePayload['tree'] ?? null) ? $runtimePayload['tree'] : [];

        $moduleSettings = $this->getModuleSettings();
        $html = $this->core->buildMenuMarkup($tree, 0, $settings, [
            'iconLibrary' => (string) ($moduleSettings['iconLibrary'] ?? 'none'),
        ]);
        $layout = (string) ($settings['layout'] ?? 'classic');
        $containerMode = (string) ($settings['container_mode'] ?? 'boxed');
        $animation = (string) ($settings['animation'] ?? 'fade');
        $theme = (string) ($settings['theme'] ?? 'night-glass');
        $topLevelLayout = (string) ($settings['top_level_layout'] ?? 'flow');
        if (!in_array($topLevelLayout, ['flow', 'grid'], true)) {
            $topLevelLayout = 'flow';
        }
        $topIconMode = (string) ($settings['top_level_icon_mode'] ?? 'first');
        if (!in_array($topIconMode, ['all', 'first', 'none'], true)) {
            $topIconMode = 'first';
        }
        $mobileBreakpoint = max(600, min(1400, (int) ($settings['mobile_breakpoint'] ?? 900)));
        $hookClassSuffix = $this->sanitizeCssClassSuffix($hookName);
        $navId = 'cci-nice-menu-nav-' . $hookClassSuffix;
        $mobileMenuId = 'cci-nice-menu-mobile-menu-' . $hookClassSuffix;
        $rootClass = 'cci-nice-menu-root cci-nice-menu-layout-' . $this->sanitizeCssClassSuffix($layout);
        $rootClass .= ' cci-nice-menu-width-' . $this->sanitizeCssClassSuffix($containerMode);
        $rootClass .= !empty($settings['show_shadow']) ? ' cci-nice-menu-shadow' : '';
        $rootClass .= ' cci-nice-menu-animation-' . $this->sanitizeCssClassSuffix($animation);
        $rootClass .= ' cci-nice-menu-theme-' . $this->sanitizeCssClassSuffix($theme);
        $rootClass .= ' cci-nice-menu-top-layout-' . $topLevelLayout;
        $rootClass .= ' cci-nice-menu-top-icons-' . $topIconMode;
        $rootStyle = sprintf(
            '--cci-nice-menu-container-width:%dpx; --cci-nice-menu-columns:%d; --cci-nice-menu-mobile-breakpoint:%dpx; --cci-nice-menu-item-gap:%dpx;'
            . ' --cci-nice-menu-accent:%s; --cci-nice-menu-brand:%s; --cci-nice-menu-showcase-blue:%s; --cci-nice-menu-showcase-heading-accent:%s; --cci-nice-menu-tabs-hover-text:%s;'
            . ' --cci-nice-menu-accent-strong:%s; --cci-nice-menu-brand-hover:%s; --cci-nice-menu-showcase-blue-strong:%s; --cci-nice-menu-showcase-link-hover:%s;'
            . ' --cci-nice-menu-accent-soft:%s; --cci-nice-menu-brand-soft:%s; --cci-nice-menu-showcase-blue-soft:%s; --cci-nice-menu-ref-hover:%s; --cci-nice-menu-tabs-hover-bg:%s;'
            . ' --cci-nice-menu-accent-wash:%s; --cci-nice-menu-showcase-blue-wash:%s;'
            . ' --cci-nice-menu-text:%s; --cci-nice-menu-ink:%s; --cci-nice-menu-ref-text:%s;'
            . ' --cci-nice-menu-muted:%s; --cci-nice-menu-icon-color:%s;'
            . ' --cci-nice-menu-surface:%s;'
            . ' --cci-nice-menu-surface-soft:%s; --cci-nice-menu-soft:%s;'
            . ' --cci-nice-menu-border:%s; --cci-nice-menu-showcase-heading-line:%s;'
            . ' --cci-nice-menu-border-strong:%s; --cci-nice-menu-showcase-blue-border:%s; --cci-nice-menu-tabs-hover-border:%s;'
            . ' --cci-nice-menu-showcase-heading-text:%s; --cci-nice-menu-heading:%s;'
            . ' --cci-nice-menu-video-bg:%s; --cci-nice-menu-video-border:%s;',
            (int) ($settings['container_width'] ?? 1320),
            (int) ($settings['columns'] ?? 6),
            $mobileBreakpoint,
            (int) ($settings['item_gap'] ?? 8),
            (string) ($settings['color_accent'] ?? '#0d6efd'),
            (string) ($settings['color_accent'] ?? '#0d6efd'),
            (string) ($settings['color_accent'] ?? '#0d6efd'),
            (string) ($settings['color_accent'] ?? '#0d6efd'),
            (string) ($settings['color_accent'] ?? '#0d6efd'),
            (string) ($settings['color_accent_hover'] ?? '#0753d8'),
            (string) ($settings['color_accent_hover'] ?? '#0753d8'),
            (string) ($settings['color_accent_hover'] ?? '#0753d8'),
            (string) ($settings['color_accent_hover'] ?? '#0753d8'),
            (string) ($settings['color_accent_soft'] ?? '#f3f8ff'),
            (string) ($settings['color_accent_soft'] ?? '#f3f8ff'),
            (string) ($settings['color_accent_soft'] ?? '#f3f8ff'),
            (string) ($settings['color_accent_soft'] ?? '#f3f8ff'),
            (string) ($settings['color_accent_soft'] ?? '#f3f8ff'),
            (string) ($settings['color_accent_wash'] ?? '#eaf4ff'),
            (string) ($settings['color_accent_wash'] ?? '#eaf4ff'),
            (string) ($settings['color_text'] ?? '#111827'),
            (string) ($settings['color_text'] ?? '#111827'),
            (string) ($settings['color_text'] ?? '#111827'),
            (string) ($settings['color_muted'] ?? '#64748b'),
            (string) ($settings['color_icon'] ?? $settings['color_accent'] ?? '#0d6efd'),
            (string) ($settings['color_surface'] ?? '#ffffff'),
            (string) ($settings['color_surface_soft'] ?? '#f8fbff'),
            (string) ($settings['color_surface_soft'] ?? '#f8fbff'),
            (string) ($settings['color_border'] ?? '#dbe7f3'),
            (string) ($settings['color_border'] ?? '#dbe7f3'),
            (string) ($settings['color_border_strong'] ?? '#bfdbfe'),
            (string) ($settings['color_border_strong'] ?? '#bfdbfe'),
            (string) ($settings['color_border_strong'] ?? '#bfdbfe'),
            (string) ($settings['color_heading'] ?? '#112445'),
            (string) ($settings['color_heading'] ?? '#112445'),
            (string) ($settings['color_video_bg'] ?? '#172554'),
            (string) ($settings['color_video_border'] ?? '#1d4ed8')
        );

        $this->context->smarty->assign([
            'menuMarkup' => $html,
            'menuName' => $menu['name'],
            'menuHook' => $hookName,
            'navId' => $navId,
            'mobileMenuId' => $mobileMenuId,
            'mobileBreakpoint' => $mobileBreakpoint,
            'desktopBreakpoint' => $mobileBreakpoint + 0.02,
            'menuLayoutClass' => $rootClass,
            'menuStyle' => $rootStyle,
            'menuOpenOn' => (string) ($settings['open_on'] ?? 'click'),
        ]);

        $rendered = $this->display(__FILE__, 'views/templates/hook/desktop-nav.tpl');
        if (!self::$frontAssetsInjected) {
            self::$frontAssetsInjected = true;
            $extensionAssets = $this->getFrontExtensionAssetTags($hookName, $menu);
            $rendered = $this->getFrontCssTag($moduleSettings)
              . $this->getIconCssTag($moduleSettings)
              . $extensionAssets['styles']
              . $rendered
              . $extensionAssets['scripts']
              . $this->getFrontJsTag($moduleSettings);
        }
        self::$renderCache[$cacheKey] = $rendered;

        return $rendered;
    }

    private function getFrontCssTag(array $settings): string
    {
        if (empty($settings['frontendCss'])) {
            return '';
        }

        $runtimeVersion = (string) (@filemtime(__DIR__ . '/views/css/cci_nice_menu_front_runtime.css') ?: $this->version);
        $runtimeHref = $this->getPathUri() . 'views/css/cci_nice_menu_front_runtime.css?v=' . rawurlencode($runtimeVersion);

        return '<link rel="stylesheet" href="' . Tools::safeOutput($runtimeHref) . '" media="all">' . "\n";
    }

    private function getFrontJsTag(array $settings): string
    {
        if (empty($settings['frontendJs'])) {
            return '';
        }

        $version = (string) (@filemtime(__DIR__ . '/views/js/cci_nice_menu_front.js') ?: $this->version);
        $src = $this->getPathUri() . 'views/js/cci_nice_menu_front.js?v=' . rawurlencode($version);

        return "\n" . '<script src="' . Tools::safeOutput($src) . '"></script>';
    }

    private function getIconCssTag(array $settings): string
    {
        $asset = $this->getIconStylesheetAsset($settings);
        if (!$asset) {
            return '';
        }

        return '<link rel="stylesheet" href="' . Tools::safeOutput($asset['url']) . '" media="all">' . "\n";
    }

    private function getFrontExtensionAssetTags(string $hookName, array $menu): array
    {
        $raw = Hook::exec('displayCciNiceMenuFrontAssets', [
            'hook_name' => $hookName,
            'shop_id' => (int) $this->context->shop->id,
            'menu' => $menu,
            'module' => $this->name,
        ], null, true);

        $styles = [];
        $scripts = [];
        foreach ((array) $raw as $moduleAssets) {
            $assets = is_array($moduleAssets) ? $moduleAssets : [];
            foreach ((array) ($assets['styles'] ?? []) as $style) {
                $href = is_array($style) ? (string) ($style['href'] ?? '') : (string) $style;
                if ($href === '') {
                    continue;
                }

                $media = is_array($style) ? (string) ($style['media'] ?? 'all') : 'all';
                $styles[] = '<link rel="stylesheet" href="' . Tools::safeOutput($href) . '" media="' . Tools::safeOutput($media) . '">';
            }

            foreach ((array) ($assets['scripts'] ?? []) as $script) {
                $src = is_array($script) ? (string) ($script['src'] ?? '') : (string) $script;
                if ($src === '') {
                    continue;
                }

                $scripts[] = '<script src="' . Tools::safeOutput($src) . '"></script>';
            }
        }

        return [
            'styles' => empty($styles) ? '' : implode("\n", array_unique($styles)) . "\n",
            'scripts' => empty($scripts) ? '' : "\n" . implode("\n", array_unique($scripts)),
        ];
    }

    private function registerIconStylesheet(array $settings): void
    {
        $asset = $this->getIconStylesheetAsset($settings);
        if (!$asset) {
            return;
        }

        $this->context->controller->addCSS($asset['url'], 'all');
        if (empty($asset['remote']) && method_exists($this->context->controller, 'registerStylesheet')) {
            $this->context->controller->registerStylesheet(
                'cci-nice-menu-icons-' . $this->sanitizeCssClassSuffix((string) $asset['library']),
                $asset['relative'],
                ['media' => 'all', 'priority' => 141]
            );
        }
    }

    private function sanitizeCssClassSuffix(string $value): string
    {
        $value = strtolower(trim($value));
        $value = (string) preg_replace('/[^a-z0-9]+/', '-', $value);

        return trim($value, '-');
    }

    private function getIconStylesheetAsset(array $settings): ?array
    {
        $library = (string) ($settings['iconLibrary'] ?? 'none');
        $source = (string) ($settings['iconSource'] ?? 'local');

        if (!in_array($library, ['fontawesome', 'tabler'], true)) {
            return null;
        }

        if ($source === 'cdn') {
            return [
                'library' => $library,
                'remote' => true,
                'relative' => '',
                'url' => $library === 'fontawesome'
                  ? 'https://use.fontawesome.com/releases/v6.7.2/css/all.css'
                  : 'https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@3.35.0/dist/tabler-icons.min.css',
            ];
        }

        $relative = $library === 'fontawesome'
          ? 'modules/' . $this->name . '/views/vendor/fontawesome/css/all.min.css'
          : 'modules/' . $this->name . '/views/vendor/tabler/tabler-icons.min.css';
        $localPath = _PS_ROOT_DIR_ . '/' . $relative;

        if (!is_file($localPath)) {
            return null;
        }

        $version = (string) (@filemtime($localPath) ?: $this->version);

        return [
            'library' => $library,
            'remote' => false,
            'relative' => $relative . '?v=' . rawurlencode($version),
            'url' => $this->getPathUri() . str_replace('modules/' . $this->name . '/', '', $relative) . '?v=' . rawurlencode($version),
        ];
    }

    private function handleAjaxRequest()
    {
        header('Content-Type: application/json; charset=utf-8');
        if (
            !Validate::isLoadedObject($this->context->employee)
            || !$this->isValidAdminToken((string) Tools::getValue('token', ''))
        ) {
            exit(json_encode(['success' => false, 'error' => 'Unauthorized'], JSON_UNESCAPED_UNICODE));
        }

        $action = (string) Tools::getValue('ajaxAction', '');
        $payload = $this->getJsonPayload();
        $permission = match ($action) {
            'menus:list', 'layouts:list', 'module-settings:get', 'catalog:categories',
            'catalog:products', 'catalog:cms_pages', 'blog:posts', 'blog:categories',
            'media:list', 'menu:get', 'menu:export', 'multistore:context', 'license:get' => 'view',
            'menu:save' => (int) ($payload['id_menu'] ?? 0) > 0 ? 'edit' : 'add',
            'menu:import', 'multistore:menu:copy-shops' => 'add',
            'menu:delete' => 'delete',
            default => 'edit',
        };
        $controller = $this->context->controller;
        $allowed = $controller instanceof AdminController
            ? $controller->access('view') && $controller->access($permission)
            : $controller instanceof \PrestaShop\PrestaShop\Core\Context\LegacyControllerContext
                && $this->getPermission($permission === 'view' ? 'view' : 'configure');
        if (!$allowed || ($permission !== 'view' && ($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST')
            || !$this->context->employee->hasAuthOnShop((int) $this->context->shop->id)) {
            http_response_code(403);
            exit(json_encode(['success' => false, 'error' => 'Unauthorized'], JSON_UNESCAPED_UNICODE));
        }
        $shopId = (int) $this->context->shop->id;
        $response = ['success' => false];
        $this->ensureIntegrationHooks();

        if ($action === 'menus:list') {
            $response = [
                'success' => true,
                'menus' => $this->core->getMenus($shopId),
            ];
        } elseif ($action === 'layouts:list') {
            $response = [
                'success' => true,
                'layouts' => $this->core->getPresetLayouts(),
            ];
        } elseif ($action === 'module-settings:get') {
            $response = [
                'success' => true,
                'settings' => $this->getModuleSettings(),
            ];
        } elseif ($action === 'module-settings:save') {
            $payload = $this->getJsonPayload();
            $response = $this->saveModuleSettings(is_array($payload) ? $payload : []);
        } elseif ($action === 'catalog:categories') {
            $payload = $this->getJsonPayload();
            $query = is_array($payload) ? (string) ($payload['query'] ?? '') : (string) Tools::getValue('query', '');
            $response = [
                'success' => true,
                'items' => $this->searchCategories($shopId, $query),
            ];
        } elseif ($action === 'catalog:products') {
            $payload = $this->getJsonPayload();
            $query = is_array($payload) ? (string) ($payload['query'] ?? '') : (string) Tools::getValue('query', '');
            $response = [
                'success' => true,
                'items' => $this->searchProducts($shopId, $query),
            ];
        } elseif ($action === 'catalog:cms_pages') {
            $payload = $this->getJsonPayload();
            $query = is_array($payload) ? (string) ($payload['query'] ?? '') : (string) Tools::getValue('query', '');
            $response = [
                'success' => true,
                'items' => $this->searchCmsPages($shopId, $query),
            ];
        } elseif ($action === 'blog:posts') {
            $payload = $this->getJsonPayload();
            $query = is_array($payload) ? (string) ($payload['query'] ?? '') : (string) Tools::getValue('query', '');
            $response = [
                'success' => true,
                'items' => $this->searchBlogPosts($shopId, $query),
            ];
        } elseif ($action === 'blog:categories') {
            $payload = $this->getJsonPayload();
            $query = is_array($payload) ? (string) ($payload['query'] ?? '') : (string) Tools::getValue('query', '');
            $response = [
                'success' => true,
                'items' => $this->searchBlogCategories($shopId, $query),
            ];
        } elseif ($action === 'media:list') {
            $payload = $this->getJsonPayload();
            $response = $this->getLocalMediaLibraryPayload($shopId, is_array($payload) ? $payload : []);
        } elseif ($action === 'menu:get') {
            $menuId = (int) Tools::getValue('id_menu', 0);
            $menu = $this->core->getMenu((int) $this->context->shop->id, $menuId);
            $response = ['success' => (bool) $menu];
            if ($menu) {
                $response['menu'] = $menu;
            }
        } elseif ($action === 'menu:export') {
            $menuId = (int) Tools::getValue('id_menu', 0);
            $menu = $this->core->getMenu($shopId, $menuId);
            if (!$menu) {
                $response = ['success' => false, 'error' => $this->trans('Menu not found', [], 'Modules.CciNiceMenu.Admin')];
            } else {
                $response = ['success' => true, 'menu' => $menu];
            }
        } elseif ($action === 'menu:save') {
            $payload = $this->getJsonPayload();
            if (!is_array($payload)) {
                $response = ['success' => false, 'error' => 'Bad payload'];
            } else {
                $featureGuard = $this->guardMenuFeatureAccess($payload, $shopId, (int) ($payload['id_menu'] ?? 0) <= 0);
                $response = $featureGuard ?: $this->core->saveMenu($shopId, $payload);
            }
            if (($response['success'] ?? false) === true) {
                $this->clearRenderCache();
            }
        } elseif ($action === 'menu:import') {
            $payload = $this->getJsonPayload();
            if (!is_array($payload)) {
                $response = ['success' => false, 'error' => $this->trans('Invalid import payload', [], 'Modules.CciNiceMenu.Admin')];
            } else {
                if (isset($payload['menu']) && is_array($payload['menu'])) {
                    $payload = $payload['menu'];
                }
                $payload['id_menu'] = 0;
                if (empty($payload['name'])) {
                    $payload['name'] = 'Imported menu';
                }
                if (!isset($payload['is_active'])) {
                    $payload['is_active'] = 1;
                }
                $featureGuard = $this->guardMenuFeatureAccess($payload, $shopId, true);
                $response = $featureGuard ?: $this->core->saveMenu($shopId, $payload);
            }
            if (($response['success'] ?? false) === true) {
                $this->clearRenderCache();
            }
        } elseif ($action === 'menu:delete') {
            $payload = $this->getJsonPayload();
            if (is_array($payload) && isset($payload['id_menu'])) {
                $menuId = (int) $payload['id_menu'];
            } else {
                $menuId = (int) Tools::getValue('id_menu', 0);
            }
            $response = $this->core->deleteMenu($shopId, $menuId);
            if (($response['success'] ?? false) === true) {
                $this->clearRenderCache();
            }
        } elseif ($action === 'multistore:context') {
            $response = ['success' => true, 'multistore' => $this->getMultistoreContext($shopId)];
        } elseif ($action === 'multistore:menu:copy-shops') {
            $payload = $this->getJsonPayload();
            $response = $this->handleMultistoreAction('menu:copy-shops', $shopId, is_array($payload) ? $payload : []);
            if (($response['success'] ?? false) === true) {
                $this->clearRenderCache();
            }
        } elseif ($action === 'license:get') {
            $license = $this->getDecoratedLicensePayload($shopId);
            $response = [
                'success' => true,
                'license' => $license,
                'features' => $license['availableFeatures'] ?? [],
                'enabledFeatures' => $license['enabledFeatures'] ?? [],
            ];
        } elseif ($action === 'license:activate') {
            $payload = $this->getJsonPayload();
            $response = $this->decorateLicenseResponse($this->handleLicenseAction($action, $shopId, is_array($payload) ? $payload : []), $shopId);
        } elseif ($action === 'license:check') {
            $response = $this->decorateLicenseResponse($this->handleLicenseAction($action, $shopId), $shopId);
        } elseif ($action === 'license:deactivate') {
            $response = $this->decorateLicenseResponse($this->handleLicenseAction($action, $shopId), $shopId);
        } elseif ($action === 'review-feedback:save') {
            $payload = $this->getJsonPayload();
            $response = $this->saveReviewFeedback(is_array($payload) ? $payload : []);
        } else {
            $response = ['success' => false, 'error' => 'Unknown action'];
        }

        exit(json_encode($response, JSON_UNESCAPED_UNICODE));
    }

    private function getMultistoreContext(int $shopId): array
    {
        $proModule = Module::getInstanceByName(self::PRO_MODULE_NAME);
        if ($proModule instanceof Module && method_exists($proModule, 'getCciMultistoreContext')) {
            return (array) $proModule->getCciMultistoreContext($shopId);
        }

        return [
            'enabled' => false,
            'featureActive' => class_exists('Shop') && Shop::isFeatureActive(),
            'currentShopId' => $shopId,
            'shops' => [],
        ];
    }

    private function saveReviewFeedback(array $payload): array
    {
        $rating = (int) ($payload['rating'] ?? 0);
        if ($rating < 1 || $rating > 5) {
            return [
                'success' => false,
                'error' => $this->trans('Please select a rating before saving feedback.', [], 'Modules.CciNiceMenu.Admin'),
            ];
        }

        $reviewConsent = is_array($payload['reviewConsent'] ?? null) ? $payload['reviewConsent'] : [];
        $consentContent = trim(strip_tags((string) ($reviewConsent['content'] ?? '')));
        $consentContent = function_exists('mb_substr')
          ? mb_substr($consentContent, 0, 2000)
          : substr($consentContent, 0, 2000);
        if (($reviewConsent['accepted'] ?? false) !== true || $consentContent === '') {
            return [
                'success' => false,
                'error' => $this->trans('Please accept the required consent before sending your review.', [], 'Modules.CciNiceMenu.Admin'),
            ];
        }

        $comment = trim(strip_tags((string) ($payload['comment'] ?? '')));
        $comment = function_exists('mb_substr')
          ? mb_substr($comment, 0, 1200)
          : substr($comment, 0, 1200);
        $section = preg_replace('/[^a-z0-9_-]+/i', '', (string) ($payload['section'] ?? 'dashboard')) ?: 'dashboard';
        $siteUrl = $this->context->shop instanceof Shop
          ? $this->context->shop->getBaseURL(true)
          : Tools::getShopDomainSsl(true);
        $entry = [
            'productSlug' => self::MARKETPLACE_PRODUCT_SLUG,
            'rating' => $rating,
            'body' => $comment,
            'comment' => $comment,
            'section' => $section,
            'platform' => 'prestashop',
            'submissionContext' => 'module-admin',
            'moduleVersion' => (string) $this->version,
            'siteUrl' => $siteUrl,
            'locale' => (string) ($this->context->language->iso_code ?? 'en'),
            'environment' => $this->isDevelopmentSite($siteUrl) ? 'staging' : 'production',
            'reviewConsent' => [
                'accepted' => true,
                'codeName' => preg_replace('/[^a-zA-Z0-9_-]+/', '', (string) ($reviewConsent['codeName'] ?? '')),
                'content' => $consentContent,
                'locale' => preg_replace('/[^a-zA-Z_-]+/', '', (string) ($reviewConsent['locale'] ?? 'en')),
                'version' => (int) ($reviewConsent['version'] ?? 0),
            ],
        ];
        $entry['idempotencyKey'] = hash(
            'sha256',
            implode('|', [
                self::MARKETPLACE_PRODUCT_SLUG,
                $siteUrl,
                (string) $rating,
                $comment,
                $section,
                (string) floor(time() / 600),
            ])
        );
        $remote = $this->postProductFeedback($entry);

        if (!($remote['ok'] ?? false)) {
            return [
                'success' => false,
                'error' => $this->trans('Feedback could not be sent. Please try again.', [], 'Modules.CciNiceMenu.Admin'),
                'details' => (string) ($remote['error'] ?? ''),
            ];
        }

        return [
            'success' => true,
            'message' => $this->trans('Thank you for your feedback.', [], 'Modules.CciNiceMenu.Admin'),
            'feedback' => [
                'id' => $remote['id'] ?? null,
                'status' => $remote['status'] ?? 'pending',
            ],
        ];
    }

    private function postProductFeedback(array $payload): array
    {
        $endpoint = $this->getMarketplaceApiBase() . '/api/product-reviews/submit';
        $body = json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        if ($body === false) {
            return ['ok' => false, 'error' => 'Feedback payload could not be encoded.'];
        }

        $statusCode = 0;
        $responseBody = false;

        if (function_exists('curl_init')) {
            $handle = curl_init($endpoint);
            curl_setopt_array($handle, [
                CURLOPT_POST => true,
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_CONNECTTIMEOUT => 5,
                CURLOPT_TIMEOUT => 10,
                CURLOPT_FOLLOWLOCATION => true,
                CURLOPT_MAXREDIRS => 3,
                CURLOPT_HTTPHEADER => ['Accept: application/json', 'Content-Type: application/json'],
                CURLOPT_POSTFIELDS => $body,
            ]);
            $responseBody = curl_exec($handle);
            $statusCode = (int) curl_getinfo($handle, CURLINFO_HTTP_CODE);
            $transportError = curl_error($handle);
            curl_close($handle);

            if ($responseBody === false) {
                return ['ok' => false, 'error' => $transportError ?: 'Feedback service is unavailable.'];
            }
        } else {
            $context = stream_context_create([
                'http' => [
                    'method' => 'POST',
                    'header' => "Accept: application/json\r\nContent-Type: application/json\r\n",
                    'content' => $body,
                    'ignore_errors' => true,
                    'timeout' => 10,
                ],
            ]);
            $responseBody = @file_get_contents($endpoint, false, $context);
            foreach ((array) ($http_response_header ?? []) as $header) {
                if (preg_match('/^HTTP\/\S+\s+(\d{3})/', $header, $matches)) {
                    $statusCode = (int) $matches[1];
                    break;
                }
            }
        }

        $decoded = is_string($responseBody) ? json_decode($responseBody, true) : null;
        if ($statusCode < 200 || $statusCode >= 300 || !is_array($decoded) || !($decoded['ok'] ?? false)) {
            return [
                'ok' => false,
                'error' => is_array($decoded) && isset($decoded['error'])
                  ? (string) $decoded['error']
                  : 'Feedback service returned an invalid response.',
            ];
        }

        return $decoded;
    }

    private function isDevelopmentSite(string $siteUrl): bool
    {
        $host = strtolower((string) parse_url($siteUrl, PHP_URL_HOST));

        return $host === 'localhost'
          || $host === '127.0.0.1'
          || $host === '::1'
          || (bool) preg_match('/\.(?:test|local)$/', $host);
    }

    private function handleMultistoreAction(string $action, int $shopId, array $payload): array
    {
        $proModule = Module::getInstanceByName(self::PRO_MODULE_NAME);
        if (!$proModule instanceof Module || !method_exists($proModule, 'handleCciMultistoreAction')) {
            return ['success' => false, 'error' => $this->trans('CCI Nice Menu Pro with Multistore is required.', [], 'Modules.CciNiceMenu.Admin')];
        }

        return (array) $proModule->handleCciMultistoreAction($action, $shopId, $payload);
    }

    private function getLocalMediaLibraryPayload(int $shopId, array $payload): array
    {
        $proModule = Module::getInstanceByName('cci_nice_menu_pro');
        if (!$proModule instanceof Module || !method_exists($proModule, 'handleCciLocalMediaLibraryAction')) {
            return ['success' => false, 'error' => $this->trans('CCI Nice Menu Pro is required to browse local images.', [], 'Modules.CciNiceMenu.Admin')];
        }

        return (array) $proModule->handleCciLocalMediaLibraryAction($shopId, $payload);
    }

    private function isValidAdminToken(string $token): bool
    {
        if ($token === '') {
            return false;
        }

        // Symfony masks CSRF tokens with fresh randomness. Validate the submitted
        // request through PrestaShop instead of comparing it with a new token.
        $container = PrestaShop\PrestaShop\Adapter\SymfonyContainer::getInstance();
        if ($container !== null) {
            return $container->get(PrestaShopBundle\Security\Admin\UserTokenManager::class)->isTokenValid();
        }

        // Legacy contexts without Symfony still use deterministic admin tokens.
        foreach (['AdminModules', 'AdminCciNiceMenu', 'AdminCciNiceMenuConfiguration'] as $controller) {
            if (hash_equals(Tools::getAdminTokenLite($controller), $token)) {
                return true;
            }
        }

        return false;
    }

    private function getJsonPayload(): ?array
    {
        $raw = trim((string) file_get_contents('php://input'));
        if ($raw === '') {
            return null;
        }

        $decoded = json_decode($raw, true);
        if (json_last_error() !== JSON_ERROR_NONE) {
            return null;
        }

        return is_array($decoded) ? $decoded : null;
    }

    private function clearRenderCache(): void
    {
        self::$renderCache = [];
    }

    private function searchCategories(int $shopId, string $query): array
    {
        $query = trim($query);
        $langId = (int) $this->context->language->id;
        $where = 'c.active = 1 AND c.id_category > 1 AND cs.id_shop = ' . (int) $shopId . ' AND cl.id_shop = ' . (int) $shopId . ' AND cl.id_lang = ' . (int) $langId;

        if ($query !== '') {
            $where .= ' AND cl.name LIKE \'%' . pSQL($query) . '%\'';
        }

        $rows = Db::getInstance()->executeS(
            'SELECT c.id_category, c.id_parent, c.level_depth, cl.name, cl.link_rewrite, COUNT(DISTINCT ps.id_product) AS product_count
       FROM `' . _DB_PREFIX_ . 'category` c
       INNER JOIN `' . _DB_PREFIX_ . 'category_shop` cs ON (cs.id_category = c.id_category)
       INNER JOIN `' . _DB_PREFIX_ . 'category_lang` cl ON (cl.id_category = c.id_category)
       LEFT JOIN `' . _DB_PREFIX_ . 'category_product` cp ON (cp.id_category = c.id_category)
       LEFT JOIN `' . _DB_PREFIX_ . 'product_shop` ps ON (ps.id_product = cp.id_product AND ps.id_shop = ' . (int) $shopId . ' AND ps.active = 1)
       WHERE ' . $where . '
       GROUP BY c.id_category, c.id_parent, c.level_depth, cl.name, cl.link_rewrite
       ORDER BY c.level_depth ASC, c.position ASC, cl.name ASC
       LIMIT 300'
        );

        return array_map(function (array $row) use ($shopId, $langId): array {
            $categoryId = (int) $row['id_category'];

            return [
                'id' => $categoryId,
                'parent_id' => (int) $row['id_parent'],
                'type' => 'category',
                'name' => (string) $row['name'],
                'url' => $this->context->link->getCategoryLink($categoryId, (string) $row['link_rewrite'], $langId, null, $shopId),
                'level' => (int) $row['level_depth'],
                'product_count' => (int) ($row['product_count'] ?? 0),
            ];
        }, is_array($rows) ? $rows : []);
    }

    private function searchProducts(int $shopId, string $query): array
    {
        $query = trim($query);
        $langId = (int) $this->context->language->id;
        $where = 'ps.active = 1 AND ps.id_shop = ' . (int) $shopId . ' AND pl.id_shop = ' . (int) $shopId . ' AND pl.id_lang = ' . (int) $langId;

        if ($query !== '') {
            $where .= ' AND (pl.name LIKE \'%' . pSQL($query) . '%\' OR p.reference LIKE \'%' . pSQL($query) . '%\')';
        }
        $orderBy = $query === '' ? 'p.date_add DESC, p.id_product DESC' : 'pl.name ASC';

        $rows = Db::getInstance()->executeS(
            'SELECT p.id_product, p.reference, ps.id_category_default, pl.name, pl.link_rewrite, MAX(image_shop.id_image) AS id_image
       FROM `' . _DB_PREFIX_ . 'product` p
       INNER JOIN `' . _DB_PREFIX_ . 'product_shop` ps ON (ps.id_product = p.id_product)
       INNER JOIN `' . _DB_PREFIX_ . 'product_lang` pl ON (pl.id_product = p.id_product)
       LEFT JOIN `' . _DB_PREFIX_ . 'image` image ON (image.id_product = p.id_product)
       LEFT JOIN `' . _DB_PREFIX_ . 'image_shop` image_shop ON (image_shop.id_image = image.id_image AND image_shop.id_shop = ' . (int) $shopId . ' AND image_shop.cover = 1)
       WHERE ' . $where . '
       GROUP BY p.id_product, p.reference, ps.id_category_default, pl.name, pl.link_rewrite
       ORDER BY ' . $orderBy . '
       LIMIT 50'
        );

        return array_map(function (array $row) use ($shopId, $langId): array {
            $productId = (int) $row['id_product'];
            $imageId = (int) ($row['id_image'] ?? 0);

            return [
                'id' => $productId,
                'type' => 'product',
                'name' => (string) $row['name'],
                'reference' => (string) ($row['reference'] ?? ''),
                'price' => (string) Tools::getContextLocale($this->context)->formatPrice(Product::getPriceStatic($productId, true), $this->context->currency->iso_code),
                'image_url' => $imageId > 0 ? (string) $this->context->link->getImageLink((string) $row['link_rewrite'], $productId . '-' . $imageId, 'home_default') : '',
                'url' => $this->context->link->getProductLink(
                    $productId,
                    (string) $row['link_rewrite'],
                    null,
                    null,
                    $langId,
                    $shopId,
                    0,
                    false,
                    false,
                    true
                ),
                'category_id' => (int) $row['id_category_default'],
            ];
        }, is_array($rows) ? $rows : []);
    }

    private function searchCmsPages(int $shopId, string $query): array
    {
        $query = trim($query);
        $langId = (int) $this->context->language->id;
        $where = 'cms.active = 1 AND cmss.id_shop = ' . (int) $shopId . ' AND cmsl.id_lang = ' . (int) $langId;

        if ($query !== '') {
            $where .= ' AND cmsl.meta_title LIKE \'%' . pSQL($query) . '%\'';
        }

        $rows = Db::getInstance()->executeS(
            'SELECT cms.id_cms, cmsl.meta_title, cmsl.link_rewrite
       FROM `' . _DB_PREFIX_ . 'cms` cms
       INNER JOIN `' . _DB_PREFIX_ . 'cms_shop` cmss ON (cmss.id_cms = cms.id_cms)
       INNER JOIN `' . _DB_PREFIX_ . 'cms_lang` cmsl ON (cmsl.id_cms = cms.id_cms)
       WHERE ' . $where . '
       ORDER BY cms.position ASC, cmsl.meta_title ASC
       LIMIT 50'
        );

        return array_map(function (array $row) use ($langId, $shopId): array {
            $cmsId = (int) $row['id_cms'];

            return [
                'id' => $cmsId,
                'type' => 'cms_page',
                'name' => (string) $row['meta_title'],
                'url' => $this->context->link->getCMSLink($cmsId, (string) $row['link_rewrite'], false, $langId, $shopId),
            ];
        }, is_array($rows) ? $rows : []);
    }

    private function searchBlogPosts(int $shopId, string $query): array
    {
        if (!$this->blogTablesAvailable()) {
            return [];
        }

        $query = trim($query);
        $langId = (int) $this->context->language->id;
        $where = 'p.active = 1 AND ps.id_shop = ' . (int) $shopId . ' AND pl.id_shop = ' . (int) $shopId . ' AND pl.id_lang = ' . (int) $langId
          . " AND (p.date_published IS NULL OR p.date_published <= '" . pSQL(date('Y-m-d H:i:s')) . "')";

        if ($query !== '') {
            $escaped = pSQL($query);
            $where .= " AND (pl.title LIKE '%" . $escaped . "%' OR pl.intro LIKE '%" . $escaped . "%' OR pl.slug LIKE '%" . $escaped . "%')";
        }

        $rows = Db::getInstance()->executeS(
            'SELECT p.id_post, p.cover_image, p.date_published, p.views, p.featured,
              pl.title, pl.slug, pl.intro,
              cl.name AS category_name
       FROM `' . _DB_PREFIX_ . 'cci_blog_post` p
       INNER JOIN `' . _DB_PREFIX_ . 'cci_blog_post_shop` ps ON (ps.id_post = p.id_post)
       INNER JOIN `' . _DB_PREFIX_ . 'cci_blog_post_lang` pl ON (pl.id_post = p.id_post)
       LEFT JOIN `' . _DB_PREFIX_ . 'cci_blog_category_lang` cl
          ON (cl.id_category = p.id_category AND cl.id_lang = ' . (int) $langId . ' AND cl.id_shop = ' . (int) $shopId . ')
       WHERE ' . $where . '
       ORDER BY p.date_published DESC, p.id_post DESC
       LIMIT 50'
        );

        return array_map(function (array $row): array {
            $slug = trim((string) ($row['slug'] ?? ''));
            $postId = (int) $row['id_post'];

            return [
                'id' => $postId,
                'type' => 'blog_post',
                'name' => (string) ($row['title'] ?? ''),
                'url' => $slug !== '' ? (string) $this->context->link->getModuleLink('cci_blog', 'post', ['slug' => $slug]) : '#',
                'image_url' => (string) ($row['cover_image'] ?? ''),
                'intro' => trim(strip_tags((string) ($row['intro'] ?? ''))),
                'reference' => trim((string) ($row['category_name'] ?? '')),
                'views' => max(0, (int) ($row['views'] ?? 0)),
                'featured' => !empty($row['featured']),
                'date_published' => (string) ($row['date_published'] ?? ''),
            ];
        }, is_array($rows) ? $rows : []);
    }

    private function searchBlogCategories(int $shopId, string $query): array
    {
        if (!$this->blogCategoryTablesAvailable()) {
            return [];
        }

        $query = trim($query);
        $langId = (int) $this->context->language->id;
        $where = 'c.active = 1 AND cs.id_shop = ' . (int) $shopId . ' AND cl.id_shop = ' . (int) $shopId . ' AND cl.id_lang = ' . (int) $langId;

        if ($query !== '') {
            $escaped = pSQL($query);
            $where .= " AND (cl.name LIKE '%" . $escaped . "%' OR cl.slug LIKE '%" . $escaped . "%' OR cl.description LIKE '%" . $escaped . "%')";
        }

        $postCategoryJoin = $this->blogPostCategoryTableAvailable()
          ? 'LEFT JOIN `' . _DB_PREFIX_ . 'cci_blog_post_category` pc
          ON pc.id_category = c.id_category
         LEFT JOIN `' . _DB_PREFIX_ . 'cci_blog_post` p
          ON p.id_post = pc.id_post
          AND p.active = 1
          AND (p.date_published IS NULL OR p.date_published <= \'' . pSQL(date('Y-m-d H:i:s')) . '\')'
          : 'LEFT JOIN `' . _DB_PREFIX_ . 'cci_blog_post` p
          ON p.id_category = c.id_category
          AND p.active = 1
          AND (p.date_published IS NULL OR p.date_published <= \'' . pSQL(date('Y-m-d H:i:s')) . '\')';

        $categoryImageSelect = $this->blogCategoryImageColumnAvailable()
          ? 'c.image_url'
          : '"" AS image_url';

        $rows = Db::getInstance()->executeS(
            'SELECT c.id_category, c.id_parent, c.position, ' . $categoryImageSelect . ',
              cl.name, cl.slug, cl.description,
              COUNT(DISTINCT ps.id_post) AS post_count
       FROM `' . _DB_PREFIX_ . 'cci_blog_category` c
       INNER JOIN `' . _DB_PREFIX_ . 'cci_blog_category_shop` cs
          ON (cs.id_category = c.id_category)
       INNER JOIN `' . _DB_PREFIX_ . 'cci_blog_category_lang` cl
          ON (cl.id_category = c.id_category)
       ' . $postCategoryJoin . '
       LEFT JOIN `' . _DB_PREFIX_ . 'cci_blog_post_shop` ps
          ON ps.id_post = p.id_post AND ps.id_shop = ' . (int) $shopId . '
       WHERE ' . $where . '
       GROUP BY c.id_category
       ORDER BY c.position ASC, cl.name ASC
       LIMIT 100'
        );

        return array_map(function (array $row): array {
            $slug = trim((string) ($row['slug'] ?? ''));
            $categoryId = (int) $row['id_category'];
            $description = trim(strip_tags((string) ($row['description'] ?? '')));

            return [
                'id' => $categoryId,
                'type' => 'blog_category',
                'name' => (string) ($row['name'] ?? ''),
                'url' => $slug !== '' ? (string) $this->context->link->getModuleLink('cci_blog', 'category', ['slug' => $slug]) : '#',
                'reference' => $description !== '' ? mb_substr($description, 0, 120) : (string) ($row['slug'] ?? ''),
                'image_url' => (string) ($row['image_url'] ?? ''),
                'parent_id' => (int) ($row['id_parent'] ?? 0),
                'position' => (int) ($row['position'] ?? 0),
                'post_count' => max(0, (int) ($row['post_count'] ?? 0)),
            ];
        }, is_array($rows) ? $rows : []);
    }

    private function blogTablesAvailable(): bool
    {
        static $available = null;
        if ($available !== null) {
            return $available;
        }

        $postExists = $this->databaseTableAvailable(_DB_PREFIX_ . 'cci_blog_post');
        $langExists = $this->databaseTableAvailable(_DB_PREFIX_ . 'cci_blog_post_lang');
        $shopExists = $this->databaseTableAvailable(_DB_PREFIX_ . 'cci_blog_post_shop');
        $available = $postExists && $langExists && $shopExists;

        return $available;
    }

    private function blogCategoryTablesAvailable(): bool
    {
        static $available = null;
        if ($available !== null) {
            return $available;
        }

        $categoryExists = $this->databaseTableAvailable(_DB_PREFIX_ . 'cci_blog_category');
        $langExists = $this->databaseTableAvailable(_DB_PREFIX_ . 'cci_blog_category_lang');
        $shopExists = $this->databaseTableAvailable(_DB_PREFIX_ . 'cci_blog_category_shop');
        $available = $categoryExists && $langExists && $shopExists && $this->blogTablesAvailable();

        return $available;
    }

    private function blogPostCategoryTableAvailable(): bool
    {
        static $available = null;
        if ($available !== null) {
            return $available;
        }

        $available = $this->databaseTableAvailable(_DB_PREFIX_ . 'cci_blog_post_category');

        return $available;
    }

    private function databaseTableAvailable(string $tableName): bool
    {
        return (bool) Db::getInstance()->getValue(
            'SELECT COUNT(*)
       FROM INFORMATION_SCHEMA.TABLES
       WHERE TABLE_SCHEMA = DATABASE()
       AND TABLE_NAME = "' . pSQL($tableName) . '"'
        );
    }

    private function blogCategoryImageColumnAvailable(): bool
    {
        static $available = null;
        if ($available !== null) {
            return $available;
        }

        $available = (bool) Db::getInstance()->getValue(
            'SELECT COUNT(*)
       FROM INFORMATION_SCHEMA.COLUMNS
       WHERE TABLE_SCHEMA = DATABASE()
       AND TABLE_NAME = "' . pSQL(_DB_PREFIX_ . 'cci_blog_category') . '"
       AND COLUMN_NAME = "image_url"'
        );

        return $available;
    }

    private function getModuleSettings(): array
    {
        $shopId = (int) ($this->context->shop->id ?? 0);
        $raw = (string) Configuration::get(self::MODULE_SETTINGS_CONFIG_KEY, null, null, $shopId);
        $decoded = json_decode($raw, true);
        $settings = is_array($decoded) ? array_merge(self::DEFAULT_MODULE_SETTINGS, $decoded) : self::DEFAULT_MODULE_SETTINGS;

        return $this->sanitizeModuleSettings($settings);
    }

    private function getAvailableHookNames(): array
    {
        $db = Db::getInstance();
        $rows = $db->executeS('SELECT name FROM `' . _DB_PREFIX_ . 'hook` ORDER BY name ASC');
        if (!is_array($rows)) {
            return self::FRONT_HOOKS;
        }

        $forbidden = ['displayTop', 'displayNav1', 'displayNav2', 'displayNavFullWidth'];
        $names = [];

        foreach ($rows as $row) {
            $name = isset($row['name']) ? trim((string) $row['name']) : '';
            if ($name === '') {
                continue;
            }

            if (!preg_match('/^[A-Za-z][A-Za-z0-9_]{0,63}$/', $name)) {
                continue;
            }

            if (in_array($name, $forbidden, true)) {
                continue;
            }

            $names[] = $name;
        }

        $names = array_values(array_unique($names));

        return $names ?: self::FRONT_HOOKS;
    }

    private function filterDisplayHooks(array $hookNames, array $fallback): array
    {
        $displayHooks = [];
        foreach ($hookNames as $hook) {
            if (!is_string($hook) || !preg_match('/^display/i', $hook)) {
                continue;
            }

            $displayHooks[] = $hook;
        }

        if (empty($displayHooks)) {
            return array_values($fallback);
        }

        if (!in_array('displayTop', $displayHooks, true)) {
            array_unshift($displayHooks, 'displayTop');
        }

        return array_values(array_unique($displayHooks));
    }

    private function saveModuleSettings(array $payload): array
    {
        $settings = $this->sanitizeModuleSettings(array_merge($this->getModuleSettings(), $payload));
        $encoded = json_encode($settings, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);

        if (!is_string($encoded)) {
            return [
                'success' => false,
                'settings' => $settings,
                'error' => $this->trans('Could not encode module settings', [], 'Modules.CciNiceMenu.Admin'),
            ];
        }

        $shopId = (int) ($this->context->shop->id ?? 0);
        $saved = Configuration::updateValue(self::MODULE_SETTINGS_CONFIG_KEY, $encoded, false, null, $shopId);
        $stored = (string) Configuration::get(self::MODULE_SETTINGS_CONFIG_KEY, null, null, $shopId);
        $success = (bool) $saved || $stored === $encoded;

        return [
            'success' => $success,
            'settings' => $settings,
            'message' => $success ? $this->trans('Module settings saved', [], 'Modules.CciNiceMenu.Admin') : $this->trans('Could not save module settings', [], 'Modules.CciNiceMenu.Admin'),
        ];
    }

    private function sanitizeModuleSettings(array $settings): array
    {
        $loadStrategy = (string) ($settings['loadStrategy'] ?? self::DEFAULT_MODULE_SETTINGS['loadStrategy']);
        if (!in_array($loadStrategy, ['hook', 'all'], true)) {
            $loadStrategy = self::DEFAULT_MODULE_SETTINGS['loadStrategy'];
        }

        $iconLibrary = (string) ($settings['iconLibrary'] ?? self::DEFAULT_MODULE_SETTINGS['iconLibrary']);
        if (!in_array($iconLibrary, ['none', 'theme', 'fontawesome', 'tabler'], true)) {
            $iconLibrary = self::DEFAULT_MODULE_SETTINGS['iconLibrary'];
        }

        $iconSource = (string) ($settings['iconSource'] ?? self::DEFAULT_MODULE_SETTINGS['iconSource']);
        if (!in_array($iconSource, ['local', 'cdn'], true)) {
            $iconSource = self::DEFAULT_MODULE_SETTINGS['iconSource'];
        }

        $owlAssetsSource = (string) ($settings['owlAssetsSource'] ?? self::DEFAULT_MODULE_SETTINGS['owlAssetsSource']);
        if (!in_array($owlAssetsSource, ['module', 'theme'], true)) {
            $owlAssetsSource = self::DEFAULT_MODULE_SETTINGS['owlAssetsSource'];
        }

        return [
            'frontendCss' => !empty($settings['frontendCss']),
            'frontendJs' => !empty($settings['frontendJs']),
            'loadStrategy' => $loadStrategy,
            'iconLibrary' => $iconLibrary,
            'iconSource' => $iconSource,
            'owlAssetsSource' => $owlAssetsSource,
        ];
    }

    private function getDiagnosticsPayload(int $shopId): array
    {
        $menus = $this->core->getMenus($shopId);
        $activeMenus = array_values(array_filter($menus, static function (array $menu): bool {
            return (int) ($menu['is_active'] ?? 0) === 1;
        }));
        $settings = $this->getModuleSettings();
        $license = $this->getRawLicensePayload($shopId);
        $tableName = _DB_PREFIX_ . 'cci_nice_menu';
        $db = Db::getInstance();
        $logs = [];
        $tableRows = $db->executeS('SHOW TABLES LIKE \'' . pSQL($tableName) . '\'');
        $tableExists = is_array($tableRows) && !empty($tableRows);

        if (!$tableExists) {
            $logs[] = [
                'type' => 'database',
                'message' => $this->trans('Menu table is missing. Reinstall or repair the module schema.', [], 'Modules.CciNiceMenu.Admin'),
                'date' => date('Y-m-d H:i:s'),
            ];
        }

        if (empty($menus)) {
            $logs[] = [
                'type' => 'menus',
                'message' => $this->trans('No menu configuration exists yet.', [], 'Modules.CciNiceMenu.Admin'),
                'date' => date('Y-m-d H:i:s'),
            ];
        }

        if (empty($activeMenus)) {
            $logs[] = [
                'type' => 'menus',
                'message' => $this->trans('No active menu is currently visible on the storefront.', [], 'Modules.CciNiceMenu.Admin'),
                'date' => date('Y-m-d H:i:s'),
            ];
        }

        if (empty($settings['frontendCss']) || empty($settings['frontendJs'])) {
            $logs[] = [
                'type' => 'assets',
                'message' => $this->trans('One or more frontend assets are disabled in module settings.', [], 'Modules.CciNiceMenu.Admin'),
                'date' => date('Y-m-d H:i:s'),
            ];
        }

        $assetDiagnostics = $this->getAssetDiagnostics();
        foreach ($assetDiagnostics as $asset) {
            if (empty($asset['exists'])) {
                $logs[] = [
                    'type' => 'assets',
                    'message' => sprintf($this->trans('Asset file is missing: %s', [], 'Modules.CciNiceMenu.Admin'), $asset['relativePath']),
                    'date' => date('Y-m-d H:i:s'),
                ];
            }
        }

        return [
            'generatedAt' => date('c'),
            'module' => [
                'name' => $this->name,
                'displayName' => $this->displayName,
                'version' => $this->version,
                'schemaVersion' => $this->core->getSchemaVersion(),
                'enabled' => (bool) $this->active,
                'path' => $this->getLocalPath(),
                'settings' => $settings,
            ],
            'license' => [
                'status' => (string) ($license['status'] ?? 'inactive'),
                'label' => (string) ($license['label'] ?? ''),
                'canUse' => !empty($license['canUse']),
                'environment' => (string) ($license['environment'] ?? ''),
                'domain' => (string) ($license['domain'] ?? ''),
                'checkedAt' => (string) ($license['checkedAt'] ?? ''),
                'nextCheckAt' => (string) ($license['nextCheckAt'] ?? ''),
            ],
            'prestashop' => [
                'version' => _PS_VERSION_,
                'debugMode' => defined('_PS_MODE_DEV_') && (bool) _PS_MODE_DEV_,
                'shopFeatureActive' => class_exists('Shop') ? (bool) Shop::isFeatureActive() : false,
                'contextShopId' => (int) $this->context->shop->id,
                'contextShopName' => (string) $this->context->shop->name,
                'language' => [
                    'id' => (int) $this->context->language->id,
                    'isoCode' => (string) $this->context->language->iso_code,
                ],
                'currency' => [
                    'id' => (int) $this->context->currency->id,
                    'isoCode' => (string) $this->context->currency->iso_code,
                ],
            ],
            'shop' => [
                'id' => $shopId,
                'name' => (string) $this->context->shop->name,
                'domain' => (string) $this->context->shop->domain,
                'domainSsl' => (string) $this->context->shop->domain_ssl,
                'baseUri' => (string) $this->context->shop->getBaseURI(),
            ],
            'server' => [
                'phpVersion' => PHP_VERSION,
                'sapi' => PHP_SAPI,
                'os' => PHP_OS,
                'memoryLimit' => (string) ini_get('memory_limit'),
                'maxExecutionTime' => (string) ini_get('max_execution_time'),
                'uploadMaxFilesize' => (string) ini_get('upload_max_filesize'),
                'postMaxSize' => (string) ini_get('post_max_size'),
                'timezone' => date_default_timezone_get(),
                'extensions' => [
                    'curl' => extension_loaded('curl'),
                    'intl' => extension_loaded('intl'),
                    'json' => extension_loaded('json'),
                    'mbstring' => extension_loaded('mbstring'),
                    'opcache' => extension_loaded('Zend OPcache'),
                ],
            ],
            'database' => [
                'serverVersion' => (string) $db->getValue('SELECT VERSION()'),
                'prefix' => _DB_PREFIX_,
                'table' => [
                    'name' => $tableName,
                    'exists' => $tableExists,
                    'rows' => $tableExists ? (int) $db->getValue('SELECT COUNT(*) FROM `' . bqSQL($tableName) . '`') : 0,
                ],
            ],
            'menus' => [
                'total' => count($menus),
                'active' => count($activeMenus),
                'inactive' => max(0, count($menus) - count($activeMenus)),
                'hooksUsed' => array_values(array_unique(array_filter(array_map(static function (array $menu): string {
                    return (string) ($menu['hook_name'] ?? '');
                }, $menus)))),
            ],
            'settings' => [
                'frontendCss' => !empty($settings['frontendCss']),
                'frontendJs' => !empty($settings['frontendJs']),
                'loadStrategy' => (string) ($settings['loadStrategy'] ?? 'hook'),
                'iconLibrary' => (string) ($settings['iconLibrary'] ?? 'none'),
                'iconSource' => (string) ($settings['iconSource'] ?? 'local'),
                'owlAssetsSource' => (string) ($settings['owlAssetsSource'] ?? 'module'),
                'blogCarouselAssetsManagedBy' => 'cci_nice_menu_pro',
            ],
            'hooks' => $this->getHookDiagnostics(),
            'assets' => $assetDiagnostics,
            'logs' => $logs,
        ];
    }

    private function getHookDiagnostics(): array
    {
        $moduleId = (int) $this->id;

        return array_map(function (string $hookName) use ($moduleId): array {
            $hookId = (int) Hook::getIdByName($hookName);
            $registered = false;

            if ($hookId > 0 && $moduleId > 0) {
                $registered = (bool) Db::getInstance()->getValue(
                    'SELECT COUNT(*)
           FROM `' . _DB_PREFIX_ . 'hook_module`
           WHERE id_hook = ' . (int) $hookId . '
           AND id_module = ' . (int) $moduleId
                );
            }

            return [
                'name' => $hookName,
                'id' => $hookId,
                'registered' => $registered,
            ];
        }, self::FRONT_HOOKS);
    }

    private function getAssetDiagnostics(): array
    {
        $assets = [
            'views/css/cci_nice_menu_admin.css',
            'views/js/ccinice-menu-admin.js',
            'views/css/cci_nice_menu_front.css',
            'views/css/cci_nice_menu_front_runtime.css',
            'views/js/cci_nice_menu_front.js',
        ];

        return array_map(function (string $relativePath): array {
            $path = __DIR__ . '/' . $relativePath;
            $exists = is_file($path);

            return [
                'relativePath' => $relativePath,
                'exists' => $exists,
                'size' => $exists ? (int) filesize($path) : 0,
                'modifiedAt' => $exists ? date('c', (int) filemtime($path)) : '',
            ];
        }, $assets);
    }

    private function isDevelopmentMode(): bool
    {
        $envValue = getenv('PS_DEV_MODE');

        return (defined('_PS_MODE_DEV_') && (bool) _PS_MODE_DEV_)
          || in_array(strtolower((string) $envValue), ['1', 'true', 'yes', 'on'], true);
    }
}
