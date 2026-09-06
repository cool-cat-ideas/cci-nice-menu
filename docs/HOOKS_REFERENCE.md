# CCI Nice Menu hooks reference

This page lists the public PrestaShop hooks implemented or consumed by CCI Nice Menu 1.0.0. Build integrations as separate modules and register every implemented hook during that module's `install()`.

Contribution hooks are executed with PrestaShop's array-return mode. A module may return one descriptor or a list; CCI Nice Menu normalizes contributions and applies the Pro license gate to reserved capabilities.

## Start with the right extension path

| Goal | Extension surface | Guide |
| --- | --- | --- |
| Menu markup | PrestaShop theme override | [Templates and styling](./TEMPLATES_AND_STYLING.md) |
| Menu styling | Theme CSS scoped to `.cci-nice-menu-*` | [Templates and styling](./TEMPLATES_AND_STYLING.md) |
| Existing module output | Hook node backed by a real display hook | [Extension cookbook](./EXTENSION_COOKBOOK.md) |
| Installable integration | Separate PrestaShop extension module | [Extension cookbook](./EXTENSION_COOKBOOK.md) |
| Custom node HTML | Delegated renderer for a supported node type | Continue with this document |

A theme override changes presentation. A Hook node embeds output owned by
another module. A custom node renderer requires a node type supported by the
builder and saved-data contract.

## Choose hooks by the workflow they complete

| Workflow | Public hooks | Result |
| --- | --- | --- |
| Declare a capability | `displayCciNiceMenuFeatures` | Namespaced feature descriptor |
| Show an installed extension | `displayCciNiceMenuAdminExtensions` | Installed-extension metadata |
| Load admin JavaScript | `displayCciNiceMenuAdminAssets` | Scripts for the React workspace |
| Load storefront assets | `displayCciNiceMenuFrontAssets` | Deduplicated CSS or JavaScript |
| Render a delegated node | `displayCciNiceMenuRenderNode` | Scoped HTML for one supported node type |
| Render an existing module | Selected PrestaShop `display*` hook | HTML supplied to a Hook node |

## Feature contributions

### `displayCciNiceMenuFeatures`

Use this hook to contribute a namespaced capability.

- **Parameters:** `$params['features']` (`array<string,array>`) contains current features; `$params['license']` (`array`) is the public license state; `$params['module']` (`string`) is `cci_nice_menu`.
- **Returns:** a feature descriptor or list. Each needs `key`; optional fields include `label`, `description`, `enabled`, `source`, `requires`, `plan` and `requiresPro`.
- **Side effects/HTML:** none. Add-ons cannot unlock reserved core Pro keys.

```php
public function hookDisplayCciNiceMenuFeatures(array $params): array
{
    return [[
        'key' => 'acme_menu_promo',
        'label' => 'Acme menu promo',
        'enabled' => true,
        'source' => $this->name,
        'requires' => ['hook_blocks'],
    ]];
}
```

## Installed extension metadata

### `displayCciNiceMenuAdminExtensions`

Use this hook to list a genuinely installed menu extension.

- **Parameters:** `$params['features']` (`array<string,array>`) is the normalized feature map; `$params['module']` (`string`) is `cci_nice_menu`.
- **Returns:** a descriptor or list with `id`, `title`, and optional `description`, `version`, `author`, `url`, `requires`, `pro` and `tags`.
- **Side effects/HTML:** none. Locked state is recalculated from `requires`.

```php
public function hookDisplayCciNiceMenuAdminExtensions(array $params): array
{
    return [[
        'id' => $this->name,
        'title' => $this->displayName,
        'version' => $this->version,
        'author' => $this->author,
        'requires' => ['acme_menu_promo'],
    ]];
}
```

## Admin assets

### `displayCciNiceMenuAdminAssets`

Use this hook to load extension JavaScript in the CCI Nice Menu React workspace.

- **Parameters:** `$params['shop_id']` (`int`) is the active shop; `$params['module']` (`string`) is `cci_nice_menu`.
- **Returns:** `['scripts' => [['src' => string, 'version' => string], ...]]`.
- **Side effects/HTML:** accepted scripts are loaded by the admin controller. The current contract does not consume a styles list.

```php
public function hookDisplayCciNiceMenuAdminAssets(array $params): array
{
    return ['scripts' => [[
        'src' => $this->getPathUri() . 'views/js/admin-extension.js',
        'version' => $this->version,
    ]]];
}
```

## Frontend assets

### `displayCciNiceMenuFrontAssets`

Use this hook when a rendered extension node needs scoped CSS or JavaScript.

- **Parameters:** `$params['hook_name']` (`string`) is the current placement; `$params['shop_id']` (`int`) is the active shop; `$params['menu']` (`array`) is the decoded active menu; `$params['module']` (`string`) is `cci_nice_menu`.
- **Returns:** `['styles' => [...], 'scripts' => [...]]`. A style may be a URL string or `['href' => string, 'media' => string]`; a script may be a URL string or `['src' => string]`.
- **Side effects:** CCI Nice Menu renders unique `<link>` and `<script>` tags with the menu output.

```php
public function hookDisplayCciNiceMenuFrontAssets(array $params): array
{
    return [
        'styles' => [[
            'href' => $this->getPathUri() . 'views/css/menu-promo.css',
            'media' => 'all',
        ]],
        'scripts' => [[
            'src' => $this->getPathUri() . 'views/js/menu-promo.js',
        ]],
    ];
}
```

## Pro/delegated node rendering

### `displayCciNiceMenuRenderNode`

Use this hook to render a delegated Pro or extension node supported by the builder.

- **Parameters:** `$params['node']` (`array`) is the saved node; `$params['context']` (`array`) contains normalized render context such as type, label and layout; `$params['type']` (`string`) is the sanitized node type; `$params['module']` (`string`) is `cci_nice_menu`.
- **Returns:** HTML as `string` or `['html' => string]`. The first non-empty contribution is used.
- **Side effects:** returned HTML is inserted inside the menu. Escape data and scope all owned CSS to the extension root.

```php
public function hookDisplayCciNiceMenuRenderNode(array $params): string
{
    if (($params['type'] ?? '') !== 'acme_promo') {
        return '';
    }

    $node = is_array($params['node'] ?? null) ? $params['node'] : [];
    $this->context->smarty->assign('node', $node);

    return $this->fetch('module:' . $this->name . '/views/templates/hook/menu_promo.tpl');
}
```

## Hook nodes

A saved Hook node executes the selected PrestaShop display hook.

- **Parameters:** `$params['cci_nice_menu_node']` (`array`) is the complete saved node; `$params['cci_nice_menu_label']` (`string`) is its normalized label.
- **Returns:** storefront HTML as `string`.
- **Side effects:** output is wrapped in `.cci-nice-menu-hook` with a `data-hook-name` attribute.

```php
public function hookDisplayAcmeMenuPromo(array $params): string
{
    $this->context->smarty->assign([
        'node' => (array) ($params['cci_nice_menu_node'] ?? []),
        'label' => (string) ($params['cci_nice_menu_label'] ?? ''),
    ]);

    return $this->fetch('module:' . $this->name . '/views/templates/hook/menu_promo.tpl');
}
```

For `displaySearch`, CCI Nice Menu can fall back to `ps_searchbar::renderWidget()`. For `displayReassurance`, it can fall back to `blockreassurance::renderWidget()` and then to the module's stored reassurance data. Other empty hooks stay empty.

## Storefront placement hooks

CCI Nice Menu implements these standard placements:

- `displayTop`
- `displayNav1`
- `displayNav2`
- `displayNavFullWidth`
- any valid configured dynamic `display*` placement handled by the module adapter

Each receives the standard PrestaShop hook parameter array and returns the complete active menu HTML or `''` when no active menu matches the current shop/hook. The outer template is `views/templates/hook/desktop-nav.tpl`.

```php
public function hookDisplayTop(array $params): string
{
    return $this->renderWidget('displayTop', $params);
}
```

A theme must execute the chosen hook. Registering a menu on a hook that the active theme never renders cannot display it.

## Standard asset actions

- `actionAdminControllerSetMedia` receives the standard controller payload and returns `void`; CCI Nice Menu registers its own admin assets.
- `actionFrontControllerSetMedia` receives the standard controller payload and returns `void`; the base and Pro modules register runtime assets when needed.

An extension should implement the corresponding action in its own module instead of modifying core asset methods.

For public PHP methods and their arguments, see [PHP API](api-reference). For a complete installable extension and theme overrides, see [Developer guide](developer-guide).
