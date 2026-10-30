/**
 * Projects authoritative Cart evaluation line problems onto the cart lines the customer sees.
 * Presentation only — evaluation remains the availability authority.
 */

import { commerceErrorCopy } from "@/components/ordering/error-copy";
import type { CommerceCartEvaluation } from "@/lib/customer-commerce";
import type { CartLinePresentation } from "@/components/ordering/cart-presentation";

export type CartLineProblemSummaryEntry = Readonly<{
  key: string;
  itemName: string | null;
  message: string;
}>;

export type CartLineProblemPresentation = Readonly<{
  byLineId: ReadonlyMap<string, readonly string[]>;
  summary: readonly CartLineProblemSummaryEntry[];
}>;

const EMPTY: CartLineProblemPresentation = Object.freeze({
  byLineId: new Map<string, readonly string[]>(),
  summary: Object.freeze([]),
});

export function presentCartLineProblems(
  evaluation: Pick<CommerceCartEvaluation, "cartRevision" | "problems"> | null | undefined,
  cartRevision: string | null | undefined,
  lines: readonly CartLinePresentation[],
): CartLineProblemPresentation {
  const problems = evaluation?.problems;
  if (!problems || problems.length === 0) return EMPTY;

  const evaluationIsCurrent = evaluation.cartRevision === cartRevision;
  const lineById = new Map(lines.map((line) => [line.lineId, line]));
  const byLineId = new Map<string, string[]>();
  const summary: CartLineProblemSummaryEntry[] = [];
  const seen = new Set<string>();

  for (const problem of problems) {
    const line = lineById.get(problem.cartLineId);
    // A line missing from the current cart is only reportable when the evaluation matches it.
    if (!line && !evaluationIsCurrent) continue;
    const message = commerceErrorCopy(problem.code);
    const dedupeKey = `${problem.cartLineId}\u0000${message}`;
    if (seen.has(dedupeKey)) continue;
    seen.add(dedupeKey);

    if (line) {
      const messages = byLineId.get(line.lineId) ?? [];
      messages.push(message);
      byLineId.set(line.lineId, messages);
    }
    summary.push(
      Object.freeze({
        key: `${problem.cartLineId}:${problem.code}`,
        itemName: line?.itemName ?? null,
        message,
      }),
    );
  }

  return Object.freeze({ byLineId, summary: Object.freeze(summary) });
}
