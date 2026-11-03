/**
 * Bind staging candidate scans to the approved commit's scanner inputs.
 *
 * Working-tree bytes of the ignore file, exception register, and scanner
 * implementation must match that commit. The scan then applies the existing
 * per-image exception policy. A global unvalidated ignore file is never produced.
 * Unrelated dirty paths are not part of this set.
 */
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import os from "node:os";
import path from "node:path";

export const SCAN_POLICY_PATHS = Object.freeze([
  ".trivyignore",
  "docs/platform/security/vulnerability-exception-register.md",
  "scripts/run-trivy.mjs",
]);

/**
 * Candidate image tag → PRODUCTION_IMAGE_TARGETS id.
 * `null` means the image has no exception scope and must not inherit another service's ignores.
 */
export const CANDIDATE_IMAGE_EXCEPTION_SCOPE = Object.freeze({
  "boba-bear-app:local": "web-runtime",
  "boba-bear-customer-auth:local": "customer-auth-runtime",
  "boba-bear-workforce-auth:local": "workforce-auth-runtime",
  "boba-bear-customer-commerce:local": "customer-commerce-runtime",
  "boba-bear-operations:local": "operations-runtime",
  "boba-bear-tooling:local": null,
});

const NO_EXCEPTION_SCOPE = "__no_exception_scope__";
const SCANNER_MARKERS = Object.freeze([
  "--severity",
  "CRITICAL,HIGH",
  "--ignore-unfixed",
  "--image-config-scanners",
  "misconfig",
  "--exit-code",
  "--ignorefile",
]);

/**
 * @param {string} text
 * @returns {string}
 */
export function gitBlobSha1(text) {
  const body = Buffer.from(text);
  return createHash("sha1").update(`blob ${body.length}\0`).update(body).digest("hex");
}

function runGit(repositoryRoot, args) {
  return execFileSync("git", args, {
    cwd: repositoryRoot,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });
}

export function committedBlobReader(repositoryRoot) {
  return (sha, rel) => runGit(repositoryRoot, ["rev-parse", `${sha}:${rel}`]).trim();
}

export function worktreeBlobReader(repositoryRoot) {
  return (rel) => runGit(repositoryRoot, ["hash-object", "--", rel]).trim();
}

export function committedTextReader(repositoryRoot) {
  return (sha, rel) => runGit(repositoryRoot, ["show", `${sha}:${rel}`]);
}

/**
 * @param {string} scannerText
 * @param {{ TRIVY_VERSION?: string, TRIVY_SHA256?: string, trivyImageArgs?: (image: string, ignorefile: string, outputPath: string) => string[] }} trivy
 */
function assertScannerPin(scannerText, trivy) {
  const version = /export const TRIVY_VERSION = "([^"]+)"/.exec(scannerText);
  const digest = /export const TRIVY_SHA256 =\s*"([^"]+)"/.exec(scannerText);
  if (
    !version ||
    !digest ||
    version[1] !== trivy.TRIVY_VERSION ||
    digest[1] !== trivy.TRIVY_SHA256
  ) {
    return { ok: false, reason: "SCAN_POLICY_MODULE_DIVERGENCE" };
  }
  if (typeof trivy.trivyImageArgs !== "function") {
    return { ok: false, reason: "SCAN_POLICY_PIN_MISMATCH" };
  }
  const args = trivy.trivyImageArgs("image", "ignorefile", "report.json");
  for (const marker of SCANNER_MARKERS) {
    if (!args.includes(marker) || !scannerText.includes(marker)) {
      return { ok: false, reason: "SCAN_POLICY_PIN_MISMATCH" };
    }
  }
  if (args.some((arg) => typeof arg === "string" && /^(?:--skip|--bypass|--offline)/.test(arg))) {
    return { ok: false, reason: "SCAN_POLICY_PIN_MISMATCH" };
  }
  return { ok: true };
}

/**
 * @param {object} trivy
 * @param {Record<string, string>} texts
 * @param {string | undefined} todayIso
 */
function loadPolicyFromCommittedTexts(trivy, texts, todayIso) {
  const day = todayIso || trivy.utcTodayIso();
  const parsedRegister = trivy.parseTrivyExceptionRegister(
    texts["docs/platform/security/vulnerability-exception-register.md"],
  );
  const parsedIgnore = trivy.parseTrivyIgnoreFile(texts[".trivyignore"]);
  const enforced = trivy.enforceTrivyExceptionPolicy({
    ignoreEntries: parsedIgnore.entries,
    registerRows: parsedRegister.rows,
    todayIso: day,
  });
  return {
    todayIso: day,
    errors: [...parsedRegister.errors, ...parsedIgnore.errors, ...enforced.errors],
    activeByFinding: enforced.activeByFinding,
    ignoreEntries: parsedIgnore.entries,
  };
}

/**
 * @param {{
 *   sourceSha?: unknown,
 *   repositoryRoot?: unknown,
 *   images?: unknown,
 *   trivy?: object,
 *   todayIso?: string,
 *   tempParent?: string,
 *   readCommittedBlob?: (sha: string, rel: string) => string,
 *   readWorktreeBlob?: (rel: string) => string,
 *   readCommittedText?: (sha: string, rel: string) => string,
 * }} options
 */
export function openBoundCandidateScan(options) {
  const fail = (reason, extra = {}) => ({ ok: false, reason, ...extra });
  if (typeof options.sourceSha !== "string" || !/^[0-9a-f]{40}$/.test(options.sourceSha)) {
    return fail("SCAN_POLICY_SOURCE_UNBOUND");
  }
  if (typeof options.repositoryRoot !== "string" || options.repositoryRoot.length === 0) {
    return fail("SCAN_POLICY_SOURCE_UNBOUND");
  }
  if (!options.trivy) return fail("SCAN_POLICY_MODULE_UNBOUND");

  const readCommittedBlob = options.readCommittedBlob ?? committedBlobReader(options.repositoryRoot);
  const readWorktreeBlob = options.readWorktreeBlob ?? worktreeBlobReader(options.repositoryRoot);
  const readCommittedText = options.readCommittedText ?? committedTextReader(options.repositoryRoot);
  /** @type {Array<{ path: string, blob: string }>} */
  const inputs = [];
  /** @type {Record<string, string>} */
  const texts = {};

  for (const rel of SCAN_POLICY_PATHS) {
    let committedBlob;
    let worktreeBlob;
    let text;
    try {
      committedBlob = readCommittedBlob(options.sourceSha, rel);
      worktreeBlob = readWorktreeBlob(rel);
      text = readCommittedText(options.sourceSha, rel);
    } catch {
      return fail("SCAN_POLICY_INPUT_UNREADABLE", { path: rel });
    }
    if (typeof committedBlob !== "string" || typeof worktreeBlob !== "string" || typeof text !== "string") {
      return fail("SCAN_POLICY_INPUT_UNREADABLE", { path: rel });
    }
    const committedId = committedBlob.trim();
    const worktreeId = worktreeBlob.trim();
    if (!/^[0-9a-f]{40}$/.test(committedId) || committedId !== worktreeId) {
      return fail("SCAN_POLICY_INPUT_DIVERGENCE", { path: rel });
    }
    if (gitBlobSha1(text) !== committedId) {
      return fail("SCAN_POLICY_TEXT_MISMATCH", { path: rel });
    }
    inputs.push({ path: rel, blob: committedId });
    texts[rel] = text;
  }

  const pin = assertScannerPin(texts["scripts/run-trivy.mjs"], options.trivy);
  if (!pin.ok) return pin;

  let policy;
  try {
    policy = loadPolicyFromCommittedTexts(options.trivy, texts, options.todayIso);
  } catch (error) {
    return fail("EXCEPTION_POLICY_REJECTED", {
      detail: error instanceof Error ? error.message : "policy load failed",
    });
  }
  if (policy.errors.length > 0) {
    return fail("EXCEPTION_POLICY_REJECTED", { errors: policy.errors });
  }

  if (!Array.isArray(options.images) || options.images.length === 0) {
    return fail("SCAN_IMAGE_SCOPE_UNMAPPED");
  }
  const knownScopes = new Set(
    (options.trivy.PRODUCTION_IMAGE_TARGETS ?? []).map((target) => target.id),
  );
  for (const image of options.images) {
    const name = image && typeof image === "object" ? image.name : null;
    if (typeof name !== "string" || !Object.prototype.hasOwnProperty.call(CANDIDATE_IMAGE_EXCEPTION_SCOPE, name)) {
      return fail("SCAN_IMAGE_SCOPE_UNMAPPED", { path: typeof name === "string" ? name : null });
    }
    const scope = CANDIDATE_IMAGE_EXCEPTION_SCOPE[name];
    if (scope !== null && !knownScopes.has(scope)) {
      return fail("SCAN_IMAGE_SCOPE_UNMAPPED", { path: name });
    }
  }

  const tempDir = mkdtempSync(path.join(options.tempParent ?? os.tmpdir(), "boba-scan-policy-"));
  /** @type {Map<string, { scope: string | null, ignorefile: string }>} */
  const ignores = new Map();
  try {
    for (const image of options.images) {
      const scope = CANDIDATE_IMAGE_EXCEPTION_SCOPE[image.name];
      const ignorefile = options.trivy.materializeIgnorefileForImage({
        imageId: scope ?? NO_EXCEPTION_SCOPE,
        activeByFinding: policy.activeByFinding,
        ignoreEntries: policy.ignoreEntries,
        dir: tempDir,
      });
      if (path.basename(ignorefile) === ".trivyignore") {
        throw new Error("GLOBAL_IGNOREFILE_REFUSED");
      }
      const findingLines = readFileSync(ignorefile, "utf8")
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter((line) => line.length > 0 && !line.startsWith("#"));
      if (scope === null && findingLines.length > 0) {
        return finishFailure(tempDir, "SCAN_EXCEPTION_SCOPE_LEAK", image.name);
      }
      for (const finding of findingLines) {
        const row = policy.activeByFinding.get(finding);
        if (!row || row.image !== scope) {
          return finishFailure(tempDir, "SCAN_EXCEPTION_SCOPE_LEAK", image.name);
        }
      }
      ignores.set(image.name, { scope, ignorefile });
    }
  } catch (error) {
    rmSync(tempDir, { recursive: true, force: true });
    return fail("EXCEPTION_POLICY_REJECTED", {
      detail: error instanceof Error ? error.message : "ignore materialization failed",
    });
  }

  return {
    ok: true,
    tempDir,
    ignores,
    policy: {
      sourceSha: options.sourceSha,
      inputs,
      scannerVersion: options.trivy.TRIVY_VERSION,
      scannerSha256: options.trivy.TRIVY_SHA256,
      todayIso: policy.todayIso,
    },
  };
}

function finishFailure(tempDir, reason, imageName) {
  rmSync(tempDir, { recursive: true, force: true });
  return { ok: false, reason, path: imageName };
}

/**
 * @param {{ tempDir?: string } | null | undefined} opened
 */
export function closeBoundCandidateScan(opened) {
  if (opened && typeof opened.tempDir === "string" && opened.tempDir.length > 0) {
    rmSync(opened.tempDir, { recursive: true, force: true });
  }
}
