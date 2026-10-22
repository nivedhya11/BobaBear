import assert from "node:assert/strict";
import { test } from "node:test";

import {
  assertPreflightAllowsDeployment,
  evaluateStagingDeployPreflight,
  PREFLIGHT_OUTCOME,
  PREFLIGHT_REASON,
  validPreflightEvidence,
} from "./staging-preflight.mjs";
import { POSTGRES_INIT_DISPOSITION } from "./postgres-init-identity.mjs";
import { runStagingDeploy } from "./staging.mjs";

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
