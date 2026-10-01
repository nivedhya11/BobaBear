<!-- governance-meta
{
  "status": "CANDIDATE",
  "authority": "IMPLEMENTATION_EXECUTION_PLAN",
  "capability": "IMP-036J",
  "candidateId": "IMP-036J-PLAN-CANDIDATE-1",
  "productDefinition": "PD-IMP-036J-DRAFT-6",
  "experienceDefinition": "XD-IMP-036J-DRAFT-6",
  "architecture": "ARCH-R23",
  "architectureSource": "IMP-036J-FIT-CANDIDATE-9",
  "designReadinessSource": "IMP-036J-DESIGN-CANDIDATE-2",
  "qualityPlanSource": "IMP-036J-QUALITY-CANDIDATE-2",
  "measurementPlanSource": "IMP-036J-MEASUREMENT-CANDIDATE-2",
  "implementationPlan": "CANDIDATE",
  "implementationAuthorized": false,
  "implementationStarted": false,
  "implementationComplete": false,
  "authoritative": false
}
-->

# IMP-036J — Implementation Execution Plan

```text
PLAN_CANDIDATE = IMP-036J-PLAN-CANDIDATE-1
AUTHORITY = IMPLEMENTATION_EXECUTION_PLAN
AUTHORITATIVE = NO
CAPABILITY = IMP-036J — Promotions, Coupons & Offers
PRODUCT_DEFINITION = PD-IMP-036J-DRAFT-6
EXPERIENCE_DEFINITION = XD-IMP-036J-DRAFT-6
ARCHITECTURE_SOURCE = IMP-036J-FIT-CANDIDATE-9
DESIGN_READINESS_SOURCE = IMP-036J-DESIGN-CANDIDATE-2
QUALITY_PLAN_SOURCE = IMP-036J-QUALITY-CANDIDATE-2
MEASUREMENT_PLAN_SOURCE = IMP-036J-MEASUREMENT-CANDIDATE-2
IMPLEMENTATION_PLAN = CANDIDATE
IMPLEMENTATION_AUTHORIZED = NO
IMPLEMENTATION_STARTED = NO
IMPLEMENTATION_COMPLETE = NO
IMP036J_ACCEPTED = NO
PROOF_EXECUTED = NO
READY_FOR_IMPLEMENTATION_AUTHORIZATION = YES
OPEN_MATERIAL_DECISIONS = NONE
ARCH_R23 = UNCHANGED
DR_23 = UNCHANGED
D-383 = NO
ARCH-R24 = NO
NEW_ADR = NO
NEW_SERVICE = NO
NEW_ROLE = NO
NEW_PERMISSION = NO
```

This document is a non-authoritative implementation-plan candidate. It uses the existing
`IMPLEMENTATION_EXECUTION_PLAN` convention. It is not Product Definition, Experience Definition,
architecture, a Decision Register entry, acceptance, or implementation authorization.

Independent review and later persistence may adopt this candidate. Until that happens,
ROADMAP and STATE remain the lifecycle authority, and they still record
`IMPLEMENTATION_PLAN = NOT_PERFORMED` and `IMP036J_IMPLEMENTATION_AUTHORIZED = NO`.
Product Definition story rows stay `NOT_READY_FOR_IMPLEMENTATION` for the same reason.
This candidate does not rewrite those rows.

Product, Experience, locked architecture, Design Readiness, the Quality/Test Plan, and the
Measurement/Instrumentation Plan stay binding. This plan sequences their implementation.
It does not reopen them.

---

## 0. Authorization boundary

```text
IMPLEMENTATION_PLAN_GATE = CANDIDATE_PREPARATION
IMPLEMENTATION_AUTHORIZED = NO
IMPLEMENTATION_STARTED = NO
RUNTIME_CHANGE_AUTHORIZED = NO
SCHEMA_MIGRATION_AUTHORIZED = NO
MIGRATION_WRITTEN_BY_THIS_CANDIDATE = NO
```

Later authorized tranches may implement only `PD-IMP-036J-DRAFT-6`, `XD-IMP-036J-DRAFT-6`,
locked `IMP-036J-FIT-CANDIDATE-9`, Design Readiness `IMP-036J-DESIGN-CANDIDATE-2`,
Quality Plan `IMP-036J-QUALITY-CANDIDATE-2`, and Measurement Plan
`IMP-036J-MEASUREMENT-CANDIDATE-2`.

Not authorized by this candidate:

```text
Product or Experience semantic change
ARCH-R23 / DR-23 / D-383 / ARCH-R24 / a new ADR
new service, queue, auth model, role, or permission
second money engine, second Promotion evaluator, or second Pricing engine
writing or running a migration in the planning pull request
implementation start
Founder UAT
formal acceptance
acceptedThrough advancement
```

A material product, experience, architecture, permission, monetary, or persistence conflict
stops affected work. This candidate does not resolve that class of conflict by an
implementation choice.

---

## 1. Verified source authority

Verified on canonical `main` before this candidate was written:

```text
REPOSITORY = nivedhya11/BobaBear
CANONICAL_PATH = /home/ajoshi/repos/boba-bear-platform
MAIN_HEAD = 182ec61935215057df37de9c806113c6a8abd380
MAIN_TREE = a2da68d286714dbd9d31f18b5411ba09799bd628
ROADMAP = GTM-R174
STATE = STATE-R172
ARCHITECTURE = ARCH-R23
DECISION_REGISTER = DR-23
PRODUCT_DELIVERY = PD-2
EXPERIENCE_STANDARD = EXP-1
PRODUCT_LANGUAGE = LANG-1
TESTING_POLICY = TEST-1
ACCEPTED_THROUGH = IMP-036I
CURRENT_PRODUCT_SLICE = IMP-036J
NEXT_PRODUCT_SLICE = IMP-037
SOURCE_DRIFT = NO
```

Binding identities match section 0. Next gate on ROADMAP/STATE is `IMPLEMENTATION_PLAN`.
Formal lifecycle stays `ARCHITECTURE_LOCKED`.

---

## 2. Definition of Ready assessment

PD-2 requires every applicable field to be known, and open material decisions to be none,
before a story may enter implementation. This candidate evaluates that question. It does
not enter implementation.

| Field | Result |
|---|---|
| `STORY_IDENTITY` | KNOWN. `US-036J-001` … `US-036J-013` |
| `ACCEPTANCE_SCENARIOS` | KNOWN. 40 mandatory scenarios, `AC-036J-001-01` … `AC-036J-013-04` |
| `BUSINESS_RULES` | KNOWN. `BR-036J-001` … `BR-036J-014` |
| `EXPERIENCE_REQUIREMENTS` | KNOWN. `XR-IMP-036J-001` … `XR-IMP-036J-013` |
| `PERMISSIONS` | KNOWN. Existing `promotions.read`, `promotions.manage`, `promotions.activate`, `promotions.audit.read`, `coupons.read`, `coupons.manage`. No new key |
| `DATA_IMPLICATIONS` | KNOWN. Locked commercial schema in architecture section 24, plus the Measurement Plan's selected relations in its section 4 |
| `SECURITY_IMPLICATIONS` | KNOWN. CR2 boundaries in the Quality Plan and Measurement Plan section 12 |
| `ARCHITECTURE_FIT` | KNOWN. PASS, locked, `IMP-036J-FIT-CANDIDATE-9` |
| `DESIGN_READINESS` | KNOWN. PASS, `IMP-036J-DESIGN-CANDIDATE-2` |
| `QUALITY_PLAN` | KNOWN. Finalized `IMP-036J-QUALITY-CANDIDATE-2`. `PROOF_EXECUTED = NO` |
| `MEASUREMENT_INTENT` | KNOWN. Finalized `IMP-036J-MEASUREMENT-CANDIDATE-2` |
| `OPEN_MATERIAL_DECISIONS` | NONE |

```text
READY_FOR_IMPLEMENTATION_AUTHORIZATION = YES
IMPLEMENTATION_AUTHORIZED = NO
```

`READY_FOR_IMPLEMENTATION_AUTHORIZATION` means a later human authorization can proceed
without a missing material decision. It is not that authorization. Product Definition
story readiness stays `NOT_READY_FOR_IMPLEMENTATION` until lifecycle authority records
the Implementation Plan as performed and implementation as authorized.

---

## 3. Locked invariants the plan must implement

Money:

```text
AUTHORITATIVE_MONEY = SERVER_COMMERCIAL_EVALUATION
BROWSER_MONEY_AUTHORITY = NO
BROWSER_PRESENTATION_OBSERVER = YES
BROWSER_INTEGRITY_AUTHORITY = NO
SERVER_EXPECTED_TRUTH = YES
OBSERVED_RENDERED_AMOUNT_SETS_PAYABLE = NO
```

The browser may format server paise with the existing formatter and may report the text
it actually committed. It must not calculate eligibility, savings, remaining threshold,
delivery price, or integrity, and it must not supply the expected descriptor.

Cart and checkout presentation, from Design Readiness:

```text
PRECHECKOUT_CART_FINAL_PAYABLE = NO
NORMAL_CART_LABEL = Estimated subtotal
TOTAL_PAYABLE_ON_INCOMPLETE_CART = PROHIBITED
DELIVERY_AMOUNT_INVENTED_ON_CART = NO
PAYMENT_COUPON_MUTATION = NO
```

A reused Checkout evaluation may appear on Cart only when an active checkout already has
a selected fulfilment mode, `sourceCartRevision` matches the current cart, and a current
Checkout evaluation exists. That figure is `COPY-CURRENT-CHECKOUT-TOTAL`. It is current
evaluated checkout money, not purchased truth, and it is not labeled Total payable.

Review is the authoritative pre-payment commercial-review presentation. Coupon mutation
exists on Cart and on Checkout Review over `carts.manual_coupon_code` only. Payment has
no Apply, Change, or Remove control in the focus or tab order.

Confirmation, order detail, and history render sealed Checkout Snapshot truth. Live Offer
evaluation does not rewrite purchased savings or a purchased complimentary line.

Customer information architecture does not add an Offers browse hub, a marketing
destination, a promotions route, fake urgency, a fake crossed-out price, an invented
saving, or a customer gift picker.

Measurement identities stay the ones already selected. This plan does not rename them:

```text
checkouts.checkout_journey_key
checkouts.cart_causal_ordinal
checkout_journey_heads
checkout_journey_facts
commercial_evaluations
commercial_presentation_observations
offer_result_views
cart_checkout_activations
checkout_review_surface_tokens
commercial_command_origins
commercial_command_results
measurement_report_snapshots
```

Collection stays on `customer-commerce`, writing through existing `/api/v1/*`. Calendar
is `Asia/Kolkata`. Windows are half-open 28 civil days. `REPORT_AS_OF` is an input of
one published calculation, not a checkout column. Retention stays the existing commerce
analytics retention. No new numeric retention period, success target, experiment,
abandonment timeout, release table, queue, or analytics vendor.

Primary metric remains:

```text
CHECKOUT_REVIEW_TO_SUCCESSFUL_DIRECT_ORDER_COMPLETION_RATE
```

One qualifying cohort-entry Review per journey. Cohort entry is the `REVIEW_PRESENTED`
fact with the lowest `journey_sequence` for that key.

Commercial-change provenance:

```text
NEW_REVIEW_RESULT_WITH_A_DIFFERENT_AUTHORITATIVE_FINGERPRINT
+ AT_LEAST_ONE_SOURCE_ORIGIN
SAME_OPERATION_RETRY = RETURN_EXISTING_OBSERVATION
ONE_ORIGIN_MULTIPLE_CHANGE_OBSERVATIONS = NO
ONE_RESULT_MULTIPLE_ORIGINS = ONE_CHANGE_OBSERVATION
NO_OP_WRITE = NO_CHANGE_ORIGIN
CLOSED_JOURNEY_NEW_CHANGE = REJECT
CLOSED_JOURNEY_REPLAY = RETURN_EXISTING_OBSERVATION
```

Allowed origin kinds, and only when the command changes the commercial revision:
`COUPON_APPLY`, `COUPON_REPLACE`, `COUPON_REMOVE`, `FULFILMENT_CHANGE`, `STALE_RECOVERY`.
A quantity edit is not an origin.

Cart activation grain:

```text
ONE_GENUINE_CART_SURFACE_CHECKOUT_ACTIVATION
CART_ACTIVATION_IDENTITY = activation_id
```

New genuine activation mints a distinct id. The same activation's network retry reuses
it. Repaint is not an activation. Direct Checkout entry is excluded. A reused active
Checkout associates the activation with that existing journey. A new Checkout associates
it with the new journey. Association failure leaves the activation denominator-only.
Several distinct activations may share one journey. A historical Review whose sequence
is less than or equal to the activation watermark does not satisfy that activation.
Ingestion order, cart identity alone, timestamp guessing, and "any Review on the journey"
are not the causal rule.

Canonical customer lock order stays architecture section 10A:

```text
CUSTOMER_AUTH_USER → CART → CHECKOUT → PAYMENT → ATTEMPT
→ PROMOTIONS / COUPONS → CLAIMS / FIRST_ORDER_GUARD
→ MEASUREMENT HEAD, only after those commerce locks
```

A transaction that will lock the customer must not already hold the cart or checkout.
A presentation-only observation does not lock the customer, cart, or checkout.
Measurement-head lock does not precede the customer or the cart.

---

## 4. Tranche dependency graph

Eight tranches. Count follows the dependency cuts already required by locked schema,
evaluation, command provenance, presentation, operator authoring, and reporting. It is
not a target count.

| Tranche | Identity | Depends on | Independently green on main after merge |
|---|---|---|---|
| 1 | `COMMERCIAL_PERSISTENCE` | Implementation authorization | Yes. Additive schema. Existing behaviour unchanged |
| 2 | `MEASUREMENT_PERSISTENCE` | 1 only for journal order | Yes. Additive schema. No writers yet |
| 3 | `COMMERCIAL_EVALUATION` | 1 | Yes. Domain functions and quote projection. No new customer route |
| 4 | `COMMERCIAL_COMMANDS` | 1, 2, 3 | Yes. Existing routes gain the locked command behaviour. Customer pages may still show the previous presentation until tranche 5 |
| 5 | `CUSTOMER_PRESENTATION` | 4 | Yes. Customer surfaces render server results and post committed observations |
| 6 | `WORKFORCE_AUTHORING` | 1, 3, and 4 | Yes. May merge beside 5. Must not merge before command enforcement |
| 7 | `MEASUREMENT_REPORTING` | 2, 4, and 5 | Yes. Read-only published calculation over stored facts |
| 8 | `INTEGRATION_HARDENING` | 1–7 | Evidence and same-scope fixes only |

```text
T1 commercial schema
T2 measurement schema          (after T1 so migration journal order is serial)
T3 evaluation                  (after T1; parallel with T2 is not required)
T4 commands                    (after T1, T2, T3)
T5 customer presentation       (after T4)
T6 workforce                   (after T1, T3, and T4; parallel with T5 only)
T7 reporting                   (after T4 and T5 writers exist)
T8 integration                 (after T1–T7)
```

T2 does not read commercial promotion columns. It follows T1 so the next migration
identity stays a single forward chain. T6 does not call customer checkout and does
not wait on customer presentation. It does wait on tranche 4. An operator must not be
able to activate a first-order Offer, a capped Offer, a delivery waiver, or a
complimentary item until the purchase predicate, cap enforcement, complimentary
unavailability rejection, and snapshot sealing for that line are already on `main`.
Draft authoring ships in the same tranche as activation, so an earlier deploy cannot
activate those fields.

Each tranche keeps `main` valid: new SQL is forward-only and additive; new routes reuse
existing façades; a tranche does not ship a customer control whose server command is
absent; Payment never gains a coupon control in an intermediate tranche.

Primary story ownership:

| Tranche | Primary stories |
|---|---|
| 1 | Persistence for later stories. No customer or operator UI |
| 2 | Measurement storage for later stories. No customer UI |
| 3 | Commercial outcomes for `US-036J-001`, `US-036J-003`, `US-036J-004`, `US-036J-006`, `US-036J-009`, `US-036J-010`, and the quote half of `US-036J-013` |
| 4 | Command half of `US-036J-002`, plus `US-036J-005`, the timing recompute of `US-036J-006`, `US-036J-008`, and the pre-payment unavailability half of `US-036J-013` |
| 5 | Customer presentation for `US-036J-001`, `US-036J-002`, `US-036J-007`, `US-036J-011`, and purchased `US-036J-013` |
| 6 | `US-036J-012` |
| 7 | No product story. Measurement formulas over facts the earlier tranches wrote |
| 8 | `US-036J-001` … `US-036J-013` re-proved together |

A story named on more than one row is split by acceptance scenario. Each mandatory
scenario still has one primary tranche.

---

## 5. Primary acceptance-scenario and experience ownership

Every mandatory scenario has one primary tranche in 3, 4, 5, or 6. Tranches 1, 2, and 7
have no primary scenario. Tranche 8 re-proves the full set and is not a primary owner.

Where a Quality Plan row names a browser or accessibility layer and the primary owner is
an earlier tranche, tranche 5 or 6 must still execute that layer as supporting proof.
Supporting proof does not create a second primary owner.

```text
PRIMARY_AC_OWNERSHIP_START
MANDATORY_AC_COUNT = 40
TRANCHE_1_PRIMARY_ACS = NONE
TRANCHE_2_PRIMARY_ACS = NONE
TRANCHE_3_PRIMARY_ACS = AC-036J-001-02, AC-036J-003-01, AC-036J-003-02, AC-036J-004-01, AC-036J-006-01, AC-036J-009-01, AC-036J-009-02, AC-036J-009-03, AC-036J-009-04, AC-036J-010-01, AC-036J-010-02, AC-036J-010-03, AC-036J-010-04, AC-036J-013-01, AC-036J-013-04
TRANCHE_4_PRIMARY_ACS = AC-036J-002-01, AC-036J-002-02, AC-036J-002-03, AC-036J-002-05, AC-036J-002-06, AC-036J-002-07, AC-036J-002-08, AC-036J-005-01, AC-036J-005-02, AC-036J-006-02, AC-036J-008-01, AC-036J-013-03
TRANCHE_5_PRIMARY_ACS = AC-036J-001-01, AC-036J-002-04, AC-036J-002-09, AC-036J-002-10, AC-036J-007-01, AC-036J-011-01, AC-036J-013-02
TRANCHE_6_PRIMARY_ACS = AC-036J-012-01, AC-036J-012-02, AC-036J-012-03, AC-036J-012-04, AC-036J-012-05, AC-036J-012-06
TRANCHE_7_PRIMARY_ACS = NONE
TRANCHE_8_PRIMARY_ACS = INTEGRATION_REPROOF
TRANCHE_8_ROLE = INTEGRATION_REPROOF
PRIMARY_AC_OWNERSHIP_END
```

Ownership count: tranche 3 holds 15, tranche 4 holds 12, tranche 5 holds 7, tranche 6
holds 6. Union is the 40 Quality Plan rows. Intersection is empty.

Supporting browser, component, and accessibility proof, not a second primary, is required
in tranche 5 for every tranche 3 or tranche 4 scenario whose Quality Plan row names those
layers: `AC-036J-001-02`, `AC-036J-002-01`, `AC-036J-002-02`, `AC-036J-002-03`,
`AC-036J-002-05`, `AC-036J-002-06`, `AC-036J-002-07`, `AC-036J-002-08`,
`AC-036J-003-01`, `AC-036J-003-02`, `AC-036J-004-01`, `AC-036J-006-01`,
`AC-036J-008-01`, `AC-036J-009-01`, `AC-036J-009-02`, `AC-036J-009-03`,
`AC-036J-009-04`, `AC-036J-010-01`, `AC-036J-010-04`, `AC-036J-013-01`,
`AC-036J-013-03`, and `AC-036J-013-04`. `AC-036J-010-02` and `AC-036J-010-03` are
domain-only. `AC-036J-005-01`, `AC-036J-005-02`, and `AC-036J-006-02` are proved in
tranche 4 without a customer sentence.

Experience requirements:

| Requirement | Primary tranche | What the owner must make true |
|---|---|---|
| `XR-IMP-036J-001` | 5 | Applied automatic saving is visible without an activate control and without engine words. Tranche 3 supplies the evaluated result |
| `XR-IMP-036J-002` | 5 | Cart and Review share one coupon interaction. Payment does not mutate. Tranche 4 owns the single stored code |
| `XR-IMP-036J-003` | 5 | Threshold copy uses the server gap. Tranche 3 owns that gap. The client does not subtract |
| `XR-IMP-036J-004` | 5 | Order saving, real delivery saving, total saved, and payable read as one model. Tranche 3 owns the component equality |
| `XR-IMP-036J-005` | 5 | The three equal-payable and strictly-lower sentences match the three server classes and are not swapped |
| `XR-IMP-036J-006` | 5 | One no-choice included line. No picker, carousel, or coupon-won sentence on a complimentary tie |
| `XR-IMP-036J-007` | 5 | Stale revalidation returns focus to the Review explanation and the new server total. Tranche 4 refuses the old bind |
| `XR-IMP-036J-008` | 5 | Confirmation and detail match the sealed split and included line. No live progress on purchased truth |
| `XR-IMP-036J-009` | 6 | Existing editor authors, denies, and reports a lost complimentary race as non-success |
| `XR-IMP-036J-010` | 5 | Narrow Cart sticky label, Review order, focus rules, and non-colour status |
| `XR-IMP-036J-011` | 5 | Failure copy stays coarse. Tranche 4 responses must not add a near-match, cap size, or other customers |
| `XR-IMP-036J-012` | 5 | First-order absence and the mode clause only. Pickup does not show a delivery saving |
| `XR-IMP-036J-013` | 5 | Included line at ₹0 with no better-price sentence |

`APPLICABLE_XR_COUNT = 13`. Each has one primary tranche.

Business-rule implementation map, still one rule text in the Product Definition:

| Rule | Implementing tranches |
|---|---|
| `BR-036J-001` | 3, 6 |
| `BR-036J-002` | 3, 6 |
| `BR-036J-003` | 3, 4 |
| `BR-036J-004` | 3, 5 |
| `BR-036J-005` | 4, 5 |
| `BR-036J-006` | 4 |
| `BR-036J-007` | 3, 4 |
| `BR-036J-008` | 3 |
| `BR-036J-009` | 3, 4 |
| `BR-036J-010` | 4, 6 |
| `BR-036J-011` | 3, 6 |
| `BR-036J-012` | 3, and a stop condition on every tranche |
| `BR-036J-013` | 4, 5 |
| `BR-036J-014` | 3, 4, 5, 6 |

---

## 6. Schema and migration plan

No migration file is written by this candidate.

Resolved tip on the verified main journal `drizzle/meta/_journal.json`:

```text
LATEST_JOURNAL_IDX = 46
LATEST_MIGRATION_TAG = 0046_imp036i_tranche4_cancellation_reminder
```

At implementation time, re-read that journal. If a later entry exists, allocate after
that later tip and stop if the collision cannot be resolved by the next free index.
Do not reuse 0046. The identities planned against this tip are:

```text
TRANCHE_1_MIGRATION = next journal index after the then-current tip
EXPECTED_AGAINST_THIS_TIP = idx 47, tag prefix 0047_
TRANCHE_2_MIGRATION = the following index
EXPECTED_AGAINST_THIS_TIP = idx 48, tag prefix 0048_
```

The drizzle tag suffix is chosen when the migration is generated. This plan does not
invent that suffix. Both migrations are forward-only. There is no down migration and no
backfill.

### Tranche 1 commercial migration

Adds only the commercial shapes in architecture section 24:

- `promotions.first_order_only`, `eligible_fulfilment_modes`, `eligible_fulfilment_timings`, `maximum_redemptions`, `maximum_redemptions_per_customer`, `complimentary_item`, with the checks and the partial unique index `promotions_one_active_complimentary_per_brand_uidx`.
- `promotion_benefits` types `delivery_fee_waiver` and `complimentary_item`, the complimentary product and variant foreign keys, and the shape checks that keep percent, fixed, and BOGO columns empty on those rows.
- `app.first_order_purchase_guards` as specified, including the active-row partial unique indexes. Not a column on `promotion_redemption_claims`.
- Checkout Snapshot: nullable `source_cart_line_id` only for complimentary origin, `line_origin`, `promotion_revision` on effects, candidate key `(id, snapshot_id)`, and composite foreign key `checkout_snapshot_promotion_effects_line_ownership_fk`.

Historical rows stay valid. Existing cart lines remain sourced. Existing effects keep a
null `snapshot_line_id` and a null `promotion_revision`. No customer `first_order`
column, gift catalogue, or campaign table.

### Tranche 2 measurement migration

Adds the Measurement Plan section 4 relations and the two checkout columns. Constraints
that must exist before any writer:

- `checkouts.checkout_journey_key` nullable, immutable after assignment in application code, not unique across rows.
- unique `(cart_id, cart_causal_ordinal)`.
- `checkout_journey_heads` one row per journey key.
- `checkout_journey_facts` unique `(checkout_journey_key, journey_sequence)` and the section 6 partial unique indexes for each idempotency identity.
- `commercial_evaluations` primary key `evaluation_id`, plus the scoped unique `(cart_id or checkout_id, result_fingerprint, occurrence_ordinal)`.
- `commercial_presentation_observations` unique `(evaluation_id, surface)`.
- `offer_result_views` primary key `evaluation_id`.
- `cart_checkout_activations` primary key `activation_id`.
- `checkout_review_surface_tokens` unique `token_sha256`. Plaintext token is not a column.
- `commercial_command_origins` unique `source_command_id`.
- `commercial_command_results` unique `source_command_id`. Journey key is not a foreign key.
- `measurement_report_snapshots` unique `(metric, window_start, window_end, report_as_of)`, insert-only.

`commercial_evaluations` stores `projected_complimentary_line_sha256`, not the plaintext
line. `commercial_presentation_observations` stores `observed_complimentary_line_sha256`,
not the plaintext line. Neither table stores raw coupon text, a private eligibility
reason, a payment secret, customer or guest identity, a bearer, a verifier, a session
subject, or a client integrity boolean.

Existing checkouts keep a null journey key and a null ordinal. No historical journey is
invented.

### Deployment order

Ship tranche 1 and apply its migration before any code that writes the new commercial
columns. Ship tranche 2 and apply its migration before tranche 4 command writers and
before tranche 5 observation writers. A process that starts writers before the matching
migration is a failed deploy, not a compatibility shim. No feature flag is introduced to
paper over that order.

---

## 7. Module change inventory

Bounded groups. Paths are the current owners. A tranche may touch a file only for the
behaviour that tranche owns.

| Group | Current home | Tranches |
|---|---|---|
| Promotion and snapshot schema | `src/platform/database/schema/promotions.ts`, `src/platform/database/schema/checkout.ts`, `drizzle/` | 1 |
| Measurement schema | new tables beside existing schema modules under `src/platform/database/schema/`, plus `checkouts` columns in `src/platform/database/schema/checkout.ts` | 2 |
| Commercial evaluation | `src/shared/promotions/select.ts`, `evaluate.ts`, `benefit.ts`, `eligibility.ts`, `types.ts`, `src/server/pricing/quote.ts`, `src/server/promotions/load-for-evaluation.ts` | 3 |
| Cart coupon and cart quote | `src/server/cart/operations.ts`, `src/server/cart/evaluate.ts` | 4 |
| Checkout and payment bind | `src/server/checkout/operations.ts`, `src/server/checkout/prepare.ts`, `src/server/payment/operations.ts`, `src/server/payment/redemption.ts` | 4 |
| Customer façade | `src/server/customer-commerce/http/router.ts` | 4, 5 |
| Customer Cart | `src/components/ordering/CartClient.tsx`, `CartSummary.tsx`, `cart-presentation.ts`, `StickyCartBar.tsx` unchanged except it stays estimated-only | 5 |
| Customer Review and Payment | `CheckoutClient.tsx`, `CheckoutReviewSections.tsx`, `PaymentPanel.tsx` | 5 |
| Purchased truth | `OrderConfirmationClient.tsx`, `OrderDetailClient.tsx`, `OrderHistoryClient.tsx`, `checkout-snapshot-presentation.ts` | 5 |
| Operator commands | `src/server/promotions/promotions.ts`, `src/server/operations/http/admin-promotions-routes.ts`, `src/lib/administration/commercial-promotions.ts` | 6 |
| Operator surface | `src/components/administration/commercial/PromotionsEditor.tsx` | 6 |
| Measurement writes and reports | customer-commerce module that owns the commerce observation route and the report snapshot writer. No new service package | 4, 5, 7 |

`StickyCartBar` stays "Estimated subtotal" and gains no Offer treatment, as Design
Readiness already requires.

Menu and Home gain no promotions destination.

---

## 8. Tranche 3 — commercial evaluation

Goal: one server evaluation produces the selected combination, the explanation class,
the threshold gap, and the complimentary projection. The browser is not involved.

Work:

- Extend `buildPromotionCandidates` so benefit class comes from the benefit row, including `delivery_fee_waiver` and `complimentary_item`.
- Keep one selector. `selectBestCandidate` compares final payable of valid compatible combinations, not merchandise saving alone.
- Stacking stays one primary merchandise or order Offer plus one compatible delivery incentive. Complimentary occupies the primary merchandise or order position. BOGO does not stack with another merchandise discount.
- Equal payable follows the three locked classes. Complimentary equal-payable still selects the complimentary combination.
- `NONE_CHOSEN` when two complimentary items both qualify. Neither line is projected.
- Threshold progress is server paise plus server benefit text. Absent amount or absent benefit produces no progress.
- Out-of-window Offers are omitted. Mode and timing filters read the new promotion columns. Null mode or null timing means all accepted values.
- Standing tariff ₹0 is not a delivery saving and is not an Offer.
- First-order and per-customer gates that need an authenticated customer are classified, not decided in the browser. The purchase-existence query itself is tranche 4, because it reads orders and payments.

Money boundary: this tranche is the server calculation. It returns paise integers and reason classes. It does not accept a client amount, a client savings figure, or a client integrity flag.

Primary proof is domain tests for the tranche 3 scenarios. Database fixtures only where the quote loader reads real rows. Browser proof of the same scenarios is supporting proof in tranche 5.

---

## 9. Tranche 4 — commercial commands

Goal: existing cart, checkout, and payment commands apply the evaluation, keep one coupon
state, refuse a stale bind, and write command provenance inside the same transaction.

### Coupon state

`POST /api/v1/cart/coupon` and `POST /api/v1/cart/coupon/remove` remain the only coupon
mutations. Checkout Review calls those same routes. There is no Review-only code column
and no Payment coupon field.

Replace is the apply route when a different code is stored and the command changes the
cart revision. The server sets `origin_kind`. The client does not send the kind. The
same code with no revision change is a no-op: a command-result row may exist, an origin
row does not, and no change fact is written.

Unknown codes write nothing. Stale `expectedRevision` writes nothing. An identity-required
code asks for sign-in and does not store a saving. An unrestricted guest code still
enters the selector. After sign-in, the same stored code is retried by the existing
`claimGuestCart` continuity. When continuity did not keep it, the customer sees the
re-enter sentence in tranche 5, not a false applied state.

`evaluateCheckout` treats `VALID_BUT_NOT_SELECTED` as an explanation class. It does not
throw `CHECKOUT_COUPON_INELIGIBLE` for that class.

### Payment and purchased seal

`prepareCheckoutForPayment` re-runs the quote before bind, inside its own transaction,
and returns `CHECKOUT_REPRICED` when the prior total or the prior complimentary line is
no longer valid. It does not bind the stale snapshot. Unavailable complimentary drops
the Offer, leaves Review, and does not substitute an item.

The binding transaction follows section 10A. First-order predicate is re-read under the
customer lock before the guard insert. Failed, cancelled, expired, and abandoned
payments do not consume eligibility. A later cancellation of a successful purchase does
not restore it. Zero-payable completion inserts the guard as `CONSUMED`. No other
command writes `first_order_purchase_guards`.

Snapshot sealing writes `promotion_revision`, `line_origin = complimentary_offer` for
the granted line, and the composite line foreign key. Cart lines stay `line_origin = cart`
with a non-null source. Order reads stay snapshot reads.

### Journey key and causal ordinal

Inside `startCheckout`, under the cart lock already held:

- allocate `cart_causal_ordinal` as max for that cart plus one;
- adopt, copy, or mint `checkout_journey_key` using the Candidate 9 continuable
  predecessor rules encoded by the Measurement Plan. `created_at` and checkout UUID
  order are not that order;
- accept optional `cartActivationId` only as association. When the id is a UUID, the
  activation's cart is the cart being started, and the call resolves to this cart's new or
  already-active checkout that already has a journey key, set `checkout_journey_key`,
  `checkout_id`, and `watermark_sequence` to the greatest `journey_sequence` already
  allocated on that key, or `0` when none exists. The activation does not mint the key.
  Missing, malformed, wrong-cart, or unresolvable association does not fail checkout,
  does not change price, and leaves that activation denominator-only.

`evaluateCheckout` and the payment-binding transaction may adopt a key once, only when
they already hold the cart-then-checkout lock. Cart evaluation does not mint or rewrite
the key.

### Measurement writes that belong in the command transaction

These writes are tranche 4, before any customer page depends on them:

- `commercial_evaluations` in the evaluation transaction, with server expected components
  and the projected complimentary digest. The response may include `evaluationId`. It
  does not include the expected descriptor, the fingerprint, or an integrity verdict.
  Fingerprint reuse returns the existing id and does not allocate another ordinal. A
  different fingerprint, including a return to an older one, inserts the next
  `occurrence_ordinal`.
- `checkout_review_surface_tokens` stores only the SHA-256 of a token minted by
  `evaluateCheckout`. A new evaluation inserts. It does not delete earlier rows. The
  plaintext token is returned to the Review client for that navigation and is not stored.
- `commercial_command_origins` in the mutation transaction, before Review evaluation,
  only when the revision changes. Unique `source_command_id`. Same id and same cart
  returns the existing result. Same id and a different cart is denied and writes nothing.
  `cart_origin_ordinal` is allocated under the cart lock and is not `carts.revision`.
- `commercial_command_results` for every finished coupon command, including a no-op and
  an invalid attempt. `occurred_at` is `clock_timestamp()` in that insert. A client
  timestamp is rejected.
- Journey facts that the Measurement Plan assigns to these commands: `COUPON_ATTEMPT`
  when a journey key exists and the command is an attempt the plan counts;
  `COMMERCIAL_STATE_CHANGE` only when a later Review evaluation resolves at least one
  origin onto a new fingerprint; `REVIEW_PRESENTED` is not written by the evaluation
  response. Continue or pay allocates `REVIEW_PRESENTED` before `REVIEW_TO_PAYMENT` or
  `PAYMENT_ATTEMPT` when the observation has not already written it.
- Closed journey: a new fingerprint is rejected and allocates nothing. Replay of an
  existing provenance identity returns the existing fact.
- Several origins that converge on one resulting fingerprint share one change fact.
  Concurrent losers of the unique provenance index return the winner and resolve their
  own already-persisted origins onto it. One origin does not create two change facts.
- `deleteCartById` stays possible. Measurement rows that would block cart delete do not
  use a forbidding foreign key, matching the Measurement Plan.

Guest reconciliation follows the Measurement Plan: `KEEP_CUSTOMER`, equal codes, and a
line-only merge write no origin. Adopting a guest code onto a customer cart that had
none, or `KEEP_GUEST`, writes one new origin on the surviving cart with a newly minted
`source_command_id`. Guest command ids are not copied.

Money boundary: payable, savings, and eligibility come from the server quote. An
observation body cannot change them, and these commands do not read a client amount as
the price. Missing measurement context does not change the price and does not fail a
commercial command that is otherwise valid, except where the Measurement Plan already
rejects a forbidden analytics field by writing nothing for that analytics request.

Primary proof is HTTP, database, and recovery tests for the tranche 4 scenarios,
including real overlapping transactions for cap, first-order, and duplicate
`source_command_id`. Browser proof of copy and focus is supporting proof in tranche 5,
including `COPY-STALE` for `AC-036J-008-01`.

---

## 10. Tranche 5 — customer presentation

Goal: Cart, Review, Payment, confirmation, and detail present the server result under
the Design Readiness rules, and the observation POST reports the committed presentation.

### Surfaces

Cart (`/order/cart`):

- Incomplete context: label `COPY-ESTIMATED-SUBTOTAL`, sentence `COPY-CART-NOT-FINAL`, no delivery amount, no words Total payable, including the mobile bar.
- Reused current checkout evaluation: label `COPY-CURRENT-CHECKOUT-TOTAL` only under the Design Readiness conditions. Delivery appears only when that evaluation returned a delivery amount.
- Coupon field, Apply, Change, and Remove call the tranche 4 cart routes. Pending state keeps the previous amount. A dropped mutation shows `COPY-RETRY` and does not paint a success or an optimistic total.
- Savings, threshold, and the complimentary line render server fields with `formatPaise`. The client does not subtract a threshold, does not choose the winner, and does not invent a strikethrough.

Review (`/order/checkout`):

- Same cart coupon commands and the same code.
- Label `COPY-TOTAL-PAYABLE` for the current evaluation. It is not described as frozen forever.
- Stale recovery shows `COPY-STALE` and the new server amount, with focus on that explanation.
- `COPY-GIFT-GONE` when the complimentary item is unavailable. No substitute line and no picker.
- Direct entry does not send `cartActivationId`.

Payment (`PaymentPanel` and `/order/payment`):

- Read-only explanation from the active snapshot.
- No coupon field, Apply, Change, or Remove, including controls that are hidden but remain in the tab order.
- Revalidation failure leaves Payment for Review. Payment does not accept a coupon body.

Purchased truth:

- Confirmation and `OrderDetailClient` render sealed savings and a complimentary snapshot line.
- `OrderHistoryClient` keeps the sealed grand total. Detail carries the breakdown.
- Neither surface calls live evaluation. Retiring the Offer does not change the stored amounts or remove the purchased line.

Menu `StickyCartBar` stays estimated merchandise subtotal.

Strings are the Design Readiness `COPY-*` sentences. Content QA in this tranche checks
those sentences. Customer copy does not use raw reason tokens, "Promotion candidate",
near-match wording, remaining cap counts, or other customers' facts.

### Presentation observation

After the relevant surface has committed the evaluation to the presented state, the
client reads the committed nodes and posts that reading. It does not copy the evaluate
response into the POST and call that a view.

`POST /api/v1/commerce-observations` is served by `customer-commerce` on the existing
façade. Auth is the existing cart credential or customer session that owns the
evaluation. The handler writes no price and does not bump a commercial revision.

The body carries the observed component amounts and texts parsed from the committed
presentation, the observed progress gap as rendered, the observed coarse shape as
rendered, and the complimentary digest computed from the committed line's three text
parts. The server sets `surface` from `reviewSurfaceToken`: a matching stored hash for
this cart's non-terminal checkout means `CHECKOUT_REVIEW`; no token means `CART`. A
client `surface` field is rejected. An `integrityPass` field, a coupon code, a
complimentary variant id, a plaintext item line, a client timestamp, a payment secret,
and a client-supplied expected descriptor are rejected and write nothing.

The server loads the stored expected evaluation and compares. `server_presentation_match`
and `mismatch_flags` are written only by that comparison. Proof cases that must fail the
match:

```text
expected ₹80 rendered as ₹8
omitted saving row
extra saving row
wrong saving component
wrong total saved
```

A same-surface retry returns the existing observation. The first accepted observation
inserts `offer_result_views` for that `evaluation_id`. A later allowed surface inserts
only its integrity row and does not change the counted view. A `CART` observation does
not write `REVIEW_PRESENTED`.

`activation_id` is minted in the Cart Checkout control on click or keyboard and held for
that gesture. The same id is sent on every transport retry of `POST /api/v1/checkouts`.
A later genuine activation mints a new id. Repaint does not. Review sends that id as
`cartActivationId` only while the navigation that opened this Review still holds it.
The server records `CART_REVIEW_REACH` once, with sequence strictly after the activation
watermark. A repeat POST that only returns the existing observation still records the
reach when the body carries a new valid activation id. A historical Review, including
one whose sequence is less than or equal to the watermark, does not satisfy that later
activation. Association failure at start leaves the activation in the denominator only.

Money boundary: displayed amounts are formatted server paise or an explicit waiting
state. The observation cannot set payable. Checkout and payment do not wait on the POST.
A failed POST does not roll back evaluation, checkout, or payment.

Primary proof is component, browser, and accessibility tests for the tranche 5
scenarios, plus the render-integrity cases above. Keyboard proof includes Payment tab
order. Narrow and `lg` viewports cover Cart, Review, and Payment. The sticky Cart bar
uses the same label as the page and does not say Total payable.

---

## 11. Tranche 6 — workforce authoring

Goal: authorized operators configure and activate the new fields on the existing
commercial surface, only after tranche 4 enforces first-order eligibility, caps,
complimentary unavailability, and snapshot sealing.

Existing permissions only. `handleAdminPromotionsRoute` bodies gain the fields the
architecture already names:

- draft accepts first-order, mode, timing, and cap fields, still under promotion revision compare-and-swap;
- benefit accepts `delivery_fee_waiver` and `complimentary_item` with catalog product and variant ids;
- activate maps the partial unique index violation to non-success and `COPY-OP-RACE`. It does not return activated;
- inspect returns redemption counts without customer identifiers;
- coupon lifecycle routes stay unchanged.

`PromotionsEditor` gains those fields. Invalid activate names the field and leaves the
draft. Retire keeps the existing confirm and cancel. Cancel leaves the Offer active.
Confirm shows `COPY-OP-RETIRED`. Complimentary authoring rejects a bundle, a required
choice, or a positive-price modifier choice with `COPY-OP-GIFT-INVALID`. There is no
gift catalogue control and no second admin app.

Concurrency proof is two real transactions activating overlapping complimentary Offers.
At most one stays ACTIVE. The loser's audit row is not committed. Sequential calls do
not satisfy `AC-036J-012-06`.

Cross-brand and missing-permission calls write nothing. A client-supplied role is not
authorization.

Money boundary: operator authoring does not compute a customer payable. Consequence
preview remains a server read of the same evaluator.

---

## 12. Tranche 7 — measurement reporting

Goal: publish the selected formulas from stored facts. This tranche does not collect a
second model and does not change commercial behaviour.

`measurement_report_snapshots` inserts one immutable row per
`(metric, window_start, window_end, report_as_of)`. A repeat returns that row and does
not update it. `REPORT_AS_OF` and `PRODUCTION_RELEASE_ANCHOR` are inputs of that
calculation. The initial window is the half-open 28 civil days in `Asia/Kolkata` that
starts at the supplied anchor. The initial snapshot uses that window's exclusive end as
`REPORT_AS_OF`. A fact whose `occurred_at` equals the cutoff is excluded. Occurrence
time is the stored `clock_timestamp()`, never a client timestamp, ingest time, or
`transaction_timestamp()`. The function lives in `customer-commerce`. Tests supply the
two inputs. This tranche adds no scheduler, cron, queue, release table, customer route,
or operator route.

Primary rate uses one cohort-entry `REVIEW_PRESENTED` per journey key. Numerator is
`DIRECT_ORDER_COMPLETION` before the cutoff. Payment success alone is not the numerator.
A zero denominator is `INSUFFICIENT_EVIDENCE`. No numeric target is stored.

Secondary measures, segments, coupon coarse outcomes, and the integrity ratio follow
Measurement Plan section 11. Support-contact instrumentation stays `UNAVAILABLE`.
Cart-to-Review uses activation grain and the watermark rule, not checkout-row ratios.

No analytics vendor and no new service. No new permission key. Reading a snapshot for a
later operator view is outside this candidate until a locked surface names it.

---

## 13. Tranche 8 — integration, regression, and hardening

Goal: one integrated candidate re-proves the slice. This tranche is not the primary
owner of any scenario. It may repair a defect that blocks that proof when the repair
stays inside the locked contract. A defect that needs a product or architecture change
stops.

Required re-proof:

- all 40 mandatory scenarios and all 13 experience requirements;
- `BR-036J-001` … `BR-036J-014`;
- both Golden Journeys named by the Product Definition, `GJ-FIRST-ORDER` and `GJ-RETURNING-ORDER`, without new journey ids and without an Order Again shortcut;
- migration from the pre-change schema and from empty database, with historical snapshots unchanged;
- real concurrency listed in the Quality Plan, including complimentary activation, last cap unit, first-order guard, duplicate coupon submit, and duplicate observation;
- render integrity mismatches;
- activation and reused-checkout sequencing, including multiple activations on one journey and a historical Review that does not satisfy a later activation;
- privacy rejection of forbidden observation fields;
- no new service, role, permission, queue, or money authority;
- regression of existing checkout, payment, pickup, and scheduled behaviour.

`PROOF_EXECUTED` stays `NO` in this plan. Tranche 8 produces later evidence. It does not
mark this planning candidate as executed proof. Founder UAT stays `NOT_STARTED`. Only the
Founder can give that verdict.

---

## 14. Transaction, concurrency, and idempotency inventory

| Guarantee | Where it lives | What must not be the guarantee |
|---|---|---|
| One active complimentary Offer per brand | Partial unique index, checked inside the activation transaction | An in-memory lock in the editor |
| One active first-order guard per customer and per binding | Partial unique indexes after `customer_auth_users FOR UPDATE` | A browser flag or a customer boolean column |
| Global and per-customer caps | Existing promotion `FOR UPDATE` and claim rows, extended in place | A client remaining count |
| One coupon code | `carts.manual_coupon_code` updated under the cart lock and `expectedRevision` | A second Review column or optimistic local clear |
| Same command retry | Unique `source_command_id` on origins and on results | A server id minted only in the response |
| One change fact for many origins | Unique provenance identity on `checkout_journey_facts`, plus origin resolution onto that fact | Application memory of seen fingerprints |
| One Offer-result view per evaluation | `offer_result_views` primary key | Counting integrity rows |
| One observation per evaluation and surface | Unique `(evaluation_id, surface)` | A client boolean |
| Journey sequence order | `checkout_journey_heads` locked with `FOR UPDATE`, then `clock_timestamp()` in the allocating statement | Ingest order or `transaction_timestamp()` |
| Cart causal order | Unique `(cart_id, cart_causal_ordinal)` allocated under the cart lock | `created_at` or UUID order |
| Closed journey | Reject a new fingerprint; return the existing fact for a replay | A client checkout status |
| Payment retry after release | Existing payment idempotency plus a new reserved claim set, not a second consumption of the released attempt | Replaying the released claim id as success |

`SAME_OPERATION_RETRY = RETURN_EXISTING_OBSERVATION` covers a lost coupon response, a
lost observation POST, and a lost continue action. The caller keeps the id it minted
before the first send.

---

## 15. Security and privacy boundaries

No new auth model. Customer routes keep cart credential or customer session. Operator
routes keep brand scope and the existing promotion and coupon permission keys. A
workforce principal is not a customer principal.

Measurement and explanation must not store or accept, unless the finalized plan already
names the field:

- raw coupon text;
- private eligibility reason;
- payment secret or instrument;
- customer PII, guest identity, bearer, verifier, or session subject;
- client integrity boolean;
- client expected money descriptor;
- plaintext complimentary line.

The complimentary digest is SHA-256 of the canonical line defined by the Measurement
Plan. The plaintext is rendered only on the commerce surface that already shows the
line. It is not copied into analytics columns.

CR2 planning obligations for every implementing tranche that touches the relevant path:

| Obligation | Plan treatment |
|---|---|
| Authorization and resource scope | Existing keys and existing denial. Cross-brand and cross-cart writes do nothing |
| Cross-customer isolation | Observation and command ids are checked against the owning cart or checkout |
| Coupon and replay abuse | Unique command id, no near-match copy, no enumeration in the error body |
| Cap and race bypass | Database locks and unique indexes, not client counts |
| Complimentary activation race | Partial unique index and non-success response |
| Concurrent commercial mutation | Cart lock, revision compare-and-swap, one change fact per provenance identity |
| Stale and retry | Previous state remains until the command commits. Replay returns the stored row |
| Information leakage | Coarse customer sentences. Operator counts without customer ids. Analytics without coupon text |
| Invalid analytics payload | Reject and write nothing |

---

## 16. Accessibility, responsive behaviour, and content

Owned by tranche 5 for customers and tranche 6 for the retire confirmation. Proof
follows the Quality Plan experience section:

- Coupon field accessible name "Coupon".
- Review and Payment section name "Price summary".
- The visible Cart amount label matches the money-truth table.
- Polite status for applied and checking. Alert for invalid, stale, unavailable, and network failure.
- Focus moves to the result after sign-in retry, and to the Review explanation after stale revalidation.
- Viewports below `lg` and at `lg`. The sticky Cart amount is not only below the fold and does not say Total payable.
- Disabled and pending controls stay visible, do not double-submit, and keep the previous amount.
- Status remains available when reduced motion is requested.
- Colour is not the only status signal.
- Operator retire confirmation names the effect on future orders and the non-effect on paid orders.

Customer strings come from Design Readiness. Operator conflict and invalid-gift strings
come from that same copy set. This plan does not invent a second copy catalogue.

---

## 17. Quality Plan evidence mapping

`IMP-036J-QUALITY-CANDIDATE-2` is the proof plan. This section points tranches at it.
It does not create another Quality Plan. `PROOF_EXECUTED = NO`.

| TEST-1 layer | Primary tranche | Later re-proof |
|---|---|---|
| Unit and domain | 3 | 8 |
| Component | 5 and 6 | 8 |
| HTTP and API contract | 4 and 6 | 8 |
| PostgreSQL integration | 1, 2, and 4 | 8 |
| Authorization | 4 and 6 | 8 |
| Real concurrency | 4 and 6 | 8 |
| Recovery and idempotency | 4 and 5 | 8 |
| Accessibility and responsive browser | 5 | 8 |
| Golden Journey | 8 | — |
| Founder UAT | Not this plan | Human, later |

Named Quality Plan risks stay mapped as follows:

- Cart money finality and shared coupon state: tranche 5 presentation, tranche 4 state.
- Payment read-only: tranche 5, `AC-036J-002-09`.
- First-order eligibility: tranche 4.
- Stacking and best candidate: tranche 3.
- Standing zero delivery: tranche 3, `AC-036J-010-04`.
- Stale Review and payment recovery: tranche 4 refusal, tranche 5 copy and focus.
- Complimentary sequential and concurrent activation: tranche 6.
- Complimentary unavailability: tranche 4.
- Purchased-history immutability: tranche 4 seal, tranche 5 read.
- Actual-render money integrity: tranche 5 comparison against stored expected truth.
- Activation and reused checkout: tranche 4 association, tranche 5 reach.
- Retries and concurrent dedup: tranche 4 unique constraints, tranche 5 observation unique key.
- Privacy and forbidden attributes: tranche 5 rejection, tranche 7 storage review.
- Keyboard, focus, and responsive behaviour: tranche 5.

---

## 18. Rollout, compatibility, and rollback

No feature flag, experiment, queue, backfill, or compatibility calculator.

Compatibility that the schema itself requires:

- Existing promotions remain valid with the new booleans defaulting to false and the new arrays null, which means all modes and timings.
- Existing snapshots remain readable. New not-null snapshot fields have defaults that preserve cart-line origin. New effect columns stay null on historical rows.
- Existing checkouts remain readable with a null journey key. New journeys receive a key only through the locked mint and copy rules. Old journeys are not reconstructed.

Rollback before merge is reverting the unmerged tranche pull request. After a migration
has been applied, correction is a later forward migration. It must not rewrite purchased
snapshot money, delete historical effects, or drop a row that a completed order still
references. A partial deploy that runs writers before the matching migration is rolled
forward by applying the migration, not by teaching the application to skip the write
silently.

Temporary constructs are not planned. If an implementation tranche introduces one, that
tranche must name its removal condition before merge. This candidate does not authorize
such a construct in advance.

---

## 19. Exclusions

Still out of this slice, and not implied by a tranche:

- Deals, Campaigns, Revenue Recommendations, loyalty, and experiments;
- a second monetary authority or a second evaluator;
- an Offers browse hub or a new customer promotions route;
- a customer gift picker;
- a product abandonment timeout;
- a numeric success target or a numeric retention period;
- a new analytics service, vendor, role, or permission;
- slot capacity, delivery booking, or a change to IMP-036H or IMP-036I semantics;
- IMP-037 and IMP-038 implementation;
- production cutover, Founder UAT, and formal acceptance.

---

## 20. Implementation stop conditions

Stop the affected tranche and do not invent a local semantic fix when any of these appear:

- canonical Product, Experience, architecture, Design Readiness, Quality Plan, or Measurement Plan has moved in a way that changes accepted semantics (`ARCHITECT_DECISION_REQUIRED`);
- a required behaviour needs a new service, queue, role, permission, facade outside `/api/v1/*` and `/api/admin/v1/*`, or a second money engine (`ARCHITECT_DECISION_REQUIRED`);
- migration journal identity on implementation day is not the expected next index and cannot be re-resolved without colliding (`ENGINEERING_BLOCKED` until re-resolved, unless the collision also changes schema semantics);
- the browser must calculate savings, threshold, delivery, or integrity for a screen to function (`ARCHITECT_DECISION_REQUIRED`);
- observation proof can be satisfied only by echoing the server expected descriptor (`ARCHITECT_DECISION_REQUIRED`);
- unique constraints cannot enforce one change fact, one activation reach, or one active complimentary Offer without a new persistence authority (`ARCHITECT_DECISION_REQUIRED`);
- Payment would need a coupon mutation, or purchased history would need live evaluation (`ARCHITECT_DECISION_REQUIRED`);
- an acceptance scenario has no primary tranche (`ENGINEERING_BLOCKED` on the plan, before code).

Same-scope test failures inside an authorized tranche stay with that tranche. They are
not a new product decision.

---

## 21. Definition of Ready verdict

```text
STORY_IDENTITY = KNOWN
ACCEPTANCE_SCENARIOS = KNOWN
BUSINESS_RULES = KNOWN
EXPERIENCE_REQUIREMENTS = KNOWN
PERMISSIONS = KNOWN
DATA_IMPLICATIONS = KNOWN
SECURITY_IMPLICATIONS = KNOWN
ARCHITECTURE_FIT = KNOWN
DESIGN_READINESS = KNOWN
QUALITY_PLAN = KNOWN
MEASUREMENT_INTENT = KNOWN
OPEN_MATERIAL_DECISIONS = NONE
READY_FOR_IMPLEMENTATION_AUTHORIZATION = YES
IMPLEMENTATION_AUTHORIZED = NO
IMPLEMENTATION_STARTED = NO
IMPLEMENTATION_COMPLETE = NO
IMP036J_ACCEPTED = NO
PROOF_EXECUTED = NO
PRODUCT_SEMANTICS_CHANGED = NO
EXPERIENCE_SEMANTICS_CHANGED = NO
ARCHITECTURE_CHANGED = NO
```

This verdict is the planning gate's readiness assessment. Lifecycle authorization
remains a later human action recorded in ROADMAP and STATE. Stories in the Product
Definition stay `NOT_READY_FOR_IMPLEMENTATION` until that authority changes.
