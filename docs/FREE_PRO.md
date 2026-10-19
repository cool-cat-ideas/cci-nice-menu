# CCI Nice Menu Free / Pro Feature Matrix

Use this table as the source copy for product pages and comparison blocks. It
describes shipped capabilities for the 1.0.0 release line.

| Feature | Free | Pro |
| --- | --- | --- |
| React admin workspace | Yes | Yes |
| One storefront menu definition | Yes | Yes |
| Multiple menu definitions | No | Yes |
| `displayTop` placement | Yes | Yes |
| Additional menu hooks | No | Yes |
| Standard navigation links: custom, CMS, category and product | Yes | Yes |
| Rows, columns and grouping blocks with standard links | Yes | Yes |
| Dynamic category-tree block | Yes | Yes |
| Special showcase, card and list variants | No | Yes |
| Banner, image, map and video blocks | No | Yes |
| Read-only local image library for menu images, banners, fallbacks and posters | No | Yes |
| Standard product link with the current image, name and price | Yes | Yes |
| Product tile and special product grid/list variants | No | Yes |
| Blog category list from CCI Blog | Yes, when CCI Blog is installed | Yes, when CCI Blog is installed |
| Blog post, list, carousel and popular-post blocks from CCI Blog | No | Yes, when CCI Blog is installed |
| Native PrestaShop hook blocks | No | Yes |
| Responsive visibility controls for desktop/tablet/mobile | No | Yes |
| JSON export and loading for one standard menu | Yes | Yes |
| Importing configurations that contain Pro-only features | No | Yes |
| Base appearance presets | Yes | Yes |
| Additional theme and appearance presets | No | Yes |
| Owl Carousel asset source control | Yes for supported carousel output | Yes |
| Server-side feature enforcement during save/import | Yes | Yes |
| PrestaShop Multistore menu copy | No | Yes |

## Pro Capability Keys

`cci_nice_menu_pro` registers these feature keys:

- `pro_menu_builder`
- `multiple_menus`
- `multiple_hooks`
- `showcase_blocks`
- `media_blocks`
- `local_media_library`
- `commerce_blocks`
- `hook_blocks`
- `responsive_visibility`
- `import_export`
- `theme_presets`
- `extension_blocks`
- `multistore`

Built-in presets and bundled blocks are part of the base module package and
should not be shown as installed extensions. The Extensions panel should list
only modules that register themselves through
`displayCciNiceMenuAdminExtensions`.

Reserved Pro keys are unlocked only by the separate `cci_nice_menu_pro` module.
The Free module may show locked controls and read add-on metadata, but it must
not ship authoritative Pro implementations or accept a third-party add-on as
the source for reserved Pro capability keys. Paid add-ons remain unusable
without the encoded core Pro layer. Pro-only storefront node HTML is rendered
through the Pro hook layer, not by the Free module.
