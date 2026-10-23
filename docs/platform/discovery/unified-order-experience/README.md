<!--
  AUTHORITY: NON_AUTHORITATIVE_DISCOVERY_DRAFT
  PACKAGE: UOE-CANDIDATE-3
  SUPERSEDES_PACKAGE: UOE-CANDIDATE-2
  STATUS: GATES_RECORDED_ARCHITECTURE_FIT_PASS_AND_LOCK
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
BINDING_CAPABILITY_ARCHITECTURE = docs/platform/capabilities/UOE-unified-order-experience.md
BASE_MAIN_SHA = 00ef486e9dbeb1a30ba32e76fcd7b8b43507a53f
REFERENCE_CANDIDATE_2_HEAD = 5a4583eba34dff93082c49a1e0edce1efce4d07c
REFERENCE_CANDIDATE_3_PRIOR_HEAD = aff6d9b403a91dea2dea9492ac4e9098d3008159
REFERENCE_CHECKOUT_PRECISION_HEAD = 25d3b5d210306ad15bf28f87335d3e50a9d45c0f
REVIEWED_PACKAGE_HEAD = dbe0786280fac4ba80ba727c7510b8c23da69ed1
FIT_EVALUATION_HEAD = ecbfb4f4f7f06a888e0a3c4417bc1c647239974b
REVIEWED_ARCHITECTURE_CONTRACT_HEAD = 9a9e3f71789a4cce5141eb88b3ab606f72b2c54e
PACKAGE_REVISION = CANDIDATE-3 / ARCHITECTURE-FIT-PASS-AND-LOCK-1
CHECKOUT_CONTRACT_PRECISION = YES
FINAL_CONTRACT_COMPLETENESS = YES
ARCHITECTURE_LOCK_CONTRACT = ARCH-UOE-LOCK-PROPOSAL-1
EXPERIENCE_CRITICALITY = X3
CHANGE_RISK = CR2 (CR3 at checkout/payment boundaries)
FOUNDER_EXPERIENCE_DIRECTION = ACCEPTED_IN_CONVERSATION
FOUNDER_REVIEW_RECOMMENDATIONS_INCORPORATED = UOE-DR-02 | UOE-DR-04 | UOE-DR-05
FOUNDER_GATE_DECISION_REFERENCE = https://github.com/nivedhya11/BobaBear/pull/424#issuecomment-6365686428
FOUNDER_GATE_DECISION_DATE = 2026-10-23
FOUNDER_FIT_LOCK_DECISION_DATE = 2026-10-23
FOUNDER_FIT_LOCK_DECISION_REFERENCE = https://github.com/nivedhya11/BobaBear/pull/424#issuecomment-6371582324
GATE_PRECISION_REVISION = YES
PRODUCT_DEFINITION = PD-UOE-CANDIDATE-3
PRODUCT_DEFINITION_GATE_EXECUTION = PERFORMED
PRODUCT_DEFINITION_GATE_RESULT = PASS
EXPERIENCE_DEFINITION = XD-UOE-CANDIDATE-3
EXPERIENCE_GATE_EXECUTION = PERFORMED
EXPERIENCE_GATE_RESULT = PASS
ARCHITECTURE_FIT_EVALUATION = PERFORMED
ARCHITECTURE_FIT_RECOMMENDATION = PRECHECKOUT_ELIGIBILITY_WEB_FIRST_V1
ARCHITECTURE_FIT_PASS = PASS
ARCHITECTURE_LOCK = YES
ARCHITECTURE_LOCK_STATUS = ARCHITECTURE_LOCKED
PER_PROCESS_RATE_LIMIT_RESIDUAL = ACCEPTED_FOR_V1_PILOT
DESIGN_READINESS = CANDIDATE_ONLY
QUALITY_TEST_PLAN = PROPOSED_FOR_INDEPENDENT_REVIEW
MEASUREMENT_PLAN = PROPOSED_FOR_INDEPENDENT_REVIEW
VARIANT = PRECHECKOUT_ELIGIBILITY_WEB_FIRST_V1
PROVENANCE_STORAGE_DECISION = ADDITIVE_NULLABLE_CONTEXT_FIELDS_PLUS_SERVER_CONTEXT_DIGEST
IMPLEMENTATION_AUTHORIZED = NO
PRE_GTM_EXPERIENCE_AUDIT = NOT_PERFORMED
ROADMAP_STATE = UNCHANGED
UOE_CANDIDATE_4 = NOT_INTRODUCED
```

This package revises **UOE-CANDIDATE-2** for gate precision, Checkout contract precision, and
final contract completeness; records Founder **Product Definition Gate PASS** and
**Experience Gate PASS**; records independent Architecture Fit evaluation; and records Founder
**Architecture Fit PASS** plus **Architecture Lock** for contract `ARCH-UOE-LOCK-PROPOSAL-1` at
reviewed HEAD `9a9e3f717…`. Binding CURRENT architecture lives at
[`docs/platform/capabilities/UOE-unified-order-experience.md`](../../capabilities/UOE-unified-order-experience.md).
Design Readiness PASS, implementation authorization, merge, and deploy remain **not** granted.

## Founder gate dispositions (recorded)

| ID | Disposition |
|---|---|
| UOE-DR-03 / Product Definition Gate | **PASS** — `PD-UOE-CANDIDATE-3` |
| UOE-DR-03 / Experience Gate | **PASS** — `XD-UOE-CANDIDATE-3` |
| UOE-DR-06 / Schedule-capable Takeaway | **ACCEPTED** (no Menu exact slots; no guaranteed future time) |
| UOE-DR-06 / Checkout composition | **ACCEPTED_CAPABILITY_CONFORMANCE_DEFECT**; preferred separately scoped corrective after urgent payment work; **implementation NOT_AUTHORIZED** by this decision |
| UOE-DR-01 | `FUTURE_IMP_ID=NOT_ALLOCATED`; sequencing **DEFERRED**; D-383 / IMP-036K unchanged; D-377 holds preserved |
| UOE-DR-02 / 04 / 05 | Preserve previously approved dispositions (defer Menu slots; WhatsApp+in-app; strengthen eligibility/evaluate) |
| Architecture Fit | **PASS** — `PRECHECKOUT_ELIGIBILITY_WEB_FIRST_V1` at `9a9e3f717…` (Founder 2026-10-23) |
| Architecture Lock | **APPROVED** — `ARCH-UOE-LOCK-PROPOSAL-1`; per-process rate-limit residual **ACCEPTED_FOR_V1_PILOT** |

Exact microcopy variants and instrumentation schema remain owned by Design Readiness / Content QA /
Quality and Measurement finalization. Provenance-storage choice, contract bounds, abuse/perf/
privacy controls, and WhatsApp Meta template **assignment** are **LOCKED** in
[`UOE-unified-order-experience.md`](../../capabilities/UOE-unified-order-experience.md)
(historical proposal provenance:
[`13-architecture-lock-proposal.md`](./13-architecture-lock-proposal.md)). None may change the
approved user promise, eligibility, pricing truth, or payment safeguards without returning to
Product / Experience Gate.

## Gate-precision dispositions (retained)

| ID | Finding | Disposition |
|---|---|---|
| GP-01 | Scheduled Takeaway vs Takeaway Now | **CORRECTED** — Now = accepting-now; Schedule = schedule-capable; Checkout composition timing-aware; Founder **UOE-DR-06** accepted |
| GP-02 | Cart evaluate / Checkout precedence | **SPECIFIED** — reuse before Delivery-location early return; Takeaway without Delivery address; fail-closed missing evidence; fingerprint/dedup; provisional Offers |
| GP-03 | First-use / empty cart | **CORRECTED** — No Cart / Empty Cart / no eligible / error |
| GP-04 | Multi-tab presentation storage | **CORRECTED** — tab-scoped presentation intent; no cross-tab money/seal sync |

Formal PD-2 X3 Product Definition and Experience gates are **PERFORMED / PASS**. This package
does **not**:

- allocate or activate a future IMP
- mutate ROADMAP, STATE, the decision register, D-377, D-383, or accepted Product Definitions
- authorize Design Readiness, implementation, merge, deploy, staging, or payment operations
- claim the pre-GTM Experience / Product-Language / Instrumentation audit occurred
- allocate a future IMP or mutate ROADMAP/STATE lifecycle (UOE-DR-01 remains DEFERRED)

## Links

| Kind | Reference |
|---|---|
| Customer experience discovery | [GitHub #379](https://github.com/nivedhya11/BobaBear/issues/379) |
| Experience-gap programme assessment | [GitHub #380](https://github.com/nivedhya11/BobaBear/issues/380) |
| Experience Debt Register | [`../../EXPERIENCE-DEBT-REGISTER.md`](../../EXPERIENCE-DEBT-REGISTER.md) (`auditStatus=NOT_PERFORMED`) |
| Founder Product + Experience Gate | [PR #424 comment 6365686428](https://github.com/nivedhya11/BobaBear/pull/424#issuecomment-6365686428) |
| Founder Fit PASS + Architecture Lock | [PR #424 comment 6371582324](https://github.com/nivedhya11/BobaBear/pull/424#issuecomment-6371582324) |
| Binding capability architecture | [`../../capabilities/UOE-unified-order-experience.md`](../../capabilities/UOE-unified-order-experience.md) |
| Reviewed Product/Experience head | `dbe0786280fac4ba80ba727c7510b8c23da69ed1` |
| Reviewed Architecture contract head | `9a9e3f71789a4cce5141eb88b3ab606f72b2c54e` |
| Prior package | UOE-CANDIDATE-2 @ `5a4583eba34dff93082c49a1e0edce1efce4d07c` |
| Process authorities | PD-2 · EXP-1 · LANG-1 · TEST-1 |

## Document map

| Doc | Responsibility |
|---|---|
| [`01-business-outcome-personas-journeys.md`](./01-business-outcome-personas-journeys.md) | Outcome, personas, journeys |
| [`02-product-definition-candidate.md`](./02-product-definition-candidate.md) | Product Definition + entitlement (`PD-UOE-CANDIDATE-3`) |
| [`03-experience-definition-candidate.md`](./03-experience-definition-candidate.md) | Experience Definition + UX-A/B/C (`XD-UOE-CANDIDATE-3`) |
| [`04-story-map-acceptance-scenarios.md`](./04-story-map-acceptance-scenarios.md) | Story map + AS-01–AS-46 + challenge cases |
| [`05-gate-evidence-candidates.md`](./05-gate-evidence-candidates.md) | Product Gate / Experience Gate evidence (PASS recorded) |
| [`06-architecture-fit-candidate.md`](./06-architecture-fit-candidate.md) | Architecture Fit evaluation evidence (Founder PASS recorded) |
| [`07-design-readiness-candidate.md`](./07-design-readiness-candidate.md) | Design Readiness candidate |
| [`08-quality-test-plan-candidate.md`](./08-quality-test-plan-candidate.md) | Quality / Test Plan candidate |
| [`09-measurement-instrumentation-candidate.md`](./09-measurement-instrumentation-candidate.md) | Measurement / Instrumentation candidate |
| [`10-implementation-plan-and-risks.md`](./10-implementation-plan-and-risks.md) | Three-tranche plan + risk/dependency matrix |
| [`11-gate-disposition-founder-decision-record.md`](./11-gate-disposition-founder-decision-record.md) | Gate matrix + Founder decision record |
| [`12-template-completeness-addendum.md`](./12-template-completeness-addendum.md) | Canonical PD-2/EXP-1 gate fields, slicing, assumptions, surface table |
| [`13-architecture-lock-proposal.md`](./13-architecture-lock-proposal.md) | Historical Lock proposal provenance (superseded by capability architecture) |
| [`../../capabilities/UOE-unified-order-experience.md`](../../capabilities/UOE-unified-order-experience.md) | **CURRENT** locked capability architecture |

## Provisional candidate identifiers

| ID | Artifact |
|---|---|
| `UOE-CANDIDATE-3` | Package |
| `PD-UOE-CANDIDATE-3` | Product Definition (gate PASS) |
| `XD-UOE-CANDIDATE-3` | Experience Definition (gate PASS) |
| `ARCH-UOE-FIT-CANDIDATE-3` | Architecture Fit candidate / evaluation (Founder PASS) |
| `ARCH-UOE-LOCK-PROPOSAL-1` | Architecture Lock contract id (LOCKED; binding path under `capabilities/`) |
| `DR-UOE-CANDIDATE-3` | Design Readiness candidate |
| `QT-UOE-CANDIDATE-3` | Quality / Test Plan candidate |
| `MI-UOE-CANDIDATE-3` | Measurement / Instrumentation candidate |
| `IP-UOE-CANDIDATE-3` | Implementation plan candidate |

## Authority snapshot (verified at package base; lifecycle unchanged)

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
incorporated. UOE-CANDIDATE-3 corrects gate-precision inconsistencies (GP-01…GP-04). Founder
Product Definition + Experience Gate PASS and UOE-DR-06 / UOE-DR-01 dispositions are recorded
in [`11-gate-disposition-founder-decision-record.md`](./11-gate-disposition-founder-decision-record.md).
