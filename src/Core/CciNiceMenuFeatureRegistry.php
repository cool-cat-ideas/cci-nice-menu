<?php

declare(strict_types=1);

namespace CCI\NiceMenu\Core;

if (!defined('_PS_VERSION_')) {
    exit;
}

class CciNiceMenuFeatureRegistry
{
    private const PRO_MODULE_NAME = 'cci_nice_menu_pro';
    private const RESERVED_PRO_FEATURE_KEYS = [
        'pro_menu_builder',
        'multiple_menus',
        'multiple_hooks',
        'showcase_blocks',
        'media_blocks',
        'commerce_blocks',
        'hook_blocks',
        'responsive_visibility',
        'import_export',
        'theme_presets',
        'extension_blocks',
        'multistore',
        'local_media_library',
    ];

    private \Module $module;

    public function __construct(\Module $module)
    {
        $this->module = $module;
    }

    public function integrationHooks(): array
    {
        return [
            'displayCciNiceMenuFeatures',
            'displayCciNiceMenuAdminExtensions',
            'displayCciNiceMenuAdminAssets',
            'displayCciNiceMenuFrontAssets',
            'displayCciNiceMenuRenderNode',
        ];
    }

    public function getFeatures(array $license = [], bool $forRuntime = false): array
    {
        $proActive = $forRuntime
            ? $this->isProModuleInstalled() && !empty($license['runtimeAllowed'])
            : $this->isProActive($license);
        $features = [];

        foreach ($this->baseFeatureDefinitions() as $key => $definition) {
            $features[$key] = $this->normalizeFeature($key, $definition, true, 'core');
        }

        foreach ($this->featureContributions($features, $license, $forRuntime) as $key => $definition) {
            if ($key === '') {
                continue;
            }

            $current = $features[$key] ?? [];
            $source = $this->normalizeFeatureSource($definition, $current);
            if (isset($features[$key]) && !$this->canOverrideFeature($key, $source)) {
                continue;
            }

            $mergedDefinition = array_merge($current, $definition);
            $requirements = $this->normalizeRequirements(
                $mergedDefinition['requires'] ?? $mergedDefinition['requiredFeatures'] ?? $mergedDefinition['required_features'] ?? []
            );
            $enabled = (bool) ($definition['enabled'] ?? $current['enabled'] ?? false);

            if (!empty($requirements) && !$this->requirementsMet($requirements, $features)) {
                $enabled = false;
            }

            if ($this->contributionRequiresCorePro($mergedDefinition, $key, $requirements) && !$proActive) {
                $enabled = false;
            }

            $features[$key] = $this->normalizeFeature(
                $key,
                $mergedDefinition,
                $enabled,
                $source
            );
        }

        return $features;
    }

    public function decorateLicensePayload(array $license): array
    {
        $features = $this->getFeatures($license);
        $enabledFeatures = array_values(array_keys(array_filter($features, static fn (array $feature): bool => !empty($feature['enabled']))));
        $proInstalled = $this->isProModuleInstalled();
        $isPro = $this->isProActive($license);
        $status = (string) ($license['status'] ?? 'inactive');
        $inactiveStatus = in_array($status, ['pending', 'expired'], true) ? $status : 'inactive';

        return array_merge($license, [
            'status' => $isPro ? 'active' : $inactiveStatus,
            'label' => $isPro ? 'PRO' : ((string) ($license['label'] ?? $this->module->trans('Free', [], 'Modules.CciNiceMenu.Admin'))),
            'canUse' => $isPro,
            'runtimeAllowed' => $proInstalled && !empty($license['runtimeAllowed']),
            'isActive' => $isPro,
            'isPro' => $isPro,
            'proInstalled' => $proInstalled,
            'proModuleAvailable' => $proInstalled,
            'features' => $enabledFeatures,
            'enabledFeatures' => $enabledFeatures,
            'availableFeatures' => array_values($features),
            'canManage' => $proInstalled,
        ]);
    }

    public function getAdminExtensions(array $features): array
    {
        $raw = \Hook::exec('displayCciNiceMenuAdminExtensions', [
            'features' => $features,
            'module' => $this->module->name,
        ], null, true);

        if (!is_array($raw)) {
            return [];
        }

        $extensions = [];
        foreach ($raw as $group) {
            foreach ($this->normalizeContributionGroup($group) as $extension) {
                $id = $this->sanitizeKey((string) ($extension['id'] ?? $extension['moduleName'] ?? $extension['module'] ?? ''));
                $title = trim((string) ($extension['title'] ?? $extension['name'] ?? $extension['moduleName'] ?? $extension['module'] ?? ''));
                if ($id === '' || $title === '') {
                    continue;
                }

                $requirements = $this->normalizeRequirements($extension['requires'] ?? $extension['requiredFeatures'] ?? $extension['feature'] ?? []);
                $locked = !empty($requirements) && !$this->requirementsMet($requirements, $features);
                $extensions[] = [
                    'id' => $id,
                    'title' => $title,
                    'description' => trim((string) ($extension['description'] ?? '')),
                    'version' => trim((string) ($extension['version'] ?? '')),
                    'author' => trim((string) ($extension['author'] ?? $title)),
                    'status' => 'installed',
                    'pro' => !empty($requirements) || !empty($extension['pro']) || !empty($extension['requiresPro']),
                    'locked' => $locked,
                    'requiredFeatures' => $requirements,
                    'availabilityMessage' => $locked
                        ? $this->module->trans('Install or activate CCI Nice Menu Pro to use this extension.', [], 'Modules.CciNiceMenu.Admin')
                        : '',
                    'tags' => is_array($extension['tags'] ?? null) ? array_values($extension['tags']) : [],
                    'url' => trim((string) ($extension['url'] ?? '')),
                    'screenshot' => trim((string) ($extension['screenshot'] ?? '')),
                ];
            }
        }

        return $extensions;
    }

    public function getMenuPayloadRequiredFeatures(array $payload, int $existingMenuCount = 0, bool $isNew = false): array
    {
        $required = [];
        $hookName = trim((string) ($payload['hook_name'] ?? 'displayTop'));

        if ($isNew && $existingMenuCount >= 1) {
            $required[] = 'multiple_menus';
        }

        if ($hookName !== '' && $hookName !== 'displayTop') {
            $required[] = 'multiple_hooks';
        }

        $settings = is_array($payload['settings'] ?? null) ? $payload['settings'] : [];
        if ($this->usesThemePreset($settings)) {
            $required[] = 'theme_presets';
        }

        if ($this->usesResponsiveVisibility($payload['tree'] ?? [])) {
            $required[] = 'responsive_visibility';
        }

        $this->collectNodeRequirements(is_array($payload['tree'] ?? null) ? $payload['tree'] : [], $required);

        return array_values(array_unique($required));
    }

    public function requirementsMet(array $requirements, array $features): bool
    {
        foreach ($requirements as $requirement) {
            $key = $this->sanitizeKey((string) $requirement);
            if ($key === '') {
                continue;
            }

            if (empty($features[$key]['enabled'])) {
                return false;
            }
        }

        return true;
    }

    public function prepareMenuForRuntime(array $payload, array $features): ?array
    {
        $hookName = trim((string) ($payload['hook_name'] ?? 'displayTop'));
        $hookName = $hookName !== '' ? $hookName : 'displayTop';
        if ($hookName !== 'displayTop' && !$this->featureEnabled($features, 'multiple_hooks')) {
            return null;
        }

        $payload['hook_name'] = $hookName;
        $payload['tree'] = $this->filterNodesForRuntime(
            is_array($payload['tree'] ?? null) ? $payload['tree'] : [],
            $features
        );

        return $payload;
    }

    private function filterNodesForRuntime(array $nodes, array $features): array
    {
        $filtered = [];
        foreach ($nodes as $node) {
            if (!is_array($node)) {
                continue;
            }

            $hadChildren = isset($node['children']) && is_array($node['children']) && $node['children'] !== [];
            $type = $this->sanitizeKey((string) ($node['type'] ?? 'custom'));
            $requiredFeature = $this->runtimeFeatureForNodeType($type);
            if ($requiredFeature !== '' && !$this->featureEnabled($features, $requiredFeature)) {
                continue;
            }

            if (isset($node['children']) && is_array($node['children'])) {
                $node['children'] = $this->filterNodesForRuntime($node['children'], $features);
            }
            if ($hadChildren && ($node['children'] ?? []) === [] && in_array($type, ['row', 'column', 'block'], true)) {
                continue;
            }

            $filtered[] = $node;
        }

        return $filtered;
    }

    private function runtimeFeatureForNodeType(string $type): string
    {
        return match ($type) {
            'banner', 'video', 'image', 'map' => 'media_blocks',
            'product_tile' => 'commerce_blocks',
            'hook' => 'hook_blocks',
            'blog_post', 'blog_list', 'blog_carousel', 'blog_popular' => 'extension_blocks',
            default => '',
        };
    }

    private function featureEnabled(array $features, string $key): bool
    {
        return !empty($features[$key]['enabled']);
    }

    public function missingRequirementLabels(array $requirements, array $features): array
    {
        $labels = [];
        foreach ($requirements as $requirement) {
            $key = $this->sanitizeKey((string) $requirement);
            if ($key === '' || !empty($features[$key]['enabled'])) {
                continue;
            }

            $labels[] = (string) ($features[$key]['label'] ?? $key);
        }

        return array_values(array_unique($labels));
    }

    public function proFeatureKeys(): array
    {
        return self::RESERVED_PRO_FEATURE_KEYS;
    }

    private function baseFeatureDefinitions(): array
    {
        return [
            'menu_builder_basic' => [
                'label' => $this->module->trans('Basic menu builder', [], 'Modules.CciNiceMenu.Admin'),
                'description' => $this->module->trans('Create one classic displayTop menu with standard navigation links.', [], 'Modules.CciNiceMenu.Admin'),
            ],
            'single_menu' => [
                'label' => $this->module->trans('Single menu', [], 'Modules.CciNiceMenu.Admin'),
                'description' => $this->module->trans('Manage the first storefront menu.', [], 'Modules.CciNiceMenu.Admin'),
            ],
            'display_top' => [
                'label' => $this->module->trans('displayTop hook', [], 'Modules.CciNiceMenu.Admin'),
                'description' => $this->module->trans('Render the menu in the main storefront header hook.', [], 'Modules.CciNiceMenu.Admin'),
            ],
            'simple_links' => [
                'label' => $this->module->trans('Simple links', [], 'Modules.CciNiceMenu.Admin'),
                'description' => $this->module->trans('Manual, CMS, category and product links.', [], 'Modules.CciNiceMenu.Admin'),
            ],
            'frontend_runtime' => [
                'label' => $this->module->trans('Frontend runtime', [], 'Modules.CciNiceMenu.Admin'),
                'description' => $this->module->trans('CSS and JavaScript needed to render the menu on the storefront.', [], 'Modules.CciNiceMenu.Admin'),
            ],
        ];
    }

    private function collectNodeRequirements(array $nodes, array &$required): void
    {
        foreach ($nodes as $node) {
            if (!is_array($node)) {
                continue;
            }

            $type = $this->sanitizeKey((string) ($node['type'] ?? 'custom'));
            $variant = $this->sanitizeKey((string) ($node['component_variant'] ?? ''));
            $layoutRole = $this->sanitizeKey((string) ($node['layout_role'] ?? ''));
            $hasLegacyProVariant = $variant === '' && $this->usesLegacyProComponentClass($node);

            if ($variant !== '' || $layoutRole !== '' || $hasLegacyProVariant) {
                $required[] = 'showcase_blocks';
            }

            if (in_array($type, ['banner', 'video', 'image', 'map'], true)) {
                $required[] = 'media_blocks';
            }

            if ($type === 'product_tile') {
                $required[] = 'commerce_blocks';
            }

            if ($type === 'hook') {
                $required[] = 'hook_blocks';
            }

            if (in_array($type, ['blog_post', 'blog_list', 'blog_carousel', 'blog_popular'], true)) {
                $required[] = 'extension_blocks';
            }

            if (isset($node['children']) && is_array($node['children'])) {
                $this->collectNodeRequirements($node['children'], $required);
            }
        }
    }

    private function usesLegacyProComponentClass(array $node): bool
    {
        $cssClass = strtolower(trim((string) ($node['css_class'] ?? '')));
        if ($cssClass === '') {
            return false;
        }

        $reservedPrefixes = [
            'cci-nice-menu-showcase-',
            'cci-nice-menu-category-browser-',
            'cci-nice-menu-dynamic-',
            'cci-nice-menu-bestsellers-',
            'cci-nice-menu-promotions-',
            'cci-nice-menu-brand-',
        ];

        foreach (preg_split('/\s+/', $cssClass) ?: [] as $className) {
            if ($className === 'cci-nice-menu-card-list-action') {
                return true;
            }

            foreach ($reservedPrefixes as $prefix) {
                if (str_starts_with($className, $prefix)) {
                    return true;
                }
            }
        }

        return false;
    }

    private function usesResponsiveVisibility($nodes): bool
    {
        if (!is_array($nodes)) {
            return false;
        }

        foreach ($nodes as $node) {
            if (!is_array($node)) {
                continue;
            }

            $displayOptions = is_array($node['display_options'] ?? null) ? $node['display_options'] : $node;
            foreach (['hide_desktop', 'hideDesktop', 'hide_tablet', 'hideTablet', 'hide_mobile', 'hideMobile'] as $key) {
                if (!empty($displayOptions[$key])) {
                    return true;
                }
            }

            if ($this->usesResponsiveVisibility($node['children'] ?? [])) {
                return true;
            }
        }

        return false;
    }

    private function usesThemePreset(array $settings): bool
    {
        $theme = trim((string) ($settings['theme'] ?? ''));
        if ($theme !== '' && !in_array($theme, ['night-glass', 'clean-light'], true)) {
            return true;
        }

        $layout = trim((string) ($settings['layout'] ?? ''));

        return $layout !== '' && !in_array($layout, ['classic', 'compact'], true);
    }

    private function isProActive(array $license): bool
    {
        if (!empty($license['locked']) || !empty($license['writeLocked'])) {
            return false;
        }

        return $this->isProModuleInstalled()
            && (
                !empty($license['canUse'])
                || !empty($license['runtimeAllowed'])
                || !empty($license['isActive'])
                || (string) ($license['status'] ?? '') === 'active'
            );
    }

    private function isProModuleInstalled(): bool
    {
        if (!class_exists('Module')) {
            return false;
        }

        $installed = \Module::isInstalled(self::PRO_MODULE_NAME);
        $enabled = method_exists(\Module::class, 'isEnabled') ? \Module::isEnabled(self::PRO_MODULE_NAME) : $installed;

        if (!$installed || !$enabled) {
            return false;
        }

        $module = \Module::getInstanceByName(self::PRO_MODULE_NAME);

        return $module instanceof \Module && !empty($module->active);
    }

    private function featureContributions(array $features, array $license, bool $forRuntime = false): array
    {
        $raw = \Hook::exec('displayCciNiceMenuFeatures', [
            'features' => $features,
            'license' => $license,
            'for_runtime' => $forRuntime,
            'module' => $this->module->name,
        ], null, true);

        if (!is_array($raw)) {
            return [];
        }

        $result = [];
        foreach ($raw as $group) {
            foreach ($this->normalizeContributionGroup($group) as $feature) {
                $key = $this->sanitizeKey((string) ($feature['key'] ?? $feature['id'] ?? $feature['feature'] ?? ''));
                if ($key === '') {
                    continue;
                }

                $result[$key] = $feature;
            }
        }

        return $result;
    }

    private function normalizeContributionGroup($group): array
    {
        if (is_string($group)) {
            $decoded = json_decode($group, true);
            $group = json_last_error() === JSON_ERROR_NONE ? $decoded : [];
        }

        if (!is_array($group)) {
            return [];
        }

        if (isset($group['key']) || isset($group['id']) || isset($group['feature']) || isset($group['module']) || isset($group['moduleName'])) {
            return [$group];
        }

        return array_values(array_filter($group, static fn ($item): bool => is_array($item)));
    }

    private function normalizeFeature(string $key, array $definition, bool $enabled, string $source): array
    {
        $source = $this->sanitizeKey($source);
        $plan = $this->sanitizeKey((string) ($definition['plan'] ?? ($source === 'core' ? 'free' : 'pro')));

        return [
            'key' => $this->sanitizeKey($key),
            'label' => trim((string) ($definition['label'] ?? $key)),
            'description' => trim((string) ($definition['description'] ?? '')),
            'enabled' => $enabled,
            'source' => $source,
            'plan' => $plan,
            'requiresPro' => !empty($definition['requiresPro']) || $plan === 'pro' || $plan === 'paid' || ($source !== 'core' && $source !== 'free'),
        ];
    }

    private function normalizeFeatureSource(array $definition, array $current = []): string
    {
        return $this->sanitizeKey((string) (
            $definition['source']
            ?? $definition['moduleName']
            ?? $definition['module']
            ?? $current['source']
            ?? 'extension'
        ));
    }

    private function canOverrideFeature(string $key, string $source): bool
    {
        if (!$this->isReservedProFeature($key) && !isset($this->baseFeatureDefinitions()[$key])) {
            return true;
        }

        return $this->isCoreProSource($source);
    }

    private function contributionRequiresCorePro(array $definition, string $key, array $requirements = []): bool
    {
        if ($this->isReservedProFeature($key)) {
            return true;
        }

        $plan = $this->sanitizeKey((string) ($definition['plan'] ?? ''));
        if (!empty($definition['requiresPro']) || !empty($definition['requires_core_pro']) || $plan === 'pro' || $plan === 'paid') {
            return true;
        }

        foreach ($requirements as $requirement) {
            if ($this->isReservedProFeature($requirement)) {
                return true;
            }
        }

        return false;
    }

    private function isReservedProFeature(string $key): bool
    {
        return in_array($this->sanitizeKey($key), $this->proFeatureKeys(), true);
    }

    private function isCoreProSource(string $source): bool
    {
        return $this->sanitizeKey($source) === self::PRO_MODULE_NAME;
    }

    private function normalizeRequirements($requirements): array
    {
        if (is_string($requirements)) {
            $requirements = preg_split('/[,|]/', $requirements) ?: [];
        } elseif (!is_array($requirements)) {
            $requirements = [];
        }

        return array_values(array_unique(array_filter(array_map([$this, 'sanitizeKey'], $requirements))));
    }

    private function sanitizeKey(string $value): string
    {
        $value = strtolower(trim($value));
        $value = preg_replace('/[^a-z0-9_\\-]+/', '_', $value);
        $value = is_string($value) ? trim($value, '_-') : '';

        return str_replace('-', '_', $value);
    }
}
