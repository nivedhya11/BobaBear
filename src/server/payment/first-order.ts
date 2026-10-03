/**
 * First-order purchase predicate and purchase-guard lifecycle (IMP-036J T4).
 *
 * Not a Promotion claim and not a capacity counter. One guard per logical
 * binding, shared by every first-order Offer in that binding.
 */
import { and, eq, inArray } from "drizzle-orm";
import { randomUUID } from "node:crypto";

import {
  checkoutSnapshotPromotionEffectsTable,
} from "../../platform/database/schema/checkout";
import { checkoutsTable } from "../../platform/database/schema/checkout";
import { ordersTable } from "../../platform/database/schema/order";
import { paymentsTable } from "../../platform/database/schema/payment";
import {
  firstOrderPurchaseGuardsTable,
  promotionsTable,
} from "../../platform/database/schema/promotions";
import type { FirstOrderPurchaseStatus } from "../../shared/promotions";
import { PaymentError } from "../../shared/payment";
import type {
  PersistenceQueryContext,
  PersistenceTransactionContext,
} from "../persistence/types";
import { assertTransactionContext } from "./assert-role";
import { isUniqueViolation } from "../checkout/assert-role";

export async function loadFirstOrderPurchaseStatus(
  context: PersistenceQueryContext,
  customerAuthUserId: string | null | undefined,
): Promise<FirstOrderPurchaseStatus> {
  if (!customerAuthUserId) return "UNAVAILABLE";
  const orderRows = await context.db
    .select({ id: ordersTable.id })
    .from(ordersTable)
    .innerJoin(checkoutsTable, eq(ordersTable.checkoutId, checkoutsTable.id))
    .where(eq(checkoutsTable.customerAuthUserId, customerAuthUserId))
    .limit(1);
  if (orderRows.length > 0) return "HAS_PRIOR_PURCHASE";

  const paymentRows = await context.db
    .select({ id: paymentsTable.id })
    .from(paymentsTable)
    .innerJoin(checkoutsTable, eq(paymentsTable.checkoutId, checkoutsTable.id))
    .where(
      and(
        eq(checkoutsTable.customerAuthUserId, customerAuthUserId),
        eq(paymentsTable.status, "SUCCEEDED"),
      ),
    )
    .limit(1);
  if (paymentRows.length > 0) return "HAS_PRIOR_PURCHASE";

  const completed = await context.db
    .select({ id: checkoutsTable.id })
    .from(checkoutsTable)
    .where(
      and(
        eq(checkoutsTable.customerAuthUserId, customerAuthUserId),
        eq(checkoutsTable.status, "COMPLETED"),
      ),
    )
    .limit(1);
  if (completed.length > 0) return "HAS_PRIOR_PURCHASE";
  return "NO_PRIOR_PURCHASE";
}

export async function snapshotHasFirstOrderOffer(
  context: PersistenceQueryContext,
  snapshotId: string,
): Promise<boolean> {
  const rows = await context.db
    .select({
      firstOrderOnly: promotionsTable.firstOrderOnly,
    })
    .from(checkoutSnapshotPromotionEffectsTable)
    .innerJoin(
      promotionsTable,
      eq(promotionsTable.id, checkoutSnapshotPromotionEffectsTable.promotionId),
    )
    .where(
      and(
        eq(checkoutSnapshotPromotionEffectsTable.snapshotId, snapshotId),
        eq(
          checkoutSnapshotPromotionEffectsTable.effectKind,
          "applied_promotion",
        ),
      ),
    );
  return rows.some((row) => row.firstOrderOnly === true);
}

export async function insertReservedFirstOrderGuard(input: {
  context: PersistenceTransactionContext;
  customerAuthUserId: string;
  checkoutId: string;
  checkoutSnapshotId: string;
  paymentId: string;
  paymentAttemptId: string;
  now: Date;
}): Promise<void> {
  assertTransactionContext(input.context, "insertReservedFirstOrderGuard");
  const status = await loadFirstOrderPurchaseStatus(
    input.context,
    input.customerAuthUserId,
  );
  if (status === "HAS_PRIOR_PURCHASE") {
    throw new PaymentError(
      "PAYMENT_STATE_CONFLICT",
      "First-order Offer is no longer available for this customer.",
    );
  }
  try {
    await input.context.db.insert(firstOrderPurchaseGuardsTable).values({
      id: randomUUID(),
      customerAuthUserId: input.customerAuthUserId,
      checkoutId: input.checkoutId,
      checkoutSnapshotId: input.checkoutSnapshotId,
      paymentId: input.paymentId,
      paymentAttemptId: input.paymentAttemptId,
      status: "RESERVED",
      createdAt: input.now,
      consumedAt: null,
      releasedAt: null,
    });
  } catch (error) {
    if (isUniqueViolation(error)) {
      throw new PaymentError(
        "PAYMENT_STATE_CONFLICT",
        "First-order Offer is no longer available for this customer.",
      );
    }
    throw error;
  }
}

export async function insertConsumedZeroPayableFirstOrderGuard(input: {
  context: PersistenceTransactionContext;
  customerAuthUserId: string;
  checkoutId: string;
  checkoutSnapshotId: string;
  now: Date;
}): Promise<void> {
  assertTransactionContext(
    input.context,
    "insertConsumedZeroPayableFirstOrderGuard",
  );
  const status = await loadFirstOrderPurchaseStatus(
    input.context,
    input.customerAuthUserId,
  );
  if (status === "HAS_PRIOR_PURCHASE") {
    throw new PaymentError(
      "PAYMENT_STATE_CONFLICT",
      "First-order Offer is no longer available for this customer.",
    );
  }
  try {
    await input.context.db.insert(firstOrderPurchaseGuardsTable).values({
      id: randomUUID(),
      customerAuthUserId: input.customerAuthUserId,
      checkoutId: input.checkoutId,
      checkoutSnapshotId: input.checkoutSnapshotId,
      paymentId: null,
      paymentAttemptId: null,
      status: "CONSUMED",
      createdAt: input.now,
      consumedAt: input.now,
      releasedAt: null,
    });
  } catch (error) {
    if (isUniqueViolation(error)) {
      throw new PaymentError(
        "PAYMENT_STATE_CONFLICT",
        "First-order Offer is no longer available for this customer.",
      );
    }
    throw error;
  }
}

export async function consumeFirstOrderGuardForAttempt(
  context: PersistenceTransactionContext,
  paymentAttemptId: string,
  now: Date,
): Promise<void> {
  assertTransactionContext(context, "consumeFirstOrderGuardForAttempt");
  await context.db
    .update(firstOrderPurchaseGuardsTable)
    .set({
      status: "CONSUMED",
      consumedAt: now,
      releasedAt: null,
    })
    .where(
      and(
        eq(firstOrderPurchaseGuardsTable.paymentAttemptId, paymentAttemptId),
        eq(firstOrderPurchaseGuardsTable.status, "RESERVED"),
      ),
    );
}

export async function releaseFirstOrderGuardForAttempt(
  context: PersistenceTransactionContext,
  paymentAttemptId: string,
  now: Date,
): Promise<void> {
  assertTransactionContext(context, "releaseFirstOrderGuardForAttempt");
  await context.db
    .update(firstOrderPurchaseGuardsTable)
    .set({
      status: "RELEASED",
      releasedAt: now,
      consumedAt: null,
    })
    .where(
      and(
        eq(firstOrderPurchaseGuardsTable.paymentAttemptId, paymentAttemptId),
        eq(firstOrderPurchaseGuardsTable.status, "RESERVED"),
      ),
    );
}

export async function lockFirstOrderGuardForAttempt(
  context: PersistenceTransactionContext,
  paymentAttemptId: string,
): Promise<void> {
  assertTransactionContext(context, "lockFirstOrderGuardForAttempt");
  await context.db
    .select({ id: firstOrderPurchaseGuardsTable.id })
    .from(firstOrderPurchaseGuardsTable)
    .where(eq(firstOrderPurchaseGuardsTable.paymentAttemptId, paymentAttemptId))
    .for("update");
}

export async function hasReservedGuardForPayment(
  context: PersistenceQueryContext,
  paymentId: string,
): Promise<boolean> {
  const rows = await context.db
    .select({ id: firstOrderPurchaseGuardsTable.id })
    .from(firstOrderPurchaseGuardsTable)
    .where(
      and(
        eq(firstOrderPurchaseGuardsTable.paymentId, paymentId),
        inArray(firstOrderPurchaseGuardsTable.status, ["RESERVED", "CONSUMED"]),
      ),
    )
    .limit(1);
  return rows.length > 0;
}
