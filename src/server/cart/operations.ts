/**
 * Cart domain mutations and reads (IMP-020).
 *
 * Public surface: getActiveCart, addCartLine, setCartLineQuantity,
 * updateCartLineConfiguration, removeCartLine, clearCart,
 * applyCartCoupon, removeCartCoupon. Claim/reconcile/evaluate live in
 * sibling modules.
 */

import { normalizeCouponCode } from "../../shared/promotions";
import {
  CartError,
  assertUuid,
  canonicalConfigurationsEqual,
  parseAddCartLineInput,
  parseApplyCartCouponInput,
  parseClearCartInput,
  parseRemoveCartCouponInput,
  parseRemoveCartLineInput,
  parseExpectedRevision,
  parseSetCartLineQuantityInput,
  parseUpdateCartLineConfigurationInput,
  requireGuestCartTtlMs,
  type Cart,
  type CartMutationResult,
  type CartPolicy,
} from "../../shared/cart";
import type { Persistence } from "../persistence/types";
import { eq } from "drizzle-orm";
import {
  checkoutSnapshotsTable,
} from "../../platform/database/schema/checkout";
import { findCouponByCanonicalCode } from "../promotions/coupons";
import { buildDirectPricingQuote } from "../pricing/quote";
import { loadFirstOrderPurchaseStatus } from "../payment/first-order";
import { lockCheckoutForUpdate } from "../checkout/repository";
import {
  assertCommandIdForCart,
  insertCommandOrigin,
  insertCommandResult,
  resolveCouponCommandSurface,
  writeCouponAttemptFact,
  type OriginKind,
} from "../customer-commerce/measurement/writers";
import { requireCustomerActor, type CustomerActor } from "./actor";
import { cartLineToCanonicalConfiguration } from "./canonicalize-config";
import { systemCartClock, type CartClock } from "./clock";
import {
  generateGuestCartToken,
  guestVerifiersEqual,
  hashGuestToken,
} from "./guest-credential";
import {
  deleteAllCartLines,
  appendCartLineUnits,
  deleteNewestUnitForLine,
  deleteNewestUnitForVariant,
  deleteCartLines,
  findCartRowById,
  findCustomerCartRow,
  findGuestCartRowByVerifier,
  insertCartLineWithConfiguration,
  insertCustomerCart,
  insertGuestCart,
  loadCartAggregate,
  lockCartForUpdate,
  lockCartLinesAscending,
  lockCustomerAuthUserForUpdate,
  moveCartLineUnits,
  replaceCartLineConfiguration,
  setCartLineQuantityRow,
  updateCartHeader,
  type CartRow,
} from "./repository";
import { validateCartLineStructure } from "./validate-structure";

export type CartAccess =
  | Readonly<{
      kind: "customer";
      actor: CustomerActor;
      brandId: string;
    }>
  | Readonly<{
      kind: "guest";
      brandId: string;
      /** Required for existing-guest operations; omit only for first material add. */
      guestToken?: string;
    }>;

export type CartOperationOptions = Readonly<{
  clock?: CartClock;
  policy?: CartPolicy;
}>;

function assertBrandId(brandId: string): string {
  return assertUuid(brandId, "brandId");
}

function isGuestExpired(row: CartRow, now: Date): boolean {
  return row.expiresAt !== null && row.expiresAt.getTime() <= now.getTime();
}

function assertRevisionMatch(row: CartRow, expectedRevision: bigint): void {
  if (row.revision !== expectedRevision) {
    throw new CartError(
      "CART_CONFLICT",
      "Cart revision does not match expectedRevision.",
      { field: "expectedRevision" },
    );
  }
}

async function resolveExistingCartRow(
  persistence: Persistence,
  access: CartAccess,
  now: Date,
): Promise<CartRow | null> {
  if (access.kind === "customer") {
    requireCustomerActor(access.actor);
    return persistence.withContext((ctx) =>
      findCustomerCartRow(ctx, access.actor.authUserId, access.brandId),
    );
  }
  if (!access.guestToken) return null;
  const verifier = hashGuestToken(access.guestToken);
  const row = await persistence.withContext((ctx) =>
    findGuestCartRowByVerifier(ctx, verifier, access.brandId),
  );
  if (!row) return null;
  if (!guestVerifiersEqual(row.guestCredentialVerifier!, access.guestToken)) {
    return null;
  }
  if (isGuestExpired(row, now)) {
    throw new CartError("CART_EXPIRED", "Guest Cart has expired.");
  }
  return row;
}

export async function getActiveCart(
  persistence: Persistence,
  access: CartAccess,
  options: CartOperationOptions = {},
): Promise<Cart | null> {
  const clock = options.clock ?? systemCartClock;
  const now = clock.now();
  assertBrandId(access.brandId);
  const row = await resolveExistingCartRow(persistence, access, now);
  if (!row) return null;
  return persistence.withContext((ctx) => loadCartAggregate(ctx, row));
}

export async function addCartLine(
  persistence: Persistence,
  access: CartAccess,
  input: unknown,
  options: CartOperationOptions = {},
): Promise<CartMutationResult> {
  const clock = options.clock ?? systemCartClock;
  const now = clock.now();
  const brandId = assertBrandId(access.brandId);
  const parsed = parseAddCartLineInput(input);

  return persistence.transaction(async (tx) => {
    let row: CartRow | null = null;
    let guestToken: string | undefined;
    let createdInThisMutation = false;

    if (access.kind === "customer") {
      const actor = requireCustomerActor(access.actor);
      await lockCustomerAuthUserForUpdate(tx, actor.authUserId);
      row = await findCustomerCartRow(tx, actor.authUserId, brandId);
      if (row) {
        const locked = await lockCartForUpdate(tx, row.id);
        if (!locked) throw new CartError("CART_NOT_FOUND", "Cart not found.");
        row = locked;
        if (parsed.expectedRevision === null) {
          throw new CartError(
            "CART_INVALID_INPUT",
            "expectedRevision is required for an existing Cart.",
            { field: "expectedRevision" },
          );
        }
        assertRevisionMatch(row, parsed.expectedRevision);
      } else {
        if (parsed.expectedRevision !== null) {
          throw new CartError(
            "CART_CONFLICT",
            "expectedRevision was provided but no Cart exists.",
            { field: "expectedRevision" },
          );
        }
        row = await insertCustomerCart(tx, {
          brandId,
          customerAuthUserId: actor.authUserId,
          now,
        });
        createdInThisMutation = true;
      }
    } else {
      if (access.guestToken) {
        const verifier = hashGuestToken(access.guestToken);
        const found = await findGuestCartRowByVerifier(tx, verifier, brandId);
        if (!found) {
          throw new CartError("CART_NOT_FOUND", "Cart not found.");
        }
        const locked = await lockCartForUpdate(tx, found.id);
        if (!locked) throw new CartError("CART_NOT_FOUND", "Cart not found.");
        row = locked;
        if (
          !guestVerifiersEqual(
            row.guestCredentialVerifier!,
            access.guestToken,
          )
        ) {
          throw new CartError("CART_NOT_FOUND", "Cart not found.");
        }
        if (isGuestExpired(row, now)) {
          throw new CartError("CART_EXPIRED", "Guest Cart has expired.");
        }
        if (parsed.expectedRevision === null) {
          throw new CartError(
            "CART_INVALID_INPUT",
            "expectedRevision is required for an existing Cart.",
            { field: "expectedRevision" },
          );
        }
        assertRevisionMatch(row, parsed.expectedRevision);
      } else {
        if (parsed.expectedRevision !== null) {
          throw new CartError(
            "CART_CONFLICT",
            "expectedRevision was provided but no Cart exists.",
            { field: "expectedRevision" },
          );
        }
        const ttlMs = requireGuestCartTtlMs(options.policy);
        const cred = generateGuestCartToken();
        guestToken = cred.rawToken;
        row = await insertGuestCart(tx, {
          brandId,
          guestCredentialVerifier: cred.verifierHex,
          expiresAt: new Date(now.getTime() + ttlMs),
          now,
        });
        createdInThisMutation = true;
      }
    }

    await validateCartLineStructure(tx, brandId, parsed.configuration);
    await lockCartLinesAscending(tx, row.id);
    const cart = await loadCartAggregate(tx, row);

    const equivalent = cart.lines.find((line) =>
      canonicalConfigurationsEqual(
        cartLineToCanonicalConfiguration(line),
        parsed.configuration,
      ),
    );

    if (equivalent) {
      const nextQty = equivalent.quantity + parsed.quantity;
      if (!Number.isSafeInteger(nextQty) || nextQty <= 0) {
        throw new CartError(
          "CART_INVALID_INPUT",
          "Line quantity overflow.",
          { field: "quantity" },
        );
      }
      await setCartLineQuantityRow(tx, equivalent.id, nextQty);
      await appendCartLineUnits(tx, { cartId: row.id, cartLineId: equivalent.id, quantity: parsed.quantity });
    } else {
      const lineId = await insertCartLineWithConfiguration(tx, {
        cartId: row.id,
        configuration: parsed.configuration,
        quantity: parsed.quantity,
      });
      await appendCartLineUnits(tx, { cartId: row.id, cartLineId: lineId, quantity: parsed.quantity });
    }

    // Lazy create + first line is one logical mutation: revision stays at 1.
    const nextRevision = createdInThisMutation
      ? row.revision
      : row.revision + BigInt(1);
    const header: {
      cartId: string;
      revision: bigint;
      updatedAt: Date;
      expiresAt?: Date;
    } = {
      cartId: row.id,
      revision: nextRevision,
      updatedAt: now,
    };
    if (access.kind === "guest") {
      const ttlMs = requireGuestCartTtlMs(options.policy);
      header.expiresAt = new Date(now.getTime() + ttlMs);
    }
    await updateCartHeader(tx, header);

    const refreshed = await lockCartForUpdate(tx, row.id);
    const result = await loadCartAggregate(tx, refreshed!);
    return guestToken
      ? Object.freeze({ cart: result, guestToken })
      : Object.freeze({ cart: result });
  });
}

export async function setCartLineQuantity(
  persistence: Persistence,
  access: CartAccess,
  input: unknown,
  options: CartOperationOptions = {},
): Promise<Cart> {
  const clock = options.clock ?? systemCartClock;
  const now = clock.now();
  assertBrandId(access.brandId);
  const parsed = parseSetCartLineQuantityInput(input);

  return persistence.transaction(async (tx) => {
    const row = await lockAuthorizedCart(tx, access, now, parsed.expectedRevision);
    await lockCartLinesAscending(tx, row.id);
    const cart = await loadCartAggregate(tx, row);
    const line = cart.lines.find((l) => l.id === parsed.cartLineId);
    if (!line) {
      throw new CartError("CART_LINE_NOT_FOUND", "Cart line not found.");
    }
    if (line.quantity === parsed.quantity) {
      return cart; // no-op
    }
    if (parsed.quantity > line.quantity) {
      await appendCartLineUnits(tx, { cartId: row.id, cartLineId: line.id, quantity: parsed.quantity - line.quantity });
    } else {
      for (let i = parsed.quantity; i < line.quantity; i += 1) await deleteNewestUnitForLine(tx, line.id);
    }
    await setCartLineQuantityRow(tx, line.id, parsed.quantity);
    await bumpMaterialMutation(tx, row, access, now, options.policy);
    const refreshed = await lockCartForUpdate(tx, row.id);
    return loadCartAggregate(tx, refreshed!);
  });
}

export async function decrementLatestCartVariant(
  persistence: Persistence,
  access: CartAccess,
  input: unknown,
  options: CartOperationOptions = {},
): Promise<Cart> {
  const clock = options.clock ?? systemCartClock;
  const now = clock.now();
  assertBrandId(access.brandId);
  if (typeof input !== "object" || input === null || Array.isArray(input)) {
    throw new CartError("CART_INVALID_INPUT", "decrementLatestCartVariant input invalid.");
  }
  const value = input as Record<string, unknown>;
  if (Object.keys(value).some((key) => key !== "variantId" && key !== "expectedRevision")) {
    throw new CartError("CART_INVALID_INPUT", "Unknown decrementLatestCartVariant field.");
  }
  const variantId = assertUuid(value.variantId, "variantId");
  const expectedRevision = parseExpectedRevision(value.expectedRevision);
  return persistence.transaction(async (tx) => {
    const row = await lockAuthorizedCart(tx, access, now, expectedRevision);
    await lockCartLinesAscending(tx, row.id);
    const cart = await loadCartAggregate(tx, row);
    const lineId = await deleteNewestUnitForVariant(tx, row.id, variantId);
    if (!lineId) throw new CartError("CART_LINE_NOT_FOUND", "Cart item not found.");
    const line = cart.lines.find((entry) => entry.id === lineId);
    if (!line) throw new Error("D-371 invariant violation: unit references missing Cart line.");
    if (line.quantity === 1) await deleteCartLines(tx, [line.id]);
    else await setCartLineQuantityRow(tx, line.id, line.quantity - 1);
    await bumpMaterialMutation(tx, row, access, now, options.policy);
    const refreshed = await lockCartForUpdate(tx, row.id);
    return loadCartAggregate(tx, refreshed!);
  });
}

export async function updateCartLineConfiguration(
  persistence: Persistence,
  access: CartAccess,
  input: unknown,
  options: CartOperationOptions = {},
): Promise<Cart> {
  const clock = options.clock ?? systemCartClock;
  const now = clock.now();
  const brandId = assertBrandId(access.brandId);
  const parsed = parseUpdateCartLineConfigurationInput(input);

  return persistence.transaction(async (tx) => {
    const row = await lockAuthorizedCart(tx, access, now, parsed.expectedRevision);
    await lockCartLinesAscending(tx, row.id);
    const cart = await loadCartAggregate(tx, row);
    const line = cart.lines.find((l) => l.id === parsed.cartLineId);
    if (!line) {
      throw new CartError("CART_LINE_NOT_FOUND", "Cart line not found.");
    }

    const currentConfig = cartLineToCanonicalConfiguration(line);
    if (canonicalConfigurationsEqual(currentConfig, parsed.configuration)) {
      return cart; // no-op
    }

    await validateCartLineStructure(tx, brandId, parsed.configuration);

    const equivalent = cart.lines.find(
      (l) =>
        l.id !== line.id &&
        canonicalConfigurationsEqual(
          cartLineToCanonicalConfiguration(l),
          parsed.configuration,
        ),
    );

    if (equivalent) {
      const nextQty = equivalent.quantity + line.quantity;
      if (!Number.isSafeInteger(nextQty) || nextQty <= 0) {
        throw new CartError(
          "CART_INVALID_INPUT",
          "Line quantity overflow.",
          { field: "quantity" },
        );
      }
      await setCartLineQuantityRow(tx, equivalent.id, nextQty);
      await moveCartLineUnits(tx, { fromCartId: row.id, fromLineId: line.id, toCartId: row.id, toLineId: equivalent.id });
      await deleteCartLines(tx, [line.id]);
    } else {
      await replaceCartLineConfiguration(tx, line.id, parsed.configuration);
    }

    await bumpMaterialMutation(tx, row, access, now, options.policy);
    const refreshed = await lockCartForUpdate(tx, row.id);
    return loadCartAggregate(tx, refreshed!);
  });
}

export async function removeCartLine(
  persistence: Persistence,
  access: CartAccess,
  input: unknown,
  options: CartOperationOptions = {},
): Promise<Cart> {
  const clock = options.clock ?? systemCartClock;
  const now = clock.now();
  assertBrandId(access.brandId);
  const parsed = parseRemoveCartLineInput(input);

  return persistence.transaction(async (tx) => {
    const row = await lockAuthorizedCart(tx, access, now, parsed.expectedRevision);
    await lockCartLinesAscending(tx, row.id);
    const cart = await loadCartAggregate(tx, row);
    const line = cart.lines.find((l) => l.id === parsed.cartLineId);
    if (!line) {
      throw new CartError("CART_LINE_NOT_FOUND", "Cart line not found.");
    }
    await deleteCartLines(tx, [line.id]);
    await bumpMaterialMutation(tx, row, access, now, options.policy);
    const refreshed = await lockCartForUpdate(tx, row.id);
    return loadCartAggregate(tx, refreshed!);
  });
}

export async function clearCart(
  persistence: Persistence,
  access: CartAccess,
  input: unknown,
  options: CartOperationOptions = {},
): Promise<Cart> {
  const clock = options.clock ?? systemCartClock;
  const now = clock.now();
  assertBrandId(access.brandId);
  const parsed = parseClearCartInput(input);

  return persistence.transaction(async (tx) => {
    const row = await lockAuthorizedCart(tx, access, now, parsed.expectedRevision);
    await lockCartLinesAscending(tx, row.id);
    const cart = await loadCartAggregate(tx, row);
    if (cart.lines.length === 0 && cart.manualCouponCode === null) {
      return cart; // no-op
    }
    await deleteAllCartLines(tx, row.id);
    await updateCartHeader(tx, {
      cartId: row.id,
      revision: row.revision + BigInt(1),
      updatedAt: now,
      manualCouponCode: null,
      ...(access.kind === "guest"
        ? {
            expiresAt: new Date(
              now.getTime() + requireGuestCartTtlMs(options.policy),
            ),
          }
        : {}),
    });
    const refreshed = await lockCartForUpdate(tx, row.id);
    return loadCartAggregate(tx, refreshed!);
  });
}

function replayStoredCouponCommand(
  coarseOutcome: string,
  loadCart: () => Promise<Cart>,
): Promise<Cart> {
  if (coarseOutcome === "UNKNOWN") {
    rejectUnknownCoupon();
  }
  return loadCart();
}

async function quotePayableChangedVsValidAlternative(
  tx: Parameters<Parameters<Persistence["transaction"]>[0]>[0],
  input: {
    checkoutId: string | null;
    coarseOutcome: string;
    now: Date;
    customerAuthUserId: string | null;
  },
): Promise<boolean | null> {
  if (input.coarseOutcome === "UNKNOWN" || !input.checkoutId) {
    return null;
  }
  try {
    const checkout = await lockCheckoutForUpdate(tx, input.checkoutId);
    if (!checkout) return null;
    let outletId = checkout.pickupOutletId;
    if (!outletId) {
      const snapshotId = checkout.activeSnapshotId;
      const snapshotRows = snapshotId
        ? await tx.db
            .select({
              selectedOutletId: checkoutSnapshotsTable.selectedOutletId,
            })
            .from(checkoutSnapshotsTable)
            .where(eq(checkoutSnapshotsTable.id, snapshotId))
            .limit(1)
        : await tx.db
            .select({
              selectedOutletId: checkoutSnapshotsTable.selectedOutletId,
            })
            .from(checkoutSnapshotsTable)
            .where(eq(checkoutSnapshotsTable.checkoutId, checkout.id))
            .limit(1);
      outletId = snapshotRows[0]?.selectedOutletId ?? null;
    }
    if (!outletId) return null;
    const cartRow = await findCartRowById(tx, checkout.cartId);
    if (!cartRow) return null;
    const cart = await loadCartAggregate(tx, cartRow);
    if (!cart?.manualCouponCode) return null;
    const firstOrderPurchaseStatus = await loadFirstOrderPurchaseStatus(
      tx,
      input.customerAuthUserId,
    );
    const quote = await buildDirectPricingQuote(tx, {
      outletId,
      at: input.now,
      customerId: input.customerAuthUserId,
      firstOrderPurchaseStatus,
      submittedCouponCode: cart.manualCouponCode,
      fulfilmentMode: checkout.fulfilmentMode as "DELIVERY" | "PICKUP",
      fulfilmentTiming: checkout.fulfilmentTiming as "ASAP" | "SCHEDULED",
      lines: cart.lines.map((line) => ({
        lineId: line.id,
        variantId: line.variantId,
        quantity: line.quantity,
        modifiers: line.modifiers.map((m) => ({
          variantModifierGroupId: m.variantModifierGroupId,
          modifierGroupOptionId: m.modifierGroupOptionId,
          quantity: m.quantity,
        })),
        bundleOptions: line.bundleSelections.map((b) => ({
          bundleGroupOptionId: b.bundleGroupOptionId,
          quantity: b.quantity,
          modifiers: b.modifiers.map((m) => ({
            variantModifierGroupId: m.variantModifierGroupId,
            modifierGroupOptionId: m.modifierGroupOptionId,
            quantity: m.quantity,
          })),
        })),
      })),
    });
    return quote.payableChangedVsValidAlternative ?? null;
  } catch {
    return null;
  }
}

async function finishCouponCommand(
  tx: Parameters<Parameters<Persistence["transaction"]>[0]>[0],
  input: {
    cartId: string;
    sourceCommandId: string | null;
    reviewSurfaceToken: string | null;
    originKind: OriginKind | null;
    coarseOutcome: string;
    revisionChanged: boolean;
    now: Date;
    customerAuthUserId: string | null;
  },
): Promise<void> {
  if (!input.sourceCommandId) return;
  const surface = await resolveCouponCommandSurface(
    tx,
    input.cartId,
    input.reviewSurfaceToken,
  );
  if (input.revisionChanged && input.originKind) {
    await insertCommandOrigin({
      context: tx,
      sourceCommandId: input.sourceCommandId,
      originKind: input.originKind,
      cartId: input.cartId,
      checkoutId: surface.checkoutId,
      checkoutJourneyKey: surface.journeyKey,
    });
  }
  const payableChangedVsValidAlternative =
    await quotePayableChangedVsValidAlternative(tx, {
      checkoutId: surface.checkoutId,
      coarseOutcome: input.coarseOutcome,
      now: input.now,
      customerAuthUserId: input.customerAuthUserId,
    });
  await insertCommandResult({
    context: tx,
    sourceCommandId: input.sourceCommandId,
    cartId: input.cartId,
    surface: surface.surface,
    coarseOutcome: input.coarseOutcome,
    payableChangedVsValidAlternative,
    checkoutJourneyKey: surface.journeyKey,
  });
  await writeCouponAttemptFact({
    context: tx,
    journeyKey: surface.journeyKey,
    surface: surface.surface,
    sourceCommandId: input.sourceCommandId,
    coarseOutcome: input.coarseOutcome,
  });
}

function rejectUnknownCoupon(): never {
  throw new CartError(
    "CART_COUPON_UNKNOWN",
    "Coupon code is not recognized.",
    { field: "couponCode" },
  );
}

export async function applyCartCoupon(
  persistence: Persistence,
  access: CartAccess,
  input: unknown,
  options: CartOperationOptions = {},
): Promise<Cart> {
  const clock = options.clock ?? systemCartClock;
  const now = clock.now();
  assertBrandId(access.brandId);
  const parsed = parseApplyCartCouponInput(input);
  const customerAuthUserId =
    access.kind === "customer" ? access.actor.authUserId : null;

  const committed = await persistence.transaction(async (tx) => {
    const row = await lockAuthorizedCart(
      tx,
      access,
      now,
      parsed.expectedRevision,
      { deferRevisionCheck: true },
    );
    if (parsed.sourceCommandId) {
      const replay = await assertCommandIdForCart(
        tx,
        parsed.sourceCommandId,
        row.id,
      );
      if (replay.kind === "replay") {
        return {
          kind: "replay" as const,
          outcome: replay.result.coarseOutcome,
          cart: await loadCartAggregate(tx, row),
        };
      }
    }
    assertRevisionMatch(row, parsed.expectedRevision);
    let canonical: string;
    try {
      canonical = normalizeCouponCode(parsed.couponCode);
    } catch {
      await finishCouponCommand(tx, {
        cartId: row.id,
        sourceCommandId: parsed.sourceCommandId,
        reviewSurfaceToken: parsed.reviewSurfaceToken,
        originKind: null,
        coarseOutcome: "UNKNOWN",
        revisionChanged: false,
        now,
        customerAuthUserId,
      });
      return { kind: "unknown" as const };
    }
    const coupon = await findCouponByCanonicalCode(tx, canonical);
    if (!coupon) {
      await finishCouponCommand(tx, {
        cartId: row.id,
        sourceCommandId: parsed.sourceCommandId,
        reviewSurfaceToken: parsed.reviewSurfaceToken,
        originKind: null,
        coarseOutcome: "UNKNOWN",
        revisionChanged: false,
        now,
        customerAuthUserId,
      });
      return { kind: "unknown" as const };
    }
    if (row.manualCouponCode === canonical) {
      await finishCouponCommand(tx, {
        cartId: row.id,
        sourceCommandId: parsed.sourceCommandId,
        reviewSurfaceToken: parsed.reviewSurfaceToken,
        originKind: null,
        coarseOutcome: "NO_OP",
        revisionChanged: false,
        now,
        customerAuthUserId,
      });
      return { kind: "cart" as const, cart: await loadCartAggregate(tx, row) };
    }
    const originKind: OriginKind =
      row.manualCouponCode === null ? "COUPON_APPLY" : "COUPON_REPLACE";
    await updateCartHeader(tx, {
      cartId: row.id,
      revision: row.revision + BigInt(1),
      updatedAt: now,
      manualCouponCode: canonical,
      ...(access.kind === "guest"
        ? {
            expiresAt: new Date(
              now.getTime() + requireGuestCartTtlMs(options.policy),
            ),
          }
        : {}),
    });
    await finishCouponCommand(tx, {
      cartId: row.id,
      sourceCommandId: parsed.sourceCommandId,
      reviewSurfaceToken: parsed.reviewSurfaceToken,
      originKind,
      coarseOutcome: originKind === "COUPON_APPLY" ? "APPLIED" : "REPLACED",
      revisionChanged: true,
      now,
      customerAuthUserId,
    });
    const refreshed = await lockCartForUpdate(tx, row.id);
    return { kind: "cart" as const, cart: await loadCartAggregate(tx, refreshed!) };
  });
  if (committed.kind === "unknown") {
    rejectUnknownCoupon();
  }
  if (committed.kind === "replay") {
    return replayStoredCouponCommand(committed.outcome, async () => committed.cart);
  }
  return committed.cart;
}

export async function removeCartCoupon(
  persistence: Persistence,
  access: CartAccess,
  input: unknown,
  options: CartOperationOptions = {},
): Promise<Cart> {
  const clock = options.clock ?? systemCartClock;
  const now = clock.now();
  assertBrandId(access.brandId);
  const parsed = parseRemoveCartCouponInput(input);
  const customerAuthUserId =
    access.kind === "customer" ? access.actor.authUserId : null;

  const committed = await persistence.transaction(async (tx) => {
    const row = await lockAuthorizedCart(
      tx,
      access,
      now,
      parsed.expectedRevision,
      { deferRevisionCheck: true },
    );
    if (parsed.sourceCommandId) {
      const replay = await assertCommandIdForCart(
        tx,
        parsed.sourceCommandId,
        row.id,
      );
      if (replay.kind === "replay") {
        return {
          kind: "replay" as const,
          outcome: replay.result.coarseOutcome,
          cart: await loadCartAggregate(tx, row),
        };
      }
    }
    assertRevisionMatch(row, parsed.expectedRevision);
    if (row.manualCouponCode === null) {
      await finishCouponCommand(tx, {
        cartId: row.id,
        sourceCommandId: parsed.sourceCommandId,
        reviewSurfaceToken: parsed.reviewSurfaceToken,
        originKind: null,
        coarseOutcome: "NO_OP",
        revisionChanged: false,
        now,
        customerAuthUserId,
      });
      return { kind: "cart" as const, cart: await loadCartAggregate(tx, row) };
    }
    await updateCartHeader(tx, {
      cartId: row.id,
      revision: row.revision + BigInt(1),
      updatedAt: now,
      manualCouponCode: null,
      ...(access.kind === "guest"
        ? {
            expiresAt: new Date(
              now.getTime() + requireGuestCartTtlMs(options.policy),
            ),
          }
        : {}),
    });
    await finishCouponCommand(tx, {
      cartId: row.id,
      sourceCommandId: parsed.sourceCommandId,
      reviewSurfaceToken: parsed.reviewSurfaceToken,
      originKind: "COUPON_REMOVE",
      coarseOutcome: "REMOVED",
      revisionChanged: true,
      now,
      customerAuthUserId,
    });
    const refreshed = await lockCartForUpdate(tx, row.id);
    return { kind: "cart" as const, cart: await loadCartAggregate(tx, refreshed!) };
  });
  if (committed.kind === "replay") {
    return replayStoredCouponCommand(committed.outcome, async () => committed.cart);
  }
  return committed.cart;
}

async function lockAuthorizedCart(
  tx: Parameters<Parameters<Persistence["transaction"]>[0]>[0],
  access: CartAccess,
  now: Date,
  expectedRevision: bigint,
  options: { deferRevisionCheck?: boolean } = {},
): Promise<CartRow> {
  if (access.kind === "customer") {
    const actor = requireCustomerActor(access.actor);
    const found = await findCustomerCartRow(tx, actor.authUserId, access.brandId);
    if (!found) throw new CartError("CART_NOT_FOUND", "Cart not found.");
    const locked = await lockCartForUpdate(tx, found.id);
    if (!locked) throw new CartError("CART_NOT_FOUND", "Cart not found.");
    if (!options.deferRevisionCheck) {
      assertRevisionMatch(locked, expectedRevision);
    }
    return locked;
  }
  if (!access.guestToken) {
    throw new CartError("CART_NOT_FOUND", "Cart not found.");
  }
  const verifier = hashGuestToken(access.guestToken);
  const found = await findGuestCartRowByVerifier(tx, verifier, access.brandId);
  if (!found) throw new CartError("CART_NOT_FOUND", "Cart not found.");
  const locked = await lockCartForUpdate(tx, found.id);
  if (!locked) throw new CartError("CART_NOT_FOUND", "Cart not found.");
  if (!guestVerifiersEqual(locked.guestCredentialVerifier!, access.guestToken)) {
    throw new CartError("CART_NOT_FOUND", "Cart not found.");
  }
  if (isGuestExpired(locked, now)) {
    throw new CartError("CART_EXPIRED", "Guest Cart has expired.");
  }
  if (!options.deferRevisionCheck) {
    assertRevisionMatch(locked, expectedRevision);
  }
  return locked;
}

async function bumpMaterialMutation(
  tx: Parameters<Parameters<Persistence["transaction"]>[0]>[0],
  row: CartRow,
  access: CartAccess,
  now: Date,
  policy: CartPolicy | undefined,
): Promise<void> {
  await updateCartHeader(tx, {
    cartId: row.id,
    revision: row.revision + BigInt(1),
    updatedAt: now,
    ...(access.kind === "guest"
      ? { expiresAt: new Date(now.getTime() + requireGuestCartTtlMs(policy)) }
      : {}),
  });
}
