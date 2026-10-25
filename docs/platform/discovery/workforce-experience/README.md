<!--
  AUTHORITY: NON_AUTHORITATIVE_DISCOVERY_DRAFT
  PACKAGE: WXE-CANDIDATE-1
  STATUS: FOUNDER_PD_XD_GATES_PASS_RECORDED
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
REVIEWED_CONTRACT_HEAD = 560048ffc4d7e1fea410ebfcb9bc1d554cbeaf89
EXPERIENCE_CRITICALITY = X3 (capability rated at highest boundary; X2 workflows remain inside)
CHANGE_RISK = CR2 (capability rated at highest boundary: refund / access-mutation / commercial publish-effect / delivery-proof)
FOUNDER_EXPERIENCE_DIRECTION = ACCEPTED (desktop-first Workforce & Administration)
PRODUCT_DEFINITION_GATE = PASS (historical @ 560048ffc…)
EXPERIENCE_GATE = PASS (historical @ 560048ffc…)
PRODUCT_DEFINITION_AMENDMENT = WXE-P1-COMM_OPTION_R — RATIFIED_RECORDED (doc 17)
EXPERIENCE_AMENDMENT = WXE-P1-COMM_OPTION_R — RATIFIED_RECORDED (doc 17)
OPTION_R_FOUNDER_RATIFICATION = RECORDED (W2 2026-10-24; not a new Gate PASS)
FORMAL_NEW_PD_XD_GATE_PASS = NOT_GRANTED
AMENDED_EXPERIENCE_GATE_CANDIDATE = 25-amended-experience-gate-candidate.md
AMENDED_EXPERIENCE_GATE = NOT_DECIDED
WXE_UPD_02 = A
WXE_P1_COMM = OPTION_R
WXE_UPD_03 = B
WXE_UPD_06 = YES
ARCHITECTURE_FIT = CANDIDATE_ONLY (NOT_GRANTED)
FORMAL_ARCHITECTURE_FIT_OR_LOCK = NOT_GRANTED
SOURCE_CONFORMANCE_ANNEX = 23-source-conformance-annex.md
FOUNDER_FIT_DECISION_PACKET = 24-founder-architecture-fit-decision-packet.md
FIT_CLOSURE_DEPENDS_ON_PR = 426
FIT_CLOSURE_DOES_NOT_MERGE_426 = YES
DESIGN_READINESS = CANDIDATE_ONLY (NOT_GRANTED)
QUALITY_TEST_PLAN = REVIEWABLE_DRAFT (NOT_FINALIZED)
MEASUREMENT_PLAN = REVIEWABLE_DRAFT (NOT_FINALIZED)
IMPLEMENTATION_AUTHORIZED = NO
PRE_GTM_EXPERIENCE_AUDIT = NOT_PERFORMED
```

<!-- CI_HEAD_NOTE: inventory refresh on package path set -->

This package converts the completed Workforce-wide UX audit, independent amendments, and
Founder-approved **desktop-first** design direction into one coherent PD-2 candidate for
Founder milestone review. It covers **all implemented** Workforce Hub, Operations, Store, and
Administration surfaces discovered on `BASE_MAIN_SHA`.

Founder Product Definition Gate **PASS** and Experience Gate **PASS** are recorded
(2026-10-24 Asia/Kolkata; reviewed contract HEAD `560048ffc…`) as **two separate** Founder
decisions. See [`15-gate-disposition-founder-decision-record.md`](./15-gate-disposition-founder-decision-record.md).
Those PASSes approve **specification completeness** only at that historical HEAD.

**OPTION_R amendment:** Founder-approved `WXE-P1-COMM = OPTION_R` is reconciled in
[`16-option-r-p1-comm-amendment-and-proof-matrix.md`](./16-option-r-p1-comm-amendment-and-proof-matrix.md)
and related Product/Experience/Fit candidates. Founder **ratification is recorded** (W2,
2026-10-24 Asia/Kolkata) in
[`17-option-r-founder-ratification-record-and-fit-decision-package.md`](./17-option-r-founder-ratification-record-and-fit-decision-package.md),
together with a focused independent review and a Founder-ready Architecture Fit decision
package for the permitted presentation scope. Ratification is a bounded post-PASS scope
amendment — **not** a new PD/XD Gate PASS. `FORMAL_ARCHITECTURE_FIT_OR_LOCK = NOT_GRANTED`.
UPD-08 Delivery Gaps 1–3 remain unresolved, separately governed, and block Architecture Lock
for affected X3 delivery-proof/cancellation journeys.

Source conformance for the prepared F-1..F-7 set is
[`23-source-conformance-annex.md`](./23-source-conformance-annex.md). The integrated Founder
decision request is
[`24-founder-architecture-fit-decision-packet.md`](./24-founder-architecture-fit-decision-packet.md).
Both are stacked on PR #426. Neither grants Architecture Fit or Architecture Lock.
The amended Experience Gate candidate is
[`25-amended-experience-gate-candidate.md`](./25-amended-experience-gate-candidate.md).
Its verdict is `NOT_DECIDED`. It does not replace the historical Experience Gate PASS and it
does not grant Architecture Fit or Architecture Lock.

This package still does **not**:

- allocate or activate a future IMP
- mutate ROADMAP, STATE, the decision register, D-377, or accepted Product Definitions
- authorize implementation, merge, deploy, staging, runtime, DB, or payment operations
- grant Architecture Fit, Design Readiness, Quality/Measurement finalization, or Implementation Authorization
- invent new permissions, APIs, or a second Commercial / scheduling authority
- implement the redesign in application source
- overwrite the separate customer Unified Order Experience package (PR #424)

Historical agent `RECOMMENDED_PASS` is preserved as independent-review evidence. Formal Gate PASS
is Founder-only and is recorded for the historical Product and Experience Gates only; the OPTION_R
ratification is a scope amendment record, not an additional Gate PASS.

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
| [`16-option-r-p1-comm-amendment-and-proof-matrix.md`](./16-option-r-p1-comm-amendment-and-proof-matrix.md) | OPTION_R P1-COMM amendment + role/API proof matrix (ratified text) |
| [`17-option-r-founder-ratification-record-and-fit-decision-package.md`](./17-option-r-founder-ratification-record-and-fit-decision-package.md) | OPTION_R Founder ratification record + W2 focused review + Architecture Fit decision package (Fit/Lock NOT_GRANTED) |
| [`18-consolidated-architecture-fit-decision-package.md`](./18-consolidated-architecture-fit-decision-package.md) | Consolidated F-1..F-7 Fit dispositions (prepared, not granted). Preserves Option R. |
| [`19-t1-fit-design-quality-and-ia-work-package.md`](./19-t1-fit-design-quality-and-ia-work-package.md) | T1 Fit and Design/Quality decision set plus IA/chrome/Scheduling/Commercial presentation package (PLANNED) |
| [`20-t2-daily-operations-ui-work-package.md`](./20-t2-daily-operations-ui-work-package.md) | T2 daily Operations UI package (PLANNED) |
| [`21-t3-commercial-uat-ux-work-package.md`](./21-t3-commercial-uat-ux-work-package.md) | T3 Commercial UAT UX package (PLANNED) |
| [`22-t4-people-accessibility-work-package.md`](./22-t4-people-accessibility-work-package.md) | T4 People and accessibility package (PLANNED) |
| [`23-source-conformance-annex.md`](./23-source-conformance-annex.md) | Source-conformance annex for F-1..F-7 against `origin/main` (evidence, not a Fit grant) |
| [`24-founder-architecture-fit-decision-packet.md`](./24-founder-architecture-fit-decision-packet.md) | Integrated Founder Architecture Fit decision packet (NOT_GRANTED) |
| [`25-amended-experience-gate-candidate.md`](./25-amended-experience-gate-candidate.md) | Amended Experience Gate candidate for the Option R presentation scope (`NOT_DECIDED`; Fit stays blocked) |

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
