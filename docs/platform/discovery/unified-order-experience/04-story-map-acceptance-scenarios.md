<!-- AUTHORITY: NON_AUTHORITATIVE_DISCOVERY_DRAFT | PACKAGE: UOE-CANDIDATE-2 -->

# Story map and acceptance scenarios

```text
STATUS: DISCOVERY_DRAFT
AUTHORITY: NON_AUTHORITATIVE
STORIES: CANDIDATE_ONLY
DEFINITION_OF_READY: NOT_CLAIMED
PACKAGE: UOE-CANDIDATE-2
VARIANT: PRECHECKOUT_ELIGIBILITY_WEB_FIRST_V1
```

## Story map

```text
Customer
  Navigate with order context
    S-01 See How / Where / When on Menu, Cart, Checkout
    S-02 Browse without address or sign-in
    S-03 Distinguish market orientation vs confirmed Deliver to
  Choose method
    S-04 Select Delivery or Takeaway intent from bar; confirm at checkout
    S-05 Pre-checkout: server Takeaway eligibility proposes/lists outlets (DR-05)
    S-06 At Checkout: confirm proposed / selected outlet before bind
    S-07 Multiple Takeaway outlets require explicit choice
    S-08 Unsupported Delivery address: browse OK; pay blocked with recovery
  Choose time
    S-09 Select Now (earliest available meaning)
    S-10 Select Schedule intent when ineligible (UNCONFIRMED + reason) — no Menu exact slots (DR-02)
    S-11 Select exact window from server list when eligible checkout exists
    S-12 Outlet closed / Now unavailable / no windows recovery
  Cart confidence
    S-13 Preserve eligible lines across mode/location/time edits
    S-14 Mode-sensitive server Cart evaluate surfaces fee / availability / offer changes (DR-05)
  Checkout & pay
    S-15 Authoritative Checkout Review before pay
    S-16 Window expires / terms drift → revalidate; no stale pay
    S-17 PAYMENT_PENDING isolated from new browse intent
    S-18 New order journey does not inherit prior Snapshot
  After order
    S-19 Confirmation / My Orders / tracking / WhatsApp + in-app use same words (DR-04)

Workforce
  W-01 Lists/queues/details primary labels Delivery / Takeaway
  W-02 Collection task verbs without competing method labels
  W-03 Admin/scheduling may keep precise operational vocabulary
```

## Mandatory acceptance scenarios (AS-01 – AS-29)

States to cover where relevant: default / loading / empty / selected / disabled / error / recovery.

| ID | Scenario | Expect |
|---|---|---|
| AS-01 | No selected mode or location (browse Menu) | Catalog loads; bar honest about gaps; add-to-cart allowed; no fake confirmed address |
| AS-02 | Delivery → Takeaway | Mode intent switches; collection place chrome from **server eligibility**; mode-sensitive **cart evaluate** quote updates; valid cart lines kept; ineligible lines explained (AS-20); no client-invented outlets/fees |
| AS-03 | Takeaway → Delivery | Needs address/serviceability; fees/offers recompute via server evaluate; unsupported area explained |
| AS-04 | Mode-dependent charges and offers | Clear attention copy; money from server cart evaluate / checkout evaluate / Snapshot only; pre-checkout quote is advisory |
| AS-05 | One Takeaway outlet (pre-checkout + Checkout) | Server `AUTO_SELECT` may propose pre-checkout; customer confirm required before Checkout bind; not silently bound from browse |
| AS-06 | Multiple Takeaway outlets | Explicit select from server list; no silent nearest invent |
| AS-07 | Unsupported Delivery address | Browse OK; checkout/pay blocked with recovery |
| AS-08 | Outlet closed / Now unavailable | **Delivery:** explain; Schedule if server windows exist; else empty recovery. **Takeaway:** accepting-now eligibility; closed outlet → UNAVAILABLE + honest recovery; no Schedule-for-later Takeaway path in V1 |
| AS-09 | No Schedule windows | Empty + recovery; Now if eligible |
| AS-10 | Cross-midnight / local-time formatting | Today/Tomorrow + labels match outlet TZ |
| AS-11 | Window expires before payment | Revalidate; force reselect; no stale Snapshot pay |
| AS-12 | Mobile / desktop bar | Sticky strip + sheet vs header + popover/dialog |
| AS-13 | Keyboard / SR / a11y | Focus trap; pressed/selected; no jargon |
| AS-14 | Saved address / location change | Context updates; serviceability refresh; no duplicate geo authority |
| AS-15 | Authentication / session changes | Intent preserved safely; revalidate eligibility; cart merge rules unchanged (D-370) |
| AS-16 | Cart revisions and stale async responses | Generation/race protection; truthful conflicts; stale eligibility/evaluate discarded |
| AS-17 | Pending historical payment | `PAYMENT_PENDING` frozen; browse cannot rewrite; recovery first |
| AS-18 | New order versus previous checkout | Fresh context; no bleed from prior Snapshot |
| AS-19 | Workforce vs customer terminology | Primary labels Delivery / Takeaway both sides; ops collection verbs contextual |
| AS-20 | Ineligible lines on mode switch | Invalid lines not silently kept as payable; explain removal/unavailable; destructive clear needs confirmation/explanation |
| AS-21 | Revisit / reload / completed checkout | Bar restores safe non-personal intent; completed/expired checkout does not bleed into new journey |
| AS-22 | Multi-tab divergent intent | Last-write/generation rules; no silent cross-tab money; no auto-create Checkout from bar intent alone |
| AS-23 | CHECKOUT_EXPIRED mid-schedule | Force recovery/reselect; no pay on expired checkout window |
| AS-24 | Pre-checkout Takeaway eligibility read | Server returns outlets + selectionPolicy; UI reflects UNAVAILABLE / AUTO_SELECT propose / CUSTOMER_SELECT; no checkoutId fabrication |
| AS-25 | Mode-sensitive Cart evaluate | With Takeaway (+ outlet) or Delivery (+ location), quote updates from server; PICKUP does not invent delivery fee; quote ≠ Snapshot |
| AS-26 | Proposed outlet ≠ confirmed place for windows | Schedule exact windows remain blocked until Checkout-confirmed outlet; UNCONFIRMED reason shown |
| AS-27 | Eligibility / evaluate race | Stale responses ignored; fingerprint/revision mismatch drops mirrors; latest server result wins |
| AS-28 | Implemented channel consistency (DR-04) | In-app + WhatsApp content via `customer-visible-content` uses Delivery/Takeaway/Now/Schedule same-meaning; no Pickup-as-peer; no customer “fulfilment window”; email/SMS/push out of scope while non-sending |
| AS-29 | Open Checkout mode ≠ browse intent | Cart evaluate reuses open Checkout / Snapshot quote for same cart revision (`reusedCheckoutEvaluation`); UI shows Checkout mode as authoritative; PAYMENT_PENDING never recomputed to a divergent browse mode |

## Challenge coverage matrix

| Challenge case | Covered by |
|---|---|
| No selected mode or location | AS-01 |
| One / multiple Takeaway outlets | AS-05, AS-06, AS-24 |
| Unsupported Delivery address | AS-07 |
| Outlet closed and Now unavailable | AS-08 (mode-split) |
| No Schedule windows | AS-09 |
| Cross-midnight / local-time formatting | AS-10 |
| Window expires before payment | AS-11 |
| Mode-dependent delivery charges and offers | AS-04, AS-25 |
| Cart revisions and stale async responses | AS-16, AS-27 |
| Authentication / session changes | AS-15 |
| Pending historical payment | AS-17 |
| New order versus previous checkout | AS-18 |
| Workforce vs customer terminology consistency | AS-19 |
| Mobile accessibility and keyboard navigation | AS-12, AS-13 |
| Unconfirmed Schedule at Menu (no exact slots) | S-10 + UOE-DR-02 |
| Dehradun orientation ≠ confirmed address | S-03 + refinement B |
| Ineligible lines / reload / multi-tab / expired | AS-20–AS-23 |
| Takeaway Schedule with unconfirmed AUTO_SELECT outlet | AS-26 |
| Pre-checkout eligibility without second money authority | AS-24, AS-25 |
| Implemented channel terminology | AS-28 |
| Open Checkout vs browse mode conflict | AS-29 |

## Definition of Ready (candidate checklist — not claimed passed)

- [ ] Product Definition Gate evaluated
- [ ] Experience Gate evaluated
- [ ] Architecture Fit after gates
- [ ] Design Readiness after Fit
- [ ] Quality / Test Plan finalized
- [ ] Measurement Plan finalized (X3)
- [ ] Future IMP identity allocated by R3
- [ ] Implementation authorization explicit
