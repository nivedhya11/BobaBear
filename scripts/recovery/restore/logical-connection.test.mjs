/**
 * C2: libpq connection URI security semantics — exercise production builders only.
 */
import assert from "node:assert/strict";
import { test } from "node:test";
import {
  applyLibpqSecretEnv,
  buildLibpqChildConnection,
  buildPgRestoreHostArgv,
  buildPsqlHostArgv,
} from "./logical.mjs";

const SENTINEL = "SENTINEL_RESTORE_PASSWORD_4d8e";

test("C2: verify-full + sslrootcert preserved on pg_restore/psql argv builders", () => {
  const url = `postgresql://rec_user:${SENTINEL}@10.9.8.7:6543/boba_recovery?sslmode=verify-full&sslrootcert=/tmp/ca.pem&sslcert=/tmp/client.pem&target_session_attrs=read-write&options=-c%20search_path%3Dpublic`;
  const conn = buildLibpqChildConnection(url);
  assert.equal(conn.ok, true);
  assert.equal(conn.query.sslmode, "verify-full");
  assert.equal(conn.query.sslrootcert, "/tmp/ca.pem");
  assert.equal(conn.query.target_session_attrs, "read-write");

  const restoreArgv = buildPgRestoreHostArgv(conn, "/tmp/owned.dump");
  const psqlArgv = buildPsqlHostArgv(conn, ["-c", "select 1"]);
  const env = applyLibpqSecretEnv({}, conn);

  for (const argv of [restoreArgv, psqlArgv]) {
    assert.equal(argv.some((a) => String(a).includes(SENTINEL)), false);
    assert.equal(argv.some((a) => String(a) === url), false);
    assert.match(JSON.stringify(argv), /sslmode=verify-full/);
    assert.match(JSON.stringify(argv), /sslrootcert=/);
  }
  assert.equal(env.PGPASSWORD, SENTINEL);
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
