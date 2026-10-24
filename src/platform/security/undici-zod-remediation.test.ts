/**
 * SEC-UNDICI-ZOD-REMEDIATION evidence:
 * - every installed undici/zod copy is on a patched version
 * - Zod rejects oversized constrained collections before element parsing
 * - commerce request body byte limit rejects oversized externally supplied JSON
 */
import { readFileSync } from "node:fs";
import path from "node:path";
import { Readable } from "node:stream";
import type { IncomingMessage } from "node:http";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";
import { z } from "zod";

import {
  MAX_JSON_BODY_BYTES,
  readJsonObjectBody,
} from "../../server/customer-commerce/http/request";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");

type LockPackage = {
  version?: string;
};

function installedCopies(packageName: string): Array<{ path: string; version: string }> {
  const lock = JSON.parse(readFileSync(path.join(repoRoot, "package-lock.json"), "utf8")) as {
    packages?: Record<string, LockPackage>;
  };
  const out: Array<{ path: string; version: string }> = [];
  for (const [pkgPath, meta] of Object.entries(lock.packages ?? {})) {
    const leaf = pkgPath.includes("node_modules/")
      ? pkgPath.slice(pkgPath.lastIndexOf("node_modules/") + "node_modules/".length)
      : pkgPath;
    if (leaf === packageName && typeof meta.version === "string") {
      out.push({ path: pkgPath || "(root)", version: meta.version });
    }
  }
  return out;
}

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

describe("SEC-UNDICI-ZOD-REMEDIATION — installed copies", () => {
  it("pins every undici install to a patched 7.x or 8.x release", () => {
    const copies = installedCopies("undici");
    expect(copies.length).toBeGreaterThan(0);
    for (const copy of copies) {
      const [major, minor, patch] = copy.version.split(".").map(Number);
      if (major === 7) {
        expect(
          minor > 30 || (minor === 30 && patch >= 1),
          `${copy.path} undici@${copy.version} must be >= 7.30.1`,
        ).toBe(true);
      } else if (major === 8) {
        expect(
          minor > 12 || (minor === 12 && patch >= 2),
          `${copy.path} undici@${copy.version} must be >= 8.12.2`,
        ).toBe(true);
      } else {
        throw new Error(`unexpected undici major at ${copy.path}: ${copy.version}`);
      }
    }
  });

  it("pins every zod install to >= 4.6.6", () => {
    const copies = installedCopies("zod");
    expect(copies.length).toBeGreaterThan(0);
    for (const copy of copies) {
      const [major, minor, patch] = copy.version.split(".").map(Number);
      expect(major).toBe(4);
      expect(
        minor > 6 || (minor === 6 && patch >= 6),
        `${copy.path} zod@${copy.version} must be >= 4.6.6`,
      ).toBe(true);
    }
  });
});

describe("SEC-UNDICI-ZOD-REMEDIATION — Zod collection cardinality", () => {
  it("rejects an oversized constrained array before validating elements", () => {
    const schema = z.array(z.string().uuid()).max(8);
    const oversized = Array.from({ length: 50_000 }, () => "not-a-uuid");
    const started = Date.now();
    const result = schema.safeParse(oversized);
    const elapsedMs = Date.now() - started;

    expect(result.success).toBe(false);
    // Bound check must short-circuit; element-by-element issue accumulation would be far slower.
    expect(elapsedMs).toBeLessThan(2_000);
    if (!result.success) {
      expect(result.error.issues.length).toBeLessThan(20);
    }
  });
});

describe("SEC-UNDICI-ZOD-REMEDIATION — commerce request size", () => {
  it("rejects JSON bodies larger than MAX_JSON_BODY_BYTES before application parse", async () => {
    const oversized = `{"items":${JSON.stringify(Array(MAX_JSON_BODY_BYTES).fill("x"))}}`;
    expect(Buffer.byteLength(oversized, "utf8")).toBeGreaterThan(MAX_JSON_BODY_BYTES);
    const result = await readJsonObjectBody(
      makeRequest({ "content-type": "application/json" }, oversized),
      ["items"],
    );
    expect(result).toEqual({ ok: false, reason: "too_large" });
  });
});
