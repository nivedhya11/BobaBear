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
  COPY_OP_EXPIRED,
  COPY_OP_EXPIRED_NEXT,
  COPY_OP_GIFT,
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

/**
 * Operator workflow cue for saved windows. Not eligibility.
 * `scheduled` is not-yet-effective. `currently_effective` is inside the window.
 * `inactive` is draft, disabled, or retired. `unknown` is an unreadable fact.
 */
export type CustomerReadinessState =
  | "currently_effective"
  | "scheduled"
  | "expired"
  | "inactive"
  | "unknown";

export type CouponReadinessRow = Readonly<{
  id: string;
  code: string;
  state: CustomerReadinessState;
  label: string;
}>;

export type PromotionReadiness = Readonly<{
  tone: ReadinessTone;
  headline: string;
  nextStep: string | null;
  /** Lifecycle `active` codes. Not proof of customer readiness. */
  activeCouponCodes: readonly string[];
  /** Codes whose status and both saved windows are currently effective. */
  customerReadyCouponCodes: readonly string[];
  couponReadiness: readonly CouponReadinessRow[];
  promotionWindowLabel: string;
  cue: string;
  steps: readonly ReadinessStep[];
}>;

type WindowBound = Date | null | "invalid";

/**
 * Visible saved instants only. A timezone-less or impossible calendar value is
 * unreadable. Null means the bound was not saved.
 */
function parseVisibleInstant(value: string): Date | "invalid" {
  const match =
    /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.(\d{1,3}))?(Z|[+-](\d{2}):(\d{2}))$/.exec(
      value.trim(),
    );
  if (!match) return "invalid";
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const hour = Number(match[4]);
  const minute = Number(match[5]);
  const second = Number(match[6]);
  const fraction = match[7] ?? "";
  const millisecond = Number((fraction + "000").slice(0, 3));
  if (month < 1 || month > 12 || hour > 23 || minute > 59 || second > 59) return "invalid";
  const calendar = new Date(Date.UTC(year, month - 1, day));
  if (
    calendar.getUTCFullYear() !== year ||
    calendar.getUTCMonth() !== month - 1 ||
    calendar.getUTCDate() !== day
  ) {
    return "invalid";
  }
  let offsetMinutes = 0;
  if (match[8] !== "Z") {
    const offsetHour = Number(match[9]);
    const offsetMinute = Number(match[10]);
    if (offsetHour > 23 || offsetMinute > 59) return "invalid";
    offsetMinutes = offsetHour * 60 + offsetMinute;
    if (match[8].startsWith("-")) offsetMinutes = -offsetMinutes;
  }
  const utc = Date.UTC(year, month - 1, day, hour, minute, second, millisecond) - offsetMinutes * 60_000;
  if (!Number.isFinite(utc)) return "invalid";
  return new Date(utc);
}

function parseWindowBound(value: string | null | undefined, required: boolean): WindowBound {
  if (value == null) return required ? "invalid" : null;
  if (typeof value !== "string" || value.trim() === "") return "invalid";
  return parseVisibleInstant(value);
}

function validClock(at: Date): boolean {
  return at instanceof Date && Number.isFinite(at.getTime());
}

/**
 * Start is inclusive and end is exclusive, matching `isPromotionEffective` and
 * the coupon window checks in the promotion evaluator. This does not decide
 * eligibility, money, or per-customer applicability.
 */
export function classifySavedWindow(input: {
  startsAt: string | null;
  endsAt: string | null;
  at: Date;
  requireStartsAt: boolean;
}): Exclude<CustomerReadinessState, "inactive"> {
  if (!validClock(input.at)) return "unknown";
  const start = parseWindowBound(input.startsAt, input.requireStartsAt);
  const end = parseWindowBound(input.endsAt, false);
  if (start === "invalid" || end === "invalid") return "unknown";
  if (start && end && end.getTime() <= start.getTime()) return "unknown";
  const at = input.at.getTime();
  if (end && at >= end.getTime()) return "expired";
  if (start && at < start.getTime()) return "scheduled";
  return "currently_effective";
}

function combineWindows(
  left: Exclude<CustomerReadinessState, "inactive">,
  right: Exclude<CustomerReadinessState, "inactive">,
): Exclude<CustomerReadinessState, "inactive"> {
  if (left === "unknown" || right === "unknown") return "unknown";
  if (left === "expired" || right === "expired") return "expired";
  if (left === "scheduled" || right === "scheduled") return "scheduled";
  return "currently_effective";
}

export function customerReadinessLabel(state: CustomerReadinessState): string {
  switch (state) {
    case "currently_effective":
      return COPY_OP_STATE_CURRENT;
    case "scheduled":
      return COPY_OP_STATE_NOT_STARTED;
    case "expired":
      return COPY_OP_STATE_ENDED;
    case "inactive":
      return COPY_OP_STATE_INACTIVE;
    case "unknown":
      return COPY_OP_STATE_UNKNOWN;
  }
}

export function classifyPromotionCustomerReadiness(input: {
  promotion: Pick<Promotion, "status" | "startsAt" | "endsAt">;
  at: Date;
}): CustomerReadinessState {
  if (input.promotion.status !== "active") return "inactive";
  return classifySavedWindow({
    startsAt: input.promotion.startsAt,
    endsAt: input.promotion.endsAt,
    at: input.at,
    requireStartsAt: true,
  });
}

export function classifyCouponCustomerReadiness(input: {
  coupon: Pick<Coupon, "status" | "startsAt" | "endsAt" | "promotionId">;
  promotion: Pick<Promotion, "id" | "status" | "startsAt" | "endsAt"> | null;
  at: Date;
}): CustomerReadinessState {
  const promotion = input.promotion;
  if (!promotion || promotion.id !== input.coupon.promotionId) return "unknown";
  if (input.coupon.status !== "active" || promotion.status !== "active") return "inactive";
  return combineWindows(
    classifySavedWindow({
      startsAt: input.coupon.startsAt,
      endsAt: input.coupon.endsAt,
      at: input.at,
      requireStartsAt: false,
    }),
    classifySavedWindow({
      startsAt: promotion.startsAt,
      endsAt: promotion.endsAt,
      at: input.at,
      requireStartsAt: true,
    }),
  );
}

function readinessResult(
  partial: Omit<PromotionReadiness, "cue" | "promotionWindowLabel"> & {
    promotionWindowLabel: string;
  },
): PromotionReadiness {
  return { ...partial, cue: COPY_OP_READINESS_CUE };
}

export function promotionReadiness(input: {
  promotion: Promotion;
  benefit: unknown;
  coupons: readonly Coupon[];
  couponsReadable: boolean;
  /** Fixed clock for the saved windows. Defaults to the render instant. */
  at?: Date;
}): PromotionReadiness {
  const { promotion, coupons, couponsReadable } = input;
  const at = input.at ?? new Date();
  const isCoupon = promotion.triggerType === "coupon";
  const activeCouponCodes = couponsReadable
    ? coupons.filter((c) => c.status === "active").map((c) => c.canonicalCode)
    : [];
  const couponReadiness: CouponReadinessRow[] =
    isCoupon && couponsReadable
      ? coupons.map((coupon) => {
          const state = classifyCouponCustomerReadiness({ coupon, promotion, at });
          return {
            id: coupon.id,
            code: coupon.canonicalCode,
            state,
            label: customerReadinessLabel(state),
          };
        })
      : [];
  const customerReadyCouponCodes = couponReadiness
    .filter((row) => row.state === "currently_effective")
    .map((row) => row.code);
  const promotionState = classifyPromotionCustomerReadiness({ promotion, at });
  const promotionWindowLabel = `Saved promotion window: ${customerReadinessLabel(promotionState)}`;
  const benefitSet = input.benefit != null && typeof input.benefit === "object";
  const steps: ReadinessStep[] = [
    { label: "Set the benefit and who gets it", done: benefitSet },
    { label: "Activate the promotion", done: promotion.status !== "draft" },
    { label: "Inside the saved window", done: promotionState === "currently_effective" },
  ];
  if (isCoupon) {
    steps.push(
      { label: "Create a coupon code customers type", done: couponsReadable && coupons.length > 0 },
      { label: "Activate the coupon code", done: activeCouponCodes.length > 0 },
      {
        label: "Coupon code is inside both saved windows",
        done: customerReadyCouponCodes.length > 0,
      },
    );
  }
  steps.push({ label: "Check applications and redemptions below", done: false });

  const base = {
    activeCouponCodes,
    customerReadyCouponCodes,
    couponReadiness,
    promotionWindowLabel,
    steps,
  };

  if (promotion.status === "retired") {
    return readinessResult({
      ...base,
      tone: "neutral",
      headline: COPY_OP_RETIRED,
      nextStep: null,
    });
  }
  if (promotion.status !== "active") {
    return readinessResult({
      ...base,
      tone: "neutral",
      headline: COPY_OP_DRAFT,
      nextStep: isCoupon
        ? "Set the benefit, then Review & activate. After that, create a coupon code and activate it."
        : "Set the benefit, then Review & activate.",
    });
  }
  const activeIds = new Set(
    coupons.filter((coupon) => coupon.status === "active").map((coupon) => coupon.id),
  );
  const activeRows = couponReadiness.filter((row) => activeIds.has(row.id));
  const activeCouponExplainsWindow = isCoupon && couponsReadable && activeRows.length > 0;
  if (!activeCouponExplainsWindow && promotionState === "unknown") {
    return readinessResult({
      ...base,
      tone: "warning",
      headline: COPY_OP_WINDOW_UNREADABLE,
      nextStep: null,
    });
  }
  if (!activeCouponExplainsWindow && promotionState === "scheduled") {
    return readinessResult({
      ...base,
      tone: "warning",
      headline: COPY_OP_SCHEDULED,
      nextStep: COPY_OP_SCHEDULED_NEXT,
    });
  }
  if (!activeCouponExplainsWindow && promotionState === "expired") {
    return readinessResult({
      ...base,
      tone: "warning",
      headline: COPY_OP_EXPIRED,
      nextStep: COPY_OP_EXPIRED_NEXT,
    });
  }
  if (!isCoupon) {
    return readinessResult({
      ...base,
      tone: "success",
      headline: COPY_OP_LIVE,
      nextStep: null,
    });
  }
  if (!couponsReadable) {
    return readinessResult({
      ...base,
      tone: "warning",
      headline: COPY_OP_COUPONS_UNREADABLE,
      nextStep: null,
    });
  }
  if (customerReadyCouponCodes.length > 0) {
    return readinessResult({
      ...base,
      tone: "success",
      headline: COPY_OP_LIVE_WITH_COUPON,
      nextStep: null,
    });
  }
  if (activeRows.some((row) => row.state === "unknown")) {
    return readinessResult({
      ...base,
      tone: "warning",
      headline: COPY_OP_WINDOW_UNREADABLE,
      nextStep: null,
    });
  }
  const hasScheduled = activeRows.some((row) => row.state === "scheduled");
  const hasExpired = activeRows.some((row) => row.state === "expired");
  if (hasScheduled && hasExpired) {
    return readinessResult({
      ...base,
      tone: "warning",
      headline: COPY_OP_NOT_CURRENTLY_EFFECTIVE,
      nextStep: null,
    });
  }
  if (hasScheduled) {
    return readinessResult({
      ...base,
      tone: "warning",
      headline: COPY_OP_SCHEDULED,
      nextStep: COPY_OP_SCHEDULED_NEXT,
    });
  }
  if (hasExpired) {
    return readinessResult({
      ...base,
      tone: "warning",
      headline: COPY_OP_EXPIRED,
      nextStep: COPY_OP_EXPIRED_NEXT,
    });
  }
  return readinessResult({
    ...base,
    tone: "warning",
    headline: COPY_OP_LIVE_WITHOUT_COUPON,
    nextStep: coupons.length === 0 ? COPY_OP_NO_COUPON_CODES : COPY_OP_NO_ACTIVE_COUPON_CODES,
  });
}
