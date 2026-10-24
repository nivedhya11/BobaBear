/**
 * Loopback-only controls for the disposable customer-ordering E2E database.
 * Not mounted in production services. SQL stays on the database boundary.
 */
import { timingSafeEqual } from "node:crypto";
import type { IncomingMessage, ServerResponse } from "node:http";

import { runGtmUatBrowserControl, type GtmUatControlInput } from "../database/gtm-uat-browser-control-db";

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
