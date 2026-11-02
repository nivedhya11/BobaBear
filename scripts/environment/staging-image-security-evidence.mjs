/**
 * Candidate image-security evidence.
 *
 * Activation may trust this record only when it is bound to the candidate SHA
 * and tree and to a fresh inspect of the image id and digest. A missing file,
 * a path inside the protected checkout, or a digest mismatch fails closed.
 * This module does not build images, start containers, or authorize deployment.
 */
import { existsSync, lstatSync, readFileSync, realpathSync, writeFileSync } from "node:fs";
import path from "node:path";

export const IMAGE_SECURITY_EVIDENCE_SCHEMA = "staging-image-security-v1";

/** Local tags produced for the staging candidate. Not a registry or hostname choice. */
export const STAGING_CANDIDATE_IMAGE_NAMES = Object.freeze([
  "boba-bear-app:local",
  "boba-bear-customer-auth:local",
  "boba-bear-workforce-auth:local",
  "boba-bear-customer-commerce:local",
  "boba-bear-operations:local",
  "boba-bear-tooling:local",
]);

const SHA256_DIGEST = /^sha256:[0-9a-f]{64}$/;
const REPORT_SHA256 = /^[0-9a-f]{64}$/;

export function isSha256Digest(value) {
  return typeof value === "string" && SHA256_DIGEST.test(value);
}

export function absentImageSecurityEvidence() {
  return {
    imageSecurityEvidenceRequired: true,
    imageSecurityEvidencePresent: false,
    issue409RiskWaived: false,
    sourceImageCorrelated: false,
    boundSourceSha: null,
    boundSourceTree: null,
    boundImages: [],
    observedImages: [],
    scanPassed: false,
    evidenceSchema: null,
  };
}

/**
 * Deterministic synthetic identities for tests. Not a scanned candidate.
 * @returns {{ name: string, imageId: string, digest: string }[]}
 */
export function syntheticBoundImages() {
  return STAGING_CANDIDATE_IMAGE_NAMES.map((name, index) => ({
    name,
    imageId: `sha256:${index.toString(16).padStart(64, "d")}`,
    digest: `sha256:${index.toString(16).padStart(64, "c")}`,
  }));
}

/**
 * @param {unknown} images
 * @returns {{ name: string, imageId: string, digest: string }[] | null}
 */
export function normalizeCandidateImages(images) {
  if (!Array.isArray(images)) return null;
  /** @type {{ name: string, imageId: string, digest: string }[]} */
  const normalized = [];
  for (const image of images) {
    if (!image || typeof image !== "object") return null;
    const record = /** @type {{ name?: unknown, imageId?: unknown, digest?: unknown }} */ (image);
    if (typeof record.name !== "string" || !STAGING_CANDIDATE_IMAGE_NAMES.includes(record.name)) return null;
    if (!isSha256Digest(record.imageId) || !isSha256Digest(record.digest)) return null;
    normalized.push({ name: record.name, imageId: record.imageId, digest: record.digest });
  }
  const names = normalized.map((image) => image.name).sort();
  const expected = [...STAGING_CANDIDATE_IMAGE_NAMES].sort();
  if (names.length !== expected.length || names.some((name, index) => name !== expected[index])) return null;
  normalized.sort((left, right) => left.name.localeCompare(right.name));
  return normalized;
}

/**
 * @param {unknown} left
 * @param {unknown} right
 */
export function sameBoundImages(left, right) {
  const a = normalizeCandidateImages(left);
  const b = normalizeCandidateImages(right);
  if (!a || !b) return false;
  return a.every(
    (image, index) =>
      image.name === b[index].name && image.imageId === b[index].imageId && image.digest === b[index].digest,
  );
}

/**
 * Evidence must live outside the protected checkout. A missing parent or a
 * path that resolves inside the repository is not trusted.
 * @param {unknown} evidenceFile
 * @param {unknown} repositoryRoot
 */
export function isEvidencePathOutsideCheckout(evidenceFile, repositoryRoot) {
  if (typeof evidenceFile !== "string" || evidenceFile.length === 0) return false;
  if (typeof repositoryRoot !== "string" || repositoryRoot.length === 0) return false;
  if (!path.isAbsolute(evidenceFile) || !path.isAbsolute(repositoryRoot)) return false;
  const parent = path.dirname(evidenceFile);
  if (!existsSync(parent)) return false;
  try {
    const parentReal = realpathSync(parent);
    const rootReal = realpathSync(repositoryRoot);
    const full = path.resolve(parentReal, path.basename(evidenceFile));
    return full !== rootReal && !full.startsWith(`${rootReal}${path.sep}`);
  } catch {
    return false;
  }
}

/**
 * @param {unknown} evidenceFile
 * @param {unknown} repositoryRoot
 * @returns {string | null}
 */
export function evidencePathRefusal(evidenceFile, repositoryRoot) {
  if (!isEvidencePathOutsideCheckout(evidenceFile, repositoryRoot)) return "IMAGE_SECURITY_EVIDENCE_PATH_UNBOUND";
  if (typeof evidenceFile === "string" && existsSync(evidenceFile)) {
    const stat = lstatSync(evidenceFile);
    if (stat.isSymbolicLink() || !stat.isFile()) return "IMAGE_SECURITY_EVIDENCE_PATH_UNBOUND";
  }
  return null;
}

/**
 * @param {string} evidenceFile
 * @param {unknown} record
 */
export function writeImageSecurityEvidence(evidenceFile, record) {
  writeFileSync(evidenceFile, `${JSON.stringify(record)}\n`, { encoding: "utf8", mode: 0o600 });
}

/**
 * Read-only. Does not build, tag, or delete images.
 * Without an outside-checkout file, returns absent evidence and does not inspect.
 * @param {{
 *   evidenceFile?: unknown,
 *   sourceSha?: unknown,
 *   sourceTree?: unknown,
 *   repositoryRoot?: unknown,
 *   inspectImage?: (name: string) => { imageId?: string, digest?: string } | null,
 *   readFile?: typeof readFileSync,
 * }} input
 */
export function readOperatorImageSecurityEvidence(input = {}) {
  const absent = absentImageSecurityEvidence();
  if (!isEvidencePathOutsideCheckout(input.evidenceFile, input.repositoryRoot)) return absent;
  const readFile = input.readFile ?? readFileSync;
  let record;
  try {
    record = JSON.parse(readFile(/** @type {string} */ (input.evidenceFile), "utf8"));
  } catch {
    return absent;
  }
  if (!record || typeof record !== "object" || record.schema !== IMAGE_SECURITY_EVIDENCE_SCHEMA) return absent;
  if (record.sourceSha !== input.sourceSha || record.sourceTree !== input.sourceTree) return absent;
  const boundImages = normalizeCandidateImages(record.images);
  if (!boundImages || record.scanPassed !== true || !REPORT_SHA256.test(record.scanReportSha256 ?? "")) return absent;
  if (typeof input.inspectImage !== "function") return absent;
  /** @type {{ name: string, imageId: unknown, digest: unknown }[]} */
  const observed = [];
  for (const image of boundImages) {
    let live;
    try {
      live = input.inspectImage(image.name);
    } catch {
      return absent;
    }
    observed.push({ name: image.name, imageId: live?.imageId, digest: live?.digest });
  }
  const observedImages = normalizeCandidateImages(observed);
  return {
    imageSecurityEvidenceRequired: true,
    imageSecurityEvidencePresent: true,
    issue409RiskWaived: false,
    sourceImageCorrelated: observedImages != null && sameBoundImages(boundImages, observedImages),
    boundSourceSha: input.sourceSha,
    boundSourceTree: input.sourceTree,
    boundImages,
    observedImages: observedImages ?? [],
    scanPassed: true,
    evidenceSchema: IMAGE_SECURITY_EVIDENCE_SCHEMA,
  };
}
