<!--
  AUTHORITY: NON_AUTHORITATIVE_DISCOVERY_DRAFT
  PACKAGE: UOE-CANDIDATE-3
  ID: UOE-CONSOLIDATED-DESIGN-QT-MI-DECISION-1
  APPLICATION_CODE_MUTATION: NO
  CANONICAL_LIFECYCLE_MUTATION: NO
  IMPLEMENTATION_AUTHORIZED: NO
  DESIGN_READINESS_PASS: PASS
  QUALITY_PLAN_FINALIZATION: FINALIZED
  MEASUREMENT_PLAN_FINALIZATION: FINALIZED
  FOUNDER_VERDICT: GRANT_WITH_EXCLUSIONS
  FOUNDER_RECORD: 23-founder-b5-uoe-dr-qt-mi-planning-gate-record.md
  OPERATIVE_GRANT_TEXT: §1.1 UNCHANGED
  UOE_DR_06_REMEDIATION: NOT_AUTHORIZED
  WHATSAPP_META_ON_WIRE: NOT_APPROVED
  TESTS_EXECUTED: NONE
-->

# Consolidated Design Readiness / Quality / Measurement decision

```text
PACKAGE_ID = UOE-CONSOLIDATED-DESIGN-QT-MI-DECISION-1
PACKAGE = UOE-CANDIDATE-3
WAVE = BOBA-PRODUCT-GTM-CLOSURE-20261024
TASK = ISSUE-435 AGENT-D
PR = https://github.com/nivedhya11/BobaBear/pull/424
STARTED_FROM_HEAD = b10ec9b4cf4b8533b56d9d7f2c6e635f8e545bfb
AUTHORITY = NON_AUTHORITATIVE_DISCOVERY_DRAFT
PRESERVE = PD-UOE-CANDIDATE-3 PASS | XD-UOE-CANDIDATE-3 PASS | ARCHITECTURE FIT PASS | ARCH-UOE-LOCK-PROPOSAL-1 LOCKED
REOPEN_PRODUCT_EXPERIENCE_ARCHITECTURE_GATES = FORBIDDEN
DESIGN_READINESS_PASS = PASS
QUALITY_PLAN_FINALIZATION = FINALIZED
MEASUREMENT_PLAN_FINALIZATION = FINALIZED
CONSOLIDATED_GATE_RESULT = GRANT_WITH_EXCLUSIONS
FOUNDER_RECORD = 23-founder-b5-uoe-dr-qt-mi-planning-gate-record.md
FOUNDER_ACT = proceed
FOUNDER_ACT_DATE = 2026-10-25
OPERATIVE_TEXT = §1.1
OPERATIVE_TEXT_UNCHANGED = YES
AGENT_ALIGNMENT_GATE = PASS_FOR_DOCS_ONLY
AGENT_ALIGNMENT_IS_DESIGN_QT_MI_PASS = NO
IMPLEMENTATION = NONE
IMPLEMENTATION_AUTHORIZED = NO
FORMAL_IMP_IDENTITY = NOT_ALLOCATED
UOE_DR06_CHECKOUT_REMEDIATION = NOT_AUTHORIZED
TESTS_EXECUTED_UNDER_THIS_PACKAGE = NONE
INDEPENDENT_REVIEW = NOT_PERFORMED
```

This is the single Founder decision for Design Readiness, TEST-1 Quality plan finalization, and
Measurement plan finalization. It records what source evidence already closed, what remains
unknown, and which proofs are still plans. Founder "proceed" on 2026-10-25 is recorded in
[`23-founder-b5-uoe-dr-qt-mi-planning-gate-record.md`](./23-founder-b5-uoe-dr-qt-mi-planning-gate-record.md)
as `GRANT_WITH_EXCLUSIONS`. §1.1 is the operative grant text and is unchanged. The grant does not
authorize UOE implementation, authorize the UOE-DR-06 Checkout corrective, allocate an IMP, execute
tests, select a telemetry vendor, select a retention duration, approve a WhatsApp body, or
authorize analytics collection or storage.

Source ledgers stay in force:

| Record | Role |
|---|---|
| [`14-design-qt-mi-owner-decision-package.md`](./14-design-qt-mi-owner-decision-package.md) | String ledger, Meta registry, quality rollup, measurement proposal, DR-06 proposal |
| [`15-founder-decision-record-and-gate-readiness-package.md`](./15-founder-decision-record-and-gate-readiness-package.md) | W2 working-baseline record (issue #432) |
| [`07-design-readiness-candidate.md`](./07-design-readiness-candidate.md) | Interaction specification (`DR-UOE-CANDIDATE-3`) |
| [`08-quality-test-plan-candidate.md`](./08-quality-test-plan-candidate.md) | TEST-1 matrix (`QT-UOE-CANDIDATE-3`) |
| [`09-measurement-instrumentation-candidate.md`](./09-measurement-instrumentation-candidate.md) | Measurement candidate (`MI-UOE-CANDIDATE-3`) |
| [`docs/platform/capabilities/UOE-unified-order-experience.md`](../../capabilities/UOE-unified-order-experience.md) | Binding architecture. Unchanged by this package |

Tranche plans: [`17-ux-a-tranche-contract.md`](./17-ux-a-tranche-contract.md),
[`18-ux-b-tranche-contract.md`](./18-ux-b-tranche-contract.md),
[`19-ux-c-tranche-contract.md`](./19-ux-c-tranche-contract.md).
UOE-DR-06 stays a separate package:
[`20-uoe-dr-06-test-first-work-package.md`](./20-uoe-dr-06-test-first-work-package.md)
(`NOT_AUTHORIZED`). Source classification against the #424 head is
[`21-design-qt-mi-evidence-delta.md`](./21-design-qt-mi-evidence-delta.md). The short decision
surface is [`22-founder-gate-review-packet.md`](./22-founder-gate-review-packet.md). Neither
document changes §1.1. The Founder grant is recorded in
[`23-founder-b5-uoe-dr-qt-mi-planning-gate-record.md`](./23-founder-b5-uoe-dr-qt-mi-planning-gate-record.md).

---

## 1. One decision for the Founder

```text
CONSOLIDATED_GATE_DECISION
decision_owner: HUMAN_FOUNDER
status: GRANT_WITH_EXCLUSIONS
recorded_in: 23-founder-b5-uoe-dr-qt-mi-planning-gate-record.md
founder_act: proceed
founder_act_date: 2026-10-25
agent_may_not_select: YES
agent_did_not_select: YES

question:
  Grant Design Readiness (DR-UOE-CANDIDATE-3), Quality plan finalization
  (QT-UOE-CANDIDATE-3), and Measurement plan finalization (MI-UOE-CANDIDATE-3)
  together, with the exclusions in §1.1, or withhold all three.

option_grant_with_exclusions:
  One human grant of the three PD-2 prerequisites listed above.
  The grant text is §1.1. It does not select a telemetry vendor, a retention
  duration, or a WhatsApp body. It does not execute tests. It does not
  authorize implementation or UOE-DR-06.

option_withhold:
  Withhold all three gates. Use this when any unknown in §4 must be known
  before Design, Quality, or Measurement may be treated as final.

cursor_recommendation:
  The unknowns are recorded, not filled. GRANT_WITH_EXCLUSIONS is available
  because W2 already approved the in-app baseline, roles, and denominator,
  and already excluded on-wire WhatsApp. WITHHOLD is available if the Founder
  requires vendor, retention, or Meta bodies before any of the three gates.
  This agent does not choose.

blocked_if_withhold:
  Design Readiness PASS, Quality plan finalization, Measurement plan
  finalization, and any later implementation authorization that depends on them.

work_continuing_as_plans_only:
  UX-A / UX-B / UX-C tranche contracts and the UOE-DR-06 work package.
  Those plans do not start application work.
```

A grant of §1.1 is still short of implementation. PD-2 implementation authorization also
requires an allocated IMP. UOE-DR-01 remains `FUTURE_IMP_ID = NOT_ALLOCATED` /
`SEQUENCING_DEFERRED`. `IMPLEMENTATION_AUTHORIZED` stays `NO` either way.

### 1.1 Grant text (operative; unchanged by the recorded grant)

```text
IF_GRANTED_MEANS
DESIGN_READINESS = PASS for DR-UOE-CANDIDATE-3 on the W2 primary in-app baseline
  (15-… §1; strings in 14-… §1.2) and the interaction spec in 07-…
QUALITY_PLAN = FINALIZED as the PLANNED TEST-1 matrix in 08-… (AS-01..AS-46,
  Contracts A–D, capability architecture §4.4 negatives 1–21, SEC-BOLA-CHECKOUT)
MEASUREMENT_PLAN = FINALIZED for ratified roles, checkout-start denominator,
  fingerprint-only CHECKOUT commercial-state events, and privacy bans in §3
WHATSAPP_ON_WIRE = EXCLUDED (bodies UNKNOWN; see §4.3)
TELEMETRY_VENDOR = UNKNOWN and not selected (see §4.1)
RETENTION_DURATIONS = UNKNOWN and not selected (see §4.2)
AS-34 = RED until UOE-DR-06 is separately authorized and proven
AS-41 = RED until UOE-DR-06 is separately authorized and proven
EXECUTED_TESTS = NONE
UOE_DR06_REMEDIATION = NOT_AUTHORIZED
IMPLEMENTATION_AUTHORIZED = NO
IMP_ALLOCATION = NO
```

```text
IF_GRANTED_DOES_NOT_MEAN
checkout composition already conforms to Contract C
any PLANNED row is EXECUTED
advisory quote tests prove payment preparation
Architecture Lock recording is behavioural proof
a conversion lift exists
Meta APPROVED bodies exist
a telemetry vendor was chosen
a retention duration was chosen
```

---

## 2. Preserved gates

| Gate | Result on record | Evidence | This package |
|---|---|---|---|
| Product Definition | PASS `PD-UOE-CANDIDATE-3` | [PR #424 comment 6365686428](https://github.com/nivedhya11/BobaBear/pull/424#issuecomment-6365686428); reviewed head `dbe0786280fac4ba80ba727c7510b8c23da69ed1` | Preserved |
| Experience | PASS `XD-UOE-CANDIDATE-3` | Same comment | Preserved |
| Architecture Fit | PASS `PRECHECKOUT_ELIGIBILITY_WEB_FIRST_V1` | [PR #424 comment 6371582324](https://github.com/nivedhya11/BobaBear/pull/424#issuecomment-6371582324); contract head `9a9e3f71789a4cce5141eb88b3ab606f72b2c54e` | Preserved |
| Architecture Lock | APPROVED `ARCH-UOE-LOCK-PROPOSAL-1` | Same comment; binding file under `docs/platform/capabilities/` | Preserved. Per-process rate-limit residual `ACCEPTED_FOR_V1_PILOT` |
| Design / Quality / Measurement | `GRANT_WITH_EXCLUSIONS` | §1.1 operative text; record [`23-…`](./23-founder-b5-uoe-dr-qt-mi-planning-gate-record.md) | Recorded 2026-10-25. Exclusions in §1.1 remain |

Experience criticality `X3`. Change risk `CR2`, and `CR3` at checkout and payment boundaries.
Golden journeys in the candidate remain J1–J7 (`01-…`). Acceptance scenarios remain AS-01–AS-46
(`04-…`, `08-…`).

---

## 3. Owner responsibilities

A row is closed only when a source already records the decision. Candidate numbers and missing
exports stay open.

| Responsibility | Status | Source | What is closed |
|---|---|---|---|
| Primary in-app strings MC-01–MC-33 | CLOSED as working baseline | Issue #432; `15-…` §1. `EDITS_RECORDED = NONE`. `(C)` full freeze before Design Readiness was not selected | Working baseline and Content QA latitude `(A)+(B)`. Design Readiness PASS is still the §1 decision |
| Secondary rows MC-08, MC-09, MC-12, MC-14, MC-23–MC-27, MC-30, MC-31 | CLOSED as tranche-exit Content QA | `15-…` §1.3 | Polish may close at T1/T2/T3 exit without reopening Product or Experience. Meaning stays locked |
| WhatsApp on-wire (MC-34) | CLOSED as not approved | Issue #432; `15-…` §2 | On-wire DR-04 is excluded. Bodies remain unknown (§4.3) |
| Seven platform WhatsApp registry rows | CLOSED as internal registry only | `14-…` §2.1 from `drizzle/0033`, `0034`, `0046` | Internal `APPROVED` + `provider_template_ref`. This is not Meta body evidence |
| Noop-safe in-app DR-04 and §4.4 #16 | CLOSED as mandatory | Capability §5; `15-…` WA-04 | `NOT_SENT` is neither send success nor a product failure |
| Product vs Commerce analytics roles | CLOSED as roles | Issue #432; `15-…` §3.1 | Founder is interim owner. Delegates `NOT_NAMED` |
| Primary conversion denominator | CLOSED | `15-…` MI-02 | Checkout starts at `checkout_id` grain. Raw CART evaluation counts are forbidden as that denominator |
| CHECKOUT fingerprint-only commercial-state events | CLOSED | Capability §2.5 / §4.4 #19; `15-…` MI-03 | `order_commercial_state_change` stays IMP-036J fingerprint semantics |
| Privacy bans | CLOSED as bans | Capability §4.3 | No `evaluation_context_digest`, no PAN, no exact street in analytics; V1 `evaluated_delivery_location_hmac` stays null |
| QT-01–QT-04 and DR06-B/C | CLOSED as working dispositions | `15-…` §4 | Plan candidate retained; AS-34/AS-41 stay blocking; packaging allowed while remediation is unauthorized. Finalization is still §1 |
| UOE-DR-06 product commitment | CLOSED as accepted defect | Founder gate record; capability §3.3 | Schedule-capable Takeaway is in the product. Remediation is not authorized |
| Telemetry vendor / transport | OPEN | §4.1 | No vendor is named by a UOE source |
| Retention durations | OPEN | §4.2 | No duration is ratified |
| Meta template bodies | OPEN | §4.3 | `NOT_FOUND` in the repository |
| Named analytics delegates | OPEN | `15-…` §3.2 | `NOT_NAMED` |
| Baseline capture (≥14 days pre-T3) | OPEN | `15-…` MI-05 | `NOT_PERFORMED` and not authorized |
| Attribution rule | OPEN | `15-…` finding M-F1 | Candidate only |
| WA-02 / WA-03 edit-vs-variable | OPEN | `15-…` §2 | Waits on WA-01 body evidence |
| UOE-DR-06 remediation | OPEN and gated | `20-…` | `NOT_AUTHORIZED` |
| Executed AS / negative proof | OPEN | `08-…` | `TESTS_EXECUTED = NONE` |
| IMP identity / implementation authorization | OPEN | UOE-DR-01 | `NOT_ALLOCATED` |

MC-28 (window expired) is inside the W2 `(MC FOUNDER_IMMEDIATE)` clause and is
`WORKING_BASELINE_APPROVED` (`15-…` finding D-F1). It stays in the baseline unless the Founder
removes it in the §1 decision.

---

## 4. Unknown facts (not invented)

### 4.1 Telemetry vendor

```text
DECISION_REQUIRED
question: Which vendor or existing transport, if any, carries UOE funnel events?
why_current_authority_is_insufficient: UOE measurement sources forbid inventing a second telemetry platform and do not name a vendor. Razorpay and Cloudflare appear in the privacy matrix as payment/edge processors, not as a UOE analytics vendor. No repository export selects a product-analytics transport for these events.
option_a: Name an existing authorized transport and the event schema version before instrumentation ships.
option_b: Defer vendor selection and keep Measurement finalization, if granted under §1, limited to roles, denominator, and privacy bans, with shipping of events still blocked.
cursor_recommendation: Do not invent a vendor. §1 grant does not select one. Instrumentation remains blocked until this decision exists.
decision_owner: Founder, or a named Product analytics delegate
blocked_scope: Emitting UOE events; claiming a schema version; any runtime analytics client
work_continuing_elsewhere: Role and denominator record; tranche plans that list events as PLANNED
```

`VENDOR = UNKNOWN`.

### 4.2 Retention durations

```text
DECISION_REQUIRED
question: What retention duration applies to UOE operational UX events and to the checkout-start → payment-success journey metric?
why_current_authority_is_insufficient: 14-… §4.4 lists "90 days hot / 13 months aggregate" and "align with existing payment analytics retention" as candidates only. The privacy retention matrix (docs/platform/security/acceptance-pack/privacy-retention-matrix.md) marks numeric statutory windows LEGAL_REVIEW_REQUIRED and does not publish a day count for payment analytics or a UOE event class. Cart/checkout and payments rows are lifecycle or reconciliation windows, not a ratified analytics TTL.
option_a: Privacy owner signs a duration, citing the matrix, before any event is stored.
option_b: Keep durations unset. A §1 Measurement grant then finalizes ownership and bans only.
cursor_recommendation: Do not adopt 90 days or 13 months as policy. They remain candidates. §1 grant does not select them.
decision_owner: Privacy owner + Product analytics owner (Founder interim)
blocked_scope: Storing UOE analytics; claiming a retention class as approved
work_continuing_elsewhere: Privacy bans already locked in capability §4.3
```

`RETENTION_DURATION = UNKNOWN`.

### 4.3 WhatsApp bodies

```text
DECISION_REQUIRED
question: What Meta-approved body text and category, if any, exist for the seven provider_template_ref names?
why_current_authority_is_insufficient: Migrations show internal registry rows with empty variable_schema_json. Meta BODY text is NOT_FOUND in the repository. No WABA or Graph export is attached. Platform APPROVED is the internal sendable status, not Meta Business Manager body approval. customer-visible-content.ts uses the word Pickup; that file is not a Meta template.
option_a: Notification ops attaches the seven APPROVED bodies and categories, or a record that Meta has no such templates (WA-01). Content QA then decides edit versus variable (WA-02 / WA-03).
option_b: Leave bodies unknown. In-app same-meaning behaviour and noop-safe AS-28 remain the DR-04 obligation. On-wire WhatsApp stays NOT_APPROVED.
cursor_recommendation: Do not invent template ids, bodies, or approval statuses. §1 grant uses option_b for the gate and leaves WA-01 open. A WhatsApp-sending environment cannot claim on-wire DR-04 until WA-01 evidence exists.
decision_owner: Notification ops + Content QA, with Founder if a body changes customer meaning
blocked_scope: On-wire DR-04 claim; Meta template edits; UX-A changes to WhatsApp send payloads
work_continuing_elsewhere: In-app Takeaway wording plan in the UX-A contract; §4.4 #16 noop test remains PLANNED
```

Registry names already verified, bodies unknown:

| provider_template_ref | Meta body |
|---|---|
| `order_received` | UNKNOWN |
| `payment_confirmed` | UNKNOWN |
| `order_accepted` | UNKNOWN |
| `order_cancelled` | UNKNOWN |
| `out_for_delivery` | UNKNOWN |
| `delivered` | UNKNOWN |
| `scheduled_fulfilment_reminder` | UNKNOWN |

`WHATSAPP_BODY = UNKNOWN`. `WHATSAPP_META_ON_WIRE = NOT_APPROVED`.

---

## 5. Final gate items and PLANNED tests

| Class | Meaning |
|---|---|
| `FINAL_GATE_ITEM` | The Founder decides it in §1. It is a plan or baseline acceptance, not executed proof |
| `PLANNED` | Specified future proof. Count = 0 executed under this package |
| `BLOCKED_DR06` | Specified, and expected RED against current Checkout until `20-…` is authorized |
| `CLOSED_EVIDENCE` | Already recorded in §3 |

### 5.1 Final gate items inside §1

| Item | Class |
|---|---|
| Interaction spec in `07-…` (flows, states, responsive, a11y hooks, analytics hook intents) | `FINAL_GATE_ITEM` |
| Primary in-app baseline MC-01–MC-33 | `FINAL_GATE_ITEM` (baseline already `CLOSED_EVIDENCE`; the PASS is the gate) |
| Secondary copy closes at tranche Content QA | `FINAL_GATE_ITEM` |
| WhatsApp on-wire excluded while bodies are UNKNOWN | `FINAL_GATE_ITEM` |
| Accept `08-…` as the Quality plan, including non-claims | `FINAL_GATE_ITEM` |
| Keep AS-34 and AS-41 RED | `FINAL_GATE_ITEM` |
| Roles, checkout-start denominator, fingerprint-only CHECKOUT events, privacy bans | `FINAL_GATE_ITEM` (roles and denominator already `CLOSED_EVIDENCE`) |
| Vendor, retention durations, Meta bodies, named delegates, baseline capture | Outside the grant. They stay `DECISION_REQUIRED` or `NOT_PERFORMED` |
| Any automated or E2E run of AS-01–AS-46 or the 21 negatives | `PLANNED`, not a gate substitute |

### 5.2 Acceptance scenarios

Owner is the future tranche after implementation authorization. Evidence today is `PLANNED`
unless marked `BLOCKED_DR06`. Titles match `08-…` §2.

| ID | Title | Owner after authorization | Evidence now |
|---|---|---|---|
| AS-01 | No selected mode or location (browse Menu) | UX-C | PLANNED |
| AS-02 | Delivery → Takeaway | UX-B + UX-C | PLANNED |
| AS-03 | Takeaway → Delivery | UX-B | PLANNED |
| AS-04 | Mode-dependent charges and offers | UX-B + UX-C | PLANNED |
| AS-05 | One Takeaway outlet | UX-B + UX-C | PLANNED |
| AS-06 | Multiple Takeaway outlets | UX-B + UX-C | PLANNED |
| AS-07 | Unsupported Delivery address | UX-B | PLANNED |
| AS-08 | Outlet closed / Now unavailable | UX-B for Menu and pre-checkout eligibility; Checkout list is UOE-DR-06 | PLANNED; Checkout list `BLOCKED_DR06` |
| AS-09 | No Schedule windows | UX-B; Checkout composition path is UOE-DR-06 | PLANNED; Checkout path `BLOCKED_DR06` |
| AS-10 | Cross-midnight / local-time formatting | UX-B + UX-C | PLANNED |
| AS-11 | Window expires before payment | UX-B | PLANNED |
| AS-12 | Mobile / desktop bar | UX-C | PLANNED |
| AS-13 | Keyboard / SR / a11y | UX-C | PLANNED |
| AS-14 | Saved address / location change | UX-C | PLANNED |
| AS-15 | Authentication / session changes | UX-B + UX-C | PLANNED |
| AS-16 | Cart revisions and stale async responses | UX-B + UX-C | PLANNED |
| AS-17 | Pending historical payment | UX-C client guard + existing server freeze | PLANNED. No new server guards |
| AS-18 | New order versus previous checkout | UX-B + UX-C | PLANNED |
| AS-19 | Workforce vs customer terminology | UX-A | PLANNED |
| AS-20 | Ineligible lines on mode switch | UX-C | PLANNED |
| AS-21 | Revisit / reload / completed checkout | UX-C | PLANNED |
| AS-22 | Multi-tab divergent intent | UX-C | PLANNED |
| AS-23 | CHECKOUT_EXPIRED mid-schedule | UX-B | PLANNED |
| AS-24 | Pre-checkout Takeaway eligibility read | UX-B | PLANNED |
| AS-25 | Mode-sensitive Cart evaluate | UX-B | PLANNED |
| AS-26 | Proposed outlet ≠ confirmed place for windows | UX-B + UX-C | PLANNED |
| AS-27 | Eligibility / evaluate race | UX-B + UX-C | PLANNED |
| AS-28 | Implemented channel consistency | UX-A in-app + noop. On-wire WhatsApp excluded | PLANNED. On-wire claim forbidden while bodies are UNKNOWN |
| AS-29 | Open Checkout mode ≠ browse intent | UX-B | PLANNED |
| AS-30 | No Cart / Empty Cart eligibility | UX-B | PLANNED |
| AS-31 | Takeaway quote without Delivery address | UX-B | PLANNED |
| AS-32 | CART evaluation provenance | UX-B when schema is separately authorized | PLANNED. Schema not authorized |
| AS-33 | Eligibility / pickup-options error vs UNAVAILABLE | UX-B for pre-checkout; Checkout pickup-options path is UOE-DR-06 | PLANNED; Checkout path `BLOCKED_DR06` |
| AS-34 | Closed now but Scheduled Takeaway possible (Checkout) | UOE-DR-06 | `BLOCKED_DR06` + `PRESERVE_RED` |
| AS-35 | Outlet valid for Now but no future Schedule slots | UX-B copy; Checkout path is UOE-DR-06 | PLANNED; Checkout path `BLOCKED_DR06` |
| AS-36 | Selected Checkout outlet becomes invalid | UOE-DR-06 for Checkout reselect | `BLOCKED_DR06` |
| AS-37 | No Schedule times at eligible Checkout | UOE-DR-06 for Checkout composition | `BLOCKED_DR06` |
| AS-38 | No silent Checkout binding from browse / list | UX-B | PLANNED |
| AS-39 | Open Checkout Snapshot without retrievable commercial evaluation | UX-B | PLANNED |
| AS-40 | Checkout effective mode/timing in UI under reuse | UX-C | PLANNED |
| AS-41 | Eligible-Checkout Scheduled Takeaway end-to-end (closed now) | UOE-DR-06 | `BLOCKED_DR06` + `PRESERVE_RED` |
| AS-42 | Mode-gated Offer on Cart advisory quote | UX-B | PLANNED |
| AS-43 | Timing-gated Offer with Schedule UNCONFIRMED | UX-B | PLANNED |
| AS-44 | No Menu guarantee of slot or final promo price | UX-C + Content QA | PLANNED |
| AS-45 | Fail-closed when Snapshot exists but evaluation evidence missing | UX-B | PLANNED |
| AS-46 | Evaluate context-key / dedup for mode·timing·outlet | UX-B + UX-C | PLANNED |
| SEC-BOLA-CHECKOUT | Ownership-exact Checkout paths | UOE-DR-06 regression when Contract C is implemented | PLANNED. Required with the corrective. Not a waiver of current ownership checks |

Checkout-coupled set retained from `15-…` §4: AS-08 Checkout list, AS-09 Checkout path,
AS-33 Checkout path, AS-34, AS-35, AS-36, AS-37, AS-41. None of these rows are deleted.

### 5.3 Twenty-one negatives (capability §4.4)

All `PLANNED`. None executed here.

| # | Requirement | Future owner |
|---|---|---|
| 1 | Wrong-cart / unauthenticated cannot read eligibility or evaluate | UX-B |
| 2 | No or unresolvable credential → `NO_CART`, `outlets=[]` | UX-B |
| 3 | Fabricated `checkoutId` cannot drive pre-checkout eligibility | UX-B |
| 4 | Cross-brand denial uses one generic problem code | UX-B |
| 5 | Outlet outside the eligibility set cannot produce a Takeaway quote | UX-B |
| 6 | Server re-asserts outlet brand and timing eligibility before quote | UX-B |
| 7 | Client money, fingerprint, digest, `evaluationId`, sealed window → 400 | UX-B |
| 8 | Browse cannot mutate Checkout under `PAYMENT_PENDING` | UX-C client route + existing server freeze. No new server guard |
| 9 | `PAYMENT_PENDING` reuse writes zero Checkout rows and zero new CART provenance rows | UX-B when persistence is authorized |
| 10 | Missing CHECKOUT evaluation never falls through to a browse payable | UX-B |
| 11 | Guest never receives reused Checkout Snapshot money | UX-B |
| 12 | 429 leaks no outlet inventory; limiter stores no raw guest token | UX-B |
| 13 | Errors omit internal identifiers beyond safe problem codes | UX-B |
| 14 | Concurrent different-context evaluates do not present two payables in one UI generation | UX-B + UX-C |
| 15 | Cross-tab `sessionStorage` is not sealed Snapshot money | UX-C |
| 16 | WhatsApp noop: `NOT_SENT` is neither send success nor product failure | UX-A |
| 17 | Digest and delivery-location HMAC never appear in client responses or logs | UX-B |
| 18 | Schedule-capable responses expose capability flags only | UX-B |
| 19 | CHECKOUT reuse / `COMMERCIAL_STATE_CHANGE` stays fingerprint-only | UX-B |
| 20 | Client CART `fulfilmentTiming=SCHEDULED` → 400; no SCHEDULED-only promo from browse | UX-B |
| 21 | V1 CART persists `evaluated_delivery_location_hmac` null and digest hmac null | UX-B when schema is authorized |

### 5.4 Non-claims that bind reviewers

- Advisory Cart evaluate does not prove payment preparation.
- Fingerprint comparator checks do not prove prepare or pay.
- Architecture Lock recording is not executed behavioural proof.
- AS-34 and AS-41 cannot be reported green against current Checkout composition.
- A §1 grant does not mark any row `EXECUTED`.

---

## 6. Plans that are not implementation

| Artifact | Status |
|---|---|
| [`17-ux-a-tranche-contract.md`](./17-ux-a-tranche-contract.md) | Plan. In-app terminology. On-wire WhatsApp excluded |
| [`18-ux-b-tranche-contract.md`](./18-ux-b-tranche-contract.md) | Plan. Compact scheduling UI + Contracts A/B. Contract C code excluded |
| [`19-ux-c-tranche-contract.md`](./19-ux-c-tranche-contract.md) | Plan. Tab-scoped bar and pending-payment client guard |
| [`20-uoe-dr-06-test-first-work-package.md`](./20-uoe-dr-06-test-first-work-package.md) | Test-first corrective plan. `NOT_AUTHORIZED` |
| Application source under `src/` | Unchanged |
| Mock or prototype screens | None added. Any later mock stays isolated and `NON_AUTHORITATIVE` |

Sequence when a later authorization exists: UX-A, then UX-B, then UX-C (`10-…`). UOE-DR-06 is
not a step inside that sequence.

---

## 7. Explicit walls

```text
DESIGN_READINESS_PASS = PASS
QUALITY_PLAN_FINALIZATION = FINALIZED
MEASUREMENT_PLAN_FINALIZATION = FINALIZED
FOUNDER_VERDICT = GRANT_WITH_EXCLUSIONS
IMPLEMENTATION_AUTHORIZED = NO
UOE_DR06_CHECKOUT_REMEDIATION = NOT_AUTHORIZED
FORMAL_IMP_IDENTITY = NOT_ALLOCATED
ROADMAP_STATE_DECISION_REGISTER = UNCHANGED
VENDOR = UNKNOWN
RETENTION_DURATION = UNKNOWN
WHATSAPP_BODY = UNKNOWN
ANALYTICS_COLLECTION_OR_STORAGE = NOT_AUTHORIZED
BASELINE = NOT_PERFORMED
CONVERSION_UPLIFT = NOT_CLAIMED
CHECKOUT_IMPLEMENTS_LOCKED_UOE_ARCHITECTURE = NO
TESTS_EXECUTED = NONE
INDEPENDENT_REVIEW = NOT_PERFORMED
PR_MERGE = NO
COMPLETE_AND_ACCEPTED = NOT_CLAIMED
```
