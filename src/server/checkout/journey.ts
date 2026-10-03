/**
 * Checkout journey key / cart causal ordinal assignment (IMP-036J T4).
 */
import { eq } from "drizzle-orm";
import { randomUUID } from "node:crypto";

import { checkoutsTable } from "../../platform/database/schema/checkout";
import type { PersistenceTransactionContext } from "../persistence/types";
import {
  associateCartActivation,
  copyJourneyKeyOntoUnresolvedOrigins,
  ensureJourneyHead,
  isPaymentDrivenExpiredPredecessor,
  latestCausalCheckout,
  nextCartCausalOrdinal,
  stampJourneyOnCheckout,
} from "../customer-commerce/measurement/writers";
import type { CheckoutRow } from "./repository";

export async function assignCheckoutJourney(input: {
  context: PersistenceTransactionContext;
  cartId: string;
  customerAuthUserId: string;
  checkout: CheckoutRow;
  cartActivationId: string | null;
  reuseExisting: boolean;
}): Promise<CheckoutRow> {
  let journeyKey = input.checkout.checkoutJourneyKey;
  let ordinal = input.checkout.cartCausalOrdinal;
  let mintKind: "first" | "continuable" | "new-boundary" = "continuable";
  let closedJourneyKey: string | null = null;
  let predecessorId: string | null = input.checkout.id;

  if (!journeyKey || ordinal === null) {
    if (input.reuseExisting) {
      journeyKey = journeyKey ?? randomUUID();
      ordinal =
        ordinal ?? (await nextCartCausalOrdinal(input.context, input.cartId));
      mintKind = "continuable";
    } else {
      const latest = await latestCausalCheckout(
        input.context,
        input.cartId,
        input.customerAuthUserId,
      );
      if (
        latest &&
        latest.checkoutJourneyKey &&
        (await isPaymentDrivenExpiredPredecessor(input.context, latest.id))
      ) {
        journeyKey = latest.checkoutJourneyKey;
        ordinal = await nextCartCausalOrdinal(input.context, input.cartId);
        mintKind = "continuable";
        predecessorId = latest.id;
      } else {
        closedJourneyKey = latest?.checkoutJourneyKey ?? null;
        predecessorId = latest?.id ?? null;
        journeyKey = randomUUID();
        ordinal = await nextCartCausalOrdinal(input.context, input.cartId);
        mintKind = latest ? "new-boundary" : "first";
      }
    }
    await ensureJourneyHead(input.context, journeyKey);
    await stampJourneyOnCheckout(
      input.context,
      input.checkout.id,
      journeyKey,
      ordinal,
    );
    await copyJourneyKeyOntoUnresolvedOrigins({
      context: input.context,
      cartId: input.cartId,
      journeyKey,
      predecessorCheckoutId: predecessorId,
      mintKind,
      closedJourneyKey,
    });
  } else {
    await ensureJourneyHead(input.context, journeyKey);
    await copyJourneyKeyOntoUnresolvedOrigins({
      context: input.context,
      cartId: input.cartId,
      journeyKey,
      predecessorCheckoutId: input.checkout.id,
      mintKind: "continuable",
      closedJourneyKey: null,
    });
  }

  if (input.cartActivationId && journeyKey) {
    try {
      await associateCartActivation({
        context: input.context,
        cartActivationId: input.cartActivationId,
        cartId: input.cartId,
        checkoutId: input.checkout.id,
        journeyKey,
      });
    } catch {
      // Association is non-monetary and must not fail checkout.
    }
  }

  const refreshed = await input.context.db
    .select()
    .from(checkoutsTable)
    .where(eq(checkoutsTable.id, input.checkout.id))
    .limit(1);
  return refreshed[0] ?? input.checkout;
}
