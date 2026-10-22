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
 */
import { ENVIRONMENT_CLASSIFICATION } from "../recovery/constants.mjs";
import { evaluateQualifyingRecoveryProof, validateEvidence } from "../recovery/evidence.mjs";
import { POSTGRES_INIT_DISPOSITION } from "./postgres-init-identity.mjs";

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
  DATABASE_STATE_UNKNOWN_OR_UNSAFE: "DATABASE_STATE_UNKNOWN_OR_UNSAFE",
  BASELINE_INCOMPATIBLE_OR_UNKNOWN: "BASELINE_INCOMPATIBLE_OR_UNKNOWN",
  RECOVERY_PROOF_MISSING: "RECOVERY_PROOF_MISSING",
  RECOVERY_INTEGRITY_UNVERIFIED: "RECOVERY_INTEGRITY_UNVERIFIED",
  RECOVERY_RESTORE_PROOF_MISSING: "RECOVERY_RESTORE_PROOF_MISSING",
  RECOVERY_EVIDENCE_STALE_OR_MISBOUND: "RECOVERY_EVIDENCE_STALE_OR_MISBOUND",
  RECOVERY_PROOF_BINDING_DESIGN_DEPENDENCY: "RECOVERY_PROOF_BINDING_DESIGN_DEPENDENCY",
  SECURITY_EVIDENCE_MISSING: "SECURITY_EVIDENCE_MISSING",
  SECURITY_RISK_WAIVED: "SECURITY_RISK_WAIVED",
  CAPACITY_OR_PRESERVATION_UNSAFE: "CAPACITY_OR_PRESERVATION_UNSAFE",
  POSTGRES_INIT_NOT_PRESERVABLE: "POSTGRES_INIT_NOT_PRESERVABLE",
  PROBE_FAILURE: "PROBE_FAILURE",
  EVIDENCE_MALFORMED: "EVIDENCE_MALFORMED",
});

/**
 * @typedef {"PASS"|"BLOCKED"|"UNKNOWN"} PreflightOutcome
 * @typedef {{ code: string, category: string, detail?: string }} PreflightFinding
 */

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
  if (e.ready === true || e.bypass === true || e.forceDeploy === true || e.approved === true) {
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
  const recovery = evaluateRecovery(e.recovery, findings);
  categories.recovery = recovery.outcome;
  categories.security = evaluateSecurity(e.security, findings);
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
  if (e.ready === true || e.bypass === true || e.forceDeploy === true || e.approved === true) {
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

function evaluateSource(source, findings) {
  if (!source || typeof source !== "object") {
    findings.push({ code: PREFLIGHT_REASON.SOURCE_AUTHORITY_INVALID, category: "source", detail: "missing source evidence" });
    return PREFLIGHT_OUTCOME.UNKNOWN;
  }
  const branchOk = source.branch === "main";
  const shaOk =
    typeof source.head === "string" &&
    /^[0-9a-f]{40}$/.test(source.head) &&
    source.head === source.originMain;
  const treeOk =
    source.tree == null ||
    (typeof source.tree === "string" &&
      /^[0-9a-f]{40}$/.test(source.tree) &&
      (source.originMainTree == null || source.tree === source.originMainTree));
  const clean = source.trackedDirty === "" || source.trackedDirty == null;
  const notProtected = source.protectedCheckoutUsed !== true;
  const repoOk =
    source.repositoryIdentity == null ||
    source.repositoryIdentity === "nivedhya11/BobaBear" ||
    source.repositoryIdentity === "VERIFIED";

  if (!branchOk || !shaOk || !clean || !notProtected || !repoOk) {
    findings.push({
      code: !shaOk || !treeOk ? PREFLIGHT_REASON.SOURCE_SHA_TREE_DRIFT : PREFLIGHT_REASON.SOURCE_DIRTY_OR_PROTECTED,
      category: "source",
    });
    return PREFLIGHT_OUTCOME.BLOCKED;
  }
  if (!treeOk) {
    findings.push({ code: PREFLIGHT_REASON.SOURCE_SHA_TREE_DRIFT, category: "source" });
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
  const ok =
    runtime.podmanRootless === true &&
    runtime.composeProject === "boba-staging" &&
    runtime.postgresContainer === "boba-staging_postgres_1" &&
    runtime.postgresVolume === "boba-staging_postgres-data" &&
    runtime.unexpectedTarget !== true;
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
  if (environment.diagnosticEnabled === true) {
    findings.push({
      code: PREFLIGHT_REASON.DIAGNOSTIC_UNEXPECTEDLY_ENABLED,
      category: "environment",
      detail: "Gate 2 deploy path requires diagnostic observer disabled",
    });
    return PREFLIGHT_OUTCOME.BLOCKED;
  }
  const ok =
    environment.requiredEnvFilesPresent === true &&
    environment.projectedConfigValid === true &&
    environment.diagnosticEnabled === false &&
    environment.bobaBearEnvDrift !== true &&
    environment.secretsPrinted !== true;
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
  if (database.migrationLedgerState === "UNKNOWN" || database.migrationIdentityKnown !== true) {
    findings.push({ code: PREFLIGHT_REASON.DATABASE_STATE_UNKNOWN_OR_UNSAFE, category: "database" });
    return PREFLIGHT_OUTCOME.UNKNOWN;
  }
  if (
    database.migrationLedgerState === "PENDING_UNEXPLAINED" ||
    database.migrationLedgerState === "DESTRUCTIVE_PENDING" ||
    database.unexplainedPendingMutation === true
  ) {
    findings.push({ code: PREFLIGHT_REASON.DATABASE_STATE_UNKNOWN_OR_UNSAFE, category: "database" });
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

function evaluateRecovery(recovery, findings) {
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

  if (Array.isArray(recovery.evidenceRecords)) {
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

  return { outcome: PREFLIGHT_OUTCOME.PASS, binding: recovery.binding ?? "BOUND" };
}

function evaluateSecurity(security, findings) {
  if (!security || typeof security !== "object") {
    findings.push({ code: PREFLIGHT_REASON.SECURITY_EVIDENCE_MISSING, category: "security", detail: "missing security evidence" });
    return PREFLIGHT_OUTCOME.UNKNOWN;
  }
  if (security.issue409RiskWaived === true) {
    findings.push({ code: PREFLIGHT_REASON.SECURITY_RISK_WAIVED, category: "security" });
    return PREFLIGHT_OUTCOME.BLOCKED;
  }
  if (security.imageSecurityEvidenceRequired === true && security.imageSecurityEvidencePresent !== true) {
    findings.push({ code: PREFLIGHT_REASON.SECURITY_EVIDENCE_MISSING, category: "security" });
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
  const ok =
    capacity.diskSufficient === true &&
    capacity.memorySufficient === true &&
    capacity.priorImagesPreserved === true &&
    capacity.unintendedPostgresReplacement !== true;
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

/**
 * Construct a fully valid evidence object for isolated tests only.
 * Not an operator bypass — production probes must independently establish each field.
 */
export function validPreflightEvidence(overrides = {}) {
  return {
    source: {
      repositoryIdentity: "nivedhya11/BobaBear",
      branch: "main",
      head: "a".repeat(40),
      originMain: "a".repeat(40),
      tree: "b".repeat(40),
      originMainTree: "b".repeat(40),
      trackedDirty: "",
      protectedCheckoutUsed: false,
      ...(overrides.source ?? {}),
    },
    publishing: {
      deployWorkflowState: "disabled_manually",
      pagesSourceKnown: true,
      unsafeActivePublishingPath: false,
      ...(overrides.publishing ?? {}),
    },
    runtime: {
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
      diagnosticEnabled: false,
      bobaBearEnvDrift: false,
      secretsPrinted: false,
      ...(overrides.environment ?? {}),
    },
    database: {
      migrationIdentityKnown: true,
      migrationLedgerState: "KNOWN",
      baselineCompatibility: "COMPLETE_COMPATIBLE",
      unexplainedPendingMutation: false,
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
      ...(overrides.recovery ?? {}),
    },
    security: {
      imageSecurityEvidenceRequired: true,
      imageSecurityEvidencePresent: true,
      issue409RiskWaived: false,
      sourceImageCorrelated: true,
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
