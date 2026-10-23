<!--
  AUTHORITY: NON_AUTHORITATIVE_DISCOVERY_DRAFT
  PACKAGE: WXE-CANDIDATE-1
  STATUS: PD-2_CANDIDATE_FOR_FOUNDER_REVIEW
  APPLICATION_CODE_MUTATION: NO
  CANONICAL_LIFECYCLE_MUTATION: NO
  IMPLEMENTATION_AUTHORIZED: NO
  FUTURE_IMP_IDENTITY: NOT_ALLOCATED
-->

# Workforce Experience — PD-2 Candidate Package

```text
PACKAGE_ID = WXE-CANDIDATE-1
WORKING_CAPABILITY_NAME = Workforce Experience
WORKING_PACKAGE = WXE-CANDIDATE-1
FORMAL_IMP_IDENTITY = NOT_ALLOCATED
NOT_IMP_036J = YES
NOT_IMP_036K = YES
AUTHORITY = NON_AUTHORITATIVE_DISCOVERY_DRAFT
BASE_MAIN_SHA = 4cc24d1a4ea4f4dace4d71d48a40a961a64086d8
EXPERIENCE_CRITICALITY = X2 (material operator workflows); X3 where money, refund, identity/access, or consequential publish/effect
CHANGE_RISK = CR1 overall; CR2 at refund / access-mutation / commercial publish-effect / delivery-proof boundaries
FOUNDER_EXPERIENCE_DIRECTION = ACCEPTED_IN_CONVERSATION (desktop-first Workforce & Administration)
PRODUCT_DEFINITION_GATE = NOT_PERFORMED
EXPERIENCE_GATE = NOT_PERFORMED
ARCHITECTURE_FIT = CANDIDATE_ONLY
DESIGN_READINESS = CANDIDATE_ONLY
QUALITY_TEST_PLAN = REVIEWABLE_DRAFT
MEASUREMENT_PLAN = REVIEWABLE_DRAFT
IMPLEMENTATION_AUTHORIZED = NO
PRE_GTM_EXPERIENCE_AUDIT = NOT_PERFORMED
```

<!-- CI_HEAD_NOTE: inventory refresh on package path set -->

This package converts the completed Workforce-wide UX audit, independent amendments, and
Founder-approved **desktop-first** design direction into one coherent PD-2 candidate for
Founder milestone review. It covers **all implemented** Workforce Hub, Operations, Store, and
Administration surfaces discovered on `BASE_MAIN_SHA`.

Formal PD-2 gates remain `NOT_PERFORMED` until legitimately evaluated. This package does **not**:

- allocate or activate a future IMP
- mutate ROADMAP, STATE, the decision register, D-377, or accepted Product Definitions
- authorize implementation, merge, deploy, staging, runtime, DB, or payment operations
- claim formal Product / Experience / Fit / Design / Quality / Measurement gate PASS
- implement the redesign in application source
- overwrite the separate customer Unified Order Experience package (PR #424)

`RECOMMENDED_PASS` / `RECOMMENDED_READY_FOR_EVALUATION` means agent-recommended readiness for
Founder evaluation. It is **not** canonical PASS.

## Links

| Kind | Reference |
|---|---|
| Desktop-first staff Admin / future POS boundaries | [GitHub #378](https://github.com/nivedhya11/BobaBear/issues/378) |
| Experience-gap programme assessment | [GitHub #380](https://github.com/nivedhya11/BobaBear/issues/380) |
| Coupon-setup operator journey (related commercial UX) | [GitHub #376](https://github.com/nivedhya11/BobaBear/issues/376) |
| Promotion-create intermittent 500 (related commercial reliability) | [GitHub #381](https://github.com/nivedhya11/BobaBear/issues/381) |
| Customer Unified Order Experience candidate | [PR #424](https://github.com/nivedhya11/BobaBear/pull/424) (`UOE-CANDIDATE-*`; separate package; UX-A shared labels) |
| P0 delivery safety corrective (separate) | [PR #427](https://github.com/nivedhya11/BobaBear/pull/427) (`WXE-P0-CORRECTIVE-1`; authorized/published; **not merged/deployed/accepted**; server Gaps 1–3 remain open) |
| Accepted workforce foundations | IMP-030 · IMP-032 · IMP-035 · IMP-036A · IMP-036D · IMP-036E · IMP-036F · IMP-036G · IMP-036H · IMP-036I |
| Experience Debt Register | [`../../EXPERIENCE-DEBT-REGISTER.md`](../../EXPERIENCE-DEBT-REGISTER.md) (`auditStatus=NOT_PERFORMED`) |
| Process authorities | PD-2 · EXP-1 · LANG-1 · TEST-1 |

## Document map

| Doc | Responsibility |
|---|---|
| [`01-feature-route-inventory.md`](./01-feature-route-inventory.md) | Complete route/capability inventory + audit columns |
| [`02-product-definition-candidate.md`](./02-product-definition-candidate.md) | Product Definition candidate (`PD-WXE-CANDIDATE-1`) |
| [`03-experience-definition-candidate.md`](./03-experience-definition-candidate.md) | Experience Definition candidate (`XD-WXE-CANDIDATE-1`) |
| [`04-target-navigation-and-placement.md`](./04-target-navigation-and-placement.md) | Task-based IA; section/subsection map |
| [`05-breadcrumb-matrix.md`](./05-breadcrumb-matrix.md) | Route → breadcrumb matrix |
| [`06-terminology-dictionary.md`](./06-terminology-dictionary.md) | Founder direction vs shipped labels vs domain |
| [`07-desktop-layout-interaction-standard.md`](./07-desktop-layout-interaction-standard.md) | Desktop design system + interaction standard |
| [`08-operator-journey-scenarios.md`](./08-operator-journey-scenarios.md) | End-to-end operator journeys + acceptance scenarios |
| [`09-findings-register-and-p0-corrective-plan.md`](./09-findings-register-and-p0-corrective-plan.md) | P0/P1/P2 register + separate P0 corrective plan |
| [`10-architecture-fit-candidate.md`](./10-architecture-fit-candidate.md) | Architecture Fit candidate |
| [`11-design-readiness-candidate.md`](./11-design-readiness-candidate.md) | Design Readiness candidate |
| [`12-quality-test-plan-candidate.md`](./12-quality-test-plan-candidate.md) | Quality / Test Plan candidate |
| [`13-measurement-instrumentation-candidate.md`](./13-measurement-instrumentation-candidate.md) | Measurement / Instrumentation candidate |
| [`14-implementation-tranche-proposal.md`](./14-implementation-tranche-proposal.md) | Small tranche proposal (P0 first, then UX) |
| [`15-gate-disposition-founder-decision-record.md`](./15-gate-disposition-founder-decision-record.md) | Gate matrix + Founder decision record + independent review |

## Provisional candidate identifiers

| ID | Artifact |
|---|---|
| `WXE-CANDIDATE-1` | Package |
| `PD-WXE-CANDIDATE-1` | Product Definition candidate |
| `XD-WXE-CANDIDATE-1` | Experience Definition candidate |
| `ARCH-WXE-FIT-CANDIDATE-1` | Architecture Fit candidate |
| `DR-WXE-CANDIDATE-1` | Design Readiness candidate |
| `QT-WXE-CANDIDATE-1` | Quality / Test Plan candidate |
| `MI-WXE-CANDIDATE-1` | Measurement / Instrumentation candidate |
| `IP-WXE-CANDIDATE-1` | Implementation tranche proposal |
| `WXE-P0-CORRECTIVE-1` | Separate P0 corrective plan (may ship ahead of redesign) |

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

| Direction | Status in candidate |
|---|---|
| Workforce & Administration are **desktop first** | Bound; primary viewports 1366×768, 1440×900, 1920×1080 |
| Laptop productivity over mobile-first composition | Bound; retain basic responsive + a11y; no mobile feature parity for authoring |
| Task-first IA with seven presentation groups | Proposed presentation only — not new domain authorities |
| Primary labels Delivery / Takeaway and Now / Schedule | **Founder future presentation**; not claimed as LANG-1-mandated or already shipped |
| Retain internal `DELIVERY` / `PICKUP`, `ASAP` / `SCHEDULED` | Bound |
| Reuse existing enterprise components | Bound |
| Operations is foundation for potential future POS — not full POS today | Bound; POS ownership remains `PRODUCT_DECISION_REQUIRED` |
| Independent audit amendments A/B/C | Incorporated in inventory, terminology, and POS boundary docs |

## Workspace publication note

Primary development checkout `/home/ajoshi/repos/boba-bear-platform` remains occupied by UOE
PR #424 work. This package (including `WXE-PD-XD-REFINEMENT-R2`) is authored and published from
the **already-existing** clean alternate checkout (`boba-bear-pr413-main-update`) of remote
`nivedhya11/BobaBear` on branch `docs/wxe-pd2-candidate` / PR #426, without creating a new
clone/worktree and without modifying protected parallel work (UOE #424, corrective #427).
Canonical path preference remains `/home/ajoshi/repos/boba-bear-platform` when unoccupied.

Historical gate-readiness reviews at HEAD `3c2e0643…` returned `RECOMMENDED_STOP` /
`REQUIRES_BOUNDED_CANDIDATE_REFINEMENT` and are preserved as evidence in
[`15-gate-disposition-founder-decision-record.md`](./15-gate-disposition-founder-decision-record.md).
