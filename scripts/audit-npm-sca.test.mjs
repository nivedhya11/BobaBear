#!/usr/bin/env node
/**
 * Unit tests for IMP-038 SCA exception filtering (no live npm audit required).
 *
 * Invariant: every High/Critical advisory must itself be covered by an ACTIVE
 * exception. Inherited string `via` nodes resolve transitively to structured
 * advisories. One matched GHSA/CVE must never implicitly cover another advisory.
 * A package-name token never blankets structured GHSA/CVE identities.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

import {
  REQUIRED_HEADERS,
  parseExceptionRegister,
  tokenizePackageCve,
  collectFindingKeys,
  collectAdvisoryIdentityKeys,
  extractPolicyAdvisories,
  findCoveringException,
  findCoveringExceptionForAdvisory,
  filterUncoveredPolicyFindings,
  activeExceptions,
  isActiveExpiry,
  isIsoDate,
  exceptionCoversSeverity,
} from "./audit-npm-sca.mjs";

const HEADER =
  "| id | package/cve | severity | owner | rationale | authority | compensating_controls | retest_date | expiry |\n" +
  "|---|---|---|---|---|---|---|---|---|";

function exceptionRow(overrides) {
  return {
    id: "VEX-1",
    "package/cve": "lodash",
    severity: "high",
    owner: "a",
    rationale: "r",
    authority: "x",
    compensating_controls: "c",
    retest_date: "2026-10-01",
    expiry: "2026-10-01",
    ...overrides,
  };
}

test("isIsoDate accepts YYYY-MM-DD only", () => {
  assert.equal(isIsoDate("2026-09-23"), true);
  assert.equal(isIsoDate("2026-9-23"), false);
  assert.equal(isIsoDate("tomorrow"), false);
});

test("isActiveExpiry is inclusive of today", () => {
  assert.equal(isActiveExpiry("2026-09-23", "2026-09-23"), true);
  assert.equal(isActiveExpiry("2026-09-23", "2026-09-22"), false);
  assert.equal(isActiveExpiry("2026-09-23", "2026-10-01"), true);
});

test("parseExceptionRegister reads empty Active exceptions table", () => {
  const md = `# Vulnerability exception register\n\n## Active exceptions\n\n${HEADER}\n`;
  const { rows, errors } = parseExceptionRegister(md);
  assert.deepEqual(errors, []);
  assert.deepEqual(rows, []);
  assert.equal(REQUIRED_HEADERS.length, 9);
});

test("parseExceptionRegister validates headers and rows", () => {
  const md = `## Active exceptions\n\n${HEADER}\n| VEX-001 | lodash, GHSA-xxxx | high | alice | temp | FOUNDER | none | 2026-09-30 | 2026-10-01 |\n`;
  const { rows, errors } = parseExceptionRegister(md);
  assert.deepEqual(errors, []);
  assert.equal(rows.length, 1);
  assert.equal(rows[0].id, "VEX-001");
  assert.equal(rows[0]["package/cve"], "lodash, GHSA-xxxx");
});

test("expired exceptions are inactive", () => {
  const rows = [exceptionRow({ id: "VEX-OLD", expiry: "2026-01-02", retest_date: "2026-01-01" })];
  assert.equal(activeExceptions(rows, "2026-09-23").length, 0);
});

test("tokenizePackageCve splits commas and spaces", () => {
  assert.deepEqual(tokenizePackageCve("lodash, GHSA-r5fr-rjxr-66jc"), [
    "lodash",
    "ghsa-r5fr-rjxr-66jc",
  ]);
});

test("findCoveringException matches package or GHSA (legacy aggregate)", () => {
  const active = [exceptionRow({ "package/cve": "GHSA-r5fr-rjxr-66jc" })];
  const keys = collectFindingKeys("lodash", {
    severity: "high",
    via: [{ source: "GHSA-r5fr-rjxr-66jc", url: "https://github.com/advisories/GHSA-r5fr-rjxr-66jc" }],
  });
  assert.ok(findCoveringException(keys, active));
  assert.equal(
    findCoveringException(collectFindingKeys("other", { severity: "high", via: [] }), active),
    null,
  );
});

test("package with one High advisory and no exception → FAIL", () => {
  const vulns = {
    lodash: {
      severity: "high",
      range: "<=4.17.23",
      via: [
        {
          source: 1100001,
          name: "lodash",
          severity: "high",
          url: "https://github.com/advisories/GHSA-r5fr-rjxr-66jc",
        },
      ],
    },
  };
  const uncovered = filterUncoveredPolicyFindings(vulns, []);
  assert.equal(uncovered.length, 1);
  assert.equal(uncovered[0].packageName, "lodash");
  assert.equal(uncovered[0].severity, "high");
});

test("matching explicit GHSA exception → PASS", () => {
  const vulns = {
    lodash: {
      severity: "high",
      via: [
        {
          severity: "high",
          url: "https://github.com/advisories/GHSA-r5fr-rjxr-66jc",
        },
      ],
    },
  };
  const active = [exceptionRow({ "package/cve": "GHSA-r5fr-rjxr-66jc" })];
  assert.deepEqual(filterUncoveredPolicyFindings(vulns, active), []);
});

test("multiple policy advisories where only one is excepted → FAIL", () => {
  const vulns = {
    lodash: {
      severity: "critical",
      via: [
        {
          severity: "high",
          url: "https://github.com/advisories/GHSA-aaaa-bbbb-cccc",
        },
        {
          severity: "critical",
          url: "https://github.com/advisories/GHSA-dddd-eeee-ffff",
        },
      ],
    },
  };
  const active = [exceptionRow({ "package/cve": "GHSA-aaaa-bbbb-cccc" })];
  const uncovered = filterUncoveredPolicyFindings(vulns, active);
  assert.equal(uncovered.length, 1);
  assert.equal(uncovered[0].severity, "critical");
  assert.ok(uncovered[0].keys.includes("ghsa-dddd-eeee-ffff"));
  assert.ok(!uncovered[0].keys.includes("ghsa-aaaa-bbbb-cccc"));
});

test("all policy-level advisories individually covered → PASS", () => {
  const vulns = {
    lodash: {
      severity: "critical",
      via: [
        {
          severity: "high",
          url: "https://github.com/advisories/GHSA-aaaa-bbbb-cccc",
        },
        {
          severity: "critical",
          url: "https://github.com/advisories/GHSA-dddd-eeee-ffff",
        },
      ],
    },
  };
  const active = [
    exceptionRow({ id: "VEX-A", "package/cve": "GHSA-aaaa-bbbb-cccc" }),
    exceptionRow({ id: "VEX-B", "package/cve": "GHSA-dddd-eeee-ffff", severity: "critical" }),
  ];
  assert.deepEqual(filterUncoveredPolicyFindings(vulns, active), []);
});

test("expired exception → FAIL", () => {
  const vulns = {
    lodash: {
      severity: "high",
      via: [{ severity: "high", url: "https://github.com/advisories/GHSA-r5fr-rjxr-66jc" }],
    },
  };
  const rows = [
    exceptionRow({
      "package/cve": "GHSA-r5fr-rjxr-66jc",
      expiry: "2026-01-01",
      retest_date: "2025-12-01",
    }),
  ];
  const active = activeExceptions(rows, "2026-09-23");
  assert.equal(active.length, 0);
  assert.equal(filterUncoveredPolicyFindings(vulns, active).length, 1);
});

test("package-name exception covers only opaque package-level findings", () => {
  const vulns = {
    lodash: {
      severity: "high",
      via: [],
    },
    next: {
      severity: "critical",
      via: [{ severity: "critical", url: "https://github.com/advisories/GHSA-8h8q-6873-q5fj" }],
    },
  };
  const active = [exceptionRow({ "package/cve": "lodash" })];
  const uncovered = filterUncoveredPolicyFindings(vulns, active);
  assert.equal(uncovered.length, 1);
  assert.equal(uncovered[0].packageName, "next");
});

test("package-name-only exception cannot suppress unrelated advisory identities on other packages", () => {
  const active = [exceptionRow({ "package/cve": "lodash" })];
  const nextAdvisory = extractPolicyAdvisories("next", {
    severity: "critical",
    via: [{ severity: "critical", url: "https://github.com/advisories/GHSA-8h8q-6873-q5fj" }],
  })[0];
  assert.equal(findCoveringExceptionForAdvisory(nextAdvisory, active), null);
});

test("filterUncoveredPolicyFindings ignores moderate/low", () => {
  const vulns = {
    leftpad: { severity: "moderate", via: [{ severity: "moderate", url: "https://github.com/advisories/GHSA-zzzz" }] },
    next: { severity: "critical", range: "<=16.3.2", via: [{ severity: "critical", url: "https://github.com/advisories/GHSA-8h8q-6873-q5fj" }] },
  };
  const uncovered = filterUncoveredPolicyFindings(vulns, []);
  assert.equal(uncovered.length, 1);
  assert.equal(uncovered[0].packageName, "next");
});

test("collectAdvisoryIdentityKeys extracts GHSA from url without package name", () => {
  const keys = collectAdvisoryIdentityKeys({
    url: "https://github.com/advisories/GHSA-r5fr-rjxr-66jc",
    severity: "high",
  });
  assert.ok(keys.has("ghsa-r5fr-rjxr-66jc"));
  assert.ok(!keys.has("lodash"));
});

const BRACES_CHAIN_VULNS = {
  braces: {
    severity: "high",
    range: "<=3.0.3",
    via: [
      {
        source: 1240992,
        name: "braces",
        severity: "high",
        title: "braces vulnerable to stack-exhaustion denial of service through deeply nested patterns",
        url: "https://github.com/advisories/GHSA-vfj7-8cjw-p6xm",
      },
    ],
  },
  "@next/eslint-plugin-next": {
    severity: "high",
    range: ">=14.3.0-canary.0",
    via: ["fast-glob"],
  },
  "eslint-config-next": {
    severity: "high",
    range: ">=14.3.0-canary.0",
    via: ["@next/eslint-plugin-next"],
  },
  "fast-glob": {
    severity: "high",
    range: "*",
    via: ["micromatch"],
  },
  micromatch: {
    severity: "high",
    range: ">=0.2.0",
    via: ["braces"],
  },
};

test("VEX-NPM-001 is the only ACTIVE npm row and expires after 2026-10-17", () => {
  const registerPath = path.join(
    path.dirname(fileURLToPath(import.meta.url)),
    "..",
    "docs/platform/security/vulnerability-exception-register.md",
  );
  const markdown = readFileSync(registerPath, "utf8");
  const { rows, errors } = parseExceptionRegister(markdown);
  assert.deepEqual(errors, []);
  const npmRows = rows.filter((r) => String(r.id).startsWith("VEX-NPM-"));
  assert.equal(npmRows.length, 1);
  assert.equal(npmRows[0].id, "VEX-NPM-001");
  assert.equal(npmRows[0]["package/cve"], "GHSA-vfj7-8cjw-p6xm");
  assert.equal(npmRows[0].severity, "high");
  assert.equal(npmRows[0].owner, "platform-security");
  assert.equal(npmRows[0].retest_date, "2026-10-10");
  assert.equal(npmRows[0].expiry, "2026-10-17");
  assert.match(npmRows[0].authority, /5966965948/);
  assert.equal(
    rows.some((r) => ["VEX-NPM-002", "VEX-NPM-003", "VEX-NPM-004", "VEX-NPM-005"].includes(r.id)),
    false,
  );
  assert.equal(isActiveExpiry("2026-10-03", npmRows[0].expiry), true);
  assert.equal(isActiveExpiry("2026-10-17", npmRows[0].expiry), true);
  assert.equal(isActiveExpiry("2026-10-18", npmRows[0].expiry), false);
  assert.equal(activeExceptions(npmRows, "2026-10-03").length, 1);
  assert.equal(activeExceptions(npmRows, "2026-10-18").length, 0);
});

test("root GHSA covers the current inherited braces chain", () => {
  const active = [exceptionRow({ id: "VEX-NPM-001", "package/cve": "GHSA-vfj7-8cjw-p6xm" })];
  assert.deepEqual(filterUncoveredPolicyFindings(BRACES_CHAIN_VULNS, active), []);
});

test("same braces chain with no exception leaves the root High uncovered", () => {
  const uncovered = filterUncoveredPolicyFindings(BRACES_CHAIN_VULNS, []);
  assert.equal(uncovered.length, 1);
  assert.equal(uncovered[0].severity, "high");
  assert.ok(uncovered[0].keys.includes("ghsa-vfj7-8cjw-p6xm"));
});

test("root braces VEX does not cover an unrelated High GHSA on micromatch", () => {
  const vulns = {
    ...BRACES_CHAIN_VULNS,
    micromatch: {
      severity: "high",
      range: ">=0.2.0",
      via: [
        "braces",
        {
          severity: "high",
          url: "https://github.com/advisories/GHSA-aaaa-bbbb-cccc",
        },
      ],
    },
  };
  const active = [exceptionRow({ id: "VEX-NPM-001", "package/cve": "GHSA-vfj7-8cjw-p6xm" })];
  const uncovered = filterUncoveredPolicyFindings(vulns, active);
  assert.equal(uncovered.length, 1);
  assert.ok(uncovered[0].keys.includes("ghsa-aaaa-bbbb-cccc"));
});

test("root braces VEX does not cover an unrelated Critical GHSA on fast-glob", () => {
  const vulns = {
    ...BRACES_CHAIN_VULNS,
    "fast-glob": {
      severity: "critical",
      range: "*",
      via: [
        "micromatch",
        {
          severity: "critical",
          url: "https://github.com/advisories/GHSA-ffff-eeee-dddd",
        },
      ],
    },
  };
  const active = [exceptionRow({ id: "VEX-NPM-001", "package/cve": "GHSA-vfj7-8cjw-p6xm" })];
  const uncovered = filterUncoveredPolicyFindings(vulns, active);
  assert.equal(uncovered.length, 1);
  assert.equal(uncovered[0].severity, "critical");
  assert.ok(uncovered[0].keys.includes("ghsa-ffff-eeee-dddd"));
});

test("high exception cannot cover the same GHSA when classified critical", () => {
  assert.equal(exceptionCoversSeverity("high", "critical"), false);
  assert.equal(exceptionCoversSeverity("high", "high"), true);
  const vulns = {
    braces: {
      severity: "critical",
      via: [
        {
          source: 1240992,
          name: "braces",
          severity: "critical",
          url: "https://github.com/advisories/GHSA-vfj7-8cjw-p6xm",
        },
      ],
    },
  };
  const active = [exceptionRow({ id: "VEX-NPM-001", "package/cve": "GHSA-vfj7-8cjw-p6xm", severity: "high" })];
  const uncovered = filterUncoveredPolicyFindings(vulns, active);
  assert.equal(uncovered.length, 1);
  assert.equal(uncovered[0].severity, "critical");
  assert.ok(uncovered[0].keys.includes("ghsa-vfj7-8cjw-p6xm"));
});

test("package-name token cannot cover a structured same-package GHSA", () => {
  const vulns = {
    micromatch: {
      severity: "high",
      via: [{ severity: "high", url: "https://github.com/advisories/GHSA-unrelated-xxxx-yyyy" }],
    },
  };
  const active = [exceptionRow({ "package/cve": "micromatch" })];
  const uncovered = filterUncoveredPolicyFindings(vulns, active);
  assert.equal(uncovered.length, 1);
  assert.equal(uncovered[0].packageName, "micromatch");
  assert.ok(uncovered[0].keys.includes("ghsa-unrelated-xxxx-yyyy"));
});

test("missing string via target fails closed", () => {
  const vulns = {
    "eslint-config-next": {
      severity: "high",
      via: ["missing-package"],
    },
  };
  const uncovered = filterUncoveredPolicyFindings(vulns, [
    exceptionRow({ id: "VEX-NPM-001", "package/cve": "GHSA-vfj7-8cjw-p6xm" }),
    exceptionRow({ "package/cve": "eslint-config-next" }),
  ]);
  assert.equal(uncovered.length, 1);
  assert.equal(uncovered[0].severity, "high");
  assert.equal(uncovered[0].packageName, "eslint-config-next");
  assert.match(uncovered[0].label, /missing-package/);
});

test("dependency cycle fails closed deterministically", () => {
  const vulns = {
    "pkg-a": { severity: "high", via: ["pkg-b"] },
    "pkg-b": { severity: "high", via: ["pkg-a"] },
  };
  const uncovered = filterUncoveredPolicyFindings(vulns, [
    exceptionRow({ "package/cve": "pkg-a" }),
    exceptionRow({ "package/cve": "pkg-b" }),
  ]);
  assert.ok(uncovered.length >= 1);
  assert.equal(
    uncovered.every((f) => f.severity === "high"),
    true,
  );
  assert.ok(uncovered.some((f) => /cycle/.test(f.label)));
});

test("multiple parents to the same root GHSA require only one exception", () => {
  const vulns = {
    braces: BRACES_CHAIN_VULNS.braces,
    micromatch: { severity: "high", via: ["braces"] },
    "fast-glob": { severity: "high", via: ["micromatch"] },
    "other-parent": { severity: "high", via: ["braces"] },
  };
  const active = [exceptionRow({ id: "VEX-NPM-001", "package/cve": "GHSA-vfj7-8cjw-p6xm" })];
  assert.deepEqual(filterUncoveredPolicyFindings(vulns, active), []);
  const uncovered = filterUncoveredPolicyFindings(vulns, []);
  assert.equal(uncovered.length, 1);
  assert.ok(uncovered[0].keys.includes("ghsa-vfj7-8cjw-p6xm"));
});

test("expired VEX-NPM-001 fails closed for the current chain on 2026-10-18", () => {
  const rows = [
    exceptionRow({
      id: "VEX-NPM-001",
      "package/cve": "GHSA-vfj7-8cjw-p6xm",
      expiry: "2026-10-17",
    }),
  ];
  const expired = activeExceptions(rows, "2026-10-18");
  assert.equal(expired.length, 0);
  const uncovered = filterUncoveredPolicyFindings(BRACES_CHAIN_VULNS, expired);
  assert.equal(uncovered.length, 1);
  assert.ok(uncovered[0].keys.includes("ghsa-vfj7-8cjw-p6xm"));
});

test("unrelated other-package High remains uncovered beside the covered chain", () => {
  const active = [exceptionRow({ id: "VEX-NPM-001", "package/cve": "GHSA-vfj7-8cjw-p6xm" })];
  const withUnrelated = {
    ...BRACES_CHAIN_VULNS,
    lodash: {
      severity: "high",
      via: [{ severity: "high", url: "https://github.com/advisories/GHSA-aaaa-bbbb-cccc" }],
    },
  };
  const uncovered = filterUncoveredPolicyFindings(withUnrelated, active);
  assert.equal(uncovered.length, 1);
  assert.equal(uncovered[0].packageName, "lodash");
  assert.ok(uncovered[0].keys.includes("ghsa-aaaa-bbbb-cccc"));
});

test("moderate/low cyclic toolchain packages remain ignored beside the covered High chain", () => {
  const active = [exceptionRow({ id: "VEX-NPM-001", "package/cve": "GHSA-vfj7-8cjw-p6xm" })];
  const vulns = {
    ...BRACES_CHAIN_VULNS,
    "@vitest/coverage-v8": { severity: "moderate", via: ["vitest"] },
    vitest: {
      severity: "moderate",
      via: [
        "@vitest/coverage-v8",
        { severity: "moderate", url: "https://github.com/advisories/GHSA-82fw-gwwq-j7x9" },
      ],
    },
    leftpad: { severity: "low", via: [] },
  };
  assert.deepEqual(filterUncoveredPolicyFindings(vulns, active), []);
});
