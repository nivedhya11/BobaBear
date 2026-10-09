/**
 * Map coupon mutation outcomes to locked Design Readiness copy.
 * Definitive finished results vs incomplete transport failures.
 */

import { couponStatusCopy } from "@/components/ordering/commercial-explanation-presentation";
import type { WireCommercialExplanation } from "@/components/ordering/commercial-explanation-presentation";
import { IMP036J_COPY } from "@/components/ordering/imp036j-copy";

export type CouponFieldStatus = Readonly<{
  text: string;
  tone: "polite" | "alert";
  invalid: boolean;
  retryVisible: boolean;
  showSignIn: boolean;
}>;

const DEFINITIVE_COUPON_CODES: Readonly<Record<string, string>> = Object.freeze({
  CART_COUPON_UNKNOWN: IMP036J_COPY.INVALID,
  COUPON_EXPIRED: IMP036J_COPY.EXPIRED,
  CART_COUPON_EXPIRED: IMP036J_COPY.EXPIRED,
  COUPON_CURRENTLY_INELIGIBLE: IMP036J_COPY.INAPPLICABLE,
  CHECKOUT_COUPON_INELIGIBLE: IMP036J_COPY.INAPPLICABLE,
  CUSTOMER_AUTH_REQUIRED: IMP036J_COPY.SIGN_IN,
});

const INCOMPLETE_TRANSPORT_CODES = new Set([
  "NETWORK_ERROR",
  "INVALID_RESPONSE",
  "CART_DEPENDENCY_UNAVAILABLE",
  "CHECKOUT_DEPENDENCY_INDETERMINATE",
  "PROMOTION_EVALUATION_UNAVAILABLE",
  "CHECKOUT_PROMOTION_INDETERMINATE",
  "CHECKOUT_TAX_INDETERMINATE",
  "CHECKOUT_PRICE_UNRESOLVED",
  "CHECKOUT_SERVICEABILITY_INDETERMINATE",
  "CHECKOUT_SERVICEABILITY_TEMPORARILY_UNAVAILABLE",
  "CHECKOUT_TEMPORARILY_UNAVAILABLE",
]);

export function isIncompleteCouponTransport(code: string | undefined): boolean {
  if (!code) return true;
  return INCOMPLETE_TRANSPORT_CODES.has(code);
}

/** True when Review may treat sealed snapshot + quote as the current payable. */
export function isReviewCommercialCurrent(input: {
  cartRevision: string | null | undefined;
  snapshotSourceCartRevision: string | null | undefined;
  hasReviewQuote: boolean;
}): boolean {
  if (!input.hasReviewQuote) return false;
  if (!input.cartRevision || !input.snapshotSourceCartRevision) return false;
  return input.cartRevision === input.snapshotSourceCartRevision;
}

export function definitiveCouponFailureCopy(code: string | undefined): string | null {
  if (!code) return null;
  return DEFINITIVE_COUPON_CODES[code] ?? null;
}

export function couponFieldStatusFromExplanation(input: {
  explanation: WireCommercialExplanation | null;
  fulfilmentMode?: "DELIVERY" | "PICKUP" | null;
  retainedAutomaticOffer?: boolean;
}): CouponFieldStatus | null {
  const mapped = couponStatusCopy(input);
  if (!mapped) return null;
  const submitted = input.explanation?.submittedCouponResult;
  const invalid =
    submitted?.status === "INVALID" ||
    submitted?.status === "NOT_APPLICABLE" ||
    submitted?.status === "CUSTOMER_IDENTITY_REQUIRED" ||
    submitted?.reasonCode === "NOT_EFFECTIVE" ||
    submitted?.reasonCode === "RETIRED" ||
    submitted?.reasonCode === "COUPON_EXPIRED" ||
    submitted?.reasonCode === "COUPON_NOT_EFFECTIVE" ||
    submitted?.reasonCode === "GLOBAL_CAP_REACHED" ||
    submitted?.reasonCode === "PERSONAL_CAP_REACHED" ||
    submitted?.reasonCode === "NO_QUALIFYING_CAPACITY" ||
    submitted?.reasonCode === "FULFILMENT_MODE_MISMATCH";
  return {
    text: mapped.text,
    tone: mapped.tone,
    invalid: Boolean(invalid),
    retryVisible: false,
    showSignIn: submitted?.status === "CUSTOMER_IDENTITY_REQUIRED",
  };
}

export function couponFieldStatusFromMutationFailure(code: string | undefined): CouponFieldStatus {
  const definitive = definitiveCouponFailureCopy(code);
  if (definitive) {
    return {
      text: definitive,
      tone: "alert",
      invalid: true,
      retryVisible: false,
      showSignIn: code === "CUSTOMER_AUTH_REQUIRED",
    };
  }
  return {
    text: IMP036J_COPY.RETRY,
    tone: "alert",
    invalid: false,
    retryVisible: true,
    showSignIn: false,
  };
}
