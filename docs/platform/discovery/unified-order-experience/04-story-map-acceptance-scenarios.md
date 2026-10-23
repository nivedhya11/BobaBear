<!-- AUTHORITY: NON_AUTHORITATIVE_DISCOVERY_DRAFT | PACKAGE: UOE-CANDIDATE-3 -->

# Story map and acceptance scenarios

```text
STATUS: DISCOVERY_DRAFT
AUTHORITY: NON_AUTHORITATIVE
STORIES: CANDIDATE_ONLY
DEFINITION_OF_READY: NOT_CLAIMED
PACKAGE: UOE-CANDIDATE-3
VARIANT: PRECHECKOUT_ELIGIBILITY_WEB_FIRST_V1
GATE_PRECISION_REVISION: YES
```

## Story map

```text
Customer
  Navigate with order context
    S-01 See How / Where / When on Menu, Cart, Checkout
    S-02 Browse without address or sign-in (and without cart lines)
    S-03 Distinguish market orientation vs confirmed Deliver to
  Choose method
    S-04 Select Delivery or Takeaway intent from bar; confirm at checkout
    S-05 Pre-checkout: server Takeaway eligibility proposes/lists outlets (DR-05; Now vs Schedule-capable)
    S-06 At Checkout: timing-aware pickup-options + confirm proposed / selected outlet before bind
    S-07 Multiple Takeaway outlets require explicit choice
    S-08 Unsupported Delivery address: browse OK; pay blocked with recovery
  Choose time
    S-09 Select Now (earliest available meaning)
    S-10 Select Schedule intent when ineligible (UNCONFIRMED + reason) — no Menu exact slots (DR-02)
    S-11 Select exact window from server list when eligible checkout exists
    S-12 Outlet closed / Now unavailable / Schedule-capable Takeaway / no windows / invalid outlet recovery (AS-34–38)
  Cart confidence
    S-13 Preserve eligible lines across mode/location/time edits
    S-14 Mode-sensitive server Cart evaluate surfaces fee / availability / offer changes (DR-05)
    S-14b Takeaway cart quote without Delivery address; open-Checkout reuse + missing-evidence fail-closed (GP-02 / AS-39 / AS-45)
    S-14c Timing-sensitive advisory quotes + provisional Offers when Schedule UNCONFIRMED (AS-42–44)
    S-14d Evaluate fingerprint / mode-timing-outlet provenance / dedup (AS-32 / AS-46)
  Checkout & pay
    S-15 Authoritative Checkout Review before pay (evaluate after SCHEDULED+window; then prepare)
    S-15b Eligible-Checkout Scheduled Takeaway journey when closed now (AS-34 / AS-41)
    S-16 Window expires / terms drift → revalidate; no stale pay
    S-17 PAYMENT_PENDING isolated from new browse intent
    S-18 New order journey does not inherit prior Snapshot
  After order
    S-19 Confirmation / My Orders / tracking / in-app (+ WhatsApp when sending) use same words (DR-04)

Workforce
  W-01 Lists/queues/details primary labels Delivery / Takeaway
  W-02 Collection task verbs without competing method labels
  W-03 Admin/scheduling may keep precise operational vocabulary
```

## Mandatory acceptance scenarios (AS-01 – AS-46)

States to cover where relevant: default / loading / empty / selected / disabled / error / recovery.

**Defect vs improvement:** AS-34 / AS-41 prove remediation of the **candidate Checkout composition
defect** (accepting-now-only list **and** post-bind `evaluateCheckout` under default ASAP before
Timing; Founder confirms classification under UOE-DR-06). AS-35–AS-38 are recovery / invariant
proofs around that path. AS-39–AS-40 / AS-45–46 prove cart-evaluate Snapshot precedence /
missing-evidence fail-closed + fingerprint/dedup. AS-42–44 prove timing-sensitive advisory
quotes / provisional Offers without Menu guarantees. Compact chrome polish remains future UX
improvement, not proof that the defect exists.

| ID | Scenario | Expect |
|---|---|---|
| AS-01 | No selected mode or location (browse Menu) | Catalog loads; bar honest about gaps; add-to-cart allowed; no fake confirmed address; no “no outlets” solely because no cart lines |
| AS-02 | Delivery → Takeaway | Mode intent switches; collection place chrome from **server eligibility**; mode-sensitive **cart evaluate** quote updates; valid cart lines kept; ineligible lines explained (AS-20); no client-invented outlets/fees |
| AS-03 | Takeaway → Delivery | Needs address/serviceability; fees/offers recompute via server evaluate; unsupported area explained |
| AS-04 | Mode-dependent charges and offers | Clear attention copy; money from server cart evaluate / checkout evaluate / Snapshot only; pre-checkout quote is advisory |
| AS-05 | One Takeaway outlet (pre-checkout + Checkout) | Server `AUTO_SELECT` may propose **per timing intent** only (never over a Now∪Schedule union); customer confirm required before Checkout bind; not silently bound from browse; when timing unset + flags, no AUTO_SELECT / no client pre-select |
| AS-06 | Multiple Takeaway outlets | Explicit select from server list; no silent nearest invent |
| AS-07 | Unsupported Delivery address | Browse OK; checkout/pay blocked with recovery |
| AS-08 | Outlet closed / Now unavailable (GP-01) | **Delivery:** explain; Schedule if server windows exist at eligible checkout; else empty recovery. **Takeaway Now:** accepting-now; closed → Now unavailable; if schedule-capable candidates exist, server must expose a truthful hint so “offer Schedule” is not a blind suggestion (no Menu exact slots). **Takeaway Schedule:** must **not** be rejected solely because closed NOW; exact times only at eligible checkout; no guaranteed-availability claim |
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
| AS-22 | Multi-tab divergent intent (GP-04) | Tab-scoped `sessionStorage` presentation; no cross-tab payable/seal sync; each tab revalidates server facts; no auto-create Checkout from bar intent alone |
| AS-23 | CHECKOUT_EXPIRED mid-schedule | Force recovery/reselect; no pay on expired checkout window |
| AS-24 | Pre-checkout Takeaway eligibility read | Server returns outlets + selectionPolicy for requested timing intent; Now uses accepting-now; Schedule uses schedule-capable; no checkoutId fabrication |
| AS-25 | Mode-sensitive Cart evaluate | With Takeaway (+ outlet) or Delivery (+ location), quote updates from server; PICKUP does not invent delivery fee; quote ≠ Snapshot |
| AS-26 | Proposed outlet ≠ confirmed place for windows | Schedule exact windows remain blocked until Checkout-confirmed outlet; UNCONFIRMED reason shown |
| AS-27 | Eligibility / evaluate race | Stale responses ignored; fingerprint/revision mismatch drops mirrors; latest server result wins |
| AS-28 | Implemented channel consistency (DR-04) | In-app content via `customer-visible-content` uses Delivery/Takeaway/Now/Schedule same-meaning; WhatsApp same-meaning **when sending adapter is configured** (noop WhatsApp is not a failure); no Pickup-as-peer; no customer “fulfilment window”; email/SMS/push out of scope while non-sending; do not claim WhatsApp active in every environment |
| AS-29 | Open Checkout mode ≠ browse intent (GP-02 extended) | Cart evaluate reuses open Checkout / Snapshot quote for same cart revision (`reusedCheckoutEvaluation`) across DRAFT / READY_FOR_PAYMENT / PAYMENT_PENDING; response conveys effective Checkout mode; UI shows Checkout mode as authoritative; Takeaway open Checkout reuse must not require Delivery location; PAYMENT_PENDING never recomputed to a divergent browse mode; browse does not mutate Checkout |
| AS-30 | No Cart / Empty Cart eligibility (GP-03) | Distinct `NO_CART` / `EMPTY_CART` (or equivalent); UI invites add items; must not present brand-level “no outlets available” |
| AS-31 | Takeaway quote without Delivery address (GP-02) | With Takeaway mode (+ outlet when known), evaluate returns advisory quote without Delivery coordinates; no invented delivery fee |
| AS-32 | CART evaluation provenance (GP-02) | New CART-scope persisted evaluations record evaluated mode/timing/outlet (or Delivery fingerprint); reuse retains Checkout provenance |
| AS-33 | Eligibility / pickup-options error vs UNAVAILABLE (GP-03) | Network/server error on **pre-checkout eligibility or Checkout pickup-options** shows calm retry; must not set permanent UNAVAILABLE / “no location can take this order” without recovery (today’s `loadPickupOptions` error→`UNAVAILABLE` is defect evidence) |
| AS-34 | Closed now but Scheduled Takeaway possible (Checkout) | Schedule-capable outlet appears for Schedule path; bind outlet **without** triggering `evaluateCheckout`; windows listed; evaluate only after SCHEDULED+window set; Timing step disables Now with reason when outlet not accepting-now; **no** Menu exact slots; **no** guaranteed-availability claim; **no** silent Checkout bind |
| AS-35 | Outlet valid for Now but no future Schedule slots | Now-eligible outlet remains selectable for Now; Schedule path shows honest empty windows + recovery (try Now / another outlet / later); no invented slots |
| AS-36 | Selected Checkout outlet becomes invalid | After confirm or before pay, server rejects / revalidation fails → force reselect; prior selection not silently kept as payable bind; calm recovery; Checkout authorization unchanged |
| AS-37 | No Schedule times at eligible Checkout | Empty server window list + recovery; Now offered only if accepting-now still eligible (not unconditional ASAP copy); no fake promises; no new lifecycle state |
| AS-38 | No silent Checkout binding from browse / list | AUTO_SELECT propose ≠ bind (per timing); browse eligibility never sets `pickupOutletId`; customer must confirm; PAYMENT_PENDING still frozen |
| AS-39 | Open Checkout Snapshot without retrievable commercial evaluation | Reuse before any browse-dependent computation; missing evaluation/wire **or** reuse probe throw → fail-closed (`EVALUATION_INDETERMINATE` or equivalent) **or** Snapshot-sourced display only; **never** fall through to divergent browse money; PAYMENT_PENDING freeze intact |
| AS-40 | Checkout effective mode/timing in UI under reuse | When `reusedCheckoutEvaluation`, UI shows Checkout fulfilment mode + material timing; browse intent does not imply a different payable |
| AS-41 | Eligible-Checkout Scheduled Takeaway end-to-end (closed now) | Full Contract C journey: timing-aware schedule-capable list → bind **without** evaluate → server windows → set SCHEDULED+window → authoritative evaluate → Review → prepare → pay; optimistic expectedRevision on fulfilment/timing writes; accepting-now filter must not exclude the outlet; post-bind ASAP evaluate must not run before Timing |
| AS-42 | Mode-gated Offer on Cart advisory quote | PICKUP-only (or DELIVERY-only) promotion applies only when evaluate context supplies matching `fulfilmentMode`; without mode → not applied (`FULFILMENT_CONTEXT_REQUIRED`); quote remains advisory |
| AS-43 | Timing-gated Offer with Schedule UNCONFIRMED | SCHEDULED-only promotion must not present as final locked savings at Menu; UI shows provisional / may-change offer messaging; no scheduled-slot guarantee; after Checkout seals SCHEDULED+window, evaluate may apply truthfully |
| AS-44 | No Menu guarantee of slot or final promo price | Menu / bar must not claim a specific future collection window or final promotional payable; D-368 display price ≠ seal; exact windows remain checkout-eligible only (DR-02) |
| AS-45 | Fail-closed when Snapshot exists but evaluation evidence missing | Active Snapshot + same cart revision + missing CHECKOUT evaluation/wire **or** reuse throw → `EVALUATION_INDETERMINATE` (or Snapshot-sourced display only); **never** browse `buildDirectPricingQuote` competing payable; Takeaway path must not require Delivery location to reach this rule |
| AS-46 | Fingerprint / dedup correctness for mode·timing·outlet | Stale evaluate/eligibility responses whose fingerprint (cartRevision + mode + timing + outlet\|delivery fingerprint + generation) ≠ current intent are dropped; new CART persists record provenance; reuse retains Checkout provenance; UI never shows two competing payables for the same fingerprint |

## Challenge coverage matrix

| Challenge case | Covered by |
|---|---|
| No selected mode or location | AS-01 |
| One / multiple Takeaway outlets | AS-05, AS-06, AS-24 |
| Unsupported Delivery address | AS-07 |
| Outlet closed and Now unavailable | AS-08 (Now vs Schedule-capable) |
| Closed now but Schedule Takeaway possible at Checkout | AS-34, AS-41 |
| Now-valid outlet / no future Schedule slots | AS-35 |
| Selected outlet becomes invalid | AS-36 |
| No Schedule windows | AS-09, AS-37 |
| Cross-midnight / local-time formatting | AS-10 |
| Window expires before payment | AS-11 |
| Mode-dependent delivery charges and offers | AS-04, AS-25, AS-31, AS-42 |
| Timing-sensitive / provisional Offers | AS-43, AS-44 |
| Cart revisions and stale async responses | AS-16, AS-27, AS-46 |
| Authentication / session changes | AS-15 |
| Pending historical payment | AS-17 |
| New order versus previous checkout | AS-18 |
| Workforce vs customer terminology consistency | AS-19 |
| Mobile accessibility and keyboard navigation | AS-12, AS-13 |
| Unconfirmed Schedule at Menu (no exact slots) | S-10 + UOE-DR-02 + AS-44 |
| Dehradun orientation ≠ confirmed address | S-03 + refinement B |
| Ineligible lines / reload / multi-tab / expired | AS-20–AS-23 |
| Takeaway Schedule with unconfirmed AUTO_SELECT outlet | AS-26 |
| Pre-checkout eligibility without second money authority | AS-24, AS-25 |
| Implemented channel terminology | AS-28 |
| Open Checkout vs browse mode conflict | AS-29, AS-40 |
| Missing commercial-evaluation evidence | AS-39, AS-45 |
| Fingerprint / provenance / dedup | AS-32, AS-46 |
| Empty / first-use vs no outlets | AS-30, AS-33 |
| Takeaway quote without address + provenance | AS-31, AS-32 |
| No silent Checkout bind | AS-38 |

## Definition of Ready (candidate checklist — not claimed passed)

- [ ] Product Definition Gate evaluated
- [ ] Experience Gate evaluated
- [ ] Architecture Fit after gates
- [ ] Design Readiness after Fit
- [ ] Quality / Test Plan finalized
- [ ] Measurement Plan finalized (X3)
- [ ] Future IMP identity allocated by R3
- [ ] Implementation authorization explicit
