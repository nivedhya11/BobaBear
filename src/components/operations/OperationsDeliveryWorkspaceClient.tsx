"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

import { OperationsDeliveryPanel } from "@/components/operations/OperationsDeliveryPanel";
import { Button } from "@/components/ui/Button";
import { orderStatusLabel } from "@/components/ordering/order-status";
import { listWorkforceOrders } from "@/lib/operations/orders";
import type { OperationsOrderSummary } from "@/lib/operations/types";

type ViewState =
  | Readonly<{ kind: "loading" }>
  | Readonly<{ kind: "unauthorized" }>
  | Readonly<{ kind: "forbidden" }>
  | Readonly<{ kind: "error" }>
  | Readonly<{
      kind: "ready";
      items: readonly OperationsOrderSummary[];
      selectedOrderId: string | null;
      nextCursor: string | null;
      rawAcceptedCount: number;
    }>;

/** Only orders with verified DELIVERY mode. Unknown/missing mode must not default to Delivery. */
export function isVerifiedDeliveryOrder(order: OperationsOrderSummary): boolean {
  return order.fulfilmentMode === "DELIVERY";
}

function fulfilmentTimingLabel(order: OperationsOrderSummary): string {
  if (order.fulfilmentTiming === "SCHEDULED") return "Scheduled";
  return "ASAP";
}

export function OperationsDeliveryWorkspaceClient() {
  const [state, setState] = useState<ViewState>({ kind: "loading" });
  const [loadingMore, setLoadingMore] = useState(false);
  const [paginationError, setPaginationError] = useState<string | null>(null);
  const loadMoreGenerationRef = useRef(0);

  const applyPage = useCallback(
    (
      items: readonly OperationsOrderSummary[],
      nextCursor: string | null,
      previousSelected: string | null,
      append: boolean,
      previousItems: readonly OperationsOrderSummary[],
      previousRawCount: number,
    ): Extract<ViewState, { kind: "ready" }> => {
      const deliveryItems = items.filter(isVerifiedDeliveryOrder);
      const merged = append ? [...previousItems, ...deliveryItems] : deliveryItems;
      const selectedStillPresent =
        previousSelected !== null && merged.some((o) => o.orderId === previousSelected);
      return {
        kind: "ready",
        items: merged,
        selectedOrderId: selectedStillPresent
          ? previousSelected
          : (merged[0]?.orderId ?? null),
        nextCursor,
        rawAcceptedCount: append ? previousRawCount + items.length : items.length,
      };
    },
    [],
  );

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const result = await listWorkforceOrders({ status: "ACCEPTED", limit: 50 });
      if (cancelled) return;
      if (!result.ok) {
        if (result.status === 401 || result.code === "WORKFORCE_AUTH_REQUIRED") {
          setState({ kind: "unauthorized" });
          return;
        }
        if (result.status === 403 || result.code === "ORDER_UNAUTHORIZED") {
          setState({ kind: "forbidden" });
          return;
        }
        setState({ kind: "error" });
        return;
      }
      setPaginationError(null);
      setState(applyPage(result.data.items, result.data.nextCursor, null, false, [], 0));
    })();
    return () => {
      cancelled = true;
    };
  }, [applyPage]);

  async function handleLoadMore() {
    if (state.kind !== "ready" || !state.nextCursor || loadingMore) return;
    const requestCursor = state.nextCursor;
    const generation = ++loadMoreGenerationRef.current;
    setLoadingMore(true);
    setPaginationError(null);
    const result = await listWorkforceOrders({
      status: "ACCEPTED",
      limit: 50,
      cursor: requestCursor,
    });
    if (generation !== loadMoreGenerationRef.current) return;
    setLoadingMore(false);
    if (!result.ok) {
      // Keep already-loaded queue + selection; surface recoverable retry.
      setPaginationError("More accepted orders could not be loaded. Try again.");
      return;
    }
    setState((prev) => {
      if (prev.kind !== "ready") return prev;
      // Preserve the operator's latest selection (not the selection at request start).
      return applyPage(
        result.data.items,
        result.data.nextCursor,
        prev.selectedOrderId,
        true,
        prev.items,
        prev.rawAcceptedCount,
      );
    });
  }

  if (state.kind === "loading") return <p aria-live="polite">Loading delivery workspace…</p>;
  if (state.kind === "unauthorized") {
    return (
      <p role="alert">
        Sign in required. <a href="/workforce/login/">Workforce sign in</a>
      </p>
    );
  }
  if (state.kind === "forbidden") {
    return <p role="alert">You do not have permission to view delivery work.</p>;
  }
  if (state.kind === "error") {
    return <p role="alert">Delivery workspace could not be loaded.</p>;
  }

  const selected = state.selectedOrderId
    ? state.items.find((o) => o.orderId === state.selectedOrderId) ?? null
    : null;
  const selectedIsDelivery = selected !== null && isVerifiedDeliveryOrder(selected);
  const excludedFromPage = state.rawAcceptedCount - state.items.length;

  return (
    <div
      className="flex flex-col gap-6 lg:grid lg:grid-cols-[minmax(0,16rem)_1fr]"
      data-testid="operations-delivery-workspace"
    >
      <section aria-labelledby="delivery-queue-heading">
        <h2 id="delivery-queue-heading" className="text-lg font-semibold">
          Delivery queue
        </h2>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">
          Manual Dehradun delivery mode. Only verified Delivery-mode accepted orders are listed.
          Takeaway and unknown modes are excluded.
        </p>
        <p
          className="mt-2 text-xs text-[var(--text-tertiary)]"
          data-testid="delivery-queue-honesty"
        >
          Showing {state.items.length} Delivery order{state.items.length === 1 ? "" : "s"}
          {excludedFromPage > 0
            ? ` (${excludedFromPage} accepted non-Delivery or unknown-mode order${excludedFromPage === 1 ? "" : "s"} hidden from this workspace)`
            : ""}
          {state.nextCursor ? "; more pages available." : "."}
        </p>
        {state.items.length === 0 ? (
          <p className="mt-4 text-sm text-[var(--text-secondary)]" data-testid="delivery-queue-empty">
            No verified Delivery-mode accepted orders in the loaded pages.
          </p>
        ) : (
          <ul className="mt-4 space-y-1" data-testid="delivery-queue-list">
            {state.items.map((order) => (
              <li key={order.orderId}>
                <button
                  type="button"
                  className="w-full min-h-11 rounded border border-[var(--border-subtle)] px-3 py-2 text-left text-sm"
                  aria-pressed={state.selectedOrderId === order.orderId}
                  data-testid={`delivery-queue-item-${order.orderId}`}
                  data-fulfilment-mode={order.fulfilmentMode}
                  onClick={() =>
                    setState((prev) =>
                      prev.kind === "ready"
                        ? { ...prev, selectedOrderId: order.orderId }
                        : prev,
                    )
                  }
                >
                  <span className="font-medium">{order.orderNumber}</span>
                  <span className="block text-[var(--text-secondary)]">
                    {orderStatusLabel(order.status)} · Delivery · {fulfilmentTimingLabel(order)}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
        {state.nextCursor ? (
          <div className="mt-3 space-y-2">
            {paginationError ? (
              <p
                role="alert"
                className="text-sm text-rose-700"
                data-testid="delivery-queue-pagination-error"
              >
                {paginationError}
              </p>
            ) : null}
            <Button
              type="button"
              variant="outline"
              onClick={() => void handleLoadMore()}
              disabled={loadingMore}
              aria-busy={loadingMore}
              data-testid="delivery-queue-load-more"
            >
              {loadingMore
                ? "Loading…"
                : paginationError
                  ? "Retry loading more accepted orders"
                  : "Load more accepted orders"}
            </Button>
          </div>
        ) : null}
      </section>
      <section aria-labelledby="delivery-detail-heading">
        <h2 id="delivery-detail-heading" className="text-lg font-semibold">
          Delivery actions
        </h2>
        {selected && selectedIsDelivery ? (
          <>
            <p className="mt-1 text-sm">
              <Link
                href={`/workforce/operations/orders/detail/?orderId=${encodeURIComponent(selected.orderId)}`}
                className="underline"
              >
                Open full order
              </Link>
            </p>
            <p className="mt-1 text-xs text-[var(--text-tertiary)]" data-testid="delivery-selected-meta">
              {selected.orderNumber} · verified Delivery mode · {fulfilmentTimingLabel(selected)}
            </p>
            <OperationsDeliveryPanel key={selected.orderId} orderId={selected.orderId} />
          </>
        ) : selected && !selectedIsDelivery ? (
          <p className="mt-4 text-sm text-[var(--text-secondary)]" role="status" data-testid="delivery-non-delivery-blocked">
            Delivery actions are not available for Takeaway or unknown fulfilment modes. Open the
            full order for Takeaway fulfilment.
          </p>
        ) : (
          <p className="mt-4 text-sm text-[var(--text-secondary)]">Select an order to continue.</p>
        )}
      </section>
    </div>
  );
}
