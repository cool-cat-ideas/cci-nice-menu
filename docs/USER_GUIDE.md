# CCI Nice Menu User Guide

Start with one short menu. Add richer dropdown content after the basic links
work on desktop and mobile.

## Requirements

- PrestaShop 9.0.0-9.1.5.
- PHP version supported by the target PrestaShop installation.
- PrestaShop Search Bar enabled when you want native search in the top menu.
- PrestaShop reassurance module enabled when you want native reassurance links
  in dropdowns.

## Installation

Download the module ZIP from the [Cool Cat Ideas product page](https://coolcatideas.com/products/cci-nice-menu/).

1. Make a backup of the shop files and database.
2. Open **Modules > Module Manager > Upload a module**.
3. Upload the CCI Nice Menu ZIP and wait for the installation confirmation.
4. Open **Improve > Cool Cat Ideas > CCI Nice Menu**.
5. Clear the PrestaShop cache.

If CCI Nice Menu Pro is installed and enabled, its license controls appear in
the sidebar. A shop with only the base module does not need a key and should not
show a license form.

The base module installs one active menu in the top header when the shop does
not already have a CCI Nice Menu configuration.

## Build The First Menu

1. Open **Menus**.
2. Edit the menu created during installation or create a new menu.
3. Give it a clear internal name and keep it active.
4. In **Menu settings**, choose `displayTop` for the first test.
5. In **Header navigation bar**, add two or three top-level links.
6. Save and open the storefront in a private browser window.
7. Check the links on desktop and mobile.
8. Return to **Storefront dropdown editor** and add rows, columns and blocks
   only after the top-level menu works.

If the saved menu is not visible, open **Design > Positions** and check that
CCI Nice Menu is attached to `displayTop`. Then confirm that the theme renders
that hook and clear the PrestaShop cache.

With CCI Nice Menu Pro, use **Choose local image** beside image, banner, map
fallback and video poster URL fields. The picker lists existing images from
approved PrestaShop and module directories. You can still paste an external
HTTP(S) URL. The picker does not upload or modify files.

Add existing PrestaShop content through the **Hook** block and choose the
available source from the editor. For search, select the Search Bar entry. Do
not recreate it with manual HTML or custom classes.

## Demo Data

The module includes a default retail showcase. It is loaded during installation
only when no menu exists for the current shop. Existing menus are not
overwritten.

To load the showcase into an existing local shop:

1. Back up the current menu through **Import / Export > Export menu**.
2. Import a showcase file supplied by support or create a new menu from the
   available blocks.
3. Save and verify on the storefront.

## Domain Setup

CCI Nice Menu does not connect domains. Domain routing belongs to PrestaShop,
the web server, SSL and DNS.

Before going live:

1. Point DNS to the production host.
2. Configure the PrestaShop shop URL in **Shop Parameters > Traffic & SEO**.
3. Enable SSL for the domain.
4. Clear PrestaShop cache.
5. Open the pages where the menu hook renders.
6. Check that manual menu links, banner links and hook output do not still point
   to a staging domain.

## Pro License

The license panel appears only when CCI Nice Menu Pro is installed, enabled and
active. Use it to:

- activate a license key,
- check license status,
- deactivate the current activation.

If a Pro feature is locked, the admin shows a Pro badge and an upgrade modal.
If you already own a license, activate it in the same sidebar panel.

## Support

When requesting support, include:

- product name and version,
- PrestaShop version,
- PHP version,
- shop domain and whether it is production or staging,
- whether CCI Nice Menu Pro is installed,
- screenshots of the admin view and storefront issue,
- exported menu JSON from **Import / Export**,
- browser console errors, if any.

Product page:

```text
https://coolcatideas.com/products/cci-nice-menu
```

Support entry point:

```text
https://coolcatideas.com/support
```

## Menu settings: what to change and how to check it

Open the menu in the visual editor and expand its layout/settings controls.
The settings below affect the selected menu, not every menu in the shop.

| Field | Effect | Practical check |
| --- | --- | --- |
| Container mode | Boxed content or a full-width menu container | Match the header area provided by the theme. It cannot create a missing hook. |
| Container width | Width limit in pixels for a boxed menu | Start with the theme content width; 1320 is the module default. |
| Item gap | Spacing between top-level entries, in pixels | Default 8. Increase only while the last item still fits before the mobile breakpoint. |
| Mobile breakpoint | Viewport width where mobile navigation takes over | Default 900 px; server range 600–1400. Test immediately above and below the selected value. |
| Top-level icons | First item only, all items or no icons | This affects top-level navigation, not product images in dropdowns. |
| Animation | Dropdown transition style | Check opening and closing on desktop and mobile. |
| Theme and colors | Menu palette and saved color values | Prefer these controls for colors rather than overriding generated inline variables with CSS. Some presets require Pro. |
| Per-device visibility | Hides selected content on a device class | Requires Pro. Keep a usable route to the same destination on mobile. |

For a first menu, keep one placement, the default breakpoint and a short first
level. Add one dropdown row containing two columns, then put destination links
inside each column. Save and confirm that the hierarchy and all links work.
Only then add images, tabs or product panels.

Use **Link or label** for navigation behavior. An empty destination should be a
group heading, not a fake link to the top of the page. If a saved change appears
only in the editor, clear PrestaShop/theme caches and confirm the active shop.

### Editing the menu layout

The header bar and dropdown editors fill the available workspace. Column labels such as **9/12** show their share of the row. On a smaller desktop or a phone, scroll inside the editor to reach the remaining columns. This does not change their widths in the shop. Use **Container width** in the menu settings to change the storefront width.
