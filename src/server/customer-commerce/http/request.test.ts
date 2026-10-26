/**
 * Unit tests for customer-commerce JSON body size / shape gates (IMP-024).
 * Complements SEC-UNDICI-ZOD-REMEDIATION request-size evidence.
 */
import { Readable } from "node:stream";
import type { IncomingMessage } from "node:http";

import { describe, expect, it } from "vitest";

import { MAX_JSON_BODY_BYTES, readJsonObjectBody } from "./request";

function makeRequest(
  headers: Record<string, string | string[] | undefined>,
  body?: string | Buffer,
): IncomingMessage {
  const req = new Readable({ read() {} }) as unknown as IncomingMessage;
  (req as unknown as { headers: typeof headers }).headers = headers;
  if (body !== undefined) {
    process.nextTick(() => {
      req.push(typeof body === "string" ? Buffer.from(body, "utf8") : body);
      req.push(null);
    });
  }
  return req;
}

const JSON_HEADERS = { "content-type": "application/json" };

describe("customer-commerce readJsonObjectBody — size / cardinality safety", () => {
  it("rejects a body larger than MAX_JSON_BODY_BYTES", async () => {
    const oversized = `{"note":"${"x".repeat(MAX_JSON_BODY_BYTES)}"}`;
    const result = await readJsonObjectBody(makeRequest(JSON_HEADERS, oversized), ["note"]);
    expect(result).toEqual({ ok: false, reason: "too_large" });
  });

  it("accepts a body at the byte boundary when still valid JSON", async () => {
    const padding = "x".repeat(Math.max(0, MAX_JSON_BODY_BYTES - 20));
    const body = JSON.stringify({ note: padding });
    expect(Buffer.byteLength(body, "utf8")).toBeLessThanOrEqual(MAX_JSON_BODY_BYTES);
    const result = await readJsonObjectBody(makeRequest(JSON_HEADERS, body), ["note"]);
    expect(result.ok).toBe(true);
  });

  it("rejects a top-level array even when under the byte limit", async () => {
    const body = JSON.stringify(Array.from({ length: 100 }, (_, i) => ({ i })));
    expect(Buffer.byteLength(body, "utf8")).toBeLessThan(MAX_JSON_BODY_BYTES);
    const result = await readJsonObjectBody(makeRequest(JSON_HEADERS, body));
    expect(result).toEqual({ ok: false, reason: "invalid_shape" });
  });
});
