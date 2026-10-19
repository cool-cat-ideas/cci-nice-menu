<?php

declare(strict_types=1);

namespace CCI\NiceMenu\Core;

if (!defined('_PS_VERSION_')) {
    exit;
}

class CciNiceMenuCore
{
    private const SCHEMA_VERSION = 3;
    private const TABLE_NAME = 'cci_nice_menu';
    private const DEFAULT_TREE = [
        [
            'id' => 'node-home',
            'label' => 'Home',
            'link' => '/',
            'target' => false,
            'children' => [],
        ],
        [
            'id' => 'node-collections',
            'label' => 'Collections',
            'link' => '#',
            'target' => false,
            'children' => [
                [
                    'id' => 'node-new',
                    'label' => 'New',
                    'link' => '#',
                    'children' => [],
                ],
                [
                    'id' => 'node-sale',
                    'label' => 'Sale',
                    'link' => '#',
                    'children' => [],
                ],
            ],
        ],
        [
            'id' => 'node-about',
            'label' => 'About',
            'link' => '#',
            'target' => false,
            'children' => [],
        ],
    ];

    private const NODE_COMPONENT_VARIANT_CLASSES = [
        'feature_strip' => ['cci-nice-menu-showcase-feature-strip'],
        'benefits_strip' => ['cci-nice-menu-showcase-benefits-block'],
        'rail_links' => [],
        'hero_strip' => ['cci-nice-menu-showcase-hero-strip'],
        'bottom_hero_column' => ['cci-nice-menu-showcase-bottom-hero-column'],
        'footer_actions' => ['cci-nice-menu-showcase-footer-actions'],
        'showcase_catalog_entry' => ['cci-nice-menu-showcase-entry', 'cci-nice-menu-showcase-catalog'],
        'showcase_entry' => ['cci-nice-menu-showcase-entry'],
        'showcase_simple_link' => ['cci-nice-menu-showcase-simple-link'],
        'showcase_tabs_column' => ['cci-nice-menu-showcase-tabs'],
        'showcase_tabs_block' => ['cci-nice-menu-showcase-tabs-block'],
        'showcase_link_column' => ['cci-nice-menu-showcase-link-column'],
        'showcase_link_block' => ['cci-nice-menu-showcase-link-block'],
        'showcase_secondary_link_block' => ['cci-nice-menu-showcase-link-block', 'cci-nice-menu-showcase-secondary-block'],
        'showcase_current_link' => ['cci-nice-menu-showcase-current-link'],
        'showcase_products_column' => ['cci-nice-menu-showcase-products-column'],
        'showcase_product_grid' => ['cci-nice-menu-showcase-product-block', 'cci-nice-menu-showcase-product-grid'],
        'showcase_product_grid_three' => ['cci-nice-menu-showcase-product-block', 'cci-nice-menu-showcase-product-grid', 'cci-nice-menu-showcase-three-products'],
        'showcase_product_grid_two' => ['cci-nice-menu-showcase-product-block', 'cci-nice-menu-showcase-product-grid', 'cci-nice-menu-showcase-two-products'],
        'showcase_media_column' => ['cci-nice-menu-showcase-media-column'],
        'showcase_media_block' => ['cci-nice-menu-showcase-media-block'],
        'showcase_action_column' => ['cci-nice-menu-showcase-action-column'],
        'showcase_card_list' => ['cci-nice-menu-showcase-card-list'],
        'showcase_collection_column' => ['cci-nice-menu-showcase-collection-column'],
        'showcase_video_column' => ['cci-nice-menu-showcase-video-column'],
        'showcase_video_block' => ['cci-nice-menu-showcase-video-block'],
        'showcase_video_feature' => ['cci-nice-menu-showcase-video-feature'],
        'showcase_secondary_row' => ['cci-nice-menu-showcase-secondary-row'],
        'showcase_bottom_list_column' => ['cci-nice-menu-showcase-bottom-list-column'],
        'showcase_compact_list' => ['cci-nice-menu-showcase-compact-list'],
        'showcase_blog_list' => ['cci-nice-menu-showcase-blog-list'],
        'showcase_blog_carousel' => ['cci-nice-menu-showcase-blog-carousel'],
        'showcase_blog_popular' => ['cci-nice-menu-showcase-blog-popular'],
        'showcase_blog_categories' => ['cci-nice-menu-showcase-blog-categories'],
        'showcase_blog_sticky' => ['cci-nice-menu-showcase-blog-sticky'],
        'showcase_store_column' => ['cci-nice-menu-showcase-store-column'],
        'showcase_store_card' => ['cci-nice-menu-showcase-store-card'],
        'showcase_map_card' => ['cci-nice-menu-showcase-map-card'],
        'showcase_store_status' => ['cci-nice-menu-showcase-store-status'],
        'showcase_brands_column' => ['cci-nice-menu-showcase-brands-column'],
        'showcase_brand_grid' => ['cci-nice-menu-showcase-brand-grid'],
        'showcase_footer_column' => ['cci-nice-menu-showcase-footer-column'],
        'showcase_header' => ['cci-nice-menu-showcase-header'],
        'showcase_header_block' => ['cci-nice-menu-showcase-header-block'],
        'showcase_header_column' => ['cci-nice-menu-showcase-header-column'],
        'showcase_rail_service' => ['cci-nice-menu-showcase-rail-service'],
        'showcase_rail_hook' => ['cci-nice-menu-showcase-rail-hook'],
        'card_list_action' => ['cci-nice-menu-showcase-simple-link', 'cci-nice-menu-card-list-action'],
        'category_browser_header' => ['cci-nice-menu-category-browser-header'],
        'category_browser_header_block' => ['cci-nice-menu-category-browser-header-block'],
        'category_browser_header_column' => ['cci-nice-menu-category-browser-header-column'],
        'category_browser_tree_block' => ['cci-nice-menu-category-browser-tree-block'],
        'category_browser_tree_column' => ['cci-nice-menu-category-browser-tree-column'],
        'live_category_view_all' => ['cci-nice-menu-live-category-view-all'],
        'dynamic_catalog_tabs' => ['cci-nice-menu-dynamic-catalog-tabs'],
        'dynamic_catalog_block' => ['cci-nice-menu-dynamic-catalog-block'],
        'dynamic_category_column' => ['cci-nice-menu-dynamic-category-column'],
        'dynamic_category_block' => ['cci-nice-menu-dynamic-category-block'],
        'bestsellers_header' => ['cci-nice-menu-bestsellers-header'],
        'promotions_header' => ['cci-nice-menu-promotions-header'],
        'brand_logo_gildan' => ['cci-nice-menu-brand-logo', 'cci-nice-menu-brand-gildan'],
        'brand_logo_fruit' => ['cci-nice-menu-brand-logo', 'cci-nice-menu-brand-fruit'],
        'brand_logo_bc' => ['cci-nice-menu-brand-logo', 'cci-nice-menu-brand-bc'],
        'brand_logo_stanley' => ['cci-nice-menu-brand-logo', 'cci-nice-menu-brand-stanley'],
    ];

    private const PRESET_LAYOUTS = [
        'default' => [
            'label' => 'Classic',
            'layout' => 'classic',
            'container_mode' => 'boxed',
            'container_width' => 1320,
            'mobile_breakpoint' => 900,
            'animation' => 'fade',
            'columns' => 6,
            'open_on' => 'click',
            'item_gap' => 8,
            'show_shadow' => true,
        ],
        'compact' => [
            'label' => 'Compact strip',
            'layout' => 'compact',
            'container_mode' => 'boxed',
            'container_width' => 1080,
            'mobile_breakpoint' => 960,
            'animation' => 'none',
            'columns' => 5,
            'open_on' => 'hover',
            'item_gap' => 6,
            'show_shadow' => false,
        ],
        'wide' => [
            'label' => 'Wide featured',
            'layout' => 'wide',
            'container_mode' => 'wide',
            'container_width' => 1700,
            'mobile_breakpoint' => 1024,
            'animation' => 'slide',
            'columns' => 8,
            'open_on' => 'hover',
            'item_gap' => 10,
            'show_shadow' => true,
        ],
    ];
    private const PRESET_THEMES = [
        'night-glass' => [
            'label' => 'Night Glass',
            'description' => 'Premium dark glass look with soft glow.',
            'background_a' => 'rgba(20, 26, 38, 0.96)',
            'accent' => '#2e63d0',
            'color_accent' => '#2e63d0',
            'color_accent_hover' => '#dbe4ff',
            'color_accent_soft' => '#162642',
            'color_accent_wash' => '#1f3154',
            'color_text' => '#f8fafc',
            'color_muted' => '#cbd5e1',
            'color_surface' => '#111827',
            'color_surface_soft' => '#1f2937',
            'color_border' => '#334155',
            'color_border_strong' => '#475569',
            'color_heading' => '#f8fafc',
            'color_video_bg' => '#020617',
            'color_video_border' => '#1d4ed8',
        ],
        'aurora' => [
            'label' => 'Aurora Pulse',
            'description' => 'Gradient-forward menu with vibrant blue accents.',
            'background_a' => 'linear-gradient(140deg, #0f1730 0%, #182e67 60%, #1f2048 100%)',
            'accent' => '#4da1ff',
            'color_accent' => '#4da1ff',
            'color_accent_hover' => '#93c5fd',
            'color_accent_soft' => '#11254a',
            'color_accent_wash' => '#17325f',
            'color_text' => '#f8fafc',
            'color_muted' => '#cbd5e1',
            'color_surface' => '#0f172a',
            'color_surface_soft' => '#172554',
            'color_border' => '#1e3a8a',
            'color_border_strong' => '#3b82f6',
            'color_heading' => '#eff6ff',
            'color_video_bg' => '#111827',
            'color_video_border' => '#3b82f6',
        ],
        'mono-minimal' => [
            'label' => 'Mono Minimal',
            'description' => 'Cleaner business look with crisp high contrast.',
            'background_a' => '#111317',
            'accent' => '#dbe4ff',
            'color_accent' => '#111827',
            'color_accent_hover' => '#374151',
            'color_accent_soft' => '#f3f4f6',
            'color_accent_wash' => '#f9fafb',
            'color_text' => '#111827',
            'color_muted' => '#4b5563',
            'color_surface' => '#ffffff',
            'color_surface_soft' => '#f9fafb',
            'color_border' => '#e5e7eb',
            'color_border_strong' => '#d1d5db',
            'color_heading' => '#111827',
            'color_video_bg' => '#111827',
            'color_video_border' => '#374151',
        ],
        'clean-light' => [
            'label' => 'Clean Light',
            'description' => 'Retail-ready bright menu with configurable blue accent.',
            'background_a' => '#ffffff',
            'accent' => '#0d6efd',
            'color_accent' => '#0d6efd',
            'color_accent_hover' => '#0753d8',
            'color_accent_soft' => '#f3f8ff',
            'color_accent_wash' => '#eaf4ff',
            'color_text' => '#111827',
            'color_muted' => '#64748b',
            'color_surface' => '#ffffff',
            'color_surface_soft' => '#f8fbff',
            'color_border' => '#dbe7f3',
            'color_border_strong' => '#bfdbfe',
            'color_heading' => '#112445',
            'color_video_bg' => '#172554',
            'color_video_border' => '#1d4ed8',
        ],
        'brand-accent' => [
            'label' => 'Brand Accent',
            'description' => 'Bright layout that follows the shop brand color.',
            'background_a' => '#ffffff',
            'accent' => '#16a34a',
            'color_accent' => '#16a34a',
            'color_accent_hover' => '#15803d',
            'color_accent_soft' => '#f0fdf4',
            'color_accent_wash' => '#dcfce7',
            'color_text' => '#111827',
            'color_muted' => '#64748b',
            'color_surface' => '#ffffff',
            'color_surface_soft' => '#f8fafc',
            'color_border' => '#d9eadf',
            'color_border_strong' => '#86efac',
            'color_heading' => '#12351f',
            'color_video_bg' => '#064e3b',
            'color_video_border' => '#16a34a',
        ],
    ];
    private const DEFAULT_SETTINGS = [
        'layout' => 'classic',
        'container_mode' => 'boxed',
        'container_width' => 1320,
        'mobile_breakpoint' => 900,
        'animation' => 'fade',
        'columns' => 6,
        'top_level_layout' => 'flow',
        'open_on' => 'click',
        'show_shadow' => true,
        'drop_shadow' => true,
        'show_counts' => false,
        'hide_empty_categories' => false,
        'item_gap' => 8,
        'top_level_icon_mode' => 'first',
        'category_tab_media_mode' => 'auto',
        'theme' => 'night-glass',
        'color_accent' => '#0d6efd',
        'color_accent_hover' => '#0753d8',
        'color_accent_soft' => '#f3f8ff',
        'color_accent_wash' => '#eaf4ff',
        'color_text' => '#111827',
        'color_muted' => '#64748b',
        'color_icon' => '#0d6efd',
        'color_surface' => '#ffffff',
        'color_surface_soft' => '#f8fbff',
        'color_border' => '#dbe7f3',
        'color_border_strong' => '#bfdbfe',
        'color_heading' => '#112445',
        'color_video_bg' => '#172554',
        'color_video_border' => '#1d4ed8',
        'schema_version' => self::SCHEMA_VERSION,
    ];

    private \Module $module;
    private array $renderSettings = [];

    public function __construct(\Module $module)
    {
        $this->module = $module;
    }

    public function install(): bool
    {
        if (!$this->createTable()) {
            return false;
        }

        return $this->seedDefaultMenus();
    }

    public function uninstall(): bool
    {
        $sql = 'DROP TABLE IF EXISTS `' . _DB_PREFIX_ . self::TABLE_NAME . '`';

        return \Db::getInstance()->execute($sql);
    }

    public function getMenus(int $shopId): array
    {
        $rows = \Db::getInstance()->executeS(
            'SELECT id_menu, code, name, hook_name, is_active, position, tree_json, settings_json, created_at, updated_at
            FROM `' . _DB_PREFIX_ . self::TABLE_NAME . '`
            WHERE id_shop = ' . (int) $shopId . '
            ORDER BY position ASC, id_menu ASC'
        );

        return $this->decodeRows($rows ?: []);
    }

    public function countMenus(int $shopId): int
    {
        return (int) \Db::getInstance()->getValue(
            'SELECT COUNT(*)
            FROM `' . _DB_PREFIX_ . self::TABLE_NAME . '`
            WHERE id_shop = ' . (int) $shopId
        );
    }

    public function getActiveMenu(int $shopId, string $hookName): ?array
    {
        $hookName = $this->sanitizeHook($hookName);
        $row = \Db::getInstance()->getRow(
            'SELECT id_menu, code, name, hook_name, is_active, position, tree_json, settings_json, created_at, updated_at
            FROM `' . _DB_PREFIX_ . self::TABLE_NAME . '`
            WHERE id_shop = ' . (int) $shopId . '
            AND hook_name = \'' . pSQL($hookName) . '\'
            AND is_active = 1
            ORDER BY position ASC, id_menu ASC'
        );

        if (!$row) {
            return null;
        }

        return $this->decodeRows([$row])[0];
    }

    public function getPresetLayouts(): array
    {
        return self::PRESET_LAYOUTS;
    }

    public function getThemePresets(): array
    {
        return self::PRESET_THEMES;
    }

    public function getDefaultSettings(): array
    {
        return self::DEFAULT_SETTINGS;
    }

    public function getSchemaVersion(): int
    {
        return self::SCHEMA_VERSION;
    }

    public function getMenu(int $shopId, int $menuId): ?array
    {
        if ($menuId <= 0) {
            return null;
        }

        $row = \Db::getInstance()->getRow(
            'SELECT id_menu, code, name, hook_name, is_active, position, tree_json, settings_json, created_at, updated_at
            FROM `' . _DB_PREFIX_ . self::TABLE_NAME . '`
            WHERE id_menu = ' . (int) $menuId . ' AND id_shop = ' . (int) $shopId
        );

        if (!$row) {
            return null;
        }

        return $this->decodeRows([$row])[0];
    }

    public function buildMenuMarkup(array $nodes, int $level = 0, array $settings = [], array $moduleSettings = []): string
    {
        $this->renderSettings = $settings ? $this->normalizeSettings($settings) : self::DEFAULT_SETTINGS;
        $this->renderSettings['icon_library'] = $this->sanitizeIconLibrary((string) ($moduleSettings['iconLibrary'] ?? 'none'));

        return $this->renderMenuNodes($nodes, $level);
    }

    public function saveMenu(int $shopId, array $payload): array
    {
        $validation = $this->validateMenuPayload($payload);
        if (!$validation['success']) {
            return ['success' => false, 'error' => implode(' | ', $validation['errors'])];
        }

        $menuId = (int) ($payload['id_menu'] ?? 0);
        $code = $this->sanitizeCode((string) ($payload['code'] ?? 'main'));
        $name = trim((string) ($payload['name'] ?? 'Main menu'));
        if ($name === '') {
            $name = 'Main menu';
        }

        $hookName = $this->sanitizeHook((string) ($payload['hook_name'] ?? 'displayTop'));
        $this->module->registerHook($hookName);
        $isActive = !empty($payload['is_active']) ? 1 : 0;
        $position = (int) ($payload['position'] ?? 0);
        $tree = is_array($payload['tree'] ?? null) ? $payload['tree'] : [];
        $settings = is_array($payload['settings'] ?? null) ? $payload['settings'] : [];
        $settings['schema_version'] = (int) ($payload['schema_version'] ?? $settings['schema_version'] ?? self::SCHEMA_VERSION);
        $settings = $this->normalizeSettings($settings);

        $now = date('Y-m-d H:i:s');

        if ($menuId > 0) {
            $exists = \Db::getInstance()->getValue(
                'SELECT id_menu FROM `' . _DB_PREFIX_ . self::TABLE_NAME . '` WHERE id_menu = ' . (int) $menuId . ' AND id_shop = ' . (int) $shopId
            );
            if (!$exists) {
                return ['success' => false, 'error' => $this->module->trans('Menu not found', [], 'Modules.CciNiceMenu.Admin')];
            }

            $updated = \Db::getInstance()->update(
                self::TABLE_NAME,
                [
                    'name' => pSQL($name),
                    'hook_name' => pSQL($hookName),
                    'is_active' => (int) $isActive,
                    'position' => (int) $position,
                    'tree_json' => pSQL($this->encode($this->normalizeTree($tree))),
                    'settings_json' => pSQL($this->encode($settings)),
                    'updated_at' => pSQL($now),
                ],
                'id_menu = ' . (int) $menuId . ' AND id_shop = ' . (int) $shopId
            );

            if (!$updated) {
                return ['success' => false, 'error' => $this->module->trans('Update failed', [], 'Modules.CciNiceMenu.Admin')];
            }
        } else {
            $code = $this->findAvailableCode((int) $shopId, $code);
            $inserted = \Db::getInstance()->insert(
                self::TABLE_NAME,
                [
                    'id_shop' => (int) $shopId,
                    'code' => pSQL($code),
                    'name' => pSQL($name),
                    'hook_name' => pSQL($hookName),
                    'is_active' => (int) $isActive,
                    'position' => (int) $position,
                    'tree_json' => pSQL($this->encode($this->normalizeTree($tree))),
                    'settings_json' => pSQL($this->encode($settings)),
                    'created_at' => pSQL($now),
                    'updated_at' => pSQL($now),
                ]
            );
            if (!$inserted) {
                return ['success' => false, 'error' => $this->module->trans('Insert failed', [], 'Modules.CciNiceMenu.Admin')];
            }

            $menuId = (int) \Db::getInstance()->Insert_ID();
        }

        $menu = $this->getMenu($shopId, $menuId);

        return ['success' => true, 'menu' => $menu];
    }

    public function deleteMenu(int $shopId, int $menuId): array
    {
        if ($menuId <= 0) {
            return ['success' => false, 'error' => $this->module->trans('Invalid menu id', [], 'Modules.CciNiceMenu.Admin')];
        }

        $ok = \Db::getInstance()->delete(
            self::TABLE_NAME,
            'id_menu = ' . (int) $menuId . ' AND id_shop = ' . (int) $shopId
        );

        return ['success' => (bool) $ok];
    }

    private function createTable(): bool
    {
        $sql = 'CREATE TABLE IF NOT EXISTS `' . _DB_PREFIX_ . self::TABLE_NAME . '` (
            `id_menu` INT(10) UNSIGNED NOT NULL AUTO_INCREMENT,
            `id_shop` INT(10) UNSIGNED NOT NULL,
            `code` VARCHAR(64) NOT NULL,
            `name` VARCHAR(128) NOT NULL,
            `hook_name` VARCHAR(64) NOT NULL DEFAULT \'displayTop\',
            `is_active` TINYINT(1) UNSIGNED NOT NULL DEFAULT 1,
            `position` INT(10) UNSIGNED NOT NULL DEFAULT 0,
            `tree_json` LONGTEXT NULL,
            `settings_json` LONGTEXT NULL,
            `created_at` DATETIME NOT NULL,
            `updated_at` DATETIME NOT NULL,
            PRIMARY KEY (`id_menu`),
            UNIQUE KEY `menu_shop_code` (`id_shop`,`code`),
            KEY `shop_hook_active` (`id_shop`,`hook_name`,`is_active`),
            KEY `position` (`id_shop`,`position`)
        ) ENGINE=' . _MYSQL_ENGINE_ . ' DEFAULT CHARSET=utf8mb4;';

        return \Db::getInstance()->execute($sql);
    }

    private function seedDefaultMenus(): bool
    {
        $shopIds = \Shop::getContextListShopID();
        if (!is_array($shopIds) || empty($shopIds)) {
            $shopIds = [1];
        }

        foreach ($shopIds as $shopId) {
            $exists = \Db::getInstance()->getValue(
                'SELECT id_menu FROM `' . _DB_PREFIX_ . self::TABLE_NAME . '` WHERE id_shop = ' . (int) $shopId
            );
            if ((int) $exists > 0) {
                continue;
            }

            $now = date('Y-m-d H:i:s');
            $ok = \Db::getInstance()->insert(
                self::TABLE_NAME,
                [
                    'id_shop' => (int) $shopId,
                    'code' => 'primary',
                    'name' => $this->module->trans('Main menu', [], 'Modules.CciNiceMenu.Admin'),
                    'hook_name' => 'displayTop',
                    'is_active' => 1,
                    'position' => 1,
                    'tree_json' => pSQL($this->encode($this->getDefaultTree())),
                    'settings_json' => pSQL($this->encode(self::DEFAULT_SETTINGS)),
                    'created_at' => pSQL($now),
                    'updated_at' => pSQL($now),
                ]
            );

            if (!$ok) {
                return false;
            }
        }

        return true;
    }

    private function getDefaultTree(): array
    {
        return self::DEFAULT_TREE;
    }

    private function normalizeTree(array $items, int $depth = 0, int $maxDepth = 8): array
    {
        if ($depth > $maxDepth) {
            return [];
        }

        $result = [];
        $index = 0;

        foreach ($items as $item) {
            if (!is_array($item)) {
                continue;
            }

            ++$index;
            $nodeIdRaw = isset($item['id']) ? (string) $item['id'] : '';
            $nodeId = $nodeIdRaw !== '' ? preg_replace('/[^a-zA-Z0-9_-]/', '', $nodeIdRaw) : ('node-' . (int) $depth . '-' . $index . '-' . (int) (microtime(true) * 1000));
            $nodeLabel = is_string($item['label'] ?? null) ? trim((string) $item['label']) : 'New item';
            if ($nodeLabel === '') {
                $nodeLabel = 'New item';
            }

            $nodeType = $this->sanitizeNodeType((string) ($item['type'] ?? 'custom'));
            $nodeLink = trim((string) ($item['link'] ?? '#'));
            $headingLink = trim((string) ($item['heading_link'] ?? ''));
            $headingLinkLabel = trim((string) ($item['heading_link_label'] ?? ''));
            $hasHeadingLinkIcon = array_key_exists('heading_link_icon', $item);
            $headingLinkIcon = $hasHeadingLinkIcon ? trim((string) ($item['heading_link_icon'] ?? '')) : '';
            if (!$hasHeadingLinkIcon && $headingLinkLabel !== '' && preg_match('/\s*\x{2192}\s*$/u', $headingLinkLabel) === 1) {
                $headingLinkLabel = trim((string) preg_replace('/\s*\x{2192}\s*$/u', '', $headingLinkLabel));
                $headingLinkIcon = 'arrow-right';
            }
            if ($nodeLink === '' && !in_array($nodeType, ['row', 'column', 'block'], true)) {
                $nodeLink = '#';
            }
            $entityId = (int) ($item['entity_id'] ?? 0);
            $labelOverride = trim((string) ($item['label_override'] ?? ''));
            $urlOverride = trim((string) ($item['url_override'] ?? ''));
            $sourceLabel = trim((string) ($item['source_label'] ?? ''));
            $sourceUrl = trim((string) ($item['source_url'] ?? ''));
            $productCount = max(0, (int) ($item['product_count'] ?? 0));

            if ($entityId > 0 && $this->isCatalogEntityType($nodeType)) {
                if ($sourceLabel === '') {
                    $sourceLabel = $this->resolveNodeLabel($nodeType, $entityId, ['label_override' => '', 'source_label' => ''], $nodeLabel);
                }

                if ($sourceUrl === '') {
                    $sourceUrl = $this->resolveNodeLink($nodeType, $entityId, $nodeLink, '');
                }

                if ($productCount <= 0 && in_array($nodeType, ['category', 'category_tree'], true)) {
                    $productCount = $this->getCategoryProductCount($entityId);
                }
            }

            $children = isset($item['children']) && is_array($item['children']) ? $item['children'] : [];
            $isProductNode = in_array($nodeType, ['product', 'product_tile'], true);
            $allowsNodeBadge = !in_array($nodeType, ['product', 'product_tile', 'banner', 'video'], true);
            $nodeBadge = $allowsNodeBadge ? (string) ($item['badge'] ?? '') : '';
            $nodeBadgeBackground = $isProductNode ? '' : $this->sanitizeNodeColor((string) ($item['style_badge_background'] ?? ''));
            $nodeBadgeText = $isProductNode ? '' : $this->sanitizeNodeColor((string) ($item['style_badge_text'] ?? ''));
            $rawCssClass = isset($item['css_class']) ? $this->sanitizeNodeCssClass((string) $item['css_class']) : '';
            $componentVariant = $this->sanitizeNodeComponentVariant((string) ($item['component_variant'] ?? ''))
                ?: $this->inferNodeComponentVariantFromClass($rawCssClass);
            if ($nodeType === 'column' && $componentVariant === 'showcase_secondary_row') {
                $nodeType = 'row';
            }
            $displayOptionsSource = array_merge(
                $item,
                isset($item['display_options']) && is_array($item['display_options']) ? $item['display_options'] : []
            );
            $displayOptions = $this->normalizeNodeDisplayOptions($displayOptionsSource);

            $result[] = [
                'id' => $nodeId,
                'type' => $nodeType,
                'label' => $nodeLabel,
                'link' => $nodeLink,
                'heading_link' => $headingLink,
                'heading_link_label' => mb_substr($headingLinkLabel, 0, 128),
                'heading_link_icon' => mb_substr($headingLinkIcon, 0, 128),
                'hide_heading' => !empty($item['hide_heading']) ? 1 : 0,
                'entity_id' => $entityId,
                'label_override' => mb_substr($labelOverride, 0, 255),
                'url_override' => $urlOverride !== '' ? $this->sanitizeNodeLink($urlOverride) : '',
                'source_label' => mb_substr($sourceLabel, 0, 255),
                'source_url' => $sourceUrl !== '' ? $this->sanitizeNodeLink($sourceUrl) : '',
                'hook_name' => $this->sanitizeNodeHookName((string) ($item['hook_name'] ?? '')),
                'image_url' => $this->sanitizeNodeLink((string) ($item['image_url'] ?? '')),
                'map_query' => mb_substr(trim((string) ($item['map_query'] ?? '')), 0, 255),
                'map_embed_url' => $this->sanitizeMapEmbedUrl((string) ($item['map_embed_url'] ?? '')),
                'map_zoom' => $this->normalizeRange((int) ($item['map_zoom'] ?? 15), 1, 20),
                'description' => mb_substr(trim((string) ($item['description'] ?? '')), 0, 500),
                'price' => mb_substr(trim((string) ($item['price'] ?? '')), 0, 128),
                'video_provider' => $this->sanitizeVideoProvider((string) ($item['video_provider'] ?? 'youtube')),
                'video_url' => mb_substr(trim((string) ($item['video_url'] ?? '')), 0, 2048),
                'video_poster' => $this->sanitizeNodeLink((string) ($item['video_poster'] ?? '')),
                'video_aspect' => $this->sanitizeVideoAspect((string) ($item['video_aspect'] ?? '16:9')),
                'video_size' => $this->sanitizeVideoSize((string) ($item['video_size'] ?? 'default')),
                'video_autoplay' => !empty($item['video_autoplay']) ? 1 : 0,
                'video_muted' => !empty($item['video_muted']) || !empty($item['video_autoplay']) ? 1 : 0,
                'video_loop' => !empty($item['video_loop']) ? 1 : 0,
                'video_controls' => array_key_exists('video_controls', $item) ? (!empty($item['video_controls']) ? 1 : 0) : 1,
                'video_lazy' => array_key_exists('video_lazy', $item) ? (!empty($item['video_lazy']) ? 1 : 0) : 1,
                'video_start' => max(0, (int) ($item['video_start'] ?? 0)),
                'video_end' => max(0, (int) ($item['video_end'] ?? 0)),
                'use_fallback_product_tile' => $nodeType === 'product_tile' && !empty($item['use_fallback_product_tile']) ? 1 : 0,
                'target' => !empty($item['target']) ? 1 : 0,
                'link_mode' => $this->sanitizeNodeLinkMode((string) ($item['link_mode'] ?? 'link')),
                'icon' => isset($item['icon']) ? (string) $item['icon'] : '',
                'icon_only' => !empty($item['icon_only']) ? 1 : 0,
                'badge' => $nodeBadge,
                'cta_label' => in_array($nodeType, ['banner', 'video'], true) ? mb_substr(trim((string) ($item['cta_label'] ?? $item['badge'] ?? '')), 0, 128) : '',
                'banner_eyebrow' => $nodeType === 'banner' ? mb_substr(trim((string) ($item['banner_eyebrow'] ?? '')), 0, 128) : '',
                'banner_layout' => $nodeType === 'banner' ? $this->sanitizeNodeBannerLayout((string) ($item['banner_layout'] ?? 'horizontal')) : 'horizontal',
                'component_variant' => $componentVariant,
                'style_background' => $this->sanitizeNodeColor((string) ($item['style_background'] ?? '')),
                'style_background_2' => $this->sanitizeNodeColor((string) ($item['style_background_2'] ?? '')),
                'style_text' => $this->sanitizeNodeColor((string) ($item['style_text'] ?? '')),
                'style_icon' => $this->sanitizeNodeColor((string) ($item['style_icon'] ?? '')),
                'style_border' => $this->sanitizeNodeColor((string) ($item['style_border'] ?? '')),
                'style_radius' => $this->sanitizeNodeCssLength((string) ($item['style_radius'] ?? '')),
                'style_badge_background' => $nodeBadgeBackground,
                'style_badge_text' => $nodeBadgeText,
                'tabs_content_height' => $this->sanitizeNodeCssLength((string) ($item['tabs_content_height'] ?? '')),
                'tabs_content_height_tablet' => $this->sanitizeNodeCssLength((string) ($item['tabs_content_height_tablet'] ?? '')),
                'tabs_content_height_mobile' => $this->sanitizeNodeCssLength((string) ($item['tabs_content_height_mobile'] ?? '')),
                'display_options' => $displayOptions,
                'top_level_placement' => $this->sanitizeTopLevelPlacement((string) ($item['top_level_placement'] ?? '')),
                'top_level_column_start' => $this->normalizeRange((int) ($item['top_level_column_start'] ?? 0), 0, 12),
                'layout_role' => $this->sanitizeNodeLayoutRole((string) ($item['layout_role'] ?? '')),
                'tabs_orientation' => $this->sanitizeNodeTabsOrientation((string) ($item['tabs_orientation'] ?? 'vertical')),
                'columns' => $this->normalizeRange((int) ($item['columns'] ?? 1), 1, 12),
                'column_span' => $this->normalizeRange((int) ($item['column_span'] ?? 0), 0, 12),
                'item_count' => $this->normalizeRange((int) ($item['item_count'] ?? $item['product_count'] ?? 4), 1, 24),
                'carousel_items' => $this->normalizeRange((int) ($item['carousel_items'] ?? 3), 1, 6),
                'carousel_margin' => $this->normalizeRange((int) ($item['carousel_margin'] ?? 12), 0, 48),
                'carousel_autoplay' => !empty($item['carousel_autoplay']) ? 1 : 0,
                'carousel_autoplay_timeout' => $this->normalizeRange((int) ($item['carousel_autoplay_timeout'] ?? 4500), 1000, 20000),
                'blog_category_mode' => $this->sanitizeBlogCategoryMode((string) ($item['blog_category_mode'] ?? 'all')),
                'blog_category_ids' => $this->normalizeIdList($item['blog_category_ids'] ?? []),
                'blog_category_hide_empty' => array_key_exists('blog_category_hide_empty', $item) ? (!empty($item['blog_category_hide_empty']) ? 1 : 0) : 1,
                'blog_category_sort' => $this->sanitizeBlogCategorySort((string) ($item['blog_category_sort'] ?? 'position')),
                'blog_category_show_count' => array_key_exists('blog_category_show_count', $item) ? (!empty($item['blog_category_show_count']) ? 1 : 0) : 1,
                'blog_category_media_mode' => $this->sanitizeBlogCategoryMediaMode((string) ($item['blog_category_media_mode'] ?? 'icon')),
                'product_count' => $productCount,
                'children' => $this->normalizeTree($children, $this->nextNodeContentDepth($nodeType, $depth), $maxDepth),
            ];
        }

        return $result;
    }

    private function nextNodeContentDepth(string $type, int $depth): int
    {
        return in_array($type, ['row', 'column', 'block'], true) ? $depth : $depth + 1;
    }

    private function decodeRows(array $rows): array
    {
        $result = [];
        foreach ($rows as $row) {
            if (!is_array($row)) {
                continue;
            }

            $result[] = [
                'id_menu' => (int) $row['id_menu'],
                'code' => (string) $row['code'],
                'name' => (string) $row['name'],
                'hook_name' => (string) $row['hook_name'],
                'is_active' => (int) $row['is_active'],
                'position' => (int) $row['position'],
                'tree' => $this->hydrateTreeForAdmin($this->decode($row['tree_json'])),
                'settings' => $this->normalizeSettings($this->decode($row['settings_json'])),
                'created_at' => (string) $row['created_at'],
                'updated_at' => (string) $row['updated_at'],
            ];
        }

        return $result;
    }

    private function hydrateTreeForAdmin(array $items): array
    {
        foreach ($items as $index => $node) {
            if (!is_array($node)) {
                continue;
            }

            $type = $this->sanitizeNodeType((string) ($node['type'] ?? 'custom'));
            $entityId = (int) ($node['entity_id'] ?? 0);
            $children = isset($node['children']) && is_array($node['children']) ? $node['children'] : [];
            $rawCssClass = $this->sanitizeNodeCssClass((string) ($node['css_class'] ?? ''));
            $componentVariant = $this->sanitizeNodeComponentVariant((string) ($node['component_variant'] ?? ''))
                ?: $this->inferNodeComponentVariantFromClass($rawCssClass);
            $items[$index]['component_variant'] = $componentVariant;
            unset($items[$index]['css_class']);

            if ($entityId > 0 && $this->isCatalogEntityType($type)) {
                $fallbackLabel = $this->normalizeLabel((string) ($node['label'] ?? 'New item'));
                $fallbackLink = (string) ($node['link'] ?? '#');

                if (trim((string) ($node['source_label'] ?? '')) === '') {
                    $items[$index]['source_label'] = $this->resolveNodeLabel($type, $entityId, ['label_override' => '', 'source_label' => ''], $fallbackLabel);
                }

                if (trim((string) ($node['source_url'] ?? '')) === '') {
                    $items[$index]['source_url'] = $this->resolveNodeLink($type, $entityId, $fallbackLink, '');
                }

                if ((int) ($node['product_count'] ?? 0) <= 0 && in_array($type, ['category', 'category_tree'], true)) {
                    $items[$index]['product_count'] = $this->getCategoryProductCount($entityId);
                }
            }

            if (isset($node['children']) && is_array($node['children'])) {
                $items[$index]['children'] = $this->hydrateTreeForAdmin($node['children']);
            }
        }

        return $items;
    }

    private function validateMenuPayload(array $payload): array
    {
        $errors = [];

        $name = isset($payload['name']) ? trim((string) $payload['name']) : '';
        if ($name === '') {
            $errors[] = $this->module->trans('Menu name is required.', [], 'Modules.CciNiceMenu.Admin');
        }

        $hook = (string) ($payload['hook_name'] ?? '');
        if ($this->sanitizeHook($hook) !== $hook) {
            $errors[] = $this->module->trans('Invalid hook name.', [], 'Modules.CciNiceMenu.Admin');
        }

        if (!is_array($payload['tree'] ?? null)) {
            $errors[] = $this->module->trans('Tree structure must be an array.', [], 'Modules.CciNiceMenu.Admin');
        } else {
            $this->validateNodeTree($payload['tree'], $errors, 'tree');
        }

        $settings = is_array($payload['settings'] ?? null) ? $payload['settings'] : [];
        if (!is_array($settings)) {
            $errors[] = $this->module->trans('Settings must be an object.', [], 'Modules.CciNiceMenu.Admin');
        }

        return ['success' => count($errors) === 0, 'errors' => $errors];
    }

    private function validateNodeTree(array $nodes, array &$errors, string $path, int $depth = 0, int $maxDepth = 8): void
    {
        if ($depth > $maxDepth) {
            $errors[] = $this->module->trans('Menu depth exceeded.', [], 'Modules.CciNiceMenu.Admin');

            return;
        }

        foreach ($nodes as $index => $node) {
            if (!is_array($node)) {
                $errors[] = $this->module->trans('Invalid item at %path%[%index%].', [
                    '%path%' => $path,
                    '%index%' => (string) $index,
                ], 'Modules.CciNiceMenu.Admin');
                continue;
            }

            $label = isset($node['label']) ? (string) $node['label'] : '';
            if (trim($label) === '') {
                $errors[] = $this->module->trans('Empty label at %path%[%index%].', [
                    '%path%' => $path,
                    '%index%' => (string) $index,
                ], 'Modules.CciNiceMenu.Admin');
            }

            $type = $this->sanitizeNodeType((string) ($node['type'] ?? 'custom'));
            $link = isset($node['link']) ? (string) $node['link'] : '#';
            $entityId = (int) ($node['entity_id'] ?? 0);
            $urlOverride = isset($node['url_override']) ? (string) $node['url_override'] : '';
            $normalizedLink = trim($urlOverride) !== '' ? trim($urlOverride) : trim($link);
            $linkMode = $this->sanitizeNodeLinkMode((string) ($node['link_mode'] ?? 'link'));
            if (!in_array($type, ['row', 'column', 'block'], true) && $linkMode !== 'span') {
                $linklessTypes = ['video', 'text', 'image', 'hook', 'map', 'blog_list', 'blog_carousel', 'blog_popular', 'blog_categories'];
                $autoGeneratedEntityTypes = ['category', 'category_tree', 'product', 'product_tile', 'cms_page', 'blog_post'];

                if ($normalizedLink === '' && !in_array($type, $linklessTypes, true) && !($entityId > 0 && in_array($type, $autoGeneratedEntityTypes, true))) {
                    $errors[] = $this->module->trans('Empty link at %path%[%index%].', [
                        '%path%' => $path,
                        '%index%' => (string) $index,
                    ], 'Modules.CciNiceMenu.Admin');
                } elseif ($normalizedLink !== '' && !preg_match('/^(?:https?:\\/\\/|\\/|#|[A-Za-z0-9._~!$&\'()*+,;=:@\\/?#[\\]%-]+)$/', $normalizedLink)) {
                    $errors[] = $this->module->trans('Invalid link at %path%[%index%].', [
                        '%path%' => $path,
                        '%index%' => (string) $index,
                    ], 'Modules.CciNiceMenu.Admin');
                }
            }

            if ($type === 'hook' && $this->sanitizeNodeHookName((string) ($node['hook_name'] ?? '')) === '') {
                $errors[] = $this->module->trans('Invalid hook name at %path%[%index%].', [
                    '%path%' => $path,
                    '%index%' => (string) $index,
                ], 'Modules.CciNiceMenu.Admin');
            }

            $children = isset($node['children']) && is_array($node['children']) ? $node['children'] : [];
            if (!empty($children)) {
                $this->validateNodeTree($children, $errors, $path . '[' . $index . '].children', $this->nextNodeContentDepth($type, $depth), $maxDepth);
            }
        }
    }

    private function renderMenuNodes(array $nodes, int $level = 0, int $maxDepth = 10, string $parentLayoutRole = '', string $parentSystemRole = ''): string
    {
        if ($level > $maxDepth || empty($nodes)) {
            return '';
        }

        if ($level === 0 && $this->hasTopLevelLayoutRows($nodes)) {
            return $this->renderTopLevelLayoutRows($nodes, $maxDepth, $parentLayoutRole, $parentSystemRole);
        }

        $listStyle = $level === 0
            ? ' style="gap:var(--cci-nice-menu-item-gap,8px) !important;column-gap:var(--cci-nice-menu-item-gap,8px) !important;row-gap:var(--cci-nice-menu-item-gap,8px) !important;"'
            : '';
        $output = '<ul class="cci-nice-menu-list cci-nice-menu-level-' . (int) $level . '"' . $listStyle . '>';
        $index = 0;
        foreach ($nodes as $node) {
            if (!is_array($node)) {
                continue;
            }

            ++$index;
            $nodeId = $this->sanitizeNodeId((string) ($node['id'] ?? ''));
            if ($nodeId === '') {
                $nodeId = 'node-' . (int) $level . '-' . (int) $index . '-' . (int) (microtime(true) * 1000);
            }

            $type = $this->sanitizeNodeType((string) ($node['type'] ?? 'custom'));
            $entityId = (int) ($node['entity_id'] ?? 0);
            $label = $this->resolveNodeLabel($type, $entityId, $node, $this->normalizeLabel((string) ($node['label'] ?? 'New item')));
            $link = $this->resolveNodeLink($type, $entityId, (string) ($node['link'] ?? '#'), (string) ($node['url_override'] ?? ''));
            $headingLink = trim((string) ($node['heading_link'] ?? ''));
            $headingLinkLabel = trim((string) ($node['heading_link_label'] ?? ''));
            $headingLinkIcon = trim((string) ($node['heading_link_icon'] ?? ''));
            $target = !empty($node['target']) ? ' target="_blank" rel="noopener noreferrer"' : '';
            $children = isset($node['children']) && is_array($node['children']) ? $node['children'] : [];
            if ($type === 'category_tree' && $entityId > 0 && empty($children)) {
                $children = $level === 0
                    ? $this->buildCategoryFlyoutNodes($entityId)
                    : $this->buildLiveCategoryBrowserNodes($entityId);
            }
            $productCount = (int) ($node['product_count'] ?? 0);
            if ($productCount <= 0 && $entityId > 0 && in_array($type, ['category', 'category_tree'], true)) {
                $productCount = $this->getCategoryProductCount($entityId);
            }
            if (!empty($this->renderSettings['hide_empty_categories']) && in_array($type, ['category', 'category_tree'], true) && $productCount <= 0 && empty($children)) {
                continue;
            }
            $hasChildren = !empty($children);
            $columns = $this->normalizeRange((int) ($node['columns'] ?? 1), 1, 12);
            $layoutRole = $this->sanitizeNodeLayoutRole((string) ($node['layout_role'] ?? ''));
            $tabsOrientation = $this->sanitizeNodeTabsOrientation((string) ($node['tabs_orientation'] ?? 'vertical'));
            $layoutRoleClass = $layoutRole !== '' ? ' cci-nice-menu-role-' . $layoutRole : '';
            $tabsOrientationClass = $layoutRole === 'tabs' ? ' cci-nice-menu-tabs-' . $tabsOrientation : '';
            $videoSizeClass = $type === 'video' ? ' cci-nice-menu-video-size-' . $this->sanitizeVideoSize((string) ($node['video_size'] ?? 'default')) : '';
            $bannerLayoutClass = $type === 'banner' ? ' cci-nice-menu-banner-' . $this->sanitizeNodeBannerLayout((string) ($node['banner_layout'] ?? 'horizontal')) : '';
            $rawCssClass = $this->sanitizeNodeCssClass((string) ($node['css_class'] ?? ''));
            $componentVariant = $this->sanitizeNodeComponentVariant((string) ($node['component_variant'] ?? ''))
                ?: $this->inferNodeComponentVariantFromClass($rawCssClass);
            $componentVariantClass = $this->buildNodeComponentVariantClass($type, $componentVariant);
            $systemClass = $this->buildNodeSystemClass($type, $children, $parentSystemRole);
            $hasChildrenClass = $hasChildren ? ' cci-nice-menu-has-children' : '';
            $iconOnlyClass = (!empty($node['icon_only']) && trim((string) ($node['icon'] ?? '')) !== '') ? ' cci-nice-menu-item-icon-only' : '';
            $visibilityClass = $this->buildNodeVisibilityClass($node);
            $topLevelPlacementClass = $level === 0 ? $this->buildTopLevelPlacementClass($node) : '';
            $itemClass = trim('cci-nice-menu-item cci-nice-menu-depth-' . (int) $level . ' cci-nice-menu-type-' . $this->sanitizeCssClassSuffix($type) . $videoSizeClass . $bannerLayoutClass . $hasChildrenClass . $iconOnlyClass . $layoutRoleClass . $tabsOrientationClass . $componentVariantClass . $systemClass . $visibilityClass . $topLevelPlacementClass);
            $submenuId = 'cci-nice-menu-submenu-' . $nodeId;

            if (in_array($type, ['row', 'column', 'block'], true)) {
                $columnSpan = in_array($type, ['row', 'column'], true) ? $this->normalizeRange((int) ($node['column_span'] ?? 0), 0, 12) : 0;
                $columnSpanClass = $columnSpan > 0 ? ' cci-nice-menu-span-' . (int) $columnSpan : '';
                $structureClass = trim($itemClass . ' cci-nice-menu-structure cci-nice-menu-structure-' . $type . $columnSpanClass);
                $structureVariables = ['--cci-nice-menu-content-columns:' . (int) $columns];
                if ($columnSpan > 0) {
                    $structureVariables[] = '--cci-nice-menu-column-span:' . (int) $columnSpan;
                }
                $structureStyle = $this->buildNodeStyleAttribute($node, $structureVariables);
                $output .= '<li class="' . \Tools::safeOutput($structureClass) . '"' . $structureStyle . '>';
                if ($type === 'block' && empty($node['hide_heading']) && !$this->isGenericStructureLabel($label)) {
                    $output .= '<div class="cci-nice-menu-block-heading">';
                    $blockIconMarkup = '';
                    $blockIconClass = $this->normalizeIconClass((string) ($node['icon'] ?? ''));
                    if ($blockIconClass !== '') {
                        $blockIconMarkup = '<span class="cci-nice-menu-block-heading-icon cci-nice-menu-icon ' . $this->sanitizeNodeCssClass($blockIconClass) . '" aria-hidden="true"></span>';
                    }
                    $blockDescription = trim((string) ($node['description'] ?? ''));
                    $output .= $blockIconMarkup;
                    $output .= '<span class="cci-nice-menu-block-heading-copy">';
                    $output .= '<span class="cci-nice-menu-block-heading-text">' . \Tools::safeOutput($label) . '</span>';
                    if ($blockDescription !== '') {
                        $output .= '<span class="cci-nice-menu-block-heading-description">' . \Tools::safeOutput($blockDescription) . '</span>';
                    }
                    $output .= '</span>';
                    if ($headingLink !== '') {
                        $actionLabel = $headingLinkLabel !== ''
                            ? $headingLinkLabel
                            : $this->module->trans('View all', [], 'Modules.CciNiceMenu.Shop');
                        $actionIconMarkup = '';
                        $actionIconClass = $this->normalizeIconClass($headingLinkIcon);
                        if ($actionIconClass !== '') {
                            $actionIconMarkup = '<span class="cci-nice-menu-block-heading-action-icon cci-nice-menu-icon ' . $this->sanitizeNodeCssClass($actionIconClass) . '" aria-hidden="true"></span>';
                        }
                        $output .= '<a class="cci-nice-menu-block-heading-action cci-nice-menu-block-heading-link" href="' . \Tools::safeOutput($headingLink) . '"' . $target . '><span class="cci-nice-menu-block-heading-action-text">' . \Tools::safeOutput($actionLabel) . '</span>' . $actionIconMarkup . '</a>';
                    }
                    $output .= '</div>';
                }
                if (!empty($children)) {
                    $childParentLayoutRole = $layoutRole !== '' ? $layoutRole : $parentLayoutRole;
                    $childParentSystemRole = $this->resolveChildSystemRole($type, $children, $parentSystemRole, $componentVariant);
                    $output .= $this->renderMenuNodes($children, $level + 1, $maxDepth, $childParentLayoutRole, $childParentSystemRole);
                }
                $output .= '</li>';
                continue;
            }

            $iconMarkup = '';
            $iconClass = $this->normalizeIconClass((string) ($node['icon'] ?? ''));
            if ($iconClass !== '') {
                $iconMarkup = '<span class="cci-nice-menu-icon ' . $this->sanitizeNodeCssClass($iconClass) . '" aria-hidden="true"></span>';
            }
            $linkMediaMarkup = $iconMarkup;
            if ($type === 'category') {
                $linkMediaMarkup = $this->buildCategoryMediaMarkup($node, $label, $iconMarkup, $parentLayoutRole, $parentSystemRole);
            } elseif (in_array($type, ['custom', 'cms_page'], true)) {
                $linkImageUrl = $this->sanitizeNodeLink((string) ($node['image_url'] ?? ''));
                if ($linkImageUrl !== '' && $linkImageUrl !== '#') {
                    $linkMediaMarkup = '<span class="cci-nice-menu-link-media"><img src="' . \Tools::safeOutput($linkImageUrl) . '" alt="' . \Tools::safeOutput($label) . '" loading="lazy"></span>';
                }
            }
            $iconOnly = !empty($node['icon_only']) && $linkMediaMarkup !== '';

            $isProDelegatedNode = $this->isProDelegatedNodeType($type);
            $ctaText = (!$isProDelegatedNode && in_array($type, ['banner', 'video'], true)) ? trim((string) ($node['cta_label'] ?? '')) : '';
            $badgeText = (!$isProDelegatedNode && !in_array($type, ['product', 'product_tile', 'banner', 'video'], true)) ? trim((string) ($node['badge'] ?? '')) : '';
            $badgeMarkup = '';
            if ($ctaText !== '') {
                $hasVideoActionLink = $type === 'video' && $link !== '' && $link !== '#';
                if ($hasVideoActionLink) {
                    $badgeMarkup = '<a class="cci-nice-menu-video-cta" href="' . \Tools::safeOutput($link) . '"' . $target . ' aria-label="' . \Tools::safeOutput($label !== '' ? $label : $ctaText) . '">' . \Tools::safeOutput($ctaText) . '</a>';
                } elseif ($type === 'banner') {
                    $badgeMarkup = '<span class="cci-nice-menu-banner-cta">' . \Tools::safeOutput($ctaText) . '</span>';
                }
            } elseif ($badgeText !== '') {
                $badgeMarkup = '<span class="cci-nice-menu-badge">' . \Tools::safeOutput($badgeText) . '</span>';
            }
            $descriptionText = trim((string) ($node['description'] ?? ''));
            $descriptionMarkup = $descriptionText !== ''
                ? '<span class="cci-nice-menu-description">' . \Tools::safeOutput($descriptionText) . '</span>'
                : '';
            $countMarkup = '';
            if (!empty($this->renderSettings['show_counts']) && in_array($type, ['category', 'category_tree'], true)) {
                $countMarkup = '<span class="cci-nice-menu-count">' . (int) $productCount . '</span>';
            }

            $nodeStyleVariables = $level === 0 ? $this->buildTopLevelGridVariables($node) : [];
            $output .= '<li class="' . \Tools::safeOutput($itemClass) . '"' . $this->buildNodeStyleAttribute($node, $nodeStyleVariables) . '>';
            $output .= '<div class="cci-nice-menu-row">';
            $linkClass = $iconOnly ? 'cci-nice-menu-link cci-nice-menu-link-icon-only' : 'cci-nice-menu-link';
            $linkAria = $iconOnly ? ' aria-label="' . \Tools::safeOutput($label !== '' ? $label : 'Menu item') . '"' : '';
            $linkMode = $this->sanitizeNodeLinkMode((string) ($node['link_mode'] ?? 'link'));
            $isControllerLabel = $hasChildren && in_array($parentLayoutRole, ['tabs', 'rail'], true);
            $linkTag = ($linkMode === 'span' || $isControllerLabel) ? 'span' : 'a';
            if ($linkTag === 'span') {
                $linkClass .= ' cci-nice-menu-link-static';
            }
            $delegatedNodeMarkup = $this->renderProNode($node, [
                'type' => $type,
                'label' => $label,
                'link' => $link,
                'target' => $target,
                'icon_markup' => $iconMarkup,
                'parent_layout_role' => $parentLayoutRole,
                'parent_system_role' => $parentSystemRole,
                'level' => $level,
            ]);
            if ($delegatedNodeMarkup !== null) {
                $output .= $delegatedNodeMarkup;
            } elseif ($type === 'blog_categories') {
                $output .= $this->renderBlogCategoriesNode($node, $label, $iconMarkup);
            } elseif ($type === 'product') {
                $output .= $this->renderCompactProductLink($node, $label, $link, $target, $iconMarkup);
            } elseif ($type === 'text' || $componentVariant === 'showcase_store_status') {
                $statusLink = $componentVariant === 'showcase_store_status' ? '' : $link;
                $output .= $this->renderTextNode($node, $label, $statusLink, $target, $iconMarkup);
            } else {
                $linkAttributes = $linkTag === 'a'
                    ? ' href="' . \Tools::safeOutput($link) . '"' . $target . $linkAria
                    : $linkAria;
                $output .= '<' . $linkTag . ' class="' . \Tools::safeOutput($linkClass) . '"' . $linkAttributes . '>';
                if ($linkMediaMarkup !== '') {
                    $output .= $linkMediaMarkup;
                }
                if (!$iconOnly) {
                    $output .= '<span class="cci-nice-menu-label">' . \Tools::safeOutput($label) . '</span>';
                    $output .= $descriptionMarkup;
                }
                $output .= '</' . $linkTag . '>';
            }
            $output .= $badgeMarkup;
            $output .= $countMarkup;
            if ($hasChildren) {
                $output .= '<button type="button" class="cci-nice-menu-toggle" data-submenu-toggle="' . \Tools::safeOutput($submenuId) . '" aria-expanded="false" aria-controls="' . \Tools::safeOutput($submenuId) . '">';
                $output .= '<span class="cci-nice-menu-plus" aria-hidden="true">▾</span>';
                $output .= '</button>';
            }
            $output .= '</div>';

            if ($hasChildren) {
                $submenuClass = 'cci-nice-menu-submenu cci-nice-menu-submenu-depth-' . (int) ($level + 1);
                $isControllerPanel = in_array($parentLayoutRole, ['tabs', 'rail'], true);
                if (($isControllerPanel && $level >= 4) || (!$isControllerPanel && $level >= 2)) {
                    $submenuClass .= ' cci-nice-menu-submenu-nested';
                }

                $output .= '<div id="' . \Tools::safeOutput($submenuId) . '" class="' . \Tools::safeOutput($submenuClass) . '" style="--cci-nice-menu-submenu-columns:' . (int) $columns . ';">';
                $childParentSystemRole = $this->resolveChildSystemRole($type, $children, $parentSystemRole, $componentVariant);
                $output .= $this->renderMenuNodes($children, $level + 1, $maxDepth, $layoutRole, $childParentSystemRole);
                $output .= '</div>';
            }

            $output .= '</li>';
        }

        $output .= '</ul>';

        return $output;
    }

    private function hasTopLevelLayoutRows(array $nodes): bool
    {
        foreach ($nodes as $node) {
            if (!is_array($node)) {
                continue;
            }

            $type = $this->sanitizeNodeType((string) ($node['type'] ?? 'custom'));
            if (in_array($type, ['row', 'column'], true)) {
                return true;
            }
        }

        return false;
    }

    private function renderTopLevelLayoutRows(array $nodes, int $maxDepth = 10, string $parentLayoutRole = '', string $parentSystemRole = ''): string
    {
        $output = '<ul class="cci-nice-menu-list cci-nice-menu-level-0 cci-nice-menu-top-layout-list" style="gap:var(--cci-nice-menu-item-gap,8px) !important;column-gap:var(--cci-nice-menu-item-gap,8px) !important;row-gap:var(--cci-nice-menu-item-gap,8px) !important;">';
        $rowIndex = 0;

        foreach ($nodes as $node) {
            if (!is_array($node)) {
                continue;
            }

            $type = $this->sanitizeNodeType((string) ($node['type'] ?? 'custom'));
            if (!in_array($type, ['row', 'column'], true)) {
                $output .= '<li class="cci-nice-menu-top-layout-row cci-nice-menu-top-layout-row-legacy">';
                $output .= '<div class="cci-nice-menu-top-row-grid">';
                $output .= '<div class="cci-nice-menu-top-layout-column cci-nice-menu-top-layout-column-legacy" style="--cci-nice-menu-top-column-span:12;--cci-nice-menu-column-span:12;">';
                $output .= $this->renderMenuNodes([$node], 0, $maxDepth, $parentLayoutRole, $parentSystemRole);
                $output .= '</div>';
                $output .= '</div>';
                $output .= '</li>';
                continue;
            }

            ++$rowIndex;
            $children = isset($node['children']) && is_array($node['children']) ? $node['children'] : [];
            $rowSpan = $this->normalizeRange((int) ($node['column_span'] ?? 12), 1, 12);
            $rowVisibilityClass = $this->buildNodeVisibilityClass($node);
            $rowClass = trim('cci-nice-menu-top-layout-row cci-nice-menu-structure cci-nice-menu-structure-row cci-nice-menu-depth-0 cci-nice-menu-span-' . (int) $rowSpan . $rowVisibilityClass);
            $rowStyle = $this->buildNodeStyleAttribute($node, [
                '--cci-nice-menu-column-span:' . (int) $rowSpan,
            ]);

            $output .= '<li class="' . \Tools::safeOutput($rowClass) . '"' . $rowStyle . '>';
            $output .= '<div class="cci-nice-menu-top-row-grid">';
            if ($type === 'column') {
                $output .= $this->renderTopLevelLayoutColumn($node, $maxDepth, $parentLayoutRole, $parentSystemRole);
            } else {
                foreach ($children as $child) {
                    if (!is_array($child)) {
                        continue;
                    }

                    $childType = $this->sanitizeNodeType((string) ($child['type'] ?? 'custom'));
                    if ($childType === 'column') {
                        $output .= $this->renderTopLevelLayoutColumn($child, $maxDepth, $parentLayoutRole, $parentSystemRole);
                    } else {
                        $output .= '<div class="cci-nice-menu-top-layout-column cci-nice-menu-top-layout-column-legacy" style="--cci-nice-menu-top-column-span:12;--cci-nice-menu-column-span:12;">';
                        $output .= $this->renderMenuNodes([$child], 0, $maxDepth, $parentLayoutRole, $parentSystemRole);
                        $output .= '</div>';
                    }
                }
            }
            $output .= '</div>';
            $output .= '</li>';
        }

        $output .= '</ul>';

        return $output;
    }

    private function renderTopLevelLayoutColumn(array $node, int $maxDepth, string $parentLayoutRole = '', string $parentSystemRole = ''): string
    {
        $children = isset($node['children']) && is_array($node['children']) ? $node['children'] : [];
        $columnSpan = $this->normalizeRange((int) ($node['column_span'] ?? 0), 1, 12);
        $placementClass = $this->buildTopLevelPlacementClass($node);
        $visibilityClass = $this->buildNodeVisibilityClass($node);
        $componentVariant = $this->sanitizeNodeComponentVariant((string) ($node['component_variant'] ?? ''));
        $variantClass = $componentVariant !== '' ? ' cci-nice-menu-variant-' . $this->sanitizeCssClassSuffix($componentVariant) : '';
        $columnClass = trim('cci-nice-menu-top-layout-column cci-nice-menu-structure cci-nice-menu-structure-column cci-nice-menu-span-' . (int) $columnSpan . $placementClass . $visibilityClass . $variantClass);
        $columnStyle = $this->buildNodeStyleAttribute($node, [
            '--cci-nice-menu-top-column-span:' . (int) $columnSpan,
            '--cci-nice-menu-column-span:' . (int) $columnSpan,
        ]);

        $output = '<div class="' . \Tools::safeOutput($columnClass) . '"' . $columnStyle . '>';
        $output .= $this->renderMenuNodes($children, 0, $maxDepth, $parentLayoutRole, $parentSystemRole);
        $output .= '</div>';

        return $output;
    }

    private function renderProNode(array $node, array $context): ?string
    {
        $type = $this->sanitizeNodeType((string) ($context['type'] ?? $node['type'] ?? 'custom'));
        if (!$this->isProDelegatedNodeType($type)) {
            return null;
        }

        $raw = \Hook::exec('displayCciNiceMenuRenderNode', [
            'node' => $node,
            'context' => $context,
            'type' => $type,
            'module' => $this->module->name,
        ], null, true);

        if (!is_array($raw)) {
            return '';
        }

        foreach ($raw as $rendered) {
            if (is_array($rendered) && isset($rendered['html'])) {
                $rendered = $rendered['html'];
            }

            if (is_string($rendered) && trim($rendered) !== '') {
                return $rendered;
            }
        }

        return '';
    }

    private function isProDelegatedNodeType(string $type): bool
    {
        return in_array($type, [
            'product_tile',
            'blog_post',
            'blog_list',
            'blog_carousel',
            'blog_popular',
            'banner',
            'video',
            'image',
            'map',
            'hook',
        ], true);
    }

    private function resolveBlockHeadingLink(array $children = []): string
    {
        foreach ($children as $child) {
            if (!is_array($child)) {
                continue;
            }

            $childType = $this->sanitizeNodeType((string) ($child['type'] ?? 'custom'));
            $childEntityId = (int) ($child['entity_id'] ?? 0);
            $childLink = $this->resolveNodeLink($childType, $childEntityId, (string) ($child['link'] ?? '#'), (string) ($child['url_override'] ?? ''));
            if ($childLink !== '' && $childLink !== '#') {
                return $childLink;
            }

            $childChildren = isset($child['children']) && is_array($child['children']) ? $child['children'] : [];
            if (!empty($childChildren)) {
                $nestedLink = $this->resolveBlockHeadingLink($childChildren);
                if ($nestedLink !== '') {
                    return $nestedLink;
                }
            }
        }

        return '';
    }

    private function normalizeLabel($label): string
    {
        if (is_array($label)) {
            $langId = (int) \Context::getContext()->language->id;
            if (isset($label[$langId])) {
                return (string) $label[$langId];
            }

            if (!empty($label)) {
                $first = reset($label);

                return (string) $first;
            }
        }

        return (string) $label;
    }

    private function sanitizeNodeLink(string $link): string
    {
        $link = trim($link);
        if ($link === '') {
            return '#';
        }

        if (preg_match('/^(?:https?:\\/\\/|\\/|#|[A-Za-z0-9._~!$&\'()*+,;=:@\\/?#[\\]%-]+)$/', $link)) {
            return $link;
        }

        return '#';
    }

    private function sanitizeMapEmbedUrl(string $url): string
    {
        $url = trim($url);
        if ($url === '') {
            return '';
        }

        if (!filter_var($url, FILTER_VALIDATE_URL)) {
            return '';
        }

        $host = strtolower((string) parse_url($url, PHP_URL_HOST));
        $allowedHosts = [
            'google.com',
            'www.google.com',
            'maps.google.com',
            'www.google.pl',
            'maps.google.pl',
            'www.openstreetmap.org',
            'openstreetmap.org',
        ];

        return in_array($host, $allowedHosts, true) ? $url : '';
    }

    private function resolveNodeLabel(string $type, int $entityId, array $node, string $fallback): string
    {
        $override = trim((string) ($node['label_override'] ?? ''));
        if ($override !== '') {
            return $override;
        }

        $context = \Context::getContext();
        $shopId = (int) $context->shop->id;
        $langId = (int) $context->language->id;

        if ($entityId > 0 && in_array($type, ['category', 'category_tree'], true)) {
            $label = \Db::getInstance()->getValue(
                'SELECT cl.name
                FROM `' . _DB_PREFIX_ . 'category_lang` cl
                WHERE cl.id_category = ' . (int) $entityId . '
                AND cl.id_lang = ' . (int) $langId . '
                AND cl.id_shop = ' . (int) $shopId
            );

            if (is_string($label) && trim($label) !== '') {
                return trim($label);
            }
        }

        if ($entityId > 0 && in_array($type, ['product', 'product_tile'], true)) {
            $label = \Db::getInstance()->getValue(
                'SELECT pl.name
                FROM `' . _DB_PREFIX_ . 'product_lang` pl
                INNER JOIN `' . _DB_PREFIX_ . 'product_shop` ps ON (ps.id_product = pl.id_product AND ps.id_shop = ' . (int) $shopId . ')
                WHERE pl.id_product = ' . (int) $entityId . '
                AND pl.id_lang = ' . (int) $langId . '
                AND pl.id_shop = ' . (int) $shopId . '
                AND ps.active = 1'
            );

            if (is_string($label) && trim($label) !== '') {
                return trim($label);
            }
        }

        if ($entityId > 0 && $type === 'cms_page') {
            $label = \Db::getInstance()->getValue(
                'SELECT cmsl.meta_title
                FROM `' . _DB_PREFIX_ . 'cms_lang` cmsl
                INNER JOIN `' . _DB_PREFIX_ . 'cms_shop` cmss ON (cmss.id_cms = cmsl.id_cms AND cmss.id_shop = ' . (int) $shopId . ')
                INNER JOIN `' . _DB_PREFIX_ . 'cms` cms ON (cms.id_cms = cmsl.id_cms AND cms.active = 1)
                WHERE cmsl.id_cms = ' . (int) $entityId . '
                AND cmsl.id_lang = ' . (int) $langId
            );

            if (is_string($label) && trim($label) !== '') {
                return trim($label);
            }
        }

        if ($entityId > 0 && $type === 'blog_post' && $this->blogTablesAvailable()) {
            $label = \Db::getInstance()->getValue(
                'SELECT pl.title
                FROM `' . _DB_PREFIX_ . 'cci_blog_post` p
                INNER JOIN `' . _DB_PREFIX_ . 'cci_blog_post_shop` ps ON (ps.id_post = p.id_post AND ps.id_shop = ' . (int) $shopId . ')
                INNER JOIN `' . _DB_PREFIX_ . 'cci_blog_post_lang` pl ON (pl.id_post = p.id_post AND pl.id_lang = ' . (int) $langId . ' AND pl.id_shop = ' . (int) $shopId . ')
                WHERE p.id_post = ' . (int) $entityId . '
                AND p.active = 1
                AND (p.date_published IS NULL OR p.date_published <= \'' . pSQL(date('Y-m-d H:i:s')) . '\')'
            );

            if (is_string($label) && trim($label) !== '') {
                return trim($label);
            }
        }

        $sourceLabel = trim((string) ($node['source_label'] ?? ''));
        if ($sourceLabel !== '') {
            return $sourceLabel;
        }

        return $fallback;
    }

    private function resolveNodeLink(string $type, int $entityId, string $fallback, string $override = ''): string
    {
        if (trim($override) !== '') {
            return $this->sanitizeNodeLink($override);
        }

        $fallback = $this->sanitizeNodeLink($fallback);
        $context = \Context::getContext();

        if ($entityId > 0 && in_array($type, ['category', 'category_tree'], true)) {
            $link = $context->link->getCategoryLink($entityId);

            return is_string($link) && $link !== '' ? $link : $fallback;
        }

        if ($entityId > 0 && in_array($type, ['product', 'product_tile'], true)) {
            $link = $context->link->getProductLink($entityId);

            return is_string($link) && $link !== '' ? $link : $fallback;
        }

        if ($entityId > 0 && $type === 'cms_page') {
            $link = $context->link->getCMSLink($entityId);

            return is_string($link) && $link !== '' ? $link : $fallback;
        }

        if ($entityId > 0 && $type === 'blog_post') {
            $post = $this->getBlogPostData($entityId, [], '', '');
            $link = (string) ($post['link'] ?? '');

            return $link !== '' ? $link : $fallback;
        }

        return $fallback;
    }

    private function buildCategoryTreeNodes(int $parentId, int $depth = 0, int $maxDepth = 3): array
    {
        if ($parentId <= 0 || $depth >= $maxDepth) {
            return [];
        }

        $context = \Context::getContext();
        $nodes = [];
        foreach ($this->getCategoryChildrenRows($parentId, 60) as $row) {
            $categoryId = (int) $row['id_category'];
            $children = $this->buildCategoryTreeNodes($categoryId, $depth + 1, $maxDepth);
            $productCount = $this->getCategoryProductCount($categoryId);
            if (!empty($this->renderSettings['hide_empty_categories']) && $productCount <= 0 && empty($children)) {
                continue;
            }

            $nodes[] = $this->buildCategoryNodeFromRow($row, $children, 1, $productCount);
        }

        return $nodes;
    }

    private function buildLiveCategoryBrowserNodes(int $parentId): array
    {
        if ($parentId <= 0) {
            return [];
        }

        $nodes = [];
        foreach ($this->getCategoryChildrenRows($parentId, 12) as $row) {
            $categoryId = (int) $row['id_category'];
            $children = $this->buildLiveCategoryBrowserChildren($row, 0, 2);
            $productCount = $this->getCategoryProductCount($categoryId);
            if (!empty($this->renderSettings['hide_empty_categories']) && $productCount <= 0 && empty($children)) {
                continue;
            }

            $node = $this->buildCategoryNodeFromRow($row, $children, 1, $productCount);
            $node['link_mode'] = 'span';
            $nodes[] = $node;
        }

        return $nodes;
    }

    private function buildLiveCategoryBrowserChildren(array $parentRow, int $depth = 0, int $maxDepth = 2): array
    {
        $parentId = (int) $parentRow['id_category'];
        if ($parentId <= 0 || $depth >= $maxDepth) {
            return [];
        }

        $limit = $depth === 0 ? 8 : 6;
        $nodes = [];
        foreach ($this->getCategoryChildrenRows($parentId, $limit) as $row) {
            $categoryId = (int) $row['id_category'];
            $children = $this->buildLiveCategoryBrowserChildren($row, $depth + 1, $maxDepth);
            $productCount = $this->getCategoryProductCount($categoryId);
            if (!empty($this->renderSettings['hide_empty_categories']) && $productCount <= 0 && empty($children)) {
                continue;
            }

            $nodes[] = $this->buildCategoryNodeFromRow($row, $children, 1, $productCount);
        }

        if (!empty($nodes)) {
            $nodes[] = $this->buildLiveCategoryViewAllNode($parentRow);
        }

        return $nodes;
    }

    private function buildLiveCategoryViewAllNode(array $row): array
    {
        $context = \Context::getContext();
        $shopId = (int) $context->shop->id;
        $langId = (int) $context->language->id;
        $categoryId = (int) $row['id_category'];
        $categoryName = trim((string) ($row['name'] ?? ''));

        $viewMoreLabel = trim((string) $this->module->trans('View more', [], 'Modules.CciNiceMenu.Shop'));

        return [
            'id' => 'category-view-all-' . $categoryId,
            'type' => 'custom',
            'label' => $viewMoreLabel !== '' ? $viewMoreLabel : 'View more',
            'link' => $context->link->getCategoryLink($categoryId, (string) ($row['link_rewrite'] ?? ''), $langId, null, $shopId),
            'entity_id' => 0,
            'target' => 0,
            'icon' => 'arrow-right',
            'badge' => '',
            'component_variant' => 'live_category_view_all',
            'columns' => 1,
            'product_count' => 0,
            'children' => [],
        ];
    }

    private function buildCategoryMediaMarkup(array $node, string $label, string $iconMarkup, string $parentLayoutRole, string $parentSystemRole): string
    {
        $categoryImageUrl = $this->sanitizeNodeLink((string) ($node['image_url'] ?? ''));
        if (($categoryImageUrl === '' || $categoryImageUrl === '#') && (int) ($node['entity_id'] ?? 0) > 0) {
            $categoryImageUrl = $this->getCategoryImageUrl((int) $node['entity_id'], $this->getCategoryLinkRewrite((int) $node['entity_id']));
        }
        $imageMarkup = '';
        if ($categoryImageUrl !== '' && $categoryImageUrl !== '#') {
            $imageMarkup = '<span class="cci-nice-menu-category-media"><img src="' . \Tools::safeOutput($categoryImageUrl) . '" alt="' . \Tools::safeOutput($label) . '" loading="lazy"></span>';
        }

        if (!$this->isCategoryTabMediaContext($parentLayoutRole, $parentSystemRole)) {
            return $imageMarkup !== '' ? $imageMarkup : $iconMarkup;
        }

        $mode = $this->sanitizeCategoryTabMediaMode((string) ($this->renderSettings['category_tab_media_mode'] ?? 'auto'));
        if ($mode === 'none') {
            return '';
        }

        if ($mode === 'icon') {
            return $iconMarkup;
        }

        if ($mode === 'thumbnail') {
            return $imageMarkup !== '' ? $imageMarkup : $iconMarkup;
        }

        return $iconMarkup !== '' ? $iconMarkup : $imageMarkup;
    }

    private function isCategoryTabMediaContext(string $parentLayoutRole, string $parentSystemRole): bool
    {
        return $parentLayoutRole === 'tabs' || $parentSystemRole === 'live_category_tree_block';
    }

    private function buildCategoryFlyoutNodes(int $parentId): array
    {
        $mainNodes = [];
        foreach ($this->getCategoryChildrenRows($parentId, 80) as $row) {
            $categoryId = (int) $row['id_category'];
            $columns = $this->buildCategoryFlyoutColumns($categoryId);
            $productCount = $this->getCategoryProductCount($categoryId);
            if (!empty($this->renderSettings['hide_empty_categories']) && $productCount <= 0 && empty($columns)) {
                continue;
            }

            $mainNodes[] = $this->buildCategoryNodeFromRow($row, $columns, max(1, count($columns)), $productCount);
        }

        if (empty($mainNodes)) {
            return [];
        }

        return [
            [
                'id' => 'dynamic-catalog-rail-' . (int) $parentId,
                'type' => 'column',
                'label' => 'Category rail',
                'link' => '',
                'entity_id' => 0,
                'target' => 0,
                'icon' => '',
                'badge' => '',
                'component_variant' => 'dynamic_catalog_tabs',
                'layout_role' => 'tabs',
                'tabs_orientation' => 'vertical',
                'columns' => 1,
                'product_count' => 0,
                'children' => [
                    [
                        'id' => 'dynamic-catalog-block-' . (int) $parentId,
                        'type' => 'block',
                        'label' => 'Block',
                        'link' => '',
                        'entity_id' => 0,
                        'target' => 0,
                        'icon' => '',
                        'badge' => '',
                        'hide_heading' => 1,
                        'component_variant' => 'dynamic_catalog_block',
                        'columns' => 1,
                        'product_count' => 0,
                        'children' => $mainNodes,
                    ],
                ],
            ],
        ];
    }

    private function buildCategoryFlyoutColumns(int $parentId): array
    {
        $columns = [];
        foreach ($this->getCategoryChildrenRows($parentId, 36) as $index => $row) {
            $categoryId = (int) $row['id_category'];
            $children = $this->buildCategoryTreeNodes($categoryId, 0, 2);
            $productCount = $this->getCategoryProductCount($categoryId);
            if (!empty($this->renderSettings['hide_empty_categories']) && $productCount <= 0 && empty($children)) {
                continue;
            }

            $blockChildren = !empty($children)
                ? $children
                : [$this->buildCategoryNodeFromRow($row, [], 1, $productCount)];
            $blockLabel = !empty($children) ? (string) $row['name'] : 'Block';

            $columns[] = [
                'id' => 'dynamic-category-column-' . $categoryId,
                'type' => 'column',
                'label' => (string) $row['name'],
                'link' => '',
                'entity_id' => 0,
                'target' => 0,
                'icon' => '',
                'badge' => '',
                'component_variant' => 'dynamic_category_column',
                'columns' => 1,
                'product_count' => 0,
                'children' => [
                    [
                        'id' => 'dynamic-category-block-' . $categoryId,
                        'type' => 'block',
                        'label' => $blockLabel,
                        'link' => '',
                        'entity_id' => 0,
                        'target' => 0,
                        'icon' => '',
                        'badge' => '',
                        'hide_heading' => !empty($children) ? 0 : 1,
                        'component_variant' => 'dynamic_category_block',
                        'columns' => 1,
                        'product_count' => 0,
                        'children' => $blockChildren,
                    ],
                ],
            ];
        }

        return $columns;
    }

    private function getCategoryChildrenRows(int $parentId, int $limit = 60): array
    {
        $context = \Context::getContext();
        $shopId = (int) $context->shop->id;
        $langId = (int) $context->language->id;

        $rows = \Db::getInstance()->executeS(
            'SELECT c.id_category, cl.name, cl.link_rewrite
            FROM `' . _DB_PREFIX_ . 'category` c
            INNER JOIN `' . _DB_PREFIX_ . 'category_shop` cs ON (cs.id_category = c.id_category)
            INNER JOIN `' . _DB_PREFIX_ . 'category_lang` cl ON (cl.id_category = c.id_category)
            WHERE c.active = 1
            AND c.id_parent = ' . (int) $parentId . '
            AND cs.id_shop = ' . (int) $shopId . '
            AND cl.id_shop = ' . (int) $shopId . '
            AND cl.id_lang = ' . (int) $langId . '
            ORDER BY c.position ASC, cl.name ASC
            LIMIT ' . (int) $this->normalizeRange($limit, 1, 120)
        );

        return is_array($rows) ? $rows : [];
    }

    private function buildCategoryNodeFromRow(array $row, array $children = [], int $columns = 1, ?int $productCount = null): array
    {
        $context = \Context::getContext();
        $shopId = (int) $context->shop->id;
        $langId = (int) $context->language->id;
        $categoryId = (int) $row['id_category'];
        $children = $this->wrapDirectLayoutColumnsInRow((string) $row['name'], $children);
        $childrenAreWrappedRow = count($children) === 1
            && isset($children[0])
            && is_array($children[0])
            && $this->sanitizeNodeType((string) ($children[0]['type'] ?? 'custom')) === 'row';

        return [
            'id' => 'category-' . $categoryId,
            'type' => 'category',
            'label' => (string) $row['name'],
            'link' => $context->link->getCategoryLink($categoryId, (string) $row['link_rewrite'], $langId, null, $shopId),
            'entity_id' => $categoryId,
            'target' => 0,
            'icon' => '',
            'image_url' => $this->getCategoryImageUrl($categoryId, (string) ($row['link_rewrite'] ?? '')),
            'badge' => '',
            'columns' => $this->normalizeRange($childrenAreWrappedRow ? 1 : $columns, 1, 12),
            'product_count' => $productCount ?? $this->getCategoryProductCount($categoryId),
            'children' => $children,
        ];
    }

    private function wrapDirectLayoutColumnsInRow(string $label, array $children): array
    {
        if (empty($children)) {
            return $children;
        }

        $hasDirectColumns = false;
        foreach ($children as $child) {
            if (!is_array($child)) {
                continue;
            }

            $childType = $this->sanitizeNodeType((string) ($child['type'] ?? 'custom'));
            if ($childType === 'row') {
                return $children;
            }

            if ($childType === 'column') {
                $hasDirectColumns = true;
            }
        }

        if (!$hasDirectColumns) {
            return $children;
        }

        return [[
            'id' => 'layout-row-' . substr(sha1($label . ':' . count($children)), 0, 10),
            'type' => 'row',
            'label' => trim($label) !== '' ? trim($label) . ' row' : 'Row',
            'link' => '',
            'entity_id' => 0,
            'target' => 0,
            'icon' => '',
            'badge' => '',
            'component_variant' => '',
            'columns' => 1,
            'column_span' => 12,
            'product_count' => 0,
            'children' => $children,
        ]];
    }

    private function getCategoryImageUrl(int $categoryId, string $linkRewrite): string
    {
        if ($categoryId <= 0) {
            return '';
        }

        $categoryImageDir = defined('_PS_CAT_IMG_DIR_') ? _PS_CAT_IMG_DIR_ : '';
        $imageType = 'category_default';
        if ($categoryImageDir !== '' && is_file($categoryImageDir . $categoryId . '-' . $imageType . '.jpg')) {
            return (string) \Context::getContext()->link->getCatImageLink($linkRewrite, $categoryId, $imageType);
        }

        if ($categoryImageDir !== '' && is_file($categoryImageDir . $categoryId . '.jpg')) {
            return (string) \Context::getContext()->link->getCatImageLink($linkRewrite, $categoryId);
        }

        return '';
    }

    private function getCategoryLinkRewrite(int $categoryId): string
    {
        if ($categoryId <= 0) {
            return '';
        }

        $context = \Context::getContext();
        $linkRewrite = \Db::getInstance()->getValue(
            'SELECT cl.link_rewrite
            FROM `' . _DB_PREFIX_ . 'category_lang` cl
            WHERE cl.id_category = ' . (int) $categoryId . '
            AND cl.id_lang = ' . (int) $context->language->id . '
            AND cl.id_shop = ' . (int) $context->shop->id
        );

        return is_string($linkRewrite) ? $linkRewrite : '';
    }

    private function getCategoryProductCount(int $categoryId): int
    {
        if ($categoryId <= 0) {
            return 0;
        }

        $shopId = (int) \Context::getContext()->shop->id;

        return (int) \Db::getInstance()->getValue(
            'SELECT COUNT(DISTINCT ps.id_product)
            FROM `' . _DB_PREFIX_ . 'category_product` cp
            INNER JOIN `' . _DB_PREFIX_ . 'product_shop` ps ON (ps.id_product = cp.id_product)
            WHERE cp.id_category = ' . (int) $categoryId . '
            AND ps.id_shop = ' . (int) $shopId . '
            AND ps.active = 1'
        );
    }

    private function getProductTileData(int $productId, array $node, string $fallbackLabel, string $fallbackLink): array
    {
        $context = \Context::getContext();
        $shopId = (int) $context->shop->id;
        $langId = (int) $context->language->id;
        $label = $fallbackLabel;
        $configuredImageUrl = trim((string) ($node['image_url'] ?? ''));
        $imageUrl = $configuredImageUrl !== '' ? $this->sanitizeNodeLink($configuredImageUrl) : '';
        if ($imageUrl === '#') {
            $imageUrl = '';
        }
        $price = trim((string) ($node['price'] ?? ''));
        $description = trim((string) ($node['description'] ?? ''));

        if ($productId > 0) {
            $row = \Db::getInstance()->getRow(
                'SELECT p.id_product, p.reference, pl.name, pl.link_rewrite, COALESCE(image_shop.id_image, image.id_image) AS id_image
                FROM `' . _DB_PREFIX_ . 'product` p
                INNER JOIN `' . _DB_PREFIX_ . 'product_shop` ps ON (ps.id_product = p.id_product AND ps.id_shop = ' . (int) $shopId . ')
                INNER JOIN `' . _DB_PREFIX_ . 'product_lang` pl ON (pl.id_product = p.id_product AND pl.id_shop = ' . (int) $shopId . ' AND pl.id_lang = ' . (int) $langId . ')
                LEFT JOIN `' . _DB_PREFIX_ . 'image` image ON (image.id_product = p.id_product)
                LEFT JOIN `' . _DB_PREFIX_ . 'image_shop` image_shop ON (image_shop.id_image = image.id_image AND image_shop.id_shop = ' . (int) $shopId . ' AND image_shop.cover = 1)
                WHERE p.id_product = ' . (int) $productId . '
                ORDER BY image_shop.id_image IS NULL ASC, image.position ASC'
            );

            if (is_array($row)) {
                if (trim((string) ($row['name'] ?? '')) !== '') {
                    $label = (string) $row['name'];
                }

                if ($imageUrl === '' && (int) ($row['id_image'] ?? 0) > 0) {
                    $imageUrl = (string) $context->link->getImageLink(
                        (string) ($row['link_rewrite'] ?? ''),
                        $productId . '-' . (int) $row['id_image'],
                        'home_default'
                    );
                }

                if ($price === '') {
                    $price = (string) \Tools::getContextLocale($context)->formatPrice(\Product::getPriceStatic($productId, true), $context->currency->iso_code);
                }

                if ($description === '' && trim((string) ($row['reference'] ?? '')) !== '') {
                    $description = (string) $row['reference'];
                }
            }
        }

        return [
            'label' => $label,
            'link' => $fallbackLink,
            'image_url' => $imageUrl === '#' ? '' : $imageUrl,
            'price' => $price,
            'description' => $description,
        ];
    }

    private function blogTablesAvailable(): bool
    {
        static $available = null;
        if ($available !== null) {
            return $available;
        }

        $postTable = _DB_PREFIX_ . 'cci_blog_post';
        $langTable = _DB_PREFIX_ . 'cci_blog_post_lang';
        $shopTable = _DB_PREFIX_ . 'cci_blog_post_shop';

        $postExists = $this->tableExists($postTable);
        $langExists = $this->tableExists($langTable);
        $shopExists = $this->tableExists($shopTable);

        $available = $postExists && $langExists && $shopExists;

        return $available;
    }

    private function tableExists(string $tableName): bool
    {
        return (bool) \Db::getInstance()->getValue(
            'SELECT COUNT(*)
             FROM INFORMATION_SCHEMA.TABLES
             WHERE TABLE_SCHEMA = DATABASE()
             AND TABLE_NAME = "' . pSQL($tableName) . '"'
        );
    }

    private function columnExists(string $tableName, string $columnName): bool
    {
        return (bool) \Db::getInstance()->getValue(
            'SELECT COUNT(*)
             FROM INFORMATION_SCHEMA.COLUMNS
             WHERE TABLE_SCHEMA = DATABASE()
             AND TABLE_NAME = "' . pSQL($tableName) . '"
             AND COLUMN_NAME = "' . pSQL($columnName) . '"'
        );
    }

    private function getBlogPostData(int $postId, array $node, string $fallbackLabel, string $fallbackLink): array
    {
        if ($postId <= 0 || !$this->blogTablesAvailable()) {
            return [
                'label' => $fallbackLabel,
                'link' => $fallbackLink,
                'image_url' => $this->sanitizeNodeLink((string) ($node['image_url'] ?? '')),
                'description' => trim((string) ($node['description'] ?? '')),
                'views' => 0,
                'date_published' => '',
            ];
        }

        $context = \Context::getContext();
        $shopId = (int) $context->shop->id;
        $langId = (int) $context->language->id;
        $row = \Db::getInstance()->getRow(
            'SELECT p.id_post, p.cover_image, p.date_published, p.views, p.featured, pl.title, pl.slug, pl.intro
            FROM `' . _DB_PREFIX_ . 'cci_blog_post` p
            INNER JOIN `' . _DB_PREFIX_ . 'cci_blog_post_shop` ps ON (ps.id_post = p.id_post AND ps.id_shop = ' . (int) $shopId . ')
            INNER JOIN `' . _DB_PREFIX_ . 'cci_blog_post_lang` pl ON (pl.id_post = p.id_post AND pl.id_lang = ' . (int) $langId . ' AND pl.id_shop = ' . (int) $shopId . ')
            WHERE p.id_post = ' . (int) $postId . '
            AND p.active = 1
            AND (p.date_published IS NULL OR p.date_published <= \'' . pSQL(date('Y-m-d H:i:s')) . '\')'
        );

        if (!is_array($row) || empty($row)) {
            return [
                'label' => $fallbackLabel,
                'link' => $fallbackLink,
                'image_url' => $this->sanitizeNodeLink((string) ($node['image_url'] ?? '')),
                'description' => trim((string) ($node['description'] ?? '')),
                'views' => 0,
                'date_published' => '',
            ];
        }

        return $this->mapBlogPostRow($row, $node, $fallbackLabel, $fallbackLink);
    }

    private function getBlogPosts(string $mode, int $limit): array
    {
        if (!$this->blogTablesAvailable()) {
            return [];
        }

        $context = \Context::getContext();
        $shopId = (int) $context->shop->id;
        $langId = (int) $context->language->id;
        $limit = $this->normalizeRange($limit, 1, 24);
        $orderBy = $mode === 'popular'
            ? 'p.views DESC, p.date_published DESC, p.id_post DESC'
            : ($mode === 'featured'
                ? 'p.featured DESC, p.date_published DESC, p.id_post DESC'
                : 'p.date_published DESC, p.id_post DESC');

        $rows = \Db::getInstance()->executeS(
            'SELECT p.id_post, p.cover_image, p.date_published, p.views, p.featured, pl.title, pl.slug, pl.intro
            FROM `' . _DB_PREFIX_ . 'cci_blog_post` p
            INNER JOIN `' . _DB_PREFIX_ . 'cci_blog_post_shop` ps ON (ps.id_post = p.id_post AND ps.id_shop = ' . (int) $shopId . ')
            INNER JOIN `' . _DB_PREFIX_ . 'cci_blog_post_lang` pl ON (pl.id_post = p.id_post AND pl.id_lang = ' . (int) $langId . ' AND pl.id_shop = ' . (int) $shopId . ')
            WHERE p.active = 1
            AND (p.date_published IS NULL OR p.date_published <= \'' . pSQL(date('Y-m-d H:i:s')) . '\')
            ORDER BY ' . $orderBy . '
            LIMIT ' . (int) $limit
        );

        return array_map(function (array $row): array {
            return $this->mapBlogPostRow($row, [], '', '');
        }, is_array($rows) ? $rows : []);
    }

    private function mapBlogPostRow(array $row, array $node, string $fallbackLabel, string $fallbackLink): array
    {
        $context = \Context::getContext();
        $title = trim((string) ($row['title'] ?? ''));
        $slug = trim((string) ($row['slug'] ?? ''));
        $configuredImageUrl = trim((string) ($node['image_url'] ?? ''));
        $imageUrl = $configuredImageUrl !== '' ? $this->sanitizeNodeLink($configuredImageUrl) : $this->sanitizeNodeLink((string) ($row['cover_image'] ?? ''));
        if ($imageUrl === '#') {
            $imageUrl = '';
        }

        $description = trim((string) ($node['description'] ?? ''));
        if ($description === '') {
            $description = trim(strip_tags((string) ($row['intro'] ?? '')));
        }

        $link = $slug !== ''
            ? (string) $context->link->getModuleLink('cci_blog', 'post', ['slug' => $slug])
            : $fallbackLink;

        return [
            'id_post' => (int) ($row['id_post'] ?? 0),
            'label' => $title !== '' ? $title : $fallbackLabel,
            'link' => $link !== '' ? $link : $fallbackLink,
            'image_url' => $imageUrl,
            'description' => mb_substr($description, 0, 220),
            'views' => max(0, (int) ($row['views'] ?? 0)),
            'date_published' => (string) ($row['date_published'] ?? ''),
            'featured' => !empty($row['featured']),
        ];
    }

    private function blogCategoryTablesAvailable(): bool
    {
        static $available = null;
        if ($available !== null) {
            return $available;
        }

        $categoryTable = _DB_PREFIX_ . 'cci_blog_category';
        $langTable = _DB_PREFIX_ . 'cci_blog_category_lang';
        $shopTable = _DB_PREFIX_ . 'cci_blog_category_shop';

        $available = $this->blogTablesAvailable()
            && $this->tableExists($categoryTable)
            && $this->tableExists($langTable)
            && $this->tableExists($shopTable);

        return $available;
    }

    private function blogCategoryImageColumnAvailable(): bool
    {
        static $available = null;
        if ($available !== null) {
            return $available;
        }

        $available = $this->columnExists(_DB_PREFIX_ . 'cci_blog_category', 'image_url');

        return $available;
    }

    private function blogPostCategoryTableAvailable(): bool
    {
        static $available = null;
        if ($available !== null) {
            return $available;
        }

        $available = $this->tableExists(_DB_PREFIX_ . 'cci_blog_post_category');

        return $available;
    }

    private function getBlogCategories(array $node): array
    {
        if (!$this->blogCategoryTablesAvailable()) {
            return [];
        }

        $context = \Context::getContext();
        $shopId = (int) $context->shop->id;
        $langId = (int) $context->language->id;
        $limit = $this->normalizeRange((int) ($node['item_count'] ?? 8), 1, 24);
        $mode = $this->sanitizeBlogCategoryMode((string) ($node['blog_category_mode'] ?? 'all'));
        $selectedIds = $this->normalizeIdList($node['blog_category_ids'] ?? []);
        $hideEmpty = array_key_exists('blog_category_hide_empty', $node) ? !empty($node['blog_category_hide_empty']) : true;
        $sort = $this->sanitizeBlogCategorySort((string) ($node['blog_category_sort'] ?? 'position'));

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

        $where = 'c.active = 1
            AND cs.id_shop = ' . (int) $shopId . '
            AND cl.id_shop = ' . (int) $shopId . '
            AND cl.id_lang = ' . (int) $langId;
        if ($mode === 'selected' && !empty($selectedIds)) {
            $where .= ' AND c.id_category IN (' . implode(',', array_map('intval', $selectedIds)) . ')';
        }

        $orderBy = 'c.position ASC, cl.name ASC';
        if ($sort === 'title_asc') {
            $orderBy = 'cl.name ASC, c.position ASC';
        } elseif ($sort === 'title_desc') {
            $orderBy = 'cl.name DESC, c.position ASC';
        } elseif ($sort === 'count_desc') {
            $orderBy = 'post_count DESC, cl.name ASC';
        } elseif ($sort === 'count_asc') {
            $orderBy = 'post_count ASC, cl.name ASC';
        }

        $categoryImageSelect = $this->blogCategoryImageColumnAvailable()
            ? 'c.image_url'
            : '"" AS image_url';

        $rows = \Db::getInstance()->executeS(
            'SELECT c.id_category, c.id_parent, c.position, ' . $categoryImageSelect . ',
                    cl.name, cl.slug, cl.description,
                    COUNT(DISTINCT ps.id_post) AS post_count
             FROM `' . _DB_PREFIX_ . 'cci_blog_category` c
             INNER JOIN `' . _DB_PREFIX_ . 'cci_blog_category_shop` cs
                ON cs.id_category = c.id_category
             INNER JOIN `' . _DB_PREFIX_ . 'cci_blog_category_lang` cl
                ON cl.id_category = c.id_category
             ' . $postCategoryJoin . '
             LEFT JOIN `' . _DB_PREFIX_ . 'cci_blog_post_shop` ps
                ON ps.id_post = p.id_post AND ps.id_shop = ' . (int) $shopId . '
             WHERE ' . $where . '
             GROUP BY c.id_category
             ' . ($hideEmpty ? 'HAVING post_count > 0' : '') . '
             ORDER BY ' . $orderBy . '
             LIMIT ' . (int) $limit
        );

        return array_map(function (array $row): array {
            return $this->mapBlogCategoryRow($row);
        }, is_array($rows) ? $rows : []);
    }

    private function mapBlogCategoryRow(array $row): array
    {
        $context = \Context::getContext();
        $slug = trim((string) ($row['slug'] ?? ''));
        $name = trim((string) ($row['name'] ?? ''));
        $description = trim(strip_tags((string) ($row['description'] ?? '')));

        return [
            'id_category' => (int) ($row['id_category'] ?? 0),
            'label' => $name !== '' ? $name : $this->module->trans('Blog category', [], 'Modules.CciNiceMenu.Shop'),
            'link' => $slug !== '' ? (string) $context->link->getModuleLink('cci_blog', 'category', ['slug' => $slug]) : '#',
            'image_url' => $this->sanitizeNodeLink((string) ($row['image_url'] ?? '')),
            'description' => mb_substr($description, 0, 160),
            'post_count' => max(0, (int) ($row['post_count'] ?? 0)),
        ];
    }

    private function renderBlogCategoriesNode(array $node, string $label, string $iconMarkup = ''): string
    {
        $categories = $this->getBlogCategories($node);
        $showCount = array_key_exists('blog_category_show_count', $node) ? !empty($node['blog_category_show_count']) : true;
        $mediaMode = $this->sanitizeBlogCategoryMediaMode((string) ($node['blog_category_media_mode'] ?? 'icon'));
        $listClass = 'cci-nice-menu-blog-category-list cci-nice-menu-blog-category-list-media-' . $this->sanitizeCssClassSuffix($mediaMode);
        $output = '<div class="' . \Tools::safeOutput($listClass) . '" role="list" aria-label="' . \Tools::safeOutput($label !== '' ? $label : $this->module->trans('Blog categories', [], 'Modules.CciNiceMenu.Shop')) . '">';

        if (empty($categories)) {
            $output .= '<span class="cci-nice-menu-empty-state">' . \Tools::safeOutput($this->module->trans('No blog categories found.', [], 'Modules.CciNiceMenu.Shop')) . '</span>';
            $output .= '</div>';

            return $output;
        }

        foreach ($categories as $category) {
            $title = (string) ($category['label'] ?? '');
            $href = (string) ($category['link'] ?? '#');
            $description = trim((string) ($category['description'] ?? ''));
            $postCount = (int) ($category['post_count'] ?? 0);
            $imageUrl = $this->sanitizeNodeLink((string) ($category['image_url'] ?? ''));
            if ($imageUrl === '#') {
                $imageUrl = '';
            }
            $mediaMarkup = '';
            if ($mediaMode !== 'none') {
                if (($mediaMode === 'thumbnail' || $mediaMode === 'auto') && $imageUrl !== '') {
                    $mediaMarkup = '<span class="cci-nice-menu-blog-category-icon cci-nice-menu-blog-category-thumbnail" aria-hidden="true"><img src="' . \Tools::safeOutput($imageUrl) . '" alt="" loading="lazy"></span>';
                } elseif ($mediaMode === 'icon' || $mediaMode === 'auto') {
                    $mediaMarkup = '<span class="cci-nice-menu-blog-category-icon" aria-hidden="true">' . ($iconMarkup !== '' ? $iconMarkup : '<span class="cci-nice-menu-icon cci-nice-menu-icon-folder-tree"></span>') . '</span>';
                }
            }

            $output .= '<a class="cci-nice-menu-blog-category-link" role="listitem" href="' . \Tools::safeOutput($href !== '' ? $href : '#') . '">';
            $output .= $mediaMarkup;
            $output .= '<span class="cci-nice-menu-blog-category-copy">';
            $output .= '<span class="cci-nice-menu-blog-category-title">' . \Tools::safeOutput($title) . '</span>';
            if ($description !== '') {
                $output .= '<span class="cci-nice-menu-blog-category-description">' . \Tools::safeOutput($description) . '</span>';
            }
            $output .= '</span>';
            if ($showCount) {
                $output .= '<span class="cci-nice-menu-blog-category-count">' . (int) $postCount . '</span>';
            }
            $output .= '</a>';
        }

        $output .= '</div>';

        return $output;
    }

    private function renderCompactProductLink(array $node, string $label, string $link, string $target, string $iconMarkup = ''): string
    {
        $data = $this->getProductTileData((int) ($node['entity_id'] ?? 0), $node, $label, $link);
        $href = (string) ($data['link'] ?? '#');
        $imageUrl = (string) ($data['image_url'] ?? '');
        $price = trim((string) ($data['price'] ?? ''));
        $description = trim((string) ($data['description'] ?? ''));
        $title = trim((string) ($data['label'] ?? $label));

        $output = '<a class="cci-nice-menu-link cci-nice-menu-product-link" href="' . \Tools::safeOutput($href !== '' ? $href : '#') . '"' . $target . '>';
        if ($iconMarkup !== '') {
            $output .= $iconMarkup;
        }
        if ($imageUrl !== '') {
            $output .= '<span class="cci-nice-menu-product-link-media"><img src="' . \Tools::safeOutput($imageUrl) . '" alt="' . \Tools::safeOutput($title) . '" loading="lazy"></span>';
        }
        $output .= '<span class="cci-nice-menu-product-link-copy">';
        $output .= '<span class="cci-nice-menu-product-link-title">' . \Tools::safeOutput($title !== '' ? $title : $label) . '</span>';
        if ($description !== '') {
            $output .= '<span class="cci-nice-menu-product-link-description">' . \Tools::safeOutput($description) . '</span>';
        }
        if ($price !== '') {
            $output .= '<span class="cci-nice-menu-product-link-price">' . \Tools::safeOutput($price) . '</span>';
        }
        $output .= '</span></a>';

        return $output;
    }

    private function renderTextNode(array $node, string $label, string $link, string $target, string $iconMarkup): string
    {
        $description = trim((string) ($node['description'] ?? ''));
        $tag = ($link !== '' && $link !== '#') ? 'a' : 'span';
        $attributes = $tag === 'a' ? ' href="' . \Tools::safeOutput($link) . '"' . $target : '';
        $className = $tag === 'a' ? 'cci-nice-menu-text-card cci-nice-menu-link' : 'cci-nice-menu-text-card';

        $output = '<' . $tag . ' class="' . $className . '"' . $attributes . '>';
        if ($iconMarkup !== '') {
            $output .= $iconMarkup;
        }
        $output .= '<span class="cci-nice-menu-text-card-copy">';
        $output .= '<span class="cci-nice-menu-text-card-title">' . \Tools::safeOutput($label) . '</span>';
        if ($description !== '') {
            $output .= '<span class="cci-nice-menu-text-card-description">' . \Tools::safeOutput($description) . '</span>';
        }
        $output .= '</span></' . $tag . '>';

        return $output;
    }

    private function sanitizeVideoProvider(string $provider): string
    {
        return in_array($provider, ['youtube', 'file'], true) ? $provider : 'youtube';
    }

    private function sanitizeVideoAspect(string $aspect): string
    {
        return in_array($aspect, ['16:9', '21:9', '4:3', '1:1', '9:16'], true) ? $aspect : '16:9';
    }

    private function sanitizeVideoSize(string $size): string
    {
        $size = trim(strtolower($size));

        return in_array($size, ['compact', 'default', 'large'], true) ? $size : 'default';
    }

    private function isCatalogEntityType(string $type): bool
    {
        return in_array($type, ['category', 'category_tree', 'product', 'product_tile', 'cms_page', 'blog_post'], true);
    }

    private function sanitizeNodeType(string $type): string
    {
        $allowed = ['custom', 'category', 'product', 'product_tile', 'cms_page', 'category_tree', 'blog_post', 'blog_list', 'blog_carousel', 'blog_popular', 'blog_categories', 'banner', 'video', 'text', 'image', 'map', 'hook', 'row', 'column', 'block'];

        return in_array($type, $allowed, true) ? $type : 'custom';
    }

    private function sanitizeBlogCategoryMode(string $mode): string
    {
        return $mode === 'selected' ? 'selected' : 'all';
    }

    private function sanitizeBlogCategorySort(string $sort): string
    {
        return in_array($sort, ['position', 'title_asc', 'title_desc', 'count_desc', 'count_asc'], true) ? $sort : 'position';
    }

    private function sanitizeBlogCategoryMediaMode(string $mode): string
    {
        return in_array($mode, ['auto', 'icon', 'thumbnail', 'none'], true) ? $mode : 'icon';
    }

    private function sanitizeNodeLinkMode(string $mode): string
    {
        return $mode === 'span' ? 'span' : 'link';
    }

    private function normalizeIdList($value): array
    {
        $source = is_array($value) ? $value : explode(',', (string) $value);
        $result = [];

        foreach ($source as $item) {
            $id = (int) $item;
            if ($id > 0) {
                $result[$id] = $id;
            }
        }

        return array_values($result);
    }

    private function sanitizeNodeHookName(string $hookName): string
    {
        $hookName = trim($hookName);
        if ($hookName === '' || !preg_match('/^[A-Za-z][A-Za-z0-9_]{0,63}$/', $hookName)) {
            return '';
        }

        return in_array($hookName, ['displayTop', 'displayNav1', 'displayNav2', 'displayNavFullWidth'], true) ? '' : $hookName;
    }

    private function isGenericStructureLabel(string $label): bool
    {
        $normalized = mb_strtolower(trim($label));

        return $normalized === ''
            || (bool) preg_match('/^(row|wiersz)\\s*\\d*$/u', $normalized)
            || (bool) preg_match('/^(column|kolumna)\\s*\\d*$/u', $normalized)
            || (bool) preg_match('/^(block|blok)\\s*\\d*$/u', $normalized)
            || in_array($normalized, ['links block', 'linki', 'links'], true);
    }

    private function sanitizeNodeCssClass(string $value): string
    {
        $value = trim((string) preg_replace('/[^a-zA-Z0-9_\\-\\s]/', ' ', $value));
        if ($value === '') {
            return '';
        }

        $parts = preg_split('/\\s+/', $value);
        if (!$parts) {
            return '';
        }

        return implode(' ', array_map(static fn ($part) => trim((string) $part), array_filter($parts, 'strlen')));
    }

    private function sanitizeCssClassSuffix(string $value): string
    {
        $value = strtolower(trim($value));
        $value = (string) preg_replace('/[^a-z0-9]+/', '-', $value);

        return trim($value, '-');
    }

    private function buildNodeSystemClass(string $type, array $children, string $parentSystemRole): string
    {
        $classes = [];

        if ($type === 'category_tree' && $parentSystemRole === 'live_category_tree_block') {
            $classes[] = 'cci-nice-menu-live-category-tree';
        }

        if ($type === 'block' && $this->childrenContainDirectNodeType($children, 'category_tree')) {
            $classes[] = 'cci-nice-menu-live-category-tree-block';
        }

        if ($type === 'column' && $this->childrenContainLiveCategoryTreeBlock($children)) {
            $classes[] = 'cci-nice-menu-showcase-action-column';
            $classes[] = 'cci-nice-menu-live-catalog-main';
            $classes[] = 'cci-nice-menu-live-category-tree-column';
        }

        if (!in_array($type, ['row', 'column', 'block', 'category_tree'], true) && $this->childrenContainLiveCategoryTreeColumn($children)) {
            $classes[] = 'cci-nice-menu-live-catalog-tab';
        }

        if ($type === 'text' && $parentSystemRole === 'live_category_tree_block') {
            $classes[] = 'cci-nice-menu-live-catalog-status';
        }

        $classes = array_values(array_unique($classes));

        return empty($classes) ? '' : ' ' . implode(' ', $classes);
    }

    private function resolveChildSystemRole(string $type, array $children, string $parentSystemRole, string $componentVariant = ''): string
    {
        if ($type === 'block' && in_array($componentVariant, ['showcase_product_grid', 'showcase_product_grid_three', 'showcase_product_grid_two'], true)) {
            return 'product_grid_block';
        }

        if ($type === 'block' && $this->childrenContainDirectNodeType($children, 'category_tree')) {
            return 'live_category_tree_block';
        }

        return $parentSystemRole;
    }

    private function childrenContainDirectNodeType(array $children, string $type): bool
    {
        foreach ($children as $child) {
            if (is_array($child) && $this->sanitizeNodeType((string) ($child['type'] ?? 'custom')) === $type) {
                return true;
            }
        }

        return false;
    }

    private function childrenContainLiveCategoryTreeBlock(array $children): bool
    {
        foreach ($children as $child) {
            if (!is_array($child)) {
                continue;
            }

            $type = $this->sanitizeNodeType((string) ($child['type'] ?? 'custom'));
            $grandchildren = isset($child['children']) && is_array($child['children']) ? $child['children'] : [];

            if ($type === 'category_tree') {
                return true;
            }

            if ($type === 'block' && $this->childrenContainDirectNodeType($grandchildren, 'category_tree')) {
                return true;
            }
        }

        return false;
    }

    private function childrenContainLiveCategoryTreeColumn(array $children): bool
    {
        foreach ($children as $child) {
            if (!is_array($child)) {
                continue;
            }

            $type = $this->sanitizeNodeType((string) ($child['type'] ?? 'custom'));
            if ($type !== 'column') {
                continue;
            }

            $grandchildren = isset($child['children']) && is_array($child['children']) ? $child['children'] : [];
            if ($this->childrenContainLiveCategoryTreeBlock($grandchildren)) {
                return true;
            }
        }

        return false;
    }

    private function sanitizeNodeColor(string $value): string
    {
        $value = trim($value);
        if ($value === '') {
            return '';
        }

        if (preg_match('/^#[0-9a-fA-F]{3}([0-9a-fA-F]{3})?$/', $value)) {
            return strtolower($value);
        }

        return '';
    }

    private function sanitizeNodeCssLength(string $value): string
    {
        $value = trim(strtolower($value));
        if ($value === '') {
            return '';
        }

        if ($value === '0') {
            return '0';
        }

        if (preg_match('/^(?:[0-9]|[1-9][0-9]|[1-9][0-9]{2}|1000)(?:\\.[0-9]{1,2})?(?:px|rem|em|%|vh|vw|dvh|dvw)$/', $value)) {
            return $value;
        }

        return '';
    }

    private function buildNodeStyleAttribute(array $node, array $extraDeclarations = []): string
    {
        $declarations = array_values(array_filter(array_map('trim', $extraDeclarations)));
        $colorMap = [
            'style_background' => '--cci-nice-menu-node-bg',
            'style_background_2' => '--cci-nice-menu-node-bg-2',
            'style_text' => '--cci-nice-menu-node-text',
            'style_icon' => '--cci-nice-menu-node-icon',
            'style_border' => '--cci-nice-menu-node-border',
            'style_radius' => '--cci-nice-menu-node-radius',
            'style_badge_background' => '--cci-nice-menu-node-badge-bg',
            'style_badge_text' => '--cci-nice-menu-node-badge-text',
        ];

        foreach ($colorMap as $field => $variable) {
            $value = $field === 'style_radius'
                ? $this->sanitizeNodeCssLength((string) ($node[$field] ?? ''))
                : $this->sanitizeNodeColor((string) ($node[$field] ?? ''));
            if ($value !== '') {
                $declarations[] = $variable . ':' . $value;
            }
        }

        $lengthMap = [
            'tabs_content_height' => '--cci-nice-menu-tabs-content-height',
            'tabs_content_height_tablet' => '--cci-nice-menu-tabs-content-height-tablet',
            'tabs_content_height_mobile' => '--cci-nice-menu-tabs-content-height-mobile',
        ];

        foreach ($lengthMap as $field => $variable) {
            $value = $this->sanitizeNodeCssLength((string) ($node[$field] ?? ''));
            if ($value !== '') {
                $declarations[] = $variable . ':' . $value;
            }
        }

        if (empty($declarations)) {
            return '';
        }

        return ' style="' . \Tools::safeOutput(implode(';', $declarations)) . ';"';
    }

    private function normalizeNodeDisplayOptions(array $options): array
    {
        return [
            'hide_desktop' => !empty($options['hide_desktop']) || !empty($options['hide_on_desktop']) ? 1 : 0,
            'hide_tablet' => !empty($options['hide_tablet']) || !empty($options['hide_on_tablet']) ? 1 : 0,
            'hide_mobile' => !empty($options['hide_mobile']) || !empty($options['hide_on_mobile']) ? 1 : 0,
        ];
    }

    private function buildNodeVisibilityClass(array $node): string
    {
        $optionsSource = array_merge(
            $node,
            isset($node['display_options']) && is_array($node['display_options']) ? $node['display_options'] : []
        );
        $options = $this->normalizeNodeDisplayOptions($optionsSource);
        $classes = [];

        if (!empty($options['hide_desktop'])) {
            $classes[] = 'cci-nice-menu-hidden-desktop';
        }
        if (!empty($options['hide_tablet'])) {
            $classes[] = 'cci-nice-menu-hidden-tablet';
        }
        if (!empty($options['hide_mobile'])) {
            $classes[] = 'cci-nice-menu-hidden-mobile';
        }

        return !empty($classes) ? ' ' . implode(' ', $classes) : '';
    }

    private function sanitizeTopLevelPlacement(string $value): string
    {
        $value = trim(strtolower($value));

        return $value === 'right' ? 'right' : '';
    }

    private function buildTopLevelPlacementClass(array $node): string
    {
        $placement = $this->sanitizeTopLevelPlacement((string) ($node['top_level_placement'] ?? ''));

        return $placement !== '' ? ' cci-nice-menu-top-placement-' . $placement : '';
    }

    private function buildTopLevelGridVariables(array $node): array
    {
        $declarations = [];
        $columnSpan = $this->normalizeRange((int) ($node['column_span'] ?? 0), 0, 12);
        $columnStart = $this->normalizeRange((int) ($node['top_level_column_start'] ?? 0), 0, 12);

        if ($columnSpan > 0) {
            $declarations[] = '--cci-nice-menu-top-column-span:' . (int) $columnSpan;
        }
        if ($columnStart > 0) {
            $declarations[] = '--cci-nice-menu-top-column-start:' . (int) $columnStart;
        }

        return $declarations;
    }

    private function sanitizeTopLevelLayout(string $value): string
    {
        $value = trim(strtolower($value));

        return $value === 'grid' ? 'grid' : 'flow';
    }

    private function sanitizeNodeLayoutRole(string $value): string
    {
        $value = trim(strtolower($value));
        if ($value === 'rail') {
            return 'tabs';
        }

        $allowed = ['tabs'];

        return in_array($value, $allowed, true) ? $value : '';
    }

    private function sanitizeNodeBannerLayout(string $value): string
    {
        $value = trim(strtolower($value));

        return $value === 'vertical' ? 'vertical' : 'horizontal';
    }

    private function sanitizeNodeComponentVariant(string $value): string
    {
        $value = str_replace('-', '_', trim(strtolower($value)));
        $aliases = [
            'benefits' => 'benefits_strip',
            'benefit_strip' => 'benefits_strip',
            'hero' => 'hero_strip',
            'hero_banner' => 'hero_strip',
            'bottom_hero' => 'bottom_hero_column',
            'hero_column' => 'bottom_hero_column',
            'footer' => 'footer_actions',
            'footer_strip' => 'footer_actions',
            'footer_feature_strip' => 'footer_actions',
            'rail' => 'rail_links',
            'rail_text' => 'rail_links',
            'support_links' => 'rail_links',
            'catalog_entry' => 'showcase_catalog_entry',
            'showcase_catalog' => 'showcase_catalog_entry',
            'entry' => 'showcase_entry',
            'visual' => 'showcase_entry',
            'visual_menu' => 'showcase_entry',
            'menu_grid' => 'showcase_entry',
            'menu_grid_entry' => 'showcase_entry',
            'visual_card' => 'showcase_card_list',
            'visual_deal_link' => 'showcase_simple_link',
            'visual_card_cta' => 'showcase_simple_link',
            'visual_media_block' => 'showcase_media_block',
            'promotion_countdown' => 'showcase_store_status',
            'visual_feature_strip' => 'benefits_strip',
            'simple_link' => 'showcase_simple_link',
            'tabs' => 'showcase_tabs_column',
            'tabs_column' => 'showcase_tabs_column',
            'tabs_block' => 'showcase_tabs_block',
            'link_column' => 'showcase_link_column',
            'link_block' => 'showcase_link_block',
            'secondary_link_block' => 'showcase_secondary_link_block',
            'current_link' => 'showcase_current_link',
            'products_column' => 'showcase_products_column',
            'product_grid' => 'showcase_product_grid',
            'product_grid_three' => 'showcase_product_grid_three',
            'product_grid_two' => 'showcase_product_grid_two',
            'media_column' => 'showcase_media_column',
            'media_block' => 'showcase_media_block',
            'action_column' => 'showcase_action_column',
            'card_list' => 'showcase_card_list',
            'collection_column' => 'showcase_collection_column',
            'video_column' => 'showcase_video_column',
            'video_block' => 'showcase_video_block',
            'video_feature' => 'showcase_video_feature',
            'secondary_row' => 'showcase_secondary_row',
            'bottom_list_column' => 'showcase_bottom_list_column',
            'compact_list' => 'showcase_compact_list',
            'blog_categories' => 'showcase_blog_categories',
            'store_column' => 'showcase_store_column',
            'store_card' => 'showcase_store_card',
            'map_card' => 'showcase_map_card',
            'brands_column' => 'showcase_brands_column',
            'brand_grid' => 'showcase_brand_grid',
            'footer_column' => 'showcase_footer_column',
            'showcase_header' => 'showcase_header',
            'showcase_header_block' => 'showcase_header_block',
            'showcase_header_column' => 'showcase_header_column',
            'rail_service' => 'showcase_rail_service',
            'rail_hook' => 'showcase_rail_hook',
            'card_list_action' => 'card_list_action',
            'category_browser_header' => 'category_browser_header',
            'category_browser_header_block' => 'category_browser_header_block',
            'category_browser_header_column' => 'category_browser_header_column',
            'category_browser_tree_block' => 'category_browser_tree_block',
            'category_browser_tree_column' => 'category_browser_tree_column',
            'live_category_view_all' => 'live_category_view_all',
            'dynamic_catalog_tabs' => 'dynamic_catalog_tabs',
            'dynamic_catalog_block' => 'dynamic_catalog_block',
            'dynamic_category_column' => 'dynamic_category_column',
            'dynamic_category_block' => 'dynamic_category_block',
            'bestsellers_header' => 'bestsellers_header',
            'promotions_header' => 'promotions_header',
            'gildan_logo' => 'brand_logo_gildan',
            'fruit_logo' => 'brand_logo_fruit',
            'bc_logo' => 'brand_logo_bc',
            'stanley_logo' => 'brand_logo_stanley',
        ];
        $value = $aliases[$value] ?? $value;

        return array_key_exists($value, self::NODE_COMPONENT_VARIANT_CLASSES) ? $value : '';
    }

    private function inferNodeComponentVariantFromClass(string $cssClass): string
    {
        if (strpos($cssClass, 'cci-nice-menu-showcase-catalog') !== false) {
            return 'showcase_catalog_entry';
        }
        if (strpos($cssClass, 'cci-nice-menu-showcase-secondary-block') !== false) {
            return 'showcase_secondary_link_block';
        }
        if (strpos($cssClass, 'cci-nice-menu-showcase-three-products') !== false) {
            return 'showcase_product_grid_three';
        }
        if (strpos($cssClass, 'cci-nice-menu-showcase-two-products') !== false) {
            return 'showcase_product_grid_two';
        }
        if (strpos($cssClass, 'cci-nice-menu-brand-gildan') !== false) {
            return 'brand_logo_gildan';
        }
        if (strpos($cssClass, 'cci-nice-menu-brand-fruit') !== false) {
            return 'brand_logo_fruit';
        }
        if (strpos($cssClass, 'cci-nice-menu-brand-bc') !== false) {
            return 'brand_logo_bc';
        }
        if (strpos($cssClass, 'cci-nice-menu-brand-stanley') !== false) {
            return 'brand_logo_stanley';
        }

        $classToVariant = $this->getNodeComponentClassToVariantMap();
        $classes = preg_split('/\s+/', trim($cssClass)) ?: [];
        foreach ($classes as $class) {
            $class = trim((string) $class);
            if ($class !== '' && isset($classToVariant[$class])) {
                return $classToVariant[$class];
            }
        }

        if (strpos($cssClass, 'cci-nice-menu-showcase-footer-actions') !== false) {
            return 'footer_actions';
        }
        if (strpos($cssClass, 'cci-nice-menu-showcase-benefits-block') !== false) {
            return 'benefits_strip';
        }
        if (strpos($cssClass, 'cci-nice-menu-showcase-feature-strip') !== false) {
            return 'feature_strip';
        }
        if (strpos($cssClass, 'cci-nice-menu-showcase-hero-strip') !== false) {
            return 'hero_strip';
        }
        if (strpos($cssClass, 'cci-nice-menu-showcase-bottom-hero-column') !== false) {
            return 'bottom_hero_column';
        }

        return '';
    }

    private function buildNodeComponentVariantClass(string $type, string $variant): string
    {
        $variant = $this->sanitizeNodeComponentVariant($variant);
        if ($variant === '') {
            return '';
        }

        $classes = [
            'cci-nice-menu-component-' . str_replace('_', '-', $variant),
        ];
        $classes = array_merge($classes, self::NODE_COMPONENT_VARIANT_CLASSES[$variant] ?? []);

        if (in_array($variant, ['benefits_strip', 'footer_actions'], true)) {
            $classes[] = 'cci-nice-menu-component-feature-strip';
        }

        $classes = array_values(array_unique(array_filter($classes, 'strlen')));

        return empty($classes) ? '' : ' ' . implode(' ', $classes);
    }

    private function getNodeComponentClassToVariantMap(): array
    {
        static $map = null;
        if ($map !== null) {
            return $map;
        }

        $map = [];
        foreach (self::NODE_COMPONENT_VARIANT_CLASSES as $variant => $classes) {
            foreach ($classes as $class) {
                $map[$class] = $variant;
            }
        }

        return $map;
    }

    private function sanitizeNodeTabsOrientation(string $value): string
    {
        $value = trim(strtolower($value));

        return $value === 'horizontal' ? 'horizontal' : 'vertical';
    }

    private function sanitizeNodeId(string $value): string
    {
        $value = trim((string) preg_replace('/[^a-z0-9_-]/i', '', $value));
        if ($value === '') {
            return '';
        }

        return $value;
    }

    private function decode(string $json)
    {
        $decoded = json_decode($json, true);
        if (json_last_error() !== JSON_ERROR_NONE) {
            return [];
        }

        return is_array($decoded) ? $decoded : [];
    }

    private function encode($value): string
    {
        $encoded = json_encode($value, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);

        return (string) ($encoded === false ? '[]' : $encoded);
    }

    private function sanitizeCode(string $code): string
    {
        $code = strtolower(trim($code));
        if ($code === '') {
            $employeeId = 0;
            $context = \Context::getContext();
            if (isset($context->employee) && is_object($context->employee)) {
                $employeeId = (int) $context->employee->id;
            }

            return 'menu-' . $employeeId;
        }

        $code = preg_replace('/[^a-z0-9_-]/', '-', $code);

        return mb_substr($code, 0, 64);
    }

    private function sanitizeHook(string $hook): string
    {
        $hook = trim($hook);
        if ($hook === '' || !preg_match('/^[A-Za-z][A-Za-z0-9_]{0,63}$/', $hook)) {
            return 'displayTop';
        }

        return $hook;
    }

    private function normalizeSettings(array $settings): array
    {
        $merged = array_merge(self::DEFAULT_SETTINGS, $settings);
        $theme = $this->sanitizeTheme((string) ($merged['theme'] ?? 'night-glass'));
        $themeDefaults = self::PRESET_THEMES[$theme] ?? [];
        $shadowEnabled = array_key_exists('show_shadow', $merged)
            ? !empty($merged['show_shadow'])
            : !empty($merged['drop_shadow']);

        return [
            'layout' => $this->sanitizeMenuLayout((string) ($merged['layout'] ?? 'classic')),
            'container_mode' => $this->sanitizeContainerMode((string) ($merged['container_mode'] ?? 'boxed')),
            'container_width' => $this->normalizeRange((int) ($merged['container_width'] ?? 1320), 640, 2400),
            'mobile_breakpoint' => $this->normalizeRange((int) ($merged['mobile_breakpoint'] ?? 900), 600, 1400),
            'animation' => $this->sanitizeAnimation((string) ($merged['animation'] ?? 'fade')),
            'columns' => $this->normalizeRange((int) ($merged['columns'] ?? 6), 1, 12),
            'top_level_layout' => $this->sanitizeTopLevelLayout((string) ($merged['top_level_layout'] ?? 'flow')),
            'open_on' => $this->sanitizeOpenBehavior((string) ($merged['open_on'] ?? 'click')),
            'show_shadow' => $shadowEnabled ? 1 : 0,
            'drop_shadow' => $shadowEnabled ? 1 : 0,
            'show_counts' => !empty($merged['show_counts']) ? 1 : 0,
            'hide_empty_categories' => !empty($merged['hide_empty_categories']) ? 1 : 0,
            'item_gap' => $this->normalizeRange((int) ($merged['item_gap'] ?? 8), 0, 30),
            'top_level_icon_mode' => $this->sanitizeTopLevelIconMode((string) ($merged['top_level_icon_mode'] ?? 'first')),
            'category_tab_media_mode' => $this->sanitizeCategoryTabMediaMode((string) ($merged['category_tab_media_mode'] ?? 'auto')),
            'theme' => $theme,
            'color_accent' => $this->sanitizeHexColor((string) ($merged['color_accent'] ?? $themeDefaults['color_accent'] ?? self::DEFAULT_SETTINGS['color_accent']), (string) ($themeDefaults['color_accent'] ?? self::DEFAULT_SETTINGS['color_accent'])),
            'color_accent_hover' => $this->sanitizeHexColor((string) ($merged['color_accent_hover'] ?? $themeDefaults['color_accent_hover'] ?? self::DEFAULT_SETTINGS['color_accent_hover']), (string) ($themeDefaults['color_accent_hover'] ?? self::DEFAULT_SETTINGS['color_accent_hover'])),
            'color_accent_soft' => $this->sanitizeHexColor((string) ($merged['color_accent_soft'] ?? $themeDefaults['color_accent_soft'] ?? self::DEFAULT_SETTINGS['color_accent_soft']), (string) ($themeDefaults['color_accent_soft'] ?? self::DEFAULT_SETTINGS['color_accent_soft'])),
            'color_accent_wash' => $this->sanitizeHexColor((string) ($merged['color_accent_wash'] ?? $themeDefaults['color_accent_wash'] ?? self::DEFAULT_SETTINGS['color_accent_wash']), (string) ($themeDefaults['color_accent_wash'] ?? self::DEFAULT_SETTINGS['color_accent_wash'])),
            'color_text' => $this->sanitizeHexColor((string) ($merged['color_text'] ?? $themeDefaults['color_text'] ?? self::DEFAULT_SETTINGS['color_text']), (string) ($themeDefaults['color_text'] ?? self::DEFAULT_SETTINGS['color_text'])),
            'color_muted' => $this->sanitizeHexColor((string) ($merged['color_muted'] ?? $themeDefaults['color_muted'] ?? self::DEFAULT_SETTINGS['color_muted']), (string) ($themeDefaults['color_muted'] ?? self::DEFAULT_SETTINGS['color_muted'])),
            'color_icon' => $this->sanitizeHexColor((string) ($merged['color_icon'] ?? $themeDefaults['color_icon'] ?? $merged['color_accent'] ?? self::DEFAULT_SETTINGS['color_icon']), (string) ($themeDefaults['color_icon'] ?? $themeDefaults['color_accent'] ?? self::DEFAULT_SETTINGS['color_icon'])),
            'color_surface' => $this->sanitizeHexColor((string) ($merged['color_surface'] ?? $themeDefaults['color_surface'] ?? self::DEFAULT_SETTINGS['color_surface']), (string) ($themeDefaults['color_surface'] ?? self::DEFAULT_SETTINGS['color_surface'])),
            'color_surface_soft' => $this->sanitizeHexColor((string) ($merged['color_surface_soft'] ?? $themeDefaults['color_surface_soft'] ?? self::DEFAULT_SETTINGS['color_surface_soft']), (string) ($themeDefaults['color_surface_soft'] ?? self::DEFAULT_SETTINGS['color_surface_soft'])),
            'color_border' => $this->sanitizeHexColor((string) ($merged['color_border'] ?? $themeDefaults['color_border'] ?? self::DEFAULT_SETTINGS['color_border']), (string) ($themeDefaults['color_border'] ?? self::DEFAULT_SETTINGS['color_border'])),
            'color_border_strong' => $this->sanitizeHexColor((string) ($merged['color_border_strong'] ?? $themeDefaults['color_border_strong'] ?? self::DEFAULT_SETTINGS['color_border_strong']), (string) ($themeDefaults['color_border_strong'] ?? self::DEFAULT_SETTINGS['color_border_strong'])),
            'color_heading' => $this->sanitizeHexColor((string) ($merged['color_heading'] ?? $themeDefaults['color_heading'] ?? self::DEFAULT_SETTINGS['color_heading']), (string) ($themeDefaults['color_heading'] ?? self::DEFAULT_SETTINGS['color_heading'])),
            'color_video_bg' => $this->sanitizeHexColor((string) ($merged['color_video_bg'] ?? $themeDefaults['color_video_bg'] ?? self::DEFAULT_SETTINGS['color_video_bg']), (string) ($themeDefaults['color_video_bg'] ?? self::DEFAULT_SETTINGS['color_video_bg'])),
            'color_video_border' => $this->sanitizeHexColor((string) ($merged['color_video_border'] ?? $themeDefaults['color_video_border'] ?? self::DEFAULT_SETTINGS['color_video_border']), (string) ($themeDefaults['color_video_border'] ?? self::DEFAULT_SETTINGS['color_video_border'])),
            'schema_version' => $this->normalizeSchemaVersion($merged),
        ];
    }

    private function normalizeSchemaVersion(array $mergedSettings): int
    {
        if (!isset($mergedSettings['schema_version'])) {
            return self::SCHEMA_VERSION;
        }

        $schemaVersion = (int) $mergedSettings['schema_version'];
        if ($schemaVersion <= 0 || $schemaVersion > self::SCHEMA_VERSION) {
            return self::SCHEMA_VERSION;
        }

        return $schemaVersion;
    }

    private function normalizeRange(int $value, int $min, int $max): int
    {
        if ($value < $min) {
            return $min;
        }

        if ($value > $max) {
            return $max;
        }

        return $value;
    }

    private function sanitizeMenuLayout(string $layout): string
    {
        $allowed = ['classic', 'compact', 'wide', 'mega', 'dropdown'];

        return in_array($layout, $allowed, true) ? $layout : 'classic';
    }

    private function sanitizeContainerMode(string $mode): string
    {
        $allowed = ['boxed', 'wide', 'full'];

        return in_array($mode, $allowed, true) ? $mode : 'boxed';
    }

    private function sanitizeAnimation(string $animation): string
    {
        $allowed = ['none', 'fade', 'slide'];

        return in_array($animation, $allowed, true) ? $animation : 'fade';
    }

    private function sanitizeTheme(string $theme): string
    {
        $theme = trim((string) $theme);

        return isset(self::PRESET_THEMES[$theme]) ? $theme : 'night-glass';
    }

    private function sanitizeHexColor(string $color, string $fallback): string
    {
        $color = trim($color);
        if (preg_match('/^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/', $color)) {
            return strtolower($color);
        }

        return preg_match('/^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/', $fallback) ? strtolower($fallback) : '#000000';
    }

    private function sanitizeOpenBehavior(string $mode): string
    {
        $allowed = ['click', 'hover'];

        return in_array($mode, $allowed, true) ? $mode : 'click';
    }

    private function sanitizeTopLevelIconMode(string $mode): string
    {
        $mode = trim(strtolower($mode));
        $allowed = ['all', 'first', 'none'];

        return in_array($mode, $allowed, true) ? $mode : 'first';
    }

    private function sanitizeCategoryTabMediaMode(string $mode): string
    {
        $mode = trim(strtolower($mode));
        $allowed = ['auto', 'icon', 'thumbnail', 'none'];

        return in_array($mode, $allowed, true) ? $mode : 'auto';
    }

    private function sanitizeIconLibrary(string $library): string
    {
        $library = trim(strtolower($library));
        $allowed = ['none', 'theme', 'fontawesome', 'tabler'];

        return in_array($library, $allowed, true) ? $library : 'none';
    }

    private function normalizeIconClass(string $icon): string
    {
        $icon = trim((string) preg_replace('/\s+/', ' ', $icon));
        if ($icon === '') {
            return '';
        }

        $library = $this->sanitizeIconLibrary((string) ($this->renderSettings['icon_library'] ?? 'none'));
        $hasExplicitClass = preg_match('/\b(fa|fas|far|fab|fa-solid|fa-regular|fa-brands|ti)\b/', $icon) === 1;

        if ($hasExplicitClass || in_array($library, ['none', 'theme'], true)) {
            return $icon;
        }

        $iconName = trim((string) preg_replace('/[^a-z0-9_-]/i', '', $icon), '-_');
        if ($iconName === '') {
            return '';
        }

        if ($library === 'fontawesome') {
            return 'fa-solid fa-' . $iconName;
        }

        if ($library === 'tabler') {
            return 'ti ti-' . $iconName;
        }

        return $icon;
    }

    private function findAvailableCode(int $shopId, string $code): string
    {
        $code = $this->sanitizeCode($code);
        $counter = 1;
        $candidate = $code;

        while (true) {
            $exists = \Db::getInstance()->getValue(
                'SELECT id_menu FROM `' . _DB_PREFIX_ . self::TABLE_NAME . '` WHERE id_shop = ' . (int) $shopId . ' AND code = \'' . pSQL($candidate) . '\''
            );

            if (!$exists) {
                return $candidate;
            }

            ++$counter;
            $candidate = $code . '-' . $counter;
            if (strlen($candidate) > 64) {
                $candidate = substr($candidate, 0, 64);
            }
        }
    }
}
