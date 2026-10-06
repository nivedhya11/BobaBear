import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { CommercialOfferStack } from "./CommercialOfferStack";
import { CouponField } from "./CouponField";
import { IMP036J_COPY } from "./imp036j-copy";
import {
  automaticStatusCopy,
  canReuseCheckoutEvaluation,
  couponStatusCopy,
  hasAuthoritativeSaving,
  offerDroppedFromAuthoritativeExplanations,
  sealedPaymentExplanationFromSnapshot,
  thresholdCopy,
} from "./commercial-explanation-presentation";
import {
  couponFieldStatusFromMutationFailure,
  definitiveCouponFailureCopy,
} from "./coupon-result-presentation";
import { PaymentReturnClient } from "./PaymentReturnClient";
import { PaymentPanel } from "./PaymentPanel";
import type { CommerceCheckout, CommerceCheckoutSnapshot } from "@/lib/customer-commerce";
import { CHARGE_DEFINITION_DELIVERY_ID } from "@/shared/pricing";

const CANONICAL_DELIVERY_COMPONENT_ID = `charge:${CHARGE_DEFINITION_DELIVERY_ID}`;
const { liveReevaluation } = vi.hoisted(() => ({
  liveReevaluation: vi.fn(() => {
    throw new Error("live promotion evaluation must not reconstruct payment truth");
  }),
}));

vi.mock("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock("@/lib/customer-auth/client", () => ({
  fetchCustomerSession: vi.fn(async () => ({
    ok: true,
    data: { authenticated: true },
  })),
}));

vi.mock("@/lib/customer-commerce", async () => {
  const actual = await vi.importActual<typeof import("@/lib/customer-commerce")>(
    "@/lib/customer-commerce",
  );
  return {
    ...actual,
    getPaymentState: vi.fn(async () => ({
      ok: true,
      data: { state: { payment: { status: "PENDING" }, checkoutStatus: "PAYMENT_PENDING" } },
    })),
    listCustomerOrders: vi.fn(async () => ({ ok: true, data: { items: [] } })),
    startPayment: vi.fn(),
    retryPayment: vi.fn(),
    evaluateCart: liveReevaluation,
    evaluateCheckout: liveReevaluation,
    readPaymentRecovery: vi.fn(() => null),
    clearPaymentRecovery: vi.fn(),
    readOrCreateStartIdempotencyKey: vi.fn(() => "idem"),
    readOrCreateRetryIdempotencyKey: vi.fn(() => "idem"),
    readOrCreateZeroPayableIdempotencyKey: vi.fn(() => "idem"),
  };
});

vi.mock("@/lib/razorpay", () => ({
  loadRazorpayCheckoutScript: vi.fn(),
  openRazorpayStandardCheckout: vi.fn(),
  parseRazorpayStandardCheckoutAction: vi.fn(),
  RAZORPAY_STANDARD_CHECKOUT_KIND: "razorpay",
}));

describe("IMP-036J Tranche 5 customer presentation", () => {
  it("renders Estimated subtotal without Total payable or invented delivery", () => {
    render(
      <CommercialOfferStack
        explanation={null}
        payableLabel={IMP036J_COPY.ESTIMATED_SUBTOTAL}
        payablePaise="19900"
      />,
    );
    expect(screen.getByText(IMP036J_COPY.ESTIMATED_SUBTOTAL)).toBeInTheDocument();
    expect(screen.queryByText(IMP036J_COPY.TOTAL_PAYABLE)).not.toBeInTheDocument();
    expect(screen.queryByText(IMP036J_COPY.DELIVERY_ROW)).not.toBeInTheDocument();
    expect(screen.getByRole("region", { name: IMP036J_COPY.PRICE_SUMMARY })).toBeInTheDocument();
  });

  it("renders Current total without calling it Total payable", () => {
    render(
      <CommercialOfferStack
        explanation={null}
        payableLabel={IMP036J_COPY.CURRENT_CHECKOUT_TOTAL}
        payablePaise="24900"
        deliveryChargePaise="4000"
      />,
    );
    expect(screen.getByText(IMP036J_COPY.CURRENT_CHECKOUT_TOTAL)).toBeInTheDocument();
    expect(screen.queryByText(IMP036J_COPY.TOTAL_PAYABLE)).not.toBeInTheDocument();
  });

  it("renders Review Total payable and server threshold gap without client subtraction", () => {
    render(
      <CommercialOfferStack
        explanation={{
          couponPresentationClass: null,
          merchandiseOrOrderSavingPaise: "0",
          deliverySavingPaise: "0",
          totalSavedPaise: "0",
          grandTotalPaise: "19900",
          thresholdProgress: {
            remainingAmountPaise: "5000",
            remainingItemQuantity: null,
            displayName: "free delivery",
            benefitType: "delivery_fee_waiver",
          },
          complimentary: null,
          submittedCouponResult: null,
        }}
        payableLabel={IMP036J_COPY.TOTAL_PAYABLE}
        payablePaise="19900"
      />,
    );
    expect(screen.getByText(IMP036J_COPY.TOTAL_PAYABLE)).toBeInTheDocument();
    expect(screen.getByText("Add ₹50.00 more to unlock free delivery.")).toBeInTheDocument();
  });

  it("does not invent a delivery-saving row for standing ₹0 delivery", () => {
    render(
      <CommercialOfferStack
        explanation={{
          couponPresentationClass: null,
          merchandiseOrOrderSavingPaise: "8000",
          deliverySavingPaise: "0",
          totalSavedPaise: "8000",
          grandTotalPaise: "11900",
          thresholdProgress: null,
          complimentary: null,
          submittedCouponResult: null,
        }}
        payableLabel={IMP036J_COPY.TOTAL_PAYABLE}
        payablePaise="11900"
        deliveryChargePaise="0"
      />,
    );
    expect(screen.getByText(IMP036J_COPY.ORDER_SAVING_ROW)).toBeInTheDocument();
    expect(screen.queryByText(IMP036J_COPY.DELIVERY_SAVING_ROW)).not.toBeInTheDocument();
  });

  it("maps coupon presentation classes to locked copy and never says better price on equal payable", () => {
    expect(
      couponStatusCopy({
        explanation: {
          couponPresentationClass: "COUPON_APPLIED",
          merchandiseOrOrderSavingPaise: "8000",
          deliverySavingPaise: "0",
          totalSavedPaise: "8000",
          grandTotalPaise: "11900",
          thresholdProgress: null,
          complimentary: null,
          submittedCouponResult: { status: "APPLIED", reasonCode: "APPLIED", canonicalCode: "SAVE" },
        },
      })?.text,
    ).toBe(IMP036J_COPY.APPLIED_COUPON);
    expect(
      couponStatusCopy({
        explanation: {
          couponPresentationClass: "COUPON_VALID_NOT_SELECTED",
          merchandiseOrOrderSavingPaise: "9000",
          deliverySavingPaise: "0",
          totalSavedPaise: "9000",
          grandTotalPaise: "10900",
          thresholdProgress: null,
          complimentary: null,
          submittedCouponResult: {
            status: "VALID_BUT_NOT_SELECTED",
            reasonCode: "COUPON_VALID_BUT_NOT_SELECTED",
            canonicalCode: "SAVE",
          },
        },
      })?.text,
    ).toBe(IMP036J_COPY.STRICT_KEEP);
    const equalSelected = couponStatusCopy({
      explanation: {
        couponPresentationClass: "COUPON_EQUAL_PAYABLE_SELECTED",
        merchandiseOrOrderSavingPaise: "0",
        deliverySavingPaise: "0",
        totalSavedPaise: "0",
        grandTotalPaise: "19900",
        thresholdProgress: null,
        complimentary: {
          competingOffers: "NONE",
          productId: "p",
          variantId: "v",
          quantity: 1,
          merchandiseChargePaise: "0",
        },
        submittedCouponResult: {
          status: "VALID_BUT_NOT_SELECTED",
          reasonCode: "COUPON_VALID_BUT_NOT_SELECTED",
          canonicalCode: "GIFT",
        },
      },
    });
    expect(equalSelected?.text).toBe(IMP036J_COPY.EQUAL_SELECTED);
    expect(equalSelected?.text.toLowerCase()).not.toContain("better price");
    expect(
      couponStatusCopy({
        explanation: {
          couponPresentationClass: "COUPON_EQUAL_PAYABLE_NOT_SELECTED",
          merchandiseOrOrderSavingPaise: "0",
          deliverySavingPaise: "0",
          totalSavedPaise: "0",
          grandTotalPaise: "19900",
          thresholdProgress: null,
          complimentary: null,
          submittedCouponResult: {
            status: "VALID_BUT_NOT_SELECTED",
            reasonCode: "COUPON_VALID_BUT_NOT_SELECTED",
            canonicalCode: "SAVE",
          },
        },
      })?.text,
    ).toBe(IMP036J_COPY.EQUAL_KEPT);
  });

  it("names the coupon field Coupon and keeps pending apply visible", () => {
    render(
      <CouponField
        code="SAVE10"
        appliedCode={null}
        pending
        onCodeChange={() => undefined}
        onApply={() => undefined}
        onRemove={() => undefined}
        statusText={null}
        statusTone={null}
        returnPath="/order/cart/"
      />,
    );
    expect(screen.getByLabelText(IMP036J_COPY.COUPON_LABEL)).toBeInTheDocument();
    expect(screen.getByTestId("coupon-apply")).toBeDisabled();
    expect(screen.getAllByText(IMP036J_COPY.CHECKING).length).toBeGreaterThan(0);
  });

  it("renders complimentary included line without a picker", () => {
    render(
      <CommercialOfferStack
        explanation={{
          couponPresentationClass: "COUPON_EQUAL_PAYABLE_SELECTED",
          merchandiseOrOrderSavingPaise: "0",
          deliverySavingPaise: "0",
          totalSavedPaise: "0",
          grandTotalPaise: "19900",
          thresholdProgress: null,
          complimentary: {
            competingOffers: "NONE",
            productId: "p",
            variantId: "v",
            quantity: 1,
            merchandiseChargePaise: "0",
          },
          submittedCouponResult: null,
        }}
        payableLabel={IMP036J_COPY.TOTAL_PAYABLE}
        payablePaise="19900"
        complimentaryName="Taro Milk Tea"
      />,
    );
    expect(screen.getByTestId("complimentary-line")).toHaveTextContent("Taro Milk Tea");
    expect(screen.getByTestId("complimentary-line")).toHaveTextContent(IMP036J_COPY.INCLUDED);
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    expect(screen.queryByText(/better price/i)).not.toBeInTheDocument();
  });

  it("shows NONE_CHOSEN conflict copy without selecting a gift", () => {
    render(
      <CommercialOfferStack
        explanation={{
          couponPresentationClass: null,
          merchandiseOrOrderSavingPaise: "0",
          deliverySavingPaise: "0",
          totalSavedPaise: "0",
          grandTotalPaise: "19900",
          thresholdProgress: null,
          complimentary: { competingOffers: "NONE_CHOSEN" },
          submittedCouponResult: null,
        }}
        payableLabel={IMP036J_COPY.TOTAL_PAYABLE}
        payablePaise="19900"
        showGiftConflict
      />,
    );
    expect(screen.getByTestId("copy-gift-conflict")).toHaveTextContent(IMP036J_COPY.GIFT_CONFLICT);
    expect(screen.queryByTestId("complimentary-line")).not.toBeInTheDocument();
  });

  it("renders stale and gift-gone alerts with Price summary name", () => {
    render(
      <CommercialOfferStack
        explanation={null}
        payableLabel={IMP036J_COPY.TOTAL_PAYABLE}
        payablePaise="21000"
        stale
        giftGone
      />,
    );
    expect(screen.getByTestId("copy-stale")).toHaveTextContent(IMP036J_COPY.STALE);
    expect(screen.getByTestId("copy-gift-gone")).toHaveTextContent(IMP036J_COPY.GIFT_GONE);
    expect(screen.getByRole("region", { name: IMP036J_COPY.PRICE_SUMMARY })).toBeInTheDocument();
  });

  it("reuses Checkout evaluation only when fulfilment, revision, and snapshot match", () => {
    expect(
      canReuseCheckoutEvaluation({
        checkout: {
          fulfilmentMode: "DELIVERY",
          sourceCartRevision: "3",
          activeSnapshot: { grandTotalPaise: "24900" },
        },
        cartRevision: "3",
      }),
    ).toBe(true);
    expect(
      canReuseCheckoutEvaluation({
        checkout: {
          fulfilmentMode: "DELIVERY",
          sourceCartRevision: "2",
          activeSnapshot: { grandTotalPaise: "24900" },
        },
        cartRevision: "3",
      }),
    ).toBe(false);
    expect(
      canReuseCheckoutEvaluation({
        checkout: { fulfilmentMode: "DELIVERY", sourceCartRevision: "3", activeSnapshot: null },
        cartRevision: "3",
      }),
    ).toBe(false);
  });
});

describe("PaymentPanel and payment return boundaries", () => {
  const checkout = {
    id: "chk-1",
    customerAuthUserId: "user-1",
    brandId: "brand-1",
    cartId: "cart-1",
    sourceCartRevision: "1",
    revision: "1",
    status: "READY_FOR_PAYMENT",
    expiresAt: "2026-08-13T01:00:00.000Z",
    fulfilmentMode: "DELIVERY",
    pickupOutletId: null,
    activeSnapshotId: "snap-1",
    createdAt: "2026-08-13T00:00:00.000Z",
    updatedAt: "2026-08-13T00:00:00.000Z",
    destination: null,
    activeSnapshot: null,
  } as unknown as CommerceCheckout;

  const snapshot = {
    id: "snap-1",
    checkoutId: "chk-1",
    checkoutRevision: "1",
    sourceCartRevision: "1",
    selectedOutletId: "outlet-1",
    evaluatedAt: "2026-08-13T00:00:00.000Z",
    fulfilmentMode: "DELIVERY",
    currency: "INR",
    basePaise: "19900",
    chargesPaise: "0",
    prePromotionSubtotalPaise: "19900",
    promotionDiscountPaise: "0",
    taxablePaise: "19900",
    taxPaise: "0",
    grandTotalPaise: "19900",
    taxInclusionMode: "exclusive",
    destination: null,
    pickupLocation: null,
    lines: [],
    charges: [],
    promotionEffects: [],
    taxComponents: [],
    serviceabilityEvaluatedAt: null,
  } as unknown as CommerceCheckoutSnapshot;

  it("PaymentPanel is a read-only commercial summary without coupon mutation controls", () => {
    render(
      <PaymentPanel
        checkout={checkout}
        snapshot={snapshot}
        onOrderReady={() => undefined}
      />,
    );
    expect(screen.getByTestId("price-summary")).toBeInTheDocument();
    expect(screen.queryByLabelText(IMP036J_COPY.COUPON_LABEL)).not.toBeInTheDocument();
    expect(screen.queryByTestId("coupon-apply")).not.toBeInTheDocument();
    expect(screen.queryByTestId("coupon-change")).not.toBeInTheDocument();
    expect(screen.queryByTestId("coupon-remove")).not.toBeInTheDocument();
    expect(screen.queryByTestId("coupon-input")).not.toBeInTheDocument();
  });

  it("/order/payment return client has no offer breakdown or coupon controls", () => {
    render(<PaymentReturnClient />);
    expect(screen.queryByTestId("price-summary")).not.toBeInTheDocument();
    expect(screen.queryByLabelText(IMP036J_COPY.COUPON_LABEL)).not.toBeInTheDocument();
    expect(screen.queryByText(IMP036J_COPY.ORDER_SAVING_ROW)).not.toBeInTheDocument();
  });
});

describe("AR-036J-T5 remediation contracts", () => {
  it("maps definitive coupon failures to locked copy and transport failures to retry", () => {
    expect(definitiveCouponFailureCopy("CART_COUPON_UNKNOWN")).toBe(IMP036J_COPY.INVALID);
    expect(definitiveCouponFailureCopy("COUPON_EXPIRED")).toBe(IMP036J_COPY.EXPIRED);
    expect(couponFieldStatusFromMutationFailure("CART_COUPON_UNKNOWN")).toMatchObject({
      text: IMP036J_COPY.INVALID,
      invalid: true,
      retryVisible: false,
    });
    expect(couponFieldStatusFromMutationFailure("NETWORK_ERROR")).toMatchObject({
      text: IMP036J_COPY.RETRY,
      retryVisible: true,
      invalid: false,
    });
  });

  it("restores Review base breakdown rows with Offer savings and one Total payable", () => {
    const snapshot = {
      id: "snap-1",
      checkoutId: "chk-1",
      checkoutRevision: "1",
      sourceCartRevision: "1",
      selectedOutletId: "outlet-1",
      evaluatedAt: "2026-08-13T00:00:00.000Z",
      fulfilmentMode: "DELIVERY",
      currency: "INR",
      basePaise: "19900",
      chargesPaise: "5000",
      prePromotionSubtotalPaise: "24900",
      promotionDiscountPaise: "8000",
      taxablePaise: "16900",
      taxPaise: "500",
      grandTotalPaise: "17400",
      taxInclusionMode: "exclusive",
      destination: null,
      pickupLocation: null,
      lines: [],
      charges: [
        { chargeCode: "packaging", name: "Packaging", amountPaise: "1000" },
        { chargeCode: "delivery", name: "Delivery", amountPaise: "4000" },
      ],
      promotionEffects: [],
      taxComponents: [{ taxType: "GST", taxAmountPaise: "500" }],
      serviceabilityEvaluatedAt: null,
    } as unknown as CommerceCheckoutSnapshot;

    render(
      <CommercialOfferStack
        explanation={{
          couponPresentationClass: null,
          merchandiseOrOrderSavingPaise: "8000",
          deliverySavingPaise: "4000",
          totalSavedPaise: "12000",
          grandTotalPaise: "17400",
          thresholdProgress: null,
          complimentary: null,
          submittedCouponResult: null,
        }}
        payableLabel={IMP036J_COPY.TOTAL_PAYABLE}
        payablePaise="17400"
        fulfilmentMode="DELIVERY"
        baseSnapshot={snapshot}
      />,
    );
    expect(screen.getByTestId("price-summary-subtotal")).toBeInTheDocument();
    expect(screen.getByTestId("price-summary-charge-packaging")).toBeInTheDocument();
    expect(screen.getByText(IMP036J_COPY.ORDER_SAVING_ROW)).toBeInTheDocument();
    expect(screen.getByText(IMP036J_COPY.DELIVERY_SAVING_ROW)).toBeInTheDocument();
    expect(screen.getByTestId("price-summary-tax-GST")).toBeInTheDocument();
    expect(screen.getAllByText(IMP036J_COPY.TOTAL_PAYABLE)).toHaveLength(1);
  });

  it("implements coupon aria-invalid / describedby and validation focus", async () => {
    render(
      <CouponField
        code="BAD"
        appliedCode={null}
        pending={false}
        onCodeChange={() => undefined}
        onApply={() => undefined}
        onRemove={() => undefined}
        statusText={IMP036J_COPY.INVALID}
        statusTone="alert"
        invalid
        focusInputToken={1}
        returnPath="/order/cart/"
      />,
    );
    const input = screen.getByTestId("coupon-input");
    expect(input).toHaveAttribute("aria-invalid", "true");
    const describedBy = input.getAttribute("aria-describedby") ?? "";
    expect(describedBy.length).toBeGreaterThan(0);
    expect(screen.getByTestId("coupon-hint").id.length).toBeGreaterThan(0);
    expect(describedBy.split(" ")).toContain(screen.getByTestId("coupon-hint").id);
    expect(describedBy.split(" ")).toContain(screen.getByTestId("coupon-result").id);
    await waitFor(() => expect(input).toHaveFocus());
  });

  it("moves focus to result on successful apply status", async () => {
    render(
      <CouponField
        code="SAVE"
        appliedCode="SAVE"
        pending={false}
        onCodeChange={() => undefined}
        onApply={() => undefined}
        onRemove={() => undefined}
        statusText={IMP036J_COPY.APPLIED_COUPON}
        statusTone="polite"
        focusResultToken={2}
        returnPath="/order/cart/"
      />,
    );
    await waitFor(() => expect(screen.getByTestId("coupon-result")).toHaveFocus());
    expect(screen.getByTestId("coupon-input")).not.toHaveAttribute("aria-invalid");
  });

  it("keeps Review primary action before coupon in DOM order", () => {
    render(
      <div>
        <button type="button" data-testid="continue-to-payment">
          Continue to payment
        </button>
        <CouponField
          code=""
          appliedCode={null}
          pending={false}
          onCodeChange={() => undefined}
          onApply={() => undefined}
          onRemove={() => undefined}
          statusText={null}
          statusTone={null}
          returnPath="/order/checkout/"
        />
      </div>,
    );
    const continueBtn = screen.getByTestId("continue-to-payment");
    const coupon = screen.getByTestId("coupon-input");
    expect(
      continueBtn.compareDocumentPosition(coupon) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });

  it("hides payable on narrow offer stack so sticky amount remains once", () => {
    render(
      <CommercialOfferStack
        explanation={null}
        payableLabel={IMP036J_COPY.ESTIMATED_SUBTOTAL}
        payablePaise="19900"
        hidePayable
      />,
    );
    expect(screen.queryByTestId("price-summary-total")).not.toBeInTheDocument();
    expect(screen.queryByText(IMP036J_COPY.ESTIMATED_SUBTOTAL)).not.toBeInTheDocument();
  });

  it("AR-036J-T5-15 uses generic applied copy when another Offer is still below threshold", () => {
    const status = automaticStatusCopy({
      couponPresentationClass: null,
      merchandiseOrOrderSavingPaise: "8000",
      deliverySavingPaise: "0",
      totalSavedPaise: "8000",
      grandTotalPaise: "19900",
      thresholdProgress: {
        remainingAmountPaise: "5000",
        remainingItemQuantity: null,
        displayName: "Free delivery",
        benefitType: "delivery_fee_waiver",
      },
      complimentary: null,
      submittedCouponResult: null,
    });
    expect(status?.text).toBe(IMP036J_COPY.APPLIED_AUTO);
    expect(status?.text).not.toContain("Free delivery");
    expect(status?.text).not.toContain("You reached");
    expect(
      thresholdCopy({
        couponPresentationClass: null,
        merchandiseOrOrderSavingPaise: "8000",
        deliverySavingPaise: "0",
        totalSavedPaise: "8000",
        grandTotalPaise: "19900",
        thresholdProgress: {
          remainingAmountPaise: "5000",
          remainingItemQuantity: null,
          displayName: "Free delivery",
          benefitType: "delivery_fee_waiver",
        },
        complimentary: null,
        submittedCouponResult: null,
      }),
    ).toBe("Add ₹50.00 more to unlock Free delivery.");
  });

  it("AR-036J-T5-16/17 READY_FOR_PAYMENT reload reads sealed snapshot savings", () => {
    liveReevaluation.mockClear();
    const snapshot = {
      id: "snap-1",
      checkoutId: "chk-1",
      checkoutRevision: "1",
      sourceCartRevision: "1",
      selectedOutletId: "outlet-1",
      evaluatedAt: "2026-08-13T00:00:00.000Z",
      fulfilmentMode: "DELIVERY",
      currency: "INR",
      basePaise: "19900",
      chargesPaise: "5000",
      prePromotionSubtotalPaise: "24900",
      promotionDiscountPaise: "27000",
      taxablePaise: "12900",
      taxPaise: "500",
      grandTotalPaise: "13400",
      taxInclusionMode: "exclusive",
      destination: null,
      pickupLocation: null,
      lines: [
        {
          lineOrigin: "complimentary_offer",
          productName: "Taro Milk Tea",
        },
      ],
      charges: [
        { chargeCode: "packaging", name: "Packaging", amountPaise: "1000" },
        { chargeCode: "delivery", name: "Delivery", amountPaise: "4000" },
      ],
      promotionEffects: [
        {
          effectKind: "monetary_allocation",
          amountPaise: "15000",
          snapshotLineId: "gift-line",
          componentId: "base:complimentary:promo-gift",
        },
        {
          effectKind: "monetary_allocation",
          amountPaise: "8000",
          snapshotLineId: null,
          componentId: "base:line-1",
        },
        {
          effectKind: "monetary_allocation",
          amountPaise: "4000",
          snapshotLineId: null,
          componentId: CANONICAL_DELIVERY_COMPONENT_ID,
        },
      ],
      taxComponents: [{ taxType: "GST", taxAmountPaise: "500" }],
      serviceabilityEvaluatedAt: null,
    } as unknown as CommerceCheckoutSnapshot;

    const sealed = sealedPaymentExplanationFromSnapshot(snapshot);
    expect(sealed.merchandiseOrOrderSavingPaise).toBe("8000");
    expect(sealed.deliverySavingPaise).toBe("4000");
    expect(sealed.totalSavedPaise).toBe("12000");
    expect(sealed.grandTotalPaise).toBe("13400");

    const checkout = {
      id: "chk-1",
      customerAuthUserId: "user-1",
      brandId: "brand-1",
      cartId: "cart-1",
      sourceCartRevision: "1",
      revision: "1",
      status: "READY_FOR_PAYMENT" as const,
      expiresAt: "2026-08-13T01:00:00.000Z",
      fulfilmentMode: "DELIVERY" as const,
      pickupOutletId: null,
      activeSnapshotId: "snap-1",
      createdAt: "2026-08-13T00:00:00.000Z",
      updatedAt: "2026-08-13T00:00:00.000Z",
      destination: null,
      activeSnapshot: snapshot,
    };

    function assertReadyPaymentRows(): void {
      const breakdown = screen.getByTestId("checkout-fee-breakdown");
      expect(breakdown.querySelectorAll("[data-testid='price-summary-subtotal']")).toHaveLength(1);
      expect(breakdown.querySelectorAll("[data-testid='price-summary-charge-packaging']")).toHaveLength(1);
      expect(breakdown.querySelectorAll("[data-offer-component='DELIVERY_CHARGE']")).toHaveLength(1);
      expect(breakdown.querySelectorAll("[data-offer-component='ORDER_SAVING']")).toHaveLength(1);
      expect(breakdown.querySelectorAll("[data-offer-component='DELIVERY_SAVING']")).toHaveLength(1);
      expect(breakdown.querySelectorAll("[data-offer-component='TOTAL_SAVED']")).toHaveLength(1);
      expect(breakdown.querySelectorAll("[data-testid='price-summary-tax-GST']")).toHaveLength(1);
      expect(breakdown.querySelectorAll("[data-testid='price-summary-total']")).toHaveLength(1);
      expect(screen.getByText(IMP036J_COPY.DELIVERY_SAVING_ROW)).toBeInTheDocument();
      expect(screen.getByText(IMP036J_COPY.ORDER_SAVING_ROW)).toBeInTheDocument();
      expect(breakdown).toHaveTextContent("₹80.00");
      expect(breakdown).toHaveTextContent("₹40.00");
      expect(breakdown).toHaveTextContent("₹120.00");
      expect(breakdown).toHaveTextContent("₹134.00");
      expect(breakdown).not.toHaveTextContent("₹150.00");
      expect(screen.queryByTestId("coupon-input")).not.toBeInTheDocument();
      expect(screen.queryByTestId("coupon-apply")).not.toBeInTheDocument();
    }

    const first = render(
      <PaymentPanel checkout={checkout} snapshot={snapshot} onOrderReady={() => undefined} />,
    );
    assertReadyPaymentRows();
    first.unmount();
    render(<PaymentPanel checkout={checkout} snapshot={snapshot} onOrderReady={() => undefined} />);
    assertReadyPaymentRows();
    expect(liveReevaluation).not.toHaveBeenCalled();
  });
});

describe("IMP-036J T8 executable presentation evidence", () => {
  it("derives COPY-DROPPED from consecutive server explanations without calculating remaining paise", () => {
    const below = {
      couponPresentationClass: null,
      merchandiseOrOrderSavingPaise: "0",
      deliverySavingPaise: "0",
      totalSavedPaise: "0",
      grandTotalPaise: "19900",
      thresholdProgress: {
        remainingAmountPaise: "5000",
        remainingItemQuantity: null,
        displayName: "order discount",
        benefitType: "fixed_amount_off",
      },
      complimentary: null,
      submittedCouponResult: null,
    } as const;
    const crossed = {
      ...below,
      merchandiseOrOrderSavingPaise: "8000",
      totalSavedPaise: "8000",
      grandTotalPaise: "31800",
      thresholdProgress: null,
    };
    expect(hasAuthoritativeSaving(below)).toBe(false);
    expect(hasAuthoritativeSaving(crossed)).toBe(true);
    expect(offerDroppedFromAuthoritativeExplanations(null, below)).toBe(false);
    expect(offerDroppedFromAuthoritativeExplanations(below, crossed)).toBe(false);
    expect(offerDroppedFromAuthoritativeExplanations(crossed, below)).toBe(true);
    expect(thresholdCopy(below)).toBe("Add ₹50.00 more to unlock order discount.");
  });

  it("replaces threshold progress with saving when the minimum holds and shows COPY-DROPPED without a stale saving", () => {
    const { unmount } = render(
      <CommercialOfferStack
        explanation={{
          couponPresentationClass: null,
          merchandiseOrOrderSavingPaise: "8000",
          deliverySavingPaise: "0",
          totalSavedPaise: "8000",
          grandTotalPaise: "11900",
          thresholdProgress: null,
          complimentary: null,
          submittedCouponResult: null,
        }}
        payableLabel={IMP036J_COPY.TOTAL_PAYABLE}
        payablePaise="11900"
      />,
    );
    expect(screen.getByText(IMP036J_COPY.ORDER_SAVING_ROW)).toBeInTheDocument();
    expect(screen.queryByText(IMP036J_COPY.DROPPED)).not.toBeInTheDocument();
    expect(screen.queryByText(/Add .+ more to unlock/)).not.toBeInTheDocument();
    unmount();

    render(
      <CommercialOfferStack
        explanation={{
          couponPresentationClass: null,
          merchandiseOrOrderSavingPaise: "0",
          deliverySavingPaise: "0",
          totalSavedPaise: "0",
          grandTotalPaise: "19900",
          thresholdProgress: {
            remainingAmountPaise: "5000",
            remainingItemQuantity: null,
            displayName: "free delivery",
            benefitType: "delivery_fee_waiver",
          },
          complimentary: null,
          submittedCouponResult: null,
        }}
        payableLabel={IMP036J_COPY.TOTAL_PAYABLE}
        payablePaise="19900"
        dropped
      />,
    );
    expect(screen.getByText(IMP036J_COPY.DROPPED)).toBeInTheDocument();
    expect(screen.queryByText(IMP036J_COPY.ORDER_SAVING_ROW)).not.toBeInTheDocument();
    expect(screen.getByText("Add ₹50.00 more to unlock free delivery.")).toBeInTheDocument();
  });

  it("maps invalid, expired, inapplicable, global, and personal cap to five distinct sentences", () => {
    const sentences = [
      couponStatusCopy({
        explanation: {
          couponPresentationClass: null,
          merchandiseOrOrderSavingPaise: "0",
          deliverySavingPaise: "0",
          totalSavedPaise: "0",
          grandTotalPaise: "19900",
          thresholdProgress: null,
          complimentary: null,
          submittedCouponResult: { status: "INVALID", reasonCode: "UNKNOWN", canonicalCode: null },
        },
      })?.text,
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
            status: "NOT_APPLICABLE",
            reasonCode: "COUPON_EXPIRED",
            canonicalCode: "OLD",
          },
        },
      })?.text,
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
            status: "NOT_APPLICABLE",
            reasonCode: "NOT_APPLICABLE",
            canonicalCode: "SAVE",
          },
        },
      })?.text,
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
            status: "NOT_APPLICABLE",
            reasonCode: "GLOBAL_CAP_REACHED",
            canonicalCode: "SAVE",
          },
        },
      })?.text,
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
            status: "NOT_APPLICABLE",
            reasonCode: "PERSONAL_CAP_REACHED",
            canonicalCode: "SAVE",
          },
        },
      })?.text,
    ];
    expect(sentences).toEqual([
      IMP036J_COPY.INVALID,
      IMP036J_COPY.EXPIRED,
      IMP036J_COPY.INAPPLICABLE,
      IMP036J_COPY.GLOBAL_CAP,
      IMP036J_COPY.PERSONAL_CAP,
    ]);
    expect(new Set(sentences).size).toBe(5);
    expect(sentences.join(" ")).not.toMatch(/remaining|other customer|near-match/i);
  });

  it("pickup omits delivery saving and uses mode-clause copy without first-order history", () => {
    render(
      <CommercialOfferStack
        explanation={{
          couponPresentationClass: null,
          merchandiseOrOrderSavingPaise: "0",
          deliverySavingPaise: "4000",
          totalSavedPaise: "4000",
          grandTotalPaise: "19900",
          thresholdProgress: null,
          complimentary: null,
          submittedCouponResult: {
            status: "NOT_APPLICABLE",
            reasonCode: "FULFILMENT_MODE_MISMATCH",
            canonicalCode: "DELIV",
          },
        }}
        payableLabel={IMP036J_COPY.TOTAL_PAYABLE}
        payablePaise="19900"
        fulfilmentMode="PICKUP"
        deliveryChargePaise="4000"
      />,
    );
    expect(screen.getByText(IMP036J_COPY.INAPPLICABLE_DELIVERY)).toBeInTheDocument();
    expect(screen.queryByText(IMP036J_COPY.DELIVERY_SAVING_ROW)).not.toBeInTheDocument();
    expect(screen.queryByText(/first.order|previous order|purchase history/i)).not.toBeInTheDocument();

    expect(
      couponStatusCopy({
        fulfilmentMode: "DELIVERY",
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
            canonicalCode: "PICK",
          },
        },
      })?.text,
    ).toBe(IMP036J_COPY.INAPPLICABLE_PICKUP);
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
            status: "CUSTOMER_IDENTITY_REQUIRED",
            reasonCode: "FIRST_ORDER_IDENTITY_REQUIRED",
            canonicalCode: "FIRST",
          },
        },
      })?.text,
    ).toBe(IMP036J_COPY.SIGN_IN);
  });
});

