<!--
  AUTHORITY: NON_AUTHORITATIVE_IMPLEMENTATION_PLAN
  ID: UOE-TRANCHE-UX-B-1
  THIS_DOCUMENT_IS_A_PLAN: YES
  IMPLEMENTATION: NONE
  IMPLEMENTATION_AUTHORIZED: NO
  UOE_DR_06_REMEDIATION: NOT_AUTHORIZED
  SCHEMA_AUTHORIZED: NO
  APPLICATION_CODE_MUTATION: NO
-->

# UX-B tranche contract and test matrix

```text
TRANCHE = T2 UX-B
CONTRACT_ID = UOE-TRANCHE-UX-B-1
PACKAGE = UOE-CANDIDATE-3
EXPERIENCE = XD-UOE-CANDIDATE-3 § UX-B
CONTRACTS = A pre-checkout eligibility + B mode-sensitive Cart evaluate
CHANGE_RISK = CR2; CR3 where open-Checkout reuse and quote versus Snapshot meet payment
EXPERIENCE_CRITICALITY = X3
STATUS = PLAN_ONLY
IMPLEMENTATION_AUTHORIZED = NO
SCHEMA_FOR_CART_PROVENANCE = NOT_AUTHORIZED
CHECKOUT_COMPOSITION = EXCLUDED (20-uoe-dr-06-test-first-work-package.md)
TESTS_EXECUTED = NONE
```

UX-B is compact scheduling presentation plus the locked Contract A and Contract B server
reads and quotes. Eligible-checkout exact windows stay on the accepted scheduled-window
API. Menu exact slots stay deferred (UOE-DR-02). Checkout’s accepting-now-only composition
is not this tranche.

Depends on UX-A labels. Does not wait on UOE-DR-06 to specify Menu and pre-checkout
behaviour. Cannot claim AS-34 or AS-41.

## Scope

In a future authorized tranche:

- `TimingChooser` as a reusable control: Now | Schedule, then at eligible checkout Today/Tomorrow and the server window list. Mobile sheet, desktop popover (`03-…`, `07-…`).
- Now means earliest available. Protective sentence is MC-03.
- Menu and pre-checkout Schedule stay UNCONFIRMED. Copy is MC-06, MC-07, MC-08, MC-09, MC-10, MC-21. No exact slot on Menu.
- Pre-checkout Takeaway eligibility read composed from existing accepting-now eligibility and schedule-capable profile foundations (Contract A). Timing intent is an input. Schedule is not denied solely because the outlet is closed now (AS-08 Menu/eligibility). Exact HTTP path string stays deferred (capability §6).
- Cart evaluate accepts optional mode and outlet, and `fulfilmentTiming=ASAP` only when Now was supplied. Schedule UNCONFIRMED omits timing. Client `SCHEDULED` on CART evaluate is 400 (Contract B, §4.4 #20).
- Open-Checkout reuse runs before the Delivery-location early return. Verified today: `evaluateCart` in `src/server/cart/evaluate.ts` returns `REQUIRES_FULFILMENT_CONTEXT` when `parsed.location` is absent, before `tryReusableCheckoutEvaluation`. That order is the GP-02 gap to correct under this tranche once authorized. Takeaway quotes must not require a Delivery address (AS-31).
- Missing commercial-evaluation evidence fails closed (AS-39, AS-45). Stale context keys drop money (AS-46).
- Provisional Offers: mode-gated offers follow mode; timing-gated offers do not lock at Menu while Schedule is UNCONFIRMED (AS-42, AS-43, MC-11, MC-13).
- Empty cart and no cart stay distinct from UNAVAILABLE (AS-30, MC-23).
- Secondary strings MC-08, MC-09, MC-12, MC-14, MC-23–MC-27, MC-30 close at T2 Content QA.

Out of this tranche:

- `CheckoutClient` bind → immediate `evaluateCheckout` → then Timing. That sequence is UOE-DR-06.
- Changing `listCheckoutPickupOptions` / `listEligiblePickupOutletsForCheckout` off accepting-now. That listing is UOE-DR-06.
- Writing `SCHEDULED` with a null window to unlock a list (capability §3.3).
- Menu exact-slot preview API (UOE-DR-02).
- New Order or Checkout lifecycle states.
- New `PAYMENT_PENDING` server guards.
- CART provenance columns and digest persistence until a separate schema authorization (AS-32, §4.4 #21). The plan names the tests; it does not authorize the migration.
- Payment provider, prepare/pay authority, Snapshot sealing rules.

## Invariants

| Invariant | Source |
|---|---|
| Evaluate does not seal and cannot pay | Contract B |
| Guest gets no reused Snapshot money | §4.4 #11 |
| Client money, digest, fingerprint, `evaluationId` rejected | §4.4 #7; ARCH-G11 |
| Reuse comparator for CHECKOUT stays fingerprint-only | §4.4 #19 |
| Digest and location HMAC stay off client responses and logs | §4.3, §4.4 #17 |
| V1 measurement location HMAC stays null | §4.3, §4.4 #21 |
| Eligibility is cart-credential scoped; empty outlets without a lined cart | Contract A; §4.4 #1–#3 |
| One generic problem code for cross-brand and ineligible outlet | §4.4 #4 |
| Rate limits and per-process residual | Capability §4.1 `ACCEPTED_FOR_V1_PILOT` |
| Budgets are quality targets: eligibility p95 ≤ 300 ms, evaluate p95 ≤ 500 ms, reuse hit ≤ 400 ms server-side | §4.2. Breach degrades calmly |
| No second commercial authority | ARCH-G05, ARCH-G11 |

## Files allowed later

Allowed only after implementation authorization. None are edited by this plan.

| Path | Later change | Boundary |
|---|---|---|
| `src/server/cart/evaluate.ts` | Reuse before location early return; strict allowlist; ASAP-only timing input; 400 on client `SCHEDULED` | Do not seal, do not mutate Checkout, do not apply SCHEDULED-only promotions from browse |
| `src/server/cart/index.ts` | Re-export only if the evaluate entry signature requires it | |
| Existing scheduled eligibility module used by `listCheckoutScheduledWindows` (`src/server/checkout/scheduled-customer.ts` and `scheduled-eligibility` foundations) | Read/reuse for checkout-eligible windows | Do not expose windows on Menu; do not change IMP-036I window math |
| `src/server/checkout/pickup-eligibility.ts` | Read the accepting-now gate when composing a **pre-checkout** Now list | Do not replace the Checkout listing path here. Schedule-capable Checkout listing is `20-…` |
| Future pre-checkout eligibility handler | New read. Path string not locked | No fabricated `checkoutId`. No non-empty outlets without a resolvable lined cart |
| Future client for that read | Call the new read | No client-invented outlets |
| Proposed, not created: `src/components/ordering/TimingChooser.tsx` | Compact chooser | Menu mode shows UNCONFIRMED only |
| `src/lib/customer-location/delivery-context.ts` | Read confirmed coordinates | Do not fork a second geo store |
| Future evaluate client allowlist | Send only authorized fields | |

## Files forbidden in UX-B

| Path | Why |
|---|---|
| `src/components/ordering/CheckoutClient.tsx` composition functions `chooseFulfilmentMode`, `loadPickupOptions`, `continuePickupWithOutlet`, `openTiming`, `confirmTiming` | UOE-DR-06 |
| `src/server/checkout/pickup-options.ts` | UOE-DR-06 listing |
| `src/server/customer-commerce/http/router.ts` pickup-options route behaviour | UOE-DR-06 |
| Payment prepare/pay modules | Existing payment authority |
| `drizzle/**` | Schema not authorized |
| Capability architecture, ROADMAP, STATE, decision register | Locked or lifecycle authority |

## Scenarios

| ID | In UX-B exit | Evidence | Negative |
|---|---|---|---|
| AS-08 Menu / pre-checkout | Yes | Schedule-capable eligibility when closed now | Denying Schedule only because closed now |
| AS-08 Checkout list | No | `BLOCKED_DR06` | — |
| AS-09 non-Checkout empty windows | Yes | Honest empty + recovery | Invented slots |
| AS-09 Checkout composition | No | `BLOCKED_DR06` | — |
| AS-10 | Yes | Outlet timezone Today/Tomorrow | Wrong zone |
| AS-11 | Yes | Expired window forces reselect | Pay on expired window |
| AS-23 | Yes | `CHECKOUT_EXPIRED` recovery | Pay expired checkout |
| AS-24 | Yes | HTTP/domain/auth for the pre-checkout read | Fabricated `checkoutId` |
| AS-25 | Yes | Advisory quote ≠ Snapshot | Quote treated as seal |
| AS-26 | Yes | Proposed outlet does not list windows | AUTO_SELECT unlocks slots |
| AS-27 | Yes | Overlapping evaluates; one payable | Two payables in one generation |
| AS-29 | Yes | Reuse wins; Checkout mode conveyed | Divergent browse money |
| AS-30 | Yes | `cartState` distinct from UNAVAILABLE | “No outlets” for an empty cart |
| AS-31 | Yes | Takeaway quote without Delivery address | Invented brand-level money |
| AS-32 | Specified, schema-gated | Digest tests run only with schema authorization | Equal-money wrong reuse |
| AS-33 pre-checkout | Yes | Error ≠ permanent UNAVAILABLE | — |
| AS-33 Checkout pickup-options | No | `BLOCKED_DR06` | — |
| AS-35, AS-36, AS-37 Checkout paths | No | `BLOCKED_DR06` | — |
| AS-38 | Yes | Confirm required before bind | Browse sets `pickupOutletId` |
| AS-39, AS-45 | Yes | Fail closed | Browse total as payable |
| AS-42, AS-43 | Yes | Mode match; omit CART `SCHEDULED` | Locked Menu savings for an unconfirmed window |
| AS-02, AS-03, AS-04, AS-05, AS-06, AS-07, AS-15, AS-16, AS-18 | Server/quote half | Integration as in `08-…` | Client-invented fees, outlets, or serviceability |
| AS-34, AS-41 | No | RED until UOE-DR-06 | — |

## Negatives

| # | UX-B |
|---|---|
| 1, 2, 3, 4, 5, 6, 7 | Yes. PLANNED |
| 9, 10, 11 | Yes. #9 waits on persistence authorization |
| 12, 13, 14 | Yes. #14 shared with UX-C paint |
| 17, 18, 19, 20 | Yes |
| 21 | Specified. Executes only with schema authorization |
| 8, 15, 16 | No (UX-C, UX-C, UX-A) |
| SEC-BOLA-CHECKOUT | No. UOE-DR-06 |

Layers when authorized: unit, domain, HTTP, auth, concurrency with real overlap, recovery.
Database integration only if schema authorization exists. Component tests cover `TimingChooser`.
E2E for this tranche does not claim the closed-now Checkout journey.

## Evidence

| Item | Now |
|---|---|
| Every row above | PLANNED |
| Payment prepare/pay | Not proven by these quotes |
| Perf budgets | PLANNED harness; not an entitlement |

## Non-authorization

```text
IMPLEMENTATION_AUTHORIZED = NO
SCHEMA_AUTHORIZED = NO
UOE_DR06_REMEDIATION = NOT_AUTHORIZED
MENU_EXACT_SLOTS = DEFERRED
```
