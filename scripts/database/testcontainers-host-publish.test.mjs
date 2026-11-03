/**
 * Static + pre-start binding proof for disposable Testcontainers Postgres
 * loopback host publish. Does not start a container (runtime Podman proof is
 * recorded separately during attended isolation validation).
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const require = createRequire(import.meta.url);

test("installed testcontainers PortWithBinding has no hostIp field", () => {
  const portDts = readFileSync(
    path.join(projectRoot, "node_modules/testcontainers/build/utils/port.d.ts"),
    "utf8",
  );
  assert.match(portDts, /export type PortWithBinding = \{/);
  assert.doesNotMatch(portDts, /hostIp/);
  const pkg = require(path.join(projectRoot, "node_modules/testcontainers/package.json"));
  assert.equal(pkg.version, "12.1.0");
});

test("test-container helper scopes disposable publish to 127.0.0.1 before start", async () => {
  const { PostgreSqlContainer } = await import("@testcontainers/postgresql");
  const supportPath = path.join(projectRoot, "tests/database/support/test-container.ts");
  const { bindDisposablePostgresPublishToLoopback, DISPOSABLE_POSTGRES_HOST_PUBLISH_IP } =
    await import(supportPath);

  const pending = new PostgreSqlContainer("postgres:18.4-trixie");
  const hostConfig = /** @type {{ PortBindings?: Record<string, Array<{ HostIp?: string; HostPort: string }>> }} */ (
    /** @type {unknown} */ (pending)
  ).hostConfig;
  assert.deepEqual(hostConfig.PortBindings?.["5432/tcp"], [{ HostPort: "0" }]);

  bindDisposablePostgresPublishToLoopback(pending);
  assert.deepEqual(hostConfig.PortBindings?.["5432/tcp"], [
    { HostPort: "0", HostIp: DISPOSABLE_POSTGRES_HOST_PUBLISH_IP },
  ]);
  assert.equal(DISPOSABLE_POSTGRES_HOST_PUBLISH_IP, "127.0.0.1");
});

test("startPostgresTestContainer source keeps random port, no reuse, loopback HostIp", () => {
  const source = readFileSync(
    path.join(projectRoot, "tests/database/support/test-container.ts"),
    "utf8",
  );
  assert.match(source, /HostIp = DISPOSABLE_POSTGRES_HOST_PUBLISH_IP/);
  assert.match(source, /bindDisposablePostgresPublishToLoopback\(pending\)/);
  assert.doesNotMatch(source, /^\s*\.withReuse\(\)/m);
  assert.doesNotMatch(source, /HostPort:\s*"[1-9]/);
});
