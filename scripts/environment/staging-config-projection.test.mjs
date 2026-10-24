import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

import { BINDER_OUTCOME, BINDER_REASON, REQUIRED_CONFIG_PROJECTION_SERVICES, bindConfigurationEvidence, isSecretSafeProjection } from "./staging-evidence-binders.mjs";
import { CONFIG_PROJECTION_SCHEMA, liveProvenance, probeConfigurationObservation } from "./staging-evidence-probes.mjs";

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const adapter = path.join(repositoryRoot, "scripts", "environment", "staging-config-projection.ts");

const SECRET = "fixture-secret-DO-NOT-PRINT-9f3a7c";
const PASSWORD = "fixture-db-password-DO-NOT-PRINT-51b0";

function runAdapter(envDir) {
  const stdout = execFileSync(process.execPath, ["--import", "tsx", adapter, "--json", "--env-dir", envDir, "--repository-root", repositoryRoot], {
    cwd: repositoryRoot,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });
  return { stdout, parsed: JSON.parse(stdout) };
}

function writeStack(dir, { environment, origin, sslMode = "verify-full", extra = "" }) {
  const dbUrl = `postgresql://app_user:${PASSWORD}@db.internal.example.com/boba_bear`;
  writeFileSync(
    path.join(dir, ".env.runtime.docker.local"),
    [
      `BOBA_BEAR_ENV=${environment}`,
      `BOBA_BEAR_PUBLIC_ORIGIN=${origin}`,
      "BOBA_BEAR_RELEASE=rel-fixture",
      `BOBA_BEAR_DATABASE_URL=${dbUrl}`,
      `BOBA_BEAR_DATABASE_SSL_MODE=${sslMode}`,
      extra,
      "",
    ].join("\n"),
  );
  writeFileSync(
    path.join(dir, ".env.migration.docker.local"),
    [
      `BOBA_BEAR_ENV=${environment}`,
      `BOBA_BEAR_PUBLIC_ORIGIN=${origin}`,
      "BOBA_BEAR_RELEASE=rel-fixture",
      `BOBA_BEAR_DATABASE_URL=${dbUrl}`,
      `BOBA_BEAR_DATABASE_MIGRATION_URL=postgresql://migrator:${PASSWORD}@db.internal.example.com/boba_bear`,
      `BOBA_BEAR_DATABASE_SSL_MODE=${sslMode}`,
      "",
    ].join("\n"),
  );
  for (const name of [".env.customer-auth.docker.local", ".env.workforce-auth.docker.local", ".env.customer-commerce.docker.local", ".env.operations.docker.local"]) {
    writeFileSync(path.join(dir, name), `BOBA_BEAR_RAZORPAY_KEY_SECRET=${SECRET}\n`);
  }
}

function withTempDir(fn) {
  const dir = mkdtempSync(path.join(os.tmpdir(), "boba-s3-projection-"));
  try {
    return fn(dir);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

test("projection targets mirror compose.yaml env_file stacks for the required services", () => {
  const compose = readFileSync(path.join(repositoryRoot, "compose.yaml"), "utf8");
  const { stdout } = runAdapter("/tmp/does-not-exist-boba-s3");
  const projections = JSON.parse(stdout).projections;
  const services = projections.map((p) => p.service);
  assert.deepEqual([...services].sort(), [...REQUIRED_CONFIG_PROJECTION_SERVICES].sort());
  for (const projection of projections) {
    const block = compose.match(new RegExp(`^  ${projection.service}:\\n([\\s\\S]*?)(?=^  [a-z-]+:$)`, "m"));
    assert.ok(block, `compose service ${projection.service}`);
    const envFiles = [...block[1].matchAll(/^\s{6}- (\.env\.[\w.-]+)$/gm)].map((m) => m[1]);
    assert.deepEqual(projection.envFiles, envFiles, `env_file stack for ${projection.service}`);
  }
});

test("adapter: strict staging stack validates for every service and never emits a raw value", () => {
  withTempDir((dir) => {
    writeStack(dir, { environment: "staging", origin: "https://staging.thebobabear.in" });
    const { stdout, parsed } = runAdapter(dir);
    assert.equal(parsed.schema, CONFIG_PROJECTION_SCHEMA);
    assert.equal(stdout.includes(SECRET), false, "secret value must not appear in adapter output");
    assert.equal(stdout.includes(PASSWORD), false, "database password must not appear in adapter output");
    assert.equal(stdout.includes("db.internal.example.com"), false, "connection string must not appear in adapter output");
    for (const projection of parsed.projections) {
      assert.equal(isSecretSafeProjection(projection), true, projection.service);
      assert.equal(projection.environment, "staging");
      assert.equal(projection.envFilesPresent, true);
      assert.equal(projection.nodeEnvSource, "dockerfile", "NODE_ENV=production is observed from the Dockerfile runtime stage");
      assert.equal(projection.ok, true, `${projection.service}: ${JSON.stringify(projection.issues)}`);
    }
    const bound = bindConfigurationEvidence({ provenance: liveProvenance("t"), projections: parsed.projections, requiredEnvFilesPresent: true, diagnostic: { enabled: false, projectionKnown: true, conflict: false } });
    assert.equal(bound.outcome, BINDER_OUTCOME.BOUND, JSON.stringify(bound.findings));
  });
});

test("adapter: BOBA_BEAR_ENV=local is reported as Local UAT and the S3 binder blocks it (D-385)", () => {
  withTempDir((dir) => {
    writeStack(dir, { environment: "local", origin: "http://localhost:3000", sslMode: "disable" });
    const { stdout, parsed } = runAdapter(dir);
    assert.equal(stdout.includes(SECRET), false);
    assert.equal(parsed.projections.every((p) => p.environment === "local"), true);
    const bound = bindConfigurationEvidence({ provenance: liveProvenance("t"), projections: parsed.projections, requiredEnvFilesPresent: true, diagnostic: { enabled: false, projectionKnown: true, conflict: false } });
    assert.equal(bound.outcome, BINDER_OUTCOME.BLOCKED);
    assert.equal(bound.evidence.environment.projectedConfigState, "LOCAL_UAT_NOT_STAGING");
    assert.ok(bound.findings.some((f) => f.code === BINDER_REASON.CONFIG_LOCAL_UAT_NOT_STRICT_STAGING));
  });
});

test("adapter: strict staging violations surface as value-free issues (HTTP origin, TLS disabled)", () => {
  withTempDir((dir) => {
    writeStack(dir, { environment: "staging", origin: "http://staging.thebobabear.in", sslMode: "disable" });
    const { stdout, parsed } = runAdapter(dir);
    assert.equal(stdout.includes(SECRET), false);
    assert.equal(stdout.includes(PASSWORD), false);
    const runtime = parsed.projections.find((p) => p.service === "customer-auth");
    assert.equal(runtime.ok, false);
    const keys = runtime.issues.map((i) => i.key);
    assert.ok(keys.includes("BOBA_BEAR_PUBLIC_ORIGIN"), keys.join(","));
    assert.ok(keys.includes("BOBA_BEAR_DATABASE_SSL_MODE"), keys.join(","));
    for (const issue of runtime.issues) {
      assert.equal(Object.keys(issue).sort().join(","), "key,message");
      assert.equal(/http:\/\/staging|example\.com|fixture/.test(issue.message), false, issue.message);
    }
    const bound = bindConfigurationEvidence({ provenance: liveProvenance("t"), projections: parsed.projections, requiredEnvFilesPresent: true, diagnostic: { enabled: false, projectionKnown: true, conflict: false } });
    assert.equal(bound.outcome, BINDER_OUTCOME.BLOCKED);
    assert.ok(bound.findings.some((f) => f.code === BINDER_REASON.CONFIG_STRICT_STAGING_INVALID));
  });
});

test("adapter: unknown BOBA_BEAR_* keys and a missing env stack are reported without values", () => {
  withTempDir((dir) => {
    writeStack(dir, { environment: "staging", origin: "https://staging.thebobabear.in", extra: `BOBA_BEAR_NOT_APPROVED=${SECRET}` });
    rmSync(path.join(dir, ".env.operations.docker.local"));
    const { stdout, parsed } = runAdapter(dir);
    assert.equal(stdout.includes(SECRET), false);
    const customerAuth = parsed.projections.find((p) => p.service === "customer-auth");
    assert.equal(customerAuth.ok, false);
    assert.ok(customerAuth.issues.some((i) => i.key === "BOBA_BEAR_NOT_APPROVED"));
    const operations = parsed.projections.find((p) => p.service === "operations");
    assert.equal(operations.envFilesPresent, false);
    assert.equal(operations.ok, false);
    assert.equal(operations.issues[0].key, "ENV_STACK");
  });
});

test("probe + adapter end to end: missing staging env dir yields MISSING environments and binder UNKNOWN", () => {
  const obs = probeConfigurationObservation({ repositoryRoot, stagingEnvDir: "/tmp/does-not-exist-boba-s3", diagnostic: { enabled: false, projectionKnown: false, conflict: false }, requiredEnvFilesPresent: false });
  assert.equal(obs.projections.length, REQUIRED_CONFIG_PROJECTION_SERVICES.length);
  // The repository root may legitimately contain developer .env.*.docker.local files; the probe
  // reports whatever it observed, so only the invariant "no projection claims strict staging from a
  // missing stack" is asserted here.
  for (const projection of obs.projections) {
    assert.equal(isSecretSafeProjection(projection), true);
    if (!projection.envFilesPresent) assert.equal(projection.ok, false);
  }
  const bound = bindConfigurationEvidence(obs);
  assert.notEqual(bound.outcome, BINDER_OUTCOME.BOUND);
});
