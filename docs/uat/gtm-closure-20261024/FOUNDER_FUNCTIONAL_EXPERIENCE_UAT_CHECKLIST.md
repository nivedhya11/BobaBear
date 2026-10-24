# Founder Functional and Experience UAT checklist

Wave: `BOBA-CORE-GTM-INTEGRATION-20261024`. Preparation pull request: [#436](https://github.com/nivedhya11/BobaBear/pull/436).

This checklist is the one human procedure for this wave. It prepares Founder UAT. It does not perform it.

```text
FOUNDER_UAT = NOT_PERFORMED
FOUNDER_UAT = FUNCTIONAL_UAT + EXPERIENCE_UAT
FOUNDER_UAT_VERDICT_OWNER = HUMAN_FOUNDER
SIMULATED_TEST_PASS != FOUNDER_UAT_PASS
AUTOMATED_TESTS = EVIDENCE_INPUT_ONLY
COMPLETE_AND_ACCEPTED = NOT_CLAIMED
DEPLOYMENT = NOT_PERFORMED
LIVE_PAYMENT = NOT_PERFORMED
```

Automated unit and component results are evidence input only. They do not fill the Verdict column. Leave every Verdict cell blank. Do not pre-fill PASS. Only the human Founder writes a verdict, after running the row on the exact candidate.

## Proof layers

| Layer | Status for this preparation | What a pass would mean | What it does not mean |
|---|---|---|---|
| Unit and component | The seven files under `tests/gtm-closure/` run inside `npm run test` (Vitest, jsdom). See the evidence-input section. | Semantic rules and accessible names in jsdom. | A human Founder verdict. A database proof. A browser proof. |
| Real database | `NOT_RUN` | PostgreSQL cart, checkout, coupon, and order behaviour. | Not claimed. |
| Playwright / browser | `NOT_RUN` | Mobile and desktop journeys in a real browser. | Not claimed. jsdom is not a viewport proof. |
| Payment provider | `NOT_RUN` | A live or test-mode charge, capture, or webhook. | Not claimed. Do not create one while following this checklist. |

`SKIPPED` is not a pass. A database or Playwright job that does not run is missing evidence.

## Provenance the Founder fills first

`HEAD` alone is not enough. Do not deploy this preparation branch as Founder UAT. Founder staging, when later authorized, is merged `main` only, built from that exact merged tree. This file does not deploy anything.

| Slot | Expected | Actual |
|---|---|---|
| Who ran the check | Human Founder | |
| Canonical repository path | The candidate under test. Preparation worktree was `/home/ajoshi/repos/boba-bear-gtm-f-qa`. | |
| Branch | The candidate branch. Preparation branch is `test/gtm-functional-acceptance`. | |
| HEAD | Full SHA of the candidate | |
| WORKING_TREE_FINGERPRINT | `npm run working-tree:fingerprint` on that candidate | |
| Deployment URL | Blank until a later authorized staging deploy. This preparation has no URL. | |

## Setup

Use one non-production candidate. Stop a row rather than improvising a live charge.

1. Write the provenance table above before any row.
2. Operator setup, on the candidate's administration promotions surface, as an authorized operator:
   - Create one coupon offer and issue one code the customer will type. Use 3 to 64 letters or digits. Record it as `TEST_COUPON`.
   - Activate the offer, then activate that coupon. A draft coupon is not the code the customer should succeed with.
   - Issue `TEST_COUPON_DELIVERY` limited to delivery, and `TEST_COUPON_PICKUP` limited to pickup. Activate both.
   - Keep a second code unused until the retire row.
3. Customer setup:
   - `CUSTOMER_NEW`: an authenticated customer with no successful direct purchase. A failed or abandoned payment must not be treated as that purchase.
   - `CUSTOMER_RETURNING`: an authenticated customer with one prior successful direct purchase.
4. Cart setup: as `CUSTOMER_NEW`, add two distinct in-stock items. Record them as `ITEM_A` and `ITEM_B`. Leave both in the cart.
5. Viewports: one phone-width window (about 390px) and one desktop-width window. Repeat the experience rows in both.
6. Keyboard rows: use Tab, Enter, and Escape. Do not rely on a pointer for those rows.
7. Payment rows: start payment only. A provider intent or a recovery screen is as far as this checklist goes. Do not capture, do not complete a live charge, and do not use a real card if the environment would take money. If the only available path would charge a real instrument, leave the row blank and write `BLOCKED_LIVE_CHARGE` in Actual.

## Evidence input from automation

These commands and CI facts are evidence input. They are not Verdict values. Do not copy a test pass into the human table.

Preparation command, from the preparation worktree, unit and component layer only:

```bash
node scripts/run-vitest.mjs run tests/gtm-closure/accessible-names.test.tsx tests/gtm-closure/checkout-revalidation.test.ts tests/gtm-closure/coupon-journeys.test.ts tests/gtm-closure/first-returning-and-fulfilment.test.ts tests/gtm-closure/my-orders-historical-savings.test.ts tests/gtm-closure/operator-issue-activate-retire.test.tsx tests/gtm-closure/payment-start-recovery.test.ts
```

The same seven files are on the default `npm run test` include list (`vitest.config.mts` and `scripts/testing-inventory.mjs`). That is the Unit / component CI job. It is not a manual-only config.

| Journey | File | Layer |
|---|---|---|
| Coupon apply, invalid, expired, ineligible, remove | `tests/gtm-closure/coupon-journeys.test.ts` | Unit semantic |
| First order, returning order, delivery, takeaway, scheduled | `tests/gtm-closure/first-returning-and-fulfilment.test.ts` | Unit semantic |
| Review structural refusal, modifier identity, payable change, checkout block while invalid | `tests/gtm-closure/checkout-revalidation.test.ts` | Unit semantic |
| Payment-start fingerprint and idempotency conflict. No provider | `tests/gtm-closure/payment-start-recovery.test.ts` | Unit semantic |
| Order projection for delivery, takeaway, scheduled, sealed saving | `tests/gtm-closure/my-orders-historical-savings.test.ts` | Unit semantic |
| Operator code shape, activate gate, retire dialog | `tests/gtm-closure/operator-issue-activate-retire.test.tsx` | Unit semantic and component |
| Coupon names, one-line cart removal, pickup Choose Delivery, payment recovery regions | `tests/gtm-closure/accessible-names.test.tsx` | Component (jsdom) |

Record any command the Founder re-runs in the evidence log. A later retry is not the original result.

## Functional checks

Do the rows in order when a later row needs the cart or coupon from an earlier row. Otherwise they can stand alone. Who stays blank until the Founder runs the row. Verdict stays blank.

| ID | Setup | What to do | Expected observation | Who | Screenshot or command | Actual | Verdict |
|---|---|---|---|---|---|---|---|
| F-01 | `CUSTOMER_NEW`, empty of successful direct purchases | Place the first direct order through to confirmation, using the payment rule in Setup. Then abandon or fail a later payment attempt without a successful purchase. | The first-order offer can apply for `CUSTOMER_NEW`. A failed or abandoned payment does not use that eligibility up. | | | | |
| F-02 | `CUSTOMER_RETURNING` | Start an order and look for the same first-order offer. Open the prior purchase in My Orders. | The first-order offer does not apply again. Cancel or refund of the prior purchase does not bring it back. The purchased order remains in My Orders. | | | | |
| F-03 | Cart with `ITEM_A` and `ITEM_B` | Choose Delivery. Enter a serviceable destination. Continue to Review. | Delivery asks for a destination. A delivery charge appears only when the accepted tariff has one. The destination is visible on Review. | | | | |
| F-04 | Same two items | Choose Takeaway. Select an eligible outlet if the candidate asks. Continue to Review. | Takeaway binds an outlet, does not ask for a delivery destination, and does not add a delivery charge. | | | | |
| F-05 | An outlet that has later windows | Choose a scheduled window. Also look at the ASAP choice. | The window comes from that outlet's hours, lead time, and closure. ASAP is not labelled or treated as scheduled. | | | | |
| F-06 | Operator, promotions | Create the coupon offer used as `TEST_COUPON`. Do not activate it yet. | Creation shows a draft offer. Customers cannot use it yet. The screen distinguishes the offer from a coupon code. | | | | |
| F-07 | That draft offer | Issue `TEST_COUPON`. | The issued code is visible to the operator. It is still not customer-ready until activation. | | | | |
| F-08 | Issued code | Activate the offer, then activate the coupon. | After both activations, the operator can see the code a customer types. A zero-issued or draft-only coupon is not described as ready for customers. | | | | |
| F-09 | `CUSTOMER_NEW`, cart, activated `TEST_COUPON` | Apply `TEST_COUPON` on the cart. Open Checkout Review. | One code is applied. The saving is visible on the cart and the same state is visible on Review. | | | | |
| F-10 | Cart | Enter an unknown code. Then enter an expired code if one exists. Then apply `TEST_COUPON_DELIVERY` on Takeaway, and `TEST_COUPON_PICKUP` on Delivery. | Unknown, expired, and ineligible sentences stay distinct. No saving is applied. The mode-limited code names the mode it applies to. Another code can be tried afterward. | | | | |
| F-11 | Applied `TEST_COUPON` | Remove the coupon on the cart. Open Review again. | The coupon saving is gone from the cart and from Review. The items remain. | | | | |
| F-12 | Cart containing `ITEM_A` and `ITEM_B` | Make only `ITEM_A` unavailable after it is in the cart (sold out, or otherwise not orderable on this candidate). Leave `ITEM_B` orderable. | `ITEM_B` stays in the cart. The explanation names `ITEM_A`, not only a generic cart error. Checkout stays blocked while that evaluation is invalid. `ITEM_B` is not described as unavailable. | | | | |
| F-13 | The invalid cart from F-12 | Remove or change only `ITEM_A`. Leave `ITEM_B`. | `ITEM_B` is still there. After the evaluation is valid again, checkout is no longer blocked for that reason. If pickup has no eligible outlet, Delivery can still be chosen, and a route back toward the cart is available. | | | | |
| F-14 | Valid cart and applied or removed coupon, matching F-09 or F-11 | Open Checkout Review. | Review shows the cart's items, fulfilment, and coupon state. Pay is not offered on a stale offer. | | | | |
| F-15 | Review totals accepted | Start payment once. Stop at the provider intent or the recovery screen. | Payment start leads to a provider intent or to recovery. No second charge is taken. No live capture is completed. | | | | |
| F-16 | A checkout whose price or structure changes before pay (change quantity, coupon, or fulfilment, then return) | Attempt to continue on the old total. | A real total change says the total changed and shows the new amount. An unchanged payable does not claim the total changed. The same displayed payable does not bypass a coupon, promotion, modifier, or fulfilment difference. Recovery returns through Review. | | | | |
| F-17 | The same payment-start request, then a changed request | Repeat the same start. Then change the checkout and start again with the same idempotency key if the screen exposes one. | The same request does not create a second payment. A changed request does not silently reuse the old key. | | | | |
| F-18 | A completed no-charge or test confirmation path that does not capture live funds | Read the confirmation screen. | Confirmation shows the order number, items, fulfilment, and purchased saving from that order. | | | | |
| F-19 | That order, then retire or rename the live offer | Open My Orders and the order detail. | Detail still shows the purchased saving and the fulfilment from the snapshot. Delivery, takeaway, and a scheduled window match what was bought. | | | | |

## Operator checks

| ID | Setup | What to do | Expected observation | Who | Screenshot or command | Actual | Verdict |
|---|---|---|---|---|---|---|---|
| O-01 | Authorized operator | Issue a coupon on a coupon offer. | The code the customer will type is separate from the offer identifier. Issuing it does not by itself make it live. | | | | |
| O-02 | Draft coupon on a draft or inactive offer, then on an active coupon offer | Try to activate the coupon before the offer is active. Then activate the offer and the coupon. | Activation waits until the offer is an active coupon offer. After activation, the operator can tell that customers can enter the code. | | | | |
| O-03 | An active offer with no purchased-history need to edit | Open retire. Choose cancel. Open retire again and confirm. Then open an already purchased order. | Cancel leaves the offer active. Confirm retires it. Purchased orders keep their sealed savings. New orders do not receive the retired offer. | | | | |

## Experience checks

Experience UAT covers discoverability, first impression, hesitation, clarity, trust, friction, recovery, content, mobile behaviour, brand coherence, and the approved experience intent. Only the Founder supplies the verdict.

| ID | Setup | What to do | Expected observation | Who | Screenshot or command | Actual | Verdict |
|---|---|---|---|---|---|---|---|
| E-01 | Phone-width and desktop-width | Walk cart, Review, payment start, My Orders, and the promotions editor in both widths. | Controls fit the width. No step is pointer-only. Text remains readable. The same coupon and cart state survive the width change. | | | | |
| E-02 | F-12 cart | Read the unavailable-item explanation next to the lines. | The explanation is item-specific for `ITEM_A`. `ITEM_B` stays understandable and orderable. Raw error codes are absent. | | | | |
| E-03 | Keyboard only | Reach the coupon field, apply, change, remove, the cart remove control for one line, retire, and cancel. | Each control is reachable by keyboard and exposes its visible name. Removing one line does not remove the other. Cancel does not retire. | | | | |
| E-04 | Invalid, expired, and ineligible coupons | Read the three sentences. | They stay distinct. Counts of other customers, and other customers' activity, are absent. | | | | |
| E-05 | Payment recovery, if a previous checkout exists | Read the recovery screen. | The customer can see the previous checkout and the current cart, and can return to the cart. | | | | |
| E-06 | Operator promotions, before activate | Compare an automatic offer, a coupon offer with zero issued coupons, and a coupon offer with an active code. | Promotion versus coupon code is understandable. Zero issued coupons is not presented as customer-ready. | | | | |

## Not run, and not a pass

| Gap | Layer | Why it is not a pass |
|---|---|---|
| Full first-order and returning-order browser path | Playwright | Not run. |
| Cart unavailability in the browser, including item-specific attachment after add | Playwright | Not run. Component tests do not attach a line problem to a named row. |
| Coupon create, issue, and activate over HTTP and PostgreSQL | Database | Not run. Unit tests cover code shape and the activate/retire transition only. |
| Committed-cart coupon re-evaluation after a mode switch | Database | Not run. The pure evaluator covers one submitted code. |
| Payment start against a sealed snapshot, including selection order | Database | Not run. No provider. Canonical selection-order reordering is not asserted here. |
| Order materialization replay under concurrency | Database | Not run. `ALREADY_EXISTS` is named in the unit file only. |
| Mobile and desktop viewport projects | Playwright | Not run. |
| #381 server mapping, #385 price-display choice, #377 pre-location availability, #384B, UOE, and WXE | Unapproved or out of scope | Not asserted as accepted behaviour. |

## Evidence log

| When | Who | Repository | Branch | HEAD | Fingerprint | Layer | Command or screenshot | Expected | Actual |
|---|---|---|---|---|---|---|---|---|---|
| | | | | | | | | | |
