/**
 * Sanitized first-difference diagnostic for checkout snapshot structural equality.
 *
 * Read-only. No values, PII, coupon secrets, payment IDs, or raw identifiers.
 * Category order mirrors {@link checkoutSnapshotsStructurallyEqual}.
 */

import type { CheckoutSnapshot } from "../../shared/checkout";
import { snapshotFulfilmentShapesEqual } from "../../shared/checkout";
import { checkoutSnapshotsStructurallyEqual } from "./compare-snapshots";

export const CHECKOUT_SNAPSHOT_STRUCTURAL_DIFFERENCE_CATEGORIES = Object.freeze([
  "SOURCE_CART_REVISION",
  "SELECTED_OUTLET",
  "COUPON_SEAL",
  "CURRENCY_OR_TAX_MODE",
  "FULFILMENT_SHAPE",
  "MONETARY_COMPONENT",
  "ITEM_LINE_STRUCTURE",
  "MODIFIER_STRUCTURE",
  "BUNDLE_STRUCTURE",
  "CHARGE_STRUCTURE",
  "PROMOTION_EFFECT",
  "TAX_COMPONENT",
  "UNKNOWN",
] as const);

export type CheckoutSnapshotStructuralDifferenceCategory =
  (typeof CHECKOUT_SNAPSHOT_STRUCTURAL_DIFFERENCE_CATEGORIES)[number];

export type CheckoutSnapshotStructuralDifferenceExplanation = Readonly<{
  equal: boolean;
  firstDifferenceCategory: CheckoutSnapshotStructuralDifferenceCategory | null;
}>;

/**
 * Returns whether snapshots are structurally equal and, when not, the first
 * allowlisted difference category. Never includes field values.
 */
export function explainCheckoutSnapshotStructuralDifference(
  a: CheckoutSnapshot,
  b: CheckoutSnapshot,
): CheckoutSnapshotStructuralDifferenceExplanation {
  const equal = checkoutSnapshotsStructurallyEqual(a, b);
  if (equal) {
    return Object.freeze({ equal: true, firstDifferenceCategory: null });
  }
  return Object.freeze({
    equal: false,
    firstDifferenceCategory: firstDifferenceCategory(a, b),
  });
}

function firstDifferenceCategory(
  a: CheckoutSnapshot,
  b: CheckoutSnapshot,
): CheckoutSnapshotStructuralDifferenceCategory {
  if (a.sourceCartRevision !== b.sourceCartRevision) {
    return "SOURCE_CART_REVISION";
  }
  if (a.selectedOutletId !== b.selectedOutletId) {
    return "SELECTED_OUTLET";
  }
  if (a.manualCouponCode !== b.manualCouponCode) {
    return "COUPON_SEAL";
  }
  if (a.currency !== b.currency || a.taxInclusionMode !== b.taxInclusionMode) {
    return "CURRENCY_OR_TAX_MODE";
  }
  if (!snapshotFulfilmentShapesEqual(a, b)) {
    return "FULFILMENT_SHAPE";
  }
  if (
    a.basePaise !== b.basePaise ||
    a.modifierAdjustmentsPaise !== b.modifierAdjustmentsPaise ||
    a.bundleAdjustmentsPaise !== b.bundleAdjustmentsPaise ||
    a.chargesPaise !== b.chargesPaise ||
    a.prePromotionSubtotalPaise !== b.prePromotionSubtotalPaise ||
    a.promotionDiscountPaise !== b.promotionDiscountPaise ||
    a.taxablePaise !== b.taxablePaise ||
    a.taxPaise !== b.taxPaise ||
    a.grandTotalPaise !== b.grandTotalPaise
  ) {
    return "MONETARY_COMPONENT";
  }

  const lineCategory = linesFirstDifference(a.lines, b.lines);
  if (lineCategory) return lineCategory;

  if (!chargesEqual(a.charges, b.charges)) {
    return "CHARGE_STRUCTURE";
  }
  if (!promotionEffectsEqual(a.promotionEffects, b.promotionEffects)) {
    return "PROMOTION_EFFECT";
  }
  if (!taxComponentsEqual(a.taxComponents, b.taxComponents)) {
    return "TAX_COMPONENT";
  }
  return "UNKNOWN";
}

function linesFirstDifference(
  a: CheckoutSnapshot["lines"],
  b: CheckoutSnapshot["lines"],
): CheckoutSnapshotStructuralDifferenceCategory | null {
  if (a.length !== b.length) return "ITEM_LINE_STRUCTURE";
  for (let i = 0; i < a.length; i++) {
    const x = a[i]!;
    const y = b[i]!;
    if (
      x.sourceCartLineId !== y.sourceCartLineId ||
      x.lineOrigin !== y.lineOrigin ||
      x.productId !== y.productId ||
      x.variantId !== y.variantId ||
      x.productName !== y.productName ||
      x.variantName !== y.variantName ||
      x.quantity !== y.quantity ||
      x.sequence !== y.sequence ||
      x.lineBasePaise !== y.lineBasePaise ||
      x.lineModifierAdjustmentsPaise !== y.lineModifierAdjustmentsPaise ||
      x.lineBundleAdjustmentsPaise !== y.lineBundleAdjustmentsPaise ||
      x.lineSubtotalPaise !== y.lineSubtotalPaise ||
      x.linePromotionDiscountPaise !== y.linePromotionDiscountPaise ||
      x.lineTaxablePaise !== y.lineTaxablePaise ||
      x.lineTaxPaise !== y.lineTaxPaise ||
      x.lineTotalPaise !== y.lineTotalPaise
    ) {
      return "ITEM_LINE_STRUCTURE";
    }
    if (!modifiersEqual(x.modifiers, y.modifiers)) {
      return "MODIFIER_STRUCTURE";
    }
    if (!bundlesEqual(x.bundleSelections, y.bundleSelections)) {
      return "BUNDLE_STRUCTURE";
    }
  }
  return null;
}

function modifiersEqual(
  a: CheckoutSnapshot["lines"][number]["modifiers"],
  b: CheckoutSnapshot["lines"][number]["modifiers"],
): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    const x = a[i]!;
    const y = b[i]!;
    if (
      x.variantModifierGroupId !== y.variantModifierGroupId ||
      x.modifierGroupOptionId !== y.modifierGroupOptionId ||
      x.quantity !== y.quantity ||
      x.groupName !== y.groupName ||
      x.optionName !== y.optionName ||
      x.unitDeltaPaise !== y.unitDeltaPaise
    ) {
      return false;
    }
  }
  return true;
}

function bundlesEqual(
  a: CheckoutSnapshot["lines"][number]["bundleSelections"],
  b: CheckoutSnapshot["lines"][number]["bundleSelections"],
): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    const x = a[i]!;
    const y = b[i]!;
    if (
      x.bundleGroupOptionId !== y.bundleGroupOptionId ||
      x.selectedVariantId !== y.selectedVariantId ||
      x.quantity !== y.quantity ||
      x.groupName !== y.groupName ||
      x.optionName !== y.optionName ||
      x.variantName !== y.variantName ||
      x.unitDeltaPaise !== y.unitDeltaPaise
    ) {
      return false;
    }
    if (!modifiersEqual(x.modifiers, y.modifiers)) return false;
  }
  return true;
}

function chargesEqual(
  a: CheckoutSnapshot["charges"],
  b: CheckoutSnapshot["charges"],
): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    const x = a[i]!;
    const y = b[i]!;
    if (
      x.chargeDefinitionId !== y.chargeDefinitionId ||
      x.chargeCode !== y.chargeCode ||
      x.calculationMode !== y.calculationMode ||
      x.amountPaise !== y.amountPaise ||
      x.name !== y.name ||
      x.sortOrder !== y.sortOrder
    ) {
      return false;
    }
  }
  return true;
}

function promotionEffectsEqual(
  a: CheckoutSnapshot["promotionEffects"],
  b: CheckoutSnapshot["promotionEffects"],
): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    const x = a[i]!;
    const y = b[i]!;
    if (
      x.effectKind !== y.effectKind ||
      x.promotionId !== y.promotionId ||
      x.couponId !== y.couponId ||
      x.promotionCode !== y.promotionCode ||
      x.displayName !== y.displayName ||
      x.triggerType !== y.triggerType ||
      x.stackingPolicy !== y.stackingPolicy ||
      x.componentId !== y.componentId ||
      x.lineId !== y.lineId ||
      x.amountPaise !== y.amountPaise ||
      x.realizedDiscountPaise !== y.realizedDiscountPaise ||
      x.rewardVariantId !== y.rewardVariantId ||
      x.rewardUnitId !== y.rewardUnitId ||
      x.rewardQuantity !== y.rewardQuantity ||
      x.rewardBasePaise !== y.rewardBasePaise ||
      x.sortOrder !== y.sortOrder ||
      x.promotionRevision !== y.promotionRevision
    ) {
      return false;
    }
  }
  return true;
}

function taxComponentsEqual(
  a: CheckoutSnapshot["taxComponents"],
  b: CheckoutSnapshot["taxComponents"],
): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    const x = a[i]!;
    const y = b[i]!;
    if (
      x.targetContext !== y.targetContext ||
      x.taxType !== y.taxType ||
      x.rateBps !== y.rateBps ||
      x.taxableAmountPaise !== y.taxableAmountPaise ||
      x.taxAmountPaise !== y.taxAmountPaise ||
      x.sortOrder !== y.sortOrder
    ) {
      return false;
    }
  }
  return true;
}
