import assert from "node:assert/strict";
import { test } from "node:test";
import { evaluateTargetIdentitySafety, requireExplicitSourceClassification } from "./identity.mjs";

const allowed = {
  sourceIdentity: "prod-postgres-volume-abc",
  targetIdentity: "recovery-postgres-volume-xyz",
  sourceClassification: "production",
  targetClassification: "recovery",
  targetPgdataPath: "/tmp/boba-recovery/pgdata",
};

test("clearly isolated recovery target is allowed", () => {
  assert.deepEqual(evaluateTargetIdentitySafety(allowed), { allowed: true });
});

test("source equal to target is denied", () => {
  const result = evaluateTargetIdentitySafety({
    ...allowed,
    targetIdentity: allowed.sourceIdentity,
  });
  assert.equal(result.allowed, false);
  assert.equal(result.code, "SOURCE_EQUALS_TARGET");
});

test("missing target identity is denied", () => {
  const result = evaluateTargetIdentitySafety({
    ...allowed,
    targetIdentity: "",
  });
  assert.equal(result.allowed, false);
  assert.equal(result.code, "TARGET_IDENTITY_MISSING");
});

test("ambiguous classification is denied", () => {
  const result = evaluateTargetIdentitySafety({
    ...allowed,
    targetClassification: "ambiguous",
  });
  assert.equal(result.allowed, false);
  assert.equal(result.code, "CLASSIFICATION_AMBIGUOUS");
});

test("unresolved classification is denied", () => {
  const result = evaluateTargetIdentitySafety({
    ...allowed,
    targetClassification: "unknown",
  });
  assert.equal(result.allowed, false);
  assert.equal(result.code, "TARGET_CLASSIFICATION_UNRESOLVED");
});

test("CS3: missing source classification is denied (no silent production default)", () => {
  const result = evaluateTargetIdentitySafety({
    ...allowed,
    sourceClassification: "",
  });
  assert.equal(result.allowed, false);
  assert.equal(result.code, "SOURCE_CLASSIFICATION_REQUIRED");
});

test("CS3: invalid/free-form source classification is denied", () => {
  const result = requireExplicitSourceClassification("founder-uat-box");
  assert.equal(result.ok, false);
  assert.equal(result.code, "SOURCE_CLASSIFICATION_INVALID");
});

test("CS3: compose project name alone does not invent staging classification", () => {
  const missing = requireExplicitSourceClassification(undefined, {
    composeProjectName: "boba-staging",
  });
  assert.equal(missing.ok, false);
  assert.equal(missing.code, "SOURCE_CLASSIFICATION_REQUIRED");
});

test("CS3: production claim vs staging compose + local runtime contradicts", () => {
  const result = requireExplicitSourceClassification("production", {
    composeProjectName: "boba-staging",
    claimedRuntimeEnv: "local",
  });
  assert.equal(result.ok, false);
  assert.equal(result.code, "SOURCE_CLASSIFICATION_CONTRADICTION");
});

test("CS3: explicit staging classification remains valid without inventing taxonomy", () => {
  const result = requireExplicitSourceClassification("staging");
  assert.equal(result.ok, true);
  assert.equal(result.classification, "staging");
});

test("production target is denied", () => {
  const result = evaluateTargetIdentitySafety({
    ...allowed,
    targetClassification: "production",
    targetIdentity: "another-prod-volume",
  });
  assert.equal(result.allowed, false);
  assert.equal(result.code, "PRODUCTION_OR_AUTHORITATIVE_TARGET");
});

test("known production PGDATA path is denied", () => {
  const result = evaluateTargetIdentitySafety({
    ...allowed,
    targetPgdataPath: "/var/lib/postgresql/data",
  });
  assert.equal(result.allowed, false);
  assert.equal(result.code, "PRODUCTION_PGDATA_FORBIDDEN");
});

test("equivalent production PGDATA paths with . or .. are denied", () => {
  for (const targetPgdataPath of [
    "/var/lib/postgresql/data/.",
    "/var/lib/postgresql/data/sub/..",
    "/var/lib/postgresql/data/base",
  ]) {
    const result = evaluateTargetIdentitySafety({ ...allowed, targetPgdataPath });
    assert.equal(result.allowed, false, targetPgdataPath);
    assert.equal(result.code, "PRODUCTION_PGDATA_FORBIDDEN", targetPgdataPath);
  }
});
