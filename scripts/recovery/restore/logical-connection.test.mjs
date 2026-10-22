/**
 * C2/R1/R2: libpq connection URI identity + TLS semantics — production builders only.
 */
import assert from "node:assert/strict";
import { test } from "node:test";
import {
  applyLibpqSecretEnv,
  buildLibpqChildConnection,
  buildPgDumpArgv,
  buildPgRestoreHostArgv,
  buildPsqlHostArgv,
} from "./logical.mjs";

const SENTINEL = "SENTINEL_RESTORE_PASSWORD_4d8e";
const SSL_SENTINEL = "SENTINEL_SSL_PASSWORD_9a2f";

test("C2: verify-full + sslrootcert/sslcert preserved on pg_restore/psql argv builders", () => {
  const url = `postgresql://rec_user:${SENTINEL}@10.9.8.7:6543/boba_recovery?sslmode=verify-full&sslrootcert=/tmp/ca.pem&sslcert=/tmp/client.pem&sslkey=/tmp/client.key&target_session_attrs=read-write&options=-c%20search_path%3Dpublic`;
  const conn = buildLibpqChildConnection(url);
  assert.equal(conn.ok, true);
  assert.equal(conn.query.sslmode, "verify-full");
  assert.equal(conn.query.sslrootcert, "/tmp/ca.pem");
  assert.equal(conn.query.sslcert, "/tmp/client.pem");
  assert.equal(conn.query.sslkey, "/tmp/client.key");
  assert.equal(conn.query.target_session_attrs, "read-write");

  const restoreArgv = buildPgRestoreHostArgv(conn, "/tmp/owned.dump");
  const psqlArgv = buildPsqlHostArgv(conn, ["-c", "select 1"]);
  const env = applyLibpqSecretEnv({}, conn);

  for (const argv of [restoreArgv, psqlArgv]) {
    assert.equal(argv.some((a) => String(a).includes(SENTINEL)), false);
    assert.equal(argv.some((a) => String(a) === url), false);
    assert.match(JSON.stringify(argv), /sslmode=verify-full/);
    assert.match(JSON.stringify(argv), /sslrootcert=/);
    assert.match(JSON.stringify(argv), /sslcert=/);
  }
  assert.equal(env.PGPASSWORD, SENTINEL);
  assert.equal(env.PGSSLPASSWORD, undefined);
  assert.equal(env.PGSSLMODE, undefined); // carried in URI, not weakened via env override
});

test("C2: hostaddr-only URL preserved without inventing localhost", () => {
  const conn = buildLibpqChildConnection(
    "postgresql:///boba_recovery?hostaddr=10.1.2.3&user=rec_user&port=5433&sslmode=require",
  );
  assert.equal(conn.ok, true);
  assert.equal(conn.host, "10.1.2.3");
  assert.equal(conn.port, "5433");
  assert.equal(conn.user, "rec_user");
  assert.match(conn.connectionUri, /hostaddr=10\.1\.2\.3/);
  assert.match(conn.connectionUri, /port=5433/);
  assert.doesNotMatch(conn.connectionUri, /127\.0\.0\.1|localhost/);
});

test("C2: host + hostaddr both preserved", () => {
  const conn = buildLibpqChildConnection(
    "postgresql://rec_user@db.example:5432/boba_recovery?hostaddr=10.1.2.3&sslmode=verify-full",
  );
  assert.equal(conn.ok, true);
  assert.equal(conn.host, "db.example");
  assert.match(conn.connectionUri, /db\.example/);
  assert.match(conn.connectionUri, /hostaddr=10\.1\.2\.3/);
  assert.match(conn.connectionUri, /sslmode=verify-full/);
});

test("C2: ambiguous password userinfo vs query is BLOCKED", () => {
  const conn = buildLibpqChildConnection(
    `postgresql://u:${SENTINEL}@10.0.0.1:5432/db?password=other-secret`,
  );
  assert.equal(conn.ok, false);
  assert.match(conn.reason, /ambiguous/i);
});

test("C2: unsupported unknown parameter is BLOCKED", () => {
  const conn = buildLibpqChildConnection(
    "postgresql://u@10.0.0.1:5432/db?sslmode=require&not_a_libpq_param=1",
  );
  assert.equal(conn.ok, false);
  assert.match(conn.reason, /unsupported libpq parameter/i);
});

test("R1: query dbname differing from path dbname is BLOCKED", () => {
  const conn = buildLibpqChildConnection(
    "postgresql://u@10.0.0.1:5432/pathdb?dbname=querydb&sslmode=require",
  );
  assert.equal(conn.ok, false);
  assert.match(conn.reason, /ambiguous.*dbname|dbname.*disagree/i);
});

test("R1: query user differing from URI username is BLOCKED", () => {
  const conn = buildLibpqChildConnection(
    "postgresql://uri_user@10.0.0.1:5432/db?user=query_user&sslmode=require",
  );
  assert.equal(conn.ok, false);
  assert.match(conn.reason, /ambiguous.*user|user.*disagree/i);
});

test("R1: query host differing from URI host is BLOCKED", () => {
  const conn = buildLibpqChildConnection(
    "postgresql://u@10.0.0.1:5432/db?host=10.0.0.9&sslmode=require",
  );
  assert.equal(conn.ok, false);
  assert.match(conn.reason, /ambiguous.*host|host.*disagree/i);
});

test("R1: query port differing from URI port is BLOCKED", () => {
  const conn = buildLibpqChildConnection(
    "postgresql://u@10.0.0.1:5432/db?port=6543&sslmode=require",
  );
  assert.equal(conn.ok, false);
  assert.match(conn.reason, /ambiguous.*port|port.*disagree/i);
});

test("R1: conflicting repeated query parameters are BLOCKED", () => {
  const conn = buildLibpqChildConnection(
    "postgresql://u@10.0.0.1:5432/db?sslmode=require&hostaddr=10.1.1.1&hostaddr=10.1.1.2",
  );
  assert.equal(conn.ok, false);
  assert.match(conn.reason, /ambiguous repeated|conflicting/i);
});

test("R1: matching duplicate query values remain safe", () => {
  const conn = buildLibpqChildConnection(
    "postgresql://u@10.0.0.1:5432/db?sslmode=verify-full&sslmode=verify-full&application_name=boba",
  );
  assert.equal(conn.ok, true);
  assert.equal(conn.query.sslmode, "verify-full");
  assert.match(conn.connectionUri, /sslmode=verify-full/);
});

test("R1: matching URI + query identity fields remain safe", () => {
  const conn = buildLibpqChildConnection(
    "postgresql://same_user@10.0.0.1:5432/samedb?user=same_user&host=10.0.0.1&port=5432&dbname=samedb&sslmode=require",
  );
  assert.equal(conn.ok, true);
  assert.equal(conn.user, "same_user");
  assert.equal(conn.host, "10.0.0.1");
  assert.equal(conn.port, "5432");
  assert.equal(conn.database, "samedb");
});

test("R1: dbname-only-via-query is accepted when path empty", () => {
  const conn = buildLibpqChildConnection(
    "postgresql://u@10.0.0.1:5432/?dbname=querydb&sslmode=require",
  );
  assert.equal(conn.ok, true);
  assert.equal(conn.database, "querydb");
  assert.match(conn.connectionUri, /\/querydb/);
});

test("R1: no invented localhost fallback on missing host/hostaddr", () => {
  const conn = buildLibpqChildConnection("postgresql:///boba_prod?sslmode=require&user=backup_user");
  assert.equal(conn.ok, false);
  assert.match(conn.reason, /host\/hostaddr|localhost fallback/i);
});

test("R1: short synthetic password does not false-reject via substring", () => {
  // Password "a" appears in many URI substrings; structured checks must not reject.
  const password = "a";
  const conn = buildLibpqChildConnection(
    `postgresql://backup_user:${encodeURIComponent(password)}@10.0.0.9:5432/boba_prod?sslmode=verify-full&application_name=app`,
  );
  assert.equal(conn.ok, true);
  assert.equal(conn.password, password);
  const argv = buildPgDumpArgv(conn);
  assert.equal(argv.some((a) => String(a).includes(`:${password}@`)), false);
  assert.equal(applyLibpqSecretEnv({}, conn).PGPASSWORD, password);
});

test("R2: nonempty sslpassword is rejected fail-closed (no PGSSLPASSWORD claim)", () => {
  const databaseUrl = `postgresql://backup_user@10.0.0.9:5432/boba_prod?sslmode=require&sslpassword=${encodeURIComponent(SSL_SENTINEL)}`;
  const conn = buildLibpqChildConnection(databaseUrl);
  assert.equal(conn.ok, false);
  assert.match(conn.reason, /sslpassword|unsupported for unattended/i);
  assert.match(conn.reason, /PGSSLPASSWORD is not valid/i);
  assert.doesNotMatch(conn.reason, new RegExp(SSL_SENTINEL));
  // Must fail before any argv/env secret delivery path is reachable.
  assert.equal("connectionUri" in conn, false);
});

test("R2: query password without sslpassword still uses PGPASSWORD only", () => {
  const databaseUrl = `postgresql://backup_user@10.0.0.9:5432/boba_prod?sslmode=require&password=${encodeURIComponent(SENTINEL)}`;
  const conn = buildLibpqChildConnection(databaseUrl);
  assert.equal(conn.ok, true);
  const argv = buildPgDumpArgv(conn);
  const env = applyLibpqSecretEnv({}, conn);
  assert.equal(argv.some((a) => String(a).includes(SENTINEL)), false);
  assert.doesNotMatch(conn.connectionUri, /password=/);
  assert.doesNotMatch(conn.connectionUri, /sslpassword=/);
  assert.equal(env.PGPASSWORD, SENTINEL);
  assert.equal(Object.hasOwn(env, "PGSSLPASSWORD"), false);
});

test("R2: password-free rebuilt URI contains no password component", () => {
  const conn = buildLibpqChildConnection(
    `postgresql://u:${encodeURIComponent(SENTINEL)}@10.0.0.1:5432/db?sslmode=verify-full`,
  );
  assert.equal(conn.ok, true);
  const rebuilt = new URL(conn.connectionUri);
  assert.equal(rebuilt.password, "");
  assert.equal(rebuilt.searchParams.has("password"), false);
  assert.equal(rebuilt.searchParams.has("sslpassword"), false);
});
