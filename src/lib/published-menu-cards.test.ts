import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import {
  publishedMenuChapters,
  publishedMenuHeading,
  publishedMenuSectionDomId,
} from "./published-menu-cards";
import type { CustomerMenuProjection } from "@/shared/customer-menu/types";

function menu(
  overrides: Partial<CustomerMenuProjection> = {},
): CustomerMenuProjection {
  return {
    brandId: "brand-1",
    menuId: "menu-1",
    name: "House menu",
    sections: [],
    items: [],
    ...overrides,
  };
}

describe("publishedMenuChapters", () => {
  it("groups published sections by parent without category-name filters", () => {
    const chapters = publishedMenuChapters(
      menu({
        sections: [
          { id: "plates", parentSectionId: null, name: "Late Plates", position: 2 },
          { id: "child", parentSectionId: "drinks", name: "Still Water", position: 1 },
          { id: "drinks", parentSectionId: null, name: "Cold Bar", position: 0 },
        ],
        items: [
          {
            productId: "p-water",
            variantId: "v-water",
            sectionId: "child",
            name: "Still Water",
            description: "Cold",
            imagePath: "/water.jpg",
            displayPricePaise: 9000,
            currency: "INR",
          },
          {
            productId: "p-plate",
            variantId: "v-plate",
            sectionId: "plates",
            name: "Night Plate",
            description: null,
            imagePath: null,
            displayPricePaise: 25000,
            currency: "INR",
          },
        ],
      }),
    );

    expect(chapters.map((chapter) => chapter.name)).toEqual(["Cold Bar", "Late Plates"]);
    expect(chapters[0]?.tabs.map((tab) => tab.name)).toEqual(["Still Water"]);
    expect(chapters[0]?.tabs[0]?.cards[0]).toMatchObject({
      variantId: "v-water",
      displayPricePaise: 9000,
      imagePath: "/water.jpg",
    });
    expect(chapters[1]?.tabs[0]?.cards[0]?.description).toBe("");
  });

  it("keeps a nested item under its root and does not drop an item whose section row is missing", () => {
    const chapters = publishedMenuChapters(
      menu({
        sections: [
          { id: "root", parentSectionId: null, name: "Root", position: 0 },
          { id: "mid", parentSectionId: "root", name: "Mid", position: 0 },
          { id: "leaf", parentSectionId: "mid", name: "Leaf", position: 0 },
        ],
        items: [
          {
            productId: "p-leaf",
            variantId: "v-leaf",
            sectionId: "leaf",
            name: "Leaf Item",
            description: null,
            imagePath: null,
            displayPricePaise: 100,
            currency: "INR",
          },
          {
            productId: "p-orphan",
            variantId: "v-orphan",
            sectionId: "missing",
            name: "Unplaced Item",
            description: null,
            imagePath: null,
            displayPricePaise: 200,
            currency: "INR",
          },
        ],
      }),
    );

    expect(chapters[0]?.tabs.map((tab) => tab.name)).toEqual(["Leaf"]);
    expect(chapters[1]).toMatchObject({ name: "House menu" });
    expect(chapters[1]?.tabs[0]?.cards.map((card) => card.name)).toEqual(["Unplaced Item"]);
  });

  it("returns no chapters when nothing is published", () => {
    expect(publishedMenuChapters(menu())).toEqual([]);
  });
});

describe("published menu heading and anchors", () => {
  it("splits a published name for the brand heading treatment", () => {
    expect(publishedMenuHeading("Cold Bar")).toEqual({
      leading: "Cold",
      accent: "Bar",
      glue: false,
    });
    expect(publishedMenuHeading("Momos")).toEqual({
      leading: "",
      accent: "Momos",
      glue: true,
    });
  });

  it("reserves the first three brand anchors and then uses the published section id", () => {
    expect(publishedMenuSectionDomId(0, "sec-a")).toBe("bar");
    expect(publishedMenuSectionDomId(1, "sec-b")).toBe("plates");
    expect(publishedMenuSectionDomId(2, "sec-c")).toBe("sweet");
    expect(publishedMenuSectionDomId(3, "sec-d")).toBe("published-menu-sec-d");
  });
});

describe("runtime menu sources", () => {
  it("does not import the static menu or ordering catalog into sellable surfaces", () => {
    const files = [
      "src/components/TheBar.tsx",
      "src/components/ThePlates.tsx",
      "src/components/TheSweet.tsx",
      "src/components/PublishedMenuChapters.tsx",
      "src/components/PublishedMenuRail.tsx",
      "src/app/(customer)/order/checkout/page.tsx",
      "src/components/ordering/CheckoutClient.tsx",
      "src/components/ordering/PreviousPaymentRecoveryView.tsx",
    ];
    for (const file of files) {
      const source = readFileSync(file, "utf8");
      expect(source, file).not.toContain("menu.json");
      expect(source, file).not.toContain("ordering-catalog.json");
      expect(source, file).not.toContain("MENU_IMAGES");
      expect(source, file).not.toContain("presentationPriceRupees");
    }
  });
});
