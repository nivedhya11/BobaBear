"use client";

import { Button } from "@/components/ui/Button";
import {
  CHECKOUT_ITEM_ATTENTION_RECOVERY_COPY,
  type CheckoutItemAttention,
} from "@/components/ordering/checkout-unavailable-item-presentation";

export function CheckoutItemAttentionNotice(props: {
  items: readonly CheckoutItemAttention[];
  showReturnLink?: boolean;
}) {
  const showReturnLink = props.showReturnLink !== false;
  return (
    <div
      role="alert"
      data-testid="checkout-item-attention"
      className="flex flex-col gap-3 rounded-lg border border-[var(--border-warning)] bg-[var(--bg-section)] p-3"
    >
      <p className="font-body text-[14px] text-[var(--text-secondary)]">
        <span className="font-semibold text-[var(--text-primary)]">Needs attention: </span>
        Other items in your cart are unchanged.
      </p>
      <ul className="flex flex-col gap-2">
        {props.items.map((item) => (
          <li
            key={item.key}
            data-testid="checkout-item-attention-line"
            className="font-body text-[14px] text-[var(--text-secondary)]"
          >
            {item.message}
          </li>
        ))}
      </ul>
      <p className="font-body text-[14px] text-[var(--text-secondary)]">
        {CHECKOUT_ITEM_ATTENTION_RECOVERY_COPY}
      </p>
      {showReturnLink ? (
        <Button asChild variant="outline" className="min-h-[44px]">
          <a href="/order/cart/" data-testid="checkout-return-to-cart">
            Return to cart
          </a>
        </Button>
      ) : null}
    </div>
  );
}
