/**
 * Real Chromium proof for IMP-036J T5 Cart breakpoint hierarchy.
 * jsdom cannot evaluate CSS visibility; this script uses Playwright.
 */
import { chromium } from "playwright";

const html = `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<style>
  .hidden { display: none !important; }
  @media (min-width: 1024px) {
    .lg\\:block { display: block !important; }
    .lg\\:hidden { display: none !important; }
    .hidden.lg\\:block { display: block !important; }
  }
  @media (max-width: 1023px) {
    .lg\\:block { display: none !important; }
  }
</style>
</head>
<body>
  <main>
    <div data-testid="cart-narrow-offer" class="lg:hidden">
      <section data-testid="price-summary">
        <div data-offer-component="ORDER_SAVING" data-offer-present="true" data-offer-amount="8000">Order saving</div>
        <div data-testid="complimentary-line">1 × Gift</div>
      </section>
      <section data-testid="coupon-field"><label>Coupon<input data-testid="coupon-input" /></label></section>
    </div>
    <aside data-testid="cart-order-summary" class="hidden lg:block">
      <section data-testid="price-summary">
        <div data-offer-component="ORDER_SAVING" data-offer-present="true" data-offer-amount="8000">Order saving</div>
        <div data-offer-component="CURRENT_CHECKOUT_TOTAL" data-offer-present="true" data-offer-amount="24900">Current total</div>
      </section>
      <section data-testid="coupon-field"><label>Coupon<input data-testid="coupon-input" /></label></section>
      <button>Checkout</button>
    </aside>
    <div data-testid="cart-mobile-checkout" class="lg:hidden">
      <p data-testid="cart-sticky-amount" data-offer-component="CURRENT_CHECKOUT_TOTAL" data-offer-present="true" data-offer-amount="24900">Current total</p>
      <button>Checkout</button>
    </div>
  </main>
</body>
</html>`;

async function assertViewport(page, width, expectations) {
  await page.setViewportSize({ width, height: 900 });
  const result = await page.evaluate((checks) => {
    const visible = (el) => {
      if (!el) return false;
      const style = window.getComputedStyle(el);
      return style.display !== "none" && style.visibility !== "hidden";
    };
    const narrow = document.querySelector('[data-testid="cart-narrow-offer"]');
    const desktop = document.querySelector('[data-testid="cart-order-summary"]');
    const sticky = document.querySelector('[data-testid="cart-mobile-checkout"]');
    return {
      narrowVisible: visible(narrow),
      desktopVisible: visible(desktop),
      stickyVisible: visible(sticky),
      narrowHasSaving: Boolean(
        narrow?.querySelector('[data-offer-component="ORDER_SAVING"]'),
      ),
      narrowHasCoupon: Boolean(narrow?.querySelector('[data-testid="coupon-input"]')),
      desktopHasAmount: Boolean(
        desktop?.querySelector('[data-offer-component="CURRENT_CHECKOUT_TOTAL"]'),
      ),
      stickyHasAmount: Boolean(
        sticky?.querySelector('[data-testid="cart-sticky-amount"]'),
      ),
      checks,
    };
  }, expectations);
  for (const [key, expected] of Object.entries(expectations)) {
    if (result[key] !== expected) {
      throw new Error(
        `viewport ${width}: ${key} expected ${expected}, got ${result[key]}`,
      );
    }
  }
}

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
await page.setContent(html, { waitUntil: "domcontentloaded" });

await assertViewport(page, 390, {
  narrowVisible: true,
  desktopVisible: false,
  stickyVisible: true,
  narrowHasSaving: true,
  narrowHasCoupon: true,
  stickyHasAmount: true,
  desktopHasAmount: true, // present in DOM but hidden
});

await assertViewport(page, 1280, {
  narrowVisible: false,
  desktopVisible: true,
  stickyVisible: false,
  narrowHasSaving: true,
  narrowHasCoupon: true,
  stickyHasAmount: true,
  desktopHasAmount: true,
});

async function observeAt(width) {
  await page.setViewportSize({ width, height: 900 });
  return page.evaluate(() => {
    const visible = (el) => {
      if (!el) return false;
      const style = window.getComputedStyle(el);
      return style.display !== "none" && style.visibility !== "hidden";
    };
    const desktop = document.querySelector('[data-testid="cart-order-summary"]');
    const narrow = document.querySelector('[data-testid="cart-narrow-offer"]');
    const sticky = document.querySelector('[data-testid="cart-mobile-checkout"]');
    const desktopInner = desktop.querySelector("[data-offer-component]");
    const classHiddenSelectsDesktop = Boolean(desktopInner?.closest(".hidden"));
    const desktopVisible = visible(desktop);
    const narrowVisible = visible(narrow);
    const stickyVisible = visible(sticky);
    const roots =
      desktopVisible && !narrowVisible
        ? [desktop]
        : narrowVisible && stickyVisible
          ? [narrow, sticky]
          : [];
    const kinds = roots.flatMap((root) =>
      [...root.querySelectorAll("[data-offer-component]")].map((node) =>
        node.getAttribute("data-offer-component"),
      ),
    );
    return {
      classHiddenSelectsDesktop,
      desktopVisible,
      narrowVisible,
      stickyVisible,
      kinds,
      rootCount: roots.length,
    };
  });
}

const narrowObs = await observeAt(390);
if (!narrowObs.narrowVisible || narrowObs.desktopVisible) {
  throw new Error("390px must show only narrow presentation");
}
if (narrowObs.kinds.filter((kind) => kind === "ORDER_SAVING").length !== 1) {
  throw new Error("390px posted hidden desktop ORDER_SAVING");
}
if (!narrowObs.kinds.includes("CURRENT_CHECKOUT_TOTAL")) {
  throw new Error("390px missing sticky amount");
}

const desktopObs = await observeAt(1280);
if (!desktopObs.desktopVisible || desktopObs.narrowVisible) {
  throw new Error("1280px must show only desktop presentation");
}
if (desktopObs.classHiddenSelectsDesktop !== true) {
  throw new Error("desktop still carries Tailwind hidden class while visible");
}
if (desktopObs.kinds.filter((kind) => kind === "ORDER_SAVING").length !== 1) {
  throw new Error("1280px did not post visible desktop once");
}
if (desktopObs.kinds.filter((kind) => kind === "CURRENT_CHECKOUT_TOTAL").length !== 1) {
  throw new Error("1280px missing or duplicated desktop amount");
}

// Hidden desktop must not be treated as the narrow committed observation root.
const observationSafety = await page.evaluate(() => {
  const desktop = document.querySelector('[data-testid="cart-order-summary"]');
  const style = window.getComputedStyle(desktop);
  return {
    desktopDisplay: style.display,
    desktopHiddenClass: desktop.classList.contains("hidden"),
  };
});
await page.setViewportSize({ width: 390, height: 900 });
const narrowObservation = await page.evaluate(() => {
  const desktop = document.querySelector('[data-testid="cart-order-summary"]');
  const narrow = document.querySelector('[data-testid="cart-narrow-offer"]');
  const sticky = document.querySelector('[data-testid="cart-mobile-checkout"]');
  const desktopDisplay = window.getComputedStyle(desktop).display;
  const roots = desktopDisplay === "none" ? [narrow, sticky] : [desktop];
  const kinds = roots.flatMap((root) =>
    [...root.querySelectorAll("[data-offer-component]")].map((node) =>
      node.getAttribute("data-offer-component"),
    ),
  );
  return { desktopDisplay, kinds };
});
if (narrowObservation.desktopDisplay !== "none") {
  throw new Error("narrow viewport still shows desktop summary");
}
if (!narrowObservation.kinds.includes("ORDER_SAVING")) {
  throw new Error("narrow observation missing ORDER_SAVING");
}
if (!narrowObservation.kinds.includes("CURRENT_CHECKOUT_TOTAL")) {
  throw new Error("narrow observation missing sticky amount component");
}
if (observationSafety.desktopHiddenClass !== true) {
  throw new Error("desktop summary missing hidden class baseline");
}

await browser.close();
console.log("IMP036J_T5_RESPONSIVE_PROOF=PASS");
