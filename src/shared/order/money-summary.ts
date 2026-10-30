/**
 * Customer order monetary summary from immutable checkout snapshot (IMP-036C).
 */

import type { CheckoutSnapshot } from "../../shared/checkout";
import { serializeMoneyMinor } from "./canonicalize";
import { sealedCustomerSavingSplit } from "./purchased-savings";

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
  /** Positive purchased merchandise/order saving. Zero when none was sealed. */
  orderSavingMinor: string;
  /** Positive purchased delivery-charge saving. Zero when none was sealed. */
  deliverySavingMinor: string;
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
  return sealedCustomerSavingSplit(snapshot).totalSavedPaise;
}

export function moneySummaryFromSnapshot(snapshot: CheckoutSnapshot): OrderMoneySummary {
  const merchandisePaise =
    snapshot.prePromotionSubtotalPaise - snapshot.chargesPaise;
  const saving = sealedCustomerSavingSplit(snapshot);
  return Object.freeze({
    prePromotionSubtotalMinor: serializeMoneyMinor(
      merchandisePaise < BigInt(0) ? BigInt(0) : merchandisePaise,
    ),
    promotionDiscountMinor: serializeMoneyMinor(saving.totalSavedPaise),
    orderSavingMinor: serializeMoneyMinor(saving.orderSavingPaise),
    deliverySavingMinor: serializeMoneyMinor(saving.deliverySavingPaise),
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
