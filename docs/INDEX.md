# CCI Nice Menu Documentation

Use CCI Nice Menu to help customers move from the shop header to the right
category, product, page or guide. Start with
[Build the first menu](./USER_GUIDE.md#build-the-first-menu). The same guide
shows what to check when a menu is saved but does not appear in the shop.

Release ZIP packages exclude this `docs/` directory. Marketplace README files
must stay limited to product description and changelog content.

## Start Here

| Document | Use it for |
| --- | --- |
| [User guide](./USER_GUIDE.md) | Install the module, build the first menu, place it in the theme and fix common visibility problems. |
| [Developer guide](./DEVELOPER.md) | Directory structure, public PHP methods, admin/API flow, saved JSON and build workflow. |
| [Hooks reference](./HOOKS_REFERENCE.md) | Public PrestaShop hooks with parameters, return contracts, side effects and working examples. |
| [Templates and styling](./TEMPLATES_AND_STYLING.md) | Smarty overrides, CSS files, public classes, variables and safe styling rules. |
| [Extension contract](./EXTENSIONS.md) | Hooks, Pro feature keys, module hook blocks and custom add-ons. |
| [Extension cookbook](./EXTENSION_COOKBOOK.md) | Step-by-step hook modules, add-on assets, feature metadata and storefront overrides. |
| [Free/Pro matrix](./FREE_PRO.md) | Feature split for pricing tables and product pages. |
| [Multistore (Pro)](./MULTISTORE.md) | Shop-specific menus, cross-shop copy and license rules. |
| [Local image library (Pro)](./LOCAL_MEDIA_LIBRARY.md) | Safely select existing PrestaShop images without typing URLs. |
| [Release 1.0.0](./RELEASE_1.0.0.md) | Packaging checklist and release archive rules. |

## Product Scope

`cci_nice_menu` is the Free base module. It owns installation, menu storage,
the React admin shell, storefront rendering and safe hook execution.

`cci_nice_menu_pro` is a separate Pro layer. It owns reserved Pro feature
unlocking and Pro-only renderers. Add-ons should depend on the base module and,
when they expose paid behavior, the Pro layer.

## Documentation Rules

- Document shipped behavior only. Do not claim features that are not present in
  the current module.
- Any new menu node type needs docs in `EXTENSIONS.md`,
  `TEMPLATES_AND_STYLING.md` and the Free/Pro matrix.
- Any new public CSS class or CSS variable needs an entry in
  `TEMPLATES_AND_STYLING.md`.
- Any new public PHP method, hook, endpoint or saved JSON field needs an entry
  in `DEVELOPER.md`.
- Any new or changed public hook also needs an entry in `HOOKS_REFERENCE.md`
  with exact parameters, return semantics and a working example.
- Built-in presets are not installed extensions. The Extensions screen should
  list only modules that register themselves through the extension hooks.
