<!-- AUTHORITY: NON_AUTHORITATIVE_DISCOVERY_DRAFT | ID: MI-UOE-CANDIDATE-3 -->

# Measurement / Instrumentation candidate — Unified Order Experience

```text
CANDIDATE_ID = MI-UOE-CANDIDATE-3
SUPERSEDES = MI-UOE-CANDIDATE-2
STATUS = PROPOSED_FOR_INDEPENDENT_REVIEW
AUTHORITY = NON_AUTHORITATIVE
EXPERIENCE_CRITICALITY = X3
FORMAL_MEASUREMENT_PLAN = NOT_PERFORMED
PRE_GTM_AUDIT = NOT_PERFORMED
VARIANT = PRECHECKOUT_ELIGIBILITY_WEB_FIRST_V1
PACKAGE = UOE-CANDIDATE-3
GATE_PRECISION_REVISION = YES
IMPLEMENTATION_AUTHORIZED = NO
NO_CLAIMED_CONVERSION_LIFT = YES
NO_INVENTED_TELEMETRY_VENDOR = YES
NO_RUNTIME_SCHEMA_CHANGE = YES
ARCHITECTURE_CONTRACT = ARCH-UOE-LOCK-PROPOSAL-1
BINDING_CAPABILITY_ARCHITECTURE = docs/platform/capabilities/UOE-unified-order-experience.md
```

## Business intent to observe

Reduce hesitation and wrong-mode friction between Menu and paid order by making How / Where /
When visible and truthful earlier — including server-true Takeaway place options (Now vs
Schedule-capable) and mode-sensitive cart quotes — without weakening payment or promise integrity.

```text
FORMAL_MEASUREMENT_PLAN = NOT_PERFORMED
BASELINE = NOT_PERFORMED
ANALYTICS_OWNER_APPROVAL = DECISION_REQUIRED where not already authorized
CONVERSION_IMPROVEMENT_CLAIM = FORBIDDEN until measured under finalized plan
```

---

## 1. Primary KPI (candidate)

**Checkout-start → successful-payment conversion**, compared between:

- Sessions that interact with the order-context bar, and
- A comparison population of checkout starters in the same window that do not (or pre-UOE baseline)

| Field | Candidate value |
|---|---|
| Unit / grain | Checkout session (authenticated checkout id) or equivalent server journey id — **not** raw CART evaluation count |
| Attribution | Last meaningful bar interaction in-session before checkout start (candidate); finalize with analytics owner |
| Deduplication | One conversion credit per successful payment per checkout id |
| Denominator | Checkout starts in observation window (exclude abandoned draft never reaching start per owner rule) |
| Selection bias | Bar interaction is not randomly assigned — directional only |
| Baseline | NOT_PERFORMED — capture before/with T3 enablement |
| Observation window | Candidate 14–28 days post-enablement (finalize with analytics owner) |
| Interpretation | Directional; no ship/no-ship solely from this metric without guardrails |
| Success learning | Sustained non-worsening payment success + reduced timing-step drop-off + reduced mode-correction |
| Failure learning | Guardrail breach (payment failures, invalid-window at pay, support spikes) |
| Causal limitations | Not a controlled experiment unless separately authorized |

---

## 2. Secondary KPIs (candidate)

| KPI | Grain | Denominator | Intent | Status |
|---|---|---|---|---|
| Takeaway outlet discovery → selection | Eligibility view → confirmed/proposed select | Eligibility views with non-empty outlets | Pre-checkout place friction (DR-05) | CANDIDATE |
| Schedule intent → eligible Checkout → confirmed window | Funnel steps | Sessions with Schedule intent | DR-02 / Refinement C funnel | CANDIDATE |
| Mode correction before pay | Count of Delivery↔Takeaway flips after first method set | Checkout starts | Comprehension friction | CANDIDATE |
| Provisional price/offer impact → pay | ImpactBanner shown → paid | ImpactBanner sessions | Fee/offer surprise handling | CANDIDATE |
| Abandonment / retry | Eligibility or evaluate abandon; pay retry | Step entrants | Friction + recovery | CANDIDATE |
| Payment / invalid-window guardrails | Failure rates | Pay attempts / scheduled pays | Integrity | CANDIDATE / GUARDRAIL |

---

## 3. Guardrails

| Guardrail | Why | Status |
|---|---|---|
| Payment failure rate | Must not worsen | CANDIDATE |
| Invalid-window at pay / CHECKOUT_REPRICED on schedule | Promise integrity | CANDIDATE |
| Support contacts (address/time confusion) | Trust | CANDIDATE — owner taxonomy needed |
| Unauthorized client money display incidents | Architecture | CANDIDATE |
| Browse bind without confirm incidents | DR-05 safety | CANDIDATE |

---

## 4. Event contract (candidate — not implemented)

Exact vendor, final schema, retention policy, and analytics-owner approval remain
**DECISION_REQUIRED** where not already authorized. Do not invent a second telemetry platform.
Never emit `evaluation_context_digest`, protected provenance fields, raw PAN, or exact street when
avoidable (capability architecture §4.3).

| Event | Trigger | Unit / grain | Attribution | Deduplication | Denominator use | Owner | Data classification | Retention decision | Status |
|---|---|---|---|---|---|---|---|---|---|
| `order_context_bar_view` | Bar visible | page view / surface | surface=menu\|cart\|checkout | Once per surface per session (candidate) | Exposure | Product analytics | Operational UX | DECISION_REQUIRED | CANDIDATE |
| `order_method_intent_set` | Delivery/Takeaway selected | intent change | mode | Dedupe identical consecutive mode | Mode-correction KPI | Product analytics | Operational UX | DECISION_REQUIRED | CANDIDATE |
| `order_place_state` | orientation \| missing \| proposed \| confirmed | place transition | place_kind | Per transition | Place funnel | Product analytics | Coarse place only | DECISION_REQUIRED | CANDIDATE |
| `order_takeaway_eligibility_result` | Server eligibility returned | request result | selection_policy; outlet_count_bucket; timing_intent; cart_state | Per request id / generation | Discovery KPI | Product analytics | No hierarchy/profile internals | DECISION_REQUIRED | CANDIDATE |
| `order_cart_evaluate_impact` | Mode-sensitive evaluate changes presented quote | evaluate occurrence | reason_class; reused_checkout | Per matching context key result | Impact KPI — **not** conversion denominator | Product analytics | No digest/money fingerprint | DECISION_REQUIRED | CANDIDATE |
| `order_cart_evaluate_reuse` | Open Checkout quote reused | reuse hit | checkout_mode | Per checkout revision | Integrity / GP-02 | Product analytics | Mode only | DECISION_REQUIRED | CANDIDATE |
| `order_timing_intent_set` | Now/Schedule | timing intent | timing; confirmation=unconfirmed\|confirmed | Per change | Schedule funnel | Product analytics | Operational UX | DECISION_REQUIRED | CANDIDATE |
| `order_schedule_window_selected` | Server window chosen | window select | day_bucket; checkout_bound=true | Per checkout window bind | Schedule confirm rate | Product analytics | No raw window secrets | DECISION_REQUIRED | CANDIDATE |
| `order_impact_banner_shown` | Fee/offer/availability change UI | banner impression | reason_class | Once per reason_class per context key | Impact → pay | Product analytics | Coarse reason | DECISION_REQUIRED | CANDIDATE |
| `order_pending_payment_guard` | Browse blocked from mutating pending | guard fire | — | Once per pending checkout episode | Guardrail | Product analytics | No payment tokens | DECISION_REQUIRED | CANDIDATE |
| `order_checkout_start` | Checkout journey start | checkout id | entry_surface | Once per checkout id | **Primary denominator** | Commerce analytics | Journey id | DECISION_REQUIRED | CANDIDATE |
| `order_payment_success` | Successful payment | payment / order id | checkout id | Once per successful pay | **Primary numerator** | Commerce analytics | Existing payment analytics authority | DECISION_REQUIRED | CANDIDATE |
| `order_commercial_state_change` | CHECKOUT commercial state change (existing) | checkout evaluation occurrence | fingerprint-based | Existing IMP-036J semantics | CHECKOUT journey — **unchanged** | Existing measurement | Existing | PRESERVE | LOCKED_SEMANTICS |

---

## 5. CART Offer-result cardinality (locked architecture reflection)

Binding authority: capability architecture §2 (promoted from Lock proposal). Measurement must not
invent a new persisted source of truth.

```text
CART_COUNTED_VIEW_CARDINALITY_MAY_INCREASE_WHEN_CONTEXT_DIFFERS_AT_EQUAL_MONEY = YES
DIFFERENT_MODE_TIMING_OUTLET_CONTEXT_DISTINCT_CART_OCCURRENCES_AT_EQUAL_MONEY = YES
RAW_CART_EVALUATION_COUNTS_AS_CUSTOMER_CONVERSION_DENOMINATOR = FORBIDDEN
CHECKOUT_OFFER_RESULT_AND_JOURNEY_MEASUREMENT = UNCHANGED
CHECKOUT_REUSE_AND_COMMERCIAL_STATE_CHANGE = FINGERPRINT_ONLY
RESULT_FINGERPRINT_SEMANTICS = PRESERVED
EVALUATION_CONTEXT_DIGEST_CLIENT_OR_LOGS = FORBIDDEN
V1_DELIVERY_LOCATION_HMAC = DISABLED
V1_DIGEST_DELIVERY_LOCATION_HMAC = null
V1_PRIMARY_DELIVERY_PROVENANCE = evaluated_priced_outlet_id
V1_NEW_CART_EVALUATED_SCHEDULED_FROM_BROWSE_INTENT = NO
```

### 5.1 Rules

1. Different mode / timing / outlet evaluation contexts can create **distinct CART evaluation
   occurrences** despite equal money (digest differs; fingerprint alone must not collapse them).
2. Do **not** use raw CART evaluation counts as the customer-conversion denominator. Use checkout
   starts → successful payment (or owner-approved journey grain).
3. **Normalized reporting (candidate, non-persisted):** report CART advisory “views” grouped by
   stable journey/context meaning — e.g. `(session_or_cart_id, fulfilment_mode, timing_confirmation_class, outlet_or_priced_outlet_bucket)` — using already-authorized server facts and client events above. This is a **reporting convention**, not a new DB source of truth.
4. Preserve CHECKOUT fingerprint-only reuse and `COMMERCIAL_STATE_CHANGE` measurement semantics.
5. Keep `evaluation_context_digest` and protected provenance fields out of client responses and logs.
6. V1 does not mint new CART-scope evaluations with evaluated `SCHEDULED` from pre-checkout intent
   (omit timing while Schedule UNCONFIRMED; reject client CART `SCHEDULED` with 400).
7. Same-priced-outlet coordinate-only equal-money reuse may keep one CART `evaluation_id` — accepted
   V1 limitation (HMAC disabled); disclose in dashboards.

### 5.2 Observational limitations

| Limitation | Implication |
|---|---|
| No established baseline | Cannot claim lift |
| Selection bias (bar interactors) | Directional only |
| CART cardinality inflation at equal money | Can look like “more offers seen” without more customers |
| Per-process rate limits | May shape eligibility/evaluate volume under load |
| WhatsApp optional/noop | Channel events incomplete in some envs |
| Schema / vendor / retention undecided | Instrumentation cannot ship as authoritative until owner decisions |

---

## 6. Evidence gaps (explicit)

| Gap | Status |
|---|---|
| Baseline rates on current UI | NOT_PERFORMED / UNVERIFIED |
| Customer research validation | NOT_PERFORMED |
| Pre-GTM instrumentation audit | NOT_PERFORMED (Experience Debt Register) |
| Exact telemetry vendor | DECISION_REQUIRED |
| Final event schema + versioning | DECISION_REQUIRED |
| Retention / privacy policy sign-off | DECISION_REQUIRED |
| Analytics-owner approval of denominators | DECISION_REQUIRED |
| Causal conversion claim | Forbidden until measured |

**Formal Measurement Plan:** `NOT_PERFORMED`.  
**Agent disposition:** `RECOMMENDED_READY_FOR_EVALUATION` as a reviewable X3 candidate only (not formal PASS).
