/**
 * IMP-036J #385 — Founder decision evidence for Review item-line presentation.
 *
 * Evidence only: no customer presentation changes. Each scenario evaluates a real Checkout
 * and derives, from authoritative snapshot fields only, what each Founder option would show:
 *  - Option A: gross item line (lineSubtotalPaise) with a separate saving
 *    (linePromotionDiscountPaise) and the line's tax.
 *  - Option B: the existing net item line (lineTotalPaise), relabelled.
 * Isolated fixtures only; no staging mutation.
 */
import { sql } from "drizzle-orm";
import { afterEach, describe, expect, it } from "vitest";

import { addCartLine, setCartLineQuantity, type CustomerActor } from "../../src/server/cart";
import {
  evaluateCheckout,
  setCheckoutDestination,
  startCheckout,
} from "../../src/server/checkout";
import {
  activatePromotion,
  createPromotionDraft,
  getPromotion,
  setPromotionBenefit,
  setPromotionTargets,
} from "../../src/server/promotions";
import type { CheckoutSnapshot } from "../../src/shared/checkout";
import { includeVariantAtBrand } from "../assortment-availability/support";
import { seedActiveVariantWithModifier, uniqueCode } from "../database/support/cart-fixtures";
import {
  attachVariantPriceToActiveBrandBook,
  checkoutOpts,
  closeTrackedPersistenceHandles,
  seedModifierDeltaOnBook,
  withCheckoutReadyHarness,
} from "../database/support/checkout-fixtures";

afterEach(async () => {
  await closeTrackedPersistenceHandles();
});

type Harness = Parameters<Parameters<typeof withCheckoutReadyHarness>[0]>[0];

type Benefit = Parameters<typeof setPromotionBenefit>[1]["benefit"];

const NO_BENEFIT_FIELDS = {
  percentageBps: null,
  fixedAmountPaise: null,
  maximumDiscountPaise: null,
  buyQuantity: null,
  getQuantity: null,
  repeatable: null,
  maximumRewardQuantity: null,
  includeModifiers: false,
  includeBundleDeltas: false,
} as const;

function customerAccess(actor: CustomerActor, brandId: string) {
  return { kind: "customer" as const, actor, brandId };
}

async function seedAutomaticPromotion(
  harness: Harness,
  benefit: Benefit,
  target:
    | { targetType: "all_merchandise" }
    | { targetType: "variant"; variantId: string },
): Promise<void> {
  const { persistence, actors } = harness;
  const actor = actors.brandAdminActor;
  await persistence.transaction(async (tx) => {
    const created = await createPromotionDraft(tx, {
      actor,
      brandId: actors.tree.brand.id,
      code: uniqueCode("p385"),
      displayName: "#385 evidence",
      scopeType: "brand",
      territoryId: null,
      organizationId: null,
      outletId: null,
      triggerType: "automatic",
      stackingPolicy: "exclusive",
      startsAt: new Date("2026-01-01T00:00:00Z"),
      endsAt: null,
    });
    await setPromotionBenefit(tx, {
      actor,
      promotionId: created.id,
      expectedPromotionRevision: (await getPromotion(tx, created.id))!.revision,
      benefit,
    });
    for (const targetRole of ["qualifier", "benefit"] as const) {
      await setPromotionTargets(tx, {
        actor,
        promotionId: created.id,
        expectedPromotionRevision: (await getPromotion(tx, created.id))!.revision,
        targetRole,
        targets: [
          {
            targetRole,
            targetType: target.targetType,
            productId: null,
            variantId: target.targetType === "variant" ? target.variantId : null,
            chargeDefinitionId: null,
          },
        ],
      });
    }
    await activatePromotion(tx, {
      actor,
      promotionId: created.id,
      expectedPromotionRevision: (await getPromotion(tx, created.id))!.revision,
    });
  });
}

async function evaluate(harness: Harness): Promise<CheckoutSnapshot> {
  const { persistence, actors, cartId, addressId } = harness;
  const opts = checkoutOpts();
  const started = await startCheckout(persistence, actors.customerA, { cartId }, opts);
  const withDest = await setCheckoutDestination(
    persistence,
    actors.customerA,
    {
      checkoutId: started.id,
      expectedCheckoutRevision: started.revision,
      destination: { kind: "SAVED_ADDRESS", savedAddressId: addressId },
    },
    opts,
  );
  const ready = await evaluateCheckout(
    persistence,
    actors.customerA,
    { checkoutId: withDest.id, expectedCheckoutRevision: withDest.revision },
    opts,
  );
  expect(ready.checkout.status).toBe("READY_FOR_PAYMENT");
  return ready.snapshot;
}

async function onlyCartLineId(harness: Harness): Promise<string> {
  return harness.persistence.withContext(async (ctx) => {
    const r = await ctx.db.execute(sql`
      select id::text as id from app.cart_lines where cart_id = ${harness.cartId}::uuid
    `);
    expect(r.rows).toHaveLength(1);
    return r.rows[0]!.id as string;
  });
}

type OptionView = Readonly<{
  item: string;
  quantity: number;
  optionA: Readonly<{ grossPaise: bigint; savingPaise: bigint; taxPaise: bigint }>;
  optionB: Readonly<{ netLinePaise: bigint }>;
}>;

/**
 * Asserts the snapshot identities both options depend on, and returns the per-line figures
 * each option would display. Throws if any option would need a client-side recalculation.
 */
function optionViews(snapshot: CheckoutSnapshot): readonly OptionView[] {
  const sum = (pick: (l: CheckoutSnapshot["lines"][number]) => bigint) =>
    snapshot.lines.reduce((acc, l) => acc + pick(l), BigInt(0));

  for (const l of snapshot.lines) {
    expect(l.lineSubtotalPaise).toBe(
      l.lineBasePaise + l.lineModifierAdjustmentsPaise + l.lineBundleAdjustmentsPaise,
    );
    expect(l.lineTaxablePaise).toBe(l.lineSubtotalPaise - l.linePromotionDiscountPaise);
    expect(l.lineTotalPaise).toBe(l.lineTaxablePaise + l.lineTaxPaise);
  }
  expect(sum((l) => l.lineSubtotalPaise)).toBe(
    snapshot.basePaise + snapshot.modifierAdjustmentsPaise + snapshot.bundleAdjustmentsPaise,
  );
  expect(sum((l) => l.linePromotionDiscountPaise)).toBe(snapshot.promotionDiscountPaise);

  return snapshot.lines.map((l) => ({
    item: `${l.productName} / ${l.variantName}`,
    quantity: l.quantity,
    optionA: {
      grossPaise: l.lineSubtotalPaise,
      savingPaise: l.linePromotionDiscountPaise,
      taxPaise: l.lineTaxPaise,
    },
    optionB: { netLinePaise: l.lineTotalPaise },
  }));
}

function summary(snapshot: CheckoutSnapshot) {
  return {
    prePromotionSubtotalPaise: snapshot.prePromotionSubtotalPaise,
    promotionDiscountPaise: snapshot.promotionDiscountPaise,
    chargesPaise: snapshot.chargesPaise,
    taxPaise: snapshot.taxPaise,
    grandTotalPaise: snapshot.grandTotalPaise,
  };
}

function report(scenario: string, snapshot: CheckoutSnapshot, views: readonly OptionView[]) {
  console.info(
    `[#385 evidence] ${scenario} ${JSON.stringify(
      { lines: views, summary: summary(snapshot) },
      (_k, v) => (typeof v === "bigint" ? v.toString() : v),
    )}`,
  );
}

describe("IMP-036J #385 item-line presentation options (Founder evidence)", () => {
  it("percentage discount (10% off ₹100 line)", async () => {
    await withCheckoutReadyHarness(async (harness) => {
      await seedAutomaticPromotion(
        harness,
        { ...NO_BENEFIT_FIELDS, benefitType: "percentage_discount", percentageBps: 1000 },
        { targetType: "all_merchandise" },
      );
      const snapshot = await evaluate(harness);
      const views = optionViews(snapshot);
      report("percentage", snapshot, views);

      expect(views).toHaveLength(1);
      expect(views[0]!.optionA.grossPaise).toBe(BigInt(10_000));
      expect(views[0]!.optionA.savingPaise).toBe(BigInt(1_000));
      expect(views[0]!.optionB.netLinePaise).toBe(
        BigInt(9_000) + views[0]!.optionA.taxPaise,
      );
    });
  }, 180_000);

  it("fixed discount (₹30 off ₹100 line)", async () => {
    await withCheckoutReadyHarness(async (harness) => {
      await seedAutomaticPromotion(
        harness,
        { ...NO_BENEFIT_FIELDS, benefitType: "fixed_amount_discount", fixedAmountPaise: BigInt(3_000) },
        { targetType: "all_merchandise" },
      );
      const snapshot = await evaluate(harness);
      const views = optionViews(snapshot);
      report("fixed", snapshot, views);

      expect(views[0]!.optionA.grossPaise).toBe(BigInt(10_000));
      expect(views[0]!.optionA.savingPaise).toBe(BigInt(3_000));
    });
  }, 180_000);

  it("buy 1 get 1 (two ₹100 units, one free)", async () => {
    await withCheckoutReadyHarness(async (harness) => {
      const { persistence, actors, catalog } = harness;
      await setCartLineQuantity(
        persistence,
        customerAccess(actors.customerA, actors.tree.brand.id),
        {
          cartLineId: await onlyCartLineId(harness),
          quantity: 2,
          expectedRevision: BigInt(1),
        },
      );
      await seedAutomaticPromotion(
        harness,
        {
          ...NO_BENEFIT_FIELDS,
          benefitType: "buy_x_get_y",
          buyQuantity: 1,
          getQuantity: 1,
          repeatable: true,
        },
        { targetType: "variant", variantId: catalog.variantId },
      );
      const snapshot = await evaluate(harness);
      const views = optionViews(snapshot);
      report("bogo", snapshot, views);

      expect(views[0]!.quantity).toBe(2);
      expect(views[0]!.optionA.grossPaise).toBe(BigInt(20_000));
      expect(views[0]!.optionA.savingPaise).toBe(BigInt(10_000));
    });
  }, 180_000);

  it("modifiers + tax across two lines (10% off, modifiers included)", async () => {
    await withCheckoutReadyHarness(async (harness) => {
      const { persistence, actors } = harness;
      const brandId = actors.tree.brand.id;
      const mod = await seedActiveVariantWithModifier(persistence, brandId, actors.brandAdminActor);
      await includeVariantAtBrand(persistence, actors.brandAdminActor, brandId, mod.variantId);
      await attachVariantPriceToActiveBrandBook(persistence, {
        brandId,
        variantId: mod.variantId,
        amountPaise: BigInt(15_000),
      });
      const priceBookId = await persistence.withContext(async (ctx) => {
        const r = await ctx.db.execute(sql`
          select id::text as id from app.price_books
          where brand_id = ${brandId}::uuid and scope_type = 'brand'
            and lifecycle_status = 'active'
          limit 1
        `);
        return r.rows[0]!.id as string;
      });
      await seedModifierDeltaOnBook(persistence, {
        brandId,
        priceBookId,
        variantModifierGroupId: mod.variantModifierGroupId,
        modifierGroupOptionId: mod.modifierGroupOptionId,
        priceDeltaPaise: BigInt(3_300),
      });
      await addCartLine(persistence, customerAccess(actors.customerA, brandId), {
        variantId: mod.variantId,
        quantity: 1,
        expectedRevision: harness.cartRevision,
        modifiers: [
          {
            variantModifierGroupId: mod.variantModifierGroupId,
            modifierGroupOptionId: mod.modifierGroupOptionId,
            quantity: 1,
          },
        ],
      });
      await seedAutomaticPromotion(
        harness,
        {
          ...NO_BENEFIT_FIELDS,
          benefitType: "percentage_discount",
          percentageBps: 1000,
          includeModifiers: true,
        },
        { targetType: "all_merchandise" },
      );
      const snapshot = await evaluate(harness);
      const views = optionViews(snapshot);
      report("modifiers-and-tax", snapshot, views);

      expect(views).toHaveLength(2);
      const modLine = snapshot.lines.find((l) => l.variantId === mod.variantId)!;
      expect(modLine.lineModifierAdjustmentsPaise).toBe(BigInt(3_300));
      expect(modLine.lineSubtotalPaise).toBe(BigInt(18_300));
      expect(snapshot.taxPaise).toBeGreaterThan(BigInt(0));
      expect(snapshot.lines.every((l) => l.lineTaxPaise > BigInt(0))).toBe(true);
    });
  }, 180_000);
});
