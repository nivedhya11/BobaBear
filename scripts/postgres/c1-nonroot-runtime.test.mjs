/**
 * Production PostgreSQL image non-root runtime checks (C1 source candidate).
 *
 * Host cases exercise the entrypoint directly. Cases marked PODMAN build and
 * run disposable containers with `podman` when that image is present. They are
 * not Docker Engine proof.
 *
 * Podman containers use the c1-src-a-* name prefix and are removed on exit.
 */
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { chmodSync, mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import os from "node:os";
import path from "node:path";
import { test } from "node:test";

const WRAPPER = "docker/postgres/pgbackrest/entrypoint-wrapper.sh";
const RENDER = "docker/postgres/pgbackrest/render-conf.sh";
const IMAGE_CANDIDATES = [
  process.env.BOBA_POSTGRES_C1_IMAGE,
  "boba-bear-postgres:c1-src-a",
  "localhost/boba-bear-postgres:c1-src-a",
].filter(Boolean);
const SENTINEL_CIPHER = "c1-sentinel-cipher-do-not-log";
const SENTINEL_KEY = "c1-sentinel-key-do-not-log";
const SENTINEL_SECRET = "c1-sentinel-secret-do-not-log";

function run(command, args, options = {}) {
  return spawnSync(command, args, {
    encoding: "utf8",
    timeout: options.timeout ?? 120_000,
    env: options.env ?? process.env,
    cwd: options.cwd,
  });
}

function assertOk(result, label) {
  assert.equal(result.status, 0, `${label}\nstdout:\n${result.stdout}\nstderr:\n${result.stderr}`);
}

function podmanAvailable() {
  return run("podman", ["--version"], { timeout: 15_000 }).status === 0;
}

function resolveImage() {
  if (!podmanAvailable()) return null;
  for (const image of IMAGE_CANDIDATES) {
    const inspect = run("podman", ["image", "inspect", image], { timeout: 20_000 });
    if (inspect.status === 0) return image;
  }
  return null;
}

function snapshotTree(dir) {
  const listing = run("find", [dir, "-printf", "%P %u %g %m %y\n"]);
  assertOk(listing, "find snapshot");
  const files = run("find", [dir, "-type", "f", "-print"]);
  assertOk(files, "find files");
  const hashes = files.stdout
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .sort()
    .map((file) => {
      const body = readFileSync(file);
      return `${path.relative(dir, file)} ${createHash("sha256").update(body).digest("hex")}`;
    });
  return `${listing.stdout.trim()}\n${hashes.join("\n")}`;
}

function makeWritableTree(root) {
  const dirs = {
    config: path.join(root, "config"),
    archive: path.join(root, "archive"),
    repo: path.join(root, "repo"),
    log: path.join(root, "log"),
    spool: path.join(root, "spool"),
    run: path.join(root, "run"),
    data: path.join(root, "data"),
  };
  for (const dir of Object.values(dirs)) mkdirSync(dir, { recursive: true });
  return dirs;
}

function wrapperEnv(root, dirs, extra = {}) {
  const renderCopy = path.join(root, "render-conf.sh");
  writeFileSync(renderCopy, readFileSync(RENDER));
  chmodSync(renderCopy, 0o755);
  const entry = path.join(root, "fake-docker-entrypoint.sh");
  writeFileSync(
    entry,
    "#!/usr/bin/env bash\nprintf '%s\\n' \"$@\" > \"$BOBA_FAKE_ENTRY_ARGS\"\nexit 0\n",
  );
  chmodSync(entry, 0o755);
  const argsFile = path.join(root, "entry-args");
  return {
    env: {
      ...process.env,
      BOBA_PGBACKREST_RENDER_BIN: renderCopy,
      BOBA_PGBACKREST_CONFIG_PATH: path.join(dirs.config, "pgbackrest.conf"),
      BOBA_PGBACKREST_ARCHIVE_CONF_DIR: dirs.archive,
      BOBA_PGBACKREST_LIB_DIR: dirs.repo,
      BOBA_PGBACKREST_LOG_DIR: dirs.log,
      BOBA_PGBACKREST_SPOOL_DIR: dirs.spool,
      BOBA_POSTGRES_RUN_DIR: dirs.run,
      BOBA_DOCKER_ENTRYPOINT: entry,
      BOBA_FAKE_ENTRY_ARGS: argsFile,
      PGDATA: path.join(dirs.data, "18", "docker"),
      ...extra,
    },
    argsFile,
    configPath: path.join(dirs.config, "pgbackrest.conf"),
  };
}

test("entrypoint source does not chown or relabel mounted data", () => {
  const source = readFileSync(WRAPPER, "utf8")
    .split("\n")
    .filter((line) => !line.trim().startsWith("#"))
    .join("\n");
  assert.doesNotMatch(source, /\bchown\b/);
  assert.doesNotMatch(source, /:U\b/);
  assert.match(source, /refusing to start as root/);
  assert.match(source, /refusing to repair ownership/);
});

test("entrypoint refuses archive start without a concrete config render", () => {
  const root = mkdtempSync(path.join(os.tmpdir(), "c1-src-a-render-"));
  try {
    const dirs = makeWritableTree(root);
    const renderBin = path.join(root, "render.sh");
    writeFileSync(renderBin, "#!/usr/bin/env bash\necho fail closed >&2\nexit 1\n");
    chmodSync(renderBin, 0o755);
    const { env } = wrapperEnv(root, dirs, {
      BOBA_PGBACKREST_ARCHIVE: "1",
      BOBA_PGBACKREST_RENDER_BIN: renderBin,
    });
    const result = run("bash", [WRAPPER, "true"], { env });
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /concrete config render failed; refusing to start/i);
    assert.equal(run("test", ["-e", env.BOBA_FAKE_ENTRY_ARGS]).status === 0, false);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("missing and invalid S3-shaped config fail closed without logging secrets", () => {
  const root = mkdtempSync(path.join(os.tmpdir(), "c1-src-a-s3-"));
  try {
    const dirs = makeWritableTree(root);
    const missing = wrapperEnv(root, dirs, {
      BOBA_PGBACKREST_ARCHIVE: "1",
      BOBA_PGBACKREST_GENERATION: "1",
      BOBA_PGBACKREST_REPO_MODE: "s3",
      PGBACKREST_CIPHER_PASS: SENTINEL_CIPHER,
      BOBA_PHYSICAL_SPACES_ACCESS_KEY_ID: SENTINEL_KEY,
      BOBA_PHYSICAL_SPACES_SECRET_ACCESS_KEY: SENTINEL_SECRET,
    });
    const missingResult = run("bash", [WRAPPER, "true"], { env: missing.env });
    assert.notEqual(missingResult.status, 0);
    assert.match(missingResult.stderr, /concrete config render failed|physical Spaces/i);
    const missingOut = `${missingResult.stdout}${missingResult.stderr}`;
    assert.equal(missingOut.includes(SENTINEL_CIPHER), false);
    assert.equal(missingOut.includes(SENTINEL_KEY), false);
    assert.equal(missingOut.includes(SENTINEL_SECRET), false);
    assert.equal(run("test", ["-e", missing.configPath]).status === 0, false);

    const invalid = wrapperEnv(root, dirs, {
      BOBA_PGBACKREST_ARCHIVE: "1",
      BOBA_PGBACKREST_GENERATION: "1",
      BOBA_PGBACKREST_REPO_MODE: "not-a-repo",
      PGBACKREST_CIPHER_PASS: SENTINEL_CIPHER,
    });
    const invalidResult = run("bash", [WRAPPER, "true"], { env: invalid.env });
    assert.notEqual(invalidResult.status, 0);
    assert.match(invalidResult.stderr, /unsupported BOBA_PGBACKREST_REPO_MODE|concrete config render failed/i);
    assert.equal(`${invalidResult.stdout}${invalidResult.stderr}`.includes(SENTINEL_CIPHER), false);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("archive enabled writes a protected config and archive disabled does not", () => {
  const root = mkdtempSync(path.join(os.tmpdir(), "c1-src-a-arch-"));
  try {
    const enabledDirs = makeWritableTree(path.join(root, "on"));
    const enabled = wrapperEnv(path.join(root, "on"), enabledDirs, {
      BOBA_PGBACKREST_ARCHIVE: "1",
      BOBA_PGBACKREST_REPO_MODE: "posix",
      BOBA_PGBACKREST_GENERATION: "1",
      PGBACKREST_CIPHER_PASS: SENTINEL_CIPHER,
    });
    const enabledResult = run("bash", [WRAPPER, "postgres"], { env: enabled.env });
    assertOk(enabledResult, "archive enabled");
    assert.equal(`${enabledResult.stdout}${enabledResult.stderr}`.includes(SENTINEL_CIPHER), false);
    const conf = readFileSync(enabled.configPath, "utf8");
    assert.match(conf, /repo1-type=posix/);
    assert.equal(conf.includes(SENTINEL_CIPHER), false);
    assert.equal(run("stat", ["-c", "%a", enabled.configPath]).stdout.trim(), "640");
    const archiveConf = readFileSync(path.join(enabledDirs.archive, "boba-archive.conf"), "utf8");
    assert.match(archiveConf, /archive_mode = on/);
    assert.equal(archiveConf.includes(SENTINEL_CIPHER), false);
    const args = readFileSync(enabled.argsFile, "utf8");
    assert.match(args, /postgres/);
    assert.match(args, /archive_mode=on/);

    const disabledDirs = makeWritableTree(path.join(root, "off"));
    const disabled = wrapperEnv(path.join(root, "off"), disabledDirs, {
      BOBA_PGBACKREST_ARCHIVE: "0",
    });
    const disabledResult = run("bash", [WRAPPER, "postgres"], { env: disabled.env });
    assertOk(disabledResult, "archive disabled");
    assert.equal(run("test", ["-e", disabled.configPath]).status === 0, false);
    assert.match(readFileSync(disabled.argsFile, "utf8"), /^postgres\n/);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("non-writable config directory fails closed before writing config", () => {
  const root = mkdtempSync(path.join(os.tmpdir(), "c1-src-a-ro-"));
  try {
    const dirs = makeWritableTree(root);
    chmodSync(dirs.config, 0o555);
    const { env, configPath } = wrapperEnv(root, dirs, {
      BOBA_PGBACKREST_ARCHIVE: "1",
      BOBA_PGBACKREST_REPO_MODE: "posix",
      BOBA_PGBACKREST_GENERATION: "1",
      PGBACKREST_CIPHER_PASS: SENTINEL_CIPHER,
    });
    const result = run("bash", [WRAPPER, "postgres"], { env });
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /not already writable/);
    assert.equal(`${result.stdout}${result.stderr}`.includes(SENTINEL_CIPHER), false);
    assert.equal(run("test", ["-e", configPath]).status === 0, false);
    assert.equal(run("test", ["-e", env.BOBA_FAKE_ENTRY_ARGS]).status === 0, false);
  } finally {
    chmodSync(path.join(root, "config"), 0o755);
    rmSync(root, { recursive: true, force: true });
  }
});

test("PODMAN: entrypoint refuses uid 0 and a wrong-owner data directory", { timeout: 60_000 }, (t) => {
  if (!podmanAvailable()) {
    t.skip("podman is not available");
    return;
  }
  const root = mkdtempSync(path.join(os.tmpdir(), "c1-src-a-uid-"));
  try {
    const rootRefusal = run("podman", ["unshare", "bash", WRAPPER, "true"], { timeout: 30_000 });
    assert.notEqual(rootRefusal.status, 0);
    assert.match(rootRefusal.stderr, /refusing to start as root/);

    const wrong = path.join(root, "wrong");
    mkdirSync(wrong, { recursive: true });
    writeFileSync(path.join(wrong, "KEEP_ME"), "do-not-touch\n");
    const chown = run("podman", ["unshare", "chown", "-R", "1:1", wrong], { timeout: 30_000 });
    assertOk(chown, "fixture chown");
    const before = snapshotTree(wrong);
    const dirs = makeWritableTree(path.join(root, "wrap"));
    const { env, argsFile } = wrapperEnv(path.join(root, "wrap"), dirs, {
      BOBA_PGBACKREST_ARCHIVE: "0",
      PGDATA: path.join(wrong, "18", "docker"),
    });
    const result = run("bash", [WRAPPER, "postgres"], { env });
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /refusing to repair ownership/);
    assert.equal(run("test", ["-e", argsFile]).status === 0, false);
    assert.equal(snapshotTree(wrong), before);
  } finally {
    run("podman", ["unshare", "rm", "-rf", root], { timeout: 30_000 });
  }
});

test("PODMAN: image user, root refusal, fail-closed archive, fresh start, and restart", { timeout: 300_000 }, (t) => {
  const image = resolveImage();
  if (!image) {
    t.skip("PODMAN image boba-bear-postgres:c1-src-a is not present");
    return;
  }
  for (const stale of [
    "c1-src-a-id",
    "c1-src-a-name",
    "c1-src-a-pgbr",
    "c1-src-a-gosu",
    "c1-src-a-wrong",
    "c1-src-a-root",
    "c1-src-a-s3",
    "c1-src-a-mode",
    "c1-src-a-fresh",
    "c1-src-a-archive",
  ]) {
    run("podman", ["rm", "-f", stale], { timeout: 20_000 });
  }

  const root = mkdtempSync(path.join(os.tmpdir(), "c1-src-a-img-"));
  const names = [];
  const track = (name) => {
    names.push(name);
    return name;
  };
  try {
    const inspected = run("podman", ["image", "inspect", "--format", "{{.Id}} {{.Config.User}}", image]);
    assertOk(inspected, "image inspect");
    const [imageId, configUser] = inspected.stdout.trim().split(/\s+/);
    assert.equal(configUser, "postgres");
    assert.match(imageId, /^(sha256:)?[0-9a-f]{64}$/);
    console.log(`PODMAN image ${image} ${imageId} Config.User=${configUser}`);

    const uid = run("podman", ["run", "--rm", "--name", track("c1-src-a-id"), image, "id", "-u"]);
    assertOk(uid, "id -u");
    assert.equal(uid.stdout.trim(), "999");
    const name = run("podman", ["run", "--rm", "--name", track("c1-src-a-name"), image, "id", "-un"]);
    assertOk(name, "id -un");
    assert.equal(name.stdout.trim(), "postgres");

    const pgbackrest = run("podman", ["run", "--rm", "--name", track("c1-src-a-pgbr"), image, "pgbackrest", "version"]);
    assertOk(pgbackrest, "pgbackrest version");
    assert.match(pgbackrest.stdout, /2\.56\.0/);
    const gosu = run("podman", ["run", "--rm", "--entrypoint", "gosu", "--name", track("c1-src-a-gosu"), image, "version"]);
    const gosuOut = `${gosu.stdout}\n${gosu.stderr}`;
    assert.match(gosuOut, /gosu version: 1\.19/);
    assert.match(gosuOut, /go1\.26\.10/);

    const wrong = path.join(root, "wrong");
    mkdirSync(wrong, { recursive: true });
    writeFileSync(path.join(wrong, "KEEP_ME"), "do-not-touch\n");
    assertOk(run("podman", ["unshare", "chown", "-R", "1:1", wrong]), "wrong-mount chown");
    const beforeWrong = snapshotTree(wrong);
    const wrongName = track("c1-src-a-wrong");
    const wrongRun = run(
      "podman",
      [
        "run",
        "--rm",
        "--name",
        wrongName,
        "-v",
        `${wrong}:/var/lib/postgresql:Z`,
        "-e",
        "POSTGRES_PASSWORD=c1-src-a-test-admin",
        image,
      ],
      { timeout: 60_000 },
    );
    assert.notEqual(wrongRun.status, 0);
    assert.match(wrongRun.stderr, /refusing to repair ownership/);
    assert.equal(snapshotTree(wrong), beforeWrong);

    const rootName = track("c1-src-a-root");
    const rootRun = run(
      "podman",
      ["run", "--rm", "--user", "0", "--name", rootName, "-v", `${wrong}:/var/lib/postgresql:Z`, image],
      { timeout: 60_000 },
    );
    assert.notEqual(rootRun.status, 0);
    assert.match(rootRun.stderr, /refusing to start as root/);
    assert.equal(snapshotTree(wrong), beforeWrong);

    const missingArchive = run(
      "podman",
      [
        "run",
        "--rm",
        "--name",
        track("c1-src-a-s3"),
        "-e",
        "BOBA_PGBACKREST_ARCHIVE=1",
        "-e",
        "BOBA_PGBACKREST_GENERATION=1",
        "-e",
        `PGBACKREST_CIPHER_PASS=${SENTINEL_CIPHER}`,
        "-e",
        `BOBA_PHYSICAL_SPACES_ACCESS_KEY_ID=${SENTINEL_KEY}`,
        "-e",
        `BOBA_PHYSICAL_SPACES_SECRET_ACCESS_KEY=${SENTINEL_SECRET}`,
        image,
      ],
      { timeout: 60_000 },
    );
    assert.notEqual(missingArchive.status, 0);
    assert.match(missingArchive.stderr, /concrete config render failed|physical Spaces/i);
    const missingOut = `${missingArchive.stdout}${missingArchive.stderr}`;
    assert.equal(missingOut.includes(SENTINEL_CIPHER), false);
    assert.equal(missingOut.includes(SENTINEL_KEY), false);
    assert.equal(missingOut.includes(SENTINEL_SECRET), false);

    const invalidArchive = run(
      "podman",
      [
        "run",
        "--rm",
        "--name",
        track("c1-src-a-mode"),
        "-e",
        "BOBA_PGBACKREST_ARCHIVE=1",
        "-e",
        "BOBA_PGBACKREST_GENERATION=1",
        "-e",
        "BOBA_PGBACKREST_REPO_MODE=not-a-repo",
        "-e",
        `PGBACKREST_CIPHER_PASS=${SENTINEL_CIPHER}`,
        image,
      ],
      { timeout: 60_000 },
    );
    assert.notEqual(invalidArchive.status, 0);
    assert.match(invalidArchive.stderr, /unsupported BOBA_PGBACKREST_REPO_MODE|concrete config render failed/i);
    assert.equal(`${invalidArchive.stdout}${invalidArchive.stderr}`.includes(SENTINEL_CIPHER), false);

    const good = path.join(root, "good");
    mkdirSync(good, { recursive: true });
    assertOk(run("podman", ["unshare", "chown", "999:999", good]), "good-mount chown");
    const freshName = track("c1-src-a-fresh");
    const initDir = path.resolve("docker/postgres/init");
    const fresh = run(
      "podman",
      [
        "run",
        "-d",
        "--name",
        freshName,
        "-e",
        "POSTGRES_USER=boba_bear_admin",
        "-e",
        "POSTGRES_PASSWORD=c1-src-a-test-admin",
        "-e",
        "POSTGRES_DB=postgres",
        "-e",
        "POSTGRES_MIGRATOR_PASSWORD=c1-src-a-test-migrator",
        "-e",
        "POSTGRES_APP_PASSWORD=c1-src-a-test-app",
        "-e",
        "POSTGRES_LOGICAL_BACKUP_PASSWORD=c1-src-a-test-logical",
        "-v",
        `${good}:/var/lib/postgresql:Z`,
        "-v",
        `${initDir}:/docker-entrypoint-initdb.d:ro`,
        image,
      ],
      { timeout: 30_000 },
    );
    assertOk(fresh, "fresh start");
    waitReady(freshName);

    const roles = query(
      freshName,
      "boba_bear_local",
      "SELECT rolname FROM pg_roles WHERE rolname IN ('boba_bear_migrator','boba_bear_app','boba_bear_logical_backup') ORDER BY 1;",
    );
    assert.match(roles, /boba_bear_app/);
    assert.match(roles, /boba_bear_logical_backup/);
    assert.match(roles, /boba_bear_migrator/);
    const schemas = query(
      freshName,
      "boba_bear_local",
      "SELECT nspname FROM pg_namespace WHERE nspname IN ('app','drizzle') ORDER BY 1;",
    );
    assert.match(schemas, /app/);
    assert.match(schemas, /drizzle/);
    assertOk(
      run("podman", [
        "exec",
        freshName,
        "psql",
        "-v",
        "ON_ERROR_STOP=1",
        "-U",
        "boba_bear_admin",
        "-d",
        "boba_bear_local",
        "-c",
        "CREATE TABLE app.c1_survival (id integer PRIMARY KEY); INSERT INTO app.c1_survival VALUES (1);",
      ]),
      "marker table",
    );

    const runtimeUser = run("podman", ["exec", freshName, "id", "-u"]);
    assertOk(runtimeUser, "runtime uid");
    assert.equal(runtimeUser.stdout.trim(), "999");

    assertOk(run("podman", ["restart", freshName], { timeout: 60_000 }), "restart");
    waitReady(freshName);
    const marker = query(freshName, "boba_bear_local", "SELECT id FROM app.c1_survival;");
    assert.match(marker, /\b1\b/);
    const rolesAfter = query(
      freshName,
      "boba_bear_local",
      "SELECT rolname FROM pg_roles WHERE rolname IN ('boba_bear_migrator','boba_bear_app','boba_bear_logical_backup') ORDER BY 1;",
    );
    assert.equal(rolesAfter, roles);
    const logs = run("podman", ["logs", freshName]);
    assertOk(logs, "fresh logs");
    const combinedLogs = `${logs.stdout}\n${logs.stderr}`;
    assert.equal(combinedLogs.split("001-bootstrap.sh: bootstrap complete.").length - 1, 1);
    assert.equal(combinedLogs.includes("c1-src-a-test-admin"), false);
    assert.equal(combinedLogs.includes("c1-src-a-test-migrator"), false);
    assert.equal(combinedLogs.includes("c1-src-a-test-app"), false);
    assert.equal(combinedLogs.includes("c1-src-a-test-logical"), false);

    assertOk(run("podman", ["stop", freshName], { timeout: 60_000 }), "stop fresh");
    const archiveName = track("c1-src-a-archive");
    const archive = run(
      "podman",
      [
        "run",
        "-d",
        "--name",
        archiveName,
        "-e",
        "POSTGRES_USER=boba_bear_admin",
        "-e",
        "POSTGRES_PASSWORD=c1-src-a-test-admin",
        "-e",
        "POSTGRES_DB=postgres",
        "-e",
        "BOBA_PGBACKREST_ARCHIVE=1",
        "-e",
        "BOBA_PGBACKREST_REPO_MODE=posix",
        "-e",
        "BOBA_PGBACKREST_GENERATION=1",
        "-e",
        `PGBACKREST_CIPHER_PASS=${SENTINEL_CIPHER}`,
        "-v",
        `${good}:/var/lib/postgresql:Z`,
        image,
      ],
      { timeout: 30_000 },
    );
    assertOk(archive, "archive start");
    waitReady(archiveName);
    const survived = query(archiveName, "boba_bear_local", "SELECT id FROM app.c1_survival;");
    assert.match(survived, /\b1\b/);
    const conf = run("podman", ["exec", archiveName, "cat", "/etc/pgbackrest/pgbackrest.conf"]);
    assertOk(conf, "pgbackrest conf");
    assert.match(conf.stdout, /repo1-type=posix/);
    assert.equal(conf.stdout.includes(SENTINEL_CIPHER), false);
    const mode = run("podman", ["exec", archiveName, "stat", "-c", "%a", "/etc/pgbackrest/pgbackrest.conf"]);
    assertOk(mode, "conf mode");
    assert.equal(mode.stdout.trim(), "640");
    const archiveLogs = run("podman", ["logs", archiveName]);
    assert.equal(`${archiveLogs.stdout}${archiveLogs.stderr}`.includes("001-bootstrap.sh: creating"), false);
    assert.equal(`${archiveLogs.stdout}${archiveLogs.stderr}`.includes(SENTINEL_CIPHER), false);
  } finally {
    for (const name of names) {
      run("podman", ["rm", "-f", name], { timeout: 30_000 });
    }
    run("podman", ["unshare", "rm", "-rf", root], { timeout: 30_000 });
  }
});

function waitReady(name) {
  const started = Date.now();
  let last = "";
  while (Date.now() - started < 120_000) {
    const state = run("podman", ["inspect", "--format", "{{.State.Status}} {{.State.ExitCode}}", name]);
    if (state.stdout.trim().startsWith("exited")) {
      const logs = run("podman", ["logs", name]);
      assert.fail(`container ${name} exited\n${logs.stdout}\n${logs.stderr}`);
    }
    const ready = run("podman", ["exec", name, "pg_isready", "-U", "boba_bear_admin", "-d", "postgres"], {
      timeout: 15_000,
    });
    last = `${ready.stdout}\n${ready.stderr}`;
    if (ready.status === 0) {
      run("sleep", ["2"], { timeout: 10_000 });
      const still = run("podman", ["exec", name, "pg_isready", "-U", "boba_bear_admin", "-d", "postgres"], {
        timeout: 15_000,
      });
      const stateAfter = run("podman", ["inspect", "--format", "{{.State.Status}}", name]);
      if (still.status === 0 && stateAfter.stdout.trim() === "running") return;
    }
    run("sleep", ["1"], { timeout: 5_000 });
  }
  const logs = run("podman", ["logs", name]);
  assert.fail(`pg_isready timed out for ${name}\n${last}\n${logs.stdout}\n${logs.stderr}`);
}

function query(name, database, sql) {
  const result = run(
    "podman",
    ["exec", name, "psql", "-v", "ON_ERROR_STOP=1", "-U", "boba_bear_admin", "-d", database, "-At", "-c", sql],
    { timeout: 30_000 },
  );
  assertOk(result, sql);
  return result.stdout.trim();
}
