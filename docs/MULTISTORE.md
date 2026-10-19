# PrestaShop Multistore (Pro)

CCI Nice Menu stores each definition with `id_shop`. Rendering, catalogue
pickers, Blog blocks, settings and license checks use the current PrestaShop
shop context. A menu from one shop is never selected automatically on another
shop.

## Configure shop-specific menus

1. Enable Multistore and create the shops in PrestaShop.
2. Install `cci_nice_menu` and `cci_nice_menu_pro`; activate Pro for every
   covered production shop/domain.
3. Select a single shop in the PrestaShop header selector.
4. Create the menu, choose its hook and save module settings.
5. Switch shops and create or copy the required menu definition.

## Copy a menu to selected shops

Open a saved menu in CCI Nice Menu. The **Multistore** section below the menu
name lists the available targets. Select the shops and use **Copy to shops**.
Drafts must be saved first. Every target gets a separate menu, so subsequent
changes are deliberately not synchronized.

The initial admin payload and `multistore:context` action list accessible
shops. Copy through the authenticated Pro action:

```http
POST {adminAjaxEndpoint}&ajax=1&ajaxAction=multistore:menu:copy-shops
Content-Type: application/json

{"id_menu":7,"shopIds":[2,3]}
```

Each target receives an independent menu row. Its code is made unique when
necessary. Later edits do not change the source menu. Category, CMS, product
and CCI Blog node IDs are preserved, so review every copied menu against the
target shop catalogue before enabling it.

## License and troubleshooting

- `multistore` is a reserved Pro feature. Free keeps shop-scoped storage but
  cannot execute cross-shop copy operations.
- License activation remains domain/shop aware and still follows the purchased
  Standard, Extended or Agency activation limit.
- Use a single-shop context for writes. The module intentionally rejects an
  implicit “write everywhere” workflow.
- If a copied block is empty, confirm that its product, category, CMS page,
  hook provider or CCI Blog post exists in the target shop.
