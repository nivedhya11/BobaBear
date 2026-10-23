<!-- AUTHORITY: NON_AUTHORITATIVE_DISCOVERY_DRAFT | ID: PD-UOE-CANDIDATE-2 -->

# Product Definition candidate — Unified Order Experience

```text
CANDIDATE_ID = PD-UOE-CANDIDATE-2
SUPERSEDES = PD-UOE-CANDIDATE-1
STATUS = PRODUCT_DEFINITION_CANDIDATE
AUTHORITY = NON_AUTHORITATIVE
PRODUCT_DEFINITION_GATE = NOT_PERFORMED
FORMAL_IMP_IDENTITY = NOT_ALLOCATED
NOT_IMP_036J = YES
NOT_IMP_036K = YES
EXPERIENCE_CRITICALITY = X3
CHANGE_RISK = CR2 (CR3 at checkout/payment boundaries)
VARIANT = PRECHECKOUT_ELIGIBILITY_WEB_FIRST_V1
IMPLEMENTATION_AUTHORIZED = NO
```

## 1. Capability statement

Provide a unified customer and workforce **order experience** so that Delivery / Takeaway and
Now / Schedule are presented consistently from Menu through payment and history, while
Checkout Snapshot, payment, serviceability, and accepted fulfilment domain contracts remain
the sole commercial authorities. Pre-checkout Takeaway outlet eligibility and mode-sensitive
Cart quotes are **server-authored reads/quotes** that never become a second sealed commercial
authority.

## 2. Approved experience decisions (Founder)

| # | Decision | Binding presentation | Domain unchanged |
|---|---|---|---|
| D1 | Primary order method labels | **Delivery** / **Takeaway** (customer **and** workforce primary labels) | `DELIVERY` / `PICKUP` |
| D2 | Timing presentation | **Now** / **Schedule** | `ASAP` / `SCHEDULED` |
| D3 | Promise phrases | Delivery time; Collection time; Deliver to [confirmed address]; Collect from [eligible outlet] | Snapshot / checkout fields |
| D4 | Meaning of Now | Earliest available service — **never** immediate arrival/collection guarantee | `ASAP` semantics |
| D5 | Customer jargon | Remove backend “fulfilment” terminology from ordinary customer presentation | Internal APIs may retain names |
| D6 | Rename boundary | No API, database, event, migration, or historical architecture rename | Domain values preserved |

## 3. Four required refinements

### A — Cross-portal vocabulary

- Use **Takeaway** consistently for primary customer and workforce **order type** labels.
- Contextual operational actions may use: Prepare for collection; Ready for collection; Hand over order.
- Do **not** create competing customer-visible labels for the same order method (no parallel
  customer “Pickup” brand alongside Takeaway).
- Supersedes earlier design-prep recommendation that operator queues keep “Pickup” as the
  primary order-type label.

### B — Unconfirmed location

- Never present default Dehradun locality (or any operating-area marketing locality) as a
  **confirmed** delivery address.
- Distinguish **“Ordering in Dehradun”** (browse / market orientation) from
  **“Deliver to [confirmed address]”** (server-eligible, verified destination).
- Only server-eligible, verified destinations may become authoritative Checkout locations.
- Reuse existing delivery-context + serviceability; do not invent a second geographic truth.

### C — Early Schedule selection (UOE-DR-02 = defer exact Menu slots)

- `listCheckoutScheduledWindows` requires an authenticated Checkout ID today
  (`GET /api/v1/checkouts/{checkoutId}/scheduled-windows`).
- Menu-level scheduling **must not** silently reuse that API as a pre-checkout contract.
- **V1 (Founder DR-02):**
  - Menu bar captures Now / Schedule **intent**
  - Without eligibility, Schedule remains clearly **UNCONFIRMED**
  - Exact time is selected from server-provided windows once eligible checkout context exists
  - Checkout revalidates the final promise (existing bind-time revalidation)
- Exact Menu-level scheduled window **preview API is deferred** out of V1. Do not create
  speculative availability.

### D — One browsing-context owner

Define one coordinated, versioned **presentation-state** model for:

- Mode intent
- Delivery location or collection intent
- Timing intent
- Confirmation / eligibility state

Reuse existing `boba.delivery-context.v1` for geographic browse facts. Avoid two competing
copies of confirmed geographic data. Full ownership rules:
[`06-architecture-fit-candidate.md`](./06-architecture-fit-candidate.md).

### V1 variant lock (gate candidate) — PRECHECKOUT_ELIGIBILITY_WEB_FIRST_V1

This Product Definition candidate supersedes the CANDIDATE-1 **intent-only** Takeaway/fee
pre-checkout posture per Founder UOE-DR-05:

| Concern | V1 entitlement |
|---|---|
| Schedule exact slots pre-checkout | **Deferred** (UOE-DR-02) — intent + UNCONFIRMED only |
| Takeaway outlet eligibility pre-checkout | **In V1** — server-authoritative eligibility **read** (same eligibility authority as checkout pickup-options; no client invent) |
| Mode-sensitive Cart quote | **In V1** — extend existing cart evaluate with mode (+ outlet when Takeaway) as **advisory** quote only |
| Commercial seal | Checkout evaluate + Snapshot remain sole sealed commercial / fulfilment commitment |
| Implemented channels | **In V1** — same-meaning Delivery / Takeaway / Now / Schedule on WhatsApp + in-app (UOE-DR-04); email/SMS/push non-sending today |
| Checkout | Authoritative outlet **confirm/bind**, exact windows, Review, pay — unchanged authorities |

Per-surface Takeaway vs operational vocabulary: see
[`12-template-completeness-addendum.md`](./12-template-completeness-addendum.md) §G.

## 4. In scope

- UX-A terminology across customer Menu, Cart, Checkout, Order Confirmation, My Orders,
  tracking; workforce order lists, queues, details **primary order-type labels**;
  **implemented** notification channels (WhatsApp + in-app) same-meaning consistency (UOE-DR-04);
  email/SMS/push adapters are non-sending today and out of scope until implemented
- Admin/scheduling: order-type filters use Takeaway; domain/config nouns such as
  `OutletPickupProfile` are **not** renamed (D6); operational vocabulary allowed per §G addendum
- UX-B compact Now / Schedule interaction using server windows **at eligible checkout**
- UX-C universal order-context bar on Menu → Cart → Checkout
- Server-authoritative pre-checkout Takeaway outlet eligibility read + mode-sensitive Cart
  evaluate (UOE-DR-05) per Architecture Fit smallest contracts
- Session compatibility for legacy delivery-context
- Explicit PAYMENT_PENDING isolation from new browse preferences (preserve existing server guards)
- Content / a11y / responsive obligations implied by X3

## 5. Out of scope / must not change

- Checkout Snapshot money authority
- Payment idempotency and reconciliation
- Serviceability eligibility algorithms as commercial truth for Delivery
- Order materialization
- Accepted fulfilment domain contracts (D-378 / ADR-018, D-379 / ADR-019, ARCH-G28/G29)
- Domain enum renames; API/DB/event/migration renames
- A second sealed commercial authority parallel to Snapshot / checkout evaluate
- Exact Menu-level schedule preview API (deferred — UOE-DR-02)
- Inventing new notification products or unbounded channel rewrite
- Receipts / tax invoices / receipt vouchers (D-365 financial document authority) — wording unchanged
- IMP-036J acceptance; IMP-036K Revenue Recommendations identity
- Full pre-GTM experience audit performance
- Open-ended #379 site rewrite

## 6. Actors and permissions

No new roles or permissions. Customer session + existing workforce auth remain.
Pre-checkout eligibility and cart evaluate remain within existing guest-cart / customer actor
models (BOLA-safe; see Architecture Fit).

## 7. Observable behaviour (candidate entitlement)

| Behaviour | Entitlement |
|---|---|
| Browse Menu without address/sign-in | Allowed; bar shows missing location honestly |
| Set mode/time **intent** before checkout | Allowed; non-authoritative for seal until Checkout |
| Confirm Delivery destination | Only after coordinates present **and** last serviceability for those coordinates is SERVICEABLE |
| Pre-checkout Takeaway outlet eligibility | **In V1** — server list + selectionPolicy; AUTO_SELECT may **propose**; customer must confirm before Checkout bind; never silent bind from browse |
| Mode-sensitive Cart evaluate | **In V1** — server quote reflects mode (+ proposed/confirmed outlet when Takeaway); advisory until Checkout Review / Snapshot |
| Confirm Takeaway outlet at Checkout | Via existing checkout-bound pickup-options + fulfilment set (AUTO_SELECT propose + confirm; CUSTOMER_SELECT; UNAVAILABLE) |
| Select Schedule window | Server windows only once eligible checkout exists; 30-minute slots; TZ/lead/hours/cutoff preserved; **no** Menu exact-slot list in V1 |
| Pay | Existing prepare/pay path; Snapshot sealed; scheduled bind revalidation |
| Change browse intent while PAYMENT_PENDING | Must **not** mutate that checkout; recovery first |
| Implemented channels | WhatsApp + in-app same primary meaning as web via customer-visible content; email/SMS/push not in V1 |
| Workforce primary labels | Delivery / Takeaway |

## 8. Quality Attribute Profile (candidate)

| Attribute | Profile |
|---|---|
| Correctness | Checkout/payment/serviceability unchanged; presentation must not invent money/availability; pre-checkout quotes are server-authored and advisory |
| Consistency | Cross-portal primary labels; LANG-1 contextual ops verbs; implemented channels same-meaning |
| Usability | Mobile-first bar + sheet; desktop integrated chrome; early Takeaway place clarity without fake fees |
| Accessibility | Keyboard + SR for sheet/dialog; no jargon |
| Security / abuse | No client-authored payable; no speculative slots; BOLA on eligibility/evaluate; session races guarded |
| Privacy | Customer-safe outlet fields only; no hierarchy/legal dump; analytics PII-minimized |
| Operability | Ops retain precise task vocabulary |

## 9. Dependencies

- Accepted IMP-036H (mode / pickup), IMP-036I (scheduled windows), Cart/Checkout foundations
- Existing delivery-context, LocationSelector, serviceability, pickup eligibility domain,
  cart evaluate, pickup-options
- Parallel tracks **not** owned here: IMP-036J Founder UAT, ₹498 / #391B payment investigations,
  Nginx security verification

## 10. Open product items for Founder

| ID | Item | Disposition |
|---|---|---|
| UOE-DR-01 | Allocate future ROADMAP slice ID (not IMP-036J/K) **and** sequencing vs pending IMP-036J acceptance **and** IMP-036K (D-383 nextProductSlice). D-383 unaffected unless a new decision amends sequencing. One-active-slice rule applies. | DECISION_REQUIRED (R3) |
| UOE-DR-02 | Exact Menu-level scheduled window preview API | **INCORPORATED — DEFER in V1** (Founder recommendation) |
| UOE-DR-03 | Formal Product Definition Gate **and** Experience Gate verdicts on this package | Founder / process — NOT_PERFORMED |
| UOE-DR-04 | Implemented notification-channel consistency | **INCORPORATED — WhatsApp + in-app same-meaning in V1** (Founder recommendation); email/SMS/push and unbounded rewrite remain out of scope |
| UOE-DR-05 | Pre-checkout Takeaway eligibility + mode-sensitive Cart evaluate | **INCORPORATED — strengthen V1** (Founder recommendation); contracts in `06-…`; no second commercial authority |

Companion: [`04-story-map-acceptance-scenarios.md`](./04-story-map-acceptance-scenarios.md),
[`12-template-completeness-addendum.md`](./12-template-completeness-addendum.md).
