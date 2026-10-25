# #384B CHECKOUT_STATE_CONFLICT — diagnostic record

Status: diagnostic only. No checkout-state correction. MERGE NOT AUTHORIZED.
Base: `a6155378b799e06a95b28c593ac1a340d7ca9245`.
Issue: https://github.com/nivedhya11/BobaBear/issues/384 section #384B.
Wave: https://github.com/nivedhya11/BobaBear/issues/450 Agent B.

This file is investigation evidence. It does not change ROADMAP, STATE, acceptance, or product policy.

## What was not reproduced

The legal customer delivery sequence does not return `CHECKOUT_STATE_CONFLICT`.

```text
POST /api/v1/checkouts
POST /api/v1/checkouts/{checkoutId}/fulfilment   fulfilmentMode=DELIVERY
PUT  /api/v1/checkouts/{checkoutId}/destination  saved address, current revision
POST /api/v1/checkouts/{checkoutId}/evaluate     revision returned by destination
```

On disposable migrated PostgreSQL that sequence ends `READY_FOR_PAYMENT`, timing `ASAP`, scheduled windows null, one snapshot, positive `grand_total_paise`. The original staging request (`requestId` `17ec3b22-348c-4bbe-8b18-cb193cf9a688`) was not replayed. Its method and path were not in this workspace. No staging or live Razorpay call was made.

## Binding rules

| Rule | Authority |
|---|---|
| Mutable checkout lifecycle is `DRAFT \| READY_FOR_PAYMENT \| PAYMENT_PENDING \| COMPLETED \| CANCELLED \| EXPIRED` | `docs/platform/accepted-foundation-operating-rules.md` Checkout domain (IMP-021) |
| Stale `expectedCheckoutRevision` on a still-mutable row is `CHECKOUT_CONFLICT` | same; `src/server/checkout/destination.ts`, `src/server/checkout/evaluate.ts` |
| Destination, fulfilment, and evaluate reject `PAYMENT_PENDING` and terminal rows as `CHECKOUT_STATE_CONFLICT` before the revision comparison | `src/server/checkout/destination.ts` `assertMutablePrePayment`; `src/server/checkout/fulfilment.ts`; `src/server/checkout/evaluate.ts` phase 1 |
| Cart revision drift on `DRAFT` or `READY_FOR_PAYMENT` cancels that checkout and inserts a new `DRAFT` | `src/server/checkout/operations.ts` `startCheckout` |
| `ASAP` windows are null; `SCHEDULED` must be a server-eligible window before it is stored | `docs/platform/capabilities/IMP-036I-scheduled-fulfilment.md` §6; `drizzle/0045_imp036i_scheduled_fulfilment_foundations.sql`; `src/server/checkout/scheduled-eligibility.ts` |
| Timing is orthogonal to `DELIVERY \| PICKUP` | D-379 / ADR-019 |
| Customer copy for this code is “Checkout isn't in a state that can continue.” | `src/components/ordering/error-copy.ts` |
| Domain failures are logged as operation `commerce`, not the route name | `src/server/customer-commerce/http/router.ts` catch |

Client actions that reach those routes are in `src/components/ordering/CheckoutClient.tsx` (`chooseFulfilmentMode`, `applyDestinationDraft`, `continuePickupWithOutlet`, `confirmTiming`, `rebaseReviewAfterCouponMutation`) and `src/lib/customer-commerce/checkout.ts`.

## Reproduced guards

Disposable HTTP + migrated PostgreSQL. Each 409 body carries `requestId` equal to `X-Request-ID` and no `message`.

1. **Stale revision is not this code.** After a successful `PUT` destination, `POST` evaluate with the pre-destination revision returns `409 CHECKOUT_CONFLICT`. Status stays `DRAFT`. Revision, timing, and snapshot count stay unchanged.

2. **Predecessor cancelled after destination, before evaluate.** `PUT` destination succeeds on checkout A (`DRAFT`). `PATCH` cart line quantity advances the cart revision. `POST /api/v1/checkouts` cancels A and inserts checkout B. A is `CANCELLED` and its revision is one greater than the destination response. `POST` evaluate and `PUT` destination on A, both using the destination revision, return `409 CHECKOUT_STATE_CONFLICT`. A’s row and snapshot count do not change. B stays `DRAFT` with the new cart revision and no snapshot. `POST` evaluate on B returns `409 CHECKOUT_DESTINATION_REQUIRED`, which is a different code at the same HTTP status.

3. **Overlapping destination writes.** Two concurrent `PUT` destination calls with the same revision and different addresses: one `200`, one `409 CHECKOUT_CONFLICT`. The row gains exactly one revision. It stays `DRAFT` / `ASAP` with no snapshot.

4. **Ineligible scheduled window between destination and evaluate.** `POST` fulfilment-timing with a manufactured 1999 window returns `409 CHECKOUT_STATE_CONFLICT` and does not write timing. The following evaluate with the current revision still reaches `READY_FOR_PAYMENT`.

5. **Delivery to pickup without an outlet.** After a ready delivery snapshot, `POST` fulfilment `PICKUP` returns `200` and moves the row `READY_FOR_PAYMENT` → `DRAFT`. `POST` evaluate returns `400 PICKUP_OUTLET_REQUIRED`, not `CHECKOUT_STATE_CONFLICT`. The prior snapshot row remains; `active_snapshot_id` is null.

6. **Payment pending.** Fake provider only. After `POST /api/v1/payments` leaves the checkout `PAYMENT_PENDING`, `PUT` destination and `POST` evaluate with the current revision both return `409 CHECKOUT_STATE_CONFLICT`. Status, revision, active snapshot, and `grand_total_paise` are unchanged. The fake provider is not called again.

7. **Tenant.** The other customer’s `PUT` destination returns `404 CHECKOUT_NOT_FOUND` and does not change the owner’s row.

## Why no source correction

Every reproduced `CHECKOUT_STATE_CONFLICT` matches the accepted lifecycle or scheduled-window guard. The legal delivery sequence does not emit it. Choosing one staging explanation (cancelled predecessor, payment pending, or an ineligible window) would be an assumption. A client retry, a swallowed 409, a new checkout state, or a weaker guard is not authorized.

The first diagnostic assertion expected HTTP 400 for a successor with no destination. The server returned HTTP 409 `CHECKOUT_DESTINATION_REQUIRED`. That assertion was corrected to the existing code. It is not a product change.

## Evidence limit

Successful route logs name `set_checkout_destination` and `evaluate_checkout`. A thrown domain error is recorded as operation `commerce` plus `safeOutcomeCode`. That is why the original method and path stayed unknown. Changing that log field is outside this checkout-transition scope.
