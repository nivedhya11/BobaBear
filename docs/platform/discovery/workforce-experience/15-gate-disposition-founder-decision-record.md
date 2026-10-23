<!-- AUTHORITY: NON_AUTHORITATIVE_DISCOVERY_DRAFT | PACKAGE: WXE-CANDIDATE-1 -->

# Gate disposition and Founder decision record

```text
RECORD_ID = WXE-FDR-CANDIDATE-1
PACKAGE = WXE-CANDIDATE-1
```

## A. Product direction reconciliation

| Direction | Disposition |
|---|---|
| Desktop-first Workforce & Administration | Bound in PD/XD/DS; ratify on PR (`ACCEPTED_IN_CONVERSATION`) |
| Viewports 1366 / 1440 / 1920 | Bound; not a kitchen display system |
| Task-based seven-section IA | Proposed presentation; not domain split |
| Delivery / Takeaway / Now / Schedule | Founder presentation; **UOE UX-A owns shared label map**; WXE consumes |
| Reuse enterprise components | Bound |
| Independent amendments A/B/C | Bound |
| P0 separate corrective | **P0-A only** under Controlled Exception; former P0-B downgraded |

## B. PD-2 gate matrix (actual status — never invent PASS)

| Gate | Status |
|---|---|
| Founder Experience Direction | **ACCEPTED_IN_CONVERSATION** (ratify on this PR) |
| Product Definition Gate | **NOT_PERFORMED** |
| Experience Gate | **NOT_PERFORMED** |
| Architecture Fit | **CANDIDATE_ONLY** (IMP-032 proof-policy tension escalated) |
| Design Readiness | **CANDIDATE_ONLY** |
| Quality / Test Plan | **REVIEWABLE_DRAFT** |
| Measurement Plan | **REVIEWABLE_DRAFT** |
| Implementation Authorization | **NOT_GRANTED** |
| Future IMP identity | **NOT_ALLOCATED** |
| Founder UAT | **NOT_PERFORMED** |
| ROADMAP / STATE mutation | **NOT_PERFORMED** |

## C. Remaining Founder decisions

| ID | Decision needed | Candidate recommendation |
|---|---|---|
| WXE-UPD-01 | Formal IMP / sequencing for full redesign | After P0-A + package review |
| WXE-UPD-02 | Admin entry + commercial keys; Ops landing resolution | Accept nav-doc recommendation (P1, not T0) |
| WXE-UPD-03 | Kitchen/Delivery Administration entry via `outlet.read` | Decide vs `role-destination-safety` test invariant |
| WXE-UPD-04 | Future POS scope | Keep `PRODUCT_DECISION_REQUIRED` |
| WXE-UPD-05 | Authorize `WXE-P0-CORRECTIVE-1` (P0-A) | **Yes**, under Controlled Exception |
| WXE-UPD-06 | Scheduling first-class nav | Yes |
| WXE-UPD-07 | Commercial deep-linking V1 | Optional follow-up |
| WXE-UPD-08 | Server-side IMP-032 proof policy harden | Escalate; not silent in UI hotfix |
| WXE-UPD-09 | UOE vs WXE label ownership | Confirm UOE UX-A owns shared map |

## D. Independent review record

```text
REVIEWER = Independent high-reasoning agent
REVIEW_TARGET = WXE-CANDIDATE-1
STATUS = INCORPORATED
```

| Finding theme | Severity | Disposition |
|---|---|---|
| Widen P0-A (prefills, one-click fail/cancel, Takeaway in Delivery workspace, pagination honesty) | MAJOR | **FIX_IN_PACKAGE** — done in findings/P0 plan |
| Downgrade P0-B (not built-in-reachable) | MAJOR | **FIX_IN_PACKAGE** — now P1-ENTRY / P2-ENTRY |
| Ops landing must not be Today without `order.read` | MAJOR | **FIX_IN_PACKAGE** — nav doc |
| Permission-blind lifecycle buttons | MAJOR | **FIX_IN_PACKAGE** — P1-A precondition |
| UOE owns workforce order-type labels | MAJOR | **FIX_IN_PACKAGE** — terminology + T2 |
| PD-2 Gate fields incomplete | MAJOR | **FIX_IN_PACKAGE** — PD rewritten |
| T0 Controlled Exception missing | MAJOR | **FIX_IN_PACKAGE** + **ESCALATE_FOUNDER** |
| IMP-032 proof vs server parsers | MAJOR | **ESCALATE_FOUNDER** — Fit conflict note |
| Dual H1/nested main on Orders | MAJOR | **FIX_IN_PACKAGE** — P1-B |
| P1-COMM outlet_manager Commercial | MAJOR | **FIX_IN_PACKAGE** |
| Factual errors 1–11 | mixed | **FIX_IN_PACKAGE** — inventory/breadcrumbs/P1-C rationale |
| POS “prepare/READY” implication | MINOR | **FIX_IN_PACKAGE** |
| Duplicate clone publication path | process | **ACCEPT_AS_KNOWN** with workspace note; existing checkout reused (not newly created) |
| Missing journeys (fail/recover, offboarding, etc.) | MAJOR | **FIX_IN_PACKAGE** |

Same-scope candidate defects resolved in documentation. No application code changed.

## E. Explicit non-mutations

This package and its PR must not:

- Change application runtime behaviour
- Edit ROADMAP.md, STATE.md, decision-register.md, D-377
- Allocate/activate IMP identity
- Merge or deploy
- Modify UOE discovery package / PR #424
- Edit GitHub issues #376/#378/#380/#381 bodies

## F. Recommended Founder milestone motion

1. Review this PR (`WXE-CANDIDATE-1`)
2. Ratify desktop-first direction on the PR
3. Authorize **WXE-P0-CORRECTIVE-1** (P0-A) under Controlled Exception; decide WXE-UPD-08 separately
4. Confirm UOE UX-A label ownership (WXE-UPD-09)
5. Schedule Product/Experience Gates; keep UOE PR #424 separate
6. Documentation merge ≠ implementation authorization

## G. Alignment snapshot (authoring agent)

```text
Repository Authority: VERIFIED remote nivedhya11/BobaBear @ 4cc24d1a4
Publication checkout: existing alternate clean checkout (primary occupied by UOE #424)
Vision Version: VISION-1
Roadmap Version: GTM-R190
State Version: STATE-R189
Architecture Version: ARCH-R23
Decision Register Version: DR-25
Product Delivery Version: PD-2
Product Definition: PD-WXE-CANDIDATE-1 (candidate)
Experience Definition: XD-WXE-CANDIDATE-1 (candidate)
Testing Policy: TEST-1
Accepted Through: IMP-036I
Current Product Slice: IMP-036J (pendingAcceptance)
Task Slice: WXE-CANDIDATE-1 documentation only
Risk Level: R2
DELIVERY_MODE: PUBLISH_PR
APPLICATION_CODE_MUTATION: NO
Gate Result (alignment for docs authoring): PASS
PROMPT DEVIATIONS: NONE
```
