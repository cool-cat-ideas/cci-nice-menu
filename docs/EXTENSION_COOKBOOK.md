# CCI Nice Menu extension cookbook

This guide covers installable PrestaShop hook integrations, extension metadata,
assets and safe storefront overrides implemented in CCI Nice Menu 1.0.0.

## Choose the correct extension surface

- Use a theme stylesheet to restyle documented `.cci-nice-menu-*` components.
- Override `desktop-nav.tpl` only when the outer navigation mount must change.
- Use a Hook node to place another module's display hook in the menu.
- Use admin/front asset hooks when a Nice Menu add-on owns supporting assets.
- Use feature hooks only for capabilities supplied by a real installed module.

The current builder does not expose a third-party arbitrary node-type registry.
Do not document or save an unknown `type` and expect it to render.

## Override the outer Smarty template

### 1. Copy the shipped template

```text
modules/cci_nice_menu/views/templates/hook/desktop-nav.tpl
```

to:

```text
themes/{your-theme}/modules/cci_nice_menu/views/templates/hook/desktop-nav.tpl
```

### 2. Preserve runtime mount points

Keep `$navId`, `$mobileMenuId`, breakpoint variables, `$menuStyle` and
`$menuMarkup nofilter`. The PHP renderer has already escaped individual menu
values; `menuMarkup` must not be escaped again.

### 3. Clear cache and test placements

Clear PrestaShop cache and test every enabled placement, desktop/mobile
breakpoints, keyboard navigation and open/close behavior.

## Create a module rendered by a Hook node

### 1. Create the module

```text
modules/my_menu_promo/
  my_menu_promo.php
  views/templates/hook/menu_promo.tpl
  views/css/front.css
```

```php
<?php
declare(strict_types=1);

if (!defined('_PS_VERSION_')) {
    exit;
}

class My_Menu_Promo extends Module
{
    public function __construct()
    {
        $this->name = 'my_menu_promo';
        $this->tab = 'front_office_features';
        $this->version = '1.0.0';
        $this->author = 'My Company';
        $this->bootstrap = true;
        parent::__construct();
        $this->displayName = $this->l('My Menu Promo');
        $this->description = $this->l('Adds a campaign panel to CCI Nice Menu.');
    }

    public function install(): bool
    {
        return parent::install()
            && $this->registerHook('displayMyCompanyMenuPromo')
            && $this->registerHook('displayCciNiceMenuAdminExtensions')
            && $this->registerHook('actionFrontControllerSetMedia');
    }

    public function hookDisplayCciNiceMenuAdminExtensions(array $params): array
    {
        unset($params);

        return [[
            'id' => $this->name,
            'title' => $this->displayName,
            'description' => $this->description,
            'version' => $this->version,
            'author' => $this->author,
            'requires' => ['hook_blocks'],
            'pro' => true,
            'tags' => ['hook block', 'campaign'],
        ]];
    }

    public function hookDisplayMyCompanyMenuPromo(array $params): string
    {
        $node = is_array($params['cci_nice_menu_node'] ?? null)
            ? $params['cci_nice_menu_node']
            : [];

        $this->context->smarty->assign([
            'title' => (string) ($params['cci_nice_menu_label'] ?? $this->l('Promotion')),
            'description' => (string) ($node['description'] ?? ''),
            'url' => (string) ($node['link'] ?? ''),
        ]);

        return $this->fetch('module:' . $this->name . '/views/templates/hook/menu_promo.tpl');
    }

    public function hookActionFrontControllerSetMedia(array $params): void
    {
        unset($params);
        $this->context->controller->registerStylesheet(
            'my-menu-promo-front',
            'modules/' . $this->name . '/views/css/front.css',
            ['priority' => 200]
        );
    }
}
```

### 2. Render escaped Smarty output

```smarty
<section class="my-menu-promo">
  <h3>{$title|escape:'htmlall':'UTF-8'}</h3>
  {if $description}<p>{$description|escape:'htmlall':'UTF-8'}</p>{/if}
  <a href="{$url|escape:'htmlall':'UTF-8'}">{l s='View offer' mod='my_menu_promo'}</a>
</section>
```

### 3. Add the node in CCI Nice Menu

Add a **Hook** node and select `displayMyCompanyMenuPromo`. CCI Nice Menu calls
the hook with `cci_nice_menu_node` and `cci_nice_menu_label` and wraps returned
HTML in `.cci-nice-menu-hook`.

Do not nest `displayTop`, `displayNav1`, `displayNav2` or
`displayNavFullWidth`; those placements can recurse the entire menu.

The `displayCciNiceMenuAdminExtensions` metadata makes this installed module
visible in **Extensions > Installed extensions**. The Hook node works without
that metadata, but then the module has no catalog card.

## Understand Installed extensions and Available in store

- **Installed extensions** contains metadata returned by installed modules via
  `displayCciNiceMenuAdminExtensions`.
- A module that only provides a display hook remains usable by a Hook node but
  is not inferred as an extension card.
- A theme override, imported menu JSON, built-in preset or saved menu is not an
  extension and does not appear in this list.
- **Available in store** comes only from the remote marketplace feed. A local
  ZIP is never published there automatically.
- A stable matching `id` lets the UI mark a store product as installed.

## Load add-on assets through Nice Menu

Use these hooks when assets are only required with the menu and belong to a
Nice Menu add-on.

```php
public function install(): bool
{
    return parent::install()
        && $this->registerHook('displayCciNiceMenuAdminAssets')
        && $this->registerHook('displayCciNiceMenuFrontAssets');
}

public function hookDisplayCciNiceMenuAdminAssets(array $params): array
{
    unset($params);
    $file = $this->getLocalPath() . 'views/js/admin.js';

    return [
        'scripts' => [[
            'src' => $this->getPathUri() . 'views/js/admin.js',
            'version' => (string) (@filemtime($file) ?: $this->version),
        ]],
    ];
}

public function hookDisplayCciNiceMenuFrontAssets(array $params): array
{
    $menu = is_array($params['menu'] ?? null) ? $params['menu'] : [];
    if (empty($menu)) {
        return [];
    }

    return [
        'styles' => [[
            'href' => $this->getPathUri() . 'views/css/nice-menu.css',
            'media' => 'all',
        ]],
        'scripts' => [[
            'src' => $this->getPathUri() . 'views/js/nice-menu.js',
        ]],
    ];
}
```

Admin assets receive `shop_id` and `module`. Front assets receive `hook_name`,
`shop_id`, the normalized `menu` and `module`. Return local URLs, keep scripts
idempotent and scope CSS.

## List an installed add-on in Extensions

```php
public function hookDisplayCciNiceMenuAdminExtensions(array $params): array
{
    return [[
        'id' => $this->name,
        'title' => $this->displayName,
        'description' => $this->description,
        'version' => $this->version,
        'author' => $this->author,
        'url' => 'https://example.com/my-menu-promo',
        'requires' => ['hook_blocks'],
        'pro' => true,
        'tags' => [$this->l('Hook block')],
    ]];
}
```

Register `displayCciNiceMenuAdminExtensions` during install. The base module
calculates whether requirements are enabled. Store products and built-in
presets are not installed extensions.

## Add a feature key

```php
public function hookDisplayCciNiceMenuFeatures(array $params): array
{
    return [[
        'key' => 'my_company_menu_promo',
        'label' => $this->l('Campaign menu block'),
        'description' => $this->l('Adds a campaign panel to menu hooks.'),
        'enabled' => true,
        'source' => $this->name,
        'plan' => 'pro',
        'requiresPro' => true,
    ]];
}
```

Use a namespaced key. Third-party modules cannot override reserved core Pro
keys. Paid keys remain disabled until the encoded Pro core is active and the
shop license allows them.

## Understand `displayCciNiceMenuRenderNode`

The Free renderer delegates only these implemented types:

```text
product_tile
blog_post
blog_list
blog_carousel
blog_popular
banner
video
image
map
hook
```

The hook receives:

```php
[
    'node' => $savedNode,
    'context' => [
        'type' => 'blog_carousel',
        'label' => 'Latest articles',
        'link' => '#',
        'target' => '',
        'icon_markup' => '',
        'parent_layout_role' => '',
        'parent_system_role' => '',
        'level' => 1,
    ],
    'type' => 'blog_carousel',
    'module' => 'cci_nice_menu',
]
```

A listener may return a string or `['html' => $html]`; the first non-empty
result is used. This is primarily the Pro renderer boundary. It is not a
general builder registry, and an add-on must not replace another module's
implemented node type without an explicit compatibility agreement.

## Override the CCI Blog carousel in the menu

Prefer a theme stylesheet for visual-only changes. The root ID is deterministic:
`cci-nice-menu-mobile-menu-` plus the normalized lower-case placement hook. For
`displayTop` it is `cci-nice-menu-mobile-menu-displaytop`.

```css
#cci-nice-menu-mobile-menu-displaytop.cci-nice-menu-root .cci-nice-menu-blog-collection-carousel .cci-nice-menu-blog-card {
  border: 1px solid #dfe4ea;
  border-radius: 12px;
  background: #fff;
}

#cci-nice-menu-mobile-menu-displaytop.cci-nice-menu-root .cci-nice-menu-blog-card-title {
  white-space: normal;
  font-size: 0.95rem;
  line-height: 1.3;
}

#cci-nice-menu-mobile-menu-displaytop.cci-nice-menu-root .cci-nice-menu-blog-collection-carousel.owl-carousel .owl-nav button {
  width: 36px;
  height: 36px;
}
```

Use the corresponding root ID for another placement, for example
`#cci-nice-menu-mobile-menu-displaynav1`. Do not style the carousel in CCI Blog's
module CSS: Nice Menu Pro owns its HTML and runtime. The complete
class/state reference is in
[Templates and styling](./TEMPLATES_AND_STYLING.md#cci-blog-carousel-inside-nice-menu).

## Verification checklist

1. Reinstall/reset after changing registered hooks.
2. Confirm the Hook node appears and its output is not recursive.
3. Test every enabled placement and both breakpoint modes.
4. Check that returned asset URLs load once and without request failures.
5. Verify extension metadata represents a real installed module.
6. Test carousel layout before Owl loads, after ready and when Owl is unavailable.
7. Clear cache and inspect the live storefront, not only the builder preview.
