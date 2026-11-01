# IMP-036J — 40 AC / 13 XR evidence matrix (non-authoritative)

```text
AUTHORITY = NON_AUTHORITATIVE_UAT_EVIDENCE
TASK = BOBA_IMP036J_AC_XR_EVIDENCE_CLOSURE
MAIN_HEAD = 39954301d
MAIN_TREE = 7c7b071446aad206a773bb443f184dce0c622bc6
MERGED = #525 1e59a4cd6, #523 029a37741, #526 8552cc63f, #527 2820f3989, #529 b3b14f76a, #530 39954301d
CROSS_PORTAL_EXECUTED_HEAD = 2dc13719e00dc3a36729508f878601876a01b0f5
CROSS_PORTAL_RESULT = 4 passed / EXIT 0 / 2026-11-01T08:16:41Z
CROSS_PORTAL_LOG = local, not committed; result line above is the record
FOUNDER_UAT = NOT_PERFORMED
IMP036J_ACCEPTED = NO
PROOF_RULE = PASS only if every Quality-plan layer has executed proof on an attributed candidate
DOMAIN_PASS_IS_NOT_BROWSER_PASS = YES
MANDATORY_AC_PROVEN_MAIN = 20/40
EXPERIENCE_REQUIREMENTS_PROVEN = 0/13
```

Independent review (this closure):

- QA: MAIN-strict is **20/40**. `001-01`, `002-06`, `002-08`, `002-10`, and `007-01` move to PASS from the official promotion-browser suite on `39954301d` (11 passed / 1 skipped / EXIT 0). `008-01`, `011-01`, and `013-02` remain PASS from the merged cross-portal run (`2dc13719e`, tree identical for that spec to `b3b14f76a`).
- PE: XR strict PASS stays **0/13**. XR-009 stays PARTIAL. Authoring, retire, and history browser proof is not a full experience pass.

## Candidate attribution rules

- #523, #525, #526, #527, and #529 are merged. A test file on main is not an executed test.
- Cross-portal Journeys 1–3 and Negatives ran on `2dc13719e` (4 passed). That spec matches `b3b14f76a`. This is integrated proof for the rows marked PASS below, not a second post-squash rerun.
- Rows that still lack a required browser layer stay NOT_EXECUTED.

## Mandatory AC table (MAIN-strict)

| AC | Status | Plan layers | Executed proof (MAIN `39954301d`) | Missing / notes | Owner |
|---|---|---|---|---|---|
| `AC-036J-001-01` | **PASS** | Domain,component,browser | Domain/component + official promotion-browser on `39954301d`: displayed ORDER_SAVING equals the quote, and the cart stays an estimate. 11 passed / 1 skipped / EXIT 0. | Mobile project runs the same equality. Desktop skip of the mobile-tagged test is the suite's one skip. | QA |
| `AC-036J-001-02` | **NOT_EXECUTED** | Domain,browser | tranche3 out-of-window unit | browser absence assert | QA |
| `AC-036J-002-01` | **PASS** | Domain,HTTP,component,browser | gtm-uat Review apply `e2e10`; coupon-journeys; Payment no coupon | Cart-entry path thin; HTTP via gtm browser envelope | QA |
| `AC-036J-002-02` | **NOT_EXECUTED** | HTTP,component,browser | — | #523 code is on main. This packet does not attach a fresh invalid-code browser run, so it stays NOT_EXECUTED. | QA |
| `AC-036J-002-03` | **NOT_EXECUTED** | Domain,HTTP,browser | committed-cart remove domain/db | #523 browser remove is merged source. Not re-executed in this packet. | QA |
| `AC-036J-002-04` | **NOT_EXECUTED** | HTTP,integration,browser,accessibility | Promotion-browser on `39954301d` focuses the carried coupon result after sign-in | HTTP, integration, and accessibility layers are not attached. Browser alone does not close the row. | QA |
| `AC-036J-002-05` | **NOT_EXECUTED** | Domain,HTTP,browser | tranche4 guest unrestricted domain/HTTP **executed** (49/49 T4) | **browser** still required | QA |
| `AC-036J-002-06` | **PASS** | HTTP,browser | tranche4 shared coupon commands + promotion-browser on `39954301d`: Cart code is the Review code and the same ORDER_SAVING | — | QA |
| `AC-036J-002-07` | **PASS** | HTTP,browser | gtm-uat first apply on Review | — | QA |
| `AC-036J-002-08` | **PASS** | HTTP,browser | tranche4 replace/remove HTTP/domain + promotion-browser on `39954301d`: Review replace drops the previous code; remove clears ORDER_SAVING | — | QA |
| `AC-036J-002-09` | **PASS** | Component,browser,accessibility | GJ + responsive Payment read-only Tab sequence | — | QA |
| `AC-036J-002-10` | **PASS** | Recovery,component,browser | tranche5 RETRY component + promotion-browser on `39954301d`: aborted Review replace and remove keep the previous code and payable, show RETRY, and leave Try again in the tab order. Focus stays on Change or Remove. | Cart dropped-request is not in this browser run. Review remove is retried successfully after the fault is lifted. | QA |
| `AC-036J-003-01` | **PASS** | Domain,component | tranche3/5 server gap (no browser required by AC) | XR-003 still needs browser | QA |
| `AC-036J-003-02` | **NOT_EXECUTED** | Domain,browser | tranche5 DROPPED unit | browser cross/drop | QA |
| `AC-036J-004-01` | **NOT_EXECUTED** | Domain,component,browser | tranche3/5 component equality | full browser breakdown | QA |
| `AC-036J-005-01` | **PASS** | Domain,database | **tranche4 executed** first-order reserve/consume/abandoned-release + concurrent guard | — | QA |
| `AC-036J-005-02` | **PASS** | Domain,database | **tranche4 executed** refund does not restore / prior success ineligible | — | QA |
| `AC-036J-006-01` | **NOT_EXECUTED** | Domain,browser | coupon-recovery domain/db + promotion-browser on `39954301d`: delivery-only offer absent on pickup, and both inapplicable mode sentences | Pickup-only automatic offer absence on delivery is not asserted | QA |
| `AC-036J-006-02` | **PASS** | Domain,integration | **tranche4 executed** `SCHEDULED-only Offer… (AC-036J-006-02)` | — | QA |
| `AC-036J-007-01` | **PASS** | Domain,component,browser,content | tranche5 five sentences + promotion-browser on `39954301d`: invalid, expired, inapplicable, global exhaustion, and personal exhaustion are five sentences. Counts are absent. Cap seed counts RESERVED+CONSUMED by promotion and excludes RELEASED. | — | QA |
| `AC-036J-008-01` | **PASS** | Integration,recovery,browser | Cross-portal Negatives on `2dc13719e` (4 passed, EXIT 0). Retire after Review, payment does not open, Review `copy-stale` text, recovered payable ≠ retired payable. | Sealed-drift refuse is not this proof. | QA |
| `AC-036J-009-01` | **NOT_EXECUTED** | Domain,browser | tranche3 ₹80+₹40 | browser STRICT_KEEP | QA |
| `AC-036J-009-02` | **NOT_EXECUTED** | Domain,browser | tranche3 ₹90+₹20 | browser | QA |
| `AC-036J-009-03` | **PASS** | Domain,component | tranche3/5 | — | QA |
| `AC-036J-009-04` | **PASS** | Domain,component | tranche3/5 | — | QA |
| `AC-036J-010-01` | **NOT_EXECUTED** | Domain,browser | tranche3 | browser stack | QA |
| `AC-036J-010-02` | **PASS** | Domain | tranche3 BOGO | — | QA |
| `AC-036J-010-03` | **PASS** | Domain | tranche3 best combination | — | QA |
| `AC-036J-010-04` | **PASS** | Domain,component | tranche3/5 standing ₹0 | — | QA |
| `AC-036J-011-01` | **PASS** | Database,HTTP,browser | Journey 1 on `2dc13719e`: shared DB, owned-order HTTP, then My Orders → Order Detail `You saved` / Order saving after retire. | Spec bytes match `b3b14f76a`. | QA |
| `AC-036J-012-01` | **NOT_EXECUTED** | HTTP,authorization,browser | PromotionsEditor component | #525 authoring browser is merged. Full activate/redeem browser packet is not re-attributed as PASS here. | QA |
| `AC-036J-012-02` | **NOT_EXECUTED** | HTTP,authorization,component | create-identifier adjacent only | activate/retire denial HTTP (`admin-promotions-http`) not in packet | QA |
| `AC-036J-012-03` | **NOT_EXECUTED** | Component,browser,accessibility | PromotionsEditor retire confirm/cancel component+a11y. Commercial workspace on the tree squashed into `39954301d`: 3 passed / EXIT 0. Cancel stays active; Enter on Retire offer shows the retired sentence. Screenshots `operator-redemption-counts.png`, `operator-retire-confirmed.png`. | Purchased orders keeping sealed savings are not asserted in that journey | QA |
| `AC-036J-012-04` | **NOT_EXECUTED** | Domain,HTTP,authorization | PromotionsEditor complimentary UI | tranche6 gift-invalid HTTP not in packet | QA |
| `AC-036J-012-05` | **NOT_EXECUTED** | Database,HTTP | tranche6 code exists | sequential second activation not executed in packet | QA |
| `AC-036J-012-06` | **NOT_EXECUTED** | Concurrency,database | tranche6 overlapping-activation code exists | concurrency not executed in packet; sequential≠concurrency | QA |
| `AC-036J-013-01` | **NOT_EXECUTED** | Domain,HTTP,browser | tranche3/5 included line | browser/HTTP | QA |
| `AC-036J-013-02` | **PASS** | Database,browser | Journey 3 on `2dc13719e`: after retire, Order Detail shows `1 ×` product, `₹0.00`, and Included with your offer. | API line assert remains; it is not the only proof. | QA |
| `AC-036J-013-03` | **NOT_EXECUTED** | Integration,recovery,browser | tranche4 unavailable complimentary refuse bind **executed**; tranche5 GIFT_GONE | **browser** gift-unavailable; do not credit cart-line unavailable | QA |
| `AC-036J-013-04` | **NOT_EXECUTED** | Domain,browser | tranche3 NONE_CHOSEN | browser | QA |

**MAIN-strict counts:** PASS **20** · NOT_EXECUTED **20** · BLOCKED **0** · FAIL **0**

PASS set: `001-01, 002-01, 002-06, 002-07, 002-08, 002-09, 002-10, 003-01, 005-01, 005-02, 006-02, 007-01, 008-01, 009-03, 009-04, 010-02, 010-03, 010-04, 011-01, 013-02`.

`008-01` is PASS from the merged cross-portal recovery, not from sealed-drift refusal. `006-01` stays NOT_EXECUTED because the reverse automatic-offer absence is not asserted. `012-03` stays NOT_EXECUTED because purchased orders keeping sealed savings are not asserted.

## Experience Requirements (strict)

| XR | Status | Plan layers | Proof | Missing |
|---|---|---|---|---|
| `XR-IMP-036J-001` | **PARTIAL** | Component,browser,content | GJ Offer applied + ORDER_SAVING | content QA / applied-offer screenshot |
| `XR-IMP-036J-002` | **PARTIAL** | HTTP,component,browser,accessibility | Payment read-only + Review apply. Promotion-browser on `39954301d` covers Cart→Review and the five failure sentences | Accessibility layer is not attached |
| `XR-IMP-036J-003` | **PARTIAL** | Domain,component,browser | unit threshold | browser |
| `XR-IMP-036J-004` | **PARTIAL** | Domain,component,browser | unit savings model | browser breakdown |
| `XR-IMP-036J-005` | **PARTIAL** | Component,browser,content | tranche5 three-class copy | browser |
| `XR-IMP-036J-006` | **PARTIAL** | Component,browser | tranche3/5 included line | browser |
| `XR-IMP-036J-007` | **PARTIAL** | Integration,browser,accessibility | gtm stale refuse pay | focus + XD COPY-STALE |
| `XR-IMP-036J-008` | **PARTIAL** | Browser,content | GJ confirmation/history | sealed split / included line browser |
| `XR-IMP-036J-009` | **PARTIAL** | Component,authorization,concurrency,browser | PromotionsEditor + sibling PR525 authoring. Commercial workspace retire keyboard ran on the tree squashed into `39954301d` | Concurrency, complimentary activation, and race are not executed. Not PASS from retire alone |
| `XR-IMP-036J-010` | **PARTIAL** | Accessibility,browser | responsive sticky/Tab/overflow subset. Promotion-browser on `39954301d` keeps failed Change/Remove focus on that action and reaches Try again by Tab | Screen-reader announcement is not attached |
| `XR-IMP-036J-011` | **PARTIAL** | Component,content,security | component coarse copy. Promotion-browser on `39954301d` shows five coarse sentences and no counts | Security layer is not re-attributed as a strict PASS |
| `XR-IMP-036J-012` | **PARTIAL** | Component,browser,content | GJ first/returning | browser mode switch |
| `XR-IMP-036J-013` | **PARTIAL** | Component,content | tranche3/5 tie presentation | browser |

**XR counts:** PASS **0** · PARTIAL **13**

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
| `npm run test:e2e:promotion-browser` | `39954301d` | **11 passed / 1 skipped / EXIT 0** | Log `/tmp/m2-promotion-browser-main.log`. The skip is the desktop project ignoring the mobile-tagged test. |
| `npm run test:e2e:commercial-workspace` | tree squashed into `39954301d` | **3 passed / EXIT 0** | Log `/tmp/m2-commercial-2.log`. Retire keyboard and redemption counts ran. Purchased-order savings were not asserted. |

## Product defects

```text
PRODUCT_FAIL_REPORTED = 0
MANDATORY_BLOCKERS = NONE in the former 011-01 / 013-02 harness gap
REMAINING_NOT_EXECUTED = 20
XR_STRICT_PASS = 0/13
```

Open issues #381/#383/#384/#385 remain evidence/test gaps — not silently reclassified as PASS.

## Independent review summary

```text
QA_INDEPENDENT_REVIEW = PASS for the #530 focus and cap correction on f6ca90d3d. Not an IMP acceptance.
PE_INDEPENDENT_REVIEW = PASS for the same head. Focus stays on the failed action. Cap sentences do not leak counts. XR strict PASS remains 0/13.
XR_STRICT_PASS = 0/13
FOUNDER_UAT = NOT_PERFORMED
IMP036J_ACCEPTED = NO
```
