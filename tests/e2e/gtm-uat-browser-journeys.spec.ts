import { expect, test, type Browser, type BrowserContext, type Page, type TestInfo } from "@playwright/test";

import { installRazorpayCheckoutMock } from "./support/razorpay-checkout-mock";
import {
  installLocationProviderMocks,
  installMockGoogleMaps,
} from "./support/maps-location-mocks";

/**
 * Browser E2E on the disposable customer-ordering harness (fake Razorpay).
 * Not Founder UAT. Not a unit or jsdom result.
 *
 * Modifier selection-order continuity uses the disposable multi-option item
 * seeded by scripts/database/gtm-uat-browser-fixtures.ts under
 * E2E_GTM_UAT_FIXTURES=1. Bundle/nested-modifier browser proof remains blocked
 * (no customer bundle selection projection/UI).
 *
 * Database controls receive the cart, outlet, line, checkout, and snapshot
 * the browser captured. The per-run token is never written to logs.
 */

const FIXED_OTP_CODE = process.env.CUSTOMER_OTP_LOCAL_FIXED_CODE;
const PUBLIC_CONTROL_TOKEN = "gtm-uat-browser-control";
const GTM_MODIFIER_ITEM_NAME = "GTM Custom Drink";
const GTM_MODIFIER_OPTION_A = "Pearl";
const GTM_MODIFIER_OPTION_B = "Jelly";

const PHONE = {
  scheduledDelivery: "9876500271",
  bindingDrift: "9876500272",
  isolationA: "9876500273",
  isolationB: "9876500274",
  mobileCoupon: "9876500275",
  modifierOrder: "9876500276",
} as const;

type BrowserCartModifier = Readonly<{
  variantModifierGroupId: string;
  modifierGroupOptionId: string;
  quantity: number;
}>;
type BrowserCartLine = Readonly<{
  id: string;
  variantId: string;
  modifiers?: readonly BrowserCartModifier[];
}>;
type BrowserCart = Readonly<{
  id: string;
  ownerMode?: string;
  revision: string | number;
  lines: readonly BrowserCartLine[];
}>;
type PromotionEffect = Readonly<{ id?: string; effectKind?: string; promotionCode?: string }>;
type BrowserCheckout = Readonly<{
  id: string;
  status: string;
  revision: string | number;
  customerAuthUserId?: string;
  activeSnapshotId?: string | null;
  activeSnapshot?: { id?: string; promotionEffects?: readonly PromotionEffect[] } | null;
}>;
type OwnedCart = Readonly<{
  cartId: string;
  outletId: string;
  lineId: string;
  siblingLineId: string;
  variantId: string;
  siblingVariantId: string;
  customerAuthUserId: null;
  expectedRevision: string;
}>;
type OwnedCheckout = Readonly<{
  checkoutId: string;
  activeSnapshotId: string;
  promotionEffectId: string;
  expectedPromotionCode: string;
  expectedStatus: "READY_FOR_PAYMENT";
  customerAuthUserId: string;
  expectedRevision: string;
}>;

test.beforeEach(() => {
  test.skip(!FIXED_OTP_CODE, "CUSTOMER_OTP_LOCAL_FIXED_CODE must be set.");
  const token = process.env.E2E_HARNESS_CONTROL_TOKEN ?? "";
  const runId = process.env.E2E_HARNESS_RUN_ID ?? "";
  test.skip(token.length < 32 || token === PUBLIC_CONTROL_TOKEN, "per-run control token must be set.");
  test.skip(!/^[0-9a-f-]{36}$/i.test(runId), "per-run control identity must be set.");
});

function controlToken(): string {
  const token = process.env.E2E_HARNESS_CONTROL_TOKEN ?? "";
  if (token.length < 32 || token === PUBLIC_CONTROL_TOKEN) {
    throw new Error("per-run control token is not configured");
  }
  return token;
}

function controlRunId(): string {
  const runId = process.env.E2E_HARNESS_RUN_ID ?? "";
  if (!/^[0-9a-f-]{36}$/i.test(runId)) throw new Error("per-run control identity is not configured");
  return runId;
}

function phoneField(page: Page) {
  return page.getByLabel("Mobile number", { exact: true });
}

function codeField(page: Page) {
  return page.getByLabel("6-digit code", { exact: true });
}

function visibleCheckout(page: Page) {
  return page.locator("#main-content").locator("button:visible", { hasText: /^Checkout$/ });
}

async function control(page: Page, input: Record<string, unknown>): Promise<Record<string, unknown>> {
  const response = await page.request.post("/__e2e/control", {
    headers: { "x-e2e-control-token": controlToken() },
    data: { ...input, runId: input.runId ?? controlRunId() },
  });
  const text = await response.text();
  if (!response.ok()) throw new Error(`control http ${response.status()}`);
  return JSON.parse(text) as Record<string, unknown>;
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

function watchOwnedIdentity(page: Page): {
  snapshot: () => Promise<{
    cart: BrowserCart | null;
    outletId: string | null;
    checkout: BrowserCheckout | null;
    addedVariantIds: readonly string[];
  }>;
} {
  const addedVariantIds: string[] = [];
  let cart: BrowserCart | null = null;
  let outletId: string | null = null;
  let checkout: BrowserCheckout | null = null;
  const pending: Array<Promise<void>> = [];

  page.on("request", (request) => {
    if (request.method() !== "POST" || !request.url().includes("/api/v1/cart/lines")) return;
    try {
      const body = request.postDataJSON() as { variantId?: unknown };
      if (typeof body?.variantId === "string") addedVariantIds.push(body.variantId);
    } catch {
      /* The cart response remains the identity source. */
    }
  });

  page.on("response", (response) => {
    if (!response.ok()) return;
    const url = response.url();
    const cartHit = url.includes("/api/v1/cart") && !url.includes("/cart/evaluate");
    const serviceHit = url.includes("/api/v1/serviceability/evaluate");
    const checkoutHit = url.includes("/api/v1/checkouts");
    if (!cartHit && !serviceHit && !checkoutHit) return;
    pending.push(
      (async () => {
        let json: {
          cart?: BrowserCart;
          decision?: { selectedOutletId?: string };
          checkout?: BrowserCheckout;
        };
        try {
          json = (await response.json()) as typeof json;
        } catch {
          return;
        }
        if (cartHit && json.cart?.id && Array.isArray(json.cart.lines)) cart = json.cart;
        if (serviceHit && typeof json.decision?.selectedOutletId === "string") {
          outletId = json.decision.selectedOutletId;
        }
        if (
          checkoutHit &&
          json.checkout?.status === "READY_FOR_PAYMENT" &&
          json.checkout.activeSnapshotId
        ) {
          checkout = json.checkout;
        }
      })(),
    );
  });

  return {
    snapshot: async () => {
      for (let guard = 0; pending.length > 0 && guard < 8; guard += 1) {
        const batch = pending.splice(0, pending.length);
        await Promise.all(batch);
      }
      return { cart, outletId, checkout, addedVariantIds: [...addedVariantIds] };
    },
  };
}

function uniqueLine(lines: readonly BrowserCartLine[], variantId: string): BrowserCartLine {
  const matches = lines.filter((line) => line.variantId === variantId);
  if (matches.length !== 1) {
    throw new Error(`browser cart did not contain exactly one line for an added item (${matches.length})`);
  }
  return matches[0]!;
}

function requireOwnedCart(snapshot: {
  cart: BrowserCart | null;
  outletId: string | null;
  addedVariantIds: readonly string[];
}): OwnedCart {
  if (!snapshot.outletId) throw new Error("serviceability did not return an outlet for this cart");
  const cart = snapshot.cart;
  if (!cart?.id || cart.lines.length < 2) throw new Error("browser cart did not return two lines");
  if (cart.ownerMode !== "guest") throw new Error("this cart journey expected a guest cart");
  if (snapshot.addedVariantIds.length < 2) throw new Error("browser did not record two cart-line adds");
  const target = uniqueLine(cart.lines, snapshot.addedVariantIds[0]!);
  const sibling = uniqueLine(cart.lines, snapshot.addedVariantIds[1]!);
  if (target.id === sibling.id) throw new Error("browser cart lines were not distinct");
  return {
    cartId: cart.id,
    outletId: snapshot.outletId,
    lineId: target.id,
    siblingLineId: sibling.id,
    variantId: target.variantId,
    siblingVariantId: sibling.variantId,
    customerAuthUserId: null,
    expectedRevision: String(cart.revision),
  };
}

function requireOwnedCheckout(checkout: BrowserCheckout | null): OwnedCheckout {
  if (!checkout || checkout.status !== "READY_FOR_PAYMENT" || !checkout.id) {
    throw new Error("browser checkout was not READY_FOR_PAYMENT");
  }
  const snapshotId = checkout.activeSnapshotId;
  const snapshot = checkout.activeSnapshot;
  if (!snapshotId || !snapshot || snapshot.id !== snapshotId) {
    throw new Error("browser checkout snapshot was not the active snapshot");
  }
  const effects = snapshot.promotionEffects ?? [];
  const effect =
    effects.find(
      (row) =>
        row.effectKind === "applied_promotion" &&
        typeof row.id === "string" &&
        typeof row.promotionCode === "string",
    ) ??
    effects.find((row) => typeof row.id === "string" && typeof row.promotionCode === "string");
  if (!effect?.id || !effect.promotionCode) throw new Error("ready checkout had no promotion effect to bind");
  if (typeof checkout.customerAuthUserId !== "string" || checkout.customerAuthUserId.length === 0) {
    throw new Error("ready checkout had no customer identity");
  }
  return {
    checkoutId: checkout.id,
    activeSnapshotId: snapshotId,
    promotionEffectId: effect.id,
    expectedPromotionCode: effect.promotionCode,
    expectedStatus: "READY_FOR_PAYMENT",
    customerAuthUserId: checkout.customerAuthUserId,
    expectedRevision: String(checkout.revision),
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

/**
 * Plain Add buttons only. "Add one …" is a cart stepper; Customisable rows open
 * the modifier dialog instead of adding a configured line immediately.
 */
async function plainAddAriaLabels(page: Page): Promise<string[]> {
  const menu = page.locator("#main-content");
  const buttons = menu.getByRole("button", { name: /^add (?!one\b)/i });
  await expect(buttons.first()).toBeVisible({ timeout: 20_000 });
  const count = await buttons.count();
  const labels: string[] = [];
  for (let i = 0; i < count; i += 1) {
    const button = buttons.nth(i);
    const row = button.locator("xpath=ancestor::li[1]");
    if ((await row.getByText("Customisable", { exact: true }).count()) > 0) continue;
    const label = await button.getAttribute("aria-label");
    if (label) labels.push(label);
  }
  return labels;
}

async function addTwoMenuItems(page: Page): Promise<void> {
  const menu = page.locator("#main-content");
  const labels = await plainAddAriaLabels(page);
  if (labels.length < 2 || labels[0] === labels[1]) {
    throw new Error("menu did not expose two distinct plain products to add");
  }
  await menu.getByRole("button", { name: labels[0]!, exact: true }).click();
  await expect(page.locator("header").getByRole("link", { name: /^cart \(1\)$/i })).toBeVisible({
    timeout: 15_000,
  });
  await menu.getByRole("button", { name: labels[1]!, exact: true }).click();
  await expect(page.locator("header").getByRole("link", { name: /^cart \(2\)$/i })).toBeVisible({
    timeout: 15_000,
  });
}

async function addFirstPlainMenuItem(page: Page): Promise<void> {
  const labels = await plainAddAriaLabels(page);
  if (labels.length < 1) throw new Error("menu did not expose a plain product to add");
  await page.locator("#main-content").getByRole("button", { name: labels[0]!, exact: true }).click();
  await expect(page.locator("header").getByRole("link", { name: /^cart \(1\)$/i })).toBeVisible({
    timeout: 15_000,
  });
}

async function buildTwoLineGuestCart(page: Page): Promise<OwnedCart> {
  const watch = watchOwnedIdentity(page);
  await installLocationMocks(page, { stubServiceability: false });
  await page.goto("/order/");
  await expect(page.getByRole("heading", { name: /^the bar$/i, level: 1 })).toBeVisible();
  // Add both lines before location confirmation. Confirming the pin reloads
  // the outlet menu; adding during that reload can drop the second line.
  await addTwoMenuItems(page);
  await confirmServiceableContext(page, { navigate: false });
  await expect.poll(async () => (await watch.snapshot()).outletId, { timeout: 20_000 }).toBeTruthy();
  await expect
    .poll(async () => (await watch.snapshot()).cart?.lines.length ?? 0, { timeout: 20_000 })
    .toBeGreaterThanOrEqual(2);
  await expect(page.locator("header").getByRole("link", { name: /^cart \(2\)$/i })).toBeVisible();
  return requireOwnedCart(await watch.snapshot());
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

async function reachPaymentStart(page: Page, phoneNumber: string): Promise<OwnedCheckout> {
  const watch = watchOwnedIdentity(page);
  await installLocationMocks(page);
  await page.goto("/order/");
  await expect(page.getByRole("heading", { name: /^the bar$/i, level: 1 })).toBeVisible();
  await addFirstPlainMenuItem(page);
  await page.locator("header").getByRole("link", { name: /^cart \(1\)$/i }).click();
  await expect(page.getByRole("heading", { name: /your cart/i })).toBeVisible();
  await page.getByRole("button", { name: /^checkout$/i }).click();
  await signIn(page, phoneNumber);
  await chooseDeliveryAndAddress(page, phoneNumber);
  const asap = page.getByTestId("checkout-timing-asap");
  await expect(page.getByTestId("checkout-timing-choice")).toBeVisible({ timeout: 20_000 });
  await asap.click();
  await expect(page.getByTestId("checkout-review")).toBeVisible({ timeout: 20_000 });
  await page.getByRole("button", { name: /Continue to payment/i }).click();
  await expect(page.getByTestId("payment-start")).toBeVisible({ timeout: 20_000 });
  await expect.poll(async () => (await watch.snapshot()).checkout?.status).toBe("READY_FOR_PAYMENT");
  return requireOwnedCheckout((await watch.snapshot()).checkout);
}

function cartMarkInput(owned: OwnedCart, overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    action: "mark-first-cart-line-unavailable",
    cartId: owned.cartId,
    outletId: owned.outletId,
    lineId: owned.lineId,
    siblingLineId: owned.siblingLineId,
    customerAuthUserId: owned.customerAuthUserId,
    expectedRevision: owned.expectedRevision,
    ...overrides,
  };
}

function checkoutDriftInput(
  owned: OwnedCheckout,
  overrides: Record<string, unknown> = {},
): Record<string, unknown> {
  return {
    action: "drift-sealed-promotion-code",
    checkoutId: owned.checkoutId,
    activeSnapshotId: owned.activeSnapshotId,
    promotionEffectId: owned.promotionEffectId,
    expectedPromotionCode: owned.expectedPromotionCode,
    expectedStatus: owned.expectedStatus,
    customerAuthUserId: owned.customerAuthUserId,
    expectedRevision: owned.expectedRevision,
    ...overrides,
  };
}

function effectCodes(body: Record<string, unknown>): string[] {
  const checkout = body.checkout as { effects?: Array<{ promotionCode?: string }> } | undefined;
  return (checkout?.effects ?? []).map((effect) => effect.promotionCode ?? "");
}

async function payablePaise(review: ReturnType<Page["getByTestId"]>): Promise<bigint> {
  const total = review.getByTestId("price-summary-total");
  await expect(total).toBeVisible({ timeout: 20_000 });
  const raw = await total.getAttribute("data-offer-amount");
  if (!raw || !/^\d+$/.test(raw)) throw new Error("review payable amount was not rendered");
  return BigInt(raw);
}

/**
 * Invalid coupon, apply, keyboard remove, and payable restoration on Review.
 * Does not start payment and does not choose a #385 price-presentation option.
 */
async function assertReviewCouponRecalculation(page: Page): Promise<void> {
  const review = page.getByTestId("checkout-review");
  await expect(review).toBeVisible();
  const before = await payablePaise(review);
  const input = review.getByTestId("coupon-input");
  await input.focus();
  await expect(input).toBeFocused();
  await input.fill("NOT-A-CODE");
  await review.getByTestId("coupon-apply").click();
  const invalid = review.getByTestId("coupon-result");
  await expect(invalid).toContainText("That code isn't valid. Check it and try again.", {
    timeout: 20_000,
  });
  await expect(invalid).toHaveAttribute("role", "alert");
  await expect(input).toHaveAttribute("aria-invalid", "true");
  await expect(input).toBeFocused();
  expect(await payablePaise(review)).toBe(before);

  await input.fill("e2e10");
  await review.getByTestId("coupon-apply").click();
  await expect(review.getByTestId("coupon-result")).toContainText("Coupon applied.", {
    timeout: 20_000,
  });
  const discounted = await payablePaise(review);
  expect(discounted).toBeLessThan(before);
  await expect(review.locator('[data-offer-component="ORDER_SAVING"]')).toBeVisible();

  const remove = review.getByTestId("coupon-remove");
  await remove.focus();
  await expect(remove).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(review.getByTestId("coupon-apply")).toBeVisible({ timeout: 20_000 });
  await expect(review.getByText("Coupon applied.")).toHaveCount(0);
  const restored = await payablePaise(review);
  expect(restored).toBe(before);
  expect(restored).toBeGreaterThan(discounted);
}

async function assertPaymentCouponReadOnly(page: Page): Promise<void> {
  await expect(page.getByTestId("checkout-ready")).toBeVisible({ timeout: 20_000 });
  await expect(page.getByTestId("coupon-input")).toHaveCount(0);
  await expect(page.getByTestId("coupon-apply")).toHaveCount(0);
  await expect(page.getByTestId("coupon-change")).toHaveCount(0);
  await expect(page.getByTestId("coupon-remove")).toHaveCount(0);
  await page.locator("#main-content").focus();
  await expect(page.locator("#main-content")).toBeFocused();
  const couponHits: string[] = [];
  let reachedPay = false;
  for (let i = 0; i < 25; i += 1) {
    await page.keyboard.press("Tab");
    const marker = await page.evaluate(() => {
      const el = document.activeElement as HTMLElement | null;
      return el?.getAttribute("data-testid") ?? "";
    });
    if (marker.startsWith("coupon-")) couponHits.push(marker);
    if (marker === "payment-start") {
      reachedPay = true;
      break;
    }
  }
  expect(couponHits).toEqual([]);
  expect(reachedPay).toBe(true);
}

function canonicalModifierKey(modifier: BrowserCartModifier): string {
  return `${modifier.variantModifierGroupId}|${modifier.modifierGroupOptionId}`;
}

function assertCanonicalModifierOrder(modifiers: readonly BrowserCartModifier[]): void {
  expect(modifiers.length).toBeGreaterThanOrEqual(2);
  const keys = modifiers.map(canonicalModifierKey);
  expect(keys).toEqual([...keys].sort((a, b) => (a < b ? -1 : a > b ? 1 : 0)));
}

async function addConfiguredModifierItem(page: Page): Promise<BrowserCartLine> {
  const watch = watchOwnedIdentity(page);
  const customize = page
    .locator("#main-content")
    .getByRole("button", { name: new RegExp(`^add ${GTM_MODIFIER_ITEM_NAME}$`, "i") });
  await expect(customize).toBeVisible({ timeout: 20_000 });
  await customize.click();
  const dialog = page.getByRole("dialog", {
    name: new RegExp(`^customize ${GTM_MODIFIER_ITEM_NAME}$`, "i"),
  });
  await expect(dialog).toBeVisible({ timeout: 20_000 });
  await dialog.getByRole("button", { name: `Increase ${GTM_MODIFIER_OPTION_A}` }).click();
  await dialog.getByRole("button", { name: `Increase ${GTM_MODIFIER_OPTION_B}` }).click();
  await dialog.getByRole("button", { name: /^Add to cart/i }).click();
  await expect(page.locator("header").getByRole("link", { name: /^cart \(1\)$/i })).toBeVisible({
    timeout: 15_000,
  });
  await expect
    .poll(async () => (await watch.snapshot()).cart?.lines.length ?? 0, { timeout: 20_000 })
    .toBe(1);
  const cart = (await watch.snapshot()).cart;
  if (!cart) throw new Error("configured modifier cart was not observed");
  const line = cart.lines[0];
  if (!line) throw new Error("configured modifier cart had no lines");
  const modifiers = line.modifiers ?? [];
  expect(modifiers).toHaveLength(2);
  assertCanonicalModifierOrder(modifiers);
  return line;
}

async function assertItemUnavailableRecovery(page: Page): Promise<void> {
  const menuFailures = trackMenuFailures(page);
  const owned = await buildTwoLineGuestCart(page);
  const marked = await control(page, cartMarkInput(owned));
  expect(marked.ok, JSON.stringify({ ok: marked.ok, reason: marked.reason, mutated: marked.mutated })).toBe(
    true,
  );
  expect(marked.mutated).toBe(1);
  expect(marked.cartId).toBe(owned.cartId);
  expect(marked.outletId).toBe(owned.outletId);
  expect(marked.lineId).toBe(owned.lineId);
  expect(marked.siblingLineId).toBe(owned.siblingLineId);
  const retry = page.getByTestId("commerce-retry-panel");
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
  const restored = await control(page, {
    action: "restore-availability",
    outletId: owned.outletId,
    variantId: marked.variantId,
  });
  expect(restored.ok).toBe(true);
  expect(restored.restored).toBe(1);
  expect(restored.mutated).toBe(1);
}

async function secondContext(
  browser: Browser,
  testInfo: TestInfo,
  viewport: { width: number; height: number } | null,
): Promise<{ context: BrowserContext; page: Page }> {
  const context = await browser.newContext({
    baseURL: testInfo.project.use.baseURL,
    viewport: viewport ?? { width: 1440, height: 900 },
  });
  const page = await context.newPage();
  return { context, page };
}

test("control rejects an empty or wrong token and a foreign run without mutating", async ({ page }) => {
  const missing = await page.request.post("/__e2e/control", {
    data: { action: "counts", runId: controlRunId() },
  });
  expect(missing.status()).toBe(404);

  const wrong = await page.request.post("/__e2e/control", {
    headers: { "x-e2e-control-token": "0".repeat(32) },
    data: { action: "counts", runId: controlRunId() },
  });
  expect(wrong.status()).toBe(404);

  const publicToken = await page.request.post("/__e2e/control", {
    headers: { "x-e2e-control-token": PUBLIC_CONTROL_TOKEN },
    data: { action: "mark-first-cart-line-unavailable", runId: controlRunId() },
  });
  expect(publicToken.status()).toBe(404);

  const foreignRun = await control(page, {
    action: "mark-first-cart-line-unavailable",
    runId: "00000000-0000-4000-8000-000000000099",
    cartId: "00000000-0000-4000-8000-000000000098",
    outletId: "00000000-0000-4000-8000-000000000097",
    lineId: "00000000-0000-4000-8000-000000000096",
    siblingLineId: "00000000-0000-4000-8000-000000000095",
    customerAuthUserId: null,
    expectedRevision: "1",
  });
  expect(foreignRun.ok).toBe(false);
  expect(foreignRun.reason).toBe("RUN_MISMATCH");
  expect(foreignRun.mutated).toBe(0);
});

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
  await page.goto("/order/");
  await expect(page.getByRole("heading", { name: /^the bar$/i, level: 1 })).toBeVisible();
  await addFirstPlainMenuItem(page);
  const cartLink = page.locator("header").getByRole("link", { name: /^cart \(1\)$/i });
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

  await expect(page.getByTestId("checkout-review")).toBeVisible({ timeout: 20_000 });
  await assertReviewCouponRecalculation(page);
  const review = page.getByTestId("checkout-review");
  const couponInput = review.getByTestId("coupon-input");
  await couponInput.fill("e2e10");
  await review.getByTestId("coupon-apply").click();
  await expect(review.getByTestId("coupon-result")).toContainText("Coupon applied.", {
    timeout: 20_000,
  });
  await page.getByRole("button", { name: /Continue to payment/i }).click();
  await assertPaymentCouponReadOnly(page);
  await page.getByTestId("payment-start").click();

  await expect(page.getByTestId("order-confirmation")).toBeVisible({ timeout: 30_000 });
  await expect(page.getByTestId("order-status")).toHaveText(/order received/i);
  await expect(page.getByTestId("order-fulfilment-timing")).toContainText(/window/i);
  await page.getByRole("link", { name: /order history/i }).click();
  await expect(page.getByTestId("order-history-item").first()).toBeVisible();
});

test("mobile: review coupon removal restores the payable total", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "mobile-chromium", "Mobile viewport evidence only");
  test.setTimeout(180_000);
  expect(page.viewportSize()?.width).toBeLessThanOrEqual(430);
  await installLocationMocks(page);
  await page.goto("/order/");
  await expect(page.getByRole("heading", { name: /^the bar$/i, level: 1 })).toBeVisible();
  await addFirstPlainMenuItem(page);
  await page.locator("header").getByRole("link", { name: /^cart \(1\)$/i }).click();
  await expect(page.getByRole("heading", { name: /your cart/i })).toBeVisible();
  await page.getByRole("button", { name: /^checkout$/i }).click();
  await signIn(page, PHONE.mobileCoupon);
  await chooseDeliveryAndAddress(page, PHONE.mobileCoupon);
  await expect(page.getByTestId("checkout-timing-choice")).toBeVisible({ timeout: 20_000 });
  const asap = page.getByTestId("checkout-timing-asap");
  await asap.click();
  await expect(asap).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByTestId("checkout-review")).toBeVisible({ timeout: 20_000 });
  await assertReviewCouponRecalculation(page);
  await expect(page.getByTestId("payment-start")).toHaveCount(0);
});

test("modifier selection order survives cart reload, review, and fake payment start", async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== "desktop-chromium", "Desktop modifier continuity evidence");
  test.setTimeout(180_000);
  await installRazorpayCheckoutMock(page, "succeed");
  await installLocationMocks(page);
  await page.goto("/order/");
  await expect(page.getByRole("heading", { name: /^the bar$/i, level: 1 })).toBeVisible();
  const configured = await addConfiguredModifierItem(page);

  await page.locator("header").getByRole("link", { name: /^cart \(1\)$/i }).click();
  await expect(page.getByRole("heading", { name: /your cart/i })).toBeVisible();
  await expect(page.getByText(GTM_MODIFIER_OPTION_A, { exact: false })).toBeVisible();
  await expect(page.getByText(GTM_MODIFIER_OPTION_B, { exact: false })).toBeVisible();

  await page.reload();
  await expect(page.getByRole("heading", { name: /your cart/i })).toBeVisible({ timeout: 20_000 });
  await expect(page.getByText(GTM_MODIFIER_OPTION_A, { exact: false })).toBeVisible();
  await expect(page.getByText(GTM_MODIFIER_OPTION_B, { exact: false })).toBeVisible();

  const watch = watchOwnedIdentity(page);
  await page.goto("/order/cart/");
  await expect(page.getByRole("heading", { name: /your cart/i })).toBeVisible({ timeout: 20_000 });
  await expect
    .poll(async () => (await watch.snapshot()).cart?.lines[0]?.modifiers?.length ?? 0, {
      timeout: 20_000,
    })
    .toBe(2);
  const reloaded = (await watch.snapshot()).cart?.lines[0];
  expect(reloaded?.id).toBe(configured.id);
  assertCanonicalModifierOrder(reloaded?.modifiers ?? []);
  expect((reloaded?.modifiers ?? []).map(canonicalModifierKey)).toEqual(
    (configured.modifiers ?? []).map(canonicalModifierKey),
  );

  await page.getByRole("button", { name: /^checkout$/i }).click();
  await signIn(page, PHONE.modifierOrder);
  await chooseDeliveryAndAddress(page, PHONE.modifierOrder);
  await expect(page.getByTestId("checkout-timing-choice")).toBeVisible({ timeout: 20_000 });
  const asap = page.getByTestId("checkout-timing-asap");
  await asap.click();
  await expect(asap).toHaveAttribute("aria-pressed", "true");

  const review = page.getByTestId("checkout-review");
  await expect(review).toBeVisible({ timeout: 20_000 });
  // Review line presentation intentionally omits option names; sealed line
  // amount proves both modifier deltas (22000 + 1500 + 1500 = 25000 paise).
  const lines = review.getByTestId("checkout-line-review");
  await expect(lines).toContainText(GTM_MODIFIER_ITEM_NAME);
  await expect(lines).toContainText("₹250.00");
  const reviewPayable = await payablePaise(review);
  expect(reviewPayable).toBeGreaterThan(BigInt(0));

  await page.getByRole("button", { name: /Continue to payment/i }).click();
  await expect(page.getByTestId("checkout-ready")).toBeVisible({ timeout: 20_000 });
  await expect(page.getByTestId("copy-stale")).toHaveCount(0);
  const readyPayable = await payablePaise(page.getByTestId("checkout-ready"));
  expect(readyPayable).toBe(reviewPayable);

  await page.getByTestId("payment-start").click();
  await expect(page.getByTestId("order-confirmation")).toBeVisible({ timeout: 30_000 });
  await expect(page.getByTestId("copy-stale")).toHaveCount(0);
  await expect(page.getByTestId("order-status")).toHaveText(/order received/i);
});

test("payment start fails closed on sealed promotion drift without a provider open", async ({
  page,
}) => {
  test.setTimeout(180_000);
  await installRazorpayCheckoutMock(page, "succeed");
  const owned = await reachPaymentStart(page, PHONE.bindingDrift);
  const before = await control(page, { action: "counts" });
  const drifted = await control(page, checkoutDriftInput(owned));
  expect(drifted.ok, JSON.stringify({ ok: drifted.ok, reason: drifted.reason, mutated: drifted.mutated })).toBe(
    true,
  );
  expect(drifted.mutated).toBe(1);
  expect(drifted.checkoutId).toBe(owned.checkoutId);
  expect(drifted.activeSnapshotId).toBe(owned.activeSnapshotId);
  expect(drifted.promotionEffectId).toBe(owned.promotionEffectId);
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
  const after = await control(page, { action: "counts" });
  expect(after.paymentCount).toBe(before.paymentCount);
  expect(after.orderCount).toBe(before.orderCount);
});

test("two carts reject the wrong identity and leave both carts unchanged", async ({ page, browser }, testInfo) => {
  test.setTimeout(240_000);
  const other = await secondContext(browser, testInfo, page.viewportSize());
  try {
    const cartA = await buildTwoLineGuestCart(page);
    const cartB = await buildTwoLineGuestCart(other.page);
    expect(cartA.cartId).not.toBe(cartB.cartId);
    expect(cartA.lineId).not.toBe(cartB.lineId);

    const beforeA = await control(page, {
      action: "read-binding",
      cartId: cartA.cartId,
      outletId: cartA.outletId,
      variantId: cartA.variantId,
    });
    const beforeSibling = await control(page, {
      action: "read-binding",
      outletId: cartA.outletId,
      variantId: cartA.siblingVariantId,
    });
    expect(beforeA.cartFound).toBe(true);
    expect(beforeA.availability === null || (beforeA.availability as { state?: string }).state === "available").toBe(
      true,
    );
    expect(
      beforeSibling.availability === null ||
        (beforeSibling.availability as { state?: string }).state === "available",
    ).toBe(true);

    const wrongLine = await control(page, cartMarkInput(cartA, { lineId: cartB.lineId, siblingLineId: cartB.siblingLineId }));
    expect(wrongLine.ok).toBe(false);
    expect(wrongLine.mutated).toBe(0);

    const wrongCart = await control(page, cartMarkInput(cartA, { cartId: cartB.cartId }));
    expect(wrongCart.ok).toBe(false);
    expect(wrongCart.mutated).toBe(0);

    const missing = await control(
      page,
      cartMarkInput(cartA, { cartId: "00000000-0000-4000-8000-000000000099" }),
    );
    expect(missing.ok).toBe(false);
    expect(missing.reason).toBe("MISSING_CART");
    expect(missing.mutated).toBe(0);

    const wrongCustomer = await control(page, cartMarkInput(cartA, { customerAuthUserId: "wrong-customer" }));
    expect(wrongCustomer.ok).toBe(false);
    expect(wrongCustomer.reason).toBe("WRONG_CUSTOMER");
    expect(wrongCustomer.mutated).toBe(0);

    const stale = await control(page, cartMarkInput(cartA, { expectedRevision: "999999999" }));
    expect(stale.ok).toBe(false);
    expect(stale.reason).toBe("STALE_CART");
    expect(stale.mutated).toBe(0);

    const afterReject = await control(page, {
      action: "read-binding",
      cartId: cartA.cartId,
      outletId: cartA.outletId,
      variantId: cartA.variantId,
    });
    const afterB = await control(page, {
      action: "read-binding",
      cartId: cartB.cartId,
      outletId: cartB.outletId,
      variantId: cartB.variantId,
    });
    expect(afterReject.availability).toEqual(beforeA.availability);
    expect((afterB.availability as { state?: string } | null)?.state ?? null).not.toBe("sold_out");
    expect(afterReject.lineIds).toEqual(expect.arrayContaining([cartA.lineId, cartA.siblingLineId]));
    expect(afterB.lineIds).toEqual(expect.arrayContaining([cartB.lineId, cartB.siblingLineId]));

    const marked = await control(page, cartMarkInput(cartA));
    expect(marked.ok).toBe(true);
    expect(marked.mutated).toBe(1);
    expect(marked.cartId).toBe(cartA.cartId);
    expect(marked.lineId).toBe(cartA.lineId);
    const sold = await control(page, {
      action: "read-binding",
      outletId: cartA.outletId,
      variantId: cartA.variantId,
    });
    const siblingLeft = await control(page, {
      action: "read-binding",
      outletId: cartA.outletId,
      variantId: cartA.siblingVariantId,
    });
    expect(sold.availability).toEqual({ state: "sold_out", reasonMatchesRun: true });
    expect((siblingLeft.availability as { state?: string } | null)?.state ?? null).not.toBe("sold_out");

    const wrongRestore = await control(page, {
      action: "restore-availability",
      outletId: cartA.outletId,
      variantId: cartA.siblingVariantId,
    });
    expect(wrongRestore.mutated).toBe(0);
    const stillSold = await control(page, {
      action: "read-binding",
      outletId: cartA.outletId,
      variantId: cartA.variantId,
    });
    expect(stillSold.availability).toEqual({ state: "sold_out", reasonMatchesRun: true });

    await page.locator("header").getByRole("link", { name: /^cart \(2\)$/i }).click();
    await expect(page.getByTestId("cart-evaluation-problems")).toContainText(String(marked.unavailableProductName), {
      timeout: 20_000,
    });
    await expect(page.getByRole("button", { name: `Remove ${String(marked.unavailableProductName)} from cart` })).toBeVisible();

    const restored = await control(page, {
      action: "restore-availability",
      outletId: cartA.outletId,
      variantId: cartA.variantId,
    });
    expect(restored.restored).toBe(1);
    expect(restored.mutated).toBe(1);
  } finally {
    await other.context.close();
  }
});

test("two ready checkouts reject the wrong identity and leave the unrelated snapshot unchanged", async ({
  page,
  browser,
}, testInfo) => {
  test.setTimeout(360_000);
  const other = await secondContext(browser, testInfo, page.viewportSize());
  try {
    const checkoutA = await reachPaymentStart(page, PHONE.isolationA);
    const checkoutB = await reachPaymentStart(other.page, PHONE.isolationB);
    expect(checkoutA.checkoutId).not.toBe(checkoutB.checkoutId);
    expect(checkoutA.activeSnapshotId).not.toBe(checkoutB.activeSnapshotId);

    const beforeA = await control(page, { action: "read-binding", checkoutId: checkoutA.checkoutId });
    const beforeB = await control(page, { action: "read-binding", checkoutId: checkoutB.checkoutId });
    const codesA = effectCodes(beforeA);
    const codesB = effectCodes(beforeB);
    expect(codesA).toContain(checkoutA.expectedPromotionCode);
    expect(codesB).toContain(checkoutB.expectedPromotionCode);

    const wrongSnapshot = await control(
      page,
      checkoutDriftInput(checkoutA, {
        activeSnapshotId: checkoutB.activeSnapshotId,
        promotionEffectId: checkoutB.promotionEffectId,
        expectedPromotionCode: checkoutB.expectedPromotionCode,
      }),
    );
    expect(wrongSnapshot.ok).toBe(false);
    expect(wrongSnapshot.mutated).toBe(0);

    const wrongEffect = await control(
      page,
      checkoutDriftInput(checkoutA, {
        promotionEffectId: checkoutB.promotionEffectId,
        expectedPromotionCode: checkoutB.expectedPromotionCode,
      }),
    );
    expect(wrongEffect.ok).toBe(false);
    expect(wrongEffect.mutated).toBe(0);

    const missing = await control(
      page,
      checkoutDriftInput(checkoutA, { checkoutId: "00000000-0000-4000-8000-000000000099" }),
    );
    expect(missing.ok).toBe(false);
    expect(missing.reason).toBe("MISSING_CHECKOUT");
    expect(missing.mutated).toBe(0);

    const unchangedA = effectCodes(await control(page, { action: "read-binding", checkoutId: checkoutA.checkoutId }));
    const unchangedB = effectCodes(await control(page, { action: "read-binding", checkoutId: checkoutB.checkoutId }));
    expect(unchangedA).toEqual(codesA);
    expect(unchangedB).toEqual(codesB);

    const drifted = await control(page, checkoutDriftInput(checkoutA));
    expect(drifted.ok, JSON.stringify({ ok: drifted.ok, reason: drifted.reason, mutated: drifted.mutated })).toBe(
      true,
    );
    expect(drifted.mutated).toBe(1);
    expect(drifted.checkoutId).toBe(checkoutA.checkoutId);
    expect(drifted.activeSnapshotId).toBe(checkoutA.activeSnapshotId);

    const afterA = await control(page, { action: "read-binding", checkoutId: checkoutA.checkoutId });
    const afterB = await control(page, { action: "read-binding", checkoutId: checkoutB.checkoutId });
    const afterEffects = (afterA.checkout as { effects?: Array<{ id: string; promotionCode: string }> }).effects ?? [];
    const driftedEffect = afterEffects.find((effect) => effect.id === checkoutA.promotionEffectId);
    expect(driftedEffect?.promotionCode).toBe("drifted-seal");
    expect(effectCodes(afterB)).toEqual(codesB);
    expect((afterB.checkout as { activeSnapshotId?: string }).activeSnapshotId).toBe(checkoutB.activeSnapshotId);
  } finally {
    await other.context.close();
  }
});
