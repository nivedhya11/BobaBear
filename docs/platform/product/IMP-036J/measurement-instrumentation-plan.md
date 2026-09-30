<!-- governance-meta
{
  "status": "CANDIDATE",
  "authority": "NONE",
  "capability": "IMP-036J",
  "candidateId": "IMP-036J-MEASUREMENT-CANDIDATE-2",
  "experienceDefinition": "XD-IMP-036J-DRAFT-6",
  "architectureSource": "IMP-036J-FIT-CANDIDATE-9",
  "measurementInstrumentationPlanFinalized": "NO",
  "designReadiness": "NOT_PERFORMED",
  "implementationAuthorized": false
}
-->

# IMP-036J — Measurement and instrumentation plan candidate

```text
CANDIDATE_ID = IMP-036J-MEASUREMENT-CANDIDATE-2
STATUS = CANDIDATE
AUTHORITY = NONE
CAPABILITY = IMP-036J
MEASUREMENT_INSTRUMENTATION_PLAN_FINALIZED = NO
DESIGN_READINESS = NOT_PERFORMED
QUALITY_TEST_PLAN_FINALIZED = NO
IMPLEMENTATION_PLAN = NOT_PERFORMED
IMPLEMENTATION_AUTHORIZED = NO
IMPLEMENTATION_STARTED = NO
CANDIDATE_READY_FOR_INDEPENDENT_REVIEW = YES
NUMERIC_SUCCESS_TARGET = NONE
NEW_NUMERIC_RETENTION = NO
NEW_SERVICE = NO
NEW_MONEY_AUTHORITY = NO
NEW_PROMOTION_AUTHORITY = NO
NEW_ROLE = NO
```

This candidate chooses the concrete measurement encoding that `IMP-036J-FIT-CANDIDATE-9` left open. It operationalizes `XD-IMP-036J-DRAFT-6` section 17. It does not finalize the Measurement/Instrumentation Plan, does not perform Design Readiness, and does not authorize implementation.

## 0. Candidate history

`IMP-036J-MEASUREMENT-CANDIDATE-1` is historical. It was written before Candidate 9 Architecture remediation and is not the reviewable measurement candidate. Candidate 1 never passed Design Readiness. Its result remains `STOP / SUPERSEDED`. This document does not rewrite that result as a pass.

Historical review comments that stay in the pull-request record:

| Comment | Defect this candidate resolves |
|---|---|
| `4134472863` | Cart → Review used a checkout-row or journey-key ratio. The grain is now one genuine Cart-surface Checkout activation. |
| `4134472881` | Savings integrity could not be derived from rendered money. Observed evidence is now parsed from the committed presentation and compared on the server. |
| `4134472894` | Commercial-state change had no durable provenance identity. The identity is now the new Review-result fingerprint plus its source origins. |

Comment `4134472848` is a Design candidate defect. The Design candidate records it. This plan does not treat a Cart estimate as payable authority.

Candidate 9 Architecture Lock is the binding input. Product, Experience, and Architecture decisions are not reopened. Concrete schema, transport, storage, identifier encoding, event ownership, sequence representation, and collection are selected here because Architecture explicitly assigned those choices to this plan.

```text
CANDIDATE_1 = HISTORICAL_SUPERSEDED
CANDIDATE_1_DESIGN_READINESS = NOT_PASSED
ARCHITECTURE_SOURCE = IMP-036J-FIT-CANDIDATE-9
ARCHITECTURE_FIT = PASS
ARCHITECTURE_LOCKED = YES
```

## 1. Preserved intent

```text
BUSINESS_INTENT = A customer reaches a direct order with an understandable payable amount, including when an Offer, a coupon, a threshold, or a complimentary item is part of that amount. Margin stays inside the approved commercial rules.
PRIMARY_METRIC = CHECKOUT_REVIEW_TO_SUCCESSFUL_DIRECT_ORDER_COMPLETION_RATE
PRIMARY_METRIC_COUNT = 1
PRIMARY_GRAIN = ONE_CHECKOUT_JOURNEY_KEY
NUMERIC_SUCCESS_TARGET = NONE
REVENUE_KPI_ADDED = NO
CAUSAL_CONVERSION_CLAIM = NOT_MADE
BASELINE_PROVES_LAUNCH_UPLIFT = NO
STATISTICAL_SIGNIFICANCE_THRESHOLD = NOT_CLAIMED
MEASUREMENT_SUBSTITUTES_FOR_ACCEPTANCE = NO
LOW_VOLUME = INSUFFICIENT_EVIDENCE
```

Secondary measures, subordinate to that one primary rate, are the approved Experience set in section 12. None is redefined because a convenient event already exists. Support contacts stay `UNAVAILABLE` because no existing approved support-contact instrumentation was found.

Guardrails stay the Experience list: approved commercial margin, payment completion, refund and cancellation, support contacts, commercial and coupon errors, delivery and pickup completion, privacy, accessibility minimums, and financial truth. No numeric guardrail target is added.

A controlled experiment is not authorized.

## 2. Ownership, calendar, and retention

```text
COLLECTION_OWNER = customer-commerce
WRITE_AUTHORITY = SERVER
BROWSER_MONEY_AUTHORITY = NO
BROWSER_INTEGRITY_AUTHORITY = NO
BROWSER_PRESENTATION_OBSERVER = YES
NEW_SERVICE = NO
NEW_QUEUE = NO
ANALYTICS_VENDOR = NONE
FACADE = EXISTING /api/v1/*
AUTH_BOUNDARY = EXISTING_CART_CREDENTIAL_AND_CUSTOMER_SESSION
NEW_ROLE_OR_PERMISSION = NO
MEASUREMENT_CALENDAR_TIMEZONE = Asia/Kolkata
WINDOW = HALF_OPEN_28_CIVIL_DAYS
RETENTION_AUTHORITY = EXISTING_COMMERCE_ANALYTICS_RETENTION
NEW_NUMERIC_RETENTION_PERIOD = NO
RETENTION_PERIOD_INVENTED = NO
```

Approved Experience says to follow existing commerce analytics retention and not extend it. A search of current platform authority did not find a numeric commerce-analytics retention period for this contract. This plan does not invent one. Rows live under that same existing retention authority. They are not a second commercial ledger and they do not set payable, saving, or eligibility.

`PRODUCTION_RELEASE_ANCHOR` remains a named instant supplied to the calculation. This plan does not add a release table or a feature flag. The initial window is `[PRODUCTION_RELEASE_ANCHOR, that instant plus 28 civil days in Asia/Kolkata)`. The start is inclusive. The end is exclusive. An entry exactly at the end belongs to the next window. Adjacent windows do not overlap.

`REPORT_AS_OF` is an input of one published calculation. It is not a checkout column. A fact is included only when its authoritative occurrence time is strictly before that cutoff. A fact exactly at the cutoff is excluded. The initial snapshot uses the exclusive end of the initial window as `REPORT_AS_OF`. Checkout expiry, cart lifetime, and payment state do not read this cutoff. No product abandonment timeout is created.

## 3. Identifier encoding

| Identity | Encoding | What it is not |
|---|---|---|
| `CHECKOUT_JOURNEY_KEY` | Server-minted UUID v4, stored as `checkouts.checkout_journey_key`. Opaque. Immutable once assigned. Copied onto a successor checkout of the same unpaid attempt under the existing Cart lock, using the Candidate 9 mint/copy rules. | `checkouts.id`, `carts.id`, customer id, guest id, a cookie that contains identity, a customer-facing token |
| Cart causal order | `checkouts.cart_causal_ordinal bigint`, allocated under the Cart lock already held by `startCheckout` as `max(ordinal for that cart) + 1`. Unique `(cart_id, cart_causal_ordinal)`. Latest row is the greatest ordinal. | `created_at`, UUID sort order, walking backward to an older continuable row |
| `AUTHORITATIVE_JOURNEY_SEQUENCE` | `bigint` on `checkout_journey_facts.journey_sequence`, unique per journey key, allocated by the procedure in section 5. | Analytics arrival, `recorded_at`, physical row order, `checkouts.revision`, an evaluation row by itself |
| Cart activation | `activation_id` UUID v4 minted in the Cart Checkout control's activation handler and held in memory for that gesture. Server stores it only after UUID validation. | Customer id, guest id, cart id, coupon text, money, eligibility, a repaint |
| Review-result fingerprint | SHA-256 of the canonical server commercial result defined in section 8. Hex stored as `bytea`. | Raw coupon text, a client-supplied hash, occurrence time |
| Commercial-change provenance | SHA-256 of `checkout_journey_key` bytes, a single `0x00` separator, then the new result fingerprint. Unique per journey. | Customer id, telemetry arrival, occurrence timestamp |
| Command origin | Caller-minted UUID `source_command_id`, created before the mutation request and retried with the lost response. The server stores that id. | Customer id, guest id, a server id that the caller learns only from the response, occurrence timestamp |

`checkout_journey_key` is assigned only inside the checkout flows Candidate 9 already names: adopt-or-copy-or-mint in `startCheckout` under the Cart lock, one-time adoption in `evaluateCheckout` and in the payment-binding transaction when those flows already hold the Cart-then-Checkout lock, and copy onto an inserted successor. Cart evaluation does not mint or rewrite the key. A Cart view may copy an already-existing key. It does not invent one from a missing or terminal checkout.

Adoption, continuable payment-expired predecessor, explicit cancel, and successful completion follow section 27A of the locked architecture. This plan does not change those predicates.

## 4. Storage

Schema is selected here and is not written as a migration by this candidate.

```text
SCHEMA_SELECTED = YES
MIGRATION_WRITTEN_BY_THIS_CANDIDATE = NO
```

| Relation | Role | Uniqueness that enforces the semantic |
|---|---|---|
| `checkouts.checkout_journey_key` | Journey correlation | Immutable after assignment. Not unique across rows, because a successor checkout copies it |
| `checkouts.cart_causal_ordinal` | Predecessor selection | Unique `(cart_id, cart_causal_ordinal)` |
| `checkout_journey_heads` | One row per journey key. Columns: `checkout_journey_key` primary key, `next_sequence bigint not null`, `closed_at timestamptz null` | One allocator |
| `checkout_journey_facts` | Authoritative journey facts. Columns below | Unique `(checkout_journey_key, journey_sequence)`. Partial unique indexes for each idempotency identity in section 6 |
| `commercial_evaluations` | Server expected presentation for one authoritative result occurrence | `evaluation_id uuid` primary key. `occurrence_ordinal bigint` allocated under the Cart lock. Unique `(cart_id, result_fingerprint, occurrence_ordinal)` where `surface_scope = CART`. Unique `(checkout_id, result_fingerprint, occurrence_ordinal)` where `surface_scope = CHECKOUT` |
| `commercial_presentation_observations` | Non-authoritative observed committed presentation | Unique `evaluation_id`. The submitted surface must equal that evaluation's `surface_scope` mapping. A second surface for the same id is rejected |
| `checkout_review_surface_tokens` | SHA-256 of the token minted only by `evaluateCheckout` | One current hash per checkout. The plaintext token is not stored |
| `commercial_command_origins` | Origin written in the commercial mutation transaction, before evaluation, only when the revision changes | Unique `source_command_id`. Ordered by `cart_origin_ordinal` under the Cart lock. `resolved_change_fact_id` is null until a later Review evaluation resolves it |
| `commercial_command_results` | One row for every finished coupon command, including a no-op that writes no origin | Unique `source_command_id`. The command transaction stores `cart_id`. It does not store a bearer token, a verifier, or a session subject. Also holds `coarse_outcome` and `occurred_at`. No raw coupon |
| `measurement_report_snapshots` | Immutable published calculations | Insert only. Same `(metric, window_start, window_end, report_as_of)` returns the existing row and does not update it |

`checkout_journey_facts` columns: `fact_id uuid`, `checkout_journey_key`, `fact_kind`, `journey_sequence`, `occurred_at timestamptz`, `idempotency_key bytea`, `evaluation_id uuid null`, `activation_id uuid null`, `result_fingerprint bytea null`, `presentation_class text null`, `coarse_outcome text null`. No customer id, guest id, raw coupon, payment instrument, or client integrity boolean.

`commercial_evaluations` columns, all server-written from the quote in the evaluation transaction: `evaluation_id`, `cart_id`, `checkout_id null`, `checkout_journey_key null`, `surface_scope` `CART` or `CHECKOUT`, `result_fingerprint`, `expected_components` as the component set in section 7, `expected_total_saved_paise`, `expected_progress_present`, `expected_progress_remaining_paise`, `expected_coarse_shape`, `explanation_reason_class` as the existing server reason class with no private eligibility text, `complimentary_variant_id null`, `projected_complimentary_line_sha256 null`, `server_explanation_integrity boolean`, `cart_origin_ordinal_inclusive bigint null`, `occurrence_ordinal bigint not null`, `occurred_at`. `projected_complimentary_line_sha256` is SHA-256 of the catalog line projected when the evaluation was written. The plaintext line is not a stored column. Complimentary-unavailable continuation reads `STALE_RECOVERY` plus `explanation_reason_class`. The browser is not sent this expected descriptor to echo.

A retry returns the existing `evaluation_id` only when the latest evaluation for that cart or checkout already has the same fingerprint. That retry does not allocate another ordinal. If the computed fingerprint differs from that latest evaluation, including a return to an older fingerprint after a different one, the transaction inserts a new row with `occurrence_ordinal = max(occurrence_ordinal for that scope) + 1`. The ordinal does not come from `carts.revision` or `checkouts.revision`. A cap change that does not bump those revisions still creates an occurrence because the fingerprint changed. A lost HTTP response is retried against the latest row and returns the same id. The second occurrence of fingerprint A after B gets its own `evaluation_id`, `REVIEW_PRESENTED`, and change fact.

`commercial_presentation_observations` columns: `evaluation_id`, `surface` `CART` or `CHECKOUT_REVIEW`, `observed_components`, `observed_progress_present`, `observed_progress_remaining_paise`, `observed_coarse_shape`, `observed_complimentary_present`, `observed_complimentary_line_sha256 null`, `server_presentation_match boolean null`, `mismatch_flags text[]`, `occurred_at`. `observed_complimentary_line_sha256` is SHA-256 of the committed complimentary line text. The plaintext line is not stored. `server_presentation_match` and `mismatch_flags` are written only by server comparison. A request that includes an integrity boolean, a complimentary variant id, a coupon code, an eligibility reason, a plaintext item line, or a payment secret is rejected and writes nothing.

`cart_checkout_activations` columns: `activation_id`, `cart_id` for the ownership check only, `checkout_journey_key null`, `checkout_id null`, `watermark_sequence bigint null`, `occurred_at`, `review_reach_fact_id null`. `cart_id` is the access boundary. It is not the metric grain and it is not inside `activation_id`.

Fact kinds that consume `AUTHORITATIVE_JOURNEY_SEQUENCE`:

```text
REVIEW_PRESENTED
COUPON_ATTEMPT
COMMERCIAL_STATE_CHANGE
CART_REVIEW_REACH
REVIEW_TO_PAYMENT
PAYMENT_ATTEMPT
DIRECT_ORDER_COMPLETION
```

`CART_REVIEW_REACH` is the activation-scoped step fact. It is not a second cohort-entry Review. Cohort entry reads only `REVIEW_PRESENTED`. `COUPON_ATTEMPT` orders a coupon outcome that Review showed. It is not cohort entry and it is not a commercial-state change.

Cart offer-result observations do not consume this sequence. A Cart evaluation with no journey key is still a valid evaluation.

## 5. Sequence allocation and occurrence time

Authoritative occurrence time for a journey fact is `clock_timestamp()` captured in the same statement that allocates `journey_sequence`, after `SELECT … FOR UPDATE` has acquired the journey head. It is not `transaction_timestamp()`, which PostgreSQL freezes at transaction start. Activation `occurred_at` is `clock_timestamp()` at the activation insert. Neither is a client timestamp, an analytics ingest time, or updated on replay. A transaction that waited on the journey head therefore cannot store an occurrence time from before a sequence that another transaction allocated while this one waited.

Allocation for one journey, inside the same transaction as the commercial or measurement write it belongs to:

1. `SELECT … FOR UPDATE` the `checkout_journey_heads` row, inserting it at the key's mint with `next_sequence = 1` if it does not exist.
2. Re-read the fact's idempotency identity.
3. If that identity already exists, return the existing fact. Allocate nothing. Do not change closure.
4. If `closed_at` is set, reject the new fact. Allocate nothing.
5. Otherwise insert the fact with `journey_sequence = next_sequence`, then increment `next_sequence`.
6. Successful direct-order completion sets `closed_at` in that same order-materialization transaction, as Candidate 9 requires.

```text
IDEMPOTENT_REPLAY_LOOKUP_PRECEDES_CLOSED_JOURNEY_REJECTION = YES
EXISTING_FACT_ON_CLOSED_JOURNEY = RETURN_EXISTING
NEW_FACT_ON_CLOSED_JOURNEY = REJECT
OCCURRED_AT_AS_IDEMPOTENCY_KEY = NO
CUSTOMER_IDENTITY_AS_IDEMPOTENCY_KEY = NO
ANALYTICS_INGESTION_ORDER = NOT_AUTHORITY
```

When a payment operation relies on a Review that was presented, the measurement write for that payment runs after the presented fact is recorded, or the same transaction allocates the presented fact's sequence first. The first recording cannot reverse that order. Pay is not held for a customer-visible analytics wait. Failure to record measurement rolls back only when Candidate 9 already requires the completion fact to commit with the Order. A failed presentation observation does not roll back evaluation, checkout, or payment. Section 10 states that non-blocking posture.

## 6. Idempotency identities

| Fact | Idempotency identity | Replay | New fact after close |
|---|---|---|---|
| `REVIEW_PRESENTED` | `(checkout_journey_key, evaluation_id)` | Return existing | Reject |
| `COUPON_ATTEMPT` | `source_command_id` | Return existing | Reject |
| `COMMERCIAL_STATE_CHANGE` | SHA-256 of the journey key, `0x00`, the previous occurrence's `evaluation_id` or sixteen zero bytes when there is no previous Review, `0x00`, and the new fingerprint | Return existing, including after close | Reject |
| `CART_REVIEW_REACH` | `activation_id` | Return existing | Reject a new reach. Replay of the existing reach returns it |
| `REVIEW_TO_PAYMENT` | server `continue_command_id` for that continue action | Return existing | Reject |
| `PAYMENT_ATTEMPT` | existing payment idempotency key | Return existing | Reject a new attempt fact. Existing replay returns it |
| `DIRECT_ORDER_COMPLETION` | one per `checkout_journey_key` | Return existing, including after close | A second completion is rejected |

Partial unique indexes implement those identities. Concurrent inserts lose on the unique violation, re-read, and return the winner. They do not allocate a second sequence.

## 7. Rendered presentation observation

```text
AUTHORITATIVE_MONEY = SERVER_COMMERCIAL_EVALUATION
SERVER_EXPECTED_TRUTH = YES
OBSERVED_PRESENTATION_EVIDENCE = FUNCTION_OF_ACTUAL_COMMITTED_PRESENTATION
OBSERVATION_COPIED_FROM_SERVER_RESULT_ONLY = PROHIBITED
OBSERVATION_COPIED_FROM_EXPECTED_DESCRIPTOR_ONLY = PROHIBITED
OBSERVATION_COPIED_FROM_EVALUATION_FINGERPRINT_ONLY = PROHIBITED
BROWSER_MONEY_AUTHORITY = NO
BROWSER_INTEGRITY_AUTHORITY = NO
FINAL_INTEGRITY_COMPARISON = SERVER
CLIENT_AUTHORED_INTEGRITY_BOOLEAN = REJECTED
```

### Expected value

Inside `evaluateCart` or `evaluateCheckout`, the server writes `commercial_evaluations` from that same quote before the response returns. Expected components are integer paise plus presence, for this closed set:

```text
ORDER_SAVING
DELIVERY_SAVING
TOTAL_SAVED
ESTIMATED_SUBTOTAL
TOTAL_PAYABLE
DELIVERY_CHARGE
PROGRESS
```

`expected_coarse_shape` is one of: `NONE`, `AUTOMATIC_SAVING`, `ORDER_SAVING`, `DELIVERY_SAVING`, `BOTH_SAVINGS`, `COMPLIMENTARY_LINE`, `COUPON_SELECTED`, `COUPON_VALID_NOT_SELECTED`, `EQUAL_PAYABLE_SELECTED`, `EQUAL_PAYABLE_NOT_SELECTED`, `THRESHOLD_PROGRESS`. The shape is derived from the server result class, not from client text. Saving components are omitted when their paise amount is zero. A standing ₹0 delivery charge is not a saving. `server_explanation_integrity` is true only when the server explanation parts equal that quote's evaluated saving. The client does not send this boolean.

The response may include `evaluationId` so the observation can name which evaluation it saw. It does not include the expected descriptor, the fingerprint, or an integrity verdict.

### Observation source and encoding

After the customer surface commits the money region to the DOM, the page reads that committed region. The reader uses the rendered text of each money row in `OrderMoneySummaryPanel` or the Cart stack, including the Cart sticky amount label. It parses rupee text with the same `formatPaise` display rules into integer paise. ₹80.00 is 8000. ₹8.00 or a rendered ₹8 is 800. A row that was not committed is absent. A row that was committed extra is present.

The POST body is exactly:

```text
evaluationId
surface = CART | CHECKOUT_REVIEW
components = [{ kind, amountPaise, present }]
progressPresent
progressRemainingPaise
observedCoarseShape
observedComplimentaryPresent
observedComplimentaryLineSha256
sourceCommandId null
```

`sourceCommandId` is present only when the committed coupon-result region is the presentation of that command. The server accepts it only when the result row's `cart_id` is the evaluation's cart and the request already passes the existing cart authorization for that cart. It does not set `surface`. `surface` is written when the coupon command completes. See section 10.

`observedComplimentaryLineSha256` is SHA-256 of the exact complimentary line text the DOM committed, or null when that line was not committed. The plaintext is not stored on the observation and is not stored on the evaluation. The evaluation stores `complimentary_variant_id` and `projected_complimentary_line_sha256`, which is SHA-256 of the catalog line projected at evaluation time. The server compares the two hashes. A different item changes the hash. The client does not send a variant id or the plaintext line.

`observedCoarseShape` is chosen from the copy the screen actually committed, using the Design candidate's copy ids, mapped to the same shape enum. It is not read back from the evaluation response object. The body has no coupon field, no eligibility reason, no payment field, and no integrity field. Unknown fields in that set are rejected.

### Transport

`POST /api/v1/commerce-observations` on the existing customer façade, served by `customer-commerce`. Auth is the existing cart credential or customer session that owns the evaluation. The server loads `evaluation_id` and refuses a cross-cart or cross-checkout id with the existing denial response. It writes no price.

### Comparison

The server compares expected and observed:

| Failure | Comparison |
|---|---|
| Expected ₹80 rendered as ₹80 | `ORDER_SAVING` or the relevant component 8000 equals 8000. Match |
| Expected ₹80 rendered as ₹8 | 8000 versus 800. `WRONG_AMOUNT` |
| Missing saving row | Expected kind present, observed kind absent. `OMITTED_ROW` |
| Extra saving row | Observed kind absent from expected. `EXTRA_ROW` |
| Wrong component | Expected `ORDER_SAVING` present and observed `DELIVERY_SAVING` present in its place, or the reverse. `WRONG_COMPONENT` |
| Wrong complimentary item | `observed_complimentary_line_sha256` differs from `projected_complimentary_line_sha256`, or presence differs. `WRONG_COMPLIMENTARY_ITEM`. The plaintext line is not stored |
| Wrong component amount | Same kind, different paise. `WRONG_AMOUNT` |
| Wrong total saved | `TOTAL_SAVED` paise differs. `WRONG_TOTAL_SAVED` |
| Positive versus zero | Expected total saved is 0 and a saving row is observed, or expected total saved is positive and the saving row is absent. `WRONG_ZERO_STATE` |
| Wrong shape | `expected_coarse_shape` differs from `observedCoarseShape`. `WRONG_SHAPE` |
| Progress presence or value | `progressPresent` differs, or both are present and `progressRemainingPaise` differs. `PROGRESS_MISMATCH` |

`server_presentation_match` is true only when every comparison above passes and `server_explanation_integrity` is already true. A browser field cannot set it. If the observation is absent, the match stays null. Null is unobserved. It is not a pass and it is not a payable failure.

### Dedup, retention, failure

One observation per `evaluation_id`. `surface_scope = CART` accepts observation surface `CART` only. `surface_scope = CHECKOUT` accepts observation surface `CHECKOUT_REVIEW` only. Any other surface is rejected and writes nothing. A repaint or transport retry returns that row and does not count a second Offer-result view. The first committed observation is the evidence for that evaluation. Offer-result view count is one per presented evaluation, not per repaint and not per surface label.

Measurement failure, a rejected observation, a mismatch, or a dropped POST does not change the commercial evaluation, the cart, the checkout revision, eligibility, or payment. Checkout and payment do not wait on the POST. Mismatch is reported in the integrity ratio. It is not a second money authority.

```text
MEASUREMENT_FAILURE_AFFECTS_CHECKOUT_OR_PAYMENT = NO
OBSERVED_RENDERED_AMOUNT_SETS_PAYABLE = NO
TELEMETRY_IS_SECOND_MONEY_LEDGER = NO
```

## 8. Commercial-state-change provenance

```text
COMMERCIAL_STATE_CHANGE_ORIGINATING_FACT = NEW_REVIEW_RESULT_WITH_A_DIFFERENT_AUTHORITATIVE_FINGERPRINT_AND_AT_LEAST_ONE_SOURCE_ORIGIN
SAME_OPERATION_RETRY = RETURN_EXISTING_OBSERVATION
ONE_ORIGIN_MULTIPLE_CHANGE_OBSERVATIONS = NO
ONE_RESULT_MULTIPLE_ORIGINS = ONE_CHANGE_OBSERVATION
NO_OP = NO_CHANGE_OBSERVATION
CLOSED_JOURNEY_NEW_CHANGE = REJECT
CLOSED_JOURNEY_REPLAY = RETURN_EXISTING_OBSERVATION
```

The fingerprint is SHA-256 over canonical UTF-8 JSON with sorted keys of the full authoritative expected presentation. That object includes every component in the closed set, present or absent, with its paise amount: `ORDER_SAVING`, `DELIVERY_SAVING`, `TOTAL_SAVED`, `ESTIMATED_SUBTOTAL`, `TOTAL_PAYABLE`, `DELIVERY_CHARGE`, and `PROGRESS`. It also includes `progressPresent`, `progressRemainingPaise`, `expected_coarse_shape`, `explanation_reason_class`, complimentary-present, and `complimentary_variant_id` (the server catalog id of the exact selected item, or null). The rendered complimentary line name is part of the expected presentation because that is the line the customer sees. The raw coupon code is not an input. Two results that differ in delivery charge, estimated subtotal, payable, progress, complimentary item, or any other expected field are different fingerprints and different `evaluation_id` values.

Allowed `origin_kind` values: `COUPON_APPLY`, `COUPON_REPLACE`, `COUPON_REMOVE`, `FULFILMENT_CHANGE`, `STALE_RECOVERY`. A quantity edit is not an origin. An origin is written only when that command changes the commercial revision. A no-op writes no origin row and no change fact.

The caller mints `source_command_id` as a UUID before the request is sent and keeps it for that gesture. The request body carries it. The server does not mint the id in the response. A lost response is retried with the same caller-known id. The id is not a customer id, guest id, coupon, or timestamp.

The origin row is inserted in the same transaction as the commercial mutation, before any Review evaluation runs, and only when that command changes a commercial revision. Columns: `source_command_id`, `origin_kind`, `cart_id`, `checkout_id` of the row in hand or null, `checkout_journey_key` when one already exists, `cart_origin_ordinal`, `resolved_change_fact_id null`, `resolution` null. Unique `source_command_id`. If that id already exists for the same cart, and the request passes the existing cart-credential or customer-session check for that cart, the transaction returns the existing commercial result and the existing origin. It does not insert another origin and it does not store the credential or session subject. The same id presented for a different cart is denied and writes nothing. After `claimGuestCart`, the new owner of that same cart id may replay it. After `reconcileGuestCartWithCustomer`, the guest cart's origin is not replayable on the surviving customer cart. Guest rows are not copied and do not use a foreign key that would block `deleteCartById`. When the surviving cart's coupon changes — the customer cart had no code and the guest code is adopted, or the resolution is `KEEP_GUEST` — that transaction writes one new origin on the surviving `cart_id` with a null journey key and a null checkout id. Reconcile does not lock checkouts and does not stamp a journey key. The kind is `COUPON_APPLY` or `COUPON_REPLACE`. The caller mints a new `source_command_id`. It is not a guest command id. `KEEP_CUSTOMER`, equal codes, and a line-only merge write no origin. A later `startCheckout` or `evaluateCheckout` that already holds the Cart-then-Checkout lock copies the continuable journey key onto that null-key origin only when the locked checkout is still continuable. If that command finds `CANCELLED` or `COMPLETED`, it leaves the origin null-key for the next new journey. If evaluation then fails, the origin remains.

`cart_origin_ordinal` is allocated under the Cart lock already held by the command, as `max(ordinal for that cart) + 1`. It is not `carts.revision` and it is not `checkouts.revision`. Those two counters are not compared with each other. A coupon command that replaces the checkout row, and a later fulfilment command on the successor checkout, get successive ordinals on the same cart.

When `startCheckout` copies an existing journey key from a continuable predecessor onto a successor, it copies that key only onto unresolved origins that already carry the same key, and onto unresolved origins whose key is null and whose `checkout_id` is that predecessor. A reused continuable checkout, and `evaluateCheckout` while that checkout is locked and still continuable, also copy that key onto unresolved origins whose journey key is null and whose checkout id is null. That is how a reconciliation origin written without a checkout lock joins the open journey. They do not copy an origin that carries a different key.

When `startCheckout` mints the first journey key because this cart has no checkout predecessor, it copies that new key onto every unresolved origin whose journey key is null, whose checkout id is null, and whose resolution is null. That is the Cart coupon written before any checkout existed. Those origins can then satisfy the first Review's `COMMERCIAL_STATE_CHANGE`. The copy does not use customer identity.

When `startCheckout` mints a new journey key because the latest causal checkout is not continuable, including explicit cancel and a completed checkout, it does not copy that new key onto origins of the closed journey. In that same transaction it sets `resolution = JOURNEY_BOUNDARY` and leaves `resolved_change_fact_id` null on every still-unresolved origin that carries the closed journey's key or that checkout's id. Those origins cannot become a `COMMERCIAL_STATE_CHANGE` of the new journey. After that boundary resolution, the same transaction copies the new key onto unresolved origins that still have a null journey key, a null checkout id, and a null resolution. Those are Cart commands after the closed journey and before this checkout. Origins already marked `JOURNEY_BOUNDARY` are not updated. The copy does not use customer identity.

Each `commercial_evaluations` row stores `cart_origin_ordinal_inclusive`, the greatest origin ordinal this evaluation has already consumed. Reusing an `evaluation_id` because the scoped fingerprint matches does not leave that watermark at the first insert. In the same transaction the server reads the current greatest origin ordinal on the cart, under the Cart lock `evaluateCheckout` already takes, and advances `cart_origin_ordinal_inclusive` to that ordinal after the origins in the new window are resolved. The previous Review result's consumed ordinal is that advanced watermark.

When a later Review evaluation commits, including a fingerprint reuse that returns the existing `evaluation_id`:

- Load every unresolved origin whose `checkout_journey_key` equals this evaluation's journey key, whose `resolution` is null, and whose `cart_origin_ordinal` is greater than the watermark already consumed and less than or equal to the current greatest origin ordinal on the cart. Include origins whose `checkout_id` is a replaced predecessor of this same journey. Exclude origins resolved as `JOURNEY_BOUNDARY` and origins that carry a different journey key. Do not compare `carts.revision` with `checkouts.revision`.
- If the fingerprint equals the previous Review result, mark every origin in that window `NO_RESULT_CHANGE`, then advance the watermark. Write no change fact. Those origins do not stay unresolved and do not attach to a later different result.
- If the fingerprint differs and the window contains at least one origin, insert one `COMMERCIAL_STATE_CHANGE` or return the existing fact, then set `resolved_change_fact_id` on every origin in that window and advance the watermark.
- Provenance identity is SHA-256 of the journey key, `0x00`, the previous occurrence's `evaluation_id` or sixteen zero bytes when there is none, `0x00`, and the new fingerprint. A later return to an older fingerprint is a new identity because the previous occurrence differs. A retry of that same transition returns the existing fact.
- Several origins that resolve to the same fingerprint share that one fact and do not allocate another sequence.

Same-command retry reuses `source_command_id`. If the change fact already exists, replay returns it. Concurrent commands that produce the same fingerprint collide on the fact unique index. The loser returns the winner and resolves its own already-persisted origin onto that fact. The fact count remains one. Concurrent commands that produce different fingerprints are different results and therefore different facts, still one fact per fingerprint.

If the journey is closed, a replay of the existing provenance identity returns the fact. A new fingerprint is rejected with the result write and allocates nothing.

Customer identity, telemetry arrival, and occurrence time are not this identity.

## 9. Cart activation and Cart → Review

```text
SECONDARY_METRIC = CART_TO_CHECKOUT_REVIEW_CONTINUATION
GRAIN = ONE_GENUINE_CART_SURFACE_CHECKOUT_ACTIVATION
CART_ACTIVATION_IDENTITY = activation_id
SAME_ACTIVATION_RETRY = SAME_ACTIVATION_OBSERVATION
NEW_CART_ACTIVATION = DISTINCT_ACTIVATION_OBSERVATION
REPAINT = NOT_A_NEW_ACTIVATION
DIRECT_CHECKOUT_ENTRY = NOT_A_CART_ACTIVATION
REUSED_ACTIVE_CHECKOUT_ASSOCIATION = YES
MULTIPLE_DISTINCT_ACTIVATIONS_MAY_SHARE_ONE_JOURNEY = YES
OLD_REVIEW_SATISFIES_NEW_ACTIVATION = NO
ACTIVATION_REQUIRES_SUBSEQUENT_REVIEW_REACH = YES
ACTIVATION_SCOPED_REVIEW_REACH_REQUIRED = YES
REPEATED_OFFER_RESULT_VIEW_REQUIRED_FOR_LATER_ACTIVATION = NO
ACTIVATION_TO_REVIEW_CAUSAL_ORDER_REQUIRED = YES
```

The Cart Checkout control mints `activation_id` when the customer activates that control by click or keyboard. The same in-memory id is sent on every transport retry of that `POST /api/v1/checkouts`. A later genuine activation mints a new id. A repaint does not. Direct entry to `/order/checkout`, refresh, login return that does not present this id, and an in-checkout restart omit `cartActivationId`.

`startCheckout` accepts optional `cartActivationId`. Missing means the start is not a Cart activation. Checkout still proceeds. The field is not money, not a coupon, and not eligibility.

Association, inside that same transaction, only when all of the following hold:

- the id is a UUID
- the activation's cart is the cart being started
- the call resolves to the checkout for that cart, whether newly inserted or the already-active `DRAFT`, `READY_FOR_PAYMENT`, or `PAYMENT_PENDING` row
- that checkout has a journey key, minted or copied by the existing rule, not by the activation

Then set `checkout_journey_key`, `checkout_id`, and `watermark_sequence` to the greatest already-allocated `journey_sequence` on that key, or `0` when none exists. The activation does not mint the key, does not bump checkout revision, and does not change price or eligibility.

Unknown, stale, or other-cart context does not fail checkout and does not attach. An activation that never associates remains in the denominator and cannot enter the numerator. The report does not join it to a later checkout by cart id, customer id, or guest id. A retry of an already-associated activation returns that same association.

When Checkout Review commits an authoritative evaluation and the client still holds the activation id from the navigation that opened this Review, it sends that id with the Review observation. The server records `CART_REVIEW_REACH` once for that `activation_id`. The reach fact's sequence is allocated after the activation's watermark, so it is strictly greater. A historical `REVIEW_PRESENTED` whose sequence is less than or equal to the watermark does not satisfy the activation. Reaching Review again does not require a second Offer-result view when `REVIEW_PRESENTED` for the same `evaluation_id` already exists.

A qualifying reach requires an authoritative Review evaluation on that journey at the time the reach is recorded. The reach fact points at that `evaluation_id`. It does not copy the evaluation into a new view row.

### Metric formula

`A` is in the denominator of a named half-open window and `REPORT_AS_OF` when `A.occurred_at` satisfies `WINDOW_START <= A.occurred_at < WINDOW_END` and `A.occurred_at < REPORT_AS_OF`. Window membership uses the activation's own occurrence time. It does not use the journey's global cohort entry, because a later activation must not inherit an earlier Review.

`A` is in the numerator only when all of the following hold:

1. `A` is associated to journey `J`.
2. Reach fact `R` is `CART_REVIEW_REACH` for that exact `A` and belongs to `J`.
3. `R.evaluation_id` is an authoritative Review evaluation on `J`.
4. `R.journey_sequence > A.watermark_sequence`.
5. `R.occurred_at < REPORT_AS_OF`.

An unassociated activation fails 1 and stays denominator-only.

| Sequence | Denominator | Numerator |
|---|---|---|
| `A1 → R1 → A2 → R2` | `A1`, `A2` | `A1`, `A2` |
| `A1 → R1 → A2 → abandon` | `A1`, `A2` | `A1` only |
| `A1 → retry(A1) → R1` | one activation | that activation |
| Direct Checkout, then Review | none from this metric | none |

No abandonment timeout removes `A2`.

## 10. Other collection and failure posture

| Signal | Where it is written | Dedup |
|---|---|---|
| Offer result viewed | One server observation row for that `evaluation_id` after comparison. Surface must match the evaluation scope | One per presented evaluation. Repaint returns it |
| Coupon outcome | `commercial_command_results`, written when the coupon command completes, including an invalid command and including when the later observation POST fails. `surface` is written in that same transaction. No raw coupon, no bearer, and no client surface label | One per caller-known `source_command_id`. Retry returns that row, including its surface. A different cart is denied |
| Review → Payment | `REVIEW_TO_PAYMENT` when Review continue commits and an authoritative Review evaluation is current | One per `continue_command_id` |
| Payment attempt | `PAYMENT_ATTEMPT` beside the existing payment command | Existing payment idempotency key |
| Successful completion | `DIRECT_ORDER_COMPLETION` inside `materializeOrderForCompletedCheckout`, using the Candidate 9 order-materialization rules | One per journey key |
| Changed-total recovery | `STALE_RECOVERY` origin on the one change fact when the server explanation is a changed total | One fact per new fingerprint |
| Complimentary-unavailable continuation | The same `STALE_RECOVERY` origin when the new Review result's server explanation class is complimentary unavailable. That is not a sixth origin | Does not mint a journey |

`surface` is written when the coupon command completes. A client surface string and a bare `checkoutId` do not prove Review. `evaluateCheckout` mints an opaque `review_surface_token` for that checkout and stores only its SHA-256. The Review coupon request sends that token. The server writes `CHECKOUT_REVIEW` only when the hash matches the stored hash for this cart's current non-terminal checkout. A request with no matching token writes `CART`. A guessed token is denied as a Review attribution and is stored as `CART` only when the rest of the coupon command is otherwise valid for the cart; it does not allocate `COUPON_ATTEMPT`. The token is not copied onto the result row, the journey fact, or a report. A lost response retries the same `source_command_id` and returns the stored surface. A failed observation does not clear it. An evaluation route that merely arrives later does not change it.

`payable_changed_vs_valid_alternative` is written only by the server from that attempt's evaluation. It is true only when the selected payable differs from the valid non-coupon alternative. It is false when those payable amounts are equal. It is null when the attempt has no valid-alternative comparison, including invalid, expired, inapplicable, exhausted, identity required, and failed before that comparison. The client does not send this boolean. A request that includes it is rejected.

`COUPON_ATTEMPT` is allocated in that same command transaction when the stored surface is `CHECKOUT_REVIEW` and a journey key exists, including an invalid attempt that writes no revision and including when the observation never arrives. Idempotency is `source_command_id`. Occurrence time is captured after the journey-head lock. A `CART` surface allocates no sequence. The fact is not a `COMMERCIAL_STATE_CHANGE`. Cohort entry still reads only `REVIEW_PRESENTED`. If the same attempt also resolves to a change fact, that fact keeps its own sequence.

```text
MEASUREMENT_FAILURE_BLOCKS_CHECKOUT = NO
MEASUREMENT_FAILURE_BLOCKS_PAYMENT = NO
MISMATCH_CHANGES_PAYABLE = NO
```

Observation and activation persistence failures are logged inside `customer-commerce` and returned as a non-commercial error. The UI keeps the last commercial result. It does not invent a saving and it does not treat the failure as money authority.

## 11. Formulas

Occurrence cutoff for every formula: authoritative occurrence time strictly before `REPORT_AS_OF`.

### Primary

Cohort entry is the `REVIEW_PRESENTED` fact with the lowest `journey_sequence` for that key, across the whole journey. `GLOBAL_COHORT_ENTRY_TIME` is that fact's `occurred_at`. The key is in the named window when `WINDOW_START <= GLOBAL_COHORT_ENTRY_TIME < WINDOW_END`. A later `REVIEW_PRESENTED` does not add a denominator and does not move the window. An evaluation that was not presented does not count. Membership is recomputed from these facts. It is not a mutable flag.

Denominator = those keys. Numerator = those same keys whose `DIRECT_ORDER_COMPLETION.occurred_at` is strictly before `REPORT_AS_OF`. Payment `SUCCEEDED` alone is not the numerator. Unfinished keys stay in the denominator as `NOT_COMPLETED_AS_OF_REPORT_CUTOFF`.

Completed segment = `presentation_class` on the `REVIEW_PRESENTED` fact with the greatest sequence that is still strictly before the completion's sequence. Unfinished segment = the greatest `REVIEW_PRESENTED` sequence whose `occurred_at` is strictly before `REPORT_AS_OF`. `COMMERCIAL_STATE_CHANGE` is not a segment source.

Equal timestamps still order by sequence. The same facts and the same cutoff publish the same numbers. A published `measurement_report_snapshots` row is immutable. A later maturation report inserts a new row with its own `report_as_of` and leaves the earlier row unchanged.

Rate = numerator / denominator when the denominator is non-zero. No target is attached. A zero denominator is `INSUFFICIENT_EVIDENCE`, not a success.

### Secondary

| Measure | Grain | Numerator | Denominator | Unavailable |
|---|---|---|---|---|
| Cart → Checkout Review continuation | One Cart activation | Section 9 | Section 9 | No |
| Review → Payment | One primary-denominator journey | That key has `REVIEW_TO_PAYMENT` causally after its cohort-entry Review and before the cutoff | Primary denominator | No |
| Payment completion after revalidation | One primary-denominator journey that had a revalidation `COMMERCIAL_STATE_CHANGE` or an unchanged revalidation attempt before pay | That key's completion is before the cutoff and a `PAYMENT_ATTEMPT` sequence is after the revalidated Review | Journeys in the primary denominator whose pay path ran revalidation before the cutoff | No |
| Coupon outcome distribution | One completed coupon command | Count of `coarse_outcome` values before the cutoff | Not a conversion rate. The distribution is the count per class | No |
| Valid-but-not-selected continuation, including equal-payable not selected | One journey whose presented Review class is that class | Later `REVIEW_TO_PAYMENT` or completion on that key before the cutoff | Those journeys | No |
| Changed-total recovery continuation | One journey with a `STALE_RECOVERY` origin before the cutoff | Later continuation or completion on that key before the cutoff | Those journeys | No |
| Complimentary-unavailable continuation | One journey whose `STALE_RECOVERY` change before the cutoff carries the server explanation class for complimentary unavailable | Later continuation or completion on that key before the cutoff | Those journeys | No |
| Repeated invalid attempts | Coupon commands on one journey before the cutoff whose class is invalid | Count of those commands. This is a guardrail count, not a new event attribute | n/a | No |
| Support contacts about a coupon, an Offer, the total, or an included item | Existing support handling | n/a | n/a | `UNAVAILABLE`. No existing approved instrumentation was found. Coupon-error counts are not a substitute |
| Displayed savings integrity | One presented evaluation on Cart or Review with both an expected row and an observation, occurrence before the cutoff | `server_presentation_match = true` | Those presented evaluations. Unobserved evaluations are reported separately as unobserved, not as matches | No |

Segments and secondary rates are descriptive. They are not causes.

## 12. Privacy

Stored measurement fields are opaque ids, integer paise for the minimum presentation comparison, component kinds, coarse classes, sequences, and occurrence times. They exclude raw coupon text, private eligibility reasons, payment secrets, customer name, email, phone, guest id, cart bearer tokens, guest verifiers, session subjects, another customer's data, and a client-authored integrity boolean. `activation_id` does not contain customer or guest identity. Coupon-command ownership is the existing cart authorization for the stored `cart_id`. Customer identity remains on checkout and on the first-order guard for eligibility and auth. It is not a measurement join.

Cross-scope reads and writes use the existing cart and checkout denial. An observation for another customer's `evaluation_id` writes nothing.

## 13. What this candidate does not do

```text
DESIGN_READINESS = NOT_PERFORMED
MEASUREMENT_INSTRUMENTATION_PLAN_FINALIZED = NO
IMPLEMENTATION_AUTHORIZED = NO
IMPLEMENTATION_STARTED = NO
D-383 = NO
ARCH-R24 = NO
NEW_ADR = NO
RUNTIME_CHANGED_BY_THIS_DOCUMENT = NO
```
