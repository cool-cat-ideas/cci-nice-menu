export const pluginData = (() => {
    const cfg = window.CCINiceMenuConfig || {};
    const rawLicense = cfg.license || {};
    const defaultI18n = {
        dashboard: 'Menus',
        extensions: 'Extensions',
        diagnostics: 'Diagnostics',
        settings: 'Settings',
        menu: 'Menu',
        save: 'Save',
        active: 'Active',
        inactive: 'Inactive',
        version: 'Version',
    };
    const license = {
        ...rawLicense,
        apiBase: cfg.apiBase || '',
        canManage: Boolean(rawLicense.canManage && rawLicense.proModuleAvailable),
        status: rawLicense.status || (rawLicense.canUse ? 'active' : 'inactive'),
        label: rawLicense.label || (rawLicense.canUse ? 'PRO' : 'Inactive'),
    };
    const features = Array.isArray(cfg.features)
        ? cfg.features
        : (Array.isArray(rawLicense.availableFeatures) ? rawLicense.availableFeatures : []);
    const enabledFeatures = Array.isArray(cfg.enabledFeatures)
        ? cfg.enabledFeatures
        : (Array.isArray(rawLicense.enabledFeatures) ? rawLicense.enabledFeatures : (Array.isArray(rawLicense.features) ? rawLicense.features : []));

    const runtime = getCciNiceMenuProRuntime();
    const licenseIsPro = isCciNiceMenuProLicenseActive(license, runtime);
    if (licenseIsPro && !runtime.canUse) {
        syncCciNiceMenuProRuntimeFromLicense(license, { features, enabledFeatures });
    }

    return {
        apiBase: cfg.apiBase || '',
        modulePath: cfg.modulePath || '',
        adminToken: cfg.adminToken || '',
        nonce: cfg.adminToken || '',
        hooks: Array.isArray(cfg.hooks) ? cfg.hooks : [],
        availableHooks: Array.isArray(cfg.availableHooks) ? cfg.availableHooks : (Array.isArray(cfg.hooks) ? cfg.hooks : []),
        presets: cfg.presets || {},
        themePresets: cfg.themePresets || {},
        defaultSettings: cfg.defaultSettings || {},
        moduleSettings: cfg.moduleSettings || {},
        diagnostics: cfg.diagnostics || null,
        schemaVersion: cfg.schemaVersion || 2,
        moduleVersion: cfg.moduleVersion || '1.0.0',
        pluginVersion: cfg.pluginVersion || cfg.moduleVersion || '1.0.0',
        marketplaceFeedEndpoint: cfg.marketplaceFeedEndpoint || '',
        adminDate: cfg.adminDate || {},
        features,
        enabledFeatures,
        multistore: cfg.multistore || {},
        extensions: Array.isArray(cfg.extensions) ? cfg.extensions : [],
        templateStoreEndpoint: cfg.templateStoreEndpoint || cfg.marketplaceTemplatesEndpoint || '',
        extensionStoreEndpoint: cfg.extensionStoreEndpoint || cfg.marketplaceExtensionsEndpoint || cfg.integrationStoreEndpoint || cfg.templateStoreEndpoint || cfg.marketplaceTemplatesEndpoint || '',
        upgradeUrl: cfg.upgradeUrl || cfg.documentationUrl || '#',
        reviewUrl: cfg.reviewUrl || cfg.wordpressReviewUrl || cfg.documentationUrl || '#',
        wordpressReviewUrl: cfg.wordpressReviewUrl || cfg.reviewUrl || cfg.documentationUrl || '#',
        reviewEndpoint: cfg.reviewEndpoint || '/review-feedback',
        reviewFeedbackEndpoint: cfg.reviewFeedbackEndpoint || cfg.reviewEndpoint || '/review-feedback',
        license,
        isPro: licenseIsPro,
        documentationUrl: cfg.documentationUrl || 'https://docs.prestashop-project.org/',
        i18n: {
            ...defaultI18n,
            ...(cfg.i18n || {}),
        },
    };
})();

export function getCciNiceMenuProRuntime() {
    if (typeof window === 'undefined') {
        return { canUse: false, features: [], capabilities: [] };
    }

    const runtime = window.cciNiceMenuProRuntime || {};
    const license = runtime.license || {};
    const features = Array.isArray(runtime.features) ? runtime.features : [];
    const capabilities = Array.isArray(runtime.capabilities) ? runtime.capabilities : [];

    return {
        ...runtime,
        canUse: Boolean(runtime.canUse || license.canUse),
        features: features.map((feature) => String(feature)),
        capabilities: capabilities.map((capability) => String(capability)),
        source: String(runtime.source || license.source || ''),
    };
}

export function isCciNiceMenuProRuntimeActive() {
    const runtime = getCciNiceMenuProRuntime();

    return runtime.canUse === true && runtime.source === 'cci_nice_menu_pro';
}

export function isCciNiceMenuProLicenseActive(license = {}, runtime = null) {
    const normalized = license && typeof license === 'object' ? license : {};
    const source = String(normalized.source || runtime?.source || '');
    const hasProSource = source === 'cci_nice_menu_pro' || Boolean(normalized.proModuleAvailable);
    if (normalized.writeLocked || normalized.locked) return false;
    const hasActiveState = normalized.status === 'active'
        || Boolean(normalized.canUse)
        || Boolean(normalized.runtimeAllowed)
        || Boolean(normalized.isPro);

    return hasProSource && hasActiveState;
}

export function isCciNiceMenuProFeatureEnabled(feature) {
    if (!feature || !isCciNiceMenuProRuntimeActive()) {
        return false;
    }

    return getCciNiceMenuProRuntime().features.includes(String(feature));
}

const actionMap = {
    '/menus/list': 'menus:list',
    '/layouts/list': 'layouts:list',
    '/module-settings/get': 'module-settings:get',
    '/module-settings/save': 'module-settings:save',
    '/menu/get': 'menu:get',
    '/menu/save': 'menu:save',
    '/menu/import': 'menu:import',
    '/menu/export': 'menu:export',
    '/menu/delete': 'menu:delete',
    '/multistore/context': 'multistore:context',
    '/multistore/menus/copy': 'multistore:menu:copy-shops',
    '/catalog/categories': 'catalog:categories',
    '/catalog/products': 'catalog:products',
    '/catalog/cms-pages': 'catalog:cms_pages',
    '/blog/posts': 'blog:posts',
    '/blog/categories': 'blog:categories',
    '/media/list': 'media:list',
    '/license/get': 'license:get',
    '/license/activate': 'license:activate',
    '/license/check': 'license:check',
    '/license/deactivate': 'license:deactivate',
    '/review-feedback': 'review-feedback:save',
};

function resolveAction(path) {
    const rawPath = String(path || '');
    const match = Object.keys(actionMap).find((endpoint) => rawPath.endsWith(endpoint) || rawPath.includes(endpoint));

    return match ? actionMap[match] : rawPath.replace(/^\//, '').replace(/\//g, ':');
}

function buildAdminUrl(action) {
    const separator = pluginData.apiBase.includes('?') || pluginData.apiBase.includes('&') ? '&' : '?';
    const tokenParam = encodeURIComponent(pluginData.adminToken || '');

    return `${pluginData.apiBase}${separator}ajax=1&token=${tokenParam}&ajaxAction=${encodeURIComponent(action)}`;
}

function normalizeLicensePayload(response = {}) {
    if (!response.license) {
        return response;
    }

    const license = {
        ...response.license,
        apiBase: pluginData.apiBase,
        canManage: Boolean(response.license.canManage && response.license.proModuleAvailable),
        status: response.license.status || (response.license.canUse ? 'active' : 'inactive'),
        label: response.license.label || (response.license.canUse ? 'PRO' : 'Inactive'),
    };

    if (Array.isArray(response.features)) {
        pluginData.features = response.features;
    } else if (Array.isArray(license.availableFeatures)) {
        pluginData.features = license.availableFeatures;
    }
    if (Array.isArray(response.enabledFeatures)) {
        pluginData.enabledFeatures = response.enabledFeatures;
    } else if (Array.isArray(license.enabledFeatures)) {
        pluginData.enabledFeatures = license.enabledFeatures;
    } else if (Array.isArray(license.features)) {
        pluginData.enabledFeatures = license.features;
    }
    syncCciNiceMenuProRuntimeFromLicense(license, response);

    pluginData.license = license;
    pluginData.isPro = isCciNiceMenuProLicenseActive(license);

    return {
        ...response,
        license,
    };
}

function syncCciNiceMenuProRuntimeFromLicense(license = {}, response = {}) {
    if (typeof window === 'undefined') {
        return;
    }

    const runtimeController = window.CCINiceMenuProRuntimeController || null;
    if (runtimeController && typeof runtimeController.syncFromLicense === 'function') {
        runtimeController.syncFromLicense(license, response);
        return;
    }

    const features = Array.isArray(response.features)
        ? response.features.map((feature) => String(feature))
        : (Array.isArray(license.availableFeatures)
            ? license.availableFeatures.map((feature) => String(feature))
            : (Array.isArray(license.features) ? license.features.map((feature) => String(feature)) : []));

    window.cciNiceMenuProRuntime = {
        source: String(license.source || 'cci_nice_menu_pro'),
        canUse: isCciNiceMenuProLicenseActive(license, { source: 'cci_nice_menu_pro' }),
        features,
        capabilities: Array.isArray(response.capabilities) ? response.capabilities.map((capability) => String(capability)) : [],
        license,
    };
    window.dispatchEvent(new CustomEvent('cci-nice-menu:pro-runtime-ready', { detail: window.cciNiceMenuProRuntime }));
}

export function apiFetch(path, options = {}) {
    const action = resolveAction(path);
    const requestOptions = {
        credentials: 'same-origin',
        method: options.method || 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...(options.headers || {}),
        },
        ...options,
    };

    return fetch(buildAdminUrl(action), requestOptions).then((response) => response.json()
        .catch(() => ({}))
        .then((payload) => {
            const normalized = normalizeLicensePayload(payload || {});

            if (!response.ok || normalized.success === false) {
                const requestError = new Error(normalized.error || normalized.message || `CCI Nice Menu API request failed (${response.status}).`);
                requestError.code = normalized.code || '';
                requestError.status = response.status;
                requestError.details = normalized.warning || normalized.details || '';
                requestError.data = normalized;
                throw requestError;
            }

            return normalized;
        }));
}
