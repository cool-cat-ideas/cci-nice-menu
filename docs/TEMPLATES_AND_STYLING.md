# CCI Nice Menu Templates And Styling

## CSS Class Convention

CCI Nice Menu owns the `cci-nice-menu-` namespace. New module and theme-override
classes use lowercase ASCII letters, digits and single hyphens, for example
`cci-nice-menu-banner-cta` or `cci-nice-menu-item-state-active`. Do not add the
legacy `ccinm-` prefix, underscores, BEM separators or standalone state classes
such as `is-open`. PrestaShop, theme and third-party classes remain unchanged.

## Smarty Templates

Storefront output is mounted through:

```text
views/templates/hook/desktop-nav.tpl
```

To override it in a theme, copy the file to:

```text
themes/{your-theme}/modules/cci_nice_menu/views/templates/hook/desktop-nav.tpl
```

Keep these variables and output points unless you intentionally replace the
whole frontend runtime:

- `$navId`
- `$mobileMenuId`
- `$desktopBreakpoint`
- `$mobileBreakpoint`
- `$menuHook`
- `$menuName`
- `$menuOpenOn`
- `$menuLayoutClass`
- `$menuStyle`
- `$menuMarkup nofilter`

Do not edit generated module files in `views/templates` directly in production.
Use a theme override or a child theme override.

## CSS Files

| File | Purpose |
| --- | --- |
| `views/css/cci_nice_menu_front.css` | Base storefront CSS shipped with the module. |
| `views/css/cci_nice_menu_front_runtime.css` | Active runtime component styles for menu blocks, banners, carousels, category browser and mobile behavior. |
| `src/admin-v2/styles/admin.css` | Source admin CSS. |
| `views/css/cci_nice_menu_admin.css` | Generated admin CSS after `npm run build:admin`. |

Do not patch `views/css/cci_nice_menu_admin.css` by hand. Change
`src/admin-v2/styles/admin.css` or React component classes, then rebuild.

## Public Storefront Classes

These classes are part of the current storefront styling contract:

| Class | Meaning |
| --- | --- |
| `.cci-nice-menu-nav` | Outer `<nav>` wrapper for one hook placement. |
| `.cci-nice-menu-root` | Root menu container with layout and breakpoint variables. |
| `.cci-nice-menu-mobile-toggle` | Mobile hamburger/toggle button. |
| `.cci-nice-menu-list` | Menu list at any level. |
| `.cci-nice-menu-level-0` | Top navigation list. |
| `.cci-nice-menu-item` | A menu item. |
| `.cci-nice-menu-link` | Clickable menu link. |
| `.cci-nice-menu-label` | Visible menu label. |
| `.cci-nice-menu-description` | Optional description text. |
| `.cci-nice-menu-icon` | Icon span rendered from the selected icon library. |
| `.cci-nice-menu-toggle` | Button used to open a submenu where the node supports it. |
| `.cci-nice-menu-submenu` | Dropdown/panel content. |
| `.cci-nice-menu-row` | Row layout node. |
| `.cci-nice-menu-column` | Column layout node. |
| `.cci-nice-menu-block` | Functional block wrapper. |
| `.cci-nice-menu-block-heading` | Shared heading surface for menu blocks. |
| `.cci-nice-menu-block-heading-action` | Optional heading action link. |
| `.cci-nice-menu-banner-cta` | CTA inside banner blocks. |
| `.cci-nice-menu-video-cta` | CTA inside video blocks. |
| `.cci-nice-menu-badge` | Generic small badge. |
| `.cci-nice-menu-count` | Count badge, for example product or post counts. |
| `.cci-nice-menu-hook` | Wrapper around native PrestaShop hook output. |
| `.cci-nice-menu-blog-category-link` | Blog category block item. |
| `.cci-nice-menu-product-link` | Product list/card link item. |
| `.cci-nice-menu-text-card-*` | Text card block parts. |

Avoid undocumented internal classes. Reusable theme rules should normally use
the public classes. When an override must beat the placement-scoped runtime
stylesheet, use the documented deterministic root ID described below.

Blog nodes rendered by CCI Nice Menu Pro expose:

```text
.cci-nice-menu-blog-card
.cci-nice-menu-blog-card-sticky
.cci-nice-menu-blog-card-media
.cci-nice-menu-blog-card-media-empty
.cci-nice-menu-blog-card-copy
.cci-nice-menu-blog-card-eyebrow
.cci-nice-menu-blog-card-title
.cci-nice-menu-blog-card-description
.cci-nice-menu-blog-card-meta
.cci-nice-menu-blog-collection
.cci-nice-menu-blog-collection-list
.cci-nice-menu-blog-collection-carousel
.cci-nice-menu-blog-collection-popular
.cci-nice-menu-blog-empty
```

## CSS Variables

The root and renderer set CSS variables from saved menu settings and node
fields. Common variables:

```text
--cci-nice-menu-item-gap
--cci-nice-menu-mobile-menu-max-height
--cci-nice-menu-column-span
--cci-nice-menu-top-column-span
--cci-nice-menu-tabs-content-height
--cci-nice-menu-tabs-tablet-height
--cci-nice-menu-tabs-mobile-height
--cci-nice-menu-banner-bg
--cci-nice-menu-banner-accent
--cci-nice-menu-banner-image-position
--cci-nice-menu-banner-image-fit
```

Use variables for theme-level changes instead of hardcoding a selector for one
specific menu tab.

## Safe Styling Rules

- Scope theme CSS under `.cci-nice-menu-nav` or a theme wrapper.
- Keep hook output neutral. A hook node may render any module, so do not add
  search-specific hover, padding or backgrounds to generic `.cci-nice-menu-hook`.
- Search should inherit styling from `ps_searchbar`.
- Banners use `.cci-nice-menu-banner-cta`; videos use `.cci-nice-menu-video-cta`.
- Shared CTAs such as "View more", "View all" and "View store" should use one
  common visual pattern.
- Do not require merchants to type module internals such as `cci-nice-menu-top-search`
  into a custom class input.
- Avoid `!important` unless overriding a known theme/runtime conflict and the
  selector is tightly scoped.
- Do not add shadow-based hover effects. Current visual rules prefer border,
  background and underline/pill states.

## Creating A New Visual Block

For a block that belongs to the base module:

1. Add a stable `type` or `component_variant` in the React builder.
2. Normalize it in `CciNiceMenuCore`.
3. Render HTML in the shared block renderer.
4. Add CSS in `views/css/cci_nice_menu_front_runtime.css` using the shared
   component pattern.
5. Add admin controls and validation.
6. Add docs here and in `DEVELOPER.md`.
7. Update `views/data/retail_showcase_tree.json` if the optional Pro showcase
   loaded from the editor should display it. A fresh base-module installation
   always starts with the standard base menu.

For a Pro or add-on block, use the extension hooks in
[EXTENSIONS.md](./EXTENSIONS.md) and keep the base module as a neutral host.

## CCI Blog Carousel Inside Nice Menu

`blog_carousel` data comes from CCI Blog tables, but CCI Nice Menu Pro renders
the cards and CCI Nice Menu initializes Owl. Override it in the active theme or
through `displayCciNiceMenuFrontAssets`, not in CCI Blog `front.css`.

The carousel root is:

```html
<div class="cci-nice-menu-blog-collection cci-nice-menu-blog-collection-carousel"
     data-cci-nice-menu-carousel="owl"
     data-cci-nice-menu-carousel-options="{...}">
```

Before initialization it remains a horizontally scrollable fallback. Runtime
states are:

```text
.cci-nice-menu-state-carousel-pending
.cci-nice-menu-state-carousel-fallback
.owl-carousel
.owl-loaded
.cci-nice-menu-state-owl-ready
```

Owl adds `.owl-stage`, `.owl-item`, `.owl-nav` and navigation buttons. Runtime
CSS is placement-scoped, so use the deterministic root ID to match its
specificity. The ID is `cci-nice-menu-mobile-menu-` plus the normalized lower-case hook;
`displayTop` becomes `cci-nice-menu-mobile-menu-displaytop`:

```css
#cci-nice-menu-mobile-menu-displaytop.cci-nice-menu-root .cci-nice-menu-blog-collection-carousel .cci-nice-menu-blog-card {
  display: grid;
  grid-template-columns: 72px minmax(0, 1fr);
  gap: 12px;
  height: 100%;
  border: 1px solid #dfe4ea;
  border-radius: 12px;
  background: #fff;
}

#cci-nice-menu-mobile-menu-displaytop.cci-nice-menu-root .cci-nice-menu-blog-card-media {
  width: 72px;
  height: 72px;
}

#cci-nice-menu-mobile-menu-displaytop.cci-nice-menu-root .cci-nice-menu-blog-card-title,
#cci-nice-menu-mobile-menu-displaytop.cci-nice-menu-root .cci-nice-menu-blog-card-description {
  white-space: normal;
}

#cci-nice-menu-mobile-menu-displaytop.cci-nice-menu-root .cci-nice-menu-blog-collection-carousel.owl-carousel .owl-item {
  display: flex;
}

#cci-nice-menu-mobile-menu-displaytop.cci-nice-menu-root .cci-nice-menu-blog-collection-carousel.owl-carousel .owl-item > .cci-nice-menu-blog-card {
  width: 100%;
}

#cci-nice-menu-mobile-menu-displaytop.cci-nice-menu-root .cci-nice-menu-blog-collection-carousel.owl-carousel .owl-nav button {
  width: 36px;
  height: 36px;
}
```

For `displayNav1`, use `#cci-nice-menu-mobile-menu-displaynav1`; the same rule applies
to other enabled placement hooks. Do not copy a demo node's custom class into
theme CSS.

The builder owns `item_count`, `carousel_items`, `carousel_margin`, autoplay
and timeout values. Do not rewrite `data-cci-nice-menu-carousel-options` from CSS or a
generic theme script. Use builder settings for behavior and CSS for appearance.

After an override test:

1. carousel before Owl initializes;
2. `.cci-nice-menu-state-owl-ready` state;
3. fallback when Owl is unavailable;
4. one, two and more posts than visible items;
5. long titles, missing image and mobile width;
6. focus, previous/next buttons and reduced-motion behavior.

## Template Override Checklist

After overriding a template:

1. Clear PrestaShop cache.
2. Open the storefront hook where the menu renders.
3. Test desktop and mobile breakpoints.
4. Open and close top-level dropdowns.
5. Verify native hooks such as search and reassurance still render.
6. Check keyboard focus for links and submenu toggles.

## A working theme CSS change

Use saved menu settings for palette, item gap and breakpoint: the renderer
writes these values into the menu itself. Use CSS for a change the controls do
not express, such as underlining destination links on hover and keyboard focus.

Put this in the active theme's custom stylesheet loaded after module assets.
For Classic that is assets/css/custom.css; for another theme, use its documented
custom-CSS or asset-build mechanism.

```css
.cci-nice-menu-nav .cci-nice-menu-link[href]:hover,
.cci-nice-menu-nav .cci-nice-menu-link[href]:focus-visible {
  text-decoration: underline;
  text-underline-offset: 0.2em;
}

.cci-nice-menu-nav .cci-nice-menu-link[href]:focus-visible {
  outline: 2px solid currentColor;
  outline-offset: 3px;
}
```

Clear caches, open a dropdown and test a destination link with mouse and Tab.
Check a phone too. This targets links, not non-clickable group labels. Do not
remove the root, mobile-toggle classes, IDs or data attributes from a template
override; the runtime uses them to open, close and label the navigation.

For HTML changes, copy the complete shipped desktop-nav.tpl into the theme path
above, make one change and clear Smarty/PrestaShop cache. A new PHP renderer is
not needed to change spacing or text decoration. Arbitrary third-party node
types and PHP method overrides are not supported extension mechanisms in 1.0.0.
