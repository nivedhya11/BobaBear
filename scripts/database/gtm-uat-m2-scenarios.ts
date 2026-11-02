/**
 * Disposable IMP-036J M2 browser scenarios.
 * Runs only from the loopback E2E control. Not a production bootstrap.
 */
import { randomBytes } from "node:crypto";
import { pathToFileURL } from "node:url";

import { eq, sql } from "drizzle-orm";

import { promotionsTable } from "../../src/platform/database/schema/promotions";
import { workforceAuthUsers } from "../../src/platform/database/schema/workforce-auth";
import type { WebConfig } from "../../src/platform/config";
import { getApplicationPersistence } from "../../src/server/persistence";
import type { Persistence, PersistenceTransactionContext } from "../../src/server/persistence/types";
import { loadRedemptionUsage } from "../../src/server/promotions/load-for-evaluation";
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
  | "gift"
  | "gift-delivery"
  | "standing-zero"
  | "returning"
  | "equal-kept"
  | "equal-selected"
  | "guest-keep";

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
  priority?: number;
  endsAt?: Date | null;
  eligibleFulfilmentModes?: Array<"DELIVERY" | "PICKUP"> | null;
  firstOrderOnly?: boolean;
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
    priority: spec.priority,
    startsAt: new Date("2020-01-01T00:00:00Z"),
    endsAt: spec.endsAt ?? null,
    minimumQualifyingAmountPaise: spec.minimumQualifyingAmountPaise ?? null,
    eligibleFulfilmentModes: spec.eligibleFulfilmentModes ?? null,
    firstOrderOnly: spec.firstOrderOnly === true,
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
  gift: { productId: string; variantId: string; productName: string; variantName: string } | null,
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
        minimumQualifyingAmountPaise: BigInt(150_000),
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
    "guest-keep": [
      {
        key: "gauto",
        displayName: "Better automatic",
        triggerType: "automatic",
        stackingPolicy: "exclusive",
        benefit: moneyBenefit("fixed_amount_discount", BigInt(8_000)),
        benefitTarget: "merchandise",
      },
      {
        key: "gkeep",
        displayName: "Worse guest coupon",
        triggerType: "coupon",
        stackingPolicy: "exclusive",
        benefit: moneyBenefit("fixed_amount_discount", BigInt(1_000)),
        benefitTarget: "merchandise",
        couponCode: `H${stamp}`,
      },
    ],
    "equal-kept": [
      {
        key: "eqauto",
        displayName: "Equal automatic",
        triggerType: "automatic",
        stackingPolicy: "exclusive",
        priority: 10,
        benefit: moneyBenefit("fixed_amount_discount", BigInt(1_000)),
        benefitTarget: "merchandise",
      },
      {
        key: "eqkeep",
        displayName: "Equal coupon kept",
        triggerType: "coupon",
        stackingPolicy: "exclusive",
        priority: 0,
        benefit: moneyBenefit("fixed_amount_discount", BigInt(1_000)),
        benefitTarget: "merchandise",
        couponCode: `Q${stamp}`,
      },
    ],
    "equal-selected": [
      {
        key: "eqauto2",
        displayName: "Equal automatic lower",
        triggerType: "automatic",
        stackingPolicy: "exclusive",
        priority: 0,
        benefit: moneyBenefit("fixed_amount_discount", BigInt(1_000)),
        benefitTarget: "merchandise",
      },
      {
        key: "eqsel",
        displayName: "Equal coupon selected",
        triggerType: "coupon",
        stackingPolicy: "exclusive",
        priority: 10,
        benefit: moneyBenefit("fixed_amount_discount", BigInt(1_000)),
        benefitTarget: "merchandise",
        couponCode: `R${stamp}`,
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
    "gift-delivery": gift
      ? [
          {
            key: "giftdel",
            displayName: "Included with delivery",
            triggerType: "automatic",
            stackingPolicy: "combinable",
            benefit: moneyBenefit("complimentary_item", null),
            benefitTarget: "merchandise",
            complimentary: gift,
          },
          {
            key: "giftdelivery",
            displayName: "Gift delivery saving",
            triggerType: "automatic",
            stackingPolicy: "combinable",
            benefit: moneyBenefit("delivery_fee_waiver", null),
            benefitTarget: "delivery",
          },
        ]
      : [],
    "standing-zero": [
      {
        key: "zeroorder",
        displayName: "Standing zero order saving",
        triggerType: "automatic",
        stackingPolicy: "combinable",
        benefit: moneyBenefit("fixed_amount_discount", BigInt(8_000)),
        benefitTarget: "merchandise",
      },
      {
        key: "zerodelivery",
        displayName: "Standing zero waiver",
        triggerType: "automatic",
        stackingPolicy: "combinable",
        benefit: moneyBenefit("delivery_fee_waiver", null),
        benefitTarget: "delivery",
      },
    ],
    returning: [
      {
        key: "firstorder",
        displayName: "First order tea",
        triggerType: "automatic",
        stackingPolicy: "exclusive",
        benefit: moneyBenefit("fixed_amount_discount", BigInt(1_500)),
        benefitTarget: "merchandise",
        firstOrderOnly: true,
      },
    ],
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
    "gift-delivery",
    "standing-zero",
    "returning",
    "equal-kept",
    "equal-selected",
    "guest-keep",
  ];
  if (!allowed.includes(scenario as M2ScenarioName)) {
    return { ok: false, mutated: 0, reason: "UNKNOWN_SCENARIO" };
  }
  const persistence = persistenceFor(databaseUrl);
  const stamp = randomBytes(3).toString("hex").toUpperCase();
  try {
    const deliveryPaise = scenario === "win" ? 2000 : scenario === "standing-zero" ? 0 : 4000;
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
      let gift: { productId: string; variantId: string; productName: string; variantName: string } | null = null;
      if (scenario === "gift" || scenario === "gift-delivery") {
        const variant = await tx.db.execute(sql`
          select v.id::text as variant_id,
                 v.product_id::text as product_id,
                 p.name as product_name,
                 v.name as variant_name
          from app.catalog_variants v
          join app.catalog_products p on p.id = v.product_id
          where v.brand_id = ${brandId}::uuid
            and v.lifecycle_status = 'active'
            and p.lifecycle_status = 'active'
          order by p.name desc, v.id desc
          limit 1
        `);
        const row = variant.rows[0] as
          | { variant_id: string; product_id: string; product_name: string; variant_name: string }
          | undefined;
        if (!row) throw new Error("M2 gift scenario has no variant");
        await tx.db.execute(sql`
          delete from app.outlet_variant_availability
          where variant_id = ${row.variant_id}::uuid
        `);
        gift = {
          productId: row.product_id,
          variantId: row.variant_id,
          productName: row.product_name,
          variantName: row.variant_name,
        };
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
      return {
        coupons,
        giftVariantId: gift?.variantId ?? null,
        giftProductId: gift?.productId ?? null,
        giftProductName: gift?.productName ?? null,
        giftVariantName: gift?.variantName ?? null,
      };
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

/**
 * Disposable proof that quote-time usage matches Payment capacity:
 * RESERVED and CONSUMED count, RELEASED does not, and the totals are
 * promotion-scoped. Does not change payment authority.
 */
export async function seedCapUsage(
  databaseUrl: string,
  couponCode: string,
  phone: string,
): Promise<Record<string, unknown>> {
  if (!/^[A-Z0-9]{1,32}$/.test(couponCode)) {
    return { ok: false, mutated: 0, reason: "BAD_CODE" };
  }
  const digits = phone.replace(/\D/g, "");
  if (!/^[6-9]\d{9}$/.test(digits)) {
    return { ok: false, mutated: 0, reason: "BAD_PHONE" };
  }
  const e164 = `+91${digits}`;
  const persistence = persistenceFor(databaseUrl);
  const now = new Date();
  try {
    return await persistence.transaction(async (tx) => {
      const customer = await tx.db.execute(sql`
        select id
        from app.customer_auth_users
        where phone_number = ${e164} or phone_number = ${digits}
        limit 1
      `);
      const customerId = customer.rows[0]?.id as string | undefined;
      if (!customerId) return { ok: false, mutated: 0, reason: "CUSTOMER_NOT_FOUND" };
      const snapshot = await tx.db.execute(sql`
        select s.id::text as snapshot_id, s.checkout_id::text as checkout_id
        from app.checkout_snapshots s
        join app.checkouts c on c.id = s.checkout_id
        where c.customer_auth_user_id = ${customerId}
        order by s.created_at desc
        limit 1
      `);
      const snapshotId = snapshot.rows[0]?.snapshot_id as string | undefined;
      const checkoutId = snapshot.rows[0]?.checkout_id as string | undefined;
      if (!snapshotId || !checkoutId) {
        return { ok: false, mutated: 0, reason: "SNAPSHOT_NOT_FOUND" };
      }
      const coupon = await tx.db.execute(sql`
        select promotion_id::text as promotion_id
        from app.promotion_coupons
        where canonical_code = ${couponCode}
        limit 1
      `);
      const promotionId = coupon.rows[0]?.promotion_id as string | undefined;
      if (!promotionId) return { ok: false, mutated: 0, reason: "COUPON_NOT_FOUND" };

      const before = await loadRedemptionUsage(tx, promotionId, customerId);
      // Claims hang off a cancelled checkout so the live Review snapshot stays unpaid.
      const shadowCheckout = await tx.db.execute(sql`
        insert into app.checkouts (
          id, customer_auth_user_id, brand_id, cart_id, source_cart_revision, revision,
          status, fulfilment_mode, fulfilment_timing, expires_at, active_snapshot_id,
          created_at, updated_at
        )
        select
          gen_random_uuid(), customer_auth_user_id, brand_id, cart_id,
          source_cart_revision, revision, 'CANCELLED', fulfilment_mode, fulfilment_timing,
          expires_at, null, created_at, updated_at
        from app.checkouts
        where id = ${checkoutId}::uuid
        returning id::text as id
      `);
      const shadowCheckoutId = shadowCheckout.rows[0]?.id as string | undefined;
      if (!shadowCheckoutId) return { ok: false, mutated: 0, reason: "SHADOW_CHECKOUT_FAILED" };
      const shadowSnapshot = await tx.db.execute(sql`
        insert into app.checkout_snapshots
        select (jsonb_populate_record(
          null::app.checkout_snapshots,
          to_jsonb(s) || jsonb_build_object(
            'id', gen_random_uuid(),
            'checkout_id', ${shadowCheckoutId}::uuid
          )
        )).*
        from app.checkout_snapshots s
        where s.id = ${snapshotId}::uuid
        returning id::text as id
      `);
      const claimSnapshotId = shadowSnapshot.rows[0]?.id as string | undefined;
      if (!claimSnapshotId) return { ok: false, mutated: 0, reason: "SHADOW_SNAPSHOT_FAILED" };
      const inserted = await tx.db.execute(sql`
        insert into app.payments (
          id, checkout_id, checkout_snapshot_id, status, created_at, updated_at,
          succeeded_at, cancelled_at, expired_at, superseded_at
        ) values (
          gen_random_uuid(), ${shadowCheckoutId}::uuid, ${claimSnapshotId}::uuid, 'CANCELLED',
          ${now}, ${now}, null, ${now}, null, null
        )
        returning id::text as id
      `);
      const paymentId = inserted.rows[0]?.id as string;
      const ordinalRow = await tx.db.execute(sql`
        select coalesce(max(attempt_ordinal), 0)::text as max_ordinal
        from app.payment_attempts
        where payment_id = ${paymentId}::uuid
      `);
      let ordinal = BigInt(String(ordinalRow.rows[0]?.max_ordinal ?? "0"));
      const stamp = randomBytes(4).toString("hex");
      const reservedAttempt = await tx.db.execute(sql`
        insert into app.payment_attempts (
          id, payment_id, attempt_ordinal, provider, method_intent,
          provider_execution_identity, status, created_at, updated_at,
          pending_at, indeterminate_at, succeeded_at, failed_at, cancelled_at
        ) values (
          gen_random_uuid(), ${paymentId}::uuid, ${ordinal + BigInt(1)}, 'e2e', 'upi',
          ${`e2e-reserved-${stamp}`}, 'CREATED', ${now}, ${now},
          null, null, null, null, null
        )
        returning id::text as id
      `);
      ordinal += BigInt(1);
      const releasedAttempt = await tx.db.execute(sql`
        insert into app.payment_attempts (
          id, payment_id, attempt_ordinal, provider, method_intent,
          provider_execution_identity, status, created_at, updated_at,
          pending_at, indeterminate_at, succeeded_at, failed_at, cancelled_at
        ) values (
          gen_random_uuid(), ${paymentId}::uuid, ${ordinal + BigInt(1)}, 'e2e', 'upi',
          ${`e2e-released-${stamp}`}, 'FAILED', ${now}, ${now},
          null, null, null, ${now}, null
        )
        returning id::text as id
      `);
      const reservedAttemptId = reservedAttempt.rows[0]?.id as string;
      const releasedAttemptId = releasedAttempt.rows[0]?.id as string;
      await tx.db.execute(sql`
        insert into app.promotion_redemption_claims (
          id, promotion_id, checkout_snapshot_id, payment_id, payment_attempt_id,
          redemption_units, status, created_at, consumed_at, released_at
        ) values (
          gen_random_uuid(), ${promotionId}::uuid, ${claimSnapshotId}::uuid,
          ${paymentId}::uuid, ${reservedAttemptId}::uuid,
          1, 'RESERVED', ${now}, null, null
        )
      `);
      await tx.db.execute(sql`
        insert into app.promotion_redemption_claims (
          id, promotion_id, checkout_snapshot_id, payment_id, payment_attempt_id,
          redemption_units, status, created_at, consumed_at, released_at
        ) values (
          gen_random_uuid(), ${promotionId}::uuid, ${claimSnapshotId}::uuid,
          ${paymentId}::uuid, ${releasedAttemptId}::uuid,
          1, 'RELEASED', ${now}, null, ${now}
        )
      `);
      await tx.db.execute(sql`
        insert into app.promotion_redemption_claims (
          id, promotion_id, checkout_snapshot_id, payment_id, payment_attempt_id,
          redemption_units, status, created_at, consumed_at, released_at
        ) values (
          gen_random_uuid(), ${promotionId}::uuid, ${claimSnapshotId}::uuid,
          null, null, 1, 'CONSUMED', ${now}, ${now}, null
        )
      `);
      const after = await loadRedemptionUsage(tx, promotionId, customerId);
      const counted = after.globalUnits;
      const releasedExcluded = counted === before.globalUnits + BigInt(2);
      return {
        ok: true,
        mutated: 1,
        beforeGlobalUnits: before.globalUnits.toString(),
        beforePersonalUnits: before.personalUnits?.toString() ?? null,
        globalUnits: after.globalUnits.toString(),
        personalUnits: after.personalUnits?.toString() ?? null,
        reservedUnits: "1",
        consumedUnits: "1",
        releasedUnits: "1",
        countedUnits: counted.toString(),
        releasedExcluded,
      };
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "CAP_SEED_FAILED";
    return {
      ok: false,
      mutated: 0,
      reason: "CAP_SEED_FAILED",
      message: message.replace(/postgres(?:ql)?:\/\/\S+/gi, "[redacted]").slice(0, 300),
    };
  }
}

/**
 * Makes one complimentary variant ineligible at every outlet of its brand.
 * The customer's own cart variant is left alone when the caller passes a
 * different variant id.
 */
export async function markGiftVariantUnavailable(
  databaseUrl: string,
  variantId: string,
): Promise<Record<string, unknown>> {
  if (!/^[0-9a-f-]{36}$/i.test(variantId)) {
    return { ok: false, mutated: 0, reason: "BAD_VARIANT" };
  }
  const persistence = persistenceFor(databaseUrl);
  try {
    const mutated = await persistence.transaction(async (tx) => {
      const actorRow = await tx.db.select({ id: workforceAuthUsers.id }).from(workforceAuthUsers).limit(1);
      const userId = actorRow[0]?.id;
      if (!userId) throw new Error("M2 gift unavailability has no workforce actor");
      const written = await tx.db.execute(sql`
        insert into app.outlet_variant_availability (
          id, brand_id, organization_id, territory_id, outlet_id, variant_id,
          state, unavailable_until, reason_code, note, updated_by_workforce_user_id,
          created_at, updated_at
        )
        select gen_random_uuid(), o.brand_id, o.organization_id, o.territory_id, o.id,
               ${variantId}::uuid, 'temporarily_unavailable', null, 'e2e',
               'gift unavailable before pay', ${userId}, now(), now()
        from app.outlets o
        join app.catalog_variants v on v.id = ${variantId}::uuid and v.brand_id = o.brand_id
        on conflict (outlet_id, variant_id) do update
          set state = 'temporarily_unavailable',
              unavailable_until = null,
              updated_at = now(),
              updated_by_workforce_user_id = excluded.updated_by_workforce_user_id
        returning id
      `);
      return written.rows.length;
    });
    if (mutated < 1) return { ok: false, mutated: 0, reason: "GIFT_OUTLET_NOT_FOUND" };
    return { ok: true, mutated, variantId };
  } catch (error) {
    const message = error instanceof Error ? error.message : "GIFT_UNAVAILABLE_FAILED";
    return {
      ok: false,
      mutated: 0,
      reason: "GIFT_UNAVAILABLE_FAILED",
      message: message.replace(/postgres(?:ql)?:\/\/\S+/gi, "[redacted]").slice(0, 300),
    };
  }
}

const invokedDirectly =
  process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href;
if (invokedDirectly) {
  const command = process.argv[2] ?? "";
  const databaseUrl = process.env.M2_DATABASE_URL ?? "";
  const pending =
    command === "seed-cap"
      ? seedCapUsage(databaseUrl, process.argv[3] ?? "", process.argv[4] ?? "")
      : command === "mark-gift"
        ? markGiftVariantUnavailable(databaseUrl, process.argv[3] ?? "")
        : armM2Scenario(databaseUrl, command);
  pending
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
