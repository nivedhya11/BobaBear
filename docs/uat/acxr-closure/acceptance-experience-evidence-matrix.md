# IMP-036J — 40 AC / 13 XR evidence matrix (non-authoritative)

```text
AUTHORITY = NON_AUTHORITATIVE_UAT_EVIDENCE
TASK = BOBA_IMP036J_AC_XR_EVIDENCE_CLOSURE
MAIN_HEAD = f34f6107c099cee10b5a65359e080e0c5b35f3b6
MAIN_TREE = 45a58afba165a7ddbb8fe3a2af5a2ba9894decdd
PR523_HEAD = 42ebc60804f9e462aab253e24ec23a8f190a7687
PR525_HEAD = 50ccbfe6b5b808491b6e7971bb47f3a2fa270fe7
CROSS_PORTAL_COMMIT = d6ae0b8f9d83e022cb7d3c87a65325ac679ec16c  # parked; not MAIN-proven
FOUNDER_UAT = NOT_PERFORMED
IMP036J_ACCEPTED = NO
PROOF_RULE = PASS only if every Quality-plan layer has executed proof on an attributed candidate
DOMAIN_PASS_IS_NOT_BROWSER_PASS = YES
MANDATORY_AC_PROVEN_MAIN = 14/40
EXPERIENCE_REQUIREMENTS_PROVEN = 0/13
```

Independent review (this closure):

- QA: agree MAIN 14/40 after tranche4; reject inflating MAIN with PR523/525 without packet logs; package sibling cap 14–17 if logs attached.
- PE: agree XR 0/13 strict PASS; XR-009 must stay PARTIAL (PR525 authoring ≠ concurrency/complimentary/race/retire).

## Candidate attribution rules

- Rehearsal tree == MAIN tree (`45a58afb…`) for unchanged customer paths.
- Open PR #523 / #525 are **sibling candidates only** — never inflate `MANDATORY_AC_PROVEN_MAIN`.
- Cross-portal shared-DB harness commit exists (`d6ae0b8f9`) but is **not executed** in this packet → 011-01 / 013-02 remain **BLOCKED**.
- Reject rehearsal `ac-matrix.tsv` PARTIAL vocabulary as acceptance PASS.

## Mandatory AC table (MAIN-strict)

| AC | Status | Plan layers | Executed proof (MAIN `f34f6107`) | Missing / notes | Owner |
|---|---|---|---|---|---|
| `AC-036J-001-01` | **PASS** | Domain,component,browser | GJ-FIRST + tranche3/5 (rehearsal on tree≡MAIN) | Browser does not assert rupee==evaluated effect | QA |
| `AC-036J-001-02` | **NOT_EXECUTED** | Domain,browser | tranche3 out-of-window unit | browser absence assert | QA |
| `AC-036J-002-01` | **PASS** | Domain,HTTP,component,browser | gtm-uat Review apply `e2e10`; coupon-journeys; Payment no coupon | Cart-entry path thin; HTTP via gtm browser envelope | QA |
| `AC-036J-002-02` | **NOT_EXECUTED** | HTTP,component,browser | — on MAIN | Sibling PR523 claims HTTP+browser invalid-code @`42ebc608` (not MAIN) | QA |
| `AC-036J-002-03` | **NOT_EXECUTED** | Domain,HTTP,browser | committed-cart remove domain/db | Sibling PR523 claims browser remove @`42ebc608` | QA |
| `AC-036J-002-04` | **NOT_EXECUTED** | HTTP,integration,browser,accessibility | none | sign-in retry browser | QA |
| `AC-036J-002-05` | **NOT_EXECUTED** | Domain,HTTP,browser | tranche4 guest unrestricted domain/HTTP **executed** (49/49 T4) | **browser** still required | QA |
| `AC-036J-002-06` | **NOT_EXECUTED** | HTTP,browser | tranche4 Review/Cart shared coupon commands **executed** | **browser** Cart→Review same code | QA |
| `AC-036J-002-07` | **PASS** | HTTP,browser | gtm-uat first apply on Review | — | QA |
| `AC-036J-002-08` | **NOT_EXECUTED** | HTTP,browser | tranche4 replace/remove HTTP/domain | Sibling PR523 claims Review browser mutate @`42ebc608` | QA |
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
| `AC-036J-008-01` | **PASS** | Integration,recovery,browser | gtm drift refuse pay + checkout-revalidation | XD `COPY-STALE` vs `STALE_UNCONFIRMED` caveat | QA |
| `AC-036J-009-01` | **NOT_EXECUTED** | Domain,browser | tranche3 ₹80+₹40 | browser STRICT_KEEP | QA |
| `AC-036J-009-02` | **NOT_EXECUTED** | Domain,browser | tranche3 ₹90+₹20 | browser | QA |
| `AC-036J-009-03` | **PASS** | Domain,component | tranche3/5 | — | QA |
| `AC-036J-009-04` | **PASS** | Domain,component | tranche3/5 | — | QA |
| `AC-036J-010-01` | **NOT_EXECUTED** | Domain,browser | tranche3 | browser stack | QA |
| `AC-036J-010-02` | **PASS** | Domain | tranche3 BOGO | — | QA |
| `AC-036J-010-03` | **PASS** | Domain | tranche3 best combination | — | QA |
| `AC-036J-010-04` | **PASS** | Domain,component | tranche3/5 standing ₹0 | — | QA |
| `AC-036J-011-01` | **BLOCKED** | Database,HTTP,browser | unit historical savings only | shared-DB retire→customer detail; harness commit `d6ae0b8f9` not executed here | QA |
| `AC-036J-012-01` | **NOT_EXECUTED** | HTTP,authorization,browser | PromotionsEditor component | Sibling PR525 claims commercial authoring browser @`50ccbfe6` (not MAIN) | QA |
| `AC-036J-012-02` | **NOT_EXECUTED** | HTTP,authorization,component | create-identifier adjacent only | activate/retire denial HTTP (`admin-promotions-http`) not in packet | QA |
| `AC-036J-012-03` | **NOT_EXECUTED** | Component,browser,accessibility | PromotionsEditor retire confirm/cancel component+a11y | **No retire step in commercial-workspace E2E** (PE); do not credit PR525 browser retire | QA |
| `AC-036J-012-04` | **NOT_EXECUTED** | Domain,HTTP,authorization | PromotionsEditor complimentary UI | tranche6 gift-invalid HTTP not in packet | QA |
| `AC-036J-012-05` | **NOT_EXECUTED** | Database,HTTP | tranche6 code exists | sequential second activation not executed in packet | QA |
| `AC-036J-012-06` | **NOT_EXECUTED** | Concurrency,database | tranche6 overlapping-activation code exists | concurrency not executed in packet; sequential≠concurrency | QA |
| `AC-036J-013-01` | **NOT_EXECUTED** | Domain,HTTP,browser | tranche3/5 included line | browser/HTTP | QA |
| `AC-036J-013-02` | **BLOCKED** | Database,browser | none | shared-DB purchased complimentary after retire; harness not executed | QA |
| `AC-036J-013-03` | **NOT_EXECUTED** | Integration,recovery,browser | tranche4 unavailable complimentary refuse bind **executed**; tranche5 GIFT_GONE | **browser** gift-unavailable; do not credit cart-line unavailable | QA |
| `AC-036J-013-04` | **NOT_EXECUTED** | Domain,browser | tranche3 NONE_CHOSEN | browser | QA |

**MAIN-strict counts:** PASS **14** · NOT_EXECUTED **24** · BLOCKED **2** · FAIL **0**

PASS set: `001-01, 002-01, 002-07, 002-09, 003-01, 005-01, 005-02, 006-02, 008-01, 009-03, 009-04, 010-02, 010-03, 010-04`.

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
| [PR #523](https://github.com/nivedhya11/BobaBear/pull/523) | `42ebc608` | HTTP invalid/apply/remove + Review coupon browser (open) |
| [PR #525](https://github.com/nivedhya11/BobaBear/pull/525) | `50ccbfe6` | Commercial workspace authoring browser unblock (open; CI green). Does **not** prove retire browser (PE) |
| Cross-portal harness | `d6ae0b8f9` | Shared-DB browser proof package (parked/local). **Not executed** in this closure packet |

## Closure-run execution

| Command | Candidate | Result | Notes |
|---|---|---|---|
| `npm run test:imp036j:tranche4` | MAIN `f34f6107` | **49 passed / EXIT 0** | Vitest accepted; post-suite docker cleanup `database is locked` only. Initial suite-body failures: none. Diagnostic reruns: none. |
| `npm run test:imp036j:tranche6` | MAIN | **INCOMPLETE in packet** | PromotionsEditor 25 passed observed; DB/concurrency portion not retained after `/tmp` cleanup |
| `admin-promotions-http` | MAIN | **INCOMPLETE in packet** | Started; log lost with `/tmp` cleanup before terminal capture |
| PR523 HTTP regression | `42ebc608` | historically 3 passed (prior recon) | not re-attached this packet |
| PR525 commercial-workspace | `50ccbfe6` | historically 3 passed | not re-attached this packet |

## Product defects

```text
PRODUCT_FAIL_REPORTED = 0
MANDATORY_BLOCKERS = AC-036J-011-01, AC-036J-013-02
```

Open issues #381/#383/#384/#385 remain evidence/test gaps — not silently reclassified as PASS.

## Independent review summary

```text
QA_INDEPENDENT_REVIEW = COMPLETE (agree MAIN 14/40; FOUNDER_UAT NOT_PERFORMED)
PE_INDEPENDENT_REVIEW = COMPLETE (XR 0/13; XR-009 PARTIAL only; FOUNDER_UAT NOT_PERFORMED)
```
