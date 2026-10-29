/**
 * Strict-staging configuration projection.
 *
 * File presence is not validity. The shipped TLS termination allowlist is empty,
 * so a live projection cannot become VALID until a Founder-approved token exists.
 * Local-development defaults are not rewritten into this projection.
 */
import { readFileSync } from "node:fs";
import path from "node:path";

/** Empty until the Founder names one verified TLS termination token. */
export const STAGING_TLS_TERMINATION_ALLOWLIST = Object.freeze([]);

const REQUIRED_FILES = Object.freeze([
  ".env.runtime.docker.local",
  ".env.customer-auth.docker.local",
  ".env.workforce-auth.docker.local",
  ".env.customer-commerce.docker.local",
  ".env.operations.docker.local",
]);

const LOOPBACK = new Set(["localhost", "127.0.0.1", "::1", "[::1]"]);

function parseEnv(content) {
  /** @type {Record<string, string>} */
  const values = {};
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (trimmed.length === 0 || trimmed.startsWith("#")) continue;
    const index = trimmed.indexOf("=");
    if (index <= 0) continue;
    values[trimmed.slice(0, index)] = trimmed.slice(index + 1);
  }
  return values;
}

function readLayer(dir, fileName) {
  return parseEnv(readFileSync(path.join(dir, fileName), "utf8"));
}

/**
 * Canonical `scheme://host[:port]` or null. Does not invent a hostname.
 * @param {string | undefined} raw
 */
export function canonicalOrigin(raw) {
  if (typeof raw !== "string" || raw.length === 0) return null;
  let url;
  try {
    url = new URL(raw);
  } catch {
    return null;
  }
  if (url.username !== "" || url.password !== "") return null;
  if (url.pathname !== "/" && url.pathname !== "") return null;
  if (url.search !== "" || url.hash !== "") return null;
  if (url.protocol !== "https:" && url.protocol !== "http:") return null;
  return `${url.protocol}//${url.host}`;
}

function originParts(raw) {
  const canonical = canonicalOrigin(raw);
  if (!canonical) return null;
  const url = new URL(canonical);
  return {
    canonical,
    protocol: url.protocol,
    hostname: url.hostname.toLowerCase(),
    port: url.port,
  };
}

function isIpHostname(hostname) {
  return /^\d{1,3}(\.\d{1,3}){3}$/.test(hostname) || hostname.includes(":");
}

/**
 * Classify a Razorpay key id without returning the key.
 * @param {string | undefined} keyId
 * @returns {"missing"|"test"|"live"|"ambiguous"}
 */
export function classifyRazorpayKeyId(keyId) {
  if (typeof keyId !== "string" || keyId.length === 0) return "missing";
  if (/^rzp_test_[A-Za-z0-9]+$/.test(keyId)) return "test";
  if (/^rzp_live_[A-Za-z0-9]+$/.test(keyId)) return "live";
  return "ambiguous";
}

function paymentIsolation(values) {
  const selector = values.BOBA_BEAR_PAYMENT_PROVIDER;
  if (selector === undefined || selector.length === 0) return "AMBIGUOUS";
  if (selector === "disabled") return "DISABLED";
  if (selector !== "razorpay") return "AMBIGUOUS";
  const keyClass = classifyRazorpayKeyId(values.BOBA_BEAR_RAZORPAY_KEY_ID);
  if (keyClass === "test") {
    const secret = values.BOBA_BEAR_RAZORPAY_KEY_SECRET;
    const webhook = values.BOBA_BEAR_RAZORPAY_WEBHOOK_SECRET;
    if (typeof secret !== "string" || secret.length < 8 || typeof webhook !== "string" || webhook.length < 8) {
      return "AMBIGUOUS";
    }
    return "TEST";
  }
  if (keyClass === "live") return "LIVE_REJECTED";
  return "AMBIGUOUS";
}

/**
 * @param {{
 *   directory: string,
 *   allowlist?: readonly string[],
 *   readFile?: (file: string) => string,
 * }} input
 */
export function projectStrictStagingConfiguration(input) {
  const allowlist = input.allowlist ?? STAGING_TLS_TERMINATION_ALLOWLIST;
  /** @type {string[]} */
  const reasons = [];
  /** @type {Record<string, string>} */
  const values = {};
  try {
    for (const fileName of REQUIRED_FILES) {
      const content = input.readFile
        ? input.readFile(fileName)
        : readFileSync(path.join(input.directory, fileName), "utf8");
      Object.assign(values, parseEnv(content));
    }
  } catch {
    return {
      projectedConfigState: "UNKNOWN",
      projectedConfigValid: false,
      publicOrigin: null,
      paymentIsolation: "UNKNOWN",
      unsafeAdaptersExplicitlyFalse: false,
      bobaBearEnvDrift: null,
      reasons: ["STRICT_STAGING_ENV_UNREADABLE"],
    };
  }

  const publicOrigin = originParts(values.BOBA_BEAR_PUBLIC_ORIGIN);
  const authorized = originParts(values.BOBA_BEAR_AUTHORIZED_STAGING_ORIGIN);
  const customer = originParts(values.CUSTOMER_AUTH_BASE_URL);
  const workforce = originParts(values.WORKFORCE_AUTH_BASE_URL);
  const shared =
    publicOrigin &&
    authorized &&
    customer &&
    workforce &&
    publicOrigin.canonical === authorized.canonical &&
    publicOrigin.canonical === customer.canonical &&
    publicOrigin.canonical === workforce.canonical
      ? publicOrigin
      : null;

  if (!shared) reasons.push("STRICT_STAGING_ORIGIN_MISMATCH");
  if (shared && (shared.protocol !== "https:" || LOOPBACK.has(shared.hostname) || isIpHostname(shared.hostname) || shared.hostname.endsWith(".local"))) {
    reasons.push("STRICT_STAGING_ORIGIN_NOT_PUBLIC_HTTPS");
  }
  if (shared && shared.port !== "" && shared.port !== "443") reasons.push("STRICT_STAGING_ORIGIN_PORT");
  if (values.BOBA_BEAR_ENV !== "staging") reasons.push("BOBA_BEAR_ENV_NOT_STAGING");
  if (values.NODE_ENV !== "production") reasons.push("NODE_ENV_NOT_PRODUCTION");
  if (values.BOBA_BEAR_ALLOW_UNSAFE_ADAPTERS !== "false") reasons.push("UNSAFE_ADAPTERS_NOT_EXPLICITLY_FALSE");
  if (typeof values.BOBA_BEAR_RELEASE !== "string" || values.BOBA_BEAR_RELEASE.length === 0 || /\s/.test(values.BOBA_BEAR_RELEASE)) {
    reasons.push("RELEASE_MISSING");
  }
  for (const key of [
    "CUSTOMER_AUTH_TRUST_PROXY_HOPS",
    "WORKFORCE_AUTH_TRUST_PROXY_HOPS",
    "CUSTOMER_COMMERCE_TRUST_PROXY_HOPS",
  ]) {
    if (values[key] !== "1") reasons.push("TRUST_PROXY_HOPS_NOT_ONE");
  }
  const isolation = paymentIsolation(values);
  if (isolation !== "DISABLED" && isolation !== "TEST") reasons.push("PAYMENT_ISOLATION_UNVERIFIED");
  const token = values.BOBA_BEAR_STAGING_TLS_TERMINATION;
  if (typeof token !== "string" || token.length === 0) {
    reasons.push("TLS_TERMINATION_UNCONFIGURED");
  } else if (!allowlist.includes(token)) {
    reasons.push("TLS_TERMINATION_UNAPPROVED");
  }

  const valid = reasons.length === 0;
  return {
    projectedConfigState: valid ? "VALID" : "INVALID",
    projectedConfigValid: valid,
    publicOrigin: shared?.canonical ?? null,
    paymentIsolation: isolation,
    unsafeAdaptersExplicitlyFalse: values.BOBA_BEAR_ALLOW_UNSAFE_ADAPTERS === "false",
    bobaBearEnvDrift: values.BOBA_BEAR_ENV !== "staging",
    reasons,
  };
}

export { REQUIRED_FILES as STRICT_STAGING_ENV_FILES, readLayer };
