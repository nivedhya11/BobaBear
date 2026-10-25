<!-- AUTHORITY: NON_AUTHORITATIVE_DISCOVERY_DRAFT | ID: DR-UOE-CANDIDATE-3 -->

# Design Readiness candidate — Unified Order Experience

```text
CANDIDATE_ID = DR-UOE-CANDIDATE-3
SUPERSEDES = DR-UOE-CANDIDATE-2
STATUS = DESIGN_READINESS_CANDIDATE_ONLY
AUTHORITY = NON_AUTHORITATIVE_DISCOVERY_DRAFT
FORMAL_DESIGN_READINESS = NOT_PERFORMED
PREREQUISITES = Product Gate PASS + Experience Gate PASS + Architecture Fit PASS + Architecture Lock APPROVED (all recorded); Design Readiness PASS NOT_GRANTED
VARIANT = PRECHECKOUT_ELIGIBILITY_WEB_FIRST_V1
PACKAGE = UOE-CANDIDATE-3
GATE_PRECISION_REVISION = YES
IMPLEMENTATION_AUTHORIZED = NO
ARCHITECTURE_CONTRACT = ARCH-UOE-LOCK-PROPOSAL-1
BINDING_CAPABILITY_ARCHITECTURE = docs/platform/capabilities/UOE-unified-order-experience.md
CONTENT_QA_STATUS = CONTENT_QA_PENDING
WHATSAPP_META_TEMPLATES = NOT_INVENTED / PLATFORM_REGISTRY_INVENTORIED / META_BODY_NOT_ACCESSIBLE
OWNER_DECISION_PACKAGE = docs/platform/discovery/unified-order-experience/14-design-qt-mi-owner-decision-package.md
FOUNDER_DECISION_RECORD = docs/platform/discovery/unified-order-experience/15-founder-decision-record-and-gate-readiness-package.md
PRIMARY_MICROCOPY_WORKING_BASELINE = FOUNDER_APPROVED (W2, 2026-10-24) — not Design Readiness PASS
```

## Readiness claim boundary

This document specifies implementation-ready **interaction and presentation intent** for
Founder Design Readiness evaluation. It is **not** a passed Design Readiness gate.

```text
DESIGN_READINESS_PASS = NOT_GRANTED
APPLICATION_IMPLEMENTATION = NO
UOE_DR_06_REMEDIATION = NOT_AUTHORIZED
```

Locked domain contracts (A–D), CART digest/reuse, CHECKOUT fingerprint-only reuse, schedule
UNCONFIRMED rules, rate limits, privacy, §4.4 negatives, and WhatsApp Meta ownership remain in
the binding capability architecture. This candidate maps **presentation and interaction** onto
those contracts; it does not restate or alter them.

---

## 1. Screen and component composition

### 1.1 Surfaces

| Surface | Composition | Notes |
|---|---|---|
| Menu | Existing menu chrome + **proposed** `OrderContextBar` (sticky mobile / header-integrated desktop) | Bar may open sheet; no Menu exact slots (DR-02) |
| Cart | Existing cart chrome + bar + **proposed** `ImpactBanner` above totals | Advisory quote only; ≠ Snapshot |
| Checkout | Existing Checkout steps + bar (read-mostly when Checkout authoritative) + **Method → Place (timing-aware list) → Timing → Review** | Contract C interaction sequence in §1.3; Checkout composition **code** remediation remains `UOE-DR-06` / `REMEDIATION_NOT_AUTHORIZED` |
| Recovery | Existing pending-payment recovery route + **proposed** `PendingPaymentGuard` overlays | Preserve existing freeze; no new server guards |

### 1.2 Component inventory (proposed vs shipped)

| Component | Status | Responsibility | Reuse / extend (EXP-1 order) |
|---|---|---|---|
| `OrderContextBar` | **Proposed** | Strip: method · place · time; opens sheet/popover | Extend Menu/Cart sticky chrome patterns; do not invent a second commerce shell |
| `OrderContextSheet` | **Proposed** | Edit How / Where / When | Extend dialog/sheet patterns used by `MenuItemCustomizationDialog` / `StoreConfirmationDialog` (focus trap, Escape, return focus) |
| `MethodChooser` | **Proposed** | Delivery \| Takeaway | New chooser using existing button/segment patterns; transport maps to domain enums only |
| `PlaceChooser` | **Proposed** | Delivery location **or** Takeaway outlet from **server eligibility** | **Reuse/extend** `LocationSelector` + `DeliverToOrientation` for Delivery; Takeaway list is new but uses same list/selection semantics |
| `CheckoutPlaceConfirm` | **Proposed** (Checkout Place step) | Confirm proposed/selected outlet before bind | Distinct confirm control; propose ≠ bind |
| `TimingChooser` | **Proposed** | Now \| Schedule → (eligible Checkout) day → windows → confirm | Menu: intent + UNCONFIRMED only; Checkout: server windows |
| `OrientationLabel` | **Proposed** helper | “Ordering in {market}” | Extend `DeliverToOrientation` distinction; never styled as Deliver to |
| `ImpactBanner` | **Proposed** | Fees / offers / availability changed | Prefer existing status/banner primitives; server evaluate driven |
| `EligibilityResults` | **Proposed** region | Outlet list / AUTO_SELECT propose / empty / error | Distinct empty-cart vs UNAVAILABLE |
| `CheckoutReview` | Extend existing | Confirmed method/place/time + sealed money | Existing Review authority |
| `PendingPaymentGuard` | **Proposed** client guard | Blocks browse→mutate on PAYMENT_PENDING | Routes to existing recovery; preserves server freeze — **no new server guards** |
| Presentation maps | **Proposed** helpers | Customer + workforce + channel label helpers | LANG-1; no API rename |

### 1.3 Contract C — Checkout interaction sequence (specification only)

Locked journey (capability architecture §3.3):  
**Mode → timing-aware list → confirm outlet → `setCheckoutFulfilment` without evaluate → `listCheckoutScheduledWindows` → set SCHEDULED+window → `evaluateCheckout` → prepare → pay.**

| Step | UI | States | Notes |
|---|---|---|---|
| 1. Method | `MethodChooser` | Missing / selected | Delivery or Takeaway |
| 2. When-intent as list filter | Timing intent control (Now \| Schedule) **before** place list for Takeaway Schedule path | Intent only — not confirmed window | Filters listing; does **not** write SCHEDULED+null window solely to unlock list |
| 3. Place | `EligibilityResults` + `CheckoutPlaceConfirm` | Loading / empty / proposed / selected / error / confirm | Schedule-capable list when Schedule; per-outlet “Schedule only — not open for collection now” when closed now (copy candidates in §5; also `03-…`) |
| 4. Bind without evaluate | Confirm control → fulfilment write | Pending / success / revision conflict | **Forbidden:** bind → immediate ASAP `evaluateCheckout` before Timing |
| 5. Timing windows | `TimingChooser` | Loading / empty / valid / Now-disabled | Server windows only; Now disabled with reason when not accepting-now |
| 6. Evaluate → Review | `CheckoutReview` | Loading / sealed / indeterminate | Evaluate only after SCHEDULED+window (or eligible Now path) |
| 7. Prepare → pay | Existing payment UI | Existing pending/success/fail | Unchanged payment authority |

```text
CONTRACT_C_INTERACTION_SPECIFIED_IN_DESIGN = YES
UOE_DR_06_CHECKOUT_CODE_REMEDIATION = NOT_AUTHORIZED
FORBIDDEN_SEQUENCE = Mode → accepting-now-only list → bind → evaluateCheckout(ASAP) → Timing
```

Experience Intent detail and reason-variant strings also live in `03-experience-definition-candidate.md`
(Checkout path + UNCONFIRMED / schedule-only table). This section is the Design Readiness
interaction authority for implementation-ready sequencing; it does **not** authorize Checkout
source mutation.

---

## 2. State completeness (V1)

For each relevant component, states below are required before Design Readiness PASS. Domain
authority remains server-side; UI must never invent outlets, windows, or payable amounts.

### 2.1 Shared state vocabulary

| State | Meaning |
|---|---|
| Initial / missing | No customer choice yet; honest CTA |
| Loading / pending | In-flight eligibility, evaluate, windows, or bind |
| Empty / no-cart | Distinct from “no outlets” (GP-03 / AS-30) |
| Valid input | Server-accepted selection or confirmed bind |
| Invalid input | Client/server validation failure with recovery |
| Unauthorized / ineligible | Wrong credential, guest limits, or ineligible outlet/mode |
| Network / server error | Calm retry; not permanent UNAVAILABLE (AS-33) |
| Stale / revision conflict | Generation or fingerprint mismatch; drop stale mirror |
| Confirmed vs provisional | Confirmed = Checkout-bound / sealed; provisional = browse quote or UNCONFIRMED Schedule |
| Success | Stable confirmed presentation |
| Revisit / reload | Restore safe non-personal intent; no completed-checkout bleed (AS-21) |
| Disabled + required confirmation | Destructive clear / mode switch with explanation (AS-20) |

### 2.2 Per-component state matrix

| Component | Initial / missing | Loading | Empty / no-cart | Valid | Invalid | Unauthorized / ineligible | Network / server error | Stale / concurrency | Confirmed vs provisional | Success / revisit | Disabled / confirm |
|---|---|---|---|---|---|---|---|---|---|---|---|
| OrderContextBar | “Choose how / where / when” placeholders | Soft pending on strip fields | Show orientation; invite add items (not “no outlets”) | Selected method/place/time labels | Show conflict chip + open sheet | Guest OK for browse; Checkout-bound actions gated | Retry affordance; keep last safe labels | Tab-scoped only; no cross-tab seal (AS-22) | Provisional Schedule / propose ≠ confirmed Collect from | Reload restores non-PII intent | Disabled while PAYMENT_PENDING mutate blocked |
| OrderContextSheet | Open to first missing dimension | Disable primary until settle | Empty-cart CTAs inside place section | Apply updates intent | Inline errors | Auth walls only where Checkout required | Error region + retry | Close drops in-flight stale | UNCONFIRMED Schedule reason visible | Return focus to bar control | Escape closes; destructive needs confirm |
| MethodChooser | None selected | — | Allowed | Delivery / Takeaway selected | — | Mode unavailable for cart lines → explain | — | Intent change bumps generation | Selected ≠ sealed until Checkout | Persist intent tab-scoped | Switching clears incompatible place/time with explanation |
| PlaceChooser (Delivery) | “Add address” | Checking serviceability | — | Deliver to {address} when SERVICEABLE | Known·not deliverable | — | Retry; no fake SERVICEABLE | Stale serviceability discarded | Orientation ≠ Deliver to | Reload revalidates | — |
| PlaceChooser (Takeaway) | “Choose collection place” / add items first | Eligibility pending | `NO_CART` / `EMPTY_CART` invite | Proposed AUTO_SELECT or CUSTOMER_SELECT list | Invalid selected outlet → reselect (AS-36) | Ineligible outlet generic deny | Calm retry ≠ permanent UNAVAILABLE | Stale eligibility dropped (AS-27) | Proposed ≠ Collect from confirmed | Revisit re-reads eligibility | Confirm bind only at Checkout |
| TimingChooser | “Choose time” | Windows loading (Checkout only) | — | Now or confirmed window | Empty windows honest recovery (AS-35/37) | Schedule windows require eligible Checkout | Retry | Stale window list dropped | Schedule UNCONFIRMED at Menu; confirmed after Checkout window | Reload keeps UNCONFIRMED until Checkout | Now disabled with reason when not accepting-now |
| EligibilityResults | — | Skeleton / pending | Distinct empty-cart copy | Outlets + selectionPolicy | — | Empty eligible set with lines → UNAVAILABLE with recovery | Error ≠ UNAVAILABLE | Fingerprint mismatch hide list | Capability flags only | — | — |
| ImpactBanner | Hidden | — | Hidden | Shown when evaluate reason_class changes | — | — | Hide money on evaluate failure after intent change | Drop stale quote (AS-46) | Always provisional on Cart | Dismissible; reappears on new impact | — |
| Checkout Review | Incomplete steps | Evaluate pending | — | Sealed Snapshot totals | Missing evidence → fail-closed / Snapshot-only (AS-39/45) | PAYMENT_PENDING recovery-first | Retry without inventing money | Revision conflict force revalidate | Confirmed money only here | Success → confirmation language | Pay disabled until complete |
| PendingPaymentGuard | Inactive | — | — | Browse allowed within existing limits | Forbidden mutate blocked | — | — | — | Recovery is success path | After recover, new journey clean | Destructive abandon per existing rules |

---

## 3. Important journeys (interaction specification)

These specify UI behaviour only. Locked contracts remain authoritative.

| Journey | Expected interaction | Explicit non-behaviours |
|---|---|---|
| Closed-now outlet, Schedule-capable Takeaway | PlaceChooser Schedule path lists schedule-capable outlets; Timing shows Schedule intent; Checkout follows Contract C when authorized | No denial solely because closed NOW; no Menu exact slots; no availability guarantee |
| Schedule UNCONFIRMED before Checkout window | TimingChooser shows Schedule + UNCONFIRMED reason; Cart omits evaluated `SCHEDULED` timing | No Menu speculative exact slots; no locked SCHEDULED-only Offer savings |
| No Menu-level speculative exact slots | Menu/bar never render day/window grid from fabricated API | DR-02 deferred |
| Delivery location vs market orientation | OrientationLabel for market; Deliver to only after coords + SERVICEABLE | Never style orientation as Deliver to |
| Server-proposed vs confirmed collection outlet | Proposed AUTO_SELECT / list = provisional chrome; Collect from only after Checkout confirm/bind | Propose ≠ bind (AS-05/38) |
| Same-payable, different commercial-evaluation context | Impact/Review may refresh; measurement may count distinct CART occurrences | UI must not imply “same quote id” across mode·timing·outlet |
| Missing Checkout evaluation evidence | Fail-closed indeterminate **or** Snapshot-sourced display only | Never fall through to divergent browse money |
| Payment pending | Browse OK within existing limits; mutate blocked; guard routes to recovery | No browse rewrite of pending Checkout |
| No stale money after intent change | On mode/place/time change: hide prior quote until matching context returns | Never keep old-key money (AS-46) |

---

## 4. Accessibility and interaction

| Concern | Spec |
|---|---|
| Keyboard | Tab to bar controls; Enter/Space open sheet; arrow keys within chooser lists; Escape closes sheet/dialog |
| Focus entry / return | Opening sheet moves focus to heading or first control; close returns focus to invoking bar control; on validation/error, move focus to first error |
| Dialog / sheet | Prefer existing dialog/sheet patterns (`MenuItemCustomizationDialog` / `StoreConfirmationDialog`); focus trap while open; backdrop click = Escape unless destructive pending |
| Status announcements | `aria-live` (polite) for ImpactBanner, eligibility empty/unavailable, UNCONFIRMED reason, evaluate indeterminate |
| Selected states | Method/Timing as radiogroup (or equivalent exclusive selection) with clear selected semantics; outlet list option selected semantics — not ambiguous multi-`aria-pressed` without grouping |
| Destructive confirm | Explicit confirm dialog; default safe action = cancel / keep; focus to dialog title then primary/secondary per existing `StoreConfirmationDialog` pattern |
| Target sizes | Sticky strip controls ≥ 44×44 CSS px; desktop hit areas comfortable |
| Narrow screen | Sticky bottom or top strip + full-height sheet; no dual competing sticky carts; ImpactBanner and EligibilityResults stack full-width under bar |
| Tablet / md+ | Header-integrated bar + popover/dialog; avoid full-height sheet unless content requires |
| Perceived performance | ≥300 ms debounce after intent change (capability §4.1); skeleton on EligibilityResults; hide stale money on context mismatch; calm retry — never weaken Snapshot/payment for speed (budgets in capability §4.2) |
| Motion | Prefer reduced-motion: sheet/banner appear without large slide if `prefers-reduced-motion` |
| Contrast / zoom | Meet existing platform contrast; usable at 200% zoom without loss of bar CTAs |
| Navigation restoration | After recovery or successful pay, bar restores safe non-personal intent only; AS-15 session change revalidates and returns focus to bar or Checkout step |
| Names | No raw backend enums (`PICKUP`, `ASAP`, `FULFILMENT_*`) in accessible names |
| Analytics hooks | Component instrumentation intents cross-ref `09-measurement-instrumentation-candidate.md` events (bar view, method/place/timing, eligibility result, impact, pending guard) — schema/vendor remain Measurement-owner decisions |

---

## 5. Content QA — microcopy candidates

W2 recorded the primary in-app rows MC-01–MC-33 as a **working baseline** (`15-…` §1). That
record is not Design Readiness PASS and not a string freeze. `CONTENT_QA_PENDING` on a
baseline row means polish and freeze remain open. MC-34 on-wire WhatsApp stays
`NOT_APPROVED`. Post-purchase D-357 labels in `order-status.ts` (“Order received / accepted /
fulfilled / cancelled”) are outside this table and outside UX-A. All rows below remain
candidates relative to a gate PASS. Do **not** invent
approved Meta WhatsApp templates; WhatsApp Meta ownership stays per capability architecture §5.
Aligned strings from Experience Definition (`03-…`) are carried forward as candidates, not sign-off.

**Owner classification** (Founder immediate vs Content QA before tranche) is authoritative in
[`14-design-qt-mi-owner-decision-package.md`](./14-design-qt-mi-owner-decision-package.md) §1
(MC-01…MC-34). Summary table below remains the Design Readiness surface list.

| Topic | Candidate primary (customer) | Candidate alt / notes | Owner class | Status |
|---|---|---|---|---|
| Delivery vs Takeaway | Delivery / Takeaway | Never Pickup as peer of Delivery | FOUNDER_IMMEDIATE (chrome) / LOCKED_MEANING | CONTENT_QA_PENDING |
| Now vs Schedule | Now / Schedule | Now = earliest available, not “immediate” | FOUNDER_IMMEDIATE (protective) / LOCKED_MEANING | CONTENT_QA_PENDING |
| UNCONFIRMED scheduling (mode-aware) | Takeaway: “Time not confirmed yet — choose your collection window at checkout”; Delivery: “…delivery window at checkout” | Bar chip: “Schedule · not confirmed” | FOUNDER_IMMEDIATE | CONTENT_QA_PENDING |
| Provisional fees/offers | “Prices and offers may change when you confirm how and when” | ImpactBanner fee/offer/availability lines: Content QA polish | FOUNDER_IMMEDIATE | CONTENT_QA_PENDING |
| Stale commercial values | Hide prior money until matching context returns (AS-46) | Never ghost prior ₹ | FOUNDER_IMMEDIATE | CONTENT_QA_PENDING |
| Indeterminate commercial evaluation | “Couldn’t load your checkout total — continue checkout to see your total” | Never show competing browse total (`03-…`) | FOUNDER_IMMEDIATE | CONTENT_QA_PENDING |
| Outlet proposal vs confirmed | Proposed: “Suggested collection place”; Confirmed: “Collect from {name}” | Visual distinct chrome required | FOUNDER_IMMEDIATE | CONTENT_QA_PENDING |
| Checkout outlet schedule-only (closed now) | “Schedule only — not open for collection now” | Per-outlet list label (`03-…`) | FOUNDER_IMMEDIATE | CONTENT_QA_PENDING |
| Checkout Timing Now disabled | “Not open for collection right now — choose a Schedule time” | `03-…` | FOUNDER_IMMEDIATE | CONTENT_QA_PENDING |
| Payment-pending recovery | “Finish or recover your payment before changing this order” | Align with existing recovery copy | FOUNDER_IMMEDIATE | CONTENT_QA_PENDING |
| Empty / no-cart Takeaway | “Add items to see collection places” | Must not say brand-level “no outlets available” | CONTENT_QA_BEFORE_TRANCHE | CONTENT_QA_PENDING |
| Eligibility / pickup-options error | “Couldn’t load collection places — try again” | Must not become permanent UNAVAILABLE | CONTENT_QA_BEFORE_TRANCHE | CONTENT_QA_PENDING |
| No eligible outlet for timing | “No collection place can take this order for {Now\|Schedule} — try another time or method” | Distinct from empty-cart | CONTENT_QA_BEFORE_TRANCHE | CONTENT_QA_PENDING |
| No Schedule windows | “No times available — try Now if offered, another place, or come back later” | AS-09 / AS-35 / AS-37 | CONTENT_QA_BEFORE_TRANCHE | CONTENT_QA_PENDING |
| Invalid outlet / force reselect | “That collection place isn’t available — choose another” | AS-36 | CONTENT_QA_BEFORE_TRANCHE | CONTENT_QA_PENDING |
| Window expired / CHECKOUT_EXPIRED | “That time is no longer available — choose a new time” | AS-11 / AS-23 | FOUNDER_IMMEDIATE | CONTENT_QA_PENDING |
| Mode-switch / ineligible lines | Explain removal; confirm destructive clear | AS-20; default safe action = keep browsing / cancel clear | FOUNDER_IMMEDIATE | CONTENT_QA_PENDING |
| Orientation | “Ordering in {market}” | Never “Deliver to {market}” without address | LOCKED_MEANING | CONTENT_QA_PENDING |
| Date/time/money format | Outlet-TZ Today/Tomorrow; money from server only | LANG-1; AS-10 | CONTENT_QA_BEFORE_TRANCHE | CONTENT_QA_PENDING |
| Loading / capitalisation | Sentence case for status; avoid ALL-CAPS enums | LANG-1 | CONTENT_QA_BEFORE_TRANCHE | CONTENT_QA_PENDING |
| Sign-in for exact windows | “Sign in to choose your time” (or existing auth prompt pattern) | Guest browse OK; exact windows need Checkout auth | CONTENT_QA_BEFORE_TRANCHE | CONTENT_QA_PENDING |
| In-app Pickup → Takeaway (DR-04) | Platform `customer-visible-content` today says Pickup for PICKUP | API enum unchanged; customer primary → Takeaway/collection | FOUNDER_IMMEDIATE | CONTENT_QA_PENDING |
| WhatsApp Meta body | Platform registry inventoried in `14-…` §2; Meta bodies `NOT_ACCESSIBLE` | No invented ids; noop-safe preserved | FOUNDER_IMMEDIATE (on-wire deferral) | META_INVENTORY_INCOMPLETE |

Workforce primary labels follow refinement A (`12-…` §G). Ops collection verbs remain contextual.
**Recommended Founder disposition** (`14-…` §1.3): approve `FOUNDER_IMMEDIATE` primaries at Design
Readiness; allow `CONTENT_QA_BEFORE_TRANCHE` rows to close at T1/T2/T3 Content QA exit.

---

## 6. Traceability matrix (AS-01…AS-46)

Canonical scenario titles from `04-story-map-acceptance-scenarios.md`. Journey column uses those
titles; presentation mapping does not redefine AS identity.

| AS | Canonical scenario (`04-…`) | Screen / component | States exercised | Expected behaviour (presentation) | Verification reference | DR-06 code gate |
|---|---|---|---|---|---|---|
| AS-01 | No selected mode or location (browse Menu) | Bar, Method/Place/Timing | Initial, empty | Honest CTAs; orientation ≠ Deliver to; no “no outlets” solely because no cart lines | QT `08-…` AS-01 | — |
| AS-02 | Delivery → Takeaway | MethodChooser, PlaceChooser, ImpactBanner | Valid, loading, confirm | Eligibility-driven collection chrome; mode-sensitive quote; explain ineligible lines (AS-20) | QT AS-02 | — |
| AS-03 | Takeaway → Delivery | MethodChooser, PlaceChooser, ImpactBanner | Valid, invalid, loading | Needs address/serviceability; fees/offers recompute; unsupported explained | QT AS-03 | — |
| AS-04 | Mode-dependent charges and offers | ImpactBanner, Cart, Review | Provisional, confirmed | Attention copy; money from server evaluate/Snapshot only; pre-checkout advisory | QT AS-04 | — |
| AS-05 | One Takeaway outlet (pre-checkout + Checkout) | EligibilityResults, CheckoutPlaceConfirm | Provisional vs confirmed | Per-timing AUTO_SELECT propose; confirm before bind; no browse silent bind | QT AS-05 | — |
| AS-06 | Multiple Takeaway outlets | PlaceChooser, CheckoutPlaceConfirm | Valid, invalid | Explicit select from server list; no silent nearest | QT AS-06 | — |
| AS-07 | Unsupported Delivery address | PlaceChooser Delivery | Invalid | Browse OK; checkout/pay blocked with recovery | QT AS-07 | — |
| AS-08 | Outlet closed / Now unavailable (GP-01) | PlaceChooser, TimingChooser, Checkout Place | Valid, provisional, disabled | Schedule-capable path truthful; no NOW-only denial for Takeaway Schedule | QT AS-08 | Menu/eligibility OK; **Checkout list path blocked until DR-06 auth** |
| AS-09 | No Schedule windows | TimingChooser | Empty, recovery | Empty + recovery; Now if eligible | QT AS-09 | Checkout empty-windows path ↔ DR-06 when on Checkout composition |
| AS-10 | Cross-midnight / local-time formatting | TimingChooser window labels | Valid | Today/Tomorrow + labels match outlet TZ | QT AS-10 | — |
| AS-11 | Window expires before payment | TimingChooser, Review | Stale, recovery | Reselect; no stale Snapshot pay | QT AS-11 | — |
| AS-12 | Mobile / desktop bar | OrderContextBar/Sheet | Responsive | Sticky sheet vs header popover | QT AS-12 | — |
| AS-13 | Keyboard / SR / a11y | Sheet, choosers | A11y | Focus trap; selected; no jargon names | QT AS-13 | — |
| AS-14 | Saved address / location change | PlaceChooser | Loading, valid | Revalidate serviceability; no duplicate geo authority | QT AS-14 | — |
| AS-15 | Authentication / session changes | Bar, Checkout | Unauthorized, revisit | Preserve safe intent; revalidate; D-370 merge unchanged | QT AS-15 | — |
| AS-16 | Cart revisions and stale async responses | ImpactBanner, evaluate mirrors | Stale | Drop stale; truthful conflict | QT AS-16 | — |
| AS-17 | Pending historical payment | PendingPaymentGuard | Disabled, recovery | Browse OK; mutate blocked; recover first | QT AS-17 | — |
| AS-18 | New order versus previous checkout | Bar, Review | Revisit | No bleed from prior Snapshot | QT AS-18 | — |
| AS-19 | Workforce vs customer terminology | Presentation maps | Success | Delivery/Takeaway both sides | QT AS-19 + Content QA | — |
| AS-20 | Ineligible lines on mode switch | Cart, MethodChooser, confirm dialog | Disabled/confirm | Explain removal; confirm destructive | QT AS-20 | — |
| AS-21 | Revisit / reload / completed checkout | Bar | Revisit | Safe restore; no completed bleed | QT AS-21 | — |
| AS-22 | Multi-tab divergent intent (GP-04) | Bar (sessionStorage) | Stale / concurrency | Tab-scoped; no seal sync | QT AS-22 | — |
| AS-23 | CHECKOUT_EXPIRED mid-schedule | TimingChooser, Review | Recovery | Force reselect; no pay | QT AS-23 | — |
| AS-24 | Pre-checkout Takeaway eligibility read | EligibilityResults | Loading, empty, valid, error | Server outlets + policy; no checkoutId fab | QT AS-24 | — |
| AS-25 | Mode-sensitive Cart evaluate | ImpactBanner, Cart | Provisional | Quote updates; ≠ Snapshot | QT AS-25 | — |
| AS-26 | Proposed outlet ≠ confirmed place for windows | TimingChooser, PlaceChooser | Provisional | Windows blocked until Checkout confirm; UNCONFIRMED reason | QT AS-26 | — |
| AS-27 | Eligibility / evaluate race | EligibilityResults, ImpactBanner | Stale | Latest matching context wins | QT AS-27 | — |
| AS-28 | Implemented channel consistency (DR-04) | Presentation maps + notifications | Success | In-app always; WhatsApp when sending; noop OK | QT AS-28 + Content QA | — |
| AS-29 | Open Checkout mode ≠ browse intent | Cart, Review, Bar | Confirmed vs provisional | Checkout mode authoritative under reuse | QT AS-29 | — |
| AS-30 | No Cart / Empty Cart eligibility (GP-03) | PlaceChooser, EligibilityResults | Empty | Invite add items; not “no outlets” | QT AS-30 | — |
| AS-31 | Takeaway quote without Delivery address | Cart, ImpactBanner | Valid / ineligible | Outlet-known quote OK; without outlet → context required | QT AS-31 | — |
| AS-32 | CART evaluation provenance | Cart mirrors | Provisional | UI must not claim seal; equal money may still be new context | QT AS-32 / MI `09-…` | — |
| AS-33 | Eligibility / pickup-options error vs UNAVAILABLE | EligibilityResults, CheckoutPlaceConfirm | Error | Calm retry; not permanent UNAVAILABLE | QT AS-33 | Checkout pickup-options error path ↔ DR-06 |
| AS-34 | Closed now but Scheduled Takeaway possible (Checkout) | Checkout Place/Timing (§1.3) | Loading, valid, disabled Now | Timing-aware list; bind without evaluate before Timing | QT AS-34 | **Interaction specified; code remediation NOT_AUTHORIZED** |
| AS-35 | Outlet valid for Now but no future Schedule slots | TimingChooser | Empty Schedule | Honest empty + try Now | QT AS-35 | Checkout path ↔ DR-06 |
| AS-36 | Selected Checkout outlet becomes invalid | CheckoutPlaceConfirm | Invalid, recovery | Force reselect; no silent bind | QT AS-36 | Checkout path ↔ DR-06 |
| AS-37 | No Schedule times at eligible Checkout | TimingChooser | Empty | Recovery; Now only if accepting-now | QT AS-37 | Checkout path ↔ DR-06 |
| AS-38 | No silent Checkout binding from browse / list | PlaceChooser, CheckoutPlaceConfirm | Provisional vs confirmed | Customer confirm required | QT AS-38 | — |
| AS-39 | Open Checkout Snapshot without retrievable commercial evaluation | Review, Cart | Indeterminate | Fail-closed / Snapshot-only; never browse fall-through | QT AS-39 | — |
| AS-40 | Checkout effective mode/timing in UI under reuse | Bar, Review | Confirmed | Show Checkout mode/timing | QT AS-40 | — |
| AS-41 | Eligible-Checkout Scheduled Takeaway end-to-end (closed now) | Full §1.3 journey | Full state set | Contract C end-to-end interaction | QT AS-41 | **Interaction specified; code remediation NOT_AUTHORIZED** |
| AS-42 | Mode-gated Offer on Cart advisory quote | ImpactBanner | Provisional | Applies only with matching mode | QT AS-42 | — |
| AS-43 | Timing-gated Offer with Schedule UNCONFIRMED | ImpactBanner, TimingChooser | Provisional | No locked SCHEDULED-only savings at Menu | QT AS-43 | — |
| AS-44 | No Menu guarantee of slot or final promo price | Menu, Bar | Provisional | No specific window or final promo claim | QT AS-44 | — |
| AS-45 | Fail-closed when Snapshot exists but evaluation evidence missing | Review, Cart | Indeterminate | Same as AS-39 presentation rule | QT AS-45 | — |
| AS-46 | Evaluate context-key / dedup correctness for mode·timing·outlet | ImpactBanner | Stale | Hide money / retry; never two payables | QT AS-46 | — |

**Deferred under accepted scope (not missing):** Menu exact-slot preview API (UOE-DR-02);
email/SMS/push while noop; cross-tab presentation bus; Meta approved template bodies (Content QA /
Meta workflow); Checkout composition **code** fix (UOE-DR-06 remediation vehicle separate — interaction
still specified in §1.3).

---

## 7. Responsive patterns

| Viewport | Bar | Sheet / chooser | Review |
|---|---|---|---|
| Narrow (&lt; md) | Sticky strip; one-line summary | Full-height sheet; ImpactBanner + EligibilityResults full-width | Existing stacked Checkout |
| md / tablet | Header-integrated or compact sticky | Popover/dialog preferred over full sheet | Existing |
| Desktop | Header-integrated summary | Popover or dialog from bar control | Existing multi-step + summary column |
| Landscape phone | Prefer sheet over tiny popover | Same a11y rules | — |

---

## 8. Handoff to engineering (when authorized)

1. Shared presentation helpers (UX-A) before chrome rewrite — include in-app (+ WhatsApp when sending) (DR-04); Meta inventory before claiming on-wire WhatsApp DR-04
2. TimingChooser extractable for Checkout and bar (Menu remains intent-only for Schedule)
3. Order-context coordinator dual-reading delivery-context + eligibility/evaluate fingerprint keys (**tab-scoped**; GP-04)
4. Wire PlaceChooser to timing-aware pre-checkout eligibility read
5. Checkout timing-aware pickup-options + bind-without-evaluate on Schedule path (Contract C / AS-41) — **requires separately governed UOE-DR-06 remediation or later explicit authorization**; Design Readiness specification ≠ remediation authorization
6. Wire Cart impact to mode/timing-sensitive evaluate quote
7. Explicit tests for AS-01–46 per Quality plan tranche mapping

```text
FORMAL_DESIGN_READINESS = NOT_PERFORMED
DESIGN_READINESS_PASS = NOT_GRANTED
INDEPENDENT_REVIEW_VERDICT = PENDING_EXTERNAL_REVIEWERS
AGENT_MAY_NOT_SELF_GRANT_DESIGN_READINESS_PASS = YES
```
