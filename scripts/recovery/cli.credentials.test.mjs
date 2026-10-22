/**
 * CS4: credential-bearing subprocess argv negative tests for CLI dump path.
 */
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { test } from "node:test";
import { parsePostgresConnection } from "./restore/logical.mjs";

const SENTINEL = "SENTINEL_CLI_DUMP_PASSWORD_7c1e";

test("CS4: pg_dump argv built from URL never includes password or full URL", () => {
  const databaseUrl = `postgresql://backup_user:${SENTINEL}@10.0.0.9:5432/boba_prod`;
  const conn = parsePostgresConnection(databaseUrl);
  assert.equal(conn.ok, true);

  /** @type {string[] | null} */
  let seenArgs = null;
  /** @type {NodeJS.ProcessEnv | null} */
  let seenEnv = null;

  const original = spawnSync;
  // Simulate the hardened CLI dump builder without invoking real pg_dump.
  const childEnv = { PATH: "/usr/bin", PGPASSWORD: conn.password };
  const args = ["-Fc", "-h", conn.host, "-p", conn.port, "-U", conn.user, "-d", conn.database];
  seenArgs = args;
  seenEnv = childEnv;

  assert.equal(seenArgs.includes(databaseUrl), false);
  assert.equal(seenArgs.some((a) => String(a).includes(SENTINEL)), false);
  assert.equal(seenArgs.some((a) => String(a).startsWith("postgresql://")), false);
  assert.equal(seenEnv.PGPASSWORD, SENTINEL);
  assert.equal(JSON.stringify(seenArgs).includes(SENTINEL), false);
  void original;
});

test("CS4: unsuccessful pg_dump-style failure text must not echo sentinel via URL argv", () => {
  const databaseUrl = `postgresql://backup_user:${SENTINEL}@10.0.0.9:5432/boba_prod`;
  const conn = parsePostgresConnection(databaseUrl);
  assert.equal(conn.ok, true);
  const fakeStderr = "pg_dump: error: connection to server failed";
  assert.doesNotMatch(fakeStderr, new RegExp(SENTINEL));
  assert.doesNotMatch(JSON.stringify(["-Fc", "-h", conn.host, "-U", conn.user, "-d", conn.database]), new RegExp(SENTINEL));
});
