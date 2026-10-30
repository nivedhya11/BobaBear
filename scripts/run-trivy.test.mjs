#!/usr/bin/env node
/**
 * Unit tests for IMP-038 Trivy production-image scan gate (no live builds).
 */
import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

import {
  TRIVY_VERSION,
  TRIVY_SHA256,
  TRIVY_SPAWN_MAX_BUFFER,
  PRODUCTION_IMAGE_TARGETS,
  REGISTER_REL,
  TRIVYIGNORE_REL,
  buildArgsForTarget,
  trivyImageArgs,
  resolveContainerCli,
  imageExists,
  ensureImageBuilt,
  isActiveExpiry,
  utcTodayIso,
  parseTrivyExceptionRegister,
  parseTrivyIgnoreFile,
  enforceTrivyExceptionPolicy,
  materializeIgnorefileForImage,
  interpretTrivyJson,
  scanImage,
  loadTrivyExceptionPolicy,
} from "./run-trivy.mjs";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

test("Trivy pin is immutable version + sha256 hex", () => {
  assert.equal(TRIVY_VERSION, "0.69.3");
  assert.match(TRIVY_SHA256, /^[a-f0-9]{64}$/);
});

test("PRODUCTION_IMAGE_TARGETS covers V1 deployable runtimes + postgres", () => {
  const ids = PRODUCTION_IMAGE_TARGETS.map((t) => t.id).sort();
  assert.deepEqual(ids, [
    "customer-auth-runtime",
    "customer-commerce-runtime",
    "operations-runtime",
    "postgres",
    "web-runtime",
    "workforce-auth-runtime",
  ]);
  for (const t of PRODUCTION_IMAGE_TARGETS) {
    assert.ok(t.image.endsWith(":trivy"), `image tag for ${t.id}`);
    assert.ok(t.dockerfile.length > 0);
  }
  const postgres = PRODUCTION_IMAGE_TARGETS.find((t) => t.id === "postgres");
  assert.equal(postgres?.dockerfile, "docker/postgres/Dockerfile");
  assert.equal(postgres?.target, null);
});

test("buildArgsForTarget includes --target when set", () => {
  assert.deepEqual(
    buildArgsForTarget({
      id: "web-runtime",
      image: "boba-bear-app:trivy",
      dockerfile: "Dockerfile",
      context: ".",
      target: "web-runtime",
    }),
    [
      "build",
      "--network=host",
      "-f",
      "Dockerfile",
      "-t",
      "boba-bear-app:trivy",
      "--target",
      "web-runtime",
      ".",
    ],
  );
  assert.deepEqual(
    buildArgsForTarget({
      id: "postgres",
      image: "boba-bear-postgres:trivy",
      dockerfile: "docker/postgres/Dockerfile",
      context: ".",
      target: null,
    }),
    ["build", "--network=host", "-f", "docker/postgres/Dockerfile", "-t", "boba-bear-postgres:trivy", "."],
  );
});

test("trivyImageArgs enables image-config misconfig + vuln scanners fail-closed", () => {
  const args = trivyImageArgs(
    "boba-bear-app:trivy",
    "/repo/.trivyignore",
    "/tmp/trivy-report.json",
  );
  assert.equal(args[0], "image");
  assert.equal(args[1], "boba-bear-app:trivy");
  assert.ok(args.includes("CRITICAL,HIGH"));
  assert.ok(args.includes("--exit-code"));
  assert.ok(args.includes("1"));
  assert.ok(args.includes("vuln,misconfig"));
  assert.ok(args.includes("--image-config-scanners"));
  assert.ok(args.includes("misconfig"));
  assert.ok(args.includes("--ignore-unfixed"));
  assert.ok(args.includes("json"));
  assert.ok(args.includes("/repo/.trivyignore"));
  assert.ok(args.includes("--output"));
  assert.ok(args.includes("/tmp/trivy-report.json"));
  assert.ok(!args.includes("fs"));
});

test("utcTodayIso ignores BOBA_TRIVY_TODAY env so production CI cannot override UTC", () => {
  const prev = process.env.BOBA_TRIVY_TODAY;
  process.env.BOBA_TRIVY_TODAY = "2099-01-01";
  try {
    assert.equal(utcTodayIso(new Date("2026-10-23T12:00:00.000Z")), "2026-10-23");
  } finally {
    if (prev === undefined) delete process.env.BOBA_TRIVY_TODAY;
    else process.env.BOBA_TRIVY_TODAY = prev;
  }
});

test("utcTodayIso accepts explicit injectedTodayIso only in isolated test paths", () => {
  assert.equal(utcTodayIso(new Date("2026-10-23T12:00:00.000Z"), "2026-10-24"), "2026-10-24");
  assert.throws(
    () => utcTodayIso(new Date("2026-10-23T12:00:00.000Z"), "not-a-date"),
    /INVALID_BOBA_TRIVY_TODAY/,
  );
});

test("resolveContainerCli prefers working podman then docker; fails closed", () => {
  const calls = [];
  const spawn = (cmd, args) => {
    calls.push([cmd, ...args]);
    if (cmd === "podman") return { status: 0 };
    return { status: 1 };
  };
  assert.equal(resolveContainerCli("", spawn), "podman");
  assert.deepEqual(calls[0], ["podman", "info"]);
});

test("resolveContainerCli fails when neither engine works", () => {
  assert.throws(
    () => resolveContainerCli("", () => ({ status: 1 })),
    /CONTAINER_CLI_UNAVAILABLE/,
  );
});

test("ensureImageBuilt fails closed when skip-build and image missing", () => {
  const spawn = (cmd, args) => {
    if (args[0] === "image" && (args[1] === "exists" || args[1] === "inspect")) {
      return { status: 1 };
    }
    return { status: 0 };
  };
  assert.throws(
    () =>
      ensureImageBuilt({
        cli: "podman",
        target: PRODUCTION_IMAGE_TARGETS[0],
        cwd: "/tmp",
        skipBuild: true,
        spawn,
      }),
    /IMAGE_MISSING/,
  );
});

test("ensureImageBuilt invokes container build when not skipping", () => {
  /** @type {string[][]} */
  const builds = [];
  const spawn = (cmd, args, opts) => {
    builds.push([cmd, ...args]);
    assert.equal(opts?.cwd, "/repo");
    return { status: 0 };
  };
  ensureImageBuilt({
    cli: "podman",
    target: PRODUCTION_IMAGE_TARGETS[0],
    cwd: "/repo",
    skipBuild: false,
    spawn,
  });
  assert.equal(builds.length, 1);
  assert.equal(builds[0][0], "podman");
  assert.equal(builds[0][1], "build");
  assert.ok(builds[0].includes("--target"));
});

test("imageExists accepts podman image exists success", () => {
  assert.equal(
    imageExists("podman", "boba-bear-app:trivy", () => ({ status: 0 })),
    true,
  );
  assert.equal(
    imageExists("docker", "boba-bear-app:trivy", (cmd, args) => {
      if (args[1] === "exists") return { status: 1 };
      if (args[1] === "inspect") return { status: 0 };
      return { status: 1 };
    }),
    true,
  );
});

test("isActiveExpiry is inclusive on the expiry calendar day", () => {
  assert.equal(isActiveExpiry("2026-10-23", "2026-10-23"), true);
  assert.equal(isActiveExpiry("2026-10-24", "2026-10-23"), false);
  assert.equal(isActiveExpiry("2026-10-22", "2026-10-23"), true);
});

const SAMPLE_REGISTER = `# Vulnerability exception register

## Active exceptions

| id | package/cve | severity | owner | rationale | authority | compensating_controls | retest_date | expiry |
|---|---|---|---|---|---|---|---|---|

## Container / Trivy exceptions

Prose before the table is ignored.

| id | finding_id | image | severity | owner | rationale | authority | compensating_controls | retest_date | expiry |
|---|---|---|---|---|---|---|---|---|---|
| VEX-TRIVY-001 | DS-0002 | postgres | high | platform-security | root bootstrap | IMP-038 §15 | DB not public | 2026-10-15 | 2026-10-23 |
`;

test("parseTrivyExceptionRegister reads machine table with image scope", () => {
  const { rows, errors } = parseTrivyExceptionRegister(SAMPLE_REGISTER);
  assert.deepEqual(errors, []);
  assert.equal(rows.length, 1);
  assert.equal(rows[0].id, "VEX-TRIVY-001");
  assert.equal(rows[0].finding_id, "DS-0002");
  assert.equal(rows[0].image, "postgres");
  assert.equal(rows[0].expiry, "2026-10-23");
});

test("parseTrivyIgnoreFile requires exp: for dated suppressions", () => {
  const parsed = parseTrivyIgnoreFile("# comment\nDS-0002 exp:2026-10-23\n");
  assert.deepEqual(parsed.errors, []);
  assert.equal(parsed.entries.length, 1);
  assert.equal(parsed.entries[0].id, "DS-0002");
  assert.equal(parsed.entries[0].expiry, "2026-10-23");
});

test("enforceTrivyExceptionPolicy fails closed on expired ignore even if register row exists", () => {
  const { rows } = parseTrivyExceptionRegister(SAMPLE_REGISTER);
  const { entries } = parseTrivyIgnoreFile("DS-0002 exp:2026-10-23\n");
  const expired = enforceTrivyExceptionPolicy({
    ignoreEntries: entries,
    registerRows: rows,
    todayIso: "2026-10-24",
  });
  assert.ok(expired.errors.some((e) => e.startsWith("TRIVY_EXCEPTION_EXPIRED")));
  assert.equal(expired.activeByFinding.size, 0);
});

test("enforceTrivyExceptionPolicy rejects unauthorized ignore IDs", () => {
  const { rows } = parseTrivyExceptionRegister(SAMPLE_REGISTER);
  const bad = enforceTrivyExceptionPolicy({
    ignoreEntries: [{ id: "DS-9999", expiry: "2026-10-23", raw: "DS-9999 exp:2026-10-23" }],
    registerRows: rows,
    todayIso: "2026-10-23",
  });
  assert.ok(bad.errors.some((e) => e.startsWith("TRIVY_IGNORE_UNAUTHORIZED")));
});

test("enforceTrivyExceptionPolicy rejects permanent ignore without exp:", () => {
  const { rows } = parseTrivyExceptionRegister(SAMPLE_REGISTER);
  const bad = enforceTrivyExceptionPolicy({
    ignoreEntries: [{ id: "DS-0002", expiry: null, raw: "DS-0002" }],
    registerRows: rows,
    todayIso: "2026-10-23",
  });
  assert.ok(bad.errors.some((e) => e.startsWith("TRIVY_IGNORE_MISSING_EXPIRY")));
});

test("enforceTrivyExceptionPolicy accepts ACTIVE scoped exception on expiry day", () => {
  const { rows } = parseTrivyExceptionRegister(SAMPLE_REGISTER);
  const { entries } = parseTrivyIgnoreFile("DS-0002 exp:2026-10-23\n");
  const ok = enforceTrivyExceptionPolicy({
    ignoreEntries: entries,
    registerRows: rows,
    todayIso: "2026-10-23",
  });
  assert.deepEqual(ok.errors, []);
  assert.equal(ok.activeByFinding.get("DS-0002")?.image, "postgres");
});

test("materializeIgnorefileForImage scopes DS-0002 to postgres only", () => {
  const { rows } = parseTrivyExceptionRegister(SAMPLE_REGISTER);
  const { entries } = parseTrivyIgnoreFile("DS-0002 exp:2026-10-23\n");
  const { activeByFinding } = enforceTrivyExceptionPolicy({
    ignoreEntries: entries,
    registerRows: rows,
    todayIso: "2026-10-23",
  });
  const dir = mkdtempSync(path.join(os.tmpdir(), "boba-trivy-test-"));
  try {
    const postgresIgnore = materializeIgnorefileForImage({
      imageId: "postgres",
      activeByFinding,
      ignoreEntries: entries,
      dir,
    });
    const webIgnore = materializeIgnorefileForImage({
      imageId: "web-runtime",
      activeByFinding,
      ignoreEntries: entries,
      dir,
    });
    const postgresText = readFileSync(postgresIgnore, "utf8");
    assert.match(postgresText, /^DS-0002$/m);
    assert.match(postgresText, /register_expiry=2026-10-23/);
    // Must not use Trivy exclusive exp: on the inclusive register expiry day.
    assert.doesNotMatch(postgresText, /^DS-0002 exp:/m);
    assert.doesNotMatch(readFileSync(webIgnore, "utf8"), /^DS-0002$/m);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("interpretTrivyJson fails closed on empty or malformed scanner output", () => {
  assert.ok(interpretTrivyJson("", "img").errors.some((e) => e.includes("TRIVY_EMPTY_OUTPUT")));
  assert.ok(
    interpretTrivyJson("not-json", "img").errors.some((e) => e.includes("TRIVY_JSON_UNPARSEABLE")),
  );
  assert.ok(
    interpretTrivyJson("[]", "img").errors.some((e) => e.includes("TRIVY_JSON_UNSUPPORTED_SHAPE")),
  );
  assert.ok(
    interpretTrivyJson("{}", "img").errors.some((e) => e.includes("TRIVY_JSON_EMPTY_OBJECT")),
  );
  assert.ok(
    interpretTrivyJson(JSON.stringify({ Results: [] }), "img").errors.some((e) =>
      e.includes("TRIVY_SCHEMA_MISSING"),
    ),
  );
});

test("interpretTrivyJson rejects schema/identity mismatches and accepts valid clean reports", () => {
  const clean = {
    SchemaVersion: 2,
    ArtifactName: "boba-bear-app:trivy",
    ArtifactType: "container_image",
  };
  const cleanOut = interpretTrivyJson(JSON.stringify(clean), "boba-bear-app:trivy");
  assert.deepEqual(cleanOut.errors, []);
  assert.equal(cleanOut.findings.length, 0);

  const cleanWithEmptyResults = {
    ...clean,
    Results: [{ Target: "boba-bear-app:trivy (alpine 3.20)", Class: "os-pkgs", Type: "alpine" }],
  };
  const emptyResultsOut = interpretTrivyJson(
    JSON.stringify(cleanWithEmptyResults),
    "boba-bear-app:trivy",
  );
  assert.deepEqual(emptyResultsOut.errors, []);
  assert.equal(emptyResultsOut.findings.length, 0);

  assert.ok(
    interpretTrivyJson(
      JSON.stringify({ ...clean, SchemaVersion: 1 }),
      "boba-bear-app:trivy",
    ).errors.some((e) => e.includes("TRIVY_SCHEMA_UNSUPPORTED")),
  );
  assert.ok(
    interpretTrivyJson(
      JSON.stringify({ ...clean, ArtifactType: "filesystem" }),
      "boba-bear-app:trivy",
    ).errors.some((e) => e.includes("TRIVY_ARTIFACT_TYPE_UNSUPPORTED")),
  );
  assert.ok(
    interpretTrivyJson(
      JSON.stringify({ ...clean, ArtifactName: "other:tag" }),
      "boba-bear-app:trivy",
    ).errors.some((e) => e.includes("TRIVY_ARTIFACT_MISMATCH")),
  );
});

test("interpretTrivyJson extracts DS-0002 misconfig findings", () => {
  const payload = JSON.stringify({
    SchemaVersion: 2,
    ArtifactName: "boba-bear-postgres:trivy",
    ArtifactType: "container_image",
    Results: [
      {
        Target: "boba-bear-postgres:trivy",
        Misconfigurations: [
          { ID: "DS-0002", Severity: "HIGH", Title: "Image user should not be 'root'" },
        ],
      },
    ],
  });
  const out = interpretTrivyJson(payload, "boba-bear-postgres:trivy");
  assert.deepEqual(out.errors, []);
  assert.equal(out.findings.length, 1);
  assert.equal(out.findings[0].id, "DS-0002");
  assert.equal(out.findings[0].type, "misconfig");
});

test("scanImage writes JSON via --output and tolerates reports larger than 1 MiB", () => {
  const reportDir = mkdtempSync(path.join(os.tmpdir(), "boba-trivy-scan-"));
  const reportPath = path.join(reportDir, "report.json");
  try {
    const oversizedClean = {
      SchemaVersion: 2,
      ArtifactName: "boba-bear-app:trivy",
      ArtifactType: "container_image",
      Results: [
        {
          Target: "boba-bear-app:trivy",
          Class: "os-pkgs",
          Type: "alpine",
          // Inflate past Node spawnSync default maxBuffer (1 MiB) if ever captured on stdout.
          Packages: Array.from({ length: 20_000 }, (_, i) => ({
            Name: `pkg-${i}`,
            Version: "1.0.0",
            padding: "x".repeat(64),
          })),
        },
      ],
    };
    const json = JSON.stringify(oversizedClean);
    assert.ok(Buffer.byteLength(json, "utf8") > 1024 * 1024);

    /** @type {object | null} */
    let spawnOpts = null;
    const spawn = (_cmd, args, opts) => {
      spawnOpts = opts;
      assert.ok(args.includes("--output"));
      const outIdx = args.indexOf("--output");
      writeFileSync(args[outIdx + 1], json, "utf8");
      return { status: 0, stdout: "", stderr: "" };
    };

    const scanned = scanImage({
      bin: "trivy",
      image: "boba-bear-app:trivy",
      ignorefile: "/tmp/ignore",
      cwd: "/repo",
      reportPath,
      spawn,
    });
    assert.equal(scanned.status, 0);
    assert.deepEqual(scanned.errors, []);
    assert.equal(scanned.findings.length, 0);
    assert.equal(spawnOpts?.maxBuffer, TRIVY_SPAWN_MAX_BUFFER);
    assert.ok(TRIVY_SPAWN_MAX_BUFFER > 1024 * 1024);
  } finally {
    rmSync(reportDir, { recursive: true, force: true });
  }
});

test("scanImage surfaces spawnSync ENOBUFS / result.error diagnostically", () => {
  const reportDir = mkdtempSync(path.join(os.tmpdir(), "boba-trivy-enobufs-"));
  const reportPath = path.join(reportDir, "report.json");
  try {
    const enobufs = Object.assign(new Error("spawnSync trivy ENOBUFS"), { code: "ENOBUFS" });
    const scanned = scanImage({
      bin: "trivy",
      image: "boba-bear-app:trivy",
      ignorefile: "/tmp/ignore",
      cwd: "/repo",
      reportPath,
      spawn: () => ({ status: null, stdout: "", stderr: "", error: enobufs }),
    });
    assert.equal(scanned.status, 1);
    assert.ok(scanned.errors.some((e) => e.includes("TRIVY_SPAWN_ERROR")));
    assert.ok(scanned.errors.some((e) => e.includes("ENOBUFS")));
  } finally {
    rmSync(reportDir, { recursive: true, force: true });
  }
});

test("committed register + .trivyignore have no container exceptions after DS-0002 retirement", () => {
  const policy = loadTrivyExceptionPolicy({
    root: repoRoot,
    todayIso: "2026-10-26",
  });
  assert.deepEqual(policy.errors, []);
  assert.equal(policy.registerRows.length, 0);
  assert.equal(policy.ignoreEntries.length, 0);
  assert.equal(policy.activeByFinding.has("DS-0002"), false);
});

test("retired VEX-TRIVY-001 is absent from the committed register and ignore file", () => {
  const md = readFileSync(path.join(repoRoot, REGISTER_REL), "utf8");
  const ignore = readFileSync(path.join(repoRoot, TRIVYIGNORE_REL), "utf8");
  assert.doesNotMatch(md, /VEX-TRIVY-001/);
  assert.doesNotMatch(ignore, /^DS-0002(?:\s|$)/m);
});

test("register file documents Container / Trivy exceptions section at expected path", () => {
  const md = readFileSync(path.join(repoRoot, REGISTER_REL), "utf8");
  assert.match(md, /^## Container \/ Trivy exceptions\s*$/m);
  assert.match(md, /finding_id/);
});
