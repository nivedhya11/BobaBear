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
WHATSAPP_META_TEMPLATES = NOT_INVENTED / CONTENT_QA_PENDING
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
| Checkout | Existing Checkout steps + bar (read-mostly when Checkout authoritative) + Timing / Place / Method steps + Review | Contract C sequencing is **specified** here; Checkout composition remediation remains `UOE-DR-06` / `REMEDIATION_NOT_AUTHORIZED` |
| Recovery | Existing pending-payment recovery route + **proposed** `PendingPaymentGuard` overlays | Preserve existing freeze; no new server guards |

### 1.2 Component inventory (proposed vs shipped)

| Component | Status | Responsibility | Reuse |
|---|---|---|---|
| `OrderContextBar` | **Proposed** | Strip: method · place · time; opens sheet/popover | Prefer existing sticky/header patterns |
| `OrderContextSheet` | **Proposed** | Edit How / Where / When | Prefer existing sheet/dialog primitives |
| `MethodChooser` | **Proposed** | Delivery \| Takeaway | Maps to domain enums in transport only |
| `PlaceChooser` | **Proposed** | Delivery location **or** Takeaway outlet from **server eligibility** | Reuse LocationSelector patterns; eligibility read (not fabricated checkout pickup-options) |
| `TimingChooser` | **Proposed** | Now \| Schedule → (eligible Checkout) day → windows → confirm | Menu: intent + UNCONFIRMED only |
| `OrientationLabel` | **Proposed** helper | “Ordering in {market}” | Never styled as Deliver to |
| `ImpactBanner` | **Proposed** | Fees / offers / availability changed | Server cart/checkout evaluate driven |
| `EligibilityResults` | **Proposed** region | Outlet list / AUTO_SELECT propose / empty / error | Distinct empty-cart vs UNAVAILABLE |
| `CheckoutReview` | Extend existing | Confirmed method/place/time + sealed money | Existing Review authority |
| `PendingPaymentGuard` | **Proposed** client guard | Blocks browse→mutate on PAYMENT_PENDING | Routes to recovery; preserves server freeze |
| Presentation maps | **Proposed** helpers | Customer + workforce + channel label helpers | LANG-1; no API rename |

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
| Focus entry / return | Opening sheet moves focus to heading or first control; close returns focus to invoking bar control |
| Dialog / sheet | Prefer existing design-system sheet/dialog; focus trap while open; backdrop click = Escape unless destructive pending |
| Status announcements | `aria-live` (polite) for ImpactBanner, eligibility empty/unavailable, UNCONFIRMED reason, evaluate indeterminate |
| Selected states | `aria-pressed` / selected for Method and Timing; outlet list option selected semantics |
| Target sizes | Sticky strip controls ≥ 44×44 CSS px; desktop hit areas comfortable |
| Narrow screen | Sticky bottom or top strip + full-height sheet; no dual competing sticky carts |
| Navigation restoration | After recovery or successful pay, bar restores safe non-personal intent only |
| Names | No raw backend enums (`PICKUP`, `ASAP`, `FULFILMENT_*`) in accessible names |

---

## 5. Content QA — microcopy candidates

All rows are **candidates**. Unapproved variants remain `CONTENT_QA_PENDING`. Do **not** invent
approved Meta WhatsApp templates; WhatsApp Meta ownership stays per capability architecture §5.

| Topic | Candidate primary (customer) | Candidate alt / notes | Status |
|---|---|---|---|
| Delivery vs Takeaway | Delivery / Takeaway | Never Pickup as peer of Delivery | CONTENT_QA_PENDING |
| Now vs Schedule | Now / Schedule | Now = earliest available, not “immediate” | CONTENT_QA_PENDING |
| UNCONFIRMED scheduling | “Time not confirmed yet — choose your collection window at checkout” | Shorter bar chip: “Schedule · not confirmed” | CONTENT_QA_PENDING |
| Provisional fees/offers | “Prices and offers may change when you confirm how and when” | ImpactBanner reason-specific lines TBD | CONTENT_QA_PENDING |
| Indeterminate commercial evaluation | “We couldn’t confirm your total — refresh or continue in checkout” | Never show competing browse total | CONTENT_QA_PENDING |
| Outlet proposal vs confirmed | Proposed: “Suggested collection place”; Confirmed: “Collect from {name}” | Visual distinct chrome required | CONTENT_QA_PENDING |
| Payment-pending recovery | “Finish or recover your payment before changing this order” | Align with existing recovery copy | CONTENT_QA_PENDING |
| Empty / no-cart Takeaway | “Add items to see collection places” | Must not say brand-level “no outlets available” | CONTENT_QA_PENDING |
| Orientation | “Ordering in {market}” | Never “Deliver to {market}” without address | CONTENT_QA_PENDING |
| WhatsApp Meta body | — | Inventory APPROVED templates; no invented ids | CONTENT_QA_PENDING / META_WORKFLOW |

Workforce primary labels follow refinement A (`12-…` §G). Ops collection verbs remain contextual.

---

## 6. Traceability matrix (AS-01…AS-46)

| AS | Journey / theme | Screen / component | States exercised | Expected behaviour (presentation) | Verification reference |
|---|---|---|---|---|---|
| AS-01 | Entry / missing context | Bar, Method/Place/Timing | Initial, empty | Honest CTAs; orientation ≠ Deliver to | QT `08-…` AS-01 |
| AS-02 | Choose Delivery | MethodChooser, PlaceChooser | Valid, loading | Delivery path; serviceability | QT AS-02 |
| AS-03 | Choose Takeaway | MethodChooser, PlaceChooser | Valid, loading | Takeaway; eligibility-driven place | QT AS-03 |
| AS-04 | Now timing | TimingChooser | Valid | Now intent; ASAP path at Checkout | QT AS-04 |
| AS-05 | AUTO_SELECT propose | EligibilityResults, PlaceChooser | Provisional vs confirmed | Propose ≠ bind; per-timing AUTO_SELECT | QT AS-05 |
| AS-06 | CUSTOMER_SELECT many outlets | PlaceChooser | Valid, invalid | Customer picks; invalid → reselect | QT AS-06 |
| AS-07 | Unsupported address | PlaceChooser Delivery | Invalid | Known·not deliverable; recovery | QT AS-07 |
| AS-08 | Closed now + Schedule-capable | PlaceChooser, TimingChooser | Valid, provisional | Schedule path available; no NOW-only denial | QT AS-08 |
| AS-09 | Delivery ↔ Takeaway switch | MethodChooser, ImpactBanner | Disabled/confirm, provisional | Explain impact; clear incompatible place | QT AS-09 |
| AS-10 | Day / window at Checkout | TimingChooser, Review | Loading, valid, empty | Server windows only; empty honest | QT AS-10 |
| AS-11 | Window expiry | TimingChooser, Review | Stale, recovery | Reselect; no stale Snapshot pay | QT AS-11 |
| AS-12 | Mobile / desktop bar | OrderContextBar/Sheet | Responsive | Sticky sheet vs header popover | QT AS-12 |
| AS-13 | Keyboard / SR | Sheet, choosers | A11y | Focus trap; pressed; no jargon names | QT AS-13 |
| AS-14 | Saved address change | PlaceChooser | Loading, valid | Revalidate serviceability | QT AS-14 |
| AS-15 | Auth / session change | Bar, Checkout | Unauthorized, revisit | Preserve safe intent; revalidate | QT AS-15 |
| AS-16 | Cart revision / stale async | ImpactBanner, evaluate mirrors | Stale | Drop stale; truthful conflict | QT AS-16 |
| AS-17 | PAYMENT_PENDING | PendingPaymentGuard | Disabled, recovery | Browse OK; mutate blocked; recover | QT AS-17 |
| AS-18 | New vs previous checkout | Bar, Review | Revisit | No bleed from prior Snapshot | QT AS-18 |
| AS-19 | Workforce vs customer labels | Presentation maps | Success | Delivery/Takeaway both sides | QT AS-19 + Content QA |
| AS-20 | Ineligible lines on mode switch | Cart, MethodChooser | Disabled/confirm | Explain removal; confirm destructive | QT AS-20 |
| AS-21 | Revisit / reload / completed | Bar | Revisit | Safe restore; no completed bleed | QT AS-21 |
| AS-22 | Multi-tab intent | Bar (sessionStorage) | Stale / concurrency | Tab-scoped; no seal sync | QT AS-22 |
| AS-23 | CHECKOUT_EXPIRED mid-schedule | TimingChooser, Review | Recovery | Force reselect; no pay | QT AS-23 |
| AS-24 | Pre-checkout eligibility | EligibilityResults | Loading, empty, valid, error | Server outlets + policy; no checkoutId fab | QT AS-24 |
| AS-25 | Mode-sensitive Cart evaluate | ImpactBanner, Cart | Provisional | Quote updates; ≠ Snapshot | QT AS-25 |
| AS-26 | Proposed ≠ windows unlock | TimingChooser, PlaceChooser | Provisional | Windows blocked until Checkout confirm | QT AS-26 |
| AS-27 | Eligibility/evaluate race | EligibilityResults, ImpactBanner | Stale | Latest matching context wins | QT AS-27 |
| AS-28 | Channel consistency (DR-04) | Presentation maps + notifications | Success | In-app always; WhatsApp when sending; noop OK | QT AS-28 + Content QA |
| AS-29 | Open Checkout ≠ browse intent | Cart, Review, Bar | Confirmed vs provisional | Checkout mode authoritative under reuse | QT AS-29 |
| AS-30 | No/Empty cart eligibility | PlaceChooser, EligibilityResults | Empty | Invite add items; not “no outlets” | QT AS-30 |
| AS-31 | Takeaway quote w/o Delivery address | Cart, ImpactBanner | Valid / ineligible | Outlet-known quote OK; without outlet → context required | QT AS-31 |
| AS-32 | CART provenance (presentation) | Cart mirrors | Provisional | UI must not claim seal; equal money may still be new context | QT AS-32 / MI `09-…` |
| AS-33 | Eligibility error vs UNAVAILABLE | EligibilityResults, Checkout place | Error | Calm retry; not permanent UNAVAILABLE | QT AS-33 |
| AS-34 | Checkout Schedule path (closed now) | Checkout Place/Timing | Loading, valid, disabled Now | Timing-aware list; bind without evaluate before Timing | QT AS-34 — **spec OK; remediation NOT_AUTHORIZED (UOE-DR-06)** |
| AS-35 | Now OK / no future slots | TimingChooser | Empty Schedule | Honest empty + try Now | QT AS-35 |
| AS-36 | Outlet becomes invalid | PlaceChooser Checkout | Invalid, recovery | Force reselect; no silent bind | QT AS-36 |
| AS-37 | No Schedule times at Checkout | TimingChooser | Empty | Recovery; Now only if accepting-now | QT AS-37 |
| AS-38 | No silent Checkout bind | PlaceChooser | Provisional vs confirmed | Customer confirm required | QT AS-38 |
| AS-39 | Missing evaluation + Snapshot | Review, Cart | Indeterminate | Fail-closed / Snapshot-only; never browse fall-through | QT AS-39 |
| AS-40 | Effective mode under reuse | Bar, Review | Confirmed | Show Checkout mode/timing | QT AS-40 |
| AS-41 | E2E Scheduled Takeaway Checkout | Checkout journey | Full state set | Contract C end-to-end interaction | QT AS-41 — **spec OK; remediation NOT_AUTHORIZED (UOE-DR-06)** |
| AS-42 | Mode-gated Offer on Cart | ImpactBanner | Provisional | Applies only with matching mode | QT AS-42 |
| AS-43 | Timing-gated Offer UNCONFIRMED | ImpactBanner, TimingChooser | Provisional | No locked SCHEDULED-only savings at Menu | QT AS-43 |
| AS-44 | No Menu slot/price guarantee | Menu, Bar | Provisional | No specific window or final promo claim | QT AS-44 |
| AS-45 | Fail-closed missing evidence | Review, Cart | Indeterminate | Same as AS-39 presentation rule | QT AS-45 |
| AS-46 | Context-key / dedup UX | ImpactBanner | Stale | Hide money / retry; never two payables | QT AS-46 |

**Deferred under accepted scope (not missing):** Menu exact-slot preview API (UOE-DR-02);
email/SMS/push while noop; cross-tab presentation bus; Meta approved template bodies (Content QA /
Meta workflow); Checkout composition code fix (UOE-DR-06 remediation vehicle separate).

---

## 7. Responsive patterns

| Viewport | Bar | Sheet / chooser | Review |
|---|---|---|---|
| Narrow (&lt; md) | Sticky strip; one-line summary | Full-height sheet | Existing stacked Checkout |
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

**Formal Design Readiness:** `NOT_PERFORMED` / `NOT_GRANTED`.  
**Agent disposition:** Candidate complete enough for Founder Design Readiness gate evaluation —
`RECOMMENDED_PASS` is an independent reviewer recommendation only; agents must not self-grant.
