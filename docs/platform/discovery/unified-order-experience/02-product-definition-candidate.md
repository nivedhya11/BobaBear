<!-- AUTHORITY: NON_AUTHORITATIVE_DISCOVERY_DRAFT | ID: PD-UOE-CANDIDATE-3 -->

# Product Definition candidate — Unified Order Experience

```text
CANDIDATE_ID = PD-UOE-CANDIDATE-3
SUPERSEDES = PD-UOE-CANDIDATE-2
STATUS = PRODUCT_DEFINITION_CANDIDATE
AUTHORITY = NON_AUTHORITATIVE
PRODUCT_DEFINITION_GATE = NOT_PERFORMED
FORMAL_IMP_IDENTITY = NOT_ALLOCATED
NOT_IMP_036J = YES
NOT_IMP_036K = YES
EXPERIENCE_CRITICALITY = X3
CHANGE_RISK = CR2 (CR3 at checkout/payment boundaries)
VARIANT = PRECHECKOUT_ELIGIBILITY_WEB_FIRST_V1
GATE_PRECISION_REVISION = YES
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

`sessionStorage` presentation state is **tab-scoped** (GP-04). No cross-tab sync of payable
amounts or sealed Checkout state from presentation storage.

### V1 variant lock (gate candidate) — PRECHECKOUT_ELIGIBILITY_WEB_FIRST_V1

This Product Definition candidate supersedes CANDIDATE-2’s incorrect “no Schedule-for-later
Takeaway” posture (GP-01) while retaining DR-02 / DR-04 / DR-05:

| Concern | V1 entitlement |
|---|---|
| Schedule exact slots pre-checkout | **Deferred** (UOE-DR-02) — intent + UNCONFIRMED only |
| Takeaway **Now** outlet eligibility | **In V1** — server accepting-now eligibility (IMP-036H ASAP pickup domain) |
| Takeaway **Schedule** collection capability | **In V1** — server schedule-capable outlet presentation using accepted scheduled-pickup profile / hours rules (IMP-036I); **not** rejected solely because closed NOW; **no** Menu exact slots; **no** guaranteed future availability claim |
| Mode-sensitive Cart quote | **In V1** — extend existing cart evaluate with mode (+ outlet when Takeaway) and timing intent as **advisory** quote only; Takeaway quote **without** Delivery address (GP-02) |
| Timing-sensitive Offers | **In V1** — honour existing promotion `eligibleFulfilmentModes` / `eligibleFulfilmentTimings` via server evaluate; while Schedule is UNCONFIRMED, Cart evaluate **omits timing** (timing-restricted Offers do not apply); mode-gated Offers may show with provisional messaging; **no** Menu guarantee of scheduled slot or final promotional price |
| Open Checkout precedence | Open non-terminal Checkout Snapshot reuse wins over browse mode/outlet at same cart revision (AS-29 extended); missing commercial-evaluation evidence fail-closed (AS-39 / AS-45) |
| Commercial seal | Checkout evaluate + Snapshot remain sole sealed commercial / fulfilment commitment |
| Implemented channels | **In V1** — same-meaning Delivery / Takeaway / Now / Schedule on **in-app** and on **WhatsApp when that environment’s WhatsApp adapter is sending** (UOE-DR-04); WhatsApp may remain noop; email/SMS/push non-sending today |
| Checkout | Authoritative outlet **confirm/bind**, exact windows, Review, pay — unchanged authorities; pickup-options **timing-aware** + bind-without-evaluate on Schedule path (GP-01 Contract C); Founder confirms defect classification under UOE-DR-06 |
| Empty / first-use | Distinguish No Cart / Empty Cart / no eligible / error (GP-03); never “no outlets” because cart has no lines |

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
- Server-authoritative pre-checkout Takeaway eligibility (Now vs Schedule-capable) +
  mode-sensitive Cart evaluate (UOE-DR-05) per Architecture Fit smallest contracts
- Session compatibility for legacy delivery-context; tab-scoped order-context (GP-04)
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
- Guaranteed future availability claims without server window eligibility at Checkout
- Inventing new notification products or unbounded channel rewrite
- Receipts / tax invoices / receipt vouchers (D-365 financial document authority) — wording unchanged
- IMP-036J acceptance; IMP-036K Revenue Recommendations identity
- Full pre-GTM experience audit performance
- Open-ended #379 site rewrite
- Cross-tab synchronization of payable amounts or sealed Checkout state via presentation storage

## 6. Actors and permissions

No new roles or permissions. Customer session + existing workforce auth remain.
Pre-checkout eligibility and cart evaluate remain within existing guest-cart / customer actor
models (BOLA-safe; see Architecture Fit).

## 7. Observable behaviour (candidate entitlement)

| Behaviour | Entitlement |
|---|---|
| Browse Menu without address/sign-in / without cart lines | Allowed; bar shows missing method/place/time honestly; **no** “no Takeaway outlets” solely because cart empty (GP-03) |
| Set mode/time **intent** before checkout | Allowed; non-authoritative for seal until Checkout |
| Confirm Delivery destination | Only after coordinates present **and** last serviceability for those coordinates is SERVICEABLE |
| Pre-checkout Takeaway **Now** eligibility | Server accepting-now list + selectionPolicy; AUTO_SELECT may **propose**; customer must confirm before Checkout bind; never silent bind from browse |
| Pre-checkout Takeaway **Schedule** capability | Server schedule-capable outlets (accepted profile/hours rules); closed NOW must **not** alone mark Schedule collection unavailable; exact slots remain checkout-eligible only (DR-02); no guaranteed-availability claim |
| Mode-sensitive Cart evaluate | Server quote reflects mode (+ proposed/confirmed outlet when Takeaway) and timing intent **without requiring Delivery address** for Takeaway; advisory until Checkout Review / Snapshot |
| Timing-sensitive Offers (provisional) | Mode/timing-gated promotions evaluate via server quote context; Schedule UNCONFIRMED → provisional-offer messaging only; Menu must not promise a slot or final promo price (AS-42–44) |
| Open Checkout vs browse intent | If active non-terminal Checkout exists for same cart revision with Snapshot, reuse wins; UI shows Checkout’s effective mode/timing; browse intent does not mutate that Checkout |
| Snapshot evaluation evidence missing | Fail-closed (`EVALUATION_INDETERMINATE` or Snapshot-sourced display only); never divergent browse money; fingerprint/dedup must not present competing payables (AS-39 / AS-45–46) |
| Confirm Takeaway outlet at Checkout | Checkout-owned pickup-options + fulfilment set. **Now** list = accepting-now. **Schedule** list = schedule-capable (IMP-036I profile + merchandise with `ignoreCurrentScheduleDenial` parity) — **not** accepting-now-only. Viable Schedule sequence: Mode → timing-aware list (timing as **read input**, not `SCHEDULED`+null-window Checkout mutation) → bind outlet **without** `evaluateCheckout` → server windows → set SCHEDULED+window → evaluate → Review → prepare → pay. Never silent bind from browse (AS-34 / AS-41) |
| Select Schedule window | Server windows only once outlet is Checkout-confirmed; 30-minute slots; TZ/lead/hours/cutoff preserved; **no** Menu exact-slot list in V1; empty windows → honest recovery; Now offered only if accepting-now still eligible (AS-09 / AS-37) |
| Selected outlet becomes invalid | Revalidate; force reselect; no silent keep; customer recovers without fake promises (AS-36) |
| Timing step when outlet closed now | Now control disabled with reason when confirmed outlet is not accepting-now; Schedule remains if windows exist (AS-34) |
| Open Checkout Snapshot money vs browse evaluate | Reuse before browse-dependent computation; if Snapshot active but commercial-evaluation evidence missing **or** reuse probe throws → fail-closed — **never** divergent browse money (AS-39) |
| Pay | Existing prepare/pay path; Snapshot sealed; scheduled bind revalidation; no new backend lifecycle states |
| Change browse intent while PAYMENT_PENDING | Must **not** mutate that checkout; recovery first |
| Multi-tab | Each tab keeps its own presentation intent; each revalidates server facts; no cross-tab money/seal sync from sessionStorage |
| Implemented channels | In-app same primary meaning as web; WhatsApp same-meaning **when sending is configured** (adapter may be noop — do not claim always-on); email/SMS/push not in V1 |
| Workforce primary labels | Delivery / Takeaway |

## 8. Quality Attribute Profile (candidate)

| Attribute | Profile |
|---|---|
| Correctness | Checkout/payment/serviceability unchanged; presentation must not invent money/availability; pre-checkout quotes are server-authored and advisory; Now vs Schedule Takeaway gates match IMP-036H/I |
| Consistency | Cross-portal primary labels; LANG-1 contextual ops verbs; implemented channels same-meaning |
| Usability | Mobile-first bar + sheet; desktop integrated chrome; early Takeaway place clarity without fake fees or fake slots |
| Accessibility | Keyboard + SR for sheet/dialog; no jargon |
| Security / abuse | No client-authored payable; no speculative slots; BOLA on eligibility/evaluate; session races guarded; tab-scoped presentation |
| Privacy | Customer-safe outlet fields only; no hierarchy/legal dump; analytics PII-minimized |
| Operability | Ops retain precise task vocabulary |

## 9. Dependencies

- Accepted IMP-036H (mode / ASAP pickup), IMP-036I (scheduled windows incl. PICKUP+SCHEDULED),
  Cart/Checkout foundations
- Existing delivery-context, LocationSelector, serviceability, ASAP pickup eligibility domain,
  scheduled-pickup profile gates, cart evaluate, pickup-options, scheduled windows
- Parallel tracks **not** owned here: IMP-036J Founder UAT, ₹498 / #391B payment investigations,
  Nginx security verification

## 10. Open product items for Founder

| ID | Item | Disposition |
|---|---|---|
| UOE-DR-01 | Allocate future ROADMAP slice ID (not IMP-036J/K) **and** sequencing vs pending IMP-036J acceptance **and** IMP-036K (D-383 nextProductSlice). D-383 unaffected unless a new decision amends sequencing. One-active-slice rule applies. | DECISION_REQUIRED (R3) |
| UOE-DR-02 | Exact Menu-level scheduled window preview API | **INCORPORATED — DEFER in V1** (Founder recommendation) |
| UOE-DR-03 | Formal Product Definition Gate **and** Experience Gate verdicts on this package | Founder / process — NOT_PERFORMED |
| UOE-DR-04 | Implemented notification-channel consistency | **INCORPORATED — WhatsApp + in-app same-meaning in V1** (Founder recommendation); email/SMS/push and unbounded rewrite remain out of scope |
| UOE-DR-05 | Pre-checkout Takeaway eligibility + mode-sensitive Cart evaluate | **INCORPORATED — strengthen V1** (Founder recommendation); contracts in `06-…` refined by GP-01…GP-04; no second commercial authority |
| UOE-DR-06 | Confirm Schedule-capable Takeaway presentation (no Menu slots; no guaranteed availability) **and** classify the Checkout Mode→accepting-now-list→bind→evaluate(ASAP)→Timing composition as a defect vs IMP-036I Journey-I-C / AC-036I-040 (citing also US-036I-002 “IMP-036H rules” ambiguity). Choose remediation vehicle: (a) inside future UOE IMP after DR-01, or (b) standalone GREEN/AMBER defect fix against IMP-036I/H ahead of UOE. | DECISION_REQUIRED (recommended accept Schedule-capable + defect classification; vehicle choice is Founder) |

Companion: [`04-story-map-acceptance-scenarios.md`](./04-story-map-acceptance-scenarios.md),
[`12-template-completeness-addendum.md`](./12-template-completeness-addendum.md).
