# IMP-036J Founder UAT package — coupon operator journey and coupon outcomes (GTM wave 2026-10-24)

```text
SLICE = IMP-036J
CONTRACT = PD-IMP-036J-DRAFT-6 / XD-IMP-036J-DRAFT-6 (APPROVED)
ISSUES = #376 #381 #383 #384 (#384A only; #384B owned by GTM Agent A) #385
WAVE = BOBA-PRODUCT-GTM-CLOSURE-20261024 (#435), Agent C
SOURCE_BASE = 00ef486e9dbeb1a30ba32e76fcd7b8b43507a53f
SOURCE_BRANCH = fix/gtm-036j-coupon-operator-ux
FOUNDER_UAT_VERDICT_OWNER = HUMAN_FOUNDER
FOUNDER_UAT = FUNCTIONAL_UAT + EXPERIENCE_UAT
FUNCTIONAL_UAT = NOT_PERFORMED
EXPERIENCE_UAT = NOT_PERFORMED
FOUNDER_UAT_RESULT = NOT_PERFORMED
STAGING_DEPLOYED_BY_THIS_PACKAGE = NO
IMP036J_ACCEPTED = NO
```

This package is evidence input only. It does not grant a UAT verdict, acceptance, merge or
deployment. Every verdict cell below stays `NOT_PERFORMED` until the Founder fills it.

## 1. Exact candidate (fill at UAT time)

The candidate is not chosen by this package. Record it before starting.

| Field | Value |
|---|---|
| Repository path | `/home/ajoshi/repos/boba-bear-platform` |
| Branch | TO BE RECORDED |
| `HEAD` | TO BE RECORDED (must contain this PR's merge, if merged) |
| `WORKING_TREE_FINGERPRINT` (`npm run working-tree:fingerprint`) | TO BE RECORDED |
| Staging image / deployment id | TO BE RECORDED |
| Tester | Founder |
| Date / time (IST) | TO BE RECORDED |

## 2. Test-data control (before starting)

- List active promotions and their coupon codes in Commercial → Promotions. Note anything that
  could overlap with the scenario offer (another automatic or coupon offer on the same items).
- Use fresh identifiers for this run, for example promotion identifier `gtm-uat-1024` and coupon
  code `GTMUAT10`. Do not reuse `test123` / `TEST123`.
- Decide in advance whether the test promotion is retired at the end (step 9) or kept.
- Use a test customer account. Do not enter real payment details; stop at Review.

## 3. End-to-end script — configure → issue → activate → redeem → monitor → retire

Each step lists what the Founder should see in this candidate. "Functional" = it works;
"Experience" = it is understandable without help.

| # | Action | Expected in this candidate | Functional | Experience | Notes |
|---|---|---|---|---|---|
| 1 | Commercial → Promotions → Create promotion. Type `GTM-UAT` (capitals) in **Promotion identifier (internal)** and press Create. | Nothing is sent to the server. The field shows "Use lowercase letters, numbers, hyphens or underscores, starting with a letter or number (for example summer-10)." The help text says customers can't type this at checkout. | NOT_PERFORMED | NOT_PERFORMED | Covers the #381 operator path. |
| 2 | Change to `gtm-uat-1024`, display name `GTM UAT 10% off`, trigger **coupon**, scope brand, Create. | Promotion created as draft. Detail shows "Promotion identifier: gtm-uat-1024 (internal, not a coupon code)". **Customer readiness** says draft and gives the next step. Steps list shows what is done and to do. | NOT_PERFORMED | NOT_PERFORMED | |
| 3 | Set benefit: 10% off; fulfilment modes **Delivery only**; save. | "What customers get (saved settings)" reads "Customers need a coupon code…", "10% off eligible items.", "Delivery orders only. Pickup orders don't get it." | NOT_PERFORMED | NOT_PERFORMED | Readiness sentences come only from saved server values. |
| 4 | Look at the Coupon codes section before activating. | "No coupon codes yet. Customers can't use this offer until you create a coupon code and activate it." Hint says coupon codes can be activated after the promotion is active. | NOT_PERFORMED | NOT_PERFORMED | #376 zero-coupon state. |
| 5 | Review & activate the promotion (read the consequence preview). | Promotion active. Readiness turns to a warning: "Active, but customers can't use it yet: no coupon code is active." | NOT_PERFORMED | NOT_PERFORMED | #376 core finding: activation alone is not readiness. |
| 6 | Create coupon code: leave **Coupon code customers type** empty and press create. Then type `gtmuat10` and create. | Empty: "Enter the coupon code customers will type." (no request). Then: "Coupon created as a draft. Activate it so customers can use it. Code: GTMUAT10." Readiness still warns "No active coupon codes…". | NOT_PERFORMED | NOT_PERFORMED | Codes are saved in capitals. |
| 7 | Activate the coupon code. | Readiness turns success: "Customers can receive this offer by typing an active coupon code." and lists "Active coupon codes: GTMUAT10". | NOT_PERFORMED | NOT_PERFORMED | |
| 8a | Customer: add items, Cart → apply `gtmuat10`, choose **Delivery**, go to Review. | Coupon applied; saving shown; payable reflects 10% off eligible items. | NOT_PERFORMED | NOT_PERFORMED | Note Review item line vs Subtotal for #385 (section 5). |
| 8b | On Review, switch to **Takeaway (pickup)**. | Clear message that this coupon doesn't apply to pickup orders; no saving; payable increases accordingly; no generic error, no stuck spinner. | NOT_PERFORMED | NOT_PERFORMED | #383 / #384A. |
| 8c | Switch back to **Delivery**. | Saving returns from a fresh evaluation; no stale "not applicable" message; no checkout-state error. | NOT_PERFORMED | NOT_PERFORMED | #384A. #384B checkout-state conflict is tested in Agent A's package. |
| 8d | Remove the coupon on Review (or Cart), then continue toward payment (stop before entering payment). | Saving disappears and total recomputes; continuing does not use the old discounted amount. | NOT_PERFORMED | NOT_PERFORMED | Committed-cart authority (AC-036J-002-03/08). |
| 9 | Operator: open the promotion again; check applications/redemptions; then retire (if decided in section 2). | Counters reflect the test; retired promotion shows the retired readiness message and no next step. | NOT_PERFORMED | NOT_PERFORMED | |

Not clickable in this delivery: the agent could not run this script in a browser. Workforce
sign-in requires staff authentication/MFA, and staging deployment was out of scope. Steps 1–7
are covered by component tests; steps 8a–8d by database-backed domain tests (section 6).

## 4. Issue-by-issue disposition

| Issue | What this delivery did | Evidence | Founder verdict |
|---|---|---|---|
| #376 operator journey unclear | **Implemented** (operator UI copy and structure only): separate labels for *Promotion identifier (internal)* vs *Coupon code customers type*; customer readiness panel (draft / active without coupon / active with coupon / unknown / retired) with next step and ordered steps; "What customers get" sentences from saved settings; coupon-code empty state; client-side field validation with named fields. Removed "Current benefit: Configured (server)". No permission, grant, eligibility or editing-authority change. | `tests/administration/PromotionsEditor.test.tsx`, `tests/administration/promotion-readiness.test.ts` | NOT_PERFORMED |
| #381 intermittent create HTTP 500 | **Diagnosed locally; staging cause NOT PROVEN.** Reproduced a deterministic route to `INTERNAL_ERROR` (HTTP 500) on create: identifiers that break the database identifier rule (`TEST123`, `Test123`, `test 123`, `test.123`) and free-text territory ids that are not ids or don't exist. The server maps only duplicates (to 409); other database rejections fall through to 500. This fits the staging pattern (two failures, then lowercase `test123` succeeded at 06:04:44Z) but staging request bodies were not captured, so attribution stays a hypothesis. **UI prevention implemented** for the identifier field. **Server-side mapping to a 400 field error is not implemented** (outside this delivery's allowed scope); recommended follow-up. | `tests/administration/imp036j-381-create-promotion.diagnostic.integration.test.ts` | NOT_PERFORMED |
| #383 Delivery-only coupon on pickup | **Verified, not reimplemented.** The merged fix on the base passes 8/8 against a real database. Added committed-cart authority regression for both modes. | `tests/checkout/imp036j-coupon-recovery.domain.test.ts`, `tests/checkout/imp036j-gtm-committed-cart-authority.domain.test.ts` | NOT_PERFORMED |
| #384A client coupon misclassification across mode switch | **Verified, not reimplemented** (component flow on base). Mode-switch authority regression added (above). | `src/components/ordering/imp036j-coupon-recovery.checkout-client.test.tsx` | NOT_PERFORMED |
| #384B checkout-state conflict | **Not in this delivery** — owned by GTM Agent A. Not weakened here. | Agent A package | NOT_PERFORMED |
| #385 item line vs gross subtotal | **Founder decision prepared; nothing changed for customers.** Options A and B with fixture figures in section 5. | `tests/checkout/imp036j-385-line-presentation-options.fixture.test.ts` | DECISION PENDING / NOT_PERFORMED |

### #381 ruled out / not asserted

- PostgreSQL `57P01` (connection terminated) is **not** asserted causal; it also appears as
  teardown noise in local test runs.
- The zero-issued-coupon state (#376) is unrelated to create failures.
- No evidenced link between #381 and the later #383/#384 checkout findings (consistent with the
  2026-10-08 R0 finding).
- Not tested: database unavailability or timeouts during create (would also surface as 500).

## 5. #385 — Founder decision: how Review shows an item line when a saving applies

Today (unchanged): the item line shows the **net** line total (after the item's share of the
saving, including its share of tax). Price summary shows a **gross** Subtotal and a separate
saving. Arithmetic is correct; the mix is unlabelled.

- **Option A — gross item line + separate saving.** Item line shows the pre-saving amount
  (server `lineSubtotalPaise`); the saving is shown on its own (server
  `linePromotionDiscountPaise` per line, or only the order-level saving). All figures come
  straight from the sealed snapshot — no client-side price reconstruction. Note: today's item
  line includes tax; under Option A the line would be pre-tax, so tax must stay visible in the
  summary.
- **Option B — keep the net item line, label it.** Same number as today (server
  `lineTotalPaise`), with a label such as "after saving". No money figure changes.

Neither option changes prices, discounts, tax or payable. Choosing one is a Founder
product/experience decision; no implementation exists in this branch.

Fixture evidence (real checkout evaluation, Delivery, tax-exclusive 5% fixture, no charges):

| Scenario | Item (qty) | A: gross line | A: saving | Line tax | B: net line (today) | Subtotal | Saving | Tax | Payable |
|---|---|---|---|---|---|---|---|---|---|
| 10% off | ₹100 item (1) | ₹100.00 | ₹10.00 | ₹4.50 | ₹94.50 | ₹100.00 | ₹10.00 | ₹4.50 | ₹94.50 |
| ₹30 off | ₹100 item (1) | ₹100.00 | ₹30.00 | ₹3.50 | ₹73.50 | ₹100.00 | ₹30.00 | ₹3.50 | ₹73.50 |
| Buy 1 get 1 | ₹100 item (2) | ₹200.00 | ₹100.00 | ₹5.00 | ₹105.00 | ₹200.00 | ₹100.00 | ₹5.00 | ₹105.00 |
| 10% off incl. modifiers | ₹150 item + ₹33 modifier (1) | ₹183.00 | ₹18.30 | ₹8.23 | ₹172.93 | ₹283.00 | ₹28.30 | ₹12.74 | ₹267.44 |
|  | ₹100 item (1) | ₹100.00 | ₹10.00 | ₹4.51 | ₹94.51 |  |  |  |  |

Observations for the decision:

- Every scenario satisfies: gross − saving + line tax = net line; the line savings add up to the
  order saving; gross lines add up to the Subtotal.
- In the two-line case the ₹100 item shows ₹94.51 net (vs ₹94.50 alone) because order-level tax
  rounding lands on the last line. Option B exposes that paisa; Option A's gross and saving
  figures don't move.
- Staging screenshot (2 × Purple Rain Taro Boba): ₹518.00 Subtotal, ₹51.80 saving, item line
  ₹466.20 = ₹518.00 − ₹51.80 with no visible line tax. Tax-inclusive or zero-tax configuration
  was **not** exercised by these fixtures (UNVERIFIED).
- Complimentary-item offers were not included in the fixtures.

| Founder decision | Value |
|---|---|
| Option chosen (A / B / other) | NOT_PERFORMED |
| Label wording (if B) | NOT_PERFORMED |
| In IMP-036J or later scope | NOT_PERFORMED |

## 6. Automated evidence (local, this branch)

| Suite | Result |
|---|---|
| Operator readiness + editor component tests | Passed |
| #383 / #384A merged fix (real database) | 8/8 passed |
| Committed-cart authority across Delivery / Takeaway (real database) | 2/2 passed first run |
| #381 create diagnostic (real database) | 1/1 passed; first run failed on the agent's own duplicate-control expectation (corrected, preserved) |
| #385 options fixtures (real database) | 4/4 passed; first run failed in the modifiers scenario on missing cart revision in the fixture setup (corrected, preserved) |

PR CI results are recorded on the pull request.

## 7. Overall Founder verdict

```text
FUNCTIONAL_UAT = NOT_PERFORMED
EXPERIENCE_UAT = NOT_PERFORMED
FOUNDER_UAT = NOT_PERFORMED
FOUNDER_SIGNATURE / DATE = NOT_PERFORMED
```
