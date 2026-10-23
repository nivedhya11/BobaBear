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
| Playwright (workforce/admin) | GJ-W1–W8 smoke on desktop viewport; commercial-only fixture |
| Accessibility checks | axe or equivalent; explicitly cover WCAG 2.2 **2.4.11** (focus not obscured), **2.5.8** (target size), **2.5.7** (dragging alternatives for menu reorder) on shells + order detail + commercial |
| Regression | Existing operations/admin/commercial suites must stay green |

## Required proofs by finding

| Finding | Proof |
|---|---|
| P0-A | Defaults empty; submit blocked without refs; attestation required; no `track.example.com/uat` in initial state |
| P1-ENTRY | Capability fixtures for commercial-only / store-without-order.read landings (latent for built-ins) |
| P1-A | Testid/section order: lifecycle actions before delivery panel |
| P1-B | Review tab copy does not claim in-tab publish |
| P1-C | Retire section/entry opens consequence review |
| P2-* | Title uniqueness; Scheduling nav; narrow timing accessible name |

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
