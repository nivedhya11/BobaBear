/**
 * Offline tests for the inactive MSG91 OTP candidate.
 *
 * No network, no database, no SMS. Mocked response fixtures are classified
 * in memory. The provider refuses the documented query-string transport and
 * must not call fetch.
 */
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

import type { E164IndianMobileNumber } from "../../../shared/customer-auth/phone";
import { CustomerOtpProviderError } from "../errors";
import { CUSTOMER_OTP_RATE_LIMIT_RULES } from "../rate-limit/types";
import { createCustomerOtpProvider } from "./factory";
import { createLocalCustomerOtpProvider } from "./local";
import {
  MSG91_DOCUMENTED_DEFAULT_EXPIRY_MINUTES,
  MSG91_DOCUMENTED_DEFAULT_OTP_LENGTH,
  MSG91_DOCUMENTED_RESEND_RETRY_LIMIT,
  MSG91_DOCUMENTED_VERIFY_METHOD,
  MSG91_GLOBAL_SPEND_CONTROL,
  MSG91_LIVE_ACTIVATION,
  MSG91_REQUESTED_OTP_EXPIRY_MINUTES,
  MSG91_REQUESTED_OTP_LENGTH,
  MSG91_RESEND_OTP_URL,
  MSG91_RESEND_SEMANTICS,
  MSG91_SELECTED_BY_FACTORY,
  MSG91_SEND_OTP_URL,
  MSG91_VERIFY_ATTEMPT_CAP,
  MSG91_VERIFY_OTP_URL,
  MSG91_VERIFY_POST_BODY_ALTERNATIVE,
  assessMsg91Transport,
  classifyMsg91TransportFailure,
  classifyMsg91VerifyHttpResult,
  createInactiveMsg91CustomerOtpProvider,
} from "./msg91";
import { CUSTOMER_OTP_ALLOWED_ATTEMPTS, CUSTOMER_OTP_EXPIRES_IN_SECONDS } from "./types";

const PHONE = "+919876543210" as E164IndianMobileNumber;
const AUTHKEY = "test-authkey-not-a-real-credential";
const OTP = "654321";
const PLACEHOLDER = "111111";

const COMPLETE_DLT = {
  authkey: AUTHKEY,
  dltPrincipalEntityId: "pe-test",
  dltHeader: "BOBABR",
  dltTemplateId: "template-test",
} as const;

function inactiveProvider(
  overrides: Partial<Parameters<typeof createInactiveMsg91CustomerOtpProvider>[0]> = {},
) {
  return createInactiveMsg91CustomerOtpProvider({
    environmentType: "test",
    authkey: AUTHKEY,
    dltPrincipalEntityId: COMPLETE_DLT.dltPrincipalEntityId,
    dltHeader: COMPLETE_DLT.dltHeader,
    dltTemplateId: COMPLETE_DLT.dltTemplateId,
    ...overrides,
  });
}

function throwingFetch(calls: { count: number }): typeof fetch {
  return (async () => {
    calls.count += 1;
    throw new Error("MSG91 network must not be called");
  }) as typeof fetch;
}

describe("inactive MSG91 contract", () => {
  it("represents a six-digit code and a five-minute expiry, not the vendor defaults", () => {
    expect(MSG91_REQUESTED_OTP_LENGTH).toBe(6);
    expect(MSG91_REQUESTED_OTP_EXPIRY_MINUTES).toBe(5);
    expect(CUSTOMER_OTP_EXPIRES_IN_SECONDS).toBe(300);
    expect(MSG91_DOCUMENTED_DEFAULT_OTP_LENGTH).toBe(4);
    expect(MSG91_DOCUMENTED_DEFAULT_EXPIRY_MINUTES).toBe(15);
    expect(MSG91_DOCUMENTED_VERIFY_METHOD).toBe("GET");
    expect(MSG91_VERIFY_POST_BODY_ALTERNATIVE).toBe("NOT_DOCUMENTED");
    expect(MSG91_VERIFY_ATTEMPT_CAP).toBe("UNVERIFIED");
    expect(MSG91_RESEND_SEMANTICS).toBe("SAME_OTP_DOCUMENTED_SUPERSESSION_UNVERIFIED");
    expect(MSG91_DOCUMENTED_RESEND_RETRY_LIMIT).toBe(2);
    expect(MSG91_GLOBAL_SPEND_CONTROL).toBe("DECISION_REQUIRED");
    expect(MSG91_LIVE_ACTIVATION).toBe("NOT_AUTHORIZED");
    expect(MSG91_SELECTED_BY_FACTORY).toBe(false);
    expect(CUSTOMER_OTP_ALLOWED_ATTEMPTS).toBe(3);
  });
});

describe("classifyMsg91VerifyHttpResult", () => {
  it("classifies a documented success body as approved", () => {
    expect(
      classifyMsg91VerifyHttpResult({
        httpStatus: 200,
        body: { type: "success", message: "OTP verified success" },
      }),
    ).toEqual({ outcome: "approved" });
  });

  it("classifies a documented mismatch as invalid and an expiry as expired", () => {
    expect(
      classifyMsg91VerifyHttpResult({
        httpStatus: 200,
        body: { type: "error", message: "OTP not match" },
      }),
    ).toEqual({ outcome: "invalid" });
    expect(
      classifyMsg91VerifyHttpResult({
        httpStatus: 200,
        body: { type: "error", message: "OTP expired" },
      }),
    ).toEqual({ outcome: "expired" });
  });

  it("does not treat vendor outage, auth failure, or the resend retry cap as an invalid code", () => {
    expect(classifyMsg91VerifyHttpResult({ httpStatus: 500, body: { type: "error" } })).toEqual({
      outcome: "unavailable",
    });
    expect(classifyMsg91VerifyHttpResult({ httpStatus: 401, body: { type: "error", message: "Invalid authkey" } })).toEqual({
      outcome: "unavailable",
    });
    expect(
      classifyMsg91VerifyHttpResult({
        httpStatus: 200,
        body: { type: "error", message: "OTP retry count maxed out" },
      }),
    ).toEqual({ outcome: "unavailable" });
    expect(classifyMsg91TransportFailure("timeout")).toEqual({ outcome: "unavailable" });
    expect(classifyMsg91TransportFailure("non_json")).toEqual({ outcome: "unavailable" });
    expect(classifyMsg91TransportFailure("malformed")).toEqual({ outcome: "unavailable" });
  });

  it("classifies a non-object or unexpected body as unavailable", () => {
    expect(classifyMsg91VerifyHttpResult({ httpStatus: 200, body: "not-json" })).toEqual({
      outcome: "unavailable",
    });
    expect(classifyMsg91VerifyHttpResult({ httpStatus: 200, body: [] })).toEqual({
      outcome: "unavailable",
    });
    expect(classifyMsg91VerifyHttpResult({ httpStatus: 200, body: { type: "success" } })).toEqual({
      outcome: "unavailable",
    });
    expect(classifyMsg91VerifyHttpResult({ httpStatus: 418, body: { unexpected: true } })).toEqual({
      outcome: "unavailable",
    });
  });
});

describe("assessMsg91Transport", () => {
  it("refuses an HTTP endpoint and a URL that already carries sensitive query parameters", () => {
    expect(
      assessMsg91Transport({
        operation: "verify",
        endpoint: "http://control.msg91.com/api/v5/otp/verify",
        ...COMPLETE_DLT,
      }).block,
    ).toBe("unsafe_endpoint");
    expect(
      assessMsg91Transport({
        operation: "verify",
        endpoint: `https://control.msg91.com/api/v5/otp/verify?otp=${OTP}&mobile=919876543210`,
        ...COMPLETE_DLT,
      }).block,
    ).toBe("sensitive_query");
    expect(
      assessMsg91Transport({
        operation: "resend",
        endpoint: `${MSG91_RESEND_OTP_URL}?authkey=${AUTHKEY}`,
        ...COMPLETE_DLT,
      }).block,
    ).toBe("sensitive_query");
  });

  it("refuses a missing credential and a missing DLT identity", () => {
    expect(
      assessMsg91Transport({
        operation: "send",
        endpoint: MSG91_SEND_OTP_URL,
        ...COMPLETE_DLT,
        authkey: null,
      }).block,
    ).toBe("missing_credential");
    expect(
      assessMsg91Transport({
        operation: "send",
        endpoint: MSG91_SEND_OTP_URL,
        ...COMPLETE_DLT,
        authkey: "   ",
      }).block,
    ).toBe("missing_credential");
    expect(
      assessMsg91Transport({
        operation: "send",
        endpoint: MSG91_SEND_OTP_URL,
        ...COMPLETE_DLT,
        dltTemplateId: null,
      }).block,
    ).toBe("missing_dlt_identity");
    expect(
      assessMsg91Transport({
        operation: "send",
        endpoint: MSG91_SEND_OTP_URL,
        ...COMPLETE_DLT,
        dltHeader: "",
      }).block,
    ).toBe("missing_dlt_identity");
    expect(
      assessMsg91Transport({
        operation: "send",
        endpoint: MSG91_SEND_OTP_URL,
        ...COMPLETE_DLT,
        dltPrincipalEntityId: null,
      }).block,
    ).toBe("missing_dlt_identity");
  });

  it("refuses the documented Send, Verify, and Resend transports even when the URL itself is clean", () => {
    expect(
      assessMsg91Transport({
        operation: "send",
        endpoint: MSG91_SEND_OTP_URL,
        ...COMPLETE_DLT,
      }).block,
    ).toBe("send_query_mobile_no_body_alternative");
    expect(
      assessMsg91Transport({
        operation: "verify",
        endpoint: MSG91_VERIFY_OTP_URL,
        ...COMPLETE_DLT,
      }).block,
    ).toBe("verify_query_otp_no_post_alternative");
    expect(
      assessMsg91Transport({
        operation: "resend",
        endpoint: MSG91_RESEND_OTP_URL,
        ...COMPLETE_DLT,
      }).block,
    ).toBe("resend_query_authkey");
  });
});

describe("createInactiveMsg91CustomerOtpProvider", () => {
  const now = new Date("2026-01-01T00:00:00.000Z");
  const expiresAt = new Date(now.getTime() + 5 * 60 * 1000);

  it("does not call fetch or transmit the BOBA-generated placeholder", async () => {
    const calls = { count: 0 };
    const provider = inactiveProvider({ fetchImpl: throwingFetch(calls) });
    const start = await provider.startVerification({
      phoneNumber: PHONE,
      generatedCode: PLACEHOLDER,
      now,
      expiresAt,
    });
    const check = await provider.checkVerification({
      phoneNumber: PHONE,
      code: OTP,
      now,
    });
    expect(start).toEqual({ outcome: "unavailable" });
    expect(check).toEqual({ outcome: "unavailable" });
    expect(calls.count).toBe(0);
    expect(JSON.stringify(start)).not.toContain(PLACEHOLDER);
    expect(JSON.stringify(check)).not.toContain(OTP);
    expect(JSON.stringify(start)).not.toContain(AUTHKEY);
    expect(JSON.stringify(check)).not.toContain(PHONE);
  });

  it("does not approve a code, a replay, or a code submitted after repeated checks", async () => {
    const provider = inactiveProvider();
    const outcomes = [];
    for (let attempt = 0; attempt < CUSTOMER_OTP_ALLOWED_ATTEMPTS + 1; attempt += 1) {
      outcomes.push(
        await provider.checkVerification({ phoneNumber: PHONE, code: OTP, now }),
      );
    }
    const replay = await provider.checkVerification({ phoneNumber: PHONE, code: OTP, now });
    expect(outcomes.every((result) => result.outcome === "unavailable")).toBe(true);
    expect(replay.outcome).toBe("unavailable");
    expect(outcomes.some((result) => result.outcome === "approved")).toBe(false);
  });

  it("does not approve concurrent checks or simultaneous starts for one phone", async () => {
    const provider = inactiveProvider();
    const checks = await Promise.all([
      provider.checkVerification({ phoneNumber: PHONE, code: OTP, now }),
      provider.checkVerification({ phoneNumber: PHONE, code: OTP, now }),
    ]);
    const starts = await Promise.all([
      provider.startVerification({
        phoneNumber: PHONE,
        generatedCode: PLACEHOLDER,
        now,
        expiresAt,
      }),
      provider.startVerification({
        phoneNumber: PHONE,
        generatedCode: "222222",
        now,
        expiresAt,
      }),
    ]);
    expect(checks.map((result) => result.outcome)).toEqual(["unavailable", "unavailable"]);
    expect(starts.map((result) => result.outcome)).toEqual(["unavailable", "unavailable"]);
  });

  it("keeps the existing three-attempt local provider behavior unchanged", async () => {
    const local = createLocalCustomerOtpProvider({ environmentType: "test" });
    await local.startVerification({
      phoneNumber: PHONE,
      generatedCode: OTP,
      now,
      expiresAt,
    });
    for (let attempt = 0; attempt < CUSTOMER_OTP_ALLOWED_ATTEMPTS; attempt += 1) {
      await local.checkVerification({ phoneNumber: PHONE, code: "000000", now });
    }
    const afterExhaustion = await local.checkVerification({
      phoneNumber: PHONE,
      code: OTP,
      now,
    });
    expect(afterExhaustion.outcome).toBe("invalid");
  });

  it("does not approve across addresses because it has no network path and no session outcome", async () => {
    const provider = inactiveProvider();
    const first = await provider.checkVerification({ phoneNumber: PHONE, code: "000000", now });
    const second = await provider.checkVerification({ phoneNumber: PHONE, code: OTP, now });
    expect(first.outcome).toBe("unavailable");
    expect(second.outcome).toBe("unavailable");
    expect(CUSTOMER_OTP_RATE_LIMIT_RULES.otp_verify_ip_10m.maximumRequests).toBe(20);
    expect(CUSTOMER_OTP_RATE_LIMIT_RULES.otp_send_phone_1h.maximumRequests).toBe(5);
  });

  it("fails readiness closed and refuses work after close", async () => {
    const provider = inactiveProvider({ environmentType: "production" });
    expect(provider.kind).toBe("production");
    expect(provider.activation).toBe("NOT_AUTHORIZED");
    await expect(provider.checkReadiness()).rejects.toMatchObject({
      code: "CUSTOMER_OTP_PRODUCTION_PROVIDER_UNAVAILABLE",
    });
    await provider.close();
    await expect(
      provider.startVerification({
        phoneNumber: PHONE,
        generatedCode: PLACEHOLDER,
        now,
        expiresAt,
      }),
    ).rejects.toBeInstanceOf(CustomerOtpProviderError);
  });

  it("leaves the live factory limited to local and disabled", () => {
    const factory = readFileSync("src/server/customer-auth/provider/factory.ts", "utf8");
    expect(factory).toContain('CustomerOtpProviderKind = "local" | "disabled"');
    expect(factory).not.toContain('"msg91"');
    expect(() =>
      createCustomerOtpProvider({ kind: "disabled", environmentType: "staging" }),
    ).toThrow(CustomerOtpProviderError);
    expect(() =>
      createCustomerOtpProvider({ kind: "local", environmentType: "production" }),
    ).toThrow(CustomerOtpProviderError);
    try {
      createCustomerOtpProvider({ kind: "disabled", environmentType: "production" });
      expect.unreachable("production must fail closed");
    } catch (error) {
      expect((error as CustomerOtpProviderError).code).toBe(
        "CUSTOMER_OTP_PRODUCTION_PROVIDER_UNAVAILABLE",
      );
    }
  });
});
