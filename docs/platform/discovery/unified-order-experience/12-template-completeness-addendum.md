<!-- AUTHORITY: NON_AUTHORITATIVE_DISCOVERY_DRAFT | PACKAGE: UOE-CANDIDATE-3 -->

# Template completeness addendum (canonical PD-2 / EXP-1 fields)

```text
STATUS: DISCOVERY_DRAFT_ADDENDUM
AUTHORITY: NON_AUTHORITATIVE
GATE_EXECUTION: NOT_PERFORMED
VARIANT: PRECHECKOUT_ELIGIBILITY_WEB_FIRST_V1
PACKAGE: UOE-CANDIDATE-3
GATE_PRECISION_REVISION: YES
```

This addendum supplies canonical template fields that must accompany
`PD-UOE-CANDIDATE-3` / `XD-UOE-CANDIDATE-3` before formal gate evaluation.
It does not execute or pass any gate.

## A. Acceptance slicing dispositions

| Slice class | Scope | Disposition |
|---|---|---|
| `V1_ACCEPTANCE_SLICE` | UX-A/B/C on web Menu→Cart→Checkout; primary workforce order-type labels; Checkout-bound exact Schedule windows; **server pre-checkout Takeaway eligibility (Now vs Schedule-capable) + mode/timing-sensitive Cart evaluate + provisional Offers** (DR-05 + GP-01/02); **in-app same-meaning + WhatsApp when sending** (DR-04); empty/first-use honesty (GP-03); tab-scoped presentation (GP-04); Snapshot missing-evidence fail-closed + fingerprint/dedup | In candidate |
| `EXPLICITLY_DEFERRED` | Exact Menu-level schedule preview API | UOE-DR-02 (Founder: defer) |
| `EXPLICITLY_DEFERRED` | Email/SMS/push (non-sending today); unbounded channel rewrite / new channel products | Beyond WhatsApp + in-app |
| `EXPLICITLY_DEFERRED` | Cross-tab presentation coordination bus | GP-04 — tab-scoped only in V1 |
| `NOT_IN_SCOPE` | Receipts / tax invoices / receipt vouchers (D-365 financial document authority) | Wording unchanged by this candidate |
| `NOT_SUPPORTED_BY_DESIGN` | Client-authored windows, payable, or confirmed geo; browse mutate `PAYMENT_PENDING`; domain/API renames; second commercial authority; divergent browse quote vs open Checkout Snapshot; Schedule denied solely because closed NOW; empty-cart “no outlets” | Hard stop |
| `NOT_SUPPORTED_BY_DESIGN` | Open-ended #379 site rewrite inside this candidate | Bound to A/B/C + DR-04/05 |

**Gate candidate variant:** `PRECHECKOUT_ELIGIBILITY_WEB_FIRST_V1` (CANDIDATE-3 gate-precision revision).

## B. Journey Completeness Matrix (J1 primary)

| Journey dimension | Behaviour / applicability | Story / AC |
|---|---|---|
| ENTRY | Arrive at Menu/Cart/Checkout with or without address/sign-in/cart lines | S-02, AS-01, AS-30 |
| DISCOVERY | Bar makes How/Where/When visible | S-01, AS-12 |
| CONTEXT | Mode, place, time intents + eligibility mirrors + cart quote | S-03–S-14, refinement D |
| EMPTY / FIRST USE | No Cart / Empty Cart / missing method/place/time honest CTAs; market orientation ≠ Deliver to; never “no outlets” for empty cart | AS-01, AS-30, AS-33, S-03 |
| HAPPY PATH | Confirm place/time at Checkout → Review → Pay | S-15, J1 |
| ALTERNATE VALID PATHS | Delivery↔Takeaway; Now↔Schedule; one/many outlets; Schedule-capable when closed NOW (Menu + Checkout) | AS-02–06, AS-08–09, AS-24–25, AS-31, AS-34 |
| VALIDATION FAILURE | Unsupported address; Now unavailable; no windows; window expired; eligibility UNAVAILABLE (with lines); invalid outlet | AS-07–11, AS-24, AS-36–37 |
| AUTHORIZATION | Guest browse OK; exact windows require authenticated Checkout; eligibility/evaluate within cart credentials; guest may hold cart token for eligibility/evaluate; no silent Checkout bind | S-10, AS-24–25, AS-30, AS-38 |
| NOT FOUND / STALE REFERENCE | Stale outlet/window/address refs cleared or revalidated | AS-14, AS-16, AS-20, AS-27, AS-36 |
| SERVER / NETWORK ERROR | Calm recovery; no invented slots/money/outlets; error ≠ permanent UNAVAILABLE (pre-checkout + Checkout pickup-options) | AS-16, AS-33 |
| RECOVERY | PAYMENT_PENDING recovery; cart conflict; new-order path; open-Checkout quote reuse; Now→Schedule when closed; missing evaluation fail-closed | AS-08, AS-17–18, AS-29, AS-34–46 |
| CONCURRENCY | Generation tokens; revision conflicts; tab-scoped multi-tab; stale eligibility; fingerprint mismatch; Checkout reuse precedence | AS-16, AS-22, AS-27, AS-29, AS-39–40, AS-46 |
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
| Implemented channels = IN_APP live; WHATSAPP = optional adapter else noop; EMAIL/SMS/PUSH noop | FACT | `src/server/notifications/channels/index.ts` | High if DR-04 claims WhatsApp always-on | AS-28; T1 content QA |
| Promotion eligibility may require fulfilmentMode / fulfilmentTiming | FACT | `src/shared/promotions/eligibility.ts` `matchesModeTiming` | High if Cart quote omits context or Menu locks provisional Offers | Contract B; AS-42–44 |
| `evaluateCart` today is location-centric advisory quote; may reuse open Checkout Snapshot after Delivery path | FACT | `cart/evaluate.ts` (`tryReusableCheckoutEvaluation`); early return without location | High for Takeaway-without-address + PAYMENT_PENDING | DR-05 Contract B precedence; AS-29/AS-31 |
| ASAP Takeaway eligibility is accepting-now | FACT | `pickup-eligibility.ts` | High if Schedule confused with Now | AS-08 / AS-24 split |
| SCHEDULED PICKUP evaluate/prepare/bind uses scheduled profile gates (not accepting-now) | FACT | `assertScheduledPickupProfile` in evaluate/prepare/scheduled-bind | High if CANDIDATE-2 denial retained | GP-01; AS-08 |
| Empty cart → ASAP pickup list `[]` | FACT | `listEligiblePickupOutletsForCheckout` | High if UX shows “no outlets” | GP-03; AS-30 |
| `sessionStorage` is tab-scoped; CustomEvents are same-tab | FACT | Web platform + `delivery-context.ts` | High if cross-tab money assumed | GP-04; AS-22 |
| delivery-context stores no serviceability outcome | FACT | `delivery-context.ts` shape | High for “confirmed” | Confirmed-state definition |
| Takeaway is better understood than Pickup for customers in Dehradun | PRODUCT_DECISION | FOUNDER_HEURISTIC_REVIEW | Medium if wrong | Post-ship mode-correction metric |
| Earlier How/Where/When reduces checkout hesitation | HYPOTHESIS | none measured | Medium | Primary metric in `09-…` |
| Compact Schedule is faster/calmer than long grid | HYPOTHESIS | none measured | Medium | Time-to-confirm Schedule |
| Workforce primary Takeaway label won’t harm ops precision | ASSUMPTION | Founder refinement A | Medium | Ops feedback; collection verbs retained |
| Pre-checkout server eligibility + mode-sensitive cart quote is acceptable without Menu exact slots | PRODUCT_DECISION (candidate) | Founder review recommendations DR-02/05 | High if mis-implemented as second seal | Fit contracts + AS-24–40 |
| Implemented-channel same-meaning is sufficient vs full channel rewrite | PRODUCT_DECISION (candidate) | Founder DR-04 | Medium | AS-28 content QA |
| Schedule-capable presentation without guaranteeing windows is acceptable | PRODUCT_DECISION (candidate) | GP-01 / UOE-DR-06 | High if copy overclaims | Experience Gate + Content QA |
| Checkout Mode→accepting-now-list→bind→evaluate(ASAP)→Timing is a defect vs IMP-036I | INFERRED / CONFLICT | AC-036I-040 / FD-036I-15 (for); US-036I-002 “IMP-036H rules” (against); code composition VERIFIED | High | UOE-DR-06 Founder classification |

## D. Current-state experience evidence (repository)

| Observation | Path / symbol (verified at package base) |
|---|---|
| Nav/menu deliver-to title always “Delivering to” | `display-label.ts` → `deliveryHeaderContext` |
| Soft Dehradun operating locality helper | `serviceability-copy.ts` → `deliverToOperatingAreaLocality` |
| Checkout mode buttons Delivery / Pickup | `CheckoutFulfilmentChoice` |
| Timing copy uses fulfil / ASAP | `CheckoutTimingChoice` |
| History uses Pickup / As soon as possible | `OrderHistoryClient` / fulfilment panel |
| Scheduled windows API checkout-scoped | `listCheckoutScheduledWindows({ checkoutId })` |
| Pickup options API checkout-scoped; **accepting-now-only** | `listCheckoutPickupOptions` → `listEligiblePickupOutletsForCheckout` |
| CheckoutClient Takeaway composition | `chooseFulfilmentMode` → `loadPickupOptions` → `continuePickupWithOutlet` (`setCheckoutFulfilment` + **`evaluateCheckout`**) → `openTiming` |
| ASAP merchandise denies current-schedule | `listEligiblePickupOutletsForCheckout` without `ignoreCurrentScheduleDenial` |
| NO_TIMES copy offers ASAP unconditionally | `scheduled-customer.ts` empty windows message |
| Checkout pickup-options error → UNAVAILABLE copy | `loadPickupOptions` + `CheckoutPickupOutletStep` (“No BOBA Bear location can take this order…”) |
| ASAP pickup eligibility accepting-now; empty cart `[]` | `listEligiblePickupOutletsForCheckout` |
| SCHEDULED PICKUP uses `assertScheduledPickupProfile` | checkout `evaluate.ts` / `prepare.ts` / `scheduled-bind.ts` |
| Cart evaluate location early return before reuse; missing evaluation / throw → null fall-through | `evaluateCart` / `tryReusableCheckoutEvaluation` |
| Notification customer-visible content uses “Pickup order” / “Scheduled pickup window” / “Arrival / fulfilment window” / reminder “scheduled Pickup” | `src/shared/notifications/customer-visible-content.ts` (incl. `SCHEDULED_FULFILMENT_REMINDER`) |
| Channel adapters: WHATSAPP + IN_APP live; EMAIL/SMS/PUSH noop | `src/server/notifications/channels/index.ts` |
| PAYMENT_PENDING blocks fulfilment mutations | `server/checkout/fulfilment.ts` (existing) |
| delivery-context key (tab-scoped sessionStorage) | `boba.delivery-context.v1` |

## E. Canonical Product Definition Gate block (pre-gate draft)

```text
PRODUCT_DEFINITION_GATE
Capability: Unified Order Experience (working name; IMP NOT_ALLOCATED)
Product Definition Version: PD-UOE-CANDIDATE-3 (PRECHECKOUT_ELIGIBILITY_WEB_FIRST_V1; GATE_PRECISION)
Experience Criticality: X3
Change Risk: CR2 (CR3 at checkout/payment boundaries)
Linked Experience Definition: XD-UOE-CANDIDATE-3
Business Outcome: defined in 01-/02-
Primary Personas: defined in 01-
Journeys Defined: J1–J7 candidate
Story Map Complete: YES (candidate) in 04-
Acceptance Slice Defined: YES — see §A slicing dispositions
Happy Paths Defined: YES (candidate)
Alternate Paths Defined: YES (candidate) — includes Schedule-capable Takeaway when closed NOW (Menu + Checkout)
Empty / First-Use States Defined: YES (candidate) — No Cart / Empty Cart / no eligible / error (GP-03)
Error / Recovery Paths Defined: YES (candidate) — AS-34–38 / AS-41 Checkout Schedule/outlet recovery; AS-39 / AS-45 missing evaluation evidence; AS-43 provisional Offer honesty
Authorization Variants Defined: YES — guest browse + cart-credential eligibility/evaluate; authenticated Checkout for exact windows + timing-aware pickup-options; guest empty/no-cart browse without UNAVAILABLE; open-Checkout reuse authority vs browse intent; no silent Checkout bind
Cross-Scope Scenarios Defined: N/A — no new cross-tenant admin scope
Concurrency Considered: YES (AS-16, AS-22, AS-27, AS-29, AS-39–40, AS-46; tab-scoped GP-04)
Destructive Actions Defined: YES (AS-20 ineligible-line disposition)
Service / operational impact: see 03- service blueprint + §G surface table
Quality Attribute Profile: 02- §8
Unresolved Product Decisions: UOE-DR-01, UOE-DR-03, UOE-DR-06 (confirm GP-01)
Architecture Conflicts: NONE identified against D-378/D-379/IMP-036I if Fit non-authority rules held; STOP on second commercial authority, client-invented eligibility, Schedule denied solely because closed NOW (incl. Checkout pickup-options), or divergent browse quote vs open Checkout Snapshot / missing-evidence fall-through
PRODUCT_DEFINITION_GATE_EXECUTION: NOT_PERFORMED
Gate Result: NOT_PERFORMED

Founder Recommendations Incorporated: UOE-DR-02 (defer), UOE-DR-04 (WhatsApp+in-app), UOE-DR-05 (strengthen)
Gate Precision: GP-01…GP-04 + Checkout contract precision + final contract completeness (AS-34–46); UOE-CANDIDATE-4 NOT_INTRODUCED
AGENT_DISPOSITION: RECOMMENDED_READY_FOR_EVALUATION (gaps listed; not RECOMMENDED_PASS)
```

## F. Canonical Experience Gate block (pre-gate draft)

```text
EXPERIENCE_GATE
Experience Intent defined: YES — 03-
User goal understood: YES — How/Where/When before pay; workforce same method labels
Entry / discoverability defined: YES — UX-C bar on Menu→Cart→Checkout (03-, 07-)
End-to-end journey defined: YES — J1–J7 in 01-; matrix §B
Information architecture defined: YES within bound — bar + Method/Place/Timing choosers + Checkout Review; full site IA out of scope (#379 bound); first-use/empty/error IA states specified (GP-03)
Information hierarchy defined: YES — How/Where/When; orientation ≠ Deliver to; Checkout mode authoritative when reuse
Primary interaction defined: YES — MethodChooser / PlaceChooser / TimingChooser (07-)
Mental model / cognitive load considered: YES — Delivery/Takeaway + Now/Schedule; propose ≠ bind; Now vs Schedule-capable Takeaway
Friction reviewed: YES — 03- friction audit (candidate; not pre-GTM audit)
Trust-sensitive moments considered: YES — fees/quotes, pending payment, fake address/time, closed-now Schedule honesty
Content strategy defined: YES — UX-A + LANG-1; WhatsApp+in-app (DR-04); receipts out of scope
Error / recovery defined: YES — AS-07–11, AS-16–18, AS-20, AS-23–27, AS-29–46; Now unavailable → Schedule when server hints candidates; Checkout composition recovery (AS-34–38 / AS-41); missing evaluation fail-closed (AS-39 / AS-45); provisional Offer honesty (AS-43–44); eligibility/pickup-options error retry; PAYMENT_PENDING recovery-first
Mobile / responsive defined: YES — AS-12; sticky strip + sheet vs desktop chrome
Accessibility considered: YES — AS-13
Service / operational promise aligned where applicable: YES — 03- blueprint + §G
Performance experience considered: PARTIAL — generation/debounce/rate-limit noted in 06-; no perf budget claimed
Measurement intent defined: YES — 09- (formal Measurement Plan NOT_PERFORMED)
Research / evidence level disclosed: FOUNDER_HEURISTIC_REVIEW + FOUNDER_REVIEW_RECOMMENDATIONS (not customer research)
Unresolved experience decisions: UOE-DR-03 formal verdict; UOE-DR-06 GP-01 confirm; workforce admin noun table §G; UNCONFIRMED reason / provisional-offer copy variants; Meta template body-vs-variable for WhatsApp
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
| Notifications — in-app (**always live adapter**) | Same meaning as customer web (UOE-DR-04 / AS-28); chooser labels Now/Schedule; sentence-form “scheduled collection / collection time” OK; no customer “fulfilment window”; no Pickup-as-peer |
| Notifications — WhatsApp (**optional sending**) | Same-meaning when Meta adapter is wired; default registry uses noop WhatsApp — do not claim active in every environment |
| Notifications — email/SMS/push | Out of scope while non-sending noop adapters |
| Receipts / tax invoices / vouchers | `NOT_IN_SCOPE` (D-365) |
