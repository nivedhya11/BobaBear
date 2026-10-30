import { describe, expect, it } from "vitest";

import { IMP036J_COPY } from "./imp036j-copy";
import {
  compareAuthoritativePayablePaise,
  decideStaleRecoveryPresentation,
  parseAuthoritativePaiseString,
} from "./stale-recovery-presentation";

describe("stale-recovery-presentation (#391A)", () => {
  it("parses only integer paise digit strings", () => {
    expect(parseAuthoritativePaiseString("95240")).toBe(BigInt("95240"));
    expect(parseAuthoritativePaiseString("095240")).toBe(BigInt("95240"));
    expect(parseAuthoritativePaiseString("952.40")).toBeNull();
    expect(parseAuthoritativePaiseString("")).toBeNull();
    expect(parseAuthoritativePaiseString(undefined)).toBeNull();
    expect(parseAuthoritativePaiseString("1e3")).toBeNull();
  });

  it("compares authoritative payables without string/number coercion hazards", () => {
    expect(compareAuthoritativePayablePaise("95240", "95240")).toBe("equal");
    expect(compareAuthoritativePayablePaise("95240", "95241")).toBe("changed");
    expect(compareAuthoritativePayablePaise("95240", null)).toBe("unknown");
    expect(compareAuthoritativePayablePaise("95.240", "95240")).toBe("unknown");
  });

  it("CASE A — CHECKOUT_REPRICED with equal payable uses neutral copy", () => {
    const decided = decideStaleRecoveryPresentation({
      trigger: "CHECKOUT_REPRICED",
      priorGrandTotalPaise: "95240",
      freshGrandTotalPaise: "95240",
      freshSnapshotConfirmed: true,
    });
    expect(decided.kind).toBe("amount_unchanged");
    expect(decided.message).toBe(IMP036J_COPY.STALE_UNCONFIRMED);
    expect(decided.message).not.toContain("total changed");
    expect(decided.showFreshPayableAsCurrent).toBe(true);
  });

  it("CASE B — CHECKOUT_REPRICED with changed payable uses COPY-STALE", () => {
    const decided = decideStaleRecoveryPresentation({
      trigger: "CHECKOUT_REPRICED",
      priorGrandTotalPaise: "95240",
      freshGrandTotalPaise: "99900",
      freshSnapshotConfirmed: true,
    });
    expect(decided.kind).toBe("amount_changed");
    expect(decided.message).toBe(IMP036J_COPY.STALE);
    expect(decided.showFreshPayableAsCurrent).toBe(true);
  });

  it("CASE C — unconfirmed fresh result stays neutral and hides current payable", () => {
    const decided = decideStaleRecoveryPresentation({
      trigger: "CHECKOUT_REPRICED",
      priorGrandTotalPaise: "95240",
      freshGrandTotalPaise: null,
      freshSnapshotConfirmed: false,
    });
    expect(decided.kind).toBe("unknown");
    expect(decided.message).toBe(IMP036J_COPY.STALE_UNCONFIRMED);
    expect(decided.showFreshPayableAsCurrent).toBe(false);
  });

  it("does not infer money change from CHECKOUT_REPRICED alone when comparison is unknown", () => {
    const decided = decideStaleRecoveryPresentation({
      trigger: "CHECKOUT_REPRICED",
      priorGrandTotalPaise: null,
      freshGrandTotalPaise: "95240",
      freshSnapshotConfirmed: true,
    });
    expect(decided.kind).toBe("unknown");
    expect(decided.message).toBe(IMP036J_COPY.STALE_UNCONFIRMED);
    expect(decided.message).not.toBe(IMP036J_COPY.STALE);
  });

  it("CASE D — CHECKOUT_CART_CHANGED never claims monetary repricing", () => {
    const equal = decideStaleRecoveryPresentation({
      trigger: "CHECKOUT_CART_CHANGED",
      priorGrandTotalPaise: "23900",
      freshGrandTotalPaise: "23900",
      freshSnapshotConfirmed: true,
    });
    const changed = decideStaleRecoveryPresentation({
      trigger: "CHECKOUT_CART_CHANGED",
      priorGrandTotalPaise: "23900",
      freshGrandTotalPaise: "29900",
      freshSnapshotConfirmed: true,
    });
    expect(equal.kind).toBe("cart_changed");
    expect(changed.kind).toBe("cart_changed");
    expect(equal.message).toBe(IMP036J_COPY.STALE_CART_CHANGED);
    expect(changed.message).toBe(IMP036J_COPY.STALE_CART_CHANGED);
    expect(equal.message).not.toBe(IMP036J_COPY.STALE);
    expect(changed.message).not.toBe(IMP036J_COPY.STALE);
  });
});
