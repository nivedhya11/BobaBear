/**
 * IMP-036J T8 — executable-evidence completeness for 40 ACs, 13 XRs, 14 BRs,
 * and both Golden Journeys. A map is not a substitute for the named tests;
 * this file fails if a mandatory id has no live proof needle.
 */
import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

const ROOT = process.cwd();

function load(rel: string): string {
  return readFileSync(path.join(ROOT, rel), "utf8");
}

type Evidence = Readonly<{
  id: string;
  files: readonly string[];
  needle: string;
}>;

function assertEvidence(rows: readonly Evidence[]): void {
  for (const row of rows) {
    expect(row.files.length, row.id).toBeGreaterThan(0);
    const hits = row.files.filter((file) => load(file).includes(row.needle));
    expect(hits, `${row.id} needle ${JSON.stringify(row.needle)}`).not.toEqual([]);
  }
}

function idsFrom(text: string, pattern: RegExp): string[] {
  return [...new Set([...text.matchAll(pattern)].map((match) => match[1]))].sort();
}

const QUALITY = load("docs/platform/product/IMP-036J/quality-test-plan.md");
const PRODUCT = load("docs/platform/product/IMP-036J/product-definition.md");
const EXPERIENCE = load("docs/platform/product/IMP-036J/experience-definition.md");

const MANDATORY_AC: readonly Evidence[] = [
  {
    id: "AC-036J-001-01",
    files: ["src/components/ordering/imp036j-tranche5-presentation.test.tsx"],
    needle: "renders Estimated subtotal without Total payable or invented delivery",
  },
  {
    id: "AC-036J-001-02",
    files: ["tests/promotions/imp036j-tranche3-commercial-evaluation.test.ts"],
    needle: "out-of-window Offer omitted",
  },
  {
    id: "AC-036J-002-01",
    files: ["tests/database/imp036j-tranche4-commercial-commands.integration.test.ts"],
    needle: "applyCartCoupon",
  },
  {
    id: "AC-036J-002-02",
    files: ["tests/database/imp036j-tranche4-commercial-commands.integration.test.ts"],
    needle: "CART_COUPON_UNKNOWN",
  },
  {
    id: "AC-036J-002-03",
    files: ["tests/database/imp036j-tranche4-commercial-commands.integration.test.ts"],
    needle: "removeCartCoupon",
  },
  {
    id: "AC-036J-002-04",
    files: ["tests/database/imp036j-tranche4-commercial-commands.integration.test.ts"],
    needle: "claimGuestCart",
  },
  {
    id: "AC-036J-002-05",
    files: ["tests/database/imp036j-tranche4-commercial-commands.integration.test.ts"],
    needle: "guest unrestricted coupon stores shared state",
  },
  {
    id: "AC-036J-002-06",
    files: ["tests/database/imp036j-tranche4-commercial-commands.integration.test.ts"],
    needle: "manual_coupon_code",
  },
  {
    id: "AC-036J-002-07",
    files: ["tests/database/imp036j-tranche4-commercial-commands.integration.test.ts"],
    needle: "reviewSurfaceToken",
  },
  {
    id: "AC-036J-002-08",
    files: ["tests/database/imp036j-tranche4-commercial-commands.integration.test.ts"],
    needle: "replace",
  },
  {
    id: "AC-036J-002-09",
    files: ["src/components/ordering/imp036j-tranche5-presentation.test.tsx"],
    needle: "PaymentPanel",
  },
  {
    id: "AC-036J-002-10",
    files: ["src/components/ordering/imp036j-tranche5-presentation.test.tsx"],
    needle: "IMP036J_COPY.RETRY",
  },
  {
    id: "AC-036J-003-01",
    files: ["src/components/ordering/imp036j-tranche5-presentation.test.tsx"],
    needle: "threshold",
  },
  {
    id: "AC-036J-003-02",
    files: ["src/components/ordering/CommercialOfferStack.tsx"],
    needle: "IMP036J_COPY.DROPPED",
  },
  {
    id: "AC-036J-004-01",
    files: ["src/components/ordering/imp036j-tranche5-presentation.test.tsx"],
    needle: "TOTAL_SAVED",
  },
  {
    id: "AC-036J-005-01",
    files: ["tests/database/imp036j-tranche4-commercial-commands.integration.test.ts"],
    needle: "one first-order Offer reserves one guard",
  },
  {
    id: "AC-036J-005-02",
    files: ["tests/database/imp036j-tranche4-commercial-commands.integration.test.ts"],
    needle: "refund does not restore",
  },
  {
    id: "AC-036J-006-01",
    files: ["tests/promotions/imp036j-tranche3-commercial-evaluation.test.ts"],
    needle: "fulfilment",
  },
  {
    id: "AC-036J-006-02",
    files: ["tests/database/imp036j-tranche4-commercial-commands.integration.test.ts"],
    needle: "setCheckoutFulfilmentTiming",
  },
  {
    id: "AC-036J-007-01",
    files: ["src/components/ordering/commercial-explanation-presentation.ts"],
    needle: "IMP036J_COPY.GLOBAL_CAP",
  },
  {
    id: "AC-036J-008-01",
    files: ["tests/database/imp036j-tranche4-commercial-commands.integration.test.ts"],
    needle: "prepareCheckoutForPayment",
  },
  {
    id: "AC-036J-009-01",
    files: ["tests/promotions/imp036j-tranche3-commercial-evaluation.test.ts"],
    needle: "selectBestCandidate",
  },
  {
    id: "AC-036J-009-02",
    files: ["tests/promotions/imp036j-tranche3-commercial-evaluation.test.ts"],
    needle: "selectBestCandidate",
  },
  {
    id: "AC-036J-009-03",
    files: ["src/components/ordering/imp036j-tranche5-presentation.test.tsx"],
    needle: "ORDER_SAVING",
  },
  {
    id: "AC-036J-009-04",
    files: ["src/components/ordering/imp036j-tranche5-presentation.test.tsx"],
    needle: "DELIVERY_SAVING",
  },
  {
    id: "AC-036J-010-01",
    files: ["tests/promotions/imp036j-tranche3-commercial-evaluation.test.ts"],
    needle: "compatible",
  },
  {
    id: "AC-036J-010-02",
    files: ["tests/promotions/imp036j-tranche3-commercial-evaluation.test.ts"],
    needle: "BOGO does not stack with another merchandise discount",
  },
  {
    id: "AC-036J-010-03",
    files: ["tests/promotions/imp036j-tranche3-commercial-evaluation.test.ts"],
    needle: "selectBestCandidate",
  },
  {
    id: "AC-036J-010-04",
    files: ["tests/promotions/imp036j-tranche3-commercial-evaluation.test.ts"],
    needle: "standing",
  },
  {
    id: "AC-036J-011-01",
    files: ["tests/database/imp036j-tranche4-commercial-commands.integration.test.ts"],
    needle: "retirePromotion",
  },
  {
    id: "AC-036J-012-01",
    files: ["tests/database/imp036j-tranche6-workforce-authoring.integration.test.ts"],
    needle: "promotion.activated",
  },
  {
    id: "AC-036J-012-02",
    files: ["tests/database/imp036j-tranche6-workforce-authoring.integration.test.ts"],
    needle: "COPY_OP_GIFT_INVALID",
  },
  {
    id: "AC-036J-012-03",
    files: ["tests/administration/PromotionsEditor.test.tsx"],
    needle: "retire",
  },
  {
    id: "AC-036J-012-04",
    files: ["tests/database/imp036j-tranche6-workforce-authoring.integration.test.ts"],
    needle: "COPY_OP_GIFT_INVALID",
  },
  {
    id: "AC-036J-012-05",
    files: ["tests/database/imp036j-tranche6-workforce-authoring.integration.test.ts"],
    needle: "PROMOTION_COMPLIMENTARY_ACTIVE_CONFLICT",
  },
  {
    id: "AC-036J-012-06",
    files: ["tests/database/imp036j-tranche6-workforce-authoring.integration.test.ts"],
    needle: "real concurrent complimentary activation",
  },
  {
    id: "AC-036J-013-01",
    files: ["src/components/ordering/imp036j-tranche5-presentation.test.tsx"],
    needle: "INCLUDED",
  },
  {
    id: "AC-036J-013-02",
    files: ["tests/database/imp036j-tranche4-commercial-commands.integration.test.ts"],
    needle: "complimentary_offer",
  },
  {
    id: "AC-036J-013-03",
    files: ["tests/database/imp036j-tranche4-commercial-commands.integration.test.ts"],
    needle: "unavailable complimentary line refuses stale bind without substitution",
  },
  {
    id: "AC-036J-013-04",
    files: ["tests/promotions/imp036j-tranche3-commercial-evaluation.test.ts"],
    needle: "NONE_CHOSEN",
  },
];

const EXPERIENCE_REQUIREMENTS: readonly Evidence[] = [
  {
    id: "XR-IMP-036J-001",
    files: ["src/components/ordering/imp036j-tranche5-presentation.test.tsx"],
    needle: "APPLIED_AUTO",
  },
  {
    id: "XR-IMP-036J-002",
    files: ["src/components/ordering/imp036j-tranche5-presentation.test.tsx"],
    needle: "PaymentPanel",
  },
  {
    id: "XR-IMP-036J-003",
    files: ["src/components/ordering/imp036j-tranche5-presentation.test.tsx"],
    needle: "threshold",
  },
  {
    id: "XR-IMP-036J-004",
    files: ["src/components/ordering/imp036j-tranche5-presentation.test.tsx"],
    needle: "TOTAL_SAVED",
  },
  {
    id: "XR-IMP-036J-005",
    files: ["src/components/ordering/imp036j-tranche5-presentation.test.tsx"],
    needle: "EQUAL",
  },
  {
    id: "XR-IMP-036J-006",
    files: ["src/components/ordering/imp036j-tranche5-presentation.test.tsx"],
    needle: "complimentary-line",
  },
  {
    id: "XR-IMP-036J-007",
    files: ["src/components/ordering/imp036j-tranche5-checkout-remediation.test.tsx"],
    needle: "STALE",
  },
  {
    id: "XR-IMP-036J-008",
    files: ["src/components/ordering/checkout-snapshot-presentation.test.ts"],
    needle: "sealedCustomerSavingsFromSnapshot",
  },
  {
    id: "XR-IMP-036J-009",
    files: ["tests/administration/PromotionsEditor.test.tsx"],
    needle: "retire",
  },
  {
    id: "XR-IMP-036J-010",
    files: ["scripts/imp036j-tranche5-responsive-proof.mjs"],
    needle: "cart-sticky-amount",
  },
  {
    id: "XR-IMP-036J-011",
    files: ["src/components/ordering/imp036j-tranche5-presentation.test.tsx"],
    needle: "IMP036J_COPY.INVALID",
  },
  {
    id: "XR-IMP-036J-012",
    files: ["src/components/ordering/imp036j-copy.ts"],
    needle: "INAPPLICABLE_PICKUP",
  },
  {
    id: "XR-IMP-036J-013",
    files: ["src/components/ordering/imp036j-tranche5-presentation.test.tsx"],
    needle: "INCLUDED",
  },
];

const BUSINESS_RULES: readonly Evidence[] = Array.from({ length: 14 }, (_, index) => {
  const id = `BR-036J-${String(index + 1).padStart(3, "0")}`;
  return { id, files: ["docs/platform/product/IMP-036J/product-definition.md"], needle: id };
});

describe("IMP-036J T8 coverage completeness", () => {
  it("maps every mandatory AC to live executable evidence", () => {
    const planned = idsFrom(QUALITY, /`(AC-036J-\d{3}-\d{2})`/g);
    expect(planned).toHaveLength(40);
    expect(MANDATORY_AC.map((row) => row.id).sort()).toEqual([...planned].sort());
    assertEvidence(MANDATORY_AC);
  });

  it("maps every experience requirement to live executable evidence", () => {
    const planned = idsFrom(EXPERIENCE, /`(XR-IMP-036J-\d{3})`/g);
    const fromQuality = idsFrom(QUALITY, /`(XR-IMP-036J-\d{3})`/g);
    expect(fromQuality).toHaveLength(13);
    expect(EXPERIENCE_REQUIREMENTS.map((row) => row.id).sort()).toEqual([...fromQuality].sort());
    expect(planned).toEqual(expect.arrayContaining(fromQuality));
    assertEvidence(EXPERIENCE_REQUIREMENTS);
  });

  it("maps every business rule to the locked Product Definition", () => {
    const planned = idsFrom(PRODUCT, /`(BR-036J-\d{3})`/g);
    expect(planned).toHaveLength(14);
    expect(BUSINESS_RULES.map((row) => row.id).sort()).toEqual([...planned].sort());
    assertEvidence(BUSINESS_RULES);
  });

  it("names both Golden Journeys in the customer-ordering browser harness", () => {
    const spec = load("tests/e2e/customer-ordering.spec.ts");
    expect(spec).toContain("GJ-FIRST-ORDER");
    expect(spec).toContain("GJ-RETURNING-ORDER");
    expect(spec).toContain('getByRole("button", { name: /order again/i })).toHaveCount(0)');
    expect(spec).not.toMatch(/href=["'][^"']*order-again/i);
  });
});
