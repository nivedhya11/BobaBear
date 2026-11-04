/**
 * Customer Order read wrappers (IMP-025 / D-357).
 */
import { commerceRequest, type CommerceHttpResult } from "./http";
import type { CommerceOrderDetail, CommerceOrderSummary } from "./types";

type ListEnvelope = Readonly<{
  ok: true;
  items: readonly CommerceOrderSummary[];
  nextCursor: string | null;
}>;

type DetailEnvelope = Readonly<{ ok: true; order: CommerceOrderDetail }>;

export async function listCustomerOrders(input: {
  cursor?: string;
  limit?: number;
} = {}): Promise<
  CommerceHttpResult<{ items: readonly CommerceOrderSummary[]; nextCursor: string | null }>
> {
  const result = await commerceRequest<ListEnvelope>("/api/v1/orders", {
    method: "GET",
    query: {
      cursor: input.cursor,
      limit: input.limit === undefined ? undefined : String(input.limit),
    },
  });
  if (!result.ok) return result;
  if (!Array.isArray(result.data.items)) {
    return { ok: false, code: "INVALID_RESPONSE", status: result.status };
  }
  return {
    ok: true,
    status: result.status,
    data: {
      items: result.data.items,
      nextCursor: result.data.nextCursor ?? null,
    },
  };
}

export async function getCustomerOrder(
  orderId: string,
): Promise<CommerceHttpResult<{ order: CommerceOrderDetail }>> {
  const result = await commerceRequest<DetailEnvelope>(`/api/v1/orders/${orderId}`, {
    method: "GET",
  });
  if (!result.ok) return result;
  if (!result.data.order) {
    return { ok: false, code: "INVALID_RESPONSE", status: result.status };
  }
  return { ok: true, status: result.status, data: { order: result.data.order } };
}

type CancelEnvelope = Readonly<{
  ok: true;
  order: Readonly<{
    orderId: string;
    orderNumber: string;
    status: string;
    revision: string;
    cancelledAt?: string | null;
    cancellationReasonCode?: string | null;
  }>;
}>;

/**
 * Customer self-service cancel for a purchased Scheduled Order (IMP-036I).
 * Server enforces sealed cutoff + ownership; this wrapper does not invent policy.
 */
export async function cancelCustomerScheduledOrder(input: {
  orderId: string;
  expectedOrderRevision: string;
}): Promise<CommerceHttpResult<{ order: CancelEnvelope["order"] }>> {
  const result = await commerceRequest<CancelEnvelope>(
    `/api/v1/orders/${input.orderId}/cancel`,
    {
      method: "POST",
      body: { expectedOrderRevision: input.expectedOrderRevision },
    },
  );
  if (!result.ok) return result;
  if (!result.data.order?.orderId || !result.data.order.revision) {
    return { ok: false, code: "INVALID_RESPONSE", status: result.status };
  }
  return { ok: true, status: result.status, data: { order: result.data.order } };
}
