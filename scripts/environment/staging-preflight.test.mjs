import assert from "node:assert/strict";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { test } from "node:test";

import {
  assertPreflightAllowsDeployment,
  evaluateStagingDeployPreflight,
  PREFLIGHT_OUTCOME,
  PREFLIGHT_REASON,
  validPreflightEvidence,
} from "./staging-preflight.mjs";
import { POSTGRES_INIT_DISPOSITION } from "./postgres-init-identity.mjs";
import {
  gatherStagingPreflightEvidence,
  readStagingDiagnosticEnabled,
  probeStagingRuntimeIdentity,
  runStagingDeploy,
} from "./staging.mjs";

const FORBIDDEN_OPERATIONAL_EFFECTS = [
  "stopLegacyRuntimeIfNeeded",
  "materializeExactGitTree",
  "ensureStagingEnvFiles",
  "composeBuild",
  "migrate",
  "decideAndApplyStagingBootstrap",
  "upAndWait",
  "ensurePersistentPostgres",
];

function assertZeroOperationalEffects(evidence) {
  const effects = [];
  assert.throws(
    () =>
      runStagingDeploy(
        {
          branch: "main",
          head: "a".repeat(40),
          originMain: "a".repeat(40),
          trackedDirty: "",
          fingerprint: "f".repeat(64),
        },
        {
          effects,
          assertPreconditions: () => {},
          gather: () => evidence,
          stopLegacy: () => {
            effects.push("stopLegacyRuntimeIfNeeded");
          },
          materializeTree: () => {
            effects.push("materializeExactGitTree");
            return "/tmp/should-not-exist-boba-staging-build";
          },
          ensureEnv: () => {
            effects.push("ensureStagingEnvFiles");
          },
          compose: () => {
            effects.push("composeBuild");
          },
          assertImages: () => {},
          resolveInitMount: () => {
            effects.push("resolveStagingPostgresInitMount");
            return {
              disposition: {
                disposition: POSTGRES_INIT_DISPOSITION.PRESERVE,
                reasonCode: "TEST",
                composeInitDir: "/tmp/init",
                preserveMountSource: "/tmp/init",
              },
            };
          },
          materializeInit: () => {
            effects.push("materializeStagingPostgresInit");
          },
          ensurePostgres: () => {
            effects.push("ensurePersistentPostgres");
            return { initDir: "/tmp/init" };
          },
          decideBootstrap: () => {
            effects.push("decideAndApplyStagingBootstrap");
          },
          upWait: () => {
            effects.push("upAndWait");
          },
          smoke: () => {},
          reportProvenance: () => true,
          removeDir: () => {},
          log: () => {},
          spawn: () => ({ status: 0 }),
        },
      ),
    /preflight/i,
  );
  assert.ok(effects.includes("preflightBlocked"));
  for (const name of FORBIDDEN_OPERATIONAL_EFFECTS) {
    assert.equal(effects.includes(name), false, `unexpected side effect ${name}: ${effects.join(",")}`);
  }
}

function assertBlocked(decision, reasonCode) {
  assert.equal(decision.outcome, PREFLIGHT_OUTCOME.BLOCKED);
  assert.ok(
    decision.findings.some((f) => f.code === reasonCode),
    `expected finding ${reasonCode}, got ${decision.findings.map((f) => f.code).join(",")}`,
  );
}

test("P01: all required fake evidence valid -> PASS", () => {
  const decision = evaluateStagingDeployPreflight(validPreflightEvidence());
  assert.equal(decision.outcome, PREFLIGHT_OUTCOME.PASS);
});

test("P02: backup absent -> BLOCK", () => {
  assertBlocked(
    evaluateStagingDeployPreflight(validPreflightEvidence({ recovery: { checkpointPresent: false } })),
    PREFLIGHT_REASON.RECOVERY_PROOF_MISSING,
  );
});

test("P03: backup present but integrity unverified -> BLOCK", () => {
  assertBlocked(
    evaluateStagingDeployPreflight(validPreflightEvidence({ recovery: { integrityVerified: false } })),
    PREFLIGHT_REASON.RECOVERY_INTEGRITY_UNVERIFIED,
  );
});

test("P04: restore proof missing -> BLOCK", () => {
  assertBlocked(
    evaluateStagingDeployPreflight(validPreflightEvidence({ recovery: { restoreProofPresent: false } })),
    PREFLIGHT_REASON.RECOVERY_RESTORE_PROOF_MISSING,
  );
});

test("P05: stale or wrong-candidate evidence -> BLOCK", () => {
  assertBlocked(
    evaluateStagingDeployPreflight(
      validPreflightEvidence({ recovery: { freshnessOk: false, stagingBound: false } }),
    ),
    PREFLIGHT_REASON.RECOVERY_EVIDENCE_STALE_OR_MISBOUND,
  );
});

test("P06: unknown/partial migration state -> BLOCK", () => {
  assertBlocked(
    evaluateStagingDeployPreflight(
      validPreflightEvidence({
        database: { migrationIdentityKnown: false, migrationLedgerState: "UNKNOWN" },
      }),
    ),
    PREFLIGHT_REASON.DATABASE_STATE_UNKNOWN_OR_UNSAFE,
  );
});

test("P07: baseline incompatible or unknown -> BLOCK", () => {
  assertBlocked(
    evaluateStagingDeployPreflight(
      validPreflightEvidence({ database: { baselineCompatibility: "PARTIAL_OR_INCOMPATIBLE" } }),
    ),
    PREFLIGHT_REASON.BASELINE_INCOMPATIBLE_OR_UNKNOWN,
  );
  assertBlocked(
    evaluateStagingDeployPreflight(
      validPreflightEvidence({ database: { baselineCompatibility: "UNKNOWN" } }),
    ),
    PREFLIGHT_REASON.BASELINE_INCOMPATIBLE_OR_UNKNOWN,
  );
});

test("P08: wrong project / wrong Podman context -> BLOCK", () => {
  assertBlocked(
    evaluateStagingDeployPreflight(
      validPreflightEvidence({
        runtime: { composeProject: "other", podmanRootless: false },
      }),
    ),
    PREFLIGHT_REASON.RUNTIME_IDENTITY_INVALID,
  );
});

test("P09: source SHA/tree drift -> BLOCK", () => {
  assertBlocked(
    evaluateStagingDeployPreflight(
      validPreflightEvidence({
        source: { head: "a".repeat(40), originMain: "c".repeat(40) },
      }),
    ),
    PREFLIGHT_REASON.SOURCE_SHA_TREE_DRIFT,
  );
});

test("P10: publishing state unknown/unsafe -> BLOCK", () => {
  assertBlocked(
    evaluateStagingDeployPreflight(
      validPreflightEvidence({
        publishing: { deployWorkflowState: "active", pagesSourceKnown: false, unsafeActivePublishingPath: true },
      }),
    ),
    PREFLIGHT_REASON.PUBLISHING_UNSAFE_OR_UNKNOWN,
  );
});

test("P11: diagnostic unexpectedly enabled -> BLOCK for Gate 2 path", () => {
  assertBlocked(
    evaluateStagingDeployPreflight(validPreflightEvidence({ environment: { diagnosticEnabled: true } })),
    PREFLIGHT_REASON.DIAGNOSTIC_UNEXPECTEDLY_ENABLED,
  );
});

test("P12: probe throws/times out/malformed -> BLOCK", () => {
  assertBlocked(
    evaluateStagingDeployPreflight({ probeError: true, probeDetail: "timeout" }),
    PREFLIGHT_REASON.PROBE_FAILURE,
  );
  assertBlocked(evaluateStagingDeployPreflight(null), PREFLIGHT_REASON.EVIDENCE_MALFORMED);
});

test("operator ready/bypass flags cannot force PASS", () => {
  const decision = evaluateStagingDeployPreflight(validPreflightEvidence({ ready: true, bypass: true }));
  assert.equal(decision.outcome, PREFLIGHT_OUTCOME.BLOCKED);
});

test("recovery design dependency blocks without inventing alternate authority", () => {
  const decision = evaluateStagingDeployPreflight(
    validPreflightEvidence({ recovery: { bindingDesignDependency: true } }),
  );
  assertBlocked(decision, PREFLIGHT_REASON.RECOVERY_PROOF_BINDING_DESIGN_DEPENDENCY);
  assert.match(decision.recoveryProofBinding ?? "", /DESIGN_DEPENDENCY/);
});

test("negative preflight paths invoke zero operational side effects in runStagingDeploy", () => {
  const cases = [
    validPreflightEvidence({ recovery: { checkpointPresent: false } }),
    validPreflightEvidence({ recovery: { integrityVerified: false } }),
    validPreflightEvidence({ recovery: { restoreProofPresent: false } }),
    validPreflightEvidence({ source: { head: "a".repeat(40), originMain: "d".repeat(40) } }),
    validPreflightEvidence({ runtime: { composeProject: "wrong" } }),
    validPreflightEvidence({ environment: { diagnosticEnabled: true } }),
    validPreflightEvidence({
      database: { baselineCompatibility: "PARTIAL_OR_INCOMPATIBLE" },
    }),
    validPreflightEvidence({
      publishing: { deployWorkflowState: "UNKNOWN", pagesSourceKnown: false, unsafeActivePublishingPath: true },
    }),
    { probeTimedOut: true, probeDetail: "podman inspect timeout" },
  ];

  for (const evidence of cases) {
    const effects = [];
    const forbidden = [
      "stopLegacyRuntimeIfNeeded",
      "materializeExactGitTree",
      "ensureStagingEnvFiles",
      "composeBuild",
      "migrate",
      "decideAndApplyStagingBootstrap",
      "upAndWait",
      "ensurePersistentPostgres",
    ];
    assert.throws(
      () =>
        runStagingDeploy(
          {
            branch: "main",
            head: "a".repeat(40),
            originMain: "a".repeat(40),
            trackedDirty: "",
            fingerprint: "f".repeat(64),
          },
          {
            effects,
            assertPreconditions: () => {},
            gather: () => evidence,
            stopLegacy: () => {
              effects.push("stopLegacyRuntimeIfNeeded");
            },
            materializeTree: () => {
              effects.push("materializeExactGitTree");
              return "/tmp/should-not-exist-boba-staging-build";
            },
            ensureEnv: () => {
              effects.push("ensureStagingEnvFiles");
            },
            compose: () => {
              effects.push("composeBuild");
            },
            assertImages: () => {},
            resolveInitMount: () => {
              effects.push("resolveStagingPostgresInitMount");
              return {
                disposition: {
                  disposition: POSTGRES_INIT_DISPOSITION.PRESERVE,
                  reasonCode: "TEST",
                  composeInitDir: "/tmp/init",
                  preserveMountSource: "/tmp/init",
                },
              };
            },
            materializeInit: () => {
              effects.push("materializeStagingPostgresInit");
            },
            ensurePostgres: () => {
              effects.push("ensurePersistentPostgres");
              return { initDir: "/tmp/init" };
            },
            decideBootstrap: () => {
              effects.push("decideAndApplyStagingBootstrap");
            },
            upWait: () => {
              effects.push("upAndWait");
            },
            smoke: () => {},
            reportProvenance: () => true,
            removeDir: () => {},
            log: () => {},
            spawn: () => ({ status: 0 }),
          },
        ),
      /preflight/i,
    );
    assert.ok(effects.includes("verifyPreMutationReadiness") || effects.includes("assertDeployPreconditions"));
    assert.ok(effects.includes("preflightBlocked"));
    for (const name of forbidden) {
      assert.equal(effects.includes(name), false, `unexpected side effect ${name}: ${effects.join(",")}`);
    }
  }
});

test("assertPreflightAllowsDeployment only accepts PASS", () => {
  assert.doesNotThrow(() => assertPreflightAllowsDeployment({ outcome: PREFLIGHT_OUTCOME.PASS }));
  assert.throws(() => assertPreflightAllowsDeployment({ outcome: PREFLIGHT_OUTCOME.BLOCKED }), /preflight/i);
  assert.throws(() => assertPreflightAllowsDeployment({ outcome: PREFLIGHT_OUTCOME.UNKNOWN }), /preflight/i);
});

test("R01: missing source tree -> BLOCK with zero operational effects", () => {
  const evidence = validPreflightEvidence({ source: { tree: undefined, originMainTree: "b".repeat(40) } });
  // validPreflightEvidence spreads overrides; force absence after merge
  delete evidence.source.tree;
  assertBlocked(evaluateStagingDeployPreflight(evidence), PREFLIGHT_REASON.SOURCE_SHA_TREE_DRIFT);
  assertZeroOperationalEffects(evidence);
});

test("R02: missing repository identity -> BLOCK with zero operational effects", () => {
  const evidence = validPreflightEvidence({ source: { repositoryIdentity: undefined } });
  delete evidence.source.repositoryIdentity;
  assertBlocked(evaluateStagingDeployPreflight(evidence), PREFLIGHT_REASON.SOURCE_AUTHORITY_INVALID);
  assertZeroOperationalEffects(evidence);
});

test("R03: missing tracked-dirty evidence -> BLOCK with zero operational effects", () => {
  const evidence = validPreflightEvidence({ source: { trackedDirty: undefined } });
  delete evidence.source.trackedDirty;
  assertBlocked(evaluateStagingDeployPreflight(evidence), PREFLIGHT_REASON.SOURCE_DIRTY_OR_PROTECTED);
  assertZeroOperationalEffects(evidence);
});

test("R04: unknown migration state string -> BLOCK with zero operational effects", () => {
  const evidence = validPreflightEvidence({
    database: { migrationIdentityKnown: true, migrationLedgerState: "ARBITRARY_COMPATIBLE_LOOKING" },
  });
  assertBlocked(evaluateStagingDeployPreflight(evidence), PREFLIGHT_REASON.DATABASE_STATE_UNKNOWN_OR_UNSAFE);
  assertZeroOperationalEffects(evidence);
});

test("R05: security evidence omitted -> BLOCK even when required flag unchecked", () => {
  const evidence = validPreflightEvidence({
    security: {
      imageSecurityEvidenceRequired: false,
      imageSecurityEvidencePresent: false,
      sourceImageCorrelated: true,
    },
  });
  assertBlocked(evaluateStagingDeployPreflight(evidence), PREFLIGHT_REASON.SECURITY_EVIDENCE_MISSING);
  assertZeroOperationalEffects(evidence);
});

test("R06: diagnostic=true in commerce env while absent from runtime -> BLOCK", () => {
  const tmp = mkdtempSync(path.join(os.tmpdir(), "boba-diag-r06-"));
  try {
    writeFileSync(path.join(tmp, ".env.runtime.docker.local"), "BOBA_BEAR_ENV=local\n");
    writeFileSync(path.join(tmp, ".env.customer-auth.docker.local"), "CUSTOMER_AUTH_BASE_URL=http://example.invalid\n");
    writeFileSync(
      path.join(tmp, ".env.customer-commerce.docker.local"),
      "BOBA_BEAR_CHECKOUT_PREPARE_DIAGNOSTIC_ENABLED=true\n",
    );
    const diagnostic = readStagingDiagnosticEnabled(tmp, { repositoryRoot: tmp });
    assert.equal(diagnostic.enabled, true);
    assert.equal(diagnostic.projectionKnown, true);
    const evidence = validPreflightEvidence({
      environment: {
        diagnosticEnabled: diagnostic.enabled,
        diagnosticProjectionKnown: diagnostic.projectionKnown,
        diagnosticConflict: diagnostic.conflict === true,
      },
    });
    assertBlocked(evaluateStagingDeployPreflight(evidence), PREFLIGHT_REASON.DIAGNOSTIC_UNEXPECTEDLY_ENABLED);
    assertZeroOperationalEffects(evidence);
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
});

test("R07: conflicting diagnostic flag values -> BLOCK / never PASS", () => {
  const tmp = mkdtempSync(path.join(os.tmpdir(), "boba-diag-r07-"));
  try {
    writeFileSync(
      path.join(tmp, ".env.runtime.docker.local"),
      "BOBA_BEAR_CHECKOUT_PREPARE_DIAGNOSTIC_ENABLED=true\n",
    );
    writeFileSync(path.join(tmp, ".env.customer-auth.docker.local"), "X=1\n");
    writeFileSync(
      path.join(tmp, ".env.customer-commerce.docker.local"),
      "BOBA_BEAR_CHECKOUT_PREPARE_DIAGNOSTIC_ENABLED=false\n",
    );
    const diagnostic = readStagingDiagnosticEnabled(tmp, { repositoryRoot: tmp });
    assert.equal(diagnostic.invalid, true);
    assert.equal(diagnostic.conflict, true);
    assert.equal(diagnostic.projectionKnown, false);
    const evidence = validPreflightEvidence({
      environment: {
        diagnosticEnabled: diagnostic.enabled === true,
        diagnosticConflict: true,
        diagnosticProjectionKnown: false,
        projectedConfigValid: true,
        projectedConfigState: "VALID",
      },
    });
    const decision = evaluateStagingDeployPreflight(evidence);
    assert.equal(decision.outcome, PREFLIGHT_OUTCOME.BLOCKED);
    assertZeroOperationalEffects(evidence);
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
});

test("R08: unreadable or malformed projected env -> BLOCK / UNKNOWN never PASS", () => {
  const tmp = mkdtempSync(path.join(os.tmpdir(), "boba-diag-r08-"));
  try {
    writeFileSync(
      path.join(tmp, ".env.runtime.docker.local"),
      "BOBA_BEAR_CHECKOUT_PREPARE_DIAGNOSTIC_ENABLED=true\nBOBA_BEAR_CHECKOUT_PREPARE_DIAGNOSTIC_ENABLED=false\n",
    );
    writeFileSync(path.join(tmp, ".env.customer-auth.docker.local"), "X=1\n");
    writeFileSync(path.join(tmp, ".env.customer-commerce.docker.local"), "Y=1\n");
    const diagnostic = readStagingDiagnosticEnabled(tmp, { repositoryRoot: tmp });
    assert.equal(diagnostic.invalid, true);
    const evidence = validPreflightEvidence({
      environment: {
        projectedConfigValid: false,
        projectedConfigState: "UNKNOWN",
        diagnosticProjectionKnown: false,
        diagnosticConflict: true,
        diagnosticEnabled: true,
      },
    });
    const decision = evaluateStagingDeployPreflight(evidence);
    assert.equal(decision.outcome, PREFLIGHT_OUTCOME.BLOCKED);
    assert.ok(
      decision.findings.some(
        (f) =>
          f.code === PREFLIGHT_REASON.PROJECTED_CONFIG_UNKNOWN ||
          f.code === PREFLIGHT_REASON.DIAGNOSTIC_UNEXPECTEDLY_ENABLED ||
          f.code === PREFLIGHT_REASON.ENVIRONMENT_INVALID,
      ),
    );
    assertZeroOperationalEffects(evidence);
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
});

test("R09: missing Podman-rootless proof -> BLOCK with zero operational effects", () => {
  const runtime = probeStagingRuntimeIdentity({
    uid: 0,
    exists: () => true,
    inspect: () => {
      throw new Error("must not inspect when not rootless");
    },
  });
  assert.equal(runtime.podmanRootless, false);
  assert.equal(runtime.identityUnknown, true);
  const evidence = validPreflightEvidence({
    runtime: {
      evidenceComplete: runtime.evidenceComplete,
      identityUnknown: runtime.identityUnknown,
      podmanRootless: runtime.podmanRootless,
      composeProject: runtime.composeProject,
      postgresContainer: runtime.postgresContainer,
      postgresVolume: runtime.postgresVolume,
      unexpectedTarget: runtime.unexpectedTarget,
    },
  });
  assertBlocked(evaluateStagingDeployPreflight(evidence), PREFLIGHT_REASON.RUNTIME_IDENTITY_INVALID);
  assertZeroOperationalEffects(evidence);
});

test("R10: unknown recovery-proof binding -> BLOCK with zero operational effects", () => {
  const evidence = validPreflightEvidence({
    recovery: { bindingDesignDependency: false, binding: "UNKNOWN" },
  });
  assertBlocked(evaluateStagingDeployPreflight(evidence), PREFLIGHT_REASON.RECOVERY_EVIDENCE_STALE_OR_MISBOUND);
  assertZeroOperationalEffects(evidence);
});

test("R11: live gatherer does not fabricate runtime/project PASS constants", () => {
  const evidence = gatherStagingPreflightEvidence(
    {
      branch: "main",
      head: "a".repeat(40),
      originMain: "a".repeat(40),
      trackedDirty: "",
    },
    {
      treeOf: () => "b".repeat(40),
      requiredEnvFilesPresent: () => true,
      readDiagnostic: () => ({
        enabled: false,
        invalid: false,
        conflict: false,
        projectionKnown: true,
      }),
      probeRuntime: () => ({
        evidenceComplete: false,
        identityUnknown: true,
        podmanRootless: false,
        composeProject: null,
        postgresContainer: null,
        postgresVolume: null,
        unexpectedTarget: null,
      }),
      repositoryIdentityOf: () => "nivedhya11/BobaBear",
      protectedCheckoutUsed: false,
      observeSource: () => ({
        ok: false,
        protectedCheckoutUsed: true,
        isolatedArtifactContextVerified: false,
        artifactContextInsideProtectedRoot: true,
        authoritativeSourceRoot: "/home/ajoshi/repos/boba-bear-platform",
      }),
      readGithubMain: () => ({ ok: false, sha: null }),
      projectConfig: () => ({
        projectedConfigState: "UNKNOWN",
        projectedConfigValid: false,
        publicOrigin: null,
        paymentIsolation: null,
        unsafeAdaptersExplicitlyFalse: false,
        bobaBearEnvDrift: null,
      }),
      resolveInit: () => ({
        disposition: {
          disposition: POSTGRES_INIT_DISPOSITION.UNKNOWN,
          reasonCode: "POSTGRES_INIT_PROBE_NOT_RUN",
        },
      }),
    },
  );
  assert.notEqual(evidence.runtime.composeProject, "boba-staging");
  assert.equal(evidence.runtime.identityUnknown, true);
  assert.notEqual(evidence.environment.projectedConfigState, "VALID");
  assert.equal(evidence.environment.projectedConfigValid, false);
  assert.equal(evidence.security.imageSecurityEvidencePresent, false);
  assert.equal(evidence.security.sourceImageCorrelated, false);
  assert.equal(evidence.database.migrationLedgerState, "UNKNOWN");
  assert.equal(evidence.database.migrationIdentityKnown, false);
  assert.equal(evidence.recovery.bindingDesignDependency, true);
  assert.notEqual(evidence.source.protectedCheckoutUsed, false);
  assert.equal(evidence.source.isolatedArtifactContextVerified, false);
  const decision = evaluateStagingDeployPreflight(evidence);
  assert.equal(decision.outcome, PREFLIGHT_OUTCOME.BLOCKED);
  assertZeroOperationalEffects(evidence);
});

test("R12: protectedCheckoutUsed must be explicitly false (undefined blocks)", () => {
  const evidence = validPreflightEvidence();
  delete evidence.source.protectedCheckoutUsed;
  assertBlocked(evaluateStagingDeployPreflight(evidence), PREFLIGHT_REASON.SOURCE_DIRTY_OR_PROTECTED);
  assertZeroOperationalEffects(evidence);
});

test("source privacy: diagnostic projection never returns raw secret values", () => {
  const tmp = mkdtempSync(path.join(os.tmpdir(), "boba-diag-privacy-"));
  try {
    writeFileSync(
      path.join(tmp, ".env.runtime.docker.local"),
      "BOBA_BEAR_CHECKOUT_PREPARE_DIAGNOSTIC_ENABLED=false\nSECRET_TOKEN=super-secret-value\n",
    );
    writeFileSync(path.join(tmp, ".env.customer-auth.docker.local"), "AUTH_SECRET=another-secret\n");
    writeFileSync(path.join(tmp, ".env.customer-commerce.docker.local"), "COMMERCE_SECRET=third-secret\n");
    const diagnostic = readStagingDiagnosticEnabled(tmp, { repositoryRoot: tmp });
    const serialized = JSON.stringify(diagnostic);
    assert.equal(serialized.includes("super-secret-value"), false);
    assert.equal(serialized.includes("another-secret"), false);
    assert.equal(serialized.includes("third-secret"), false);
    assert.equal(diagnostic.enabled, false);
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
});

test("N-source: wrong repository, tree, branch, dirty tree, and unverified isolation block", () => {
  assertBlocked(
    evaluateStagingDeployPreflight(validPreflightEvidence({ source: { repositoryIdentity: "other/repo" } })),
    PREFLIGHT_REASON.SOURCE_AUTHORITY_INVALID,
  );
  assertBlocked(
    evaluateStagingDeployPreflight(validPreflightEvidence({ source: { tree: "c".repeat(40) } })),
    PREFLIGHT_REASON.SOURCE_SHA_TREE_DRIFT,
  );
  assertBlocked(
    evaluateStagingDeployPreflight(validPreflightEvidence({ source: { branch: "feature" } })),
    PREFLIGHT_REASON.SOURCE_AUTHORITY_INVALID,
  );
  assertBlocked(
    evaluateStagingDeployPreflight(validPreflightEvidence({ source: { trackedDirty: " M src/x" } })),
    PREFLIGHT_REASON.SOURCE_DIRTY_OR_PROTECTED,
  );
  assertBlocked(
    evaluateStagingDeployPreflight(validPreflightEvidence({ source: { protectedCheckoutUsed: true } })),
    PREFLIGHT_REASON.SOURCE_DIRTY_OR_PROTECTED,
  );
  assertBlocked(
    evaluateStagingDeployPreflight(
      validPreflightEvidence({ source: { protectedCheckoutUsed: false, isolatedArtifactContextVerified: false } }),
    ),
    PREFLIGHT_REASON.SOURCE_DIRTY_OR_PROTECTED,
  );
});

test("N-environment: http origin, unsafe adapters, live payment, and bypass flags block", () => {
  assertBlocked(
    evaluateStagingDeployPreflight(
      validPreflightEvidence({ environment: { paymentIsolation: "LIVE_REJECTED" } }),
    ),
    PREFLIGHT_REASON.ENVIRONMENT_INVALID,
  );
  assertBlocked(
    evaluateStagingDeployPreflight(
      validPreflightEvidence({ environment: { unsafeAdaptersExplicitlyFalse: false } }),
    ),
    PREFLIGHT_REASON.ENVIRONMENT_INVALID,
  );
  assertBlocked(
    evaluateStagingDeployPreflight(validPreflightEvidence({ environment: { secretModesSecure: false } })),
    PREFLIGHT_REASON.ENVIRONMENT_INVALID,
  );
  assertBlocked(
    evaluateStagingDeployPreflight(validPreflightEvidence({ waive: true })),
    PREFLIGHT_REASON.EVIDENCE_MALFORMED,
  );
});

test("N-recovery: omitted records and production-only records do not pass", () => {
  const missingRecords = validPreflightEvidence();
  delete missingRecords.recovery.evidenceRecords;
  assertBlocked(evaluateStagingDeployPreflight(missingRecords), PREFLIGHT_REASON.RECOVERY_INTEGRITY_UNVERIFIED);
  assertBlocked(
    evaluateStagingDeployPreflight(
      validPreflightEvidence({
        recovery: {
          evidenceRecords: [
            {
              ...validPreflightEvidence().recovery.evidenceRecords[0],
              sourceEnvironmentClassification: "production",
            },
          ],
        },
      }),
    ),
    PREFLIGHT_REASON.RECOVERY_EVIDENCE_STALE_OR_MISBOUND,
  );
});

test("N-security-capacity-database: uncorrelated image, unmeasured capacity, and duplicate accounts block", () => {
  assertBlocked(
    evaluateStagingDeployPreflight(
      validPreflightEvidence({ security: { imageSecurityEvidencePresent: true, sourceImageCorrelated: false } }),
    ),
    PREFLIGHT_REASON.SECURITY_EVIDENCE_MISSING,
  );
  const decision = evaluateStagingDeployPreflight(
    validPreflightEvidence({
      capacity: { diskSufficient: null, memorySufficient: null, priorImagesPreserved: null, unintendedPostgresReplacement: null },
    }),
  );
  assert.equal(decision.outcome, PREFLIGHT_OUTCOME.BLOCKED);
  assertBlocked(
    evaluateStagingDeployPreflight(
      validPreflightEvidence({ database: { duplicateAuthAccountGroupCount: 2 } }),
    ),
    PREFLIGHT_REASON.DATABASE_STATE_UNKNOWN_OR_UNSAFE,
  );
});
