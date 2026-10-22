/**
 * Content-identity comparison for Founder staging PostgreSQL init mounts.
 * Path-only inequality must never authorize container recreation.
 *
 * Fail-closed on symlink escape, untrusted mount roots, unreadable files,
 * extra/missing entries, or mode mismatches that affect executability.
 */
import { createHash } from "node:crypto";
import {
  lstatSync,
  readdirSync,
  readFileSync,
  realpathSync,
} from "node:fs";
import path from "node:path";

export const POSTGRES_INIT_DISPOSITION = Object.freeze({
  PRESERVE: "PRESERVE",
  BLOCK: "BLOCK",
  UNKNOWN: "UNKNOWN",
});

export const POSTGRES_INIT_REASON = Object.freeze({
  SAME_CONTENT_SAME_PATH: "POSTGRES_INIT_SAME_CONTENT_SAME_PATH",
  SAME_CONTENT_DIFFERENT_PATH: "POSTGRES_INIT_SAME_CONTENT_DIFFERENT_PATH",
  CONTENT_MISMATCH: "POSTGRES_INIT_CONTENT_MISMATCH",
  EXTRA_OR_MISSING_FILE: "POSTGRES_INIT_EXTRA_OR_MISSING_FILE",
  UNREADABLE: "POSTGRES_INIT_UNREADABLE",
  UNSAFE_SYMLINK: "POSTGRES_INIT_UNSAFE_SYMLINK",
  UNTRUSTED_MOUNT: "POSTGRES_INIT_UNTRUSTED_MOUNT",
  ABSENT_CONTAINER: "POSTGRES_INIT_ABSENT_CONTAINER",
  ABSENT_VOLUME: "POSTGRES_INIT_ABSENT_VOLUME",
  MALFORMED_MOUNT: "POSTGRES_INIT_MALFORMED_MOUNT",
  IMAGE_COMPAT_CONFLICT: "POSTGRES_INIT_IMAGE_COMPAT_CONFLICT",
  IMAGE_COMPAT_UNKNOWN: "POSTGRES_INIT_IMAGE_COMPAT_UNKNOWN",
  IDENTITY_CONFLICT: "POSTGRES_INIT_IDENTITY_CONFLICT",
  WRONG_COMPOSE_PROJECT: "POSTGRES_INIT_WRONG_COMPOSE_PROJECT",
  WRONG_PERSISTENT_VOLUME: "POSTGRES_INIT_WRONG_PERSISTENT_VOLUME",
  SOURCE_ISOLATION_UNRESOLVED: "POSTGRES_INIT_SOURCE_ISOLATION_UNRESOLVED",
});

/** Authoritative Founder staging Compose project for PostgreSQL init preservation. */
export const EXPECTED_STAGING_COMPOSE_PROJECT = "boba-staging";

/** Authoritative persistent volume name for Founder staging PostgreSQL. */
export const EXPECTED_STAGING_POSTGRES_VOLUME = "boba-staging_postgres-data";

/**
 * @typedef {{ relativePath: string, digest: string, executable: boolean }} InitFileIdentity
 * @typedef {{ ok: true, files: InitFileIdentity[], digest: string } | { ok: false, reasonCode: string, detail?: string }} InitManifest
 */

/**
 * @param {string} absoluteRoot
 * @param {{ readDir?: typeof readdirSync, lstat?: typeof lstatSync, readFile?: typeof readFileSync, realpath?: typeof realpathSync }} [io]
 * @returns {InitManifest}
 */
export function collectInitManifest(absoluteRoot, io = {}) {
  const readDir = io.readDir ?? readdirSync;
  const lstat = io.lstat ?? lstatSync;
  const readFile = io.readFile ?? readFileSync;
  const realpath = io.realpath ?? realpathSync;

  let rootReal;
  try {
    const rootStat = lstat(absoluteRoot);
    if (rootStat.isSymbolicLink()) {
      return { ok: false, reasonCode: POSTGRES_INIT_REASON.UNSAFE_SYMLINK, detail: "init root is a symlink" };
    }
    if (!rootStat.isDirectory()) {
      return { ok: false, reasonCode: POSTGRES_INIT_REASON.UNREADABLE, detail: "init root is not a directory" };
    }
    rootReal = realpath(absoluteRoot);
  } catch (error) {
    return {
      ok: false,
      reasonCode: POSTGRES_INIT_REASON.UNREADABLE,
      detail: error instanceof Error ? error.message : "unreadable init root",
    };
  }

  /** @type {InitFileIdentity[]} */
  const files = [];
  /** @type {string[]} */
  const stack = [""];

  while (stack.length > 0) {
    const relativeDir = stack.pop() ?? "";
    const absoluteDir = relativeDir ? path.join(absoluteRoot, relativeDir) : absoluteRoot;
    let entries;
    try {
      entries = readDir(absoluteDir, { withFileTypes: true });
    } catch (error) {
      return {
        ok: false,
        reasonCode: POSTGRES_INIT_REASON.UNREADABLE,
        detail: error instanceof Error ? error.message : "unreadable directory",
      };
    }

    for (const entry of entries) {
      const relativePath = relativeDir ? path.posix.join(relativeDir, entry.name) : entry.name;
      const absolutePath = path.join(absoluteDir, entry.name);
      let stat;
      try {
        stat = lstat(absolutePath);
      } catch (error) {
        return {
          ok: false,
          reasonCode: POSTGRES_INIT_REASON.UNREADABLE,
          detail: error instanceof Error ? error.message : `unreadable ${relativePath}`,
        };
      }

      if (stat.isSymbolicLink()) {
        try {
          const targetReal = realpath(absolutePath);
          const relativeToRoot = path.relative(rootReal, targetReal);
          if (
            relativeToRoot.startsWith("..") ||
            path.isAbsolute(relativeToRoot) ||
            relativeToRoot.includes(`..${path.sep}`)
          ) {
            return {
              ok: false,
              reasonCode: POSTGRES_INIT_REASON.UNSAFE_SYMLINK,
              detail: relativePath,
            };
          }
        } catch {
          return { ok: false, reasonCode: POSTGRES_INIT_REASON.UNSAFE_SYMLINK, detail: relativePath };
        }
        return {
          ok: false,
          reasonCode: POSTGRES_INIT_REASON.UNSAFE_SYMLINK,
          detail: `symlink not permitted in init assets: ${relativePath}`,
        };
      }

      if (stat.isDirectory()) {
        stack.push(relativePath);
        continue;
      }

      if (!stat.isFile()) {
        return {
          ok: false,
          reasonCode: POSTGRES_INIT_REASON.IDENTITY_CONFLICT,
          detail: `unsupported init entry type: ${relativePath}`,
        };
      }

      let bytes;
      try {
        bytes = readFile(absolutePath);
      } catch (error) {
        return {
          ok: false,
          reasonCode: POSTGRES_INIT_REASON.UNREADABLE,
          detail: error instanceof Error ? error.message : relativePath,
        };
      }

      const executable = (stat.mode & 0o111) !== 0;
      files.push({
        relativePath: relativePath.split(path.sep).join("/"),
        digest: createHash("sha256").update(bytes).digest("hex"),
        executable,
      });
    }
  }

  files.sort((a, b) => (a.relativePath < b.relativePath ? -1 : a.relativePath > b.relativePath ? 1 : 0));
  const rollup = createHash("sha256");
  for (const file of files) {
    rollup.update(file.relativePath);
    rollup.update("\0");
    rollup.update(file.digest);
    rollup.update("\0");
    rollup.update(file.executable ? "x" : "-");
    rollup.update("\n");
  }

  return { ok: true, files, digest: rollup.digest("hex") };
}

/**
 * Active init mounts must live under the owned staging runtime-assets tree
 * (or an explicitly verified repository-supported postgres init path).
 *
 * @param {string | null | undefined} mountSource
 * @param {{ runtimeAssetsRoot: string, repositoryInitRoot?: string, realpath?: typeof realpathSync }} roots
 */
export function isTrustedStagingInitMountPath(mountSource, roots) {
  if (typeof mountSource !== "string" || mountSource.trim().length === 0) return false;
  const realpath = roots.realpath ?? realpathSync;
  let resolved;
  try {
    resolved = realpath(mountSource);
  } catch {
    return false;
  }
  const runtimeRoot = path.resolve(roots.runtimeAssetsRoot);
  const underRuntime =
    resolved === runtimeRoot || resolved.startsWith(`${runtimeRoot}${path.sep}`);
  if (underRuntime) {
    const relative = path.relative(runtimeRoot, resolved);
    return relative.split(path.sep)[0] === "postgres-init" || relative.startsWith(`postgres-init${path.sep}`);
  }
  if (roots.repositoryInitRoot) {
    try {
      const repoInit = realpath(roots.repositoryInitRoot);
      return resolved === repoInit;
    } catch {
      return false;
    }
  }
  return false;
}

/**
 * @param {InitManifest} left
 * @param {InitManifest} right
 */
export function compareInitManifests(left, right) {
  if (!left.ok) return { equal: false, reasonCode: left.reasonCode, detail: left.detail };
  if (!right.ok) return { equal: false, reasonCode: right.reasonCode, detail: right.detail };
  if (left.files.length !== right.files.length) {
    return { equal: false, reasonCode: POSTGRES_INIT_REASON.EXTRA_OR_MISSING_FILE };
  }
  for (let i = 0; i < left.files.length; i += 1) {
    const a = left.files[i];
    const b = right.files[i];
    if (a.relativePath !== b.relativePath) {
      return { equal: false, reasonCode: POSTGRES_INIT_REASON.EXTRA_OR_MISSING_FILE, detail: `${a.relativePath} vs ${b.relativePath}` };
    }
    if (a.digest !== b.digest || a.executable !== b.executable) {
      return { equal: false, reasonCode: POSTGRES_INIT_REASON.CONTENT_MISMATCH, detail: a.relativePath };
    }
  }
  if (left.digest !== right.digest) {
    return { equal: false, reasonCode: POSTGRES_INIT_REASON.IDENTITY_CONFLICT };
  }
  return { equal: true, reasonCode: POSTGRES_INIT_REASON.SAME_CONTENT_SAME_PATH, digest: left.digest };
}

/**
 * Detect a staging postgres-init mount that appears owned by a different
 * checkout's `.env.staging/runtime-assets` tree (source-isolation decision).
 *
 * @param {string} mountSource
 * @param {{ runtimeAssetsRoot: string, realpath?: typeof realpathSync }} roots
 */
export function isForeignStagingRuntimeAssetsMount(mountSource, roots) {
  if (typeof mountSource !== "string" || mountSource.trim().length === 0) return false;
  const realpath = roots.realpath ?? realpathSync;
  let resolved;
  try {
    resolved = realpath(mountSource);
  } catch {
    return false;
  }
  const marker = `${path.sep}.env.staging${path.sep}runtime-assets${path.sep}postgres-init${path.sep}`;
  if (!resolved.includes(marker)) return false;
  try {
    const runtimeRoot = realpath(roots.runtimeAssetsRoot);
    const underOwned =
      resolved === runtimeRoot || resolved.startsWith(`${runtimeRoot}${path.sep}`);
    return !underOwned;
  } catch {
    // Owned mount root cannot be established safely.
    return true;
  }
}

/**
 * Resolve whether an existing PostgreSQL init mount may be preserved for a
 * candidate Git tree. Never authorizes automatic recreation on mismatch.
 *
 * Trust is limited to the owned staging runtime-assets tree (and optional
 * exact repository init path). Arbitrary absolute paths are never trusted.
 * Real PostgreSQL image upgrades remain a separate R3 action.
 *
 * @param {object} input
 * @param {InitManifest} input.candidateManifest
 * @param {{
 *   present: boolean,
 *   mountSource?: string | null,
 *   volumePresent?: boolean,
 *   persistentVolume?: string | null,
 *   project?: string | null,
 *   imageCompatConflict?: boolean | null,
 * }} input.activePostgres
 * @param {{ runtimeAssetsRoot: string, repositoryInitRoot?: string }} input.trustRoots
 * @param {(source: string, roots: object) => boolean} [input.trustPath]
 * @param {(root: string) => InitManifest} [input.collect]
 */
export function resolvePostgresInitDisposition(input) {
  const trustPath = input.trustPath ?? isTrustedStagingInitMountPath;
  const collect = input.collect ?? collectInitManifest;
  const active = input.activePostgres ?? { present: false };

  // Missing image-compatibility determination must never become compatibility PASS.
  if (active.imageCompatConflict == null) {
    return {
      disposition: POSTGRES_INIT_DISPOSITION.UNKNOWN,
      reasonCode: POSTGRES_INIT_REASON.IMAGE_COMPAT_UNKNOWN,
      preserveMountSource: null,
      composeInitDir: null,
      note: "PostgreSQL image compatibility must be positively determined; real image upgrades are a separate R3 action.",
    };
  }

  if (active.imageCompatConflict === true) {
    return {
      disposition: POSTGRES_INIT_DISPOSITION.BLOCK,
      reasonCode: POSTGRES_INIT_REASON.IMAGE_COMPAT_CONFLICT,
      preserveMountSource: null,
      composeInitDir: null,
    };
  }

  if (active.present !== true) {
    return {
      disposition: POSTGRES_INIT_DISPOSITION.BLOCK,
      reasonCode: POSTGRES_INIT_REASON.ABSENT_CONTAINER,
      preserveMountSource: null,
      composeInitDir: null,
      note: "Absent PostgreSQL requires a separately governed fresh-start or legacy recovery path.",
    };
  }

  if (active.project !== EXPECTED_STAGING_COMPOSE_PROJECT) {
    return {
      disposition: POSTGRES_INIT_DISPOSITION.BLOCK,
      reasonCode: POSTGRES_INIT_REASON.WRONG_COMPOSE_PROJECT,
      preserveMountSource: null,
      composeInitDir: null,
      detail: "verified Compose project must be boba-staging before PRESERVE",
    };
  }

  if (active.volumePresent === false) {
    return {
      disposition: POSTGRES_INIT_DISPOSITION.BLOCK,
      reasonCode: POSTGRES_INIT_REASON.ABSENT_VOLUME,
      preserveMountSource: null,
      composeInitDir: null,
    };
  }

  if (
    active.persistentVolume != null &&
    active.persistentVolume !== EXPECTED_STAGING_POSTGRES_VOLUME
  ) {
    return {
      disposition: POSTGRES_INIT_DISPOSITION.BLOCK,
      reasonCode: POSTGRES_INIT_REASON.WRONG_PERSISTENT_VOLUME,
      preserveMountSource: null,
      composeInitDir: null,
    };
  }

  if (active.volumePresent !== true) {
    return {
      disposition: POSTGRES_INIT_DISPOSITION.UNKNOWN,
      reasonCode: POSTGRES_INIT_REASON.ABSENT_VOLUME,
      preserveMountSource: null,
      composeInitDir: null,
      detail: "persistent volume presence must be explicitly known",
    };
  }

  const mountSource = active.mountSource;
  if (typeof mountSource !== "string" || mountSource.length === 0) {
    return {
      disposition: POSTGRES_INIT_DISPOSITION.BLOCK,
      reasonCode: POSTGRES_INIT_REASON.MALFORMED_MOUNT,
      preserveMountSource: null,
      composeInitDir: null,
    };
  }

  if (!input.trustRoots?.runtimeAssetsRoot) {
    return {
      disposition: POSTGRES_INIT_DISPOSITION.UNKNOWN,
      reasonCode: POSTGRES_INIT_REASON.SOURCE_ISOLATION_UNRESOLVED,
      preserveMountSource: null,
      composeInitDir: null,
      note: "Owned staging runtime-assets mount root could not be established; source-isolation decision required.",
    };
  }

  if (isForeignStagingRuntimeAssetsMount(mountSource, input.trustRoots)) {
    return {
      disposition: POSTGRES_INIT_DISPOSITION.UNKNOWN,
      reasonCode: POSTGRES_INIT_REASON.SOURCE_ISOLATION_UNRESOLVED,
      preserveMountSource: null,
      composeInitDir: null,
      note: "Active init mount is under a different checkout's staging runtime-assets; do not broaden trust to arbitrary absolute paths.",
    };
  }

  if (!trustPath(mountSource, input.trustRoots)) {
    return {
      disposition: POSTGRES_INIT_DISPOSITION.BLOCK,
      reasonCode: POSTGRES_INIT_REASON.UNTRUSTED_MOUNT,
      preserveMountSource: null,
      composeInitDir: null,
    };
  }

  if (!input.candidateManifest?.ok) {
    return {
      disposition: POSTGRES_INIT_DISPOSITION.BLOCK,
      reasonCode: input.candidateManifest?.reasonCode ?? POSTGRES_INIT_REASON.UNREADABLE,
      preserveMountSource: null,
      composeInitDir: null,
    };
  }

  const activeManifest = collect(mountSource);
  const comparison = compareInitManifests(input.candidateManifest, activeManifest);
  if (!comparison.equal) {
    return {
      disposition: POSTGRES_INIT_DISPOSITION.BLOCK,
      reasonCode: comparison.reasonCode,
      detail: comparison.detail,
      preserveMountSource: null,
      composeInitDir: null,
      note: "Init content mismatch requires explicit review; automatic PostgreSQL recreation is refused.",
    };
  }

  const samePath = path.resolve(mountSource) === path.resolve(input.candidateMaterializedPath ?? mountSource);
  return {
    disposition: POSTGRES_INIT_DISPOSITION.PRESERVE,
    reasonCode: samePath
      ? POSTGRES_INIT_REASON.SAME_CONTENT_SAME_PATH
      : POSTGRES_INIT_REASON.SAME_CONTENT_DIFFERENT_PATH,
    preserveMountSource: mountSource,
    composeInitDir: mountSource,
    contentDigest: comparison.digest,
  };
}
