---
Status: NON-AUTHORITATIVE DISCOVERY EVIDENCE
Authority: NONE
Does not publish a menu, change a price, or replace catalog, pricing, assortment, or customer Menu authority.
Checkpoint: a6155378b799e06a95b28c593ac1a340d7ca9245
Roadmap: GTM-R190
State: STATE-R189
Architecture: ARCH-R23
Decision register: DR-25
---

# Menu source lineage

This note records how a product moves from checked-in source files to customer presentation at
`a6155378b799e06a95b28c593ac1a340d7ca9245`. It is not a catalog, a menu export, or a runtime authority.

`LIVE_MENU_PARITY = UNVERIFIED`. No PostgreSQL read or write was performed. Rows marked
`CURRENT_RUNTIME` describe the code path that serves the customer Menu when a database is present.
They do not prove what that database currently contains.

## Serving path

The direct-order Menu page does not read `src/data/menu.json` or `src/data/ordering-catalog.json`.

`src/app/(customer)/order/page.tsx` renders `OrderingCatalogClient`. That client calls
`getCustomerMenu` in `src/lib/customer-commerce/menu.ts`, which issues `GET /api/v1/menu`.
`src/server/customer-commerce/http/router.ts` handles that route by calling `projectCustomerMenu`
in `src/server/customer-commerce/menu/project-customer-menu.ts`.

`projectCustomerMenu` is a request-time composition. It reads:

- one `menus` row with `lifecycle_status = active` for the brand, then that row's
  `effective_menu_version_id`
- `menu_versions` only when that version is `EFFECTIVE`
- active `menu_section_versions` and `menu_entry_versions`
- `catalog_products`, `catalog_variants`, and effective product and variant content revisions
- `price_books` through `resolveOutletVariantPrice` or `resolveBrandVariantPrice`
- outlet assortment and availability only when the request includes `outletId`

There is no legacy fallback to `menu_sections` or `menu_entries`. A missing effective version,
missing effective content, or more than one active menu fails closed with `MENU_UNAVAILABLE`.
Display price is `displayPricePaise`. D-368 keeps that value distinct from the sealed Checkout
payable amount. Display availability is omitted when no outlet is supplied, and an excluded variant
is left out of the projection rather than given a second availability decision.

The same projection function is also called from administration commercial verification
(`src/server/administration/commercial/verification.ts`). That call is not the customer page.

`CartClient` also calls `getCustomerMenu`. Cart presentation therefore follows the same projection,
not the static JSON files.

## Static files that remain customer-visible

Two static surfaces still reach a customer even though they are not the `/order` Menu:

1. Marketing home sections import `src/data/menu.json` directly: `src/components/TheBar.tsx`,
   `src/components/ThePlates.tsx`, and `src/components/TheSweet.tsx`.
2. Checkout imports `src/data/ordering-catalog.json`. `CheckoutClient` uses `catalog.brandId` for
   the checkout session. `PreviousPaymentRecoveryView` maps each cart line's `variantId` to
   `catalog.items[].name`, and shows the literal fallback `Item` when the variant is absent from
   that snapshot.

A name or image that is wrong in `menu.json` can appear on the marketing home. A name that is wrong
or missing in `ordering-catalog.json` can appear on the previous-payment recovery screen. Neither
file is the Menu grid at `/order`.

## Lineage matrix

Composite static inventory digest from `npm run menu:inventory-existing`:
`0a263d9e514d1d5c05bba7de421812c9a197f85a004c0bdb1ed171712abddaa4`.
That digest covers `src/data/menu.json`, `src/lib/menuImages.ts`, and `src/types/menu.ts`. It is not
the SHA-256 of `menu.json` alone.

| Source | Owner | Runtime authority | Update | Publication | Consumers | Validation | Evidence | Status |
|---|---|---|---|---|---|---|---|---|
| `src/data/menu.json` | IMP-013 static presentation inventory (`inventoryAuthoritativeMenuSource`) | No for `/order`. Yes for the three marketing home sections that import it | Hand-edited JSON | No Menu publication. Home bundle imports the file | Source inventory, pricing bootstrap price collection, image audit, `TheBar`, `ThePlates`, `TheSweet` | `npm run menu:inventory-existing`, `npm run test:menu-parity`, `npm run audit:menu-images` | File SHA-256 `453546e18b2cc92df9e7415323f508dc1d303de96ae9fd5ff8f5ff9ad35711f0` | `IMPORT_SOURCE` |
| `src/lib/menuImages.ts` and `public/assets/menu/` | Static name-to-file map | No. `/order` reads `menu_entry_versions.image_path` | Hand-edited map and files | `buildExistingMenuV1Manifest` copies `card.imagePath` onto the manifest `image_path`. Apply does not rebuild the manifest. `runExistingMenuImport` copies that manifest field onto menu rows. The browser can still fetch `/assets/menu/...` when the stored path points there | Source inventory, image audit, marketing cards | `npm run audit:menu-images`, `npm run audit:assets` | `menuImages.ts` SHA-256 `5e8d60e1721b381658518a45189db7cba369b8856388c21714e5bfab0ddfe2f5` | `SUPPORTING` |
| `src/types/menu.ts` | Static inventory shape | No | Hand-edited types | Digest input only | Source inventory hash | Menu-import digest | SHA-256 `70b838aa47960dfe9de543e8e8470e5be4e81464ecd679d2eed71bdf03c15e45` | `SUPPORTING` |
| `data/platform/imports/existing-menu-v1.json` | Frozen IMP-013 manifest. Apply accepts only this file | No | Built by `buildExistingMenuV1Manifest`. Runtime apply does not regenerate it | `npm run menu:import-existing` | Catalog import, assortment bootstrap, pricing bootstrap, ordering-catalog generator | `npm run test:menu-parity`, `npm run test:menu-import`, `npm run menu:verify-existing` | File SHA-256 `5a7f03f474fc8fcbce304b26671565a705316b7f588fec2ca9fa4abef1be2163`. Embedded composite digest matches the inventory command | `CHECKED_IN_SNAPSHOT` |
| `data/platform/pricing/existing-menu-pricing-v1.json` | IMP-015 price-book bootstrap artifact | No. Live display price reads `price_books` | Derived from the manifest and static menu prices | `npm run pricing:bootstrap-existing-menu` | Pricing bootstrap and pricing-parity tests | `npm run test:pricing-parity`, `npm run pricing:verify-existing-menu` | File SHA-256 `3b6d3f2809d7f6baed2a9f449cbe1e28ee4f6599762eba604521559c5b061a86` | `CHECKED_IN_SNAPSHOT` |
| `src/data/ordering-catalog.json` | IMP-025 generated static projection | No for `/order`. Yes for checkout brand id and previous-payment recovery names | `npm run ordering-catalog:generate` joins the manifest to the static inventory by `source_key` | Checked-in file. Not regenerated in this audit | `checkout/page.tsx`, `PreviousPaymentRecoveryView`, ordering-catalog parity test | `npm run test:ordering-catalog` | File SHA-256 `6a6870ee14cd57c1509e88735b4445f23c4cfcaac3fc90647c02a4d9dd306ba8` | `GENERATED_SNAPSHOT` |
| `catalog_products`, `catalog_variants`, effective content revisions | Catalog identity and effective name, description, and default variant | Yes, when the database is the one the customer-commerce process reads | Catalog commands and content revisions. Initial rows come from the manifest import | Effective content revision. Projection fails closed if it is missing | `projectCustomerMenu` | `npm run test:catalog` | Code: `src/server/catalog/products.ts`, `variants.ts`, `revisions.ts` | `CURRENT_RUNTIME` |
| `menus`, `menu_versions`, `menu_section_versions`, `menu_entry_versions` | Menu presentation graph | Yes for section structure, display overrides, and `image_path` | Administration menu commands. Import seeds rows and ensures an effective version | `publishMenuRevision` switches the effective pointer. Customer read is request-time | `projectCustomerMenu` | Catalog menu-revision tests; `npm run menu:verify-existing` compares the database with the manifest and was not run | Code: `src/server/catalog/menu/publish.ts`; schema `image_path` on `menu_entry_versions` | `CURRENT_RUNTIME` |
| `price_books`, `price_book_variant_prices`, `price_book_modifier_prices` | Pricing | Yes for `displayPricePaise` | Pricing commands. Bootstrap seed is separate and was not run | Active price book at request time. Most specific permitted Direct INR book wins | Menu projection and, separately, checkout revalidation | `npm run test:pricing-parity` was not run in this pass. Pricing verify was not run | Code: `src/server/pricing/resolve-price.ts` | `CURRENT_RUNTIME` |
| `assortment_rules`, `outlet_variant_availability`, `outlet_modifier_option_availability` | Assortment and outlet availability | Yes for display availability only when `outletId` is present | Assortment and availability commands. Brand include bootstrap was not run | Eligibility session. Exclusion omits the item | `projectCustomerMenu` and modifier loading | Assortment tests exist. `npm run assortment:verify-existing-menu` was not run | Code: `src/server/assortment/outlet-eligibility-session.ts` | `CURRENT_RUNTIME` |
| `projectCustomerMenu` | Customer-commerce read model, D-368 | Serving composition only. It does not own identity, price, or availability | None. Recomputed per request | `GET /api/v1/menu` | Ordering page, cart client, administration commercial verification | No dedicated npm script. Coverage sits with catalog and customer-menu projection tests | Code: `src/server/customer-commerce/menu/project-customer-menu.ts` | `CURRENT_RUNTIME` |
| Repository-root `menu.json` and `archive/design-history/landing-page-wireframe/menu.json` | Design-history copy | No | Not in the import pipeline | None | No `src/` consumer found | None | Shared blob SHA-256 `06f783c4b90428a911d907742e26918e98b304116abd7b51d749a61bb9dcea5f` | `HISTORICAL` |

## How a product travels

1. A card in `src/data/menu.json` supplies the presentation name, description, rupee price, tags, and category. `src/lib/menuImages.ts` supplies the image path by that same name.
2. The checked-in manifest `data/platform/imports/existing-menu-v1.json` freezes ids, section placement, and `image_path` for that source key. Apply does not regenerate this file.
3. `npm run menu:import-existing` copies the manifest into catalog products, variants, content, and menu rows. This audit did not run that command.
4. Price-book and assortment bootstrap commands copy commercial inclusion and prices into their own tables. This audit did not run them.
5. A later administration publish can move the effective Menu pointer. The customer projection then reads that effective graph, effective catalog content, the active price book, and outlet eligibility.
6. `ordering-catalog.json` is a deterministic join of the manifest and the static inventory. It remains on the checkout recovery path. It is not regenerated by a customer request.

## Static category names

Top-level categories in `src/data/menu.json`, which the manifest root sections are built to match:

The Bar, Ramyum, Momos, Burger, Wraps, Fries, Meals & Combos, Corn Dogs & More, The Sweet.

`npm run menu:inventory-existing` reported 74 source cards, 9 root sections, 18 child sections, 0 duplicate names, 0 structured variations, 0 structured modifiers, 74 image references, 0 missing images, and 6 meal-combo cards. That command reads files only.

## Commands not run

`menu:import-existing`, `assortment:bootstrap-existing-menu`, `pricing:bootstrap-existing-menu`,
`ordering-catalog:generate`, `db:migrate`, `menu:verify-existing`, and
`pricing:verify-existing-menu` were not run. The verify commands are read-only against PostgreSQL
and would still require a live database, which this evidence package does not use.
