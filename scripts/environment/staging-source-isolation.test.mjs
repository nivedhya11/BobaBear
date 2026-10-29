import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { test } from "node:test";

import {
  PROTECTED_PRIMARY_REPOSITORY,
  observeIsolatedArtifactContext,
} from "./staging-source-isolation.mjs";

function git(cwd, args) {
  return execFileSync("git", args, { cwd, encoding: "utf8" }).trim();
}

function initRepo() {
  const repo = mkdtempSync(path.join(os.tmpdir(), "boba-isolation-src-"));
  git(repo, ["init", "-b", "main"]);
  git(repo, ["config", "user.email", "isolation@example.com"]);
  git(repo, ["config", "user.name", "Isolation Test"]);
  writeFileSync(path.join(repo, "README.md"), "isolated\n");
  git(repo, ["add", "README.md"]);
  git(repo, ["commit", "-m", "init"]);
  const sha = git(repo, ["rev-parse", "HEAD"]);
  const tree = git(repo, ["rev-parse", "HEAD^{tree}"]);
  return { repo, sha, tree };
}

test("isolated archive outside the protected root verifies and is deleted", () => {
  const { repo, sha, tree } = initRepo();
  try {
    const observed = observeIsolatedArtifactContext({
      repositoryRoot: repo,
      protectedRoot: repo,
      sha,
      expectedTree: tree,
      inspect: (dir) => dir,
    });
    assert.equal(observed.ok, true);
    assert.equal(observed.protectedCheckoutUsed, false);
    assert.equal(observed.isolatedArtifactContextVerified, true);
    assert.equal(observed.artifactContextInsideProtectedRoot, false);
    assert.equal(observed.extractDir, null);
  } finally {
    rmSync(repo, { recursive: true, force: true });
  }
});

test("a repository root other than the protected root cannot verify isolation", () => {
  const { repo, sha, tree } = initRepo();
  try {
    const observed = observeIsolatedArtifactContext({
      repositoryRoot: repo,
      protectedRoot: PROTECTED_PRIMARY_REPOSITORY,
      sha,
      expectedTree: tree,
    });
    assert.equal(observed.ok, false);
    assert.equal(observed.protectedCheckoutUsed, true);
    assert.equal(observed.isolatedArtifactContextVerified, false);
  } finally {
    rmSync(repo, { recursive: true, force: true });
  }
});

test("a temp parent symlinked into the protected checkout is not isolated", () => {
  const { repo, sha, tree } = initRepo();
  const outside = mkdtempSync(path.join(os.tmpdir(), "boba-isolation-outside-"));
  const inside = path.join(repo, "linked-temp");
  mkdirSync(inside);
  const link = path.join(outside, "tmp-link");
  symlinkSync(inside, link);
  try {
    const observed = observeIsolatedArtifactContext({
      repositoryRoot: repo,
      protectedRoot: repo,
      sha,
      expectedTree: tree,
      tempParent: link,
    });
    assert.equal(observed.ok, false);
    assert.equal(observed.protectedCheckoutUsed, true);
    assert.equal(observed.artifactContextInsideProtectedRoot, true);
    assert.equal(observed.isolatedArtifactContextVerified, false);
    assert.equal(observed.extractDir, null);
  } finally {
    rmSync(outside, { recursive: true, force: true });
    rmSync(repo, { recursive: true, force: true });
  }
});

test("a mismatched tree does not verify the artifact context", () => {
  const { repo, sha } = initRepo();
  try {
    const observed = observeIsolatedArtifactContext({
      repositoryRoot: repo,
      protectedRoot: repo,
      sha,
      expectedTree: "c".repeat(40),
    });
    assert.equal(observed.ok, false);
    assert.equal(observed.isolatedArtifactContextVerified, false);
    assert.equal(observed.protectedCheckoutUsed, true);
  } finally {
    rmSync(repo, { recursive: true, force: true });
  }
});
