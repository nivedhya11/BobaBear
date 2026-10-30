import type { Metadata } from "next";

import { CheckoutClient } from "@/components/ordering/CheckoutClient";
import { DIRECT_ORDERING_BRAND_ID } from "@/shared/customer-menu/constants";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Checkout your Boba Bear order.",
  alternates: { canonical: "/order/checkout" },
  robots: { index: false, follow: false },
};

export default function CheckoutPage() {
  return <CheckoutClient brandId={DIRECT_ORDERING_BRAND_ID} />;
}
