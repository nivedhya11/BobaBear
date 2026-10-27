/**
 * Persisted customer raw-token expiry. Uses a disposable database and a
 * synthetic Better Auth user. Does not call getSession, so an expired row is
 * not deleted by the cookie lookup.
 */
import { eq } from "drizzle-orm";
import { afterEach, describe, expect, inject, it } from "vitest";

import { customerAuthSessions } from "../../src/platform/database/schema/customer-auth";
import type { WebConfig } from "../../src/platform/config";
import {
  getCustomerAuthRuntime,
  resolveTrustedCustomerAuthIdentity,
  type CustomerPhoneAuthRuntimeDependencies,
} from "../../src/server/auth/customer";
import { loadAuthFoundationConfig } from "../../src/server/auth/shared/config";
import {
  createCustomerTemporaryIdentityDeriver,
  type CustomerPiiHashSecret,
} from "../../src/server/customer-auth/pii";
import { createCustomerOtpProvider } from "../../src/server/customer-auth/provider";
import { getApplicationPersistence, type Persistence } from "../../src/server/persistence";
import { applyMigrations, withIsolatedTestDatabase } from "../database/support/test-database";

function adminConnectionInfo() {
  return {
    connectionString: inject("bobaBearTestAdminConnectionString"),
    host: inject("bobaBearTestAdminHost"),
    port: inject("bobaBearTestAdminPort"),
  };
}

function applicationConfig(databaseUrl: string): WebConfig {
  return {
    environment: "test",
    processKind: "web",
    publicOrigin: "http://localhost:3100",
    logLevel: "warn",
    release: null,
    allowUnsafeAdapters: true,
    databaseSslMode: "disable",
    port: 3000,
    databaseUrl,
  };
}

function authFoundationConfig() {
  return loadAuthFoundationConfig(
    {
      CUSTOMER_AUTH_SECRET: "customer-session-expiry-customer-secret-32-chars",
      CUSTOMER_AUTH_BASE_URL: "http://localhost:3100",
      WORKFORCE_AUTH_SECRET: "customer-session-expiry-workforce-secret-32ch",
      WORKFORCE_AUTH_BASE_URL: "http://localhost:3200",
    },
    "test",
  );
}

function phoneDependencies(): CustomerPhoneAuthRuntimeDependencies {
  return {
    otpProvider: createCustomerOtpProvider({ kind: "local", environmentType: "test" }),
    identityDeriver: createCustomerTemporaryIdentityDeriver(
      "customer-session-expiry-pii-hash-secret-32chars" as CustomerPiiHashSecret,
    ),
  };
}

type InternalAdapter = {
  createUser: (data: {
    email: string;
    name: string;
    emailVerified: boolean;
  }) => Promise<{ id: string }>;
  createSession: (userId: string) => Promise<{ token: string }>;
};

const openHandles: Array<{ close(): Promise<void> }> = [];
afterEach(async () => {
  await Promise.all(openHandles.splice(0).map((handle) => handle.close()));
});

async function withCustomerResolverHarness<T>(
  callback: (ctx: {
    persistence: Persistence;
    runtime: ReturnType<typeof getCustomerAuthRuntime>;
    adapter: InternalAdapter;
  }) => Promise<T>,
): Promise<T> {
  return withIsolatedTestDatabase(adminConnectionInfo(), async (database) => {
    await applyMigrations(database.connectionString);
    const persistence = getApplicationPersistence(
      applicationConfig(database.connectionString),
    );
    openHandles.push(persistence);
    const runtime = getCustomerAuthRuntime(
      {
        auth: authFoundationConfig().customer,
        persistence: applicationConfig(database.connectionString),
      },
      phoneDependencies(),
    );
    openHandles.push(runtime);
    const auth = await runtime.getAuth();
    const context = (await auth.$context) as { internalAdapter: InternalAdapter };
    return callback({
      persistence,
      runtime,
      adapter: context.internalAdapter,
    });
  });
}

describe("customer raw session token expiry", () => {
  it("resolves an unexpired persisted session and rejects that same token 60 seconds after expiry", async () => {
    await withCustomerResolverHarness(async ({ persistence, runtime, adapter }) => {
      const user = await adapter.createUser({
        email: "synthetic-customer-session@example.test",
        name: "Synthetic Customer",
        emailVerified: false,
      });
      const session = await adapter.createSession(user.id);

      const unexpired = await resolveTrustedCustomerAuthIdentity(runtime, {
        sessionToken: session.token,
      });
      expect(unexpired?.userId).toBe(user.id);
      expect(Object.keys(unexpired ?? {})).toEqual(["userId"]);

      const expiredAt = new Date(Date.now() - 60_000);
      await persistence.withContext(async (ctx) => {
        await ctx.db
          .update(customerAuthSessions)
          .set({ expiresAt: expiredAt })
          .where(eq(customerAuthSessions.token, session.token));
      });

      const expired = await resolveTrustedCustomerAuthIdentity(runtime, {
        sessionToken: session.token,
      });
      expect(expired).toBeNull();

      const remaining = await persistence.withContext(async (ctx) => {
        return ctx.db
          .select({ expiresAt: customerAuthSessions.expiresAt })
          .from(customerAuthSessions)
          .where(eq(customerAuthSessions.token, session.token));
      });
      expect(remaining).toHaveLength(1);
      expect(remaining[0]?.expiresAt.getTime()).toBeLessThan(Date.now());
    });
  });

  it("rejects an unknown raw session token", async () => {
    await withCustomerResolverHarness(async ({ runtime }) => {
      const identity = await resolveTrustedCustomerAuthIdentity(runtime, {
        sessionToken: "unknown-customer-session-token",
      });
      expect(identity).toBeNull();
    });
  });
});
