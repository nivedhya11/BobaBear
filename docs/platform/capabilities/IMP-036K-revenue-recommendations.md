<!-- governance-meta
{
  "status": "CURRENT",
  "authority": "CAPABILITY_ARCHITECTURE",
  "capability": "IMP-036K",
  "title": "Revenue Recommendations",
  "productDefinition": "PD-IMP-036K-DRAFT-1",
  "productDefinitionStatus": "APPROVED",
  "productDefinitionGate": "PASS",
  "experienceDefinition": "XD-IMP-036K-DRAFT-1",
  "experienceDefinitionStatus": "APPROVED",
  "experienceGate": "PASS",
  "experienceCriticality": "X3",
  "changeRisk": "CR2",
  "candidateRevision": "IMP-036K-FIT-CANDIDATE-1",
  "architectureBase": "ARCH-R23",
  "architectureFit": "PASS",
  "architectureLock": "ARCHITECTURE_LOCKED",
  "designReadiness": "NOT_PERFORMED",
  "qualityTestPlan": "NOT_PERFORMED",
  "measurementPlan": "NOT_PERFORMED",
  "implementationPlan": "NOT_PERFORMED",
  "implementationAuthorized": false,
  "implementationStarted": false,
  "schemaChangeAuthored": false,
  "runtimeImplementationStarted": false,
  "newServiceRequired": false,
  "newPermissionRequired": false,
  "newRoleRequired": false,
  "globalDecisionRequired": false,
  "architectDecisionRequired": false,
  "lastReviewed": "2026-10-02",
  "bindingDecisions": ["D-368", "D-369", "D-371", "D-373", "D-382", "D-383"],
  "dependsOn": ["IMP-020", "IMP-023", "IMP-028B", "IMP-028C", "IMP-036F", "IMP-036H", "IMP-036I"]
}
-->

# IMP-036K — Revenue Recommendations

## Capability architecture — Architecture Fit PASS, LOCKED

```text
STATUS = CURRENT
AUTHORITY = CAPABILITY_ARCHITECTURE
CAPABILITY = IMP-036K
ARCHITECTURE_FIT_SOURCE = IMP-036K-FIT-CANDIDATE-1
ARCHITECTURE_FIT_CANDIDATE = IMP-036K-FIT-CANDIDATE-1
ARCHITECTURE_FIT = PASS
ARCHITECTURE_LOCKED = YES
ARCHITECTURE_FIT_REVIEW = 5391917727
ARCHITECTURE_LOCK_AUTHORIZED = YES
ARCHITECTURE_FIT_EVALUATED_BRANCH = docs/imp036k-architecture-fit-candidate
ARCHITECTURE_FIT_EVALUATED_HEAD = 71cfd352f41f933072b583c7e914f93afb91a235
ARCHITECTURE_FIT_EVALUATED_TREE = 90431caf3d26114a3ed81f6c6fd71b18c34fb930
ARCHITECTURE_FIT_EVALUATED_WORKING_TREE_FINGERPRINT = db07f54f174c646de5de56ee7ae7a30c90f7f03de167b18ca0a6fa122a9f2ff7
PRIOR_STOP_REWRITTEN_AS_PASS = NO
HISTORICAL_PASS_REWRITTEN_AS_STOP = NO
ARCHITECTURE_BASE = ARCH-R23
GLOBAL_ARCHITECTURE_REVISION_CREATED = NO
DECISION_REGISTER_REVISION_CREATED = NO
LOCK_ROADMAP = GTM-R181
LOCK_STATE = STATE-R179
GLOBAL_REVISION_FOR_CAPABILITY_LOCK = NO
NEW_ADR_REQUIRED = NO
D-384_CREATED = NO

PRODUCT_DEFINITION = PD-IMP-036K-DRAFT-1
PRODUCT_DEFINITION_STATUS = APPROVED
PRODUCT_DEFINITION_GATE = PASS
EXPERIENCE_DEFINITION = XD-IMP-036K-DRAFT-1
EXPERIENCE_DEFINITION_STATUS = APPROVED
EXPERIENCE_GATE = PASS
EXPERIENCE_CRITICALITY = X3
CHANGE_RISK = CR2
ARCHITECT_REVIEW = 5380398013

DESIGN_READINESS = NOT_PERFORMED
QUALITY_TEST_PLAN = NOT_PERFORMED
MEASUREMENT_PLAN = NOT_PERFORMED
IMPLEMENTATION_PLAN = NOT_PERFORMED
IMPLEMENTATION_AUTHORIZED = NO
IMPLEMENTATION_STARTED = NO
SCHEMA_CHANGE_AUTHORED = NO
RUNTIME_IMPLEMENTATION_STARTED = NO
FOUNDER_UAT = NOT_PERFORMED
IMP036K_ACCEPTED = NO

NEW_SERVICE_REQUIRED = NO
NEW_AUTH_MODEL_REQUIRED = NO
NEW_PERMISSION_REQUIRED = NO
NEW_ROLE_REQUIRED = NO
NEW_MONEY_AUTHORITY_REQUIRED = NO
NEW_CATALOG_AUTHORITY_REQUIRED = NO
NEW_CART_AUTHORITY_REQUIRED = NO
ML_VECTOR_LLM_INFRASTRUCTURE_REQUIRED = NO
HOLDOUT_ACTIVATED = NO
ARCHITECT_DECISION_REQUIRED = NONE
UNRESOLVED_ARCHITECTURE_QUESTIONS = NONE
PRIOR_ARCHITECTURE_FIT_REVIEW = 5383814980
PRIOR_ARCHITECTURE_FIT_VERDICT = STOP
PRIOR_ARCHITECTURE_FIT_HEAD = 985f57dc21cd26e6d12a8cb413de6681a12c46e3
EARLIER_REPAIRED_ARCHITECTURE_FIT_REVIEW = 5383371804
EARLIER_REPAIRED_ARCHITECTURE_FIT_HEAD = 77a06feecff8882e059c08bff1a4edfed81eb8cb
HISTORICAL_ARCHITECTURE_FIT_PASS_REVIEW = 5384137705
HISTORICAL_ARCHITECTURE_FIT_PASS_HEAD = c0a2c52f885d25874d71472cdad77e4d5165d2a9
HISTORICAL_ARCHITECTURE_FIT_PASS_VERDICT = PASS
HISTORICAL_ARCHITECTURE_FIT_PASS_PERSISTABLE = NO
HISTORICAL_ARCHITECTURE_FIT_PASS_REWRITTEN = NO
ARCHITECTURE_FIT_REOPEN_REVIEW = 5385458836
ARCHITECTURE_FIT_REOPEN_VERDICT = STOP
ARCHITECTURE_FIT_REOPENED = YES
CURRENT_PASS_SUPERSEDES_FOR_PERSISTENCE = 5385458836
HISTORICAL_PASS_SUPERSEDED_FOR_PERSISTENCE_BY = 5385458836
HISTORICAL_REVIEWS_REWRITTEN = NO
CANDIDATE_2_CREATED = NO
```

This document is the locked capability architecture for IMP-036K. Its reviewed source is
`IMP-036K-FIT-CANDIDATE-1`. Architect review `5391917727` is the sole current Architecture Fit
PASS source for this lock. The architecture is LOCKED. Design Readiness, the Quality/Test Plan,
the Measurement Plan, and the Implementation Plan remain unperformed. Implementation is not
authorized and has not started. The architecture semantics below are the reviewed candidate
semantics from head `71cfd352f41f933072b583c7e914f93afb91a235`.

Architect review `5383371804` stopped the previous text of this same candidate at head
`77a06feecff8882e059c08bff1a4edfed81eb8cb`. That STOP is not rewritten as a pass. The candidate
identity stays `IMP-036K-FIT-CANDIDATE-1`. No Candidate 2 is created. The following revision
corrected those three findings in place: add-time eligibility revalidation, server-owned set
membership before assistance, and holdout assignment before exposure. Architect review
`5383814980` accepted those three repairs and stopped head
`985f57dc21cd26e6d12a8cb413de6681a12c46e3` on one remaining finding: a server-returned set was
treated as actual presentation. The following revision corrected that finding in the same
candidate. Server issuance and committed presentation stay distinct occurrences.

Architect review `5384137705` passed head
`c0a2c52f885d25874d71472cdad77e4d5165d2a9`. That PASS remains historical evidence. It is not
deleted and it is not rewritten as a stop. Architect review `5385458836` later stopped that
same head and reopened Architecture Fit after a continuity defect: a Customization mark could
survive while the parent product remained even after the recommended variant or modifier itself
no longer remained. Review `5385458836` supersedes `5384137705` for persistence purposes.
Canonical main has not persisted that historical PASS. This revision corrects that continuity
defect in the same candidate. No Candidate 2 is created. Architect review `5391917727` is the
current PASS on the corrected candidate and supersedes `5385458836` for persistence. Historical
reviews are not rewritten or deleted.

```text
5383371804 = STOP
5383814980 = STOP
5384137705 = historical PASS, later reopened
5385458836 = STOP / REOPEN
5391917727 = CURRENT PASS
HISTORICAL_REVIEWS_REWRITTEN = NO
HISTORICAL_REVIEWS_DELETED = NO
```

Shared lifecycle files on this branch stay at GTM-R179 / STATE-R177 / ARCH-R23 / DR-24.
IMP-036J remains the current implementation slice. D-383 remains the sequencing authority and
is not amended. RRD-01 through RRD-08 remain discovery provenance and are not architecture
authority.

The candidate branch stayed isolated from shared lifecycle files so IMP-036J could continue.
This lock persistence re-anchors on canonical main `676f7da7bbc78dbc31fc251e4a46d8357ee1e25b`
and registers the capability in the platform index. ROADMAP and STATE version identities on
that main remained GTM-R180 / STATE-R178. IMP-036J remains the current implementation slice.
Tranche 2 stays unstarted.

---

## 1. Source candidate provenance

Refreshed canonical `main` before this branch was created. The git tree matches the task's
expected source tree. `TREE` here is `git rev-parse HEAD^{tree}`. The working-tree fingerprint
is the separate content-sensitive fingerprint.

```text
REPOSITORY = /home/ajoshi/repos/boba-bear-platform
SOURCE_BRANCH = main
SOURCE_MAIN = 28e1c28914494a0142c51af94e13b83a4f8f7af0
SOURCE_TREE = 935c3a07ae663ba1d94dde6752290bcd72df1516
SOURCE_WORKING_TREE_FINGERPRINT = 5f12ee4119b93ebad225781354ef0d598d6376752a54521555e4b8c02149c527
WORKING_TREE_AT_BRANCH_CREATION = CLEAN
ROADMAP = GTM-R179
STATE = STATE-R177
ARCHITECTURE = ARCH-R23
DECISION_REGISTER = DR-24
PRODUCT_DELIVERY = PD-2
EXPERIENCE = EXP-1
PRODUCT_LANGUAGE = LANG-1
TESTING = TEST-1
VISION = VISION-1
acceptedThrough = IMP-036I
currentProductSlice = IMP-036J
nextProductSlice = IMP-036K
pendingAcceptance = NONE
D-377 = CURRENT
D-382 = AMENDED by D-383
D-383 = CURRENT
NEXT_FREE_DECISION_ID = D-384
IMP037_HOLD = YES
IMP038_HOLD = YES
SOURCE_DRIFT_AT_BRANCH_CREATION = NONE
LIVE_CANONICAL_MAIN_AT_FIT_REVIEW = 95cddfa96b3fcdc1945890a41a3b4bc3b032d83f
LIVE_ROADMAP_AT_FIT_REVIEW = GTM-R180
LIVE_STATE_AT_FIT_REVIEW = STATE-R178
LIVE_ARCHITECTURE = ARCH-R23
LIVE_DECISION_REGISTER = DR-24
LIVE_DRIFT_SOURCE_AT_FIT_REVIEW = IMP-036J Tranche 1 PASS reconciliation
LIVE_DRIFT_INVALIDATES_CANDIDATE = NO
REBASE_TO_REWRITE_PROVENANCE = NO
LOCK_PERSISTENCE_REANCHORED = YES
LOCK_CANONICAL_MAIN = 676f7da7bbc78dbc31fc251e4a46d8357ee1e25b
LOCK_ROADMAP = GTM-R181
LOCK_STATE = STATE-R179
LOCK_SOURCE_ROADMAP = GTM-R180
LOCK_SOURCE_STATE = STATE-R178
IMP036J_REGRESSION_ALLOWED = NO
```

The source block above is the branch-creation provenance. It is not a claim that canonical
`main` is still that commit. Architect review `5391917727` recorded live canonical `main` as
`95cddfa96b3fcdc1945890a41a3b4bc3b032d83f` (`GTM-R180` / `STATE-R178` / `ARCH-R23` / `DR-24`).
That SHA later advanced to `676f7da7bbc78dbc31fc251e4a46d8357ee1e25b` when IMP-036J Tranche 2
measurement persistence merged. The ROADMAP and STATE version identities stayed GTM-R180 /
STATE-R178, so this lock still supersedes those versions as GTM-R181 / STATE-R179. That advance
does not invalidate the reviewed architecture and this revision does not rebase to rewrite the
historical source provenance. IMP-036J is not regressed. `IMP036J_TRANCHE_2_STARTED` stays `NO`.

Product and Experience gate provenance stays the evaluated candidate recorded by Architect
review `5380398013`: branch `docs/imp036k-product-experience-definition`, head
`072932df00c445c8215c61f19f81971bf657b160`, tree
`a4912e6c649cad25094412ac07a005fbb441567e`, working-tree fingerprint
`f2886ed726c77301589ba36dccd602da6d44daadd7a0f2dec4e59aada3162c46`. This fit candidate does
not rewrite that evaluation.

---

## 2. Product and Experience authority preserved

Binding behaviour is `PD-IMP-036K-DRAFT-1` and `XD-IMP-036K-DRAFT-1`. This candidate does not
reinterpret placement ceilings, explicit add, eligibility-before-ranking, fail-open commerce,
suppression, attribution, Popular evidence, holdout silence, or the Customization boundary.

```text
PRODUCT_DETAIL_MAXIMUM = 3 complementary recommendations
CUSTOMIZATION_MAXIMUM = 3 total
CUSTOMIZATION_VARIANT_UPGRADE_MAXIMUM = 1
CUSTOMIZATION_ADD_ON_MAXIMUM = 2
CART_MAXIMUM = 4
CART_REQUIRES_A_LINE = YES
MAXIMA_ARE_CEILINGS = YES
CUSTOMIZATION_USES_OPERATOR_RELATIONSHIP = NO
OPERATOR_RELATIONSHIP_SOURCE = PRODUCT | CATEGORY
OPERATOR_RELATIONSHIP_TARGET = PRODUCT | CATEGORY
OPERATOR_RELATIONSHIP_PLACEMENTS = PRODUCT_DETAIL | CART
VIEW_THROUGH_IN_V1 = NO
HOLDOUT_SUPPRESSES_PRESENTATION_ONLY = YES
HOLDOUT_ACTIVATION_IS_PRODUCT_ACCEPTANCE = NO
EXACT_RANKING_WEIGHTS_ARE_PRODUCT_CONTRACT = NO
```

Customer headings remain “Goes great with this”, “Make it yours”, and “Complete your order”.
Experience rules `XR-IMP-036K-001` through `XR-IMP-036K-016` stay presentation authority.
Design Readiness still owns final geometry, focus maps, and component mapping.

---

## 3. Accepted invariants preserved

| Invariant | How this candidate honours it |
|---|---|
| ARCH-G05 | Popular evidence and assisted purchase read purchased Checkout Snapshot truth bound to Orders. Recommendations do not author payable history. |
| ARCH-G08 / ARCH-G11 | Caller-supplied prices, eligibility, permissions, holdout flags, recommendation payloads, and unvalidated render observations are not authority. The browser must not become authoritative for pricing, tax, promotion eligibility, payment truth, authorization, or Order lifecycle. |
| ARCH-G09 / ARCH-G22 / D-371 | Relationship writes use compare-and-swap. Cart adds, quantity, and removal keep existing Cart revision and unit-sequence authority. |
| ARCH-G12 / ARCH-G14 | No recommendation service, queue, feature store, vector index, LLM, or vendor. Campaign and Limited Drop stay non-dependencies. |
| ARCH-G19 / D-368 | Eligibility and category membership are read from the existing Customer Menu projection inputs. The projection does not become Catalog, Pricing, Availability, Cart, or Order authority. Display price is not payable truth. |
| ARCH-G20 / D-369 | A recommendation is not selection. Positive-price modifiers become intent only through explicit customization. Zero-price standard defaults stay with existing customization. |
| ARCH-G23 / ARCH-G25 / D-373 | Workforce administration stays on `/api/admin/v1/*` with a server-validated workforce session. Customer reads and cart mutations stay on `/api/v1/*`. |
| D-382 remainder | Recommendations do not create promotions, coupons, offers, discounts, or a second price. |
| D-383 | Sequencing only. This candidate does not move `currentProductSlice` or authorize implementation. |
| VISION-1 | No new deployable service and no marketplace or loyalty profile. |

---

## 4. Existing-engine inventory

Evidence is from source `main` `28e1c28914494a0142c51af94e13b83a4f8f7af0`.

| Concern | Existing authority | Evidence |
|---|---|---|
| Customer transport | Static export plus customer-commerce façade | ARCHITECTURE D-359. Routes live in `src/server/customer-commerce/http/router.ts`. |
| Workforce admin transport | Administration API on the operations process | ARCH-G25. Catalog admin notes in `src/server/operations/http/admin-catalog-routes.ts`. |
| Product, variant, modifier identity | Brand catalog | `src/platform/database/schema/catalog.ts`. |
| Category as the customer already sees it | Effective menu section, not a separate category table | `menu_section_versions` and `menu_entry_versions` in `src/platform/database/schema/menu.ts`. No `catalog_categories` table was found. |
| Menu read model | `projectCustomerMenu` | `src/server/customer-commerce/menu/project-customer-menu.ts`. |
| Outlet eligibility | Assortment and availability session | `createOutletEligibilitySession` in `src/server/assortment/outlet-eligibility-session.ts`. |
| Configuration eligibility | Modifier groups with `minSelections` | `src/server/assortment/resolve-eligibility.ts`. |
| Display price | Outlet or brand variant price resolution | `resolveOutletVariantPrice` / `resolveBrandVariantPrice`, called from the menu projection. |
| Payable price, discount, promotion | Pricing, Promotion, Checkout Snapshot | `price_books` are `sales_channel = direct`. Snapshot lines carry paise totals. No contribution or margin column was found on price books. |
| Cart purchase intent | `addCartLine`, `setCartLineQuantity`, configuration update, `removeCartLine` | `src/server/cart/operations.ts`. HTTP: `POST /api/v1/cart/lines`, `PATCH /api/v1/cart/lines/{cartLineId}/quantity`, `PATCH /api/v1/cart/lines/{cartLineId}/configuration`, `POST /api/v1/cart/lines/{cartLineId}/remove`. `addCartLine` does not itself resolve selected Outlet, assortment, availability, or fulfilment. |
| Structural configuration | `validateCartLineStructure` | Called inside `addCartLine` and configuration update. |
| Cart concurrency | Cart row lock and `expectedRevision` | `addCartLine` locks the cart and checks revision. |
| Unit sequence | `cart_line_units` | ARCH-G22. Schema in `src/platform/database/schema/cart.ts`. |
| Fulfilment mode and timing | Checkout intent | `checkouts.fulfilment_mode` is `DELIVERY` or `PICKUP`. `checkouts.fulfilment_timing` is `ASAP` or `SCHEDULED`. Pickup outlet is `pickup_outlet_id`. |
| Selected outlet | Serviceability result, then snapshot | Cart evaluation uses `serviceability.selectedOutletId`. `checkout_snapshots.selected_outlet_id` is the purchased outlet. |
| Purchased order | One `app.orders` row bound to one Checkout Snapshot | `src/platform/database/schema/order.ts`. There is no order-line table. Units live on `checkout_snapshot_lines`. |
| Direct versus aggregator | Platform orders are direct checkout orders | Vision keeps aggregators outside the direct platform. Price books constrain `sales_channel` to `direct`. Popular evidence reads `app.orders` only. |
| Permissions | Existing keys and brand/outlet target kinds | `src/shared/access-control/catalog.ts`. `menu.manage` and `menu.read` target `brand`. `requireMenuManage` checks that pair in `src/server/catalog/menu/authorize-menu.ts`. |
| Roles | Existing role catalog | `brand_admin` holds `menu.manage` at brand scope. `outlet_manager` does not hold `menu.manage` or `catalog.manage`. No recommendation role exists. |

---

## 5. Fit classification

`ARCHITECT_DECISION_REQUIRED` is unused. Each approved rule can be satisfied by the existing
authorities below. Ordinary implementation choices that remain for later tranches are named in
section 22 and are not binding product gaps.

| # | Question | Classification | Decision |
|---|---|---|---|
| 1 | Recommendation domain representation | `EXTEND_EXISTING` | No durable Recommendation commerce aggregate. Persist an operator relationship under existing brand menu administration. |
| 2 | Customization recommendation source | `REUSE_EXISTING` | Current product variants and modifier options only. |
| 3 | Read-time eligibility | `REUSE_EXISTING` | Menu projection, assortment/availability, price resolution, cart structure, fulfilment context. Applied before ranking. This read does not replace add-time revalidation. |
| 4 | Category resolution | `REUSE_EXISTING` | Same active effective menu section and entry predicate as `projectCustomerMenu`. No new category entity. |
| 5 | Ranking execution | `EXTEND_EXISTING` | Deterministic server read in customer-commerce after eligibility. Weights are not a contract. |
| 6 | Money / contribution projection | `REUSE_EXISTING` | Relative priority is a non-money ordinal. Display price is the menu projection. No contribution formula. |
| 7 | Workforce authorization | `REUSE_EXISTING` | `menu.manage` / `menu.read` on server-derived brand. |
| 8 | Presentation / query boundary | `EXTEND_EXISTING` | Separate customer-commerce read. Primary commerce routes stay unchanged. |
| 9 | Cart mutation authority | `REUSE_EXISTING` | Existing `addCartLine` and the existing customization flow. No parallel Cart API. |
| 10 | Recommendation add revalidation | `EXTEND_EXISTING` | Before recommendation-origin units or attribution are committed, the existing Cart mutation re-resolves current catalog, assortment, selected Outlet, availability, fulfilment, required configuration, and the applicable relationship period. |
| 11 | Removal suppression | `EXTEND_EXISTING` | Cart-scoped suppression row. Not catalog or menu state. |
| 12 | Recommendation-assisted attribution | `EXTEND_EXISTING` | Server-issued set correlation, then a server-validated committed presentation, then a unit-level server mark whose continuity is the exact recommended identity. Checkout copies only surviving marks as non-payable provenance. Issuance alone, eligibility alone, an unvalidated client observation, and parent-product survival are not that proof. |
| 13 | Measurement / analytics | `EXTEND_EXISTING` | Meanings and durable proof identities are fixed here. Encoding stays with the later Measurement Plan. |
| 14 | Holdout readiness | `EXTEND_EXISTING` | Inactive until the Measurement Plan activates it. When activated, no recommendation exposure occurs before a stable server-owned assignment. Not cart-id-only after a prior exposure. No customer-profile key. |
| 15 | Popular evidence | `REUSE_EXISTING` | Read `orders` joined to Checkout Snapshot lines with `line_origin = cart`. No second order store. |
| 16 | Fulfilment context | `REUSE_EXISTING` | Consume serviceability, pickup, and scheduled-fulfilment decisions. |
| 17 | Future capability coupling | `REUSE_EXISTING` | No Campaign, Offer, or Limited Drop call in V1. |
| 18 | Latency / failure boundary | `EXTEND_EXISTING` | Independent read degrades to no module. |
| 19 | Concurrency / idempotency | `EXTEND_EXISTING` | Existing cart locks plus relationship compare-and-swap. |
| 20 | Privacy / security | `REUSE_EXISTING` | Existing trust boundaries. No profile and no PII expansion. |

---

## 6. Domain ownership

```text
CUSTOMER_RECOMMENDATION_COMMERCE_AGGREGATE = NOT_CREATED
OPERATOR_RELATIONSHIP = brand-scoped configuration owned by menu administration
CUSTOMIZATION_CANDIDATES = catalog variant and modifier authority for the current product
ELIGIBILITY = assortment, availability, catalog lifecycle, price resolution, cart structure, serviceability, pickup, scheduled fulfilment
CART_MUTATION = existing Cart
PAYABLE_TRUTH = Checkout Snapshot
PURCHASED_HISTORY = Order bound to that snapshot
POPULAR_COUNTS = derived read over that purchased history
SUPPRESSION = active Cart
ATTRIBUTION = server-issued set correlation, then server-validated committed presentation, then the bound recommendation action, then cart line units, then a non-priced snapshot copy
SERVER_SET_CORRELATION = issuance proof of set identity, placement, and candidate membership
SERVER_SET_CORRELATION_IS_PRESENTATION_PROOF = NO
PRESENTATION_OCCURRENCE = server-validated observation that the module or a specific item was actually shown
HOLDOUT_ASSIGNMENT = inactive until activation; when activated, a stable server-owned ordering-journey assignment before exposure. Not a customer profile and not browser authority
CART_AUTHORITY = existing Cart
RECOMMENDATION_ADD_REVALIDATION = EXTEND_EXISTING
MEASUREMENT_ENCODING = later Measurement/Instrumentation Plan
```

The operator relationship remembers only what section 15 of the Product Definition requires:

- source identity: product or category
- target identity: product or category
- relationship kind, kept distinct: `COMPLEMENTS`, `UPSELLS_TO`, `PAIR_WITH`, `ADD_ON`, `ALTERNATIVE`
- placements limited to Product Detail and Cart
- relative commercial priority
- optional effective period
- active or disabled
- expected revision for administration

`ALTERNATIVE` stays a distinct stored kind so it is not collapsed into a generic related-products
bucket (`BR-036K-027`). V1 ranking does not perform a silent swap. `ADD_ON` as a relationship
kind is not a modifier and is not used to produce Customization recommendations.

Customization is rejected as a placement on write. A variant id or modifier option id is rejected
as a relationship source or target.

---

## 7. Question resolutions

### 7.1 Recommendation domain representation

A durable Recommendation aggregate is not required. It would become a second owner of what can
be purchased. Purchasability stays with catalog, menu, assortment, availability, pricing, and
Cart.

What must persist is the operator relationship. Category identity in that relationship is the
stable menu section id already published on the effective menu. Product identity is the existing
catalog product id. Both must belong to the same brand as the relationship. The relationship is
not a menu version row and not a catalog content revision, so disabling it does not publish a
menu or retire a product (`BR-036K-022`).

### 7.2 Customization recommendation source

For the product the customer is configuring:

- A variant upgrade is another effective variant of that same product, already attached by
  catalog variant authority, that existing price resolution shows as a higher display price than
  the current selection. At most one is returned.
- An add-on is an existing modifier option already attached to the current variant through
  `catalog_variant_modifier_groups` and `catalog_modifier_group_options`. At most two are
  returned. The total Customization set is at most three.
- Positive-price add-ons are offered as choices. The recommendation response does not mark them
  selected. Zero-price standard defaults stay with existing customization behaviour.
- Candidates that fail current eligibility are omitted. The set is not backfilled from an
  operator relationship.

### 7.3 Eligibility

Applied on the server before any ranking, for every placement:

| Check | Authority |
|---|---|
| Product and variant exist, are effective, and belong to the brand | Catalog content revision and lifecycle |
| Outlet assortment and availability | `createOutletEligibilitySession` and the omission rules already used by `projectCustomerMenu` |
| Outlet operating pause, suspend, or schedule | Existing eligibility codes; a recommendation does not override them |
| Required configuration can currently be satisfied | Modifier and bundle `minSelections` rules in `resolve-eligibility.ts` |
| A display price resolves | `resolveOutletVariantPrice` or `resolveBrandVariantPrice` |
| Fulfilment context can order from that outlet | Serviceability, pickup profile, and scheduled-window authority, consumed, not reimplemented |
| Relationship is active and inside its effective period | Relationship configuration, for Product Detail and Cart only |
| Candidate is not suppressed for this cart | Suppression store |

If any check fails, the candidate is absent. Priority, a relationship row, or a Popular count
cannot put it back. Assortment omission stays omission. Sold-out stays unavailable.

### 7.4 Category resolution

There is no catalog category entity on this source. `catalog_products` has no category column.
`tax_category_id` is tax policy. Creating a category table would be a new customer-facing
taxonomy, which `BR-036K-007` and section 15 of the Product Definition forbid.

The fit question is how an already-owned grouping resolves to products. The grouping customers
already see is the effective menu section published with the active menu. IMP-036F owns that
graph together with catalog identity. `projectCustomerMenu` reads one active menu, its effective
menu version, active sections, and active entries. Recommendation membership uses that same
predicate. It does not fall back to draft rows or to legacy `menu_sections`. A section id is
the category reference on an operator relationship. It is not a second product, assortment, or
availability identity. A parent section does not include products that are entered only on a
child section.

A product is in a category only when an active entry on that effective menu places the product
in that section. A parent section does not include products that are entered only on a child
section. Cart presence is that membership applied to current cart-line products. Quantity is
ignored (`AC-036K-003-07`).

Product Detail and Cart relationships with `CATEGORY` source or target use that section id.
A category target resolves to products in that section, then eligibility, then ranking, then the
placement ceiling.

Cart gap is presence and absence over those sections:

- A Cart relationship whose source category is present and whose target category is absent may
  contribute eligible products from the absent section.
- If the target category is already present, it is not treated as missing (`AC-036K-003-06`).
- Product-to-product Cart relationships still resolve to that target product after eligibility.
- The accepted examples (main and side without a beverage, beverage only, main without a side)
  are instances of this rule using the brand's existing sections and relationships. This
  candidate does not hardcode section codes and does not invent Main, Side, Beverage, or Food
  as a new taxonomy.
- With no active relationship, Product Detail and Cart emit no relationship candidate. Commerce
  still works. Customization candidates can still appear from variant and modifier authority.

### 7.5 Ranking execution

Ranking runs in the customer-commerce process, on the server, after eligibility, and only over
the already eligible set. The browser sorts nothing that changes membership.

Filters, applied before order:

1. Eligible only.
2. For Cart, only when the cart has at least one line. An empty cart returns no module.
3. Suppressed candidates removed.
4. Active relationship matches for Product Detail and Cart. Customization never enters this step.

Order of what remains, with no numeric weights:

1. Relative commercial priority, higher priority first.
2. Stable tie-break by existing catalog id, so the same inputs and the same commerce truth produce
   the same order (`AC-036K-010-01`).

The placement ceiling is applied after that order. Fewer than the ceiling is valid. Do not pad.

Exact weights are not specified and are not a product, customer, or operator contract
(`BR-036K-017`). A later tranche may encode this order in code. It must not turn that encoding
into a customer-visible promise.

### 7.6 Money and contribution

Recommendation code does not calculate authoritative price, discount, promotion, tax, or payable
totals.

Relative commercial priority is an operator integer on the relationship. It is not money and is
not returned to the customer (`BR-036K-026`).

Display price, when the Experience Definition shows one, is the existing menu display price for
that outlet and variant. It is not written to the cart and not sealed as Checkout Snapshot truth
(ARCH-G19).

Contribution and margin have no authoritative field. Price-book schema has amounts and
`sales_channel = direct`, and no cost, margin, or contribution column was found. V1 therefore
does not invent a contribution formula. The product rule that contribution *may* reorder
eligible candidates stays valid: there is nothing authoritative to read, so it does not reorder.
A future pricing authority would have to publish a contribution projection before ranking could
consume one. This candidate does not create that authority.

### 7.7 Workforce authorization

```text
DEFINE_ACTIVATE_DISABLE_RELATIONSHIP = menu.manage
READ_RELATIONSHIP_ADMINISTRATION = menu.read
AUTHORIZATION_RESOURCE = { type: brand, brandId }
SCOPE_DERIVATION = server-validated workforce session and server-loaded brand
NEW_PERMISSION = NO
NEW_ROLE = NO
PROMOTIONS_ACTIVATE_REUSED = NO
CATALOG_MANAGE_REQUIRED_FOR_RELATIONSHIP_WRITE = NO
```

`menu.manage` is the existing brand-scoped commercial configuration permission for menu
merchandising (`requireMenuManage`). Category identity is a menu section, and the relationship
changes what Product Detail and Cart may suggest without changing menu publication. That matches
the allow and deny already required:

- `brand_admin` holds `menu.manage` for the brand and may define, activate, and disable.
- An actor without `menu.manage` for that brand is denied.
- `outlet_manager` does not hold `menu.manage`. An outlet-scoped assignment does not become brand
  authority. A relationship for another brand is denied. A brand-scoped relationship applies to
  that brand's outlets through ordinary eligibility. It is not an outlet override.
- Caller-supplied permission or role fields are ignored (ARCH-G08, ARCH-G23, ARCH-G25).

`catalog.manage` remains the authority for creating products, variants, and modifiers.
Relationship writes do not call those commands. They validate that referenced product and section
ids already exist in the same brand and fail closed otherwise. `promotions.manage` and
`promotions.activate` are not used, so a recommendation cannot be administered as a discount.

The same `menu.manage` permission covers define, activate, and disable. Recommendations do not
change payable totals, so a second activation permission is not required.

Customer recommendation reads use the existing customer or guest cart principal. They do not
accept a workforce session and do not grant `menu.manage`.

### 7.8 Presentation and query boundary

Product Detail, Customization, and Cart request an optional read from the existing
customer-commerce façade. The read is not a Next.js route handler and not a new process.

The read input that is trusted is the server session, the server cart, and server-resolved
outlet and fulfilment context. Client-supplied candidate lists, prices, and eligibility flags
are ignored.

The response contains only customer-safe fields: existing product and variant identity, existing
display price when shown, whether the existing flow is direct add or customization, and a
Popular indicator only when section 7.15 passes. It does not contain priority, margin,
relationship kind names, holdout assignment, or suppression reasons.

When that read returns a qualifying set, the server records the issued-set correlation in
section 7.12 (`SET_ISSUED` / `SERVER_SET_CORRELATION`). That record proves the server issued a
particular eligible set and its candidate membership. It does not prove the browser committed
or showed the module or any item. A returned response may never be committed. A suppressed,
empty, or failed read records no issued set. The client does not supply the set id, membership,
eligibility, rank, relationship, or holdout.

The customer-safe payload carries that server-issued correlation so the browser can later echo
it as an observation. Echoing it does not create the set.

Fail-open (`BR-036K-010`, `XR-IMP-036K-007`):

- generation, ranking, or transport failure returns no module
- no recommendation error is required for the customer to continue
- the failure path writes no cart line
- `GET /api/v1/cart`, checkout, and payment handlers do not call this read

### 7.9 Cart mutation reuse

Direct add calls existing `addCartLine` through `POST /api/v1/cart/lines`. Configuration-required
items open the existing customization interaction. The cart changes only when that flow later
calls the same `addCartLine` or configuration update. There is no recommendation-specific cart
route. A recommendation action uses that same mutation. Section 7.10 revalidates eligibility
before recommendation-origin units are committed. Section 7.12 writes recommendation-origin
provenance and the assistance mark only after the server has validated actual committed
presentation. A missing presentation occurrence does not by itself fail the cart.

Direct add is offered only when existing structure already allows a complete configuration
without a further customer choice: one eligible variant, and every required modifier group
already satisfied by the zero-price defaults existing customization may preselect. If a
positive-price modifier or an unresolved required choice remains, the response says configuration
is required and does not submit a line (`BR-036K-008`, `BR-036K-009`).

Removal uses `removeCartLine`. Quantity uses `setCartLineQuantity`. Success and rejection copy
are the existing cart results plus the Experience Definition announcements.

### 7.10 Stale candidate and revalidation

```text
CART_AUTHORITY = existing Cart
RECOMMENDATION_ADD_REVALIDATION = EXTEND_EXISTING
PARALLEL_CART_API = NO
CLIENT_ELIGIBILITY_AUTHORITY = NO
```

An issued set and a shown set do not reserve stock, price, or eligibility (`BR-036K-029`).

Current `addCartLine` locks the cart, checks `expectedRevision`, runs
`validateCartLineStructure`, coalesces by canonical configuration, and appends cart-line units.
It does not resolve selected Outlet, assortment, availability, fulfilment context, catalog
lifecycle, or a recommendation relationship's effective period. Later cart evaluation reads
`serviceability.selectedOutletId`. That evaluation is not this mutation. Stale recommendation add
is therefore not `REUSE_EXISTING`.

The recommendation action stays on `POST /api/v1/cart/lines` and `addCartLine`. Locking, revision
checks, and coalescing stay the existing Cart authority. The action is recognized only when it
carries the recommendation-action identity the server bound at issuance. Inside that mutation,
before any unit from that action is committed, whether or not presentation proof will allow an
assistance mark, the server re-resolves authoritative current:

- product and catalog lifecycle
- assortment
- selected Outlet
- availability
- fulfilment context
- required configuration
- the applicable recommendation relationship and its effective period, when the candidate comes
  from a Product Detail or Cart relationship
- cart suppression for that candidate, which blocks another recommendation-origin add and does
  not block an ordinary Menu or Product add

Those checks read existing catalog, menu, assortment, availability, serviceability, pickup,
scheduled-fulfilment, and relationship authority. A client eligibility flag, a displayed price,
or a candidate id is not one of those authorities. Assortment does not gain a fulfilment-mode
argument. Mode and timing remain the fulfilment context in section 7.16.

If any check fails, the recommendation-origin mutation is rejected. No recommendation-origin cart
unit is created. No assistance mark is written. Prior lines remain. Checkout and payment stay
usable (`BR-036K-011`, `AC-036K-004-04`, `AC-036K-006-02`).

`validateCartLineStructure` still checks configuration shape. It does not replace the checks
above.

An ordinary Menu or Product add carries no server-issued recommendation-action correlation. It
stays on the same `addCartLine` path, keeps today's structural validation and cart errors, and
receives no assistance mark. A client-supplied candidate id or boolean does not turn that add
into a recommendation-origin mutation.

Relationship disable does not delete lines already added. A later recommendation action for a
target that is no longer purchasable fails the same closed way.

### 7.11 Removal suppression

Suppression is a row owned by the active cart, keyed by cart id plus the exact recommended
candidate identity:

- product-target recommendation: product id
- category-target recommendation: the concrete product that was shown and added
- customization variant: that variant id
- customization add-on: that modifier option id

Lifetime is the active cart. Reload of that cart still suppresses the candidate on Product
Detail, Customization, and Cart. Cart clear, cart expiry, or a different cart ends suppression.
A new cart may recommend the candidate again.

Suppression does not update catalog lifecycle, menu entries, assortment, or availability.
Menu projection for ordinary browsing is unchanged, so the customer can still find the item when
catalog truth says it is there (`BR-036K-013`, `XR-IMP-036K-009`).

A later manual add of that exact candidate creates cart units with no recommendation attribution.

### 7.12 Recommendation-assisted attribution

The marked identity is the identity actually recommended. Continuity is evaluated against that
identity. A variant or modifier recommendation is not broadened to the parent product because
the parent product remains (`AC-036K-009-02`, `AC-036K-009-03`, `BR-036K-014`, `BR-036K-015`).

```text
MARKED_RECOMMENDED_IDENTITY = the identity actually recommended
PRODUCT recommendation
  underlying identity = the concrete recommended product
CATEGORY-target relationship
  underlying identity = the concrete product actually presented and added
  NOT the category
CUSTOMIZATION variant upgrade
  underlying identity = the recommended variant
CUSTOMIZATION add-on
  underlying identity = the recommended modifier option
PARENT_PRODUCT_SURVIVAL_IS_NOT_VARIANT_OR_MODIFIER_SURVIVAL = YES
NEW_COMMERCIAL_LINE_ORIGIN = NO
```

Configuration changes use existing Cart authority. They preserve attribution only while that
marked identity remains. They do not create a cart rejection merely because attribution drops.

```text
recommended product remains
+ quantity changes
→ preserve

recommended product remains
+ unrelated valid modifier changes
→ preserve

recommended variant remains
+ other compatible modifier changes
→ preserve

recommended modifier remains
+ quantity or other valid configuration changes
→ preserve

recommended modifier removed
→ drop that recommendation assistance

recommended variant changed to another variant
→ drop that recommendation assistance

recommended product replaced
→ drop

recommended item removed then manually recreated
→ drop

category-target recommendation where the originally recommended concrete product no longer survives
→ drop
```

Proof required by `BR-036K-014` and `AC-036K-009-02` is a chain:

```text
server issued a qualifying set
→ candidate belonged to that issued set
→ actual committed presentation was observed and server-validated
→ customer used the bound recommendation action
→ add-time authoritative eligibility passed
→ existing Cart accepted the add
→ exact marked recommended identity survives on the purchased Order
VIEW_THROUGH = OUT_OF_V1
ISSUANCE_ALONE_PROVES_ASSISTANCE = NO
ELIGIBILITY_ALONE_PROVES_ASSISTANCE = NO
CLIENT_OBSERVATION_ALONE_PROVES_ASSISTANCE = NO
```

Occurrences are distinct. Experience section 17 and `AC-036K-009-01` stay the product meanings.
A server return is not a render, and a set render is not an item impression.

```text
SET_ISSUED = server returned a qualifying recommendation set
SET_RENDER = the recommendation module was actually shown
ITEM_IMPRESSION = a specific recommendation item was actually shown
SET_RENDERED = SET_RENDER
SERVER_SET_CORRELATION = server proof that a particular eligible set and candidate membership was issued
SERVER_SET_CORRELATION ≠ presentation proof
```

#### Set issuance

The recommendation read records `SERVER_SET_CORRELATION` only when it returns a qualifying set:

```text
server creates/records the issued set correlation
→ set id
→ placement
→ candidate membership
→ recommendation action identity bound to each member
→ customer-safe payload
```

The server remains authoritative for set identity, candidate membership, placement, eligibility,
ranking, holdout assignment, and relationship provenance. A suppressed, empty, or failed read
records no issued set. The browser does not create that record.

#### Actual presentation observation

Only after the recommendation module or a specific item has actually committed and been shown
may the browser report that occurrence, using the server-issued correlation:

```text
SET_RENDER
ITEM_IMPRESSION
```

The browser is an observer only. It must not invent a set, candidate membership, a candidate
identity outside that set, eligibility, rank, relationship, holdout assignment, or recommendation
assistance. A client candidate id, relationship id, boolean, or unvalidated render event does
not create a presentation occurrence and does not create attribution.

The server validates the observation against the already-issued set. A `SET_RENDER` observation
must name that issued set and placement. An `ITEM_IMPRESSION` observation must name a candidate
that already belongs to that set; the server keeps the rank and relationship it stored at
issuance. When validation succeeds, the server records the authoritative presentation
occurrence. When validation fails, no presentation occurrence is recorded.

A server-issued set that is never actually shown has no `SET_RENDER` and no `ITEM_IMPRESSION`.
Click and add events may corroborate a later interaction. They do not redefine an unobserved
set response as a render. View-through is not recorded and is not inferred because an issued set
contained the product.

#### Assisted attribution

The add path writes recommendation-assistance provenance only when the server can prove all of
the following:

1. the server issued a qualifying set
2. the candidate belonged to that issued set
3. actual committed presentation of that set, and of that item, was observed and server-validated
4. the customer used the recommendation action bound to that issued member
5. add-time authoritative eligibility in section 7.10 passed
6. existing Cart accepted the add
7. the exact marked recommended identity survived to the purchased Order

A server-issued but never rendered set is insufficient. Eligibility of a catalog identity is
insufficient. Containment of the product in an issued payload is insufficient. Parent-product
survival is insufficient when the recommendation was a variant or a modifier option. Category
survival is insufficient for a category-target recommendation. An ordinary Menu or Product add
carries no recommendation-action correlation and stays unmarked. A client-supplied candidate
id, relationship id, or boolean does not turn that add into assisted provenance.

The mark is written when the accepted add proves items 1 through 6. Item 7 is evaluated later,
against the marked identity, through existing Cart configuration changes and Checkout copy.
A dropped mark is not assistance.

```text
PRESENTATION_PROOF_AUTHORITY = server-validated presentation occurrence against SERVER_SET_CORRELATION
CLIENT_CANDIDATE_ID_OR_BOOLEAN = NOT_ATTRIBUTION_AUTHORITY
COMMERCE_FAIL_OPEN = YES
ATTRIBUTION_FAIL_CLOSED = YES
```

If the request presents a recommendation action and section 7.10 revalidation fails, the
mutation is rejected. No unit is created and no assistance mark is written. Prior lines remain.

If presentation-observation persistence fails, or the server cannot validate committed
presentation for that action:

- the recommendation module may still function
- no presentation occurrence is recorded from the failed or invalid observation
- existing Cart may still commit the product add when commerce accepts it
- those units carry no recommendation-origin provenance and no assistance mark
- Product, Cart, Checkout, and Payment are not failed because measurement failed

Absence of a recommendation-action correlation remains an ordinary Menu or Product add.

Representation:

- Each cart line unit created by a proven recommendation action carries a server-written mark.
  The mark records placement, the marked recommended identity above, and the relationship id
  when the candidate came from a relationship. A Customization variant mark records that
  variant. A Customization add-on mark records that modifier option. Customization marks do
  not record an operator relationship and do not treat the parent product as the recommended
  identity.
- Units created by ordinary menu or product adds have no mark.
- Assistance provenance stays unit-scoped. Only units created by the proven recommendation
  action receive it. Pre-existing manual units never inherit it. Manual units later coalesced
  onto the same cart line remain unmarked. A later manual add does not recreate recommendation
  provenance (`BR-036K-013`, `AC-036K-008-04`, `AC-036K-009-04`).
- Quantity changes use existing `setCartLineQuantity`. They keep the mark on surviving
  recommendation-created units only while the marked recommended identity remains
  (`BR-036K-015`).
- Other valid configuration changes use existing `updateCartLineConfiguration`. They are not
  a new Cart command and they are not a later manual add. The mark stays only while the
  marked recommended identity remains after that configuration. Removing the marked modifier,
  changing away from the marked variant, or replacing the marked product drops that
  assistance on the affected units. Parent-product survival does not keep a variant or
  modifier mark.
- Coalescing stays the existing cart line identity. When `updateCartLineConfiguration`
  moves units onto an equivalent line, moved recommendation units keep a mark only if the
  marked identity remains. Units already on that line, including pre-existing manual units,
  stay unmarked. Coalescing does not recreate provenance and does not keep a mark after the
  marked identity no longer remains.
- When Checkout copies cart lines into a snapshot, it copies only surviving recommendation
  provenance onto the snapshot line as non-priced provenance. Dropped marks are not copied.
  Unmarked coalesced units are not assistance. `line_origin` stays `cart` or
  `complimentary_offer`. No new commercial `line_origin` is created. The mark is ignored by
  price, promotion, tax, and payment.
- Assisted purchase is true only when an Order exists for that snapshot and surviving marked
  provenance for that exact recommended identity is present. Cancelled orders are not assisted
  purchases. A category that remains is not that identity. A parent product that remains is
  not a variant or modifier identity.
- The client cannot set the mark. A candidate id, relationship id, boolean, or unvalidated
  render event is not presentation proof and is not authority to attribute the add.

If writing the mark fails after that verification has passed, the cart mutation still commits.
The line exists. Assisted purchase is then not claimed. That failure does not skip presentation
validation or the eligibility revalidation. Measurement failure does not block commerce and does
not claim assistance without the seven proofs above.

### 7.13 Measurement and analytics

Event meanings required by `BR-036K-030` and Experience section 17:

| Meaning | Owner | Durable signal | Not this |
|---|---|---|---|
| Set issuance (`SET_ISSUED`) | Recommendation read, when the server returns a qualifying set and records `SERVER_SET_CORRELATION` | Set id, placement, candidate membership, bound recommendation action | A render, an item impression, a customer message, or a payment event |
| Recommendation-set render (`SET_RENDER`) | Server, after it validates a browser observation that the module was actually shown | Placement, issued set correlation, holdout false | Server return alone, a client-invented set, an unvalidated render event, a customer message, or a payment event |
| Item impression (`ITEM_IMPRESSION`) | Server, after it validates a browser observation that that specific item was actually shown | Issued candidate id, placement, server-stored rank, internal strategy kept off the customer surface | Membership in the returned payload without the item being shown, a candidate outside the issued set, customer-visible strategy names |
| Click | Customer action on a suggestion | Candidate id, placement, set id | An add, or a redefinition of an unobserved return as a render |
| Add attempt | Customer action that asks to add or to open customization | Candidate id, placement | A successful add |
| Successful add | Cart acceptance | Cart id, unit ids, placement | Opening customization, or assistance without validated presentation |
| Removal | Cart removal of a recommendation-added line | Cart id, candidate id | A menu delete |
| Assisted purchase | Order bound to surviving marked provenance | Order id, snapshot line id, exact marked recommended identity | View-through, an issued set that was never shown, a dropped modifier or variant mark, parent-product survival, or the category itself |

Acceptance of the slice and the later experiment result stay separate. These meanings do not
choose storage, transport, vendor, schema, retention, dedupe encoding, or analytics projection.
The Measurement Plan finalizes that encoding. The proof and occurrence boundary stays section
7.12. Section 14 says what that plan must still finalize.

Analytics payloads exclude payment secrets, credentials, addresses, names, another customer's
cart, priority, and margin. Candidate ids are catalog or menu ids.

### 7.14 Holdout readiness

The architecture supports a controlled holdout and does not activate one.

```text
HOLDOUT_ACTIVATED = NO
HOLDOUT_CONFIGURATION_DEFAULT = INACTIVE
APPROXIMATE_10_PERCENT = TARGET_DIRECTION_ONLY
LIVE_ACTIVATION_IS_PRODUCT_ACCEPTANCE = NO
ASSIGNMENT_AUTHORITY = server
BROWSER_AUTHORITATIVE = NO
CUSTOMER_PROFILE_PERSONALIZATION_FLAG = NO
EXPOSURE_BEFORE_ASSIGNMENT_WHEN_ACTIVATED = FORBIDDEN
CART_ID_ONLY_AFTER_PRIOR_EXPOSURE = NOT_SUFFICIENT
```

The assignment is server-owned, presentation-only, inactive until the Measurement Plan activates
it, and stable once written for the active ordering session or cart. It is not a customer-profile
personalization flag, a credential copy, a browser flag, or an experiment vendor.

Cart-id-only assignment after Product Detail exposure is not sufficient. This sequence is
forbidden once holdout is activated:

```text
pre-cart Product Detail recommendation exposure
→ later Cart creation
→ same journey assigned to holdout
```

A Product Detail, Customization, or Cart read that can return a recommendation set is an
exposure. In this candidate, the ordering journey is the active ordering session or cart already
named by `BR-036K-023`. It is not a new customer identity, a new cart, or a profile. While
holdout is activated, that read must not present a set until a stable server-owned assignment
already exists for that ordering session or cart.

Two mechanisms make that observable behaviour feasible. The Measurement Plan chooses which one,
and the exact assignment unit. This candidate does not activate either mechanism:

1. The server establishes an ordering-session assignment before the first recommendation read
   that could return a set. Product Detail before a Cart uses that assignment. A later Cart in
   the same journey reuses it and does not roll a new holdout assignment.
2. The server suppresses recommendation presentation until that assignment exists. An unassigned
   read returns no module. Commerce continues (`AC-036K-013-05`). After the assignment exists,
   Product Detail, Customization, and Cart use it.

Unknown assignment suppresses presentation and does not block Cart, Checkout, or Payment. The
browser does not choose the arm. The assignment is not keyed by customer auth user id, phone,
email, or a guest-credential copy used as a cross-session profile. It is not copied into
customer responses. A later journey may receive its own assignment only when that journey has
not already been exposed.

The Measurement Plan still finalizes the exact assignment unit, population, control percentage,
activation, metrics, and observation, stop, and interpretation rules. This candidate does not
select that unit beyond the constraints above, does not activate a percentage, and does not make
activation a product-acceptance result. Inactive configuration writes nothing.

Holdout suppresses recommendation presentation only. Catalog, price, promotion, fulfilment,
Cart, Checkout, Payment, and entitlements are unchanged. The customer sees no holdout label
(`XR-IMP-036K-016`).

Until the Measurement Plan activates a percentage, the configuration stays inactive and eligible
journeys may receive recommendations. Inactive is not a 0% or 100% experiment result.
Activation is not required for Product acceptance.

### 7.15 Popular evidence

Popular treatment reads purchased direct-order history. It does not write orders.

```text
SOURCE = app.orders
  joined to checkout_snapshots.selected_outlet_id
  joined to checkout_snapshot_lines.quantity and product_id
WINDOW = orders.created_at over the trailing 30 days
OUTLET = selected outlet of the current recommendation context
SUCCESS = status in PLACED, ACCEPTED, FULFILLED
EXCLUDED = CANCELLED
DIRECT = platform orders only
AGGREGATOR_ORDER_STORE_CONSULTED = NO
MINIMUM_ORDERS = 30 distinct successful orders for that outlet in the window
RANK = eligible products in the relevant current menu section
METRIC = sum of checkout_snapshot_lines.quantity where line_origin = cart
COMPLIMENTARY_OFFER_LINES_COUNTED = NO
TREATMENT = top 3 only, and only when the order minimum is met
INSUFFICIENT = no Popular treatment
FAILURE_OF_THIS_READ = no Popular treatment
SECOND_ORDER_TRUTH = NO
```

Current menu-section membership, using the active effective menu predicate in section 7.4,
decides which eligible products are "in category" now. Historical quantities stay on the
snapshot lines whose `line_origin` is `cart`. A `complimentary_offer` line is a promotion
benefit, not a purchased unit for this count. Orders whose payment provenance is
`NO_PAYMENT_REQUIRED` remain successful direct orders when their status is not `CANCELLED`.
Orders are not rewritten if a product later moves sections.

The customer word Popular remains the Experience Definition. Internal counts are not customer
content.

A derivable cache is allowed later only if it can be rebuilt from Orders and snapshots and is
never accepted as order truth. This candidate does not create that cache.

### 7.16 Fulfilment context

Recommendation reads do not store a fulfilment mode.

| Context | Consumed from |
|---|---|
| Delivery outlet | Existing serviceability `selectedOutletId` used by cart evaluation |
| Pickup outlet | Existing pickup outlet intent and pickup profile |
| Mode | `checkouts.fulfilment_mode` when a checkout exists; otherwise the ordering context the customer-commerce APIs already validate |
| Scheduled | `checkouts.fulfilment_timing` and existing scheduled-window authority |
| Not serviceable or no legal window | No recommendation module for that context; primary commerce follows its existing unavailable behaviour |

Assortment eligibility does not take a fulfilment-mode argument today. This candidate does not
add one. Mode and timing gate whether the outlet context is orderable. They do not create a
recommendation-owned availability flag.

### 7.17 Future capability coupling

```text
CAMPAIGN_OR_OFFER_READ_IN_V1 = NO
LIMITED_DROP_READ_IN_V1 = NO
DROP_AUTHORITY_CREATED = NO
STATIC_/#drops_CONSULTED = NO
RECOMMENDATIONS_DEPEND_ON_DEALS_OR_CAMPAIGNS = NO
```

V1 ranking inputs are eligibility, relationship match, cart category presence, commercial
priority ordinal, and the Popular evidence rule. Offer metadata, campaign metadata, and Limited
Drop are not inputs.

If a later locked authority publishes an optional merchandising hint, a future change may read
it after eligibility. That read is not a V1 dependency and is not designed here. If a future
candidate is both an authoritative Limited Drop and commercial priority, customer-facing
semantics follow `BR-036K-025`. V1 has no Drop source, so that branch is unreachable.

### 7.18 Latency and failure

The recommendation read is bounded and cancellable. It is not awaited by checkout or payment.
A timeout or error produces the empty outcome in section 7.8. The primary Product, Cart,
Checkout, and Payment handlers keep their existing latency and error behaviour.

A numeric millisecond budget is not a product contract. The Quality Plan must prove that a
slow or failed recommendation read does not block or fail those handlers.

### 7.19 Concurrency and idempotency

| Boundary | Rule |
|---|---|
| Relationship create, update, activate, disable | One row revision. Writer sends the expected revision. Mismatch returns the existing conflict behaviour and does not publish an ineligible target. |
| Two operators | The later stale revision loses. The winner cannot bypass eligibility at customer read time. |
| Ranking read | Read-only. Same eligible inputs and the same commerce truth produce the same order. No cart write. |
| Recommendation add | Existing cart lock, revision, and coalesce. Duplicate submit follows existing cart conflict rules. Recommendation-origin eligibility is re-resolved before units or marks are committed. |
| Suppression | Insert is idempotent per cart and candidate. Removal of an already suppressed candidate does not change catalog. |
| Attribution mark | Written by the server only after the seven proofs in section 7.12 hold, including a server-validated presentation occurrence. An issued set without that occurrence writes no mark. Client retry after a committed add does not create a second mark for the same unit. |
| Holdout | When activation exists, write the server-owned assignment before the first exposure, or suppress presentation until it exists. A later Cart in an already exposed journey does not roll a new assignment. Inactive configuration writes nothing. |
| Popular read | Read-only. Concurrent orders change later reads. They do not rewrite earlier snapshots. |

No new customer-visible conflict copy is introduced.

### 7.20 Privacy and security

```text
PSYCHOGRAPHIC_PROFILE = NOT_CREATED
CROSS_SESSION_PERSONALIZATION = NO
NEW_CUSTOMER_IDENTITY = NO
PII_IN_RECOMMENDATION_PAYLOAD = NO
PAYMENT_DATA_IN_MEASUREMENT = NO
```

Ranking uses the current outlet, fulfilment context, cart category presence, and the operator
relationship. It does not use prior-session click history.

Abuse cases denied:

- a forged candidate, candidate id, recommendation boolean, or unvalidated render event cannot create a presentation occurrence, recommendation-origin provenance, recommendation-origin units, or an assistance mark
- a recommendation action whose current outlet, assortment, availability, fulfilment, catalog lifecycle, required configuration, or relationship period fails is rejected before those units or marks are committed
- a disabled relationship or stale display cannot skip that add-time revalidation
- commercial priority cannot make an ineligible item return
- `menu.manage` on another brand is denied by server-derived scope
- priority values are admin-only and audited as relationship changes, not as price changes
- a customer response that included priority or margin would violate `BR-036K-026` and is out of
  the response contract

Relationship audit records the workforce actor, brand, action, and relationship id. It does not
record a customer cart.

---

## 8. Authoritative flows

### Read path

```text
Customer surface
  → customer-commerce recommendation read
  → resolve outlet and fulfilment from existing authorities
  → if holdout is activated and no stable server-owned assignment exists: return no module
  → if that assignment selects holdout: return no module
  → if placement is CART and the cart has no lines: return no module
  → if placement is CUSTOMIZATION: read current product variants and modifiers
  → if placement is PRODUCT_DETAIL or CART: read active relationships
  → resolve categories through the effective menu
  → remove suppressed candidates
  → eligibility, then ranking, then ceiling
  → Popular decoration only if section 7.15 passes
  → when a qualifying set is returned: record SERVER_SET_CORRELATION (set issued; not rendered)
  → customer-safe payload carrying that correlation
```

Failure at any step after the primary surface has loaded returns no module, writes no issued
set, writes no presentation occurrence, and writes no cart.

### Presentation observation path

```text
After the module has actually been shown
  → browser reports SET_RENDER using the issued correlation
  → server validates that observation against the issued set
  → validation succeeds: record SET_RENDER
  → validation fails: record no presentation occurrence

After a specific item in that module has actually been shown
  → browser reports ITEM_IMPRESSION for that issued member
  → server validates membership against the issued set and keeps server-stored rank
  → validation succeeds: record ITEM_IMPRESSION
  → validation fails: record no presentation occurrence

Observation persistence fails
  → the module may still be shown
  → no presentation occurrence is stored
  → later assistance is not claimed
  → Cart, Checkout, and Payment stay on their existing paths
```

### Write path

```text
Ordinary Menu or Product add
  → POST /api/v1/cart/lines → addCartLine
  → existing lock, revision, structure check, coalesce, and units
  → no recommendation-action correlation
  → no assistance mark

Recommendation action
  → configuration-required items open existing customization first
  → the cart changes only when that flow reaches the same add boundary below
  → same POST /api/v1/cart/lines → addCartLine
  → existing lock and revision
  → re-resolve current eligibility (section 7.10)
  → if ineligible: reject; no units; no attribution; prior lines remain
  → verify server-validated SET_RENDER and ITEM_IMPRESSION for that issued member (section 7.12)
  → if presentation is not proven: no recommendation-origin provenance and no assistance mark; existing structure check, coalesce, and unit append may still commit that add unmarked when commerce accepts it
  → if presentation is proven and eligible: existing structure check, coalesce, and unit append
  → assistance mark only on units created by that proven action

Removal
  → existing removeCartLine
  → suppression row
```

Administration:

```text
Workforce session
  → /api/admin/v1/* on the operations process
  → menu.manage on the server-loaded brand
  → relationship revision write
  → no menu version publish and no catalog content publish
```

### Trust boundaries

| Boundary | Rule |
|---|---|
| Browser | Display, explicit intent, and observation of what was actually shown. Not set identity, membership, eligibility, rank, relationship, holdout assignment, presentation proof, or attribution. |
| Customer-commerce `/api/v1/*` | Read-time eligibility, ranking, set issuance, validation of presentation observations, existing cart mutation, add-time revalidation, suppression, attribution |
| Administration `/api/admin/v1/*` | Relationship configuration |
| Pricing / Promotion / Checkout / Payment | Unchanged authorities. Recommendation code does not call them to set money. |
| Orders and snapshots | Read for Popular and assisted purchase. Not written by recommendation ranking. |

---

## 9. Persistence implications

Later implementation will need new rows. This candidate does not add a migration, Drizzle
table, or runtime module.

```text
SCHEMA_CHANGE_REQUIRED_LATER = YES
SCHEMA_CHANGE_AUTHORED = NO
COMMERCE_MONEY_SCHEMA_CHANGE = NO
ORDER_SCHEMA_AS_SECOND_TRUTH = NO
```

Later rows, all inside existing Postgres and existing processes:

| Later row | Owner | Must not |
|---|---|---|
| Operator relationship and revision | Menu administration | Become a product, price, or menu entry |
| Cart suppression | Cart | Update catalog or menu |
| Cart unit assistance mark | Cart unit | Become line identity, price, or a client-set flag |
| Issued-set correlation | Server record written only when a qualifying set is returned | Become presentation proof, a client-invented set, a client candidate id, a boolean, view-through, or a second cart |
| Presentation occurrence | Server record written only after a browser observation validates against that issued set | Be created by server return alone, by an unvalidated client event, or by a candidate outside the issued set |
| Snapshot assistance copy | Checkout snapshot line provenance for surviving marked identity only | Change paise totals, create a commercial `line_origin`, or copy a dropped or unmarked unit |
| Holdout assignment, only after activation | Server-owned ordering session or cart for that journey, established before exposure | Store a customer profile, a credential copy, a browser-authoritative flag, or a reason the customer can see |
| Relationship audit | Workforce audit | Be recorded as a menu publish |

Popular evidence needs no new order fact. A rebuildable read model is optional and non-authoritative.

Measurement event storage is deliberately not selected.

---

## 10. Observability

Support and operators can distinguish, in server diagnostics and not in customer copy:

- set issued and not rendered
- presentation observation rejected
- presentation-observation persistence failed; commerce continued; assistance not claimed
- no eligible candidate
- holdout, only as an internal reason
- holdout assignment not yet established, only while activation is on
- generation failure
- eligibility rejection at read time or at the recommendation add
- unverified recommendation action, with no assistance mark
- customer removal with suppression
- operator disable

Existing request correlation remains the baseline. No new telemetry platform.

---

## 11. Rollback and degradation

```text
RECOMMENDATION_READ_DISABLED_OR_FAILING = no module
CART_CHECKOUT_PAYMENT = unchanged
RELATIONSHIP_TABLE_ABSENT = same as no relationships
HOLDOUT_INACTIVE = recommendations may be shown when eligible
HOLDOUT_ACTIVATED_ASSIGNMENT_UNKNOWN = no recommendation module; commerce unchanged
POPULAR_READ_FAILS = no Popular treatment
PRESENTATION_OBSERVATION_WRITE_FAILS = module may still be shown; ordinary cart add may still succeed; assistance is not claimed
ATTRIBUTION_WRITE_FAILS = cart add still succeeds and assistance is not claimed
```

Disabling every relationship stops new Product Detail and Cart relationship suggestions.
Customization can still read variants and modifiers. Lines already in carts remain until the
customer or existing cart rules change them.

---

## 12. Story traceability

| Story | Architecture decision |
|---|---|
| `US-036K-001` | Product Detail read, relationship complements, ceiling 3, fail-open |
| `US-036K-002` | Customization read from variants and modifiers only |
| `US-036K-003` | Cart gap over menu sections, empty cart has no module |
| `US-036K-004` | Existing `addCartLine` or existing customization; recommendation-origin adds revalidated inside that mutation |
| `US-036K-005` | Eligibility before ranking |
| `US-036K-006` | Add-time revalidation extends the existing Cart mutation; stale recommendation add creates no units |
| `US-036K-007` | Separate read, no cart write on failure |
| `US-036K-008` | Cart-scoped suppression |
| `US-036K-009` | Issued set, then server-validated actual presentation, then a unit mark whose continuity is the exact recommended identity; snapshot copies only surviving provenance; issuance alone, view-through, and parent-product survival are excluded |
| `US-036K-010` | Server ranking; priority after eligibility; weights not contracted |
| `US-036K-011` | Order and snapshot read; minimum 30; top 3 |
| `US-036K-012` | `menu.manage` on brand; Customization placement rejected |
| `US-036K-013` | Inactive holdout. When later activated, assignment before exposure or suppression until assignment; presentation-only |

Experience rules `XR-IMP-036K-001` through `XR-IMP-036K-016` are unchanged. Proof of interaction,
copy, and silence waits for Experience QA after Design Readiness.

---

## 13. Explicit non-goals

- A new ADR, a new global architecture revision, or a new decision (Architecture Fit PASS and the lock are recorded; Design Readiness is not)
- Design Readiness, Quality Plan, Measurement Plan, or implementation authorization
- Runtime modules, routes, or schema migrations in this change
- A Recommendation commerce aggregate
- A second pricing, promotion, catalog, availability, cart, or auth model
- A new role or permission
- Customization candidates from operator relationships
- Hardcoded customer category names
- View-through attribution
- Holdout activation
- ML, embeddings, LLM, or an external recommendation vendor
- A Limited Drop or Campaign dependency
- Moving `currentProductSlice` off IMP-036J

---

## 14. What later phases must still finalize

This locked architecture does not perform Design Readiness, the Quality/Test Plan, the Measurement Plan, or implementation.

Quality / Test Plan must prove, under TEST-1:

- eligibility before ranking, including cross-outlet rejection
- direct add versus customization handoff
- stale recommendation add is rejected inside the existing Cart mutation and leaves the prior cart
- recommendation-origin units and assistance marks are absent when current eligibility fails
- ordinary Menu or Product adds stay unmarked
- assisted attribution requires an issued set, membership in that set, a server-validated actual presentation, and survival of the exact marked recommended identity
- an issued set that was never rendered does not create that attribution
- a client candidate id, relationship id, boolean, or unvalidated render event does not create that attribution
- removing the recommended modifier drops that assistance
- changing away from the recommended variant drops that assistance
- an unrelated valid configuration change keeps assistance while the marked recommended identity remains
- a quantity change keeps assistance while the marked identity remains
- a category-target mark follows the concrete product that was presented and added, not the category
- a manual recreation has no previous recommendation provenance
- manual units coalesced onto the same cart line do not inherit marks
- snapshot and Order assistance use only surviving marked identity
- `SET_ISSUED`, `SET_RENDER`, and `ITEM_IMPRESSION` stay distinct
- presentation-observation persistence failure does not block ordinary commerce and does not claim assistance
- fail-open when the recommendation read fails
- suppression survives reload and does not change menu projection
- manual re-add is not attributed
- Popular treatment absent below 30 orders and present only for the top 3
- `menu.manage` allowed, cross-brand denied
- holdout inactive by default, and presentation-only if a fixture activates it
- when that fixture activates holdout, no recommendation set is returned before a stable server-owned assignment exists
- primary checkout and payment tests unchanged when recommendations fail

Measurement / Instrumentation Plan must still finalize the assignment unit, population, the actual
control percentage and whether it is activated, primary metric, guardrails, observation rule,
stop condition, interpretation rule, and the concrete event encoding, transport, durable schema,
retention, dedupe encoding, and analytics projection, including how an internal
strategy attribute is stored. Section 7.13 locks the occurrence boundary those encodings must
preserve: `SET_ISSUED`, `SET_RENDER`, and `ITEM_IMPRESSION` stay distinct, and only a
server-validated presentation occurrence satisfies the presentation leg of assistance. Section
7.14 constrains activation, not the encoding: the unit is
server-owned, stable for the active ordering session or cart once written, and established
before first exposure or presentation stays suppressed until it exists. It is not a
customer-profile personalization flag, a browser-authoritative flag, or an experiment vendor.
Cart id alone, assigned only after a Product Detail exposure, is not sufficient. `INSUFFICIENT_EVIDENCE`
remains valid. This candidate does not select event encoding, transport, or retention, and it
does not activate a holdout.

Design Readiness must still specify the implementation-ready states for `XR-IMP-036K-001`
through `XR-IMP-036K-016`.

---

## 15. Unresolved architecture questions

```text
UNRESOLVED_ARCHITECTURE_QUESTIONS = NONE
ARCHITECT_DECISION_REQUIRED = NONE
OPEN_PRODUCT_DECISIONS = NONE
```

No approved Product or Experience rule requires a new service, permission, role, money
authority, or category taxonomy. Remaining choices in section 14 are later-phase encoding and
proof, not competing architectures.
