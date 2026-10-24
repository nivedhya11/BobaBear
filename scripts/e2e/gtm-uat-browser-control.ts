/**
 * Loopback-only controls for the disposable customer-ordering E2E database.
 * Not mounted in production services. SQL stays on the database boundary.
 */
import { timingSafeEqual } from "node:crypto";
import type { IncomingMessage, ServerResponse } from "node:http";

import { runGtmUatBrowserControl } from "../database/gtm-uat-browser-control-db";

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
    const result = await runGtmUatBrowserControl(databaseUrl, action);
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
