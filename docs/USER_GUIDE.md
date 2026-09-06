# CCI Nice Menu User Guide

Start with one short menu. Add richer dropdown content after the basic links
work on desktop and mobile.

## Requirements

- PrestaShop 9.1-9.1.5.
- PHP version supported by the target PrestaShop installation.
- PrestaShop Search Bar enabled when you want native search in the top menu.
- PrestaShop reassurance module enabled when you want native reassurance links
  in dropdowns.

## Installation

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
