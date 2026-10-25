/**
 * IMP-036J #385 — non-production price-presentation comparison.
 *
 * Not imported by customer or operator routes. Does not format live checkout
 * state and does not invent rupee amounts for scenarios that were not observed
 * or sealed in a fixture. Founder selection of A or B is not recorded here.
 */

export type EvidenceMoney = Readonly<{
  /** Null when this surface has no authoritative figure. Never invent one. */
  paise: string | null;
  label: string;
}>;

export type EvidenceLine = Readonly<{
  quantityLabel: string;
  /** Sealed or observed gross. Null when not projected for this scenario. */
  grossPaise: string | null;
  /** Amount already shown as the item line. Null when this scenario has no item price. */
  netPaise: string | null;
  /** True only when a merchandise or order saving applies to this line. */
  merchandiseSavingApplies: boolean;
  complimentary: boolean;
}>;

export type EvidenceScenario = Readonly<{
  id: string;
  title: string;
  surface: string;
  fulfilment: "DELIVERY" | "PICKUP" | "NOT_OBSERVED";
  lines: readonly EvidenceLine[];
  subtotalPaise: string | null;
  orderSavingPaise: string | null;
  packagingPaise: string | null;
  deliveryChargePaise: string | null;
  deliverySavingPaise: string | null;
  taxPaise: string | null;
  payablePaise: string | null;
  gapNote: string | null;
}>;

export const GROSS_FIGURE_ABSENT = "No authoritative gross figure in this fixture.";
export const ITEM_PRICE_ABSENT = "No item price in this fixture.";

/** Founder UAT review, 2026-10-08. One reported merchandise line. */
export const OBSERVED_COUPON_DELIVERY: EvidenceScenario = {
  id: "observed-coupon-delivery",
  title: "Observed coupon review",
  surface: "Checkout review",
  fulfilment: "DELIVERY",
  lines: [
    {
      quantityLabel: "2 × Purple Rain Taro Boba",
      grossPaise: "51800",
      netPaise: "46620",
      merchandiseSavingApplies: true,
      complimentary: false,
    },
  ],
  subtotalPaise: "51800",
  orderSavingPaise: "5180",
  packagingPaise: "2000",
  deliveryChargePaise: null,
  deliverySavingPaise: null,
  taxPaise: null,
  payablePaise: "48620",
  gapNote:
    "Item gross is the observed merchandise Subtotal. The review reported one merchandise line, so the line and the Subtotal are the same ₹518.00. That session did not separately record lineSubtotalPaise.",
};

/** Same issue: blank coupon field, item line matches Subtotal. */
export const OBSERVED_ZERO_DISCOUNT: EvidenceScenario = {
  id: "observed-zero-discount",
  title: "Observed review with no saving",
  surface: "Checkout review",
  fulfilment: "DELIVERY",
  lines: [
    {
      quantityLabel: "2 × Purple Rain Taro Boba",
      grossPaise: "51800",
      netPaise: "51800",
      merchandiseSavingApplies: false,
      complimentary: false,
    },
  ],
  subtotalPaise: "51800",
  orderSavingPaise: null,
  packagingPaise: "2000",
  deliveryChargePaise: null,
  deliverySavingPaise: null,
  taxPaise: null,
  payablePaise: "53800",
  gapNote: null,
};

/** No pickup prices were captured. Structure only. */
export const PICKUP_STRUCTURE: EvidenceScenario = {
  id: "pickup-structure",
  title: "Pickup",
  surface: "Checkout review",
  fulfilment: "PICKUP",
  lines: [
    {
      quantityLabel: "Item line",
      grossPaise: null,
      netPaise: null,
      merchandiseSavingApplies: false,
      complimentary: false,
    },
  ],
  subtotalPaise: null,
  orderSavingPaise: null,
  packagingPaise: null,
  deliveryChargePaise: null,
  deliverySavingPaise: null,
  taxPaise: null,
  payablePaise: null,
  gapNote:
    "No pickup prices were observed. A delivery saving row is omitted on pickup. No rupee figure is shown.",
};

/** Complimentary gross is not in the #385 fixture and was not observed. */
export const COMPLIMENTARY_STRUCTURE: EvidenceScenario = {
  id: "complimentary-structure",
  title: "Complimentary item",
  surface: "Checkout review",
  fulfilment: "NOT_OBSERVED",
  lines: [
    {
      quantityLabel: "Complimentary item",
      grossPaise: null,
      netPaise: "0",
      merchandiseSavingApplies: false,
      complimentary: true,
    },
  ],
  subtotalPaise: null,
  orderSavingPaise: null,
  packagingPaise: null,
  deliveryChargePaise: null,
  deliverySavingPaise: null,
  taxPaise: null,
  payablePaise: null,
  gapNote:
    "No complimentary rupee amount was observed. The sealed line total for a selected gift is ₹0 with “Included with your offer”. Option A does not invent the gift's gross price.",
};

/** Stacked merchandise plus delivery was not observed. */
export const STACKED_STRUCTURE: EvidenceScenario = {
  id: "stacked-structure",
  title: "Merchandise saving plus delivery saving",
  surface: "Checkout review",
  fulfilment: "DELIVERY",
  lines: [
    {
      quantityLabel: "Item line",
      grossPaise: null,
      netPaise: null,
      merchandiseSavingApplies: false,
      complimentary: false,
    },
  ],
  subtotalPaise: null,
  orderSavingPaise: null,
  packagingPaise: null,
  deliveryChargePaise: null,
  deliverySavingPaise: null,
  taxPaise: null,
  payablePaise: null,
  gapNote:
    "No stacked-discount prices were observed. A delivery saving stays on its own summary row and does not label the item “After discount”.",
};

export const EVIDENCE_SCENARIOS: readonly EvidenceScenario[] = [
  OBSERVED_COUPON_DELIVERY,
  OBSERVED_ZERO_DISCOUNT,
  PICKUP_STRUCTURE,
  COMPLIMENTARY_STRUCTURE,
  STACKED_STRUCTURE,
];

export function formatEvidencePaise(paise: string): string {
  const value = BigInt(paise);
  const negative = value < BigInt(0);
  const abs = negative ? -value : value;
  const rupees = abs / BigInt(100);
  const fraction = (abs % BigInt(100)).toString().padStart(2, "0");
  return `${negative ? "-" : ""}₹${rupees.toString()}.${fraction}`;
}

function Money({ paise }: { paise: string | null }) {
  if (paise === null) return <span>{GROSS_FIGURE_ABSENT}</span>;
  return <span className="gtm385-amount">{formatEvidencePaise(paise)}</span>;
}

function SummaryRow(props: { label: string; paise: string | null; testId: string }) {
  if (props.paise === null) return null;
  const amount = formatEvidencePaise(props.paise);
  return (
    <li className="gtm385-row" data-testid={props.testId}>
      <span>{props.label}</span>
      <span className="gtm385-amount">{amount}</span>
    </li>
  );
}

export function PricePresentationOption(props: {
  scenario: EvidenceScenario;
  option: "A" | "B";
  widthPx: number;
}) {
  const { scenario, option, widthPx } = props;
  const optionLabel =
    option === "A"
      ? "Option A, gross item price and a separate saving"
      : "Option B, net item price labelled After discount";
  const showDelivery = scenario.fulfilment === "DELIVERY";

  return (
    <section
      aria-label={optionLabel}
      data-option={option}
      data-scenario={scenario.id}
      data-width={widthPx}
      className="gtm385-option"
      style={{ width: widthPx, maxWidth: "100%" }}
    >
      <h3>{option === "A" ? "Option A" : "Option B"}</h3>
      <p className="gtm385-meta">
        {scenario.surface}
        {scenario.fulfilment === "NOT_OBSERVED" ? "" : ` · ${scenario.fulfilment}`}
      </p>
      <ul aria-label="Your items">
        {scenario.lines.map((line) => {
          const showAfterDiscount =
            option === "B" && line.merchandiseSavingApplies && line.netPaise !== null;
          const amount = option === "A" ? line.grossPaise : line.netPaise;
          return (
            <li key={line.quantityLabel} className="gtm385-row">
              <span>
                {line.quantityLabel}
                {line.complimentary ? (
                  <span className="gtm385-note">Included with your offer</span>
                ) : null}
              </span>
              <span className="gtm385-price">
                {showAfterDiscount ? <span className="gtm385-note">After discount</span> : null}
                {amount === null ? (
                  <span>{option === "A" ? GROSS_FIGURE_ABSENT : ITEM_PRICE_ABSENT}</span>
                ) : (
                  <Money paise={amount} />
                )}
              </span>
            </li>
          );
        })}
      </ul>
      <ul aria-label="Price summary">
        <SummaryRow label="Subtotal" paise={scenario.subtotalPaise} testId="summary-subtotal" />
        <SummaryRow
          label="Order saving"
          paise={scenario.orderSavingPaise}
          testId="summary-order-saving"
        />
        <SummaryRow label="Packaging" paise={scenario.packagingPaise} testId="summary-packaging" />
        {showDelivery ? (
          <SummaryRow
            label="Delivery"
            paise={scenario.deliveryChargePaise}
            testId="summary-delivery"
          />
        ) : null}
        {showDelivery ? (
          <SummaryRow
            label="Delivery saving"
            paise={scenario.deliverySavingPaise}
            testId="summary-delivery-saving"
          />
        ) : null}
        <SummaryRow label="Tax" paise={scenario.taxPaise} testId="summary-tax" />
        <SummaryRow
          label="Total payable"
          paise={scenario.payablePaise}
          testId="summary-payable"
        />
      </ul>
      {scenario.gapNote ? <p className="gtm385-note">{scenario.gapNote}</p> : null}
    </section>
  );
}

export function PricePresentationComparison(props: {
  scenario: EvidenceScenario;
  widthPx: number;
}) {
  return (
    <article aria-label={props.scenario.title} data-scenario={props.scenario.id}>
      <h2>{props.scenario.title}</h2>
      <div className={props.widthPx < 700 ? "gtm385-stack" : "gtm385-split"}>
        <PricePresentationOption scenario={props.scenario} option="A" widthPx={props.widthPx} />
        <PricePresentationOption scenario={props.scenario} option="B" widthPx={props.widthPx} />
      </div>
    </article>
  );
}

export const evidenceStyles = `
.gtm385-option { box-sizing: border-box; border: 1px solid #243042; border-radius: 12px; padding: 16px; background: #f7f4ef; color: #1c1915; font-family: Georgia, serif; }
.gtm385-option h3 { margin: 0 0 4px; font-size: 18px; }
.gtm385-meta, .gtm385-note { color: #4a433c; font-size: 13px; }
.gtm385-note { display: block; margin-top: 4px; }
.gtm385-row { display: flex; flex-wrap: wrap; justify-content: space-between; gap: 8px 16px; margin: 8px 0; }
.gtm385-price { display: flex; flex-direction: column; align-items: flex-end; min-width: 0; }
.gtm385-amount { font-variant-numeric: tabular-nums; font-weight: 700; white-space: nowrap; }
.gtm385-option ul[aria-label="Price summary"] { margin: 12px 0 0; border-top: 1px solid #243042; padding: 8px 0 0; list-style: none; }
.gtm385-split { display: flex; flex-wrap: wrap; gap: 16px; align-items: flex-start; }
.gtm385-stack { display: flex; flex-direction: column; gap: 16px; }
`;
