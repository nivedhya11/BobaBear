# Commerce regression matrix — GTM UAT preparation

Non-authoritative evidence for task `BOBA-GTM-REGRESSION-CLOSURE-20261025`.
This file does not accept IMP-036J, record a Founder verdict, or name a deployed candidate.

Parent stack: pull request #454 at `9d4a9c5d79b537b03981bec555137fa872ee1bf1`, which already integrates #445 and #446 onto main `a6155378b799e06a95b28c593ac1a340d7ca9245`.

| Contract | Existing proof reused | Added in this package | Not claimed |
|---|---|---|---|
| Browse → cart → checkout → payment-start → order confirmation | `tests/e2e/customer-ordering.spec.ts` guest ordering and `GJ-FIRST-ORDER`; GTM browser scheduled-delivery journey | Coupon recalculation is inserted into that GTM journey before the existing fake checkout | Live Razorpay. Browser success is not payment authority |
| Delivery, pickup, destination, scheduled | HTTP pickup evaluation in `tests/customer-commerce/http.integration.test.ts`; scheduled HTTP in `tests/customer-commerce/scheduled-http.tranche3.integration.test.ts`; pickup and scheduled browser journeys already named above | Overlapping destination writes in `tests/customer-commerce/gtm-commerce-regression.http.integration.test.ts` | A new fulfilment mode or timing rule |
| Coupon apply, remove, recalc, eligibility, presentation | Cart coupon apply/remove in `http.integration.test.ts`; domain coupon recovery tests | Review browser apply, invalid code, keyboard remove, payable restoration; HTTP apply/remove totals | #385 gross/net item-line presentation. The existing #385 fixture test stays evidence only |
| Promotion validity, authorization, brand separation, negative input | `tests/administration/admin-promotions-http.integration.test.ts` denies another brand and an unauthorized operator | Empty coupon `400 CART_INVALID_INPUT`; unknown coupon `404 CART_COUPON_UNKNOWN` | #381 intermittent promotion-create 500. Deterministic invalid-shape work stays on unmerged #452 |
| Checkout lifecycle, stale revision, conflict, concurrency, idempotency | `tests/checkout-concurrency/checkout.concurrency.test.ts`; `tests/checkout-security/checkout.security.test.ts`; payment idempotency replay in `http.integration.test.ts` | Stale destination `409 CHECKOUT_CONFLICT`; ready-checkout cart change `409 CHECKOUT_CART_CHANGED`; cancelled predecessor `409 CHECKOUT_STATE_CONFLICT`; one winner for two same-revision destination writes | #384B UAT `CHECKOUT_STATE_CONFLICT` cause. No status-code change |
| Payment-start order, fake success/failure, safe retry | `tests/e2e/customer-ordering.spec.ts` dismiss, provider failure, retry with a new provider order; GTM browser drift refuses payment-start with provider open count 0; HTTP idempotency conflict `409 PAYMENT_IDEMPOTENCY_CONFLICT` | Payment surface stays read-only for coupons and reaches `payment-start` by keyboard | Live provider, webhook, or capture |
| Mobile, desktop, accessibility | Existing GTM unavailable-item mobile test; customer-ordering responsive keyboard proof | Desktop and mobile Review: invalid-code focus return and keyboard Remove. Desktop payment tab order excludes coupon controls. Mobile stops on Review | Founder experience UAT |

`FOUNDER_UAT = NOT_PERFORMED`. `NOT_DEPLOYED = YES`.
