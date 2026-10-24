/**
 * Operator readiness and customer-meaning projection for the Promotions editor (IMP-036J).
 *
 * Presentation only. Reads already-loaded Promotion / benefit / Coupon data and never
 * decides eligibility, money, or permission; the server remains authoritative.
 */
import { formatInrFromPaise } from "@/lib/administration/commercial-money";
import type { Coupon, Promotion } from "@/lib/administration/commercial-promotions";
import {
  COPY_OP_COUPONS_UNREADABLE,
  COPY_OP_DELIVERY,
  COPY_OP_DRAFT,
  COPY_OP_GIFT,
  COPY_OP_LIVE,
  COPY_OP_LIVE_WITH_COUPON,
  COPY_OP_LIVE_WITHOUT_COUPON,
  COPY_OP_NO_ACTIVE_COUPON_CODES,
  COPY_OP_NO_COUPON_CODES,
  COPY_OP_RETIRED,
} from "@/shared/promotions/operator-copy";

/** Mirrors the `promotions_code_format_check` database constraint. */
const PROMOTION_IDENTIFIER_PATTERN = /^[a-z0-9][a-z0-9_-]*$/;
/** Mirrors coupon canonicalisation (trim + upper case) in `normalizeCouponCode`. */
const COUPON_CODE_PATTERN = /^[A-Z0-9][A-Z0-9_-]*$/;

export function isValidPromotionIdentifier(raw: string): boolean {
  const value = raw.trim();
  return value.length >= 1 && value.length <= 64 && PROMOTION_IDENTIFIER_PATTERN.test(value);
}

export function isValidCouponCode(raw: string): boolean {
  const value = raw.trim().toUpperCase();
  return value.length >= 3 && value.length <= 64 && COUPON_CODE_PATTERN.test(value);
}

type BenefitShape = Readonly<{
  benefitType?: string;
  percentageBps?: number | null;
  fixedAmountPaise?: string | null;
  maximumDiscountPaise?: string | null;
  buyQuantity?: number | null;
  getQuantity?: number | null;
  repeatable?: boolean | null;
}>;

function formatPercentFromBps(bps: number): string {
  const whole = Math.trunc(bps / 100);
  const fraction = Math.abs(bps % 100);
  if (fraction === 0) return `${whole}%`;
  return `${whole}.${fraction.toString().padStart(2, "0").replace(/0$/, "")}%`;
}

export function describeBenefitForOperator(benefit: unknown): string {
  if (!benefit || typeof benefit !== "object") return "No benefit set yet.";
  const b = benefit as BenefitShape;
  switch (b.benefitType) {
    case "percentage_discount": {
      if (typeof b.percentageBps !== "number") return "Percentage discount (amount not set).";
      const cap = b.maximumDiscountPaise
        ? ` (up to ${formatInrFromPaise(b.maximumDiscountPaise)})`
        : "";
      return `${formatPercentFromBps(b.percentageBps)} off eligible items${cap}.`;
    }
    case "fixed_amount_discount":
      return b.fixedAmountPaise
        ? `${formatInrFromPaise(b.fixedAmountPaise)} off eligible items.`
        : "Fixed amount discount (amount not set).";
    case "buy_x_get_y":
      return `Buy ${b.buyQuantity ?? "?"} get ${b.getQuantity ?? "?"}${
        b.repeatable ? ", repeatable" : ""
      }.`;
    case "delivery_fee_waiver":
      return `${COPY_OP_DELIVERY}: the delivery charge is waived.`;
    case "complimentary_item":
      return `${COPY_OP_GIFT}.`;
    default:
      return "Benefit type not recognised.";
  }
}

function describeModes(modes: readonly string[] | null): string {
  if (!modes || modes.length === 0 || (modes.includes("DELIVERY") && modes.includes("PICKUP"))) {
    return "Delivery and pickup orders.";
  }
  if (modes.includes("DELIVERY")) return "Delivery orders only. Pickup orders don't get it.";
  return "Pickup orders only. Delivery orders don't get it.";
}

function describeTimings(timings: readonly string[] | null): string {
  if (!timings || timings.length === 0 || (timings.includes("ASAP") && timings.includes("SCHEDULED"))) {
    return "ASAP and scheduled orders.";
  }
  return timings.includes("ASAP") ? "ASAP orders only." : "Scheduled orders only.";
}

/** Who gets the offer and its limits, in the operator's words. */
export function describeEligibilityForOperator(promotion: Promotion): readonly string[] {
  const lines = [describeModes(promotion.eligibleFulfilmentModes), describeTimings(promotion.eligibleFulfilmentTimings)];
  if (promotion.firstOrderOnly) lines.push("First order only.");
  if (promotion.minimumQualifyingAmountPaise) {
    lines.push(`Minimum order ${formatInrFromPaise(promotion.minimumQualifyingAmountPaise)}.`);
  }
  if (promotion.minimumItemQuantity != null) {
    lines.push(`Minimum ${promotion.minimumItemQuantity} items.`);
  }
  if (promotion.maximumRedemptions == null && promotion.maximumRedemptionsPerCustomer == null) {
    lines.push("No redemption limits.");
  } else {
    if (promotion.maximumRedemptions != null) {
      lines.push(`Up to ${promotion.maximumRedemptions} redemptions in total.`);
    }
    if (promotion.maximumRedemptionsPerCustomer != null) {
      lines.push(`Up to ${promotion.maximumRedemptionsPerCustomer} per customer.`);
    }
  }
  return lines;
}

export type ReadinessTone = "neutral" | "success" | "warning";

export type ReadinessStep = Readonly<{ label: string; done: boolean }>;

export type PromotionReadiness = Readonly<{
  tone: ReadinessTone;
  headline: string;
  nextStep: string | null;
  activeCouponCodes: readonly string[];
  steps: readonly ReadinessStep[];
}>;

export function promotionReadiness(input: {
  promotion: Promotion;
  benefit: unknown;
  coupons: readonly Coupon[];
  couponsReadable: boolean;
}): PromotionReadiness {
  const { promotion, coupons, couponsReadable } = input;
  const isCoupon = promotion.triggerType === "coupon";
  const activeCouponCodes = couponsReadable
    ? coupons.filter((c) => c.status === "active").map((c) => c.canonicalCode)
    : [];
  const benefitSet = input.benefit != null && typeof input.benefit === "object";
  const isActive = promotion.status === "active";

  const steps: ReadinessStep[] = [
    { label: "Set the benefit and who gets it", done: benefitSet },
    { label: "Activate the promotion", done: promotion.status !== "draft" },
  ];
  if (isCoupon) {
    steps.push(
      { label: "Create a coupon code customers type", done: couponsReadable && coupons.length > 0 },
      { label: "Activate the coupon code", done: activeCouponCodes.length > 0 },
    );
  }
  steps.push({ label: "Check applications and redemptions below", done: false });

  if (promotion.status === "retired") {
    return { tone: "neutral", headline: COPY_OP_RETIRED, nextStep: null, activeCouponCodes, steps };
  }
  if (!isActive) {
    return {
      tone: "neutral",
      headline: COPY_OP_DRAFT,
      nextStep: isCoupon
        ? "Set the benefit, then Review & activate. After that, create a coupon code and activate it."
        : "Set the benefit, then Review & activate.",
      activeCouponCodes,
      steps,
    };
  }
  if (!isCoupon) {
    return { tone: "success", headline: COPY_OP_LIVE, nextStep: null, activeCouponCodes, steps };
  }
  if (!couponsReadable) {
    return {
      tone: "warning",
      headline: COPY_OP_COUPONS_UNREADABLE,
      nextStep: null,
      activeCouponCodes,
      steps,
    };
  }
  if (activeCouponCodes.length > 0) {
    return {
      tone: "success",
      headline: COPY_OP_LIVE_WITH_COUPON,
      nextStep: null,
      activeCouponCodes,
      steps,
    };
  }
  return {
    tone: "warning",
    headline: COPY_OP_LIVE_WITHOUT_COUPON,
    nextStep: coupons.length === 0 ? COPY_OP_NO_COUPON_CODES : COPY_OP_NO_ACTIVE_COUPON_CODES,
    activeCouponCodes,
    steps,
  };
}
