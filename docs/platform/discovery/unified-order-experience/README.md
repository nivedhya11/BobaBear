<!--
  AUTHORITY: NON_AUTHORITATIVE_DISCOVERY_DRAFT
  PACKAGE: UOE-CANDIDATE-3
  SUPERSEDES_PACKAGE: UOE-CANDIDATE-2
  STATUS: PLANNING_GATES_GRANT_WITH_EXCLUSIONS_RECORDED
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
DESIGN_READINESS = DR-UOE-CANDIDATE-3 PASS
QUALITY_TEST_PLAN = QT-UOE-CANDIDATE-3 FINALIZED
MEASUREMENT_PLAN = MI-UOE-CANDIDATE-3 FINALIZED
OWNER_DECISION_PACKAGE = UOE-FOUNDER-DESIGN-QT-MI-GATE-PACKAGE-R2
FOUNDER_DECISION_RECORD = UOE-FOUNDER-DECISION-RECORD-AND-GATE-READINESS-W2
PRIMARY_IN_APP_MICROCOPY = FOUNDER_APPROVED_WORKING_BASELINE (2026-10-24; not a gate PASS)
SECONDARY_MICROCOPY = CONTENT_QA_AT_TRANCHE_EXIT
WHATSAPP_META_ON_WIRE = NOT_APPROVED
ANALYTICS_OWNERSHIP_ROLES = RATIFIED (Founder interim; delegates NOT_NAMED)
PRIMARY_CONVERSION_DENOMINATOR = CHECKOUT_STARTS
DESIGN_READINESS_PASS = PASS
UOE_QT_MI_FINALIZATION = FINALIZED
CONSOLIDATED_GATE_PACKAGE = 16-consolidated-design-qt-mi-final-decision-package.md
CONSOLIDATED_GATE_DECISION = GRANT_WITH_EXCLUSIONS
FOUNDER_PLANNING_GATE_RECORD = 23-founder-b5-uoe-dr-qt-mi-planning-gate-record.md
FOUNDER_PLANNING_GATE_ID = FOUNDER-B5-UOE-DR-QT-MI
FOUNDER_PLANNING_GATE_DATE = 2026-10-25
FOUNDER_PLANNING_GATE_ACT = proceed
EVIDENCE_DELTA = 21-design-qt-mi-evidence-delta.md
FOUNDER_GATE_REVIEW_PACKET = 22-founder-gate-review-packet.md
EVIDENCE_DELTA_IS_NOT_A_GATE_PASS = YES
TRANCHE_CONTRACTS = UX-A 17 | UX-B 18 | UX-C 19 (PLANS ONLY)
UOE_DR06_WORK_PACKAGE = 20-uoe-dr-06-test-first-work-package.md
UOE_DR06_CHECKOUT_REMEDIATION = NOT_AUTHORIZED
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
Design Readiness PASS and Quality / Measurement finalization are recorded with exclusions in
[`23-founder-b5-uoe-dr-qt-mi-planning-gate-record.md`](./23-founder-b5-uoe-dr-qt-mi-planning-gate-record.md).
Implementation authorization, merge, and deploy remain **not** granted.

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
| FOUNDER-B5-UOE-DR-QT-MI / Design Readiness | **PASS** — `DR-UOE-CANDIDATE-3`; `GRANT_WITH_EXCLUSIONS`; record `23-…` |
| FOUNDER-B5-UOE-DR-QT-MI / Quality / Test Plan | **FINALIZED** — `QT-UOE-CANDIDATE-3`; tests not executed |
| FOUNDER-B5-UOE-DR-QT-MI / Measurement / Instrumentation Plan | **FINALIZED** — `MI-UOE-CANDIDATE-3`; vendor and retention not selected |

WhatsApp Meta body evidence, telemetry vendor, and retention durations remain unknown.
Owner-decision packaging is in
[`14-design-qt-mi-owner-decision-package.md`](./14-design-qt-mi-owner-decision-package.md).
The single Founder decision that joins Design Readiness, Quality plan finalization, and
Measurement plan finalization — with vendor, retention, and WhatsApp body left unknown — is
[`16-consolidated-design-qt-mi-final-decision-package.md`](./16-consolidated-design-qt-mi-final-decision-package.md)
§1.1. Founder "proceed" on 2026-10-25 is recorded as `GRANT_WITH_EXCLUSIONS` in
[`23-founder-b5-uoe-dr-qt-mi-planning-gate-record.md`](./23-founder-b5-uoe-dr-qt-mi-planning-gate-record.md).
Source-versus-plan classification for AS-01–AS-46 and the 21 negatives is the evidence delta
[`21-design-qt-mi-evidence-delta.md`](./21-design-qt-mi-evidence-delta.md). The concise
pre-decision surface is
[`22-founder-gate-review-packet.md`](./22-founder-gate-review-packet.md). Neither 21 nor 22
grants a gate. UX-A / UX-B / UX-C tranche contracts
(`17-…`, `18-…`, `19-…`) are plans. UOE-DR-06 stays
[`20-uoe-dr-06-test-first-work-package.md`](./20-uoe-dr-06-test-first-work-package.md)
and **NOT_AUTHORIZED**. The Founder's
W2 **working-baseline** approval of the proposed primary in-app microcopy, analytics ownership
roles, and checkout-start denominator — and the NOT_APPROVED status of on-wire WhatsApp wording —
is recorded in
[`15-founder-decision-record-and-gate-readiness-package.md`](./15-founder-decision-record-and-gate-readiness-package.md),
which prepared the Design Readiness / Quality / Measurement gate records for decision.
The grant itself is `23-…`, not the W2 ledger.
Provenance-storage choice, contract bounds, abuse/perf/privacy controls, and WhatsApp Meta
template **assignment** are **LOCKED** in
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
- authorize implementation, merge, deploy, staging, or payment operations
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
| Founder Design/QT/MI packaging wave | [PR #424 comment 6380384569](https://github.com/nivedhya11/BobaBear/pull/424#issuecomment-6380384569) |
| Founder W2 working-baseline approval (coordination record) | [GitHub #432](https://github.com/nivedhya11/BobaBear/issues/432) |
| Owner decision package | [`14-design-qt-mi-owner-decision-package.md`](./14-design-qt-mi-owner-decision-package.md) |
| Founder decision record + gate-readiness package | [`15-founder-decision-record-and-gate-readiness-package.md`](./15-founder-decision-record-and-gate-readiness-package.md) |
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
| [`07-design-readiness-candidate.md`](./07-design-readiness-candidate.md) | Design Readiness spec `DR-UOE-CANDIDATE-3` (PASS with exclusions) |
| [`08-quality-test-plan-candidate.md`](./08-quality-test-plan-candidate.md) | Quality / Test Plan `QT-UOE-CANDIDATE-3` (FINALIZED; tests not executed) |
| [`09-measurement-instrumentation-candidate.md`](./09-measurement-instrumentation-candidate.md) | Measurement / Instrumentation Plan `MI-UOE-CANDIDATE-3` (FINALIZED; vendor and retention unknown) |
| [`10-implementation-plan-and-risks.md`](./10-implementation-plan-and-risks.md) | Three-tranche plan + risk/dependency matrix |
| [`11-gate-disposition-founder-decision-record.md`](./11-gate-disposition-founder-decision-record.md) | Gate matrix + Founder decision record |
| [`12-template-completeness-addendum.md`](./12-template-completeness-addendum.md) | Canonical PD-2/EXP-1 gate fields, slicing, assumptions, surface table |
| [`13-architecture-lock-proposal.md`](./13-architecture-lock-proposal.md) | Historical Lock proposal provenance (superseded by capability architecture) |
| [`14-design-qt-mi-owner-decision-package.md`](./14-design-qt-mi-owner-decision-package.md) | Owner-decision ledger. Later grant is `23-…`; this file does not itself grant |
| [`15-founder-decision-record-and-gate-readiness-package.md`](./15-founder-decision-record-and-gate-readiness-package.md) | W2 record of Founder-approved working baseline (microcopy, WhatsApp NOT_APPROVED on-wire, analytics ownership roles, denominator, DR-06 obligations retained) + Design/Quality/Measurement gate records **for decision** + review lanes (no gate granted) |
| [`16-consolidated-design-qt-mi-final-decision-package.md`](./16-consolidated-design-qt-mi-final-decision-package.md) | Operative grant text §1.1. Unknown vendor, retention, and WhatsApp bodies stay explicit |
| [`17-ux-a-tranche-contract.md`](./17-ux-a-tranche-contract.md) | UX-A plan and test matrix. Implementation not authorized. On-wire WhatsApp excluded |
| [`18-ux-b-tranche-contract.md`](./18-ux-b-tranche-contract.md) | UX-B plan and test matrix (Contracts A/B). Checkout composition excluded |
| [`19-ux-c-tranche-contract.md`](./19-ux-c-tranche-contract.md) | UX-C plan and test matrix. Tab-scoped bar. No analytics vendor |
| [`20-uoe-dr-06-test-first-work-package.md`](./20-uoe-dr-06-test-first-work-package.md) | UOE-DR-06 test-first corrective plan. **NOT_AUTHORIZED**. AS-34 and AS-41 stay RED |
| [`21-design-qt-mi-evidence-delta.md`](./21-design-qt-mi-evidence-delta.md) | Source-versus-plan delta for Design, Quality, and Measurement. Not a gate PASS |
| [`22-founder-gate-review-packet.md`](./22-founder-gate-review-packet.md) | Pre-decision surface. Grant text remains `16-…` §1.1. This packet does not itself grant |
| [`23-founder-b5-uoe-dr-qt-mi-planning-gate-record.md`](./23-founder-b5-uoe-dr-qt-mi-planning-gate-record.md) | Founder planning-gate record `FOUNDER-B5-UOE-DR-QT-MI`. `GRANT_WITH_EXCLUSIONS` on 2026-10-25. Does not merge or authorize implementation |
| [`../../capabilities/UOE-unified-order-experience.md`](../../capabilities/UOE-unified-order-experience.md) | **CURRENT** locked capability architecture |

## Provisional candidate identifiers

| ID | Artifact |
|---|---|
| `UOE-CANDIDATE-3` | Package |
| `PD-UOE-CANDIDATE-3` | Product Definition (gate PASS) |
| `XD-UOE-CANDIDATE-3` | Experience Definition (gate PASS) |
| `ARCH-UOE-FIT-CANDIDATE-3` | Architecture Fit candidate / evaluation (Founder PASS) |
| `ARCH-UOE-LOCK-PROPOSAL-1` | Architecture Lock contract id (LOCKED; binding path under `capabilities/`) |
| `DR-UOE-CANDIDATE-3` | Design Readiness (PASS, `GRANT_WITH_EXCLUSIONS`) |
| `QT-UOE-CANDIDATE-3` | Quality / Test Plan (FINALIZED, tests not executed) |
| `MI-UOE-CANDIDATE-3` | Measurement / Instrumentation Plan (FINALIZED, vendor and retention unknown) |
| `FOUNDER-B5-UOE-DR-QT-MI` | Founder planning-gate record (2026-10-25) |
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
