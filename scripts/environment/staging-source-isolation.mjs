/**
 * Trusted observations for Founder staging source authority and isolated artifact context.
 *
 * The canonical checkout is the only source authority. It is not the deploy checkout.
 * `protectedCheckoutUsed` is computed from the realpath of a disposable git-archive
 * context. Callers cannot set that boolean.
 */
import { spawnSync } from "node:child_process";
import { lstatSync, mkdtempSync, readFileSync, readdirSync, realpathSync, rmSync } from "node:fs";
import os from "node:os";
import path from "node:path";

export const PROTECTED_PRIMARY_REPOSITORY = "/home/ajoshi/repos/boba-bear-platform";
export const EXPECTED_GITHUB_MAIN_URL = "https://github.com/nivedhya11/BobaBear.git";

function isFullGitSha(value) {
  return typeof value === "string" && /^[0-9a-f]{40}$/.test(value);
}

function runGit(args, options = {}) {
  const spawn = options.spawn ?? spawnSync;
  return spawn("git", args, {
    cwd: options.cwd,
    encoding: "utf8",
    timeout: options.timeout ?? 120_000,
    stdio: [options.input != null ? "pipe" : "ignore", "pipe", "pipe"],
    input: options.input,
  });
}

/**
 * @param {string} repositoryRoot
 * @param {(args: string[], options?: object) => { status: number | null, stdout?: string }} [spawn]
 */
export function readPinnedGithubMainSha(repositoryRoot, spawn = spawnSync) {
  const result = spawn(
    "git",
    ["-C", repositoryRoot, "ls-remote", EXPECTED_GITHUB_MAIN_URL, "refs/heads/main"],
    { encoding: "utf8", timeout: 20_000, stdio: ["ignore", "pipe", "pipe"] },
  );
  if (result.status !== 0) {
    return { ok: false, sha: null, detail: "github main probe failed" };
  }
  const line = String(result.stdout ?? "").trim().split("\n")[0] ?? "";
  const sha = line.split(/\s+/)[0] ?? "";
  if (!isFullGitSha(sha)) {
    return { ok: false, sha: null, detail: "github main probe returned no full sha" };
  }
  return { ok: true, sha, detail: "pinned github main" };
}

function listTree(repositoryRoot, sha, spawn) {
  const result = runGit(["-C", repositoryRoot, "ls-tree", "-r", sha], { spawn });
  if (result.status !== 0) return null;
  /** @type {Map<string, string>} */
  const blobs = new Map();
  for (const line of String(result.stdout ?? "").split("\n")) {
    if (line.length === 0) continue;
    const match = /^(\d{6}) (blob|commit) ([0-9a-f]{40})\t(.+)$/.exec(line);
    if (!match) return null;
    if (match[2] !== "blob") return null;
    blobs.set(match[4], match[3]);
  }
  return blobs;
}

function walkFiles(dir) {
  /** @type {string[]} */
  const files = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isSymbolicLink()) {
      files.push(full);
      continue;
    }
    if (entry.isDirectory()) {
      files.push(...walkFiles(full));
      continue;
    }
    files.push(full);
  }
  return files;
}

/**
 * `path.resolve` does not follow symlinks. Isolation is realpath-only.
 * A missing realpath fails closed as inside the protected checkout.
 */
function artifactRealpathInsideProtected(extractDir, protectedRoot) {
  try {
    const artifactReal = realpathSync(extractDir);
    const protectedReal = realpathSync(protectedRoot);
    return artifactReal === protectedReal || artifactReal.startsWith(`${protectedReal}${path.sep}`);
  } catch {
    return true;
  }
}

function failedObservation(repositoryRoot, detail) {
  return {
    ok: false,
    protectedCheckoutUsed: true,
    isolatedArtifactContextVerified: false,
    artifactContextInsideProtectedRoot: true,
    authoritativeSourceRoot: repositoryRoot,
    detail,
    inspection: null,
    extractDir: null,
  };
}

/**
 * Verify a disposable git archive. When `keep` is true the extracted tree is
 * left for a later authorized build and the caller must delete `extractDir`.
 * @param {Parameters<typeof observeIsolatedArtifactContext>[0] & { keep?: boolean }} input
 */
export function extractVerifiedGitArchive(input) {
  const observed = observeIsolatedArtifactContext({ ...input, keep: true });
  if (!observed.ok || typeof observed.extractDir !== "string") {
    if (observed.extractDir) rmSync(observed.extractDir, { recursive: true, force: true });
    return observed;
  }
  return observed;
}

/**
 * Extract `sha` into a disposable directory outside `protectedRoot`, verify the
 * tar commit id and every blob, then delete the directory before returning.
 * `protectedCheckoutUsed` is false only when the artifact realpath is outside
 * the canonical root.
 *
 * @param {{
 *   repositoryRoot: string,
 *   sha: string,
 *   expectedTree: string,
 *   protectedRoot?: string,
 *   spawn?: typeof spawnSync,
 *   inspect?: (extractDir: string) => unknown,
 *   tempParent?: string,
 *   keep?: boolean,
 * }} input
 */
export function observeIsolatedArtifactContext(input) {
  const protectedRoot = path.resolve(input.protectedRoot ?? PROTECTED_PRIMARY_REPOSITORY);
  const repositoryRoot = path.resolve(input.repositoryRoot);
  const spawn = input.spawn ?? spawnSync;
  const keep = input.keep === true;

  if (repositoryRoot !== protectedRoot) {
    return failedObservation(repositoryRoot, "repository root is not the canonical source authority");
  }
  if (!isFullGitSha(input.sha) || !isFullGitSha(input.expectedTree)) {
    return failedObservation(repositoryRoot, "candidate sha or tree is not a full git sha");
  }

  const tempParent = input.tempParent ?? os.tmpdir();
  const extractDir = mkdtempSync(path.join(tempParent, keep ? "boba-staging-build-" : "boba-staging-observe-"));
  const tarPath = path.join(tempParent, `boba-staging-archive-${path.basename(extractDir)}.tar`);
  let retain = false;
  try {
    const archived = runGit(["-C", repositoryRoot, "archive", "--format=tar", "-o", tarPath, input.sha], { spawn });
    if (archived.status !== 0) return failedObservation(repositoryRoot, "git archive failed");

    const tarBytes = readFileSync(tarPath);
    const commit = runGit(["get-tar-commit-id"], { spawn, input: tarBytes });
    const commitId = String(commit.stdout ?? "").trim();
    if (commit.status !== 0 || commitId !== input.sha) {
      return failedObservation(repositoryRoot, "archive commit id does not match the candidate sha");
    }

    const previousUmask = process.umask(0o022);
    let extracted;
    try {
      extracted = spawn("tar", ["-x", "-f", tarPath, "-C", extractDir], {
        encoding: "utf8",
        timeout: 120_000,
        stdio: ["ignore", "pipe", "pipe"],
      });
    } finally {
      process.umask(previousUmask);
    }
    if (extracted.status !== 0) return failedObservation(repositoryRoot, "archive extract failed");

    let leafIsSymlink = true;
    try {
      leafIsSymlink = lstatSync(extractDir).isSymbolicLink();
    } catch {
      leafIsSymlink = true;
    }
    if (leafIsSymlink || artifactRealpathInsideProtected(extractDir, protectedRoot)) {
      return {
        ...failedObservation(repositoryRoot, "artifact context is inside the protected source checkout"),
        artifactContextInsideProtectedRoot: true,
      };
    }
    if (readdirSync(extractDir).includes(".git")) {
      return failedObservation(repositoryRoot, "artifact context contains a git directory");
    }

    const tree = runGit(["-C", repositoryRoot, "rev-parse", `${input.sha}^{tree}`], { spawn });
    if (tree.status !== 0 || String(tree.stdout ?? "").trim() !== input.expectedTree) {
      return failedObservation(repositoryRoot, "extracted candidate tree does not match the expected tree");
    }

    const blobs = listTree(repositoryRoot, input.sha, spawn);
    if (!blobs) return failedObservation(repositoryRoot, "candidate tree listing failed");
    const files = walkFiles(extractDir);
    if (files.length !== blobs.size) return failedObservation(repositoryRoot, "extracted file count does not match the git tree");
    for (const file of files) {
      const relative = path.relative(extractDir, file);
      if (relative.startsWith("..") || path.isAbsolute(relative)) {
        return failedObservation(repositoryRoot, "extracted path escaped the artifact context");
      }
      const expectedHash = blobs.get(relative);
      if (!expectedHash) return failedObservation(repositoryRoot, "extracted file is not in the git tree");
      const hashed = runGit(["-C", repositoryRoot, "hash-object", file], { spawn });
      if (hashed.status !== 0 || String(hashed.stdout ?? "").trim() !== expectedHash) {
        return failedObservation(repositoryRoot, "extracted blob hash does not match the git tree");
      }
    }

    const inspection = typeof input.inspect === "function" ? input.inspect(extractDir) : null;
    retain = keep;
    return {
      ok: true,
      protectedCheckoutUsed: false,
      isolatedArtifactContextVerified: true,
      artifactContextInsideProtectedRoot: false,
      authoritativeSourceRoot: repositoryRoot,
      detail: "isolated git archive matched the candidate tree",
      inspection,
      extractDir: keep ? extractDir : null,
    };
  } finally {
    rmSync(tarPath, { force: true });
    if (!retain) rmSync(extractDir, { recursive: true, force: true });
  }
}
