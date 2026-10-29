import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

import {
  classifyPublishingIsolation,
  evaluateStagingPublicationContract,
  EXPECTED_MARKETING_PUBLICATION,
  gatherPublishingEvidence,
  observeWorkflowFile,
  PUBLISHING_CLASSIFICATION,
  probePublishingWorkflow,
} from "./staging-publishing-probe.mjs";
import {
  evaluateCandidatePreparationEligibility,
  evaluateStagingDeployPreflight,
  PREFLIGHT_OUTCOME,
  PREFLIGHT_REASON,
  validPreflightEvidence,
} from "./staging-preflight.mjs";
import { assertPreflightAllowsDeployment } from "./staging-preflight.mjs";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const liveWorkflowText = readFileSync(path.join(repoRoot, ".github/workflows/deploy.yml"), "utf8");

function marketingGithub(state = "disabled_manually") {
  return {
    observed: true,
    state,
    path: EXPECTED_MARKETING_PUBLICATION.workflowPath,
    repositoryIdentity: EXPECTED_MARKETING_PUBLICATION.repositoryIdentity,
  };
}

function marketingPages(overrides = {}) {
  return {
    observed: true,
    sourceBranch: "gh-pages",
    sourcePath: "/",
    cname: "thebobabear.in",
    status: "built",
    repositoryIdentity: EXPECTED_MARKETING_PUBLICATION.repositoryIdentity,
    ...overrides,
  };
}

function privateStaging() {
  return {
    observedExposure: false,
    origin: null,
    hostingTarget: null,
    marketingHostingTarget: null,
    authorization: null,
    claimedAuthorized: false,
  };
}

function completeAuthorizedContract(overrides = {}) {
  return {
    authorized: true,
    stagingOrigin: "https://staging.example.test",
    accessRestrictions: "founder-vpn-only",
    topology: "private-compose-behind-allowlisted-ingress",
    identity: "boba-staging",
    authorizationId: "FOUNDER-STAGING-PUB-TEST-1",
    authorizationProvenance: "synthetic-test-contract-not-live-authority",
    boundCandidateSha: "a".repeat(40),
    expiresAt: "2099-01-01T00:00:00.000Z",
    ...overrides,
  };
}

test("1: known public marketing origin with verified Pages state is PUBLIC_MARKETING", () => {
  const result = classifyPublishingIsolation({
    workflowText: liveWorkflowText,
    githubWorkflow: marketingGithub("disabled_manually"),
    pages: marketingPages(),
    staging: privateStaging(),
  });
  assert.equal(result.classification, PUBLISHING_CLASSIFICATION.PUBLIC_MARKETING);
  assert.equal(result.unsafeActivePublishingPath, false);
  assert.equal(result.pagesSourceKnown, true);
  const evidence = validPreflightEvidence({ publishing: result });
  assert.equal(evaluateCandidatePreparationEligibility(evidence).categories.publishing, PREFLIGHT_OUTCOME.PASS);
  assert.equal(evaluateStagingDeployPreflight(evidence).categories.publishing, PREFLIGHT_OUTCOME.PASS);
});

test("2: workflow branches:[main] with API disabled_manually uses both facts without false staging-unsafe", () => {
  const file = observeWorkflowFile(liveWorkflowText);
  assert.equal(file.triggersMain, true);
  assert.equal(file.fileDeployWorkflowState, "active_on_main");
  const result = classifyPublishingIsolation({
    workflowFile: file,
    githubWorkflow: marketingGithub("disabled_manually"),
    pages: marketingPages(),
    staging: privateStaging(),
  });
  assert.equal(result.classification, PUBLISHING_CLASSIFICATION.PUBLIC_MARKETING);
  assert.equal(result.deployWorkflowState, "disabled_manually");
  assert.equal(result.fileDeployWorkflowState, "active_on_main");
  assert.equal(result.unsafeActivePublishingPath, false);
});

test("3: workflow enabled with verified marketing is not automatically unsafe staging", () => {
  const result = classifyPublishingIsolation({
    workflowText: liveWorkflowText,
    githubWorkflow: marketingGithub("active"),
    pages: marketingPages(),
    staging: privateStaging(),
  });
  assert.equal(result.classification, PUBLISHING_CLASSIFICATION.PUBLIC_MARKETING);
  assert.equal(result.deployWorkflowState, "active");
  assert.equal(result.unsafeActivePublishingPath, false);
});

test("4: Pages still recognized after workflow disabled", () => {
  const result = classifyPublishingIsolation({
    workflowText: liveWorkflowText,
    githubWorkflow: marketingGithub("disabled_manually"),
    pages: marketingPages({ status: "built" }),
    staging: privateStaging(),
  });
  assert.equal(result.classification, PUBLISHING_CLASSIFICATION.PUBLIC_MARKETING);
  assert.equal(result.pages.sourceBranch, "gh-pages");
  assert.equal(result.pages.cname, "thebobabear.in");
});

test("5: missing GitHub workflow-state evidence fails closed", () => {
  const result = classifyPublishingIsolation({
    workflowText: liveWorkflowText,
    githubWorkflow: { observed: false, state: "UNKNOWN", detail: "timeout" },
    pages: marketingPages(),
    staging: privateStaging(),
  });
  assert.equal(result.classification, PUBLISHING_CLASSIFICATION.PUBLISHING_UNKNOWN_OR_CONFLICTING);
  assert.equal(result.unsafeActivePublishingPath, true);
  const decision = evaluateStagingDeployPreflight(validPreflightEvidence({ publishing: result }));
  assert.equal(decision.categories.publishing, PREFLIGHT_OUTCOME.BLOCKED);
});

test("6: wrong Pages branch or CNAME is BLOCKED", () => {
  const wrongBranch = classifyPublishingIsolation({
    workflowText: liveWorkflowText,
    githubWorkflow: marketingGithub(),
    pages: marketingPages({ sourceBranch: "main" }),
    staging: privateStaging(),
  });
  assert.equal(wrongBranch.classification, PUBLISHING_CLASSIFICATION.PUBLISHING_UNKNOWN_OR_CONFLICTING);

  const wrongCname = classifyPublishingIsolation({
    workflowText: liveWorkflowText,
    githubWorkflow: marketingGithub(),
    pages: marketingPages({ cname: "evil.example" }),
    staging: privateStaging(),
  });
  assert.equal(wrongCname.classification, PUBLISHING_CLASSIFICATION.PUBLISHING_UNKNOWN_OR_CONFLICTING);
});

test("7: marketing hostname configured as staging origin is BLOCKED", () => {
  const result = classifyPublishingIsolation({
    workflowText: liveWorkflowText,
    githubWorkflow: marketingGithub(),
    pages: marketingPages(),
    staging: {
      ...privateStaging(),
      origin: "https://thebobabear.in",
    },
  });
  assert.equal(result.classification, PUBLISHING_CLASSIFICATION.PUBLISHING_UNKNOWN_OR_CONFLICTING);
  assert.ok(result.contradictions.some((item) => item.includes("collides with marketing")));
  const decision = evaluateStagingDeployPreflight(validPreflightEvidence({ publishing: result }));
  assert.equal(decision.categories.publishing, PREFLIGHT_OUTCOME.BLOCKED);
  assert.ok(
    decision.findings.some(
      (finding) => finding.code === PREFLIGHT_REASON.PUBLISHING_MARKETING_ORIGIN_COLLISION,
    ),
  );
});

test("8: same hosting/routing target under different hostnames is BLOCKED", () => {
  const result = classifyPublishingIsolation({
    workflowText: liveWorkflowText,
    githubWorkflow: marketingGithub(),
    pages: marketingPages(),
    staging: {
      ...privateStaging(),
      origin: "https://staging.example.test",
      hostingTarget: "shared-edge-origin-1",
      marketingHostingTarget: "shared-edge-origin-1",
    },
  });
  assert.equal(result.classification, PUBLISHING_CLASSIFICATION.PUBLISHING_UNKNOWN_OR_CONFLICTING);
  assert.ok(result.contradictions.some((item) => item.includes("same hosting/routing target")));
});

test("9: unauthorized public staging exposure is BLOCKED", () => {
  const result = classifyPublishingIsolation({
    workflowText: liveWorkflowText,
    githubWorkflow: marketingGithub(),
    pages: marketingPages(),
    staging: {
      ...privateStaging(),
      observedExposure: true,
      origin: "https://staging.example.test",
      authorization: null,
    },
  });
  assert.equal(result.classification, PUBLISHING_CLASSIFICATION.STAGING_PUBLIC_UNAUTHORIZED);
  const decision = evaluateStagingDeployPreflight(validPreflightEvidence({ publishing: result }));
  assert.equal(decision.categories.publishing, PREFLIGHT_OUTCOME.BLOCKED);
  assert.ok(
    decision.findings.some((finding) => finding.code === PREFLIGHT_REASON.PUBLISHING_STAGING_UNAUTHORIZED),
  );
});

test("10: authorized=true without Founder contract is BLOCKED", () => {
  const bare = classifyPublishingIsolation({
    workflowText: liveWorkflowText,
    githubWorkflow: marketingGithub(),
    pages: marketingPages(),
    staging: {
      ...privateStaging(),
      claimedAuthorized: true,
      authorization: true,
    },
  });
  assert.equal(bare.classification, PUBLISHING_CLASSIFICATION.STAGING_PUBLIC_UNAUTHORIZED);

  const sparse = classifyPublishingIsolation({
    workflowText: liveWorkflowText,
    githubWorkflow: marketingGithub(),
    pages: marketingPages(),
    staging: {
      ...privateStaging(),
      authorization: { authorized: true },
    },
  });
  assert.equal(sparse.classification, PUBLISHING_CLASSIFICATION.STAGING_PUBLIC_UNAUTHORIZED);
});

test("11: expired or mismatched SHA exposure authorization is BLOCKED", () => {
  const expired = evaluateStagingPublicationContract(
    completeAuthorizedContract({ expiresAt: "2020-01-01T00:00:00.000Z" }),
    { nowMs: Date.parse("2026-10-29T00:00:00.000Z") },
  );
  assert.equal(expired.ok, false);

  const mismatched = evaluateStagingPublicationContract(
    completeAuthorizedContract({ boundCandidateSha: "b".repeat(40) }),
    { candidateSha: "a".repeat(40) },
  );
  assert.equal(mismatched.ok, false);

  const classified = classifyPublishingIsolation({
    workflowText: liveWorkflowText,
    githubWorkflow: marketingGithub(),
    pages: marketingPages(),
    staging: {
      observedExposure: true,
      origin: "https://staging.example.test",
      authorization: completeAuthorizedContract({ expiresAt: "2020-01-01T00:00:00.000Z" }),
      claimedAuthorized: true,
    },
    candidateSha: "a".repeat(40),
    nowMs: Date.parse("2026-10-29T00:00:00.000Z"),
  });
  assert.equal(classified.classification, PUBLISHING_CLASSIFICATION.STAGING_PUBLIC_UNAUTHORIZED);
});

test("12: contradictory workflow/API marketing evidence is BLOCKED", () => {
  const result = classifyPublishingIsolation({
    workflowText: liveWorkflowText,
    githubWorkflow: {
      ...marketingGithub(),
      path: ".github/workflows/other.yml",
    },
    pages: marketingPages(),
    staging: privateStaging(),
  });
  assert.equal(result.classification, PUBLISHING_CLASSIFICATION.PUBLISHING_UNKNOWN_OR_CONFLICTING);

  const cnameConflict = classifyPublishingIsolation({
    workflowFile: {
      present: true,
      triggersMain: true,
      publishDir: "./out",
      cname: "thebobabear.in",
      pagesSourceDescribed: true,
      fileDeployWorkflowState: "active_on_main",
    },
    githubWorkflow: marketingGithub(),
    pages: marketingPages({ cname: "other.example" }),
    staging: privateStaging(),
  });
  assert.equal(cnameConflict.classification, PUBLISHING_CLASSIFICATION.PUBLISHING_UNKNOWN_OR_CONFLICTING);
});

test("13: missing DNS/origin evidence required for staging-origin decisions fails closed", () => {
  // Marketing-only does not require a staging origin.
  const marketingOnly = classifyPublishingIsolation({
    workflowText: liveWorkflowText,
    githubWorkflow: marketingGithub(),
    pages: marketingPages(),
    staging: privateStaging(),
  });
  assert.equal(marketingOnly.classification, PUBLISHING_CLASSIFICATION.PUBLIC_MARKETING);

  // Missing pages/DNS-equivalent source evidence blocks.
  const missingPages = classifyPublishingIsolation({
    workflowText: liveWorkflowText,
    githubWorkflow: marketingGithub(),
    pages: { observed: false, detail: "dns/pages unavailable" },
    staging: privateStaging(),
  });
  assert.equal(missingPages.classification, PUBLISHING_CLASSIFICATION.PUBLISHING_UNKNOWN_OR_CONFLICTING);
});

test("14: private unexposed staging is not classified as authorized public staging", () => {
  const result = classifyPublishingIsolation({
    workflowText: liveWorkflowText,
    githubWorkflow: marketingGithub(),
    pages: marketingPages(),
    staging: {
      ...privateStaging(),
      origin: "https://staging.example.test",
      observedExposure: false,
    },
  });
  assert.equal(result.classification, PUBLISHING_CLASSIFICATION.PUBLIC_MARKETING);
  assert.notEqual(result.classification, PUBLISHING_CLASSIFICATION.STAGING_PUBLIC_AUTHORIZED);
});

test("15: synthetic STAGING_PUBLIC_AUTHORIZED passes publishing only with complete proofs", () => {
  const incomplete = classifyPublishingIsolation({
    workflowText: liveWorkflowText,
    githubWorkflow: marketingGithub(),
    pages: marketingPages(),
    staging: {
      observedExposure: true,
      origin: "https://staging.example.test",
      authorization: completeAuthorizedContract({ stagingOrigin: "https://other.example.test" }),
      claimedAuthorized: true,
    },
    candidateSha: "a".repeat(40),
  });
  assert.equal(incomplete.classification, PUBLISHING_CLASSIFICATION.STAGING_PUBLIC_UNAUTHORIZED);

  const complete = classifyPublishingIsolation({
    workflowText: liveWorkflowText,
    githubWorkflow: marketingGithub(),
    pages: marketingPages(),
    staging: {
      observedExposure: true,
      origin: "https://staging.example.test",
      authorization: completeAuthorizedContract(),
      claimedAuthorized: true,
    },
    candidateSha: "a".repeat(40),
  });
  assert.equal(complete.classification, PUBLISHING_CLASSIFICATION.STAGING_PUBLIC_AUTHORIZED);
  assert.equal(
    evaluateStagingDeployPreflight(validPreflightEvidence({ publishing: complete })).categories.publishing,
    PREFLIGHT_OUTCOME.PASS,
  );
});

test("16: publishing category PASS does not bypass other staging gates", () => {
  const publishing = classifyPublishingIsolation({
    workflowText: liveWorkflowText,
    githubWorkflow: marketingGithub(),
    pages: marketingPages(),
    staging: privateStaging(),
  });
  const decision = evaluateStagingDeployPreflight(
    validPreflightEvidence({
      publishing,
      recovery: { bindingDesignDependency: true },
    }),
  );
  assert.equal(decision.categories.publishing, PREFLIGHT_OUTCOME.PASS);
  assert.equal(decision.outcome, PREFLIGHT_OUTCOME.BLOCKED);
  assert.ok(
    decision.findings.some(
      (finding) => finding.code === PREFLIGHT_REASON.RECOVERY_PROOF_BINDING_DESIGN_DEPENDENCY,
    ),
  );
});

test("17: preparation eligibility cannot trigger activation", () => {
  const publishing = classifyPublishingIsolation({
    workflowText: liveWorkflowText,
    githubWorkflow: marketingGithub(),
    pages: marketingPages(),
    staging: privateStaging(),
  });
  const eligibility = evaluateCandidatePreparationEligibility(validPreflightEvidence({ publishing }));
  assert.equal(eligibility.deploymentAuthorized, false);
  assert.throws(() => assertPreflightAllowsDeployment(eligibility), /refusing operational mutation/);
});

test("18: file-only probe never invents publishing PASS", () => {
  const fileOnly = probePublishingWorkflow(liveWorkflowText);
  assert.equal(fileOnly.classification, PUBLISHING_CLASSIFICATION.PUBLISHING_UNKNOWN_OR_CONFLICTING);
  assert.equal(fileOnly.unsafeActivePublishingPath, true);
});

test("ambiguous, failed, stale, and malformed evidence fail closed", () => {
  const stale = classifyPublishingIsolation({
    workflowText: liveWorkflowText,
    githubWorkflow: marketingGithub(),
    pages: marketingPages(),
    staging: privateStaging(),
    evidenceStale: true,
  });
  assert.equal(stale.classification, PUBLISHING_CLASSIFICATION.PUBLISHING_UNKNOWN_OR_CONFLICTING);

  const wrongRepo = classifyPublishingIsolation({
    workflowText: liveWorkflowText,
    githubWorkflow: { ...marketingGithub(), repositoryIdentity: "other/repo" },
    pages: marketingPages(),
    staging: privateStaging(),
  });
  assert.equal(wrongRepo.classification, PUBLISHING_CLASSIFICATION.PUBLISHING_UNKNOWN_OR_CONFLICTING);

  const injectedFailure = gatherPublishingEvidence({
    readWorkflowText: () => liveWorkflowText,
    observeGithubWorkflow: () => ({ observed: false, state: "UNKNOWN", detail: "api failure" }),
    observePages: () => ({ observed: false, detail: "timeout" }),
    observeStaging: () => privateStaging(),
  });
  assert.equal(injectedFailure.classification, PUBLISHING_CLASSIFICATION.PUBLISHING_UNKNOWN_OR_CONFLICTING);
});

test("live GitHub observers use deploy.yml id and dotted jq; failures fail closed", async () => {
  const {
    observeGithubWorkflowState,
    observeGithubPagesSettings,
  } = await import("./staging-publishing-probe.mjs");

  /** @type {string[][]} */
  const calls = [];
  const spawnOk = (command, args) => {
    calls.push([command, ...args]);
    if (String(args[1] ?? "").includes("/pages")) {
      return {
        status: 0,
        stdout: JSON.stringify({
          status: "built",
          cname: "thebobabear.in",
          source_branch: "gh-pages",
          source_path: "/",
          html_url: "http://thebobabear.in/",
          public: true,
        }),
      };
    }
    return {
      status: 0,
      stdout: JSON.stringify({
        path: ".github/workflows/deploy.yml",
        state: "disabled_manually",
        name: "Deploy to GitHub Pages",
      }),
    };
  };

  const workflow = observeGithubWorkflowState({
    workflowPath: ".github/workflows/deploy.yml",
    spawn: spawnOk,
  });
  assert.equal(workflow.observed, true);
  assert.equal(workflow.state, "disabled_manually");
  assert.ok(calls[0].includes("repos/nivedhya11/BobaBear/actions/workflows/deploy.yml"));
  assert.ok(calls[0].some((arg) => String(arg).includes("{path:.path,state:.state,name:.name}")));

  const pages = observeGithubPagesSettings({ spawn: spawnOk });
  assert.equal(pages.observed, true);
  assert.equal(pages.cname, "thebobabear.in");
  assert.ok(calls[1].some((arg) => String(arg).includes("source_branch:.source.branch")));

  const failed = observeGithubWorkflowState({
    spawn: () => ({ status: 1, stdout: "", stderr: "404" }),
  });
  assert.equal(failed.observed, false);
  assert.equal(failed.state, "UNKNOWN");
});

test("supplied classification string alone cannot force publishing PASS", () => {
  const evidence = validPreflightEvidence();
  evidence.publishing = {
    classification: "PUBLIC_MARKETING",
    deployWorkflowState: "disabled_manually",
    pagesSourceKnown: true,
    unsafeActivePublishingPath: false,
  };
  const decision = evaluateStagingDeployPreflight(evidence);
  assert.equal(decision.categories.publishing, PREFLIGHT_OUTCOME.UNKNOWN);
  assert.ok(
    decision.findings.some((finding) => finding.code === PREFLIGHT_REASON.PUBLISHING_UNSAFE_OR_UNKNOWN),
  );
});
