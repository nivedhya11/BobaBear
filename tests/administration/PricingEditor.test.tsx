import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { PricingEditor } from "../../src/components/administration/commercial/PricingEditor";
import type {
  CommercialCapabilities,
  CommercialContext,
} from "../../src/components/administration/commercial/commercial-types";
import { COMMERCIAL_CONFLICT_MESSAGE } from "../../src/lib/administration/commercial-errors";

const listPriceBooks = vi.fn();
const getPriceBook = vi.fn();
const attachModifierPrice = vi.fn();
const getCatalogProductGraph = vi.fn();
const previewPriceBookActivation = vi.fn();
const activatePriceBook = vi.fn();
const retireActiveOutletPriceBook = vi.fn();

vi.mock("@/lib/administration/commercial-pricing", () => ({
  listPriceBooks: (...args: unknown[]) => listPriceBooks(...args),
  getPriceBook: (...args: unknown[]) => getPriceBook(...args),
  createPriceBook: vi.fn(),
  attachVariantPrice: vi.fn(),
  attachModifierPrice: (...args: unknown[]) => attachModifierPrice(...args),
  previewPriceBookActivation: (...args: unknown[]) => previewPriceBookActivation(...args),
  activatePriceBook: (...args: unknown[]) => activatePriceBook(...args),
  retireActiveOutletPriceBook: (...args: unknown[]) => retireActiveOutletPriceBook(...args),
}));

vi.mock("@/lib/administration/commercial-catalog", () => ({
  getCatalogProductGraph: (...args: unknown[]) => getCatalogProductGraph(...args),
}));

const context: CommercialContext = {
  brandId: "brand-1",
  brandName: "BOBA",
  productId: "product-1",
  productLabel: "Tea",
  variantId: "variant-1",
  variantLabel: "Regular",
  outletId: null,
  outletLabel: null,
  menuId: null,
};

const capabilities: CommercialCapabilities = {
  catalogRead: false,
  catalogManage: false,
  menuRead: false,
  menuManage: false,
  assortmentRead: false,
  assortmentManage: false,
  pricingRead: true,
  pricingManage: true,
  promotionsRead: false,
  promotionsManage: false,
  promotionsActivate: false,
  couponsRead: false,
  couponsManage: false,
};

const priceBook = {
  id: "pb-1",
  brandId: "brand-1",
  scopeType: "brand" as const,
  territoryId: null,
  organizationId: null,
  outletId: null,
  code: "MAIN",
  name: "Main book",
  salesChannel: "direct" as const,
  currency: "INR" as const,
  taxInclusionMode: "exclusive" as const,
  effectiveFrom: "2026-01-01T00:00:00.000Z",
  effectiveTo: null,
  lifecycleStatus: "draft" as const,
  revision: "5",
};

beforeEach(() => {
  listPriceBooks.mockReset();
  getPriceBook.mockReset();
  attachModifierPrice.mockReset();
  getCatalogProductGraph.mockReset();
  previewPriceBookActivation.mockReset();
  activatePriceBook.mockReset();
  retireActiveOutletPriceBook.mockReset();

  listPriceBooks.mockResolvedValue({
    ok: true,
    status: 200,
    data: { priceBooks: [priceBook] },
  });
  getPriceBook.mockResolvedValue({
    ok: true,
    status: 200,
    data: {
      inspection: {
        priceBook,
        variantPrices: [],
        modifierPrices: [],
        customerEffective: [],
      },
    },
  });
  getCatalogProductGraph.mockResolvedValue({
    ok: true,
    status: 200,
    data: {
      graph: {
        product: { id: "product-1" },
        variants: [{ id: "variant-1" }],
        modifierGroups: [
          {
            id: "mg-1",
            brandId: "brand-1",
            code: "TOPPINGS",
            draftContentRevision: "1",
            draft: { name: "Toppings", description: null, lifecycleStatus: "draft" },
            effective: null,
          },
        ],
        modifierOptions: [
          {
            id: "mo-1",
            brandId: "brand-1",
            code: "PEARL",
            draft: { name: "Pearl", description: null, lifecycleStatus: "draft" },
          },
        ],
        modifierGroupOptions: [
          {
            id: "mgo-1",
            brandId: "brand-1",
            modifierGroupId: "mg-1",
            modifierOptionId: "mo-1",
          },
        ],
        variantModifierGroups: [
          {
            id: "vmg-1",
            brandId: "brand-1",
            variantId: "variant-1",
            modifierGroupId: "mg-1",
          },
        ],
      },
    },
  });
  attachModifierPrice.mockResolvedValue({
    ok: true,
    status: 200,
    data: { modifierPrice: { id: "mp-1" }, priceBookRevision: "6" },
  });
  previewPriceBookActivation.mockResolvedValue({
    ok: true,
    status: 200,
    data: {
      preview: {
        expectedPriceBookRevision: "5",
        lifecycleStatus: "draft",
        customerMonetaryConsequence: "Activation would change customer-effective monetary amounts.",
        variantPriceChanges: [],
        overlapBlockers: [],
        referenceBlockers: [],
        wouldChangeCustomerPricing: true,
      },
    },
  });
  activatePriceBook.mockResolvedValue({ ok: true, status: 200, data: { revision: "6" } });
});

describe("PricingEditor", () => {
  it("shows modifier-price-authoring with product+variant context", async () => {
    const user = userEvent.setup();
    render(
      <PricingEditor
        context={context}
        capabilities={capabilities}
        authoringAllowed
        onStatus={vi.fn()}
      />,
    );
    await waitFor(() => expect(screen.getByText(/Main book \(MAIN\)/)).toBeInTheDocument());
    await user.click(screen.getByRole("button", { name: /Main book \(MAIN\)/ }));
    await waitFor(() => expect(screen.getByTestId("modifier-price-authoring")).toBeInTheDocument());
  });

  it("Attach modifier price calls attachModifierPrice with revision and parsed paise", async () => {
    const user = userEvent.setup();
    render(
      <PricingEditor
        context={context}
        capabilities={capabilities}
        authoringAllowed
        onStatus={vi.fn()}
      />,
    );
    await waitFor(() => expect(screen.getByText(/Main book \(MAIN\)/)).toBeInTheDocument());
    await user.click(screen.getByRole("button", { name: /Main book \(MAIN\)/ }));
    await waitFor(() =>
      expect(screen.getByLabelText("Modifier association and option")).toBeInTheDocument(),
    );
    await user.selectOptions(
      screen.getByLabelText("Modifier association and option"),
      "vmg-1:mgo-1",
    );
    await user.type(screen.getByLabelText("Modifier INR delta"), "20.00");
    await user.click(screen.getByRole("button", { name: "Attach modifier price" }));
    await waitFor(() => expect(attachModifierPrice).toHaveBeenCalled());
    expect(attachModifierPrice).toHaveBeenCalledWith("brand-1", "pb-1", {
      expectedPriceBookRevision: "5",
      variantModifierGroupId: "vmg-1",
      modifierGroupOptionId: "mgo-1",
      priceDeltaPaise: "2000",
    });
  });

  it("surfaces stale conflict from attachModifierPrice via onStatus", async () => {
    const user = userEvent.setup();
    const onStatus = vi.fn();
    attachModifierPrice.mockResolvedValue({
      ok: false,
      status: 409,
      code: "PRICE_BOOK_REVISION_CONFLICT",
    });
    render(
      <PricingEditor
        context={context}
        capabilities={capabilities}
        authoringAllowed
        onStatus={onStatus}
      />,
    );
    await waitFor(() => expect(screen.getByText(/Main book \(MAIN\)/)).toBeInTheDocument());
    await user.click(screen.getByRole("button", { name: /Main book \(MAIN\)/ }));
    await waitFor(() =>
      expect(screen.getByLabelText("Modifier association and option")).toBeInTheDocument(),
    );
    await user.selectOptions(
      screen.getByLabelText("Modifier association and option"),
      "vmg-1:mgo-1",
    );
    await user.type(screen.getByLabelText("Modifier INR delta"), "10");
    await user.click(screen.getByRole("button", { name: "Attach modifier price" }));
    await waitFor(() =>
      expect(onStatus).toHaveBeenCalledWith(COMMERCIAL_CONFLICT_MESSAGE),
    );
  });

  it("activation consumes exact reviewed expectedPriceBookRevision and reports effect", async () => {
    const user = userEvent.setup();
    const onStatus = vi.fn();
    render(
      <PricingEditor
        context={context}
        capabilities={capabilities}
        authoringAllowed
        onStatus={onStatus}
      />,
    );
    await waitFor(() => expect(screen.getByText(/Main book \(MAIN\)/)).toBeInTheDocument());
    await user.click(screen.getByRole("button", { name: /Main book \(MAIN\)/ }));
    await waitFor(() =>
      expect(screen.getByRole("button", { name: /Review & activate/i })).toBeInTheDocument(),
    );
    await user.click(screen.getByRole("button", { name: /Review & activate/i }));
    await waitFor(() => expect(screen.getByTestId("consequence-review-dialog")).toBeInTheDocument());
    expect(screen.getByText("5")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /Confirm effect/i }));
    await waitFor(() => expect(activatePriceBook).toHaveBeenCalled());
    expect(activatePriceBook).toHaveBeenCalledWith("brand-1", "pb-1", {
      expectedPriceBookRevision: "5",
    });
    await waitFor(() => expect(onStatus).toHaveBeenCalledWith("Price book activated."));
  });

  it("stale activation conflict remains recoverable in the review dialog", async () => {
    const user = userEvent.setup();
    activatePriceBook.mockResolvedValue({
      ok: false,
      status: 409,
      code: "PRICE_BOOK_REVISION_CONFLICT",
    });
    render(
      <PricingEditor
        context={context}
        capabilities={capabilities}
        authoringAllowed
        onStatus={vi.fn()}
      />,
    );
    await waitFor(() => expect(screen.getByText(/Main book \(MAIN\)/)).toBeInTheDocument());
    await user.click(screen.getByRole("button", { name: /Main book \(MAIN\)/ }));
    await user.click(await screen.findByRole("button", { name: /Review & activate/i }));
    await waitFor(() => expect(screen.getByTestId("consequence-review-dialog")).toBeInTheDocument());
    await user.click(screen.getByRole("button", { name: /Confirm effect/i }));
    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent(COMMERCIAL_CONFLICT_MESSAGE),
    );
    expect(screen.getByTestId("consequence-review-dialog")).toBeInTheDocument();
  });

  it("Cancel on activation review reports no effect without calling activate", async () => {
    const user = userEvent.setup();
    const onStatus = vi.fn();
    render(
      <PricingEditor
        context={context}
        capabilities={capabilities}
        authoringAllowed
        onStatus={onStatus}
      />,
    );
    await waitFor(() => expect(screen.getByText(/Main book \(MAIN\)/)).toBeInTheDocument());
    await user.click(screen.getByRole("button", { name: /Main book \(MAIN\)/ }));
    await user.click(await screen.findByRole("button", { name: /Review & activate/i }));
    await waitFor(() => expect(screen.getByTestId("consequence-review-dialog")).toBeInTheDocument());
    await user.click(screen.getByRole("button", { name: /^Cancel$/i }));
    expect(activatePriceBook).not.toHaveBeenCalled();
    expect(onStatus).toHaveBeenCalledWith("No effect — draft work remains.");
  });
});

function outletBook(
  overrides: {
    scopeType?: "brand" | "territory" | "organization" | "outlet";
    lifecycleStatus?: "draft" | "active" | "retired";
    outletId?: string | null;
    territoryId?: string | null;
    organizationId?: string | null;
    name?: string;
    code?: string;
  } = {},
) {
  return {
    ...priceBook,
    id: "pb-outlet",
    scopeType: "outlet" as const,
    territoryId: "terr-1",
    organizationId: "org-1",
    outletId: "outlet-1",
    code: "OUTLET-1",
    name: "Outlet book",
    lifecycleStatus: "active" as const,
    ...overrides,
  };
}

function mockInspection(book: ReturnType<typeof outletBook>) {
  listPriceBooks.mockResolvedValue({
    ok: true,
    status: 200,
    data: { priceBooks: [book] },
  });
  getPriceBook.mockResolvedValue({
    ok: true,
    status: 200,
    data: {
      inspection: {
        priceBook: book,
        variantPrices: [],
        modifierPrices: [],
        customerEffective: [],
      },
    },
  });
}

async function openSelectedBook(user: ReturnType<typeof userEvent.setup>) {
  render(
    <PricingEditor
      context={{ ...context, outletId: "outlet-1", outletLabel: "Mall Road" }}
      capabilities={capabilities}
      authoringAllowed
      onStatus={vi.fn()}
    />,
  );
  const row = await screen.findByRole("button", { name: /Outlet book \(OUTLET-1\)/ });
  await user.click(row);
  await screen.findByTestId("price-book-lifecycle");
}

describe("PricingEditor outlet retirement", () => {
  it("shows Retire for an active outlet book when pricing.manage can author", async () => {
    mockInspection(outletBook());
    const user = userEvent.setup();
    await openSelectedBook(user);
    expect(screen.getByTestId("retire-price-book")).toBeInTheDocument();
  });

  it.each([
    ["brand", outletBook({ scopeType: "brand", outletId: null, territoryId: null, organizationId: null, name: "Brand book", code: "BRAND" })],
    ["territory", outletBook({ scopeType: "territory", outletId: null, name: "Territory book", code: "TERR" })],
    ["organization", outletBook({ scopeType: "organization", outletId: null, name: "Organization book", code: "ORG" })],
    ["draft outlet", outletBook({ lifecycleStatus: "draft" })],
    ["retired outlet", outletBook({ lifecycleStatus: "retired" })],
  ] as const)("hides retirement for %s", async (_label, book) => {
    mockInspection(book);
    render(
      <PricingEditor context={context} capabilities={capabilities} authoringAllowed onStatus={vi.fn()} />,
    );
    await screen.findByRole("button", { name: new RegExp(book.name) });
    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: new RegExp(book.name) }));
    await screen.findByTestId("price-book-lifecycle");
    expect(screen.queryByTestId("retire-price-book")).not.toBeInTheDocument();
  });

  it("hides retirement for a read-only pricing actor", async () => {
    mockInspection(outletBook());
    render(
      <PricingEditor
        context={{ ...context, outletId: "outlet-1", outletLabel: "Mall Road" }}
        capabilities={{ ...capabilities, pricingManage: false }}
        authoringAllowed
        onStatus={vi.fn()}
      />,
    );
    await userEvent.click(await screen.findByRole("button", { name: /Outlet book/ }));
    await screen.findByTestId("price-book-lifecycle");
    expect(screen.queryByTestId("retire-price-book")).not.toBeInTheDocument();
  });

  it("hides retirement when the viewport is inspection-only", async () => {
    mockInspection(outletBook());
    render(
      <PricingEditor
        context={{ ...context, outletId: "outlet-1", outletLabel: "Mall Road" }}
        capabilities={capabilities}
        authoringAllowed={false}
        onStatus={vi.fn()}
      />,
    );
    expect(await screen.findByText(/Inspection only on this viewport/)).toBeInTheDocument();
    await userEvent.click(await screen.findByRole("button", { name: /Outlet book/ }));
    await screen.findByTestId("price-book-lifecycle");
    expect(screen.queryByTestId("retire-price-book")).not.toBeInTheDocument();
  });

  it("opens confirmation on the first click without retiring", async () => {
    mockInspection(outletBook());
    const user = userEvent.setup();
    await openSelectedBook(user);
    await user.click(screen.getByTestId("retire-price-book"));
    const dialog = await screen.findByTestId("price-book-retirement-dialog");
    expect(within(dialog).getByText("Outlet book")).toBeInTheDocument();
    expect(within(dialog).getByText("OUTLET-1")).toBeInTheDocument();
    expect(within(dialog).getAllByText("Outlet").length).toBeGreaterThanOrEqual(2);
    expect(within(dialog).getByText("Mall Road")).toBeInTheDocument();
    expect(within(dialog).getByText("Active")).toBeInTheDocument();
    expect(
      within(dialog).getByText(/stops it from participating in future effective price resolution/),
    ).toBeInTheDocument();
    expect(within(dialog).getByText(/cannot be reactivated through this control/)).toBeInTheDocument();
    expect(retireActiveOutletPriceBook).not.toHaveBeenCalled();
  });

  it("Cancel closes confirmation without a retirement request", async () => {
    mockInspection(outletBook());
    const user = userEvent.setup();
    await openSelectedBook(user);
    await user.click(screen.getByTestId("retire-price-book"));
    const dialog = await screen.findByTestId("price-book-retirement-dialog");
    await user.click(within(dialog).getByRole("button", { name: "Cancel" }));
    expect(screen.queryByTestId("price-book-retirement-dialog")).not.toBeInTheDocument();
    expect(retireActiveOutletPriceBook).not.toHaveBeenCalled();
  });

  it("Confirm sends the canonical retire request and refreshes to retired", async () => {
    const active = outletBook();
    const retired = outletBook({ lifecycleStatus: "retired" });
    listPriceBooks.mockResolvedValueOnce({
      ok: true,
      status: 200,
      data: { priceBooks: [active] },
    }).mockResolvedValue({
      ok: true,
      status: 200,
      data: { priceBooks: [retired] },
    });
    getPriceBook.mockResolvedValueOnce({
      ok: true,
      status: 200,
      data: {
        inspection: {
          priceBook: active,
          variantPrices: [],
          modifierPrices: [],
          customerEffective: [],
        },
      },
    }).mockResolvedValue({
      ok: true,
      status: 200,
      data: {
        inspection: {
          priceBook: retired,
          variantPrices: [],
          modifierPrices: [],
          customerEffective: [],
        },
      },
    });
    retireActiveOutletPriceBook.mockResolvedValue({
      ok: true,
      status: 200,
      data: {
        priceBook: {
          id: active.id,
          scopeType: "outlet",
          lifecycleStatus: "retired",
          retiredAt: "2026-09-27T00:00:00.000Z",
          retiredByWorkforceUserId: "wf-1",
        },
      },
    });
    const onStatus = vi.fn();
    const user = userEvent.setup();
    render(
      <PricingEditor
        context={{ ...context, outletId: "outlet-1", outletLabel: "Mall Road" }}
        capabilities={capabilities}
        authoringAllowed
        onStatus={onStatus}
      />,
    );
    await user.click(await screen.findByRole("button", { name: /Outlet book/ }));
    await user.click(await screen.findByTestId("retire-price-book"));
    const dialog = await screen.findByTestId("price-book-retirement-dialog");
    await user.click(within(dialog).getByRole("button", { name: "Retire price book" }));
    await waitFor(() =>
      expect(retireActiveOutletPriceBook).toHaveBeenCalledWith("brand-1", "pb-outlet"),
    );
    expect(await screen.findByTestId("price-book-retirement-status")).toHaveTextContent(
      /Outlet price book retired/,
    );
    expect(screen.getByTestId("price-book-retirement-status")).toHaveAttribute("role", "status");
    await waitFor(() => expect(screen.getByTestId("price-book-lifecycle")).toHaveTextContent("retired"));
    expect(screen.queryByTestId("retire-price-book")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Outlet book/ })).toBeInTheDocument();
    expect(onStatus).toHaveBeenCalledWith(
      "Outlet price book retired. It remains available for inspection.",
    );
  });

  it("shows accessible failure feedback and does not claim success", async () => {
    mockInspection(outletBook());
    retireActiveOutletPriceBook.mockResolvedValue({
      ok: false,
      status: 409,
      code: "PRICING_INVALID_STATE",
      message: "Price book is already retired.",
    });
    const user = userEvent.setup();
    await openSelectedBook(user);
    await user.click(screen.getByTestId("retire-price-book"));
    const dialog = await screen.findByTestId("price-book-retirement-dialog");
    await user.click(within(dialog).getByRole("button", { name: "Retire price book" }));
    const alert = await screen.findByTestId("price-book-retirement-error");
    expect(alert).toHaveAttribute("role", "alert");
    expect(alert).toHaveTextContent("Price book is already retired.");
    expect(screen.queryByTestId("price-book-retirement-status")).not.toBeInTheDocument();
  });

  it("keeps keyboard focus inside the confirmation dialog and Escape cancels", async () => {
    mockInspection(outletBook());
    const user = userEvent.setup();
    await openSelectedBook(user);
    await user.click(screen.getByTestId("retire-price-book"));
    const dialog = await screen.findByTestId("price-book-retirement-dialog");
    const confirm = within(dialog).getByRole("button", { name: "Retire price book" });
    expect(confirm).toHaveFocus();
    await user.tab();
    expect(within(dialog).getByRole("button", { name: "Cancel" })).toHaveFocus();
    await user.tab();
    expect(confirm).toHaveFocus();
    await user.keyboard("{Escape}");
    expect(screen.queryByTestId("price-book-retirement-dialog")).not.toBeInTheDocument();
    expect(retireActiveOutletPriceBook).not.toHaveBeenCalled();
  });
});
