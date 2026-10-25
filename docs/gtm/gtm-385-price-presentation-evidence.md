# IMP-036J #385 — price presentation evidence

**Non-authoritative design evidence.** This note does not change ROADMAP, STATE, the decision register, architecture, product definition, or experience definition. It does not select Option A or Option B. Founder UAT is not granted. IMP-036J is not accepted. IMP-036K is not authorized. Production money labels, price math, API contracts, and checkout totals are unchanged.

Issue: [nivedhya11/BobaBear#385](https://github.com/nivedhya11/BobaBear/issues/385). Wave: [nivedhya11/BobaBear#450](https://github.com/nivedhya11/BobaBear/issues/450) Agent C.

Authorities read for this preparation: VISION-1, GTM-R190, STATE-R189 (`acceptedThrough` IMP-036I, `currentProductSlice` IMP-036J, Founder UAT `NOT_PERFORMED`), ARCH-R23, DR-25, PD-2, TEST-1, `PD-IMP-036J-DRAFT-6`, `XD-IMP-036J-DRAFT-6`, EXP-1, LANG-1.

## What was observed

The 2026-10-08 delivery coupon review is arithmetically consistent. No other prices are introduced here.

| Row | Amount |
|---|---|
| Merchandise subtotal | ₹518.00 |
| Order saving (10%) | ₹51.80 |
| Item line, 2 × Purple Rain Taro Boba | ₹466.20 |
| Packaging | ₹20.00 |
| Total payable | ₹486.20 |

₹518.00 − ₹51.80 = ₹466.20, and ₹466.20 + ₹20.00 = ₹486.20. The review reported one merchandise line, so the item gross and the merchandise subtotal are the same ₹518.00 in that screenshot. That session did not record `lineSubtotalPaise` separately. Tax was not shown.

A second screenshot with an empty coupon field showed the item line ₹518.00, subtotal ₹518.00, packaging ₹20.00, and payable ₹538.00. The item line and the subtotal matched when there was no saving.

The defect is unlabeled mixing: the item line is net of the merchandise saving, and Subtotal is gross merchandise.

## What the customer is required to understand

`AC-036J-004-01` requires the merchandise or order discount, a coupon-backed offer when one applied, a delivery saving only when it has a real monetary effect, total saved, and the payable amount. It does not require a gross item line.

`BR-036J-004` forbids a fabricated reference price. `XD-IMP-036J-DRAFT-6` orders the review as item amounts, then order saving, then a delivery charge and delivery saving only when that saving is real, then the total. LANG-1 requires exact money, savings that match the priced outcome, and precise checkout language. EXP-1 treats this as X3 money and trust presentation. D-368 keeps menu display price distinct from the sealed payable amount.

## Server gross projection

| Discount / factor | Exact gross on a customer surface? | Evidence |
|---|---|---|
| Percentage | Checkout snapshot only, and only as a second price resolution that a harness fixture checks against snapshot merchandise totals. Not re-executed in this preparation. | `tests/checkout/imp036j-385-line-presentation-options.fixture.test.ts` asserts `lineSubtotalPaise` identity for a 10% harness line. |
| Fixed amount | Same checkout snapshot field and the same fixture. | That fixture's fixed-amount case. |
| BOGO (`buy_x_get_y`) | Same. The fixture covers two units of one variant and no modifiers. BOGO is required to leave modifiers and bundle deltas out of the benefit (`src/shared/promotions/benefit.ts`). | That fixture's buy-1-get-1 case. |
| Complimentary | Not proven. The gift line stores `lineSubtotalPaise` from the gift allocation amount, or 0 when that allocation is absent. The #385 fixture does not cover it. No complimentary rupee amount was observed, so none is shown. | `src/server/checkout/adapters/pricing.ts` gift line construction. |
| Modifiers | Line-level modifier total is included in `lineSubtotalPaise` by a second `resolveModifierPriceDelta` call. Each modifier row on the snapshot stores `unitDeltaPaise: 0`, so per-modifier prices are not projected. | `pricing.ts` `estimateLineModifiers` and the modifier draft. The fixture's modifier case was not re-run here. |
| Tax | Order tax on the quote is exact. Per-line tax on the snapshot is integer proportional division of that order tax, with any remainder forced onto the last line. The tax engine's own per-line allocations are computed and then dropped before the quote is returned. | `pricing.ts` proportional split; `src/server/pricing/quote.ts` `taxGrandTotal` return value; `src/server/pricing/tax.ts` largest-remainder allocations. |
| Cart | No. Cart item amounts are menu display price × quantity, plus modifier display deltas, in the browser. | `src/components/ordering/cart-presentation.ts`. |
| Order confirmation and order detail | No. Confirmation lists names without a line price. Detail shows `lineTotalMinor`, which is the net `lineTotalPaise`. Gross is not on the order projection. | `src/components/ordering/OrderConfirmationClient.tsx`, `OrderDetailClient.tsx`, `src/server/order/projections.ts`. |

Checkout evaluate does put the full snapshot, including `lineSubtotalPaise`, on the JSON response (`src/server/checkout/evaluate.ts` returns `snapshot`; `src/server/customer-commerce/http/response.ts` serializes bigint as a decimal string). The customer line narrower keeps only `lineTotalPaise` (`src/components/ordering/checkout-line-presentation.ts`). The pricing quote itself does not return per-line gross components (`buildDirectPricingQuote` returns order totals, allocations, and aggregate tax components).

The checkout adapter's own comment says the per-line decomposition is approximate and that quote components are not exposed. It then resolves prices again and splits tax by integer proportion. A checked-in PostgreSQL fixture asserts that, for its percentage, fixed, BOGO, and modifier cases, those snapshot fields still add back to the snapshot merchandise and discount totals. This preparation did not re-run that harness. That fixture is not a Founder observation and its harness prices are not repeated here.

Because cart and purchased-order surfaces do not carry an exact gross, and because per-line tax is not the tax engine's line allocation, Option A is not proven for every supported case.

## Option A — gross item line, saving only in the summary

Where a figure exists, the item shows the gross amount and does not say "After discount". Subtotal, Order saving, Packaging, and Total payable stay separate.

For the observed review that is:

- 2 × Purple Rain Taro Boba — ₹518.00
- Subtotal ₹518.00
- Order saving ₹51.80
- Packaging ₹20.00
- Total payable ₹486.20

The ₹518.00 item amount is the observed subtotal used as the single reported line's gross. It is not a captured `lineSubtotalPaise` from that session.

The zero-discount review shows ₹518.00 on both the item and Subtotal, packaging ₹20.00, and payable ₹538.00, with no saving row.

Pickup, stacked merchandise-plus-delivery, and complimentary gross amounts were not observed. The comparison leaves those amounts blank. A complimentary line stays "Included with your offer"; Option A does not invent its list price. A delivery saving, when one exists, stays a summary row. It is not folded into the item.

Option A is clearer arithmetic on a single checkout review line. It is not the lowest-risk change: showing it on cart would reconstruct from menu display prices, and showing it on confirmation or history would add a field the order projection does not have.

## Option B — net item line, labelled only when a merchandise saving applies

The item keeps the net amount already rendered. The words "After discount" are visible text on that price, so a screen reader reads them with the amount. They are not an `aria-label` that can drift from the visible words, and they are not hidden.

For the observed review:

- 2 × Purple Rain Taro Boba — After discount ₹466.20
- Subtotal ₹518.00
- Order saving ₹51.80
- Packaging ₹20.00
- Total payable ₹486.20

The zero-discount review does not say "After discount", because the item already equals Subtotal.

A complimentary line keeps "Included with your offer" and ₹0.00. It does not say "After discount". A delivery-only saving does not label the merchandise line. Pickup omits Delivery and Delivery saving. No pickup, stacked, or complimentary rupee amount is filled in.

Cart item lines are already menu gross, so this label belongs on the checkout review and on order detail, where the line is the net `lineTotalPaise`. Confirmation currently shows no line price; the purchased saving sentence and the payment summary stay the payable explanation there.

## Mobile, desktop, and accessible reading

The isolated comparison renders at 390px and at 1280px. Rows wrap, amounts stay on one line, and labels are real text. Reading order is the item list, then a second list named Price summary. Each summary row is visible text, for example “Subtotal” beside “₹518.00”, so the label and the amount are announced together. There is no interactive control in the prototype, so there is no extra tab stop. The offer amount is not a live region.

Screenshots of that static page, not of production checkout:

- `docs/gtm/evidence/gtm-385-option-comparison-mobile.png` (390px)
- `docs/gtm/evidence/gtm-385-option-comparison-desktop.png` (desktop)

The assertions live in `tests/gtm-closure/gtm-385-price-presentation-evidence.test.tsx`. That test does not import checkout, cart, or order components.

## Cart, review, and confirmation

| Surface | Item amount today | Matches the observed review? |
|---|---|---|
| Cart | Browser menu display price × quantity | Not the sealed net. A discounted review can show a lower item line than the cart. |
| Checkout review | Snapshot `lineTotalPaise` (net, plus proportional line tax) | This is the unlabeled ₹466.20. |
| Payment summary | Same snapshot rows: merchandise subtotal, saving, charges, tax, payable | Subtotal stays gross. |
| Confirmation | Item names, no line price; "You saved" from the customer saving; payment summary | The line-price mismatch is absent because the line price is absent. |
| Order detail | `lineTotalMinor` (net) plus the payment summary | Same net-versus-gross pairing as review, still unlabeled. |

Delivery versus pickup changes the summary, not the item-line rule: pickup has no delivery charge and no delivery saving (`CommercialOfferStack`). No pickup screenshot prices were available.

## Recommendation

**Option B.**

Option A needs an exact server gross on every surface that would show it, including modifiers and taxes, with no client reconstruction. Checkout snapshot `lineSubtotalPaise` is a second resolution the adapter itself describes as approximate; per-line tax is not the tax engine allocation; modifier unit prices on the snapshot are zero; complimentary gross is not in the fixture; cart gross is a menu-price reconstruction; confirmation and order detail do not project gross. Option B explains the observed ₹466.20 with a visible "After discount" label and leaves Subtotal, Order saving, and Total payable as they are. It does not add a price the server did not show.

No Founder choice is recorded by this recommendation.

## Founder decision question

Should checkout review keep the sealed net item amount and add the visible words "After discount" only when that line has a merchandise saving (Option B), or show a gross item amount and leave the saving only in the price summary (Option A)? In the observed delivery review, Option B reads "2 × Purple Rain Taro Boba, After discount ₹466.20" beside Subtotal ₹518.00, Order saving ₹51.80, Packaging ₹20.00, and Total payable ₹486.20; the empty-coupon review stays unlabeled at item ₹518.00 and Subtotal ₹518.00. Option A would show that item as ₹518.00 and would not say "After discount". Option A is not proven for cart, complimentary items, per-modifier prices, per-line tax, or order history, and it must not be built by recalculating prices in the browser. Complimentary lines stay "Included with your offer" at ₹0, and a delivery saving stays on its own row. This question does not authorize a production label, a pricing change, a Founder UAT pass, or IMP-036J acceptance.

## Production impact

`PRODUCTION_UI_CHANGED: NO`

`MERGE NOT AUTHORIZED`
