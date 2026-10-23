<!-- AUTHORITY: NON_AUTHORITATIVE_DISCOVERY_DRAFT | ID: ARCH-UOE-FIT-CANDIDATE-2 -->

# Architecture Fit candidate — Unified Order Experience

```text
CANDIDATE_ID = ARCH-UOE-FIT-CANDIDATE-2
SUPERSEDES = ARCH-UOE-FIT-CANDIDATE-1
STATUS = ARCHITECTURE_FIT_CANDIDATE_ONLY
AUTHORITY = NON_AUTHORITATIVE
FORMAL_ARCHITECTURE_FIT = NOT_PERFORMED
ARCHITECTURE_LOCKED = NO
PREREQUISITE_GATES = Product Definition Gate + Experience Gate (neither formally passed)
VARIANT = PRECHECKOUT_ELIGIBILITY_WEB_FIRST_V1
IMPLEMENTATION_AUTHORIZED = NO
```

## Fit summary

Viable **without** new domain aggregates, deployable services, roles, permissions, schema
renames, or a second commercial authority **if and only if**:

1. Browsing presentation state remains non-authoritative for sealed money and sealed promise
2. Geographic confirmed facts have a single owner (reuse delivery-context)
3. Exact Schedule slots come only from server lists at **eligible checkout** (UOE-DR-02 deferred)
4. Pre-checkout Takeaway eligibility and mode-sensitive Cart quotes reuse **existing server
   eligibility / cart-evaluate authorities** as read/quote surfaces (UOE-DR-05)
5. `PAYMENT_PENDING` isolation and Snapshot/payment authorities are unchanged

**Candidate fit verdict:** Candidate contracts specified for Founder-strengthened V1.
**Formal Fit:** `NOT_PERFORMED`. Fit may be evaluated after Product/Experience gates; it must not
finally PASS/lock without those gates (X2/X3 rule).

## Binding authorities reused (unchanged)

| Authority | Use |
|---|---|
| D-378 / ADR-018 / ARCH-G28 | Mode `DELIVERY` \| `PICKUP`; pickup execution boundary |
| D-379 / ADR-019 / ARCH-G29 | Timing `ASAP` \| `SCHEDULED`; sealed windows; bind revalidation |
| Checkout Snapshot | Sole sealed commercial / fulfilment commitment at pay |
| Checkout evaluate | Authoritative checkout commercial recomputation |
| Cart evaluate | Advisory cart quote (existing); mode-sensitive extension remains quote-only |
| Payment (D-361+) | Idempotency, webhook truth, client-evidence — unchanged |
| Serviceability | Coordinate-authoritative delivery eligibility |
| Pickup eligibility domain | Same rules as checkout pickup-options (`listEligiblePickupOutletsForCheckout`) |
| Cart revision / D-370 | Purchase-intent preservation across auth |
| `boba.delivery-context.v1` | Geographic browse session facts |

## Reuse vs extend

| Concern | Reuse | Extend | Forbidden |
|---|---|---|---|
| Mode / timing enums | Server fulfilment APIs | Earlier intent UX; labels | Enum rename |
| Delivery geo | delivery-context, LocationSelector, serviceability | Mode-aware bar; orientation vs confirmed copy | Second confirmed-geo store |
| Takeaway eligibility | Pickup eligibility domain used by checkout pickup-options | **Smallest pre-checkout read** exposing same eligibility + selectionPolicy without checkout bind | Client-invented outlet list; silent bind; parallel eligibility algorithm |
| Cart pricing by mode | `POST /api/v1/cart/evaluate` | **Smallest mode (+ outlet) input** for advisory quote | Second money authority; treating cart quote as Snapshot |
| Scheduling | `listCheckoutScheduledWindows(checkoutId)`, seal, bind revalidate | Compact UX; Menu **intent** only (DR-02) | Menu exact-slot preview API in V1; speculative availability |
| Menu projection outlet | Existing no_location / server outlet rules | May reflect proposed Takeaway outlet from server eligibility | Client-authored outlet |
| Cart / checkout | evaluate, prepare, PAYMENT_PENDING freeze | Bar calls same guards; pre-checkout reads never mutate pending checkout | Client payable; browse mutate pending checkout |
| Workforce | Existing ops surfaces | Primary label Takeaway; collection task verbs | Domain rename |

## UOE-DR-05 — Smallest required read / quote contracts

These are **candidate contracts** for Architecture Fit evaluation. Exact HTTP path naming is an
implementation detail within the semantic bounds below. They do **not** authorize implementation.

### A. Pre-checkout Takeaway outlet eligibility (read-only)

```text
PURPOSE: Server-authoritative eligible Takeaway outlets before Checkout bind
AUTHORITY: Same pickup eligibility domain as listCheckoutPickupOptions / listEligiblePickupOutletsForCheckout
NOT AUTHORITY FOR: Checkout bind, Snapshot, payment, sealed fees
```

| Dimension | Smallest contract |
|---|---|
| Inputs | `brandId` + existing cart credential (guest token and/or customer session as today for cart reads). **No** `checkoutId` required. Optional generation / request id for race discard. |
| Outputs | Customer-safe `outlets[]` (identity + display label fields already used for pickup-options) + `selectionPolicy`: `UNAVAILABLE` \| `AUTO_SELECT` \| `CUSTOMER_SELECT` |
| Semantics | `AUTO_SELECT` → UI may **propose** one outlet; customer confirmation still required before Checkout fulfilment bind. `CUSTOMER_SELECT` → explicit choice. `UNAVAILABLE` → honest empty + recovery. |
| Must reuse | Existing eligibility computation over brand + cart + clock — **not** a second algorithm |
| Must not | Bind `pickupOutletId` on Checkout; mutate cart lines; return hierarchy / legal-entity / ops dumps; invent nearest-outlet client-side; call `listCheckoutPickupOptions` without a Checkout by fabricating checkoutId |

**Safety**

- Read-only; no revision bump; no fulfilment mutation
- BOLA: actor may only read for carts/brands they are credentialed for (parity with cart reads)
- Terminal/expired Checkout rules are N/A (no checkoutId); must not create Checkout to satisfy this read
- PAYMENT_PENDING: this read must not call fulfilment/destination/timing mutations on any pending checkout
- Exposure widening: same customer-safe projection as pickup-options may be visible to guest cart holders — accepted as public store information; `instructions` content must remain customer-safe
- Abuse/cost: reuse existing customer-commerce rate-limit posture; client debounce; empty cart short-circuits to `[]`; no new infrastructure

**Privacy**

- Customer-safe outlet projection only (same field class as checkout pickup-options)
- No other customers’ carts, no workforce PII, no full org hierarchy dump

**Race behaviour**

- Responses keyed by request generation / cart revision; UI ignores stale responses
- Eligibility mirrors in `order-context` keyed by cart revision + delivery-context fingerprint where relevant; mismatch → drop mirrors and re-read
- Eligibility mirrors are **time-sensitive**: re-read on surface resume / visibility / before Checkout handoff; Checkout confirm revalidates (accepting-now)
- Proposed outlet ≠ confirmed place for Schedule window listing (windows still require confirmed Checkout place)
- Multi-tab: last-write/generation on presentation state; server eligibility remains source of truth on next read

### B. Mode-sensitive Cart evaluation (advisory quote)

```text
PURPOSE: Advisory cart quote that reflects Delivery vs Takeaway (+ outlet when Takeaway)
AUTHORITY: Existing evaluateCart commercial engine — extended input only
NOT AUTHORITY FOR: Sealed Snapshot, pay readiness, inventing a parallel pricing service
```

| Dimension | Smallest contract |
|---|---|
| Surface | Extend existing `POST /api/v1/cart/evaluate` (or equivalent same evaluateCart entry) |
| Added inputs (optional) | `fulfilmentMode`: `DELIVERY` \| `PICKUP`; when `PICKUP`, optional `pickupOutletId` from server eligibility / customer selection |
| Existing inputs | Retain today’s `location` / coordinates path for Delivery serviceability-backed quotes |
| Outputs | Existing cart evaluation result shape (status, problems, commercial explanation fields as today) — still **advisory** |
| Semantics | PICKUP quotes must not invent delivery execution/fee; mode-restricted offers follow server commercial rules; absence of mode preserves backward-compatible evaluate behaviour |
| Relationship to Checkout | **Precedence (mandatory):** If an active non-terminal Checkout (`DRAFT` / `READY_FOR_PAYMENT` / `PAYMENT_PENDING`) exists for the **same cart revision** with an active Snapshot, the existing reused Checkout evaluation wins over any requested `fulfilmentMode` / `pickupOutletId` (today’s `tryReusableCheckoutEvaluation` / `reusedCheckoutEvaluation: true`). Response must surface that the Checkout’s mode is authoritative; UI shows Checkout mode; server must **not** compute a divergent recomputation for that cart revision — especially under `PAYMENT_PENDING`. Cart quote never replaces Checkout evaluate / Snapshot seal. |

**Safety**

- Evaluate remains non-sealing; pay still requires Checkout prepare + Snapshot path
- Invalid mode/outlet combinations → server error/problem statuses; no client-fabricated totals
- Must not weaken PAYMENT_PENDING freezes; must not diverge browse quote from open Checkout Snapshot at same cart revision (AS-29)
- Persisted CART-scope commercial evaluations must record the evaluated mode/outlet (measurement honesty)

**Privacy**

- Same cart credential scope as today’s evaluate; no additional PII in responses beyond existing commerce projection

**Race behaviour**

- Cart revision concurrency unchanged; stale evaluate responses discarded via generation tokens
- Mode/outlet intent changes trigger a new evaluate **only when no blocking open-Checkout reuse applies**; prior quote must not linger as payable truth
- Impact banner / UI money displays only the latest successful server quote (or Checkout evaluate / Snapshot at Review)

### Explicit non-authority (no second commercial authority)

| Allowed | Forbidden |
|---|---|
| Server eligibility read for browse Takeaway place | Client-authored outlet eligibility |
| Server cart evaluate quote with mode/outlet | Treating cart quote as sealed payable / Snapshot |
| Checkout pickup-options + fulfilment bind | Binding outlet from browse without confirm |
| Checkout evaluate + Snapshot at pay | Parallel “browse Snapshot” or second pricing authority |
| Presentation `order-context` coordinator | Storing money or sealed windows in session as truth |

## Refinement D — One browsing-context owner

### Proposed model

```text
boba.order-context.v1  (presentation-state coordinator; sessionStorage)
  ├── modeIntent: unset | DELIVERY | PICKUP
  ├── timingIntent: unset | ASAP | SCHEDULED
  ├── scheduleConfirmation: UNCONFIRMED | CONFIRMED_WINDOW_REF?  (checkout-bound)
  ├── collectionIntent: unset | proposedOutletId? | confirmedOutletId?
  ├── eligibilityFlags: mirrors keyed by delivery-context fingerprint / cart revision / generation
  └── delivery: reuse boba.delivery-context.v1 (no duplicate confirmed coordinates)
```

`order-context` **coordinates**; it does not become commercial authority.
Confirmed geographic coordinates/labels continue to live only in delivery-context (plus server
Checkout destination when sealed). Proposed Takeaway outlet may be mirrored from the latest
successful eligibility read; confirmation for bind remains a Checkout act.

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
| Cart / checkout handoff | On checkout create/resume, map intent → server fulfilment/destination/timing APIs with revision; server wins on conflict; re-run eligibility/evaluate as needed |
| Changed location / offer / fee | Trigger server evaluate; surface deltas; never keep client money |
| Checkout `PAYMENT_PENDING` isolation | **Preserve** existing server guards (`fulfilment` / destination / timing / evaluate freeze) and client `cart_changed_unresolved` recovery. New browse preference must not call mutations on that checkout; `PendingPaymentGuard` is UX routing only — **no new server guard authorized** |
| No client-owned payable | Display money only from cart evaluate / checkout evaluate / Snapshot |

## Refinement C / UOE-DR-02 — Schedule API boundary (exact Menu slots deferred)

| Phase | Allowed | Not allowed |
|---|---|---|
| Menu / pre-checkout | Capture Now / Schedule **intent**; show UNCONFIRMED + reason | Call `listCheckoutScheduledWindows` without checkout; invent windows; new Menu exact-slot preview API (deferred) |
| Eligible checkout | List + select server windows; seal on set timing | Free-minute picker; list while outlet only **proposed** (not confirmed) |
| Pay | `assertScheduledSnapshotStillBindable` (existing) | Pay on expired/drifted window |

**Eligible checkout** = authenticated + Checkout + mode set + confirmed place
(SERVICEABLE destination or **confirmed** Takeaway outlet).

## Refinement B — Location presentation

| State | Copy pattern | Authority |
|---|---|---|
| Market orientation | “Ordering in Dehradun” | Marketing / site locality — **not** delivery destination |
| Missing delivery place | “Add address” / equivalent | No coordinates / no delivery-context |
| Checking | “Checking this address…” | Coords present; serviceability in flight or fingerprint mismatch |
| Known · not deliverable | Clear unsupported copy + recovery | Coords present; serviceability NOT_SERVICEABLE |
| Confirmed delivery | “Deliver to {compact label}” | Coords + SERVICEABLE for those coords / checkout destination |
| Takeaway intent / proposed (V1) | “Collect from {outlet}?” / choose-store CTA from **server eligibility** | Eligibility read; proposed ≠ Checkout-bound |
| Takeaway confirmed | “Collect from {outlet}” | checkout outlet after confirm |

Soft Dehradun bias in location provider search remains non-authoritative (existing comment in
provider). UI must not upgrade bias into confirmed Deliver to.

## Architecture-fit consequences of CANDIDATE-2

| Consequence | Required disposition |
|---|---|
| New/extended **read** for pre-checkout pickup eligibility | Fit-authorized as reuse of existing eligibility domain; no new aggregate |
| Cart evaluate input extension for mode/outlet | Fit-authorized as quote-only; Snapshot authority unchanged; open-Checkout reuse precedence mandatory |
| Guest visibility of customer-safe outlet projection | Accepted Fit consequence (public store info); rate-limit + debounce; empty-cart `[]` |
| DR-04 wording on WhatsApp | Fit must confirm whether wording is Meta template **body** (re-approval / status lifecycle) or **variable**; no new channel adapter authorized |
| Exact Menu schedule preview | **Out of V1** — no Fit work for that API in this variant |
| Client money / client eligibility | STOP — Architecture mismatch |
| Calling checkout pickup-options without Checkout | STOP — misuse of ownership-exact API |
| Parallel pricing service or browse Snapshot | STOP — second commercial authority |
| Divergent cart quote vs open Checkout Snapshot (same revision) | STOP — AS-29 / reuse precedence |
| Domain rename PICKUP → Takeaway | STOP — D6 / out of scope |
| Formal Fit PASS before Experience Gate | Forbidden (X2/X3) |

## Unresolved conflicts / stops

| Item | Status |
|---|---|
| Exact Menu schedule preview API | Deferred in V1 (UOE-DR-02 incorporated) — not a Fit blocker for this variant |
| Pre-checkout Takeaway eligibility / mode-aware cart evaluate | Contracts specified (UOE-DR-05 incorporated) — formal Fit still NOT_PERFORMED |
| Future IMP identity + vs IMP-036K/D-383 sequencing | DECISION_REQUIRED (UOE-DR-01) |
| Formal Fit lock | STOP until Product + Experience gates pass |
| Any pressure to rename `PICKUP` domain value | STOP — out of scope |

## Invariants that must not regress

1. Coordinates = geographic authority; no client-invented delivery outlet
2. Mode ⊥ timing on server; Snapshot seals both
3. PICKUP: no delivery fee / delivery execution
4. Windows server-listed and sealed (checkout-eligible only in V1)
5. Optimistic concurrency via expected revisions
6. PAYMENT_PENDING freezes fulfilment/destination/timing
7. Browse-without-address remains allowed
8. AUTO_SELECT proposes; customer confirms before bind
9. Presentation language ≠ domain rename
10. Cart evaluate quote ≠ Snapshot seal
11. Pre-checkout eligibility read ≠ Checkout fulfilment bind
12. Takeaway eligibility is accepting-now; Schedule does not widen closed-outlet eligibility in V1
13. Open Checkout / Snapshot reuse wins over browse mode/outlet at the same cart revision
