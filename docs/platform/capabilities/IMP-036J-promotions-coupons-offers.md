<!-- governance-meta
{
  "status": "CURRENT",
  "authority": "CAPABILITY_ARCHITECTURE",
  "capability": "IMP-036J",
  "title": "Promotions, Coupons and Offers",
  "productDefinition": "PD-IMP-036J-DRAFT-6",
  "productDefinitionStatus": "APPROVED",
  "productDefinitionGate": "PASS",
  "experienceDefinition": "XD-IMP-036J-DRAFT-6",
  "experienceDefinitionStatus": "APPROVED",
  "experienceGate": "PASS",
  "experienceCriticality": "X3",
  "changeRisk": "CR2",
  "designReadiness": "NOT_PERFORMED",
  "candidateRevision": "IMP-036J-FIT-CANDIDATE-5",
  "architectureFitSourceCandidate": "IMP-036J-FIT-CANDIDATE-5",
  "architectureBase": "ARCH-R23",
  "architectureFit": "PASS",
  "architectureLock": "LOCKED",
  "independentArchitectureFitReview": "PASS",
  "independentArchitectureFitReviewId": "5347761109",
  "architectureFitEvaluatedHead": "49912f35f2871ff77b9af267589d49666fc975ec",
  "architectureFitEvaluatedTree": "7046d5bb78012524972505f555226205199a58d0",
  "architectureFitEvaluatedGovernanceFingerprint": "ac6510d315148763069f06374a243a75a312a7693cf3e7c1d0eac71bc1026870",
  "implementationAuthorized": false,
  "implementationStarted": false,
  "schemaChangeRequired": true,
  "globalDecisionRequired": false,
  "d383Required": false,
  "archR24Required": false,
  "founderUatRequired": true,
  "founderUat": "NOT_STARTED",
  "lastReviewed": "2026-09-29",
  "bindingDecisions": ["D-382", "ADR-007", "ADR-008"],
  "dependsOn": ["IMP-016", "IMP-021", "IMP-036F", "IMP-036H", "IMP-036I"]
}
-->

# IMP-036J — Promotions, Coupons & Offers

## Capability architecture — ARCHITECTURE_LOCKED

```text
STATUS = CURRENT
AUTHORITY = CAPABILITY_ARCHITECTURE
CAPABILITY = IMP-036J
PRODUCT_DEFINITION = PD-IMP-036J-DRAFT-6
PRODUCT_DEFINITION_STATUS = APPROVED
PRODUCT_DEFINITION_GATE = PASS
EXPERIENCE_DEFINITION = XD-IMP-036J-DRAFT-6
EXPERIENCE_DEFINITION_STATUS = APPROVED
EXPERIENCE_GATE = PASS
EXPERIENCE_CRITICALITY = X3
CHANGE_RISK = CR2
ARCHITECTURE_FIT_SOURCE_CANDIDATE = IMP-036J-FIT-CANDIDATE-5
CANDIDATE_REVISION = IMP-036J-FIT-CANDIDATE-5
ARCHITECTURE_BASE = ARCH-R23
ARCHITECTURE_FIT = PASS
ARCHITECTURE_LOCK = LOCKED
IMP036J_ARCHITECTURE_FIT = PASS
IMP036J_ARCHITECTURE_LOCKED = YES
INDEPENDENT_ARCHITECTURE_FIT_REVIEW = PASS
INDEPENDENT_ARCHITECTURE_FIT_REVIEW_ID = 5347761109
ARCHITECTURE_FIT_EVALUATED_HEAD = 49912f35f2871ff77b9af267589d49666fc975ec
ARCHITECTURE_FIT_EVALUATED_TREE = 7046d5bb78012524972505f555226205199a58d0
ARCHITECTURE_FIT_EVALUATED_GOVERNANCE_FINGERPRINT = ac6510d315148763069f06374a243a75a312a7693cf3e7c1d0eac71bc1026870
ARCHITECTURE_FIT_EVALUATED_CODEX_REVIEW = 5883601198
ARCHITECTURE_FIT_EVALUATED_CI_RUN = 36521141717
ARCHITECTURE_FIT_EVALUATED_CODEQL_RUN = 36521141714
IMP036J_DESIGN_READINESS = NOT_PERFORMED
IMP036J_NEXT_GATE = DESIGN_READINESS
QUALITY_TEST_PLAN_FINALIZED = NO
MEASUREMENT_INSTRUMENTATION_PLAN_FINALIZED = NO
IMPLEMENTATION_PLAN = NOT_PERFORMED
IMPLEMENTATION_AUTHORIZED = false
IMP036J_IMPLEMENTATION_AUTHORIZED = NO
IMP036J_STARTED = NO
IMP036J_IMPLEMENTATION_STARTED = NO
GLOBAL_DECISION_REQUIRED = NO
D383_REQUIRED = NO
ARCH_R24_REQUIRED = NO
NEW_ADR_REQUIRED = NO
SCHEMA_CHANGE_REQUIRED = YES
NEW_SERVICE_REQUIRED = NO
NEW_CUSTOMER_FACADE_ROUTE = POST /api/v1/checkouts/{checkoutId}/review-presented
NEW_AUTH_MODEL_REQUIRED = NO
NEW_PERMISSION_REQUIRED = NO
FOUNDER_UAT_REQUIRED = YES
FOUNDER_UAT = NOT_STARTED
```

This document is the locked capability architecture for IMP-036J. It preserves the reviewed
semantics of `IMP-036J-FIT-CANDIDATE-5`. Independent ChatGPT Architecture Fit review `5347761109`
returned PASS for that candidate at head `49912f35f2871ff77b9af267589d49666fc975ec`, tree
`7046d5bb78012524972505f555226205199a58d0`, and governance fingerprint
`ac6510d315148763069f06374a243a75a312a7693cf3e7c1d0eac71bc1026870`. Fresh Codex review
`5883601198` on that same head was clean. CI run `36521141717` and CodeQL run `36521141714`
passed on that same head. This lock checkpoint is a later commit. It is not that evaluated head.
No working-tree fingerprint is recorded for the evaluated head because one was not part of the
independent review evidence. The lock does not authorize implementation, perform Design
Readiness, finalize the Quality/Test Plan, or finalize the Measurement/Instrumentation Plan.
Section 30 remains a future implementation proof plan. Global architecture stays ARCH-R23.
The decision register stays DR-23. D-383 is not created. No ADR is created.
`CANDIDATE_REVISION` records the source candidate. It is not an architecture version and it does
not create ARCH-R24.

```text
IMP-036J-FIT-CANDIDATE-1 = original pre-Experience candidate
IMP-036J-FIT-CANDIDATE-2 = reconciled to Product Gate PASS and Experience Gate PASS
  remediated review threads 4120389710 and 4120389719
  exact-head review then found 4126352631, 4126352640, 4126352650, and 4126352660
  ARCHITECTURE_FIT_REVIEW = NOT_PERFORMED
  ARCHITECTURE_FIT_PASS = NO
  ARCHITECTURE_FIT_STOP = NO
IMP-036J-FIT-CANDIDATE-3 = remediated those four open exact-head findings
  exact-head review then found 4129243690 and 4129243701
  did not reach independent ChatGPT Architecture Fit review
  ARCHITECTURE_FIT_REVIEW = NOT_PERFORMED
  ARCHITECTURE_FIT_PASS = NO
  ARCHITECTURE_FIT_STOP = NO
IMP-036J-FIT-CANDIDATE-4 = remediates those two open exact-head findings
  exact-head review then found 4129513169
  did not reach independent ChatGPT Architecture Fit review
  ARCHITECTURE_FIT_REVIEW = NOT_PERFORMED
  ARCHITECTURE_FIT_PASS = NO
  ARCHITECTURE_FIT_STOP = NO
IMP-036J-FIT-CANDIDATE-5 = source semantics of this locked architecture
  remediates 4129513169
  preserves the Candidate 2, Candidate 3, and Candidate 4 remediations
  independent Architecture Fit review = PASS
  INDEPENDENT_ARCHITECTURE_FIT_REVIEW_ID = 5347761109
  ARCHITECTURE_FIT_EVALUATED_HEAD = 49912f35f2871ff77b9af267589d49666fc975ec
  ARCHITECTURE_FIT_EVALUATED_TREE = 7046d5bb78012524972505f555226205199a58d0
  ARCHITECTURE_FIT_EVALUATED_GOVERNANCE_FINGERPRINT = ac6510d315148763069f06374a243a75a312a7693cf3e7c1d0eac71bc1026870
  Fit PASS subsequently persisted by this lock checkpoint
  ARCHITECTURE_FIT_REVIEW = PASS
  ARCHITECTURE_FIT_PASS = YES
```

Candidate 2 did not receive an independent Architecture Fit verdict. Candidate 3 did not either:
its exact-head review opened 4129243690 and 4129243701 and stopped before ChatGPT Architecture Fit
review. Candidate 4 remediated those two findings. Its exact-head review then opened 4129513169 and
stopped before ChatGPT Architecture Fit review. `IMP036J_ARCHITECTURE_FIT` stayed `NOT_PERFORMED`
through Candidate 4. Candidate 5 received independent Architecture Fit review PASS
`5347761109`. This lock checkpoint persists that PASS. Candidates 1–4 are not rewritten as a
Gate verdict.

An Offer remains customer and operator meaning over the accepted Promotion authority. It does not
set money by itself.

---

## 1. Source candidate provenance

Discovered on canonical `main` before this branch was created.

```text
REPOSITORY = /home/ajoshi/repos/boba-bear-platform
BRANCH_AT_DISCOVERY = main
HEAD = c2098ba7998aa47b6748c0b701cda565a05a65c9
ORIGIN_MAIN = c2098ba7998aa47b6748c0b701cda565a05a65c9
TREE = 06d0210adb00f77b09b5a7348f1314beef227051
WORKING_TREE_AT_DISCOVERY = CLEAN
WORKING_TREE_FINGERPRINT = 5d6b168c795a2b45695bceca506203bfddb587d77f6220e4c49d20fd9abac652
ROADMAP = GTM-R169
STATE = STATE-R167
ARCHITECTURE = ARCH-R23
DECISION_REGISTER = DR-23
acceptedThrough = IMP-036I
currentProductSlice = IMP-036J
nextProductSlice = IMP-037
pendingAcceptance = NONE
NEXT_DECISION_ID = D-383
D-377 = CURRENT
D-382 = CURRENT
IMP037_HOLD = YES
IMP038_HOLD = YES
GAP-EXT-ASSESS-001 = NOT_CLOSED
```

That discovery predates Experience Gate PASS. It is historical origin only.

Reconciliation provenance, after rebase onto canonical `main`. Identifiers in this candidate were
re-read from this tree, not copied from the pre-Experience candidate.

```text
RECONCILED_AGAINST_BRANCH = main
RECONCILED_HEAD = 2bef21b5ae82439f39ee7d4462f87bd6a9501aeb
RECONCILED_TREE = cbc6acae764363252e37acdf40ca9ff902790464
ROADMAP = GTM-R171
STATE = STATE-R169
ARCHITECTURE = ARCH-R23
DECISION_REGISTER = DR-23
PRODUCT_DELIVERY = PD-2
EXPERIENCE = EXP-1
PRODUCT_LANGUAGE = LANG-1
TESTING = TEST-1
PRODUCT_DEFINITION = PD-IMP-036J-DRAFT-6
PRODUCT_DEFINITION_GATE = PASS
EXPERIENCE_DEFINITION = XD-IMP-036J-DRAFT-6
EXPERIENCE_DEFINITION_STATUS = APPROVED
EXPERIENCE_GATE = PASS
EXPERIENCE_CRITICALITY = X3
CHANGE_RISK = CR2
acceptedThrough = IMP-036I
currentProductSlice = IMP-036J
nextProductSlice = IMP-037
pendingAcceptance = NONE
nextGate = ARCHITECTURE_FIT
NEXT_DECISION_ID = D-383
D-383 = NOT_CREATED
ARCH-R23 = CURRENT
ARCH-R24 = NOT_CREATED
```

Candidate 3 was read from the same canonical `main` and the same runtime writers as Candidate 2.
Source inspection did not show drift in Product, Experience, `main`, or the writers cited below.
This revision does not rebase product or experience authority.

Identifiers below were read from current source, schema, and migrations. They are not inferred names.

---

## 2. Product and Experience authority

Product authority: [`../product/IMP-036J/product-definition.md`](../product/IMP-036J/product-definition.md).

Experience authority: [`../product/IMP-036J/experience-definition.md`](../product/IMP-036J/experience-definition.md).
Experience is binding for presentation fit and for the X3 measurement contract. It is not optional
UI commentary, and it is not customer-copy authority. LANG-1 remains the projection-language
authority. This candidate does not put final microcopy into architecture and does not expose raw
backend enum or error language as the customer default.

```text
PRODUCT_DEFINITION_VERSION = PD-IMP-036J-DRAFT-6
STATUS = APPROVED
PRODUCT_DEFINITION_GATE = PASS
FD-036J-01 = APPROVED (2026-09-27)
FD-036J-02 = APPROVED (2026-09-27)
FD-036J-03 = APPROVED (2026-09-28)
OPEN_FOUNDER_PRODUCT_DECISIONS = 0
MANDATORY_STORIES = US-036J-001 .. US-036J-013
COMPLIMENTARY_MENU_ITEM_V1_ACCEPTANCE = MANDATORY
EXPERIENCE_DEFINITION_VERSION = XD-IMP-036J-DRAFT-6
EXPERIENCE_DEFINITION_STATUS = APPROVED
EXPERIENCE_GATE = PASS
EXPERIENCE_CRITICALITY = X3
CHANGE_RISK = CR2
```

This candidate implements fit for both authorities. It does not redesign approved customer behaviour,
weaken a mandatory acceptance scenario, move a V1 requirement to follow-up, or create FD-036J-04.

Deals, Campaigns, and Revenue Recommendations stay parked. This candidate does not add a Deal
evaluator, a Campaign engine, or a browse hub.

---

## 3. Accepted global invariants preserved

| Invariant | Candidate posture |
|---|---|
| ARCH-G01 / D-356 / D-359 | Static Next.js export → Nginx → existing façades. No Route Handler, Server Action, or `src/app/api` business API. The Review presentation acknowledgement is a route on the existing `customer-commerce` façade, not a Next route. |
| D-360 | Customer commerce stays `/api/v1/*` on `customer-commerce`, including `POST /api/v1/checkouts/{checkoutId}/review-presented`. |
| D-372 / D-373 | Workforce commercial administration stays `/api/admin/v1/*` on the existing operations process. |
| ARCH-G02 / ARCH-G14 | No new deployable service, queue, or broker. |
| ADR-007 | Pricing owns money. INR paise. Promotion lifecycle stays `draft \| active \| retired`. Coupon lifecycle stays `draft \| active \| disabled \| retired`. |
| ADR-008 / ARCH-G05 | Checkout Snapshot remains payment-bound commercial truth. Purchased Order reads that snapshot and does not reprice. |
| ARCH-G09 | Material commercial writes keep expected-revision CAS. No silent last-write-wins. Presentation acknowledgement does not bump a commercial revision. |
| ARCH-G11 | Browser is not monetary or eligibility authority. The client sends an opaque server-issued receipt id and no price. |
| ARCH-G13 | PostgreSQL remains the store. |
| D-368 | Menu remains a read projection. The complimentary binding is a Catalog variant, not a Menu row and not a gift catalogue. |
| D-369 | A positive-price modifier is not copied onto the complimentary line from a catalog default. |
| D-370 | Guest→customer cart continuity keeps the one `carts.manual_coupon_code`. |
| D-378 / IMP-036H | `DELIVERY` and `PICKUP` stay Checkout facts. Pickup does not take a delivery charge. |
| D-379 / IMP-036I | `ASAP` and `SCHEDULED` stay Checkout facts. No new schedule domain. |
| D-382 | No second Promotion evaluator and no second Pricing engine. |
| ADR-005 / D-358 / D-373 | No new role and no new permission key. |

---

## 4. Existing-engine inventory

Evidence is the reconciliation tree in section 1. The historical discovery SHA is not the source of these identifiers.

### 4.1 Promotion authority

| Fact | Actual location |
|---|---|
| Table | `app.promotions` in `src/platform/database/schema/promotions.ts`; created in `drizzle/0010_promotions_coupons.sql`; `revision` added in `drizzle/0040_curvy_tomas.sql` |
| Domain type | `PromotionDefinition` in `src/shared/promotions/types.ts` |
| Status | `PROMOTION_STATUSES` = `draft \| active \| retired` (`src/shared/promotions/constants.ts`) |
| Trigger | `trigger_type` = `automatic \| coupon` |
| Stacking column | `stacking_policy` = `exclusive \| combinable` (`promotions_stacking_policy_check`) |
| Threshold columns | `minimum_qualifying_amount_paise`, `minimum_item_quantity` |
| Commands | `createPromotionDraft`, `updatePromotionDraft`, `deletePromotionDraft`, `setPromotionBenefit`, `setPromotionTargets`, `activatePromotion`, `retirePromotion` in `src/server/promotions/promotions.ts` |
| CAS | `advancePromotionRevision`, `PROMOTION_STALE_REVISION` |
| Provenance | `configuration_fingerprint` written at activation. It is not the stale-review guard. |

There is no `promotion_revisions` table.

### 4.2 Qualifiers and benefits

Targets live in `app.promotion_targets` (`target_role` `qualifier \| benefit`; `target_type` `all_merchandise \| product \| variant \| charge`). There is no separate qualifier table.

Benefits live in `app.promotion_benefits`, one row per promotion (`promotion_benefits_promotion_uidx`). Checked type set in `drizzle/0010_promotions_coupons.sql`:

```text
percentage_discount | fixed_amount_discount | buy_x_get_y
```

`free_delivery` and `complimentary_item` are **NOT_FOUND** as benefit types. Calculation is `calculateBenefit` in `src/shared/promotions/benefit.ts`.

Eligibility is `evaluateEligibility` in `src/shared/promotions/eligibility.ts`. It checks status, channel, scope, window, minimum amount, and minimum quantity. It does not check first-order, fulfilment mode, or fulfilment timing.

### 4.3 One evaluation path already exists

```text
evaluateCart
  → buildDirectPricingQuote          src/server/pricing/quote.ts
      → evaluatePromotions           src/shared/promotions/evaluate.ts
      → buildPromotionCandidates     src/shared/promotions/select.ts
      → selectBestCandidate          src/shared/promotions/select.ts
      → calculateTax                 src/server/pricing/tax.ts

evaluateCheckout
  → buildCheckoutCommercialResult    src/server/checkout/adapters/pricing.ts
      → the same buildDirectPricingQuote
```

`evaluatePromotions` does not pick a winner. `selectBestCandidate` does, after the quote attaches post-tax `grandTotalPaise`. Current winner order: lowest grand total that is still `<=` baseline, then higher realized discount, then higher `priority`, then earlier `startsAt`, then lexicographic promotion ids.

Current candidate construction is **not** the FD-036J-02 slot model:

- each `exclusive` promotion is its own candidate
- every `combinable` promotion is stacked into **one** candidate, including two merchandise discounts
- exclusive and combinable promotions are not paired

`toApplied` drops a promotion when realized discount is `<= 0`.

Cart evaluation does not pass charges, so packaging and delivery are absent from the cart quote. Checkout passes them.

`buildCheckoutCommercialResult` throws `CHECKOUT_COUPON_INELIGIBLE` when `cart.manualCouponCode` is set and `submittedCouponResult.status !== "APPLIED"`. That current rule rejects a valid coupon that lost the comparison. Section 8 changes that rule inside this same checkout adapter.

### 4.4 Coupon authority

| Fact | Actual location |
|---|---|
| Table | `app.promotion_coupons` |
| Status | `draft \| active \| disabled \| retired` |
| Limits | `maximum_redemptions`, `maximum_redemptions_per_customer` on the coupon row only |
| Cart attachment | `carts.manual_coupon_code` |
| Apply / remove | `applyCartCoupon`, `removeCartCoupon` in `src/server/cart/operations.ts` |
| Customer routes | `POST /api/v1/cart/coupon`, `POST /api/v1/cart/coupon/remove` |
| Apply behaviour | Stores a known canonical code. Does not check status, window, or caps. Same code is a no-op. Unknown code throws `CART_COUPON_UNKNOWN`. |
| Guest continuity | `claimGuestCart` copies or conflicts `manualCouponCode` |
| Evaluation outcome | `SubmittedCouponResult.status` includes `APPLIED`, `VALID_BUT_NOT_SELECTED`, `NOT_APPLICABLE`, `INVALID`, `CUSTOMER_IDENTITY_REQUIRED`, `REDEMPTION_ENFORCEMENT_UNAVAILABLE` |
| Checkout column | `checkouts.customer_auth_user_id` is `notNull`. A guest has a cart and does not have a checkout. |

There is one mutable coupon field. Checkout does not have its own mutable coupon column. `checkout_snapshots.manual_coupon_code` is a sealed copy on an insert-only snapshot.

### 4.5 Redemption

Table `app.promotion_redemption_claims` (`drizzle/0016_payment.sql`). Status `RESERVED \| CONSUMED \| RELEASED`.

| Function | Boundary |
|---|---|
| `acquireReservedClaimsForAttempt` | Payment initiation and `retryPayment`, after `lockPromotionsAndCoupons` (`FOR UPDATE`) |
| `enforceCouponCapacity` | Same transaction, only when `couponId` is present. Counts `RESERVED + CONSUMED` units. |
| `consumeClaimsForAttempt` | `applySuccess`, after the attempt and payment are `SUCCEEDED`. Already-succeeded replay returns before consume. |
| `releaseClaimsForAttempt` | `applyDefinitiveNonSuccess` for `FAILED` / `CANCELLED`, only while `RESERVED` |
| `acquireConsumedClaimsForZeroPayable` | Completed zero-payable checkout, `CONSUMED` immediately |

Claims are not written at cart apply. `enforceCouponCapacity` returns immediately when the applied promotion has no `couponId`, so an automatic Offer has no cap enforcement today. Promotion rows have no `maximum_redemptions` column.

Unique indexes:

- `promotion_redemption_claims_attempt_promotion_uidx` on (`payment_attempt_id`, `promotion_id`) where the attempt is not null
- `promotion_redemption_claims_zero_snapshot_promotion_uidx` on (`checkout_snapshot_id`, `promotion_id`) where `payment_id` is null

`retryPayment` refuses an unresolved attempt (`PAYMENT_UNRESOLVED_ATTEMPT`) and refuses a payment that is not `OPEN`. A failed attempt has already released its `RESERVED` rows. The retry inserts claims for a new attempt id. Released rows do not count toward capacity.

### 4.6 Pricing, delivery tariff, cart, checkout, order

| Authority | Actual fact |
|---|---|
| Money | `buildDirectPricingQuote` produces `grandTotalPaise`. Payment expects the snapshot `grand_total_paise`. |
| Standing delivery | `resolveCustomerDeliveryCharge` in `src/server/pricing/resolve-delivery-charge.ts`. Source columns `outlet_serviceability_configs.delivery_fee_bands` and `free_delivery_subtotal_threshold_paise`. ₹0 is a real charge amount. Pickup does not call the resolver. |
| Cart revision | `carts.revision`, `expectedRevision`, `lockCartForUpdate` |
| Checkout revision | `checkouts.revision`, `expectedCheckoutRevision` |
| Revalidation | `prepareCheckoutForPayment` compares a fresh quote with `checkoutSnapshotsStructurallyEqual`. Mismatch calls `invalidateReadyToDraft` and throws `CHECKOUT_REPRICED`. |
| Snapshot | Insert-only `checkout_snapshots`, lines, charges, and `checkout_snapshot_promotion_effects`. Effects already store `promotion_id`, `coupon_id`, `promotion_code`, `display_name`, and `effect_kind` (`monetary_allocation \| applied_promotion \| bogo_reward`). `line_id` on an allocation is the cart-line id from `extractLineId`, not a snapshot-line FK. Effects do not store promotion revision. |
| Snapshot lines | `checkout_snapshot_lines.source_cart_line_id` is `notNull` |
| Order | `orders` stores `checkout_snapshot_id` and does not copy paise. `moneySummaryFromSnapshot` reads the snapshot. `listOrdersForCustomer` filters by `checkouts.customer_auth_user_id` and does **not** filter by status. |
| First-order predicate | **NOT_FOUND**. No `first_order` column and no previous-purchase query. |
| Fulfilment on checkout | `checkouts.fulfilment_mode` (`DELIVERY \| PICKUP`), `fulfilment_timing` (`ASAP \| SCHEDULED`), window columns, `pickup_outlet_id`, `cart_id` |
| Fulfilment inside promotion evaluation | **NOT_FOUND**. Pricing and `evaluatePromotions` do not take mode or timing. |
| Availability | `resolveOutletVariantAvailability`, `resolveModifierOptionAvailability`, `collectAssortmentAvailabilityProblems`, `validateCheckoutCartMerchandise` |
| Catalog line | `catalog_products` / `catalog_variants.product_kind` = `standard \| bundle`. Modifier requirement is `catalog_variant_modifier_groups.min_total_quantity`. |

### 4.7 Administration and customer UI

| Surface | Actual fact |
|---|---|
| Workforce | `/workforce/admin/commercial/` → `CommercialWorkspaceClient` → `PromotionsEditor` |
| Admin HTTP | `handleAdminPromotionsRoute`. Draft, benefit, targets, consequence preview, activate, retire, coupon lifecycle. Mutations take `expectedPromotionRevision` or `expectedCouponRevision`. |
| Permissions | `promotions.read`, `promotions.manage`, `promotions.activate`, `promotions.audit.read`, `coupons.read`, `coupons.manage` in `src/shared/access-control/catalog.ts` |
| Benefit UI | Select offers `percentage_discount` and `fixed_amount_discount`. Domain also has `buy_x_get_y`. Complimentary and delivery waiver are absent. |
| Customer cart | `/order/cart`, `CartClient`. No coupon field. |
| Customer checkout | `/order/checkout`, `CheckoutClient`. Discount row when `promotionDiscountPaise > 0`. No coupon field. Fulfilment mode and timing are chosen here. |
| Payment | `PaymentPanel` inside checkout is a read-only summary. `/order/payment` is the return page and does not render the commercial breakdown. |
| Order detail | `/order/orders/detail` shows discount when `promotionDiscountMinor > 0`. It does not render `promotionEffects`. |
| Deals / Campaigns | **NOT_FOUND** in `src/app` and admin components. |

Audit is `app.promotion_audit_events` via `insertPromotionAuditEvent`, including `promotion.activated`. Activation and the audit insert share the promotion command's persistence context.

---

## 5. Gap matrix

Effort is not a contradiction. Every row below fits by extending the accepted authority.

| Requirement | Classification | Why |
|---|---|---|
| US-036J-001 automatic apply and explanation | `EXTEND_EXISTING_DOMAIN` + `EXTEND_EXISTING_API` + `EXTEND_EXISTING_UI` | Same `evaluatePromotions` / quote path. Cart UI does not render the quote explanation. |
| US-036J-002 one coupon state on Cart and Checkout Review | `REUSE_AS_IS` for storage + `EXTEND_EXISTING_UI` + `EXTEND_EXISTING_DOMAIN` | `carts.manual_coupon_code` is already the only mutable code. Checkout must stop treating `VALID_BUT_NOT_SELECTED` as `CHECKOUT_COUPON_INELIGIBLE`. |
| US-036J-003 threshold progress | `EXTEND_EXISTING_DOMAIN` + `EXTEND_EXISTING_API` + `EXTEND_EXISTING_UI` | `MINIMUM_AMOUNT_NOT_MET` exists. The response does not return the remaining paise. |
| US-036J-004 savings breakdown | `EXTEND_EXISTING_DOMAIN` + `EXTEND_EXISTING_UI` | Quote already has discount and charge lines. It does not split merchandise saving from a real delivery saving. |
| US-036J-005 first order | `EXTEND_EXISTING_DOMAIN` + `EXTEND_EXISTING_SCHEMA` | Predicate is **NOT_FOUND**. Read Order / succeeded Payment. Do not add a customer boolean. |
| US-036J-006 fulfilment eligibility | `EXTEND_EXISTING_DOMAIN` + `EXTEND_EXISTING_SCHEMA` | Mode and timing already exist on `checkouts`. Evaluation does not receive them. |
| US-036J-007 distinct limit states | `EXTEND_EXISTING_DOMAIN` + `EXTEND_EXISTING_SCHEMA` | Coupon reason codes exist and collapse some cases. Automatic global caps do not exist. |
| US-036J-008 stale revalidation | `REUSE_AS_IS` for `prepareCheckoutForPayment` + `EXTEND_EXISTING_DOMAIN` | Reprice-on-mismatch exists. The recovery explanation must name the stale cause, including an unavailable complimentary line. |
| US-036J-009 coupon joins the same comparison | `EXTEND_EXISTING_DOMAIN` | `VALID_BUT_NOT_SELECTED` exists. Candidate construction and the checkout ineligible throw do not yet implement best-complete-combination. |
| US-036J-010 slot stacking | `EXTEND_EXISTING_DOMAIN` | Replace candidate construction inside `buildPromotionCandidates`. Do not add an evaluator. |
| US-036J-011 historical savings | `REUSE_AS_IS` for snapshot immutability + `EXTEND_EXISTING_SCHEMA` + `EXTEND_EXISTING_UI` | Order already reads the snapshot. Seal the explanation facts the detail page needs. |
| US-036J-012 operator authoring | `EXTEND_EXISTING_UI` + `EXTEND_EXISTING_API` + `EXTEND_EXISTING_SCHEMA` | Same commercial workspace, same admin router, same CAS. |
| US-036J-013 complimentary line | `NEW_SCHEMA_WITHIN_EXISTING_AUTHORITY` + `EXTEND_EXISTING_DOMAIN` | Catalog variant binding, quote component, snapshot line. No gift catalogue. |
| Complimentary single-active race | `NEW_SCHEMA_WITHIN_EXISTING_AUTHORITY` | Partial unique index on `app.promotions`. |
| Temporary free delivery | `EXTEND_EXISTING_DOMAIN` + `EXTEND_EXISTING_SCHEMA` | New benefit type applied to the charge `resolveCustomerDeliveryCharge` already put in the quote. |
| Threshold and explanation payload | `NEW_PROJECTION_WITHIN_EXISTING_AUTHORITY` | Returned by the existing quote. Not a new read model store. |
| Payment read-only coupon | `REUSE_AS_IS` | `PaymentPanel` has no coupon control. Do not add one. |
| Deals / Campaigns | Out of scope | Parked. Not implemented here. |

No row is `CONTRADICTION`, `PRODUCT_DECISION_REQUIRED`, or `GLOBAL_ARCHITECTURE_DECISION_REQUIRED`.

---

## 6. Single commercial evaluation

```text
ONE_COMMERCIAL_EVALUATION = buildDirectPricingQuote
PROMOTION_EVALUATOR = evaluatePromotions
WINNER = selectBestCandidate
TAX = calculateTax
DELIVERY_CHARGE_INPUT = resolveCustomerDeliveryCharge
SECOND_PROMOTION_ENGINE = NO
SECOND_PRICING_ENGINE = NO
COUPON_PRICING_ENGINE = NO
CAMPAIGN_ENGINE = NO
DEAL_EVALUATOR = NO
```

`buildDirectPricingQuote` remains the only function that turns merchandise, modifiers, bundles, charges, promotions, and tax into `grandTotalPaise`.

### Input

The quote input gains a fulfilment context taken from accepted checkout facts when a checkout exists:

```text
cart lines and configured modifiers
outlet and evaluation time
submittedCouponCode = carts.manual_coupon_code
customerId = authenticated customer_auth_user_id, else null
charges = packaging plus standing delivery charge when mode is DELIVERY
fulfilmentMode = checkouts.fulfilment_mode when an open checkout exists for carts.id
fulfilmentTiming = checkouts.fulfilment_timing
scheduled window = checkout window columns when timing is SCHEDULED
```

Before any checkout exists, `carts` has no mode column. Mode-restricted and timing-restricted Offers are not applied on that cart, and no delivery charge is invented. Merchandise Offers that do not restrict mode still evaluate. When an open checkout exists (`checkouts.cart_id`), cart evaluation reads that checkout's mode and timing so the cart and Checkout Review cannot disagree.

`PICKUP` does not receive a delivery charge, matching current `buildCheckoutCommercialResult`.

### Candidate representation

Inside `buildPromotionCandidates`, each eligible promotion has one class derived from its benefit, not from a new table:

```text
DELIVERY_INCENTIVE =
  benefit type delivery_fee_waiver
  OR a benefit target whose charge definition code is 'delivery'

PRIMARY_MERCHANDISE_OR_ORDER =
  percentage_discount
  fixed_amount_discount
  buy_x_get_y
  complimentary_item
  OR a non-delivery charge target
```

Activation rejects a configuration that qualifies as both classes.

A candidate is one of:

```text
no primary and no delivery          (baseline)
one primary and no delivery
no primary and one delivery
one primary and one delivery        (only when the pair is compatible)
```

The entered coupon, when `evaluateSubmittedCoupon` accepts it, is one member of `eligible`. It does not open a third slot and it does not create a second total.

### Qualification

Existing `evaluateEligibility` remains the window, scope, channel, and threshold check. The same function gains:

- first-order predicate from section 9, fail closed when identity is absent or history cannot be read
- fulfilment mode and timing match, fail closed when the Offer restricts a fact the context does not have
- complimentary variant availability through `resolveOutletVariantAvailability`
- cap projection read of `RESERVED + CONSUMED` claims, without writing a claim

A submitted coupon keeps the existing reason codes and adds the distinct classes in section 16.

### Benefit application

`calculateBenefit` and the existing allocators remain the money application. Pricing still resolves every paise, including the complimentary variant via `resolveOutletVariantPrice`, before the promotion allocation zeroes that line's merchandise amount.

`delivery_fee_waiver` allocates against the delivery charge component already present in the quote. It calls `resolveCustomerDeliveryCharge` zero additional times.

### Combination generation

`stacking_policy` is reconciled, not deleted:

```text
SAME_SLOT_STACK = FORBIDDEN
CROSS_SLOT_PAIR = both stacking_policy values are combinable
EXCLUSIVE = that promotion is a candidate only in its own slot, unpaired
```

Current behaviour that stacks every `combinable` promotion into one candidate is replaced here. Two combinable merchandise discounts no longer stack. That is FD-036J-02, not a second policy engine. The column values `exclusive` and `combinable` stay.

### Comparison

After `calculateTax`, compare `grandTotalPaise`.

```text
1. Lowest final payable.
2. If payables are equal and one combination is a complimentary primary while the
   otherwise-equivalent combination has no primary, select the complimentary combination.
   This is FD-036J-03. It runs before any technical tie-break.
3. Remaining ties that do not change delivered merchandise:
   higher realized discount,
   then higher promotion.priority,
   then earlier promotion.starts_at,
   then lexicographic promotion id set.
```

Step 3 does not use `created_at`, insert order, or unordered row scan. `starts_at` is the existing effective-window column already used by `selectBestCandidate` in `src/shared/promotions/select.ts`. The id key is a total order so the result does not depend on candidate array position. Step 3 does not call an equal payable amount better, does not offer the customer a choice, and does not randomize. It cannot override step 2.

```text
GENERAL_EQUAL_PAYABLE_TIE = FIT_OWNED_DETERMINISTIC
COMPLIMENTARY_EQUAL_PAYABLE_TIE = PRODUCT_OWNED_COMPLIMENTARY_SELECTED
```

The general tie applies only when the coupon-backed valid combination and a valid non-coupon alternative have the same payable, delivered merchandise is otherwise equivalent, and the complimentary product rule does not apply. Architecture owns that deterministic winner. Product owns the complimentary case.

A complimentary candidate stays identifiable even when the waived merchandise amount is zero. Current `toApplied` drops `realized <= 0`. That drop must not erase the complimentary line identity used by step 2.

Safety stays: a combination whose payable is greater than the baseline is not selected. If existing `calculateTax` makes a complimentary combination strictly more expensive than the no-primary combination, the lower payable wins. The product tie selects the complimentary combination only when the payables are equal. No new tax formula is introduced.

### Explanation output

The quote returns one `CommercialExplanation` projection, section 14. Cart, Checkout Review, and the pre-payment summary render that projection. They do not recompute eligibility.

---

## 7. Stacking / best valid combination

FD-036J-02:

| Rule | Mechanism |
|---|---|
| Max 1 primary merchandise or order Offer | Candidate shape |
| Max 1 delivery incentive | Candidate shape |
| Compatible pair with real monetary benefit | Both members stay on the winning candidate. `COMPATIBLE_STACK_RESULT = BOTH_APPLY` |
| Multiple candidates | Lowest `grandTotalPaise`. `MULTIPLE_CANDIDATE_SELECTION = BEST_VALID_MONETARY_COMBINATION` |
| Two merchandise discounts | Same slot, not paired |
| Multiple delivery incentives | Same slot, not paired |
| BOGO plus another merchandise discount | Both are primary, not paired. The delivery slot may still pair with the selected primary when compatible |
| Complimentary item | Primary slot. No new slot |
| Coupon | Occupies the class of its benefit. No extra slot |
| Standing ₹0 delivery | Section 12. No second saving |

A delivery incentive whose realized amount is 0 is not an applied benefit and is not shown as a saving.

---

## 8. Coupon state

FD-036J-01:

```text
MUTABLE_COUPON_AUTHORITY = carts.manual_coupon_code
CART_ENTRY = POST /api/v1/cart/coupon and POST /api/v1/cart/coupon/remove
CHECKOUT_REVIEW_ENTRY = the same two routes, then existing checkout evaluate
PAYMENT_MUTATION = NONE
SECOND_CHECKOUT_COUPON_COLUMN = NO
```

| Action | Flow |
|---|---|
| Apply | `applyCartCoupon` CAS on cart revision. Unknown code does not write. Known code replaces the previous code. |
| Replace | The same apply. One column, so the new code replaces the old one in the same write. |
| Remove | `removeCartCoupon`. |
| Retry after sign-in | `claimGuestCart` keeps the code. The following `evaluateCart` sends `customerId`. |
| Guest unrestricted | Per-customer cap unset and `first_order_only` false. Missing identity is not a rejection. The coupon enters `eligible`. |
| Identity-required | `CUSTOMER_IDENTITY_REQUIRED`. The code stays on the cart. No other customer's usage is returned. Checkout itself still requires `customer_auth_user_id`; guests reach Checkout Review only after that existing sign-in. |
| Expired | Distinct reason `COUPON_NOT_EFFECTIVE`. Payable result excludes it. |
| Invalid | `COUPON_INVALID` / `CART_COUPON_UNKNOWN`. |
| Inapplicable | Eligibility reason, not collapsed into invalid. |
| Global exhaustion | Distinct reason. Read at evaluation; enforced again under the claim lock. |
| Personal exhaustion | Distinct reason. Requires authenticated identity. |

`buildCheckoutCommercialResult` must not throw `CHECKOUT_COUPON_INELIGIBLE` for `VALID_BUT_NOT_SELECTED` or for an equal-payable outcome. The entered code stays on the cart. When the winning combination does not depend on it, the presentation class is `COUPON_VALID_NOT_SELECTED` only if that winner's payable is strictly lower, and `COUPON_EQUAL_PAYABLE_NOT_SELECTED` when the payables are equal. Invalid, expired, inapplicable, and exhausted codes likewise do not enter the sealed snapshot as applied benefits. The customer remains on Review and can correct the code.

A server failure before the cart revision write leaves the previous code and the previously returned quote on screen. The client does not paint `APPLIED` from its own input.

The sealed `checkout_snapshots.manual_coupon_code` is the applied code, or null when the entered code did not win. It is not a second mutable store. Review reads the live cart code plus the fresh explanation.

---

## 9. Automatic versus entered coupon

There is one candidate list and one winner.

The comparison uses `grandTotalPaise` of complete combinations, including at most one compatible delivery incentive. It does not compare merchandise savings alone. An equal payable amount is not classified as a better total.

```text
coupon combination payable < best valid non-coupon payable
  winner includes the coupon
  presentation class = COUPON_APPLIED
best valid non-coupon payable < coupon combination payable
  winner excludes the coupon
  presentation class = COUPON_VALID_NOT_SELECTED
payables equal, delivered merchandise otherwise equivalent, complimentary tie does not apply
  winner = section 6 step 3
  coupon selected → COUPON_EQUAL_PAYABLE_SELECTED
  coupon not selected → COUPON_EQUAL_PAYABLE_NOT_SELECTED
complimentary equal payable
  winner = complimentary combination (FD-036J-03, section 21)
```

Those class names are experience states for projection. They are not customer sentences. `COUPON_VALID_NOT_SELECTED` is the strictly lower non-coupon outcome. The equal-payable classes must not reuse that "better amount" meaning. LANG-1 projects the class. Architecture does not store the sentence.

Example held by the candidate generator, not by a second total:

- combinable automatic primary ₹80 plus combinable delivery ₹40 stays when an exclusive ₹90 merchandise coupon cannot pair with that delivery incentive
- a combinable ₹90 coupon plus a combinable ₹20 delivery incentive beats an exclusive ₹100 automatic primary

---

## 10. First-order eligibility

```text
FIRST_ORDER_BOOLEAN_ON_CUSTOMER = NO
```

`first_order_only` is a promotion qualifier column, section 24. Guests are ineligible.

### Source of truth

A previous successful direct purchase exists for `customer_auth_user_id` when any of these is true:

```text
EXISTS orders
  JOIN checkouts ON orders.checkout_id = checkouts.id
  WHERE checkouts.customer_auth_user_id = :customer

OR EXISTS payments
  JOIN checkouts ON payments.checkout_id = checkouts.id
  WHERE checkouts.customer_auth_user_id = :customer
    AND payments.status = 'SUCCEEDED'

OR EXISTS checkouts
  WHERE customer_auth_user_id = :customer
    AND status = 'COMPLETED'
```

Order status is not filtered. `CANCELLED` still counts, so a later cancellation does not restore eligibility. `payments.status = 'SUCCEEDED'` still counts after refund because Payment success remains collection truth under D-364. Failed, cancelled, expired, and abandoned payments do not match. Open payments do not match. Checkout statuses other than `COMPLETED` do not match. Direct channel is already the only commerce path these tables serve.

`tryMaterializeOrderAfterPaymentCompletion` runs **outside** the payment transaction (`src/server/payment/order-materialize-hook.ts`). The succeeded-payment arm covers that gap for a captured payment. Zero-payable completion sets `checkouts.status = 'COMPLETED'` inside its transaction and only then calls order materialization (`src/server/payment/operations.ts`). The `COMPLETED` arm covers that gap, including a zero-payable purchase that has no `payments` row. Once the order exists, the order arm matches too, including `payment_provenance_kind = 'NO_PAYMENT_REQUIRED'`. Evaluation and payment binding use this same predicate.

`listOrdersForCustomer` is a customer history projection. It is not the eligibility query, because it is shaped for history paging and must not become a monetary authority by accident. Eligibility uses the predicate above inside the commercial evaluation read and again inside the claim transaction.

### Purchase-level guard

```text
PER_PROMOTION_REDEMPTION_CLAIM = ONE_PER_APPLIED_PROMOTION
FIRST_ORDER_PURCHASE_GUARD = AT_MOST_ONE_PER_LOGICAL_PURCHASE_BINDING
FIRST_ORDER_GUARD_IS_PROMOTION_CLAIM = NO
```

`promotion_redemption_claims` does not store `first_order_guard` and does not carry a customer-unique index over guarded claims. A winning combination of a first-order primary Offer and a compatible first-order delivery incentive writes two ordinary claims and exactly one purchase-level guard.

The guard is a new row in `app.first_order_purchase_guards`, owned by the existing Checkout / Payment commercial boundary. Shape, nullability, and indexes are in section 24. It is not a second Promotion authority.

```text
PAYMENT-BEARING
  winning combination contains one or more first-order-only Offers
  lock customer_auth_users FOR UPDATE
  re-read the predicate
  insert exactly one guard status RESERVED
  insert one ordinary claim per applied Promotion
  both first-order Promotions share that one guard

SUCCESS
  that guard becomes CONSUMED inside applySuccess

DEFINITIVE FAILED / CANCELLED
  that guard becomes RELEASED inside applyDefinitiveNonSuccess

RETRY
  only after the prior attempt is resolved
  the released guard leaves the active unique indexes
  the new attempt inserts one new RESERVED guard
  it does not insert a second active guard for the same payment

ZERO-PAYABLE
  completeZeroPayableCheckout inserts exactly one guard status CONSUMED
  one guard for the logical completion, not one guard per Promotion
```

`RESERVED`, `CONSUMED`, and `RELEASED` match the claim lifecycle words already used by `promotion_redemption_claims`. The guard uses those words for the purchase, not for a Promotion unit.

Active uniqueness:

```text
UNIQUE (customer_auth_user_id)
  WHERE status IN ('RESERVED', 'CONSUMED')

UNIQUE (payment_id)
  WHERE payment_id IS NOT NULL
    AND status IN ('RESERVED', 'CONSUMED')

UNIQUE (checkout_snapshot_id)
  WHERE payment_id IS NULL
```

Two concurrent first-order bindings for the same customer cannot both commit an active guard. The second insert fails, that transaction rolls back, and that attempt is not reported as bound. Application pre-checks and unordered application order are not the guarantee. `RELEASED` rows leave the customer and payment indexes, so a later resolved retry can reserve again. A consumed guard stays active in the customer index, which matches one successful first-order entitlement.

First-order serialization uses the customer-before-cart order in section 10A. It does not use `cart → checkout → customer_auth_users`.

`startPayment`, `retryPayment`, and `completeZeroPayableCheckout` binding transactions lock `customer_auth_users` before the cart and the checkout, then lock promotions and coupons, then insert claims and the one guard. `applySuccess` locks `customer_auth_users` before checkout, payment, attempt, claims, and the guard. It does not take the promotion row locks. An ordinary purchase with no first-order Offer still takes that customer lock before `payments.status = 'SUCCEEDED'`, so a concurrent first-order binding sees the committed success. That ordinary purchase does not insert a guard. `materializeOrderForCompletedCheckout` is not the serialization point and does not lock `customer_auth_users`.

Re-read the predicate before inserting the guard, ignoring this attempt's own uncommitted payment. If a prior success already exists, do not insert the guard, do not insert the first-order claims, and do not return a bound payment.

An already committed `RESERVED` guard belongs to a payment-bound snapshot. ADR-008 keeps that snapshot as commercial truth. A later successful ordinary purchase on another checkout does not rewrite it, and it does not get blocked merely because the first-order payment is still pending. Blocking that ordinary purchase, or removing the already-bound Offer, would be new customer-facing behaviour. The product assigns the query and the concurrency mechanism to Fit and does not ask for either of those outcomes. Failed or cancelled payment releases the guard and does not count as a successful purchase. A `RESERVED` guard is not itself a previous successful Order.

### Revalidation before payment binding

`prepareCheckoutForPayment` re-runs the quote, including the first-order predicate, and refuses `CHECKOUT_REPRICED` when the snapshot still contains a first-order Offer the predicate now rejects. The claim transaction repeats the check under the locks in section 10A. Payment does not bind the stale snapshot.

---

## 10A. Canonical customer lock order

Current `lockCustomerAuthUserForUpdate` callers, read from source:

| Caller | Locks actually taken | Checkout held first |
|---|---|---|
| `claimGuestCart` | `customer_auth_users`, then the guest cart | No |
| `reconcileGuestCartWithCustomer` | `customer_auth_users`, then both carts in ascending id order | No |
| Customer cart create/add in `src/server/cart/operations.ts` | `customer_auth_users`, then that customer's cart | No |

Those paths already use customer before cart. Candidate 2's `cart → checkout → customer_auth_users` order on payment binding can deadlock against `reconcileGuestCartWithCustomer`: one transaction holds the cart and waits for the customer, while the other holds the customer and waits for the cart.

```text
CANONICAL_LOCK_ORDER =
  CUSTOMER_AUTH_USER
  → CART / CARTS
  → CHECKOUT
  → PAYMENT
  → ATTEMPT
  → PROMOTIONS / COUPONS
  → CLAIMS / FIRST_ORDER_GUARD
  → MEASUREMENT HEAD, when that transaction also allocates a sequence

TRANSACTION_THAT_WILL_LOCK_CUSTOMER
  MUST_NOT_ALREADY_HOLD_CART_OR_CHECKOUT
```

A transaction locks only the rows it mutates or serializes. `reconcileGuestCartWithCustomer` keeps customer then carts. It does not start locking checkouts.

`prepareCheckoutForPayment` stays its own transaction. It locks the checkout, commits, and releases that lock before `startPayment`, `retryPayment`, or `completeZeroPayableCheckout` opens the binding transaction. Locks are not carried across those transactions.

Binding transactions, when first-order serialization requires the customer lock:

| Transaction | Order |
|---|---|
| `startPayment` binding | Session `customer_auth_users`, then cart, then checkout, then payment and attempt, then promotion and coupon locks, then claims and the one guard |
| `retryPayment` binding | Same. The owning customer is the authenticated session, revalidated against the checkout after the customer lock |
| `completeZeroPayableCheckout` binding | `customer_auth_users`, then cart, then checkout, then promotion and coupon cap locks, then claims and the one consumed guard, then checkout `COMPLETED` |

The authenticated customer id is known from the session before any cart or checkout lock. A no-lock peek may discover the cart id. The customer row is locked before that cart row is locked. After the locks, the transaction revalidates checkout owner, revision, and snapshot linkage before mutation.

`applySuccess`, including an ordinary purchase that inserts no guard:

1. Pre-read Payment, snapshot, and Checkout linkage with no locks, and read `checkouts.customer_auth_user_id` from that linkage.
2. Lock that `customer_auth_users` row.
3. Lock checkout, then payment, then attempt, then claims and the guard when one exists.
4. Revalidate the linkage. A changed checkout owner, snapshot, or payment id rolls the transaction back.
5. Only then set `payments.status = 'SUCCEEDED'`.

The customer id comes from the stored checkout row, not from provider payload identity and not from a client field. No provider I/O runs under these locks. This replaces `lockCheckoutPaymentAttempt`'s current `Checkout → Payment → Attempt → claims` order whenever that transaction also locks the customer. It does not lock the cart. It does not lock the customer after the checkout.

`applyDefinitiveNonSuccess` releases a `RESERVED` guard. It uses the same customer-before-checkout order when it updates that guard, so release cannot wait on a customer row while a binding transaction holds the checkout and waits for the customer.

`materializeOrderForCompletedCheckout` keeps its current cart-then-checkout-then-payment locks. It does not call `lockCustomerAuthUserForUpdate`. Adding the completion event locks the measurement head after those commerce locks. It does not acquire the customer row, so it does not form a reverse cycle with reconciliation.

Presentation acknowledgement locks only the measurement head. It does not lock `customer_auth_users`, carts, or checkouts. Ownership is a re-read of the checkout row compared with the authenticated session.

Measurement-head initialization in section 27A does not change that order. A transaction that already holds customer, cart, checkout, payment, attempt, promotion, or claim locks may lock the head only after those rows. No path locks the measurement head and then acquires the customer or the cart. Pay's `ensureReviewPresented` runs inside the payment-progression transaction after the commerce locks that transaction already needs, and it keeps the head lock until that transaction commits. The acknowledgement transaction never takes those commerce locks, so it cannot wait on the cart while Pay waits on the head. The two transactions serialize on the head row alone.

```text
MEASUREMENT_HEAD_BEFORE_CUSTOMER_OR_CART = NO
MEASUREMENT_HEAD_LOCK_CYCLE = NONE
```

```text
REVERSE_CUSTOMER_CART_CYCLE = NONE
PAYMENT_BINDING_BEFORE_CUSTOMER = NO
APPLY_SUCCESS_CHECKOUT_BEFORE_CUSTOMER = NO
```

Concurrency proof, not executed by this candidate: a payment binding transaction and `reconcileGuestCartWithCustomer` for the same customer run together. Both take `customer_auth_users` before any cart they lock. The expected result is ordinary serialization or the existing revision conflict. It is not a PostgreSQL deadlock.

---

## 11. Caps and redemption

Extend `enforceCouponCapacity` into offer-capacity enforcement in the same functions. Do not add a second claim table. The purchase-level first-order guard in section 10 is not a claim table and does not count capacity.

| Cap | Store | Count |
|---|---|---|
| Existing coupon global limit | `promotion_coupons.maximum_redemptions` | Same claim rows |
| Existing coupon per-customer limit | `promotion_coupons.maximum_redemptions_per_customer` | Same claim rows, joined through checkout customer |
| Global Offer cap, including automatic | new `promotions.maximum_redemptions` | Same claim rows |
| Per-customer Offer cap, including automatic | new `promotions.maximum_redemptions_per_customer` | Same claim rows |

If both a coupon limit and a promotion limit are set, both must pass. They count one claim, so they do not double-consume. Per-customer limits without `customerId` return `CUSTOMER_IDENTITY_REQUIRED` and do not reveal a count.

Consumption boundary:

```text
cart apply                 does not insert a claim
evaluation                 may read counts for explanation only
payment initiation         RESERVED, under promotion row locks, after the capacity check
payment SUCCEEDED          RESERVED → CONSUMED in applySuccess
FAILED / CANCELLED         RESERVED → RELEASED
zero-payable completion    CONSUMED directly, same capacity check
definitive FAILED/CANCELLED  releaseClaimsForAttempt inside applyDefinitiveNonSuccess
unresolved attempt         stays RESERVED. cancelPaymentAggregate refuses an unresolved attempt, so leaving the page does not release the unit
retry of the same payment  only after the prior attempt is resolved; failed claims are RELEASED; the new attempt inserts one new RESERVED set
already SUCCEEDED replay   applySuccess returns before a second consume
```

Last-available race: the loser blocks on `FOR UPDATE`, recounts, and the payment transaction throws `PAYMENT_PROMOTION_CAPACITY_UNAVAILABLE` or hits the unique index. That transaction rolls back. No payment row remains. It does **not** invalidate the checkout: `prepareCheckoutForPayment` already committed in an earlier transaction (`startPayment` calls it before the payment transaction). The loser is still `READY_FOR_PAYMENT` on the snapshot that included the Offer. Recovery is the next prepare or evaluate, which now counts the winner's `RESERVED` claim, drops the exhausted Offer, and uses the existing mismatch path to return the checkout to Review. Purchased snapshot rows are not updated.

`promotion_redemption_claims_attempt_promotion_uidx` remains the attempt idempotency key for claims. A retry does not keep the failed attempt's units because those rows are `RELEASED`. The first-order guard follows the same resolved-attempt rule and remains one row per binding, not one row per Promotion.

### First-order guard proof

| Case | Claims | Purchase guard |
|---|---|---|
| One first-order Offer applied | 1 | 1 |
| First-order primary plus compatible first-order delivery | 2 | 1 |
| No first-order Offer, even when other Promotions apply | one per applied Promotion | 0 |
| Definitive failed or cancelled attempt | those claims `RELEASED` | that guard `RELEASED` |
| Retry after that release | one new claim set | one new `RESERVED` guard, not two active |
| Two concurrent first-order bindings, same customer | the loser rolls back | one active guard commits |

---

## 12. Fulfilment eligibility

```text
CANONICAL_CONTEXT = checkouts.fulfilment_mode
  + checkouts.fulfilment_timing
  + scheduled_window_start_at / scheduled_window_end_at when SCHEDULED
SUPPLIED_BY = buildCheckoutCommercialResult and evaluateCart when that checkout row exists
NEW_SCHEDULE_DOMAIN = NO
```

Qualifier columns, section 24, restrict `DELIVERY` / `PICKUP` and `ASAP` / `SCHEDULED`. Null means unrestricted. `setCheckoutFulfilment` and `setCheckoutFulfilmentTiming` already bump checkout revision; the following evaluate rebuilds the quote. Scheduled eligibility uses the window `sealEligibleScheduledWindow` already proved. This candidate does not reinterpret IMP-036I.

A `DELIVERY` Offer does not apply on `PICKUP`, and the reverse. A delivery incentive is a `DELIVERY` context benefit: Pickup has no delivery charge to waive.

---

## 13. Temporary free delivery

```text
STANDING_FREE_DELIVERY = resolveCustomerDeliveryCharge
TEMPORARY_FREE_DELIVERY = promotion benefit delivery_fee_waiver
DELIVERY_CALCULATORS = 1
```

The quote contains one delivery charge component. The waiver's realized discount is that component's amount. When the standing resolver already returned 0, realized discount is 0, the waiver is not applied, and the explanation has no delivery-saving line. No credit row is created. `STANDING_FREE_DELIVERY_DUPLICATE_SAVING = PROHIBITED`.

`buildDirectPricingQuote` keeps the standing amount in `chargeLines` and `chargesPaise`. `commitReadySnapshot` seals that gross amount on `checkout_snapshot_charges`. The waiver does not rewrite those fields. The only reduction is the promotion allocation, which `grandTotalPaise` subtracts once through the existing discount formula.

```text
SEALED_GROSS_DELIVERY_CHARGE = standing amount
DELIVERY_SAVING = allocation against that component, and only when > 0
DISPLAYED_NET = gross - that allocation
SECOND_SUBTRACTION = NO
```

A standing 0 has allocation 0, displayed net 0, and no delivery-saving line.

---

## 14. Threshold progress

`evaluatePromotions` returns progress for an Offer that fails only the minimum it actually has, and that otherwise matches scope, window, identity, mode, and timing:

```text
remainingAmountPaise = minimum_qualifying_amount_paise - qualifying amount
```

The phrase "Add ₹X more to unlock…" is UI copy of `remainingAmountPaise`. The UI does not subtract prices itself. If the minimum is quantity-only, the projection returns remaining quantity and does not invent rupees. If the context needed to judge the Offer is unknown, the projection omits progress.

The same projection is rebuilt on cart mutation, fulfilment change, coupon mutation, sign-in, scheduled-slot change, and `prepareCheckoutForPayment` mismatch. Stale client copy is replaced by the new response.

---

## 15. Explainability

One projection on the quote and, after binding, derived from sealed snapshot rows:

| Field | Source |
|---|---|
| Offer title | Sealed `display_name` / live `promotions.display_name` before binding |
| Identity | `promotion_id`, coupon id when applied, promotion revision once sealed |
| Merchandise or order saving | Sum of primary-slot allocations that changed payable merchandise |
| Delivery saving | Delivery-slot realized discount, included only when `> 0` |
| Total saved | Sum of those components |
| Final payable | `grandTotalPaise` |
| Coupon class | `COUPON_APPLIED`, `COUPON_VALID_NOT_SELECTED`, `COUPON_EQUAL_PAYABLE_SELECTED`, or `COUPON_EQUAL_PAYABLE_NOT_SELECTED`. Equal payable is not a better total and is not a fake discount |
| Threshold | `remainingAmountPaise` when present |
| Failures | Distinct codes: invalid, expired, inapplicable, globally exhausted, personal cap, identity required, complimentary unavailable |

Copy strings are not domain authority. Customer responses do not include other customers' order ids, usage counts, or eligibility internals.

Order detail reads sealed effects, sealed lines, and `moneySummaryFromSnapshot`. It does not call `evaluatePromotions`.

### Presentation authority

Architecture returns the facts Experience projects. It does not own the sentences.

| Experience need | Architectural fact |
|---|---|
| Threshold gap | `remainingAmountPaise` or remaining quantity from section 14. The client does not subtract eligibility money. |
| One commercial result | One quote `CommercialExplanation`: merchandise or order saving, delivery saving, total saved, final payable. Cart, Checkout Review, and the read-only Payment summary render that one result. |
| Shared coupon state | `carts.manual_coupon_code` only. Cart and Checkout Review both call the existing coupon routes. |
| Payment | `PaymentPanel` reads the sealed explanation. It does not accept a coupon mutation. |
| Complimentary line | Snapshot or projection carries catalog variant identity, quantity 1, and zero extra merchandise charge. The included meaning is a projection of those facts. |
| Coarse failures | The distinct reason classes in section 8 and section 16. Customer text is a LANG-1 projection of the class, not the raw code. |
| Stale pre-payment recomputation | `prepareCheckoutForPayment` mismatch returns the checkout to Review. Payment is not offered on the stale total. |
| Purchased savings | Insert-only snapshot effects and lines. Later Promotion edits do not rewrite them. |
| Complimentary equal payable | Section 21. Product selects the complimentary combination. |
| General equal payable | Section 6 step 3. Fit selects one deterministic winner. Experience can describe that winner without calling the tie better. |

---

## 16. Checkout revalidation and snapshot

`prepareCheckoutForPayment` stays the pre-binding gate. A fresh quote must match the active snapshot or the checkout returns to `DRAFT` through `invalidateReadyToDraft`.

Revalidated causes:

| Change | Outcome |
|---|---|
| Promotion revision / retirement / window | Offer drops out of `eligible`. Snapshot mismatch. Review recovery. |
| Coupon status | Mismatch when the fresh quote's applied benefits or payable change. A status change that leaves the selected combination identical does not, by itself, invalidate a snapshot that only seals the applied result. |
| Cap exhaustion | Capacity read fails the Offer. Mismatch. |
| Identity change | `customerId` on the quote changes. First-order and personal caps rerun. |
| Mode or schedule change | Existing fulfilment commands bump revision. Quote inputs change. |
| Complimentary unavailable | Section 18. Offer leaves the result. Best remaining combination is sealed only after the customer is back on Review. |

Payment initiation still requires the active snapshot. It does not bind a stale one. `prepareCheckoutForPayment` remains a separate transaction from payment binding. It releases its checkout lock before the binding transaction in section 10A takes `customer_auth_users`.

After `SUCCEEDED` or zero-payable completion, `orders.checkout_snapshot_id` points at the insert-only snapshot. Later Offer edits, retirement, coupon expiry, price-book changes, and tariff changes do not update that snapshot. `source_cart_line_id` nullability changes in section 24 do not change snapshot ownership.

Snapshot extensions are additional sealed columns and an allowed complimentary line origin. `commitReadySnapshot` remains insert-only.

---

## 17. Complimentary item

FD-036J-03 is in V1. It is not deferred.

### Operator binding

The operator binds one `catalog_variants.id` and its `catalog_products.id` on the promotion benefit. Menu entries are not the binding. D-368 keeps Menu as a projection. There is no gift-product table.

Activation, inside `activatePromotion` and the existing revision CAS, allows the benefit only when all of these hold:

- exactly one variant
- `product_kind = standard` (a bundle is a customer choice)
- no active `catalog_variant_modifier_groups` row with `min_total_quantity > 0`
- the granted line has zero modifier selections, so a positive `price_delta_paise` option is not selected and a `default_quantity` is not copied (D-369)
- the variant is an effective published catalog variant under the same publication read checkout merchandise validation already uses

Otherwise activation is rejected and the promotion stays draft.

### Customer line

The quote adds one component whose price is `resolveOutletVariantPrice`. The primary-slot allocation sets that component's merchandise amount to zero. The line has no modifier rows. `calculateTax` then runs as it does for every other component.

Cart storage does not gain a customer-intent line. `cart_lines` remain what the customer added. Cart and Checkout Review render the line from the explanation projection.

The snapshot seals it as a `checkout_snapshot_lines` row with `line_origin = complimentary_offer`, `source_cart_line_id` null, quantity 1, modifier and bundle amounts 0, and `line_promotion_discount_paise` equal to the resolved merchandise base.

Current `checkout_snapshot_promotion_effects.line_id` is **not** a snapshot-line foreign key. `extractLineId` copies the cart-line UUID out of a component id (`base|mod|bundle|bundle-mod:<uuid>`). `applied_promotion` effects store `lineId: null`. Snapshot lines receive new ids at insert. Sealing must set a new `snapshot_line_id` after those ids exist, including the complimentary line. Existing `line_id` values stay cart-line provenance and are not reinterpreted as snapshot ownership and are not retrofitted into a foreign key. Effect kinds stay `applied_promotion` and `monetary_allocation`. The effect also seals `promotion_revision`.

```text
EFFECT_SNAPSHOT_ID = REFERENCED_LINE_SNAPSHOT_ID
```

`checkout_snapshot_lines` gains a candidate key `(id, snapshot_id)`, the same ownership pattern as `checkout_snapshots_id_checkout_id_uidx`. `checkout_snapshot_promotion_effects` gains a composite foreign key `(snapshot_line_id, snapshot_id)` → `checkout_snapshot_lines (id, snapshot_id)`. `snapshot_line_id` stays nullable. Under PostgreSQL `MATCH SIMPLE`, a null `snapshot_line_id` does not require a line. When it is populated, the referenced line's `snapshot_id` must equal the effect's `snapshot_id`. A line from snapshot B cannot satisfy an effect on snapshot A. Writer correctness is not the enforcement. Complimentary association and monetary allocation association both use this foreign key. Historical immutable snapshot rows are not rewritten.

The line adds no merchandise charge. It occupies the primary slot and may pair with one compatible delivery incentive.

### Purchased truth

The order points at that snapshot. Later retirement does not remove the line.

---

## 18. Complimentary availability

Before the complimentary promotion can be eligible, call `resolveOutletVariantAvailability` for the bound variant at the checkout outlet. This is the same availability authority `collectAssortmentAvailabilityProblems` uses. There is no second availability store.

If the variant is unavailable:

- do not substitute a product, variant, or modifier
- remove that promotion from `eligible`
- run `selectBestCandidate` on what remains
- explanation reason `COMPLIMENTARY_ITEM_UNAVAILABLE`
- `prepareCheckoutForPayment` sees a snapshot mismatch and returns to Review
- Payment is not offered on the stale line

---

## 19. Single active complimentary invariant

```text
COMPLIMENTARY_ITEM_SINGLE_ACTIVE = YES
SCOPE = one ACTIVE complimentary promotion per brand_id
```

Promotions are brand-owned and a cart evaluates one brand. The index matches that aggregate. It is not a customer-facing winner rule.

Mechanism: partial unique index in section 24, plus the existing `activatePromotion` transaction.

```text
SEQUENTIAL = the UPDATE that would create a second active row fails the index, or the command's pre-check rejects it. The first ACTIVE row remains.
CONCURRENT = both transactions update status to active. One commit succeeds. The other unique violation rolls back the status change and the promotion.activated audit insert.
FALSE_SUCCESS = NO. The failed transaction does not return activation success.
WHO_WINS = FIT_OWNED. The committed transaction is authoritative. The product does not name an operator or a customer gift as the winner.
```

A boolean `promotions.complimentary_item` is written in the same transaction as `setPromotionBenefit` and is the index predicate. Benefit type remains on `promotion_benefits`. The flag is not a second benefit authority; the activation transaction refuses `status = active` when the flag and the benefit type disagree.

---

## 20. Competing complimentary fallback

If evaluation nevertheless loads more than one complimentary promotion that would qualify:

```text
COMPLIMENTARY_ITEM_COMPETING_OFFERS = NONE_CHOSEN
```

Every complimentary primary is removed before candidate pairing. Non-complimentary combinations continue through the same `selectBestCandidate`. Selection does not use id, `created_at`, priority, or coupon presence to pick a gift.

This fallback does not replace the unique index. The index is the authoring invariant (`ACTIVE_COUNT <= 1`). `NONE_CHOSEN` is the customer evaluation safeguard when inconsistent rows still appear.

---

## 21. Complimentary equal-payable tie

When a valid complimentary combination and the otherwise-equivalent combination with no primary have the same `grandTotalPaise`, `selectBestCandidate` returns the complimentary combination.

```text
COMPLIMENTARY_ITEM_EQUAL_PAYABLE_TIE = COMPLIMENTARY_COMBINATION_SELECTED
```

That comparison is product behaviour. Step 3 in section 6 must not override it.

---

## 22. Operator authoring

Reuse `/workforce/admin/commercial/` and `PromotionsEditor`. No second promotion admin product.

| Lifecycle | Existing command | IMP-036J extension |
|---|---|---|
| Draft / configuration | `createPromotionDraft`, `updatePromotionDraft`, `setPromotionBenefit`, `setPromotionTargets` | New qualifier and benefit fields on those payloads |
| Validation | `activatePromotion` checks | Class, complimentary shape, cap shape |
| Activation | `activatePromotion` + `expectedPromotionRevision` | Unique index for complimentary |
| Deactivation / retirement | `retirePromotion` | Unchanged effect on purchased orders |
| Revision conflict | `PROMOTION_STALE_REVISION` | Same 409 posture the editor already shows |
| Audit | `promotion_audit_events` | Same actions. Complimentary flag and benefit type travel in existing metadata rules, without storing a raw coupon code |
| Coupon lifecycle | `activateCoupon`, `disableCoupon`, `enableCoupon`, `retireCoupon` + `expectedCouponRevision` | Unchanged states |
| Redemption visibility | **NOT_FOUND** as an operator read | Extend `inspectBrandPromotion` with redeemed / reserved / released counts. No customer identifiers. |

BOGO remains a benefit the domain already stores. The editor surfaces it with the new benefit types so US-036J-012 can activate the V1 set on this workspace.

Consequence preview stays `previewPromotionConsequence` / `previewCouponConsequence` and continues to return the expected revision. It is not a second commercial authority.

---

## 23. Permissions / auth

No new role. No new permission key.

| Action | Existing key |
|---|---|
| Read promotions, explanation support, redemption counts | `promotions.read` |
| Draft promotion fields, benefit, targets | `promotions.manage` |
| Activate and retire | `promotions.activate` |
| Audit read | `promotions.audit.read` |
| Coupon draft and lifecycle | `coupons.manage` |
| Coupon read | `coupons.read` |

Scope remains the brand-scoped checks in `src/server/promotions/authorize-promotions.ts`. Client-supplied role or scope is not authority. Cross-scope calls stay denied.

Customer routes stay on the existing customer session or guest cart credential. They do not accept a workforce principal.

---

## 24. Schema impact

```text
SCHEMA_CHANGE_REQUIRED = YES
MIGRATION_DIRECTION = forward-only
MIGRATIONS_WRITTEN_BY_THIS_CANDIDATE = NO
```

Owner of every new column is the existing aggregate named in the row. No new service schema.

| Change | Why current schema is insufficient | Owner | Constraints | Snapshot / concurrency |
|---|---|---|---|---|
| `promotions.first_order_only boolean not null default false` | Eligibility has no such fact | Promotion | Check boolean | Read at evaluation and at claim time. CAS already bumps `revision` on draft update. |
| `promotions.eligible_fulfilment_modes text[] null` | Mode is not stored on the promotion | Promotion | Null means all. Non-null subset of `DELIVERY`, `PICKUP`, at least one | Same revision CAS |
| `promotions.eligible_fulfilment_timings text[] null` | Timing is not stored | Promotion | Null means all. Non-null subset of `ASAP`, `SCHEDULED` | Same |
| `promotions.maximum_redemptions integer null` | Automatic global cap has nowhere to live. Coupon columns do not cover a coupon-less Offer | Promotion | Null or `> 0` | Enforced under existing promotion `FOR UPDATE` |
| `promotions.maximum_redemptions_per_customer integer null` | Same for per-customer Offer caps | Promotion | Null or `> 0` | Same |
| `promotions.complimentary_item boolean not null default false` | A partial unique index cannot see `promotion_benefits` | Promotion | Must match benefit type at activation | Index predicate |
| Partial unique index `promotions_one_active_complimentary_per_brand_uidx` on `(brand_id)` where `status = 'active'` and `complimentary_item` | Application locks alone can report two successes | Promotion | One active complimentary row per brand | Concurrent activation loses by unique violation and rolls back |
| `promotion_benefits` type check adds `delivery_fee_waiver` and `complimentary_item` | Checked list is only the three current types | Promotion benefit | Existing one-row unique on `promotion_id` stays | Draft CAS via promotion revision |
| `promotion_benefits.complimentary_product_id` and `complimentary_variant_id` uuid null | No place to bind the operator item | Promotion benefit | Both null unless type is `complimentary_item`, then both not null. FK to `catalog_products` and `catalog_variants` `ON DELETE RESTRICT` | Sealed later onto the snapshot line, so catalog retirement does not rewrite history |
| Shape checks for the new types | Percent, fixed, and BOGO columns must stay empty on waiver and complimentary rows | Promotion benefit | Extend the style of `promotion_benefits_bogo_shape_check` | — |
| `app.first_order_purchase_guards` | A flag on each claim cannot represent one guard shared by two applied first-order Offers | Checkout / Payment boundary | See the guard table below. Not a column on `promotion_redemption_claims` | One active guard per logical binding |
| `checkout_snapshot_lines.source_cart_line_id` nullable | Column is `notNull`, so a non-cart complimentary line cannot be sealed | Checkout Snapshot | Existing cart lines remain not null | Insert-only, same as today |
| `checkout_snapshot_lines.line_origin text not null default 'cart'` | Need to tell a customer line from a granted line | Checkout Snapshot | Check `cart` requires `source_cart_line_id`. Check `complimentary_offer` requires null source, quantity 1, zero modifier and bundle amounts | Purchased line identity |
| `checkout_snapshot_promotion_effects.promotion_revision bigint null` | Effects store promotion id and display name, not the revision that was applied | Checkout Snapshot | New seals write the active revision. Historical rows stay null | Immutable after insert |
| `checkout_snapshot_lines` candidate key `(id, snapshot_id)` | A line primary key alone does not encode which snapshot owns the line | Checkout Snapshot | Unique index `checkout_snapshot_lines_id_snapshot_uidx` on `(id, snapshot_id)`. `id` remains the primary key | Immutable after insert |
| `checkout_snapshot_promotion_effects.snapshot_line_id uuid null` | Current `line_id` is cart-line provenance and has no snapshot-line foreign key | Checkout Snapshot | Nullable. Composite FK `checkout_snapshot_promotion_effects_line_ownership_fk` `(snapshot_line_id, snapshot_id)` → `checkout_snapshot_lines (id, snapshot_id)`. `MATCH SIMPLE`: null `snapshot_line_id` is not a line reference. A populated value must name a line of this effect's snapshot | Immutable after insert. `line_id` is unchanged and is not this foreign key |

Coupon limit columns stay. Claim status values stay. Promotion and coupon lifecycles stay. Claims do not gain `first_order_guard` or a customer-unique active-claim index.

No customer `first_order` column. No gift catalog table. No campaign table. No second snapshot header.

### First-order purchase guard

Table `app.first_order_purchase_guards`. Owner: existing Checkout / Payment commercial boundary, written only inside `customer-commerce`. No new service.

| Column | Null | Constraints | Mutability | Privacy |
|---|---|---|---|---|
| `id` uuid | not null | Primary key | Immutable | Not PII |
| `customer_auth_user_id` text | not null | FK `customer_auth_users` `ON DELETE RESTRICT` | Immutable | Eligibility identity for the guard. Not a measurement join |
| `checkout_id` uuid | not null | FK `checkouts` `ON DELETE RESTRICT` | Immutable | Commerce row, not PII |
| `checkout_snapshot_id` uuid | not null | FK `checkout_snapshots` `ON DELETE RESTRICT` | Immutable | The bound snapshot |
| `payment_id` uuid | null | Pair check with `payment_attempt_id`, same shape as claims | Immutable | Null on zero-payable |
| `payment_attempt_id` uuid | null | Same pair check. Unique when not null | Immutable | The attempt binding |
| `status` text | not null | `RESERVED` \| `CONSUMED` \| `RELEASED` | Mutable across that lifecycle only | Not PII |
| `created_at` timestamptz | not null | — | Immutable | — |
| `consumed_at` timestamptz | null | Set only when `CONSUMED` | Written once | — |
| `released_at` timestamptz | null | Set only when `RELEASED` | Written once | — |

Timestamp checks match the existing claim checks: `RESERVED` has both timestamps null, `CONSUMED` has `consumed_at` and not `released_at`, `RELEASED` has `released_at` and not `consumed_at`. Zero-payable rows are inserted as `CONSUMED`.

Write boundary: the payment-initiation transaction inserts `RESERVED`; `applySuccess` moves it to `CONSUMED`; `applyDefinitiveNonSuccess` moves `RESERVED` to `RELEASED`; zero-payable completion inserts `CONSUMED`. No other command writes the table.

Concurrency: the customer partial unique index is the serialization guarantee, taken after `customer_auth_users FOR UPDATE`. Two active rows for one customer cannot commit. Two active rows for one `payment_id` cannot commit. One zero-payable snapshot has one guard. A `RELEASED` row is outside the active indexes.

Purpose: one first-order entitlement for one logical purchase binding, shared by every first-order Offer in that binding.

### Journey key and measurement rows

`checkouts.id` is not `CHECKOUT_JOURNEY_KEY`. Section 27A proves why. The representation is an opaque uuid stored on the checkout and copied onto successor checkout rows of the same unpaid attempt.

| Change | Owner | Purpose | Null | Constraints | Write | Concurrency | Mutability | Privacy |
|---|---|---|---|---|---|---|---|---|
| `checkouts.checkout_journey_key` uuid | Checkout | Opaque journey key for one unpaid attempt | Null on historical rows that have not been adopted. Not null on every checkout `startCheckout` inserts after this capability, and not null once adoption assigns it | No FK to a customer. Not unique by itself: successor checkouts of one attempt share one value | `insertDraftCheckout` mints or copies. Adoption in section 27A may set a null key once. No later rewrite | Copied inside the same `startCheckout` transaction under section 27A | Immutable once non-null | Not PII. Not a customer or guest identifier |
| `checkouts.cart_checkout_ordinal` bigint | Checkout | Strict causal creation order among Checkout rows for one Cart. Not `AUTHORITATIVE_JOURNEY_SEQUENCE`, not `checkouts.revision`, and not a customer-facing attempt number | Null only for historical rows that predate this column and have not been adopted. Not null on every checkout created or adopted after activation | Check `> 0` when non-null. Unique index `checkouts_cart_checkout_ordinal_uidx` on `(cart_id, cart_checkout_ordinal)` where `cart_checkout_ordinal` is not null. PostgreSQL unique indexes allow many nulls, so historical rows do not collide | Assigned once under the Cart lock during `insertDraftCheckout` or during the adoption write in section 27A | The Cart lock serializes allocation for that Cart. The unique index is the backstop | Immutable once non-null. Gaps are harmless and are not ordered by filling them | Not PII. Not returned on a customer or operator API |
| `app.checkout_review_evaluation_receipts` | Same measurement projection | Immutable server record of one evaluation so a later acknowledgement can name what was shown | — | See the receipt table below | Inserted by `evaluateCheckout` when the authoritative result is new. A repeated evaluation of the same result returns the existing id | No journey sequence. Not a denominator row | Immutable. No update and no delete in application code | No customer id. No raw coupon text. No customer-facing copy |
| `app.checkout_journey_measurement_heads` | Same projection | Allocates `AUTHORITATIVE_JOURNEY_SEQUENCE` and records closure | — | `journey_key` uuid primary key. `next_sequence` bigint not null, check `> 0`. `created_at` timestamptz not null. `closed_at` timestamptz null | Conflict-safe insert in section 27A, then `SELECT … FOR UPDATE`. `next_sequence` changes only while that row is locked. `closed_at` is set only in the Order-materialization transaction that inserts `SUCCESSFUL_DIRECT_ORDER_COMPLETION` | `INSERT … ON CONFLICT DO NOTHING` then the row lock. The first event and later events serialize on that row. A missing head is not initialized by `SELECT … FOR UPDATE` alone | `next_sequence` increments only under the row lock. `closed_at` write-once. No customer column. Payment `SUCCEEDED` does not set `closed_at`. Payment-driven `EXPIRED` does not set `closed_at` | Journey key is not PII |
| `app.checkout_journey_measurement_events` | Same projection | Append-only authoritative measurement facts | — | See the event table below | Insert only in the transaction that establishes that fact. A receipt insert is not an event | Sequence comes from the locked head only after the event-specific re-read returns no row and the new fact passes the closed-head check. Unique `(journey_key, journey_sequence)`. Partial unique indexes below | Immutable after insert. No update and no delete in application code. The locked re-read of this event's idempotency identity precedes any closed-head rejection. An existing row is returned and allocates nothing, including when `closed_at` is set. A new fact on a closed head is rejected and allocates no sequence | No customer id. No raw coupon text |

`cart_checkout_ordinal` is a Checkout column for this capability's predecessor selection. It is not a global checkout-ordering service and it is not exposed to customers.

```text
checkouts.cart_checkout_ordinal bigint
OWNER = Checkout
PURPOSE = STRICT_CAUSAL_CREATION_ORDER_AMONG_CHECKOUT_ROWS_FOR_ONE_CART
SCOPE = ONE_CART
ORDER = STRICT_MONOTONIC_CHECKOUT_CREATION_ORDER
CUSTOMER_FACING = NO
PII = NO
MEASUREMENT_JOURNEY_SEQUENCE = NO
CHECKOUT_REVISION = NO
POSITIVE_WHEN_NON_NULL = YES
UNIQUE (cart_id, cart_checkout_ordinal) WHERE cart_checkout_ordinal IS NOT NULL
WRITE_BOUNDARY = ASSIGNED_ONCE_UNDER_CART_LOCK
MUTABILITY = IMMUTABLE_ONCE_NON_NULL
```

```text
checkout_journey_measurement_heads
PRIMARY KEY = journey_key
INITIALIZATION = INSERT ON CONFLICT DO NOTHING
LOCK_AFTER_INITIALIZATION = SELECT FOR UPDATE
FIRST_SEQUENCE = 1
NEXT_SEQUENCE_MUTATION = ONLY_WHILE_HEAD_ROW_LOCKED
```

Section 27A is the one append procedure. Head creation there is safe when Review acknowledgement and Pay's fallback both run before any head row exists.

Event columns:

| Column | Null | Role |
|---|---|---|
| `id` uuid primary key | not null | Row identity. Not the journey key |
| `journey_key` uuid | not null | FK to the head. The measurement join |
| `journey_sequence` bigint | not null | Unique with `journey_key`. Check `> 0`. Strict total order |
| `event_kind` text | not null | Check: `CHECKOUT_REVIEW_PRESENTED`, `COMMERCIAL_STATE_CHANGE`, `REVIEW_TO_PAYMENT_PROGRESSION`, `PAYMENT_ATTEMPT`, `SUCCESSFUL_DIRECT_ORDER_COMPLETION`. `AUTHORITATIVE_REVIEW_COMMERCIAL_RESULT` is not an event kind |
| `occurred_at` timestamptz | not null | Authoritative occurrence time from the command clock in that transaction. Not ingest time. For completion, the Order-materialization transaction clock |
| `checkout_id` uuid | null | FK `checkouts`. Commerce pointer so successor checkout rows stay traceable. Not the metric join |
| `checkout_snapshot_id` uuid | null | Sealed commercial result when one exists |
| `review_evaluation_receipt_id` uuid | null | Not null on `CHECKOUT_REVIEW_PRESENTED`. FK to `checkout_review_evaluation_receipts`. Null on every other kind |
| `payment_attempt_id` uuid | null | Present on `PAYMENT_ATTEMPT` when an attempt exists |
| `presentation_class` text | null | Server copy of the receipt's allowlisted class on `CHECKOUT_REVIEW_PRESENTED`. Null is allowed on other kinds. No coupon characters |
| `recorded_at` timestamptz | not null | Insert time. Not authoritative for order, cohort, or cutoff |

Partial unique indexes:

```text
UNIQUE (review_evaluation_receipt_id)
  WHERE event_kind = 'CHECKOUT_REVIEW_PRESENTED'

UNIQUE (journey_key)
  WHERE event_kind = 'SUCCESSFUL_DIRECT_ORDER_COMPLETION'
```

`ONE_SUCCESSFUL_COMPLETION_EVENT_PER_CHECKOUT_JOURNEY_KEY = YES`. A second completion insert fails and rolls that transaction back. A second presentation of the same receipt is a semantic no-op after the locked re-read in section 27A. The presentation unique index remains a backstop for a writer that skips that re-read. The expected duplicate acknowledgement does not depend on catching that violation.

#### Review evaluation receipt

Table `app.checkout_review_evaluation_receipts`. Owner: the existing measurement projection inside PostgreSQL, written only by `evaluateCheckout` in `customer-commerce`. It is not a second price, not an entitlement, and not a customer choice.

| Column | Null | Constraints | Mutability | Privacy |
|---|---|---|---|---|
| `id` uuid | not null | Primary key. Opaque. Returned to the owning client. Not a coupon and not money | Immutable | Not PII |
| `journey_key` uuid | not null | Same value as `checkouts.checkout_journey_key` for `checkout_id` | Immutable | Not a customer id |
| `checkout_id` uuid | not null | FK `checkouts` `ON DELETE RESTRICT` | Immutable | Commerce pointer |
| `checkout_revision` bigint | not null | The checkout revision observed by that evaluation. Check `> 0` | Immutable | Not money |
| `evaluated_at` timestamptz | not null | Server clock of that evaluation | Immutable | — |
| `presentation_class` text | not null | Allowlist: section 9 coupon classes, complimentary applied, threshold short of minimum, recovery returned to Review, no-offer | Immutable | No coupon characters |
| `commercial_result_fingerprint` text | not null | Non-empty opaque digest computed by the server from the authoritative commercial result of that evaluation. The client cannot supply it | Immutable | Not customer-facing copy. Not raw coupon text |

A repeat `evaluateCheckout` of the same checkout revision and the same server fingerprint returns the existing receipt id. A meaningful new authoritative result inserts a new receipt. A repaint does not. The receipt stores no customer id, so the metric never joins through one. Ownership at acknowledgement is `checkouts.customer_auth_user_id` compared with the authenticated session.

No migration is written by this candidate.

---

## 25. API fit

```text
FAÇADES = EXISTING /api/v1/* AND /api/admin/v1/*
NEW_SERVICE = NO
NEW_ROUTE = YES_EXISTING_FACADE_EXTENSION
NEW_CUSTOMER_FACADE_ROUTE = POST /api/v1/checkouts/{checkoutId}/review-presented
NEXT_ROUTE_HANDLER = NO
SERVER_ACTION = NO
SECOND_BACKEND = NO
ANALYTICS_SERVICE = NO
```

The new route is measurement acknowledgement only. It extends the existing `customer-commerce` `/api/v1/*` façade, the same process that already serves `POST /api/v1/checkouts/{checkoutId}/evaluate`. It does not by itself require D-383 or ARCH-R24. Section 31 records the full re-evaluation.

### Customer modifications

| Route | Owner | Auth | Intent | Response | Concurrency | Errors |
|---|---|---|---|---|---|---|
| `POST /api/v1/cart/coupon` | Cart `applyCartCoupon` | Existing cart credential | Store one canonical code | Cart revision plus, after the following evaluate, `CommercialExplanation` | `expectedRevision` | `CART_COUPON_UNKNOWN` writes nothing. Stale revision writes nothing. |
| `POST /api/v1/cart/coupon/remove` | Cart `removeCartCoupon` | Existing cart credential | Clear the code | Same | `expectedRevision` | Stale revision writes nothing |
| `POST /api/v1/cart/evaluate` | `evaluateCart` | Existing cart credential | Read-only quote | Quote plus explanation, progress, complimentary projection, coupon outcome | Does not bump revision | Existing indeterminate errors |
| `POST /api/v1/checkouts/{checkoutId}/evaluate` | `evaluateCheckout` | Customer session | Recompute from the cart code and checkout fulfilment. Persist or reuse one review evaluation receipt. Return its opaque id with the commercial result | Commercial result plus explanation plus `reviewEvaluationReceiptId`. `VALID_BUT_NOT_SELECTED` does not throw `CHECKOUT_COUPON_INELIGIBLE`. The receipt is not cohort entry | Does not bump cart or checkout revision merely to record the receipt. `expectedCheckoutRevision` still gates the commercial read | Existing repricing and merchandise errors |
| `POST /api/v1/checkouts/{checkoutId}/review-presented` | Measurement acknowledgement in `customer-commerce` | Existing owning customer session | Idempotently record that this server-issued receipt was presented | Empty commercial body. No price, revision, or explanation rewrite | One `CHECKOUT_REVIEW_PRESENTED` per receipt. After the head lock, the procedure re-reads that receipt before it consults `closed_at`. A duplicate acknowledgement returns the existing event, including when the head is closed, and consumes no sequence. A receipt with no presented event on a closed head is rejected | Unknown receipt, receipt for another checkout or journey, or a caller who does not own the checkout. The body accepts only the opaque receipt id. Money, coupon text, and eligibility fields are rejected |
| `prepareCheckoutForPayment`, called inside `startPayment`, `retryPayment`, and `completeZeroPayableCheckout` before those commands bind | Checkout | Customer session | Revalidate before bind. There is no separate payment-prepare route. An optional opaque receipt id is measurement context only | Ready snapshot or `CHECKOUT_REPRICED` with explanation reason | `expectedCheckoutRevision`. Section 27A ensures the presentation event before a later journey event when that receipt id is present | Stale benefit, unavailable complimentary, exhausted cap, first-order lost. A missing or unknown receipt id does not change the price |
| `POST /api/v1/payments` and retry | Payment | Customer session | Reserve claims for the active snapshot. The same optional receipt id may be carried so Pay can establish presentation before the attempt event | Unchanged commercial payment body | Existing payment idempotency key. Presentation ensure is idempotent | `PAYMENT_PROMOTION_CAPACITY_UNAVAILABLE`, first-order conflict. No coupon field is accepted. The receipt id is not money |
| Existing order read routes | Order | Owning customer | Read sealed snapshot | Historical savings and complimentary line from the snapshot | None | No live promotion call |

Checkout Review calls the cart coupon routes and then checkout evaluate. After the Review UI has committed that result to the presented Review state, it acknowledges the receipt. Pay does not wait on that acknowledgement. The Pay request may carry the same opaque receipt id so the server can record the presentation inside the payment-progression transaction. That is still one commercial state.

### Admin modifications

Existing `handleAdminPromotionsRoute` bodies gain the new fields. Create and consequence-preview stay unversioned reads or first inserts. Every other mutation keeps `expectedPromotionRevision` or `expectedCouponRevision`.

| Route | Change |
|---|---|
| `POST .../promotions/{id}/draft` | Accept first-order, mode, timing, and cap fields |
| `POST .../promotions/{id}/benefit` | Accept `delivery_fee_waiver` and `complimentary_item` plus the variant id |
| `POST .../promotions/{id}/activate` | Map unique-index failure to a non-success conflict. Do not return activated. |
| `GET .../promotions/{id}` | Add redemption counts without customer ids |
| Coupon routes | Unchanged lifecycle. Existing cap fields remain |

Unauthorized and cross-scope calls stay the current denial responses and do not write.

---

## 26. UI fit

Customer pages are the existing static export.

| Surface | File | Behaviour |
|---|---|---|
| Cart | `src/app/(customer)/order/cart/page.tsx`, `CartClient` | Coupon field, apply, remove, replace, failure text, threshold text, applied saving, complimentary projection line. Data comes from `POST /api/v1/cart/evaluate`. |
| Checkout Review | `CheckoutClient` on `/order/checkout` | Same cart coupon commands. Shows the shared code and the recomputed explanation, including the equal-payable and strictly-lower coupon classes and stale recovery. After that result is committed to the presented Review state, the client posts the opaque receipt id to `review-presented`. A repaint does not mint a receipt or a second event. Pay is not blocked on acknowledgement. |
| Payment | `PaymentPanel` | Read-only `CommercialExplanation` from the active snapshot. No input. |
| Payment return | `/order/payment` | Unchanged status return. It is not the commercial editor. |
| Order detail | `OrderDetailClient` | Renders sealed savings and a complimentary snapshot line. Does not evaluate. |
| History | `OrderHistoryClient` | Grand total remains enough. Detail carries the breakdown. |
| Menu / Home | Existing menu | No Offers destination and no Deals hub. |

Workforce: `PromotionsEditor` on `/workforce/admin/commercial/`. New fields and benefit choices live in that editor. Retirement keeps the existing confirm / cancel. Complimentary activation conflict uses the existing 409 / conflict status text, worded as non-success, not as a successful activation.

Narrow viewport and keyboard behaviour follow the Product Definition UX matrix. They are implementation proof, not a new component library.

---

## 27. Observability / audit

| Need | Record |
|---|---|
| Operator mutation | Existing `promotion_audit_events` in the mutation transaction |
| Revision provenance | `promotions.revision` / `promotion_coupons.revision` plus sealed `promotion_revision` on the snapshot effect |
| Selected Offer on a purchased order | Snapshot effect `promotion_id`, `coupon_id`, `display_name`, `promotion_revision`, amounts |
| Redemption | Existing claim row status. Operator inspect shows counts only. The first-order guard is not an operator customer list |
| Diagnosable failure | Existing cart, checkout, and payment error codes plus the distinct explanation reason codes |
| Privacy | Customer explanation omits other customers' ids and counts. Audit metadata continues to reject `canonicalCode`. Measurement heads, events, and review evaluation receipts do not store raw coupon text or customer identity |

Campaign analytics stay out of scope. X3 measurement is section 27A. It is a projection inside the existing database, not a new telemetry product.

---

## 27A. X3 measurement architecture

Experience Gate PASS makes this contract mandatory. It does not create a Product abandonment timeout, a cart expiry, a checkout expiry, or a payment-lifecycle change.

### Journey key

```text
CHECKOUT_JOURNEY_KEY_REPRESENTATION = checkouts.checkout_journey_key
EXISTING_CHECKOUT_ID_REUSED = NO
CUSTOMER_IDENTITY_AS_JOURNEY_KEY = PROHIBITED
CART_ID_AS_JOURNEY_KEY = NO
```

`checkouts.id` is stable for fulfilment changes, `invalidateReadyToDraft`, and payment retry on the same row. It is not stable for the Experience journey.

`startCheckout` in `src/server/checkout/operations.ts` returns the existing non-terminal checkout when the owner matches and `sourceCartRevision` equals `carts.revision`. When status is `DRAFT` or `READY_FOR_PAYMENT` and those revisions differ, it calls `markCheckoutCancelled` and `insertDraftCheckout` with a new id. Coupon apply, coupon remove, and quantity edits all bump `carts.revision` (`applyCartCoupon`, `removeCartCoupon`, line mutations in `src/server/cart/operations.ts`). The next start therefore replaces the checkout id. Experience keeps one key across cart edits and coupon apply, change, and remove.

`getCheckout` by cart returns null when the active checkout's `sourceCartRevision` is stale, so the client starts again and takes that replacement path.

`setCheckoutFulfilment` and `setCheckoutFulfilmentTiming` update the same checkout row and bump `checkouts.revision`. `invalidateReadyToDraft` keeps the id and moves `READY_FOR_PAYMENT` back to `DRAFT`. `retryPayment` refuses an unresolved attempt and keeps the same checkout. Those flows do not save `checkouts.id` as a journey key, because the cart-revision path already changes it.

`carts.id` survives those edits, `claimGuestCart` (same cart id, revision bump), and `finalizeCartAfterOrderMaterialization` (same cart id, lines cleared). The next unpaid attempt after a successful order reuses the cart. Experience closes the key on successful completion and starts a new key for the next attempt. A cart id would join those attempts.

### Per-cart causal order

`created_at` is not a causal order. The application clock can store equal timestamps, and `newCheckoutId()` in `src/server/checkout/repository.ts` returns `randomUUID()`. Lexical or numeric UUID order does not say which checkout was created later. Predecessor selection does not use either one.

The sole production insert of a Checkout row is `startCheckout` calling `insertDraftCheckout`. That call sits inside the transaction that already holds the Cart through `lockAndVerifyCustomerCart` (`lockCartForUpdate`). No other production path inserts into `app.checkouts`. Test SQL that inserts checkout rows is not a runtime creation path. A future insert that does not hold this Cart lock is an architecture contradiction and is not part of this candidate.

```text
CHECKOUT_INSERT_PATH = startCheckout → insertDraftCheckout
CART_LOCK_HELD_ACROSS_INSERT = YES
OTHER_PRODUCTION_INSERT = NOT_FOUND
CAUSAL_AUTHORITY = cart_checkout_ordinal
TIMESTAMP_CAUSAL_AUTHORITY = NO
UUID_CAUSAL_AUTHORITY = NO
```

While that Cart lock is held, a new Checkout gets:

```text
next_cart_checkout_ordinal =
  max(non-null cart_checkout_ordinal for this cart_id) + 1
```

When every existing ordinal for the cart is null, the next value is `1`. The value is written in the insert and is not updated later. Because the Cart lock is held until commit, a second `startCheckout` for the same cart cannot read the same maximum. If Checkout B is created after Checkout A for that cart, `B.cart_checkout_ordinal > A.cart_checkout_ordinal`, including when `created_at` is equal and the ids are random.

The ordinal answers only which Checkout row is latest. Continuability is a separate predicate on that one row. The lookup does not walk backwards until it finds a continuable row.

```text
LATEST_CAUSAL_ROW_FIRST = YES
SKIP_NEWER_BOUNDARY_TO_OLDER_CONTINUABLE_ROW = NO
```

```text
latest = the row for this cart_id and this customer_auth_user_id
         with the greatest non-null cart_checkout_ordinal

if no such row:
  do not choose a null-ordinal row by created_at or id
else if latest matches the payment-driven EXPIRED predicate below:
  copy latest.checkout_journey_key
else:
  do not copy an older journey key
```

A null ordinal is allowed only on a historical Checkout that predates this column and has not been adopted. Historical terminal rows are not given an invented order. Equal timestamps and random ids are not a backfill key.

An active pre-extension Checkout participates by a one-time adoption, not by sorting those historical rows. Adoption runs only in a transaction that already locks the Cart before the Checkout, and only while the row is still non-terminal (`DRAFT`, `READY_FOR_PAYMENT`, or `PAYMENT_PENDING`) and `cart_checkout_ordinal` is null:

- `startCheckout`, on the in-hand row, before it returns that row or inserts the successor
- `evaluateCheckout`'s commit transaction, which already locks the Cart and then the Checkout
- a section 10A payment-binding transaction, after the customer, Cart, and Checkout locks

Adoption writes the next per-cart ordinal and, when `checkout_journey_key` is null, one new opaque key. It does not bump `checkouts.revision`, change status, change the snapshot, or change price. After the ordinal is non-null it is not written again. A non-null ordinal written by this capability has a non-null journey key.

Commands that already lock the Checkout before the Cart do not adopt. Taking the Cart lock after the Checkout lock would invert section 10A. Those rows stay unordered until a Cart-then-Checkout command participates. `cancelCheckout` is one of those commands: an explicit cancel of a still-null historical row leaves the ordinal null, and the next start mints a new key rather than recovering a journey from an older null row.

```text
HISTORICAL_TERMINAL_ORDINAL_BACKFILL = NO
PRE_EXTENSION_ACTIVE_ADOPTION = ONCE_UNDER_CART_THEN_CHECKOUT_LOCK
ADOPTION_DOES_NOT_BUMP_REVISION = YES
NON_NULL_ORDINAL_IMPLIES_JOURNEY_KEY = YES
```

Mint and copy, inside `startCheckout`, under the existing cart lock from `lockAndVerifyCustomerCart`. That transaction does not lock `customer_auth_users`. The inserted row still receives the next ordinal even when step 1 copies a key from the predecessor already in hand. That copy does not rediscover the predecessor by ordering.

```text
JOURNEY_CONTINUES_ACROSS:
  CART_REVISION_CHECKOUT_REPLACEMENT
  COUPON_CHANGE
  FULFILMENT_CHANGE
  STALE_REVIEW_RECOVERY
  PAYMENT_RETRY
  PAYMENT_DEFINITIVE_NON_SUCCESS_THAT_EXPIRES_CHECKOUT

1. if an active non-terminal predecessor is in hand
   adopt it when its ordinal is null, then copy its checkout_journey_key
2. else select the single latest causal checkout for this cart and this customer
3. copy that key only when that latest row matches
   findContinuableTerminalCheckoutForCart
4. else mint a new opaque uuid
```

Step 1 covers the predecessor `startCheckout` itself still holds: the same `DRAFT` or `READY_FOR_PAYMENT` row when the cart revision matches, the row this command cancels because `sourceCartRevision` differs, and the non-`PAYMENT_PENDING` row this command expires because `expires_at` has elapsed inside this function. Fulfilment changes and `invalidateReadyToDraft` keep that same row, so the key never moves. `retryPayment` before expiry keeps the same row and the same key. `PAYMENT_PENDING` is returned as-is. When that in-hand row had no key, adoption mints one and the same-journey successor copies that value.

Step 2 runs only when `findActiveNonTerminalForCart` finds nothing. Latest is the greatest non-null `cart_checkout_ordinal` for that `cart_id` and `customer_auth_user_id`. It is not the greatest `created_at` and not `id`. An older continuable row is not copied past a newer ordinal.

Step 3 is the payment-driven expiry case. `applyDefinitiveNonSuccess` is the only writer of `payments.status = 'EXPIRED'` and `payments.expired_at`. When `now >= checkouts.expires_at` it sets the attempt to `FAILED` or `CANCELLED`, the payment to `EXPIRED`, and the checkout to `EXPIRED` in that same payment transaction. That checkout is then absent from `findActiveNonTerminalForCart`. Continuity is not inferred from elapsed time. `findContinuableTerminalCheckoutForCart` matches only when the latest checkout is that predecessor:

```text
checkout.status = EXPIRED
AND EXISTS payment for that checkout_id
  with status = EXPIRED
  AND expired_at IS NOT NULL
  AND EXISTS payment_attempt for that payment
    with status IN ('FAILED', 'CANCELLED')
AND NOT EXISTS payment for that checkout_id with status = SUCCEEDED
AND NOT EXISTS orders row for that checkout_id
```

`orders.checkout_id` is unique. A successful direct order cannot sit on that checkout. The matched checkout has no successful completion, so the next `insertDraftCheckout` copies its `checkout_journey_key`.

`markCheckoutExpired` is the other checkout `EXPIRED` writer. `startCheckout` calls it only for a non-`PAYMENT_PENDING` row whose `expires_at` has elapsed, and that call does not set `payments.status = 'EXPIRED'`. When that happens inside step 1, the key is copied from the row in hand before the new draft is inserted. A later start does not treat that already-replaced row as the latest checkout. `cancelPaymentAggregate` sets the payment to `CANCELLED` and the checkout back to `DRAFT`. That checkout stays active, so the key stays on the row. It is not the continuable-terminal predicate.

```text
EXPLICIT_CUSTOMER_CANCEL → NEW_JOURNEY_ON_LATER_START
SUCCESSFUL_DIRECT_ORDER_COMPLETION → CLOSE_CURRENT_JOURNEY
COMPLETED_PREDECESSOR → DO_NOT_COPY_KEY_TO_NEXT_ORDER
PAYMENT_DRIVEN_EXPIRED_PREDECESSOR = CONTINUABLE
```

Explicit `cancelCheckout` already left `CANCELLED` before a later start. That latest causal row fails the continuable predicate, so step 4 mints a new key. `closed_at` is not used for that stop. Cancel is not successful completion and it is not a new customer-visible state.

```text
ordinal 10: payment-driven EXPIRED, journey_key = J1
ordinal 11: explicit customer CANCELLED
next start: latest causal row = ordinal 11
result: NEW journey key
```

The lookup does not ignore ordinal 11 and recover J1 from ordinal 10.

A latest `COMPLETED` checkout, whether the payment is `SUCCEEDED` or the order provenance is `NO_PAYMENT_REQUIRED`, fails the predicate. The next attempt mints a new key.

```text
ordinal 20: payment-driven EXPIRED, journey_key = J2
ordinal 21: COMPLETED, successful direct order
next start: latest causal row = ordinal 21
result: NEW journey key
```

The lookup does not fall back to ordinal 20.

Same-journey cases, applied only after the latest causal row is selected, or applied to the predecessor already in hand inside `startCheckout`: cart-revision replacement in that same transaction, logical expiry inside that same transaction, a latest row whose payment-driven expiry predicate matches, stale Review recovery, and payment retry or recovery before a new checkout is required. A new journey is required after successful direct-order completion, after explicit customer cancellation followed by a later start, when a later causal Checkout is itself a boundary, and when no latest row matches the continuable predicate.

`claimGuestCart` happens before a checkout exists, because a checkout requires `customer_auth_user_id`. The first start after that claim mints the key. `reconcileGuestCartWithCustomer` bumps the surviving cart revision. The following start still has the superseded checkout in hand at step 1 and copies the key.

```text
ONE_LOGICAL_CHECKOUT = ONE_CHECKOUT_JOURNEY_KEY
CHECKOUT_JOURNEY_KEY_PII = NO
PRODUCT_ABANDONMENT_TIMEOUT_CREATED = NO
```

| Flow | Key on the next Review |
|---|---|
| Review, cart edit, Review | Same. Step 1 copies before the cart-revision replacement |
| Coupon apply, change, or remove, then Review | Same. The cart revision changes. Step 1 copies |
| Fulfilment change, then Review | Same row |
| Stale-total recovery | Same row, returned through `invalidateReadyToDraft` |
| Payment `FAILED` or `CANCELLED` before expiry, then retry | Same row. The checkout returns to `READY_FOR_PAYMENT` |
| Payment definitive non-success after checkout validity elapsed, then a new checkout and Review | Same. The new checkout copies the continuable predecessor |
| Explicit customer checkout cancel, then a later start | New |
| Successful direct-order completion, then the next order | New |

### Sequence

`checkouts.revision` does not satisfy `AUTHORITATIVE_JOURNEY_SEQUENCE`. `evaluateCheckout` does not bump it. Two measurement events can share an `occurred_at` because of clock precision. Analytics arrival order is not an order. A review evaluation receipt has no sequence. Only a row in `checkout_journey_measurement_events` allocates one.

```text
SCOPE = one CHECKOUT_JOURNEY_KEY
STRICT_TOTAL_ORDER = YES
UNIQUE_WITHIN_JOURNEY = YES
REPRODUCIBLE = YES
ANALYTICS_INGESTION_ORDER = NOT_AUTHORITY
TELEMETRY_ARRIVAL_ORDER = NOT_AUTHORITY
RECEIPT_ALONE_ALLOCATES_SEQUENCE = NO
```

One append procedure writes every measurement event. Presentation acknowledgement, Pay's `ensureReviewPresented`, payment progression, payment attempt, and Order completion all call it. They do not keep separate sequence allocators.

```text
appendJourneyMeasurementEvent(tx, journeyKey, event, now):
  1. head = ensureAndLockJourneyMeasurementHead(tx, journeyKey, now)
  2. existing = re-read this event's authoritative idempotency identity while the head is locked
  3. if existing exists:
       return existing
       allocate no sequence
       mutate no head state
       stop
  4. if head.closed_at IS NOT NULL:
       reject the request as an attempt to establish a NEW fact on a closed journey
       allocate no sequence
       stop
  5. sequence = head.next_sequence
  6. increment head.next_sequence
  7. insert the new event at that sequence
  8. if this newly inserted event is SUCCESSFUL_DIRECT_ORDER_COMPLETION:
       set head.closed_at in this same Order-materialization transaction
  9. commit with the originating commercial or measurement transaction
```

```text
HEAD_LOCK
→ IDEMPOTENCY_RE_READ
→ EXISTING_EVENT_RETURN
→ CLOSED_HEAD_CHECK_FOR_NEW_FACT
→ SEQUENCE_ALLOCATION
→ EVENT_INSERT

IDEMPOTENT_REPLAY_LOOKUP_PRECEDES_CLOSED_HEAD_REJECTION = YES
EXISTING_FACT_ON_CLOSED_HEAD = RETURN_EXISTING_AUTHORITATIVE_EVENT
NEW_FACT_ON_CLOSED_HEAD = REJECT
NEW_SEQUENCE_ON_CLOSED_HEAD = NO
CLOSED_HEAD_REPLAY_MUTATES_HEAD = NO
CLOSED_HEAD_REPLAY_ALLOCATES_SEQUENCE = NO
CLOSED_HEAD_REPLAY_APPENDS_EVENT = NO
```

Step 2 is that event's own idempotency identity. It is not a query for whether any event of the kind has occurred, and it is not telemetry arrival order. Customer identity is not an event idempotency key.

```text
CHECKOUT_REVIEW_PRESENTED =
  event_kind = CHECKOUT_REVIEW_PRESENTED
  AND review_evaluation_receipt_id = receipt.id
SUCCESSFUL_DIRECT_ORDER_COMPLETION =
  event_kind = SUCCESSFUL_DIRECT_ORDER_COMPLETION
  AND journey_key = current journey
OTHER_APPENDABLE_KINDS = their existing originating idempotency or provenance, where one already exists
CUSTOMER_IDENTITY_AS_EVENT_IDEMPOTENCY_KEY = NO
TELEMETRY_ARRIVAL_ORDER = NOT_AUTHORITY
```

`ensureAndLockJourneyMeasurementHead` runs in that same transaction, before any sequence is read:

```text
INSERT INTO app.checkout_journey_measurement_heads (
  journey_key,
  next_sequence,
  created_at,
  closed_at
) VALUES (
  :journey_key,
  1,
  :now,
  NULL
)
ON CONFLICT (journey_key) DO NOTHING;

SELECT journey_key, next_sequence, created_at, closed_at
FROM app.checkout_journey_measurement_heads
WHERE journey_key = :journey_key
FOR UPDATE;
```

The select must return exactly one row. The Candidate 5 correction happens only after that row is locked. While the lock is held, the procedure re-reads this event's idempotency identity, returns the existing event when one is found, and only then uses `closed_at` to reject a new fact. Sequence allocation follows that closed-head check. `next_sequence` starts at `1` and changes only while the lock is held, and a replay does not change it. `recorded_at` is not an order. The unique `(journey_key, journey_sequence)` constraint remains a backstop for a writer that skips the lock.

```text
MEASUREMENT_HEAD_INITIALIZATION =
  ATOMIC_CONFLICT_SAFE_GET_OR_CREATE_THEN_LOCK
FIRST_SEQUENCE = 1
NEXT_SEQUENCE_MUTATION = ONLY_WHILE_HEAD_ROW_LOCKED
FIRST_EVENT_RACE_ABORTS_BUSINESS_TRANSACTION = NO
```

Two transactions for a missing head may both reach the insert. `INSERT ... ON CONFLICT DO NOTHING` makes that safe. One transaction establishes the row. The other waits while PostgreSQL resolves the uniqueness conflict, inserts no second row, and then locks and re-reads the established row. Only one transaction owns the head row lock at a time, so the first event is serialized the same way as a later event. This candidate does not initialize with `SELECT … FOR UPDATE` alone, does not catch a transaction-aborting unique violation and retry, does not use a process-local mutex, and does not use analytics arrival order.

```text
UNIQUE_PRESENTED_EVENT_PER_RECEIPT = YES
```

`ensureReviewPresented` uses the same procedure. Its identity is `event_kind = CHECKOUT_REVIEW_PRESENTED` and `review_evaluation_receipt_id = receipt.id`. After the head is locked it re-reads that identity before it consults `closed_at`. When the row exists, it returns that event, including when `closed_at` is already set, and it does not consume a sequence, insert another event, mutate the head, or reopen the journey. When the row does not exist and `closed_at` is set, the procedure rejects the new presentation and allocates no sequence. When the row does not exist and the head is open, it takes `head.next_sequence`, increments the head, and inserts the presented event. The partial unique index on the receipt stays a database backstop. The expected duplicate acknowledgement is the locked re-read, which is a semantic no-op, not a failed transaction.

A delayed duplicate acknowledgement after successful completion is that replay. The sequence is Review presented, then payment, then Order materialization, then `SUCCESSFUL_DIRECT_ORDER_COMPLETION`, then the head closes, then the delayed acknowledgement of the same receipt. The final acknowledgement returns the existing presented event. It adds no new event, no new denominator, and no new sequence, and it does not reopen the journey. A receipt that has never produced a `CHECKOUT_REVIEW_PRESENTED` event is a new fact. After closure that request is rejected and does not create a denominator.

```text
NEW_EVENT_AFTER_SUCCESSFUL_COMPLETION = REJECTED
IDEMPOTENT_REPLAY_OF_EXISTING_EVENT = ALLOWED
NEW_PRESENTATION_AFTER_CLOSED_JOURNEY = REJECT
DUPLICATE_ACK_AFTER_COMPLETION = IDEMPOTENT_SUCCESS
```

Only the Order-materialization transaction sets `closed_at`, and only while it still holds that head lock, after the completion event insert. Payment success does not set it. Payment-driven expiry does not set it. A replay of an existing event does not clear `closed_at` and does not reopen the head.

`SUCCESSFUL_DIRECT_ORDER_COMPLETION` has at most one event per journey. Its idempotency identity is the partial unique index: `journey_key` where `event_kind = 'SUCCESSFUL_DIRECT_ORDER_COMPLETION'`. Order-materialization replay or recovery locks the head, re-reads that identity, and returns the existing event when it is present, including when `closed_at` is already set. That replay allocates no sequence and inserts no second completion event.

```text
COMPLETION_REPLAY_AFTER_CLOSURE = RETURN_EXISTING_COMPLETION_EVENT
```

A head whose `closed_at` is set and whose `SUCCESSFUL_DIRECT_ORDER_COMPLETION` event is absent is not a normal replay case. Closure is written only in the same Order-materialization transaction that inserts that event, so the combination is an invariant violation. The procedure does not repair it by appending a completion after closure, by allocating a sequence, or by clearing `closed_at`. Implementation proof must show that state cannot commit under that transaction boundary.

```text
CLOSED_HEAD_WITHOUT_COMPLETION_EVENT = INVARIANT_VIOLATION
AUTO_REOPEN_OR_APPEND = NO
```

The Order-materialization completion path below is that replay when the completion event is already present. When completion is the first event for the key, the same conflict-safe head procedure creates the head, then the append procedure inserts the event and sets `closed_at`. A numerator is still counted only for a journey that has the qualifying presented Review. Payment `SUCCEEDED` does not close the head.

| Fact | When the event is written | Denominator |
|---|---|---|
| `CHECKOUT_REVIEW_PRESENTED` | The presentation acknowledgement commits, or the payment-progression transaction ensures that same receipt before it allocates a later event | Yes. This is the qualifying Review observation |
| `COMMERCIAL_STATE_CHANGE` | Coupon apply, remove, replace, fulfilment change, or stale recovery that changes the Review result | No. It does not select a segment |
| `REVIEW_TO_PAYMENT_PROGRESSION` | `prepareCheckoutForPayment` commits `READY_FOR_PAYMENT` for that key, after any ensured presentation | No |
| `PAYMENT_ATTEMPT` | Payment initiation or `retryPayment` inserts the attempt, after any ensured presentation | No |
| `SUCCESSFUL_DIRECT_ORDER_COMPLETION` | The Order-materialization transaction, after direct-order placement and accepted payment truth are both true | Numerator only |

`occurred_at` is the clock `now` of the transaction that writes the event. A repaint does not create a receipt and does not write an event. Server `evaluateCheckout` writes a receipt, not this table.

```text
PAYMENT_PROGRESS_WITH_REVIEW_RECEIPT =
  ENSURE_PRESENTATION_ACK_IDEMPOTENTLY_THEN_PROGRESS
```

When a request moving from Review toward payment carries the opaque receipt id, the payment-progression transaction calls `ensureReviewPresented` and then allocates `REVIEW_TO_PAYMENT_PROGRESSION` or `PAYMENT_ATTEMPT` before it commits. The head lock stays held across both writes. The receipt was issued by `evaluateCheckout`. The client does not send money, a coupon, or an eligibility result in that field. An unknown receipt is not turned into an event and does not block payment.

If no head exists yet, acknowledgement and this Pay fallback may both start. When acknowledgement wins initialization, Pay waits, re-reads the presented receipt, writes no second Review event, and then allocates the later payment sequence. When Pay wins initialization, Pay writes the Review event and then the later payment event; acknowledgement then sees the receipt and returns idempotent success. Pay does not roll back only because acknowledgement created the head.

```text
CHECKOUT_REVIEW_PRESENTED.sequence
<
REVIEW_TO_PAYMENT_PROGRESSION.sequence
```

whenever that Pay operation is using the receipt as proof that Review was presented. A first-head race cannot reverse that order. A later acknowledgement of the same receipt consumes no further sequence and does not add a denominator. Pay is not held for a separate analytics request, and no customer-visible wait is added.

### Global cohort entry

The calculation reads only `CHECKOUT_REVIEW_PRESENTED` rows for one `journey_key`. Receipts with no presentation event are ignored.

1. Keep `CHECKOUT_REVIEW_PRESENTED` rows.
2. Choose the row with the lowest `journey_sequence`.
3. That row is the one cohort-entry Review.
4. `GLOBAL_COHORT_ENTRY_TIME` is that row's `occurred_at`.
5. The journey is in a window when `WINDOW_START <= GLOBAL_COHORT_ENTRY_TIME < WINDOW_END`.
6. No later presented Review is tested, even if its `occurred_at` falls in a later window.

```text
COHORT_ENTRY_SELECTED_PER_WINDOW = NO
COHORT_MEMBERSHIP = ZERO_OR_ONE
WINDOW = [START, END)
SERVER_EVALUATION_ALONE_COUNTS = NO
UNACKNOWLEDGED_RECEIPT_DENOMINATOR_EFFECT = NONE
```

A later presented Review inserts a higher sequence. It does not update the entry row, so it cannot move the journey or add a denominator. Another visit that presents a new authoritative result may insert another `CHECKOUT_REVIEW_PRESENTED` for a new receipt. The denominator remains one per journey key. Membership is not stored. It is recomputed from the immutable entry row, so the same records and the same window yield the same membership.

### Calendar, window, and report cutoff

```text
MEASUREMENT_CALENDAR_TIMEZONE = Asia/Kolkata
MEASUREMENT_CALENDAR_APPLIES_TO = THIS_MEASUREMENT_CONTRACT_ONLY
```

`PRODUCTION_RELEASE_ANCHOR` is a named instant supplied to the calculation. This candidate does not add a release table or a feature flag. The initial window is that instant through the same local clock time plus 28 civil days in `Asia/Kolkata`, half-open. An entry exactly at the start is inside. An entry exactly at the end is outside and belongs to the next window that starts at that instant, if that window is being reported. Adjacent windows do not overlap.

`REPORT_AS_OF` is an input of one published calculation, not a checkout column. For the initial snapshot it equals the exclusive end of the initial window. A fact is included only when `occurred_at < REPORT_AS_OF`. An event exactly at the cutoff is excluded. The same cutoff applied to the same rows includes the same events. Checkout expiry, payment state, and cart lifetime do not read this cutoff.

```text
PRODUCT_ABANDONMENT_TIMEOUT_CREATED = NO
```

### Primary metric

`CHECKOUT_REVIEW_TO_SUCCESSFUL_DIRECT_ORDER_COMPLETION_RATE` for a named cohort window and `REPORT_AS_OF`:

| Membership | Source |
|---|---|
| Cohort member | One presented Review: the lowest `CHECKOUT_REVIEW_PRESENTED` sequence, tested against the half-open window |
| Denominator | Journey keys with at least one acknowledged `CHECKOUT_REVIEW_PRESENTED`. A later presented Review does not add a key. An unacknowledged receipt does not add a key |
| Numerator | Those same keys with one `SUCCESSFUL_DIRECT_ORDER_COMPLETION` whose `occurred_at < REPORT_AS_OF`. Payment `SUCCEEDED` alone is not the numerator |
| Unfinished | Denominator key with no such completion. Class `NOT_COMPLETED_AS_OF_REPORT_CUTOFF` |
| Completed segment | Greatest `journey_sequence` among `CHECKOUT_REVIEW_PRESENTED` events that precede the completion's sequence. The class is the receipt class on that event |
| Unfinished segment | Greatest `journey_sequence` among `CHECKOUT_REVIEW_PRESENTED` events with `occurred_at < REPORT_AS_OF` |

An evaluation that was never presented cannot overwrite the segment. `COMMERCIAL_STATE_CHANGE` is not a segment source.

```text
SUCCESSFUL_DIRECT_ORDER_COMPLETION_AUTHORITY = ORDER_MATERIALIZATION_TRANSACTION
PAYMENT_SUCCESS_ALONE_COUNTS_COMPLETION = NO
ORDER_MATERIALIZATION_ESTABLISHES_COMPLETION = YES
```

`applySuccess` commits Payment `SUCCEEDED` and Checkout `COMPLETED` first. `tryMaterializeOrderAfterPaymentCompletion` runs after that transaction and swallows errors. It is not the event authority. The normal hook and `recoverMissingOrdersBatch` both call `materializeOrderForCompletedCheckout`. The completion event is written only inside that function.

That function already proves accepted payment truth before it inserts the Order. For a positive payable it requires Checkout `COMPLETED`, the active snapshot belonging to that checkout, and a `SUCCEEDED` payment for that exact snapshot. For a zero payable it requires Checkout `COMPLETED`, snapshot payable `0`, no payment on that snapshot, and Order provenance `NO_PAYMENT_REQUIRED`. No synthetic payment row is inserted. The Order insert is the first transaction in which the direct order is placed and that accepted payment truth both hold.

In that same transaction, after those checks, and before commit:

- If this checkout has no `checkout_journey_key`, this measurement contract does not invent one. Historical orders stay outside the metric.
- If there is no Order yet, the function inserts the Order and calls `appendJourneyMeasurementEvent` for exactly one `SUCCESSFUL_DIRECT_ORDER_COMPLETION`. That procedure creates the head when this unusual flow has no prior measurement event, then inserts the event and sets `closed_at`. `occurred_at` is that transaction's clock. A failure of the event insert rolls back the Order. The numerator is still counted only when the journey has a qualifying presented Review.
- If the Order already exists, the function does not insert another Order. Before it treats measurement completion as satisfied, it ensures the completion event through the same procedure. When the event is already present, that ensure is a locked re-read and returns the existing event even if `closed_at` is already set. It writes nothing and allocates no sequence. When the event is absent and the head is open, this transaction inserts it and sets `closed_at`. When the event is absent and `closed_at` is already set, that is the invariant violation above: the procedure rejects the append and does not reopen the head. The partial unique index still permits only one such event per journey key.
- A unique-violation race on `orders.checkout_id` follows the same ensure. The winning transaction commits the Order and the event together. The loser sees the committed Order and does not allocate a second completion sequence.

Zero-payable completion also reaches this function through `tryMaterializeOrderAfterPaymentCompletion` after `completeZeroPayableCheckout`. The completion event is still written here, not in the zero-payable transaction and not because a payment row succeeded.

Equal `occurred_at` values still have different sequences, so segment selection stays a total order. The metric does not read page views, customer id, ingest order, unordered physical row order, the live Promotion row, or an unacknowledged receipt.

```text
CHECKOUT_JOURNEY_KEY_PII = NO
AUTHORITATIVE_JOURNEY_SEQUENCE_PII = NO
CUSTOMER_IDENTITY_USED_AS_MEASUREMENT_JOIN = NO
RAW_COUPON_TEXT_IN_MEASUREMENT = NO
NEW_SERVICE_REQUIRED = NO
NEW_QUEUE = NO
SECOND_COMMERCE_AUTHORITY = NO
```

Customer identity remains on checkout and on the first-order guard for eligibility and auth. It is not a column on the measurement head, the measurement event, or the review evaluation receipt, and the rate does not join through it.

---

## 28. Failure / concurrency matrix

| Case | Source of truth | Transaction | Winner | Retry | Projection |
|---|---|---|---|---|---|
| Stale cart revision | `carts.revision` | `lockCartForUpdate` then CAS | Matching revision | Client reloads the cart | Existing cart conflict. Previous code stays |
| Stale promotion revision | `promotions.revision` | Promotion command CAS | Matching `expectedPromotionRevision` | Operator reloads and reviews again | Existing conflict copy. No effect |
| Coupon retired mid-checkout | `promotion_coupons.status` plus fresh quote | `prepareCheckoutForPayment` | Fresh evaluation | Review, remove or replace, then prepare again | Explanation reason. Payment not bound |
| Global last redemption | Claim counts under promotion `FOR UPDATE` | `acquireReservedClaimsForAttempt` | First committed `RESERVED` that still fits the cap | Payment transaction rolls back only itself. Next prepare/evaluate recounts and returns Review through the existing mismatch path | `PAYMENT_PROMOTION_CAPACITY_UNAVAILABLE`. No false consume |
| Per-customer redemption | Same counts filtered by customer | Same | Same | Same | Personal-cap explanation. No foreign count |
| First-order concurrent checkout | Order / succeeded-payment predicate plus one purchase-level guard | Guard insert after customer row lock. Claims remain per Promotion | One committed active guard, including when the winner is a primary plus delivery pair | Losing transaction rolls back. A resolved failure releases the guard so a later retry can reserve one new guard | Conflict / revalidation. Not two entitlements |
| Duplicate coupon submit | One `manual_coupon_code` | Cart CAS | One code | Same-code apply is a no-op | One evaluated coupon |
| Complimentary concurrent activation | Partial unique index | `activatePromotion` | The committed update | The other transaction rolls back, including its audit row | Operator non-success. `ACTIVE_COUNT <= 1` |
| Complimentary unavailable before pay | `resolveOutletVariantAvailability` | Prepare comparison | Recomputed combination with that Offer removed | Stay on Review | `COMPLIMENTARY_ITEM_UNAVAILABLE`. No substitute |
| Same-payment retry | Attempt uniqueness and `RELEASED` prior claims | `retryPayment` | One `RESERVED` set for the new open attempt | Idempotency key replays the same attempt | No second consumption |
| Snapshot replay | Insert-only snapshot and payment idempotency | Existing payment initiation | The already bound snapshot | Replay returns the existing payment | No second seal of a different total |
| Operator revision conflict | Promotion or coupon revision | Command CAS | Current revision | Reload | 409. Draft unchanged |
| Payment definitive non-success after checkout validity | `applyDefinitiveNonSuccess` writes payment `EXPIRED` and checkout `EXPIRED` together | Payment transaction, then a later `startCheckout` | The continuable predecessor's journey key is copied. No second denominator from the recovery itself | Next Review uses the same key | Not a new journey. Explicit cancel and completed checkout stay new-key boundaries |
| Payment succeeded, Order hook failed | Payment success is committed. No completion event yet | Later `materializeOrderForCompletedCheckout`, including `recoverMissingOrdersBatch` | The Order and the one completion event commit together, or the existing-Order path ensures the event once | Recovery retries materialization | Payment success alone stays out of the numerator |
| Evaluate response never presented | Server receipt may exist | `evaluateCheckout` | No presentation event | Acknowledgement, if it later happens, is the first denominator observation | `DENOMINATOR_EFFECT = NONE` until then |
| Duplicate presentation acknowledgement | One receipt id | Presentation transaction re-reads under the locked head before it consults `closed_at` | The first event commits | The second returns that event and consumes no sequence. The unique index is only a backstop | One `CHECKOUT_REVIEW_PRESENTED`. No second denominator |
| Duplicate Review acknowledgement after successful completion | Existing presented event for that receipt, completion event present, `closed_at` set | Acknowledgement locks the head, then re-reads that receipt | Returns the existing presented event | No closure error. No new sequence. No new denominator. `closed_at` stays set | One denominator. Journey stays closed |
| Completion replay after closure | Existing `SUCCESSFUL_DIRECT_ORDER_COMPLETION`, `closed_at` set | Materialization or recovery locks the head, then re-reads that completion identity | Returns the existing completion event | No second completion. No new sequence. Head is not reopened | Existing numerator fact |
| New Review fact after closure | Closed head. That receipt has no presented event | Locked re-read finds no event, then the closed-head check rejects | No event is inserted | No sequence. No new denominator. Head stays closed | `NEW_PRESENTATION_AFTER_CLOSED_JOURNEY = REJECT` |
| Closed head without a completion event | `closed_at` set and no `SUCCESSFUL_DIRECT_ORDER_COMPLETION` row | Completion ensure re-reads that journey identity under the head lock and finds nothing | Invariant violation. Not a replay | No completion append. No sequence. No reopen. `closed_at` is not cleared | Not repaired by a late completion insert |
| Pay before the async acknowledgement commits | Same server-issued receipt id carried as measurement context | Payment-progression transaction | Presentation event is inserted first, then the progression or attempt event | A later ack of that receipt returns the existing event | Journey order stays causal. Pay is not delayed |
| First measurement event, no head yet | Acknowledgement and Pay fallback both start | Each uses `INSERT … ON CONFLICT DO NOTHING` then `SELECT … FOR UPDATE` | One head row. The presented receipt is written once. Pay continues | The waiter re-reads and does not abort on a unique violation | Review sequence is strictly before the payment sequence when Pay relies on that receipt |
| Duplicate acknowledgement after Pay already ensured the receipt | Existing presented event | Acknowledgement after the head lock | Returns the existing event | No new sequence for that receipt | One denominator |
| Two different first measurement facts | Head missing, then two distinct events | Same conflict-safe head, then the row lock | Sequences are unique and strictly increasing | The second waits on the head lock | Semantic order constraints still hold. Neither business transaction fails only because the head was created |
| Two checkouts with equal `created_at` | `cart_checkout_ordinal` | `startCheckout` under the Cart lock | The later insert has the greater ordinal | UUID values are ignored | Predecessor selection follows the ordinal |
| Payment-driven expired row, then a later explicit cancel | Highest ordinal is the cancel | Next `startCheckout` reads that one latest row | New journey key | It does not read the older expired row | Boundary stands |
| Payment-driven expired row, then a later completed checkout | Highest ordinal is the completion | Next `startCheckout` reads that one latest row | New journey key | It does not recover the older expired key | Boundary stands |
| Historical active checkout after release | Null ordinal on the one non-terminal row | First Cart-then-Checkout adoption command | That row receives ordinal and journey key once | Historical terminal rows stay null and unordered | No `created_at` or UUID backfill |
| Guest-cart reconciliation races payment binding | Both lock `customer_auth_users` before any cart | Separate transactions | Customer row serializes them | Existing revision conflict is allowed | No PostgreSQL deadlock. Measurement head is not locked before the customer or the cart |

---

## 29. Story / AC traceability

FIT status `FIT_WITH_EXTENSION` means the mandatory story is satisfied only by the extensions in this candidate. None are `CONTRADICTION` or `DECISION_REQUIRED`.

| Story | Mandatory ACs | Components | Schema | API | UI | Concurrency | Planned proof | FIT |
|---|---|---|---|---|---|---|---|---|
| US-036J-001 | 001-01, 001-02 | `evaluatePromotions`, quote | None beyond shared qualifier columns if the Offer uses them | Cart evaluate explanation | Cart applied / not effective | Evaluation is read-only | Domain: window match applies; outside window does not | `FIT_WITH_EXTENSION` |
| US-036J-002 | 002-01 … 002-10 | `manual_coupon_code`, cart commands, checkout adapter | None for the mutable code | Existing coupon routes called from both pages | Cart and Review controls. Payment has none | Cart CAS; failed request does not paint success | HTTP plus browser: shared code, guest unrestricted path, sign-in retry, payment without controls | `FIT_WITH_EXTENSION` |
| US-036J-003 | 003-01, 003-02 | Progress on the quote | Uses existing minimum columns | Evaluate responses | Cart / Review text | Re-evaluate after mutation | Domain: remaining paise equals the gap; drop-off removes the saving | `FIT_WITH_EXTENSION` |
| US-036J-004 | 004-01 | Quote components and explanation | Sealed effects already store amounts; delivery saving uses them | Checkout evaluate | Review and Payment summary | Revalidation before pay | Domain plus browser: components sum; ₹0 standing delivery has no second saving line | `FIT_WITH_EXTENSION` |
| US-036J-005 | 005-01, 005-02 | Section 10 predicate and purchase guard | `first_order_only`, `first_order_purchase_guards` | No first-order route. Prepare and payment enforce | Eligible / ineligible explanation | Customer lock + one active guard per customer, customer before cart | Domain predicate, paired primary plus delivery, overlapping reservations, payment binding versus guest-cart reconciliation with no deadlock | `FIT_WITH_EXTENSION` |
| US-036J-006 | 006-01, 006-02 | Checkout mode and timing into the quote | Mode and timing arrays | Existing fulfilment routes then evaluate | Checkout mode controls already exist | Fulfilment commands bump revision | Domain: delivery Offer off on pickup; scheduled window consumed, not redefined | `FIT_WITH_EXTENSION` |
| US-036J-007 | 007-01 | Coupon outcomes + cap reads | Promotion cap columns | Evaluate and payment errors | Distinct Review copy | Cap lock in section 11 | Domain table of the five reason classes | `FIT_WITH_EXTENSION` |
| US-036J-008 | 008-01 | `prepareCheckoutForPayment` | None new for the gate | Existing prepare | Review recovery. Payment does not edit the code | Snapshot mismatch | Integration: retire the Offer, prepare fails closed, Review total matches the fresh quote | `FIT_WITH_EXTENSION` |
| US-036J-009 | 009-01 … 009-04 | Section 6 and 9 | None specific | Checkout must accept `VALID_BUT_NOT_SELECTED` | Did-not-improve and coupon-wins copy | One cart code | Domain fixtures for the ₹80/₹40 and ₹90/₹20 examples, merchandise coupon plus delivery, delivery coupon in the delivery slot | `FIT_WITH_EXTENSION` |
| US-036J-010 | 010-01 … 010-04 | `buildPromotionCandidates` | Benefit type `delivery_fee_waiver` | Evaluate response | Breakdown of the winning pair | Candidate generation is deterministic | Domain: both apply; BOGO does not stack; best pair; standing ₹0 | `FIT_WITH_EXTENSION` |
| US-036J-011 | 011-01 | Order read of snapshot | Sealed `promotion_revision` | Existing order read | Order detail | Snapshot not updated | Integration: retire the Offer, detail amounts unchanged, `evaluatePromotions` not called | `FIT_WITH_EXTENSION` |
| US-036J-012 | 012-01 … 012-06 | Admin promotion commands | Complimentary columns and unique index | Existing admin routes | `PromotionsEditor` | Revision CAS; unique index for 012-06 | Auth allow/deny, activation validation, sequential reject, two overlapping activation transactions | `FIT_WITH_EXTENSION` |
| US-036J-013 | 013-01 … 013-04 | Quote component, availability, snapshot line | Snapshot line origin; benefit FKs | Evaluate and order read | Cart, Review, detail line | Availability rechecked at prepare; `NONE_CHOSEN` if two qualify | Domain and browser: exact variant, ₹0 merchandise, no gift picker, historical line, unavailable recomputes, competing gifts absent | `FIT_WITH_EXTENSION` |

Uncovered mandatory ACs: none.

Golden journeys `GJ-FIRST-ORDER` and `GJ-RETURNING-ORDER` are proof surfaces for the explanation and the ineligible returning customer once implementation is authorized. This candidate does not redefine their non-offer steps.

### Experience-fit trace

| Requirement | Fit |
|---|---|
| Authoritative threshold gap | Section 14. Client does not calculate the money |
| One commercial explanation | Section 15. Merchandise saving, delivery saving, total saved, final payable |
| Shared Cart and Review coupon state | Section 8 |
| Payment read-only | Section 8 and section 26 |
| Complimentary identity and no extra merchandise charge | Section 17 |
| Coarse customer-visible failure classes | Sections 8, 15, and 16. Projection-owned language |
| Stale recomputation returns to Review | Section 16 |
| Sealed purchased savings | Section 16 and section 17 |
| Complimentary equal-payable tie | Section 21. Product-owned |
| General equal-payable tie | Section 6. `FIT_OWNED_DETERMINISTIC` |
| One logical checkout, one journey key | Section 27A. Payment-driven expiry copies the key only from the latest causal Checkout. Explicit cancel and successful completion do not |
| Equal checkout timestamps do not choose the predecessor | Section 27A. `cart_checkout_ordinal` is the causal order. UUID order is not |
| Review must be presented | Section 27A. `SERVER_EVALUATION_ALONE_COUNTS = NO`. Unacknowledged receipts have no denominator effect |
| Review revisit does not add a denominator | Section 27A cohort steps 1–6. One presented event per receipt. Denominator remains one key |
| Successful completion joins on the same key | Section 27A. Written in Order materialization. Payment success alone is not completion |
| Global cohort entry selected once | Lowest presented-Review sequence |
| Equal-time events still totally ordered | `journey_sequence`, not `occurred_at` |
| Half-open window assignment | `[START, END)` in `Asia/Kolkata` |
| Report-as-of | `occurred_at < REPORT_AS_OF`. Segment uses presented Reviews only |
| Pay before acknowledgement | Presentation is ensured before the later payment measurement event |
| Customer identity is not the journey join | No customer column on measurement head, events, or receipts |
| Raw coupon text is not stored | `presentation_class` allowlist only. Receipt fingerprint is a server digest |
| Customer before cart | Section 10A |
| Historical purchased savings stay immutable | Insert-only snapshot. Composite snapshot-line foreign key remains |
| Customer-facing language stays projection-owned | LANG-1. No microcopy in this document |

```text
REVIEW_DENOMINATOR = PRESENTATION_ACKNOWLEDGED
SERVER_EVALUATION_ALONE_COUNTS = NO
PAYMENT_SUCCESS_ALONE_COUNTS_COMPLETION = NO
ORDER_MATERIALIZATION_ESTABLISHES_COMPLETION = YES
PAYMENT_DRIVEN_EXPIRED_CHECKOUT_PRESERVES_JOURNEY = YES
LATEST_CAUSAL_ROW_FIRST = YES
SKIP_NEWER_BOUNDARY_TO_OLDER_CONTINUABLE_ROW = NO
FIRST_EVENT_RACE_ABORTS_BUSINESS_TRANSACTION = NO
CUSTOMER_BEFORE_CART_LOCK_ORDER = YES
```

---

## 30. Test / proof plan

Not executed. This future implementation proof plan is not PD-2 Quality/Test Plan finalization
and is not IMP-036J implementation evidence. Future implementation proof under TEST-1:

| Layer | Proves |
|---|---|
| Domain unit on `buildPromotionCandidates` / `selectBestCandidate` | Slot pairs, both-apply, BOGO non-stack, best payable, complimentary tie, `NONE_CHOSEN`, coupon did-not-improve, standing ₹0 waiver |
| Domain unit on the first-order predicate | Failed payment absent; cancelled order still ineligible; no customer boolean |
| Measurement | One key across a cart-revision checkout replacement; payment-driven latest `EXPIRED` copies that key onto the next checkout; a later explicit cancel or completion does not; unacknowledged evaluate does not enter the denominator; duplicate acknowledgement writes one presented event and consumes no second sequence; a duplicate acknowledgement after `closed_at` is set returns that existing presented event and adds no sequence or denominator; a new receipt with no presented event on a closed head is rejected; completion replay after closure returns the existing completion and inserts no second event; a closed head with no completion event is an invariant violation and is not repaired by a late append; Pay-before-ack keeps the presented sequence first; segment reads presented Reviews only; one completion event per journey on both normal and recovery materialization; revisit does not add a denominator; equal event timestamps order by journey sequence; half-open window; report cutoff uses `occurred_at` only |
| Persistence concurrency | Two complimentary activations; two first-order reservations sharing one guard when the winner is a pair; last cap unit; payment retry after `RELEASED`; composite snapshot-line foreign key rejects a cross-snapshot `snapshot_line_id`; payment binding racing `reconcileGuestCartWithCustomer` finishes without a deadlock; two transactions initialize one missing measurement head without a unique-violation abort; one acknowledgement and one Pay fallback race, leave exactly one presentation event, both complete, and keep a deterministic unique sequence; equal checkout timestamps and random UUID order cannot change predecessor selection; per-cart ordinals strictly increase; a latest `CANCELLED` or `COMPLETED` boundary blocks an older `EXPIRED` continuation; a latest payment-driven `EXPIRED` predecessor keeps the journey key; an active pre-extension checkout is adopted once under the Cart-then-Checkout rule; historical terminal rows are not ordered from UUID or `created_at` |
| HTTP | Cart and checkout share one code; payment body has no coupon mutation; admin 409 and unique-index non-success |
| Browser | Cart, Review, read-only Payment, order detail, narrow viewport, focus rules in the Product Definition |

Current `npm run test:promotions`, `test:promotion-coupons`, and `test:promotion-pricing-parity` remain evidence of the accepted engine this capability reuses. They are not IMP-036J acceptance evidence.

```text
FOUNDER_UAT_REQUIRED = YES
FOUNDER_UAT = NOT_STARTED
```

UAT stays a later R3 gate against an exact accepted implementation candidate. This document does not deploy one.

---

## 31. Decision / ADR / global-architecture assessment

```text
GLOBAL_DECISION_REQUIRED = NO
D383_REQUIRED = NO
ARCH_R24_REQUIRED = NO
NEW_ADR = NO
```

Checked against the escalation examples:

| Would-be trigger | This candidate |
|---|---|
| New deployable service | No |
| New global auth model | No. Existing keys |
| Second pricing authority | No. `buildDirectPricingQuote` / `calculateTax` / `resolveCustomerDeliveryCharge` |
| Second promotion evaluator | No. `evaluatePromotions` and `selectBestCandidate` |
| Generic rules engine | No. Benefit class is a fixed derivation inside the promotion module |
| Transport topology change | No |
| Checkout Snapshot ownership change | No. Added sealed fields, a line origin, and a snapshot-local composite foreign key. Insert-only snapshot remains the purchased truth |
| New analytics platform, queue, broker, or generic rules engine | No. Measurement is an append-only projection in the existing PostgreSQL database, written in the existing `customer-commerce` process and in the existing Order-materialization transaction, joined on an opaque journey key |
| New façade route | One measurement route, `POST /api/v1/checkouts/{checkoutId}/review-presented`, on the existing `/api/v1/*` façade. It accepts an opaque server-issued receipt id, checks the owning customer session, and writes no price. It does not add a Server Action, a Next route handler, a second backend, or an analytics service |
| New fields, migration, façade route extensions, benefit types, capability-specific tables and unique indexes | Yes. The guard table, the review evaluation receipt table, the measurement head and event tables, the snapshot candidate key, and `checkouts.cart_checkout_ordinal` are those examples. The ordinal is read only to choose this capability's latest Checkout predecessor. It does not redefine checkout identity, revision, status, payment, or Order materialization for the rest of the platform. They do **not** by themselves require a global ARCH bump |
| Repository-wide checkout creation order | No. Causal order is allocated under the existing per-cart lock inside `startCheckout` and is consumed by IMP-036J journey continuity. It is not a new global ordering service |

D-382 remains the sequencing authority. FD-036J-01, FD-036J-02, and FD-036J-03 remain Product Definition decisions. They are not copied into the Decision Register by this candidate. Candidate 4 re-checked the two new mechanisms against the same escalation examples. Conflict-safe head initialization is PostgreSQL concurrency inside the existing measurement projection. The per-cart ordinal is a Checkout column for this capability. Candidate 5 corrects only the locked append order: the event-specific idempotency re-read precedes closed-head rejection of a new fact. That ordering stays inside the same PostgreSQL measurement projection. None of these adds a service, a queue, a broker, an auth model, or a second Pricing or Promotion authority.

No D-383 is created. ARCH-R23 stays current.

---

## 32. Fit result persisted by this lock

Candidate 5 recorded this fit result. Independent review `5347761109` accepted it. This lock
persists that result without changing the fit semantics above.

```text
ARCHITECTURE_FIT_CANDIDATE_RESULT = PASS
ARCHITECTURE_FIT_SOURCE_CANDIDATE = IMP-036J-FIT-CANDIDATE-5
MANDATORY_STORIES_FITTED = US-036J-001 .. US-036J-013
EXPERIENCE_FITTED = XD-IMP-036J-DRAFT-6
CONTRADICTIONS = NONE
PRODUCT_DECISION_REQUIRED = NONE
GLOBAL_DECISION_REQUIRED = NO
```

Every mandatory story has a safe fit inside the accepted Promotion, Pricing, Cart, Checkout Snapshot, Order, Catalog, and Availability authorities. The approved Experience Definition's presentation facts and X3 measurement contract fit inside the same authorities, using the purchase-level guard, the snapshot-local foreign key, presented-Review measurement, Order-materialization completion, the customer-before-cart lock order, conflict-safe measurement-head initialization, per-cart checkout causal order, and closed-head replay that returns an existing fact before it rejects a new fact. Product and Experience semantics are unchanged. `PD-IMP-036J-DRAFT-6` and `XD-IMP-036J-DRAFT-6` are not modified.

```text
IMP036J_ARCHITECTURE_FIT = PASS
IMP036J_ARCHITECTURE_LOCKED = YES
IMP036J_DESIGN_READINESS = NOT_PERFORMED
QUALITY_TEST_PLAN_FINALIZED = NO
MEASUREMENT_INSTRUMENTATION_PLAN_FINALIZED = NO
IMPLEMENTATION_PLAN = NOT_PERFORMED
IMP036J_IMPLEMENTATION_AUTHORIZED = NO
IMP036J_STARTED = NO
IMP036J_IMPLEMENTATION_STARTED = NO
IMP036J_NEXT_GATE = DESIGN_READINESS
```

The architecture-fit proof plan in section 30 does not finalize the Quality/Test Plan. The X3
measurement architecture in section 27A does not finalize the Measurement/Instrumentation Plan.
Those plans remain part of Design Readiness. This lock does not authorize or start implementation.

```text
CANONICAL_GLOBAL_ARCHITECTURE_CHANGED = NO
ARCHITECTURE = ARCH-R23
DECISION_REGISTER = DR-23
D-383 = NOT_CREATED
NEW_ADR = NO
IMPLEMENTATION_STARTED = NO
```
