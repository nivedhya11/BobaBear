# IMP-036J — 40 AC / 13 XR evidence matrix (non-authoritative)

```text
AUTHORITY = NON_AUTHORITATIVE_UAT_EVIDENCE
TASK = BOBA_IMP036J_AC_XR_EVIDENCE_CLOSURE
MAIN_HEAD = b3b14f76a
MAIN_TREE = 8b13e38aa8be2d12157b9a64c9ac091e225ea702
MERGED = #525 1e59a4cd6, #523 029a37741, #526 8552cc63f, #527 2820f3989, #529 b3b14f76a
CROSS_PORTAL_EXECUTED_HEAD = 2dc13719e00dc3a36729508f878601876a01b0f5
CROSS_PORTAL_RESULT = 4 passed / EXIT 0 / 2026-11-01T08:16:41Z
CROSS_PORTAL_LOG = local, not committed; result line above is the record
FOUNDER_UAT = NOT_PERFORMED
IMP036J_ACCEPTED = NO
PROOF_RULE = PASS only if every Quality-plan layer has executed proof on an attributed candidate
DOMAIN_PASS_IS_NOT_BROWSER_PASS = YES
MANDATORY_AC_PROVEN_MAIN = 15/40
EXPERIENCE_REQUIREMENTS_PROVEN = 0/13
```

Independent review (this closure):

- QA: MAIN-strict is **15/40**. `001-01` stays NOT_EXECUTED (browser saving equality still missing). `008-01`, `011-01`, and `013-02` are PASS only from the merged cross-portal run (`2dc13719e`, tree identical for that spec to `b3b14f76a`).
- PE: XR strict PASS stays **0/13**. XR-009 stays PARTIAL. Authoring, retire, and history browser proof is not a full experience pass.

## Candidate attribution rules

- #523, #525, #526, #527, and #529 are merged. A test file on main is not an executed test.
- Cross-portal Journeys 1–3 and Negatives ran on `2dc13719e` (4 passed). That spec matches `b3b14f76a`. This is integrated proof for the rows marked PASS below, not a second post-squash rerun.
- Rows that still lack a required browser layer stay NOT_EXECUTED.

## Mandatory AC table (MAIN-strict)

| AC | Status | Plan layers | Executed proof (MAIN `b3b14f76a`) | Missing / notes | Owner |
|---|---|---|---|---|---|
| `AC-036J-001-01` | **NOT_EXECUTED** | Domain,component,browser | Domain/component + GJ-FIRST path (partial) | Quality plan requires browser equality of displayed ORDER_SAVING vs evaluated merchandise effect; that assert is not executed on MAIN. Keep PARTIAL narrative only. | QA |
| `AC-036J-001-02` | **NOT_EXECUTED** | Domain,browser | tranche3 out-of-window unit | browser absence assert | QA |
| `AC-036J-002-01` | **PASS** | Domain,HTTP,component,browser | gtm-uat Review apply `e2e10`; coupon-journeys; Payment no coupon | Cart-entry path thin; HTTP via gtm browser envelope | QA |
| `AC-036J-002-02` | **NOT_EXECUTED** | HTTP,component,browser | — | #523 code is on main. This packet does not attach a fresh invalid-code browser run, so it stays NOT_EXECUTED. | QA |
| `AC-036J-002-03` | **NOT_EXECUTED** | Domain,HTTP,browser | committed-cart remove domain/db | #523 browser remove is merged source. Not re-executed in this packet. | QA |
| `AC-036J-002-04` | **NOT_EXECUTED** | HTTP,integration,browser,accessibility | none | sign-in retry browser | QA |
| `AC-036J-002-05` | **NOT_EXECUTED** | Domain,HTTP,browser | tranche4 guest unrestricted domain/HTTP **executed** (49/49 T4) | **browser** still required | QA |
| `AC-036J-002-06` | **NOT_EXECUTED** | HTTP,browser | tranche4 Review/Cart shared coupon commands **executed** | **browser** Cart→Review same code | QA |
| `AC-036J-002-07` | **PASS** | HTTP,browser | gtm-uat first apply on Review | — | QA |
| `AC-036J-002-08` | **NOT_EXECUTED** | HTTP,browser | tranche4 replace/remove HTTP/domain | #523 Review browser mutate is merged source. Not re-executed in this packet. | QA |
| `AC-036J-002-09` | **PASS** | Component,browser,accessibility | GJ + responsive Payment read-only Tab sequence | — | QA |
| `AC-036J-002-10` | **NOT_EXECUTED** | Recovery,component,browser | tranche5 RETRY component | dropped-network browser fault injection | QA |
| `AC-036J-003-01` | **PASS** | Domain,component | tranche3/5 server gap (no browser required by AC) | XR-003 still needs browser | QA |
| `AC-036J-003-02` | **NOT_EXECUTED** | Domain,browser | tranche5 DROPPED unit | browser cross/drop | QA |
| `AC-036J-004-01` | **NOT_EXECUTED** | Domain,component,browser | tranche3/5 component equality | full browser breakdown | QA |
| `AC-036J-005-01` | **PASS** | Domain,database | **tranche4 executed** first-order reserve/consume/abandoned-release + concurrent guard | — | QA |
| `AC-036J-005-02` | **PASS** | Domain,database | **tranche4 executed** refund does not restore / prior success ineligible | — | QA |
| `AC-036J-006-01` | **NOT_EXECUTED** | Domain,browser | coupon-recovery 8/8 domain/db | browser mode clause | QA |
| `AC-036J-006-02` | **PASS** | Domain,integration | **tranche4 executed** `SCHEDULED-only Offer… (AC-036J-006-02)` | — | QA |
| `AC-036J-007-01` | **NOT_EXECUTED** | Domain,component,browser,content | tranche5 five sentences | browser five classes | QA |
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
| `AC-036J-012-03` | **NOT_EXECUTED** | Component,browser,accessibility | PromotionsEditor retire confirm/cancel component+a11y | **No retire step in commercial-workspace E2E** (PE); do not credit PR525 browser retire | QA |
| `AC-036J-012-04` | **NOT_EXECUTED** | Domain,HTTP,authorization | PromotionsEditor complimentary UI | tranche6 gift-invalid HTTP not in packet | QA |
| `AC-036J-012-05` | **NOT_EXECUTED** | Database,HTTP | tranche6 code exists | sequential second activation not executed in packet | QA |
| `AC-036J-012-06` | **NOT_EXECUTED** | Concurrency,database | tranche6 overlapping-activation code exists | concurrency not executed in packet; sequential≠concurrency | QA |
| `AC-036J-013-01` | **NOT_EXECUTED** | Domain,HTTP,browser | tranche3/5 included line | browser/HTTP | QA |
| `AC-036J-013-02` | **PASS** | Database,browser | Journey 3 on `2dc13719e`: after retire, Order Detail shows `1 ×` product, `₹0.00`, and Included with your offer. | API line assert remains; it is not the only proof. | QA |
| `AC-036J-013-03` | **NOT_EXECUTED** | Integration,recovery,browser | tranche4 unavailable complimentary refuse bind **executed**; tranche5 GIFT_GONE | **browser** gift-unavailable; do not credit cart-line unavailable | QA |
| `AC-036J-013-04` | **NOT_EXECUTED** | Domain,browser | tranche3 NONE_CHOSEN | browser | QA |

**MAIN-strict counts:** PASS **15** · NOT_EXECUTED **25** · BLOCKED **0** · FAIL **0**

PASS set: `002-01, 002-07, 002-09, 003-01, 005-01, 005-02, 006-02, 008-01, 009-03, 009-04, 010-02, 010-03, 010-04, 011-01, 013-02`.

`001-01` stays NOT_EXECUTED. `008-01` is PASS from the merged cross-portal recovery, not from sealed-drift refusal.

## Experience Requirements (strict)

| XR | Status | Plan layers | Proof | Missing |
|---|---|---|---|---|
| `XR-IMP-036J-001` | **PARTIAL** | Component,browser,content | GJ Offer applied + ORDER_SAVING | content QA / applied-offer screenshot |
| `XR-IMP-036J-002` | **PARTIAL** | HTTP,component,browser,accessibility | Payment read-only + Review apply | Cart↔Review + failure classes on MAIN |
| `XR-IMP-036J-003` | **PARTIAL** | Domain,component,browser | unit threshold | browser |
| `XR-IMP-036J-004` | **PARTIAL** | Domain,component,browser | unit savings model | browser breakdown |
| `XR-IMP-036J-005` | **PARTIAL** | Component,browser,content | tranche5 three-class copy | browser |
| `XR-IMP-036J-006` | **PARTIAL** | Component,browser | tranche3/5 included line | browser |
| `XR-IMP-036J-007` | **PARTIAL** | Integration,browser,accessibility | gtm stale refuse pay | focus + XD COPY-STALE |
| `XR-IMP-036J-008` | **PARTIAL** | Browser,content | GJ confirmation/history | sealed split / included line browser |
| `XR-IMP-036J-009` | **PARTIAL** | Component,authorization,concurrency,browser | PromotionsEditor + sibling PR525 authoring (disclosed) | concurrency/complimentary/race/retire not full; **not PASS from PR525 alone** |
| `XR-IMP-036J-010` | **PARTIAL** | Accessibility,browser | responsive sticky/Tab/overflow subset | failure-focus / SR |
| `XR-IMP-036J-011` | **PARTIAL** | Component,content,security | component coarse copy | browser five classes |
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

## Product defects

```text
PRODUCT_FAIL_REPORTED = 0
MANDATORY_BLOCKERS = NONE in the former 011-01 / 013-02 harness gap
REMAINING_NOT_EXECUTED = 25
XR_STRICT_PASS = 0/13
```

Open issues #381/#383/#384/#385 remain evidence/test gaps — not silently reclassified as PASS.

## Independent review summary

```text
QA_INDEPENDENT_REVIEW = NOT_REPEATED_THIS_RUN
PE_INDEPENDENT_REVIEW = NOT_REPEATED_THIS_RUN
XR_STRICT_PASS = 0/13
FOUNDER_UAT = NOT_PERFORMED
IMP036J_ACCEPTED = NO
```
