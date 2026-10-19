# CCI Nice Menu PHP integration

Use a theme override for markup and a Pro Hook node for external module output.
There is no supported API for subclassing the menu repository, replacing its
save methods, registering arbitrary node types or replacing license decisions.
Constructors, installation routines and authenticated admin/media handlers are
internal; they are not customer customization methods.

## Render a configured placement

The module implements hookDisplayTop(array $params), hookDisplayNav1(array $params),
hookDisplayNav2(array $params) and hookDisplayNavFullWidth(array $params).
PrestaShop calls these adapters. They return the current shop's active menu as
HTML, or an empty string when no eligible menu exists. Additional placements
require the corresponding Pro capabilities and a theme that renders the hook.

Prefer the native theme call rather than invoking a module method directly:

```smarty
{hook h='displayTop' mod='cci_nice_menu'}
```

Insert it only when the theme does not already render this menu at that position.
Do not duplicate it beside an existing displayTop call. Save the menu with the
same position, clear cache and test desktop/mobile navigation.

From another module in an initialized PrestaShop frontend context:

```php
$menu = Module::getInstanceByName('cci_nice_menu');
$html = '';
if ($menu && $menu->active) {
    $html = (string) Hook::exec('displayTop', [], (int) $menu->id);
}
// Return $html from your display hook. Do not escape the entire prepared markup.
```

Here Hook::exec receives the placement name, a parameters array and the module
ID to restrict execution. The module selects the current shop's saved menu.
The result includes its navigation wrapper and may include extension assets.
Use this once per intended placement, not inside a loop for each menu item.

## Provide content inside a menu

Implement a display hook in your own module. Register it in install(), return
escaped Smarty output and choose it in a Pro Hook node. The callback receives
cci_nice_menu_node (the saved node array) and cci_nice_menu_label (string).
Returning an empty string renders no external content. The complete installable
module is in [Developer guide](DEVELOPER.md#create-an-installable-menu-extension).

## Add styles or register extension metadata

Use displayCciNiceMenuFrontAssets for scoped asset descriptors and
 displayCciNiceMenuAdminExtensions for an Installed extensions card. Neither
registers a new node type. Exact arguments, return values and examples are in
[Hooks reference](HOOKS_REFERENCE.md). Changing data in the repository directly
bypasses the normal validation and is not a supported customization path.
