<!-- governance-meta
{
  "status": "APPROVED",
  "authority": "PRODUCT_DEFINITION",
  "capability": "IMP-036J",
  "productDefinitionVersion": "PD-IMP-036J-DRAFT-6",
  "productDefinitionStatus": "APPROVED",
  "productDefinitionGate": "PASS",
  "architectureFit": "PASS",
  "implementationAuthorized": true
}
-->

# IMP-036J — Promotions, Coupons & Offers

```text
PRODUCT_DEFINITION_VERSION = PD-IMP-036J-DRAFT-6
STATUS = APPROVED
PRE_GATE_DRAFT = NO
PRODUCT_DEFINITION_IN_PROGRESS = NO
DRAFT_READY_FOR_GATE = NO
APPROVED = YES
PRODUCT_DEFINITION_GATE_EXECUTION = PERFORMED
PRODUCT_DEFINITION_GATE = PASS
IMP036J_PRODUCT_DEFINITION = APPROVED
IMP036J_PRODUCT_DEFINITION_GATE = PASS
ARCHITECTURE_FIT = PASS
IMP036J_ARCHITECTURE_FIT = PASS
IMP036J_ARCHITECTURE_LOCKED = YES
IMP036J_DESIGN_READINESS = PASS
IMP036J_NEXT_GATE = IMPLEMENTATION_TRANCHE_2
IMPLEMENTATION_AUTHORIZED = YES
IMP036J_IMPLEMENTATION_AUTHORIZED = YES
IMP036J_IMPLEMENTATION_STARTED = YES
IMP036J_FORMAL_LIFECYCLE = IMPLEMENTATION_IN_PROGRESS
FOUNDER_UAT = NOT_PERFORMED
IMP036J_ACCEPTED = NO
OPEN_FOUNDER_PRODUCT_DECISIONS = 0
UNRESOLVED_MATERIAL_PRODUCT_DECISIONS = 0
FOUNDER_UAT_REQUIRED = YES
FOUNDER_PRODUCT_DEFINITION_APPROVAL = YES
FOUNDER_PRODUCT_DEFINITION_APPROVAL_DATE = 2026-09-28
INDEPENDENT_PRODUCT_DEFINITION_GATE = PASS
GATE_EVALUATED_HEAD = 24aa3ced280dbfc18ac52275ed97ae919904481d
GATE_EVALUATED_TREE = e7fd72f2af3b0267f438bf9b65e7f7f23bf43f27
GATE_EVALUATED_FINGERPRINT = 9f9c708306a76e140ea4143feaf8e007ca975f03c3dc418f65e30aaf8bbbd1e1
FD-036J-01 = APPROVED
FD-036J-01_DECISION_DATE = 2026-09-27
FD-036J-02 = APPROVED
FD-036J-02_DECISION_DATE = 2026-09-27
FD-036J-03 = APPROVED
FD-036J-03_DECISION_DATE = 2026-09-28

PRODUCT_DELIVERY_PROCESS_EFFECTIVE_FROM = IMP-036F
HISTORICAL_ACCEPTED_IMPS_REWRITTEN = NO
IMP036E_LIFECYCLE_CHANGED = NO
PD1_DID_NOT_ACTIVATE_IMP036F_AT_ADOPTION = YES
```

This artifact remains version `PD-IMP-036J-DRAFT-6`. Its status is **APPROVED**. An independent
Product Definition Gate was performed against the exact merged candidate recorded below and
returned PASS. Founder approval to persist that PASS was given on 2026-09-28. That Product
Definition Gate persistence did not itself perform Architecture Fit, lock architecture, authorize
implementation, or create a new Founder product decision, FD-036J-04, or a Decision Register
entry. Lifecycle truth remains
[`ROADMAP.md`](../../ROADMAP.md) and [`STATE.md`](../../STATE.md). DRAFT-6 closes the DRAFT-5
acceptance-slice concurrency gap for complimentary-item activation.

Current lifecycle pointer: Architecture Fit current source is `IMP-036J-FIT-CANDIDATE-9`. Architecture Fit is PASS. Architecture is LOCKED. Evaluated head `052289471cfc2424879932e16fd88d6c16696de8`, evaluated tree `ed6d0b4c7e82eef4fd764c0fe3f73539f8e1858b`, evaluated governance fingerprint `5be074e0736c097b6d68f18a3b71cd26cc69c03600eac0cf956bf74d0b6834b0`. The [capability architecture](../../capabilities/IMP-036J-promotions-coupons-offers.md) is locked. Design Readiness is PASS for `IMP-036J-DESIGN-CANDIDATE-2`. Implementation Plan is PASS for `IMP-036J-PLAN-CANDIDATE-1`. Implementation Authorization is APPROVED on 2026-10-01 (pull request #332 comment `5926464685`). Next gate: Implementation Tranche 2. Implementation is AUTHORIZED and STARTED. Formal lifecycle is IMPLEMENTATION_IN_PROGRESS. Tranche 1 is PASS. Tranche 2 has not started. Product semantics and Gate provenance are unchanged.

Prior lock history: independent Architecture Fit review `5347761109` passed `IMP-036J-FIT-CANDIDATE-5`. Candidate 5 is historical prior-lock provenance and is not the current Architecture Fit source.

### Historical candidate — `PD-IMP-036J-DRAFT-5`

DRAFT-5 remains historical. It was ready for Gate (`DRAFT_READY_FOR_GATE = YES`). Founder
decisions FD-036J-01, FD-036J-02, and FD-036J-03 were all approved. An independent Product
Definition Gate was executed against DRAFT-5. The Gate result was `STOP`. The blocker was
acceptance and concurrency completeness: FD-036J-03 already required at most one ACTIVE
complimentary-item Offer, and AC-036J-012-05 proved only the sequential second-activation denial.
It did not prove two overlapping activations when none was yet ACTIVE. No new Founder decision
was required. Gate PASS was not persisted. Architecture Fit was not performed. Implementation was
not authorized. DRAFT-6 supersedes DRAFT-5. DRAFT-5 history is not rewritten as Gate PASS.

### Historical candidate — `PD-IMP-036J-DRAFT-4`

DRAFT-4 remains historical. It was ready for Gate (`DRAFT_READY_FOR_GATE = YES`). An independent
Product Definition Gate review returned `DECISION_REQUIRED` because the complimentary-item
operating rules added during review did not yet have explicit Founder product authority.
FD-036J-03 was required. Gate did not PASS. Gate PASS was not persisted. Architecture Fit was
not performed. Implementation was not authorized. DRAFT-5 supersedes DRAFT-4 after Founder
approval of FD-036J-03. DRAFT-4 history is not rewritten as approved or as Gate PASS.

### Historical candidate — `PD-IMP-036J-DRAFT-3`

DRAFT-3 remains historical. It was ready for Gate (`DRAFT_READY_FOR_GATE = YES`). An independent
Product Definition Gate evaluation initially returned PASS. Gate-persistence pull request #312
then received material exact-head review findings `4115981679` and `4115981682`. Those findings
reopened the acceptance slice. Gate PASS was not persisted. Canonical main never recorded DRAFT-3
as `APPROVED`. DRAFT-3 is superseded by DRAFT-4. DRAFT-3 did not authorize implementation.

### Historical candidate — `PD-IMP-036J-DRAFT-2`

DRAFT-2 remains historical. It was the previous current candidate and recorded
`DRAFT_READY_FOR_GATE = YES`. An independent Product Definition Gate evaluation of the
persistence candidate initially returned PASS. Exact-head persistence review `5329990164`
then found a material omission (comment `4115044083`): the compatible merchandise-plus-delivery
outcome was not a required deterministic result. A secondary finding (comment `4115044090`)
noted a story-readiness contradiction in that attempted Gate-PASS version. Gate persistence
was stopped. Pull request #310 was closed without merge. Canonical main never recorded
DRAFT-2 as `APPROVED` or Product Definition Gate PASS. The Product Definition was reopened.
FD-036J-02 became required and is approved in DRAFT-3. DRAFT-2 is superseded by DRAFT-3.
DRAFT-2 did not authorize implementation.

### Historical candidate — `PD-IMP-036J-DRAFT-1`

DRAFT-1 remains historical. It was `PRE_GATE_DRAFT` with `DRAFT_READY_FOR_GATE = NO`. Its only
open material Founder decision was FD-036J-01. That draft recommended Cart as the only coupon
entry field, with Checkout showing the applied or failed result, removal, and retry, and it
stated that a second Checkout entry field was not required under that recommendation. DRAFT-1
also grouped Deals, Campaigns, Revenue Recommendations, loyalty program, experimentation, and a
second money engine under one coarse `DEFERRED` label. DRAFT-2 keeps that history. It records
Founder approval of FD-036J-01 and replaces the coarse label with separate categories. DRAFT-1
is not the current candidate.

### Program context (CURRENT tip — verify against ROADMAP/STATE)

```text
ROADMAP = GTM-R180
STATE = STATE-R178
ARCHITECTURE = ARCH-R23
decision-register = DR-24
acceptedThrough = IMP-036I
currentProductSlice = IMP-036J
nextProductSlice = IMP-036K
pendingAcceptance = NONE
PROGRAM_PAUSE = PRE_GTM_PRODUCT_INSERTION_PROVIDER_BLOCKED
PROGRAM_PAUSE_AUTHORITY = D-377
ADDITIONAL_SEQUENCING_AUTHORITY = D-382
IMP036J_ACTIVATED = YES
IMP036J_PRODUCT_DEFINITION = APPROVED
IMP036J_PRODUCT_DEFINITION_VERSION = PD-IMP-036J-DRAFT-6
IMP036J_PRODUCT_DEFINITION_GATE = PASS
IMP036J_ARCHITECTURE_FIT = PASS
IMP036J_ARCHITECTURE_LOCKED = YES
IMP036J_IMPLEMENTATION_AUTHORIZATION = APPROVED
IMP036J_IMPLEMENTATION_AUTHORIZED = YES
IMP036J_IMPLEMENTATION_AUTHORIZATION_DATE = 2026-10-01
IMPLEMENTATION_AUTHORIZATION_EVIDENCE = PR#332/5926464685
IMP036J_STARTED = YES
IMP036J_IMPLEMENTATION_STARTED = YES
IMP036J_FORMAL_LIFECYCLE = IMPLEMENTATION_IN_PROGRESS
IMP036J_TRANCHE_1 = PASS
FOUNDER_UAT = NOT_PERFORMED
IMP036J_ACCEPTED = NO
IMP036J_EXPERIENCE_CRITICALITY = X3
IMP036J_CHANGE_RISK = CR2
IMP036J_EXPERIENCE_DEFINITION = APPROVED
IMP036J_EXPERIENCE_DEFINITION_VERSION = XD-IMP-036J-DRAFT-6
IMP036J_EXPERIENCE_GATE = PASS
IMP036J_DESIGN_READINESS = PASS
QUALITY_TEST_PLAN_FINALIZED = YES
MEASUREMENT_INSTRUMENTATION_PLAN_FINALIZED = YES
IMPLEMENTATION_PLAN = PASS
IMPLEMENTATION_PLAN_FINALIZED = YES
READY_FOR_IMPLEMENTATION_AUTHORIZATION = YES
IMP036J_NEXT_GATE = IMPLEMENTATION_TRANCHE_2
```

Discovery history in
[`../../discovery/offers-deals-campaigns.md`](../../discovery/offers-deals-campaigns.md)
and
[`../../discovery/offers-deals-campaigns-story-map.md`](../../discovery/offers-deals-campaigns-story-map.md)
remains historical discovery authority. ODC-01..ODC-14 stay approved discovery direction.
This draft consumes that direction only for Promotions, Coupons, and Offers. It does not
reopen those discovery decisions and does not itself assign IMP identity to Deals, Campaigns,
or Revenue Recommendations. D-383 later allocates Revenue Recommendations as IMP-036K for
parallel definition preparation only. Deals and Campaigns stay unallocated.

---

## 1. Identity / version / status

| Field | Definition |
|---|---|
| Capability / title | IMP-036J — Promotions, Coupons & Offers |
| Product Definition version / document status | `PD-IMP-036J-DRAFT-6`; **Document status: APPROVED**; `PRE_GATE_DRAFT = NO`; `PRODUCT_DEFINITION_IN_PROGRESS = NO`; `DRAFT_READY_FOR_GATE = NO`; `APPROVED = YES`. |
| Product owner / approval evidence | Founder sequencing authorization 2026-09-27 (Promotions first) recorded as **D-382**. FD-036J-01 and FD-036J-02 approved by the Founder on 2026-09-27. FD-036J-03 approved by the Founder on 2026-09-28. Founder Product Definition Gate-PASS approval on 2026-09-28. Independent Product Definition Gate PASS against HEAD `24aa3ced280dbfc18ac52275ed97ae919904481d` / tree `e7fd72f2af3b0267f438bf9b65e7f7f23bf43f27` / fingerprint `9f9c708306a76e140ea4143feaf8e007ca975f03c3dc418f65e30aaf8bbbd1e1`. |
| Process / verification policy | PD-2 / EXP-1 / LANG-1 / TEST-1. This Product Definition was approved under PD-1. PD-2 does not reopen that gate. |
| Canonical anchors | VISION-1; ROADMAP GTM-R180; STATE STATE-R178; ARCH-R23; DR-24 (D-377 CURRENT; D-382 AMENDED by D-383 for Revenue Recommendations identity, activation, and sequencing only; D-383 CURRENT; next decision ID D-384); EXP-1; LANG-1; accepted IMP-016 Promotions; accepted IMP-036F commercial management; ADR-007 CURRENT; accepted IMP-036H fulfilment mode; accepted IMP-036I scheduled timing |
| Repository candidate | `/home/ajoshi/repos/boba-bear-platform`; branch recorded at publication; HEAD / tree / fingerprint recorded by the activating change. This draft is not an acceptance candidate. |
| Capability lifecycle / authorization | ROADMAP/STATE: formal lifecycle `IMPLEMENTATION_IN_PROGRESS`; `IMP036J_ACTIVATED: YES`; Product Definition `APPROVED`; Gate `PASS`; Experience Criticality `X3`; Experience Definition `APPROVED` (`XD-IMP-036J-DRAFT-6`); Experience Gate `PASS`; next gate `IMPLEMENTATION_TRANCHE_2`; Fit `PASS`; architecture `LOCKED`; Design Readiness `PASS`; Quality/Test Plan finalized; Measurement/Instrumentation Plan finalized; Implementation Plan `PASS`; implementation `AUTHORIZED` / `STARTED`; Tranche 1 `PASS`; Tranche 2 not started; `IMP036J_IMPLEMENTATION_COMPLETE: NO`; `IMP036J_ACCEPTED: NO` |
| Relevant capability architecture / ADRs | Locked capability architecture [`../../capabilities/IMP-036J-promotions-coupons-offers.md`](../../capabilities/IMP-036J-promotions-coupons-offers.md). Architecture Fit `PASS` for current source `IMP-036J-FIT-CANDIDATE-9`. Architecture is `LOCKED`. Prior lock history: `IMP-036J-FIT-CANDIDATE-5` independent review `5347761109`. Binding money authority remains accepted Promotion / Coupon / Pricing / Checkout Snapshot (ADR-007; IMP-016; IMP-036F). Fulfilment mode remains D-378 / IMP-036H. Scheduled timing remains D-379 / IMP-036I. |
| Founder UAT applicability | `FOUNDER_UAT_REQUIRED = YES` when this capability later changes customer-visible savings and operator-visible commercial operation. UAT is not in progress and is not passed by this draft. |

### Terminology

These words stay distinct:

| Term | Meaning in this Product Definition |
|---|---|
| `PROMOTION` | The existing monetary/commercial authority. |
| `OFFER` | Conditional customer and operator commercial meaning over that accepted Promotion authority. An Offer does not independently set money. |
| `COUPON` | The Offer activation mechanism when code activation is used. |
| `DEAL` | A directly purchasable value proposition / merchandise-like commerce concept. Parked. Not this slice. |
| `CAMPAIGN` | An operator/business orchestration concept over Deals and Offers. Parked. Not this slice. |

## 2. Business outcome

BOBA Bear can create, operate, explain, and redeem direct-order Promotions, Coupons, and
Offers end to end. Customers can discover or apply relevant benefits and understand exactly
what they saved. The platform does not create a second monetary authority and does not
weaken Checkout commercial truth.

Primary outcomes this slice is for:

- increase direct conversion
- support acquisition Offers
- increase average order value through threshold incentives
- shift fulfilment behaviour when that shift is a deliberate commercial incentive
- make coupons usable by customers
- make the accepted Promotion capability operable by authorized workforce users
- protect margin through stacking limits and caps
- make savings explainable
- retain immutable purchased commercial truth

## 3. Problem statement

Accepted Promotion, Coupon, Pricing, and Checkout Snapshot authority already exists
(IMP-016 / ADR-007 / IMP-036F). Workforce commercial administration can configure part of
that engine. Customer ordering does not yet give a reliable Offer experience: automatic
benefits are not explained, coupon entry is not a customer surface, threshold progress is
not shown from real eligibility, and pre-payment savings are not a customer-readable
breakdown. Operators cannot reliably run the benefit types and eligibility the business
needs, including first-order, fulfilment-mode, and automatic Offer caps that the current
engine does not fully express.

Verified gaps this draft must not paper over:

| Need | Current engine posture (discovery evidence; Fit must re-verify) |
|---|---|
| Percentage discount | Present. Operator completeness is the product gap. |
| Flat ₹ discount | Present. Operator completeness is the product gap. |
| BOGO / Buy X Get Y | Present in the engine. Customer messaging and operator completeness are the product gap. |
| Free menu item that is not BOGO | Not supported as its own benefit. V1 includes it only where an accepted authority can express it safely. |
| Temporary free delivery | Partial. A standing delivery-tariff threshold already exists. A temporary Offer must not become a second charge calculator. |
| First-order eligibility | Not an engine rule today. |
| Fulfilment mode `DELIVERY` / `PICKUP` | Not a first-class Promotion field today. |
| Global cap on an automatic Offer with no coupon | Coupon redemption claims exist. A non-coupon global cap is not established. |

Deal commerce and Campaign orchestration are outside this problem.

## 4. Primary personas

| Persona ID | Responsibility / goal in this slice | Context / evidence |
|---|---|---|
| `PERSONA-CUSTOMER` | Receive a qualifying benefit, enter a coupon when one is required, see the saving, and pay a total that matches that explanation. | [`../personas.md`](../personas.md). Guest and authenticated contexts are the same persona. |
| `PERSONA-WORKFORCE-OPERATOR` | Create, inspect, activate, and retire Promotions and Coupons within existing commercial authorization, and see whether benefits are applying. | Existing `/workforce/admin/commercial/` Promotions and coupons surface from accepted IMP-036F. Persona is not a role and not a new permission. |

## 5. Current-state journey

| Journey ID / evidence | Entry / preconditions | Activities today | Existing outcome / gap |
|---|---|---|---|
| Customer cart / checkout | Customer has a cart and an Outlet / fulfilment context | Commercial evaluation may apply an existing automatic or coupon-triggered Promotion. Customer coupon UI is absent. | Engine can change payable amounts. The customer cannot reliably see why, enter a code, or read a savings breakdown. |
| Workforce commercial administration | Authorized operator opens Promotions and coupons | Create and manage a subset of Promotion and Coupon settings | Accepted engine is only partly operable. BOGO, charge targets, stacking, windows, and minimums may be harder to operate than the engine allows. |
| Purchased order | Payment bound a Checkout Snapshot | Snapshot retains commercial facts | Historical order detail must not be re-priced later. That invariant already exists and this slice must keep it. |

Discovery story IDs `ODC-US-*` are discovery examples, not these formal story IDs.

## 6. Desired-state journey

| Journey ID | Entry / context | Ordered activities | Success / downstream outcome | Alternate / recovery paths |
|---|---|---|---|---|
| `JOURNEY-036J-AUTO` | Eligible cart | Qualification is evaluated from accepted commercial authority. Customer sees the Offer applied, the monetary saving, and why it applied where that reason is knowable. | Payable merchandise/order benefit matches the explanation. | Not yet eligible shows truthful progress. Expired or not-yet-effective Offers are not applied and are not promised. |
| `JOURNEY-036J-COUPON` | Customer has a code | Enter, apply, replace, or remove the code on Cart or on Checkout Review. Both surfaces use one shared coupon / commercial state. See `APPLIED` or a specific failure. Retry after authentication when identity is required. | Savings update from the same commercial evaluation. Entering a code never makes the customer worse off than the better automatic Offer. There is one entered coupon state, not two. | Invalid, expired, inapplicable, exhausted, personal limit, and identity-required are distinct. |
| `JOURNEY-036J-THRESHOLD` | An Offer has a real remaining threshold | Customer sees progress such as add a stated amount to unlock the real benefit. | Crossing the threshold applies the real saving. Falling below removes it. | No fabricated remaining amount and no fabricated saving. |
| `JOURNEY-036J-PAY` | Customer moves from Checkout Review toward Payment | On Review, see merchandise/order discount, coupon-backed Offer where applicable, automatic-versus-coupon result, delivery saving where applicable, total saved, and final payable amount. Revalidation runs before payment. Once the customer crosses into Payment, coupon state is read-only. | The payable total is the revalidated total. The purchased snapshot keeps that explanation. | A stale Offer cannot remain inside the payable total. Recovery returns through the pre-payment Review path. Payment does not add, replace, or remove a coupon. |
| `JOURNEY-036J-OPERATOR` | Authorized workforce user | Create or edit a Promotion, choose automatic or coupon activation, set scope, window, qualifier, supported benefit, minimum, stacking posture, caps, and a Coupon where activation needs one. Activate, inspect, retire. | Operators can run the accepted engine for V1 benefits and see redemption/application facts sufficient to operate. | Validation failures are understandable. Retirement stops future application and does not rewrite purchased Orders. |

## 7. Story map

| Business outcome | Persona | Journey | Activity | Story IDs | Slice classification |
|---|---|---|---|---|---|
| Explainable automatic benefit | `PERSONA-CUSTOMER` | `JOURNEY-036J-AUTO` | See a qualifying automatic Offer and its saving | `US-036J-001` | `V1_ACCEPTANCE_SLICE` |
| Usable coupon | `PERSONA-CUSTOMER` | `JOURNEY-036J-COUPON` | Enter, apply, reject, remove, replace, and retry on Cart and Checkout Review; Payment is read-only | `US-036J-002` | `V1_ACCEPTANCE_SLICE` |
| Truthful threshold progress | `PERSONA-CUSTOMER` | `JOURNEY-036J-THRESHOLD` | See remaining amount derived from eligibility | `US-036J-003` | `V1_ACCEPTANCE_SLICE` |
| Pre-payment savings breakdown | `PERSONA-CUSTOMER` | `JOURNEY-036J-PAY` | Read discount, delivery saving, total saved, payable amount | `US-036J-004` | `V1_ACCEPTANCE_SLICE` |
| First-order acquisition | `PERSONA-CUSTOMER` | `JOURNEY-036J-AUTO` | Receive a first-order Offer only while eligible | `US-036J-005` | `V1_ACCEPTANCE_SLICE` |
| Fulfilment-shaped incentive | `PERSONA-CUSTOMER` | `JOURNEY-036J-AUTO` | Eligibility respects Delivery, Pickup, and accepted Scheduled timing | `US-036J-006` | `V1_ACCEPTANCE_SLICE` |
| Limit honesty | `PERSONA-CUSTOMER` | `JOURNEY-036J-COUPON` | Distinguish invalid, expired, globally exhausted, and personal limit | `US-036J-007` | `V1_ACCEPTANCE_SLICE` |
| No stale payable benefit | `PERSONA-CUSTOMER` | `JOURNEY-036J-PAY` | Revalidate before payment and recover | `US-036J-008` | `V1_ACCEPTANCE_SLICE` |
| Best customer outcome | `PERSONA-CUSTOMER` | `JOURNEY-036J-COUPON` | Entered coupon joins the same candidate evaluation and does not make the customer worse off | `US-036J-009` | `V1_ACCEPTANCE_SLICE` |
| Margin-safe stacking | `PERSONA-CUSTOMER` | `JOURNEY-036J-PAY` | Best valid combination of one primary merchandise/order Offer plus one compatible delivery incentive | `US-036J-010` | `V1_ACCEPTANCE_SLICE` |
| Immutable purchased savings | `PERSONA-CUSTOMER` | `JOURNEY-036J-PAY` | Order detail shows purchased savings and does not re-evaluate | `US-036J-011` | `V1_ACCEPTANCE_SLICE` |
| Operable Promotions and Coupons | `PERSONA-WORKFORCE-OPERATOR` | `JOURNEY-036J-OPERATOR` | Author, activate, inspect, retire, including a valid complimentary-item Offer | `US-036J-012` | `V1_ACCEPTANCE_SLICE` |
| Complimentary menu-item Offer | `PERSONA-CUSTOMER` | `JOURNEY-036J-AUTO` / `JOURNEY-036J-COUPON` | Receive the exact operator-specified complementary item with no extra merchandise charge | `US-036J-013` | `V1_ACCEPTANCE_SLICE` |
| Claimable / targeted / loyalty activation | `PERSONA-CUSTOMER` | n/a | Wallet, push, or points activation | none in V1 | `FOLLOW_UP` |
| Parked sequenced capabilities | `PERSONA-CUSTOMER` | n/a | Deal commerce, Campaign orchestration, Revenue Recommendations | discovery stories retained historically | `PARKED_SEQUENCED_FUTURE_CAPABILITIES` |

## 8. Acceptance slice

| Slice | Mandatory story IDs | Mandatory AC IDs | Required Golden Journeys | Observable acceptance boundary |
|---|---|---|---|---|
| `V1_ACCEPTANCE_SLICE` | `US-036J-001` … `US-036J-013` | `AC-036J-001-01` … `AC-036J-013-04`, including `AC-036J-002-05`, `AC-036J-012-04`, `AC-036J-012-05`, `AC-036J-012-06`, `AC-036J-013-01`, `AC-036J-013-02`, `AC-036J-013-03`, and `AC-036J-013-04` | `GJ-FIRST-ORDER`, `GJ-RETURNING-ORDER` for explainable savings on an otherwise accepted purchase path. This slice does not redefine those journeys' non-offer steps. | A customer can receive an automatic or coupon-backed Offer, understand the saving, receive a qualifying complimentary menu item when that Offer is selected, and pay a revalidated total. An authorized operator can operate the accepted Promotion/Coupon surface for the V1 benefit and eligibility rules this definition includes. `MANDATORY_STORIES = US-036J-001..US-036J-013`. `COMPLIMENTARY_MENU_ITEM_V1_ACCEPTANCE = MANDATORY`. |
| `FOLLOW_UP` | Items already classified as follow-up inside the commercial / Offer domain. See section 23 `FOLLOW_UP_NOT_V1`. | Not defined | Not added | Requires later authorization. Not a rejection and not a cut from an approved IMP-036J V1. |
| `PARKED_SEQUENCED_FUTURE_CAPABILITIES` | Deals and Campaigns remain parked. Revenue Recommendations is IMP-036K under D-383 for parallel definition preparation only. See section 23. | Not defined | Not added | Deals and Campaigns stay parked discovery with no IMP identity. IMP-036K is not an IMP-036J story and is not implementation-authorized. |
| `EXPLICIT_NON_GOALS_AND_PROHIBITED_DIRECTIONS` | Second money engine, second Promotion evaluator, second Pricing engine, generic platform-wide rules engine, arbitrary marketing-automation platform. | Not defined | Not added | Intentionally not part of the desired architecture or product. Not deferred. |

## 9. User stories

```text
Story ID: US-036J-001
As a customer
I want a qualifying automatic Offer to apply without a code
so that I receive the benefit and can see what I saved and why.

Journey / activity: JOURNEY-036J-AUTO / automatic application
Preconditions: An active automatic Offer matches the cart under accepted commercial authority.
Acceptance scenarios: AC-036J-001-01, AC-036J-001-02
Business rules: BR-036J-001, BR-036J-002, BR-036J-008
UX states: applied, not-yet-eligible, expired/not effective
Permission / resource context: Customer commerce. No workforce permission.
Error / recovery: An Offer that is not effective is not shown as applied.
Dependencies: Accepted Promotion evaluation. No second evaluator.
Explicit non-goals: Deal browse; personalized offer center.
Data implications: Application facts come from accepted evaluation. Purchased truth is snapshotted later.
Security implications: Do not disclose another customer's eligibility.
Architecture fit / applicable invariants: NO_SECOND_MONEY_ENGINE. Exact evaluator representation is Fit.
Open material decisions: NONE for this story.
Readiness: READY_FOR_IMPLEMENTATION — Implementation Authorization APPROVED 2026-10-01; implementation STARTED; Tranche 1 PASS.
```

```text
Story ID: US-036J-002
As a customer
I want to enter a coupon code on Cart or Checkout Review and see one shared result
so that I can use a code, understand a refusal, change or remove it, and retry when I must sign in.

Journey / activity: JOURNEY-036J-COUPON / coupon entry
Preconditions: A Coupon exists for a coupon-activated Offer, or the entered text does not.
Acceptance scenarios: AC-036J-002-01 through AC-036J-002-10. Monetary competition with an automatic Offer is AC-036J-009-01 and AC-036J-009-02, not a second evaluation.
Business rules: BR-036J-003, BR-036J-009, BR-036J-013
UX states: Cart empty, applying, applied, invalid, expired, inapplicable, globally exhausted, personal limit, identity required, removed. Checkout Review inherited applied coupon, no coupon / entry, changed coupon, removed coupon, validation failure, best automatic Offer retained, coupon wins, stale Offer recovery. Payment final read-only summary with no coupon edit control.
Permission / resource context: An unrestricted Coupon is not rejected solely because the customer is unauthenticated; it enters the same commercial candidate evaluation. An identity-restricted coupon may be entered while unauthenticated; the response may require sign-in; after successful authentication the same attempt is preserved and retried where existing identity and cart continuity already allow it. Private eligibility facts of another customer are not exposed. Founder-approved FD-036J-01 (2026-09-27): entry exists on both Cart and Checkout Review over one shared coupon / commercial state. Payment does not mutate coupon state.
Error / recovery: Failures name the reason class and allow correction, replacement, or removal on Cart or Checkout Review. After a failed apply, focus returns to the coupon input and the error stays associated with it. After sign-in, focus returns to the coupon result on the same surface. A server or network failure leaves the previous shared coupon state in place and does not show a false applied state or a false payable total. Payment does not host those controls.
Dependencies: Existing Coupon activation authority and existing identity/cart continuity. No second coupon store.
Explicit non-goals: A second coupon domain. A second simultaneous entered coupon. Coupon mutation inside Payment.
Data implications: The entered code is an activation attempt against one shared commercial intent, not a new monetary fact and not a Checkout-Review-only record.
Security implications: Do not reveal whether a code belongs to another customer beyond the allowed reason class. Do not expose another customer's private eligibility.
Architecture fit / applicable invariants: Coupon remains activation/redemption authority. NO_SECOND_MONEY_ENGINE.
Open material decisions: NONE
Readiness: READY_FOR_IMPLEMENTATION — Implementation Authorization APPROVED 2026-10-01; implementation STARTED; Tranche 1 PASS.
```

```text
Story ID: US-036J-003
As a customer
I want progress toward a threshold Offer to come from real eligibility
so that I am not shown a saving the platform will not give me.

Journey / activity: JOURNEY-036J-THRESHOLD / progress messaging
Preconditions: An Offer has a minimum amount or quantity the cart has not met, or has just met.
Acceptance scenarios: AC-036J-003-01, AC-036J-003-02
Business rules: BR-036J-004
UX states: in progress, unlocked, fallen below
Permission / resource context: Customer cart context.
Error / recovery: If eligibility cannot be known, do not invent a remaining amount.
Dependencies: Same evaluation as application.
Explicit non-goals: Marketing copy that is not tied to an Offer.
Data implications: Display is a projection of eligibility.
Security implications: N/A beyond ordinary cart privacy.
Architecture fit / applicable invariants: No fabricated commercial numbers.
Open material decisions: NONE
Readiness: READY_FOR_IMPLEMENTATION — Implementation Authorization APPROVED 2026-10-01; implementation STARTED; Tranche 1 PASS.
```

```text
Story ID: US-036J-004
As a customer
I want the pre-payment total to explain each real saving
so that I can see the merchandise or order saving, the delivery saving when it changes what I pay, the total saved, and the final amount, without a duplicate or invented delivery saving.

Journey / activity: JOURNEY-036J-PAY / savings breakdown
Preconditions: Checkout is presenting a payable total.
Acceptance scenarios: AC-036J-004-01
Business rules: BR-036J-005, BR-036J-008
UX states: ready breakdown; delivery saving only when it has a real monetary effect; no delivery-saving line when the charge was already zero or Pickup has no delivery charge
Permission / resource context: Customer checkout.
Error / recovery: Covered by US-036J-008.
Dependencies: Checkout Snapshot remains payable truth after payment bind.
Explicit non-goals: Tax policy changes; fictional reference prices; a second delivery-charge calculator; a fabricated rupee saving from a delivery charge that was already zero.
Data implications: Components must sum to the explained saving. Payable amount is the evaluated amount.
Security implications: Do not show another customer's commercial facts.
Architecture fit / applicable invariants: One coherent delivery-charge result.
Open material decisions: NONE
Readiness: READY_FOR_IMPLEMENTATION — Implementation Authorization APPROVED 2026-10-01; implementation STARTED; Tranche 1 PASS.
```

```text
Story ID: US-036J-005
As an authenticated first-order customer
I want a first-order Offer when I have never successfully purchased a direct BOBA Bear Order
so that acquisition offers are not given to returning customers and are not burned by failed payments.

Journey / activity: JOURNEY-036J-AUTO / first-order eligibility
Preconditions: The Offer requires first-order eligibility and the customer is authenticated.
Acceptance scenarios: AC-036J-005-01, AC-036J-005-02
Business rules: BR-036J-006
UX states: eligible, ineligible returning customer
Permission / resource context: Authenticated customer identity. Guest is not first-order eligible.
Error / recovery: Unknown purchase history fails closed for a first-order-only Offer.
Dependencies: Accepted Order success truth. Query and concurrency belong to Fit.
Explicit non-goals: Restoring eligibility after cancellation or refund.
Data implications: Eligibility reads purchased-order history. It does not write a new order state.
Security implications: Do not expose another customer's order history.
Architecture fit / applicable invariants: Exact query and concurrency are Fit-owned.
Open material decisions: NONE — definition is the approved ODC-06 direction.
Readiness: READY_FOR_IMPLEMENTATION — Implementation Authorization APPROVED 2026-10-01; implementation STARTED; Tranche 1 PASS.
```

```text
Story ID: US-036J-006
As a customer
I want Offers that depend on Delivery or Pickup, including Scheduled timing, to follow the fulfilment I actually chose
so that a delivery incentive is not applied to Pickup and Scheduled purchases use accepted scheduling truth.

Journey / activity: JOURNEY-036J-AUTO / fulfilment eligibility
Preconditions: The Offer distinguishes DELIVERY and/or PICKUP, and may depend on ASAP or SCHEDULED timing.
Acceptance scenarios: AC-036J-006-01, AC-036J-006-02
Business rules: BR-036J-007
UX states: applied for the selected mode; not applied for the other mode
Permission / resource context: Customer-selected fulfilment mode and timing under accepted checkout authority.
Error / recovery: Changing mode or timing re-evaluates the Offer before payment.
Dependencies: IMP-036H mode and IMP-036I timing. This story does not redefine Scheduled semantics.
Explicit non-goals: A new fulfilment mode or slot engine.
Data implications: Eligibility consumes accepted mode and timing facts.
Security implications: N/A.
Architecture fit / applicable invariants: No duplicate scheduling authority.
Open material decisions: NONE
Readiness: READY_FOR_IMPLEMENTATION — Implementation Authorization APPROVED 2026-10-01; implementation STARTED; Tranche 1 PASS.
```

```text
Story ID: US-036J-007
As a customer
I want exhausted Offers to say they are exhausted
so that I can tell a bad code from an expired code, a global cap, and my own redemption limit.

Journey / activity: JOURNEY-036J-COUPON / limit states
Preconditions: The code or Offer is not applicable for a limit or validity reason.
Acceptance scenarios: AC-036J-007-01
Business rules: BR-036J-010
UX states: invalid, expired, globally exhausted, personal cap reached
Permission / resource context: Per-customer cap requires authenticated identity.
Error / recovery: The customer is not told the benefit applied.
Dependencies: Existing coupon claims where they fit. Non-coupon global caps are a Fit extension question.
Explicit non-goals: Fraud platform; campaign budget pacing.
Data implications: Caps are consumption facts, not a second price.
Security implications: Personal-cap messaging must not leak another customer's usage count.
Architecture fit / applicable invariants: Concurrency-safe consumption is Fit-owned.
Open material decisions: NONE for the customer-visible distinction.
Readiness: READY_FOR_IMPLEMENTATION — Implementation Authorization APPROVED 2026-10-01; implementation STARTED; Tranche 1 PASS.
```

```text
Story ID: US-036J-008
As a customer
I want an Offer that became invalid to leave my payable total before I pay
so that I cannot pay a stale saving, and I still have a way to continue.

Journey / activity: JOURNEY-036J-PAY / revalidation
Preconditions: An applied Offer or coupon is no longer valid when payment is prepared.
Acceptance scenarios: AC-036J-008-01
Business rules: BR-036J-005
UX states: Checkout Review stale Offer recovery; Payment read-only commercial summary; recovered payable total on Review
Permission / resource context: Customer checkout.
Error / recovery: Return through the pre-payment Review path. Remove or change the coupon, adjust the cart, or continue without that Offer there. Payment does not mutate coupon state while the total is stale. No pay action while the total still includes the invalid benefit.
Dependencies: Existing checkout revalidation posture.
Explicit non-goals: Silently keeping the old discount.
Data implications: Payable total is recomputed. No snapshot is sealed with the stale benefit.
Security implications: N/A.
Architecture fit / applicable invariants: Checkout Snapshot remains the purchased commercial truth.
Open material decisions: NONE
Readiness: READY_FOR_IMPLEMENTATION — Implementation Authorization APPROVED 2026-10-01; implementation STARTED; Tranche 1 PASS.
```

```text
Story ID: US-036J-009
As a customer
I want an entered coupon to take part in the same commercial evaluation
so that I keep the best valid outcome, a winning merchandise coupon can still pair with one compatible delivery incentive, and entering a coupon never makes me pay more.

Journey / activity: JOURNEY-036J-COUPON / best offer
Preconditions: An automatic Offer and a coupon-backed Offer can both qualify. The coupon uses its actual benefit class. One entered coupon state exists.
Acceptance scenarios: AC-036J-009-01, AC-036J-009-02, AC-036J-009-03, AC-036J-009-04
Business rules: BR-036J-009, BR-036J-008
UX states: automatic retained, coupon wins the merchandise slot, coupon competes as a delivery incentive, explanation
Permission / resource context: Customer cart.
Error / recovery: Removing the coupon restores the previous eligible result when that result remains better.
Dependencies: Same evaluator. No second comparison engine and no second coupon state.
Explicit non-goals: Silent stacking of incompatible benefits. Multi-coupon entry. A coupon-created extra stacking slot.
Data implications: One entered coupon state. Coupon and automatic candidates are compared as complete valid combinations. The coupon occupies the slot of its benefit class. A merchandise-class coupon selected by that comparison still leaves only the single delivery-incentive slot.
Security implications: N/A.
Architecture fit / applicable invariants: Deterministic non-monetary tie-break is Fit-owned. Customer-visible rule is the best monetary outcome.
Open material decisions: NONE
Readiness: READY_FOR_IMPLEMENTATION — Implementation Authorization APPROVED 2026-10-01; implementation STARTED; Tranche 1 PASS.
```

```text
Story ID: US-036J-010
As a customer
I want the best valid combination of one primary merchandise or order Offer and one compatible delivery incentive
so that compatible delivery value is not silently lost and unintended multi-discount stacking cannot occur.

Journey / activity: JOURNEY-036J-PAY / stacking
Preconditions: More than one Offer may qualify.
Acceptance scenarios: AC-036J-010-01, AC-036J-010-02, AC-036J-010-03, AC-036J-010-04
Business rules: BR-036J-008
UX states: one merchandise or order benefit plus one delivery incentive when both have a real effect; best valid combination; complimentary menu-item Offer uses the primary merchandise or order slot; no second merchandise discount; no second delivery incentive; no new complimentary stacking slot; no fabricated delivery saving
Permission / resource context: Customer cart.
Error / recovery: The customer sees the savings that changed the payable amount.
Dependencies: Benefit class is a product rule. Representation, search, and non-monetary tie-breaks are Fit.
Explicit non-goals: Deal built-in value stacking. Campaign budgets. Optional discarding of a qualifying compatible delivery benefit.
Data implications: Applied benefits remain inside the single commercial evaluation.
Security implications: N/A.
Architecture fit / applicable invariants: Existing exclusive/combinable mechanics are reconciled at Fit and are not rewritten by this draft. Exact evaluator representation belongs to Fit.
Open material decisions: NONE
Readiness: READY_FOR_IMPLEMENTATION — Implementation Authorization APPROVED 2026-10-01; implementation STARTED; Tranche 1 PASS.
```

```text
Story ID: US-036J-011
As a customer
I want my order to keep the savings I purchased
so that later Offer changes do not rewrite what I already paid.

Journey / activity: JOURNEY-036J-PAY / order detail
Preconditions: Payment bound a Checkout Snapshot that includes the evaluated benefits.
Acceptance scenarios: AC-036J-011-01
Business rules: BR-036J-005
UX states: historical explanation
Permission / resource context: The customer's own order.
Error / recovery: N/A — live re-evaluation is not a recovery path for a purchased order.
Dependencies: Accepted snapshot immutability and refund allocation rules.
Explicit non-goals: Repricing history when an Offer is retired.
Data implications: Order detail reads purchased facts.
Security implications: Order commercial facts stay with the owning customer and authorized workforce scope.
Architecture fit / applicable invariants: No new snapshot authority.
Open material decisions: NONE
Readiness: READY_FOR_IMPLEMENTATION — Implementation Authorization APPROVED 2026-10-01; implementation STARTED; Tranche 1 PASS.
```

```text
Story ID: US-036J-012
As a workforce operator
I want to operate Promotions and Coupons for V1 Offers on the existing commercial surface
so that I can create, limit, activate, inspect, and retire them without a second promotion system.

Journey / activity: JOURNEY-036J-OPERATOR / authoring and operations
Preconditions: The operator already holds the existing promotions and coupons authorization for the applicable scope.
Acceptance scenarios: AC-036J-012-01, AC-036J-012-02, AC-036J-012-03, AC-036J-012-04, AC-036J-012-05, AC-036J-012-06
Business rules: BR-036J-001, BR-036J-011
Founder product authority: FD-036J-03 APPROVED 2026-09-28 for complimentary-item authoring, the single-active V1 rule, sequential second-activation denial, and the concurrent activation invariant. FD-036J-02 remains the general stacking policy. Product Definition does not choose which overlapping activation wins.
UX states: draft, active, validation failure, retired, redemption visibility, complimentary-item configuration rejected when incomplete, truthful non-success when a complimentary activation does not become the authoritative active Offer
Permission / resource context: Existing `promotions` and `coupons` authorization and commercial scope. No new role. Exact permission keys are Fit, not a new model.
Error / recovery: Invalid configuration is rejected with a reason the operator can correct. Unauthorized activation or retirement is denied and does not change the Offer. A second activation while one complimentary-item Offer is already active is rejected. Overlapping activations when none is yet active settle with at most one ACTIVE complimentary-item Offer, and an attempt that is not authoritative must not report a false successful activation. Confirmed retirement stops future application and leaves purchased orders unchanged. Cancelling the retire confirmation leaves the Offer active.
Dependencies: Accepted IMP-036F commercial workspace. This story makes that surface operable for V1; it does not replace it.
Explicit non-goals: Campaign screens, Deal composition, new permissions, schema design in this document.
Data implications: Authoring writes accepted Promotion/Coupon authority or the minimum Fit-owned extension required for V1 eligibility and caps. Purchased orders are not rewritten.
Security implications: Cross-scope denial is mandatory. Client-supplied role or scope is not authority.
Architecture fit / applicable invariants: No new service, role, or permission is decided here.
Open material decisions: NONE for the operator outcomes. Mechanism is Fit.
Readiness: READY_FOR_IMPLEMENTATION — Implementation Authorization APPROVED 2026-10-01; implementation STARTED; Tranche 1 PASS.
```

```text
Story ID: US-036J-013
As a customer
I want a qualifying complimentary-item Offer to add the exact item promised
without an extra merchandise charge
so that the Offer I was shown is actually delivered and explained.

Journey / activity: JOURNEY-036J-AUTO / JOURNEY-036J-COUPON as applicable
Classification: V1_ACCEPTANCE_SLICE
Preconditions: An active V1 Offer specifies exactly one operator-selected complementary menu item. The customer and cart satisfy that Offer's qualification. The item is eligible under accepted commerce and availability truth. Architecture Fit has established a safe accepted commercial-authority path. This Offer is the one selected by normal commercial evaluation.
Acceptance scenarios: AC-036J-013-01, AC-036J-013-02, AC-036J-013-03, AC-036J-013-04
Business rules: BR-036J-001, BR-036J-005, BR-036J-008, BR-036J-011, BR-036J-012, BR-036J-014
Founder product authority: FD-036J-03 APPROVED 2026-09-28 for the complimentary-item V1 operating model. FD-036J-02 remains the general stacking policy.
UX states: qualifying complimentary item applied; exact item line visible; no extra merchandise charge; understandable Offer explanation; purchased-order historical presentation
Permission / resource context: Customer commerce. No workforce permission. The customer does not choose from a gift catalogue.
Error / recovery: If the complimentary item is not eligible under accepted commerce or availability truth, the Offer does not pretend to deliver a substitute. The Offer leaves the payable result, evaluation continues with the best valid combination that remains, and the customer is told the complimentary item is no longer available. Payment does not proceed on that stale line. If the menu item still requires a customer variant or modifier choice, it cannot be activated as a V1 complimentary item. If Architecture Fit cannot express the outcome safely, that is a Fit STOP, not a silent customer fallback.
Dependencies: Accepted Promotion, Coupon, Pricing, catalog, availability, and Checkout Snapshot authority. No second money engine.
Explicit non-goals: Customer gift selection. A second merchandise or order Offer slot. A second pricing authority.
Data implications: The presented line and the purchased snapshot come from the single accepted commercial evaluation. Live Offer changes do not rewrite a purchased Order.
Security implications: Do not expose another customer's eligibility or purchased lines.
Architecture fit / applicable invariants: COMPLIMENTARY_MENU_ITEM_STACKING_SLOT = PRIMARY_MERCHANDISE_OR_ORDER_OFFER. COMPLIMENTARY_MENU_ITEM_NEW_STACKING_SLOT = NO. FIT_COMPLIMENTARY_ITEM_UNSAFE = STOP_CONTRADICTION_DECISION_REQUIRED.
Open material decisions: NONE
Readiness: READY_FOR_IMPLEMENTATION — Implementation Authorization APPROVED 2026-10-01; implementation STARTED; Tranche 1 PASS.
```

## 10. Acceptance scenarios

Evidence column stays empty until implementation. Planned proof is not proof.

```text
AC-036J-001-01 — Automatic Offer applied
Story: US-036J-001
Given an active automatic Offer the cart qualifies for
When the customer views the cart
Then the Offer is shown as applied, with the monetary saving, and with a practical reason when the evaluator can explain it
And the payable merchandise effect matches that saving
Mandatory in acceptance slice: YES

AC-036J-001-02 — Automatic Offer not effective
Story: US-036J-001
Given the only matching Offer is outside its window
When the customer views the cart
Then that Offer is not applied and is not promised as a saving

AC-036J-002-01 — Coupon applied
Story: US-036J-002
Given a valid coupon for an eligible Offer
When the customer enters the code
Then the state is APPLIED and the saving is visible

AC-036J-002-02 — Coupon invalid
Story: US-036J-002
Given the text is not a valid code
When the customer enters it
Then the failure is invalid, no saving is applied, and the customer can try another code

AC-036J-002-03 — Coupon removed
Story: US-036J-002
Given a coupon is applied
When the customer removes it
Then the commercial total no longer includes that coupon-backed Offer

AC-036J-002-04 — Authentication retry
Story: US-036J-002
Given the coupon requires a customer identity and the customer is not authenticated
When the customer enters it on Cart or Checkout Review
Then the customer is asked to sign in
And after successful authentication the same coupon attempt is preserved and retried where existing identity and cart continuity allow it
And private eligibility facts belonging to another customer are not shown

AC-036J-002-05 — Unrestricted coupon without identity
Story: US-036J-002
Given the customer is unauthenticated
And the entered Coupon has no customer-identity restriction
And the Coupon is otherwise valid
And the cart otherwise qualifies
When the customer enters or applies the Coupon
Then absence of customer identity does not by itself reject the Coupon
And the Coupon-backed Offer enters the same commercial candidate evaluation
And the Coupon uses its actual benefit class
And the best-valid-combination policy remains authoritative
And when the best valid complete commercial combination depends on the entered Coupon, the Coupon-backed Offer applies
And when another valid complete combination produces a better customer monetary outcome, that better combination remains
And the customer is told the entered Coupon did not improve the result
And a first-order eligibility rule still requires authenticated identity
And a per-customer redemption-cap rule still requires authenticated identity
And private eligibility facts are not exposed
GUEST_IDENTITY_ALONE_REJECTS = NO
ENTERS_SAME_COMMERCIAL_CANDIDATE_EVALUATION = YES
COUPON_BACKED_OFFER_APPLIES_WHEN_BEST_COMBINATION_DEPENDS_ON_IT = YES
BETTER_NON_COUPON_COMBINATION_REMAINS = YES
FIRST_ORDER_AND_PER_CUSTOMER_CAP_REQUIRE_AUTHENTICATED_IDENTITY = YES
Mandatory in acceptance slice: YES

AC-036J-002-06 — Cart entry is the Checkout Review coupon
Story: US-036J-002
Given the customer enters a valid coupon on Cart
When the customer opens Checkout Review
Then the same applied coupon and commercial result are visible there
And Checkout Review has not created a second coupon state

AC-036J-002-07 — First entry on Checkout Review
Story: US-036J-002
Given no coupon has been entered yet
When the customer enters a valid coupon for the first time on Checkout Review
Then the shared cart / commercial intent records that same coupon
And the evaluated totals update from that one state

AC-036J-002-08 — Review change or removal recomputes totals
Story: US-036J-002
Given a coupon is part of the shared commercial state
When the customer removes it or replaces it on Checkout Review
Then the shared state updates
And the totals are recomputed from that same commercial evaluation

AC-036J-002-09 — Payment does not edit the coupon
Story: US-036J-002
Given the customer has crossed from Checkout Review into Payment
Then the customer sees the final commercial summary only
And Payment offers no coupon entry, replacement, or removal control

AC-036J-002-10 — Incomplete coupon change leaves the shared state
Story: US-036J-002
Given a coupon is or is not already in the shared commercial state
When apply, replace, or remove on Cart or Checkout Review does not complete because of a server or network failure
Then the previously shown shared coupon state remains
And the customer does not see a false applied state or a false payable total
And the customer can retry the same action

AC-036J-003-01 — Threshold progress
Story: US-036J-003
Given a real minimum the cart has not reached
When the customer views the cart
Then the remaining amount is the real gap, in the form “Add ₹X more to unlock…”, and not an invented saving

AC-036J-003-02 — Threshold crossed and lost
Story: US-036J-003
Given the cart crosses and then falls below the real minimum
When the cart changes
Then the Offer applies only while the minimum holds, and the customer is told when it drops off

AC-036J-004-01 — Pre-payment breakdown
Story: US-036J-004
Given an applied merchandise or order saving and, where it changes the charge, a delivery saving
When the customer reviews the payable total
Then they see the merchandise or order discount, the coupon-backed Offer where one applied, the delivery saving where that saving has a real monetary effect, the total saved, and the final payable amount
And total saved equals those explainable components
And a delivery charge that was already zero does not appear again as a second rupee saving
Mandatory in acceptance slice: YES

AC-036J-005-01 — First successful order has not happened
Story: US-036J-005
Given an authenticated customer with no previous successfully purchased direct Order, including after only failed or abandoned payments
When a first-order Offer is evaluated
Then the customer is eligible

AC-036J-005-02 — Prior success is not restored
Story: US-036J-005
Given the authenticated customer has a previous successfully purchased direct Order, even if that Order was later cancelled or refunded
When a first-order Offer is evaluated
Then the customer is not eligible

AC-036J-006-01 — Mode eligibility
Story: US-036J-006
Given an Offer limited to DELIVERY
When the customer is on PICKUP
Then the Offer does not apply
And the reverse holds for a PICKUP-only Offer

AC-036J-006-02 — Scheduled timing is consumed
Story: US-036J-006
Given an Offer whose timing depends on SCHEDULED fulfilment
When the customer chooses SCHEDULED under accepted IMP-036I rules
Then eligibility uses that accepted timing truth and does not invent a new Scheduled meaning

AC-036J-007-01 — Distinct limit states
Story: US-036J-007
Given one of invalid, expired, inapplicable, globally exhausted, or personal redemption limit
When the customer attempts the Offer or coupon on Cart or Checkout Review
Then the visible failure matches that case and does not collapse them into one generic invalid

AC-036J-008-01 — Stale Offer cannot be paid
Story: US-036J-008
Given an applied Offer that is no longer valid at payment preparation
When the customer attempts to pay
Then payment does not proceed on the stale total
And accepted pre-payment revalidation remains authoritative
And recovery returns through the pre-payment Review path, where the customer can remove or change the coupon, change the cart, or continue without that Offer on a recomputed total
And Payment does not mutate coupon state to perform that recovery

AC-036J-009-01 — Entered coupon does not improve the payable outcome
Story: US-036J-009
Given an automatic merchandise or order Offer and an entered coupon both qualify
And each is judged inside the best valid combination that uses its benefit class
And that comparison includes at most one compatible delivery incentive when that incentive produces a real monetary benefit
And the best valid combination without the entered coupon has the better final payable amount
When the customer enters the coupon
Then the combination that does not depend on the entered coupon remains
And the customer is told the entered coupon did not improve the result
And the customer is not worse off
For example, an automatic merchandise saving of ₹80 that pairs with a ₹40 delivery incentive remains when a coupon that saves ₹90 cannot pair with that delivery incentive

AC-036J-009-02 — Entered coupon improves the payable outcome
Story: US-036J-009
Given the best valid combination that includes the entered coupon produces a better final payable amount than the best valid combination without it
And that comparison includes at most one compatible delivery incentive when that incentive produces a real monetary benefit
When the customer enters the coupon
Then that complete combination is selected and the saving is explained
And a coupon with a smaller merchandise saving can still win when it pairs with a compatible delivery incentive
And the customer is not worse off
For example, a ₹90 coupon that pairs with a ₹20 delivery incentive is selected over a ₹100 automatic Offer that cannot pair with that delivery incentive

AC-036J-009-03 — Winning merchandise coupon still pairs with delivery
Story: US-036J-009
Given the best valid complete combination selects an entered coupon in the merchandise or order slot
And one compatible delivery incentive in that same combination produces a real monetary benefit
When the payable commercial outcome is evaluated
Then both apply
And the coupon did not create a second merchandise slot or a second coupon state
And the comparison that selected this combination used the final payable amount, not the merchandise saving alone

AC-036J-009-04 — Delivery coupon uses the delivery slot
Story: US-036J-009
Given the entered coupon backs a delivery incentive
And another delivery incentive also qualifies
When the payable commercial outcome is evaluated
Then the coupon-backed Offer competes only in the delivery-incentive position
And at most one delivery incentive applies
And it does not open a second merchandise or order slot
And the customer is not worse off

AC-036J-010-01 — Compatible merchandise plus delivery both apply
Story: US-036J-010
Given at least one merchandise or order Offer qualifies
And at least one delivery incentive qualifies
And the selected merchandise or order Offer and the selected delivery incentive are compatible
And each produces a real monetary benefit in the current commercial context
When the payable commercial outcome is evaluated
Then exactly one primary merchandise or order Offer is selected
And at most one delivery incentive is selected
And the selected compatible delivery incentive applies alongside the selected merchandise or order Offer
And both savings are reflected in the one coherent commercial result
And another merchandise or order Offer does not also apply
And another delivery incentive does not also apply
And the savings breakdown reflects the actual monetary effects
COMPATIBLE_STACK_RESULT = BOTH_APPLY
Mandatory in acceptance slice: YES

AC-036J-010-02 — BOGO does not stack
Story: US-036J-010
Given a BOGO Offer and another merchandise discount
When both qualify
Then only the better deterministic merchandise outcome applies unless a later explicit product decision allows the stack
And when a separately compatible delivery incentive also qualifies and produces a real monetary benefit, that delivery incentive applies with the selected merchandise outcome
And that delivery incentive does not add a second merchandise discount

AC-036J-010-03 — Best valid combination
Story: US-036J-010
Given more than one merchandise or order Offer qualifies
And more than one delivery incentive qualifies
When the payable commercial outcome is evaluated
Then only valid compatible combinations are considered
And the valid combination that produces the best customer monetary outcome is selected
And that combination is one primary merchandise or order Offer plus at most one delivery incentive
And an incompatible combination is not applied
MULTIPLE_CANDIDATE_SELECTION = BEST_VALID_MONETARY_COMBINATION
Mandatory in acceptance slice: YES

AC-036J-010-04 — Standing free delivery is not a second saving
Story: US-036J-010
Given the delivery charge is already ₹0 because accepted standing delivery-tariff authority makes delivery free
And a temporary free-delivery Offer otherwise qualifies
When commercial evaluation runs
Then delivery remains ₹0
And no duplicate delivery credit is created
And no fabricated extra delivery saving is shown
And the final total stays commercially coherent
STANDING_FREE_DELIVERY_DUPLICATE_SAVING = PROHIBITED
Mandatory in acceptance slice: YES

AC-036J-011-01 — Historical savings stay put
Story: US-036J-011
Given a purchased order whose snapshot recorded a saving
When the customer opens order detail after the Offer is changed or retired
Then the purchased saving remains and is not recalculated from live Offers

AC-036J-012-01 — Operator activates a V1 Offer
Story: US-036J-012
Given an authorized operator on the existing commercial Promotions and coupons surface
When they configure automatic or coupon activation, scope, window, qualifier, a supported benefit, minimum, stacking posture, caps, and a coupon where required, then activate
Then a qualifying customer evaluation can apply it and an operator can see that applications or redemptions happened

AC-036J-012-02 — Operator failure and denial
Story: US-036J-012
Given invalid configuration or an operator outside the commercial scope
When they attempt to activate or retire
Then the attempt does not change the Offer, the reason is visible for invalid configuration, and out-of-scope action is denied

AC-036J-012-03 — Operator retires an Offer
Story: US-036J-012
Given an authorized operator and an active V1 Offer
When the operator confirms retirement
Then future applications of that Offer stop
And the operator sees confirmation that it is retired
And purchased orders keep the savings already recorded
When the operator cancels the retirement confirmation
Then the Offer stays active

AC-036J-012-04 — Operator configures a complimentary-item Offer
Story: US-036J-012
Product authority: FD-036J-03 APPROVED 2026-09-28
Given an authorized operator on the existing commercial Promotions and coupons surface
And Architecture Fit has established a safe accepted commercial-authority path for one complementary menu item
When the operator chooses exactly one operator-specified menu item as the complimentary benefit and attempts to activate that V1 Offer
Then activation records that exact item
And an incomplete or invalid free-item configuration cannot be activated
And if the selected menu item still requires a customer variant choice or a required or positive-price modifier selection under accepted customization authority, activation is rejected
And the activated configuration is one complete line that does not ask the customer to choose a variant, required modifier, or paid modifier
And the complimentary line adds no merchandise charge, including no customer-selected modifier merchandise charge
And the operator does not offer the customer a gift catalogue
COMPLIMENTARY_ITEM_AUTHORING = EXACT_OPERATOR_ITEM
Mandatory in acceptance slice: YES

AC-036J-012-05 — Second complimentary-item Offer cannot be activated
Story: US-036J-012
Product authority: FD-036J-03 APPROVED 2026-09-28
Classification: SEQUENTIAL_CONFLICT
Given an authorized operator on the existing commercial Promotions and coupons surface
And one complimentary-item Offer is already active
When the operator attempts to activate a second complimentary-item Offer
Then activation is rejected
And the already active complimentary-item Offer remains the only active one
COMPLIMENTARY_ITEM_SINGLE_ACTIVE = YES
Mandatory in acceptance slice: YES

AC-036J-012-06 — Concurrent complimentary activations preserve single-active invariant
Story: US-036J-012
Product authority: FD-036J-03 APPROVED 2026-09-28
Classification: CONCURRENT_CONFLICT
Given no complimentary-item Offer is currently ACTIVE
And two distinct complimentary-item Offer configurations are individually valid
And both operators are authorized
And the two activation attempts overlap and execute concurrently
When both activation attempts settle
Then the resulting authoritative state contains at most one ACTIVE complimentary-item Offer
And there is never a settled state with two ACTIVE complimentary-item Offers
And an activation attempt that is not represented by the authoritative active Offer must not report a false successful activation
And any non-winning or non-applied attempt returns a truthful non-success, conflict, or retry outcome consistent with accepted operator UX
And no arbitrary customer gift is selected as a consequence of the race
COMPLIMENTARY_ITEM_CONCURRENT_ACTIVE_MAX = 1
COMPLIMENTARY_ITEM_CONCURRENT_WINNER = FIT_OWNED_WHERE_PRODUCT_OUTCOME_UNCHANGED
ACTIVE_COUNT <= 1
Mandatory in acceptance slice: YES

AC-036J-013-01 — Complimentary item applies
Story: US-036J-013
Product authority: FD-036J-03 APPROVED 2026-09-28
Given an active V1 Offer specifies exactly one operator-selected complementary menu item
And the customer and cart satisfy the Offer qualification
And the complimentary item is eligible under accepted commerce and availability truth
And the operator-specified item is a complete line under accepted catalog and customization authority, with no unresolved customer variant or modifier choice
And Architecture Fit has established a safe accepted commercial-authority path
And this Offer is selected by the normal commercial evaluation
When the qualifying commercial result is presented before payment
Then the exact operator-specified complementary item appears in Cart and Checkout Review as a distinct item line
And that line adds no merchandise charge
And the customer does not choose from a gift catalogue
And no silent substitute is introduced
And the Offer or saving explanation makes the complimentary benefit understandable
And the payable total remains produced by the single accepted commercial evaluation
And the same payable amount as a combination with no primary merchandise or order Offer does not defeat this complimentary combination
COMPLIMENTARY_ITEM_EXACT_OPERATOR_ITEM = YES
COMPLIMENTARY_ITEM_CUSTOMER_CHOICE = NO
COMPLIMENTARY_ITEM_NO_EXTRA_MERCHANDISE_CHARGE = YES
Mandatory in acceptance slice: YES

AC-036J-013-02 — Purchased complimentary item remains historical truth
Story: US-036J-013
Product authority: FD-036J-03 APPROVED 2026-09-28
Given a customer successfully purchases an Order containing the qualifying complimentary item
When the Offer is later changed, retired, or no longer qualifies
Then the purchased Order retains the exact complimentary item that was purchased
And the historical line remains no-extra-merchandise-charge according to the purchased snapshot and commercial truth
And live Offer evaluation does not rewrite the purchased Order
COMPLIMENTARY_ITEM_PURCHASED_TRUTH = CHECKOUT_SNAPSHOT
Mandatory in acceptance slice: YES

AC-036J-013-03 — Complimentary item unavailable before payment
Story: US-036J-013
Product authority: FD-036J-03 APPROVED 2026-09-28
Given a qualifying complimentary item is already shown as the exact operator-specified line
When that item is no longer eligible under accepted availability or commerce truth before payment
Then no silent substitute is introduced
And that Offer does not remain in the payable result
And the best valid combination is recomputed without it through the single accepted commercial evaluation
And the customer is told the complimentary item is no longer available
And payment does not proceed on the stale complimentary line
And recovery stays on the pre-payment Review path
COMPLIMENTARY_ITEM_UNAVAILABLE_RECOVERY = RECOMPUTE_WITHOUT_SUBSTITUTE
Mandatory in acceptance slice: YES

AC-036J-013-04 — Competing complimentary items are not chosen
Story: US-036J-013
Product authority: FD-036J-03 APPROVED 2026-09-28
Given more than one complimentary-item Offer would qualify for the same cart
When the commercial result is presented before payment
Then neither competing complimentary item is chosen or presented
And the payable total remains produced by the single accepted commercial evaluation
And no silent substitute is introduced
COMPLIMENTARY_ITEM_COMPETING_OFFERS = NONE_CHOSEN
Mandatory in acceptance slice: YES
```

AC-036J-012-05 is the ordinary sequential denial: one complimentary-item Offer is already ACTIVE, and a later activation attempt is rejected. AC-036J-012-06 is the overlapping activation race when none is yet ACTIVE. They are not the same scenario. AC-036J-013-04 remains the customer and commercial safety fallback if inconsistent or racing state nevertheless causes more than one complimentary-item Offer to qualify. It does not replace the operator activation invariant that settled activation state contains at most one ACTIVE complimentary-item Offer (`ACTIVE_COUNT <= 1`). The operator invariant is `AT_MOST_ONE_ACTIVE`. The customer fallback is `NONE_CHOSEN` when inconsistent competing qualifiers nevertheless exist.

| Story / AC ID | Required behaviour / risk | Applicable test layers | Planned proof | Actual evidence |
|---|---|---|---|---|
| `US-036J-001` … `US-036J-013` | Customer benefit truth, including a qualifying complimentary item | Unit, domain, HTTP, browser journey, accessibility | Later implementation evidence under TEST-1 | NOT_EXECUTED |
| `US-036J-002` / `AC-036J-002-05` | Unrestricted guest coupon enters the same candidate evaluation. Identity alone does not reject it. A better complete combination may remain. | Domain, HTTP, browser journey | Later implementation evidence under TEST-1 | NOT_EXECUTED |
| `US-036J-004` / `AC-036J-004-01` | Savings breakdown without a duplicate or fabricated delivery saving | Domain, browser journey | Later implementation evidence under TEST-1 | NOT_EXECUTED |
| `US-036J-009` / `AC-036J-009-03`, `AC-036J-009-04` | Coupon uses its benefit-class slot and does not make the customer worse off | Domain, HTTP, browser journey | Later implementation evidence under TEST-1 | NOT_EXECUTED |
| `US-036J-010` / `AC-036J-010-01`, `AC-036J-010-02`, `AC-036J-010-03`, `AC-036J-010-04` | Deterministic compatible stacking, best valid combination, and standing-free-delivery coherence | Domain, browser journey | Later implementation evidence under TEST-1 | NOT_EXECUTED |
| `US-036J-005`, `US-036J-007`, `US-036J-008` | Eligibility, caps, stale payment | Domain, concurrency where Fit identifies a race, recovery | Real overlap only where cap consumption races | NOT_EXECUTED |
| `US-036J-011`, `US-036J-013` / `AC-036J-013-02` | Purchased Order and history keep complimentary-item and savings snapshot truth | Domain, HTTP, browser journey | Later implementation evidence under TEST-1 | NOT_EXECUTED |
| `US-036J-012` | Operator allow/deny | Authorization positive and negative, integration | Existing commercial scope | NOT_EXECUTED |
| `US-036J-012` / `AC-036J-012-04` | Operator can activate only a complete exact complimentary-item configuration | Authorization, integration | Later implementation evidence under TEST-1 | NOT_EXECUTED |
| `US-036J-012` / `AC-036J-012-05` | Sequential second complimentary-item activation is rejected while one remains ACTIVE | Authorization, integration | Later implementation evidence under TEST-1 | NOT_EXECUTED |
| `US-036J-012` / `AC-036J-012-06` | Overlapping complimentary-item activations settle with at most one ACTIVE Offer, and a non-authoritative attempt cannot falsely report activation | Domain or integration concurrency; persistence, revision, or transaction proof where Architecture Fit places the invariant; operator HTTP or integration result | Planned future proof of real overlapping activation attempts. Exact layers remain Architecture Fit-owned. Actual evidence is not claimed. | NOT_EXECUTED |
| `US-036J-013` / `AC-036J-013-01` | Exact operator-specified complementary item, no extra merchandise charge, no gift catalogue | Domain, HTTP, Cart/Checkout browser journey | Later implementation evidence under TEST-1 | NOT_EXECUTED |
| `US-036J-013` / `AC-036J-013-03` | Unavailable complimentary item is not substituted; the Offer leaves the payable result | Domain, Cart/Checkout browser journey, recovery | Later implementation evidence under TEST-1 | NOT_EXECUTED |
| `US-036J-013` / `AC-036J-013-04` | Competing complimentary items are not chosen | Domain, Cart/Checkout browser journey | Later implementation evidence under TEST-1 | NOT_EXECUTED |

## 11. Business rules

| Rule ID | User/business rule | Authority / rationale | Story / AC IDs |
|---|---|---|---|
| `BR-036J-001` | Promotion remains the only monetary/commercial authority for these benefits. Offer is the customer and operator meaning of a conditional benefit over that authority. Offer does not independently set money. | ODC-01; D-382; ADR-007 | `US-036J-001`, `US-036J-012` |
| `BR-036J-002` | V1 activation is automatic Offer or coupon-activated Offer. Not every Offer needs a coupon. Coupon is the activation mechanism, not the Offer. | ODC-04 | `US-036J-001`, `US-036J-002` |
| `BR-036J-003` | A Coupon with no customer-identity restriction is not rejected solely because the customer is unauthenticated. It enters the same commercial candidate evaluation, uses its actual benefit class, and remains subject to the best valid complete combination. The Coupon-backed Offer applies when that combination depends on it. A better non-coupon combination remains, and the customer is told the entered Coupon did not improve the result. First-order eligibility and a per-customer redemption cap still require the authenticated customer. Private eligibility facts are not exposed. | ODC-06; task eligibility boundary | `US-036J-002`, `US-036J-005` |
| `BR-036J-004` | Progress and “you saved” figures are derived from real eligibility and real evaluated savings. No fabricated reference price or fabricated remaining amount. | Discovery truthful-savings principle | `US-036J-003`, `US-036J-004` |
| `BR-036J-005` | Before payment, a stale or invalid Offer is removed from the payable total. After payment, purchased savings stay on the snapshot and are not live-evaluated. | Checkout Snapshot authority | `US-036J-004`, `US-036J-008`, `US-036J-011` |
| `BR-036J-006` | First-order eligible means no previous successfully purchased direct BOBA Bear Order for that authenticated customer. Failed or abandoned payments do not consume it. Later cancellation or refund of a successful Order does not restore it. | ODC-06 | `US-036J-005` |
| `BR-036J-007` | Eligibility may distinguish DELIVERY and PICKUP. Scheduled eligibility consumes accepted IMP-036I timing and does not redefine it. Standing free delivery in the delivery tariff is not the same thing as a temporary free-delivery Offer. The customer sees one delivery-charge result. A standing-free outcome does not create a second delivery credit or a fabricated delivery saving. | ODC-05, ODC-06; IMP-036H; IMP-036I; FD-036J-02 | `US-036J-006`, `US-036J-004`, `US-036J-010` |
| `BR-036J-008` | V1 stacking is at most one primary merchandise or order Offer plus one compatible delivery incentive. A complimentary-menu-item Offer is a merchandise or order Offer benefit and occupies that existing primary merchandise or order position. It does not create a new stacking slot. It may pair with at most one compatible delivery incentive. It does not stack with a second merchandise or order Offer. An entered Coupon follows the Coupon-backed Offer's actual benefit class. When the selected pair both qualify, are compatible, and each produces a real monetary benefit, both apply (`COMPATIBLE_STACK_RESULT = BOTH_APPLY`). Valid compatible combinations compete on the best customer monetary outcome (`MULTIPLE_CANDIDATE_SELECTION = BEST_VALID_MONETARY_COMBINATION`). Two merchandise discounts do not stack. Multiple delivery incentives do not stack with each other. BOGO does not stack with another merchandise discount. A delivery incentive with zero incremental monetary benefit is not an additional saving. Standing free delivery does not create a duplicate or fabricated delivery saving (`STANDING_FREE_DELIVERY_DUPLICATE_SAVING = PROHIBITED`). A valid complimentary-item combination is selected when its payable amount equals the combination with no primary merchandise or order Offer (`COMPLIMENTARY_ITEM_EQUAL_PAYABLE_TIE = COMPLIMENTARY_COMBINATION_SELECTED`). That choice delivers the promised item and is not a technical tie-break. At most one complimentary-item Offer is active. A second one cannot be activated while another remains active. Two overlapping activations when none is yet active settle with at most one ACTIVE complimentary-item Offer, and an attempt that does not become authoritative must not report a false successful activation. Product Definition does not choose which overlapping attempt wins. If more than one would still qualify, neither competing complimentary item is chosen or presented. That customer fallback does not replace the operator activation invariant. Exact evaluator representation, search, persistence, and remaining deterministic non-monetary tie-breaks that do not change delivered merchandise belong to Architecture Fit. `COMPLIMENTARY_MENU_ITEM_STACKING_SLOT = PRIMARY_MERCHANDISE_OR_ORDER_OFFER`. `COMPLIMENTARY_MENU_ITEM_NEW_STACKING_SLOT = NO`. | FD-036J-02 APPROVED 2026-09-27 for general merchandise or order plus compatible delivery stacking; FD-036J-03 APPROVED 2026-09-28 for the complimentary-item V1 configuration, equal-payable tie, single-active rule, competing qualifiers, and recovery; ODC-07..ODC-10. Deal compatibility is moot while Deals are out of this slice. | `US-036J-009`, `US-036J-010`, `US-036J-013` |
| `BR-036J-009` | An entered coupon participates in the same commercial candidate evaluation. The comparison is the final payable amount of each valid compatible combination, including at most one delivery incentive, not the merchandise saving alone. Entering the coupon must not make the customer worse off. The coupon-backed Offer uses its actual benefit class and does not create another stacking slot. If the selected combination places it in the merchandise or order slot, one compatible delivery incentive that produces a real monetary benefit applies with it. If the coupon-backed Offer is a delivery incentive, it competes only in the delivery-incentive position. Incompatible benefits do not stack. One entered coupon state exists at a time. There is no second monetary engine. | ODC-10; FD-036J-02 APPROVED 2026-09-27; Founder coupon policy already approved in discovery | `US-036J-002`, `US-036J-009` |
| `BR-036J-013` | Coupon entry exists on Cart and on Checkout Review. Both surfaces operate one shared coupon / commercial state. Checkout Review is not a second coupon store. The customer may enter, apply, replace, remove, and retry on either surface before Payment. After the customer crosses from Review into Payment, coupon state is read-only: no new entry, replacement, or removal. If commercial truth is stale, recovery returns through the normal pre-payment Review path. | FD-036J-01 APPROVED 2026-09-27 | `US-036J-002`, `US-036J-008` |
| `BR-036J-010` | V1 controls are max discount where applicable, per-customer redemption cap, and global Offer redemption cap. Reuse coupon claims where they fit. Campaign budgets and pacing are follow-up. | ODC-11 | `US-036J-007`, `US-036J-012` |
| `BR-036J-011` | V1 benefit intent is percentage, flat ₹, BOGO / Buy X Get Y, one operator-specified complementary menu item only where accepted authority can express it safely, and temporary free delivery. The complimentary item is non-BOGO benefit intent. Fixed promotional item or combo pricing is Deal/Pricing, not this slice. | ODC-05; FD-036J-03 APPROVED 2026-09-28 for the complimentary menu-item benefit | `US-036J-001`, `US-036J-012`, `US-036J-013` |
| `BR-036J-012` | `NO_SECOND_MONEY_ENGINE`. No second Promotion evaluator and no second Pricing engine. | D-382; ADR-007 | All |
| `BR-036J-014` | A complimentary-menu-item Offer promises exactly one operator-specified menu item as a complete line that needs no further customer variant or modifier choice. It is shown as a distinct line with no extra merchandise charge, and only through the single accepted commercial evaluation and Checkout Snapshot. The customer does not choose a gift. A menu item that still requires that choice cannot be activated. If the item is no longer eligible before payment, it is not substituted and the payable result is recomputed without that Offer. A purchased Order keeps that item as historical truth. If Architecture Fit cannot express that outcome without a second money engine, a second Promotion evaluator, a second Pricing engine, breaking Checkout Snapshot truth, or violating accepted Catalog, Customization, or Availability authority, Fit returns STOP / CONTRADICTION / DECISION_REQUIRED. Fit does not silently remove or downgrade the V1 requirement, downgrade it to follow-up, or invent a separate money engine. `FIT_COMPLIMENTARY_ITEM_UNSAFE = STOP_CONTRADICTION_DECISION_REQUIRED`. | FD-036J-03 APPROVED 2026-09-28; BR-036J-011; BR-036J-012; Checkout Snapshot authority; accepted Catalog and Customization authority | `US-036J-012`, `US-036J-013` |

### V1 benefit intent and engine gaps

This draft does not treat the following as already implemented:

- Free menu item as a non-BOGO benefit is an engine gap and a mandatory V1 acceptance outcome. The customer outcome, only where accepted commercial authority can express it safely, is one operator-specified complementary menu item shown as a distinct line with no extra merchandise charge. The customer does not choose from a gift catalogue in IMP-036J. Customer-choice gift selection is Deal-like future behavior. This requirement is `US-036J-013` / `AC-036J-013-01` / `AC-036J-013-02` and operator authoring `AC-036J-012-04`. It occupies the existing primary merchandise or order Offer position (`COMPLIMENTARY_MENU_ITEM_STACKING_SLOT = PRIMARY_MERCHANDISE_OR_ORDER_OFFER`; `COMPLIMENTARY_MENU_ITEM_NEW_STACKING_SLOT = NO`) and may pair with at most one compatible delivery incentive. It does not stack with a second merchandise or order Offer. `COMPLIMENTARY_MENU_ITEM_V1_ACCEPTANCE = MANDATORY`. `COMPLIMENTARY_MENU_ITEM_FOLLOW_UP = PROHIBITED`.
- If Architecture Fit determines the accepted Promotion, Coupon, Pricing, or Checkout authority cannot safely express that complimentary-item outcome without a second money engine, a second Promotion evaluator, a second Pricing engine, breaking Checkout Snapshot truth, or violating accepted Catalog, Customization, or Availability authority, Architecture Fit returns `STOP` / `CONTRADICTION` / `DECISION_REQUIRED` (`FIT_COMPLIMENTARY_ITEM_UNSAFE = STOP_CONTRADICTION_DECISION_REQUIRED`). Fit does not silently remove or downgrade the free item from V1, silently downgrade it to follow-up, or invent a separate money engine. This is a binding Fit question, not a runtime acceptance scenario. Authority is FD-036J-03 APPROVED 2026-09-28.
- Temporary free-delivery Offer is part of IMP-036J V1. The standing tariff threshold and the temporary Offer are distinct product concepts. Standing free delivery is delivery-tariff / serviceability authority. Temporary free delivery is an Offer incentive. The customer sees one coherent delivery-charge outcome. If standing authority already makes delivery ₹0, evaluation does not add a duplicate credit, a fabricated delivery saving, or a second monetary claim for a delivery incentive that changes nothing. A delivery incentive with zero incremental monetary benefit is not displayed as an additional saving. Architecture Fit decides the minimum implementation interaction. This draft does not choose a table or formula and does not create a second delivery-charge calculator.
- First-order, fulfilment-mode eligibility, and global caps on automatic Offers that have no coupon are product requirements with known engine gaps. Fit decides the minimum extension. Until that extension exists, those rules are not pretend-supported.

Percentage, flat amount, and BOGO are product-intended because the accepted engine already has them. V1 still includes making them operable and explainable.

### V1 customer surfaces

| Surface | V1 |
|---|---|
| Cart | Offer status, threshold progress, coupon entry, apply, remove, replace, failure classes, savings explanation |
| Checkout Review | The same coupon and commercial state: inherited applied coupon, first-time entry, change, remove, retry, automatic-versus-coupon explanation, recomputed totals, stale-Offer recovery |
| Payment | Final read-only commercial summary. No coupon entry, change, or removal. |
| Order detail | Historical purchased savings only |
| Menu / Home | No Offers browse and no Deals hub. A minimal mention is allowed only when a V1 cart or checkout outcome needs the customer to know an Offer exists. It is not a new destination. |
| My BOBA / Offers for You | Follow-up, as in the discovery story map |

## 12. Journey Completeness Matrix

| Journey dimension | Behaviour / applicability or N/A reason | Story / AC references |
|---|---|---|
| ENTRY | Customer enters from cart/checkout. Operator enters the existing commercial Promotions and coupons area. | `US-036J-001`, `US-036J-012` |
| DISCOVERY | Customer discovery is the cart and checkout explanation, not a public Offers catalogue. | `US-036J-003`, section 11 surfaces |
| CONTEXT | Outlet, fulfilment mode, timing, and authentication context are consumed from accepted commerce. | `US-036J-005`, `US-036J-006` |
| EMPTY / FIRST USE | No Offer is a valid empty state. First-order is a specific eligibility state, not an empty catalogue. | `US-036J-001`, `US-036J-005` |
| HAPPY PATH | Automatic apply, coupon apply, complimentary item applied, operator activate. | `AC-036J-001-01`, `AC-036J-002-01`, `AC-036J-012-01`, `AC-036J-013-01` |
| ALTERNATE VALID PATHS | Coupon better or automatic better; merchandise coupon plus compatible delivery; Delivery versus Pickup; best valid stacking combination. | `US-036J-006`, `US-036J-009`, `US-036J-010` |
| VALIDATION FAILURE | Invalid, expired, inapplicable, exhausted, personal cap, operator configuration errors. | `US-036J-002`, `US-036J-007`, `US-036J-012` |
| AUTHORIZATION | Operator allow/deny on existing commercial scope. Customer identity when the Offer requires it. An unrestricted Coupon is not rejected for missing identity alone. | `AC-036J-002-04`, `AC-036J-002-05`, `AC-036J-012-02` |
| NOT FOUND / STALE REFERENCE | Unknown code; Offer retired before payment; purchased order does not use live Offers. | `US-036J-008`, `US-036J-011` |
| SERVER / NETWORK ERROR | A coupon apply, replace, or remove that does not complete leaves the previous shared state. Failure must not show a false applied state or a false paid total. | `AC-036J-002-10`, `US-036J-008` |
| RECOVERY | Remove, replace, retry after sign-in, adjust cart, or continue without the Offer on Cart or Checkout Review. Stale payment recovery returns to Review. | `US-036J-002`, `US-036J-008` |
| CONCURRENCY | Last global redemption and first-order qualification must not both succeed incorrectly. Duplicate coupon submission stays one applied result. Two overlapping complimentary-item activation attempts settle with at most one ACTIVE complimentary-item Offer, and a non-authoritative attempt must not report a false successful activation. Exact lock, CAS, transaction, and winner selection are Architecture Fit. | `US-036J-002`, `US-036J-005`, `US-036J-007`, `US-036J-012` / `AC-036J-012-06` |
| DESTRUCTIVE ACTION | Removing or replacing a coupon, on Cart or Checkout Review, is explicit and recomputes totals. Retiring a Promotion requires confirmation, stops future application, and does not rewrite purchased orders. Cancelling that confirmation leaves the Offer active. Payment cannot remove the coupon. | `AC-036J-002-03`, `AC-036J-002-08`, `AC-036J-012-03` |
| SUCCESS FEEDBACK | Applied state, saving, complimentary-item explanation, and operator activation/inspection. | `US-036J-001`, `US-036J-012`, `US-036J-013` |
| DOWNSTREAM EFFECT | Payable total and snapshot change only through accepted evaluation. | `BR-036J-005` |
| REVISIT / RELOAD | Cart and checkout show the current evaluation. Order detail shows purchased facts, including a purchased complimentary item. | `US-036J-011`, `US-036J-013` |
| RESPONSIVE / MOBILE | Cart coupon entry, Checkout Review coupon entry, and the savings summary remain usable and readable on a narrow viewport. | Section 18 |
| ACCESSIBILITY | Coupon input has an accessible name. Results and errors are associated with that input. Apply, Remove, and Change are keyboard operable. Status is not communicated only by colour. Focus recovery after validation and sign-in is defined. | Section 18 |

## 13. UX state matrix

| Surface / state | Entry condition | Visible feedback / available actions | Focus / keyboard behaviour | Next / recovery state | AC ID or N/A reason |
|---|---|---|---|---|---|
| Cart / applied | Offer qualifies | Applied name, saving, short why | Savings announced in text | Reload keeps current evaluation | `AC-036J-001-01` |
| Cart / complimentary item applied | A qualifying complimentary-item Offer is selected | The exact operator-specified item is a distinct line. The line adds no merchandise charge. The Offer explanation makes the benefit understandable. There is no gift picker. | The line and explanation are text | Checkout Review shows the same line | `AC-036J-013-01` |
| Cart / progress | Threshold not met | Real remaining amount | Readable text | Unlock or drop-off | `AC-036J-003-01` |
| Cart / coupon empty | No code entered | Named coupon field; Apply available | Field has an accessible name and is keyboard focusable | Applying, then applied or a validation error | `US-036J-002` |
| Cart / coupon applying | Customer has submitted a code | Applying status in text, not colour alone | Apply is keyboard operable; the control does not imply a second coupon | Applied, a distinct failure, or identity required | `AC-036J-002-01` |
| Cart / coupon applied | Valid code | APPLIED and saving; Remove and Change available | Remove and Change are keyboard operable | Removed or replaced total | `AC-036J-002-01` |
| Cart / coupon invalid | Text is not a valid code | Invalid reason associated with the input | Focus returns to the input | Another code or empty | `AC-036J-002-02` |
| Cart / coupon expired | Code is past its window | Expired reason, distinct from invalid | Error associated with the input; focus returns to it | Another code or removal | `AC-036J-007-01` |
| Cart / coupon inapplicable | Code is valid but the cart does not qualify | Inapplicable reason, distinct from invalid | Error associated with the input | Cart change or another code | `AC-036J-007-01` |
| Cart / coupon exhausted | Global redemption cap is spent | Globally exhausted reason | Error associated with the input | Continue without that coupon | `AC-036J-007-01` |
| Cart / personal limit | This customer has reached the cap | Personal redemption limit reason | Error associated with the input | Continue without that coupon | `AC-036J-007-01` |
| Cart / identity required | Coupon needs a customer identity | Sign-in request; the attempt is kept for retry | After sign-in, focus returns to the coupon result on this surface | Retried applied result or a remaining failure | `AC-036J-002-04` |
| Cart / coupon removed | Customer removes the applied code | Shared state has no entered coupon; totals recompute | Focus remains on the coupon field | Empty or a new entry | `AC-036J-002-03` |
| Cart / coupon server error | Apply, replace, or remove does not complete | Prior shared coupon state remains. No false APPLIED and no false payable total. | Focus stays on the coupon action. Retry is keyboard operable. | Retry or continue from the unchanged state | `AC-036J-002-10` |
| Checkout Review / inherited coupon | Coupon already applied on Cart | Same applied coupon and saving; Remove and Change available | Same keyboard rules as Cart | Removed, changed, or continued total | `AC-036J-002-06` |
| Checkout Review / no coupon | Shared state has no coupon | Entry field and Apply are available | Field has an accessible name | Applied or a validation failure | `AC-036J-002-07` |
| Checkout Review / changed coupon | Customer replaces the code | Shared state updates; totals recompute; explanation follows BR-036J-009 | Change is keyboard operable | New applied result, automatic retained, or failure | `AC-036J-002-08` |
| Checkout Review / removed coupon | Customer removes the code | Shared state clears the coupon; totals recompute | Remove is keyboard operable | Entry or continued total | `AC-036J-002-08` |
| Checkout Review / coupon server error | Apply, replace, or remove does not complete | Prior shared coupon state remains. No false APPLIED and no false payable total. | Focus stays on the coupon action. Retry is keyboard operable. | Retry or continue from the unchanged state | `AC-036J-002-10` |
| Checkout Review / validation failure | Entry fails a reason class | Same distinct reason as Cart, associated with the input | Focus returns to the input | Corrected code or removal | `AC-036J-007-01` |
| Checkout Review / automatic retained | Automatic Offer is the better compatible monetary result | Automatic Offer stays; text says the entered coupon did not improve the result | Status is text, not colour alone | Remove coupon or continue | `AC-036J-009-01` |
| Checkout Review / coupon wins | Coupon-backed Offer is the better result | Coupon-backed Offer is explained as the winning saving | Status is text | Continue or remove | `AC-036J-009-02` |
| Checkout Review / stale Offer | Revalidation finds the Offer no longer valid | Pay is not offered on the stale total; recovery actions are on Review | Focus moves to the error and a recovery action | Recomputed total | `AC-036J-008-01` |
| Payment / read-only summary | Customer has crossed into Payment | Final commercial summary only | No coupon entry, Change, or Remove control is present | Revalidation failure returns through Review | `AC-036J-002-09` |
| Checkout Review / payable | Revalidated total | Breakdown and payable amount remain readable on a narrow viewport. A selected complimentary item remains a distinct no-merchandise-charge line. | Totals are text | Pay or revalidation error | `AC-036J-004-01`, `AC-036J-013-01` |
| Order detail / historical | Purchased snapshot | Purchased savings only | Readable text | N/A live evaluation | `AC-036J-011-01` |
| Order detail / purchased complimentary item | The purchased snapshot includes the complimentary item | The exact purchased item remains, with no extra merchandise charge according to the purchased snapshot. Live Offer evaluation does not rewrite it. | Readable text | N/A live evaluation | `AC-036J-013-02` |
| Cart / complimentary item unavailable | The shown complimentary item is no longer eligible | The item is not substituted. The Offer leaves the payable result. The customer is told it is no longer available. | Status is text | Recomputed combination on Review | `AC-036J-013-03` |
| Operator / validation | Bad configuration | Reason; not activated | Error on the field | Correct and retry | `AC-036J-012-02` |
| Operator / complimentary activation conflict | A second complimentary-item Offer is already blocked because one is ACTIVE, or a concurrent activation did not become the authoritative ACTIVE Offer | The attempt is not shown as a successful activation. The operator sees a truthful non-success, conflict, or retry outcome. Settled state has at most one ACTIVE complimentary-item Offer. | Denial is text, not colour alone | Correct and retry, or leave the authoritative Offer active | `AC-036J-012-05`, `AC-036J-012-06` |
| Operator / denied | Operator is outside commercial scope | Activation and retirement are denied. The Offer is unchanged. | Denial is text, not colour alone | No change | `AC-036J-012-02` |
| Operator / retire | Explicit retire | Confirmation first. Confirmed retirement stops future application and leaves purchased history. Cancelled confirmation leaves the Offer active. | Confirmation and cancel are keyboard operable | Retired, or still active if cancelled | `AC-036J-012-03` |

## 14. Permissions / resource context

| Action | Existing identity / permission authority | Resource context / server-derived scope | Allowed / denied / cross-scope variants | AC IDs |
|---|---|---|---|---|
| View and apply customer Offers | Customer session or guest cart for unrestricted coupons | The customer's cart and checkout | Another customer's cart is not readable | `US-036J-001` |
| Author Promotion or Coupon | Existing promotions and coupons authorization from IMP-036F | Authorized commercial scope | Out-of-scope denied. No new role or permission in this draft. | `AC-036J-012-02` |
| See redemption operations facts | Same commercial authorization | Offers in scope | Cross-scope redemption lists are denied | `US-036J-012` |

## 15. Data implications

Inputs are cart contents, fulfilment mode, accepted timing, customer identity where required,
and operator configuration of Promotions and Coupons. Outputs are evaluated benefits, customer
explanation, and, after payment, the existing immutable Checkout Snapshot. Historical orders
reload purchased facts. This draft does not choose a table, migration, or new aggregate.
First-order reads successful direct-order history. Cap consumption must not double-grant.
Fit owns the minimum persistence extension for non-coupon global caps and for eligibility the
current Promotion model cannot store.

## 16. Security/privacy

Customer commercial explanation stays on that customer's cart, checkout, and order. First-order
checks must not display another customer's orders. Coupon failures use the reason classes in
`US-036J-007` and do not become an account oracle. Workforce visibility stays inside existing
commercial scope. No new trust boundary is created by calling a benefit an Offer.

## 17. Concurrency/recovery

Commercial races that must stay truthful:

- Overlapping payment attempts must not both consume the last global redemption.
- Overlapping payment attempts must not both receive a single-use first-order benefit.
- Duplicate coupon submission is safe: one applied result, not two merchandise discounts.

The exact lock or claim for those commercial races is Architecture Fit, using existing coupon
claims where they already fit. A failed payment does not consume first-order eligibility.
Interruption before snapshot seal must not leave a payable total that still includes an invalid
Offer.

Complimentary-item activation race:

- Two overlapping authorized attempts to activate different valid complimentary-item Offers,
  when none is yet ACTIVE, must settle with at most one ACTIVE complimentary-item Offer
  (`COMPLIMENTARY_ITEM_CONCURRENT_ACTIVE_MAX = 1`).
- There is never a settled state with two ACTIVE complimentary-item Offers.
- An activation attempt that is not represented by the authoritative active Offer must not report a false successful activation. A non-winning or non-applied attempt returns a truthful non-success, conflict, or retry outcome.
- Product Definition does not choose which attempt wins. Zero or one ACTIVE after settlement
  satisfies the invariant. The binding product result is `ACTIVE_COUNT <= 1`.
- Exact lock, transaction isolation, CAS or revision check, serialization, technical winner
  selection, and retry mechanics are Architecture Fit
  (`COMPLIMENTARY_ITEM_CONCURRENT_WINNER = FIT_OWNED_WHERE_PRODUCT_OUTCOME_UNCHANGED`).
  That marker is not permission for two ACTIVE Offers.
- AC-036J-013-04 does not replace this operator activation invariant. If inconsistent or racing
  state nevertheless causes more than one complimentary-item Offer to qualify for the same cart,
  neither competing complimentary item is chosen or presented
  (`COMPLIMENTARY_ITEM_COMPETING_OFFERS = NONE_CHOSEN`). The two safeguards sit on different
  boundaries: operator activation is `AT_MOST_ONE_ACTIVE`; the customer commercial fallback is
  `NONE_CHOSEN` when inconsistent competing qualifiers nevertheless exist.

This section does not specify database mechanics.

## 18. Accessibility/responsive expectations

Cart, Checkout Review, Payment's read-only summary, and the existing commercial form must
work on a narrow mobile viewport and with keyboard. Cart coupon entry and Checkout Review
coupon entry stay usable. The savings summary stays readable.

The coupon input has an accessible name. The result or error is associated with that input.
Apply, Remove, and Change are keyboard operable. Status is not communicated only by colour.
After validation failure, focus returns to the coupon input. After sign-in, focus returns to
the coupon result on the surface where the attempt was made. This draft does not specify
components.

## 19. Observability/supportability if applicable

Operators need enough application and redemption visibility to see that a V1 Offer is
applying, exhausted, or failing validation. That is operational visibility, not campaign
analytics, causal lift, or experimentation. Descriptive counts of application and redemption
are in V1. Deal views, campaign aggregates, and incremental-revenue claims are not.

## 20. Golden Journeys affected

| GJ ID / registry status | Affected steps / downstream behaviour | Mandatory for this acceptance? | Related story / AC IDs | Required proof / actual evidence |
|---|---|---|---|---|
| `GJ-FIRST-ORDER` / `CURRENT` | The accepted purchase path gains explainable benefits and revalidation. Browser payment success still does not create the Order. | YES for the offer explanation on that path once implementation is authorized | `US-036J-004`, `US-036J-008` | Not executed |
| `GJ-RETURNING-ORDER` / `PARTIAL` | A returning customer must not receive a first-order Offer. Order Again remains outside this slice. | YES for the ineligible first-order case | `US-036J-005` | Not executed |
| Other registry journeys | Not changed by this draft | NO | n/a | n/a |

## 21. Dependencies

| Dependency | Authority / verified state | Required before which story or gate? | Unresolved impact |
|---|---|---|---|
| D-382 sequencing | CURRENT at this draft | All | None for drafting |
| Promotion / Coupon / Pricing / Checkout Snapshot | Accepted IMP-016, IMP-021, IMP-036F, ADR-007 | All monetary outcomes | Fit must not add an evaluator |
| Fulfilment mode | IMP-036H COMPLETE_AND_ACCEPTED | `US-036J-006` | None for product meaning |
| Scheduled timing | IMP-036I COMPLETE_AND_ACCEPTED | `US-036J-006` | Do not redefine Scheduled |
| Product Definition Gate | PASS | Architecture Fit | None. Gate PASS is not Architecture Fit. |
| Architecture Fit | PASS / LOCKED | Implementation Tranche 1 | Implementation Plan PASS; Implementation Authorization APPROVED 2026-10-01; implementation STARTED; Tranche 1 PASS |
| FD-036J-01 | APPROVED 2026-09-27: Cart and Checkout Review share one coupon state; Payment does not mutate it | None for Gate readiness | Does not itself pass the Gate |
| FD-036J-02 | APPROVED 2026-09-27: one primary merchandise or order Offer plus one compatible delivery incentive; a qualifying compatible pair with real monetary benefit both apply; best valid monetary combination wins; standing free delivery creates no duplicate saving | None for Gate readiness | Product Definition decision. Not a Decision Register entry. Does not itself pass the Gate |
| FD-036J-03 | APPROVED 2026-09-28: complimentary-item V1 operating model in the dedicated section below | None for Gate readiness | Product Definition decision. Not a Decision Register entry. Does not itself pass the Gate |

## 22. Supported now

| Behaviour | Existing verified or V1 acceptance commitment? | Story / AC IDs / source |
|---|---|---|
| Promotion and Coupon monetary evaluation for existing benefit types | Existing accepted engine, not this slice's acceptance claim | IMP-016 / IMP-036F |
| Customer explanation, coupon entry, threshold copy, first-order, mode eligibility, caps, complimentary menu item, and operator completeness | V1 acceptance commitment. Not yet implemented or proven. | `US-036J-001` … `US-036J-013` |

## 23. Scope taxonomy

These categories are not equivalent. DRAFT-1's single `DEFERRED` label mixed them. That label is
not current.

### PARKED_SEQUENCED_FUTURE_CAPABILITIES

These were not rejected. They must not disappear. They were deliberately sequenced out of
IMP-036J by D-382. They are not "never planned." D-382 assigned no IMP numbers. D-383 later
amends only Revenue Recommendations identity, activation, and sequencing. Deals and Campaigns
still have no IMP identity.

| Capability | Status | What is preserved |
|---|---|---|
| Deals | `PARKED_DISCOVERY`; `ROADMAP_IDENTITY = NONE`; `ACTIVATED = NO` | Historical Founder-approved discovery direction. The earlier broad discovery included meaningful Deal V1 candidates: fixed-price combo, Meal for One, Meal for Two / Group, multi-item Deal, choice-based combo, Deal discovery/browse, Deal configuration, direct Add-to-cart, and Deal availability behavior. |
| Campaigns | `PARKED_DISCOVERY`; `ROADMAP_IDENTITY = NONE`; `ACTIVATED = NO` | Historical Founder-approved discovery direction. Campaign means a first-class business/operator orchestration concept over Deals/Offers, timing, scope, merchandising, objective, redemption visibility, and descriptive measurement. Earlier discovery V1 direction included lightweight Campaign orchestration and descriptive measurement. |
| Revenue Recommendations | Formal identity `IMP-036K` under D-383; parallel Product Definition and Experience Definition preparation only; `PRODUCT_DEFINITION = NOT_CREATED`; `EXPERIENCE_DEFINITION = NOT_CREATED`; `ARCHITECTURE_FIT = NOT_PERFORMED`; `IMPLEMENTATION_AUTHORIZED = NO` | Previously parked discovery. It was not part of the original Offers/Deals/Campaigns capability. This IMP-036J definition does not change its product semantics. D-383 allocates the identity and does not approve a Product Definition, Experience Definition, Architecture Fit, or implementation. |

### FOLLOW_UP_NOT_V1

Earlier discovery already classified these as follow-up, or did not require them in V1. They are
not rejected. They were not cut from an approved IMP-036J V1. They require later authorization.

- claimable Offer activation
- targeted one-off Offer activation
- loyalty reward activation
- My BOBA / Offers for You
- full personalized Offer center
- daypart recurrence / targeting
- category / menu-section targeting
- Campaign monetary budgets
- Campaign budget pacing
- advanced per-day budget controls
- advanced Offer segmentation
- advanced Offer personalization
- advanced experimentation
- causal / incremental-lift measurement
- customer-choice gift selection (Deal-like future behavior; not the V1 complementary item)
- short terms document for an applied Offer (`ODC-US-062`); V1 still explains the saving and why it applied where practical

### EXPLICIT_NON_GOALS_AND_PROHIBITED_DIRECTIONS

These are not deferred. They are intentionally not part of the desired architecture or product.

- second money engine (`NO_SECOND_MONEY_ENGINE`)
- second Promotion evaluator
- second Pricing engine
- generic platform-wide rules engine
- arbitrary marketing-automation platform

### Physical merchandise boundary

ODC-14 future conceptual compatibility for rewards such as a sticker, a collectible, or apparel
may remain. IMP-036J does not create merchandise inventory, stock reservation, merchandise
shipping, warehouse logic, or merchandise fulfilment. A future separately authorized capability
is required. This boundary is not ordinary commercial follow-up.

## 24. Not supported by design

| `NOT_SUPPORTED_BY_DESIGN` behaviour | Reason / authority | User-visible boundary / relevant AC |
|---|---|---|
| Second money engine, second Promotion evaluator, or second Pricing engine | D-382; `BR-036J-012`; prohibited, not deferred | Customer still sees one payable evaluation |
| Loyalty points, rewards wallet, cashback balance, gift cards | Discovery deferrals | No points balance |
| Merchandise inventory, stock reservation, shipping, warehouse logic, or merchandise fulfilment | ODC-14 boundary. Conceptual sticker, collectible, or apparel compatibility may remain. A future separately authorized capability is required. | No merchandise fulfilment in IMP-036J |
| General segmentation, recommendation ranking, or a personalization engine | Out of promotions-first scope. Advanced personalization is `FOLLOW_UP_NOT_V1`, not a V1 engine. | No “offers for you” model in IMP-036J |
| Presenting sales as causal incremental revenue | ODC-13. Advanced experimentation and lift measurement are `FOLLOW_UP_NOT_V1`. | Operators must not label sales as incremental revenue in V1 |
| Arbitrary marketing automation or a generic rules engine | Prohibited direction, not deferred | Operator surface stays Promotion and Coupon operation |
| Directly purchasable Deals | Promotions-first split | No Deals destination |
| Restoring first-order eligibility after cancel or refund | ODC-06 | `AC-036J-005-02` |

## 25. Unresolved / decision required

| `UNRESOLVED_DECISION_REQUIRED` item | Material user/business impact | Decision owner / evidence needed | Affected stories / gate |
|---|---|---|---|
| None | `OPEN_FOUNDER_PRODUCT_DECISIONS = 0`; `UNRESOLVED_MATERIAL_PRODUCT_DECISIONS = 0` | FD-036J-01, FD-036J-02, and FD-036J-03 are APPROVED | Product Definition Gate PASS is persisted. Architecture Fit PASS and architecture lock are persisted. Design Readiness PASS and Implementation Plan PASS are persisted. Implementation Authorization is APPROVED and implementation has started. Tranche 1 is in review. |

`FD-036J-01` = `APPROVED` on 2026-09-27.
`FD-036J-02` = `APPROVED` on 2026-09-27.
`FD-036J-03` = `APPROVED` on 2026-09-28.

### FD-036J-03 — Complimentary-item V1 operating model

Status: APPROVED

Date: 2026-09-28

Authority: Founder

This is a Product Definition decision. It is not Decision Register entry D-383. FD-036J-02 remains the general merchandise or order plus compatible delivery stacking policy. FD-036J-03 is the complimentary-item V1 configuration, tie, concurrency, and recovery model.

```text
FD-036J-03 = APPROVED
FD-036J-03_DECISION_DATE = 2026-09-28
FD-036J-03_AUTHORITY = FOUNDER
```

Decision:

- A V1 complimentary-item Offer specifies exactly one complete menu-item line.
- The complimentary line must not require a customer variant choice, a required modifier choice, or a positive-price / paid modifier choice. If the item cannot exist as a complete no-choice line under accepted Catalog and Customization authority, the complimentary-item configuration cannot be activated in V1.
- The customer does not select a gift from a catalogue.
- At most one complimentary-item Offer may be ACTIVE at a time in V1 (`COMPLIMENTARY_ITEM_SINGLE_ACTIVE = YES`).
- Activating a second complimentary-item Offer while another remains active is rejected.
- When no complimentary-item Offer is ACTIVE and two authorized activation attempts overlap, the settled authoritative state still contains at most one ACTIVE complimentary-item Offer (`COMPLIMENTARY_ITEM_CONCURRENT_ACTIVE_MAX = 1`; `ACTIVE_COUNT <= 1`). Zero or one ACTIVE after that race satisfies the invariant.
- Product Definition does not choose which overlapping attempt wins. Architecture Fit owns locking, isolation, CAS or revision checks, serialization, technical winner selection, and retry mechanics where the product outcome stays `ACTIVE_COUNT <= 1` (`COMPLIMENTARY_ITEM_CONCURRENT_WINNER = FIT_OWNED_WHERE_PRODUCT_OUTCOME_UNCHANGED`). That marker is not permission for two ACTIVE Offers.
- An activation attempt that is not represented by the authoritative active Offer must not report a false successful activation.
- The customer fallback in AC-036J-013-04 does not replace this operator activation invariant. AC-036J-013-04 remains `NONE_CHOSEN` if inconsistent competing qualifiers nevertheless exist.
- If an inconsistent or racing state nevertheless results in more than one complimentary-item Offer qualifying for the same cart, neither competing complimentary item is silently chosen and neither is presented as the selected gift (`COMPLIMENTARY_ITEM_COMPETING_OFFERS = NONE_CHOSEN`). The payable commercial result remains coherent through the single accepted commercial evaluation. Neither competing offer is selected by created timestamp, Offer ID, coupon presence, database order, or technical ordering. A later richer priority model would require separate product authority.
- When a valid complimentary-item combination has the same payable amount as the otherwise-equivalent result with no primary merchandise or order Offer, the complimentary-item combination wins and the promised item is delivered (`COMPLIMENTARY_ITEM_EQUAL_PAYABLE_TIE = COMPLIMENTARY_COMBINATION_SELECTED`). This customer-visible choice is not delegated to Architecture Fit as a technical tie-break. Other exact-payable ties that do not change delivered merchandise may remain Architecture Fit-owned.
- If the promised complimentary item becomes unavailable before payment, there is no silent substitute. The complimentary Offer leaves the payable result. The best valid commercial result is recomputed through the single accepted commercial evaluation. The customer is told the item is no longer available. Payment does not continue on the stale complimentary-item line. Recovery remains on Checkout Review (`COMPLIMENTARY_ITEM_UNAVAILABLE_RECOVERY = RECOMPUTE_WITHOUT_SUBSTITUTE`).
- The complimentary-item Offer occupies the existing `PRIMARY_MERCHANDISE_OR_ORDER_OFFER` slot. It creates no new stacking slot.
- It may pair with at most one compatible delivery incentive under FD-036J-02.
- It does not stack with another merchandise or order Offer.
- Purchased complimentary-item truth remains immutable through the accepted Checkout Snapshot and purchased Order authority (`COMPLIMENTARY_ITEM_PURCHASED_TRUTH = CHECKOUT_SNAPSHOT`).
- If Architecture Fit cannot safely express this outcome without a second money engine, a second Promotion evaluator, a second Pricing engine, breaking Checkout Snapshot truth, or violating accepted Catalog, Customization, or Availability authority, Architecture Fit returns STOP / CONTRADICTION / DECISION_REQUIRED (`FIT_COMPLIMENTARY_ITEM_UNSAFE = STOP_CONTRADICTION_DECISION_REQUIRED`). It must not silently remove or downgrade the V1 requirement.

```text
COUPON_ENTRY_SURFACE = CART + CHECKOUT_REVIEW
ONE_SHARED_COUPON_STATE = YES
PAYMENT_COUPON_MUTATION = NO
MAX_PRIMARY_MERCHANDISE_OR_ORDER_OFFERS = 1
MAX_DELIVERY_INCENTIVES = 1
COMPATIBLE_STACK_RESULT = BOTH_APPLY
MULTIPLE_CANDIDATE_SELECTION = BEST_VALID_MONETARY_COMBINATION
STANDING_FREE_DELIVERY_DUPLICATE_SAVING = PROHIBITED
GUEST_IDENTITY_ALONE_REJECTS = NO
ENTERS_SAME_COMMERCIAL_CANDIDATE_EVALUATION = YES
COUPON_BACKED_OFFER_APPLIES_WHEN_BEST_COMBINATION_DEPENDS_ON_IT = YES
BETTER_NON_COUPON_COMBINATION_REMAINS = YES
FIRST_ORDER_AND_PER_CUSTOMER_CAP_REQUIRE_AUTHENTICATED_IDENTITY = YES
COMPLIMENTARY_MENU_ITEM_V1_ACCEPTANCE = MANDATORY
COMPLIMENTARY_MENU_ITEM_FOLLOW_UP = PROHIBITED
COMPLIMENTARY_MENU_ITEM_STACKING_SLOT = PRIMARY_MERCHANDISE_OR_ORDER_OFFER
COMPLIMENTARY_MENU_ITEM_NEW_STACKING_SLOT = NO
COMPLIMENTARY_ITEM_EQUAL_PAYABLE_TIE = COMPLIMENTARY_COMBINATION_SELECTED
COMPLIMENTARY_ITEM_SINGLE_ACTIVE = YES
COMPLIMENTARY_ITEM_CONCURRENT_ACTIVE_MAX = 1
COMPLIMENTARY_ITEM_CONCURRENT_WINNER = FIT_OWNED_WHERE_PRODUCT_OUTCOME_UNCHANGED
FIT_COMPLIMENTARY_ITEM_UNSAFE = STOP_CONTRADICTION_DECISION_REQUIRED
```

DRAFT-1 recommended Cart-only entry. The Founder instead approved entry on both Cart and
Checkout Review, over one shared coupon / commercial state, with Payment read-only for coupon
changes. FD-036J-02 approves deterministic compatible-delivery stacking. Where two valid
combinations produce the same monetary outcome and the same delivered merchandise, a stable technical tie-break may be chosen in
Architecture Fit because it does not change what the customer receives. FD-036J-03 approves the
complimentary-item equal-payable choice: when a valid complimentary-item combination has the same
payable amount as the otherwise-equivalent result with no primary merchandise or order Offer, the
complimentary combination is selected (`COMPLIMENTARY_ITEM_EQUAL_PAYABLE_TIE = COMPLIMENTARY_COMBINATION_SELECTED`).
That customer-visible choice is not delegated to Architecture Fit as a technical tie-break. If more than one
complimentary-item Offer would qualify, neither competing complimentary item is chosen or presented.
Exact evaluator representation stays in Architecture Fit. FD-036J-02 and FD-036J-03 are not Decision Register entry D-383.

Other questions are consumed from discovery or from this draft's scope:
public Offers browse is follow-up; complimentary-item V1 is one specified complementary item when
accepted authority can express it safely, and that outcome is a mandatory acceptance scenario;
customer-choice gifts stay future/Deal-like; free delivery is one coherent charge result;
unrestricted Coupons are not rejected for missing identity alone and still follow the best valid
combination; identity-restricted coupons may be attempted before sign-in and retried afterward
where existing continuity allows; full terms are follow-up; operator V1 measurement is operational
application and redemption visibility, not campaign analytics.

## 26. Definition of Ready

| Story ID | Applicable fields complete / evidence | Open material decisions | Readiness / blocker |
|---|---|---|---|
| `US-036J-001` … `US-036J-013` | Sections 9–18 state the outcome. Architecture Fit PASS and permissions binding are recorded in the locked capability architecture. | None. | `READY_FOR_IMPLEMENTATION`. Reason: Implementation Authorization APPROVED 2026-10-01; implementation STARTED; Tranche 1 PASS. |

```text
READINESS = READY_FOR_IMPLEMENTATION
PRODUCT_DEFINITION_GATE = PASS
ARCHITECTURE_FIT = PASS
IMPLEMENTATION_AUTHORIZED = YES
IMPLEMENTATION_STARTED = YES
READINESS_WHILE_GATE_NOT_PERFORMED = NOT_READY_FOR_IMPLEMENTATION
AFTER_GATE_PASS_READINESS_MUST_DROP_GATE_BLOCKER = YES
```

Stories are `READY_FOR_IMPLEMENTATION`. Product Definition Gate PASS, Design Readiness PASS, Quality/Test Plan and Measurement/Instrumentation Plan finalization, Implementation Plan PASS, and Implementation Authorization APPROVED on 2026-10-01 remove those readiness blockers. Implementation has started. Tranche 1 is in review and is not passed. No Sprint is assigned.

## 27. Product Definition Gate (historical evaluation)

```text
PRODUCT_DEFINITION_GATE
Capability: IMP-036J — Promotions, Coupons & Offers
Product Definition Version: PD-IMP-036J-DRAFT-6
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
UX State Matrix Complete: PASS
Accessibility Considered: PASS
Golden Journeys Identified: PASS
Explicit Deferrals Recorded: PASS
Unresolved Product Decisions: NONE
Founder Product Decisions: FD-036J-01 APPROVED; FD-036J-02 APPROVED; FD-036J-03 APPROVED
Architecture Conflicts: NONE IDENTIFIED
Architecture Fit: NOT_PERFORMED
PRODUCT_DEFINITION_GATE_EXECUTION: PERFORMED
Gate Result: PASS
FOUNDER_PRODUCT_DEFINITION_APPROVAL: YES
FOUNDER_PRODUCT_DEFINITION_APPROVAL_DATE: 2026-09-28
INDEPENDENT_PRODUCT_DEFINITION_GATE: PASS
GATE_EVALUATED_HEAD: 24aa3ced280dbfc18ac52275ed97ae919904481d
GATE_EVALUATED_TREE: e7fd72f2af3b0267f438bf9b65e7f7f23bf43f27
GATE_EVALUATED_FINGERPRINT: 9f9c708306a76e140ea4143feaf8e007ca975f03c3dc418f65e30aaf8bbbd1e1
```

At that Product Definition Gate checkpoint, `Architecture Conflicts: NONE IDENTIFIED` was not Architecture Fit PASS. Architecture Fit was
`NOT_PERFORMED`. Implementation was not yet authorized. Exact permission keys remain an Architecture
Fit binding. Authorization variants were sufficient for the Product Definition Gate. Concurrency,
including last-global-redemption, first-order, duplicate coupon submission, and complimentary-item
concurrent activation, was considered; the mechanism remains Fit.
