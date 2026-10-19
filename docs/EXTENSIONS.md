# CCI Nice Menu Extension Contract

This document describes the extension points that are currently implemented by
`cci_nice_menu`. The module does not expose a separate custom component registry
yet. The stable integration surface is the PrestaShop hook node rendered inside
the menu tree.

## Stable Extension Points

| Area | Contract | Purpose |
| --- | --- | --- |
| Menu placement | `displayTop`, `displayNav1`, `displayNav2`, `displayNavFullWidth` | Hooks where the whole menu can be attached. |
| Menu content | node `type = hook` with `hook_name` | Renders output from an existing PrestaShop display hook inside a menu block. |
| Widget fallback | `Module::renderWidget()` for selected modules | Used when `Hook::exec()` is empty for known widget modules. |
| Admin hook picker | PrestaShop `hook` table filtered to `display*` hooks | Gives users a safe list of hooks to place as content nodes. |
| Feature registry | `displayCciNiceMenuFeatures` | Lets Pro or add-on modules unlock supported capabilities. |
| Admin extensions | `displayCciNiceMenuAdminExtensions` | Lists truly installed menu add-ons in the Extensions panel. |
| Admin assets | `displayCciNiceMenuAdminAssets` | Lets Pro or add-ons load admin-side scripts before the React bundle starts. |
| Front assets | `displayCciNiceMenuFrontAssets` | Lets add-ons load scoped styles/scripts with a rendered menu. |
| Pro node rendering | `displayCciNiceMenuRenderNode` | Lets the encoded Pro package render Pro-only menu node types on the storefront. |

Complete module entrypoints and verification workflows are in
[Extension cookbook](./EXTENSION_COOKBOOK.md).

## Marketplace Feed

The Extensions panel reads the public catalog from
`/api/products/cci-nice-menu/plugin-feed/`. Release code uses the single
production API base `https://coolcatideas.com`. Local environments may override
only that base with `CCI_MARKETPLACE_API_BASE`; the product slug and endpoint
path remain fixed. Installed entries still come exclusively from
`displayCciNiceMenuAdminExtensions` and are reconciled with store products by
their stable catalog identity.

The module does not scan arbitrary folders. A local add-on appears under
**Installed extensions** only when it is installed, registered to
`displayCciNiceMenuAdminExtensions`, and returns valid `id` and `title`
metadata. A Hook node provider can work without that card. Theme overrides,
saved menus and presets never become extension cards. **Available in store** is
remote feed data, not local discovery.

## Menu Placement Hooks

The module installs and manages menus on:

- `displayTop`
- `displayNav1`
- `displayNav2`
- `displayNavFullWidth`

These hooks are reserved for the menu itself. They cannot be used as nested Hook
blocks because that would duplicate or recurse the main menu output.

## Hook Content Node

A hook node is saved in `tree_json` as a normal menu node:

```json
{
  "type": "hook",
  "label": "Search",
  "hook_name": "displaySearch",
  "children": []
}
```

The renderer executes:

```php
Hook::exec($hookName, [
    'cci_nice_menu_node' => $node,
    'cci_nice_menu_label' => $label,
]);
```

The output is wrapped in:

```html
<div class="cci-nice-menu-hook cci-nice-menu-hook-displaysearch" data-hook-name="displaySearch">
    ...
</div>
```

Valid nested hook names must match `/^[A-Za-z][A-Za-z0-9_]{0,63}$/` and must not
be one of the reserved menu placement hooks.

## Known Widget Fallbacks

Some PrestaShop modules implement `WidgetInterface` and can return an empty
string from `Hook::exec()` in custom menu locations. CCI Nice Menu has explicit
fallbacks for:

| Hook | Module | Fallback |
| --- | --- | --- |
| `displaySearch` | `ps_searchbar` | `Module::getInstanceByName('ps_searchbar')->renderWidget('displaySearch', ['cci_nice_menu' => true])` |
| `displayReassurance` | `blockreassurance` | `renderWidget('displayReassurance', ['cci_nice_menu' => true])`, then a database-backed reassurance fallback. |

Do not recreate these modules with manual menu links. Use a hook node so the
owning PrestaShop module remains the source of truth.

## Building A Compatible PrestaShop Module

An extension module that wants to render content inside the menu should:

1. Register a dedicated display hook.
2. Return escaped HTML from that hook.
3. Keep its own CSS scoped to the module output, not to CCI Nice Menu internals.
4. Avoid rendering `displayTop`, `displayNav1`, `displayNav2` or
   `displayNavFullWidth` inside the menu.

Example:

```php
public function install(): bool
{
    return parent::install()
        && $this->registerHook('displayMyMenuPromo');
}

public function hookDisplayMyMenuPromo(array $params): string
{
    $node = is_array($params['cci_nice_menu_node'] ?? null)
        ? $params['cci_nice_menu_node']
        : [];

    $this->context->smarty->assign([
        'title' => (string) ($node['label'] ?? $this->l('Promotion')),
    ]);

    return $this->fetch('module:' . $this->name . '/views/templates/hook/menu_promo.tpl');
}
```

The user can then add a Hook block and select `displayMyMenuPromo`.

A full module class, Smarty partial, CSS registration and installation workflow
are in [Extension cookbook](./EXTENSION_COOKBOOK.md#create-a-module-rendered-by-a-hook-node).

## Admin And Front Asset Payloads

`displayCciNiceMenuAdminAssets` receives `shop_id` and `module` and returns:

```php
[
    'scripts' => [[
        'src' => $this->getPathUri() . 'views/js/admin.js',
        'version' => '1.0.0',
    ]],
]
```

`displayCciNiceMenuFrontAssets` receives `hook_name`, `shop_id`, `menu` and
`module`. It returns `styles` entries as a URL or `{href, media}` and `scripts`
entries as a URL or `{src}`. Use local, scoped and idempotent assets.

## Admin Extension Metadata

`displayCciNiceMenuAdminExtensions` receives the current feature map and base
module name. Each entry supports `id`, `title`, `description`, `version`,
`author`, `url`, `screenshot`, `tags`, `requires` and `pro`. The base module
recalculates `locked` from feature requirements.


Use the add-on's own `$this->author` and `$this->version`, as shown in the hook reference. Both are displayed on the shared catalog card. They are not the base module's version or the version of a connected service. Keep the same stable `id` after updates so the installed card can match its store entry.

The metadata hook adds a card; it does not create a settings form, install the add-on or load its renderer. Keep configuration in your add-on's own Module Manager configuration page. Register its rendering and asset hooks separately. Theme overrides do not create an installed-extension entry.

After installation, open **Extensions → Installed extensions** and check the name, author and version. If the card is missing, confirm that the add-on is active in the current shop, that `install()` registered `displayCciNiceMenuAdminExtensions`, and that its callback returns an array with non-empty `id` and `title`. On an existing add-on, register a newly added hook in an upgrade script; editing `install()` alone does not update an already installed module. Do not uninstall an add-on just to register the hook if that would erase its settings.

## Data And Styling Rules

- Keep hook output self-contained. The menu wrapper only provides placement.
- Do not require users to type reserved CSS classes such as `cci-nice-menu-top-search`.
- Search should use `displaySearch`/`ps_searchbar` and inherit PrestaShop styling.
- Customer reassurance should use `displayReassurance`/`blockreassurance`.
- If a module needs assets, enqueue them from that module on the storefront.
- Do not depend on CCI Nice Menu runtime class names unless a public contract is
  added here.

## Free / Pro Capability Contract

The base module is the Free runtime and editor shell. Free can save the first
basic `displayTop` menu with standard navigation links. Pro features are guarded
server-side during save/import, so hiding a button in React is never the only
protection.

The separate `cci_nice_menu_pro` module registers
`displayCciNiceMenuFeatures`. It is the only trusted source allowed to unlock
the reserved core Pro feature keys. The Free module does not unlock those keys
from third-party hooks or from a plain license status flag.

The Pro module also owns runtime admin activation and Pro-only storefront node
rendering through `displayCciNiceMenuAdminAssets` and
`displayCciNiceMenuRenderNode`. Free may keep placeholders, locked UI and layout
containers, but Pro node HTML must come from the Pro package or an installed
add-on that is allowed by the encoded Pro core.

The renderer hook receives `node`, `context`, normalized `type` and base
`module`. A listener returns an HTML string or `['html' => $html]`; the first
non-empty result is used. The exact context and delegated type list are in
[Extension cookbook](./EXTENSION_COOKBOOK.md#understand-displayccinicemenurendernode).

Current Pro feature keys:

- `pro_menu_builder`
- `multiple_menus`
- `multiple_hooks`
- `showcase_blocks`
- `media_blocks`
- `commerce_blocks`
- `hook_blocks`
- `responsive_visibility`
- `import_export`
- `theme_presets`
- `extension_blocks`
- `multistore`

The `multistore` key is owned by core Pro. Extensions must not imitate it or
perform unauthenticated cross-shop writes. Use the documented admin action so
the source shop, target allowlist and license gate are applied consistently.

## Internal Pro Extension Unit Format

Bundled Pro behavior must not be added directly to `cci_nice_menu_pro.php`.
The Pro entrypoint stays small and encoded: license activation, public keys,
capability checks, admin asset hook registration and registry bootstrap only.

Use one file per feature renderer:

```text
cci_nice_menu_pro/
  cci_nice_menu_pro.php
  src/Extension/
    CciNiceMenuProFeatureRegistry.php
    CciNiceMenuProNodeRegistry.php
    CciNiceMenuProNodeRendererInterface.php
    CciNiceMenuProMediaNodeRenderer.php
    CciNiceMenuProCommerceNodeRenderer.php
```

For a new Pro node type:

1. Create `src/Extension/CciNiceMenuProMyNodeRenderer.php`.
2. Implement `CciNiceMenuProNodeRendererInterface::render(array $node, array $context): string`.
3. Register the node type in `CciNiceMenuProNodeRegistry`.
4. Map the node `type` to a feature in `CciNiceMenuProFeatureRegistry::featureForNodeType()`.
5. Add feature metadata to `featureDefinitions()` if this is a new capability.
6. Keep all output escaping and payload normalization in the renderer or a small
   helper class owned by that feature.

The renderer files may remain plain in the Pro source package so future paid
blocks are easy to review and copy. They still cannot unlock paid behavior by
themselves because `CciNiceMenuProNodeRegistry::render()` calls the encoded Pro
capability gate before a renderer is executed.

An add-on may also return its own feature definitions from
`displayCciNiceMenuFeatures`:

```php
public function hookDisplayCciNiceMenuFeatures(array $params): array
{
    return [[
        'key' => 'my_menu_block',
        'label' => $this->l('My menu block'),
        'description' => $this->l('Adds a custom premium menu block.'),
        'enabled' => true,
        'source' => $this->name,
        'plan' => 'pro',
        'requiresPro' => true,
    ]];
}
```

Installed add-ons shown in the Extensions panel should be returned from
`displayCciNiceMenuAdminExtensions`. Do not list built-in presets/templates as
installed extensions.

Do not reuse or override reserved core Pro keys from an add-on. Paid add-ons
must use their own namespaced feature key and set `plan => 'pro'` or
`requiresPro => true`. The base module will keep that feature disabled until
the encoded `cci_nice_menu_pro` core is installed and active on the shop.

Do not make remote license calls during storefront rendering. Frontend output
must depend only on saved menu data and locally installed modules.
