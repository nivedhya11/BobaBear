/**
 * Candidate PostgreSQL image compatibility for Founder staging.
 *
 * Inspects the Compose candidate image (`boba-bear-postgres:local`), not an
 * unrelated upstream tag alone. Existing-database major evidence is compared
 * when positively readable. Insufficient evidence stays UNKNOWN (null).
 */
import { EXPECTED_STAGING_POSTGRES_MAJOR } from "./postgres-init-identity.mjs";

export const STAGING_POSTGRES_CANDIDATE_IMAGE = "boba-bear-postgres:local";
export const STAGING_POSTGRES_UPSTREAM_BASE_IMAGE = "docker.io/library/postgres:18.4-trixie";

/**
 * @param {string | null | undefined} text
 * @returns {number | null}
 */
export function parsePostgresMajor(text) {
  if (typeof text !== "string" || !text.trim()) return null;
  const trimmed = text.trim();
  if (/^\d{1,2}$/.test(trimmed)) {
    const major = Number(trimmed);
    return Number.isInteger(major) && major > 0 ? major : null;
  }
  const fromTag =
    trimmed.match(/(?:^|[/:@])postgres:(\d+)(?:[.\-]|$)/i) ??
    trimmed.match(/(?:^|[/:])(\d+)(?:\.\d+)*-/);
  if (!fromTag) return null;
  const major = Number(fromTag[1]);
  return Number.isInteger(major) && major > 0 ? major : null;
}

/**
 * @param {Record<string, unknown>} entry
 * @returns {{ imageId: string | null, repoTags: string[], major: number | null, detail?: string }}
 */
export function extractPostgresImageFacts(entry) {
  if (!entry || typeof entry !== "object") {
    return { imageId: null, repoTags: [], major: null, detail: "image inspect entry missing" };
  }
  const imageId = typeof entry.Id === "string" && entry.Id.trim() ? entry.Id.trim() : null;
  const repoTags = Array.isArray(entry.RepoTags)
    ? entry.RepoTags.filter((tag) => typeof tag === "string" && tag.trim()).map((tag) => tag.trim())
    : [];
  const env = Array.isArray(entry?.Config?.Env) ? entry.Config.Env : [];
  let major = null;
  for (const item of env) {
    if (typeof item !== "string") continue;
    const match = item.match(/^PG_MAJOR=(.+)$/);
    if (match) {
      major = parsePostgresMajor(match[1]);
      if (major != null) break;
    }
  }
  if (major == null) {
    for (const tag of repoTags) {
      major = parsePostgresMajor(tag);
      if (major != null) break;
    }
  }
  if (major == null && typeof entry?.Config?.Labels === "object" && entry.Config.Labels) {
    const labels = /** @type {Record<string, unknown>} */ (entry.Config.Labels);
    for (const key of ["org.opencontainers.image.version", "version", "postgres.version"]) {
      major = parsePostgresMajor(typeof labels[key] === "string" ? labels[key] : null);
      if (major != null) break;
    }
  }
  return { imageId, repoTags, major };
}

/**
 * @param {{
 *   run?: (command: string, args: string[], options?: object) => string,
 *   candidateImage?: string,
 *   expectedMajor?: number,
 *   existingDatabaseMajor?: number | null,
 *   readExistingDatabaseMajor?: () => number | null,
 * }} [input]
 * @returns {{
 *   imageCompatConflict: boolean | null,
 *   imageId: string | null,
 *   imageRef: string,
 *   major: number | null,
 *   existingMajor: number | null,
 *   detail?: string,
 * }}
 */
export function probeCandidatePostgresImageCompat(input = {}) {
  const run = input.run;
  const candidateImage = input.candidateImage ?? STAGING_POSTGRES_CANDIDATE_IMAGE;
  const expectedMajor = input.expectedMajor ?? EXPECTED_STAGING_POSTGRES_MAJOR;
  const readExisting =
    typeof input.readExistingDatabaseMajor === "function"
      ? input.readExistingDatabaseMajor
      : () => (input.existingDatabaseMajor === undefined ? null : input.existingDatabaseMajor);

  if (typeof run !== "function") {
    return {
      imageCompatConflict: null,
      imageId: null,
      imageRef: candidateImage,
      major: null,
      existingMajor: null,
      detail: "postgres image inspect runner unavailable",
    };
  }

  let raw;
  try {
    raw = run("podman", ["image", "inspect", candidateImage], { encoding: "utf8" });
  } catch (error) {
    return {
      imageCompatConflict: null,
      imageId: null,
      imageRef: candidateImage,
      major: null,
      existingMajor: null,
      detail: error instanceof Error ? error.message : "candidate postgres image inspect failed",
    };
  }

  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return {
      imageCompatConflict: null,
      imageId: null,
      imageRef: candidateImage,
      major: null,
      existingMajor: null,
      detail: "candidate postgres image inspect JSON unreadable",
    };
  }

  const entry = Array.isArray(parsed) ? parsed[0] : parsed;
  const facts = extractPostgresImageFacts(entry);
  if (!facts.imageId) {
    return {
      imageCompatConflict: null,
      imageId: null,
      imageRef: candidateImage,
      major: facts.major,
      existingMajor: null,
      detail: "postgres image id missing",
    };
  }

  const taggedAsCandidate =
    facts.repoTags.includes(candidateImage) ||
    facts.repoTags.includes(`localhost/${candidateImage}`);
  // Empty RepoTags stay UNKNOWN rather than inventing identity. Non-empty tags
  // that do not name the Compose candidate are an unexpected image identity.
  if (facts.repoTags.length === 0) {
    return {
      imageCompatConflict: null,
      imageId: facts.imageId,
      imageRef: candidateImage,
      major: facts.major,
      existingMajor: null,
      detail: "candidate postgres image tags unreadable",
    };
  }
  if (!taggedAsCandidate) {
    return {
      imageCompatConflict: true,
      imageId: facts.imageId,
      imageRef: candidateImage,
      major: facts.major,
      existingMajor: null,
      detail: `unexpected postgres image identity tags: ${facts.repoTags.join(",")}`,
    };
  }

  if (facts.major == null) {
    return {
      imageCompatConflict: null,
      imageId: facts.imageId,
      imageRef: candidateImage,
      major: null,
      existingMajor: null,
      detail: "candidate postgres major unreadable from image inspect",
    };
  }

  let existingMajor = null;
  try {
    existingMajor = readExisting();
  } catch (error) {
    return {
      imageCompatConflict: null,
      imageId: facts.imageId,
      imageRef: candidateImage,
      major: facts.major,
      existingMajor: null,
      detail: error instanceof Error ? error.message : "existing database version evidence unreadable",
    };
  }

  if (existingMajor === undefined) existingMajor = null;
  if (existingMajor != null && (!Number.isInteger(existingMajor) || existingMajor <= 0)) {
    return {
      imageCompatConflict: null,
      imageId: facts.imageId,
      imageRef: candidateImage,
      major: facts.major,
      existingMajor: null,
      detail: "existing database version evidence unreadable",
    };
  }

  if (facts.major !== expectedMajor) {
    return {
      imageCompatConflict: true,
      imageId: facts.imageId,
      imageRef: candidateImage,
      major: facts.major,
      existingMajor,
      detail: `candidate postgres major ${facts.major} incompatible with expected ${expectedMajor}`,
    };
  }

  if (existingMajor != null && existingMajor !== facts.major) {
    return {
      imageCompatConflict: true,
      imageId: facts.imageId,
      imageRef: candidateImage,
      major: facts.major,
      existingMajor,
      detail: `existing database major ${existingMajor} incompatible with candidate ${facts.major}`,
    };
  }

  // Existing major unknown is acceptable for NEVER_INITIALIZED / absent DB.
  // When a caller explicitly requested existing evidence and got null while
  // asserting presence, they should pass a failing reader instead.
  return {
    imageCompatConflict: false,
    imageId: facts.imageId,
    imageRef: candidateImage,
    major: facts.major,
    existingMajor,
  };
}

/**
 * Read PG_VERSION from a mounted/inspected volume content string.
 * @param {string | null | undefined} pgVersionText
 * @returns {number | null}
 */
export function parsePgVersionFile(pgVersionText) {
  return parsePostgresMajor(pgVersionText);
}
