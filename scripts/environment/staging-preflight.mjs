/**
 * Fail-closed Founder staging deployment preflight decision engine.
 *
 * Pure evaluation only: probes gather evidence separately; this module never
 * mutates containers, images, volumes, env files, or databases.
 *
 * Outcomes: PASS | BLOCKED | UNKNOWN
 * Only PASS may authorize progression into operational deployment effects.
 *
 * Operator-supplied booleans / "ready=true" flags are ignored as authority.
 * Missing evidence never means PASS — every PASS field requires explicit
 * independently established positive proof.
 */
import { ENVIRONMENT_CLASSIFICATION } from "../recovery/constants.mjs";
import { evaluateQualifyingRecoveryProof, validateEvidence } from "../recovery/evidence.mjs";
import {
  evaluateStagingRecoveryChain,
  STAGING_CHECKPOINT_REASON,
  syntheticIsolatedCheckpointFixture,
} from "./staging-recovery-checkpoint.mjs";
import { POSTGRES_INIT_DISPOSITION } from "./postgres-init-identity.mjs";
import { syntheticBoundImages, sameBoundImages } from "./staging-image-security-evidence.mjs";
import { PROTECTED_PRIMARY_REPOSITORY } from "./staging-source-isolation.mjs";

export const PREFLIGHT_OUTCOME = Object.freeze({
  PASS: "PASS",
  BLOCKED: "BLOCKED",
  UNKNOWN: "UNKNOWN",
});

export const PREFLIGHT_REASON = Object.freeze({
  SOURCE_AUTHORITY_INVALID: "SOURCE_AUTHORITY_INVALID",
  SOURCE_SHA_TREE_DRIFT: "SOURCE_SHA_TREE_DRIFT",
  SOURCE_DIRTY_OR_PROTECTED: "SOURCE_DIRTY_OR_PROTECTED",
  PUBLISHING_UNSAFE_OR_UNKNOWN: "PUBLISHING_UNSAFE_OR_UNKNOWN",
  RUNTIME_IDENTITY_INVALID: "RUNTIME_IDENTITY_INVALID",
  ENVIRONMENT_INVALID: "ENVIRONMENT_INVALID",
  DIAGNOSTIC_UNEXPECTEDLY_ENABLED: "DIAGNOSTIC_UNEXPECTEDLY_ENABLED",
  PROJECTED_CONFIG_UNKNOWN: "PROJECTED_CONFIG_UNKNOWN",
  DATABASE_STATE_UNKNOWN_OR_UNSAFE: "DATABASE_STATE_UNKNOWN_OR_UNSAFE",
  BASELINE_INCOMPATIBLE_OR_UNKNOWN: "BASELINE_INCOMPATIBLE_OR_UNKNOWN",
  RECOVERY_PROOF_MISSING: "RECOVERY_PROOF_MISSING",
  RECOVERY_INTEGRITY_UNVERIFIED: "RECOVERY_INTEGRITY_UNVERIFIED",
  RECOVERY_RESTORE_PROOF_MISSING: "RECOVERY_RESTORE_PROOF_MISSING",
  RECOVERY_EVIDENCE_STALE_OR_MISBOUND: "RECOVERY_EVIDENCE_STALE_OR_MISBOUND",
  RECOVERY_PROOF_BINDING_DESIGN_DEPENDENCY: "RECOVERY_PROOF_BINDING_DESIGN_DEPENDENCY",
  SECURITY_EVIDENCE_MISSING: "SECURITY_EVIDENCE_MISSING",
  SECURITY_RISK_WAIVED: "SECURITY_RISK_WAIVED",
  IMAGE_SECURITY_NOT_BOUND: "IMAGE_SECURITY_NOT_BOUND",
  CAPACITY_OR_PRESERVATION_UNSAFE: "CAPACITY_OR_PRESERVATION_UNSAFE",
  POSTGRES_INIT_NOT_PRESERVABLE: "POSTGRES_INIT_NOT_PRESERVABLE",
  PROBE_FAILURE: "PROBE_FAILURE",
  EVIDENCE_MALFORMED: "EVIDENCE_MALFORMED",
});

/** Exact repository identity required for Founder staging deploy authority. */
export const EXPECTED_REPOSITORY_IDENTITY = "nivedhya11/BobaBear";

/**
 * Explicit known-safe migration ledger states. Arbitrary strings are refused.
 * Synthetic PASS fixtures must use one of these; live probes must establish them.
 */
export const KNOWN_SAFE_MIGRATION_LEDGER_STATES = Object.freeze([
  "APPLIED_CURRENT",
  "LEDGER_CURRENT",
]);

/**
 * @typedef {"PASS"|"BLOCKED"|"UNKNOWN"} PreflightOutcome
 * @typedef {{ code: string, category: string, detail?: string }} PreflightFinding
 */

function isFullGitSha(value) {
  return typeof value === "string" && /^[0-9a-f]{40}$/.test(value);
}

/**
 * @param {unknown} evidence
 * @returns {{
 *   outcome: PreflightOutcome,
 *   findings: PreflightFinding[],
 *   categories: Record<string, PreflightOutcome>,
 *   recoveryProofBinding?: string,
 * }}
 */
export function evaluateStagingDeployPreflight(evidence) {
  /** @type {PreflightFinding[]} */
  const findings = [];
  /** @type {Record<string, PreflightOutcome>} */
  const categories = {};

  if (evidence == null || typeof evidence !== "object" || Array.isArray(evidence)) {
    return {
      outcome: PREFLIGHT_OUTCOME.BLOCKED,
      findings: [{ code: PREFLIGHT_REASON.EVIDENCE_MALFORMED, category: "meta", detail: "evidence object required" }],
      categories: { meta: PREFLIGHT_OUTCOME.BLOCKED },
    };
  }

  const e = /** @type {Record<string, any>} */ (evidence);

  if (e.probeError === true || e.probeTimedOut === true) {
    return {
      outcome: PREFLIGHT_OUTCOME.BLOCKED,
      findings: [
        {
          code: PREFLIGHT_REASON.PROBE_FAILURE,
          category: "meta",
          detail: typeof e.probeDetail === "string" ? e.probeDetail : "probe failed or timed out",
        },
      ],
      categories: { meta: PREFLIGHT_OUTCOME.BLOCKED },
    };
  }

  // Explicitly ignore any operator-controlled ready/bypass flags.
  if (
    e.ready === true ||
    e.bypass === true ||
    e.forceDeploy === true ||
    e.approved === true ||
    e.waive === true ||
    e.skipPreflight === true
  ) {
    findings.push({
      code: PREFLIGHT_REASON.EVIDENCE_MALFORMED,
      category: "meta",
      detail: "operator ready/bypass flags are not authoritative and do not establish PASS",
    });
  }

  categories.source = evaluateSource(e.source, findings);
  categories.publishing = evaluatePublishing(e.publishing, findings);
  categories.runtime = evaluateRuntime(e.runtime, findings);
  categories.environment = evaluateEnvironment(e.environment, findings);
  categories.database = evaluateDatabase(e.database, findings);
  const recovery = evaluateRecovery(e.recovery, e.source, findings);
  categories.recovery = recovery.outcome;
  categories.security = evaluateSecurity(e.security, e.source, findings);
  categories.capacity = evaluateCapacity(e.capacity, findings);
  categories.postgresInit = evaluatePostgresInit(e.postgresInit, findings);

  const values = Object.values(categories);
  let outcome = PREFLIGHT_OUTCOME.PASS;
  if (values.includes(PREFLIGHT_OUTCOME.BLOCKED) || findings.some((f) => f.code === PREFLIGHT_REASON.EVIDENCE_MALFORMED && f.category === "meta" && e.ready === true)) {
    outcome = PREFLIGHT_OUTCOME.BLOCKED;
  } else if (values.includes(PREFLIGHT_OUTCOME.UNKNOWN)) {
    outcome = PREFLIGHT_OUTCOME.UNKNOWN;
  }

  // UNKNOWN is not authorization — treat as non-PASS for deployment.
  if (outcome === PREFLIGHT_OUTCOME.UNKNOWN) {
    outcome = PREFLIGHT_OUTCOME.BLOCKED;
    findings.push({
      code: PREFLIGHT_REASON.PROBE_FAILURE,
      category: "meta",
      detail: "UNKNOWN category results fail closed as BLOCKED for deployment authorization",
    });
  }

  // If any bypass flag was present, never PASS.
  if (
    e.ready === true ||
    e.bypass === true ||
    e.forceDeploy === true ||
    e.approved === true ||
    e.waive === true ||
    e.skipPreflight === true
  ) {
    outcome = PREFLIGHT_OUTCOME.BLOCKED;
  }

  return {
    outcome,
    findings,
    categories,
    recoveryProofBinding: recovery.binding,
  };
}

/**
 * Deployment may proceed only when outcome is PASS.
 * @param {{ outcome: string }} decision
 */
export function assertPreflightAllowsDeployment(decision) {
  if (decision?.outcome !== PREFLIGHT_OUTCOME.PASS) {
    const error = new Error(
      `Staging deployment preflight is ${decision?.outcome ?? "UNKNOWN"}; refusing operational mutation.`,
    );
    error.name = "StagingPreflightBlockedError";
    throw error;
  }
}

const PREPARATION_BYPASS_FLAGS = ["ready", "bypass", "forceDeploy", "approved", "waive", "skipPreflight"];

/**
 * Phase A eligibility. PREPARATION_ELIGIBLE is not deployment authorization
 * and does not satisfy assertPreflightAllowsDeployment.
 * Image-security evidence is intentionally not required here.
 * @param {unknown} evidence
 */
export function evaluateCandidatePreparationEligibility(evidence) {
  /** @type {PreflightFinding[]} */
  const findings = [];
  if (evidence == null || typeof evidence !== "object" || Array.isArray(evidence)) {
    return {
      outcome: "BLOCKED",
      findings: [{ code: PREFLIGHT_REASON.EVIDENCE_MALFORMED, category: "meta", detail: "evidence object required" }],
      deploymentAuthorized: false,
    };
  }
  const e = /** @type {Record<string, any>} */ (evidence);
  if (PREPARATION_BYPASS_FLAGS.some((flag) => e[flag] === true)) {
    findings.push({
      code: PREFLIGHT_REASON.EVIDENCE_MALFORMED,
      category: "meta",
      detail: "operator ready/bypass flags are not authoritative and do not establish preparation eligibility",
    });
  }
  const source = evaluateSource(e.source, findings);
  const publishing = evaluatePublishing(e.publishing, findings);
  const environment = evaluateEnvironment(e.environment, findings);
  const categoriesPass = [source, publishing, environment].every((value) => value === PREFLIGHT_OUTCOME.PASS);
  const blocked = !categoriesPass || findings.some((finding) => finding.code === PREFLIGHT_REASON.EVIDENCE_MALFORMED);
  return {
    outcome: blocked ? "BLOCKED" : "PREPARATION_ELIGIBLE",
    findings,
    categories: { source, publishing, environment },
    deploymentAuthorized: false,
  };
}

function evaluateSource(source, findings) {
  if (!source || typeof source !== "object") {
    findings.push({
      code: PREFLIGHT_REASON.SOURCE_AUTHORITY_INVALID,
      category: "source",
      detail: "missing source evidence",
    });
    return PREFLIGHT_OUTCOME.BLOCKED;
  }

  if (source.repositoryIdentity !== EXPECTED_REPOSITORY_IDENTITY) {
    findings.push({
      code: PREFLIGHT_REASON.SOURCE_AUTHORITY_INVALID,
      category: "source",
      detail: "repositoryIdentity must be verified and exact",
    });
    return PREFLIGHT_OUTCOME.BLOCKED;
  }

  if (source.branch !== "main") {
    findings.push({
      code: PREFLIGHT_REASON.SOURCE_AUTHORITY_INVALID,
      category: "source",
      detail: "branch must be exact main",
    });
    return PREFLIGHT_OUTCOME.BLOCKED;
  }

  if (!isFullGitSha(source.head) || !isFullGitSha(source.originMain)) {
    findings.push({
      code: PREFLIGHT_REASON.SOURCE_SHA_TREE_DRIFT,
      category: "source",
      detail: "source head and origin-main must be exact full SHAs",
    });
    return PREFLIGHT_OUTCOME.BLOCKED;
  }

  if (source.head !== source.originMain) {
    findings.push({
      code: PREFLIGHT_REASON.SOURCE_SHA_TREE_DRIFT,
      category: "source",
      detail: "source head must equal origin-main",
    });
    return PREFLIGHT_OUTCOME.BLOCKED;
  }

  if (!isFullGitSha(source.tree) || !isFullGitSha(source.originMainTree)) {
    findings.push({
      code: PREFLIGHT_REASON.SOURCE_SHA_TREE_DRIFT,
      category: "source",
      detail: "candidate and authoritative trees must be present and valid full SHAs",
    });
    return PREFLIGHT_OUTCOME.BLOCKED;
  }

  if (source.tree !== source.originMainTree) {
    findings.push({
      code: PREFLIGHT_REASON.SOURCE_SHA_TREE_DRIFT,
      category: "source",
      detail: "candidate tree must equal authoritative origin-main tree",
    });
    return PREFLIGHT_OUTCOME.BLOCKED;
  }

  if (typeof source.trackedDirty !== "string") {
    findings.push({
      code: PREFLIGHT_REASON.SOURCE_DIRTY_OR_PROTECTED,
      category: "source",
      detail: "trackedDirty evidence must be explicitly known",
    });
    return PREFLIGHT_OUTCOME.BLOCKED;
  }

  if (source.trackedDirty !== "") {
    findings.push({
      code: PREFLIGHT_REASON.SOURCE_DIRTY_OR_PROTECTED,
      category: "source",
      detail: "trackedDirty must be empty",
    });
    return PREFLIGHT_OUTCOME.BLOCKED;
  }

  if (source.protectedCheckoutUsed !== false || source.artifactContextInsideProtectedRoot !== false) {
    findings.push({
      code: PREFLIGHT_REASON.SOURCE_DIRTY_OR_PROTECTED,
      category: "source",
      detail: "artifact context must be observed outside the protected checkout",
    });
    return PREFLIGHT_OUTCOME.BLOCKED;
  }

  if (source.isolatedArtifactContextVerified !== true) {
    findings.push({
      code: PREFLIGHT_REASON.SOURCE_DIRTY_OR_PROTECTED,
      category: "source",
      detail: "isolated git-archive context was not verified",
    });
    return PREFLIGHT_OUTCOME.BLOCKED;
  }

  if (source.authoritativeSourceRoot !== PROTECTED_PRIMARY_REPOSITORY) {
    findings.push({
      code: PREFLIGHT_REASON.SOURCE_AUTHORITY_INVALID,
      category: "source",
      detail: "authoritative source root must be the canonical repository",
    });
    return PREFLIGHT_OUTCOME.BLOCKED;
  }

  if (source.githubMainMatchesHead !== true) {
    findings.push({
      code: PREFLIGHT_REASON.SOURCE_SHA_TREE_DRIFT,
      category: "source",
      detail: "pinned GitHub main must equal the candidate head",
    });
    return PREFLIGHT_OUTCOME.BLOCKED;
  }

  return PREFLIGHT_OUTCOME.PASS;
}

function evaluatePublishing(publishing, findings) {
  if (!publishing || typeof publishing !== "object") {
    findings.push({ code: PREFLIGHT_REASON.PUBLISHING_UNSAFE_OR_UNKNOWN, category: "publishing", detail: "missing publishing evidence" });
    return PREFLIGHT_OUTCOME.UNKNOWN;
  }
  if (publishing.state === "UNKNOWN" || publishing.deployWorkflowState === "UNKNOWN") {
    findings.push({ code: PREFLIGHT_REASON.PUBLISHING_UNSAFE_OR_UNKNOWN, category: "publishing" });
    return PREFLIGHT_OUTCOME.UNKNOWN;
  }
  const deployDisabled = publishing.deployWorkflowState === "disabled_manually";
  const pagesKnown = publishing.pagesSourceKnown === true;
  const unsafe = publishing.unsafeActivePublishingPath === true;
  if (!deployDisabled || !pagesKnown || unsafe) {
    findings.push({ code: PREFLIGHT_REASON.PUBLISHING_UNSAFE_OR_UNKNOWN, category: "publishing" });
    return PREFLIGHT_OUTCOME.BLOCKED;
  }
  return PREFLIGHT_OUTCOME.PASS;
}

function evaluateRuntime(runtime, findings) {
  if (!runtime || typeof runtime !== "object") {
    findings.push({ code: PREFLIGHT_REASON.RUNTIME_IDENTITY_INVALID, category: "runtime", detail: "missing runtime evidence" });
    return PREFLIGHT_OUTCOME.UNKNOWN;
  }
  if (runtime.identityUnknown === true || runtime.evidenceComplete !== true) {
    findings.push({
      code: PREFLIGHT_REASON.RUNTIME_IDENTITY_INVALID,
      category: "runtime",
      detail: "runtime identity evidence incomplete or unknown",
    });
    return PREFLIGHT_OUTCOME.UNKNOWN;
  }
  const ok =
    runtime.podmanRootless === true &&
    runtime.composeProject === "boba-staging" &&
    runtime.postgresContainer === "boba-staging_postgres_1" &&
    runtime.postgresVolume === "boba-staging_postgres-data" &&
    runtime.unexpectedTarget === false;
  if (!ok) {
    findings.push({ code: PREFLIGHT_REASON.RUNTIME_IDENTITY_INVALID, category: "runtime" });
    return PREFLIGHT_OUTCOME.BLOCKED;
  }
  return PREFLIGHT_OUTCOME.PASS;
}

function evaluateEnvironment(environment, findings) {
  if (!environment || typeof environment !== "object") {
    findings.push({ code: PREFLIGHT_REASON.ENVIRONMENT_INVALID, category: "environment", detail: "missing environment evidence" });
    return PREFLIGHT_OUTCOME.UNKNOWN;
  }

  if (
    environment.projectedConfigState === "UNKNOWN" ||
    environment.projectedConfigState === "INVALID" ||
    environment.projectedConfigValid !== true
  ) {
    findings.push({
      code:
        environment.projectedConfigState === "UNKNOWN"
          ? PREFLIGHT_REASON.PROJECTED_CONFIG_UNKNOWN
          : PREFLIGHT_REASON.ENVIRONMENT_INVALID,
      category: "environment",
      detail: "projected configuration must be positively validated; UNKNOWN/INVALID never PASS",
    });
    return environment.projectedConfigState === "UNKNOWN"
      ? PREFLIGHT_OUTCOME.UNKNOWN
      : PREFLIGHT_OUTCOME.BLOCKED;
  }

  if (environment.diagnosticEnabled === true || environment.diagnosticConflict === true) {
    findings.push({
      code: PREFLIGHT_REASON.DIAGNOSTIC_UNEXPECTEDLY_ENABLED,
      category: "environment",
      detail: "Gate 2 deploy path requires diagnostic observer disabled with no conflicting enablement",
    });
    return PREFLIGHT_OUTCOME.BLOCKED;
  }

  if (environment.diagnosticProjectionKnown !== true) {
    findings.push({
      code: PREFLIGHT_REASON.ENVIRONMENT_INVALID,
      category: "environment",
      detail: "diagnostic enablement projection must be explicitly known",
    });
    return PREFLIGHT_OUTCOME.UNKNOWN;
  }

  if (
    environment.secretModesSecure == null ||
    environment.paymentIsolation == null ||
    environment.bobaBearEnvDrift == null ||
    environment.secretsPrinted == null
  ) {
    findings.push({
      code: PREFLIGHT_REASON.ENVIRONMENT_INVALID,
      category: "environment",
      detail: "secret mode, payment isolation, or drift evidence is missing",
    });
    return PREFLIGHT_OUTCOME.UNKNOWN;
  }

  const paymentIsolated = environment.paymentIsolation === "DISABLED" || environment.paymentIsolation === "TEST";
  const ok =
    environment.requiredEnvFilesPresent === true &&
    environment.projectedConfigValid === true &&
    environment.diagnosticEnabled === false &&
    environment.bobaBearEnvDrift === false &&
    environment.secretsPrinted === false &&
    environment.secretModesSecure === true &&
    environment.unsafeAdaptersExplicitlyFalse === true &&
    paymentIsolated;
  if (!ok) {
    findings.push({ code: PREFLIGHT_REASON.ENVIRONMENT_INVALID, category: "environment" });
    return PREFLIGHT_OUTCOME.BLOCKED;
  }
  return PREFLIGHT_OUTCOME.PASS;
}

function evaluateDatabase(database, findings) {
  if (!database || typeof database !== "object") {
    findings.push({
      code: PREFLIGHT_REASON.DATABASE_STATE_UNKNOWN_OR_UNSAFE,
      category: "database",
      detail: "missing database evidence",
    });
    return PREFLIGHT_OUTCOME.UNKNOWN;
  }
  if (database.migrationIdentityKnown !== true) {
    findings.push({ code: PREFLIGHT_REASON.DATABASE_STATE_UNKNOWN_OR_UNSAFE, category: "database" });
    return PREFLIGHT_OUTCOME.UNKNOWN;
  }
  if (
    typeof database.migrationLedgerState !== "string" ||
    !KNOWN_SAFE_MIGRATION_LEDGER_STATES.includes(database.migrationLedgerState)
  ) {
    findings.push({
      code: PREFLIGHT_REASON.DATABASE_STATE_UNKNOWN_OR_UNSAFE,
      category: "database",
      detail: "migration ledger state is not an explicit known-safe value",
    });
    return PREFLIGHT_OUTCOME.BLOCKED;
  }
  if (database.unexplainedPendingMutation == null || database.authAccountUniquenessKnown == null) {
    findings.push({
      code: PREFLIGHT_REASON.DATABASE_STATE_UNKNOWN_OR_UNSAFE,
      category: "database",
      detail: "pending-mutation or auth-account uniqueness evidence is missing",
    });
    return PREFLIGHT_OUTCOME.UNKNOWN;
  }
  if (database.unexplainedPendingMutation === true || database.authAccountUniquenessKnown !== true) {
    findings.push({ code: PREFLIGHT_REASON.DATABASE_STATE_UNKNOWN_OR_UNSAFE, category: "database" });
    return PREFLIGHT_OUTCOME.BLOCKED;
  }
  if (database.duplicateAuthAccountGroupCount !== 0) {
    findings.push({
      code: PREFLIGHT_REASON.DATABASE_STATE_UNKNOWN_OR_UNSAFE,
      category: "database",
      detail: "duplicate auth-account groups must be an observed zero count",
    });
    return PREFLIGHT_OUTCOME.BLOCKED;
  }
  const baseline = database.baselineCompatibility;
  if (baseline == null || baseline === "UNKNOWN") {
    findings.push({ code: PREFLIGHT_REASON.BASELINE_INCOMPATIBLE_OR_UNKNOWN, category: "database" });
    return PREFLIGHT_OUTCOME.UNKNOWN;
  }
  if (baseline === "PARTIAL_OR_INCOMPATIBLE") {
    findings.push({ code: PREFLIGHT_REASON.BASELINE_INCOMPATIBLE_OR_UNKNOWN, category: "database" });
    return PREFLIGHT_OUTCOME.BLOCKED;
  }
  if (baseline !== "COMPLETE_COMPATIBLE" && baseline !== "FRESH_EMPTY") {
    findings.push({ code: PREFLIGHT_REASON.BASELINE_INCOMPATIBLE_OR_UNKNOWN, category: "database" });
    return PREFLIGHT_OUTCOME.BLOCKED;
  }
  return PREFLIGHT_OUTCOME.PASS;
}

function evaluateRecovery(recovery, source, findings) {
  if (!recovery || typeof recovery !== "object") {
    findings.push({
      code: PREFLIGHT_REASON.RECOVERY_PROOF_MISSING,
      category: "recovery",
      detail: "missing recovery evidence",
    });
    return { outcome: PREFLIGHT_OUTCOME.UNKNOWN, binding: "RECOVERY_PROOF_BINDING = DESIGN_DEPENDENCY" };
  }

  if (recovery.bindingDesignDependency === true) {
    findings.push({
      code: PREFLIGHT_REASON.RECOVERY_PROOF_BINDING_DESIGN_DEPENDENCY,
      category: "recovery",
      detail: "staging-specific restore checkpoint cannot yet be automatically established from repository evidence authority",
    });
    return { outcome: PREFLIGHT_OUTCOME.BLOCKED, binding: "RECOVERY_PROOF_BINDING = DESIGN_DEPENDENCY" };
  }

  if (recovery.binding == null || recovery.binding === "UNKNOWN" || recovery.binding === "") {
    findings.push({
      code: PREFLIGHT_REASON.RECOVERY_EVIDENCE_STALE_OR_MISBOUND,
      category: "recovery",
      detail: "recovery-proof binding unknown",
    });
    return { outcome: PREFLIGHT_OUTCOME.BLOCKED, binding: "RECOVERY_PROOF_BINDING = UNKNOWN" };
  }

  if (recovery.checkpointPresent !== true) {
    findings.push({ code: PREFLIGHT_REASON.RECOVERY_PROOF_MISSING, category: "recovery" });
    return { outcome: PREFLIGHT_OUTCOME.BLOCKED, binding: recovery.binding };
  }
  if (recovery.integrityVerified !== true) {
    findings.push({ code: PREFLIGHT_REASON.RECOVERY_INTEGRITY_UNVERIFIED, category: "recovery" });
    return { outcome: PREFLIGHT_OUTCOME.BLOCKED, binding: recovery.binding };
  }
  if (recovery.restoreProofPresent !== true) {
    findings.push({ code: PREFLIGHT_REASON.RECOVERY_RESTORE_PROOF_MISSING, category: "recovery" });
    return { outcome: PREFLIGHT_OUTCOME.BLOCKED, binding: recovery.binding };
  }
  if (
    recovery.recoveryPointIdentifiable !== true ||
    recovery.rollbackPlanSuitable !== true ||
    recovery.stagingBound !== true ||
    recovery.freshnessOk !== true
  ) {
    findings.push({ code: PREFLIGHT_REASON.RECOVERY_EVIDENCE_STALE_OR_MISBOUND, category: "recovery" });
    return { outcome: PREFLIGHT_OUTCOME.BLOCKED, binding: recovery.binding };
  }

  if (!Array.isArray(recovery.evidenceRecords)) {
    findings.push({
      code: PREFLIGHT_REASON.RECOVERY_INTEGRITY_UNVERIFIED,
      category: "recovery",
      detail: "recovery evidence records are required; booleans alone are not proof",
    });
    return { outcome: PREFLIGHT_OUTCOME.BLOCKED, binding: recovery.binding };
  }

  {
    const stagingRecords = recovery.evidenceRecords.filter((record) => {
      const parsed = validateEvidence(record);
      if (!parsed.ok) return false;
      return parsed.evidence.sourceEnvironmentClassification === ENVIRONMENT_CLASSIFICATION.STAGING;
    });
    if (stagingRecords.length === 0) {
      findings.push({
        code: PREFLIGHT_REASON.RECOVERY_EVIDENCE_STALE_OR_MISBOUND,
        category: "recovery",
        detail: "no staging-classified recovery evidence",
      });
      return { outcome: PREFLIGHT_OUTCOME.BLOCKED, binding: recovery.binding };
    }
    const chain = evaluateStagingRecoveryChain({
      records: recovery.evidenceRecords,
      observation: recovery.checkpointObservation,
      now: recovery.evaluatedAt,
      source,
    });
    if (chain.outcome !== "PASS" || chain.operationalAuthority !== false) {
      const reason = chain.reasonCodes[0];
      findings.push({
        code: preflightReasonForCheckpoint(reason),
        category: "recovery",
        detail: chain.reasonCodes.join(","),
      });
      return { outcome: PREFLIGHT_OUTCOME.BLOCKED, binding: recovery.binding };
    }
    const anyQualifying = stagingRecords.some((record) => evaluateQualifyingRecoveryProof(record).ok);
    if (!anyQualifying) {
      findings.push({
        code: PREFLIGHT_REASON.RECOVERY_INTEGRITY_UNVERIFIED,
        category: "recovery",
        detail: "staging evidence present but not qualifying recovery proof",
      });
      return { outcome: PREFLIGHT_OUTCOME.BLOCKED, binding: recovery.binding };
    }
  }

  return { outcome: PREFLIGHT_OUTCOME.PASS, binding: recovery.binding };
}

/**
 * @param {string | undefined} reason
 */
function preflightReasonForCheckpoint(reason) {
  if (
    reason === STAGING_CHECKPOINT_REASON.NO_EVIDENCE ||
    reason === STAGING_CHECKPOINT_REASON.BACKUP_ONLY
  ) {
    return PREFLIGHT_REASON.RECOVERY_PROOF_MISSING;
  }
  if (
    reason === STAGING_CHECKPOINT_REASON.RESTORE_ONLY ||
    reason === STAGING_CHECKPOINT_REASON.FAILED_OR_INTERRUPTED_RESTORE
  ) {
    return PREFLIGHT_REASON.RECOVERY_RESTORE_PROOF_MISSING;
  }
  if (reason === STAGING_CHECKPOINT_REASON.WRONG_ARTIFACT_CHECKSUM) {
    return PREFLIGHT_REASON.RECOVERY_INTEGRITY_UNVERIFIED;
  }
  return PREFLIGHT_REASON.RECOVERY_EVIDENCE_STALE_OR_MISBOUND;
}

function evaluateSecurity(security, source, findings) {
  if (!security || typeof security !== "object") {
    findings.push({ code: PREFLIGHT_REASON.SECURITY_EVIDENCE_MISSING, category: "security", detail: "missing security evidence" });
    return PREFLIGHT_OUTCOME.UNKNOWN;
  }
  if (security.issue409RiskWaived !== false) {
    findings.push({
      code: security.issue409RiskWaived === true ? PREFLIGHT_REASON.SECURITY_RISK_WAIVED : PREFLIGHT_REASON.SECURITY_EVIDENCE_MISSING,
      category: "security",
      detail: "issue 409 waiver must be explicitly false",
    });
    return security.issue409RiskWaived === true ? PREFLIGHT_OUTCOME.BLOCKED : PREFLIGHT_OUTCOME.UNKNOWN;
  }
  // Image-security proof is never optional. An unchecked/omitted "required"
  // boolean must not authorize PASS without independently present correlation.
  if (security.imageSecurityEvidencePresent !== true) {
    findings.push({
      code: PREFLIGHT_REASON.SECURITY_EVIDENCE_MISSING,
      category: "security",
      detail: "image security evidence must be independently present",
    });
    return PREFLIGHT_OUTCOME.BLOCKED;
  }
  const shaBound = isFullGitSha(security.boundSourceSha) && security.boundSourceSha === source?.head;
  const treeBound = isFullGitSha(security.boundSourceTree) && security.boundSourceTree === source?.tree;
  const imagesBound = sameBoundImages(security.boundImages, security.observedImages);
  if (!shaBound || !treeBound || !imagesBound || security.scanPassed !== true) {
    findings.push({
      code: PREFLIGHT_REASON.IMAGE_SECURITY_NOT_BOUND,
      category: "security",
      detail: "image security evidence is not bound to this candidate SHA, tree, image id, and digest",
    });
    return PREFLIGHT_OUTCOME.BLOCKED;
  }
  if (security.sourceImageCorrelated !== true) {
    findings.push({ code: PREFLIGHT_REASON.SECURITY_EVIDENCE_MISSING, category: "security", detail: "source/image identity not correlated" });
    return PREFLIGHT_OUTCOME.BLOCKED;
  }
  return PREFLIGHT_OUTCOME.PASS;
}

function evaluateCapacity(capacity, findings) {
  if (!capacity || typeof capacity !== "object") {
    findings.push({
      code: PREFLIGHT_REASON.CAPACITY_OR_PRESERVATION_UNSAFE,
      category: "capacity",
      detail: "missing capacity evidence",
    });
    return PREFLIGHT_OUTCOME.UNKNOWN;
  }
  const measured = [
    capacity.diskSufficient,
    capacity.memorySufficient,
    capacity.priorImagesPreserved,
    capacity.unintendedPostgresReplacement,
  ];
  if (measured.some((value) => value !== true && value !== false)) {
    findings.push({
      code: PREFLIGHT_REASON.CAPACITY_OR_PRESERVATION_UNSAFE,
      category: "capacity",
      detail: "capacity evidence was not measured",
    });
    return PREFLIGHT_OUTCOME.UNKNOWN;
  }
  const ok =
    capacity.diskSufficient === true &&
    capacity.memorySufficient === true &&
    capacity.priorImagesPreserved === true &&
    capacity.unintendedPostgresReplacement === false;
  if (!ok) {
    findings.push({ code: PREFLIGHT_REASON.CAPACITY_OR_PRESERVATION_UNSAFE, category: "capacity" });
    return PREFLIGHT_OUTCOME.BLOCKED;
  }
  return PREFLIGHT_OUTCOME.PASS;
}

function evaluatePostgresInit(postgresInit, findings) {
  if (!postgresInit || typeof postgresInit !== "object") {
    findings.push({
      code: PREFLIGHT_REASON.POSTGRES_INIT_NOT_PRESERVABLE,
      category: "postgresInit",
      detail: "missing postgres init disposition",
    });
    return PREFLIGHT_OUTCOME.UNKNOWN;
  }
  if (postgresInit.disposition === POSTGRES_INIT_DISPOSITION.PRESERVE) {
    return PREFLIGHT_OUTCOME.PASS;
  }
  findings.push({
    code: PREFLIGHT_REASON.POSTGRES_INIT_NOT_PRESERVABLE,
    category: "postgresInit",
    detail: postgresInit.reasonCode,
  });
  if (postgresInit.disposition === POSTGRES_INIT_DISPOSITION.UNKNOWN) {
    return PREFLIGHT_OUTCOME.UNKNOWN;
  }
  return PREFLIGHT_OUTCOME.BLOCKED;
}

function syntheticCheckpointRecovery() {
  const fixture = syntheticIsolatedCheckpointFixture({
    now: new Date("2026-10-29T10:00:00.000Z"),
    candidateSha: "a".repeat(40),
    candidateTree: "b".repeat(40),
  });
  return {
    evidenceRecords: fixture.records,
    checkpointObservation: fixture.observation,
    evaluatedAt: fixture.now.toISOString(),
  };
}

/**
 * Construct a fully valid evidence object for isolated tests only.
 * Not an operator bypass — production probes must independently establish each field.
 * Keep test-only synthetic PASS fixtures separate from live trusted-probe authority.
 */
export function validPreflightEvidence(overrides = {}) {
  return {
    source: {
      repositoryIdentity: EXPECTED_REPOSITORY_IDENTITY,
      branch: "main",
      head: "a".repeat(40),
      originMain: "a".repeat(40),
      tree: "b".repeat(40),
      originMainTree: "b".repeat(40),
      trackedDirty: "",
      protectedCheckoutUsed: false,
      isolatedArtifactContextVerified: true,
      artifactContextInsideProtectedRoot: false,
      authoritativeSourceRoot: PROTECTED_PRIMARY_REPOSITORY,
      githubMainMatchesHead: true,
      ...(overrides.source ?? {}),
    },
    publishing: {
      deployWorkflowState: "disabled_manually",
      pagesSourceKnown: true,
      unsafeActivePublishingPath: false,
      ...(overrides.publishing ?? {}),
    },
    runtime: {
      evidenceComplete: true,
      identityUnknown: false,
      podmanRootless: true,
      composeProject: "boba-staging",
      postgresContainer: "boba-staging_postgres_1",
      postgresVolume: "boba-staging_postgres-data",
      unexpectedTarget: false,
      ...(overrides.runtime ?? {}),
    },
    environment: {
      requiredEnvFilesPresent: true,
      projectedConfigValid: true,
      projectedConfigState: "VALID",
      diagnosticProjectionKnown: true,
      diagnosticEnabled: false,
      diagnosticConflict: false,
      bobaBearEnvDrift: false,
      secretsPrinted: false,
      secretModesSecure: true,
      unsafeAdaptersExplicitlyFalse: true,
      paymentIsolation: "DISABLED",
      ...(overrides.environment ?? {}),
    },
    database: {
      migrationIdentityKnown: true,
      migrationLedgerState: "APPLIED_CURRENT",
      baselineCompatibility: "COMPLETE_COMPATIBLE",
      unexplainedPendingMutation: false,
      authAccountUniquenessKnown: true,
      duplicateAuthAccountGroupCount: 0,
      ...(overrides.database ?? {}),
    },
    recovery: {
      checkpointPresent: true,
      integrityVerified: true,
      restoreProofPresent: true,
      recoveryPointIdentifiable: true,
      rollbackPlanSuitable: true,
      stagingBound: true,
      freshnessOk: true,
      bindingDesignDependency: false,
      binding: "BOUND",
      ...syntheticCheckpointRecovery(),
      ...(overrides.recovery ?? {}),
    },
    security: {
      imageSecurityEvidenceRequired: true,
      imageSecurityEvidencePresent: true,
      issue409RiskWaived: false,
      sourceImageCorrelated: true,
      boundSourceSha: "a".repeat(40),
      boundSourceTree: "b".repeat(40),
      boundImages: syntheticBoundImages(),
      observedImages: syntheticBoundImages(),
      scanPassed: true,
      evidenceSchema: "staging-image-security-v1",
      ...(overrides.security ?? {}),
    },
    capacity: {
      diskSufficient: true,
      memorySufficient: true,
      priorImagesPreserved: true,
      unintendedPostgresReplacement: false,
      ...(overrides.capacity ?? {}),
    },
    postgresInit: {
      disposition: POSTGRES_INIT_DISPOSITION.PRESERVE,
      reasonCode: "POSTGRES_INIT_SAME_CONTENT_SAME_PATH",
      ...(overrides.postgresInit ?? {}),
    },
    ...Object.fromEntries(
      Object.entries(overrides).filter(([key]) =>
        ![
          "source",
          "publishing",
          "runtime",
          "environment",
          "database",
          "recovery",
          "security",
          "capacity",
          "postgresInit",
        ].includes(key),
      ),
    ),
  };
}
