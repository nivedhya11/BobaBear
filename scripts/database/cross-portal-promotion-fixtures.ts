#!/usr/bin/env -S node --conditions=react-server --import tsx
/**
 * Test-only IMP-036J cross-portal fixture extension.
 * Runs after the commercial workspace seed against the same disposable DB.
 * Confined to BOBA_BEAR_ENV=test. Adds a brand-scoped outlet_manager who cannot activate/retire.
 */
import { readFile, writeFile } from "node:fs/promises";
import process from "node:process";

import { createMembership, grantRole } from "../../src/server/access-control";
import {
  createWorkforceOperatorAuthRuntime,
  createWorkforceOperatorUser,
} from "../../src/server/auth/workforce/operator";
import { loadAuthFoundationConfig } from "../../src/server/auth/shared/config";
import { getApplicationPersistence } from "../../src/server/persistence";
import { loadConfig } from "../../src/platform/config";

type CommercialManifest = {
  email: string;
  brandId: string;
  brandName: string;
  outletId: string;
  outletName: string;
  productId?: string;
  productName?: string;
  variantId?: string;
  variantName?: string;
  pricingOutletDesktopId?: string;
  pricingOutletTabletId?: string;
  totpSecretBase32?: string;
};

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required env ${name} for cross-portal fixtures.`);
  return value;
}

async function main() {
  if (process.env.BOBA_BEAR_ENV !== "test") {
    throw new Error("cross-portal-promotion-fixtures refuses to run outside BOBA_BEAR_ENV=test.");
  }

  const manifestPath = requireEnv("IMP036J_CROSS_PORTAL_FIXTURE_MANIFEST");
  const deniedEmail = requireEnv("WORKFORCE_E2E_DENIED_EMAIL");
  const deniedTempPassword = requireEnv("WORKFORCE_E2E_DENIED_TEMP_PASSWORD");
  const runId = requireEnv("CROSS_PORTAL_RUN_ID");
  const composeProject = requireEnv("CROSS_PORTAL_COMPOSE_PROJECT");
  const postgresHostPort = requireEnv("CROSS_PORTAL_POSTGRES_HOST_PORT");
  const phoneSeed = requireEnv("CROSS_PORTAL_PHONE_SEED");
  const otpCode = requireEnv("CUSTOMER_OTP_LOCAL_FIXED_CODE");

  const commercial = JSON.parse(await readFile(manifestPath, "utf8")) as CommercialManifest;
  if (!commercial.brandId || !commercial.email) {
    throw new Error("Commercial seed manifest incomplete before cross-portal fixture extension.");
  }

  const config = loadConfig({ processKind: "worker", source: process.env });
  const persistence = getApplicationPersistence(config);
  const auth = loadAuthFoundationConfig(process.env, "test").workforce;
  const runtime = createWorkforceOperatorAuthRuntime({ auth, persistence: config });

  try {
    const denied = await createWorkforceOperatorUser(runtime, {
      email: deniedEmail,
      name: "Cross-portal Denied Outlet Manager",
      temporaryPassword: deniedTempPassword,
    });
    await persistence.transaction(async (tx) => {
      const membership = await createMembership(tx, {
        workforceUserId: denied.userId,
        status: "active",
        scope: { scopeType: "brand", brandId: commercial.brandId },
      });
      // outlet_manager: promotions.read/manage yes; promotions.activate NO.
      await grantRole(tx, { membershipId: membership.id, roleKey: "outlet_manager" });
    });

    await writeFile(
      manifestPath,
      `${JSON.stringify(
        {
          ...commercial,
          runId,
          composeProject,
          postgresHostPort,
          phoneSeed,
          customerOtpLocalFixedCodePresent: Boolean(otpCode),
          deniedOperatorEmail: deniedEmail,
          deniedOperatorRole: "outlet_manager",
          oneDatabaseIdentity: {
            composeProject,
            postgresHostPort,
            brandId: commercial.brandId,
            outletId: commercial.outletId,
          },
          fakePaymentProvider: "e2e-fake-main+razorpay_standard_checkout",
        },
        null,
        2,
      )}\n`,
      { mode: 0o600 },
    );
  } finally {
    await runtime.close();
    await persistence.close();
  }
}

main().catch((error: unknown) => {
  process.stderr.write(
    `cross-portal-promotion-fixtures failed: ${error instanceof Error ? error.message : "unknown"}\n`,
  );
  process.exitCode = 1;
});
