/**
 * Dedicated allowlisted logger path for checkout prepare diagnostics.
 * Does not widen STANDARD_HTTP_LOG_FIELDS.
 */
import "server-only";

import {
  createStructuredLogger,
  type StructuredLogger,
} from "../../platform/observability";
import {
  buildCheckoutPrepareDiagnosticEvent,
  CHECKOUT_PREPARE_DIAGNOSTIC_LOG_FIELDS,
  type CheckoutPrepareDiagnosticObservation,
} from "../checkout/prepare-diagnostic";

export type CheckoutPrepareDiagnosticEmitter = Readonly<{
  emit(input: {
    requestId: string;
    observation: CheckoutPrepareDiagnosticObservation;
  }): void;
}>;

export function createCheckoutPrepareDiagnosticEmitter(options: {
  logLevel: import("../../platform/config").LogLevel;
  logger?: StructuredLogger;
}): CheckoutPrepareDiagnosticEmitter {
  const logger =
    options.logger ??
    createStructuredLogger({
      logLevel: options.logLevel,
      allowFields: [...CHECKOUT_PREPARE_DIAGNOSTIC_LOG_FIELDS],
      service: "customer-commerce",
    });

  return Object.freeze({
    emit(input) {
      const event = buildCheckoutPrepareDiagnosticEvent(input);
      // Cast through Record so allowlist pick keeps only declared fields even
      // if a future edit accidentally spreads extra properties onto `event`.
      const payload: Record<string, unknown> = { ...event };
      logger.info(payload);
    },
  });
}

/**
 * Builds a per-request observer that binds the server-generated requestId.
 * Never accepts a caller-controlled requestId from the HTTP body.
 */
export function createCheckoutPrepareDiagnosticObserver(input: {
  requestId: string;
  emitter: CheckoutPrepareDiagnosticEmitter;
}): (observation: CheckoutPrepareDiagnosticObservation) => void {
  const { requestId, emitter } = input;
  return (observation) => {
    emitter.emit({ requestId, observation });
  };
}
