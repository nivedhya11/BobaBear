<!-- AUTHORITY: NON_AUTHORITATIVE_DISCOVERY_DRAFT | PACKAGE: UOE-CANDIDATE-3 -->

# Business outcome, personas, and journeys

```text
STATUS: DISCOVERY_DRAFT
AUTHORITY: NON_AUTHORITATIVE
FORMAL_IMP_IDENTITY: NOT_ALLOCATED
PACKAGE: UOE-CANDIDATE-3
VARIANT: PRECHECKOUT_ELIGIBILITY_WEB_FIRST_V1
GATE_PRECISION_REVISION: YES
```

## Business outcome

Customers and workforce share one clear mental model for **how**, **where**, and **when** an
order happens — before money is committed — without inventing availability, fees, ETAs, or
payable amounts on the client. Server-authoritative Takeaway outlet eligibility (Now vs
Schedule-capable) and mode-sensitive Cart quotes may inform browsing earlier; Checkout Snapshot
remains the sealed commercial authority.

Success looks like:

- Earlier, truthful How / Where / When reduces checkout hesitation and wrong-mode orders
- Takeaway collection place options are server-true before Checkout bind (propose ≠ bind)
- Closed-now does not falsely deny Schedule Takeaway when accepted IMP-036I supports it
- Mode-sensitive fees/offers/availability appear as server quotes before pay, with Review as final authority
- Schedule completion is faster and calmer than the long grid, without fake Menu slots (exact
  Menu slots deferred)
- Empty / first-use never shows “no outlets” merely because the customer has not added items
- Delivery and Takeaway are equally first-class in chrome (no delivery-only bias)
- Implemented notification channels (in-app; WhatsApp when sending is configured) use the same primary words as web
- Checkout remains zero-surprise: Snapshot and payment authority unchanged
- Operators see the same primary order-type labels customers do, with contextual collection language where tasks require it

Non-outcomes (explicit):

- No claimed conversion lift percentage
- No open-ended site rewrite (#379 remains broader discovery)
- No domain enum, API, schema, event, or historical architecture rename
- No replacement of Checkout Snapshot money authority, payment idempotency, reconciliation,
  serviceability, order materialization, or accepted fulfilment contracts
- No second commercial authority parallel to Snapshot / checkout evaluate

Evidence class for direction: `FOUNDER_HEURISTIC_REVIEW` plus Founder review recommendations
for UOE-DR-02 / UOE-DR-04 / UOE-DR-05. Not customer research. Not conversion proof.
Pre-GTM audit: `NOT_PERFORMED`.

## Personas

| Persona | Job | Trust need |
|---|---|---|
| Hungry customer (mobile-first) | Browse Menu, decide Delivery or Takeaway, choose Now or Schedule, pay without surprises | Clear promise; no fake address/time; calm recovery |
| Returning customer | Reuse saved address / known outlet; change mode or time without losing cart | Preserve valid lines; explain fee/offer changes |
| Store operator | See Delivery vs Takeaway queues; prepare / hand over collection orders | Same primary labels; precise task verbs |
| Brand / store admin | Configure hours, lead time, pickup profile, scheduled policy | Operational vocabulary OK in admin; not customer chrome |
| Support / Founder ops | Diagnose wrong-mode, stale window, pending payment | Domain truth available; customer words for explanation |

## Golden journeys (candidate)

```text
J1 Browse → bar intent → Cart → Checkout Review → Pay → Confirmation → My Orders
J2 Delivery with confirmed address + Now
J3 Takeaway with server eligibility (one or many outlets; Now vs Schedule-capable) + Collection time
J4 Schedule Today/Tomorrow from server windows only (eligible checkout; no Menu exact slots)
J5 Change mode/location/time before payment; fees/offers recompute server-side (cart evaluate quote → Checkout evaluate; open-Checkout reuse when applicable)
J6 Resume or recover PAYMENT_PENDING without browse rewrite
J7 Workforce: list/detail uses Delivery / Takeaway; task actions use collection verbs
```

Journey ownership:

| Phase | Presentation owner | Commercial / domain owner |
|---|---|---|
| Menu / Cart browsing | Coordinated order-context presentation state (tab-scoped) | Cart lines + mode-sensitive evaluate quote; serviceability / Now vs Schedule-capable eligibility reads |
| Checkout pre-pay | Same bar + checkout steps as confirmation UI | Checkout revision, destination/outlet bind, timing, evaluate |
| Payment | Recovery / payment UI | Payment + Snapshot seal; bind revalidation |
| Post-order | Confirmation / My Orders / tracking / implemented notifications | Order projection of sealed Snapshot |
| Workforce | Order lists / queues / details / ops | Existing operations authorities |

## Bound relative to #379

#379 authorizes mobile-first discovery broadly. This candidate **bounds** delivery to UX-A
(terminology), UX-B (compact scheduling), and UX-C (universal order-context bar) on
Menu → Cart → Checkout, plus consistent post-order / implemented-channel and workforce primary
labels, and the DR-05 server read/quote contracts.

Broader home/editorial redesign, unbounded design-system rewrite, inventing Drops rules, and
Menu exact-slot preview APIs remain out of this candidate.
