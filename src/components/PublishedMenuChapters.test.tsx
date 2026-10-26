import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { PublishedMenuChapters } from "./PublishedMenuChapters";
import { DIRECT_ORDERING_BRAND_ID } from "@/shared/customer-menu/constants";
import type { CustomerMenuProjection } from "@/shared/customer-menu/types";

const getCustomerMenu = vi.fn<(...args: unknown[]) => unknown>();

vi.mock("@/lib/customer-commerce", () => ({
  getCustomerMenu: (...args: unknown[]) => getCustomerMenu(...args),
}));

const published: CustomerMenuProjection = {
  brandId: DIRECT_ORDERING_BRAND_ID,
  menuId: "menu-1",
  name: "House menu",
  sections: [
    { id: "drinks", parentSectionId: null, name: "Cold Bar", position: 0 },
    { id: "milk", parentSectionId: "drinks", name: "Milk", position: 0 },
    { id: "water", parentSectionId: "drinks", name: "Water", position: 1 },
    { id: "plates", parentSectionId: null, name: "Night Plates", position: 1 },
  ],
  items: [
    {
      productId: "p-milk",
      variantId: "v-milk",
      sectionId: "milk",
      name: "Published Milk",
      description: "From the projection",
      imagePath: null,
      displayPricePaise: 17900,
      currency: "INR",
    },
    {
      productId: "p-water",
      variantId: "v-water",
      sectionId: "water",
      name: "Published Water",
      description: null,
      imagePath: "/water.jpg",
      displayPricePaise: 9000,
      currency: "INR",
    },
    {
      productId: "p-plate",
      variantId: "v-plate",
      sectionId: "plates",
      name: "Published Plate",
      description: "Savory",
      imagePath: null,
      displayPricePaise: 24000,
      currency: "INR",
    },
  ],
};

describe("PublishedMenuChapters", () => {
  beforeEach(() => {
    getCustomerMenu.mockReset();
  });

  it("renders published section names and display prices, not a hardcoded product list", async () => {
    getCustomerMenu.mockResolvedValue({ ok: true, status: 200, data: { menu: published } });

    render(<PublishedMenuChapters />);

    expect(await screen.findByRole("heading", { name: /Cold Bar/ })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /Night Plates/ })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Published Milk", level: 3 })).toBeInTheDocument();
    expect(screen.queryByText("₹179.00")).not.toBeInTheDocument();
    expect(screen.queryByText("₹90.00")).not.toBeInTheDocument();
    expect(screen.queryByText("Hong Kong Milk Tea Boba")).not.toBeInTheDocument();
    expect(document.getElementById("bar")).toBeTruthy();
    expect(document.getElementById("plates")).toBeTruthy();
    expect(getCustomerMenu).toHaveBeenCalledWith({ brandId: DIRECT_ORDERING_BRAND_ID });

    await userEvent.click(screen.getByRole("tab", { name: "Water" }));
    expect(screen.getByRole("heading", { name: "Published Water", level: 3 })).toBeInTheDocument();
    expect(screen.queryByText("₹90.00")).not.toBeInTheDocument();
  });

  it("keeps food on the plates chapter when it is published first", async () => {
    getCustomerMenu.mockResolvedValue({
      ok: true,
      status: 200,
      data: {
        menu: {
          ...published,
          sections: [
            { id: "plates", parentSectionId: null, name: "Night Plates", position: 0 },
            { id: "seasonal", parentSectionId: null, name: "Seasonal", position: 1 },
            { id: "sweet", parentSectionId: null, name: "Beary Sweet", position: 2 },
            { id: "drinks", parentSectionId: null, name: "Cold Bar", position: 3 },
            { id: "milk", parentSectionId: "drinks", name: "Milk", position: 0 },
          ],
          items: [
            ...published.items,
            {
              productId: "p-sweet",
              variantId: "v-sweet",
              sectionId: "sweet",
              name: "Published Sundae",
              description: "Cold",
              imagePath: "/sundae.jpg",
              displayPricePaise: 15000,
              currency: "INR",
            },
            {
              productId: "p-seasonal",
              variantId: "v-seasonal",
              sectionId: "seasonal",
              name: "Published Special",
              description: "Limited",
              imagePath: null,
              displayPricePaise: 12000,
              currency: "INR",
            },
          ],
        },
      },
    });

    render(<PublishedMenuChapters />);

    expect(await screen.findByRole("heading", { name: /Night Plates/ })).toBeInTheDocument();
    expect(document.getElementById("plates")).toHaveTextContent("Published Plate");
    expect(document.getElementById("sweet")).toHaveTextContent("Published Sundae");
    expect(document.getElementById("sweet")).not.toHaveTextContent("Published Plate");
    expect(document.getElementById("bar")).toHaveTextContent("Published Milk");
    expect(document.getElementById("published-menu-seasonal")).toHaveTextContent("Published Special");
    expect(document.getElementById("bar")).not.toHaveTextContent("Published Plate");
    expect(screen.queryByText("₹240.00")).not.toBeInTheDocument();
  });

  it("fails closed when the published menu cannot be read", async () => {
    getCustomerMenu.mockResolvedValue({
      ok: false,
      status: 404,
      code: "MENU_UNAVAILABLE",
      message: "No active menu",
    });

    render(<PublishedMenuChapters />);

    expect(await screen.findByText("The menu isn't available right now.")).toBeInTheDocument();
    expect(screen.queryByTestId("published-menu-card")).not.toBeInTheDocument();
  });

  it("shows an empty state when the published menu has no sellable cards", async () => {
    getCustomerMenu.mockResolvedValue({
      ok: true,
      status: 200,
      data: {
        menu: {
          ...published,
          sections: [],
          items: [],
        },
      },
    });

    render(<PublishedMenuChapters />);

    expect(await screen.findByText("Nothing is on the menu right now.")).toBeInTheDocument();
    expect(screen.queryByText("Published Milk")).not.toBeInTheDocument();
  });
});
