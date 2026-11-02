/**
 * Operator Order-recovery CLI cursor continuation (E4-A).
 *
 * Uses the disposable Order harness database only. Domain recovery ordering
 * and materialization stay on recoverMissingOrdersBatch.
 */
import { sql } from "drizzle-orm";
import { afterEach, describe, expect, it } from "vitest";

import { addCartLine } from "../../src/server/cart";
import { recoverMissingOrdersBatch } from "../../src/server/order";
import { completeZeroPayableCheckout } from "../../src/server/payment";
import { parseRecoverMissingOrdersBatchInput } from "../../src/shared/order";
import {
  parseOrderRecoveryCliArgs,
  serializeOrderRecoveryCursor,
  formatOrderRecoveryOperatorSummary,
} from "../../scripts/order/recovery-cli.mjs";
import {
  bringCheckoutToReady,
  cartState,
  closeTrackedPersistenceHandles,
  countOrdersForCheckout,
  createFakePaymentProvider,
  deleteOrderRow,
  getOrderByCheckout,
  newIdempotencyKey,
  orderOpts,
  paymentOpts,
  snapshotVariantId,
  withCompletedPositiveOrderHarness,
} from "../database/support/order-fixtures";

afterEach(async () => {
  await closeTrackedPersistenceHandles();
});

describe("order recovery CLI cursor", () => {
  it("keeps the domain composite cursor and rejects a checkout id string", () => {
    const checkoutId = "00000000-0000-4000-8000-000000000001";
    expect(() => parseRecoverMissingOrdersBatchInput({ cursor: checkoutId })).toThrow(
      /must be an object/,
    );
    try {
      parseRecoverMissingOrdersBatchInput({ cursor: checkoutId });
    } catch (error) {
      expect(error).toMatchObject({ code: "ORDER_CURSOR_INVALID" });
      expect((error as Error).message.includes(checkoutId)).toBe(false);
    }

    const parsed = parseRecoverMissingOrdersBatchInput({
      cursor: {
        lastCheckoutUpdatedAt: "2026-01-15T10:00:00.000Z",
        lastCheckoutId: checkoutId,
      },
    });
    expect(parsed.cursor?.lastCheckoutUpdatedAt.toISOString()).toBe("2026-01-15T10:00:00.000Z");
    expect(parsed.cursor?.lastCheckoutId).toBe(checkoutId);
  });

  it("resumes the next page from the printed composite cursor without skips or duplicates", async () => {
    await withCompletedPositiveOrderHarness(async (h) => {
      const variantId = await snapshotVariantId(h.persistence, h.snapshotId);
      await h.persistence.withContext(async (ctx) => {
        await ctx.db.execute(sql`
          update app.price_book_variant_prices
          set amount_paise = 0
          where variant_id = ${variantId}::uuid
        `);
      });
      const cart = await cartState(h.persistence, h.cartId);
      const added = await addCartLine(
        h.persistence,
        { kind: "customer", actor: h.actor, brandId: h.brandId },
        {
          variantId,
          quantity: 1,
          expectedRevision: cart.revision,
        },
      );
      const addressId = await h.persistence.withContext(async (ctx) => {
        const result = await ctx.db.execute(sql`
          select id::text as id from app.customer_addresses
          where customer_auth_user_id = ${h.actors.customerAId}
          limit 1
        `);
        return result.rows[0]!.id as string;
      });
      const ready2 = await bringCheckoutToReady(
        h.persistence,
        h.actor,
        added.cart.id,
        addressId,
      );
      const provider = createFakePaymentProvider({ defaultOutcome: "pending" });
      await completeZeroPayableCheckout(
        h.persistence,
        h.actor,
        {
          checkoutId: ready2.checkoutId,
          expectedCheckoutRevision: ready2.revision,
          idempotencyKey: newIdempotencyKey("e4a-cursor"),
        },
        paymentOpts(provider),
      );

      await deleteOrderRow(h.persistence, h.order.id, h.connectionString);
      const auto2 = await getOrderByCheckout(h.persistence, ready2.checkoutId);
      await deleteOrderRow(h.persistence, auto2!.id, h.connectionString);

      await h.persistence.withContext(async (ctx) => {
        await ctx.db.execute(sql`
          update app.checkouts
          set updated_at = (
            select max(updated_at)
            from app.checkouts
            where id in (${h.checkoutId}::uuid, ${ready2.checkoutId}::uuid)
          )
          where id in (${h.checkoutId}::uuid, ${ready2.checkoutId}::uuid)
        `);
      });

      const expected = [h.checkoutId, ready2.checkoutId].sort();
      const policy = { orderNumberMaxAttempts: 8, recoveryBatchSize: 1 as const };
      const seen: string[] = [];
      let cliArgs: ReturnType<typeof parseOrderRecoveryCliArgs> = {};

      for (let page = 0; page < 2; page += 1) {
        const domainInput = parseRecoverMissingOrdersBatchInput(cliArgs);
        const batch = await recoverMissingOrdersBatch(h.persistence, domainInput, {
          ...orderOpts(),
          policy,
        });
        expect(batch.results).toHaveLength(1);
        expect(batch.nextCursor).not.toBeNull();
        seen.push(batch.results[0]!.checkoutId);
        const cursorText = serializeOrderRecoveryCursor(batch.nextCursor!);
        cliArgs = parseOrderRecoveryCliArgs([`--cursor=${cursorText}`]);
        expect(cliArgs.cursor?.lastCheckoutId).toBe(batch.nextCursor!.lastCheckoutId);
        expect(cliArgs.cursor?.lastCheckoutUpdatedAt.toISOString()).toBe(
          batch.nextCursor!.lastCheckoutUpdatedAt.toISOString(),
        );
      }

      const trailing = await recoverMissingOrdersBatch(
        h.persistence,
        parseRecoverMissingOrdersBatchInput(cliArgs),
        { ...orderOpts(), policy },
      );
      expect(trailing.results).toHaveLength(0);
      expect(trailing.nextCursor).toBeNull();
      expect(seen).toEqual(expected);
      expect(new Set(seen).size).toBe(seen.length);
      expect(await countOrdersForCheckout(h.persistence, h.checkoutId)).toBe(1);
      expect(await countOrdersForCheckout(h.persistence, ready2.checkoutId)).toBe(1);
    });
  });

  it("lists retryable failures in the operator summary", async () => {
    await withCompletedPositiveOrderHarness(async (h) => {
      await deleteOrderRow(h.persistence, h.order.id, h.connectionString);
      const leaked = "postgresql://boba:secret@db/boba";
      const batch = await recoverMissingOrdersBatch(h.persistence, {}, {
        ...orderOpts(),
        policy: { orderNumberMaxAttempts: 8, recoveryBatchSize: 25 },
        orderNumberGenerator: () => {
          throw new Error(leaked);
        },
      });
      const summary = formatOrderRecoveryOperatorSummary(batch);
      const rendered = JSON.stringify(summary);

      expect(batch.results.map((item) => item.disposition)).toEqual(["RETRYABLE_FAILURE"]);
      expect(summary.retryableFailure).toBe(1);
      expect(summary.retryableFailureCheckouts).toEqual([h.checkoutId]);
      expect(summary.created + summary.alreadyExists + summary.anomaly + summary.retryableFailure).toBe(
        summary.scanned,
      );
      expect(rendered.includes(leaked)).toBe(false);
      expect(rendered.includes("secret")).toBe(false);
      expect(await countOrdersForCheckout(h.persistence, h.checkoutId)).toBe(0);
    });
  });
});
