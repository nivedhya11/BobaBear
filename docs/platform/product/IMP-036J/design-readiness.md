<!-- governance-meta
{
  "status": "CANDIDATE",
  "authority": "NONE",
  "capability": "IMP-036J",
  "candidateId": "IMP-036J-DESIGN-CANDIDATE-2",
  "productDefinition": "PD-IMP-036J-DRAFT-6",
  "experienceDefinition": "XD-IMP-036J-DRAFT-6",
  "architecture": "ARCH-R23",
  "architectureSource": "IMP-036J-FIT-CANDIDATE-9",
  "designReadiness": "NOT_PERFORMED",
  "implementationAuthorized": false
}
-->

# IMP-036J — Design Readiness candidate

```text
CANDIDATE_ID = IMP-036J-DESIGN-CANDIDATE-2
STATUS = CANDIDATE
AUTHORITY = NONE
CAPABILITY = IMP-036J
DESIGN_READINESS = NOT_PERFORMED
QUALITY_TEST_PLAN_FINALIZED = NO
MEASUREMENT_INSTRUMENTATION_PLAN_FINALIZED = NO
IMPLEMENTATION_PLAN = NOT_PERFORMED
IMPLEMENTATION_AUTHORIZED = NO
IMPLEMENTATION_STARTED = NO
CANDIDATE_READY_FOR_INDEPENDENT_REVIEW = YES
ARCHITECTURE_SOURCE = IMP-036J-FIT-CANDIDATE-9
ARCHITECTURE_FIT = PASS
ARCHITECTURE_LOCKED = YES
ARCH_R23 = UNCHANGED
DR_23 = UNCHANGED
D-383 = NO
ARCH-R24 = NO
NEW_ADR = NO
```

This document is an implementation-ready interaction and presentation candidate. It is not Design
Readiness PASS. It does not authorize implementation, does not change `PD-IMP-036J-DRAFT-6`,
`XD-IMP-036J-DRAFT-6`, the locked capability architecture, ROADMAP, STATE, the decision register,
D-383, or ARCH-R24.

Independent review still answers whether this candidate is complete enough to build.

## 0. Candidate history

`IMP-036J-DESIGN-CANDIDATE-1` is historical. It was prepared before Candidate 9 Architecture
remediation and is not the reviewable design. Candidate 1 never passed Design Readiness. Its
result remains `STOP / SUPERSEDED`. This document does not rewrite that result as a pass.

Historical finding `4134472848` remains in the pull-request record. Candidate 1 labeled the normal
Cart amount as final Total payable before fulfilment and Offer context existed. Candidate 2 keeps
the current non-final Cart treatment unless a current Checkout evaluation already supplies that
context, and it still does not call the Cart figure the final payable amount.

```text
CANDIDATE_1 = HISTORICAL_SUPERSEDED
CANDIDATE_1_DESIGN_READINESS = NOT_PASSED
HISTORICAL_FINDING_4134472848 = PRESERVED
BINDING_ARCHITECTURE = IMP-036J-FIT-CANDIDATE-9
FIRST_DESIGN_CANDIDATE_RECONCILED_TO_CANDIDATE_9 = IMP-036J-DESIGN-CANDIDATE-2
```

Analytics hooks in this candidate name facts in `IMP-036J-MEASUREMENT-CANDIDATE-2`. They do not
implement collection and they do not make the browser a money authority.

## 0. What this candidate may finalize

It reconciles approved product behaviour, approved experience, locked architecture, EXP-1, LANG-1,
and the current source. It may choose reversible presentation details inside those semantics.

It does not invent Offer eligibility, Promotion money, Coupon entitlement, stacking, caps,
complimentary-item rules, fulfilment meaning, purchased truth, permissions, persistence, or
concurrency. The client does not calculate eligibility, remaining thresholds, or savings. Money on
screen is `formatPaise` of a server-supplied paise string, or an explicit non-amount waiting
state.

Customer vocabulary is Offer, coupon, saving, delivery, and total payable. Operator vocabulary may
say Promotion and Coupon, plus a sentence. Raw backend tokens are not customer copy and are not
the only operator explanation.

## 1. Source inspection

Re-inspected on this branch after the non-destructive merge of canonical main
`64ab23c89b54b016b198f8e3a8de8a669e52378d`. Names below are repository names. The Cart amount on
that source is still "Estimated subtotal" in `CartSummary`, `cart-presentation`, the desktop aside,
and `cart-mobile-checkout`. Checkout Review still labels the summary "Total payable".

| Surface | Path | What exists today |
|---|---|---|
| Menu | `src/components/ordering/OrderingCatalogClient.tsx`, route `/order` | Catalog. `StickyCartBar` links to cart and checkout. No offer destination. |
| Cart | `src/components/ordering/CartClient.tsx`, route `/order/cart` | Items via `CartLineList`. Desktop aside `cart-order-summary` from `lg`. Mobile bar `cart-mobile-checkout` is `lg:hidden`. Amount cue is "Estimated subtotal" through `CartSummary` and `cart-presentation`. No coupon control. |
| Checkout | `src/components/ordering/CheckoutClient.tsx`, route `/order/checkout` | Single column `max-w-[640px]`. Fulfilment, Review (`checkout-review`), Payment. Money is `OrderMoneySummaryPanel`. |
| Money rows | `src/components/ordering/OrderMoneySummaryPanel.tsx`, `src/components/ordering/checkout-snapshot-presentation.ts` (`snapshotPayableRows`) | Subtotal, one "Discount" when `promotionDiscountPaise` is positive, charge names, tax, "Total payable". `formatPaise` in `src/components/ordering/format-money.ts`. |
| Payment step | `src/components/ordering/PaymentPanel.tsx` | Pay, retry, recovery. `aria-live` on status. `min-h-[44px]` actions. No coupon control. |
| Payment return | `src/components/ordering/PaymentReturnClient.tsx`, route `/order/payment` | Status return into confirmation. Not a coupon surface. |
| Confirmation | `src/components/ordering/OrderConfirmationClient.tsx`, route `/order/confirmation` | Purchased order via `getCustomerOrder`. Reuses `OrderMoneySummaryPanel`. |
| History | `src/components/ordering/OrderHistoryClient.tsx`, route `/order/orders`; detail `OrderDetailClient.tsx` | List total. Detail uses the same summary panel and line text. |
| Workforce | `src/components/administration/commercial/PromotionsEditor.tsx`, route `/workforce/admin/commercial` | Draft, trigger, benefit, coupon create, activate, retire. Review uses `ConsequenceReviewDialog`. Status uses `StatusBadge`. Fields use `enterpriseFieldClass`. |
| Controls | `src/components/ui/Button.tsx` | Variants `primary`, `secondary`, `outline`, `ghost`, `destructive`, `link`. Sizes `sm` `h-8`, `md` `h-10`, `lg` `h-12`. Focus class `focus-ring`. |
| Operator dialog | `src/components/administration/commercial/ConsequenceReviewDialog.tsx` | `role="dialog"`, `aria-modal`, focus trap, Escape, restore focus. Initial focus prefers `data-dialog-primary`. |
| Destructive cousin | `src/components/administration/AdminConfirmDialog.tsx` | Same trap. Initial focus prefers `data-dialog-cancel`. |
| Operator feedback | `src/components/enterprise/LoadingState.tsx`, `ErrorState.tsx`, `Alert.tsx`, `EmptyState.tsx`, `StatusBadge.tsx` | Text status. Spinner uses `motion-reduce:animate-none`. |
| Errors | `src/components/ordering/error-copy.ts` | Existing customer error sentences. Promotion classes must not be pasted through as raw codes. |
| Customization | `src/components/ordering/MenuItemCustomizationDialog.tsx` | Customer choices. Not used for a complimentary line. |

Breakpoints already used, Tailwind defaults, not new values:

| Token | Use found in these surfaces |
|---|---|
| default | Single column, `px-5` |
| `sm` | Cart header wraps; fulfilment choices sit in a row; line padding |
| `md` | Page vertical padding |
| `lg` | Cart becomes two columns. Mobile checkout bar hides. Desktop summary is `lg:sticky lg:top-20` |
| `xl` | Menu `StickyCartBar` hides. The cart bar uses `lg`, not `xl` |

Touch height already used: `min-h-[44px]` on checkout and payment actions; cart sticky Checkout uses `min-h-[48px]`; desktop cart Checkout uses `min-h-[52px]`.

## 2. Surfaces

No new customer route. No Offers destination. No marketing browse hub. No coupon mutation on Payment or on `/order/payment`.

| Surface | Role | Files to extend later |
|---|---|---|
| Cart `/order/cart` | Items, then the saving stack only from a server result that does not invent delivery, then the non-final amount, threshold, and coupon | `CartClient`, `CartLineList` read-only extra row, money rows |
| Checkout Review inside `/order/checkout` | Same shared coupon state and the same stack, plus fulfilment | `CheckoutClient`, `OrderMoneySummaryPanel` |
| Payment step | Read-only summary. Pay only the current amount | `PaymentPanel` |
| Confirmation `/order/confirmation` | Purchased truth | `OrderConfirmationClient` |
| Order detail | Purchased truth | `OrderDetailClient` |
| Order history list | Existing grand total only. Breakdown stays on detail | `OrderHistoryClient` |
| Menu `/order` | No offer treatment | none for this capability |
| Workforce `/workforce/admin/commercial` | Author, activate, retire | `PromotionsEditor`, `ConsequenceReviewDialog` labels |

Shared coupon authority stays `carts.manual_coupon_code`. Cart and Review both call the existing coupon routes, then evaluation. The sealed snapshot code is purchased truth, not a second editor.

## 3. Information hierarchy

### Money truth

There is one money authority: the server commercial evaluation. The browser formats `formatPaise` of a server-supplied paise value, or it shows an explicit non-amount waiting state. It does not calculate eligibility, a delivery charge, or a saving.

The normal Cart exists before fulfilment and before Offers that depend on that context. That amount is not the final customer payable.

```text
PRECHECKOUT_CART_FINAL_PAYABLE = NO
NORMAL_CART_LABEL = Estimated subtotal
DELIVERY_AMOUNT_INVENTED_ON_CART = NO
TOTAL_PAYABLE_ON_INCOMPLETE_CART = PROHIBITED
CHECKOUT_REVIEW = AUTHORITATIVE_PREPAYMENT_COMMERCIAL_REVIEW
PURCHASED_SNAPSHOT = IMMUTABLE_PAID_TRUTH
TWO_MONEY_AUTHORITIES = NO
```

| Cart context | What is shown | Label | What stays non-final |
|---|---|---|---|
| No active checkout, or the checkout has no selected fulfilment mode, or `sourceCartRevision` does not match the current cart | Existing estimated merchandise subtotal. Real order-saving and threshold rows only when the server Cart evaluation returned them. No delivery row. | `COPY-ESTIMATED-SUBTOTAL` | The whole figure. `COPY-CART-NOT-FINAL` says delivery and the full total are confirmed at checkout, without a delivery number |
| Active checkout reused, fulfilment mode selected, revision matches, and a current Checkout evaluation exists | The same server Checkout evaluation Review will show, including a delivery charge only when that evaluation returned one | `COPY-CURRENT-CHECKOUT-TOTAL` | It is the current evaluated checkout amount. It is not labeled Total payable on Cart, and it is not the purchased amount. Payment binding still revalidates it |
| Checkout Review after that evaluation | The current pre-payment commercial review | `COPY-TOTAL-PAYABLE` | Still not frozen forever. Stale revalidation can return a new server amount |
| Payment | Read-only current evaluation or snapshot | `COPY-TOTAL-PAYABLE` | Coupon cannot change it. Revalidation failure leaves Payment |
| Confirmation and history | Sealed purchased amounts | Purchased copy | Live Offers do not rewrite them |

Showing the reused checkout evaluation on Cart does not create a second calculator. The number is that evaluation. Cart loads it by calling `evaluateCart`, which returns that existing `evaluation_id` and does not mint a review-surface token. `evaluateCheckout` remains the only command that mints that token. Cart does not relabel the figure as the amount the customer finally pays. Review is the surface that presents Total payable.

### Cart and Checkout Review

Reading order, and the DOM order, and the tab order, are the same sequence. Do not visually place a control in one place and tab to it in another.

Cart at `lg` and up. The items stay in the left column. The aside order is:

1. Real saving lines, only when that server money exists.
2. The non-final amount from the table above.
3. Coupon field, then Apply, Change, and Remove.
4. Checkout, then Keep browsing.

Cart below `lg`. The aside is not rendered. The amount is not repeated in the column. Order is:

1. Items, including one complimentary line when the selected result has one.
2. Real saving lines, only when that server money exists.
3. Coupon field, then Apply, Change, and Remove.
4. The sticky bar: the one non-final amount, then Checkout.

The amount label exists once. At `lg` and up it is only in the aside. Below `lg` it is only in the bar.

Checkout Review:

1. Fulfilment, because changing it recomputes.
2. Items and real saving lines, including delivery only when the evaluation includes it.
3. Total payable.
4. Continue to payment.
5. Coupon field, then Apply, Change, and Remove.

The coupon stays secondary on Review. It is after the total and the primary action, in both the layout and the tab order.

The stack is one result. An automatic Offer and a coupon are not two competing totals.

Money row order inside the existing `dl` in `OrderMoneySummaryPanel` on Review, Payment, and purchased detail. The previous-checkout panel in `PreviousPaymentRecoveryView` is not one of those surfaces. It keeps the previous snapshot, the title "Previous checkout total", and the inner total row that panel already renders. It does not gain the new Offer saving rows. That inner row is not the current Cart or Review payable label.

| Row | Show when |
|---|---|
| Subtotal | Always, merchandise subtotal the summary already isolates from charges |
| Order saving | Server merchandise or order saving is greater than zero |
| Packaging and other existing non-delivery charges | Already present on the snapshot |
| Delivery | Delivery is in the server evaluation. Amount may be zero. Label stays the charge name already returned, "Delivery" when the code fallback is used |
| Delivery saving | Server delivery saving is greater than zero |
| Tax | Existing tax rows, unchanged |
| Total saved | Server total saved is greater than zero. The figure equals the shown component lines. It is not an extra amount |
| Total payable | Review, Payment, and purchased detail. Visually strongest row, existing border-top treatment. Not used as the Cart label |

A complimentary ₹0 merchandise line is an item row, not a second saving row. Do not invent a struck-through "was" price.

### Desktop cart (`lg` and up)

Left column: heading, items, complimentary line, non-money alerts already on the cart. Right aside (`cart-order-summary`, `hidden` below `lg`, `lg:sticky lg:top-20`): saving stack, the non-final amount, threshold line, coupon region, primary Checkout, secondary "Keep browsing". That is the `lg` sequence above and the `lg` tab order in section 8. The aside is the only Cart amount at this width. The mobile bar is hidden.

### Narrow cart (below `lg`)

One column. Items, saving lines, threshold, and coupon. The column does not render the amount. The existing `cart-mobile-checkout` bar stays `lg:hidden` and is the only amount plus Checkout. The bar repeats the Cart label from the money-truth table, `COPY-ESTIMATED-SUBTOTAL` or `COPY-CURRENT-CHECKOUT-TOTAL`, and the Checkout button. It does not say Total payable. It does not contain the coupon. Page bottom padding already clears the bar. While the amount is updating, the bar uses the waiting treatment in section 8 and Checkout is disabled. Menu `StickyCartBar` keeps "Estimated subtotal" and gains no offer treatment.

### Checkout Review, all widths

Keep the existing single column. Fulfilment stays above the summary because changing it recomputes. Place the saving stack, then the primary "Continue to payment", then the coupon region. The total and the primary action are adjacent. Do not add a second sticky pay bar. A second button would create two primary actions.

### Payment

Primary: total payable and the existing pay action in `PaymentPanel`. Secondary: the short stack, without coupon controls. Those controls are absent from the tab order, not merely hidden with CSS that leaves them focusable.

### Confirmation and history detail

Primary: what was ordered and what was paid. Secondary: purchased saving sentence and purchased lines. No live progress and no coupon field. History list is unchanged.

### Operator

Primary: customer meaning of this record, and whether activation can succeed. Secondary: window, scope, caps, fulfilment, benefit class. Progressive: qualifiers not needed to understand the customer result. Destructive: retire confirmation. Layout stays the current stacked list and form. Create fieldset keeps `sm:grid-cols-4` and stacks below `sm`.

## 4. Final microcopy

Sentence case. Money inside a sentence is the `formatPaise` string of the server amount. Do not use `formatRupees` for these amounts. Do not round to a marketing figure. Do not add a claim the server did not return.

| ID | Final string | Use |
|---|---|---|
| `COPY-APPLIED-AUTO` | Offer applied. | Automatic selected saving |
| `COPY-APPLIED-REASON` | Offer applied. You reached {threshold}. | Only when the server explanation includes the reached threshold |
| `COPY-COUPON-LABEL` | Coupon | Accessible name of the field |
| `COPY-COUPON-HINT` | Enter a code you already have. | Field instruction |
| `COPY-APPLY` | Apply | Button |
| `COPY-CHECKING` | Checking this coupon | Pending text |
| `COPY-APPLIED-COUPON` | Coupon applied. | Selected coupon that pays less |
| `COPY-CHANGE` | Change | Button |
| `COPY-REMOVE` | Remove | Button |
| `COPY-INVALID` | That code isn't valid. Check it and try again. | Not a real code |
| `COPY-EXPIRED` | This coupon has expired. | Expired window. No operator schedule and no date. The only customer sentence for this condition. `COUPON_EXPIRED` uses this sentence and is not shown beside an older one |
| `COPY-INAPPLICABLE` | This coupon doesn't apply to this order. | Coarse inapplicable. The only customer sentence for this condition. `COUPON_CURRENTLY_INELIGIBLE` and `CHECKOUT_COUPON_INELIGIBLE` use this sentence and are not shown beside it |
| `COPY-INAPPLICABLE-DELIVERY` | This coupon doesn't apply to this order. It applies to delivery orders. | Only when the server says the code is delivery-only and the selected mode is pickup |
| `COPY-INAPPLICABLE-PICKUP` | This coupon doesn't apply to this order. It applies to pickup orders. | Only when the server says the code is pickup-only and the selected mode is delivery |
| `COPY-SIGN-IN` | Sign in to use this coupon. | Identity required |
| `COPY-SIGN-IN-ACTION` | Sign in | Button |
| `COPY-RETRY-CODE` | Enter your coupon again. | Continuity could not keep the attempt. Do not show a success |
| `COPY-STRICT-KEEP` | This coupon is valid. It doesn't improve your total, so we kept the better amount. | Strictly lower non-coupon payable only |
| `COPY-EQUAL-SELECTED` | Coupon applied. Your total stays the same. | Equal payable, coupon combination selected |
| `COPY-EQUAL-KEPT` | This coupon is valid. It doesn't change your total. | Equal payable, non-coupon combination retained |
| `COPY-EQUAL-KEPT-OFFER` | This coupon is valid. It doesn't change your total. Your current offer stays applied. | Same, only when the retained result still has an applied Offer |
| `COPY-THRESHOLD` | Add {amount} more to unlock {benefit}. | Both `{amount}` and `{benefit}` come from the server. If either is absent, show no progress line |
| `COPY-DROPPED` | This offer no longer applies. | Saving left after a real cart or context change |
| `COPY-DELIVERY-SAVING-ROW` | Delivery saving | Row label |
| `COPY-ORDER-SAVING-ROW` | Order saving | Row label |
| `COPY-TOTAL-SAVED-ROW` | Total saved | Row label. Same figure as the components |
| `COPY-ESTIMATED-SUBTOTAL` | Estimated subtotal | Cart amount when full checkout context is absent. Existing customer label |
| `COPY-CART-NOT-FINAL` | Delivery and the full total are confirmed at checkout. | Cart sentence. No delivery amount |
| `COPY-CURRENT-CHECKOUT-TOTAL` | Current total | Cart label only when a reused checkout evaluation already includes fulfilment context. Not the final payable label |
| `COPY-TOTAL-PAYABLE` | Total payable | Review, Payment, and purchased detail. Not the incomplete Cart label |
| `COPY-DELIVERY-ROW` | Delivery | Only as the existing charge-name fallback |
| `COPY-PURCHASED` | You saved {amount} on this order. | Confirmation and detail. `{amount}` is purchased total saved. Not a second amount on top of the lines |
| `COPY-INCLUDED` | Included with your offer | Complimentary line reason |
| `COPY-STALE` | Your total changed before payment. Review the updated amount. | Stale recovery |
| `COPY-GIFT-GONE` | That included item is no longer available. Your total has been updated. | Complimentary availability loss |
| `COPY-GIFT-CONFLICT` | An included item can't be added to this order. | Only if a complimentary line was already shown and the competing-item fallback removes it. Do not use the unavailable sentence for this case |
| `COPY-RETRY` | We couldn't check this coupon. Try again. | Apply, change, or remove did not finish |
| `COPY-RETRY-ACTION` | Try again | Button |
| `COPY-UPDATING` | Updating your total | In-flight recompute of an existing result |
| `COPY-CHECKING-TOTAL` | Checking your total | No authoritative result yet |
| `COPY-OP-AUTO` | Customers get this without a code | Operator trigger |
| `COPY-OP-COUPON` | Customers enter a coupon | Operator trigger |
| `COPY-OP-ORDER` | This changes the items or order total | Operator benefit class |
| `COPY-OP-DELIVERY` | This changes the delivery charge | Operator benefit class |
| `COPY-OP-GIFT` | One menu item, included, with no customer choices | Complimentary binding |
| `COPY-OP-GIFT-INVALID` | Choose one menu item that needs no customer choices. | Activation or field rejection |
| `COPY-OP-SECOND` | Another included-item offer is already active. This one was not activated. | Sequential denial |
| `COPY-OP-RACE` | This activation did not become the active offer. Check the offer that is active, then try again if you still need a change. | Concurrent non-authoritative activation |
| `COPY-OP-CONFLICT` | Someone else changed this. Reload it and try again. | Revision conflict |
| `COPY-OP-LIVE` | Customers can receive this offer. | After a truthful activation success |
| `COPY-OP-DRAFT` | Not live yet. Customers do not receive this. | Draft |
| `COPY-OP-RETIRED` | Retired. New orders will not receive it. | After retire success |
| `COPY-RETIRE-TITLE` | Retire this offer? | Dialog title |
| `COPY-RETIRE-BODY` | New orders will stop receiving it. Orders already placed stay as paid. | Dialog body |
| `COPY-RETIRE-CONFIRM` | Retire offer | Confirm button |
| `COPY-CANCEL` | Cancel | Cancel button |
| `COPY-DENIED` | You can't change this. | Out-of-scope denial. Record unchanged |
| `COPY-CONTINUE` | Checkout | Cart primary. Existing label |
| `COPY-CONTINUE-PAY` | Continue to payment | Review primary |
| `COPY-GLOBAL-CAP` | This offer has been fully used. | Global exhaustion. No count |
| `COPY-PERSONAL-CAP` | You've already used this offer. | Personal exhaustion. No count |

Forbidden on customer surfaces: promotion candidate, revision, evaluator, snapshot, slot, qualifier, claim, the class names `COUPON_APPLIED` and the other presentation classes, "better" when the payable amounts are equal, a saving that was not evaluated, another customer's orders or remaining uses, fake urgency, and a revenue or conversion claim.

When no Offer applies, show items and the total. Do not apologize.

Standing delivery at ₹0 shows the delivery row at zero and no delivery-saving row. Do not call that row an Offer.

`COPY-STRICT-KEEP` is forbidden when the payable amounts are equal. `COPY-EQUAL-*` is forbidden when one payable amount is lower.

## 5. User flows

Shared rules for every customer flow: one server evaluation; previous money stays visible until the new server result arrives; a failed request does not paint a new total; Cart does not present an incomplete figure as Total payable; focus and announcements follow section 7; analytics hooks are the fact kinds in `IMP-036J-MEASUREMENT-CANDIDATE-2`, not a second calculator. The Cart Checkout control mints one activation id for that gesture. A retry of the same request reuses it. A later press mints another. A repaint does not. Direct Checkout omits it.

| # | Flow | Behaviour |
|---|---|---|
| 1 | Automatic Offer applies | Cart or Review shows the item list and `COPY-APPLIED-AUTO` or `COPY-APPLIED-REASON`. Order-saving and, when real, delivery-saving rows match the server. Primary action is Checkout or Continue to payment. The customer does not activate the Offer. |
| 2 | No Offer applies | No saving rows, no progress, no apology. Coupon field is still there. Cart shows the estimated subtotal. Review shows Total payable from the server evaluation. |
| 3 | Coupon apply succeeds | Customer types a code and presses Apply. "Checking this coupon" holds the previous total. On success the stack updates and shows `COPY-APPLIED-COUPON` because this combination pays less. Change and Remove appear. |
| 4 | Coupon invalid | `COPY-INVALID`. No saving from that attempt. Focus returns to the field. The previous shared code, if any, stays only when the server wrote nothing. An unknown code writes nothing. |
| 5 | Coupon requires sign-in | `COPY-SIGN-IN` and Sign in. The code remains the cart's one code. Do not explain who qualifies. |
| 6 | Return from sign-in and retry | Existing return path comes back to the same surface. When continuity kept the code, the page shows `COPY-CHECKING` and then the real result. When it did not, show `COPY-RETRY-CODE` and an empty field. Do not invent an applied state. |
| 7 | Coupon valid, another result pays less | `COPY-STRICT-KEEP`. The stack is the retained lower result. Remove keeps that result. The code stays visible so the customer can remove it. |
| 8 | Equal payable, coupon selected | `COPY-EQUAL-SELECTED`. Stack shows only actual effects of the selected result. No "better" sentence. |
| 9 | Equal payable, coupon not selected | `COPY-EQUAL-KEPT` or `COPY-EQUAL-KEPT-OFFER`. The retained combination stays. The customer cannot switch combinations. |
| 10 | Coupon change | Change focuses the field with the current code selected. Apply sends one replacement. Until that request finishes, the previous result remains. Failure leaves the previous shared state. |
| 11 | Coupon remove | Remove clears the code after the server succeeds, recomputes, and focuses the empty field. No extra confirmation dialog. |
| 12 | Threshold progress | `COPY-THRESHOLD` sits with the total story on Cart and again on Review while still short. If the server does not supply both the rupee gap and the plain benefit, omit the line. A quantity-only gap is not turned into rupees and is not given a new slogan. |
| 13 | Threshold reached | The progress line is replaced by the applied saving. Announce the change. No extra celebratory value. |
| 14 | Offer falls away | After a cart, fulfilment, or timing change, the saving leaves when the new result says so. `COPY-DROPPED`. Progress returns only when the new result includes a real rupee gap and benefit. |
| 15 | Delivery incentive | Delivery row shows the charge after the incentive, including ₹0 when that is the result, plus one Delivery saving row for the positive evaluated effect, inside total saved. |
| 16 | Order saving and delivery saving together | On Review, both rows, then total saved, then Total payable. On Cart, the delivery row appears only when the reused checkout evaluation returned it. One merchandise story. The delivery saving does not add a second item discount. |
| 17 | Complimentary item | Read-only line: operator item name, `COPY-INCLUDED`, merchandise `formatPaise(0)`. No options, no remove, no replace-with-another-item. A real delivery saving stays its own row. The equal-payable complimentary selection uses this same line and does not say a coupon was the better price. |
| 18 | Complimentary item becomes unavailable | Stay on Review. Line disappears. `COPY-GIFT-GONE`. New total. Pay is not offered on the old line. No substitute list. |
| 19 | Stale checkout total | Pay stops. Customer is on Review with `COPY-STALE`, the new stack, and no pay action against the old amount. |
| 20 | Revalidation before payment | If the fresh result matches, payment continues and the screen does not announce a false change. If it differs, flow 19. |
| 21 | Network or server failure | `COPY-RETRY`. Previous code and previous total remain. Retry repeats the same action. No false applied state. |
| 22 | Reload or revisit | The shared cart code and the latest successful evaluation render again. A reload during a failed request shows the last committed state, not the unsent keystrokes. |
| 23 | Purchased history | Confirmation and detail show `COPY-PURCHASED` and the purchased split rows when both an order saving and a delivery saving were sealed. The complimentary line remains the purchased item at no extra merchandise charge. Later live edits do not change these words or amounts. History list stays a grand total. |
| 24 | Operator create and edit | Existing editor. Labels `COPY-OP-AUTO` or `COPY-OP-COUPON`, and `COPY-OP-ORDER` or `COPY-OP-DELIVERY`. Complimentary binding uses `COPY-OP-GIFT`. A configuration that still needs a customer choice shows `COPY-OP-GIFT-INVALID` on that field and cannot be described as live. |
| 25 | Activation success or failure | Success shows Active plus `COPY-OP-LIVE`. Sequential denial shows `COPY-OP-SECOND` and leaves the existing active Offer. A non-authoritative concurrent attempt shows `COPY-OP-RACE`, never a success banner. Revision conflict shows `COPY-OP-CONFLICT`. |
| 26 | Retirement | `COPY-RETIRE-TITLE` and `COPY-RETIRE-BODY`. Confirm runs retire. Cancel closes the dialog and leaves the Offer active. Success shows `COPY-OP-RETIRED`. |

Competing complimentary fallback is not an extra customer choice. If no complimentary line was shown, add no gift error. If one was shown, `COPY-GIFT-CONFLICT` and the recomputed total.

First-order and fulfilment eligibility change what is shown. A returning customer does not see a first-order lecture. Pickup does not show a delivery saving. A delivery-only automatic Offer that does not apply is absent, not described as broken.

## 6. State matrix

Columns the tables compress: surface, trigger, hierarchy, money, primary action, secondary action, recovery, microcopy, focus, announcement, analytics hook, mobile, desktop.

Mobile for Cart means the column text plus the `lg:hidden` total bar. Desktop Cart means the `lg` aside holds the stack, coupon, and Checkout. Review, Payment, confirmation, and history use the same single column at every width. Operator forms stack at the default width and use the existing `sm` grid for the create row.

`LIVE-MONEY` means a polite announcement of the new server amount, using the surface's label. On Cart that label is Estimated subtotal or Current total. On Review and Payment it is Total payable. `LIVE-STATUS` means a polite announcement of the status sentence. Alerts use `role="alert"` and are announced assertively. Hooks name measurement facts. `OFFER_RESULT_VIEW` is the counted view of one evaluation, taken from the first committed presentation. A later surface of that same evaluation records integrity evidence and does not count another view. `CART_ACTIVATION` names the `cart_checkout_activations` row for that Checkout control gesture. It is not a journey-fact kind and it does not consume `AUTHORITATIVE_JOURNEY_SEQUENCE`. `CART_REVIEW_REACH` is the later Review reach for that activation. `COMMERCIAL_STATE_CHANGE` is server provenance, not a client event.

| State | Surface | Trigger | What is visible | Money | Primary | Secondary | Recovery | Copy | Focus | Announcement | Hook |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Default / ready | Cart, Review | Evaluation returned and nothing is pending | Items, stack, coupon field, primary action | Cart: estimated subtotal, or current checkout total when section 3 allows it. Review: Total payable | Checkout or Continue to payment | Apply if the field has text | None | Field hint. Cart also uses `COPY-CART-NOT-FINAL` when the amount is only an estimate | Natural tab order | None extra | `OFFER_RESULT_VIEW` after the money region commits |
| No applicable Offer | Cart, Review | Server result has no saving and no progress | Items and the surface amount. No apology | Cart estimate or Review Total payable. No invented delivery on the estimate | Continue | Apply | None | Hint only | None forced | None | `OFFER_RESULT_VIEW` shape `NONE` |
| Automatic applied | Cart, Review | Server selected an automatic saving | Status then stack | Order saving and delivery saving only when positive | Continue | None for the Offer | If a later result drops it, the dropped state | `COPY-APPLIED-AUTO` or reason | None forced | `LIVE-STATUS` and `LIVE-MONEY` when it newly appears | `OFFER_RESULT_VIEW` |
| Loading / no result yet | Cart, Review | First evaluation in flight | Items may show. No guessed discount | `COPY-CHECKING-TOTAL`. No payable figure yet | Disabled | Coupon disabled | Retry on failure | `COPY-CHECKING-TOTAL` | Leave focus where it is | Polite waiting text | None until a result is shown |
| Evaluation refresh | Cart, Review | Cart, fulfilment, or timing change in flight | Last stack remains | Last total, marked `COPY-UPDATING` | Disabled until the new result | Coupon disabled | Failure keeps the last committed result and offers retry | `COPY-UPDATING` | Leave focus | Polite updating text. Do not announce the old total as new | `COMMERCIAL_STATE_CHANGE` only when the new Review fingerprint differs |
| Coupon empty | Cart, Review | No code committed and field blank | Named field, Apply disabled | Unchanged | Continue | None | Empty is valid | Hint | Field is tabbable | None | None |
| Coupon entered | Cart, Review | Field has non-space text, not submitted | Apply enabled | Unchanged | Continue or Apply | None | None | Hint | Field | None | None |
| Coupon checking | Cart, Review | Apply, change, or remove request in flight | Previous stack. Typed code remains | Previous total | Disabled | Disabled | Failure state | `COPY-CHECKING` | Stay on the action that was pressed | Polite checking text | None until completion |
| Coupon applied | Cart, Review; summary only on Payment | Server class is the lower coupon combination | `COPY-APPLIED-COUPON` and the stack | Actual saving | Continue | Change, Remove before payment | Remove recomputes | `COPY-APPLIED-COUPON` | Move to the status | `LIVE-STATUS` and `LIVE-MONEY` if the total changed | `OFFER_RESULT_VIEW` and `COMMERCIAL_STATE_CHANGE` |
| Coupon invalid | Cart, Review | Unknown code | Error under the field | No saving from this attempt | Continue on the previous committed total | Apply again | Correct the text | `COPY-INVALID` | Field | Alert | No new measurement attribute beyond locked classes |
| Expired | Cart, Review | Server expired class | Same placement | No saving from this attempt | Continue | Change or Remove | Try another code | `COPY-EXPIRED` | Field | Alert | Same |
| Inapplicable | Cart, Review | Recognized code does not qualify | Error under the field | No saving from this attempt | Continue | Change fulfilment or cart, or Remove | Those recomputes | `COPY-INAPPLICABLE` plus the mode clause only in the two allowed cases | Field | Alert | Same |
| Globally exhausted | Cart, Review | Server global-cap class | Error | No saving from this attempt | Continue | Remove | Continue without it | `COPY-GLOBAL-CAP` | Field | Alert | Same |
| Personally exhausted | Cart, Review | Server personal-cap class | Error | No saving from this attempt | Continue | Remove | Continue without it | `COPY-PERSONAL-CAP` | Field | Alert | Same |
| Identity required | Cart or Review, where submitted | Server identity class | Sign-in request. Code kept | Previous total | Sign in | Remove | Return flow | `COPY-SIGN-IN` | Sign in button | Alert | None that records the code |
| Sign-in return | Same surface | Authentication return | Checking, then the real result, or the re-enter sentence | No false applied total | Read the result | Apply if re-entry is required | `COPY-RETRY-CODE` | Result copy | Coupon status, or the field if re-entry is required | `LIVE-STATUS` | `OFFER_RESULT_VIEW` after the result |
| Strictly lower non-coupon | Cart, Review | Server retained a lower non-coupon total | Retained stack plus the sentence | Retained lower total | Continue | Remove | Remove keeps that total | `COPY-STRICT-KEEP` | Status | `LIVE-STATUS` | `OFFER_RESULT_VIEW` |
| Equal payable selected | Cart, Review; read-only on Payment | Server selected the coupon tie | Sentence plus only actual effects | Same payable as the alternative | Continue | Change, Remove | Either recomputes from the code being gone | `COPY-EQUAL-SELECTED` | Status | Announce applied and that the total stayed the same | `OFFER_RESULT_VIEW` |
| Equal payable not selected | Cart, Review | Server retained the non-coupon tie | Retained stack plus the sentence | Unchanged versus that alternative | Continue | Remove | Remove keeps the retained result | `COPY-EQUAL-KEPT` or with offer | Status | Announce valid and unchanged total | `OFFER_RESULT_VIEW` |
| Coupon removed | Cart, Review | Remove succeeded | Empty field. New stack | Recomputed total | Continue | Apply | Empty | Hint | Field | `LIVE-MONEY` | `COMMERCIAL_STATE_CHANGE` when the fingerprint differs |
| Coupon replaced | Cart, Review | Replace succeeded | One code and the new result | New total | Continue | Change, Remove | Failure keeps the previous state | The new result's copy | Status | `LIVE-STATUS` | `COMMERCIAL_STATE_CHANGE` when the fingerprint differs |
| Threshold progress | Cart and Review | Server rupee gap and benefit | Progress with the total story | No invented saving | Continue or add items | Apply | Omit if the pair is incomplete | `COPY-THRESHOLD` | None forced | Polite progress text when it appears or changes | `OFFER_RESULT_VIEW` |
| Threshold satisfied | Cart, Review | Minimum now holds | Progress gone. Applied saving | The new saving | Continue | None | Drop state if a later edit falls below | Applied copy | None forced | `LIVE-STATUS` and `LIVE-MONEY` | `OFFER_RESULT_VIEW` |
| Threshold lost | Cart, Review | New result is below the minimum | Dropped sentence. Progress only if the gap is real again | Updated total | Continue | Add items | None beyond the line | `COPY-DROPPED` | Status | `LIVE-STATUS` and `LIVE-MONEY` | `COMMERCIAL_STATE_CHANGE` when the fingerprint differs |
| Order and delivery savings | Cart, Review, Payment, purchased | Both effects are positive | Both saving rows and total saved. Cart uses its non-final amount label. Review, Payment, and purchased use Total payable | Both components once | Continue or pay | Coupon only before payment | Recompute if inputs change | Row labels | None forced | `LIVE-MONEY` when new | `OFFER_RESULT_VIEW` |
| Complimentary item | Cart, Review; purchased later | Selected complimentary combination | Item row, included, ₹0 | ₹0 merchandise. Delivery saving only if positive | Continue. No edit | None on that line | Unavailable flow | `COPY-INCLUDED` | Read-only text. Not a control and not a tab stop | Polite line text when it appears | `OFFER_RESULT_VIEW` |
| Complimentary unavailable | Review | Availability recheck removed it | Line gone. Explanation. New total | New result | Continue on the new total | Change cart | No substitute. Pay not offered on the old line | `COPY-GIFT-GONE` | Explanation, then the continue action | Alert and `LIVE-MONEY` | `COMMERCIAL_STATE_CHANGE` with origin `STALE_RECOVERY`. Complimentary loss is that origin plus the server explanation class, not a new origin |
| Complimentary conflict | Cart, Review | More than one complimentary would qualify | Neither gift. Ordinary total. Conflict sentence only if a line had been shown | Ordinary evaluated total | Continue | None | No picker | `COPY-GIFT-CONFLICT` only in that case | Explanation if shown | Alert if the sentence appears | `OFFER_RESULT_VIEW` |
| Stale changed | Review | Prepare or pay found a mismatch | Stop the old pay. New stack and reason | New total | Continue on the new total, or change coupon or cart | No payment-page coupon edit | Stay on Review | `COPY-STALE` | Explanation, then continue | Alert and `LIVE-MONEY` | `COMMERCIAL_STATE_CHANGE` with origin `STALE_RECOVERY`. Complimentary loss is that origin plus the server explanation class, not a new origin |
| Stale unchanged | Review or pay | Revalidation matches | Same amount. Pay proceeds | Same total | Pay | None | None | No change sentence | No focus jump | Do not announce a change | `REVIEW_TO_PAYMENT` |
| Payment read-only | Payment | Customer reached payment | Summary only | Current sealed or current quoted total | Pay | Back only if the existing checkout already offers non-coupon back navigation | Commercial recovery is Review | Stack copy only | Pay | None extra | `PAYMENT_ATTEMPT` |
| Server or network failure | Cart, Review | Apply, replace, remove, or evaluate did not finish | Previous state | Previous total | Try again | Continue on that previous total | Same action | `COPY-RETRY` | The action that failed | Alert | None that claims success |
| Disabled | Any pending control | Request in flight, empty Apply, or out-of-scope operator control | Control remains visible | Last safe total | The surviving enabled action | None | Enable again when the request ends | Existing labels | Disabled controls are skipped | None | None |
| Destructive confirmation | Operator retire dialog | Retire pressed | Title, body, Retire offer, Cancel | No customer money | Retire offer | Cancel | Cancel leaves Active | Retire strings | Cancel first | Dialog title | None customer |
| Concurrency / conflict | Operator activation or revision | Second complimentary activation, losing race, or stale revision | Non-success sentence. No success badge | None | Reload or edit the draft | None | Record unchanged except the authoritative winner of a race, which is not this attempt | `COPY-OP-SECOND`, `COPY-OP-RACE`, or `COPY-OP-CONFLICT` | The error text | Alert | None customer |
| Success, operator | Commercial surface | Activation or retire committed | Sentence plus Active or Retired | None | Inspect or retire | None | Retire still confirms | `COPY-OP-LIVE` or `COPY-OP-RETIRED` | Status sentence | Polite status | None customer |
| Purchased truth | Confirmation, detail | Order read | Purchased sentence, purchased lines, complimentary line if sealed | Sealed amounts | None | Support actions that already exist | Live Offers do not rewrite it | `COPY-PURCHASED` | None forced | None | Completion is server-side, not a page view that changes money |
| Operator draft | Editor | Draft opened | `COPY-OP-DRAFT` | None | Continue editing | Activate only when valid | Fix fields | Field sentences | First invalid field on failed save | Alert on the field | None |
| Operator out of scope | Editor | Denied permission | `COPY-DENIED` | Record unchanged | None | None | No partial write | `COPY-DENIED` | The denial | Alert | None |

## 7. Interaction contract

The UI sends the existing commands. It does not decide the winning combination, the cap, or the tie.

| Action | Enabled | Pending | Duplicate click | Focus | Error placement | Money | Recovery |
|---|---|---|---|---|---|---|---|
| `APPLY` | Cart or Review, field has trimmed text, no request in flight | Label becomes `COPY-CHECKING`. Apply, Change, Remove, and the primary continue control disable | Ignored while disabled. One request | Success: status. Failure: field | Directly under the field, `aria-describedby` | Previous total until the response | `COPY-RETRY` leaves the previous shared state |
| `CHANGE` | A code is already in the shared state, not pending | Same as Apply once the replacement is submitted | Ignored | Change moves focus into the field and selects the current code | Under the field | Previous result until the replacement returns | Failed replacement keeps the previous code and total |
| `REMOVE` | A code is in the shared state, not pending | `COPY-CHECKING`. Same disables | Ignored | Success: empty field. Failure: Remove | Under the coupon region | Previous total until success, then the recomputed total | Retry remove. Do not clear the field locally first |
| `RETRY` | A failed action is showing | Same pending treatment as the action it repeats | Ignored | Stays on Try again until the result | Same place as the original error | Previous total | The action's own success |
| `SIGN_IN_RETURN` | Identity-required result, then the existing sign-in return | Checking text on return when the code was kept | The return loads once | Result status, or the field when the code was lost | Under the field | No false applied total | `COPY-RETRY-CODE` |
| `FULFILMENT_CHANGE` | Existing fulfilment controls, not during a coupon request | `COPY-UPDATING`. Primary pay or continue disables | Existing fulfilment controls disable while saving | Leave the mode control | Total region if the new result is an error | Last total marked updating. Delivery saving of the other mode is not labeled current after the new result arrives. Until then, do not invent the other mode's saving | Failure restores the last committed mode presentation |
| `CART_CHANGE` | Existing quantity, edit, clear, and remove line controls | `COPY-UPDATING` when a commercial refresh follows | Pending disables those line controls, as the cart already disables pending mutations | Leave the line control | Existing cart alert | Last shown server figure until the new quote. The Cart label does not become Total payable | Existing cart error copy |
| `REVALIDATE` | Continue to payment, then the existing prepare inside pay | Do not spin on Payment while showing the old amount as the payable amount | One pay submission, matching `PaymentPanel`'s pending behaviour | Unchanged result: pay. Changed result: Review explanation | Review, not a coupon box on Payment | Either the same validated amount or the new Review total | `COPY-STALE` |
| `PAYMENT_ENTRY` | Pay only when the amount is the current one | Existing payment pending copy | Existing payment idempotency. No coupon control to double-submit | Pay, or the recovery the panel already uses | Existing payment recovery | The summary matches the current result. Coupon text is not collected | Review when commerce changed |
| `COMPLIMENTARY_ITEM_LOST` | Happens from revalidation, not from a customer control | Same as revalidation | Not a customer action | Explanation, then continue on the new total | With the total | New total. Old included line is not payable | Stay on Review |
| `RETIRE_CONFIRM` | Authorized operator, dialog open, not busy | Confirm disables and shows the existing busy treatment | Ignored while busy | Stays in the dialog until it closes | Inside the dialog | No customer total | `COPY-OP-RETIRED` after success, or the command error in the dialog |
| `RETIRE_CANCEL` | Dialog open, not busy | None | Closes once | Focus returns to the Retire control that opened it | None | Offer stays active | None |

Enter in the coupon field submits Apply when Apply is enabled. Shift is irrelevant. Space activates buttons because they are real `button` elements. Enter does not submit a remove.

## 8. Accessibility

Reuse the patterns already in the named components. Do not add a second focus ring or a second live-region library.

- The coupon field's accessible name is "Coupon". The hint "Enter a code you already have." is the description.
- On a failure, `aria-invalid="true"` and `aria-describedby` includes the error id and the hint id.
- On success or a non-error result, `aria-invalid` is absent and `aria-describedby` includes the status id.
- The status node is `role="status"` and `aria-live="polite"` for applied, equal-payable, threshold, dropped, and checking text.
- Invalid, expired, inapplicable, exhaustion, identity, stale, unavailable, and network failures use `role="alert"`.
- On Review and Payment, money stays in the existing `OrderMoneySummaryPanel`. The accessible name stays on the wrapping section, which those screens already set to "Price summary". This candidate does not move that name onto the `dl` and does not rename it to "Order total". Cart keeps the amount as the existing paragraph text. It does not add a `dl`.
- Tab order follows the visual order in section 3. At `lg` and up, Cart tab order is items and their existing controls, the complimentary line is not a control, saving text, the aside amount, coupon field, Apply, Change, Remove, Checkout, Keep browsing. Below `lg`, Cart tab order is items and their existing controls, saving text, coupon field, Apply, Change, Remove, then the bar amount and Checkout. On Review: fulfilment, items, saving text, Total payable, Continue to payment, coupon field, Apply, Change, Remove. The coupon is not placed before Continue to payment in either the Review layout or the Review tab sequence.
- Apply, Change, Remove, Sign in, Try again, Retire offer, and Cancel are keyboard operable.
- After a validation failure, focus the coupon field.
- After a successful apply or a non-error coupon result, focus the status.
- After removal, focus the coupon field.
- After sign-in return, focus the coupon status on that surface, or the field when the code must be typed again.
- After stale recovery or complimentary loss, focus the explanation. The next tab stop is the recovery action on the new total.
- `ConsequenceReviewDialog` keeps its trap and Escape behaviour. For retire, initial focus is Cancel, using the cancel-first preference already implemented in `AdminConfirmDialog`. Busy Escape does not close it. Close restores focus to the control that opened the dialog.
- Status is text. Green is not the only sign of a saving. `StatusBadge` may remain for operators beside the sentence; the sentence is the status.
- Prices use the existing text styles and `tabular-nums`.
- Checking text is the waiting sign. If `LoadingState`'s spinner is reused for operator loads, `motion-reduce:animate-none` already stops the spin and the text remains. Customer money changes do not depend on motion.
- Customer action height is at least the existing `min-h-[44px]`. Cart sticky Checkout keeps `min-h-[48px]`. Desktop cart Checkout keeps `min-h-[52px]`.

## 9. Responsive behaviour

| Width | Cart | Review | Payment | Operator |
|---|---|---|---|---|
| Below `lg`, including `sm` and `md` | One column. Saving lines and the coupon scroll above the existing sticky bar. The amount is only in that bar: Estimated subtotal or Current total, plus Checkout. The column does not repeat the amount. The bar does not say Total payable | Single `max-w-[640px]` column. Stack then Continue to payment then coupon. No second sticky bar | Existing payment column. Summary above pay | List, then form. Create grid stacks until `sm`, then `sm:grid-cols-4` |
| `lg` and up | Two columns. Aside sticky at `top-20`. Mobile bar hidden | Same single column. Do not split a new dashboard | Same | Same stacked editor. Do not invent a wide table |
| Menu `xl` | Unchanged. `StickyCartBar` still hides at `xl` and still has no offer content | n/a | n/a | n/a |

Wrapping: money rows keep label and amount on one line with the existing `justify-between`. Long offer sentences wrap under the coupon field to two lines, then the full text remains in the accessibility tree. The complimentary line uses `CartLineList`'s item row layout without quantity steppers or edit. It is not a horizontal scroller.

No important money is inside a disclosure, a carousel, or a marketing banner.

## 10. Perceived performance

| Moment | Waiting copy | Money | Layout |
|---|---|---|---|
| Initial evaluation | `COPY-CHECKING-TOTAL` if nothing authoritative exists | No guessed discount | Reserve the stack's place under the items so the sticky total bar does not jump when the first total arrives |
| Coupon check | `COPY-CHECKING` | Previous total | The status line is reserved under the field so the total does not move |
| Cart mutation | `COPY-UPDATING` when a known total is refreshing | Last shown server figure, visibly marked updating. Estimated subtotal stays estimated | Sticky amount stays in the same bar slot |
| Fulfilment change | `COPY-UPDATING` | Same. The new result replaces mode-specific delivery lines only when it arrives | Summary stays above Continue to payment |
| Sign-in return | `COPY-CHECKING` when the code was kept | No false applied total | Same coupon region |
| Checkout revalidation | No payment spinner that still presents the old amount as payable | Matching result continues. Mismatch returns to Review before pay is offered | Review explanation is above the new total |
| Complimentary availability | Same as revalidation | Stale included line is not left as payable | The line's slot collapses only with the explanation above the new total |

Checkout stays disabled while the cart total is updating or absent, so the bar's amount and its button stay one state.

## 11. Design-system map

| Need | Existing pattern | Decision | Path | Reason | Accessibility | Responsive |
|---|---|---|---|---|---|---|
| Saving and total rows | Order summary definition list | Extend the row set | `OrderMoneySummaryPanel.tsx`, `snapshotPayableRows` | One summary already owns Subtotal, charges, tax, and Total payable. The lump Discount row cannot show order saving and delivery saving separately | Existing section name "Price summary" on Review and Payment. Cart amount is the visible label text | Existing full-width rows inside the current card |
| Paise display | `formatPaise` | Reuse | `format-money.ts` | Exact rupee display already used on checkout | Text amount | Same |
| Coupon field | `enterpriseFieldClass` on operator fields; customer inputs use border, `focus-ring`, and body type on checkout fields | Reuse the customer field treatment already on checkout forms | Checkout form controls and `enterpriseFieldClass` for the operator side | A new input style is unnecessary | Name, description, invalid, described-by | Full width of the summary column |
| Apply, Change, Remove, Continue | `Button` | Reuse | `src/components/ui/Button.tsx` | Primary for Apply and continue. Outline for Change. Destructive for Remove | Native button, `focus-ring`, `lg` height | Full width under the field on narrow; inline in the aside when `lg` has room, wrapping rather than a new bar |
| Sticky total and Checkout | `cart-mobile-checkout` | Extend the label and the amount source | `CartClient.tsx` | The bar already pairs an amount with Checkout below `lg` | Amount is text, not only color | `lg:hidden`, safe-area padding already present |
| Offer status sentence | `role="status"` and `role="alert"` already in `CartClient` and `PaymentPanel` | Reuse | Those clients | Text status. No new badge system | Live region as section 8 | Wraps under the field |
| Complimentary line | `CartLineList` item row | Extend with a read-only row | `CartLineList.tsx` | It is an item the customer can read. A gift card would be a new pattern | Text line, not a widget | Same stacking as other lines. No carousel |
| Customer commercial errors | Field alert under the control | Reuse checkout alert pattern | `CheckoutClient.tsx` alert markup | Money and coupon errors stay at the control. A toast is not the only copy | `role="alert"` | Same column |
| Operator fields, list, empty, loading | Editor, `EmptyState`, `LoadingState`, `Alert` | Extend fields and sentences | `PromotionsEditor.tsx`, `src/components/enterprise/*` | The commercial surface already authors Promotions and coupons | Field errors associated by description | Existing `sm` grid |
| Operator status | `StatusBadge` plus a sentence | Extend with the sentence | `StatusBadge.tsx` | Colour remains secondary | Text sentence is `role="status"` | Beside the name, wraps |
| Retire confirmation | `ConsequenceReviewDialog` | Extend confirm label and retire initial focus | `ConsequenceReviewDialog.tsx` | This is already the activate and retire review. A new modal would duplicate the trap | Existing trap. Cancel-first focus for retire, copied from `AdminConfirmDialog` | Existing `max-w-lg`, `px-4`, scroll |
| Offers hub, campaign banner, gift picker, third coupon box on Payment | None | Do not create | n/a | Approved non-destinations | n/a | n/a |

No new reusable primitive. The row model, the read-only item line, and the retire label fit the existing summary, item row, and dialog.

## 12. Traceability

Experience requirements and stories:

| XR | Design section | Stories |
|---|---|---|
| `XR-IMP-036J-001` | Flows 1 and 2, automatic row, `COPY-APPLIED-AUTO` | `US-036J-001` |
| `XR-IMP-036J-002` | Flows 3–6, 10, 11, 21; Payment read-only; failure classes | `US-036J-002`, `US-036J-007` |
| `XR-IMP-036J-003` | Flows 12–14 | `US-036J-003` |
| `XR-IMP-036J-004` | Hierarchy and flow 16 | `US-036J-004`, `US-036J-010` |
| `XR-IMP-036J-005` | Flows 7–9 and the three equal or strict sentences | `US-036J-009` |
| `XR-IMP-036J-006` | Flows 17 and the conflict row | `US-036J-013`, `US-036J-010` |
| `XR-IMP-036J-007` | Flows 19 and 20, Payment read-only | `US-036J-008`, `US-036J-002` |
| `XR-IMP-036J-008` | Flow 23 | `US-036J-011`, `US-036J-013` |
| `XR-IMP-036J-009` | Flows 24–26 | `US-036J-012` |
| `XR-IMP-036J-010` | Sections 8 and 9 | All customer stories |
| `XR-IMP-036J-011` | Microcopy privacy limits | `US-036J-002`, `US-036J-005`, `US-036J-007` |
| `XR-IMP-036J-012` | Absence, inapplicable clauses, no pickup delivery saving | `US-036J-005`, `US-036J-006` |
| `XR-IMP-036J-013` | Flow 17 equal-payable complimentary presentation | `US-036J-013` |

Acceptance scenarios stay the Product Definition's scenarios. This candidate does not change their pass conditions.

| AC | Where it is specified |
|---|---|
| `AC-036J-001-01` | Flow 1 |
| `AC-036J-001-02` | Flow 2 |
| `AC-036J-002-01` | Flow 3 |
| `AC-036J-002-02` | Flow 4 |
| `AC-036J-002-03` | Flow 11 |
| `AC-036J-002-04` | Flows 5 and 6 |
| `AC-036J-002-05` | Guest unrestricted path uses flows 3, 7, 8, or 9. It does not use the sign-in state. First-order and personal cap still use flow 5 |
| `AC-036J-002-06` | Flow 22 and shared state on Review |
| `AC-036J-002-07` | Flow 3 on Review |
| `AC-036J-002-08` | Flows 10 and 11 on Review |
| `AC-036J-002-09` | Payment read-only state |
| `AC-036J-002-10` | Flow 21 |
| `AC-036J-003-01` | Flow 12 |
| `AC-036J-003-02` | Flows 13 and 14 |
| `AC-036J-004-01` | Hierarchy and flow 16 |
| `AC-036J-005-01` | Flow 1 when the first-order Offer applies. No new-customer badge |
| `AC-036J-005-02` | Flow 2 or inapplicable copy. No history recital |
| `AC-036J-006-01` | Absence, or inapplicable with the mode clause. No delivery saving on pickup |
| `AC-036J-006-02` | Fulfilment timing change recomputes. No new scheduled-product sentence |
| `AC-036J-007-01` | Distinct invalid, expired, inapplicable, global, and personal strings |
| `AC-036J-008-01` | Flows 19 and 20 |
| `AC-036J-009-01` | Flow 7, including the approved ₹80-plus-₹40 example as a server result the screen renders |
| `AC-036J-009-02` | Flow 3, including the approved ₹90-plus-₹20 example as a server result |
| `AC-036J-009-03` | Flow 16 with a coupon order saving |
| `AC-036J-009-04` | Delivery saving only. No second order-saving row from a delivery coupon |
| `AC-036J-010-01` | Flow 16 |
| `AC-036J-010-02` | One order-saving row even when a delivery saving is also present |
| `AC-036J-010-03` | The stack is the selected result only |
| `AC-036J-010-04` | Standing ₹0 delivery has no delivery-saving row |
| `AC-036J-011-01` | Flow 23 |
| `AC-036J-012-01` | Flow 24 and operator success |
| `AC-036J-012-02` | Field errors and `COPY-DENIED` |
| `AC-036J-012-03` | Flow 26 |
| `AC-036J-012-04` | `COPY-OP-GIFT` and `COPY-OP-GIFT-INVALID` |
| `AC-036J-012-05` | `COPY-OP-SECOND` |
| `AC-036J-012-06` | `COPY-OP-RACE` |
| `AC-036J-013-01` | Flow 17 |
| `AC-036J-013-02` | Flow 23 complimentary line |
| `AC-036J-013-03` | Flow 18 |
| `AC-036J-013-04` | Complimentary conflict row |

`UNCOVERED_PRODUCT_ACS = NONE`. Acceptance semantics are unchanged.

## 13. Presentational choices finalized here

These choices stay inside approved experience. They are not new product rules.

- The empty coupon field is always present and secondary. It is not collapsed and not a hero. The external-search hypothesis stays a hypothesis. This candidate does not hide the field.
- Review does not gain a second sticky pay bar. The Cart mobile bar keeps Estimated subtotal when checkout context is incomplete, and Current total only when section 3's reused-checkout conditions hold. It does not say Total payable.
- The lump "Discount" label is replaced, in this capability's summary, by Order saving, Delivery saving, and Total saved. `formatPaise` stays the formatter.
- Retire confirmation reuses `ConsequenceReviewDialog` and takes Cancel as the initial focus.
- Complimentary presentation reuses an item row and adds no picker.
- Quantity-only threshold gaps stay hidden, because the approved sentence requires a rupee amount and a benefit, and inventing either would create money or a new promise.

## 14. Coverage audit

```text
COMPLETE_USER_FLOW = YES
DEFAULT_READY = YES
LOADING = YES
EMPTY_FIRST_USE = YES
SUCCESS = YES
VALIDATION_FAILURE = YES
UNAVAILABLE_STALE = YES
SERVER_NETWORK_FAILURE = YES
RECOVERY = YES
DISABLED = YES
DESTRUCTIVE_CONFIRMATION = YES
CONCURRENCY_CONFLICT_PRESENTATION = YES
DESKTOP = YES
MOBILE = YES
RESPONSIVE_BEHAVIOUR = YES
FINAL_MICROCOPY = YES
KEYBOARD_FOCUS = YES
ACCESSIBILITY_SEMANTICS = YES
INTERACTION_RULES = YES
PERCEIVED_PERFORMANCE = YES
DESIGN_SYSTEM_MAPPING = YES
ANALYTICS_HOOKS = YES
```

Hooks name `IMP-036J-MEASUREMENT-CANDIDATE-2` facts. They do not implement collection. The Cart Checkout control is `CART_ACTIVATION`, which is the `cart_checkout_activations` row and not a journey-fact kind. Review commit after that activation is `CART_REVIEW_REACH`. Observation evidence is read from the committed money text, not copied from the evaluation response.

```text
DESIGN_READINESS = NOT_PERFORMED
CANDIDATE_READY_FOR_INDEPENDENT_REVIEW = YES
```
