import { expect, test, type Page } from "@playwright/test";

import { installRazorpayCheckoutMock } from "./support/razorpay-checkout-mock";
import {
  installLocationProviderMocks,
  installMockGoogleMaps,
} from "./support/maps-location-mocks";

/**
 * Browser E2E on the disposable customer-ordering harness (fake Razorpay).
 * Not Founder UAT. Not a unit or jsdom result.
 *
 * The imported menu fixture has zero modifier groups, so the modifier
 * selection-order loop is not claimed here.
 */

const FIXED_OTP_CODE = process.env.CUSTOMER_OTP_LOCAL_FIXED_CODE;
const CONTROL_TOKEN = process.env.E2E_HARNESS_CONTROL_TOKEN ?? "gtm-uat-browser-control";

const PHONE = {
  scheduledDelivery: "9876500271",
  bindingDrift: "9876500272",
} as const;

test.beforeEach(() => {
  test.skip(!FIXED_OTP_CODE, "CUSTOMER_OTP_LOCAL_FIXED_CODE must be set.");
});

function phoneField(page: Page) {
  return page.getByLabel("Mobile number", { exact: true });
}

function codeField(page: Page) {
  return page.getByLabel("6-digit code", { exact: true });
}

function visibleCheckout(page: Page) {
  return page.locator("#main-content").locator("button:visible", { hasText: /^Checkout$/ });
}

async function control(page: Page, action: string): Promise<Record<string, unknown>> {
  const response = await page.request.post("/__e2e/control", {
    headers: { "x-e2e-control-token": CONTROL_TOKEN },
    data: { action },
  });
  expect(response.ok(), await response.text()).toBeTruthy();
  return (await response.json()) as Record<string, unknown>;
}

function trackMenuFailures(page: Page): {
  drain: () => Promise<Array<{ status: number; url: string; body: string }>>;
} {
  const pending: Array<Promise<{ status: number; url: string; body: string } | null>> = [];
  page.on("response", (response) => {
    if (!response.url().includes("/api/v1/menu")) return;
    pending.push(
      (async () => {
        if (response.ok()) return null;
        const body = await response.text().catch(() => "");
        return {
          status: response.status(),
          url: response.url().replace(/https?:\/\/[^/]+/, ""),
          body: body.slice(0, 600),
        };
      })(),
    );
  });
  return {
    drain: async () => (await Promise.all(pending)).filter((row) => row !== null),
  };
}

async function installLocationMocks(
  page: Page,
  options?: { stubServiceability?: boolean },
): Promise<void> {
  await installMockGoogleMaps(page);
  await installLocationProviderMocks(page, {
    stubServiceability: options?.stubServiceability !== false,
  });
}

/**
 * Confirms a serviceable pin. Pass navigate:false when the menu is already
 * open — a fresh navigation would discard the cart the caller just built.
 * Header location refresh requests the outlet-scoped menu; callers that need
 * the cart afterwards must observe that response.
 */
async function confirmServiceableContext(
  page: Page,
  options?: { navigate?: boolean },
): Promise<void> {
  if (options?.navigate !== false) {
    await installLocationMocks(page);
    await page.goto("/order/");
    await expect(page.getByRole("heading", { name: /^the bar$/i, level: 1 })).toBeVisible();
  }
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

async function addTwoMenuItems(page: Page): Promise<void> {
  const addButtons = page.locator("#main-content").getByRole("button", { name: /^add .+/i });
  await expect(addButtons.nth(1)).toBeVisible();
  await addButtons.nth(0).click();
  await expect(page.locator("header").getByRole("link", { name: /^cart \(1\)$/i })).toBeVisible({
    timeout: 15_000,
  });
  await addButtons.nth(1).click();
  await expect(page.locator("header").getByRole("link", { name: /^cart \(2\)$/i })).toBeVisible({
    timeout: 15_000,
  });
}

async function signIn(page: Page, phoneNumber: string): Promise<void> {
  await expect(page.getByRole("heading", { name: "Sign In" })).toBeVisible();
  await phoneField(page).fill(phoneNumber);
  await page.getByRole("button", { name: /send code/i }).click();
  await expect(codeField(page)).toBeVisible();
  await codeField(page).focus();
  await expect(codeField(page)).toBeFocused();
  await codeField(page).fill(FIXED_OTP_CODE!);
  await page.getByRole("button", { name: /verify code/i }).click();
  await expect(page.getByRole("heading", { name: "Checkout" })).toBeVisible({ timeout: 20_000 });
}

async function chooseDeliveryAndAddress(page: Page, phoneNumber: string): Promise<void> {
  const checkout = page.locator("#main-content");
  const delivery = checkout.getByTestId("checkout-fulfilment-delivery");
  await delivery.focus();
  await expect(delivery).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(delivery).toHaveAttribute("aria-pressed", "true");
  await checkout.getByRole("button", { name: "Add new address" }).click();
  await checkout.getByPlaceholder("Search area, street or nearby landmark").fill("Rajpur");
  await checkout.getByRole("option", { name: "Rajpur Road, Dehradun" }).click();
  await expect(page.getByTestId("delivery-location-map-confirmation")).toBeVisible({
    timeout: 20_000,
  });
  await page.getByRole("button", { name: "Confirm location" }).click();
  await checkout.getByRole("textbox", { name: /Flat \/ House \/ Building/i }).fill("12 Mall Road");
  await checkout.getByRole("textbox", { name: /Recipient name/i }).fill("E2E Guest");
  await checkout.getByRole("textbox", { name: /Mobile number/i }).fill(`+91${phoneNumber}`);
  await checkout.getByRole("button", { name: "Save address" }).click();
}

async function assertItemUnavailableRecovery(page: Page): Promise<void> {
  const menuFailures = trackMenuFailures(page);
  await installLocationMocks(page, { stubServiceability: false });
  await page.goto("/order/");
  await expect(page.getByRole("heading", { name: /^the bar$/i, level: 1 })).toBeVisible();
  await addTwoMenuItems(page);
  const marked = await control(page, "mark-first-cart-line-unavailable");
  expect(marked.ok, JSON.stringify(marked)).toBe(true);
  await confirmServiceableContext(page, { navigate: false });
  const retry = page.getByTestId("commerce-retry-panel");
  const located = page.getByRole("button", { name: /Delivering to Rajpur Road, Dehradun/i });
  await expect(located.or(retry)).toBeVisible({ timeout: 20_000 });
  if ((await retry.count()) > 0 && (await retry.isVisible())) {
    const failures = await menuFailures.drain();
    throw new Error(
      `Location confirm replaced the menu with the error panel. menuFailures=${JSON.stringify(failures)} panel=${await retry.innerText()}`,
    );
  }
  await page.locator("header").getByRole("link", { name: /^cart \(2\)$/i }).click();
  await expect(page.getByRole("heading", { name: /your cart/i })).toBeVisible();
  if ((await retry.count()) > 0 && (await retry.isVisible())) {
    const failures = await menuFailures.drain();
    throw new Error(
      `Cart replaced itself with the menu error panel. menuFailures=${JSON.stringify(failures)} panel=${await retry.innerText()}`,
    );
  }
  const unavailable = String(marked.unavailableProductName);
  const unaffected = String(marked.unaffectedProductName);
  await expect(page.getByTestId("cart-evaluation-problems")).toContainText(unavailable, {
    timeout: 20_000,
  });
  await expect(page.getByTestId("cart-evaluation-problems")).toContainText(
    "That item can't be ordered right now.",
  );
  await expect(page.getByTestId("cart-line-problem")).toHaveCount(1);
  await expect(page.getByRole("button", { name: `Remove ${unavailable} from cart` })).toHaveAttribute(
    "aria-describedby",
    /.+/ ,
  );
  await expect(page.getByText(unaffected, { exact: false }).first()).toBeVisible();
  await expect(page.getByRole("button", { name: `Remove ${unaffected} from cart` })).not.toHaveAttribute(
    "aria-describedby",
    /.+/ ,
  );
  const checkout = visibleCheckout(page);
  await expect(checkout).toBeDisabled();
  const remove = page.getByRole("button", { name: `Remove ${unavailable} from cart` });
  await remove.focus();
  await expect(remove).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.getByTestId("cart-evaluation-problems")).toHaveCount(0, { timeout: 20_000 });
  await expect(visibleCheckout(page)).toBeEnabled();
  await control(page, "restore-availability");
}

test("item unavailable names the line, leaves the other line, and blocks checkout", async ({
  page,
}, testInfo) => {
  test.skip(
    testInfo.project.name === "mobile-chromium",
    "Desktop evidence; mobile has a focused counterpart",
  );
  await assertItemUnavailableRecovery(page);
});

test("mobile: item unavailable names the line and blocks checkout", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "mobile-chromium", "Mobile viewport evidence only");
  expect(page.viewportSize()?.width).toBeLessThanOrEqual(430);
  await assertItemUnavailableRecovery(page);
});

test("scheduled delivery applies a coupon and reaches My Orders through fake checkout", async ({
  page,
}) => {
  test.setTimeout(180_000);
  await installRazorpayCheckoutMock(page, "succeed");
  await installLocationMocks(page);
  await control(page, "restore-availability");
  await page.goto("/order/");
  await expect(page.getByRole("heading", { name: /^the bar$/i, level: 1 })).toBeVisible();
  const addButtons = page.locator("#main-content").getByRole("button", { name: /^add .+/i });
  await addButtons.first().click();
  const cartLink = page.locator("header").getByRole("link", { name: /^cart \(1\)$/i });
  await expect(cartLink).toBeVisible({ timeout: 15_000 });
  await cartLink.click();
  await expect(page.getByRole("heading", { name: /your cart/i })).toBeVisible();
  await page.getByRole("button", { name: /^checkout$/i }).click();
  await signIn(page, PHONE.scheduledDelivery);
  await chooseDeliveryAndAddress(page, PHONE.scheduledDelivery);

  await expect(page.getByTestId("checkout-timing-choice")).toBeVisible({ timeout: 20_000 });
  const windowButton = page.locator('[data-testid^="checkout-window-"]').first();
  await expect(windowButton).toBeVisible({ timeout: 20_000 });
  await windowButton.focus();
  await expect(windowButton).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(windowButton).toHaveAttribute("aria-pressed", "true");

  const review = page.getByTestId("checkout-review");
  await expect(review).toBeVisible({ timeout: 20_000 });
  const couponInput = review.getByTestId("coupon-input");
  await couponInput.focus();
  await expect(couponInput).toBeFocused();
  await couponInput.fill("e2e10");
  await review.getByTestId("coupon-apply").click();
  await expect(review.getByTestId("coupon-result")).toContainText("Coupon applied.", {
    timeout: 20_000,
  });
  await page.getByRole("button", { name: /Continue to payment/i }).click();
  await expect(page.getByTestId("checkout-ready")).toBeVisible({ timeout: 20_000 });
  await page.getByTestId("payment-start").click();

  await expect(page.getByTestId("order-confirmation")).toBeVisible({ timeout: 30_000 });
  await expect(page.getByTestId("order-status")).toHaveText(/order received/i);
  await expect(page.getByTestId("order-fulfilment-timing")).toContainText(/window/i);
  await page.getByRole("link", { name: /order history/i }).click();
  await expect(page.getByTestId("order-history-item").first()).toBeVisible();
});

test("payment start fails closed on sealed promotion drift without a provider open", async ({
  page,
}) => {
  test.setTimeout(180_000);
  await installRazorpayCheckoutMock(page, "succeed");
  await installLocationMocks(page);
  await control(page, "restore-availability");
  await page.goto("/order/");
  await expect(page.getByRole("heading", { name: /^the bar$/i, level: 1 })).toBeVisible();
  const addButtons = page.locator("#main-content").getByRole("button", { name: /^add .+/i });
  await addButtons.first().click();
  await page.locator("header").getByRole("link", { name: /^cart \(1\)$/i }).click();
  await expect(page.getByRole("heading", { name: /your cart/i })).toBeVisible();
  await page.getByRole("button", { name: /^checkout$/i }).click();
  await signIn(page, PHONE.bindingDrift);
  await chooseDeliveryAndAddress(page, PHONE.bindingDrift);
  const asap = page.getByTestId("checkout-timing-asap");
  await expect(page.getByTestId("checkout-timing-choice")).toBeVisible({ timeout: 20_000 });
  await asap.click();
  await expect(page.getByTestId("checkout-review")).toBeVisible({ timeout: 20_000 });
  await page.getByRole("button", { name: /Continue to payment/i }).click();
  await expect(page.getByTestId("payment-start")).toBeVisible({ timeout: 20_000 });

  const before = await control(page, "counts");
  const drifted = await control(page, "drift-sealed-promotion-code");
  expect(drifted.ok, JSON.stringify(drifted)).toBe(true);
  await page.getByTestId("payment-start").click();
  await expect(page.getByTestId("copy-stale")).toContainText(
    "We couldn't confirm your checkout for payment.",
    { timeout: 20_000 },
  );
  await expect(page.getByTestId("order-confirmation")).toHaveCount(0);
  const openCount = await page.evaluate(() => {
    const state = (window as unknown as { __BOBA_E2E_RAZORPAY?: { openCount?: number } })
      .__BOBA_E2E_RAZORPAY;
    return state?.openCount ?? 0;
  });
  expect(openCount).toBe(0);
  const after = await control(page, "counts");
  expect(after.paymentCount).toBe(before.paymentCount);
  expect(after.orderCount).toBe(before.orderCount);
});
