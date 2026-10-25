# Quality and Measurement impact

```text
STATUS = NON_AUTHORITATIVE_IMPACT_ADDENDUM
AUTHORITY = NONE
REWRITES_PR_463 = NO
QUALITY_CANDIDATE = IMP-036K-QUALITY-CANDIDATE-2 at fd117572264981960182d3f44763f7260215ea87
MEASUREMENT_CANDIDATE = IMP-036K-MEASUREMENT-CANDIDATE-2 at the same commit
FORMAL_GATE = NOT_AUTHORIZED
```

## 1. What Quality Candidate 2 already covers

Verified on PR #463. The candidate's own status is `AUTHORITY = NONE` and not finalized.

- 13 stories, 63 acceptance scenarios, 62 mandatory YES, one mandatory NO (`AC-036K-013-01`).
- 16 experience requirements, `XR-IMP-036K-001` through `XR-IMP-036K-016`.
- Golden Journeys `GJ-FIRST-ORDER`, `GJ-AVAILABILITY`, `GJ-PRODUCT-MENU-LAUNCH`, and
  `GJ-PAYMENT-RECOVERY` stay mapped.
- Holdout inactive. `AC-036K-013-01` is fixture readiness, not live activation.
- Ordering session binds only to an existing guest-cart credential or active brand cart.
- Activated holdout uses mechanism 2: no established session means no enrollment and no module.
- A neutral ordering-session row is not written for a pre-cart guest.
- `recommendationReadId` replay is owner-scoped. A pre-cart guest has no such owner, so a lost
  GET is not replayed by id alone.
- Durable pre-cart correlation is named as `MD-036K-008` and is not proved by inventing a
  credential inside that candidate.

## 2. What Measurement Candidate 2 already covers

- `EXISTING_ANONYMOUS_COMMERCE_SESSION = NOT_FOUND`.
- `NEW_RECOMMENDATION_CREDENTIAL = NO`.
- `HOLDOUT_MECHANISM = ARCHITECTURE_7_14_MECHANISM_2`.
- `PRE_CART_GUEST_DURABLE_BINDING = DECISION_REQUIRED` as `MD-036K-008`.
- `PRE_CART_IMPLEMENTATION_AND_COLLECTION = PROHIBITED` until a Founder decision.
- Product Detail complements remain `US-036K-001`.
- No current cart token, auth session, or location token survives a pre-cart read, a reload,
  and later cart creation.
- Assisted purchase still requires the §7.12 seven proofs. View-through stays out.
- Inactive configuration writes no experiment assignment. A neutral session row may exist only
  for a caller the server can authorize again.

The sentence "no guest session is invented" does not appear verbatim. The prohibitions above
are the contract.

## 3. Statements that change if `B3S-M1` is authorized

These are proposed deltas to Candidate 2. They are not edits to PR #463.

| Candidate 2 statement | Under authorized `B3S-M1` |
|---|---|
| `NEW_RECOMMENDATION_CREDENTIAL = NO` | Becomes YES only if the Founder and Architecture Fit accept a purpose-limited ordering-journey secret. Whether that secret is a customer identity, authentication, or cart authority is undecided |
| `HOLDOUT_MECHANISM = ARCHITECTURE_7_14_MECHANISM_2` | Pre-cart guest path uses mechanism 1. Cart-bound reads reuse the assignment already written for that journey |
| `PRE_CART_IMPLEMENTATION_AND_COLLECTION = PROHIBITED` | Collection of the journey hash, issued set, and observations becomes allowed only for that credential. Empty carts, cookies, and customer-id keys stay prohibited |
| `MD-036K-008` unanswered | Answered by the Founder decision, not by a silent plan edit |
| "There is no pre-cart session to merge" | A bound journey id can already exist at claim. Claim still must not roll an arm |
| `recommendationReadId` has no pre-cart owner | The journey credential is the replay owner before a cart exists. Another caller presenting only the id still receives nothing |
| Durable `SET_ISSUED` only when a cart principal exists | `SET_ISSUED` may be recorded for a qualifying pre-cart set bound to the journey |
| A previously exposed session is not enrolled, and ordinary recommendation operation may continue | Locked §8 returns no module when an activated holdout has no assignment. `B3S-M1` must not enroll that session. The experiment-count label for that session stays unresolved. This addendum does not adopt Candidate 2's continue-without-enrollment behavior over the locked read path |

Locked Product and Experience text can stay if the credential is not described to the customer
as personalization and ignore still adds nothing. The locked architecture cannot stay unchanged:
§7.7's read principal has to grow. That is the amendment, not a Measurement Plan footnote.

Option 3 would instead change `US-036K-001`, the Product Detail ready state, and the Experience
journey that starts on Product Detail. That is a product-contract change. It is not recommended
and it is not made here.

Option 2 would change the durable-owner rule for `SET_ISSUED` while leaving mechanism 2 in
place. Holdout continuity across a later cart would remain unmet.

## 4. New oracles required for `B3S-M1`

Add these to a future Quality revision after the decision. Do not treat them as executed proof.

- Mint failure omits the module and leaves the primary action, keyboard focus, and payment
  retry usable (`XR-IMP-036K-005`, `XR-IMP-036K-007`, `XR-IMP-036K-013`).
- The same journey id is stable across Product Detail reload and a first add that presents the
  journey header. Claim continuity of that id is unresolved and is not an oracle yet.
- Lost-GET replay succeeds only for that journey credential. Another caller with only the id
  receives nothing.
- Ignore writes no recommendation unit and no mark.
- The raw secret is absent from customer copy and from analytics payloads (`AC-036K-001-04`,
  `XR-IMP-036K-015`, `XR-IMP-036K-016`).
- A fixture-activated holdout commits the assignment before the first response that can contain
  a set, and does not enroll a journey that was already exposed.
- Reconcile writes no new arm. Unit-mark survival and issued-set reparenting have no expected
  value until they are decided.
- `GJ-FIRST-ORDER` completes when the pre-cart module is present, empty, failed, or held out.
- `GJ-PAYMENT-RECOVERY` stays reachable when mint or measurement persistence fails.

Existing cart-bound oracles in Quality Candidate 2 for ceiling, empty cart, owner-scoped replay
after a cart exists, no retroactive enrollment, and fail-open payment remain necessary.

## 5. Decisions that can stay deferred

| ID | Intent | Why it can wait |
|---|---|---|
| `MD-036K-001` | Civil-day length of the observation window | No windowed report is authorized |
| `MD-036K-002` | IANA timezone of that window | Same |
| `MD-036K-003` | Retention of measurement rows, unused assignment rows, and purchased-order assignment facts | Journey TTL reuse of the existing cart TTL is not this retention promise |
| `MD-036K-004` | Whether to activate the approximate 10% holdout | `AC-036K-013-01` stays mandatory NO. `B3S-M1` only makes a later activation sequenced |
| `MD-036K-005` | Contribution or gross-profit projection | No authoritative field exists |
| `MD-036K-007` | Numeric success target | Currently none. Do not invent one |
| Analytics vendor | Candidate 2 and the architecture set none | Encoding can wait |
| Rate-limit number | Application throttle is required before implementation | The existence of a throttle is in the design. The number is operability |
| Experiment count for merged carts | Exclude versus suppress-without-a-new-arm | The experiment-count label stays unresolved. This deferral does not decide the customer-visible result. Locked §8 returns no module when an activated holdout has no assignment, and the two count labels are not one customer-visible result |

## 6. What blocks formal plan finalization

`MD-036K-008` is the blocker this batch puts in front of the Founder. Finalizing Candidate 2
as written would lock mechanism 2 and leave first-visit Product Detail without a durable issued
set. Finalizing a plan that assumes `B3S-M1` before the Founder decision and before Architecture
Fit on the amendment would lock a credential the locked architecture has not accepted.

Also still blocking, and not solved by this decision:

- Independent Quality review is not a formal grant.
- `MD-036K-006` independent Measurement review is not performed.
- Both candidates set their finalized flags to NO.
- Implementation authorization remains NO.

`MD-036K-001` through `MD-036K-008` stay visible. Only `MD-036K-008` is the identity decision.
The others stay deferred on purpose.
