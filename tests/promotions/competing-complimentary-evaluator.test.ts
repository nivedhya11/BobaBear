import { describe, expect, it } from "vitest";

import { evaluateSyntheticComplimentaryDefinitions } from "../../scripts/e2e/evaluate-competing-complimentary";

describe("synthetic complimentary evaluator", () => {
  it("selects one synthetic gift and does not call that NONE_CHOSEN", () => {
    const result = evaluateSyntheticComplimentaryDefinitions(1);
    expect(result.persisted).toBe(false);
    expect(result.evaluator).toBe("evaluatePromotions");
    expect(result.complimentaryCompetingNoneChosen).toBe(false);
    expect(result.selectedPromotionIds).toEqual(["synthetic-complimentary-a"]);
    expect(result.complimentary).toMatchObject({
      competingOffers: "NONE",
      promotionId: "synthetic-complimentary-a",
      variantId: "11111111-1111-4111-8111-111111111112",
    });
  });

  it("returns NONE_CHOSEN for two qualifying synthetic complimentary definitions", () => {
    const result = evaluateSyntheticComplimentaryDefinitions(2);
    expect(result.persisted).toBe(false);
    expect(result.complimentaryCompetingNoneChosen).toBe(true);
    expect(result.selectedPromotionIds).toEqual([]);
    expect(result.complimentary).toEqual({ competingOffers: "NONE_CHOSEN" });
    expect(result.merchandiseOrOrderSavingPaise).toBe("0");
    expect(result.deliverySavingPaise).toBe("0");
    expect(result.totalSavedPaise).toBe("0");
    expect(JSON.stringify(result.complimentary)).not.toContain("synthetic-complimentary");
    expect(JSON.stringify(result.complimentary)).not.toContain("11111111-1111-4111-8111-111111111112");
    expect(result.variantIds).toEqual([
      "11111111-1111-4111-8111-111111111112",
      "22222222-2222-4222-8222-222222222222",
    ]);
  });
});
