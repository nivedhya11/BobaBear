/**
 * GTM-391 (#391B) — Payment → Review loop with unchanged payable.
 *
 * Disposable Testcontainers only. Fake payment provider only. No staging.
 *
 * Mechanism under test: Cart and Checkout Snapshot modifier selections carry
 * no persisted ordinal; their write order is the Cart canonical order
 * (variantModifierGroupId, modifierGroupOptionId). Physical row order on read
 * is not guaranteed by PostgreSQL. A churned Cart heap (sequential scan) can
 * return a non-canonical order while a large Snapshot table (PK index scan)
 * returns canonical order. The fixtures below create exactly that divergence
 * without any logical change (same Cart revision, coupon, fulfilment, money):
 *
 *  - Cart heap: delete + re-insert of one identical modifier row.
 *  - Snapshot read: `CLUSTER ... USING <pk>` (deterministic PK-ordered heap,
 *    i.e. the order a PK index scan yields).
 *
 * This proves the defect class through the real prepare/payment path. It does
 * not by itself prove the historical staging query plan.
 */
import { randomUUID } from "node:crypto";

import { eq, sql } from "drizzle-orm";
import { afterEach, describe, expect, it } from "vitest";

import { catalogContentRevisionsTable } from "../../src/platform/database/schema/catalog";
import { addCartLine, type CustomerActor } from "../../src/server/cart";
import { findCartRowById, loadCartAggregate } from "../../src/server/cart/repository";
import {
  evaluateCheckout,
  prepareCheckoutForPayment,
  setCheckoutDestination,
  startCheckout,
} from "../../src/server/checkout";
import { checkoutSnapshotsStructurallyEqual } from "../../src/server/checkout/compare-snapshots";
import type { CheckoutPrepareDiagnosticObservation } from "../../src/server/checkout/prepare-diagnostic";
import { loadActiveSnapshot } from "../../src/server/checkout/repository";
import { withCanonicalSnapshotSelectionOrder } from "../../src/server/checkout/selection-order";
import {
  activateModifierGroupOption,
  activateModifierOption,
  addModifierOptionToGroup,
  createModifierOption,
  publishCatalogContentChange,
} from "../../src/server/catalog";
import { startPayment } from "../../src/server/payment";
import type { CheckoutSnapshot } from "../../src/shared/checkout";
import { includeVariantAtBrand as includeBrand } from "../assortment-availability/support";
import {
  seedActiveStandardVariant,
  seedActiveVariantWithModifier,
  uniqueCode,
} from "../database/support/cart-fixtures";
import {
  checkoutOpts,
  closeTrackedPersistenceHandles,
  createSavedAddressForCustomer,
  FIXED_NOW,
  mutableCheckoutClock,
  seedBrandPriceAndTaxForVariant,
  seedChargePricesOnBook,
  seedModifierDeltaOnBook,
  seedServiceableOutlet,
  withCartHarness,
} from "../database/support/checkout-fixtures";
import {
  applyCouponToCustomerCart,
  CHECKOUT_POLICY,
  createFakePaymentProvider,
  newIdempotencyKey,
  PAYMENT_POLICY,
  seedLimitedCoupon,
} from "../database/support/payment-fixtures";

afterEach(async () => {
  await closeTrackedPersistenceHandles();
});

type Persistence =
  Parameters<Parameters<typeof withCartHarness>[0]>[0]["persistence"];

type LoopHarness = Readonly<{
  persistence: Persistence;
  actor: CustomerActor;
  addressId: string;
  cartId: string;
  cartRevision: bigint;
  multiModifierCartLineId: string;
  promotionId: string;
  repricableVariantId: string;
  clock: ReturnType<typeof mutableCheckoutClock>["clock"];
}>;

function customerAccess(actor: CustomerActor, brandId: string) {
  return { kind: "customer" as const, actor, brandId };
}

function canonicalKey(m: {
  variantModifierGroupId: string;
  modifierGroupOptionId: string;
}): string {
  return `${m.variantModifierGroupId}|${m.modifierGroupOptionId}`;
}

function isCanonical(
  modifiers: readonly { variantModifierGroupId: string; modifierGroupOptionId: string }[],
): boolean {
  const keys = modifiers.map(canonicalKey);
  return keys.every((k, i) => i === 0 || keys[i - 1]! < k);
}

async function seedSecondModifierOption(
  persistence: Persistence,
  brandId: string,
  actor: unknown,
  mod: Awaited<ReturnType<typeof seedActiveVariantWithModifier>>,
): Promise<{ modifierGroupOptionId: string }> {
  return persistence.transaction(async (tx) => {
    const option = await createModifierOption(tx, {
      actor,
      brandId,
      code: uniqueCode("jelly"),
      name: "Jelly",
    });
    const binding = await addModifierOptionToGroup(tx, {
      actor,
      modifierGroupId: mod.modifierGroupId,
      modifierOptionId: option.id,
      minQuantity: 0,
      maxQuantity: 3,
      defaultQuantity: 0,
    });
    await activateModifierOption(tx, { actor, modifierOptionId: option.id });
    await activateModifierGroupOption(tx, {
      actor,
      modifierGroupOptionId: binding.id,
    });
    const envelope = (
      await tx.db
        .select()
        .from(catalogContentRevisionsTable)
        .where(eq(catalogContentRevisionsTable.brandId, brandId))
        .limit(1)
    )[0];
    if (!envelope) throw new Error("missing brand content revision");
    await publishCatalogContentChange(tx, {
      actor,
      brandId,
      productId: mod.productId,
      expectedContentRevision: envelope.contentRevision,
    });
    return { modifierGroupOptionId: binding.id };
  });
}

/**
 * Delivery ASAP, three lines (one qty 2 with two modifiers), 10% coupon,
 * packaging — the #391 commercial shape.
 */
async function withLoopShape<T>(fn: (h: LoopHarness) => Promise<T>): Promise<T> {
  return withCartHarness(async ({ persistence, actors }) => {
    const brandId = actors.tree.brand.id;
    const access = customerAccess(actors.customerA, brandId);
    const { clock } = mutableCheckoutClock(FIXED_NOW);

    const drinkA = await seedActiveVariantWithModifier(
      persistence,
      brandId,
      actors.brandAdminActor,
      "rain",
    );
    const secondMod = await seedSecondModifierOption(
      persistence,
      brandId,
      actors.brandAdminActor,
      drinkA,
    );
    const drinkB = await seedActiveStandardVariant(
      persistence,
      brandId,
      actors.brandAdminActor,
      "cheese",
    );
    const drinkC = await seedActiveStandardVariant(
      persistence,
      brandId,
      actors.brandAdminActor,
      "hkmt",
    );
    for (const variantId of [drinkA.variantId, drinkB.variantId, drinkC.variantId]) {
      await includeBrand(persistence, actors.brandAdminActor, brandId, variantId);
    }
    await seedServiceableOutlet(persistence, actors.brandAdminActor, actors.tree.outletA.id);

    const { priceBookId } = await seedBrandPriceAndTaxForVariant(persistence, {
      actor: actors.brandAdminActor,
      brandId,
      organizationId: actors.tree.orgA.id,
      legalEntityId: actors.tree.leA.id,
      outletId: actors.tree.outletA.id,
      variantId: drinkA.variantId,
      amountPaise: BigInt(25_000),
    });
    await seedChargePricesOnBook(persistence, {
      brandId,
      priceBookId,
      packagingPaise: BigInt(2_000),
      deliveryPaise: BigInt(0),
    });
    for (const optionId of [drinkA.modifierGroupOptionId, secondMod.modifierGroupOptionId]) {
      await seedModifierDeltaOnBook(persistence, {
        brandId,
        priceBookId,
        variantModifierGroupId: drinkA.variantModifierGroupId,
        modifierGroupOptionId: optionId,
        priceDeltaPaise: BigInt(1_500),
      });
    }
    await persistence.withContext(async (ctx) => {
      for (const [variantId, amount] of [
        [drinkB.variantId, 28_900],
        [drinkC.variantId, 24_700],
      ] as const) {
        await ctx.db.execute(sql`
          insert into app.price_book_variant_prices (
            id, brand_id, price_book_id, variant_id, amount_paise,
            floor_paise, ceiling_paise,
            allow_territory_override, allow_organization_override, allow_outlet_override,
            tax_category_id, created_at
          )
          select
            ${randomUUID()}::uuid, ${brandId}::uuid, ${priceBookId}::uuid,
            ${variantId}::uuid, ${amount}, null, null, false, false, false,
            tax_category_id, created_at
          from app.price_book_variant_prices
          where price_book_id = ${priceBookId}::uuid
            and variant_id = ${drinkA.variantId}::uuid
          limit 1
        `);
      }
    });

    const coupon = await seedLimitedCoupon(persistence, brandId, actors.brandAdminActor, {
      canonicalCode: `G391${uniqueCode("").slice(0, 6).toUpperCase()}`,
      maximumRedemptions: null,
      percentageBps: 1000,
    });

    const lineA = await addCartLine(persistence, access, {
      variantId: drinkA.variantId,
      quantity: 2,
      modifiers: [
        {
          variantModifierGroupId: drinkA.variantModifierGroupId,
          modifierGroupOptionId: drinkA.modifierGroupOptionId,
          quantity: 1,
        },
        {
          variantModifierGroupId: drinkA.variantModifierGroupId,
          modifierGroupOptionId: secondMod.modifierGroupOptionId,
          quantity: 1,
        },
      ],
    });
    const multiModifierCartLineId = lineA.cart.lines.find(
      (l) => l.variantId === drinkA.variantId,
    )!.id;
    const lineB = await addCartLine(persistence, access, {
      variantId: drinkB.variantId,
      quantity: 1,
      expectedRevision: lineA.cart.revision,
    });
    const lineC = await addCartLine(persistence, access, {
      variantId: drinkC.variantId,
      quantity: 1,
      expectedRevision: lineB.cart.revision,
    });
    const withCoupon = await applyCouponToCustomerCart(
      persistence,
      actors.customerA,
      brandId,
      lineC.cart.revision,
      coupon.canonicalCode,
    );
    const address = await createSavedAddressForCustomer(persistence, actors.customerAId);

    return fn({
      persistence,
      actor: actors.customerA,
      addressId: address.id,
      cartId: withCoupon.id,
      cartRevision: withCoupon.revision,
      multiModifierCartLineId,
      promotionId: coupon.promotionId,
      repricableVariantId: drinkB.variantId,
      clock,
    });
  });
}

/** Physically moves the canonical-first modifier row to the end of the Cart heap. */
async function churnCartModifierHeap(h: LoopHarness): Promise<void> {
  await h.persistence.transaction(async (tx) => {
    const rows = (
      await tx.db.execute(sql`
        select variant_modifier_group_id::text as vmg,
               modifier_group_option_id::text as mgo,
               quantity
        from app.cart_line_modifier_selections
        where cart_line_id = ${h.multiModifierCartLineId}::uuid
        order by variant_modifier_group_id, modifier_group_option_id
      `)
    ).rows as { vmg: string; mgo: string; quantity: number }[];
    expect(rows.length).toBeGreaterThanOrEqual(2);
    const first = rows[0]!;
    await tx.db.execute(sql`
      delete from app.cart_line_modifier_selections
      where cart_line_id = ${h.multiModifierCartLineId}::uuid
        and variant_modifier_group_id = ${first.vmg}::uuid
        and modifier_group_option_id = ${first.mgo}::uuid
    `);
    await tx.db.execute(sql`
      insert into app.cart_line_modifier_selections
        (cart_line_id, variant_modifier_group_id, modifier_group_option_id, quantity)
      values (${h.multiModifierCartLineId}::uuid, ${first.vmg}::uuid, ${first.mgo}::uuid, ${first.quantity})
    `);
  });
}

/** Deterministic PK-ordered Snapshot heap (the order a PK index scan yields). */
async function clusterSnapshotModifiersByPrimaryKey(h: LoopHarness): Promise<void> {
  await h.persistence.withContext(async (ctx) => {
    await ctx.db.execute(sql`
      cluster app.checkout_snapshot_line_modifier_selections
      using checkout_snapshot_line_modifier_selections_pk
    `);
  });
}

/** Physically moves the canonical-first sealed modifier row to the end of the Snapshot heap. */
async function churnSnapshotModifierHeap(h: LoopHarness, snapshotLineId: string): Promise<void> {
  await h.persistence.transaction(async (tx) => {
    const rows = (
      await tx.db.execute(sql`
        select variant_modifier_group_id::text as vmg,
               modifier_group_option_id::text as mgo,
               quantity, group_name, option_name, unit_delta_paise::text as delta
        from app.checkout_snapshot_line_modifier_selections
        where snapshot_line_id = ${snapshotLineId}::uuid
        order by variant_modifier_group_id, modifier_group_option_id
      `)
    ).rows as {
      vmg: string;
      mgo: string;
      quantity: number;
      group_name: string;
      option_name: string;
      delta: string;
    }[];
    expect(rows.length).toBeGreaterThanOrEqual(2);
    const first = rows[0]!;
    await tx.db.execute(sql`
      delete from app.checkout_snapshot_line_modifier_selections
      where snapshot_line_id = ${snapshotLineId}::uuid
        and variant_modifier_group_id = ${first.vmg}::uuid
        and modifier_group_option_id = ${first.mgo}::uuid
    `);
    await tx.db.execute(sql`
      insert into app.checkout_snapshot_line_modifier_selections
        (snapshot_line_id, variant_modifier_group_id, modifier_group_option_id,
         quantity, group_name, option_name, unit_delta_paise)
      values (${snapshotLineId}::uuid, ${first.vmg}::uuid, ${first.mgo}::uuid,
              ${first.quantity}, ${first.group_name}, ${first.option_name}, ${first.delta}::bigint)
    `);
  });
}

async function loadCartModifiersAsRead(h: LoopHarness) {
  return h.persistence.withContext(async (ctx) => {
    const row = await findCartRowById(ctx, h.cartId);
    const cart = await loadCartAggregate(ctx, row!);
    return cart.lines.find((l) => l.id === h.multiModifierCartLineId)!.modifiers;
  });
}

async function cartRevision(h: LoopHarness): Promise<bigint> {
  return h.persistence.withContext(async (ctx) => (await findCartRowById(ctx, h.cartId))!.revision);
}

async function checkoutRow(h: LoopHarness, checkoutId: string) {
  return h.persistence.withContext(async (ctx) => {
    const r = await ctx.db.execute(sql`
      select status, revision::text as revision, active_snapshot_id::text as snapshot
      from app.checkouts where id = ${checkoutId}::uuid
    `);
    return r.rows[0] as { status: string; revision: string; snapshot: string | null };
  });
}

async function paymentFootprint(h: LoopHarness, checkoutId: string) {
  return h.persistence.withContext(async (ctx) => {
    const r = await ctx.db.execute(sql`
      select
        (select count(*) from app.payments p
          join app.checkout_snapshots s on s.id = p.checkout_snapshot_id
          where s.checkout_id = ${checkoutId}::uuid)::int as payments,
        (select count(*) from app.payment_attempts a
          join app.payments p on p.id = a.payment_id
          join app.checkout_snapshots s on s.id = p.checkout_snapshot_id
          where s.checkout_id = ${checkoutId}::uuid)::int as attempts
    `);
    return r.rows[0] as { payments: number; attempts: number };
  });
}

/**
 * Brings the Checkout to READY and leaves the Snapshot store PK-ordered,
 * reproducing the read-order divergence before every prepare.
 */
async function evaluateUnderDivergentReadOrder(h: LoopHarness, checkoutId?: string) {
  const opts = checkoutOpts(h.clock);
  let id = checkoutId;
  let revision: bigint;
  if (!id) {
    let checkout = await startCheckout(h.persistence, h.actor, { cartId: h.cartId }, opts);
    checkout = await setCheckoutDestination(
      h.persistence,
      h.actor,
      {
        checkoutId: checkout.id,
        expectedCheckoutRevision: checkout.revision,
        destination: { kind: "SAVED_ADDRESS", savedAddressId: h.addressId },
      },
      opts,
    );
    id = checkout.id;
    revision = checkout.revision;
  } else {
    revision = BigInt((await checkoutRow(h, id)).revision);
  }
  const ready = await evaluateCheckout(
    h.persistence,
    h.actor,
    { checkoutId: id, expectedCheckoutRevision: revision },
    opts,
  );
  await clusterSnapshotModifiersByPrimaryKey(h);
  return ready;
}

function fakePaymentOpts(
  h: LoopHarness,
  provider: ReturnType<typeof createFakePaymentProvider>,
  observations?: CheckoutPrepareDiagnosticObservation[],
) {
  return {
    clock: h.clock,
    policy: PAYMENT_POLICY,
    checkoutPolicy: CHECKOUT_POLICY,
    provider,
    prepareDiagnosticObserver: observations
      ? (o: CheckoutPrepareDiagnosticObservation) => {
          observations.push(o);
        }
      : undefined,
  };
}

describe("GTM-391 Payment → Review loop — physical selection order is not a binding term", () => {
  it("fixture precondition: Cart read order diverges from Snapshot PK order with no logical change", async () => {
    await withLoopShape(async (h) => {
      const before = await cartRevision(h);
      await churnCartModifierHeap(h);
      expect(await cartRevision(h)).toBe(before);
      const modifiers = await loadCartModifiersAsRead(h);
      expect(modifiers.length).toBe(2);
      expect(isCanonical(modifiers)).toBe(false);
    });
  });

  it("same-state Payment → Review: prepare accepts the unchanged sealed terms across repeated attempts", async () => {
    await withLoopShape(async (h) => {
      await churnCartModifierHeap(h);
      const ready = await evaluateUnderDivergentReadOrder(h);
      expect(ready.checkout.status).toBe("READY_FOR_PAYMENT");
      expect(ready.snapshot.manualCouponCode).not.toBeNull();
      expect(ready.snapshot.promotionDiscountPaise).toBeGreaterThan(BigInt(0));
      const payable = ready.snapshot.grandTotalPaise;
      const sourceCartRevision = ready.snapshot.sourceCartRevision;

      // Each failed attempt follows the client recovery path (re-evaluate at
      // the same Cart revision, then pay again), so a dead-end shows as a
      // repeated identical outcome rather than a single throw.
      let current = ready;
      const outcomes: unknown[] = [];
      for (let attempt = 0; attempt < 3; attempt++) {
        const observations: CheckoutPrepareDiagnosticObservation[] = [];
        try {
          const prepared = await prepareCheckoutForPayment(
            h.persistence,
            h.actor,
            {
              checkoutId: current.checkout.id,
              expectedCheckoutRevision: current.checkout.revision,
            },
            {
              ...checkoutOpts(h.clock),
              prepareDiagnosticObserver: (o) => {
                observations.push(o);
              },
            },
          );
          outcomes.push({
            outcome: "PREPARED",
            sameSnapshot: prepared.snapshot.id === current.snapshot.id,
            payableUnchanged: prepared.snapshot.grandTotalPaise === payable,
            observations,
          });
        } catch (error) {
          outcomes.push({
            outcome: (error as { code?: string }).code ?? "UNKNOWN",
            observations,
            cartRevisionUnchanged: (await cartRevision(h)) === sourceCartRevision,
          });
          current = await evaluateUnderDivergentReadOrder(h, current.checkout.id);
          expect(current.snapshot.grandTotalPaise).toBe(payable);
        }
      }
      const healthy = {
        outcome: "PREPARED",
        sameSnapshot: true,
        payableUnchanged: true,
        observations: [],
      };
      expect(outcomes).toEqual([healthy, healthy, healthy]);

      const row = await checkoutRow(h, ready.checkout.id);
      expect(row.status).toBe("READY_FOR_PAYMENT");
      expect(row.snapshot).toBe(ready.snapshot.id);
      expect(await cartRevision(h)).toBe(sourceCartRevision);
    });
  });

  it("startPayment binds the sealed amount exactly once; idempotent replay returns the same Payment", async () => {
    await withLoopShape(async (h) => {
      await churnCartModifierHeap(h);
      const ready = await evaluateUnderDivergentReadOrder(h);
      const provider = createFakePaymentProvider({ defaultOutcome: "pending" });
      const observations: CheckoutPrepareDiagnosticObservation[] = [];
      const opts = fakePaymentOpts(h, provider, observations);
      const idempotencyKey = newIdempotencyKey("g391");
      const input = {
        checkoutId: ready.checkout.id,
        expectedCheckoutRevision: ready.checkout.revision,
        paymentMethodIntent: "upi" as const,
        idempotencyKey,
      };

      const started = await startPayment(h.persistence, h.actor, input, opts);
      expect(observations).toEqual([]);
      expect(started.kind).toBe("payment_started");
      expect(started.payment.checkoutSnapshotId).toBe(ready.snapshot.id);
      expect(started.payment.expectedAmountPaise).toBe(ready.snapshot.grandTotalPaise);

      const replay = await startPayment(h.persistence, h.actor, input, opts);
      expect(replay.payment.id).toBe(started.payment.id);
      expect(provider.createExecutionCallCount).toBe(1);
      expect(await paymentFootprint(h, ready.checkout.id)).toEqual({
        payments: 1,
        attempts: 1,
      });
      expect((await checkoutRow(h, ready.checkout.id)).status).toBe("PAYMENT_PENDING");
    });
  });

  it("concurrent startPayment with different keys still yields exactly one Payment", async () => {
    await withLoopShape(async (h) => {
      await churnCartModifierHeap(h);
      const ready = await evaluateUnderDivergentReadOrder(h);
      const provider = createFakePaymentProvider({ defaultOutcome: "pending" });
      const opts = fakePaymentOpts(h, provider);
      const raced = await Promise.allSettled(
        ["upi", "card"].map((intent, i) =>
          startPayment(
            h.persistence,
            h.actor,
            {
              checkoutId: ready.checkout.id,
              expectedCheckoutRevision: ready.checkout.revision,
              paymentMethodIntent: intent as "upi" | "card",
              idempotencyKey: newIdempotencyKey(`g391c${i}`),
            },
            opts,
          ),
        ),
      );
      expect(raced.filter((r) => r.status === "fulfilled")).toHaveLength(1);
      expect(raced.filter((r) => r.status === "rejected")).toHaveLength(1);
      expect(provider.createExecutionCallCount).toBe(1);
      expect(await paymentFootprint(h, ready.checkout.id)).toEqual({
        payments: 1,
        attempts: 1,
      });
    });
  });

  it("fail-closed preserved: equal payable with a changed binding term (promotion revision) still rejects", async () => {
    await withLoopShape(async (h) => {
      await churnCartModifierHeap(h);
      const ready = await evaluateUnderDivergentReadOrder(h);
      await h.persistence.withContext(async (ctx) => {
        await ctx.db.execute(sql`
          update app.promotions set revision = revision + 1
          where id = ${h.promotionId}::uuid
        `);
      });
      const provider = createFakePaymentProvider({ defaultOutcome: "pending" });
      const observations: CheckoutPrepareDiagnosticObservation[] = [];
      await expect(
        startPayment(
          h.persistence,
          h.actor,
          {
            checkoutId: ready.checkout.id,
            expectedCheckoutRevision: ready.checkout.revision,
            paymentMethodIntent: "upi",
            idempotencyKey: newIdempotencyKey("g391p"),
          },
          fakePaymentOpts(h, provider, observations),
        ),
      ).rejects.toMatchObject({ code: "CHECKOUT_REPRICED" });
      expect(observations).toEqual([
        {
          rejectionStage: "STRUCTURAL",
          firstDifferenceCategory: "PROMOTION_EFFECT",
          payableChanged: false,
        },
      ]);
      expect((await checkoutRow(h, ready.checkout.id)).status).toBe("DRAFT");
      expect(provider.createExecutionCallCount).toBe(0);
      expect(await paymentFootprint(h, ready.checkout.id)).toEqual({
        payments: 0,
        attempts: 0,
      });
    });
  });

  it("fail-closed preserved: a genuine price change still rejects with payableChanged", async () => {
    await withLoopShape(async (h) => {
      await churnCartModifierHeap(h);
      const ready = await evaluateUnderDivergentReadOrder(h);
      await h.persistence.withContext(async (ctx) => {
        await ctx.db.execute(sql`
          update app.price_book_variant_prices set amount_paise = amount_paise + 100
          where variant_id = ${h.repricableVariantId}::uuid
        `);
      });
      const observations: CheckoutPrepareDiagnosticObservation[] = [];
      await expect(
        prepareCheckoutForPayment(
          h.persistence,
          h.actor,
          {
            checkoutId: ready.checkout.id,
            expectedCheckoutRevision: ready.checkout.revision,
          },
          {
            ...checkoutOpts(h.clock),
            prepareDiagnosticObserver: (o) => {
              observations.push(o);
            },
          },
        ),
      ).rejects.toMatchObject({ code: "CHECKOUT_REPRICED" });
      expect(observations).toHaveLength(1);
      expect(observations[0]!.rejectionStage).toBe("STRUCTURAL");
      expect(observations[0]!.payableChanged).toBe(true);
      expect((await checkoutRow(h, ready.checkout.id)).status).toBe("DRAFT");
    });
  });

  it("sealed Snapshot reload returns canonical selection order regardless of heap order", async () => {
    await withLoopShape(async (h) => {
      await churnCartModifierHeap(h);
      const ready = await evaluateUnderDivergentReadOrder(h);
      const sealedLine = ready.snapshot.lines.find(
        (l) => l.sourceCartLineId === h.multiModifierCartLineId,
      )!;
      await churnSnapshotModifierHeap(h, sealedLine.id);
      const reloaded = await h.persistence.withContext((ctx) =>
        loadActiveSnapshot(ctx, ready.snapshot.id),
      );
      const line = reloaded!.lines.find((l) => l.sourceCartLineId === h.multiModifierCartLineId)!;
      expect(line.modifiers).toHaveLength(2);
      expect(isCanonical(line.modifiers)).toBe(true);
    });
  });
});

describe("GTM-391 canonical selection order helper keeps structural equality strict", () => {
  const mod = (vmg: string, mgo: string, quantity = 1) =>
    Object.freeze({
      variantModifierGroupId: vmg,
      modifierGroupOptionId: mgo,
      quantity,
      groupName: "Toppings",
      optionName: mgo,
      unitDeltaPaise: BigInt(0),
    });
  const G = "00000000-0000-4000-8000-00000000000a";
  const O1 = "00000000-0000-4000-8000-000000000001";
  const O2 = "00000000-0000-4000-8000-000000000002";
  const O3 = "00000000-0000-4000-8000-000000000003";
  const B1 = "00000000-0000-4000-8000-0000000000b1";
  const B2 = "00000000-0000-4000-8000-0000000000b2";

  function snapshotWith(
    modifiers: ReturnType<typeof mod>[],
    bundleOrder: string[] = [B1, B2],
  ): CheckoutSnapshot {
    return Object.freeze({
      id: "x",
      checkoutId: "c",
      checkoutRevision: BigInt(1),
      sourceCartRevision: BigInt(1),
      selectedOutletId: "o",
      evaluatedAt: FIXED_NOW,
      fulfilmentMode: "PICKUP",
      fulfilmentTiming: "ASAP",
      scheduledWindowStartAt: null,
      scheduledWindowEndAt: null,
      scheduledTimezone: null,
      scheduledCancellationCutoffMinutes: null,
      serviceabilityEvaluatedAt: null,
      currency: "INR",
      manualCouponCode: null,
      destination: null,
      pickupLocation: null,
      basePaise: BigInt(100),
      modifierAdjustmentsPaise: BigInt(0),
      bundleAdjustmentsPaise: BigInt(0),
      chargesPaise: BigInt(0),
      prePromotionSubtotalPaise: BigInt(100),
      promotionDiscountPaise: BigInt(0),
      taxablePaise: BigInt(100),
      taxPaise: BigInt(0),
      grandTotalPaise: BigInt(100),
      taxInclusionMode: "exclusive",
      createdAt: FIXED_NOW,
      lines: Object.freeze([
        Object.freeze({
          id: "x",
          sourceCartLineId: "l",
          lineOrigin: "cart",
          productId: "p",
          variantId: "v",
          productName: "Drink",
          variantName: "Regular",
          quantity: 1,
          lineBasePaise: BigInt(100),
          lineModifierAdjustmentsPaise: BigInt(0),
          lineBundleAdjustmentsPaise: BigInt(0),
          lineSubtotalPaise: BigInt(100),
          linePromotionDiscountPaise: BigInt(0),
          lineTaxablePaise: BigInt(100),
          lineTaxPaise: BigInt(0),
          lineTotalPaise: BigInt(100),
          sequence: 0,
          modifiers: Object.freeze(modifiers),
          bundleSelections: Object.freeze(
            bundleOrder.map((bgo) =>
              Object.freeze({
                id: "x",
                bundleGroupOptionId: bgo,
                selectedVariantId: "sv",
                quantity: 1,
                groupName: "Bundle",
                optionName: bgo,
                variantName: "Variant",
                unitDeltaPaise: BigInt(0),
                modifiers: Object.freeze([mod(G, O2), mod(G, O1)]),
              }),
            ),
          ),
        }),
      ]),
      charges: Object.freeze([]),
      promotionEffects: Object.freeze([]),
      taxComponents: Object.freeze([]),
    }) as CheckoutSnapshot;
  }

  const equalCanonical = (a: CheckoutSnapshot, b: CheckoutSnapshot) =>
    checkoutSnapshotsStructurallyEqual(
      withCanonicalSnapshotSelectionOrder(a),
      withCanonicalSnapshotSelectionOrder(b),
    );

  it("order-only permutations of modifiers and bundle selections compare equal", () => {
    const a = snapshotWith([mod(G, O1), mod(G, O2)], [B1, B2]);
    const b = snapshotWith([mod(G, O2), mod(G, O1)], [B2, B1]);
    expect(checkoutSnapshotsStructurallyEqual(a, b)).toBe(false);
    expect(equalCanonical(a, b)).toBe(true);
  });

  it("a different modifier option with equal money is still unequal", () => {
    expect(
      equalCanonical(
        snapshotWith([mod(G, O1), mod(G, O2)]),
        snapshotWith([mod(G, O1), mod(G, O3)]),
      ),
    ).toBe(false);
  });

  it("a different modifier quantity is still unequal", () => {
    expect(
      equalCanonical(
        snapshotWith([mod(G, O1), mod(G, O2)]),
        snapshotWith([mod(G, O1), mod(G, O2, 2)]),
      ),
    ).toBe(false);
  });

  it("a missing modifier or bundle selection is still unequal", () => {
    expect(
      equalCanonical(snapshotWith([mod(G, O1), mod(G, O2)]), snapshotWith([mod(G, O1)])),
    ).toBe(false);
    expect(
      equalCanonical(snapshotWith([mod(G, O1)], [B1, B2]), snapshotWith([mod(G, O1)], [B1])),
    ).toBe(false);
  });

  it("does not mutate its input", () => {
    const input = snapshotWith([mod(G, O2), mod(G, O1)]);
    const out = withCanonicalSnapshotSelectionOrder(input);
    expect(input.lines[0]!.modifiers.map((m) => m.modifierGroupOptionId)).toEqual([O2, O1]);
    expect(out.lines[0]!.modifiers.map((m) => m.modifierGroupOptionId)).toEqual([O1, O2]);
  });
});
