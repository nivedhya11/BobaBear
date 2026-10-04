import { describe, expect, it } from "vitest";

import { selectVisibleCartObservationRoots } from "./committed-presentation-observation";

function node(testId: string, extraClass = ""): HTMLElement {
  const el = document.createElement("div");
  el.setAttribute("data-testid", testId);
  if (extraClass) el.className = extraClass;
  const inner = document.createElement("div");
  inner.setAttribute("data-offer-component", "ORDER_SAVING");
  el.append(inner);
  document.body.append(el);
  return inner;
}

describe("AR-036J-T5-11 visible committed observation roots", () => {
  it("does not treat a Tailwind hidden class as computed invisibility", () => {
    const desktopInner = node("cart-order-summary", "hidden lg:block");
    const desktopSurface = desktopInner.closest("[data-testid='cart-order-summary']");
    expect(desktopSurface?.classList.contains("hidden")).toBe(true);
    const visible = new Set([desktopSurface]);
    const roots = selectVisibleCartObservationRoots({
      observationRoot: "desktop",
      desktop: desktopInner,
      narrowOffer: null,
      sticky: null,
      isVisible: (el) => (el ? visible.has(el) : false),
    });
    expect(roots).toEqual([desktopInner]);
  });

  it("posts only the visible narrow stack + sticky amount at 390px", () => {
    const narrowInner = node("cart-narrow-offer", "lg:hidden");
    const stickyInner = node("cart-mobile-checkout", "lg:hidden");
    const desktopInner = node("cart-order-summary", "hidden lg:block");
    const visible = new Set([
      narrowInner.closest("[data-testid='cart-narrow-offer']"),
      stickyInner.closest("[data-testid='cart-mobile-checkout']"),
    ]);
    expect(
      selectVisibleCartObservationRoots({
        observationRoot: "narrow",
        desktop: desktopInner,
        narrowOffer: narrowInner,
        sticky: stickyInner,
        isVisible: (el) => (el ? visible.has(el) : false),
      }),
    ).toEqual([narrowInner, stickyInner]);
    expect(
      selectVisibleCartObservationRoots({
        observationRoot: "desktop",
        desktop: desktopInner,
        narrowOffer: narrowInner,
        sticky: stickyInner,
        isVisible: (el) => (el ? visible.has(el) : false),
      }),
    ).toBeNull();
  });

  it("posts only the visible desktop presentation at 1280px", () => {
    const narrowInner = node("cart-narrow-offer", "lg:hidden");
    const stickyInner = node("cart-mobile-checkout", "lg:hidden");
    const desktopInner = node("cart-order-summary", "hidden lg:block");
    const visible = new Set([desktopInner.closest("[data-testid='cart-order-summary']")]);
    expect(
      selectVisibleCartObservationRoots({
        observationRoot: "desktop",
        desktop: desktopInner,
        narrowOffer: narrowInner,
        sticky: stickyInner,
        isVisible: (el) => (el ? visible.has(el) : false),
      }),
    ).toEqual([desktopInner]);
    expect(
      selectVisibleCartObservationRoots({
        observationRoot: "narrow",
        desktop: desktopInner,
        narrowOffer: narrowInner,
        sticky: stickyInner,
        isVisible: (el) => (el ? visible.has(el) : false),
      }),
    ).toBeNull();
  });
});
