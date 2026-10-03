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

```text
CONDITIONAL_AOV_LIMITATION_EXPLICIT = YES
AOV_REQUIRES_COMPLETION_GUARDRAIL_INTERPRETATION = YES
AOV_POPULATION = SUCCESSFUL_DIRECT_ORDERS_ONLY
AOV_ESTABLISHES_TOTAL_PER_ASSIGNED_SESSION_REVENUE_UPLIFT = NO
```

Incremental AOV is **conditional on successful direct Orders**. It estimates basket-size difference
among successful Orders in treatment versus holdout. By itself it does not establish total
per-assigned-session revenue uplift if treatment also changes whether sessions successfully order.

Interpret AOV only alongside the assignment-level / order-completion guardrails in section 13
(ordering path completion, Cart → Checkout progression, Checkout completion, Payment completion).
A deterioration in those completion rates must not be hidden by a higher conditional AOV. No causal
business winner may be declared from AOV alone where completion materially differs or experiment
integrity is invalid. Insufficient sample remains `INSUFFICIENT_EVIDENCE`.

Optional diagnostic only, not a Product acceptance condition and not a replacement primary metric:

```text
SUCCESSFUL_DIRECT_ORDERS / assigned eligible ordering sessions
```

Do not invent contribution or gross-profit data. Do not invent a numeric Product success target.

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
PREVIOUSLY_EXPOSED_SESSION_RETROACTIVE_ENROLLMENT = NO
EXPERIMENT_POPULATION_DEFINED = YES
ASSIGNMENT_AUTHORITY = SERVER
BROWSER_AUTHORITATIVE = NO
CUSTOMER_PROFILE_PERSONALIZATION_FLAG = NO
CUSTOMER_IDENTITY_RANDOMIZATION_UNIT = NO
```

This plan defines the future experiment and does not turn it on. The experiment is not a Product
acceptance condition. Experiment outcome does not waive eligibility, accessibility, pricing,
payment, authorization, or financial truth.

### 4.1 Hypothesis

```text
EXPERIMENT_HYPOTHESIS =
  Showing Revenue Recommendations to eligible ordering sessions is expected to increase
  Average Order Value relative to recommendation-suppressed holdout sessions without
  materially compromising ordering/checkout/payment guardrails.

NUMERIC_SUCCESS_TARGET = NONE
HYPOTHESIS_IS_PRODUCT_ACCEPTANCE = NO
```

Do not invent a numeric success target. Do not convert this hypothesis into a Product acceptance
condition.

### 4.2 Ordering-session identity

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

```text
NEUTRAL_ORDERING_SESSION_ALLOWED_WHILE_HOLDOUT_INACTIVE = YES
INACTIVE_CONFIGURATION_WRITES_EXPERIMENT_ASSIGNMENT = NO
HOLDOUT_ARM_STORED_ON_ORDERING_SESSION = NO
INACTIVE_EXPERIMENT_CONFIGURATION =
  no experiment assignment row written solely for experimentation
INACTIVE_EXPERIMENT_CONFIGURATION !=
  no recommendation-related correlation persistence of any kind
```

Inactive experiment configuration writes **no** `recommendation_holdout_assignments` row solely for
experimentation. A neutral `recommendation_ordering_sessions` row may still exist when needed to
correlate issued sets and presentation for ordinary recommendation operation.
`recommendation_ordering_sessions` contains **no** experiment-arm authority and has **no**
`holdout_arm` column. Arm exists only on `recommendation_holdout_assignments` after a valid
enrollment assignment while the named experiment is activated.

### 4.3 Controlled-experiment population

This population is expressed only in terms of the existing direct-ordering journey and the
server-owned active ordering session. It does not invent a customer entitlement, profile,
permission, or eligibility authority. Customer identity is not the randomization unit.

Named experiment version for enrollment:

```text
EXPERIMENT_KEY = 'imp036k-revenue-recommendations-v1'
```

**Inclusion point.** Future experiment enrollment occurs only at a recommendation-capable Product
Detail, Customization, or Cart read on an active ordering session, and only when:

1. holdout configuration for that `EXPERIMENT_KEY` is activated;
2. a durable `recommendation_holdout_assignments` row for `(ordering_session_id, EXPERIMENT_KEY)`
   does not already exist;
3. the session has not previously received recommendation exposure under that experiment version.

Enrollment writes the assignment **before** the first possible recommendation exposure on that
read (`ASSIGNMENT_BEFORE_EXPOSURE = YES`). After enrollment, the arm remains stable for that
ordering session, including Cart creation, reconcile, and reload.

**Inclusion population.** Server-owned active ordering sessions on the existing guest or
authenticated direct-ordering journey that reach that inclusion point while the named experiment is
activated and that have not previously received recommendation exposure under that experiment
version.

**Exclusion population.** Sessions excluded from that experiment version, not newly randomized:

- already received recommendation exposure under that experiment version before activation or
  before enrollment (authoritative proof: any `SET_ISSUED` for that `ordering_session_id`, or any
  validated `SET_RENDER` / `ITEM_IMPRESSION` for that session);
- assignment cannot validly occur (section below);
- not on an active server-owned ordering session of the existing direct-ordering journey.

```text
PREVIOUSLY_EXPOSED_SESSION_RETROACTIVE_ENROLLMENT = NO
```

A session that has already received any recommendation exposure before holdout activation **MUST
NOT** subsequently be newly randomized into the experiment. This sequence is forbidden:

```text
recommendation exposure
→ later experiment activation / assignment
→ same ordering session becomes HOLDOUT
```

Once an ordering session has already been exposed before activation/enrollment, exclude that
session from that experiment version rather than retroactively assigning it. Excluded sessions are
not `TREATMENT` and not `HOLDOUT` for analysis. They are not newly assigned. Ordinary
recommendation operation may continue for those sessions; they are not forced into holdout
suppression by retroactive assignment.

**Treatment eligibility.** Enrolled sessions whose stored arm is `TREATMENT`. Recommendation
presentation still follows existing Product eligibility; treatment does not create a new
purchasability entitlement.

**Holdout eligibility.** Enrolled sessions whose stored arm is `HOLDOUT`. Recommendation
presentation is suppressed. Catalog, price, promotions, fulfilment, Cart, Checkout, Payment, and
entitlements remain identical.

**Treatment/holdout analysis population.** Ordering sessions with a durable assignment row for that
`EXPERIMENT_KEY` written at a valid inclusion point, observed in the named window. Conditional AOV
further restricts to successful direct Orders from those assigned sessions (section 3.1).
Pre-activation observational traffic and excluded previously-exposed sessions are not this
experiment's causal population.

**Sessions for which assignment cannot validly occur:**

- no server-owned active `ordering_session_id` can be established;
- the ordering session is expired / ended with the existing cart/journey lifecycle;
- assignment write fails or the resulting arm cannot be read;
- the session already has recommendation exposure under that experiment version;
- assignment would occur after any recommendation exposure on that session;
- the caller attempts to supply customer id, profile flag, or browser arm as the unit.

Unknown or failed assignment suppresses recommendation presentation while commerce remains
fail-open. Do not enroll after exposure. Do not flip an enrolled arm.

### 4.4 Future activated behaviour

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

```text
RECOMMENDATION_MEASUREMENT_SCHEMA = IMP-036K-RECOMMENDATION-MEASUREMENT-V1
EVENT_SCHEMA_VERSION_DEFINED = YES
MATERIAL_EVENT_REQUIRED_ATTRIBUTES_DEFINED = YES
PRODUCT_API_VERSION = NO
```

This identity is capability-local. It applies to IMP-036K material event encoding. It is not a
Product API version and does not alter Product behaviour. Every durable material measurement
occurrence stores or is deterministically associated with this schema identity so a future
incompatible measurement change can be distinguished. Reporting must not silently reinterpret old
rows under a new event meaning.

### 6.0 Shared durable envelope

Owner: customer-commerce server. Browser never authors these fields as authority.

Required on every durable material event row / derived assisted-purchase fact:

| Attribute | Authority |
|---|---|
| `measurement_schema_version` | Server; `IMP-036K-RECOMMENDATION-MEASUREMENT-V1` for this contract |
| `occurrence_id` | Server-minted authoritative occurrence identity for that meaning |
| `occurred_at` | Server time at authoritative write; client clocks are not occurrence authority |
| `ordering_session_id` | Server-owned active ordering session |
| `event_kind` | Server; one of the eight meanings above |

Where semantically applicable, also persist: `placement`, `issued_set_id`, `issued_member_id`,
`recommendation_action_id`. Do not add payment secrets, credentials, full address, names, or full
customer profile.

### 6.1 SET_ISSUED

Server-created only after a qualifying recommendation set is actually returned. Contains
authoritative correlation and membership. Does not prove presentation.

Minimum durable required attributes beyond the shared envelope: `issued_set_id`,
`ordering_session_id`, `placement`, issued membership snapshot or authoritative membership
reference (`recommendation_issued_members` for that set), `occurred_at`. Experiment key/arm
correlation is stored only when an activated experiment assignment already exists for that
ordering session; arm is never exposed to the customer.

### 6.2 SET_RENDER

Created only after server validates an observation for a module actually shown.

Minimum durable required attributes beyond the shared envelope: `presentation_occurrence_id`,
`issued_set_id`, `ordering_session_id`, `placement`, `occurred_at`.

### 6.3 ITEM_IMPRESSION

Created only after server validates an observation for that exact issued item actually shown.
Returned membership or below-fold DOM presence is insufficient.

Minimum durable required attributes beyond the shared envelope: `issued_member_id`; `issued_set_id`
or an authoritative resolvable set relation; `placement`; server-stored rank/strategy relation as
already selected on the issued member (not client-authored); authoritative
`presentation_occurrence_id`; `occurred_at`.

### 6.4 Recommendation action

Explicit customer action on the exact issued recommendation member. Remains distinct from add
acceptance. Maps Architecture "Click".

Minimum durable required attributes beyond the shared envelope: `recommendation_action_id`,
`issued_member_id`, authoritative issued-set lineage (`issued_set_id`), action occurrence /
idempotency identity (`occurrence_id` / ordinal in section 8), `occurred_at`.

### 6.5 Add attempt / successful add

Attempt records the recommendation-origin command attempt. Successful add exists only when
existing Cart accepts the current revalidated mutation.

Minimum durable required attributes beyond the shared envelope for both: recommendation-action
binding (`recommendation_action_id` / `issued_member_id`); authoritative Cart command/revision
binding needed by the chosen idempotency contract; success/outcome distinction (`ADD_ATTEMPT`
versus `SUCCESSFUL_ADD`). For `SUCCESSFUL_ADD`, also the resulting recommendation-origin unit
identity where applicable.

### 6.6 Removal

Records removal of recommendation-origin units for measurement/suppression semantics without
becoming Cart authority.

Minimum durable required attributes beyond the shared envelope: authoritative cart/unit or exact
recommendation-origin identity; occurrence identity; `occurred_at`. Removal rows are measurement
facts. They are not Cart authority.

### 6.7 Assisted purchase

Derived only when:

1. presentation proof is valid (`SET_RENDER` and `ITEM_IMPRESSION` for that issued member)
2. recommendation action is valid
3. accepted recommendation-origin unit exists
4. exact recommended identity survives
5. purchased Order exists
6. Order is not Cancelled

No view-through assistance.

Minimum durable required attributes beyond the shared envelope: `order_id`; checkout-snapshot
lineage (`orders.checkout_snapshot_id`); surviving exact snapshot-line provenance identity; exact
recommended identity. Do not infer assistance from impression-only or other-path add.

### 6.8 Source of truth and validation

```text
BROWSER_PRESENTATION_OBSERVER = YES
SERVER_VALIDATES_ISSUED_CORRELATION = YES
SERVER_WRITES_DURABLE_MEASUREMENT_TRUTH = YES
BROWSER_AUTHORS_RANK = NO
BROWSER_AUTHORS_MEMBERSHIP = NO
BROWSER_AUTHORS_ELIGIBILITY = NO
BROWSER_AUTHORS_ATTRIBUTION = NO
BROWSER_AUTHORS_HOLDOUT_ARM = NO
BROWSER_AUTHORS_RELATIONSHIP_AUTHORITY = NO
BROWSER_AUTHORS_COMMERCIAL_TRUTH = NO
```

The browser observes actual presentation only and may echo server-issued correlation ids. The
server validates that correlation against stored issued membership and writes durable measurement
truth. Invalid, unsupported, or client-authoritative event-contract input is rejected and writes
nothing. Missing required correlation fails closed for attribution and does not fail commerce.

### 6.9 Forward evolution

Incompatible event meaning or schema changes require a new `RECOMMENDATION_MEASUREMENT_SCHEMA`
identity. Old rows retain their original `measurement_schema_version`. Reporting must interpret a
row under its recorded version and must not silently reinterpret old rows under a new event
meaning. This is not a Product API version and does not create an ADR or global architecture
revision.

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
`measurement_schema_version` is server-associated with the durable write; the browser does not
author schema version, rank, membership, eligibility, attribution, holdout arm, or commercial
truth.

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
| `recommendation_ordering_sessions` | Opaque active ordering session | customer-commerce | `ordering_session_id` PK; optional `cart_id` unique when bound; `expires_at` aligned to guest cart / active journey lifecycle | No customer PII columns. **No experiment-arm / `holdout_arm` column.** Neutral rows may exist while holdout is inactive when issued-set/presentation correlation requires them |
| `recommendation_holdout_assignments` | Future experiment arm | customer-commerce | unique `(ordering_session_id, experiment_key)`; columns: arm, bucket, salt_version, `assigned_at` | Written only when the named experiment is activated and a valid enrollment assignment occurs. Inactive experiment configuration writes **no assignment row solely for experimentation**. Unique `(ordering_session_id, experiment_key)` remains the stable assignment boundary |
| `recommendation_issued_sets` | `SET_ISSUED` / `SERVER_SET_CORRELATION` | customer-commerce | `issued_set_id` PK; `ordering_session_id`; placement; membership snapshot; `occurred_at`; `measurement_schema_version` | Not presentation |
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

Every durable material measurement occurrence relation (`recommendation_issued_sets`,
`recommendation_presentation_occurrences`, `recommendation_actions`,
`recommendation_add_attempts`, `recommendation_removals`, and derived assisted-purchase facts)
stores `measurement_schema_version`. Experiment assignment remains a distinct concept from
ordering-session correlation.

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
- Incremental AOV remains conditional on successful direct Orders and must be interpreted with
  the completion guardrails in section 13. A higher conditional AOV with deteriorated
  ordering/Cart→Checkout/Checkout/Payment completion is not an automatic overall business success.
  No causal business winner may be declared from AOV alone where completion materially differs.
- Optional diagnostic: successful direct Orders / assigned eligible ordering sessions. Not Product
  acceptance.

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
EXPERIMENT_POPULATION_DEFINED = YES
ASSIGNMENT_SEQUENCING_RESOLVED = YES
PREVIOUSLY_EXPOSED_SESSION_RETROACTIVE_ENROLLMENT = NO
SCHEMA_SELECTED = YES
EVENT_SCHEMA_VERSION_DEFINED = YES
RECOMMENDATION_MEASUREMENT_SCHEMA = IMP-036K-RECOMMENDATION-MEASUREMENT-V1
MATERIAL_EVENT_REQUIRED_ATTRIBUTES_DEFINED = YES
MATERIAL_EVENT_SOURCE_VALIDATION_DEFINED = YES
OLD_EVENT_ROWS_SILENTLY_REINTERPRETED = NO
MIGRATION_WRITTEN_BY_THIS_CANDIDATE = NO
TRANSPORT_SELECTED = YES
IDEMPOTENCY_DEDUPE_SELECTED = YES
PURCHASED_ORDER_CORRELATION_SELECTED = YES
AOV_FORMULA_GROUNDED_IN_AUTHORITATIVE_MONEY = YES
CONDITIONAL_AOV_LIMITATION_EXPLICIT = YES
AOV_REQUIRES_COMPLETION_GUARDRAIL_INTERPRETATION = YES
ATTACH_FORMULA_GROUNDED_IN_EXACT_IDENTITY = YES
GUARDRAILS_DEFINED = YES
INTERPRETATION_INSUFFICIENT_EVIDENCE_RULES_DEFINED = YES
PRIVACY_RETENTION_DEFINED = YES
NEW_PRODUCT_EXPERIENCE_ARCHITECTURE_AUTHORITY = NO

HOLDOUT_ACTIVATED = NO
FUTURE_HOLDOUT_ALLOCATION = 10_PERCENT
ASSIGNMENT_UNIT = SERVER_OWNED_ACTIVE_ORDERING_SESSION
ASSIGNMENT_BEFORE_EXPOSURE = YES
NEUTRAL_ORDERING_SESSION_ALLOWED_WHILE_HOLDOUT_INACTIVE = YES
INACTIVE_CONFIGURATION_WRITES_EXPERIMENT_ASSIGNMENT = NO
HOLDOUT_ARM_STORED_ON_ORDERING_SESSION = NO
INACTIVE_HOLDOUT_STORAGE_MODEL_CONSISTENT = YES
PRIMARY_MEASURABLE_METRIC = INCREMENTAL_AVERAGE_ORDER_VALUE
CONTRIBUTION_FORMULA_INVENTED = NO
NUMERIC_SUCCESS_TARGET = NONE
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
