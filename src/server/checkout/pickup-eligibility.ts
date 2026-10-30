/**
 * ASAP Pickup eligibility composition (IMP-036H-B / AF-036H-05).
 *
 * Eligible iff ALL:
 *   outlet.active AND profile exists AND enabled
 *   AND resolveOutletOperatingState.effectiveState === "accepting"
 *   AND cart merchandise fulfilable at that outlet
 *
 * paused / suspended / closed_by_schedule → NOT eligible.
 */

import { and, asc, eq } from "drizzle-orm";

import { outletsTable } from "../../platform/database/schema/organizations";
import type { Cart } from "../../shared/cart";
import {
  CheckoutError,
  type CheckoutMerchandiseProblem,
  type CheckoutPickupLocation,
} from "../../shared/checkout";
import { resolveOutletOperatingState } from "../assortment/resolve-operating";
import { loadOutletPickupProfileByOutletId } from "../outlet-pickup-profile/repository";
import type { PersistenceQueryContext } from "../persistence/types";
import { assertApplicationRole } from "./assert-role";
import { collectAssortmentAvailabilityProblems } from "./adapters/assortment-availability";
import { validateCheckoutCartMerchandise } from "./adapters/catalog";

/**
 * Customer-safe pickup option projection — no hierarchy, legal entity,
 * operating internals, or assortment diagnostics.
 */
export type EligiblePickupOutlet = Readonly<{
  outletId: string;
  displayName: string;
  addressLine1: string;
  addressLine2: string | null;
  locality: string | null;
  city: string;
  stateCode: string;
  postalCode: string;
  instructions: string;
  coordinates: Readonly<{ latitude: string; longitude: string }> | null;
}>;

export function pickupLocationFromProfile(profile: {
  displayName: string;
  addressLine1: string;
  addressLine2: string | null;
  locality: string | null;
  city: string;
  stateCode: string;
  postalCode: string;
  instructions: string;
  latitude: string | null;
  longitude: string | null;
}): CheckoutPickupLocation {
  const coordinates =
    profile.latitude !== null && profile.longitude !== null
      ? Object.freeze({
          latitude: profile.latitude,
          longitude: profile.longitude,
        })
      : null;
  return Object.freeze({
    displayName: profile.displayName,
    addressLine1: profile.addressLine1,
    addressLine2: profile.addressLine2,
    locality: profile.locality,
    city: profile.city,
    stateCode: profile.stateCode,
    postalCode: profile.postalCode,
    instructions: profile.instructions,
    coordinates,
  });
}

type CoreEligible = Readonly<{
  outletId: string;
  profile: NonNullable<
    Awaited<ReturnType<typeof loadOutletPickupProfileByOutletId>>
  >;
}>;

/**
 * Core gates only (active + profile enabled + accepting).
 * Merchandise is checked separately so evaluate can surface merchandise codes.
 */
async function assertCorePickupOutletGates(
  context: PersistenceQueryContext,
  input: Readonly<{
    brandId: string;
    outletId: string;
    now: Date;
  }>,
): Promise<CoreEligible> {
  const outletRows = await context.db
    .select({
      id: outletsTable.id,
      status: outletsTable.status,
      brandId: outletsTable.brandId,
    })
    .from(outletsTable)
    .where(
      and(
        eq(outletsTable.id, input.outletId),
        eq(outletsTable.brandId, input.brandId),
      ),
    )
    .limit(1);
  const outlet = outletRows[0];
  if (!outlet || outlet.status !== "active") {
    throw new CheckoutError(
      "PICKUP_OUTLET_NOT_ELIGIBLE",
      "Selected pickup outlet is not eligible.",
      { field: "pickupOutletId" },
    );
  }

  const profile = await loadOutletPickupProfileByOutletId(context, outlet.id);
  if (!profile || !profile.enabled) {
    throw new CheckoutError(
      "PICKUP_OUTLET_NOT_ELIGIBLE",
      "Selected pickup outlet is not eligible.",
      { field: "pickupOutletId" },
    );
  }

  const operating = await resolveOutletOperatingState(context, {
    outletId: outlet.id,
    context: { now: input.now },
  });
  if (operating.effectiveState !== "accepting") {
    throw new CheckoutError(
      "PICKUP_OUTLET_NOT_ELIGIBLE",
      "Selected pickup outlet is not eligible.",
      { field: "pickupOutletId" },
    );
  }

  return Object.freeze({ outletId: outlet.id, profile });
}

async function cartMerchandiseProblemsAtOutlet(
  context: PersistenceQueryContext,
  input: Readonly<{
    brandId: string;
    outletId: string;
    cart: Cart;
    now: Date;
  }>,
): Promise<readonly CheckoutMerchandiseProblem[]> {
  const catalogProblems = await validateCheckoutCartMerchandise(
    context,
    input.brandId,
    input.cart,
  );
  if (catalogProblems.length > 0) return catalogProblems;
  return collectAssortmentAvailabilityProblems(
    context,
    input.cart,
    input.outletId,
    input.now,
  );
}

function toEligibleOption(
  profile: CoreEligible["profile"],
  outletId: string,
): EligiblePickupOutlet {
  return Object.freeze({
    outletId,
    displayName: profile.displayName,
    addressLine1: profile.addressLine1,
    addressLine2: profile.addressLine2,
    locality: profile.locality,
    city: profile.city,
    stateCode: profile.stateCode,
    postalCode: profile.postalCode,
    instructions: profile.instructions,
    coordinates:
      profile.latitude !== null && profile.longitude !== null
        ? Object.freeze({
            latitude: profile.latitude,
            longitude: profile.longitude,
          })
        : null,
  });
}

/**
 * Lists brand outlets that are eligible for ASAP Pickup for the given cart.
 * Order is stable by outlet name then id.
 */
export type EligiblePickupOutletListing = Readonly<{
  outlets: readonly EligiblePickupOutlet[];
  merchandiseProblems: readonly CheckoutMerchandiseProblem[];
}>;

export async function listEligiblePickupOutletsForCheckout(
  context: PersistenceQueryContext,
  input: Readonly<{
    brandId: string;
    cart: Cart;
    now: Date;
  }>,
): Promise<EligiblePickupOutletListing> {
  assertApplicationRole(context, "listEligiblePickupOutletsForCheckout");

  if (input.cart.lines.length === 0) {
    return Object.freeze({
      outlets: Object.freeze([]),
      merchandiseProblems: Object.freeze([]),
    });
  }

  const outlets = await context.db
    .select({
      id: outletsTable.id,
      status: outletsTable.status,
    })
    .from(outletsTable)
    .where(
      and(
        eq(outletsTable.brandId, input.brandId),
        eq(outletsTable.status, "active"),
      ),
    )
    .orderBy(asc(outletsTable.name), asc(outletsTable.id));

  const eligible: EligiblePickupOutlet[] = [];
  const merchandiseProblems: CheckoutMerchandiseProblem[] = [];
  const seenProblem = new Set<string>();
  for (const outlet of outlets) {
    try {
      const core = await assertCorePickupOutletGates(context, {
        brandId: input.brandId,
        outletId: outlet.id,
        now: input.now,
      });
      const problems = await cartMerchandiseProblemsAtOutlet(context, {
        brandId: input.brandId,
        outletId: outlet.id,
        cart: input.cart,
        now: input.now,
      });
      if (problems.length === 0) {
        eligible.push(toEligibleOption(core.profile, outlet.id));
      } else {
        for (const problem of problems) {
          const key = `${problem.cartLineId}\u0000${problem.code}`;
          if (seenProblem.has(key)) continue;
          seenProblem.add(key);
          merchandiseProblems.push(problem);
        }
      }
    } catch (error) {
      if (
        error instanceof CheckoutError &&
        error.code === "PICKUP_OUTLET_NOT_ELIGIBLE"
      ) {
        continue;
      }
      throw error;
    }
  }
  return Object.freeze({
    outlets: Object.freeze(eligible),
    merchandiseProblems: Object.freeze(merchandiseProblems),
  });
}

/**
 * Asserts the selected pickup outlet passes core ASAP Pickup gates
 * (active + profile enabled + accepting). Merchandise is validated by
 * evaluate/prepare collectors so failures surface as merchandise codes.
 */
export async function assertPickupOutletEligible(
  context: PersistenceQueryContext,
  input: Readonly<{
    brandId: string;
    outletId: string;
    cart: Cart;
    now: Date;
  }>,
): Promise<EligiblePickupOutlet> {
  assertApplicationRole(context, "assertPickupOutletEligible");
  void input.cart;
  const core = await assertCorePickupOutletGates(context, {
    brandId: input.brandId,
    outletId: input.outletId,
    now: input.now,
  });
  return toEligibleOption(core.profile, core.outletId);
}
