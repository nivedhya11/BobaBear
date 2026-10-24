/**
 * Disposable-database statements for the GTM browser harness.
 * Lives on the database boundary so the E2E HTTP adapter does not import pg.
 *
 * Every mutation is bound to the identity the browser captured for this run.
 * A missing, ambiguous, wrong-customer, stale, or misbound identity rolls back
 * with zero writes.
 */
import { randomUUID } from "node:crypto";

import { Client } from "pg";

export type GtmUatControlResult = Record<string, unknown>;

export type GtmUatControlInput = Readonly<Record<string, unknown>>;

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const RUN_ID_RE = UUID_RE;
const REVISION_RE = /^\d{1,20}$/;
const FIXTURE_OUTLET_CODE = "e2e-outlet";
const DRIFTED_PROMOTION_CODE = "drifted-seal";

class ControlRejection extends Error {
  readonly result: GtmUatControlResult;

  constructor(result: GtmUatControlResult) {
    super("control rejected");
    this.result = result;
  }
}

function reject(reason: string, extra: GtmUatControlResult = {}): never {
  throw new ControlRejection({ ok: false, mutated: 0, reason, ...extra });
}

export function availabilityRunMarker(runId: string): string {
  if (!RUN_ID_RE.test(runId)) reject("RUN_MISMATCH");
  const marker = `e2e-gtm:${runId.replace(/-/g, "").toLowerCase()}`;
  if (marker.length > 64) reject("RUN_MISMATCH");
  return marker;
}

function requireUuid(value: unknown, reason = "INVALID_IDENTITY"): string {
  if (typeof value !== "string" || !UUID_RE.test(value)) reject(reason);
  return value;
}

function requireRevision(value: unknown): string {
  if (typeof value !== "string" || !REVISION_RE.test(value)) reject("INVALID_IDENTITY");
  return value;
}

function requireCustomerId(value: unknown): string | null {
  if (value === null) return null;
  if (typeof value !== "string" || value.length < 1 || value.length > 128) reject("INVALID_IDENTITY");
  if (!/^[\x21-\x7e]+$/.test(value)) reject("INVALID_IDENTITY");
  return value;
}

function requirePromotionCode(value: unknown): string {
  if (typeof value !== "string" || value.length < 1 || value.length > 128) reject("INVALID_IDENTITY");
  if (!/^[\x21-\x7e]+$/.test(value)) reject("INVALID_IDENTITY");
  return value;
}

function requireText(value: unknown): string {
  if (typeof value !== "string" || value.length < 1 || value.length > 64) reject("INVALID_IDENTITY");
  return value;
}

async function withClient<T>(databaseUrl: string, run: (client: Client) => Promise<T>): Promise<T> {
  const client = new Client({ connectionString: databaseUrl });
  await client.connect();
  try {
    return await run(client);
  } finally {
    await client.end();
  }
}

async function inTransaction(
  client: Client,
  run: () => Promise<GtmUatControlResult>,
): Promise<GtmUatControlResult> {
  await client.query("begin");
  try {
    const result = await run();
    await client.query("commit");
    return result;
  } catch (error) {
    try {
      await client.query("rollback");
    } catch {
      /* Preserve the original failure. */
    }
    if (error instanceof ControlRejection) return error.result;
    throw error;
  }
}

async function assertFixtureOutlet(
  client: Client,
  outletId: string,
  brandId: string,
): Promise<void> {
  const outlets = await client.query<{ id: string; code: string; brand_id: string }>(
    `
    select id::text as id, code, brand_id::text as brand_id
    from app.outlets
    where id = $1::uuid
    `,
    [outletId],
  );
  if (outlets.rows.length === 0) reject("MISSING_OUTLET");
  if (outlets.rows.length !== 1) reject("AMBIGUOUS_OUTLET");
  const outlet = outlets.rows[0]!;
  if (outlet.code !== FIXTURE_OUTLET_CODE || outlet.brand_id !== brandId) reject("WRONG_OUTLET");
  const fixture = await client.query<{ n: string }>(
    `select count(*)::text as n from app.outlets where code = $1`,
    [FIXTURE_OUTLET_CODE],
  );
  if (fixture.rows[0]?.n !== "1") reject("AMBIGUOUS_OUTLET");
}

async function markFirstCartLineUnavailable(
  client: Client,
  input: GtmUatControlInput,
  runId: string,
): Promise<GtmUatControlResult> {
  const cartId = requireUuid(input.cartId);
  const outletId = requireUuid(input.outletId);
  const lineId = requireUuid(input.lineId);
  const siblingLineId = requireUuid(input.siblingLineId);
  const expectedCustomerId = requireCustomerId(input.customerAuthUserId);
  const expectedRevision = requireRevision(input.expectedRevision);
  if (lineId === siblingLineId) reject("AMBIGUOUS_LINE");
  const marker = availabilityRunMarker(runId);

  return inTransaction(client, async () => {
    const carts = await client.query<{
      brand_id: string;
      customer_auth_user_id: string | null;
      revision: string;
      stale: boolean;
    }>(
      `
      select brand_id::text as brand_id,
             customer_auth_user_id,
             revision::text as revision,
             (expires_at is not null and expires_at <= now()) as stale
      from app.carts
      where id = $1::uuid
      for update
      `,
      [cartId],
    );
    if (carts.rows.length === 0) reject("MISSING_CART");
    if (carts.rows.length !== 1) reject("AMBIGUOUS_CART");
    const cart = carts.rows[0]!;
    if ((cart.customer_auth_user_id ?? null) !== expectedCustomerId) reject("WRONG_CUSTOMER");
    if (cart.stale || cart.revision !== expectedRevision) reject("STALE_CART");

    const lines = await client.query<{
      line_id: string;
      variant_id: string;
      product_name: string;
    }>(
      `
      select cl.id::text as line_id, cl.variant_id::text as variant_id, p.name as product_name
      from app.cart_lines cl
      join app.catalog_variants v on v.id = cl.variant_id
      join app.catalog_products p on p.id = v.product_id
      where cl.cart_id = $1::uuid
      `,
      [cartId],
    );
    const target = lines.rows.filter((row) => row.line_id === lineId);
    const sibling = lines.rows.filter((row) => row.line_id === siblingLineId);
    if (target.length === 0) reject("MISSING_LINE");
    if (target.length !== 1 || sibling.length !== 1) reject("AMBIGUOUS_LINE");
    const affected = target[0]!;
    const unaffected = sibling[0]!;
    if (affected.variant_id === unaffected.variant_id) reject("AMBIGUOUS_LINE");
    const sameVariant = lines.rows.filter((row) => row.variant_id === affected.variant_id);
    if (sameVariant.length !== 1) reject("AMBIGUOUS_LINE");

    await assertFixtureOutlet(client, outletId, cart.brand_id);

    const written = await client.query<{ outlet_id: string; variant_id: string }>(
      `
      insert into app.outlet_variant_availability (
        id, brand_id, organization_id, territory_id, outlet_id, variant_id,
        state, unavailable_until, reason_code, note,
        updated_by_workforce_user_id, created_at, updated_at
      )
      select $1::uuid, o.brand_id, o.organization_id, o.territory_id, o.id,
             $2::uuid, 'sold_out', null, $3, null, u.id, now(), now()
      from app.outlets o
      join lateral (
        select id from app.workforce_auth_users order by created_at asc limit 1
      ) u on true
      where o.id = $4::uuid
        and o.code = $5
      on conflict (outlet_id, variant_id)
      do update set
        state = 'sold_out',
        unavailable_until = null,
        reason_code = excluded.reason_code,
        note = null,
        updated_at = now()
      returning outlet_id::text, variant_id::text
      `,
      [randomUUID(), affected.variant_id, marker, outletId, FIXTURE_OUTLET_CODE],
    );
    if (written.rows.length !== 1) reject("WRITE_REJECTED");
    const row = written.rows[0]!;
    if (row.outlet_id !== outletId || row.variant_id !== affected.variant_id) {
      reject("WRONG_OUTLET");
    }
    return {
      ok: true,
      mutated: 1,
      cartId,
      outletId,
      lineId,
      siblingLineId,
      variantId: affected.variant_id,
      unavailableProductName: affected.product_name,
      unaffectedProductName: unaffected.product_name,
    };
  });
}

async function driftSealedPromotionCode(
  client: Client,
  input: GtmUatControlInput,
): Promise<GtmUatControlResult> {
  const checkoutId = requireUuid(input.checkoutId);
  const activeSnapshotId = requireUuid(input.activeSnapshotId);
  const promotionEffectId = requireUuid(input.promotionEffectId);
  const expectedCustomerId = requireCustomerId(input.customerAuthUserId);
  const expectedRevision = requireRevision(input.expectedRevision);
  const expectedPromotionCode = requirePromotionCode(input.expectedPromotionCode);
  const expectedStatus = requireText(input.expectedStatus);
  if (expectedStatus !== "READY_FOR_PAYMENT") reject("WRONG_STATE");
  if (expectedPromotionCode === DRIFTED_PROMOTION_CODE) reject("STALE_EFFECT");

  return inTransaction(client, async () => {
    const checkouts = await client.query<{
      status: string;
      active_snapshot_id: string | null;
      customer_auth_user_id: string;
      revision: string;
      stale: boolean;
    }>(
      `
      select status,
             active_snapshot_id::text as active_snapshot_id,
             customer_auth_user_id,
             revision::text as revision,
             (expires_at <= now()) as stale
      from app.checkouts
      where id = $1::uuid
      for update
      `,
      [checkoutId],
    );
    if (checkouts.rows.length === 0) reject("MISSING_CHECKOUT");
    if (checkouts.rows.length !== 1) reject("AMBIGUOUS_CHECKOUT");
    const checkout = checkouts.rows[0]!;
    if (checkout.status !== expectedStatus) reject("WRONG_STATE");
    if (checkout.stale || checkout.revision !== expectedRevision) reject("STALE_CHECKOUT");
    if (checkout.customer_auth_user_id !== expectedCustomerId) reject("WRONG_CUSTOMER");
    if (checkout.active_snapshot_id !== activeSnapshotId) reject("MISBOUND_SNAPSHOT");

    const effects = await client.query<{
      id: string;
      snapshot_id: string;
      promotion_code: string;
      checkout_id: string;
      grand_total_paise: string;
    }>(
      `
      select e.id::text as id,
             e.snapshot_id::text as snapshot_id,
             e.promotion_code,
             s.checkout_id::text as checkout_id,
             s.grand_total_paise::text as grand_total_paise
      from app.checkout_snapshot_promotion_effects e
      join app.checkout_snapshots s on s.id = e.snapshot_id
      where e.id = $1::uuid
      for update of e
      `,
      [promotionEffectId],
    );
    if (effects.rows.length === 0) reject("MISSING_EFFECT");
    if (effects.rows.length !== 1) reject("AMBIGUOUS_EFFECT");
    const effect = effects.rows[0]!;
    if (effect.snapshot_id !== activeSnapshotId) reject("MISBOUND_EFFECT");
    if (effect.checkout_id !== checkoutId) reject("MISBOUND_CHECKOUT");
    if (effect.promotion_code !== expectedPromotionCode) reject("STALE_EFFECT");

    const bound = await client.query<{ n: string }>(
      `
      select count(*)::text as n
      from app.checkout_snapshot_promotion_effects
      where id = $1::uuid
        and snapshot_id = $2::uuid
        and promotion_code = $3
      `,
      [promotionEffectId, activeSnapshotId, expectedPromotionCode],
    );
    if (bound.rows[0]?.n !== "1") reject("AMBIGUOUS_EFFECT");

    const updated = await client.query<{ id: string; snapshot_id: string; promotion_code: string }>(
      `
      update app.checkout_snapshot_promotion_effects
      set promotion_code = $4
      where id = $1::uuid
        and snapshot_id = $2::uuid
        and promotion_code = $3
      returning id::text, snapshot_id::text, promotion_code
      `,
      [promotionEffectId, activeSnapshotId, expectedPromotionCode, DRIFTED_PROMOTION_CODE],
    );
    if (updated.rows.length !== 1) reject("WRITE_REJECTED");

    const owner = await client.query<{ checkout_id: string }>(
      `
      select s.checkout_id::text as checkout_id
      from app.checkout_snapshots s
      join app.checkouts c on c.id = s.checkout_id and c.active_snapshot_id = s.id
      where s.id = $1::uuid
        and c.id = $2::uuid
        and c.status = 'READY_FOR_PAYMENT'
      `,
      [activeSnapshotId, checkoutId],
    );
    if (owner.rows.length !== 1 || owner.rows[0]?.checkout_id !== checkoutId) {
      reject("MISBOUND_CHECKOUT");
    }

    const counts = await client.query<{ payments: string; orders: string }>(`
      select
        (select count(*) from app.payments)::text as payments,
        (select count(*) from app.orders)::text as orders
    `);
    return {
      ok: true,
      mutated: 1,
      mutatedEffects: 1,
      checkoutId,
      activeSnapshotId,
      promotionEffectId,
      promotionCode: updated.rows[0]?.promotion_code ?? null,
      grandTotalPaise: effect.grand_total_paise,
      paymentCount: Number(counts.rows[0]?.payments ?? "0"),
      orderCount: Number(counts.rows[0]?.orders ?? "0"),
    };
  });
}

async function restoreAvailability(
  client: Client,
  input: GtmUatControlInput,
  runId: string,
): Promise<GtmUatControlResult> {
  const outletId = requireUuid(input.outletId);
  const variantId = requireUuid(input.variantId);
  const marker = availabilityRunMarker(runId);

  return inTransaction(client, async () => {
    const outlets = await client.query<{ code: string }>(
      `select code from app.outlets where id = $1::uuid`,
      [outletId],
    );
    if (outlets.rows.length !== 1 || outlets.rows[0]?.code !== FIXTURE_OUTLET_CODE) {
      reject("WRONG_OUTLET");
    }
    const restored = await client.query<{ outlet_id: string; variant_id: string }>(
      `
      update app.outlet_variant_availability
      set state = 'available', unavailable_until = null, updated_at = now()
      where outlet_id = $1::uuid
        and variant_id = $2::uuid
        and reason_code = $3
        and state <> 'available'
      returning outlet_id::text, variant_id::text
      `,
      [outletId, variantId, marker],
    );
    if (restored.rows.length > 1) reject("AMBIGUOUS_AVAILABILITY");
    const row = restored.rows[0];
    if (row && (row.outlet_id !== outletId || row.variant_id !== variantId)) {
      reject("WRONG_OUTLET");
    }
    return {
      ok: true,
      mutated: restored.rows.length,
      restored: restored.rows.length,
      outletId,
      variantId,
    };
  });
}

async function readBinding(client: Client, input: GtmUatControlInput, runId: string): Promise<GtmUatControlResult> {
  const marker = availabilityRunMarker(runId);
  const result: GtmUatControlResult = { ok: true, mutated: 0 };

  if (input.cartId !== undefined) {
    const cartId = requireUuid(input.cartId);
    const carts = await client.query<{ found: string }>(
      `select count(*)::text as found from app.carts where id = $1::uuid`,
      [cartId],
    );
    const lines = await client.query<{ line_id: string }>(
      `
      select id::text as line_id
      from app.cart_lines
      where cart_id = $1::uuid
      order by id
      `,
      [cartId],
    );
    result.cartFound = carts.rows[0]?.found === "1";
    result.lineIds = lines.rows.map((row) => row.line_id);
  }

  if (input.outletId !== undefined && input.variantId !== undefined) {
    const outletId = requireUuid(input.outletId);
    const variantId = requireUuid(input.variantId);
    const rows = await client.query<{ state: string; reason_code: string | null }>(
      `
      select state, reason_code
      from app.outlet_variant_availability
      where outlet_id = $1::uuid and variant_id = $2::uuid
      `,
      [outletId, variantId],
    );
    if (rows.rows.length > 1) reject("AMBIGUOUS_AVAILABILITY");
    const row = rows.rows[0];
    result.availability = row
      ? { state: row.state, reasonMatchesRun: row.reason_code === marker }
      : null;
  }

  if (input.checkoutId !== undefined) {
    const checkoutId = requireUuid(input.checkoutId);
    const checkouts = await client.query<{
      status: string;
      active_snapshot_id: string | null;
    }>(
      `
      select status, active_snapshot_id::text as active_snapshot_id
      from app.checkouts
      where id = $1::uuid
      `,
      [checkoutId],
    );
    if (checkouts.rows.length > 1) reject("AMBIGUOUS_CHECKOUT");
    const checkout = checkouts.rows[0];
    if (!checkout) {
      result.checkout = { found: false, effects: [] };
    } else {
      const effects = checkout.active_snapshot_id
        ? await client.query<{ id: string; promotion_code: string }>(
            `
            select e.id::text as id, e.promotion_code
            from app.checkout_snapshot_promotion_effects e
            join app.checkout_snapshots s on s.id = e.snapshot_id
            where e.snapshot_id = $1::uuid
              and s.checkout_id = $2::uuid
            order by e.sort_order, e.id
            `,
            [checkout.active_snapshot_id, checkoutId],
          )
        : { rows: [] };
      result.checkout = {
        found: true,
        status: checkout.status,
        activeSnapshotId: checkout.active_snapshot_id,
        effects: effects.rows.map((row) => ({ id: row.id, promotionCode: row.promotion_code })),
      };
    }
  }

  return result;
}

async function counts(client: Client): Promise<GtmUatControlResult> {
  const result = await client.query<{ payments: string; orders: string }>(`
    select
      (select count(*) from app.payments)::text as payments,
      (select count(*) from app.orders)::text as orders
  `);
  return {
    ok: true,
    mutated: 0,
    paymentCount: Number(result.rows[0]?.payments ?? "0"),
    orderCount: Number(result.rows[0]?.orders ?? "0"),
  };
}

export async function runGtmUatBrowserControl(
  databaseUrl: string,
  input: GtmUatControlInput,
  runId: string,
): Promise<GtmUatControlResult> {
  if (!RUN_ID_RE.test(runId)) return { ok: false, mutated: 0, reason: "RUN_MISMATCH" };
  const action = input.action;
  if (typeof action !== "string" || action.length === 0) {
    return { ok: false, mutated: 0, reason: "UNKNOWN_ACTION" };
  }
  return withClient(databaseUrl, async (client) => {
    try {
      if (action === "mark-first-cart-line-unavailable") {
        return await markFirstCartLineUnavailable(client, input, runId);
      }
      if (action === "drift-sealed-promotion-code") return await driftSealedPromotionCode(client, input);
      if (action === "restore-availability") return await restoreAvailability(client, input, runId);
      if (action === "read-binding") return await readBinding(client, input, runId);
      if (action === "counts") return await counts(client);
      return { ok: false, mutated: 0, reason: "UNKNOWN_ACTION" };
    } catch (error) {
      if (error instanceof ControlRejection) return error.result;
      throw error;
    }
  });
}
