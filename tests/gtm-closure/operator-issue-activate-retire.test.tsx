/**
 * Operator issue, activate, and retire on the accepted coupon lifecycle.
 * AC-036J-012-01 and AC-036J-012-03 for the pure transition and confirmation dialog.
 * HTTP authoring and concurrent complimentary activation are not executed here.
 */
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { ConsequenceReviewDialog } from "../../src/components/administration/commercial/ConsequenceReviewDialog";
import {
  assertCouponActivationReady,
  assertLegalCouponLifecycleTransition,
  evaluateEligibility,
  isLegalCouponLifecycleTransition,
  PromotionAdminError,
} from "../../src/shared/promotions";
import {
  COPY_CANCEL,
  COPY_OP_RETIRED,
  COPY_RETIRE_BODY,
  COPY_RETIRE_CONFIRM,
  COPY_RETIRE_TITLE,
} from "../../src/shared/promotions/operator-copy";
import {
  evaluationContext,
  merchandiseSnapshot,
  offer,
} from "./support/promotion-fixtures";

describe("operator coupon issue, activate, and retire", () => {
  it("allows draft to active, active to retired, and no return from retired", () => {
    expect(isLegalCouponLifecycleTransition("draft", "active")).toBe(true);
    expect(isLegalCouponLifecycleTransition("active", "retired")).toBe(true);
    expect(isLegalCouponLifecycleTransition("retired", "active")).toBe(false);
    expect(isLegalCouponLifecycleTransition("draft", "retired")).toBe(false);
    expect(() => assertLegalCouponLifecycleTransition("retired", "active")).toThrow(
      PromotionAdminError,
    );
  });

  it("refuses to activate a coupon until its promotion is an active coupon offer", () => {
    expect(() =>
      assertCouponActivationReady({
        coupon: { startsAt: null, endsAt: null },
        promotion: {
          triggerType: "coupon",
          status: "draft",
          startsAt: new Date("2026-01-01T00:00:00.000Z"),
          endsAt: null,
        },
      }),
    ).toThrow(expect.objectContaining({ code: "COUPON_PROMOTION_NOT_ACTIVE" }));

    expect(() =>
      assertCouponActivationReady({
        coupon: { startsAt: null, endsAt: null },
        promotion: {
          triggerType: "coupon",
          status: "active",
          startsAt: new Date("2026-01-01T00:00:00.000Z"),
          endsAt: null,
        },
      }),
    ).not.toThrow();
  });

  it("stops a retired offer from applying while the sealed saving is a separate snapshot fact", () => {
    const retired = offer({ id: "retired-offer", status: "retired" });
    const result = evaluateEligibility(
      retired,
      merchandiseSnapshot(BigInt(10_000)),
      evaluationContext(),
    );
    expect(result).toMatchObject({ eligible: false, reasonCode: "RETIRED" });
  });

  it("names retire and cancel, and cancel does not confirm retirement", async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();
    const onConfirm = vi.fn();
    render(
      <ConsequenceReviewDialog
        open
        title={COPY_RETIRE_TITLE}
        draftLabel={COPY_RETIRE_BODY}
        effectiveLabel={COPY_OP_RETIRED}
        dimensions={[]}
        revisionLabel="Expected revision"
        revisionValue="3"
        confirmLabel={COPY_RETIRE_CONFIRM}
        cancelLabel={COPY_CANCEL}
        onCancel={onCancel}
        onConfirm={onConfirm}
      />,
    );

    expect(screen.getByRole("dialog", { name: COPY_RETIRE_TITLE })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: COPY_RETIRE_CONFIRM })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: COPY_CANCEL })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: COPY_CANCEL }));
    expect(onCancel).toHaveBeenCalledOnce();
    expect(onConfirm).not.toHaveBeenCalled();
  });
});
