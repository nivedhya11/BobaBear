# Payment start returns to Review

```text
STATUS: DISCOVERY_EVIDENCE
AUTHORITY: NON_AUTHORITATIVE
ISSUE: https://github.com/nivedhya11/BobaBear/issues/391
SOURCE_HEAD: a6155378b799e06a95b28c593ac1a340d7ca9245
HISTORICAL_CANDIDATE: 5773dac4ce32e342b9f0d34f9ccb9099d1d8d15a
HISTORICAL_ANCESTRY: GitHub compare, main ahead 68, behind 0, merge-base 5773dac
IMPLEMENTATION: NO
ISSUE_CLOSED: NO
PAYMENT_START_391_ROOT_CAUSE: INSUFFICIENT_EVIDENCE
PAYMENT_SIDE_EFFECTS: VERIFIED_NONE
```

This note records source and disposable-test evidence. It does not accept IMP-036J, close #391, or authorize a correction.

#391 is the equal-payable payment-start return to Review. It is not #384B (`CHECKOUT_STATE_CONFLICT`), #381, or IMP-036K.

## What the 16 October record already established

The issue records Founder screenshots at candidate `5773dac`: payable ₹952.40, then Review with “Your total changed before payment. Review the updated amount.” while ₹1,036 / ₹103.60 / ₹20 / ₹952.40 stayed on screen. A later same-day read-only inspection recorded checkout `5884a703-215c-4959-bdc5-51f0f41e9cb4`, cart revision 122, six sealed snapshots all payable ₹952.40, five HTTP 409 `CHECKOUT_REPRICED` responses, and zero payments, attempts, or provider references. The first differing snapshot field was not stored.

This batch did not query staging and did not call Razorpay. The zero-side-effect conclusion is the issue record plus the current source order: `CHECKOUT_REPRICED` from prepare or from the bind recheck is thrown before `insertAttempt` and before `provider.createExecution` (`src/server/payment/operations.ts`).

## Current pay sequence at this HEAD

1. Pay calls `startPayment` (`src/components/ordering/PaymentPanel.tsx`).
2. A matching idempotency record can replay before prepare. Otherwise `prepareCheckoutForPayment` runs.
3. Prepare rebuilds a candidate and compares it with `checkoutSnapshotsStructurallyEqual` (`src/server/checkout/prepare.ts`, `src/server/checkout/compare-snapshots.ts`).
4. Equality returns the sealed snapshot and does not create a payment. `startPayment` then rechecks inside the binding transaction (`assertScheduledSnapshotStillBindable` in `src/server/checkout/scheduled-bind.ts`).
5. Only after that recheck does the server insert the Payment and attempt, then call the provider.

`CHECKOUT_REPRICED` returns the customer to Review. `CHECKOUT_STATE_CONFLICT` stays on the payment error screen and is a different issue.

## Equal payable is not a structurally identical snapshot

The comparison includes cart revision, outlet, coupon seal, fulfilment shape, header money, lines, modifiers, bundles, charges, promotion effects, and tax components. `checkoutSnapshotsStructurallyEqual` does not compare snapshot id, checkout revision, `evaluatedAt`, `createdAt`, or child row ids. It does compare `serviceabilityEvaluatedAt` as part of fulfilment shape. `prepare.ts` copies the candidate’s `evaluatedAt`, `serviceabilityEvaluatedAt`, and `createdAt` onto the sealed comparable before that call, so those timestamps do not by themselves reject in prepare. `grandTotalPaise` is one field.

These source paths can reject payment while the displayed payable is unchanged:

| Condition | Implemented | Result before any payment row |
|---|---|---|
| Cart revision changed | Yes, before pricing | `CHECKOUT_REPRICED` |
| Line, modifier, or bundle identity changed, including a label change | Yes | `CHECKOUT_REPRICED` |
| Modifier or bundle row order only | No longer, after canonical order | Equal |
| Coupon or promotion provenance changed, including `promotionRevision` | Yes | `CHECKOUT_REPRICED` |
| Outlet or fulfilment shape changed | Yes | `CHECKOUT_REPRICED` or a serviceability code |
| Charge or tax rows differ while header totals match | Yes | `CHECKOUT_REPRICED` |
| Scheduled window, cutoff, or eligibility changed | Yes | `CHECKOUT_STATE_CONFLICT` or `CHECKOUT_REPRICED` |
| Header money changed | Yes | `CHECKOUT_REPRICED` |
| Checkout not ready, expired, or revision conflict | Yes | Not the #391 Review sentence |
| Idempotency fingerprint or existing Payment conflict | Yes | Payment error, no new attempt |
| Bind rebuild omits fulfilment timing | Yes, see below | `CHECKOUT_REPRICED` possible; not executed in this batch |

The 16 October revision was stable, so the cart-revision guard is not the recorded cause. The monetary totals on the six sealed snapshots matched, so a recorded payable change is not the cause. Neither fact identifies the field that differed.

## What later commits on this HEAD changed

`e05d55268` stops the false money sentence. Review uses “Your total changed before payment…” only when `CHECKOUT_REPRICED` is confirmed and the authoritative payable integers differ (`src/components/ordering/stale-recovery-presentation.ts`). An equal or unconfirmed payable uses “We couldn't confirm your checkout for payment…”. A `CHECKOUT_CART_CHANGED` trigger uses the cart-changed sentence. At `5773dac` the Review alert used the money sentence whenever recovery was stale.

`84a5d029f` sorts modifier and bundle selections before the positional compare. Those rows have no persisted ordinal. A cart read order that disagreed with the snapshot read order could fail with the same payable. The disposable test says it does not prove the historical staging query plan.

`#392` adds the pure `explain-snapshot-difference` helper and a diagnostic test. It is not wired into payment start. `#393` adds the default-disabled prepare observer. Neither changes accept or reject. Neither recorded the 16 October differing field: on that day `#393` was still unmerged and disabled, and `#392` was not on the payment path.

## Remaining source gap (historical) — SOURCE FIXED on current main

**Discovery-batch source (HEAD `a6155378`):** `prepareCheckoutForPayment` passed `fulfilmentTiming` into `buildCheckoutCommercialResult` (`prepare.ts`) while `assertCommercialTermsStillAccepted` did not (`scheduled-bind.ts`), so pricing could see `null` timing and reject a timing-scoped promotion at bind after prepare accepted the seal.

**Wave 2 reconcile:** that omission is **SOURCE FIXED** on current main (`fulfilmentTiming: input.snapshot.fulfilmentTiming ?? "ASAP"` at bind; covered by `tests/payment/payment-binding-fulfilment-timing.domain.test.ts`, introduced with `1a8b30e`). Do not open a new Founder authorization for that mechanism.

Whether the 16 October coupon was timing-scoped remains **unknown**. The discovery batch did not execute that path against the historical candidate.

## Disposable proof executed in this batch

`tests/payment/gtm-391-payment-review-loop.domain.test.ts`: 12 passed. Disposable database, fake payment provider. It shows order-only modifier divergence is accepted, one Payment is created for an unchanged seal, a promotion-revision change with the same payable still rejects, and a genuine price change still rejects. The disposable run reported 12 passed. Idle-connection shutdown output was not retained. The file states it does not prove the historical query plan.

Not executed here: `tests/checkout/imp036j-391-equal-payable-repricing.diagnostic.test.ts`, `tests/checkout/imp036j-391b-prepare-observer.diagnostic.test.ts`, `src/components/ordering/stale-recovery-presentation.test.ts`, `src/components/ordering/imp036j-391a-stale-recovery.checkout-client.test.tsx`.

## Smallest later correction — landed; no further authorization

The bind-timing correction described in the discovery batch (pass snapshot timing into the bind rebuild; keep structural equality; disposable ASAP/SCHEDULED regressions) **has already merged**. Retain equal-rupee-only binding as **not** authorized.

`PAYMENT_START_391_ROOT_CAUSE = INSUFFICIENT_EVIDENCE`

`PAYMENT_SIDE_EFFECTS = VERIFIED_NONE`
