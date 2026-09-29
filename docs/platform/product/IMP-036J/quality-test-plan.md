<!-- governance-meta
{
  "status": "CANDIDATE",
  "authority": "NONE",
  "capability": "IMP-036J",
  "candidateId": "IMP-036J-QUALITY-CANDIDATE-1",
  "testingPolicy": "TEST-1",
  "qualityTestPlanFinalized": "NO"
}
-->

# IMP-036J — Quality and test plan candidate

```text
CANDIDATE_ID = IMP-036J-QUALITY-CANDIDATE-1
STATUS = CANDIDATE
AUTHORITY = NONE
CAPABILITY = IMP-036J
POLICY = TEST-1
QUALITY_TEST_PLAN_FINALIZED = NO
PROOF_EXECUTED = NO
FOUNDER_UAT_REQUIRED = YES
FOUNDER_UAT = NOT_STARTED
DESIGN_READINESS = NOT_PERFORMED
IMPLEMENTATION_AUTHORIZED = NO
```

This is planned proof for the approved Product Definition, the approved Experience Definition, the
locked capability architecture, and `IMP-036J-DESIGN-CANDIDATE-1`. It is not executed evidence.
Passing this plan later does not accept IMP-036J.

Architecture section 30 remains the fit proof sketch. This candidate is the PD-2 Quality/Test
Plan candidate. It does not replace TEST-1 and does not add a layer outside TEST-1.

Evidence column for every row is `NOT_EXECUTED`. Candidate evidence expected later is a named
test or browser check on an implementation candidate, with command, result, and provenance.
No row below is that evidence.

## 1. How to read a row

| Column | Meaning |
|---|---|
| Story / AC / XR | Product or experience identifier. Semantics are unchanged |
| Risk | Why this proof exists |
| Layers | TEST-1 layers that apply. A layer omitted here is `N/A` for that row because a listed layer already covers the observable result, or the row says why |
| Planned check | What a later implementation run must show |
| Real dependency | What cannot be replaced if the claim needs it |
| Substitute | Allowed controlled stand-in |
| Negative evidence | The denial, absence, or non-effect that must also be shown |

Layers used only when they prove something the story actually risks: unit, component,
domain/use-case, integration, database integration, HTTP/API contract, authorization/security,
concurrency, recovery/idempotency, accessibility, real browser/E2E, Golden Journey regression,
Founder UAT later.

## 2. Mandatory acceptance scenarios

| Story | AC | Risk | Layers | Planned check | Real dependency | Substitute | Negative evidence |
|---|---|---|---|---|---|---|---|
| `US-036J-001` | `AC-036J-001-01` | Money shown matches the automatic saving | Domain, component, browser | Qualifying cart shows `COPY-APPLIED-AUTO` or the reason sentence, and the order-saving row equals the evaluated merchandise effect | Evaluation result | Fixture promotion in the test database | A client-side discount that was not in the quote is absent |
| `US-036J-001` | `AC-036J-001-02` | Out-of-window offer is not promised | Domain, browser | Outside-window offer does not appear as a saving or a progress line | Promotion window clock in the command | Frozen test clock | No apology copy and no strikethrough price |
| `US-036J-002` | `AC-036J-002-01` | Coupon selected and saving visible | Domain, HTTP, component, browser | Apply stores one code and the lower payable result shows `COPY-APPLIED-COUPON` | Cart coupon route | None for the route contract | Payment has no apply control |
| `US-036J-002` | `AC-036J-002-02` | Invalid code is not a saving | HTTP, component, browser | Unknown text does not write a code and shows `COPY-INVALID` | Coupon lookup | Fixture | Response text does not say a near-match exists |
| `US-036J-002` | `AC-036J-002-03` | Remove drops the coupon effect | Domain, HTTP, browser | After remove, the total no longer includes that coupon-backed Offer | Cart remove route | None | Local clear before server success is not shown |
| `US-036J-002` | `AC-036J-002-04` | Identity retry keeps the attempt | HTTP, integration, browser, accessibility | Guest identity-required code asks for sign-in; after auth the same code is retried; focus lands on the result | Existing customer auth and `claimGuestCart` | Test identity, not a second auth system | Another customer's orders are absent |
| `US-036J-002` | `AC-036J-002-05` | Guest unrestricted coupon still competes | Domain, HTTP, browser | Missing identity does not reject an unrestricted coupon. A strictly better non-coupon result uses `COPY-STRICT-KEEP`. Equal payable uses the equal-payable sentences | Cart credential | Guest fixture | First-order and personal-cap coupons still take the sign-in path |
| `US-036J-002` | `AC-036J-002-06` | One shared state | HTTP, browser | Code entered on Cart is the Review code and the same total | One `manual_coupon_code` | None | Review does not post a second code column |
| `US-036J-002` | `AC-036J-002-07` | First entry on Review | HTTP, browser | First apply on Review writes the cart code and updates that evaluation | Same routes | None | A Review-only coupon store is absent |
| `US-036J-002` | `AC-036J-002-08` | Review change and remove recompute | HTTP, browser | Replace and remove on Review change the shared state and the stack | Same routes | None | The previous code does not remain after a successful replace |
| `US-036J-002` | `AC-036J-002-09` | Payment is read-only | Component, browser, accessibility | Payment summary has no coupon field, Apply, Change, or Remove in the tab order | `PaymentPanel` | None | Hidden-but-focusable controls are absent |
| `US-036J-002` | `AC-036J-002-10` | Incomplete mutation keeps state | Recovery, component, browser | Dropped apply, replace, or remove leaves the previous code and total and shows `COPY-RETRY` | Fault injection on the coupon request | Stubbed network failure | No false applied banner and no optimistic total |
| `US-036J-003` | `AC-036J-003-01` | Progress is the authoritative gap | Domain, component | `COPY-THRESHOLD` uses server paise and server benefit text. Client does not subtract | Progress projection | Fixture quote | Quantity-only gap renders no rupee sentence |
| `US-036J-003` | `AC-036J-003-02` | Cross and drop | Domain, browser | Saving replaces progress while the minimum holds; `COPY-DROPPED` appears when it does not | Cart mutation then evaluate | Fixture | Stale saving row does not remain |
| `US-036J-004` | `AC-036J-004-01` | Breakdown integrity | Domain, component, browser | Order saving, real delivery saving, total saved, and payable are one result. Total saved equals the components | Quote explanation | Fixture | Standing ₹0 delivery does not add a second saving |
| `US-036J-005` | `AC-036J-005-01` | First order eligible | Domain, database | Authenticated customer with no successful direct purchase can receive the Offer. Failed or abandoned payment does not consume it | Predicate and purchase guard | Fixture customers | A customer boolean column is absent |
| `US-036J-005` | `AC-036J-005-02` | Prior success stays ineligible | Domain, database | Cancelled or refunded successful purchase stays ineligible | Predicate | Fixture order and payment | Copy does not narrate that history |
| `US-036J-006` | `AC-036J-006-01` | Mode eligibility | Domain, browser | Delivery-only Offer is absent on pickup and the reverse. A submitted code uses the inapplicable sentence and the allowed mode clause | Fulfilment on the quote | Fixture | Pickup does not show a delivery saving |
| `US-036J-006` | `AC-036J-006-02` | Scheduled timing consumed | Domain, integration | Eligibility reads accepted scheduled timing. Changing timing recomputes before pay | IMP-036I timing commands | Fixture slot | No new scheduled-product label |
| `US-036J-007` | `AC-036J-007-01` | Distinct limit sentences | Domain, component, browser, content | Invalid, expired, inapplicable, global exhaustion, and personal exhaustion render five different sentences | Reason class on the quote | One fixture per class | They are not collapsed into `COPY-INVALID`. Counts and other customers are absent |
| `US-036J-008` | `AC-036J-008-01` | Stale offer cannot be paid | Integration, recovery, browser | Retire or otherwise invalidate after Review. Prepare does not bind the old total. Review shows `COPY-STALE` and the new amount | `prepareCheckoutForPayment` | Fixture mutation between review and pay | Payment page has no coupon editor |
| `US-036J-009` | `AC-036J-009-01` | Better non-coupon pair remains | Domain, browser | The approved ₹80 plus ₹40 pair remains against an exclusive ₹90 coupon. Copy is `COPY-STRICT-KEEP` | `selectBestCandidate` | Fixture amounts | Customer is not charged the worse combination |
| `US-036J-009` | `AC-036J-009-02` | Coupon pair wins | Domain, browser | The approved ₹90 plus ₹20 pair beats an exclusive ₹100 Offer. Saving is explained | Same selector | Fixture | Merchandise saving alone is not the comparison |
| `US-036J-009` | `AC-036J-009-03` | Winning merchandise coupon keeps delivery | Domain, component | Both rows show. No second merchandise slot and no second coupon | Same | Fixture | A second order-saving row is absent |
| `US-036J-009` | `AC-036J-009-04` | Delivery coupon stays in the delivery slot | Domain, component | One delivery incentive. No extra order-saving row from that coupon | Same | Fixture | A second delivery-saving row is absent |
| `US-036J-010` | `AC-036J-010-01` | Compatible stack | Domain, browser | One primary Offer and one delivery incentive both show when both effects are real | Same | Fixture | A second primary or second delivery incentive is absent |
| `US-036J-010` | `AC-036J-010-02` | BOGO does not stack | Domain | Only the better merchandise outcome shows. A real compatible delivery saving may still show | Same | Fixture BOGO | A second item discount is absent |
| `US-036J-010` | `AC-036J-010-03` | Best combination only | Domain | Discarded candidates are not rendered | Same | Multiple fixtures | Incompatible combination is not applied |
| `US-036J-010` | `AC-036J-010-04` | Standing free delivery | Domain, component | Delivery stays ₹0 with no delivery-saving row when the tariff was already zero | Tariff plus waiver | Fixture | Fabricated previous charge is absent |
| `US-036J-011` | `AC-036J-011-01` | Purchased savings stay | Database, HTTP, browser | After retire, order detail still shows the sealed saving and does not call live evaluation | Snapshot read | Purchased fixture | Live display name changes do not rewrite the sealed amounts |
| `US-036J-012` | `AC-036J-012-01` | Operator activates on the existing surface | HTTP, authorization, browser | Authorized operator configures and activates. Redemption counts are visible without customer identifiers | `promotions.activate` | Workforce fixture | A second admin app is absent |
| `US-036J-012` | `AC-036J-012-02` | Invalid configuration and denial | HTTP, authorization, component | Invalid activate leaves the draft and names the field. Out-of-scope retire or activate is denied and writes nothing | Existing brand scope | Two workforce fixtures | Client-supplied role does not authorize |
| `US-036J-012` | `AC-036J-012-03` | Retire confirm and cancel | Component, browser, accessibility | Cancel leaves Active. Confirm retires, shows `COPY-OP-RETIRED`, and purchased orders keep sealed savings | `retirePromotion` | Fixture | Silent retire is absent |
| `US-036J-012` | `AC-036J-012-04` | Complimentary authoring | Domain, HTTP, authorization | One complete variant activates. A bundle or a required or positive-price modifier choice is rejected with `COPY-OP-GIFT-INVALID` | Catalog publication read | Fixture variant | A gift catalogue control is absent |
| `US-036J-012` | `AC-036J-012-05` | Sequential second activation | Database, HTTP | While one complimentary Offer is active, the second activation is rejected and the first stays the only active one | Partial unique index | Two drafts | The UI does not show success |
| `US-036J-012` | `AC-036J-012-06` | Concurrent activation | Concurrency, database | Two overlapping activations settle with at most one ACTIVE complimentary Offer. The loser returns non-success and `COPY-OP-RACE` | Two real transactions | None. Sequential calls are not this proof | False success and a customer gift choice are absent |
| `US-036J-013` | `AC-036J-013-01` | Complimentary line | Domain, HTTP, browser | Exact variant, quantity 1, ₹0 merchandise, `COPY-INCLUDED`, no picker. Equal payable still selects this combination | Quote projection | Fixture item | Customer variant controls are absent on that line |
| `US-036J-013` | `AC-036J-013-02` | Purchased complimentary line | Database, browser | After retire, detail still shows that line at no extra merchandise charge | Snapshot line origin | Purchased fixture | Live evaluation does not remove it |
| `US-036J-013` | `AC-036J-013-03` | Unavailable before pay | Integration, recovery, browser | Availability loss drops the Offer, shows `COPY-GIFT-GONE`, recomputes, and stays on Review | `resolveOutletVariantAvailability` | Fixture unavailable variant | No substitute item |
| `US-036J-013` | `AC-036J-013-04` | Competing complimentary items | Domain, browser | Neither item is shown. `COPY-GIFT-CONFLICT` appears only if a line had already been shown | `NONE_CHOSEN` path | Two qualifying fixtures | A picker is absent |

`MANDATORY_AC_COUNT = 40`. Every AC from `AC-036J-001-01` through `AC-036J-013-04` is in the table.

`QUALITY_PLAN_COVERS_ALL_MANDATORY_AC = YES`.

## 3. Experience requirements

| XR | Risk | Layers | Planned check | Negative evidence |
|---|---|---|---|---|
| `XR-IMP-036J-001` | Automatic value is understandable | Component, browser, content | Applied sentence and saving, no activate control, no engine word | "Promotion candidate" and class tokens are absent |
| `XR-IMP-036J-002` | One coupon state and distinct failures | HTTP, component, browser, accessibility | Cart and Review share results. Payment does not mutate | A third coupon surface is absent |
| `XR-IMP-036J-003` | Threshold honesty | Domain, component, browser | Progress, replace, and drop use the server gap | Invented gap is absent |
| `XR-IMP-036J-004` | No duplicate saving | Domain, component, browser | Components equal total saved. Standing ₹0 adds nothing | A second delivery credit is absent |
| `XR-IMP-036J-005` | Equal payable is not a better price | Component, browser, content | Three sentences match the three server classes and are not swapped | "Better" is absent on equal amounts |
| `XR-IMP-036J-006` | One no-choice included item | Component, browser | Item row plus a real delivery saving when present | Carousel and picker are absent |
| `XR-IMP-036J-007` | Stale pay stops | Integration, browser, accessibility | Focus moves to the Review explanation and the new total | Pay on the old amount is absent |
| `XR-IMP-036J-008` | Purchased explanation | Browser, content | Confirmation and detail match the sealed split and the included line | A live progress line is absent |
| `XR-IMP-036J-009` | Operator truthfulness | Component, authorization, concurrency, browser | Existing editor covers authoring, denial, and non-success | A success badge on a lost race is absent |
| `XR-IMP-036J-010` | Mobile and keyboard | Accessibility, browser | Narrow cart sticky total, Review order, focus rules in the design candidate, non-colour status | Total only below the fold is absent on the cart |
| `XR-IMP-036J-011` | Privacy of failure copy | Component, content, security | Coarse sentences only | Near-match, cap size, and other customers' facts are absent |
| `XR-IMP-036J-012` | Eligibility without a lecture | Component, browser, content | First-order absence and mode clause only | Pickup delivery saving is absent |
| `XR-IMP-036J-013` | Complimentary tie presentation | Component, content | Included line, ₹0, no better-price sentence | A coupon-won sentence is absent |

`QUALITY_PLAN_COVERS_ALL_XR = YES`.

Content QA for every finalized string in the design candidate is a component or browser assertion of the exact sentence plus a check that the forbidden words in that candidate are absent. `CONTENT_QA_PLANNED = YES`.

## 4. CR2 risk proof

### Money and commercial rules

Domain proof covers exact payable, both-apply, caps at the boundary (last unit allowed, one past the cap refused), threshold just below and just at the minimum, coupon versus non-coupon selection, equal-payable both ways, and purchased totals that still match the snapshot after live edits.

Browser proof covers the customer-visible half of those results on Cart, Review, Payment, confirmation, and detail.

### Authorization, privacy, and scope

| Check | Layers | Negative evidence |
|---|---|---|
| `promotions.read`, `promotions.manage`, `promotions.activate`, `coupons.manage`, `coupons.read` allow the matching operator action | Authorization, HTTP | Missing key writes nothing |
| Cross-brand route | Authorization, HTTP | Other brand is unchanged |
| Guest versus authenticated customer | HTTP, domain | Unrestricted guest coupon works. Identity-only rules do not |
| Customer route rejects a workforce principal as the customer | Authorization | No customer mutation from that principal |
| Explanation and inspect counts | HTTP | No other customer's id, no raw coupon in audit metadata, no remaining global count on the customer screen |

### Persistence

Database integration on real PostgreSQL, not an in-memory double:

- Promotion and coupon status changes survive reload.
- New columns and the partial unique index reject a second active complimentary row.
- Snapshot lines and effects for a purchased order stay unchanged when the live Offer is edited or retired.
- `source_cart_line_id` nullability and `line_origin` accept a complimentary line and still require a source on a cart line.
- The composite snapshot-line foreign key rejects a line from another snapshot.
- Migration forward-only from the pre-change schema loads historical snapshots without rewriting them.

`DATABASE_PROOF_PLANNED = YES`.

### Concurrency

Real overlapping transactions, not sequential calls:

| Race | Required result |
|---|---|
| Two complimentary activations | At most one ACTIVE. Loser is non-success. Audit row of the loser is not committed |
| Last global cap unit | One `RESERVED` claim fits. The other rolls back only its payment transaction |
| Per-customer cap | Same, without another customer's count in the response |
| First-order guard | One active guard for one customer, including a primary plus delivery pair |
| Duplicate coupon submit | One `manual_coupon_code` |
| Payment retry after `RELEASED` | One new reserved set, not a second consumption of the released attempt |
| Complimentary unavailable at prepare | Recompute without a substitute |
| Measurement head first insert | One head. Presentation sequence stays before the payment sequence when pay carries the receipt |

`CONCURRENCY_PROOF_PLANNED = YES`.

### Recovery and idempotency

| Case | Required result |
|---|---|
| Retry after a dropped coupon request | Previous state, then one successful mutation |
| Duplicate pay or duplicate presentation acknowledgement | Existing payment or existing presented event. No second denominator |
| Stale checkout | Review recovery, old amount not payable |
| Interrupted evaluation | No saving painted from the incomplete response |
| Reload | Committed cart code returns |
| Sign-in return | Same code retried, or the re-enter sentence when continuity did not keep it |
| Order materialization replay | One completion event |

`RECOVERY_PROOF_PLANNED = YES`.

### Security and abuse

`CR2_SECURITY_ABUSE_REVIEW_PLANNED = YES`.

| Threat | Planned negative evidence |
|---|---|
| Replay of coupon apply, pay, presentation acknowledgement, and activation | One durable effect |
| Enumeration | Invalid copy and HTTP body do not reveal neighbouring codes |
| Forgery of a presentation receipt, revision, or role | Unknown receipt writes no event. Wrong `expectedPromotionRevision` writes nothing. Client role is ignored |
| Cap bypass | Concurrent proof above. No client-supplied remaining count |
| Unauthorized operator mutation | Denial proof above |
| Financial abuse | Customer cannot choose the discarded combination or pay the stale total |
| Information leakage | Analytics and explanation proofs below |

### Measurement proof

Implementation tests, not this candidate's runs, must show:

- A presented Review writes one `CHECKOUT_REVIEW_PRESENTED` for one receipt.
- A repaint does not.
- The same journey key survives cart edit, coupon change, fulfilment change, stale recovery, and payment-driven expiry.
- Explicit cancel and successful completion mint a new key on the next attempt.
- One completion per key, written in order materialization, not on payment success alone.
- Duplicate events do not allocate a second sequence.
- Event rows contain no coupon text, customer id, name, email, or phone.
- Cohort and snapshot formulas in the measurement candidate are pure functions of those rows.

### Experience proof

Accessibility, responsive, content, and perceived-performance checks are the XR rows plus:

- Keyboard order and focus moves named in the design candidate, including dialog trap and cancel-first retire focus.
- Viewports below `lg` and at `lg` for cart, Review, and the editor.
- Updating and checking states never show a new total before the response.
- Status text remains when `prefers-reduced-motion` is set.

`ACCESSIBILITY_PROOF_PLANNED = YES`.

`RESPONSIVE_PROOF_PLANNED = YES`.

`REAL_BROWSER_PROOF_PLANNED = YES`.

## 5. Golden Journeys

The Product Definition names `GJ-FIRST-ORDER` and `GJ-RETURNING-ORDER`. It does not create a new journey identifier. This plan does not invent one.

| Journey | Registry status today | Required regression |
|---|---|---|
| `GJ-FIRST-ORDER` | `CURRENT` | The accepted discover-to-pay path still completes. On that path the new explanation and pre-payment revalidation are visible. Browser payment success still does not, by itself, create the Order. Non-offer steps stay the journey's existing steps |
| `GJ-RETURNING-ORDER` | `PARTIAL` | A returning customer can still reach a direct order, does not receive a first-order Offer, and sees purchased history for a prior order. This plan does not add an Order Again shortcut |

Where it executes later: a real browser against the integrated application and PostgreSQL, on the implementation candidate. Nightly or release cadence may hold the broad rerun only when the candidate's own acceptance evidence still includes one real-browser pass of each required journey. A page assertion is not the journey.

`GOLDEN_JOURNEY_REGRESSION_PLANNED = YES`.

## 6. Founder UAT

```text
FOUNDER_UAT_REQUIRED = YES
FOUNDER_UAT = NOT_STARTED
FOUNDER_EXPERIENCE_UAT = NOT_PERFORMED
```

Reason: the capability will change customer-visible savings and operator-visible commercial operation. Functional UAT and experience UAT are both later. This candidate does not deploy a candidate and does not record a verdict.

Later experience UAT looks at discoverability, first impression, hesitation, clarity, trust, friction, recovery, content, mobile behaviour, brand coherence, and the approved Experience Intent. Only the Founder supplies that verdict.

## 7. N/A layers

| Layer | When it is N/A |
|---|---|
| Unit | A row whose risk is only a cross-module or browser result. Pure selector and predicate rows are not N/A |
| Component | A row that has no rendered UI, such as the purchase-guard predicate alone |
| Database | A copy-only component row with no durable state |
| Concurrency | A row with no race in the locked architecture |
| Golden Journey | Operator-only rows. They still need browser proof of the editor |
| Founder UAT | Not a per-AC execution in this plan. It remains required for the capability later |

## 8. Coverage flags

```text
QUALITY_PLAN_COVERS_ALL_MANDATORY_AC = YES
QUALITY_PLAN_COVERS_ALL_XR = YES
CR2_SECURITY_ABUSE_REVIEW_PLANNED = YES
CONCURRENCY_PROOF_PLANNED = YES
DATABASE_PROOF_PLANNED = YES
REAL_BROWSER_PROOF_PLANNED = YES
ACCESSIBILITY_PROOF_PLANNED = YES
CONTENT_QA_PLANNED = YES
PROOF_EXECUTED = NO
FOUNDER_UAT = NOT_STARTED
```
