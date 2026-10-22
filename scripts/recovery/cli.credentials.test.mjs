/**
 * CS4/C2: credential-bearing subprocess argv negative tests for the real dump builder.
 */
import assert from "node:assert/strict";
import { test } from "node:test";
import {
  applyLibpqSecretEnv,
  buildLibpqChildConnection,
  buildPgDumpArgv,
} from "./restore/logical.mjs";

const SENTINEL = "SENTINEL_CLI_DUMP_PASSWORD_7c1e";
const SSL_SENTINEL = "SENTINEL_SSL_PASSWORD_9a2f";

test("CS4/C2: buildPgDumpArgv uses password-free URI and preserves sslmode", () => {
  const databaseUrl = `postgresql://backup_user:${encodeURIComponent(SENTINEL)}@10.0.0.9:5432/boba_prod?sslmode=verify-full&sslrootcert=/etc/ssl/certs/ca.pem&connect_timeout=5&application_name=boba-recovery`;
  const conn = buildLibpqChildConnection(databaseUrl);
  assert.equal(conn.ok, true);
  assert.equal(conn.query.sslmode, "verify-full");
  assert.equal(conn.query.sslrootcert, "/etc/ssl/certs/ca.pem");
  assert.match(conn.connectionUri, /sslmode=verify-full/);
  assert.match(conn.connectionUri, /sslrootcert=/);
  assert.doesNotMatch(conn.connectionUri, new RegExp(SENTINEL));

  const argv = buildPgDumpArgv(conn);
  const env = applyLibpqSecretEnv({ PATH: "/usr/bin" }, conn);

  assert.deepEqual(argv[0], "-Fc");
  assert.equal(argv.includes(databaseUrl), false);
  assert.equal(argv.some((a) => String(a).includes(SENTINEL)), false);
  assert.equal(JSON.stringify(argv).includes(SENTINEL), false);
  assert.match(argv[1], /^postgres(ql)?:\/\//);
  assert.match(argv[1], /sslmode=verify-full/);
  assert.equal(env.PGPASSWORD, SENTINEL);
});

test("CS4/C2: sslpassword and query password never enter argv", () => {
  const databaseUrl = `postgresql://backup_user@10.0.0.9:5432/boba_prod?sslmode=require&password=${encodeURIComponent(SENTINEL)}&sslpassword=${encodeURIComponent(SSL_SENTINEL)}`;
  const conn = buildLibpqChildConnection(databaseUrl);
  assert.equal(conn.ok, true);
  const argv = buildPgDumpArgv(conn);
  const env = applyLibpqSecretEnv({}, conn);
  assert.equal(argv.some((a) => String(a).includes(SENTINEL)), false);
  assert.equal(argv.some((a) => String(a).includes(SSL_SENTINEL)), false);
  assert.doesNotMatch(conn.connectionUri, /password=/);
  assert.doesNotMatch(conn.connectionUri, /sslpassword=/);
  assert.equal(env.PGPASSWORD, SENTINEL);
  assert.equal(env.PGSSLPASSWORD, SSL_SENTINEL);
});

test("CS4/C2: unsupported security-relevant libpq parameter is BLOCKED", () => {
  const conn = buildLibpqChildConnection(
    "postgresql://backup_user@10.0.0.9:5432/boba_prod?sslmode=verify-full&sslweird=1",
  );
  assert.equal(conn.ok, false);
  assert.match(conn.reason, /unsupported security-relevant|unsupported libpq/i);
});

test("CS4/C2: missing host/hostaddr refuses localhost fallback", () => {
  const conn = buildLibpqChildConnection("postgresql:///boba_prod?sslmode=require&user=backup_user");
  assert.equal(conn.ok, false);
  assert.match(conn.reason, /host\/hostaddr|localhost fallback/i);
});

test("CS4/C2: encoded credentials round-trip into PGPASSWORD only", () => {
  const password = "p@ss/word:weird";
  const databaseUrl = `postgresql://backup%2Fuser:${encodeURIComponent(password)}@10.0.0.9:5432/boba_prod?sslmode=verify-full`;
  const conn = buildLibpqChildConnection(databaseUrl);
  assert.equal(conn.ok, true);
  assert.equal(conn.user, "backup/user");
  assert.equal(conn.password, password);
  const argv = buildPgDumpArgv(conn);
  assert.equal(argv.some((a) => String(a).includes(password)), false);
  assert.equal(applyLibpqSecretEnv({}, conn).PGPASSWORD, password);
});
