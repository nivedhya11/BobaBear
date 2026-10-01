/**
 * IMP-036J tranche 1 commercial persistence (0047).
 * Real Testcontainers PostgreSQL only. No runtime writers.
 */
import { createHash, randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, inject, it } from "vitest";

import { MIGRATIONS_SCHEMA, MIGRATIONS_TABLE } from "../../src/platform/database";
import {
  applyMigrations,
  withIsolatedTestDatabase,
  withTestDatabaseClient,
} from "./support/test-database";

function adminConnectionInfo() {
  return {
    connectionString: inject("bobaBearTestAdminConnectionString"),
    host: inject("bobaBearTestAdminHost"),
    port: inject("bobaBearTestAdminPort"),
  };
}

type JournalEntry = Readonly<{
  idx: number;
  tag: string;
}>;

const TRANCHE_1_IDX = 47;
const TRANCHE_1_TAG = "0047_imp036j_tranche1_commercial_persistence";
const PRE_TRANCHE_IDX = 46;

function loadJournalEntries(): readonly JournalEntry[] {
  const journal = JSON.parse(
    readFileSync(path.join(process.cwd(), "drizzle/meta/_journal.json"), "utf8"),
  ) as { entries: JournalEntry[] };
  return journal.entries;
}

async function applySqlMigrationFile(
  connectionString: string,
  tag: string,
): Promise<void> {
  const sqlPath = path.join(process.cwd(), "drizzle", `${tag}.sql`);
  const raw = readFileSync(sqlPath, "utf8");
  const statements = raw
    .split(/-->\s*statement-breakpoint/)
    .map((statement) => statement.trim())
    .filter((statement) => statement.length > 0);

  await withTestDatabaseClient(connectionString, async (client) => {
    for (const statement of statements) {
      await client.pool.query(statement);
    }
    const hash = createHash("sha256").update(raw).digest("hex");
    await client.pool.query(
      `CREATE SCHEMA IF NOT EXISTS ${MIGRATIONS_SCHEMA}`,
    );
    await client.pool.query(`
      CREATE TABLE IF NOT EXISTS ${MIGRATIONS_SCHEMA}.${MIGRATIONS_TABLE} (
        id SERIAL PRIMARY KEY,
        hash text NOT NULL,
        created_at bigint
      )
    `);
    await client.pool.query(
      `INSERT INTO ${MIGRATIONS_SCHEMA}.${MIGRATIONS_TABLE} (hash, created_at) VALUES ($1, $2)`,
      [hash, Date.now()],
    );
  });
}

async function applyMigrationsThrough(
  connectionString: string,
  throughIdx: number,
): Promise<void> {
  const entries = loadJournalEntries().filter((entry) => entry.idx <= throughIdx);
  for (const entry of entries) {
    await applySqlMigrationFile(connectionString, entry.tag);
  }
}

async function expectCheckViolation(
  connectionString: string,
  sql: string,
  params: readonly unknown[] = [],
): Promise<void> {
  await expect(
    withTestDatabaseClient(connectionString, (client) => client.pool.query(sql, [...params])),
  ).rejects.toMatchObject({ code: "23514" });
}

async function expectUniqueViolation(
  connectionString: string,
  sql: string,
  params: readonly unknown[] = [],
): Promise<void> {
  await expect(
    withTestDatabaseClient(connectionString, (client) => client.pool.query(sql, [...params])),
  ).rejects.toMatchObject({ code: "23505" });
}

type Graph = Readonly<{
  brandId: string;
  customerId: string;
  checkoutId: string;
  snapshotId: string;
  productId: string;
  variantId: string;
  cartLineId: string;
}>;

async function seedGraph(connectionString: string, tag: string): Promise<Graph> {
  const brandId = randomUUID();
  const orgId = randomUUID();
  const territoryId = randomUUID();
  const legalEntityId = randomUUID();
  const outletId = randomUUID();
  const cartId = randomUUID();
  const checkoutId = randomUUID();
  const snapshotId = randomUUID();
  const productId = randomUUID();
  const variantId = randomUUID();
  const cartLineId = randomUUID();
  const customerId = `mig-036j-${tag}`;
  const phoneTail = tag.replace(/\D/g, "").slice(0, 8).padEnd(8, "0");

  await withTestDatabaseClient(connectionString, async (client) => {
    await client.pool.query(
      `INSERT INTO app.brands (id, code, name, status, created_at, updated_at)
       VALUES ($1::uuid, $2, $3, 'active', now(), now())`,
      [brandId, `b-${tag}`, `Brand ${tag}`],
    );
    await client.pool.query(
      `INSERT INTO app.organizations (id, brand_id, code, name, status, created_at, updated_at)
       VALUES ($1::uuid, $2::uuid, $3, $4, 'active', now(), now())`,
      [orgId, brandId, `o-${tag}`, `Org ${tag}`],
    );
    await client.pool.query(
      `INSERT INTO app.territories (id, brand_id, code, name, status, created_at, updated_at)
       VALUES ($1::uuid, $2::uuid, $3, $4, 'active', now(), now())`,
      [territoryId, brandId, `t-${tag}`, `Territory ${tag}`],
    );
    await client.pool.query(
      `INSERT INTO app.legal_entities (
         id, brand_id, organization_id, code, name, status, created_at, updated_at
       ) VALUES ($1::uuid, $2::uuid, $3::uuid, $4, $5, 'active', now(), now())`,
      [legalEntityId, brandId, orgId, `le-${tag}`, `LE ${tag}`],
    );
    await client.pool.query(
      `INSERT INTO app.outlets (
         id, brand_id, organization_id, territory_id, legal_entity_id,
         code, name, status, created_at, updated_at
       ) VALUES (
         $1::uuid, $2::uuid, $3::uuid, $4::uuid, $5::uuid,
         $6, $7, 'active', now(), now()
       )`,
      [outletId, brandId, orgId, territoryId, legalEntityId, `out-${tag}`, `Outlet ${tag}`],
    );
    await client.pool.query(
      `INSERT INTO app.customer_auth_users (
         id, name, email, email_verified, phone_number, phone_number_verified, created_at, updated_at
       ) VALUES ($1, $2, $3, false, $4, true, now(), now())`,
      [customerId, "Mig User", `${tag}@example.com`, `+91800${phoneTail}`],
    );
    await client.pool.query(
      `INSERT INTO app.carts (
         id, brand_id, customer_auth_user_id, revision, created_at, updated_at
       ) VALUES ($1::uuid, $2::uuid, $3, 1, now(), now())`,
      [cartId, brandId, customerId],
    );
    await client.pool.query(
      `INSERT INTO app.checkouts (
         id, customer_auth_user_id, brand_id, cart_id, source_cart_revision,
         revision, status, expires_at, fulfilment_mode, fulfilment_timing, created_at, updated_at
       ) VALUES (
         $1::uuid, $2, $3::uuid, $4::uuid, 1, 1, 'DRAFT',
         now() + interval '1 hour', 'DELIVERY', 'ASAP', now(), now()
       )`,
      [checkoutId, customerId, brandId, cartId],
    );
    await client.pool.query(
      `INSERT INTO app.checkout_snapshots (
         id, checkout_id, checkout_revision, source_cart_revision, selected_outlet_id,
         evaluated_at, serviceability_evaluated_at, currency, fulfilment_mode, fulfilment_timing,
         destination_kind, recipient_name, recipient_phone, address_line_1,
         city, state_code, postal_code,
         base_paise, modifier_adjustments_paise, bundle_adjustments_paise, charges_paise,
         pre_promotion_subtotal_paise, promotion_discount_paise, taxable_paise, tax_paise,
         grand_total_paise, tax_inclusion_mode, created_at
       ) VALUES (
         $1::uuid, $2::uuid, 1, 1, $3::uuid,
         now(), now(), 'INR', 'DELIVERY', 'ASAP',
         'ONE_TIME_ADDRESS', 'Hist Guest', '+919876543210', '1 Mall Road',
         'Dehradun', 'IN-UT', '248001',
         10000, 0, 0, 0, 10000, 0, 10000, 500, 10500, 'exclusive', now()
       )`,
      [snapshotId, checkoutId, outletId],
    );
    await client.pool.query(
      `INSERT INTO app.catalog_products (
         id, brand_id, code, name, product_kind, lifecycle_status, created_at, updated_at
       ) VALUES ($1::uuid, $2::uuid, $3, 'Tea', 'standard', 'draft', now(), now())`,
      [productId, brandId, `p-${tag}`],
    );
    await client.pool.query(
      `INSERT INTO app.catalog_variants (
         id, brand_id, product_id, product_kind, code, name, is_default, is_selector_visible,
         lifecycle_status, created_at, updated_at
       ) VALUES (
         $1::uuid, $2::uuid, $3::uuid, 'standard', 'default', 'Regular', true, false,
         'draft', now(), now()
       )`,
      [variantId, brandId, productId],
    );
  });

  return {
    brandId,
    customerId,
    checkoutId,
    snapshotId,
    productId,
    variantId,
    cartLineId,
  };
}

async function insertDraftPromotion(
  connectionString: string,
  brandId: string,
  code: string,
  columns: string,
  valuesSql: string,
  params: readonly unknown[],
): Promise<string> {
  const id = randomUUID();
  await withTestDatabaseClient(connectionString, (client) =>
    client.pool.query(
      `INSERT INTO app.promotions (
         id, brand_id, code, display_name, scope_type, sales_channel, status,
         trigger_type, stacking_policy, starts_at, created_at, updated_at
         ${columns}
       ) VALUES (
         $1::uuid, $2::uuid, $3, 'Offer', 'brand', 'direct', 'draft',
         'automatic', 'exclusive', now(), now(), now()
         ${valuesSql}
       )`,
      [id, brandId, code, ...params],
    ),
  );
  return id;
}

describe("IMP-036J tranche 1 commercial persistence", () => {
  it("records journal identity 0047 and applies an empty database to latest", async () => {
    const entries = loadJournalEntries();
    const tip = entries.at(-1);
    expect(tip).toMatchObject({ idx: TRANCHE_1_IDX, tag: TRANCHE_1_TAG });
    expect(entries.filter((entry) => entry.idx === TRANCHE_1_IDX)).toHaveLength(1);
    expect(entries.some((entry) => entry.tag === "0046_imp036i_tranche4_cancellation_reminder")).toBe(
      true,
    );
    expect(readFileSync(path.join(process.cwd(), "drizzle", `${TRANCHE_1_TAG}.sql`), "utf8")).toContain(
      "checkout_snapshot_promotion_effects_line_ownership_fk",
    );

    await withIsolatedTestDatabase(adminConnectionInfo(), async (database) => {
      await applyMigrations(database.connectionString);
      await withTestDatabaseClient(database.connectionString, async (client) => {
        const history = await client.pool.query<{ count: string }>(
          `SELECT COUNT(*) AS count FROM ${MIGRATIONS_SCHEMA}.${MIGRATIONS_TABLE}`,
        );
        expect(Number(history.rows[0]?.count)).toBe(entries.length);

        const guards = await client.pool.query<{ table_name: string }>(
          `SELECT table_name FROM information_schema.tables
           WHERE table_schema = 'app' AND table_name = 'first_order_purchase_guards'`,
        );
        expect(guards.rows).toHaveLength(1);

        const customerFirstOrder = await client.pool.query(
          `SELECT column_name FROM information_schema.columns
           WHERE table_schema = 'app' AND table_name = 'customer_auth_users'
             AND column_name = 'first_order'`,
        );
        expect(customerFirstOrder.rows).toHaveLength(0);

        const claimGuard = await client.pool.query(
          `SELECT column_name FROM information_schema.columns
           WHERE table_schema = 'app' AND table_name = 'promotion_redemption_claims'
             AND column_name = 'first_order_guard'`,
        );
        expect(claimGuard.rows).toHaveLength(0);
      });
    });
  });

  it("keeps historical promotions and checkout snapshots valid after the upgrade", async () => {
    await withIsolatedTestDatabase(adminConnectionInfo(), async (database) => {
      await applyMigrationsThrough(database.connectionString, PRE_TRANCHE_IDX);
      const graph = await seedGraph(database.connectionString, randomUUID().slice(0, 8));
      const promotionId = randomUUID();
      const benefitId = randomUUID();
      const lineId = randomUUID();
      const effectId = randomUUID();

      await withTestDatabaseClient(database.connectionString, async (client) => {
        await client.pool.query(
          `INSERT INTO app.promotions (
             id, brand_id, code, display_name, scope_type, sales_channel, status,
             trigger_type, stacking_policy, starts_at, created_at, updated_at
           ) VALUES (
             $1::uuid, $2::uuid, 'hist-offer', 'Historical', 'brand', 'direct', 'draft',
             'automatic', 'exclusive', now(), now(), now()
           )`,
          [promotionId, graph.brandId],
        );
        await client.pool.query(
          `INSERT INTO app.promotion_benefits (
             id, promotion_id, benefit_type, percentage_bps, created_at, updated_at
           ) VALUES ($1::uuid, $2::uuid, 'percentage_discount', 1000, now(), now())`,
          [benefitId, promotionId],
        );
        await client.pool.query(
          `INSERT INTO app.checkout_snapshot_lines (
             id, snapshot_id, source_cart_line_id, product_id, variant_id,
             product_name, variant_name, quantity,
             line_base_paise, line_modifier_adjustments_paise, line_bundle_adjustments_paise,
             line_subtotal_paise, line_promotion_discount_paise, line_taxable_paise,
             line_tax_paise, line_total_paise, sequence
           ) VALUES (
             $1::uuid, $2::uuid, $3::uuid, $4::uuid, $5::uuid,
             'Tea', 'Regular', 2,
             10000, 0, 0, 10000, 0, 10000, 500, 10500, 0
           )`,
          [lineId, graph.snapshotId, graph.cartLineId, graph.productId, graph.variantId],
        );
        await client.pool.query(
          `INSERT INTO app.checkout_snapshot_promotion_effects (
             id, snapshot_id, effect_kind, promotion_id, promotion_code, display_name, sort_order
           ) VALUES (
             $1::uuid, $2::uuid, 'applied_promotion', $3::uuid, 'hist-offer', 'Historical', 0
           )`,
          [effectId, graph.snapshotId, promotionId],
        );
      });

      await applySqlMigrationFile(database.connectionString, TRANCHE_1_TAG);

      await withTestDatabaseClient(database.connectionString, async (client) => {
        const promotion = await client.pool.query<{
          first_order_only: boolean;
          eligible_fulfilment_modes: string[] | null;
          eligible_fulfilment_timings: string[] | null;
          maximum_redemptions: number | null;
          maximum_redemptions_per_customer: number | null;
          complimentary_item: boolean;
        }>(
          `SELECT first_order_only, eligible_fulfilment_modes, eligible_fulfilment_timings,
                  maximum_redemptions, maximum_redemptions_per_customer, complimentary_item
           FROM app.promotions WHERE id = $1::uuid`,
          [promotionId],
        );
        expect(promotion.rows[0]).toEqual({
          first_order_only: false,
          eligible_fulfilment_modes: null,
          eligible_fulfilment_timings: null,
          maximum_redemptions: null,
          maximum_redemptions_per_customer: null,
          complimentary_item: false,
        });

        const line = await client.pool.query<{
          source_cart_line_id: string;
          line_origin: string;
          line_base_paise: string;
          line_total_paise: string;
        }>(
          `SELECT source_cart_line_id, line_origin, line_base_paise::text, line_total_paise::text
           FROM app.checkout_snapshot_lines WHERE id = $1::uuid`,
          [lineId],
        );
        expect(line.rows[0]).toEqual({
          source_cart_line_id: graph.cartLineId,
          line_origin: "cart",
          line_base_paise: "10000",
          line_total_paise: "10500",
        });

        const effect = await client.pool.query<{
          snapshot_line_id: string | null;
          promotion_revision: string | null;
        }>(
          `SELECT snapshot_line_id, promotion_revision::text
           FROM app.checkout_snapshot_promotion_effects WHERE id = $1::uuid`,
          [effectId],
        );
        expect(effect.rows[0]).toEqual({
          snapshot_line_id: null,
          promotion_revision: null,
        });

        const money = await client.pool.query<{ grand_total_paise: string }>(
          `SELECT grand_total_paise::text FROM app.checkout_snapshots WHERE id = $1::uuid`,
          [graph.snapshotId],
        );
        expect(money.rows[0]?.grand_total_paise).toBe("10500");
      });
    });
  });

  it("enforces locked commercial, guard, and snapshot-line shapes", async () => {
    await withIsolatedTestDatabase(adminConnectionInfo(), async (database) => {
      await applyMigrations(database.connectionString);
      const url = database.connectionString;
      const graph = await seedGraph(url, randomUUID().slice(0, 8));
      const second = await seedGraph(url, randomUUID().slice(0, 8));

      const modesEmptyId = await insertDraftPromotion(url, graph.brandId, "modes-empty", "", "", []);
      await expectCheckViolation(
        url,
        `UPDATE app.promotions SET eligible_fulfilment_modes = '{}'::text[] WHERE id = $1::uuid`,
        [modesEmptyId],
      );
      const modesId = await insertDraftPromotion(url, graph.brandId, "modes-ok", "", "", []);
      await withTestDatabaseClient(url, (client) =>
        client.pool.query(
          `UPDATE app.promotions
           SET eligible_fulfilment_modes = ARRAY['PICKUP','DELIVERY']::text[],
               eligible_fulfilment_timings = ARRAY['ASAP']::text[],
               maximum_redemptions = 3,
               maximum_redemptions_per_customer = 1,
               first_order_only = true
           WHERE id = $1::uuid`,
          [modesId],
        ),
      );
      await expectCheckViolation(
        url,
        `UPDATE app.promotions SET eligible_fulfilment_modes = ARRAY['DELIVERY','WALK_IN']::text[] WHERE id = $1::uuid`,
        [modesId],
      );
      await expectCheckViolation(
        url,
        `UPDATE app.promotions SET eligible_fulfilment_modes = ARRAY['DELIVERY','DELIVERY']::text[] WHERE id = $1::uuid`,
        [modesId],
      );
      await expectCheckViolation(
        url,
        `UPDATE app.promotions SET eligible_fulfilment_timings = ARRAY['ASAP', NULL]::text[] WHERE id = $1::uuid`,
        [modesId],
      );
      await expectCheckViolation(
        url,
        `UPDATE app.promotions SET maximum_redemptions = 0 WHERE id = $1::uuid`,
        [modesId],
      );
      await expectCheckViolation(
        url,
        `UPDATE app.promotions SET maximum_redemptions_per_customer = -1 WHERE id = $1::uuid`,
        [modesId],
      );

      const activeComplimentary = async (brandId: string, code: string) => {
        const id = randomUUID();
        await withTestDatabaseClient(url, (client) =>
          client.pool.query(
            `INSERT INTO app.promotions (
               id, brand_id, code, display_name, scope_type, sales_channel, status,
               trigger_type, stacking_policy, starts_at, complimentary_item,
               activated_at, configuration_fingerprint, created_at, updated_at
             ) VALUES (
               $1::uuid, $2::uuid, $3, 'Comp', 'brand', 'direct', 'active',
               'automatic', 'exclusive', now(), true,
               now(), 'fp', now(), now()
             )`,
            [id, brandId, code],
          ),
        );
        return id;
      };
      await activeComplimentary(graph.brandId, "comp-a");
      await expectUniqueViolation(url, `
        INSERT INTO app.promotions (
          id, brand_id, code, display_name, scope_type, sales_channel, status,
          trigger_type, stacking_policy, starts_at, complimentary_item,
          activated_at, configuration_fingerprint, created_at, updated_at
        ) VALUES (
          $1::uuid, $2::uuid, 'comp-b', 'Comp', 'brand', 'direct', 'active',
          'automatic', 'exclusive', now(), true,
          now(), 'fp', now(), now()
        )`, [randomUUID(), graph.brandId]);
      await insertDraftPromotion(
        url,
        graph.brandId,
        "comp-draft",
        ", complimentary_item",
        ", true",
        [],
      );
      await activeComplimentary(second.brandId, "comp-other-brand");

      const benefitPromotionId = await insertDraftPromotion(url, graph.brandId, "benefit-host", "", "", []);
      await withTestDatabaseClient(url, (client) =>
        client.pool.query(
          `INSERT INTO app.promotion_benefits (
             id, promotion_id, benefit_type, created_at, updated_at
           ) VALUES ($1::uuid, $2::uuid, 'delivery_fee_waiver', now(), now())`,
          [randomUUID(), benefitPromotionId],
        ),
      );
      const waiverBadId = await insertDraftPromotion(url, graph.brandId, "waiver-bad", "", "", []);
      await expectCheckViolation(
        url,
        `INSERT INTO app.promotion_benefits (
           id, promotion_id, benefit_type, percentage_bps, created_at, updated_at
         ) VALUES ($1::uuid, $2::uuid, 'delivery_fee_waiver', 100, now(), now())`,
        [randomUUID(), waiverBadId],
      );
      const compHalfId = await insertDraftPromotion(url, graph.brandId, "comp-half", "", "", []);
      await expectCheckViolation(
        url,
        `INSERT INTO app.promotion_benefits (
           id, promotion_id, benefit_type, complimentary_product_id, created_at, updated_at
         ) VALUES ($1::uuid, $2::uuid, 'complimentary_item', $3::uuid, now(), now())`,
        [randomUUID(), compHalfId, graph.productId],
      );
      const compGoodId = await insertDraftPromotion(url, graph.brandId, "comp-good", "", "", []);
      await withTestDatabaseClient(url, (client) =>
        client.pool.query(
          `INSERT INTO app.promotion_benefits (
             id, promotion_id, benefit_type, complimentary_product_id, complimentary_variant_id,
             created_at, updated_at
           ) VALUES ($1::uuid, $2::uuid, 'complimentary_item', $3::uuid, $4::uuid, now(), now())`,
          [randomUUID(), compGoodId, graph.productId, graph.variantId],
        ),
      );
      const waiverModifiersId = await insertDraftPromotion(
        url,
        graph.brandId,
        "waiver-modifiers",
        "",
        "",
        [],
      );
      await expectCheckViolation(
        url,
        `INSERT INTO app.promotion_benefits (
           id, promotion_id, benefit_type, include_modifiers, created_at, updated_at
         ) VALUES ($1::uuid, $2::uuid, 'delivery_fee_waiver', true, now(), now())`,
        [randomUUID(), waiverModifiersId],
      );
      const waiverBundlesId = await insertDraftPromotion(
        url,
        graph.brandId,
        "waiver-bundles",
        "",
        "",
        [],
      );
      await expectCheckViolation(
        url,
        `INSERT INTO app.promotion_benefits (
           id, promotion_id, benefit_type, include_bundle_deltas, created_at, updated_at
         ) VALUES ($1::uuid, $2::uuid, 'delivery_fee_waiver', true, now(), now())`,
        [randomUUID(), waiverBundlesId],
      );
      const compModifiersId = await insertDraftPromotion(
        url,
        graph.brandId,
        "comp-modifiers",
        "",
        "",
        [],
      );
      await expectCheckViolation(
        url,
        `INSERT INTO app.promotion_benefits (
           id, promotion_id, benefit_type, complimentary_product_id, complimentary_variant_id,
           include_modifiers, created_at, updated_at
         ) VALUES (
           $1::uuid, $2::uuid, 'complimentary_item', $3::uuid, $4::uuid, true, now(), now()
         )`,
        [randomUUID(), compModifiersId, graph.productId, graph.variantId],
      );
      const compBundlesId = await insertDraftPromotion(
        url,
        graph.brandId,
        "comp-bundles",
        "",
        "",
        [],
      );
      await expectCheckViolation(
        url,
        `INSERT INTO app.promotion_benefits (
           id, promotion_id, benefit_type, complimentary_product_id, complimentary_variant_id,
           include_bundle_deltas, created_at, updated_at
         ) VALUES (
           $1::uuid, $2::uuid, 'complimentary_item', $3::uuid, $4::uuid, true, now(), now()
         )`,
        [randomUUID(), compBundlesId, graph.productId, graph.variantId],
      );
      const percentFlagsId = await insertDraftPromotion(url, graph.brandId, "percent-flags", "", "", []);
      await withTestDatabaseClient(url, (client) =>
        client.pool.query(
          `INSERT INTO app.promotion_benefits (
             id, promotion_id, benefit_type, percentage_bps, include_modifiers, include_bundle_deltas,
             created_at, updated_at
           ) VALUES ($1::uuid, $2::uuid, 'percentage_discount', 500, true, true, now(), now())`,
          [randomUUID(), percentFlagsId],
        ),
      );
      const percentRefsId = await insertDraftPromotion(url, graph.brandId, "percent-refs", "", "", []);
      await expectCheckViolation(
        url,
        `INSERT INTO app.promotion_benefits (
           id, promotion_id, benefit_type, percentage_bps, complimentary_product_id,
           complimentary_variant_id, created_at, updated_at
         ) VALUES ($1::uuid, $2::uuid, 'percentage_discount', 500, $3::uuid, $4::uuid, now(), now())`,
        [randomUUID(), percentRefsId, graph.productId, graph.variantId],
      );

      const insertLine = async (input: {
        snapshotId: string;
        origin: string;
        source: string | null;
        quantity: number;
        modifier: number;
      }) => {
        await withTestDatabaseClient(url, (client) =>
          client.pool.query(
            `INSERT INTO app.checkout_snapshot_lines (
               id, snapshot_id, source_cart_line_id, line_origin, product_id, variant_id,
               product_name, variant_name, quantity,
               line_base_paise, line_modifier_adjustments_paise, line_bundle_adjustments_paise,
               line_subtotal_paise, line_promotion_discount_paise, line_taxable_paise,
               line_tax_paise, line_total_paise, sequence
             ) VALUES (
               $1::uuid, $2::uuid, $3::uuid, $4, $5::uuid, $6::uuid,
               'Tea', 'Regular', $7,
               100, $8, 0, 100, 100, 0, 0, 0, 1
             )`,
            [
              randomUUID(),
              input.snapshotId,
              input.source,
              input.origin,
              graph.productId,
              graph.variantId,
              input.quantity,
              input.modifier,
            ],
          ),
        );
      };
      await insertLine({
        snapshotId: graph.snapshotId,
        origin: "complimentary_offer",
        source: null,
        quantity: 1,
        modifier: 0,
      });
      await expect(
        insertLine({
          snapshotId: graph.snapshotId,
          origin: "cart",
          source: null,
          quantity: 1,
          modifier: 0,
        }),
      ).rejects.toMatchObject({ code: "23514" });
      await expect(
        insertLine({
          snapshotId: graph.snapshotId,
          origin: "complimentary_offer",
          source: graph.cartLineId,
          quantity: 1,
          modifier: 0,
        }),
      ).rejects.toMatchObject({ code: "23514" });
      await expect(
        insertLine({
          snapshotId: graph.snapshotId,
          origin: "complimentary_offer",
          source: null,
          quantity: 2,
          modifier: 0,
        }),
      ).rejects.toMatchObject({ code: "23514" });

      const ownedLineId = randomUUID();
      await withTestDatabaseClient(url, (client) =>
        client.pool.query(
          `INSERT INTO app.checkout_snapshot_lines (
             id, snapshot_id, source_cart_line_id, line_origin, product_id, variant_id,
             product_name, variant_name, quantity,
             line_base_paise, line_modifier_adjustments_paise, line_bundle_adjustments_paise,
             line_subtotal_paise, line_promotion_discount_paise, line_taxable_paise,
             line_tax_paise, line_total_paise, sequence
           ) VALUES (
             $1::uuid, $2::uuid, $3::uuid, 'cart', $4::uuid, $5::uuid,
             'Tea', 'Regular', 1,
             100, 0, 0, 100, 0, 100, 0, 100, 2
           )`,
          [ownedLineId, graph.snapshotId, graph.cartLineId, graph.productId, graph.variantId],
        ),
      );
      await withTestDatabaseClient(url, (client) =>
        client.pool.query(
          `INSERT INTO app.checkout_snapshot_promotion_effects (
             id, snapshot_id, effect_kind, promotion_id, promotion_code, display_name,
             snapshot_line_id, promotion_revision, sort_order
           ) VALUES (
             $1::uuid, $2::uuid, 'applied_promotion', $3::uuid, 'owned', 'Owned',
             $4::uuid, 4, 0
           )`,
          [randomUUID(), graph.snapshotId, benefitPromotionId, ownedLineId],
        ),
      );
      await expect(
        withTestDatabaseClient(url, (client) =>
          client.pool.query(
            `INSERT INTO app.checkout_snapshot_promotion_effects (
               id, snapshot_id, effect_kind, promotion_id, promotion_code, display_name,
               snapshot_line_id, promotion_revision, sort_order
             ) VALUES (
               $1::uuid, $2::uuid, 'applied_promotion', $3::uuid, 'cross', 'Cross',
               $4::uuid, 4, 0
             )`,
            [randomUUID(), second.snapshotId, benefitPromotionId, ownedLineId],
          ),
        ),
      ).rejects.toMatchObject({ code: "23503" });

      const insertGuard = (
        input: {
          customerId: string;
          checkoutId: string;
          snapshotId: string;
          paymentId: string | null;
          attemptId: string | null;
          status: "RESERVED" | "CONSUMED" | "RELEASED";
        },
      ) =>
        withTestDatabaseClient(url, (client) =>
          client.pool.query(
            `INSERT INTO app.first_order_purchase_guards (
               id, customer_auth_user_id, checkout_id, checkout_snapshot_id,
               payment_id, payment_attempt_id, status, created_at, consumed_at, released_at
             ) VALUES (
               $1::uuid, $2, $3::uuid, $4::uuid,
               $5::uuid, $6::uuid, $7, now(),
               CASE WHEN $7 = 'CONSUMED' THEN now() ELSE NULL END,
               CASE WHEN $7 = 'RELEASED' THEN now() ELSE NULL END
             )`,
            [
              randomUUID(),
              input.customerId,
              input.checkoutId,
              input.snapshotId,
              input.paymentId,
              input.attemptId,
              input.status,
            ],
          ),
        );

      await insertGuard({
        customerId: graph.customerId,
        checkoutId: graph.checkoutId,
        snapshotId: graph.snapshotId,
        paymentId: null,
        attemptId: null,
        status: "CONSUMED",
      });
      await expect(
        insertGuard({
          customerId: second.customerId,
          checkoutId: graph.checkoutId,
          snapshotId: graph.snapshotId,
          paymentId: null,
          attemptId: null,
          status: "CONSUMED",
        }),
      ).rejects.toMatchObject({ code: "23505" });
      await expectCheckViolation(
        url,
        `INSERT INTO app.first_order_purchase_guards (
           id, customer_auth_user_id, checkout_id, checkout_snapshot_id,
           payment_id, payment_attempt_id, status, created_at, released_at
         ) VALUES (
           $1::uuid, $2, $3::uuid, $4::uuid, null, null, 'RELEASED', now(), now()
         )`,
        [randomUUID(), graph.customerId, second.checkoutId, second.snapshotId],
      );

      const paymentId = randomUUID();
      const attemptId = randomUUID();
      const paymentSnapshot = second.snapshotId;
      await withTestDatabaseClient(url, async (client) => {
        await client.pool.query(
          `INSERT INTO app.payments (
             id, checkout_id, checkout_snapshot_id, status, created_at, updated_at
           ) VALUES ($1::uuid, $2::uuid, $3::uuid, 'OPEN', now(), now())`,
          [paymentId, second.checkoutId, paymentSnapshot],
        );
        await client.pool.query(
          `INSERT INTO app.payment_attempts (
             id, payment_id, attempt_ordinal, provider, method_intent,
             provider_execution_identity, status, created_at, updated_at
           ) VALUES (
             $1::uuid, $2::uuid, 1, 'razorpay', 'upi', $3, 'CREATED', now(), now()
           )`,
          [attemptId, paymentId, `exec-${attemptId}`],
        );
      });
      await insertGuard({
        customerId: second.customerId,
        checkoutId: second.checkoutId,
        snapshotId: paymentSnapshot,
        paymentId,
        attemptId,
        status: "RESERVED",
      });
      const third = await seedGraph(url, randomUUID().slice(0, 8));
      const otherPaymentId = randomUUID();
      const otherAttemptId = randomUUID();
      await withTestDatabaseClient(url, async (client) => {
        await client.pool.query(
          `INSERT INTO app.payments (
             id, checkout_id, checkout_snapshot_id, status, created_at, updated_at
           ) VALUES ($1::uuid, $2::uuid, $3::uuid, 'OPEN', now(), now())`,
          [otherPaymentId, third.checkoutId, third.snapshotId],
        );
        await client.pool.query(
          `INSERT INTO app.payment_attempts (
             id, payment_id, attempt_ordinal, provider, method_intent,
             provider_execution_identity, status, created_at, updated_at
           ) VALUES (
             $1::uuid, $2::uuid, 1, 'razorpay', 'upi', $3, 'CREATED', now(), now()
           )`,
          [otherAttemptId, otherPaymentId, `exec-${otherAttemptId}`],
        );
      });
      await expect(
        insertGuard({
          customerId: second.customerId,
          checkoutId: third.checkoutId,
          snapshotId: third.snapshotId,
          paymentId: otherPaymentId,
          attemptId: otherAttemptId,
          status: "RESERVED",
        }),
      ).rejects.toMatchObject({ code: "23505" });

      await withTestDatabaseClient(url, (client) =>
        client.pool.query(
          `UPDATE app.first_order_purchase_guards
           SET status = 'RELEASED', released_at = now()
           WHERE payment_id = $1::uuid`,
          [paymentId],
        ),
      );
      await insertGuard({
        customerId: second.customerId,
        checkoutId: third.checkoutId,
        snapshotId: third.snapshotId,
        paymentId: otherPaymentId,
        attemptId: otherAttemptId,
        status: "RESERVED",
      });
      const releasedRetryAttemptId = randomUUID();
      await withTestDatabaseClient(url, (client) =>
        client.pool.query(
          `UPDATE app.payment_attempts
           SET status = 'CANCELLED', cancelled_at = now(), updated_at = now()
           WHERE id = $1::uuid`,
          [attemptId],
        ),
      );
      await withTestDatabaseClient(url, (client) =>
        client.pool.query(
          `INSERT INTO app.payment_attempts (
             id, payment_id, attempt_ordinal, provider, method_intent,
             provider_execution_identity, status, created_at, updated_at
           ) VALUES (
             $1::uuid, $2::uuid, 2, 'razorpay', 'upi', $3, 'CREATED', now(), now()
           )`,
          [releasedRetryAttemptId, paymentId, `exec-${releasedRetryAttemptId}`],
        ),
      );
      await insertGuard({
        customerId: third.customerId,
        checkoutId: second.checkoutId,
        snapshotId: paymentSnapshot,
        paymentId,
        attemptId: releasedRetryAttemptId,
        status: "RESERVED",
      });
      const fourth = await seedGraph(url, randomUUID().slice(0, 8));
      const occupiedPaymentAttemptId = randomUUID();
      await withTestDatabaseClient(url, (client) =>
        client.pool.query(
          `UPDATE app.payment_attempts
           SET status = 'CANCELLED', cancelled_at = now(), updated_at = now()
           WHERE id = $1::uuid`,
          [releasedRetryAttemptId],
        ),
      );
      await withTestDatabaseClient(url, (client) =>
        client.pool.query(
          `INSERT INTO app.payment_attempts (
             id, payment_id, attempt_ordinal, provider, method_intent,
             provider_execution_identity, status, created_at, updated_at
           ) VALUES (
             $1::uuid, $2::uuid, 3, 'razorpay', 'upi', $3, 'CREATED', now(), now()
           )`,
          [occupiedPaymentAttemptId, paymentId, `exec-${occupiedPaymentAttemptId}`],
        ),
      );
      await expect(
        insertGuard({
          customerId: fourth.customerId,
          checkoutId: second.checkoutId,
          snapshotId: paymentSnapshot,
          paymentId,
          attemptId: occupiedPaymentAttemptId,
          status: "RESERVED",
        }),
      ).rejects.toMatchObject({ code: "23505" });
      await expect(
        insertGuard({
          customerId: fourth.customerId,
          checkoutId: second.checkoutId,
          snapshotId: paymentSnapshot,
          paymentId,
          attemptId,
          status: "RESERVED",
        }),
      ).rejects.toMatchObject({ code: "23505" });
    });
  });

  it("deletes a line-linked promotion effect through the checkout cascade", async () => {
    await withIsolatedTestDatabase(adminConnectionInfo(), async (database) => {
      await applyMigrations(database.connectionString);
      const url = database.connectionString;
      const graph = await seedGraph(url, randomUUID().slice(0, 8));
      const promotionId = await insertDraftPromotion(url, graph.brandId, "cascade-offer", "", "", []);
      const lineId = randomUUID();
      const effectId = randomUUID();

      await withTestDatabaseClient(url, async (client) => {
        const ownership = await client.pool.query<{ confdeltype: string }>(
          `SELECT confdeltype
           FROM pg_constraint
           WHERE conname = 'checkout_snapshot_promotion_effects_line_ownership_fk'`,
        );
        expect(ownership.rows[0]?.confdeltype).toBe("c");

        await client.pool.query(
          `INSERT INTO app.checkout_snapshot_lines (
             id, snapshot_id, source_cart_line_id, line_origin, product_id, variant_id,
             product_name, variant_name, quantity,
             line_base_paise, line_modifier_adjustments_paise, line_bundle_adjustments_paise,
             line_subtotal_paise, line_promotion_discount_paise, line_taxable_paise,
             line_tax_paise, line_total_paise, sequence
           ) VALUES (
             $1::uuid, $2::uuid, $3::uuid, 'cart', $4::uuid, $5::uuid,
             'Tea', 'Regular', 1,
             100, 0, 0, 100, 0, 100, 0, 100, 1
           )`,
          [lineId, graph.snapshotId, graph.cartLineId, graph.productId, graph.variantId],
        );
        await client.pool.query(
          `INSERT INTO app.checkout_snapshot_promotion_effects (
             id, snapshot_id, effect_kind, promotion_id, promotion_code, display_name,
             snapshot_line_id, promotion_revision, sort_order
           ) VALUES (
             $1::uuid, $2::uuid, 'applied_promotion', $3::uuid, 'cascade-offer', 'Cascade',
             $4::uuid, 1, 0
           )`,
          [effectId, graph.snapshotId, promotionId, lineId],
        );

        await client.pool.query(`DELETE FROM app.checkouts WHERE id = $1::uuid`, [graph.checkoutId]);

        const remaining = await client.pool.query<{
          snapshots: string;
          lines: string;
          effects: string;
        }>(
          `SELECT
             (SELECT COUNT(*) FROM app.checkout_snapshots WHERE id = $1::uuid)::text AS snapshots,
             (SELECT COUNT(*) FROM app.checkout_snapshot_lines WHERE id = $2::uuid)::text AS lines,
             (SELECT COUNT(*) FROM app.checkout_snapshot_promotion_effects WHERE id = $3::uuid)::text AS effects`,
          [graph.snapshotId, lineId, effectId],
        );
        expect(remaining.rows[0]).toEqual({
          snapshots: "0",
          lines: "0",
          effects: "0",
        });
      });
    });
  });
});
