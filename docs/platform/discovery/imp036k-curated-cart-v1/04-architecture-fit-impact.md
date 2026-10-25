# IMP-036K V1 curated Cart shelf — Architecture Fit impact candidate

```text
AUTHORITY = NONE
STATUS = CANDIDATE
OLD_GATE_APPROVALS_NOT_AUTOMATICALLY_TRANSFERRED = YES
NEW_PRODUCT_DEFINITION_GATE = NOT_GRANTED
NEW_EXPERIENCE_GATE = NOT_GRANTED
IMPLEMENTATION_AUTHORIZED = NO
DO_NOT_MERGE = YES
CANDIDATE_ID = IMP-036K-V1-CURATED-CART-FIT-IMPACT-1

ARCHITECTURE_FIT = NOT_PERFORMED
ARCHITECTURE_LOCKED = NO
SCHEMA_CHANGE_AUTHORED = NO
RUNTIME_IMPLEMENTATION_STARTED = NO
NEW_API_AUTHORIZED = NO
NEW_TABLE_AUTHORIZED = NO
NEW_COOKIE_AUTHORIZED = NO
NEW_ROLE_AUTHORIZED = NO
NEW_PERMISSION_AUTHORIZED = NO
NEW_CART_MUTATION_AUTHORITY = NO
B3S_M1_DESIGNED = NO
PR_465_CLOSED = NO
```

This file is a non-binding Architecture Fit **impact** candidate for a narrowed Cart-only shelf.
It proposes a minimum shape for a later Architecture Fit. It does not perform that Fit, does not
lock architecture, and does not grant a Product Definition Gate, an Experience Gate, or
implementation. Proposed persistence columns below are `PROPOSED_NOT_AUTHORIZED`. They are not
schema.

Worktree evidence for this note:

```text
REPOSITORY_PATH = /home/ajoshi/repos/boba-bear-b6-c-architecture
BRANCH = docs/b6-c-architecture-20261025
HEAD = a6155378b799e06a95b28c593ac1a340d7ca9245
ARCHITECTURE = ARCH-R23
DECISION_REGISTER = DR-25
ROADMAP = GTM-R190
STATE = STATE-R189
PRODUCT_DELIVERY = PD-2
VISION = VISION-1
EXPERIENCE = EXP-1
PRODUCT_LANGUAGE = LANG-1
TESTING = TEST-1
acceptedThrough = IMP-036I
currentProductSlice = IMP-036J
nextProductSlice = IMP-036K
IMP036K_IMPLEMENTATION_AUTHORIZED = NO
```

`KNOWN` means the statement was read from this worktree or from PR #465 metadata retrieved for
this note. `INFERRED` means a consequence of those facts plus the proposed V1 rules. Nothing
here is accepted product behaviour.

---

## 1. What stays commercially authoritative

Current Menu and current Cart remain the only commercial authorities for what can be bought and
what is in the cart.

Curation is a filter configuration. It is not an offer, a coupon, a promotion, or a pricing
system. It does not copy price, SKU, availability, or modifier definitions. It does not create
a second catalog or a second price book. Caller-supplied prices, eligibility, and curation
lists are not authority (`ARCH-G08`, `ARCH-G11`).

Recommendation unavailability must not degrade Cart, coupon application, Checkout, or Payment.
A failed or empty shelf read returns no cards. It does not write a cart line, change a coupon,
or change checkout or payment behaviour.

`KNOWN` binding context that this candidate does not amend:

- `D-383` keeps IMP-036K identity and sequencing. `currentProductSlice` stays IMP-036J.
  Implementation of IMP-036K stays unauthorized (`ROADMAP.md`, `STATE.md`, `decision-register.md`).
- `D-382` remainder stays: recommendations do not create promotions, coupons, offers, discounts,
  or a second price.
- `ARCH-G19` / `D-368`: Customer Menu projection is a read model. Display price is not payable
  truth.
- `ARCH-G20` / `D-369`: a positive-price modifier is not purchase intent because it is marked
  default. Recommendation is not selection.
- `ARCH-G21` / `D-370` and `ARCH-G22` / `D-371`: guest/customer cart identity transition and
  unit sequence stay on existing Cart.
- `VISION-1` non-goals: no new deployable service and no marketplace or loyalty profile.

---

## 2. Historical lock does not transfer

`KNOWN`: `docs/platform/capabilities/IMP-036K-revenue-recommendations.md` on this HEAD is
Architecture Fit `PASS` and `ARCHITECTURE_LOCKED` for the previous broad scope. Its reviewed
source is `IMP-036K-FIT-CANDIDATE-1`, architect review `5391917727`, evaluated head
`71cfd352f41f933072b583c7e914f93afb91a235`. That document was not edited.

That lock covered Product Detail, Customization, and Cart placements, operator product/category
relationships, removal-suppression rows, server-issued set correlation, presentation
observation, unit-level assisted attribution through Checkout Snapshot, Popular evidence, and
inactive holdout readiness including a pre-cart ordering journey. Those semantics are historical
for that broad scope. They are not the behaviour specified in this candidate.

`KNOWN` tension, not resolved here: `D-383` register text still says
`IMP036K_ARCHITECTURE_FIT: NOT_PERFORMED` and `IMP036K_ARCHITECTURE_LOCKED: NO`, while the
capability file and `docs/platform/product/README.md` record Fit `PASS` / locked for
`PD-IMP-036K-DRAFT-1`. This candidate does not rewrite either record. For the narrowed V1
scope, Fit is `NOT_PERFORMED` and the architecture is not locked. Historical Product Definition
Gate `PASS` and Experience Gate `PASS` on `PD-IMP-036K-DRAFT-1` / `XD-IMP-036K-DRAFT-1` are not
grants for this shelf.

---

## 3. Proposed minimum

### 3.1 Brand-scoped curated parent-product references

`PROPOSED`. One brand has one curated shelf configuration. Each candidate is an existing catalog
parent product in that same brand (`catalog_products.id` with `catalog_products.brand_id`).
The reference is not a variant, not a SKU copy, and not a price-book row.

`KNOWN`: `catalog_products` identity is `id` plus `brand_id` (`catalog_products_id_brand_id_key`
in `src/platform/database/schema/catalog.ts`). `catalog_variants.product_id` points at that
parent (`catalog_variants_product_brand_fk`). Product code is a separate catalog field
(`catalog_products_brand_code_uidx`). Curation must not store a copy of that code.

The shelf does not own category relationships, Popular ranking, contribution, or margin.
Display order in the configuration is the only curation priority.

### 3.2 Server-authoritative effective-menu eligibility

`PROPOSED` read, using existing authorities. A candidate is eligible only when all of the
following hold at read time:

1. The shelf is enabled and that candidate is enabled.
2. The product id exists on the server-loaded brand. A caller-supplied id list is ignored.
3. The product is on the current effective customer menu for that brand: active menu, effective
   MenuVersion, active section entry. `KNOWN` predicate is `projectCustomerMenu` in
   `src/server/customer-commerce/menu/project-customer-menu.ts` (no draft fallback).
4. The variant offered is the variant that projection already picks:
   `pickDefaultEffectiveVariant`. If that default is missing, the card is omitted. A sibling
   variant is not substituted.
5. Outlet context is the outlet the cart surface already derives. `KNOWN` on
   `a6155378b799e06a95b28c593ac1a340d7ca9245`:
   `resolveCustomerOrderingOutletContext` returns `no_location` when coordinates are absent,
   `indeterminate` when delivery serviceability is not ok, `serviceable` only when the decision
   status is `SERVICEABLE` and `selectedOutletId` is present, and otherwise `not_orderable`
   (`src/lib/customer-commerce/ordering-outlet-context.ts`).
   `menuOutletIdFromOrderingContext` returns that outlet id only for `serviceable`.
   `CartClient.refreshOrderingSurface` passes that id into `getCustomerMenu`, and omits
   `outletId` when it is absent (`src/components/ordering/CartClient.tsx`). The Cart page is
   `src/app/(customer)/order/cart/page.tsx`, which renders `CartClient` and does not select an
   outlet.
6. With that outlet, assortment and availability omit the item, or mark it `sold_out` or
   `temporarily_unavailable`, the card is omitted. `KNOWN`: `displayAvailabilityFromEligibility`
   returns `"omit"` for assortment/catalog omission and distinct availability values for sold
   out and temporarily unavailable. Only a projected item whose availability is absent or
   `"available"` can be shelf-eligible, and absence of availability is eligible only when an
   outlet session actually ran. `KNOWN`: when `outletId` is null, `projectCustomerMenu` skips
   `createOutletEligibilitySession` and prices the row with `resolveBrandVariantPrice`
   (`src/server/customer-commerce/menu/project-customer-menu.ts`). This candidate does **not**
   treat that brand-only projection as purchasable eligibility, and it does not treat the brand
   price as a promised shelf price. No serviceable outlet means no shelf cards.
7. Display price, when a card is shown, is the price that same projection already resolves
   (`resolveOutletVariantPrice` when an outlet is present). It is display only (`ARCH-G19`).
   It is not a payable promise, and it is not shown from a brand-only projection.

`KNOWN` limit: `createOutletEligibilitySession` takes `outletId`, `variantIds`, and `now`
(`src/server/assortment/outlet-eligibility-session.ts`). It does not take fulfilment mode or a
scheduled window. The Cart serviceability call is current-horizon delivery evaluation:
`evaluateDeliveryServiceability` posts coordinates only
(`src/lib/customer-commerce/serviceability.ts`), and `evaluateServiceability` calls
`evaluateServiceabilityCandidates` without the scheduled horizon
(`src/server/serviceability/evaluate.ts`, default `horizon = "current"`). Checkout scheduled
delivery uses `resolveScheduledDeliveryOutlet` inside checkout prepare, not this Cart menu read
(`src/server/checkout/prepare.ts`). This candidate does not add a shelf-owned availability flag
and does not teach assortment a fulfilment-mode argument.

`KNOWN` Pickup limit, recorded as a V1 coverage limitation and not as a new authority:

- Cart states that already provide a server-authoritative outlet are those whose ordering
  context is `serviceable`. That outlet is the delivery-serviceability `selectedOutletId`.
  It is not a customer-picked random outlet.
- Delivery states that can display eligible products are that `serviceable` state only, and
  only for projected items the outlet session leaves available. `no_location`,
  `not_orderable`, and `indeterminate` pass no outlet and display no shelf cards.
- Shelf eligibility follows the existing delivery ordering context only.
  `CartClient.refreshOrderingSurface` resolves the menu outlet only from
  `readDeliveryContext()` via `menuOutletIdFromOrderingContext`. Pickup outlet selection is
  Checkout authority. `CheckoutClient.continuePickupWithOutlet` writes `fulfilmentMode:
  "PICKUP"` and `pickupOutletId` through `setCheckoutFulfilment`
  (`src/components/ordering/CheckoutClient.tsx`). That call does not clear the delivery
  sessionStorage coordinates. Checkout prepare then uses `preload.pickupOutletId` as
  `selectedOutletId` for `PICKUP`, and the serviceability `selectedOutletId` for `DELIVERY`
  (`src/server/checkout/prepare.ts`). Cart does not pass `pickupOutletId` or
  `fulfilmentMode` into `getCustomerMenu`. It reads `activeCheckout.fulfilmentMode` only
  for coupon and total presentation when a checkout evaluation is being reused.
- No serviceable delivery outlet means no shelf and no new Cart or Checkout block.
- A Pickup checkout that leaves serviceable delivery coordinates in place can still produce
  a shelf, because Cart does not read `pickupOutletId` or `fulfilmentMode` into the menu.
  That shelf is the delivery-current projection. It is not a Pickup availability or Pickup
  price promise.
- Whether V1 must hide that shelf when `activeCheckout.fulfilmentMode` is `PICKUP` is an
  unresolved Architecture Fit dependency. This candidate does not specify an implementation.
  `PICKUP_DELIVERY_COVERAGE = DECISION_REQUIRED` for that mixed case only.
- `PICKUP_V1_COVERAGE` stays the source rule: no shelf until a serviceable delivery outlet
  already exists. Pickup mode itself does not suppress the shelf. Cart cannot establish a
  Pickup outlet. No Cart outlet selector is added. Checkout is unchanged. `UOE-DR-06` stays
  unauthorized. Its text is `NOT_FOUND` on this SHA.
- Signed-in, returning, scheduled, and saved-context journeys do not change that Cart outlet.
  `fetchCustomerSession` in `CartClient` runs when the customer continues to Checkout. It does
  not resolve an outlet. `readDeliveryContext` is sessionStorage coordinates
  (`src/lib/customer-location/delivery-context.ts`). `saved_address` is a source label on that
  same coordinate context. The outlet function receives coordinates and postal code, not a
  stored outlet id. A scheduled horizon is a separate serviceability function and is not the
  Cart menu call.
- When no outlet has been established, the menu read is brand-only. Availability is omitted.
  The brand price is not a shelf promise. The shelf shows no cards. Cart, coupon, Checkout,
  and Payment keep their existing behaviour.
- Product availability and outlet price cannot honestly be promised before that authoritative
  outlet exists. A delivery-serviceable outlet can support display eligibility for Delivery.
  Pickup availability and Pickup price cannot be promised on Cart from current authority.
- An active Checkout may already store `pickupOutletId`. Reusing that field as the Cart shelf
  outlet would couple shelf eligibility to Checkout pickup authority. This candidate does not
  do that. `UOE-DR-06` text is `NOT_FOUND` on this SHA. The Checkout pickup boundary above is
  the authority a Cart outlet selector would affect. No Cart outlet selector is added, and
  Checkout is not changed. Missing context never blocks Cart or Checkout.

V1 disposition: retain the no-outlet / no-shelf fallback. No shelf until a serviceable delivery
outlet already exists. Pickup mode itself does not suppress the shelf. The mixed case, a Pickup
checkout that still has serviceable delivery coordinates, remains
`PICKUP_DELIVERY_COVERAGE = DECISION_REQUIRED`. This is not a new way to establish a Pickup
outlet.

Fulfilment that is not orderable (`no_location`, `not_orderable`, `indeterminate`) yields no
cards. Cart, coupon, Checkout, and Payment keep their existing behaviour.

### 3.3 Parent-product membership exclusion

`KNOWN` cart shape:

- `app.cart_lines.variant_id` is the line's catalog variant (`cartLinesTable` in
  `src/platform/database/schema/cart.ts`).
- `cart_lines_quantity_positive_check` requires `quantity > 0`.
- `parsePositiveIntegerQuantity` rejects values that are not a positive safe integer
  (`src/shared/cart/canonicalize.ts`).
- The loaded `CartLine` type has `variantId` and `quantity`. It has no `productId`
  (`src/shared/cart/types.ts`).
- Parent product is `catalog_variants.product_id`.

`PROPOSED` exclusion: suppress the shelf card when any current line on the authoritative cart
has a variant whose `product_id` is the curated parent product. Multiple lines count. Mixed
variants of the same parent count. Quantity greater than zero counts, which is every persisted
line. Quantity zero should not exist; this candidate does not add a zero-quantity state. Source
of the add does not matter. Menu add, shelf add, and customization add are the same membership.

This is presence on the cart. It is not the historical lock's removal-suppression row. When the
last line for that parent is removed, the parent may return at its configured priority if it is
still eligible. `KNOWN` removal path: the cart UI calls `removeCartLine` when quantity would drop
below 1 (`OrderingCatalogClient.changeLiveCartQuantity`). The server quantity command itself
rejects non-positive quantity.

The shelf must resolve parent product ids on the server from `variant_id`. It must not trust a
client-supplied product id on the line.

### 3.4 Deterministic order, ceiling 4, no filler

`PROPOSED` order:

1. Start from the configured sequence of enabled parent-product references. That sequence is the
   display priority. There is no second score.
2. Drop candidates that fail section 3.2 or 3.3. Do not reorder the survivors.
3. Present at most the first 4 survivors. Fewer than 4 is complete. Do not pad with
   non-curated, ineligible, or already-in-cart products.
4. When a presented item leaves the eligible sequence, its replacement is the next eligible
   item later in that same sequence (the next lower priority that was outside the ceiling, or
   the next item that is still eligible). Remaining cards keep their configured relative order.
   The shelf does not reshuffle by price, popularity, cart size, or a new rank.
5. When a higher-priority item becomes eligible again (the parent left the cart, or menu
   eligibility returned), it resumes its configured position. If that position is inside the
   ceiling, the last presented item drops back behind the ceiling. That is restoration of the
   configured order.

The same inputs and the same menu and cart truth produce the same order. The browser does not
sort membership.

`KNOWN` from the paired product candidate `PD-IMP-036K-V1-CURATED-CART-CANDIDATE-1`
(`AC-036K-CC-002`, `BR-036K-CC-010`): an empty Cart does not present a shelf. The exclusion set
is empty when there are no lines, and that emptiness is not a reason to show cards. No cart yet
is the same presentation: no shelf. Historical broad-lock text `CART_REQUIRES_A_LINE = YES` is
not carried forward as a holdout or pre-cart rule. It is also not a license to show the shelf
on an empty Cart.

### 3.5 Add and customization

`KNOWN` mutation surface, unchanged by this candidate:

- `addCartLine` (`src/server/cart/operations.ts`), HTTP `POST /api/v1/cart/lines`.
- Configuration update, quantity, and remove stay on their existing commands.
- `parseAddCartLineInput` allows only `variantId`, `quantity`, `modifiers`, `bundleSelections`,
  and `expectedRevision` (`CART_ADD_LINE_INPUT_FIELDS`). Unknown fields fail closed.
- `validateCartLineStructure` checks catalog relationships for the brand. Its file comment
  states it does not check assortment or availability.
- `MenuItemRow` treats an item as customizable when `modifierGroups.length > 0`, and otherwise
  calls `onAdd`.
- `addItem` sends `variantId`, `quantity: 1`, and `expectedRevision` only. It does not send
  modifiers.
- `initialQuantitiesForAdd` in `MenuItemCustomizationDialog.tsx` skips options whose
  `displayPriceDeltaPaise > 0`. Zero-price defaults may be preselected inside that existing
  dialog. That dialog has no bundle-selection UI.

`PROPOSED` shelf action, still using those commands:

- Direct add only when the projected row has no modifier groups, so the existing menu row
  would already direct-add that same `variantId` with no modifiers. The shelf sends that same
  payload: `variantId`, quantity 1, `expectedRevision`, and no modifiers.
- If any modifier group is projected, the shelf opens the existing customization dialog for
  that projected item. It does not direct-add zero-price defaults ahead of that dialog. Doing
  so would be a second selection policy. `D-369` still forbids paid-modifier preselection.
- No silent variant switch. The shelf never adds a variant other than the projected default,
  and never replaces an ineligible default with a sibling.
- No new cart route, no new cart command, and no new reject path inside `addCartLine`. Shelf
  eligibility is a read filter. It is not a new purchase-authorization gate. A structurally
  valid add that did not come from the shelf still follows existing Cart rules.
- A failed add does not hide the card. Hide only after a successful mutation's returned cart
  shows the parent product.
- Stale revalidation (`AC-036K-CC-020`) is a fresh effective-menu read plus the existing Cart
  add. `KNOWN`: `validateCartLineStructure` checks catalog relationships and does not check
  assortment or availability. This candidate does not add a shelf-only reject inside
  `addCartLine`. If the fresh read says the parent is ineligible, the shelf does not present a
  successful add; the card is excluded for ineligibility. A raw replay of `addCartLine` remains
  ordinary Cart authority and then hides the parent by membership. Payable price stays with
  existing price and checkout evaluation (`ARCH-G19`).

Bundle products follow the same rule as the live menu row. If the projection exposes modifier
groups, open the existing dialog. If it does not, direct add is the same payload `addItem`
already sends. This candidate does not add a bundle configurator. Existing cart evaluation
remains the authority for an incomplete bundle.

### 3.6 Refresh after a successful add

`PROPOSED`:

1. The client replaces its cart with the cart object returned by the existing add or
   customization mutation (`CartMutationResult.cart` / command cart). It does not invent the
   new line locally.
2. It recomputes the shelf from that authoritative cart plus a fresh server eligibility read.
3. Parent-product exclusion uses the returned lines' variant ids resolved to `product_id`.
4. On failure, including `CART_CONFLICT`, the previous card stays. The client does not drop
   the card to look consistent.

`KNOWN`: `addCartLine` returns the reloaded aggregate after the commit. Guest creation may also
return `guestToken` once. That token is the existing guest cart credential, not a shelf
credential.

### 3.7 Workforce permissions

`KNOWN` from `src/shared/access-control/catalog.ts` and
`src/server/catalog/menu/authorize-menu.ts`:

| Fact | Evidence |
|---|---|
| Permission keys `menu.read` and `menu.manage` exist | `catalog.ts` permission list |
| Both target kind `brand` | `PERMISSION_TARGET_KIND` |
| `brand_admin` holds both, inheritance `exact` | `BRAND_ADMIN_PERMISSIONS` |
| `outlet_manager` holds neither `menu.manage` nor `menu.read` | `OUTLET_MANAGER_PERMISSIONS` has outlet assortment, availability, pricing, promotions, and order permissions, and no menu key |
| `requireMenuManage` / `requireMenuRead` load the brand by id from PostgreSQL, then call `requireAuthorization` with `resource: { type: "brand", brandId: brand.id }` | `authorize-menu.ts` |
| A missing brand becomes `MenuNotFoundError` | same file |
| Menu draft, entry, section, and publish commands already call `requireMenuManage` | `src/server/catalog/menu/*.ts` |

`PROPOSED` conclusion: `menu.manage` on the server-loaded brand is sufficient to define,
reorder, enable, and disable this shelf configuration. `menu.read` is sufficient to read that
configuration in workforce administration. No new permission and no new role.

`outlet_manager` lack of `menu.manage` is relevant. An outlet manager must not configure the
brand shelf. Their existing outlet assortment and availability powers still change which
curated products are eligible, because eligibility is read from those authorities. That is the
intended split. This candidate does not grant `menu.manage` to `outlet_manager`.

`catalog.manage` stays the authority for creating products and variants. Curation only
references ids that already exist. `promotions.manage` and `promotions.activate` are not used.

Customer shelf reads use the existing customer or guest cart principal (`buildCartAccess`).
They do not accept a workforce session and do not grant `menu.manage`.

Caller-supplied role, permission, or brand-scope fields are not authority (`ARCH-G08`,
`ARCH-G23`, `ARCH-G25`).

### 3.8 Source attribution

`PROPOSED` recommendation: **defer purchased-unit provenance.** Do not add an attribution flag
on the add command for this V1.

Why that is the smallest honest option:

- Exclusion does not need source. Any line for the parent suppresses the card.
- `KNOWN`: a caller-supplied flag would be a new allowed field on `parseAddCartLineInput`.
  Today an unknown field is `CART_INVALID_INPUT`. The flag would be caller-supplied, so it
  cannot prove the shelf showed the item (`ARCH-G08`, `ARCH-G11`). A menu add of a product
  that is also on the shelf could set the same flag.
- `KNOWN`: lines coalesce by canonical configuration. A later add increments quantity on the
  same line. A command flag cannot say which unit came from the shelf without unit-level
  storage. `cart_line_units` has `ordinal`, `cart_id`, and `cart_line_id` only.
- `KNOWN`: `checkout_snapshot_lines.line_origin` allows only `cart` and `complimentary_offer`.
  A new origin would be a commercial-authority change. This candidate forbids that.
- `KNOWN`: `commercial_command_origins.origin_kind` allows coupon apply, replace, remove,
  fulfilment change, and stale recovery. It is not an item-source journal. This candidate does
  not extend that check.

A later measurement slice may reconsider a non-authoritative hint. If it does, the hint must
not be pricing authority, must not be required for the add to succeed, and a missing or false
hint must not hide the card or reject the add. That reconsideration is not this V1.

### 3.9 Rendered shelf versus shelf response

`PROPOSED` measurement distinction, not an implementation. The paired measurement candidate
separates:

- `M-CC-RSP`: the server built an eligible shelf response. Response/availability diagnostic
  only. Not an impression and not exposure.
- `M-CC-01`: the shelf was actually rendered to the customer.
- `M-CC-02`: the customer's explicit shelf action.
- `M-CC-03`: the authoritative successful Cart add that this attempt started from the shelf.

Building the shelf read may later record `M-CC-RSP`. It must not record `M-CC-01`. A genuine
rendered-exposure event that needs server validation of a browser observation is an Architecture
Fit dependency. The source, correlation, deduplication, privacy, and rejection rules are written
in the measurement candidate. They are not implemented here. No new telemetry, schema, credential,
or API is authorized by naming that dependency.

Interaction rate and attach rate use `M-CC-01` as the denominator. They are not computable from
`M-CC-RSP`. Until `M-CC-01` exists as a validated render, those rates stay not computable.

---

## 4. B3S-M1 and PR #465

`B3S-M1` is eliminated as a V1 dependency: **YES**.

`KNOWN` evidence:

- This worktree has no `B3S-M1` string. The pre-cart problem is in the historical lock,
  section 7.14 of `docs/platform/capabilities/IMP-036K-revenue-recommendations.md`: once Product
  Detail can expose a recommendation before a cart exists, cart-id-only holdout assignment is
  not sufficient, and exposure before a stable server-owned ordering-session assignment is
  forbidden. The mechanisms named there are an ordering-session assignment or suppression until
  that assignment exists. They are not activated (`HOLDOUT_ACTIVATED = NO` in that file).
- PR #465 is open on `nivedhya11/BobaBear`: title `docs: IMP-036K pre-cart guest identity decision candidate`,
  branch `docs/imp036k-precart-guest-identity-design-20261025`, state `OPEN`, url
  `https://github.com/nivedhya11/BobaBear/pull/465`. Its body recommends `B3S-M1`, a
  purpose-limited ordering-journey credential for a first-time guest seeing Product Detail
  recommendations before a Cart exists, and states `AUTHORITY = NONE`, `DO NOT MERGE`,
  `SCHEMA_CHANGE_AUTHORED = NO`, `HOLDOUT_ACTIVATED = NO`. It was not closed by this note.
- The existing guest cart credential is a sessionStorage token sent as
  `X-Boba-Guest-Cart-Token` (`src/lib/customer-commerce/guest-token.test.ts`,
  `src/server/customer-commerce/http/guest-token.ts`). It is cart authority only. This
  candidate does not add a cookie and does not add a second credential.

`PROPOSED` disposition of PR #465: **DEFER / NOT A V1 PREREQUISITE.** Leave it open.

This shelf is Cart-only. It has no Product Detail placement, no Customization placement, no
holdout activation, and no journey that must be assigned before a cart exists. Holdout machinery
and a pre-cart journey credential can be deferred entirely.

---

## 5. Persistence honesty

A curated product-reference configuration likely needs durable brand-scoped storage. That need
is a **proposed persistence need for a later Architecture Fit**. It is not an authorized
migration. No migration is authored here.

`PROPOSED_NOT_AUTHORIZED` conceptual contents, not existing columns:

- One shelf record scoped by existing `brands.id`, with an enabled flag.
- An ordered set of candidate records. Each candidate stores the existing
  `catalog_products.id` for that same brand, an enabled flag, and its position in the
  configured order. Position is the priority. It is not money.
- References are foreign keys to existing catalog product identity
  (`catalog_products_id_brand_id_key`). Writes fail closed when the product is missing or
  belongs to another brand.
- The stored row must not copy price, SKU or product code, availability, modifier groups,
  modifier options, variant id as the curated identity, or display name as authority. Those
  are read from catalog, menu, assortment, and pricing at shelf-read time.
- No suppression table, no holdout table, no attribution table, no issued-set table, and no
  cookie.

`ARCH-G13` still means a later authorized store would be PostgreSQL. `ARCH-G14` means this
candidate does not add a service, queue, or feature store to hold the list. Workforce writes,
when later authorized, would sit on the existing administration façade and call the existing
`requireMenuManage` pattern. This candidate does not define those routes.

---

## 6. Security and concurrency — open for Fit

These remain open until a later Fit specifies the read and the write against this shape. This
note records the risk and the constraint. It does not close the risk by implementing it.

### 6.1 Cross-brand access

`KNOWN` pattern to reuse: menu authorization loads the brand, then authorizes that brand id.
Catalog variants and products are brand-bound by foreign keys. `addCartLine` rejects a variant
whose `brandId` is not the cart brand.

`OPEN`: the new configuration does not exist yet. Fit must require every write and every shelf
read to use the server-loaded brand, ignore caller-supplied candidate lists, and reject a
product whose `brand_id` is not that brand. A `menu.manage` grant on brand A must not edit or
read brand B's shelf.

### 6.2 Stale prices and expired products

`OPEN`: curation must not store a price. Each shelf read must resolve display price from the
current menu projection. A browser can still show a stale price until it refetches. That display
is not payable truth. Checkout quote and Checkout Snapshot remain pricing authority.

`KNOWN` gap that Fit must not paper over: `validateCartLineStructure` does not check
assortment, availability, or effective-menu membership. Replaying a variant id into
`POST /api/v1/cart/lines` uses existing Cart rules. Shelf omission does not make Cart reject
that add. This candidate does not add that reject, because that would be new cart mutation
authority. Expired or off-menu products disappear from the shelf on the next successful
eligibility read. They are not deleted from the cart by the shelf.

If `projectCustomerMenu` throws `MENU_UNAVAILABLE` because some other entry is broken, the
shelf read fails closed to no cards. `KNOWN`: that throw is for the whole projection, not one
candidate. Cart GET must not call this read.

### 6.3 Replay of a shelf add

`KNOWN`: an existing cart requires `expectedRevision` when the cart already exists.
`assertRevisionMatch` returns `CART_CONFLICT` on a stale revision. A retry with a current
revision is a normal second add, not a shelf-nonce failure.

`OPEN` constraint: do not invent a one-time shelf token. Replay protection stays the existing
cart revision and row lock. A replay that Cart accepts is a real add. The card hides only after
that success is reflected in the returned cart. A failed replay leaves the card up.

### 6.4 Two tabs, and menu add versus shelf add

`KNOWN`: `addCartLine` locks the cart row and checks revision. Two concurrent adds serialize.
The stale writer gets `CART_CONFLICT` unless it is the create-in-this-mutation path.

`PROPOSED` behaviour under that lock:

- Tab A succeeds, adopts the returned cart, recomputes, and hides the parent.
- Tab B still showing the card has a stale shelf. Its add with the old revision fails. The card
  stays because the add failed. After Tab B loads the new cart, exclusion hides the parent.
- If Tab B then adds with the new revision, Cart may coalesce the same configuration or insert
  another variant line. That is existing Cart behaviour. The next recompute hides the card
  because the parent is present. The shelf does not add a parent-uniqueness constraint.
- A menu add and a shelf add of different variants of the same parent can both exist. Exclusion
  then hides the card because any variant of the parent counts.

`OPEN` for Fit: prove this with the existing cart conflict tests plus a shelf recompute that
uses only the returned aggregate. Do not add a new lock.

### 6.5 Cart identity transition

`KNOWN`:

- `buildCartAccess` uses a trusted customer identity when one is present, and does not attach
  the guest token on that path. Otherwise it uses `X-Boba-Guest-Cart-Token` when present.
- `getActiveCart` for a customer loads `findCustomerCartRow` for that auth user and brand. For
  a guest it loads by verifier, rejects a verifier mismatch, and rejects an expired guest cart.
- `claimGuestCart` keeps the same `cartId`, moves ownership to the customer, clears
  `guest_credential_verifier`, clears `expires_at`, and bumps revision. Lines stay. Comment in
  `src/server/cart/claim.ts`: same cart id survives. There is no customer cart yet on this path.
- `reconcileGuestCartWithCustomer` keeps the customer cart, copies every guest line into it,
  coalesces identical canonical configurations by summing quantity, moves unit ordinals, deletes
  the guest cart, and bumps the customer revision. `KEEP_GUEST` / `KEEP_CUSTOMER` chooses the
  surviving coupon when the coupons differ. It does not drop lines.

`PROPOSED` exclusion recompute, using whichever cart `getActiveCart` would return after the
transition:

| Transition | Exclusion set after the authoritative result |
|---|---|
| Reload of the same guest or customer cart | Parents of the variants on that cart |
| Guest cart expired or missing | Empty. No cards are hidden for membership. Shelf still requires menu eligibility |
| `claimGuestCart` success | Same parents as before the claim, because the lines moved with the same cart. Recompute from the returned aggregate, not from the cleared guest credential |
| Signed in, before claim or reconcile | Customer cart only. Guest-cart parents are not excluded until those lines are on the customer cart. `INFERRED` from `buildCartAccess` ignoring the guest token once a customer identity exists |
| `reconcileGuestCartWithCustomer` success | Union of parent products that were on either cart, because every guest line is coalesced or inserted and none are discarded. Recompute from the returned customer aggregate |
| Sign-out | Anonymous context. `ARCH-G21`: the browser must not keep reading the customer cart. Exclusion uses the guest cart, if any, and must not copy the previous customer's lines |

The shelf must not accept a caller-supplied cart id. Cart identity stays the existing access
function.

### 6.6 What must stay non-authoritative

Caller-supplied prices, eligibility flags, curation lists, action kinds ("direct add" versus
"customize"), and attribution flags are not authority. The server recomputes eligibility,
action kind, and exclusion. The browser may display and may call the existing add or the
existing customization dialog.

### 6.7 Degradation boundary

`PROPOSED`: generation, storage, or transport failure of the shelf returns no cards and writes
nothing. `GET /api/v1/cart`, coupon commands, checkout handlers, and payment handlers do not
call the shelf read. Their latency and errors stay as they are today.

---

## 7. D-383 and a future decision id

`KNOWN`: decision IDs are immutable. `D-383` is CURRENT for IMP-036K identity, activation for
parallel definition preparation, and sequencing. DR-25 records the next free decision id as
**D-385** (`decision-register.md` ID rules and the DR-25 entry). `D-384` is planning authority
and does not authorize IMP-036K implementation.

`PROPOSED` recommendation:

- Do not rewrite `D-383`. Identity and sequencing stay. IMP-036K remains Revenue Recommendations
  and remains `nextProductSlice`.
- A future binding decision is **not required** solely because observable V1 scope narrowed
  inside that same IMP identity, provided this shelf creates no new role, permission, money
  authority, service, global invariant, or roadmap position.
- A short non-authoritative note of that narrowing is optional. If a later human decision
  records the narrowing as binding, the next free id is `D-385`. This candidate does not draft
  a register edit and does not reserve that id.

`D-385_REQUIRED_FOR_THIS_IMPACT = NO`

---

## 8. Differences from the historical lock that Fit must not assume

| Historical broad lock | This Cart-only candidate |
|---|---|
| Product Detail, Customization, and Cart placements | Cart shelf only |
| Operator product/category relationships | Ordered parent-product references only |
| Cart-scoped removal suppression | Membership exclusion only; removal can bring the card back |
| Pre-cart holdout assignment / B3S-M1 | Deferred; not a V1 prerequisite |
| Unit-level assisted attribution and snapshot provenance | Deferred |
| Popular evidence and contribution ordering | Not used; configured order only |
| Direct add when zero-price defaults already satisfy required groups | Direct add only when the live menu row would direct-add (no modifier groups) |
| `CART_REQUIRES_A_LINE = YES` | Not carried as a holdout rule. The paired product candidate shows no shelf on an empty Cart (`AC-036K-CC-002`) |
| Ceiling 4 on Cart | Kept as a presentation ceiling |

---

## 9. Files actually read

Authorities:

- `docs/platform/VISION.md` (VISION-1, non-goals)
- `docs/platform/ROADMAP.md` (GTM-R190)
- `docs/platform/STATE.md` (STATE-R189)
- `docs/platform/PRODUCT-DELIVERY.md` (PD-2)
- `docs/platform/ARCHITECTURE.md` (ARCH-R23, ARCH-G01 through ARCH-G30, especially ARCH-G08, ARCH-G11, ARCH-G19, ARCH-G20, ARCH-G21, ARCH-G22)
- `docs/platform/decision-register.md` (DR-25, D-382, D-383, D-384, next id D-385)
- `docs/platform/TESTING.md` (TEST-1)
- `docs/platform/EXPERIENCE.md` (EXP-1 header)
- `docs/platform/PRODUCT-LANGUAGE.md` (LANG-1 header)
- `docs/platform/product/README.md` (IMP-036K index row)
- `docs/platform/capabilities/IMP-036K-revenue-recommendations.md` (historical lock banner and sections 3–7, including 7.7, 7.9, 7.12, 7.14). Not modified.
- `docs/platform/product/IMP-036K/product-definition.md` and `experience-definition.md` (historical broad-scope gate status and holdout stories only)

Code:

- `src/shared/access-control/catalog.ts`
- `src/server/catalog/menu/authorize-menu.ts`
- `src/platform/database/schema/cart.ts`
- `src/platform/database/schema/catalog.ts` (products, variants, variant modifier groups)
- `src/platform/database/schema/checkout.ts` (`line_origin` check)
- `src/platform/database/schema/measurement.ts` (`commercial_command_origins` kind check)
- `src/shared/cart/types.ts`
- `src/shared/cart/constants.ts`
- `src/shared/cart/parse-input.ts`
- `src/shared/cart/canonicalize.ts`
- `src/shared/customer-menu/types.ts`
- `src/shared/catalog/constants.ts` (`isModifierGroupRequired`)
- `src/server/cart/operations.ts`
- `src/server/cart/claim.ts`
- `src/server/cart/validate-structure.ts`
- `src/server/customer-commerce/menu/project-customer-menu.ts`
- `src/server/customer-commerce/menu/load-customer-menu-modifiers.ts`
- `src/server/customer-commerce/http/router.ts` (`buildCartAccess`, cart lines, claim, reconcile)
- `src/server/customer-commerce/http/guest-token.ts`
- `src/lib/customer-commerce/ordering-outlet-context.ts`
- `src/lib/customer-commerce/serviceability.ts`
- `src/lib/customer-commerce/menu.ts`
- `src/lib/customer-location/delivery-context.ts`
- `src/server/serviceability/evaluate.ts`
- `src/server/assortment/outlet-eligibility-session.ts`
- `src/server/checkout/prepare.ts`
- `src/app/(customer)/order/cart/page.tsx`
- `src/lib/customer-commerce/guest-token.test.ts`
- `src/components/ordering/MenuItemRow.tsx`
- `src/components/ordering/MenuItemCustomizationDialog.tsx` (`initialQuantitiesForAdd`)
- `src/components/ordering/OrderingCatalogClient.tsx` (`addItem`)
- `src/components/ordering/CartClient.tsx` (menu outlet fetch; checkout session is continuation only)
- `src/components/ordering/CheckoutClient.tsx` (pickup outlet selection; not modified)

External metadata, not merged and not closed:

- PR #465 on `nivedhya11/BobaBear`, state OPEN as retrieved for this note.

---

## 10. Result

```text
B6_ARCHITECTURE_REALIGNMENT_RESULT
CANDIDATE_ID = IMP-036K-V1-CURATED-CART-FIT-IMPACT-1
AUTHORITY = NONE
STATUS = CANDIDATE
ARCHITECTURE_FIT = NOT_PERFORMED
ARCHITECTURE_LOCKED = NO
IMPLEMENTATION_AUTHORIZED = NO
DO_NOT_MERGE = YES

B3S_M1_ELIMINATED_AS_V1_DEPENDENCY = YES
B3S_M1_EVIDENCE = Historical lock section 7.14 requires a pre-cart ordering-session assignment only because Product Detail can expose a recommendation before a cart exists. This V1 is a Cart-only shelf with no Product Detail placement, no Customization placement, and no holdout activation. PR #465 (OPEN, https://github.com/nivedhya11/BobaBear/pull/465, branch docs/imp036k-precart-guest-identity-design-20261025) recommends B3S-M1 as a purpose-limited ordering-journey credential and grants nothing. Disposition = DEFER / NOT A V1 PREREQUISITE. PR left OPEN.

PERMISSION_REUSE = menu.manage on the server-loaded brand is sufficient for shelf configuration writes. menu.read is sufficient for workforce admin read. No new role and no new permission. outlet_manager does not hold menu.manage or menu.read; that lack is accepted. Outlet assortment and availability still affect eligibility without granting menu.manage.

PERSISTENCE = PROPOSED_NOT_AUTHORIZED brand-scoped ordered parent-product references plus enabled flags, foreign-keyed to existing catalog product ids. Must not copy price, SKU, availability, or modifier definitions. Not an authorized migration.

ATTRIBUTION = DEFER purchased-unit provenance. An optional caller-supplied flag on addCartLine is not the smallest honest option: unknown fields fail closed today, the flag would not be proof, coalesced lines cannot attribute one unit, and line_origin must stay cart | complimentary_offer.

OBSERVATION_SEMANTICS = M-CC-RSP is the eligible shelf response and is not exposure. M-CC-01 is the shelf actually rendered to the customer. M-CC-02 is the explicit shelf action. M-CC-03 is the authoritative successful Cart add. Rendered-exposure validation is an Architecture Fit dependency and is not implemented. Interaction and attach rates use M-CC-01 as denominator and are not computable from M-CC-RSP.

PICKUP_V1_COVERAGE = NO_SHELF_UNTIL_SERVICEABLE_DELIVERY_OUTLET. Pickup mode itself does not suppress the shelf. Cart cannot establish a Pickup outlet. Checkout pickupOutletId is not read into the Cart menu. No Cart outlet selector. Checkout is unchanged. UOE-DR-06 stays unauthorized. Its text is NOT_FOUND on a6155378b799e06a95b28c593ac1a340d7ca9245.

PICKUP_DELIVERY_COVERAGE = DECISION_REQUIRED for the mixed case only. A Pickup checkout that leaves serviceable delivery coordinates in place can still produce the delivery-current shelf. Whether V1 must hide that shelf when activeCheckout.fulfilmentMode is PICKUP is an unresolved Architecture Fit dependency. No implementation is specified.

SECURITY_OPEN_FOR_FIT = cross-brand enforcement on the not-yet-existing configuration; shelf display price versus payable quote; addCartLine does not re-check menu eligibility and this candidate does not add that gate; shelf-add replay is ordinary cart revision conflict or a real second add; two-tab and menu-versus-shelf races recompute only from the authoritative cart; claim keeps the same lines, reconcile unions parent products, and a signed-in session before claim excludes only the customer cart.

D-383_REWRITE = NO
D-385_REQUIRED = NO
OPTIONAL_NON_AUTHORITATIVE_NARROWING_NOTE = YES
```
