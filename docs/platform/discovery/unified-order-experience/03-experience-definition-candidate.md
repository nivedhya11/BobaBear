<!-- AUTHORITY: NON_AUTHORITATIVE_DISCOVERY_DRAFT | ID: XD-UOE-CANDIDATE-3 -->

# Experience Definition candidate — Unified Order Experience

```text
CANDIDATE_ID = XD-UOE-CANDIDATE-3
SUPERSEDES = XD-UOE-CANDIDATE-2
STATUS = EXPERIENCE_DEFINITION_CANDIDATE
AUTHORITY = NON_AUTHORITATIVE
EXPERIENCE_GATE = NOT_PERFORMED
EXPERIENCE_CRITICALITY = X3
LANG = LANG-1
VARIANT = PRECHECKOUT_ELIGIBILITY_WEB_FIRST_V1
GATE_PRECISION_REVISION = YES
IMPLEMENTATION_AUTHORIZED = NO
```

## Experience Intent

Help a customer decide **How · Where · When** with calm confidence before paying, and help
workforce recognize the same order methods without teaching backend enums. The emotional
outcome is unbothered clarity — never fake ETA, never fake address, never surprise fees at pay.
For Takeaway, show **server-true** collection options early; for fees/offers, show **server
quotes** early — without pretending browse state is Checkout seal. For Schedule Takeaway,
do not tell a customer collection is impossible solely because the outlet is closed **right
now** when accepted Scheduled Takeaway remains supported (IMP-036I).

## Experience Criticality

`X3` — customer conversion, money, trust, and operational promise.

## UX workstreams

### UX-A — Universal terminology

| Surface | Customer words | Workforce primary | Contextual ops (allowed) |
|---|---|---|---|
| Mode | Delivery / Takeaway | Delivery / Takeaway | — |
| Timing | Now / Schedule (chooser / chrome labels) | Same chooser labels; **Scheduled** allowed as contextual ops precision | ASAP OK in deep ops tools if needed; WhatsApp/in-app **sentence form** may use “scheduled collection / collection time” (not a competing chooser label; AS-28) |
| Place | Deliver to [confirmed]; Collect from [outlet] | Same meaning | Delivery address / collection point in tasks |
| Time promise | Delivery time / Collection time | Same | Scheduled window (ops) |
| Tasks | — | — | Prepare for collection; Ready for collection; Hand over order |
| Avoid (customer) | fulfil, fulfilment window, snapshot, ASAP as UI label, Pickup as peer of Delivery | — | — |

Apply across: Menu, Cart, Checkout, Order Confirmation, My Orders, tracking,
**implemented** notification channels — in-app always; WhatsApp **when sending is configured** —
via customer-visible content
(UOE-DR-04; email/SMS/push non-sending today); workforce order lists, queues, details,
store operations, administration and scheduling **order-type** chrome.

Historical IMP titles (e.g. “Customer Pickup / Takeaway”) are not rewritten.

### UX-B — Compact scheduling (exact Menu slots deferred — UOE-DR-02)

```text
Now | Schedule
  → (at eligible checkout) Today | Tomorrow (only days with server windows)
  → Compact server-provided time list (30-minute windows)
  → Confirmation with local date/time + cutoff when applicable
```

| Viewport | Chrome |
|---|---|
| Mobile | Accessible bottom sheet |
| Desktop | Compact dialog / popover |

Rules:

- Preserve server windows, operating hours, minimum lead time, IANA timezone, cutoff,
  bind-time revalidation
- No arbitrary minute selection; no fake ETA
- Outlet closed / Now unavailable (GP-01):
  - **Delivery:** explain; offer Schedule if server windows exist at eligible checkout; else empty + recovery
  - **Takeaway Now:** accepting-now eligibility; closed / not accepting → Now unavailable + honest recovery; if schedule-capable, offer Schedule intent (not exact Menu slots)
  - **Takeaway Schedule:** schedule-capable presentation using accepted profile/hours rules; **do not** mark Schedule collection unavailable solely because closed NOW; exact windows remain checkout-eligible only; never claim guaranteed future availability at Menu
  - **Checkout path (mandatory):** customer-facing order = Method → **When intent as list filter** (Schedule) → **Where** (schedule-capable list with per-outlet “Schedule only — not open for collection now” when closed now) → confirm place → server times → Review (AS-34 / AS-41). Bind without evaluate before Timing. Do not present “no collection place” for Schedule solely because accepting-now is empty when schedule-capable outlets exist. When Now list is empty, show Schedule recovery only if server hints schedule-capable candidates exist. Defect evidence: Mode → pickup-options(accepting-now) → bind → evaluate(ASAP) → Timing
- No windows (eligible checkout — Delivery destination or confirmed Takeaway outlet): empty + recovery; Now if accepting-now still eligible (AS-09 / AS-35 / AS-37) — Checkout copy, not Menu-only
- Timing step: if confirmed outlet is not accepting-now (`nowEligible=false` from pickup-options, re-read if stale), disable Now with reason (“Not open for collection right now”); Schedule remains when windows exist (AS-34)
- Selected outlet becomes invalid: reselect; no silent keep; no fake promise (AS-36)
- Never silent Checkout bind from browse or AUTO_SELECT alone (AS-38)
- Cross-midnight: Today/Tomorrow and labels follow outlet timezone
- **Unconfirmed Schedule intent** allowed in bar before eligible checkout; exact slot only from
  server list once eligible — **no Menu exact-slot preview in V1** (UOE-DR-02)

**Eligible checkout context** (exact windows may list) means all of:

1. Authenticated customer
2. Active Checkout
3. Mode set
4. Confirmed place for that mode (SERVICEABLE delivery destination **or** customer-confirmed Takeaway outlet)

**UNCONFIRMED Schedule reason copy (variants):**

| Reason | Copy intent |
|---|---|
| Not signed in | Sign in to choose an exact time |
| No place yet | Add address / choose store before exact times |
| No checkout yet | Exact times appear when you check out |
| Mode/place incomplete | Finish How and Where first |
| Outlet only proposed | Confirm your collection place at checkout to choose an exact time |
| API empty after eligible | No times available — try later or change method/place |
| Now closed but Schedule possible (Menu) | This place isn’t open for collection right now — you can Schedule a later collection time at checkout |
| Checkout outlet schedule-only (closed now) | Schedule only — not open for collection now |
| Checkout Timing Now disabled | Not open for collection right now — choose a Schedule time |
| Cart evaluate indeterminate (open Checkout) | Calm “Couldn’t load your checkout total — continue checkout to see your total” (or equivalent); no browse total as substitute |
| Cart Snapshot-sourced display under reuse | Label as Checkout total / your checkout amount — not a Menu bargain |

Takeaway + Schedule with AUTO_SELECT outlet **proposed but not confirmed** → windows must **not**
list (outlet not yet confirmed place) — AS-26.

**Closed-now Schedule Takeaway (customer journey):** Choose Takeaway → choose Schedule → see
schedule-capable places (including closed-now, labelled Schedule-only) → confirm place → pick a
server time → see Review totals → pay. No promised slot at Menu; no locked promo until Checkout.

### UX-C — Universal order-context bar

Visible on Menu → Cart → Checkout:

1. Method — Delivery | Takeaway | “Choose how”
2. Location — confirmed address **or** collection place from server eligibility |
   honest missing CTAs | market orientation “Ordering in Dehradun” must **not** look like Deliver to
3. Time — Now | Schedule summary | “Choose time” | Schedule **UNCONFIRMED** when ineligible

| Viewport | Placement |
|---|---|
| Mobile | Compact sticky strip → sheet for Method / Location / Time |
| Desktop | Integrated in existing commerce navigation / header slot |

Rules:

- Browsing intent is **not** Checkout seal authority
- Browse before address/sign-in allowed; browse with empty / no cart allowed without “no outlets” (GP-03)
- Pre-checkout Takeaway place from **server eligibility read** (UOE-DR-05); propose ≠ bind;
  Now vs Schedule capability distinguished (GP-01)
- Preserve eligible cart lines; explain fee, availability, offer changes from **mode- and
  timing-sensitive server cart evaluate** (advisory), including Takeaway without Delivery address
  (GP-02)
- Schedule **UNCONFIRMED** (Menu / pre-checkout): timing-restricted Offers do not apply yet
  (Cart evaluate omits timing); mode-gated savings may still show with mode-neutral provisional
  wording (“may change when you confirm your time”) — never a locked discount or promised slot
  (AS-43–44)
- When open Checkout quote is reused, show **Checkout’s** effective mode/timing as authoritative
  (AS-29 / AS-40); if evaluation evidence is missing, calm fail-closed recovery — not a competing
  browse total (AS-39 / AS-45)
- On the Checkout surface, the bar reflects Checkout-owned mode/outlet/timing and routes edits
  through Checkout APIs (not sessionStorage intent alone)
- Require final authoritative Checkout Review before pay
- Never mutate a previous `PAYMENT_PENDING` checkout from a new browsing preference
- No client-owned payable amount
- Presentation storage is **tab-scoped**; other tabs must revalidate server facts (GP-04). Cart /
  Checkout credentials may be shared across tabs; money consistency comes from server reuse rules,
  not presentation sync. A duplicated tab copies sessionStorage at open then diverges — revalidate.

## First-use and empty-cart presentation (GP-03)

| State | Customer presentation | Forbidden |
|---|---|---|
| No Cart | Browse Menu; invite to add items; method/place/time gaps honest | “No outlets available” |
| Empty Cart (exists, 0 lines) | Same as browse; may prompt add items before collection quote | “No outlets available” / UNAVAILABLE as if brand has zero stores |
| Cart with lines; server returns no Now-eligible / no schedule-capable outlets | Honest empty + recovery for that timing intent | Blaming empty cart |
| Eligibility unavailable / error | Calm retry; no invented outlets | Treating error as permanent UNAVAILABLE without recovery |
| Open Checkout; evaluation evidence missing | Calm Checkout recovery / Snapshot-sourced Checkout-labelled total only | Divergent browse money as substitute payable |
| Evaluate refresh failed after intent change | Hide money / retry — do not keep stale-fingerprint quote | Showing old mode/timing total as current |

Anonymous Menu browsing remains allowed throughout.

## Multi-tab presentation (GP-04)

- `boba.order-context.v1` / `boba.delivery-context.v1` in `sessionStorage` = **this tab’s**
  presentation intent only
- Custom events coordinate **within** a tab; they are not a cross-tab authority bus
- Explicit cross-tab coordination is **out of V1** unless separately specified later
- Each tab revalidates eligibility, cart evaluate, and Checkout facts from the server before
  treating them as current
- Never synchronize payable amounts or sealed Checkout Snapshot state from presentation storage

## Content design notes

- Tone: ordering = clear/lightly branded; checkout/payment = precise/reassuring; failure = calm recovery
- Brand: BOBA Bear — Unbothered; not a QSR clone; no trademarked McDonald’s patterns
- Protective microcopy on Now: earliest available, not immediate
- Money and savings only from server evaluate / Snapshot
- Implemented channels: same primary words as web (AS-28)

## Service blueprint (promise)

| Moment | Frontstage | Backstage authority |
|---|---|---|
| Browse | Bar shows intent / gaps / proposed Takeaway place | delivery-context; eligibility read (Now vs Schedule-capable); menu projection |
| Cart quote | Impact of mode/outlet/timing on fees/offers/availability | cart evaluate (advisory; provisional Offers when Schedule UNCONFIRMED) |
| Confirm place | Deliver to / Collect from | serviceability; eligibility; **timing-aware** checkout pickup-options + confirm |
| Confirm time | Now / Schedule slot | ASAP path; scheduled windows + seal (checkout-eligible); empty → recovery |
| Cart quote with open Checkout | Show Checkout mode/money when reuse applies | reuse before Delivery early return; fail-closed if evaluation evidence missing |
| Pay | Review totals | Snapshot; prepare; payment; bind revalidate |
| Collect / deliver | Customer promise words | Ops tasks + existing execution |
| Notify | Same-meaning words on in-app (+ WhatsApp when sending) | `customer-visible-content`; WhatsApp adapter may be noop; Meta body/variable still open (DR-04) |

## Friction audit (candidate, not full pre-GTM audit)

| Friction | Mitigation |
|---|---|
| Delivery-only “Delivering to” chrome | UX-C mode-aware bar |
| Customer “fulfil / fulfilment” | UX-A |
| Long schedule grid | UX-B |
| Fake confirmed locality | Refinement B |
| Schedule before checkout eligibility | Refinement C — unconfirmed intent; DR-02 defer exact Menu slots |
| Split geo state | Refinement D — one owner |
| Takeaway place opaque until Checkout | DR-05 eligibility read |
| Closed-now false denial of Schedule Takeaway | GP-01 Now vs Schedule-capable (Menu **and** Checkout composition) |
| Checkout Mode→Now-list→bind→evaluate(ASAP)→Timing | AS-34 Checkout contract (candidate defect; UOE-DR-06) |
| Empty-cart “no outlets” | GP-03 state split |
| Fee surprise at Checkout | DR-05 mode/timing-sensitive cart evaluate + impact banner + Review |
| Provisional Offer looks final at Menu | AS-43–44 provisional messaging; no Menu slot/final-promo guarantee |
| Browse quote fights open Checkout | AS-29 / AS-39–40 / AS-45–46 / GP-02 precedence |
| Cross-tab money bleed | GP-04 tab-scoped presentation |
| Pending payment vs new intent | PAYMENT_PENDING isolation |
| Channel wording drift | DR-04 in-app (+ WhatsApp when sending); no always-on WhatsApp claim |

Full pre-GTM audit remains `NOT_PERFORMED` per Experience Debt Register.
