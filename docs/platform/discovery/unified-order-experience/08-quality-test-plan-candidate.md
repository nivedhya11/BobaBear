<!-- AUTHORITY: NON_AUTHORITATIVE_DISCOVERY_DRAFT | ID: QT-UOE-CANDIDATE-1 -->

# Quality / Test Plan candidate — Unified Order Experience

```text
CANDIDATE_ID = QT-UOE-CANDIDATE-1
STATUS = PROPOSED_FOR_INDEPENDENT_REVIEW
AUTHORITY = NON_AUTHORITATIVE
TESTING_POLICY = TEST-1
FORMAL_QUALITY_PLAN = NOT_PERFORMED
IMPLEMENTATION_AUTHORIZED = NO
```

## Proof strategy

Align with TEST-1: evidence over claims; preserve initial failures; no silent-retry passes;
architecture/invariants before UI cosmetics.

## Test layers

| Layer | What | Scenarios |
|---|---|---|
| Unit | Presentation maps; order-context reducer; timing bucketing helpers | Labels; UNCONFIRMED; legacy dual-read |
| Component | Bar, sheet, TimingChooser, MethodChooser | AS-12, AS-13, empty/selected/disabled |
| Integration | Client ↔ checkout/cart/serviceability/pickup/scheduled APIs | AS-02–11, AS-14–16 |
| Concurrency | Stale async generation; revision conflicts | AS-16 |
| Recovery | PAYMENT_PENDING; cart_changed_unresolved; window expiry | AS-11, AS-17, AS-18 |
| Content QA | Customer + workforce primary labels; no fulfil jargon | AS-19, UX-A |
| A11y / responsive QA | Keyboard, SR, mobile strip | AS-12, AS-13 |
| Regression | Snapshot money; payment prepare; serviceability; scheduled bind | Must remain green |
| E2E (staging when authorized) | Golden J1–J6 subset | Not authorized by this package |

## Negative / boundary proofs (mandatory)

- Client cannot display confirmed Deliver to from market orientation alone
- Client cannot list scheduled windows without eligible checkout (V1)
- Browse preference cannot mutate PAYMENT_PENDING checkout
- No client-authored payable amount
- AUTO_SELECT does not bind without confirm
- Schedule cannot invent slots when API empty
- Domain enums unchanged in network payloads

## Non-goals for this plan

- Re-proving entire payment provider matrix unless UOE touches prepare/pay UI copy only
- Claiming Founder UAT pass
- Substituting heuristics for automated proof where races matter

## Exit criteria (for a future authorized implementation)

- AS-01–19 mapped to automated and/or scripted Founder UAT evidence
- No invariant regressions listed in Architecture Fit
- Content QA sign-off on primary surfaces
- X3 a11y/responsive QA recorded

**Formal plan finalization:** `NOT_PERFORMED`.
**Agent disposition:** `RECOMMENDED_PASS` as a reviewable candidate only.
