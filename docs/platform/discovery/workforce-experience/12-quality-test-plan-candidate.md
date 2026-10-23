<!-- AUTHORITY: NON_AUTHORITATIVE_DISCOVERY_DRAFT | PACKAGE: WXE-CANDIDATE-1 -->

# Quality / Test Plan candidate

```text
QT_ID = QT-WXE-CANDIDATE-1
QUALITY_TEST_PLAN = REVIEWABLE_DRAFT
POLICY = TEST-1
```

## Proof strategy

| Layer | Use for |
|---|---|
| Unit / component source tests | Destination entry unions; delivery default emptiness; section order invariants |
| Integration | Portal session → resolveAuthorizedDestinations; admin shell entry |
| Component DOM tests | Dual H1 absence; lifecycle action placement; consequence dialogs |
| Playwright (workforce/admin) | GJ-W1–W8 smoke on desktop viewport; commercial-only fixture; **add** targeted X3 proofs for GJ-W6/W7/W9/W11–W14 (AS-16…22) when those stories are implementation-authorized — not claimed covered today |
| Accessibility checks | axe or equivalent; explicitly cover WCAG 2.2 **2.4.11** (focus not obscured), **2.5.8** (target size), **2.5.7** (dragging alternatives for menu reorder) on shells + order detail + commercial |
| Regression | Existing operations/admin/commercial suites must stay green |

## Required proofs by finding

| Finding | Proof |
|---|---|
| P0-A (PR #427) | Defaults empty; submit blocked without refs; attestation required; no `track.example.com/uat` in initial state; **does not** prove Gaps 1–3 closed |
| P1-ENTRY / P1-COMM | Capability fixtures for commercial-only / store-without-order.read / operable Commercial landings — **required** under Founder UPD-02 **A**; do not invent `brand.read` |
| P1-A | Testid/section order: lifecycle actions before delivery panel; permission-gated buttons |
| P1-B | Dual H1 / nested main absent on Orders |
| P1-C | Retire section/entry opens consequence review |
| P1-D / P2-D | Review tab copy does not claim in-tab publish |
| P2-* | Title uniqueness; Scheduling nav; narrow timing accessible name |
| Server Gaps 1–3 | Out of WXE UI proof scope; separate Founder/security proofs if UPD-08 authorizes |

## Negative / boundary

- Unauthorized deep links → AccessDenied
- PICKUP order → no delivery panel
- Direct link with stale `outletId` → existing stale alert behaviour retained
- No navigation to unimplemented destinations

## Non-goals

- Full POS test suite
- Customer UOE proofs (PR #424)
- Payment capture provider proofs beyond refund UI already covered

## Evidence gaps (current)

| Gap | Notes |
|---|---|
| No dedicated commercial-only role in catalog | Tests must use capability fixtures |
| Delivery panel tests today assert source strings, not empty defaults | Must extend |
| Admin pages lack breadcrumb tests | Add when breadcrumbs implemented |
| Founder UAT | NOT_PERFORMED |

## Exit criteria (for a future authorized slice)

- Exact-head CI green
- P0 proofs mandatory before claiming operator-safety fix
- Desktop viewport screenshots or Playwright at 1366×768 for IA slice
- No silent retries presented as proof
