/**
 * #377 — item-level availability recovery on accepted Cart / Pickup contracts.
 *
 * IMP-026C error matrix: item unavailable → "That item can't be ordered right now"; other items
 * remain; remove the affected line. AC-036H-032: zero eligible Pickup outlets → Delivery remains
 * selectable and the customer may return to cart. Server evaluation stays authoritative.
 */
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { CartClient } from "./CartClient";
import { CartLineList } from "./CartLineList";
import { CheckoutPickupOutletStep } from "./CheckoutPickupOutletStep";
import type { CartLinePresentation } from "./cart-presentation";
import { presentCartLineProblems } from "./cart-line-problem-presentation";
import { writeDeliveryContext } from "@/lib/customer-location/delivery-context";
import type { CustomerMenuProjection } from "@/shared/customer-menu/types";

const getActiveCart = vi.fn<(...args: unknown[]) => unknown>();
const getCustomerMenu = vi.fn<(...args: unknown[]) => unknown>();
const setCartLineQuantity = vi.fn<(...args: unknown[]) => unknown>();
const removeCartLine = vi.fn<(...args: unknown[]) => unknown>();
const evaluateCart = vi.fn<(...args: unknown[]) => unknown>();
const getActiveCheckout = vi.fn<(...args: unknown[]) => unknown>();

vi.mock("@/lib/customer-commerce", async () => {
  const actual = await vi.importActual<typeof import("@/lib/customer-commerce")>(
    "@/lib/customer-commerce",
  );
  return {
    ...actual,
    getActiveCart: (...args: unknown[]) => getActiveCart(...args),
    getCustomerMenu: (...args: unknown[]) => getCustomerMenu(...args),
    setCartLineQuantity: (...args: unknown[]) => setCartLineQuantity(...args),
    removeCartLine: (...args: unknown[]) => removeCartLine(...args),
    evaluateCart: (...args: unknown[]) => evaluateCart(...args),
    getActiveCheckout: (...args: unknown[]) => getActiveCheckout(...args),
  };
});

vi.mock("@/lib/customer-commerce/ordering-outlet-context", () => ({
  resolveCustomerOrderingOutletContext: vi.fn(async (input: { coordinates?: unknown }) =>
    input.coordinates ? { kind: "indeterminate" as const } : { kind: "no_location" as const },
  ),
  menuOutletIdFromOrderingContext: (context: { kind: string; outletId?: string }) =>
    context.kind === "serviceable" ? context.outletId : undefined,
}));

const brandId = "brand-1";
const gangnamVariant = "var-gangnam";
const taroVariant = "var-taro";
const UNAVAILABLE_COPY = "That item can't be ordered right now.";

const menu: CustomerMenuProjection = {
  brandId,
  menuId: "menu-1",
  name: "Primary Menu",
  sections: [{ id: "sec-1", parentSectionId: null, name: "Drinks", position: 1 }],
  items: [
    {
      productId: "prod-gangnam",
      variantId: gangnamVariant,
      sectionId: "sec-1",
      name: "Gangnam Style Iced Coffee Boba",
      description: null,
      imagePath: null,
      displayPricePaise: 19900,
      currency: "INR",
    },
    {
      productId: "prod-taro",
      variantId: taroVariant,
      sectionId: "sec-1",
      name: "Purple Rain Taro Boba",
      description: null,
      imagePath: null,
      displayPricePaise: 25900,
      currency: "INR",
    },
  ],
};

function cart(revision: string, lines: ReadonlyArray<{ id: string; variantId: string; quantity: number }>) {
  return {
    id: "cart-1",
    brandId,
    ownerMode: "guest" as const,
    revision,
    manualCouponCode: null,
    expiresAt: null,
    createdAt: "2026-10-08T00:00:00.000Z",
    updatedAt: "2026-10-08T00:00:00.000Z",
    lines: lines.map((line) => ({ modifiers: [], bundleSelections: [], ...line })),
  };
}

const twoLineCart = cart("1", [
  { id: "line-gangnam", variantId: gangnamVariant, quantity: 3 },
  { id: "line-taro", variantId: taroVariant, quantity: 1 },
]);

function evaluation(status: string, revision: string, problems?: ReadonlyArray<{ cartLineId: string; code: string }>) {
  return {
    ok: true,
    status: 200,
    data: {
      cartId: "cart-1",
      cartRevision: revision,
      evaluatedAt: "2026-10-08T00:00:00.000Z",
      status,
      ...(problems ? { problems } : {}),
    },
  };
}

function presentation(overrides: Partial<CartLinePresentation>): CartLinePresentation {
  return {
    lineId: "line-gangnam",
    variantId: gangnamVariant,
    itemName: "Gangnam Style Iced Coffee Boba",
    quantity: 3,
    imagePath: null,
    unitPricePaise: 19900,
    lineTotalPaise: 59700,
    fullyResolvable: true,
    customizable: false,
    editEligible: false,
    modifiers: [],
    hasBundleSelections: false,
    ...overrides,
  };
}

function withDeliveryLocation(): void {
  writeDeliveryContext({
    displayLabel: "Rajpur Road",
    coordinates: { latitude: "30.3256000", longitude: "78.0436000" },
    source: "location_search",
  });
}

beforeEach(() => {
  window.sessionStorage.clear();
  getActiveCheckout.mockResolvedValue({ ok: true, status: 200, data: { checkout: null } });
  getCustomerMenu.mockResolvedValue({ ok: true, status: 200, data: { menu } });
  getActiveCart.mockResolvedValue({ ok: true, status: 200, data: { cart: twoLineCart } });
  evaluateCart.mockResolvedValue(evaluation("REQUIRES_FULFILMENT_CONTEXT", "1"));
});

describe("#377 presentCartLineProblems", () => {
  const lines = [
    presentation({}),
    presentation({ lineId: "line-taro", variantId: taroVariant, itemName: "Purple Rain Taro Boba" }),
  ];

  it("names the affected line and leaves unaffected lines without problems", () => {
    const result = presentCartLineProblems(
      {
        cartRevision: "1",
        problems: [{ cartLineId: "line-gangnam", code: "LINE_VARIANT_UNAVAILABLE" }],
      },
      "1",
      lines,
    );
    expect(result.byLineId.get("line-gangnam")).toEqual([UNAVAILABLE_COPY]);
    expect(result.byLineId.has("line-taro")).toBe(false);
    expect(result.summary).toEqual([
      { key: "line-gangnam:LINE_VARIANT_UNAVAILABLE", itemName: "Gangnam Style Iced Coffee Boba", message: UNAVAILABLE_COPY },
    ]);
  });

  it("deduplicates copy per line and never renders raw codes", () => {
    const result = presentCartLineProblems(
      {
        cartRevision: "1",
        problems: [
          { cartLineId: "line-gangnam", code: "LINE_VARIANT_UNAVAILABLE" },
          { cartLineId: "line-gangnam", code: "LINE_NOT_IN_ASSORTMENT" },
        ],
      },
      "1",
      lines,
    );
    expect(result.byLineId.get("line-gangnam")).toEqual([UNAVAILABLE_COPY]);
    expect(JSON.stringify(result)).not.toMatch(/"message":"LINE_/);
  });

  it("drops problems for lines no longer in the cart when the evaluation is stale", () => {
    const stale = presentCartLineProblems(
      {
        cartRevision: "1",
        problems: [{ cartLineId: "line-removed", code: "LINE_VARIANT_UNAVAILABLE" }],
      },
      "2",
      lines,
    );
    expect(stale.summary).toEqual([]);
    const current = presentCartLineProblems(
      {
        cartRevision: "2",
        problems: [{ cartLineId: "line-unknown", code: "LINE_VARIANT_UNAVAILABLE" }],
      },
      "2",
      lines,
    );
    expect(current.summary).toEqual([
      { key: "line-unknown:LINE_VARIANT_UNAVAILABLE", itemName: null, message: UNAVAILABLE_COPY },
    ]);
  });

  it("returns nothing without an evaluation", () => {
    const result = presentCartLineProblems(null, "1", lines);
    expect(result.summary).toEqual([]);
    expect(result.byLineId.size).toBe(0);
  });
});

describe("#377 CartLineList line-level recovery", () => {
  const lines = [
    presentation({}),
    presentation({ lineId: "line-taro", variantId: taroVariant, itemName: "Purple Rain Taro Boba", quantity: 1 }),
  ];
  const lineProblems = new Map([["line-gangnam", [UNAVAILABLE_COPY]]]);

  it("attaches the message to the affected line and describes its Remove action", () => {
    render(
      <CartLineList
        lines={lines}
        lineProblems={lineProblems}
        onChangeQuantity={vi.fn()}
        onRemove={vi.fn()}
      />,
    );
    const items = screen.getAllByRole("listitem").filter((node) => node.dataset.cartLineId);
    const affected = items.find((node) => node.dataset.cartLineId === "line-gangnam")!;
    const unaffected = items.find((node) => node.dataset.cartLineId === "line-taro")!;

    expect(affected).toHaveAttribute("data-line-attention", "true");
    expect(within(affected).getByTestId("cart-line-problem")).toHaveTextContent(UNAVAILABLE_COPY);
    const remove = within(affected).getByRole("button", {
      name: /remove gangnam style iced coffee boba from cart/i,
    });
    expect(remove).toHaveAccessibleDescription(UNAVAILABLE_COPY);

    expect(unaffected).not.toHaveAttribute("data-line-attention");
    expect(within(unaffected).queryByTestId("cart-line-problem")).not.toBeInTheDocument();
    expect(
      within(unaffected).getByRole("button", { name: /increase purple rain taro boba quantity/i }),
    ).toBeEnabled();
  });

  it("shows the same line message in the compact desktop live cart", () => {
    render(
      <CartLineList lines={lines} lineProblems={lineProblems} compact onChangeQuantity={vi.fn()} />,
    );
    const problems = screen.getAllByTestId("cart-line-problem");
    expect(problems).toHaveLength(1);
    expect(problems[0]).toHaveTextContent(UNAVAILABLE_COPY);
  });
});

describe("#377 CartClient became-unavailable-after-add recovery", () => {
  it("names the unavailable item, preserves other lines, and recovers after removing it", async () => {
    const user = userEvent.setup();
    withDeliveryLocation();
    evaluateCart
      .mockResolvedValueOnce(
        evaluation("CART_INVALID", "1", [
          { cartLineId: "line-gangnam", code: "LINE_VARIANT_UNAVAILABLE" },
        ]),
      )
      .mockResolvedValueOnce(evaluation("COMPLETE", "2"));
    removeCartLine.mockResolvedValue({
      ok: true,
      status: 200,
      data: { cart: cart("2", [{ id: "line-taro", variantId: taroVariant, quantity: 1 }]) },
    });

    render(<CartClient brandId={brandId} />);

    const summary = await screen.findByTestId("cart-evaluation-problems");
    expect(summary).toHaveAttribute("role", "alert");
    expect(summary).toHaveTextContent(`Gangnam Style Iced Coffee Boba: ${UNAVAILABLE_COPY}`);
    expect(summary).not.toHaveTextContent(/pickup|deliver/i);

    const lineProblem = screen.getByTestId("cart-line-problem");
    expect(lineProblem.closest("[data-cart-line-id]")).toHaveAttribute(
      "data-cart-line-id",
      "line-gangnam",
    );
    expect(screen.getByText("Purple Rain Taro Boba")).toBeInTheDocument();
    for (const button of screen.getAllByRole("button", { name: "Checkout" })) {
      expect(button).toBeDisabled();
    }
    expect(removeCartLine).not.toHaveBeenCalled();
    expect(setCartLineQuantity).not.toHaveBeenCalled();

    await user.click(
      screen.getByRole("button", { name: /remove gangnam style iced coffee boba from cart/i }),
    );

    await waitFor(() =>
      expect(removeCartLine).toHaveBeenCalledWith({
        brandId,
        cartLineId: "line-gangnam",
        expectedRevision: "1",
      }),
    );
    await waitFor(() => expect(evaluateCart).toHaveBeenCalledTimes(2));
    await waitFor(() =>
      expect(screen.queryByTestId("cart-evaluation-problems")).not.toBeInTheDocument(),
    );
    expect(screen.queryByTestId("cart-line-problem")).not.toBeInTheDocument();
    expect(screen.getByText("Purple Rain Taro Boba")).toBeInTheDocument();
    expect(screen.queryByText("Gangnam Style Iced Coffee Boba")).not.toBeInTheDocument();
    for (const button of screen.getAllByRole("button", { name: "Checkout" })) {
      expect(button).toBeEnabled();
    }
  });

  it("does not claim unavailability when no delivery location gives an authoritative outlet", async () => {
    render(<CartClient brandId={brandId} />);
    expect(await screen.findByText("Gangnam Style Iced Coffee Boba")).toBeInTheDocument();
    await waitFor(() => expect(evaluateCart).toHaveBeenCalled());
    expect(screen.queryByTestId("cart-evaluation-problems")).not.toBeInTheDocument();
    expect(screen.queryByTestId("cart-line-problem")).not.toBeInTheDocument();
  });
});

describe("#377 Pickup unavailable recovery (AC-036H-032)", () => {
  it("keeps Delivery selectable and offers a route back to the cart", async () => {
    const user = userEvent.setup();
    const onChooseDelivery = vi.fn();
    render(
      <CheckoutPickupOutletStep
        pending={false}
        loading={false}
        selectionPolicy="UNAVAILABLE"
        outlets={[]}
        selectedOutletId={null}
        onSelectOutlet={vi.fn()}
        onContinue={vi.fn()}
        onChooseDelivery={onChooseDelivery}
        onBackToMode={vi.fn()}
      />,
    );
    expect(screen.getByRole("alert")).toHaveTextContent(/can take this order for pickup/i);
    const reviewCart = screen.getByRole("link", { name: "Review cart" });
    expect(reviewCart).toHaveAttribute("href", "/order/cart/");
    await user.click(screen.getByRole("button", { name: "Choose Delivery" }));
    expect(onChooseDelivery).toHaveBeenCalledTimes(1);
  });

  it("disables the cart route while a checkout mutation is pending", () => {
    render(
      <CheckoutPickupOutletStep
        pending
        loading={false}
        selectionPolicy="UNAVAILABLE"
        outlets={[]}
        selectedOutletId={null}
        onSelectOutlet={vi.fn()}
        onContinue={vi.fn()}
        onChooseDelivery={vi.fn()}
        onBackToMode={vi.fn()}
      />,
    );
    expect(screen.getByRole("link", { name: "Review cart" })).toHaveAttribute(
      "aria-disabled",
      "true",
    );
  });
});
