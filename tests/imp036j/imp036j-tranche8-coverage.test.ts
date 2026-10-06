/**
 * IMP-036J T8 — executable-evidence completeness for 40 ACs, 13 XRs, 14 BRs,
 * and both Golden Journeys. A map is not a substitute for the named tests;
 * this file fails if a mandatory id has no live proof needle, and if an
 * evidence entry cites only production source or documentation.
 */
import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

const ROOT = process.cwd();

function load(rel: string): string {
  return readFileSync(path.join(ROOT, rel), "utf8");
}

type Proof = Readonly<{
  file: string;
  needle: string;
}>;

type Evidence = Readonly<{
  id: string;
  proofs: readonly Proof[];
}>;

export function isExecutableProofFile(file: string): boolean {
  const normalized = file.replaceAll("\\", "/");
  if (normalized.startsWith("docs/")) return false;
  if (/\.(test|spec)\.[cm]?[jt]sx?$/.test(normalized)) return true;
  if (normalized.startsWith("scripts/") && /\.(mjs|js|cjs)$/.test(normalized)) return true;
  return false;
}

function assertEvidence(rows: readonly Evidence[]): void {
  for (const row of rows) {
    expect(row.proofs.length, row.id).toBeGreaterThan(0);
    const executable = row.proofs.filter((proof) => isExecutableProofFile(proof.file));
    expect(
      executable,
      `${row.id} must cite at least one executable test or proof script, not only production source or documentation`,
    ).not.toEqual([]);
    for (const proof of row.proofs) {
      expect(
        isExecutableProofFile(proof.file),
        `${row.id} evidence ${proof.file} is production source or documentation`,
      ).toBe(true);
      expect(
        load(proof.file).includes(proof.needle),
        `${row.id} needle ${JSON.stringify(proof.needle)} missing from ${proof.file}`,
      ).toBe(true);
    }
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
    proofs: [
      {
        file: "src/components/ordering/imp036j-tranche5-presentation.test.tsx",
        needle: "renders Estimated subtotal without Total payable or invented delivery",
      },
    ],
  },
  {
    id: "AC-036J-001-02",
    proofs: [
      {
        file: "tests/promotions/imp036j-tranche3-commercial-evaluation.test.ts",
        needle: "out-of-window Offer omitted",
      },
    ],
  },
  {
    id: "AC-036J-002-01",
    proofs: [
      {
        file: "tests/database/imp036j-tranche4-commercial-commands.integration.test.ts",
        needle: "applyCartCoupon",
      },
    ],
  },
  {
    id: "AC-036J-002-02",
    proofs: [
      {
        file: "tests/database/imp036j-tranche4-commercial-commands.integration.test.ts",
        needle: "CART_COUPON_UNKNOWN",
      },
    ],
  },
  {
    id: "AC-036J-002-03",
    proofs: [
      {
        file: "tests/database/imp036j-tranche4-commercial-commands.integration.test.ts",
        needle: "removeCartCoupon",
      },
    ],
  },
  {
    id: "AC-036J-002-04",
    proofs: [
      {
        file: "tests/database/imp036j-tranche4-commercial-commands.integration.test.ts",
        needle: "claimGuestCart",
      },
    ],
  },
  {
    id: "AC-036J-002-05",
    proofs: [
      {
        file: "tests/database/imp036j-tranche4-commercial-commands.integration.test.ts",
        needle: "guest unrestricted coupon stores shared state",
      },
    ],
  },
  {
    id: "AC-036J-002-06",
    proofs: [
      {
        file: "tests/database/imp036j-tranche4-commercial-commands.integration.test.ts",
        needle: "manual_coupon_code",
      },
    ],
  },
  {
    id: "AC-036J-002-07",
    proofs: [
      {
        file: "tests/database/imp036j-tranche4-commercial-commands.integration.test.ts",
        needle: "reviewSurfaceToken",
      },
    ],
  },
  {
    id: "AC-036J-002-08",
    proofs: [
      {
        file: "tests/database/imp036j-tranche4-commercial-commands.integration.test.ts",
        needle: "Review uses the same cart coupon commands (AC-036J-002-06/07/08)",
      },
    ],
  },
  {
    id: "AC-036J-002-09",
    proofs: [
      {
        file: "src/components/ordering/imp036j-tranche5-presentation.test.tsx",
        needle: "PaymentPanel is a read-only commercial summary without coupon mutation controls",
      },
    ],
  },
  {
    id: "AC-036J-002-10",
    proofs: [
      {
        file: "src/components/ordering/imp036j-tranche5-presentation.test.tsx",
        needle: "IMP036J_COPY.RETRY",
      },
    ],
  },
  {
    id: "AC-036J-003-01",
    proofs: [
      {
        file: "src/components/ordering/imp036j-tranche5-presentation.test.tsx",
        needle: "renders Review Total payable and server threshold gap without client subtraction",
      },
    ],
  },
  {
    id: "AC-036J-003-02",
    proofs: [
      {
        file: "src/components/ordering/CartClient.test.tsx",
        needle:
          "AC-036J-003-02 CartClient crossed-and-lost uses server evaluation without client threshold maths",
      },
      {
        file: "src/components/ordering/CheckoutClient.destination.test.tsx",
        needle: "AC-036J-003-02 Review crossed-and-lost after re-evaluation",
      },
      {
        file: "tests/promotions/imp036j-tranche3-commercial-evaluation.test.ts",
        needle: "22. threshold amount is server-calculated",
      },
    ],
  },
  {
    id: "AC-036J-004-01",
    proofs: [
      {
        file: "src/components/ordering/imp036j-tranche5-presentation.test.tsx",
        needle: "TOTAL_SAVED",
      },
    ],
  },
  {
    id: "AC-036J-005-01",
    proofs: [
      {
        file: "tests/database/imp036j-tranche4-commercial-commands.integration.test.ts",
        needle: "one first-order Offer reserves one guard",
      },
    ],
  },
  {
    id: "AC-036J-005-02",
    proofs: [
      {
        file: "tests/database/imp036j-tranche4-commercial-commands.integration.test.ts",
        needle: "refund does not restore",
      },
    ],
  },
  {
    id: "AC-036J-006-01",
    proofs: [
      {
        file: "tests/promotions/imp036j-tranche3-commercial-evaluation.test.ts",
        needle: "19. fulfilment mode eligibility honored",
      },
    ],
  },
  {
    id: "AC-036J-006-02",
    proofs: [
      {
        file: "tests/database/imp036j-tranche4-commercial-commands.integration.test.ts",
        needle: "setCheckoutFulfilmentTiming",
      },
    ],
  },
  {
    id: "AC-036J-007-01",
    proofs: [
      {
        file: "src/components/ordering/imp036j-tranche5-presentation.test.tsx",
        needle:
          "maps invalid, expired, inapplicable, global, and personal cap to five distinct sentences",
      },
    ],
  },
  {
    id: "AC-036J-008-01",
    proofs: [
      {
        file: "tests/database/imp036j-tranche4-commercial-commands.integration.test.ts",
        needle: "prepareCheckoutForPayment",
      },
    ],
  },
  {
    id: "AC-036J-009-01",
    proofs: [
      {
        file: "tests/promotions/imp036j-tranche3-commercial-evaluation.test.ts",
        needle: "6. approved ₹80 + ₹40 pair beats exclusive ₹90 coupon",
      },
    ],
  },
  {
    id: "AC-036J-009-02",
    proofs: [
      {
        file: "tests/promotions/imp036j-tranche3-commercial-evaluation.test.ts",
        needle: "7. approved ₹90 + ₹20 pair beats exclusive ₹100 Offer",
      },
    ],
  },
  {
    id: "AC-036J-009-03",
    proofs: [
      {
        file: "src/components/ordering/imp036j-tranche5-presentation.test.tsx",
        needle: "ORDER_SAVING",
      },
    ],
  },
  {
    id: "AC-036J-009-04",
    proofs: [
      {
        file: "src/components/ordering/imp036j-tranche5-presentation.test.tsx",
        needle: "DELIVERY_SAVING",
      },
    ],
  },
  {
    id: "AC-036J-010-01",
    proofs: [
      {
        file: "tests/promotions/imp036j-tranche3-commercial-evaluation.test.ts",
        needle: "1. primary + compatible delivery incentive both apply",
      },
    ],
  },
  {
    id: "AC-036J-010-02",
    proofs: [
      {
        file: "tests/promotions/imp036j-tranche3-commercial-evaluation.test.ts",
        needle: "BOGO does not stack with another merchandise discount",
      },
    ],
  },
  {
    id: "AC-036J-010-03",
    proofs: [
      {
        file: "tests/promotions/imp036j-tranche3-commercial-evaluation.test.ts",
        needle: "5. best COMPLETE combination wins by final payable",
      },
    ],
  },
  {
    id: "AC-036J-010-04",
    proofs: [
      {
        file: "tests/promotions/imp036j-tranche3-commercial-evaluation.test.ts",
        needle: "10. standing ₹0 delivery produces no fake saving",
      },
    ],
  },
  {
    id: "AC-036J-011-01",
    proofs: [
      {
        file: "tests/database/imp036j-tranche4-commercial-commands.integration.test.ts",
        needle: "retirePromotion",
      },
    ],
  },
  {
    id: "AC-036J-012-01",
    proofs: [
      {
        file: "tests/database/imp036j-tranche6-workforce-authoring.integration.test.ts",
        needle: "promotion.activated",
      },
    ],
  },
  {
    id: "AC-036J-012-02",
    proofs: [
      {
        file: "tests/database/imp036j-tranche6-workforce-authoring.integration.test.ts",
        needle: "COPY_OP_GIFT_INVALID",
      },
    ],
  },
  {
    id: "AC-036J-012-03",
    proofs: [
      {
        file: "tests/administration/PromotionsEditor.test.tsx",
        needle: "retire",
      },
    ],
  },
  {
    id: "AC-036J-012-04",
    proofs: [
      {
        file: "tests/database/imp036j-tranche6-workforce-authoring.integration.test.ts",
        needle: "COPY_OP_GIFT_INVALID",
      },
    ],
  },
  {
    id: "AC-036J-012-05",
    proofs: [
      {
        file: "tests/database/imp036j-tranche6-workforce-authoring.integration.test.ts",
        needle: "PROMOTION_COMPLIMENTARY_ACTIVE_CONFLICT",
      },
    ],
  },
  {
    id: "AC-036J-012-06",
    proofs: [
      {
        file: "tests/database/imp036j-tranche6-workforce-authoring.integration.test.ts",
        needle: "real concurrent complimentary activation",
      },
    ],
  },
  {
    id: "AC-036J-013-01",
    proofs: [
      {
        file: "src/components/ordering/imp036j-tranche5-presentation.test.tsx",
        needle: "INCLUDED",
      },
    ],
  },
  {
    id: "AC-036J-013-02",
    proofs: [
      {
        file: "tests/database/imp036j-tranche4-commercial-commands.integration.test.ts",
        needle: "complimentary_offer",
      },
    ],
  },
  {
    id: "AC-036J-013-03",
    proofs: [
      {
        file: "tests/database/imp036j-tranche4-commercial-commands.integration.test.ts",
        needle: "unavailable complimentary line refuses stale bind without substitution",
      },
    ],
  },
  {
    id: "AC-036J-013-04",
    proofs: [
      {
        file: "tests/promotions/imp036j-tranche3-commercial-evaluation.test.ts",
        needle: "NONE_CHOSEN",
      },
    ],
  },
];

const EXPERIENCE_REQUIREMENTS: readonly Evidence[] = [
  {
    id: "XR-IMP-036J-001",
    proofs: [
      {
        file: "src/components/ordering/imp036j-tranche5-presentation.test.tsx",
        needle: "APPLIED_AUTO",
      },
    ],
  },
  {
    id: "XR-IMP-036J-002",
    proofs: [
      {
        file: "src/components/ordering/imp036j-tranche5-presentation.test.tsx",
        needle: "PaymentPanel is a read-only commercial summary without coupon mutation controls",
      },
    ],
  },
  {
    id: "XR-IMP-036J-003",
    proofs: [
      {
        file: "src/components/ordering/imp036j-tranche5-presentation.test.tsx",
        needle: "renders Review Total payable and server threshold gap without client subtraction",
      },
    ],
  },
  {
    id: "XR-IMP-036J-004",
    proofs: [
      {
        file: "src/components/ordering/imp036j-tranche5-presentation.test.tsx",
        needle: "TOTAL_SAVED",
      },
    ],
  },
  {
    id: "XR-IMP-036J-005",
    proofs: [
      {
        file: "src/components/ordering/imp036j-tranche5-presentation.test.tsx",
        needle: "EQUAL",
      },
    ],
  },
  {
    id: "XR-IMP-036J-006",
    proofs: [
      {
        file: "src/components/ordering/imp036j-tranche5-presentation.test.tsx",
        needle: "complimentary-line",
      },
    ],
  },
  {
    id: "XR-IMP-036J-007",
    proofs: [
      {
        file: "src/components/ordering/imp036j-tranche5-checkout-remediation.test.tsx",
        needle: "STALE",
      },
    ],
  },
  {
    id: "XR-IMP-036J-008",
    proofs: [
      {
        file: "src/components/ordering/checkout-snapshot-presentation.test.ts",
        needle: "sealedCustomerSavingsFromSnapshot",
      },
    ],
  },
  {
    id: "XR-IMP-036J-009",
    proofs: [
      {
        file: "tests/administration/PromotionsEditor.test.tsx",
        needle: "retire",
      },
    ],
  },
  {
    id: "XR-IMP-036J-010",
    proofs: [
      {
        file: "tests/e2e/customer-ordering.spec.ts",
        needle: "mobile: IMP-036J responsive commercial Cart Review Payment proof",
      },
      {
        file: "tests/e2e/customer-ordering.spec.ts",
        needle: "IMP-036J responsive commercial Cart Review Payment proof at lg",
      },
      {
        file: "tests/e2e/customer-ordering.spec.ts",
        needle: "REVIEW_KEYBOARD_ORDER_PROOF",
      },
      {
        file: "tests/e2e/customer-ordering.spec.ts",
        needle: 'emulateMedia({ reducedMotion: "reduce" })',
      },
      {
        file: "tests/e2e/customer-ordering.spec.ts",
        needle: "PAYMENT_READ_ONLY_PROOF",
      },
      {
        file: "scripts/imp036j-tranche8-responsive-browser-proof.mjs",
        needle: "playwright.customer-ordering.config.ts",
      },
    ],
  },
  {
    id: "XR-IMP-036J-011",
    proofs: [
      {
        file: "src/components/ordering/imp036j-tranche5-presentation.test.tsx",
        needle: "IMP036J_COPY.INVALID",
      },
    ],
  },
  {
    id: "XR-IMP-036J-012",
    proofs: [
      {
        file: "src/components/ordering/imp036j-tranche5-presentation.test.tsx",
        needle:
          "pickup omits delivery saving and uses mode-clause copy without first-order history",
      },
      {
        file: "tests/promotions/imp036j-tranche3-commercial-evaluation.test.ts",
        needle: "19. fulfilment mode eligibility honored",
      },
    ],
  },
  {
    id: "XR-IMP-036J-013",
    proofs: [
      {
        file: "src/components/ordering/imp036j-tranche5-presentation.test.tsx",
        needle: "INCLUDED",
      },
    ],
  },
];

const BUSINESS_RULES: readonly Evidence[] = [
  {
    id: "BR-036J-001",
    proofs: [
      {
        file: "tests/promotions/imp036j-tranche3-commercial-evaluation.test.ts",
        needle: "1. primary + compatible delivery incentive both apply",
      },
      {
        file: "tests/database/imp036j-tranche6-workforce-authoring.integration.test.ts",
        needle:
          "authors automatic and coupon Offers with V1 fields, inspect, retire, gift, auth, CAS, and real concurrent complimentary activation",
      },
    ],
  },
  {
    id: "BR-036J-002",
    proofs: [
      {
        file: "tests/database/imp036j-tranche6-workforce-authoring.integration.test.ts",
        needle: 'triggerType: "automatic"',
      },
      {
        file: "tests/database/imp036j-tranche6-workforce-authoring.integration.test.ts",
        needle: 'triggerType: "coupon"',
      },
      {
        file: "src/components/ordering/imp036j-tranche5-presentation.test.tsx",
        needle: "AR-036J-T5-15 uses generic applied copy when another Offer is still below threshold",
      },
    ],
  },
  {
    id: "BR-036J-003",
    proofs: [
      {
        file: "tests/database/imp036j-tranche4-commercial-commands.integration.test.ts",
        needle: "guest unrestricted coupon stores shared state; first-order coupon does not invent a saving",
      },
      {
        file: "src/components/ordering/imp036j-tranche5-presentation.test.tsx",
        needle: "maps coupon presentation classes to locked copy and never says better price on equal payable",
      },
    ],
  },
  {
    id: "BR-036J-004",
    proofs: [
      {
        file: "tests/promotions/imp036j-tranche3-commercial-evaluation.test.ts",
        needle: "totalSaved = merchandiseOrOrderSaving + deliverySaving",
      },
      {
        file: "src/components/ordering/imp036j-tranche5-presentation.test.tsx",
        needle: "does not invent a delivery-saving row for standing ₹0 delivery",
      },
    ],
  },
  {
    id: "BR-036J-005",
    proofs: [
      {
        file: "tests/database/imp036j-tranche4-commercial-commands.integration.test.ts",
        needle: "changed payable before bind returns CHECKOUT_REPRICED",
      },
      {
        file: "src/components/ordering/imp036j-tranche5-presentation.test.tsx",
        needle: "AR-036J-T5-16/17 READY_FOR_PAYMENT reload reads sealed snapshot savings",
      },
    ],
  },
  {
    id: "BR-036J-006",
    proofs: [
      {
        file: "tests/database/imp036j-tranche4-commercial-commands.integration.test.ts",
        needle: "one first-order Offer reserves one guard; success consumes; refund does not restore",
      },
      {
        file: "tests/database/imp036j-tranche4-commercial-commands.integration.test.ts",
        needle:
          "failed payment releases the first-order guard; retry before resolution is refused; retry after release creates a new reserved guard",
      },
    ],
  },
  {
    id: "BR-036J-007",
    proofs: [
      {
        file: "tests/promotions/imp036j-tranche3-commercial-evaluation.test.ts",
        needle: "19. fulfilment mode eligibility honored",
      },
      {
        file: "tests/database/imp036j-tranche4-commercial-commands.integration.test.ts",
        needle: "SCHEDULED-only Offer is consumed from accepted timing and timing change is an origin (AC-036J-006-02)",
      },
      {
        file: "tests/promotions/imp036j-tranche3-commercial-evaluation.test.ts",
        needle: "10. standing ₹0 delivery produces no fake saving",
      },
    ],
  },
  {
    id: "BR-036J-008",
    proofs: [
      {
        file: "tests/promotions/imp036j-tranche3-commercial-evaluation.test.ts",
        needle: "1. primary + compatible delivery incentive both apply",
      },
      {
        file: "tests/promotions/imp036j-tranche3-commercial-evaluation.test.ts",
        needle: "2. two primary merchandise benefits never stack",
      },
      {
        file: "tests/promotions/imp036j-tranche3-commercial-evaluation.test.ts",
        needle: "3. BOGO does not stack with another merchandise discount",
      },
      {
        file: "tests/promotions/imp036j-tranche3-commercial-evaluation.test.ts",
        needle: "4. one delivery incentive maximum",
      },
      {
        file: "tests/promotions/imp036j-tranche3-commercial-evaluation.test.ts",
        needle: "14. complimentary equal payable selects complimentary",
      },
    ],
  },
  {
    id: "BR-036J-009",
    proofs: [
      {
        file: "tests/promotions/imp036j-tranche3-commercial-evaluation.test.ts",
        needle: "6. approved ₹80 + ₹40 pair beats exclusive ₹90 coupon",
      },
      {
        file: "tests/promotions/imp036j-tranche3-commercial-evaluation.test.ts",
        needle: "11. valid coupon strictly worse => COUPON_VALID_NOT_SELECTED",
      },
      {
        file: "tests/database/imp036j-tranche4-commercial-commands.integration.test.ts",
        needle: "Review uses the same cart coupon commands (AC-036J-002-06/07/08)",
      },
    ],
  },
  {
    id: "BR-036J-010",
    proofs: [
      {
        file: "tests/database/imp036j-tranche4-commercial-commands.integration.test.ts",
        needle: "last global promotion cap unit: at most one winner",
      },
      {
        file: "tests/database/imp036j-tranche4-commercial-commands.integration.test.ts",
        needle: "last per-customer promotion cap unit: at most allowed capacity commits",
      },
      {
        file: "tests/promotions/engine.test.ts",
        needle: "applies maximum_discount_paise cap",
      },
    ],
  },
  {
    id: "BR-036J-011",
    proofs: [
      {
        file: "tests/promotions/engine.test.ts",
        needle: "applies maximum_discount_paise cap",
      },
      {
        file: "tests/promotions/engine.test.ts",
        needle: "caps fixed discount to capacity",
      },
      {
        file: "tests/database/imp036j-tranche6-workforce-authoring.integration.test.ts",
        needle: "authors BOGO, minimum quantity, scopes, and evaluates authored outcomes",
      },
      {
        file: "tests/promotions/imp036j-tranche3-commercial-evaluation.test.ts",
        needle: "14. complimentary equal payable selects complimentary",
      },
      {
        file: "tests/database/imp036j-tranche6-workforce-authoring.integration.test.ts",
        needle: 'emptyMoneyBenefit("delivery_fee_waiver")',
      },
    ],
  },
  {
    id: "BR-036J-012",
    proofs: [
      {
        file: "tests/promotions/imp036j-tranche3-commercial-evaluation.test.ts",
        needle: "5. best COMPLETE combination wins by final payable",
      },
      {
        file: "src/components/ordering/imp036j-tranche5-presentation.test.tsx",
        needle: "live promotion evaluation must not reconstruct payment truth",
      },
    ],
  },
  {
    id: "BR-036J-013",
    proofs: [
      {
        file: "tests/database/imp036j-tranche4-commercial-commands.integration.test.ts",
        needle: "Review uses the same cart coupon commands (AC-036J-002-06/07/08)",
      },
      {
        file: "src/components/ordering/imp036j-tranche5-presentation.test.tsx",
        needle: "PaymentPanel is a read-only commercial summary without coupon mutation controls",
      },
    ],
  },
  {
    id: "BR-036J-014",
    proofs: [
      {
        file: "src/components/ordering/imp036j-tranche5-presentation.test.tsx",
        needle: "renders complimentary included line without a picker",
      },
      {
        file: "tests/database/imp036j-tranche6-workforce-authoring.integration.test.ts",
        needle: "COPY_OP_GIFT_INVALID",
      },
      {
        file: "tests/database/imp036j-tranche4-commercial-commands.integration.test.ts",
        needle: "unavailable complimentary line refuses stale bind without substitution",
      },
      {
        file: "tests/promotions/imp036j-tranche3-commercial-evaluation.test.ts",
        needle: "16–17. two qualifying complimentary Offers => NONE_CHOSEN; non-gift still compete",
      },
    ],
  },
];

describe("IMP-036J T8 coverage completeness", () => {
  it("rejects documentation and production-source-only evidence paths", () => {
    expect(isExecutableProofFile("docs/platform/product/IMP-036J/product-definition.md")).toBe(
      false,
    );
    expect(isExecutableProofFile("src/components/ordering/imp036j-copy.ts")).toBe(false);
    expect(isExecutableProofFile("src/components/ordering/CommercialOfferStack.tsx")).toBe(false);
    expect(
      isExecutableProofFile("src/components/ordering/imp036j-tranche5-presentation.test.tsx"),
    ).toBe(true);
    expect(isExecutableProofFile("tests/promotions/imp036j-tranche3-commercial-evaluation.test.ts")).toBe(
      true,
    );
    expect(isExecutableProofFile("scripts/imp036j-tranche5-responsive-proof.mjs")).toBe(true);
    expect(isExecutableProofFile("scripts/imp036j-tranche8-responsive-browser-proof.mjs")).toBe(
      true,
    );
    expect(isExecutableProofFile("tests/e2e/customer-ordering.spec.ts")).toBe(true);
  });

  it("maps XR-IMP-036J-010 to integrated Cart Review Payment proofs below lg and at lg", () => {
    const spec = load("tests/e2e/customer-ordering.spec.ts");
    expect(spec).toContain("mobile: IMP-036J responsive commercial Cart Review Payment proof");
    expect(spec).toContain("IMP-036J responsive commercial Cart Review Payment proof at lg");
    expect(spec).toContain("persist narrow viewport identity 390x844");
    expect(spec).toContain("persist lg viewport identity 1024x900");
    expect(spec).toContain("CART_NARROW");
    expect(spec).toContain("CART_LG");
    expect(spec).toContain("REVIEW_NARROW");
    expect(spec).toContain("REVIEW_LG");
    expect(spec).toContain("PAYMENT_NARROW");
    expect(spec).toContain("PAYMENT_LG");
    const runner = load("scripts/imp036j-tranche8-responsive-browser-proof.mjs");
    expect(runner).toContain("IMP-036J responsive commercial Cart Review Payment proof");
    const pkg = load("package.json");
    expect(pkg).toContain("scripts/imp036j-tranche8-responsive-browser-proof.mjs");
  });

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

  it("maps every business rule to live executable behavioral evidence", () => {
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
