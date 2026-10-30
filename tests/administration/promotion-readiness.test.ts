import { describe, expect, it } from "vitest";

import { isPromotionEffective } from "../../src/shared/promotions/eligibility";
import {
  classifyCouponCustomerReadiness,
  classifyPromotionCustomerReadiness,
  classifySavedWindow,
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
  COPY_OP_EXPIRED,
  COPY_OP_EXPIRED_NEXT,
  COPY_OP_LIVE,
  COPY_OP_LIVE_WITH_COUPON,
  COPY_OP_LIVE_WITHOUT_COUPON,
  COPY_OP_NO_ACTIVE_COUPON_CODES,
  COPY_OP_NO_COUPON_CODES,
  COPY_OP_NOT_CURRENTLY_EFFECTIVE,
  COPY_OP_READINESS_CUE,
  COPY_OP_RETIRED,
  COPY_OP_SCHEDULED,
  COPY_OP_SCHEDULED_NEXT,
  COPY_OP_STATE_CURRENT,
  COPY_OP_STATE_ENDED,
  COPY_OP_STATE_INACTIVE,
  COPY_OP_STATE_NOT_STARTED,
  COPY_OP_STATE_UNKNOWN,
  COPY_OP_WINDOW_UNREADABLE,
} from "../../src/shared/promotions/operator-copy";

/** Inside the fixture promotion window (starts 2026-01-01, no end). */
const OPEN_AT = new Date("2026-06-15T12:00:00.000Z");

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

function coupon(
  code: string,
  status: Coupon["status"],
  overrides: Partial<Coupon> = {},
): Coupon {
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
    ...overrides,
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
  it("locks the approved success sentence and the no-active-coupon warning as literals", () => {
    expect(COPY_OP_LIVE).toBe("Customers can receive this offer.");
    expect(COPY_OP_LIVE_WITH_COUPON).toBe("Customers can receive this offer.");
    expect(COPY_OP_LIVE_WITHOUT_COUPON).toBe(
      "Active, but customers can't use it yet: no coupon code is active.",
    );
  });

  it("active coupon promotion with zero coupons is a warning, never the live sentence", () => {
    const r = promotionReadiness({
      promotion: promotion(),
      benefit: BENEFIT,
      coupons: [],
      couponsReadable: true,
      at: OPEN_AT,
    });
    expect(r.tone).toBe("warning");
    expect(r.headline).toBe(
      "Active, but customers can't use it yet: no coupon code is active.",
    );
    expect(r.headline).toBe(COPY_OP_LIVE_WITHOUT_COUPON);
    expect(r.nextStep).toBe(COPY_OP_NO_COUPON_CODES);
    expect(r.headline).not.toBe("Customers can receive this offer.");
    expect(r.headline).not.toBe(COPY_OP_LIVE);
    expect(r.steps.map((s) => [s.label, s.done])).toEqual([
      ["Set the benefit and who gets it", true],
      ["Activate the promotion", true],
      ["Inside the saved window", true],
      ["Create a coupon code customers type", false],
      ["Activate the coupon code", false],
      ["Coupon code is inside both saved windows", false],
      ["Check applications and redemptions below", false],
    ]);
    expect(r.customerReadyCouponCodes).toEqual([]);
    expect(r.cue).toBe(COPY_OP_READINESS_CUE);
    expect(r.promotionWindowLabel).toBe(`Saved promotion window: ${COPY_OP_STATE_CURRENT}`);
  });

  it("disabled or draft coupons only are not customer-ready", () => {
    const r = promotionReadiness({
      promotion: promotion(),
      benefit: BENEFIT,
      coupons: [coupon("TEST123", "disabled"), coupon("NEW1", "draft")],
      couponsReadable: true,
      at: OPEN_AT,
    });
    expect(r.tone).toBe("warning");
    expect(r.nextStep).toBe(COPY_OP_NO_ACTIVE_COUPON_CODES);
    expect(r.activeCouponCodes).toEqual([]);
    expect(r.customerReadyCouponCodes).toEqual([]);
    expect(r.couponReadiness.map((row) => row.label)).toEqual([
      COPY_OP_STATE_INACTIVE,
      COPY_OP_STATE_INACTIVE,
    ]);
  });

  it("lists only active coupon codes when ready", () => {
    const r = promotionReadiness({
      promotion: promotion(),
      benefit: BENEFIT,
      coupons: [coupon("TEST123", "active"), coupon("OLD", "retired")],
      couponsReadable: true,
      at: OPEN_AT,
    });
    expect(r.tone).toBe("success");
    expect(r.headline).toBe("Customers can receive this offer.");
    expect(r.headline).toBe(COPY_OP_LIVE_WITH_COUPON);
    expect(r.activeCouponCodes).toEqual(["TEST123"]);
    expect(r.customerReadyCouponCodes).toEqual(["TEST123"]);
    expect(r.couponReadiness.find((row) => row.code === "OLD")?.label).toBe(COPY_OP_STATE_INACTIVE);
  });

  it("unknown coupon state is reported as unknown", () => {
    const r = promotionReadiness({
      promotion: promotion(),
      benefit: BENEFIT,
      coupons: [],
      couponsReadable: false,
      at: OPEN_AT,
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
        at: OPEN_AT,
      }).headline,
    ).toBe("Customers can receive this offer.");
    expect(
      promotionReadiness({
        promotion: promotion({ status: "draft" }),
        benefit: null,
        coupons: [],
        couponsReadable: true,
        at: OPEN_AT,
      }).headline,
    ).toBe(COPY_OP_DRAFT);
    expect(
      promotionReadiness({
        promotion: promotion({ status: "retired" }),
        benefit: BENEFIT,
        coupons: [coupon("TEST123", "active")],
        couponsReadable: true,
        at: OPEN_AT,
      }).headline,
    ).toBe(COPY_OP_RETIRED);
  });
});

describe("fixed-clock coupon and promotion windows", () => {
  const couponStart = "2026-06-15T00:00:00.000Z";
  const couponEnd = "2026-06-20T00:00:00.000Z";
  const promotionStart = "2026-06-01T00:00:00.000Z";
  const promotionEnd = "2026-07-01T00:00:00.000Z";

  function ready(at: Date, promo: Promotion, coupons: Coupon[]) {
    return promotionReadiness({
      promotion: promo,
      benefit: BENEFIT,
      coupons,
      couponsReadable: true,
      at,
    });
  }

  describe("coupon window with an open parent promotion", () => {
    const parent = promotion({ startsAt: "2026-01-01T00:00:00.000Z", endsAt: null });

    function bounded(code = "SAVE10") {
      return coupon(code, "active", { startsAt: couponStart, endsAt: couponEnd });
    }

    it("treats the coupon start instant as customer-ready", () => {
      const at = new Date(couponStart);
      expect(classifyCouponCustomerReadiness({ coupon: bounded(), promotion: parent, at })).toBe(
        "currently_effective",
      );
      const result = ready(at, parent, [bounded()]);
      expect(result.headline).toBe(COPY_OP_LIVE_WITH_COUPON);
      expect(result.customerReadyCouponCodes).toEqual(["SAVE10"]);
      expect(result.couponReadiness[0]?.label).toBe(COPY_OP_STATE_CURRENT);
      expect(result.activeCouponCodes).toEqual(["SAVE10"]);
    });

    it("treats the instant before the coupon start as not started", () => {
      const at = new Date(new Date(couponStart).getTime() - 1);
      expect(classifyCouponCustomerReadiness({ coupon: bounded(), promotion: parent, at })).toBe(
        "scheduled",
      );
      const result = ready(at, parent, [bounded()]);
      expect(result.headline).toBe(COPY_OP_SCHEDULED);
      expect(result.nextStep).toBe(COPY_OP_SCHEDULED_NEXT);
      expect(result.customerReadyCouponCodes).toEqual([]);
      expect(result.couponReadiness[0]?.label).toBe(COPY_OP_STATE_NOT_STARTED);
      expect(result.headline).not.toBe(COPY_OP_LIVE_WITH_COUPON);
    });

    it("treats the instant before the coupon end as customer-ready", () => {
      const at = new Date(new Date(couponEnd).getTime() - 1);
      expect(classifyCouponCustomerReadiness({ coupon: bounded(), promotion: parent, at })).toBe(
        "currently_effective",
      );
      expect(ready(at, parent, [bounded()]).customerReadyCouponCodes).toEqual(["SAVE10"]);
    });

    it("treats the coupon end instant as past the saved end", () => {
      const at = new Date(couponEnd);
      expect(classifyCouponCustomerReadiness({ coupon: bounded(), promotion: parent, at })).toBe(
        "expired",
      );
      const result = ready(at, parent, [bounded()]);
      expect(result.headline).toBe(COPY_OP_EXPIRED);
      expect(result.nextStep).toBe(COPY_OP_EXPIRED_NEXT);
      expect(result.customerReadyCouponCodes).toEqual([]);
      expect(result.couponReadiness[0]?.label).toBe(COPY_OP_STATE_ENDED);
    });
  });

  describe("parent promotion window with an open coupon", () => {
    const openCoupon = coupon("SAVE10", "active");

    function boundedPromotion() {
      return promotion({ startsAt: promotionStart, endsAt: promotionEnd });
    }

    it("treats the promotion start instant as customer-ready", () => {
      const at = new Date(promotionStart);
      const promo = boundedPromotion();
      expect(isPromotionEffective(new Date(promotionStart), new Date(promotionEnd), at)).toBe(true);
      expect(classifyPromotionCustomerReadiness({ promotion: promo, at })).toBe(
        "currently_effective",
      );
      expect(classifyCouponCustomerReadiness({ coupon: openCoupon, promotion: promo, at })).toBe(
        "currently_effective",
      );
      expect(ready(at, promo, [openCoupon]).headline).toBe(COPY_OP_LIVE_WITH_COUPON);
    });

    it("treats the instant before the promotion start as not started", () => {
      const at = new Date(new Date(promotionStart).getTime() - 1);
      const promo = boundedPromotion();
      expect(isPromotionEffective(new Date(promotionStart), new Date(promotionEnd), at)).toBe(
        false,
      );
      expect(classifyCouponCustomerReadiness({ coupon: openCoupon, promotion: promo, at })).toBe(
        "scheduled",
      );
      const result = ready(at, promo, [openCoupon]);
      expect(result.headline).toBe(COPY_OP_SCHEDULED);
      expect(result.customerReadyCouponCodes).toEqual([]);
      expect(result.promotionWindowLabel).toBe(`Saved promotion window: ${COPY_OP_STATE_NOT_STARTED}`);
    });

    it("treats the instant before the promotion end as customer-ready", () => {
      const at = new Date(new Date(promotionEnd).getTime() - 1);
      const promo = boundedPromotion();
      expect(isPromotionEffective(new Date(promotionStart), new Date(promotionEnd), at)).toBe(true);
      expect(ready(at, promo, [openCoupon]).customerReadyCouponCodes).toEqual(["SAVE10"]);
    });

    it("treats the promotion end instant as past the saved end", () => {
      const at = new Date(promotionEnd);
      const promo = boundedPromotion();
      expect(isPromotionEffective(new Date(promotionStart), new Date(promotionEnd), at)).toBe(
        false,
      );
      expect(classifySavedWindow({
        startsAt: promotionStart,
        endsAt: promotionEnd,
        at,
        requireStartsAt: true,
      })).toBe("expired");
      const result = ready(at, promo, [openCoupon]);
      expect(result.headline).toBe(COPY_OP_EXPIRED);
      expect(result.customerReadyCouponCodes).toEqual([]);
      expect(result.couponReadiness[0]?.label).toBe(COPY_OP_STATE_ENDED);
    });
  });

  it("lets an exclusive coupon end block an inclusive promotion start at the same instant", () => {
    const at = new Date(promotionStart);
    const promo = promotion({ startsAt: promotionStart, endsAt: promotionEnd });
    const ending = coupon("SAVE10", "active", { startsAt: null, endsAt: promotionStart });
    expect(classifyCouponCustomerReadiness({ coupon: ending, promotion: promo, at })).toBe(
      "expired",
    );
    expect(ready(at, promo, [ending]).headline).toBe(COPY_OP_EXPIRED);
  });

  it("shows an already ended coupon as ended when the parent promotion has not started", () => {
    const at = OPEN_AT;
    const promo = promotion({ startsAt: "2099-01-01T00:00:00.000Z", endsAt: "2099-02-01T00:00:00.000Z" });
    const ended = coupon("OLD", "active", {
      startsAt: "2020-01-01T00:00:00.000Z",
      endsAt: "2020-02-01T00:00:00.000Z",
    });
    expect(classifyCouponCustomerReadiness({ coupon: ended, promotion: promo, at })).toBe("expired");
    const result = ready(at, promo, [ended]);
    expect(result.headline).toBe(COPY_OP_EXPIRED);
    expect(result.couponReadiness[0]?.label).toBe(COPY_OP_STATE_ENDED);
    expect(result.promotionWindowLabel).toBe(`Saved promotion window: ${COPY_OP_STATE_NOT_STARTED}`);
    expect(result.customerReadyCouponCodes).toEqual([]);
  });

  it("lets an exclusive promotion end block an inclusive coupon start at the same instant", () => {
    const at = new Date(couponStart);
    const promo = promotion({ startsAt: "2026-01-01T00:00:00.000Z", endsAt: couponStart });
    const starting = coupon("SAVE10", "active", { startsAt: couponStart, endsAt: couponEnd });
    expect(classifyCouponCustomerReadiness({ coupon: starting, promotion: promo, at })).toBe(
      "expired",
    );
    expect(ready(at, promo, [starting]).customerReadyCouponCodes).toEqual([]);
  });

  it("does not treat an active status as customer-ready when the coupon has not started", () => {
    const at = OPEN_AT;
    const future = coupon("SOON", "active", {
      startsAt: "2099-01-01T00:00:00.000Z",
      endsAt: "2099-02-01T00:00:00.000Z",
    });
    const result = ready(at, promotion(), [future]);
    expect(result.activeCouponCodes).toEqual(["SOON"]);
    expect(result.customerReadyCouponCodes).toEqual([]);
    expect(result.headline).toBe(COPY_OP_SCHEDULED);
  });

  it("keeps a currently effective code ready when another active code is not", () => {
    const at = new Date(couponStart);
    const parent = promotion({ startsAt: "2026-01-01T00:00:00.000Z", endsAt: null });
    const readyCode = coupon("NOW", "active", { startsAt: couponStart, endsAt: couponEnd });
    const later = coupon("LATER", "active", {
      startsAt: "2099-01-01T00:00:00.000Z",
      endsAt: null,
    });
    const result = ready(at, parent, [readyCode, later]);
    expect(result.headline).toBe(COPY_OP_LIVE_WITH_COUPON);
    expect(result.customerReadyCouponCodes).toEqual(["NOW"]);
    expect(result.couponReadiness.map((row) => [row.code, row.label])).toEqual([
      ["NOW", COPY_OP_STATE_CURRENT],
      ["LATER", COPY_OP_STATE_NOT_STARTED],
    ]);
  });

  it("names both not-started and ended coupons when neither is customer-ready", () => {
    const at = OPEN_AT;
    const parent = promotion();
    const result = ready(at, parent, [
      coupon("SOON", "active", { startsAt: "2099-01-01T00:00:00.000Z", endsAt: null }),
      coupon("OLD", "active", { startsAt: "2020-01-01T00:00:00.000Z", endsAt: "2020-02-01T00:00:00.000Z" }),
    ]);
    expect(result.headline).toBe(COPY_OP_NOT_CURRENTLY_EFFECTIVE);
    expect(result.customerReadyCouponCodes).toEqual([]);
    expect(result.couponReadiness.map((row) => row.state)).toEqual(["scheduled", "expired"]);
  });

  it("reports inactive, unknown, and missing-parent coupons instead of customer-ready", () => {
    const at = new Date(couponStart);
    const parent = promotion({ startsAt: promotionStart, endsAt: null });
    const draft = coupon("DRAFT1", "draft", { startsAt: couponStart, endsAt: couponEnd });
    expect(classifyCouponCustomerReadiness({ coupon: draft, promotion: parent, at })).toBe(
      "inactive",
    );

    const missingZone = coupon("BAD", "active", { startsAt: "2026-06-15T00:00:00", endsAt: null });
    expect(classifyCouponCustomerReadiness({ coupon: missingZone, promotion: parent, at })).toBe(
      "unknown",
    );
    const inverted = coupon("FLIP", "active", { startsAt: couponEnd, endsAt: couponStart });
    expect(classifyCouponCustomerReadiness({ coupon: inverted, promotion: parent, at })).toBe(
      "unknown",
    );
    const orphan = coupon("ORPHAN", "active", { promotionId: "other" });
    expect(classifyCouponCustomerReadiness({ coupon: orphan, promotion: parent, at })).toBe(
      "unknown",
    );
    expect(classifyCouponCustomerReadiness({ coupon: orphan, promotion: null, at })).toBe(
      "unknown",
    );

    const impossibleDay = coupon("DAY", "active", {
      startsAt: "2026-02-31T00:00:00.000Z",
      endsAt: null,
    });
    expect(classifySavedWindow({
      startsAt: impossibleDay.startsAt,
      endsAt: impossibleDay.endsAt,
      at,
      requireStartsAt: false,
    })).toBe("unknown");

    const result = ready(at, parent, [missingZone]);
    expect(result.headline).toBe(COPY_OP_WINDOW_UNREADABLE);
    expect(result.customerReadyCouponCodes).toEqual([]);
    expect(result.couponReadiness[0]?.label).toBe(COPY_OP_STATE_UNKNOWN);
  });

  it("does not call an automatic promotion customer-ready outside its window", () => {
    const before = new Date(new Date(promotionStart).getTime() - 1);
    const atEnd = new Date(promotionEnd);
    const promo = promotion({
      triggerType: "automatic",
      startsAt: promotionStart,
      endsAt: promotionEnd,
    });
    expect(
      promotionReadiness({
        promotion: promo,
        benefit: BENEFIT,
        coupons: [],
        couponsReadable: false,
        at: before,
      }).headline,
    ).toBe(COPY_OP_SCHEDULED);
    expect(
      promotionReadiness({
        promotion: promo,
        benefit: BENEFIT,
        coupons: [],
        couponsReadable: false,
        at: atEnd,
      }).headline,
    ).toBe(COPY_OP_EXPIRED);
    expect(
      promotionReadiness({
        promotion: promotion({ triggerType: "automatic", startsAt: "not-a-time", endsAt: null }),
        benefit: BENEFIT,
        coupons: [],
        couponsReadable: false,
        at: OPEN_AT,
      }).headline,
    ).toBe(COPY_OP_WINDOW_UNREADABLE);
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
