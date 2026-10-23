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
GATE_PRECISION_REVISION = YES
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
| Integration | Client ↔ cart evaluate (mode/outlet) ↔ eligibility read ↔ checkout/pickup/scheduled APIs | AS-02–11, AS-14–16, AS-24–40 |
| Concurrency | Stale async generation; revision conflicts; eligibility races; tab-scoped multi-tab | AS-16, AS-22, AS-27 |
| Recovery | PAYMENT_PENDING; cart_changed_unresolved; window expiry; open-Checkout reuse; missing evaluation evidence; empty-cart honesty | AS-11, AS-17, AS-18, AS-29–40 |
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
- Schedule Takeaway is not denied solely because outlet is closed NOW (AS-08 / AS-34 / GP-01)
- Checkout pickup-options must not remain accepting-now-only when Schedule path is active (AS-34)
- Checkout evaluate must not run for PICKUP between outlet bind and timing selection on the Schedule path (AS-34 / Contract C)
- Schedule-capable list merchandise check uses `ignoreCurrentScheduleDenial: true` parity (Contract C)
- AUTO_SELECT is per timing intent; never over Now∪Schedule union (AS-05 / AS-38)
- Now-eligible outlet with empty future windows recovers honestly; Now offered only if accepting-now eligible (AS-35 / AS-37)
- Invalid selected outlet forces reselect; no silent bind (AS-36 / AS-38)
- Checkout pickup-options error must not present permanent UNAVAILABLE without recovery (AS-33)
- Empty / no cart must not present brand-level “no outlets available” (AS-30)
- Proposed outlet alone does not unlock scheduled windows (AS-26)
- Domain enums unchanged in network payloads; no new lifecycle states
- Pre-checkout eligibility must not require fabricating a checkoutId
- Open-Checkout reuse conveys effective Checkout mode; Takeaway reuse without Delivery location (AS-29/AS-31/AS-40)
- Missing commercial-evaluation evidence with active Snapshot must not fall through to divergent browse money (AS-39)
- Presentation storage must not sync payable/seal across tabs (AS-22 / GP-04)

## Non-goals for this plan

- Re-proving entire payment provider matrix unless UOE touches prepare/pay UI copy only
- Claiming Founder UAT pass
- Substituting heuristics for automated proof where races matter
- Building Menu exact-slot preview API tests (deferred DR-02)

## Exit criteria (for a future authorized implementation)

- AS-01–40 mapped to automated and/or scripted Founder UAT evidence
- No invariant regressions listed in Architecture Fit
- Content QA sign-off on primary surfaces + WhatsApp / in-app
- X3 a11y/responsive QA recorded

**Formal plan finalization:** `NOT_PERFORMED`.
**Agent disposition:** `RECOMMENDED_READY_FOR_EVALUATION` as a reviewable candidate only (not RECOMMENDED_PASS).
