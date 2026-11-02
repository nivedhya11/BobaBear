/**
 * Isolated raw-token expiry fixtures. These do not open PostgreSQL and do not
 * change session lifetime. The database regression covers a persisted row.
 */
import { describe, expect, it } from "vitest";

import type { CustomerAuthRuntime } from "./runtime";
import { resolveTrustedCustomerAuthIdentity } from "./trusted-identity";

const SYNTHETIC_USER_ID = "synthetic-customer-user";

function runtimeWithFoundSession(
  found: { session: { expiresAt?: unknown }; user: { id: string } } | null,
): CustomerAuthRuntime {
  return {
    realm: "customer",
    async getAuth() {
      return {
        $context: Promise.resolve({
          internalAdapter: {
            async findSession() {
              return found;
            },
          },
        }),
      };
    },
    async close() {},
  } as unknown as CustomerAuthRuntime;
}

describe("customer raw session token expiry", () => {
  it("rejects a session with no expiry", async () => {
    const identity = await resolveTrustedCustomerAuthIdentity(
      runtimeWithFoundSession({
        session: {},
        user: { id: SYNTHETIC_USER_ID },
      }),
      { sessionToken: "synthetic-token" },
    );
    expect(identity).toBeNull();
  });

  it("rejects a session whose expiry is null", async () => {
    const identity = await resolveTrustedCustomerAuthIdentity(
      runtimeWithFoundSession({
        session: { expiresAt: null },
        user: { id: SYNTHETIC_USER_ID },
      }),
      { sessionToken: "synthetic-token" },
    );
    expect(identity).toBeNull();
  });

  it("rejects a session whose expiry is not a Date", async () => {
    const identity = await resolveTrustedCustomerAuthIdentity(
      runtimeWithFoundSession({
        session: { expiresAt: "2099-01-01T00:00:00.000Z" },
        user: { id: SYNTHETIC_USER_ID },
      }),
      { sessionToken: "synthetic-token" },
    );
    expect(identity).toBeNull();
  });

  it("rejects a session whose expiry is an invalid Date", async () => {
    const identity = await resolveTrustedCustomerAuthIdentity(
      runtimeWithFoundSession({
        session: { expiresAt: new Date(Number.NaN) },
        user: { id: SYNTHETIC_USER_ID },
      }),
      { sessionToken: "synthetic-token" },
    );
    expect(identity).toBeNull();
  });

  it("rejects an expired session without minting an identity", async () => {
    const identity = await resolveTrustedCustomerAuthIdentity(
      runtimeWithFoundSession({
        session: { expiresAt: new Date(Date.now() - 60_000) },
        user: { id: SYNTHETIC_USER_ID },
      }),
      { sessionToken: "synthetic-token" },
    );
    expect(identity).toBeNull();
  });

  it("mints an identity for an unexpired session", async () => {
    const identity = await resolveTrustedCustomerAuthIdentity(
      runtimeWithFoundSession({
        session: { expiresAt: new Date(Date.now() + 60_000) },
        user: { id: SYNTHETIC_USER_ID },
      }),
      { sessionToken: "synthetic-token" },
    );
    expect(identity?.userId).toBe(SYNTHETIC_USER_ID);
    expect(Object.keys(identity ?? {})).toEqual(["userId"]);
  });

  it("rejects a missing token and a missing session row", async () => {
    const runtime = runtimeWithFoundSession(null);
    await expect(
      resolveTrustedCustomerAuthIdentity(runtime, { sessionToken: "" }),
    ).resolves.toBeNull();
    await expect(
      resolveTrustedCustomerAuthIdentity(runtime, {
        sessionToken: "unknown-token",
      }),
    ).resolves.toBeNull();
  });
});
