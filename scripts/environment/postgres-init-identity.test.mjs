import assert from "node:assert/strict";
import {
  chmodSync,
  mkdirSync,
  mkdtempSync,
  writeFileSync,
  symlinkSync,
  rmSync,
  existsSync,
  readFileSync,
} from "node:fs";
import os from "node:os";
import path from "node:path";
import { test } from "node:test";

import {
  collectInitManifest,
  compareInitManifests,
  isTrustedStagingInitMountPath,
  resolvePostgresInitDisposition,
  POSTGRES_INIT_DISPOSITION,
  POSTGRES_INIT_REASON,
} from "./postgres-init-identity.mjs";
import {
  ensurePersistentPostgres,
  materializeStagingPostgresInit,
} from "./staging.mjs";

function makeInitTree(root, files) {
  mkdirSync(root, { recursive: true });
  for (const [name, body] of Object.entries(files)) {
    const full = path.join(root, name);
    mkdirSync(path.dirname(full), { recursive: true });
    writeFileSync(full, body, { mode: name.endsWith(".sh") ? 0o755 : 0o644 });
    if (name.endsWith(".sh")) chmodSync(full, 0o755);
  }
}

test("I01: same content + same path -> preserve PostgreSQL", () => {
  const tmp = mkdtempSync(path.join(os.tmpdir(), "boba-init-i01-"));
  try {
    const initDir = path.join(tmp, "runtime-assets", "postgres-init", "sha-a");
    makeInitTree(initDir, { "001-bootstrap.sh": "#!/bin/sh\necho a\n", "002-logical-backup-role.sh": "#!/bin/sh\necho b\n" });
    const manifest = collectInitManifest(initDir);
    const result = resolvePostgresInitDisposition({
      candidateManifest: manifest,
      candidateMaterializedPath: initDir,
      activePostgres: { present: true, volumePresent: true, mountSource: initDir, project: "boba-staging", persistentVolume: "boba-staging_postgres-data", imageCompatConflict: false },
      trustRoots: { runtimeAssetsRoot: path.join(tmp, "runtime-assets") },
    });
    assert.equal(result.disposition, POSTGRES_INIT_DISPOSITION.PRESERVE);
    assert.equal(result.reasonCode, POSTGRES_INIT_REASON.SAME_CONTENT_SAME_PATH);
    assert.equal(result.composeInitDir, initDir);
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
});

test("I02: same content + different SHA directory -> preserve PostgreSQL", () => {
  const tmp = mkdtempSync(path.join(os.tmpdir(), "boba-init-i02-"));
  try {
    const oldDir = path.join(tmp, "runtime-assets", "postgres-init", "old-sha");
    const newDir = path.join(tmp, "runtime-assets", "postgres-init", "new-sha");
    const files = { "001-bootstrap.sh": "#!/bin/sh\necho same\n", "002-logical-backup-role.sh": "#!/bin/sh\necho role\n" };
    makeInitTree(oldDir, files);
    makeInitTree(newDir, files);
    const candidateManifest = collectInitManifest(newDir);
    const result = resolvePostgresInitDisposition({
      candidateManifest,
      candidateMaterializedPath: newDir,
      activePostgres: { present: true, volumePresent: true, mountSource: oldDir, project: "boba-staging", persistentVolume: "boba-staging_postgres-data", imageCompatConflict: false },
      trustRoots: { runtimeAssetsRoot: path.join(tmp, "runtime-assets") },
    });
    assert.equal(result.disposition, POSTGRES_INIT_DISPOSITION.PRESERVE);
    assert.equal(result.reasonCode, POSTGRES_INIT_REASON.SAME_CONTENT_DIFFERENT_PATH);
    assert.equal(result.composeInitDir, oldDir);
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
});

test("I03: different source content -> fail closed, zero PostgreSQL mutation", () => {
  const tmp = mkdtempSync(path.join(os.tmpdir(), "boba-init-i03-"));
  const effects = [];
  try {
    const oldDir = path.join(tmp, "runtime-assets", "postgres-init", "old-sha");
    const newDir = path.join(tmp, "runtime-assets", "postgres-init", "new-sha");
    makeInitTree(oldDir, { "001-bootstrap.sh": "old\n" });
    makeInitTree(newDir, { "001-bootstrap.sh": "new\n" });
    const result = resolvePostgresInitDisposition({
      candidateManifest: collectInitManifest(newDir),
      candidateMaterializedPath: newDir,
      activePostgres: { present: true, volumePresent: true, mountSource: oldDir, project: "boba-staging", persistentVolume: "boba-staging_postgres-data", imageCompatConflict: false },
      trustRoots: { runtimeAssetsRoot: path.join(tmp, "runtime-assets") },
    });
    assert.equal(result.disposition, POSTGRES_INIT_DISPOSITION.BLOCK);
    assert.equal(result.reasonCode, POSTGRES_INIT_REASON.CONTENT_MISMATCH);
    assert.throws(
      () =>
        ensurePersistentPostgres("/tmp/build", { disposition: result }, {
          inspect: () => {
            effects.push("inspect");
            return { Mounts: [], State: { Status: "running" } };
          },
          run: (args) => {
            effects.push(`run:${args.join(" ")}`);
          },
          wait: () => {
            effects.push("wait");
          },
          log: () => {},
        }),
      /not preservable/i,
    );
    assert.deepEqual(effects, []);
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
});

test("I04: missing/unreadable init file -> fail closed", () => {
  const manifest = collectInitManifest(path.join(os.tmpdir(), "boba-init-missing-does-not-exist"));
  assert.equal(manifest.ok, false);
  assert.equal(manifest.reasonCode, POSTGRES_INIT_REASON.UNREADABLE);
});

test("I05: extra unexpected file -> fail closed", () => {
  const tmp = mkdtempSync(path.join(os.tmpdir(), "boba-init-i05-"));
  try {
    const left = path.join(tmp, "left");
    const right = path.join(tmp, "right");
    makeInitTree(left, { "001-bootstrap.sh": "a\n" });
    makeInitTree(right, { "001-bootstrap.sh": "a\n", "evil.sh": "x\n" });
    const comparison = compareInitManifests(collectInitManifest(left), collectInitManifest(right));
    assert.equal(comparison.equal, false);
    assert.equal(comparison.reasonCode, POSTGRES_INIT_REASON.EXTRA_OR_MISSING_FILE);
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
});

test("I06: unsafe symlink/path escape -> fail closed", () => {
  const tmp = mkdtempSync(path.join(os.tmpdir(), "boba-init-i06-"));
  try {
    const initDir = path.join(tmp, "init");
    mkdirSync(initDir, { recursive: true });
    writeFileSync(path.join(initDir, "ok.sh"), "ok\n");
    symlinkSync("/etc/passwd", path.join(initDir, "escape.sh"));
    const manifest = collectInitManifest(initDir);
    assert.equal(manifest.ok, false);
    assert.equal(manifest.reasonCode, POSTGRES_INIT_REASON.UNSAFE_SYMLINK);
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
});

test("I07: wrong volume or mount target -> fail closed", () => {
  const tmp = mkdtempSync(path.join(os.tmpdir(), "boba-init-i07-"));
  try {
    const initDir = path.join(tmp, "runtime-assets", "postgres-init", "sha");
    makeInitTree(initDir, { "001-bootstrap.sh": "a\n" });
    const untrusted = path.join(tmp, "elsewhere", "init");
    makeInitTree(untrusted, { "001-bootstrap.sh": "a\n" });
    assert.equal(
      isTrustedStagingInitMountPath(untrusted, { runtimeAssetsRoot: path.join(tmp, "runtime-assets") }),
      false,
    );
    const result = resolvePostgresInitDisposition({
      candidateManifest: collectInitManifest(initDir),
      activePostgres: { present: true, volumePresent: true, mountSource: untrusted, project: "boba-staging", persistentVolume: "boba-staging_postgres-data", imageCompatConflict: false },
      trustRoots: { runtimeAssetsRoot: path.join(tmp, "runtime-assets") },
    });
    assert.equal(result.disposition, POSTGRES_INIT_DISPOSITION.BLOCK);
    assert.equal(result.reasonCode, POSTGRES_INIT_REASON.UNTRUSTED_MOUNT);

    const missingVolume = resolvePostgresInitDisposition({
      candidateManifest: collectInitManifest(initDir),
      activePostgres: { present: true, volumePresent: false, mountSource: initDir, project: "boba-staging", persistentVolume: null, imageCompatConflict: false },
      trustRoots: { runtimeAssetsRoot: path.join(tmp, "runtime-assets") },
    });
    assert.equal(missingVolume.reasonCode, POSTGRES_INIT_REASON.ABSENT_VOLUME);
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
});

test("I08: existing mounted asset directory is never recursively removed on same-SHA runs", () => {
  const tmp = mkdtempSync(path.join(os.tmpdir(), "boba-init-i08-"));
  try {
    const runtime = path.join(tmp, "runtime-assets");
    const sha = "a".repeat(40);
    const destination = path.join(runtime, "postgres-init", sha);
    const buildInit = path.join(tmp, "build", "docker", "postgres", "init");
    makeInitTree(buildInit, { "001-bootstrap.sh": "#!/bin/sh\necho keep\n" });
    makeInitTree(destination, { "001-bootstrap.sh": "#!/bin/sh\necho keep\n" });
    const marker = path.join(destination, "001-bootstrap.sh");
    const before = readFileSync(marker, "utf8");

    const first = materializeStagingPostgresInit(path.join(tmp, "build"), sha, {
      activeMountSource: destination,
      runtimeAssetsDir: runtime,
      log: () => {},
    });
    assert.equal(first, destination);
    assert.equal(existsSync(marker), true);
    assert.equal(readFileSync(marker, "utf8"), before);

    const second = materializeStagingPostgresInit(path.join(tmp, "build"), sha, {
      activeMountSource: destination,
      runtimeAssetsDir: runtime,
      log: () => {},
    });
    assert.equal(second, destination);
    assert.equal(existsSync(marker), true);
    assert.equal(readFileSync(marker, "utf8"), before);
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
});

test("I09: candidate SHA changed, init bytes unchanged -> no unnecessary restart path", () => {
  const tmp = mkdtempSync(path.join(os.tmpdir(), "boba-init-i09-"));
  const effects = [];
  try {
    const oldDir = path.join(tmp, "runtime-assets", "postgres-init", "old");
    const newDir = path.join(tmp, "runtime-assets", "postgres-init", "new");
    const files = { "001-bootstrap.sh": "same-bytes\n" };
    makeInitTree(oldDir, files);
    makeInitTree(newDir, files);
    const disposition = resolvePostgresInitDisposition({
      candidateManifest: collectInitManifest(newDir),
      candidateMaterializedPath: newDir,
      activePostgres: { present: true, volumePresent: true, mountSource: oldDir, project: "boba-staging", persistentVolume: "boba-staging_postgres-data", imageCompatConflict: false },
      trustRoots: { runtimeAssetsRoot: path.join(tmp, "runtime-assets") },
    });
    assert.equal(disposition.disposition, POSTGRES_INIT_DISPOSITION.PRESERVE);
    assert.equal(disposition.composeInitDir, oldDir);

    ensurePersistentPostgres(
      "/tmp/build",
      { disposition },
      {
        trustRoots: { runtimeAssetsRoot: path.join(tmp, "runtime-assets") },
        inspect: () => ({
          Mounts: [
            { Name: "boba-staging_postgres-data", Destination: "/var/lib/postgresql" },
            { Source: oldDir, Destination: "/docker-entrypoint-initdb.d" },
          ],
          State: { Status: "running" },
        }),
        run: (args) => {
          effects.push(args.join(" "));
        },
        wait: () => {
          effects.push("wait");
        },
        log: () => {},
      },
    );
    assert.deepEqual(effects, ["wait"]);
    assert.ok(!effects.some((e) => e.includes("rm") || e.includes("stop") || e.includes("up")));
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
});

test("I10: image/version compatibility conflict -> separate disposition, no auto replacement", () => {
  const result = resolvePostgresInitDisposition({
    candidateManifest: { ok: true, files: [], digest: "x" },
    activePostgres: {
      present: true,
      volumePresent: true,
      mountSource: "/tmp/x",
      project: "boba-staging",
      persistentVolume: "boba-staging_postgres-data",
      imageCompatConflict: true,
    },
    trustRoots: { runtimeAssetsRoot: "/tmp/runtime-assets" },
  });
  assert.equal(result.disposition, POSTGRES_INIT_DISPOSITION.BLOCK);
  assert.equal(result.reasonCode, POSTGRES_INIT_REASON.IMAGE_COMPAT_CONFLICT);
});

test("I11: absent PostgreSQL state -> governed decision, not assumed fresh bootstrap", () => {
  const result = resolvePostgresInitDisposition({
    candidateManifest: { ok: true, files: [], digest: "x" },
    activePostgres: { present: false, imageCompatConflict: false },
    trustRoots: { runtimeAssetsRoot: "/tmp/runtime-assets" },
  });
  assert.equal(result.disposition, POSTGRES_INIT_DISPOSITION.BLOCK);
  assert.equal(result.reasonCode, POSTGRES_INIT_REASON.ABSENT_CONTAINER);
  assert.match(result.note ?? "", /governed|legacy recovery|fresh-start/i);
});

test("I12: older active mount and new candidate manifest match -> Compose mount path remains stable", () => {
  const tmp = mkdtempSync(path.join(os.tmpdir(), "boba-init-i12-"));
  try {
    const oldDir = path.join(tmp, "runtime-assets", "postgres-init", "older");
    const newDir = path.join(tmp, "runtime-assets", "postgres-init", "newer");
    const body = { "001-bootstrap.sh": "stable\n", "002-logical-backup-role.sh": "role\n" };
    makeInitTree(oldDir, body);
    makeInitTree(newDir, body);
    const result = resolvePostgresInitDisposition({
      candidateManifest: collectInitManifest(newDir),
      candidateMaterializedPath: newDir,
      activePostgres: { present: true, volumePresent: true, mountSource: oldDir, project: "boba-staging", persistentVolume: "boba-staging_postgres-data", imageCompatConflict: false },
      trustRoots: { runtimeAssetsRoot: path.join(tmp, "runtime-assets") },
    });
    assert.equal(result.composeInitDir, oldDir);
    assert.notEqual(result.composeInitDir, newDir);
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
});

test("R-INIT-01: wrong Compose project label -> BLOCK, never PRESERVE", () => {
  const tmp = mkdtempSync(path.join(os.tmpdir(), "boba-init-r01-"));
  try {
    const initDir = path.join(tmp, "runtime-assets", "postgres-init", "sha");
    makeInitTree(initDir, { "001-bootstrap.sh": "a\n" });
    const result = resolvePostgresInitDisposition({
      candidateManifest: collectInitManifest(initDir),
      candidateMaterializedPath: initDir,
      activePostgres: {
        present: true,
        volumePresent: true,
        mountSource: initDir,
        project: "wrong-project",
        persistentVolume: "boba-staging_postgres-data",
        imageCompatConflict: false,
      },
      trustRoots: { runtimeAssetsRoot: path.join(tmp, "runtime-assets") },
    });
    assert.equal(result.disposition, POSTGRES_INIT_DISPOSITION.BLOCK);
    assert.equal(result.reasonCode, POSTGRES_INIT_REASON.WRONG_COMPOSE_PROJECT);
    assert.equal(result.composeInitDir, null);
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
});

test("R-INIT-02: absent image compatibility evidence -> UNKNOWN/BLOCK, not PASS", () => {
  const tmp = mkdtempSync(path.join(os.tmpdir(), "boba-init-r02-"));
  try {
    const initDir = path.join(tmp, "runtime-assets", "postgres-init", "sha");
    makeInitTree(initDir, { "001-bootstrap.sh": "a\n" });
    const result = resolvePostgresInitDisposition({
      candidateManifest: collectInitManifest(initDir),
      candidateMaterializedPath: initDir,
      activePostgres: {
        present: true,
        volumePresent: true,
        mountSource: initDir,
        project: "boba-staging",
        persistentVolume: "boba-staging_postgres-data",
        // imageCompatConflict omitted → must not become PRESERVE
      },
      trustRoots: { runtimeAssetsRoot: path.join(tmp, "runtime-assets") },
    });
    assert.notEqual(result.disposition, POSTGRES_INIT_DISPOSITION.PRESERVE);
    assert.equal(result.reasonCode, POSTGRES_INIT_REASON.IMAGE_COMPAT_UNKNOWN);
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
});

test("R-INIT-03: wrong PostgreSQL persistent volume -> BLOCK", () => {
  const tmp = mkdtempSync(path.join(os.tmpdir(), "boba-init-r03-"));
  try {
    const initDir = path.join(tmp, "runtime-assets", "postgres-init", "sha");
    makeInitTree(initDir, { "001-bootstrap.sh": "a\n" });
    const result = resolvePostgresInitDisposition({
      candidateManifest: collectInitManifest(initDir),
      candidateMaterializedPath: initDir,
      activePostgres: {
        present: true,
        volumePresent: true,
        mountSource: initDir,
        project: "boba-staging",
        persistentVolume: "other_postgres-data",
        imageCompatConflict: false,
      },
      trustRoots: { runtimeAssetsRoot: path.join(tmp, "runtime-assets") },
    });
    assert.equal(result.disposition, POSTGRES_INIT_DISPOSITION.BLOCK);
    assert.equal(result.reasonCode, POSTGRES_INIT_REASON.WRONG_PERSISTENT_VOLUME);
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
});

test("R-INIT-04: different checkout trusted mount root -> UNKNOWN source-isolation", () => {
  const owned = mkdtempSync(path.join(os.tmpdir(), "boba-init-owned-"));
  const foreign = mkdtempSync(path.join(os.tmpdir(), "boba-init-foreign-"));
  try {
    const ownedRuntime = path.join(owned, ".env.staging", "runtime-assets");
    const foreignInit = path.join(
      foreign,
      ".env.staging",
      "runtime-assets",
      "postgres-init",
      "a".repeat(40),
    );
    const candidate = path.join(ownedRuntime, "postgres-init", "b".repeat(40));
    makeInitTree(foreignInit, { "001-bootstrap.sh": "same\n" });
    makeInitTree(candidate, { "001-bootstrap.sh": "same\n" });
    const result = resolvePostgresInitDisposition({
      candidateManifest: collectInitManifest(candidate),
      candidateMaterializedPath: candidate,
      activePostgres: {
        present: true,
        volumePresent: true,
        mountSource: foreignInit,
        project: "boba-staging",
        persistentVolume: "boba-staging_postgres-data",
        imageCompatConflict: false,
      },
      trustRoots: { runtimeAssetsRoot: ownedRuntime },
    });
    assert.equal(result.disposition, POSTGRES_INIT_DISPOSITION.UNKNOWN);
    assert.equal(result.reasonCode, POSTGRES_INIT_REASON.SOURCE_ISOLATION_UNRESOLVED);
    assert.match(result.note ?? "", /source-isolation|different checkout/i);
  } finally {
    rmSync(owned, { recursive: true, force: true });
    rmSync(foreign, { recursive: true, force: true });
  }
});
