<!-- governance-meta
{
  "status": "CANDIDATE",
  "authority": "NONE",
  "capability": "IMP-036K",
  "candidateId": "IMP-036K-MEASUREMENT-CANDIDATE-1",
  "experienceDefinition": "XD-IMP-036K-DRAFT-1",
  "architectureSource": "IMP-036K-FIT-CANDIDATE-1",
  "designCandidate": "IMP-036K-DESIGN-CANDIDATE-1",
  "qualityCandidate": "IMP-036K-QUALITY-CANDIDATE-1",
  "measurementInstrumentationPlanFinalized": "NO",
  "designReadiness": "PASS",
  "implementationAuthorized": false,
  "implementationStarted": false
}
-->

# IMP-036K — Measurement and instrumentation plan candidate

```text
CANDIDATE_ID = IMP-036K-MEASUREMENT-CANDIDATE-1
STATUS = CANDIDATE
AUTHORITY = NONE
CAPABILITY = IMP-036K
MEASUREMENT_INSTRUMENTATION_PLAN_FINALIZED = NO
DESIGN_READINESS = PASS
DESIGN_CANDIDATE = IMP-036K-DESIGN-CANDIDATE-1
QUALITY_CANDIDATE = IMP-036K-QUALITY-CANDIDATE-1
ARCHITECTURE_SOURCE = IMP-036K-FIT-CANDIDATE-1
ARCHITECTURE_FIT = PASS
ARCHITECTURE_LOCKED = YES
INDEPENDENT_MEASUREMENT_PLAN_REVIEW = NOT_PERFORMED
IMPLEMENTATION_PLAN = NOT_PERFORMED
IMPLEMENTATION_AUTHORIZED = NO
IMPLEMENTATION_STARTED = NO
NUMERIC_SUCCESS_TARGET = NONE
MEASUREMENT_SUBSTITUTES_FOR_ACCEPTANCE = NO
NEW_NUMERIC_RETENTION = NO
RETENTION_PERIOD_INVENTED = NO
NEW_SERVICE = NO
NEW_QUEUE = NO
ANALYTICS_VENDOR = NONE
NEW_ROLE = NO
NEW_PERMISSION = NO
NEW_MONEY_AUTHORITY = NO
DO_NOT_MERGE = YES

PRODUCT_DEFINITION = PD-IMP-036K-DRAFT-1
EXPERIENCE_DEFINITION = XD-IMP-036K-DRAFT-1
ARCH_R23 = UNCHANGED
DR_24 = UNCHANGED
D-383 = CURRENT
D-384 = NO
ARCH-R24 = NO
NEW_ADR = NO
NEW_ARCH_G = NO
```

This candidate owns the concrete measurement choices deferred by Product, Experience, and locked
`IMP-036K-FIT-CANDIDATE-1`. It operationalizes Experience section 17 and Architecture sections
7.12–7.15 and 14. It does not implement collection, does not activate holdout, and does not
self-declare finalization. It does not redefine Product acceptance or Quality/Test proof.
`IMP-036K-QUALITY-CANDIDATE-1` proves this contract under TEST-1.

## 1. Fundamental authority boundaries

```text
WRITE_AUTHORITY = SERVER
BROWSER_PRESENTATION_OBSERVER = YES
BROWSER_ELIGIBILITY_AUTHORITY = NO
BROWSER_ATTRIBUTION_AUTHORITY = NO
BROWSER_HOLDOUT_AUTHORITY = NO

NEW_SERVICE = NO
NEW_QUEUE = NO
ANALYTICS_VENDOR = NONE
NEW_ROLE = NO
NEW_PERMISSION = NO
NEW_MONEY_AUTHORITY = NO
FACADE = EXISTING /api/v1/*
ADMIN_FACADE = EXISTING /api/admin/v1/*
AUTH_BOUNDARY = EXISTING_CART_CREDENTIAL_AND_CUSTOMER_SESSION
```

Use existing customer-commerce and workforce boundaries. Do not introduce an external analytics
vendor.

## 2. Contribution / margin constraint

Locked Architecture establishes that no authoritative contribution or margin field exists, and no
cost/contribution column exists on current price books. V1 must not invent a contribution formula.

```text
INCREMENTAL_CONTRIBUTION_GROSS_PROFIT =
  DESIRED_PRODUCT_OUTCOME_BUT_CURRENTLY_UNAVAILABLE_AS_AUTHORITATIVE_METRIC

NEW_CONTRIBUTION_FORMULA = NO
NEW_MARGIN_AUTHORITY = NO
CONTRIBUTION_FORMULA_INVENTED = NO
```

Do not infer gross profit from display price. Do not manufacture cost. Do not turn relationship
priority into money. If a future pricing authority publishes an authoritative contribution
projection, this measurement contract may be revised separately. Until then, measurable Product
priority after unavailable contribution is:

1. incremental Average Order Value
2. recommendation attach rate
3. commerce completion guardrails

## 3. Preserved measurable outcomes

```text
PRIMARY_MEASURABLE_METRIC = INCREMENTAL_AVERAGE_ORDER_VALUE
SECONDARY_METRIC = RECOMMENDATION_ATTACH_RATE
DIAGNOSTIC = RECOMMENDATION_ASSISTED_PURCHASE_RATE
NUMERIC_SUCCESS_TARGET = NONE
MEASUREMENT_SUBSTITUTES_FOR_ACCEPTANCE = NO
CAUSAL_UPLIFT_FROM_TREATMENT_ONLY_DATA = NOT_CLAIMED
LOW_VOLUME = INSUFFICIENT_EVIDENCE
```

No numeric uplift target is approved by Product. Do not invent a revenue target.

### 3.1 Incremental Average Order Value

Authoritative purchased money is the sealed Checkout Snapshot already bound to the Order:

```text
MONEY_FIELD = checkout_snapshots.grand_total_paise
ORDER_LINK = orders.checkout_snapshot_id → checkout_snapshots.id
MENU_DISPLAY_PRICE = NOT_PURCHASED_MONEY
```

Repository inspection of `src/platform/database/schema/order.ts`,
`src/platform/database/schema/checkout.ts`, and order materialization confirms Orders bind
`checkout_snapshot_id` and snapshots store `grand_total_paise`. That is the AOV money field.

Population for a published calculation:

- platform direct Orders only
- `orders.status in ('PLACED', 'ACCEPTED', 'FULFILLED')`
- `CANCELLED` excluded
- Order occurrence time = `orders.created_at` against the named window

When holdout is activated in a future configuration:

```text
TREATMENT_AOV = avg(grand_total_paise) over successful Orders whose ordering session arm = TREATMENT
HOLDOUT_AOV   = avg(grand_total_paise) over successful Orders whose ordering session arm = HOLDOUT
INCREMENTAL_AVERAGE_ORDER_VALUE = TREATMENT_AOV - HOLDOUT_AOV
```

When holdout is inactive (this candidate's default), treatment-only descriptive AOV may be reported
as an observational diagnostic. It is not incremental causal uplift.

### 3.2 Recommendation attach rate

```text
RECOMMENDATION_ATTACH_RATE =
  count of successful direct Orders with ≥1 ASSISTED_PURCHASE identity
  / count of successful direct Orders whose ordering session had ≥1 validated SET_RENDER
```

Do not count:

- impression as attach
- recommendation action with rejected add
- manually added item
- item whose exact recommendation identity did not survive purchase

Separate diagnostics, not Product acceptance:

| Diagnostic | Definition |
|---|---|
| presentation → action | `RECOMMENDATION_ACTION` / validated `SET_RENDER` sets |
| impression → action | `RECOMMENDATION_ACTION` / validated `ITEM_IMPRESSION` members |
| action → successful add | `SUCCESSFUL_ADD` / `ADD_ATTEMPT` |
| successful add → purchased assisted identity | `ASSISTED_PURCHASE` identities / `SUCCESSFUL_ADD` recommendation-origin units |

```text
DIAGNOSTIC = RECOMMENDATION_ASSISTED_PURCHASE_RATE
RECOMMENDATION_ASSISTED_PURCHASE_RATE =
  count of ASSISTED_PURCHASE identities
  / count of successful direct Orders in the same population
```

## 4. Causal holdout design

```text
HOLDOUT_ACTIVATED = NO
HOLDOUT_CONFIGURATION_DEFAULT = INACTIVE
FUTURE_CONTROL_ALLOCATION = 10_PERCENT
FUTURE_TREATMENT_ALLOCATION = 90_PERCENT
ACTIVATION_REQUIRED_FOR_PRODUCT_ACCEPTANCE = NO
ASSIGNMENT_UNIT = SERVER_OWNED_ACTIVE_ORDERING_SESSION
ASSIGNMENT_BEFORE_EXPOSURE = YES
ASSIGNMENT_AUTHORITY = SERVER
BROWSER_AUTHORITATIVE = NO
CUSTOMER_PROFILE_PERSONALIZATION_FLAG = NO
```

This plan defines the future experiment and does not turn it on.

### 4.1 Ordering-session identity

```text
ORDERING_SESSION_ID = server-minted UUID v4
OPAQUE = YES
SERVER_OWNED = YES
CONTAINS_CUSTOMER_IDENTITY = NO
BROWSER_LOCAL_STORAGE_AUTHORITY = NO
```

The active ordering session:

- is created by the server before the first Product Detail, Customization, or Cart recommendation
  read that could expose a module, whenever holdout configuration is activated or whenever an
  issued-set correlation needs a journey correlation under ordinary recommendation operation
- is reusable by a Cart created later in the same active ordering journey
- is not assigned from `cart_id` only after Product Detail may already have exposed recommendations
- is not a customer-profile personalization flag
- is not browser/local-storage authority
- does not contain customer identity
- expires with the existing active ordering-session/cart lifecycle rather than inventing a permanent
  profile

Binding:

- guest journey: ordering session is bound to the existing guest cart credential when a cart exists,
  and to a short-lived server-owned session cookie/credential that is exchanged for the same
  `ordering_session_id` when the cart is created
- authenticated customer journey: ordering session is bound to the active brand cart when present,
  and otherwise to a short-lived server-owned session credential that merges onto that cart without
  changing customer id into the experiment key
- `claimGuestCart` / cart reconcile: surviving cart keeps the already-exposed ordering session; a
  new unexposed journey may mint a new session. An already-exposed session does not roll a new
  holdout arm because a cart appeared later

Inactive configuration writes no holdout assignment solely for experimentation. A neutral
ordering-session row may still exist when needed to correlate issued sets and presentation for
ordinary recommendation operation; that row's `holdout_arm` stays null while inactive.

### 4.2 Future activated behaviour

When holdout is ever activated:

- treatment = recommendation system may present normally
- holdout = recommendation presentation suppressed
- catalog, price, promotions, fulfilment, Cart, Checkout, Payment, and entitlements remain identical
- unknown/missing assignment = suppress recommendation module and fail open for commerce
- no customer message explains holdout

## 5. Assignment algorithm

Deterministic server-owned assignment supporting 10/90. Not activated by this candidate.

```text
EXPERIMENT_KEY = 'imp036k-revenue-recommendations-v1'
ARM_BUCKET = uint16_be(first 2 bytes of SHA-256(
  ordering_session_id || 0x00 || EXPERIMENT_KEY || 0x00 || allocation_salt
)) % 100

HOLDOUT   = ARM_BUCKET in [0, 9]    # 10%
TREATMENT = ARM_BUCKET in [10, 99]  # 90%
```

Properties:

- stable once written for the ordering session
- auditable: stored arm, bucket, experiment key version, and salt version
- concurrency-safe: insert-on-conflict / unique `(ordering_session_id, experiment_key)` returns the
  existing arm
- retry-safe: replay returns the same arm
- not caller-selectable
- not derived from sensitive customer identity
- not exposed as a customer entitlement or customer response field

`allocation_salt` is a server configuration secret/version used only for bucket stability across
retries. It is not a customer field. Changing salt starts a new experiment key/version and does not
rewrite historical arms.

## 6. Event taxonomy

Architecture section 7.13 meanings are preserved. Where Architecture uses a more precise internal
name, map it explicitly.

| Product / plan meaning | Architecture name | Encoding event_kind | Authority |
|---|---|---|---|
| `SET_ISSUED` | Set issuance / `SERVER_SET_CORRELATION` | `SET_ISSUED` | Server, only when a qualifying set is returned |
| `SET_RENDER` | Recommendation-set render | `SET_RENDER` | Server after validating actual module presentation |
| `ITEM_IMPRESSION` | Item impression | `ITEM_IMPRESSION` | Server after validating actual item presentation |
| `RECOMMENDATION_ACTION` | Click | `RECOMMENDATION_ACTION` | Server after validating action on an issued member |
| `ADD_ATTEMPT` | Add attempt | `ADD_ATTEMPT` | Server at recommendation-origin command attempt |
| `SUCCESSFUL_ADD` | Successful add | `SUCCESSFUL_ADD` | Server when Cart accepts the revalidated mutation |
| `REMOVAL` | Removal | `REMOVAL` | Server when recommendation-origin units are removed |
| `ASSISTED_PURCHASE` | Assisted purchase | `ASSISTED_PURCHASE` | Derived at Order materialization/report from surviving marks |

### 6.1 SET_ISSUED

Server-created only after a qualifying recommendation set is actually returned. Contains
authoritative correlation and membership. Does not prove presentation.

### 6.2 SET_RENDER

Created only after server validates an observation for a module actually shown.

### 6.3 ITEM_IMPRESSION

Created only after server validates an observation for that exact issued item actually shown.
Returned membership or below-fold DOM presence is insufficient.

### 6.4 Recommendation action

Explicit customer action on the exact issued recommendation member. Remains distinct from add
acceptance. Maps Architecture "Click".

### 6.5 Add attempt / successful add

Attempt records the recommendation-origin command attempt. Successful add exists only when
existing Cart accepts the current revalidated mutation.

### 6.6 Removal

Records removal of recommendation-origin units for measurement/suppression semantics without
becoming Cart authority.

### 6.7 Assisted purchase

Derived only when:

1. presentation proof is valid (`SET_RENDER` and `ITEM_IMPRESSION` for that issued member)
2. recommendation action is valid
3. accepted recommendation-origin unit exists
4. exact recommended identity survives
5. purchased Order exists
6. Order is not Cancelled

No view-through assistance.

## 7. Correlation / identity model

| Identity | Encoding | What it is not |
|---|---|---|
| Active ordering session | `ordering_session_id` UUID v4 | customer id, guest verifier plaintext, phone, email, browser-generated authority |
| Holdout assignment | row unique on `(ordering_session_id, experiment_key)` with arm `TREATMENT` \| `HOLDOUT` | customer entitlement, profile flag |
| Issued recommendation set | `issued_set_id` UUID v4; `SERVER_SET_CORRELATION` | presentation proof |
| Issued member/candidate | `issued_member_id` UUID v4 bound to set, placement, marked identity, bound recommendation-action id, server rank | client-invented candidate |
| Presentation occurrence | `presentation_occurrence_id` UUID v4 for accepted `SET_RENDER` or `ITEM_IMPRESSION` | DOM presence, issuance alone |
| Recommendation action | `recommendation_action_id` UUID v4 bound at issuance to the member; echoed by browser | add acceptance |
| Recommendation-origin unit provenance | server mark on cart line units, copied to snapshot line only while exact identity survives | `line_origin`, price, client boolean |
| Purchased Order correlation | `orders.id` + `orders.checkout_snapshot_id` + surviving snapshot provenance | live menu/catalog state after purchase |

Do not use customer ID as experimental randomization identity. Do not use timestamps or physical
row order as idempotency identity.

Marked identity remains Architecture section 7.12:

- concrete product
- category target → concrete product actually presented/added
- customization variant id
- customization modifier option id

Parent-product survival is not variant/modifier survival.

## 8. Dedupe / idempotency

| Boundary | Uniqueness / rule |
|---|---|
| `SET_ISSUED` | Unique `issued_set_id`. Retry of the same recommendation-read transaction returns the same issued set; does not create a second issuance for that response. A genuinely new returned set may create a new issuance |
| `SET_RENDER` | Unique `(issued_set_id, placement, occurrence_kind='SET_RENDER')` for the authoritative first actual presentation of that issued set on that placement. Browser retry returns existing occurrence. Ordinary React remount does not allocate another |
| `ITEM_IMPRESSION` | Unique `(issued_member_id, occurrence_kind='ITEM_IMPRESSION')` for the authoritative first actual presentation of that issued member. Retry/remount safe |
| `RECOMMENDATION_ACTION` | Unique `(recommendation_action_id, action_ordinal)` where first accepted action for that bound id is ordinal 1; lost HTTP response retry returns existing action occurrence |
| `ADD_ATTEMPT` / `SUCCESSFUL_ADD` | Keyed by server command identity already used by cart mutation (`expectedRevision` + recommendation-action binding). Retry after commit does not create a second success for the same unit set |
| Holdout assignment | Unique `(ordering_session_id, experiment_key)`; first writer wins |
| `ASSISTED_PURCHASE` | Derived unique on `(order_id, snapshot_line_provenance_identity)`. Order read/report retry does not double-count |

A genuinely new issued set or a genuinely new later presentation of a newly issued set/member may
create a new occurrence where the semantics permit it.

## 9. Transport

```text
TRANSPORT = EXISTING /api/v1/* customer-commerce boundary
ADMIN_TRANSPORT = EXISTING /api/admin/v1/* for relationship administration only
```

Concrete request shapes for later Implementation Plan (schema selected; not implemented here):

### 9.1 Recommendation read

`GET /api/v1/recommendations?placement=PRODUCT_DETAIL|CUSTOMIZATION|CART` with existing cart /
outlet / fulfilment context from server session. Response returns customer-safe fields plus opaque
`issuedSetId` and per-member `issuedMemberId` / `recommendationActionId` only when a qualifying
set is issued. No priority, margin, holdout arm, or suppression reason.

### 9.2 Presentation observation

`POST /api/v1/recommendations/observations`

```text
{
  "issuedSetId": "<uuid>",
  "placement": "PRODUCT_DETAIL" | "CUSTOMIZATION" | "CART",
  "observation": "SET_RENDER" | "ITEM_IMPRESSION",
  "issuedMemberId": "<uuid>" // required for ITEM_IMPRESSION only
}
```

Server validates against stored issued correlation. Unsupported client-authoritative or sensitive
fields are rejected and write nothing. Observation transport failure remains commerce fail-open.

Rejected examples: eligibility flags, membership arrays, rank, relationship ids supplied as
authority, holdout arm, assistance boolean, payment secrets, address/name/profile, client
timestamps used as occurrence authority, integrity booleans.

### 9.3 Recommendation action / add

Reuses `POST /api/v1/cart/lines` with server-bound `recommendationActionId`. No parallel cart API.
Add-time revalidation remains Architecture section 7.10.

### 9.4 Authority denials on observation/add

Observation requests never accept the browser as authority for eligibility, membership, rank,
relationship, holdout, assistance, or commercial priority.

## 10. Storage

```text
SCHEMA_SELECTED = YES
MIGRATION_WRITTEN_BY_THIS_CANDIDATE = NO
```

Smallest durable schema needed. Reuse Orders, Checkout Snapshots, Cart, and existing workforce
audit. Do not create a second Order/Cart/Catalog/Pricing authority.

| Relation | Purpose | Owner | Keys / uniqueness | Notes |
|---|---|---|---|---|
| `recommendation_ordering_sessions` | Opaque active ordering session | customer-commerce | `ordering_session_id` PK; optional `cart_id` unique when bound; `expires_at` aligned to guest cart / active journey lifecycle | No customer PII columns |
| `recommendation_holdout_assignments` | Future experiment arm | customer-commerce | unique `(ordering_session_id, experiment_key)`; columns: arm, bucket, salt_version, `assigned_at` | Written only when holdout activated; inactive config writes none |
| `recommendation_issued_sets` | `SET_ISSUED` / `SERVER_SET_CORRELATION` | customer-commerce | `issued_set_id` PK; `ordering_session_id`; placement; membership snapshot; `occurred_at` | Not presentation |
| `recommendation_issued_members` | Issued membership | customer-commerce | `issued_member_id` PK; unique `(issued_set_id, marked_identity_fingerprint)`; server rank; bound `recommendation_action_id`; strategy internal enum nullable | Customer-safe payload echoes ids only |
| `recommendation_presentation_occurrences` | Validated `SET_RENDER` / `ITEM_IMPRESSION` | customer-commerce | uniqueness in section 8; `presentation_occurrence_id` PK | Browser observer only |
| `recommendation_actions` | Validated `RECOMMENDATION_ACTION` | customer-commerce | unique action occurrence identity in section 8 | Distinct from add acceptance |
| `recommendation_add_attempts` | `ADD_ATTEMPT` / `SUCCESSFUL_ADD` outcomes | customer-commerce | unique command/action binding; coarse outcome | No payment fields |
| `recommendation_removals` | `REMOVAL` measurement rows | customer-commerce | cart id + candidate identity + occurrence id | Not Cart authority |
| `cart_recommendation_suppressions` | Active-cart suppression | Cart | unique `(cart_id, marked_identity_fingerprint)` | Presentation-only effect |
| Cart unit assistance mark (cart extension) | Provenance on recommendation-origin units | Cart | unit-scoped mark; exact identity; placement; relationship id nullable | Ignored by price/tax/payment |
| Snapshot assistance provenance (snapshot-line extension) | Surviving mark copy | Checkout Snapshot | copied only when identity survives; `line_origin` stays `cart` \| `complimentary_offer` | Not a new commercial line origin |
| Operator relationships + revision | Admin model | Menu administration | compare-and-swap revision; placements Product Detail/Cart only | No Customization placement |
| `measurement_report_snapshots` | Immutable published calculations | customer-commerce | unique `(metric, window_start, window_end, report_as_of)` insert-only | Replay returns existing row |

Important indexes:

- issued sets by `ordering_session_id`, placement, `occurred_at`
- presentation occurrences by `issued_set_id` / `issued_member_id`
- suppressions by `cart_id`
- holdout assignments by `ordering_session_id`
- Popular evidence continues to use existing `orders_status_created_at_idx` and snapshot FKs; no
  second order truth

Sensitive-field exclusions: payment secrets, credentials, full address, names, full customer
profile, internal margin/contribution rationale, raw authorization/session credentials, holdout
explanations, customer-visible priority.

Deletion/expiry: ordering-session and suppression rows end with cart clear/expiry or equivalent
active-journey end. Issued/presentation rows remain under existing commerce analytics retention
authority and are not a second commercial ledger.

## 11. Purchased-order measurement

All purchased-money and purchased-item results read the authoritative Order / Checkout Snapshot
lineage already approved.

```text
ASSISTED_PURCHASE_SOURCE = surviving marked identity on sealed snapshot lines bound to Order
LIVE_MENU_AFTER_PURCHASE = NOT_AUTHORITY
CANCELLED_ORDERS = EXCLUDED
```

Exact recommendation identity at purchase is the surviving marked identity copied through existing
locked provenance. Cancelled Orders are excluded from assisted purchase.

## 12. Popular evidence

Popular measurement/operational evidence remains distinct from holdout analytics.

```text
SOURCE = app.orders
  joined to checkout_snapshots.selected_outlet_id
  joined to checkout_snapshot_lines.quantity and product_id
WINDOW = orders.created_at over the trailing 30 days
OUTLET = selected outlet of the current recommendation context
SUCCESS = status in PLACED, ACCEPTED, FULFILLED
EXCLUDED = CANCELLED
MINIMUM_ORDERS = 30 distinct successful orders for that outlet in the window
RANK = eligible products in the relevant current menu section/category
METRIC = sum of checkout_snapshot_lines.quantity where line_origin = cart
COMPLIMENTARY_OFFER_LINES_COUNTED = NO
TREATMENT = top 3 only, and only when the order minimum is met
INSUFFICIENT = no Popular treatment
FAILURE_OF_THIS_READ = no Popular treatment
```

Popularity being unavailable is not recommendation-launch failure.

## 13. Guardrails

At minimum report:

- ordering path completion
- Cart → Checkout progression
- Checkout completion
- Payment completion
- recommendation generation/read errors
- recommendation add/revalidation errors
- observation-reporting errors
- stale-add rate
- accessibility/security correctness as acceptance proof, not merely a business metric

```text
NUMERIC_GUARDRAIL_LIMITS_INVENTED = NO
```

Do not fabricate numeric guardrail limits unless an existing authority already defines one.
Correctness/security failures can be explicit stop conditions even without a numeric business
target.

## 14. Calendar, window, and retention

Reuse IMP-036J commerce-measurement precedent where applicable:

```text
MEASUREMENT_CALENDAR_TIMEZONE = Asia/Kolkata
WINDOW = HALF_OPEN_28_CIVIL_DAYS
RETENTION_AUTHORITY = EXISTING_COMMERCE_ANALYTICS_RETENTION
NEW_NUMERIC_RETENTION = NO
RETENTION_PERIOD_INVENTED = NO
```

A search of current platform authority did not find a numeric commerce-analytics retention period
for this contract. This plan does not invent one.

`PRODUCTION_RELEASE_ANCHOR` is a named instant supplied to a published calculation. The initial
window is `[PRODUCTION_RELEASE_ANCHOR, that instant plus 28 civil days in Asia/Kolkata)`. Start
inclusive, end exclusive. `REPORT_AS_OF` includes facts whose authoritative occurrence time is
strictly before that cutoff.

## 15. Experiment interpretation

Because live holdout activation is not part of this gate:

- define the analysis contract now
- do not claim an experiment has run
- do not claim causal uplift from observational treatment-only data
- treatment-only pre-activation reporting may describe attach/assisted rates but not incremental
  causal uplift

For a future activated holdout:

- observation window = half-open 28 civil days in `Asia/Kolkata` from a named activation or release
  anchor
- report cutoff = exclusive end / supplied `REPORT_AS_OF`
- confidence/power method = difference in means for AOV with Wilson or normal approximation
  intervals for rates; no invented Product revenue target
- insufficient sample = `INSUFFICIENT_EVIDENCE`, not success/failure
- avoid optional stopping
- report effect estimates and uncertainty
- no causal success claim when allocation integrity or presentation evidence is invalid

## 16. Stop / invalidation rules

Future experiment analysis must stop or be invalid when:

- assignment occurs after exposure
- treatment/holdout flips within a session
- allocation authority becomes client-controlled
- presentation proof integrity is broken
- cross-session/cross-customer correlation occurs
- commerce is blocked by recommendation/measurement failure
- recommendation-origin identity is incorrectly preserved
- sensitive data is captured contrary to policy

Business underperformance with insufficient sample is not automatically a correctness failure.

## 17. Privacy / retention exclusions

Exclude at minimum:

- payment secrets
- credentials
- full address
- names
- full customer profile
- internal margin/contribution rationale
- raw authorization/session credentials

Use opaque correlation identifiers. Follow existing commerce analytics retention authority.
`NEW_NUMERIC_RETENTION = NO`.

## 18. Cross-plan consistency

```text
QUALITY_CANDIDATE = IMP-036K-QUALITY-CANDIDATE-1
MEASUREMENT_CANDIDATE = IMP-036K-MEASUREMENT-CANDIDATE-1
DESIGN_CANDIDATE = IMP-036K-DESIGN-CANDIDATE-1
ARCHITECTURE_SOURCE = IMP-036K-FIT-CANDIDATE-1
```

Quality proves this Measurement contract. This Measurement candidate does not redefine Product
acceptance or test proof.

## 19. Measurement exit

```text
EVENT_MEANINGS_CONCRETELY_ENCODED = YES
HOLDOUT_UNIT_POPULATION_ALLOCATION_ACTIVATION_SELECTED = YES
ASSIGNMENT_SEQUENCING_RESOLVED = YES
SCHEMA_SELECTED = YES
MIGRATION_WRITTEN_BY_THIS_CANDIDATE = NO
TRANSPORT_SELECTED = YES
IDEMPOTENCY_DEDUPE_SELECTED = YES
PURCHASED_ORDER_CORRELATION_SELECTED = YES
AOV_FORMULA_GROUNDED_IN_AUTHORITATIVE_MONEY = YES
ATTACH_FORMULA_GROUNDED_IN_EXACT_IDENTITY = YES
GUARDRAILS_DEFINED = YES
INTERPRETATION_INSUFFICIENT_EVIDENCE_RULES_DEFINED = YES
PRIVACY_RETENTION_DEFINED = YES
NEW_PRODUCT_EXPERIENCE_ARCHITECTURE_AUTHORITY = NO

HOLDOUT_ACTIVATED = NO
FUTURE_HOLDOUT_ALLOCATION = 10_PERCENT
ASSIGNMENT_UNIT = SERVER_OWNED_ACTIVE_ORDERING_SESSION
ASSIGNMENT_BEFORE_EXPOSURE = YES
PRIMARY_MEASURABLE_METRIC = INCREMENTAL_AVERAGE_ORDER_VALUE
CONTRIBUTION_FORMULA_INVENTED = NO
SET_ISSUED_DISTINCT_FROM_PRESENTATION = YES
SET_RENDER_ACTUAL_PRESENTATION_ONLY = YES
ITEM_IMPRESSION_ACTUAL_ITEM_PRESENTATION_ONLY = YES
EXACT_IDENTITY_ASSISTANCE = YES
VIEW_THROUGH_ASSISTANCE = NO
COMMERCE_FAIL_OPEN = YES
ATTRIBUTION_FAIL_CLOSED = YES

MEASUREMENT_INSTRUMENTATION_PLAN_FINALIZED = NO
INDEPENDENT_MEASUREMENT_PLAN_REVIEW = NOT_PERFORMED
IMPLEMENTATION_PLAN = NOT_PERFORMED
IMPLEMENTATION_AUTHORIZED = NO
IMPLEMENTATION_STARTED = NO
DO_NOT_MERGE = YES
```

This candidate is implementation-plan-ready and remains unimplemented.
