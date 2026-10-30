/**
 * Loopback-only controls for the disposable customer-ordering E2E database.
 * Not mounted in production services.
 */
import { randomUUID, timingSafeEqual } from "node:crypto";
import type { IncomingMessage, ServerResponse } from "node:http";

import { Client } from "pg";

export type GtmUatControlResult = Record<string, unknown>;

function tokensMatch(presented: string, expected: string): boolean {
  const left = Buffer.from(presented);
  const right = Buffer.from(expected);
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    let size = 0;
    req.on("data", (chunk: Buffer) => {
      size += chunk.length;
      if (size > 4_096) {
        reject(new Error("control body too large"));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    req.on("error", reject);
  });
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

async function markFirstCartLineUnavailable(client: Client): Promise<GtmUatControlResult> {
  const lines = await client.query<{
    variant_id: string;
    product_name: string;
  }>(`
    select cl.variant_id::text as variant_id, p.name as product_name
    from app.cart_lines cl
    join app.catalog_variants v on v.id = cl.variant_id
    join app.catalog_products p on p.id = v.product_id
    join app.cart_line_units u on u.cart_line_id = cl.id
    group by cl.id, cl.variant_id, p.name
    order by min(u.ordinal) asc
  `);
  if (lines.rows.length < 2) {
    return { ok: false, reason: "NEED_TWO_CART_LINES", lineCount: lines.rows.length };
  }
  const affected = lines.rows[0]!;
  const unaffected = lines.rows[1]!;
  const written = await client.query(
    `
    insert into app.outlet_variant_availability (
      id, brand_id, organization_id, territory_id, outlet_id, variant_id,
      state, unavailable_until, reason_code, note,
      updated_by_workforce_user_id, created_at, updated_at
    )
    select $1::uuid, o.brand_id, o.organization_id, o.territory_id, o.id,
           $2::uuid, 'sold_out', null, 'e2e-gtm', null, u.id, now(), now()
    from app.outlets o
    join lateral (
      select id from app.workforce_auth_users order by created_at asc limit 1
    ) u on true
    where o.code = 'e2e-outlet'
    on conflict (outlet_id, variant_id)
    do update set state = 'sold_out', unavailable_until = null, updated_at = now()
    returning outlet_id::text
    `,
    [randomUUID(), affected.variant_id],
  );
  return {
    ok: written.rowCount === 1,
    unavailableProductName: affected.product_name,
    unaffectedProductName: unaffected.product_name,
  };
}

async function driftSealedPromotionCode(client: Client): Promise<GtmUatControlResult> {
  const updated = await client.query<{
    promotion_code: string;
    grand_total_paise: string;
  }>(`
    with target as (
      select active_snapshot_id
      from app.checkouts
      where status = 'READY_FOR_PAYMENT'
      order by expires_at desc
      limit 1
    ),
    updated as (
      update app.checkout_snapshot_promotion_effects e
      set promotion_code = 'drifted-seal'
      from target t
      where e.snapshot_id = t.active_snapshot_id
      returning e.promotion_code, e.snapshot_id
    )
    select u.promotion_code, s.grand_total_paise::text as grand_total_paise
    from updated u
    join app.checkout_snapshots s on s.id = u.snapshot_id
  `);
  const counts = await client.query<{ payments: string; orders: string }>(`
    select
      (select count(*) from app.payments)::text as payments,
      (select count(*) from app.orders)::text as orders
  `);
  const row = updated.rows[0];
  return {
    ok: updated.rows.length > 0,
    mutatedEffects: updated.rows.length,
    promotionCode: row?.promotion_code ?? null,
    grandTotalPaise: row?.grand_total_paise ?? null,
    paymentCount: Number(counts.rows[0]?.payments ?? "0"),
    orderCount: Number(counts.rows[0]?.orders ?? "0"),
  };
}

async function restoreAvailability(client: Client): Promise<GtmUatControlResult> {
  const restored = await client.query(`
    update app.outlet_variant_availability
    set state = 'available', unavailable_until = null, updated_at = now()
    where reason_code = 'e2e-gtm' and state <> 'available'
  `);
  return { ok: true, restored: restored.rowCount ?? 0 };
}

async function counts(client: Client): Promise<GtmUatControlResult> {
  const result = await client.query<{ payments: string; orders: string }>(`
    select
      (select count(*) from app.payments)::text as payments,
      (select count(*) from app.orders)::text as orders
  `);
  return {
    ok: true,
    paymentCount: Number(result.rows[0]?.payments ?? "0"),
    orderCount: Number(result.rows[0]?.orders ?? "0"),
  };
}

export async function handleGtmUatBrowserControl(
  req: IncomingMessage,
  res: ServerResponse,
  databaseUrl: string,
  expectedToken: string,
): Promise<void> {
  const presented = req.headers["x-e2e-control-token"];
  const token = Array.isArray(presented) ? presented[0] : presented;
  if (!token || !tokensMatch(token, expectedToken) || (req.method ?? "GET") !== "POST") {
    res.writeHead(404, { "Content-Type": "application/json; charset=utf-8" });
    res.end(JSON.stringify({ ok: false }));
    return;
  }
  let action = "";
  try {
    const parsed = JSON.parse(await readBody(req)) as { action?: unknown };
    action = typeof parsed.action === "string" ? parsed.action : "";
  } catch {
    res.writeHead(400, { "Content-Type": "application/json; charset=utf-8" });
    res.end(JSON.stringify({ ok: false, reason: "BAD_BODY" }));
    return;
  }
  try {
    const result = await withClient(databaseUrl, async (client) => {
      if (action === "mark-first-cart-line-unavailable") return markFirstCartLineUnavailable(client);
      if (action === "drift-sealed-promotion-code") return driftSealedPromotionCode(client);
      if (action === "restore-availability") return restoreAvailability(client);
      if (action === "counts") return counts(client);
      return { ok: false, reason: "UNKNOWN_ACTION" };
    });
    res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
    res.end(JSON.stringify(result));
  } catch (error) {
    const message = error instanceof Error ? error.message : "CONTROL_FAILED";
    res.writeHead(500, { "Content-Type": "application/json; charset=utf-8" });
    res.end(
      JSON.stringify({
        ok: false,
        reason: "CONTROL_FAILED",
        message: message.replace(/postgres(?:ql)?:\/\/\S+/gi, "[redacted]").slice(0, 300),
      }),
    );
  }
}
