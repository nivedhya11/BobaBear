<!-- AUTHORITY: NON_AUTHORITATIVE_DISCOVERY_DRAFT | PACKAGE: UOE-CANDIDATE-1 -->

# Story map and acceptance scenarios

```text
STATUS: DISCOVERY_DRAFT
AUTHORITY: NON_AUTHORITATIVE
STORIES: CANDIDATE_ONLY
DEFINITION_OF_READY: NOT_CLAIMED
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
    S-05 At Checkout: one Takeaway outlet proposed; confirm before bind
    S-06 At Checkout: multiple Takeaway outlets require explicit choice
    S-07 Unsupported Delivery address: browse OK; pay blocked with recovery
  Choose time
    S-08 Select Now (earliest available meaning)
    S-09 Select Schedule intent when ineligible (UNCONFIRMED + reason)
    S-10 Select exact window from server list when eligible checkout exists
    S-11 Outlet closed / Now unavailable / no windows recovery
  Cart confidence
    S-12 Preserve eligible lines across mode/location/time edits
    S-13 Surface fee / availability / offer changes from server evaluate (Checkout; pre-checkout may say “fees shown at checkout” under V1)
  Checkout & pay
    S-14 Authoritative Checkout Review before pay
    S-15 Window expires / terms drift → revalidate; no stale pay
    S-16 PAYMENT_PENDING isolated from new browse intent
    S-17 New order journey does not inherit prior Snapshot
  After order
    S-18 Confirmation / My Orders / tracking / notifications use same words

Workforce
  W-01 Lists/queues/details primary labels Delivery / Takeaway
  W-02 Collection task verbs without competing method labels
  W-03 Admin/scheduling may keep precise operational vocabulary
```

## Mandatory acceptance scenarios (AS-01 – AS-19)

Retained from design preparation. States to cover where relevant:
default / loading / empty / selected / disabled / error / recovery.

| ID | Scenario | Expect |
|---|---|---|
| AS-01 | No selected mode or location (browse Menu) | Catalog loads; bar honest about gaps; add-to-cart allowed; no fake confirmed address |
| AS-02 | Delivery → Takeaway | Mode intent switches; collection place replaces delivery place in chrome; **V1:** fee/offer impact authoritative at Checkout evaluate (not via inventing pre-checkout pickup-options); valid cart lines kept; ineligible lines explained (AS-20) |
| AS-03 | Takeaway → Delivery | Needs address/serviceability; fees/offers recompute at evaluate; unsupported area explained |
| AS-04 | Mode-dependent charges and offers | Clear attention copy; money from server evaluate/Snapshot only; pre-checkout may defer exact fees under V1 |
| AS-05 | One Takeaway outlet (Checkout) | Auto-proposed; customer confirm required before bind; not silently listed pre-checkout in V1 |
| AS-06 | Multiple Takeaway outlets (Checkout) | Explicit select; no silent nearest invent |
| AS-07 | Unsupported Delivery address | Browse OK; checkout/pay blocked with recovery |
| AS-08 | Outlet closed / Now unavailable | Explain; Schedule alternatives or empty recovery |
| AS-09 | No Schedule windows | Empty + recovery; Now if eligible |
| AS-10 | Cross-midnight / local-time formatting | Today/Tomorrow + labels match outlet TZ |
| AS-11 | Window expires before payment | Revalidate; force reselect; no stale Snapshot pay |
| AS-12 | Mobile / desktop bar | Sticky strip + sheet vs header + popover/dialog |
| AS-13 | Keyboard / SR / a11y | Focus trap; pressed/selected; no jargon |
| AS-14 | Saved address / location change | Context updates; serviceability refresh; no duplicate geo authority |
| AS-15 | Authentication / session changes | Intent preserved safely; revalidate; cart merge rules unchanged (D-370) |
| AS-16 | Cart revisions and stale async responses | Generation/race protection; truthful conflicts |
| AS-17 | Pending historical payment | `PAYMENT_PENDING` frozen; browse cannot rewrite; recovery first |
| AS-18 | New order versus previous checkout | Fresh context; no bleed from prior Snapshot |
| AS-19 | Workforce vs customer terminology | Primary labels Delivery / Takeaway both sides; ops collection verbs contextual |
| AS-20 | Ineligible lines on mode switch | Invalid lines not silently kept as payable; explain removal/unavailable; destructive clear needs confirmation/explanation |
| AS-21 | Revisit / reload / completed checkout | Bar restores safe non-personal intent; completed/expired checkout does not bleed into new journey |
| AS-22 | Multi-tab divergent intent | Last-write/generation rules; no silent cross-tab money; no auto-create Checkout from bar intent alone |
| AS-23 | CHECKOUT_EXPIRED mid-schedule | Force recovery/reselect; no pay on expired checkout window |

## Challenge coverage matrix

| Challenge case | Covered by |
|---|---|
| No selected mode or location | AS-01 |
| One / multiple Takeaway outlets | AS-05, AS-06 |
| Unsupported Delivery address | AS-07 |
| Outlet closed and Now unavailable | AS-08 |
| No Schedule windows | AS-09 |
| Cross-midnight / local-time formatting | AS-10 |
| Window expires before payment | AS-11 |
| Mode-dependent delivery charges and offers | AS-04 |
| Cart revisions and stale async responses | AS-16 |
| Authentication / session changes | AS-15 |
| Pending historical payment | AS-17 |
| New order versus previous checkout | AS-18 |
| Workforce vs customer terminology consistency | AS-19 |
| Mobile accessibility and keyboard navigation | AS-12, AS-13 |
| Unconfirmed Schedule at Menu | S-09 + refinement C |
| Dehradun orientation ≠ confirmed address | S-03 + refinement B |
| Ineligible lines / reload / multi-tab / expired | AS-20–AS-23 |
| Takeaway Schedule with unconfirmed AUTO_SELECT outlet | S-09 + eligible-context rule (no windows) |

## Definition of Ready (candidate checklist — not claimed passed)

- [ ] Product Definition Gate evaluated
- [ ] Experience Gate evaluated
- [ ] Architecture Fit after gates
- [ ] Design Readiness after Fit
- [ ] Quality / Test Plan finalized
- [ ] Measurement Plan finalized (X3)
- [ ] Future IMP identity allocated by R3
- [ ] Implementation authorization explicit
