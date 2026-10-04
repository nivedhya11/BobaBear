/**
 * Customer order monetary summary from immutable checkout snapshot (IMP-036C).
 */

import type { CheckoutSnapshot } from "../../shared/checkout";
import { serializeMoneyMinor } from "./canonicalize";

export type OrderMoneySummaryCharge = Readonly<{
  chargeCode: string;
  name: string;
  amountMinor: string;
}>;

export type OrderMoneySummary = Readonly<{
  /** Merchandise-only subtotal (excludes itemized charges). */
  prePromotionSubtotalMinor: string;
  /**
   * Customer-facing monetary saving from sealed Promotion effects.
   * Excludes complimentary-item synthetic zeroing allocations.
   */
  promotionDiscountMinor: string;
  charges: readonly OrderMoneySummaryCharge[];
  taxMinor: string;
  grandTotalMinor: string;
  currency: "INR";
}>;

/**
 * Sealed customer monetary saving.
 * Complimentary gift lines are priced then internally allocated to zero; that
 * synthetic allocation must not appear as customer "You saved" money.
 */
export function customerMonetarySavingPaiseFromSnapshot(
  snapshot: Pick<CheckoutSnapshot, "promotionDiscountPaise" | "promotionEffects">,
): bigint {
  let complimentaryAllocation = BigInt(0);
  for (const effect of snapshot.promotionEffects) {
    if (
      effect.effectKind === "monetary_allocation" &&
      effect.snapshotLineId != null &&
      effect.amountPaise != null
    ) {
      complimentaryAllocation += effect.amountPaise;
    }
  }
  const customer = snapshot.promotionDiscountPaise - complimentaryAllocation;
  return customer < BigInt(0) ? BigInt(0) : customer;
}

export function moneySummaryFromSnapshot(snapshot: CheckoutSnapshot): OrderMoneySummary {
  const merchandisePaise =
    snapshot.prePromotionSubtotalPaise - snapshot.chargesPaise;
  return Object.freeze({
    prePromotionSubtotalMinor: serializeMoneyMinor(
      merchandisePaise < BigInt(0) ? BigInt(0) : merchandisePaise,
    ),
    promotionDiscountMinor: serializeMoneyMinor(
      customerMonetarySavingPaiseFromSnapshot(snapshot),
    ),
    charges: Object.freeze(
      snapshot.charges.map((charge) =>
        Object.freeze({
          chargeCode: charge.chargeCode,
          name: charge.name,
          amountMinor: serializeMoneyMinor(charge.amountPaise),
        }),
      ),
    ),
    taxMinor: serializeMoneyMinor(snapshot.taxPaise),
    grandTotalMinor: serializeMoneyMinor(snapshot.grandTotalPaise),
    currency: "INR",
  });
}
