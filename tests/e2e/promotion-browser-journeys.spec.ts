import { randomInt } from "node:crypto";

import { expect, test, type Locator, type Page, type Route, type TestInfo } from "@playwright/test";

import { IMP036J_COPY } from "../../src/components/ordering/imp036j-copy";
import {
  installLocationProviderMocks,
  installMockGoogleMaps,
} from "./support/maps-location-mocks";
import { installRazorpayCheckoutMock } from "./support/razorpay-checkout-mock";

/**
 * Real application browser evidence for the IMP-036J rows that domain tests
 * do not close. Screenshots are Playwright captures of this running app.
 */

const FIXED_OTP_CODE = process.env.CUSTOMER_OTP_LOCAL_FIXED_CODE;
const PUBLIC_CONTROL_TOKEN = "gtm-uat-browser-control";

test.beforeEach(() => {
  test.skip(!FIXED_OTP_CODE, "CUSTOMER_OTP_LOCAL_FIXED_CODE must be set.");
  const token = process.env.E2E_HARNESS_CONTROL_TOKEN ?? "";
  const runId = process.env.E2E_HARNESS_RUN_ID ?? "";
  test.skip(token.length < 32 || token === PUBLIC_CONTROL_TOKEN, "per-run control token must be set.");
  test.skip(!/^[0-9a-f-]{36}$/i.test(runId), "per-run control identity must be set.");
});

function nextPhone(): string {
  return `98765${randomInt(0, 100_000).toString().padStart(5, "0")}`;
}

function cartCouponScope(page: Page): Locator {
  const width = page.viewportSize()?.width ?? 1440;
  return page.getByTestId(width >= 1024 ? "cart-order-summary" : "cart-narrow-offer");
}

async function control(page: Page, input: Record<string, unknown>): Promise<Record<string, unknown>> {
  const token = process.env.E2E_HARNESS_CONTROL_TOKEN ?? "";
  const runId = process.env.E2E_HARNESS_RUN_ID ?? "";
  const response = await page.request.post("/__e2e/control", {
    headers: { "x-e2e-control-token": token },
    data: { ...input, runId },
  });
  const body = (await response.json()) as Record<string, unknown>;
  if (!response.ok() || body.ok !== true) {
    throw new Error(`arm failed ${response.status()} ${JSON.stringify(body)}`);
  }
  return body;
}

async function replaceGuestCoupon(page: Page, code: string): Promise<Locator> {
  await page.goto("/order/cart/");
  await expect(page.getByRole("heading", { name: /your cart/i })).toBeVisible();
  const cart = cartCouponScope(page);
  const remove = cart.getByTestId("coupon-remove");
  if ((await remove.count()) > 0) {
    await remove.click();
    await expect(cart.getByTestId("coupon-apply")).toBeVisible({ timeout: 20_000 });
  }
  await cart.getByTestId("coupon-input").fill(code);
  await cart.getByTestId("coupon-apply").click();
  return cart;
}

async function arm(page: Page, scenario: string): Promise<Record<string, string>> {
  const body = await control(page, { action: "arm-m2", scenario });
  const coupons = body.coupons;
  if (!coupons || typeof coupons !== "object") return {};
  return Object.fromEntries(
    Object.entries(coupons as Record<string, unknown>).map(([key, value]) => [key, String(value)]),
  );
}

async function shot(page: Page, testInfo: TestInfo, name: string): Promise<void> {
  const path = testInfo.outputPath(`${name}.png`);
  await page.screenshot({ path, fullPage: true });
  await testInfo.attach(name, { path, contentType: "image/png" });
}

async function installLocationMocks(page: Page): Promise<void> {
  await installMockGoogleMaps(page);
  await installLocationProviderMocks(page, { stubServiceability: false });
}

async function addFirstPlainItem(page: Page, skipProductName?: string): Promise<void> {
  const menu = page.locator("#main-content");
  const buttons = menu.getByRole("button", { name: /^add (?!one\b)/i });
  await expect(buttons.first()).toBeVisible({ timeout: 20_000 });
  const count = await buttons.count();
  for (let i = 0; i < count; i += 1) {
    const button = buttons.nth(i);
    const row = button.locator("xpath=ancestor::li[1]");
    if ((await row.getByText("Customisable", { exact: true }).count()) > 0) continue;
    if (skipProductName && (await row.getByText(skipProductName, { exact: true }).count()) > 0) {
      continue;
    }
    await button.click();
    await expect(page.locator("header").getByRole("link", { name: /^cart \(1\)$/i })).toBeVisible({
      timeout: 15_000,
    });
    return;
  }
  throw new Error("menu did not expose a plain product");
}

async function confirmServiceableContext(page: Page): Promise<void> {
  const desktopTrigger = page.getByTestId("deliver-to-header-orientation");
  if (await desktopTrigger.isVisible()) await desktopTrigger.click();
  else await page.getByTestId("deliver-to-orientation").click();
  const dialog = page.getByTestId("location-selector-dialog");
  await expect(dialog).toBeVisible();
  await dialog.getByPlaceholder("Search area, street or landmark").fill("Rajpur");
  await page.getByRole("option", { name: "Rajpur Road, Dehradun" }).click();
  await expect(page.getByTestId("delivery-location-map-confirmation")).toBeVisible({
    timeout: 20_000,
  });
  await page.getByRole("button", { name: "Confirm location" }).click();
  await expect(page.getByTestId("delivery-location-map-confirmation")).toBeHidden({
    timeout: 20_000,
  });
}

async function openCart(page: Page, skipProductName?: string): Promise<void> {
  await installLocationMocks(page);
  await page.goto("/order/");
  await expect(page.getByRole("heading", { name: /^the bar$/i, level: 1 })).toBeVisible();
  await confirmServiceableContext(page);
  await expect(page.getByRole("heading", { name: /^the bar$/i, level: 1 })).toBeVisible({
    timeout: 20_000,
  });
  await addFirstPlainItem(page, skipProductName);
  await page.locator("header").getByRole("link", { name: /^cart \(1\)$/i }).click();
  await expect(page.getByRole("heading", { name: /your cart/i })).toBeVisible();
}

async function signIn(page: Page, phoneNumber: string): Promise<void> {
  await expect(page.getByRole("heading", { name: "Sign In" })).toBeVisible();
  await page.getByLabel("Mobile number", { exact: true }).fill(phoneNumber);
  await page.getByRole("button", { name: /send code/i }).click();
  const code = page.getByLabel("6-digit code", { exact: true });
  await expect(code).toBeVisible();
  await code.fill(FIXED_OTP_CODE!);
  await page.getByRole("button", { name: /verify code/i }).click();
  await expect(page.getByRole("heading", { name: "Checkout" })).toBeVisible({ timeout: 20_000 });
}

async function saveAddress(page: Page, phoneNumber: string): Promise<void> {
  const checkout = page.locator("#main-content");
  await checkout.getByRole("button", { name: "Add new address" }).click();
  await checkout.getByPlaceholder("Search area, street or nearby landmark").fill("Rajpur");
  await checkout.getByRole("option", { name: "Rajpur Road, Dehradun" }).click();
  await expect(page.getByTestId("delivery-location-map-confirmation")).toBeVisible({ timeout: 20_000 });
  await page.getByRole("button", { name: "Confirm location" }).click();
  await checkout.getByRole("textbox", { name: /Flat \/ House \/ Building/i }).fill("12 Mall Road");
  await checkout.getByRole("textbox", { name: /Recipient name/i }).fill("E2E Guest");
  await checkout.getByRole("textbox", { name: /Mobile number/i }).fill(`+91${phoneNumber}`);
  await checkout.getByRole("button", { name: "Save address" }).click();
}

async function reachReview(
  page: Page,
  phoneNumber: string,
  mode: "DELIVERY" | "PICKUP",
  skipProductName?: string,
): Promise<void> {
  await openCart(page, skipProductName);
  await continueCartToReview(page, phoneNumber, mode);
}

async function continueCartToReview(
  page: Page,
  phoneNumber: string,
  mode: "DELIVERY" | "PICKUP",
): Promise<void> {
  await page.getByRole("button", { name: /^checkout$/i }).click();
  await signIn(page, phoneNumber);
  const checkout = page.locator("#main-content");
  const choice = checkout.getByTestId(
    mode === "DELIVERY" ? "checkout-fulfilment-delivery" : "checkout-fulfilment-pickup",
  );
  await choice.click();
  await expect(choice).toHaveAttribute("aria-pressed", "true");
  if (mode === "DELIVERY") await saveAddress(page, phoneNumber);
  if (mode === "PICKUP") {
    const pickup = page.getByRole("region", { name: "Your pickup location" });
    await expect(pickup).toBeVisible({ timeout: 20_000 });
    await pickup.getByRole("button", { name: "Continue" }).click();
  }
  await expect(page.getByTestId("checkout-timing-choice")).toBeVisible({ timeout: 20_000 });
  await page.getByTestId("checkout-timing-asap").click();
  await expect(page.getByTestId("checkout-review")).toBeVisible({ timeout: 20_000 });
}

async function emptyCart(page: Page): Promise<void> {
  await page.goto("/order/cart/");
  await expect(page.getByRole("heading", { name: /your cart/i })).toBeVisible();
  const removeName = /^Remove .+ from cart$/i;
  for (let i = 0; i < 8; i += 1) {
    const remove = page.getByRole("button", { name: removeName });
    const before = await remove.count();
    if (before === 0) break;
    await remove.first().click();
    await expect
      .poll(async () => page.getByRole("button", { name: removeName }).count(), { timeout: 15_000 })
      .toBeLessThan(before);
  }
  await expect(page.getByText("Your cart is empty. Browse the menu to add something.")).toBeVisible({
    timeout: 20_000,
  });
}

/** Later checkout in a test that already signed in. A second OTP would exceed otp_send_ip_10m. */
async function checkoutAgain(
  page: Page,
  phoneNumber: string,
  mode: "DELIVERY" | "PICKUP",
  skipProductName?: string,
): Promise<void> {
  await emptyCart(page);
  await openCart(page, skipProductName);
  await page.getByRole("button", { name: /^checkout$/i }).click();
  const signInHeading = page.getByRole("heading", { name: "Sign In" });
  const delivery = page.locator("#main-content").getByTestId("checkout-fulfilment-delivery");
  const pickup = page.locator("#main-content").getByTestId("checkout-fulfilment-pickup");
  const review = page.getByTestId("checkout-review");
  await expect(signInHeading.or(delivery).or(pickup).or(review).first()).toBeVisible({
    timeout: 20_000,
  });
  if (await signInHeading.isVisible()) {
    throw new Error("follow-up checkout asked for sign-in; a second OTP is outside the IP limit");
  }
  if (await review.isVisible()) return;
  const choice = mode === "DELIVERY" ? delivery : pickup;
  await choice.click();
  await expect(choice).toHaveAttribute("aria-pressed", "true");
  if (mode === "DELIVERY") {
    const addAddress = page.locator("#main-content").getByRole("button", { name: "Add new address" });
    const timing = page.getByTestId("checkout-timing-choice");
    await expect(addAddress.or(timing).first()).toBeVisible({ timeout: 20_000 });
    if (await addAddress.isVisible()) {
      await saveAddress(page, phoneNumber);
    }
  }
  if (mode === "PICKUP") {
    const pickupRegion = page.getByRole("region", { name: "Your pickup location" });
    await expect(pickupRegion).toBeVisible({ timeout: 20_000 });
    await pickupRegion.getByRole("button", { name: "Continue" }).click();
  }
  await expect(page.getByTestId("checkout-timing-choice")).toBeVisible({ timeout: 20_000 });
  await page.getByTestId("checkout-timing-asap").click();
  await expect(page.getByTestId("checkout-review")).toBeVisible({ timeout: 20_000 });
}

function watchExplanation(page: Page): { read: () => Record<string, string> | null } {
  let latest: Record<string, string> | null = null;
  page.on("response", (response) => {
    if (!response.ok()) return;
    const url = response.url();
    if (!url.includes("/api/v1/cart/evaluate") && !url.includes("/api/v1/checkouts")) return;
    void response
      .json()
      .then((json: unknown) => {
        const found = findExplanation(json, 0);
        if (found) latest = found;
      })
      .catch(() => undefined);
  });
  return { read: () => latest };
}

function findExplanation(value: unknown, depth: number): Record<string, string> | null {
  if (!value || typeof value !== "object" || depth > 5) return null;
  const record = value as Record<string, unknown>;
  const explanation = record.commercialExplanation;
  if (explanation && typeof explanation === "object") {
    const raw = explanation as Record<string, unknown>;
    const order = raw.merchandiseOrOrderSavingPaise;
    const delivery = raw.deliverySavingPaise;
    const total = raw.totalSavedPaise;
    const payable = raw.grandTotalPaise;
    if (
      typeof order === "string" &&
      typeof delivery === "string" &&
      typeof total === "string" &&
      typeof payable === "string"
    ) {
      const complimentary = raw.complimentary;
      const gift =
        complimentary && typeof complimentary === "object"
          ? (complimentary as Record<string, unknown>)
          : null;
      return {
        order,
        delivery,
        total,
        payable,
        couponClass: typeof raw.couponPresentationClass === "string" ? raw.couponPresentationClass : "",
        competing: gift && typeof gift.competingOffers === "string" ? gift.competingOffers : "",
        variantId: gift && typeof gift.variantId === "string" ? gift.variantId : "",
        productId: gift && typeof gift.productId === "string" ? gift.productId : "",
        itemName: gift && typeof gift.itemName === "string" ? gift.itemName : "",
      };
    }
  }
  for (const child of Object.values(record)) {
    const found = findExplanation(child, depth + 1);
    if (found) return found;
  }
  return null;
}

async function componentAmount(page: Page, component: string): Promise<string | null> {
  const row = page.locator(`[data-offer-component="${component}"]:visible`);
  if ((await row.count()) === 0) return null;
  return row.first().getAttribute("data-offer-amount");
}

async function expectAmountEqualsQuote(
  page: Page,
  watched: { read: () => Record<string, string> | null },
  component: "ORDER_SAVING" | "DELIVERY_SAVING" | "TOTAL_SAVED",
  quoteKey: "order" | "delivery" | "total",
): Promise<string> {
  await expect.poll(() => watched.read()?.[quoteKey] ?? "", { timeout: 20_000 }).not.toBe("");
  const quote = watched.read()?.[quoteKey];
  if (!quote) throw new Error(`missing quote ${quoteKey}`);
  await expect.poll(async () => componentAmount(page, component)).toBe(quote);
  return quote;
}

test("automatic saving matches the quote and the cart stays an estimate", async ({ page }, testInfo) => {
  await arm(page, "keep");
  const watched = watchExplanation(page);
  await openCart(page);
  const offer = cartCouponScope(page);
  await expect(offer.getByText(IMP036J_COPY.APPLIED_AUTO)).toBeVisible({ timeout: 20_000 });
  const order = await expectAmountEqualsQuote(page, watched, "ORDER_SAVING", "order");
  expect(order).toBe("8000");
  const deliveryQuote = watched.read()?.delivery ?? "";
  if (deliveryQuote !== "" && deliveryQuote !== "0") {
    expect(await componentAmount(page, "DELIVERY_SAVING")).toBe(deliveryQuote);
  } else {
    expect(await componentAmount(page, "DELIVERY_SAVING")).toBeNull();
  }
  await expect(page.locator('[data-offer-component="DELIVERY_SAVING"]:visible')).toHaveCount(
    deliveryQuote !== "" && deliveryQuote !== "0" ? 1 : 0,
  );
  await expect(offer.getByText(IMP036J_COPY.ESTIMATED_SUBTOTAL)).toBeVisible();
  await expect(offer.getByText(IMP036J_COPY.TOTAL_PAYABLE)).toHaveCount(0);
  await expect(page.getByText(/promotion candidate/i)).toHaveCount(0);
  await expect(page.locator("s, del, [class*='line-through']")).toHaveCount(0);
  await shot(page, testInfo, "ac-001-01-cart");
});

test("mobile: automatic saving and estimated subtotal stay visible", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "mobile-chromium", "Mobile viewport evidence only");
  expect(page.viewportSize()?.width).toBeLessThanOrEqual(430);
  await arm(page, "keep");
  const watched = watchExplanation(page);
  await openCart(page);
  const order = await expectAmountEqualsQuote(page, watched, "ORDER_SAVING", "order");
  expect(order).toBe("8000");
  const sticky = page.getByTestId("cart-mobile-checkout");
  await expect(sticky.getByText(IMP036J_COPY.ESTIMATED_SUBTOTAL)).toBeInViewport();
  await expect(sticky.getByTestId("cart-sticky-amount")).toBeInViewport();
  await expect(sticky.getByText(IMP036J_COPY.TOTAL_PAYABLE)).toHaveCount(0);
  await expect(page.getByText(IMP036J_COPY.TOTAL_PAYABLE)).toHaveCount(0);
  await shot(page, testInfo, "xr-010-mobile-cart");
});

test("closed-window offer is absent and an open threshold can cross and drop", async ({ page }, testInfo) => {
  await arm(page, "closed");
  await openCart(page);
  await expect(page.getByText("Closed window tea")).toHaveCount(0);
  await expect(page.getByText(/sorry/i)).toHaveCount(0);
  await expect(page.locator("s, del, [class*='line-through']")).toHaveCount(0);
  expect(await componentAmount(page, "ORDER_SAVING")).toBeNull();
  await expect(page.locator('[data-offer-component="PROGRESS"]')).toHaveCount(0);
  await shot(page, testInfo, "ac-001-02-closed");

  await arm(page, "below");
  await page.goto("/order/cart/");
  await expect(page.getByRole("heading", { name: /your cart/i })).toBeVisible();
  const offer = cartCouponScope(page);
  await expect(offer.locator('[data-offer-component="PROGRESS"]')).toBeVisible({ timeout: 20_000 });
  expect(await componentAmount(page, "ORDER_SAVING")).toBeNull();
  await expect(offer.getByText(IMP036J_COPY.DROPPED)).toHaveCount(0);
  await shot(page, testInfo, "xr-003-progress");

  await page.getByRole("button", { name: /^Increase / }).first().click();
  await expect(offer.locator('[data-offer-component="ORDER_SAVING"]')).toBeVisible({ timeout: 20_000 });
  await expect(offer.locator('[data-offer-component="PROGRESS"]')).toHaveCount(0);
  await expect(offer.getByText(IMP036J_COPY.APPLIED_AUTO)).toBeVisible();
  expect(await componentAmount(page, "ORDER_SAVING")).toBe("1000");

  await page.getByRole("button", { name: /^Decrease / }).first().click();
  await expect(offer.getByTestId("copy-dropped")).toHaveText(IMP036J_COPY.DROPPED, { timeout: 20_000 });
  await expect(offer.locator('[data-offer-component="ORDER_SAVING"]')).toHaveCount(0);
  await expect(offer.locator('[data-offer-component="PROGRESS"]')).toBeVisible();
  await shot(page, testInfo, "ac-003-02-dropped");
});

test("review breakdown, compatible stack, and the weaker exclusive coupon stay unselected", async ({
  page,
}, testInfo) => {
  const coupons = await arm(page, "keep");
  const keep = coupons.c90;
  if (!keep) throw new Error("keep coupon was not seeded");
  const watched = watchExplanation(page);
  const phone = nextPhone();
  await reachReview(page, phone, "DELIVERY");
  const review = page.getByTestId("checkout-review");
  const order = await expectAmountEqualsQuote(page, watched, "ORDER_SAVING", "order");
  const delivery = await expectAmountEqualsQuote(page, watched, "DELIVERY_SAVING", "delivery");
  const total = await expectAmountEqualsQuote(page, watched, "TOTAL_SAVED", "total");
  expect(order).toBe("8000");
  expect(delivery).toBe("4000");
  expect(total).toBe("12000");
  expect(BigInt(order) + BigInt(delivery)).toBe(BigInt(total));
  await expect(review.locator('[data-offer-component="ORDER_SAVING"]')).toHaveCount(1);
  await expect(review.locator('[data-offer-component="DELIVERY_SAVING"]')).toHaveCount(1);
  const payableBefore = await review.getByTestId("price-summary-total").getAttribute("data-offer-amount");
  expect(payableBefore).toBe(watched.read()?.payable ?? "");
  await shot(page, testInfo, "ac-004-01-breakdown");

  await review.getByTestId("coupon-input").fill(keep);
  await review.getByTestId("coupon-apply").click();
  await expect(review.getByTestId("coupon-result")).toContainText(IMP036J_COPY.STRICT_KEEP, {
    timeout: 20_000,
  });
  await expect(review.getByTestId("coupon-result")).not.toContainText(/better price/i);
  expect(await componentAmount(page, "ORDER_SAVING")).toBe("8000");
  expect(await componentAmount(page, "DELIVERY_SAVING")).toBe("4000");
  expect(await review.getByTestId("price-summary-total").getAttribute("data-offer-amount")).toBe(
    payableBefore,
  );
  await shot(page, testInfo, "ac-009-01-strict-keep");
});

test("coupon pair beats the exclusive offer and shows both real savings", async ({ page }, testInfo) => {
  const coupons = await arm(page, "win");
  const win = coupons.c90b;
  if (!win) throw new Error("win coupon was not seeded");
  const phone = nextPhone();
  await reachReview(page, phone, "DELIVERY");
  const review = page.getByTestId("checkout-review");
  expect(await componentAmount(page, "ORDER_SAVING")).toBe("10000");
  await review.getByTestId("coupon-input").fill(win);
  await review.getByTestId("coupon-apply").click();
  await expect(review.getByTestId("coupon-result")).toContainText(IMP036J_COPY.APPLIED_COUPON, {
    timeout: 20_000,
  });
  expect(await componentAmount(page, "ORDER_SAVING")).toBe("9000");
  expect(await componentAmount(page, "DELIVERY_SAVING")).toBe("2000");
  expect(await componentAmount(page, "TOTAL_SAVED")).toBe("11000");
  await expect(review.locator('[data-offer-component="ORDER_SAVING"]')).toHaveCount(1);
  await expect(review.locator('[data-offer-component="DELIVERY_SAVING"]')).toHaveCount(1);
  await shot(page, testInfo, "ac-009-02-coupon-wins");
});

test("mode eligibility uses the allowed-mode sentence and does not show the other saving", async ({
  page,
}, testInfo) => {
  test.setTimeout(360_000);
  const coupons = await arm(page, "modes");
  const phone = nextPhone();
  await reachReview(page, phone, "PICKUP");
  const review = page.getByTestId("checkout-review");
  await expect(review.getByText("Delivery only offer")).toHaveCount(0);
  expect(await componentAmount(page, "DELIVERY_SAVING")).toBeNull();
  expect(await componentAmount(page, "ORDER_SAVING")).toBe("1200");
  await expect(review.getByText(IMP036J_COPY.APPLIED_AUTO).first()).toBeVisible({ timeout: 20_000 });
  await review.getByTestId("coupon-input").fill(coupons.cdel ?? "");
  await review.getByTestId("coupon-apply").click();
  await expect(review.getByTestId("coupon-result")).toContainText(IMP036J_COPY.INAPPLICABLE_DELIVERY, {
    timeout: 20_000,
  });
  await expect(review.getByTestId("coupon-result")).not.toContainText(IMP036J_COPY.INVALID);
  await shot(page, testInfo, "ac-006-01-pickup");

  await page.context().clearCookies();
  await page.evaluate(() => {
    window.localStorage.clear();
    window.sessionStorage.clear();
  });
  await reachReview(page, nextPhone(), "DELIVERY");
  const delivery = page.getByTestId("checkout-review");
  await expect(delivery.getByText("Pickup only offer")).toHaveCount(0);
  await expect(delivery.getByText(IMP036J_COPY.APPLIED_AUTO).first()).toBeVisible({ timeout: 20_000 });
  expect(await componentAmount(page, "ORDER_SAVING")).toBe("1500");
  expect(await componentAmount(page, "DELIVERY_SAVING")).toBeNull();
  await delivery.getByTestId("coupon-input").fill(coupons.cpick ?? "");
  await delivery.getByTestId("coupon-apply").click();
  await expect(delivery.getByTestId("coupon-result")).toContainText(IMP036J_COPY.INAPPLICABLE_PICKUP, {
    timeout: 20_000,
  });
  await expect(delivery.getByTestId("coupon-result")).not.toContainText(IMP036J_COPY.INVALID);
  await expect(delivery.locator('[data-offer-component="DELIVERY_SAVING"]')).toHaveCount(0);
  await shot(page, testInfo, "ac-006-01-delivery");
});

test("invalid, expired, and inapplicable coupon sentences stay distinct", async ({ page }, testInfo) => {
  const expired = await arm(page, "failures");
  const phone = nextPhone();
  await reachReview(page, phone, "DELIVERY");
  const review = page.getByTestId("checkout-review");
  const before = await review.getByTestId("price-summary-total").getAttribute("data-offer-amount");
  const input = review.getByTestId("coupon-input");
  await input.fill("NOT-A-CODE");
  const couponResponse = page.waitForResponse(
    (response) =>
      response.url().includes("/api/v1/cart/coupon") && response.request().method() === "POST",
  );
  await review.getByTestId("coupon-apply").click();
  const couponBody = await (await couponResponse).text();
  expect(couponBody.toLowerCase()).not.toMatch(/did you mean|near match|suggested code|similar code/);
  expect(couponBody).not.toMatch(/maximumRedemptions|customerId|customer_id|\+91|@[a-z0-9.-]+\./i);
  const invalid = review.getByTestId("coupon-result");
  await expect(invalid).toHaveText(IMP036J_COPY.INVALID, { timeout: 20_000 });
  await expect(invalid).not.toContainText(/near|similar|did you mean/i);
  await expect(input).toBeFocused();
  expect(await review.getByTestId("price-summary-total").getAttribute("data-offer-amount")).toBe(before);
  await expect(review.getByText(IMP036J_COPY.APPLIED_COUPON)).toHaveCount(0);

  await input.fill(expired.expired ?? "");
  await review.getByTestId("coupon-apply").click();
  await expect(invalid).toHaveText(IMP036J_COPY.EXPIRED, { timeout: 20_000 });
  await expect(invalid).not.toHaveText(IMP036J_COPY.INVALID);

  const modes = await arm(page, "modes");
  await input.fill(modes.cpick ?? "");
  const change = review.getByTestId("coupon-change");
  if ((await change.count()) > 0) await change.click();
  else await review.getByTestId("coupon-apply").click();
  await expect(invalid).toContainText(IMP036J_COPY.INAPPLICABLE_PICKUP, { timeout: 20_000 });
  await expect(invalid).not.toContainText(/\d+ (customers|redemptions|left)/i);
  await shot(page, testInfo, "ac-007-01-distinct-reasons");
});

test("cart and review share one code, replace drops the previous code, and a dropped request does not invent a saving", async ({
  page,
}, testInfo) => {
  const coupons = await arm(page, "basic");
  const basic = coupons.basic;
  const swap = coupons.swap;
  if (!basic || !swap) throw new Error("basic coupons were not seeded");
  const phone = nextPhone();
  await openCart(page);
  const cartOffer = cartCouponScope(page);
  const cartInput = cartOffer.getByTestId("coupon-input");
  await cartInput.fill(basic);
  await cartOffer.getByTestId("coupon-apply").click();
  await expect(cartOffer.getByTestId("coupon-result")).toContainText(IMP036J_COPY.APPLIED_COUPON, {
    timeout: 20_000,
  });
  expect(await componentAmount(page, "ORDER_SAVING")).toBe("1000");
  await page.getByRole("button", { name: /^checkout$/i }).click();
  await signIn(page, phone);
  await page.locator("#main-content").getByTestId("checkout-fulfilment-pickup").click();
  const pickup = page.getByRole("region", { name: "Your pickup location" });
  await expect(pickup).toBeVisible({ timeout: 20_000 });
  await pickup.getByRole("button", { name: "Continue" }).click();
  await page.getByTestId("checkout-timing-asap").click();
  const review = page.getByTestId("checkout-review");
  await expect(review).toBeVisible({ timeout: 20_000 });
  await expect(review.getByTestId("coupon-input")).toHaveValue(basic);
  expect(await componentAmount(page, "ORDER_SAVING")).toBe("1000");

  await review.getByTestId("coupon-input").fill(swap);
  await review.getByTestId("coupon-change").click();
  await expect(review.getByTestId("coupon-result")).toContainText(IMP036J_COPY.APPLIED_COUPON, {
    timeout: 20_000,
  });
  await expect(review.getByTestId("coupon-input")).toHaveValue(swap);
  expect(await componentAmount(page, "ORDER_SAVING")).toBe("2000");
  await expect(review.getByText(basic, { exact: true })).toHaveCount(0);

  const payable = await review.getByTestId("price-summary-total").getAttribute("data-offer-amount");
  await page.route("**/api/v1/cart/coupon", async (route) => {
    const pathname = new URL(route.request().url()).pathname;
    if (pathname.endsWith("/api/v1/cart/coupon")) await route.abort();
    else await route.continue();
  });
  await review.getByTestId("coupon-input").fill(basic);
  await review.getByTestId("coupon-change").click();
  await expect(review.getByTestId("coupon-result")).toContainText(IMP036J_COPY.RETRY, { timeout: 20_000 });
  await expect(review.getByTestId("coupon-change")).toBeFocused();
  await expect(review.getByTestId("coupon-input")).not.toBeFocused();
  await expect(review.getByTestId("coupon-input")).toHaveValue(basic);
  await expect(review.getByTestId("coupon-result")).not.toBeFocused();
  await page.keyboard.press("Tab");
  await expect(review.getByTestId("coupon-remove")).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(review.getByTestId("coupon-retry")).toBeFocused();
  expect(await componentAmount(page, "ORDER_SAVING")).toBe("2000");
  expect(await review.getByTestId("price-summary-total").getAttribute("data-offer-amount")).toBe(payable);
  await expect(review.getByText(IMP036J_COPY.APPLIED_COUPON)).toHaveCount(1);
  await page.unroute("**/api/v1/cart/coupon");

  await review.getByTestId("coupon-input").fill(swap);
  await page.route("**/api/v1/cart/coupon/remove", (route) => route.abort());
  await review.getByTestId("coupon-remove").click();
  await expect(review.getByTestId("coupon-result")).toContainText(IMP036J_COPY.RETRY, { timeout: 20_000 });
  await expect(review.getByTestId("coupon-remove")).toBeFocused();
  await expect(review.getByTestId("coupon-input")).not.toBeFocused();
  await expect(review.getByTestId("coupon-input")).toHaveValue(swap);
  await expect(review.getByTestId("coupon-result")).not.toBeFocused();
  await page.keyboard.press("Tab");
  await expect(review.getByTestId("coupon-retry")).toBeFocused();
  expect(await componentAmount(page, "ORDER_SAVING")).toBe("2000");
  expect(await review.getByTestId("price-summary-total").getAttribute("data-offer-amount")).toBe(payable);
  await expect(review.getByText(IMP036J_COPY.APPLIED_COUPON)).toHaveCount(1);
  await shot(page, testInfo, "ac-002-10-retry");
  await page.unroute("**/api/v1/cart/coupon/remove");
  await review.getByTestId("coupon-remove").click();
  await expect(review.getByTestId("coupon-apply")).toBeVisible({ timeout: 20_000 });
  expect(await componentAmount(page, "ORDER_SAVING")).toBeNull();
});

test("guest identity coupon asks for sign-in and the same code is retried after auth", async ({
  page,
}, testInfo) => {
  const coupons = await arm(page, "identity");
  const code = coupons.identity;
  if (!code) throw new Error("identity coupon was not seeded");
  await openCart(page);
  const cartOffer = cartCouponScope(page);
  await cartOffer.getByTestId("coupon-input").fill(code);
  await cartOffer.getByTestId("coupon-apply").click();
  await expect(cartOffer.getByTestId("coupon-result")).toHaveText(IMP036J_COPY.SIGN_IN, {
    timeout: 20_000,
  });
  await expect(cartOffer.getByTestId("coupon-sign-in")).toBeVisible();
  await expect(page.getByText(IMP036J_COPY.APPLIED_COUPON)).toHaveCount(0);
  const phone = nextPhone();
  await page.getByRole("button", { name: /^checkout$/i }).click();
  await signIn(page, phone);
  await page.locator("#main-content").getByTestId("checkout-fulfilment-pickup").click();
  const pickup = page.getByRole("region", { name: "Your pickup location" });
  await expect(pickup).toBeVisible({ timeout: 20_000 });
  await pickup.getByRole("button", { name: "Continue" }).click();
  const evaluated = page.waitForResponse(
    (response) =>
      response.ok() &&
      response.url().includes("/api/v1/checkouts/") &&
      response.url().includes("/evaluate"),
  );
  await page.getByTestId("checkout-timing-asap").click();
  const review = page.getByTestId("checkout-review");
  await expect(review).toBeVisible({ timeout: 20_000 });
  const payload = JSON.stringify(await (await evaluated).json());
  expect(payload).toContain(code);
  expect(payload).not.toContain("another customer");
  await expect(review.getByTestId("coupon-input")).toHaveValue(code);
  const result = review.getByTestId("coupon-result");
  await expect(result).toContainText(IMP036J_COPY.APPLIED_COUPON, { timeout: 20_000 });
  await expect(result).toHaveAttribute("role", "status");
  await expect(result).toHaveAttribute("aria-live", "polite");
  await expect(result).toBeFocused();
  await expect(review.getByTestId("coupon-input")).not.toBeFocused();
  await shot(page, testInfo, "ac-002-04-identity-retry");
});

test("global coupon cap stays open under the limit and closes with the exhausted sentence", async ({
  page,
}, testInfo) => {
  const phone = nextPhone();
  await reachReview(page, phone, "PICKUP");
  const coupons = await arm(page, "cap-global");
  const code = coupons.global;
  if (!code) throw new Error("global cap coupon was not seeded");
  const review = page.getByTestId("checkout-review");
  await review.getByTestId("coupon-input").fill(code);
  await review.getByTestId("coupon-apply").click();
  await expect(review.getByTestId("coupon-result")).toHaveText(IMP036J_COPY.APPLIED_COUPON, {
    timeout: 20_000,
  });
  expect(await componentAmount(page, "ORDER_SAVING")).toBe("1000");
  await expect(review.getByTestId("coupon-result")).not.toHaveText(IMP036J_COPY.GLOBAL_CAP);

  const seeded = await control(page, { action: "seed-cap-claim", couponCode: code, phone });
  expect(seeded.beforeGlobalUnits).toBe("0");
  expect(seeded.reservedUnits).toBe("1");
  expect(seeded.consumedUnits).toBe("1");
  expect(seeded.releasedUnits).toBe("1");
  expect(seeded.globalUnits).toBe("2");
  expect(seeded.countedUnits).toBe("2");
  expect(seeded.releasedExcluded).toBe(true);
  expect(seeded.personalUnits).toBe("2");

  await review.getByTestId("coupon-remove").click();
  await expect(review.getByTestId("coupon-apply")).toBeVisible({ timeout: 20_000 });
  await expect.poll(async () => componentAmount(page, "ORDER_SAVING")).toBeNull();
  const payable = await review.getByTestId("price-summary-total").getAttribute("data-offer-amount");
  await review.getByTestId("coupon-input").fill(code);
  await review.getByTestId("coupon-apply").click();
  const result = review.getByTestId("coupon-result");
  await expect(result).toHaveText(IMP036J_COPY.GLOBAL_CAP, { timeout: 20_000 });
  await expect(result).not.toHaveText(IMP036J_COPY.PERSONAL_CAP);
  await expect(result).not.toHaveText(IMP036J_COPY.INVALID);
  await expect(result).not.toHaveText(IMP036J_COPY.EXPIRED);
  await expect(result).not.toContainText(/\d+\s*(redemptions?|customers?|left|uses|remaining)/i);
  await expect(review.getByTestId("coupon-input")).toBeFocused();
  expect(await componentAmount(page, "ORDER_SAVING")).toBeNull();
  expect(await review.getByTestId("price-summary-total").getAttribute("data-offer-amount")).toBe(payable);
  await shot(page, testInfo, "ac-007-01-global-cap");
});

test("personal coupon cap uses the customer's own sentence and hides the count", async ({
  page,
}, testInfo) => {
  const phone = nextPhone();
  await reachReview(page, phone, "PICKUP");
  const coupons = await arm(page, "cap-personal");
  const code = coupons.personal;
  if (!code) throw new Error("personal cap coupon was not seeded");
  const review = page.getByTestId("checkout-review");
  await review.getByTestId("coupon-input").fill(code);
  await review.getByTestId("coupon-apply").click();
  await expect(review.getByTestId("coupon-result")).toHaveText(IMP036J_COPY.APPLIED_COUPON, {
    timeout: 20_000,
  });
  expect(await componentAmount(page, "ORDER_SAVING")).toBe("1000");

  const seeded = await control(page, { action: "seed-cap-claim", couponCode: code, phone });
  expect(seeded.beforePersonalUnits).toBe("0");
  expect(seeded.personalUnits).toBe("2");
  expect(seeded.globalUnits).toBe("2");
  expect(seeded.releasedExcluded).toBe(true);

  await review.getByTestId("coupon-remove").click();
  await expect(review.getByTestId("coupon-apply")).toBeVisible({ timeout: 20_000 });
  await expect.poll(async () => componentAmount(page, "ORDER_SAVING")).toBeNull();
  const payable = await review.getByTestId("price-summary-total").getAttribute("data-offer-amount");
  await review.getByTestId("coupon-input").fill(code);
  await review.getByTestId("coupon-apply").click();
  const result = review.getByTestId("coupon-result");
  await expect(result).toHaveText(IMP036J_COPY.PERSONAL_CAP, { timeout: 20_000 });
  await expect(result).not.toHaveText(IMP036J_COPY.GLOBAL_CAP);
  await expect(result).not.toHaveText(IMP036J_COPY.INVALID);
  await expect(result).not.toContainText(/\d+\s*(redemptions?|customers?|left|uses|remaining)/i);
  await expect(review.getByTestId("coupon-input")).toBeFocused();
  expect(await componentAmount(page, "ORDER_SAVING")).toBeNull();
  expect(await review.getByTestId("price-summary-total").getAttribute("data-offer-amount")).toBe(payable);
  await shot(page, testInfo, "ac-007-01-personal-cap");
});

test("guest unrestricted coupon keeps a better total and can tie without sign-in", async ({
  page,
}, testInfo) => {
  test.setTimeout(240_000);
  const keep = await arm(page, "guest-keep");
  await openCart(page);
  const cart = cartCouponScope(page);
  const payable = await cart.getByTestId("price-summary-total").getAttribute("data-offer-amount");
  await cart.getByTestId("coupon-input").fill(keep.gkeep ?? "");
  await cart.getByTestId("coupon-apply").click();
  const kept = cart.getByTestId("coupon-result");
  await expect(kept).toHaveText(IMP036J_COPY.STRICT_KEEP, { timeout: 20_000 });
  await expect(kept).not.toContainText(/better price|sign in/i);
  expect(await componentAmount(page, "ORDER_SAVING")).toBe("8000");
  expect(await cart.getByTestId("price-summary-total").getAttribute("data-offer-amount")).toBe(payable);
  await shot(page, testInfo, "ac-002-05-strict-keep");

  const equalKept = await arm(page, "equal-kept");
  const keptCart = await replaceGuestCoupon(page, equalKept.eqkeep ?? "");
  await expect(keptCart.getByTestId("coupon-result")).toHaveText(IMP036J_COPY.EQUAL_KEPT, {
    timeout: 20_000,
  });
  await expect(keptCart.getByTestId("coupon-result")).not.toContainText(/better price|sign in/i);
  expect(await componentAmount(page, "ORDER_SAVING")).toBe("1000");
  await shot(page, testInfo, "xr-005-equal-kept");

  const equalSelected = await arm(page, "equal-selected");
  const selectedCart = await replaceGuestCoupon(page, equalSelected.eqsel ?? "");
  await expect(selectedCart.getByTestId("coupon-result")).toHaveText(IMP036J_COPY.EQUAL_SELECTED, {
    timeout: 20_000,
  });
  await expect(selectedCart.getByTestId("coupon-result")).not.toContainText(/better price|sign in/i);
  expect(await componentAmount(page, "ORDER_SAVING")).toBe("1000");
  await shot(page, testInfo, "xr-005-equal-selected");

  const identity = await arm(page, "identity");
  const identityCart = await replaceGuestCoupon(page, identity.identity ?? "");
  await expect(identityCart.getByTestId("coupon-result")).toHaveText(IMP036J_COPY.SIGN_IN, {
    timeout: 20_000,
  });
  await expect(identityCart.getByText(IMP036J_COPY.APPLIED_COUPON)).toHaveCount(0);
});

test("automatic complimentary item is the seeded variant at zero merchandise", async ({
  page,
}, testInfo) => {
  test.setTimeout(540_000);
  await installRazorpayCheckoutMock(page, "succeed");
  const armed = await control(page, { action: "arm-m2", scenario: "gift" });
  const variantId = String(armed.giftVariantId ?? "");
  const productId = String(armed.giftProductId ?? "");
  const productName = String(armed.giftProductName ?? "");
  const variantName = String(armed.giftVariantName ?? "");
  expect(variantId).toMatch(/^[0-9a-f-]{36}$/i);
  expect(productId).toMatch(/^[0-9a-f-]{36}$/i);
  expect(productName.length).toBeGreaterThan(0);
  expect(variantName.length).toBeGreaterThan(0);
  const watched = watchExplanation(page);
  await openCart(page, productName);
  const line = cartCouponScope(page).getByTestId("complimentary-line");
  await expect(line).toBeVisible({ timeout: 20_000 });
  await expect.poll(() => watched.read()?.variantId ?? "").toBe(variantId);
  expect(watched.read()?.productId).toBe(productId);
  expect(watched.read()?.competing).toBe("NONE");
  const shownName = watched.read()?.itemName ?? "";
  expect([variantName, productName]).toContain(shownName);
  await expect(line).toHaveAttribute("data-complimentary-name", shownName);
  await expect(line).toContainText(`1 × ${shownName}`);
  await expect(line).toContainText(IMP036J_COPY.INCLUDED);
  await expect(line).toHaveAttribute("data-complimentary-amount", "₹0.00");
  await expect(line.getByRole("button")).toHaveCount(0);
  await expect(line.getByRole("combobox")).toHaveCount(0);
  await expect(page.getByText(/choose a gift|pick a gift|gift picker/i)).toHaveCount(0);
  expect(await componentAmount(page, "ORDER_SAVING")).toBeNull();
  await shot(page, testInfo, "ac-013-01-included");

  const phone = nextPhone();
  await continueCartToReview(page, phone, "PICKUP");
  const review = page.getByTestId("checkout-review");
  const reviewLine = review.getByTestId("complimentary-line");
  await expect(reviewLine).toBeVisible({ timeout: 20_000 });
  await expect(reviewLine).toContainText(`1 × ${productName}`);
  await expect(reviewLine).toHaveAttribute("data-complimentary-name", productName);
  await expect(reviewLine).toContainText(IMP036J_COPY.INCLUDED);
  await expect(reviewLine).toHaveAttribute("data-complimentary-amount", "₹0.00");
  await expect(reviewLine.getByRole("button")).toHaveCount(0);
  await expect(review.getByText(/better price/i)).toHaveCount(0);
  await expect.poll(() => watched.read()?.variantId ?? "").toBe(variantId);
  await shot(page, testInfo, "xr-013-included-review");

  const marked = await control(page, { action: "mark-gift-unavailable", variantId });
  expect(marked.ok).toBe(true);
  await review.getByTestId("checkout-back-to-delivery").click();
  const pickup = page.locator("#main-content").getByTestId("checkout-fulfilment-pickup");
  await expect(pickup).toBeVisible({ timeout: 20_000 });
  await pickup.click();
  await page.getByRole("region", { name: "Your pickup location" }).getByRole("button", { name: "Continue" }).click();
  await page.getByTestId("checkout-timing-asap").click();
  await expect(review).toBeVisible({ timeout: 20_000 });
  await expect(review.getByTestId("copy-gift-gone")).toHaveText(IMP036J_COPY.GIFT_GONE, { timeout: 20_000 });
  await expect(review.getByTestId("complimentary-line")).toHaveCount(0);
  await expect(review.getByRole("button", { name: /Continue to payment/i })).toBeVisible();
  await expect(page.getByTestId("payment-panel")).toHaveCount(0);
  await shot(page, testInfo, "ac-013-03-gift-gone");

  await arm(page, "returning");
  await checkoutAgain(page, phone, "PICKUP");
  const firstReview = page.getByTestId("checkout-review");
  await expect(firstReview.getByText("First order tea")).toHaveCount(0);
  expect(await componentAmount(page, "ORDER_SAVING")).toBe("1500");
  expect(await componentAmount(page, "DELIVERY_SAVING")).toBeNull();
  await payFromReview(page);
  await checkoutAgain(page, phone, "PICKUP");
  const second = page.getByTestId("checkout-review");
  await expect(second.getByText("First order tea")).toHaveCount(0);
  expect(await componentAmount(page, "ORDER_SAVING")).toBeNull();
  expect(await componentAmount(page, "DELIVERY_SAVING")).toBeNull();
  await expect(
    second.getByText(/already ordered|order history|returning customer|not your first/i),
  ).toHaveCount(0);
  await shot(page, testInfo, "xr-012-first-order-absent");

  await arm(page, "standing-zero");
  await checkoutAgain(page, phone, "DELIVERY");
  const zeroReview = page.getByTestId("checkout-review");
  expect(await componentAmount(page, "ORDER_SAVING")).toBe("8000");
  expect(await componentAmount(page, "DELIVERY_SAVING")).toBeNull();
  const charge = zeroReview.locator('[data-offer-component="DELIVERY_CHARGE"]');
  await expect(charge).toHaveAttribute("data-offer-amount", "0");
  await expect(charge).toContainText("₹0.00");
  expect(await componentAmount(page, "TOTAL_SAVED")).toBe("8000");
  await expect(zeroReview.getByText(/better price/i)).toHaveCount(0);
  await shot(page, testInfo, "ac-004-01-standing-zero");

  const giftDelivery = await control(page, { action: "arm-m2", scenario: "gift-delivery" });
  const giftDeliveryName = String(giftDelivery.giftProductName ?? "");
  expect(giftDeliveryName.length).toBeGreaterThan(0);
  await checkoutAgain(page, phone, "DELIVERY", giftDeliveryName);
  const giftReview = page.getByTestId("checkout-review");
  const giftLine = giftReview.getByTestId("complimentary-line");
  await expect(giftLine).toBeVisible({ timeout: 20_000 });
  await expect(giftLine).toContainText(IMP036J_COPY.INCLUDED);
  await expect(giftLine).toHaveAttribute("data-complimentary-amount", "₹0.00");
  await expect(giftLine.getByRole("button")).toHaveCount(0);
  await expect(giftLine.getByRole("combobox")).toHaveCount(0);
  expect(await componentAmount(page, "DELIVERY_SAVING")).toBe("4000");
  expect(await componentAmount(page, "ORDER_SAVING")).toBeNull();
  await expect(giftReview.getByText(/better price/i)).toHaveCount(0);
  expect(watched.read()?.competing).toBe("NONE");
  await shot(page, testInfo, "xr-006-gift-delivery");

  await arm(page, "keep");
  await checkoutAgain(page, phone, "DELIVERY");
  expect(await componentAmount(page, "ORDER_SAVING")).toBe("8000");
  expect(await componentAmount(page, "DELIVERY_SAVING")).toBe("4000");
  expect(watched.read()?.total).toBe("12000");
  await payFromReview(page);
  const confirmation = page.getByTestId("order-confirmation");
  await expect(confirmation.getByText("Order saving", { exact: true })).toBeVisible();
  await expect(confirmation.getByText("Delivery saving", { exact: true })).toBeVisible();
  await expect(confirmation.getByText("₹80.00").first()).toBeVisible();
  await expect(confirmation.getByText("₹40.00").first()).toBeVisible();
  await expect(confirmation.locator("[data-offer-component='PROGRESS']")).toHaveCount(0);
  await expect(confirmation.getByText(/more to unlock/i)).toHaveCount(0);
  await shot(page, testInfo, "xr-008-confirmation-split");
  await confirmation.getByRole("link", { name: /View order/i }).click();
  const detail = page.getByTestId("order-detail");
  await expect(detail).toBeVisible({ timeout: 20_000 });
  await expect(detail.getByText("Order saving", { exact: true })).toBeVisible();
  await expect(detail.getByText("Delivery saving", { exact: true })).toBeVisible();
  await expect(detail.locator("[data-offer-component='PROGRESS']")).toHaveCount(0);
  await expect(detail.getByText(/more to unlock/i)).toHaveCount(0);
  await shot(page, testInfo, "xr-008-detail-split");
});

test("a previously shown complimentary line becomes a conflict from the evaluator outcome", async ({
  page,
}, testInfo) => {
  const evaluated = await control(page, { action: "evaluate-competing-complimentary" });
  expect(evaluated.persisted).toBe(false);
  expect(evaluated.evaluator).toBe("evaluatePromotions");
  expect(evaluated.syntheticDefinitionCount).toBe(2);
  expect(evaluated.complimentaryCompetingNoneChosen).toBe(true);
  expect(evaluated.selectedPromotionIds).toEqual([]);
  expect(evaluated.complimentary).toEqual({ competingOffers: "NONE_CHOSEN" });
  const armed = await control(page, { action: "arm-m2", scenario: "gift" });
  const productName = String(armed.giftProductName ?? "");
  const variantId = String(armed.giftVariantId ?? "");
  expect(productName.length).toBeGreaterThan(0);
  expect(variantId).toMatch(/^[0-9a-f-]{36}$/i);
  const watched = watchExplanation(page);
  await openCart(page, productName);
  const offer = cartCouponScope(page);
  const line = offer.getByTestId("complimentary-line");
  await expect(line).toBeVisible({ timeout: 20_000 });
  await expect.poll(() => watched.read()?.variantId ?? "").toBe(variantId);
  await page.route("**/api/v1/cart/evaluate", async (route) => {
    await fulfillProjectedComplimentary(route, evaluated.complimentary);
  });
  await page.getByRole("button", { name: /^Increase / }).first().click();
  await expect(offer.getByTestId("copy-gift-conflict")).toHaveText(IMP036J_COPY.GIFT_CONFLICT, {
    timeout: 20_000,
  });
  await expect(offer.getByTestId("complimentary-line")).toHaveCount(0);
  await expect(offer.getByRole("combobox")).toHaveCount(0);
  await expect(page.getByText(/choose a gift|pick a gift/i)).toHaveCount(0);
  const variantIds = evaluated.variantIds;
  expect(Array.isArray(variantIds)).toBe(true);
  for (const syntheticId of variantIds as unknown[]) {
    await expect(page.getByText(String(syntheticId))).toHaveCount(0);
  }
  await shot(page, testInfo, "ac-013-04-conflict");
  await page.unrouteAll({ behavior: "ignoreErrors" });
});

test("competing complimentary definitions show neither gift when none was shown", async ({ page }) => {
  const evaluated = await control(page, { action: "evaluate-competing-complimentary" });
  expect(evaluated.complimentary).toEqual({ competingOffers: "NONE_CHOSEN" });
  await page.route("**/api/v1/cart/evaluate", async (route) => {
    await fulfillProjectedComplimentary(route, evaluated.complimentary);
  });
  await openCart(page);
  const offer = cartCouponScope(page);
  await expect(offer.getByTestId("complimentary-line")).toHaveCount(0);
  await expect(offer.getByTestId("copy-gift-conflict")).toHaveCount(0);
  await expect(page.getByText(/choose a gift|pick a gift/i)).toHaveCount(0);
  await page.unrouteAll({ behavior: "ignoreErrors" });
});

async function fulfillProjectedComplimentary(route: Route, complimentary: unknown): Promise<void> {
  try {
    const response = await route.fetch();
    const json = JSON.parse((await response.body()).toString("utf8")) as unknown;
    projectEvaluatorComplimentary(json, complimentary);
    const headers = response.headers();
    delete headers["content-length"];
    await route.fulfill({
      status: response.status(),
      headers,
      contentType: "application/json",
      body: JSON.stringify(json),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (message.includes("Test ended") || message.includes("Target closed")) return;
    throw error;
  }
}

function projectEvaluatorComplimentary(value: unknown, complimentary: unknown): void {
  if (!complimentary || typeof complimentary !== "object") {
    throw new Error("evaluator complimentary outcome missing");
  }
  if ((complimentary as { competingOffers?: string }).competingOffers !== "NONE_CHOSEN") {
    throw new Error("refusing to project an outcome that is not evaluator NONE_CHOSEN");
  }
  applyEvaluatorComplimentary(value, complimentary);
}

function applyEvaluatorComplimentary(value: unknown, complimentary: unknown): void {
  if (!value || typeof value !== "object") return;
  if (Array.isArray(value)) {
    for (const entry of value) applyEvaluatorComplimentary(entry, complimentary);
    return;
  }
  const record = value as Record<string, unknown>;
  if (
    typeof record.merchandiseOrOrderSavingPaise === "string" &&
    typeof record.deliverySavingPaise === "string"
  ) {
    record.complimentary = complimentary;
  }
  if (Array.isArray(record.lines)) {
    record.lines = record.lines.filter((line) => {
      if (!line || typeof line !== "object") return true;
      return (line as { lineOrigin?: string }).lineOrigin !== "complimentary_offer";
    });
  }
  for (const child of Object.values(record)) applyEvaluatorComplimentary(child, complimentary);
}

async function payFromReview(page: Page): Promise<void> {
  await page.getByRole("button", { name: /Continue to payment/i }).click();
  await expect(page.getByTestId("checkout-ready")).toBeVisible({ timeout: 30_000 });
  await expect(page.getByTestId("payment-start")).toBeVisible();
  await expect(page.getByTestId("coupon-field")).toHaveCount(0);
  await page.getByTestId("payment-start").click();
  await expect(page.getByTestId("order-confirmation")).toBeVisible({ timeout: 45_000 });
}
