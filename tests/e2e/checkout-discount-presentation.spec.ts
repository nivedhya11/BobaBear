import { expect, test, type Locator, type Page } from "@playwright/test";

import { installRazorpayCheckoutMock } from "./support/razorpay-checkout-mock";
import {
  installLocationProviderMocks,
  installMockGoogleMaps,
} from "./support/maps-location-mocks";

/**
 * Browser proof that Checkout Review and Order Detail render the sealed
 * merchandise net. Fake Razorpay. Disposable PostgreSQL via the customer
 * ordering harness. Not a staging release and not Founder UAT.
 *
 * The imported menu has no modifier groups, so modifier-allocation display
 * stays on the unit proof in checkout-line-presentation.test.ts.
 */

const DISCOUNTED = "Purple Rain Taro Boba";
const PLAIN = "Hong Kong Milk Tea Boba";
const GIFT = "Zen Master Matcha Boba";
const MERCH_CODE = "B5MERCH";
const DELIVERY_CODE = "B5DELIV";
const GIFT_CODE = "B5GIFT";

const PHONE = {
  desktop: "9876500281",
  mobile: "9876500282",
} as const;

type SnapshotLine = Readonly<{
  productName: string;
  lineOrigin: string;
  lineTotalPaise: string;
  linePromotionDiscountPaise: string;
  lineTaxablePaise: string;
  lineTaxPaise: string;
}>;

type AuthoritativeSnapshot = Readonly<{
  id: string;
  grandTotalPaise: string;
  taxPaise: string;
  promotionDiscountPaise: string;
  lines: readonly SnapshotLine[];
}>;

function formatPaise(paise: string): string {
  const value = BigInt(paise);
  const negative = value < BigInt(0);
  const abs = negative ? -value : value;
  const rupees = abs / BigInt(100);
  const fraction = (abs % BigInt(100)).toString().padStart(2, "0");
  return `${negative ? "-" : ""}₹${rupees.toString()}.${fraction}`;
}

function positivePaise(raw: string): boolean {
  return /^[1-9][0-9]*$/.test(raw);
}

/** Wire paise from sendJson's bigint replacer: a non-negative decimal string. */
function decimalPaise(raw: unknown): string | null {
  return typeof raw === "string" && /^(0|[1-9][0-9]*)$/.test(raw) ? raw : null;
}

let sealedLineTaxGap: string | null = null;

function asSnapshot(value: unknown): AuthoritativeSnapshot | null {
  if (!value || typeof value !== "object") return null;
  const record = value as Record<string, unknown>;
  const nested = record.checkout;
  if (nested && nested !== value) {
    const fromCheckout = asSnapshot(nested);
    if (fromCheckout) return fromCheckout;
  }
  const raw = record.activeSnapshot;
  if (!raw || typeof raw !== "object") return null;
  const snapshot = raw as Record<string, unknown>;
  if (typeof snapshot.id !== "string" || !Array.isArray(snapshot.lines)) return null;
  if (
    typeof snapshot.grandTotalPaise !== "string" ||
    typeof snapshot.taxPaise !== "string" ||
    typeof snapshot.promotionDiscountPaise !== "string"
  ) {
    return null;
  }
  const lines: SnapshotLine[] = [];
  for (const line of snapshot.lines) {
    if (!line || typeof line !== "object") return null;
    const row = line as Record<string, unknown>;
    if (
      typeof row.productName !== "string" ||
      typeof row.lineTotalPaise !== "string" ||
      typeof row.linePromotionDiscountPaise !== "string"
    ) {
      return null;
    }
    const lineTaxablePaise = decimalPaise(row.lineTaxablePaise);
    const lineTaxPaise = decimalPaise(row.lineTaxPaise);
    if (!lineTaxablePaise || !lineTaxPaise) {
      sealedLineTaxGap =
        "checkout activeSnapshot line is missing sealed lineTaxablePaise or lineTaxPaise";
      return null;
    }
    lines.push({
      productName: row.productName,
      lineOrigin: row.lineOrigin === "complimentary_offer" ? "complimentary_offer" : "cart",
      lineTotalPaise: row.lineTotalPaise,
      linePromotionDiscountPaise: row.linePromotionDiscountPaise,
      lineTaxablePaise,
      lineTaxPaise,
    });
  }
  return {
    id: snapshot.id,
    grandTotalPaise: snapshot.grandTotalPaise,
    taxPaise: snapshot.taxPaise,
    promotionDiscountPaise: snapshot.promotionDiscountPaise,
    lines,
  };
}

function watchCheckout(page: Page): { latest: () => AuthoritativeSnapshot | null } {
  let latest: AuthoritativeSnapshot | null = null;
  page.on("response", (response) => {
    if (!response.ok() || !response.url().includes("/api/v1/checkouts")) return;
    void response
      .json()
      .then((body: unknown) => {
        const snapshot = asSnapshot(body);
        if (snapshot) latest = snapshot;
      })
      .catch(() => undefined);
  });
  return { latest: () => latest };
}

function lineRow(scope: Locator, productName: string): Locator {
  return scope.locator("li").filter({ hasText: productName });
}

function moneySame(left: AuthoritativeSnapshot, right: AuthoritativeSnapshot): boolean {
  if (
    left.grandTotalPaise !== right.grandTotalPaise ||
    left.taxPaise !== right.taxPaise ||
    left.promotionDiscountPaise !== right.promotionDiscountPaise ||
    left.lines.length !== right.lines.length
  ) {
    return false;
  }
  return left.lines.every((line) => {
    const other = right.lines.find(
      (row) => row.productName === line.productName && row.lineOrigin === line.lineOrigin,
    );
    return (
      other?.lineTotalPaise === line.lineTotalPaise &&
      other.linePromotionDiscountPaise === line.linePromotionDiscountPaise &&
      other.lineTaxablePaise === line.lineTaxablePaise &&
      other.lineTaxPaise === line.lineTaxPaise
    );
  });
}

async function installLocationMocks(page: Page): Promise<void> {
  await installMockGoogleMaps(page);
  await installLocationProviderMocks(page);
}

async function signIn(page: Page, phoneNumber: string): Promise<void> {
  const otp = process.env.CUSTOMER_OTP_LOCAL_FIXED_CODE ?? "";
  await expect(page.getByRole("heading", { name: "Sign In" })).toBeVisible();
  await page.getByLabel("Mobile number", { exact: true }).fill(phoneNumber);
  await page.getByRole("button", { name: /send code/i }).click();
  const code = page.getByLabel("6-digit code", { exact: true });
  await expect(code).toBeVisible();
  await code.focus();
  await expect(code).toBeFocused();
  await code.fill(otp);
  await page.getByRole("button", { name: /verify code/i }).click();
  await expect(page.getByRole("heading", { name: "Checkout" })).toBeVisible({ timeout: 20_000 });
}

async function chooseDelivery(page: Page, phoneNumber: string): Promise<void> {
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

async function reachReview(page: Page, phoneNumber: string): Promise<Locator> {
  await installLocationMocks(page);
  await page.goto("/order/");
  await expect(page.getByRole("heading", { name: /^the bar$/i, level: 1 })).toBeVisible();
  const menu = page.locator("#main-content");
  await menu.getByRole("button", { name: `Add ${DISCOUNTED}`, exact: true }).click();
  await expect(page.locator("header").getByRole("link", { name: /^cart \(1\)$/i })).toBeVisible({
    timeout: 15_000,
  });
  await menu.getByRole("button", { name: `Add ${PLAIN}`, exact: true }).click();
  await page.locator("header").getByRole("link", { name: /^cart \(2\)$/i }).click();
  await expect(page.getByRole("heading", { name: /your cart/i })).toBeVisible();
  await page.getByRole("button", { name: /^checkout$/i }).click();
  await signIn(page, phoneNumber);
  await chooseDelivery(page, phoneNumber);
  const asap = page.getByTestId("checkout-timing-asap");
  await expect(page.getByTestId("checkout-timing-choice")).toBeVisible({ timeout: 20_000 });
  await asap.focus();
  await expect(asap).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(asap).toHaveAttribute("aria-pressed", "true");
  const review = page.getByTestId("checkout-review");
  await expect(review).toBeVisible({ timeout: 20_000 });
  return review;
}

async function waitForSnapshot(
  read: () => AuthoritativeSnapshot | null,
  predicate: (snapshot: AuthoritativeSnapshot) => boolean,
): Promise<AuthoritativeSnapshot> {
  const started = Date.now();
  let latest: AuthoritativeSnapshot | null = null;
  while (Date.now() - started < 20_000) {
    if (sealedLineTaxGap) throw new Error(sealedLineTaxGap);
    const current = read();
    if (current) latest = current;
    if (current && predicate(current)) return current;
    await new Promise((resolve) => setTimeout(resolve, 200));
  }
  const summary = latest
    ? {
        id: latest.id,
        grandTotalPaise: latest.grandTotalPaise,
        taxPaise: latest.taxPaise,
        promotionDiscountPaise: latest.promotionDiscountPaise,
        lines: latest.lines,
      }
    : null;
  throw new Error(`authoritative checkout snapshot did not match: ${JSON.stringify(summary)}`);
}

function findLine(snapshot: AuthoritativeSnapshot, productName: string): SnapshotLine {
  const line = snapshot.lines.find((row) => row.productName === productName);
  if (!line) throw new Error(`snapshot has no line named ${productName}`);
  return line;
}

async function assertLinePresentation(
  scope: Locator,
  line: SnapshotLine,
  options?: { showMerchandiseLabel?: boolean },
): Promise<void> {
  const row = lineRow(scope, line.productName);
  await expect(row).toBeVisible();
  const net = formatPaise(line.lineTotalPaise);
  const prices = (await row.innerText()).match(/₹\d+\.\d{2}/g) ?? [];
  expect(prices).toEqual([net]);
  const label = row.getByText("After discount", { exact: true });
  const merchandiseDiscount =
    line.lineOrigin !== "complimentary_offer" && positivePaise(line.linePromotionDiscountPaise);
  const showMerchandiseLabel = options?.showMerchandiseLabel !== false;
  if (merchandiseDiscount && showMerchandiseLabel) {
    await expect(label).toBeVisible();
    await expect(label).not.toHaveAttribute("aria-hidden");
    const text = await row.innerText();
    expect(text.indexOf(net)).toBeGreaterThan(text.indexOf("After discount"));
  } else {
    await expect(label).toHaveCount(0);
  }
  if (line.lineOrigin === "complimentary_offer") {
    await expect(row).toContainText("Included with your offer");
    expect(line.lineTotalPaise).toBe("0");
  }
}

async function assertReviewMoney(review: Locator, snapshot: AuthoritativeSnapshot): Promise<void> {
  await expect(review.getByTestId("price-summary-total")).toHaveAttribute(
    "data-offer-amount",
    snapshot.grandTotalPaise,
  );
  const singleTax = review.getByTestId("price-summary-tax");
  if ((await singleTax.count()) > 0) {
    await expect(singleTax).toContainText(formatPaise(snapshot.taxPaise));
  } else {
    const parts = review.locator("[data-testid^='price-summary-tax-']");
    const count = await parts.count();
    if (count === 0) {
      expect(snapshot.taxPaise).toBe("0");
    } else {
      let sum = BigInt(0);
      for (let index = 0; index < count; index += 1) {
        const text = await parts.nth(index).innerText();
        const match = text.match(/₹(\d+)\.(\d{2})/);
        if (!match?.[1] || !match[2]) throw new Error(`tax row missing an amount: ${text}`);
        sum += BigInt(match[1]) * BigInt(100) + BigInt(match[2]);
      }
      expect(sum.toString()).toBe(snapshot.taxPaise);
    }
  }
  const lines = review.getByTestId("checkout-line-review");
  await expect(lines).toHaveAttribute("aria-label", "Your items");
  for (const line of snapshot.lines) {
    await assertLinePresentation(lines, line);
  }
}

async function applyCoupon(review: Locator, code: string): Promise<void> {
  const input = review.getByTestId("coupon-input");
  await input.focus();
  await expect(input).toBeFocused();
  await input.fill(code);
  await review.getByTestId("coupon-apply").click();
  await expect(review.getByTestId("coupon-result")).toContainText(/Coupon applied\./, {
    timeout: 20_000,
  });
}

async function removeCoupon(page: Page, review: Locator): Promise<void> {
  const remove = review.getByTestId("coupon-remove");
  await remove.focus();
  await expect(remove).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(review.getByTestId("coupon-apply")).toBeVisible({ timeout: 20_000 });
  await expect(review.getByText(/Coupon applied\./)).toHaveCount(0);
}

/**
 * Delivery waiver must not relabel merchandise. A tax-remainder move on the
 * last line is accepted only when that line's sealed taxable amount is
 * unchanged and its displayed total is taxable plus its own sealed tax.
 * The payable drop is the delivery discount plus the order-tax decrease.
 */
function deliveryWaiverKeepsMerchandise(
  snapshot: AuthoritativeSnapshot,
  baseline: AuthoritativeSnapshot,
): boolean {
  const paid = snapshot.lines.filter((line) => line.lineOrigin !== "complimentary_offer");
  if (snapshot.lines.length !== 2 || paid.length !== 2) return false;
  if (!positivePaise(snapshot.promotionDiscountPaise)) return false;
  for (const line of paid) {
    const before = baseline.lines.find(
      (row) => row.productName === line.productName && row.lineOrigin === "cart",
    );
    if (!before) return false;
    if (line.linePromotionDiscountPaise !== "0") return false;
    if (line.lineTaxablePaise !== before.lineTaxablePaise) return false;
    if (BigInt(line.lineTotalPaise) !== BigInt(line.lineTaxablePaise) + BigInt(line.lineTaxPaise)) {
      return false;
    }
  }
  const grandDecrease = BigInt(baseline.grandTotalPaise) - BigInt(snapshot.grandTotalPaise);
  const taxDecrease = BigInt(baseline.taxPaise) - BigInt(snapshot.taxPaise);
  return grandDecrease === BigInt(snapshot.promotionDiscountPaise) + taxDecrease;
}

async function assertReviewMatrix(
  page: Page,
  review: Locator,
  read: () => AuthoritativeSnapshot | null,
): Promise<void> {
  const baseline = await waitForSnapshot(
    read,
    (snapshot) =>
      snapshot.promotionDiscountPaise === "0" &&
      snapshot.lines.length === 2 &&
      snapshot.lines.every((line) => line.linePromotionDiscountPaise === "0"),
  );
  expect(findLine(baseline, DISCOUNTED).linePromotionDiscountPaise).toBe("0");
  expect(findLine(baseline, PLAIN).linePromotionDiscountPaise).toBe("0");
  await assertReviewMoney(review, baseline);
  await expect(review.getByText("After discount")).toHaveCount(0);
  const untouchedId = baseline.id;

  await applyCoupon(review, MERCH_CODE);
  const discounted = await waitForSnapshot(read, (snapshot) => {
    const target = snapshot.lines.find((line) => line.productName === DISCOUNTED);
    const plain = snapshot.lines.find((line) => line.productName === PLAIN);
    return Boolean(
      target &&
        plain &&
        positivePaise(target.linePromotionDiscountPaise) &&
        plain.linePromotionDiscountPaise === "0" &&
        snapshot.lines.length === 2,
    );
  });
  expect(discounted.id).not.toBe(untouchedId);
  expect(BigInt(discounted.grandTotalPaise)).toBeLessThan(BigInt(baseline.grandTotalPaise));
  expect(BigInt(discounted.promotionDiscountPaise)).toBeGreaterThan(BigInt(0));
  await expect(review.locator('[data-offer-component="ORDER_SAVING"]')).toHaveAttribute(
    "data-offer-amount",
    discounted.promotionDiscountPaise,
  );
  await expect(review.locator('[data-offer-component="DELIVERY_SAVING"]')).toHaveCount(0);
  await assertReviewMoney(review, discounted);
  await expect(review.getByText("After discount")).toHaveCount(1);
  expect(page.viewportSize()?.width).toBeGreaterThan(0);
  const listBox = await review.getByTestId("checkout-line-review").boundingBox();
  const viewport = page.viewportSize();
  if (!listBox || !viewport) throw new Error("review line list was not laid out");
  expect(listBox.x).toBeGreaterThanOrEqual(0);
  expect(listBox.x + listBox.width).toBeLessThanOrEqual(viewport.width + 1);

  await removeCoupon(page, review);
  const restored = await waitForSnapshot(read, (snapshot) => moneySame(snapshot, baseline));
  await assertReviewMoney(review, restored);
  await expect(review.getByText("After discount")).toHaveCount(0);
  await expect(review.getByTestId("payment-start")).toHaveCount(0);

  await applyCoupon(review, DELIVERY_CODE);
  const deliveryOnly = await waitForSnapshot(read, (snapshot) =>
    deliveryWaiverKeepsMerchandise(snapshot, baseline),
  );
  expect(BigInt(deliveryOnly.grandTotalPaise)).toBeLessThan(BigInt(baseline.grandTotalPaise));
  await expect(review.locator('[data-offer-component="DELIVERY_SAVING"]')).toHaveAttribute(
    "data-offer-amount",
    deliveryOnly.promotionDiscountPaise,
  );
  await expect(review.locator('[data-offer-component="ORDER_SAVING"]')).toHaveCount(0);
  await assertReviewMoney(review, deliveryOnly);
  await expect(review.getByText("After discount")).toHaveCount(0);

  await removeCoupon(page, review);
  await waitForSnapshot(read, (snapshot) => moneySame(snapshot, baseline));

  await applyCoupon(review, GIFT_CODE);
  const withGift = await waitForSnapshot(read, (snapshot) =>
    snapshot.lines.some((line) => line.productName === GIFT && line.lineOrigin === "complimentary_offer"),
  );
  const gift = findLine(withGift, GIFT);
  expect(gift.lineTotalPaise).toBe("0");
  expect(findLine(withGift, DISCOUNTED).linePromotionDiscountPaise).toBe("0");
  expect(findLine(withGift, PLAIN).linePromotionDiscountPaise).toBe("0");
  await assertReviewMoney(review, withGift);
  await expect(review.getByText("After discount")).toHaveCount(0);
  await expect(review.getByTestId("checkout-line-review").getByText("Included with your offer")).toHaveCount(1);
  await expect(review.getByTestId("complimentary-line")).toContainText("Included with your offer");
  await expect(review.getByTestId("complimentary-line").getByText("After discount")).toHaveCount(0);

  await removeCoupon(page, review);
  await waitForSnapshot(read, (snapshot) => moneySame(snapshot, baseline));
  await expect(review.getByText("After discount")).toHaveCount(0);
}

test.beforeEach(() => {
  test.skip(
    !/^\d{6}$/.test(process.env.CUSTOMER_OTP_LOCAL_FIXED_CODE ?? ""),
    "CUSTOMER_OTP_LOCAL_FIXED_CODE must be set.",
  );
});

test("desktop review and order detail follow sealed line nets", async ({ page }) => {
  test.setTimeout(240_000);
  expect(page.viewportSize()?.width).toBe(1440);
  await installRazorpayCheckoutMock(page, "succeed");
  const watched = watchCheckout(page);
  let paymentSnapshotId: string | null = null;
  let paymentPosts = 0;
  page.on("response", (response) => {
    const url = response.url();
    if (response.request().method() !== "POST" || !url.includes("/api/v1/payments")) return;
    if (url.includes("/client-evidence") || url.includes("/state") || url.includes("/retry")) return;
    paymentPosts += 1;
    if (!response.ok()) return;
    void response
      .json()
      .then((body: unknown) => {
        const payment = (body as { payment?: { checkoutSnapshotId?: unknown } }).payment;
        if (typeof payment?.checkoutSnapshotId === "string") {
          paymentSnapshotId = payment.checkoutSnapshotId;
        }
      })
      .catch(() => undefined);
  });

  const review = await reachReview(page, PHONE.desktop);
  await assertReviewMatrix(page, review, watched.latest);
  expect(paymentPosts).toBe(0);

  await applyCoupon(review, MERCH_CODE);
  const payable = await waitForSnapshot(watched.latest, (snapshot) => {
    const target = snapshot.lines.find((line) => line.productName === DISCOUNTED);
    return Boolean(target && positivePaise(target.linePromotionDiscountPaise));
  });
  await assertReviewMoney(review, payable);
  const sealedBeforePayment = {
    id: payable.id,
    grandTotalPaise: payable.grandTotalPaise,
    taxPaise: payable.taxPaise,
    promotionDiscountPaise: payable.promotionDiscountPaise,
  };

  await page.getByRole("button", { name: /Continue to payment/i }).click();
  const payment = page.getByTestId("checkout-ready");
  await expect(payment).toBeVisible({ timeout: 20_000 });
  const paymentLines = payment.getByTestId("checkout-line-review");
  await expect(paymentLines.getByText("After discount")).toHaveCount(0);
  await assertLinePresentation(paymentLines, findLine(payable, DISCOUNTED), {
    showMerchandiseLabel: false,
  });
  await assertLinePresentation(paymentLines, findLine(payable, PLAIN), {
    showMerchandiseLabel: false,
  });
  const stillSealed = await waitForSnapshot(
    watched.latest,
    (snapshot) => snapshot.id === sealedBeforePayment.id,
  );
  expect(stillSealed.grandTotalPaise).toBe(sealedBeforePayment.grandTotalPaise);
  expect(stillSealed.taxPaise).toBe(sealedBeforePayment.taxPaise);
  expect(stillSealed.promotionDiscountPaise).toBe(sealedBeforePayment.promotionDiscountPaise);

  await page.getByTestId("payment-start").click();
  await expect(page.getByTestId("order-confirmation")).toBeVisible({ timeout: 30_000 });
  await expect.poll(() => paymentSnapshotId, { timeout: 20_000 }).toBe(sealedBeforePayment.id);
  expect(paymentPosts).toBe(1);

  await page.getByRole("link", { name: "View order" }).click();
  const detail = page.getByTestId("order-detail");
  await expect(detail).toBeVisible({ timeout: 20_000 });
  await assertLinePresentation(detail, findLine(payable, DISCOUNTED));
  await assertLinePresentation(detail, findLine(payable, PLAIN));
  await expect(detail.getByText("After discount")).toHaveCount(1);
  await expect(detail.getByText("Total payable")).toBeVisible();
  await expect(detail.getByText(formatPaise(payable.grandTotalPaise)).last()).toBeVisible();
  if (positivePaise(payable.taxPaise)) {
    await expect(detail.getByText("Tax", { exact: true })).toBeVisible();
    await expect(detail.getByText(formatPaise(payable.taxPaise)).first()).toBeVisible();
  }
  if (positivePaise(payable.promotionDiscountPaise)) {
    await expect(detail.getByText(formatPaise(payable.promotionDiscountPaise)).first()).toBeVisible();
  }
});

test("mobile: narrow review keeps per-line labels and restores payable", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "mobile-chromium", "Mobile viewport evidence only");
  test.setTimeout(240_000);
  expect(page.viewportSize()?.width).toBeLessThanOrEqual(430);
  const watched = watchCheckout(page);
  const review = await reachReview(page, PHONE.mobile);
  await assertReviewMatrix(page, review, watched.latest);
  await expect(page.getByTestId("payment-start")).toHaveCount(0);
});
