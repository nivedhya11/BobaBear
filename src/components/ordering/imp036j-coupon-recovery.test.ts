/**
 * IMP-036J #383 / #384A presentation and Review commercial-currency helpers.
 */
import { describe, expect, it } from "vitest";

import { couponStatusCopy } from "./commercial-explanation-presentation";
import {
  couponFieldStatusFromMutationFailure,
  definitiveCouponFailureCopy,
  isIncompleteCouponTransport,
  isReviewCommercialCurrent,
} from "./coupon-result-presentation";
import { IMP036J_COPY } from "./imp036j-copy";

describe("IMP-036J #383/#384A coupon recovery presentation", () => {
  it("maps delivery-only mode mismatch on PICKUP to the approved inapplicable sentence", () => {
    expect(
      couponStatusCopy({
        fulfilmentMode: "PICKUP",
        explanation: {
          couponPresentationClass: null,
          merchandiseOrOrderSavingPaise: "0",
          deliverySavingPaise: "0",
          totalSavedPaise: "0",
          grandTotalPaise: "19900",
          thresholdProgress: null,
          complimentary: null,
          submittedCouponResult: {
            status: "NOT_APPLICABLE",
            reasonCode: "FULFILMENT_MODE_MISMATCH",
            canonicalCode: "TEST123",
          },
        },
      })?.text,
    ).toBe(IMP036J_COPY.INAPPLICABLE_DELIVERY);
  });

  it("maps engine COUPON_NOT_EFFECTIVE to expired, not generic invalid", () => {
    expect(
      couponStatusCopy({
        explanation: {
          couponPresentationClass: null,
          merchandiseOrOrderSavingPaise: "0",
          deliverySavingPaise: "0",
          totalSavedPaise: "0",
          grandTotalPaise: "19900",
          thresholdProgress: null,
          complimentary: null,
          submittedCouponResult: {
            status: "INVALID",
            reasonCode: "COUPON_NOT_EFFECTIVE",
            canonicalCode: "OLD",
          },
        },
      })?.text,
    ).toBe(IMP036J_COPY.EXPIRED);
  });

  it("treats CHECKOUT_COUPON_INELIGIBLE as definitive inapplicable, not RETRY", () => {
    expect(definitiveCouponFailureCopy("CHECKOUT_COUPON_INELIGIBLE")).toBe(
      IMP036J_COPY.INAPPLICABLE,
    );
    expect(couponFieldStatusFromMutationFailure("CHECKOUT_COUPON_INELIGIBLE")).toMatchObject({
      text: IMP036J_COPY.INAPPLICABLE,
      invalid: true,
      retryVisible: false,
    });
    expect(isIncompleteCouponTransport("CHECKOUT_COUPON_INELIGIBLE")).toBe(false);
  });

  it("keeps indeterminate post-mutation evaluation on RETRY and incomplete transport", () => {
    expect(
      couponFieldStatusFromMutationFailure("CHECKOUT_PROMOTION_INDETERMINATE"),
    ).toMatchObject({
      text: IMP036J_COPY.RETRY,
      retryVisible: true,
      invalid: false,
    });
    expect(isIncompleteCouponTransport("CHECKOUT_PROMOTION_INDETERMINATE")).toBe(true);
    expect(isIncompleteCouponTransport("NETWORK_ERROR")).toBe(true);
  });

  it("does not treat a prior quote as current after cart revision advances", () => {
    expect(
      isReviewCommercialCurrent({
        cartRevision: "3",
        snapshotSourceCartRevision: "2",
        hasReviewQuote: true,
      }),
    ).toBe(false);
    expect(
      isReviewCommercialCurrent({
        cartRevision: "3",
        snapshotSourceCartRevision: "3",
        hasReviewQuote: false,
      }),
    ).toBe(false);
    expect(
      isReviewCommercialCurrent({
        cartRevision: "3",
        snapshotSourceCartRevision: "3",
        hasReviewQuote: true,
      }),
    ).toBe(true);
  });
});
