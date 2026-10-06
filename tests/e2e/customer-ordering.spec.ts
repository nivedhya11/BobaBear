import { test, expect, type Locator, type Page } from "@playwright/test";

import {
  installLocationProviderMocks,
  installMockGoogleMaps,
} from "./support/maps-location-mocks";
import { installRazorpayCheckoutMock } from "./support/razorpay-checkout-mock";

/**
 * IMP-025 / IMP-026B / IMP-036H E2E: guest menu → cart → auth → claim →
 * fulfilment choice → (Delivery destination | Pickup outlet) → checkout →
 * fake Razorpay Standard Checkout → confirmation → history/detail.
 * Run via `npm run test:e2e:customer-ordering` only.
 *
 * Each scenario that sends an OTP uses its own distinct phone number so the
 * per-phone 60-second resend rate limit never leaks between tests sharing
 * one worker (`fullyParallel: false`, `workers: 1` in the dedicated config).
 */

const FIXED_OTP_CODE = process.env.CUSTOMER_OTP_LOCAL_FIXED_CODE;

const PHONE_NUMBERS = {
  success: "9876500251",
  dismiss: "9876500252",
  providerFailure: "9876500253",
  retry: "9876500254",
  scriptLoadFailure: "9876500255",
  pickupSuccess: "9876500256",
  pickupMobile: "9876500257",
  firstOrderOffer: "9876500258",
  returningOrder: "9876500259",
  // One extra OTP identity only: the full suite already spends 9 otp_send_ip_10m
  // slots (8 desktop + 1 mobile pickup). A second responsive OTP would trip
  // the production 10/10min IP limiter.
  responsiveCommercial: "9876500260",
} as const;

const NARROW_VIEWPORT = { width: 390, height: 844 } as const;
const LG_VIEWPORT = { width: 1024, height: 900 } as const;

async function selectCheckoutFulfilmentDelivery(page: Page): Promise<void> {
  const checkout = page.locator("#main-content");
  await expect(checkout.getByTestId("checkout-fulfilment-choice")).toBeVisible({
    timeout: 20_000,
  });
  // AC-036H-041 — Delivery / Pickup are named, pressed-state toggle buttons.
  const delivery = checkout.getByTestId("checkout-fulfilment-delivery");
  const pickup = checkout.getByTestId("checkout-fulfilment-pickup");
  await expect(delivery).toHaveAttribute("aria-pressed", "false");
  await expect(pickup).toHaveAttribute("aria-pressed", "false");
  await delivery.focus();
  await expect(delivery).toBeFocused();
  await delivery.click();
  await expect(delivery).toHaveAttribute("aria-pressed", "true");
}

test.beforeEach(() => {
  test.skip(
    !FIXED_OTP_CODE,
    "CUSTOMER_OTP_LOCAL_FIXED_CODE must be set for the customer-ordering E2E suite.",
  );
});

function phoneField(page: Page) {
  return page.getByLabel("Mobile number", { exact: true });
}

function codeField(page: Page) {
  return page.getByLabel("6-digit code", { exact: true });
}

async function completeCheckoutDestination(page: Page, phoneNumber: string): Promise<void> {
  const checkout = page.locator("#main-content");
  await expect(checkout.getByTestId("checkout-destination-select")).toBeVisible({ timeout: 20_000 });
  await checkout.getByRole("button", { name: "Add new address" }).click();

  await expect(checkout.getByTestId("checkout-destination-location")).toBeVisible();
  await checkout.getByPlaceholder("Search area, street or nearby landmark").fill("Rajpur");
  await expect(checkout.getByRole("option", { name: "Rajpur Road, Dehradun" })).toBeVisible({
    timeout: 15_000,
  });
  await checkout.getByRole("option", { name: "Rajpur Road, Dehradun" }).click();

  await expect(page.getByTestId("delivery-location-map-confirmation")).toBeVisible({
    timeout: 20_000,
  });
  await page.getByRole("button", { name: "Confirm location" }).click();

  await expect(checkout.getByTestId("checkout-destination-details")).toBeVisible({ timeout: 15_000 });
  // Accessible names include FieldLabel " (required)" / " (Optional)" suffixes.
  await checkout.getByRole("textbox", { name: /Flat \/ House \/ Building/i }).fill("12 Mall Road");
  await checkout.getByRole("textbox", { name: /Recipient name/i }).fill("E2E Guest");
  await checkout.getByRole("textbox", { name: /Mobile number/i }).fill(`+91${phoneNumber}`);
  await checkout.getByRole("button", { name: "Save address" }).click();
}

async function continueThroughCheckoutTimingIfPresent(page: Page): Promise<void> {
  const review = page.getByTestId("checkout-review");
  const timingAsap = page.getByTestId("checkout-timing-asap");
  await Promise.race([
    review.waitFor({ state: "visible", timeout: 20_000 }),
    timingAsap.waitFor({ state: "visible", timeout: 20_000 }),
  ]).catch(() => undefined);
  if (await timingAsap.isVisible()) {
    await timingAsap.click();
  }
}

async function reachReadyForPayment(page: Page, phoneNumber: string): Promise<void> {
  await installMockGoogleMaps(page);
  await installLocationProviderMocks(page);

  await page.goto("/order/");
  await expect(page.getByRole("heading", { name: /^the bar$/i, level: 1 })).toBeVisible();
  await expect(page.getByTestId("deliver-to-header-orientation")).toBeVisible();
  await expect(page.getByTestId("deliver-to-header-orientation")).toContainText("Dehradun");
  await expect(page.locator("#main-content")).not.toContainText(/serviceable/i);

  const addButtons = page.locator("#main-content").getByRole("button", { name: /^add .+/i });
  await expect(addButtons.first()).toBeVisible();
  await expect(addButtons.first()).toContainText("Add +");
  await addButtons.first().click();
  const headerCartLink = page
    .locator("header")
    .getByRole("link", { name: /^cart \(1\)$/i });
  await expect(headerCartLink).toBeVisible({ timeout: 15_000 });

  await headerCartLink.click();
  await expect(page.getByRole("heading", { name: /your cart/i })).toBeVisible();
  await expect(page.getByRole("button", { name: /checkout/i })).toBeVisible();
  await page.getByRole("button", { name: /checkout/i }).click();

  await expect(page.getByRole("heading", { name: "Sign In" })).toBeVisible();
  await phoneField(page).fill(phoneNumber);
  await page.getByRole("button", { name: /send code/i }).click();
  await expect(codeField(page)).toBeVisible();
  await codeField(page).fill(FIXED_OTP_CODE!);
  await page.getByRole("button", { name: /verify code/i }).click();

  await expect(page.getByRole("heading", { name: "Checkout" })).toBeVisible({ timeout: 20_000 });
  // AC-036H-001 / AC-036H-031 — Delivery path must choose Delivery before destination.
  await selectCheckoutFulfilmentDelivery(page);
  await completeCheckoutDestination(page, phoneNumber);
  await continueThroughCheckoutTimingIfPresent(page);

  // Review → payment is an explicit step (checkout-review → Continue to payment → checkout-ready).
  await expect(page.getByTestId("checkout-review")).toBeVisible({ timeout: 20_000 });
  await page.getByRole("button", { name: /Continue to payment/i }).click();

  await expect(page.getByTestId("checkout-ready")).toBeVisible({ timeout: 20_000 });
  await expect(page.getByTestId("checkout-line-review")).toBeVisible();
  await expect(page.getByTestId("checkout-ready").getByText(/total payable/i).first()).toBeVisible();
  await expect(page.getByTestId("payment-start")).toBeVisible();
}

/**
 * Guest → menu → cart → auth → Pickup fulfilment → review → payment-ready.
 * Does not install Maps mocks — AC-036H-030 requires no Maps/location APIs.
 */
async function reachPickupReadyForPayment(page: Page, phoneNumber: string): Promise<void> {
  const mapsOrPlacesRequests: string[] = [];
  await page.addInitScript(() => {
    const g = globalThis as typeof globalThis & {
      __bobaGeoGetCurrentPositionCalls?: number;
      __bobaGeoWatchPositionCalls?: number;
    };
    g.__bobaGeoGetCurrentPositionCalls = 0;
    g.__bobaGeoWatchPositionCalls = 0;
    const geo = navigator.geolocation;
    if (!geo) return;
    const originalGet = geo.getCurrentPosition.bind(geo);
    const originalWatch = geo.watchPosition.bind(geo);
    geo.getCurrentPosition = ((...args: Parameters<Geolocation["getCurrentPosition"]>) => {
      g.__bobaGeoGetCurrentPositionCalls = (g.__bobaGeoGetCurrentPositionCalls ?? 0) + 1;
      return originalGet(...args);
    }) as Geolocation["getCurrentPosition"];
    geo.watchPosition = ((...args: Parameters<Geolocation["watchPosition"]>) => {
      g.__bobaGeoWatchPositionCalls = (g.__bobaGeoWatchPositionCalls ?? 0) + 1;
      return originalWatch(...args);
    }) as Geolocation["watchPosition"];
  });

  page.on("request", (request) => {
    const url = request.url();
    if (
      /maps\.googleapis\.com|places\.googleapis\.com|maps\.gstatic\.com/i.test(url)
    ) {
      mapsOrPlacesRequests.push(url);
    }
  });

  await page.goto("/order/");
  await expect(page.getByRole("heading", { name: /^the bar$/i, level: 1 })).toBeVisible();

  const addButtons = page.locator("#main-content").getByRole("button", { name: /^add .+/i });
  await expect(addButtons.first()).toBeVisible();
  await addButtons.first().click();
  const headerCartLink = page.locator("header").getByRole("link", { name: /^cart \(1\)$/i });
  await expect(headerCartLink).toBeVisible({ timeout: 15_000 });
  await headerCartLink.click();
  await expect(page.getByRole("heading", { name: /your cart/i })).toBeVisible();
  await page.getByRole("button", { name: /checkout/i }).click();

  await expect(page.getByRole("heading", { name: "Sign In" })).toBeVisible();
  await phoneField(page).fill(phoneNumber);
  await page.getByRole("button", { name: /send code/i }).click();
  await expect(codeField(page)).toBeVisible();
  await codeField(page).fill(FIXED_OTP_CODE!);
  await page.getByRole("button", { name: /verify code/i }).click();

  await expect(page.getByRole("heading", { name: "Checkout" })).toBeVisible({ timeout: 20_000 });
  const checkout = page.locator("#main-content");
  await expect(checkout.getByTestId("checkout-fulfilment-choice")).toBeVisible({ timeout: 20_000 });

  // AC-036H-041 — real keyboard: Tab from Delivery to Pickup, Enter to activate.
  const delivery = checkout.getByTestId("checkout-fulfilment-delivery");
  const pickup = checkout.getByTestId("checkout-fulfilment-pickup");
  await delivery.focus();
  await expect(delivery).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(pickup).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(pickup).toHaveAttribute("aria-pressed", "true");
  await expect(delivery).toHaveAttribute("aria-pressed", "false");
  // Space also activates when focused (toggle stays selected).
  await page.keyboard.press("Space");
  await expect(pickup).toHaveAttribute("aria-pressed", "true");

  await expect(checkout.getByTestId("checkout-pickup-outlet")).toBeVisible({ timeout: 20_000 });
  // Single eligible outlet → AUTO_SELECT (AC-036H-003).
  await expect(checkout.getByTestId("checkout-pickup-outlet-auto")).toBeVisible();
  await expect(checkout.getByTestId("checkout-destination-select")).toHaveCount(0);
  await expect(checkout.getByTestId("checkout-destination-location")).toHaveCount(0);
  await checkout.getByTestId("checkout-pickup-continue").focus();
  await expect(checkout.getByTestId("checkout-pickup-continue")).toBeFocused();
  await page.keyboard.press("Enter");
  await continueThroughCheckoutTimingIfPresent(page);

  await expect(page.getByTestId("checkout-review")).toBeVisible({ timeout: 20_000 });
  await expect(page.getByTestId("checkout-review-pickup")).toBeVisible();
  await expect(page.getByTestId("checkout-review-no-delivery-fee")).toBeVisible();
  await page.getByRole("button", { name: /Continue to payment/i }).click();

  await expect(page.getByTestId("checkout-ready")).toBeVisible({ timeout: 20_000 });
  await expect(page.getByTestId("payment-start")).toBeVisible();

  expect(mapsOrPlacesRequests, "Pickup must not call Maps/Places (AC-036H-030)").toEqual([]);
  const geoCounts = await page.evaluate(() => {
    const g = globalThis as typeof globalThis & {
      __bobaGeoGetCurrentPositionCalls?: number;
      __bobaGeoWatchPositionCalls?: number;
    };
    return {
      getCurrentPosition: g.__bobaGeoGetCurrentPositionCalls ?? 0,
      watchPosition: g.__bobaGeoWatchPositionCalls ?? 0,
    };
  });
  expect(geoCounts.getCurrentPosition, "geolocation.getCurrentPosition").toBe(0);
  expect(geoCounts.watchPosition, "geolocation.watchPosition").toBe(0);
}

test("guest can complete owned ordering through Razorpay Standard Checkout and order history", async ({
  page,
}) => {
  test.setTimeout(180_000);
  await installRazorpayCheckoutMock(page, "succeed");
  await reachReadyForPayment(page, PHONE_NUMBERS.success);
  await page.getByTestId("payment-start").click();

  await expect(page.getByTestId("order-confirmation")).toBeVisible({ timeout: 30_000 });
  await expect(page.getByTestId("order-status")).toHaveText(/order received/i);
  // Delivery confirmation still shows destination facts (AC-036H-001).
  await expect(page.getByText("E2E Guest", { exact: true })).toBeVisible();
  await page.getByRole("link", { name: /order history/i }).click();
  await expect(page.getByRole("heading", { name: /My Orders/i, level: 1 })).toBeVisible({
    timeout: 15_000,
  });
  await expect(page.getByTestId("order-history-item").first()).toBeVisible();
  await page.getByRole("link", { name: /ORD-/i }).first().click();
  await expect(page.getByTestId("order-detail")).toBeVisible();
  await expect(page.getByTestId("order-status")).toHaveText(/order received/i);
  await expect(page.getByTestId("order-support")).toBeVisible();
  await expect(page.getByText("E2E Guest", { exact: true })).toBeVisible();
  await expect(page.getByText("12 Mall Road", { exact: true })).toBeVisible();
});

function paymentProductAlert(page: Page) {
  // Scope to product main content so Next.js #__next-route-announcer__ is not matched.
  return page.locator("#main-content").getByRole("alert");
}

function isPaymentStartOrRetryPost(url: string): boolean {
  try {
    const pathname = new URL(url).pathname;
    return (
      pathname === "/api/v1/payments" || /^\/api\/v1\/payments\/[^/]+\/retry$/.test(pathname)
    );
  } catch {
    return false;
  }
}

async function razorpayOrderIdFromClientActionResponse(
  response: Awaited<ReturnType<Page["waitForResponse"]>>,
): Promise<string> {
  const body = (await response.json()) as {
    clientAction?: { kind?: string; payload?: { razorpayOrderId?: string } };
  };
  const orderId = body.clientAction?.payload?.razorpayOrderId;
  expect(body.clientAction?.kind).toBe("razorpay_standard_checkout");
  expect(typeof orderId).toBe("string");
  expect(orderId!.length).toBeGreaterThan(0);
  return orderId!;
}

test("Razorpay modal dismiss does not create an Order", async ({ page }) => {
  test.setTimeout(180_000);
  await installRazorpayCheckoutMock(page, "dismiss");
  await reachReadyForPayment(page, PHONE_NUMBERS.dismiss);
  await page.getByTestId("payment-start").click();
  await expect(page.getByTestId("payment-recovery-dismissed")).toContainText(
    /Payment not completed/i,
    { timeout: 20_000 },
  );
  await expect(page.getByTestId("payment-recovery-dismissed")).toContainText(
    /closed the payment window before completing payment/i,
  );
  await expect(page.getByTestId("payment-continue")).toBeVisible();
  await expect(page.getByTestId("payment-start")).toHaveCount(0);
  await expect(page.getByTestId("payment-retry")).toHaveCount(0);
  await expect(page.getByTestId("order-confirmation")).toHaveCount(0);
});

test("Razorpay provider-surface failure does not create an Order", async ({ page }) => {
  test.setTimeout(180_000);
  await installRazorpayCheckoutMock(page, "fail");
  await reachReadyForPayment(page, PHONE_NUMBERS.providerFailure);
  await page.getByTestId("payment-start").click();
  // Browser payment.failed is not authoritative FAILED — stay on checking, no retry CTA.
  await expect(page.getByTestId("payment-checking")).toContainText(/Checking your payment/i, {
    timeout: 20_000,
  });
  await expect(page.getByTestId("payment-checking")).toContainText(/don't pay again yet/i);
  await expect(page.getByTestId("payment-retry")).toHaveCount(0);
  await expect(page.getByTestId("payment-continue")).toHaveCount(0);
  await expect(page.getByText(/Payment window closed/i)).toHaveCount(0);
  await expect(page.getByTestId("order-confirmation")).toHaveCount(0);
});

test("BOBA retry after fake captured-failure uses a new Razorpay Order", async ({ page }) => {
  test.setTimeout(180_000);
  await installRazorpayCheckoutMock(page, "retry");
  await reachReadyForPayment(page, PHONE_NUMBERS.retry);

  // Capture provider Order IDs from authoritative clientAction responses in the
  // test process — page-local Razorpay mock state is destroyed by confirmation navigation.
  const firstStartResponse = page.waitForResponse(
    (response) =>
      response.request().method() === "POST" &&
      isPaymentStartOrRetryPost(response.url()) &&
      response.ok(),
  );
  await page.getByTestId("payment-start").click();
  const firstProviderOrderId = await razorpayOrderIdFromClientActionResponse(
    await firstStartResponse,
  );
  await expect(page.getByTestId("payment-retry")).toBeVisible({ timeout: 20_000 });

  const retryResponse = page.waitForResponse(
    (response) =>
      response.request().method() === "POST" &&
      /^\/api\/v1\/payments\/[^/]+\/retry$/.test(new URL(response.url()).pathname) &&
      response.ok(),
  );
  await page.getByTestId("payment-retry").click();
  const secondProviderOrderId = await razorpayOrderIdFromClientActionResponse(
    await retryResponse,
  );
  expect(secondProviderOrderId).not.toBe(firstProviderOrderId);

  await expect(page.getByTestId("order-confirmation")).toBeVisible({ timeout: 30_000 });
});

test("Razorpay script load failure stays recoverable", async ({ page }) => {
  test.setTimeout(180_000);
  await installRazorpayCheckoutMock(page, "unavailable");
  await reachReadyForPayment(page, PHONE_NUMBERS.scriptLoadFailure);
  await page.getByTestId("payment-start").click();
  await expect(paymentProductAlert(page)).toContainText(
    /Payment checkout couldn't load\. Check your connection\. Don't start a new payment\./i,
    { timeout: 20_000 },
  );
  await expect(page.getByTestId("order-confirmation")).toHaveCount(0);
  await expect(page.getByTestId("payment-reopen-checkout")).toBeVisible();
});

test("guest can complete ASAP Pickup journey without Maps (AC-036H-002/030/041)", async ({
  page,
}, testInfo) => {
  test.skip(
    testInfo.project.name === "mobile-chromium",
    "Desktop Pickup evidence; mobile has a focused counterpart",
  );
  test.setTimeout(180_000);
  await installRazorpayCheckoutMock(page, "succeed");
  await reachPickupReadyForPayment(page, PHONE_NUMBERS.pickupSuccess);

  await expect(page.getByTestId("payment-start")).toBeVisible();
  await expect(page.getByTestId("payment-start")).toBeEnabled();

  await page.getByTestId("payment-start").click();

  await expect(page.getByTestId("order-confirmation")).toBeVisible({ timeout: 30_000 });
  await expect(page.getByTestId("order-fulfilment")).toBeVisible();
  await expect(page.getByTestId("order-fulfilment-mode")).toContainText(/pickup/i);
  await expect(page.getByTestId("order-pickup-location")).toBeVisible();
  await expect(page.getByTestId("order-delivery")).toHaveCount(0);
  await expect(page.getByTestId("order-delivery-track")).toHaveCount(0);

  await page.getByRole("link", { name: /order history/i }).click();
  await expect(page.getByRole("heading", { name: /My Orders/i, level: 1 })).toBeVisible({
    timeout: 15_000,
  });
  await page.getByRole("link", { name: /ORD-/i }).first().click();
  await expect(page.getByTestId("order-detail")).toBeVisible();
  await expect(page.getByTestId("order-fulfilment-mode")).toContainText(/pickup/i);
  await expect(page.getByTestId("order-pickup-location")).toBeVisible();
  await expect(page.getByTestId("order-delivery")).toHaveCount(0);
});

test("mobile: ASAP Pickup happy path remains usable (AC-036H mobile evidence)", async ({
  page,
}, testInfo) => {
  test.skip(
    testInfo.project.name !== "mobile-chromium",
    "Mobile viewport evidence only",
  );
  test.setTimeout(180_000);
  const viewport = page.viewportSize();
  expect(viewport, "persist mobile viewport identity").toEqual({
    width: 390,
    height: 844,
  });
  await installRazorpayCheckoutMock(page, "succeed");
  await reachPickupReadyForPayment(page, PHONE_NUMBERS.pickupMobile);
  await page.getByTestId("payment-start").click();
  await expect(page.getByTestId("order-confirmation")).toBeVisible({ timeout: 30_000 });
  await expect(page.getByTestId("order-fulfilment-mode")).toContainText(/pickup/i);
  await expect(page.getByTestId("order-pickup-location")).toBeVisible();
});

async function addFirstMenuItemAndOpenCart(page: Page): Promise<void> {
  await page.goto("/order/");
  await expect(page.getByRole("heading", { name: /^the bar$/i, level: 1 })).toBeVisible();
  const addButtons = page.locator("#main-content").getByRole("button", { name: /^add .+/i });
  await expect(addButtons.first()).toBeVisible();
  await addButtons.first().click();
  const headerCartLink = page.locator("header").getByRole("link", { name: /^cart \(1\)$/i });
  await expect(headerCartLink).toBeVisible({ timeout: 15_000 });
  await headerCartLink.click();
  await expect(page.getByRole("heading", { name: /your cart/i })).toBeVisible();
}

test("GJ-FIRST-ORDER: discover-to-pay still completes with Offer explanation and server Order truth", async ({
  page,
}) => {
  test.setTimeout(180_000);
  await installRazorpayCheckoutMock(page, "succeed");
  await installMockGoogleMaps(page);
  await installLocationProviderMocks(page);

  await addFirstMenuItemAndOpenCart(page);
  await expect(page.getByTestId("price-summary-total").getByText("Estimated subtotal")).toBeVisible();
  await expect(page.getByTestId("price-summary-total").getByText("Total payable")).toHaveCount(0);
  await expect(page.getByText("Offer applied.")).toHaveCount(0);
  await page.getByRole("button", { name: /checkout/i }).click();

  await expect(page.getByRole("heading", { name: "Sign In" })).toBeVisible();
  await phoneField(page).fill(PHONE_NUMBERS.firstOrderOffer);
  await page.getByRole("button", { name: /send code/i }).click();
  await expect(codeField(page)).toBeVisible();
  await codeField(page).fill(FIXED_OTP_CODE!);
  await page.getByRole("button", { name: /verify code/i }).click();

  await expect(page.getByRole("heading", { name: "Checkout" })).toBeVisible({ timeout: 20_000 });
  await selectCheckoutFulfilmentDelivery(page);
  await completeCheckoutDestination(page, PHONE_NUMBERS.firstOrderOffer);
  await continueThroughCheckoutTimingIfPresent(page);

  await expect(page.getByTestId("checkout-review")).toBeVisible({ timeout: 20_000 });
  await expect(page.getByTestId("offer-status")).toContainText("Offer applied.", { timeout: 20_000 });
  await expect(page.locator('[data-offer-component="ORDER_SAVING"]').first()).toBeVisible();
  await expect(page.locator("#main-content").getByTestId("coupon-field")).toBeVisible();
  await page.getByRole("button", { name: /Continue to payment/i }).click();

  await expect(page.getByTestId("checkout-ready")).toBeVisible({ timeout: 20_000 });
  await expect(page.getByTestId("checkout-ready").getByTestId("coupon-field")).toHaveCount(0);
  await expect(page.getByTestId("payment-start")).toBeVisible();
  await page.getByTestId("payment-start").click();

  await expect(page.getByTestId("order-confirmation")).toBeVisible({ timeout: 30_000 });
  await expect(page.getByTestId("order-status")).toHaveText(/order received/i);
  await page.getByRole("link", { name: /order history/i }).click();
  await expect(page.getByTestId("order-history-item").first()).toBeVisible();
  await expect(page.getByRole("button", { name: /order again/i })).toHaveCount(0);
});

test("GJ-RETURNING-ORDER: returning customer orders again without a first-order Offer or Order Again shortcut", async ({
  page,
}) => {
  test.setTimeout(240_000);
  await installRazorpayCheckoutMock(page, "succeed");
  await reachReadyForPayment(page, PHONE_NUMBERS.returningOrder);
  await page.getByTestId("payment-start").click();
  await expect(page.getByTestId("order-confirmation")).toBeVisible({ timeout: 30_000 });
  const firstOrderNumber = (await page.getByTestId("order-number").innerText()).trim();
  expect(firstOrderNumber).toMatch(/^ORD-/);

  await addFirstMenuItemAndOpenCart(page);
  await expect(page.getByText("Offer applied.")).toHaveCount(0);
  await expect(page.getByRole("button", { name: /order again/i })).toHaveCount(0);
  await page.getByRole("button", { name: /checkout/i }).click();

  const signIn = page.getByRole("heading", { name: "Sign In" });
  if (await signIn.isVisible().catch(() => false)) {
    await phoneField(page).fill(PHONE_NUMBERS.returningOrder);
    await page.getByRole("button", { name: /send code/i }).click();
    await expect(codeField(page)).toBeVisible();
    await codeField(page).fill(FIXED_OTP_CODE!);
    await page.getByRole("button", { name: /verify code/i }).click();
  }

  await expect(page.getByRole("heading", { name: "Checkout" })).toBeVisible({ timeout: 20_000 });
  await selectCheckoutFulfilmentDelivery(page);
  await expect(page.getByTestId("checkout-destination-select")).toBeVisible({ timeout: 20_000 });
  const savedCard = page.getByTestId("checkout-saved-addresses").getByRole("button").first();
  await expect(savedCard).toBeVisible({ timeout: 20_000 });
  await expect(savedCard).toBeEnabled();
  await savedCard.click();
  await continueThroughCheckoutTimingIfPresent(page);
  await expect(page.getByTestId("checkout-review")).toBeVisible({ timeout: 20_000 });
  await expect(page.getByTestId("checkout-review").getByText("Offer applied.")).toHaveCount(0);
  await page.getByRole("button", { name: /Continue to payment/i }).click();
  await expect(page.getByTestId("checkout-ready")).toBeVisible({ timeout: 20_000 });
  await page.getByTestId("payment-start").click();
  await expect(page.getByTestId("order-confirmation")).toBeVisible({ timeout: 30_000 });

  await page.getByRole("link", { name: /order history/i }).click();
  await expect(page.getByRole("heading", { name: /My Orders/i, level: 1 })).toBeVisible({
    timeout: 15_000,
  });
  await expect(page.getByTestId("order-history-item")).toHaveCount(2);
  await expect(page.getByTestId("order-history-item").getByText(firstOrderNumber, { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: /order again/i })).toHaveCount(0);
});

async function expectComputedVisible(locator: Locator, name: string): Promise<void> {
  await expect(locator, name).toBeVisible();
  const computed = await locator.evaluate((node) => {
    const style = window.getComputedStyle(node);
    const rect = node.getBoundingClientRect();
    return {
      display: style.display,
      visibility: style.visibility,
      width: rect.width,
      height: rect.height,
    };
  });
  expect(computed.display, `${name} computed display`).not.toBe("none");
  expect(computed.visibility, `${name} computed visibility`).not.toBe("hidden");
  expect(computed.width, `${name} computed width`).toBeGreaterThan(0);
  expect(computed.height, `${name} computed height`).toBeGreaterThan(0);
}

async function expectComputedHidden(locator: Locator, name: string): Promise<void> {
  const hidden = await locator.evaluate((node) => {
    const style = window.getComputedStyle(node);
    return style.display === "none" || style.visibility === "hidden";
  });
  expect(hidden, `${name} computed hidden`).toBe(true);
}

async function assertNoHorizontalOverflow(page: Page, surface: string): Promise<void> {
  const metrics = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));
  expect(
    metrics.scrollWidth,
    `${surface} horizontal overflow scrollWidth=${metrics.scrollWidth} clientWidth=${metrics.clientWidth}`,
  ).toBeLessThanOrEqual(metrics.clientWidth + 1);
}

async function assertCartCommercial(page: Page, mode: "narrow" | "lg"): Promise<void> {
  await expect(page.getByRole("heading", { name: /your cart/i })).toBeVisible();
  const narrowOffer = page.getByTestId("cart-narrow-offer");
  const orderSummary = page.getByTestId("cart-order-summary");
  const stickyBar = page.getByTestId("cart-mobile-checkout");
  const stickyAmount = page.getByTestId("cart-sticky-amount");

  if (mode === "narrow") {
    await expectComputedVisible(narrowOffer, "CART_NARROW cart-narrow-offer");
    await expectComputedHidden(orderSummary, "CART_NARROW cart-order-summary");
    await expectComputedVisible(stickyBar, "CART_NARROW cart-mobile-checkout");
    await expectComputedVisible(stickyAmount, "CART_NARROW cart-sticky-amount");
    await expect(stickyBar.getByText("Total payable")).toHaveCount(0);
    await expect(stickyAmount).not.toHaveText(/Total payable/);
    await expect(stickyBar.getByRole("button", { name: /checkout/i })).toBeVisible();
    await expect(stickyBar.getByRole("button", { name: /checkout/i })).toBeEnabled();
    await expectComputedVisible(
      narrowOffer.getByTestId("coupon-field"),
      "CART_NARROW coupon-field",
    );
    await expect(orderSummary).not.toBeVisible();
  } else {
    await expectComputedVisible(orderSummary, "CART_LG cart-order-summary");
    await expectComputedHidden(narrowOffer, "CART_LG cart-narrow-offer");
    await expectComputedHidden(stickyBar, "CART_LG cart-mobile-checkout");
    await expectComputedVisible(
      orderSummary.getByTestId("price-summary-total"),
      "CART_LG authoritative amount",
    );
    await expect(orderSummary.getByTestId("price-summary-total")).toContainText(
      /Estimated subtotal|Current total/,
    );
    await expect(orderSummary.getByText("Total payable")).toHaveCount(0);
    await expect(stickyBar).not.toBeVisible();
    await expect(narrowOffer).not.toBeVisible();
    await expectComputedVisible(
      orderSummary.getByTestId("coupon-field"),
      "CART_LG coupon-field",
    );
    await expect(orderSummary.getByRole("button", { name: /checkout/i })).toBeVisible();
    await expect(orderSummary.getByRole("button", { name: /checkout/i })).toBeEnabled();
  }

  const visibleAmountLabels = page.getByText("Total payable", { exact: true });
  await expect(visibleAmountLabels).toHaveCount(0);
  await assertNoHorizontalOverflow(page, mode === "narrow" ? "CART_NARROW" : "CART_LG");
}

async function assertReviewKeyboardOrder(page: Page): Promise<void> {
  await page.getByTestId("checkout-back-to-delivery").focus();
  const seen: string[] = [];
  for (let i = 0; i < 40; i += 1) {
    await page.keyboard.press("Tab");
    const marker = await page.evaluate(() => {
      const el = document.activeElement as HTMLElement | null;
      return el?.getAttribute("data-testid") ?? "";
    });
    if (
      (marker === "continue-to-payment" || marker === "coupon-input") &&
      !seen.includes(marker)
    ) {
      seen.push(marker);
    }
    if (seen.includes("continue-to-payment") && seen.includes("coupon-input")) {
      break;
    }
  }
  expect(seen, "REVIEW_KEYBOARD_ORDER_PROOF").toEqual([
    "continue-to-payment",
    "coupon-input",
  ]);
}

async function assertReviewCommercial(page: Page, surface: string): Promise<void> {
  const review = page.getByTestId("checkout-review");
  await expectComputedVisible(review, `${surface} checkout-review`);
  await expectComputedVisible(
    review.getByRole("region", { name: "Price summary" }),
    `${surface} Price summary`,
  );
  await expectComputedVisible(review.getByText("Total payable"), `${surface} Total payable`);
  await expectComputedVisible(review.getByTestId("offer-status"), `${surface} offer-status`);
  await expect(review.getByTestId("offer-status")).toHaveAttribute("role", /status|alert/);
  await expect(review.getByTestId("offer-status")).toContainText("Offer applied.");
  await expectComputedVisible(
    review.locator('[data-offer-component="ORDER_SAVING"]').first(),
    `${surface} ORDER_SAVING`,
  );
  await expectComputedVisible(review.getByTestId("coupon-field"), `${surface} Review coupon`);
  const continuePayment = review.getByRole("button", { name: /Continue to payment/i });
  await expectComputedVisible(continuePayment, `${surface} Continue to payment`);
  await expect(continuePayment).toBeEnabled();
  await assertReviewKeyboardOrder(page);
  await assertNoHorizontalOverflow(page, surface);
}

async function assertPaymentKeyboardOrder(page: Page, surface: string): Promise<void> {
  // Deterministic start immediately before PaymentPanel actionable controls:
  // #main-content is tabindex=-1 (programmatic focus only), so the next Tab enters
  // the first tabbable Payment control without calling .focus() on payment-start.
  await page.locator("#main-content").focus();
  await expect(page.locator("#main-content")).toBeFocused();

  const couponControlIds = new Set([
    "coupon-field",
    "coupon-input",
    "coupon-apply",
    "coupon-change",
    "coupon-remove",
  ]);
  const seen: string[] = [];
  const traversed: string[] = [];
  const couponHits: string[] = [];
  let payEnabledWhenFocused = false;

  for (let i = 0; i < 40; i += 1) {
    await page.keyboard.press("Tab");
    const marker = await page.evaluate(() => {
      const el = document.activeElement as HTMLElement | null;
      if (!el) return "";
      const testId = el.getAttribute("data-testid") ?? "";
      if (testId) return testId;
      const name =
        el.getAttribute("aria-label") ||
        el.textContent?.trim().replace(/\s+/g, " ").slice(0, 80) ||
        el.tagName.toLowerCase();
      return name;
    });
    traversed.push(marker || "(unnamed)");
    if (couponControlIds.has(marker) || /^(Apply|Change|Remove)$/i.test(marker)) {
      couponHits.push(marker);
    }
    if (marker === "payment-start" && !seen.includes(marker)) {
      seen.push(marker);
      payEnabledWhenFocused = await page.getByTestId("payment-start").isEnabled();
    } else if (marker === "payment-back-to-review" && !seen.includes(marker)) {
      seen.push(marker);
    }
    if (seen.includes("payment-start") && seen.includes("payment-back-to-review")) {
      break;
    }
  }

  test.info().annotations.push({
    type: `${surface}_PAYMENT_KEYBOARD_SEQUENCE`,
    description: JSON.stringify(traversed),
  });
  // Exact observed Tab sequence for XR-010 / PR continuation evidence.
  console.log(`${surface} PAYMENT_KEYBOARD_SEQUENCE=${JSON.stringify(traversed)}`);

  expect(
    couponHits,
    `${surface} PAYMENT_KEYBOARD_NO_COUPON traversed=${JSON.stringify(traversed)}`,
  ).toEqual([]);
  expect(
    seen,
    `${surface} PAYMENT_KEYBOARD_ORDER_PROOF traversed=${JSON.stringify(traversed)}`,
  ).toEqual(["payment-start", "payment-back-to-review"]);
  expect(payEnabledWhenFocused, `${surface} PAYMENT_KEYBOARD_PAY_ENABLED`).toBe(true);
  await expect(page.getByTestId("payment-back-to-review")).toBeFocused();
}

async function assertPaymentCommercial(page: Page, surface: string): Promise<void> {
  const ready = page.getByTestId("checkout-ready");
  await expectComputedVisible(ready, `${surface} checkout-ready`);
  const payment = ready.getByTestId("checkout-payment");
  await expectComputedVisible(payment, `${surface} checkout-payment`);
  await expectComputedVisible(
    payment.getByRole("region", { name: "Price summary" }),
    `${surface} Payment Price summary`,
  );
  await expectComputedVisible(payment.getByText("Total payable"), `${surface} Payment Total payable`);
  await expectComputedVisible(
    payment.locator('[data-offer-component="ORDER_SAVING"]').first(),
    `${surface} Payment sealed ORDER_SAVING`,
  );
  await expect(payment.getByTestId("offer-status")).toContainText("Offer applied.");
  await expectComputedVisible(ready.getByTestId("payment-start"), `${surface} payment-start`);
  await expect(ready.getByTestId("payment-start")).toBeEnabled();
  await expect(ready.getByTestId("coupon-field")).toHaveCount(0);
  await expect(ready.getByTestId("coupon-apply")).toHaveCount(0);
  await expect(ready.getByTestId("coupon-change")).toHaveCount(0);
  await expect(ready.getByTestId("coupon-remove")).toHaveCount(0);
  await expect(ready.getByRole("button", { name: /^(Apply|Change|Remove)$/ })).toHaveCount(0);
  await assertPaymentKeyboardOrder(page, surface);
  await assertNoHorizontalOverflow(page, `${surface} PAYMENT_READ_ONLY_PROOF`);
}

test("mobile: IMP-036J responsive commercial Cart Review Payment proof", async ({
  page,
}, testInfo) => {
  test.skip(
    testInfo.project.name !== "mobile-chromium",
    "Narrow IMP-036J commercial proof runs under mobile-chromium only",
  );
  test.setTimeout(180_000);
  await page.emulateMedia({ reducedMotion: "reduce" });
  expect(page.viewportSize(), "persist narrow viewport identity 390x844").toEqual(
    NARROW_VIEWPORT,
  );

  await installRazorpayCheckoutMock(page, "succeed");
  await installMockGoogleMaps(page);
  await installLocationProviderMocks(page);
  await addFirstMenuItemAndOpenCart(page);
  await assertCartCommercial(page, "narrow");

  await page.getByRole("button", { name: /checkout/i }).click();
  await expect(page.getByRole("heading", { name: "Sign In" })).toBeVisible();
  await phoneField(page).fill(PHONE_NUMBERS.responsiveCommercial);
  await page.getByRole("button", { name: /send code/i }).click();
  await expect(codeField(page)).toBeVisible();
  await codeField(page).fill(FIXED_OTP_CODE!);
  await page.getByRole("button", { name: /verify code/i }).click();

  await expect(page.getByRole("heading", { name: "Checkout" })).toBeVisible({ timeout: 20_000 });
  await selectCheckoutFulfilmentDelivery(page);
  await completeCheckoutDestination(page, PHONE_NUMBERS.responsiveCommercial);
  await continueThroughCheckoutTimingIfPresent(page);

  expect(page.viewportSize(), "narrow viewport remains 390x844 on Review").toEqual(
    NARROW_VIEWPORT,
  );
  await assertReviewCommercial(page, "REVIEW_NARROW");
  const reducedMotionOffer = page.getByTestId("checkout-review").getByTestId("offer-status");
  await expect(reducedMotionOffer).toHaveAttribute("role", "status");
  await expect(reducedMotionOffer).toContainText("Offer applied.");

  await page.setViewportSize(LG_VIEWPORT);
  expect(page.viewportSize(), "lg viewport identity 1024x900 on Review").toEqual(LG_VIEWPORT);
  await assertReviewCommercial(page, "REVIEW_LG");

  await page.getByRole("button", { name: /Continue to payment/i }).click();
  expect(page.viewportSize(), "lg viewport remains 1024x900 on Payment").toEqual(LG_VIEWPORT);
  await assertPaymentCommercial(page, "PAYMENT_LG");

  await page.setViewportSize(NARROW_VIEWPORT);
  expect(page.viewportSize(), "narrow viewport remains 390x844 on Payment").toEqual(
    NARROW_VIEWPORT,
  );
  await assertPaymentCommercial(page, "PAYMENT_NARROW");
});

test("IMP-036J responsive commercial Cart Review Payment proof at lg", async ({ page }) => {
  test.setTimeout(180_000);
  await page.setViewportSize(LG_VIEWPORT);
  expect(page.viewportSize(), "persist lg viewport identity 1024x900").toEqual(LG_VIEWPORT);

  await installMockGoogleMaps(page);
  await installLocationProviderMocks(page);
  await addFirstMenuItemAndOpenCart(page);
  await assertCartCommercial(page, "lg");
  await page.getByRole("button", { name: /checkout/i }).click();
  await expect(page.getByRole("heading", { name: "Sign In" })).toBeVisible();
  expect(page.viewportSize(), "lg viewport remains 1024x900 after Checkout").toEqual(
    LG_VIEWPORT,
  );
});
