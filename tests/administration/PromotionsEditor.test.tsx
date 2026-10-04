import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { PromotionsEditor } from "../../src/components/administration/commercial/PromotionsEditor";
import type {
  CommercialCapabilities,
  CommercialContext,
} from "../../src/components/administration/commercial/commercial-types";
import {
  COPY_CANCEL,
  COPY_OP_GIFT,
  COPY_OP_RETIRED,
  COPY_RETIRE_CONFIRM,
  COPY_RETIRE_TITLE,
} from "../../src/shared/promotions/operator-copy";

const listPromotions = vi.fn();
const listCoupons = vi.fn();
const getPromotion = vi.fn();
const createPromotion = vi.fn();
const savePromotionDraft = vi.fn();
const savePromotionBenefit = vi.fn();
const setPromotionTargets = vi.fn();
const previewPromotionConsequence = vi.fn();
const retirePromotion = vi.fn();
const activatePromotion = vi.fn();

vi.mock("@/lib/administration/commercial-promotions", () => ({
  listPromotions: (...args: unknown[]) => listPromotions(...args),
  listCoupons: (...args: unknown[]) => listCoupons(...args),
  getPromotion: (...args: unknown[]) => getPromotion(...args),
  createPromotion: (...args: unknown[]) => createPromotion(...args),
  createCoupon: vi.fn(),
  savePromotionDraft: (...args: unknown[]) => savePromotionDraft(...args),
  savePromotionBenefit: (...args: unknown[]) => savePromotionBenefit(...args),
  setPromotionTargets: (...args: unknown[]) => setPromotionTargets(...args),
  previewPromotionConsequence: (...args: unknown[]) => previewPromotionConsequence(...args),
  previewCouponConsequence: vi.fn(),
  activatePromotion: (...args: unknown[]) => activatePromotion(...args),
  retirePromotion: (...args: unknown[]) => retirePromotion(...args),
  activateCoupon: vi.fn(),
  disableCoupon: vi.fn(),
  enableCoupon: vi.fn(),
  retireCoupon: vi.fn(),
}));

const baseContext: CommercialContext = {
  brandId: "brand-1",
  brandName: "BOBA",
  productId: null,
  productLabel: null,
  variantId: null,
  variantLabel: null,
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
  pricingRead: false,
  pricingManage: false,
  promotionsRead: true,
  promotionsManage: true,
  promotionsActivate: true,
  couponsRead: true,
  couponsManage: true,
};

function draftPromotion(overrides: Partial<{
  id: string;
  triggerType: "automatic" | "coupon";
  revision: string;
  status: "draft" | "active" | "retired";
}> = {}) {
  return {
    id: overrides.id ?? "promo-1",
    brandId: "brand-1",
    code: "WELCOME",
    displayName: "Welcome",
    scopeType: "brand",
    territoryId: null,
    organizationId: null,
    outletId: null,
    salesChannel: "online",
    status: (overrides.status ?? "draft") as "draft" | "active" | "retired",
    triggerType: (overrides.triggerType ?? "automatic") as "automatic" | "coupon",
    stackingPolicy: "exclusive",
    priority: 100,
    startsAt: "2026-01-01T00:00:00.000Z",
    endsAt: null,
    minimumQualifyingAmountPaise: null,
    minimumItemQuantity: null,
    firstOrderOnly: false,
    eligibleFulfilmentModes: null,
    eligibleFulfilmentTimings: null,
    maximumRedemptions: null,
    maximumRedemptionsPerCustomer: null,
    complimentaryItem: false,
    revision: overrides.revision ?? "1",
    supportedLifecycleStates: ["draft", "active", "retired"] as const,
  };
}

function mockPromotionDetail(promotion: ReturnType<typeof draftPromotion>) {
  listPromotions.mockResolvedValue({
    ok: true,
    status: 200,
    data: { promotions: [promotion] },
  });
  listCoupons.mockResolvedValue({ ok: true, status: 200, data: { coupons: [] } });
  getPromotion.mockResolvedValue({
    ok: true,
    status: 200,
    data: {
      promotion,
      benefit: null,
      qualifierTargets: [],
      benefitTargets: [],
      redemptionCounts: {
        reservedCount: 0,
        consumedCount: 0,
        releasedCount: 0,
        applicationCount: 0,
      },
    },
  });
}

beforeEach(() => {
  listPromotions.mockReset();
  listCoupons.mockReset();
  getPromotion.mockReset();
  createPromotion.mockReset();
  savePromotionDraft.mockReset();
  savePromotionBenefit.mockReset();
  setPromotionTargets.mockReset();
  setPromotionTargets.mockResolvedValue({ ok: true, status: 200, data: { revision: "2" } });
  savePromotionDraft.mockResolvedValue({ ok: true, status: 200, data: { revision: "2" } });
  savePromotionBenefit.mockResolvedValue({ ok: true, status: 200, data: { revision: "2" } });
  createPromotion.mockResolvedValue({
    ok: true,
    status: 200,
    data: { promotion: { id: "promo-new", revision: "1" } },
  });
  previewPromotionConsequence.mockReset();
  retirePromotion.mockReset();
  activatePromotion.mockReset();
  mockPromotionDetail(draftPromotion());
});

describe("PromotionsEditor", () => {
  it("documents only draft/active/retired lifecycle labels", async () => {
    render(
      <PromotionsEditor
        context={baseContext}
        capabilities={capabilities}
        authoringAllowed
        onStatus={vi.fn()}
      />,
    );
    await waitFor(() => expect(screen.getByTestId("promotions-editor")).toBeInTheDocument());
    expect(
      screen.getByText(/Lifecycle states: draft, active, retired only/i),
    ).toBeInTheDocument();
    const editor = screen.getByTestId("promotions-editor");
    expect(editor.textContent).not.toMatch(/\bscheduled\b/i);
    expect(editor.textContent).not.toMatch(/\bended\b/i);
    expect(editor.textContent).not.toMatch(/\bpaused\b/i);
  });

  it("create UI has Trigger type select", async () => {
    render(
      <PromotionsEditor
        context={baseContext}
        capabilities={capabilities}
        authoringAllowed
        onStatus={vi.fn()}
      />,
    );
    await waitFor(() => expect(screen.getByTestId("promotions-editor")).toBeInTheDocument());
    expect(screen.getByLabelText("Trigger type")).toBeInTheDocument();
  });

  it("automatic trigger hides Create coupon and shows coupon-triggered explanation", async () => {
    const user = userEvent.setup();
    mockPromotionDetail(draftPromotion({ triggerType: "automatic" }));
    render(
      <PromotionsEditor
        context={baseContext}
        capabilities={capabilities}
        authoringAllowed
        onStatus={vi.fn()}
      />,
    );
    await waitFor(() => expect(screen.getByText(/Welcome \(WELCOME\)/)).toBeInTheDocument());
    await user.click(screen.getByRole("button", { name: /Welcome \(WELCOME\)/ }));
    await waitFor(() => expect(screen.getByText(/Trigger: automatic/)).toBeInTheDocument());
    expect(screen.queryByTestId("coupon-authoring")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Create coupon/i })).not.toBeInTheDocument();
    expect(
      screen.getByText(/Coupons require a coupon-triggered Promotion/i),
    ).toBeInTheDocument();
  });

  it("coupon trigger shows Create coupon authoring", async () => {
    const user = userEvent.setup();
    mockPromotionDetail(draftPromotion({ triggerType: "coupon" }));
    render(
      <PromotionsEditor
        context={baseContext}
        capabilities={capabilities}
        authoringAllowed
        onStatus={vi.fn()}
      />,
    );
    await waitFor(() => expect(screen.getByText(/Welcome \(WELCOME\)/)).toBeInTheDocument());
    await user.click(screen.getByRole("button", { name: /Welcome \(WELCOME\)/ }));
    await waitFor(() => expect(screen.getByTestId("coupon-authoring")).toBeInTheDocument());
    expect(screen.getByRole("button", { name: /Create coupon/i })).toBeInTheDocument();
  });

  it("draft promotion with product+variant context sets qualifier via setPromotionTargets", async () => {
    const user = userEvent.setup();
    mockPromotionDetail(draftPromotion({ revision: "3" }));
    setPromotionTargets.mockResolvedValue({ ok: true, status: 200, data: {} });
    render(
      <PromotionsEditor
        context={{
          ...baseContext,
          productId: "product-1",
          productLabel: "Tea",
          variantId: "variant-1",
          variantLabel: "Regular",
        }}
        capabilities={capabilities}
        authoringAllowed
        onStatus={vi.fn()}
      />,
    );
    await waitFor(() => expect(screen.getByText(/Welcome \(WELCOME\)/)).toBeInTheDocument());
    await user.click(screen.getByRole("button", { name: /Welcome \(WELCOME\)/ }));
    await waitFor(() => expect(screen.getByTestId("promotion-targets")).toBeInTheDocument());
    await user.click(screen.getByRole("button", { name: "Set qualifier to selected variant" }));
    await waitFor(() => expect(setPromotionTargets).toHaveBeenCalled());
    expect(setPromotionTargets).toHaveBeenCalledWith("brand-1", "promo-1", {
      expectedPromotionRevision: "3",
      targetRole: "qualifier",
      targets: [
        {
          targetType: "variant",
          variantId: "variant-1",
          productId: null,
          chargeDefinitionId: null,
        },
      ],
    });
  });

  it("manage without activate hides Review & activate and Review & retire", async () => {
    const user = userEvent.setup();
    mockPromotionDetail(draftPromotion());
    render(
      <PromotionsEditor
        context={baseContext}
        capabilities={{
          ...capabilities,
          promotionsManage: true,
          promotionsActivate: false,
        }}
        authoringAllowed
        onStatus={vi.fn()}
      />,
    );
    await waitFor(() => expect(screen.getByText(/Welcome \(WELCOME\)/)).toBeInTheDocument());
    await user.click(screen.getByRole("button", { name: /Welcome \(WELCOME\)/ }));
    await waitFor(() => expect(screen.getByLabelText("Benefit type")).toBeInTheDocument());
    expect(screen.queryByRole("button", { name: /Review & activate/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Review & retire/i })).not.toBeInTheDocument();
  });

  it("manage with activate exposes Review & activate", async () => {
    const user = userEvent.setup();
    mockPromotionDetail(draftPromotion());
    render(
      <PromotionsEditor
        context={baseContext}
        capabilities={{
          ...capabilities,
          promotionsManage: true,
          promotionsActivate: true,
        }}
        authoringAllowed
        onStatus={vi.fn()}
      />,
    );
    await waitFor(() => expect(screen.getByText(/Welcome \(WELCOME\)/)).toBeInTheDocument());
    await user.click(screen.getByRole("button", { name: /Welcome \(WELCOME\)/ }));
    await waitFor(() =>
      expect(screen.getByRole("button", { name: /Review & activate/i })).toBeInTheDocument(),
    );
  });

  it("activate without manage hides activation but still exposes retirement affordance", async () => {
    const user = userEvent.setup();
    mockPromotionDetail(draftPromotion({ status: "active" }));
    render(
      <PromotionsEditor
        context={baseContext}
        capabilities={{
          ...capabilities,
          promotionsManage: false,
          promotionsActivate: true,
        }}
        authoringAllowed
        onStatus={vi.fn()}
      />,
    );
    await waitFor(() => expect(screen.getByText(/Welcome \(WELCOME\)/)).toBeInTheDocument());
    await user.click(screen.getByRole("button", { name: /Welcome \(WELCOME\)/ }));
    await waitFor(() => expect(screen.getByText(/Trigger:/)).toBeInTheDocument());
    expect(screen.queryByRole("button", { name: /Review & activate/i })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Review & retire/i })).toBeInTheDocument();
    expect(screen.queryByLabelText("Benefit type")).not.toBeInTheDocument();
  });

  it("exposes V1 eligibility, limits, complimentary ids, redemption counts, and no gift catalogue", async () => {
    const user = userEvent.setup();
    mockPromotionDetail(draftPromotion());
    render(
      <PromotionsEditor
        context={baseContext}
        capabilities={capabilities}
        authoringAllowed
        onStatus={vi.fn()}
      />,
    );
    await waitFor(() => expect(screen.getByText(/Welcome \(WELCOME\)/)).toBeInTheDocument());
    await user.click(screen.getByRole("button", { name: /Welcome \(WELCOME\)/ }));
    await waitFor(() => expect(screen.getByText("First order only")).toBeInTheDocument());
    expect(screen.getByText("Fulfilment mode")).toBeInTheDocument();
    expect(screen.getByLabelText("Maximum redemptions")).toBeInTheDocument();
    expect(screen.getByLabelText("Maximum redemptions per customer")).toBeInTheDocument();
    expect(screen.getByLabelText("Minimum item quantity")).toBeInTheDocument();
    expect(screen.getByLabelText("Promotion scope")).toBeInTheDocument();
    expect(screen.getByLabelText("Benefit type")).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Buy X get Y" })).toBeInTheDocument();
    await user.selectOptions(screen.getByLabelText("Benefit type"), "complimentary_item");
    expect(screen.getByText(COPY_OP_GIFT)).toBeInTheDocument();
    expect(screen.getByLabelText("Complimentary product id")).toBeInTheDocument();
    expect(screen.getByLabelText("Complimentary variant id")).toBeInTheDocument();
    expect(screen.getByTestId("redemption-counts")).toHaveTextContent("Applications: 0");
    expect(screen.queryByText(/gift catalogue/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/customerId/i)).not.toBeInTheDocument();
  });

  it("hydrates BOGO without coercing to percentage and saves BOGO fields", async () => {
    const user = userEvent.setup();
    const promotion = draftPromotion({ revision: "3" });
    listPromotions.mockResolvedValue({
      ok: true,
      status: 200,
      data: { promotions: [promotion] },
    });
    listCoupons.mockResolvedValue({ ok: true, status: 200, data: { coupons: [] } });
    getPromotion.mockResolvedValue({
      ok: true,
      status: 200,
      data: {
        promotion,
        benefit: {
          benefitType: "buy_x_get_y",
          buyQuantity: 2,
          getQuantity: 1,
          repeatable: true,
          maximumRewardQuantity: 4,
        },
        qualifierTargets: [],
        benefitTargets: [],
        redemptionCounts: {
          reservedCount: 0,
          consumedCount: 0,
          releasedCount: 0,
          applicationCount: 0,
        },
      },
    });
    render(
      <PromotionsEditor
        context={baseContext}
        capabilities={capabilities}
        authoringAllowed
        onStatus={vi.fn()}
      />,
    );
    await waitFor(() => expect(screen.getByText(/Welcome \(WELCOME\)/)).toBeInTheDocument());
    await user.click(screen.getByRole("button", { name: /Welcome \(WELCOME\)/ }));
    await waitFor(() => expect(screen.getByLabelText("Benefit type")).toHaveValue("buy_x_get_y"));
    expect(screen.getByLabelText("Buy quantity")).toHaveValue("2");
    expect(screen.getByLabelText("Get quantity")).toHaveValue("1");
    expect(screen.getByLabelText("BOGO repeatable")).toBeChecked();
    expect(screen.getByLabelText("Maximum reward quantity")).toHaveValue("4");
    await user.click(screen.getByRole("button", { name: /Save benefit/i }));
    await waitFor(() => expect(savePromotionBenefit).toHaveBeenCalled());
    expect(savePromotionBenefit.mock.calls[0]?.[2]).toMatchObject({
      benefitType: "buy_x_get_y",
      buyQuantity: 2,
      getQuantity: 1,
      repeatable: true,
      maximumRewardQuantity: 4,
    });
  });

  it("does not submit a reward cap for non-repeatable BOGO or an ungrouped cap", async () => {
    const user = userEvent.setup();
    const promotion = draftPromotion({ revision: "3" });
    listPromotions.mockResolvedValue({
      ok: true,
      status: 200,
      data: { promotions: [promotion] },
    });
    listCoupons.mockResolvedValue({ ok: true, status: 200, data: { coupons: [] } });
    getPromotion.mockResolvedValue({
      ok: true,
      status: 200,
      data: {
        promotion,
        benefit: {
          benefitType: "buy_x_get_y",
          buyQuantity: 2,
          getQuantity: 2,
          repeatable: true,
          maximumRewardQuantity: 4,
        },
        qualifierTargets: [],
        benefitTargets: [],
        redemptionCounts: {
          reservedCount: 0,
          consumedCount: 0,
          releasedCount: 0,
          applicationCount: 0,
        },
      },
    });
    const onStatus = vi.fn();
    render(
      <PromotionsEditor
        context={baseContext}
        capabilities={capabilities}
        authoringAllowed
        onStatus={onStatus}
      />,
    );
    await waitFor(() => expect(screen.getByText(/Welcome \(WELCOME\)/)).toBeInTheDocument());
    await user.click(screen.getByRole("button", { name: /Welcome \(WELCOME\)/ }));
    await waitFor(() => expect(screen.getByLabelText("Benefit type")).toHaveValue("buy_x_get_y"));
    const cap = screen.getByLabelText("Maximum reward quantity");
    await user.clear(cap);
    await user.type(cap, "3");
    await user.click(screen.getByRole("button", { name: /Save benefit/i }));
    await waitFor(() =>
      expect(onStatus).toHaveBeenCalledWith(
        "Maximum reward quantity must be a multiple of get quantity.",
      ),
    );
    expect(savePromotionBenefit).not.toHaveBeenCalled();

    await user.clear(screen.getByLabelText("Maximum reward quantity"));
    await user.click(screen.getByLabelText("BOGO repeatable"));
    await user.click(screen.getByRole("button", { name: /Save benefit/i }));
    await waitFor(() => expect(savePromotionBenefit).toHaveBeenCalled());
    expect(savePromotionBenefit.mock.calls[0]?.[2]).toMatchObject({
      benefitType: "buy_x_get_y",
      repeatable: false,
    });
    expect(savePromotionBenefit.mock.calls[0]?.[2]).not.toHaveProperty("maximumRewardQuantity");
  });

  it("authors delivery waiver with canonical delivery charge target", async () => {
    const user = userEvent.setup();
    mockPromotionDetail(draftPromotion({ revision: "1" }));
    render(
      <PromotionsEditor
        context={baseContext}
        capabilities={capabilities}
        authoringAllowed
        onStatus={vi.fn()}
      />,
    );
    await waitFor(() => expect(screen.getByText(/Welcome \(WELCOME\)/)).toBeInTheDocument());
    await user.click(screen.getByRole("button", { name: /Welcome \(WELCOME\)/ }));
    await waitFor(() => expect(screen.getByLabelText("Benefit type")).toBeInTheDocument());
    await user.selectOptions(screen.getByLabelText("Benefit type"), "delivery_fee_waiver");
    await user.click(screen.getByRole("button", { name: /Save benefit/i }));
    await waitFor(() => expect(savePromotionBenefit).toHaveBeenCalled());
    expect(savePromotionBenefit.mock.calls[0]?.[2]).toMatchObject({
      benefitType: "delivery_fee_waiver",
    });
    await waitFor(() => expect(setPromotionTargets).toHaveBeenCalled());
    expect(setPromotionTargets.mock.calls[0]?.[2]).toMatchObject({
      targetRole: "benefit",
      targets: [
        expect.objectContaining({
          targetType: "charge",
          chargeDefinitionId: "a0150001-0000-4000-8000-000000000004",
        }),
      ],
    });
  });

  it("creates promotions with selected scope and saves minimum item quantity", async () => {
    const user = userEvent.setup();
    mockPromotionDetail(draftPromotion({ revision: "1" }));
    render(
      <PromotionsEditor
        context={{ ...baseContext, outletId: "outlet-1", outletLabel: "Outlet 1" }}
        capabilities={capabilities}
        authoringAllowed
        onStatus={vi.fn()}
      />,
    );
    await waitFor(() => expect(screen.getByLabelText("Promotion scope")).toBeInTheDocument());
    await user.selectOptions(screen.getByLabelText("Promotion scope"), "outlet");
    await user.type(screen.getByLabelText("Promotion code"), "OUT1");
    await user.type(screen.getByLabelText("Promotion display name"), "Outlet promo");
    await user.click(screen.getByRole("button", { name: /^Create$/i }));
    await waitFor(() => expect(createPromotion).toHaveBeenCalled());
    expect(createPromotion.mock.calls[0]?.[1]).toMatchObject({
      scopeType: "outlet",
      outletId: "outlet-1",
    });

    await user.click(screen.getByRole("button", { name: /Welcome \(WELCOME\)/ }));
    await waitFor(() => expect(screen.getByLabelText("Minimum item quantity")).toBeInTheDocument());
    await user.clear(screen.getByLabelText("Minimum item quantity"));
    await user.type(screen.getByLabelText("Minimum item quantity"), "3");
    await user.click(screen.getByRole("button", { name: /Save draft/i }));
    await waitFor(() => expect(savePromotionDraft).toHaveBeenCalled());
    expect(savePromotionDraft.mock.calls[0]?.[2]).toMatchObject({
      minimumItemQuantity: 3,
    });
  });

  it("retire confirm is keyboard operable; cancel leaves ACTIVE and confirm retires", async () => {
    const user = userEvent.setup();
    mockPromotionDetail(draftPromotion({ status: "active", revision: "4" }));
    previewPromotionConsequence.mockResolvedValue({
      ok: true,
      status: 200,
      data: {
        preview: {
          expectedPromotionRevision: "4",
          proposedStatus: "retired",
          currentStatus: "active",
          customerVisibleImplication: "lifecycle",
          supportedLifecycleStates: ["draft", "active", "retired"],
        },
      },
    });
    retirePromotion.mockResolvedValue({ ok: true, status: 200, data: { revision: "5" } });
    const onStatus = vi.fn();
    render(
      <PromotionsEditor
        context={baseContext}
        capabilities={capabilities}
        authoringAllowed
        onStatus={onStatus}
      />,
    );
    await waitFor(() => expect(screen.getByText(/Welcome \(WELCOME\)/)).toBeInTheDocument());
    await user.click(screen.getByRole("button", { name: /Welcome \(WELCOME\)/ }));
    await waitFor(() => expect(screen.getByRole("button", { name: /Review & retire/i })).toBeInTheDocument());
    await user.click(screen.getByRole("button", { name: /Review & retire/i }));
    expect(await screen.findByText(COPY_RETIRE_TITLE)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: COPY_CANCEL })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: COPY_RETIRE_CONFIRM })).toBeInTheDocument();
    await user.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByText(COPY_RETIRE_TITLE)).not.toBeInTheDocument());
    expect(retirePromotion).not.toHaveBeenCalled();
    expect(onStatus).toHaveBeenCalledWith("Retirement cancelled. The offer is still active.");

    await user.click(screen.getByRole("button", { name: /Review & retire/i }));
    expect(await screen.findByText(COPY_RETIRE_TITLE)).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: COPY_RETIRE_CONFIRM }));
    await waitFor(() => expect(retirePromotion).toHaveBeenCalled());
    expect(onStatus).toHaveBeenCalledWith(COPY_OP_RETIRED);
  });
});
