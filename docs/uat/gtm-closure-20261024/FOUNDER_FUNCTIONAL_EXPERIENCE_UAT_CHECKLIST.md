# Founder Functional and Experience UAT checklist

Wave: `BOBA-PRODUCT-GTM-CLOSURE-20261024`. Issue: [#435](https://github.com/nivedhya11/BobaBear/issues/435).

This checklist prepares Founder UAT. It does not perform it.

```text
FOUNDER_UAT = NOT_PERFORMED
FOUNDER_UAT = FUNCTIONAL_UAT + EXPERIENCE_UAT
FOUNDER_UAT_VERDICT_OWNER = HUMAN_FOUNDER
SIMULATED_TEST_PASS != FOUNDER_UAT_PASS
COMPLETE_AND_ACCEPTED = NOT_CLAIMED
DEPLOYMENT = NOT_PERFORMED
LIVE_PAYMENT = NOT_PERFORMED
```

Scenario source: `PD-IMP-036J-DRAFT-6` / `XD-IMP-036J-DRAFT-6` acceptance scenarios already in the product definition, plus accepted fulfilment and order contracts those scenarios consume. This file does not add product expectations.

## Provenance the Founder must match

Fill these on the exact candidate before any interactive verdict. `HEAD` alone is not enough. Do not deploy this branch as Founder UAT evidence. Founder staging, when later authorized, is merged `main` only.

| Slot | Expected | Actual |
|---|---|---|
| Who ran the check | Human Founder | |
| Canonical repository path | `/home/ajoshi/repos/boba-bear-platform` for accepted product truth. This checklist was prepared from worktree `/home/ajoshi/repos/boba-bear-gtm-f-qa`. | |
| Branch | Record the branch under test. This preparation branch is `test/gtm-functional-acceptance`. | |
| HEAD | Full SHA | |
| WORKING_TREE_FINGERPRINT | `npm run working-tree:fingerprint` | |
| Screenshot or command | Path or command output | |
| Expected | From the row below | |
| Actual | What the Founder saw | |

## Simulated tests versus human UAT

Automated rows below are simulated evidence only. A passing command is `SIMULATED_TEST = PASS` for that row. It is not `FOUNDER_UAT = PASS`.

| Journey | Automated evidence prepared here | Simulated result | Human UAT |
|---|---|---|---|
| Valid, invalid, expired, inapplicable, and removed coupon | `tests/gtm-closure/coupon-journeys.test.ts` | Run the command in the evidence section | `NOT_PERFORMED` |
| First order and returning order eligibility | `tests/gtm-closure/first-returning-and-fulfilment.test.ts` | Same | `NOT_PERFORMED` |
| Delivery, Takeaway, and scheduled eligibility | Same file, plus sealed order projection | Same | `NOT_PERFORMED` |
| Checkout revalidation and equal-payable structural refusal | `tests/gtm-closure/checkout-revalidation.test.ts` | Same | `NOT_PERFORMED` |
| Payment start and retry fingerprint, idempotency conflict, no provider | `tests/gtm-closure/payment-start-recovery.test.ts` | Same | `NOT_PERFORMED` |
| My Orders sealed saving, delivery, takeaway, scheduled window | `tests/gtm-closure/my-orders-historical-savings.test.ts` | Same | `NOT_PERFORMED` |
| Operator issue, activate, retire transitions and retire dialog names | `tests/gtm-closure/operator-issue-activate-retire.test.tsx` | Same | `NOT_PERFORMED` |
| Coupon and recovery accessible names | `tests/gtm-closure/accessible-names.test.tsx` | Same | `NOT_PERFORMED` |

Command, from the preparation worktree:

```bash
node scripts/run-vitest.mjs run --config tests/gtm-closure/vitest.gtm-closure.config.mts
```

Record the exit code and the result summary in the Actual column. Do not treat a later retry as the original result.

## Founder functional checks

Mark each row only after the Founder runs it. Leave Actual blank until then.

| ID | Check | Expected | Who | Screenshot or command | Actual | Verdict |
|---|---|---|---|---|---|---|
| F-01 | First direct order | An authenticated customer with no successful direct purchase can receive a first-order offer. A failed or abandoned payment does not use it up. | | | | `NOT_PERFORMED` |
| F-02 | Returning order | A customer with a prior successful direct order does not receive that first-order offer again, including after cancel or refund of that purchase. Purchased history remains. | | | | `NOT_PERFORMED` |
| F-03 | Valid coupon | One code becomes applied and the saving is visible on the shared cart and checkout review state. | | | | `NOT_PERFORMED` |
| F-04 | Invalid coupon | Unknown text shows the invalid sentence, applies no saving, and another code can be tried. | | | | `NOT_PERFORMED` |
| F-05 | Expired coupon | The expired sentence is distinct from invalid. | | | | `NOT_PERFORMED` |
| F-06 | Inapplicable coupon | A delivery-only code on Takeaway, and a pickup-only code on Delivery, names the mode it applies to. | | | | `NOT_PERFORMED` |
| F-07 | Coupon removal | After removal, the total no longer includes that coupon. | | | | `NOT_PERFORMED` |
| F-08 | Delivery | Delivery asks for a serviceable destination and can include a delivery charge from accepted tariff authority. | | | | `NOT_PERFORMED` |
| F-09 | Takeaway | Takeaway binds an eligible outlet, does not ask for a delivery destination, and does not add a delivery charge. | | | | `NOT_PERFORMED` |
| F-10 | Scheduled | A scheduled window comes from accepted outlet hours, lead time, and closure. ASAP is not treated as scheduled. | | | | `NOT_PERFORMED` |
| F-11 | Checkout revalidation | Payment does not continue on a stale offer or a structurally different snapshot. Recovery returns through review. | | | | `NOT_PERFORMED` |
| F-12 | Equal payable, different structure | The same displayed payable does not bypass a coupon, promotion, or fulfilment difference. | | | | `NOT_PERFORMED` |
| F-13 | Payment start and recovery | Start and recovery use the accepted payment flow. No live provider charge in this wave. Repeating the same request does not create a second payment. A changed request does not reuse the old key silently. | | | | `NOT_PERFORMED` |
| F-14 | My Orders | Order detail shows the purchased saving and fulfilment from the snapshot after the offer is retired. | | | | `NOT_PERFORMED` |
| F-15 | Operator issue, activate, retire | An authorized operator can issue a coupon, activate it, and retire it after confirmation. Cancel leaves it active. Purchased orders keep sealed savings. | | | | `NOT_PERFORMED` |

## Founder experience checks

Experience UAT covers discoverability, first impression, hesitation, clarity, trust, friction, recovery, content, mobile behaviour, brand coherence, and the approved experience intent. Only the Founder supplies the verdict.

| ID | Check | What to notice | Who | Screenshot or command | Actual | Verdict |
|---|---|---|---|---|---|---|
| E-01 | Coupon language | Invalid, expired, and inapplicable sentences stay distinct. Counts and other customers are absent. | | | | `NOT_PERFORMED` |
| E-02 | Payment recovery | The customer can see the previous checkout and the current cart, and can return to the cart. | | | | `NOT_PERFORMED` |
| E-03 | Stale checkout copy | Unchanged payable does not say the total changed. A real total change says the total changed and shows the new amount. | | | | `NOT_PERFORMED` |
| E-04 | Mobile and desktop | Cart, review, payment, My Orders, and the promotions editor on a phone-width and a desktop-width viewport. | | | | `NOT_PERFORMED` |
| E-05 | Keyboard and names | Coupon field, apply, change, remove, retire, and cancel are reachable by keyboard and expose their visible names. | | | | `NOT_PERFORMED` |
| E-06 | Operator clarity | Promotion versus coupon code, and a promotion with zero issued coupons, are understandable before activate. | | | | `NOT_PERFORMED` |

## Not automated

These journeys were left out of the green suite. A missing browser or database run is missing evidence, not a pass.

| Journey | Why it is `NOT_AUTOMATED` |
|---|---|
| `GJ-FIRST-ORDER` full browser path | Needs the integrated menu, cart, checkout, and PostgreSQL journey. A static-export Playwright spec would not prove it. |
| `GJ-RETURNING-ORDER` full browser path | Same. Purchased-history UI was not driven in a browser. |
| Address search and map confirmation | Owned by another workstream's customer-location surfaces. No new browser spec was added. |
| Item unavailable before add, and became unavailable after add | Requires cart and checkout fixtures this workstream must not edit. |
| Global redemption cap and personal redemption cap | The pure evaluator does not settle those counters. Database redemption enforcement was not started. |
| Coupon authentication retry and guest unrestricted coupon in the browser | Identity and cart continuity need the auth and cart services. |
| Cart and Checkout Review shared coupon HTTP | Needs the cart and checkout servers. The pure evaluator covers one submitted code only. |
| Payment page has no coupon editor | Not rendered in this suite. Confirm on the payment screen during Founder UAT. |
| Payment provider recovery and webhook | No provider, mock checkout session, or webhook was called. |
| Order materialization replay in PostgreSQL | `ALREADY_EXISTS` is named. Overlapping inserts were not run. |
| Operator HTTP activate, deny, and complimentary single-active race | Needs workforce auth and PostgreSQL. The dialog and coupon transitions are the automated slice. |
| Mobile and desktop viewport | This Vitest run is jsdom. The Playwright viewport projects were not used. |
| Delivery proof, auto-attestation, and URL or body identity | Not asserted. Current order detail leaves delivery null unless a delivery summary is already supplied. That is not a new proof feature. |
| UOE and WXE behaviour | Not asserted as true on current main. Those packages are unmerged and not implementation-authorized by this workstream. |

## Launch blockers to verify

These are checklist items for the Founder. This workstream did not fix them and does not claim they are reproduced here. They are the open customer-visible reports named by issue #435.

| Priority | Item | Reported in | This workstream |
|---|---|---|---|
| P0 | Repeated payment start returns `CHECKOUT_REPRICED` even when the payable did not change, and the customer cannot continue. | #391 | Not fixed. Structural equality is regression-covered. The live loop is not. |
| P0 | `CHECKOUT_STATE_CONFLICT` during checkout, distinct from repricing. | #384 | Not fixed. Not conflated with #391. |
| P0 | Item availability is unclear before add versus after add, and recovery is not item-specific. | #377 | Not fixed. |
| P1 | Delivery address or location readiness blocks the first or returning order. | #395 | Not fixed. |
| P1 | Operator path from benefit to an actual redeemable coupon, activation, and retirement is hard to follow. | #376 | Not fixed. Transition rules are regression-covered. |
| P1 | Creating a coupon intermittently returns HTTP 500. | #381 | Not fixed. |
| P1 | A delivery-only coupon must stay ineligible after a switch to Takeaway, against the committed cart. | #383 | Domain mismatch is regression-covered. The browser mode switch is `NOT_AUTOMATED`. |
| P1 | Gross versus net line display is undecided. Do not treat either presentation as accepted. | #385 | Not chosen and not fixed. |
| P1 | Unified order experience and workforce experience are not current customer or operator behaviour. | #424, #426 | Not asserted and not implemented here. |
| P1 | Delivery proof on the server is not a launch claim. | Workforce experience UPD-08 | Not asserted as a server feature. |
| P0 | Founder functional UAT and experience UAT for IMP-036J. | STATE `founderUat = NOT_PERFORMED` | Still `NOT_PERFORMED`. |
| Separate | Security remediation PR #430. | #430 | Not part of this test PR. |

## Evidence log

| When | Who | Repository | Branch | HEAD | Fingerprint | Command or screenshot | Expected | Actual |
|---|---|---|---|---|---|---|---|---|
| | | | | | | | | |
