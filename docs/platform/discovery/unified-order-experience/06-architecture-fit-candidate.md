<!-- AUTHORITY: NON_AUTHORITATIVE_DISCOVERY_DRAFT | ID: ARCH-UOE-FIT-CANDIDATE-3 -->

# Architecture Fit candidate — Unified Order Experience

```text
CANDIDATE_ID = ARCH-UOE-FIT-CANDIDATE-3
SUPERSEDES = ARCH-UOE-FIT-CANDIDATE-2
STATUS = ARCHITECTURE_FIT_CANDIDATE_ONLY
AUTHORITY = NON_AUTHORITATIVE
FORMAL_ARCHITECTURE_FIT = NOT_PERFORMED
ARCHITECTURE_LOCKED = NO
PREREQUISITE_GATES = Product Definition Gate + Experience Gate (neither formally passed)
VARIANT = PRECHECKOUT_ELIGIBILITY_WEB_FIRST_V1
GATE_PRECISION_REVISION = YES
IMPLEMENTATION_AUTHORIZED = NO
```

## Fit summary

Viable **without** new domain aggregates, deployable services, roles, permissions, schema
renames, or a second commercial authority **if and only if**:

1. Browsing presentation state remains non-authoritative for sealed money and sealed promise
2. Geographic confirmed facts have a single owner (reuse delivery-context)
3. Exact Schedule slots come only from server lists at **eligible checkout** (UOE-DR-02 deferred)
4. Pre-checkout Takeaway eligibility and mode-sensitive Cart quotes reuse **existing server
   eligibility / cart-evaluate authorities** as read/quote surfaces (UOE-DR-05), with
   **Now vs Schedule-capable** distinguished per accepted IMP-036H/I (GP-01)
5. Open non-terminal Checkout Snapshot reuse wins over browse mode/outlet (GP-02 / AS-29)
6. Empty-cart / no-cart eligibility presentation is not conflated with UNAVAILABLE (GP-03)
7. Presentation `sessionStorage` stays tab-scoped; no cross-tab money/seal sync (GP-04)
8. `PAYMENT_PENDING` isolation and Snapshot/payment authorities are unchanged

**Candidate fit verdict:** Candidate contracts specified for Founder-strengthened V1 + gate
precision.
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
| ASAP pickup eligibility | `listEligiblePickupOutletsForCheckout` / `assertPickupOutletEligible` — accepting-now |
| Scheduled pickup profile / windows | `assertScheduledPickupProfile` + `listServerScheduledWindows` / checkout scheduled-windows — IMP-036I |
| Cart revision / D-370 | Purchase-intent preservation across auth |
| `boba.delivery-context.v1` | Geographic browse session facts (tab-scoped `sessionStorage`) |

## Verified current behaviour (package base)

| Fact | Evidence |
|---|---|
| ASAP pickup eligibility requires accepting-now | `pickup-eligibility.ts` (closed_by_schedule → not eligible) |
| Empty cart → ASAP pickup list `[]` | `listEligiblePickupOutletsForCheckout` early return |
| SCHEDULED PICKUP evaluate/prepare uses scheduled profile gates, not accepting-now | `evaluate.ts` / `prepare.ts` → `assertScheduledPickupProfile` |
| SCHEDULED bind revalidation uses scheduled profile for PICKUP | `scheduled-bind.ts` → `assertScheduledPickupProfile` |
| Scheduled windows compose hours / lead / closed-full-day / profile | `scheduled-eligibility.ts` |
| `evaluateCart` without `location` returns `REQUIRES_FULFILMENT_CONTEXT` before reuse | `cart/evaluate.ts` early return |
| Open Checkout reuse after Delivery serviceability path | `tryReusableCheckoutEvaluation` for DRAFT / READY_FOR_PAYMENT / PAYMENT_PENDING + same cart revision + active Snapshot |
| CART commercial persistence lacks mode/outlet provenance fields today | `persistCommercialEvaluation` CART-scope |

## Reuse vs extend

| Concern | Reuse | Extend | Forbidden |
|---|---|---|---|
| Mode / timing enums | Server fulfilment APIs | Earlier intent UX; labels | Enum rename |
| Delivery geo | delivery-context, LocationSelector, serviceability | Mode-aware bar; orientation vs confirmed copy | Second confirmed-geo store; cross-tab money sync |
| Takeaway Now eligibility | ASAP pickup eligibility domain | Pre-checkout read exposing same accepting-now eligibility + selectionPolicy | Client-invented outlet list; silent bind |
| Takeaway Schedule capability | Scheduled pickup profile gates (+ hours/scheduling foundations used at Checkout) | Pre-checkout **capability** presentation without Menu exact slots | Reject Schedule solely because closed NOW; Menu exact-slot API; guaranteed availability claim |
| Cart pricing by mode | `POST /api/v1/cart/evaluate` | Mode (+ outlet) input; Takeaway path without Delivery address; open-Checkout reuse before Delivery-only early return | Second money authority; browse mutate Checkout |
| Scheduling exact slots | `listCheckoutScheduledWindows(checkoutId)`, seal, bind revalidate | Compact UX; Menu **intent** only (DR-02) | Menu exact-slot preview API in V1 |
| Menu projection outlet | Existing no_location / server outlet rules | May reflect proposed Takeaway outlet from server eligibility | Client-authored outlet |
| Cart / checkout | evaluate, prepare, PAYMENT_PENDING freeze | Bar calls same guards; pre-checkout reads never mutate pending checkout | Client payable; browse mutate pending checkout |
| Workforce | Existing ops surfaces | Primary label Takeaway; collection task verbs | Domain rename |

## UOE-DR-05 — Smallest required read / quote contracts

These are **candidate contracts** for Architecture Fit evaluation. Exact HTTP path naming is an
implementation detail within the semantic bounds below. They do **not** authorize implementation.

### A. Pre-checkout Takeaway outlet eligibility (read-only, timing-aware)

```text
PURPOSE: Server-authoritative Takeaway collection options before Checkout bind
AUTHORITY: Compose existing ASAP pickup eligibility + scheduled-pickup profile foundations
NOT AUTHORITY FOR: Checkout bind, Snapshot, payment, sealed fees, exact Menu slots, guaranteed future availability
```

| Dimension | Smallest contract |
|---|---|
| Inputs | `brandId` + existing cart credential (guest token and/or customer session as today for cart reads) + **timing intent** `ASAP` \| `SCHEDULED` (or equivalent Now/Schedule). **No** `checkoutId` required. Optional generation / request id for race discard. |
| Cart-line precondition | If no active cart **or** cart has zero lines → return distinct `cartState`: `NO_CART` \| `EMPTY_CART` with `outlets=[]` and **not** `selectionPolicy=UNAVAILABLE` meaning “brand has no stores” (GP-03) |
| Outputs (when cart has lines) | Customer-safe `outlets[]` + `selectionPolicy`: `UNAVAILABLE` \| `AUTO_SELECT` \| `CUSTOMER_SELECT` + per-outlet or aggregate capability flags: `nowEligible` and/or `scheduleCapable` as required by requested timing intent |
| Now (`ASAP`) semantics | Reuse accepting-now composition (`listEligiblePickupOutletsForCheckout` / `assertPickupOutletEligible` class). `closed_by_schedule` / not accepting → not Now-eligible |
| Schedule (`SCHEDULED`) semantics | Reuse schedule-capable gates aligned with `assertScheduledPickupProfile` (+ scheduling foundations used when Checkout lists windows). **Must not** require accepting-now. Must **not** list exact Menu slots. Must **not** claim windows are guaranteed — only that the outlet is a truthful Schedule-collection candidate for later checkout window listing |
| AUTO_SELECT / CUSTOMER_SELECT | Same propose ≠ bind rules as CANDIDATE-2 |
| Must not | Bind `pickupOutletId` on Checkout; mutate cart lines; invent nearest-outlet client-side; fabricate `checkoutId` to call pickup-options / scheduled-windows; treat empty cart as UNAVAILABLE brand |

**Safety / privacy / races** — unchanged from CANDIDATE-2 except:

- Eligibility mirrors keyed by cart revision + timing intent + delivery-context fingerprint where relevant
- Re-read on surface resume / visibility / before Checkout handoff
- Checkout confirm revalidates with the **correct** timing gate (Now → accepting-now; Schedule → scheduled profile + window seal path)
- Multi-tab: presentation mirrors are tab-local; server remains source of truth on next read (GP-04)

### B. Mode-sensitive Cart evaluation (advisory quote) — GP-02

```text
PURPOSE: Advisory cart quote that reflects Delivery vs Takeaway (+ outlet when Takeaway)
AUTHORITY: Existing evaluateCart commercial engine — extended input + precedence only
NOT AUTHORITY FOR: Sealed Snapshot, pay readiness, inventing a parallel pricing service, mutating Checkout
```

| Dimension | Smallest contract |
|---|---|
| Surface | Extend existing `POST /api/v1/cart/evaluate` (or equivalent same evaluateCart entry) |
| Added inputs (optional) | `fulfilmentMode`: `DELIVERY` \| `PICKUP`; when `PICKUP`, optional `pickupOutletId` from server eligibility / customer selection |
| Delivery path | Retain today’s `location` / coordinates path for Delivery serviceability-backed quotes |
| Takeaway path | **Must not require Delivery address/coordinates.** Takeaway quote uses outlet (+ cart) commercial path without inventing delivery fee/execution |
| Absence of mode | Preserve backward-compatible evaluate behaviour |
| Outputs | Existing cart evaluation result shape **plus** explicit effective-mode conveyance when reuse applies (below) — still **advisory** |

#### Open Checkout Snapshot reuse precedence (mandatory)

If an active non-terminal Checkout exists for the **same cart revision** with an active Snapshot
and status ∈ {`DRAFT`, `READY_FOR_PAYMENT`, `PAYMENT_PENDING`}:

1. **Reuse wins** over any requested browse `fulfilmentMode` / `pickupOutletId` / Delivery location
   (today’s `tryReusableCheckoutEvaluation` / `reusedCheckoutEvaluation: true` intent).
2. Reuse must be reachable for Takeaway open Checkouts **without** requiring a Delivery `location`
   (today’s early `REQUIRES_FULFILMENT_CONTEXT` without location is a Fit gap to close in the
   evaluate entry ordering — not a license to recompute divergent browse money).
3. Response **must convey effective Checkout mode** (at minimum: `reusedCheckoutEvaluation: true`
   and the Checkout’s `fulfilmentMode`, and timing when material to chrome). UI shows Checkout mode
   as authoritative; browse intent may remain visible as non-authoritative preference only if it
   does not imply a different payable.
4. Server must **not** compute a divergent recomputation for that cart revision — especially under
   `PAYMENT_PENDING`.
5. Browse intent must **not** call fulfilment / destination / timing mutations on that Checkout.

#### DRAFT / READY_FOR_PAYMENT / PAYMENT_PENDING conflict behaviour

| Checkout status | Browse mode/outlet differs | Required behaviour |
|---|---|---|
| `DRAFT` | Yes | Reuse Snapshot/evaluate money for same cart revision; surface Checkout mode; do not mutate Checkout from bar; customer continues Checkout to change mode via existing Checkout APIs |
| `READY_FOR_PAYMENT` | Yes | Same as DRAFT; pay path still requires prepare + Snapshot authority |
| `PAYMENT_PENDING` | Yes | **Freeze preserved**; reuse only; recovery-first UX; bar must not call Checkout mutations; no divergent recomputation |

#### Mode/outlet-specific evaluation provenance

- When a **new** CART-scope commercial evaluation is persisted (not reuse), record evaluated
  `fulfilmentMode` and `pickupOutletId` (or Delivery location fingerprint) for measurement honesty
- Reused Checkout evaluations retain Checkout/Snapshot provenance (`evaluationId` from CHECKOUT
  scope); do not rewrite CART provenance over Snapshot truth
- No duplicate money authority: one presented quote source per response — either reused Checkout
  Snapshot quote **or** advisory CART quote — never both as competing payables

**Safety / privacy / races**

- Evaluate remains non-sealing; pay still requires Checkout prepare + Snapshot path
- Invalid mode/outlet combinations → server error/problem statuses; no client-fabricated totals
- Must not weaken PAYMENT_PENDING freezes (AS-29)
- Cart revision concurrency unchanged; stale evaluate responses discarded via generation tokens
- Mode/outlet intent changes trigger a new evaluate **only when no blocking open-Checkout reuse applies**
- Impact banner / UI money displays only the latest successful server quote (or Checkout evaluate /
  Snapshot at Review)

### Explicit non-authority (no second commercial authority)

| Allowed | Forbidden |
|---|---|
| Server eligibility read for browse Takeaway place (Now / Schedule-capable) | Client-authored outlet eligibility |
| Server cart evaluate quote with mode/outlet | Treating cart quote as sealed payable / Snapshot |
| Checkout pickup-options + fulfilment bind | Binding outlet from browse without confirm |
| Checkout evaluate + Snapshot at pay | Parallel “browse Snapshot” or second pricing authority |
| Presentation `order-context` coordinator (tab-scoped) | Storing money or sealed windows in session as truth; cross-tab seal sync |

## Refinement D — One browsing-context owner

### Proposed model

```text
boba.order-context.v1  (presentation-state coordinator; sessionStorage; TAB-SCOPED)
  ├── modeIntent: unset | DELIVERY | PICKUP
  ├── timingIntent: unset | ASAP | SCHEDULED
  ├── scheduleConfirmation: UNCONFIRMED | CONFIRMED_WINDOW_REF?  (checkout-bound)
  ├── collectionIntent: unset | proposedOutletId? | confirmedOutletId?
  ├── eligibilityFlags: mirrors keyed by delivery-context fingerprint / cart revision / timing / generation
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
| Storage | `sessionStorage` (parity with delivery-context); versioned key `boba.order-context.v1`; **tab-scoped by platform** |
| Cross-tab | **No V1 cross-tab sync** of presentation intent, money, or sealed Checkout. Same-tab event/subscribe only. Each tab revalidates server facts on focus/resume before trusting mirrors (GP-04) |
| Legacy session compatibility | Dual-read `boba.delivery-context.v1` (+ legacy pin façade if still present); migrate forward on write; never drop confirmed geo |
| Sign-out | Drop checkout-bound refs (`CONFIRMED_WINDOW_REF`, confirmed outlet, eligibility mirrors); retain only non-personal intents (mode/timing intent); delivery-context logout behaviour unchanged; honor D-370 |
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
| Menu / pre-checkout | Capture Now / Schedule **intent**; show UNCONFIRMED + reason; Schedule-capable Takeaway place candidates | Call `listCheckoutScheduledWindows` without checkout; invent windows; new Menu exact-slot preview API; claim guaranteed availability |
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
| Takeaway Now proposed (V1) | “Collect from {outlet}?” from **accepting-now** eligibility | Eligibility read; proposed ≠ Checkout-bound |
| Takeaway Schedule proposed (V1) | “Collect from {outlet}?” from **schedule-capable** eligibility; Schedule UNCONFIRMED for exact time | Profile/hours capability; not accepting-now; no Menu slots |
| Takeaway confirmed | “Collect from {outlet}” | checkout outlet after confirm |

Soft Dehradun bias in location provider search remains non-authoritative (existing comment in
provider). UI must not upgrade bias into confirmed Deliver to.

## Architecture-fit consequences of CANDIDATE-3

| Consequence | Required disposition |
|---|---|
| Timing-aware pre-checkout Takeaway eligibility read | Fit-authorized as composition of ASAP + scheduled-pickup foundations; no new aggregate |
| Empty/no-cart distinct from UNAVAILABLE | Mandatory presentation + contract `cartState` (GP-03) |
| Cart evaluate Takeaway without Delivery location | Fit-authorized quote-only path; Snapshot authority unchanged |
| Open-Checkout reuse before Delivery-only early return | Mandatory evaluate entry ordering / precedence (GP-02 / AS-29) |
| Effective Checkout mode in evaluate response | Mandatory when `reusedCheckoutEvaluation` |
| CART evaluation mode/outlet provenance | Required for new CART-scope persists |
| Guest visibility of customer-safe outlet projection | Accepted Fit consequence (public store info); rate-limit + debounce |
| DR-04 wording on WhatsApp | Fit must confirm whether wording is Meta template **body** (re-approval / status lifecycle) or **variable**; no new channel adapter authorized |
| Exact Menu schedule preview | **Out of V1** — no Fit work for that API in this variant |
| Cross-tab presentation sync | **Out of V1** — tab-scoped only (GP-04) |
| Client money / client eligibility | STOP — Architecture mismatch |
| Calling checkout pickup-options / scheduled-windows without Checkout | STOP — misuse of ownership-exact API |
| Parallel pricing service or browse Snapshot | STOP — second commercial authority |
| Divergent cart quote vs open Checkout Snapshot (same revision) | STOP — AS-29 / reuse precedence |
| Reject Schedule Takeaway solely because closed NOW | STOP — contradicts accepted IMP-036I (GP-01) |
| Domain rename PICKUP → Takeaway | STOP — D6 / out of scope |
| Formal Fit PASS before Experience Gate | Forbidden (X2/X3) |

## Unresolved conflicts / stops

| Item | Status |
|---|---|
| Exact Menu schedule preview API | Deferred in V1 (UOE-DR-02 incorporated) — not a Fit blocker for this variant |
| Pre-checkout Takeaway eligibility / mode-aware cart evaluate | Contracts specified (UOE-DR-05 + GP-01…GP-04) — formal Fit still NOT_PERFORMED |
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
12. Takeaway **Now** = accepting-now; Takeaway **Schedule** = schedule-capable (not accepting-now); Schedule is not silently denied solely because closed NOW
13. Open Checkout / Snapshot reuse wins over browse mode/outlet at the same cart revision
14. Empty / no cart ≠ brand UNAVAILABLE
15. Presentation storage is tab-scoped; server facts revalidated per tab
