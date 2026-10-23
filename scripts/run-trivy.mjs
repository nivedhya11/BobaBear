#!/usr/bin/env node
/**
 * IMP-038 §15 container image scan — download pinned Trivy OSS binary and scan
 * actual built production runtime images (including base/OS layers and image
 * configuration misconfigurations such as DS-0002).
 *
 * Avoids aquasecurity/trivy-action / setup-trivy GitHub Actions after the
 * 2026 supply-chain tag compromise. Prefer pinned binary + SHA256 verify.
 *
 * Exception policy:
 *   - Committed `.trivyignore` suppressions must match ACTIVE rows in
 *     docs/platform/security/vulnerability-exception-register.md
 *     (`## Container / Trivy exceptions`).
 *   - Expired / unauthorized ignore entries fail closed even if Trivy would
 *     otherwise silently suppress the finding.
 *   - ACTIVE ignores are applied only to the justified `image` target id.
 *
 * Usage:
 *   node scripts/run-trivy.mjs
 *   npm run audit:container
 *
 * Env:
 *   BOBA_TRIVY_SKIP_BUILD=1 — reuse already-tagged local images (still fails
 *     closed if any required image is missing; never silently skips scan).
 *   BOBA_TRIVY_CONTAINER_CLI — force docker|podman
 *   BOBA_TRIVY_TODAY — UTC YYYY-MM-DD override for expiry tests
 */
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import {
  chmodSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import os from "node:os";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDir, "..");

/** Pinned safe Trivy release (linux-64bit). Update pin map when bumping. */
export const TRIVY_VERSION = "0.69.3";
export const TRIVY_ARCHIVE = `trivy_${TRIVY_VERSION}_Linux-64bit.tar.gz`;
export const TRIVY_URL =
  `https://github.com/aquasecurity/trivy/releases/download/v${TRIVY_VERSION}/${TRIVY_ARCHIVE}`;
export const TRIVY_SHA256 =
  "1816b632dfe529869c740c0913e36bd1629cb7688bd5634f4a858c1d57c88b75";

export const REGISTER_REL =
  "docs/platform/security/vulnerability-exception-register.md";
export const TRIVYIGNORE_REL = ".trivyignore";

export const TRIVY_EXCEPTION_HEADERS = Object.freeze([
  "id",
  "finding_id",
  "image",
  "severity",
  "owner",
  "rationale",
  "authority",
  "compensating_controls",
  "retest_date",
  "expiry",
]);

/**
 * V1 deployable production runtime image targets.
 * Each is built then scanned with `trivy image` so base/OS layers are included.
 *
 * @typedef {{ id: string, image: string, dockerfile: string, context: string, target: string | null }} ImageTarget
 */

/** @type {readonly ImageTarget[]} */
export const PRODUCTION_IMAGE_TARGETS = Object.freeze([
  {
    id: "web-runtime",
    image: "boba-bear-app:trivy",
    dockerfile: "Dockerfile",
    context: ".",
    target: "web-runtime",
  },
  {
    id: "customer-auth-runtime",
    image: "boba-bear-customer-auth:trivy",
    dockerfile: "Dockerfile",
    context: ".",
    target: "customer-auth-runtime",
  },
  {
    id: "workforce-auth-runtime",
    image: "boba-bear-workforce-auth:trivy",
    dockerfile: "Dockerfile",
    context: ".",
    target: "workforce-auth-runtime",
  },
  {
    id: "customer-commerce-runtime",
    image: "boba-bear-customer-commerce:trivy",
    dockerfile: "Dockerfile",
    context: ".",
    target: "customer-commerce-runtime",
  },
  {
    id: "operations-runtime",
    image: "boba-bear-operations:trivy",
    dockerfile: "Dockerfile",
    context: ".",
    target: "operations-runtime",
  },
  {
    id: "postgres",
    image: "boba-bear-postgres:trivy",
    dockerfile: "docker/postgres/Dockerfile",
    context: ".",
    target: null,
  },
]);

const cacheDir = path.join(projectRoot, ".cache", "trivy", TRIVY_VERSION);
const archivePath = path.join(cacheDir, TRIVY_ARCHIVE);
const binaryPath = path.join(cacheDir, "trivy");

export function sha256File(filePath) {
  const hash = createHash("sha256");
  hash.update(readFileSync(filePath));
  return hash.digest("hex");
}

async function download(url, dest) {
  const res = await fetch(url, { redirect: "follow" });
  if (!res.ok) {
    throw new Error(`DOWNLOAD_FAILED status=${res.status} url=${url}`);
  }
  writeFileSync(dest, Buffer.from(await res.arrayBuffer()));
}

export async function ensureBinary() {
  mkdirSync(cacheDir, { recursive: true });
  if (existsSync(binaryPath)) return binaryPath;
  const expected = TRIVY_SHA256.toLowerCase();
  if (!existsSync(archivePath) || sha256File(archivePath) !== expected) {
    console.log(`Downloading trivy v${TRIVY_VERSION}…`);
    await download(TRIVY_URL, archivePath);
  }
  const digest = sha256File(archivePath);
  if (digest !== expected) {
    throw new Error(`TRIVY_SHA_MISMATCH expected=${expected} got=${digest}`);
  }
  writeFileSync(path.join(cacheDir, "SHA256"), `${expected}  ${TRIVY_ARCHIVE}\n`);
  const extracted = spawnSync("tar", ["-xzf", archivePath, "-C", cacheDir, "trivy"], {
    encoding: "utf8",
  });
  if (extracted.status !== 0) {
    throw new Error(`TRIVY_EXTRACT_FAILED: ${extracted.stderr || extracted.stdout}`);
  }
  chmodSync(binaryPath, 0o755);
  return binaryPath;
}

/**
 * Prefer podman (CI/WSL rootless) then docker. Fail closed when neither works.
 * @param {string} [forced]
 * @param {(cmd: string, args: string[], opts?: object) => { status: number | null }} [spawn]
 */
export function resolveContainerCli(forced = process.env.BOBA_TRIVY_CONTAINER_CLI, spawn = spawnSync) {
  const prefer = (forced || "").trim().toLowerCase();
  if (prefer === "podman" || prefer === "docker") {
    const probe = spawn(prefer, ["info"], { encoding: "utf8", timeout: 30_000 });
    if (probe.status === 0) return prefer;
    throw new Error(`CONTAINER_CLI_UNAVAILABLE forced=${prefer}`);
  }
  for (const cli of ["podman", "docker"]) {
    const probe = spawn(cli, ["info"], { encoding: "utf8", timeout: 30_000 });
    if (probe.status === 0) return cli;
  }
  throw new Error("CONTAINER_CLI_UNAVAILABLE need podman or docker for image build/scan");
}

/**
 * @param {ImageTarget} target
 * @returns {string[]}
 */
export function buildArgsForTarget(target) {
  // --network=host: next/font Google fetch during web-runtime build fails
  // intermittently under the default podman CNI/slirp path (null font loader).
  const args = ["build", "--network=host", "-f", target.dockerfile, "-t", target.image];
  if (target.target) args.push("--target", target.target);
  args.push(target.context);
  return args;
}

/**
 * @param {string} image
 * @param {string} ignorefile
 * @returns {string[]}
 */
export function trivyImageArgs(image, ignorefile) {
  return [
    "image",
    image,
    "--severity",
    "CRITICAL,HIGH",
    "--exit-code",
    "1",
    "--format",
    "json",
    "--scanners",
    "vuln,misconfig",
    // Image metadata / Dockerfile USER root (DS-0002) lives here — not in
    // filesystem `--scanners misconfig` alone (Trivy 0.69.3).
    "--image-config-scanners",
    "misconfig",
    // Fail closed on remediable findings. Distro CVEs without an available
    // fixed package remain visible in full scans but do not block the gate;
    // Dockerfile apt/apk upgrades apply available patches first.
    "--ignore-unfixed",
    "--ignorefile",
    ignorefile,
  ];
}

/**
 * @param {string} iso
 * @returns {boolean}
 */
export function isIsoDate(iso) {
  return /^\d{4}-\d{2}-\d{2}$/.test(iso);
}

/**
 * Inclusive UTC calendar expiry (same contract as SCA `isActiveExpiry`).
 * @param {string} todayIso
 * @param {string} expiryIso
 */
export function isActiveExpiry(todayIso, expiryIso) {
  if (!isIsoDate(todayIso) || !isIsoDate(expiryIso)) return false;
  return expiryIso >= todayIso;
}

/**
 * @returns {string} UTC YYYY-MM-DD
 */
export function utcTodayIso(now = new Date(), envToday = process.env.BOBA_TRIVY_TODAY) {
  const override = (envToday || "").trim();
  if (override) {
    if (!isIsoDate(override)) {
      throw new Error(`INVALID_BOBA_TRIVY_TODAY value=${override}`);
    }
    return override;
  }
  return now.toISOString().slice(0, 10);
}

/**
 * @param {string} line
 * @returns {string[]}
 */
function splitRow(line) {
  const trimmed = line.trim().replace(/^\|/, "").replace(/\|$/, "");
  return trimmed.split("|").map((c) => c.trim());
}

/**
 * Parse Container / Trivy exceptions table from the register markdown.
 * @param {string} markdown
 * @returns {{ rows: Array<Record<string, string>>, errors: string[] }}
 */
export function parseTrivyExceptionRegister(markdown) {
  const errors = [];
  const sectionMatch = markdown.match(/^## Container \/ Trivy exceptions\s*$/m);
  if (!sectionMatch || sectionMatch.index === undefined) {
    return { rows: [], errors: ["MISSING_TRIVY_EXCEPTIONS_SECTION"] };
  }
  const after = markdown.slice(sectionMatch.index + sectionMatch[0].length);
  const lines = after
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  // Skip prose until the machine table header.
  let tableStart = -1;
  for (let i = 0; i < lines.length; i += 1) {
    if (lines[i].startsWith("|") && /finding_id/i.test(lines[i])) {
      tableStart = i;
      break;
    }
    // Stop if a new markdown section begins before the table.
    if (lines[i].startsWith("## ")) break;
  }
  if (tableStart < 0) {
    return { rows: [], errors: ["MISSING_TRIVY_EXCEPTION_TABLE"] };
  }

  const tableLines = [];
  for (let i = tableStart; i < lines.length; i += 1) {
    if (!lines[i].startsWith("|")) break;
    tableLines.push(lines[i]);
  }
  if (tableLines.length < 2) {
    return { rows: [], errors: ["MISSING_TRIVY_EXCEPTION_TABLE"] };
  }

  const headerCells = splitRow(tableLines[0]).map((h) => h.toLowerCase());
  const sep = tableLines[1];
  if (!/^\|[\s:-]+\|/.test(sep)) {
    errors.push("INVALID_TRIVY_TABLE_SEPARATOR");
  }
  if (headerCells.length !== TRIVY_EXCEPTION_HEADERS.length) {
    errors.push(
      `TRIVY_HEADER_COUNT_MISMATCH expected=${TRIVY_EXCEPTION_HEADERS.length} got=${headerCells.length}`,
    );
  }
  for (let i = 0; i < TRIVY_EXCEPTION_HEADERS.length; i += 1) {
    const got = headerCells[i] || "";
    if (got !== TRIVY_EXCEPTION_HEADERS[i]) {
      errors.push(
        `TRIVY_HEADER_MISMATCH col=${i} expected=${TRIVY_EXCEPTION_HEADERS[i]} got=${got || "<missing>"}`,
      );
    }
  }

  const knownImages = new Set(PRODUCTION_IMAGE_TARGETS.map((t) => t.id));
  /** @type {Array<Record<string, string>>} */
  const rows = [];
  for (let i = 2; i < tableLines.length; i += 1) {
    const cells = splitRow(tableLines[i]);
    if (cells.every((c) => c === "")) continue;
    if (cells.length !== TRIVY_EXCEPTION_HEADERS.length) {
      errors.push(
        `TRIVY_ROW_COL_COUNT id=${cells[0] || "?"} expected=${TRIVY_EXCEPTION_HEADERS.length} got=${cells.length}`,
      );
      continue;
    }
    /** @type {Record<string, string>} */
    const row = {};
    for (let c = 0; c < TRIVY_EXCEPTION_HEADERS.length; c += 1) {
      row[TRIVY_EXCEPTION_HEADERS[c]] = cells[c];
    }
    for (const key of TRIVY_EXCEPTION_HEADERS) {
      if (!row[key]) errors.push(`TRIVY_EMPTY_FIELD id=${row.id || "?"} field=${key}`);
    }
    if (row.expiry && !isIsoDate(row.expiry)) {
      errors.push(`TRIVY_INVALID_EXPIRY id=${row.id || "?"} value=${row.expiry}`);
    }
    if (row.retest_date && !isIsoDate(row.retest_date)) {
      errors.push(`TRIVY_INVALID_RETEST id=${row.id || "?"} value=${row.retest_date}`);
    }
    const sev = (row.severity || "").toLowerCase();
    if (sev && !["critical", "high", "moderate", "low"].includes(sev)) {
      errors.push(`TRIVY_INVALID_SEVERITY id=${row.id || "?"} value=${row.severity}`);
    }
    row.severity = sev;
    if (row.image && !knownImages.has(row.image)) {
      errors.push(
        `TRIVY_UNKNOWN_IMAGE id=${row.id || "?"} image=${row.image} (must be a PRODUCTION_IMAGE_TARGETS id)`,
      );
    }
    if (!/^[A-Z0-9][A-Z0-9_-]*$/.test(row.finding_id || "")) {
      errors.push(`TRIVY_INVALID_FINDING_ID id=${row.id || "?"} value=${row.finding_id}`);
    }
    rows.push(row);
  }

  return { rows, errors };
}

/**
 * Parse committed `.trivyignore` finding lines (IDs + optional exp:YYYY-MM-DD).
 * @param {string} text
 * @returns {{ entries: Array<{ id: string, expiry: string | null, raw: string }>, errors: string[] }}
 */
export function parseTrivyIgnoreFile(text) {
  const errors = [];
  /** @type {Array<{ id: string, expiry: string | null, raw: string }>} */
  const entries = [];
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    // Plain .trivyignore: `DS-0002` or `DS-0002 exp:2026-10-23`
    const match = line.match(/^([A-Za-z0-9][A-Za-z0-9._:-]*)(?:\s+exp:(\d{4}-\d{2}-\d{2}))?\s*$/);
    if (!match) {
      errors.push(`TRIVYIGNORE_UNPARSEABLE line=${JSON.stringify(line)}`);
      continue;
    }
    const id = match[1];
    const expiry = match[2] || null;
    if (expiry && !isIsoDate(expiry)) {
      errors.push(`TRIVYIGNORE_INVALID_EXPIRY id=${id} value=${expiry}`);
    }
    entries.push({ id, expiry, raw: line });
  }
  return { entries, errors };
}

/**
 * Fail closed when ignorefile and register disagree, or when an ignore is expired.
 * @param {object} options
 * @param {Array<{ id: string, expiry: string | null, raw: string }>} options.ignoreEntries
 * @param {Array<Record<string, string>>} options.registerRows
 * @param {string} options.todayIso
 * @returns {{ activeByFinding: Map<string, Record<string, string>>, errors: string[] }}
 */
export function enforceTrivyExceptionPolicy(options) {
  const { ignoreEntries, registerRows, todayIso } = options;
  /** @type {string[]} */
  const errors = [];
  /** @type {Map<string, Record<string, string>>} */
  const activeByFinding = new Map();
  /** @type {Map<string, Record<string, string>>} */
  const rowsByFinding = new Map();

  for (const row of registerRows) {
    const finding = row.finding_id;
    if (rowsByFinding.has(finding)) {
      errors.push(`TRIVY_REGISTER_DUPLICATE_FINDING finding_id=${finding}`);
    }
    rowsByFinding.set(finding, row);
    if (isActiveExpiry(todayIso, row.expiry)) {
      activeByFinding.set(finding, row);
    }
  }

  for (const entry of ignoreEntries) {
    const row = rowsByFinding.get(entry.id);
    if (!row) {
      errors.push(
        `TRIVY_IGNORE_UNAUTHORIZED finding_id=${entry.id} (absent from Container / Trivy exceptions register)`,
      );
      continue;
    }
    if (!isActiveExpiry(todayIso, row.expiry)) {
      errors.push(
        `TRIVY_EXCEPTION_EXPIRED id=${row.id} finding_id=${entry.id} expiry=${row.expiry} today=${todayIso} (fail closed; do not silently suppress)`,
      );
      continue;
    }
    if (entry.expiry && entry.expiry !== row.expiry) {
      errors.push(
        `TRIVY_IGNORE_EXPIRY_MISMATCH finding_id=${entry.id} ignore=${entry.expiry} register=${row.expiry}`,
      );
    }
    if (!entry.expiry) {
      // Permanent ignore lines are forbidden for register-backed HIGH/CRITICAL suppressions.
      errors.push(
        `TRIVY_IGNORE_MISSING_EXPIRY finding_id=${entry.id} (must mirror register expiry ${row.expiry})`,
      );
    }
  }

  // Register ACTIVE rows must be represented in the ignorefile (keeps dual sources aligned).
  for (const [finding, row] of activeByFinding) {
    if (!ignoreEntries.some((e) => e.id === finding)) {
      errors.push(
        `TRIVY_REGISTER_IGNORE_MISSING id=${row.id} finding_id=${finding} (ACTIVE register row has no .trivyignore entry)`,
      );
    }
  }

  return { activeByFinding, errors };
}

/**
 * Build a temp ignorefile containing only ACTIVE exceptions for one image target.
 * Image-config path filters cannot scope DS-0002; per-target ignore application does.
 *
 * Trivy 0.69.3 plain-ignore `exp:YYYY-MM-DD` stops suppressing on that UTC calendar
 * day (exclusive). The exception register uses inclusive ACTIVE (`expiry >= today`),
 * matching SCA. Therefore materialized scan ignores omit Trivy's `exp:` and the gate
 * alone enforces register expiry fail-closed before any scan runs.
 *
 * @param {object} options
 * @param {string} options.imageId
 * @param {Map<string, Record<string, string>>} options.activeByFinding
 * @param {Array<{ id: string, expiry: string | null }>} options.ignoreEntries
 * @param {string} options.dir
 * @returns {string} path to ignorefile for this scan
 */
export function materializeIgnorefileForImage(options) {
  const { imageId, activeByFinding, ignoreEntries, dir } = options;
  const lines = [
    "# Generated by scripts/run-trivy.mjs — do not commit.",
    `# target_image_id=${imageId}`,
    "# Only ACTIVE register-backed exceptions for this image are included.",
    "# Register expiry is enforced by the gate (inclusive). Trivy exp: omitted on purpose.",
  ];
  for (const entry of ignoreEntries) {
    const row = activeByFinding.get(entry.id);
    if (!row) continue;
    if (row.image !== imageId) continue;
    lines.push(`# register_id=${row.id} register_expiry=${row.expiry}`);
    lines.push(entry.id);
  }
  lines.push("");
  const filePath = path.join(dir, `trivyignore.${imageId}`);
  writeFileSync(filePath, `${lines.join("\n")}\n`, "utf8");
  return filePath;
}

/**
 * @param {string} cli
 * @param {string} image
 * @param {(cmd: string, args: string[], opts?: object) => { status: number | null }} [spawn]
 */
export function imageExists(cli, image, spawn = spawnSync) {
  const result = spawn(cli, ["image", "exists", image], { encoding: "utf8" });
  if (result.status === 0) return true;
  // docker uses `docker image inspect` (no `image exists`)
  const inspect = spawn(cli, ["image", "inspect", image], { encoding: "utf8" });
  return inspect.status === 0;
}

/**
 * @param {object} options
 * @param {string} options.cli
 * @param {ImageTarget} options.target
 * @param {string} options.cwd
 * @param {boolean} options.skipBuild
 * @param {(cmd: string, args: string[], opts?: object) => { status: number | null, stderr?: string, stdout?: string }} [options.spawn]
 */
export function ensureImageBuilt(options) {
  const spawn = options.spawn ?? spawnSync;
  const { cli, target, cwd, skipBuild } = options;
  if (skipBuild) {
    if (!imageExists(cli, target.image, spawn)) {
      throw new Error(
        `IMAGE_MISSING id=${target.id} image=${target.image} (BOBA_TRIVY_SKIP_BUILD set; build required images first)`,
      );
    }
    console.log(`Reusing existing image ${target.image} (skip build)`);
    return;
  }
  const args = buildArgsForTarget(target);
  console.log(`Building ${target.id}: ${cli} ${args.join(" ")}`);
  const result = spawn(cli, args, { cwd, encoding: "utf8", stdio: "inherit" });
  if (result.status !== 0) {
    throw new Error(`IMAGE_BUILD_FAILED id=${target.id} status=${result.status}`);
  }
}

/**
 * Fail closed on unsupported / unparseable scanner JSON.
 * @param {string} stdout
 * @param {string} image
 * @returns {{ findings: Array<{ id: string, severity: string, type: string }>, errors: string[] }}
 */
export function interpretTrivyJson(stdout, image) {
  const errors = [];
  const trimmed = (stdout || "").trim();
  if (!trimmed) {
    return { findings: [], errors: [`TRIVY_EMPTY_OUTPUT image=${image}`] };
  }
  let data;
  try {
    data = JSON.parse(trimmed);
  } catch {
    return { findings: [], errors: [`TRIVY_JSON_UNPARSEABLE image=${image}`] };
  }
  if (data === null || typeof data !== "object" || Array.isArray(data)) {
    return { findings: [], errors: [`TRIVY_JSON_UNSUPPORTED_SHAPE image=${image}`] };
  }
  if (!Object.prototype.hasOwnProperty.call(data, "Results")) {
    // Trivy may omit Results when there are zero findings; treat missing key as empty.
    // Any other top-level SchemaVersion absence is still accepted if Results is present or absent.
  }
  if (data.Results != null && !Array.isArray(data.Results)) {
    return { findings: [], errors: [`TRIVY_RESULTS_NOT_ARRAY image=${image}`] };
  }

  /** @type {Array<{ id: string, severity: string, type: string }>} */
  const findings = [];
  for (const result of data.Results || []) {
    if (!result || typeof result !== "object") {
      errors.push(`TRIVY_RESULT_UNSUPPORTED image=${image}`);
      continue;
    }
    for (const vuln of result.Vulnerabilities || []) {
      if (!vuln || typeof vuln !== "object" || !vuln.VulnerabilityID) {
        errors.push(`TRIVY_VULN_UNSUPPORTED image=${image}`);
        continue;
      }
      findings.push({
        id: String(vuln.VulnerabilityID),
        severity: String(vuln.Severity || "").toUpperCase(),
        type: "vuln",
      });
    }
    for (const misc of result.Misconfigurations || []) {
      if (!misc || typeof misc !== "object") {
        errors.push(`TRIVY_MISCONFIG_UNSUPPORTED image=${image}`);
        continue;
      }
      const id = misc.ID || misc.AVDID;
      if (!id) {
        errors.push(`TRIVY_MISCONFIG_MISSING_ID image=${image}`);
        continue;
      }
      findings.push({
        id: String(id),
        severity: String(misc.Severity || "").toUpperCase(),
        type: "misconfig",
      });
    }
  }
  return { findings, errors };
}

/**
 * @param {object} options
 * @param {string} options.bin
 * @param {string} options.image
 * @param {string} options.ignorefile
 * @param {string} options.cwd
 * @param {(cmd: string, args: string[], opts?: object) => { status: number | null, stdout?: string, stderr?: string }} [options.spawn]
 * @returns {{ status: number, findings: Array<{ id: string, severity: string, type: string }>, errors: string[], stdout: string, stderr: string }}
 */
export function scanImage(options) {
  const spawn = options.spawn ?? spawnSync;
  const args = trivyImageArgs(options.image, options.ignorefile);
  console.log(`Scanning image ${options.image}: ${options.bin} ${args.join(" ")}`);
  const result = spawn(options.bin, args, {
    cwd: options.cwd,
    encoding: "utf8",
  });
  const stdout = result.stdout || "";
  const stderr = result.stderr || "";
  // Keep operator logs compact: surface Trivy diagnostics, not the full JSON blob.
  if (stderr) process.stderr.write(stderr.endsWith("\n") ? stderr : `${stderr}\n`);

  const status = typeof result.status === "number" ? result.status : 1;
  // Unknown flags / unsupported scanner values → Trivy FATAL (non-zero) → fail closed.
  if (status !== 0 && status !== 1) {
    return {
      status: status || 1,
      findings: [],
      errors: [
        `TRIVY_SCANNER_ERROR image=${options.image} status=${status} (unsupported/unknown scanner output fails closed)`,
      ],
      stdout,
      stderr,
    };
  }

  const interpreted = interpretTrivyJson(stdout, options.image);
  if (interpreted.errors.length > 0) {
    return {
      status: 1,
      findings: interpreted.findings,
      errors: interpreted.errors,
      stdout,
      stderr,
    };
  }

  // status 1 with findings = policy failure; status 0 = clean.
  // If Trivy exited 1 but JSON has no HIGH/CRITICAL findings, treat as scanner error (fail closed).
  const blocking = interpreted.findings.filter(
    (f) => f.severity === "CRITICAL" || f.severity === "HIGH",
  );
  if (blocking.length > 0) {
    console.error(
      `Trivy HIGH/CRITICAL findings image=${options.image}: ${blocking.map((f) => `${f.type}:${f.id}/${f.severity}`).join(", ")}`,
    );
  }
  if (status === 1 && blocking.length === 0) {
    return {
      status: 1,
      findings: interpreted.findings,
      errors: [
        `TRIVY_EXIT_WITHOUT_FINDINGS image=${options.image} (fail closed on unexplained non-zero exit)`,
      ],
      stdout,
      stderr,
    };
  }
  if (status === 0 && blocking.length > 0) {
    return {
      status: 1,
      findings: interpreted.findings,
      errors: [
        `TRIVY_FINDINGS_WITH_ZERO_EXIT image=${options.image} (fail closed on inconsistent scanner output)`,
      ],
      stdout,
      stderr,
    };
  }

  return {
    status: blocking.length > 0 ? 1 : 0,
    findings: interpreted.findings,
    errors: [],
    stdout,
    stderr,
  };
}

/**
 * Load + enforce register/ignore policy. Exported for tests.
 * @param {object} [options]
 * @param {string} [options.root]
 * @param {string} [options.todayIso]
 */
export function loadTrivyExceptionPolicy(options = {}) {
  const root = options.root || projectRoot;
  const todayIso = options.todayIso || utcTodayIso();
  const registerPath = path.join(root, REGISTER_REL);
  const ignorePath = path.join(root, TRIVYIGNORE_REL);

  if (!existsSync(registerPath)) {
    throw new Error(`MISSING_EXCEPTION_REGISTER expected ${REGISTER_REL}`);
  }
  if (!existsSync(ignorePath)) {
    throw new Error(`MISSING_TRIVYIGNORE expected ${TRIVYIGNORE_REL} at repository root`);
  }

  const registerMd = readFileSync(registerPath, "utf8");
  const ignoreText = readFileSync(ignorePath, "utf8");
  const parsedRegister = parseTrivyExceptionRegister(registerMd);
  const parsedIgnore = parseTrivyIgnoreFile(ignoreText);
  const policy = enforceTrivyExceptionPolicy({
    ignoreEntries: parsedIgnore.entries,
    registerRows: parsedRegister.rows,
    todayIso,
  });

  const errors = [...parsedRegister.errors, ...parsedIgnore.errors, ...policy.errors];
  return {
    todayIso,
    registerRows: parsedRegister.rows,
    ignoreEntries: parsedIgnore.entries,
    activeByFinding: policy.activeByFinding,
    errors,
  };
}

async function main() {
  const policy = loadTrivyExceptionPolicy();
  if (policy.errors.length > 0) {
    console.error("FAIL: Trivy exception policy errors (fail closed):");
    for (const err of policy.errors) {
      console.error(`  - ${err}`);
    }
    const expired = policy.errors.some((e) => e.startsWith("TRIVY_EXCEPTION_EXPIRED"));
    if (expired) {
      console.error(
        "BLOCKED_BY_EXCEPTION_AUTHORITY: renewing VEX-TRIVY-* requires explicit Founder/authority approval; do not extend expiry in this gate.",
      );
    }
    process.exit(1);
  }

  const skipBuild = process.env.BOBA_TRIVY_SKIP_BUILD === "1";
  const cli = resolveContainerCli();
  const bin = await ensureBinary();
  const targets = PRODUCTION_IMAGE_TARGETS;
  const tempDir = mkdtempSync(path.join(os.tmpdir(), "boba-trivy-ignore-"));

  console.log(
    `Trivy image gate v${TRIVY_VERSION} cli=${cli} targets=${targets.length} skip_build=${skipBuild} today=${policy.todayIso} image_config_scanners=misconfig`,
  );

  /** @type {Array<{ id: string, image: string, status: number, findings: string[] }>} */
  const results = [];
  try {
    for (const target of targets) {
      ensureImageBuilt({ cli, target, cwd: projectRoot, skipBuild });
      const ignorefile = materializeIgnorefileForImage({
        imageId: target.id,
        activeByFinding: policy.activeByFinding,
        ignoreEntries: policy.ignoreEntries,
        dir: tempDir,
      });
      const scanned = scanImage({
        bin,
        image: target.image,
        ignorefile,
        cwd: projectRoot,
      });
      if (scanned.errors.length > 0) {
        for (const err of scanned.errors) {
          console.error(`FAIL: ${err}`);
        }
      }
      const findingIds = scanned.findings
        .filter((f) => f.severity === "CRITICAL" || f.severity === "HIGH")
        .map((f) => f.id);
      results.push({
        id: target.id,
        image: target.image,
        status: scanned.errors.length > 0 ? 1 : scanned.status,
        findings: findingIds,
      });
      if (scanned.errors.length > 0 || scanned.status !== 0) {
        console.error(
          `FAIL: trivy image scan id=${target.id} image=${target.image} exit=${scanned.status} findings=${findingIds.join(",") || "-"}`,
        );
      } else {
        console.log(`PASS: trivy image scan id=${target.id} image=${target.image}`);
      }
    }
  } finally {
    rmSync(tempDir, { recursive: true, force: true });
  }

  const failed = results.filter((r) => r.status !== 0);
  if (failed.length > 0) {
    console.error(
      `FAIL: ${failed.length}/${results.length} production image(s) have CRITICAL/HIGH findings (or scan error)`,
    );
    for (const f of failed) {
      console.error(
        `  - ${f.id} (${f.image}) exit=${f.status} findings=${f.findings.join(",") || "-"}`,
      );
    }
    process.exit(1);
  }

  console.log(
    `PASS: trivy found no unexcepted CRITICAL/HIGH findings across ${results.length} production image(s)`,
  );
  process.exit(0);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((err) => {
    console.error(`FAIL: ${err instanceof Error ? err.message : String(err)}`);
    process.exit(1);
  });
}
