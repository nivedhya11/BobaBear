<!-- AUTHORITY: NON_AUTHORITATIVE_DISCOVERY_DRAFT | ID: QT-UOE-CANDIDATE-2 -->

# Quality / Test Plan candidate — Unified Order Experience

```text
CANDIDATE_ID = QT-UOE-CANDIDATE-2
SUPERSEDES = QT-UOE-CANDIDATE-1
STATUS = PROPOSED_FOR_INDEPENDENT_REVIEW
AUTHORITY = NON_AUTHORITATIVE
TESTING_POLICY = TEST-1
FORMAL_QUALITY_PLAN = NOT_PERFORMED
VARIANT = PRECHECKOUT_ELIGIBILITY_WEB_FIRST_V1
IMPLEMENTATION_AUTHORIZED = NO
```

## Proof strategy

Align with TEST-1: evidence over claims; preserve initial failures; no silent-retry passes;
architecture/invariants before UI cosmetics.

## Test layers

| Layer | What | Scenarios |
|---|---|---|
| Unit | Presentation maps; order-context reducer; timing bucketing helpers | Labels; UNCONFIRMED; legacy dual-read |
| Component | Bar, sheet, TimingChooser, MethodChooser, PlaceChooser | AS-12, AS-13, empty/selected/disabled |
| Integration | Client ↔ cart evaluate (mode/outlet) ↔ eligibility read ↔ checkout/pickup/scheduled APIs | AS-02–11, AS-14–16, AS-24–27, AS-29 |
| Concurrency | Stale async generation; revision conflicts; eligibility races | AS-16, AS-27 |
| Recovery | PAYMENT_PENDING; cart_changed_unresolved; window expiry; open-Checkout reuse | AS-11, AS-17, AS-18, AS-29 |
| Content QA | Customer + workforce primary labels; WhatsApp + in-app; no fulfil jargon | AS-19, AS-28, UX-A |
| A11y / responsive QA | Keyboard, SR, mobile strip | AS-12, AS-13 |
| Regression | Snapshot money; payment prepare; serviceability; scheduled bind; pickup-options bind | Must remain green |
| E2E (staging when authorized) | Golden J1–J6 subset | Not authorized by this package |

## Negative / boundary proofs (mandatory)

- Client cannot display confirmed Deliver to from market orientation alone
- Client cannot list **exact** scheduled windows without eligible checkout (V1 / DR-02)
- Client cannot invent Takeaway outlets or selectionPolicy
- Client cannot treat cart evaluate quote as Snapshot / payable seal
- Browse preference cannot mutate PAYMENT_PENDING checkout
- No client-authored payable amount
- AUTO_SELECT does not bind without confirm (AS-05 / AS-24)
- Schedule cannot invent slots when API empty
- Proposed outlet alone does not unlock scheduled windows (AS-26)
- Domain enums unchanged in network payloads
- Pre-checkout eligibility must not require fabricating a checkoutId

## Non-goals for this plan

- Re-proving entire payment provider matrix unless UOE touches prepare/pay UI copy only
- Claiming Founder UAT pass
- Substituting heuristics for automated proof where races matter
- Building Menu exact-slot preview API tests (deferred DR-02)

## Exit criteria (for a future authorized implementation)

- AS-01–29 mapped to automated and/or scripted Founder UAT evidence
- No invariant regressions listed in Architecture Fit
- Content QA sign-off on primary surfaces + WhatsApp / in-app
- X3 a11y/responsive QA recorded

**Formal plan finalization:** `NOT_PERFORMED`.
**Agent disposition:** `RECOMMENDED_READY_FOR_EVALUATION` as a reviewable candidate only (not RECOMMENDED_PASS).
