<!-- AUTHORITY: NON_AUTHORITATIVE_DISCOVERY_DRAFT | ID: XD-UOE-CANDIDATE-1 -->

# Experience Definition candidate — Unified Order Experience

```text
CANDIDATE_ID = XD-UOE-CANDIDATE-1
STATUS = EXPERIENCE_DEFINITION_CANDIDATE
AUTHORITY = NON_AUTHORITATIVE
EXPERIENCE_GATE = NOT_PERFORMED (candidate for evaluation)
EXPERIENCE_CRITICALITY = X3
LANG = LANG-1
IMPLEMENTATION_AUTHORIZED = NO
```

## Experience Intent

Help a customer decide **How · Where · When** with calm confidence before paying, and help
workforce recognize the same order methods without teaching backend enums. The emotional
outcome is unbothered clarity — never fake ETA, never fake address, never surprise fees at pay.

## Experience Criticality

`X3` — customer conversion, money, trust, and operational promise.

## UX workstreams

### UX-A — Universal terminology

| Surface | Customer words | Workforce primary | Contextual ops (allowed) |
|---|---|---|---|
| Mode | Delivery / Takeaway | Delivery / Takeaway | — |
| Timing | Now / Schedule | Now / Schedule for order-type chrome; **Scheduled** allowed as contextual ops precision (not a competing customer label) | ASAP OK in deep ops tools if needed |
| Place | Deliver to [confirmed]; Collect from [outlet] | Same meaning | Delivery address / collection point in tasks |
| Time promise | Delivery time / Collection time | Same | Scheduled window (ops) |
| Tasks | — | — | Prepare for collection; Ready for collection; Hand over order |
| Avoid (customer) | fulfil, fulfilment window, snapshot, ASAP as UI label, Pickup as peer of Delivery | — | — |

Apply across: Menu, Cart, Checkout, Order Confirmation, My Orders, tracking, notifications;
workforce order lists, queues, details, store operations, administration and scheduling
**order-type** chrome.

Historical IMP titles (e.g. “Customer Pickup / Takeaway”) are not rewritten.

### UX-B — Compact scheduling

```text
Now | Schedule
  → Today | Tomorrow (only days with server windows)
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
- Outlet closed / Now unavailable: explain; offer Schedule if windows exist; else empty + recovery
- No windows: empty + recovery; Now if eligible
- Cross-midnight: Today/Tomorrow and labels follow outlet timezone
- **Unconfirmed Schedule intent** allowed in bar before eligible checkout; exact slot only from
  server list once eligible (refinement C)

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
| API empty after eligible | No times available — try later or change method/place |

Takeaway + Schedule with AUTO_SELECT outlet **proposed but not confirmed** → windows must **not**
list (outlet not yet confirmed place).

### UX-C — Universal order-context bar

Visible on Menu → Cart → Checkout:

1. Method — Delivery | Takeaway | “Choose how”
2. Location — confirmed address **or** collection point | honest missing CTAs |
   market orientation “Ordering in Dehradun” must **not** look like Deliver to
3. Time — Now | Schedule summary | “Choose time” | Schedule **UNCONFIRMED** when ineligible

| Viewport | Placement |
|---|---|
| Mobile | Compact sticky strip → sheet for Method / Location / Time |
| Desktop | Integrated in existing commerce navigation / header slot |

Rules:

- Browsing intent is **not** Checkout authority
- Browse before address/sign-in allowed
- Preserve eligible cart lines; explain fee, availability, offer changes
- Require final authoritative Checkout Review before pay
- Never mutate a previous `PAYMENT_PENDING` checkout from a new browsing preference
- No client-owned payable amount

## Content design notes

- Tone: ordering = clear/lightly branded; checkout/payment = precise/reassuring; failure = calm recovery
- Brand: BOBA Bear — Unbothered; not a QSR clone; no trademarked McDonald’s patterns
- Protective microcopy on Now: earliest available, not immediate
- Money and savings only from server evaluate / Snapshot

## Service blueprint (promise)

| Moment | Frontstage | Backstage authority |
|---|---|---|
| Browse | Bar shows intent / gaps | delivery-context; menu projection |
| Confirm place | Deliver to / Collect from | serviceability; pickup-options |
| Confirm time | Now / Schedule slot | ASAP path; scheduled windows + seal |
| Pay | Review totals | Snapshot; prepare; payment; bind revalidate |
| Collect / deliver | Customer promise words | Ops tasks + existing execution |

## Friction audit (candidate, not full pre-GTM audit)

| Friction | Mitigation |
|---|---|
| Delivery-only “Delivering to” chrome | UX-C mode-aware bar |
| Customer “fulfil / fulfilment” | UX-A |
| Long schedule grid | UX-B |
| Fake confirmed locality | Refinement B |
| Schedule before checkout eligibility | Refinement C — unconfirmed intent |
| Split geo state | Refinement D — one owner |
| Pending payment vs new intent | PAYMENT_PENDING isolation |

Full pre-GTM audit remains `NOT_PERFORMED` per Experience Debt Register.
