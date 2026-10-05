<!-- governance-meta
{
  "status": "APPROVED",
  "authority": "EXPERIENCE_DEFINITION",
  "capability": "IMP-036J",
  "experienceDefinitionVersion": "XD-IMP-036J-DRAFT-6",
  "productDefinition": "PD-IMP-036J-DRAFT-6",
  "productDefinitionGate": "PASS",
  "experienceCriticality": "X3",
  "changeRisk": "CR2",
  "experienceGate": "PASS",
  "architectureFit": "PASS",
  "architectureLocked": "YES",
  "designReadiness": "PASS"
}
-->

# IMP-036J — Experience Definition

```text
EXPERIENCE_DEFINITION_VERSION = XD-IMP-036J-DRAFT-6
STATUS = APPROVED
AUTHORITY = EXPERIENCE_DEFINITION
CAPABILITY = IMP-036J
PRODUCT_DEFINITION = PD-IMP-036J-DRAFT-6
PRODUCT_DEFINITION_STATUS = APPROVED
PRODUCT_DEFINITION_GATE = PASS
EXPERIENCE_CRITICALITY = X3
CHANGE_RISK = CR2
EXPERIENCE_DEFINITION_STATUS = APPROVED
EXPERIENCE_GATE_EXECUTION = PERFORMED
EXPERIENCE_GATE = PASS
INDEPENDENT_EXPERIENCE_GATE_REVIEW = PASS
INDEPENDENT_EXPERIENCE_GATE_REVIEW_ID = 5342581233
EXPERIENCE_GATE_EVALUATED_HEAD = 1fbabd2fb80851912815efe4e0ebe331a1318557
EXPERIENCE_GATE_EVALUATED_TREE = 4eb6aa5e5a1588ef64527d7f38f7c5f07339d701
EXPERIENCE_GATE_EVALUATED_WORKING_TREE_FINGERPRINT = 060269654ee36f130f8f8e4cc47fc6b3116466c6a56e2a29e061af1da725632d
EXPERIENCE_GATE_EVALUATED_GOVERNANCE_FINGERPRINT = f7288bc395a2c46ef754bcc344eae5721fb5beef8c2e6b0fcf58860bbc421e21
ARCHITECTURE_FIT = PASS
ARCHITECTURE_LOCKED = YES
DESIGN_READINESS = PASS
PRODUCT_DECISION_REQUIRED = NO
EXPERIENCE_GATE_RESULT = PASS

HISTORICAL_ACCEPTED_IMPS_REWRITTEN = NO
X_SCALE_ORTHOGONAL_TO_CR_SCALE = YES
X_SCALE_ORTHOGONAL_TO_AGENTS_R0_R3 = YES
RAW_BACKEND_LANGUAGE_TO_CUSTOMER = PROHIBITED
FOUNDER_UAT_REQUIRED = YES
```

This document is the approved Experience Definition for IMP-036J. Independent Experience Gate
review `5342581233` returned PASS for `XD-IMP-036J-DRAFT-6`. The version stays
`XD-IMP-036J-DRAFT-6`. This Experience Definition itself did not perform Architecture Fit.
Architecture Fit current source is `IMP-036J-FIT-CANDIDATE-9`. Architecture Fit is PASS.
Architecture is LOCKED. Prior lock history: `IMP-036J-FIT-CANDIDATE-5` (independent review
`5347761109`). Design Readiness is PASS. The Implementation Plan is PASS for
`IMP-036J-PLAN-CANDIDATE-1`. Implementation Authorization APPROVED on 2026-10-01 (pull request #332 comment `5926464685`) is immutable authorization provenance. Current execution/lifecycle is owned by [`STATE.md`](../../STATE.md). This record does not change
[`product-definition.md`](./product-definition.md). Lifecycle truth remains
[`ROADMAP.md`](../../ROADMAP.md) and [`STATE.md`](../../STATE.md).

EXP-1 does not yet record a prior IMP Experience Definition version pattern. This definition uses
`XD-IMP-036J-DRAFT-N`, parallel to `PD-IMP-036J-DRAFT-N`. Experience Gate PASS does not mint a new
draft version.

`XD-IMP-036J-DRAFT-1` was the initial Experience candidate. It was superseded after EG-036J-001
and EG-036J-002.

`XD-IMP-036J-DRAFT-2` corrected equal-payable Coupon presentation and completed the initial X3
measurement intent. An independent ChatGPT Experience Gate PASS was given on DRAFT-2. That PASS
was not persisted. Fresh exact-head review `5339375514` then found material P2 comment
`4122739497` (EG-036J-003). The candidate was reopened before merge and before persistence of
that PASS.

```text
XD-IMP-036J-DRAFT-2 = SUPERSEDED_AFTER_GATE_REOPEN
EXPERIENCE_GATE_PASS_PERSISTED_FOR_DRAFT_2 = NO
DRAFT_2_HISTORICAL_GATE_REVIEW = PASS_NOT_PERSISTED
```

The historical PASS stays in the review record. It is not the current gate result.

`XD-IMP-036J-DRAFT-3` corrected EG-036J-003 with `CHECKOUT_JOURNEY_KEY`. Independent ChatGPT
Experience Gate review of DRAFT-3 then returned STOP for EG-036J-004. No Gate PASS was persisted
for DRAFT-3.

```text
XD-IMP-036J-DRAFT-3 = SUPERSEDED_AFTER_GATE_STOP_EG_036J_004
EXPERIENCE_GATE_PASS_PERSISTED_FOR_DRAFT_3 = NO
EXPERIENCE_GATE_AT_SUPERSESSION = NOT_PERFORMED
```

`XD-IMP-036J-DRAFT-4` remediates EG-036J-004: cohort entry, `REPORT_AS_OF`, unfinished-at-cutoff
membership, and published-snapshot segment immutability. Fresh exact-head review of DRAFT-4 blocked
the candidate before independent ChatGPT Experience Gate re-review. DRAFT-4 did not receive an
independent Experience Gate verdict, and no Gate PASS was persisted for it.

```text
XD-IMP-036J-DRAFT-4 = SUPERSEDED_AFTER_EXACT_HEAD_REVIEW_BLOCKERS
DRAFT4_INDEPENDENT_EXPERIENCE_GATE = NOT_PERFORMED
EXPERIENCE_GATE_AT_SUPERSESSION = NOT_PERFORMED
```

`XD-IMP-036J-DRAFT-5` kept that cutoff model and locked the measurement calendar, the production
release anchor, the half-open initial interval, and `AUTHORITATIVE_JOURNEY_SEQUENCE`. Fresh
exact-head review `5340925519` then found material P2 comment `4123995560`: cohort entry was
selectable both once for the whole journey and again inside each window. DRAFT-5 did not reach
independent ChatGPT Experience Gate re-review. No STOP verdict and no PASS verdict were executed
on DRAFT-5. No Gate PASS was persisted for it.

```text
XD-IMP-036J-DRAFT-5 = SUPERSEDED_AFTER_EXACT_HEAD_REVIEW_BLOCKER
DRAFT5_INDEPENDENT_EXPERIENCE_GATE = NOT_PERFORMED
EXPERIENCE_GATE_AT_SUPERSESSION = NOT_PERFORMED
```

`XD-IMP-036J-DRAFT-6` keeps every prior fix and defines cohort entry once for the lifetime of one
`CHECKOUT_JOURNEY_KEY`. Window assignment tests only that one entry's authoritative occurrence
time. Independent Experience Gate review `5342581233` returned PASS on evaluated head
`1fbabd2fb80851912815efe4e0ebe331a1318557`. That PASS is persisted on this same version.

Supporting material under [`../../experience/`](../../experience/README.md) is source only
(`Authority: NONE`). It is not used here as higher authority than EXP-1 or LANG-1.

---

## 1. Identity / version / status

| Field | Definition |
|---|---|
| Capability | IMP-036J — Promotions, Coupons & Offers |
| Experience Definition version / status | `XD-IMP-036J-DRAFT-6`; **APPROVED**; authority `EXPERIENCE_DEFINITION`; Experience Gate `PASS`; independent review `5342581233`; evaluated head `1fbabd2fb80851912815efe4e0ebe331a1318557`. `XD-IMP-036J-DRAFT-2` is `SUPERSEDED_AFTER_GATE_REOPEN`; its Experience Gate PASS was not persisted. `XD-IMP-036J-DRAFT-3` is `SUPERSEDED_AFTER_GATE_STOP_EG_036J_004`; its Experience Gate PASS was not persisted. `XD-IMP-036J-DRAFT-4` is `SUPERSEDED_AFTER_EXACT_HEAD_REVIEW_BLOCKERS`; its independent Experience Gate was `NOT_PERFORMED`. `XD-IMP-036J-DRAFT-5` is `SUPERSEDED_AFTER_EXACT_HEAD_REVIEW_BLOCKER`; its independent Experience Gate was `NOT_PERFORMED`. |
| Product Definition reference | `PD-IMP-036J-DRAFT-6`; status `APPROVED`; Product Definition Gate `PASS`; FD-036J-01, FD-036J-02, FD-036J-03 `APPROVED` |
| Experience Criticality | `X3`. Customer money, conversion, trust, and identity meet on Cart, Checkout Review, Payment, and purchased history. |
| Change Risk | `CR2`. Recorded in ROADMAP/STATE. Not an AGENTS `R` level. Money, caps, identity, and purchased truth are in scope; this candidate does not recalibrate that risk. |
| Process anchors | PD-2 / EXP-1 / LANG-1 / TEST-1 |

Personas stay those in the Product Definition: `PERSONA-CUSTOMER` (guest and authenticated are the same persona) and `PERSONA-WORKFORCE-OPERATOR` (not a new role or permission).

---

## 2. Experience Intent

The Product Definition outcome is that a customer can discover or apply a relevant benefit and
understand exactly what they saved, and that an authorized operator can run the accepted
Promotion and Coupon surface. The human question underneath that outcome is broader than
"apply a promotion" or "enter a coupon":

```text
CUSTOMER_QUESTION = Am I getting the best available value, and is the amount I will pay clear?
```

Checked against current authority:

- VISION principle 3 requires pricing correctness before convenience, and one authority for business truth. The experience may explain a result. It may not become a second source of money.
- EXP-1 requires intent to name who is helped, what they are trying to do, what they must understand, and the trust outcome. Intent is not a screen list.
- LANG-1 prohibits raw backend language and requires tone to tighten at checkout, payment, and failure.
- `PD-IMP-036J-DRAFT-6` already requires explainable savings, a best valid monetary combination, no fabricated delivery saving, and immutable purchased truth.

The direction below is compatible with those sources. It is an Experience Definition statement.
It does not amend the Product Definition.

```text
CUSTOMER_INTENT = Know whether this order already includes the best eligible value, what changed in the amount, and what I will pay.
BUSINESS_INTENT = Support direct conversion, acquisition offers, threshold-driven order value, deliberate fulfilment incentives, usable coupons, operable commercial rules, margin protection through the approved limits, explainable savings, and purchased truth that later offer changes do not rewrite.
EXPERIENCE_INTENT = Customers should understand that BOBA Bear is helping them receive the best eligible value without requiring them to understand Promotion engine mechanics or hunt for codes.
EMOTIONAL_INTENT = Fairness and relief while ordering; calm certainty at payment. Value should feel looked-after, not hunted.
TRUST_INTENT = Every saving is a real evaluated change. The amount on screen is the amount that will be charged, or the experience says plainly that it must be recomputed before payment. Purchased history keeps what was actually paid.
```

### Tensions

| Tension | Experience position |
|---|---|
| Conversion versus margin | Show the best allowed outcome. Do not hide a qualifying compatible delivery saving, and do not stack beyond the approved one-plus-one limit to "feel" more generous. |
| Value visibility versus training people to wait for discounts | Automatic value appears when it is real. There is no Offers hub, no countdown, and no prompt to wait for a better code. |
| Coupon access versus leaving to search for codes | Entry exists on Cart and Checkout Review because FD-036J-01 requires it. The payable total stays visually primary. A large empty coupon hero is not the designed emphasis. See section 4. |
| Discoverability versus checkout distraction | Menu does not become a marketing destination. Cart and Review carry the value story. Payment does not add a third decision. |
| Urgency or newness versus deceptive pressure | No fake scarcity, fake urgency, false countdown, or "only today" copy unless the evaluated window is a real fact the customer needs. Expiry, when shown, is a true condition of a code the customer submitted, stated calmly. |

No dark-pattern objective is permitted.

---

## 3. User goals and questions

| Person | Goal | Question they must be able to answer |
|---|---|---|
| Customer on Menu | Build an order | Is there value I should act on here? Answer for V1: not as a destination. Value is resolved in the cart. |
| Customer on Cart | Pay no more than the eligible value | Am I paying more than I need to? Did anything already apply? |
| Customer entering a coupon | Use a code they already have | Did this code work, and did it change what I pay? |
| Customer on Checkout Review | Confirm the order | Is this the best total, and can it still change? |
| Customer on Payment | Pay the understood amount | Is this the current amount, and can I still edit a coupon here? |
| Customer on confirmation and history | Remember the purchase | What did I actually save, and what item did I receive? |
| Workforce operator | Run a V1 Offer on the existing commercial surface | What will the customer receive, is this safe to activate, and did activation actually succeed? |

---

## 4. Evidence and assumptions

Classification uses EXP-1 exactly. Nothing below is customer research or production causal evidence.

| Claim | Class | Evidence class | Risk | Validation path |
|---|---|---|---|---|
| Coupon entry is required on Cart and on Checkout Review, over one shared state; Payment does not mutate it | `PRODUCT_DECISION` | Founder decision FD-036J-01 | Mis-stating it would reopen an approved decision | Do not re-decide. Trace `US-036J-002`. |
| Best valid combination is one primary merchandise or order Offer plus at most one compatible delivery incentive; both apply when each has a real monetary effect; a coupon must not make the customer worse off | `PRODUCT_DECISION` | FD-036J-02 | A simpler UX that drops a real delivery saving would weaken an AC | Keep both effects visible when both are real. |
| Complimentary V1 is one complete no-choice item, one active Offer, no substitute. When a valid complimentary combination has the same payable amount as the otherwise equivalent result with no primary merchandise or order Offer, the complimentary combination is selected. | `PRODUCT_DECISION` | FD-036J-03 | A picker, a silent substitute, or treating that tie as "the coupon was better" would change product behaviour | Specify the line experience. Do not add choice. Do not call that tie a better price. Other equal-payable ties that do not change delivered merchandise stay with Architecture Fit. Section 12 states how both of those Fit outcomes are presented. This candidate does not choose the general winner. |
| Today the customer cart has no coupon field. `CartClient` shows an estimated subtotal and Checkout. Menu (`/order`) has no offer browse. Checkout money rows are Subtotal, a single Discount when `promotionDiscountPaise` is positive, charge names, Tax, and Total payable. Confirmation (`/order/confirmation`) reuses that payment summary. Order history detail reads purchased money. Workforce authoring is `/workforce/admin/commercial` (`PromotionsEditor`), including draft create, percentage or fixed-amount benefit in that editor, coupon create, activate, and retire. | `FACT` | Repository inspection of those surfaces at the candidate base. Not a claim that the engine lacks evaluation. | Treating today's lump Discount as the desired explanation | Desired presentation is specified here. Current UI is the gap. |
| Product Definition records that automatic benefits are not explained and coupon entry is not a customer surface | `SUPPORTED_EVIDENCE` | Product Definition current-state journey, consistent with the code inspection above | Over-claiming a production metric | No production behaviour claim is made. |
| Customers will ask "am I getting the best value?" rather than "which promotion revision won?" | `ASSUMPTION` | `FOUNDER_HEURISTIC_REVIEW` direction in this task, compatible with EXP-1 intent. Not customer research. | Copy that still sounds like an engine | Founder Experience UAT and internal usability review of the low-fidelity flows |
| A prominent empty coupon field may encourage people to leave checkout and search elsewhere for a code | `ASSUMPTION` | none. EXP-1 uses this example as an assumption until evidence or an explicit product decision exists. It is not a hypothesis with observed results. | Locking a hidden field and then failing coupon discoverability | Do not lock collapse. See the candidate decision below. Founder heuristic review, then internal usability. Production experiment only with later traffic; today `INSUFFICIENT_EVIDENCE`. |
| Naming the benefit an Offer, the typed code a coupon, and the money effect a saving is understandable without also saying Promotion, Discount, Reward, and Delivery Offer | `HYPOTHESIS` | none | Customers already expect the word Discount from the current screen | Content review against LANG-1. Candidate words are not final Design Readiness microcopy. |
| Repeating threshold progress on Checkout Review, as well as Cart, reduces "why isn't this in the total?" questions | `HYPOTHESIS` | none | Extra text on Review | Internal usability on the Review flow |
| BOBA Bear direct volume is too small for a meaningful controlled conversion experiment at this stage | `ASSUMPTION` | No production behavioural series is cited in current authority for this slice | Pretending an A/B test proved a winner | Mark conversion effects `INSUFFICIENT_EVIDENCE` until a defined experiment has traffic |

### Candidate experience decision — coupon prominence

Experience Definition owns presentation hierarchy. It does not own whether coupon entry exists.

```text
COUPON_ENTRY = PRESENT_ON_CART_AND_CHECKOUT_REVIEW
COUPON_PRIORITY = SECONDARY_TO_TOTAL_AND_CONTINUE
EMPTY_COUPON_HERO = NO
COLLAPSED_HAVE_A_COUPON = NOT_LOCKED
SEPARATE_OFFERS_DESTINATION = NO
```

The empty state is a named coupon field and an apply action on the same surface, matching the
Product Definition UX matrix. The total and the continue or pay action stay primary. The field
is not a hero and not a new page. Whether Design Readiness later uses a one-step disclosure that
reveals that same named field is a presentation refinement. It may be tested. It is not locked
here, because the external-search effect is a hypothesis. A disclosure that removes the field
from the surface, or that requires a second destination, is outside this decision and would
fight FD-036J-01.

---

## 5. Current-state experience

Supported current behaviour, separated from planned intent:

- Menu (`/order`) is catalog discovery. Inspected catalog UI has no offer or deal presentation. Classified `NO_EXPOSURE` as an offers destination.
- Cart (`/order/cart`) lets the customer change quantity, edit a line, clear, and continue to checkout. The visible money cue inspected is "Estimated subtotal". There is no customer coupon control and no savings explanation.
- Checkout (`/order/checkout`) is one client with Fulfilment, Review, and Payment steps. Money presentation is one lump Discount when a promotion amount is positive, plus delivery or other charge rows, tax, and Total payable. Delivery already at zero is a charge row, not a second invented saving, but the screen does not explain an automatic offer, a coupon, a threshold, or a complimentary line as an offer.
- Payment is a step inside checkout. No customer coupon control was found. Commercial explanation is the same summary. `/order/payment` is the payment-return status page. It is not a second checkout and not a coupon entry surface.
- Confirmation and order detail show a payment or order total from purchased money, including a lump Discount. They do not yet explain purchased savings as order saving versus delivery saving, and they do not present a complimentary line as purchased offer truth.
- Commercial evaluation can already change payable amounts in the engine. That is system truth. It is not yet a customer explanation. This candidate does not claim the engine covers first-order rules, fulfilment-mode fields, non-coupon global caps, or a non-BOGO complimentary item. Those remain product gaps for later Fit.
- Operators already author on `/workforce/admin/commercial`. The promotions editor can create a draft, set automatic or coupon trigger, set percentage or fixed-amount benefit in the current form, attach targets, create a coupon, activate, and retire. Status is shown with the stored status text. The form does not yet give a V1 experience for complimentary-item completeness, the single-active complimentary rule, or the distinct customer reason classes. This candidate extends that surface's experience. It does not add a second admin application.

---

## 6. Desired journey

Journeys stay `JOURNEY-036J-AUTO`, `JOURNEY-036J-COUPON`, `JOURNEY-036J-THRESHOLD`, `JOURNEY-036J-PAY`, and `JOURNEY-036J-OPERATOR`. Experience steps below show how those journeys feel. They do not add eligibility.

### Menu / discovery

The customer is choosing food. They should notice the menu, not an offers wall. No Offers hub. No Deal cards. No campaign banner. A minimal contextual mention is allowed only when a real cart or checkout outcome needs the customer to know an offer exists, and it is not a destination. V1 does not put threshold marketing or strikethrough "was" prices on menu cards. A missing price invented for drama is prohibited.

### Cart

The customer asks whether they are paying more than they need to. First they see their items and the amount. Second they see value that already applied, or truthful progress toward a real threshold. The coupon field is available and secondary. Continue to checkout stays the primary action.

### Coupon entry

Same shared state on Cart and on Review. The customer types a code they already have, applies it, and gets one honest result: it lowered the payable total; it is valid and the selected result already pays less without it; it is valid and the payable amount is the same as the valid non-coupon alternative, whether the evaluator kept the coupon combination or not; or a specific failure. An equal payable amount is not described as a better total. They can replace or remove the code on either surface before payment. Sign-in, when identity is required, keeps that same attempt and returns to the result.

### Checkout Review

The customer confirms fulfilment, items, value, and the payable amount. Inherited coupon state is the same state, not a second code. They can enter a code here for the first time. Changing fulfilment or the cart recomputes. If the result goes stale, recovery stays on Review.

### Payment

The customer pays the current amount. The summary is readable. Coupon controls are absent. If revalidation changes the result, payment does not continue on the old amount. The customer returns through Review, where the new amount and the reason are visible.

### Order confirmation

The confirmation states what was purchased and paid, including the saving that was part of that purchase and a complimentary item if one was purchased. It is purchased truth, not a live offer.

### Order history

Opening the order later shows the same purchased saving and the same complimentary line, including after the live offer is changed, retired, or expired, and after later prices or delivery rules change.

### Workforce

Create or draft, understand the customer meaning, choose automatic or coupon activation, configure eligibility, caps, fulfilment applicability, benefit class, and a complimentary item when that is the benefit, then activate. A second complimentary activation is refused. A concurrent activation that is not the authoritative one is not shown as success. Retirement confirms, stops future use, and does not rewrite purchased orders.

---

## 7. Entry and discoverability

No new Offers hub. Deals and Campaigns stay parked.

| Surface | Role | What the person recognizes |
|---|---|---|
| Menu `/order` and menu cards | `NO_EXPOSURE` as a destination. `CONTEXTUAL_VISIBILITY` only for a minimal, non-destination mention if a later cart outcome truly needs it. V1 candidate uses no menu offer treatment. | Food and price of the item they might add. |
| Cart `/order/cart` | `PRIMARY_ENTRY` | Items, amount, any applied value, threshold progress when real, coupon field. |
| Checkout Review | `PRIMARY_ENTRY` for the same shared coupon state and the savings breakdown. Not a second coupon authority. | The amount they will pay, and why it moved. |
| Payment, including the in-checkout payment step and the `/order/payment` return page | `CONTEXTUAL_VISIBILITY` of the current payable result on the payment step. The return page reports payment status. Mutation controls are absent on both. | Final-looking summary that can still be stopped if revalidation changes it. The return page does not reopen a coupon. |
| Confirmation `/order/confirmation` | `PURCHASED_TRUTH_ONLY` | What was just paid. |
| My Orders `/order/orders` and detail | `PURCHASED_TRUTH_ONLY` | What that order saved and included. |
| Navigation | `NO_EXPOSURE` for an Offers item | Existing order navigation. Do not add an Offers tab. |
| Workforce `/workforce/admin/commercial` | `PRIMARY_ENTRY` for authoring | Existing Promotions and coupons area. |

Direct links stay the existing cart, checkout, confirmation, order detail, and commercial workspace routes. There is no new offer URL.

---

## 8. Information architecture and hierarchy

Conceptual hierarchy only. Not a layout specification.

### Cart

1. Primary: items, including a complimentary line when selected, and the current amount.
2. Secondary: applied saving explanation; threshold progress when a real gap remains; delivery amount when delivery is in play.
3. Progressive: coupon entry, then the result of the attempt: a failure, a strictly better non-coupon total, or an equal-payable result that does not claim a better total.
4. Primary action: continue to checkout. Apply, remove, and change are actions on the coupon, not competitors with continue.

Relationship: item amounts, then order saving if any, then delivery charge and delivery saving only when that saving is real, then total. An automatic result and a coupon result are one outcome. The customer does not see two competing authorities.

### Checkout Review

Same hierarchy, with fulfilment context visible because changing it can change eligibility. The total remains visible with the continue-to-payment action. Critical total and the next action are not an afterthought below unrelated content.

### Payment

Primary: the amount to pay. Secondary: the short savings that support confidence. Absent: coupon entry, replace, remove. If the amount is no longer valid, the primary content becomes the stop-and-return explanation, and pay is not offered on the stale amount.

### Purchased confirmation and history

Primary: what was ordered and what was paid. Secondary: the purchased saving, split the same way when both an order saving and a delivery saving were real, and the complimentary item as a purchased line at no extra merchandise charge. No live progress and no coupon field.

### Operator

Primary: which customer value this record will create, and whether activation can succeed. Secondary: window, scope, caps, fulfilment, benefit class. Progressive: advanced qualifiers that are not needed to understand the customer result. Destructive: retire confirmation.

The customer does not need to understand promotion candidate, promotion revision, commercial evaluator, checkout snapshot, delivery incentive slot, qualifier, or redemption claim. Those stay domain words. Operator language may name Promotion and Coupon because that is the existing commercial surface and the operator's job. It still does not paste raw failure codes as the only explanation.

---

## 9. Interaction, mental model, and cognitive load

Mental model, one sentence: BOBA Bear applies the best allowed value, shows what that changed, and lets me add a code I already have without making the total worse.

Cognitive load stays bounded by showing at most:

- one order or merchandise value story
- one delivery value story, and only when delivery money actually changed
- one coupon attempt and its result
- one complimentary item, with no choices

The customer is never asked to pick a winner between an automatic offer and a coupon. When one valid result has a lower payable amount, the platform keeps that result and explains it. When the valid coupon combination and the valid non-coupon alternative have the same payable amount, the platform explains the combination the evaluation selected and does not call either amount better. The customer does not see a tie-break.

An automatic offer is not something the customer activates. A coupon is the only code they type. There is one code at a time. Replacing it is explicit.

---

## 10. Friction audit

| Moment | Class | Decision |
|---|---|---|
| Sign in when the coupon or first-order rule needs identity | Protective | Keep. Guest unrestricted coupons are not blocked only for being signed out. |
| Type a code they already have | Necessary | Keep on both approved surfaces. Do not add a third surface. |
| Learn engine words | Accidental | Remove from customer copy. One mental model in section 9. |
| Scroll past the total to find continue or pay | Accidental | Hierarchy keeps the amount and the next action primary on small screens. Exact sticky treatment is Design Readiness. |
| Expand a coupon field | Not locked | Empty field is present and secondary. Collapse is a hypothesis, not a removal of the field. |
| Leave the flow to find the commercial admin or an offers page | Accidental | Do not create those destinations for the customer. |
| Choose a gift, variant, or modifier on a complimentary item | Accidental and prohibited | No picker. If the item needs a choice, it cannot be activated. |
| Confirm retire | Protective | Keep confirmation. Cancel leaves the offer active. |
| Remove a coupon | Necessary, with a consequence | Explicit, and the total recomputes. No extra scare screen beyond the updated amount. |
| Retry after sign-in | Protective | Same code is preserved. Do not ask them to remember and retype it when continuity allows. |
| Return from a stale payment to Review | Protective | Required so they do not pay a stale saving. |
| Re-enter the same coupon on Review after Cart | Accidental | Do not ask again. Show the shared result, with change and remove available. |
| Read four overlapping labels for one saving | Accidental | Prefer Offer, coupon, saving, delivery, and total payable. |

Required product behaviour is not removed under the label of friction.

---

## 11. Service blueprint

Customer promises on this slice depend on operator configuration and on commercial truth.

```text
CUSTOMER PROMISE
↕
CUSTOMER-FACING PROMISE
↕
SYSTEM TRUTH
↕
WORKFORCE ACTION
↕
OPERATIONAL CAPABILITY
```

| Customer promise | Customer-facing promise | System truth required | Workforce action | Operational capability |
|---|---|---|---|---|
| The best eligible value is already in the total | The screen explains the saving that changed the amount | One commercial evaluation result, including the approved combination | Activate a coherent offer, not overlapping stories | Authoring on the existing commercial surface |
| A code I have can be tried | Distinct, honest result, and never a worse total | Shared coupon state and the same evaluation | Provide a coupon only when activation is by code | Existing coupon authority |
| "Add ₹X more" is real | Progress matches the gap the evaluation computes | Authoritative projection of the remaining gap | Set a real minimum only when the benefit is real | No customer-side eligibility maths |
| A free item is the item promised | That item, at no extra merchandise charge, with no choices | Exact item, availability, and the selected combination | Bind one complete no-choice item; refuse incomplete activation | Catalog, customization, and availability truth |
| That item is still there at payment | If it is gone, say so, remove it, recompute, stay on Review | Availability recheck before payment | Do not promise a substitute in store as part of this offer | Item availability the system can see |
| What I paid stays true | History shows the purchased saving and item | Purchased commercial truth, not a live re-price | Retire stops future use only | Purchased orders left unchanged |
| I am not shown a second competing free item | Neither competing complimentary item is presented | Fallback when more than one would qualify | At most one active complimentary offer; no false activation success | Authoring conflict and race outcome the operator can see |

This candidate does not promise a store-level substitute, a gift catalogue, or a saving the evaluation did not produce. Architecture mechanisms that must support these promises are inputs in section 20, not decisions.

---

## 12. Content requirements

LANG-1 applies. Domain truth stays domain truth. Presentation semantics choose what this person needs in this context. Customer language and operator language may differ.

```text
RAW_BACKEND_LANGUAGE_TO_CUSTOMER = PROHIBITED
CONTEXTUAL_STATUS_PROJECTION = REQUIRED
ONE_BACKEND_STATE_ONE_UNIVERSAL_LABEL = PROHIBITED
```

Candidate wording below is content direction for Experience Gate review. Design Readiness owns final microcopy. Words in the customer column are proposed presentation, not a mechanical rendering of an enum.

Customer vocabulary for this capability:

| Use with customers | Avoid with customers |
|---|---|
| Offer, when a benefit is being explained | Promotion candidate, revision, evaluator, snapshot, slot, qualifier, claim |
| Coupon, for the code they type | Internal status and error codes |
| Saving, for a real rupee effect | Reward, applied offer, and discount used as extra synonyms for the same money |
| Delivery, for the delivery charge and a real delivery saving | A second "free delivery offer" line when delivery was already ₹0 |
| Total payable, for the amount | A guarantee that a stale amount will survive revalidation |
| Included, for the complimentary line's reason | Gift catalogue, reward item, mystery item |

Pickup versus delivery is contextual. A delivery saving is not shown on pickup. A delivery-only offer that does not apply is not described as broken; it is absent, or, if they entered a code, inapplicable to this order. The same internal "not applicable" meaning can therefore be quiet on an automatic pickup cart and explicit after a submitted code.

### Equal-payable coupon presentation

Best monetary outcome stays the customer-visible product rule in `PD-IMP-036J-DRAFT-6`. This candidate does not choose which combination wins when the final payable amounts are equal. The general deterministic non-monetary tie-break stays Architecture Fit-owned. Presentation is defined for both possible Fit outcomes. The labels below are experience states only. They are not backend enums, and they are not customer copy.

```text
EQUAL_PAYABLE_COMMERCIAL_WINNER = NOT_CHOSEN_HERE
GENERAL_NON_MONETARY_TIE_BREAK = ARCHITECTURE_FIT
COMPLIMENTARY_ITEM_EQUAL_PAYABLE_TIE = COMPLIMENTARY_COMBINATION_SELECTED
```

`COUPON_EQUAL_PAYABLE_SELECTED`. The coupon is valid. The evaluator selected the coupon-backed combination. The final payable amount equals the valid non-coupon alternative.

The customer is told the coupon is valid and applied. The copy does not claim a better total. It does not fabricate a saving. It makes clear that the payable total did not decrease relative to that alternative. The saving stack shows only actual evaluated monetary effects of the selected result. The selected commercial result stays the one the evaluator supplied.

Candidate direction, not locked microcopy: "Coupon applied. Your total stays the same."

`COUPON_EQUAL_PAYABLE_NOT_SELECTED`. The coupon is valid. The Fit-owned deterministic tie-break retained the non-coupon combination. The payable amounts are equal.

The customer is told the coupon is valid. The retained result is not called better. The coupon is not called invalid or inapplicable. The copy makes clear the coupon does not change what the customer pays. The authoritative selected combination remains. Tie-break and engine words stay off the screen.

Candidate direction: "This coupon is valid. It doesn't change your total." Where the retained result is an offer that stays applied, "Your current offer stays applied" may follow. Use that second sentence only when it describes the selected result. Do not use it when the selected result has no applied offer. Do not say "we kept the better amount." The amounts are equal, so "better" would be false.

These two sentences are presentation semantics. Design Readiness owns the exact words.

The strictly lower payable cases stay separate and do not use the equal-payable sentences. When the coupon-backed combination pays less, the customer sees "Coupon applied" and the actual saving. When the non-coupon combination pays less, the customer sees "This coupon is valid. It doesn't improve your total, so we kept the better amount." That sentence is forbidden when the payable amounts are equal.

The Founder complimentary rule is unchanged and is not moved into Architecture Fit. When the otherwise equivalent combination with no primary merchandise or order Offer and the qualifying complimentary combination have the same payable amount, the complimentary combination is selected (`FD-036J-03`, `COMPLIMENTARY_ITEM_EQUAL_PAYABLE_TIE = COMPLIMENTARY_COMBINATION_SELECTED`). Experience still shows the exact included item, the "Included with your offer" semantic, a ₹0 merchandise charge, and no customer choice. A compatible delivery saving is shown separately only when that saving is a real evaluated effect. Copy does not suggest that a coupon, or another offer, was monetarily better merely because of that tie.

### Content / product language matrix

| Situation | Internal meaning | Customer intent | Candidate customer wording | Tone | Recovery / action | Leakage risk |
|---|---|---|---|---|---|---|
| Automatic offer applied | A qualifying automatic benefit changed the evaluated amount | See that value was included and how much | "Offer applied." The saving stack shows the real rupee effect. A short plain reason is added only when the evaluation can support it, such as the threshold that was met. | Clear, lightly branded on Cart; precise on Review | None. Continue. | Do not name other customers or unpublished offers. |
| Coupon applied and selected | The entered code is part of the selected combination, and that combination has the lower payable amount | Know the code worked and the saving | "Coupon applied." The same saving stack shows the actual evaluated effect. | Precise | Remove or change | Do not echo rules that identify who else could use it. Do not use this row when the payable amount equals the valid non-coupon alternative. |
| Coupon equal payable, selected | Experience state `COUPON_EQUAL_PAYABLE_SELECTED`, not customer copy. The coupon is valid. The evaluator selected the coupon-backed combination. The payable amount equals the valid non-coupon alternative. Fit owns that general tie-break. | Know the code worked, and that the amount did not go down | "Coupon applied. Your total stays the same." Show only actual evaluated monetary effects of the selected result. | Precise, calm | Remove or change, or continue on the selected result | Do not claim a better total. Do not fabricate a saving. Do not say the total decreased relative to the valid non-coupon alternative. Do not show the internal label or tie-break words. Preserve the evaluator's selected result. |
| Coupon valid but not selected | The code can qualify, and the best combination that does not depend on it has the strictly lower payable amount | Trust that the code is not broken | "This coupon is valid. It doesn't improve your total, so we kept the better amount." | Calm, precise | Remove the code or continue | Do not show the lost combination's internal names or another customer's prices. Do not show a raw reason code. Use this sentence only when the retained payable amount is lower. An equal payable amount is not "already better." |
| Coupon equal payable, not selected | Experience state `COUPON_EQUAL_PAYABLE_NOT_SELECTED`, not customer copy. The coupon is valid. The Fit-owned tie-break retained the non-coupon combination. The payable amounts are equal. | Know the code is real, and that it does not change what I pay | "This coupon is valid. It doesn't change your total." Add "Your current offer stays applied" only when an offer remains the selected result. | Calm, precise | Remove the code or continue. Removing it keeps the retained result. | Do not call the retained result better. Do not call the coupon invalid or inapplicable. Do not say "we kept the better amount." Do not show the internal label or tie-break words. Keep the authoritative selected combination. |
| Invalid | The text is not a valid code | Correct it | "That code isn't valid. Check it and try again." | Direct | Focus returns to the field | Do not say how close the text was, or whether a similar code exists. |
| Expired | The code is outside its window | Distinguish expiry from a typo | "This coupon has expired." | Direct | Try another code or remove it | Do not publish the operator's future schedule. |
| Inapplicable | The code is recognized and this cart, mode, or history does not qualify | Know it is not a typo | "This coupon doesn't apply to this order." Add a practical clause only when it does not leak private facts, for example "It applies to delivery orders" when the offer is delivery-only and they chose pickup. | Direct | Change the order or fulfilment, or remove the code | Do not disclose another person's orders. A first-order coupon for a returning customer stays "doesn't apply to this order" and does not narrate their history. |
| Identity required | The attempt needs an authenticated customer | Sign in and resume | "Sign in to use this coupon." | Calm | Sign in. The same attempt is kept. | Do not confirm private eligibility before sign-in. Do not say which account owns the code. |
| Globally exhausted | The offer's overall cap is spent | Distinguish from a typo or expiry | "This offer has been fully used." | Direct | Continue without it | Do not show remaining count, cap size, or who redeemed it. |
| Personally exhausted | This authenticated customer hit their own cap | Distinguish from a global cap | "You've already used this offer." | Direct, respectful | Continue without it | Do not show the cap number if it is not needed, and never another customer's count. |
| Threshold not reached | A real minimum is unmet | Know the real gap | "Add ₹X more to unlock …" using the benefit in plain words, only when the evaluation provides ₹X and the benefit. | Clear, no pressure | Add items or ignore it | If ₹X is unknown, show nothing. Do not invent a gap. |
| Threshold reached | The minimum now holds and the offer applies | See that the progress became a saving | Replace the progress line with the applied saving. | Positive and precise | None | Do not add a celebratory claim that invents extra value. |
| Temporary free delivery | A delivery incentive makes a charge that would otherwise exist ₹0, and that change is a real monetary effect | See one delivery result and the saving once | Delivery row ₹0, and "Delivery saving ₹X" only for the evaluated effect, included in total saved. | Precise | None | Do not invent the previous charge on the client. |
| Standing ₹0 delivery | Accepted delivery pricing is already ₹0 | Not think they received a second discount | "Delivery ₹0" with no extra delivery-saving line. | Precise | None | Do not label standing free delivery as an offer saving. |
| Complimentary item | The selected offer adds one exact item at no merchandise charge. When payable equals the otherwise equivalent result with no primary offer, FD-036J-03 still selects this combination. | Know what it is and why it is here | Item name, "Included with your offer", merchandise amount ₹0. A real compatible delivery saving stays a separate line. | Precise, not a surprise gift theatre | No customize, no replace-with-another-item | Do not imply they may choose a different item. Do not say a coupon or another offer was monetarily better because this tie selected the included item. |
| Complimentary item unavailable | The shown item can no longer be included | Understand the loss and the new total | "That included item is no longer available. Your total has been updated." | Calm | Stay on Review. No substitute. | Do not offer a hidden menu of replacements. |
| Stale revalidation | The amount they were about to pay included a benefit that is no longer valid | Not pay the old amount | "Your total changed before payment. Review the updated amount." | Trustworthy | Return to Review. Pay is not offered on the old amount. | Do not blame the customer. Do not keep the old saving on screen as current. |
| Purchased savings | History of the bound purchase | Know what they paid | "You saved ₹X on this order." Split order saving and delivery saving when both were purchased. Complimentary line remains the purchased item at no extra merchandise charge. | Transparent | None. Not a live offer. | Do not show live offer changes as if they rewrote the order. |

Operator language, still deliberate:

| Moment | Candidate operator wording | Not sufficient alone |
|---|---|---|
| Automatic versus coupon | "Customers get this without a code" or "Customers enter a coupon" | A raw trigger token with no sentence |
| Primary versus delivery | "This changes the items or order total" or "This changes the delivery charge" | Internal slot names as the only label |
| Complimentary binding | "One menu item, included, with no customer choices" | A free-text gift |
| Activation refused because one complimentary offer is already active | "Another included-item offer is already active. This one was not activated." | A success badge |
| Concurrent attempt that is not authoritative | "This activation did not become the active offer. Check the offer that is active, then try again if you still need a change." | A success message with a conflict footnote |
| Validation error | The field that is wrong and what to fix, in a sentence | An error code with no field |
| Revision conflict | "Someone else changed this. Reload it and try again." | A raw revision number as the message |
| Retire | "Retire this offer? New orders will stop receiving it. Orders already placed stay as paid." | Silent retire |

Tone by context, from LANG-1:

| Context | Personality |
|---|---|
| Menu | Distinctive where the menu already is. Offers do not add a playful campaign voice in V1. |
| Cart and ordering | Lightly branded, short. |
| Review, savings, payment, expiry, unavailable item, identity, and recovery | Clarity and truthfulness first. Playful copy is restrained. |
| Operator validation and retirement | Plain and operational. |

The Product Definition's `APPLIED` outcome is presented as "Offer applied" or "Coupon applied". The token `APPLIED` is not customer copy.

When both an order saving and a delivery saving are real, the customer sees those two lines, then total saved, then total payable. "You save ₹X" means total saved, and it is not a third amount on top of the lines. A complimentary item is shown at ₹0 merchandise with its reason. That ₹0 row is not also repeated as a made-up item-price saving. Any rupee attributed to it appears once, inside the evaluated saving lines.

Capitalization in candidate sentences is sentence case. Money is rupees from the evaluation, not a rounded marketing figure. "You save ₹80" is allowed only when ₹80 is the evaluated total saved.

Testable content requirements: `XR-IMP-036J-001` through `XR-IMP-036J-013` in section 27. Final strings are Content QA at implementation time, not this candidate's approval of pixels.

---

## 13. UX state matrix

| State | Surface | User question | What they see | Primary action | Recovery | Content rule | Measurement intent | Accessibility |
|---|---|---|---|---|---|---|---|---|
| No applicable offer | Cart, Review | Is value missing by mistake? | Items and total. No promised saving. | Continue | None | Absence is valid. Do not apologize for a missing offer. | Exposure of cart with no offer, without treating it as an error | Totals remain text |
| Automatic applied | Cart, Review | What did I get? | Offer applied, rupee saving, short reason when knowable, matching payable effect | Continue | If the cart later disqualifies it, the saving leaves and the total updates | Saving equals the evaluated effect | Understanding that value applied | Status in text, not colour alone |
| Automatic removed after cart mutation | Cart, Review | Why did the total go up? | Updated total and a plain line that the offer no longer applies | Continue or add items if progress remains | Show progress again only if a real gap returns | No stale saving | See the removal | Announce the total change |
| Coupon untouched | Cart, Review | Can I use a code? | Named field, apply | Continue, or apply | Empty is fine | Field has an accessible name | Coupon field seen | Keyboard focusable |
| Coupon applying | Cart, Review | Did it send? | Previous amounts stay put. Text says the coupon is being checked. | Wait | Retry if it fails | No optimistic new total | Submit started and finished | Apply does not look like a second code was created. Busy state is text. |
| Coupon selected | Cart, Review, then read-only on Payment | Did it help? | Coupon applied and the actual saving, because this combination pays less | Continue. Remove or change before payment. | Remove restores the result without that code | One shared state. Not the equal-payable sentence. | Selected outcome, descriptive segment | Remove and change are keyboard operable |
| Valid, not selected | Cart, Review | Is the code broken? | The lower non-coupon total remains. Copy says the coupon is valid and did not improve the total. | Continue or remove | Removing it keeps the lower result | Never the internal not-selected code. Do not use this row when the payable amounts are equal. | This outcome is understood. Continuation is a secondary metric, not a cause. | Status in text |
| `COUPON_EQUAL_PAYABLE_SELECTED` | Cart, Review, then read-only summary on Payment | Did the code work, and did the amount go down? | Coupon applied. The total stays the same as the valid non-coupon alternative. Only actual evaluated effects are shown. The internal label is not shown. | Continue. Remove or change before payment. | Remove or change recomputes from the result without that code. Continue keeps the selected combination. | Do not claim a better total. Do not fabricate a saving. Do not say the total decreased relative to the valid non-coupon alternative. | Descriptive segment of the primary completion rate. Continuation after this sentence is secondary. Not causal. | Status in text. Announce the applied coupon and that the total stayed the same. Do not read the internal label. |
| `COUPON_EQUAL_PAYABLE_NOT_SELECTED` | Cart, Review | Is the code broken, or did it change what I pay? | The coupon is valid. It does not change the total. The retained combination stays. If an offer remains applied, say so. The internal label is not shown. | Continue or remove | Removing the code keeps the retained result. Do not let the screen swap in the coupon combination. | Do not call the retained result better. Do not call the coupon invalid or inapplicable. Do not say "we kept the better amount." | Descriptive segment. Continuation after this sentence is secondary. Not causal. | Status in text. Announce that the coupon is valid and the total is unchanged. Do not read the internal label. |
| Invalid, expired, inapplicable, globally exhausted, personally exhausted | Cart, Review | Which kind of no is this? | The distinct sentence from section 12. No saving from that attempt. | Correct, replace, or continue | Focus returns to the field | Do not collapse these into one "invalid" | Which class occurred, as a coarse class | Error associated with the input |
| Identity required | Cart or Review, wherever they submitted | Do I need to sign in? | Sign-in request. The attempt is kept. | Sign in | After success, focus returns to the coupon result on that same surface | Unrestricted codes are not sent down this path | Sign-in retry started and completed | Focus move is defined |
| Preserved through sign-in retry | Same surface | Do I have to type it again? | The same attempt is retried when continuity allows | Read the result | If continuity cannot keep it, say the code needs to be entered again. Do not invent a success. | No false applied state | Retry result | Focus on the result |
| Coupon removed | Cart, Review | Is it gone? | No entered coupon. Totals recomputed. | Enter another or continue | Empty state | Removal is the shared state | Removal | Focus remains on the coupon field |
| Coupon replaced | Cart, Review | Is the new code the one that counts? | One code, new result | Continue | Failure leaves the previous shared state if the request does not complete | One state | Replace result | Change is keyboard operable |
| Threshold not reached | Cart; repeated on Review while still short | What is left? | "Add ₹X more to unlock …" | Add items or continue | If the gap cannot be known, omit the line | ₹X is the evaluation's gap | Progress impression | Text, not a colour bar alone |
| Threshold reached | Cart, Review | Did I get it? | Progress is replaced by the applied saving | Continue | If a later edit falls below, the offer drops and they are told | No extra invented bonus | Unlock | Announce the change |
| Threshold lost after mutation | Cart, Review | Why did it disappear? | Offer no longer applied. Progress returns if the gap is real again. | Adjust cart | None beyond the truthful line | Tell them it dropped off | Drop-off | Announce |
| Ordinary delivery charge | Cart, Review, Payment, history | What is delivery? | One delivery amount | Continue or pay | Fulfilment change recomputes | Pickup does not show a delivery saving | None beyond the total | Text |
| Standing ₹0 delivery | Same | Is this an offer? | Delivery ₹0. No second saving line. | Continue | None | Do not call it an offer saving | Do not count it as offer savings in measurement | Text |
| Temporary free delivery | Same, while the incentive has a real effect | Did delivery change? | Delivery ₹0 and one delivery saving inside total saved | Continue | If the incentive drops, the charge returns and the saving line leaves | One coherent delivery result | Delivery saving shown | Text |
| No fabricated duplicate saving | All money surfaces | Am I double-counting? | Components sum to total saved. Standing ₹0 adds nothing. | Continue | Recompute if inputs change | Total saved equals the explained parts | Integrity of displayed savings | Readable hierarchy |
| Complimentary applied | Cart, Review | What is this extra line? | Exact item, included, ₹0 merchandise. The same presentation is used when FD-036J-03 selects it because the payable amount equals the no-primary result. | Continue. No edit of options. | None while it remains eligible | No catalogue. Do not describe the equal-payable selection as a better price or as a coupon winning. | Complimentary impression. Descriptive segment only. | Line is text |
| Complimentary plus delivery incentive | Cart, Review | Did I lose delivery value because of the item? | The item line and, when real, the delivery saving, in one total | Continue | None | Both are one result | Both effects understood | Both are text |
| Complimentary unavailable before payment | Review | Can I still pay the old total? | The line is gone. The sentence says it is no longer available. The new total is shown. Pay is not offered on the old line. | Continue on the new total or change the cart | No substitute | Recovery stays on Review | Recovery seen | Focus moves to the explanation and the updated total |
| Complimentary removed and recomputed | Review | What do I pay now? | The best remaining result, explained | Continue | Same as unavailable | No silent swap | Recomputed total | Announce |
| Inconsistent multiple complimentary qualification | Cart, Review | Which free item do I get? | Neither competing item. The ordinary evaluated total. If a complimentary line was already on screen, say an included item can't be added to this order and show the updated total. Do not say the item is unavailable unless availability is actually why it left. If no complimentary line was shown, do not add an error about a gift. | Continue | No picker | Do not present a winner. Do not reuse the unavailable-item sentence for this fallback. | Fallback occurred, without item-choice analytics that imply a choice | Text |
| Review fresh | Review | Can this still change? | Current evaluation, with the breakdown | Continue to payment | Revalidation may still change it before binding | Do not say the amount is frozen forever | Review reached | Total readable on a narrow width |
| Stale and unchanged after validation | Review or the attempt to pay | Did anything move? | Same amount, and they may proceed when validation says it is current | Pay | None | Do not flash a false change | Unchanged revalidation | No unnecessary announcement of a change |
| Stale and result changed | Return to Review | Why can't I pay that? | Stop on the old amount. Updated total and reason on Review. | Continue on the new total, or change coupon or cart | Payment does not edit the coupon | "Your total changed before payment." | Changed revalidation | Focus on the error and a recovery action |
| Payment read-only | Payment | Can I change the code here? | Summary only. No entry, change, or remove. | Pay the current amount, or go back to Review if the product already allows back navigation for non-commercial edits that do not mutate the coupon | Commercial recovery is on Review | Do not imply a coupon box is coming | Payment reached with coupon controls absent | Controls that are absent are not focusable |
| Purchased immutable savings | Confirmation, history | What did I save? | Purchased breakdown and purchased complimentary line | None | Live offers do not rewrite it | "You saved ₹X on this order." | Purchased explanation viewed | Readable text |
| Server or network failure during apply, replace, or remove | Cart, Review | Did it apply? | Previous shared state and previous total remain | Retry | No false applied state and no false total | Say the check didn't finish | Failure without false success | Focus stays on the action |
| Operator draft | Commercial surface | Is this live? | Draft, not yet something customers receive | Continue editing | Fix validation before activate | Do not describe a draft as live | n/a customer | Errors on the field |
| Operator active | Commercial surface | Will customers get this? | Active, with the customer meaning in a sentence | Inspect or retire | Retire is confirmed | Customer implication is visible before and after activation | Operator can tell that applications happened, when the product requires that visibility | Status in text |
| Operator complimentary second activation refused | Commercial surface | Did I turn on two? | The existing one remains the only active one. This attempt is not success. | Leave it or edit a draft | No customer gift choice as a result | Truthful non-success | Conflict seen by the operator | Denial in text |
| Operator concurrent non-authoritative attempt | Commercial surface | Did my activate work? | Non-success, conflict, or retry. Not a success banner. | Reload and look at the offer that is active | Product does not choose the winner here | No false success | Outcome is truthful | Text |
| Operator retire cancelled | Commercial surface | Is it still on? | Stays active | None | Cancel is real | Confirmation names the effect on future orders and the non-effect on paid orders | n/a | Confirm and cancel are keyboard operable |
| Operator out of scope | Commercial surface | Why can't I? | Action denied. Record unchanged. | None | Do not half-apply | Denial is text | n/a | Text |

---

## 14. Responsive, mobile, accessibility, and perceived performance

Mobile is its own hierarchy, not a squeezed desktop page.

- On a small screen the amount and the next action come before secondary explanation. Coupon entry is on the surface and secondary. It is not below a block of marketing.
- Savings stay a short stack: order saving, delivery saving when real, total saved, total payable. Long reason text stays one or two lines.
- Threshold progress sits with the total story, not in a distant banner.
- The complimentary line is an item row the thumb can read, with included and ₹0, not a carousel of gifts.
- Errors sit with the coupon field or with the total when the total changed. They are not only a toast that disappears.
- If a sticky action is used later, it carries the total with the action. Design Readiness decides the geometry. This candidate forbids hiding the total or the next action below the fold as the only copy of that information.
- Touch actions that remove a coupon or continue are large enough to hit deliberately. Exact target size is Design Readiness, using the existing control sizing.
- Content density stays closer to the current checkout summary than to an admin form.

Accessibility experience:

- Coupon field has an accessible name. The result is associated with that field.
- Apply, remove, change, retire confirm, and retire cancel are keyboard operable.
- After a validation failure, focus returns to the coupon field.
- After sign-in, focus returns to the coupon result on the surface where the attempt was made.
- After a stale-total or complimentary-unavailable recovery, focus moves to the explanation and a recovery action.
- Dynamic commercial changes, including a new total, a dropped offer, and a finished coupon check, are announced. The technical live-region technique is implementation, not this candidate.
- Status is not colour alone.
- Contrast and type for prices follow the existing text styles. A saving is not communicated only by green.
- If motion is added later, it must respect reduced motion and must not be the only sign of a money change.
- Concrete ARIA attribute recipes and pixel sizes belong to Design Readiness and implementation.

Perceived performance:

| Moment | Waiting | Money on screen | Context |
|---|---|---|---|
| Cart evaluation | Items can remain. Amount shows the last authoritative result, or a checking state if no result exists yet. | Do not paint a guessed discount | Keep the cart they built |
| Coupon submit | "Checking this coupon" in text | Previous total remains until the result arrives | Keep the typed code |
| Fulfilment change | Show that the total is updating | Do not keep a delivery saving that belonged to the other mode as if it were current once the new result exists. Until it exists, do not invent the new one. | Keep the selected mode visible |
| Sign-in retry | Return to the same surface. Show that the coupon is being checked again. | No false applied total | Same code |
| Checkout revalidation | If they tried to pay, do not spin on Payment while still displaying the old amount as payable. | Either the same validated amount or a return to Review with the new amount | Recovery on Review when it changes |
| Complimentary availability recheck | Same as revalidation | The stale included line is not payable | Explain removal |

Layout should not jump the total away from the action when a one-line status appears. Exact reserved space is Design Readiness.

---

## 15. Design-system mapping

| Need | Reuse / extend / new |
|---|---|
| Totals and rows | Reuse the current order-money summary pattern. Extend the row model so order saving and a real delivery saving can be separate without a second visual system. |
| Coupon field and actions | Reuse existing form fields and buttons. Do not invent a new input style. |
| Status of an offer | Reuse text status. Extend with sentences. Do not rely on a new colour badge system. |
| Operator authoring | Reuse `/workforce/admin/commercial` and the promotions editor patterns. Extend for V1 benefit meaning, complimentary completeness, and truthful activation denial. No second application and no new button style. |
| Complimentary line | Reuse an item row. Extend with included and ₹0. No new card type for gifts. |
| Errors | Reuse field-associated errors and checkout recovery patterns. No new toast language for money. |
| Offers hub, campaign banner, gift picker | Do not create. |

---

## 16. Trust review

Prohibited, and not used as goals: fake scarcity, false countdowns, misleading savings, hidden conditions that change the payable amount without explanation, misleading button hierarchy that makes pay look like the coupon was accepted when it failed, preselected paid extras, and any copy that treats standing ₹0 delivery as an extra discount.

Price certainty: the displayed payable amount is either the latest authoritative result or clearly marked as updating. Payment does not collect money against a benefit the revalidation has already rejected.

Privacy and abuse experience inputs, for later Architecture Fit and quality planning. This candidate does not design the control.

| Topic | Customer-visible constraint | Private-information boundary | Trust impact | Architecture Fit input |
|---|---|---|---|---|
| Many identities for a first order | First-order value simply does not appear when they are not eligible. A coupon that needs identity asks them to sign in. | Do not display another customer's orders or say how the check was computed. | Over-explaining eligibility trains abuse and feels surveillance-like | Fit must support the eligibility rule without a customer explanation that leaks it |
| Coupon enumeration | Invalid copy does not say "almost" or "wrong by one character" | Do not confirm that a code exists except through the approved reason class after a real attempt | Friendly diagnostics become an oracle | Rate and attempt controls are Fit, not copy |
| Coupon leakage | The code they typed is theirs to see in the field | Do not put the code into analytics, support transcripts by default, or another customer's screen | A leaked code is a financial instrument | Analytics contract forbids the raw code |
| Cap bypass | Exhausted states are distinct and final for that attempt | Do not show global remaining uses | People trust a cap that does not flicker back on | Consumption races are Fit |
| Redemption races | One result, not two discounts for two clicks | Hide partial success | Double application destroys trust | Duplicate submit stays one applied result |
| Automation | The customer sees the same honest result | No puzzle or dark challenge is specified here | A captcha invented in this document would be a new product control | Abuse controls stay in security authority |
| Refund then buy again | First-order eligibility does not return. The experience does not advertise that | Do not explain the refund rule as a loophole or as a lecture | Silence is safer than a tip | The rule is already product |
| Private eligibility | Inapplicable and identity-required copy stays coarse | No other customer's facts | Specific errors can feel smart and still be unsafe | Customer-safe failure meanings are a Fit input |

---

## 17. Measurement intent and analytics contract

Business intent is the approved experience outcome: a customer reaches a direct order with an understandable payable amount, including when an Offer, a coupon, a threshold, or a complimentary item is part of that amount. Margin stays inside the approved commercial rules. No numeric target is locked. No revenue KPI is added. Measurement does not replace acceptance.

```text
PRIMARY_METRIC = CHECKOUT_REVIEW_TO_SUCCESSFUL_DIRECT_ORDER_COMPLETION_RATE
PRIMARY_METRIC_COUNT = 1
```

The primary metric is the Checkout Review → successful direct-order completion rate.

Denominator: eligible direct-order checkout journeys that reach Checkout Review with an authoritative commercial evaluation. Eligible here means a customer direct-order journey that can check out. Menu browsing, a cart that never reaches Review, workforce actions, and non-direct channels are outside the denominator. Count one journey once per `CHECKOUT_JOURNEY_KEY`. Another Review arrival on the same key is the same denominator journey. A repaint is not an event. Cohort entry is one global Review for that key: the qualifying Review with the lowest `AUTHORITATIVE_JOURNEY_SEQUENCE` across the whole journey, defined under cohort entry below. A named window includes that key only when that one entry's occurrence time falls inside the window.

Numerator: those same denominator journeys whose successful direct-order completion has an authoritative occurrence time strictly before the published snapshot's `REPORT_AS_OF`. Successful completion means the direct order is placed and payment for that order succeeds under accepted payment truth. A stopped stale pay attempt and a failed payment are not numerator events. A journey with no successful completion strictly before that cutoff stays in the denominator and contributes `numerator = 0` for that snapshot, recorded as `NOT_COMPLETED_AS_OF_REPORT_CUTOFF`. One completion counts once, on the same `CHECKOUT_JOURNEY_KEY` as its denominator journey. A later Review on that key does not create a numerator opportunity in a different cohort. Customer or guest identity does not attach that completion to several Review arrivals.

### Checkout journey correlation

`CHECKOUT_JOURNEY_KEY` is the measurement correlation for one logical direct-order checkout journey. Customer or guest commerce identity answers who is present. It does not identify which checkout an event belongs to. `CUSTOMER_IDENTITY` and `CHECKOUT_JOURNEY_KEY` are different concepts.

```text
CHECKOUT_JOURNEY_KEY:
  MEASUREMENT_SEMANTIC = YES
  OPAQUE = YES
  CUSTOMER_FACING = NO
  PII = NO
  PRODUCT_ENTITLEMENT = NO
  AUTHENTICATION_IDENTITY = NO
  DISTINCT_FROM_CUSTOMER_OR_GUEST_IDENTITY = YES
  STABLE_FOR_ONE_LOGICAL_DIRECT_ORDER_CHECKOUT = YES
  SCHEMA_DECISION = NO
  API_DECISION = NO
  STORAGE_MECHANISM = NO
  TELEMETRY_IMPLEMENTATION = NO
```

One logical direct-order checkout is one unpaid attempt to place one direct order. The key stays the same for every measurement event inside that attempt. It stays the same when the customer reaches Checkout Review again after:

- editing the cart
- changing fulfilment
- applying, changing, or removing a Coupon
- stale-total recovery
- payment retry or payment recovery
- signing in, or continuing as the other of guest and authenticated customer, while that same unpaid attempt continues

A new key starts when the logical checkout changes. Successful completion closes the key, and the next direct-order attempt uses a new key. A later direct-order attempt for a different unpaid order uses a new key.

This candidate does not choose a token format, column, table, cookie, timeout, or API field. A later Measurement Plan must keep this correlation. Architecture Fit PASS is now recorded in the locked capability architecture; Measurement Plan finalization remains pending. That plan must leave commerce identity as who is present, and leave the key opaque, non-customer-facing, and free of name, email, phone, coupon text, and customer or guest identifiers.

Denominator grain is one count per `CHECKOUT_JOURNEY_KEY` that reaches Checkout Review with an authoritative commercial evaluation. Numerator grain is one successful direct-order completion for that key. The primary rate joins those two events on `CHECKOUT_JOURNEY_KEY` alone.

### Authoritative journey sequence

Occurrence time places an event against a cohort interval and a report cutoff. It does not order two events inside one journey. Two authoritative results can share one timestamp because of time precision or batching.

```text
AUTHORITATIVE_JOURNEY_SEQUENCE:
  SCOPE = ONE_CHECKOUT_JOURNEY_KEY
  STRICT_TOTAL_ORDER = YES
  UNIQUE_WITHIN_JOURNEY = YES
  CUSTOMER_FACING = NO
  PII = NO
  GLOBAL_SEQUENCE = NO
  STORAGE_MECHANISM = NOT_SELECTED
  DATABASE_SEQUENCE = NOT_REQUIRED_BY_THIS_DEFINITION
  TOKEN_FORMAT = NOT_SELECTED
  API_ENCODING = NOT_SELECTED
  TELEMETRY_ARRIVAL_ORDER = NOT_AUTHORITY
```

Every material authoritative journey event needed for deterministic measurement has one `AUTHORITATIVE_JOURNEY_SEQUENCE` within its `CHECKOUT_JOURNEY_KEY`. At minimum that applies to a qualifying Checkout Review, an authoritative Review commercial evaluation, a successful direct-order completion, and a recovery or change result that can alter the Review state.

The sequence represents authoritative journey progression. If event A authoritatively happens before event B inside the same checkout journey, then `AUTHORITATIVE_JOURNEY_SEQUENCE(A)` is less than `AUTHORITATIVE_JOURNEY_SEQUENCE(B)`. The order stays the same when those same authoritative source events are queried again.

The ordering is not inferred from analytics ingestion order, batch processing order, array order returned by a query, database physical row order, or customer identity.

The occurrence timestamp of the one global cohort-entry Review is the time tested against cohort windows. Each event's occurrence timestamp remains the semantic used for report-cutoff membership. Sequence provides the total order inside the journey, including when timestamps are equal. Sequence also identifies that one global cohort-entry Review: the qualifying Review with the lowest sequence for the key, across every qualifying Review, not inside one window.

This definition does not select whether the sequence is an integer, a UUID, a revision column, a version number, a database sequence, or an event-stream offset. Locked Architecture Fit has selected that representation and mechanism. The Measurement Plan may operationalize and validate instrumentation. It does not reselect architecture.

### Cohort entry and measurement interval

Current canonical authority defines no commerce measurement calendar timezone for this metric. Decision D-273 stores real-world instants as `timestamptz` and uses IANA identifiers for business-local schedules. It does not name a measurement calendar. Outlet timezone identity is the fulfilment presentation and scheduled-promise semantic under IMP-036E, IMP-036I, and D-379. It is not this metric's cohort calendar. This measurement contract therefore locks its own calendar:

```text
MEASUREMENT_CALENDAR_TIMEZONE = Asia/Kolkata
MEASUREMENT_CALENDAR_APPLIES_TO = THIS_MEASUREMENT_CONTRACT_ONLY
CUSTOMER_LOCALE_SELECTION = NO
BROWSER_TIMEZONE = NO
DEVICE_TIMEZONE = NO
STORAGE_TIMEZONE = NO
DATABASE_TIMEZONE = NO
API_REPRESENTATION = NO
ANALYTICS_VENDOR_CONFIGURATION = NO
```

`PRODUCTION_RELEASE_ANCHOR` is the authoritative instant at which the accepted IMP-036J production release becomes the production release for direct-order customer observation. It is a measurement anchor. This candidate does not decide a deployment tool, a release table, feature-flag storage, an analytics implementation, a timestamp column, or an API representation. The later Measurement Plan may decide how this already-defined semantic is captured.

```text
INITIAL_COHORT_START = PRODUCTION_RELEASE_ANCHOR
INITIAL_COHORT_END = SAME_LOCAL_CLOCK_INSTANT_EXACTLY_28_CALENDAR_DAYS_LATER
INITIAL_COHORT_INTERVAL = [PRODUCTION_RELEASE_ANCHOR, PRODUCTION_RELEASE_ANCHOR + 28 CALENDAR DAYS)
INITIAL_REPORT_AS_OF = EXCLUSIVE_UPPER_BOUND_OF_INITIAL_COHORT_INTERVAL
BOUNDARY_SEMANTICS = START_INCLUSIVE_END_EXCLUSIVE
EVENT_AT_EXACT_END_BELONGS_TO_INITIAL_COHORT = NO
```

`INITIAL_COHORT_END` is the same local clock instant as `PRODUCTION_RELEASE_ANCHOR`, exactly 28 calendar days later, interpreted in `MEASUREMENT_CALENDAR_TIMEZONE`. Twenty-eight calendar days means civil-calendar addition of 28 days in that timezone, keeping the anchor's local clock time. It is not a customer-facing business-day rule and it is not a count of open outlet hours. Customer expiry wording in section 24 stays a plain date for the customer. It is not this measurement calendar.

The initial interval is half-open:

```text
INITIAL_COHORT_INTERVAL = [INITIAL_COHORT_START, INITIAL_COHORT_END)
```

The start is inclusive. The end is exclusive. Window membership uses `GLOBAL_COHORT_ENTRY_TIME`, defined below. A journey whose `GLOBAL_COHORT_ENTRY_TIME` is exactly `INITIAL_COHORT_START` is in the initial cohort. A journey whose `GLOBAL_COHORT_ENTRY_TIME` is exactly `INITIAL_COHORT_END` is not in the initial cohort.

### Global cohort entry

Cohort entry is selected once for the lifetime of one `CHECKOUT_JOURNEY_KEY`.

```text
GLOBAL_COHORT_ENTRY_REVIEW(JOURNEY_KEY) = QUALIFYING_CHECKOUT_REVIEW_WITH_LOWEST_AUTHORITATIVE_JOURNEY_SEQUENCE_AMONG_ALL_QUALIFYING_REVIEWS_FOR_THAT_KEY
CHECKOUT_JOURNEY_GLOBAL_COHORT_ENTRY = LOWEST_AUTHORITATIVE_JOURNEY_SEQUENCE_AMONG_ALL_QUALIFYING_REVIEWS_FOR_KEY
COHORT_ENTRY_SELECTED_PER_WINDOW = NO
COHORT_ENTRY_CAN_MOVE_AFTER_REVISIT = NO
```

The search for `GLOBAL_COHORT_ENTRY_REVIEW` considers every qualifying Checkout Review observation for that `CHECKOUT_JOURNEY_KEY`. It is not restricted by the initial cohort window, a later cohort window, `REPORT_AS_OF`, or the analytics query window. Window assignment happens only after that one global event is selected.

`GLOBAL_COHORT_ENTRY_TIME` is the authoritative occurrence time of that one Review. No other Review's occurrence time is tested for cohort membership.

A checkout journey belongs to a named cohort window only when:

```text
WINDOW_START <= GLOBAL_COHORT_ENTRY_TIME < WINDOW_END
```

Do not search inside that window for another qualifying Review. Do not replace the global entry with a later Review whose occurrence time falls in the window.

One `CHECKOUT_JOURNEY_KEY` belongs to exactly one cohort window, or to no cohort window in the measurement series being reported. It does not belong to multiple cohort windows.

```text
COHORT_MEMBERSHIP_PER_CHECKOUT_JOURNEY_KEY = ZERO_OR_ONE
LATER_REVIEW_CREATES_NEW_COHORT_MEMBERSHIP = NO
```

Example. A journey first reaches a qualifying Review in window 1, returns to Cart, and reaches Review again in window 2. The journey stays in window 1. The Review in window 2 may contribute a later journey-state or recovery observation when the snapshot rules already allow that. It does not create a denominator in window 2, does not change cohort entry, and does not move the journey.

### Pre-window journey

If `GLOBAL_COHORT_ENTRY_TIME` is before `INITIAL_COHORT_START`, and the same `CHECKOUT_JOURNEY_KEY` revisits Review inside the initial 28-day window, the journey is not in the initial cohort. The later Review does not become a replacement cohort entry. There is no catch-up rule.

The same rule applies to any later measured window. If the global cohort-entry Review occurred in an earlier measured window, a revisit in a later measured window does not enter the later cohort.

### Initial cohort

```text
PRIMARY_DENOMINATOR = UNIQUE_CHECKOUT_JOURNEY_KEYS_WHOSE_GLOBAL_COHORT_ENTRY_TIME_FALLS_INSIDE_THE_HALF_OPEN_WINDOW
```

For the initial baseline, the primary denominator is the unique `CHECKOUT_JOURNEY_KEY` values whose `GLOBAL_COHORT_ENTRY_TIME` falls in `[PRODUCTION_RELEASE_ANCHOR, PRODUCTION_RELEASE_ANCHOR + 28 CALENDAR DAYS)`. It is not every qualifying Review whose occurrence time falls in that interval.

A journey enters that cohort once. A later Review on the same key does not create another denominator, does not move cohort entry, and does not place that journey into another initial cohort.

### Subsequent cohorts

Subsequent comparable 28-day windows remain new cohorts. Each uses the same half-open convention in the same measurement timezone: `[WINDOW_START, WINDOW_START + 28 CALENDAR DAYS)`. Adjacent windows share a boundary instant and do not overlap. A `GLOBAL_COHORT_ENTRY_TIME` exactly at one window's exclusive end belongs to the window that starts at that instant, and to no earlier window.

Each later window reuses the `GLOBAL_COHORT_ENTRY_TIME` already defined for that journey. It does not select a new entry Review. The journey enters that later window only when that one time falls inside it. Adjacent half-open windows therefore stay disjoint.

```text
SUBSEQUENT_WINDOW_MEMBERSHIP = TEST_GLOBAL_COHORT_ENTRY_TIME_AGAINST_WINDOW
RESELECT_ENTRY_REVIEW_FOR_SUBSEQUENT_WINDOW = NO
```

### Report as of

```text
REPORT_AS_OF = OBSERVATION_CUTOFF_OF_ONE_PUBLISHED_METRIC_SNAPSHOT
REPORT_AS_OF_REQUIRED = YES
INITIAL_REPORT_AS_OF = INITIAL_COHORT_END
EVENT_INCLUDED_IN_INITIAL_SNAPSHOT = authoritative_occurrence_time < INITIAL_REPORT_AS_OF
CUSTOMER_VISIBLE = NO
CHECKOUT_TIMEOUT = NO
ABANDONMENT_RULE = NO
PRODUCT_LIFECYCLE_STATE = NO
ARCHITECTURE_OR_STORAGE_DECISION = NO
```

`REPORT_AS_OF` is a measurement semantic. Every published metric snapshot identifies the observation cutoff used for that snapshot.

For the initial baseline snapshot, `INITIAL_REPORT_AS_OF` is `INITIAL_COHORT_END`, the exclusive upper bound of the initial cohort interval. An event is included in that snapshot only when its authoritative occurrence time is strictly before `INITIAL_REPORT_AS_OF`. An event exactly at `INITIAL_REPORT_AS_OF` is excluded.

```text
NUMERATOR_AS_OF(REPORT_AS_OF) = UNIQUE_DENOMINATOR_KEYS_WHOSE_SUCCESSFUL_DIRECT_ORDER_COMPLETION_OCCURRED_STRICTLY_BEFORE_REPORT_AS_OF
```

One journey contributes at most one numerator count. A denominator journey with no successful direct-order completion whose authoritative occurrence time is strictly before `REPORT_AS_OF` contributes `denominator = 1` and `numerator = 0` on that published snapshot. Its state on that snapshot is `NOT_COMPLETED_AS_OF_REPORT_CUTOFF`.

A later successful completion leaves an already-issued historical snapshot unchanged. A later follow-up snapshot may include that completion only when the completion's authoritative occurrence time is strictly before that later snapshot's own `REPORT_AS_OF`.

### Unfinished at the cutoff

```text
UNFINISHED_AT_REPORT_AS_OF = DENOMINATOR_JOURNEY_WITH_NO_SUCCESSFUL_COMPLETION_STRICTLY_BEFORE_REPORT_AS_OF
UNFINISHED_AT_CUTOFF_DENOMINATOR = YES
UNFINISHED_AT_CUTOFF_NUMERATOR = NO
NOT_COMPLETED_AS_OF_REPORT_CUTOFF = YES
PRODUCT_ABANDONMENT_TIMEOUT_CREATED = NO
ENDS_UNPAID_REQUIRED = NO
OBSERVATIONS_USED = AUTHORITATIVE_OCCURRENCE_TIME_STRICTLY_BEFORE_REPORT_AS_OF
```

An unfinished-at-cutoff journey remains in the denominator and stays out of the numerator. The snapshot uses only observations whose authoritative occurrence time is strictly before `REPORT_AS_OF`. A later, separately labelled snapshot may show a later state under its own cutoff. This candidate does not create a checkout abandonment timeout, a cart expiry, a session expiry, an automatic cancellation, or a new customer-visible state.

### Segment attribution

The descriptive offer segment is one authoritative Review commercial evaluation, chosen by `AUTHORITATIVE_JOURNEY_SEQUENCE`. "Last" is not occurrence time alone.

For a journey that successfully completed with an occurrence time strictly before `REPORT_AS_OF`:

1. Identify the successful completion event for that `CHECKOUT_JOURNEY_KEY`.
2. Consider authoritative Review commercial evaluations that precede that completion in `AUTHORITATIVE_JOURNEY_SEQUENCE`.
3. Select the eligible Review evaluation with the greatest `AUTHORITATIVE_JOURNEY_SEQUENCE`.

That evaluation is the completed-journey segment.

For a denominator journey that has not successfully completed strictly before `REPORT_AS_OF`:

1. Consider authoritative Review commercial evaluations whose occurrence time is strictly before `REPORT_AS_OF`.
2. Select the one with the greatest `AUTHORITATIVE_JOURNEY_SEQUENCE`.

That evaluation is the unfinished-journey segment for that snapshot.

If only the global cohort-entry Review exists, that Review is the segment.

A Review evaluation may influence the purchased or completion segment only when it precedes completion in authoritative journey order.

Earlier Review evaluations on the same key may feed secondary continuation and recovery metrics. They do not add a denominator journey, and they do not take a share of the completion. A completion that has no matching `CHECKOUT_JOURNEY_KEY` on a denominator Review is not assigned to any Review arrival through customer or guest identity.

Cohort assignment and segment attribution are separate. A later Review evaluation may update the descriptive segment of a later maturation snapshot for the same original cohort, when the snapshot rules above permit that. It does not move cohort membership, does not establish a new cohort entry, and does not create another denominator.

Events after `REPORT_AS_OF` do not mutate the segment of an already-issued snapshot.

```text
PUBLISHED_SNAPSHOT_SEGMENT_IMMUTABLE = YES
```

A later follow-up report may compute a new as-of snapshot. That report names its own later cutoff.

#### Same occurrence timestamp

Two authoritative Review evaluations on the same `CHECKOUT_JOURNEY_KEY` may share an occurrence timestamp. The evaluation with the greater `AUTHORITATIVE_JOURNEY_SEQUENCE` is later. Segment attribution uses that order, so the same source events still select one segment.

A Review evaluation and a successful completion may also share an occurrence timestamp because of timestamp precision. Their `AUTHORITATIVE_JOURNEY_SEQUENCE` values establish which occurred first. Equal timestamps do not make the two events simultaneous for measurement order.

### Cohort window and report cutoff

```text
FOLLOW_UP_WINDOW = SUBSEQUENT_COMPARABLE_28_DAY_WINDOWS_WHERE_USEFUL
```

A named window includes a journey only when that journey's `GLOBAL_COHORT_ENTRY_TIME` falls inside the window. The window does not select another Review. `REPORT_AS_OF` chooses which events may contribute to that published snapshot, and that choice is authoritative occurrence time strictly before the cutoff.

Subsequent comparable 28-day windows are new cohorts and use the same half-open convention. A journey has exactly one global cohort-entry Review: the qualifying Review with the lowest `AUTHORITATIVE_JOURNEY_SEQUENCE` for that `CHECKOUT_JOURNEY_KEY` across the journey. Its authoritative occurrence time is then tested against the half-open cohort windows. A later Review never replaces cohort entry and never moves the journey into a later cohort.

```text
SUBSEQUENT_WINDOW_MEMBERSHIP = TEST_GLOBAL_COHORT_ENTRY_TIME_AGAINST_WINDOW
RESELECT_ENTRY_REVIEW_FOR_SUBSEQUENT_WINDOW = NO
```

A maturation report for an existing cohort is a later snapshot, not a new cohort. It retains the original cohort membership and the original `GLOBAL_COHORT_ENTRY_REVIEW`. It may advance `REPORT_AS_OF`. It may observe a later successful completion, and it may observe a later Review or recovery state, only under the cutoff rules already defined. It does not recalculate which cohort the journey belongs to. It leaves the earlier snapshot unchanged.

One published number keeps one cohort definition and one `REPORT_AS_OF`. It does not combine rolling page views, a journey cohort, and completions from at or after that cutoff.

### Snapshot reproducibility

```text
GLOBAL_COHORT_ENTRY_SELECTION = ONCE_PER_CHECKOUT_JOURNEY_KEY
GLOBAL_COHORT_ENTRY_SOURCE = LOWEST_AUTHORITATIVE_JOURNEY_SEQUENCE_AMONG_ALL_QUALIFYING_REVIEWS
COHORT_WINDOW_ASSIGNMENT = GLOBAL_COHORT_ENTRY_TIME_ONLY
COHORT_ASSIGNMENT_RECALCULATED_PER_WINDOW = NO
COHORT_MEMBERSHIP = ZERO_OR_ONE
REVIEW_REVISIT_MOVES_COHORT = NO
PRIMARY_METRIC_GRAIN = ONE_PER_CHECKOUT_JOURNEY_KEY
MEASUREMENT_CALENDAR_TIMEZONE = LOCKED
COHORT_INTERVAL_BOUNDARY = START_INCLUSIVE_END_EXCLUSIVE
REPORT_AS_OF_REQUIRED = YES
EVENT_CUTOFF_RULE = AUTHORITATIVE_OCCURRENCE_TIME_STRICTLY_BEFORE_REPORT_AS_OF
JOURNEY_EVENT_TOTAL_ORDER_REQUIRED = YES
SAME_TIMESTAMP_ORDER_AMBIGUITY = NO
EVENTS_AFTER_REPORT_AS_OF_MUTATE_PUBLISHED_SNAPSHOT = NO
UNFINISHED_AT_CUTOFF_DENOMINATOR = YES
UNFINISHED_AT_CUTOFF_NUMERATOR = NO
PRODUCT_ABANDONMENT_TIMEOUT_CREATED = NO
```

Repeated calculation against the same authoritative source events produces the same global cohort entry, the same cohort membership, the same denominator membership, the same numerator membership for a fixed `REPORT_AS_OF`, and the same descriptive segment for a fixed `REPORT_AS_OF`. That calculation uses the same cohort windows, the same `CHECKOUT_JOURNEY_KEY`, the same authoritative occurrence times, and the same `AUTHORITATIVE_JOURNEY_SEQUENCE` values.

Current authority has no analytics policy that names a different primary metric for this slice, and it has no trustworthy pre-release series. This rate matches the business intent without inventing a revenue target.

The rate may be described in these segments. Segments are descriptive. They are not causal evidence.

- no Offer
- automatic saving
- Coupon selected, with equal-payable selected as a descriptive sub-segment when that state was shown
- Coupon valid but not selected, with equal-payable not selected as a descriptive sub-segment when that state was shown
- threshold progress
- complimentary item
- changed-total recovery

Secondary metrics stay subordinate to the primary metric. None of them is a second primary metric.

- Cart → Checkout Review continuation
- Review → Payment continuation
- payment completion after revalidation
- coupon attempt outcome distribution, as the coarse class only
- continuation after valid-but-not-selected, including continuation after the equal-payable not-selected sentence
- continuation after changed-total recovery
- complimentary unavailable recovery continuation
- repeated invalid attempts
- support contacts about a coupon, an Offer, the total, or an included item
- displayed savings integrity: the explained parts equal the evaluated saving

Whether the customer understood a sentence cannot be inferred reliably from these events. Comprehension stays a usability and research question for Founder Experience UAT and internal usability review. It is not pretended into an analytics metric.

```text
BASELINE = FIRST_VALID_PRODUCTION_OBSERVATION_WINDOW
BASELINE_PROVES_LAUNCH_UPLIFT = NO
INITIAL_OBSERVATION_WINDOW = [PRODUCTION_RELEASE_ANCHOR, PRODUCTION_RELEASE_ANCHOR + 28 CALENDAR DAYS)
INITIAL_REPORT_AS_OF = INITIAL_COHORT_END
FOLLOW_UP_WINDOW = SUBSEQUENT_COMPARABLE_28_DAY_WINDOWS_WHERE_USEFUL
STATISTICAL_SIGNIFICANCE_THRESHOLD = NOT_CLAIMED
```

No trustworthy pre-release baseline exists. The first valid production window may establish a baseline. That baseline cannot prove launch uplift. A later window is compared with an earlier window only as a description, and each side of that comparison keeps its own cohort and its own named `REPORT_AS_OF`. Improvement is not claimed merely because the first window exists. Low direct-order volume does not justify a significance test. No repository measurement-window convention for this slice overrides the 28-day window.

Interpretation rule, fixed before data exists:

- Acceptance is not determined by this metric.
- A production window does not prove causality.
- Segments are descriptive unless a valid controlled experiment exists.
- Low volume is `INSUFFICIENT_EVIDENCE`, not success and not failure.
- Financial truth, privacy, authorization, and accessibility are never traded against conversion.
- Material deterioration in payment completion, error rate, refunds, cancellations, support contacts, or margin guardrails triggers new Discovery or investigation.
- Improvement may justify further research or iteration. It does not silently rewrite accepted Product behaviour.
- A controlled experiment requires the full EXP-1 experiment contract before any causal claim.

Guardrails. Do not optimize the primary rate at the expense of any of these.

- margin inside the approved commercial rules, not a new margin policy
- payment completion
- refund and cancellation
- support contacts about a coupon, an Offer, the total, or an included item
- commercial evaluation errors and coupon errors
- delivery and pickup completion
- privacy, including no raw coupon text and no private eligibility facts
- accessibility minimums
- financial truth: displayed savings match evaluated effects, and no saving is fabricated

```text
CAUSAL_CONVERSION_CLAIM = NOT_MADE
CURRENT_EVIDENCE_FOR_LIFT = INSUFFICIENT_EVIDENCE
LOW_VOLUME = INSUFFICIENT_EVIDENCE
MEASUREMENT_SUBSTITUTES_FOR_ACCEPTANCE = NO
```

Success learning signal: in a window that is not low volume, the primary rate can be described together with intact guardrails, and displayed savings still match the evaluation. That description is a reason to keep observing or to research further. It is not acceptance and not a rewrite of product behaviour.

Failure learning signal: a material deterioration in the primary rate that arrives with a guardrail breach, repeated displayed-savings mismatches, repeated invalid coupon attempts, or support contacts about the total, a coupon, an Offer, or an included item. Those signals open Discovery or investigation. They do not authorize a silent product change.

Known causal limitations: there is no pre-release baseline; the first window cannot prove uplift; segments are not causes; low traffic cannot separate an experience effect from ordinary volume; menu, price, season, and payment-provider changes can move the rate; comprehension is outside this metric.

### Analytics data-contract requirements

Do not implement collection. Do not choose a schema, API, or storage mechanism for `CHECKOUT_JOURNEY_KEY`, authoritative occurrence time, or `AUTHORITATIVE_JOURNEY_SEQUENCE`. Do not add attributes because they might be useful. Do not add raw coupon text. Do not add private eligibility facts. Do not use customer identity as the journey key. Do not use analytics arrival order as journey order. Do not select a database window function, a storage table, an analytics vendor, or an event-stream technology.

Event ownership is not assigned in this candidate. It is finalized later in the Measurement Plan. A placeholder name here would pretend that assignment already exists.

The events below are sufficient, once implemented under that plan, to calculate the primary metric and the telemetry secondary metrics. Support-contact counts stay an operational guardrail from existing support handling. This candidate does not define a support-ticket schema.

A qualifying Review observation, an authoritative Review commercial result, a successful direct-order completion, and a recovery or change result that can alter the Review state each carry `CHECKOUT_JOURNEY_KEY`, an authoritative occurrence time, and `AUTHORITATIVE_JOURNEY_SEQUENCE`. Those three fields are sufficient, once captured, to identify every qualifying Review for one key, select the globally lowest `AUTHORITATIVE_JOURNEY_SEQUENCE` once, take that event's occurrence time as `GLOBAL_COHORT_ENTRY_TIME`, assign the journey to zero or one half-open cohort window, and keep a later Review revisit from adding another denominator. Report-cutoff membership still compares each included event's occurrence time with `REPORT_AS_OF` by a strict less-than cutoff. Cohort membership does not compare any later Review's occurrence time with the window. The sequence is the total order inside that key. The later Measurement Plan owns encoding and implementation. This candidate does not decide a database timestamp column, an event bus, an API field, a token format, a cookie or local store, a persistence table, identifier generation, a sequence encoding, or an analytics vendor.

| Event meaning | Trigger | Owner | Required attributes | Forbidden | Identity | Dedup | Schema | Source of truth | Validation | Retention |
|---|---|---|---|---|---|---|---|---|---|---|
| Offer result viewed | Cart or Review shows an authoritative result | Finalized later in the Measurement Plan. Not assigned here. | Surface; saving present; progress present; whether displayed parts match the evaluated saving; coarse descriptive shape: none, automatic saving, order saving, delivery saving, both, complimentary line, coupon selected, coupon valid but not selected, equal-payable selected, equal-payable not selected, threshold progress; `CHECKOUT_JOURNEY_KEY` when the event is inside one logical direct-order checkout; authoritative occurrence time comparable with `REPORT_AS_OF`; `AUTHORITATIVE_JOURNEY_SEQUENCE` when this view is an authoritative Review commercial evaluation or another material journey event used for ordering | Raw coupon text, private eligibility facts, item-level free text that is not already on the order, another customer's id, a journey key that contains or is a customer id, guest id, name, email, phone, or coupon text, analytics arrival order used as journey order, an implementation-specific sequence or storage decision | Existing customer or guest commerce identity records who is present. `CHECKOUT_JOURNEY_KEY` is the checkout correlation and is a different concept. No new authentication identity. | One view per presented evaluation result, not per repaint. Repeated views on one key stay one checkout. | Versioned when implemented | The evaluation result the screen rendered | The recorded shape matches the rendered rows, and the match flag is true only when the explained parts equal the evaluated saving. A Review view used in the primary segment carries the same `CHECKOUT_JOURNEY_KEY` as the journey. Its occurrence time is strictly before the snapshot cutoff, and its place in the journey is its `AUTHORITATIVE_JOURNEY_SEQUENCE`. | Follow existing commerce analytics retention. Do not extend it here. |
| Coupon attempt finished | Apply, replace, or remove completes or fails | Same later plan. Not assigned here. | Surface; coarse outcome class: selected, equal-payable selected, valid not selected, equal-payable not selected, invalid, expired, inapplicable, globally exhausted, personally exhausted, identity required, removed, replaced, failed; whether the payable total changed relative to the valid alternative; `CHECKOUT_JOURNEY_KEY` when the attempt is inside one logical direct-order checkout; authoritative occurrence time comparable with `REPORT_AS_OF`; `AUTHORITATIVE_JOURNEY_SEQUENCE` when the attempt can alter the Review state | Raw coupon text, cap sizes, private eligibility facts, other customer ids, a journey key that contains or is a customer id, guest id, name, email, phone, or coupon text, analytics arrival order used as journey order, an implementation-specific sequence or storage decision | Same who-is-present identity, distinct from `CHECKOUT_JOURNEY_KEY` | One outcome per completed attempt. The attempt does not mint a new key for the same unpaid checkout. | Versioned when implemented | Server result of that attempt | Class matches the sentence family shown. The key matches the checkout attempt that showed the sentence. | Same |
| Step progression | Cart continue, Review reached with an authoritative evaluation, Review continue to Payment, pay attempt, successful direct-order completion, confirmation view | Same later plan. Not assigned here. | Step name; for Review reached, that an authoritative evaluation was shown; for completion, that the direct order completed successfully; `CHECKOUT_JOURNEY_KEY`; authoritative occurrence time comparable with `REPORT_AS_OF`; `AUTHORITATIVE_JOURNEY_SEQUENCE` for the qualifying Review and for successful completion | Payment instrument details, raw coupon text, private eligibility facts, using customer or guest identity as the join between Review and completion, analytics arrival order used as journey order, an implementation-specific sequence or storage decision | Who-is-present customer or guest commerce identity. The join between Review and completion is `CHECKOUT_JOURNEY_KEY`. No new authentication identity. | One denominator count per `CHECKOUT_JOURNEY_KEY` whose one global cohort-entry Review has an occurrence time inside the named half-open window. Further Review arrivals on that key are not extra denominator counts and do not assign a later window. One numerator count when that same key completes the direct order successfully. Re-renders do not add events. | Versioned when implemented | The navigation or payment result the customer hit | A stale or failed pay attempt is not successful completion. A completion joins exactly one denominator key. A snapshot includes that completion only when its occurrence time is strictly before that snapshot's `REPORT_AS_OF`. When that completion shares a timestamp with a Review evaluation, sequence decides which is earlier. | Same |
| Recovery shown | Revalidation changes the amount, or a complimentary line is removed | Same later plan. Not assigned here. | Recovery kind: changed total, or complimentary unavailable; whether they later continue; `CHECKOUT_JOURNEY_KEY`; authoritative occurrence time comparable with `REPORT_AS_OF`; `AUTHORITATIVE_JOURNEY_SEQUENCE` when the recovery can alter the Review state | The discarded benefit's internal id in customer analytics, raw coupon text, private eligibility facts, unless a later plan explicitly needs an operator-safe id outside customer analytics; a journey key that contains or is a customer id, guest id, name, email, phone, or coupon text, analytics arrival order used as journey order, an implementation-specific sequence or storage decision | Same who-is-present identity, distinct from `CHECKOUT_JOURNEY_KEY` | One recovery per changed result on that key. Recovery does not start a new denominator journey. | Versioned when implemented | Revalidation result | The event exists only when the customer-facing recovery exists, and it carries the key of the unpaid attempt being recovered. Continuation counted on a published snapshot is continuation whose occurrence time is strictly before that snapshot's `REPORT_AS_OF`. | Same |

The denominator for a named cohort is the unique `CHECKOUT_JOURNEY_KEY` whose one global cohort-entry Review — the qualifying Review with the lowest `AUTHORITATIVE_JOURNEY_SEQUENCE` across that whole journey — has a `GLOBAL_COHORT_ENTRY_TIME` inside that half-open window. The numerator for a published snapshot of that cohort is successful direct-order completion of those same keys with an occurrence time strictly before that snapshot's `REPORT_AS_OF`. A Review revisit does not open a new numerator in another cohort. The descriptive segment follows the completed and unfinished sequence rules above, and events at or after that cutoff leave the issued snapshot unchanged. Customer or guest identity stays who is present and is not the join. Analytics arrival order is not the journey order. Secondary continuation, coupon-class, recovery, and savings-integrity metrics use the other events on that key when they happen inside the journey and their occurrence time is strictly before the same cutoff. Those segments are not an experiment assignment.

Operator application and redemption visibility required by the Product Definition is operational, on the commercial surface, and is not this customer analytics contract. It is not campaign lift.

---

## 18. Research and prototype evidence

Evidence in hand for this candidate:

- `FACT` and `SUPPORTED_EVIDENCE` of the current screens, from repository inspection and the Product Definition.
- `PRODUCT_DECISION` for FD-036J-01, FD-036J-02, and FD-036J-03.
- No `CUSTOMER_USABILITY_RESEARCH`, no `PRODUCTION_BEHAVIOURAL_DATA` series, and no `CONTROLLED_EXPERIMENT`.

Low-fidelity flows below are the prototype evidence EXP-1 allows at definition time. They are not high-fidelity UI and not Design Readiness.

### Cart value

Items, including an included ₹0 line when a complimentary item is selected. Then the saving stack when a real saving exists: order saving, delivery saving only when real, total saved. Then the delivery charge when delivery is in play, without a second invented saving. Then total payable. Coupon field under that stack. Primary button: Checkout.

### Coupon states

Untouched field. Checking, with the old total held. Applied, when the coupon combination pays less. Each failure sentence. Remove. Change. The two equal-payable flows below are separate from "applied" and from "valid but not selected."

### Review

Same stack, plus fulfilment. Inherited coupon is already filled as a result, not a blank second field. First entry can happen here. Total sits with continue to payment. An inherited equal-payable result uses the same sentence it used on Cart.

### Valid but not selected

The previous saving remains the one in the stack. The coupon area says the code is valid and it does not improve the total, and that the better amount was kept. The pay amount does not increase. This flow is only the strictly lower non-coupon payable amount. It is not either equal-payable flow. It is not the complimentary equal-payable case, which shows the included item instead.

### Equal payable, coupon selected

The evaluator's selected result is the coupon-backed combination, and the payable amount equals the valid non-coupon alternative. The coupon area says the coupon is applied and the total stays the same. The stack shows only actual evaluated effects. It does not add a saving that the alternative did not already match. No "better" wording.

### Equal payable, coupon not selected

The retained result stays in the stack. The coupon area says the coupon is valid and it does not change the total. If an offer remains applied, the flow may say the current offer stays applied. It does not say the amount is better. It does not mark the coupon invalid. The customer cannot switch to the other combination from this sentence.

### Complimentary

An item row named as the operator's item, "Included with your offer", ₹0. No options. If delivery saving is real, it is a separate row. When this line is selected because the payable amount equals the no-primary combination, the flow is the same. It does not say a coupon or another offer was the better amount.

### Threshold

"Add ₹X more to unlock …" where the saving stack will be. It disappears when the offer applied line replaces it. It returns, with a drop-off sentence, if the cart falls below.

### Stale recovery

Payment does not show a coupon box. If the result changes, the customer is on Review, the old pay action is gone, and the updated stack is what they read.

### Mobile

The same stack in one column. Total and the next action are in the first screenful of the summary, not only after a long story.

Validation method before treating any hypothesis as learned: `FOUNDER_HEURISTIC_REVIEW` during Founder Experience UAT, and `INTERNAL_USABILITY_REVIEW` of these flows. Not customer research unless it is later actually run.

Controlled experiments are not recommended for security, privacy, financial truth, authorization, or minimum accessibility. A later prominence experiment is optional and only inside the hierarchy already decided: the field stays on Cart and Review, the total stays primary, and money text stays truthful. Until traffic exists, the result of any such idea is `INSUFFICIENT_EVIDENCE`. The 28-day window in section 17 is an observation window for the primary metric. It is not an experiment decision rule and it does not declare a winner. An experiment plan, when later authorized, still needs the full EXP-1 contract: hypothesis, assignment unit, population, control, variant, primary metric, guardrails, observation window, decision rule, and stop conditions. None of those are set to a winner here.

---

## 19. Experience Gate

```text
EXPERIENCE_GATE
Experience Intent defined: YES (candidate)
User goal understood: YES (candidate)
Entry / discoverability defined: YES (candidate)
End-to-end journey defined: YES (candidate)
Information architecture defined: YES (candidate)
Information hierarchy defined: YES (candidate)
Primary interaction defined: YES (candidate)
Mental model / cognitive load considered: YES (candidate)
Friction reviewed: YES (candidate)
Trust-sensitive moments considered: YES (candidate)
Content strategy defined: YES (candidate)
Error / recovery defined: YES (candidate)
Mobile / responsive defined: YES (candidate)
Accessibility considered: YES (candidate)
Service / operational promise aligned where applicable: YES (candidate)
Performance experience considered: YES (candidate)
Measurement intent defined: YES (candidate)
Equal-payable Coupon experience defined: YES
Research / evidence level disclosed: YES
Unresolved experience decisions: NONE
Result: PASS
```

`Unresolved experience decisions: NONE` means this definition does not leave a presentation choice that changes product behaviour. Equal-payable coupon presentation covers both Architecture Fit outcomes and does not choose the general winner. The complimentary equal-payable rule stays the approved Product rule. Section 17 defines `CHECKOUT_JOURNEY_KEY` as the measurement join for one logical checkout, and it defines one global cohort entry per key, window assignment from that entry time only, the locked measurement calendar, the half-open cohort interval, `REPORT_AS_OF`, unfinished-at-cutoff membership, `AUTHORITATIVE_JOURNEY_SEQUENCE`, and published-snapshot immutability as measurement semantics. Those rules do not add a Product abandonment timeout and do not choose a schema, API, storage mechanism, or analytics encoding. Hypotheses in section 4 stay hypotheses. They are not open product decisions. Independent Experience Gate review `5342581233` returned PASS for these semantics. Experience Gate PASS is not Architecture Fit, Architecture Lock, Design Readiness, or implementation authorization.

```text
EXPERIENCE_GATE_EXECUTION = PERFORMED
EXPERIENCE_GATE = PASS
EXPERIENCE_GATE_RESULT = PASS
INDEPENDENT_EXPERIENCE_GATE_REVIEW_ID = 5342581233
EXPERIENCE_GATE_EVALUATED_HEAD = 1fbabd2fb80851912815efe4e0ebe331a1318557
OPEN_EXPERIENCE_DECISIONS = NONE
```

---

## 20. Architecture Fit reconciliation

Experience requirements that Architecture Fit had to satisfy. These requirements remain Experience semantics. They are not schemas, keys, locks, topology, or API ownership. Architecture Fit PASS for current source `IMP-036J-FIT-CANDIDATE-9` is persisted. Prior lock history preserves `IMP-036J-FIT-CANDIDATE-5`. This section does not change the requirements.

- A threshold sentence can be driven by an authoritative gap. Independent eligibility maths on the client is prohibited.
- One commercial result can explain order saving, delivery saving, total saved, and payable amount without a second calculator.
- Cart and Checkout Review read and write one coupon state.
- Payment can render that result without a mutation control.
- Purchased confirmation and history can show the saved amount and complimentary line from purchased truth after the live offer changes.
- Complimentary presentation can include the item identity, the no-extra-merchandise-charge fact, and the included reason.
- Customer-visible failures can be the coarse classes in section 12.
- When a valid coupon combination and the valid non-coupon alternative have the same payable amount, Fit can return either selected outcome. The experience renders the matching sentence in section 12. Fit is not asked to invent customer copy, and this candidate does not choose that winner. The complimentary equal-payable selection remains the Product rule, not a Fit tie-break.
- Pre-payment change can return the customer to Review with an explanation of the new result.
- The section 17 primary rate can treat one logical direct-order checkout as one journey across Review revisits. Customer or guest identity remains who is present. This candidate does not choose a schema, API, or stored identifier for that correlation.
- Architecture Fit must demonstrate that an implementation can provide a stable `CHECKOUT_JOURNEY_KEY`, authoritative event occurrence semantics, deterministic authoritative journey ordering, one global cohort-entry Review per key, and exact assignment of that one entry time to half-open measurement windows, without using customer identity as the checkout correlation, without relying on telemetry ingestion order, without inventing a Product abandonment timeout, without reselecting cohort entry inside each window, and without changing the approved Product behaviour. This is an Experience requirement. This candidate does not solve the storage, API, or schema design.

```text
MEASUREMENT_IMPLEMENTATION_REQUIRED_LATER = ONE_GLOBAL_COHORT_ENTRY_THEN_HALF_OPEN_WINDOW_ASSIGNMENT
MEASUREMENT_IMPLEMENTATION_CHOSEN = NO
ONE_GLOBAL_COHORT_ENTRY_REVIEW_PER_CHECKOUT_JOURNEY_KEY = REQUIRED_LATER
PER_WINDOW_RESELECTION_OF_COHORT_ENTRY = PROHIBITED
ARCHITECTURE_FIT_MUST_SHOW_STABLE_CHECKOUT_JOURNEY_KEY = YES
ARCHITECTURE_FIT_MUST_SHOW_AUTHORITATIVE_OCCURRENCE_TIME = YES
ARCHITECTURE_FIT_MUST_SHOW_DETERMINISTIC_JOURNEY_ORDER = YES
ARCHITECTURE_FIT_MUST_SHOW_EXACT_MEASUREMENT_WINDOW_BOUNDARY = YES
```
- Operator activation can return truthful non-success when a complimentary activation is not authoritative.

```text
SOURCE_VALUE = authoritative commercial evaluation or purchased truth
FRONTEND_INDEPENDENT_ELIGIBILITY_CALCULATION = PROHIBITED
```

Architecture Fit is `PASS`. The locked capability architecture current source is `IMP-036J-FIT-CANDIDATE-9`. Prior lock history preserves `IMP-036J-FIT-CANDIDATE-5`. This Experience Definition does not change experience semantics to follow that architecture. Design Readiness is `PASS`. Implementation is AUTHORIZED and NOT_STARTED.

An experience requirement that Fit cannot support safely remains a Fit STOP under the Product Definition. This document does not downgrade the complimentary item, the breakdown, or the shared coupon state to avoid that question.

---

## 21. Design Readiness

```text
DESIGN_READINESS = PASS
```

Design Readiness PASS is recorded in [`design-readiness.md`](./design-readiness.md) for `IMP-036J-DESIGN-CANDIDATE-2`. The Implementation Plan is PASS. This Experience Definition does not change. Implementation Authorization APPROVED is immutable provenance. Current execution/lifecycle is owned by STATE.md.

---

## 22. Experience QA and Founder Experience UAT

`FOUNDER_UAT_REQUIRED = YES` because the Product Definition will change customer-visible savings and operator-visible commercial operation. This candidate does not perform UAT and does not record a verdict.

When implementation later exists, evidence under TEST-1 separates:

- Functional QA for the acceptance scenarios
- Experience QA that the journey in section 6 is coherent, including discoverability, hesitation at the coupon result, and recovery
- Content QA that shipped words match the language matrix and contain no raw backend codes
- Accessibility and responsive QA for the behaviours in section 14
- Security and abuse QA for the boundaries in section 16, without treating copy as the control

Founder Experience UAT, when that human gate is reached, looks at discoverability, first impression, hesitation, clarity, trust, friction, recovery, content, mobile behaviour, brand coherence, and the Experience Intent in section 2. Only the Founder gives that verdict.

```text
FOUNDER_UAT_REQUIRED = YES
FOUNDER_UAT = NOT_PASSED_BY_THIS_CANDIDATE
```

---

## 23. Open experience decisions

```text
OPEN_EXPERIENCE_DECISIONS = NONE
PRODUCT_DECISION_REQUIRED = NO
```

No required experience choice found during this discovery needs a new or changed product rule. FD-036J-01, FD-036J-02, and FD-036J-03 stay as approved. The collapsed-coupon idea remains an evidence hypothesis inside the hierarchy this candidate already sets.

---

## 24. Quality attribute profile

Experience consequence only. Mechanisms are later Fit and quality planning.

| Attribute | Classification | Experience consequence |
|---|---|---|
| Performance | `REQUIRED` | Money does not flash a false value while a check runs. Waits are explained. |
| Availability | `REQUIRED` | If value cannot be evaluated, the customer sees a recoverable failure and not a fabricated saving. |
| Reliability | `REQUIRED` | The same shared coupon state appears on Cart and Review. |
| Resilience | `REQUIRED` | A failed request leaves the previous state. A stale benefit cannot be paid. |
| Security | `REQUIRED` | Customer copy does not become an enumeration or eligibility oracle beyond the approved reason class. |
| Privacy | `REQUIRED` | Another customer's orders, caps, and codes are not part of the explanation. |
| Accessibility | `REQUIRED` | Section 14. Minimum accessibility is not an experiment. |
| Responsive / device support | `REQUIRED` | Section 14. Mobile hierarchy is in scope. |
| Scalability | `N/A` for this candidate's experience choices. Capacity is an operational question and does not change the journey. | The experience does not add a browse destination that would invent a new high-traffic offers page. |
| Concurrency | `REQUIRED` | Double submit does not look like two savings. Operator activation does not show false success. |
| Data integrity | `REQUIRED` | Explained savings match the result. History matches the purchase. |
| Observability | `REQUIRED` | Operator can see that a V1 offer is applying, exhausted, or failing validation, as the Product Definition already requires. Customer analytics stay inside section 17. |
| Supportability | `REQUIRED` | Support can read the same purchased explanation the customer sees, inside existing order access. No second vocabulary for agents that contradicts the customer sentence. |
| Backward compatibility | `REQUIRED` | Orders already purchased without this explanation keep a coherent total. New explanation does not reprice them. Absence of an offer remains a valid cart. |
| Localization / formatting | `REQUIRED` for money and quantities in the current India / rupee presentation. `N/A` for a second language: none is authorized. | Rupee amounts are exact. Dates of expiry, if shown, use a plain date the customer can read. No new locale. |

---

## 25. Conversion and drop-off

| Step | Risk | Hypothesis | Evidence class | Current evidence | Expected effect | Guardrail | Validation |
|---|---|---|---|---|---|---|---|
| Menu has no offer | People may not feel "a deal" before the cart | Adding a hub would lift adds | `HYPOTHESIS` | none | Not claimed. A hub is out of product scope. | Do not add one to chase conversion | Not an experiment |
| Cart total | Uncertainty if only an estimated subtotal remains | Explaining a real saving increases confidence | `HYPOTHESIS` | Current UI fact only | Unknown magnitude | Total integrity | Founder heuristic, internal review |
| Empty coupon field | External search and abandonment | A loud empty field increases exits | `ASSUMPTION` | none | Unknown | Coupon still discoverable on the surface | Do not lock collapse. Review the secondary placement. |
| Valid but not selected | The customer thinks the code failed and leaves | The strictly-better sentence in section 12 reduces that misread versus a generic error. The equal-payable sentences do not call the result better. | `HYPOTHESIS` | none | Unknown | They are not made to pay more, and an equal total is not described as a saving | Internal review of the strictly-better state and both equal-payable states |
| Identity required | Sign-in drop-off | Necessary sign-in loses some guests | `ASSUMPTION` | Product requires identity for those rules | Some loss is accepted | Unrestricted codes still apply for guests | Not waived for conversion |
| Stale total | Surprise price | An unexplained change causes exit or distrust | `HYPOTHESIS` | none | Unknown | They never pay the stale amount | Review the recovery sentence |
| Complimentary surprise | Confusion at an unexpected line | A named included line is understood if it has no choices | `HYPOTHESIS` | none | Unknown | No substitute and no picker | Review that flow |
| Mobile summary | Missed total | Burying the total increases wrong-amount fear | `HYPOTHESIS` | none | Unknown | Total remains in the summary's primary area | Responsive QA later |
| Operator false success | Customers receive the wrong included item, or none, while the operator thinks activation worked | Truthful non-success prevents a bad customer promise | `PRODUCT_DECISION` supported operationally | AC-036J-012-06 | Not a conversion claim | No false activation success | Operator review of the denial states |

```text
INSUFFICIENT_EVIDENCE = all causal conversion claims in this section
```

---

## 26. Experience journey detail

### Menu

- Goal: choose items. Question: is any value available to me here? Entry: `/order`.
- Notice first: the food. Information: item and its price. Action: add. Emotional state: ordinary browsing.
- Friction: hunting a code from the menu is accidental and not supported.
- Product response: no offer destination. Confusion risk: a customer with a code does not see a field yet. The field is on the cart, which is the next step they already take.
- Exit: cart. Measure: not an offer impression on the menu.

### Cart

- Goal: the best eligible amount. Question: am I paying more than I need to?
- Notice first: items and amount. Then the applied offer or the real progress. Coupon is available without a hunt through settings.
- Action: continue, or apply a code. Trust: the saving matches the amount. If the coupon is valid and the payable amount is unchanged versus the alternative, the screen says so and does not invent a saving. If nothing applies, the total is still honest.
- Error: section 13. Exit: Review, with the same coupon state.

### Checkout Review

- Question: is this the best total, and can it still change?
- Notice first: the payable total and fulfilment. Then the saving stack. Inherited coupon result, including an equal-payable sentence when that is the shared state.
- They should understand the total can still be checked again before payment. Copy does not call it frozen.
- Exit: Payment, or stay to change the cart, fulfilment, or coupon.

### Payment

- Question: is this final?
- Answer the experience may give: this is the current amount, coupon edits are not here, and if the check fails the amount is not taken on the old saving.
- Do not design a coupon field.

### Confirmation and history

- Question: what did I actually save?
- Show purchased savings and any purchased included item. Later offer edits do not change the words or the amount.

### Workforce

- Create and draft on the existing surface. The form states the customer meaning before activation: automatic or coupon, what amount or item changes, which fulfilment it applies to, and the limits.
- Eligibility, caps, and benefit class are labeled as their customer effect.
- Complimentary binding asks for one complete item and rejects a configuration that still needs a customer choice. The operator sees that rejection on the item field.
- Activate. A second active complimentary offer is rejected and the first remains. An overlapping attempt that is not authoritative is not a success.
- Validation errors name the field. A revision conflict asks them to reload.
- Retire confirms. Cancel leaves it active. Purchased history is described as unchanged.
- Audit and history the operator already has stay the place to see that something happened. This candidate does not add a campaign dashboard. Descriptive application and redemption visibility follows the Product Definition. It does not present sales as incremental revenue.

---

## 27. Traceability

`XR` identifiers are the testable experience requirements. They are not pull requests. Every mandatory story is represented, including stories whose proof is also technical.

| XR | Experience requirement | Stories |
|---|---|---|
| `XR-IMP-036J-001` | An automatic offer is visible as applied value, with the saving, without asking the customer to activate it, and without engine vocabulary | `US-036J-001` |
| `XR-IMP-036J-002` | Coupon entry, result, change, remove, and failure classes work on Cart and Review as one state; Payment has no coupon mutation | `US-036J-002`, `US-036J-007` |
| `XR-IMP-036J-003` | Threshold progress uses the authoritative gap, appears with the cart total story, and updates when the offer applies or drops | `US-036J-003` |
| `XR-IMP-036J-004` | The customer can read order saving, a real delivery saving, total saved, and payable amount as one model, with no fabricated or duplicate delivery saving | `US-036J-004`, `US-036J-010` |
| `XR-IMP-036J-005` | A valid coupon that does not produce a strictly lower payable amount is not called a better price when the amounts are equal: the strictly lower non-coupon result uses the valid-but-not-selected sentence and keeps that lower total; equal-payable selected says the coupon is applied and the total stays the same, with only actual evaluated effects; equal-payable not selected says the coupon is valid and does not change the total, and keeps the retained combination | `US-036J-009` |
| `XR-IMP-036J-006` | The complimentary item is a distinct no-choice line at no extra merchandise charge, including when a real delivery saving is also present; competing complimentary items are not offered as a choice | `US-036J-013`, `US-036J-010` |
| `XR-IMP-036J-007` | Payment stays commercially read-only, and a changed revalidation is recovered on Review with a clear new total | `US-036J-008`, `US-036J-002` |
| `XR-IMP-036J-008` | Confirmation and history explain purchased savings and a purchased complimentary item after later offer changes | `US-036J-011`, `US-036J-013` |
| `XR-IMP-036J-009` | Operators complete V1 authoring on the existing commercial surface, including complimentary rules and truthful non-success | `US-036J-012` |
| `XR-IMP-036J-010` | Mobile hierarchy and keyboard, focus, and non-colour status behaviour in section 14 | All customer stories |
| `XR-IMP-036J-011` | Failure copy stays inside the privacy boundaries in section 16 | `US-036J-002`, `US-036J-005`, `US-036J-007` |
| `XR-IMP-036J-012` | First-order and fulfilment eligibility change what is shown, without a lecture that leaks history, and pickup does not show a delivery saving | `US-036J-005`, `US-036J-006` |
| `XR-IMP-036J-013` | The complimentary equal-payable selection still shows the exact included item, the included semantic, ₹0 merchandise, no customer choice, and a separate real delivery saving when one exists, without calling a coupon or another offer monetarily better because of that tie | `US-036J-013` |

### Acceptance scenarios

| AC | Experience coverage |
|---|---|
| `AC-036J-001-01` | Automatic applied row in sections 12, 13, 26. `XR-IMP-036J-001` |
| `AC-036J-001-02` | No applicable offer. Do not promise an out-of-window offer. |
| `AC-036J-002-01` | Coupon selected |
| `AC-036J-002-02` | Invalid |
| `AC-036J-002-03` | Removed |
| `AC-036J-002-04` | Identity required and sign-in retry |
| `AC-036J-002-05` | Guest unrestricted coupon is not an identity failure. First-order and personal cap still require sign-in. A strictly better non-coupon result uses the valid-but-not-selected sentence. An equal payable amount uses the equal-payable sentences in section 12, not that sentence. |
| `AC-036J-002-06` | Review shows the cart's coupon as the same state |
| `AC-036J-002-07` | First entry on Review |
| `AC-036J-002-08` | Change or remove on Review recomputes and is explained |
| `AC-036J-002-09` | Payment read-only |
| `AC-036J-002-10` | Server failure keeps the previous state and does not fake success |
| `AC-036J-003-01` | Threshold copy and authoritative gap |
| `AC-036J-003-02` | Reached and lost |
| `AC-036J-004-01` | Savings model. `XR-IMP-036J-004` |
| `AC-036J-005-01` | Eligible first order can see the automatic offer when it applies. No extra "new customer" badge is required. |
| `AC-036J-005-02` | Returning customer does not see that offer. A related coupon is inapplicable, not a history recital. |
| `AC-036J-006-01` | Mode mismatch is absence, or inapplicable after a code, and pickup has no delivery saving |
| `AC-036J-006-02` | Scheduled timing is consumed. The experience does not rename or explain a new scheduled product. Changing timing recomputes before payment. |
| `AC-036J-007-01` | Distinct sentences |
| `AC-036J-008-01` | Stale recovery |
| `AC-036J-009-01` | Strictly better non-coupon result uses the valid-but-not-selected sentence, including the example where the automatic pair pays less. Equal payable amounts do not use that sentence. |
| `AC-036J-009-02` | Coupon wins and the saving is explained, including when delivery pairing is why it wins |
| `AC-036J-009-03` | Winning merchandise coupon still shows a real delivery saving with it |
| `AC-036J-009-04` | A delivery coupon is only the delivery part of the story and does not open a second order saving |
| `AC-036J-010-01` | Both real effects visible |
| `AC-036J-010-02` | One merchandise story, even when a delivery saving also applies. The customer does not see a second item discount. |
| `AC-036J-010-03` | The customer sees the selected result, not the discarded candidates |
| `AC-036J-010-04` | Standing ₹0 delivery has no duplicate saving line |
| `AC-036J-011-01` | Purchased savings remain after the live offer changes |
| `AC-036J-012-01` | Operator can understand and activate on the existing surface, and can see that applications or redemptions happened at the level the product requires |
| `AC-036J-012-02` | Field errors and out-of-scope denial |
| `AC-036J-012-03` | Retire confirmation, cancel, and the purchased-history sentence |
| `AC-036J-012-04` | Complimentary authoring experience: one complete item, rejection when a choice remains |
| `AC-036J-012-05` | Second activation refusal |
| `AC-036J-012-06` | Concurrent non-success. The experience does not pick the winner. |
| `AC-036J-013-01` | Complimentary line on Cart and Review, including when FD-036J-03 selects it because the payable amount equals the no-primary combination. That tie is not described as a better price. |
| `AC-036J-013-02` | Purchased line remains |
| `AC-036J-013-03` | Unavailable recovery, no substitute, stay on Review |
| `AC-036J-013-04` | Neither competing item is presented |

```text
STORIES_MAPPED = US-036J-001 .. US-036J-013
MANDATORY_ACS_MAPPED = AC-036J-001-01 .. AC-036J-013-04
UNCOVERED_PRODUCT_ACS = NONE
EXPERIENCE_GAPS = NONE that block this candidate
PRODUCT_AMBIGUITIES = NONE requiring a new Founder decision
```

Count check: stories 13. Acceptance scenarios in the Product Definition section 10 are 001 (2), 002 (10), 003 (2), 004 (1), 005 (2), 006 (2), 007 (1), 008 (1), 009 (4), 010 (4), 011 (1), 012 (6), 013 (4). That is 40, and each appears in the table above.

Golden journeys `GJ-FIRST-ORDER` and `GJ-RETURNING-ORDER` gain this explanation on the existing purchase path. This candidate does not redefine their non-offer steps. A returning customer not receiving a first-order offer is `XR-IMP-036J-012`.

---

## 28. Product decision test

```text
PRODUCT_DECISION_REQUIRED = NO
```

Discovery did not find an experience choice that needs new product behaviour or a reopening of FD-036J-01, FD-036J-02, or FD-036J-03. Coupon prominence, wording, threshold placement on Review, and the shape of explanation are experience decisions or hypotheses inside the approved rules.

---

## 29. Candidate readiness

This is not the Experience Gate verdict.

| Topic | Candidate assessment |
|---|---|
| Experience Intent | Defined |
| Primary user goal | Defined |
| Discoverability / entry | Defined |
| Full journey | Defined |
| Information architecture | Defined |
| Information hierarchy | Defined |
| Interaction model | Defined |
| Product language | Defined |
| State and recovery | Defined |
| Trust-sensitive moments | Defined |
| Friction audit | Defined |
| Conversion / drop-off | Defined as hypotheses |
| Responsive / mobile | Defined |
| Accessibility | Defined |
| Service / operational alignment | Defined |
| Evidence / assumptions | Classified |
| Measurement intent | Defined. One primary metric, secondary metrics, guardrails, baseline, a half-open 28-calendar-day cohort window in `Asia/Kolkata`, interpretation rule, `CHECKOUT_JOURNEY_KEY` so one logical checkout is one denominator and one completion, one global cohort-entry Review per key whose occurrence time alone assigns zero or one window, `AUTHORITATIVE_JOURNEY_SEQUENCE` so equal timestamps still have one order, and a named `REPORT_AS_OF` so an unfinished journey stays in that snapshot's denominator until a later labelled snapshot. |
| Equal-payable coupon experience | Defined for both Fit outcomes. Complimentary equal-payable rule preserved. |
| Analytics contract requirements | Defined |
| Experiment / validation | Defined, with insufficient-evidence limits |
| Prototype needs | Low-fidelity flows in section 18 |
| Product AC traceability | Complete |
| Unapproved product behaviour | None added |

```text
MEASUREMENT_INTENT_DEFINED = YES
CHECKOUT_JOURNEY_CORRELATION_DEFINED = YES
AUTHORITATIVE_JOURNEY_SEQUENCE_DEFINED = YES
MEASUREMENT_CALENDAR_LOCKED = YES
REPORT_AS_OF_DEFINED = YES
UNFINISHED_AT_CUTOFF_DEFINED = YES
SEGMENT_ATTRIBUTION_REPRODUCIBLE = YES
SNAPSHOT_IMMUTABILITY_DEFINED = YES
ARCHITECTURE_MECHANISM_CHOSEN = YES
PRODUCT_BEHAVIOUR_CHANGED = NO
OPEN_EXPERIENCE_DECISIONS = NONE
EXPERIENCE_GATE_EXECUTION = PERFORMED
EXPERIENCE_GATE = PASS
EXPERIENCE_GATE_RESULT = PASS
INDEPENDENT_EXPERIENCE_GATE_REVIEW_ID = 5342581233
EXPERIENCE_GATE_EVALUATED_HEAD = 1fbabd2fb80851912815efe4e0ebe331a1318557
ARCHITECTURE_FIT = PASS
DESIGN_READINESS = PASS
```

Independent Experience Gate PASS is persisted. Architecture Fit current source is `IMP-036J-FIT-CANDIDATE-9`. Architecture Fit is PASS and architecture is LOCKED. Prior lock history: independent review `5347761109` passed `IMP-036J-FIT-CANDIDATE-5`. `ARCHITECTURE_MECHANISM_CHOSEN = YES`
records that choice by locked Architecture Fit, not by this Experience Definition. Implementation Authorization APPROVED on 2026-10-01 is immutable authorization provenance. Current execution/lifecycle is owned by STATE.md.
Experience semantics and Experience Gate provenance are unchanged.
