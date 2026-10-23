<!--
  AUTHORITY: NON_AUTHORITATIVE_DISCOVERY_DRAFT
  ID: ARCH-UOE-LOCK-PROPOSAL-1
  PACKAGE: UOE-CANDIDATE-3
-->

# Architecture Lock proposal — Unified Order Experience

```text
PROPOSAL_ID = ARCH-UOE-LOCK-PROPOSAL-1
PACKAGE = UOE-CANDIDATE-3
VARIANT = PRECHECKOUT_ELIGIBILITY_WEB_FIRST_V1
STATUS = DECISION_READY_ARCHITECTURE_LOCK_PROPOSAL
AUTHORITY = NON_AUTHORITATIVE_DISCOVERY_DRAFT
APPLICATION_CODE_MUTATION = NO
SCHEMA_MUTATION = NO
FORMAL_ARCHITECTURE_FIT_PASS = NOT_GRANTED
ARCHITECTURE_LOCK = NO
DESIGN_READINESS = NOT_GRANTED
IMPLEMENTATION_AUTHORIZED = NO
PREREQUISITE_GATES = Product Definition Gate PASS + Experience Gate PASS
FOUNDER_GATE_DECISION_REFERENCE = https://github.com/nivedhya11/BobaBear/pull/424#issuecomment-6365686428
REVIEWED_PRODUCT_EXPERIENCE_HEAD = dbe0786280fac4ba80ba727c7510b8c23da69ed1
FIT_EVALUATION_HEAD = ecbfb4f4f7f06a888e0a3c4417bc1c647239974b
PROPOSAL_BASE_HEAD = ecbfb4f4f7f06a888e0a3c4417bc1c647239974b
INDEPENDENT_ARCHITECTURE_REVIEW = 8a05654d-23bf-423a-b63a-bba025b63f3f
INDEPENDENT_SECURITY_REVIEW = b6c13c64-b4af-44b8-879f-5ba7fc60015f
INDEPENDENT_FINANCIAL_INTEGRITY_REVIEW = 6c0c9948-4755-4e6e-8002-e4fc5456cb2b
REVIEW_FINDINGS_RESOLVED_IN_DOCS = YES
```

This document prepares a **decision-ready Architecture Lock proposal** for the approved
`PD-UOE-CANDIDATE-3` / `XD-UOE-CANDIDATE-3` contracts under the already-evaluated variant
`PRECHECKOUT_ELIGIBILITY_WEB_FIRST_V1`. It does **not** grant Architecture Fit PASS,
Architecture Lock, Design Readiness, implementation authorization, merge, or deploy.

Independent Architecture, Security, and Financial Integrity reviews validated this proposal;
material documentation findings are resolved below. No application code or schema is mutated by
this proposal.

---

## 1. Fit recommendation (for Founder decision — not self-granted)

```text
FIT_RECOMMENDATION = PRECHECKOUT_ELIGIBILITY_WEB_FIRST_V1
FORMAL_ARCHITECTURE_FIT_PASS = NOT_GRANTED
ARCHITECTURE_LOCK = NO
```

| Dimension | Proposal |
|---|---|
| Variant | Reuse evaluated `PRECHECKOUT_ELIGIBILITY_WEB_FIRST_V1` (Contracts A/B/C/D in `06-…`) |
| New aggregates / services / roles / permissions | **None** |
| Second commercial authority | **Forbidden** |
| Domain rename `PICKUP` → Takeaway | **Forbidden** (D6) |
| Menu exact-slot API | **Out of V1** (UOE-DR-02) |
| Checkout composition defect remediation | Remains **ACCEPTED_CAPABILITY_CONFORMANCE_DEFECT**; preferred separately scoped corrective; **NOT_AUTHORIZED** here (UOE-DR-06) |
| Future IMP identity | **NOT_ALLOCATED** / sequencing **DEFERRED** (UOE-DR-01); does not block Fit recommendation |

**Founder action required for Fit PASS / Lock:** explicit separate decisions. This proposal only
makes those decisions decision-ready.

---

## 2. CART commercial-evaluation provenance storage decision

### 2.1 Problem (verified)

`computeResultFingerprint` (`src/server/customer-commerce/measurement/writers.ts`) hashes
**money / explanation presentation fields only**. For CART scope that is estimated subtotal,
delivery-charge line, savings/progress/coarse shape/reason class/complimentary projection —
**not** `TOTAL_PAYABLE` (CHECKOUT-only), and **not** fulfilment mode, timing, outlet, or
location. Same-money CART quotes under different fulfilment contexts therefore collide on
`result_fingerprint` and reuse the latest CART evaluation by design of IMP-036J result identity.

AS-32 / AS-46 add a **new provenance requirement**: equal-money, different mode/timing/outlet
contexts must not silently share a CART `evaluation_id`. That is insufficient fingerprint coverage
for the new requirement — not a claim that today’s fingerprint semantics are defective for their
original Offer-result identity purpose.

`expected_components` remains the explanation wire for presentation integrity — **not** the home
for fulfilment-context provenance.

### 2.2 Proposed storage mechanism (Architecture Lock candidate)

```text
PROVENANCE_STORAGE_DECISION = ADDITIVE_NULLABLE_CONTEXT_FIELDS_PLUS_SERVER_CONTEXT_DIGEST
REJECTED_ALTERNATIVES = SIBLING_TABLE | EXPECTED_COMPONENTS_JSON_AS_SOLE_PROVENANCE | COORDINATE_PLAIN_SHA256_AS_PROVENANCE
RESULT_FINGERPRINT_SEMANTICS = PRESERVED_UNCHANGED
CHECKOUT_MEASUREMENT_SEMANTICS = PRESERVED_UNCHANGED
CART_DIGEST_IN_REUSE_COMPARATOR = YES
CHECKOUT_DIGEST_IN_REUSE_COMPARATOR = NO
SCHEMA_MUTATION_THIS_DELIVERY = NO
```

**Additive nullable columns** on existing `app.commercial_evaluations` (future authorized
migration only — **not** performed by this proposal):

| Column (proposed name) | Type | Nullability | Semantics |
|---|---|---|---|
| `evaluated_fulfilment_mode` | text | NULL | `DELIVERY` \| `PICKUP` when mode was supplied into the quote; NULL when absent |
| `evaluated_fulfilment_timing` | text | NULL | `ASAP` only when Now timing was **supplied into and evaluated on** a new CART quote; NULL when omitted (Schedule UNCONFIRMED / timing absent). V1 never persists `SCHEDULED` on new CART-scope rows from pre-checkout browse intent (see §3.2). `SCHEDULED` remains Checkout/Snapshot authority under reuse |
| `evaluated_pickup_outlet_id` | uuid | NULL | Customer-selected Takeaway outlet when `PICKUP` + outlet known; NULL otherwise |
| `evaluated_priced_outlet_id` | uuid | NULL | Server outlet actually used for pricing (`buildDirectPricingQuote` / eligibility-resolved outlet) for DELIVERY or PICKUP; NULL when no outlet priced the quote. **Primary Delivery provenance identity in V1** |
| `evaluated_delivery_location_hmac` | bytea | NULL | **Reserved optional nullable** column for a future server-keyed HMAC of canonicalised Delivery coordinates. **V1 disposition: disabled** — never populated for V1 CART evaluations; see §2.3 |
| `evaluation_context_digest` | bytea | NULL **only on pre-migration rows** | Server-authored SHA-256 (32 octets) of the canonical evaluated context (below) |

**Constraints (proposed, future migration):**

- Check: `evaluation_context_digest is null or octet_length(evaluation_context_digest) = 32`
- Check: mode/timing values restricted to known enums when non-null
- Check: `evaluated_pickup_outlet_id IS NULL OR evaluated_fulfilment_mode = 'PICKUP'`
- Check: `evaluated_delivery_location_hmac IS NULL OR evaluated_fulfilment_mode IS DISTINCT FROM 'PICKUP'`
- Check: HMAC column null or `octet_length = 32`
- **Application invariant (not a DB NOT NULL):** every **post-migration CART persist** writes a
  non-null `evaluation_context_digest` (null fields allowed **inside** the canonical JSON). NULL
  digest is reserved for pre-migration rows only. Legacy location-only (mode-absent) requests still
  digest with `fulfilment_mode: null` and populate `priced_outlet_id` when applied. V1 always
  digests `delivery_location_hmac: null` (HMAC disabled — §2.3).
- **No rename** of `result_fingerprint`, `expected_components`, or other accepted IMP-036J columns (D6)
- **No sibling table** — unnecessary indirection for a 1:1 CART provenance extension
- **Do not** stuff provenance solely into `expected_components` JSON
- **Do not** store plain SHA-256 of exact coordinates (re-identifiable). V1 uses
  `evaluated_priced_outlet_id` only; keyed HMAC remains reserved and unpopulated

### 2.3 Server-authored context digest (canonical input)

Distinct from:

- `result_fingerprint` (money / explanation presentation)
- Client evaluate **request context key** (includes `cartRevision` + request generation for stale discard)
- Working-tree / governance fingerprints

```text
evaluation_context_digest = SHA-256(canonicalJson({
  surface_scope: "CART",
  fulfilment_mode,                  // null | DELIVERY | PICKUP  (as evaluated)
  fulfilment_timing,                // null | ASAP   (V1 new CART quotes; never client-claimed SCHEDULED)
  pickup_outlet_id,                 // null | uuid (customer-selected PICKUP)
  priced_outlet_id,                 // null | uuid (server outlet that priced the quote)
  delivery_location_hmac            // V1: always null (reserved field; HMAC disabled)
}))
```

**Excluded from digest (deliberate):**

- `cart_id` — already the row scope; redundant
- `cart_revision` — belongs in the **client request context key** for stale discard only. Including
  it would mint new CART `evaluation_id`s on non-money revision bumps and inflate Offer-result-view
  cardinality contrary to IMP-036J measurement “ordinal does not come from `carts.revision`”
- Client request **generation** — discard key only
- Tab-local Schedule UNCONFIRMED / browsing-context keys — stale-response discard only; **not**
  commercial-evaluation provenance or promotion authority

**Delivery location HMAC — V1 disposition: DISABLED**

```text
V1_DELIVERY_LOCATION_HMAC = DISABLED
V1_PRIMARY_DELIVERY_PROVENANCE = evaluated_priced_outlet_id
V1_DIGEST_DELIVERY_LOCATION_HMAC = null
COORDINATE_HASHING_AUTHORIZED_BY_THIS_PROPOSAL = NO
```

- Column `evaluated_delivery_location_hmac` remains in the proposed additive schema as an optional
  nullable reserved field, but **is not populated** for V1 CART evaluations.
- V1 canonical `evaluation_context_digest` **always** includes `delivery_location_hmac: null`.
- This documentation task authorizes **no** coordinate hashing, HMAC calculation, new secret
  processing, or location-derived provenance persistence.
- Client stale-response context keys may still distinguish location changes for discard UX; those
  keys are **not** commercial-evaluation provenance or financial authority.
- **Bounded V1 limitation:** same-priced-outlet coordinate changes that yield equal-money results
  may reuse CART `evaluation_id` (digest unchanged because HMAC is null and `priced_outlet_id`
  matches). Do **not** claim distinct CART evaluations for every coordinate movement in V1.
- If future requirements demand coordinate-level evaluation identity, require a **separate**
  architecture/privacy decision covering canonicalization precision, keyed hashing, retention,
  key management, rollout, and measurement implications. Until then, do not activate HMAC.

**Requested browsing-context key vs effective commercial-evaluation timing (V1):**

| Layer | May represent Schedule UNCONFIRMED / `SCHEDULED` intent? | Promotion / money authority? |
|---|---|---|
| Contract A eligibility timing input | Yes — `SCHEDULED` = capability-discovery intent | No |
| Tab-local order-context browse intent | Yes — Schedule UNCONFIRMED presentation | No |
| Client CART evaluate **request context key** | May distinguish Schedule intent for stale-response rejection | No |
| New CART quote **evaluated** `fulfilmentTiming` | **No** client-claimed `SCHEDULED`; omit timing while UNCONFIRMED; `ASAP` only when Now is explicit | Yes — feeds promotions + digest |
| Authenticated open Checkout reuse response | May convey server-authoritative Checkout `SCHEDULED` (+ window) | Yes — Snapshot/CHECKOUT authority; not client CART timing |

Rules:

1. Digest is **server-authored** from the context actually applied to the quote — never trusted
   from the client body. Contract A/B request bodies remain **strict allowlists**; money,
   fingerprint, digest, `evaluationId`, `checkoutId`, or sealed-window fields are **rejected (400)**,
   not ignored.
2. Open-Checkout **reuse** responses do **not** write a new CART row with browse intent; CHECKOUT
   / Snapshot provenance remains authoritative (`evaluation_id` reuse path unchanged).
3. **`evaluation_context_digest` participates in the reuse decision only when
   `surface_scope = 'CART'`.** CHECKOUT reuse, `reusedExistingEvaluation`,
   `COMMERCIAL_STATE_CHANGE` journey-fact idempotency, and `cart_origin_ordinal_inclusive`
   watermarks remain **fingerprint-only** even if CHECKOUT context columns are later populated for
   symmetry.
4. CHECKOUT-scope rows may leave context columns NULL in V1 (sealed Checkout + Snapshot already own
   mode/timing/outlet).
5. Pre-migration CART rows: context columns and digest remain NULL; null-digest reuse only among
   null-digest peers. Post-migration CART persists always write a digest.

### 2.4 Reuse / occurrence semantics (preserve measurement)

| Case | Required behaviour |
|---|---|
| New CART quote (post-migration) | Persist context fields + non-null `evaluation_context_digest`; compute `result_fingerprint` **unchanged** |
| Latest CART row match | Under cart lock: compare against **latest** CART row by `occurrence_ordinal`. Reuse `evaluation_id` iff `result_fingerprint` **and** `evaluation_context_digest` both byte-identical. Null digest matches only null digest |
| Same money, different context | Same `result_fingerprint` possible; **different** digest → **new** occurrence / `evaluation_id` |
| Same context, same money | Reuse existing evaluation (latest-row fingerprint+digest match) |
| Context sequence A→B→A | Yields a **new** occurrence for the second A (consistent with IMP-036J after intervening B); growth bounded by §4.1 debounce/rate limits |
| CHECKOUT evaluate / journey facts | Digest **not** in reuse comparator; fingerprint-only reuse and `COMMERCIAL_STATE_CHANGE` semantics unchanged |
| CART unique index `(cart_id, result_fingerprint, occurrence_ordinal)` | Preserved |
| Open Snapshot reuse from `evaluateCart` | Return CHECKOUT `evaluation_id`; do not insert CART provenance; do not overwrite CHECKOUT provenance |
| CART counted-view cardinality | May **increase** when context differs at equal money (separate `evaluation_id`s). CHECKOUT Offer-result / journey measurement unchanged. Measurement finalization (`09-…`) must reconcile |

### 2.5 Scenario validation matrix (design tests — no implementation)

| Scenario | Expected provenance outcome |
|---|---|
| Same price, different fulfilment mode | Distinct digest; new CART evaluation even if `result_fingerprint` collides |
| Same price, Schedule UNCONFIRMED (timing omitted) vs later explicit `ASAP` | Distinct digest (null timing vs `ASAP`); provisional Offer rules unchanged; V1 does **not** mint evaluated CART `SCHEDULED` from browse intent |
| Client supplies `fulfilmentTiming=SCHEDULED` on CART evaluate | **V1 unsupported** → **400** (strict allowlist / timing enum). Must not silently qualify SCHEDULED-only promotions |
| Same price, different Takeaway outlet | Distinct digest (`pickup_outlet_id` / `priced_outlet_id`); new evaluation |
| Same price, different Delivery priced outlet (same or different coords) | Distinct digest via `priced_outlet_id`; new evaluation |
| Same price, same priced outlet, coordinate-only change (V1) | **Reuse** CART evaluation when money+digest match — bounded V1 limitation (`delivery_location_hmac: null`). Distinct per-coordinate CART identity is **future / non-V1** pending separate privacy decision |
| Same price, `ASAP` vs evaluated CART `SCHEDULED` digest comparison | **Future / non-V1 illustration only** — V1 does not create new CART-scope evaluations with evaluated `SCHEDULED` from pre-checkout intent. CHECKOUT may still carry sealed `SCHEDULED` under reuse |
| Existing commercial evaluation records (null context) | Remain valid; no rewrite migration; null-digest reuse only among null-digest peers |
| Reused Checkout Snapshot (open non-terminal Checkout) | No new CART provenance from browse; CHECKOUT/`evaluation_id` reuse; effective Checkout mode/**timing** conveyed separately (may be server-authoritative `SCHEDULED`); **customer-only** reuse (`guest` → advisory quote only) |
| CHECKOUT fulfilment change at equal money | Fingerprint-only reuse; digest must **not** force a new CHECKOUT evaluation / false `COMMERCIAL_STATE_CHANGE` |
| Concurrent evaluation requests (same cart, different contexts) | Cart lock serialises persists; latest-row `(fingerprint, digest)` compare; client drops stale **request** keys via generation; UI never shows two competing payables |
| Concurrent identical context | Fingerprint+digest reuse → single logical evaluation |
| Missing CHECKOUT evaluation / undecodable wire / reuse probe throw + active Snapshot | Fail-closed distinct status (`EVALUATION_INDETERMINATE` class) — **not** the same `null` as “no Snapshot / may fall through to advisory” |
| DRAFT without active Snapshot | May fall through to advisory CART quote (fail-closed applies only when an active Snapshot exists) |
| Advisory race: Snapshot appears between reuse probe and CART persist | Accepted advisory-only race; payable authority remains Snapshot/prepare/pay; next evaluate reuses |

### 2.6 Explicit non-goals for provenance

- No backfill rewrite of historical `result_fingerprint` values
- No change to CHECKOUT journey fact schemas / fingerprint-only CHECKOUT reuse in this lock proposal
- No client-supplied digest, fingerprint, money, or `evaluationId` accepted — **reject (400)**
- No migration or application implementation in this documentation delivery

---

## 3. Technical contract boundaries (lock-ready)

Exact HTTP path strings remain an implementation detail within these semantics. Boundaries below
are the proposed Architecture Lock surface for variant
`PRECHECKOUT_ELIGIBILITY_WEB_FIRST_V1`.

### 3.1 Contract A — Pre-checkout Takeaway eligibility (read-only)

| Boundary | Lock |
|---|---|
| Authority | Compose ASAP accepting-now + scheduled-pickup profile foundations |
| AuthN / identity | Existing **cart credential** (guest token and/or customer session) as used for cart reads; `brandId` required |
| Non-empty outlets | Returned **only** when a cart credential resolves to an active cart with lines. No credential / unresolvable → `cartState=NO_CART`, `outlets=[]`, IP-limited |
| Brand mismatch | `brandId` ≠ cart brand → denied (generic problem code; no cross-brand outlet dump) |
| Must not require | `checkoutId`; fabricating Checkout to call ownership-exact pickup-options / scheduled-windows |
| Timing input | `ASAP` \| `SCHEDULED` (Now vs Schedule-capable); selectionPolicy **per timing intent** |
| Empty / no cart | Distinct `cartState` `NO_CART` \| `EMPTY_CART`; `outlets=[]`; **not** brand `UNAVAILABLE` |
| Outputs | Customer-safe outlets + capability flags only; no hierarchy/legal dump; no lead-time/capacity/profile internals |
| Mutates | **Nothing** (no cart lines, no Checkout bind, no Snapshot, no payment) |
| Menu slots | **Forbidden** |
| Body allowlist | Strict; unknown keys **400** |

### 3.2 Contract B — Mode-sensitive Cart evaluate (advisory)

| Boundary | Lock |
|---|---|
| Surface | Existing `POST /api/v1/cart/evaluate` (or same `evaluateCart` entry) |
| Authority | Existing commercial engine only — extended input + precedence |
| Body allowlist | Strict allowlist only (`brandId`, `location`, `fulfilmentMode`, `pickupOutletId`, `fulfilmentTiming`, request-key/generation fields). Money / fingerprint / digest / `evaluationId` / `checkoutId` / sealed-window fields → **400** |
| `fulfilmentTiming` on CART evaluate (V1) | **`ASAP` only** when Now is explicitly requested. **Omit** the field for Schedule UNCONFIRMED / timing-absent quotes. Client-supplied `fulfilmentTiming=SCHEDULED` is **unsupported** → **400** (must not silently qualify SCHEDULED-only promotions). Contract A may still accept `SCHEDULED` as **capability-discovery intent** — that is not CART promotion authority |
| Takeaway without Delivery address | Required; must not invent delivery fee/execution |
| PICKUP outlet re-assertion | Server re-asserts supplied `pickupOutletId` belongs to `cart.brandId` **before** quoting. When evaluated/request `fulfilmentTiming=ASAP`: accepting-now gate. When `fulfilmentTiming` is **omitted** (Schedule UNCONFIRMED / timing-absent): composed Contract A gate — outlet must be accepting-now **or** schedule-capable (so a Schedule-selected place can still quote) **without** evaluating promotions as `SCHEDULED`. Failure → same generic non-money problem class for nonexistent, cross-brand, and ineligible ids (no existence oracle) |
| PICKUP without outlet | After reuse attempt fails: non-money `REQUIRES_FULFILMENT_CONTEXT` (or equivalent); never brand-level guess quote |
| Schedule UNCONFIRMED promotions | Unconfirmed Schedule intent **must not** become evaluated `fulfilmentTiming=SCHEDULED` on a new CART quote. Client **omits** `fulfilmentTiming`; timing-restricted Offers stay `FULFILMENT_CONTEXT_REQUIRED`. Mode-restricted promotions continue to use server-evaluated mode context. Provisional “may change when you confirm your time” messaging only — never a locked SCHEDULED-only discount at Menu |
| Open Checkout reuse | Attempt **before** any browse-mode/outlet-dependent serviceability, availability, or pricing computation — including the Delivery-location early return. Reuse wins; convey effective Checkout mode **and timing when material** (may be server-authoritative `SCHEDULED` from Snapshot — **not** client-authorized CART timing). **Guest access: no reuse path; advisory quote only** |
| Reused PICKUP projection | Must not present a Delivery charge line (Snapshot charges only) |
| Missing CHECKOUT evaluation + active Snapshot | Fail-closed distinct status; no divergent browse money (triggers: no CHECKOUT evaluation row; undecodable explanation wire; reuse probe throw) |
| DRAFT without Snapshot | May fall through to advisory CART quote |
| Provenance | §2 fields + digest on new CART persists (`delivery_location_hmac: null` in V1); CHECKOUT reuse retains Snapshot provenance; CHECKOUT scheduled timing / window validation / payment authority unchanged |
| Client request context key | `cartRevision` + requested mode + **browsing** timing key + outlet\|delivery key + **generation** — stale-response **discard** key only; ≠ `result_fingerprint`; ≠ `evaluation_context_digest`; must not mint evaluated CART `SCHEDULED` |
| PAYMENT_PENDING reuse | Read-only; writes **zero** Checkout mutations and **zero** new CART provenance rows when reuse hits |
| Sealing | Evaluate remains non-sealing; pay requires Checkout prepare + Snapshot |

### 3.3 Contract C — Scheduled Takeaway Checkout sequencing

| Boundary | Lock |
|---|---|
| Journey | Mode → timing-aware list → confirm outlet → `setCheckoutFulfilment` **without** evaluate → `listCheckoutScheduledWindows` → set SCHEDULED+window → `evaluateCheckout` → prepare → pay |
| Forbidden sequence | Mode → accepting-now-only list → bind → `evaluateCheckout`(ASAP) → Timing |
| Listing intent | Request input for listing only — do **not** write `SCHEDULED`+null window solely to unlock list |
| Windows | Server-listed only; seal at evaluate; revalidate at prepare/pay |
| Lifecycle | **No** new Order/Checkout lifecycle states |
| Remediation vehicle | UOE-DR-06 separately scoped corrective preferred; **NOT_AUTHORIZED** by UOE package |

### 3.4 Contract D — Presentation + channels

| Boundary | Lock |
|---|---|
| Geo authority | `boba.delivery-context.v1` only for confirmed coordinates |
| Browse coordinator | `boba.order-context.v1` tab-scoped `sessionStorage`; stores **no money, payable, or sealed window**; no cross-tab money/seal sync. Duplicated-tab `sessionStorage` inheritance covered by revalidate-on-focus / server truth |
| WhatsApp | Optional / noop-safe; same-meaning when sending configured (§5) |
| PAYMENT_PENDING | Existing freezes preserved; browse must not mutate pending Checkout |

### 3.5 Authorized request identity (summary)

| API class | Authorized identity | Forbidden |
|---|---|---|
| Pre-checkout eligibility | Cart credential + brand; non-empty outlets only with resolvable lined cart | Fabricated `checkoutId`; cross-cart / cross-brand reads |
| Cart evaluate | Cart credential (existing); strict body allowlist | Paying from evaluate; mutating Checkout; client money/digest authority |
| Checkout pickup-options / windows / fulfilment / evaluate / prepare | Ownership-exact Checkout actor | Guest fabrication of Checkout; BOLA weaken |
| Scheduled windows | Eligible Checkout only | Menu / pre-checkout exact slots |

---

## 4. Abuse limits, performance budgets, privacy, negative security tests

Candidate controls for Architecture Lock / Quality finalization. **Not implemented** by this
delivery. Numbers are lock-proposal defaults; Founder / platform ops may tighten without changing
product entitlement.

### 4.1 Abuse limits (new pre-checkout reads + intensified evaluate)

| Control | Candidate default | Notes |
|---|---|---|
| Client debounce (eligibility + evaluate) | ≥ 300 ms after intent change; coalesce in-flight | Drop stale by request context key + generation; bounds A→B→A row growth |
| Eligibility rate limit | 30 req / cart identity / rolling 60 s; 120 / IP / rolling 60 s | 429 + retry-after |
| Cart evaluate rate limit | 60 req / cart identity / rolling 60 s; 180 / IP / rolling 60 s | — |
| Cart-identity key material | Authenticated: customer id. Guest: **HMAC of guest token** (existing verifier/HMAC pattern) — **never raw token** in limiter maps or logs | Bounded store (LRU / windowed sweep); per-process semantics acknowledged (no new Redis service) |
| IP key | Derive from IMP-038 verified proxy path (`TRUST_PROXY_HOPS` discipline) | Not arbitrary `X-Forwarded-For` trust |
| Burst / challenge | Optional step-up after repeated 429 in 10 m (reuse platform challenge patterns; do not invent new auth product) | Fail closed to calm retry UX |
| Outlet enumeration | Response capped to eligibility-composed set; no “nearest unused” dump; no internal ranking secrets | Customer-safe fields only |
| Error bodies | No stack, no other customers’ carts, no hierarchy/legal entities | One **generic** problem code for not-found / cross-brand / ineligible outlet |

**Founder-visible residual:** per-process in-memory limits mean effective ceiling ≈ N× stated value behind multiple instances.

### 4.2 Performance budgets (advisory UX)

| Surface | Candidate budget | Failure behaviour |
|---|---|---|
| Eligibility read p95 | ≤ 300 ms server-side (excludes network) at nominal load | Calm retry; do not invent outlets |
| Cart evaluate p95 (advisory path) | ≤ 500 ms server-side at nominal load | Hide stale money; retry; never keep old-key quote |
| Cart evaluate with open-Checkout reuse | ≤ 400 ms server-side when reuse hit | Prefer reuse path cost over full recompute |
| UI money paint | Only after matching request context key returns | Generation mismatch → drop |
| Checkout scheduled windows | Unchanged accepted IMP-036I budgets | Empty → honest recovery |

Budgets are **quality targets**, not entitlements. Breach → degrade gracefully; never weaken
Snapshot / payment safeguards to “go faster.”

### 4.3 Privacy treatment

| Data | Treatment |
|---|---|
| Outlet projection | Public customer-safe: display name, coarse public location label, capability flags, outlet id needed for selection |
| Forbidden in eligibility | Workforce hierarchy, legal entity graph, internal ops notes, other customers’ orders, lead-time/capacity/profile internals, raw geo of unrelated outlets beyond eligible set |
| Delivery coordinates | Remain in delivery-context / Checkout destination authority. V1 measurement uses **priced outlet only** (`delivery_location_hmac` always null). No plain coordinate hashes; never echo HMAC/digest to client. Activating coordinate HMAC later needs a separate privacy decision |
| Cart / guest tokens | Existing cart credential secrecy; limiter keys hash guest tokens; eligibility never becomes an unauthenticated brand-wide outlet dump with non-empty outlets |
| Measurement | `evaluation_context_digest`, mode/outlet ids are server provenance — not customer-explained abuse detail; not emitted in client responses or logs. Reserved `evaluated_delivery_location_hmac` stays null in V1 and must never appear in client responses or logs if later activated |
| WhatsApp variables | Existing `validateTemplateVariables` secret-shaped rejection unchanged |

### 4.4 Negative security tests (mandatory for future authorized implementation)

1. Unauthenticated / wrong-cart credential cannot read another cart’s eligibility or evaluate
2. No credential / unresolvable credential → `NO_CART`, `outlets=[]` (never a non-empty outlet set)
3. Fabricated `checkoutId` cannot drive pre-checkout eligibility
4. `brandId` ≠ cart brand denied; cross-brand `pickupOutletId` denied with the **same** generic problem code as ineligible / nonexistent (no existence oracle)
5. Client-supplied outlet id not in server eligibility set cannot produce a successful Takeaway quote
6. Server re-asserts `pickupOutletId` brand + timing eligibility before quoting
7. Client-supplied money / fingerprint / context digest / `evaluationId` / sealed-window fields → **400** under strict allowlist (never read)
8. Browse intent cannot call Checkout fulfilment / destination / timing mutations under `PAYMENT_PENDING`
9. PAYMENT_PENDING reuse path writes zero Checkout rows and zero new CART provenance rows
10. Missing CHECKOUT evaluation / undecodable wire / probe throw + active Snapshot never falls through to divergent browse payable
11. Guest actor never receives reused Checkout Snapshot money
12. Rate-limit returns 429 without leaking outlet inventories; limiter store never persists/logs raw guest tokens
13. Error responses omit internal identifiers beyond safe problem codes
14. Concurrent different-context evaluates cannot present two competing payables in one UI generation
15. Cross-tab / duplicated-tab `sessionStorage` cannot treat presentation mirrors as sealed Snapshot money
16. WhatsApp noop: `NOT_SENT` must not map to send success **or** to a customer-facing product failure; DR-04 must not pass by treating noop as “sent”
17. `evaluation_context_digest` and `evaluated_delivery_location_hmac` never appear in client responses or logs
18. Eligibility schedule-capable responses expose capability flags only — no profile internals
19. CHECKOUT reuse comparator remains fingerprint-only (digest must not alter `COMMERCIAL_STATE_CHANGE`)
20. Client-supplied `fulfilmentTiming=SCHEDULED` on CART evaluate → **400**; must not apply SCHEDULED-only promotions from browse intent
21. V1 CART persists leave `evaluated_delivery_location_hmac` null and digest `delivery_location_hmac: null` (no coordinate HMAC computation)

---

## 5. WhatsApp Meta template compatibility (assigned — no invented templates)

```text
WHATSAPP_META_TEMPLATE_DECISION = ASSIGNED_CONTENT_QA_AND_DESIGN_READINESS
INVENT_APPROVED_TEMPLATES = NO
WHATSAPP_OPTIONAL_NOOP_SAFE = YES
DR04_SAME_MEANING_WHEN_SENDING_CONFIGURED = YES
```

### 5.1 Verified platform facts

- Registry: WhatsApp adapter may be noop (`options.whatsapp ?? noop`); not claimed active in every environment
- Platform wording authority: `src/shared/notifications/customer-visible-content.ts` currently uses
  **“Pickup”** in PICKUP summaries (in-app / content path)
- Meta: template **body** text is fixed at creation; **variables** are placeholders substituted at
  send time; only **APPROVED** templates may be sent; editing body text requires Meta review
- Platform already forbids inventing Meta template ids in discovery; sendable status must be
  `APPROVED` (`NOTIFICATION_SENDABLE_TEMPLATE_STATUS`)

### 5.2 Compatibility rules (Architecture Lock assignment)

| Case | Required action | Owner |
|---|---|---|
| DR-04 label change (“Pickup” → “Takeaway” primary meaning) appears only in **platform** `customer-visible-content` / in-app | May update platform wording under authorized implementation; independent of Meta body | Implementation tranche + Content QA |
| Same-meaning change requires altering Meta template **BODY** fixed text | **Do not invent** a template in this package. Inventory existing APPROVED templates; submit / edit via Meta Business workflows; ship WhatsApp send path only when replacement template is APPROVED | Content QA + Notification ops (Design Readiness exit) |
| Fulfilment label already supplied as a Meta **variable** | Prefer variable-value update at send time within `validateTemplateVariables` + declared schema; still verify APPROVED template + category constraints | Content QA + Notification ops |
| Environment with noop WhatsApp | DR-04 **satisfied** for that environment by in-app consistency; WhatsApp send not required | Quality plan AS-28 |
| Email / SMS / push | Remain out of V1 while non-sending | — |

### 5.3 Explicit non-claims

- This proposal does **not** list, mint, or approve Meta template names/ids
- This proposal does **not** claim WhatsApp is configured in staging/production
- Architecture Lock may proceed on the **assignment** above; Design Readiness / Content QA must
  close the inventory before WhatsApp-sending environments claim DR-04 complete on-wire

---

## 6. Contract lock readiness checklist

| Item | Status |
|---|---|
| Variant selection | READY — `PRECHECKOUT_ELIGIBILITY_WEB_FIRST_V1` |
| Provenance storage mechanism | READY FOR FOUNDER LOCK — §2 (post-review fixes) |
| Contracts A/B/C/D semantic bounds | READY FOR FOUNDER LOCK — §3 |
| Abuse / perf / privacy / negative tests | READY FOR FOUNDER LOCK — §4 (candidate numbers; per-process residual) |
| WhatsApp Meta compatibility | ASSIGNED — §5 (no invented templates) |
| Exact HTTP path strings | DEFERRED TO IMPLEMENTATION (within §3) |
| UOE-DR-01 IMP identity | DEFERRED — blocks implementation auth, not Fit recommendation |
| UOE-DR-06 Checkout corrective | ACCEPTED defect; remediation NOT_AUTHORIZED here |
| Formal Fit PASS | **NOT_GRANTED** — Founder / independent Fit authority |
| Architecture Lock | **NO** until Founder grants |
| Design Readiness / implementation | **NOT** authorized |

```text
CONTRACT_LOCK_READINESS = READY_FOR_FOUNDER_ARCHITECTURE_LOCK_DECISION
```

---

## 7. Independent review evidence

| Review | Agent id | Verdict | Material fixes applied in this revision |
|---|---|---|---|
| Architecture | [`8a05654d-23bf-423a-b63a-bba025b63f3f`](8a05654d-23bf-423a-b63a-bba025b63f3f) | APPROVE_WITH_DOC_FIXES | Removed `cart_revision`/`cart_id` from digest; post-migration digest always written; priced outlet + keyed HMAC; cardinality disclosure; CHECK wording; reuse/A→B→A; guest reuse; Fit-recommended wording in `06-…` |
| Security | [`b6c13c64-b4af-44b8-879f-5ba7fc60015f`](b6c13c64-b4af-44b8-879f-5ba7fc60015f) | APPROVE_WITH_DOC_FIXES | Reject≠ignore allowlist; keyed HMAC; rate-limit key hashing/bounded store; outlet re-assertion; binary credential rule; expanded §4.4; residual risks recorded |
| Financial Integrity | [`6c0c9948-4755-4e6e-8002-e4fc5456cb2b`](6c0c9948-4755-4e6e-8002-e4fc5456cb2b) | APPROVE_WITH_DOC_FIXES | CART-only digest in reuse comparator; CHECKOUT fingerprint-only; priced outlet provenance; CART fingerprint scope wording; fail-closed distinct return; PICKUP delivery-line rule |

Reviews are **documentation validation**. They do **not** grant Fit PASS or Architecture Lock.

### Founder-visible residual risks (from Security review)

1. Rate limits are per-process in-memory (N× under multiple instances); no Redis proposed
2. V1 Delivery provenance is priced-outlet only; same-outlet coordinate drift at equal money may reuse CART `evaluation_id` (HMAC disabled). Future coordinate-level identity needs a separate architecture/privacy decision before activating reserved HMAC
3. Advisory quote surface widens; UI provisional copy is the control until Checkout revalidates
4. Per-outlet merchandise availability is observable through eligibility (accepted residual)
5. Guest Snapshot-reuse exclusion must be revisited if guest checkouts are later authorized
6. WhatsApp DR-04 on-wire parity deferred to Content QA / Design Readiness
7. UOE-DR-06 Checkout composition defect remains in production code and is not remediated here

---

## 8. Remaining Founder decisions (explicit)

1. **Architecture Fit PASS** — accept or reject recommendation `PRECHECKOUT_ELIGIBILITY_WEB_FIRST_V1`
2. **Architecture Lock** — lock §2 provenance decision + §3 contract bounds + §4 controls + §5 WhatsApp assignment (or return findings)
3. **UOE-DR-01** — future IMP identity / sequencing (still DEFERRED; required before implementation authorization)
4. **UOE-DR-06 remediation vehicle** — separately scoped corrective timing/identity (not authorized here)
5. **Design Readiness / Quality / Measurement finalization** — after Fit PASS + Lock (includes Offer-result cardinality reconciliation and WhatsApp Meta inventory)
6. **Implementation authorization / merge / deploy** — not authorized by this proposal
7. **Accept per-process rate-limit residual** (or require a later shared-limiter decision — out of this proposal’s service non-goal)

```text
STOP_BEFORE = FIT_PASS | ARCHITECTURE_LOCK | DESIGN_READINESS | IMPLEMENTATION | MERGE | DEPLOY
```
