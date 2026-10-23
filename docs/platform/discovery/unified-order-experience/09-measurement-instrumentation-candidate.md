<!-- AUTHORITY: NON_AUTHORITATIVE_DISCOVERY_DRAFT | ID: MI-UOE-CANDIDATE-1 -->

# Measurement / Instrumentation candidate — Unified Order Experience

```text
CANDIDATE_ID = MI-UOE-CANDIDATE-1
STATUS = PROPOSED_FOR_INDEPENDENT_REVIEW
AUTHORITY = NON_AUTHORITATIVE
EXPERIENCE_CRITICALITY = X3
FORMAL_MEASUREMENT_PLAN = NOT_PERFORMED
PRE_GTM_AUDIT = NOT_PERFORMED
IMPLEMENTATION_AUTHORIZED = NO
NO_CLAIMED_CONVERSION_LIFT = YES
```

## Business intent to observe

Reduce hesitation and wrong-mode friction between Menu and paid order by making How / Where /
When visible and truthful earlier — without weakening payment or promise integrity.

## Primary metric (candidate)

**Checkout start → successful payment rate**, compared between:

- Sessions that interact with the order-context bar, and
- A comparison population of checkout starters in the same window that do not (or pre-UOE baseline)

Selection bias is acknowledged: bar interaction is not randomly assigned.

| Field | Candidate value |
|---|---|
| Baseline | NOT_PERFORMED — capture before/with T3 enablement |
| Observation window | Candidate: 14–28 days post-enablement (finalize with analytics owner) |
| Interpretation rule | Directional only; no ship/no-ship solely from this metric without guardrails |
| Success learning signal | Sustained non-worsening payment success with reduced timing-step drop-off |
| Failure learning signal | Guardrail breach (payment failures, invalid-window at pay, support spikes) |
| Causal limitations | Not a controlled experiment unless separately authorized; founder-heuristic prior only |

## Secondary metrics

| Metric | Intent |
|---|---|
| Time-to-confirm Schedule (eligible checkout) | Compact UX vs legacy grid |
| Mode-switch corrections before pay | Comprehension of Delivery / Takeaway |
| Takeaway outlet abandon after open chooser | Collection place friction |
| Impact-banner shown rate + subsequent pay rate | Fee/offer surprise handling |
| UNCONFIRMED Schedule → later confirmed window rate | Refinement C funnel |
| Wrong-mode ops flags / support contacts | Guardrail |

## Guardrails

| Guardrail | Why |
|---|---|
| Payment failure rate | Must not worsen |
| Invalid-window at pay / CHECKOUT_REPRICED on schedule | Promise integrity |
| Support contacts mentioning address/time confusion | Trust |
| Unauthorized client money display incidents | Architecture |

## Event contract (candidate — not implemented)

Minimum event meanings (PII-minimized; no raw PAN; no exact street in analytics if avoidable):

| Event | Trigger | Props (conceptual) |
|---|---|---|
| `order_context_bar_view` | Bar visible | surface=menu\|cart\|checkout |
| `order_method_intent_set` | Delivery/Takeaway selected | mode |
| `order_place_state` | orientation \| missing \| confirmed | place_kind |
| `order_timing_intent_set` | Now/Schedule | timing; confirmation=unconfirmed\|confirmed |
| `order_schedule_window_selected` | Server window chosen | day_bucket; checkout_bound=true |
| `order_impact_banner_shown` | Fee/offer/availability change | reason_class |
| `order_pending_payment_guard` | Browse blocked from mutating pending | — |

Exact schema, retention, and vendor remain **DECISION_REQUIRED** with analytics ownership —
do not invent a second telemetry platform here.

## Evidence gaps (explicit)

| Gap | Status |
|---|---|
| Baseline rates on current UI | NOT_PERFORMED / UNVERIFIED in this package |
| Customer research validation | NOT_PERFORMED |
| Pre-GTM instrumentation audit | NOT_PERFORMED (Experience Debt Register) |
| Causal conversion claim | Forbidden until measured |

**Formal Measurement Plan:** `NOT_PERFORMED`.
**Agent disposition:** `RECOMMENDED_PASS` as a reviewable X3 candidate only.
