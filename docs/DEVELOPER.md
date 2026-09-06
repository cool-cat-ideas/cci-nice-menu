# CCI Nice Menu Developer Guide

## Choose What You Are Extending

| Goal | Recommended mechanism | Guide |
| --- | --- | --- |
| Menu markup | PrestaShop theme override | [Templates and styling](./TEMPLATES_AND_STYLING.md) |
| Menu styling | Scoped theme CSS | [Templates and styling](./TEMPLATES_AND_STYLING.md) |
| Existing module output | Hook node backed by a real display hook | [Extension cookbook](./EXTENSION_COOKBOOK.md) |
| Installable integration | Separate PrestaShop extension module | [Extension cookbook](./EXTENSION_COOKBOOK.md) |
| Public integration | Documented CCI Nice Menu hooks | [Hooks reference](./HOOKS_REFERENCE.md) |

The directory and method sections below explain product internals. They are
not the primary extension contract and should not be copied into an add-on.

## Directory Structure

```text
cci_nice_menu/
  cci_nice_menu.php                         Module entrypoint, hooks, admin API.
  controllers/admin/
    AdminCciNiceMenuConfigurationController.php
    AdminCciNiceMenuController.php
  src/Core/
    CciNiceMenuCore.php                     Menu storage, normalization, renderer.
    CciNiceMenuFeatureRegistry.php          Free/Pro feature and requirement checks.
  src/Shared/
    CciSharedLicenseEnvironment.php         Shared environment helper for license UI.
  src/admin-v2/                             React admin source.
  views/css/
    cci_nice_menu_front.css                 Base storefront CSS.
    cci_nice_menu_front_runtime.css         Runtime storefront components.
    cci_nice_menu_admin.css                 Generated admin CSS.
  views/js/
    cci_nice_menu_front.js                  Storefront interaction runtime.
    ccinice-menu-admin.js                   Generated React admin bundle.
  views/templates/
    admin/configure.tpl                     React mount point.
    hook/desktop-nav.tpl                    Storefront wrapper template.
  views/data/
    retail_showcase_tree.json               Optional Pro showcase loaded from the editor.
  docs/
```

Development-only folders such as `src/admin-v2`, `node_modules`, temporary
screenshots and database backups must not be shipped in customer release ZIPs.

## Main Public PHP Methods

### `cci_nice_menu.php`

- `install()` / `uninstall()`: register hooks, install/uninstall storage and
  defaults.
- `getContent()`: legacy Module manager entry that renders the React admin shell.
- `renderAdminContent($tokenController)`: build admin payload and React mount
  markup.
- `ensureIntegrationHooks()`: create integration hooks such as `displaySearch`
  and `displayReassurance` when needed.
- `hookActionAdminControllerSetMedia()`: enqueue admin assets.
- `hookActionFrontControllerSetMedia()`: enqueue storefront assets when a menu
  is active.
- `hookDisplayTop()` / `hookDisplayNav1()` / `hookDisplayNav2()` /
  `hookDisplayNavFullWidth()`: render the active menu for the matching
  placement.
- `hookDisplayCciNiceMenuFeatures()`: base Free feature hook. Pro/add-ons extend
  capability state through this contract.
- `hookDisplayCciNiceMenuAdminExtensions()`: base admin extension list hook.

`__call()` handles dynamic hook methods for safe integration hooks. Do not use
it as a public extension API unless the hook is documented in `EXTENSIONS.md`.

### `CciNiceMenuCore`

- `install()` / `uninstall()`: create/drop the module table and seed default
  menus.
- `getMenus($shopId)`: list saved menus for the shop.
- `countMenus($shopId)`: count saved menus for Free/Pro gating.
- `getActiveMenu($shopId, $hookName)`: resolve the active menu for a storefront
  hook.
- `getPresetLayouts()`: return admin layout presets.
- `getThemePresets()`: return theme preset metadata.
- `getDefaultSettings()`: return module default settings.
- `getSchemaVersion()`: return the saved JSON schema version.
- `getMenu($shopId, $menuId)`: load one saved menu.
- `buildMenuMarkup($nodes, $level, $settings, $moduleSettings)`: render
  normalized menu nodes to storefront HTML.
- `saveMenu($shopId, $payload)`: normalize, validate and save a menu.
- `deleteMenu($shopId, $menuId)`: delete one menu from the current shop.

### `CciNiceMenuFeatureRegistry`

- `integrationHooks()`: return module integration hooks.
- `getFeatures($license)`: build feature map from Free, Pro and add-on hooks.
- `decorateLicensePayload($license)`: add feature metadata to the license
  payload shown in admin.
- `getAdminExtensions($features)`: list installed extensions for the Extensions
  panel.
- `getMenuPayloadRequiredFeatures($payload, $existingMenuCount, $isNew)`:
  calculate feature requirements for a menu save/import.
- `requirementsMet($requirements, $features)`: check whether a payload can be
  saved.
- `prepareMenuForRuntime($payload, $features)`: preserve the saved menu
  presentation while filtering only individual runtime nodes that require
  unavailable Pro features.
- `missingRequirementLabels($requirements, $features)`: return human labels for
  blocked requirements.
- `proFeatureKeys()`: return reserved Pro keys.

Internal helper methods may change without a compatibility promise.

## Admin API Actions

The React admin posts to the module configuration controller with
`ajaxAction`. Important actions:

| Action | Purpose |
| --- | --- |
| `menus:list` | List saved menus. |
| `layouts:list` | Load layout presets. |
| `module-settings:get` / `module-settings:save` | Read/write module settings. |
| `catalog:categories` | Search PrestaShop categories. |
| `catalog:products` | Search products. |
| `catalog:cms_pages` | Search CMS pages. |
| `blog:posts` | Search CCI Blog posts when `cci_blog` is installed. |
| `media:list` | Pro-only read-only image catalog. Accepts `query` and `source`; returns validated public image metadata, never filesystem paths or HTML. |
| `blog:categories` | Search CCI Blog categories when `cci_blog` is installed. |
| `menu:get` | Read one saved menu. |
| `menu:save` | Save a menu after feature gating. |
| `menu:export` | Return a complete menu payload. |
| `menu:import` | Save an imported menu as a new record. |
| `menu:delete` | Delete one menu. |
| `multistore:context` | List accessible shops and current Pro Multistore state. |
| `multistore:menu:copy-shops` | Copy one menu as an independent definition to selected shops. |
| `license:get` / `license:activate` / `license:check` / `license:deactivate` | Pro license actions delegated to `cci_nice_menu_pro` when installed. |
| `review-feedback:save` | Validate the rating and required consent, then create a pending product review through the configured marketplace API. Payload stores the exact consent text, version, locale and acceptance time with the review. The action returns an error when the remote service does not confirm the write. |

The copy action delegates to `CciNiceMenuProMultistoreManager` and requires the
reserved `multistore` capability. Node IDs are preserved deliberately; target
catalogue references must be validated after copying.

## Saved Menu Shape

Menus are stored in `ps_cci_nice_menu`:

```text
id_menu
id_shop
code
name
hook_name
is_active
position
tree_json
settings_json
created_at
updated_at
```

`tree_json` stores a normalized tree. The supported structural model is:

```text
Row > Column > Block > content/internal columns
```

Top navigation uses one row with columns. Dropdowns use the same row/column
model inside each top-level item.

Typical node fields:

```json
{
  "id": "node-id",
  "type": "custom",
  "label": "Menu label",
  "link": "#",
  "element_rendering": "link",
  "icon": "trophy",
  "description": "Optional description",
  "component_variant": "showcase_card_list",
  "column_span": 6,
  "children": []
}
```

When adding a field, update all of these areas:

1. PHP normalization in `CciNiceMenuCore`.
2. React normalization/defaults in `src/admin-v2/components/MenuBuilderPanel.jsx`.
3. Admin form read/write.
4. Storefront rendering.
5. Backward-compatible fallback for old `tree_json`.
6. Demo seed/preset if the field is visible in the showcase.
7. Documentation.

## Build Workflow

```bash
cd modules/cci_nice_menu
npm run build:admin
```

Then check:

```bash
php -l cci_nice_menu.php
php -l src/Core/CciNiceMenuCore.php
php -l src/Core/CciNiceMenuFeatureRegistry.php
node --check views/js/ccinice-menu-admin.js
```

For UI changes, verify the real PrestaShop shop with Playwright or a browser.
In this local environment the shop usually runs at:

```text
http://localhost:4090
```

## Extension Development

Use the contracts in [EXTENSIONS.md](./EXTENSIONS.md). Do not depend on
undocumented private classes or internal CSS selectors.

For custom dynamic content, prefer a PrestaShop hook node:

```json
{
  "type": "hook",
  "label": "Search",
  "hook_name": "displaySearch"
}
```

For paid behavior, use a namespaced feature key and require the Pro layer. Do
not reuse reserved Pro keys from `FREE_PRO.md`.
