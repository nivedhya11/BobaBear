import { describe, expect, it } from "vitest";

import { createStructuredLogger, STANDARD_HTTP_LOG_FIELDS } from "./logger";

describe("createStructuredLogger", () => {
  it("emits allowlisted fields only and honors log level", () => {
    const lines: string[] = [];
    const logger = createStructuredLogger({
      logLevel: "warn",
      allowFields: [...STANDARD_HTTP_LOG_FIELDS],
      service: "test-service",
    });
    const original = console.log;
    console.log = (line?: unknown) => {
      if (typeof line === "string") lines.push(line);
    };
    try {
      logger.info({ requestId: "a", operation: "health_live", secret: "nope" });
      logger.warn({
        requestId: "b",
        operation: "health_ready",
        safeOutcomeCode: "OK",
        httpStatus: 200,
        durationMs: 1,
        password: "hidden",
      });
      expect(lines).toHaveLength(1);
      const payload = JSON.parse(lines[0]!) as Record<string, unknown>;
      expect(payload.level).toBe("warn");
      expect(payload.service).toBe("test-service");
      expect(payload.requestId).toBe("b");
      expect(payload).not.toHaveProperty("password");
      expect(payload).not.toHaveProperty("secret");
    } finally {
      console.log = original;
    }
  });

  it("keeps correlation fields and omits credentials from standard HTTP logs", () => {
    const lines: string[] = [];
    const logger = createStructuredLogger({
      logLevel: "info",
      allowFields: [...STANDARD_HTTP_LOG_FIELDS],
      service: "test-service",
    });
    const original = console.log;
    console.log = (line?: unknown) => {
      if (typeof line === "string") lines.push(line);
    };
    try {
      logger.info({
        requestId: "req-corr",
        operation: { step: "visible-step", sessionToken: "SESSION_SENTINEL_88421" },
        safeOutcomeCode: "OK",
        httpStatus: 204,
        durationMs: 12,
        cookie: "COOKIE_SENTINEL_88421",
        credential: "CREDENTIAL_SENTINEL_88421",
        authorization: "Bearer AUTH_SENTINEL_88421",
        note: "Bearer NOTE_SENTINEL_88421",
      });
      expect(lines).toHaveLength(1);
      const payload = JSON.parse(lines[0]!) as Record<string, unknown>;
      expect(payload.requestId).toBe("req-corr");
      expect(payload.operation).toEqual({
        step: "visible-step",
        sessionToken: "[REDACTED]",
      });
      expect(payload.safeOutcomeCode).toBe("OK");
      expect(payload.httpStatus).toBe(204);
      expect(payload.durationMs).toBe(12);
      expect(payload).not.toHaveProperty("cookie");
      expect(payload).not.toHaveProperty("credential");
      expect(payload).not.toHaveProperty("authorization");
      expect(payload).not.toHaveProperty("note");
      expect(lines[0]).not.toContain("SESSION_SENTINEL_88421");
      expect(lines[0]).not.toContain("COOKIE_SENTINEL_88421");
      expect(lines[0]).not.toContain("CREDENTIAL_SENTINEL_88421");
      expect(lines[0]).not.toContain("AUTH_SENTINEL_88421");
      expect(lines[0]).not.toContain("NOTE_SENTINEL_88421");
    } finally {
      console.log = original;
    }
  });
});
