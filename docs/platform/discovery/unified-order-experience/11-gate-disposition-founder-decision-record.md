<!-- AUTHORITY: NON_AUTHORITATIVE_DISCOVERY_DRAFT | PACKAGE: UOE-CANDIDATE-3 -->

# Gate disposition and Founder decision record

```text
PACKAGE = UOE-CANDIDATE-3
SUPERSEDES = UOE-CANDIDATE-2
VARIANT = PRECHECKOUT_ELIGIBILITY_WEB_FIRST_V1
GATE_PRECISION_REVISION = YES
PACKAGE_REVISION = CANDIDATE-3 / ARCHITECTURE-FIT-PASS-AND-LOCK-1
FOUNDER_EXPERIENCE_DIRECTION = ACCEPTED_IN_CONVERSATION
FOUNDER_REVIEW_RECOMMENDATIONS = UOE-DR-02 | UOE-DR-04 | UOE-DR-05
FOUNDER_GATE_DECISION_REFERENCE = https://github.com/nivedhya11/BobaBear/pull/424#issuecomment-6365686428
FOUNDER_GATE_DECISION_DATE = 2026-10-23
FOUNDER_FIT_LOCK_DECISION_DATE = 2026-10-23
FOUNDER_FIT_LOCK_DECISION_REFERENCE = https://github.com/nivedhya11/BobaBear/pull/424#issuecomment-6371582324
REVIEWED_PACKAGE_HEAD = dbe0786280fac4ba80ba727c7510b8c23da69ed1
FIT_EVALUATION_HEAD = ecbfb4f4f7f06a888e0a3c4417bc1c647239974b
REVIEWED_ARCHITECTURE_CONTRACT_HEAD = 9a9e3f71789a4cce5141eb88b3ab606f72b2c54e
PRODUCT_DEFINITION = PD-UOE-CANDIDATE-3
PRODUCT_DEFINITION_GATE_EXECUTION = PERFORMED
PRODUCT_DEFINITION_GATE_RESULT = PASS
EXPERIENCE_DEFINITION = XD-UOE-CANDIDATE-3
EXPERIENCE_GATE_EXECUTION = PERFORMED
EXPERIENCE_GATE_RESULT = PASS
ARCHITECTURE_FIT_EVALUATION = PERFORMED
ARCHITECTURE_FIT_PASS = PASS
ARCHITECTURE_LOCK = YES
ARCHITECTURE_LOCK_CONTRACT = ARCH-UOE-LOCK-PROPOSAL-1
ARCHITECTURE_LOCK_STATUS = ARCHITECTURE_LOCKED
BINDING_CAPABILITY_ARCHITECTURE = docs/platform/capabilities/UOE-unified-order-experience.md
PROVENANCE_STORAGE_DECISION = ADDITIVE_NULLABLE_CONTEXT_FIELDS_PLUS_SERVER_CONTEXT_DIGEST
PER_PROCESS_RATE_LIMIT_RESIDUAL = ACCEPTED_FOR_V1_PILOT
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
| Architecture Fit evaluation | **PERFORMED** | Recommendation in `06-…`; Founder **PASS** recorded |
| Architecture Fit PASS | **PASS** | Founder 2026-10-23; variant `PRECHECKOUT_ELIGIBILITY_WEB_FIRST_V1`; reviewed HEAD `9a9e3f717…` |
| Architecture Lock | **YES / ARCHITECTURE_LOCKED** | Contract `ARCH-UOE-LOCK-PROPOSAL-1`; binding path `capabilities/UOE-unified-order-experience.md` |
| Per-process rate-limit residual | **ACCEPTED_FOR_V1_PILOT** | Founder Lock; multi-instance must reassess |
| Design Readiness | **PASS** `DR-UOE-CANDIDATE-3` | `GRANT_WITH_EXCLUSIONS` recorded in `23-…` (Founder proceed 2026-10-25). Operative text `16-…` §1.1. Spec remains `07-…` |
| Quality / Test Plan | **FINALIZED** `QT-UOE-CANDIDATE-3` | Planned TEST-1 matrix in `08-…`. `EXECUTED_TESTS = NONE`. AS-34 and AS-41 remain RED |
| Measurement / Instrumentation | **FINALIZED** `MI-UOE-CANDIDATE-3` | Roles, checkout-start denominator, fingerprint-only CHECKOUT events, and privacy bans. Vendor and retention not selected |
| Implementation authorization | NOT_PERFORMED | STOP — requires Design Readiness + plans + UOE-DR-01 |
| Future IMP identity / activation | **NOT_ALLOCATED / NOT_AUTHORIZED** | UOE-DR-01 deferred; D-383 / IMP-036K unchanged |
| Founder Functional + Experience UAT | NOT_PERFORMED | After implementation |
| Pre-GTM experience audit | NOT_PERFORMED | Experience Debt Register |

### Post-Lock remaining open items (implementation still unauthorized)

1. ~~Formal Fit PASS / Architecture Lock~~ **RECORDED** — Founder 2026-10-23 at HEAD `9a9e3f717…`
2. Evaluate entry must place open-Checkout reuse ahead of Delivery-only `location` early return (GP-02) — contract **locked**, not implemented
3. Missing CHECKOUT commercial-evaluation evidence must fail closed (AS-39 / AS-45) — contract **locked**, not implemented
4. Checkout composition timing-aware + bind-without-evaluate (GP-01 Contract C / AS-34 / AS-41) — contract **locked**; defect **ACCEPTED**; remediation **NOT_AUTHORIZED** here
5. Cart evaluate mode/outlet (+ omit timing while Schedule UNCONFIRMED) (AS-42–44 / AS-31) — contract **locked**, not implemented
6. CART provenance storage choice — **LOCKED** in capability architecture §2 (`ADDITIVE_NULLABLE_CONTEXT_FIELDS_PLUS_SERVER_CONTEXT_DIGEST`); schema migration **not** authorized (AS-32 / AS-46)
7. Pre-checkout eligibility distinct empty/no-cart states (GP-03) — contract **locked**, not implemented
8. Timing-step Now disable uses pickup-options `nowEligible` — contract **locked**, not implemented
9. WhatsApp DR-04 Meta template body-vs-variable — **LOCKED ASSIGNMENT** Content QA + Design Readiness (capability architecture §5); platform registry inventoried in `14-…` §2; Meta bodies `NOT_ACCESSIBLE` in-repo; no invented Meta templates; WhatsApp remains optional/noop-safe
10. Abuse limits / performance budgets / privacy / negative security tests — **LOCKED** in capability architecture §4; Quality plan **FINALIZED** as planned proof (`EXECUTED_TESTS = NONE`); per-process residual **ACCEPTED_FOR_V1_PILOT**
11. UOE-DR-01 future IMP identity / sequencing — **DEFERRED** (blocks implementation authorization)
12. Design/Content/Quality/Measurement owner decisions — packaged in [`14-design-qt-mi-owner-decision-package.md`](./14-design-qt-mi-owner-decision-package.md); Founder `GRANT_WITH_EXCLUSIONS` recorded in [`23-founder-b5-uoe-dr-qt-mi-planning-gate-record.md`](./23-founder-b5-uoe-dr-qt-mi-planning-gate-record.md)
13. UOE-DR-06 smallest corrective proposal — `14-…` §5; remediation still **NOT_AUTHORIZED**

## C. Founder decisions — recorded dispositions

| ID | Decision | Status |
|---|---|---|
| UOE-DR-01 | Future ROADMAP slice identity and sequencing vs IMP-036J/K (D-383) | **RECORDED:** `FUTURE_IMP_ID=NOT_ALLOCATED`; `ROADMAP_SEQUENCING_CHANGE=NOT_AUTHORIZED`; sequencing **DEFERRED**; D-383 / IMP-036K unchanged; D-377 holds preserved; one-active-slice rule preserved |
| UOE-DR-02 | Exact Menu-level schedule preview API in V1 | **INCORPORATED — DEFER** |
| UOE-DR-03 | Formal Product Definition Gate + Experience Gate verdicts | **PERFORMED — PASS / PASS** on reviewed head `dbe078628…` |
| UOE-DR-04 | WhatsApp + in-app implemented-channel consistency | **INCORPORATED — INCLUDE WhatsApp + in-app** |
| UOE-DR-05 | Pre-checkout Takeaway eligibility / mode-aware Cart evaluate | **INCORPORATED — STRENGTHEN V1** (refined by GP-01…04) |
| UOE-DR-06 | Schedule-capable Takeaway entitlement + Checkout defect classification / remediation vehicle | **RECORDED:** Schedule-capable Takeaway **ACCEPTED** (no Menu slots; no guaranteed availability). Checkout Mode→accepting-now-list→bind→evaluate(ASAP)→Timing = **ACCEPTED_CAPABILITY_CONFORMANCE_DEFECT**. Preferred **separately scoped corrective** after urgent payment work. **Implementation NOT_AUTHORIZED** by this decision. Governed remediation vehicle + risk gates still required before any fix. Checkout correction stays owned by UOE-DR-06. Existing Checkout is not the locked UOE architecture |
| FOUNDER-B5-UOE-DR-QT-MI | Design Readiness, Quality / Test Plan, and Measurement / Instrumentation Plan | **RECORDED 2026-10-25:** Founder **proceed**. Verdict **GRANT_WITH_EXCLUSIONS**. `DR-UOE-CANDIDATE-3` PASS. `QT-UOE-CANDIDATE-3` FINALIZED. `MI-UOE-CANDIDATE-3` FINALIZED. Operative text `16-…` §1.1 unchanged. AS-34 and AS-41 stay RED. Tests not executed. Vendor, retention, and Meta bodies unknown. No analytics collection or storage. IMP not allocated. Implementation not authorized |

### Binding limits on recorded Founder gates

- Product Definition + Experience Gate verdicts remain specification, not implemented behaviour
- Architecture Fit PASS + Architecture Lock are recorded for the reviewed contract only; they do **not** authorize implementation, merge, or deploy. Design Readiness PASS is the later Founder grant in `23-…`
- Do not retroactively rewrite accepted IMPs or alter canonical ROADMAP / STATE / decision-register through this PR
- Exact microcopy and instrumentation schema → Design Readiness / Content QA / Quality and Measurement
- Provenance-storage, contract bounds, abuse/perf/privacy, WhatsApp Meta **assignment** → **LOCKED** in `capabilities/UOE-unified-order-experience.md`
- None of those may change approved user promise, eligibility, pricing truth, or payment safeguards without returning to Product / Experience Gate
- `ARCHITECTURE_FIT_PASS=PASS`, `ARCHITECTURE_LOCK=YES`, `DESIGN_READINESS_PASS=PASS` (`GRANT_WITH_EXCLUSIONS`; record `23-…`), `QUALITY_PLAN=FINALIZED`, `MEASUREMENT_PLAN=FINALIZED`, `IMPLEMENTATION_AUTHORIZATION=NO`
- `PR_MERGE=NO`, `DEPLOYMENT=NO`, `PAYMENT/SNAPSHOT_MUTATION=NO`, `NEW_IMP_ACTIVATION=NO`
- UOE-DR-01 remains DEFERRED; UOE-DR-06 remediation remains NOT_AUTHORIZED

### Founder Architecture Fit + Lock decisions (2026-10-23)

```text
FOUNDER_DECISION_1:
  package: UOE-CANDIDATE-3
  architecture_fit: PASS
  variant: PRECHECKOUT_ELIGIBILITY_WEB_FIRST_V1
  reviewed_contract_head: 9a9e3f71789a4cce5141eb88b3ab606f72b2c54e

FOUNDER_DECISION_2:
  package: UOE-CANDIDATE-3
  architecture_lock: APPROVED
  contract: ARCH-UOE-LOCK-PROPOSAL-1
  reviewed_contract_head: 9a9e3f71789a4cce5141eb88b3ab606f72b2c54e
  per_process_rate_limit_residual: ACCEPTED_FOR_V1_PILOT
```

**Provenance:** Founder explicitly replied **"proceed"** (2026-10-23, Asia/Kolkata) to the fully
specified Fit PASS + Architecture Lock decision request. Human Founder authorization — not
agent-generated. GitHub recording:
[PR #424 comment 6371582324](https://github.com/nivedhya11/BobaBear/pull/424#issuecomment-6371582324).
Binding architecture path:
[`UOE-unified-order-experience.md`](../../capabilities/UOE-unified-order-experience.md).
Historical proposal:
[`13-architecture-lock-proposal.md`](./13-architecture-lock-proposal.md).

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
| Architecture Fit evaluation | Independent docs-only evaluation in `06-…`; recommendation `PRECHECKOUT_ELIGIBILITY_WEB_FIRST_V1`; Founder **PASS** recorded 2026-10-23 |
| Architecture Lock | Contract `ARCH-UOE-LOCK-PROPOSAL-1` reviewed at `9a9e3f717…`; Founder **APPROVED** 2026-10-23; binding CURRENT path `capabilities/UOE-unified-order-experience.md`; historical proposal `13-…` |
| Independent Architecture review | [`8a05654d-23bf-423a-b63a-bba025b63f3f`](8a05654d-23bf-423a-b63a-bba025b63f3f) — APPROVE_WITH_DOC_FIXES; material findings resolved in-docs (validates reviewed contract; not re-attributed to recording commits) |
| Independent Security review | [`b6c13c64-b4af-44b8-879f-5ba7fc60015f`](b6c13c64-b4af-44b8-879f-5ba7fc60015f) — APPROVE_WITH_DOC_FIXES; material findings resolved in-docs |
| Independent Financial Integrity review | [`6c0c9948-4755-4e6e-8002-e4fc5456cb2b`](6c0c9948-4755-4e6e-8002-e4fc5456cb2b) — APPROVE_WITH_DOC_FIXES; material findings resolved in-docs |
| Precision-1 Architecture / Security / Financial | [`e11b73be-…`](e11b73be-218b-4746-b261-2264c5d8b7fd) / [`63db0312-…`](63db0312-197e-493a-b093-5f767e723206) / [`b5b7649c-…`](b5b7649c-9a16-4911-9865-e3dc0cccbdb8) — APPROVE on reviewed contract path culminating at `9a9e3f717…` |
| Checkout/Payment safety | SAFE AS DESIGNED (docs only this delivery): Snapshot/payment/serviceability/materialization untouched; PAYMENT_PENDING guards preserved; eligibility/evaluate are read/quote only; open-Checkout reuse + fail-closed missing evidence specified; Schedule Takeaway Checkout path aligns IMP-036I without new lifecycle states; promotion mode/timing gates reused without Menu seal claims; CART provenance digest distinct from `result_fingerprint`; CHECKOUT reuse remains fingerprint-only |
| Package path | `docs/platform/discovery/unified-order-experience/` |

## E. Explicit non-mutations

This candidate package must not be read as authority to change:

- ROADMAP.md / STATE.md lifecycle pointers
- decision-register.md / D-377 / D-383
- Accepted Product Definitions or Architecture locks
- IMP-036J or IMP-036K identities
- Application source, runtime, database, provider, or staging
- implementation authorization / merge / deploy. Design Readiness PASS is recorded only by `23-…` under `GRANT_WITH_EXCLUSIONS`
- UOE-DR-01 IMP allocation or ROADMAP/STATE lifecycle advancement

## F. Next milestone motion

1. ~~Pass Product Definition Gate and Experience Gate~~ **DONE**
2. ~~Independent Architecture Fit evaluation recommendation~~ **DONE** (`PRECHECKOUT_ELIGIBILITY_WEB_FIRST_V1`)
3. ~~Architecture Lock proposal (decision-ready)~~ **DONE**
4. ~~Founder Architecture Fit PASS + Architecture Lock~~ **RECORDED** (2026-10-23; HEAD `9a9e3f717…`)
5. ~~Owner-decision packaging for Design / Quality / Measurement~~ **PACKAGED** in `14-…` (wave 2026-10-24)
6. ~~Founder Design Readiness, Quality plan, and Measurement plan~~ **RECORDED** `GRANT_WITH_EXCLUSIONS` in `23-…` (2026-10-25). Independent Architecture, Quality, and Measurement reviews of that grant are **not** performed by the recording
7. UOE-DR-01 identity when the Founder allocates an IMP. Implementation authorization is still absent
8. Separately: governed remediation vehicle for ACCEPTED_CAPABILITY_CONFORMANCE_DEFECT (Checkout composition) — proposal in `14-…` §5 and `20-…`; **NOT_AUTHORIZED**

**STOP before implementation authorization, IMP allocation, merge, or deployment.**
