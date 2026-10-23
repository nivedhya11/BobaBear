<!-- AUTHORITY: NON_AUTHORITATIVE_DISCOVERY_DRAFT | PACKAGE: UOE-CANDIDATE-1 -->

# Business outcome, personas, and journeys

```text
STATUS: DISCOVERY_DRAFT
AUTHORITY: NON_AUTHORITATIVE
FORMAL_IMP_IDENTITY: NOT_ALLOCATED
```

## Business outcome

Customers and workforce share one clear mental model for **how**, **where**, and **when** an
order happens — before money is committed — without inventing availability, fees, ETAs, or
payable amounts on the client.

Success looks like:

- Earlier, truthful How / Where / When reduces checkout hesitation and wrong-mode orders
- Schedule completion is faster and calmer than the long grid, without fake slots
- Delivery and Takeaway are equally first-class in chrome (no delivery-only bias)
- Checkout remains zero-surprise: Snapshot and payment authority unchanged
- Operators see the same primary order-type labels customers do, with contextual collection language where tasks require it

Non-outcomes (explicit):

- No claimed conversion lift percentage
- No open-ended site rewrite (#379 remains broader discovery)
- No domain enum, API, schema, event, or historical architecture rename
- No replacement of Checkout Snapshot money authority, payment idempotency, reconciliation,
  serviceability, order materialization, or accepted fulfilment contracts

Evidence class for direction: `FOUNDER_HEURISTIC_REVIEW` (Founder conversation + #379 / #380).
Not customer research. Not conversion proof. Pre-GTM audit: `NOT_PERFORMED`.

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
J3 Takeaway with one or many outlets + Collection time
J4 Schedule Today/Tomorrow from server windows only
J5 Change mode/location/time before payment; fees/offers recompute server-side
J6 Resume or recover PAYMENT_PENDING without browse rewrite
J7 Workforce: list/detail uses Delivery / Takeaway; task actions use collection verbs
```

Journey ownership:

| Phase | Presentation owner | Commercial / domain owner |
|---|---|---|
| Menu / Cart browsing | Coordinated order-context presentation state | Cart lines + evaluate; serviceability / pickup eligibility |
| Checkout pre-pay | Same bar + checkout steps as confirmation UI | Checkout revision, destination/outlet, timing, evaluate |
| Payment | Recovery / payment UI | Payment + Snapshot seal; bind revalidation |
| Post-order | Confirmation / My Orders / tracking / notifications | Order projection of sealed Snapshot |
| Workforce | Order lists / queues / details / ops | Existing operations authorities |

## Bound relative to #379

#379 authorizes mobile-first discovery broadly. This candidate **bounds** delivery to UX-A
(terminology), UX-B (compact scheduling), and UX-C (universal order-context bar) on
Menu → Cart → Checkout, plus consistent post-order and workforce primary labels.

Broader home/editorial redesign, unbounded design-system rewrite, and inventing Drops rules
remain out of this candidate.
