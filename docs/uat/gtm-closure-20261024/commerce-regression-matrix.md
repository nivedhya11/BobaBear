# Commerce regression matrix — GTM C1 proof closure

Non-authoritative evidence for task `BOBA_GTM_C1_REGRESSION_PROOF_CLOSURE`.
This file does not accept IMP-036J, record a Founder verdict, or name a deployed candidate.

Provenance: unique HTTP/browser assertions salvaged from historical PR #457
(`fab19f599cd11bd87a7d984a2e55d80ed79877ea`, parent draft #454) and reconciled onto
current main after merged #516 / #520 disposable GTM browser harness and #439
canonical selection-order corrective. Historical #457 / #454 are not merged by this package.

| Contract | Existing proof reused | Added in this package | Not claimed |
|---|---|---|---|
| Browse → cart → checkout → payment-start → order confirmation | `tests/e2e/customer-ordering.spec.ts`; GTM browser scheduled-delivery journey (#516/#520) | Coupon recalculation helpers inserted into that GTM journey before fake checkout | Live Razorpay. Browser success is not payment authority |
| Delivery, pickup, destination, scheduled | HTTP pickup/scheduled journeys already on main | Overlapping destination writes in `tests/customer-commerce/gtm-commerce-regression.http.integration.test.ts` | A new fulfilment mode or timing rule |
| Coupon apply, remove, recalc, eligibility, presentation | Cart coupon apply/remove in `http.integration.test.ts`; domain coupon recovery | Review browser apply, invalid code, keyboard remove, payable restoration; HTTP apply/remove totals | #385 gross/net item-line presentation |
| Promotion validity, authorization, brand separation, negative input | Admin promotions HTTP denies | Empty coupon `400 CART_INVALID_INPUT`; unknown coupon `404 CART_COUPON_UNKNOWN` | #381 intermittent promotion-create 500 |
| Checkout lifecycle, stale revision, conflict, concurrency, idempotency | Domain Race 02; checkout security; payment idempotency | Stale destination `409 CHECKOUT_CONFLICT`; ready-checkout cart change `409 CHECKOUT_CART_CHANGED`; cancelled predecessor `409 CHECKOUT_STATE_CONFLICT`; one winner for two same-revision destination writes via HTTP | #384B UAT `CHECKOUT_STATE_CONFLICT` cause. No status-code change. Cancelled-predecessor 409 does **not** explain intermittent #384B |
| Payment-start order, fake success/failure, safe retry | Existing GTM drift refuses payment-start; HTTP idempotency conflict | Payment surface stays read-only for coupons and reaches `payment-start` by keyboard | Live provider, webhook, or capture |
| Mobile, desktop, accessibility | Existing GTM unavailable-item mobile test | Desktop and mobile Review: invalid-code focus return and keyboard Remove. Desktop payment tab order excludes coupon controls. Mobile stops on Review | Founder experience UAT |
| Modifier selection-order continuity | Domain `tests/payment/gtm-391-payment-review-loop.domain.test.ts`; #439 canonical order | Disposable multi-option modifier fixture + real browser journey under `E2E_GTM_UAT_FIXTURES=1` | Bundle/nested-modifier browser proof (no customer bundle selection UI/projection) |

`FOUNDER_UAT = NOT_PERFORMED`. `NOT_DEPLOYED = YES`.
`BUNDLE_BROWSER_PROOF = BLOCKED` (no customer bundle projection/UI).
