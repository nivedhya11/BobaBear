<!--
  AUTHORITY: NON_AUTHORITATIVE_DISCOVERY_DRAFT
  PACKAGE: WXE-CANDIDATE-1
  FIT_GRANT: NOT_GRANTED
  LOCK_GRANT: NOT_GRANTED
  IMPLEMENTATION_AUTHORIZED: NO
  APPLICATION_CODE_MUTATION: NO
-->

# Founder Architecture Fit decision packet

```text
PACKET_ID = WXE-FOUNDER-FIT-PACKET-1
TASK = BOBA-B2-WXE-ARCH-FIT-CLOSURE-20261025
DEPENDS_ON = PR #426 (docs/wxe-pd2-candidate @ 9918389638abd9833152dcfb35971644d7650f14)
SOURCE_MAIN = a6155378b799e06a95b28c593ac1a340d7ca9245
STACKED_ON = #426
MERGES_426 = NO
MERGES_TO_MAIN = NO
ARCHITECTURE_FIT = NOT_GRANTED
ARCHITECTURE_LOCK = NOT_GRANTED
FORMAL_NEW_PD_XD_GATE_PASS = NOT_GRANTED
IMPLEMENTATION_AUTHORIZED = NO
FORMAL_IMP_IDENTITY = NOT_ALLOCATED
GATE_RESULT = READY_FOR_FOUNDER_FIT_REVIEW
```

This packet asks for a Founder decision. It does not record one. Source evidence is annex 23.
Prepared dispositions are doc 18. Option R remains the ratified amendment in docs 16 and 17.

## 1. Decisions preserved

| Decision | Record | This packet |
|---|---|---|
| Product Definition Gate PASS | Doc 15 §H, historical head `560048ffc4d7e1fea410ebfcb9bc1d554cbeaf89` | Preserved. Not re-dated. |
| Experience Gate PASS | Doc 15 §H, same historical head | Preserved for the scope reviewed then. |
| UPD-02 = A | Doc 15 | Preserved. |
| UPD-03 = B | Doc 15 | Preserved. `outlet.read` entry stays. |
| UPD-06 = YES | Doc 15 | Preserved. Scheduling discoverability only. |
| UPD-07 = FOLLOW_UP | Doc 15 | Preserved. Commercial section URLs stay follow-up. |
| UPD-09 | UOE UX-A owns the shared label map | Preserved. Exact contract in §4 F-6. |
| Option R | Doc 17 ratification of doc 16 | Preserved. Hide, not an outlet-scoped Commercial editor. |
| New formal Gate PASS from that ratification | `FORMAL_NEW_PD_XD_GATE_PASS = NOT_GRANTED` | Preserved. |

Lifecycle on `origin/main` at the SHA above remains: accepted through IMP-036I, current slice
IMP-036J pending acceptance, next slice IMP-036K. This packet does not move those fields.

## 2. Question A — Experience Gate coverage

PD-2 says an X2/X3 Architecture Fit must not finally PASS without an Experience Gate PASS.
This capability is rated X3 at the package boundary. Doc 16 records
`POST_PASS_AMENDMENT_NOT_COVERED_BY_HISTORICAL_PASS = YES`. Option R ratification did not
grant a new Gate PASS.

```text
DECISION_REQUIRED
question: Does the historical Experience Gate PASS plus the recorded Option R ratification satisfy the Experience Gate prerequisite for a presentation Architecture Fit PASS, or is a new Experience Gate PASS required before that Fit can be recorded?
why_current_authority_is_insufficient: PD-2 requires an Experience Gate PASS before a final X2/X3 Fit PASS. The WXE package itself says the Option R amendment is not covered by the historical PASS. An agent must not choose that process fact.
option_a: Founder states that the historical Experience Gate PASS plus the recorded Option R ratification is the Experience Gate coverage for the amended presentation scope, and only then may a presentation Fit PASS be recorded.
option_b: Founder requires a new Experience Gate PASS on the amended scope before any Architecture Fit PASS. Prepared F-1..F-7 text stays a candidate.
cursor_recommendation: Do not record Fit PASS in this packet. The package’s own flag says the amendment is not covered by the historical PASS, and PD-2 will not let an agent treat ratification as that PASS. Recommended selection is option B until the Founder writes a coverage statement. Option A remains available as that explicit statement. This recommendation is not a Founder decision.
decision_owner: Human Founder
blocked_scope: Architecture Fit PASS, Architecture Lock, Design Readiness PASS, Quality and Measurement finalization, Implementation Authorization
```

## 3. Question B — Accept F-1..F-7 together

The seven items are one presentation set. Accepting a paired item while rejecting its pair
reopens Option R. Recommended selection, after Question A is answered so that a Fit PASS is
allowed: **accept F-1..F-7 together** on the source bindings below. This packet does not
accept them.

| ID | Recommended selection | Source binding the selection depends on |
|---|---|---|
| F-1 | ACCEPT the static predicate on the existing union payload: a commercial read **and** `brand.read`. | `hasCommercialRead` today omits `brand.read`, so `outlet_manager` sees Commercial. `getAdminSession` has no active-scope field. Do not grant `brand.read`. Do not build an outlet-scoped editor. Per-scope nav (S9) is not part of this acceptance. |
| F-2 | ACCEPT leaving `ADMINISTRATION_ENTRY_PERMISSIONS` unchanged. Commercial reads must not be added as a sole reason to show the Administration card. | They are not in the entry list today. Entry is not the same as reaching a page. Do not invent a permission for the System item. |
| F-3 | ACCEPT keeping `outlet.read` as an Administration entry for Kitchen/Delivery-like operators. | `kitchen_operator` and `delivery_coordinator` both have `outlet.read`. Hiding Commercial does not remove it. |
| F-4 | ACCEPT the hub rule in doc 18 §2. | Card when `order.read` or any `STORE_COARSE_NAV_PERMISSIONS` key. Href is Today only with `order.read`; otherwise Store. Delivery’s in-workspace item stays `delivery.read` only. `delivery.read` alone does not show the card. A store-only principal must not be given the Today href. |
| F-5 | ACCEPT a Store Management Scheduling item that reuses `StoreSchedulingProfileClient` and the existing scheduling-profile route. | The client already renders on the Hours page. Get/set already require `outlet.operating_schedule.read` / `.manage`. No new service, API, permission, or order state. |
| F-6 | ACCEPT UOE PR #424 `UOE-TRANCHE-UX-A-1` as the only shared Delivery/Takeaway and Now/Schedule map, including the three collection verbs in that product definition. | The map file is proposed and not created. UX-A implementation is not authorized. T1 does not wait on it. T2 final wording does. |
| F-7 | ACCEPT WXE-PF-01..12 and actors S1–S9 as the future test oracle, with the limits in annex 23 §8. | Fixtures are in-memory maps. WXE-PF-10 is not an execution row. WXE-PF-12 does not require a scoped session API. |

Rejecting F-1 or replacing it with an outlet-scoped Commercial editor reopens the rejected
Option R alternative. That alternative stays rejected.

## 4. Question C — What a Fit acceptance would still leave open

| Later gate | Required before | Not done by accepting F-1..F-7 |
|---|---|---|
| Architecture Lock | Any journey, and specifically the X3 delivery-proof and cancellation journeys | Lock stays NOT_GRANTED. UPD-08 blocks those journeys until a separate security disposition. |
| Design Readiness | Implementation of T1 chrome, AS-26 static escalation wording against LANG-1, AS-27 recovery layout, Scheduling item placement | Doc 11 stays a candidate. |
| Quality / Test Plan finalization | Implementation authorization | Rows in annex 23 §8 are PLANNED. None are executed here. |
| Measurement finalization | T1 authorization, because the package is X3 at the boundary | Doc 13 stays a draft. T1’s candidate signals are hub empty-state rate and AS-27 recovery on the Commercial URL. No new analytics authority. |
| Implementation authorization and IMP identity | Any application edit | UPD-01 stays NOT_ALLOCATED. IMP-036J, IMP-032, Commerce, Payment, and UOE ownership stay where they are. |

## 5. Question D — UPD-08 stays outside this Fit

| Gap | In this Fit package? |
|---|---|
| 1. Arbitrary non-empty proof reference | No. Separate security decision. |
| 2. Cancellation-path automatic inactivity attestation | No. Separate security decision. |
| 3. URL `orderId` versus body `deliveryId` | No. Separate security decision. |
| PR #427 UI corrective | No. Not server remediation. Not merged. Not a risk acceptance. |

A presentation Fit PASS, if the Founder later records one, must say that these three gaps
remain outside it.

## 6. T1–T4 engineering readiness

All four are PLANNED. None are authorized. Conditions shared by all four: Question A answered
so Fit may pass, F-1..F-7 accepted, Design Readiness PASS for the tranche’s surfaces, Quality
plan finalized for its rows, Measurement plan finalized before an X3 implementation
authorization, and an explicit implementation authorization that names an IMP or states that
the work stays unallocated. This packet supplies none of those.

### T1 — Information architecture, entry, chrome, Scheduling, Commercial presentation

| Field | Content |
|---|---|
| Outcome | One desktop section nav; Administration and Operations land on a usable page; Brand Commercial shows only when the F-1 predicate is true; Scheduling is discoverable. |
| Scope | Hub destination href, Administration Commercial item, AS-27 recovery, breadcrumbs and one H1, Store Scheduling item, no cross-link from hidden Commercial. |
| Source surface | `src/lib/workforce-hub/destinations.ts`; `AdministrationAppShell.tsx`; `CommercialWorkspaceClient.tsx` and the commercial page; `WorkforceAppShell.tsx`; `SideNavigation.tsx`; `PageHeader.tsx`; `Breadcrumbs.tsx`; `OperationsWorkspaceNav.tsx`; `store-navigation.ts`; Hours page host of `StoreSchedulingProfileClient.tsx`. |
| Contract | Option R, UPD-02 A, UPD-03 B, UPD-06 YES, F-1..F-5, F-7 rows other than WXE-PF-08 and WXE-PF-10. Pending: Question A and Fit acceptance. |
| Tests / journeys | WXE-PF-01, 02, 03, 04, 05, 06, 07, 09, 11, 12; T1-H1, T1-BC, T1-NAV. Narratives GJ-W1, GJ-W4, GJ-W8. |
| Dependencies | None on UOE merge. None on PR #427. |
| Security invariants | Server authorization stays authoritative. No new permission or API. `outlet.read` entry stays. Store Assortment is not Brand Commercial. Scheduling route permissions stay `outlet.operating_schedule.read` / `.manage`. |
| Exclusions | Daily action order, UOE verbs, Commercial review copy, People framing, UPD-08, UPD-07 deep links, POS, new order states. |
| Independent review | Permission and tenancy review of the hub href and the Commercial predicate before merge of a future implementation PR. |
| Before authorization | Question A, Fit acceptance, T1 Design Readiness, T1 Quality finalization, Measurement finalization, implementation authorization. |

### T2 — Daily Operations UI and shared-label consumption

| Field | Content |
|---|---|
| Outcome | Lifecycle actions sit above secondary panels and render only when the server-reported capability is present. `PICKUP` does not show a Delivery execution panel. Method and timing words come from the UOE map. |
| Scope | Order detail action order and capability gating; Delivery panel mode; timing accessible name; enterprise tokens on those surfaces. |
| Source surface | `OperationsOrderDetailClient.tsx`; `OperationsOrderListClient.tsx`; `OperationsTodayClient.tsx`; `OperationsDeliveryWorkspaceClient.tsx` and the Delivery panel component. |
| Contract | ARCH-G28 and ARCH-G29. F-6 consumption. Pending: T1 gate, and UX-A implementation approval before final words. |
| Tests / journeys | T2-P1A-ORDER, T2-P1A-GATE, T2-PICKUP, T2-DELIVERY, T2-PF-08, T2-PF-08-HOLD, T2-TIME-NAME, T2-PF-09, T2-DESKTOP. Narratives GJ-W2, GJ-W3. |
| Dependencies | T1 landing and chrome. UOE `UOE-TRANCHE-UX-A-1` before verb assertions. |
| Security invariants | Hidden buttons are not a new permission. Step-up on refund stays. Proof, attestation, and identity binding stay on the server and are not “fixed” by hiding a control. |
| Exclusions | UPD-08, refund calculation, payment authority, a second verb list, new order states, T1 predicates. |
| Independent review | Confirm capability gating reads the existing server flag and that `PICKUP` cannot submit a delivery command from a hidden panel. |
| Before authorization | T1 human gate plus T2 Design/Quality and, for final words, an approved UX-A implementation contract. |

### T3 — Commercial operator usability

| Field | Content |
|---|---|
| Outcome | Review does not claim in-tab publish. Menu section and entry retire ask for consequence confirmation. Draft and live are visually distinct. UAT can start from a brand-operable landing. |
| Scope | Inspection label, consequence dialog over existing menu commands, status presentation on existing editors. |
| Source surface | `CommercialInspectionPanel.tsx`; `MenuEditor.tsx`; `CommercialWorkspaceClient.tsx` section chrome; sibling editors under `src/components/administration/commercial/` for status presentation only. |
| Contract | Option R brand-scoped workspace. ADR-006. IMP-036F/J editors stay the authority. Pending: T1 predicate already landing so UAT does not open a broken brand list. |
| Tests / journeys | T3-REVIEW-LABEL, T3-P1C-OPEN, T3-P1C-CANCEL, T3-DRAFT-LIVE, T3-GJ-W8, T3-S2-ABSENT, T3-PF-09, T3-UAT-SLOT, T3-376-381. Narratives GJ-W6, GJ-W8. |
| Dependencies | T1 Commercial entry. IMP-036J remains the owner of coupon setup (#376) and promotion-create failure (#381). |
| Security invariants | Confirm still calls the existing command. No new commercial permission. A 403 after the T1 predicate is an API conflict to report, not a client grant of `brand.read`. Customer payable truth stays server-authored. |
| Exclusions | Show/hide predicate, outlet-scoped editor, #385 money presentation, UPD-07 deep links, UPD-08, IMP-036J acceptance. |
| Independent review | Commercial command review: the dialog must not add a lifecycle or publish from Review. |
| Before authorization | T1 gate, T3 Design Readiness for the dialog and draft/live treatment, Quality finalization. Founder UAT of IMP-036J stays a separate human gate. |

### T4 — People, accessibility, desktop quality

| Field | Content |
|---|---|
| Outcome | Effective Permissions reads as a diagnosis. Membership and team screens remain the mutators. Persistent nav and primary actions meet the named WCAG 2.2 checks on the desktop viewports. |
| Scope | Access, membership, and store team copy and framing; focus not obscured; non-drag menu reorder; target size; People confirm dialogs. |
| Source surface | `AdministrationAccessClient.tsx`; `AdministrationMembershipsClient.tsx`; `AdministrationMembershipDetailClient.tsx`; `StoreTeamMembersClient.tsx`; `StoreTeamAccessClient.tsx`; shells and nav already in T1; menu reorder inside `MenuEditor.tsx` after T3. |
| Contract | Doc 01 amendment A. WCAG 2.2 criteria 2.4.11, 2.5.7, and 2.5.8 as the Quality candidate’s bar. Pending: Measurement finalization before any event hook. |
| Tests / journeys | T4-DIAG, T4-MUTATOR, T4-STEPUP, T4-A11Y-FOCUS, T4-A11Y-TARGET, T4-A11Y-DRAG, T4-PF-09, T4-P2G, T4-MI, T4-UAT-SLOT. Narratives GJ-W7, GJ-W12, GJ-W14. |
| Dependencies | T2 and T3 implementation gates for shared dialogs and menu reorder. Local accessibility fixes that belong to a T1–T3 control ship with that control. |
| Security invariants | Server grant, revoke, and step-up stay the authority. Synthetic actors are not seeded. Events, if a Measurement plan is finalized, carry no phone, raw address, or full evidence reference. Audit remains the access record. |
| Exclusions | New roles or permissions, MFA and password routes, UOE verbs, UPD-08, POS. |
| Independent review | Access-control review that copy changes do not move a mutation onto the diagnostic page. Accessibility review of 2.4.11, 2.5.7, and 2.5.8 on 1366×768. |
| Before authorization | T2 and T3 gates, T4 Design/Quality, and Measurement finalization before instrumentation. |

## 7. Recommended selections, in one place

1. Question A: record option B unless the Founder explicitly writes the option A coverage statement. Do not treat Option R ratification as that statement.
2. Question B: if and when Question A allows a Fit PASS, accept F-1..F-7 together under §3.
3. Question C: leave Lock, Design, Quality, Measurement, and implementation unauthorized.
4. Question D: leave UPD-08 Gaps 1–3 and PR #427 outside the presentation Fit.

No row above is a granted decision.

## 8. Non-grants

```text
ARCHITECTURE_FIT = NOT_GRANTED
ARCHITECTURE_LOCK = NOT_GRANTED
PRODUCT_DEFINITION_GATE_REVISION = NOT_GRANTED
EXPERIENCE_GATE_REVISION = NOT_GRANTED
IMPLEMENTATION_AUTHORIZED = NO
APPLICATION_SOURCE_EDITED = NO
PR_426_MERGE = NO
PR_427_MERGE = NO
PR_424_EDIT = NO
DEPLOYMENT = NO
```
