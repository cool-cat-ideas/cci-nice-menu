{*
 * CCI Nice Menu - Admin configuration view
 *}

<style>
{literal}
body.adminccinicemenu #content.bootstrap,
body.adminccinicemenu #content.bootstrap.with-tabs,
body.adminccinicemenuconfiguration #content.bootstrap,
body.adminccinicemenuconfiguration #content.bootstrap.with-tabs {
  width: calc(100% - var(--cdk-sidebar-width, 0px)) !important;
  margin-left: var(--cdk-sidebar-width, 0px) !important;
  padding: 0 !important;
}

body.page-sidebar-closed:not(.mobile).adminccinicemenu #content.bootstrap,
body.page-sidebar-closed:not(.mobile).adminccinicemenuconfiguration #content.bootstrap {
  width: calc(100% - var(--cdk-sidebar-width-collapse, 0px)) !important;
  margin-left: var(--cdk-sidebar-width-collapse, 0px) !important;
}

body.mobile.adminccinicemenu #content.bootstrap,
body.mobile.adminccinicemenuconfiguration #content.bootstrap {
  width: 100% !important;
  margin-left: 0 !important;
}

.cci-nice-menu-admin-bootstrap {
  display: flow-root;
  min-height: calc(100vh - 32px);
  background: #f4f6f8;
}

#cci-nice-menu-admin-root.cci-nice-menu-admin-root {
  min-height: calc(100vh - 32px);
  margin-top: 94px;
  background: #f4f6f8;
}

.cci-nice-menu-admin-loader {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 320px;
  gap: 12px;
  padding: 24px;
  text-align: center;
  color: #526173;
}

.cci-nice-menu-admin-loader-icon {
  display: inline-flex;
  width: 40px;
  height: 40px;
  align-items: center;
  justify-content: center;
  border: 1px solid #c9c0ff;
  border-radius: 6px;
  background: #f3f0ff;
}

.cci-nice-menu-admin-loader-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(96, 65, 223, 0.24);
  border-top-color: #6041df;
  border-radius: 999px;
  animation: cci-nice-menu-admin-loader-spin 0.75s linear infinite;
}

.cci-nice-menu-admin-loader-label {
  font-size: 14px;
  font-weight: 600;
  line-height: 20px;
}

@keyframes cci-nice-menu-admin-loader-spin {
  to { transform: rotate(360deg); }
}

@media (max-width: 960px) {
  #cci-nice-menu-admin-root.cci-nice-menu-admin-root {
    margin-top: 68px;
  }
}
{/literal}
</style>

<div class="cci-nice-menu-admin-bootstrap">
  <div id="cci-nice-menu-admin-root" data-module="{$modulePath|escape:'html':'UTF-8'}" class="cci-nice-menu-admin-root">
    <div class="cci-nice-menu-admin-loader" role="status" aria-live="polite">
      <span class="cci-nice-menu-admin-loader-icon" aria-hidden="true">
        <span class="cci-nice-menu-admin-loader-spinner"></span>
      </span>
      <span class="cci-nice-menu-admin-loader-label">{$adminLoadingLabel|escape:'html':'UTF-8'}</span>
    </div>
  </div>

  <script type="application/json" id="cci-nice-menu-initial-state">
    {$initialPayload nofilter}
  </script>
  <script>
    const ccinmLicense = {$license nofilter};
    const ccinmEnabledFeatures = {$enabledFeatures nofilter};
    window.CCINiceMenuConfig = {
      modulePath: '{$modulePath|escape:'javascript':'UTF-8'}',
      adminToken: {$adminToken nofilter},
      apiBase: {$adminAjaxEndpoint nofilter},
      license: ccinmLicense,
      features: {$features nofilter},
      enabledFeatures: ccinmEnabledFeatures,
      multistore: {$multistore nofilter},
      extensions: {$extensions nofilter},
      hooks: {$hooks nofilter},
      availableHooks: {$availableHooks nofilter},
      presets: {$presetLayouts nofilter},
      defaultSettings: {$defaultSettings nofilter},
      schemaVersion: {$schemaVersion nofilter},
      themePresets: {$themePresets nofilter},
      moduleVersion: {$moduleVersion nofilter},
      moduleSettings: {$moduleSettings nofilter},
      documentationUrl: {$documentationUrl nofilter},
      upgradeUrl: {$upgradeUrl nofilter},
      marketplaceFeedEndpoint: {$marketplaceFeedEndpoint nofilter},
      extensionStoreEndpoint: {$extensionStoreEndpoint nofilter},
      adminDate: {$adminDate nofilter},
      diagnostics: {$diagnostics nofilter},
      i18n: {$adminI18n nofilter},
    };
  </script>
  {foreach from=$adminExtensionScripts item=adminExtensionScript}
    <script type="module" src="{$adminExtensionScript.src|escape:'html':'UTF-8'}?v={$adminExtensionScript.version|escape:'html':'UTF-8'}"></script>
  {/foreach}
  <script type="module" src="{$modulePath|escape:'html':'UTF-8'}views/js/ccinice-menu-admin.js?v={$adminAssetVersion|escape:'html':'UTF-8'}"></script>
</div>
