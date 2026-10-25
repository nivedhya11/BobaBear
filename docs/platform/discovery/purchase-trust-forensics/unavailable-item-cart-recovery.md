# Unavailable item in Cart

```text
STATUS: DISCOVERY_EVIDENCE
AUTHORITY: NON_AUTHORITATIVE
ISSUE: https://github.com/nivedhya11/BobaBear/issues/377
SOURCE_HEAD: a6155378b799e06a95b28c593ac1a340d7ca9245
IMPLEMENTATION: NO
ISSUE_CLOSED: NO
CART_AVAILABILITY_377_CLASSIFICATION: MIXED
SCENARIO_A: CONTRACT_GAP
SCENARIO_B: CONTRACT_GAP
```

This note records source evidence for #377. It does not close the issue, change `addCartLine`, or treat the menu projection as availability authority. It is not #383, #384B, or IMP-036K.

The 8 October report was three Gangnam Style Iced Coffee Boba. Delivery checkout said “That item is temporarily unavailable.” Pickup said no location could fulfil pickup. Whether the item was unavailable before Add is unknown. A later cart of available Purple Rain Taro Boba reached pickup Review, so pickup was not globally disabled.

`3624e5ba4`, which is an ancestor of this HEAD, names the line on the cart when a delivery-outlet evaluation produced a matching problem, and adds a Pickup “Review cart” link. It does not change `addCartLine`, checkout evaluation, pickup eligibility, or the checkout error sentence.

## Scenario A — already unavailable before Add

With a serviceable delivery outlet, the menu projection keeps the row and marks `temporarily_unavailable` or `sold_out` (`src/server/customer-commerce/menu/project-customer-menu.ts`). `MenuItemRow` hides Add when `availability` is present and not `available`. Without an outlet, the availability field is omitted and Add stays enabled.

`addCartLine` calls `validateCartLineStructure` only (`src/server/cart/operations.ts`). That validator does not check assortment or availability (`src/server/cart/validate-structure.ts`). `CART_ITEM_NOT_ORDERABLE` exists as a code and is not thrown by the add path.

Accepted cart authority stores purchase intent and does not reserve availability. Checkout revalidates. Refusing the add inside `addCartLine` would change that split and needs a product and architecture decision. This batch does not recommend that edit.

```text
OBSERVED_BEHAVIOR: Menu hides Add only for a known outlet projection. The Cart API still accepts the variant.
SOURCE_EVIDENCE: MenuItemRow.tsx; cart/operations.ts; cart/validate-structure.ts
ACCEPTED_CONTRACT: IMP-020 evaluation-only availability; D-368 display availability is not orderability authority
CLASSIFICATION: CONTRACT_GAP
CUSTOMER_IMPACT: A direct or stale client can place the line and meet the checkout rejection later
SECURITY_AND_COMMERCIAL_CONSTRAINT: Availability stays outlet-scoped. Add does not reserve stock. Checkout remains the purchase gate
SAFE_RECOMMENDED_CORRECTION: Leave addCartLine unchanged
REQUIRED_AUTHORIZATION: A server-side add refusal needs an explicit decision
```

## Scenario B — available at Add, unavailable later

`getActiveCart` returns stored lines and does not recheck availability. Revalidation runs at cart evaluation after a delivery location selects an outlet, at checkout evaluation per line, at pickup eligibility, and again in payment prepare.

Domain problems carry `cartLineId`. Checkout HTTP uses the first problem code and the customer sentence does not include the product name. “That item is temporarily unavailable.” is `CHECKOUT_TEMPORARILY_UNAVAILABLE` in `src/components/ordering/error-copy.ts`. Evaluation does not delete other lines. The customer can remove or edit the line on the cart.

Pickup eligibility requires every cart line to be fulfilable at that outlet. One unavailable line at every otherwise eligible outlet produces the same screen as no pickup location. The alert in `CheckoutPickupOutletStep.tsx` is “Not available: No BOBA Bear location can take this order for pickup right now. Delivery remains available if your address is serviceable.” “Review cart” does not name the item. Cart naming still requires a delivery-outlet evaluation, so returning from that pickup screen can show the line without the name.

Payment prepare turns merchandise problems into `CHECKOUT_REPRICED` before any payment row (`prepare.ts`). The server message is “Merchandise terms changed; Checkout must be re-evaluated.” `error-copy.ts` maps `CHECKOUT_REPRICED` to “The scheduled time or cancellation terms changed. Review the updated details and confirm again. Your time, outlet, mode, items, and destination were not changed for you.” Payment start does not show that sentence. `PaymentPanel` routes `CHECKOUT_REPRICED` to Review, and the visible sentence is the stale-recovery copy: the neutral sentence when the resealed payable is equal, and the money sentence only when the payable integers differ. Neither names the item. Ready checkout returns to draft. Lines stay.

Sold-out at one outlet is not global. Pickup walks each active outlet. Menu reads use the effective menu version only.

```text
OBSERVED_BEHAVIOR: The bad line is blocked and other lines remain. Checkout, empty pickup, and payment prepare do not name the line.
SOURCE_EVIDENCE: checkout/evaluate.ts; pickup-eligibility.ts; CheckoutPickupOutletStep.tsx; checkout/prepare.ts; error-copy.ts; cart-line-problem-presentation.ts
ACCEPTED_CONTRACT: ADR-006 no silent removal; IMP-036H AC-036H-032 and AC-036H-038; IMP-026C keeps other items and allows removal
CLASSIFICATION: CONTRACT_GAP
CUSTOMER_IMPACT: The customer cannot see which line failed from the checkout or pickup sentence. Payment-start recovery does not name the line. It uses the neutral or money sentence.
SECURITY_AND_COMMERCIAL_CONSTRAINT: Do not pay for unavailable merchandise. Do not delete unaffected lines. Do not invent an outlet or switch fulfilment.
SAFE_RECOMMENDED_CORRECTION: Name the existing problem line with the accepted item sentence on checkout, on the empty pickup list when merchandise caused it, and on payment recovery. Keep Review cart and the other lines.
REQUIRED_AUTHORIZATION: Presentation under the locked cart, checkout, and pickup contracts. A new customer code, or a change to the meaning of CHECKOUT_REPRICED, needs a decision.
```

## Disposable proof executed in this batch

`src/components/ordering/availability-377-recovery.test.tsx`: 10 passed. It covers cart naming and the Review cart link. It does not prove the 8 October cart.

Proposed later, not added:

- `tests/cart/add-line-ignores-availability.domain.test.ts` — current behavior: a structurally valid unavailable variant is added; other lines remain. Do not assert a new rejection.
- `src/components/ordering/checkout-item-availability-recovery.test.tsx` — delivery checkout sentence does not name the line; the other line remains.
- `tests/checkout/pickup-item-unavailable-eligibility.domain.test.ts` — unavailable at one outlet leaves the other; unavailable at every pickup outlet yields the empty list while pickup stays enabled.

`CART_AVAILABILITY_377_CLASSIFICATION = MIXED`
