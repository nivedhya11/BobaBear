# IMP-036J — 40 AC / 13 XR evidence matrix (non-authoritative)

```text
AUTHORITY = NON_AUTHORITATIVE_UAT_EVIDENCE
TASK = BOBA_IMP036J_NIGHTLY_AND_XR010_CLOSURE
MAIN_HEAD = 5151414a794934f2c190f33d0dda2dda513e9090
MAIN_TREE = e917d823f68ebb6788914ba49896c77c6cdc1c7c
WORKING_TREE_FINGERPRINT = a97b36d44630516ac514377856e5d06c7e75c5c646015ddbd5a9de583d027aec
MERGED = prior #523–#535 plus #536 5151414a7 (nightly concurrency + commercial E2E + XR-010 handoff)
NIGHTLY_FAILED_BASELINE = 41346969389 on 77da9cfbe (concurrency 14/16 + commercial E2E)
NIGHTLY_FINAL = 41396942594 on 5151414a7 SUCCESS (all mandatory jobs)
CI_FINAL = 41396902940 on 5151414a7
CODEQL_FINAL = 41396902962 on 5151414a7
CROSS_PORTAL_EXECUTED_HEAD = ee90bc9e78b8e5345275a7b28c6703e38201872f
CROSS_PORTAL_RESULT = 4 passed / EXIT 0 / 2026-11-01T19:07:57Z / project imp036jxp_88146389d22f
PROMOTION_BROWSER_RESULT = 15 passed / 1 skipped / EXIT 0 / 2026-11-01T19:34:07Z
PROMOTION_BROWSER_HEAD = 154c293cc1efbe271bce73556d8a65b4b889beaf contained in #534
FOUNDER_UAT = NOT_PERFORMED
IMP036J_ACCEPTED = NO
PROOF_RULE = PASS only if every Quality-plan layer has executed proof on an attributed candidate
DOMAIN_PASS_IS_NOT_BROWSER_PASS = YES
MANDATORY_AC_PROVEN_MAIN = 40/40
EXPERIENCE_REQUIREMENTS_PROVEN = 12/13
XR_010 = PARTIAL — attended NVDA/Orca handoff recorded; no genuine screen-reader session in this environment
```

Independent review (nightly + XR-010 closure):

- QA: MAIN-strict remains **40/40**. Payment concurrency 20/20 and Commercial Workspace E2E 3/3 (fresh + repeat) proved on the #536 candidate; exact-main Nightly `41396942594` SUCCESS. This is not Founder UAT or IMP acceptance.
- PE: XR strict PASS remains **12/13**. XR-010 stays PARTIAL with attended handoff at `docs/uat/acxr-closure/xr-010-attended-screen-reader-handoff.md` (no Orca/NVDA session available here).
- Security: no material findings on the #536 payment/prepare diff (claim-lock capacity preserved; sealed-applied-only preserve).

## Candidate attribution rules

- #523, #525, #526, #527, and #529 are merged. A test file on main is not an executed test.
- Cross-portal Journeys 1–3 and Negatives ran on `2dc13719e` (4 passed). That spec matches `b3b14f76a`. This is integrated proof for the rows marked PASS below, not a second post-squash rerun.
- Rows that still lack a required browser layer stay NOT_EXECUTED.

## Mandatory AC table (MAIN-strict)

| AC | Status | Plan layers | Executed proof | Missing / notes | Owner |
|---|---|---|---|---|---|
| `AC-036J-001-01` | **PASS** | Domain,component,browser | Domain/component + official promotion-browser on `39954301d`: displayed ORDER_SAVING equals the quote, and the cart stays an estimate. 11 passed / 1 skipped / EXIT 0. | Mobile project runs the same equality. Desktop skip of the mobile-tagged test is the suite's one skip. | QA |
| `AC-036J-001-02` | **PASS** | Domain,browser | Tranche 3 out-of-window omission on `a33197fc`. Promotion-browser on `c46c3810e`: closed-window name, saving, progress, apology, and strikethrough are absent. | — | QA |
| `AC-036J-002-01` | **PASS** | Domain,HTTP,component,browser | gtm-uat Review apply `e2e10`; coupon-journeys; Payment no coupon | Cart-entry path thin; HTTP via gtm browser envelope | QA |
| `AC-036J-002-02` | **PASS** | HTTP,component,browser | Tranche 4 `CART_COUPON_UNKNOWN` on `a33197fc`. Tranche 5 invalid sentence. Promotion-browser on `c46c3810e`: unknown text shows `COPY-INVALID`, payable unchanged, no near-match. | — | QA |
| `AC-036J-002-03` | **PASS** | Domain,HTTP,browser | Tranche 4 `removeCartCoupon` on `a33197fc`. Promotion-browser on `c46c3810e`: successful remove clears the order saving; an aborted remove keeps the previous saving. | — | QA |
| `AC-036J-002-04` | **PASS** | HTTP,integration,browser,accessibility | Tranche 4 `claimGuestCart` on `a33197fc`. Promotion-browser on `c46c3810e`: the checkout evaluate response carries the same code, the result is `role=status` / `aria-live=polite`, and focus lands on that result. | — | QA |
| `AC-036J-002-05` | **PASS** | Domain,HTTP,browser | Tranche 4 guest unrestricted coupon on `a33197fc`. Promotion-browser on `c46c3810e`: a guest gets strict-keep, equal-kept, and equal-selected without sign-in. The identity-restricted code still asks for sign-in. | — | QA |
| `AC-036J-002-06` | **PASS** | HTTP,browser | tranche4 shared coupon commands + promotion-browser on `39954301d`: Cart code is the Review code and the same ORDER_SAVING | — | QA |
| `AC-036J-002-07` | **PASS** | HTTP,browser | gtm-uat first apply on Review | — | QA |
| `AC-036J-002-08` | **PASS** | HTTP,browser | tranche4 replace/remove HTTP/domain + promotion-browser on `39954301d`: Review replace drops the previous code; remove clears ORDER_SAVING | — | QA |
| `AC-036J-002-09` | **PASS** | Component,browser,accessibility | GJ + responsive Payment read-only Tab sequence | — | QA |
| `AC-036J-002-10` | **PASS** | Recovery,component,browser | tranche5 RETRY component + promotion-browser on `39954301d`: aborted Review replace and remove keep the previous code and payable, show RETRY, and leave Try again in the tab order. Focus stays on Change or Remove. | Cart dropped-request is not in this browser run. Review remove is retried successfully after the fault is lifted. | QA |
| `AC-036J-003-01` | **PASS** | Domain,component | tranche3/5 server gap (no browser required by AC) | — | QA |
| `AC-036J-003-02` | **PASS** | Domain,browser | Tranche 3 server threshold on `a33197fc`. Promotion-browser on `c46c3810e`: one Increase crosses ₹1,500 and one Decrease drops it. The offer is not swapped by a second arm. | — | QA |
| `AC-036J-004-01` | **PASS** | Domain,component,browser | Promotion-browser on `154c293cc` (merged #534): standing-zero Delivery charge amount 0 and ₹0.00, order saving ₹80, no delivery-saving row, total saved ₹80. The same run keeps the ₹80 + ₹40 quote. Screenshot `ac-004-01-standing-zero`. | — | QA |
| `AC-036J-005-01` | **PASS** | Domain,database | **tranche4 executed** first-order reserve/consume/abandoned-release + concurrent guard | — | QA |
| `AC-036J-005-02` | **PASS** | Domain,database | **tranche4 executed** refund does not restore / prior success ineligible | — | QA |
| `AC-036J-006-01` | **PASS** | Domain,browser | Tranche 3 mode eligibility on `a33197fc`. Promotion-browser on `c46c3810e`: pickup shows ₹12 and hides the delivery-only offer; delivery shows ₹15 and hides the pickup-only offer. Each opposite coupon uses its inapplicable sentence. | — | QA |
| `AC-036J-006-02` | **PASS** | Domain,integration | **tranche4 executed** `SCHEDULED-only Offer… (AC-036J-006-02)` | — | QA |
| `AC-036J-007-01` | **PASS** | Domain,component,browser,content | tranche5 five sentences + promotion-browser on `39954301d`: invalid, expired, inapplicable, global exhaustion, and personal exhaustion are five sentences. Counts are absent. Cap seed counts RESERVED+CONSUMED by promotion and excludes RELEASED. | — | QA |
| `AC-036J-008-01` | **PASS** | Integration,recovery,browser | Cross-portal Negatives on `2dc13719e` (4 passed, EXIT 0). Retire after Review, payment does not open, Review `copy-stale` text, recovered payable ≠ retired payable. | Sealed-drift refuse is not this proof. | QA |
| `AC-036J-009-01` | **PASS** | Domain,browser | Tranche 3 ₹80+₹40 beats ₹90 on `a33197fc`. Promotion-browser on `c46c3810e`: strict-keep, savings stay ₹80 and ₹40, payable unchanged, no better-price claim. | — | QA |
| `AC-036J-009-02` | **PASS** | Domain,browser | Tranche 3 ₹90+₹20 beats ₹100 on `a33197fc`. Promotion-browser on `c46c3810e`: both savings show, ₹90 + ₹20 = ₹110, one row each. | — | QA |
| `AC-036J-009-03` | **PASS** | Domain,component | tranche3/5 | — | QA |
| `AC-036J-009-04` | **PASS** | Domain,component | tranche3/5 | — | QA |
| `AC-036J-010-01` | **PASS** | Domain,browser | Tranche 3 one primary plus one delivery incentive, and the second-primary rejection, on `a33197fc`. Promotion-browser on `c46c3810e` shows one order-saving row and one delivery-saving row. | — | QA |
| `AC-036J-010-02` | **PASS** | Domain | tranche3 BOGO | — | QA |
| `AC-036J-010-03` | **PASS** | Domain | tranche3 best combination | — | QA |
| `AC-036J-010-04` | **PASS** | Domain,component | tranche3/5 standing ₹0 | — | QA |
| `AC-036J-011-01` | **PASS** | Database,HTTP,browser | Journey 1 on `2dc13719e`: shared DB, owned-order HTTP, then My Orders → Order Detail `You saved` / Order saving after retire. | Spec bytes match `b3b14f76a`. | QA |
| `AC-036J-012-01` | **PASS** | HTTP,authorization,browser | Cross-portal Journey 1 on the #534 source (4 passed, EXIT 0): after purchase, `redemption-counts` shows Applications and Consumed at least 1 and the text has no phone, email, or customer id. | — | QA |
| `AC-036J-012-02` | **PASS** | HTTP,authorization,component | Operator HTTP test, 1 passed / EXIT 0: missing `expectedPromotionRevision` returns field `expectedPromotionRevision`; missing benefit returns field `benefit`; role spoof, kitchen, and other-brand activate/retire do not change status or revision. | — | QA |
| `AC-036J-012-03` | **PASS** | Component,browser,accessibility | PromotionsEditor cancel/confirm keyboard. Commercial workspace on `39954301d`: Cancel stays active; Enter on Retire offer shows the retired sentence. Cross-portal Journey 1 on `2dc13719e`: purchased money summary is unchanged after retire, including Order Detail. | — | QA |
| `AC-036J-012-04` | **PASS** | Domain,HTTP,authorization | Same operator HTTP test: incomplete ids, a bundle, and a required positive-price modifier return `COPY-OP-GIFT-INVALID` with a field and leave the draft benefit empty. A complete variant then activates. Optional paid modifiers stay allowed. | — | QA |
| `AC-036J-012-05` | **PASS** | Database,HTTP | Same operator HTTP test: the second activate is 409 `COPY-OP-SECOND`, the first stays active, the second stays draft, and `promotions_one_active_complimentary_per_brand_uidx` is unique. A parallel HTTP activate leaves one active row. Tranche 6 overlapping-transaction race was re-executed, 1 passed. | The parallel HTTP failure message is `COPY-OP-RACE` or `COPY-OP-SECOND`. The browser shows the sequential sentence. | QA |
| `AC-036J-012-06` | **PASS** | Concurrency,database | Tranche 6 on `a33197fc`: two overlapping transactions, one winner, loser `COPY-OP-RACE`, one ACTIVE complimentary offer, one activation audit. | — | QA |
| `AC-036J-013-01` | **PASS** | Domain,HTTP,browser | Tranche 3 equal-payable complimentary selection on `a33197fc`. Promotion-browser on `c46c3810e`: cart and Review show the seeded variant id, ₹0.00, Included, and no picker. Cart shows the variant name; Review shows the product name. | — | QA |
| `AC-036J-013-02` | **PASS** | Database,browser | Journey 3 on `2dc13719e`: after retire, Order Detail shows `1 ×` product, `₹0.00`, and Included with your offer. | API line assert remains; it is not the only proof. | QA |
| `AC-036J-013-03` | **PASS** | Integration,recovery,browser | Tranche 4 unavailable complimentary refuse on `a33197fc`. Promotion-browser on `c46c3810e`: after the seeded variant is temporarily unavailable, Review shows `COPY-GIFT-GONE`, drops the included line, and does not open payment. | — | QA |
| `AC-036J-013-04` | **PASS** | Domain,browser | `competing-complimentary-evaluator.test.ts` 2 passed: two synthetic definitions return `NONE_CHOSEN` from `evaluatePromotions` and persist nothing. Promotion-browser projects that object into the cart. A previously shown line becomes `COPY-GIFT-CONFLICT` with no line and no picker. A first paint shows neither gift nor the conflict sentence. Screenshot `ac-013-04-conflict`. | Two ACTIVE complimentary rows were not inserted. | QA |

**MAIN-strict counts:** PASS **40** · NOT_EXECUTED **0** · BLOCKED **0** · FAIL **0**

PASS set: `001-01, 001-02, 002-01, 002-02, 002-03, 002-04, 002-05, 002-06, 002-07, 002-08, 002-09, 002-10, 003-01, 003-02, 004-01, 005-01, 005-02, 006-01, 006-02, 007-01, 008-01, 009-01, 009-02, 009-03, 009-04, 010-01, 010-02, 010-03, 010-04, 011-01, 012-01, 012-02, 012-03, 012-04, 012-05, 012-06, 013-01, 013-02, 013-03, 013-04`.

NOT_EXECUTED set: none.

`008-01` is PASS from the cross-portal recovery, not from sealed-drift refusal. `013-04` uses the in-memory evaluator outcome, not a rewrite of one active gift.

## Experience Requirements (strict)

| XR | Status | Plan layers | Proof | Missing |
|---|---|---|---|---|
| `XR-IMP-036J-001` | **PASS** | Component,browser,content | Promotion-browser on `c46c3810e`: Offer applied, order saving equals the quote, estimated subtotal, screenshot `ac-001-01-cart`. Mobile screenshot `xr-010-mobile-cart`. | — |
| `XR-IMP-036J-002` | **PASS** | HTTP,component,browser,accessibility | Promotion-browser on `c46c3810e`: Cart and Review share one code; change, remove, and the five failure sentences. The identity result is `role=status` with `aria-live=polite` and receives focus. Payment remains the read-only summary from the merged responsive journey. | — |
| `XR-IMP-036J-003` | **PASS** | Domain,component,browser | Promotion-browser on `c46c3810e`: progress is visible below the threshold, the saving replaces it on Increase, and `COPY-DROPPED` returns on Decrease. Screenshot `xr-003-progress`. | — |
| `XR-IMP-036J-004` | **PASS** | Domain,component,browser | Promotion-browser on `154c293cc`: standing-zero Delivery is ₹0.00 with no delivery-saving row, while the same command keeps the ₹80 + ₹40 quote. Screenshot `ac-004-01-standing-zero`. | — |
| `XR-IMP-036J-005` | **PASS** | Component,browser,content | Promotion-browser on `c46c3810e`: strict-keep, equal-kept, and equal-selected. None say better price. Screenshots `ac-009-01-strict-keep`, `xr-005-equal-kept`, `xr-005-equal-selected`. | — |
| `XR-IMP-036J-006` | **PASS** | Component,browser | Promotion-browser on `154c293cc`: included ₹0 line, no picker, delivery saving ₹40, no order saving, no better-price claim. Screenshot `xr-006-gift-delivery`. The conflict row is the evaluator `NONE_CHOSEN` projection. | — |
| `XR-IMP-036J-007` | **PASS** | Integration,browser,accessibility | Cross-portal Negatives on the #534 source: `copy-stale` is focused and the updated payable is visible. The sentence is the locked stale copy. | — |
| `XR-IMP-036J-008` | **PASS** | Browser,content | Promotion-browser on `154c293cc`: purchased Confirmation and Order Detail show Order saving ₹80.00 and Delivery saving ₹40.00, with no progress line. Screenshots `xr-008-confirmation-split` and `xr-008-detail-split`. Cross-portal Journey 3 shows the purchased included item. | Gift and order saving are separate purchases because two primary incentives do not stack. |
| `XR-IMP-036J-009` | **PASS** | Component,authorization,concurrency,browser | Cross-portal Journey 3 shows `COPY-OP-SECOND` and leaves the first gift active. Operator HTTP denies forged and out-of-scope writes. The parallel HTTP activate and the tranche 6 overlapping transaction each leave one active complimentary offer. | The browser does not render `COPY-OP-RACE` from a live overlapping click. The race sentence is the HTTP/database outcome. |
| `XR-IMP-036J-010` | **PARTIAL** | Accessibility,browser | Promotion-browser on `c46c3810e` includes the mobile cart screenshot and keyboard focus on the failed coupon action and the identity result. | A screen-reader session was not run. |
| `XR-IMP-036J-011` | **PASS** | Component,content,security | Promotion-browser on `154c293cc` rejects a coupon response that contains a near-match, a cap, a customer id, a phone, or an email. Independent security review of the #534 diff found no material findings. | The short Security HTTP gate on #534 is a path gate, not a new security-suite run. |
| `XR-IMP-036J-012` | **PASS** | Component,browser,content | Promotion-browser on `154c293cc`: after one purchased first-order offer, the next Review has no order saving, no delivery saving, and no history sentence. The same command still hides the opposite fulfilment offer and shows no pickup delivery saving. Screenshot `xr-012-first-order-absent`. | — |
| `XR-IMP-036J-013` | **PASS** | Component,browser,content | Promotion-browser on `154c293cc`: Review shows the seeded included line, ₹0.00, no picker, and no better-price claim, and the gift-plus-delivery quote shows the delivery saving without a better-price claim. Screenshot `xr-013-included-review`. | — |

**XR counts:** PASS **12** · PARTIAL **1**

PASS: `001, 002, 003, 004, 005, 006, 007, 008, 009, 011, 012, 013`. PARTIAL: `010`.

## Golden Journeys

| Journey | Status | Evidence | Caveats |
|---|---|---|---|
| GJ-FIRST-ORDER | PASS (rehearsal-level) | customer-ordering desktop; fake Razorpay; tree≡MAIN | Not Founder UAT; Offer value not asserted |
| GJ-RETURNING-ORDER | PASS (rehearsal-level) | second order without first-order Offer | Absence by text-not-present |

## Sibling / parallel proof (disclosed; not MAIN)

| Artifact | Head | Role |
|---|---|---|
| #523 merged | `029a37741` | Commerce HTTP and browser regression source is on main. Not re-executed as an AC packet here. |
| #525 merged | `1e59a4cd6` | Malformed-create HTTP 400 and Pickup Enter/Space are on main. Not a retire proof. |
| #526 merged | `8552cc63f` | Nightly commercial workspace on `8552cc63f`: 3 passed. Cleanup network noise after the pass. Run `41277192586`. |
| Cross-portal | `2dc13719e` / main `b3b14f76a` | 4 passed. Journeys 1 and 3 include Order Detail after retire. |

## Closure-run execution

| Command | Candidate | Result | Notes |
|---|---|---|---|
| `npm run test:imp036j:tranche3` | `a33197fc` (through #527) | **107 passed / EXIT 0** | Not re-run after #529. |
| `npm run test:imp036j:tranche4` | `a33197fc` | **49 passed / EXIT 0** | |
| `npm run test:imp036j:tranche5` | `a33197fc` | **EXIT 0** (63 + 6) | |
| `npm run test:imp036j:tranche6` | `a33197fc` | **EXIT 0** (25 + 5) | |
| `npm run test:imp036j:tranche8` | `a33197fc` | **EXIT 0** | Includes 2 browser passes. |
| `npm run test:database:administration` | `a33197fc` | **41 passed / EXIT 0** | Includes promotions HTTP. Not a field-level AC pass by itself. |
| `npm run test:e2e:cross-portal-promotion` | #534 source, merged `ee90bc9e7` | **4 passed / EXIT 0** | 2026-11-01T19:07:57Z. Project `imp036jxp_88146389d22f`. Protected volumes untouched. |
| Operator administration HTTP | #534 source, merged `ee90bc9e7` | **1 passed / EXIT 0** | `tests/database/operator-promotion-administration-http.integration.test.ts`, 5170ms. |
| Competing complimentary evaluator | #534 source, merged `ee90bc9e7` | **2 passed / EXIT 0** | In-memory `evaluatePromotions`. No database write. |
| Nightly Verification | `8552cc63f` | **success** | Historical. Not the #534 main. |
| `npm run test:e2e:promotion-browser` | `154c293cc` contained in #534 | **15 passed / 1 skipped / EXIT 0** | 2026-11-01T19:34:07Z. The skip is the desktop project skipping the mobile-tagged test. Mobile-chromium passed in the same command. |
| `npm run test:e2e:commercial-workspace` | tree squashed into `39954301d` | **3 passed / EXIT 0** | Log `/tmp/m2-commercial-2.log`. Retire keyboard and redemption counts ran. Purchased-order savings were not asserted. |
| Nightly Verification | `5151414a7` | **success** | Run `41396942594`. Concurrency matrix + Commercial Workspace + all other mandatory jobs SUCCESS. |
| Payment concurrency 20/20 | #536 / main `5151414a7` | **20 passed / EXIT 0** | Cases 14/16 return `PAYMENT_PROMOTION_CAPACITY_UNAVAILABLE`. |
| Commercial Workspace E2E (fresh+repeat) | #536 pre-merge | **3 passed / EXIT 0** twice | Desktop/tablet/mobile. |

## Product defects

```text
PRODUCT_FAIL_REPORTED = 0
MANDATORY_BLOCKERS = NONE in the former 011-01 / 013-02 harness gap
REMAINING_NOT_EXECUTED = 0
XR_STRICT_PASS = 12/13
XR_010 = PARTIAL — no screen-reader session
```

#381, #383, and #384 stay open as separate evidence issues. #385 stays closed.

## Independent review summary

```text
QA_INDEPENDENT_REVIEW = PASS for the six ACs after the executed HTTP, browser, and concurrency commands. An earlier read-only review missed the HTTP terminal and is superseded by that exit 0.
PE_INDEPENDENT_REVIEW = PASS for the cited sentences after the Checkout NONE_CHOSEN fix. XR-010 remains PARTIAL.
SECURITY_INDEPENDENT_REVIEW = no material findings on the #534 diff
XR_STRICT_PASS = 12/13
FOUNDER_UAT = NOT_PERFORMED
IMP036J_ACCEPTED = NO
```
