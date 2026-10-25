---
Status: NON-AUTHORITATIVE DISCOVERY EVIDENCE
Authority: NONE
Does not add, retire, price, or publish a product.
Checkpoint: a6155378b799e06a95b28c593ac1a340d7ca9245
---

# Catalog parity findings

The checked-in import set agrees with itself. It has not been compared with a live database or with
a Petpooja, Zomato, Swiggy, or operator menu export.

`LIVE_MENU_PARITY = UNVERIFIED`

`npm run test:menu-parity` passed (2 tests). `npm run test:ordering-catalog` passed (3 tests).
Those results are `TEST_PASSED` and `SOURCE_MATCHED` for the static files they compare. They are
not `LIVE_PARITY_VERIFIED`.

## Static agreement

These four representations carry the same 74 display names:

- `src/data/menu.json`
- `src/data/ordering-catalog.json`
- `data/platform/imports/existing-menu-v1.json`
- `src/lib/menuImages.ts` keys

`npm run menu:inventory-existing` reported 74 source cards, 0 duplicate names, 0 structured
variations, and 0 structured modifiers. Composite inventory SHA-256
`0a263d9e514d1d5c05bba7de421812c9a197f85a004c0bdb1ed171712abddaa4`.

`presentationPriceRupees` on an ordering-catalog item is documented in
`src/shared/ordering-catalog/types.ts` as marketing rupees from `menu.json`, not commercial
authority. This audit does not list those rupee amounts as payable prices.

Repository-root `menu.json` and `archive/design-history/landing-page-wireframe/menu.json` are a
separate 69-item historical tree. They are not the import source. Differences there are
`HISTORICAL`, not a current static mismatch.

Items with no row below are `SOURCE_MATCHED` across the four current static representations.
Their order-menu presence, outlet availability, and effective display price remain unverified.
No product UUID is copied into this note.

## Rows that need a disposition

| Source key or name | Parent | Display name | Section | Variants in the seed | Modifiers in the seed | Price source | Image | Description | Classification | Finding | Disposition |
|---|---|---|---|---|---|---|---|---|---|---|---|
| `item:meals-combos/Combos/Exam Survivor Combo` | Meals & Combos | Exam Survivor Combo | Combos | One hidden default | None in the static seed | Static card and generated presentation rupees. Live price book unverified | `Exam_Survivor_Combo.jpeg` is mapped. Photo not judged here | “Spicy carbonara ramyun paired with a chilled boba drink.” | Present in the current static source. Also in the manifest, pricing artifact, image map, and `public/llms.txt` | Founder report said the kit was removed. The current static name is Combo, not Kit. The root historical file still says Exam Survivor Kit | Do not delete. Confirm against an operator export. Home can still show the static card. Removing the JSON name does not retire the order menu |
| Subcategory `the-bar/Iced Teas` | The Bar | Nine items. Eight display names contain “Iced Tea”. The ninth is Lime Black Tea Boba | Iced Teas | One hidden default each | None in the static seed | Static cards | Eight map to iced-tea filenames. Lime Black Tea Boba maps to `Lime_Black_Tea_Boba.jpeg` | Eight descriptions say “iced tea”. Lime Black Tea Boba says “Zesty lime black tea with chewy boba and a crisp citrus edge.” | Present in the current static source | Founder report said legacy iced tea products were retired. This subcategory is still in the import source. Home Water Base still includes it | Do not retire from the JSON or the database on the report alone |
| Name only | Historical root `menu.json` | Exam Survivor Kit | K-Combos / Solo Combos | Not in the import seed | Not in the import seed | Historical file only | Not the current import map | Historical | Historical document only | Different name from the current Combo | Do not treat the root file as the live menu |
| Name only | Current static source | Electric Blue Lime Refresher | Refreshers | One hidden default | None | Static card | Mapped to `Electric_Blue_Iced_Tea.jpeg`. A refresher-named file is unused | Current name does not say iced tea | Present, with an iced-tea filename | Rename comment says the files are the same drink only after confirmation | Hold the mapping. See the media note |
| Name only | Current static source | Magic Galaxy Refresher Drink | Refreshers | One hidden default | None | Static card | Mapped to `Magic_Galaxy_Iced_Tea.jpeg`. A refresher-named file is unused | Current name does not say iced tea | Present, with an iced-tea filename | Same hold as the row above | Hold the mapping |
| Name only | Not found | Onion Rings 6 Pcs | None | None | None | None | None | None | Absent from static source, tests, and comments | Founder report said it was introduced | Do not add it. Verify with an export |
| Name only | Not found | K-Spice Potato Burger | None | None | None | None | None | None | Absent | Founder report said it was introduced | Do not add it |
| Name only | Not found | Veg Value Burger | None | None | None | None | None | None | Absent. Nearest static name is Classic Veg Burger, which is a different source key | Founder report said it was introduced | Do not rename Classic Veg Burger into this product |
| Name only | Not found | K-Spice Potato Crunch Wrap | None | None | None | None | None | None | Absent | Founder report said it was introduced | Do not add it |
| Name only | Not found | Seoul Street Veg Wrap | None | None | None | None | None | None | Absent. “K-Street” is a home section title, not an item | Founder report said it was introduced | Do not create a product from the section title |
| Name only | Not found | Dynamite Rajma Nacho Burger | None | None | None | None | None | None | Absent. Nearest static name is Dynamite Red Burger (Veg/Paneer) | Founder report said it was selected for retirement after sell-through | Do not retire Dynamite Red Burger because of this name |
| Name only | Not found | Gangnam Paneer Supreme Burger | None | None | None | None | None | None | Absent. Nearest static names are Gangnam Glaze Burger (Veg/Paneer) and Gangnam Big Stack Burger | Founder report said it was retained for a final test | Do not treat either nearest name as this product |

## Eight combined protein names

These current display names each cover veg and paneer in one card. The import seed does not give
the customer a visible variant selector:

- Dynamite Red Burger (Veg/Paneer)
- Gangnam Glaze Burger (Veg/Paneer)
- Pink Velvet Cheesy Burger (Veg/Paneer)
- Seoul Masala Burger (Veg/Paneer)
- Dynamite Red Wrap (Veg/Paneer)
- Gangnam Glaze Wrap (Veg/Paneer)
- Pink Velvet Wrap (Veg/Paneer)
- Seoul Masala Wrap (Veg/Paneer)

Momos in the same static source are separate Veg and Paneer items. Whether `/order` still shows
these combined names depends on the effective menu content. That database state was not read.

## What a static difference is allowed to mean

[Menu authority review](cbf5fb20-c54f-4aca-897c-4f94c08d474e) matches the lineage note on the
serving path. Display price is allowed to differ from the checkout payable amount. That difference
is D-368, not a defect. Outlet price, tax, promotions, charges, and an explicitly selected paid
modifier are reasons the sealed amount can change. Checkout must not silently add a paid modifier.

A product is customer-visible on `/order` only after catalog publication, menu publication,
assortment inclusion, and an active price book. The mechanism names, none of which this audit ran,
are `publishCatalogContentChange`, `publishMenuRevision`, `includeBrandVariant` or an exclusion
command, and `activatePriceBook`. Operational unavailability is outlet availability, not catalog
retirement. Deleting a row from `menu.json` or regenerating `ordering-catalog.json` does not retire
the order item.

| Class | How to treat it |
|---|---|
| Observed static mismatch | The four current static representations agree. Root `menu.json` differs and is historical |
| Historical source correctly retained | `menu.json` and `ordering-catalog.json` remain after the order page moved to the projection. Marketing home and checkout recovery still read them for the uses in the lineage note |
| Expected channel difference | Home regrouping versus the import tree. Brand display price versus outlet price. Card price versus checkout quote |
| Unverified business change | Every founder-reported introduction or retirement in the table above |
| Missing data | Fail-closed menu or price errors. Do not fill them from the JSON during a customer request |
| Product or architecture defect | Only if the order runtime serves draft content, falls back to presentation rupees, invents a product, or treats display price as the sealed payable amount. This pass did not observe that in source |
| New desired functionality | Search, Most Ordered, a second menu, or homepage and order visual parity as a product change. Not authorized by this evidence |

Issue 455 is the broader customer-experience audit. This file does not record journey, accessibility,
or instrumentation findings. No in-repo reference to issue 455 was found. The Experience Debt
Register remains a separate document and was not edited.
