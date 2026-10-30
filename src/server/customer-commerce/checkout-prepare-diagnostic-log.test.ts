import { describe, expect, it } from "vitest";

import { createStructuredLogger, STANDARD_HTTP_LOG_FIELDS } from "../../platform/observability";
import { observeNonStructuralCheckoutPrepareRejection } from "../checkout/prepare-diagnostic";
import { createCheckoutPrepareDiagnosticEmitter } from "./checkout-prepare-diagnostic-log";

describe("createCheckoutPrepareDiagnosticEmitter", () => {
  it("emits only allowlisted diagnostic fields via structured logger", () => {
    const lines: string[] = [];
    const logger = createStructuredLogger({
      logLevel: "info",
      allowFields: [
        "requestId",
        "operation",
        "safeOutcomeCode",
        "rejectionStage",
        "firstDifferenceCategory",
        "payableChanged",
      ],
      service: "customer-commerce",
    });
    const original = console.log;
    console.log = (line?: unknown) => {
      if (typeof line === "string") lines.push(line);
    };
    try {
      const emitter = createCheckoutPrepareDiagnosticEmitter({
        logLevel: "info",
        logger,
      });
      emitter.emit({
        requestId: "req-diag-1",
        observation: {
          ...observeNonStructuralCheckoutPrepareRejection("CART_REVISION"),
          couponCode: "TEST123",
          checkoutId: "chk-leak",
          grandTotalPaise: 95240,
        } as ReturnType<typeof observeNonStructuralCheckoutPrepareRejection>,
      });
      expect(lines).toHaveLength(1);
      const payload = JSON.parse(lines[0]!) as Record<string, unknown>;
      expect(payload.requestId).toBe("req-diag-1");
      expect(payload.operation).toBe("checkout_prepare_diagnostic");
      expect(payload.safeOutcomeCode).toBe("CHECKOUT_REPRICED");
      expect(payload.rejectionStage).toBe("CART_REVISION");
      expect(payload).not.toHaveProperty("couponCode");
      expect(payload).not.toHaveProperty("checkoutId");
      expect(payload).not.toHaveProperty("grandTotalPaise");
      expect(payload).not.toHaveProperty("durationMs");
    } finally {
      console.log = original;
    }
  });

  it("standard HTTP logger allowlist still excludes diagnostic categories", () => {
    const lines: string[] = [];
    const httpLogger = createStructuredLogger({
      logLevel: "info",
      allowFields: [...STANDARD_HTTP_LOG_FIELDS],
      service: "customer-commerce",
    });
    const original = console.log;
    console.log = (line?: unknown) => {
      if (typeof line === "string") lines.push(line);
    };
    try {
      httpLogger.info({
        requestId: "req-http",
        operation: "start_payment",
        safeOutcomeCode: "CHECKOUT_REPRICED",
        httpStatus: 409,
        durationMs: 12,
        rejectionStage: "STRUCTURAL",
        firstDifferenceCategory: "PROMOTION_EFFECT",
        payableChanged: false,
      });
      const payload = JSON.parse(lines[0]!) as Record<string, unknown>;
      expect(payload.operation).toBe("start_payment");
      expect(payload).not.toHaveProperty("rejectionStage");
      expect(payload).not.toHaveProperty("firstDifferenceCategory");
      expect(payload).not.toHaveProperty("payableChanged");
    } finally {
      console.log = original;
    }
  });
});
