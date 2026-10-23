<!-- AUTHORITY: NON_AUTHORITATIVE_DISCOVERY_DRAFT | PACKAGE: UOE-CANDIDATE-2 -->

# Gate disposition and Founder decision record

```text
PACKAGE = UOE-CANDIDATE-2
SUPERSEDES = UOE-CANDIDATE-1
VARIANT = PRECHECKOUT_ELIGIBILITY_WEB_FIRST_V1
FOUNDER_EXPERIENCE_DIRECTION = ACCEPTED_IN_CONVERSATION
FOUNDER_REVIEW_RECOMMENDATIONS = UOE-DR-02 | UOE-DR-04 | UOE-DR-05
FORMAL_GATES = NOT_PERFORMED
RECOMMENDED_PASS ≠ CANONICAL_PASS
AGENT_GATE_DISPOSITION = RECOMMENDED_READY_FOR_EVALUATION (gaps listed)
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
| D | One browsing-context owner; lifecycle; fingerprint-keyed eligibility; PAYMENT_PENDING preserve | `02-…`, `06-…` |

### Founder review recommendations (incorporated into CANDIDATE-2)

| ID | Founder recommendation | Candidate incorporation |
|---|---|---|
| UOE-DR-02 | Defer exact Menu scheduling slots in V1 | V1 Schedule = intent + UNCONFIRMED; exact windows remain eligible-checkout only; no Menu preview API |
| UOE-DR-04 | Include consistency for implemented channels | V1_ACCEPTANCE_SLICE includes same-meaning Delivery/Takeaway/Now/Schedule on **WhatsApp + in-app** (email/SMS/push non-sending today); no new channel products; receipts/D-365 out of scope |
| UOE-DR-05 | Strengthen V1 with server-authoritative pre-checkout Takeaway outlet eligibility and mode-sensitive Cart evaluation, without a second commercial authority | Smallest read/quote contracts in `06-…`; AS-24–AS-27 + AS-29; advisory cart quote + eligibility read ≠ Snapshot; open-Checkout reuse precedence |

### Supersessions vs UOE-CANDIDATE-1

| CANDIDATE-1 posture | CANDIDATE-2 disposition |
|---|---|
| Recommend defer UOE-DR-05 (Takeaway intent-only pre-checkout) | **Superseded** — strengthen V1 with server eligibility + mode-sensitive cart evaluate |
| Recommend defer UOE-DR-04 complete channel QA | **Amended** — include WhatsApp + in-app consistency; email/SMS/push + unbounded rewrite still out of scope |
| Recommend defer UOE-DR-02 | **Confirmed** — defer exact Menu slots |
| Variant `INTENT_ONLY_WEB_FIRST_V1` | Superseded by `PRECHECKOUT_ELIGIBILITY_WEB_FIRST_V1` |

## B. PD-2 gate matrix (X3)

All formal gates remain `NOT_PERFORMED` until legitimately evaluated. Agent dispositions are
not canonical PASS.

| Gate | Actual status | Agent proposal | Notes |
|---|---|---|---|
| Founder experience direction | ACCEPTED_IN_CONVERSATION | n/a | Not a formal PD-2 gate PASS |
| Product Definition Gate | NOT_PERFORMED | RECOMMENDED_READY_FOR_EVALUATION (gaps listed) | Canonical block in `12-…` §E |
| Experience Gate | NOT_PERFORMED | RECOMMENDED_READY_FOR_EVALUATION (gaps listed) | Canonical block in `12-…` §F |
| Architecture Fit | NOT_PERFORMED | Candidate contracts specified (DR-02/05) | X2/X3: requires Experience Gate before final Fit PASS |
| Architecture lock | NO | — | — |
| Design Readiness | NOT_PERFORMED | Candidate only | — |
| Quality / Test Plan | NOT_PERFORMED | Reviewable draft | `QT-UOE-CANDIDATE-2` |
| Measurement / Instrumentation | NOT_PERFORMED | Reviewable draft | `MI-UOE-CANDIDATE-2` (X3 required before impl auth) |
| Implementation authorization | NOT_PERFORMED | STOP | Requires UOE-DR-01 + gates |
| Future IMP identity / activation | NOT_AUTHORIZED | DECISION_REQUIRED | UOE-DR-01 incl. vs IMP-036K/D-383 |
| Founder Functional + Experience UAT | NOT_PERFORMED | — | After implementation |
| Pre-GTM experience audit | NOT_PERFORMED | — | Experience Debt Register |

## C. Remaining consequential Founder decisions

| ID | Decision | Why Founder | Status in CANDIDATE-2 |
|---|---|---|---|
| UOE-DR-01 | Allocate future ROADMAP slice identity (not IMP-036J/K) and sequencing vs IMP-036J acceptance **and** IMP-036K (D-383). D-383 unaffected unless amended. | R3 lifecycle | DECISION_REQUIRED |
| UOE-DR-02 | Exact Menu-level schedule preview API in V1 | Product/architecture boundary | **INCORPORATED — DEFER** |
| UOE-DR-03 | Formal Product Definition Gate + Experience Gate verdicts on this package | Gate ownership | NOT_PERFORMED |
| UOE-DR-04 | WhatsApp + in-app implemented-channel consistency | Slicing | **INCORPORATED — INCLUDE WhatsApp + in-app** |
| UOE-DR-05 | Pre-checkout Takeaway eligibility / mode-aware Cart evaluate | Same gap class as refinement C, strengthened | **INCORPORATED — STRENGTHEN V1** |

Non-consequential implementation choices (exact route path strings within Fit bounds) remain
deferrable to authorized engineering after gates.

## D. Independent review record

| Field | Value |
|---|---|
| CANDIDATE-1 review | Independent Cursor agent — READY_FOR_FOUNDER_REVIEW after F-01…F-15 |
| CANDIDATE-2 review | Independent Cursor agent (`claude-fable-5-1-thinking-high`) — [review](f7f0fe65-556a-4e5d-a2ea-a7a2963d0591) |
| Scope | Product/Experience completeness + Checkout/Payment boundary safety + DR-02/04/05 incorporation |
| Initial disposition | `NEEDS_SAME_SCOPE_FIXES` (F-01…F-08) |
| Findings applied | F-01…F-08 (doc-only): WhatsApp+in-app channel truth; canonical PD-2/EXP-1 gate fields; open-Checkout evaluate precedence (AS-29); Takeaway accepting-now AS-08; guest/cost Fit consequences; receipts out of scope; ID/disposition hygiene |
| Post-fix disposition | `READY_FOR_FOUNDER_REVIEW` (confirmed by follow-up independent review; gates remain NOT_PERFORMED) |
| Checkout/Payment safety | SAFE AS DESIGNED: Snapshot/payment/serviceability/materialization untouched; PAYMENT_PENDING guards preserved; eligibility/evaluate are read/quote only; open-Checkout reuse wins over browse mode at same cart revision |
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

1. Accept or amend product direction (six decisions + four refinements) **plus** CANDIDATE-2
   incorporation of UOE-DR-02 / UOE-DR-04 / UOE-DR-05
2. Pass or STOP Product Definition Gate and Experience Gate on `PD-UOE-CANDIDATE-2` /
   `XD-UOE-CANDIDATE-2`
3. Decide UOE-DR-01 sequencing vs IMP-036J/K
4. Only then authorize Architecture Fit finalization → Design Readiness → plans → implementation

**STOP after design candidate publication. Do not merge as acceptance. Do not implement.**
