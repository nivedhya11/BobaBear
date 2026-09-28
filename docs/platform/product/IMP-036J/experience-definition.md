<!-- governance-meta
{
  "status": "CANDIDATE",
  "authority": "EXPERIENCE_DEFINITION_CANDIDATE",
  "capability": "IMP-036J",
  "experienceDefinitionVersion": "XD-IMP-036J-DRAFT-1",
  "productDefinition": "PD-IMP-036J-DRAFT-6",
  "productDefinitionGate": "PASS",
  "experienceCriticality": "X3",
  "changeRisk": "CR2",
  "experienceGate": "NOT_PERFORMED",
  "architectureFit": "NOT_PERFORMED",
  "architectureLocked": "NO",
  "designReadiness": "NOT_PERFORMED",
  "implementationAuthorized": false
}
-->

# IMP-036J — Experience Definition candidate

```text
EXPERIENCE_DEFINITION_VERSION = XD-IMP-036J-DRAFT-1
AUTHORITY = EXPERIENCE_DEFINITION_CANDIDATE
CAPABILITY = IMP-036J
PRODUCT_DEFINITION = PD-IMP-036J-DRAFT-6
PRODUCT_DEFINITION_STATUS = APPROVED
PRODUCT_DEFINITION_GATE = PASS
EXPERIENCE_CRITICALITY = X3
CHANGE_RISK = CR2
EXPERIENCE_GATE = NOT_PERFORMED
ARCHITECTURE_FIT = NOT_PERFORMED
ARCHITECTURE_LOCKED = NO
DESIGN_READINESS = NOT_PERFORMED
IMPLEMENTATION_AUTHORIZED = NO
PRODUCT_DECISION_REQUIRED = NO
CANDIDATE_RESULT = READY_FOR_INDEPENDENT_EXPERIENCE_GATE

HISTORICAL_ACCEPTED_IMPS_REWRITTEN = NO
X_SCALE_ORTHOGONAL_TO_CR_SCALE = YES
X_SCALE_ORTHOGONAL_TO_AGENTS_R0_R3 = YES
RAW_BACKEND_LANGUAGE_TO_CUSTOMER = PROHIBITED
FOUNDER_UAT_REQUIRED = YES
FOUNDER_EXPERIENCE_UAT = NOT_PERFORMED
```

This document is an Experience Definition **candidate** for independent Experience Gate review.
It does not persist Experience Gate PASS, does not approve final copy, does not perform
Architecture Fit, does not lock architecture, does not authorize implementation, and does not
change [`product-definition.md`](./product-definition.md). Lifecycle truth remains
[`ROADMAP.md`](../../ROADMAP.md) and [`STATE.md`](../../STATE.md). `IMP036J_EXPERIENCE_DEFINITION`
stays `REQUIRED / NOT_PERFORMED` until an Experience Gate is actually performed.

EXP-1 does not yet record a prior IMP Experience Definition version pattern. This candidate uses
`XD-IMP-036J-DRAFT-1`, parallel to `PD-IMP-036J-DRAFT-N`, and remains a draft candidate.

Supporting material under [`../../experience/`](../../experience/README.md) is source only
(`Authority: NONE`). It is not used here as higher authority than EXP-1 or LANG-1.

---

## 1. Identity / version / status

| Field | Definition |
|---|---|
| Capability | IMP-036J — Promotions, Coupons & Offers |
| Experience Definition version / status | `XD-IMP-036J-DRAFT-1`; **EXPERIENCE_DEFINITION_CANDIDATE**; not approved; Experience Gate `NOT_PERFORMED` |
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
| Complimentary V1 is one complete no-choice item, one active Offer, no substitute. When a valid complimentary combination has the same payable amount as the otherwise equivalent result with no primary merchandise or order Offer, the complimentary combination is selected. | `PRODUCT_DECISION` | FD-036J-03 | A picker, a silent substitute, or treating that tie as "the coupon was better" would change product behaviour | Specify the line experience. Do not add choice. Other equal-payable ties that do not change delivered merchandise stay with Architecture Fit. |
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

Same shared state on Cart and on Review. The customer types a code they already have, applies it, and gets one honest result: it improved the total, it was valid and did not beat the value already in the total, or a specific failure. They can replace or remove it on either surface before payment. Sign-in, when identity is required, keeps that same attempt and returns to the result.

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
3. Progressive: coupon entry, then failure or "did not improve" detail after an attempt.
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

The customer is never asked to pick a winner between an automatic offer and a coupon. The platform keeps the better payable result and explains it.

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

### Content / product language matrix

| Situation | Internal meaning | Customer intent | Candidate customer wording | Tone | Recovery / action | Leakage risk |
|---|---|---|---|---|---|---|
| Automatic offer applied | A qualifying automatic benefit changed the evaluated amount | See that value was included and how much | "Offer applied." The saving stack shows the real rupee effect. A short plain reason is added only when the evaluation can support it, such as the threshold that was met. | Clear, lightly branded on Cart; precise on Review | None. Continue. | Do not name other customers or unpublished offers. |
| Coupon applied and selected | The entered code is part of the selected combination | Know the code worked and the saving | "Coupon applied." The same saving stack shows what changed. | Precise | Remove or change | Do not echo rules that identify who else could use it. |
| Coupon valid but not selected | The code can qualify, and the best combination that does not depend on it has the better payable amount | Trust that the code is not broken | "This coupon is valid. It doesn't improve your total, so we kept the better amount." | Calm, precise | Remove the code or continue | Do not show the lost combination's internal names or another customer's prices. Do not show a raw reason code. Do not use this sentence when the amounts are equal. An equal payable amount is not "already better." The complimentary equal-payable rule selects the complimentary combination against the result with no primary offer. Any other equal-payable tie that does not change delivered merchandise is not decided here. |
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
| Complimentary item | The selected offer adds one exact item at no merchandise charge | Know what it is and why it is here | Item name, "Included with your offer", merchandise amount ₹0. | Precise, not a surprise gift theatre | No customize, no replace-with-another-item | Do not imply they may choose a different item. |
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

Testable content requirements: `XR-IMP-036J-001` through `XR-IMP-036J-012` in section 23. Final strings are Content QA at implementation time, not this candidate's approval of pixels.

---

## 13. UX state matrix

| State | Surface | User question | What they see | Primary action | Recovery | Content rule | Measurement intent | Accessibility |
|---|---|---|---|---|---|---|---|---|
| No applicable offer | Cart, Review | Is value missing by mistake? | Items and total. No promised saving. | Continue | None | Absence is valid. Do not apologize for a missing offer. | Exposure of cart with no offer, without treating it as an error | Totals remain text |
| Automatic applied | Cart, Review | What did I get? | Offer applied, rupee saving, short reason when knowable, matching payable effect | Continue | If the cart later disqualifies it, the saving leaves and the total updates | Saving equals the evaluated effect | Understanding that value applied | Status in text, not colour alone |
| Automatic removed after cart mutation | Cart, Review | Why did the total go up? | Updated total and a plain line that the offer no longer applies | Continue or add items if progress remains | Show progress again only if a real gap returns | No stale saving | See the removal | Announce the total change |
| Coupon untouched | Cart, Review | Can I use a code? | Named field, apply | Continue, or apply | Empty is fine | Field has an accessible name | Coupon field seen | Keyboard focusable |
| Coupon applying | Cart, Review | Did it send? | Previous amounts stay put. Text says the coupon is being checked. | Wait | Retry if it fails | No optimistic new total | Submit started and finished | Apply does not look like a second code was created. Busy state is text. |
| Coupon selected | Cart, Review, then read-only on Payment | Did it help? | Coupon applied and the saving | Continue. Remove or change before payment. | Remove restores the result without that code | One shared state | Selected outcome | Remove and change are keyboard operable |
| Valid, not selected | Cart, Review | Is the code broken? | The better total remains. Copy says the coupon is valid and did not improve the total. | Continue or remove | Removing it keeps the better result | Never the internal not-selected code | This outcome is understood | Status in text |
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
| Complimentary applied | Cart, Review | What is this extra line? | Exact item, included, ₹0 merchandise | Continue. No edit of options. | None while it remains eligible | No catalogue | Complimentary impression | Line is text |
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

Business intent is the Product Definition's outcome list: direct conversion, acquisition offers that reach eligible first orders, threshold behaviour, usable coupons, explainable savings, and margin held inside the approved limits. No numeric target is locked. No baseline series is available in current authority. Observation, once the capability exists, is not acceptance.

Primary learning question: when a saving is shown, can the customer tell what changed and complete payment on that amount?

No baseline is available. No numeric observation window is locked. Before production, comprehension is reviewed in Founder Experience UAT and internal usability review of the low-fidelity flows. After release, a production window is not interpreted as a conversion winner while volume remains too small. That limit is `INSUFFICIENT_EVIDENCE`. Acceptance stays separate from whatever that window later shows.

Candidate primary signals, not targets:

- Checkout Review to Payment continuation
- Payment completion on a revalidated amount
- Share of shown savings where the explained parts equal the evaluated saving

Candidate secondary signals:

- Coupon submit, and the coarse outcome class
- Share of valid-but-not-selected outcomes that continue rather than immediately abandon
- Cart to Review continuation when an automatic saving is present, when progress is present, and when neither is present
- Threshold: progress shown, then either unlock or abandon. This is descriptive.
- Complimentary line shown, then purchase, or unavailable recovery and continuation
- Recovery after a changed revalidation: continuation on the new total versus exit

Guardrails, as categories only:

- conversion to a completed direct order
- margin inside the approved combination rules, not a new margin policy
- refund and cancellation
- support contacts that mention coupons, totals, or included items
- error rate on coupon submit and on activation
- payment completion
- delivery and pickup completion
- a confusion proxy such as remove-immediately after "valid but did not improve", or repeated invalid submits

```text
CAUSAL_CONVERSION_CLAIM = NOT_MADE
CURRENT_EVIDENCE_FOR_LIFT = INSUFFICIENT_EVIDENCE
```

Success learning: people reach payment with a breakdown that matches the evaluation, and failure copy is followed by a corrected attempt or a calm continuation. Failure learning: repeated invalid submits, abandonment at the valid-but-not-selected sentence, or support contacts that quote engine words. Those are signals for a later discovery, not permission to change approved rules silently.

### Analytics data-contract requirements

Do not implement collection. Do not add attributes because they might be useful.

| Event meaning | Trigger | Owner | Required attributes | Forbidden | Identity | Dedup | Schema | Source of truth | Validation | Retention |
|---|---|---|---|---|---|---|---|---|---|---|
| Offer result viewed | Cart or Review shows an authoritative result | Later measurement owner under the X3 plan | Surface, whether a saving is present, whether progress is present, coarse shape (none, order saving, delivery saving, both, complimentary line) | Raw code, item-level free text that is not already on the order, another customer's id | Existing customer or guest commerce identity. No new identity. | One view per presented evaluation result, not per repaint | Versioned when implemented | The evaluation result the screen rendered | The recorded shape matches the rendered rows | Follow existing commerce analytics retention. Do not extend it here. |
| Coupon attempt finished | Apply, replace, or remove completes or fails | Same | Surface, coarse outcome class, whether the total changed | Raw coupon text, cap sizes, other customer ids | Same | One outcome per completed attempt | Versioned when implemented | Server result of that attempt | Class matches the sentence family shown | Same |
| Step progression | Continue from Cart, continue from Review, pay attempt, pay completion, confirmation view | Same | Step names that match the journey, not internal workflow states | Payment instrument details | Same | One progression per user action | Versioned when implemented | The navigation or payment result the customer hit | Do not count a stale pay attempt as completion | Same |
| Recovery shown | Revalidation changes the amount, or a complimentary line is removed | Same | Recovery kind, whether they later continue | The discarded benefit's internal id in customer analytics, unless a later plan explicitly needs an operator-safe id outside customer analytics | Same | One recovery per changed result | Versioned when implemented | Revalidation result | The event exists only when the customer-facing recovery exists | Same |

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

Untouched field. Checking, with the old total held. Applied. Valid and kept the previous total, with the sentence in section 12. Each failure sentence. Remove. Change.

### Review

Same stack, plus fulfilment. Inherited coupon is already filled as a result, not a blank second field. First entry can happen here. Total sits with continue to payment.

### Valid but not selected

The previous saving remains the one in the stack. The coupon area says the code is valid and it does not improve the total. The pay amount does not increase. This flow is the strictly better non-coupon result. It is not the complimentary equal-payable case, which shows the included item instead.

### Complimentary

An item row named as the operator's item, "Included with your offer", ₹0. No options. If delivery saving is real, it is a separate row.

### Threshold

"Add ₹X more to unlock …" where the saving stack will be. It disappears when the offer applied line replaces it. It returns, with a drop-off sentence, if the cart falls below.

### Stale recovery

Payment does not show a coupon box. If the result changes, the customer is on Review, the old pay action is gone, and the updated stack is what they read.

### Mobile

The same stack in one column. Total and the next action are in the first screenful of the summary, not only after a long story.

Validation method before treating any hypothesis as learned: `FOUNDER_HEURISTIC_REVIEW` during Founder Experience UAT, and `INTERNAL_USABILITY_REVIEW` of these flows. Not customer research unless it is later actually run.

Controlled experiments are not recommended for security, privacy, financial truth, authorization, or minimum accessibility. A later prominence experiment is optional and only inside the hierarchy already decided: the field stays on Cart and Review, the total stays primary, and money text stays truthful. Until traffic exists, the result of any such idea is `INSUFFICIENT_EVIDENCE`. An experiment plan, when later authorized, still needs hypothesis, assignment unit, population, control, variant, primary metric, guardrails, observation window, decision rule, and stop conditions. None of those are set to a winner here.

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
Research / evidence level disclosed: YES
Unresolved experience decisions: NONE
Result: NOT_PERFORMED
```

`Unresolved experience decisions: NONE` means this candidate does not leave a presentation choice that changes product behaviour. Hypotheses in section 4 stay hypotheses. They are not open product decisions and they are not a Gate verdict.

```text
EXPERIENCE_GATE_EXECUTION = NOT_PERFORMED
EXPERIENCE_GATE = NOT_PERFORMED
CANDIDATE_READY_FOR_INDEPENDENT_REVIEW = YES
```

---

## 20. Architecture Fit reconciliation

Experience requirements that Architecture Fit must later prove. These are not schemas, keys, locks, topology, or API ownership.

- A threshold sentence can be driven by an authoritative gap. Independent eligibility maths on the client is prohibited.
- One commercial result can explain order saving, delivery saving, total saved, and payable amount without a second calculator.
- Cart and Checkout Review read and write one coupon state.
- Payment can render that result without a mutation control.
- Purchased confirmation and history can show the saved amount and complimentary line from purchased truth after the live offer changes.
- Complimentary presentation can include the item identity, the no-extra-merchandise-charge fact, and the included reason.
- Customer-visible failures can be the coarse classes in section 12.
- Pre-payment change can return the customer to Review with an explanation of the new result.
- Operator activation can return truthful non-success when a complimentary activation is not authoritative.

```text
SOURCE_VALUE = authoritative commercial evaluation or purchased truth
FRONTEND_INDEPENDENT_ELIGIBILITY_CALCULATION = PROHIBITED
```

Fit is `NOT_PERFORMED`. This candidate does not use the unmerged architecture candidate as a constraint. Pull request #323 is untouched.

An experience requirement that Fit cannot support safely remains a Fit STOP under the Product Definition. This document does not downgrade the complimentary item, the breakdown, or the shared coupon state to avoid that question.

---

## 21. Design Readiness

```text
DESIGN_READINESS = NOT_PERFORMED
```

Not started. It waits on viable Architecture Fit, which itself waits on Experience Gate PASS. When it is time, Design Readiness owes: final flows; every state in section 13; desktop and mobile; final microcopy; keyboard and focus behaviour; accessibility semantics; interaction rules for apply, remove, change, sign-in return, and recovery; perceived-performance layout; reuse of the components in section 15; and analytics hooks that match section 17. Pixel dimensions and a new visual language are not decided here.

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
FOUNDER_EXPERIENCE_UAT = NOT_PERFORMED
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
| Valid but not selected | The customer thinks the code failed and leaves | The sentence in section 12 reduces that misread versus a generic error | `HYPOTHESIS` | none | Unknown | They are not made to pay more | Internal review of that state |
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
- Action: continue, or apply a code. Trust: the saving matches the amount. If nothing applies, the total is still honest.
- Error: section 13. Exit: Review, with the same coupon state.

### Checkout Review

- Question: is this the best total, and can it still change?
- Notice first: the payable total and fulfilment. Then the saving stack. Inherited coupon result.
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
| `XR-IMP-036J-005` | A valid coupon that does not win is explained as valid and not an improvement, and the better total remains | `US-036J-009` |
| `XR-IMP-036J-006` | The complimentary item is a distinct no-choice line at no extra merchandise charge, including when a real delivery saving is also present; competing complimentary items are not offered as a choice | `US-036J-013`, `US-036J-010` |
| `XR-IMP-036J-007` | Payment stays commercially read-only, and a changed revalidation is recovered on Review with a clear new total | `US-036J-008`, `US-036J-002` |
| `XR-IMP-036J-008` | Confirmation and history explain purchased savings and a purchased complimentary item after later offer changes | `US-036J-011`, `US-036J-013` |
| `XR-IMP-036J-009` | Operators complete V1 authoring on the existing commercial surface, including complimentary rules and truthful non-success | `US-036J-012` |
| `XR-IMP-036J-010` | Mobile hierarchy and keyboard, focus, and non-colour status behaviour in section 14 | All customer stories |
| `XR-IMP-036J-011` | Failure copy stays inside the privacy boundaries in section 16 | `US-036J-002`, `US-036J-005`, `US-036J-007` |
| `XR-IMP-036J-012` | First-order and fulfilment eligibility change what is shown, without a lecture that leaks history, and pickup does not show a delivery saving | `US-036J-005`, `US-036J-006` |

### Acceptance scenarios

| AC | Experience coverage |
|---|---|
| `AC-036J-001-01` | Automatic applied row in sections 12, 13, 26. `XR-IMP-036J-001` |
| `AC-036J-001-02` | No applicable offer. Do not promise an out-of-window offer. |
| `AC-036J-002-01` | Coupon selected |
| `AC-036J-002-02` | Invalid |
| `AC-036J-002-03` | Removed |
| `AC-036J-002-04` | Identity required and sign-in retry |
| `AC-036J-002-05` | Guest unrestricted coupon is not an identity failure. First-order and personal cap still require sign-in. Better non-coupon result uses the valid-but-not-selected sentence. |
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
| `AC-036J-009-01` | Valid not selected, including the example where the automatic pair is better |
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
| `AC-036J-013-01` | Complimentary line on Cart and Review |
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
| Measurement intent | Defined |
| Analytics contract requirements | Defined |
| Experiment / validation | Defined, with insufficient-evidence limits |
| Prototype needs | Low-fidelity flows in section 18 |
| Product AC traceability | Complete |
| Unapproved product behaviour | None added |

```text
CANDIDATE_RESULT = READY_FOR_INDEPENDENT_EXPERIENCE_GATE
```

Independent ChatGPT Experience Gate review is the next gate. This document stops there.
