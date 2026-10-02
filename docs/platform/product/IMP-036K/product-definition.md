<!-- governance-meta
{
  "status": "APPROVED",
  "authority": "PRODUCT_DEFINITION",
  "capability": "IMP-036K",
  "productDefinitionVersion": "PD-IMP-036K-DRAFT-1",
  "productDefinitionStatus": "APPROVED",
  "productDefinitionGate": "PASS",
  "architectureFit": "PASS",
  "implementationAuthorized": false
}
-->

# IMP-036K — Revenue Recommendations

```text
PRODUCT_DEFINITION_VERSION = PD-IMP-036K-DRAFT-1
STATUS = APPROVED
AUTHORITY = PRODUCT_DEFINITION
PRE_GATE_DRAFT = NO
DRAFT_READY_FOR_GATE = NO
APPROVED = YES
PRODUCT_DEFINITION_GATE_EXECUTION = PERFORMED
PRODUCT_DEFINITION_GATE = PASS
IMP036K_PRODUCT_DEFINITION = PD-IMP-036K-DRAFT-1
IMP036K_PRODUCT_DEFINITION_STATUS = APPROVED
IMP036K_PRODUCT_DEFINITION_GATE = PASS
INDEPENDENT_PRODUCT_DEFINITION_GATE = PASS
ARCHITECT_REVIEW = 5380398013
GATE_EVALUATED_HEAD = 072932df00c445c8215c61f19f81971bf657b160
GATE_EVALUATED_TREE = a4912e6c649cad25094412ac07a005fbb441567e
CANONICAL_PATH = /home/ajoshi/repos/boba-bear-platform
EVALUATED_BRANCH = docs/imp036k-product-experience-definition
EVALUATED_HEAD = 072932df00c445c8215c61f19f81971bf657b160
EVALUATED_TREE = a4912e6c649cad25094412ac07a005fbb441567e
EVALUATED_WORKING_TREE_FINGERPRINT = f2886ed726c77301589ba36dccd602da6d44daadd7a0f2dec4e59aada3162c46
ARCHITECTURE_FIT = PASS
ARCHITECTURE_LOCKED = YES
ARCHITECTURE_FIT_SOURCE = IMP-036K-FIT-CANDIDATE-1
ARCHITECTURE_FIT_REVIEW = 5391917727
DESIGN_READINESS = NOT_PERFORMED
QUALITY_TEST_PLAN = NOT_PERFORMED
MEASUREMENT_PLAN = NOT_PERFORMED
IMPLEMENTATION_PLAN = NOT_PERFORMED
IMPLEMENTATION_AUTHORIZED = NO
IMPLEMENTATION_STARTED = NO
IMP036K_NEXT_GATE = DESIGN_READINESS
FOUNDER_UAT = NOT_PERFORMED
IMP036K_ACCEPTED = NO
OPEN_PRODUCT_DECISIONS = NONE
LIFECYCLE_RECONCILIATION = NOT_PERFORMED

PRODUCT_DELIVERY_PROCESS_EFFECTIVE_FROM = IMP-036F
HISTORICAL_ACCEPTED_IMPS_REWRITTEN = NO
IMP036E_LIFECYCLE_CHANGED = NO
PD1_DID_NOT_ACTIVATE_IMP036F_AT_ADOPTION = YES
```

This document is the approved Product Definition for **IMP-036K — Revenue Recommendations**.
The version remains `PD-IMP-036K-DRAFT-1`. Architect review `5380398013` performed the Product
Definition Gate against exact candidate branch `docs/imp036k-product-experience-definition`,
HEAD `072932df00c445c8215c61f19f81971bf657b160`, tree
`a4912e6c649cad25094412ac07a005fbb441567e`, and working-tree fingerprint
`f2886ed726c77301589ba36dccd602da6d44daadd7a0f2dec4e59aada3162c46`, and returned PASS. That
fingerprint is the evaluated candidate fingerprint. It is not the fingerprint of this persistence
pull request. That gate persistence did not itself perform Architecture Fit. Architect review `5391917727` is the current Architecture Fit PASS and the lock from `IMP-036K-FIT-CANDIDATE-1`. Historical PASS `5384137705` was later reopened by `5385458836` and is not the current lock source. Design Readiness remains unperformed. Implementation stays unauthorized. The slice is not accepted.

```text
PRODUCT DEFINITION
= entitlement, observable behaviour, eligibility, constraints, supported/denied outcomes

EXPERIENCE DEFINITION
= presentation, hierarchy, interaction, content/language, trust, recovery experience
```

Product acceptance may point at the linked Experience Definition for approved presentation.
It does not copy that document's exact customer wording. Experience Gate PASS is recorded on
the linked Experience Definition from the same Architect review. It is not Design Readiness.

Canonical lifecycle truth stays in [`ROADMAP.md`](../../ROADMAP.md) and [`STATE.md`](../../STATE.md).
Shared governance persistence stays serialized under D-383. This gate persistence does not make
IMP-036K the current implementation slice.

Discovery sources are Founder-approved source material only:

- [`docs/platform/discovery/revenue-recommendations.md`](../../discovery/revenue-recommendations.md)
- [`docs/platform/discovery/revenue-recommendations-story-map.md`](../../discovery/revenue-recommendations-story-map.md)
- RRD-01 through RRD-08, recorded 2026-09-26 as `FOUNDER_APPROVED_DISCOVERY_DIRECTION`

Those sources are not Product Definition approval, not a gate result, and not architecture.

```text
SOURCE_MAIN = bd4ce6edfde83f22a9fb7bfc1d933fa8c52cd4d3
SOURCE_TREE = 278eedb163219ab2a5cf440264793ea00078ebe5
EVALUATED_SOURCE_MAIN = 24d424dbd22ee53cb3bbadec484bec3925b6e898
EVALUATED_SOURCE_TREE = 59842dfdb68b1733899f7544b0aab5f49437e815
SOURCE_DRIFT = IMP-036J Tranche 1 consumed GTM-R178 / STATE-R176 before persistence. Evaluated candidate drift against 24d424db was NONE.
GATE_EVALUATED_HEAD = 072932df00c445c8215c61f19f81971bf657b160
GATE_EVALUATED_TREE = a4912e6c649cad25094412ac07a005fbb441567e
CANONICAL_PATH = /home/ajoshi/repos/boba-bear-platform
EVALUATED_BRANCH = docs/imp036k-product-experience-definition
EVALUATED_HEAD = 072932df00c445c8215c61f19f81971bf657b160
EVALUATED_TREE = a4912e6c649cad25094412ac07a005fbb441567e
EVALUATED_WORKING_TREE_FINGERPRINT = f2886ed726c77301589ba36dccd602da6d44daadd7a0f2dec4e59aada3162c46
ARCHITECT_REVIEW = 5380398013
ROADMAP = GTM-R179
STATE = STATE-R177
DECISION_REGISTER = DR-24
ARCHITECTURE = ARCH-R23
VISION = VISION-1
PRODUCT_DELIVERY = PD-2
EXPERIENCE_STANDARD = EXP-1
PRODUCT_LANGUAGE = LANG-1
TESTING = TEST-1
PERSONAS = PERSONA-1
GOLDEN_JOURNEYS = GJ-1
```

## 1. Identity / version / status

| Field | Definition |
|---|---|
| Capability / title | IMP-036K — Revenue Recommendations |
| Product Definition version / document status | `PD-IMP-036K-DRAFT-1`; `APPROVED`; Product Definition Gate `PASS` |
| Product owner / approval evidence | Architect review `5380398013` on exact candidate HEAD `072932df00c445c8215c61f19f81971bf657b160`. D-383 (2026-10-01) remains the sequencing authority for parallel definition and is not amended by this gate result. |
| Process / verification policy | PD-2 / EXP-1 / LANG-1 / TEST-1 |
| Experience Criticality | `X3`. Recommendations sit on Product, Customization, and Cart during a customer purchase journey and can affect conversion, basket value, and trust. |
| Change Risk | `CR2`, as recorded by D-383 / GTM-R177 / STATE-R175. The slice can affect cart contents, merchandising, and attribution, while Pricing, Promotion, Checkout, and Payment remain existing authorities. Change Risk is not an agent `R` level. |
| Linked Experience Definition | [`experience-definition.md`](./experience-definition.md), `XD-IMP-036K-DRAFT-1`, `APPROVED` |
| Experience Gate | `PASS` (Architect review `5380398013`). Design Readiness remains `NOT_PERFORMED`. |
| Canonical anchors | VISION-1 / GTM-R181 / STATE-R179 / ARCH-R23 / DR-24 / PD-2 / EXP-1 / LANG-1 / TEST-1 / PERSONA-1 / GJ-1 |
| Repository candidate | `CANONICAL_PATH = /home/ajoshi/repos/boba-bear-platform`. `EVALUATED_BRANCH = docs/imp036k-product-experience-definition`. `EVALUATED_HEAD = 072932df00c445c8215c61f19f81971bf657b160`. `EVALUATED_TREE = a4912e6c649cad25094412ac07a005fbb441567e`. `EVALUATED_WORKING_TREE_FINGERPRINT = f2886ed726c77301589ba36dccd602da6d44daadd7a0f2dec4e59aada3162c46` (content-sensitive; captured for this exact candidate and confirmed by `npm run working-tree:fingerprint` on an isolated clean checkout of that HEAD and tree). Source `main` `24d424dbd22ee53cb3bbadec484bec3925b6e898`, tree `59842dfdb68b1733899f7544b0aab5f49437e815`. Evaluated candidate drift against that source was `NONE`. Persistence `SOURCE_DRIFT` is IMP-036J Tranche 1 consuming GTM-R178 / STATE-R176 before this record was re-anchored on `bd4ce6edfde83f22a9fb7bfc1d933fa8c52cd4d3`. The persistence pull request fingerprint is not this evaluated fingerprint. |
| Capability lifecycle / authorization | ROADMAP/STATE: `IMP-036K: PLANNED`; Product Definition `PD-IMP-036K-DRAFT-1` `APPROVED` / Gate `PASS`; Experience Definition `XD-IMP-036K-DRAFT-1` `APPROVED` / Gate `PASS`; next gate `DESIGN_READINESS`; Architecture Fit `PASS`; architecture `LOCKED` (source `IMP-036K-FIT-CANDIDATE-1`; review `5391917727`); `currentProductSlice` remains IMP-036J; `acceptedThrough` remains IMP-036I; implementation unauthorized and unstarted. |
| Relevant capability architecture / ADRs | Locked capability architecture [`../../capabilities/IMP-036K-revenue-recommendations.md`](../../capabilities/IMP-036K-revenue-recommendations.md). Architecture Fit `PASS`. Architecture is `LOCKED`. Source `IMP-036K-FIT-CANDIDATE-1`. Review `5391917727`. Historical PASS `5384137705` was later reopened by `5385458836`. No new ADR. Binding context: ARCH-R23; ARCH-G05, ARCH-G11, ARCH-G12, ARCH-G14, ARCH-G19, ARCH-G20, ARCH-G23, ARCH-G25; D-368, D-369, D-373, D-382, D-383. |
| Founder UAT applicability | `FOUNDER_UAT_REQUIRED = YES`. X3 customer ordering, conversion, and trust. Not performed. |

## 2. Business outcome

Help a customer discover a small number of genuinely relevant, already purchasable additions at
Product Detail, Customization, and Cart. Customization additions come from the current product's
existing variant and modifier authority. An authorized workforce operator can influence Product
Detail and Cart suggestions through product or category relationships, inside existing commercial
eligibility.

The business result, in priority order from the approved discovery direction, is:

1. Incremental contribution / gross-profit uplift attributable to recommendations.
2. Incremental average order value.
3. Recommendation attach rate.
4. Ordering, Cart → Checkout, Checkout, and Payment completion stay protected.

A recommendation is successful only when the customer chooses it and existing commerce accepts
it. Presentation is not purchase intent. Recommendation generation, ranking, or measurement
failure must leave Product, Cart, Checkout, and Payment usable.

This outcome supports the VISION owned direct-ordering path and workforce commercial
configuration. It does not create a new pricing, promotion, offer, campaign, or payment outcome.

## 3. Problem statement

`PERSONA-CUSTOMER` can already discover the menu, configure a product, and build a cart.
Repository search of `src/` found no recommendation capability. IMP-028B menu discovery left a
new ranking or recommendation authority outside that slice. D-368 keeps Menu a read projection.
D-369 / ARCH-G20 already says recommendation is not selection.

Without this capability, relevant complements, valid upgrades, and missing-category suggestions
depend on the customer noticing them in the catalog. An unauthorized or poorly bounded
suggestion could also make an ineligible item look purchasable, add it without intent, or block
checkout when suggestions fail.

Current repository evidence:

| Claim | Class | Evidence |
|---|---|---|
| No recommendation runtime exists under `src/` | `FACT` | Search for `recommendation` in `src/` returned no matches on the source main. |
| `/#drops` is static marketing navigation | `FACT` | `src/components/Nav.tsx` links “Drops” to `/#drops`. D-383 does not create a Limited Drop commerce authority. |
| An authoritative Limited Drop commerce source is absent | `FACT` | Discovery and D-383 record that static marketing is not Drop commerce authority. No separate Drop aggregate is established by this candidate. |
| Small truthful suggestions can raise incremental contribution without hurting conversion | `HYPOTHESIS` | Founder discovery direction, 2026-09-26. Not production behavioural evidence and not a controlled experiment. |

## 4. Primary personas

| Persona ID | Responsibility / goal in this slice | Context / evidence |
|---|---|---|
| `PERSONA-CUSTOMER` | See a few optional, purchasable suggestions and decide whether to add one, while the original order remains completable if every suggestion is ignored. | [`personas.md`](../personas.md) PERSONA-1. Guest or authenticated customer. Persona is not a role or permission. |
| `PERSONA-WORKFORCE-OPERATOR` | Define product or category recommendation relationships, their Product Detail and Cart placements, relative priority, and an optional effective period, then activate or disable them, only where that person is already authorized for the applicable commercial configuration scope. | VISION workforce commercial configuration. IMP-036F administers commercial configuration through existing server authorization. This candidate does not invent a role, permission, variant target, or modifier target. |

`PERSONA-PLATFORM-OPERATOR` has no new product responsibility in this slice. Support diagnosis
uses existing operational evidence boundaries in section 19.

## 5. Current-state journey

| Journey ID / evidence | Entry / preconditions | Activities today | Existing outcome / gap |
|---|---|---|---|
| `GJ-FIRST-ORDER` / accepted customer commerce | Customer opens Menu, Product, Customization, or Cart | Browse the menu projection, configure with existing customization, add through explicit cart actions, continue to Checkout and Payment | Ordering works without recommendations. No recommendation set is presented. |
| `GJ-PRODUCT-MENU-LAUNCH` / IMP-036F accepted | Authorized operator configures catalog, menu, assortment, pricing, and promotions | Existing commercial configuration | Those authorities remain the source of what can be sold and for how much. They do not currently define recommendation relationships. |
| Static Drops link / `Nav.tsx` | Customer follows “Drops” | Lands on `/#drops` marketing | This is not an authoritative Limited Drop assortment, price, or availability source. |

Planned recommendation behaviour in discovery is not accepted current reality.

## 6. Desired-state journey

| Journey ID | Entry / context | Ordered activities | Success / downstream outcome | Alternate / recovery paths |
|---|---|---|---|---|
| `JOURNEY-036K-PRODUCT-DETAIL` | Customer is on an eligible product in a known outlet and fulfilment context | See at most three eligible complements, or fewer; ignore them or explicitly add one when commerce allows, or continue into customization when configuration is required | The current product journey stays primary. An accepted add is ordinary cart intent. | No eligible complement: no padded set. Ignore: cart unchanged. Stale add: existing commerce rejects it. |
| `JOURNEY-036K-CUSTOMIZATION` | Customer is configuring the current product | See at most one existing variant upgrade and two existing valid add-ons, three total, from that product's current customization authority; choose one explicitly through existing customization | Selection changes only after that choice. Paid modifiers stay unselected until the customer selects them. | No valid upgrade or add-on: the customization task continues. Invalid option: not offered. |
| `JOURNEY-036K-CART` | Cart has at least one line | See at most four category-gap suggestions; continue to checkout with or without accepting one | Checkout remains available. Accepted adds follow existing cart rules. | Empty cart: no recommendation module. Category already present: that category is not treated as missing. Failed generation: cart and checkout continue. |
| `JOURNEY-036K-WORKFORCE` | Operator is already inside an authorized commercial configuration scope | Define a product or category source, a product or category target, relationship kind, Product Detail and Cart placements, relative priority, and an optional effective period; activate or disable | New Product Detail and Cart sets may follow the effective relationship and still pass hard eligibility. | Unauthorized or cross-scope action is denied. Disable stops future use of that relationship and leaves existing cart lines in place. Customization recommendations continue from existing customization authority. |

## 7. Story map

| Business outcome | Persona | Journey | Activity | Story IDs | Slice classification |
|---|---|---|---|---|---|
| Relevant purchasable complements | `PERSONA-CUSTOMER` | `JOURNEY-036K-PRODUCT-DETAIL` | See and ignore, or explicitly act on, complements | `US-036K-001` | `V1_ACCEPTANCE_SLICE` |
| Valid upgrades and add-ons | `PERSONA-CUSTOMER` | `JOURNEY-036K-CUSTOMIZATION` | See variant and modifier suggestions inside existing customization | `US-036K-002` | `V1_ACCEPTANCE_SLICE` |
| Complete the basket by category gap | `PERSONA-CUSTOMER` | `JOURNEY-036K-CART` | See cart suggestions from category presence or absence | `US-036K-003` | `V1_ACCEPTANCE_SLICE` |
| Customer stays in control of cart changes | `PERSONA-CUSTOMER` | All customer journeys | Add only by an explicit recommendation action | `US-036K-004` | `V1_ACCEPTANCE_SLICE` |
| Suggestions match what can actually be bought | `PERSONA-CUSTOMER` | All customer journeys | Filter by existing commerce before ranking | `US-036K-005` | `V1_ACCEPTANCE_SLICE` |
| A stale suggestion cannot trap the order | `PERSONA-CUSTOMER` | All customer journeys | Reject an unavailable add and continue | `US-036K-006` | `V1_ACCEPTANCE_SLICE` |
| Ordering survives recommendation failure | `PERSONA-CUSTOMER` | All customer journeys | Continue Product, Cart, Checkout, and Payment | `US-036K-007` | `V1_ACCEPTANCE_SLICE` |
| Removing a suggestion is ordinary cart removal | `PERSONA-CUSTOMER` | `JOURNEY-036K-CART` | Remove the line and suppress that candidate | `US-036K-008` | `V1_ACCEPTANCE_SLICE` |
| Assisted sales are distinguishable from other sales | `PERSONA-CUSTOMER` | All customer journeys | Record presentation, action, and surviving purchase | `US-036K-009` | `V1_ACCEPTANCE_SLICE` |
| Ranking stays inside eligibility | `PERSONA-WORKFORCE-OPERATOR` / `PERSONA-CUSTOMER` | Workforce and customer journeys | Order eligible candidates with deterministic rules | `US-036K-010` | `V1_ACCEPTANCE_SLICE` |
| Popularity treatment stays evidence-backed | `PERSONA-CUSTOMER` | All customer journeys | Permit that treatment only when the evidence rule passes | `US-036K-011` | `V1_ACCEPTANCE_SLICE` |
| Operators influence relationships inside their scope | `PERSONA-WORKFORCE-OPERATOR` | `JOURNEY-036K-WORKFORCE` | Define, activate, and disable product or category relationships for Product Detail and Cart | `US-036K-012` | `V1_ACCEPTANCE_SLICE` |
| Incrementality can be measured later | `PERSONA-CUSTOMER` | All customer journeys | Be design-ready for a controlled holdout; do not require ~10% live activation for Product acceptance | `US-036K-013` | `V1_ACCEPTANCE_SLICE` |
| Menu browse ranking, checkout suggestions, post-purchase suggestions, quantity-aware groups, view-through, threshold completion, frequently bought together, trending, personalized, reorder | `PERSONA-CUSTOMER` | Later journeys | Out of this acceptance slice | Section 23 | `FOLLOW_UP` / `DEFERRED` |
| Limited Drop as a required customer placement | `PERSONA-CUSTOMER` | Future, dependency-conditional | Not a V1 acceptance dependency | Section 23 | `EXPLICITLY_DEFERRED` / `DEPENDENCY_CONDITIONAL` |
| ML, collaborative filtering, embeddings, LLM ranking, external recommendation SaaS, feature store, bandits, psychographic profiling, cross-session personalization | — | — | Out of V1 | Section 23 | `DEFERRED` |

## 8. Acceptance slice

| Slice | Mandatory story IDs | Mandatory AC IDs | Required Golden Journeys | Observable acceptance boundary |
|---|---|---|---|---|
| `V1_ACCEPTANCE_SLICE` | `US-036K-001` through `US-036K-013` | Every `AC-036K-*` marked mandatory YES | `GJ-FIRST-ORDER`, `GJ-AVAILABILITY`, `GJ-PRODUCT-MENU-LAUNCH` must keep working with recommendations present, absent, failed, or held out. `GJ-PAYMENT-RECOVERY` must remain reachable when recommendations fail. | A customer can see bounded eligible suggestions on Product Detail, Customization, and a non-empty Cart; add one only by explicit action through existing commerce; ignore all of them and still order. Customization suggestions use the current product's existing variant and modifier authority. An operator with existing commercial-configuration authority can maintain product or category relationships for Product Detail and Cart, inside eligibility. |
| `FOLLOW_UP` | Menu discovery, checkout placement, post-purchase, quantity-aware cart inference, view-through attribution, co-purchase claims, trend claims, personalized recommendations, reorder, threshold completion | None in this candidate | None become mandatory | Each needs its own later authorization. None is a hidden V1 requirement. |
| `DEFERRED` | ML / collaborative filtering / embeddings / vector search / LLM recommendation engine / external recommendation SaaS / feature store / bandits / psychographic profiling / cross-session personalization; mandatory Limited Drop dependency | None | None | Limited Drop waits for an authoritative Drop source through Product and Architecture authority. No Drop aggregate is defined here. |

## 9. User stories

```text
Story ID: US-036K-001
As a PERSONA-CUSTOMER
I want a few eligible complementary ideas on the product I am already viewing
so that I can notice a relevant addition without leaving or being blocked from the current product.

Journey / activity: JOURNEY-036K-PRODUCT-DETAIL / see and ignore complements
Preconditions: A product is open in a known outlet and fulfilment context. Existing catalog, assortment, availability, price, and configuration authorities can evaluate the product.
Acceptance scenarios: AC-036K-001-01 through AC-036K-001-04
Business rules: BR-036K-001, BR-036K-005, BR-036K-026
UX states: Product Detail recommendation states in section 13
Permission / resource context: Customer storefront. No workforce permission.
Error / recovery: Generation failure is US-036K-007. Stale add is US-036K-006.
Dependencies: Existing Menu projection and product detail. Recommendation relationships from US-036K-012 when used.
Explicit non-goals: Menu browse re-ranking. Frequently-bought-together claims. Padding to three items.
Data implications: Presentation of product identities already owned by catalog/menu. No new product identity.
Security implications: Ineligible products are not offered as purchasable.
Architecture fit / applicable invariants: ARCH-G11, ARCH-G19, ARCH-G20. Where complements are generated and ranked is ARCHITECTURE_FIT_REQUIRED.
Open material decisions: NONE
Readiness: NOT_READY_FOR_IMPLEMENTATION — Architecture Fit, Design Readiness, and implementation authorization are not performed.
```

```text
Story ID: US-036K-002
As a PERSONA-CUSTOMER
I want variant upgrades and valid add-ons to be suggested through the product I am already configuring
so that an upgrade stays a choice about this product, not a second invented product.

Journey / activity: JOURNEY-036K-CUSTOMIZATION / see and choose upgrades and add-ons
Preconditions: The current product has existing variant or modifier authority. The customer is in the customization interaction.
Acceptance scenarios: AC-036K-002-01 through AC-036K-002-06
Business rules: BR-036K-005, BR-036K-009, BR-036K-027, BR-036K-031
UX states: Customization recommendation states in section 13
Permission / resource context: Customer storefront.
Error / recovery: Invalid configuration is refused by existing customization rules.
Dependencies: Existing customization (IMP-028C direction) and D-369 / ARCH-G20. The set is produced from the current product's existing variant and modifier customization authority.
Explicit non-goals: A parallel customization engine. A new variant identity. A new modifier identity. Silent variant change. Paid modifier preselection. Producing this set from an operator-authored product or category relationship.
Data implications: Reads existing variant and modifier configuration. Does not create a new variant identity, a new modifier identity, or a parallel customization authority.
Security implications: A suggestion cannot select a positive-price modifier for the customer.
Architecture fit / applicable invariants: ARCH-G20, D-369. A variant upgrade and a modifier or add-on resolve through existing product and customization identity. Architecture Fit must not invent a variant or modifier target for an operator relationship in order to place that relationship on Customization.
Open material decisions: NONE
Readiness: NOT_READY_FOR_IMPLEMENTATION
```

```text
Story ID: US-036K-003
As a PERSONA-CUSTOMER with at least one cart line
I want a short category-gap set based on categories already in my cart
so that a missing category can be suggested while an empty cart stays a normal empty cart.

Journey / activity: JOURNEY-036K-CART / category-gap suggestions
Preconditions: Existing cart contents and existing catalog categories are available. V1 compares category presence and absence only.
Acceptance scenarios: AC-036K-003-01 through AC-036K-003-08
Business rules: BR-036K-005, BR-036K-006, BR-036K-007
UX states: Cart recommendation states in section 13
Permission / resource context: Customer cart.
Error / recovery: The customer can continue to checkout with zero accepted suggestions.
Dependencies: Existing cart and category authority. How a category rule becomes concrete products is ARCHITECTURE_FIT_REQUIRED.
Explicit non-goals: Diner count, group size, “too few drinks”, quantity balancing, per-person beverage requirements, family or group composition, and a replacement menu feed.
Data implications: Reads current cart category presence. Does not invent a new category taxonomy.
Security implications: Cart composition of one customer is not shown to another customer.
Architecture fit / applicable invariants: ARCH-G11. Category-to-product resolution is ARCHITECTURE_FIT_REQUIRED.
Open material decisions: NONE
Readiness: NOT_READY_FOR_IMPLEMENTATION
```

```text
Story ID: US-036K-004
As a PERSONA-CUSTOMER
I want a recommendation to enter my cart only after I explicitly choose it
so that I remain in control of purchase intent.

Journey / activity: All customer journeys / explicit add
Preconditions: A candidate is visible. Existing commerce already knows whether that item can be added directly or needs configuration.
Acceptance scenarios: AC-036K-004-01 through AC-036K-004-05
Business rules: BR-036K-001, BR-036K-008, BR-036K-009, BR-036K-029
UX states: Explicit add and configuration handoff in section 13
Permission / resource context: Same customer cart authority as any other add.
Error / recovery: A refused add leaves prior cart lines in place.
Dependencies: Existing cart mutation and existing customization flow.
Explicit non-goals: A new cart command authority. Silent add, silent variant change, or paid modifier preselection.
Data implications: A successful add becomes ordinary cart intent. Display does not reserve price, availability, or stock.
Security implications: Browser display cannot mint purchasability.
Architecture fit / applicable invariants: ARCH-G11, ARCH-G20, ARCH-G22, D-369, D-371. Which existing cart API is reused is ARCHITECTURE_FIT_REQUIRED.
Open material decisions: NONE
Readiness: NOT_READY_FOR_IMPLEMENTATION
```

```text
Story ID: US-036K-005
As a PERSONA-CUSTOMER
I want every suggestion to already be purchasable for my outlet, fulfilment, price, and configuration context
so that a recommendation cannot sell something existing commerce would refuse.

Journey / activity: All customer journeys / hard eligibility before ranking
Preconditions: Assortment, availability, price, fulfilment, outlet, and configuration can be evaluated by their existing authorities.
Acceptance scenarios: AC-036K-005-01 through AC-036K-005-05
Business rules: BR-036K-002, BR-036K-003, BR-036K-004, BR-036K-028
UX states: Ineligible candidates are absent from the set
Permission / resource context: Customer context is the selected outlet and fulfilment context, server-derived.
Error / recovery: Context change refilters the next set. Already added lines stay under existing cart and checkout revalidation.
Dependencies: Existing assortment, availability, pricing, fulfilment mode and timing, outlet, and customization authorities.
Explicit non-goals: A second eligibility or price engine. A recommendation-created discount.
Data implications: Consumes existing commerce truth. Does not copy it into a competing authority.
Security implications: The customer client is not eligibility authority. Cross-outlet items are not offered as purchasable.
Architecture fit / applicable invariants: ARCH-G05, ARCH-G11, ARCH-G19. Outlet / Delivery / Pickup / Scheduled projection is ARCHITECTURE_FIT_REQUIRED.
Open material decisions: NONE
Readiness: NOT_READY_FOR_IMPLEMENTATION
```

```text
Story ID: US-036K-006
As a PERSONA-CUSTOMER
I want an attempt to add a suggestion that is no longer purchasable to be refused clearly
so that I can keep ordering with the cart I already have.

Journey / activity: All customer journeys / stale add recovery
Preconditions: A candidate was shown and then became inactive, unavailable, out of assortment, or invalid for outlet, fulfilment, price, or configuration before add.
Acceptance scenarios: AC-036K-006-01 through AC-036K-006-03
Business rules: BR-036K-011
UX states: Stale add recovery in section 13
Permission / resource context: Existing cart validation.
Error / recovery: The explanation lets the customer continue on Cart, Checkout, or Payment.
Dependencies: Existing commerce validation at add time.
Explicit non-goals: A recommendation-specific substitute item. Silent replacement.
Data implications: The refused candidate does not become cart intent.
Security implications: A replay of a stale recommendation add cannot bypass current validation.
Architecture fit / applicable invariants: Existing cart/checkout revalidation. Concurrency between display and add is ARCHITECTURE_FIT_REQUIRED for mechanism only.
Open material decisions: NONE
Readiness: NOT_READY_FOR_IMPLEMENTATION
```

```text
Story ID: US-036K-007
As a PERSONA-CUSTOMER
I want Product, Cart, Checkout, and Payment to keep working when suggestions cannot be generated or ranked
so that a recommendation problem is never an order problem.

Journey / activity: All customer journeys / fail-open commerce
Preconditions: The primary commerce surfaces are otherwise available.
Acceptance scenarios: AC-036K-007-01, AC-036K-007-02
Business rules: BR-036K-010
UX states: Fail-open state in section 13
Permission / resource context: Unchanged customer commerce access.
Error / recovery: The recommendation module is absent. The primary task remains available for retry of ordering, not of a blocking recommendation error.
Dependencies: Existing Product, Cart, Checkout, and Payment availability.
Explicit non-goals: A customer-facing recommendation outage that stops payment.
Data implications: No partial cart write on generation failure.
Security implications: Failure responses must not disclose another customer's cart or internal ranking rationale.
Architecture fit / applicable invariants: Latency and failure boundary is ARCHITECTURE_FIT_REQUIRED. The observable boundary is already defined here.
Open material decisions: NONE
Readiness: NOT_READY_FOR_IMPLEMENTATION
```

```text
Story ID: US-036K-008
As a PERSONA-CUSTOMER
I want to remove a line I added from a recommendation with ordinary cart removal
so that the suggestion stops following me in this cart without disappearing from the menu.

Journey / activity: JOURNEY-036K-CART / removal and suppression
Preconditions: The line was added through a recommendation action and is still in the active cart.
Acceptance scenarios: AC-036K-008-01 through AC-036K-008-05
Business rules: BR-036K-012, BR-036K-013
UX states: Removal and suppression in section 13
Permission / resource context: Existing cart removal authority for that cart.
Error / recovery: If removal itself fails under existing cart rules, the line remains and suppression does not start.
Dependencies: Existing cart removal. Active-cart/session suppression representation is ARCHITECTURE_FIT_REQUIRED.
Explicit non-goals: Deleting the product from catalog or menu. Carrying suppression into a later manual add's attribution.
Data implications: Suppression applies to that exact candidate for the remainder of the active cart or session. A new cart or session may recommend it again.
Security implications: Suppression state for one cart is not applied to another customer's cart.
Architecture fit / applicable invariants: ARCH-G11, ARCH-G22. Representation of suppression is ARCHITECTURE_FIT_REQUIRED.
Open material decisions: NONE
Readiness: NOT_READY_FOR_IMPLEMENTATION
```

```text
Story ID: US-036K-009
As a PERSONA-CUSTOMER whose order is measured after purchase
I want a suggestion I actually added to be distinguishable from an item I only saw or added myself
so that later measurement can see incremental contribution without counting a mere view as an assisted sale.

Journey / activity: All customer journeys / measurement meanings
Preconditions: A recommendation set can be presented and an order can be purchased through existing Checkout and Payment.
Acceptance scenarios: AC-036K-009-01 through AC-036K-009-06
Business rules: BR-036K-014, BR-036K-015, BR-036K-016, BR-036K-030
UX states: N/A for customer copy. Measurement is not a customer-facing module.
Permission / resource context: No customer permission change. Workforce analytics access stays with existing operational authorization.
Error / recovery: Missing measurement does not block the purchase. View-through is not V1 assistance.
Dependencies: Existing Order from Checkout Snapshot. Persistence, transport, and schema are not selected.
Explicit non-goals: View-through attribution. Analytics vendor, storage tables, or event transport.
Data implications: Meanings required: set render, item impression, click, add attempt, successful add, removal, recommendation-assisted purchase. Correlation across presentation, add, and purchased order is required as a meaning. The storage shape is ARCHITECTURE_FIT_REQUIRED.
Security implications: Events must not include payment secrets, full customer profiles, or internal margin rationale for customer display.
Architecture fit / applicable invariants: Impression and attribution persistence is ARCHITECTURE_FIT_REQUIRED.
Open material decisions: NONE
Readiness: NOT_READY_FOR_IMPLEMENTATION
```

```text
Story ID: US-036K-010
As a PERSONA-WORKFORCE-OPERATOR
I want commercial priority and contribution to influence only the order of items that are already eligible
so that a more profitable item cannot be offered when existing commerce says it cannot be sold in that context.

Journey / activity: Ranking after eligibility
Preconditions: Hard eligibility filtering in US-036K-005 has already removed ineligible candidates.
Acceptance scenarios: AC-036K-010-01 through AC-036K-010-04
Business rules: BR-036K-002, BR-036K-004, BR-036K-017, BR-036K-018, BR-036K-026
UX states: Customers see ordering, not the internal reason.
Permission / resource context: Setting priority is US-036K-012.
Error / recovery: If contribution cannot be read, ranking still proceeds among eligible candidates without bypassing eligibility.
Dependencies: Existing price is read, not rewritten. How contribution is projected without a second money authority is ARCHITECTURE_FIT_REQUIRED.
Explicit non-goals: Exact numeric weights as a product contract. ML ranking. Customer-visible commercial-priority, contribution, or margin rationale.
Data implications: Priority is operator configuration. Contribution is a ranking input only. Neither becomes price, tax, or promotion truth.
Security implications: Internal merchandising rationale is not customer-visible.
Architecture fit / applicable invariants: ARCH-G05, ARCH-G11. Ranking execution location and margin projection are ARCHITECTURE_FIT_REQUIRED.
Open material decisions: NONE
Readiness: NOT_READY_FOR_IMPLEMENTATION
```

```text
Story ID: US-036K-011
As a PERSONA-CUSTOMER
I want a popularity treatment to be permitted only when recent direct-order evidence supports it
so that a popularity claim is either earned or absent.

Journey / activity: All customer journeys / conditional popularity treatment
Preconditions: Purchased BOBA Bear direct Orders exist or do not exist for the selected outlet.
Acceptance scenarios: AC-036K-011-01 through AC-036K-011-04
Business rules: BR-036K-019, BR-036K-020
UX states: The earned-popularity presentation in the Experience Definition applies only when the rule passes. Otherwise that treatment is absent. Exact wording stays there.
Permission / resource context: None for the customer.
Error / recovery: Insufficient evidence, or inability to evaluate evidence, produces no popularity claim. Other eligible recommendations may still appear.
Dependencies: Successfully purchased direct Orders and selected Outlet. Query and storage mechanics are ARCHITECTURE_FIT_REQUIRED. Popularity treatment is not a launch dependency.
Explicit non-goals: A trend claim. A co-purchase claim. A personalization claim. Marketplace or aggregator orders as the evidence base.
Data implications: Evidence window, order population, outlet scope, minimum order count, and top-three unit-count rule are product rules. Schema is not selected.
Security implications: Popularity evidence is aggregate purchased-unit count, not a customer-identifiable leaderboard in the customer experience.
Architecture fit / applicable invariants: Popularity evidence mechanics are ARCHITECTURE_FIT_REQUIRED.
Open material decisions: NONE
Readiness: NOT_READY_FOR_IMPLEMENTATION
```

```text
Story ID: US-036K-012
As a PERSONA-WORKFORCE-OPERATOR already authorized for the applicable commercial configuration scope
I want to define, activate, and disable recommendation relationships
so that new suggestions follow that configuration without changing catalog truth or existing cart lines when I turn a relationship off.

Journey / activity: JOURNEY-036K-WORKFORCE / administer relationships
Preconditions: The actor is a workforce principal established by existing server-validated session and server-derived scope (ARCH-G23 / ARCH-G25).
Acceptance scenarios: AC-036K-012-01 through AC-036K-012-06
Business rules: BR-036K-018, BR-036K-021, BR-036K-022, BR-036K-024, BR-036K-031
UX states: Workforce configuration states in section 13
Permission / resource context: Section 14. Exact existing permission and resource mapping is ARCHITECTURE_FIT_REQUIRED.
Error / recovery: Denied actions do not change relationships. Disabling does not remove cart lines already added.
Dependencies: Existing commercial administration workspace evidence from IMP-036F. No new role.
Explicit non-goals: A recommendation-specific role or permission. A variant target type. A modifier target type. A new relationship target kind. Customization as a placement of this relationship. Using a relationship to override assortment, price, availability, or fulfilment. Mandatory Limited Drop marking.
Data implications: A relationship has a source product or category, a target product or category, a relationship kind, supported placements of Product Detail and Cart, relative priority, optional effective period, and active or disabled state. It does not carry a variant or modifier target. Durable aggregate versus catalog or merchandising ownership is ARCHITECTURE_FIT_REQUIRED.
Security implications: Unauthorized and cross-scope actors cannot administer relationships. Caller-supplied roles are not authority.
Architecture fit / applicable invariants: ARCH-G08, ARCH-G23, ARCH-G25, D-373. Exact permission mapping is ARCHITECTURE_FIT_REQUIRED. Architecture Fit must not invent a variant or modifier target, or a Customization placement, for this relationship.
Open material decisions: NONE
Readiness: NOT_READY_FOR_IMPLEMENTATION
```

```text
Story ID: US-036K-013
As a business preparing to measure recommendations
I want V1 design and measurement readiness to support a controlled recommendation holdout
so that incremental contribution can later be compared without changing commerce for customers whose recommendation presentation is suppressed.

Journey / activity: All customer journeys / conditional holdout
Preconditions: An ordering session or cart exists. When a holdout assignment is used, it is stable for that active session or cart.
Acceptance scenarios: AC-036K-013-01 through AC-036K-013-05
Business rules: BR-036K-023
UX states: When holdout is active for that customer, recommendation presentation is suppressed. Exact silence and the absence of a holdout explanation are Experience Definition requirements.
Permission / resource context: Holdout does not change customer entitlements or workforce permissions.
Error / recovery: If assignment cannot be determined, treat recommendation presentation like generation failure: do not present recommendations, and commerce still proceeds. Exact silence is the Experience Definition. The assignment mechanism itself is ARCHITECTURE_FIT_REQUIRED.
Dependencies: A later Measurement/Instrumentation Plan. No experimentation platform is selected for V1. Actual activation of the approximate 10% direction is not required to pass Product acceptance.
Explicit non-goals: Requiring a production candidate to hold out approximately 10% of real sessions in order to pass Product acceptance. Changing catalog, availability, prices, promotions, fulfilment, cart rules, checkout, payment, or entitlements. Selecting an assignment algorithm, persistence, vendor, event transport, or schema.
Data implications: When assignment is used, the outcome must be stable for the active session or cart. The algorithm, storage, and analytics vendor are not selected.
Security implications: Holdout membership is not a secret price or a privilege.
Architecture fit / applicable invariants: Holdout assignment mechanism is ARCHITECTURE_FIT_REQUIRED and is not answered here.
Open material decisions: NONE
Readiness: NOT_READY_FOR_IMPLEMENTATION
```

## 10. Acceptance scenarios

Mandatory means required in the V1 acceptance slice when marked YES. `AC-036K-013-01` records the holdout design direction and is not a live-activation acceptance outcome. Planned proof is not executed evidence. Exact customer wording is not an acceptance string in this section.

```text
AC-036K-001-01 — Product Detail shows eligible complements within the bound
Story: US-036K-001
Given a customer viewing a product, and at least one complementary candidate that passes hard eligibility
When the product detail recommendation set is produced
Then the set contains at most 3 eligible complementary candidates
And fewer than 3 is a valid set
And Product Detail is a V1 recommendation placement
And approved presentation, including the placement heading, is the linked Experience Definition
Mandatory in acceptance slice: YES

AC-036K-001-02 — Complements are not padded
Story: US-036K-001
Given fewer eligible complements than the maximum, including zero
When the set is produced
Then ineligible or weak candidates are not added to reach 3
And the customer can continue the current product
Mandatory in acceptance slice: YES

AC-036K-001-03 — Ignoring complements leaves the current product unchanged
Story: US-036K-001
Given complements are visible
When the customer continues configuring or adding the current product without using a recommendation action
Then the recommendation candidates are not added to the cart
And the current product interaction stays available
Mandatory in acceptance slice: YES

AC-036K-001-04 — Product Detail does not make a false commercial claim
Story: US-036K-001
Given a Product Detail recommendation set
When it is presented
Then customer-visible semantics do not claim co-purchase, personalization, trend, savings, commercial priority, or margin
And the approved presentation semantics are the linked Experience Definition
Mandatory in acceptance slice: YES
```

```text
AC-036K-002-01 — Customization bounds
Story: US-036K-002
Given a customer in customization
When recommendations for that step are produced
Then the set contains at most 3 recommendations in total
And that total contains at most 1 variant upgrade and at most 2 valid add-ons
And fewer, including zero, is valid
And approved presentation, including the placement heading, is the linked Experience Definition
Mandatory in acceptance slice: YES

AC-036K-002-02 — Variant upgrade is an explicit choice on the same product
Story: US-036K-002
Given an eligible variant upgrade such as a larger size or an additional patty that existing product authority already supports
When the customer has not chosen it
Then the current variant stays unchanged
And when the customer chooses it, the change uses the existing product and customization interaction
And the upgrade is not presented as an unrelated second product
Mandatory in acceptance slice: YES

AC-036K-002-03 — Add-ons use existing customization and do not preselect paid modifiers
Story: US-036K-002
Given a valid paid add-on that existing customization allows
When the recommendation is shown
Then that paid modifier is not preselected
And choosing it continues through the existing customization interaction
And the item is added only after that interaction accepts the configuration
Mandatory in acceptance slice: YES

AC-036K-002-04 — Invalid modifier or variant is not offered
Story: US-036K-002
Given a modifier or variant that existing customization marks incompatible, unavailable, or outside the current configuration
When the customization set is produced
Then that option is absent
Mandatory in acceptance slice: YES

AC-036K-002-05 — Zero-price standard defaults stay with existing customization
Story: US-036K-002
Given existing customization already visibly preselects a zero-price standard option
When recommendations render
Then that existing default behaviour remains governed by customization authority
And recommendation does not newly preselect a positive-price modifier
Mandatory in acceptance slice: YES

AC-036K-002-06 — Customization recommendations use existing customization authority
Story: US-036K-002
Given the customer is configuring a product that already has variant or modifier authority
When customization recommendations are produced
Then each candidate is an existing variant upgrade or an existing modifier or add-on of that product
And the set contains at most 1 variant upgrade and at most 2 add-ons, within the total of 3
And the set is produced from that existing customization authority
And the set is not produced from an operator-authored product or category relationship
And no new variant identity and no new modifier identity are created
Mandatory in acceptance slice: YES
```

```text
AC-036K-003-01 — Non-empty cart shows a bounded completion set
Story: US-036K-003
Given a cart with at least one line and at least one eligible suggestion
When the cart recommendation set is produced
Then the set contains at most 4 eligible candidates
And fewer than 4 is valid
And approved presentation, including the placement heading, is the linked Experience Definition
Mandatory in acceptance slice: YES

AC-036K-003-02 — Empty cart has no recommendation module
Story: US-036K-003
Given a cart with no lines
When the customer views the cart
Then no Revenue Recommendations module is rendered there
And the existing empty-cart experience remains
Mandatory in acceptance slice: YES

AC-036K-003-03 — Main and side without a beverage can suggest a beverage
Story: US-036K-003
Given the cart contains a main category and a side category and does not contain a beverage category, using categories already owned by catalog authority
And an eligible beverage exists for the current outlet and fulfilment context
When the cart set is produced
Then an eligible beverage may be suggested
And the suggestion still passes hard eligibility
Mandatory in acceptance slice: YES

AC-036K-003-04 — Beverage-only cart can suggest food
Story: US-036K-003
Given the cart contains a beverage category and does not contain a food category
And an eligible food item exists
When the cart set is produced
Then an eligible food item may be suggested
Mandatory in acceptance slice: YES

AC-036K-003-05 — Main without a complementary side can suggest a side
Story: US-036K-003
Given the cart contains a main category and does not contain a complementary side category
And an eligible side exists
When the cart set is produced
Then an eligible side may be suggested
Mandatory in acceptance slice: YES

AC-036K-003-06 — A present category is not treated as missing
Story: US-036K-003
Given a category is already present in the cart
When the gap set is produced
Then that same category is not suggested as absent
Mandatory in acceptance slice: YES

AC-036K-003-07 — V1 does not infer group quantity
Story: US-036K-003
Given several mains and any drink quantity
When the cart set is produced
Then the set does not infer diner count, group size, too few drinks, quantity balancing, a per-person beverage requirement, or family or group composition
Mandatory in acceptance slice: YES

AC-036K-003-08 — Checkout continues without accepting suggestions
Story: US-036K-003
Given a non-empty cart and a visible recommendation set
When the customer proceeds toward checkout without a recommendation action
Then checkout entry remains available
And no recommendation candidate is added
Mandatory in acceptance slice: YES
```

```text
AC-036K-004-01 — Direct add only where existing commerce already allows it
Story: US-036K-004
Given a visible candidate that existing commerce can add without further customer choices
When the customer uses the recommendation add action
Then the add is submitted through existing cart rules
And a candidate that still needs configuration is not direct-added
Mandatory in acceptance slice: YES

AC-036K-004-02 — Configuration reuses the existing flow
Story: US-036K-004
Given a visible candidate that existing commerce requires the customer to configure
When the customer uses the recommendation action
Then the existing customization flow opens or is reused
And required choices are not silently filled
And the cart changes only after that flow accepts the configuration
Mandatory in acceptance slice: YES

AC-036K-004-03 — No silent cart, variant, or paid-modifier mutation
Story: US-036K-004
Given recommendations are visible on Product Detail, Customization, or Cart
When the customer has not used a recommendation action
Then no recommended product is added, no variant is changed, and no paid modifier is preselected
Mandatory in acceptance slice: YES

AC-036K-004-04 — Add is revalidated when the customer acts
Story: US-036K-004
Given a candidate that was eligible when shown
When the customer uses the add action
Then existing cart and commerce validation runs again at that action
And a displayed recommendation does not reserve price, availability, or stock
Mandatory in acceptance slice: YES

AC-036K-004-05 — An alternative relationship is never a silent swap
Story: US-036K-004
Given a relationship whose kind is ALTERNATIVE
When the customer has not explicitly chosen that target
Then the current cart line remains
And the alternative does not replace it
And ALTERNATIVE != SILENT_SWAP
And this rule does not make ALTERNATIVE a V1 recommendation strategy
Mandatory in acceptance slice: YES
```

```text
AC-036K-005-01 — Hard eligibility runs before ranking
Story: US-036K-005
Given candidates that include inactive, unavailable, out-of-assortment, wrong-outlet, fulfilment-incompatible, unpriced, or configuration-incompatible items, and items whose relationship is expired or disabled
When a set is produced
Then those items are removed before ranking
And they are not shown as purchasable
Mandatory in acceptance slice: YES

AC-036K-005-02 — Price, assortment, availability, and fulfilment stay with existing authorities
Story: US-036K-005
Given a candidate
When it is recommended
Then its price, assortment membership, availability, outlet, and fulfilment eligibility are the values existing commerce already uses
And the recommendation does not create a discount, promotion, offer, coupon, or campaign
Mandatory in acceptance slice: YES

AC-036K-005-03 — Context change refilters the next set
Story: US-036K-005
Given the customer changes outlet or fulfilment context, including Delivery, Pickup, or Scheduled when that context applies
When the next recommendation set is produced
Then it includes only candidates purchasable in the new context
And lines already in the cart remain subject to existing cart and checkout revalidation
Mandatory in acceptance slice: YES

AC-036K-005-04 — The client cannot invent purchasability
Story: US-036K-005
Given a customer or browser supplies a candidate the server does not consider eligible
When a set is rendered or an add is attempted
Then the server eligibility result stands
And the client-supplied candidate is not treated as purchasable
Mandatory in acceptance slice: YES

AC-036K-005-05 — Exact duplicates that add nothing are not used as padding
Story: US-036K-005
Given the cart already contains an item and a candidate is that same item without filling an absent category
When the set is produced
Then that duplicate is not inserted to fill a maximum
And the customer can still add the item again from Menu or Product if existing commerce allows it
Mandatory in acceptance slice: YES
```

```text
AC-036K-006-01 — Newly ineligible candidates leave later sets
Story: US-036K-006
Given a candidate that becomes inactive, unavailable, or outside assortment or fulfilment context after it was shown
When a new set is produced
Then that candidate is absent
Mandatory in acceptance slice: YES

AC-036K-006-02 — Stale add is rejected and recoverable
Story: US-036K-006
Given the customer tries to add a candidate that is no longer purchasable
When existing commerce validation runs
Then the add is rejected
And the customer gets a recoverable explanation from existing commerce recovery
And prior cart lines remain
Mandatory in acceptance slice: YES

AC-036K-006-03 — Rejection does not block Cart, Checkout, or Payment
Story: US-036K-006
Given a rejected stale recommendation add
When the customer continues
Then Cart, Checkout, and Payment remain usable for the remaining valid cart
Mandatory in acceptance slice: YES
```

```text
AC-036K-007-01 — Generation or ranking failure leaves commerce usable
Story: US-036K-007
Given recommendation generation or ranking fails or does not return
When the customer is on Product, Cart, Checkout, or Payment
Then those surfaces remain usable
And Menu remains usable
And no recommendation failure prevents payment
Mandatory in acceptance slice: YES

AC-036K-007-02 — Failure does not write cart intent
Story: US-036K-007
Given generation or ranking fails
When the customer continues
Then the cart is unchanged by that failure
And the recommendation module does not block the primary task
Mandatory in acceptance slice: YES
```

```text
AC-036K-008-01 — Removal uses ordinary cart removal
Story: US-036K-008
Given a line that was added through a recommendation action
When the customer removes that line
Then removal uses normal cart removal
And totals follow existing cart rules
Mandatory in acceptance slice: YES

AC-036K-008-02 — That exact candidate is suppressed for the active cart or session
Story: US-036K-008
Given that removal succeeded
When later recommendation sets are produced for the same active cart or session
Then that exact candidate is absent from recommendation placements
And a different eligible candidate may still appear
Mandatory in acceptance slice: YES

AC-036K-008-03 — Suppression does not remove the item from the menu
Story: US-036K-008
Given the candidate is suppressed from recommendations
When the customer browses Menu or Product
Then the item remains available under existing catalog, assortment, and availability truth
And the customer can add it manually if existing commerce allows it
Mandatory in acceptance slice: YES

AC-036K-008-04 — A later manual add does not inherit recommendation attribution
Story: US-036K-008
Given the customer removed the recommendation-added line and later adds the same item from Menu or Product without a recommendation action
When that line is purchased
Then the purchase is not recommendation-assisted from the removed recommendation
Mandatory in acceptance slice: YES

AC-036K-008-05 — A new cart or session may recommend the item again
Story: US-036K-008
Given a new cart or ordering session after suppression in a previous one
When a new set is produced and the item is eligible
Then the item may be recommended again
Mandatory in acceptance slice: YES
```

```text
AC-036K-009-01 — Measurement meanings stay distinct
Story: US-036K-009
Given recommendation activity occurs
When the activity is measured
Then set render, item impression, click, add attempt, successful add, removal, and recommendation-assisted purchase are distinguishable meanings
And a render is not counted as an add, and an add attempt is not counted as a successful add
Mandatory in acceptance slice: YES

AC-036K-009-02 — Assisted purchase requires presentation, recommendation add, and survival
Story: US-036K-009
Given a purchased Order
When an item is classified as recommendation-assisted
Then that item was presented in a recommendation set
And the customer added it through the recommendation action
And the same underlying recommended item or line is on the purchased Order
Mandatory in acceptance slice: YES

AC-036K-009-03 — Quantity and valid configuration changes keep attribution
Story: US-036K-009
Given a recommendation-added line
When the customer changes quantity or a valid modifier or configuration and the same underlying recommended identity remains
Then recommendation-assisted attribution remains for that line
Mandatory in acceptance slice: YES

AC-036K-009-04 — Replacement or non-recommendation recreation drops attribution
Story: US-036K-009
Given a recommendation-added line
When the customer replaces it with a different product, or removes it and later recreates it without a recommendation action
Then the resulting line is not attributed to the earlier recommendation
Mandatory in acceptance slice: YES

AC-036K-009-05 — A later recommendation add starts a new assisted lineage
Story: US-036K-009
Given the customer later adds the product again through a recommendation action
When that new line survives to a purchased Order
Then that purchase starts a new recommendation-assisted lineage
Mandatory in acceptance slice: YES

AC-036K-009-06 — View-through is not V1 assistance
Story: US-036K-009
Given the customer saw a recommendation and did not add it through the recommendation action
When they later purchase that item by another path
Then the purchase is not recommendation-assisted in V1
Mandatory in acceptance slice: YES
```

```text
AC-036K-010-01 — V1 ranking is deterministic and rule-based
Story: US-036K-010
Given the same eligible candidate set, relationships, priorities, evidence, and context
When ranking runs again
Then the order is rule-based and repeatable for that same input
And no machine-learning recommendation platform is required
Mandatory in acceptance slice: YES

AC-036K-010-02 — Commercial priority and contribution rank only eligible candidates
Story: US-036K-010
Given several eligible candidates and one higher commercial priority or contribution signal
When ranking runs
Then that signal may change order inside the eligible set
And an ineligible item remains absent even if its priority or contribution is higher
Mandatory in acceptance slice: YES

AC-036K-010-03 — Exact weights are not a product contract
Story: US-036K-010
Given operator or customer communication about recommendations
When priority is explained
Then no exact numeric ranking weight is promised as product behaviour
Mandatory in acceptance slice: YES

AC-036K-010-04 — Internal merchandising rationale stays internal
Story: US-036K-010
Given priority or contribution changed the order of eligible items
When the customer views the set
Then customer-visible content does not state commercial priority, contribution, margin, or an equivalent internal merchandising rationale
And any exact wording of that absence is the linked Experience Definition
Mandatory in acceptance slice: YES
```

```text
AC-036K-011-01 — Popularity treatment uses the direct-order evidence rule
Story: US-036K-011
Given the selected outlet has at least 30 successfully purchased BOBA Bear direct Orders in the trailing 30 days
When a popularity treatment is applied
Then only the top 3 eligible products by purchased unit count in the relevant category may receive that treatment
And aggregator or non-direct orders are outside that evidence
And the exact customer word for that treatment is the linked Experience Definition
Mandatory in acceptance slice: YES

AC-036K-011-02 — Insufficient evidence produces no popularity claim
Story: US-036K-011
Given the outlet has fewer than 30 qualifying purchased Orders, or the evidence cannot be evaluated
When recommendations are presented
Then no popularity treatment is applied
And eligible recommendations may still be presented without that claim
Mandatory in acceptance slice: YES

AC-036K-011-03 — Popularity treatment is not a launch dependency
Story: US-036K-011
Given no qualifying popularity evidence exists
When Product, Customization, and Cart recommendations otherwise function
Then ordering and recommendations that do not use popularity treatment are not blocked
Mandatory in acceptance slice: YES

AC-036K-011-04 — A false popularity claim is forbidden
Story: US-036K-011
Given a product is outside the top 3 eligible products by purchased unit count in the relevant category, or the evidence threshold is unmet
When customer-visible semantics are produced
Then that product does not receive a popularity treatment
Mandatory in acceptance slice: YES
```

```text
AC-036K-012-01 — Authorized operator defines a relationship
Story: US-036K-012
Given a workforce operator already authorized for the applicable commercial configuration scope
When they define a relationship
Then they can set source product or category, target product or category, relationship kind, supported V1 placements, relative priority, and an optional effective period
And supported V1 placements for this relationship are Product Detail and Cart
And Customization is not a supported placement for this relationship
And this relationship does not name a variant target or a modifier target
Mandatory in acceptance slice: YES

AC-036K-012-02 — Activate and disable affect new recommendation use
Story: US-036K-012
Given an authorized operator activates a relationship
When a new set is produced and the target passes hard eligibility
Then the relationship may be used
When they disable it, or its effective period is outside now
Then new sets stop using it
Mandatory in acceptance slice: YES

AC-036K-012-03 — Disable does not remove cart lines already added
Story: US-036K-012
Given a customer already added a line from that relationship
When the operator disables the relationship
Then that cart line remains until ordinary cart or checkout rules change it
Mandatory in acceptance slice: YES

AC-036K-012-04 — Unauthorized actor is denied
Story: US-036K-012
Given a workforce or customer actor who is not authorized for the applicable commercial configuration scope
When they attempt to define, activate, or disable a recommendation relationship
Then the action is denied
And no relationship changes
Mandatory in acceptance slice: YES

AC-036K-012-05 — Cross-scope actor is denied
Story: US-036K-012
Given an operator authorized only for a different commercial scope
When they attempt to administer a relationship outside that scope
Then the action is denied
And the other scope is unchanged
Mandatory in acceptance slice: YES

AC-036K-012-06 — A relationship cannot make an ineligible item purchasable
Story: US-036K-012
Given an active high-priority relationship whose target fails assortment, availability, price, fulfilment, outlet, or configuration eligibility
When a customer set is produced
Then the target is not shown as purchasable
Mandatory in acceptance slice: YES
```

```text
AC-036K-013-01 — Holdout design readiness is directional
Story: US-036K-013
Given V1 design and measurement readiness for recommendations
When the holdout policy is assessed for Product acceptance
Then the policy supports a controlled recommendation holdout
And the target direction is approximately 10%, stable for the active ordering session or cart
And actual activation of that share on real sessions is not required to pass Product acceptance
And the assignment mechanism remains ARCHITECTURE_FIT_REQUIRED and is not selected here
Mandatory in acceptance slice: NO

AC-036K-013-02 — An assigned holdout suppresses recommendation presentation only
Story: US-036K-013
Given a customer assigned to the recommendation holdout
When that customer uses Product Detail, Customization, or Cart
Then recommendation presentation is suppressed
And catalog, availability, pricing, promotions, fulfilment, Cart, Checkout, Payment, and entitlements are unchanged
And the exact absence treatment is the linked Experience Definition
Mandatory in acceptance slice: YES

AC-036K-013-03 — Holdout changes recommendation presentation only
Story: US-036K-013
Given a customer assigned to the recommendation holdout
When the customer orders
Then catalog, availability, prices, promotions, fulfilment, cart behaviour, Checkout, Payment, and entitlements match the commerce they would otherwise have without a recommendation change
Mandatory in acceptance slice: YES

AC-036K-013-04 — Customers who are not in the holdout may receive recommendations
Story: US-036K-013
Given a session or cart that is not assigned to the holdout
When eligible candidates exist and recommendation presentation is otherwise allowed
Then recommendations may be presented under the V1 placement, cardinality, and eligibility rules
And approved presentation remains the linked Experience Definition
Mandatory in acceptance slice: YES

AC-036K-013-05 — Unknown assignment does not block commerce
Story: US-036K-013
Given holdout assignment cannot be determined
When the customer uses Product Detail, Customization, Cart, Checkout, or Payment
Then recommendation presentation is suppressed
And catalog, availability, prices, promotions, fulfilment, cart behaviour, Checkout, Payment, and entitlements stay on their existing commerce path
And the exact absence treatment is the linked Experience Definition
Mandatory in acceptance slice: YES
```

| Story / AC ID | Required behaviour / risk | Applicable test layers | Planned proof | Actual evidence / candidate / result |
|---|---|---|---|---|
| `US-036K-001` / `AC-036K-001-*` | Bounded complements; no padding; ignore leaves the product unchanged | Component, domain, E2E browser | Later Quality Plan. Not written in this candidate. | `NOT_EXECUTED` |
| `US-036K-002` / `AC-036K-002-*` | Customization bounds; explicit variant and add-on choice; existing customization authority; no paid preselection | Component, domain, E2E | Later Quality Plan | `NOT_EXECUTED` |
| `US-036K-003` / `AC-036K-003-*` | Cart bound, empty cart, category-gap examples, no group inference | Domain, component, E2E | Later Quality Plan | `NOT_EXECUTED` |
| `US-036K-004` / `AC-036K-004-*` | Explicit add versus configuration handoff; no silent mutation | Domain, HTTP/API, component, E2E | Later Quality Plan. Cart reuse mechanism unresolved. | `NOT_EXECUTED` |
| `US-036K-005` / `AC-036K-005-*` | Eligibility before rank; server authority; context change | Domain, authorization, integration, E2E | Later Quality Plan | `NOT_EXECUTED` |
| `US-036K-006` / `AC-036K-006-*` | Stale add rejected; commerce continues | Domain, HTTP/API, recovery, E2E | Later Quality Plan | `NOT_EXECUTED` |
| `US-036K-007` / `AC-036K-007-*` | Fail-open Product, Cart, Checkout, Payment | Integration, E2E, resilience | Later Quality Plan | `NOT_EXECUTED` |
| `US-036K-008` / `AC-036K-008-*` | Ordinary removal; suppression; menu remains; attribution boundary | Domain, component, E2E | Later Quality Plan | `NOT_EXECUTED` |
| `US-036K-009` / `AC-036K-009-*` | Distinct measurement meanings and assisted-purchase rule | Domain, integration | Later Measurement Plan. Schema not selected. | `NOT_EXECUTED` |
| `US-036K-010` / `AC-036K-010-*` | Deterministic rank inside eligibility; weights not contracted; rationale hidden | Domain, component | Later Quality Plan | `NOT_EXECUTED` |
| `US-036K-011` / `AC-036K-011-*` | Popularity evidence rule and no false popularity claim | Domain, component | Later Quality Plan | `NOT_EXECUTED` |
| `US-036K-012` / `AC-036K-012-*` | Authorized product or category relationship administration for Product Detail and Cart; Customization is not a placement of that relationship; deny unauthorized and cross-scope; disable leaves cart lines | Authorization, domain, E2E | Later Quality Plan. Exact permission mapping unresolved. | `NOT_EXECUTED` |
| `US-036K-013` / `AC-036K-013-02` through `AC-036K-013-05` | When holdout is assigned, presentation is suppressed and commerce is unchanged. Unknown assignment does not block commerce. | Domain, component, E2E | Later Quality Plan for the observable boundary. | `NOT_EXECUTED` |
| `AC-036K-013-01` | Design-ready holdout direction of approximately 10%. Not a live-activation acceptance outcome. | Measurement readiness | Later Measurement/Instrumentation Plan finalizes assignment unit, population, actual control percentage and activation, primary metric, guardrails, observation rule, stop condition, and interpretation rule. `INSUFFICIENT_EVIDENCE` remains valid. | `NOT_EXECUTED` |
| Golden journeys in section 20 | First order, availability, and menu launch still complete | E2E browser, Golden Journey regression | Later Quality Plan | `NOT_EXECUTED` |

Database integration applies only if Architecture Fit later introduces durable state. It is not selected here. Founder UAT is required later and is not this candidate's evidence.

## 11. Business rules

| Rule ID | User/business rule | Authority / rationale | Story / AC IDs |
|---|---|---|---|
| `BR-036K-001` | Showing a recommendation does not add it, change a variant, or select a paid modifier. | D-369 / ARCH-G20. Discovery RRD direction: presentation is not purchase intent. | `US-036K-001`, `US-036K-004` |
| `BR-036K-002` | Hard eligibility filtering happens before ranking. | Discovery pipeline converted to product rule. | `US-036K-005`, `US-036K-010` |
| `BR-036K-003` | Assortment, availability, price, fulfilment, outlet or context, and configuration remain existing commerce authorities. | ARCH-G05, ARCH-G19, D-368. | `US-036K-005` |
| `BR-036K-004` | Recommendations do not create discounts, promotions, offers, coupons, campaigns, or a second price. | D-382 promotions boundary remains binding. | `US-036K-005`, `US-036K-010` |
| `BR-036K-005` | Placement maxima are ceilings, not quotas. Zero or fewer is valid. Weak or ineligible candidates are not used as padding. Recommendations remain secondary and optional. | RRD-02. | `US-036K-001`, `US-036K-002`, `US-036K-003` |
| `BR-036K-006` | Cart recommendations require at least one cart line. An empty cart keeps the existing empty-cart experience. | RRD-06. | `US-036K-003` |
| `BR-036K-007` | Cart gap uses category presence or absence only. The accepted examples are main + side and no beverage → beverage; beverage only → food; main and no complementary side → side. V1 does not infer diner count, group size, too few drinks, quantity balancing, per-person beverage need, or family or group composition. | RRD-07. Examples use categories already owned by catalog authority. | `US-036K-003` |
| `BR-036K-008` | Direct add is allowed only where existing commerce already permits that mutation without further choices. Otherwise the existing configuration flow is reused. | Discovery direct-add boundary. | `US-036K-004` |
| `BR-036K-009` | A positive-price modifier becomes purchase intent only through explicit customer selection under existing customization. Zero-price standard defaults stay with that authority. | D-369 / ARCH-G20. | `US-036K-002`, `US-036K-004` |
| `BR-036K-010` | Recommendation generation or ranking failure does not block Menu, Product, Cart, Checkout, or Payment, and does not write cart intent. | Discovery failure model, now a product rule. Mechanism remains Architecture Fit. | `US-036K-007` |
| `BR-036K-011` | A stale or unavailable recommendation add is rejected by existing commerce validation, explains the item through existing recovery, and leaves Cart, Checkout, and Payment usable. | Discovery journeys J. | `US-036K-006` |
| `BR-036K-012` | Removing a recommendation-added line uses normal cart removal and then suppresses that exact candidate from recommendation placements for the rest of the active cart or session. | RRD-03. | `US-036K-008` |
| `BR-036K-013` | Suppression does not change menu or catalog truth. A later manual add does not inherit the removed recommendation's attribution. A new cart or session may recommend the item again. | RRD-03, RRD-08. | `US-036K-008`, `US-036K-009` |
| `BR-036K-014` | Recommendation-assisted attribution requires presentation, add through the recommendation action, and the same underlying item or line on the purchased Order. | RRD-08. | `US-036K-009` |
| `BR-036K-015` | Quantity changes and valid modifier or configuration changes preserve attribution while that underlying identity remains. | RRD-08. | `US-036K-009` |
| `BR-036K-016` | View-through is not V1 recommendation-assisted attribution. | Discovery RR-US-123. | `US-036K-009` |
| `BR-036K-017` | V1 ranking is deterministic and rule-based. Exact ranking weights are not a product, customer, or operator contract. | Discovery ranking section. | `US-036K-010` |
| `BR-036K-018` | Commercial priority and contribution may reorder only candidates that already passed eligibility. | Discovery commercial-priority boundary. | `US-036K-010`, `US-036K-012` |
| `BR-036K-019` | Popularity treatment is permitted only when the selected outlet has at least 30 successfully purchased BOBA Bear direct Orders in the trailing 30 days, and only for the top 3 eligible products by purchased unit count in the relevant category. Aggregator or non-direct orders are outside that evidence. Otherwise the treatment is not applied. The exact customer word is the Experience Definition. | RRD-01. | `US-036K-011` |
| `BR-036K-020` | Popularity treatment is not a launch dependency. Ordering continues when the claim cannot be made. | RRD-01. | `US-036K-011` |
| `BR-036K-021` | Only an actor already authorized for the applicable commercial configuration scope may administer recommendation relationships. Unauthorized and cross-scope actors cannot. | ARCH-G23, ARCH-G25, D-373. Exact permission mapping is Architecture Fit. | `US-036K-012` |
| `BR-036K-022` | Disabling a relationship, or being outside its effective period, stops new recommendation use and does not remove cart lines already added. | Discovery journey O. | `US-036K-012` |
| `BR-036K-023` | V1 design and measurement readiness must support a controlled recommendation holdout. The target direction is approximately 10%, stable for the active ordering session or cart. When a customer is assigned to that holdout, recommendation presentation is suppressed only. Holdout does not change catalog, availability, pricing, promotions, fulfilment, Cart, Checkout, Payment, or entitlements. Actual activation of that share on real sessions is not a Product acceptance outcome. The assignment mechanism remains `ARCHITECTURE_FIT_REQUIRED`. Before implementation authorization, where required, the later Measurement/Instrumentation Plan finalizes assignment unit, population, actual control percentage and activation, primary metric, guardrails, observation rule, stop condition, and interpretation rule. `INSUFFICIENT_EVIDENCE` remains valid. This rule does not select an assignment algorithm, persistence, vendor, event transport, or schema. Exact customer silence is the Experience Definition. | RRD-04. | `US-036K-013` |
| `BR-036K-024` | Limited Drop is not a mandatory V1 acceptance dependency. Static `/#drops` marketing is not Drop commerce authority. | D-383; repository evidence. | Section 23 |
| `BR-036K-025` | If a future candidate is both an authoritative Limited Drop and commercial priority, customer-facing semantics use Limited Drop. Internal commercial priority stays internal. | RRD-05, preserved as a future rule. | Section 23 |
| `BR-036K-026` | Customer-visible semantics must not show internal strategy names, relationship enum names, commercial priority, contribution, or margin rationale, and must not falsely claim co-purchase, personalization, trend, or savings. Exact approved presentation, including placement headings, neutral supporting copy, conditional popularity wording, and holdout silence, is the Experience Definition. | RRD-02, RRD-05, LANG-1. | `US-036K-001`, `US-036K-010`, `US-036K-011` |
| `BR-036K-027` | Relationship vocabulary and selection strategy are distinct. Where discovery sources a relationship, `COMPLEMENTS`, `UPSELLS_TO`, `PAIR_WITH`, `ADD_ON`, and `ALTERNATIVE` stay distinct and are not a generic related-products bucket. `ALTERNATIVE != SILENT_SWAP`. This definition does not make `ALTERNATIVE` a separate V1 recommendation strategy. Selection behaviour adopted for V1 is complementary suggestion on Product Detail, variant or add-on upsell inside existing customization under `BR-036K-031`, cart category-gap, commercial-priority ranking among already eligible candidates, and conditional popularity treatment under `BR-036K-019`. Limited Drop stays dependency-conditional. Persistence shape is Architecture Fit. | Discovery relationship model and strategy catalogue. | `US-036K-002`, `US-036K-004`, `US-036K-012` |
| `BR-036K-028` | Eligibility is decided on the server from existing commerce truth. | ARCH-G11. | `US-036K-005` |
| `BR-036K-029` | Displaying a candidate does not reserve stock, price, or eligibility. | Discovery direct-add section. | `US-036K-004` |
| `BR-036K-030` | V1 measurement distinguishes set render, item impression, click, add attempt, successful add, removal, and recommendation-assisted purchase. This rule does not choose storage, transport, schema, or vendor. | Discovery analytics vocabulary. | `US-036K-009` |
| `BR-036K-031` | V1 Customization recommendations are produced from the current product's existing variant and modifier customization authority. A variant upgrade uses existing product or variant authority already attached to the current product. A modifier or add-on uses existing customization or modifier authority already attached to the current product. There is no parallel customization authority, no new variant identity, and no new modifier identity. The bounds remain at most 3 recommendations in total, at most 1 variant upgrade, and at most 2 add-ons. Those recommendations are not produced by an operator-authored recommendation relationship. For the V1 operator relationship, source identity is product or category and target identity is product or category. Supported placements for that relationship are Product Detail and Cart. Customization is not a supported placement of that relationship in V1. Future operator-authored variant or modifier targeting requires a later Product decision before Architecture Fit may design it. This rule does not add a variant target type, a modifier target type, a new relationship target kind, a new schema, a new permission, or a new role. | Architect review `5380003366`, resolving the formal gap between RR-US-010 / RR-US-020 and RR-US-200 / RR-US-201 without expanding discovery scope. | `US-036K-002`, `US-036K-012`, `AC-036K-002-06`, `AC-036K-012-01` |

V1 customer placement bounds. Maxima are ceilings, not quotas. Presentation belongs to the Experience Definition. Customization remains a customer placement. It is not a placement of the operator product or category relationship (`BR-036K-031`).

| Placement | Maximum | Composition | Operator product/category relationship |
|---|---|---|---|
| Product Detail | 3 | Complementary recommendations. A V1 customer recommendation placement. | Supported. |
| Customization | 3 total | At most 1 variant upgrade and at most 2 add-ons, from the current product's existing variant and modifier authority. | Not a relationship placement in V1. |
| Cart | 4 | Requires at least one cart line. | Supported. |

## 12. Journey Completeness Matrix

Customer journeys `JOURNEY-036K-PRODUCT-DETAIL`, `JOURNEY-036K-CUSTOMIZATION`, and `JOURNEY-036K-CART` share the rows below. Cart-only differences are named in the cell.

| Journey dimension | Behaviour / applicability or N/A reason | Story / AC references |
|---|---|---|
| ENTRY | Product Detail and Customization open from existing product flow. Cart opens from the existing cart. Direct links to those existing surfaces still work. Recommendations are secondary modules on those surfaces. | `US-036K-001`, `US-036K-002`, `US-036K-003` |
| DISCOVERY | The customer can notice an optional recommendation set. Approved headings and other presentation are the Experience Definition. Menu browse ranking is follow-up, so Menu itself is not a recommendation placement. | `AC-036K-001-04`, `AC-036K-003-02` |
| CONTEXT | Selected outlet and fulfilment context, including Delivery, Pickup, and Scheduled when present, constrain eligibility. Cart gap also uses categories already in the cart. | `AC-036K-005-03`, `AC-036K-003-03` |
| EMPTY / FIRST USE | Zero eligible recommendations is valid. Empty cart shows no cart recommendation module. No operator relationship yet means no product or category relationship candidate on Product Detail or Cart, and commerce still works. Customization recommendations still come from the current product's existing variant and modifier authority when those options are eligible. | `AC-036K-001-02`, `AC-036K-002-06`, `AC-036K-003-02`, `US-036K-012` |
| HAPPY PATH | Eligible bounded sets, explicit add, ordinary cart intent, assisted attribution when the line is purchased. | `AC-036K-001-01`, `AC-036K-004-01`, `AC-036K-009-02` |
| ALTERNATE VALID PATHS | Ignore all suggestions. Direct add when commerce allows. Configuration handoff when it does not. Fewer than the maximum. No popularity treatment when evidence is insufficient. | `AC-036K-001-03`, `AC-036K-004-02`, `AC-036K-011-02` |
| VALIDATION FAILURE | Ineligible and incompatible candidates are omitted. A stale add fails existing commerce validation. | `AC-036K-005-01`, `AC-036K-006-02` |
| AUTHORIZATION | Customers use existing storefront access. Workforce create, activate, and disable require existing commercial-configuration authorization. | `AC-036K-012-04`, `AC-036K-012-05` |
| NOT FOUND / STALE REFERENCE | Unknown, expired, disabled, or no-longer-purchasable candidates are absent from new sets. A stale add is rejected. | `AC-036K-006-01`, `AC-036K-012-02` |
| SERVER / NETWORK ERROR | Recommendation generation or ranking failure removes the module and leaves Product, Cart, Checkout, and Payment usable. | `AC-036K-007-01` |
| RECOVERY | Stale rejection explains the item and returns the customer to the usable cart. Ordering can continue with zero suggestions. | `AC-036K-006-02`, `AC-036K-003-08` |
| CONCURRENCY | Add revalidates at action time. Overlapping operator edits cannot publish an ineligible item. Duplicate add follows existing cart line identity. Exact locks are Architecture Fit. | `AC-036K-004-04`, `AC-036K-012-06` |
| DESTRUCTIVE ACTION | Cart removal is the existing cart removal action. It suppresses that recommendation candidate afterward. Disabling a relationship is not a cart wipe. | `AC-036K-008-01`, `AC-036K-012-03` |
| SUCCESS FEEDBACK | A successful recommendation add shows the same cart success the existing add path shows. | `AC-036K-004-01` |
| DOWNSTREAM EFFECT | Accepted lines flow through existing Cart, Checkout Snapshot, Payment, and Order. Holdout and failure do not change those authorities. | `AC-036K-009-02`, `AC-036K-013-03` |
| REVISIT / RELOAD | Suppression lasts for the active cart or session across reload. A new cart or session may recommend again. When a holdout assignment is used, it stays stable for that session or cart. | `AC-036K-008-02`, `AC-036K-008-05`, `AC-036K-013-02` |
| RESPONSIVE / MOBILE | The same bounds, explicit-add rule, and fail-open rule apply on mobile and desktop. Interaction detail is in the Experience Definition. | `US-036K-001` through `US-036K-004` |
| ACCESSIBILITY | Recommendation actions are reachable and named as optional. Ignoring them does not trap the primary task. Detail is in the Experience Definition. | Experience `XR-IMP-036K-013`, `XR-IMP-036K-014` |

Workforce journey `JOURNEY-036K-WORKFORCE` uses the authorization, destructive, concurrency, and empty rows above. It has no customer checkout happy path.

## 13. UX state matrix

Observable behaviour is defined here. Presentation, focus detail, and copy tone live in the Experience Definition.

| Surface / state | Entry condition | Visible feedback / available actions | Focus / keyboard behaviour | Next / recovery state | AC ID or N/A reason |
|---|---|---|---|---|---|
| Product Detail / ready | Eligible complements exist and the customer is not in an assigned holdout | At most 3 complements; primary product actions remain available. Heading is Experience Definition. | Experience Definition | Explicit add, ignore, or configuration handoff | `AC-036K-001-01` |
| Customization / ready | Eligible existing variant upgrade or add-on exists on the current product | At most 1 variant upgrade and 2 add-ons, 3 total, from existing customization authority. Heading is Experience Definition. | Experience Definition | Existing customization continues | `AC-036K-002-01`, `AC-036K-002-06` |
| Cart / ready | At least one cart line and an eligible suggestion | At most 4; checkout remains available. Heading is Experience Definition. | Experience Definition | Add, ignore, or checkout | `AC-036K-003-01` |
| Any placement / loading | A set is still being produced | Primary Product, Customization, or Cart task remains usable | Experience Definition | Ready, empty, or fail-open | `AC-036K-007-01` |
| Any placement / empty | No eligible candidate, or cart has no lines | No padded candidates. Empty cart shows no recommendation module | Primary task keeps focus availability | Continue ordering | `AC-036K-001-02`, `AC-036K-003-02` |
| Explicit add / success | Existing commerce accepts the add | Existing cart success | Experience Definition | Cart contains the line | `AC-036K-004-01` |
| Configuration required | Commerce does not allow direct add | Existing customization opens | Experience Definition | Add only after valid configuration | `AC-036K-004-02` |
| Stale / validation failure | Candidate no longer purchasable at add | Existing commerce recovery explanation; cart otherwise intact | Experience Definition | Customer continues with the remaining cart | `AC-036K-006-02` |
| Server / network failure | Generation or ranking fails | No blocking recommendation error. Module absent. | Primary task remains operable | Ordering continues | `AC-036K-007-01` |
| Removal | Customer removes a recommendation-added line | Ordinary cart removal result. Item remains on the menu. | Experience Definition | Candidate suppressed for this cart or session | `AC-036K-008-01` |
| Holdout | Customer assigned to the recommendation holdout | Recommendation presentation suppressed. Commerce unchanged. Exact silence is Experience Definition. | N/A — nothing extra to focus | Normal commerce | `AC-036K-013-02` |
| Workforce / ready | Authorized operator opens relationship administration | Can define a product or category relationship for Product Detail and Cart, then activate or disable it within scope. Customization is not a placement of that relationship. | Experience Definition | Effective for new Product Detail and Cart sets after activation | `AC-036K-012-01` |
| Workforce / denied | Actor lacks scope | Action denied; configuration unchanged | Experience Definition | Remain without a successful write | `AC-036K-012-04` |
| Workforce / disable | Authorized disable | New Product Detail and Cart sets stop using that relationship. Existing cart lines remain. Customization recommendations from existing customization authority continue. | Experience Definition | Cart unchanged by the disable | `AC-036K-012-03` |

Pending mutation, concurrency conflict, and destructive confirmation use the existing cart and existing administration confirmations. This candidate does not add a second confirmation that implies the menu item was deleted.

## 14. Permissions / resource context

| Action | Existing identity / permission authority | Resource context / server-derived scope | Allowed / denied / cross-scope variants | AC IDs |
|---|---|---|---|---|
| View customer recommendations | Customer storefront. No new permission. | Selected outlet and fulfilment context already used by Menu, Product, and Cart | Eligible customers see eligible items only. An assigned holdout suppresses recommendation presentation. | `AC-036K-005-03`, `AC-036K-013-02` |
| Add from a recommendation | Existing cart mutation authority | The active cart owned by the current guest or customer principal | Allowed only through explicit action and current commerce validation. A client-supplied ineligible item is denied. | `AC-036K-004-04`, `AC-036K-005-04` |
| Remove a recommendation-added line | Existing cart removal authority | That same cart | Allowed as ordinary removal. Does not grant catalog deletion. | `AC-036K-008-01` |
| Define, activate, or disable a product or category relationship | Existing workforce commercial-configuration authorization. Server-validated workforce session and server-derived scope. ARCH-G23, ARCH-G25, D-373. IMP-036F records existing catalog, menu, assortment, pricing, and promotion permissions and states no new permission model for that slice. | The commercial scope the actor already holds. Relationship placements are Product Detail and Cart. | Allowed inside that scope. Denied for unauthorized actors. Denied across scopes. This action does not create a variant identity, a modifier identity, a new permission, or a new role. | `AC-036K-012-01`, `AC-036K-012-04`, `AC-036K-012-05` |

Which of the existing permission and resource pairs enforces recommendation administration is `ARCHITECTURE_FIT_REQUIRED`. This candidate does not name a new permission, role, or delegation.

Caller-supplied roles, permissions, or pre-authorized flags are not authority (ARCH-G08, ARCH-G23, ARCH-G25).

## 15. Data implications

Existing authorities stay in place: Catalog and Menu identity, assortment, availability, pricing, customization, Cart purchase intent, Checkout Snapshot payable truth, Payment collection, and Order lifecycle.

This capability needs to remember, by some later architecture:

- operator relationships: source product or category, target product or category, kind, supported placements limited to Product Detail and Cart, relative priority, optional effective period, active or disabled
- which exact candidate was suppressed for an active cart or session
- whether a purchased line was recommendation-assisted under the continuity rules
- whether a session or cart is in the recommendation holdout
- aggregate purchased-unit evidence for the popularity rule

It does not choose tables, aggregates, event transport, schema, or a second price book. Display does not freeze price or availability. Historical purchased Orders remain the popularity evidence source and are not rewritten. Checkout Snapshot remains the payable truth for a purchased recommendation add. Customization recommendations are read from existing variant and modifier configuration. They are not stored as an operator relationship and they do not add a variant or modifier target.

Category labels in the cart-gap examples are illustrations of presence and absence against categories the catalog already owns. This candidate does not create a new category taxonomy. How a category rule resolves to products is Architecture Fit.

## 16. Security/privacy

Recommendations are a storefront projection plus workforce configuration. They do not become a new trust boundary that bypasses customer/workforce separation (ARCH-G04) or browser authority limits (ARCH-G11).

Customer-visible data is limited to products the customer could already be offered as purchasable. Exact headings, neutral supporting copy, conditional popularity wording, and holdout silence are the Experience Definition. Internal priority, contribution, margin, holdout assignment explanations, and relationship enum names are not customer content.

Analytics meanings must not include payment secrets, raw credentials, or another customer's cart. Aggregate purchased-unit counts are not a customer-identifiable public profile.

Abuse cases the acceptance slice must deny:

- forging a recommendation payload to add an ineligible or cross-outlet item
- using a disabled relationship or a stale displayed candidate to skip current cart validation
- an unauthorized or cross-scope workforce write
- treating a recommendation as a discount or price override

No new customer identity, loyalty profile, or psychographic profile is created.

## 17. Concurrency/recovery

Observable requirements:

- Two displays of the same eligible inputs produce a rule-based order (`AC-036K-010-01`). Exact weight values are not contracted.
- The add that follows a display is validated again by existing commerce. If eligibility was lost, the add fails and the previous cart remains (`AC-036K-006-02`).
- Repeated explicit adds follow existing cart coalescing and quantity rules. Recommendations do not create a second line-identity authority.
- If an operator disables a relationship while a customer is viewing it, new sets stop using it. A line already added stays. An add attempted after the target is no longer purchasable fails closed under existing validation.
- If generation fails part-way, no recommendation-authored cart write is committed (`AC-036K-007-02`).
- Suppression survives reload of the same active cart or session and does not survive into a different cart or session (`AC-036K-008-05`).
- Holdout assignment, when used, stays stable if the customer reloads that session or cart (`AC-036K-013-02`). How assignment is performed remains Architecture Fit.

Existing cart revision and unit-sequence authority remain binding (ARCH-G09, ARCH-G22, D-371). This candidate does not invent a new retry, lock, or idempotency protocol. How display-to-add revalidation and suppression are represented is Architecture Fit.

## 18. Accessibility/responsive expectations

The same product rules apply at mobile and desktop widths used by the existing ordering experience. A recommendation module is secondary: the primary product, customization, cart, and checkout actions remain available and are not displaced into an unreachable state.

Keyboard users can reach a visible recommendation action and can move past the module to the primary action. Screen readers can tell that the suggestions are optional and can hear success, rejection, and removal through the existing cart feedback plus the Experience Definition announcements.

Ignoring recommendations, seeing zero recommendations, or being in the holdout must leave the primary journey operable. Detailed requirements are `XR-IMP-036K-012`, `XR-IMP-036K-013`, and `XR-IMP-036K-014` in the Experience Definition. Automated scans alone will not prove those requirements.

## 19. Observability/supportability if applicable

A support explanation needs to distinguish: no eligible candidate, holdout, generation failure, eligibility rejection, customer removal with suppression, and operator disable. Those situations have different customer effects and must not be collapsed into a false “item removed from the menu” explanation.

Customer-facing failure copy stays with existing commerce recovery and the Experience Definition. Internal ranking weights, contribution values, and permission names are support or operator diagnostics, not customer copy.

This candidate does not add a new telemetry platform. Existing request correlation and workforce authorization failure evidence remain the operational baseline. Measurement meanings in `US-036K-009` are for product learning and are specified further in the Experience Definition without selecting transport.

## 20. Golden Journeys affected

| GJ ID / registry status | Affected steps / downstream behaviour | Mandatory for this acceptance? | Related story / AC IDs | Required proof / actual evidence |
|---|---|---|---|---|
| `GJ-FIRST-ORDER` / `CURRENT` | Discover, configure, cart, checkout, pay, and confirmation must still complete when recommendations are present, empty, failed, ignored, or held out. | YES, as a non-regression of the accepted path. Completing a first order does not require accepting a recommendation. | `US-036K-003`, `US-036K-004`, `US-036K-007`, `US-036K-013` | Real-browser proof later. `NOT_EXECUTED`. |
| `GJ-RETURNING-ORDER` / `PARTIAL` | A later manual add is not recommendation-attributed merely because a previous session showed or removed the item. Order Again remains outside this slice. | NO as a new Order Again journey. YES that this slice does not create an Order Again shortcut. | `AC-036K-008-04`, `AC-036K-009-06` | Later. `NOT_EXECUTED`. |
| `GJ-AVAILABILITY` / `CURRENT` | Availability changes remove candidates from new sets and reject stale adds. Recommendations do not publish a second availability decision. | YES | `US-036K-005`, `US-036K-006` | Later. `NOT_EXECUTED`. |
| `GJ-PRODUCT-MENU-LAUNCH` / `CURRENT` | Operator commercial configuration remains the source of what is sold. Recommendation relationships are additional and cannot override that launch path. | YES | `US-036K-012`, `US-036K-005` | Later. `NOT_EXECUTED`. |
| `GJ-PAYMENT-RECOVERY` / `CURRENT` | Recommendation failure or holdout must not block payment retry or change payment truth. | YES as a non-regression | `AC-036K-007-01`, `AC-036K-013-03` | Later. `NOT_EXECUTED`. |
| `GJ-STORE-PAUSE-RESUME` / `CURRENT` | Pause and resume stay store-operations authority. A paused outlet's existing orderability is an eligibility input, not a recommendation decision. | NO new behaviour. Existing eligibility consumption only. | `AC-036K-005-01` | N/A beyond existing journey proof, unless Fit shows a direct interaction. |
| `GJ-TRADING-HOURS` / `CURRENT` | Trading hours stay existing eligibility. | NO new behaviour | `AC-036K-005-01` | Same as pause/resume. |
| `GJ-ADDRESS-SERVICEABILITY` / `CURRENT` | Address and serviceability stay existing authorities. Fulfilment context only filters candidates. | NO new behaviour | `AC-036K-005-03` | Later only if a delivery-context recommendation is in the acceptance browser journey. |
| `GJ-PERMITTED-OUTLET-ACCESS` / `CURRENT` | Recommendation administration reuses permitted workforce scope. It does not add provisioning. | NO new provisioning. Authorization denial in this slice is mandatory. | `AC-036K-012-04`, `AC-036K-012-05` | Later authorization tests. |
| `GJ-CANCELLATION-REFUND` / `CURRENT` | Cancellation and refund are unchanged. | NO | N/A | N/A |

Registry status is not a test verdict.

## 21. Dependencies

| Dependency | Authority / verified state | Required before which story or gate? | Unresolved impact |
|---|---|---|---|
| D-383 parallel definition authorization | CURRENT in DR-24 | This candidate | NONE for drafting |
| Existing catalog, menu, assortment, availability, pricing, customization, cart, checkout, payment, order | Accepted foundations and ARCH-R23 | All customer stories | NONE for product meaning. Projection mechanics are Architecture Fit. |
| D-368 Menu read model; D-369 paid-modifier selection | CURRENT | `US-036K-004`, `US-036K-005` | NONE |
| IMP-036J promotions authority | Current slice; implementation authorized, not the subject of this document | Boundary only: recommendations must not become promotions | NONE if BR-036K-004 holds |
| Authoritative Limited Drop source | `NOT_FOUND` as commerce authority | Not required for V1 | Limited Drop stays dependency-conditional |
| Architecture Fit | `NOT_PERFORMED` | Implementation readiness | Open mechanism questions in section 25. Product behaviour is still defined. |
| Experience Gate | `PASS` (Architect review `5380398013`) | Passed before Architecture Fit | NONE. This is not Design Readiness. |
| Design Readiness, Quality Plan, Measurement Plan | `NOT_PERFORMED` | Implementation authorization | Stories stay `NOT_READY_FOR_IMPLEMENTATION` |

## 22. Supported now

| Behaviour | Existing verified or V1 acceptance commitment? | Story / AC IDs / source |
|---|---|---|
| Menu, customization, cart, checkout, and payment without recommendations | Existing verified on source main | Section 5; no recommendation matches under `src/` |
| Product Detail complements, maximum 3 | V1 acceptance commitment | `US-036K-001` |
| Customization variant and add-on bounds from existing customization authority | V1 acceptance commitment | `US-036K-002`, `BR-036K-031` |
| Cart completion set and category-gap examples | V1 acceptance commitment | `US-036K-003` |
| Explicit add or existing configuration handoff | V1 acceptance commitment | `US-036K-004` |
| Hard eligibility before ranking | V1 acceptance commitment | `US-036K-005` |
| Stale add rejection and recovery | V1 acceptance commitment | `US-036K-006` |
| Fail-open commerce | V1 acceptance commitment | `US-036K-007` |
| Removal, suppression, and attribution boundary | V1 acceptance commitment | `US-036K-008`, `US-036K-009` |
| Deterministic ranking inside eligibility | V1 acceptance commitment | `US-036K-010` |
| Conditional popularity treatment | V1 acceptance commitment; not a launch dependency | `US-036K-011` |
| Workforce product or category relationship administration for Product Detail and Cart, inside existing authorization | V1 acceptance commitment | `US-036K-012`, `BR-036K-031` |
| Controlled recommendation holdout policy | V1 design and measurement readiness. Approximately 10% is the target direction. Live activation of that share is not a Product acceptance outcome. | `US-036K-013`, `AC-036K-013-01` |

V1 commitments are not implemented and are not accepted.

## 23. Explicitly deferred

| `EXPLICITLY_DEFERRED` behaviour | FOLLOW_UP or DEFERRED | Reason / consequence | Revisit dependency / decision owner |
|---|---|---|---|
| `MENU_DISCOVERY` browse ranking | FOLLOW_UP | Menu stays assortment discovery. Cart recommendations are not a replacement feed. | Later product authorization. Discovery RR-US-170. |
| Checkout recommendations | FOLLOW_UP | Payment conversion stays protected. Checkout is not a V1 placement. | Later product authorization. RR-US-171, RR-US-322. |
| Post-purchase recommendations | FOLLOW_UP | Not required to prove ordering-journey attach. | Later product authorization. RR-US-172. |
| Quantity-aware or group inference | FOLLOW_UP | V1 category presence or absence only. | Later product authorization. RRD-07, RR-US-043. |
| View-through attribution | FOLLOW_UP | V1 assistance requires the add action. | Later measurement decision. RR-US-123. |
| Co-purchase claims | FOLLOW_UP | A customer co-purchase claim waits for real co-purchase semantics. | Later product authorization. RR-US-150. |
| Trend claims | FOLLOW_UP | A customer trend claim waits for a real trend definition. | Later product authorization. RR-US-151. |
| Personalized recommendations | FOLLOW_UP | No personalization semantics in V1. | Later product authorization. RR-US-152. |
| Reorder suggestions | FOLLOW_UP | Separate from returning-customer commerce already accepted. | Later product authorization. RR-US-152. |
| Threshold completion and offer-threshold copy | FOLLOW_UP | A commercial benefit stays with Offer or Promotion authority. | Later product authorization. RR-US-140, RR-US-160. |
| Campaign or Offer metadata as a ranking input | FOLLOW_UP | May be consumed later from its own authority. | Architecture Fit coupling question. RR-US-140. |
| ML, collaborative filtering, LLM recommendations, embeddings, vector search, external recommendation SaaS, feature store, bandits, psychographic profiling, cross-session personalization | DEFERRED | Not required for V1. | Later program decision. RR-US-153. |
| Limited Drop as a mandatory customer or operator capability | `DEPENDENCY_CONDITIONAL` | No authoritative Drop commerce source is established. Static `/#drops` is not that source. Ordering V1 does not wait for it. | A future Product and Architecture authority that proves a Drop source. Discovery RR-US-050 and RR-US-202 drop marking are not V1 acceptance. |
| Operator-authored variant or modifier targeting | Later Product decision, not V1 | The V1 operator relationship source and target are product or category. That model cannot place a relationship on Customization. Customization recommendations stay on existing customization authority. | A later Product decision is required before Architecture Fit may design any such targeting. |

Preserved future presentation rule, not a V1 dependency: if a future eligible candidate is both Limited Drop under an authoritative Drop source and commercial priority, customer-facing semantics use Limited Drop. Internal commercial priority is not shown (`BR-036K-025`, RRD-05). This candidate does not invent a Drop aggregate.

## 24. Not supported by design

| `NOT_SUPPORTED_BY_DESIGN` behaviour | Reason / authority | User-visible boundary / relevant AC |
|---|---|---|
| Silent cart addition, silent variant change, silent paid-modifier preselection | ARCH-G20, D-369 | `AC-036K-004-03` |
| Making an ineligible item purchasable through priority, margin, or a relationship | Eligibility is commerce authority | `AC-036K-012-06` |
| Recommendation-created discount, promotion, offer, coupon, or campaign | D-382 remainder | `AC-036K-005-02` |
| Checkout recommendations as a V1 default | Conversion protection | Section 23 |
| False co-purchase, trend, personalization, savings, or popularity claims | Trust; RRD-01 | `AC-036K-001-04`, `AC-036K-011-04` |
| Customer-visible commercial priority, margin, or internal merchandising rationale | RRD-05 | `AC-036K-010-04` |
| Using a recommendation failure to block payment | Fail-open commerce | `AC-036K-007-01` |
| Treating static `/#drops` as Drop commerce truth | Repository evidence; D-383 | `BR-036K-024` |
| Inventing a recommendation role or permission | D-383; ARCH-G25 | Section 14 |
| Customization as a placement of an operator-authored product or category relationship | The V1 relationship identity model has no variant or modifier target | `BR-036K-031`, `AC-036K-012-01` |
| A recommendation creating a new variant identity or a new modifier identity | Existing customization authority remains the only customization authority | `AC-036K-002-06` |
| View-through counted as V1 assisted revenue | RRD-08 | `AC-036K-009-06` |
| Suppression deleting a menu item | RRD-03 | `AC-036K-008-03` |

## 25. Unresolved / decision required

```text
OPEN_PRODUCT_DECISIONS = NONE
PRODUCT_DECISION_REQUIRED = NONE
```

No material product behaviour in the V1 acceptance slice is left to an assumption. The items below are architecture mechanisms. They do not change the observable rules already stated. Customization candidate identity is not one of those mechanisms. V1 Customization recommendations use the current product's existing variant and modifier authority. The operator relationship does not include a Customization placement or a variant or modifier target (`BR-036K-031`). Architecture Fit must not invent that Product meaning.

| `ARCHITECTURE_FIT_REQUIRED` item | Why it is not a product decision | Product behaviour already fixed by |
|---|---|---|
| Whether a durable Recommendation aggregate exists | Ownership shape, not customer outcome | Sections 2 and 15 |
| Relationship persistence and domain ownership | Storage and aggregate boundary | `US-036K-012` data implications |
| How a category rule resolves to products | Uses existing catalog categories | `BR-036K-007`, `AC-036K-003-03` through `AC-036K-003-05` |
| Where ranking executes | Placement of computation | `BR-036K-017` |
| Latency and failure boundary | How fail-open is implemented | `BR-036K-010` |
| Exact existing workforce permission and resource mapping | Which current permission enforces an already stated allow/deny | `BR-036K-021` |
| Contribution or margin projection without a second money authority | How a signal is read | `BR-036K-018` |
| Impression and attribution persistence | How meanings are stored | `BR-036K-030` |
| 10% holdout assignment mechanism | How a future assignment would be performed. Not chosen here. Live activation of the approximate 10% direction is not a Product acceptance outcome. | `BR-036K-023` |
| Which cart mutation API is reused | Transport reuse | `BR-036K-008` |
| Outlet / Delivery / Pickup / Scheduled eligibility projection | How existing context is read | `AC-036K-005-03` |
| Future Campaign or Offer metadata coupling | Deferred consumption boundary | Section 23 |
| Popularity evidence query, storage, and ranking mechanics | How the evidence rule is computed. Not chosen here. | `BR-036K-019` |
| Concurrency and revalidation between display and add | Mechanism for a defined outcome | Section 17 |
| Active-cart or session suppression representation | Mechanism for a defined outcome | `BR-036K-012` |
| Whether V1 needs new schema | Architecture consequence | Section 15 |

Assumption register:

| Claim | Class | Evidence | Risk | Validation path |
|---|---|---|---|---|
| RRD-01 through RRD-08 record Founder discovery direction | `FACT` | Discovery documents, recorded 2026-09-26 | Treating them as gate approval | This candidate labels them source material |
| Recommendations can lift contribution without harming conversion | `HYPOTHESIS` | Founder discovery direction | Optimizing clicks instead of incrementality | Later holdout measurement, not this document |
| Limited Drop has no authoritative commerce source on this main | `FACT` | `Nav.tsx` `/#drops`; D-383 text | Accidental V1 dependency | Section 23 classification |
| Existing IMP-036F permissions include a recommendation administer permission | `NOT_ASSUMED` | Exact mapping was not selected | Inventing a role | Left `ARCHITECTURE_FIT_REQUIRED` |

## 25a. Service and operational impact

The customer promise is optional, relevant, purchasable ideas. It is not a promise that a suggestion will be in stock beyond existing availability, that a price is discounted, or that operations will prepare a recommended item differently from any other cart line.

System truth is existing commerce plus the relationship and eligibility rules in this candidate. Customization suggestions read existing variant and modifier authority. Product Detail and Cart may also use an effective product or category relationship after hard eligibility. Workforce action is configuration of that relationship by an already authorized operator. Operational capability is the existing commercial-administration and storefront operation. No new store labour step is required to accept a recommendation add.

If suggestions fail, the operational promise is unchanged: the customer can still order.

## 25b. Quality Attribute Profile

| Attribute | Mark | Reason |
|---|---|---|
| Performance | `REQUIRED` | Suggestion latency must not block the primary ordering task. Experience Definition covers perceived performance. |
| Availability | `REQUIRED` | Primary commerce stays available when recommendations fail. |
| Reliability | `REQUIRED` | The same eligible inputs produce rule-based order. Assisted attribution follows the continuity rules. |
| Resilience | `REQUIRED` | Fail-open commerce and recoverable stale adds. |
| Security | `REQUIRED` | Server-side eligibility, workforce scope, no client-minted purchasability. |
| Privacy | `REQUIRED` | No new psychographic profile. Analytics must not take payment secrets or cross-customer carts. |
| Accessibility | `REQUIRED` | Optional module must not trap the primary task. |
| Responsive/device support | `REQUIRED` | Same rules on the existing mobile and desktop ordering surfaces. |
| Scalability | `N/A` for a new platform | V1 does not require a recommendation platform, feature store, or model-serving tier. Ordinary storefront load still applies. |
| Concurrency | `REQUIRED` | Display versus add, operator disable versus customer add, duplicate add. |
| Data integrity | `REQUIRED` | Cart, price, and order truth stay with existing authorities. Attribution must not survive a manual re-add. |
| Observability | `REQUIRED` | Distinguish empty, holdout, failure, rejection, removal, and disable. |
| Supportability | `REQUIRED` | Support can explain suppression versus menu availability. |
| Backward compatibility | `REQUIRED` | Existing catalog, cart, checkout, payment, and promotions behaviour remains valid when no recommendation is shown. |
| Localization/presentation | `REQUIRED` | Customer language follows LANG-1. Exact geometry waits for Design Readiness. |

## 25c. Quality, measurement, Design Readiness, and Production Readiness

| Expectation | Status |
|---|---|
| Quality / Test Plan | `NOT_PERFORMED`. Required before implementation authorization. Planned layers are in section 10. TEST-1 remains the policy. |
| Measurement intent | Required because X3. Business intent is in `US-036K-009`. Holdout design readiness is in `US-036K-013` and `BR-036K-023`. The Experience Definition states presentation, trust, and event-meaning experience. Before implementation authorization where required, the Measurement/Instrumentation Plan finalizes assignment unit, population, actual control percentage and activation, primary metric, guardrails, observation rule, stop condition, and interpretation rule. `INSUFFICIENT_EVIDENCE` remains valid. Assignment algorithm, persistence, vendor, event transport, and schema are not selected. A Measurement Plan is `NOT_PERFORMED`. |
| Design Readiness dependency | `NOT_PERFORMED`. Required for X3 after viable Architecture Fit and before implementation authorization. |
| Production Readiness applicability | `N/A` for this candidate. It will matter only after acceptance and before any production release. |
| Experience requirement IDs | `XR-IMP-036K-001` through `XR-IMP-036K-016` in the Experience Definition. |

## 26. Definition of Ready

Open material product decisions for every story below are `NONE`. Stories remain `NOT_READY_FOR_IMPLEMENTATION` because Architecture Fit, Design Readiness, Quality Plan, Measurement Plan, and implementation authorization are not performed. Experience Gate `PASS` does not make a story ready. That readiness label is not a ROADMAP state.

| Story ID | Applicable fields complete / evidence | Open material decisions | Readiness / blocker |
|---|---|---|---|
| `US-036K-001` | Sections 9–18 | NONE | `NOT_READY_FOR_IMPLEMENTATION` |
| `US-036K-002` | Sections 9–18 | NONE | `NOT_READY_FOR_IMPLEMENTATION` |
| `US-036K-003` | Sections 9–18 | NONE | `NOT_READY_FOR_IMPLEMENTATION` |
| `US-036K-004` | Sections 9–18 | NONE | `NOT_READY_FOR_IMPLEMENTATION` |
| `US-036K-005` | Sections 9–18 | NONE | `NOT_READY_FOR_IMPLEMENTATION` |
| `US-036K-006` | Sections 9–18 | NONE | `NOT_READY_FOR_IMPLEMENTATION` |
| `US-036K-007` | Sections 9–18 | NONE | `NOT_READY_FOR_IMPLEMENTATION` |
| `US-036K-008` | Sections 9–18 | NONE | `NOT_READY_FOR_IMPLEMENTATION` |
| `US-036K-009` | Sections 9–18 | NONE | `NOT_READY_FOR_IMPLEMENTATION` |
| `US-036K-010` | Sections 9–18 | NONE | `NOT_READY_FOR_IMPLEMENTATION` |
| `US-036K-011` | Sections 9–18 | NONE | `NOT_READY_FOR_IMPLEMENTATION` |
| `US-036K-012` | Sections 9–18 | NONE | `NOT_READY_FOR_IMPLEMENTATION` |
| `US-036K-013` | Sections 9–18 | NONE | `NOT_READY_FOR_IMPLEMENTATION` |

`STORY_COMPLETE != IMP_ACCEPTED`. No story is complete.

## 27. Product Definition Gate

```text
PRODUCT_DEFINITION_GATE

Capability: IMP-036K — Revenue Recommendations
Product Definition Version: PD-IMP-036K-DRAFT-1
Experience Criticality: X3
Change Risk: CR2
Linked Experience Definition: XD-IMP-036K-DRAFT-1 APPROVED
Business Outcome: PASS
Primary Personas: PASS
Journeys Defined: PASS
Story Map Complete: PASS
Acceptance Slice Defined: PASS
Happy Paths Defined: PASS
Alternate Paths Defined: PASS
Empty / First-Use States Defined: PASS
Error / Recovery Paths Defined: PASS
Authorization Variants Defined: PASS
Cross-Scope Scenarios Defined: PASS
Concurrency Considered: PASS
Destructive Actions Defined: PASS
Service / operational impact: PASS
Quality Attribute Profile: PASS
Unresolved Product Decisions: NONE
Architecture Conflicts: NONE
Architecture mechanism questions: OPEN, listed in section 25, not answered
ARCHITECT_REVIEW: 5380398013
GATE_EVALUATED_HEAD: 072932df00c445c8215c61f19f81971bf657b160
GATE_EVALUATED_TREE: a4912e6c649cad25094412ac07a005fbb441567e
CANONICAL_PATH: /home/ajoshi/repos/boba-bear-platform
EVALUATED_BRANCH: docs/imp036k-product-experience-definition
EVALUATED_HEAD: 072932df00c445c8215c61f19f81971bf657b160
EVALUATED_TREE: a4912e6c649cad25094412ac07a005fbb441567e
EVALUATED_WORKING_TREE_FINGERPRINT: f2886ed726c77301589ba36dccd602da6d44daadd7a0f2dec4e59aada3162c46
PRODUCT_DEFINITION_GATE_EXECUTION: PERFORMED
Gate Result: PASS
```

## Discovery traceability

Discovery story IDs are not formal acceptance IDs and are not gate authority. This table maps them onto the approved Product Definition.

| Discovery ID | RRD | Formal destination | Disposition |
|---|---|---|---|
| RR-US-001 | — | `US-036K-001`, `AC-036K-001-01` | V1 |
| RR-US-002 | RRD-02 | `US-036K-001`, `AC-036K-001-04`, `BR-036K-026` | V1 |
| RR-US-003 | — | `AC-036K-001-03` | V1 |
| RR-US-010, RR-US-011, RR-US-012 | — | `US-036K-002`, `AC-036K-002-02`, `AC-036K-002-06`, `BR-036K-031` | V1, from the current product's existing customization authority |
| RR-US-020, RR-US-022 | — | `US-036K-002`, `AC-036K-002-03`, `AC-036K-002-06`, `BR-036K-031` | V1, from the current product's existing customization authority |
| RR-US-021 | — | `BR-036K-009`, `AC-036K-004-03` | Not supported to violate |
| RR-US-030, RR-US-031 | RRD-02, RRD-06 | `US-036K-003`, `AC-036K-003-01`, `AC-036K-003-08` | V1 |
| RR-US-032 | — | `US-036K-007`, `AC-036K-003-08` | V1 |
| RR-US-040 | RRD-07 | `AC-036K-003-03` | V1 |
| RR-US-041 | RRD-07 | `AC-036K-003-04` | V1 |
| RR-US-042 | — | `AC-036K-005-05` | V1 |
| RR-US-043 | RRD-07 | Section 23 quantity-aware inference | FOLLOW_UP |
| RR-US-044 | RRD-07 | `AC-036K-003-05` | V1 |
| RR-US-050 | — | Section 23 Limited Drop | `DEPENDENCY_CONDITIONAL`, not V1 |
| RR-US-051 | — | Generalised by `AC-036K-005-01` for any ineligible item, including a future Drop | V1 for eligibility; Drop itself not required |
| RR-US-052 | — | `BR-036K-004`, `AC-036K-005-02` | Not supported to treat a Drop as a discount |
| RR-US-060, RR-US-062 | RRD-05 | `US-036K-010`, `AC-036K-010-02`, `AC-036K-010-04` | V1 |
| RR-US-061 | — | `AC-036K-012-06` | Not supported to violate |
| RR-US-070, RR-US-072 | — | `US-036K-004` | V1 |
| RR-US-071 | — | `AC-036K-004-03` | Not supported to violate |
| RR-US-080, RR-US-081, RR-US-082 | — | `AC-036K-004-02` | V1 |
| RR-US-090, RR-US-091, RR-US-092 | — | `US-036K-006` | V1 |
| RR-US-100, RR-US-101 | — | `US-036K-007` | V1 |
| RR-US-102 | — | `AC-036K-007-01` | Not supported to block payment |
| RR-US-110, RR-US-111, RR-US-112, RR-US-113 | RRD-03 | `US-036K-008`, removal meaning in `US-036K-009` | V1 |
| RR-US-120, RR-US-121, RR-US-122 | RRD-08 | `US-036K-009` | V1 |
| RR-US-123 | — | `AC-036K-009-06` | FOLLOW_UP |
| RR-US-124 | — | Section 25 attribution persistence | `ARCHITECTURE_FIT_REQUIRED` |
| RR-US-130, RR-US-131 | — | `US-036K-005` | V1 |
| RR-US-140 | — | Section 23 Campaign/Offer metadata | FOLLOW_UP |
| RR-US-141 | — | `BR-036K-004` | Not supported |
| RR-US-142, RR-US-160, RR-US-161 | — | Section 23 threshold completion; benefit stays with Offer authority | FOLLOW_UP / not supported for this capability to invent the benefit |
| RR-US-150, RR-US-151, RR-US-152 | — | Section 23 | FOLLOW_UP; false claims not supported |
| RR-US-153 | — | Section 23 | DEFERRED |
| RR-US-170, RR-US-171, RR-US-172 | — | Section 23 | FOLLOW_UP |
| RR-US-200, RR-US-201 | — | `US-036K-012`, `AC-036K-012-01`, `BR-036K-031` | V1 for product or category source and target. Relationship placements are Product Detail and Cart. Customization is not a supported placement of that relationship. |
| RR-US-202 | — | Commercial priority is `US-036K-010` / `US-036K-012`. Limited Drop marking is section 23. | Split: priority V1; Drop marking deferred |
| RR-US-203 | — | Section 14 and section 25 | `ARCHITECTURE_FIT_REQUIRED` |
| RR-US-210, RR-US-211, RR-US-212 | — | `AC-036K-012-02`, `AC-036K-012-03` | V1 |
| RR-US-220, RR-US-221, RR-US-222 | — | `US-036K-010` | V1 |
| RR-US-223 | — | Section 25 margin projection | `ARCHITECTURE_FIT_REQUIRED` |
| RR-US-300 | — | `BR-036K-028` | V1 |
| RR-US-301 | — | `BR-036K-017` | V1 |
| RR-US-302 | RRD-01 | `US-036K-011` | V1 conditional; not a launch dependency |
| RR-US-310 | — | `BR-036K-001` | Not supported to violate |
| RR-US-311 | — | `BR-036K-004` | Not supported |
| RR-US-312 | RRD-02, RRD-05 | `BR-036K-026`. Exact headings and neutral copy are the Experience Definition. Limited Drop words apply only under section 23. | V1 false-claim boundary; Drop copy is future |
| RR-US-320, RR-US-321 | RRD-04 | `US-036K-013`, `BR-036K-023` | Design-ready direction. Live ~10% activation is not Product acceptance. Assignment mechanism remains open. Customer silence is Experience. |
| RR-US-322 | — | Section 23 | Not a V1 placement |
| RRD-01 | RRD-01 | `BR-036K-019`, `BR-036K-020` | Source material mapped |
| RRD-02 | RRD-02 | `BR-036K-005`, placement table | Source material mapped |
| RRD-03 | RRD-03 | `BR-036K-012`, `BR-036K-013` | Source material mapped |
| RRD-04 | RRD-04 | `BR-036K-023` | Design-ready direction mapped. Not a live-activation acceptance outcome. |
| RRD-05 | RRD-05 | `BR-036K-025`, `BR-036K-026` | Future collision rule preserved; not a V1 Drop dependency |
| RRD-06 | RRD-06 | `BR-036K-006` | Source material mapped |
| RRD-07 | RRD-07 | `BR-036K-007` | Source material mapped |
| RRD-08 | RRD-08 | `BR-036K-014`, `BR-036K-015` | Source material mapped |
