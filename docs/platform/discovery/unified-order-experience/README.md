<!--
  AUTHORITY: NON_AUTHORITATIVE_DISCOVERY_DRAFT
  PACKAGE: UOE-CANDIDATE-2
  SUPERSEDES_PACKAGE: UOE-CANDIDATE-1
  STATUS: PD-2_CANDIDATE_FOR_FOUNDER_REVIEW
  APPLICATION_CODE_MUTATION: NO
  CANONICAL_LIFECYCLE_MUTATION: NO
  IMPLEMENTATION_AUTHORIZED: NO
  FUTURE_IMP_IDENTITY: NOT_AUTHORIZED
-->

# Unified Order Experience — PD-2 Candidate Package

```text
PACKAGE_ID = UOE-CANDIDATE-2
SUPERSEDES = UOE-CANDIDATE-1
WORKING_CAPABILITY_NAME = Unified Order Experience
FORMAL_IMP_IDENTITY = NOT_ALLOCATED
NOT_IMP_036J = YES
NOT_IMP_036K = YES
AUTHORITY = NON_AUTHORITATIVE_DISCOVERY_DRAFT
BASE_MAIN_SHA = 4cc24d1a4ea4f4dace4d71d48a40a961a64086d8
REFERENCE_CANDIDATE_1_HEAD = f31cd37853c5b98c88884186bde8ed910a955220
EXPERIENCE_CRITICALITY = X3
CHANGE_RISK = CR2 (CR3 at checkout/payment boundaries)
FOUNDER_EXPERIENCE_DIRECTION = ACCEPTED_IN_CONVERSATION
FOUNDER_REVIEW_RECOMMENDATIONS_INCORPORATED = UOE-DR-02 | UOE-DR-04 | UOE-DR-05
PRODUCT_DEFINITION_GATE = NOT_PERFORMED
EXPERIENCE_GATE = NOT_PERFORMED
ARCHITECTURE_FIT = CANDIDATE_ONLY (prerequisites not formally passed; contracts specified)
DESIGN_READINESS = CANDIDATE_ONLY
QUALITY_TEST_PLAN = PROPOSED_FOR_INDEPENDENT_REVIEW
MEASUREMENT_PLAN = PROPOSED_FOR_INDEPENDENT_REVIEW
VARIANT = PRECHECKOUT_ELIGIBILITY_WEB_FIRST_V1
IMPLEMENTATION_AUTHORIZED = NO
PRE_GTM_EXPERIENCE_AUDIT = NOT_PERFORMED
```

This package revises **UOE-CANDIDATE-1** after Founder review recommendations into one PD-2
candidate for Founder milestone review. It keeps UX-A / UX-B, language decisions (D1–D6 +
refinements A–D), and accepted Checkout / Payment / serviceability / fulfilment invariants.

Founder recommendations incorporated as the V1 candidate variant:

| ID | Disposition in this candidate |
|---|---|
| UOE-DR-02 | **Defer** exact Menu scheduling slots in V1 (Schedule **intent** + UNCONFIRMED; exact windows remain checkout-eligible only) |
| UOE-DR-04 | **Include** terminology consistency for **implemented** notification channels — WhatsApp + in-app (same-meaning); email/SMS/push non-sending today; do not invent new channels |
| UOE-DR-05 | **Strengthen V1** with server-authoritative **pre-checkout Takeaway outlet eligibility** and **mode-sensitive Cart evaluation**, without a second commercial authority |

Formal PD-2 X3 gates remain `NOT_PERFORMED` until legitimately evaluated. This package does **not**:

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
| Prior package | UOE-CANDIDATE-1 @ `f31cd37853c5b98c88884186bde8ed910a955220` |
| Process authorities | PD-2 · EXP-1 · LANG-1 · TEST-1 |

## Document map

| Doc | Responsibility |
|---|---|
| [`01-business-outcome-personas-journeys.md`](./01-business-outcome-personas-journeys.md) | Outcome, personas, journeys |
| [`02-product-definition-candidate.md`](./02-product-definition-candidate.md) | Product Definition candidate + entitlement |
| [`03-experience-definition-candidate.md`](./03-experience-definition-candidate.md) | Experience Definition + UX-A/B/C |
| [`04-story-map-acceptance-scenarios.md`](./04-story-map-acceptance-scenarios.md) | Story map + AS-01–AS-29 + challenge cases |
| [`05-gate-evidence-candidates.md`](./05-gate-evidence-candidates.md) | Product Gate / Experience Gate evidence |
| [`06-architecture-fit-candidate.md`](./06-architecture-fit-candidate.md) | Architecture Fit candidate + read contracts |
| [`07-design-readiness-candidate.md`](./07-design-readiness-candidate.md) | Design Readiness candidate |
| [`08-quality-test-plan-candidate.md`](./08-quality-test-plan-candidate.md) | Quality / Test Plan candidate |
| [`09-measurement-instrumentation-candidate.md`](./09-measurement-instrumentation-candidate.md) | Measurement / Instrumentation candidate |
| [`10-implementation-plan-and-risks.md`](./10-implementation-plan-and-risks.md) | Three-tranche plan + risk/dependency matrix |
| [`11-gate-disposition-founder-decision-record.md`](./11-gate-disposition-founder-decision-record.md) | Gate matrix + Founder decision record |
| [`12-template-completeness-addendum.md`](./12-template-completeness-addendum.md) | Canonical PD-2/EXP-1 gate fields, slicing, assumptions, surface table |

## Provisional candidate identifiers

| ID | Artifact |
|---|---|
| `UOE-CANDIDATE-2` | Package |
| `PD-UOE-CANDIDATE-2` | Product Definition candidate |
| `XD-UOE-CANDIDATE-2` | Experience Definition candidate |
| `ARCH-UOE-FIT-CANDIDATE-2` | Architecture Fit candidate |
| `DR-UOE-CANDIDATE-2` | Design Readiness candidate |
| `QT-UOE-CANDIDATE-2` | Quality / Test Plan candidate |
| `MI-UOE-CANDIDATE-2` | Measurement / Instrumentation candidate |
| `IP-UOE-CANDIDATE-2` | Implementation plan candidate |

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
UOE-CANDIDATE-1. Founder review recommendations for UOE-DR-02 / UOE-DR-04 / UOE-DR-05 are
recorded in
[`11-gate-disposition-founder-decision-record.md`](./11-gate-disposition-founder-decision-record.md)
and bound into the V1 variant in
[`02-product-definition-candidate.md`](./02-product-definition-candidate.md) and
[`06-architecture-fit-candidate.md`](./06-architecture-fit-candidate.md).
