# IMP-036J — 40 AC / 13 XR evidence matrix (non-authoritative)

```text
AUTHORITY = NON_AUTHORITATIVE_UAT_EVIDENCE
TASK = BOBA_IMP036J_AC_XR_EVIDENCE_CLOSURE
MAIN_HEAD = c46c3810e
MAIN_TREE = evidence commit on integrated main 23b7e557b (#532)
MERGED = #525 1e59a4cd6, #523 029a37741, #526 8552cc63f, #527 2820f3989, #529 b3b14f76a, #530 39954301d, #531 43b02b5b4, #532 23b7e557b
CROSS_PORTAL_EXECUTED_HEAD = 2dc13719e00dc3a36729508f878601876a01b0f5
CROSS_PORTAL_RESULT = 4 passed / EXIT 0 / 2026-11-01T08:16:41Z
CROSS_PORTAL_LOG = local, not committed; result line above is the record
FOUNDER_UAT = NOT_PERFORMED
IMP036J_ACCEPTED = NO
PROOF_RULE = PASS only if every Quality-plan layer has executed proof on an attributed candidate
DOMAIN_PASS_IS_NOT_BROWSER_PASS = YES
MANDATORY_AC_PROVEN_MAIN = 37/40
EXPERIENCE_REQUIREMENTS_PROVEN = 9/13
```

Independent review (this closure):

- QA: MAIN-strict is **37/40**. Official promotion-browser on `c46c3810e` is 14 passed / 1 skipped / EXIT 0 (`/tmp/m2-promotion-browser-final.log`). The skip is the desktop project skipping the mobile-tagged test; mobile-chromium passed in that command. Reclaimed monetary and operator rows use tranche 3–6 on `a33197fc`, commercial workspace on the tree squashed into `39954301d`, and cross-portal on `2dc13719e`.
- PE: XR strict PASS is **9/13**. XR-007, XR-009, XR-010, and XR-011 stay PARTIAL.

## Candidate attribution rules

- #523, #525, #526, #527, and #529 are merged. A test file on main is not an executed test.
- Cross-portal Journeys 1–3 and Negatives ran on `2dc13719e` (4 passed). That spec matches `b3b14f76a`. This is integrated proof for the rows marked PASS below, not a second post-squash rerun.
- Rows that still lack a required browser layer stay NOT_EXECUTED.

## Mandatory AC table (MAIN-strict)

| AC | Status | Plan layers | Executed proof (MAIN `39954301d`) | Missing / notes | Owner |
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
| `AC-036J-004-01` | **PASS** | Domain,component,browser | Tranche 3 total-saved equality and standing-₹0 domain negative on `a33197fc`. Tranche 5 component. Promotion-browser on `c46c3810e`: ₹80 + ₹40 = ₹120, one row each, payable equals the quote. Pickup shows no delivery saving. | — | QA |
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
| `AC-036J-012-01` | **PASS** | HTTP,authorization,browser | Commercial workspace on the tree squashed into `39954301d`: activate, and redemption counts with no customer identifier (3 passed). Cross-portal Journey 1 on `2dc13719e`: the operator-authored coupon is applied by the customer. Tranche 6 on `a33197fc`: cross-scope create writes nothing and a client-supplied role does not activate. | — | QA |
| `AC-036J-012-02` | **NOT_EXECUTED** | HTTP,authorization,component | Tranche 6 HTTP denies a client-supplied role and a cross-scope create, and writes nothing | Invalid activate through the admin HTTP route does not name the field. The field-named rejection is the persistence command only. | QA |
| `AC-036J-012-03` | **PASS** | Component,browser,accessibility | PromotionsEditor cancel/confirm keyboard. Commercial workspace on `39954301d`: Cancel stays active; Enter on Retire offer shows the retired sentence. Cross-portal Journey 1 on `2dc13719e`: purchased money summary is unchanged after retire, including Order Detail. | — | QA |
| `AC-036J-012-04` | **NOT_EXECUTED** | Domain,HTTP,authorization | Tranche 6 on `a33197fc`: one complete variant activates; incomplete, bundle, and required-modifier gifts return `COPY-OP-GIFT-INVALID` and stay draft | Those rejections are persistence commands. The admin HTTP benefit route was not the executed call. | QA |
| `AC-036J-012-05` | **NOT_EXECUTED** | Database,HTTP | Tranche 6 on `a33197fc`: the second activation returns `COPY-OP-SECOND`, the first stays the only ACTIVE complimentary offer, and the second stays draft | The call is the persistence command. The admin HTTP activate route was not the executed call. | QA |
| `AC-036J-012-06` | **PASS** | Concurrency,database | Tranche 6 on `a33197fc`: two overlapping transactions, one winner, loser `COPY-OP-RACE`, one ACTIVE complimentary offer, one activation audit. | — | QA |
| `AC-036J-013-01` | **PASS** | Domain,HTTP,browser | Tranche 3 equal-payable complimentary selection on `a33197fc`. Promotion-browser on `c46c3810e`: cart and Review show the seeded variant id, ₹0.00, Included, and no picker. Cart shows the variant name; Review shows the product name. | — | QA |
| `AC-036J-013-02` | **PASS** | Database,browser | Journey 3 on `2dc13719e`: after retire, Order Detail shows `1 ×` product, `₹0.00`, and Included with your offer. | API line assert remains; it is not the only proof. | QA |
| `AC-036J-013-03` | **PASS** | Integration,recovery,browser | Tranche 4 unavailable complimentary refuse on `a33197fc`. Promotion-browser on `c46c3810e`: after the seeded variant is temporarily unavailable, Review shows `COPY-GIFT-GONE`, drops the included line, and does not open payment. | — | QA |
| `AC-036J-013-04` | **PASS** | Domain,browser | Tranche 3 two qualifying gifts are `NONE_CHOSEN` on `a33197fc`. Promotion-browser on `c46c3810e`: a real included line is shown, then the next cart evaluate is projected to `NONE_CHOSEN`. The line goes away, `COPY-GIFT-CONFLICT` shows, and there is no picker. Two ACTIVE complimentary rows were not seeded. | — | QA |

**MAIN-strict counts:** PASS **37** · NOT_EXECUTED **3** · BLOCKED **0** · FAIL **0**

PASS set: `001-01, 001-02, 002-01, 002-02, 002-03, 002-04, 002-05, 002-06, 002-07, 002-08, 002-09, 002-10, 003-01, 003-02, 004-01, 005-01, 005-02, 006-01, 006-02, 007-01, 008-01, 009-01, 009-02, 009-03, 009-04, 010-01, 010-02, 010-03, 010-04, 011-01, 012-01, 012-03, 012-06, 013-01, 013-02, 013-03, 013-04`.

NOT_EXECUTED set: `012-02, 012-04, 012-05`. Each has executed persistence or partial HTTP proof and is open only because the named admin HTTP call was not the executed layer.

`008-01` is PASS from the merged cross-portal recovery, not from sealed-drift refusal. `013-04` browser evidence is a contract projection of `NONE_CHOSEN` onto the running cart. It is not a second ACTIVE complimentary row.

## Experience Requirements (strict)

| XR | Status | Plan layers | Proof | Missing |
|---|---|---|---|---|
| `XR-IMP-036J-001` | **PASS** | Component,browser,content | Promotion-browser on `c46c3810e`: Offer applied, order saving equals the quote, estimated subtotal, screenshot `ac-001-01-cart`. Mobile screenshot `xr-010-mobile-cart`. | — |
| `XR-IMP-036J-002` | **PASS** | HTTP,component,browser,accessibility | Promotion-browser on `c46c3810e`: Cart and Review share one code; change, remove, and the five failure sentences. The identity result is `role=status` with `aria-live=polite` and receives focus. Payment remains the read-only summary from the merged responsive journey. | — |
| `XR-IMP-036J-003` | **PASS** | Domain,component,browser | Promotion-browser on `c46c3810e`: progress is visible below the threshold, the saving replaces it on Increase, and `COPY-DROPPED` returns on Decrease. Screenshot `xr-003-progress`. | — |
| `XR-IMP-036J-004` | **PASS** | Domain,component,browser | Promotion-browser on `c46c3810e`: order saving, delivery saving, total saved, and payable are one quote. Screenshot `ac-004-01-breakdown`. Pickup does not show a delivery saving. | — |
| `XR-IMP-036J-005` | **PASS** | Component,browser,content | Promotion-browser on `c46c3810e`: strict-keep, equal-kept, and equal-selected. None say better price. Screenshots `ac-009-01-strict-keep`, `xr-005-equal-kept`, `xr-005-equal-selected`. | — |
| `XR-IMP-036J-006` | **PASS** | Component,browser | Promotion-browser on `c46c3810e`: one included ₹0 line and no picker. The conflict projection removes that line and shows `COPY-GIFT-CONFLICT` without a picker. | — |
| `XR-IMP-036J-007` | **PARTIAL** | Integration,browser,accessibility | gtm stale refuse pay | focus + XD COPY-STALE |
| `XR-IMP-036J-008` | **PASS** | Browser,content | Cross-portal on `2dc13719e`: Journey 1 keeps purchased savings on Order Detail after retire. Journey 3 keeps `1 ×`, `₹0.00`, and Included with your offer. | — |
| `XR-IMP-036J-009` | **PARTIAL** | Component,authorization,concurrency,browser | PromotionsEditor + commercial workspace retire on `39954301d`. Tranche 6 concurrency is `AC-036J-012-06`. | Complimentary activation and its non-success are not on the commercial-workspace browser run. |
| `XR-IMP-036J-010` | **PARTIAL** | Accessibility,browser | Promotion-browser on `c46c3810e` includes the mobile cart screenshot and keyboard focus on the failed coupon action and the identity result. | A screen-reader session was not run. |
| `XR-IMP-036J-011` | **PARTIAL** | Component,content,security | component coarse copy. Promotion-browser on `39954301d` shows five coarse sentences and no counts | Security layer is not re-attributed as a strict PASS |
| `XR-IMP-036J-012` | **PASS** | Component,browser,content | Promotion-browser on `c46c3810e`: pickup hides the delivery-only offer and delivery hides the pickup-only offer. Neither surface shows the other mode's saving. | — |
| `XR-IMP-036J-013` | **PASS** | Component,browser,content | Promotion-browser on `c46c3810e`: Review shows the seeded included line, ₹0.00, no picker, and no better-price claim. Screenshot `xr-013-included-review`. | — |

**XR counts:** PASS **9** · PARTIAL **4**

PASS: `001, 002, 003, 004, 005, 006, 008, 012, 013`. PARTIAL: `007, 009, 010, 011`.

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
| `npm run test:e2e:cross-portal-promotion` | `2dc13719e` | **4 passed / EXIT 0** | Log retained beside the run. Postgres name collision recovered before the pass. |
| Nightly Verification | `8552cc63f` | **success** | Commercial workspace 3 passed. Run `41277192586`. |
| `npm run test:e2e:promotion-browser` | `c46c3810e` | **14 passed / 1 skipped / EXIT 0** | Log `/tmp/m2-promotion-browser-final.log`. The skip is the desktop project skipping the mobile-tagged test. Mobile-chromium passed in the same command. |
| `npm run test:e2e:commercial-workspace` | tree squashed into `39954301d` | **3 passed / EXIT 0** | Log `/tmp/m2-commercial-2.log`. Retire keyboard and redemption counts ran. Purchased-order savings were not asserted. |

## Product defects

```text
PRODUCT_FAIL_REPORTED = 0
MANDATORY_BLOCKERS = NONE in the former 011-01 / 013-02 harness gap
REMAINING_NOT_EXECUTED = 3
XR_STRICT_PASS = 9/13
```

Open issues #381/#383/#384/#385 remain evidence/test gaps — not silently reclassified as PASS.

## Independent review summary

```text
QA_INDEPENDENT_REVIEW = pending this revision's review. Prior #530 review is not this head.
PE_INDEPENDENT_REVIEW = pending this revision's review.
XR_STRICT_PASS = 9/13
FOUNDER_UAT = NOT_PERFORMED
IMP036J_ACCEPTED = NO
```
