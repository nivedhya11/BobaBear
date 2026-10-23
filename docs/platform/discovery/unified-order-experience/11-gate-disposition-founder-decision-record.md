<!-- AUTHORITY: NON_AUTHORITATIVE_DISCOVERY_DRAFT | PACKAGE: UOE-CANDIDATE-3 -->

# Gate disposition and Founder decision record

```text
PACKAGE = UOE-CANDIDATE-3
SUPERSEDES = UOE-CANDIDATE-2
VARIANT = PRECHECKOUT_ELIGIBILITY_WEB_FIRST_V1
GATE_PRECISION_REVISION = YES
PACKAGE_REVISION = CANDIDATE-3 / GATES-RECORDED-FIT-EVAL-1
FOUNDER_EXPERIENCE_DIRECTION = ACCEPTED_IN_CONVERSATION
FOUNDER_REVIEW_RECOMMENDATIONS = UOE-DR-02 | UOE-DR-04 | UOE-DR-05
FOUNDER_GATE_DECISION_REFERENCE = https://github.com/nivedhya11/BobaBear/pull/424#issuecomment-6365686428
FOUNDER_GATE_DECISION_DATE = 2026-10-23
REVIEWED_PACKAGE_HEAD = dbe0786280fac4ba80ba727c7510b8c23da69ed1
PRODUCT_DEFINITION = PD-UOE-CANDIDATE-3
PRODUCT_DEFINITION_GATE_EXECUTION = PERFORMED
PRODUCT_DEFINITION_GATE_RESULT = PASS
EXPERIENCE_DEFINITION = XD-UOE-CANDIDATE-3
EXPERIENCE_GATE_EXECUTION = PERFORMED
EXPERIENCE_GATE_RESULT = PASS
ARCHITECTURE_FIT_EVALUATION = PERFORMED
ARCHITECTURE_FIT_PASS = NOT_GRANTED
ARCHITECTURE_LOCK = NO
IMPLEMENTATION_AUTHORIZED = NO
REFERENCE_CANDIDATE_2_HEAD = 5a4583eba34dff93082c49a1e0edce1efce4d07c
```

## A. Product direction reconciliation

### Six approved decisions

| ID | Decision | Recorded in candidate |
|---|---|---|
| D1 | Delivery / Takeaway primary labels (customer + workforce) | `02-…` §2 + refinement A + `12-…` §G |
| D2 | Now / Schedule | `02-…` §2 |
| D3 | Delivery time / Collection time / Deliver to / Collect from | `02-…` §2 |
| D4 | Now = earliest available, not immediate | `02-…` §2 |
| D5 | Remove fulfilment jargon from ordinary customer presentation | `02-…` §2 |
| D6 | No API/DB/event/migration/historical architecture rename | `02-…` §2 |

### Four refinements

| ID | Refinement | Recorded |
|---|---|---|
| A | Cross-portal Takeaway; contextual collection task verbs; per-surface table | `02-…`, `03-…`, `12-…` §G |
| B | Unconfirmed location; Ordering in Dehradun ≠ Deliver to; confirmed = coords+SERVICEABLE | `02-…`, `06-…` |
| C | Early Schedule intent; checkout-bound exact windows; eligibility + reason copy; **exact Menu slots deferred (DR-02)** | `02-…`, `03-…`, `06-…` |
| D | One browsing-context owner; **tab-scoped** sessionStorage; fingerprint-keyed eligibility; PAYMENT_PENDING preserve | `02-…`, `03-…`, `06-…` |

### Founder review recommendations (retained)

| ID | Founder recommendation | Candidate incorporation |
|---|---|---|
| UOE-DR-02 | Defer exact Menu scheduling slots in V1 | V1 Schedule = intent + UNCONFIRMED; exact windows remain eligible-checkout only; no Menu preview API |
| UOE-DR-04 | Include consistency for implemented channels | V1_ACCEPTANCE_SLICE includes same-meaning Delivery/Takeaway/Now/Schedule on **in-app** and on **WhatsApp when sending is configured** (adapter may be noop; not claimed always-on) |
| UOE-DR-05 | Strengthen V1 with server-authoritative pre-checkout Takeaway outlet eligibility and mode-sensitive Cart evaluation, without a second commercial authority | Smallest read/quote contracts in `06-…`; AS-24–AS-33; advisory cart quote + eligibility read ≠ Snapshot; open-Checkout reuse precedence |

### Gate-precision findings (UOE-CANDIDATE-3)

| ID | Finding | Disposition |
|---|---|---|
| GP-01 | CANDIDATE-2 claimed no Schedule-for-later Takeaway / accepting-now-only; **Checkout** composition still applies accepting-now at list **and** post-bind evaluate before Timing | **CORRECTED** — Takeaway Now = accepting-now; Takeaway Schedule = schedule-capable + merchandise denial parity; viable bind→windows→evaluate sequence; Contract C + AS-34–38; **UOE-DR-06 ACCEPTED** (AC-036I-040 for; US-036I-002 ambiguity resolved by Founder defect classification) |
| GP-02 | Cart evaluate / Checkout precedence incomplete | **SPECIFIED** — Contract B + AS-29/AS-31/AS-32/AS-39/AS-40/AS-42–46 |
| GP-03 | Empty-cart ASAP list `[]` risked “no outlets available” UX | **CORRECTED** — No Cart / Empty Cart / no eligible / error (AS-30/AS-33) |
| GP-04 | Cross-tab “last-write” language overstated `sessionStorage` | **CORRECTED** — tab-scoped presentation intent (AS-22) |

### Supersessions vs prior candidates

| Prior posture | CANDIDATE-3 disposition |
|---|---|
| CANDIDATE-1 intent-only Takeaway/fee pre-checkout | Remains superseded by DR-05 strengthen (via CANDIDATE-2) |
| CANDIDATE-2 “no Schedule-for-later Takeaway in V1” / accepting-now-only for AS-08 | **Superseded** — GP-01 + UOE-DR-06 ACCEPTED |
| CANDIDATE-2 empty-cart short-circuit to `[]` as UNAVAILABLE-equivalent | **Superseded** — GP-03 distinct cartState |
| CANDIDATE-2 cross-tab generation-wins language | **Superseded** — GP-04 tab-scoped only |
| Variant `PRECHECKOUT_ELIGIBILITY_WEB_FIRST_V1` | Retained; recommended Architecture Fit variant |

## B. PD-2 gate matrix (X3)

| Gate | Actual status | Notes |
|---|---|---|
| Founder experience direction | ACCEPTED_IN_CONVERSATION | Not a formal PD-2 gate PASS |
| Product Definition Gate | **PERFORMED / PASS** | `PD-UOE-CANDIDATE-3`; Founder comment 6365686428; canonical block in `12-…` §E |
| Experience Gate | **PERFORMED / PASS** | `XD-UOE-CANDIDATE-3`; Founder comment 6365686428; canonical block in `12-…` §F |
| Architecture Fit evaluation | **PERFORMED** | Recommendation in `06-…`; **PASS NOT_GRANTED**; lock **NO** |
| Architecture lock | **NO** | — |
| Design Readiness | NOT_PERFORMED | Candidate only |
| Quality / Test Plan | NOT_PERFORMED | Reviewable draft `QT-UOE-CANDIDATE-3` |
| Measurement / Instrumentation | NOT_PERFORMED | Reviewable draft `MI-UOE-CANDIDATE-3` (X3 required before impl auth) |
| Implementation authorization | NOT_PERFORMED | STOP — requires Fit PASS + Design Readiness + plans + UOE-DR-01 |
| Future IMP identity / activation | **NOT_ALLOCATED / NOT_AUTHORIZED** | UOE-DR-01 deferred; D-383 / IMP-036K unchanged |
| Founder Functional + Experience UAT | NOT_PERFORMED | After implementation |
| Pre-GTM experience audit | NOT_PERFORMED | Experience Debt Register |

### Architecture Fit remaining open items (do not self-grant PASS)

1. Formal Fit PASS / lock verdict (Founder / independent Fit authority) — evaluation recommendation ready
2. Evaluate entry must place open-Checkout reuse ahead of Delivery-only `location` early return (GP-02) — contract specified, not implemented
3. Missing CHECKOUT commercial-evaluation evidence must fail closed (AS-39 / AS-45) — contract specified, not implemented
4. Checkout composition timing-aware + bind-without-evaluate (GP-01 Contract C / AS-34 / AS-41) — contract specified; defect **ACCEPTED**; remediation **NOT_AUTHORIZED** here
5. Cart evaluate mode/outlet (+ omit timing while Schedule UNCONFIRMED) (AS-42–44 / AS-31) — contract specified, not implemented
6. CART provenance storage choice (additive columns / sibling table / `expected_components` JSON) — **OPEN at Fit lock** (AS-32 / AS-46)
7. Pre-checkout eligibility distinct empty/no-cart states (GP-03) — contract specified, not implemented
8. Timing-step Now disable uses pickup-options `nowEligible` — contract specified, not implemented
9. WhatsApp DR-04 Meta template body-vs-variable — **OPEN** for Fit/Content QA; WhatsApp remains optional/noop-safe
10. UOE-DR-01 future IMP identity / sequencing — **DEFERRED** (blocks implementation authorization, not Fit contract recommendation)

## C. Founder decisions — recorded dispositions

| ID | Decision | Status |
|---|---|---|
| UOE-DR-01 | Future ROADMAP slice identity and sequencing vs IMP-036J/K (D-383) | **RECORDED:** `FUTURE_IMP_ID=NOT_ALLOCATED`; `ROADMAP_SEQUENCING_CHANGE=NOT_AUTHORIZED`; sequencing **DEFERRED**; D-383 / IMP-036K unchanged; D-377 holds preserved; one-active-slice rule preserved |
| UOE-DR-02 | Exact Menu-level schedule preview API in V1 | **INCORPORATED — DEFER** |
| UOE-DR-03 | Formal Product Definition Gate + Experience Gate verdicts | **PERFORMED — PASS / PASS** on reviewed head `dbe078628…` |
| UOE-DR-04 | WhatsApp + in-app implemented-channel consistency | **INCORPORATED — INCLUDE WhatsApp + in-app** |
| UOE-DR-05 | Pre-checkout Takeaway eligibility / mode-aware Cart evaluate | **INCORPORATED — STRENGTHEN V1** (refined by GP-01…04) |
| UOE-DR-06 | Schedule-capable Takeaway entitlement + Checkout defect classification / remediation vehicle | **RECORDED:** Schedule-capable Takeaway **ACCEPTED** (no Menu slots; no guaranteed availability). Checkout Mode→accepting-now-list→bind→evaluate(ASAP)→Timing = **ACCEPTED_CAPABILITY_CONFORMANCE_DEFECT**. Preferred **separately scoped corrective** after urgent payment work. **Implementation NOT_AUTHORIZED** by this decision. Governed remediation vehicle + risk gates still required before any fix |

### Binding limits on the PASS (Founder)

- Product Definition + Experience Gate verdicts only — specification, not implemented behaviour
- Do not retroactively rewrite accepted IMPs or alter canonical ROADMAP / STATE / decision-register through this PR
- Exact microcopy, WhatsApp Meta body-vs-variable, provenance-storage choice, performance budgets, instrumentation schema → Architecture Fit / Design Readiness / Content QA / Quality and Measurement
- None of those may change approved user promise, eligibility, pricing truth, or payment safeguards without returning to Product / Experience Gate
- `ARCHITECTURE_FIT_PASS=NOT_GRANTED`, `ARCHITECTURE_LOCK=NO`, `DESIGN_READINESS_PASS=NO`, `IMPLEMENTATION_AUTHORIZATION=NO`
- `PR_MERGE=NO`, `DEPLOYMENT=NO`, `PAYMENT/SNAPSHOT_MUTATION=NO`, `NEW_IMP_ACTIVATION=NO`

## D. Independent review record

| Field | Value |
|---|---|
| CANDIDATE-1 review | Independent Cursor agent — READY_FOR_FOUNDER_REVIEW after F-01…F-15 |
| CANDIDATE-2 review | Independent Cursor agent (`claude-fable-5-1-thinking-high`) — [review](f7f0fe65-556a-4e5d-a2ea-a7a2963d0591); post-fix READY_FOR_FOUNDER_REVIEW |
| CANDIDATE-3 revision | Gate-precision doc-only against approved CANDIDATE-2 head `5a4583eba34dff93082c49a1e0edce1efce4d07c` — GP-01…GP-04 |
| CANDIDATE-3 Checkout precision | Same-scope `PACKAGE_REVISION = CANDIDATE-3 / CHECKOUT-PRECISION-1` on PR #424 after main `00ef486e9…` (#425); prior CANDIDATE-3 head `aff6d9b40…`; **no** UOE-CANDIDATE-4; AS-34–40 + Architecture Contracts B/C |
| CANDIDATE-3 Final contract completeness | Same-scope `PACKAGE_REVISION = CANDIDATE-3 / FINAL-CONTRACT-COMPLETENESS-1` on PR #424 after Checkout-precision head `25d3b5d21…`; **no** UOE-CANDIDATE-4; AS-41–46 + Contract B timing-sensitive quotes + Contract C exact journey + fail-closed fingerprint/dedup + WhatsApp optional scope |
| Independent reviews (Checkout precision) | Product [`906437b5-80d5-4fbc-8b19-2075ca545a2a`](906437b5-80d5-4fbc-8b19-2075ca545a2a); Experience [`16f640ff-1498-4101-a996-73f135640a38`](16f640ff-1498-4101-a996-73f135640a38); Architecture [`fa8feb20-4d28-4cda-8702-3b5a22f61ffd`](fa8feb20-4d28-4cda-8702-3b5a22f61ffd) — findings resolved in-docs; **≠ formal gate PASS** |
| Independent reviews (Final contract completeness) | Product [`449f5a96-d5ea-40eb-9814-524f776bcd8e`](449f5a96-d5ea-40eb-9814-524f776bcd8e); Experience [`bea12444-84db-4c54-8ffc-f8e478ae159b`](bea12444-84db-4c54-8ffc-f8e478ae159b); Architecture [`3312e452-89de-4553-b50c-d2aaaf352eb9`](3312e452-89de-4553-b50c-d2aaaf352eb9) — MEDIUM findings resolved in follow-up commit; **≠ formal gate PASS** |
| Founder Product + Experience Gate | PASS / PASS recorded from [comment 6365686428](https://github.com/nivedhya11/BobaBear/pull/424#issuecomment-6365686428) against reviewed head `dbe0786280fac4ba80ba727c7510b8c23da69ed1` |
| Architecture Fit evaluation (this revision) | Independent docs-only evaluation in `06-…`; recommendation `PRECHECKOUT_ELIGIBILITY_WEB_FIRST_V1`; **PASS NOT self-granted** |
| Checkout/Payment safety | SAFE AS DESIGNED (docs only this delivery): Snapshot/payment/serviceability/materialization untouched; PAYMENT_PENDING guards preserved; eligibility/evaluate are read/quote only; open-Checkout reuse + fail-closed missing evidence specified; Schedule Takeaway Checkout path aligns IMP-036I without new lifecycle states; promotion mode/timing gates reused without Menu seal claims |
| Package path | `docs/platform/discovery/unified-order-experience/` |

## E. Explicit non-mutations

This candidate package must not be read as authority to change:

- ROADMAP.md / STATE.md lifecycle pointers
- decision-register.md / D-377 / D-383
- Accepted Product Definitions or Architecture locks
- IMP-036J or IMP-036K identities
- Application source, runtime, database, provider, or staging
- Formal Architecture Fit PASS / lock / Design Readiness / implementation authorization

## F. Next milestone motion

1. ~~Pass Product Definition Gate and Experience Gate~~ **DONE**
2. Independent Architecture Fit evaluation recommendation recorded — await formal Fit PASS / lock (not self-granted)
3. Design Readiness → Quality / Measurement plans → UOE-DR-01 identity when Founder allocates
4. Separately: governed remediation vehicle for ACCEPTED_CAPABILITY_CONFORMANCE_DEFECT (Checkout composition) after urgent payment work — **not authorized by this package**

**STOP before Fit lock, merge, implementation, or deployment.**
