---
Status: NON-AUTHORITATIVE DISCOVERY EVIDENCE
Authority: NONE
Does not replace, rename, or delete an image.
Checkpoint: a6155378b799e06a95b28c593ac1a340d7ca9245
---

# Product media audit

File existence and photographic correctness are separate. `npm run audit:menu-images` exited 0 and
printed that mappings are clean. The script is written to exit 0 when files are missing, and in
this run nothing was missing. That exit is not `VISUAL_REVIEW_PASSED`.

`PRODUCT_IMAGE_MAPPING = VERIFIED` for the checked-in name-to-file map: 74 names, 74 files present,
0 missing, 0 duplicate paths, 0 stale keys, 0 unmapped items.

`IMAGE_VISUAL_CORRECTNESS = PARTIAL`. The photos below were opened in this review. The other 70
mapped files were not opened, so they stay `NOT_VISUALLY_VERIFIED`.

The ordering catalog `imagePath` values match `menuImages.ts` for all 74 names. `menu.json` has no
image field. The marketing home looks up `MENU_IMAGES` by item name, so a wrong mapped file is what
the home card shows. `/order` shows `menu_entry_versions.image_path` from the database. This pass
did not read that database. The checked-in manifest carries the same paths the home uses. A
database that still has the imported path would show the same file. That live row was not verified.

## Coverage

| Check | Result |
|---|---|
| Mapped items | 74 |
| Files in `public/assets/menu/` | 76 |
| Missing mapped files | 0 |
| Unused files | 2 |
| Duplicate mappings | 0 |
| Ordering-catalog path drift | 0 |

All 76 files are progressive JPEG (`SOF 0xC2`). Frame counts, measured from the JPEG header:

| Frame | Files |
|---|---|
| 2400×1792 | 51 |
| 2400×1800 | 7 |
| 2400×1910 | 12 |
| 1000×796 | 6 |

Drink cards use `aspect-[3/4]` (`MenuCard`, `type="drink"`). Those drink files are landscape
2400×1792, so a 3:4 cover crop cuts the sides. The cup in the opened drink photos is centered.
Plate cards use `aspect-[4/3]`, which matches 2400×1792 and 2400×1800. Ordering rows use the
stored `imagePath` in a square frame below the `xl` breakpoint and a 4:3 frame at `xl`.

Three files are over 300 KB: `Tangy_Kimchi_Ramyun_Noodles.jpg` (329784 bytes),
`Veggie_Rice_Bowl.jpeg` (318564 bytes), and `Volcanic_Fire_Spicy_Ramyun_Noodles.jpg` (313001 bytes).
That is an optimization note, not a broken image.

## Customer fallback

Home `MenuCard` and `PolaroidCard` set `alt` to the item name. A missing path or a failed load
shows an Aurora panel with the name. A file that exists and is the wrong drink does not fail, so
the fallback does not run.

`MenuItemRow` renders `imagePath` with `alt=""`. The name is in the adjacent heading. There is no
`onError` handler. A null path is an empty sunken box. A 404 stays a broken image.

## Visually checked defects

| Mapping | File exists | Mapping | Photo | Format and size | Correction |
|---|---|---|---|---|---|
| Electric Blue Lime Refresher → `Electric_Blue_Iced_Tea.jpeg` | Yes | No | No. Opened photo is a dark purple-black drink with blueberries. The item copy says an electric blue lime refresher with popping boba | Progressive JPEG, 2400×1792, 108012 bytes, SHA-256 `d6a28c7ce77f82b6a52d27834d58bfd2d1cd983d48ba7b834bc55b43c78cf13b` | Point the item at the unused file. Do not overwrite that file with this one |
| Unused `Electric_Blue_Lime_Refresher.jpeg` | Yes | Not the mapped file | Opened photo is a bright blue drink with mint and dark pearls. It matches the current name more closely than the mapped file. Lime is not separately visible beyond the blue liquid and mint | Progressive JPEG, 2400×1792, 109773 bytes, SHA-256 `f07debf68bfa7c5235c84460bca60015b56cc9b0b515975391a9fd41bab14cb4` | Use this file for that item after a content owner confirms it |
| Magic Galaxy Refresher Drink → `Magic_Galaxy_Iced_Tea.jpeg` | Yes | No | No. Opened photo is a purple-to-blue drink filled with square jelly cubes. The item copy says a butterfly-pea refresher with lime and popping boba | Progressive JPEG, 2400×1792, 94497 bytes, SHA-256 `91ec2e07f4b6022c08de290f331d04e1d37518a2caff2ce5bd80720fdb164cce` | Point the item at the unused file. Do not overwrite that file |
| Unused `Magic_Galaxy_Refresher_Drink.jpeg` | Yes | Not the mapped file | Opened photo is the same color shift with round dark pearls, not jelly cubes. Lime is not visible. It is closer to the popping-boba copy than the mapped file | Progressive JPEG, 2400×1792, 87104 bytes, SHA-256 `c9f7e13c3cd57b57e01667208eaeca34824d5bb8ed22ce7ed3a342f1933ff326` | Use this file for that item after a content owner confirms it |
| Pink Velvet Wrap (Veg/Paneer) → `Pink_Velvet_Wrap.jpg` | Yes | Filename matches | No. Opened photo is a grilled pale tortilla. The item copy says a pink velvet tortilla | Progressive JPEG, 2400×1800, 176557 bytes, SHA-256 `b45ac96c746ee40bc06b421a50aaa311c123e2f40427e2f06a1621c236e89613` | Reshoot or replace. There is no unused pink-tortilla file in this folder |
| Watermelon Iced Tea → `Watermelon_Iced_Tea.jpeg` | Yes | Filename matches | Not classified as the wrong file. Opened photo is an amber-brown iced tea with reddish pearls. The copy says “Light watermelon iced tea with a clean, juicy summer finish.” The photo does not show a distinct watermelon color. No base ingredient was inferred | Progressive JPEG, 2400×1792, 103613 bytes, SHA-256 `db5eb0da3b53748eb311dec3dffd0f4b63011900e23ed96f737cd2fcee599908` | Content owner compares it with the drink. Do not replace it on this note alone |

`docs/missing-menu-images.md` says these two refresher files are “correctly shown” and that the
filename should be cleaned up by copying the current file onto
`Electric_Blue_Lime_Refresher.jpeg` and `Magic_Galaxy_Refresher_Drink.jpeg`. Those destination
files already exist and are different bytes. Following that rename would replace the closer photo
with the darker or jelly-cube photo. The note is stale relative to the files on disk.

## Priority

| Priority | Item | Why |
|---|---|---|
| P0 | Electric Blue Lime Refresher on the marketing home | The card shows a different-looking dark berry drink. The home path is `MENU_IMAGES`. The item is also tagged Bestseller |
| P0 | Magic Galaxy Refresher Drink on the marketing home | The card shows jelly cubes. The copy says popping boba. A closer file is already in the folder and unused |
| P1 | Same two paths if the effective menu entry still has the imported `image_path` | The manifest carries the mapped filename. The live database row was not read, so `/order` stays unverified |
| P1 | Pink Velvet Wrap photo | The served file does not show the pink tortilla named in the copy |
| P1 | `docs/missing-menu-images.md` rename instruction | It treats a wrong photo as a filename cleanup and would overwrite the unused files |
| P2 | Watermelon Iced Tea color | Ambiguous. Not a confirmed wrong file |
| P2 | Three files over 300 KB, landscape drinks in a 3:4 card, six fry files at 1000×796 | Optimization and crop. Not a wrong product |
| P3 | Remaining 70 mapped files | Present and name-aligned. Not visually opened |

No image was generated, renamed, or deleted.
