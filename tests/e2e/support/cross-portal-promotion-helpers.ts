/**
 * Shared helpers for IMP-036J cross-portal shared-DB browser proof.
 * Reuses commercial MFA + customer OTP patterns without mutating those suites.
 */
import { createOTP } from "@better-auth/utils/otp";
import { base32 } from "@better-auth/utils/base32";
import { expect, type Browser, type BrowserContext, type Page } from "@playwright/test";
import { readFile, writeFile } from "node:fs/promises";

export type CrossPortalFixture = {
  email: string;
  brandId: string;
  brandName: string;
  outletId: string;
  outletName: string;
  productId?: string;
  productName?: string;
  variantId?: string;
  variantName?: string;
  totpSecretBase32?: string;
  deniedOperatorEmail?: string;
  deniedOperatorTotpSecretBase32?: string;
  runId?: string;
  composeProject?: string;
  postgresHostPort?: string;
  phoneSeed?: string;
  oneDatabaseIdentity?: {
    composeProject: string;
    postgresHostPort: string;
    brandId: string;
    outletId: string;
  };
  fakePaymentProvider?: string;
};

export type PromotionDetail = {
  id: string;
  code: string;
  status: string;
  revision: number;
  redemptionCounts?: {
    reserved: number;
    consumed: number;
    released: number;
    applicationCount: number;
  };
};

export type OrderMoneySummary = {
  promotionDiscountMinor?: number;
  orderSavingMinor?: number;
  deliverySavingMinor?: number;
  grandTotalMinor?: number;
};

const fixturePath =
  process.env.CROSS_PORTAL_E2E_FIXTURE_MANIFEST ?? process.env.COMMERCIAL_E2E_FIXTURE_MANIFEST;
const temporaryPassword = process.env.WORKFORCE_E2E_TEMP_PASSWORD;
const permanentPassword = process.env.WORKFORCE_E2E_PERMANENT_PASSWORD;
const deniedTempPassword = process.env.WORKFORCE_E2E_DENIED_TEMP_PASSWORD;
const deniedPermanentPassword = process.env.WORKFORCE_E2E_DENIED_PERMANENT_PASSWORD;
const fixedOtp = process.env.CUSTOMER_OTP_LOCAL_FIXED_CODE;

export async function loadCrossPortalFixture(): Promise<CrossPortalFixture> {
  if (!fixturePath || !temporaryPassword || !permanentPassword || !fixedOtp) {
    throw new Error("Missing IMP-036J cross-portal E2E credentials / fixture / OTP.");
  }
  if (!/^\d{6}$/.test(fixedOtp)) {
    throw new Error("CUSTOMER_OTP_LOCAL_FIXED_CODE must be six digits.");
  }
  return JSON.parse(await readFile(fixturePath, "utf8")) as CrossPortalFixture;
}

async function persistFixture(next: CrossPortalFixture): Promise<void> {
  if (!fixturePath) return;
  await writeFile(fixturePath, `${JSON.stringify(next, null, 2)}\n`, { mode: 0o600 });
}

function decodeTotp(encoded: string): string {
  return new TextDecoder().decode(base32.decode(encoded));
}

export function customerPhone(seed: string, slot: number): string {
  const base = Number(seed);
  const local = String((base + slot) % 100_000).padStart(5, "0");
  return `98765${local}`;
}

export async function workforceLogin(
  page: Page,
  fixture: CrossPortalFixture,
  opts: {
    email: string;
    tempPassword: string;
    permanentPassword: string;
    totpField: "totpSecretBase32" | "deniedOperatorTotpSecretBase32";
  },
): Promise<CrossPortalFixture> {
  let current = fixture;
  await page.goto("/workforce/login/");

  if (!current[opts.totpField]) {
    await page.getByLabel("Work email", { exact: true }).fill(opts.email);
    await page.getByLabel("Password", { exact: true }).fill(opts.tempPassword);
    await page.getByRole("button", { name: /^Sign in$/i }).click();
    await page.getByLabel("Temporary password", { exact: true }).fill(opts.tempPassword);
    await page.getByLabel("New password", { exact: true }).fill(opts.permanentPassword);
    await page.getByRole("button", { name: /update password/i }).click();
    await page.getByLabel("Confirm password", { exact: true }).fill(opts.permanentPassword);
    await page.getByRole("button", { name: /set up authenticator/i }).click();
    const uri = await page.locator("#main-content code").filter({ hasText: "otpauth://" }).innerText();
    const encoded = new URL(uri.trim()).searchParams.get("secret");
    if (!encoded) throw new Error("TOTP secret missing.");
    current = { ...current, [opts.totpField]: encoded };
    await persistFixture(current);
    await page.getByRole("button", { name: /continue to verification/i }).click();
    await page
      .getByLabel("Authenticator code", { exact: true })
      .fill(await createOTP(decodeTotp(encoded), { digits: 6, period: 30 }).totp());
    await page.getByRole("button", { name: /verify authenticator/i }).click();
    await expect(page.getByText(/authenticator set up\. sign in again/i)).toBeVisible();
  } else if (!(await page.getByLabel("Work email", { exact: true }).isVisible().catch(() => false))) {
    await page.goto("/workforce/login/");
  }

  const secret = current[opts.totpField];
  if (!secret) throw new Error("TOTP secret not established.");
  await page.getByLabel("Work email", { exact: true }).fill(opts.email);
  await page.getByLabel("Password", { exact: true }).fill(opts.permanentPassword);
  await page.getByRole("button", { name: /^Sign in$/i }).click();
  await page
    .getByLabel("Authenticator code", { exact: true })
    .fill(await createOTP(decodeTotp(secret), { digits: 6, period: 30 }).totp());
  await page.getByRole("button", { name: /^Verify$/i }).click();
  await expect(
    page.getByTestId("workforce-hub").or(page.getByTestId("admin-hub")).first(),
  ).toBeVisible({ timeout: 45_000 });
  return current;
}

export async function loginBrandAdmin(page: Page, fixture: CrossPortalFixture): Promise<CrossPortalFixture> {
  return workforceLogin(page, fixture, {
    email: fixture.email,
    tempPassword: temporaryPassword!,
    permanentPassword: permanentPassword!,
    totpField: "totpSecretBase32",
  });
}

export async function loginDeniedOperator(
  page: Page,
  fixture: CrossPortalFixture,
): Promise<CrossPortalFixture> {
  if (!fixture.deniedOperatorEmail || !deniedTempPassword || !deniedPermanentPassword) {
    throw new Error("Denied operator fixture credentials missing.");
  }
  return workforceLogin(page, fixture, {
    email: fixture.deniedOperatorEmail,
    tempPassword: deniedTempPassword,
    permanentPassword: deniedPermanentPassword,
    totpField: "deniedOperatorTotpSecretBase32",
  });
}

export async function openPromotionsEditor(page: Page, fixture: CrossPortalFixture): Promise<void> {
  await page.goto("/workforce/admin/commercial/");
  await expect(page.getByTestId("commercial-workspace")).toBeVisible({ timeout: 45_000 });
  const context = page.getByTestId("commercial-context-selector");
  await context.getByLabel("Brand").selectOption(fixture.brandId);
  await expect(page.getByText(new RegExp(`Selected brand:\\s*${fixture.brandName}`, "i"))).toBeVisible();
  if (fixture.productId) {
    await expect(context.getByLabel("Product")).toBeEnabled({ timeout: 45_000 });
    await context.getByLabel("Product").selectOption(fixture.productId);
  }
  if (fixture.variantId) {
    await expect(context.getByLabel("Variant")).toBeEnabled({ timeout: 45_000 });
    await context.getByLabel("Variant").selectOption(fixture.variantId);
  }
  if (fixture.outletId) {
    await context.getByLabel("Outlet").selectOption(fixture.outletId);
  }
  await page.getByRole("button", { name: /Promotions & coupons/i }).click();
  await expect(page.getByTestId("promotions-editor")).toBeVisible();
}

export async function confirmConsequence(page: Page, confirmName: RegExp): Promise<void> {
  const dialog = page.getByTestId("consequence-review-dialog");
  await expect(dialog).toBeVisible({ timeout: 60_000 });
  const confirm = dialog.getByRole("button", { name: confirmName });
  await expect(confirm).toBeEnabled({ timeout: 60_000 });
  await confirm.click();
  try {
    await expect(dialog).toHaveCount(0, { timeout: 60_000 });
  } catch (error) {
    const alertText = await dialog.locator('[role="alert"]').innerText().catch(() => "");
    throw new Error(
      `Consequence confirm did not dismiss dialog. Alert: ${alertText || "(none)"}. Original: ${String(error)}`,
    );
  }
}

export async function fetchPromotionDetail(
  page: Page,
  brandId: string,
  promotionId: string,
): Promise<PromotionDetail> {
  return page.evaluate(
    async ({ brandId: b, promotionId: p }) => {
      const response = await fetch(`/api/admin/v1/brands/${b}/promotions/${p}`, {
        credentials: "same-origin",
      });
      const body = (await response.json()) as PromotionDetail & { code?: string };
      if (!response.ok) {
        throw new Error(`promotion detail HTTP ${response.status} ${body.code ?? ""}`);
      }
      return body;
    },
    { brandId, promotionId },
  );
}

export async function listPromotionIds(page: Page, brandId: string): Promise<string[]> {
  return page.evaluate(async (b) => {
    const response = await fetch(`/api/admin/v1/brands/${b}/promotions`, {
      credentials: "same-origin",
    });
    const body = (await response.json()) as { items?: Array<{ id: string }> };
    if (!response.ok) throw new Error(`promotion list HTTP ${response.status}`);
    return (body.items ?? []).map((item) => item.id);
  }, brandId);
}

export async function newCustomerContext(browser: Browser): Promise<BrowserContext> {
  return browser.newContext();
}

function phoneField(page: Page) {
  return page.getByLabel("Mobile number", { exact: true });
}
function codeField(page: Page) {
  return page.getByLabel("6-digit code", { exact: true });
}

export async function customerSignInAtCheckout(page: Page, phoneNumber: string): Promise<void> {
  await expect(page.getByRole("heading", { name: "Sign In" })).toBeVisible({ timeout: 30_000 });
  await phoneField(page).fill(phoneNumber);
  await page.getByRole("button", { name: /send code/i }).click();
  await expect(codeField(page)).toBeVisible();
  await codeField(page).fill(fixedOtp!);
  await page.getByRole("button", { name: /verify code/i }).click();
}

export async function addFirstItemOpenCart(page: Page): Promise<void> {
  await page.goto("/order/");
  await expect(page.getByRole("heading", { name: /^the bar$/i, level: 1 })).toBeVisible({
    timeout: 45_000,
  });
  const addButtons = page.locator("#main-content").getByRole("button", { name: /^add .+/i });
  await expect(addButtons.first()).toBeVisible();
  await addButtons.first().click();
  const headerCartLink = page.locator("header").getByRole("link", { name: /^cart \(1\)$/i });
  await expect(headerCartLink).toBeVisible({ timeout: 15_000 });
  await headerCartLink.click();
  await expect(page.getByRole("heading", { name: /your cart/i })).toBeVisible();
}

export async function continueThroughCheckoutTimingIfPresent(page: Page): Promise<void> {
  const timing = page.getByTestId("checkout-timing-choice");
  if (await timing.isVisible().catch(() => false)) {
    const asap = page.getByTestId("checkout-timing-asap");
    if (await asap.isVisible().catch(() => false)) {
      await asap.click();
    }
    const continueBtn = page.getByTestId("checkout-timing-continue");
    if (await continueBtn.isVisible().catch(() => false)) {
      await continueBtn.click();
    }
  }
}

export async function reachPickupReview(page: Page, phoneNumber: string): Promise<void> {
  await addFirstItemOpenCart(page);
  await page.getByRole("button", { name: /checkout/i }).click();
  await customerSignInAtCheckout(page, phoneNumber);
  await expect(page.getByRole("heading", { name: "Checkout" })).toBeVisible({ timeout: 20_000 });
  const checkout = page.locator("#main-content");
  await expect(checkout.getByTestId("checkout-fulfilment-choice")).toBeVisible({ timeout: 20_000 });
  await checkout.getByTestId("checkout-fulfilment-pickup").click();
  await expect(checkout.getByTestId("checkout-pickup-outlet")).toBeVisible({ timeout: 20_000 });
  await checkout.getByTestId("checkout-pickup-continue").click();
  await continueThroughCheckoutTimingIfPresent(page);
  await expect(page.getByTestId("checkout-review")).toBeVisible({ timeout: 30_000 });
}

export async function applyCouponOnReview(page: Page, code: string): Promise<void> {
  const review = page.getByTestId("checkout-review");
  const input = review.getByTestId("coupon-input");
  await expect(input).toBeVisible();
  await input.fill(code);
  await review.getByTestId("coupon-apply").click();
  await expect(review.getByTestId("coupon-result")).toBeVisible({ timeout: 30_000 });
}

export async function readReviewPayableMinor(page: Page): Promise<number> {
  const amount = await page
    .getByTestId("checkout-review")
    .locator("[data-offer-amount]")
    .first()
    .getAttribute("data-offer-amount");
  if (!amount || !/^\d+$/.test(amount)) {
    throw new Error(`Review payable data-offer-amount missing/invalid: ${amount}`);
  }
  return Number(amount);
}

export async function readReviewOrderSavingMinor(page: Page): Promise<number | null> {
  const node = page
    .getByTestId("checkout-review")
    .locator('[data-offer-component="ORDER_SAVING"]')
    .first();
  if ((await node.count()) === 0) return null;
  const amount = await node.getAttribute("data-offer-amount");
  if (!amount) return null;
  return Number(amount);
}

export async function continueToPayment(page: Page): Promise<void> {
  await page.getByRole("button", { name: /Continue to payment/i }).click();
  await expect(page.getByTestId("checkout-ready")).toBeVisible({ timeout: 30_000 });
  await expect(page.getByTestId("payment-start")).toBeVisible();
}

export async function fetchOwnedOrder(
  page: Page,
  orderId: string,
): Promise<{ id: string; moneySummary: OrderMoneySummary; status?: string }> {
  return page.evaluate(async (id) => {
    const response = await fetch(`/api/v1/orders/${id}`, { credentials: "same-origin" });
    const body = (await response.json()) as {
      id?: string;
      moneySummary?: OrderMoneySummary;
      status?: string;
      code?: string;
    };
    if (!response.ok || !body.id) {
      throw new Error(`order HTTP ${response.status} ${body.code ?? ""}`);
    }
    return {
      id: body.id,
      moneySummary: body.moneySummary ?? {},
      status: body.status,
    };
  }, orderId);
}

export async function captureOrderIdFromConfirmation(page: Page): Promise<string> {
  await expect(page.getByTestId("order-confirmation")).toBeVisible({ timeout: 45_000 });
  const detailLink = page.getByRole("link", { name: /ORD-/i }).first();
  if (await detailLink.isVisible().catch(() => false)) {
    const href = await detailLink.getAttribute("href");
    const match = href?.match(/orderId=([0-9a-f-]{36})/i);
    if (match?.[1]) return match[1];
  }
  const url = page.url();
  const fromUrl = url.match(/orderId=([0-9a-f-]{36})/i);
  if (fromUrl?.[1]) return fromUrl[1];
  // Fall back: open history and read first order id from API via evaluate after navigating.
  await page.getByRole("link", { name: /order history/i }).click();
  await expect(page.getByRole("heading", { name: /My Orders/i, level: 1 })).toBeVisible({
    timeout: 15_000,
  });
  const orderId = await page.evaluate(async () => {
    const response = await fetch("/api/v1/orders", { credentials: "same-origin" });
    const body = (await response.json()) as { items?: Array<{ id: string }> };
    if (!response.ok || !body.items?.[0]?.id) {
      throw new Error(`orders list HTTP ${response.status}`);
    }
    return body.items[0].id;
  });
  return orderId;
}

export function uniquePromoCode(prefix: string): string {
  const stamp = Date.now().toString(36).replace(/[^a-z0-9]/g, "").slice(-8);
  return `${prefix}${stamp}`.slice(0, 24);
}
