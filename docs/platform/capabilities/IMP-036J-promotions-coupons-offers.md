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
  "designReadiness": "PASS",
  "qualityTestPlanFinalized": "YES",
  "measurementInstrumentationPlanFinalized": "YES",
  "implementationPlan": "PASS",
  "candidateRevision": "IMP-036J-FIT-CANDIDATE-9",
  "architectureFitSourceCandidate": "IMP-036J-FIT-CANDIDATE-9",
  "architectureBase": "ARCH-R23",
  "architectureFit": "PASS",
  "architectureLock": "LOCKED",
  "architectureFitReviewForCandidate9": "PASS",
  "architectureFitPassClaimedForCandidate9": true,
  "architectureFitEvaluatedHead": "052289471cfc2424879932e16fd88d6c16696de8",
  "architectureFitEvaluatedTree": "ed6d0b4c7e82eef4fd764c0fe3f73539f8e1858b",
  "architectureFitEvaluatedGovernanceFingerprint": "5be074e0736c097b6d68f18a3b71cd26cc69c03600eac0cf956bf74d0b6834b0",
  "architectureFitEvaluatedCiRun": "36611527090",
  "architectureFitEvaluatedCodeqlRun": "36611527053",
  "architectureFitEvaluatedCodexEvidence": "5896150834",
  "historicalCandidate8ArchitectureFitReview": "STOP",
  "historicalCandidate8NeverMerged": true,
  "historicalCandidate8NeverLocked": true,
  "historicalCandidate8ExactHeadReviewIds": "4136530636,4136530647",
  "historicalCandidate8FreshReview": "5356279418",
  "historicalCandidate8EvaluatedHead": "8a8b34971f2b27f5ce32d4f472b57de423e06583",
  "historicalCandidate8EvaluatedTree": "dc21091ba33d05b0122dfbfe0a0f489a22da1cb8",
  "historicalCandidate7ArchitectureFitReview": "STOP",
  "historicalCandidate7NeverMerged": true,
  "historicalCandidate7NeverLocked": true,
  "historicalCandidate7ExactHeadReviewIds": "4135593837,4135593847,4135593861",
  "historicalCandidate6ArchitectureFitReview": "STOP",
  "historicalCandidate6NeverMerged": true,
  "historicalCandidate6NeverLocked": true,
  "historicalCandidate6ExactHeadReviewIds": "4135054894,4135054908",
  "historicalCandidate5ArchitectureFit": "PASS",
  "historicalCandidate5ArchitectureLock": "LOCKED",
  "historicalCandidate5IndependentReview": "PASS",
  "historicalCandidate5IndependentReviewId": "5347761109",
  "historicalCandidate5EvaluatedHead": "49912f35f2871ff77b9af267589d49666fc975ec",
  "historicalCandidate5EvaluatedTree": "7046d5bb78012524972505f555226205199a58d0",
  "historicalCandidate5GovernanceFingerprint": "ac6510d315148763069f06374a243a75a312a7693cf3e7c1d0eac71bc1026870",
  "implementationAuthorized": true,
  "implementationStarted": true,
  "schemaChangeRequired": true,
  "globalDecisionRequired": false,
  "d383Required": false,
  "archR24Required": false,
  "founderUatRequired": true,
  "founderUat": "NOT_STARTED",
  "lastReviewed": "2026-10-01",
  "bindingDecisions": ["D-382", "ADR-007", "ADR-008"],
  "dependsOn": ["IMP-016", "IMP-021", "IMP-036F", "IMP-036H", "IMP-036I"]
}
-->

# IMP-036J — Promotions, Coupons & Offers

## Capability architecture — FIT candidate 9, Architecture Fit PASS, LOCKED

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
CANDIDATE_REVISION = IMP-036J-FIT-CANDIDATE-9
ARCHITECTURE_FIT_SOURCE_CANDIDATE = IMP-036J-FIT-CANDIDATE-9
ARCHITECTURE_BASE = ARCH-R23
ARCHITECTURE_FIT = PASS
ARCHITECTURE_LOCK = LOCKED
ARCHITECTURE_FIT_REVIEW_FOR_CANDIDATE_9 = PASS
ARCHITECTURE_FIT_PASS_CLAIMED_FOR_CANDIDATE_9 = YES
INDEPENDENT_ARCHITECTURE_FIT_REVIEW = PASS
ARCHITECTURE_FIT_EVALUATED_HEAD = 052289471cfc2424879932e16fd88d6c16696de8
ARCHITECTURE_FIT_EVALUATED_TREE = ed6d0b4c7e82eef4fd764c0fe3f73539f8e1858b
ARCHITECTURE_FIT_EVALUATED_GOVERNANCE_FINGERPRINT = 5be074e0736c097b6d68f18a3b71cd26cc69c03600eac0cf956bf74d0b6834b0
ARCHITECTURE_FIT_EVALUATED_CI_RUN = 36611527090
ARCHITECTURE_FIT_EVALUATED_CI_ATTEMPT = 2
ARCHITECTURE_FIT_EVALUATED_CODEQL_RUN = 36611527053
ARCHITECTURE_FIT_EVALUATED_CODEX_EVIDENCE = 5896150834
HISTORICAL_CANDIDATE_8_ARCHITECTURE_FIT_REVIEW = STOP
HISTORICAL_CANDIDATE_8_NEVER_MERGED = YES
HISTORICAL_CANDIDATE_8_NEVER_LOCKED = YES
HISTORICAL_CANDIDATE_7_ARCHITECTURE_FIT_REVIEW = STOP
HISTORICAL_CANDIDATE_7_NEVER_MERGED = YES
HISTORICAL_CANDIDATE_7_NEVER_LOCKED = YES
HISTORICAL_CANDIDATE_6_ARCHITECTURE_FIT_REVIEW = STOP
HISTORICAL_CANDIDATE_6_NEVER_MERGED = YES
HISTORICAL_CANDIDATE_6_NEVER_LOCKED = YES
HISTORICAL_CANDIDATE_5_ARCHITECTURE_FIT = PASS
HISTORICAL_CANDIDATE_5_ARCHITECTURE_LOCK = LOCKED
IMP036J_ARCHITECTURE_FIT = PASS
IMP036J_ARCHITECTURE_LOCKED = YES
IMP036J_DESIGN_READINESS = PASS
IMPLEMENTATION_PLAN = PASS
IMPLEMENTATION_AUTHORIZED = YES
IMP036J_IMPLEMENTATION_AUTHORIZED = YES
IMP036J_IMPLEMENTATION_AUTHORIZATION = APPROVED
IMP036J_IMPLEMENTATION_AUTHORIZATION_DATE = 2026-10-01
IMPLEMENTATION_AUTHORIZATION_EVIDENCE = PR#332/5926464685
IMP036J_STARTED = YES
IMP036J_IMPLEMENTATION_STARTED = YES
IMP036J_FORMAL_LIFECYCLE = IMPLEMENTATION_IN_PROGRESS
FOUNDER_UAT = NOT_PERFORMED
GLOBAL_DECISION_REQUIRED = NO
D383_REQUIRED = NO
ARCH_R24_REQUIRED = NO
NEW_ADR_REQUIRED = NO
SCHEMA_CHANGE_REQUIRED = YES
COMMERCE_SCHEMA_CHANGE_REQUIRED = YES
MEASUREMENT_PERSISTENCE_SELECTED_BY_THIS_CANDIDATE = NO
MEASUREMENT_SCHEMA_SELECTED = NO
MEASUREMENT_API_TRANSPORT_SELECTED = NO
MEASUREMENT_STORAGE_SELECTED = NO
MEASUREMENT_IDENTIFIER_ENCODING_SELECTED = NO
MEASUREMENT_EVENT_OWNERSHIP_ASSIGNED = NO
MEASUREMENT_SEQUENCE_ENCODING_SELECTED = NO
COLLECTION_IMPLEMENTATION_SELECTED = NO
MEASUREMENT_PLAN_OWNS_CONCRETE_ENCODING = YES
NEW_SERVICE_REQUIRED = NO
NEW_CUSTOMER_FACADE_ROUTE = NOT_SELECTED
NEW_AUTH_MODEL_REQUIRED = NO
NEW_PERMISSION_REQUIRED = NO
FOUNDER_UAT_REQUIRED = YES
```

This document is `IMP-036J-FIT-CANDIDATE-9`. It remediates the two exact-head Architecture Fit
findings on Candidate 8. Independent Architecture Fit review returned PASS.
`ARCHITECTURE_FIT_REVIEW_FOR_CANDIDATE_9 = PASS`.
`ARCHITECTURE_FIT_PASS_CLAIMED_FOR_CANDIDATE_9 = YES`.
No numeric independent ChatGPT review identifier was available with that verdict, so none is
recorded.

`IMP-036J-FIT-CANDIDATE-5` remains the previously reviewed architecture and the prior lock.
Independent ChatGPT Architecture Fit review `5347761109` returned PASS for that candidate at head
`49912f35f2871ff77b9af267589d49666fc975ec`, tree
`7046d5bb78012524972505f555226205199a58d0`, and governance fingerprint
`ac6510d315148763069f06374a243a75a312a7693cf3e7c1d0eac71bc1026870`. Fresh Codex review
`5883601198` on that same head was clean. CI run `36521141717` and CodeQL run `36521141714`
passed on that same head. That PASS is not rewritten as a failure. Candidate 9 supersedes it as
the current lock. Evaluated head `052289471cfc2424879932e16fd88d6c16696de8`, tree
`ed6d0b4c7e82eef4fd764c0fe3f73539f8e1858b`, and governance fingerprint
`5be074e0736c097b6d68f18a3b71cd26cc69c03600eac0cf956bf74d0b6834b0`. Exact-head CI run
`36611527090` attempt 2 succeeded on that head. Attempt 1 of the same run remains historical
evidence of an unrelated IMP-036I reminder timeout and is not erased. Exact-head CodeQL run
`36611527053` succeeded. Fresh Codex issue comment `5896150834` on that head reported no major
issues. This persistence locks Candidate 9. It does not authorize implementation.

Candidate 9 does not perform Design Readiness, finalize the Quality/Test Plan, or finalize the
Measurement/Instrumentation Plan. Section 30 remains a future implementation proof plan. Global
architecture stays ARCH-R23. The decision register stays DR-23. D-383 is not created. No ADR is
created. `CANDIDATE_REVISION` records this remediation candidate. It is not an architecture
version and it does not create ARCH-R24.

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
IMP-036J-FIT-CANDIDATE-5 = previously reviewed architecture and prior lock, superseded by Candidate 9
  remediates 4129513169
  preserves the Candidate 2, Candidate 3, and Candidate 4 remediations
  independent Architecture Fit review = PASS
  INDEPENDENT_ARCHITECTURE_FIT_REVIEW_ID = 5347761109
  ARCHITECTURE_FIT_EVALUATED_HEAD = 49912f35f2871ff77b9af267589d49666fc975ec
  ARCHITECTURE_FIT_EVALUATED_TREE = 7046d5bb78012524972505f555226205199a58d0
  ARCHITECTURE_FIT_EVALUATED_GOVERNANCE_FINGERPRINT = ac6510d315148763069f06374a243a75a312a7693cf3e7c1d0eac71bc1026870
  ARCHITECTURE_FIT_EVALUATED_CODEX_REVIEW = 5883601198
  ARCHITECTURE_FIT_EVALUATED_CI_RUN = 36521141717
  ARCHITECTURE_FIT_EVALUATED_CODEQL_RUN = 36521141714
  Fit PASS subsequently persisted by the Candidate 5 lock checkpoint
  ARCHITECTURE_FIT_REVIEW = PASS
  ARCHITECTURE_FIT_PASS = YES
  CANDIDATE_5_REWRITTEN_AS_FAILED = NO
IMP-036J-FIT-CANDIDATE-6 = remediation candidate that fixed the Cart money boundary, Review integrity persistence, COMMERCIAL_STATE_CHANGE provenance, and the initial Cart to Review grain
  review threads 4134472848, 4134472863, 4134472881, and 4134472894
  blocked Design Readiness candidate head bd348f64c48d6e8db41b80ac585bb97d70692d95
  blocked Design Readiness candidate tree 10b0acbd5777f68df36d316d4acbe49d9091e7ae
  PR 329 remains open, unmerged, and unmodified
  exact-head review findings 4135054894 and 4135054908
  AF-036J-C6-01 = CART_SAVINGS_INTEGRITY_NOT_INSTRUMENTED
  AF-036J-C6-02 = CART_CONTINUATION_ACTION_IDENTITY_AMBIGUOUS
  independent Architecture Fit review = STOP
  never merged
  never locked
  ARCHITECTURE_FIT_PASS_CLAIMED_FOR_CANDIDATE_6 = NO
  CANDIDATE_6_REWRITTEN_AS_PASSED = NO
IMP-036J-FIT-CANDIDATE-7 = remediated AF-036J-C6-01 and AF-036J-C6-02
  added cross-surface Cart integrity feasibility and per-activation distinction
  exact-head review findings 4135593837, 4135593847, and 4135593861
  AF-036J-C7-01 = MEASUREMENT_IMPLEMENTATION_PRE_FINALIZED
  AF-036J-C7-02 = REUSED_ACTIVE_CHECKOUT_CART_ASSOCIATION_MISSING
  AF-036J-C7-03 = CART_ACK_DOES_NOT_PROVE_RENDERED_PRESENTATION
  independent Architecture Fit review = STOP
  never merged
  never locked
  ARCHITECTURE_FIT_PASS_CLAIMED_FOR_CANDIDATE_7 = NO
  CANDIDATE_7_REWRITTEN_AS_PASSED = NO
IMP-036J-FIT-CANDIDATE-8 = remediated 4135593837, 4135593847, and 4135593861
  fixed the Measurement Plan ownership boundary, reused-active-checkout Cart association, and the requirement for an observed committed UI presentation
  exact-head review findings 4136530636 and 4136530647
  fresh exact-head review 5356279418
  evaluated head 8a8b34971f2b27f5ce32d4f472b57de423e06583
  evaluated tree dc21091ba33d05b0122dfbfe0a0f489a22da1cb8
  AF-036J-C8-01 = RENDERED_AMOUNT_MISMATCH_NOT_OBSERVABLE
  AF-036J-C8-02 = LATER_CART_ACTIVATION_CAN_INHERIT_AN_EARLIER_REVIEW
  independent Architecture Fit review = STOP
  never merged
  never locked
  ARCHITECTURE_FIT_PASS_CLAIMED_FOR_CANDIDATE_8 = NO
  CANDIDATE_8_REWRITTEN_AS_PASSED = NO
IMP-036J-FIT-CANDIDATE-9 = remediates 4136530636 and 4136530647
  independent Architecture Fit review = PASS
  ARCHITECTURE_FIT_EVALUATED_HEAD = 052289471cfc2424879932e16fd88d6c16696de8
  ARCHITECTURE_FIT_EVALUATED_TREE = ed6d0b4c7e82eef4fd764c0fe3f73539f8e1858b
  ARCHITECTURE_FIT_EVALUATED_GOVERNANCE_FINGERPRINT = 5be074e0736c097b6d68f18a3b71cd26cc69c03600eac0cf956bf74d0b6834b0
  ARCHITECTURE_FIT_EVALUATED_CI_RUN = 36611527090
  ARCHITECTURE_FIT_EVALUATED_CI_ATTEMPT = 2
  ARCHITECTURE_FIT_EVALUATED_CODEQL_RUN = 36611527053
  ARCHITECTURE_FIT_EVALUATED_CODEX_EVIDENCE = 5896150834
  ARCHITECTURE_FIT_REVIEW = PASS
  ARCHITECTURE_FIT_PASS_CLAIMED = YES
  ARCHITECTURE_LOCK = LOCKED
  current architecture lock source
```

Candidate 2 did not receive an independent Architecture Fit verdict. Candidate 3 did not either:
its exact-head review opened 4129243690 and 4129243701 and stopped before ChatGPT Architecture Fit
review. Candidate 4 remediated those two findings. Its exact-head review then opened 4129513169 and
stopped before ChatGPT Architecture Fit review. `IMP036J_ARCHITECTURE_FIT` stayed `NOT_PERFORMED`
through Candidate 4. Candidate 5 received independent Architecture Fit review PASS
`5347761109`. That PASS remains historical provenance. Candidates 1–4 are not rewritten as a Gate
verdict, and Candidate 5 is not rewritten as a failed review. Candidate 6 fixed the Cart money
boundary, Review integrity persistence, `COMMERCIAL_STATE_CHANGE` provenance, and the initial
Cart to Review grain. Its exact-head review then found `4135054894` (`AF-036J-C6-01`) and
`4135054908` (`AF-036J-C6-02`). Independent Architecture Fit review of Candidate 6 is `STOP`.
That candidate was never merged and never locked. It is not rewritten as a pass. Candidate 7
added cross-surface Cart integrity feasibility and distinguished a retry of one Cart activation
from a later activation. Its exact-head review then found `4135593837`
(`AF-036J-C7-01`), `4135593847` (`AF-036J-C7-02`), and `4135593861` (`AF-036J-C7-03`).
Independent Architecture Fit review of Candidate 7 is `STOP`. That candidate was never merged
and never locked. It is not rewritten as a pass. Candidate 8 kept the Measurement Plan as the
owner of concrete encoding, associated a Cart activation with a reused active checkout, and
required an observed committed UI presentation. Its exact-head review `5356279418`, on head
`8a8b34971f2b27f5ce32d4f472b57de423e06583` and tree
`dc21091ba33d05b0122dfbfe0a0f489a22da1cb8`, then found `4136530636`
(`AF-036J-C8-01`) and `4136530647` (`AF-036J-C8-02`). Independent Architecture Fit review of
Candidate 8 is `STOP`. That candidate was never merged and never locked. It is not rewritten as
a pass. Candidate 9 remediates those two findings. Independent Architecture Fit review of
Candidate 9 is `PASS`. That PASS is the current architecture lock. Candidates 6, 7, and 8 stay
historical STOP candidates and are not rewritten as passes. Candidate 5 stays the prior PASS
and prior lock and is not rewritten as a failure.

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
| ARCH-G01 / D-356 / D-359 | Static Next.js export → Nginx → existing façades. No Route Handler, Server Action, or `src/app/api` business API. Any later measurement collection that uses a customer route stays on the existing `customer-commerce` façade. This candidate does not name that route. |
| D-360 | Customer commerce stays `/api/v1/*` on `customer-commerce`. A later Measurement Plan may extend that existing façade. It may not add a second customer transport. |
| D-372 / D-373 | Workforce commercial administration stays `/api/admin/v1/*` on the existing operations process. |
| ARCH-G02 / ARCH-G14 | No new deployable service, queue, or broker. |
| ADR-007 | Pricing owns money. INR paise. Promotion lifecycle stays `draft \| active \| retired`. Coupon lifecycle stays `draft \| active \| disabled \| retired`. |
| ADR-008 / ARCH-G05 | Checkout Snapshot remains payment-bound commercial truth. Purchased Order reads that snapshot and does not reprice. |
| ARCH-G09 | Material commercial writes keep expected-revision CAS. No silent last-write-wins. Presentation acknowledgement does not bump a commercial revision. |
| ARCH-G11 | Browser is not monetary, eligibility, or integrity authority. The browser may report non-authoritative evidence of the presentation it actually committed, including enough of that committed presentation to detect an amount-level mismatch. That evidence is not the price, not eligibility, and not the integrity verdict. |
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

```text
CART_COMMERCIAL_RESULT = AUTHORITATIVE_FOR_CART_SCOPE_ONLY
CART_FINAL_PAYABLE = NO_UNLESS_CHECKOUT_CONTEXT_PROVIDES_ALL_REQUIRED_CHARGES
```

Cart evaluation does not include packaging or delivery charges unless an open checkout already supplies the fulfilment context those charges require. A pre-checkout Cart result is authoritative for that Cart scope: merchandise, modifiers, bundles, promotions that do not need missing mode or timing, and tax on that scope. It is not a final payable while packaging or delivery is absent. When an open checkout supplies mode, timing, and every charge `buildCheckoutCommercialResult` would include, the Cart quote reads that same checkout context and can match Checkout Review. It still does not become a second pricing authority. Exact customer wording for the Cart amount is Design Readiness and LANG-1. This candidate does not prescribe that copy. Design Readiness must not specify the pre-checkout Cart amount as a final authoritative total payable.

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

`materializeOrderForCompletedCheckout` keeps its current cart-then-checkout-then-payment locks. It does not call `lockCustomerAuthUserForUpdate`. Recording the completion fact serializes after those commerce locks. It does not acquire the customer row, so it does not form a reverse cycle with reconciliation.

Recording a presented observation does not lock `customer_auth_users`, carts, or checkouts. Ownership is a re-read of the checkout row compared with the authenticated session.

Measurement serialization in section 27A does not change that order. A transaction that already holds customer, cart, checkout, payment, attempt, promotion, or claim locks may serialize measurement only after those rows. No path serializes measurement and then acquires the customer or the cart. Payment progression that also records a presented Review does so after the commerce locks that transaction already needs, and it keeps that measurement serialization until the transaction commits. A presentation-only transaction never takes those commerce locks, so it cannot wait on the cart while payment waits on measurement order. The two transactions serialize on that journey's measurement order alone.

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
| One commercial result | One quote `CommercialExplanation`: merchandise or order saving, delivery saving, total saved, final payable. Cart, Checkout Review, and the read-only Payment summary render that one result. Pre-checkout Cart payable is authoritative for Cart scope only, section 6. |
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

### Journey correlation and measurement facts

`checkouts.id` is not `CHECKOUT_JOURNEY_KEY`. Section 27A states why. Architecture Fit requires one opaque, non-PII correlation for one logical unpaid direct-order attempt. That correlation is stable across Review revisits of the same attempt, is distinct from customer identity, guest identity, cart identity, and checkout-row identity, and is immutable once assigned. A successor checkout of the same unpaid attempt copies it. It is not reminted. Cart measurement does not mint it and does not rewrite it.

This candidate does not select the column, table, token format, cookie, or identifier generation. `XD-IMP-036J-DRAFT-6` assigns that encoding to the later Measurement Plan.

```text
CHECKOUT_JOURNEY_KEY_REQUIRED = YES
CHECKOUT_ID_REUSED_AS_JOURNEY_KEY = NO
CART_ID_REUSED_AS_JOURNEY_KEY = NO
CUSTOMER_OR_GUEST_IDENTITY_AS_JOURNEY_KEY = PROHIBITED
JOURNEY_KEY_IMMUTABLE_ONCE_ASSIGNED = YES
CART_MEASUREMENT_MINTS_OR_REWRITES_JOURNEY_KEY = NO
JOURNEY_KEY_ENCODING_SELECTED = NO
```

Predecessor selection for that correlation uses a strict causal creation order among Checkout rows of one cart. Wall-clock `created_at` and checkout UUID order are not that order. The current sole production insert already holds the cart lock, so a later plan can record that order inside the existing `startCheckout` transaction. This candidate does not name the column or index that stores the order.

```text
CAUSAL_ORDER_REQUIRED = YES
TIMESTAMP_CAUSAL_AUTHORITY = NO
UUID_CAUSAL_AUTHORITY = NO
CAUSAL_ORDER_ENCODING_SELECTED = NO
LATEST_CAUSAL_ROW_FIRST = YES
SKIP_NEWER_BOUNDARY_TO_OLDER_CONTINUABLE_ROW = NO
```

#### What this candidate binds, and what it leaves to the Measurement Plan

Approved Experience reserves event ownership, schema, API and transport, storage mechanism, identifier generation and encoding, persistence-table selection, analytics vendor, sequence-encoding implementation, and collection implementation to the later Measurement Plan. Architecture Fit binds the semantic facts, trust boundaries, correlation, idempotency, privacy, concurrency, ordering, and feasibility constraints in this section and in section 27A. Those constraints are the Fit criteria. A concrete table, column, route, token, or index is not.

Candidate 5, while historically locked, named a concrete journey-key column, a per-cart ordinal, review receipt storage, a measurement head, measurement events, and one customer acknowledgement route. Candidates 6 and 7 named further measurement tables, columns, indexes, Cart routes, and an action-token encoding. That history stays provenance. It is not rewritten as a failed Fit. It is not a current Fit PASS criterion, and it is not re-locked by this candidate.

```text
CURRENT_BINDING = REQUIRED_SEMANTICS_AND_FIT_CONSTRAINTS
MEASUREMENT_PLAN_OWNS_CONCRETE_ENCODING = YES
HISTORICAL_CANDIDATE_5_CONCRETE_REPRESENTATION = NON_BINDING_MEASUREMENT_PLAN_OPTION
HISTORICAL_CANDIDATE_6_CONCRETE_REPRESENTATION = NON_BINDING_MEASUREMENT_PLAN_OPTION
HISTORICAL_CANDIDATE_7_CONCRETE_REPRESENTATION = NON_BINDING_MEASUREMENT_PLAN_OPTION
OPTION_IS_ARCHITECTURE_FIT_PASS_CRITERION = NO
CANONICAL_AUTHORITY_CONFLICT = NO
```

`NON_BINDING_MEASUREMENT_PLAN_OPTION` means the later Measurement Plan may adopt, adapt, or replace that earlier representation while it satisfies the semantic constraints. Adopting the historical names does not make them Architecture-Fit-locked. The plan still owns event ownership, schema, transport, storage, identifier encoding, sequence encoding, and collection.

Commerce schema in this section is unchanged: promotion columns, the first-order purchase guard, complimentary benefit shape, and snapshot line origin stay required because they are commercial truth, not telemetry.

#### Cart evaluation facts the Measurement Plan must be able to represent

For one authoritative Cart evaluation result and one actual presentation observation, the finalized plan must be able to represent these server-owned facts:

- an opaque correlation to that exact authoritative Cart evaluation
- a Cart identity and ownership boundary sufficient for access validation
- the authoritative commercial-result identity, or an equivalent server fingerprint of that same result
- the authoritative expected presentation of that result, at the fidelity defined below
- server-computed savings and explanation correctness from that same quote
- the evaluation occurrence context required by the approved measurement semantics
- an optional relation to an already-existing logical checkout journey only when the Cart view is already inside that journey

```text
ONE_SERVER_EVALUATION_PER_DISTINCT_AUTHORITATIVE_RESULT = YES
ONE_SERVER_EVALUATION_PRESENTED_AT_MOST_ONCE_FOR_VIEW_COUNT = YES
REPAINT_OR_RETRY_IS_NOT_ANOTHER_VIEW = YES
BROWSER_IS_MONEY_AUTHORITY = NO
BROWSER_MONEY_AUTHORITY = NO
BROWSER_PRESENTATION_OBSERVER = YES
BROWSER_IS_ELIGIBILITY_AUTHORITY = NO
BROWSER_DECLARES_FINAL_INTEGRITY_VERDICT = NO
BROWSER_INTEGRITY_AUTHORITY = NO
SERVER_EXPECTED_TRUTH = YES
RAW_COUPON_TEXT_PROHIBITED = YES
CUSTOMER_IDENTITY_AS_JOURNEY_JOIN = PROHIBITED
UNNECESSARY_MONEY_VALUES_PERSISTED_FOR_TELEMETRY = NO
TELEMETRY_IS_SECOND_MONEY_LEDGER = NO
CART_VIEW_MINTS_CHECKOUT_JOURNEY_KEY = NO
```

`UNNECESSARY_MONEY_VALUES_PERSISTED_FOR_TELEMETRY = NO` means measurement does not keep a second commercial ledger. The minimum presentation evidence required below is necessary for the approved financial-truth guardrail. It is not that ledger.

A pre-checkout Cart evaluation is still a valid evaluation when no journey key exists. Relating it to a journey copies an already-existing key. It does not mint one, adopt a missing key, or read a terminal checkout to invent one.

#### Expected presentation and observed committed presentation

An acknowledgement that a server-issued evaluation id was received is not proof that the committed UI presented that result. Surface, coarse shape, saving-present, and progress-present are also not enough. Those four facts still match when the authoritative saving is ₹80 and the committed UI renders ₹8.

For every measured presented commercial result, the finalized Measurement Plan must be able to compare:

```text
AUTHORITATIVE_EXPECTED_PRESENTATION = presentation implied by the server commercial evaluation
OBSERVED_COMMITTED_PRESENTATION = presentation evidence derived from the UI projection actually committed
```

That comparison must be fine enough to detect each of these on Cart and on Checkout Review:

- an omitted saving row
- an extra saving row
- a wrong saving component
- an incorrect rendered saving value
- an incorrect rendered total-saved value
- a wrong positive-versus-zero presentation
- a wrong coarse shape
- a wrong progress presence, and a wrong progress value where the approved metric requires that value

The comparison does not make telemetry a second money ledger. An observed rendered amount is not the payable and is not the saving.

```text
AUTHORITATIVE_MONEY = SERVER_COMMERCIAL_EVALUATION
OBSERVED_RENDERED_MONEY = NON_AUTHORITATIVE_PRESENTATION_EVIDENCE
OBSERVED_RENDERED_AMOUNT_SETS_PAYABLE = NO
AMOUNT_LEVEL_RENDER_MISMATCH_DETECTABLE = YES
OMITTED_SAVING_ROW_DETECTABLE = YES
EXTRA_SAVING_ROW_DETECTABLE = YES
WRONG_SAVING_COMPONENT_DETECTABLE = YES
WRONG_TOTAL_SAVED_DETECTABLE = YES
```

An observed ₹8 means only that the UI presented ₹8. It does not mean the order costs ₹8. The integrity decision is the server comparison of that observation with server truth.

```text
BROWSER_MONEY_AUTHORITY = NO
BROWSER_PRESENTATION_OBSERVER = YES
BROWSER_INTEGRITY_AUTHORITY = NO
SERVER_EXPECTED_TRUTH = YES
FINAL_INTEGRITY_COMPARISON_TRUSTED_FROM_BROWSER = NO
```

The browser may report or expose that non-authoritative evidence so server or measurement logic can compare it with the authoritative expected presentation. The browser must not calculate the authoritative payable, calculate the authoritative saving, decide eligibility, declare integrity pass or fail, or override server truth. A browser-submitted integrity assertion cannot turn a mismatch into a match.

#### Observation source

The observation is a function of the UI projection that was actually committed for presentation. It is not a copy of the server response object, the expected server descriptor, or the evaluation fingerprint that never passed through that final projection. Otherwise a mapping or formatting defect cannot be observed.

```text
OBSERVED_PRESENTATION_EVIDENCE = FUNCTION_OF_ACTUAL_COMMITTED_PRESENTATION
OBSERVATION_COPIED_FROM_SERVER_RESULT_ONLY = PROHIBITED
OBSERVATION_COPIED_FROM_EXPECTED_DESCRIPTOR_ONLY = PROHIBITED
OBSERVATION_COPIED_FROM_EVALUATION_FINGERPRINT_ONLY = PROHIBITED
```

The observation may be non-authoritative rendered component-value observations, a presentation-projection digest derived from the actual committed rendering, or another privacy-safe representation of that same committed projection. This candidate does not select which encoding. The later Measurement Plan owns that choice.

```text
PRESENTATION_ENCODING_SELECTED = NO
CONCRETE_COLLECTION_MECHANISM = DEFERRED_TO_MEASUREMENT_PLAN
QUALITY_PLAN_PROVES_VALUE_LEVEL_RENDER_MISMATCH_DETECTABLE = YES
```

Design Readiness later defines the customer-facing projection that is committed. It does not select the measurement encoding of the observation. The Quality Plan later proves the mismatches listed above, including expected ₹80 rendered as ₹80 and expected ₹80 rendered as ₹8. This candidate does not choose the transport, persistence, identifier, event ownership, or sequence representation.

#### Privacy of presentation evidence

The observation contains only the minimum presentation evidence needed to verify the approved financial-truth guardrail. It must not contain raw coupon text, a private eligibility reason, a payment secret, customer PII, or another customer's data. It must not contain a client-computed integrity boolean. This candidate does not invent retention beyond the existing approved commerce-analytics retention rule.

#### Review presentation

Checkout Review uses the same separation. One authoritative Review evaluation has the server-owned expected presentation. An observed committed Review presentation is separate, and it is still a function of the Review projection that was actually committed. The browser does not set either integrity fact. Server explanation integrity remains an independent server comparison of the explanation parts with the authoritative evaluated saving. A browser observation cannot hide a server explanation mismatch, and a server explanation match cannot hide a rendered-amount mismatch.

#### Review evaluation and commercial-change provenance

`COMMERCIAL_STATE_CHANGE` remains a Review-side provenance fact, not a new price. Its originating fact is one newly established authoritative Review result that differs from the previous Review result on the same journey and that consumed at least one source origin. The source origins are coupon apply, coupon replace, coupon remove, fulfilment change, and stale recovery, and only when that command actually changes the commercial revision. A no-op writes no origin. Replay of the same changed result returns the existing observation and does not create another. One changed result is one change observation even when several origins resolve onto it. A quantity edit that is not one of those origins is not this fact. Customer identity, telemetry arrival, and occurrence time are not the provenance identity.

```text
COMMERCIAL_STATE_CHANGE_ORIGINATING_FACT = NEW_REVIEW_RESULT_WITH_A_DIFFERENT_AUTHORITATIVE_FINGERPRINT_AND_AT_LEAST_ONE_SOURCE_ORIGIN
SAME_OPERATION_RETRY = RETURN_EXISTING_OBSERVATION
ONE_ORIGIN_MULTIPLE_CHANGE_OBSERVATIONS = NO
ONE_RESULT_MULTIPLE_ORIGINS = ONE_CHANGE_OBSERVATION
CLOSED_JOURNEY_NEW_CHANGE = REJECT
CLOSED_JOURNEY_REPLAY = RETURN_EXISTING_OBSERVATION
PROVENANCE_STORAGE_SELECTED = NO
```

#### Cart activation identity

Cart → Checkout Review continuation is counted at the grain of one genuine Cart-surface Checkout activation. The later Measurement Plan must provide a durable idempotency and provenance concept that distinguishes these two cases:

```text
SAME_LOGICAL_CART_CHECKOUT_ACTIVATION_RETRY != LATER_DISTINCT_CART_CHECKOUT_ACTIVATION
```

```text
CART_ACTIVATION_IDENTITY = opaque non-PII measurement identity for one Cart-surface Checkout activation
SAME_ACTIVATION_RETRY = SAME_ACTIVATION_OBSERVATION
NEW_CART_ACTIVATION = DISTINCT_ACTIVATION_OBSERVATION
REPAINT = NOT_A_NEW_ACTIVATION
DIRECT_CHECKOUT_ENTRY = NOT_A_CART_ACTIVATION
CUSTOMER_ID_IN_ACTIVATION_IDENTITY = NO
GUEST_ID_IN_ACTIVATION_IDENTITY = NO
COUPON_IN_ACTIVATION_IDENTITY = NO
MONEY_IN_ACTIVATION_IDENTITY = NO
ELIGIBILITY_IN_ACTIVATION_IDENTITY = NO
ACTIVATION_ENCODING_SELECTED = NO
```

The activation identity is not `CHECKOUT_JOURNEY_KEY`. The action does not mint or rewrite that key, and it does not change price, eligibility, or checkout revision.

#### Reused active checkout association

Current `startCheckout` in `src/server/checkout/operations.ts` returns an already-active checkout for the same cart without inserting a new checkout when that checkout is `DRAFT`, `READY_FOR_PAYMENT`, or `PAYMENT_PENDING` and the existing owner, expiry, and cart-revision rules keep it. Associating a Cart activation only when a journey key is minted or copied therefore misses the reuse path.

```text
REUSED_ACTIVE_CHECKOUT_RETURNS_EXISTING_ROW = YES
ASSOCIATE_ONLY_WHEN_MINTING_OR_COPYING_JOURNEY_KEY = NO
```

When all of the following hold, the Cart activation associates with that existing journey:

- the start action carries explicit valid Cart-origin measurement context
- that context belongs to the same cart
- the call resolves to an existing active Checkout for that cart
- that Checkout already has a valid checkout journey key

That association is measurement only. It does not rewrite the journey key, mint a second key, mutate price, mutate eligibility, or mutate checkout revision merely for telemetry. It does not classify a direct Checkout entry as Cart-originated.

```text
DIRECT_START_WITH_NO_VALID_CART_ORIGIN_CONTEXT = EXCLUDED_FROM_CART_CONTINUATION_METRIC
UNKNOWN_STALE_OR_OTHER_CART_CONTEXT = DO_NOT_ATTACH_UNRELATED_ACTIVATION
PREVIOUSLY_ASSOCIATED_ACTIVATION_RETRY = SAME_ASSOCIATION
MULTIPLE_DISTINCT_ACTIVATIONS_MAY_SHARE_ONE_JOURNEY = YES
ASSOCIATION_DOES_NOT_COLLAPSE_ACTIVATIONS = YES
ASSOCIATION_REPRESENTATION_SELECTED = NO
```

A start that does insert a new checkout and establishes a journey key under valid Cart-origin context associates that same activation with the key established for that start. The activation still does not mint the key itself. An unassociated activation remains in the continuation denominator and cannot enter the numerator. The report does not join a direct checkout to an unassociated activation by cart id, customer id, or guest id.

Association with a journey is not itself a numerator. A Review that already exists on that journey does not satisfy a later activation.

#### Subsequent Review reach for one activation

Offer result viewed and step progression are different Experience facts. Cart continue, Review reached with an authoritative evaluation, and Review continue to Payment are step-progression facts. This candidate does not force a new Offer-result-view observation solely so a later Cart activation can be counted. A reused active checkout may already hold the same authoritative evaluation. The deduplicated Offer-result-view observation does not need to be duplicated when that evaluation is still the one already viewed.

The Cart → Review numerator is still a step-progression fact. For a Cart activation `A`, `A` enters the numerator only when there is a qualifying Review-reached fact `R` such that:

- `R` belongs to the checkout journey associated with `A`
- `R` represents Review reached with an authoritative evaluation
- `R` is causally after `A`
- `R` occurs before `REPORT_AS_OF`
- `R` is not a historical Review presentation from before `A`

```text
OLD_REVIEW_SATISFIES_NEW_ACTIVATION = NO
ACTIVATION_REQUIRES_SUBSEQUENT_REVIEW_REACH = YES
ACTIVATION_SCOPED_REVIEW_REACH_REQUIRED = YES
REPEATED_OFFER_RESULT_VIEW_REQUIRED_FOR_LATER_ACTIVATION = NO
MULTIPLE_CART_ACTIVATIONS_ONE_JOURNEY = YES
REUSED_ACTIVE_CHECKOUT_ASSOCIATION = YES
```

When the customer genuinely navigates from Cart and reaches Review again, the Measurement Plan must be able to establish that activation-scoped Review-reached-after-`A` fact even when the same checkout is reused, the same commercial evaluation remains valid, and the Offer-result-view observation is not duplicated.

The required relation is:

```text
ACTIVATION A → associated checkout journey J → subsequent REVIEW_REACHED R on J → A may enter the numerator
```

The rejected relation is:

```text
Review R1 on J → later activation A2 on J → no later Review → A2 counted because R1 exists
```

`A2` stays denominator-only in that rejected case.

| Sequence | Numerator |
|---|---|
| `A1`, then `R1`, then back to Cart, then `A2`, then `R2` | `A1` and `A2` |
| `A1`, then `R1`, then back to Cart, then `A2`, then abandonment | `A1` only. `A2` stays denominator-only |
| `A1`, then a transport retry of `A1`, then `R1` | One denominator and one numerator |
| Direct Checkout entry, then Review | Not part of this metric |

Ordering for that relation does not use analytics ingestion order, customer identity, cart identity alone, or the existence of any Review on the journey. When an authoritative causal order is available, arbitrary wall-clock order is not the authority. The later Measurement Plan selects an ordering and correlation representation consistent with authoritative occurrence time, with `AUTHORITATIVE_JOURNEY_SEQUENCE` where that sequence applies, and with activation-specific provenance. This candidate only requires the relation to be representable. It does not choose the encoding.

Cart activation itself need not be a member of `AUTHORITATIVE_JOURNEY_SEQUENCE`. If it is not, the Measurement Plan must still establish an unambiguous causal-before relation between that activation and its qualifying Review-reached fact.

```text
ANALYTICS_INGESTION_ORDER_AUTHORIZES_ACTIVATION_NUMERATOR = NO
CART_IDENTITY_ALONE_AUTHORIZES_ACTIVATION_NUMERATOR = NO
ANY_REVIEW_ON_JOURNEY_AUTHORIZES_ACTIVATION_NUMERATOR = NO
ACTIVATION_TO_REVIEW_CAUSAL_ORDER_REQUIRED = YES
ACTIVATION_REVIEW_ORDER_ENCODING_SELECTED = NO
```

No migration is written by this candidate.

---

## 25. API fit

```text
FAÇADES = EXISTING /api/v1/* AND /api/admin/v1/*
NEW_SERVICE = NO
NEW_ROUTE = NOT_SELECTED
NEW_CUSTOMER_FACADE_ROUTE = NOT_SELECTED
NEXT_ROUTE_HANDLER = NO
SERVER_ACTION = NO
SECOND_BACKEND = NO
ANALYTICS_SERVICE = NO
MEASUREMENT_TRANSPORT_SELECTED = NO
```

Commerce routes below stay on the existing façades. Measurement collection, if it later uses the customer façade, stays `/api/v1/*` on `customer-commerce` and writes no price. This candidate does not name that route, request field, or token. It does not require D-383 or ARCH-R24. Section 31 records the full re-evaluation.

### Customer modifications

| Route | Owner | Auth | Intent | Response | Concurrency | Errors |
|---|---|---|---|---|---|---|
| `POST /api/v1/cart/coupon` | Cart `applyCartCoupon` | Existing cart credential | Store one canonical code | Cart revision plus, after the following evaluate, `CommercialExplanation` | `expectedRevision` | `CART_COUPON_UNKNOWN` writes nothing. Stale revision writes nothing. |
| `POST /api/v1/cart/coupon/remove` | Cart `removeCartCoupon` | Existing cart credential | Clear the code | Same | `expectedRevision` | Stale revision writes nothing |
| `POST /api/v1/cart/evaluate` | `evaluateCart` | Existing cart credential | Read-only Cart quote. The authoritative commercial result of this call is the evaluation the measurement facts in section 24 may correlate. This route does not by itself prove a rendered view | Quote plus explanation, progress, complimentary projection, and coupon outcome. No measurement token is named here | Does not bump revision. Does not make the browser money authority | Existing indeterminate errors |
| `POST /api/v1/checkouts/{checkoutId}/evaluate` | `evaluateCheckout` | Customer session | Recompute from the cart code and checkout fulfilment | Commercial result plus explanation. `VALID_BUT_NOT_SELECTED` does not throw `CHECKOUT_COUPON_INELIGIBLE`. The evaluation alone is not cohort entry | Does not bump cart or checkout revision merely to record measurement. `expectedCheckoutRevision` still gates the commercial read | Existing repricing and merchandise errors |
| `prepareCheckoutForPayment`, called inside `startPayment`, `retryPayment`, and `completeZeroPayableCheckout` before those commands bind | Checkout | Customer session | Revalidate before bind. There is no separate payment-prepare route | Ready snapshot or `CHECKOUT_REPRICED` with explanation reason | `expectedCheckoutRevision`. A later measurement fact for Pay must not reverse the order of a Review that was presented before that Pay | Stale benefit, unavailable complimentary, exhausted cap, first-order lost. Missing measurement context does not change the price |
| `POST /api/v1/payments` and retry | Payment | Customer session | Reserve claims for the active snapshot | Unchanged commercial payment body | Existing payment idempotency key | `PAYMENT_PROMOTION_CAPACITY_UNAVAILABLE`, first-order conflict. No coupon field is accepted |
| Existing order read routes | Order | Owning customer | Read sealed snapshot | Historical savings and complimentary line from the snapshot | None | No live promotion call |

Checkout Review calls the cart coupon routes and then checkout evaluate. Measurement may observe the committed Review presentation. Pay does not wait on that observation. Carrying measurement context into Pay does not change the commercial body.

`startCheckout` may carry Cart-origin measurement context. That context is association only. It is not money, not a coupon, and not eligibility. Section 24 states when a reused active checkout associates with the existing journey. Unknown, stale, or other-cart context does not fail checkout and does not attach an unrelated activation.

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
| Cart | `src/app/(customer)/order/cart/page.tsx`, `CartClient` | Coupon field, apply, remove, replace, failure text, threshold text, applied saving, complimentary projection line. Data comes from `POST /api/v1/cart/evaluate`. After that result is committed to the presented Cart state, observation evidence is a function of that committed projection, at the fidelity in section 24. A repaint of the same result is not another view. The Cart Checkout control is one activation. A transport retry of that activation is the same activation. A later activation is distinct and does not inherit an earlier Review. A repaint is not an activation. |
| Checkout Review | `CheckoutClient` on `/order/checkout` | Same cart coupon commands. Shows the shared code and the recomputed explanation, including the equal-payable and strictly-lower coupon classes and stale recovery. After that result is committed to the presented Review state, observation evidence is a function of that committed projection. A later Cart activation counts as Review-reached only when this reach is causally after that activation. A repaint is not another Offer-result view and is not, by itself, a new activation-scoped Review reach. Pay is not blocked on measurement. |
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
| Privacy | Customer explanation omits other customers' ids and counts. Audit metadata continues to reject `canonicalCode`. Measurement facts do not store raw coupon text or customer identity |

Campaign analytics stay out of scope. X3 measurement is section 27A. It is a semantic fit inside existing commerce authority. It is not a new telemetry product, and it does not select storage.

---

## 27A. X3 measurement architecture

Experience Gate PASS makes this contract mandatory. It does not create a Product abandonment timeout, a cart expiry, a checkout expiry, or a payment-lifecycle change. Concrete collection remains the Measurement Plan. The constraints below are the Fit criteria.

### Journey key

```text
CHECKOUT_JOURNEY_KEY_ENCODING_SELECTED = NO
EXISTING_CHECKOUT_ID_REUSED = NO
CUSTOMER_IDENTITY_AS_JOURNEY_KEY = PROHIBITED
CART_ID_AS_JOURNEY_KEY = NO
```

`checkouts.id` is stable for fulfilment changes, `invalidateReadyToDraft`, and payment retry on the same row. It is not stable for the Experience journey.

`startCheckout` in `src/server/checkout/operations.ts` returns the existing non-terminal checkout when the owner matches and `sourceCartRevision` equals `carts.revision`, including when status is `DRAFT`, `READY_FOR_PAYMENT`, or `PAYMENT_PENDING`. When status is `DRAFT` or `READY_FOR_PAYMENT` and those revisions differ, it calls `markCheckoutCancelled` and `insertDraftCheckout` with a new id. Coupon apply, coupon remove, and quantity edits all bump `carts.revision`. The next start can therefore replace the checkout id. Experience keeps one key across cart edits and coupon apply, change, and remove.

`getCheckout` by cart returns null when the active checkout's `sourceCartRevision` is stale, so the client starts again and takes that replacement path.

`setCheckoutFulfilment` and `setCheckoutFulfilmentTiming` update the same checkout row and bump `checkouts.revision`. `invalidateReadyToDraft` keeps the id and moves `READY_FOR_PAYMENT` back to `DRAFT`. `retryPayment` refuses an unresolved attempt and keeps the same checkout. Those flows do not save `checkouts.id` as a journey key, because the cart-revision path already changes it.

`carts.id` survives those edits, `claimGuestCart`, and `finalizeCartAfterOrderMaterialization`. The next unpaid attempt after a successful order reuses the cart. Experience closes the key on successful completion and starts a new key for the next attempt. A cart id would join those attempts.

### Per-cart causal order

`created_at` is not a causal order. The application clock can store equal timestamps, and `newCheckoutId()` in `src/server/checkout/repository.ts` returns `randomUUID()`. Lexical or numeric UUID order does not say which checkout was created later. Predecessor selection does not use either one.

The sole production insert of a Checkout row is `startCheckout` calling `insertDraftCheckout`. That call sits inside the transaction that already holds the Cart through `lockAndVerifyCustomerCart`. No other production path inserts into `app.checkouts`. A future insert that does not hold this Cart lock is an architecture contradiction for this correlation.

```text
CHECKOUT_INSERT_PATH = startCheckout → insertDraftCheckout
CART_LOCK_HELD_ACROSS_INSERT = YES
OTHER_PRODUCTION_INSERT = NOT_FOUND
CAUSAL_ORDER_ENCODING_SELECTED = NO
TIMESTAMP_CAUSAL_AUTHORITY = NO
UUID_CAUSAL_AUTHORITY = NO
```

While that Cart lock is held, a newly inserted Checkout is strictly later than every Checkout this capability has already ordered for that cart. Two starts cannot take the same place. Equal timestamps and random ids do not change that order. The Measurement Plan chooses how that order is stored.

The order answers only which Checkout row is latest. Continuability is a separate predicate on that one row. The lookup does not walk backwards until it finds a continuable row.

```text
LATEST_CAUSAL_ROW_FIRST = YES
SKIP_NEWER_BOUNDARY_TO_OLDER_CONTINUABLE_ROW = NO
```

If no ordered row exists for this cart and this customer, do not invent an order from `created_at` or id. If the latest ordered row matches the payment-driven expired predicate below, copy its journey key. Otherwise do not copy an older key.

A checkout that predates this capability participates by a one-time adoption, not by sorting historical rows. Adoption runs only in a transaction that already locks the Cart before the Checkout, and only while the row is still non-terminal (`DRAFT`, `READY_FOR_PAYMENT`, or `PAYMENT_PENDING`) and has not yet been ordered:

- `startCheckout`, on the in-hand row, before it returns that row or inserts the successor
- `evaluateCheckout`'s commit transaction, which already locks the Cart and then the Checkout
- a section 10A payment-binding transaction, after the customer, Cart, and Checkout locks

Adoption assigns the next causal place and, when the journey key is absent, one new opaque key. It does not bump `checkouts.revision`, change status, change the snapshot, or change price. It is not repeated. A checkout this capability has ordered has a journey key.

Commands that already lock the Checkout before the Cart do not adopt. Taking the Cart lock after the Checkout lock would invert section 10A. `cancelCheckout` is one of those commands: an explicit cancel of a still-unordered historical row leaves it unordered, and the next start mints a new key rather than recovering a journey from an older unordered row.

```text
HISTORICAL_TERMINAL_ORDER_BACKFILL = NO
PRE_EXTENSION_ACTIVE_ADOPTION = ONCE_UNDER_CART_THEN_CHECKOUT_LOCK
ADOPTION_DOES_NOT_BUMP_REVISION = YES
ORDERED_CHECKOUT_HAS_JOURNEY_KEY = YES
```

Mint and copy, inside `startCheckout`, under the existing cart lock. That transaction does not lock `customer_auth_users`.

```text
JOURNEY_CONTINUES_ACROSS:
  CART_REVISION_CHECKOUT_REPLACEMENT
  COUPON_CHANGE
  FULFILMENT_CHANGE
  STALE_REVIEW_RECOVERY
  PAYMENT_RETRY
  PAYMENT_DEFINITIVE_NON_SUCCESS_THAT_EXPIRES_CHECKOUT
  REUSED_ACTIVE_CHECKOUT_RETURN

1. if an active non-terminal predecessor is in hand
   adopt it when it is not yet ordered, then copy its journey key
2. else select the single latest causal checkout for this cart and this customer
3. copy that key only when that latest row matches the payment-driven expired predicate
4. else mint a new opaque key
```

Step 1 covers the predecessor `startCheckout` itself still holds, including the reuse path that returns `DRAFT`, `READY_FOR_PAYMENT`, or `PAYMENT_PENDING` without inserting a row. Fulfilment changes and `invalidateReadyToDraft` keep that same row, so the key never moves. When that in-hand row had no key, adoption mints one. The Cart activation does not mint it.

Step 2 runs only when `findActiveNonTerminalForCart` finds nothing. Latest is the causal order, not `created_at` and not `id`.

Step 3 is the payment-driven expiry case already written by current source. Continuity is not inferred from elapsed time. It matches only when the latest checkout is that predecessor:

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

Explicit `cancelCheckout` already left `CANCELLED` before a later start. That latest causal row fails the continuable predicate, so step 4 mints a new key. A latest `COMPLETED` checkout also fails it. The lookup does not skip a newer boundary to recover an older key.

```text
EXPLICIT_CUSTOMER_CANCEL → NEW_JOURNEY_ON_LATER_START
SUCCESSFUL_DIRECT_ORDER_COMPLETION → CLOSE_CURRENT_JOURNEY
COMPLETED_PREDECESSOR → DO_NOT_COPY_KEY_TO_NEXT_ORDER
PAYMENT_DRIVEN_EXPIRED_PREDECESSOR = CONTINUABLE
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
| `startCheckout` returns an already-active checkout | Same key. No second key is minted |
| Explicit customer checkout cancel, then a later start | New |
| Successful direct-order completion, then the next order | New |

### Sequence

`checkouts.revision` does not satisfy `AUTHORITATIVE_JOURNEY_SEQUENCE`. `evaluateCheckout` does not bump it. Two measurement facts can share an occurrence time because of clock precision. Analytics arrival order is not an order. An evaluation record alone does not allocate a sequence.

```text
SCOPE = one CHECKOUT_JOURNEY_KEY
STRICT_TOTAL_ORDER = YES
UNIQUE_WITHIN_JOURNEY = YES
REPRODUCIBLE = YES
ANALYTICS_INGESTION_ORDER = NOT_AUTHORITY
TELEMETRY_ARRIVAL_ORDER = NOT_AUTHORITY
EVALUATION_ALONE_ALLOCATES_SEQUENCE = NO
SEQUENCE_ENCODING_SELECTED = NO
```

One ordering rule covers every authoritative journey fact: Review presented, commercial state change, review-to-payment progression, payment attempt, and successful direct-order completion. They do not keep separate order allocators. The Measurement Plan chooses the encoding.

For any of those facts the order rule is:

1. Serialize facts for that one journey key.
2. Re-read that fact's own idempotency identity.
3. If it already exists, return it. Allocate nothing. Do not change closure.
4. If the journey is already closed to new facts, reject the new fact. Allocate nothing.
5. Otherwise allocate the next sequence and record the fact.
6. Successful direct-order completion closes the journey in that same Order-materialization transaction.

```text
IDEMPOTENT_REPLAY_LOOKUP_PRECEDES_CLOSED_JOURNEY_REJECTION = YES
EXISTING_FACT_ON_CLOSED_JOURNEY = RETURN_EXISTING
NEW_FACT_ON_CLOSED_JOURNEY = REJECT
CUSTOMER_IDENTITY_AS_EVENT_IDEMPOTENCY_KEY = NO
OCCURRED_AT_AS_EVENT_IDEMPOTENCY_KEY = NO
```

The idempotency identity is the fact itself, within the journey: one presented observation of one Review evaluation, one commercial-change observation of one changed Review result, and one successful completion of the journey. It is not whether any fact of that kind has occurred, and it is not telemetry arrival order.

When a payment operation relies on a Review that was presented, that presented fact's sequence is strictly before the payment fact's sequence. The first recording of the journey, if Review and Pay race, cannot reverse that order and cannot fail the commercial transaction only because measurement ordering was created. Pay is not held for a separate customer-visible analytics wait. A later observation of the same presented Review consumes no further sequence and does not add a denominator.

### Displayed savings integrity

Approved Experience requires that displayed savings match the evaluated effect, on Cart and on Checkout Review. The browser is not that comparison.

`evaluateCheckout` and `evaluateCart` each build one `CommercialExplanation` from the same `buildDirectPricingQuote` result. There is no second pricing pass and no second promotion pass. In that same server evaluation:

```text
SERVER_SAVINGS_EXPLANATION_INTEGRITY =
  server explanation parts == authoritative evaluated saving
```

The inputs are server values from that one quote. They are not client amounts and not a browser assertion. A consistent explanation matches the parts of that quote. The comparison is false when the explanation disagrees with those parts, including a standing ₹0 delivery amount counted as a saving. The Measurement Plan decides where that server comparison is stored. No customer or operator request body is its source.

Separately, the plan must be able to evaluate the committed screen at the fidelity in section 24. Surface, coarse shape, saving-present, and progress-present can all match while the rendered saving value is wrong. Expected ₹80 rendered as ₹8 is a mismatch.

```text
DISPLAYED_PRESENTATION_MATCH =
  AUTHORITATIVE_EXPECTED_PRESENTATION matches OBSERVED_COMMITTED_PRESENTATION
  at amount-level and component-level fidelity
OBSERVED_PRESENTATION_EVIDENCE = FUNCTION_OF_ACTUAL_COMMITTED_PRESENTATION
```

The observed evidence is non-authoritative presentation evidence. It is not authoritative money, not a raw coupon, not private eligibility, not customer PII, and not a client integrity boolean. An opaque acknowledgement of a server id, or a copy of the expected result that never passed through the committed projection, does not prove that match. The observation is not a second money ledger. This candidate does not select its encoding.

```text
DISPLAYED_SAVINGS_INTEGRITY_AUTHORITY = SERVER_EVALUATION_OF_THE_SAME_QUOTE
PRESENTATION_MATCH_AUTHORITY = SERVER_COMPARISON_OF_EXPECTED_AND_OBSERVED_PRESENTATIONS
BROWSER_MONEY_AUTHORITY = NO
BROWSER_PRESENTATION_OBSERVER = YES
BROWSER_INTEGRITY_AUTHORITY = NO
SERVER_EXPECTED_TRUTH = YES
AMOUNT_LEVEL_RENDER_MISMATCH_DETECTABLE = YES
SECOND_PRICING_AUTHORITY = NO
SECOND_PROMOTION_AUTHORITY = NO
RAW_COUPON_OR_ELIGIBILITY_STORED = NO
CART_SURFACE = CART
REVIEW_SURFACE = CHECKOUT_REVIEW
REPORT_INCLUDES_BOTH_SURFACES = YES
UNPRESENTED_EVALUATION_COUNTED = NO
REPAINT_CREATES_ANOTHER_VIEW = NO
CONCRETE_COLLECTION_DEFERRED = YES
PRESENTATION_ENCODING_SELECTED = NO
```

For each presented evaluation the plan can calculate: the authoritative evaluation exists; the authoritative expected presentation exists; the observed committed presentation exists and was derived from the committed UI; server explanation integrity can be evaluated independently; expected-versus-observed match can be evaluated at the fidelity above; and the surface is distinguishable. `REPORT_AS_OF` includes a presented evaluation only when its authoritative occurrence time is strictly before that cutoff. One evaluation counts at most once for the Offer-result view. The report does not re-sum money and does not invent a second price. A Cart presentation does not consume `AUTHORITATIVE_JOURNEY_SEQUENCE` and does not become a primary-cohort entry. Copying an already-existing journey key onto a Cart view does not mint or rewrite that key.

A true evaluation with a matching committed presentation keeps the presentation comparison true. A rendered ₹8 against an expected ₹80 keeps it false. An omitted saving row, an extra saving row, and a wrong component split with the same total keep it false when displayed parts must match the evaluated saving. A browser-submitted integrity assertion cannot turn any of those false. A server explanation mismatch stays independently detectable. The Quality Plan proves those cases. Design Readiness defines the customer-facing projection. It does not select the observation encoding.

### Commercial state change

Section 24 binds the provenance rule. Candidate 5 named `COMMERCIAL_STATE_CHANGE` and did not give the locked re-read an identity a replay can find. Candidate 6 supplied that identity as the changed Review result that consumed at least one source origin. This candidate keeps that semantic identity and does not select its table, column, or index.

A retry of the same evaluation returns the existing result. If the change observation was already recorded, replay returns it, including after the journey is closed, and allocates no sequence. A concurrent duplicate of the same authoritative result leaves one result and one change observation. A new changed result after closure is rejected with the result write. Customer identity is not the key. Occurrence time is not the key.

### Cart to Review continuation

Approved Experience lists Cart → Checkout Review continuation as a secondary metric. The step-progression contract names Cart continue and Review reached as distinct steps. `CHECKOUT_JOURNEY_KEY` is required when the event is inside one logical checkout. Experience does not authorize leaving this metric unmeasurable, and it does not authorize renaming a checkout-row ratio as this metric.

The ratio of journey keys that reach Review over checkout rows created with a journey key is rejected. Carts that never start checkout have no checkout row. Several checkout rows can share one `CHECKOUT_JOURNEY_KEY`. Checkout is also entered by routes other than the Cart surface: `CheckoutClient` calls `startCheckout` for a direct visit, a refresh, a login return that does not present Cart-origin context, and an in-checkout restart. Navigation that is not the Cart Checkout action is the same exclusion.

```text
SECONDARY_METRIC = CART_TO_CHECKOUT_REVIEW_CONTINUATION
SEMANTIC_GRAIN = ONE_GENUINE_CART_SURFACE_CHECKOUT_ACTIVATION
DENOMINATOR = Cart activations in the Measurement Plan's finalized cohort and cutoff
NUMERATOR = those same activations that have a qualifying Review-reached fact causally after that exact activation
ABANDONED_ACTIVATION = DENOMINATOR_ONLY
TRANSPORT_RETRY = NOT_ANOTHER_DENOMINATOR
REPAINT = NOT_ANOTHER_DENOMINATOR
LATER_GENUINE_ACTIVATION = ANOTHER_DENOMINATOR
DIRECT_CHECKOUT_START = EXCLUDED
REUSED_ACTIVE_CHECKOUT_MAY_ENTER_NUMERATOR = YES
OLD_REVIEW_SATISFIES_NEW_ACTIVATION = NO
ACTIVATION_REQUIRES_SUBSEQUENT_REVIEW_REACH = YES
REPEATED_OFFER_RESULT_VIEW_REQUIRED_FOR_LATER_ACTIVATION = NO
MULTIPLE_ACTIVATIONS_ONE_JOURNEY_DO_NOT_COLLAPSE = YES
CART_COUNT = NOT_THIS_METRIC
CHECKOUT_ROW_COUNT = NOT_THIS_METRIC
UNIQUE_JOURNEY_KEY_COUNT = NOT_THIS_METRIC
BROWSER_CLICK_WITHOUT_IDEMPOTENCY = NOT_THIS_METRIC
CUSTOMER_IDENTITY = NOT_USED
PRODUCT_ABANDONMENT_TIMEOUT_CREATED = NO
REPORT_AS_OF = AUTHORITATIVE_OCCURRENCE_TIME_STRICTLY_BEFORE_CUTOFF
CONCRETE_REPRESENTATION_DEFERRED = YES
```

An abandoned activation stays in the denominator. No timeout removes it. Checkout expiry and cart lifetime do not change Product behaviour. A direct start with no valid Cart-origin context is excluded. Unknown, stale, or other-cart context does not attach an unrelated activation. A retry of an activation that is already associated returns that same association. Several distinct Cart activations may share one still-active checkout. They remain separate denominator activations. Each one enters the numerator only through its own later Review-reached fact, as section 24 requires. An earlier Review on that journey does not count for a later activation. Reaching Review again does not require a second Offer-result-view observation when the same evaluation was already viewed.

The activation stores no customer id, guest id, coupon, money, or eligibility data.

```text
CART_REVIEW_CONTINUATION_SUPPORTED = YES
CART_REVIEW_PROXY_FROM_CHECKOUT_ROWS = REJECTED
SECONDARY_METRIC_RENAMED = NO
SECONDARY_METRIC_LEFT_UNAVAILABLE = NO
SAME_ACTIVATION_RETRY = ONE_OBSERVATION
NEW_CART_CHECKOUT_ACTION = DISTINCT_OBSERVATION
```


### Global cohort entry

The calculation uses only presented Checkout Review observations for one `CHECKOUT_JOURNEY_KEY`. An evaluation that was not presented is ignored.

1. Keep presented Checkout Review observations.
2. Choose the observation with the lowest `AUTHORITATIVE_JOURNEY_SEQUENCE`.
3. That observation is the one cohort-entry Review.
4. `GLOBAL_COHORT_ENTRY_TIME` is that observation's authoritative occurrence time.
5. The journey is in a window when `WINDOW_START <= GLOBAL_COHORT_ENTRY_TIME < WINDOW_END`.
6. No later presented Review is tested, even if its occurrence time falls in a later window.

```text
COHORT_ENTRY_SELECTED_PER_WINDOW = NO
COHORT_MEMBERSHIP = ZERO_OR_ONE
WINDOW = [START, END)
SERVER_EVALUATION_ALONE_COUNTS = NO
UNACKNOWLEDGED_RECEIPT_DENOMINATOR_EFFECT = NONE
```

A later presented Review records a higher sequence. It does not update the entry observation, so it cannot move the journey or add a denominator. Another visit that presents a new authoritative result may record another presented Review. The denominator remains one per journey key. Membership is not stored as a mutable flag. It is recomputed from the immutable entry observation, so the same facts and the same window yield the same membership. The Measurement Plan chooses the storage.

### Calendar, window, and report cutoff

```text
MEASUREMENT_CALENDAR_TIMEZONE = Asia/Kolkata
MEASUREMENT_CALENDAR_APPLIES_TO = THIS_MEASUREMENT_CONTRACT_ONLY
```

`PRODUCTION_RELEASE_ANCHOR` is a named instant supplied to the calculation. This candidate does not add a release table or a feature flag. The initial window is that instant through the same local clock time plus 28 civil days in `Asia/Kolkata`, half-open. An entry exactly at the start is inside. An entry exactly at the end is outside and belongs to the next window that starts at that instant, if that window is being reported. Adjacent windows do not overlap.

`REPORT_AS_OF` is an input of one published calculation, not a checkout column. For the initial snapshot it equals the exclusive end of the initial window. A fact is included only when its authoritative occurrence time is strictly before `REPORT_AS_OF`. A fact exactly at the cutoff is excluded. The same cutoff applied to the same facts includes the same events. Checkout expiry, payment state, and cart lifetime do not read this cutoff. This candidate does not select a timestamp column.

```text
PRODUCT_ABANDONMENT_TIMEOUT_CREATED = NO
```

### Primary metric

`CHECKOUT_REVIEW_TO_SUCCESSFUL_DIRECT_ORDER_COMPLETION_RATE` for a named cohort window and `REPORT_AS_OF`:

| Membership | Source |
|---|---|
| Cohort member | One presented Review: the lowest `AUTHORITATIVE_JOURNEY_SEQUENCE` among presented Reviews, tested against the half-open window |
| Denominator | Journey keys with at least one presented Review. A later presented Review does not add a key. An evaluation that was not presented does not add a key |
| Numerator | Those same keys with one successful direct-order completion whose authoritative occurrence time is strictly before `REPORT_AS_OF`. Payment `SUCCEEDED` alone is not the numerator |
| Unfinished | Denominator key with no such completion. Class `NOT_COMPLETED_AS_OF_REPORT_CUTOFF` |
| Completed segment | Greatest `AUTHORITATIVE_JOURNEY_SEQUENCE` among presented Reviews that precede the completion's sequence. The class is the server presentation class on that observation |
| Unfinished segment | Greatest `AUTHORITATIVE_JOURNEY_SEQUENCE` among presented Reviews whose occurrence time is strictly before `REPORT_AS_OF` |

An evaluation that was never presented cannot overwrite the segment. `COMMERCIAL_STATE_CHANGE` is not a segment source.

```text
SUCCESSFUL_DIRECT_ORDER_COMPLETION_AUTHORITY = ORDER_MATERIALIZATION_TRANSACTION
PAYMENT_SUCCESS_ALONE_COUNTS_COMPLETION = NO
ORDER_MATERIALIZATION_ESTABLISHES_COMPLETION = YES
```

`applySuccess` commits Payment `SUCCEEDED` and Checkout `COMPLETED` first. `tryMaterializeOrderAfterPaymentCompletion` runs after that transaction and swallows errors. It is not the event authority. The normal hook and `recoverMissingOrdersBatch` both call `materializeOrderForCompletedCheckout`. The completion event is written only inside that function.

That function already proves accepted payment truth before it inserts the Order. For a positive payable it requires Checkout `COMPLETED`, the active snapshot belonging to that checkout, and a `SUCCEEDED` payment for that exact snapshot. For a zero payable it requires Checkout `COMPLETED`, snapshot payable `0`, no payment on that snapshot, and Order provenance `NO_PAYMENT_REQUIRED`. No synthetic payment row is inserted. The Order insert is the first transaction in which the direct order is placed and that accepted payment truth both hold.

In that same transaction, after those checks, and before commit:

- If this checkout has no journey key, this measurement contract does not invent one. Historical orders stay outside the metric.
- If there is no Order yet, the function inserts the Order and records exactly one successful direct-order completion for that journey. The occurrence time is that transaction's clock. A failure to record the completion rolls back the Order. The numerator is still counted only when the journey has a qualifying presented Review.
- If the Order already exists, the function does not insert another Order. Before it treats measurement completion as satisfied, it ensures the completion fact. When that fact is already present, the ensure returns it, including when the journey is already closed to new facts. It writes nothing and allocates no sequence. When the fact is absent and the journey is still open, this transaction records it and closes the journey. When the fact is absent and the journey is already closed, that is an invariant violation: the ensure rejects the new fact and does not reopen the journey. One completion exists per journey key.
- A unique-violation race on `orders.checkout_id` follows the same ensure. The winning transaction commits the Order and the completion together. The loser sees the committed Order and does not allocate a second completion sequence.

Zero-payable completion also reaches this function through `tryMaterializeOrderAfterPaymentCompletion` after `completeZeroPayableCheckout`. The completion fact is still recorded here, not in the zero-payable transaction and not because a payment row succeeded.

Equal occurrence times still have different sequences, so segment selection stays a total order. The metric does not read page views, customer id, ingest order, unordered physical storage order, the live Promotion row, or an evaluation that was not presented.

```text
CHECKOUT_JOURNEY_KEY_PII = NO
AUTHORITATIVE_JOURNEY_SEQUENCE_PII = NO
CUSTOMER_IDENTITY_USED_AS_MEASUREMENT_JOIN = NO
RAW_COUPON_TEXT_IN_MEASUREMENT = NO
NEW_SERVICE_REQUIRED = NO
NEW_QUEUE = NO
SECOND_COMMERCE_AUTHORITY = NO
```

Customer identity remains on checkout and on the first-order guard for eligibility and auth. It is not a measurement join, and the rate does not join through it.

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
| Evaluate response never presented | Authoritative evaluation exists | `evaluateCheckout` or `evaluateCart` | No presented observation | A later observation of that committed UI is the first view. A retry is not a second view | `DENOMINATOR_EFFECT = NONE` until then |
| Duplicate presented observation | One evaluation and one committed UI descriptor | Measurement serialization re-reads that evaluation before it treats the journey as closed | The first observation commits | The second returns that observation and consumes no sequence | One presented Review. No second denominator |
| Duplicate Review observation after successful completion | Existing presented observation for that evaluation, completion recorded, journey closed | Re-read that evaluation before the closed-journey check | Returns the existing presented observation | No closure error. No new sequence. No new denominator. Closure stays | One denominator. Journey stays closed |
| Completion replay after closure | Existing successful completion, journey closed | Materialization or recovery re-reads that completion identity before the closed check | Returns the existing completion | No second completion. No new sequence. Journey is not reopened | Existing numerator fact |
| New Review fact after closure | Journey closed. That evaluation has no presented observation | Re-read finds no observation, then the closed-journey check rejects | No observation is recorded | No sequence. No new denominator. Journey stays closed | `NEW_PRESENTATION_AFTER_CLOSED_JOURNEY = REJECT` |
| Closed journey without a completion fact | Journey closed and no successful completion | Completion ensure re-reads that journey identity and finds nothing | Invariant violation. Not a replay | No completion append. No sequence. No reopen | Not repaired by a late completion insert |
| Pay before the separate presentation observation commits | Same authoritative Review evaluation carried as measurement context | Payment-progression transaction | Presented fact is recorded first, then the progression or attempt fact | A later observation of that evaluation returns the existing fact | Journey order stays causal. Pay is not delayed |
| First measurement fact, ordering not yet established | Presentation and Pay fallback both start | Both use the same conflict-safe ordering rule | One ordering record. The presented evaluation is recorded once. Pay continues | The waiter re-reads and does not abort the commercial transaction | Review sequence is strictly before the payment sequence when Pay relies on that evaluation |
| Duplicate observation after Pay already recorded the evaluation | Existing presented fact | Later observation | Returns the existing fact | No new sequence for that evaluation | One denominator |
| Two different first measurement facts | Ordering not yet established, then two distinct facts | Same serialization | Sequences are unique and strictly increasing | The second waits | Semantic order constraints still hold. Neither business transaction fails only because ordering was created |
| Two checkouts with equal `created_at` | Strict causal order under the cart lock | `startCheckout` | The later insert is strictly later | UUID values are ignored | Predecessor selection follows that order. Encoding is not selected |
| Payment-driven expired row, then a later explicit cancel | Latest causal row is the cancel | Next `startCheckout` reads that one latest row | New journey key | It does not read the older expired row | Boundary stands |
| Payment-driven expired row, then a later completed checkout | Latest causal row is the completion | Next `startCheckout` reads that one latest row | New journey key | It does not recover the older expired key | Boundary stands |
| Historical active checkout after release | One non-terminal row not yet ordered | First Cart-then-Checkout adoption command | That row is ordered and receives a journey key once | Historical terminal rows stay unordered | No `created_at` or UUID backfill |
| Guest-cart reconciliation races payment binding | Both lock `customer_auth_users` before any cart | Separate transactions | Customer row serializes them | Existing revision conflict is allowed | No PostgreSQL deadlock. Measurement serialization does not precede the customer or the cart |
| Same commercial change retried | One origin at the committed revision, one authoritative result | Evaluate re-reads the result, then re-reads the change observation | The first commit | The retry allocates no second sequence | One `COMMERCIAL_STATE_CHANGE` |
| Concurrent duplicate evaluation of one changed result | Same checkout, revision, and authoritative fingerprint | Evaluate commit | One result and one change observation | The loser re-reads both | No second sequence |
| New changed result after closure | Closed journey and no change observation for that result | Result write and change observation are one transaction | The append rejects the new fact | The result does not commit | Journey stays closed |
| Replay of an existing change after closure | Existing change observation for that result | Re-read before the closed check | Returns that observation | No new sequence. Journey is not reopened | One observation |
| Cart activation retry | Same Cart activation identity | Cart lock | The existing activation observation | A lost response retried for that activation returns it | One activation. No second denominator |
| Later distinct Cart activation | A new genuine Cart-surface Checkout activation | Cart lock | A distinct activation observation | The older unassociated activation is not returned | The new activation is its own denominator. The abandoned activation stays denominator-only |
| Direct checkout without Cart-origin context | No valid Cart-origin context | `startCheckout` | Checkout proceeds. No activation is created or consumed | Not counted in the Cart metric | Direct entry stays excluded |
| Unknown, stale, or other-cart context | The presented context does not belong to this cart's activation | `startCheckout` | Checkout proceeds. That context is not attached | No unrelated activation is reclassified | That activation stays unassociated |
| Reused active checkout with a valid journey key | Existing `DRAFT`, `READY_FOR_PAYMENT`, or `PAYMENT_PENDING` checkout for that cart, plus valid same-cart Cart-origin context | `startCheckout` returns the existing checkout and does not insert one | The activation associates with that existing journey key | The key is not rewritten and a second key is not minted | Association alone is not the numerator. A Review reached after this activation may enter it. An earlier Review does not. Other activations stay distinct |
| Later activation after an earlier Review only | Journey already has Review `R1`, then a new Cart activation `A2`, and no Review after `A2` | Existing checkout is reused | `A2` is its own denominator | `A2` is not counted from `R1` | `A2` stays denominator-only |
| Later activation then a later Review | `A1`, `R1`, then `A2`, then Review reached `R2` after `A2` | Same journey | `A1` and `A2` may both enter the numerator | The Offer-result view of an unchanged evaluation is not forced to duplicate | Both activations are numerator when each has its own subsequent Review reach |
| Same activation then one Review | `A1` and a transport retry of `A1`, then one Review reached after that activation | Cart lock | One denominator | The retry is not a second activation | One numerator |
| Associated activation replay | The activation is already associated | Same activation identity | Return the same association | No second association and no second denominator | One activation |
| New Cart activation after completion or cancel | Previous activation holds the closed or cancelled journey | New activation identity | A new activation observation | The old journey is not reopened by the new activation | One new denominator |

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
| Equal checkout timestamps do not choose the predecessor | Section 27A. Strict causal order under the existing cart lock. UUID order is not. Encoding is deferred |
| Review must be presented | Section 27A. `SERVER_EVALUATION_ALONE_COUNTS = NO`. An evaluation that was not presented has no denominator effect |
| Review revisit does not add a denominator | Section 27A cohort steps 1–6. One presented observation per evaluation. Denominator remains one key |
| Successful completion joins on the same key | Section 27A. Recorded in Order materialization. Payment success alone is not completion |
| Global cohort entry selected once | Lowest presented-Review `AUTHORITATIVE_JOURNEY_SEQUENCE` |
| Equal-time events still totally ordered | `AUTHORITATIVE_JOURNEY_SEQUENCE`, not occurrence time and not ingest order |
| Half-open window assignment | `[START, END)` in `Asia/Kolkata` |
| Report-as-of | Authoritative occurrence time strictly before `REPORT_AS_OF`. Segment uses presented Reviews only |
| Pay before acknowledgement | Presentation is recorded before the later payment measurement fact |
| Customer identity is not the journey join | Measurement facts do not use customer identity as the join |
| Raw coupon text is not stored | No raw coupon text, private eligibility reason, payment secret, customer PII, or another customer's data. Presentation evidence is the minimum needed for the financial-truth guardrail, not a second money ledger. Retention stays the existing approved rule |
| Displayed savings integrity | Sections 24 and 27A. Server explanation integrity stays independent. Expected-versus-observed presentation match uses the committed UI at amount-level fidelity, on Cart and Checkout Review. A browser integrity assertion cannot override a mismatch |
| Commercial state-change identity | Section 27A. One changed Review result, one change observation. Source origin is the revision the command committed |
| Cart → Review continuation | Sections 24 and 27A. One observation per Cart activation. A later activation is distinct. A reused active checkout may associate. Numerator entry requires a Review reached after that exact activation. An earlier Review does not satisfy it. A new Offer-result view is not required. Checkout-row ratio is rejected |
| Cart amount before checkout context | Section 6. Authoritative for Cart scope only. Not a final payable |
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
| Measurement | One key across a cart-revision checkout replacement; payment-driven latest `EXPIRED` copies that key onto the next checkout; a later explicit cancel or completion does not; an evaluation that was not presented does not enter the denominator; a duplicate observation of one presented Review consumes no second sequence; a replay after journey closure returns the existing fact and adds no sequence; a new presented fact on a closed journey is rejected; completion replay after closure returns the existing completion; a closed journey with no completion fact is an invariant violation and is not repaired by reopening; Pay-before-observation keeps the presented sequence first; segment reads presented Reviews only; one completion per journey on both normal and recovery materialization; revisit does not add a denominator; equal occurrence times still have one total order; half-open window; report cutoff uses authoritative occurrence time only |
| Savings integrity | Expected rendered ₹80 against authoritative ₹80 matches on Cart and on Checkout Review; expected ₹80 rendered as ₹8 mismatches; an omitted saving row mismatches; an unexpected rendered saving row mismatches; an incorrect component split with the same total is detectable where displayed parts must match; a browser-submitted integrity assertion cannot override a mismatch; a server explanation mismatch stays independently detectable; the report includes `CART` and `CHECKOUT_REVIEW` and does not relabel one as the other; measurement stores no raw coupon text, no private eligibility reason, no payment secret, and no customer PII; the observation is derived from the committed presentation and is not a second money ledger; copying an existing journey key does not mint or rewrite it |
| State-change dedup | The same coupon, fulfilment, or stale-recovery operation retried after commit allocates no second sequence; a concurrent duplicate of that same result records one change observation; a closed-journey replay returns that observation; one origin does not produce a second state-change observation |
| Cart continuation | The same activation retried, including after a lost response and including two rapid requests, is one denominator and, with one subsequent Review reach, one numerator; a later distinct Cart activation is another denominator; that later activation stays denominator-only when the only Review is earlier; both activations enter the numerator when each is followed by its own Review reach; abandonment after a later activation leaves that activation denominator-only; a direct Checkout entry is excluded; unknown, stale, and other-cart context are not attached; a reused active checkout with a valid journey key associates that activation without rewriting the key; the same evaluation need not duplicate the Offer-result view; several activations may share that journey without collapsing; replay of an associated activation returns the same association; ordering does not use ingestion order, cart identity alone, or any earlier Review; the activation stores no customer id, guest id, coupon, money, or eligibility |
| Persistence concurrency | Two complimentary activations; two first-order reservations sharing one guard when the winner is a pair; last cap unit; payment retry after `RELEASED`; composite snapshot-line foreign key rejects a cross-snapshot `snapshot_line_id`; payment binding racing `reconcileGuestCartWithCustomer` finishes without a deadlock; two transactions establish one journey ordering record without aborting the commercial transaction; one presentation and one Pay fallback race, leave exactly one presented fact, both complete, and keep a deterministic unique sequence; equal checkout timestamps and random UUID order cannot change predecessor selection; causal order is strict for one cart; a latest `CANCELLED` or `COMPLETED` boundary blocks an older `EXPIRED` continuation; a latest payment-driven `EXPIRED` predecessor keeps the journey key; an active pre-extension checkout is adopted once under the Cart-then-Checkout rule; historical terminal rows are not ordered from UUID or `created_at` |
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
| New analytics platform, queue, broker, or generic rules engine | No. Measurement stays inside existing commerce authority and the existing Order-materialization transaction, joined on an opaque journey key. This candidate does not select the store |
| New façade route | Not selected. If the later Measurement Plan uses the customer façade, it stays `/api/v1/*` on `customer-commerce`, writes no price, and adds no Server Action, Next route handler, second backend, or analytics service |
| New fields, migration, façade route extensions, benefit types, capability-specific tables and unique indexes | Yes for commerce: the guard table, complimentary benefit shape, and the snapshot candidate key. Those do not by themselves require a global ARCH bump. Measurement persistence is not selected here |
| Repository-wide checkout creation order | No. Journey continuity uses strict causal order under the existing per-cart lock inside `startCheckout`. It is not a new global ordering service |

D-382 remains the sequencing authority. FD-036J-01, FD-036J-02, and FD-036J-03 remain Product Definition decisions. They are not copied into the Decision Register by this candidate. Candidate 5's independent Fit PASS and the concrete measurement representation it locked stay historical provenance. That representation is a `NON_BINDING_MEASUREMENT_PLAN_OPTION`. It is not a Candidate 9 Fit PASS criterion, and Candidate 5 is not rewritten as a failure. Candidate 6 keeps the server savings-explanation comparison, revision-backed change provenance, and the Cart-activation grain. Candidate 7 keeps cross-surface integrity feasibility and the distinction between one activation retry and a later activation. Its exact-head review stopped. Candidate 8 keeps the Measurement Plan ownership boundary and reused-active-checkout association. Its exact-head review stopped. Candidate 9 keeps those semantics, requires amount-level observation of the actually committed presentation, and requires a Review reached after the exact Cart activation. Schema, transport, storage, identifier encoding, event ownership, sequence encoding, and the presentation-observation encoding stay with the Measurement Plan. None of this adds a service, a queue, a broker, an auth model, a permission, or a second Pricing or Promotion authority.

```text
GLOBAL_ARCHITECTURE_CHANGE_REQUIRED = NO
NEW_SERVICE_REQUIRED = NO
NEW_AUTH_MODEL_REQUIRED = NO
NEW_PERMISSION_REQUIRED = NO
SECOND_PRICING_AUTHORITY_CREATED = NO
SECOND_PROMOTION_AUTHORITY_CREATED = NO
```

No D-383 is created. ARCH-R23 stays current.

---

## 32. Candidate 9 Architecture Fit PASS

Candidate 5 recorded a fit result. Independent review `5347761109` accepted it. That PASS remains
historical provenance and is not rewritten as a failure. Candidate 9 supersedes it as the current
lock. Candidate 6 fixed the Cart money
boundary, Review integrity persistence, `COMMERCIAL_STATE_CHANGE` provenance, and the initial
Cart to Review grain. Exact-head review findings `4135054894` and `4135054908` stopped that
candidate. Independent Architecture Fit review of Candidate 6 is `STOP`. Candidate 6 was never
merged and never locked, and it is not rewritten as a pass. Candidate 7 added cross-surface
Cart integrity feasibility and per-activation distinction. Exact-head review findings
`4135593837`, `4135593847`, and `4135593861` stopped that candidate. Independent Architecture
Fit review of Candidate 7 is `STOP`. Candidate 7 was never merged and never locked, and it is
not rewritten as a pass. Candidate 8 kept the Measurement Plan ownership boundary, associated a
reused active checkout, and required an observed committed UI presentation. Exact-head review
findings `4136530636` and `4136530647` stopped that candidate. Independent Architecture Fit
review of Candidate 8 is `STOP`. Candidate 8 was never merged and never locked, and it is not
rewritten as a pass. Candidate 9 remediates those two findings. Independent Architecture Fit
review of Candidate 9 is `PASS` at head `052289471cfc2424879932e16fd88d6c16696de8`, tree
`ed6d0b4c7e82eef4fd764c0fe3f73539f8e1858b`, and governance fingerprint
`5be074e0736c097b6d68f18a3b71cd26cc69c03600eac0cf956bf74d0b6834b0`. CI run `36611527090`
attempt 2 and CodeQL run `36611527053` passed on that head. Fresh Codex issue comment
`5896150834` reported no major issues. No numeric independent ChatGPT review identifier was
available.

```text
CANDIDATE_9_ARCHITECTURE_FIT_REVIEW = PASS
ARCHITECTURE_FIT_PASS_CLAIMED_FOR_CANDIDATE_9 = YES
ARCHITECTURE_LOCK = LOCKED
HISTORICAL_CANDIDATE_8_ARCHITECTURE_FIT_REVIEW = STOP
CANDIDATE_8_REWRITTEN_AS_PASSED = NO
ARCHITECTURE_FIT_PASS_CLAIMED_FOR_CANDIDATE_8 = NO
HISTORICAL_CANDIDATE_7_ARCHITECTURE_FIT_REVIEW = STOP
CANDIDATE_7_REWRITTEN_AS_PASSED = NO
HISTORICAL_CANDIDATE_6_ARCHITECTURE_FIT_REVIEW = STOP
CANDIDATE_6_REWRITTEN_AS_PASSED = NO
ARCHITECTURE_FIT_PASS_CLAIMED_FOR_CANDIDATE_7 = NO
ARCHITECTURE_FIT_PASS_CLAIMED_FOR_CANDIDATE_6 = NO
HISTORICAL_CANDIDATE_5_FIT_RESULT = PASS
CANDIDATE_5_REWRITTEN_AS_FAILED = NO
ARCHITECTURE_FIT_SOURCE_CANDIDATE = IMP-036J-FIT-CANDIDATE-9
MANDATORY_STORIES_RECHECKED = US-036J-001 .. US-036J-013
EXPERIENCE_RECHECKED = XD-IMP-036J-DRAFT-6
CONTRADICTIONS = NONE
PRODUCT_DECISION_REQUIRED = NONE
GLOBAL_DECISION_REQUIRED = NO
```

Every mandatory story still has a safe fit inside the accepted Promotion, Pricing, Cart, Checkout Snapshot, Order, Catalog, and Availability authorities. The approved Experience Definition's presentation facts and X3 measurement contract are specified as semantic constraints: displayed-savings integrity on Cart and Checkout Review, amount-level observation of the actually committed presentation, commercial state-change identity, and Cart → Review continuation by activation, including a reused active checkout whose numerator requires a later Review reach. Concrete measurement encoding is not a Fit PASS criterion. Product and Experience semantics are unchanged. `PD-IMP-036J-DRAFT-6` and `XD-IMP-036J-DRAFT-6` are not modified.

```text
IMP036J_DESIGN_READINESS = PASS
QUALITY_TEST_PLAN_FINALIZED = YES
MEASUREMENT_INSTRUMENTATION_PLAN_FINALIZED = YES
IMPLEMENTATION_PLAN = PASS
IMP036J_IMPLEMENTATION_AUTHORIZED = YES
IMP036J_STARTED = NO
IMP036J_IMPLEMENTATION_STARTED = NO
IMP036J_NEXT_GATE = IMPLEMENTATION_TRANCHE_1
```

Design Readiness PASS and the finalized Quality/Test Plan and Measurement/Instrumentation Plan
are persisted in their own documents. This architecture record does not itself grant implementation authority.
Those plans remain part of Design Readiness. Implementation Plan PASS is persisted separately.
Founder Implementation Authorization is recorded in ROADMAP/STATE as APPROVED and NOT_STARTED.
Architecture Fit PASS does not start implementation. Architecture Fit PASS is not Design Readiness and is not a finalized
Measurement/Instrumentation Plan.

```text
CANONICAL_GLOBAL_ARCHITECTURE_CHANGED = NO
ARCHITECTURE = ARCH-R23
DECISION_REGISTER = DR-23
D-383 = NOT_CREATED
NEW_ADR = NO
ROADMAP_CHANGED = YES
STATE_CHANGED = YES
IMPLEMENTATION_STARTED = NO
```
