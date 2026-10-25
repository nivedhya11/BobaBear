---
Status: NON-AUTHORITATIVE DISCOVERY EVIDENCE
Authority: NONE
Does not rewrite menu copy, approve a badge, or declare a product retired or live.
Checkpoint: a6155378b799e06a95b28c593ac1a340d7ca9245
Language standard: LANG-1
---

# Merchandising content review

This note covers names, categories, descriptions, and badges in the checked-in menu sources.
`LIVE_MENU_PARITY = UNVERIFIED`. The `/order` page does not render `tags`. Findings marked
customer-facing on `/` are the marketing home, which imports `src/data/menu.json`.

LANG-1 forbids fake scarcity, false countdowns, and misleading savings. It does not approve
Bestseller, New drop, Limited, or Most Ordered as item labels. IMP-036K discusses the word
Popular under an evidence rule, and `IMP036K_IMPLEMENTATION_AUTHORIZED = NO`. Popular is not a
field in the menu files. No sales ranking was invented for this review.

## What each surface shows

| Surface | Rendered fields |
|---|---|
| Home drink and plate cards (`MenuCard`) | Name, description, `₹{price}`, and tag chips |
| Home desserts (`PolaroidCard` via `TheSweet`) | Name, description, price, and tag chips |
| `/order` row (`MenuItemRow`) | Name, description when non-empty, display price, availability (`Sold out` or `Unavailable`), and `Customisable` when modifiers exist. No tag chip |

`src/components/MenuTags.tsx` maps `bestseller` and `staff` to **Bestseller**, `new` to **New drop**,
`limited` to **Limited**, and `signature` to **SIGNATURE**. Unknown tags are title-cased and still
shown. The order projection has no tag field, so these chips are not evidence about `/order`.

## Category shape

`src/data/menu.json`, `src/data/ordering-catalog.json`, and `data/platform/imports/existing-menu-v1.json`
share nine top-level sections and 74 item names:

| Top-level | Subcategories |
|---|---|
| The Bar | Signature Boba, Matcha Studio, Iced Coffees, Iced Teas, Refreshers |
| Ramyum | Ramyum |
| Momos | Steamed & Fried Momos, Signature Momos |
| Burger | Burgers |
| Wraps | Wraps |
| Fries | Fries, Bites |
| Meals & Combos | Meals, Combos |
| Corn Dogs & More | Corn Dogs, Rice Bowls |
| The Sweet | Sundaes, Marshmallows |

The home does not present that tree as-is.

- `TheBar.tsx` regroups The Bar into **Milk Base** and **Water Base**. The visible subcategory title
  “Iced Teas” is not a home tab. The section line says “iced teas & refreshers” and “pearls cooked
  fresh every morning.”
- `ThePlates.tsx` shows the remaining top-level names and flattens subcategories. The code excludes
  “The Bar” and “The Sweet”. The file comment still says it excludes “Signature Boba” and “Desserts”.
  That comment is stale. It is not what the page does.
- Rice Bowls are a subcategory of **Corn Dogs & More**.
- `public/llms.txt` uses a shorter public summary and different groupings. It is not the import tree.
- Repository-root `menu.json` and the archive wireframe copy are a different 69-item tree. No `src/`
  consumer imports them.

Every import item has a non-empty description. There are no duplicate display names among the 74.
Every import item has `addons: []` and `tier: TIER_A`. The tier is not rendered. The manifest gives
each product one variant named by code `default` with `is_selector_visible: false`. The static seed
has no size or quantity selector.

## Content findings

| Item or key | Surface | Finding | Customer-facing | Priority | Disposition |
|---|---|---|---|---|---|
| `tags: bestseller` on 16 items | Home chips | Rendered as Bestseller. No evidence field and no LANG-1 approval | Yes on `/`. Unverified on `/order` | P1 | Unsupported label. Do not invent a ranking. Remove or replace only under an approved evidence rule |
| `tags: new` on 11 items | Home chips | Rendered as New drop. No drop record is attached to the item | Yes on `/` | P1 | Unsupported drop wording |
| `tags: limited` on Choco Cloud Marshmallow Sticks | Home chips | Rendered as Limited. LANG-1 forbids fake scarcity. No quantity or drop field is attached | Yes on `/` | P1 | Unsupported scarcity label |
| `tags: signature` on 5 items | Home chips | Rendered as SIGNATURE. Not a popularity or scarcity claim | Yes on `/` | P3 | Brand chip. Confirm whether the word is still wanted |
| Eight `(Veg/Paneer)` burgers and wraps | Home cards and the import seed | One display name covers two proteins. Momos and several meals use separate Veg and Paneer items. The seed variant is a hidden default, not a protein choice | Yes on `/`. Unverified on `/order` | P1 | Copy and catalog review. Do not invent a split or a default protein |
| Rice Bowls under Corn Dogs & More | Both aligned catalogs. Home tab uses the parent name | Veggie Rice Bowl and Paneer Rice Bowl are not corn dogs | Yes on `/` as that tab. Unverified on `/order` | P2 | Placement review |
| Ramyum and Ramyun | Category and item names | The category is Ramyum. Cheesy Ramyum uses that spelling. Three other items say Ramyun Noodles | Yes on `/` | P2 | Spelling review |
| Classic Corndog, Dynamite Corndog | Item names versus the Corn Dogs section | Section spelling and item spelling differ | Yes on `/` | P3 | Spelling review |
| Veggie Rice Bowl, Paneer Rice Bowl | Descriptions | Copy says “tossed in house sauce.” The sauce is not named in the item | Yes on `/`. Unverified on `/order` | P2 | Do not invent the sauce name |
| The Bar intro | `TheBar.tsx` | “Premium ingredients, pearls cooked fresh every morning.” | Yes on `/` | P2 | Preparation claim outside the item record |
| Order intro | `OrderingCatalogClient.tsx` | “Crafted fresh and ready when you are.” | Yes as page chrome | P3 | General line, not an item claim |
| Meal descriptions | Meals subcategory | “A veg burger served with fries and a drink,” and the paneer and wrap equivalents, do not name the components | Yes on `/` | P2 | Do not invent the components |
| `public/llms.txt` | Public summary | Shortens some names and uses groupings that are not the import tree | Yes as `/llms.txt` | P3 | Summary drift |

Bestseller names in `src/data/menu.json`: Gangnam Style Iced Coffee Boba, Purple Rain Taro Boba,
Zen Master Matcha Boba, Purple Rain Layered Matcha, Hazelnut Iced Coffee Boba, Electric Blue Lime
Refresher, Magic Galaxy Refresher Drink, Fried Paneer Momos, Seoul Masala Veg Momos, Seoul Masala
Paneer Momos, Dynamite Red Burger (Veg/Paneer), Gangnam Glaze Burger (Veg/Paneer), Seoul Masala
Wrap (Veg/Paneer), Dynamite Red Street Fries, Cheesy Potato Bites, Nutella Oreo Crunch Ice Cream
Sundae.

New-drop names: Pink Velvet Cotton Candy Boba, Mango Matcha Boba, Strawberry Matcha Boba, K-Cinema
Popcorn Coffee Boba, Filter Roast Cold Coffee Boba, Electric Blue Lime Refresher, Classic Veg
Burger, Gangnam Big Stack Burger, Classic Veg Burger Meal, Dynamite Corndog, Veggie Rice Bowl.

No item field is Popular, Most Ordered, or hero. `Hero.tsx` is page chrome. A test expects the
order UI not to show Most Ordered. That is a fixture constraint, not a live badge.

## Image-name hold that affects copy

Electric Blue Lime Refresher and Magic Galaxy Refresher Drink are the current display names.
`src/lib/menuImages.ts` still maps them to `Electric_Blue_Iced_Tea.jpeg` and
`Magic_Galaxy_Iced_Tea.jpeg`. Comments on those lines say the rename waits until someone confirms
they are the same drink. Unused files `Electric_Blue_Lime_Refresher.jpeg` and
`Magic_Galaxy_Refresher_Drink.jpeg` exist beside them. Photographic identity is a separate review.
The filename is not the customer-visible name.

## Counts

| Count | Value |
|---|---|
| Import items | 74 |
| Ordering-catalog items | 74 |
| Manifest products | 74 |
| Empty descriptions in those three | 0 |
| Duplicate import names | 0 |
| Bestseller tags | 16 |
| New tags | 11 |
| Limited tags | 1 |
| Items with any of bestseller, new, signature, or limited | 30 |
| Root `menu.json` items | 69, not imported by the app |
