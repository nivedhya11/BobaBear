# Founder Functional and Experience UAT checklist

Wave: `BOBA-CORE-GTM-UAT-PREPARATION-20261024`. GitHub issue [nivedhya11/BobaBear#443](https://github.com/nivedhya11/BobaBear/issues/443).

The first draft of this checklist was wave `BOBA-CORE-GTM-INTEGRATION-20261024`, preparation pull request [#436](https://github.com/nivedhya11/BobaBear/pull/436). This revision corrects steps that asked for a confirmation, a catalog write, a coupon write, or a payment replay without a separate authorization. Record results only in [`FOUNDER_UAT_EXACT_CANDIDATE_WORKBOOK.md`](./FOUNDER_UAT_EXACT_CANDIDATE_WORKBOOK.md). Every Functional result and Experience result cell there starts blank.

```text
FOUNDER_UAT = NOT_PERFORMED
FUNCTIONAL_UAT = NOT_PERFORMED
EXPERIENCE_UAT = NOT_PERFORMED
FOUNDER_UAT = FUNCTIONAL_UAT + EXPERIENCE_UAT
FOUNDER_UAT_VERDICT_OWNER = HUMAN_FOUNDER
SIMULATED_TEST_RESULT_IS_NOT_A_FOUNDER_VERDICT = YES
AUTOMATED_TESTS = EVIDENCE_INPUT_ONLY
COMPLETE_AND_ACCEPTED = NOT_CLAIMED
DEPLOYMENT = NOT_PERFORMED
LIVE_PAYMENT = NOT_PERFORMED
UAT_SOURCE_HEAD = a6155378b799e06a95b28c593ac1a340d7ca9245
UAT_SOURCE_BRANCH = main
PRIOR_DRAFT_INTEGRATION_HEAD = dacc7b98491fc1b726771428e0d6944f51bf6291
PRIOR_DRAFT_INTEGRATION_HEAD_IS_UAT_SOURCE = NO
```

`dacc7b98491fc1b726771428e0d6944f51bf6291` is the previous draft integration HEAD. It is not the UAT source identity. This preparation branch is not the UAT source either. Founder staging, when a human Founder later authorizes it, is built from exact merged `main`.

Automated unit and component results are evidence input only. They do not fill a result cell. Only the human Founder writes a result, after running the row on the exact deployed candidate. This file does not deploy anything and does not grant a verdict.

## Proof layers

| Layer | Status for this preparation | What a later human run would show | Limit |
|---|---|---|---|
| Unit and component | The seven files under `tests/gtm-closure/` run inside `npm run test` (Vitest, jsdom). See the evidence-input section. | Semantic rules and accessible names in jsdom. | A human Founder result. A database proof. A browser proof. |
| Real database | `NOT_RUN` | PostgreSQL cart, checkout, coupon, and order behaviour. | Missing until a later authorized run. |
| Playwright / browser | `NOT_RUN` | Mobile and desktop journeys in a real browser. | jsdom is not a viewport proof. |
| Payment provider | `NOT_RUN` | A charge, capture, or webhook on an authorized test provider, or a zero-payable completion. | This checklist does not create one. |

`SKIPPED` is not a completed row. A database or Playwright job that does not run is missing evidence.

## Provenance

`HEAD` alone is not enough. The source identity below was verified on a clean tree at `origin/main` before this preparation commit. Recompute it on the tree that will actually be built, and stop if it differs. Runtime fields stay `NOT_DEPLOYED`. The UAT URL cell stays empty.

| Slot | Verified at preparation | Founder fills at UAT |
|---|---|---|
| Who runs the check | | |
| Source repository | `git@github.com:nivedhya11/bobabear-platform.git`. Verified worktree `/home/ajoshi/repos/boba-bear-uat-b-checklist` at the SHA below. Canonical checkout `/home/ajoshi/repos/boba-bear-platform` was occupied and was not switched. | |
| Branch | `main` | |
| HEAD | `a6155378b799e06a95b28c593ac1a340d7ca9245` (`origin/main`) | |
| WORKING_TREE_FINGERPRINT | `ac4bc828121ce13b8758f963f25187f537e3d79272d33e3995e3fc234c4f9353` from `npm run working-tree:fingerprint` on that clean tree. Algorithm `boba-bear-working-tree-fingerprint-v1`. | |
| Image name | `NOT_DEPLOYED` | |
| Image ID / digest | `NOT_DEPLOYED`. A Git SHA is not an image digest. | |
| Container identity | `NOT_DEPLOYED` | |
| Deployment health | `NOT_DEPLOYED` | |
| UAT URL | | |

The existing `boba-staging` Podman containers are classified in the workbook. They are not this candidate. Their image revision label is `5773dac4ce32e342b9f0d34f9ccb9099d1d8d15a`. Their state at inspection was `created`.

## Setup

Use one non-production candidate that matches the provenance table. Stop a row when the next action needs an authorization this sheet does not have.

1. Copy the provenance table into the workbook before any row. Leave Founder result cells blank.
2. Actors. `ACTOR-FOUNDER` is the human Founder. `ACTOR-OPERATOR` is blank until the Founder names the person who may perform authorized fixture writes. This sheet does not appoint that person.
3. Coupon issue, activation, and retire are writes. They wait for the owned-fixture block below. Reading an existing screen can be recorded. Changing current persistent Founder commercial data is outside this task.
4. Customer history. Record only the purchase history the product shows for that signed-in customer. If the product does not show it, leave the history blank. A prepared label such as first-order or returning is not a status.
5. Cart setup, after the candidate is the deployed exact tree: as the signed-in customer, add two distinct in-stock items. Record them as `ITEM_A` and `ITEM_B`. Leave both in the cart. Skip this until deployment exists.
6. Viewports for experience rows: one phone-width window (about 390px) and one desktop-width window.
7. Keyboard rows: use Tab, Enter, and Escape.
8. Payment rows stop before a provider effect unless the Founder has authorized a separate zero-payable path or a test-provider setup that cannot debit a live instrument. A provider intent, a second start, a replay, a capture, and a live card or live UPI are outside the default rows. The existing containers configure `BOBA_BEAR_PAYMENT_PROVIDER=razorpay`. Key mode was not read. Do not start payment on that runtime under this task.

### Owned UAT fixture for coupon writes

Issue, activate, and retire run only after this block is filled by the human Founder. This preparation leaves it blank and performs none of those writes.

| Precondition | Value |
|---|---|
| Fixture identifier | |
| Data owner | Human Founder |
| Write approval | |
| Approval time | |
| Scope | A new offer and codes created for this session |
| Dataset that stays unchanged | Current persistent Founder commercial data |
| Cleanup | |
| Cleanup owner | |

Suggested identifier shape, if the Founder chooses one: prefix `uat-443-` plus a unique suffix. Codes the customer would type stay 3 to 64 letters or digits. The same approval names cleanup (retire that fixture offer, or another end state the Founder owns) before the first issue.

When approval is blank, skip F-06, F-07, F-08, F-09, F-10, F-11, F-19, O-01, O-02, and O-03. Record `FIXTURE_APPROVAL_BLANK` in the workbook Actual cell.

### Real order, zero-payable, and unperformed payment

Three different situations. Do not collapse them into one confirmation.

| Path | When it may be run | What it produces |
|---|---|---|
| Offer visibility | Any time the exact candidate is deployed. Stop before payment start. | An observation of whether a first-order offer is shown. It does not create an order. |
| Real order | The payable is zero and the product completes an order on that path, or the Founder has authorized a test provider that cannot debit a live instrument. | An order number on the confirmation screen. |
| Unperformed payment | The row would charge, capture, or call the provider, including replay. | No order. Workbook note `STOPPED_BEFORE_PROVIDER_EFFECT`. History is unchanged. |

## Evidence input from automation

These commands and CI facts are evidence input. They are not Functional or Experience results.

Preparation command, unit and component layer only:

```bash
node scripts/run-vitest.mjs run tests/gtm-closure/accessible-names.test.tsx tests/gtm-closure/checkout-revalidation.test.ts tests/gtm-closure/coupon-journeys.test.ts tests/gtm-closure/first-returning-and-fulfilment.test.ts tests/gtm-closure/my-orders-historical-savings.test.ts tests/gtm-closure/operator-issue-activate-retire.test.tsx tests/gtm-closure/payment-start-recovery.test.ts
```

The same seven files are on the default `npm run test` include list (`vitest.config.mts` and `scripts/testing-inventory.mjs`). That is the Unit / component CI job.

| Journey | File | Layer |
|---|---|---|
| Coupon apply, invalid, expired, ineligible, remove | `tests/gtm-closure/coupon-journeys.test.ts` | Unit semantic |
| First-order eligibility, returning eligibility, delivery, takeaway, scheduled | `tests/gtm-closure/first-returning-and-fulfilment.test.ts` | Unit semantic. Purchase status in this file is a fixture input. It does not establish a customer's UAT history. |
| Review structural refusal, modifier identity, payable change, checkout block while invalid | `tests/gtm-closure/checkout-revalidation.test.ts` | Unit semantic |
| Payment-start fingerprint and idempotency conflict. No provider call | `tests/gtm-closure/payment-start-recovery.test.ts` | Unit semantic. This file does not authorize a UAT replay. |
| Order projection for delivery, takeaway, scheduled, sealed saving | `tests/gtm-closure/my-orders-historical-savings.test.ts` | Unit semantic |
| Operator code shape, activate gate, retire dialog | `tests/gtm-closure/operator-issue-activate-retire.test.tsx` | Unit semantic and component |
| Coupon names, one-line cart removal, pickup Choose Delivery, payment recovery regions | `tests/gtm-closure/accessible-names.test.tsx` | Component (jsdom) |

Record any command the Founder re-runs in the workbook evidence log. A later retry is not the original result.

## Functional checks

Do a later row that needs a cart or a coupon only after that cart or coupon exists. Actor, evidence, and both result cells are written in the workbook and start blank.

| ID | Evidence | Setup | What to do | Expected observation |
|---|---|---|---|---|
| F-01 | EV-F-01 | Signed-in customer. Copy the purchase history the product shows. Leave it blank when the product does not show it. | Look for a first-order offer. Stop before payment start, charge, and capture. | Record whether the offer is shown, refused, or absent, next to the history the product shows. This row does not create an order and does not assign a first-order or returning status. |
| F-01B | EV-F-01B | The real-order path in Setup: zero-payable completion, or a Founder-authorized test provider that cannot debit a live instrument. | Complete that path through confirmation. | Confirmation shows an order number only after that path completes. Copy the order number into Actual. |
| F-01C | EV-F-01C | A checkout that would otherwise continue into payment. | Stop before a provider call, charge, or capture. Leave live instruments unused. | Record the last BOBA screen. Actual note `STOPPED_BEFORE_PROVIDER_EFFECT` when the next action would call the provider. This attempt is unperformed payment. It is not an order and it does not change purchase history. |
| F-02 | EV-F-02 | A customer whose product-shown history already includes one successful direct purchase. If that history is absent, stop. | Open the prior purchase in My Orders. Start another order and look for the same first-order offer. Leave the prior purchase in place. | The prior purchase is visible. The first-order offer does not apply on the new order. If the history is absent, Actual is `PRIOR_PURCHASE_NOT_ESTABLISHED`. |
| F-03 | EV-F-03 | Cart with `ITEM_A` and `ITEM_B` | Choose Delivery. Enter a serviceable destination. Continue to Review. | Delivery asks for a destination. A delivery charge appears only when the accepted tariff has one. The destination is visible on Review. |
| F-04 | EV-F-04 | Same two items | Choose Takeaway. Select an eligible outlet if the candidate asks. Continue to Review. | Takeaway binds an outlet, does not ask for a delivery destination, and does not add a delivery charge. |
| F-05 | EV-F-05 | An outlet that has later windows | Choose a scheduled window. Also look at the ASAP choice. | The window comes from that outlet's hours, lead time, and closure. ASAP is presented separately from a scheduled window. |
| F-06 | EV-F-06 | `ACTOR-OPERATOR` on the authorized fixture. Approval filled. | Create the coupon offer. Leave it inactive. | Creation shows a draft offer. Customers cannot use it yet. The screen distinguishes the offer from a coupon code. |
| F-07 | EV-F-07 | That draft offer, same approval | Issue one code. Record it as `TEST_COUPON`. | The issued code is visible to the operator. It stays inactive until the activation row. |
| F-08 | EV-F-08 | Issued code, same approval | Activate the offer, then activate the coupon. Also issue and activate `TEST_COUPON_DELIVERY` (delivery only) and `TEST_COUPON_PICKUP` (pickup only) when those rows are in the same approval. | After both activations, the operator can see the code a customer types. A zero-issued or draft-only coupon is described as not ready for customers. |
| F-09 | EV-F-09 | Signed-in customer, cart, activated `TEST_COUPON` from the fixture | Apply `TEST_COUPON` on the cart. Open Checkout Review. | One code is applied. The saving is visible on the cart and the same state is visible on Review. |
| F-10 | EV-F-10 | Cart, fixture codes | Enter an unknown code. Then an expired code if the fixture includes one. Then apply `TEST_COUPON_DELIVERY` on Takeaway, and `TEST_COUPON_PICKUP` on Delivery. | Unknown, expired, and ineligible sentences stay distinct. No saving is applied. The mode-limited code names the mode it applies to. Another code can be tried afterward. |
| F-11 | EV-F-11 | Applied `TEST_COUPON` | Remove the coupon on the cart. Open Review again. | The coupon saving is gone from the cart and from Review. The items remain. |
| F-12 | EV-F-12 | Cart containing `ITEM_A` and `ITEM_B`. Unavailability comes from a controlled fixture, or from a commercial inventory change named in a separate Founder approval for that fixture. | Make only `ITEM_A` unavailable. Leave `ITEM_B` orderable. | `ITEM_B` stays in the cart. The explanation names `ITEM_A`. Checkout stays blocked while that evaluation is invalid. `ITEM_B` is still orderable. If the fixture approval is blank, leave the row blank and record `FIXTURE_OR_AUTHORIZATION_ABSENT`. Persistent Founder catalog and inventory stay unchanged. |
| F-13 | EV-F-13 | The invalid cart from F-12, same fixture | Remove or change only `ITEM_A`. Leave `ITEM_B`. | `ITEM_B` is still there. After the evaluation is valid again, checkout is no longer blocked for that reason. If pickup has no eligible outlet, Delivery can still be chosen, and a route back toward the cart is available. |
| F-14 | EV-F-14 | Valid cart and the coupon state from F-09 or F-11 | Open Checkout Review. Stop before payment start. | Review shows the cart's items, fulfilment, and coupon state. Pay is withheld while the offer on screen is stale. |
| F-15 | EV-F-15 | Review totals accepted. Live instruments stay unused. Provider replay stays unused. | Continue only while the next action stays inside BOBA. If the next action would create a provider order, payment, or capture, stop. | Record the last BOBA screen. A second provider effect is avoided because a second provider request is not sent. If the only continuation is a provider call, Actual is `STOPPED_BEFORE_PROVIDER_EFFECT`. |
| F-16 | EV-F-16 | A checkout whose price or structure changes before pay (change quantity, coupon, or fulfilment, then return). Do this on Review. Do not submit payment. | Continue from the screen that still shows the previous total, without sending a payment. | A real total change shows the new amount. An unchanged payable is shown as unchanged. The same displayed payable still shows a coupon, promotion, modifier, or fulfilment difference when one exists. Recovery, if shown, returns through Review. |
| F-17 | EV-F-17 | The same checkout as F-15 or F-16. | Do not submit the payment-start request again. Do not reuse an idempotency key against the provider. | Provider replay is unperformed. Unit-test fingerprint evidence stays in the evidence-input section. Actual is `REPLAY_NOT_SENT` unless the Founder has a separate written authorization to exercise idempotency on a test provider that cannot debit a live instrument. That authorization is blank in this preparation. |
| F-18 | EV-F-18 | Only the real-order path from F-01B. | Read the confirmation screen for that order. | Confirmation shows the order number, items, fulfilment, and purchased saving from that order. If F-01B was not run, Actual is `ORDER_NOT_ESTABLISHED`. |
| F-19 | EV-F-19 | The F-01B order, and retire only under the fixture cleanup approval. | Open My Orders and the order detail. Retire the fixture offer only when cleanup says so. | Detail still shows the purchased saving and the fulfilment from the snapshot. Delivery, takeaway, and a scheduled window match what was bought. Current persistent Founder offers stay in place. If no order exists, Actual is `ORDER_NOT_ESTABLISHED`. |
| F-20 | EV-F-20 | Review while a saving applies, on the authorized fixture or on a screen that already shows one. Change nothing about prices. | Read the item line amount and the Subtotal. Write both figures in Actual. | Gross/net presentation on this candidate is unchanged. Record the figures shown, including an unlabelled net item line beside a gross Subtotal. Issue #385 options A and B are not implemented. This row records the observation. It has no completion claim. |

## Operator checks

These rows are writes, except O-04's instruction to record the server result honestly. They use the owned fixture only.

| ID | Evidence | Setup | What to do | Expected observation |
|---|---|---|---|---|
| O-01 | EV-O-01 | `ACTOR-OPERATOR`, fixture approval filled | Issue a coupon on the fixture coupon offer. | The code the customer will type is separate from the offer identifier. Issuing it leaves the code inactive. |
| O-02 | EV-O-02 | Draft coupon on a draft or inactive fixture offer, then on an active fixture coupon offer | Try to activate the coupon before the offer is active. Then activate the offer and the coupon. | Activation waits until the offer is an active coupon offer. After activation, the operator can tell that customers can enter the code. |
| O-03 | EV-O-03 | The active fixture offer. Cleanup approval includes retire. | Open retire. Choose cancel. Open retire again and confirm. Then open an already purchased fixture order if F-01B produced one. | Cancel leaves the offer active. Confirm retires the fixture offer. Purchased orders keep their sealed savings. New orders do not receive the retired fixture offer. Offers outside the fixture stay in place. |
| O-04 | EV-O-04 | Fixture approval filled. | Create a promotion and record the HTTP result the product shows, including a failure. Keep a client-side identifier message separate from the server status. | If the server returns HTTP 500, Actual records HTTP 500. Client-side checks do not replace that status. If a rejecting identifier is not sent, Actual is `NOT_EXERCISED`. Issue #381 server mapping stays an open observation. This row has no completion claim. |

## Experience checks

Experience UAT covers discoverability, first impression, hesitation, clarity, trust, friction, recovery, content, mobile behaviour, brand coherence, and the approved experience intent. The Founder writes the Experience result in the workbook. A Functional result does not fill it.

| ID | Evidence | Setup | What to do | Expected observation |
|---|---|---|---|---|
| E-01 | EV-E-01 | Phone-width and desktop-width | Walk cart, Review, the payment stop in F-15, My Orders, and the promotions editor in both widths. | Controls fit the width. Text remains readable. The same coupon and cart state survive the width change. Keyboard reach is E-03. |
| E-02 | EV-E-02 | F-12 cart, same fixture limit | Read the unavailable-item explanation next to the lines. | The explanation is item-specific for `ITEM_A`. `ITEM_B` stays understandable and orderable. Raw error codes are absent. If F-12 was not run, leave this row blank. |
| E-03 | EV-E-03 | Keyboard only. Retire and cancel only on the authorized fixture. | Reach the coupon field, apply, change, remove, the cart remove control for one line, and, when the fixture approval includes it, retire and cancel. | Each control reached is reachable by keyboard and exposes its visible name. Removing one line leaves the other. Cancel leaves the fixture offer active. |
| E-04 | EV-E-04 | Invalid, expired, and ineligible coupons from the fixture | Read the three sentences. | They stay distinct. Counts of other customers, and other customers' activity, are absent. |
| E-05 | EV-E-05 | Payment recovery, if a previous checkout is already on screen. Do not create one with a live instrument. | Read the recovery screen. | The customer can see the previous checkout and the current cart, and can return to the cart. If no recovery screen exists, Actual is `NOT_SHOWN`. |
| E-06 | EV-E-06 | Operator promotions, before activate, on the fixture | Compare an automatic offer, a coupon offer with zero issued coupons, and a coupon offer with an active code. | Promotion versus coupon code is understandable. Zero issued coupons is presented as not ready for customers. |
| E-07 | EV-E-07 | The same Review screen as F-20 | Read the item line and the Subtotal in both viewports. | The customer can see both figures. Record any hesitation about which number is the price. Leave the Experience result blank for the Founder. Issue #385 stays an observation. |

## Still missing, and still recorded honestly

| Gap | Layer | How to record it |
|---|---|---|
| Full first-order and returning-order browser path through a real order | Playwright, and the F-01B path | Not run in this preparation. F-01 does not stand in for it. |
| Cart unavailability in the browser | Playwright, plus the F-12 fixture | Not run. Component tests do not attach a line problem to a named row. |
| Coupon create, issue, and activate over HTTP and PostgreSQL | Database, after fixture approval | Not run. Unit tests cover code shape and the activate/retire transition only. |
| Committed-cart coupon re-evaluation after a mode switch | Database | Not run. The pure evaluator covers one submitted code. |
| Payment start against a sealed snapshot, including selection order | Database | Not run. No provider. |
| Order materialization replay under concurrency | Database | Not run. `ALREADY_EXISTS` is named in the unit file only. |
| Mobile and desktop viewport projects | Playwright | Not run. |
| #385 gross/net presentation | Founder observation F-20 / E-07 | Unchanged on this candidate. Record the figures. Do not treat the row as closed. |
| #381 create-promotion HTTP 500 | Founder observation O-04 | Record the HTTP status actually returned. A client-side warning does not erase a 500. |
| #377 pre-location availability, #384B, UOE, and WXE | Separate scope | Not asserted as accepted behaviour. |

## Evidence log

Use the workbook log. One blank starter row:

| When | Who | Actor ID | Repository | Branch | HEAD | Fingerprint | Layer | Evidence ID | Command or screenshot | Expected | Actual |
|---|---|---|---|---|---|---|---|---|---|---|---|
| | | | | | | | | | | | |
