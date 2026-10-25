# IMP-036K — Curated Cart shelf (V1 amendment candidate)

```text
AUTHORITY = NONE
STATUS = CANDIDATE
OLD_GATE_APPROVALS_NOT_AUTOMATICALLY_TRANSFERRED = YES
NEW_PRODUCT_DEFINITION_GATE = NOT_GRANTED
NEW_EXPERIENCE_GATE = NOT_GRANTED
IMPLEMENTATION_AUTHORIZED = NO
DO_NOT_MERGE = YES
```

```text
PRODUCT_DEFINITION_VERSION = PD-IMP-036K-V1-CURATED-CART-CANDIDATE-1
PRE_GATE_DRAFT = YES
PRODUCT_DEFINITION_GATE_EXECUTION = NOT_PERFORMED
Gate Result = NOT_PERFORMED
FOUNDER_UAT_REQUIRED = YES
FOUNDER_UAT = NOT_PERFORMED
STORIES_READINESS = NOT_READY_FOR_IMPLEMENTATION
```

This file is a PD-2 Product Definition **candidate** for a narrowed IMP-036K V1. It is not an
approved Product Definition, not an Experience Definition, and not implementation authorization.
Historical `PD-IMP-036K-DRAFT-1` remains the approved definition of the **previous** multi-surface
scope. Its Product Definition Gate `PASS` at `GATE_EVALUATED_HEAD`
`072932df00c445c8215c61f19f81971bf657b160` does not transfer to this version.

Process anchors, verified in this worktree: [`PRODUCT-DELIVERY.md`](../../PRODUCT-DELIVERY.md)
(PD-2), [`EXPERIENCE.md`](../../EXPERIENCE.md) (EXP-1), [`PRODUCT-LANGUAGE.md`](../../PRODUCT-LANGUAGE.md)
(LANG-1), [`TESTING.md`](../../TESTING.md) (TEST-1). Template:
[`product-definition-template.md`](../../product/templates/product-definition-template.md).

## 1. Identity / version / status

| Field | Definition |
|---|---|
| Capability / title | IMP-036K — Revenue Recommendations, narrowed V1: one merchant-curated shelf on Cart / Your Order. ROADMAP identity stays IMP-036K. This candidate does not rename the IMP. |
| Product Definition version / document status | `PD-IMP-036K-V1-CURATED-CART-CANDIDATE-1`. `STATUS = CANDIDATE`. `AUTHORITY = NONE`. |
| Product owner / approval evidence | Founder V1 contract recorded in batch BOBA-B6-IMP036K-CURATED-CART-V1-20261025. No gate approval. Historical approval of `PD-IMP-036K-DRAFT-1` stays historical. |
| Process / verification policy | PD-2 / EXP-1 / LANG-1 / TEST-1 |
| Experience Criticality | `X3`. The shelf sits on the purchase journey and can affect conversion, basket, and trust. |
| Change Risk | **Proposed `CR2`.** See the paragraph under this table. Coordinator reconciles. Change Risk is not an agent `R` level. |
| Linked Experience Definition | `XD-IMP-036K-V1-CURATED-CART-CANDIDATE-1`, `NOT_GRANTED`. Historical [`experience-definition.md`](../../product/IMP-036K/experience-definition.md) (`XD-IMP-036K-DRAFT-1`) does not transfer. The Experience Gate is still required before Architecture Fit may lock and before implementation authorization. |
| Experience Gate | `NOT_PERFORMED` for this candidate. Banner: `NEW_EXPERIENCE_GATE = NOT_GRANTED`. |
| Canonical anchors | VISION-1, GTM-R190, STATE-R189, ARCH-R23, DR-25, PD-2, EXP-1, LANG-1, TEST-1. |
| Repository candidate | Publication branch `docs/imp036k-curated-cart-v1-scope-20261025`, based on `a6155378b799e06a95b28c593ac1a340d7ca9245` (`origin/main`). Drafted first in worktree `/home/ajoshi/repos/boba-bear-b6-a-product`. |
| Capability lifecycle / authorization | [`ROADMAP.md`](../../ROADMAP.md) / [`STATE.md`](../../STATE.md): `acceptedThrough` IMP-036I; `currentProductSlice` IMP-036J; `nextProductSlice` IMP-036K; `IMP036K_IMPLEMENTATION_AUTHORIZED = NO`. This candidate does not activate the slice or authorize implementation. |
| Relevant capability architecture / ADRs | Historical lock: [`IMP-036K-revenue-recommendations.md`](../../capabilities/IMP-036K-revenue-recommendations.md). That lock describes the previous scope. It is not amended here and is not authority for the narrowed shelf. A new Architecture Fit is a dependency. D-383 remains CURRENT for identity, activation, sequencing, and parallel definition only. |
| Founder UAT applicability | `FOUNDER_UAT_REQUIRED = YES` because X3 purchase-journey behaviour can affect conversion, basket, and trust. `FOUNDER_UAT = NOT_PERFORMED`. |

**Change Risk proposal (CR2).** The shelf reuses Cart mutation and existing menu, price, availability,
and fulfilment checks, and it needs merchant curation that can outlive a single page view. Those
touches are commercial configuration and cart-adjacent mutation on a purchase journey. They are
below payment, refund, or authentication redesign, so this candidate does not propose CR3. They are
above a cosmetic cart label, so CR0 is not proposed. CR1 would fit a presentation-only filter with
no durable curation. CR2 is proposed because durable curation storage, if Architecture Fit confirms
it, plus reuse of cart mutation, is commercial configuration with customer-visible basket effect.
The coordinator reconciles the recorded Change Risk. Historical D-383 recorded CR2 for the previous
scope; that record is context, not an automatic transfer onto this candidate.

**D-383.** Amendment is **not required** for IMP-036K identity, activation, or sequencing. A future
decision may record a non-authoritative scope-narrowing note. Next free decision ID on DR-25 is
**D-385**. This candidate does not draft register text.

**Historical provenance (not authorization).** `PD-IMP-036K-DRAFT-1` Product Definition Gate `PASS`
at `GATE_EVALUATED_HEAD` `072932df00c445c8215c61f19f81971bf657b160` remains historical for the
previous scope. PRs #335, #338, #343, #348, #460, #463, and #465 are historical. They do not
authorize implementation of this candidate. PR #465 is not closed here.

## 2. Business outcome

A customer with items already in the Cart can see a short, merchant-chosen set of other products
that are still on the effective menu and not already in the Cart, and can add one only by an
explicit action through existing Cart authority. The business can choose that set, its relative
order, and whether the shelf is on, inside the brand it already operates. Ordering, pricing,
coupons, checkout, and payment stay available when the shelf is absent, empty, or failed.

VISION outcome touched: the owned path Menu → Cart → Checkout → Payment → Order
([`VISION.md`](../../VISION.md) §4). The shelf is optional assistance on Cart. It is not a new
commerce stage and not a strategic expansion into marketplace, loyalty, or a second catalog.

Observable success for this V1: on a non-empty Cart, eligible curated products that are absent from
the Cart appear in configured priority, at most four at a time; a successful add hides that parent
product and can reveal the next eligible candidate; a failed add leaves the card in place; the
customer can ignore the shelf and continue to Checkout and Payment.

## 3. Problem statement

**Who.** A customer who already has a Cart, and an authorized brand operator who merchandises that
brand. Personas are not roles ([`personas.md`](../../product/personas.md)).

**Context.** Verified current commerce lets the customer build a Cart from the menu, customize when
the product requires it, and continue to Checkout and Payment. IMP-036K is `nextProductSlice` and
is not in implementation. The historical definition asked for recommendations on Product Detail,
Customization, and Cart, with inferred category gaps and relationship types. That wider behaviour
is not the V1 contract this candidate formalizes.

**Impact.** Without a bounded shelf, the Cart does not offer a merchant-chosen next product.
Building the historical multi-surface engine would put assistance in places the Founder V1 contract
excludes and would imply ranking, attribution, and holdout machinery this V1 does not include.

**Verified vs unresolved.** Lifecycle position, cart line shape, and guest-to-customer cart claim /
reconcile are verified in this worktree (section 15). Which existing workforce permission may
write curation is an Architecture Fit mapping, not a second Founder product decision (section 21).

## 4. Primary personas

| Persona ID | Responsibility / goal in this slice | Context / evidence |
|---|---|---|
| `PERSONA-CUSTOMER` | See optional curated products on the Cart and add one only by choice, or ignore them and order. | [`personas.md`](../../product/personas.md). Guest and authenticated customers are contexts of this persona, not new personas. |
| `PERSONA-WORKFORCE-OPERATOR` | As an authorized brand operator, choose existing menu products for the shelf, order them, and turn candidates or the shelf on or off. | Same registry. Brand commercial configuration is a responsibility in VISION §3–§4. Persona ≠ role ≠ permission ≠ authorization. |

## 5. Current-state journey

| Journey ID / evidence | Entry / preconditions | Activities today | Existing outcome / gap |
|---|---|---|---|
| `GJ-FIRST-ORDER` / [`golden-journeys.md`](../../product/golden-journeys.md) `CURRENT` | Customer discovery | Menu → customize when required → Cart → authentication / address / serviceability → review / pay → Order | Accepted customer path. No curated shelf is accepted reality. |
| `GJ-PRODUCT-MENU-LAUNCH` `CURRENT` | Authorized operator, brand scope | Configure catalog, menu, assortment, price, promotions; customer sees the effective menu | One menu authority exists. A second curated menu does not. |
| `GJ-AVAILABILITY` `CURRENT` | Availability change, then a fresh customer read | Customer orderability follows existing availability | A shelf must not show a product the effective menu cannot sell. |
| Cart identity, code in this worktree | Guest cart or customer cart for one brand | Add, change quantity, remove, coupon, claim, reconcile | Lines are variant-scoped. Parent product is `catalog_variants.product_id`. No curated shelf. |

Planned recommendation behaviour in the historical Product Definition is not accepted current
behaviour.

## 6. Desired-state journey

| Journey ID | Entry / context | Ordered activities | Success / downstream outcome | Alternate / recovery paths |
|---|---|---|---|---|
| `JOURNEY-036K-CC-CART` | `PERSONA-CUSTOMER` has a Cart with at least one line. Shelf is enabled. | See up to four curated, eligible, Cart-absent parent products before Checkout and Payment. Act on plus, or ignore. | Explicit add updates the Cart from the authoritative mutation. That parent disappears from the shelf. Checkout and Payment stay on the existing path. | Empty shelf, failed add, cancelled customization, shelf failure: Cart, coupons, Checkout, and Payment remain usable. `AC-036K-CC-002`, `AC-036K-CC-010`, `AC-036K-CC-021`. |
| `JOURNEY-036K-CC-CURATION` | `PERSONA-WORKFORCE-OPERATOR` inside existing brand authorization. | Select existing effective-menu parent products. Enable or disable each. Set relative priority. Enable or disable the shelf. | Later Cart reads use that configuration. Products, prices, and availability stay with their current authorities. | Unauthorized or cross-brand action is denied. Disabling a candidate or the shelf does not remove Cart lines. `AC-036K-CC-022` through `AC-036K-CC-024`. |

## 7. Story map

| Business outcome | Persona | Journey | Activity | Story IDs | Slice classification |
|---|---|---|---|---|---|
| Optional next products on the Cart, from the one menu | `PERSONA-CUSTOMER` | `JOURNEY-036K-CC-CART` | See the shelf only on Cart / Your Order | `US-036K-CC-001` | `V1_ACCEPTANCE_SLICE` |
| A parent already in the Cart is not recommended | `PERSONA-CUSTOMER` | `JOURNEY-036K-CC-CART` | Shelf membership follows Cart parent-product membership | `US-036K-CC-002` | `V1_ACCEPTANCE_SLICE` |
| Add only by an explicit action through existing Cart authority | `PERSONA-CUSTOMER` | `JOURNEY-036K-CC-CART` | Plus performs direct add or opens existing customization | `US-036K-CC-003` | `V1_ACCEPTANCE_SLICE` |
| The visible set is short, ordered, and stable under update | `PERSONA-CUSTOMER` | `JOURNEY-036K-CC-CART` | Priority, ceiling, slot fill, focus | `US-036K-CC-004` | `V1_ACCEPTANCE_SLICE` |
| Ordering continues when the shelf cannot | `PERSONA-CUSTOMER` | `JOURNEY-036K-CC-CART` | Stale add, failure, and recovery | `US-036K-CC-005` | `V1_ACCEPTANCE_SLICE` |
| The brand operator curates the shelf | `PERSONA-WORKFORCE-OPERATOR` | `JOURNEY-036K-CC-CURATION` | Select, priority, enable, disable | `US-036K-CC-006` | `V1_ACCEPTANCE_SLICE` |
| Measurement stays honest and unactivated | `PERSONA-CUSTOMER` | `JOURNEY-036K-CC-CART` | Entitlement only; Agent D specifies the plan | `US-036K-CC-007` | `V1_ACCEPTANCE_SLICE` |

Old IDs `US-036K-001` through `US-036K-013` belong to `PD-IMP-036K-DRAFT-1`. They do not bind this
candidate. Horizontal tasks (storage, events, flags) are not substitute stories.

## 8. Acceptance slice

| Slice | Mandatory story IDs | Mandatory AC IDs | Required Golden Journeys | Observable acceptance boundary |
|---|---|---|---|---|
| `V1_ACCEPTANCE_SLICE` | `US-036K-CC-001` through `US-036K-CC-007` | `AC-036K-CC-001` through `AC-036K-CC-026` | `GJ-FIRST-ORDER`, `GJ-AVAILABILITY`, and `GJ-PRODUCT-MENU-LAUNCH` keep working with the shelf present, empty, or failed. `GJ-PAYMENT-RECOVERY` stays reachable when the shelf fails. | A customer with a non-empty Cart can see at most four curated, eligible, Cart-absent products before Checkout, add one explicitly through existing Cart authority, and ignore the shelf and still order. An authorized brand operator can maintain the parent-product list, priority, and shelf switch inside existing workforce authorization and brand scope. |
| `FOLLOW_UP` | None in this candidate | — | — | No hidden follow-up is required for V1 acceptance. |
| `DEFERRED` | None as story IDs | — | — | Section 23. Deferral is not a schedule. |

**Proposed acceptance rule, pending this candidate’s gate:** at most four product cards are visible
at once. Fewer eligible products produce fewer cards. The merchandising pool of about 8–12 products
is guidance so replacements exist. It is not a hard-coded product limit.

## 9. User stories

```text
Story ID: US-036K-CC-001
As a PERSONA-CUSTOMER
I want curated products from the menu I am already buying from, shown on my Cart before Checkout
so that I can notice an optional extra without a new order step.

Journey / activity: JOURNEY-036K-CC-CART / see the shelf on Cart / Your Order only.
Preconditions: Cart has at least one line, or the Cart is empty (empty is an explicit outcome).
  Shelf configuration and effective menu are readable. Customer may be guest or authenticated.
Acceptance scenarios: AC-036K-CC-001 through AC-036K-CC-004
Business rules: BR-036K-CC-001, BR-036K-CC-002, BR-036K-CC-003, BR-036K-CC-010
UX states: Shelf ready, empty, and absent. Wording belongs in the Experience Definition.
Permission / resource context: Customer read of own Cart and the effective menu. No workforce authority.
Error / recovery: US-036K-CC-005.
Dependencies: Existing menu projection and Cart read. Curation from US-036K-CC-006.
Explicit non-goals: Product Detail, customization recommendation module, Menu Discovery, Checkout
  Review, Payment, Confirmation, My Orders. No second menu.
Data implications: Shelf reads existing effective-menu products through parent-product references.
Security implications: Shelf contents cannot widen what that customer can buy.
Architecture fit / applicable invariants: ARCH-G11. Historical IMP-036K architecture is not fit for
  this scope. Fit is not performed.
Open material decisions: NONE
Readiness: NOT_READY_FOR_IMPLEMENTATION
```

```text
Story ID: US-036K-CC-002
As a PERSONA-CUSTOMER
I want a product I already have in the Cart to leave the shelf
so that the shelf offers something I have not already chosen.

Journey / activity: JOURNEY-036K-CC-CART / parent-product exclusion.
Preconditions: A parent product is curated. Zero or more of its variants are Cart lines.
Acceptance scenarios: AC-036K-CC-005 through AC-036K-CC-014
Business rules: BR-036K-CC-006 through BR-036K-CC-009, BR-036K-CC-019
UX states: Card present, card removed after success, card retained after failure or cancel.
Permission / resource context: Exclusion uses the authoritative Cart for this customer and brand.
Error / recovery: Failed mutation and cancelled customization keep the card eligible.
Dependencies: Catalog variant → product id. Existing claim and reconcile.
Explicit non-goals: Dismissal memory, source-specific exclusion, mutating the curated list when
  the Cart changes, pre-cart guest ordering-session identity.
Data implications: Cart lines stay variant-scoped. Parent identity is derived, not stored as a
  second Cart key by this candidate.
Security implications: A client cannot keep a parent visible by omitting a line, or hide an
  unrelated parent by naming it.
Architecture fit / applicable invariants: ARCH-G11. Cart remains Cart authority.
Open material decisions: NONE
Readiness: NOT_READY_FOR_IMPLEMENTATION
```

```text
Story ID: US-036K-CC-003
As a PERSONA-CUSTOMER
I want the shelf plus control to add through the same Cart rules as the menu
so that a recommendation cannot choose a variant, a paid modifier, or a price for me.

Journey / activity: JOURNEY-036K-CC-CART / explicit add.
Preconditions: The card is visible. Existing direct-add or customization rules apply.
Acceptance scenarios: AC-036K-CC-015 through AC-036K-CC-017
Business rules: BR-036K-CC-012, BR-036K-CC-013
UX states: Direct-add result, customization opened, customization cancelled.
Permission / resource context: Existing customer Cart mutation for this brand. No new mutation API
  is a product requirement.
Error / recovery: US-036K-CC-005. Failed mutation does not remove the card.
Dependencies: Existing Cart add and existing customization.
Explicit non-goals: New Cart mutation authority, silent variant switch, preselected paid modifier,
  purchase intent from merely showing the card.
Data implications: Cart contents change only from the authoritative mutation result.
Security implications: Forged or replayed recommendation identity cannot bypass Cart checks.
Architecture fit / applicable invariants: ARCH-G08, ARCH-G11.
Open material decisions: NONE
Readiness: NOT_READY_FOR_IMPLEMENTATION
```

```text
Story ID: US-036K-CC-004
As a PERSONA-CUSTOMER
I want the shelf to show a short, predictable set and to fill the next product without throwing me
off the page
so that I can keep my place in the Cart.

Journey / activity: JOURNEY-036K-CC-CART / priority, ceiling, slot fill.
Preconditions: More than one eligible Cart-absent candidate may exist.
Acceptance scenarios: AC-036K-CC-018, AC-036K-CC-019
Business rules: BR-036K-CC-011, BR-036K-CC-017, BR-036K-CC-018, BR-036K-CC-023
UX states: 1–4 cards, no filler, focus retained. Interaction detail is Experience Definition scope.
Permission / resource context: Same customer Cart read.
Error / recovery: If the next candidate fails eligibility at display time, skip it. Do not invent a
  substitute product.
Dependencies: Operator priority from US-036K-CC-006.
Explicit non-goals: User-behavior ranking, AI/ML, weight engine, per-user configuration, padding.
Data implications: Display order is the configured relative priority among currently eligible
  Cart-absent parents.
Security implications: Priority is brand configuration, not a customer-controlled rank input.
Architecture fit / applicable invariants: None beyond existing customer read. Fit not performed.
Open material decisions: NONE. The four-card ceiling is the proposed acceptance rule in section 8.
Readiness: NOT_READY_FOR_IMPLEMENTATION
```

```text
Story ID: US-036K-CC-005
As a PERSONA-CUSTOMER
I want Cart, coupons, Checkout, and Payment to keep working when the shelf is missing or wrong
so that an optional suggestion cannot trap the order.

Journey / activity: JOURNEY-036K-CC-CART / failure and stale action.
Preconditions: Customer can already operate the Cart without a shelf.
Acceptance scenarios: AC-036K-CC-020, AC-036K-CC-021
Business rules: BR-036K-CC-005, BR-036K-CC-013, BR-036K-CC-014
UX states: Shelf hidden or failed; Cart actions remain; stale add explains failure without a false
  success. Copy is Experience Definition scope.
Permission / resource context: Existing Cart, coupon, Checkout, and Payment authority.
Error / recovery: Retry of Cart actions uses existing Cart behaviour. Shelf retry must not create
  a second commercial result.
Dependencies: Existing Cart, coupon, Checkout, and Payment journeys.
Explicit non-goals: Compulsory upsell step. Client-reconstructed prices. Recommendation-owned totals.
Data implications: A failed shelf read or failed add writes no Cart intent.
Security implications: Stale identifiers are rechecked by existing commerce on add.
Architecture fit / applicable invariants: ARCH-G05, ARCH-G06, ARCH-G07, ARCH-G11.
Open material decisions: NONE
Readiness: NOT_READY_FOR_IMPLEMENTATION
```

```text
Story ID: US-036K-CC-006
As a PERSONA-WORKFORCE-OPERATOR
I want to curate existing menu products for my brand’s Cart shelf
so that the suggestions match how this brand merchandises, without a new catalog.

Journey / activity: JOURNEY-036K-CC-CURATION / select, priority, enable, disable.
Preconditions: Actor is inside existing workforce authorization and brand scope. Products already
  exist on the effective menu.
Acceptance scenarios: AC-036K-CC-022 through AC-036K-CC-024
Business rules: BR-036K-CC-003, BR-036K-CC-004, BR-036K-CC-015, BR-036K-CC-016, BR-036K-CC-017
UX states: Saved curation, denied unauthorized, denied cross-brand. Screen layout is Experience
  Definition scope.
Permission / resource context: Existing workforce authorization and brand scope. This story does
  not name a new role or permission. Section 14.
Error / recovery: Denied actions do not change curation or Cart lines.
Dependencies: Architecture Fit must map the write onto an existing permission or stop for a
  separate authorization. Effective menu authority from IMP-036F.
Explicit non-goals: New menu, catalog, product type, price book, SKU, availability list, campaign,
  coupon, promotion, discount, relationship types, or a hard pool limit.
Data implications: Curation references stable parent-product identities. Commerce attributes stay
  with their current owners. Durable storage shape is Architecture Fit, not this file.
Security implications: Cross-brand and unauthorized writes are denied. Server-derived brand scope.
Architecture fit / applicable invariants: ARCH-G04, ARCH-G08. Fit not performed.
Open material decisions: NONE
Readiness: NOT_READY_FOR_IMPLEMENTATION
```

```text
Story ID: US-036K-CC-007
As a PERSONA-CUSTOMER
I want shelf measurement to describe what the shelf actually did
so that the business does not treat a glance, a menu add, or a selling price as assisted profit.

Journey / activity: JOURNEY-036K-CC-CART / measurement entitlement.
Preconditions: None for collection. This candidate does not authorize telemetry or a holdout.
Acceptance scenarios: AC-036K-CC-025, AC-036K-CC-026
Business rules: BR-036K-CC-020, BR-036K-CC-021
UX states: N/A for a customer-facing meter. No customer-visible score is a V1 requirement.
Permission / resource context: No new reader. Agent D specifies the measurement plan later.
Error / recovery: Missing provenance yields no assisted-purchase claim.
Dependencies: Agent D measurement specification. Architecture review if purchased-unit provenance
  needs material schema.
Explicit non-goals: Seven-event assistance engine, holdout activation, revenue-from-impression,
  causal uplift from attach rate, contribution margin from selling price, counting a menu add as
  a shelf add, counting a server shelf response as a rendered exposure or as an impression.
Data implications: Entitlement only. No collection schema is approved here.
Security implications: No private eligibility, payment, or security facts in analytics unless a
  later authorized plan requires them. This candidate does not require them.
Architecture fit / applicable invariants: Not performed. Do not import the historical correlation
  engine to satisfy this story.
Open material decisions: NONE
Readiness: NOT_READY_FOR_IMPLEMENTATION
```

## 10. Acceptance scenarios

Mandatory means required in the V1 acceptance slice. All rows below are mandatory `YES`. Planned
proof is not executed evidence. Customer wording is not an acceptance string; LANG-1 and the
Experience Definition own presentation.

| AC ID | Story | Given | When | Then | And |
|---|---|---|---|---|---|
| `AC-036K-CC-001` | `US-036K-CC-001` | Non-empty Cart, shelf enabled, at least one eligible Cart-absent curated parent | The customer opens Cart / Your Order | A shelf is shown on that page before Checkout and Payment | It is not an extra Checkout step |
| `AC-036K-CC-002` | `US-036K-CC-001` | Cart has no lines | The customer opens Cart / Your Order | No shelf is shown | Cart empty state stays the existing Cart empty state |
| `AC-036K-CC-003` | `US-036K-CC-001` | Any eligible curated product | The customer uses Product Detail, Product Customization, Menu Discovery, Checkout Review, Payment, Confirmation, or My Orders | Those surfaces do not gain a V1 recommendation module | Existing customization still opens when a product requires options, including from the shelf plus control |
| `AC-036K-CC-004` | `US-036K-CC-001` | A curated parent is on the effective menu, then leaves it or becomes ineligible | The next shelf evaluation runs | The card disappears | The same parent remains subject to the normal main menu rules; the shelf is a filtered presentation, not a second menu |
| `AC-036K-CC-005` | `US-036K-CC-002` | Parent is curated, eligible, and no variant of it is in the active Cart | The shelf is evaluated | The parent may appear, subject to priority and the four-card ceiling | Absence is necessary eligibility, not a promise to show every curated product at once |
| `AC-036K-CC-006` | `US-036K-CC-002` | Parent is visible on the shelf | A variant of that parent is added from the main menu, or from any other authorized Cart flow | The parent card is hidden | The product remains on the main menu |
| `AC-036K-CC-007` | `US-036K-CC-002` | Parent card is visible | The customer uses shelf plus and the Cart add succeeds | The card is hidden only after that success | A later eligible candidate may occupy the slot (`AC-036K-CC-019`) |
| `AC-036K-CC-008` | `US-036K-CC-002` | Any variant of the parent is in the Cart | Quantity increases, or quantity decreases while at least one unit remains | The parent stays hidden | Hiding does not depend on which variant or which quantity above zero |
| `AC-036K-CC-009` | `US-036K-CC-002` | The parent was hidden because a variant was in the Cart | Every unit of every variant of that parent is removed | The parent is eligible to reappear | Eligibility still requires curation, effective menu, and availability |
| `AC-036K-CC-010` | `US-036K-CC-002` | Card is visible | Shelf add fails, or customization is cancelled before a successful add | The parent stays eligible and the card is not removed as a success | No false success is shown |
| `AC-036K-CC-011` | `US-036K-CC-002` | Parent was a candidate | It is unavailable, or it is no longer curated, or the shelf is disabled, or the Cart menu read has no authoritative outlet | It is excluded from the shelf | Existing Cart lines of that product are not deleted by that exclusion. Missing outlet context does not block Cart or Checkout |
| `AC-036K-CC-012` | `US-036K-CC-002` | Two or more Cart lines share one parent product id (different variants, or the same variant with different configurations that Cart keeps as separate lines) | The shelf is evaluated | The parent is hidden once | Exclusion does not require every variant to be present, and it does not treat each line as a separate product |
| `AC-036K-CC-013` | `US-036K-CC-002` | Guest Cart is claimed onto the same cart id, or guest and customer Carts are reconciled under existing Cart authority, or the Cart is reloaded | The next shelf evaluation runs | Membership is recomputed from the authoritative Cart after that operation | Claim itself does not rewrite lines; reconcile keeps the customer Cart and coalesces lines under existing Cart authority. This candidate does not add a merge rule |
| `AC-036K-CC-014` | `US-036K-CC-002` | A parent enters or leaves the Cart | Curation is read again | The curated source list is unchanged | Cart membership and the curated list are different facts |
| `AC-036K-CC-015` | `US-036K-CC-003` | The projected menu row has no modifier groups | The customer uses plus | The existing Cart add runs with the same payload the menu add sends: that `variantId`, quantity 1, `expectedRevision`, and no modifiers | No new Cart mutation authority is created. Zero-price defaults are not direct-added ahead of customization |
| `AC-036K-CC-016` | `US-036K-CC-003` | The projected menu row has any modifier group | The customer uses plus | Existing customization opens | A paid modifier is not invented or preselected. Zero-price defaults are not submitted ahead of the dialog. The variant is not silently switched |
| `AC-036K-CC-017` | `US-036K-CC-003` | A card is shown | The customer does nothing, or an add is attempted | Showing the card is not purchase intent. The Cart changes only from the authoritative mutation result | Price, assortment, stock, outlet, timing, fulfilment, and configuration checks stay with their existing authorities |
| `AC-036K-CC-018` | `US-036K-CC-004` | Several eligible Cart-absent parents exist, with configured relative priorities | The shelf renders | They appear in that deterministic priority, at most four cards | Fewer than four eligible parents produce fewer cards. No filler is added. The 8–12 pool is not enforced as a cap |
| `AC-036K-CC-019` | `US-036K-CC-004` | Four cards are visible and a further eligible parent exists beyond them | A visible card’s add succeeds | That card leaves and the next eligible parent can fill the slot | Focus and scroll are preserved. The list does not jump. Focus is not stolen. Accessible feedback still reports the result. Exact interaction is Experience Definition scope |
| `AC-036K-CC-020` | `US-036K-CC-005` | A card was valid when rendered and is stale at add time | The customer uses plus | The shelf re-reads effective-menu eligibility and does not treat the rendered card as a price or a purchase token. If the parent is no longer eligible, the card is excluded for ineligibility (`AC-036K-CC-011`), not removed as a successful add. A structurally invalid configuration is rejected by the existing Cart add. Assortment and availability stay evaluation-time authorities: this candidate does not add a shelf-only reject inside `addCartLine` | The client does not reconstruct a price or a recommendation-owned monetary total. A raw Cart add that existing Cart accepts is ordinary Cart authority and then hides the parent by membership |
| `AC-036K-CC-021` | `US-036K-CC-005` | The shelf is disabled, empty, unread, or its generation fails | The customer views the Cart, changes quantity, removes a line, applies an existing coupon, continues to Checkout, and pays | Those existing actions remain available | There is no compulsory upsell step. Shelf failure writes no Cart intent |
| `AC-036K-CC-022` | `US-036K-CC-006` | Actor has existing workforce authorization for the brand | They select effective-menu parent products, set relative display priority, and enable or disable a candidate or the whole shelf | Later shelf evaluations follow that configuration | About 8–12 curated products is guidance, not a stored maximum |
| `AC-036K-CC-023` | `US-036K-CC-006` | Actor lacks authorization, or the brand is outside their scope | They attempt a curation write | The write is denied | No other brand’s shelf changes |
| `AC-036K-CC-024` | `US-036K-CC-006` | A product is curated or the shelf is on | The operator disables the candidate or the shelf, or the product leaves the effective menu | The shelf stops offering it | Cart lines already added remain until ordinary Cart removal. Curation does not become a menu, catalog, price book, SKU list, availability list, campaign, coupon, promotion, or discount |
| `AC-036K-CC-025` | `US-036K-CC-007` | A shelf session occurs | Measurement is interpreted | An eligible shelf response, a shelf actually rendered to the customer, an explicit shelf action, and an authoritative successful Cart add initiated through the shelf are distinct. The response is not an exposure | A main-menu add is not a shelf add. A server response is not an impression. Attach rate uses the rendered shelf as its denominator and is not causal uplift. Selling price is not contribution margin |
| `AC-036K-CC-026` | `US-036K-CC-007` | A shelf-added item later appears on a purchased Order | Someone asks whether it counts as a shelf purchase | It counts only when actual provenance can be validated | This candidate authorizes no telemetry collection and no experiment or holdout. If durable purchased-unit provenance needs material schema, that is an architecture dependency (section 21), not the historical seven-event engine |

| Story / AC ID | Required behaviour / risk | Applicable test layers | Planned proof | Actual evidence / candidate / result |
|---|---|---|---|---|
| `US-036K-CC-001` / `AC-036K-CC-001`–`004` | One Cart placement; one menu; empty Cart | Component, domain, browser E2E under TEST-1 | Later Quality Plan. Not written here. | `NOT_EXECUTED` |
| `US-036K-CC-002` / `AC-036K-CC-005`–`014` | Parent exclusion, quantities, mixed lines, claim/reconcile | Domain, concurrency where claim/reconcile overlap, browser E2E | Later Quality Plan. | `NOT_EXECUTED` |
| `US-036K-CC-003` / `AC-036K-CC-015`–`017` | Direct add vs customization; no silent commercial choice | Domain, browser E2E | Later Quality Plan. | `NOT_EXECUTED` |
| `US-036K-CC-004` / `AC-036K-CC-018`–`019` | Priority, ceiling, focus | Component, accessibility, browser E2E | Later Quality Plan. Experience Definition supplies interaction proof. | `NOT_EXECUTED` |
| `US-036K-CC-005` / `AC-036K-CC-020`–`021` | Stale add; commerce continuity | Domain, browser E2E, failure injection | Later Quality Plan. | `NOT_EXECUTED` |
| `US-036K-CC-006` / `AC-036K-CC-022`–`024` | Curation allow/deny; Cart lines preserved | Domain, authorization | Later Quality Plan. | `NOT_EXECUTED` |
| `US-036K-CC-007` / `AC-036K-CC-025`–`026` | Measurement meanings; no activation | Plan review by Agent D; proof only after a plan exists | Measurement plan not authorized by this candidate. | `NOT_EXECUTED` |

## 11. Business rules

| Rule ID | User/business rule | Authority / rationale | Story / AC IDs |
|---|---|---|---|
| `BR-036K-CC-001` | The only V1 placement is Cart / Your Order, before Checkout and Payment. It is not an extra Checkout step. | Founder V1 contract | `US-036K-CC-001` / `AC-036K-CC-001` |
| `BR-036K-CC-002` | V1 does not place a recommendation module on Product Detail, Product Customization, Menu Discovery, Checkout Review, Payment, Confirmation, or My Orders. | Founder V1 contract | `AC-036K-CC-003` |
| `BR-036K-CC-003` | There is one authoritative menu. The shelf is a filtered presentation of existing effective-menu products. | VISION owned menu path; IMP-036F menu authority | `AC-036K-CC-004`, `AC-036K-CC-024` |
| `BR-036K-CC-004` | Curation stores stable parent-product references. Products, variants, modifiers, images, membership, prices, availability, and fulfilment stay with their existing authorities. | Founder V1 contract | `US-036K-CC-006` |
| `BR-036K-CC-005` | A curated product that leaves the effective menu or becomes ineligible disappears from the shelf. | Same menu and availability authorities | `AC-036K-CC-004`, `AC-036K-CC-011` |
| `BR-036K-CC-006` | A parent product is excluded while any of its variants is in the active Cart, whatever the add source. The key is the parent product id of the line’s variant, not the variant id alone, the quantity, or the source. | Founder V1 contract. Code: line is variant-scoped; parent is `catalog_variants.product_id` | `AC-036K-CC-005`–`008`, `AC-036K-CC-012` |
| `BR-036K-CC-007` | Shelf plus hides the card only after a successful Cart add. A failed add or a cancelled customization leaves the parent eligible. | Founder V1 contract | `AC-036K-CC-007`, `AC-036K-CC-010` |
| `BR-036K-CC-008` | Raising quantity, or lowering it while at least one unit remains, keeps the parent hidden. Removing the parent entirely makes it eligible to reappear. | Founder V1 contract | `AC-036K-CC-008`, `AC-036K-CC-009` |
| `BR-036K-CC-009` | Cart membership does not mutate the curated source list. “One place” compares the shelf with the Cart. The main menu still shows the product. | Founder V1 contract | `AC-036K-CC-006`, `AC-036K-CC-014` |
| `BR-036K-CC-010` | An empty Cart shows no shelf. | Founder V1 contract | `AC-036K-CC-002` |
| `BR-036K-CC-011` | Eligible Cart-absent parents display in deterministic configured priority. The next eligible parent fills a freed slot. No filler. | Founder V1 contract | `AC-036K-CC-018`, `AC-036K-CC-019` |
| `BR-036K-CC-012` | Plus direct-adds only when the projected menu row has no modifier groups, with the same payload the menu add already sends. Any modifier group opens existing customization. Plus does not invent or preselect a paid modifier, direct-add zero-price defaults ahead of that dialog, silently switch variants, or create a Cart mutation authority. | Founder V1 contract; `MenuItemRow` direct-adds only when `modifierGroups.length` is 0 | `AC-036K-CC-015`, `AC-036K-CC-016` |
| `BR-036K-CC-013` | Showing a recommendation is not purchase intent. Cart updates come from the authoritative mutation result. A failed mutation cannot remove the card or show success. The shelf cannot override price, assortment, stock, outlet, timing, fulfilment, or configuration checks, and it cannot invent a stronger add-time reject than the ordinary Cart add. A stale card is re-read against the effective menu before it is counted as a shelf success. Clients do not reconstruct prices or recommendation-owned totals. | ARCH-G11; `validateCartLineStructure` does not check assortment or availability; those remain evaluation-time authorities | `AC-036K-CC-017`, `AC-036K-CC-020` |
| `BR-036K-CC-014` | If the shelf is unavailable, the customer can still view the Cart, change quantities, remove items, apply existing coupons, continue to Checkout, and pay through existing Payment authority. There is no compulsory upsell step. | Founder V1 contract | `AC-036K-CC-021` |
| `BR-036K-CC-015` | Curation is performed by authorized business operators with existing workforce authorization and brand scope. No new role or permission is created unless a later Architecture Fit proves one is necessary and that permission is separately authorized. | Founder V1 contract; IMP-036F permission catalog is the existing workforce model, not a pre-selected mapping | `AC-036K-CC-022`, `AC-036K-CC-023` |
| `BR-036K-CC-016` | Enabling or disabling a candidate or the whole shelf changes later shelf presentation. It does not remove Cart lines. | Founder V1 contract | `AC-036K-CC-011`, `AC-036K-CC-024` |
| `BR-036K-CC-017` | Curating about 8–12 products is merchandising guidance so replacements exist. It is not a hard-coded limit. | Founder V1 contract | `AC-036K-CC-018`, `AC-036K-CC-022` |
| `BR-036K-CC-018` | At most four cards are visible. This is the proposed V1 acceptance rule, pending this candidate’s Product Definition Gate. It is not yet granted. | Founder direction, recorded here so the gate can accept or stop it | `AC-036K-CC-018` |
| `BR-036K-CC-019` | After reload, guest claim, or guest/customer reconcile, exclusion is recomputed from the authoritative resulting Cart. No separate pre-cart ordering-session identity is required. | Verified claim/reconcile behaviour, section 15 | `AC-036K-CC-013` |
| `BR-036K-CC-020` | Product measurement entitlement keeps four observations distinct: an eligible shelf response, a shelf actually rendered to the customer, an explicit shelf action, and a successful Cart addition initiated through the shelf. The response is a diagnostic and is not an exposure. Purchased-order survival still requires validated provenance. Cart-to-checkout and checkout-completion guardrails remain. A menu add is not a shelf add. A server response is not an impression and is not revenue. Attach rate uses the rendered shelf as its denominator and is not causal uplift. Selling price is not contribution margin. | Founder V1 contract; PD-2 measurement section. The measurement candidate names the response `M-CC-RSP` and the render `M-CC-01` | `AC-036K-CC-025`, `AC-036K-CC-026` |
| `BR-036K-CC-021` | This candidate does not authorize telemetry collection or experiment/holdout activation. Material schema for purchased-unit provenance is an architecture dependency, not a reason to import the previous assistance-correlation engine. | Founder V1 contract | `AC-036K-CC-026` |
| `BR-036K-CC-022` | V1 uses no user-behavior ranking, AI/ML, weight engine, per-user configuration, dismissal memory, category-gap inference, or source-to-target relationship types. | Founder V1 contract; section 23 and section 24 | `US-036K-CC-002`, `US-036K-CC-004` |
| `BR-036K-CC-023` | After a successful shelf add, preserve focus and scroll and provide accessible feedback. Do not jump the list or steal focus. | Founder V1 contract. Mechanism is Experience Definition scope | `AC-036K-CC-019` |
| `BR-036K-CC-024` | Bundle contents are not walked to invent extra parents. The parent is the catalog product that owns the variant on the Cart line. A component is excluded only when it is itself a Cart line. | Derived from the verified line model. Avoids an unspecified bundle explosion | `AC-036K-CC-012` |
| `BR-036K-CC-025` | Shelf eligibility follows the existing delivery ordering context only. No serviceable delivery outlet means no shelf and no new Cart or Checkout block. A Pickup checkout that leaves serviceable delivery coordinates in place can still produce a shelf, because Cart does not read `pickupOutletId` or fulfilment mode into the menu. That shelf is the delivery-current projection. It is not a Pickup availability or Pickup price promise. Whether V1 must hide that shelf when the active Checkout mode is Pickup is an unresolved Architecture Fit dependency. This candidate does not specify an implementation. `PICKUP_DELIVERY_COVERAGE = DECISION_REQUIRED` for that mixed case only. No shelf until a serviceable delivery outlet already exists. Pickup mode itself does not suppress the shelf. Cart cannot establish a Pickup outlet. No selector. Checkout stays unchanged. `UOE-DR-06` stays unauthorized. No random outlet, inferred Pickup destination, assumed availability, or unverified price is used. A brand-only menu price is not a shelf availability or price promise. | Source on `a6155378b799e06a95b28c593ac1a340d7ca9245`, recorded in the architecture-fit candidate. Coverage limitation plus one unresolved mixed case. Not a new outlet authority | `AC-036K-CC-011`, `AC-036K-CC-021` |

### Exclusion matrix (parent product × active Cart)

| Situation | Shelf result |
|---|---|
| Curated, eligible, absent from Cart | May appear |
| Added from the main menu | Hide that parent’s card |
| Added via shelf plus | Hide only after successful Cart add |
| Quantity increased | Stay hidden |
| Quantity reduced and at least one unit remains | Stay hidden |
| Product removed entirely | Eligible to reappear only if still curated, on the effective menu, and available |
| Add fails or customization cancelled | Stay eligible |
| Unavailable | Exclude |
| No longer curated, or shelf disabled | Exclude |
| Cart reload, claim, or reconcile | Recompute from authoritative Cart membership |

## 12. Journey Completeness Matrix

| Journey dimension | `JOURNEY-036K-CC-CART` | `JOURNEY-036K-CC-CURATION` |
|---|---|---|
| ENTRY | Open Cart / Your Order, including a direct visit to that page. `AC-036K-CC-001` | Open the existing workforce commercial surface once Architecture Fit names it. `AC-036K-CC-022` |
| DISCOVERY | Shelf is on the Cart, before Checkout. No other V1 placement. `AC-036K-CC-003` | Operator finds curation with the brand’s existing commercial tools. Exact navigation is Experience Definition scope. |
| CONTEXT | Brand, guest or customer Cart, effective menu, and shelf eligibility from the existing delivery ordering context only. No serviceable delivery outlet means no shelf. A Pickup checkout that leaves those coordinates in place can still show the delivery-current shelf. Hiding that shelf because Checkout mode is Pickup is unresolved. Signed-in, returning, saved-address, and scheduled journeys do not create a different Cart outlet. `AC-036K-CC-011`, `AC-036K-CC-013`, `BR-036K-CC-025` | Brand scope from server-derived workforce authorization. `AC-036K-CC-023` |
| EMPTY / FIRST USE | Empty Cart: no shelf. Enabled shelf with zero eligible cards: no filler. `AC-036K-CC-002`, `AC-036K-CC-018` | No curation yet: shelf offers nothing. Ordering is unchanged. |
| HAPPY PATH | See, explicit add, card leaves, next candidate may fill. `AC-036K-CC-001`, `AC-036K-CC-007`, `AC-036K-CC-019` | Save selection, priority, and enables. `AC-036K-CC-022` |
| ALTERNATE VALID PATHS | Ignore the shelf. Add the same parent from the main menu. Open customization when required. `AC-036K-CC-006`, `AC-036K-CC-016`, `AC-036K-CC-021` | Disable one candidate or the whole shelf. `AC-036K-CC-024` |
| VALIDATION FAILURE | A stale card is re-read. Ineligibility excludes the card. Structural Cart rejection leaves an still-eligible card. No shelf-only `addCartLine` reject. `AC-036K-CC-020` | A reference to a product that is not an eligible parent for this brand is not a shelf product. `AC-036K-CC-024` |
| AUTHORIZATION | Customer acts only on their Cart. `AC-036K-CC-017` | Unauthorized and cross-brand writes denied. `AC-036K-CC-023` |
| NOT FOUND / STALE REFERENCE | Left the menu, unavailable, or no longer curated: card gone. Stale add revalidated. `AC-036K-CC-004`, `AC-036K-CC-020` | Disabled or unknown candidate does not affect Cart lines. `AC-036K-CC-024` |
| SERVER / NETWORK ERROR | Shelf failure leaves Cart actions. Failed add is not success. `AC-036K-CC-010`, `AC-036K-CC-021` | Denied or failed save does not claim the shelf changed. |
| RECOVERY | Customer continues Cart, coupon, Checkout, Payment. `AC-036K-CC-021` | Operator retries with existing authorization. No new retry policy. |
| CONCURRENCY | Overlapping add and shelf render: the authoritative Cart result wins. Claim/reconcile recomputes. `AC-036K-CC-013`, `AC-036K-CC-017` | Overlapping operator saves follow existing commercial-configuration concurrency once Fit names it. This candidate invents no new lock protocol. |
| DESTRUCTIVE ACTION | Removing the last unit can let the parent return. That removal is ordinary Cart removal. `AC-036K-CC-009` | Disabling curation is not Cart deletion. `AC-036K-CC-024` |
| SUCCESS FEEDBACK | Successful add matches the authoritative Cart result, without stealing focus. `AC-036K-CC-019` | Operator sees the saved configuration. Copy is Experience Definition scope. |
| DOWNSTREAM EFFECT | Checkout, Payment, coupons, and the main menu keep their current behaviour. `AC-036K-CC-021` | Customer shelf changes on a later evaluation. |
| REVISIT / RELOAD | Recompute from Cart membership and current curation. `AC-036K-CC-013` | Saved curation remains until an authorized change. |
| RESPONSIVE / MOBILE | Same rules on the viewports the Cart already supports. Layout is Experience Definition scope. | Same for the operator surface. |
| ACCESSIBILITY | Focus, scroll, and accessible result feedback. `BR-036K-CC-023` | Existing workforce accessibility expectations. No new exception. |

## 13. UX state matrix

Presentation detail belongs in the Experience Definition. These rows are observable product states.

| Surface / state | Entry condition | Visible feedback / available actions | Focus / keyboard behaviour | Next / recovery state | AC ID or N/A reason |
|---|---|---|---|---|---|
| Cart shelf / ready | Non-empty Cart, eligible cards | 1–4 cards, plus on each, Checkout still available | Plus is an explicit control. Focus stays with the customer | Add, ignore, or Checkout | `AC-036K-CC-001` |
| Cart shelf / empty Cart | No lines | No shelf | Existing Cart empty behaviour | Add from the menu | `AC-036K-CC-002` |
| Cart shelf / no eligible card | Shelf on, nothing eligible | No filler cards | Cart controls unchanged | Remains absent until eligibility exists | `AC-036K-CC-018` |
| Cart shelf / loading | Cart page waiting on shelf data | Cart lines remain usable. Shelf must not block Checkout on its own failure | Existing Cart focus | Ready, empty, or failed | `AC-036K-CC-021` |
| Cart shelf / add success | Authoritative add succeeded | Card leaves; Cart shows the new line; next card may appear | Do not steal focus or jump the list | Updated shelf | `AC-036K-CC-019` |
| Cart shelf / customization | The projected row has any modifier group | Existing customization | Existing customization focus | Success hides the parent; cancel keeps the card | `AC-036K-CC-016`, `AC-036K-CC-010` |
| Cart shelf / validation failure | Structural Cart rejection, or the parent is no longer eligible | No false success. An still-eligible parent keeps its card. An ineligible parent is excluded | Focus remains available to the Cart | Customer may retry or continue | `AC-036K-CC-020` |
| Cart shelf / unavailable feature | Shelf disabled or failed | No shelf. Cart, coupon, Checkout, Payment remain | Unchanged Cart keyboard path | Continue the order | `AC-036K-CC-021` |
| Curation / saved | Authorized brand write | Candidates, priority, and shelf switch match the save | Existing workforce patterns | Later customer evaluation | `AC-036K-CC-022` |
| Curation / denied | Missing authorization or wrong brand | No change claimed | Focus stays on the operator task | No write | `AC-036K-CC-023` |

Pending mutation: the card stays until the authoritative result returns. Concurrency conflict: the
authoritative Cart wins. Destructive confirmation: Cart removal uses existing Cart confirmation,
if any; this candidate adds none.

## 14. Permissions / resource context

| Action | Existing identity / permission authority | Resource context / server-derived scope | Allowed / denied / cross-scope variants | AC IDs |
|---|---|---|---|---|
| Read the shelf | Customer Cart and effective-menu read for that brand | The active Cart (guest credential or customer user) and brand | Own Cart only. Another customer’s Cart is not a shelf source | `AC-036K-CC-001`, `AC-036K-CC-013` |
| Add from the shelf | Existing customer Cart mutation | Brand, variant, configuration already accepted by Cart | The shelf may submit only a configuration the ordinary Cart add already accepts. It does not add a shelf-only reject. A parent that is no longer eligible is not shown as a shelf success | `AC-036K-CC-015`, `AC-036K-CC-020` |
| Curate the shelf | Existing workforce authorization and brand scope. Permission **name is not chosen here** | Server-derived brand. Caller-supplied brand is not authority (ARCH-G08) | In-scope operator allowed. Unauthorized denied. Cross-brand denied | `AC-036K-CC-022`, `AC-036K-CC-023` |
| Continue Checkout / Payment | Existing Checkout and Payment authority | Unchanged | Shelf state does not grant or remove them | `AC-036K-CC-021` |

IMP-036F already separates persona from permission and uses brand-scoped commercial permissions
such as `menu.manage` and `catalog.manage` ([capability](../../capabilities/IMP-036F-catalog-menu-pricing-promotions-management.md)).
This candidate does not assign curation to one of those names. Architecture Fit either maps the
write to an existing permission or stops for a separate authorization. A new role or permission is
not part of V1 unless that proof and authorization exist.

## 15. Data implications

**Verified in this worktree (base `a6155378b799e06a95b28c593ac1a340d7ca9245`).**

| Fact | Evidence | Product use |
|---|---|---|
| A Cart line is variant-scoped. `cart_lines.variant_id` references `catalog_variants.id`. The line has quantity and no product-id column. | `src/platform/database/schema/cart.ts` | Exclusion cannot key off the line alone. |
| The parent product is `catalog_variants.product_id`, referencing the catalog product. | `src/platform/database/schema/catalog.ts` | Stable parent identity for curation and exclusion. |
| Cart owner is customer XOR guest. At most one customer Cart per brand. | `carts_owner_xor_check`, `carts_customer_brand_uidx` in `cart.ts` | “Active Cart” is that brand’s authoritative Cart. |
| Guest claim, when no customer Cart exists, keeps the same `cartId`, sets the customer owner, and clears the guest credential. Lines are not rewritten by claim. | `src/server/cart/claim.ts` `claimGuestCart` | Recompute exclusion from the same lines under the customer owner. |
| If a customer Cart already exists, claim returns a reconciliation conflict. Reconcile keeps the customer Cart, deletes the guest Cart, and coalesces lines under existing Cart authority. | `claimGuestCart` conflict; `reconcileGuestCartWithCustomer` | Recompute from the surviving customer Cart. Do not invent a second merge rule. |
| Client claim entry is `POST /api/v1/cart/claim`. Reconcile entry exists beside it. | `src/lib/customer-commerce/cart.ts` | Identity transition is an existing Cart operation, not a new session type. |

Curation inputs are parent-product references, enabled/disabled flags, relative priority, and a
shelf-level enabled flag. Outputs are the visible cards. Persistence shape, including whether a
new table is required, is Architecture Fit. This candidate does not define schema.

Reload expectation: every shelf evaluation uses current curation, current effective menu, and
current Cart lines. Historical purchased commerce stays on the Checkout Snapshot (ARCH-G05). The
shelf does not own monetary totals.

**Provenance dependency.** Counting a purchased unit as shelf-initiated requires actual
provenance. If that cannot be done with existing Cart, Checkout, and Order facts, material schema
is an unresolved architecture dependency. It is not authorized here, and it is not the historical
seven-event engine.

## 16. Security/privacy

CR2 abuse overlay (PD-2). This is a risk review inside existing security authority.

| Case | Required outcome | AC |
|---|---|---|
| Honest customer | Sees only eligible products and must explicitly add. Ignore still orders. | `AC-036K-CC-017`, `AC-036K-CC-021` |
| Malicious customer | Cannot force a price, a paid modifier, or a silent variant switch from a card. Cannot make an ineligible product appear on the shelf. A replayed raw Cart add is ordinary Cart authority, then parent membership hides the card. | `AC-036K-CC-017`, `AC-036K-CC-020` |
| Unauthorized workforce | Curation write denied. | `AC-036K-CC-023` |
| Cross-brand | Server-derived brand. No cross-brand shelf edit or shelf read of another brand’s Cart. | `AC-036K-CC-023` |
| Replay / forgery | A stale card is not a capability token or a price token. Replay of the ordinary Cart add follows existing Cart rules. | `AC-036K-CC-020` |
| Enumeration | Shelf does not list products the effective menu would hide from that customer context. | `AC-036K-CC-004` |
| Financial abuse | No client price, no recommendation total, no coupon created by the shelf, no payment bypass. | `AC-036K-CC-017`, `AC-036K-CC-021` |
| Identity abuse | Guest and customer Carts stay on existing claim/reconcile. No new pre-cart identity. | `AC-036K-CC-013` |
| Race or cap bypass | Four-card ceiling is a presentation cap. It is not a purchase quota. Concurrent adds resolve through Cart authority. | `AC-036K-CC-018`, `AC-036K-CC-013` |
| Leakage / PII | Measurement entitlement includes no payment, eligibility-secret, or security facts. No per-user ranking profile. | `AC-036K-CC-025` |

Customer and workforce trust stay distinct (ARCH-G04).

## 17. Concurrency/recovery

Overlapping shelf render and Cart mutation: the card hides only after the successful authoritative
result. A failed or in-flight mutation keeps the card eligible.

Duplicate plus activation: existing Cart idempotency or quantity rules apply. This candidate does
not define a new retry policy. Two successes that leave any unit of that parent in the Cart still
hide the parent once.

Guest claim and reconcile: section 15. Exclusion follows the Cart that those operations return.
A conflict or expiry uses existing Cart errors and does not invent a shelf-specific recovery Cart.

Operator save overlapping a customer read: the customer’s next evaluation uses the curation that
is durably visible. The in-flight page must not treat its old cards as purchase tokens
(`AC-036K-CC-020`).

Partial shelf failure: Cart, coupon, Checkout, and Payment remain (`AC-036K-CC-021`).

## 18. Accessibility/responsive expectations

The shelf uses the same viewport and input conditions as Cart / Your Order. Plus has an accessible
name. Success, failure, and card removal are announced without moving focus or scrolling the list
away from the customer (`BR-036K-CC-023`). Keyboard users can reach plus, skip the shelf, and reach
Checkout. Proof is manual accessibility and responsive evidence under TEST-1, specified later in
the Quality Plan and Experience Definition. An automated scan alone is not acceptance.

## 19. Observability/supportability if applicable

A support explanation needs to distinguish “the shelf was off, empty, or failed” from “the Cart
mutation failed” and from “Checkout or Payment failed.” It also needs to distinguish a server
shelf response from a shelf the customer actually saw. Existing Cart and Payment diagnostics
remain the authorities for those failures. This candidate does not add a telemetry pipeline.
Agent D’s measurement plan, when authorized, is the place for event names, privacy, and retention.
Until then, supportability is: the customer can still order, and the operator can turn the shelf
off (`AC-036K-CC-021`, `AC-036K-CC-024`).

## 20. Golden Journeys affected

| GJ ID / registry status | Affected steps / downstream behaviour | Mandatory for this acceptance? | Related story / AC IDs | Required proof / actual evidence |
|---|---|---|---|---|
| `GJ-FIRST-ORDER` / `CURRENT` | Cart step may show the shelf. Checkout and Payment stay the same path. | YES. The journey must succeed with the shelf present, empty, or failed. | `US-036K-CC-001`, `US-036K-CC-005` | Real-browser proof under TEST-1 after implementation. `NOT_EXECUTED` |
| `GJ-AVAILABILITY` / `CURRENT` | Unavailable products leave the shelf on the next evaluation. | YES | `AC-036K-CC-004`, `AC-036K-CC-011` | `NOT_EXECUTED` |
| `GJ-PRODUCT-MENU-LAUNCH` / `CURRENT` | Shelf reads the effective menu. It does not publish a second one. | YES | `AC-036K-CC-004`, `AC-036K-CC-024` | `NOT_EXECUTED` |
| `GJ-PAYMENT-RECOVERY` / `CURRENT` | Payment retry stays available when the shelf fails. | YES as a non-regression | `AC-036K-CC-021` | `NOT_EXECUTED` |
| `GJ-RETURNING-ORDER` / `PARTIAL` | No Order Again shortcut is added. | NO | N/A — registry journey is not this slice | N/A |

Registry status is not a test verdict.

## 21. Dependencies

| Dependency | Authority / verified state | Required before which story or gate? | Unresolved impact |
|---|---|---|---|
| ROADMAP/STATE lifecycle | GTM-R190 / STATE-R189. IMP-036K not implementation-authorized | Any implementation | Implementation stays unauthorized |
| New Product Definition Gate | Not performed | All stories | Gate not granted |
| New Experience Definition and Experience Gate | Candidate `XD-IMP-036K-V1-CURATED-CART-CANDIDATE-1` exists. Gate `NOT_GRANTED` | Before Architecture Fit lock and implementation authorization | Blocks implementation |
| Architecture Fit for the narrowed shelf | Historical IMP-036K lock is the previous scope | Before implementation; maps curation storage and permission | Blocks implementation. May require a separate permission authorization |
| Existing menu, catalog, price, availability, fulfilment | IMP-036F and later accepted authorities | `US-036K-CC-001`, `US-036K-CC-003`, `US-036K-CC-006` | None if reused unchanged |
| Existing Cart add, claim, reconcile | Verified in this worktree, section 15 | `US-036K-CC-002`, `US-036K-CC-003` | None if exclusion only reads the result |
| Purchased-unit provenance | Not verified as already durable for a shelf source | `US-036K-CC-007` only if assisted-purchase counts are required | Architecture dependency if material schema is needed. Not a Founder product question in this candidate |
| Measurement plan | Agent D. Not authorized here | X3 implementation authorization under PD-2 | Blocks implementation authorization, not this draft |
| Quality / Test Plan, Design Readiness | Not performed for this candidate. Historical PASS does not transfer | Implementation authorization | Blocks implementation |
| D-383 | CURRENT for identity, activation, sequencing, parallel definition | None for this draft’s identity | Amendment not required. Optional future D-385 note |
| PR #465 / B3S-M1 journey credential | Not present as an in-tree identifier (`NOT_FOUND` in this worktree). PR remains historical | Not a V1 prerequisite | Proposed supersession only. Do not close the PR |

## 22. Supported now

| Behaviour | Existing verified or V1 acceptance commitment? | Story / AC IDs / source |
|---|---|---|
| Menu, Cart, customization when required, coupons, Checkout, Payment | Existing verified commerce. This candidate commits that they survive the shelf | `AC-036K-CC-021`; current Golden Journeys |
| Guest Cart claim and guest/customer reconcile | Existing verified Cart authority | Section 15; `AC-036K-CC-013` |
| Cart shelf of curated, eligible, Cart-absent parents, max four visible | V1 acceptance commitment of this **candidate**. Not accepted until gates pass | `US-036K-CC-001`–`004` |
| Operator curation of parent products, priority, enable/disable | V1 acceptance commitment of this candidate. Not accepted until gates pass | `US-036K-CC-006` |
| Measurement meanings in `AC-036K-CC-025` | Entitlement only. Collection is not supported now | `US-036K-CC-007` |

## 23. Explicitly deferred

| `EXPLICITLY_DEFERRED` behaviour | FOLLOW_UP or DEFERRED | Reason / consequence | Revisit dependency / decision owner |
|---|---|---|---|
| Pre-cart guest ordering-session identity | DEFERRED | The active Cart already identifies the guest or customer basket. V1 exclusion does not need a session before the Cart. | Future product decision. No activation implied |
| B3S-M1 journey credential | DEFERRED | Proposed supersession only: V1 uses Cart membership, not that credential. PR #465 stays historical and is not closed. In-tree text for the ID was `NOT_FOUND`. | Future decision. Next free register ID is D-385 if a decision is wanted. Not drafted here |
| Holdout design and experimental allocation | DEFERRED | Not activated. Acceptance does not depend on a live holdout. | Future experiment authorization under PD-2 measurement rules |
| AI/ML ranking and personalization | DEFERRED | V1 order is configured priority among eligible Cart-absent parents. | Future product and architecture decision |

## 24. Not supported by design

| `NOT_SUPPORTED_BY_DESIGN` behaviour | Reason / authority | User-visible boundary / relevant AC |
|---|---|---|
| Product Detail complementary recommendations | Founder V1 contract. `REMOVE_FROM_V1` | No module on Product Detail. `AC-036K-CC-003` |
| Customization variant/add-on recommendation module | `REMOVE_FROM_V1`. Existing customization still opens when a product requires options | `AC-036K-CC-003`, `AC-036K-CC-016` |
| Cart category-gap inference | `REMOVE_FROM_V1` | Shelf contents come from the curated list, not from missing categories |
| Product/category source-to-target relationship types | `REMOVE_FROM_V1`. Replaced by a curated parent-product reference list | `AC-036K-CC-022` |
| Complex operator recommendation relationships | `REMOVE_FROM_V1` | Operator actions are select, priority, enable, disable |
| User/session suppression after the customer dismisses a card | `REMOVE_FROM_V1`. Exclusion is Cart membership | Removing the product from the Cart can let it return. `AC-036K-CC-009` |
| Previous multi-stage assistance-correlation engine | `REMOVE_FROM_V1` | `AC-036K-CC-025` |
| Recommendation-specific durable issued-set / presentation schemas | `REMOVE_FROM_V1` | No issued-set is a V1 product object |
| Popular treatment and the 30-day/30-order rule | `REMOVE_FROM_V1` | No popularity claim |
| Commercial contribution-based ranking | `REMOVE_FROM_V1` | Priority is the operator’s relative order |
| A second menu, catalog, price book, SKU, availability list, campaign, coupon, promotion, or discount | Founder V1 contract | `AC-036K-CC-024` |
| Per-user configuration, behaviour ranking, weight engine | Founder V1 contract | `BR-036K-CC-022` |
| Compulsory upsell step | Founder V1 contract | `AC-036K-CC-021` |
| A Cart outlet selector, or treating Pickup mode itself as suppressing the shelf | Current Cart menu authority selects an outlet only from delivery serviceability. Pickup outlet selection stays on Checkout. V1 does not add a selector and does not block ordering while context is missing. Pickup mode does not by itself remove a delivery-current shelf | No shelf until that delivery outlet already exists. The mixed Pickup-checkout case is `DECISION_REQUIRED`. `BR-036K-CC-025`, `AC-036K-CC-011` |

### Disposition of historical scope

| Historical item | Disposition | Why |
|---|---|---|
| Product Detail complementary recommendations | `REMOVE_FROM_V1` | V1 has one placement, on Cart / Your Order. Product Detail is not a shelf surface. |
| Customization variant/add-on recommendation module | `REMOVE_FROM_V1` | Customization is not a recommendation module. It still opens when a shelf or menu product requires options. |
| Cart category-gap inference | `REMOVE_FROM_V1` | The shelf does not infer missing categories. Operators choose parent products. |
| Product/category source-to-target relationship types | `REMOVE_FROM_V1` | Those types are replaced by a curated parent-product reference list. |
| Complex operator recommendation relationships | `REMOVE_FROM_V1` | Operator work is select, enable/disable, relative priority, and a shelf switch. |
| Pre-cart guest ordering-session identity | `DEFER_TO_FUTURE_SCOPE` | It is not a V1 prerequisite. Exclusion uses the active Cart. |
| B3S-M1 journey credential | `DEFER_TO_FUTURE_SCOPE` | Proposed supersession only. This candidate does not close PR #465. |
| User/session-based suppression after recommendation removal | `REMOVE_FROM_V1` | Hiding follows Cart membership, not dismissal memory. |
| Previous multi-stage assistance-correlation engine | `REMOVE_FROM_V1` | V1 measurement is the entitlement in `US-036K-CC-007`, specified later by Agent D. |
| Recommendation-specific durable issued-set/presentation schemas | `REMOVE_FROM_V1` | V1 does not require a stored issued set to render the shelf. |
| Popular treatment and 30-day/30-order rule | `REMOVE_FROM_V1` | No popularity treatment is in this V1. |
| Commercial contribution-based ranking | `REMOVE_FROM_V1` | Order is configured relative priority. Selling price is not a rank or a margin. |
| Holdout design and experimental allocation | `DEFER_TO_FUTURE_SCOPE` | Not activated. No experiment is authorized by this candidate. |
| AI/ML ranking and personalization | `DEFER_TO_FUTURE_SCOPE` | Not in V1. Deterministic configured priority is the V1 order. |
| Durable purchased-unit provenance if it needs material schema | `DEPENDENCY_REVIEW_REQUIRED` | The product rule is “count only when provenance is real.” Whether that needs schema is Architecture Fit, not an imported seven-event design. |

## 25. Unresolved / decision required

| `UNRESOLVED_DECISION_REQUIRED` item | Material user/business impact | Decision owner / evidence needed | Affected stories / gate |
|---|---|---|---|
| Mixed case only: Pickup checkout while serviceable delivery coordinates remain | Cart can still show the delivery-current shelf. Whether V1 must hide it when the active Checkout mode is Pickup is unresolved. `PICKUP_DELIVERY_COVERAGE = DECISION_REQUIRED` for this case only. No implementation is specified here. | Architecture Fit. Not a new Cart outlet selector and not a Checkout change. | `BR-036K-CC-025`. Gate `NOT_PERFORMED` |
| Four-card ceiling | The four-card visible ceiling is recorded as the proposed acceptance rule (`BR-036K-CC-018`), pending this candidate’s gate. The 8–12 pool is guidance. No second Founder decision is opened for that ceiling. | Product Definition Gate, when a human runs it | Gate `NOT_PERFORMED` |

| Assumption class | Item | Evidence | Risk | Validation |
|---|---|---|---|---|
| `FACT` | Cart line variant id; parent via `catalog_variants.product_id`; claim vs reconcile | Section 15, this worktree | Low if those schemas remain | Architecture Fit re-reads them |
| `FACT` | Lifecycle versions in section 1 | ROADMAP GTM-R190, STATE STATE-R189, DR-25 | Candidate must not be treated as authority | Gates |
| `SUPPORTED_EVIDENCE` | CR2 proposal | Section 1 paragraph | Coordinator may record a different CR below CR3 | Coordinator reconciliation |
| `PRODUCT_DECISION` | Four-card ceiling | Founder direction, written as a proposed rule | Gate may stop the candidate | Product Definition Gate |
| `HYPOTHESIS` | None that V1 behaviour depends on | — | — | — |

D-383 amendment is not required for identity or sequence. A future decision, ID **D-385** if still
free, may record scope narrowing. Register text is not drafted here.

### 25a. Service and operational impact

The customer promise is that the shelf is optional. Store and support operations do not gain a new
order-handling step. An authorized brand operator maintains the list with the brand’s existing
commercial operations. If the shelf is wrong, turning it off is the operational recovery this
candidate defines; Cart and Payment recovery stay on their current journeys.

### 25b. Quality Attribute Profile

| Attribute | Mark | Reason |
|---|---|---|
| Performance | `REQUIRED` | Shelf evaluation must not become a reason the customer cannot reach Checkout. Budget belongs in the Quality Plan. |
| Availability | `REQUIRED` | Shelf failure leaves Cart, Checkout, and Payment available. |
| Reliability | `REQUIRED` | Hide-on-success and keep-on-failure must be repeatable. |
| Resilience | `REQUIRED` | Stale cards and partial failure recover through existing commerce. |
| Security | `REQUIRED` | Section 16. |
| Privacy | `REQUIRED` | No per-user profile. Measurement must not collect payment or security facts under this candidate. |
| Accessibility | `REQUIRED` | Section 18. X3 purchase journey. |
| Responsive/device support | `REQUIRED` | Same Cart viewports the customer already uses. |
| Scalability | `N/A` | V1 shows at most four cards from a small curated list. No personalization index is in scope. |
| Concurrency | `REQUIRED` | Section 17. |
| Data integrity | `REQUIRED` | Parent identity, one menu, no client prices. |
| Observability | `REQUIRED` | Distinguish shelf failure from Cart and Payment failure. Event schema waits for Agent D. |
| Supportability | `REQUIRED` | Section 19. Shelf can be turned off. |
| Backward compatibility | `REQUIRED` | Menu, Cart, coupons, Checkout, and Payment remain usable with the shelf absent. |
| Localization/presentation | `REQUIRED` | LANG-1. This candidate does not add a locale or customer-facing acceptance strings. |

### 25c. Quality, measurement, Design Readiness, and Production Readiness

| Expectation | Status |
|---|---|
| Quality / Test Plan | Candidate `QT-IMP-036K-V1-CURATED-CART-CANDIDATE-1` exists and is not finalized. TEST-1 proof is `NOT_EXECUTED`. |
| Measurement intent | Entitlement is `US-036K-CC-007`. Candidate `MI-IMP-036K-V1-CURATED-CART-CANDIDATE-1` is not finalized. No collection is authorized. |
| Design Readiness dependency | Required for X3 after Architecture Fit and Experience Gate, before implementation authorization. Historical Design Readiness PASS does not transfer. |
| Production Readiness applicability | Not applicable to this candidate. A later release would need the shelf switch, rollback of curation, and proof that Cart and Payment work with the shelf off. Those checks are not claimed here. |
| Experience requirement IDs | `XR-036K-CC-001` through `XR-036K-CC-005` live in the ungated Experience candidate. They are not granted here. |

## 26. Definition of Ready

| Story ID | Applicable fields complete / evidence | Open material decisions | Readiness / blocker |
|---|---|---|---|
| `US-036K-CC-001` | Section 9 fields written in this candidate | NONE inside the story | `NOT_READY_FOR_IMPLEMENTATION`. Gates, Experience Definition, Architecture Fit, Design Readiness, Quality Plan, and implementation authorization are absent. |
| `US-036K-CC-002` | Section 9 fields written | NONE | `NOT_READY_FOR_IMPLEMENTATION`. Same blockers. |
| `US-036K-CC-003` | Section 9 fields written | NONE | `NOT_READY_FOR_IMPLEMENTATION`. Same blockers. |
| `US-036K-CC-004` | Section 9 fields written | NONE. Four-card rule is proposed, not granted | `NOT_READY_FOR_IMPLEMENTATION`. Same blockers. |
| `US-036K-CC-005` | Section 9 fields written | NONE | `NOT_READY_FOR_IMPLEMENTATION`. Same blockers. |
| `US-036K-CC-006` | Section 9 fields written | NONE. Permission mapping is Architecture Fit | `NOT_READY_FOR_IMPLEMENTATION`. Same blockers. |
| `US-036K-CC-007` | Entitlement written. Plan is not | NONE as a Founder product question | `NOT_READY_FOR_IMPLEMENTATION`. Measurement plan and provenance dependency remain. |

`STORY_COMPLETE != IMP_ACCEPTED`. This candidate completes no story.

## 27. Product Definition Gate

```text
PRE-GATE DRAFT:
PRODUCT_DEFINITION_GATE_EXECUTION = NOT_PERFORMED
Gate Result: NOT_PERFORMED

PRODUCT_DEFINITION_GATE

Capability: IMP-036K Revenue Recommendations — curated Cart shelf V1 candidate
Product Definition Version: PD-IMP-036K-V1-CURATED-CART-CANDIDATE-1
Experience Criticality: X3
Change Risk: CR2 proposed; coordinator reconciles
Linked Experience Definition: XD-IMP-036K-V1-CURATED-CART-CANDIDATE-1 (NOT_GRANTED)
Business Outcome: section 2
Primary Personas: PERSONA-CUSTOMER, PERSONA-WORKFORCE-OPERATOR
Journeys Defined: YES (candidate)
Story Map Complete: YES (candidate)
Acceptance Slice Defined: YES (candidate)
Happy Paths Defined: YES
Alternate Paths Defined: YES
Empty / First-Use States Defined: YES
Error / Recovery Paths Defined: YES
Authorization Variants Defined: YES
Cross-Scope Scenarios Defined: YES
Concurrency Considered: YES
Destructive Actions Defined: YES
Service / operational impact: section 25a
Quality Attribute Profile: section 25b
Unresolved Product Decisions: NONE
Architecture Conflicts: NONE recorded against ARCH-R23 global invariants. Historical IMP-036K capability architecture does not match this narrowed scope and must not be reused as fit.
PRODUCT_DEFINITION_GATE_EXECUTION: NOT_PERFORMED
Gate Result: NOT_PERFORMED
```

`NOT_PERFORMED` means no evaluation has occurred. It is not `PASS` and not `STOP`.
