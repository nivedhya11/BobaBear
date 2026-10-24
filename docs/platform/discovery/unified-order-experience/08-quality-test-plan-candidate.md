<!-- AUTHORITY: NON_AUTHORITATIVE_DISCOVERY_DRAFT | ID: QT-UOE-CANDIDATE-3 -->

# Quality / Test Plan candidate — Unified Order Experience

```text
CANDIDATE_ID = QT-UOE-CANDIDATE-3
SUPERSEDES = QT-UOE-CANDIDATE-2
STATUS = PROPOSED_FOR_INDEPENDENT_REVIEW
AUTHORITY = NON_AUTHORITATIVE
TESTING_POLICY = TEST-1
FORMAL_QUALITY_PLAN = NOT_PERFORMED
VARIANT = PRECHECKOUT_ELIGIBILITY_WEB_FIRST_V1
PACKAGE = UOE-CANDIDATE-3
GATE_PRECISION_REVISION = YES
IMPLEMENTATION_AUTHORIZED = NO
SECURITY_NEGATIVE_AUTHORITY = docs/platform/capabilities/UOE-unified-order-experience.md §4.4
NEGATIVE_SECURITY_REQUIREMENTS = 21
ARCHITECTURE_CONTRACT = ARCH-UOE-LOCK-PROPOSAL-1
OWNER_DECISION_PACKAGE = docs/platform/discovery/unified-order-experience/14-design-qt-mi-owner-decision-package.md
EVIDENCE_STATUS_VOCABULARY = PLANNED | EXECUTED | BLOCKED_DR06 | PRESERVE_RED
```

## Proof strategy

Align with TEST-1: evidence over claims; preserve initial failures; no silent-retry passes;
architecture/invariants before UI cosmetics. All proofs below are **PLANNED** unless a future
authorized implementation records executed evidence. This documentation task executes **no**
staging, payment/provider, database-mutation, or production tests.

```text
FORMAL_QUALITY_PLAN = NOT_PERFORMED
TESTS_EXECUTED_UNDER_THIS_PACKAGE = NONE
SYNTHETIC_COMPARATOR_ONLY ≠ PAYMENT_PREPARE_PROOF = YES
```

Historical discovery proposal `13-architecture-lock-proposal.md` is provenance only. The current
security/negative-test authority is the **binding capability architecture**
`docs/platform/capabilities/UOE-unified-order-experience.md` §4.4 (21 locked mandatory negatives).

---

## 1. TEST-1 layers (applicability)

| # | Layer | UOE applicability | Notes |
|---|---|---|---|
| 1 | Unit | YES | Presentation maps; reducers; timing helpers; digest builders (server) |
| 2 | Component | YES | Bar, sheet, choosers, ImpactBanner, PendingPaymentGuard |
| 3 | Domain / use-case | YES | Eligibility compose; evaluate context; Contract C sequencing rules |
| 4 | Integration | YES | Client ↔ eligibility ↔ evaluate ↔ checkout/pickup/scheduled APIs |
| 5 | Database | YES when schema authorized | CART provenance columns/digest persistence — **schema not authorized yet**; plan tests for when authorized |
| 6 | HTTP / API | YES | Allowlist 400s; 429; problem codes; credential scope |
| 7 | Authorization / security | YES | Full §4.4 suite + SEC-BOLA-CHECKOUT (capability §3.5 ownership-exact Checkout paths) |
| 8 | Concurrency | YES | Genuine overlapping ops; multi-tab boundaries |
| 9 | Recovery / idempotency | YES | PAYMENT_PENDING; missing evidence; window expiry; retries |
| 10 | Accessibility | YES | AS-12/13 + Design Readiness a11y |
| 11 | E2E browser | YES when authorized | Golden J1–J6 subset — not authorized by this package |
| 12 | Golden Journey | YES when authorized | Cross-capability continuity |
| 13 | Founder UAT | YES when required | Human only; not agent-substitutable |

---

## 2. Verification matrix — AS-01…AS-46 + Contracts A–D

Status for every row: **PLANNED** (none executed under this package). Canonical scenario titles from
`04-story-map-acceptance-scenarios.md`. Owner = future authorized implementation tranche unless noted.

| Scenario (canonical `04-…` title) | Contract | Risk | Verification layer(s) | Planned evidence | Negative case | Owner / dependency |
|---|---|---|---|---|---|---|
| AS-01 No selected mode or location (browse Menu) | D | X3 | Component, E2E | Bar CTAs; orientation ≠ Deliver to; no “no outlets” solely for no cart lines | Orientation as Deliver to; empty-cart “no outlets” | T3 / Design |
| AS-02 Delivery → Takeaway | A, B, D | CR2 | Integration, HTTP, Component | Eligibility place chrome; mode-sensitive evaluate; line disposition | Client-invented outlets/fees | T2–T3 |
| AS-03 Takeaway → Delivery | B, D | CR2 | Integration, HTTP | Address/serviceability; evaluate recompute | Invented SERVICEABLE | T2–T3 |
| AS-04 Mode-dependent charges and offers | B, D | CR2 | Domain, Component, Content QA | ImpactBanner; server-only money; advisory quote | Client-authored charges; quote-as-seal | T2–T3 |
| AS-05 One Takeaway outlet (pre-checkout + Checkout) | A, C | CR2 | Domain, Component | Per-timing AUTO_SELECT propose; confirm before bind | Silent bind from propose / Now∪Schedule union AUTO_SELECT | T2–T3 |
| AS-06 Multiple Takeaway outlets | A, C | CR2 | Component, Integration | Explicit select; invalid → reselect | Silent nearest invent | T2–T3 |
| AS-07 Unsupported Delivery address | B, D | CR2 | Integration | Browse OK; pay blocked + recovery | Fake deliverable | T2 |
| AS-08 Outlet closed / Now unavailable (GP-01) | A, C | CR2 | Domain, Integration, HTTP | Schedule-capable honesty Menu+Checkout | Deny Schedule solely because closed NOW | Menu/eligibility T2; **Checkout list path blocked until UOE-DR-06 auth** |
| AS-09 No Schedule windows | C | CR2 | Integration, Component | Empty + recovery; Now if eligible | Invented slots | T2 — Checkout empty-windows ↔ DR-06 when on Checkout composition |
| AS-10 Cross-midnight / local-time formatting | C, D | X2 | Component, Unit | Today/Tomorrow + outlet TZ labels | Wrong TZ / midnight mislabel | T2–T3 |
| AS-11 Window expires before payment | C | CR3 | Recovery, Integration | Reselect; no stale pay | Pay on expired window | T2 |
| AS-12 Mobile / desktop bar | D | X3 | Component, A11y | Sticky vs header | Unusable narrow targets | T3 |
| AS-13 Keyboard / SR / a11y | D | X3 | A11y | Focus trap; names; selected | Raw enums in names | T3 |
| AS-14 Saved address / location change | B | CR2 | Integration | Revalidate serviceability | Duplicate geo authority | T3 |
| AS-15 Authentication / session changes | A, B | CR2 | Auth, Integration | Revalidate; D-370 merge unchanged | Leak prior customer outlets | T2–T3 |
| AS-16 Cart revisions and stale async responses | A, B | CR2 | Concurrency, Component | Generation drop | Stale overwrite money | T2–T3 |
| AS-17 Pending historical payment | B, C | CR3 | Auth, Recovery, HTTP | Existing freeze + client guard route | Browse mutates pending | T3 + **existing** freeze tests (no new server guards) |
| AS-18 New order versus previous checkout | C | CR2 | Recovery | No Snapshot bleed | Prior seal on new journey | T2–T3 |
| AS-19 Workforce vs customer terminology | D | X2 | Content QA, Component | Delivery/Takeaway maps | Pickup-as-peer | T1 Content QA |
| AS-20 Ineligible lines on mode switch | B | CR2 | Component, Domain | Confirm/explain removal | Silent payable keep | T3 |
| AS-21 Revisit / reload / completed checkout | D | X2 | Component, E2E | Safe restore | Completed checkout bleed | T3 |
| AS-22 Multi-tab divergent intent (GP-04) | D | CR3 | Concurrency | Tab-scoped presentation | Cross-tab seal sync | T3 |
| AS-23 CHECKOUT_EXPIRED mid-schedule | C | CR3 | Recovery | Force recovery | Pay expired | T2 |
| AS-24 Pre-checkout Takeaway eligibility read | A | CR2 | HTTP, Domain, Auth | Outlets+policy; timing intent | Fabricated checkoutId | T2 |
| AS-25 Mode-sensitive Cart evaluate | B | CR2 | Domain, HTTP, Integration | Quote updates; ≠ Snapshot | Quote treated as seal | T2 |
| AS-26 Proposed outlet ≠ confirmed place for windows | A, C | CR2 | Component, Domain | Windows blocked until confirm | Proposed unlocks slots | T2–T3 |
| AS-27 Eligibility / evaluate race | A, B | CR2 | Concurrency | Fingerprint/generation | Two competing payables | T2–T3 |
| AS-28 Implemented channel consistency (DR-04) | D | X2 | Content QA, Integration | In-app; WhatsApp when sending | Noop mapped to success/failure wrongly | T1; WhatsApp env-dependent |
| AS-29 Open Checkout mode ≠ browse intent | B | CR3 | Domain, Integration, DB | Reuse precedence; mode conveyed | Divergent browse money | T2 |
| AS-30 No Cart / Empty Cart eligibility (GP-03) | A | X2 | HTTP, Component | Distinct cartState | “No outlets” for empty cart | T2 |
| AS-31 Takeaway quote without Delivery address | B | CR2 | Domain, HTTP | Outlet quote; without outlet → context required | Brand-level invented money | T2 |
| AS-32 CART evaluation provenance | B | CR2 | DB, Domain | Digest + context columns when schema auth | Equal-money silent wrong reuse | T2 — schema auth separate |
| AS-33 Eligibility / pickup-options error vs UNAVAILABLE | A, C | CR2 | Component, HTTP | Calm retry | Permanent UNAVAILABLE on error | T2 — Checkout pickup-options path ↔ DR-06 |
| AS-34 Closed now but Scheduled Takeaway possible (Checkout) | C | CR2 | Domain, Integration, E2E | Timing-aware list; bind w/o evaluate | Accepting-now-only list; ASAP evaluate before Timing | **PLANNED tests; expect RED vs current Checkout until DR-06 remediation authorized** |
| AS-35 Outlet valid for Now but no future Schedule slots | C | CR2 | Integration | Honest empty Schedule | Invented slots | T2 / **DR-06 for Checkout path** |
| AS-36 Selected Checkout outlet becomes invalid | C | CR2 | Recovery, HTTP | Force reselect | Silent keep | T2 / **DR-06** |
| AS-37 No Schedule times at eligible Checkout | C | CR2 | Integration | Recovery; Now only if eligible | Unconditional ASAP copy | T2 / **DR-06** |
| AS-38 No silent Checkout binding from browse / list | A, C | CR2 | Domain, Auth | Confirm required | Browse sets pickupOutletId | T2 |
| AS-39 Open Checkout Snapshot without retrievable commercial evaluation | B | CR3 | Domain, Recovery | Fail-closed / Snapshot-only | Browse fall-through payable | T2 |
| AS-40 Checkout effective mode/timing in UI under reuse | B, D | CR2 | Component | Show Checkout mode under reuse | Browse implies other payable | T3 |
| AS-41 Eligible-Checkout Scheduled Takeaway end-to-end (closed now) | C | CR2/CR3 | Integration, E2E, Recovery | Full Contract C journey; expectedRevision conflicts | Post-bind ASAP evaluate before Timing | **PLANNED; expect RED until DR-06 remediation authorized** |
| AS-42 Mode-gated Offer on Cart advisory quote | B | CR2 | Domain, Integration | Mode match required | Offer without mode | T2 |
| AS-43 Timing-gated Offer with Schedule UNCONFIRMED | B | CR2 | Domain, HTTP | Omit CART SCHEDULED; client SCHEDULED → 400 | Locked SCHEDULED-only savings at Menu | T2 |
| AS-44 No Menu guarantee of slot or final promo price | D | X3 | Component, Content QA | No slot/final promo claim | Guaranteed window copy | T3 + Content QA |
| AS-45 Fail-closed when Snapshot exists but evaluation evidence missing | B | CR3 | Domain, Recovery | Same as AS-39 | Competing browse payable | T2 |
| AS-46 Evaluate context-key / dedup correctness for mode·timing·outlet | A, B | CR2 | Concurrency, Component | Drop stale; one payable | Two payables one generation | T2–T3 |
| SEC-BOLA-CHECKOUT Ownership-exact Checkout paths (capability §3.5) | C | CR3 | Auth, HTTP | Guest/wrong-owner denied on timing-aware pickup-options, windows, fulfilment, evaluate, prepare; listing must not weaken ownership | BOLA weaken under Contract C composition | Security tests — **regression required when Contract C implemented** |

### Contract coverage rollup

| Contract | Primary AS / proofs | Mandatory layers |
|---|---|---|
| A Pre-checkout eligibility | AS-02, AS-05–06, AS-08, AS-24, AS-27, AS-30, AS-33, AS-38 | Domain, HTTP, Auth, Concurrency |
| B Mode-sensitive Cart evaluate | AS-02–04, AS-14–18, AS-20, AS-25, AS-29, AS-31–32, AS-39–40, AS-42–46 | Domain, HTTP, DB (when auth), Recovery |
| C Scheduled Takeaway Checkout | AS-08–11, AS-23, AS-26, AS-33–38, AS-41, SEC-BOLA-CHECKOUT | Domain, Integration, Auth, E2E — **Checkout code remediation gated by UOE-DR-06 authorization** |
| D Presentation / channels | AS-01, AS-04, AS-10, AS-12–13, AS-19, AS-21–22, AS-28, AS-44 | Component, A11y, Content QA |

### UOE-DR-06 evidence disposition (Founder-owned)

```text
AS_WITH_CHECKOUT_COMPOSITION_DEPENDENCY = AS-08 (Checkout list), AS-09/AS-33 (Checkout paths),
  AS-34, AS-35, AS-36, AS-37, AS-41
INTERACTION_AND_TEST_SPEC = AUTHORIZED_IN_CANDIDATE_DOCS
PASSING_IMPLEMENTATION_EVIDENCE = BLOCKED_UNTIL_UOE_DR_06_REMEDIATION_AUTHORIZED
PRESERVE_RED_BEFORE_REMEDIATION = YES
PREFERRED_VEHICLE = SEPARATELY_SCOPED_CORRECTIVE
SMALLEST_CORRECTIVE_PROPOSAL = 14-design-qt-mi-owner-decision-package.md §5
FOUNDER_DECIDES = keep blocked until corrective (RECOMMENDED) OR explicit deferral language that
  still retains the AS obligation — never silent delete to obtain PASS
```

Acceptance rollup (Contracts A–D, future vs executed, payment-prepare non-claim) is finalized for
Founder/independent review in
[`14-design-qt-mi-owner-decision-package.md`](./14-design-qt-mi-owner-decision-package.md) §3.
Every AS/negative row above remains **PLANNED** under this package (`EXECUTED = NONE`).

---

## 3. Negative security suite (§4.4 — 21 locked)

Authority: `docs/platform/capabilities/UOE-unified-order-experience.md` §4.4. Each is **PLANNED**.

| # | Requirement | Layer | Planned evidence | Negative / abuse case | Owner |
|---|---|---|---|---|---|
| 1 | Wrong-cart / unauthenticated cannot read eligibility or evaluate | Auth, HTTP | Cross-cart deny | BOLA read | Security tests |
| 2 | No/unresolvable credential → `NO_CART`, `outlets=[]` | Auth, HTTP | Empty set only | Non-empty dump without credential | Security tests |
| 3 | Fabricated `checkoutId` cannot drive pre-checkout eligibility | Auth, HTTP | Reject / ignore fab id | Eligibility via fake checkout | Security tests |
| 4 | Cross-brand `brandId` / `pickupOutletId` → same generic problem code | Auth, HTTP | No existence oracle | Brand probe via distinct codes | Security tests |
| 5 | Client outlet not in eligibility set → no successful Takeaway quote | Domain, HTTP | Quote deny | Out-of-set outlet money | Security + domain |
| 6 | Server re-asserts outlet brand + timing eligibility before quote | Domain | Re-assert path | Stale client outlet accepted | Domain |
| 7 | Client money / fingerprint / digest / evaluationId / sealed-window → **400** | HTTP | Strict allowlist | Client authority smuggling | HTTP contract |
| 8 | Browse cannot mutate Checkout under PAYMENT_PENDING | Auth, Recovery | Mutation deny via **existing** server freeze + client route guard | Fulfilment/timing write while pending | Existing freeze tests + T3 client guard (**no new server guards**) |
| 9 | PAYMENT_PENDING reuse → zero Checkout rows + zero new CART provenance | DB, Recovery | Row counts | Provenance write while pending | DB integration |
| 10 | Missing CHECKOUT eval / undecodable wire / probe throw + Snapshot → never browse fall-through | Domain, Recovery | Fail-closed | Divergent browse payable | Domain |
| 11 | Guest never receives reused Checkout Snapshot money | Auth, Domain | Guest path | Guest sees sealed Snapshot | Auth |
| 12 | 429 without outlet inventory leak; no raw guest tokens in limiter | Auth, HTTP | Rate-limit body + key hashing | Token in logs/maps | Abuse tests |
| 13 | Errors omit internal identifiers beyond safe problem codes | HTTP | Body audit | Stack / hierarchy leak | HTTP |
| 14 | Concurrent different-context evaluates → not two competing payables | Concurrency | Overlapping genuine races | Dual money paint | Concurrency |
| 15 | Cross-tab sessionStorage ≠ sealed Snapshot money | Concurrency, Component | Dual-tab script | Seal sync across tabs | T3 |
| 16 | WhatsApp noop: `NOT_SENT` ≠ send success **and** ≠ product failure | Integration | Noop adapter fixture | DR-04 pass via fake send | Notifications |
| 17 | `evaluation_context_digest` / `evaluated_delivery_location_hmac` never in client responses/logs | HTTP, Privacy | Response/log scrub | Digest echo | Privacy |
| 18 | Schedule-capable responses = capability flags only | HTTP | Field allowlist | Profile internals leak | Privacy |
| 19 | CHECKOUT reuse / `COMMERCIAL_STATE_CHANGE` fingerprint-only | Domain, Measurement | Comparator unit + integration | Digest alters CHECKOUT measurement | Domain / MI |
| 20 | Client CART `fulfilmentTiming=SCHEDULED` → **400**; no SCHEDULED-only promo from browse | HTTP, Domain | 400 + offer non-apply | Silent qualify | Domain |
| 21 | V1 CART persists `evaluated_delivery_location_hmac` null + digest hmac null | DB | Persist assert | Coordinate HMAC computed in V1 | DB — when schema auth |

---

## 4. Cross-cutting planned proofs

| Class | Planned proof | Layer | Status | Notes |
|---|---|---|---|---|
| Genuine overlapping concurrency | Parallel evaluate/eligibility with distinct context keys; revision conflicts | Concurrency | PLANNED | Sequential calls insufficient |
| Stale async generation | Out-of-order responses dropped | Component + Concurrency | PLANNED | AS-16/27/46 |
| Multi-tab boundaries | Two tabs diverge presentation; no seal sync | Concurrency | PLANNED | AS-22 / §4.4 #15 |
| Persistence / fingerprint / digest | CART digest reuse vs equal-money different context; CHECKOUT fingerprint-only | DB + Domain | PLANNED | Schema migration not authorized now |
| Schedule timing / promotion | UNCONFIRMED omit timing; 400 on client SCHEDULED; Checkout seal applies truthfully | Domain + HTTP | PLANNED | AS-42–44 |
| Payment / Checkout financial integrity | Prepare/pay unchanged authority; no client money; Snapshot seal path; prepare idempotency + expectedRevision conflicts under Contract C | Integration + Recovery + Concurrency | PLANNED | Comparator-only checks **do not** prove prepare; dual-tab bind/timing races when Contract C implemented |
| Recovery / idempotency | Duplicate evaluate; pending recover; window reselect | Recovery | PLANNED | AS-11/17/23/39 |
| A11y / responsive QA | Keyboard, SR, targets, narrow | A11y + Component | PLANNED | AS-12/13 |
| Performance / load | Eligibility p95 ≤300ms; evaluate p95 ≤500ms; reuse ≤400ms at nominal load | Perf harness (when auth) | PLANNED | Breach → calm degrade; never weaken Snapshot/payment |
| Per-process rate limits | 429 paths; key hashing | HTTP | PLANNED | Document multi-instance residual `ACCEPTED_FOR_V1_PILOT` — not fleet-wide proof |
| Content QA | Primary labels; provisional copy; no fulfil jargon | Content QA | PLANNED | Sign-off pending |
| WhatsApp noop | AS-28 + §4.4 #16 | Integration | PLANNED | No Meta template invention |

---

## 5. Explicit non-claims

- Re-proving entire payment provider matrix unless UOE touches prepare/pay UI copy only
- Claiming Founder UAT pass
- Substituting heuristics for automated proof where races matter
- Building Menu exact-slot preview API tests (deferred DR-02)
- Treating Architecture Lock recording or this candidate as executed proof
- Claiming synthetic fingerprint comparator-only checks prove actual payment preparation behaviour
- Executing Checkout Contract C remediation without separate UOE-DR-06 authorization

## 6. Exit criteria (future authorized implementation)

- AS-01–46 mapped to automated and/or scripted Founder UAT evidence, **or** Founder-explicit deferral / DR-06-blocked disposition for Checkout-composition-dependent AS (see §2 disposition block)
- All 21 §4.4 negatives + SEC-BOLA-CHECKOUT passing on authorized candidate
- No invariant regressions vs locked capability architecture
- Content QA sign-off on primary surfaces + in-app (+ WhatsApp when sending)
- X3 a11y/responsive QA recorded
- Perf methodology run or explicitly waived with Founder risk acceptance
- AS-34 / AS-41: preserve reproducing RED against current Checkout composition before remediation (TEST-1), then green on authorized corrective

```text
FORMAL_QUALITY_PLAN = NOT_PERFORMED
QUALITY_PLAN_FINALIZATION = NOT_GRANTED
INDEPENDENT_REVIEW_VERDICT = PENDING_EXTERNAL_REVIEWERS
AGENT_MAY_NOT_SELF_GRANT_QUALITY_PLAN_PASS = YES
TESTS_EXECUTED_UNDER_THIS_PACKAGE = NONE
```
