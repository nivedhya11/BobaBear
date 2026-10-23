<!-- AUTHORITY: NON_AUTHORITATIVE_DISCOVERY_DRAFT | PACKAGE: UOE-CANDIDATE-1 -->

# Gate disposition and Founder decision record

```text
PACKAGE = UOE-CANDIDATE-1
VARIANT = INTENT_ONLY_WEB_FIRST_V1
FOUNDER_EXPERIENCE_DIRECTION = ACCEPTED_IN_CONVERSATION
FORMAL_GATES = NOT_SELF_APPROVED
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
| C | Early Schedule intent; checkout-bound exact windows; eligibility + reason copy; preview DR | `02-…`, `03-…`, `06-…` |
| D | One browsing-context owner; lifecycle; fingerprint-keyed eligibility; PAYMENT_PENDING preserve | `02-…`, `06-…` |

### Supersessions vs prior design-prep

| Prior prep item | New disposition |
|---|---|
| Ops queues keep “Pickup” as primary label | **Superseded** by refinement A — primary workforce order-type label = Takeaway |
| PD-UOE-01 conflict framing | Resolved toward Takeaway primary; contextual collection verbs remain |
| “Surface pickup earlier from bar” as reuse | **Corrected** — checkout-bound today; UOE-DR-05 if early list required |

## B. PD-2 gate matrix

| Gate | Actual status | Agent proposal | Notes |
|---|---|---|---|
| Founder experience direction | ACCEPTED_IN_CONVERSATION | n/a | Not a formal PD-2 gate PASS |
| Product Definition Gate | NOT_PERFORMED | RECOMMENDED_READY_FOR_EVALUATION (gaps listed) | Canonical block in `12-…` §E |
| Experience Gate | NOT_PERFORMED | RECOMMENDED_READY_FOR_EVALUATION (gaps listed) | Canonical block in `12-…` §F |
| Architecture Fit | NOT_PERFORMED | Candidate with open UOE-DR-05/02 | Not RECOMMENDED_PASS until contracts decided/deferred |
| Architecture lock | NO | — | — |
| Design Readiness | NOT_PERFORMED | Candidate only | — |
| Quality / Test Plan | NOT_PERFORMED | Reviewable draft | `QT-UOE-CANDIDATE-1` |
| Measurement / Instrumentation | NOT_PERFORMED | Reviewable draft | `MI-UOE-CANDIDATE-1` |
| Implementation authorization | NOT_PERFORMED | STOP | Requires UOE-DR-01 + gates |
| Future IMP identity / activation | NOT_AUTHORIZED | DECISION_REQUIRED | UOE-DR-01 incl. vs IMP-036K/D-383 |
| Founder Functional + Experience UAT | NOT_PERFORMED | — | After implementation |
| Pre-GTM experience audit | NOT_PERFORMED | — | Experience Debt Register |

## C. Remaining consequential Founder decisions

| ID | Decision | Why Founder |
|---|---|---|
| UOE-DR-01 | Allocate future ROADMAP slice identity (not IMP-036J/K) and sequencing vs IMP-036J acceptance **and** IMP-036K (D-383). D-383 unaffected unless amended. | R3 lifecycle |
| UOE-DR-02 | Exact Menu-level schedule preview API in V1 vs intent-only (recommend intent-only) | Product/architecture boundary |
| UOE-DR-03 | Formal Product Definition Gate + Experience Gate verdicts on this package | Gate ownership |
| UOE-DR-04 | Notifications/email/SMS `V1_ACCEPTANCE_SLICE` vs `EXPLICITLY_DEFERRED` | Slicing |
| UOE-DR-05 | Pre-checkout Takeaway eligibility / mode-aware Cart evaluate vs V1 intent-only (recommend intent-only) | Same gap class as refinement C |

Non-consequential implementation choices remain deferrable to authorized engineering.

## D. Independent review record

| Field | Value |
|---|---|
| Reviewer | Independent Cursor agent (`claude-fable-5-1-thinking-high`) — [review](96d36a90-df47-4e43-9409-c4e248d7bb04) |
| Scope | Product/Experience completeness + Checkout/Payment boundary safety |
| Initial disposition | `NEEDS_SAME_SCOPE_FIXES` |
| Findings applied | F-01…F-15 (doc-only): UOE-DR-05; confirmed Deliver to definition; canonical gate/addendum; slicing; IMP-036K sequencing; surface table; eligibility+UNCONFIRMED reasons; order-context lifecycle; AS-20–23; payment “preserve existing guards”; provenance; measurement fields; gate disposition wording |
| Post-fix disposition | `READY_FOR_FOUNDER_REVIEW` (candidate evaluation; gates remain NOT_PERFORMED) |
| Checkout/Payment safety | SAFE AS DESIGNED with UOE-DR-05 explicitly deferred/decisioned; Snapshot/payment/serviceability/materialization untouched; PAYMENT_PENDING guards preserved |
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

1. Accept or amend product direction (six decisions + four refinements) as Product Definition input for the **intent-only web-first** variant
2. Decide UOE-DR-02 and UOE-DR-05 (recommend defer both)
3. Pass or STOP Product Definition Gate and Experience Gate
4. Decide UOE-DR-01 sequencing vs IMP-036J/K
5. Only then authorize Architecture Fit finalization → Design Readiness → plans → implementation

**STOP after design candidate publication. Do not merge as acceptance. Do not implement.**
