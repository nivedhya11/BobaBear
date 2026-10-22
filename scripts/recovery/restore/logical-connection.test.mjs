/**
 * C2/R1/R2: libpq connection URI identity + TLS semantics — production builders only.
 */
import assert from "node:assert/strict";
import { test } from "node:test";
import { parse as parsePgConnectionString } from "pg-connection-string";
import {
  applyLibpqSecretEnv,
  buildLibpqChildConnection,
  buildPgDumpArgv,
  buildPgRestoreHostArgv,
  buildPsqlHostArgv,
} from "./logical.mjs";

const SENTINEL = "SENTINEL_RESTORE_PASSWORD_4d8e";
const SSL_SENTINEL = "SENTINEL_SSL_PASSWORD_9a2f";

/**
 * Offline effective identity under libpq-style percent-decode (no `+`→space).
 * Parses the raw query string rather than URLSearchParams.
 * @param {string} connectionUri
 */
function effectiveUriIdentity(connectionUri) {
  const parsed = new URL(connectionUri);
  const userFromUri = parsed.username ? decodeURIComponent(parsed.username) : "";
  const pathEncoded = parsed.pathname.startsWith("/")
    ? parsed.pathname.slice(1)
    : parsed.pathname;
  const dbFromPath = pathEncoded ? decodeURIComponent(pathEncoded) : "";
  /** @type {Record<string, string>} */
  const query = {};
  const rawSearch = parsed.search.startsWith("?") ? parsed.search.slice(1) : "";
  for (const part of rawSearch.split("&")) {
    if (!part) continue;
    const eq = part.indexOf("=");
    const key = decodeURIComponent(eq === -1 ? part : part.slice(0, eq));
    const value = decodeURIComponent(eq === -1 ? "" : part.slice(eq + 1));
    query[key] = value;
  }
  return {
    user: userFromUri || query.user || "",
    database: dbFromPath || query.dbname || "",
    host: parsed.hostname || query.host || "",
    hostaddr: query.hostaddr || "",
    port: parsed.port || query.port || "5432",
  };
}

/**
 * @param {string} databaseUrl
 * @param {{ user: string, database: string, host?: string, port?: string }} expected
 */
function assertPreservedIdentity(databaseUrl, expected) {
  const conn = buildLibpqChildConnection(databaseUrl);
  assert.equal(conn.ok, true, conn.ok ? "" : conn.reason);
  assert.equal(conn.user, expected.user);
  assert.equal(conn.database, expected.database);
  if (expected.host !== undefined) assert.equal(conn.host, expected.host);
  if (expected.port !== undefined) assert.equal(conn.port, expected.port);

  const rebuilt = effectiveUriIdentity(conn.connectionUri);
  assert.equal(rebuilt.user, expected.user);
  assert.equal(rebuilt.database, expected.database);
  if (expected.host !== undefined) {
    assert.equal(rebuilt.host || rebuilt.hostaddr, expected.host);
  }
  if (expected.port !== undefined) assert.equal(rebuilt.port, expected.port);

  // Second pass through the production builder must be identity-stable.
  const again = buildLibpqChildConnection(conn.connectionUri);
  assert.equal(again.ok, true, again.ok ? "" : again.reason);
  assert.equal(again.user, expected.user);
  assert.equal(again.database, expected.database);

  // Offline parser cross-check for username when authority-form user is present.
  // Force verify-full on the probe URL so pg-connection-string does not emit the
  // require→verify-full compatibility warning during synthetic identity checks.
  // Skip when user is query-only with characters pg-connection-string form-decodes.
  if (expected.user && !databaseUrl.includes("user=")) {
    const offlineProbeUrl = databaseUrl.includes("sslmode=")
      ? databaseUrl.replace(/sslmode=[^&]+/g, "sslmode=verify-full")
      : `${databaseUrl}${databaseUrl.includes("?") ? "&" : "?"}sslmode=verify-full`;
    const offline = parsePgConnectionString(offlineProbeUrl);
    assert.equal(offline.user, expected.user);
  }

  const argvBundle = [
    buildPgDumpArgv(conn),
    buildPgRestoreHostArgv(conn, "/tmp/owned.dump"),
    buildPsqlHostArgv(conn, ["-c", "select 1"]),
  ];
  for (const argv of argvBundle) {
    assert.equal(argv.some((a) => String(a).includes(SENTINEL)), false);
    // libpq treats `+` as literal; rebuilt argv must not introduce `+` for spaces.
    if (expected.user.includes(" ") || expected.database.includes(" ")) {
      assert.equal(argv.some((a) => /[?&](?:user|dbname)=[^&]*\+/.test(String(a))), false);
    }
  }
}

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

test("R2: double-encoded user/db (%252F) preserve effective identity across rebuild", () => {
  // Wire u%252Fv / my%252Fdb => effective u%2Fv / my%2Fdb. Naive WHATWG rebuild
  // previously collapsed these to u%2Fv / my%2Fdb wire (effective u/v / my/db).
  assertPreservedIdentity(
    `postgresql://u%252Fv:${encodeURIComponent(SENTINEL)}@10.9.8.7:5432/my%252Fdb?sslmode=require`,
    { user: "u%2Fv", database: "my%2Fdb" },
  );
});

test("R2: single-encoded slash in user/db preserves effective slash identity", () => {
  assertPreservedIdentity(
    `postgresql://backup%2Fuser:${encodeURIComponent(SENTINEL)}@10.9.8.7:5432/db%2Fname?sslmode=verify-full`,
    { user: "backup/user", database: "db/name" },
  );
});

test("R2: encoded spaces in user/db are preserved", () => {
  assertPreservedIdentity(
    `postgresql://user%20name:${encodeURIComponent(SENTINEL)}@10.9.8.7:5432/db%20name?sslmode=require`,
    { user: "user name", database: "db name" },
  );
});

test("R2: literal multi-segment database path is the full db name", () => {
  assertPreservedIdentity(
    `postgresql://u:${encodeURIComponent(SENTINEL)}@10.9.8.7:5432/db/name?sslmode=require`,
    { user: "u", database: "db/name" },
  );
});

test("R2: query-only dbname with encoded slash preserves identity", () => {
  assertPreservedIdentity(
    `postgresql://u:${encodeURIComponent(SENTINEL)}@10.9.8.7:5432/?dbname=db%2Fname&sslmode=require`,
    { user: "u", database: "db/name" },
  );
});

test("R2: hostaddr-only double-encoded query user preserves identity", () => {
  assertPreservedIdentity(
    "postgresql:///boba_recovery?hostaddr=10.1.2.3&user=u%252Fv&port=5433&sslmode=require",
    { user: "u%2Fv", database: "boba_recovery" },
  );
});

test("R2: matching URI + query identity with encoded forms remains safe", () => {
  assertPreservedIdentity(
    `postgresql://backup%2Fuser:${encodeURIComponent(SENTINEL)}@10.9.8.7:5432/db%2Fname?user=backup%2Fuser&dbname=db%2Fname&sslmode=require`,
    { user: "backup/user", database: "db/name" },
  );
});

test("R2: trailing-slash database path fails closed", () => {
  const conn = buildLibpqChildConnection(
    "postgresql://u@10.9.8.7:5432/db/?sslmode=require",
  );
  assert.equal(conn.ok, false);
  assert.match(conn.reason, /trailing slash|ambiguous/i);
});

test("R2: invalid percent-encoding in database path fails closed", () => {
  const conn = buildLibpqChildConnection(
    "postgresql://u@10.9.8.7:5432/db%ZZ?sslmode=require",
  );
  assert.equal(conn.ok, false);
  assert.match(conn.reason, /percent-encoding/i);
});

test("R2: invalid percent-encoding in username fails closed", () => {
  const conn = buildLibpqChildConnection(
    "postgresql://user%ZZ@10.9.8.7:5432/db?sslmode=require",
  );
  assert.equal(conn.ok, false);
  assert.match(conn.reason, /percent-encoding/i);
});

test("R2: encoded identity rebuild keeps secrets out of argv/env except PGPASSWORD", () => {
  const password = "p@ss/%2Fword";
  const conn = buildLibpqChildConnection(
    `postgresql://u%252Fv:${encodeURIComponent(password)}@10.9.8.7:5432/my%252Fdb?sslmode=verify-full`,
  );
  assert.equal(conn.ok, true);
  assert.equal(conn.user, "u%2Fv");
  assert.equal(conn.database, "my%2Fdb");
  assert.equal(conn.password, password);
  const argv = buildPgDumpArgv(conn);
  const env = applyLibpqSecretEnv({}, conn);
  assert.equal(argv.some((a) => String(a).includes(password)), false);
  assert.doesNotMatch(conn.connectionUri, /p@ss/);
  assert.equal(env.PGPASSWORD, password);
  assert.equal(Object.hasOwn(env, "PGSSLPASSWORD"), false);
});

test("R2: literal plus in query user/dbname is not treated as space", () => {
  assertPreservedIdentity("postgresql://h/db?user=a+b&sslmode=require", {
    user: "a+b",
    database: "db",
    host: "h",
  });
  assertPreservedIdentity("postgresql://h/?dbname=a+b&sslmode=require", {
    user: "",
    database: "a+b",
    host: "h",
  });
});

test("R2: hostaddr-only percent-encoded space in user stays %20 (not +)", () => {
  const conn = buildLibpqChildConnection(
    "postgresql:///boba_recovery?hostaddr=10.1.2.3&user=a%20b&port=5433&sslmode=require",
  );
  assert.equal(conn.ok, true);
  assert.equal(conn.user, "a b");
  assert.match(conn.connectionUri, /user=a%20b/);
  assert.doesNotMatch(conn.connectionUri, /user=a\+b/);
});

test("R2: options spaces serialize as %20 not +", () => {
  const conn = buildLibpqChildConnection(
    "postgresql://u@10.0.0.1:5432/db?sslmode=verify-full&options=-c%20search_path%3Dpublic",
  );
  assert.equal(conn.ok, true);
  assert.equal(conn.query.options, "-c search_path=public");
  assert.match(conn.connectionUri, /options=-c%20search_path%3Dpublic/);
  assert.doesNotMatch(conn.connectionUri, /options=-c\+/);
});

test("R2: unix-socket query host is preserved (not dropped to default socket)", () => {
  assertPreservedIdentity(
    "postgresql:///boba_recovery?host=/var/run/postgresql&sslmode=require",
    { user: "", database: "boba_recovery", host: "/var/run/postgresql" },
  );
  const conn = buildLibpqChildConnection(
    "postgresql:///boba_recovery?host=/var/run/postgresql&sslmode=require",
  );
  assert.equal(conn.ok, true);
  assert.match(conn.connectionUri, /host=%2Fvar%2Frun%2Fpostgresql/);
});

test("R2: unbracketed IPv6 query host is preserved in query form", () => {
  assertPreservedIdentity("postgresql:///boba_recovery?host=::1&sslmode=require", {
    user: "",
    database: "boba_recovery",
    host: "::1",
  });
});

test("R2: invalid query port fails closed (no silent 5432 fallback)", () => {
  for (const port of ["99999", "5432x", "-1", "+6543"]) {
    const conn = buildLibpqChildConnection(
      `postgresql:///boba_recovery?hostaddr=10.1.2.3&user=u&port=${port}&sslmode=require`,
    );
    assert.equal(conn.ok, false, `port=${port}`);
    assert.match(conn.reason, /port/i);
  }
});

test("R2: query password with literal plus is preserved for PGPASSWORD", () => {
  const conn = buildLibpqChildConnection(
    `postgresql://u@10.0.0.1:5432/db?sslmode=require&password=${"a+b"}`,
  );
  assert.equal(conn.ok, true);
  assert.equal(conn.password, "a+b");
  assert.equal(applyLibpqSecretEnv({}, conn).PGPASSWORD, "a+b");
  assert.doesNotMatch(conn.connectionUri, /password=/);
});

test("R2: '#' in databaseUrl fails closed (no sslmode/secret truncation)", () => {
  const conn = buildLibpqChildConnection(
    "postgresql://u@h/db?password=ab#cd&sslmode=verify-full",
  );
  assert.equal(conn.ok, false);
  assert.match(conn.reason, /#|fragment/i);
});

test("R2: path dot-segments fail closed (no ../ database retarget)", () => {
  for (const url of [
    "postgresql://u@h/staging/../prod?sslmode=require",
    "postgresql://u@h/staging/%2e%2e/prod?sslmode=require",
    "postgresql://u@h/./db?sslmode=require",
  ]) {
    const conn = buildLibpqChildConnection(url);
    assert.equal(conn.ok, false, url);
    assert.match(conn.reason, /dot-segment/i);
  }
});

test("R2: percent-encoded authority/query host keeps effective host without socket promotion", () => {
  const encodedSocketName = buildLibpqChildConnection(
    "postgresql:///db?host=%252Ftmp&user=u&sslmode=require",
  );
  assert.equal(encodedSocketName.ok, true);
  assert.equal(encodedSocketName.host, "%2Ftmp");
  assert.match(encodedSocketName.connectionUri, /host=%252Ftmp/);
  assert.doesNotMatch(encodedSocketName.connectionUri, /@%2Ftmp/);

  const authorityEncoded = buildLibpqChildConnection("postgresql://%2Ftmp/db?sslmode=require");
  assert.equal(authorityEncoded.ok, true);
  assert.equal(authorityEncoded.host, "/tmp");
  assert.match(authorityEncoded.connectionUri, /host=%2Ftmp/);

  const hexHost = buildLibpqChildConnection("postgresql://h%41st/db?sslmode=require");
  assert.equal(hexHost.ok, true);
  assert.equal(hexHost.host, "hAst");
  assert.match(hexHost.connectionUri, /@hAst:|:\/\/hAst/);
});

test("R2: nonempty service= fails closed", () => {
  const conn = buildLibpqChildConnection(
    "postgresql://u@10.0.0.1:5432/db?sslmode=require&service=boba",
  );
  assert.equal(conn.ok, false);
  assert.match(conn.reason, /service=/i);
});

test("R2: multi-host URL fails closed", () => {
  const conn = buildLibpqChildConnection(
    "postgresql://u@recovery.host,prod.db/boba_recovery?sslmode=require",
  );
  assert.equal(conn.ok, false);
  assert.match(conn.reason, /multi-host/i);
});

test("R2: applyLibpqSecretEnv strips inherited PG* retarget/downgrade variables", () => {
  const conn = buildLibpqChildConnection(
    `postgresql://u:${encodeURIComponent(SENTINEL)}@10.0.0.1:5432/db?sslmode=verify-full`,
  );
  assert.equal(conn.ok, true);
  const env = applyLibpqSecretEnv(
    {
      PATH: "/usr/bin",
      PGHOSTADDR: "10.9.9.9",
      PGSSLMODE: "disable",
      PGSERVICE: "evil",
      PGPASSWORD: "stale-parent",
      PGSSLPASSWORD: "stale-ssl",
      HOME: "/tmp",
    },
    conn,
  );
  assert.equal(env.PATH, "/usr/bin");
  assert.equal(env.HOME, "/tmp");
  assert.equal(env.PGPASSWORD, SENTINEL);
  assert.equal(env.PGHOSTADDR, undefined);
  assert.equal(env.PGSSLMODE, undefined);
  assert.equal(env.PGSERVICE, undefined);
  assert.equal(env.PGSSLPASSWORD, undefined);
});
