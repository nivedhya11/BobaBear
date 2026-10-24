<!--
  AUTHORITY: NON_AUTHORITATIVE_DISCOVERY_DRAFT
  PACKAGE: UOE-CANDIDATE-3
  ID: UOE-FOUNDER-DESIGN-QT-MI-GATE-PACKAGE-R2
  APPLICATION_CODE_MUTATION: NO
  CANONICAL_LIFECYCLE_MUTATION: NO
  IMPLEMENTATION_AUTHORIZED: NO
  DESIGN_READINESS_PASS: NOT_GRANTED
  QUALITY_PLAN_FINALIZATION: NOT_GRANTED
  MEASUREMENT_PLAN_FINALIZATION: NOT_GRANTED
  UOE_DR_06_REMEDIATION: NOT_AUTHORIZED
-->

# Design / Quality / Measurement — Founder owner-decision package

```text
PACKAGE_ID = UOE-FOUNDER-DESIGN-QT-MI-GATE-PACKAGE-R2
PACKAGE = UOE-CANDIDATE-3
WAVE = BOBA-PREGTM-PARALLEL-EXECUTION-20261024
TASK = UOE-FOUNDER-DESIGN-QT-MI-GATE-PACKAGE-R2
BASE_HEAD = 6f5421a2c3338a1a4fb710a3f23f75ab61660728
PR = https://github.com/nivedhya11/BobaBear/pull/424
AUTHORITY = NON_AUTHORITATIVE_DISCOVERY_DRAFT
PRESERVE = PD-UOE-CANDIDATE-3 PASS | XD-UOE-CANDIDATE-3 PASS | ARCH-UOE-LOCK-PROPOSAL-1 LOCKED
REOPEN_PRODUCT_EXPERIENCE_ARCHITECTURE_GATES = FORBIDDEN
DESIGN_READINESS_PASS = NOT_GRANTED
UOE_QT_MI_FINALIZATION = NOT_GRANTED
UOE_DR06_CHECKOUT_REMEDIATION = NOT_AUTHORIZED
IMPLEMENTATION_AUTHORIZED = NO
FORMAL_IMP_IDENTITY = NOT_ALLOCATED
TESTS_EXECUTED_UNDER_THIS_PACKAGE = NONE
```

This package reconciles remaining **owner decisions** for Design Readiness, Content QA,
WhatsApp Meta inventory, Quality evidence acceptance, Measurement finalization, and the
**UOE-DR-06** corrective boundary. It does **not** grant any gate PASS, authorize
implementation, allocate an IMP, or remediate Checkout composition code.

Binding architecture remains
[`UOE-unified-order-experience.md`](../../capabilities/UOE-unified-order-experience.md).
Detail candidates remain `07-…` / `08-…` / `09-…`. This document is the Founder-facing
**decision ledger** for what still requires human owner resolution.

Wave authorization (packaging only — not gate PASS):
[PR #424 comment 6380384569](https://github.com/nivedhya11/BobaBear/pull/424#issuecomment-6380384569)
(“Founder-approved parallel execution wave — UOE owner and gate packaging”, 2026-10-24).

**Decision recording (W2):** the Founder's working-baseline approval of the proposals below
(`(A)+(B)` microcopy, WhatsApp on-wire NOT_APPROVED, MI-01…05, QT-01…04, DR06-B/C) is recorded in
[`15-founder-decision-record-and-gate-readiness-package.md`](./15-founder-decision-record-and-gate-readiness-package.md).
Row `Status` values in §1.2 below are the pre-decision values; the post-decision dispositions live
in `15-…` §1.3. No gate PASS is granted by either document.

The Founder-facing join of those records is
[`16-consolidated-design-qt-mi-final-decision-package.md`](./16-consolidated-design-qt-mi-final-decision-package.md)
(`PREPARED_FOR_FOUNDER`, still **NOT_GRANTED**). Tranche plans are `17-…`, `18-…`, and `19-…`.
The Checkout corrective plan is
[`20-uoe-dr-06-test-first-work-package.md`](./20-uoe-dr-06-test-first-work-package.md)
and remains **NOT_AUTHORIZED**. This ledger stays the string, registry, and proposal source.

---

## 0. Walls (unchanged)

| Wall | Value |
|---|---|
| `UOE_DESIGN_READINESS_PASS` | **NOT_GRANTED** — package for Founder; no agent self-approval |
| `UOE_QT_MI_FINALIZATION` | **NOT_GRANTED** |
| `UOE_DR06_CHECKOUT_REMEDIATION` | **NOT_AUTHORIZED** |
| Product / Experience / Architecture gates | **Preserve PASS / LOCKED** — do not reopen |
| IMP allocation / implementation | **NO** |

---

## 1. Design / Content — microcopy ownership ledger

Approved Product/Experience meaning (D1–D6, refinements A–D, UOE-DR-02/04/05/06 Schedule-capable
Takeaway) is **not** reopened. What remains is **primary string selection** and Content QA polish.

### 1.1 Classification key

| Class | Meaning |
|---|---|
| `FOUNDER_IMMEDIATE` | Promise, money trust, mode/timing primary labels, or recovery that can change customer understanding of How/Where/When/pay — Founder must approve before Design Readiness PASS |
| `CONTENT_QA_BEFORE_TRANCHE` | May close under Content QA before the owning tranche exit without reopening Product/Experience gates, provided LANG-1 and locked meaning are preserved |
| `LOCKED_MEANING` | Already Founder-approved at Product/Experience Gate; wording may polish but must not invert meaning |

### 1.2 Primary microcopy variants (reconciled)

| ID | Topic | Proposed primary (customer) | Alt / notes | Class | Status |
|---|---|---|---|---|---|
| MC-01 | Delivery vs Takeaway | **Delivery** / **Takeaway** | Never **Pickup** as peer of Delivery on customer chrome | `LOCKED_MEANING` + FOUNDER ratify exact chrome strings | CONTENT_QA_PENDING |
| MC-02 | Now vs Schedule | **Now** / **Schedule** | Now = earliest available, **not** “immediate” / “ASAP” as UI label | `LOCKED_MEANING` + FOUNDER protective Now sentence | CONTENT_QA_PENDING |
| MC-03 | Now protective | “Earliest available — not always immediate” (or equivalent) | May shorten on narrow strip | `FOUNDER_IMMEDIATE` | CONTENT_QA_PENDING |
| MC-04 | Deliver to / Collect from | **Deliver to {address}** / **Collect from {outlet}** | Confirmed place only | `LOCKED_MEANING` | CONTENT_QA_PENDING |
| MC-05 | Market orientation | **Ordering in {market}** | Never styled as Deliver to without address | `LOCKED_MEANING` | CONTENT_QA_PENDING |
| MC-06 | Schedule UNCONFIRMED (Takeaway) | “Time not confirmed yet — choose your collection window at checkout” | Bar chip: “Schedule · not confirmed” | `FOUNDER_IMMEDIATE` | CONTENT_QA_PENDING |
| MC-07 | Schedule UNCONFIRMED (Delivery) | “Time not confirmed yet — choose your delivery window at checkout” | Same chip pattern | `FOUNDER_IMMEDIATE` | CONTENT_QA_PENDING |
| MC-08 | UNCONFIRMED — not signed in | “Sign in to choose your time” | Auth prompt may reuse existing pattern | `CONTENT_QA_BEFORE_TRANCHE` | CONTENT_QA_PENDING |
| MC-09 | UNCONFIRMED — no place | “Add address / choose collection place before exact times” | Mode-aware split OK | `CONTENT_QA_BEFORE_TRANCHE` | CONTENT_QA_PENDING |
| MC-10 | UNCONFIRMED — proposed outlet | “Confirm your collection place at checkout to choose an exact time” | AS-26 | `FOUNDER_IMMEDIATE` | CONTENT_QA_PENDING |
| MC-11 | Provisional fees/offers | “Prices and offers may change when you confirm how and when” | Never imply sealed Snapshot | `FOUNDER_IMMEDIATE` | CONTENT_QA_PENDING |
| MC-12 | Impact — fee change | “Delivery or collection fees updated for your choices” | Exact fee words CONTENT_QA | `CONTENT_QA_BEFORE_TRANCHE` | CONTENT_QA_PENDING |
| MC-13 | Impact — offer change | “Offers updated for your choices” | No locked SCHEDULED-only savings at Menu (AS-43) | `FOUNDER_IMMEDIATE` (promise) / polish CONTENT_QA | CONTENT_QA_PENDING |
| MC-14 | Impact — availability | “Some items may not be available for your choices” | — | `CONTENT_QA_BEFORE_TRANCHE` | CONTENT_QA_PENDING |
| MC-15 | Stale / superseded quote | Hide prior money; on retry failure use MC-16 — never keep old-key totals (AS-46) | No “was ₹X” stale ghost | `FOUNDER_IMMEDIATE` | CONTENT_QA_PENDING |
| MC-16 | Indeterminate Checkout total | “Couldn’t load your checkout total — continue checkout to see your total” | Never show competing browse total (AS-39/45) | `FOUNDER_IMMEDIATE` | CONTENT_QA_PENDING |
| MC-17 | Snapshot-sourced under reuse | “Checkout total” / “Your checkout amount” | Not a Menu bargain | `FOUNDER_IMMEDIATE` | CONTENT_QA_PENDING |
| MC-18 | Proposed vs confirmed outlet | Proposed: “Suggested collection place”; Confirmed: “Collect from {name}” | Distinct chrome required | `FOUNDER_IMMEDIATE` | CONTENT_QA_PENDING |
| MC-19 | Checkout schedule-only (closed now) | “Schedule only — not open for collection now” | Per-outlet list (AS-34/41) | `FOUNDER_IMMEDIATE` | CONTENT_QA_PENDING |
| MC-20 | Checkout Timing Now disabled | “Not open for collection right now — choose a Schedule time” | — | `FOUNDER_IMMEDIATE` | CONTENT_QA_PENDING |
| MC-21 | Menu closed-now Schedule hint | “This place isn’t open for collection right now — you can Schedule a later collection time at checkout” | No Menu exact slots (DR-02) | `FOUNDER_IMMEDIATE` | CONTENT_QA_PENDING |
| MC-22 | Payment-pending recovery | “Finish or recover your payment before changing this order” | Align existing recovery route; no new server guards | `FOUNDER_IMMEDIATE` | CONTENT_QA_PENDING |
| MC-23 | Empty / no-cart Takeaway | “Add items to see collection places” | Must not say brand-level “no outlets available” (AS-30) | `CONTENT_QA_BEFORE_TRANCHE` | CONTENT_QA_PENDING |
| MC-24 | Eligibility load error | “Couldn’t load collection places — try again” | ≠ permanent UNAVAILABLE (AS-33) | `CONTENT_QA_BEFORE_TRANCHE` | CONTENT_QA_PENDING |
| MC-25 | No eligible for timing | “No collection place can take this order for {Now\|Schedule} — try another time or method” | Distinct from empty-cart | `CONTENT_QA_BEFORE_TRANCHE` | CONTENT_QA_PENDING |
| MC-26 | No Schedule windows | “No times available — try Now if offered, another place, or come back later” | AS-09/35/37 | `CONTENT_QA_BEFORE_TRANCHE` | CONTENT_QA_PENDING |
| MC-27 | Invalid outlet reselect | “That collection place isn’t available — choose another” | AS-36 | `CONTENT_QA_BEFORE_TRANCHE` | CONTENT_QA_PENDING |
| MC-28 | Window expired / CHECKOUT_EXPIRED | “That time is no longer available — choose a new time” | AS-11/23 | `FOUNDER_IMMEDIATE` | CONTENT_QA_PENDING |
| MC-29 | Mode-switch / ineligible lines | Explain removal; confirm destructive clear; default safe = cancel clear | AS-20 | `FOUNDER_IMMEDIATE` (destructive) | CONTENT_QA_PENDING |
| MC-30 | Date/time/money format | Outlet-TZ Today/Tomorrow; money from server only | LANG-1 | `CONTENT_QA_BEFORE_TRANCHE` | CONTENT_QA_PENDING |
| MC-31 | Loading / capitalisation | Sentence case; no ALL-CAPS enums in UI | LANG-1 | `CONTENT_QA_BEFORE_TRANCHE` | CONTENT_QA_PENDING |
| MC-32 | Workforce primary | Delivery / Takeaway (same meaning) | Contextual ops verbs allowed (`12-…` §G) | `LOCKED_MEANING` | CONTENT_QA_PENDING |
| MC-33 | In-app notification Pickup→Takeaway | Platform `customer-visible-content` today says **Pickup** for `PICKUP` mode | DR-04: primary customer meaning → **Takeaway** / collection; API enum stays `PICKUP` | `FOUNDER_IMMEDIATE` (DR-04 wording) | CONTENT_QA_PENDING |
| MC-34 | WhatsApp body vs variable | See §2 — **no invented Meta bodies** | Noop-safe environments satisfy DR-04 via in-app only | `FOUNDER_IMMEDIATE` for on-wire claim | META_INVENTORY_INCOMPLETE |

### 1.3 Founder immediate vs Content QA close (summary)

**Founder approval required before Design Readiness PASS** (MC-03, MC-06–07, MC-10–11, MC-13, MC-15–22, MC-28–29, MC-33–34):

1. Exact primary strings for Delivery/Takeaway, Now/Schedule, and Now protective sentence  
2. Schedule UNCONFIRMED + proposed-outlet + closed-now Schedule-only / Now-disabled strings  
3. Provisional quote / impact / indeterminate / Snapshot-reuse money language  
4. Payment-pending recovery primary CTA  
5. Destructive mode-switch confirmation posture  
6. Whether in-app DR-04 **Takeaway** replacement for “Pickup” wording is approved for T1  
7. Whether WhatsApp on-wire DR-04 may remain **deferred** to Content QA + Meta workflow after Design Readiness (recommended: **yes**, with noop-safe AS-28)

**Content QA may close before tranche acceptance** (MC-08–09, MC-12, MC-14, MC-23–27, MC-30–31, workforce contextual verbs): secondary reason variants, Impact line polish, empty/error/recovery lists, format/capitalisation — without changing locked meaning.

```text
FOUNDER_DECIDES_AT_DESIGN_READINESS =
  (A) Approve FOUNDER_IMMEDIATE primary strings as listed (or mark edits), AND
  (B) Allow remaining CONTENT_QA_BEFORE_TRANCHE rows to close at T1/T2/T3 Content QA exit, OR
  (C) Require full string list freeze before Design Readiness PASS
RECOMMENDED = (A) + (B)
```

---

## 2. WhatsApp — Meta template inventory (no invention)

```text
WHATSAPP_META_BODY_INVENTION = FORBIDDEN
WHATSAPP_NOOP_SAFE = PRESERVED
DR04_ON_WIRE_CLAIM_WITHOUT_META_EVIDENCE = FORBIDDEN
```

### 2.1 Verified platform registry (repository / migrations)

Source: `drizzle/0033_notifications.sql`, `drizzle/0034_meta_whatsapp_adapter.sql`,
`drizzle/0046_imp036i_tranche4_cancellation_reminder.sql`. Platform status `APPROVED` means the
**internal** sendable registry status (IMP-033/034). It is **not** independently verified Meta
Business Manager approval of a body string in this package.

| semantic_type | template_key | channel | locale | version | platform status | provider_template_ref | variable_schema_json |
|---|---|---|---|---|---|---|---|
| ORDER_RECEIVED | order_received | WHATSAPP | en-IN | 1 | APPROVED | order_received | `[]` |
| PAYMENT_CONFIRMED | payment_confirmed | WHATSAPP | en-IN | 1 | APPROVED | payment_confirmed | `[]` |
| ORDER_ACCEPTED | order_accepted | WHATSAPP | en-IN | 1 | APPROVED | order_accepted | `[]` |
| ORDER_CANCELLED | order_cancelled | WHATSAPP | en-IN | 1 | APPROVED | order_cancelled | `[]` |
| OUT_FOR_DELIVERY | out_for_delivery | WHATSAPP | en-IN | 1 | APPROVED | out_for_delivery | `[]` |
| DELIVERED | delivered | WHATSAPP | en-IN | 1 | APPROVED | delivered | `[]` |
| SCHEDULED_FULFILMENT_REMINDER | scheduled_fulfilment_reminder | WHATSAPP | en-IN | 1 | APPROVED | scheduled_fulfilment_reminder | `[]` |

Notes (VERIFIED):

- Seed initially set `provider_template_ref` NULL; migration `0034` sets it equal to `template_key`
  where null.
- All listed rows have **empty** `variable_schema_json` (`[]`) in migrations — **no typed Meta
  variables declared in-repo**.
- **Meta template BODY text:** `NOT_FOUND` in repository. Not inventable here.
- **Meta Business Manager approval status for those names:** `UNVERIFIED` from this worktree
  (no WABA/Graph credentials or export attached to this package).

### 2.2 Platform customer-visible wording (in-app / content authority)

Source: `src/shared/notifications/customer-visible-content.ts` (VERIFIED). Current PICKUP-mode
summaries use the word **Pickup** (e.g. “Your Pickup order has been accepted.”). UOE-DR-04
customer primary meaning is **Takeaway** / collection. Changing platform wording is a future
authorized implementation + Content QA item — **not** performed here.

Meta send path uses `provider_template_ref` as Meta template `name` with validated variables
(`validateTemplateVariables`). Empty schema ⇒ no body parameters from platform today.

### 2.3 Noop-safe behaviour (preserve)

| Rule | Disposition |
|---|---|
| Adapter may be noop (`NOT_SENT`) | Environments without WhatsApp send still valid |
| `NOT_SENT` ≠ send success | AS-28 / §4.4 #16 |
| `NOT_SENT` ≠ product failure | Customer journey must not fail closed solely because WhatsApp noop |
| DR-04 in noop env | Satisfied by **in-app** same-meaning consistency |
| DR-04 on-wire WhatsApp | Requires Meta APPROVED template evidence (body vs variable) before claim |

### 2.4 Owner decisions (WhatsApp)

| ID | Decision | Owner | Proposed disposition |
|---|---|---|---|
| WA-01 | Export Meta APPROVED template **bodies** + categories for the seven `provider_template_ref` names (or document that Meta has no such templates) | Notification ops + Content QA | Required before WhatsApp-sending env claims DR-04 on-wire |
| WA-02 | If Meta BODY hard-codes “Pickup”, submit Meta edit/new template; do not invent ids in discovery | Content QA + Meta workflow | Design Readiness may PASS with on-wire deferred |
| WA-03 | If fulfilment label is (or becomes) a Meta **variable**, prefer variable-value update under schema + `validateTemplateVariables` | Content QA + Notification ops | Preferred when Meta allows |
| WA-04 | Keep noop-safe AS-28 / §4.4 #16 mandatory in Quality plan | Quality | **Proposed LOCK for QT finalization** |

```text
WHATSAPP_INVENTORY_COMPLETENESS = PLATFORM_REGISTRY_ONLY
META_BODY_EVIDENCE = NOT_ACCESSIBLE_IN_REPO
FOUNDER_DECIDES = Design Readiness PASS may proceed with WhatsApp on-wire DR-04 deferred to Content QA + Meta workflow (RECOMMENDED) OR hold Design Readiness until WA-01 evidence attached
```

---

## 3. Quality — test-evidence acceptance matrix (finalized proposal)

Authority: TEST-1 + binding capability architecture §4.4 (21 negatives) + `08-quality-test-plan-candidate.md`.

```text
FORMAL_QUALITY_PLAN = NOT_PERFORMED
QUALITY_PLAN_FINALIZATION = NOT_GRANTED
TESTS_EXECUTED_UNDER_THIS_PACKAGE = NONE
SYNTHETIC_COMPARATOR_ONLY ≠ PAYMENT_PREPARE_PROOF = YES
```

### 3.1 Evidence status vocabulary

| Status | Meaning |
|---|---|
| `PLANNED` | Specified for future authorized implementation — **not** executed |
| `EXECUTED` | Machine or recorded human proof exists on an authorized candidate (none under this package) |
| `BLOCKED_DR06` | Spec + planned tests exist; **passing** Checkout composition proof blocked until UOE-DR-06 remediation authorized |
| `PRESERVE_RED` | Before remediation, reproducing RED against current Checkout is required (TEST-1) |

### 3.2 AS-01…AS-46 acceptance (rollup)

Full per-AS planned layers remain in `08-…` §2. Owner acceptance rule for **tranche / V1 exit**:

| Bucket | AS set | Acceptance rule |
|---|---|---|
| Menu / Cart / eligibility (no Checkout rewrite) | AS-01–07, AS-08 (Menu/eligibility), AS-10–33, AS-38–40, AS-42–46 | Automated and/or scripted Founder UAT evidence **PLANNED→EXECUTED** under future impl auth |
| Checkout composition dependent | AS-08 (Checkout list), AS-09/33 Checkout paths, AS-34–37, AS-41 | Remain `BLOCKED_DR06` / `PRESERVE_RED` until remediation authorized; **must not** be deleted or reclassified to obtain PASS |
| Content / channel | AS-19, AS-28, AS-44 | Content QA + in-app; WhatsApp on-wire env-dependent |
| A11y / responsive | AS-12, AS-13 | X3 a11y QA recorded |
| Security ownership | SEC-BOLA-CHECKOUT + §4.4 #1–21 | All **PLANNED**; required green on authorized candidate; regression when Contract C implemented |

### 3.3 Contracts A–D

| Contract | Exit evidence | DR-06 coupling |
|---|---|---|
| A Pre-checkout eligibility | Domain/HTTP/Auth/Concurrency proofs for AS in `08-…` Contract A rollup | None for Menu/eligibility; Checkout pickup-options error paths may couple |
| B Mode-sensitive Cart evaluate | Domain/HTTP/Recovery; DB when schema authorized; advisory quote ≠ Snapshot / ≠ prepare | None |
| C Scheduled Takeaway Checkout | Full Contract C journey + SEC-BOLA-CHECKOUT | **Blocked** until UOE-DR-06 remediation authorized |
| D Presentation / channels | Component/A11y/Content QA | None |

### 3.4 Negative security suite (§4.4 — 21)

Every row in `08-…` §3 remains **PLANNED** / not executed here. Acceptance for Quality finalization
proposal: **all 21 + SEC-BOLA-CHECKOUT** must be mapped to automated tests before implementation
authorization claims security complete. No row may be waived by this package.

### 3.5 Explicit non-claims (binding for reviewers)

- Advisory Cart evaluate / quote tests **do not** prove payment preparation  
- Fingerprint / digest comparator-only checks **do not** prove prepare/pay  
- Architecture Lock recording **is not** executed behavioural proof  
- AS-34/AS-41 green **cannot** be claimed against current Checkout composition  

### 3.6 Founder Quality decisions

| ID | Decision | Proposed |
|---|---|---|
| QT-01 | Accept PLANNED matrix in `08-…` + this rollup as the Quality Plan candidate for independent review | YES |
| QT-02 | Keep AS-34/41 (and listed Checkout-coupled AS) `BLOCKED_DR06` with `PRESERVE_RED` — no quiet deferral that deletes the obligation | YES |
| QT-03 | Allow Design Readiness / Measurement packaging to proceed while Quality remains NOT_FINALIZED pending independent review | YES (wave intent) |
| QT-04 | Payment prepare/pay proof standard remains existing payment authority tests + Contract C integration when remediation lands — never quote-only | YES |

---

## 4. Measurement — concrete ownership proposal

Authority: EXP-1 X3 measurement intent; capability architecture Offer-result / fingerprint rules;
`09-measurement-instrumentation-candidate.md`.

```text
FORMAL_MEASUREMENT_PLAN = NOT_PERFORMED
MEASUREMENT_PLAN_FINALIZATION = NOT_GRANTED
NO_CLAIMED_CONVERSION_LIFT = YES
RAW_CART_EVALUATION_COUNTS_AS_CUSTOMER_CONVERSION_DENOMINATOR = FORBIDDEN
CHECKOUT_REUSE_AND_COMMERCIAL_STATE_CHANGE = FINGERPRINT_ONLY
EVALUATION_CONTEXT_DIGEST_CLIENT_OR_LOGS = FORBIDDEN
EXACT_STREET_IN_ANALYTICS = FORBIDDEN
```

### 4.1 Proposed ownership

| Surface | Proposed owner | Scope |
|---|---|---|
| UX funnel events (`order_context_*`, eligibility, impact, timing, pending guard) | **Product analytics owner** (Founder-designated; default = Founder until delegated) | Event identity, dedupe, retention class, dashboard definitions |
| `order_checkout_start` / `order_payment_success` | **Commerce analytics owner** (same as existing payment/checkout journey metrics; default = Founder until delegated) | Primary KPI numerator/denominator |
| `order_commercial_state_change` / CHECKOUT Offer-result | **Existing IMP-036J measurement authority** | **Preserve** fingerprint-only; no UOE rewrite |
| Privacy / retention sign-off | **Privacy owner** + Product analytics | Align with privacy retention matrix; no digest/PAN/street |
| Vendor / transport | **DECISION_REQUIRED** — do not invent a second telemetry platform | Prefer extending existing authorized analytics path when one exists; else Founder selects |

### 4.2 Event identity (candidate — not implemented)

Event names and grains in `09-…` §4 remain the candidate contract. Proposed **identity keys**:

| Event | Identity / dedupe key (proposed) |
|---|---|
| `order_context_bar_view` | `session_id` + `surface` (once per surface per session) |
| `order_method_intent_set` | `session_id` + generation; collapse identical consecutive mode |
| `order_place_state` | `session_id` + transition id |
| `order_takeaway_eligibility_result` | server `request_id` / generation |
| `order_cart_evaluate_impact` | matching evaluate context key result — **never** conversion denominator |
| `order_cart_evaluate_reuse` | `checkout_id` + revision |
| `order_timing_intent_set` | `session_id` + timing confirmation class |
| `order_schedule_window_selected` | `checkout_id` + window bind |
| `order_impact_banner_shown` | context key + `reason_class` (once) |
| `order_pending_payment_guard` | pending checkout episode (once) |
| `order_checkout_start` | **`checkout_id`** (once) — **primary denominator** |
| `order_payment_success` | successful payment / order id linked to `checkout_id` (once) — **primary numerator** |
| `order_commercial_state_change` | existing CHECKOUT fingerprint semantics — **LOCKED** |

### 4.3 Denominators and anti-patterns

| Metric | Denominator | Forbidden |
|---|---|---|
| Primary conversion | Checkout starts → successful payment | Raw CART evaluation count; ImpactBanner impressions; eligibility request count |
| Takeaway discovery | Eligibility views with non-empty outlets | Treating empty-cart responses as “no demand” |
| Schedule funnel | Sessions with Schedule intent | Menu UNCONFIRMED as confirmed window |
| CART advisory “views” (reporting only) | Normalized journey/context buckets from **server** provenance | Emitting digest/mode/outlet secrets to client analytics |

### 4.4 Retention (proposed — owner ratification)

| Class | Proposed retention | Notes |
|---|---|---|
| Operational UX funnel events | 90 days hot / 13 months aggregate (candidate) | No PII street; no digests |
| Commerce checkout/payment journey | Align with existing payment analytics retention | Do not invent parallel store |
| CHECKOUT commercial-state | Preserve IMP-036J policy | Fingerprint-only |

Exact numbers remain **DECISION_REQUIRED** for privacy + analytics owners.

### 4.5 Baseline plan (proposed)

| Step | Proposal |
|---|---|
| Pre-enablement | Capture ≥14 days checkout-start → pay success on current UI before T3 bar enablement (`BASELINE = NOT_PERFORMED` until then) |
| Observation window | 14–28 days post-enablement |
| Interpretation | Directional only; selection bias disclosed; no ship/no-ship solely from lift |
| Guardrails | Payment failure rate; invalid-window at pay; support spikes; unauthorized client money incidents |

### 4.6 Founder Measurement decisions

| ID | Decision | Proposed |
|---|---|---|
| MI-01 | Ratify Product vs Commerce analytics ownership split above (or name delegates) | YES |
| MI-02 | Ratify primary KPI grain = checkout session / checkout id — **forbid** CART eval denominator | YES |
| MI-03 | Preserve CHECKOUT fingerprint-only + event privacy bans | YES |
| MI-04 | Accept vendor/transport as DECISION_REQUIRED without blocking Design packaging | YES |
| MI-05 | Accept baseline NOT_PERFORMED until pre-T3 capture authorized | YES |

---

## 5. UOE-DR-06 boundary — smallest separately authorized corrective

### 5.1 Product commitment (accepted — do not reopen)

Closed-now but **Schedule-capable Takeaway** journey is an accepted Product commitment
(UOE-DR-06). Menu exact slots remain deferred (UOE-DR-02). No availability guarantee at Menu.

### 5.2 Defect (accepted — not remediated here)

```text
DEFECT = Checkout Mode → accepting-now-only list → bind → evaluateCheckout(ASAP) → Timing
REQUIRED = Mode → timing-aware list → confirm → setCheckoutFulfilment without evaluate
           → listCheckoutScheduledWindows → set SCHEDULED+window → evaluateCheckout → prepare → pay
CLASSIFICATION = ACCEPTED_CAPABILITY_CONFORMANCE_DEFECT
REMEDIATION = NOT_AUTHORIZED by UOE package or this wave
AS_OBLIGATION = AS-34 / AS-41 (and Checkout-coupled AS-08/09/33/35/36/37) remain in gate matrix
```

### 5.3 Smallest separately authorized corrective (proposal only)

| Field | Proposal |
|---|---|
| Name | `UOE-DR-06-CHECKOUT-COMPOSITION-CORRECTIVE` (working title) |
| Shape | Separately scoped corrective **after** urgent payment work (Founder preference already recorded) |
| In scope | Checkout Schedule Takeaway composition only: timing-aware pickup-options listing; bind-without-evaluate; Timing windows; Now disabled from `nowEligible`; expectedRevision conflicts; SEC-BOLA-CHECKOUT regression |
| Out of scope | Menu bar; Cart evaluate/eligibility reads; Meta templates; ROADMAP IMP allocation; payment provider changes; new lifecycle states; new PAYMENT_PENDING server guards |
| Risk | CR2/CR3 at Checkout/payment boundary — R2/R3 governance for authorization |
| Proof | Preserve RED on AS-34/41 against current code → green after corrective; full Contract C + §4.4 ownership paths |

**This package does not authorize that corrective.**

### 5.4 Impact on Design / Quality exit

| Gate | Impact |
|---|---|
| Design Readiness | May evaluate interaction completeness (`07-…` §1.3) **without** code remediation; PASS (when Founder grants) must still record DR-06 obligation and must **not** imply Checkout already conforms |
| Quality finalization / V1 exit | AS-34/41 stay `BLOCKED_DR06` until corrective authorized and proven; Founder chooses **keep blocked** (recommended) vs **explicit deferral language that still retains the obligation** — never silent delete |
| Measurement | Schedule funnel may show Checkout drop-off until corrective; do not interpret as bar failure alone |

| ID | Founder decision | Proposed |
|---|---|---|
| DR06-A | Authorize corrective vehicle identity/timing later (not this PR) | DEFERRED authorization |
| DR06-B | Until then, keep AS-34/41 as blocking obligations for full UOE V1 Checkout Schedule exit | YES |
| DR06-C | Allow Design Readiness packaging/review while remediation remains NOT_AUTHORIZED | YES |

---

## 6. Independent review ask

Independent reviewers (Design / Quality / Measurement) should verdict only this packaging lane:

| Lane | Candidate ids | Question |
|---|---|---|
| Design | `DR-UOE-CANDIDATE-3` + §1 of this doc | Ready for Founder Design Readiness decision package? (≠ PASS) |
| Quality | `QT-UOE-CANDIDATE-3` + §3 | Evidence matrix / non-claims / DR-06 disposition adequate? (≠ finalization) |
| Measurement | `MI-UOE-CANDIDATE-3` + §4 | Ownership / denominators / privacy adequate? (≠ finalization) |

```text
INDEPENDENT_REVIEW_VERDICT = PENDING_EXTERNAL_REVIEWERS
AGENT_MAY_NOT_SELF_GRANT_DESIGN_QUALITY_MEASUREMENT_PASS = YES
```

---

## 7. Remaining owner decision list (precise)

### Founder — immediate (Design Readiness package)

1. **MC bundle** — Approve or edit `FOUNDER_IMMEDIATE` primaries in §1.2 (especially MC-03, MC-06–07, MC-10–11, MC-15–22, MC-28–29, MC-33).  
2. **Content QA latitude** — Confirm recommended `(A)+(B)`: Content QA may close `CONTENT_QA_BEFORE_TRANCHE` rows before tranche acceptance.  
3. **WhatsApp DR-04** — Confirm Design Readiness may PASS with on-wire WhatsApp deferred until WA-01 Meta body evidence (recommended), while noop-safe + in-app DR-04 remain mandatory.  
4. **DR06-B/C** — Confirm AS-34/41 obligations retained; Design packaging allowed while remediation NOT_AUTHORIZED.  
5. **MI-01/MI-02** — Name/confirm analytics owners; ratify checkout-start denominator (forbid CART eval denominator).

### Founder — not in this package (explicit holds)

6. **UOE-DR-01** — Future IMP identity / sequencing (still DEFERRED / NOT_ALLOCATED).  
7. **UOE-DR-06 remediation authorization** — separately governed; not granted here.  
8. **Design Readiness PASS / Quality finalization / Measurement finalization** — human gates; not agent-granted.  
9. **Implementation / merge / deploy** — NO.

### Content QA / Notification ops (before WhatsApp-sending DR-04 claim)

10. **WA-01** — Attach Meta APPROVED body/category export (or documented absence) for the seven registry refs.  
11. **WA-02/WA-03** — Meta edit vs variable-value strategy for Pickup→Takeaway meaning.  
12. Close `CONTENT_QA_BEFORE_TRANCHE` strings at T1–T3 exits.

### Analytics / privacy owners

13. **Vendor/transport** selection (no second platform invention).  
14. **Retention** numbers sign-off (§4.4 candidates).  
15. **Baseline capture** authorization before T3 enablement.

### Quality owner (future authorized implementation)

16. Execute PLANNED→EXECUTED mapping for AS-01…46 + Contracts A–D + 21 negatives + SEC-BOLA-CHECKOUT per `08-…`, distinguishing `BLOCKED_DR06` rows.

---

## 8. Explicit non-mutations

This package must not be read as authority to:

- Reopen or alter PD/XD PASS or Architecture Lock semantics  
- Mutate ROADMAP/STATE/decision-register / D-377 / D-383  
- Implement Checkout composition remediation  
- Allocate or activate a future IMP  
- Claim Design Readiness / QT / MI finalization PASS  
- Invent Meta template names, ids, bodies, or approval statuses  
- Claim payment preparation was tested by advisory quote tests  
- Use raw CART evaluations as checkout conversion denominator
