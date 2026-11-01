/**
 * Disposable IMP-036J M2 browser scenarios.
 * Runs only from the loopback E2E control. Not a production bootstrap.
 */
import { randomBytes } from "node:crypto";
import { pathToFileURL } from "node:url";

import { eq, sql } from "drizzle-orm";

import { catalogVariantsTable } from "../../src/platform/database/schema/catalog";
import { promotionsTable } from "../../src/platform/database/schema/promotions";
import { workforceAuthUsers } from "../../src/platform/database/schema/workforce-auth";
import type { WebConfig } from "../../src/platform/config";
import { getApplicationPersistence } from "../../src/server/persistence";
import type { Persistence, PersistenceTransactionContext } from "../../src/server/persistence/types";
import {
  activateCoupon,
  activatePromotion,
  createCouponDraft,
  createPromotionDraft,
  retirePromotion,
  setPromotionBenefit,
  setPromotionTargets,
} from "../../src/server/promotions";
import type { PromotionBenefitConfig } from "../../src/shared/promotions";
import { CHARGE_DEFINITION_DELIVERY_ID } from "../../src/shared/pricing/constants";
import { principalFor } from "../../tests/database/support/access-control-fixtures";

const MERCH = {
  targetType: "all_merchandise" as const,
  productId: null,
  variantId: null,
  chargeDefinitionId: null,
};
const DELIVERY = {
  targetType: "charge" as const,
  productId: null,
  variantId: null,
  chargeDefinitionId: CHARGE_DEFINITION_DELIVERY_ID,
};

export type M2ScenarioName =
  | "closed"
  | "below"
  | "met"
  | "keep"
  | "win"
  | "modes"
  | "failures"
  | "identity"
  | "basic"
  | "cap-global"
  | "cap-personal"
  | "gift";

const pools = new Map<string, { config: WebConfig; persistence: Persistence }>();

function persistenceFor(databaseUrl: string): Persistence {
  const existing = pools.get(databaseUrl);
  if (existing) return existing.persistence;
  const config: WebConfig = {
    environment: "test",
    processKind: "web",
    publicOrigin: "http://127.0.0.1:4178",
    logLevel: "warn",
    release: null,
    allowUnsafeAdapters: true,
    databaseSslMode: "disable",
    port: 4178,
    databaseUrl,
  };
  const persistence = getApplicationPersistence(config);
  pools.set(databaseUrl, { config, persistence });
  return persistence;
}

function moneyBenefit(type: PromotionBenefitConfig["benefitType"], fixed: bigint | null): PromotionBenefitConfig {
  return {
    benefitType: type,
    percentageBps: null,
    fixedAmountPaise: type === "fixed_amount_discount" ? fixed : null,
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

type DraftSpec = {
  key: string;
  displayName: string;
  triggerType: "automatic" | "coupon";
  stackingPolicy: "exclusive" | "combinable";
  benefit: PromotionBenefitConfig;
  benefitTarget: "merchandise" | "delivery";
  minimumQualifyingAmountPaise?: bigint | null;
  endsAt?: Date | null;
  eligibleFulfilmentModes?: Array<"DELIVERY" | "PICKUP"> | null;
  maximumRedemptions?: number | null;
  maximumRedemptionsPerCustomer?: number | null;
  couponCode?: string;
  complimentary?: { productId: string; variantId: string };
};

async function author(
  tx: PersistenceTransactionContext,
  actor: ReturnType<typeof principalFor>,
  brandId: string,
  spec: DraftSpec,
  code: string,
): Promise<void> {
  const created = await createPromotionDraft(tx, {
    actor,
    brandId,
    code,
    displayName: spec.displayName,
    scopeType: "brand",
    triggerType: spec.triggerType,
    stackingPolicy: spec.stackingPolicy,
    startsAt: new Date("2020-01-01T00:00:00Z"),
    endsAt: spec.endsAt ?? null,
    minimumQualifyingAmountPaise: spec.minimumQualifyingAmountPaise ?? null,
    eligibleFulfilmentModes: spec.eligibleFulfilmentModes ?? null,
    maximumRedemptions: spec.maximumRedemptions ?? null,
    maximumRedemptionsPerCustomer: spec.maximumRedemptionsPerCustomer ?? null,
  });
  let revision = created.revision;
  const benefit = spec.complimentary
    ? {
        ...moneyBenefit("complimentary_item", null),
        complimentaryProductId: spec.complimentary.productId,
        complimentaryVariantId: spec.complimentary.variantId,
      }
    : spec.benefit;
  revision = (
    await setPromotionBenefit(tx, {
      actor,
      promotionId: created.id,
      expectedPromotionRevision: revision,
      benefit,
    })
  ).revision;
  revision = (
    await setPromotionTargets(tx, {
      actor,
      promotionId: created.id,
      expectedPromotionRevision: revision,
      targetRole: "qualifier",
      targets: [{ targetRole: "qualifier", ...MERCH }],
    })
  ).revision;
  const benefitTarget = spec.benefitTarget === "delivery" ? DELIVERY : MERCH;
  revision = (
    await setPromotionTargets(tx, {
      actor,
      promotionId: created.id,
      expectedPromotionRevision: revision,
      targetRole: "benefit",
      targets: [{ targetRole: "benefit", ...benefitTarget }],
    })
  ).revision;
  await activatePromotion(tx, {
    actor,
    promotionId: created.id,
    expectedPromotionRevision: revision,
  });
  if (spec.couponCode) {
    const coupon = await createCouponDraft(tx, {
      actor,
      brandId,
      promotionId: created.id,
      origin: "manual",
      canonicalCode: spec.couponCode,
      startsAt: new Date("2020-01-01T00:00:00Z"),
      endsAt: spec.endsAt ?? null,
      maximumRedemptions: spec.maximumRedemptions ?? null,
      maximumRedemptionsPerCustomer: spec.maximumRedemptionsPerCustomer ?? null,
    });
    await activateCoupon(tx, {
      actor,
      brandId,
      couponId: coupon.id,
      expectedCouponRevision: coupon.revision,
    });
  }
}

function specsFor(
  scenario: M2ScenarioName,
  stamp: string,
  gift: { productId: string; variantId: string } | null,
): { specs: DraftSpec[]; coupons: Record<string, string> } {
  const keep = `K${stamp}`;
  const win = `W${stamp}`;
  const swap = `S${stamp}`;
  const basic = `B${stamp}`;
  const deliver = `D${stamp}`;
  const pickup = `P${stamp}`;
  const expired = `E${stamp}`;
  const identity = `I${stamp}`;
  const global = `G${stamp}`;
  const personal = `C${stamp}`;
  const yesterday = new Date(Date.now() - 86_400_000);
  const specs: Record<M2ScenarioName, DraftSpec[]> = {
    closed: [
      {
        key: "closed",
        displayName: "Closed window tea",
        triggerType: "automatic",
        stackingPolicy: "exclusive",
        benefit: moneyBenefit("fixed_amount_discount", BigInt(5_000)),
        benefitTarget: "merchandise",
        endsAt: yesterday,
      },
    ],
    below: [
      {
        key: "below",
        displayName: "High threshold offer",
        triggerType: "automatic",
        stackingPolicy: "exclusive",
        benefit: moneyBenefit("fixed_amount_discount", BigInt(1_000)),
        benefitTarget: "merchandise",
        minimumQualifyingAmountPaise: BigInt(5_000_000),
      },
    ],
    met: [
      {
        key: "met",
        displayName: "Low threshold offer",
        triggerType: "automatic",
        stackingPolicy: "exclusive",
        benefit: moneyBenefit("fixed_amount_discount", BigInt(1_000)),
        benefitTarget: "merchandise",
        minimumQualifyingAmountPaise: BigInt(100),
      },
    ],
    keep: [
      {
        key: "auto80",
        displayName: "Automatic eighty",
        triggerType: "automatic",
        stackingPolicy: "combinable",
        benefit: moneyBenefit("fixed_amount_discount", BigInt(8_000)),
        benefitTarget: "merchandise",
      },
      {
        key: "del40",
        displayName: "Delivery forty",
        triggerType: "automatic",
        stackingPolicy: "combinable",
        benefit: moneyBenefit("delivery_fee_waiver", null),
        benefitTarget: "delivery",
      },
      {
        key: "c90",
        displayName: "Exclusive ninety",
        triggerType: "coupon",
        stackingPolicy: "exclusive",
        benefit: moneyBenefit("fixed_amount_discount", BigInt(9_000)),
        benefitTarget: "merchandise",
        couponCode: keep,
      },
    ],
    win: [
      {
        key: "c90b",
        displayName: "Coupon ninety",
        triggerType: "coupon",
        stackingPolicy: "combinable",
        benefit: moneyBenefit("fixed_amount_discount", BigInt(9_000)),
        benefitTarget: "merchandise",
        couponCode: win,
      },
      {
        key: "del20",
        displayName: "Delivery twenty",
        triggerType: "automatic",
        stackingPolicy: "combinable",
        benefit: moneyBenefit("delivery_fee_waiver", null),
        benefitTarget: "delivery",
      },
      {
        key: "x100",
        displayName: "Exclusive hundred",
        triggerType: "automatic",
        stackingPolicy: "exclusive",
        benefit: moneyBenefit("fixed_amount_discount", BigInt(10_000)),
        benefitTarget: "merchandise",
      },
    ],
    modes: [
      {
        key: "delonly",
        displayName: "Delivery only offer",
        triggerType: "automatic",
        stackingPolicy: "exclusive",
        benefit: moneyBenefit("fixed_amount_discount", BigInt(1_500)),
        benefitTarget: "merchandise",
        eligibleFulfilmentModes: ["DELIVERY"],
      },
      {
        key: "pickonly",
        displayName: "Pickup only offer",
        triggerType: "automatic",
        stackingPolicy: "exclusive",
        benefit: moneyBenefit("fixed_amount_discount", BigInt(1_200)),
        benefitTarget: "merchandise",
        eligibleFulfilmentModes: ["PICKUP"],
      },
      {
        key: "cdel",
        displayName: "Delivery coupon",
        triggerType: "coupon",
        stackingPolicy: "combinable",
        benefit: moneyBenefit("fixed_amount_discount", BigInt(1_100)),
        benefitTarget: "merchandise",
        eligibleFulfilmentModes: ["DELIVERY"],
        couponCode: deliver,
      },
      {
        key: "cpick",
        displayName: "Pickup coupon",
        triggerType: "coupon",
        stackingPolicy: "combinable",
        benefit: moneyBenefit("fixed_amount_discount", BigInt(1_100)),
        benefitTarget: "merchandise",
        eligibleFulfilmentModes: ["PICKUP"],
        couponCode: pickup,
      },
    ],
    failures: [
      {
        key: "expired",
        displayName: "Expired coupon offer",
        triggerType: "coupon",
        stackingPolicy: "exclusive",
        benefit: moneyBenefit("fixed_amount_discount", BigInt(1_000)),
        benefitTarget: "merchandise",
        endsAt: yesterday,
        couponCode: expired,
      },
    ],
    identity: [
      {
        key: "identity",
        displayName: "Identity coupon",
        triggerType: "coupon",
        stackingPolicy: "exclusive",
        benefit: moneyBenefit("fixed_amount_discount", BigInt(1_000)),
        benefitTarget: "merchandise",
        maximumRedemptionsPerCustomer: 1,
        couponCode: identity,
      },
    ],
    basic: [
      {
        key: "basic",
        displayName: "Basic coupon",
        triggerType: "coupon",
        stackingPolicy: "exclusive",
        benefit: moneyBenefit("fixed_amount_discount", BigInt(1_000)),
        benefitTarget: "merchandise",
        couponCode: basic,
      },
      {
        key: "swap",
        displayName: "Swap coupon",
        triggerType: "coupon",
        stackingPolicy: "exclusive",
        benefit: moneyBenefit("fixed_amount_discount", BigInt(2_000)),
        benefitTarget: "merchandise",
        couponCode: swap,
      },
    ],
    "cap-global": [
      {
        key: "global",
        displayName: "Global cap coupon",
        triggerType: "coupon",
        stackingPolicy: "exclusive",
        benefit: moneyBenefit("fixed_amount_discount", BigInt(1_000)),
        benefitTarget: "merchandise",
        maximumRedemptions: 1,
        couponCode: global,
      },
    ],
    "cap-personal": [
      {
        key: "personal",
        displayName: "Personal cap coupon",
        triggerType: "coupon",
        stackingPolicy: "exclusive",
        benefit: moneyBenefit("fixed_amount_discount", BigInt(1_000)),
        benefitTarget: "merchandise",
        maximumRedemptionsPerCustomer: 1,
        couponCode: personal,
      },
    ],
    gift: gift
      ? [
          {
            key: "gift",
            displayName: "Included tea",
            triggerType: "automatic",
            stackingPolicy: "exclusive",
            benefit: moneyBenefit("complimentary_item", null),
            benefitTarget: "merchandise",
            complimentary: gift,
          },
        ]
      : [],
  };
  const chosen = specs[scenario];
  const coupons: Record<string, string> = {};
  for (const spec of chosen) {
    if (spec.couponCode) coupons[spec.key] = spec.couponCode;
  }
  return { specs: chosen, coupons };
}

export async function armM2Scenario(
  databaseUrl: string,
  scenario: string,
): Promise<Record<string, unknown>> {
  const allowed: readonly M2ScenarioName[] = [
    "closed",
    "below",
    "met",
    "keep",
    "win",
    "modes",
    "failures",
    "identity",
    "basic",
    "cap-global",
    "cap-personal",
    "gift",
  ];
  if (!allowed.includes(scenario as M2ScenarioName)) {
    return { ok: false, mutated: 0, reason: "UNKNOWN_SCENARIO" };
  }
  const persistence = persistenceFor(databaseUrl);
  const stamp = randomBytes(3).toString("hex").toUpperCase();
  try {
    const deliveryPaise = scenario === "win" ? 2000 : 4000;
    await persistence.withContext(async (ctx) => {
      await ctx.db.execute(sql`update app.price_book_variant_prices set amount_paise = 100000`);
      await ctx.db.execute(sql`
        update app.price_book_charge_prices
        set amount_paise = ${deliveryPaise}
        where charge_definition_id = ${CHARGE_DEFINITION_DELIVERY_ID}::uuid
      `);
    });
    const result = await persistence.transaction(async (tx) => {
      const actorRow = await tx.db.select({ id: workforceAuthUsers.id }).from(workforceAuthUsers).limit(1);
      const userId = actorRow[0]?.id;
      if (!userId) throw new Error("M2 scenario seed has no workforce actor");
      const actor = principalFor(userId);
      const brandRow = await tx.db.execute(sql`
        select brand_id::text as brand_id from app.promotions where code = 'e2e-coupon' limit 1
      `);
      const brandId = brandRow.rows[0]?.brand_id as string | undefined;
      if (!brandId) throw new Error("M2 scenario seed has no brand");
      let gift: { productId: string; variantId: string } | null = null;
      if (scenario === "gift") {
        const variant = await tx.db
          .select({ id: catalogVariantsTable.id, productId: catalogVariantsTable.productId })
          .from(catalogVariantsTable)
          .where(eq(catalogVariantsTable.brandId, brandId))
          .limit(1);
        const row = variant[0];
        if (!row) throw new Error("M2 gift scenario has no variant");
        gift = { productId: row.productId, variantId: row.id };
      }
      const { specs, coupons } = specsFor(scenario as M2ScenarioName, stamp, gift);
      if (specs.length === 0) throw new Error("M2 scenario produced no promotions");
      const active = await tx.db
        .select({ id: promotionsTable.id, revision: promotionsTable.revision })
        .from(promotionsTable)
        .where(eq(promotionsTable.status, "active"));
      for (const row of active) {
        await retirePromotion(tx, {
          actor,
          promotionId: row.id,
          expectedPromotionRevision: row.revision,
        });
      }
      for (const spec of specs) {
        const code = `m2${stamp.toLowerCase()}${spec.key}`.slice(0, 64);
        await author(tx, actor, brandId, spec, code);
      }
      return { coupons, giftVariantId: gift?.variantId ?? null };
    });
    return { ok: true, mutated: 1, scenario, ...result };
  } catch (error) {
    const message = error instanceof Error ? error.message : "M2_SCENARIO_FAILED";
    return {
      ok: false,
      mutated: 0,
      reason: "M2_SCENARIO_FAILED",
      message: message.replace(/postgres(?:ql)?:\/\/\S+/gi, "[redacted]").slice(0, 300),
    };
  }
}

const invokedDirectly =
  process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href;
if (invokedDirectly) {
  const scenario = process.argv[2] ?? "";
  const databaseUrl = process.env.M2_DATABASE_URL ?? "";
  armM2Scenario(databaseUrl, scenario)
    .then((result) => {
      process.stdout.write(`${JSON.stringify(result)}\n`);
      process.exit(result.ok === true ? 0 : 1);
    })
    .catch((error: unknown) => {
      const message = error instanceof Error ? error.message : "M2_SCENARIO_FAILED";
      process.stdout.write(
        `${JSON.stringify({
          ok: false,
          mutated: 0,
          reason: "M2_SCENARIO_FAILED",
          message: message.replace(/postgres(?:ql)?:\/\/\S+/gi, "[redacted]").slice(0, 300),
        })}\n`,
      );
      process.exit(1);
    });
}
