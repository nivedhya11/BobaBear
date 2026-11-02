/**
 * Sealed customer-saving split from an immutable Checkout Snapshot.
 * Presentation and purchased order reads share this projection.
 * It does not recompute promotions, tax, charges, or payable.
 */

import { CHARGE_DEFINITION_DELIVERY_ID } from "../pricing/constants";

/** Canonical delivery-charge allocation identity. Not a charge-row amount. */
export const DELIVERY_SAVING_COMPONENT_ID =
  `charge:${CHARGE_DEFINITION_DELIVERY_ID}` as const;

export type SealedSavingAllocation = Readonly<{
  effectKind: string;
  amountPaise: bigint | null;
  snapshotLineId: string | null;
  componentId: string | null;
}>;

export type SealedCustomerSavingSplit = Readonly<{
  orderSavingPaise: bigint;
  deliverySavingPaise: bigint;
  totalSavedPaise: bigint;
}>;

function nonnegative(value: bigint): bigint {
  return value < BigInt(0) ? BigInt(0) : value;
}

/**
 * Order saving is the sum of nonnegative non-delivery `monetary_allocation`
 * rows. Delivery saving is the sum of nonnegative rows whose componentId is
 * exactly `DELIVERY_SAVING_COMPONENT_ID`. A non-empty snapshotLineId marks a
 * complimentary synthetic allocation and is excluded from both.
 * Total saved stays the existing customer saving: sealed promotion discount
 * minus those complimentary allocations. An unexplained remainder is not
 * relabeled as order saving. Recognized components are capped so they cannot
 * exceed that sealed customer saving.
 */
export function sealedCustomerSavingSplit(input: {
  promotionDiscountPaise: bigint;
  promotionEffects: readonly SealedSavingAllocation[];
}): SealedCustomerSavingSplit {
  let complimentaryAllocation = BigInt(0);
  let recognizedDelivery = BigInt(0);
  let recognizedOrder = BigInt(0);
  for (const effect of input.promotionEffects) {
    if (effect.effectKind !== "monetary_allocation" || effect.amountPaise == null) {
      continue;
    }
    if (effect.snapshotLineId != null && effect.snapshotLineId.length > 0) {
      complimentaryAllocation += effect.amountPaise;
      continue;
    }
    if (effect.amountPaise <= BigInt(0)) continue;
    if (effect.componentId === DELIVERY_SAVING_COMPONENT_ID) {
      recognizedDelivery += effect.amountPaise;
      continue;
    }
    if (effect.componentId != null && effect.componentId.length > 0) {
      recognizedOrder += effect.amountPaise;
    }
  }
  const customer = nonnegative(input.promotionDiscountPaise - complimentaryAllocation);
  const delivery = recognizedDelivery > customer ? customer : recognizedDelivery;
  const orderRoom = customer > delivery ? customer - delivery : BigInt(0);
  const order = recognizedOrder > orderRoom ? orderRoom : recognizedOrder;
  return Object.freeze({
    orderSavingPaise: order,
    deliverySavingPaise: delivery,
    totalSavedPaise: customer,
  });
}
