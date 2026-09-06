# CCI Nice Menu 1.0.0 Release Notes

## Showcase navigation

- Bestsellers, Inspiration and Blog dropdowns use the same responsive showcase
  header component with an icon, title and supporting description.

## Packages

- `cci_nice_menu` is the Free package and includes the base PHP module, React
  admin build, storefront runtime, PHP runtime classes from `src/Core` and
  `src/Shared`, templates, presets and documentation.
- `cci_nice_menu_pro` is the Pro package and includes the encoded product gate
  plus vendored shared license runtime. It must be installed next to
  `cci_nice_menu`.

## Build Checklist

1. Build admin assets: `npm run build:admin`.
2. Run PHP syntax checks for `cci_nice_menu.php`, core classes and
   `cci_nice_menu_pro.php`.
3. Build release archives from the repository root:
   - `npx -y node@23 scripts/build-presta-module-release.mjs modules/cci_nice_menu --suffix=free`
   - `npx -y node@23 scripts/build-presta-module-release.mjs modules/cci_nice_menu_pro --suffix=pro-source`

   Archives are written to `releases/1.0.0/` and must not contain
   `node_modules`, `src/admin-v2`, tests, development screenshots, demo seed
   scripts, reset scripts or temporary helper scripts. Do not exclude the whole
   `src` directory, because `cci_nice_menu` loads PHP runtime classes from
   `src/Core` and `src/Shared`.
4. If distributing encoded Pro, encode `cci_nice_menu_pro.php` together with
   `vendor/cci/license-php/CciSharedLicenseEnvironment.php` and
   `vendor/cci/license-php/CciLicenseRuntime.php`. Verify that the target server
   has a compatible ionCube Loader before release.
