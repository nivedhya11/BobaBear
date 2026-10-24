<!--
  AUTHORITY: NON_AUTHORITATIVE_IMPLEMENTATION_PLAN
  ID: UOE-TRANCHE-UX-C-1
  THIS_DOCUMENT_IS_A_PLAN: YES
  IMPLEMENTATION: NONE
  IMPLEMENTATION_AUTHORIZED: NO
  APPLICATION_CODE_MUTATION: NO
-->

# UX-C tranche contract and test matrix

```text
TRANCHE = T3 UX-C
CONTRACT_ID = UOE-TRANCHE-UX-C-1
PACKAGE = UOE-CANDIDATE-3
EXPERIENCE = XD-UOE-CANDIDATE-3 § UX-C
CONTRACT = D presentation, using A/B reads from UX-B
CHANGE_RISK = CR2; CR3 for PAYMENT_PENDING isolation and cross-tab money
EXPERIENCE_CRITICALITY = X3
STATUS = PLAN_ONLY
IMPLEMENTATION_AUTHORIZED = NO
DEPENDS_ON = UX-A labels + UX-B eligibility and evaluate contracts
DOES_NOT_IMPLEMENT = UOE-DR-06 Checkout composition
TESTS_EXECUTED = NONE
```

UX-C is the universal order-context bar, the tab-scoped coordinator, impact presentation,
and the client guard that sends pending-payment recovery to the existing route. It stores
no money and seals nothing.

## Scope

In a future authorized tranche:

- `OrderContextBar` on Menu, Cart, and Checkout. Mobile sticky strip; desktop header slot (`07-…` §7).
- Sheet or popover to edit How / Where / When. Focus trap, Escape, return focus (AS-13).
- Coordinator key `boba.order-context.v1` in tab-scoped `sessionStorage`. It dual-reads `boba.delivery-context.v1`. It stores no payable, no fee, and no sealed window (GP-04, AS-22).
- Place from the UX-B eligibility read. Propose is not confirm and is not Checkout bind (AS-05, AS-26, AS-38).
- Impact banner from mode-sensitive evaluate. Money paints only for the matching context key (AS-04, AS-16, AS-46, MC-12, MC-14, MC-15).
- On Checkout, the bar shows Checkout-owned mode, outlet, and timing and routes edits through Checkout APIs (AS-40). It does not repair the Schedule listing sequence; that is UOE-DR-06.
- Schedule at Menu remains UNCONFIRMED (AS-44, MC-06, MC-07, MC-21).
- `PAYMENT_PENDING`: client guard routes to the existing recovery path (MC-22, AS-17). Server freeze stays the existing one. This tranche adds no new server guard (§4.4 #8).
- Destructive mode switch confirms before clearing ineligible lines. Default action is cancel (MC-29, AS-20).
- Market orientation “Ordering in {market}” is not styled as Deliver to (MC-05, AS-01).
- MC-30 bar formatting closes at T3 Content QA.

Out of this tranche:

- Cross-tab presentation sync.
- Menu exact slots.
- Checkout pickup-options timing filter, bind-without-evaluate, and AS-34/AS-41.
- New payment or Checkout server guards.
- Analytics vendor, retention, and event emission. Hook intents in `07-…` stay intents until vendor and retention decisions in `16-…` §4 exist. Baseline capture stays `NOT_AUTHORIZED`.
- Storing digests or street addresses in the coordinator or in analytics.

## Invariants

| Invariant | Source |
|---|---|
| Presentation storage is not commercial authority | ARCH-G11; Contract D |
| Confirmed coordinates stay in `boba.delivery-context.v1` | Contract D |
| Duplicated tab may copy `sessionStorage` at open, then must revalidate | GP-04 |
| Browse must not mutate a `PAYMENT_PENDING` Checkout | AS-17; existing freeze |
| One payable paint per generation | §4.4 #14, AS-46 |
| Checkout Review remains the payable surface | Experience UX-C |
| No raw backend enum as the customer label | LANG-1; UX-A map |

## Files allowed later

Allowed only after implementation authorization. Proposed components are not created now.

| Path | Later change | Boundary |
|---|---|---|
| Proposed: `src/components/ordering/OrderContextBar.tsx` | Strip | No money fields in state that originate from storage |
| Proposed: `src/components/ordering/OrderContextSheet.tsx` | How / Where / When editor | |
| Proposed: `src/components/ordering/PlaceChooser.tsx` | Renders server eligibility | No invented outlets |
| Proposed: `src/components/ordering/ImpactBanner.tsx` | Server quote deltas | Hide on stale key |
| Proposed: `src/components/ordering/PendingPaymentGuard.tsx` | Routes to existing recovery | No new server mutation |
| Proposed: `src/lib/customer-ordering/order-context.ts` | `boba.order-context.v1` tab scope | Reject payable keys at the type boundary |
| `src/lib/customer-location/delivery-context.ts` | Dual-read | Do not fork coordinates into the order-context record |
| `src/components/ordering/OrderingCatalogClient.tsx` | Mount bar beside `DeliverToOrientation` | Orientation ≠ Deliver to |
| `src/components/ordering/CartClient.tsx` | Mount bar and impact | |
| `src/components/location/LocationSelector.tsx` | Only if the bar must open the existing selector | Do not add a second geo authority |
| `src/components/ordering/CheckoutClient.tsx` | Mount a read-only reflection of Checkout-owned mode/timing, and the pending guard | Do not edit `loadPickupOptions` or `continuePickupWithOutlet` |

## Files forbidden

Checkout listing and bind sequence (`20-…`), `pickup-options.ts`, `pickup-eligibility.ts` listing rules, `evaluate.ts` commercial engine (owned by UX-B), payment modules, schema, Meta templates, ROADMAP, STATE, decision register, capability architecture.

## Scenarios

| ID | Planned proof | Negative |
|---|---|---|
| AS-01 | Bar CTAs; orientation ≠ Deliver to; empty cart is not “no outlets” | Fake deliver-to |
| AS-12 | Sticky versus header at narrow and desktop widths | Untappable targets |
| AS-13 | Keyboard, names, focus return | Raw enums in accessible names |
| AS-14 | Address change revalidates | Second geo store |
| AS-17 | Guard routes; pending Checkout unchanged | Browse write under `PAYMENT_PENDING` |
| AS-20 | Confirm destructive clear; default cancel | Silent drop of lines |
| AS-21 | Reload restores non-PII intent | Completed checkout bleed |
| AS-22 | Two tabs diverge; no seal sync | Cross-tab payable |
| AS-40 | Under reuse, bar shows Checkout mode and timing | Browse total beside Checkout |
| AS-44 | No Menu slot and no final promo promise | Guaranteed window copy |
| AS-02, AS-04, AS-05, AS-06, AS-16, AS-26, AS-27, AS-46 | Presentation half of UX-B results | Stale money, silent bind, two payables |
| AS-34, AS-41 | Not this exit | Must stay RED until UOE-DR-06 |

## Negatives

| # | UX-C |
|---|---|
| 8 | Client route only, plus the existing server freeze tests. No new server guard |
| 14 | UI generation half |
| 15 | Yes. PLANNED dual-tab |
| 16 | No (UX-A) |
| 1–7, 9–13, 17–21 | No (UX-B) |
| SEC-BOLA-CHECKOUT | No (UOE-DR-06) |

## Evidence

| Item | Now | Later, if authorized |
|---|---|---|
| Component + a11y + responsive | PLANNED | EXECUTED on Menu, Cart, Checkout |
| Dual-tab script | PLANNED | EXECUTED |
| Pending guard with existing freeze | PLANNED | EXECUTED. Freeze proof is the existing suite plus a no-new-guard assertion |
| Analytics events | PLANNED intents | Blocked until vendor and retention are decided |
| Baseline ≥14 days | NOT_PERFORMED | Not authorized |
| Founder UAT | NOT_PERFORMED | Human, exact candidate, after independent review |

## Non-authorization

```text
IMPLEMENTATION_AUTHORIZED = NO
BAR_SHIPS_IN_THIS_COMMIT = NO
UOE_DR06_REMEDIATION = NOT_AUTHORIZED
ANALYTICS_VENDOR = UNKNOWN
RETENTION_DURATION = UNKNOWN
```
