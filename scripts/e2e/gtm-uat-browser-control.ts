/**
 * Loopback-only controls for the disposable customer-ordering E2E database.
 * Not mounted in production services. SQL stays on the database boundary.
 */
import { timingSafeEqual } from "node:crypto";
import { spawnSync } from "node:child_process";
import type { IncomingMessage, ServerResponse } from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { runGtmUatBrowserControl, type GtmUatControlInput } from "../database/gtm-uat-browser-control-db";
import { evaluateSyntheticComplimentaryDefinitions } from "./evaluate-competing-complimentary";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");

function armM2ViaChild(databaseUrl: string, scenario: string): Record<string, unknown> {
  return runM2Child(databaseUrl, [scenario]);
}

function markGiftViaChild(databaseUrl: string, variantId: string): Record<string, unknown> {
  return runM2Child(databaseUrl, ["mark-gift", variantId]);
}

function seedCapViaChild(
  databaseUrl: string,
  couponCode: string,
  phone: string,
): Record<string, unknown> {
  return runM2Child(databaseUrl, ["seed-cap", couponCode, phone]);
}

function runM2Child(databaseUrl: string, args: string[]): Record<string, unknown> {
  const result = spawnSync(
    process.execPath,
    [
      "--conditions=react-server",
      "--import",
      "tsx",
      path.join(projectRoot, "scripts/database/gtm-uat-m2-scenarios.ts"),
      ...args,
    ],
    {
      cwd: projectRoot,
      env: {
        ...process.env,
        BOBA_BEAR_ENV: "test",
        M2_DATABASE_URL: databaseUrl,
      },
      encoding: "utf8",
      timeout: 120_000,
    },
  );
  const line = (result.stdout ?? "").trim().split("\n").filter(Boolean).at(-1) ?? "";
  try {
    return JSON.parse(line) as Record<string, unknown>;
  } catch {
    const detail = `${result.stderr ?? ""} ${result.error?.message ?? ""}`
      .replace(/postgres(?:ql)?:\/\/\S+/gi, "[redacted]")
      .slice(0, 300);
    return { ok: false, mutated: 0, reason: "M2_SCENARIO_FAILED", message: detail || "no json" };
  }
}

const PUBLIC_CONTROL_TOKEN = "gtm-uat-browser-control";

export function isLoopbackAddress(address: string | undefined): boolean {
  return address === "127.0.0.1" || address === "::1" || address === "::ffff:127.0.0.1";
}

export function isUsableControlToken(token: string): boolean {
  return token.length >= 32 && token !== PUBLIC_CONTROL_TOKEN;
}

function tokensMatch(presented: string, expected: string): boolean {
  const left = Buffer.from(presented);
  const right = Buffer.from(expected);
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

function deny(res: ServerResponse): void {
  res.writeHead(404, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify({ ok: false }));
}

function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    let size = 0;
    req.on("data", (chunk: Buffer) => {
      size += chunk.length;
      if (size > 8_192) {
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

export async function handleGtmUatBrowserControl(
  req: IncomingMessage,
  res: ServerResponse,
  options: Readonly<{
    databaseUrl: string;
    expectedToken: string;
    expectedRunId: string;
    testMode: boolean;
  }>,
): Promise<void> {
  const remote = req.socket.remoteAddress;
  const presented = req.headers["x-e2e-control-token"];
  const token = Array.isArray(presented) ? presented[0] : presented;
  if (
    !options.testMode ||
    !isLoopbackAddress(remote) ||
    (req.method ?? "GET") !== "POST" ||
    !isUsableControlToken(options.expectedToken) ||
    !token ||
    !tokensMatch(token, options.expectedToken)
  ) {
    deny(res);
    return;
  }
  if (
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      options.expectedRunId,
    )
  ) {
    deny(res);
    return;
  }

  let input: GtmUatControlInput = {};
  try {
    const parsed = JSON.parse(await readBody(req)) as unknown;
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
      res.writeHead(400, { "Content-Type": "application/json; charset=utf-8" });
      res.end(JSON.stringify({ ok: false, mutated: 0, reason: "BAD_BODY" }));
      return;
    }
    input = parsed as GtmUatControlInput;
  } catch {
    res.writeHead(400, { "Content-Type": "application/json; charset=utf-8" });
    res.end(JSON.stringify({ ok: false, mutated: 0, reason: "BAD_BODY" }));
    return;
  }

  const presentedRunId = typeof input.runId === "string" ? input.runId : "";
  if (!presentedRunId || !tokensMatch(presentedRunId, options.expectedRunId)) {
    res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
    res.end(JSON.stringify({ ok: false, mutated: 0, reason: "RUN_MISMATCH" }));
    return;
  }

  if (input.action === "evaluate-competing-complimentary") {
    const evaluated = evaluateSyntheticComplimentaryDefinitions(2);
    res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
    res.end(JSON.stringify(evaluated));
    return;
  }

  if (input.action === "arm-m2") {
    const scenario = typeof input.scenario === "string" ? input.scenario : "";
    const armed = armM2ViaChild(options.databaseUrl, scenario);
    res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
    res.end(JSON.stringify(armed));
    return;
  }

  if (input.action === "mark-gift-unavailable") {
    const variantId = typeof input.variantId === "string" ? input.variantId : "";
    const marked = markGiftViaChild(options.databaseUrl, variantId);
    res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
    res.end(JSON.stringify(marked));
    return;
  }

  if (input.action === "seed-cap-claim") {
    const couponCode = typeof input.couponCode === "string" ? input.couponCode : "";
    const phone = typeof input.phone === "string" ? input.phone : "";
    const seeded = seedCapViaChild(options.databaseUrl, couponCode, phone);
    res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
    res.end(JSON.stringify(seeded));
    return;
  }

  try {
    const result = await runGtmUatBrowserControl(options.databaseUrl, input, options.expectedRunId);
    res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
    res.end(JSON.stringify(result));
  } catch (error) {
    const message = error instanceof Error ? error.message : "CONTROL_FAILED";
    const redacted = [options.expectedToken, options.expectedRunId].reduce((value, secret) => {
      if (secret.length < 8) return value;
      return value.split(secret).join("[redacted]");
    }, message);
    res.writeHead(500, { "Content-Type": "application/json; charset=utf-8" });
    res.end(
      JSON.stringify({
        ok: false,
        mutated: 0,
        reason: "CONTROL_FAILED",
        message: redacted.replace(/postgres(?:ql)?:\/\/\S+/gi, "[redacted]").slice(0, 300),
      }),
    );
  }
}
