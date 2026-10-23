<!-- AUTHORITY: NON_AUTHORITATIVE_DISCOVERY_DRAFT | PACKAGE: UOE-CANDIDATE-3 -->

# Gate disposition and Founder decision record

```text
PACKAGE = UOE-CANDIDATE-3
SUPERSEDES = UOE-CANDIDATE-2
VARIANT = PRECHECKOUT_ELIGIBILITY_WEB_FIRST_V1
GATE_PRECISION_REVISION = YES
FOUNDER_EXPERIENCE_DIRECTION = ACCEPTED_IN_CONVERSATION
FOUNDER_REVIEW_RECOMMENDATIONS = UOE-DR-02 | UOE-DR-04 | UOE-DR-05
FORMAL_GATES = NOT_PERFORMED
RECOMMENDED_PASS ≠ CANONICAL_PASS
AGENT_GATE_DISPOSITION = RECOMMENDED_READY_FOR_EVALUATION (gaps listed)
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
| UOE-DR-04 | Include consistency for implemented channels | V1_ACCEPTANCE_SLICE includes same-meaning Delivery/Takeaway/Now/Schedule on **WhatsApp + in-app** |
| UOE-DR-05 | Strengthen V1 with server-authoritative pre-checkout Takeaway outlet eligibility and mode-sensitive Cart evaluation, without a second commercial authority | Smallest read/quote contracts in `06-…`; AS-24–AS-33; advisory cart quote + eligibility read ≠ Snapshot; open-Checkout reuse precedence |

### Gate-precision findings (UOE-CANDIDATE-3)

| ID | Finding | Disposition |
|---|---|---|
| GP-01 | CANDIDATE-2 claimed no Schedule-for-later Takeaway / accepting-now-only, contradicting accepted IMP-036I PICKUP+SCHEDULED and evaluate/prepare scheduled-pickup gates | **CORRECTED** — Takeaway Now = accepting-now; Takeaway Schedule = schedule-capable; closed NOW must not alone deny Schedule; DR-02 still defers Menu exact slots; no guaranteed future availability |
| GP-02 | Cart evaluate / Checkout precedence incomplete for Takeaway-without-address, effective mode conveyance, DRAFT/READY/PAYMENT_PENDING, CART provenance | **SPECIFIED** — Contract B + AS-29 extended + AS-31/AS-32; reuse wins; no Checkout mutation from browse; no second money authority |
| GP-03 | Empty-cart ASAP list `[]` risked “no outlets available” UX; first-use states under-specified | **CORRECTED** — No Cart / Empty Cart / no eligible / error distinguished (AS-30/AS-33); anonymous Menu browse preserved |
| GP-04 | Cross-tab “last-write” language overstated `sessionStorage` + same-tab events | **CORRECTED** — tab-scoped presentation intent; each tab revalidates server facts; no cross-tab payable/seal sync (AS-22) |

### Supersessions vs prior candidates

| Prior posture | CANDIDATE-3 disposition |
|---|---|
| CANDIDATE-1 intent-only Takeaway/fee pre-checkout | Remains superseded by DR-05 strengthen (via CANDIDATE-2) |
| CANDIDATE-2 “no Schedule-for-later Takeaway in V1” / accepting-now-only for AS-08 | **Superseded** — GP-01 |
| CANDIDATE-2 empty-cart short-circuit to `[]` as UNAVAILABLE-equivalent | **Superseded** — GP-03 distinct cartState |
| CANDIDATE-2 cross-tab generation-wins language | **Superseded** — GP-04 tab-scoped only |
| Variant `PRECHECKOUT_ELIGIBILITY_WEB_FIRST_V1` | Retained; gate-precision revision of entitlement detail |

## B. PD-2 gate matrix (X3)

All formal gates remain `NOT_PERFORMED` until legitimately evaluated. Agent dispositions are
not canonical PASS.

| Gate | Actual status | Agent proposal | Notes |
|---|---|---|---|
| Founder experience direction | ACCEPTED_IN_CONVERSATION | n/a | Not a formal PD-2 gate PASS |
| Product Definition Gate | NOT_PERFORMED | RECOMMENDED_READY_FOR_EVALUATION (gaps listed) | Canonical block in `12-…` §E; GP-01…04 incorporated |
| Experience Gate | NOT_PERFORMED | RECOMMENDED_READY_FOR_EVALUATION (gaps listed) | Canonical block in `12-…` §F; IA/auth/recovery tightened |
| Architecture Fit | NOT_PERFORMED | Candidate contracts specified (DR-02/05 + GP-01…04) | X2/X3: requires Experience Gate before final Fit PASS |
| Architecture lock | NO | — | — |
| Design Readiness | NOT_PERFORMED | Candidate only | — |
| Quality / Test Plan | NOT_PERFORMED | Reviewable draft | `QT-UOE-CANDIDATE-3` |
| Measurement / Instrumentation | NOT_PERFORMED | Reviewable draft | `MI-UOE-CANDIDATE-3` (X3 required before impl auth) |
| Implementation authorization | NOT_PERFORMED | STOP | Requires UOE-DR-01 + gates |
| Future IMP identity / activation | NOT_AUTHORIZED | DECISION_REQUIRED | UOE-DR-01 incl. vs IMP-036K/D-383 |
| Founder Functional + Experience UAT | NOT_PERFORMED | — | After implementation |
| Pre-GTM experience audit | NOT_PERFORMED | — | Experience Debt Register |

### Revised gate readiness (agent — not formal)

| Gate | Readiness after CANDIDATE-3 | Remaining gaps before formal PASS |
|---|---|---|
| Product Definition | Ready for independent Product review | UOE-DR-01 identity; UOE-DR-03 verdict; Founder confirm GP-01 Schedule-capable presentation |
| Experience | Ready for independent Experience review | Finalize UNCONFIRMED copy variants; workforce admin noun table; Meta body-vs-variable; full IA still PARTIAL vs #379 bound |
| Architecture Fit | Contracts reviewable; **not** lock-ready | Confirm evaluate entry ordering for Takeaway-without-location reuse; CART provenance fields; WhatsApp template body-vs-variable; formal Fit only after Experience Gate |

### Architecture Fit blockers (candidate — before formal Fit)

1. Formal Product Definition Gate + Experience Gate not performed (X2/X3 prerequisite)
2. Evaluate entry must place open-Checkout reuse ahead of Delivery-only `location` early return for Takeaway open Checkouts (GP-02) — contract specified, not implemented
3. Pre-checkout eligibility must emit distinct empty/no-cart states (GP-03) — contract specified, not implemented
4. WhatsApp DR-04 wording body-vs-variable confirmation still open
5. UOE-DR-01 future IMP identity / sequencing unresolved (blocks implementation authorization, not Fit contract review)

## C. Remaining consequential Founder decisions

| ID | Decision | Why Founder | Status in CANDIDATE-3 |
|---|---|---|---|
| UOE-DR-01 | Allocate future ROADMAP slice identity (not IMP-036J/K) and sequencing vs IMP-036J acceptance **and** IMP-036K (D-383). D-383 unaffected unless amended. | R3 lifecycle | DECISION_REQUIRED |
| UOE-DR-02 | Exact Menu-level schedule preview API in V1 | Product/architecture boundary | **INCORPORATED — DEFER** |
| UOE-DR-03 | Formal Product Definition Gate + Experience Gate verdicts on this package | Gate ownership | NOT_PERFORMED |
| UOE-DR-04 | WhatsApp + in-app implemented-channel consistency | Slicing | **INCORPORATED — INCLUDE WhatsApp + in-app** |
| UOE-DR-05 | Pre-checkout Takeaway eligibility / mode-aware Cart evaluate | Same gap class as refinement C, strengthened | **INCORPORATED — STRENGTHEN V1** (refined by GP-01…04) |
| UOE-DR-06 | Confirm Schedule-capable Takeaway pre-checkout presentation (no Menu slots; no guaranteed availability) as Founder-accepted GP-01 correction | Product entitlement vs CANDIDATE-2 text | **DECISION_REQUIRED** (recommended accept; aligns IMP-036I) |

Non-consequential implementation choices (exact route path strings within Fit bounds) remain
deferrable to authorized engineering after gates.

## D. Independent review record

| Field | Value |
|---|---|
| CANDIDATE-1 review | Independent Cursor agent — READY_FOR_FOUNDER_REVIEW after F-01…F-15 |
| CANDIDATE-2 review | Independent Cursor agent (`claude-fable-5-1-thinking-high`) — [review](f7f0fe65-556a-4e5d-a2ea-a7a2963d0591); post-fix READY_FOR_FOUNDER_REVIEW |
| CANDIDATE-3 revision | Gate-precision doc-only against approved CANDIDATE-2 head `5a4583eba34dff93082c49a1e0edce1efce4d07c` — GP-01…GP-04 |
| Required next | Independent Product / Experience / Architecture review of CANDIDATE-3 (not performed by this delivery agent as formal gate) |
| Checkout/Payment safety | SAFE AS DESIGNED: Snapshot/payment/serviceability/materialization untouched; PAYMENT_PENDING guards preserved; eligibility/evaluate are read/quote only; open-Checkout reuse wins; Schedule Takeaway aligns IMP-036I |
| Package path | `docs/platform/discovery/unified-order-experience/` |

## E. Explicit non-mutations

This candidate package must not be read as authority to change:

- ROADMAP.md / STATE.md lifecycle pointers
- decision-register.md / D-377 / D-383
- Accepted Product Definitions or Architecture locks
- IMP-036J or IMP-036K identities
- Application source, runtime, database, provider, or staging

## F. Recommended Founder milestone motion

One consolidated decision:

1. Accept or amend product direction (six decisions + four refinements) **plus** CANDIDATE-3
   gate-precision corrections (GP-01…GP-04) and retained UOE-DR-02 / UOE-DR-04 / UOE-DR-05
2. Pass or STOP Product Definition Gate and Experience Gate on `PD-UOE-CANDIDATE-3` /
   `XD-UOE-CANDIDATE-3`
3. Decide UOE-DR-01 sequencing vs IMP-036J/K
4. Only then authorize Architecture Fit finalization → Design Readiness → plans → implementation

**STOP after design candidate publication. Do not merge as acceptance. Do not implement.**
