/**
 * Read-only probes producing S1..S8 binder observations.
 *
 * Every probe is injectable (git / fs / spawn / API fetchers) and never:
 *   - starts, stops, builds, or recreates containers, images, networks, or volumes
 *   - writes env files, runtime assets, or repository files
 *   - connects to a database or starts a payment/diagnostic path
 *   - disables or modifies any GitHub workflow or Pages configuration
 *
 * Probes that cannot observe safely return `null` / partial observations;
 * the binders turn that into UNKNOWN. They never fabricate PASS facts.
 */
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync, statfsSync } from "node:fs";
import path from "node:path";

import { hashMigrationFile } from "../database/lib/migration-integrity.mjs";
import { readJournal, validateJournalShape } from "../database/lib/migration-history.mjs";
import { POSTGRES_INIT_REASON } from "./postgres-init-identity.mjs";
import { EVIDENCE_PROVENANCE, PROTECTED_CHECKOUT_PATHS } from "./staging-evidence-binders.mjs";

/** Build a LIVE_PROBE provenance stamp. */
export function liveProvenance(probe, sources = [], now = new Date()) {
  return { kind: EVIDENCE_PROVENANCE.LIVE_PROBE, observedAt: now.toISOString(), probe, sources };
}

/** Build a RECORDED_ARTIFACT provenance stamp (observedAt must come from the artifact itself). */
export function recordedProvenance(probe, observedAt, sources = []) {
  return { kind: EVIDENCE_PROVENANCE.RECORDED_ARTIFACT, observedAt, probe, sources };
}

function defaultGit(repositoryRoot) {
  return (args, options = {}) =>
    execFileSync("git", args, {
      cwd: repositoryRoot,
      encoding: options.buffer ? undefined : "utf8",
      stdio: ["ignore", "pipe", "pipe"],
      maxBuffer: 64 * 1024 * 1024,
    });
}

/* ----------------------------------------------------------------------- */
/* S1 Source                                                                */
/* ----------------------------------------------------------------------- */

/**
 * @param {{
 *   repositoryRoot: string,
 *   git?: (args: string[]) => string,
 *   remoteMain?: { sha: string | null, fullName: string | null } | null,
 *   protectedPaths?: readonly string[],
 *   now?: Date,
 * }} options
 */
export function probeSourceObservation(options) {
  const now = options.now ?? new Date();
  const git = options.git ?? defaultGit(options.repositoryRoot);
  const run = (args) => {
    try {
      return String(git(args)).trim();
    } catch {
      return null;
    }
  };
  const head = run(["rev-parse", "HEAD"]);
  const originMain = run(["rev-parse", "origin/main"]);
  return {
    provenance: liveProvenance("git", ["git rev-parse", "git status --porcelain --untracked-files=no", "git remote get-url origin"], now),
    remoteUrl: run(["remote", "get-url", "origin"]),
    remoteRepositoryIdentity: options.remoteMain?.fullName ?? null,
    remoteMainSha: options.remoteMain?.sha ?? null,
    branch: run(["branch", "--show-current"]),
    head,
    originMain,
    headTree: head ? run(["rev-parse", `${head}^{tree}`]) : null,
    originMainTree: originMain ? run(["rev-parse", `${originMain}^{tree}`]) : null,
    trackedDirty: run(["status", "--porcelain", "--untracked-files=no"]) ?? undefined,
    checkoutPath: path.resolve(options.repositoryRoot),
    protectedPaths: options.protectedPaths ?? PROTECTED_CHECKOUT_PATHS,
  };
}

/**
 * Read-only GitHub observation of the default-branch head via `gh api`.
 * `repository` should be the LOCAL remote's owner/repo so that a renamed
 * repository redirect is observed as `full_name` rather than assumed.
 * Returns null on any failure (binder reports UNVERIFIED).
 * @param {{ repository?: string, spawn?: (cmd: string, args: string[]) => string }} [options]
 */
export function fetchRemoteMainObservation(options = {}) {
  const repository = options.repository ?? "nivedhya11/BobaBear";
  const spawn =
    options.spawn ??
    ((cmd, args) => execFileSync(cmd, args, { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }));
  try {
    const repo = JSON.parse(spawn("gh", ["api", `repos/${repository}`]));
    const branch = JSON.parse(spawn("gh", ["api", `repos/${repository}/branches/main`]));
    const sha = branch?.commit?.sha;
    return {
      sha: typeof sha === "string" && /^[0-9a-f]{40}$/.test(sha) ? sha : null,
      fullName: typeof repo?.full_name === "string" ? repo.full_name : null,
    };
  } catch {
    return null;
  }
}

/* ----------------------------------------------------------------------- */
/* S2 Publishing                                                            */
/* ----------------------------------------------------------------------- */

const PUBLISHING_ACTION_PATTERN =
  /(peaceiris\/actions-gh-pages|actions\/deploy-pages|actions\/upload-pages-artifact|JamesIves\/github-pages-deploy-action|gh-pages)/i;

/**
 * Minimal, dependency-free workflow classifier. It only extracts facts the
 * S2 binder needs: push-trigger branches, publishing actions, write permissions.
 * It never evaluates expressions or runs anything.
 *
 * @param {string} workflowPath
 * @param {string} text
 */
export function parsePublishingWorkflow(workflowPath, text) {
  const lines = String(text).split(/\r?\n/);
  const nameMatch = text.match(/^name:\s*(.+)$/m);
  const triggers = [];
  const publishingSteps = [];
  const permissions = {};

  // Locate top-level `on:` block and parse push branches.
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (/^on:\s*$/.test(line) || /^on:\s*\[/.test(line) || /^on:\s*\w/.test(line)) {
      const inline = line.match(/^on:\s*\[(.*)\]\s*$/);
      if (inline) {
        for (const ev of inline[1].split(",").map((s) => s.trim()).filter(Boolean)) triggers.push({ event: ev, branches: [] });
        i += 1;
        continue;
      }
      const single = line.match(/^on:\s*([a-z_]+)\s*$/);
      if (single) {
        triggers.push({ event: single[1], branches: [] });
        i += 1;
        continue;
      }
      i += 1;
      while (i < lines.length && (/^\s+\S/.test(lines[i]) || lines[i].trim() === "")) {
        const eventMatch = lines[i].match(/^\s{2}([a-z_]+):\s*(.*)$/);
        if (eventMatch) {
          const event = eventMatch[1];
          const branches = [];
          const inlineBranches = eventMatch[2].match(/branches:\s*\[(.*)\]/);
          if (inlineBranches) branches.push(...inlineBranches[1].split(",").map((s) => s.trim().replace(/^['"]|['"]$/g, "")).filter(Boolean));
          i += 1;
          while (i < lines.length && /^\s{4,}\S/.test(lines[i])) {
            const bInline = lines[i].match(/^\s+branches:\s*\[(.*)\]\s*$/);
            if (bInline) {
              branches.push(...bInline[1].split(",").map((s) => s.trim().replace(/^['"]|['"]$/g, "")).filter(Boolean));
              i += 1;
              continue;
            }
            if (/^\s+branches:\s*$/.test(lines[i])) {
              i += 1;
              while (i < lines.length && /^\s+-\s+\S/.test(lines[i])) {
                branches.push(lines[i].replace(/^\s+-\s+/, "").trim().replace(/^['"]|['"]$/g, ""));
                i += 1;
              }
              continue;
            }
            i += 1;
          }
          triggers.push({ event, branches });
          continue;
        }
        i += 1;
      }
      continue;
    }
    i += 1;
  }

  for (const line of lines) {
    const uses = line.match(/^\s*-?\s*uses:\s*(\S+)/);
    if (uses && PUBLISHING_ACTION_PATTERN.test(uses[1])) {
      publishingSteps.push({ uses: uses[1], kind: "GH_PAGES_PUBLISH" });
    }
    const perm = line.match(/^\s+(contents|pages|id-token):\s*(read|write|none)\s*$/);
    if (perm) permissions[perm[1]] = perm[2];
  }

  return {
    path: workflowPath,
    name: nameMatch ? nameMatch[1].trim() : null,
    triggers,
    publishingSteps,
    permissions,
    apiState: null,
  };
}

/**
 * @param {{
 *   repositoryRoot: string,
 *   workflowsDir?: string,
 *   readDir?: typeof readdirSync,
 *   readFile?: typeof readFileSync,
 *   workflowApiStates?: Map<string, string> | null,
 *   pagesHosting?: object | null,
 *   policyLock?: { locked: boolean, authority?: string | null } | null,
 *   now?: Date,
 * }} options
 */
export function probePublishingObservation(options) {
  const now = options.now ?? new Date();
  const dir = options.workflowsDir ?? path.join(options.repositoryRoot, ".github", "workflows");
  const readDir = options.readDir ?? readdirSync;
  const readFile = options.readFile ?? readFileSync;
  let files = [];
  try {
    files = readDir(dir).filter((f) => /\.ya?ml$/.test(f)).sort();
  } catch {
    files = [];
  }
  const workflows = [];
  for (const file of files) {
    const full = path.join(dir, file);
    let text;
    try {
      text = readFile(full, "utf8");
    } catch {
      continue;
    }
    const parsed = parsePublishingWorkflow(path.posix.join(".github/workflows", file), text);
    const apiState = options.workflowApiStates?.get(file) ?? options.workflowApiStates?.get(parsed.path) ?? null;
    workflows.push({ ...parsed, apiState });
  }
  return {
    provenance: liveProvenance("workflow-files", [".github/workflows/*", options.workflowApiStates ? "gh api actions/workflows" : "workflow API state NOT observed"], now),
    workflows,
    pagesHosting: options.pagesHosting ?? null,
    // S2 policy is not Founder-locked. This probe never asserts a lock.
    policyLock: options.policyLock ?? { locked: false, authority: null },
    operation: { kind: "STAGING_DEPLOY_LOCAL_PODMAN", pushesToBranches: [] },
  };
}

/**
 * Read-only GitHub observation of workflow states and Pages configuration.
 * Returns nulls on failure. Never enables/disables anything.
 * @param {{ repository?: string, spawn?: (cmd: string, args: string[]) => string }} [options]
 */
export function fetchPublishingApiObservation(options = {}) {
  const repository = options.repository ?? "nivedhya11/BobaBear";
  const spawn =
    options.spawn ??
    ((cmd, args) => execFileSync(cmd, args, { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }));
  /** @type {Map<string, string> | null} */
  let workflowApiStates = null;
  let pagesHosting = null;
  try {
    const data = JSON.parse(spawn("gh", ["api", `repos/${repository}/actions/workflows`]));
    workflowApiStates = new Map();
    for (const wf of data?.workflows ?? []) {
      if (typeof wf?.path === "string" && typeof wf?.state === "string") {
        workflowApiStates.set(wf.path, wf.state);
        workflowApiStates.set(path.posix.basename(wf.path), wf.state);
      }
    }
  } catch {
    workflowApiStates = null;
  }
  try {
    const pages = JSON.parse(spawn("gh", ["api", `repos/${repository}/pages`]));
    pagesHosting = {
      sourceBranch: pages?.source?.branch ?? null,
      sourcePath: pages?.source?.path ?? null,
      cname: pages?.cname ?? null,
      httpsEnforced: typeof pages?.https_enforced === "boolean" ? pages.https_enforced : null,
    };
  } catch {
    pagesHosting = null;
  }
  return { workflowApiStates, pagesHosting };
}

/* ----------------------------------------------------------------------- */
/* S3 Configuration                                                         */
/* ----------------------------------------------------------------------- */

export const CONFIG_PROJECTION_SCHEMA = "staging-config-projection-v1";

/**
 * Run the TypeScript projection adapter (real `validateSource`) as a child
 * process and parse its secret-safe JSON. Returns null projections on failure.
 *
 * @param {{
 *   repositoryRoot: string,
 *   stagingEnvDir: string,
 *   spawn?: (cmd: string, args: string[], opts: object) => { status: number | null, stdout?: string, stderr?: string, error?: Error },
 *   diagnostic: { enabled?: boolean, projectionKnown?: boolean, conflict?: boolean, invalid?: boolean },
 *   requiredEnvFilesPresent: boolean,
 *   now?: Date,
 * }} options
 */
export function probeConfigurationObservation(options) {
  const now = options.now ?? new Date();
  const spawn = options.spawn ?? ((cmd, args, opts) => {
    try {
      return { status: 0, stdout: execFileSync(cmd, args, { ...opts, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }) };
    } catch (error) {
      return { status: error?.status ?? 1, stdout: error?.stdout ? String(error.stdout) : "", stderr: error?.stderr ? String(error.stderr) : "", error };
    }
  });
  const adapter = path.join(options.repositoryRoot, "scripts", "environment", "staging-config-projection.ts");
  let result = null;
  try {
    result = spawn(
      process.execPath,
      ["--import", "tsx", adapter, "--json", "--env-dir", options.stagingEnvDir, "--repository-root", options.repositoryRoot],
      { cwd: options.repositoryRoot },
    );
  } catch {
    result = null;
  }
  let projections = [];
  if (result && result.status === 0 && typeof result.stdout === "string") {
    try {
      const parsed = JSON.parse(result.stdout);
      // Only the adapter's declared schema is accepted; anything else is "no projection".
      projections = parsed?.schema === CONFIG_PROJECTION_SCHEMA && Array.isArray(parsed?.projections) ? parsed.projections : [];
    } catch {
      projections = [];
    }
  }
  return {
    provenance: liveProvenance("loadConfig-projection", ["scripts/environment/staging-config-projection.ts", "readStagingDiagnosticEnabled"], now),
    projections,
    requiredEnvFilesPresent: options.requiredEnvFilesPresent === true,
    diagnostic: options.diagnostic ?? {},
  };
}

/* ----------------------------------------------------------------------- */
/* S4 Database                                                              */
/* ----------------------------------------------------------------------- */

/**
 * Committed migration journal with per-entry SQL sha256 (what drizzle stores
 * in `__drizzle_migrations.hash`). Static, no database access.
 *
 * @param {{ drizzleDir: string, hashFile?: (p: string) => string }} options
 */
export function probeCommittedJournal(options) {
  const hashFile = options.hashFile ?? hashMigrationFile;
  const journal = readJournal(options.drizzleDir);
  if (!journal.ok) return null;
  const findings = validateJournalShape(journal.journal);
  if (findings.length > 0) return null;
  const entries = [];
  for (const entry of journal.journal.entries) {
    const sqlPath = path.join(options.drizzleDir, `${entry.tag}.sql`);
    let sqlSha256;
    try {
      sqlSha256 = hashFile(sqlPath);
    } catch {
      return null;
    }
    entries.push({ idx: entry.idx, tag: entry.tag, when: entry.when, sqlSha256 });
  }
  return { entries };
}

/**
 * @param {{ drizzleDir: string, appliedLedger?: object | null, baseline?: object | null, now?: Date }} options
 */
export function probeDatabaseObservation(options) {
  const now = options.now ?? new Date();
  return {
    provenance: liveProvenance("committed-journal", ["drizzle/meta/_journal.json", options.appliedLedger ? "applied ledger artifact" : "applied ledger NOT probed (no live DB access)"], now),
    committedJournal: probeCommittedJournal({ drizzleDir: options.drizzleDir }),
    // Live `drizzle.__drizzle_migrations` and baseline classification require an
    // authorised read-only DB probe; this module never opens a DB connection.
    appliedLedger: options.appliedLedger ?? null,
    baseline: options.baseline ?? null,
    now,
  };
}

/* ----------------------------------------------------------------------- */
/* S6 Security                                                              */
/* ----------------------------------------------------------------------- */

/**
 * @param {unknown} inspectJson parsed `podman image inspect <image>` entry
 */
export function parseImageInspect(inspectJson) {
  const entry = Array.isArray(inspectJson) ? inspectJson[0] : inspectJson;
  if (!entry || typeof entry !== "object") return null;
  const id = typeof entry.Id === "string" ? entry.Id : null;
  const labels = entry.Config?.Labels ?? entry.Labels ?? {};
  return {
    imageId: id,
    repoDigests: Array.isArray(entry.RepoDigests) ? entry.RepoDigests.filter((d) => typeof d === "string") : [],
    revisionLabel: typeof labels?.["org.opencontainers.image.revision"] === "string" ? labels["org.opencontainers.image.revision"] : null,
  };
}

/**
 * Read-only image inspection for the required staging images.
 * @param {{ images: ReadonlyArray<{ image: string }>, inspect?: (image: string) => unknown }} options
 */
export function probeInspectedImages(options) {
  const inspect =
    options.inspect ??
    ((image) => JSON.parse(execFileSync("podman", ["image", "inspect", image], { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] })));
  const inspected = [];
  for (const target of options.images) {
    try {
      const parsed = parseImageInspect(inspect(target.image));
      if (parsed) inspected.push({ image: target.image, ...parsed });
    } catch {
      // absent image -> not inspected (binder: UNKNOWN)
    }
  }
  return inspected;
}

/**
 * Load Trivy JSON reports from a directory. Each report binds to an image via
 * ArtifactName/RepoTags and carries `CreatedAt` as scan time.
 * @param {{ dir: string | null, readDir?: typeof readdirSync, readFile?: typeof readFileSync, imageAliases?: Record<string, string> }} options
 */
export function loadTrivyReports(options) {
  if (!options.dir) return [];
  const readDir = options.readDir ?? readdirSync;
  const readFile = options.readFile ?? readFileSync;
  let files = [];
  try {
    files = readDir(options.dir).filter((f) => f.endsWith(".json")).sort();
  } catch {
    return [];
  }
  const reports = [];
  for (const file of files) {
    try {
      const report = JSON.parse(readFile(path.join(options.dir, file), "utf8"));
      const artifact = typeof report?.ArtifactName === "string" ? report.ArtifactName : null;
      if (!artifact) continue;
      const image = options.imageAliases?.[artifact] ?? artifact;
      reports.push({ image, report, scannedAt: typeof report.CreatedAt === "string" ? report.CreatedAt : undefined, file });
    } catch {
      // unreadable report -> omitted (binder: SCAN_MISSING)
    }
  }
  return reports;
}

/* ----------------------------------------------------------------------- */
/* S7 Capacity                                                              */
/* ----------------------------------------------------------------------- */

/** Parse `/proc/meminfo` MemAvailable into bytes; null when absent. */
export function parseMemInfoAvailableBytes(text) {
  const match = String(text).match(/^MemAvailable:\s+(\d+)\s+kB\s*$/m);
  if (!match) return null;
  return Number(match[1]) * 1024;
}

/**
 * @param {{
 *   filesystems: ReadonlyArray<{ id: string, mountPoint: string, roles: string[] }>,
 *   statfs?: typeof statfsSync,
 *   readFile?: typeof readFileSync,
 *   now?: Date,
 * }} options
 */
export function probeCapacitySnapshots(options) {
  const now = options.now ?? new Date();
  const statfs = options.statfs ?? statfsSync;
  const readFile = options.readFile ?? readFileSync;
  const filesystems = [];
  for (const fs of options.filesystems) {
    try {
      const stats = statfs(fs.mountPoint);
      filesystems.push({
        id: fs.id,
        mountPoint: fs.mountPoint,
        roles: [...fs.roles],
        availableBytes: Number(stats.bavail) * Number(stats.bsize),
        measuredAt: now.toISOString(),
      });
    } catch {
      filesystems.push({ id: fs.id, mountPoint: fs.mountPoint, roles: [...fs.roles], availableBytes: undefined, measuredAt: now.toISOString() });
    }
  }
  let memory = null;
  try {
    const bytes = parseMemInfoAvailableBytes(readFile("/proc/meminfo", "utf8"));
    if (bytes != null) memory = { availableBytes: bytes, measuredAt: now.toISOString() };
  } catch {
    memory = null;
  }
  return { filesystems, memory };
}

/**
 * @param {{
 *   candidateHead: string | null,
 *   snapshots: { filesystems: object[], memory: object | null },
 *   buildFootprint?: object | null,
 *   peakMemoryDemand?: object | null,
 *   preservation?: object | null,
 *   now?: Date,
 * }} options
 */
export function probeCapacityObservation(options) {
  const now = options.now ?? new Date();
  return {
    provenance: liveProvenance("statfs+meminfo", ["fs.statfsSync", "/proc/meminfo", options.buildFootprint ? "footprint artifact" : "build footprint NOT measured (requires authorised build)"], now),
    candidateHead: options.candidateHead ?? undefined,
    filesystems: options.snapshots.filesystems,
    buildFootprint: options.buildFootprint ?? null,
    memory: options.snapshots.memory,
    peakMemoryDemand: options.peakMemoryDemand ?? null,
    preservation: options.preservation ?? null,
    now,
  };
}

/* ----------------------------------------------------------------------- */
/* S8 PostgreSQL init                                                       */
/* ----------------------------------------------------------------------- */

/**
 * Collect the init manifest for `relativeRoot` directly from the exact git
 * tree of `sha` (read-only `git ls-tree` + `git cat-file`). Output format is
 * identical to `collectInitManifest` so digests are comparable.
 *
 * @param {string} sha
 * @param {string} relativeRoot e.g. "docker/postgres/init"
 * @param {{ git?: (args: string[], options?: { buffer?: boolean }) => string | Buffer, repositoryRoot?: string }} [options]
 */
export function collectInitManifestFromGitTree(sha, relativeRoot, options = {}) {
  const git = options.git ?? defaultGit(options.repositoryRoot ?? process.cwd());
  let listing;
  try {
    listing = String(git(["ls-tree", "-r", "-z", sha, "--", relativeRoot]));
  } catch (error) {
    return { ok: false, reasonCode: POSTGRES_INIT_REASON.UNREADABLE, detail: error instanceof Error ? error.message : "ls-tree failed" };
  }
  const files = [];
  const prefix = relativeRoot.replace(/\/+$/, "") + "/";
  for (const record of listing.split("\0")) {
    if (!record) continue;
    const match = record.match(/^(\d{6}) (\w+) ([0-9a-f]{40})\t(.+)$/);
    if (!match) return { ok: false, reasonCode: POSTGRES_INIT_REASON.MALFORMED_MOUNT, detail: "unparseable ls-tree record" };
    const [, mode, type, object, fullPath] = match;
    if (mode === "120000") return { ok: false, reasonCode: POSTGRES_INIT_REASON.UNSAFE_SYMLINK, detail: fullPath };
    if (type !== "blob") return { ok: false, reasonCode: POSTGRES_INIT_REASON.IDENTITY_CONFLICT, detail: `unsupported entry type ${type}: ${fullPath}` };
    if (!fullPath.startsWith(prefix)) return { ok: false, reasonCode: POSTGRES_INIT_REASON.IDENTITY_CONFLICT, detail: fullPath };
    let bytes;
    try {
      bytes = git(["cat-file", "blob", object], { buffer: true });
    } catch {
      return { ok: false, reasonCode: POSTGRES_INIT_REASON.UNREADABLE, detail: fullPath };
    }
    files.push({
      relativePath: fullPath.slice(prefix.length),
      digest: createHash("sha256").update(bytes).digest("hex"),
      executable: mode === "100755",
    });
  }
  if (files.length === 0) {
    return { ok: false, reasonCode: POSTGRES_INIT_REASON.EXTRA_OR_MISSING_FILE, detail: `no init files under ${relativeRoot} in ${sha}` };
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

/** True when a directory exists (used to decide whether a working-tree manifest can be collected). */
export function directoryExists(p) {
  return existsSync(p);
}
