<!-- AUTHORITY: NON_AUTHORITATIVE_DISCOVERY_DRAFT | PACKAGE: UOE-CANDIDATE-1 -->

# Template completeness addendum (canonical PD-2 / EXP-1 fields)

```text
STATUS: DISCOVERY_DRAFT_ADDENDUM
AUTHORITY: NON_AUTHORITATIVE
GATE_EXECUTION: NOT_PERFORMED
VARIANT: INTENT_ONLY_WEB_FIRST_V1
```

This addendum supplies canonical template fields that must accompany
`PD-UOE-CANDIDATE-1` / `XD-UOE-CANDIDATE-1` before formal gate evaluation.
It does not execute or pass any gate.

## A. Acceptance slicing dispositions

| Slice class | Scope | Disposition |
|---|---|---|
| `V1_ACCEPTANCE_SLICE` | UX-A/B/C on web Menu→Cart→Checkout; primary workforce order-type labels; Checkout-bound exact Schedule windows; Takeaway **intent** pre-checkout | In candidate |
| `EXPLICITLY_DEFERRED` | Exact Menu-level schedule preview API | UOE-DR-02 |
| `EXPLICITLY_DEFERRED` | Pre-checkout Takeaway outlet eligibility read API and/or mode-aware Cart evaluate input | UOE-DR-05 (recommend defer; outlet confirm + fee impact at Checkout) |
| `EXPLICITLY_DEFERRED` | Full notification/email/SMS channel rewrite QA | UOE-DR-04 — same-meaning copy required when touched; channel-complete QA may trail web |
| `NOT_SUPPORTED_BY_DESIGN` | Client-authored windows, payable, or confirmed geo; browse mutate `PAYMENT_PENDING`; domain/API renames | Hard stop |
| `NOT_SUPPORTED_BY_DESIGN` | Open-ended #379 site rewrite inside this candidate | Bound to A/B/C |

**Gate candidate variant:** intent-only, web-first. A Founder answer requiring Menu exact slots
or pre-checkout outlet eligibility APIs re-versions to `PD-UOE-CANDIDATE-2` and re-enters gates.

## B. Journey Completeness Matrix (J1 primary)

| Journey dimension | Behaviour / applicability | Story / AC |
|---|---|---|
| ENTRY | Arrive at Menu/Cart/Checkout with or without address/sign-in | S-02, AS-01 |
| DISCOVERY | Bar makes How/Where/When visible | S-01, AS-12 |
| CONTEXT | Mode, place, time intents + eligibility mirrors | S-03–S-10, refinement D |
| EMPTY / FIRST USE | Missing method/place/time honest CTAs; market orientation ≠ Deliver to | AS-01, S-03 |
| HAPPY PATH | Confirm place/time at Checkout → Review → Pay | S-14, J1 |
| ALTERNATE VALID PATHS | Delivery↔Takeaway; Now↔Schedule; one/many outlets | AS-02–06, AS-08–09 |
| VALIDATION FAILURE | Unsupported address; Now unavailable; no windows; window expired | AS-07–11 |
| AUTHORIZATION | Guest browse OK; exact windows require authenticated Checkout | S-09, F-07 eligibility |
| NOT FOUND / STALE REFERENCE | Stale outlet/window/address refs cleared or revalidated | AS-14, AS-16, AS-20 |
| SERVER / NETWORK ERROR | Calm recovery; no invented slots/money | AS-16 |
| RECOVERY | PAYMENT_PENDING recovery; cart conflict; new-order path | AS-17–18 |
| CONCURRENCY | Generation tokens; revision conflicts; multi-tab | AS-16, AS-22 |
| DESTRUCTIVE ACTION | Removing ineligible lines on mode switch requires clear confirmation/explanation | AS-20 |
| SUCCESS FEEDBACK | Confirmation uses Delivery/Takeaway + time promise words | AS-19, S-18 |
| DOWNSTREAM EFFECT | Ops lists primary Takeaway/Delivery; collection task verbs | W-01–W-02, AS-19 |
| REVISIT / RELOAD | Bar restores non-personal intent; completed checkout does not bleed | AS-18, AS-21 |
| RESPONSIVE / MOBILE | Sticky strip + sheet; desktop integrated chrome | AS-12 |
| ACCESSIBILITY | Keyboard/SR for sheet; no jargon in names | AS-13 |

## C. Assumption and evidence register

| Claim | Class | Evidence class | Risk | Validation path |
|---|---|---|---|---|
| Current chrome is delivery-biased (“Delivering to”; Dehradun fallback label paths) | FACT | Repository code (`display-label.ts` title; locality helpers) | High UX bias | Content QA after UX-C |
| Customer UI still says Pickup / fulfil jargon | FACT | Repository (`CheckoutFulfilmentChoice`, `CheckoutTimingChoice`, history/panel) | High LANG-1 | UX-A content QA |
| Ops list may show raw DELIVERY/PICKUP badges | FACT | Operations order list client | Medium | UX-A workforce map |
| `listCheckoutScheduledWindows` requires checkoutId + auth | FACT | `checkout.ts` / router / scheduled-customer | High if ignored | Architecture Fit |
| `listCheckoutPickupOptions` is checkout-bound | FACT | pickup-options + router | High if “surface earlier” misread | UOE-DR-05 |
| delivery-context stores no serviceability outcome | FACT | `delivery-context.ts` shape | High for “confirmed” | Confirmed-state definition |
| Takeaway is better understood than Pickup for customers in Dehradun | PRODUCT_DECISION | FOUNDER_HEURISTIC_REVIEW | Medium if wrong | Post-ship mode-correction metric |
| Earlier How/Where/When reduces checkout hesitation | HYPOTHESIS | none measured | Medium | Primary metric in `09-…` |
| Compact Schedule is faster/calmer than long grid | HYPOTHESIS | none measured | Medium | Time-to-confirm Schedule |
| Workforce primary Takeaway label won’t harm ops precision | ASSUMPTION | Founder refinement A | Medium | Ops feedback; collection verbs retained |
| V1 intent-only Schedule/Takeaway pre-checkout is acceptable | PRODUCT_DECISION (candidate) | Founder refinements C + review F-01 | High if Founder wants exact early | UOE-DR-02 / UOE-DR-05 |

## D. Current-state experience evidence (repository)

| Observation | Path / symbol (verified at package base) |
|---|---|
| Nav/menu deliver-to title always “Delivering to” | `display-label.ts` → `deliveryHeaderContext` |
| Soft Dehradun operating locality helper | `serviceability-copy.ts` → `deliverToOperatingAreaLocality` |
| Checkout mode buttons Delivery / Pickup | `CheckoutFulfilmentChoice` |
| Timing copy uses fulfil / ASAP | `CheckoutTimingChoice` |
| History uses Pickup / As soon as possible | `OrderHistoryClient` / fulfilment panel |
| Scheduled windows API checkout-scoped | `listCheckoutScheduledWindows({ checkoutId })` |
| Pickup options API checkout-scoped | `listCheckoutPickupOptions` |
| PAYMENT_PENDING blocks fulfilment mutations | `server/checkout/fulfilment.ts` (existing) |
| delivery-context key | `boba.delivery-context.v1` |

## E. Canonical Product Definition Gate block (pre-gate draft)

```text
PRODUCT_DEFINITION_GATE

Capability: Unified Order Experience (working name; IMP NOT_ALLOCATED)
Product Definition Version: PD-UOE-CANDIDATE-1 (intent-only web-first variant)
Business Outcome: defined in 01-/02-
Primary Personas: defined in 01-
Journeys Defined: J1–J7 candidate
Story Map Complete: YES (candidate) in 04-
Acceptance Slice Defined: YES — see §A slicing dispositions
Happy Paths Defined: YES (candidate)
Alternate Paths Defined: YES (candidate)
Empty / First-Use States Defined: YES (candidate)
Error / Recovery Paths Defined: YES (candidate)
Authorization Variants Defined: PARTIAL — guest browse vs auth checkout windows documented
Cross-Scope Scenarios Defined: N/A — no new cross-tenant admin scope
Concurrency Considered: YES (AS-16, AS-22)
Destructive Actions Defined: YES (AS-20 ineligible-line disposition)
UX State Matrix Complete: PARTIAL — see 07- + known-not-deliverable row
Accessibility Considered: YES (AS-13)
Golden Journeys Identified: YES (01-)
Explicit Deferrals Recorded: YES (§A; UOE-DR-02/04/05)
Unresolved Product Decisions: UOE-DR-01, UOE-DR-02, UOE-DR-03, UOE-DR-04, UOE-DR-05
Architecture Conflicts: NONE identified against D-378/D-379 if deferrals held; STOP if Founder forces undefined pre-checkout contracts without Fit
PRODUCT_DEFINITION_GATE_EXECUTION: NOT_PERFORMED
Gate Result: NOT_PERFORMED

AGENT_DISPOSITION: RECOMMENDED_READY_FOR_EVALUATION (gaps listed; not RECOMMENDED_PASS)
```

## F. Canonical Experience Gate block (pre-gate draft)

```text
EXPERIENCE_GATE
Result: NOT_PERFORMED
Unresolved experience decisions: UOE-DR-02, UOE-DR-04, UOE-DR-05; workforce admin noun table; UNCONFIRMED reason copy variants
Evidence class: FOUNDER_HEURISTIC_REVIEW (not customer research)
Pre-GTM audit: NOT_PERFORMED
AGENT_DISPOSITION: RECOMMENDED_READY_FOR_EVALUATION (gaps listed; not RECOMMENDED_PASS)
```

## G. Refinement A — per-surface label disposition

| Surface | Disposition |
|---|---|
| Customer Menu/Cart/Checkout/Confirmation/My Orders/tracking | `TAKEAWAY_PRIMARY` (never Pickup as peer of Delivery) |
| Workforce order lists / queues / details — order type | `TAKEAWAY_PRIMARY` |
| Workforce task actions | `OPERATIONAL_VOCAB_ALLOWED` — Prepare/Ready/Hand over for collection |
| Store ops “Pickup promise/location” task chrome | Prefer collection wording where customer-visible; internal task precision OK |
| Admin OutletPickupProfile / “Pickup minimum lead time” / profile config nouns | `OPERATIONAL_VOCAB_ALLOWED` — **domain/config names not renamed (D6)** |
| Admin scheduling policy screens | Operational vocabulary OK; order-type filters use Takeaway when showing mode |
| Notifications/email/SMS | Same meaning as customer web when touched; complete channel QA may defer (UOE-DR-04) |
