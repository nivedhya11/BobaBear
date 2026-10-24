import { describe, expect, it } from "vitest";

import {
  describeBenefitForOperator,
  describeEligibilityForOperator,
  isValidCouponCode,
  isValidPromotionIdentifier,
  promotionReadiness,
} from "../../src/components/administration/commercial/promotion-readiness";
import type { Coupon, Promotion } from "../../src/lib/administration/commercial-promotions";
import {
  COPY_OP_COUPONS_UNREADABLE,
  COPY_OP_DRAFT,
  COPY_OP_LIVE,
  COPY_OP_LIVE_WITH_COUPON,
  COPY_OP_LIVE_WITHOUT_COUPON,
  COPY_OP_NO_ACTIVE_COUPON_CODES,
  COPY_OP_NO_COUPON_CODES,
  COPY_OP_RETIRED,
} from "../../src/shared/promotions/operator-copy";

function promotion(overrides: Partial<Promotion> = {}): Promotion {
  return {
    id: "p",
    brandId: "b",
    code: "test123",
    displayName: "Test",
    scopeType: "brand",
    territoryId: null,
    organizationId: null,
    outletId: null,
    salesChannel: "direct",
    status: "active",
    triggerType: "coupon",
    stackingPolicy: "exclusive",
    priority: 0,
    startsAt: "2026-01-01T00:00:00.000Z",
    endsAt: null,
    minimumQualifyingAmountPaise: null,
    minimumItemQuantity: null,
    firstOrderOnly: false,
    eligibleFulfilmentModes: null,
    eligibleFulfilmentTimings: null,
    maximumRedemptions: null,
    maximumRedemptionsPerCustomer: null,
    complimentaryItem: false,
    revision: "9",
    supportedLifecycleStates: ["draft", "active", "retired"],
    ...overrides,
  };
}

function coupon(code: string, status: Coupon["status"]): Coupon {
  return {
    id: code,
    promotionId: "p",
    canonicalCode: code,
    origin: "manual",
    status,
    startsAt: null,
    endsAt: null,
    maximumRedemptions: null,
    maximumRedemptionsPerCustomer: null,
    revision: "1",
    supportedLifecycleStates: ["draft", "active", "disabled", "retired"],
  };
}

const BENEFIT = { benefitType: "percentage_discount", percentageBps: 1000 };

describe("promotion identifier and coupon code shape", () => {
  it("accepts only identifiers the promotions_code_format_check constraint accepts", () => {
    expect(isValidPromotionIdentifier("test123")).toBe(true);
    expect(isValidPromotionIdentifier("summer-10_a")).toBe(true);
    expect(isValidPromotionIdentifier("TEST123")).toBe(false);
    expect(isValidPromotionIdentifier("Test 123")).toBe(false);
    expect(isValidPromotionIdentifier("-lead")).toBe(false);
    expect(isValidPromotionIdentifier("")).toBe(false);
    expect(isValidPromotionIdentifier("a".repeat(65))).toBe(false);
  });

  it("accepts coupon codes the server canonicalises to upper case", () => {
    expect(isValidCouponCode("test123")).toBe(true);
    expect(isValidCouponCode("SUMMER-10")).toBe(true);
    expect(isValidCouponCode("ab")).toBe(false);
    expect(isValidCouponCode("has space")).toBe(false);
  });
});

describe("promotionReadiness (#376 zero-issued coupons)", () => {
  it("active coupon promotion with zero coupons is a warning, never the live sentence", () => {
    const r = promotionReadiness({
      promotion: promotion(),
      benefit: BENEFIT,
      coupons: [],
      couponsReadable: true,
    });
    expect(r.tone).toBe("warning");
    expect(r.headline).toBe(COPY_OP_LIVE_WITHOUT_COUPON);
    expect(r.nextStep).toBe(COPY_OP_NO_COUPON_CODES);
    expect(r.headline).not.toBe(COPY_OP_LIVE);
    expect(r.steps.map((s) => [s.label, s.done])).toEqual([
      ["Set the benefit and who gets it", true],
      ["Activate the promotion", true],
      ["Create a coupon code customers type", false],
      ["Activate the coupon code", false],
      ["Check applications and redemptions below", false],
    ]);
  });

  it("disabled or draft coupons only are not customer-ready", () => {
    const r = promotionReadiness({
      promotion: promotion(),
      benefit: BENEFIT,
      coupons: [coupon("TEST123", "disabled"), coupon("NEW1", "draft")],
      couponsReadable: true,
    });
    expect(r.tone).toBe("warning");
    expect(r.nextStep).toBe(COPY_OP_NO_ACTIVE_COUPON_CODES);
    expect(r.activeCouponCodes).toEqual([]);
  });

  it("lists only active coupon codes when ready", () => {
    const r = promotionReadiness({
      promotion: promotion(),
      benefit: BENEFIT,
      coupons: [coupon("TEST123", "active"), coupon("OLD", "retired")],
      couponsReadable: true,
    });
    expect(r.tone).toBe("success");
    expect(r.headline).toBe(COPY_OP_LIVE_WITH_COUPON);
    expect(r.activeCouponCodes).toEqual(["TEST123"]);
  });

  it("unknown coupon state is reported as unknown", () => {
    const r = promotionReadiness({
      promotion: promotion(),
      benefit: BENEFIT,
      coupons: [],
      couponsReadable: false,
    });
    expect(r.headline).toBe(COPY_OP_COUPONS_UNREADABLE);
    expect(r.nextStep).toBeNull();
  });

  it("automatic, draft and retired states keep their existing operator sentences", () => {
    expect(
      promotionReadiness({
        promotion: promotion({ triggerType: "automatic" }),
        benefit: BENEFIT,
        coupons: [],
        couponsReadable: false,
      }).headline,
    ).toBe(COPY_OP_LIVE);
    expect(
      promotionReadiness({
        promotion: promotion({ status: "draft" }),
        benefit: null,
        coupons: [],
        couponsReadable: true,
      }).headline,
    ).toBe(COPY_OP_DRAFT);
    expect(
      promotionReadiness({
        promotion: promotion({ status: "retired" }),
        benefit: BENEFIT,
        coupons: [coupon("TEST123", "active")],
        couponsReadable: true,
      }).headline,
    ).toBe(COPY_OP_RETIRED);
  });
});

describe("customer meaning for operators", () => {
  it("describes each V1 benefit class", () => {
    expect(describeBenefitForOperator(null)).toBe("No benefit set yet.");
    expect(describeBenefitForOperator(BENEFIT)).toBe("10% off eligible items.");
    expect(
      describeBenefitForOperator({
        benefitType: "percentage_discount",
        percentageBps: 1250,
        maximumDiscountPaise: "10000",
      }),
    ).toBe("12.5% off eligible items (up to ₹100.00).");
    expect(
      describeBenefitForOperator({ benefitType: "fixed_amount_discount", fixedAmountPaise: "5000" }),
    ).toBe("₹50.00 off eligible items.");
    expect(
      describeBenefitForOperator({
        benefitType: "buy_x_get_y",
        buyQuantity: 2,
        getQuantity: 1,
        repeatable: true,
      }),
    ).toBe("Buy 2 get 1, repeatable.");
    expect(describeBenefitForOperator({ benefitType: "delivery_fee_waiver" })).toMatch(
      /delivery charge is waived/,
    );
    expect(describeBenefitForOperator({ benefitType: "complimentary_item" })).toMatch(
      /One menu item/,
    );
  });

  it("describes fulfilment, timing, qualifiers and caps", () => {
    expect(
      describeEligibilityForOperator(
        promotion({
          eligibleFulfilmentModes: ["DELIVERY"],
          eligibleFulfilmentTimings: ["SCHEDULED"],
          firstOrderOnly: true,
          minimumQualifyingAmountPaise: "30000",
          minimumItemQuantity: 2,
          maximumRedemptions: 100,
          maximumRedemptionsPerCustomer: 1,
        }),
      ),
    ).toEqual([
      "Delivery orders only. Pickup orders don't get it.",
      "Scheduled orders only.",
      "First order only.",
      "Minimum order ₹300.00.",
      "Minimum 2 items.",
      "Up to 100 redemptions in total.",
      "Up to 1 per customer.",
    ]);
    expect(describeEligibilityForOperator(promotion())).toEqual([
      "Delivery and pickup orders.",
      "ASAP and scheduled orders.",
      "No redemption limits.",
    ]);
  });
});
