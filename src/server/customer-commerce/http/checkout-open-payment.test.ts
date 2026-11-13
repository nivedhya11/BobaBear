import { describe, expect, it, vi } from "vitest";

import { withOpenPaymentId } from "./checkout-open-payment";

vi.mock("../../payment/repository", () => ({
  findNonTerminalPaymentByCheckoutId: vi.fn(),
}));

import { findNonTerminalPaymentByCheckoutId } from "../../payment/repository";

const findMock = vi.mocked(findNonTerminalPaymentByCheckoutId);

function checkout(status: string) {
  return {
    id: "chk-1",
    customerAuthUserId: "user-1",
    brandId: "brand-1",
    cartId: "cart-1",
    sourceCartRevision: 1n,
    revision: 2n,
    status,
    expiresAt: new Date("2026-11-13T00:00:00.000Z"),
    fulfilmentMode: "PICKUP" as const,
    fulfilmentTiming: "ASAP" as const,
    scheduledWindowStartAt: null,
    scheduledWindowEndAt: null,
    pickupOutletId: "outlet-1",
    activeSnapshotId: "snap-1",
    createdAt: new Date("2026-11-13T00:00:00.000Z"),
    updatedAt: new Date("2026-11-13T00:00:00.000Z"),
    destination: null,
    activeSnapshot: null,
  };
}

describe("withOpenPaymentId", () => {
  it("returns null checkout unchanged", async () => {
    const persistence = { withContext: vi.fn() };
    await expect(withOpenPaymentId(persistence as never, null)).resolves.toBeNull();
    expect(persistence.withContext).not.toHaveBeenCalled();
  });

  it("attaches null openPaymentId for non-pending checkouts", async () => {
    const persistence = { withContext: vi.fn() };
    const result = await withOpenPaymentId(persistence as never, checkout("DRAFT") as never);
    expect(result?.openPaymentId).toBeNull();
    expect(persistence.withContext).not.toHaveBeenCalled();
  });

  it("looks up non-terminal payment for PAYMENT_PENDING", async () => {
    findMock.mockResolvedValue({ id: "pay-9" } as never);
    const persistence = {
      withContext: async (fn: (ctx: unknown) => unknown) => fn({}),
    };
    const result = await withOpenPaymentId(
      persistence as never,
      checkout("PAYMENT_PENDING") as never,
    );
    expect(findMock).toHaveBeenCalledWith({}, "chk-1");
    expect(result?.openPaymentId).toBe("pay-9");
  });
});
