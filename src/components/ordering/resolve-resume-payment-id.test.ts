import { describe, expect, it } from "vitest";

import { resolveResumePaymentId } from "@/components/ordering/resolve-resume-payment-id";

describe("resolveResumePaymentId", () => {
  it("prefers server openPaymentId over session recovery", () => {
    expect(
      resolveResumePaymentId({
        checkoutId: "chk-1",
        openPaymentId: "pay-server",
        recovery: {
          paymentId: "pay-browser",
          checkoutId: "chk-1",
          checkoutRevision: "4",
        },
      }),
    ).toBe("pay-server");
  });

  it("uses matching session recovery when server id is absent", () => {
    expect(
      resolveResumePaymentId({
        checkoutId: "chk-1",
        openPaymentId: null,
        recovery: {
          paymentId: "pay-1",
          checkoutId: "chk-1",
          checkoutRevision: "4",
        },
      }),
    ).toBe("pay-1");
  });

  it("ignores recovery that belongs to another checkout", () => {
    expect(
      resolveResumePaymentId({
        checkoutId: "chk-1",
        openPaymentId: null,
        recovery: {
          paymentId: "pay-other",
          checkoutId: "chk-other",
          checkoutRevision: "1",
        },
      }),
    ).toBeNull();
  });

  it("returns null when both server id and recovery are missing", () => {
    expect(
      resolveResumePaymentId({
        checkoutId: "chk-1",
        openPaymentId: null,
        recovery: null,
      }),
    ).toBeNull();
  });

  it("treats blank openPaymentId as absent", () => {
    expect(
      resolveResumePaymentId({
        checkoutId: "chk-1",
        openPaymentId: "   ",
        recovery: {
          paymentId: "pay-1",
          checkoutId: "chk-1",
        },
      }),
    ).toBe("pay-1");
  });
});
