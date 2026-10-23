<!--
  AUTHORITY: NON_AUTHORITATIVE_DISCOVERY_DRAFT
  PACKAGE: UOE-CANDIDATE-3
  SUPERSEDES_PACKAGE: UOE-CANDIDATE-2
  STATUS: PD-2_CANDIDATE_FOR_FOUNDER_REVIEW
  APPLICATION_CODE_MUTATION: NO
  CANONICAL_LIFECYCLE_MUTATION: NO
  IMPLEMENTATION_AUTHORIZED: NO
  FUTURE_IMP_IDENTITY: NOT_AUTHORIZED
-->

# Unified Order Experience — PD-2 Candidate Package

```text
PACKAGE_ID = UOE-CANDIDATE-3
SUPERSEDES = UOE-CANDIDATE-2
WORKING_CAPABILITY_NAME = Unified Order Experience
FORMAL_IMP_IDENTITY = NOT_ALLOCATED
NOT_IMP_036J = YES
NOT_IMP_036K = YES
AUTHORITY = NON_AUTHORITATIVE_DISCOVERY_DRAFT
BASE_MAIN_SHA = 00ef486e9dbeb1a30ba32e76fcd7b8b43507a53f
REFERENCE_CANDIDATE_2_HEAD = 5a4583eba34dff93082c49a1e0edce1efce4d07c
REFERENCE_CANDIDATE_3_PRIOR_HEAD = aff6d9b403a91dea2dea9492ac4e9098d3008159
PACKAGE_REVISION = CANDIDATE-3 / CHECKOUT-PRECISION-1
CHECKOUT_CONTRACT_PRECISION = YES
EXPERIENCE_CRITICALITY = X3
CHANGE_RISK = CR2 (CR3 at checkout/payment boundaries)
FOUNDER_EXPERIENCE_DIRECTION = ACCEPTED_IN_CONVERSATION
FOUNDER_REVIEW_RECOMMENDATIONS_INCORPORATED = UOE-DR-02 | UOE-DR-04 | UOE-DR-05
GATE_PRECISION_REVISION = YES
PRODUCT_DEFINITION_GATE = NOT_PERFORMED
EXPERIENCE_GATE = NOT_PERFORMED
ARCHITECTURE_FIT = CANDIDATE_ONLY (prerequisites not formally passed; contracts specified)
DESIGN_READINESS = CANDIDATE_ONLY
QUALITY_TEST_PLAN = PROPOSED_FOR_INDEPENDENT_REVIEW
MEASUREMENT_PLAN = PROPOSED_FOR_INDEPENDENT_REVIEW
VARIANT = PRECHECKOUT_ELIGIBILITY_WEB_FIRST_V1
IMPLEMENTATION_AUTHORIZED = NO
PRE_GTM_EXPERIENCE_AUDIT = NOT_PERFORMED
FORMAL_GATES = NOT_PERFORMED
ROADMAP_STATE = UNCHANGED
UOE_CANDIDATE_4 = NOT_INTRODUCED
```

This package revises **UOE-CANDIDATE-2** for gate precision before formal Product /
Experience / Architecture evaluation, then adds **same-scope Checkout contract precision**
(Scheduled Takeaway outlet listing + cart-evaluate Snapshot precedence / missing-evidence)
without allocating UOE-CANDIDATE-4. It keeps UX-A / UX-B / UX-C, language decisions
(D1–D6 + refinements A–D), DR-02 / DR-04 / DR-05, and accepted Checkout / Payment /
serviceability / fulfilment invariants.

## Gate-precision dispositions (this revision)

| ID | Finding | Disposition |
|---|---|---|
| GP-01 | Scheduled Takeaway vs Takeaway Now | **CORRECTED** — distinguish accepting-now (Now) from schedule-capable; do not reject Schedule solely because closed NOW; **Checkout composition** must be timing-aware (listing + no accepting-now evaluate between outlet bind and timing); Founder confirm under **UOE-DR-06**; DR-02 still defers Menu exact slots |
| GP-02 | Cart evaluate / Checkout precedence | **SPECIFIED** — reuse before Delivery-location early return; Takeaway quote without Delivery address; open-Checkout Snapshot reuse wins; **missing commercial-evaluation evidence must not fall through to divergent browse money**; effective Checkout mode conveyed; DRAFT/READY/PAYMENT_PENDING conflict rules; mode/outlet evaluation provenance; no second money authority; no Checkout mutation from browse |
| GP-03 | First-use / empty cart | **CORRECTED** — distinguish No Cart / Empty Cart / no eligible outlet / eligibility error; never “no outlets” merely because no items; preserve anonymous Menu browsing |
| GP-04 | Multi-tab presentation storage | **CORRECTED** — `sessionStorage` is tab-scoped presentation intent; no cross-tab sync of payable/sealed Checkout; each tab revalidates server facts |

Open Founder decisions still required for gates / sequencing: **UOE-DR-01**, **UOE-DR-03**,
**UOE-DR-06** (Schedule-capable entitlement + Checkout defect classification / remediation vehicle).

Formal PD-2 X3 gates remain `NOT_PERFORMED`. This package does **not**:

- allocate or activate a future IMP
- mutate ROADMAP, STATE, the decision register, D-377, D-383, or accepted Product Definitions
- authorize implementation, merge, deploy, staging, or payment operations
- claim formal Product / Experience / Fit / Design / Quality / Measurement gate PASS
- claim the pre-GTM Experience / Product-Language / Instrumentation audit occurred

`RECOMMENDED_PASS` / `RECOMMENDED_READY_FOR_EVALUATION` means agent-recommended readiness for
Founder evaluation. It is **not** canonical PASS.

## Links

| Kind | Reference |
|---|---|
| Customer experience discovery | [GitHub #379](https://github.com/nivedhya11/BobaBear/issues/379) |
| Experience-gap programme assessment | [GitHub #380](https://github.com/nivedhya11/BobaBear/issues/380) |
| Experience Debt Register | [`../../EXPERIENCE-DEBT-REGISTER.md`](../../EXPERIENCE-DEBT-REGISTER.md) (`auditStatus=NOT_PERFORMED`) |
| Prior package | UOE-CANDIDATE-2 @ `5a4583eba34dff93082c49a1e0edce1efce4d07c` |
| Process authorities | PD-2 · EXP-1 · LANG-1 · TEST-1 |

## Document map

| Doc | Responsibility |
|---|---|
| [`01-business-outcome-personas-journeys.md`](./01-business-outcome-personas-journeys.md) | Outcome, personas, journeys |
| [`02-product-definition-candidate.md`](./02-product-definition-candidate.md) | Product Definition candidate + entitlement |
| [`03-experience-definition-candidate.md`](./03-experience-definition-candidate.md) | Experience Definition + UX-A/B/C |
| [`04-story-map-acceptance-scenarios.md`](./04-story-map-acceptance-scenarios.md) | Story map + AS-01–AS-40 + challenge cases |
| [`05-gate-evidence-candidates.md`](./05-gate-evidence-candidates.md) | Product Gate / Experience Gate evidence |
| [`06-architecture-fit-candidate.md`](./06-architecture-fit-candidate.md) | Architecture Fit candidate + read contracts |
| [`07-design-readiness-candidate.md`](./07-design-readiness-candidate.md) | Design Readiness candidate |
| [`08-quality-test-plan-candidate.md`](./08-quality-test-plan-candidate.md) | Quality / Test Plan candidate |
| [`09-measurement-instrumentation-candidate.md`](./09-measurement-instrumentation-candidate.md) | Measurement / Instrumentation candidate |
| [`10-implementation-plan-and-risks.md`](./10-implementation-plan-and-risks.md) | Three-tranche plan + risk/dependency matrix |
| [`11-gate-disposition-founder-decision-record.md`](./11-gate-disposition-founder-decision-record.md) | Gate matrix + Founder decision record + GP dispositions |
| [`12-template-completeness-addendum.md`](./12-template-completeness-addendum.md) | Canonical PD-2/EXP-1 gate fields, slicing, assumptions, surface table |

## Provisional candidate identifiers

| ID | Artifact |
|---|---|
| `UOE-CANDIDATE-3` | Package |
| `PD-UOE-CANDIDATE-3` | Product Definition candidate |
| `XD-UOE-CANDIDATE-3` | Experience Definition candidate |
| `ARCH-UOE-FIT-CANDIDATE-3` | Architecture Fit candidate |
| `DR-UOE-CANDIDATE-3` | Design Readiness candidate |
| `QT-UOE-CANDIDATE-3` | Quality / Test Plan candidate |
| `MI-UOE-CANDIDATE-3` | Measurement / Instrumentation candidate |
| `IP-UOE-CANDIDATE-3` | Implementation plan candidate |

## Authority snapshot (verified at package base)

| Authority | Version |
|---|---|
| Vision | VISION-1 |
| Roadmap | GTM-R190 |
| State | STATE-R189 |
| Architecture | ARCH-R23 |
| Decision register | DR-25 |
| Product delivery | PD-2 |
| Experience | EXP-1 |
| Product language | LANG-1 |
| Testing | TEST-1 |
| Accepted through | IMP-036I |
| Current product slice | IMP-036J (`pendingAcceptance`) |
| Next product slice | IMP-036K — Revenue Recommendations |

## Founder direction reconciled in this package

Six approved experience decisions plus four required refinements (A–D) remain as in
UOE-CANDIDATE-1/2. Founder review recommendations for UOE-DR-02 / UOE-DR-04 / UOE-DR-05 remain
incorporated. UOE-CANDIDATE-3 corrects gate-precision inconsistencies (GP-01…GP-04) against
accepted IMP-036H/I and current evaluate/prepare behaviour; see
[`11-gate-disposition-founder-decision-record.md`](./11-gate-disposition-founder-decision-record.md).
