"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/Button";
import { CustomerOrderFulfilmentPanel } from "@/components/ordering/CustomerOrderFulfilmentPanel";
import { OrderFinancialDocuments } from "@/components/ordering/OrderFinancialDocuments";
import { OrderMoneySummaryPanel } from "@/components/ordering/OrderMoneySummaryPanel";
import { buildOrderTimeline, OrderTimelinePanel } from "@/components/ordering/OrderTimelinePanel";
import { OrderSupportAction } from "@/components/ordering/OrderSupportAction";
import { commerceErrorCopy } from "@/components/ordering/error-copy";
import { formatPaise } from "@/components/ordering/format-money";
import { orderStatusLabel } from "@/components/ordering/order-status";
import { fetchCustomerSession } from "@/lib/customer-auth/client";
import { loginUrlWithReturn } from "@/lib/customer-auth/return-to";
import {
  cancelCustomerScheduledOrder,
  getCustomerOrder,
  type CommerceOrderDetail,
} from "@/lib/customer-commerce";

function canOfferScheduledSelfServiceCancel(order: CommerceOrderDetail): boolean {
  if (order.fulfilmentTiming !== "SCHEDULED") return false;
  return order.status === "PLACED" || order.status === "ACCEPTED";
}

export function OrderDetailClient() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  const [order, setOrder] = useState<CommerceOrderDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [confirmingCancel, setConfirmingCancel] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const session = await fetchCustomerSession();
      if (cancelled) return;
      if (!session.ok || !session.data.authenticated) {
        window.location.assign(
          loginUrlWithReturn(`/order/orders/detail/${orderId ? `?orderId=${encodeURIComponent(orderId)}` : ""}`),
        );
        return;
      }
      if (!orderId) {
        setError("Missing order.");
        setLoading(false);
        return;
      }
      const result = await getCustomerOrder(orderId);
      if (cancelled) return;
      if (!result.ok) {
        setError(commerceErrorCopy(result.code));
        setLoading(false);
        return;
      }
      setOrder(result.data.order);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [orderId]);

  async function onConfirmCancel() {
    if (!order || cancelling) return;
    setCancelling(true);
    setActionError(null);
    const result = await cancelCustomerScheduledOrder({
      orderId: order.orderId,
      expectedOrderRevision: order.revision,
    });
    if (!result.ok) {
      setActionError(commerceErrorCopy(result.code));
      setCancelling(false);
      setConfirmingCancel(false);
      return;
    }
    const refreshed = await getCustomerOrder(order.orderId);
    if (refreshed.ok) {
      setOrder(refreshed.data.order);
    } else {
      setOrder({
        ...order,
        status: result.data.order.status,
        revision: result.data.order.revision,
        cancelledAt: result.data.order.cancelledAt ?? order.cancelledAt,
        cancellationReasonCode:
          result.data.order.cancellationReasonCode ?? order.cancellationReasonCode,
      });
    }
    setConfirmingCancel(false);
    setCancelling(false);
  }

  return (
    <main id="main-content" tabIndex={-1} className="bg-[var(--bg-page)] focus:outline-none">
      <div className="mx-auto max-w-[720px] px-5 py-12 md:py-16 flex flex-col gap-8">
        <header className="flex flex-col gap-2">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--text-tertiary)]">
            Boba Bear · Order
          </p>
          <h1 className="font-display text-[clamp(36px,8vw,56px)] leading-[0.95] text-[var(--text-primary)]">
            Order detail
          </h1>
        </header>

        {loading ? (
          <p className="font-body text-[15px] text-[var(--text-secondary)]">Loading order…</p>
        ) : null}

        {error ? (
          <p role="alert" className="font-body text-[14px] text-[var(--text-secondary)]">
            {error}
          </p>
        ) : null}

        {order ? (
          <div className="flex flex-col gap-6" data-testid="order-detail">
            <div className="flex flex-col gap-1">
              <p className="font-body text-[15px] font-semibold">{order.orderNumber}</p>
              <p data-testid="order-status">{orderStatusLabel(order.status)}</p>
              <p className="font-body text-[13px] text-[var(--text-secondary)]">
                {order.createdAt ? new Date(order.createdAt).toLocaleString() : ""}
              </p>
            </div>

            <OrderTimelinePanel
              milestones={buildOrderTimeline({
                status: order.status,
                createdAt: order.createdAt,
                acceptedAt: order.acceptedAt,
                fulfilledAt: order.fulfilledAt,
                cancelledAt: order.cancelledAt,
              })}
            />

            <CustomerOrderFulfilmentPanel order={order} />

            <ul className="flex flex-col gap-3">
              {order.lines.map((line, index) => (
                <li key={`${line.productName}-${index}`} className="font-body text-[14px]">
                  {line.quantity} × {line.productName}
                  {line.variantName ? ` (${line.variantName})` : ""} — {formatPaise(line.lineTotalMinor)}
                  {line.lineOrigin === "complimentary_offer" ? (
                    <span className="mt-1 block text-[12px] text-[var(--text-secondary)]">
                      Included with your offer
                    </span>
                  ) : null}
                </li>
              ))}
            </ul>

            {BigInt(order.moneySummary?.promotionDiscountMinor || "0") > BigInt(0) ? (
              <p data-testid="copy-purchased" className="font-body text-[14px] text-[var(--text-secondary)]">
                You saved {formatPaise(order.moneySummary?.promotionDiscountMinor ?? "0")} on this order.
              </p>
            ) : null}

            <OrderMoneySummaryPanel moneySummary={order.moneySummary} title="Payment summary" />

            <OrderFinancialDocuments orderId={order.orderId} />

            {canOfferScheduledSelfServiceCancel(order) ? (
              <div className="flex flex-col gap-3" data-testid="order-scheduled-cancel">
                <p className="font-body text-[14px] text-[var(--text-secondary)]">
                  Self-service cancellation stays available until the sealed cutoff for this
                  scheduled order.
                </p>
                {actionError ? (
                  <p role="alert" data-testid="order-cancel-error" className="font-body text-[14px] text-[var(--text-secondary)]">
                    {actionError}
                  </p>
                ) : null}
                {confirmingCancel ? (
                  <div className="flex flex-col gap-2" data-testid="order-cancel-confirm">
                    <p className="font-body text-[14px] font-semibold text-[var(--text-primary)]">
                      Cancel this scheduled order?
                    </p>
                    <p className="font-body text-[13px] text-[var(--text-secondary)]">
                      This cannot be undone from self-service. Support can still help after the
                      cutoff closes.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        type="button"
                        variant="destructive"
                        className="min-h-[44px]"
                        disabled={cancelling}
                        onClick={() => {
                          void onConfirmCancel();
                        }}
                      >
                        {cancelling ? "Cancelling…" : "Confirm cancellation"}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        className="min-h-[44px]"
                        disabled={cancelling}
                        onClick={() => setConfirmingCancel(false)}
                      >
                        Keep order
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button
                    type="button"
                    variant="destructive"
                    className="min-h-[44px] self-start"
                    data-testid="order-cancel-open"
                    onClick={() => {
                      setActionError(null);
                      setConfirmingCancel(true);
                    }}
                  >
                    Cancel scheduled order
                  </Button>
                )}
              </div>
            ) : null}

            <OrderSupportAction orderNumber={order.orderNumber} />

            <Button asChild variant="outline" className="min-h-[44px]">
              <a href="/order/orders/">Back to orders</a>
            </Button>
          </div>
        ) : null}
      </div>
    </main>
  );
}
