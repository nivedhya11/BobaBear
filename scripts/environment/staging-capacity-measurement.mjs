/**
 * Independently measured staging capacity inputs (AD-PF-02).
 *
 * Live collectors must not invent footprint or peak-memory figures. This module
 * loads an auditable measurement record bound to the authorized environment and
 * returns null measurements when absent, stale, or invalid.
 */
import { existsSync, readFileSync } from "node:fs";

import { STAGING_AUTHORIZED_ENVIRONMENT } from "./staging-founder-authorization.mjs";

export const STAGING_CAPACITY_MEASUREMENT_SCHEMA = "boba-staging-capacity-measurement-v1";

export const DEFAULT_STAGING_CAPACITY_MEASUREMENT_PATH =
  "/home/ajoshi/.local/state/boba-bear/staging-capacity-measurement.json";

/** Measurement records older than this are refused (fail closed). */
export const STAGING_CAPACITY_MEASUREMENT_MAX_AGE_MS = 24 * 60 * 60 * 1000;

export const STAGING_CAPACITY_OPERATION_CLASSES = Object.freeze([
  "PHASE_A_POSTGRES_PROVISION",
  "FULL_CANDIDATE_BUILD",
  "PHASE_B_DEPLOY",
]);

/**
 * @param {unknown} value
 * @returns {value is Record<string, unknown>}
 */
function isObject(value) {
  return value != null && typeof value === "object" && !Array.isArray(value);
}

/**
 * @param {unknown} raw
 * @param {{
 *   now?: Date,
 *   expectedEnvironment?: typeof STAGING_AUTHORIZED_ENVIRONMENT,
 *   maxAgeMs?: number,
 *   expectedOperationClass?: string | null,
 * }} [options]
 */
export function evaluateStagingCapacityMeasurement(raw, options = {}) {
  const now = options.now instanceof Date ? options.now : new Date();
  const expected = options.expectedEnvironment ?? STAGING_AUTHORIZED_ENVIRONMENT;
  const maxAgeMs = options.maxAgeMs ?? STAGING_CAPACITY_MEASUREMENT_MAX_AGE_MS;
  const expectedOperationClass =
    typeof options.expectedOperationClass === "string" ? options.expectedOperationClass : null;

  if (!isObject(raw)) {
    return {
      present: false,
      valid: false,
      measuredIncrementalBuildFootprintBytes: null,
      measuredIncrementalPeakMemoryBytes: null,
      reasons: ["CAPACITY_MEASUREMENT_ABSENT"],
    };
  }

  /** @type {string[]} */
  const reasons = [];
  if (raw.schemaVersion !== STAGING_CAPACITY_MEASUREMENT_SCHEMA) {
    reasons.push("CAPACITY_MEASUREMENT_SCHEMA_INVALID");
  }
  if (raw.attestation !== "INDEPENDENT_HOST_MEASUREMENT") {
    reasons.push("CAPACITY_MEASUREMENT_ATTESTATION_MISSING");
  }
  if (
    typeof raw.operationClass !== "string" ||
    !STAGING_CAPACITY_OPERATION_CLASSES.includes(raw.operationClass)
  ) {
    reasons.push("CAPACITY_MEASUREMENT_OPERATION_CLASS_INVALID");
  } else if (expectedOperationClass && raw.operationClass !== expectedOperationClass) {
    reasons.push("CAPACITY_MEASUREMENT_OPERATION_CLASS_MISMATCH");
  }
  if (typeof raw.measurementMethod !== "string" || raw.measurementMethod.trim().length < 8) {
    reasons.push("CAPACITY_MEASUREMENT_METHOD_MISSING");
  }

  const measuredAtMs = typeof raw.measuredAt === "string" ? Date.parse(raw.measuredAt) : NaN;
  if (!Number.isFinite(measuredAtMs)) {
    reasons.push("CAPACITY_MEASUREMENT_TIME_INVALID");
  } else if (now.getTime() - measuredAtMs > maxAgeMs || measuredAtMs - now.getTime() > 2 * 60 * 1000) {
    reasons.push("CAPACITY_MEASUREMENT_STALE_OR_FUTURE");
  }

  const env = isObject(raw.authorizedEnvironment) ? raw.authorizedEnvironment : null;
  if (!env) {
    reasons.push("CAPACITY_MEASUREMENT_ENVIRONMENT_MISSING");
  } else if (
    env.repositoryPath !== expected.repositoryPath ||
    env.composeProject !== expected.composeProject
  ) {
    reasons.push("CAPACITY_MEASUREMENT_ENVIRONMENT_MISMATCH");
  }

  const footprint = raw.measuredIncrementalBuildFootprintBytes;
  const peak = raw.measuredIncrementalPeakMemoryBytes;
  if (typeof footprint !== "number" || !Number.isFinite(footprint) || footprint < 0) {
    reasons.push("CAPACITY_MEASUREMENT_FOOTPRINT_INVALID");
  }
  if (typeof peak !== "number" || !Number.isFinite(peak) || peak < 0) {
    reasons.push("CAPACITY_MEASUREMENT_PEAK_INVALID");
  }

  const valid = reasons.length === 0;
  return {
    present: true,
    valid,
    measuredIncrementalBuildFootprintBytes: valid ? footprint : null,
    measuredIncrementalPeakMemoryBytes: valid ? peak : null,
    operationClass: valid ? raw.operationClass : null,
    measuredAt: valid ? raw.measuredAt : null,
    measurementMethod: valid ? raw.measurementMethod : null,
    reasons,
  };
}

/**
 * @param {{
 *   measurementPath?: string,
 *   exists?: (path: string) => boolean,
 *   readFile?: (path: string, encoding: string) => string,
 *   now?: Date,
 *   expectedEnvironment?: typeof STAGING_AUTHORIZED_ENVIRONMENT,
 *   expectedOperationClass?: string | null,
 * }} [deps]
 */
export function loadStagingCapacityMeasurement(deps = {}) {
  const measurementPath = deps.measurementPath ?? DEFAULT_STAGING_CAPACITY_MEASUREMENT_PATH;
  const exists = deps.exists ?? existsSync;
  const readFile = deps.readFile ?? readFileSync;
  if (!exists(measurementPath)) {
    return {
      ...evaluateStagingCapacityMeasurement(null, {
        expectedOperationClass: deps.expectedOperationClass,
      }),
      path: measurementPath,
    };
  }
  try {
    const raw = JSON.parse(readFile(measurementPath, "utf8"));
    return {
      ...evaluateStagingCapacityMeasurement(raw, {
        now: deps.now,
        expectedEnvironment: deps.expectedEnvironment,
        expectedOperationClass: deps.expectedOperationClass,
      }),
      path: measurementPath,
    };
  } catch (error) {
    return {
      present: true,
      valid: false,
      measuredIncrementalBuildFootprintBytes: null,
      measuredIncrementalPeakMemoryBytes: null,
      reasons: ["CAPACITY_MEASUREMENT_UNREADABLE"],
      detail: error instanceof Error ? error.message : "measurement unreadable",
      path: measurementPath,
    };
  }
}
