#!/usr/bin/env node
/**
 * IMP-036J cross-portal shared-DB browser E2E runner.
 * One run-owned disposable Postgres for operator commercial + customer commerce.
 * Fake Payment via e2e-fake-main only. Local/test OTP only. Never staging/production.
 */
import { spawnSync } from "node:child_process";
import { randomBytes, randomInt, randomUUID } from "node:crypto";
import { chmodSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import net from "node:net";
import os from "node:os";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { buildCommercialWorkspaceSeed } from "./build-commercial-workspace-seed.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const composeFile = "compose.cross-portal-promotion-e2e.yaml";
const project = `imp036jxp_${randomBytes(6).toString("hex")}`;
if (!/^imp036jxp_[a-z0-9]+$/.test(project)) throw new Error("Invalid E2E project name.");
const podmanSocket = `unix:///run/user/${process.getuid()}/podman/podman.sock`;
// Seed builder only allows imp036fe2e_ / imp036f-runtime-asset-repair- temp prefixes.
const tempDir = mkdtempSync(path.join(os.tmpdir(), "imp036fe2e_"));
chmodSync(tempDir, 0o700);
const envFile = path.join(tempDir, "runtime.env");
const manifest = path.join(tempDir, "fixtures.json");
const runId = randomUUID();

function port() {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      server.close((error) => (error ? reject(error) : resolve(address.port)));
    });
  });
}
function secret(label) {
  return `${label}-${randomBytes(24).toString("hex")}`;
}
const childEnv = { ...process.env, DOCKER_HOST: podmanSocket, TESTCONTAINERS_RYUK_DISABLED: "true" };
delete childEnv.DOCKER_CONTEXT;
const sensitiveValues = new Set();
function redact(output) {
  return [...sensitiveValues]
    .filter(Boolean)
    .sort((left, right) => right.length - left.length)
    .reduce((value, sensitive) => value.split(sensitive).join("[REDACTED]"), output);
}
function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: root,
    env: { ...childEnv, ...options.env },
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024,
  });
  if (result.stdout) process.stdout.write(redact(result.stdout));
  if (result.stderr) process.stderr.write(redact(result.stderr));
  if (result.status !== 0) throw new Error(`${command} failed.`);
  return result;
}
function runAllowFail(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: root,
    env: { ...childEnv, ...options.env },
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024,
  });
  if (result.stdout) process.stdout.write(redact(result.stdout));
  if (result.stderr) process.stderr.write(redact(result.stderr));
  return result;
}
function compose(args, options) {
  run("podman-compose", ["-p", project, "-f", composeFile, "--env-file", envFile, ...args], options);
}
async function waitFor(url, timeout = 90_000) {
  const until = Date.now() + timeout;
  while (Date.now() < until) {
    try {
      if ((await fetch(url)).ok) return;
    } catch {
      /* retry */
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error(`Timed out waiting for ${url}`);
}
function serviceId(service) {
  return spawnSync(
    "podman",
    [
      "ps",
      "--all",
      "--filter",
      `label=io.podman.compose.project=${project}`,
      "--filter",
      `label=com.docker.compose.service=${service}`,
      "--format",
      "{{.ID}}",
    ],
    { cwd: root, env: childEnv, encoding: "utf8" },
  ).stdout.trim();
}
async function waitForHealth(service, timeout = 180_000) {
  const until = Date.now() + timeout;
  while (Date.now() < until) {
    const id = serviceId(service);
    if (id) {
      const result = spawnSync("podman", ["inspect", "--format", "{{.State.Health.Status}}|{{.State.Status}}", id], {
        cwd: root,
        env: childEnv,
        encoding: "utf8",
      });
      if (result.status === 0) {
        const [health, state] = result.stdout.trim().split("|");
        if (health === "healthy") return;
        if (state === "exited" || state === "dead") {
          runAllowFail("podman", ["logs", "--tail", "80", id]);
          throw new Error(`${service} container exited before becoming healthy.`);
        }
      }
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  const id = serviceId(service);
  if (id) runAllowFail("podman", ["logs", "--tail", "80", id]);
  throw new Error(`Timed out waiting for ${service} health.`);
}

/** Start the static Nginx app without podman `--requires` (4.9.x dependency-graph flake). */
function startAppWithoutRequires(appPort) {
  const appName = `${project}_app_1`;
  runAllowFail("podman", ["rm", "-f", appName]);
  run("podman", [
    "run",
    "-d",
    "--name",
    appName,
    "--label",
    `io.podman.compose.project=${project}`,
    "--label",
    `com.docker.compose.project=${project}`,
    "--label",
    "com.docker.compose.service=app",
    "--network",
    `${project}_default`,
    "--network-alias",
    "app",
    "-p",
    `127.0.0.1:${appPort}:8080`,
    "--read-only",
    "--security-opt",
    "no-new-privileges:true",
    "--cap-drop",
    "ALL",
    "--tmpfs",
    "/tmp",
    "--tmpfs",
    "/var/cache/nginx",
    "--tmpfs",
    "/var/run",
    "--healthcheck-command",
    "CMD-SHELL wget --quiet --spider http://127.0.0.1:8080/ || exit 1",
    "--healthcheck-interval",
    "5s",
    "--healthcheck-timeout",
    "3s",
    "--healthcheck-start-period",
    "5s",
    "--healthcheck-retries",
    "10",
    `${project}_app`,
  ]);
}

let cleaned = false;
function cleanup() {
  if (cleaned) return;
  cleaned = true;
  try {
    compose(["down", "-v", "--remove-orphans"]);
  } catch {
    /* best-effort */
  }
  try {
    run("podman", ["network", "rm", `${project}_default`]);
  } catch {
    /* best-effort */
  }
  rmSync(tempDir, { recursive: true, force: true });
}
process.on("SIGINT", () => {
  cleanup();
  process.exit(130);
});
process.on("SIGTERM", () => {
  cleanup();
  process.exit(143);
});

try {
  if (process.cwd() !== root) process.chdir(root);
  const [appPort, postgresPort] = await Promise.all([port(), port()]);
  const origin = `http://127.0.0.1:${appPort}`;
  if (!/^http:\/\/127\.0\.0\.1:\d+$/.test(origin)) {
    throw new Error("Cross-portal E2E refuses non-loopback origin.");
  }
  const admin = secret("admin");
  const migrator = secret("migrator");
  const app = secret("app");
  const customerAuthSecret = secret("customer-auth");
  const customerAuthPiiHashSecret = secret("customer-auth-pii");
  const hostMigrationDatabaseUrl = `postgresql://boba_bear_migrator:${migrator}@127.0.0.1:${postgresPort}/boba_bear_local`;
  const hostSeedDatabaseUrl = hostMigrationDatabaseUrl;
  const containerApplicationDatabaseUrl = `postgresql://boba_bear_app:${app}@postgres:5432/boba_bear_local`;
  const workforceAuthSecret = secret("workforce");
  const workforceAuthPiiHashSecret = secret("workforce-pii");
  const workforceE2eEmail = `xp-admin-${randomUUID()}@example.test`;
  const workforceE2eTempPassword = secret("temp");
  const workforceE2ePermanentPassword = secret("permanent");
  const deniedOperatorEmail = `xp-denied-${randomUUID()}@example.test`;
  const deniedOperatorTempPassword = secret("denied-temp");
  const deniedOperatorPermanentPassword = secret("denied-permanent");
  const customerOtpLocalFixedCode = String(randomInt(100000, 1000000));
  const phoneSeed = String(randomInt(10000, 100000));
  [
    admin,
    migrator,
    app,
    customerAuthSecret,
    customerAuthPiiHashSecret,
    workforceAuthSecret,
    workforceAuthPiiHashSecret,
    workforceE2eTempPassword,
    workforceE2ePermanentPassword,
    deniedOperatorTempPassword,
    deniedOperatorPermanentPassword,
    customerOtpLocalFixedCode,
  ].forEach((value) => sensitiveValues.add(value));

  const lines = {
    POSTGRES_USER: "boba_bear_admin",
    POSTGRES_PASSWORD: admin,
    POSTGRES_DB: "postgres",
    POSTGRES_MIGRATOR_PASSWORD: migrator,
    POSTGRES_APP_PASSWORD: app,
    POSTGRES_HOST_PORT: String(postgresPort),
    BOBA_BEAR_APP_HOST_PORT: String(appPort),
    BOBA_BEAR_PUBLIC_ORIGIN: origin,
    BOBA_BEAR_DATABASE_URL: containerApplicationDatabaseUrl,
    BOBA_BEAR_DATABASE_MIGRATION_URL: hostMigrationDatabaseUrl,
    WORKFORCE_AUTH_SECRET: workforceAuthSecret,
    WORKFORCE_AUTH_PII_HASH_SECRET: workforceAuthPiiHashSecret,
    WORKFORCE_AUTH_BASE_URL: origin,
    CUSTOMER_AUTH_SECRET: customerAuthSecret,
    CUSTOMER_AUTH_PII_HASH_SECRET: customerAuthPiiHashSecret,
    CUSTOMER_AUTH_BASE_URL: origin,
    CUSTOMER_OTP_LOCAL_FIXED_CODE: customerOtpLocalFixedCode,
  };
  writeFileSync(
    envFile,
    Object.entries(lines)
      .map(([key, value]) => `${key}=${value}`)
      .join("\n") + "\n",
    { mode: 0o600 },
  );

  const migrationEnv = {
    BOBA_BEAR_ENV: "test",
    BOBA_BEAR_ALLOW_UNSAFE_ADAPTERS: "true",
    BOBA_BEAR_DATABASE_SSL_MODE: "disable",
    BOBA_BEAR_DATABASE_MIGRATION_URL: hostMigrationDatabaseUrl,
    BOBA_BEAR_PUBLIC_ORIGIN: origin,
  };
  const seedEnv = {
    BOBA_BEAR_ENV: "test",
    BOBA_BEAR_ALLOW_UNSAFE_ADAPTERS: "true",
    BOBA_BEAR_DATABASE_SSL_MODE: "disable",
    BOBA_BEAR_DATABASE_URL: hostSeedDatabaseUrl,
    BOBA_BEAR_DATABASE_MIGRATION_URL: hostMigrationDatabaseUrl,
    BOBA_BEAR_PUBLIC_ORIGIN: origin,
    CUSTOMER_AUTH_SECRET: customerAuthSecret,
    CUSTOMER_AUTH_PII_HASH_SECRET: customerAuthPiiHashSecret,
    CUSTOMER_AUTH_BASE_URL: origin,
    WORKFORCE_AUTH_SECRET: workforceAuthSecret,
    WORKFORCE_AUTH_PII_HASH_SECRET: workforceAuthPiiHashSecret,
    WORKFORCE_AUTH_BASE_URL: origin,
    WORKFORCE_E2E_EMAIL: workforceE2eEmail,
    WORKFORCE_E2E_TEMP_PASSWORD: workforceE2eTempPassword,
    WORKFORCE_E2E_PERMANENT_PASSWORD: workforceE2ePermanentPassword,
    COMMERCIAL_E2E_FIXTURE_MANIFEST: manifest,
  };
  const fixtureEnv = {
    ...seedEnv,
    IMP036J_CROSS_PORTAL_FIXTURE_MANIFEST: manifest,
    WORKFORCE_E2E_DENIED_EMAIL: deniedOperatorEmail,
    WORKFORCE_E2E_DENIED_TEMP_PASSWORD: deniedOperatorTempPassword,
    WORKFORCE_E2E_DENIED_PERMANENT_PASSWORD: deniedOperatorPermanentPassword,
    CROSS_PORTAL_RUN_ID: runId,
    CROSS_PORTAL_COMPOSE_PROJECT: project,
    CROSS_PORTAL_POSTGRES_HOST_PORT: String(postgresPort),
    CROSS_PORTAL_PHONE_SEED: phoneSeed,
    CUSTOMER_OTP_LOCAL_FIXED_CODE: customerOtpLocalFixedCode,
  };
  const e2eEnv = {
    PLAYWRIGHT_BASE_URL: origin,
    CROSS_PORTAL_E2E_BASE_URL: origin,
    WORKFORCE_E2E_EMAIL: workforceE2eEmail,
    WORKFORCE_E2E_TEMP_PASSWORD: workforceE2eTempPassword,
    WORKFORCE_E2E_PERMANENT_PASSWORD: workforceE2ePermanentPassword,
    WORKFORCE_E2E_DENIED_EMAIL: deniedOperatorEmail,
    WORKFORCE_E2E_DENIED_TEMP_PASSWORD: deniedOperatorTempPassword,
    WORKFORCE_E2E_DENIED_PERMANENT_PASSWORD: deniedOperatorPermanentPassword,
    COMMERCIAL_E2E_FIXTURE_MANIFEST: manifest,
    CROSS_PORTAL_E2E_FIXTURE_MANIFEST: manifest,
    CUSTOMER_OTP_LOCAL_FIXED_CODE: customerOtpLocalFixedCode,
    CROSS_PORTAL_RUN_ID: runId,
    CROSS_PORTAL_COMPOSE_PROJECT: project,
    CROSS_PORTAL_POSTGRES_HOST_PORT: String(postgresPort),
    CROSS_PORTAL_PHONE_SEED: phoneSeed,
    CROSS_PORTAL_FAKE_PAYMENT: "e2e-fake-main+razorpay_standard_checkout",
    BOBA_BEAR_ENV: "test",
  };

  console.log(`IMP-036J cross-portal E2E: project=${project} runId=${runId} origin=${origin}`);
  console.log(`ONE_DATABASE_IDENTITY: compose_project=${project} postgres_host_port=${postgresPort}`);
  const compiledSeed = buildCommercialWorkspaceSeed({ outputRoot: path.join(tempDir, "compiled-seed") });
  compose(["build", "app", "workforce-auth", "operations", "customer-auth", "customer-commerce"]);
  compose(["up", "-d", "postgres"]);
  await waitForHealth("postgres");
  {
    const until = Date.now() + 90_000;
    let ready = false;
    while (Date.now() < until) {
      const probe = spawnSync(
        process.execPath,
        [
          "-e",
          `const net=require('net');const s=net.connect({host:'127.0.0.1',port:${postgresPort}},()=>{s.end();process.exit(0);});s.on('error',()=>process.exit(1));setTimeout(()=>process.exit(1),2000);`,
        ],
        { cwd: root, env: childEnv, encoding: "utf8" },
      );
      if (probe.status === 0) {
        await new Promise((resolve) => setTimeout(resolve, 2000));
        ready = true;
        break;
      }
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
    if (!ready) throw new Error("Timed out waiting for postgres host port.");
  }
  {
    let lastError = null;
    for (let attempt = 1; attempt <= 10; attempt += 1) {
      try {
        run("npx", ["tsx", "scripts/database/migrate.ts"], { env: migrationEnv });
        lastError = null;
        break;
      } catch (error) {
        lastError = error;
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
    }
    if (lastError) throw lastError;
  }
  run("node", ["--conditions=react-server", compiledSeed.entryPath], { env: seedEnv });
  run(
    "node",
    ["--conditions=react-server", "--import", "tsx", "scripts/database/cross-portal-promotion-fixtures.ts"],
    { env: fixtureEnv },
  );
  compose(["up", "-d", "workforce-auth", "operations", "customer-auth", "customer-commerce"]);
  await Promise.all(
    ["workforce-auth", "operations", "customer-auth", "customer-commerce"].map((service) => waitForHealth(service)),
  );
  startAppWithoutRequires(appPort);
  await waitForHealth("app");
  await waitFor(`${origin}/`);
  compose(["ps"]);
  run("podman", ["exec", `${project}_app_1`, "nginx", "-T"]);
  run("npx", ["playwright", "test", "--config=playwright.cross-portal-promotion.config.ts"], { env: e2eEnv });
  console.log("IMP-036J cross-portal E2E: PASS (one disposable Postgres, actual Nginx, fake Payment)");
  console.log(`CLEANUP_SCOPE: project=${project} volumes=run-owned-only protected=boba-bear_postgres-data,boba-staging`);
} finally {
  cleanup();
}
