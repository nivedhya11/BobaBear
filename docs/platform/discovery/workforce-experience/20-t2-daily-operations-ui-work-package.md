<!--
  AUTHORITY: NON_AUTHORITATIVE_DISCOVERY_DRAFT
  PACKAGE: WXE-CANDIDATE-1
  TRANCHE: T2
  PACKAGE_STATUS: PLANNED
  IMPLEMENTATION: NOT_STARTED
-->

# T2 — Daily Operations UI work package

```text
WORK_PACKAGE_ID = WXE-T2-WP-1
TRANCHE = T2
PACKAGE_STATUS = PLANNED
IMPLEMENTATION = NOT_STARTED
IMPLEMENTATION_AUTHORIZED = NO
DEPENDS_ON = T1 human gate and T1 landing/chrome (doc 19); UOE UX-A contract approval before final verb assertions (F-6)
OPTION_R = PRESERVED
UPD_08 = NOT_IN_SCOPE
LABEL_OWNER = UOE UX-A (PR #424 @ 3b207b3bb69f305353770315af7ad814a7e766d0)
CONTRACT = UOE-TRANCHE-UX-A-1 in docs/platform/discovery/unified-order-experience/17-ux-a-tranche-contract.md
MAP_FILE = src/shared/ordering/uoe-presentation-labels.ts — PROPOSED_NOT_CREATED
VERBS = UOE PD-UOE-CANDIDATE-3 §3.A — Prepare for collection; Ready for collection; Hand over order
WXE_CONSUMES = YES
T1_BLOCKED_ON_THIS_MAP = NO
```

T2 is the daily Operations presentation that sits on the T1 chrome: capability-gated lifecycle
actions, mode-sensitive panel order, narrow timing names, and enterprise visual reuse. Shared
Delivery/Takeaway and Now/Schedule words come from UOE UX-A. This package does not implement them.

## 1. Scope (when a later authorization exists)

- On order detail, place lifecycle actions (Accept, Fulfil, Cancel) before delivery, refund,
  notification, and item panels (P1-A; doc 01 route 5).
- Render each lifecycle button only when the server-reported capability for that command is
  present. Status-only visibility is the defect. Server command authorization stays as it is.
- Hide the Delivery panel for `PICKUP` orders. Takeaway hand-over stays on order detail
  (GJ-W3, AS-05).
- Apply the approved UOE UX-A label map to workforce order chrome and timing cues. Internal
  values stay `DELIVERY` / `PICKUP` and `ASAP` / `SCHEDULED`.
- Give the narrow timing control an accessible name (doc 12 P2 proof).
- Reskin the daily Operations surfaces with existing enterprise tokens. No new brand theme.

## 2. Non-goals

- T1 information architecture, Administration entry, Brand Commercial hide, and Scheduling nav.
- T3 Commercial editors, review copy, and menu consequence dialogs.
- T4 People framing and the accessibility programme beyond the timing control’s accessible name
  and ordinary keyboard behavior required to ship the action move.
- Changing Order lifecycle, adding READY or other statuses, kitchen tickets, or POS billing
  (ARCH-G29, ADR-003).
- Delivery proof policy, cancel-path auto-attestation, URL `orderId` versus body `deliveryId`
  (UPD-08). PR #427’s UI corrective is a separate branch and is not server remediation.
- Refund calculation, step-up class changes, or payment authority.
- A WXE-owned verb list. If UOE UX-A is not approved, T2 stops at structural placement and does
  not invent interim customer/operator verbs.
- Re-book UI for GJ-W11. Recovery stays on the existing command surface.

## 3. Source boundaries for a future implementer

```text
MAY MODIFY (future, presentation only)
- src/components/operations/OperationsOrderDetailClient.tsx
    Action order and capability checks before rendering Accept / Fulfil / Cancel.
- src/components/operations/OperationsOrderListClient.tsx
    Timing cue presentation only, using the approved UOE map when available.
- src/components/operations/OperationsTodayClient.tsx
    Same timing presentation limit. Do not change the T1 landing rule.
- Delivery panel component used by order detail and
  src/components/operations/OperationsDeliveryWorkspaceClient.tsx
    Mode filter honesty for Takeaway versus Delivery. Do not change proof or attestation
    server contracts. Do not treat PR #427 as the server fix.
- Enterprise token usage on those Operations surfaces
  (src/components/enterprise/enterprise-tokens.ts and existing shell classes).
- Tests adjacent to those components, including a synthetic permission map for button gating.

MUST NOT MODIFY
- Order, Delivery, Refund, and Payment server command modules
- Checkout Snapshot fulfilment mode or timing authority
- Access-control catalogues and session capability computation
- UOE application sources; read the approved UX-A contract and consume it
- src/lib/workforce-hub/destinations.ts (T1 owns entry)
- PR #427 files
- STATE / ROADMAP / ARCHITECTURE / decision-register

EXPLICITLY OUT OF SCOPE
- New order states, KOT, POS
- Second label system
- UPD-08 server Gaps 1–3
- Provider payment or staging data
```

Label consumption rule: the future implementer imports or references the single UX-A map owned by
the UOE package. Duplicating the strings into a WXE dictionary as a second authority fails F-6
even if the words match.

## 4. Invariants

1. Browser visibility is not authorization (ARCH-G11). Hidden buttons are not a new permission.
2. `FULFILMENT_MODE` and `FULFILMENT_TIMING` values are unchanged (ARCH-G28, ARCH-G29).
3. `PICKUP` never opens a Delivery execution panel as if it were a Delivery order.
4. Presentation words for method and timing have one owner: UOE UX-A.
5. “Ready for collection” is presentation, not a kitchen READY state.
6. Step-up on refund and other existing mutations is unchanged.
7. Existing operations and admin suites stay green (doc 12 regression row).

## 5. Test matrix

All rows are **PLANNED**.

| ID | Proves | Fixture | Expected | Must not |
|---|---|---|---|---|
| T2-P1A-ORDER | P1-A placement | Authorized order detail | Lifecycle actions precede delivery, refund, notifications, items | New command |
| T2-P1A-GATE | Capability gating | Session map from `fetchAdminSession` lacking `order.accept` (that key is already on `PORTAL_SESSION_CAPS`; `eligibleActions` today is status-only and is the defect) | Accept control absent even when status is `PLACED` | Treat a hidden button as a server grant; invent a new permission |
| T2-PICKUP | GJ-W3 / AS-05 | `PICKUP` order | Delivery panel absent; hand-over uses UX-A verb once approved | Delivery aggregate; “Mark collected” unless UX-A says so |
| T2-DELIVERY | GJ-W2 surface | `DELIVERY` order | Delivery panel still available to an entitled operator | Claim UPD-08 closed; ship fabricated proof defaults as success |
| T2-PF-08 | F-6 | Approved UX-A map present | Workforce timing and method labels equal that map | A second map in WXE |
| T2-PF-08-HOLD | F-6 sequencing | UX-A contract not approved | Structural tests run; final verb assertions not added | Invent interim verbs |
| T2-TIME-NAME | Narrow timing | Timing control | Accessible name exposed to the accessibility tree | New timing domain value |
| T2-PF-09 | Negative | Denied lifecycle mutation | Server denial unchanged | Broaden RBAC |
| T2-DESKTOP | EXP-1 viewport | 1366×768 order detail | Action order visible without a mobile-only layout | Mobile-first authoring redesign |

WXE-PF-10 remains NOT_IN_SCOPE. Delivery evidence field hygiene stays on the separate PR #427
track and is not re-specified here.
