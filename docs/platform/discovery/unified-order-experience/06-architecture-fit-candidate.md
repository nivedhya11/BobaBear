<!-- AUTHORITY: NON_AUTHORITATIVE_DISCOVERY_DRAFT | ID: ARCH-UOE-FIT-CANDIDATE-1 -->

# Architecture Fit candidate — Unified Order Experience

```text
CANDIDATE_ID = ARCH-UOE-FIT-CANDIDATE-1
STATUS = ARCHITECTURE_FIT_CANDIDATE_ONLY
AUTHORITY = NON_AUTHORITATIVE
FORMAL_ARCHITECTURE_FIT = NOT_PERFORMED
ARCHITECTURE_LOCKED = NO
PREREQUISITE_GATES = Product Definition Gate + Experience Gate (neither formally passed)
IMPLEMENTATION_AUTHORIZED = NO
```

## Fit summary

Viable **without** new domain aggregates, deployable services, roles, permissions, or schema
renames **if and only if**:

1. Browsing presentation state remains non-authoritative for money and sealed promise
2. Geographic confirmed facts have a single owner (reuse delivery-context)
3. Exact Schedule slots come only from server lists (checkout-authenticated today)
4. `PAYMENT_PENDING` isolation and Snapshot/payment authorities are unchanged

**Candidate fit verdict:** Candidate with **open contract question UOE-DR-05** (and UOE-DR-02).
Viable after Product/Experience gates **if** V1 intent-only deferrals hold.
**Formal Fit:** `NOT_PERFORMED`. **Not** RECOMMENDED_PASS while UOE-DR-05 is unresolved.

## Binding authorities reused (unchanged)

| Authority | Use |
|---|---|
| D-378 / ADR-018 / ARCH-G28 | Mode `DELIVERY` \| `PICKUP`; pickup execution boundary |
| D-379 / ADR-019 / ARCH-G29 | Timing `ASAP` \| `SCHEDULED`; sealed windows; bind revalidation |
| Checkout Snapshot | Sole sealed commercial / fulfilment commitment at pay |
| Payment (D-361+) | Idempotency, webhook truth, client-evidence — unchanged |
| Serviceability | Coordinate-authoritative delivery eligibility |
| Cart revision / D-370 | Purchase-intent preservation across auth |
| `boba.delivery-context.v1` | Geographic browse session facts |

## Reuse vs extend

| Concern | Reuse | Extend (presentation / client) | Forbidden |
|---|---|---|---|
| Mode / timing enums | Server fulfilment APIs | Earlier intent UX; labels | Enum rename |
| Delivery geo | delivery-context, LocationSelector, serviceability | Mode-aware bar; orientation vs confirmed copy | Second confirmed-geo store |
| Pickup eligibility | checkout-bound pickup-options AUTO_SELECT / CUSTOMER_SELECT / UNAVAILABLE | Bar shows Takeaway **intent**; outlet confirm at Checkout (V1) | Call pickup-options without checkout; invent outlet eligibility client-side; silent bind without confirm |
| Cart pricing by mode | Checkout evaluate / reuse existing checkout evaluation | V1: authoritative fee/offer impact at Checkout; optional “fees shown at checkout” pre-checkout | Invent mode-aware cart totals without server contract (UOE-DR-05) |
| Scheduling | `listCheckoutScheduledWindows(checkoutId)`, seal, bind revalidate | Compact UX; Menu **intent** without fake slots | Silent reuse of checkout windows API pre-checkout; speculative availability |
| Menu projection outlet (Takeaway intent, no address) | Existing no_location / server outlet rules | Do not invent outlet from client | Client-authored outlet |
| Cart / checkout | evaluate, prepare, PAYMENT_PENDING freeze | Bar calls same guards | Client payable; browse mutate pending checkout |
| Workforce | Existing ops surfaces | Primary label Takeaway; collection task verbs | Domain rename |

## Refinement D — One browsing-context owner

### Proposed model

```text
boba.order-context.v1  (presentation-state coordinator; sessionStorage)
  ├── modeIntent: unset | DELIVERY | PICKUP
  ├── timingIntent: unset | ASAP | SCHEDULED
  ├── scheduleConfirmation: UNCONFIRMED | CONFIRMED_WINDOW_REF?  (checkout-bound)
  ├── collectionIntent: unset | proposedOutletId? | confirmedOutletId?
  ├── eligibilityFlags: mirrors keyed by delivery-context fingerprint / generation
  └── delivery: reuse boba.delivery-context.v1 (no duplicate confirmed coordinates)
```

`order-context` **coordinates**; it does not become commercial authority.
Confirmed geographic coordinates/labels continue to live only in delivery-context (plus server
Checkout destination when sealed).

### Confirmed Deliver to (definition)

`Confirmed Deliver to` requires **both**:

1. Coordinates (and label) present in `boba.delivery-context.v1`
2. Last serviceability evaluation for **exactly those coordinates** returned `SERVICEABLE`,
   keyed by delivery-context content fingerprint / surface generation

Otherwise present missing, “Checking…”, market orientation, or **Known · not deliverable here**.
`eligibilityFlags` that do not match the current delivery-context fingerprint are **dropped**
(never a second geographic truth).

### Required specifications

| Topic | Rule |
|---|---|
| Storage | `sessionStorage` (parity with delivery-context); versioned key `boba.order-context.v1` |
| Legacy session compatibility | Dual-read `boba.delivery-context.v1` (+ legacy pin façade if still present); migrate forward on write; never drop confirmed geo |
| Sign-out | Drop checkout-bound refs (`CONFIRMED_WINDOW_REF`, confirmed outlet, eligibility mirrors); retain only non-personal intents (mode/timing intent); delivery-context logout behaviour unchanged; honor D-370 (post-logout browser loses customer authority) |
| Cross-tab | Same event/subscribe pattern as delivery-context; generation tokens win |
| Expiry | Checkout-bound refs invalid when checkout completed/expired/terminal; do not auto-create/resume Checkout from bar intent alone |
| Auth / navigation transitions | Preserve safe intent across login; revalidate eligibility; honor D-370 cart merge |
| Async generation / race protection | Generation tokens / ignore stale responses (same pattern as OrderingCatalogClient) |
| Cart / checkout handoff | On checkout create/resume, map intent → server fulfilment/destination/timing APIs with revision; server wins on conflict |
| Changed location / offer / fee | Trigger server evaluate; surface deltas; never keep client money |
| Checkout `PAYMENT_PENDING` isolation | **Preserve** existing server guards (`fulfilment` / destination / timing / evaluate freeze) and client `cart_changed_unresolved` recovery. New browse preference must not call mutations on that checkout; `PendingPaymentGuard` is UX routing only — **no new server guard authorized** |
| No client-owned payable | Display money only from cart evaluate / checkout evaluate / Snapshot |

## Refinement C — Schedule API boundary

| Phase | Allowed | Not allowed |
|---|---|---|
| Menu / pre-checkout | Capture Now / Schedule **intent**; show UNCONFIRMED + reason | Call `listCheckoutScheduledWindows` without checkout; invent windows |
| Eligible checkout | List + select server windows; seal on set timing | Free-minute picker; list while outlet only proposed |
| Pay | `assertScheduledSnapshotStillBindable` (existing) | Pay on expired/drifted window |

**Eligible checkout** = authenticated + Checkout + mode set + confirmed place
(SERVICEABLE destination or **confirmed** Takeaway outlet).

**Preview contract:** propose only if Founder requires exact Menu-level times in V1.
Mark `UOE-DR-02 = DECISION_REQUIRED`. Recommended: defer; V1 intent-only.

**Takeaway pre-checkout contract:** `UOE-DR-05 = DECISION_REQUIRED`. Recommended: V1 intent-only;
do not call pickup-options without checkout.

## Refinement B — Location presentation

| State | Copy pattern | Authority |
|---|---|---|
| Market orientation | “Ordering in Dehradun” | Marketing / site locality — **not** delivery destination |
| Missing delivery place | “Add address” / equivalent | No coordinates / no delivery-context |
| Checking | “Checking this address…” | Coords present; serviceability in flight or fingerprint mismatch |
| Known · not deliverable | Clear unsupported copy + recovery | Coords present; serviceability NOT_SERVICEABLE |
| Confirmed delivery | “Deliver to {compact label}” | Coords + SERVICEABLE for those coords / checkout destination |
| Takeaway intent (V1 pre-checkout) | “Choose store at checkout” / equivalent | No pickup-options call |
| Takeaway confirmed | “Collect from {outlet}” | checkout outlet after confirm |

Soft Dehradun bias in location provider search remains non-authoritative (existing comment in
provider). UI must not upgrade bias into confirmed Deliver to.

## Unresolved conflicts / stops

| Item | Status |
|---|---|
| Exact Menu schedule preview API | DECISION_REQUIRED (UOE-DR-02) |
| Pre-checkout Takeaway eligibility / mode-aware cart evaluate | DECISION_REQUIRED (UOE-DR-05) |
| Future IMP identity + vs IMP-036K/D-383 sequencing | DECISION_REQUIRED (UOE-DR-01) |
| Formal Fit lock | STOP until Product + Experience gates pass **and** open contracts decided or deferred |
| Any pressure to rename `PICKUP` domain value | STOP — out of scope |

## Invariants that must not regress

1. Coordinates = geographic authority; no client-invented delivery outlet
2. Mode ⊥ timing on server; Snapshot seals both
3. PICKUP: no delivery fee / delivery execution
4. Windows server-listed and sealed
5. Optimistic concurrency via expected revisions
6. PAYMENT_PENDING freezes fulfilment/destination/timing
7. Browse-without-address remains allowed
8. AUTO_SELECT proposes; customer confirms
9. Presentation language ≠ domain rename
