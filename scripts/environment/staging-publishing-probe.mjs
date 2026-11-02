/**
 * Trusted publishing observations for Founder strict-staging preflight.
 *
 * Founder D3 Option A — four-state publishing isolation:
 *   PUBLIC_MARKETING
 *   STAGING_PUBLIC_UNAUTHORIZED
 *   STAGING_PUBLIC_AUTHORIZED
 *   PUBLISHING_UNKNOWN_OR_CONFLICTING
 *
 * Repository workflow YAML alone is not operational enablement authority.
 * GitHub Actions workflow state alone does not prove Pages content is gone.
 * A raw operator `authorized=true` is never publication authority.
 * This module never enables/disables workflows, publishes Pages, or mutates DNS.
 */
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";

export const PUBLISHING_CLASSIFICATION = Object.freeze({
  PUBLIC_MARKETING: "PUBLIC_MARKETING",
  STAGING_PUBLIC_UNAUTHORIZED: "STAGING_PUBLIC_UNAUTHORIZED",
  STAGING_PUBLIC_AUTHORIZED: "STAGING_PUBLIC_AUTHORIZED",
  PUBLISHING_UNKNOWN_OR_CONFLICTING: "PUBLISHING_UNKNOWN_OR_CONFLICTING",
});

export const EXPECTED_MARKETING_PUBLICATION = Object.freeze({
  repositoryIdentity: "nivedhya11/BobaBear",
  workflowPath: ".github/workflows/deploy.yml",
  workflowFileName: "deploy.yml",
  publishDir: "./out",
  cname: "thebobabear.in",
  marketingHosts: Object.freeze(["thebobabear.in", "www.thebobabear.in"]),
  pagesSourceBranch: "gh-pages",
  pagesSourcePath: "/",
});

const KNOWN_WORKFLOW_API_STATES = new Set([
  "active",
  "disabled_manually",
  "disabled_inactivity",
  "disabled_by_actions_reenable_limit",
]);

/**
 * Parse repository-owned workflow file observations.
 * Does not consult GitHub operational state.
 * @param {string} workflowText
 */
export function observeWorkflowFile(workflowText) {
  if (typeof workflowText !== "string" || workflowText.length === 0) {
    return {
      present: false,
      triggersMain: false,
      publishDir: null,
      cname: null,
      pagesSourceDescribed: false,
      fileDeployWorkflowState: "UNKNOWN",
    };
  }

  const triggersMain = /branches:\s*\[main\]/.test(workflowText);
  const publishDirMatch = /publish_dir:\s*['"]?([^\s'"]+)/.exec(workflowText);
  const cnameMatch = /\bcname:\s*['"]?([^\s'"]+)/.exec(workflowText);
  const publishDir = publishDirMatch?.[1] ?? null;
  const cname = cnameMatch?.[1] ?? null;
  const pagesSourceDescribed = publishDir != null && cname != null;

  return {
    present: true,
    triggersMain,
    publishDir,
    cname,
    pagesSourceDescribed,
    // File-derived description only — not GitHub Actions enablement.
    fileDeployWorkflowState: triggersMain ? "active_on_main" : "UNKNOWN",
  };
}

/**
 * Legacy helper retained for call sites that only have workflow text.
 * Classification requires independently established GitHub/Pages/staging inputs;
 * file text alone always fails closed as UNKNOWN/CONFLICTING.
 * @param {string} workflowText
 */
export function probePublishingWorkflow(workflowText) {
  return classifyPublishingIsolation({
    workflowFile: observeWorkflowFile(workflowText),
    githubWorkflow: { state: "UNKNOWN", observed: false, detail: "github workflow state not supplied" },
    pages: { observed: false, detail: "pages observation not supplied" },
    staging: { observedExposure: false },
  });
}

/**
 * @param {string} workflowPath
 */
export function readPublishingWorkflow(workflowPath) {
  try {
    return probePublishingWorkflow(readFileSync(workflowPath, "utf8"));
  } catch {
    return probePublishingWorkflow("");
  }
}

/**
 * Read-only GitHub Actions workflow operational state.
 * Never prints tokens. Never mutates workflow status.
 * @param {{
 *   repositoryIdentity?: string,
 *   workflowPath?: string,
 *   timeoutMs?: number,
 *   spawn?: typeof spawnSync,
 * }} [options]
 */
export function observeGithubWorkflowState(options = {}) {
  const repositoryIdentity = options.repositoryIdentity ?? EXPECTED_MARKETING_PUBLICATION.repositoryIdentity;
  const workflowPath = options.workflowPath ?? EXPECTED_MARKETING_PUBLICATION.workflowPath;
  const timeoutMs = options.timeoutMs ?? 15_000;
  const spawn = options.spawn ?? spawnSync;
  const observedAt = new Date().toISOString();

  // GitHub Actions workflow API accepts the file name (deploy.yml), not the full path.
  const workflowApiId = workflowPath.includes("/")
    ? workflowPath.split("/").pop()
    : workflowPath;
  const result = spawn(
    "gh",
    [
      "api",
      `repos/${repositoryIdentity}/actions/workflows/${workflowApiId}`,
      "--jq",
      "{path:.path,state:.state,name:.name}",
    ],
    { encoding: "utf8", timeout: timeoutMs, stdio: ["ignore", "pipe", "pipe"] },
  );

  if (result.status !== 0) {
    return {
      observed: false,
      state: "UNKNOWN",
      path: null,
      name: null,
      repositoryIdentity,
      observedAt,
      detail: "github workflow state probe failed or timed out",
    };
  }

  try {
    const payload = JSON.parse(String(result.stdout ?? "").trim() || "{}");
    const state = typeof payload.state === "string" ? payload.state : "UNKNOWN";
    if (!KNOWN_WORKFLOW_API_STATES.has(state)) {
      return {
        observed: false,
        state: "UNKNOWN",
        path: typeof payload.path === "string" ? payload.path : null,
        name: typeof payload.name === "string" ? payload.name : null,
        repositoryIdentity,
        observedAt,
        detail: "github workflow state unrecognized",
      };
    }
    return {
      observed: true,
      state,
      path: typeof payload.path === "string" ? payload.path : null,
      name: typeof payload.name === "string" ? payload.name : null,
      repositoryIdentity,
      observedAt,
      detail: "github workflow state observed",
    };
  } catch {
    return {
      observed: false,
      state: "UNKNOWN",
      path: null,
      name: null,
      repositoryIdentity,
      observedAt,
      detail: "github workflow state payload malformed",
    };
  }
}

/**
 * Read-only GitHub Pages source / domain observation.
 * @param {{
 *   repositoryIdentity?: string,
 *   timeoutMs?: number,
 *   spawn?: typeof spawnSync,
 * }} [options]
 */
export function observeGithubPagesSettings(options = {}) {
  const repositoryIdentity = options.repositoryIdentity ?? EXPECTED_MARKETING_PUBLICATION.repositoryIdentity;
  const timeoutMs = options.timeoutMs ?? 15_000;
  const spawn = options.spawn ?? spawnSync;
  const observedAt = new Date().toISOString();

  const result = spawn(
    "gh",
    [
      "api",
      `repos/${repositoryIdentity}/pages`,
      "--jq",
      "{status:.status,cname:.cname,source_branch:.source.branch,source_path:.source.path,html_url:.html_url,public:.public}",
    ],
    { encoding: "utf8", timeout: timeoutMs, stdio: ["ignore", "pipe", "pipe"] },
  );

  if (result.status !== 0) {
    return {
      observed: false,
      sourceBranch: null,
      sourcePath: null,
      cname: null,
      status: null,
      htmlUrl: null,
      public: null,
      repositoryIdentity,
      observedAt,
      detail: "github pages probe failed or timed out",
    };
  }

  try {
    const payload = JSON.parse(String(result.stdout ?? "").trim() || "{}");
    return {
      observed: true,
      sourceBranch: typeof payload.source_branch === "string" ? payload.source_branch : null,
      sourcePath: typeof payload.source_path === "string" ? payload.source_path : null,
      cname: typeof payload.cname === "string" ? payload.cname : null,
      status: typeof payload.status === "string" ? payload.status : null,
      htmlUrl: typeof payload.html_url === "string" ? payload.html_url : null,
      public: payload.public === true,
      repositoryIdentity,
      observedAt,
      detail: "github pages settings observed",
    };
  } catch {
    return {
      observed: false,
      sourceBranch: null,
      sourcePath: null,
      cname: null,
      status: null,
      htmlUrl: null,
      public: null,
      repositoryIdentity,
      observedAt,
      detail: "github pages payload malformed",
    };
  }
}

function hostnameOf(originOrHost) {
  if (typeof originOrHost !== "string" || originOrHost.length === 0) return null;
  try {
    if (originOrHost.includes("://")) {
      return new URL(originOrHost).hostname.toLowerCase();
    }
    return originOrHost.toLowerCase();
  } catch {
    return null;
  }
}

function isMarketingHost(hostname) {
  if (hostname == null) return false;
  return EXPECTED_MARKETING_PUBLICATION.marketingHosts.includes(hostname.toLowerCase());
}

/**
 * A Founder staging-publication contract must bind origin, access, topology,
 * identity, and authorization provenance. A bare authorized boolean is refused.
 * @param {unknown} contract
 * @param {{ candidateSha?: string | null, nowMs?: number }} [context]
 */
export function evaluateStagingPublicationContract(contract, context = {}) {
  if (contract == null) {
    return { ok: false, reason: "missing staging publication contract" };
  }
  if (contract === true || contract === "true" || contract === 1) {
    return { ok: false, reason: "operator authorized boolean is not a Founder publication contract" };
  }
  if (typeof contract !== "object" || Array.isArray(contract)) {
    return { ok: false, reason: "staging publication contract malformed" };
  }

  const c = /** @type {Record<string, unknown>} */ (contract);
  if (c.authorized === true && Object.keys(c).length <= 2) {
    // authorized flag with almost no binding fields
    const keys = Object.keys(c).filter((key) => key !== "authorized");
    if (keys.length === 0) {
      return { ok: false, reason: "authorized=true without Founder publication contract fields" };
    }
  }

  const requiredString = ["stagingOrigin", "accessRestrictions", "topology", "identity", "authorizationId"];
  for (const key of requiredString) {
    if (typeof c[key] !== "string" || c[key].length === 0) {
      return { ok: false, reason: `staging publication contract missing ${key}` };
    }
  }

  if (typeof c.authorizationProvenance !== "string" || c.authorizationProvenance.length === 0) {
    return { ok: false, reason: "staging publication contract missing authorizationProvenance" };
  }

  const stagingHost = hostnameOf(/** @type {string} */ (c.stagingOrigin));
  if (stagingHost == null) {
    return { ok: false, reason: "staging publication contract origin unparseable" };
  }
  if (isMarketingHost(stagingHost)) {
    return { ok: false, reason: "staging publication contract origin collides with marketing hostname" };
  }

  if (typeof c.boundCandidateSha === "string") {
    if (!/^[0-9a-f]{40}$/.test(c.boundCandidateSha)) {
      return { ok: false, reason: "staging publication contract boundCandidateSha malformed" };
    }
    if (typeof context.candidateSha !== "string" || !/^[0-9a-f]{40}$/.test(context.candidateSha)) {
      return {
        ok: false,
        reason: "staging publication contract boundCandidateSha cannot be verified without candidate SHA context",
      };
    }
    if (c.boundCandidateSha !== context.candidateSha) {
      return { ok: false, reason: "staging publication contract boundCandidateSha mismatch" };
    }
  }

  if (typeof c.expiresAt === "string") {
    const expiresMs = Date.parse(c.expiresAt);
    if (!Number.isFinite(expiresMs)) {
      return { ok: false, reason: "staging publication contract expiresAt malformed" };
    }
    const nowMs = context.nowMs ?? Date.now();
    if (expiresMs <= nowMs) {
      return { ok: false, reason: "staging publication contract expired" };
    }
  }

  return { ok: true, reason: "staging publication contract fields complete", stagingHost };
}

function marketingBaselineMatches(workflowFile, pages) {
  const expected = EXPECTED_MARKETING_PUBLICATION;
  if (!workflowFile?.present) {
    return { ok: false, reason: "workflow file missing" };
  }
  if (workflowFile.publishDir !== expected.publishDir) {
    return { ok: false, reason: "workflow publish_dir mismatch" };
  }
  if (workflowFile.cname !== expected.cname) {
    return { ok: false, reason: "workflow cname mismatch" };
  }
  if (!pages?.observed) {
    return { ok: false, reason: "pages settings not observed" };
  }
  if (pages.sourceBranch !== expected.pagesSourceBranch) {
    return { ok: false, reason: "pages source branch mismatch" };
  }
  if (pages.sourcePath !== expected.pagesSourcePath) {
    return { ok: false, reason: "pages source path mismatch" };
  }
  if (pages.cname !== expected.cname) {
    return { ok: false, reason: "pages cname mismatch" };
  }
  return { ok: true, reason: "marketing baseline verified" };
}

/**
 * Deterministic four-state classifier. Observations are preserved on the result.
 * Precedence:
 *   1. unresolved / contradictory → PUBLISHING_UNKNOWN_OR_CONFLICTING
 *   2. positively observed unauthorized staging exposure → STAGING_PUBLIC_UNAUTHORIZED
 *   3. positively observed authorized staging exposure → STAGING_PUBLIC_AUTHORIZED
 *   4. verified marketing with no unauthorized/conflicting staging → PUBLIC_MARKETING
 *
 * @param {{
 *   workflowFile?: ReturnType<typeof observeWorkflowFile>,
 *   workflowText?: string,
 *   githubWorkflow?: Record<string, unknown>,
 *   pages?: Record<string, unknown>,
 *   staging?: {
 *     observedExposure?: boolean,
 *     origin?: string | null,
 *     hostingTarget?: string | null,
 *     marketingHostingTarget?: string | null,
 *     authorization?: unknown,
 *     claimedAuthorized?: boolean,
 *   },
 *   repositoryIdentity?: string,
 *   candidateSha?: string | null,
 *   nowMs?: number,
 *   evidenceStale?: boolean,
 * }} input
 */
export function classifyPublishingIsolation(input = {}) {
  const workflowFile =
    input.workflowFile ??
    observeWorkflowFile(typeof input.workflowText === "string" ? input.workflowText : "");
  const githubWorkflow = input.githubWorkflow && typeof input.githubWorkflow === "object"
    ? input.githubWorkflow
    : { observed: false, state: "UNKNOWN", detail: "github workflow state missing" };
  const pages = input.pages && typeof input.pages === "object"
    ? input.pages
    : { observed: false, detail: "pages observation missing" };
  const staging = input.staging && typeof input.staging === "object" ? input.staging : {};
  const repositoryIdentity = input.repositoryIdentity ?? EXPECTED_MARKETING_PUBLICATION.repositoryIdentity;
  /** @type {string[]} */
  const contradictions = [];
  /** @type {string[]} */
  const reasons = [];

  const githubObserved = githubWorkflow.observed === true;
  const githubState = typeof githubWorkflow.state === "string" ? githubWorkflow.state : "UNKNOWN";
  const pagesObserved = pages.observed === true;

  if (input.evidenceStale === true) {
    contradictions.push("publishing evidence marked stale");
  }

  if (
    typeof githubWorkflow.repositoryIdentity === "string" &&
    githubWorkflow.repositoryIdentity.length > 0 &&
    githubWorkflow.repositoryIdentity !== repositoryIdentity
  ) {
    contradictions.push("github workflow repositoryIdentity mismatch");
  }
  if (
    typeof pages.repositoryIdentity === "string" &&
    pages.repositoryIdentity.length > 0 &&
    pages.repositoryIdentity !== repositoryIdentity
  ) {
    contradictions.push("pages repositoryIdentity mismatch");
  }
  if (
    githubObserved &&
    typeof githubWorkflow.path === "string" &&
    githubWorkflow.path.length > 0 &&
    githubWorkflow.path !== EXPECTED_MARKETING_PUBLICATION.workflowPath
  ) {
    contradictions.push("github workflow path mismatch");
  }

  // File describes main trigger while API reports a known non-active disabled state:
  // that is an expected marketing posture, not a contradiction.
  // Contradiction only when API and file describe incompatible *marketing* identities.
  if (workflowFile.present && pagesObserved) {
    if (workflowFile.cname != null && pages.cname != null && workflowFile.cname !== pages.cname) {
      contradictions.push("workflow cname disagrees with pages cname");
    }
  }

  const stagingOriginHost = hostnameOf(typeof staging.origin === "string" ? staging.origin : null);
  if (stagingOriginHost != null && isMarketingHost(stagingOriginHost)) {
    contradictions.push("staging origin hostname collides with marketing hostname");
  }

  // A projected/planned staging origin without independent exposure/isolation evidence
  // fails closed for the affected eligibility decision. Missing origin remains compatible
  // with marketing-only classification (no invented private-staging claim).
  const exposureEvidence =
    typeof staging.exposureEvidence === "string" ? staging.exposureEvidence : null;
  if (
    stagingOriginHost != null &&
    staging.observedExposure !== true &&
    exposureEvidence !== "INDEPENDENTLY_OBSERVED_PRIVATE" &&
    exposureEvidence !== "INDEPENDENTLY_OBSERVED_EXPOSED"
  ) {
    reasons.push(
      "staging origin present without independent exposure/isolation evidence; missing observations are not proof of private staging",
    );
  }

  const stagingHostTarget =
    typeof staging.hostingTarget === "string" && staging.hostingTarget.length > 0
      ? staging.hostingTarget
      : null;
  const marketingHostTarget =
    typeof staging.marketingHostingTarget === "string" && staging.marketingHostingTarget.length > 0
      ? staging.marketingHostingTarget
      : null;
  if (
    stagingHostTarget != null &&
    marketingHostTarget != null &&
    stagingHostTarget === marketingHostTarget &&
    stagingOriginHost != null &&
    !isMarketingHost(stagingOriginHost)
  ) {
    contradictions.push("staging and marketing share the same hosting/routing target");
  }

  if (!githubObserved || githubState === "UNKNOWN" || !KNOWN_WORKFLOW_API_STATES.has(githubState)) {
    reasons.push("github workflow operational state not independently established");
  }
  if (!pagesObserved) {
    reasons.push("pages source not independently established");
  }
  if (!workflowFile.present) {
    reasons.push("repository workflow file missing");
  }

  const marketing = marketingBaselineMatches(workflowFile, pages);
  if (!marketing.ok && pagesObserved && workflowFile.present) {
    reasons.push(marketing.reason);
  }

  const authorizationObject =
    staging.authorization != null &&
    typeof staging.authorization === "object" &&
    !Array.isArray(staging.authorization)
      ? /** @type {Record<string, unknown>} */ (staging.authorization)
      : null;
  const claimedAuthorized =
    staging.claimedAuthorized === true ||
    staging.authorization === true ||
    authorizationObject?.authorized === true;
  const contractEval = evaluateStagingPublicationContract(staging.authorization, {
    candidateSha: input.candidateSha ?? null,
    nowMs: input.nowMs,
  });
  const stagingObservationHost = stagingOriginHost;
  const contractOriginAgrees =
    contractEval.ok === true &&
    typeof contractEval.stagingHost === "string" &&
    stagingObservationHost != null &&
    contractEval.stagingHost === stagingObservationHost;
  const hasCompleteAuthorizedContract = contractEval.ok === true && contractOriginAgrees;
  const observedUnauthorizedExposure =
    staging.observedExposure === true && !hasCompleteAuthorizedContract;
  const unauthorizedClaim =
    claimedAuthorized && !hasCompleteAuthorizedContract
      ? contractEval.ok === true && !contractOriginAgrees
        ? "staging publication contract origin does not independently agree with observed staging origin"
        : contractEval.reason
      : null;

  const candidateSha = typeof input.candidateSha === "string" ? input.candidateSha : null;
  const baseParts = {
    workflowFile,
    githubWorkflow,
    pages,
    staging,
    contradictions,
    marketingBaselineOk: marketing.ok,
    contractEval,
    candidateSha,
  };

  // Precedence 1: unresolved / contradictory marketing/workflow evidence
  if (contradictions.length > 0) {
    return finalizeClassification(PUBLISHING_CLASSIFICATION.PUBLISHING_UNKNOWN_OR_CONFLICTING, {
      ...baseParts,
      reasons: [...reasons, ...contradictions],
    });
  }

  if (reasons.length > 0 || !marketing.ok) {
    return finalizeClassification(PUBLISHING_CLASSIFICATION.PUBLISHING_UNKNOWN_OR_CONFLICTING, {
      ...baseParts,
      reasons: reasons.length > 0 ? reasons : [marketing.reason],
    });
  }

  // Precedence 2: positively observed unauthorized staging exposure / forged authorization
  if (observedUnauthorizedExposure || unauthorizedClaim != null) {
    return finalizeClassification(PUBLISHING_CLASSIFICATION.STAGING_PUBLIC_UNAUTHORIZED, {
      ...baseParts,
      reasons: [
        unauthorizedClaim ??
          "staging public exposure observed without Founder publication contract",
      ],
    });
  }

  // Precedence 3: positively observed authorized staging (marketing still isolated)
  if (staging.observedExposure === true && hasCompleteAuthorizedContract) {
    return finalizeClassification(PUBLISHING_CLASSIFICATION.STAGING_PUBLIC_AUTHORIZED, {
      ...baseParts,
      reasons: ["founder staging publication contract and observations agree"],
      marketingBaselineOk: true,
    });
  }

  // Precedence 4: verified marketing; no positively observed unauthorized staging exposure.
  // Missing exposure evidence is not proof of private staging, and is also not by itself
  // a marketing publishing violation. Workflow API may be active or disabled_manually.
  return finalizeClassification(PUBLISHING_CLASSIFICATION.PUBLIC_MARKETING, {
    ...baseParts,
    reasons: [
      "authorized public marketing publication verified; no positively observed unauthorized staging exposure",
    ],
    marketingBaselineOk: true,
  });
}

function finalizeClassification(classification, parts) {
  const githubState =
    parts.githubWorkflow?.observed === true && typeof parts.githubWorkflow.state === "string"
      ? parts.githubWorkflow.state
      : "UNKNOWN";
  const pagesSourceKnown =
    parts.pages?.observed === true &&
    typeof parts.pages.sourceBranch === "string" &&
    typeof parts.pages.cname === "string";

  // Staging-unsafe only for unauthorized / unknown-conflicting postures — not for marketing Pages.
  const unsafeActivePublishingPath =
    classification === PUBLISHING_CLASSIFICATION.STAGING_PUBLIC_UNAUTHORIZED ||
    classification === PUBLISHING_CLASSIFICATION.PUBLISHING_UNKNOWN_OR_CONFLICTING;

  return Object.freeze({
    classification,
    state: classification,
    deployWorkflowState: githubState,
    fileDeployWorkflowState: parts.workflowFile?.fileDeployWorkflowState ?? "UNKNOWN",
    pagesSourceKnown,
    unsafeActivePublishingPath,
    candidateSha: typeof parts.candidateSha === "string" ? parts.candidateSha : null,
    workflowFile: parts.workflowFile,
    githubWorkflow: parts.githubWorkflow,
    pages: parts.pages,
    staging: parts.staging,
    contradictions: Object.freeze([...(parts.contradictions ?? [])]),
    reasons: Object.freeze([...(parts.reasons ?? [])]),
    marketingBaselineOk: parts.marketingBaselineOk === true,
    contractEvaluation: parts.contractEval ?? null,
  });
}

/**
 * Gather trusted publishing evidence. Defaults are read-only and fail closed.
 * Inject observers in tests; never print credentials.
 *
 * @param {{
 *   workflowPath?: string,
 *   repositoryIdentity?: string,
 *   readWorkflowText?: () => string,
 *   observeGithubWorkflow?: () => Record<string, unknown>,
 *   observePages?: () => Record<string, unknown>,
 *   observeStaging?: () => Record<string, unknown>,
 *   candidateSha?: string | null,
 *   nowMs?: number,
 * }} [deps]
 */
export function gatherPublishingEvidence(deps = {}) {
  const repositoryIdentity = deps.repositoryIdentity ?? EXPECTED_MARKETING_PUBLICATION.repositoryIdentity;
  const workflowPath = deps.workflowPath ?? EXPECTED_MARKETING_PUBLICATION.workflowPath;
  const apiWorkflowPath = EXPECTED_MARKETING_PUBLICATION.workflowPath;

  let workflowText = "";
  try {
    workflowText =
      typeof deps.readWorkflowText === "function"
        ? deps.readWorkflowText()
        : readFileSync(workflowPath, "utf8");
  } catch {
    workflowText = "";
  }

  const githubWorkflow =
    typeof deps.observeGithubWorkflow === "function"
      ? deps.observeGithubWorkflow()
      : observeGithubWorkflowState({ repositoryIdentity, workflowPath: apiWorkflowPath });

  const pages =
    typeof deps.observePages === "function"
      ? deps.observePages()
      : observeGithubPagesSettings({ repositoryIdentity });

  const staging =
    typeof deps.observeStaging === "function"
      ? deps.observeStaging()
      : {
          observedExposure: false,
          origin: null,
          hostingTarget: null,
          marketingHostingTarget: null,
          authorization: null,
          claimedAuthorized: false,
        };

  return classifyPublishingIsolation({
    workflowFile: observeWorkflowFile(workflowText),
    githubWorkflow,
    pages,
    staging,
    repositoryIdentity,
    candidateSha: deps.candidateSha ?? null,
    nowMs: deps.nowMs,
  });
}
