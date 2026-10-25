---
Status: NON-AUTHORITATIVE DISCOVERY EVIDENCE
Authority: NONE
This package does not authorize menu publication, a price change, a catalog edit, or launch.
Checkpoint: a6155378b799e06a95b28c593ac1a340d7ca9245
---

# Launch-readiness decision package

`BOBA_MENU_MERCHANDISING_LAUNCH_READINESS_REPORT`

Companion notes, which remain non-authoritative:

- `menu-source-lineage.md`
- `catalog-parity-findings.md`
- `merchandising-content-review.md`
- `product-media-audit.md`

```text
REPOSITORY_STATIC_MENU_AUDIT = COMPLETE
LIVE_MENU_PARITY = UNVERIFIED
PRODUCT_IMAGE_MAPPING = VERIFIED
IMAGE_VISUAL_CORRECTNESS = PARTIAL
CUSTOMER_MERCHANDISING_READINESS = NEEDS_CORRECTION

PRODUCT_DATA_MUTATED = NO
PRICES_MODIFIED = NO
MENU_PUBLISHED = NO
MAIN_MERGE = NO
DEPLOYMENT = NO
```

A documentation check, including a later CI pass on this note, is not permission to launch the menu.

## A. Source checkpoint

Local `origin` is `git@github.com:nivedhya11/bobabear-platform.git`. GitHub reports that repository
moved to `nivedhya11/BobaBear`. Isolated worktree
`/home/ajoshi/repos/boba-bear-menu-merchandising`. Branch
`docs/customer-menu-merchandising-launch-readiness`. Base `origin/main`
`a6155378b799e06a95b28c593ac1a340d7ca9245`.

Verified authority headers at that commit: VISION-1, GTM-R190, STATE-R189, ARCH-R23, DR-25, PD-2,
EXP-1, LANG-1, TEST-1. Accepted through IMP-036I. IMP-036J is not accepted. IMP-036K implementation
is not authorized. The occupied primary checkout was not used.

## B. Ownership

| Role | Scope | Wrote files |
|---|---|---|
| Catalog lineage | Static files versus `projectCustomerMenu` | No |
| Merchandising content | Names, categories, badges, founder names | No |
| Product media | File map and opened photos | No |
| Menu authority | D-368, D-369, ADR-006, publication boundaries | No |
| Coordinator | This discovery directory only | Yes |

No batch edited cart, checkout, payment, PostgreSQL scripts, the RHS-1 checker, commerce
integration, gate records, or staging preflight.

## C. Static versus active Menu

`/order` and the cart load `GET /api/v1/menu`. `projectCustomerMenu` reads the active Menu's
effective version, effective catalog content, the active Direct price book, and outlet eligibility
when an outlet is supplied. It does not read `menu.json` or `ordering-catalog.json`.

`menu.json` is still customer-visible on the marketing home (`TheBar`, `ThePlates`, `TheSweet`).
`ordering-catalog.json` is still customer-visible as the checkout brand id and as recovery line
names. Display price is not the sealed payable amount.

## D. Product and variant parity

The current static set is 74 names, one hidden default variant each, and no structured modifiers.
`test:menu-parity` and `test:ordering-catalog` passed. That is source agreement, not live parity.

Eight burgers and wraps use one `(Veg/Paneer)` name. The seed has no visible protein selector.

## E. Images

74 mapped files exist. Two unused files are the closer photos for Electric Blue Lime Refresher and
Magic Galaxy Refresher Drink. The mapped files were opened: a dark berry drink, and a jelly-cube
drink. Pink Velvet Wrap's file is a grilled pale tortilla while the copy says a pink velvet
tortilla. Watermelon Iced Tea looks amber; that is not recorded as a proven wrong file. The other
70 photos were not opened.

## F. Content and categories

Home chips render Bestseller (16), New drop (11), and Limited (1) from `tags`. LANG-1 does not
approve those claims. `/order` does not render tags. The home regroups The Bar and flattens plate
subcategories. Rice Bowls sit under Corn Dogs & More. Ramyum and Ramyun both appear. No description
in the 74 is empty. No sales rank was invented.

## G. Historical items

Root `menu.json` and the archive wireframe copy are a 69-item tree with Exam Survivor Kit, Electric
Blue Iced Tea, and Magic Galaxy Iced Tea. The app does not import that file. Those names are
historical. They are not proof that the current order menu sells them, and they are not proof that
it does not.

## H. Business changes that need an export

| Report | Static source at this commit | Live menu |
|---|---|---|
| Iced teas retired | Iced Teas subcategory is present | Unverified |
| Exam Survivor removed | Exam Survivor Combo is present. Kit remains only in the historical root file | Unverified |
| Onion Rings 6 Pcs introduced | Absent | Unverified |
| K-Spice Potato Burger introduced | Absent | Unverified |
| Veg Value Burger introduced | Absent. Classic Veg Burger is a different item | Unverified |
| K-Spice Potato Crunch Wrap introduced | Absent | Unverified |
| Seoul Street Veg Wrap introduced | Absent | Unverified |
| Dynamite Rajma Nacho Burger retiring after sell-through | Absent. Dynamite Red Burger was not treated as this item | Unverified |
| Gangnam Paneer Supreme Burger retained | Absent. Gangnam Glaze and Gangnam Big Stack were not treated as this item | Unverified |

`LIVE_MENU_PARITY = UNVERIFIED`. No Petpooja, Zomato, Swiggy, or operator export was available.

## I. Validation

| Command | Result | What it proves |
|---|---|---|
| `npm run audit:menu-images` | Exit 0 | 74 files present. Not visual correctness |
| `npm run audit:assets` | Exit 1 | Menu files resolve. Failure is `out/` mentions in three non-menu scripts. Not changed here |
| `npm run menu:inventory-existing` | Exit 0 | 74 cards. Digest `0a263d9e514d1d5c05bba7de421812c9a197f85a004c0bdb1ed171712abddaa4` |
| `npm run test:menu-parity` | 2 passed | Static menu matches the manifest |
| `npm run test:ordering-catalog` | 3 passed | Generator output matches the checked-in catalog |

Not run: `menu:import-existing`, `assortment:bootstrap-existing-menu`,
`pricing:bootstrap-existing-menu`, `ordering-catalog:generate`, `db:migrate`, and the PostgreSQL
verify commands.

## J. Backlog

| Priority | Finding | Path | Owner | Risk | Authority required | Regression check |
|---|---|---|---|---|---|---|
| P0 | Home shows the dark berry photo for Electric Blue Lime Refresher | `src/lib/menuImages.ts`, manifest `image_path`, home card | Menu content, then catalog/menu publication if the database already imported the old path | A remap changes the customer photo. Overwriting the unused file would destroy the closer photo | Content confirmation, then the existing image-path and menu-publication path. Not a JSON-only delete | Home card for that name. Menu-parity if the manifest path changes. Do not run import in the same change |
| P0 | Home shows jelly cubes for Magic Galaxy Refresher Drink | Same | Same | Same | Same | Same |
| P1 | Pink Velvet Wrap photo is not a pink tortilla | `public/assets/menu/Pink_Velvet_Wrap.jpg` and the copy in `menu.json` | Menu content | Reshoot. Do not invent a pink-tortilla file | Content owner | Visual check of that card |
| P1 | `docs/missing-menu-images.md` says the refresher photos are correct and its copy step would overwrite the unused files | That doc | Docs with the image remap | Following the current doc destroys the closer files | Same content confirmation | Diff the two SHA-256 values before any rename |
| P1 | Bestseller, New drop, and Limited chips on the home | `src/data/menu.json` `tags`, `src/components/MenuTags.tsx` | Product language | Removing a chip changes the home. It does not change `/order` | LANG-1. Do not add Popular without the IMP-036K evidence rule | Home card render. Order row still has no tag |
| P1 | Eight `(Veg/Paneer)` names and no selector in the seed | Import source and catalog variants | Catalog product decision | Splitting them is a new sellable identity | Product decision. Do not invent a default protein | Catalog identity tests |
| P1 | Founder-reported adds and retirements | Live menu, not these JSON files | Operator plus menu publication | Editing JSON does not change `/order` | Operator-approved menu export, then `publishCatalogContentChange` / `publishMenuRevision` / assortment / price book as applicable | `menu:verify-existing` after a future authorized publication. Not this batch |
| P2 | Rice Bowls under Corn Dogs & More, Ramyum/Ramyun, unnamed house sauce, unnamed meal components, image weight and crop | Static copy and categories | Content | Copy and placement only | Content owner | Menu-parity if source text changes |
| P2 | Watermelon Iced Tea photo is amber | That image | Content | Do not replace on this note alone | Visual comparison with the drink | Reopen the file |
| P3 | SIGNATURE chips, Corndog spelling, `llms.txt` summary, root `menu.json` | Those files | Content or archive | Low. Root file is not imported | None until someone wants the wording changed | Search for the old name |

No new GitHub issue is opened. Issue 455 owns the broader experience audit. This backlog does not
repeat journey, accessibility, or instrumentation work. No existing issue was found that already
owns these menu-content rows.

## K. Publication

Pull request: https://github.com/nivedhya11/BobaBear/pull/476

Head commit is recorded by `git rev-parse HEAD` on
`docs/customer-menu-merchandising-launch-readiness`. CI and CodeQL are not claimed in this note
until they finish. This note does not merge to `main` and does not deploy.

## L. Independent review

A separate read of these notes found four unsupported sentences. They are repaired in this package
and recorded in `independent-review-dispositions.md`. No product was marked retired or live from a
photo. No price, ingredient, allergen, or ranking was added.

## M. Safe remediation sequence

1. Obtain an operator-approved current menu export. Until then, do not add or retire a product.
2. Confirm the two unused refresher files are the drinks that should be sold. Then change the
   `menuImages.ts` mapping and the manifest `image_path` together. Do not copy the currently mapped
   file onto the unused filename.
3. If the database already contains the old `image_path`, publish a menu revision through the
   existing menu publication command. Do not bootstrap or re-import the historical menu as a
   shortcut.
4. Correct `docs/missing-menu-images.md` in that same image change so it no longer calls the
   current photos correct.
5. Decide the home badges and the `(Veg/Paneer)` names as product-language and catalog decisions.
   Do not invent ingredients, allergens, a sauce name, or a ranking.
6. Only after the export in step 1, stage catalog, menu, assortment, and price-book changes for
   products that are actually new or retired.

## N. Parallel-batch compliance

This directory is the only intended change. Application source, menu data, prices, cart, checkout,
payment, PostgreSQL scripts, RHS-1 checker and policy, commerce integration, gate records, and
staging preflight are out of scope. No primary-checkout files were edited.
