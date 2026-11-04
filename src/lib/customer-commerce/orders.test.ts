import { afterEach, describe, expect, it, vi } from "vitest";

import {
  cancelCustomerScheduledOrder,
  getCustomerOrder,
  listCustomerOrders,
} from "./orders";

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

const summary = {
  orderId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
  orderNumber: "ORD-0123456789AB",
  status: "PLACED",
  revision: "1",
  createdAt: "2026-08-13T00:20:00.000Z",
  money: { grandTotalMinor: "27195", currency: "INR" },
  paymentSatisfaction: "PAID",
  outlet: {
    outletId: "outlet-1",
    brandId: "brand-1",
    code: "e2e-outlet",
    name: "E2E Outlet",
  },
};

const detail = {
  ...summary,
  updatedAt: "2026-08-13T00:20:00.000Z",
  acceptedAt: null,
  fulfilledAt: null,
  cancelledAt: null,
  cancellationReasonCode: null,
  destination: {
    recipientName: "E2E Guest",
    recipientPhone: "+919876500251",
    addressLine1: "12 Mall Road",
    addressLine2: null,
    landmark: null,
    locality: null,
    city: "Dehradun",
    stateCode: "IN-UT",
    postalCode: "248001",
    label: null,
  },
  lines: [
    {
      productName: "Classic Milk Tea",
      variantName: "Regular",
      quantity: 1,
      lineTotalMinor: "19900",
      modifiers: [],
    },
  ],
};

describe("order client", () => {
  it("lists customer orders including an empty page", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse({ ok: true, items: [summary], nextCursor: null }))
      .mockResolvedValueOnce(jsonResponse({ ok: true, items: [], nextCursor: null }));
    vi.stubGlobal("fetch", fetchMock);

    const listed = await listCustomerOrders({ limit: 10 });
    expect(listed.ok).toBe(true);
    if (!listed.ok) return;
    expect(listed.data.items).toHaveLength(1);
    expect(listed.data.items[0]?.status).toBe("PLACED");
    expect(String(fetchMock.mock.calls[0]?.[0])).toBe("/api/v1/orders?limit=10");

    const empty = await listCustomerOrders();
    expect(empty.ok).toBe(true);
    if (!empty.ok) return;
    expect(empty.data.items).toEqual([]);
  });

  it("reads order detail", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => jsonResponse({ ok: true, order: detail })));
    const got = await getCustomerOrder(summary.orderId);
    expect(got.ok).toBe(true);
    if (!got.ok) return;
    expect(got.data.order.orderNumber).toBe("ORD-0123456789AB");
    expect(got.data.order.lines).toHaveLength(1);
    expect(got.data.order.destination?.postalCode).toBe("248001");
  });

  it("surfaces D-360 order errors", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => jsonResponse({ ok: false, code: "ORDER_NOT_FOUND", requestId: "req-o" }, 404)),
    );
    const missing = await getCustomerOrder("bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb");
    expect(missing).toEqual({
      ok: false,
      code: "ORDER_NOT_FOUND",
      requestId: "req-o",
      status: 404,
    });
  });

  it("posts scheduled self-service cancel with expected revision", async () => {
    const fetchMock = vi.fn(async () =>
      jsonResponse({
        ok: true,
        order: {
          orderId: summary.orderId,
          orderNumber: summary.orderNumber,
          status: "CANCELLED",
          revision: "2",
          cancelledAt: "2026-08-13T00:30:00.000Z",
          cancellationReasonCode: "CUSTOMER_REQUESTED",
        },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    const cancelled = await cancelCustomerScheduledOrder({
      orderId: summary.orderId,
      expectedOrderRevision: "1",
    });
    expect(cancelled.ok).toBe(true);
    if (!cancelled.ok) return;
    expect(cancelled.data.order.status).toBe("CANCELLED");
    expect(String(fetchMock.mock.calls[0]?.[0])).toBe(
      `/api/v1/orders/${summary.orderId}/cancel`,
    );
    expect(fetchMock.mock.calls[0]?.[1]).toMatchObject({
      method: "POST",
      body: JSON.stringify({ expectedOrderRevision: "1" }),
    });
  });

  it("surfaces cutoff-closed and not-allowed cancel denials", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        jsonResponse(
          { ok: false, code: "ORDER_CANCEL_CUTOFF_CLOSED", requestId: "req-cut" },
          409,
        ),
      ),
    );
    const closed = await cancelCustomerScheduledOrder({
      orderId: summary.orderId,
      expectedOrderRevision: "1",
    });
    expect(closed).toEqual({
      ok: false,
      code: "ORDER_CANCEL_CUTOFF_CLOSED",
      requestId: "req-cut",
      status: 409,
    });

    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        jsonResponse(
          { ok: false, code: "ORDER_CANCEL_NOT_ALLOWED", requestId: "req-na" },
          409,
        ),
      ),
    );
    const denied = await cancelCustomerScheduledOrder({
      orderId: summary.orderId,
      expectedOrderRevision: "1",
    });
    expect(denied).toEqual({
      ok: false,
      code: "ORDER_CANCEL_NOT_ALLOWED",
      requestId: "req-na",
      status: 409,
    });
  });
});
