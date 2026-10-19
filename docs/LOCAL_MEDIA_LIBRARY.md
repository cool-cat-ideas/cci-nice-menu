# CCI Nice Menu Pro Local Image Library

The local image library lets an authenticated back-office employee select an
image already stored by PrestaShop. It is available beside image overrides,
custom item images, banners, map fallback images and video posters. Selecting
an item writes its public, same-origin path into the normal URL field, so saved
menu JSON remains portable and understandable.

## Use it

1. Install CCI Nice Menu and CCI Nice Menu Pro 1.0.0.
2. Activate a license for the current shop. The license must grant
   `local_media_library`.
3. Open a menu and select a block with an image URL field.
4. Select **Choose local image**, switch the approved source, navigate folders
   with breadcrumbs or search by file name. Images load asynchronously in
   pages; select **Load more** for the next page.
5. Confirm **Use image** and save the menu.

The URL field remains editable for legitimate external HTTP(S) assets.

## Read-only contract

Version 1.0.0 has no upload, rename, replace or delete action. The catalog scans
only allowlisted PrestaShop image roots and the base module's `views/img`
directory. It accepts validated GIF, JPEG, PNG and WebP raster files. SVG is
excluded because an SVG can contain executable or remote content.

Requests require an authenticated employee, a valid back-office token and a
valid Pro feature grant, including in development mode. The server resolves
real paths, rejects symlinks and paths outside the allowlist, validates
MIME/type with `getimagesize()`, caps file size and limits search scans. Normal
browsing reads only the selected directory and returns a bounded page. The
browser accepts only same-origin catalog URLs. The endpoint
exposes no filesystem path and no write operation.

## Future uploads

Upload support must be implemented as a separate capability with explicit
employee permissions, CSRF protection, randomized server filenames, decoding
and re-encoding, pixel/dimension limits, quotas and an audit trail. Do not turn
the catalog endpoint into a generic file browser or accept client-provided
filesystem roots.

The module does not grant rights to an image. Merchants remain responsible for
copyright, licenses, model releases and other usage rights for selected media.

## Public integration contract

The Free admin shell sends `media:list` to the active Pro module. Pro handles it
through `Cci_Nice_Menu_Pro::handleCciLocalMediaLibraryAction(int $shopId, array
$payload): array`; `$payload` accepts `query`, `source`, `directory`, `page` and
`perPage`. The server clamps paging and never accepts a filesystem root.
The method returns a JSON-ready catalog containing `items`, `sources` and
`limits`, or an error when the feature is not licensed. Item HTML is rendered
by the owned admin runtime; the endpoint returns metadata and public URLs, not
HTML.
