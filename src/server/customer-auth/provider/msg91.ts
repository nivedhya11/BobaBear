/**
 * Inactive MSG91 SendOTP candidate (offline only).
 *
 * The current MSG91 Verify OTP contract is GET
 * `https://control.msg91.com/api/v5/otp/verify` with `otp` and `mobile` in
 * the query string. SendOTP places `mobile` in the query string. Resend OTP
 * places `authkey` in the query string. No HTTPS POST body alternative is
 * documented for Verify. This module refuses those transports and never
 * calls `fetch`. It is not selected by `createCustomerOtpProvider`.
 *
 * Vendor OTP generation, expiry, and verification state stay vendor-managed
 * on the documented contract. This adapter does not store OTPs, invent
 * challenge ids, or transmit the BOBA-generated placeholder code.
 *
 * Sources (fetched for this candidate, not called):
 * - https://docs.msg91.com/otp/sendotp.openapi.yml
 * - https://docs.msg91.com/otp/verify-otp.openapi.yml
 * - https://docs.msg91.com/otp/resend-otp.openapi.yml
 */
import type { AppEnvironment } from "../../../platform/config";
import { CustomerOtpProviderError } from "../errors";
import {
  CUSTOMER_OTP_EXPIRES_IN_SECONDS,
  CUSTOMER_OTP_LENGTH,
  type CustomerOtpCheckResult,
  type CustomerOtpProvider,
  type CustomerOtpStartResult,
} from "./types";

export const MSG91_LIVE_ACTIVATION = "NOT_AUTHORIZED" as const;
export const MSG91_SELECTED_BY_FACTORY = false;

/** BOBA requirements. Vendor defaults are 4 digits and 15 minutes. */
export const MSG91_REQUESTED_OTP_LENGTH = CUSTOMER_OTP_LENGTH;
export const MSG91_REQUESTED_OTP_EXPIRY_MINUTES = CUSTOMER_OTP_EXPIRES_IN_SECONDS / 60;
export const MSG91_DOCUMENTED_DEFAULT_OTP_LENGTH = 4;
export const MSG91_DOCUMENTED_DEFAULT_EXPIRY_MINUTES = 15;

export const MSG91_SEND_OTP_URL = "https://control.msg91.com/api/v5/otp";
export const MSG91_VERIFY_OTP_URL = "https://control.msg91.com/api/v5/otp/verify";
export const MSG91_RESEND_OTP_URL = "https://control.msg91.com/api/v5/otp/retry";

export const MSG91_DOCUMENTED_VERIFY_METHOD = "GET" as const;
export const MSG91_VERIFY_POST_BODY_ALTERNATIVE = "NOT_DOCUMENTED" as const;
export const MSG91_VERIFY_ATTEMPT_CAP = "UNVERIFIED" as const;
/** Resend OTP retries the same code. A new SendOTP superseding it is not documented. */
export const MSG91_RESEND_SEMANTICS = "SAME_OTP_DOCUMENTED_SUPERSESSION_UNVERIFIED" as const;
export const MSG91_DOCUMENTED_RESEND_RETRY_LIMIT = 2;
export const MSG91_GLOBAL_SPEND_CONTROL = "DECISION_REQUIRED" as const;

const SENSITIVE_QUERY_NAMES = new Set(["otp", "authkey", "mobile"]);

export type Msg91TransportOperation = "send" | "verify" | "resend";

export type Msg91TransportBlock =
  | "missing_credential"
  | "missing_dlt_identity"
  | "unsafe_endpoint"
  | "sensitive_query"
  | "verify_query_otp_no_post_alternative"
  | "send_query_mobile_no_body_alternative"
  | "resend_query_authkey";

export type InactiveMsg91CustomerOtpProviderOptions = Readonly<{
  environmentType: AppEnvironment;
  authkey: string | null;
  dltPrincipalEntityId: string | null;
  dltHeader: string | null;
  dltTemplateId: string | null;
  /** Override only in tests. Production selection is still refused. */
  endpoint?: string;
  /** Injected so tests can prove this candidate never performs network I/O. */
  fetchImpl?: typeof fetch;
}>;

function blank(value: string | null | undefined): boolean {
  return value === null || value === undefined || value.trim().length === 0;
}

function endpointHasSensitiveQuery(endpoint: string): boolean {
  let url: URL;
  try {
    url = new URL(endpoint);
  } catch {
    return false;
  }
  for (const name of url.searchParams.keys()) {
    if (SENSITIVE_QUERY_NAMES.has(name.toLowerCase())) return true;
  }
  return false;
}

function endpointIsUnsafe(endpoint: string): boolean {
  let url: URL;
  try {
    url = new URL(endpoint);
  } catch {
    return true;
  }
  if (url.protocol !== "https:") return true;
  if (url.username.length > 0 || url.password.length > 0) return true;
  return false;
}

/**
 * Decide whether a MSG91 call may be dispatched. Documented Send, Verify,
 * and Resend operations are always blocked: each one requires a sensitive
 * value in the URL, and Verify has no documented POST body alternative.
 */
export function assessMsg91Transport(
  input: Readonly<{
    operation: Msg91TransportOperation;
    endpoint: string;
    authkey: string | null;
    dltPrincipalEntityId: string | null;
    dltHeader: string | null;
    dltTemplateId: string | null;
  }>,
): { ok: false; block: Msg91TransportBlock } {
  if (blank(input.authkey)) return { ok: false, block: "missing_credential" };
  if (
    blank(input.dltPrincipalEntityId) ||
    blank(input.dltHeader) ||
    blank(input.dltTemplateId)
  ) {
    return { ok: false, block: "missing_dlt_identity" };
  }
  if (endpointIsUnsafe(input.endpoint)) return { ok: false, block: "unsafe_endpoint" };
  if (endpointHasSensitiveQuery(input.endpoint)) {
    return { ok: false, block: "sensitive_query" };
  }
  if (input.operation === "verify") {
    return { ok: false, block: "verify_query_otp_no_post_alternative" };
  }
  if (input.operation === "send") {
    return { ok: false, block: "send_query_mobile_no_body_alternative" };
  }
  return { ok: false, block: "resend_query_authkey" };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * Map a Verify OTP HTTP result onto the existing provider outcomes.
 * Unknown, timeout, and server-failure results stay `unavailable` so they
 * are not treated as a wrong code. This function does not perform I/O.
 * The provider does not approve from it while transport is blocked.
 */
export function classifyMsg91VerifyHttpResult(
  input: Readonly<{ httpStatus: number; body: unknown }>,
): CustomerOtpCheckResult {
  if (input.httpStatus === 401 || input.httpStatus >= 500 || input.httpStatus === 0) {
    return { outcome: "unavailable" };
  }
  if (input.httpStatus !== 200 || !isRecord(input.body)) {
    return { outcome: "unavailable" };
  }
  const { type, message } = input.body;
  if (type === "success" && message === "OTP verified success") {
    return { outcome: "approved" };
  }
  if (type === "error" && message === "OTP not match") {
    return { outcome: "invalid" };
  }
  if (type === "error" && message === "OTP expired") {
    return { outcome: "expired" };
  }
  return { outcome: "unavailable" };
}

export function classifyMsg91TransportFailure(
  kind: "timeout" | "non_json" | "malformed",
): CustomerOtpCheckResult {
  switch (kind) {
    case "timeout":
    case "non_json":
    case "malformed":
      return { outcome: "unavailable" };
    default: {
      const unexpected: never = kind;
      return unexpected;
    }
  }
}

function defaultEndpoint(operation: Msg91TransportOperation): string {
  if (operation === "verify") return MSG91_VERIFY_OTP_URL;
  if (operation === "resend") return MSG91_RESEND_OTP_URL;
  return MSG91_SEND_OTP_URL;
}

export function createInactiveMsg91CustomerOtpProvider(
  options: InactiveMsg91CustomerOtpProviderOptions,
): CustomerOtpProvider & {
  readonly activation: typeof MSG91_LIVE_ACTIVATION;
} {
  void options.environmentType;
  // Accepted so tests can inject a failing fetch and prove it is never called.
  void options.fetchImpl;
  let closed = false;

  function assertOpen(): void {
    if (closed) {
      throw new CustomerOtpProviderError(
        "Inactive MSG91 customer OTP provider has already been closed.",
        "CUSTOMER_OTP_PROVIDER_CLOSED",
      );
    }
  }

  function refuse(operation: Msg91TransportOperation): Msg91TransportBlock {
    return assessMsg91Transport({
      operation,
      endpoint: options.endpoint ?? defaultEndpoint(operation),
      authkey: options.authkey,
      dltPrincipalEntityId: options.dltPrincipalEntityId,
      dltHeader: options.dltHeader,
      dltTemplateId: options.dltTemplateId,
    }).block;
  }

  const provider: CustomerOtpProvider = {
    kind: "production",

    async startVerification(input): Promise<CustomerOtpStartResult> {
      assertOpen();
      void input.generatedCode;
      void input.phoneNumber;
      void input.now;
      void input.expiresAt;
      void refuse("send");
      return { outcome: "unavailable" };
    },

    async checkVerification(input): Promise<CustomerOtpCheckResult> {
      assertOpen();
      void input.code;
      void input.phoneNumber;
      void input.now;
      void refuse("verify");
      return { outcome: "unavailable" };
    },

    async checkReadiness(): Promise<void> {
      assertOpen();
      throw new CustomerOtpProviderError(
        "No approved production customer OTP provider adapter is configured.",
        "CUSTOMER_OTP_PRODUCTION_PROVIDER_UNAVAILABLE",
      );
    },

    async close(): Promise<void> {
      closed = true;
    },
  };

  return {
    ...provider,
    activation: MSG91_LIVE_ACTIVATION,
  };
}
