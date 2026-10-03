#!/usr/bin/env node
/**
 * Unit tests for IMP-038 SCA exception filtering (no live npm audit required).
 *
 * Invariant: every High/Critical advisory must itself be covered by an ACTIVE
 * exception. One matched GHSA/CVE must never implicitly cover another advisory.
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

test("package-name exception covers that package only (register contract)", () => {
  const vulns = {
    lodash: {
      severity: "high",
      via: [
        { severity: "high", url: "https://github.com/advisories/GHSA-aaaa-bbbb-cccc" },
        { severity: "high", url: "https://github.com/advisories/GHSA-dddd-eeee-ffff" },
      ],
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

test("VEX-NPM-001..005 parse as ACTIVE on 2026-10-03 and expire after 2026-10-17", () => {
  const registerPath = path.join(
    path.dirname(fileURLToPath(import.meta.url)),
    "..",
    "docs/platform/security/vulnerability-exception-register.md",
  );
  const markdown = readFileSync(registerPath, "utf8");
  const { rows, errors } = parseExceptionRegister(markdown);
  assert.deepEqual(errors, []);
  const ids = ["VEX-NPM-001", "VEX-NPM-002", "VEX-NPM-003", "VEX-NPM-004", "VEX-NPM-005"];
  const vexRows = ids.map((id) => {
    const row = rows.find((r) => r.id === id);
    assert.ok(row, `missing ${id}`);
    return row;
  });
  assert.equal(vexRows[0]["package/cve"], "GHSA-vfj7-8cjw-p6xm");
  assert.equal(vexRows[1]["package/cve"], "@next/eslint-plugin-next");
  assert.equal(vexRows[2]["package/cve"], "eslint-config-next");
  assert.equal(vexRows[3]["package/cve"], "fast-glob");
  assert.equal(vexRows[4]["package/cve"], "micromatch");
  for (const row of vexRows) {
    assert.equal(row.severity, "high");
    assert.equal(row.owner, "platform-security");
    assert.equal(row.retest_date, "2026-10-10");
    assert.equal(row.expiry, "2026-10-17");
    assert.match(row.authority, /5966965948/);
    assert.equal(isActiveExpiry("2026-10-03", row.expiry), true);
    assert.equal(isActiveExpiry("2026-10-17", row.expiry), true);
    assert.equal(isActiveExpiry("2026-10-18", row.expiry), false);
  }
  assert.equal(activeExceptions(vexRows, "2026-10-03").length, 5);
  assert.equal(activeExceptions(vexRows, "2026-10-17").length, 5);
  assert.equal(activeExceptions(vexRows, "2026-10-18").length, 0);
});

test("root GHSA exception does not cover inherited package-level High findings", () => {
  const active = [exceptionRow({ "package/cve": "GHSA-vfj7-8cjw-p6xm" })];
  const uncovered = filterUncoveredPolicyFindings(BRACES_CHAIN_VULNS, active);
  assert.equal(uncovered.length, 4);
  assert.deepEqual(
    uncovered.map((f) => f.packageName).sort(),
    ["@next/eslint-plugin-next", "eslint-config-next", "fast-glob", "micromatch"],
  );
});

test("authorized five ACTIVE tokens cover the current braces-chain High findings only", () => {
  const active = [
    exceptionRow({ id: "VEX-NPM-001", "package/cve": "GHSA-vfj7-8cjw-p6xm" }),
    exceptionRow({ id: "VEX-NPM-002", "package/cve": "@next/eslint-plugin-next" }),
    exceptionRow({ id: "VEX-NPM-003", "package/cve": "eslint-config-next" }),
    exceptionRow({ id: "VEX-NPM-004", "package/cve": "fast-glob" }),
    exceptionRow({ id: "VEX-NPM-005", "package/cve": "micromatch" }),
  ];
  assert.deepEqual(filterUncoveredPolicyFindings(BRACES_CHAIN_VULNS, active), []);
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
});

test("expired VEX-NPM braces-chain rows fail closed after 2026-10-17", () => {
  const rows = [
    exceptionRow({ id: "VEX-NPM-001", "package/cve": "GHSA-vfj7-8cjw-p6xm", expiry: "2026-10-17" }),
    exceptionRow({ id: "VEX-NPM-002", "package/cve": "@next/eslint-plugin-next", expiry: "2026-10-17" }),
    exceptionRow({ id: "VEX-NPM-003", "package/cve": "eslint-config-next", expiry: "2026-10-17" }),
    exceptionRow({ id: "VEX-NPM-004", "package/cve": "fast-glob", expiry: "2026-10-17" }),
    exceptionRow({ id: "VEX-NPM-005", "package/cve": "micromatch", expiry: "2026-10-17" }),
  ];
  const expired = activeExceptions(rows, "2026-10-18");
  assert.equal(expired.length, 0);
  assert.equal(filterUncoveredPolicyFindings(BRACES_CHAIN_VULNS, expired).length, 5);
});
