<!-- governance-meta
{
  "status": "CANDIDATE",
  "authority": "NONE",
  "capability": "IMP-036J",
  "candidateId": "IMP-036J-MEASUREMENT-CANDIDATE-1",
  "experienceDefinition": "XD-IMP-036J-DRAFT-6",
  "measurementInstrumentationPlanFinalized": "NO"
}
-->

# IMP-036J — Measurement and instrumentation plan candidate

```text
CANDIDATE_ID = IMP-036J-MEASUREMENT-CANDIDATE-1
STATUS = CANDIDATE
AUTHORITY = NONE
CAPABILITY = IMP-036J
MEASUREMENT_INSTRUMENTATION_PLAN_FINALIZED = NO
DESIGN_READINESS = NOT_PERFORMED
IMPLEMENTATION_AUTHORIZED = NO
NUMERIC_TARGET_ADDED = NO
NEW_BUSINESS_OUTCOME = NO
```

This candidate operationalizes the measurement intent in `XD-IMP-036J-DRAFT-6` section 17 on the
locked architecture in capability section 27A. It does not reselect the journey key, the sequence,
the calendar, the window, or the event kinds. It does not implement collection.

Analytics is not monetary authority. Payable amounts remain the commercial evaluation and the
purchased snapshot.

## 1. Preserved intent

```text
BUSINESS_INTENT = A customer reaches a direct order with an understandable payable amount, including when an Offer, a coupon, a threshold, or a complimentary item is part of that amount. Margin stays inside the approved commercial rules.
PRIMARY_METRIC = CHECKOUT_REVIEW_TO_SUCCESSFUL_DIRECT_ORDER_COMPLETION_RATE
PRIMARY_METRIC_COUNT = 1
NUMERIC_SUCCESS_TARGET = NONE
REVENUE_KPI_ADDED = NO
```

Secondary metrics, all subordinate:

- Cart to Checkout Review continuation, only as defined in section 5
- Review to Payment continuation
- Payment completion after revalidation
- Coupon outcome distribution for classes the locked allowlist already stores
- Continuation after a valid coupon was not selected, including equal-payable not selected
- Continuation after changed-total recovery
- Continuation after complimentary-unavailable recovery
- Repeated coupon failures, as an operational guardrail and not as a new event attribute
- Support contacts about a coupon, an Offer, the total, or an included item, from existing support handling
- Displayed savings integrity

Guardrails, unchanged:

- Margin inside the approved commercial rules
- Payment completion
- Refund and cancellation
- Those support contacts
- Commercial evaluation errors and coupon errors
- Delivery and pickup completion
- Privacy
- Accessibility minimums
- Financial truth: displayed savings match evaluated effects

```text
CAUSAL_CONVERSION_CLAIM = NOT_MADE
CURRENT_EVIDENCE_FOR_LIFT = INSUFFICIENT_EVIDENCE
LOW_VOLUME = INSUFFICIENT_EVIDENCE
MEASUREMENT_SUBSTITUTES_FOR_ACCEPTANCE = NO
BASELINE_PROVES_LAUNCH_UPLIFT = NO
STATISTICAL_SIGNIFICANCE_THRESHOLD = NOT_CLAIMED
```

A controlled experiment is not authorized here. Low volume is `INSUFFICIENT_EVIDENCE`, not a winner and not a failure.

## 2. Journey identity

Locked representation: `checkouts.checkout_journey_key`. This plan does not choose another token, cookie, or customer id.

```text
CHECKOUT_JOURNEY_KEY = OPAQUE_NON_PII_NON_CUSTOMER_FACING
CUSTOMER_OR_GUEST_IDENTITY = WHO_IS_PRESENT_ONLY
JOIN = CHECKOUT_JOURNEY_KEY_ALONE
ONE_LOGICAL_CHECKOUT = ONE_KEY
ONE_KEY = ONE_DENOMINATOR_AND_AT_MOST_ONE_COMPLETION
```

The key continues across cart edits, coupon apply, change, and remove, fulfilment changes, stale Review recovery, payment retry, and payment-driven expiry of the latest causal checkout. A new key starts after successful direct-order completion and after explicit customer cancellation when the next checkout starts. `checkouts.id` and `carts.id` are not the key.

`AUTHORITATIVE_JOURNEY_SEQUENCE` is `checkout_journey_measurement_events.journey_sequence` for that key. It is a strict total order. Analytics arrival order, `recorded_at`, and physical row order are not the order.

Owner of every event write: the existing `customer-commerce` process, through the locked append procedure. There is no new analytics service, queue, or vendor.

## 3. Cohort, snapshot, and formulas

```text
MEASUREMENT_CALENDAR_TIMEZONE = Asia/Kolkata
CALENDAR_APPLIES_TO = THIS_MEASUREMENT_CONTRACT_ONLY
WINDOW = HALF_OPEN
INITIAL_COHORT_INTERVAL = [PRODUCTION_RELEASE_ANCHOR, SAME_LOCAL_CLOCK_TIME_PLUS_28_CIVIL_DAYS)
REPORT_AS_OF = OBSERVATION_CUTOFF_OF_ONE_PUBLISHED_SNAPSHOT
INITIAL_REPORT_AS_OF = INITIAL_COHORT_END
EVENT_INCLUDED = occurred_at < REPORT_AS_OF
```

`PRODUCTION_RELEASE_ANCHOR` is a named instant supplied to the calculation. This plan does not add a release table, a feature flag, or a build SHA on the event. Release attribution for a published number is that named anchor plus that snapshot's `REPORT_AS_OF`.

Cohort entry is selected once per key:

1. Read `CHECKOUT_REVIEW_PRESENTED` rows for the key, ignoring receipts with no presentation event.
2. Choose the lowest `journey_sequence`.
3. `GLOBAL_COHORT_ENTRY_TIME` is that row's `occurred_at`.
4. The key is in a window when `WINDOW_START <= GLOBAL_COHORT_ENTRY_TIME < WINDOW_END`.
5. Do not test a later Review, including one whose timestamp falls in a later window.

```text
COHORT_MEMBERSHIP_PER_CHECKOUT_JOURNEY_KEY = ZERO_OR_ONE
LATER_REVIEW_CREATES_NEW_COHORT_MEMBERSHIP = NO
RESELECT_ENTRY_REVIEW_FOR_SUBSEQUENT_WINDOW = NO
```

Adjacent 28-day windows use the same half-open civil-day rule. An entry exactly at a window end belongs to the next window that starts then, and to no earlier window.

```text
PRIMARY_DENOMINATOR = UNIQUE_KEYS_WHOSE_GLOBAL_COHORT_ENTRY_TIME_IS_INSIDE_THE_WINDOW
NUMERATOR_AS_OF(REPORT_AS_OF) = THOSE_KEYS_WITH_ONE_SUCCESSFUL_DIRECT_ORDER_COMPLETION_WHOSE_occurred_at_IS_STRICTLY_BEFORE_REPORT_AS_OF
UNFINISHED = DENOMINATOR_KEY_WITH_NO_SUCH_COMPLETION
UNFINISHED_STATE = NOT_COMPLETED_AS_OF_REPORT_CUTOFF
UNFINISHED_DENOMINATOR = YES
UNFINISHED_NUMERATOR = NO
```

Successful completion is the `SUCCESSFUL_DIRECT_ORDER_COMPLETION` event written in the Order-materialization transaction after accepted payment truth holds. Payment `SUCCEEDED` alone is not the numerator. A stopped stale pay attempt and a failed payment are not the numerator. One completion counts once, on the denominator key. A completion with no presented Review on that key is not assigned through customer identity.

An already issued snapshot is immutable. A later completion may appear only on a later snapshot whose own `REPORT_AS_OF` is after that completion's `occurred_at`. This plan creates no abandonment timeout, cart expiry, or customer-visible cutoff state.

### Segment

Segments are descriptive. They are not causes.

Completed journey: among `CHECKOUT_REVIEW_PRESENTED` events with sequence lower than the completion sequence, take the greatest sequence. The segment is that event's `presentation_class`.

Unfinished journey: among presented events with `occurred_at < REPORT_AS_OF`, take the greatest sequence.

If only the cohort-entry Review exists, it is the segment. `COMMERCIAL_STATE_CHANGE` does not choose the segment. Equal timestamps still use sequence. Events at or after `REPORT_AS_OF` do not change an issued snapshot's segment.

`presentation_class` maps to the approved descriptive labels only when the locked allowlist already stores that class: no Offer, automatic saving, coupon selected, coupon valid but not selected, equal-payable selected, equal-payable not selected, threshold progress, complimentary line, changed-total recovery. A class the allowlist does not store is not added so a segment can look finer.

## 4. Event contracts

Schema identity is the locked `event_kind` check. This plan adds no `event_version` column. Contract label for reviewers: `IMP-036J-MEASUREMENT-CANDIDATE-1`.

Common rules for every row:

| Rule | Value |
|---|---|
| Owner | `customer-commerce` measurement append |
| Identity | No customer, guest, name, email, or phone column. Who-is-present stays on checkout and is not the join |
| Journey | `journey_key` plus `journey_sequence` when the event is written |
| Time | `occurred_at` from the writing transaction clock. `recorded_at` is not used for cohort, cutoff, or order |
| Source of truth | The commercial or payment fact that committed in that transaction, not the browser paint |
| Validation | Kind, sequence uniqueness, idempotency re-read, and allowlisted class where a class is stored. A published integrity flag is true only when the explained rows equal the evaluated saving on that presented result |
| Dedup | Locked re-read of the event's idempotency identity before any new sequence. A replay returns the existing row |
| Retention / privacy | Section 6 |
| Forbidden | Raw coupon text, private eligibility facts, payment instrument data, cap sizes, other customers' identifiers, a journey key derived from those, analytics arrival order as order |

| Event | Meaning | Trigger | Required attributes already locked | Dedup key | Feeds | Guardrail |
|---|---|---|---|---|---|---|
| `CHECKOUT_REVIEW_PRESENTED` | Authoritative Review result was shown | Presentation acknowledgement, or pay ensuring that receipt before a later event | `journey_key`, `journey_sequence`, `occurred_at`, `review_evaluation_receipt_id`, `presentation_class`, `checkout_id` | One event per receipt | Denominator, segment, savings-integrity flag on that class | Financial truth and privacy |
| `COMMERCIAL_STATE_CHANGE` | Review result changed | Coupon apply, remove, replace, fulfilment change, or stale recovery that changes the Review result | `journey_key`, `journey_sequence`, `occurred_at`, `checkout_id` | One append per new committed Review-result change inside the open journey | Secondary recovery and continuation context. Not the segment and not an extra denominator | Evaluation errors stay out of this row |
| `REVIEW_TO_PAYMENT_PROGRESSION` | Review proceeded toward payment | `prepareCheckoutForPayment` commits `READY_FOR_PAYMENT` after any ensured presentation | `journey_key`, `journey_sequence`, `occurred_at`, `checkout_id` | The progression fact's locked identity for that attempt to leave Review | Review to payment continuation | A stale mismatch does not write this as success |
| `PAYMENT_ATTEMPT` | A pay attempt happened | Payment initiation or `retryPayment` inserts the attempt, after ensured presentation | `journey_key`, `journey_sequence`, `occurred_at`, `payment_attempt_id` | That payment attempt | Payment continuation after revalidation | Failed and stale attempts are not the numerator |
| `SUCCESSFUL_DIRECT_ORDER_COMPLETION` | Direct order placed and accepted payment truth holds | Order-materialization transaction | `journey_key`, `journey_sequence`, `occurred_at`, `checkout_id` | One event per `journey_key` for this kind | Numerator | Payment success alone does not write it |

Cart impressions are not a sixth event. A cart that never reaches Review is outside the denominator, which both the Experience Definition and the locked architecture already say. The design candidate may render Cart savings. That paint does not write a measurement row and does not mint a journey key.

Coupon failure classes that are not in the locked `presentation_class` allowlist are not added to these rows. They remain the HTTP reason the customer already receives. Operational error counts may use those existing reason codes with the coupon text removed. They are not a new analytics attribute.

### Experience meanings mapped onto these events

| Experience meaning | Locked write |
|---|---|
| Offer result viewed on Review | `CHECKOUT_REVIEW_PRESENTED` |
| Offer result viewed on Cart only | No measurement event |
| Coupon attempt finished inside a journey whose Review result changed | `COMMERCIAL_STATE_CHANGE`, then the next presented class when that result is shown |
| Step: Review reached | `CHECKOUT_REVIEW_PRESENTED` |
| Step: Review continue to payment | `REVIEW_TO_PAYMENT_PROGRESSION` |
| Step: pay attempt | `PAYMENT_ATTEMPT` |
| Step: successful completion | `SUCCESSFUL_DIRECT_ORDER_COMPLETION` |
| Recovery shown | The next `CHECKOUT_REVIEW_PRESENTED` whose class is the locked recovery class, plus `COMMERCIAL_STATE_CHANGE` when the Review result changed |
| Confirmation view | No additional event. Completion is already the numerator fact |

A repaint is not an event. Server `evaluateCheckout` writes a receipt, not a denominator row, until presentation is acknowledged or pay ensures that receipt.

## 5. Reporting contract

| Question | Rule |
|---|---|
| Cohort entry | Lowest presented-Review sequence for the key, across every window |
| Successful completion | One completion event with `occurred_at < REPORT_AS_OF` |
| Unfinished journey | Denominator key without that completion. Numerator contribution 0 |
| Duplicate events | Idempotent replay. Not an extra denominator or numerator |
| Retries | A retried pay attempt may add `PAYMENT_ATTEMPT`. It does not add a key or a completion |
| Late events | Visible only on a snapshot whose cutoff is strictly after their `occurred_at` |
| Ordering | `journey_sequence`. A shared `occurred_at` does not tie |
| Time zone | `Asia/Kolkata` civil days for window bounds only. Stored instants stay `timestamptz` |
| Report snapshot | One cohort definition and one named `REPORT_AS_OF` per published number |
| Segment attribution | Section 3. Later Reviews can update a later snapshot's segment. They do not move the cohort |
| Release attribution | Named `PRODUCTION_RELEASE_ANCHOR` input. No event carries a release id |

Primary rate for one snapshot:

```text
RATE = NUMERATOR_AS_OF(REPORT_AS_OF) / PRIMARY_DENOMINATOR
```

Denominator zero is not a rate. It is no evidence for that window.

Secondary formulas, each still cut by `occurred_at < REPORT_AS_OF`, and none of them a second primary metric:

| Metric | Formula |
|---|---|
| Review to payment continuation | Denominator keys in the snapshot that also have `REVIEW_TO_PAYMENT_PROGRESSION` before the cutoff, divided by the primary denominator |
| Payment completion after revalidation | Denominator keys whose latest pre-completion presented class is a recovery class and that then have a completion before the cutoff, divided by denominator keys with that recovery class |
| Coupon distribution | Count of presented classes in the snapshot among the allowlisted coupon classes. Not divided into a causal rate |
| Continuation after valid-but-not-selected | Completions whose completed segment is `COUPON_VALID_NOT_SELECTED` or `COUPON_EQUAL_PAYABLE_NOT_SELECTED`, divided by denominator keys whose unfinished-or-completed segment at this snapshot is that class |
| Continuation after changed-total or complimentary-unavailable recovery | Same shape, using the locked recovery class |
| Displayed savings integrity | Presented events in the snapshot whose integrity flag is true, divided by presented events in the snapshot. A false flag is a guardrail breach |
| Cart to Review continuation | Not computed from a new event. A cart that never starts a checkout has no journey key. This secondary metric is the count of keys that reached a presented Review divided by the count of checkouts created in the same window that received a journey key. Carts that never reach checkout stay outside, matching the approved denominator exclusion. This ratio is descriptive and is not the primary denominator |

Support contacts and refund or cancellation counts stay on their existing operational records. This plan does not define a ticket schema. Margin stays the approved commercial result, not a new margin policy.

## 6. Privacy and retention boundary

```text
EVENT_PRIVACY_BOUNDARY_DEFINED = YES
RAW_COUPON_TEXT_STORED = NO
PRIVATE_ELIGIBILITY_STORED = NO
PAYMENT_SECRET_STORED = NO
CUSTOMER_ID_ON_MEASUREMENT_ROWS = NO
```

Forbidden on measurement heads, events, and review receipts: coupon text, eligibility internals, payment secrets, security secrets, customer or guest identifiers, names, email, phone, and item free text that is not already the ordered item.

`presentation_class` is an allowlisted token, not a sentence and not a code the customer typed.

Retention: these rows are a projection inside existing commerce data, in the existing database, with no separate analytics store. The Experience Definition says to follow existing commerce retention and not extend it. ADR-013 leaves exact retention periods to a dedicated privacy decision. IMP-037's backup retention is not customer-data retention. This plan does not set a new duration, a purge job, or a longer window.

That boundary is resolved. A new numeric retention period is not.

## 7. Validation of the formulas

Later implementation proof, planned in the quality candidate, checks:

- The same rows and the same window always select the same cohort entry and the same membership.
- A Review revisit does not add a denominator or move the window.
- A pre-window key that returns during the window stays outside the window.
- An event exactly at `REPORT_AS_OF` is excluded.
- Equal timestamps still produce one segment.
- An issued snapshot does not change when a later completion arrives.
- A completion without a presented Review is not joined through customer identity.
- Dedup returns the existing event and allocates no sequence, including after `closed_at`.
- A new presentation after closure is rejected.
- Rows fail validation if they contain coupon text or a customer identifier.

## 8. Causal limits

Preserved from the Experience Definition:

- No trustworthy pre-release baseline. The first 28-day window may describe a baseline and does not prove launch uplift.
- Segments are not causes.
- Low traffic cannot separate an experience effect from ordinary volume.
- Menu, price, season, and payment-provider changes can move the rate.
- Comprehension is outside this metric. It belongs to later Founder Experience UAT and internal usability review.
- Acceptance is not this rate.
- Improvement does not silently change product behaviour.
- Financial truth, privacy, authorization, and accessibility are not traded against the rate.

```text
INSUFFICIENT_EVIDENCE = LOW_VOLUME_AND_EVERY_CAUSAL_CLAIM
```

## 9. Implementability flags

```text
BUSINESS_INTENT_PRESERVED = YES
PRIMARY_METRIC_PRESERVED = YES
SECONDARY_METRICS_PRESERVED = YES
GUARDRAILS_PRESERVED = YES
JOURNEY_KEY_DEFINED = YES
COHORT_SEMANTICS_DEFINED = YES
REPORTING_SNAPSHOT_DEFINED = YES
EVENT_CONTRACTS_COMPLETE = YES
PII_BOUNDARY_COMPLETE = YES
DEDUPLICATION_COMPLETE = YES
VALIDATION_PLAN_COMPLETE = YES
RETENTION_PRIVACY_BOUNDARY_COMPLETE = YES
CAUSAL_LIMITS_PRESERVED = YES
NUMERIC_TARGET_ADDED = NO
MEASUREMENT_PLAN_IMPLEMENTABLE = YES
MEASUREMENT_INSTRUMENTATION_PLAN_FINALIZED = NO
```
