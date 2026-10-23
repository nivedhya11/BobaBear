<!-- AUTHORITY: NON_AUTHORITATIVE_DISCOVERY_DRAFT | PACKAGE: UOE-CANDIDATE-2 -->

# Template completeness addendum (canonical PD-2 / EXP-1 fields)

```text
STATUS: DISCOVERY_DRAFT_ADDENDUM
AUTHORITY: NON_AUTHORITATIVE
GATE_EXECUTION: NOT_PERFORMED
VARIANT: PRECHECKOUT_ELIGIBILITY_WEB_FIRST_V1
PACKAGE: UOE-CANDIDATE-2
```

This addendum supplies canonical template fields that must accompany
`PD-UOE-CANDIDATE-2` / `XD-UOE-CANDIDATE-2` before formal gate evaluation.
It does not execute or pass any gate.

## A. Acceptance slicing dispositions

| Slice class | Scope | Disposition |
|---|---|---|
| `V1_ACCEPTANCE_SLICE` | UX-A/B/C on web Menu→Cart→Checkout; primary workforce order-type labels; Checkout-bound exact Schedule windows; **server pre-checkout Takeaway eligibility + mode-sensitive Cart evaluate** (DR-05); **WhatsApp + in-app same-meaning** (DR-04) | In candidate |
| `EXPLICITLY_DEFERRED` | Exact Menu-level schedule preview API | UOE-DR-02 (Founder: defer) |
| `EXPLICITLY_DEFERRED` | Email/SMS/push (non-sending today); unbounded channel rewrite / new channel products | Beyond WhatsApp + in-app |
| `NOT_IN_SCOPE` | Receipts / tax invoices / receipt vouchers (D-365 financial document authority) | Wording unchanged by this candidate |
| `NOT_SUPPORTED_BY_DESIGN` | Client-authored windows, payable, or confirmed geo; browse mutate `PAYMENT_PENDING`; domain/API renames; second commercial authority; divergent browse quote vs open Checkout Snapshot | Hard stop |
| `NOT_SUPPORTED_BY_DESIGN` | Open-ended #379 site rewrite inside this candidate | Bound to A/B/C + DR-04/05 |

**Gate candidate variant:** `PRECHECKOUT_ELIGIBILITY_WEB_FIRST_V1` (supersedes CANDIDATE-1
intent-only Takeaway/fee posture).

## B. Journey Completeness Matrix (J1 primary)

| Journey dimension | Behaviour / applicability | Story / AC |
|---|---|---|
| ENTRY | Arrive at Menu/Cart/Checkout with or without address/sign-in | S-02, AS-01 |
| DISCOVERY | Bar makes How/Where/When visible | S-01, AS-12 |
| CONTEXT | Mode, place, time intents + eligibility mirrors + cart quote | S-03–S-14, refinement D |
| EMPTY / FIRST USE | Missing method/place/time honest CTAs; market orientation ≠ Deliver to | AS-01, S-03 |
| HAPPY PATH | Confirm place/time at Checkout → Review → Pay | S-15, J1 |
| ALTERNATE VALID PATHS | Delivery↔Takeaway; Now↔Schedule; one/many outlets | AS-02–06, AS-08–09, AS-24–25 |
| VALIDATION FAILURE | Unsupported address; Now unavailable; no windows; window expired; eligibility UNAVAILABLE | AS-07–11, AS-24 |
| AUTHORIZATION | Guest browse OK; exact windows require authenticated Checkout; eligibility/evaluate within cart credentials | S-10, AS-24–25 |
| NOT FOUND / STALE REFERENCE | Stale outlet/window/address refs cleared or revalidated | AS-14, AS-16, AS-20, AS-27 |
| SERVER / NETWORK ERROR | Calm recovery; no invented slots/money/outlets | AS-16 |
| RECOVERY | PAYMENT_PENDING recovery; cart conflict; new-order path; open-Checkout quote reuse | AS-17–18, AS-29 |
| CONCURRENCY | Generation tokens; revision conflicts; multi-tab; stale eligibility; Checkout reuse precedence | AS-16, AS-22, AS-27, AS-29 |
| DESTRUCTIVE ACTION | Removing ineligible lines on mode switch requires clear confirmation/explanation | AS-20 |
| SUCCESS FEEDBACK | Confirmation uses Delivery/Takeaway + time promise words | AS-19, S-19 |
| DOWNSTREAM EFFECT | Ops lists primary Takeaway/Delivery; collection task verbs; implemented channels | W-01–W-02, AS-19, AS-28 |
| REVISIT / RELOAD | Bar restores non-personal intent; completed checkout does not bleed | AS-18, AS-21 |
| RESPONSIVE / MOBILE | Sticky strip + sheet; desktop integrated chrome | AS-12 |
| ACCESSIBILITY | Keyboard/SR for sheet; no jargon in names | AS-13 |

## C. Assumption and evidence register

| Claim | Class | Evidence class | Risk | Validation path |
|---|---|---|---|---|
| Current chrome is delivery-biased (“Delivering to”; Dehradun fallback label paths) | FACT | Repository code (`display-label.ts` title; locality helpers) | High UX bias | Content QA after UX-C |
| Customer UI still says Pickup / fulfil jargon | FACT | Repository (`CheckoutFulfilmentChoice`, `CheckoutTimingChoice`, history/panel) | High LANG-1 | UX-A content QA |
| Ops list may show raw DELIVERY/PICKUP badges | FACT | Operations order list client | Medium | UX-A workforce map |
| `listCheckoutScheduledWindows` requires checkoutId + auth | FACT | `checkout.ts` / router / scheduled-customer | High if ignored | Architecture Fit; DR-02 defer Menu slots |
| `listCheckoutPickupOptions` is checkout-bound / ownership-exact | FACT | pickup-options + router | High if reused without checkout | DR-05 separate read reusing eligibility domain |
| Implemented channels = WhatsApp + in-app only; EMAIL/SMS/PUSH are noop | FACT | `src/server/notifications/channels/index.ts` | High if DR-04 mis-scoped | AS-28; T1 content QA |
| `evaluateCart` today is location-centric advisory quote; may reuse open Checkout Snapshot | FACT | `cart/evaluate.ts` (`tryReusableCheckoutEvaluation`) | High for mode-sensitive extension + PAYMENT_PENDING | DR-05 Contract B precedence; AS-29 |
| Takeaway eligibility is accepting-now (closed outlet not eligible) | FACT | `pickup-eligibility.ts` | High if AS-08 invents Schedule-for-later Takeaway | AS-08 mode-split |
| delivery-context stores no serviceability outcome | FACT | `delivery-context.ts` shape | High for “confirmed” | Confirmed-state definition |
| Takeaway is better understood than Pickup for customers in Dehradun | PRODUCT_DECISION | FOUNDER_HEURISTIC_REVIEW | Medium if wrong | Post-ship mode-correction metric |
| Earlier How/Where/When reduces checkout hesitation | HYPOTHESIS | none measured | Medium | Primary metric in `09-…` |
| Compact Schedule is faster/calmer than long grid | HYPOTHESIS | none measured | Medium | Time-to-confirm Schedule |
| Workforce primary Takeaway label won’t harm ops precision | ASSUMPTION | Founder refinement A | Medium | Ops feedback; collection verbs retained |
| Pre-checkout server eligibility + mode-sensitive cart quote is acceptable without Menu exact slots | PRODUCT_DECISION (candidate) | Founder review recommendations DR-02/05 | High if mis-implemented as second seal | Fit contracts + AS-24–27 |
| Implemented-channel same-meaning is sufficient vs full channel rewrite | PRODUCT_DECISION (candidate) | Founder DR-04 | Medium | AS-28 content QA |

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
| Pickup eligibility domain shared | `listEligiblePickupOutletsForCheckout` |
| Cart evaluate location-centric; may reuse open Checkout | `evaluateCart` / `tryReusableCheckoutEvaluation` |
| Notification customer-visible content uses “Pickup order” / “Scheduled pickup window” / “Arrival / fulfilment window” | `src/shared/notifications/customer-visible-content.ts` (`renderCustomerVisibleNotificationContent`) |
| Channel adapters: WHATSAPP + IN_APP live; EMAIL/SMS/PUSH noop | `src/server/notifications/channels/index.ts` |
| PAYMENT_PENDING blocks fulfilment mutations | `server/checkout/fulfilment.ts` (existing) |
| delivery-context key | `boba.delivery-context.v1` |

## E. Canonical Product Definition Gate block (pre-gate draft)

```text
PRODUCT_DEFINITION_GATE
Capability: Unified Order Experience (working name; IMP NOT_ALLOCATED)
Product Definition Version: PD-UOE-CANDIDATE-2 (PRECHECKOUT_ELIGIBILITY_WEB_FIRST_V1)
Experience Criticality: X3
Change Risk: CR2 (CR3 at checkout/payment boundaries)
Linked Experience Definition: XD-UOE-CANDIDATE-2
Business Outcome: defined in 01-/02-
Primary Personas: defined in 01-
Journeys Defined: J1–J7 candidate
Story Map Complete: YES (candidate) in 04-
Acceptance Slice Defined: YES — see §A slicing dispositions
Happy Paths Defined: YES (candidate)
Alternate Paths Defined: YES (candidate)
Empty / First-Use States Defined: YES (candidate)
Error / Recovery Paths Defined: YES (candidate)
Authorization Variants Defined: PARTIAL — guest browse vs auth checkout windows; cart-credential eligibility/evaluate documented
Cross-Scope Scenarios Defined: N/A — no new cross-tenant admin scope
Concurrency Considered: YES (AS-16, AS-22, AS-27, AS-29)
Destructive Actions Defined: YES (AS-20 ineligible-line disposition)
Service / operational impact: see 03- service blueprint + §G surface table
Quality Attribute Profile: 02- §8
Unresolved Product Decisions: UOE-DR-01, UOE-DR-03
Architecture Conflicts: NONE identified against D-378/D-379 if Fit non-authority rules held; STOP on second commercial authority, client-invented eligibility, or divergent browse quote vs open Checkout Snapshot
PRODUCT_DEFINITION_GATE_EXECUTION: NOT_PERFORMED
Gate Result: NOT_PERFORMED

Founder Recommendations Incorporated: UOE-DR-02 (defer), UOE-DR-04 (WhatsApp+in-app), UOE-DR-05 (strengthen)
AGENT_DISPOSITION: RECOMMENDED_READY_FOR_EVALUATION (gaps listed; not RECOMMENDED_PASS)
```

## F. Canonical Experience Gate block (pre-gate draft)

```text
EXPERIENCE_GATE
Experience Intent defined: YES — 03-
User goal understood: YES — How/Where/When before pay; workforce same method labels
Entry / discoverability defined: YES — UX-C bar on Menu→Cart→Checkout (03-, 07-)
End-to-end journey defined: YES — J1–J7 in 01-; matrix §B
Information architecture defined: PARTIAL — bar + sheets in 07-; full site IA out of scope (#379 bound)
Information hierarchy defined: YES — How/Where/When; orientation ≠ Deliver to
Primary interaction defined: YES — MethodChooser / PlaceChooser / TimingChooser (07-)
Mental model / cognitive load considered: YES — Delivery/Takeaway + Now/Schedule; propose ≠ bind
Friction reviewed: YES — 03- friction audit (candidate; not pre-GTM audit)
Trust-sensitive moments considered: YES — fees/quotes, pending payment, fake address/time
Content strategy defined: YES — UX-A + LANG-1; WhatsApp+in-app (DR-04); receipts out of scope
Error / recovery defined: YES — AS-07–11, AS-16–18, AS-20, AS-23–27, AS-29
Mobile / responsive defined: YES — AS-12; sticky strip + sheet vs desktop chrome
Accessibility considered: YES — AS-13
Service / operational promise aligned where applicable: YES — 03- blueprint + §G
Performance experience considered: PARTIAL — generation/debounce/rate-limit noted in 06-; no perf budget claimed
Measurement intent defined: YES — 09- (formal Measurement Plan NOT_PERFORMED)
Research / evidence level disclosed: FOUNDER_HEURISTIC_REVIEW + FOUNDER_REVIEW_RECOMMENDATIONS (not customer research)
Unresolved experience decisions: UOE-DR-03 formal verdict; workforce admin noun table §G; UNCONFIRMED reason copy variants; Meta template body-vs-variable for WhatsApp
Result: NOT_PERFORMED

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
| Notifications — WhatsApp + in-app (**implemented**) | Same meaning as customer web (UOE-DR-04 / AS-28); no customer “fulfilment window” |
| Notifications — email/SMS/push | Out of scope while non-sending noop adapters |
| Receipts / tax invoices / vouchers | `NOT_IN_SCOPE` (D-365) |
