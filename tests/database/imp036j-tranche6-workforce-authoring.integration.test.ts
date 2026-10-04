/**
 * IMP-036J Tranche 6 — WORKFORCE_AUTHORING proof (US-036J-012).
 *
 * Real PostgreSQL. Overlapping transactions for AC-036J-012-06.
 */
import { readFileSync } from "node:fs";
import { createServer } from "node:http";
import path from "node:path";

import { serializeSignedCookie } from "better-call";
import { eq, sql } from "drizzle-orm";
import { afterEach, describe, expect, inject, it } from "vitest";

import { createMembership, grantRole } from "../../src/server/access-control";
import {
  getWorkforceAuthRuntime,
  WORKFORCE_AUTH_SESSION_COOKIE_NAME,
} from "../../src/server/auth/workforce";
import { loadAuthFoundationConfig } from "../../src/server/auth/shared/config";
import {
  activateModifierGroup,
  activateModifierGroupOption,
  activateModifierOption,
  activateProduct,
  activateVariant,
  activateVariantModifierGroup,
  addModifierOptionToGroup,
  applyModifierGroupToVariant,
  createModifierGroup,
  createModifierOption,
  createProduct,
  createVariant,
  publishCatalogContentChange,
  retireProduct,
} from "../../src/server/catalog";
import { catalogContentRevisionsTable } from "../../src/platform/database/schema/catalog";
import { routeOperationsRequest } from "../../src/server/operations/http/router";
import { attachDraftModifierPrice, createDraftPriceBook } from "../../src/server/pricing";
import {
  activateCoupon,
  activatePromotion,
  createCouponDraft,
  createPromotionDraft,
  hydratePromotionDefinition,
  inspectBrandPromotion,
  retirePromotion,
  setPromotionBenefit,
  setPromotionTargets,
  updateBrandPromotionPolicy,
  updatePromotionDraft,
  PromotionAdminError,
} from "../../src/server/promotions";
import { promotionsTable } from "../../src/platform/database/schema/promotions";
import { CHARGE_DEFINITION_DELIVERY_ID } from "../../src/shared/pricing/constants";
import {
  calculateBenefit,
  evaluateEligibility,
  type MonetaryComponent,
  type PrePromotionSnapshot,
  type PromotionBenefitConfig,
} from "../../src/shared/promotions";
import {
  COPY_OP_GIFT_INVALID,
  COPY_OP_RACE,
  COPY_OP_SECOND,
} from "../../src/shared/promotions/operator-copy";
import { createEligibleWorkforceUser, principalFor, seedBrandTree } from "./support/access-control-fixtures";
import {
  closeTrackedPersistenceHandles,
  openTrackedApplicationPersistence,
  seedActiveBundleWithComponent,
  seedActiveStandardVariant,
  seedActiveVariantWithModifier,
  uniqueCode,
} from "./support/cart-fixtures";
import {
  createReadyDraftPromotion,
  seedPromotionsHarness,
} from "./support/promotions-fixtures";
import { applyMigrations, withIsolatedTestDatabase } from "./support/test-database";
import type { WebConfig } from "../../src/platform/config";

afterEach(async () => {
  await closeTrackedPersistenceHandles();
});

function adminConnectionInfo() {
  return {
    connectionString: inject("bobaBearTestAdminConnectionString"),
    host: inject("bobaBearTestAdminHost"),
    port: inject("bobaBearTestAdminPort"),
  };
}

function applicationConfig(databaseUrl: string): WebConfig {
  return {
    environment: "test",
    processKind: "web",
    publicOrigin: "http://localhost:3000",
    logLevel: "warn",
    release: null,
    allowUnsafeAdapters: true,
    databaseSslMode: "disable",
    port: 3000,
    databaseUrl,
  };
}

const MERCH = {
  targetType: "all_merchandise" as const,
  productId: null,
  variantId: null,
  chargeDefinitionId: null,
};

const DELIVERY_CHARGE_TARGET = {
  targetType: "charge" as const,
  productId: null,
  variantId: null,
  chargeDefinitionId: CHARGE_DEFINITION_DELIVERY_ID,
};

async function publishBrandProduct(
  harness: Awaited<ReturnType<typeof seedPromotionsHarness>>,
  productId: string,
) {
  await harness.persistence.transaction(async (tx) => {
    const rows = await tx.db
      .select()
      .from(catalogContentRevisionsTable)
      .where(eq(catalogContentRevisionsTable.brandId, harness.tree.brand.id))
      .limit(1);
    const envelope = rows[0];
    if (!envelope) throw new Error("missing brand content revision");
    await publishCatalogContentChange(tx, {
      actor: harness.brandAdminPrincipal,
      brandId: harness.tree.brand.id,
      productId,
      expectedContentRevision: envelope.contentRevision,
    });
  });
}

async function enableAllScopeDelegation(
  harness: Awaited<ReturnType<typeof seedPromotionsHarness>>,
) {
  await harness.persistence.transaction(async (tx) => {
    await updateBrandPromotionPolicy(tx, {
      actor: harness.brandAdminPrincipal,
      brandId: harness.tree.brand.id,
      allowTerritoryPromotions: true,
      allowOrganizationPromotions: true,
      allowOutletPromotions: true,
    });
  });
}

function deliverySnapshot(deliveryPaise: bigint, merchandisePaise = BigInt(10000)): PrePromotionSnapshot {
  const delivery: MonetaryComponent = {
    componentId: `charge:${CHARGE_DEFINITION_DELIVERY_ID}`,
    kind: "charge",
    lineId: null,
    lineSequence: 100,
    variantId: null,
    productId: null,
    chargeDefinitionId: CHARGE_DEFINITION_DELIVERY_ID,
    amountPaise: deliveryPaise,
    taxCategoryId: "tax",
  };
  return {
    components: [
      {
        componentId: "base",
        kind: "variant_base",
        lineId: "L1",
        lineSequence: 0,
        variantId: "v1",
        productId: "p1",
        chargeDefinitionId: null,
        amountPaise: merchandisePaise,
        taxCategoryId: "tax",
      },
      delivery,
    ],
    units: [
      {
        unitId: "u0",
        lineId: "L1",
        lineSequence: 0,
        unitIndex: 0,
        productId: "p1",
        variantId: "v1",
        unitBasePaise: merchandisePaise,
        modifierPaise: BigInt(0),
        bundleDeltaPaise: BigInt(0),
        taxCategoryId: "tax",
      },
    ],
  };
}

function emptyMoneyBenefit(type: PromotionBenefitConfig["benefitType"]): PromotionBenefitConfig {
  return {
    benefitType: type,
    percentageBps: type === "percentage_discount" ? 1000 : null,
    fixedAmountPaise: type === "fixed_amount_discount" ? BigInt(100) : null,
    maximumDiscountPaise: null,
    buyQuantity: null,
    getQuantity: null,
    repeatable: null,
    maximumRewardQuantity: null,
    includeModifiers: false,
    includeBundleDeltas: false,
    complimentaryProductId: null,
    complimentaryVariantId: null,
  };
}

async function retarget(
  harness: Awaited<ReturnType<typeof seedPromotionsHarness>>,
  promotionId: string,
  revision: bigint,
) {
  const actor = harness.brandAdminPrincipal;
  let next = revision;
  next = (
    await harness.persistence.transaction((tx) =>
      setPromotionTargets(tx, {
        actor,
        promotionId,
        expectedPromotionRevision: next,
        targetRole: "qualifier",
        targets: [{ targetRole: "qualifier", ...MERCH }],
      }),
    )
  ).revision;
  next = (
    await harness.persistence.transaction((tx) =>
      setPromotionTargets(tx, {
        actor,
        promotionId,
        expectedPromotionRevision: next,
        targetRole: "benefit",
        targets: [{ targetRole: "benefit", ...MERCH }],
      }),
    )
  ).revision;
  return next;
}

describe("IMP-036J Tranche 6 workforce authoring", () => {
  it("authors automatic and coupon Offers with V1 fields, inspect, retire, gift, auth, CAS, and real concurrent complimentary activation", async () => {
    await withIsolatedTestDatabase(adminConnectionInfo(), async (database) => {
      await applyMigrations(database.connectionString);
      const openHandles: Array<{ close(): Promise<void> }> = [];
      const harness = await seedPromotionsHarness(database.connectionString, openHandles);
      const actor = harness.brandAdminPrincipal;
      const brandId = harness.tree.brand.id;
      const catalog = await seedActiveStandardVariant(harness.persistence, brandId, actor, "t6g");

      const auto = await harness.persistence.transaction(async (tx) => {
        return createPromotionDraft(tx, {
          actor,
          brandId,
          code: uniqueCode("auto"),
          displayName: "Automatic V1",
          scopeType: "brand",
          triggerType: "automatic",
          stackingPolicy: "exclusive",
          startsAt: new Date("2026-01-01T00:00:00Z"),
          endsAt: new Date("2026-12-31T00:00:00Z"),
          firstOrderOnly: true,
          eligibleFulfilmentModes: ["DELIVERY"],
          eligibleFulfilmentTimings: ["ASAP"],
          maximumRedemptions: 50,
          maximumRedemptionsPerCustomer: 2,
          minimumQualifyingAmountPaise: BigInt(10000),
        });
      });
      let autoRev = auto.revision;
      autoRev = (
        await harness.persistence.transaction((tx) =>
          setPromotionBenefit(tx, {
            actor,
            promotionId: auto.id,
            expectedPromotionRevision: autoRev,
            benefit: emptyMoneyBenefit("delivery_fee_waiver"),
          }),
        )
      ).revision;
      autoRev = (
        await harness.persistence.transaction((tx) =>
          setPromotionTargets(tx, {
            actor,
            promotionId: auto.id,
            expectedPromotionRevision: autoRev,
            targetRole: "qualifier",
            targets: [{ targetRole: "qualifier", ...MERCH }],
          }),
        )
      ).revision;
      autoRev = (
        await harness.persistence.transaction((tx) =>
          setPromotionTargets(tx, {
            actor,
            promotionId: auto.id,
            expectedPromotionRevision: autoRev,
            targetRole: "benefit",
            targets: [{ targetRole: "benefit", ...DELIVERY_CHARGE_TARGET }],
          }),
        )
      ).revision;
      autoRev = (
        await harness.persistence.transaction((tx) =>
          activatePromotion(tx, {
            actor,
            promotionId: auto.id,
            expectedPromotionRevision: autoRev,
          }),
        )
      ).revision;
      const autoInspect = await harness.persistence.withContext((ctx) =>
        inspectBrandPromotion(ctx, { actor, brandId, promotionId: auto.id }),
      );
      expect(autoInspect.promotion.status).toBe("active");
      expect(autoInspect.promotion.firstOrderOnly).toBe(true);
      expect(autoInspect.promotion.eligibleFulfilmentModes).toEqual(["DELIVERY"]);
      expect(autoInspect.promotion.eligibleFulfilmentTimings).toEqual(["ASAP"]);
      expect(autoInspect.promotion.maximumRedemptions).toBe(50);
      expect(autoInspect.promotion.maximumRedemptionsPerCustomer).toBe(2);
      expect(autoInspect.benefit?.benefitType).toBe("delivery_fee_waiver");
      expect(autoInspect.benefitTargets).toEqual([
        expect.objectContaining({
          targetType: "charge",
          chargeDefinitionId: CHARGE_DEFINITION_DELIVERY_ID,
        }),
      ]);
      const waiverDef = await harness.persistence.withContext(async (ctx) => {
        const rows = await ctx.db
          .select()
          .from(promotionsTable)
          .where(eq(promotionsTable.id, auto.id))
          .limit(1);
        return hydratePromotionDefinition(ctx, rows[0]!);
      });
      const waiverEval = calculateBenefit(waiverDef, deliverySnapshot(BigInt(4000)));
      expect(waiverEval.nominalBenefitPaise).toBe(BigInt(4000));
      const zeroStanding = calculateBenefit(waiverDef, deliverySnapshot(BigInt(0)));
      expect(zeroStanding.nominalBenefitPaise).toBe(BigInt(0));
      const pickupNoDelivery = calculateBenefit(waiverDef, {
        components: [
          {
            componentId: "base",
            kind: "variant_base",
            lineId: "L1",
            lineSequence: 0,
            variantId: "v1",
            productId: "p1",
            chargeDefinitionId: null,
            amountPaise: BigInt(10000),
            taxCategoryId: "tax",
          },
        ],
        units: deliverySnapshot(BigInt(0)).units,
      });
      expect(pickupNoDelivery.nominalBenefitPaise).toBe(BigInt(0));
      expect(autoInspect.redemptionCounts).toEqual({
        reservedCount: 0,
        consumedCount: 0,
        releasedCount: 0,
        applicationCount: 0,
      });
      const inspectJson = JSON.stringify(autoInspect);
      expect(inspectJson).not.toMatch(/customerId|customer_id|first.order guard|claim row/i);

      const couponPromo = await createReadyDraftPromotion(harness, { triggerType: "coupon" });
      const couponActivatedPromo = await harness.persistence.transaction((tx) =>
        activatePromotion(tx, {
          actor,
          promotionId: couponPromo.id,
          expectedPromotionRevision: couponPromo.revision,
        }),
      );
      const coupon = await harness.persistence.transaction((tx) =>
        createCouponDraft(tx, {
          actor,
          promotionId: couponPromo.id,
          origin: "manual",
          canonicalCode: uniqueCode("C6"),
        }),
      );
      await harness.persistence.transaction((tx) =>
        activateCoupon(tx, {
          actor,
          couponId: coupon.id,
          expectedCouponRevision: coupon.revision,
        }),
      );
      expect(couponActivatedPromo.revision).toBeGreaterThan(couponPromo.revision);

      const historyBefore = await harness.persistence.withContext(async (ctx) => {
        const lines = await ctx.db.execute(
          sql`select count(*)::int as c from app.checkout_snapshot_lines`,
        );
        const orders = await ctx.db.execute(sql`select count(*)::int as c from app.orders`);
        return {
          lines: Number(lines.rows[0]?.c ?? 0),
          orders: Number(orders.rows[0]?.c ?? 0),
        };
      });
      const retired = await harness.persistence.transaction((tx) =>
        retirePromotion(tx, {
          actor,
          promotionId: auto.id,
          expectedPromotionRevision: autoRev,
        }),
      );
      expect(retired.revision).toBeGreaterThan(autoRev);
      const retiredInspect = await harness.persistence.withContext((ctx) =>
        inspectBrandPromotion(ctx, { actor, brandId, promotionId: auto.id }),
      );
      expect(retiredInspect.promotion.status).toBe("retired");
      const historyAfter = await harness.persistence.withContext(async (ctx) => {
        const lines = await ctx.db.execute(
          sql`select count(*)::int as c from app.checkout_snapshot_lines`,
        );
        const orders = await ctx.db.execute(sql`select count(*)::int as c from app.orders`);
        return {
          lines: Number(lines.rows[0]?.c ?? 0),
          orders: Number(orders.rows[0]?.c ?? 0),
        };
      });
      expect(historyAfter).toEqual(historyBefore);

      const giftDraft = await createReadyDraftPromotion(harness);
      const giftOk = await harness.persistence.transaction((tx) =>
        setPromotionBenefit(tx, {
          actor,
          promotionId: giftDraft.id,
          expectedPromotionRevision: giftDraft.revision,
          benefit: {
            ...emptyMoneyBenefit("complimentary_item"),
            complimentaryProductId: catalog.productId,
            complimentaryVariantId: catalog.variantId,
          },
        }),
      );
      const giftActive = await harness.persistence.transaction((tx) =>
        activatePromotion(tx, {
          actor,
          promotionId: giftDraft.id,
          expectedPromotionRevision: giftOk.revision,
        }),
      );
      expect(giftActive.revision).toBeGreaterThan(giftOk.revision);

      const incomplete = await createReadyDraftPromotion(harness);
      await expect(
        harness.persistence.transaction((tx) =>
          setPromotionBenefit(tx, {
            actor,
            promotionId: incomplete.id,
            expectedPromotionRevision: incomplete.revision,
            benefit: emptyMoneyBenefit("complimentary_item"),
          }),
        ),
      ).rejects.toMatchObject({
        code: "PROMOTION_COMPLIMENTARY_INVALID",
        message: COPY_OP_GIFT_INVALID,
        field: "complimentaryProductId",
      });
      const stillDraft = await harness.persistence.withContext((ctx) =>
        inspectBrandPromotion(ctx, { actor, brandId, promotionId: incomplete.id }),
      );
      expect(stillDraft.promotion.status).toBe("draft");

      const bundle = await seedActiveBundleWithComponent(
        harness.persistence,
        brandId,
        actor,
        { codePrefix: "t6b" },
      );
      await expect(
        harness.persistence.transaction((tx) =>
          setPromotionBenefit(tx, {
            actor,
            promotionId: incomplete.id,
            expectedPromotionRevision: stillDraft.promotion.revision,
            benefit: {
              ...emptyMoneyBenefit("complimentary_item"),
              complimentaryProductId: bundle.bundleProductId,
              complimentaryVariantId: bundle.bundleVariantId,
            },
          }),
        ),
      ).rejects.toMatchObject({
        code: "PROMOTION_COMPLIMENTARY_INVALID",
        message: COPY_OP_GIFT_INVALID,
      });

      const requiredChoice = await harness.persistence.transaction(async (tx) => {
        const product = await createProduct(tx, {
          actor,
          brandId,
          code: uniqueCode("req-p"),
          name: "Required choice",
          productKind: "standard",
        });
        const variant = await createVariant(tx, {
          actor,
          productId: product.id,
          code: "default",
          name: "Default",
          isDefault: true,
          isSelectorVisible: false,
        });
        const group = await createModifierGroup(tx, {
          actor,
          brandId,
          code: uniqueCode("req-g"),
          name: "Must pick",
        });
        const option = await createModifierOption(tx, {
          actor,
          brandId,
          code: uniqueCode("req-o"),
          name: "One",
        });
        const binding = await addModifierOptionToGroup(tx, {
          actor,
          modifierGroupId: group.id,
          modifierOptionId: option.id,
          minQuantity: 1,
          maxQuantity: 1,
          defaultQuantity: 1,
        });
        const vmg = await applyModifierGroupToVariant(tx, {
          actor,
          variantId: variant.id,
          modifierGroupId: group.id,
          minTotalQuantity: 1,
          maxTotalQuantity: 1,
        });
        await activateModifierOption(tx, { actor, modifierOptionId: option.id });
        await activateModifierGroupOption(tx, {
          actor,
          modifierGroupOptionId: binding.id,
        });
        await activateModifierGroup(tx, { actor, modifierGroupId: group.id });
        await activateVariantModifierGroup(tx, {
          actor,
          variantModifierGroupId: vmg.id,
        });
        await activateVariant(tx, { actor, variantId: variant.id });
        await activateProduct(tx, { actor, productId: product.id });
        return { productId: product.id, variantId: variant.id };
      });
      await publishBrandProduct(harness, requiredChoice.productId);
      await expect(
        harness.persistence.transaction((tx) =>
          setPromotionBenefit(tx, {
            actor,
            promotionId: incomplete.id,
            expectedPromotionRevision: stillDraft.promotion.revision,
            benefit: {
              ...emptyMoneyBenefit("complimentary_item"),
              complimentaryProductId: requiredChoice.productId,
              complimentaryVariantId: requiredChoice.variantId,
            },
          }),
        ),
      ).rejects.toMatchObject({
        code: "PROMOTION_COMPLIMENTARY_INVALID",
        message: COPY_OP_GIFT_INVALID,
      });

      const paidMod = await seedActiveVariantWithModifier(
        harness.persistence,
        brandId,
        actor,
        "t6p",
      );
      await harness.persistence.transaction(async (tx) => {
        const book = await createDraftPriceBook(tx, {
          actor,
          brandId,
          scopeType: "brand",
          code: uniqueCode("pb"),
          name: "T6 paid mod",
          effectiveFrom: new Date("2026-01-01T00:00:00Z"),
        });
        await attachDraftModifierPrice(tx, {
          actor,
          brandId,
          priceBookId: book.id,
          variantModifierGroupId: paidMod.variantModifierGroupId,
          modifierGroupOptionId: paidMod.modifierGroupOptionId,
          priceDeltaPaise: BigInt(500),
          expectedPriceBookRevision: book.revision,
        });
      });
      const paidAccepted = await harness.persistence.transaction((tx) =>
        setPromotionBenefit(tx, {
          actor,
          promotionId: incomplete.id,
          expectedPromotionRevision: stillDraft.promotion.revision,
          benefit: {
            ...emptyMoneyBenefit("complimentary_item"),
            complimentaryProductId: paidMod.productId,
            complimentaryVariantId: paidMod.variantId,
          },
        }),
      );
      expect(paidAccepted.revision).toBeGreaterThan(BigInt(stillDraft.promotion.revision));
      const paidInspect = await harness.persistence.withContext((ctx) =>
        inspectBrandPromotion(ctx, { actor, brandId, promotionId: incomplete.id }),
      );
      expect(paidInspect.benefit?.complimentaryVariantId).toBe(paidMod.variantId);
      expect(paidInspect.benefit?.includeModifiers).toBe(false);
      const pricingGiftSrc = readFileSync(
        path.join(process.cwd(), "src/server/checkout/adapters/pricing.ts"),
        "utf8",
      );
      expect(pricingGiftSrc).toMatch(/modifiers:\s*Object\.freeze\(\[\]\)/);
      expect(pricingGiftSrc).toMatch(/lineOrigin:\s*"complimentary_offer"/);

      const secondGift = await createReadyDraftPromotion(harness);
      const secondGiftBenefit = await harness.persistence.transaction((tx) =>
        setPromotionBenefit(tx, {
          actor,
          promotionId: secondGift.id,
          expectedPromotionRevision: secondGift.revision,
          benefit: {
            ...emptyMoneyBenefit("complimentary_item"),
            complimentaryProductId: catalog.productId,
            complimentaryVariantId: catalog.variantId,
          },
        }),
      );
      await expect(
        harness.persistence.transaction((tx) =>
          activatePromotion(tx, {
            actor,
            promotionId: secondGift.id,
            expectedPromotionRevision: secondGiftBenefit.revision,
          }),
        ),
      ).rejects.toMatchObject({
        code: "PROMOTION_COMPLIMENTARY_ACTIVE_CONFLICT",
        message: COPY_OP_SECOND,
      });
      const existingStill = await harness.persistence.withContext((ctx) =>
        inspectBrandPromotion(ctx, { actor, brandId, promotionId: giftDraft.id }),
      );
      expect(existingStill.promotion.status).toBe("active");
      const activeCount = await harness.persistence.withContext(async (ctx) => {
        const rows = await ctx.db
          .select({ id: promotionsTable.id })
          .from(promotionsTable)
          .where(eq(promotionsTable.status, "active"));
        return rows.filter((row) => row.id === giftDraft.id || row.id === secondGift.id).length;
      });
      expect(activeCount).toBe(1);
      const secondStillDraft = await harness.persistence.withContext((ctx) =>
        inspectBrandPromotion(ctx, { actor, brandId, promotionId: secondGift.id }),
      );
      expect(secondStillDraft.promotion.status).toBe("draft");

      await harness.persistence.transaction((tx) =>
        retirePromotion(tx, {
          actor,
          promotionId: giftDraft.id,
          expectedPromotionRevision: existingStill.promotion.revision,
        }),
      );

      const raceACatalog = catalog;
      const raceBCatalog = await seedActiveStandardVariant(
        harness.persistence,
        brandId,
        actor,
        "t6r",
      );
      const raceA = await createReadyDraftPromotion(harness);
      const raceB = await createReadyDraftPromotion(harness);
      const raceARev = (
        await harness.persistence.transaction((tx) =>
          setPromotionBenefit(tx, {
            actor,
            promotionId: raceA.id,
            expectedPromotionRevision: raceA.revision,
            benefit: {
              ...emptyMoneyBenefit("complimentary_item"),
              complimentaryProductId: raceACatalog.productId,
              complimentaryVariantId: raceACatalog.variantId,
            },
          }),
        )
      ).revision;
      const raceBRev = (
        await harness.persistence.transaction((tx) =>
          setPromotionBenefit(tx, {
            actor,
            promotionId: raceB.id,
            expectedPromotionRevision: raceB.revision,
            benefit: {
              ...emptyMoneyBenefit("complimentary_item"),
              complimentaryProductId: raceBCatalog.productId,
              complimentaryVariantId: raceBCatalog.variantId,
            },
          }),
        )
      ).revision;

      const persistenceA = openTrackedApplicationPersistence(database.connectionString);
      const persistenceB = openTrackedApplicationPersistence(database.connectionString);
      let arrived = 0;
      let release!: () => void;
      const bothHeld = new Promise<void>((resolve) => {
        release = resolve;
      });
      const waitPeer = async () => {
        arrived += 1;
        if (arrived === 2) release();
        await bothHeld;
      };
      const overlapping = await Promise.allSettled([
        persistenceA.transaction((tx) =>
          activatePromotion(tx, {
            actor,
            promotionId: raceA.id,
            expectedPromotionRevision: raceARev,
            afterAuthoringLocksHeld: waitPeer,
          }),
        ),
        persistenceB.transaction((tx) =>
          activatePromotion(tx, {
            actor,
            promotionId: raceB.id,
            expectedPromotionRevision: raceBRev,
            afterAuthoringLocksHeld: waitPeer,
          }),
        ),
      ]);
      const wins = overlapping.filter((r) => r.status === "fulfilled");
      const losses = overlapping.filter((r) => r.status === "rejected");
      expect(wins.length).toBe(1);
      expect(losses.length).toBe(1);
      const loss = losses[0] as PromiseRejectedResult;
      expect(loss.reason).toBeInstanceOf(PromotionAdminError);
      expect(loss.reason).toMatchObject({
        code: "PROMOTION_COMPLIMENTARY_ACTIVATION_RACE",
        message: COPY_OP_RACE,
      });
      const raced = await harness.persistence.withContext(async (ctx) => {
        const rows = await ctx.db
          .select({
            id: promotionsTable.id,
            status: promotionsTable.status,
          })
          .from(promotionsTable)
          .where(eq(promotionsTable.complimentaryItem, true));
        return rows.filter((row) => row.status === "active");
      });
      expect(raced.length).toBe(1);
      const audits = await harness.persistence.withContext(async (ctx) => {
        const result = await ctx.db.execute(sql`
          select resource_id, action
          from app.promotion_audit_events
          where action = 'promotion.activated'
            and resource_id in (${raceA.id}::uuid, ${raceB.id}::uuid)
        `);
        return result.rows as Array<{ resource_id: string; action: string }>;
      });
      expect(audits).toHaveLength(1);
      expect(audits[0]?.resource_id).toBe(raced[0]?.id);
      await persistenceA.close();
      await persistenceB.close();

      await expect(
        harness.persistence.transaction((tx) =>
          updatePromotionDraft(tx, {
            actor,
            promotionId: incomplete.id,
            expectedPromotionRevision: BigInt(1),
            displayName: "stale",
          }),
        ),
      ).rejects.toMatchObject({ code: "PROMOTION_STALE_REVISION" });

      const kitchen = await createEligibleWorkforceUser(harness.persistence);
      await harness.persistence.transaction(async (tx) => {
        const membership = await createMembership(tx, {
          workforceUserId: kitchen.id,
          scope: {
            scopeType: "outlet",
            brandId,
            organizationId: harness.tree.orgA.id,
            territoryId: harness.tree.terrA.id,
            outletId: harness.tree.outletA.id,
          },
          status: "active",
        });
        await grantRole(tx, { membershipId: membership.id, roleKey: "kitchen_operator" });
      });
      const kitchenActor = principalFor(kitchen.id);
      const deniedDraft = await createReadyDraftPromotion(harness);
      await expect(
        harness.persistence.transaction((tx) =>
          activatePromotion(tx, {
            actor: kitchenActor,
            promotionId: deniedDraft.id,
            expectedPromotionRevision: deniedDraft.revision,
          }),
        ),
      ).rejects.toBeTruthy();
      const unchanged = await harness.persistence.withContext((ctx) =>
        inspectBrandPromotion(ctx, { actor, brandId, promotionId: deniedDraft.id }),
      );
      expect(unchanged.promotion.status).toBe("draft");
      expect(unchanged.promotion.revision).toBe(deniedDraft.revision.toString(10));

      const otherTree = await harness.persistence.transaction((tx) => seedBrandTree(tx, "t6x"));
      const otherAdmin = await createEligibleWorkforceUser(harness.persistence);
      await harness.persistence.transaction(async (tx) => {
        const membership = await createMembership(tx, {
          workforceUserId: otherAdmin.id,
          scope: { scopeType: "brand", brandId: otherTree.brand.id },
          status: "active",
        });
        await grantRole(tx, { membershipId: membership.id, roleKey: "brand_admin" });
      });
      await expect(
        harness.persistence.transaction((tx) =>
          activatePromotion(tx, {
            actor: principalFor(otherAdmin.id),
            brandId: otherTree.brand.id,
            promotionId: deniedDraft.id,
            expectedPromotionRevision: deniedDraft.revision,
          }),
        ),
      ).rejects.toBeTruthy();
      const stillUnchanged = await harness.persistence.withContext((ctx) =>
        inspectBrandPromotion(ctx, { actor, brandId, promotionId: deniedDraft.id }),
      );
      expect(stillUnchanged.promotion.status).toBe("draft");

      const editorSrc = readFileSync(
        path.join(process.cwd(), "src/components/administration/commercial/PromotionsEditor.tsx"),
        "utf8",
      );
      expect(editorSrc).not.toMatch(/evaluateCart|evaluateCheckout|payablePaise/);
      expect(editorSrc).not.toMatch(/gift catalogue|gift picker|gift pool/i);
      const cartSrc = readFileSync(
        path.join(process.cwd(), "src/components/ordering/CartClient.tsx"),
        "utf8",
      );
      expect(cartSrc).not.toContain("COPY_OP_");
      await Promise.all(openHandles.map((handle) => handle.close()));
    });
  });

  it("rejects client-supplied role on activate and writes nothing", async () => {
    await withIsolatedTestDatabase(adminConnectionInfo(), async (database) => {
      await applyMigrations(database.connectionString);
      const openHandles: Array<{ close(): Promise<void> }> = [];
      const harness = await seedPromotionsHarness(database.connectionString, openHandles);
      const draft = await createReadyDraftPromotion(harness);
      const workforce = loadAuthFoundationConfig(
        {
          CUSTOMER_AUTH_SECRET: "t6-customer-auth-secret-32charsxxx",
          CUSTOMER_AUTH_BASE_URL: "http://localhost:3100",
          WORKFORCE_AUTH_SECRET: "t6-workforce-auth-secret-32charsx",
          WORKFORCE_AUTH_BASE_URL: "http://localhost:3200",
        },
        "test",
      ).workforce;
      const runtime = getWorkforceAuthRuntime({
        auth: workforce,
        persistence: applicationConfig(database.connectionString),
      });
      const auth = await runtime.getAuth();
      const adapter = ((await auth.$context) as { internalAdapter: { createSession: (id: string) => Promise<{ token: string }> } })
        .internalAdapter;
      const server = createServer((req, res) => {
        void routeOperationsRequest(
          req,
          res,
          {
            runtime,
            persistence: harness.persistence,
            trustedOrigin: workforce.baseURL.origin,
            stepUpSessionHashSecret: workforce.secret,
          },
          "t6-promotions-http",
        );
      });
      await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
      const address = server.address();
      if (!address || typeof address === "string") throw new Error("no addr");
      const base = `http://127.0.0.1:${address.port}`;
      const session = await adapter.createSession(harness.brandAdmin.id);
      const cookie = (
        await serializeSignedCookie(
          WORKFORCE_AUTH_SESSION_COOKIE_NAME,
          session.token,
          workforce.secret,
        )
      ).split(";", 1)[0]!;
      const res = await fetch(
        `${base}/api/admin/v1/brands/${harness.tree.brand.id}/promotions/${draft.id}/activate`,
        {
          method: "POST",
          headers: {
            cookie,
            origin: workforce.baseURL.origin,
            "content-type": "application/json",
          },
          body: JSON.stringify({
            expectedPromotionRevision: draft.revision.toString(10),
            role: "brand_admin",
            roles: ["platform_super_admin"],
          }),
        },
      );
      expect(res.status).toBeGreaterThanOrEqual(400);
      const body = (await res.json()) as { ok: boolean };
      expect(body.ok).toBe(false);
      const after = await harness.persistence.withContext((ctx) =>
        inspectBrandPromotion(ctx, {
          actor: harness.brandAdminPrincipal,
          brandId: harness.tree.brand.id,
          promotionId: draft.id,
        }),
      );
      expect(after.promotion.status).toBe("draft");
      await new Promise<void>((resolve, reject) => {
        server.close((err) => (err ? reject(err) : resolve()));
      });
      await runtime.close();
      await Promise.all(openHandles.map((handle) => handle.close()));
    });
  });

  it("uses effective Catalog publication truth for complimentary gifts", async () => {
    await withIsolatedTestDatabase(adminConnectionInfo(), async (database) => {
      await applyMigrations(database.connectionString);
      const openHandles: Array<{ close(): Promise<void> }> = [];
      const harness = await seedPromotionsHarness(database.connectionString, openHandles);
      const actor = harness.brandAdminPrincipal;
      const brandId = harness.tree.brand.id;
      const draft = await createReadyDraftPromotion(harness);

      const stagedOnly = await harness.persistence.transaction(async (tx) => {
        const product = await createProduct(tx, {
          actor,
          brandId,
          code: uniqueCode("stg-p"),
          name: "Staged only",
          productKind: "standard",
        });
        const variant = await createVariant(tx, {
          actor,
          productId: product.id,
          code: "default",
          name: "Default",
          isDefault: true,
          isSelectorVisible: false,
        });
        await activateVariant(tx, { actor, variantId: variant.id });
        await activateProduct(tx, { actor, productId: product.id });
        return { productId: product.id, variantId: variant.id };
      });
      await expect(
        harness.persistence.transaction((tx) =>
          setPromotionBenefit(tx, {
            actor,
            promotionId: draft.id,
            expectedPromotionRevision: draft.revision,
            benefit: {
              ...emptyMoneyBenefit("complimentary_item"),
              complimentaryProductId: stagedOnly.productId,
              complimentaryVariantId: stagedOnly.variantId,
            },
          }),
        ),
      ).rejects.toMatchObject({ code: "PROMOTION_COMPLIMENTARY_INVALID" });

      const published = await seedActiveStandardVariant(
        harness.persistence,
        brandId,
        actor,
        "pub",
      );
      const accepted = await harness.persistence.transaction((tx) =>
        setPromotionBenefit(tx, {
          actor,
          promotionId: draft.id,
          expectedPromotionRevision: draft.revision,
          benefit: {
            ...emptyMoneyBenefit("complimentary_item"),
            complimentaryProductId: published.productId,
            complimentaryVariantId: published.variantId,
          },
        }),
      );
      expect(accepted.revision).toBeGreaterThan(draft.revision);

      await harness.persistence.transaction(async (tx) => {
        // Stage retirement on the product primary without republishing; effective
        // content remains customer-published until a later publication change.
        await retireProduct(tx, { actor, productId: published.productId });
      });
      // Staged retirement keeps effective publication until publish changes.
      const stillEffectiveDraft = await createReadyDraftPromotion(harness, {
        code: uniqueCode("ret"),
      });
      const retiredPrimaryAccepted = await harness.persistence.transaction((tx) =>
        setPromotionBenefit(tx, {
          actor,
          promotionId: stillEffectiveDraft.id,
          expectedPromotionRevision: stillEffectiveDraft.revision,
          benefit: {
            ...emptyMoneyBenefit("complimentary_item"),
            complimentaryProductId: published.productId,
            complimentaryVariantId: published.variantId,
          },
        }),
      );
      expect(retiredPrimaryAccepted.revision).toBeGreaterThan(stillEffectiveDraft.revision);

      const withStagedRequired = await seedActiveStandardVariant(
        harness.persistence,
        brandId,
        actor,
        "optreq",
      );
      await harness.persistence.transaction(async (tx) => {
        const group = await createModifierGroup(tx, {
          actor,
          brandId,
          code: uniqueCode("sr-g"),
          name: "Staged required",
        });
        const option = await createModifierOption(tx, {
          actor,
          brandId,
          code: uniqueCode("sr-o"),
          name: "One",
        });
        await addModifierOptionToGroup(tx, {
          actor,
          modifierGroupId: group.id,
          modifierOptionId: option.id,
          minQuantity: 1,
          maxQuantity: 1,
          defaultQuantity: 1,
        });
        // Binding created with required min but never activated/published.
        await applyModifierGroupToVariant(tx, {
          actor,
          variantId: withStagedRequired.variantId,
          modifierGroupId: group.id,
          minTotalQuantity: 1,
          maxTotalQuantity: 1,
        });
      });
      const stagedRequiredDraft = await createReadyDraftPromotion(harness, {
        code: uniqueCode("sr"),
      });
      const stagedRequiredOk = await harness.persistence.transaction((tx) =>
        setPromotionBenefit(tx, {
          actor,
          promotionId: stagedRequiredDraft.id,
          expectedPromotionRevision: stagedRequiredDraft.revision,
          benefit: {
            ...emptyMoneyBenefit("complimentary_item"),
            complimentaryProductId: withStagedRequired.productId,
            complimentaryVariantId: withStagedRequired.variantId,
          },
        }),
      );
      expect(stagedRequiredOk.revision).toBeGreaterThan(stagedRequiredDraft.revision);

      const otherTree = await harness.persistence.transaction((tx) => seedBrandTree(tx, "xf"));
      const otherAdmin = await createEligibleWorkforceUser(harness.persistence);
      await harness.persistence.transaction(async (tx) => {
        const membership = await createMembership(tx, {
          workforceUserId: otherAdmin.id,
          scope: { scopeType: "brand", brandId: otherTree.brand.id },
          status: "active",
        });
        await grantRole(tx, { membershipId: membership.id, roleKey: "brand_admin" });
      });
      const foreign = await seedActiveStandardVariant(
        harness.persistence,
        otherTree.brand.id,
        principalFor(otherAdmin.id),
        "xf",
      );
      const cross = await createReadyDraftPromotion(harness, { code: uniqueCode("xb") });
      await expect(
        harness.persistence.transaction((tx) =>
          setPromotionBenefit(tx, {
            actor,
            promotionId: cross.id,
            expectedPromotionRevision: cross.revision,
            benefit: {
              ...emptyMoneyBenefit("complimentary_item"),
              complimentaryProductId: foreign.productId,
              complimentaryVariantId: foreign.variantId,
            },
          }),
        ),
      ).rejects.toMatchObject({ code: "PROMOTION_COMPLIMENTARY_INVALID" });

      const mismatch = await createReadyDraftPromotion(harness, { code: uniqueCode("mm") });
      await expect(
        harness.persistence.transaction((tx) =>
          setPromotionBenefit(tx, {
            actor,
            promotionId: mismatch.id,
            expectedPromotionRevision: mismatch.revision,
            benefit: {
              ...emptyMoneyBenefit("complimentary_item"),
              complimentaryProductId: published.productId,
              complimentaryVariantId: withStagedRequired.variantId,
            },
          }),
        ),
      ).rejects.toMatchObject({ code: "PROMOTION_COMPLIMENTARY_INVALID" });

      await Promise.all(openHandles.map((handle) => handle.close()));
    });
  });

  it("authors BOGO, minimum quantity, scopes, and evaluates authored outcomes", async () => {
    await withIsolatedTestDatabase(adminConnectionInfo(), async (database) => {
      await applyMigrations(database.connectionString);
      const openHandles: Array<{ close(): Promise<void> }> = [];
      const harness = await seedPromotionsHarness(database.connectionString, openHandles);
      const actor = harness.brandAdminPrincipal;
      const brandId = harness.tree.brand.id;
      await enableAllScopeDelegation(harness);
      const catalog = await seedActiveStandardVariant(harness.persistence, brandId, actor, "bogo");

      const bogo = await createReadyDraftPromotion(harness, { code: uniqueCode("bg") });
      await expect(
        harness.persistence.transaction((tx) =>
          setPromotionBenefit(tx, {
            actor,
            promotionId: bogo.id,
            expectedPromotionRevision: bogo.revision,
            benefit: {
              ...emptyMoneyBenefit("buy_x_get_y"),
              buyQuantity: 0,
              getQuantity: 1,
              repeatable: false,
            },
          }),
        ),
      ).rejects.toMatchObject({ code: "PROMOTION_BENEFIT_INVALID" });
      let rev = (
        await harness.persistence.transaction((tx) =>
          setPromotionBenefit(tx, {
            actor,
            promotionId: bogo.id,
            expectedPromotionRevision: bogo.revision,
            benefit: {
              ...emptyMoneyBenefit("buy_x_get_y"),
              buyQuantity: 1,
              getQuantity: 1,
              repeatable: false,
              maximumRewardQuantity: null,
            },
          }),
        )
      ).revision;
      rev = (
        await harness.persistence.transaction((tx) =>
          setPromotionTargets(tx, {
            actor,
            promotionId: bogo.id,
            expectedPromotionRevision: rev,
            targetRole: "qualifier",
            targets: [
              {
                targetRole: "qualifier",
                targetType: "variant",
                productId: null,
                variantId: catalog.variantId,
                chargeDefinitionId: null,
              },
            ],
          }),
        )
      ).revision;
      rev = (
        await harness.persistence.transaction((tx) =>
          setPromotionTargets(tx, {
            actor,
            promotionId: bogo.id,
            expectedPromotionRevision: rev,
            targetRole: "benefit",
            targets: [
              {
                targetRole: "benefit",
                targetType: "variant",
                productId: null,
                variantId: catalog.variantId,
                chargeDefinitionId: null,
              },
            ],
          }),
        )
      ).revision;
      const withMinQty = await harness.persistence.transaction((tx) =>
        updatePromotionDraft(tx, {
          actor,
          promotionId: bogo.id,
          expectedPromotionRevision: rev,
          minimumItemQuantity: 2,
        }),
      );
      await expect(
        harness.persistence.transaction((tx) =>
          activatePromotion(tx, {
            actor,
            promotionId: bogo.id,
            expectedPromotionRevision: withMinQty.revision,
          }),
        ),
      ).rejects.toMatchObject({ code: "PROMOTION_BENEFIT_INVALID" });
      rev = (
        await harness.persistence.transaction((tx) =>
          updatePromotionDraft(tx, {
            actor,
            promotionId: bogo.id,
            expectedPromotionRevision: withMinQty.revision,
            minimumItemQuantity: null,
          }),
        )
      ).revision;
      rev = (
        await harness.persistence.transaction((tx) =>
          activatePromotion(tx, {
            actor,
            promotionId: bogo.id,
            expectedPromotionRevision: rev,
          }),
        )
      ).revision;
      const bogoInspect = await harness.persistence.withContext((ctx) =>
        inspectBrandPromotion(ctx, { actor, brandId, promotionId: bogo.id }),
      );
      expect(bogoInspect.benefit?.benefitType).toBe("buy_x_get_y");
      expect(bogoInspect.benefit?.buyQuantity).toBe(1);
      expect(bogoInspect.benefit?.getQuantity).toBe(1);
      expect(bogoInspect.benefit?.repeatable).toBe(false);
      const bogoDef = await harness.persistence.withContext(async (ctx) => {
        const rows = await ctx.db
          .select()
          .from(promotionsTable)
          .where(eq(promotionsTable.id, bogo.id))
          .limit(1);
        return hydratePromotionDefinition(ctx, rows[0]!);
      });
      const twoUnits: PrePromotionSnapshot = {
        components: [
          {
            componentId: "base",
            kind: "variant_base",
            lineId: "L1",
            lineSequence: 0,
            variantId: catalog.variantId,
            productId: catalog.productId,
            chargeDefinitionId: null,
            amountPaise: BigInt(200),
            taxCategoryId: "tax",
          },
        ],
        units: [
          {
            unitId: "u0",
            lineId: "L1",
            lineSequence: 0,
            unitIndex: 0,
            productId: catalog.productId,
            variantId: catalog.variantId,
            unitBasePaise: BigInt(100),
            modifierPaise: BigInt(0),
            bundleDeltaPaise: BigInt(0),
            taxCategoryId: "tax",
          },
          {
            unitId: "u1",
            lineId: "L1",
            lineSequence: 0,
            unitIndex: 1,
            productId: catalog.productId,
            variantId: catalog.variantId,
            unitBasePaise: BigInt(100),
            modifierPaise: BigInt(0),
            bundleDeltaPaise: BigInt(0),
            taxCategoryId: "tax",
          },
        ],
      };
      expect(calculateBenefit(bogoDef, twoUnits).nominalBenefitPaise).toBe(BigInt(100));

      const qtyDraft = await createReadyDraftPromotion(harness, { code: uniqueCode("qty") });
      let qtyRev = (
        await harness.persistence.transaction((tx) =>
          updatePromotionDraft(tx, {
            actor,
            promotionId: qtyDraft.id,
            expectedPromotionRevision: qtyDraft.revision,
            minimumItemQuantity: 3,
            minimumQualifyingAmountPaise: BigInt(5000),
          }),
        )
      ).revision;
      qtyRev = await retarget(harness, qtyDraft.id, qtyRev);
      qtyRev = (
        await harness.persistence.transaction((tx) =>
          activatePromotion(tx, {
            actor,
            promotionId: qtyDraft.id,
            expectedPromotionRevision: qtyRev,
          }),
        )
      ).revision;
      const qtyInspect = await harness.persistence.withContext((ctx) =>
        inspectBrandPromotion(ctx, { actor, brandId, promotionId: qtyDraft.id }),
      );
      expect(qtyInspect.promotion.minimumItemQuantity).toBe(3);
      expect(qtyInspect.promotion.minimumQualifyingAmountPaise).toBe("5000");
      const qtyDef = await harness.persistence.withContext(async (ctx) => {
        const rows = await ctx.db
          .select()
          .from(promotionsTable)
          .where(eq(promotionsTable.id, qtyDraft.id))
          .limit(1);
        return hydratePromotionDefinition(ctx, rows[0]!);
      });
      const unit = (id: string, index: number) => ({
        unitId: id,
        lineId: "L1",
        lineSequence: 0,
        unitIndex: index,
        productId: "p1",
        variantId: "v1",
        unitBasePaise: BigInt(4000),
        modifierPaise: BigInt(0),
        bundleDeltaPaise: BigInt(0),
        taxCategoryId: "tax",
      });
      const belowSnap: PrePromotionSnapshot = {
        components: [
          {
            componentId: "base",
            kind: "variant_base",
            lineId: "L1",
            lineSequence: 0,
            variantId: "v1",
            productId: "p1",
            chargeDefinitionId: null,
            amountPaise: BigInt(8000),
            taxCategoryId: "tax",
          },
        ],
        units: [unit("u0", 0), unit("u1", 1)],
      };
      const atSnap: PrePromotionSnapshot = {
        components: [
          {
            componentId: "base",
            kind: "variant_base",
            lineId: "L1",
            lineSequence: 0,
            variantId: "v1",
            productId: "p1",
            chargeDefinitionId: null,
            amountPaise: BigInt(12000),
            taxCategoryId: "tax",
          },
        ],
        units: [unit("u0", 0), unit("u1", 1), unit("u2", 2)],
      };
      const evalCtx = {
        at: new Date("2026-06-01T00:00:00Z"),
        brandId,
        territoryId: harness.tree.terrA.id,
        organizationId: harness.tree.orgA.id,
        outletId: harness.tree.outletA.id,
        salesChannel: "direct" as const,
      };
      expect(evaluateEligibility(qtyDef, belowSnap, evalCtx).eligible).toBe(false);
      expect(evaluateEligibility(qtyDef, belowSnap, evalCtx).reasonCode).toBe(
        "MINIMUM_QUANTITY_NOT_MET",
      );
      expect(evaluateEligibility(qtyDef, atSnap, evalCtx).eligible).toBe(true);

      for (const scope of [
        { scopeType: "brand" as const },
        {
          scopeType: "territory" as const,
          territoryId: harness.tree.terrA.id,
        },
        {
          scopeType: "organization" as const,
          organizationId: harness.tree.orgA.id,
        },
        {
          scopeType: "outlet" as const,
          outletId: harness.tree.outletA.id,
        },
      ]) {
        const scoped = await createReadyDraftPromotion(harness, {
          code: uniqueCode(scope.scopeType.slice(0, 3)),
          ...scope,
        });
        const activated = await harness.persistence.transaction((tx) =>
          activatePromotion(tx, {
            actor,
            promotionId: scoped.id,
            expectedPromotionRevision: scoped.revision,
          }),
        );
        const inspected = await harness.persistence.withContext((ctx) =>
          inspectBrandPromotion(ctx, { actor, brandId, promotionId: scoped.id }),
        );
        expect(inspected.promotion.scopeType).toBe(scope.scopeType);
        expect(activated.revision).toBeGreaterThan(scoped.revision);
        if (scope.scopeType === "territory") {
          expect(inspected.promotion.territoryId).toBe(harness.tree.terrA.id);
        }
        if (scope.scopeType === "organization") {
          expect(inspected.promotion.organizationId).toBe(harness.tree.orgA.id);
        }
        if (scope.scopeType === "outlet") {
          expect(inspected.promotion.outletId).toBe(harness.tree.outletA.id);
        }
      }

      await expect(
        harness.persistence.transaction((tx) =>
          createPromotionDraft(tx, {
            actor,
            brandId,
            code: uniqueCode("mix"),
            displayName: "Mixed scope",
            scopeType: "territory",
            territoryId: harness.tree.terrA.id,
            outletId: harness.tree.outletA.id,
            triggerType: "automatic",
            stackingPolicy: "exclusive",
            startsAt: new Date("2026-01-01T00:00:00Z"),
          }),
        ),
      ).rejects.toBeTruthy();

      const editorSrc = readFileSync(
        path.join(process.cwd(), "src/components/administration/commercial/PromotionsEditor.tsx"),
        "utf8",
      );
      expect(editorSrc).toMatch(/buy_x_get_y/);
      expect(editorSrc).toMatch(/CHARGE_DEFINITION_DELIVERY_ID/);
      expect(editorSrc).toMatch(/minimumItemQuantity/);
      expect(editorSrc).toMatch(/Promotion scope/);
      expect(editorSrc).toMatch(/territory/);
      expect(editorSrc).toMatch(/organization/);
      expect(editorSrc).toMatch(/outlet/);
      await Promise.all(openHandles.map((handle) => handle.close()));
    });
  });

  it("HTTP authoring covers accepted scopes and denies cross-scope writes", async () => {
    await withIsolatedTestDatabase(adminConnectionInfo(), async (database) => {
      await applyMigrations(database.connectionString);
      const openHandles: Array<{ close(): Promise<void> }> = [];
      const harness = await seedPromotionsHarness(database.connectionString, openHandles);
      await enableAllScopeDelegation(harness);
      const workforce = loadAuthFoundationConfig(
        {
          CUSTOMER_AUTH_SECRET: "t6-customer-auth-secret-32charsxxx",
          CUSTOMER_AUTH_BASE_URL: "http://localhost:3100",
          WORKFORCE_AUTH_SECRET: "t6-workforce-auth-secret-32charsx",
          WORKFORCE_AUTH_BASE_URL: "http://localhost:3200",
        },
        "test",
      ).workforce;
      const runtime = getWorkforceAuthRuntime({
        auth: workforce,
        persistence: applicationConfig(database.connectionString),
      });
      const auth = await runtime.getAuth();
      const adapter = ((await auth.$context) as {
        internalAdapter: { createSession: (id: string) => Promise<{ token: string }> };
      }).internalAdapter;
      const server = createServer((req, res) => {
        void routeOperationsRequest(
          req,
          res,
          {
            runtime,
            persistence: harness.persistence,
            trustedOrigin: workforce.baseURL.origin,
            stepUpSessionHashSecret: workforce.secret,
          },
          "t6-promotions-http-scope",
        );
      });
      await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
      const address = server.address();
      if (!address || typeof address === "string") throw new Error("no addr");
      const base = `http://127.0.0.1:${address.port}`;
      const session = await adapter.createSession(harness.brandAdmin.id);
      const cookie = (
        await serializeSignedCookie(
          WORKFORCE_AUTH_SESSION_COOKIE_NAME,
          session.token,
          workforce.secret,
        )
      ).split(";", 1)[0]!;

      async function createScoped(body: Record<string, unknown>) {
        const res = await fetch(`${base}/api/admin/v1/brands/${harness.tree.brand.id}/promotions`, {
          method: "POST",
          headers: {
            cookie,
            origin: workforce.baseURL.origin,
            "content-type": "application/json",
          },
          body: JSON.stringify(body),
        });
        const json = (await res.json()) as {
          ok: boolean;
          promotion?: { id: string; revision: string };
          code?: string;
        };
        return { res, json };
      }

      const brandCreate = await createScoped({
        code: uniqueCode("hb"),
        displayName: "HTTP brand",
        scopeType: "brand",
        triggerType: "automatic",
        startsAt: "2026-01-01T00:00:00.000Z",
      });
      expect(brandCreate.res.status).toBeLessThan(400);
      expect(brandCreate.json.ok).toBe(true);

      const terrCreate = await createScoped({
        code: uniqueCode("ht"),
        displayName: "HTTP territory",
        scopeType: "territory",
        territoryId: harness.tree.terrA.id,
        triggerType: "automatic",
        startsAt: "2026-01-01T00:00:00.000Z",
      });
      expect(terrCreate.json.ok).toBe(true);

      const orgCreate = await createScoped({
        code: uniqueCode("ho"),
        displayName: "HTTP organization",
        scopeType: "organization",
        organizationId: harness.tree.orgA.id,
        triggerType: "automatic",
        startsAt: "2026-01-01T00:00:00.000Z",
      });
      expect(orgCreate.json.ok).toBe(true);

      const outletCreate = await createScoped({
        code: uniqueCode("hl"),
        displayName: "HTTP outlet",
        scopeType: "outlet",
        outletId: harness.tree.outletA.id,
        triggerType: "automatic",
        startsAt: "2026-01-01T00:00:00.000Z",
      });
      expect(outletCreate.json.ok).toBe(true);

      const mixed = await createScoped({
        code: uniqueCode("hm"),
        displayName: "HTTP mixed",
        scopeType: "outlet",
        outletId: harness.tree.outletA.id,
        territoryId: harness.tree.terrA.id,
        triggerType: "automatic",
        startsAt: "2026-01-01T00:00:00.000Z",
      });
      expect(mixed.json.ok).toBe(false);

      const otherTree = await harness.persistence.transaction((tx) => seedBrandTree(tx, "hx"));
      const otherAdmin = await createEligibleWorkforceUser(harness.persistence);
      await harness.persistence.transaction(async (tx) => {
        const membership = await createMembership(tx, {
          workforceUserId: otherAdmin.id,
          scope: { scopeType: "brand", brandId: otherTree.brand.id },
          status: "active",
        });
        await grantRole(tx, { membershipId: membership.id, roleKey: "brand_admin" });
      });
      const otherSession = await adapter.createSession(otherAdmin.id);
      const otherCookie = (
        await serializeSignedCookie(
          WORKFORCE_AUTH_SESSION_COOKIE_NAME,
          otherSession.token,
          workforce.secret,
        )
      ).split(";", 1)[0]!;
      const denied = await fetch(
        `${base}/api/admin/v1/brands/${harness.tree.brand.id}/promotions`,
        {
          method: "POST",
          headers: {
            cookie: otherCookie,
            origin: workforce.baseURL.origin,
            "content-type": "application/json",
          },
          body: JSON.stringify({
            code: uniqueCode("hd"),
            displayName: "Denied",
            scopeType: "brand",
            triggerType: "automatic",
            startsAt: "2026-01-01T00:00:00.000Z",
          }),
        },
      );
      const deniedBody = (await denied.json()) as { ok: boolean };
      expect(deniedBody.ok).toBe(false);
      const deniedCodeProbe = await harness.persistence.withContext(async (ctx) => {
        const rows = await ctx.db.execute(
          sql`select count(*)::int as c from app.promotions where display_name = 'Denied'`,
        );
        return Number(rows.rows[0]?.c ?? 0);
      });
      expect(deniedCodeProbe).toBe(0);

      const draftForNulls = await createReadyDraftPromotion(harness, {
        code: uniqueCode("nl"),
      });
      const nullSave = await fetch(
        `${base}/api/admin/v1/brands/${harness.tree.brand.id}/promotions/${draftForNulls.id}/draft`,
        {
          method: "POST",
          headers: {
            cookie,
            origin: workforce.baseURL.origin,
            "content-type": "application/json",
          },
          body: JSON.stringify({
            expectedPromotionRevision: draftForNulls.revision.toString(10),
            displayName: "Nullables cleared",
            minimumItemQuantity: null,
            maximumRedemptions: null,
            maximumRedemptionsPerCustomer: null,
            minimumQualifyingAmountPaise: null,
          }),
        },
      );
      const nullBody = (await nullSave.json()) as { ok: boolean; revision?: string };
      expect(nullSave.status).toBeLessThan(400);
      expect(nullBody.ok).toBe(true);

      const badWaiver = await createReadyDraftPromotion(harness, { code: uniqueCode("bw") });
      let badRev = (
        await harness.persistence.transaction((tx) =>
          setPromotionBenefit(tx, {
            actor: harness.brandAdminPrincipal,
            promotionId: badWaiver.id,
            expectedPromotionRevision: badWaiver.revision,
            benefit: emptyMoneyBenefit("delivery_fee_waiver"),
          }),
        )
      ).revision;
      badRev = (
        await harness.persistence.transaction((tx) =>
          setPromotionTargets(tx, {
            actor: harness.brandAdminPrincipal,
            promotionId: badWaiver.id,
            expectedPromotionRevision: badRev,
            targetRole: "qualifier",
            targets: [{ targetRole: "qualifier", ...MERCH }],
          }),
        )
      ).revision;
      badRev = (
        await harness.persistence.transaction((tx) =>
          setPromotionTargets(tx, {
            actor: harness.brandAdminPrincipal,
            promotionId: badWaiver.id,
            expectedPromotionRevision: badRev,
            targetRole: "benefit",
            targets: [{ targetRole: "benefit", ...MERCH }],
          }),
        )
      ).revision;
      await expect(
        harness.persistence.transaction((tx) =>
          activatePromotion(tx, {
            actor: harness.brandAdminPrincipal,
            promotionId: badWaiver.id,
            expectedPromotionRevision: badRev,
          }),
        ),
      ).rejects.toMatchObject({
        code: "PROMOTION_BENEFIT_INVALID",
      });

      await new Promise<void>((resolve, reject) => {
        server.close((err) => (err ? reject(err) : resolve()));
      });
      await runtime.close();
      await Promise.all(openHandles.map((handle) => handle.close()));
    });
  });
});
