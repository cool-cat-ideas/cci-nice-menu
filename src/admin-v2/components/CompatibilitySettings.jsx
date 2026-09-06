import { DiagnosticCard, DiagnosticList } from '@cci/admin-ui/product-panels';
import React, { useState } from 'react';
import { AlertTriangle, Bug, CheckCircle2, Clipboard, Database, Gauge, RefreshCw, Settings } from 'lucide-react';
import { apiFetch, pluginData } from '../api';
import { __, coreString } from '../i18n';
import { Button } from './ui/button';
import { CardHeader } from './ui/card';
import { Checkbox } from './ui/checkbox';
import { Field, FieldLabel } from './ui/field';
import { Textarea } from './ui/input';
import { Select } from './ui/select';
import { Tabs, TabsList, TabsPanel, TabsTrigger } from './ui/tabs';

const defaultSettings = {
    frontendCss: true,
    frontendJs: true,
    loadStrategy: 'hook',
    iconLibrary: 'none',
    iconSource: 'local',
    owlAssetsSource: 'module',
};

export default function CompatibilitySettings({ setNotice }) {
    const [activeTab, setActiveTab] = useState('compatibility');
    const [settings, setSettings] = useState({
        ...defaultSettings,
        ...(pluginData.moduleSettings || {}),
    });
    const [saving, setSaving] = useState(false);
    const [diagnostics] = useState(pluginData.diagnostics || null);
    const [diagnosticsLoading] = useState(false);
    const [diagnosticsError, setDiagnosticsError] = useState('');
    const iconLibrary = settings.iconLibrary || 'none';
    const iconSource = settings.iconSource || 'local';
    const iconLibraryHelp = {
        none: __('No icon font is loaded. Choose Font Awesome or Tabler before adding menu icons.', 'cci-nice-menu'),
        theme: __('Use icon tokens already exposed by the active theme or another installed asset.', 'cci-nice-menu'),
        fontawesome: __('Use Font Awesome names in menu items, for example user, house or cart-shopping.', 'cci-nice-menu'),
        tabler: __('Use Tabler icon names in menu items, for example user, home or shopping-cart.', 'cci-nice-menu'),
    }[iconLibrary] || __('Use an icon token from the configured icon source.', 'cci-nice-menu');
    const iconSourceHelp = iconSource === 'cdn'
        ? __('The selected icon library will be loaded from the vendor CDN on the storefront.', 'cci-nice-menu')
        : __('The selected icon library will be loaded from files shipped with this module.', 'cci-nice-menu');
    const owlAssetsSource = settings.owlAssetsSource || 'module';
    const owlAssetsHelp = owlAssetsSource === 'module'
        ? __('Nice Menu loads Owl Carousel JS and CSS from the Blog module when a menu contains an article carousel.', 'cci-nice-menu')
        : __('Use this when the active theme or another module already loads Owl Carousel JS and CSS on the storefront.', 'cci-nice-menu');

    const update = (key, value) => {
        setSettings((current) => ({
            ...current,
            [key]: value,
        }));
    };

    const save = () => {
        setSaving(true);
        apiFetch('/module-settings/save', {
            method: 'POST',
            body: JSON.stringify(settings),
        })
            .then((response) => {
                const nextSettings = response.settings || settings;
                pluginData.moduleSettings = nextSettings;
                setSettings(nextSettings);
                setNotice?.({
                    type: 'success',
                    message: response.message || __('Module settings saved.', 'cci-nice-menu'),
                });
            })
            .catch((error) => {
                setNotice?.({
                    type: 'error',
                    message: __('Could not save module settings.', 'cci-nice-menu'),
                    details: error.message,
                });
            })
            .finally(() => setSaving(false));
    };

    const loadDiagnostics = () => {
        setDiagnosticsError('');
        window.location.reload();
    };

    const copyDiagnostics = () => {
        if (!diagnostics) {
            return;
        }

        if (!navigator.clipboard) {
            setNotice?.({
                type: 'error',
                message: __('Clipboard is not available in this browser.', 'cci-nice-menu'),
            });
            return;
        }

        navigator.clipboard
            .writeText(JSON.stringify(diagnostics, null, 2))
            .then(() => {
                setNotice?.({
                    type: 'success',
                    message: __('Diagnostics copied to clipboard.', 'cci-nice-menu'),
                });
            })
            .catch(() => {
                setNotice?.({
                    type: 'error',
                    message: __('Failed copying diagnostics.', 'cci-nice-menu'),
                });
            });
    };

    return (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList aria-label={__('Settings sections', 'cci-nice-menu')}>
                <TabsTrigger value='compatibility'>
                    <Settings aria-hidden='true' />
                    {__('Compatibility', 'cci-nice-menu')}
                </TabsTrigger>
                <TabsTrigger value='diagnostics'>
                    <Bug aria-hidden='true' />
                    {__('Diagnostics', 'cci-nice-menu')}
                </TabsTrigger>
            </TabsList>

            <TabsPanel value='compatibility'>
                <CardHeader>
                    <div>
                        <h2>{__('Compatibility', 'cci-nice-menu')}</h2>
                        <p>{__('Control module assets and storefront compatibility options.', 'cci-nice-menu')}</p>
                    </div>
                    <Button variant='primary' onClick={save} disabled={saving}>
                        {saving ? __('Saving...', 'cci-nice-menu') : __('Save settings', 'cci-nice-menu')}
                    </Button>
                </CardHeader>

                <div className='tw-grid tw-grid-cols-1 tw-gap-3 tw-p-4 lg:tw-grid-cols-2'>
                    <SettingCheckbox
                        checked={Boolean(settings.frontendCss)}
                        label={__('Load frontend CSS', 'cci-nice-menu')}
                        onChange={(checked) => update('frontendCss', checked)}
                    />
                    <SettingCheckbox
                        checked={Boolean(settings.frontendJs)}
                        label={__('Load frontend JavaScript', 'cci-nice-menu')}
                        onChange={(checked) => update('frontendJs', checked)}
                    />
                    <Field label={__('Loading strategy', 'cci-nice-menu')}>
                        <Select
                            value={settings.loadStrategy || 'hook'}
                            onValueChange={(value) => update('loadStrategy', value)}
                            options={[
                                { value: 'hook', label: __('Only when menu hook is used', 'cci-nice-menu') },
                                { value: 'all', label: __('All storefront pages', 'cci-nice-menu') },
                            ]}
                        />
                    </Field>
                    <Field label={__('Owl Carousel assets', 'cci-nice-menu')}>
                        <Select
                            value={owlAssetsSource}
                            onValueChange={(value) => update('owlAssetsSource', value)}
                            options={[
                                { value: 'module', label: __('Load from module', 'cci-nice-menu') },
                                { value: 'theme', label: __('Use existing site assets', 'cci-nice-menu') },
                            ]}
                        />
                        <p className='tw-m-0 tw-mt-1.5 tw-text-xs tw-leading-relaxed tw-text-cci-nm-muted'>
                            {owlAssetsHelp}
                        </p>
                    </Field>
                    <Field label={__('Icon library', 'cci-nice-menu')}>
                        <Select
                            value={iconLibrary}
                            onValueChange={(value) => update('iconLibrary', value)}
                            options={[
                                { value: 'none', label: __('Do not load extra icons', 'cci-nice-menu') },
                                { value: 'theme', label: __('Use theme icons if available', 'cci-nice-menu') },
                                { value: 'fontawesome', label: __('Font Awesome', 'cci-nice-menu') },
                                { value: 'tabler', label: __('Tabler Icons', 'cci-nice-menu') },
                            ]}
                        />
                        <p className='tw-m-0 tw-mt-1.5 tw-text-xs tw-leading-relaxed tw-text-cci-nm-muted'>
                            {iconLibraryHelp}
                        </p>
                    </Field>
                    <Field label={__('Icon source', 'cci-nice-menu')}>
                        <Select
                            value={iconSource}
                            onValueChange={(value) => update('iconSource', value)}
                            options={[
                                { value: 'local', label: __('Local files from module', 'cci-nice-menu') },
                                { value: 'cdn', label: __('Remote CDN from vendor', 'cci-nice-menu') },
                            ]}
                        />
                        <p className='tw-m-0 tw-mt-1.5 tw-text-xs tw-leading-relaxed tw-text-cci-nm-muted'>
                            {iconSourceHelp}
                        </p>
                    </Field>
                </div>
            </TabsPanel>

            <TabsPanel value='diagnostics'>
                <DiagnosticsPanel
                    diagnostics={diagnostics}
                    loading={diagnosticsLoading}
                    error={diagnosticsError}
                    onRefresh={loadDiagnostics}
                    onCopy={copyDiagnostics}
                />
            </TabsPanel>
        </Tabs>
    );
}

function SettingCheckbox({ checked, label, onChange }) {
    return (
        <Field
            data-checked={Boolean(checked)}
            orientation='horizontal'
            className='tw-flex tw-min-h-9 tw-cursor-pointer tw-items-center tw-gap-2 tw-rounded-md tw-border tw-border-solid tw-border-cci-nm-border tw-bg-white tw-px-2.5 tw-text-sm tw-font-medium tw-text-cci-nm-text tw-transition-colors tw-duration-150 hover:tw-border-slate-300 hover:tw-bg-slate-50 focus-within:tw-outline focus-within:tw-outline-2 focus-within:tw-outline-offset-1 focus-within:tw-outline-cci-nm-brand data-[checked=true]:tw-border-cci-nm-brandBorder data-[checked=true]:tw-bg-cci-nm-brandSoft'
        >
            <Checkbox checked={Boolean(checked)} onCheckedChange={(value) => onChange(value === true)} />
            <FieldLabel className='tw-min-w-0 tw-truncate tw-text-sm tw-font-medium tw-normal-case tw-leading-none tw-tracking-normal tw-text-cci-nm-text'>
                {label}
            </FieldLabel>
        </Field>
    );
}

function DiagnosticsPanel({ diagnostics, loading, error, onRefresh, onCopy }) {
    const json = diagnostics ? JSON.stringify(diagnostics, null, 2) : '';
    const logs = Array.isArray(diagnostics?.logs) ? diagnostics.logs : [];
    const assets = Array.isArray(diagnostics?.assets) ? diagnostics.assets : [];
    const hooks = Array.isArray(diagnostics?.hooks) ? diagnostics.hooks : [];

    return (
        <section>
            <CardHeader>
                <div>
                    <h2>{__('Diagnostics and logs', 'cci-nice-menu')}</h2>
                    <p>{__('Copy this report when you contact support. It excludes license keys and tokens.', 'cci-nice-menu')}</p>
                </div>
                <div className='tw-flex tw-flex-wrap tw-gap-2'>
                    <Button onClick={onRefresh} disabled={loading}>
                        <RefreshCw aria-hidden='true' />
                        {loading ? __('Refreshing...', 'cci-nice-menu') : __('Refresh', 'cci-nice-menu')}
                    </Button>
                    <Button variant='outlineAccent' onClick={onCopy} disabled={!diagnostics || loading}>
                        <Clipboard aria-hidden='true' />
                        {__('Copy report', 'cci-nice-menu')}
                    </Button>
                </div>
            </CardHeader>

            {error && (
                <div className='tw-grid tw-gap-3 tw-p-4'>
                    <div className='tw-grid tw-grid-cols-[auto_minmax(0,1fr)] tw-gap-3 tw-rounded-md tw-border tw-border-solid tw-border-cci-nm-warningBorder tw-bg-cci-nm-warningBg tw-p-3 tw-text-cci-nm-warningText [&_svg]:tw-mt-0.5 [&_svg]:tw-h-4 [&_svg]:tw-w-4'>
                        <AlertTriangle aria-hidden='true' />
                        <div>
                            <strong className='tw-text-sm tw-font-semibold'>
                                {__('Diagnostics could not be loaded.', 'cci-nice-menu')}
                            </strong>
                            <p className='tw-m-0 tw-mt-1 tw-text-xs tw-leading-5'>{error}</p>
                        </div>
                    </div>
                </div>
            )}

            {loading && !diagnostics ? (
                <div className='tw-grid tw-min-h-52 tw-place-items-center tw-p-8 tw-text-center tw-text-sm tw-text-cci-nm-muted'>
                    {__('Loading diagnostics...', 'cci-nice-menu')}
                </div>
            ) : (
                <div className='tw-grid tw-gap-4 tw-p-4'>
                    <div className='tw-grid tw-gap-1 tw-rounded-md tw-border tw-border-solid tw-border-cci-nm-infoBorder tw-bg-cci-nm-infoBg tw-p-3 tw-text-cci-nm-infoText'>
                        <strong className='tw-text-sm tw-font-semibold'>{__('Support note', 'cci-nice-menu')}</strong>
                        <span className='tw-text-xs tw-leading-5'>
                            {__('This report verifies versions, shop context, hooks, menu data, asset files and module settings without exposing private license keys.', 'cci-nice-menu')}
                        </span>
                    </div>

                    <div className='tw-grid tw-grid-cols-1 tw-gap-3 lg:tw-grid-cols-3'>
                        <DiagnosticCard
                            label={__('Module', 'cci-nice-menu')}
                            values={[
                                [coreString('version', 'Version'), diagnostics?.module?.version || pluginData.moduleVersion || '-'],
                                [__('Schema', 'cci-nice-menu'), String(diagnostics?.module?.schemaVersion || pluginData.schemaVersion || '-')],
                                [
                                    __('License status', 'cci-nice-menu'),
                                    diagnostics?.license?.status || (pluginData.isPro ? 'active' : 'inactive'),
                                ],
                            ]}
                        />
                        <DiagnosticCard
                            label={__('Environment', 'cci-nice-menu')}
                            values={[
                                [__('PrestaShop', 'cci-nice-menu'), diagnostics?.prestashop?.version || '-'],
                                [__('PHP', 'cci-nice-menu'), diagnostics?.server?.phpVersion || '-'],
                                [__('Debug mode', 'cci-nice-menu'), diagnostics?.prestashop?.debugMode ? __('Yes', 'cci-nice-menu') : __('No', 'cci-nice-menu')],
                            ]}
                        />
                        <DiagnosticCard
                            label={__('Checks', 'cci-nice-menu')}
                            values={[
                                [__('Menus', 'cci-nice-menu'), String(diagnostics?.menus?.total ?? '-')],
                                [__('Active menus', 'cci-nice-menu'), String(diagnostics?.menus?.active ?? '-')],
                                [__('Warnings', 'cci-nice-menu'), String(logs.length)],
                            ]}
                        />
                    </div>

                    <div className='tw-grid tw-grid-cols-1 tw-gap-3 lg:tw-grid-cols-2'>
                        <DiagnosticCard
                            label={__('Shop', 'cci-nice-menu')}
                            values={[
                                [__('Shop ID', 'cci-nice-menu'), String(diagnostics?.shop?.id || '-')],
                                [__('Shop name', 'cci-nice-menu'), diagnostics?.shop?.name || '-'],
                                [__('Domain', 'cci-nice-menu'), diagnostics?.shop?.domain || '-'],
                                [__('Language', 'cci-nice-menu'), diagnostics?.prestashop?.language?.isoCode || '-'],
                            ]}
                        />
                        <DiagnosticCard
                            label={__('Database', 'cci-nice-menu')}
                            values={[
                                [__('Server', 'cci-nice-menu'), diagnostics?.database?.serverVersion || '-'],
                                [__('Prefix', 'cci-nice-menu'), diagnostics?.database?.prefix || '-'],
                                [__('Menu table', 'cci-nice-menu'), diagnostics?.database?.table?.exists ? __('OK', 'cci-nice-menu') : __('Missing', 'cci-nice-menu')],
                                [__('Rows', 'cci-nice-menu'), String(diagnostics?.database?.table?.rows ?? '-')],
                            ]}
                        />
                    </div>

                    <DiagnosticList
                        title={__('Hooks', 'cci-nice-menu')}
                        items={hooks.map((hook) => ({
                            title: hook.name,
                            message: `${__('ID', 'cci-nice-menu')}: ${hook.id || '-'} · ${hook.registered ? __('Registered', 'cci-nice-menu') : __('Not registered', 'cci-nice-menu')}`,
                        }))}
                        empty={__('No hook diagnostics were returned.', 'cci-nice-menu')}
                    />

                    <DiagnosticList
                        title={__('Asset files', 'cci-nice-menu')}
                        items={assets.map((asset) => ({
                            title: asset.relativePath,
                            message: `${asset.exists ? __('Present', 'cci-nice-menu') : __('Missing', 'cci-nice-menu')} · ${asset.size || 0} B · ${asset.modifiedAt || '-'}`,
                        }))}
                        empty={__('No asset diagnostics were returned.', 'cci-nice-menu')}
                    />

                    <DiagnosticList
                        title={__('Recent logs', 'cci-nice-menu')}
                        items={logs.map((log) => ({
                            title: log.type || __('Log', 'cci-nice-menu'),
                            message: log.date ? `${log.message} · ${log.date}` : log.message,
                        }))}
                        empty={__('No recent module warnings were recorded.', 'cci-nice-menu')}
                    />

                    <label className='tw-grid tw-gap-1.5'>
                        <span className='tw-text-[11px] tw-font-bold tw-uppercase tw-leading-none tw-text-slate-600'>
                            {__('Raw diagnostic report', 'cci-nice-menu')}
                        </span>
                        <Textarea readOnly value={json} rows='16' />
                    </label>
                </div>
            )}
        </section>
    );
}

