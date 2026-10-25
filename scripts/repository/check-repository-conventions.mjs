#!/usr/bin/env node
/**
 * RHS-1 repository convention checker.
 *
 * Supporting standard: docs/platform/engineering/repository-conventions.md
 * AGENTS.md remains the sole agent operating contract. This script does not
 * delete, rename, or rewrite repository history.
 *
 * Added, renamed, and copied paths are strict. Paths already at the comparison
 * base are a non-failing baseline. Missing comparison provenance fails closed.
 */
import { spawnSync } from "node:child_process";
import path from "node:path";
import { pathToFileURL } from "node:url";

export const CODES = Object.freeze({
  NAMING: "REPO_HYGIENE_NAMING_VIOLATION",
  PLACEMENT: "REPO_HYGIENE_PLACEMENT_VIOLATION",
  PROTECTED: "REPO_HYGIENE_PROTECTED_PATH",
  BASELINE: "REPO_HYGIENE_BASELINE_UNAVAILABLE",
});

const ALLOWED_ROOTS = new Set([
  ".claude",
  ".cursor",
  ".github",
  "archive",
  "artifacts",
  "data",
  "docker",
  "docs",
  "drizzle",
  "figma-sync",
  "public",
  "scripts",
  "src",
  "test-results-customer-ordering",
  "tests",
]);

const SRC_LAYERS = new Set([
  "app",
  "components",
  "data",
  "lib",
  "platform",
  "server",
  "shared",
  "types",
]);

const SRC_ROOT_FILES = new Set([
  "instrumentation.ts",
  "instrumentation-client.ts",
  "middleware.ts",
  "proxy.ts",
]);

const DOCS_ROOTS = new Set(["platform", "uat"]);

const PLATFORM_SUBDIRS = new Set([
  "capabilities",
  "decisions",
  "discovery",
  "engineering",
  "experience",
  "governance",
  "handoffs",
  "history",
  "operations",
  "product",
  "security",
  "testing",
]);

/** Canonical and existing supporting files at docs/platform root. New siblings are rejected. */
const PLATFORM_ROOT_FILES = new Set([
  "ARCHITECTURE.md",
  "EXPERIENCE-DEBT-REGISTER.md",
  "EXPERIENCE.md",
  "PRODUCT-DELIVERY.md",
  "PRODUCT-LANGUAGE.md",
  "README.md",
  "ROADMAP.md",
  "STATE.md",
  "TESTING.md",
  "VISION.md",
  "accepted-foundation-operating-rules.md",
  "architecture-foundation.md",
  "architecture-readiness-review.md",
  "decision-register-historical.md",
  "decision-register.md",
  "implementation-roadmap.md",
  "operating-model.md",
  "order-payment-delivery-model.md",
  "organization-outlet-access-model.md",
  "product-vision.md",
  "roadmap-and-open-decisions.md",
  "v1-product-scope.md",
]);

const APP_RESERVED_STEMS = new Set([
  "page",
  "layout",
  "loading",
  "error",
  "not-found",
  "forbidden",
  "unauthorized",
  "template",
  "default",
  "global-error",
  "route",
  "sitemap",
  "robots",
  "manifest",
  "icon",
  "apple-icon",
  "opengraph-image",
  "twitter-image",
  "favicon",
]);

const APP_RESERVED_EXTENSIONS = new Set([
  "tsx",
  "ts",
  "jsx",
  "js",
  "png",
  "jpg",
  "jpeg",
  "gif",
  "webp",
  "ico",
  "svg",
  "xml",
  "txt",
  "json",
]);

const VAGUE = new Set(["temp", "tmp", "misc", "new", "old", "final", "latest", "fix2", "wip"]);

const GENERATED_PREFIXES = [
  "coverage/",
  ".next/",
  "out/",
  "node_modules/",
  "blob-report/",
  "playwright-report/",
  "test-results/",
  "test-results-customer-auth/",
  "test-results-workforce-auth/",
  "test-results-operations-lifecycle/",
  "test-results-commercial-workspace/",
  "test-results-location-selector-layout/",
  "test-results-customer-ordering-runtime/",
  "artifacts/playwright-report-",
  "artifacts/test-results-",
];

/**
 * @param {string} filePath
 */
function norm(filePath) {
  return filePath.replaceAll("\\", "/");
}

/**
 * @param {string} code
 * @param {string} filePath
 * @param {string} rule
 * @param {string} remediation
 * @param {string} change
 */
function finding(code, filePath, rule, remediation, change) {
  return { code, path: filePath, rule, remediation, change };
}

/**
 * @param {Array<{ code: string, path: string, rule: string }>} findings
 */
function dedupe(findings) {
  const seen = new Set();
  const out = [];
  for (const item of findings) {
    const key = `${item.code}\0${item.path}\0${item.rule}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(item);
  }
  return out;
}

/**
 * @param {string} filePath
 */
function basename(filePath) {
  const parts = filePath.split("/");
  return parts[parts.length - 1] ?? filePath;
}

/**
 * @param {string} segment
 */
function isFrameworkSegment(segment) {
  return (
    (segment.startsWith("(") && segment.endsWith(")")) ||
    (segment.startsWith("@") && segment.length > 1) ||
    (segment.startsWith("[") && segment.endsWith("]"))
  );
}

/**
 * @param {string} name
 */
function isKebabFileName(name) {
  if (name.startsWith(".")) return /^\.[a-z0-9]+([.-][a-z0-9]+)*$/.test(name);
  return /^[a-z0-9]+([.-][a-z0-9]+)*$/.test(name);
}

/**
 * @param {string} segment
 */
function isKebabSegment(segment) {
  return /^_?[a-z0-9]+(-[a-z0-9]+)*$/.test(segment);
}

/**
 * @param {string} name
 */
function isAppReserved(name) {
  if (name === "globals.css") return true;
  const dot = name.lastIndexOf(".");
  if (dot <= 0) return false;
  return APP_RESERVED_STEMS.has(name.slice(0, dot)) && APP_RESERVED_EXTENSIONS.has(name.slice(dot + 1));
}

/**
 * @param {string} name
 */
function isPascalComponent(name) {
  return /^[A-Z][A-Za-z0-9]*\.tsx$/.test(name);
}

/**
 * @param {string} name
 */
function isHookFile(name) {
  return /^use[A-Z][A-Za-z0-9]*\.tsx?$/.test(name);
}

/**
 * Established test stems use kebab-case, PascalCase, or dot-separated module segments.
 * @param {string} stem
 */
function isTestStem(stem) {
  return /^[A-Za-z0-9]+([.-][A-Za-z0-9]+)*$/.test(stem);
}

/**
 * @param {string} name
 */
function isReservedRootName(name) {
  return (
    name === "README.md" ||
    name === "AGENTS.md" ||
    name === "CLAUDE.md" ||
    name === "Dockerfile" ||
    name === "CNAME" ||
    name === "LICENSE" ||
    name === "LICENSE.txt" ||
    name === "SKILL.md" ||
    name === "INDEX.md" ||
    name === "pull_request_template.md"
  );
}

/** Root files already tracked before this placement rule. New siblings are not grandfathered. */
const GRANDFATHERED_ROOT_FILES = new Set(["imp023-fingerprint.json", "menu.json"]);

const ROOT_FRAMEWORK_FILES = new Set(["robots.txt", "sitemap.xml", "next-env.d.ts", "components.json"]);

/**
 * Root is for tool and framework configuration that has to live there.
 * Application source, tests, utilities, and documentation do not.
 * @param {string} name
 */
function isPermittedRootFile(name) {
  if (isReservedRootName(name)) return true;
  if (GRANDFATHERED_ROOT_FILES.has(name)) return true;
  if (ROOT_FRAMEWORK_FILES.has(name)) return true;
  if (name.startsWith(".")) {
    if (name.startsWith(".env")) return name.endsWith(".example") || name === ".env.test" || name === ".env.sample";
    return /^\.[a-z0-9][a-z0-9._-]*$/.test(name);
  }
  if (/^(package\.json|package-lock\.json|pnpm-lock\.yaml|yarn\.lock|npm-shrinkwrap\.json)$/.test(name)) return true;
  if (/^tsconfig(\.[a-z0-9][a-z0-9-]*)*\.json$/.test(name)) return true;
  if (name === "jsconfig.json") return true;
  if (
    /^(next|postcss|eslint|prettier|drizzle|tailwind|vitest|playwright)(\.[a-z0-9][a-z0-9-]*)*\.config\.(mjs|cjs|js|ts|mts|cts)$/.test(
      name,
    )
  ) {
    return true;
  }
  if (/^(compose|docker-compose)(\.[a-z0-9][a-z0-9-]*)*\.(yaml|yml)$/.test(name)) return true;
  return false;
}

/**
 * @param {string} name
 */
function isCanonicalCapabilityOrAdr(name) {
  return /^IMP-\d{3}[A-Z]?(-[a-z0-9]+)*\.md$/.test(name) || /^ADR-\d{3,}(-[a-z0-9]+)*\.md$/.test(name);
}

/**
 * @param {string} filePath
 */
function isDrizzleIdentity(filePath) {
  return (
    /^drizzle\/\d{4}_[a-z0-9_-]+\.sql$/.test(filePath) ||
    /^drizzle\/meta\/\d{4}_snapshot\.json$/.test(filePath) ||
    filePath === "drizzle/meta/_journal.json" ||
    filePath === "drizzle/migration-integrity.json"
  );
}

/**
 * @param {string} filePath
 */
export function isImmutableMigration(filePath) {
  return /^drizzle\/\d{4}_[a-z0-9_-]+\.sql$/.test(filePath) || /^drizzle\/meta\/\d{4}_snapshot\.json$/.test(filePath);
}

/**
 * @param {string} filePath
 */
function isGenerated(filePath) {
  if (GENERATED_PREFIXES.some((prefix) => filePath.startsWith(prefix))) return true;
  return filePath.startsWith("playwright-report-") || filePath.startsWith("dist-");
}

/**
 * @param {string} filePath
 * @returns {Set<string>}
 */
function skippedIdKinds(filePath) {
  if (
    filePath.startsWith("archive/") ||
    filePath.startsWith("docs/platform/history/") ||
    filePath.startsWith("drizzle/") ||
    filePath.startsWith("scripts/fixtures/") ||
    filePath.startsWith("scripts/governance-v2/fixtures/") ||
    filePath.startsWith("test-results-customer-ordering/")
  ) {
    return new Set(["imp", "tranche", "sprint", "issue", "date"]);
  }
  if (
    filePath.startsWith("docs/platform/product/") ||
    filePath.startsWith("docs/platform/capabilities/") ||
    filePath.startsWith("docs/platform/decisions/") ||
    filePath.startsWith("docs/platform/operations/") ||
    filePath.startsWith("docs/platform/governance/") ||
    filePath.startsWith("docs/platform/experience/")
  ) {
    return new Set(["imp"]);
  }
  return new Set();
}

/**
 * @param {string} segment
 */
function vagueToken(segment) {
  const tokens = segment.split(/[-_.]/).filter(Boolean);
  return tokens.find((token) => VAGUE.has(token.toLowerCase())) ?? null;
}

/**
 * @param {string} segment
 * @returns {"imp" | "tranche" | "sprint" | "issue" | "date" | null}
 */
function idKind(segment) {
  if (/imp-?\d{3}[a-z]?/i.test(segment)) return "imp";
  if (/tranche/i.test(segment)) return "tranche";
  if (/sprint/i.test(segment)) return "sprint";
  if (/(^|[-_])issue[-_]?\d+/i.test(segment)) return "issue";
  if (/(^|[-_])20\d{6}($|[-_.])/.test(segment)) return "date";
  return null;
}

/**
 * Task-batch numbers used as filename tokens. The domain word "batch" and
 * encoding tokens such as b64 are not batch identities.
 * @param {string} segment
 */
function batchToken(segment) {
  const tokens = segment.split(/[-_.]/).filter(Boolean);
  for (let index = 0; index < tokens.length; index += 1) {
    const token = tokens[index] ?? "";
    if (/^b\d{1,2}$/i.test(token) && !/^(b16|b32|b64)$/i.test(token)) return token.toLowerCase();
    if (/^batch\d{1,2}$/i.test(token)) return token.toLowerCase();
    const next = tokens[index + 1] ?? "";
    if (/^batch$/i.test(token) && /^\d{1,2}$/.test(next)) return `batch${next}`;
  }
  return null;
}

/**
 * @param {string} kind
 */
function idRemediation(kind) {
  if (kind === "imp") return "Use a functional name. Keep the IMP id in trace metadata, not the filename.";
  if (kind === "tranche" || kind === "sprint") {
    return "Use a functional name. Keep sprint or tranche numbers in trace metadata, not the filename.";
  }
  if (kind === "issue") return "Use a functional name. Keep the issue number in trace metadata, not the filename.";
  return "Use a functional name. A calendar date is not a file name; put the date in trace metadata when it matters.";
}

/**
 * @param {string} filePath
 * @param {string} change
 * @param {Set<string> | null} existingDirectories
 */
function tokenViolations(filePath, change, existingDirectories) {
  const violations = [];
  const skip = skippedIdKinds(filePath);
  const history = filePath.startsWith("docs/platform/history/");
  const parts = filePath.split("/");
  let prefix = "";
  for (let index = 0; index < parts.length; index += 1) {
    const segment = parts[index] ?? "";
    prefix = prefix ? `${prefix}/${segment}` : segment;
    const ancestorAlreadyExists = index < parts.length - 1 && existingDirectories?.has(prefix) === true;
    if (ancestorAlreadyExists) continue;
    if (isFrameworkSegment(segment)) continue;
    if (history) {
      const vague = vagueToken(segment);
      if (vague) {
        violations.push(
          finding(
            CODES.NAMING,
            filePath,
            "no-vague-qualifier",
            `Replace the vague qualifier "${vague}" with a name that describes the artifact.`,
            change,
          ),
        );
      }
      const batch = batchToken(segment);
      if (batch) {
        violations.push(
          finding(
            CODES.NAMING,
            filePath,
            "no-task-batch-filename",
            `Use a functional name. The task-batch id "${batch}" belongs in trace metadata, not the filename.`,
            change,
          ),
        );
      }
      continue;
    }
    if (filePath.startsWith("docs/platform/product/") && /^IMP-\d{3}[A-Z]?$/.test(segment)) continue;
    const vague = vagueToken(segment);
    if (vague) {
      violations.push(
        finding(
          CODES.NAMING,
          filePath,
          "no-vague-qualifier",
          `Replace the vague qualifier "${vague}" with a name that describes the artifact.`,
          change,
        ),
      );
    }
    const kind = idKind(segment);
    if (kind && !skip.has(kind)) {
      violations.push(finding(CODES.NAMING, filePath, "no-governance-id-filename", idRemediation(kind), change));
    }
    const batch = batchToken(segment);
    if (batch) {
      violations.push(
        finding(
          CODES.NAMING,
          filePath,
          "no-task-batch-filename",
          `Use a functional name. The task-batch id "${batch}" belongs in trace metadata, not the filename.`,
          change,
        ),
      );
    }
  }
  return violations;
}

/**
 * @param {string} filePath
 * @param {string} change
 */
function shapeViolation(filePath, change) {
  const name = basename(filePath);
  if (isDrizzleIdentity(filePath)) return null;
  if (filePath.startsWith("docs/platform/history/")) return null;
  if (filePath.startsWith("archive/")) return null;
  if (filePath.startsWith("public/")) return null;
  if (filePath.startsWith("test-results-customer-ordering/")) return null;
  if (isReservedRootName(name)) return null;
  if (PLATFORM_ROOT_FILES.has(name) && filePath === `docs/platform/${name}`) return null;
  if (filePath.startsWith("src/app/") && isAppReserved(name)) return null;
  if (
    (filePath.startsWith("docs/platform/capabilities/") ||
      filePath.startsWith("docs/platform/decisions/") ||
      filePath.startsWith("docs/platform/experience/")) &&
    (isCanonicalCapabilityOrAdr(name) || /^IMP-\d{3}[A-Z]?[-A-Za-z0-9]*\.(md|png)$/.test(name))
  ) {
    return null;
  }

  if (name.endsWith(".spec.ts")) {
    if (!/^[a-z0-9]+(-[a-z0-9]+)*\.spec\.ts$/.test(name)) {
      return finding(
        CODES.NAMING,
        filePath,
        "e2e-spec-suffix",
        "Name a browser journey tests/e2e/<journey>.spec.ts using kebab-case.",
        change,
      );
    }
    return null;
  }
  const integration = name.match(/^(.*)\.integration\.test\.(tsx|ts|mjs)$/);
  if (integration) {
    if (isTestStem(integration[1] ?? "")) return null;
    return finding(
      CODES.NAMING,
      filePath,
      "test-suffix",
      "Name integration tests <behavior-or-module>.integration.test.ts, .integration.test.tsx, or .integration.test.mjs.",
      change,
    );
  }
  const unit = name.match(/^(.*)\.test\.(tsx|ts|mjs)$/);
  if (unit) {
    if (isTestStem(unit[1] ?? "")) return null;
    return finding(
      CODES.NAMING,
      filePath,
      "test-suffix",
      "Name tests <behavior-or-module>.test.ts, .test.tsx, or .test.mjs. Dot-separated module segments are allowed.",
      change,
    );
  }
  if (
    (filePath.startsWith("src/components/") || filePath.startsWith("src/app/")) &&
    (isPascalComponent(name) || isHookFile(name))
  ) {
    return null;
  }
  if (/\.(ttf|otf|woff2?)$/.test(name)) return null;
  if (isKebabFileName(name)) return null;
  return finding(
    CODES.NAMING,
    filePath,
    "filename-shape",
    "Use kebab-case for modules, scripts, and supporting documents. React component files may use PascalCase .tsx, and component hooks may use useThing.tsx.",
    change,
  );
}

/**
 * Naming and placement rules for a path introduced today.
 * Protected-mutation rules are applied separately by evaluateChange.
 *
 * @param {string} rawPath
 * @param {{ existingDirectories?: Set<string> | null }} [options]
 * @returns {Array<{ code: string, path: string, rule: string, remediation: string, change: string }>}
 */
export function introductionViolations(rawPath, options = {}) {
  const filePath = norm(rawPath);
  const change = "added";
  const existingDirectories = options.existingDirectories ?? null;
  const violations = [];
  const parts = filePath.split("/");
  const name = parts[parts.length - 1] ?? filePath;

  if (!filePath.includes("/")) {
    violations.push(...tokenViolations(filePath, change, existingDirectories));
    const shape = shapeViolation(filePath, change);
    if (shape) violations.push(shape);
    if (!isPermittedRootFile(name)) {
      violations.push(
        finding(
          CODES.PLACEMENT,
          filePath,
          "root-file-placement",
          "Repository root is reserved for project and tool configuration. Place application source, tests, utilities, and documentation in the existing architectural directory for that work.",
          change,
        ),
      );
    }
    return dedupe(violations);
  }

  const root = parts[0];
  if (!ALLOWED_ROOTS.has(root ?? "")) {
    violations.push(
      finding(
        CODES.PLACEMENT,
        filePath,
        "allowed-root",
        "Place the file under an existing repository root. Do not add a new top-level directory.",
        change,
      ),
    );
  }

  if (root === "src") {
    if (parts.length === 2 && !SRC_ROOT_FILES.has(name)) {
      violations.push(
        finding(
          CODES.PLACEMENT,
          filePath,
          "src-layer",
          "Place new source under src/app, src/components, src/lib, src/server, src/shared, src/platform, src/data, or src/types. src/instrumentation.ts and src/middleware.ts are the framework entry exceptions.",
          change,
        ),
      );
    } else if (parts.length > 2 && !SRC_LAYERS.has(parts[1] ?? "")) {
      violations.push(
        finding(
          CODES.PLACEMENT,
          filePath,
          "src-layer",
          "Place new source under src/app, src/components, src/lib, src/server, src/shared, src/platform, src/data, or src/types.",
          change,
        ),
      );
    }
  }

  if (root === "docs") {
    if (parts.length < 3 || !DOCS_ROOTS.has(parts[1] ?? "")) {
      violations.push(
        finding(
          CODES.PLACEMENT,
          filePath,
          "docs-layer",
          "Place documentation under docs/platform/<existing area> or docs/uat.",
          change,
        ),
      );
    } else if (parts[1] === "platform" && parts.length === 3 && !PLATFORM_ROOT_FILES.has(name)) {
      violations.push(
        finding(
          CODES.PLACEMENT,
          filePath,
          "docs-platform-root",
          "Do not add a new file at docs/platform root. Use an existing subtree such as engineering, discovery, operations, product, or testing.",
          change,
        ),
      );
    } else if (parts[1] === "platform" && parts.length > 3 && !PLATFORM_SUBDIRS.has(parts[2] ?? "")) {
      violations.push(
        finding(
          CODES.PLACEMENT,
          filePath,
          "docs-platform-subdir",
          "Use an existing docs/platform subtree. Do not invent a new platform documentation area.",
          change,
        ),
      );
    }
  }

  if (root === "tests" && parts.length === 2) {
    violations.push(
      finding(
        CODES.PLACEMENT,
        filePath,
        "tests-feature-folder",
        "Place tests under tests/<feature> or tests/e2e.",
        change,
      ),
    );
  }

  if (root === "drizzle" && !isDrizzleIdentity(filePath)) {
    violations.push(
      finding(
        CODES.PLACEMENT,
        filePath,
        "drizzle-migration-identity",
        "Add only a new drizzle/NNNN_description.sql migration or its meta snapshot. Do not add other files under drizzle/.",
        change,
      ),
    );
  }

  if (name.endsWith(".spec.ts") && !filePath.startsWith("tests/e2e/")) {
    violations.push(
      finding(
        CODES.PLACEMENT,
        filePath,
        "e2e-spec-location",
        "Browser journey specs belong in tests/e2e/<journey>.spec.ts.",
        change,
      ),
    );
  }

  if (filePath.startsWith("tests/e2e/") && (name.endsWith(".test.ts") || name.endsWith(".test.tsx"))) {
    violations.push(
      finding(
        CODES.NAMING,
        filePath,
        "e2e-spec-suffix",
        "Name browser journeys tests/e2e/<journey>.spec.ts. Put support modules in tests/e2e/support.",
        change,
      ),
    );
  }

  if (name.endsWith(".test.mjs") && !filePath.startsWith("scripts/")) {
    violations.push(
      finding(
        CODES.PLACEMENT,
        filePath,
        "script-test-location",
        "Node script tests discovered by test:scripts live under scripts/**/<behavior>.test.mjs.",
        change,
      ),
    );
  }

  if (filePath.startsWith("src/app/")) {
    const allowed =
      isAppReserved(name) ||
      isPascalComponent(name) ||
      isHookFile(name) ||
      name.endsWith(".test.tsx") ||
      name.endsWith(".css") ||
      name.endsWith(".svg");
    if (!allowed) {
      violations.push(
        finding(
          CODES.PLACEMENT,
          filePath,
          "src-app-route-file",
          "src/app holds framework routes and colocated UI. Use a reserved route filename or a PascalCase component. Place domain logic under src/server, src/lib, or src/shared.",
          change,
        ),
      );
    }
  }

  for (let index = 0; index < parts.length - 1; index += 1) {
    const segment = parts[index] ?? "";
    if (index === 0 && ALLOWED_ROOTS.has(segment)) continue;
    if (isFrameworkSegment(segment)) continue;
    if (
      filePath.startsWith("docs/platform/history/") ||
      filePath.startsWith("archive/") ||
      filePath.startsWith("test-results-customer-ordering/")
    ) {
      continue;
    }
    if (filePath.startsWith("docs/platform/product/") && /^IMP-\d{3}[A-Z]?$/.test(segment)) continue;
    if (!isKebabSegment(segment)) {
      violations.push(
        finding(
          CODES.NAMING,
          filePath,
          "directory-kebab-case",
          "Name directories in kebab-case. Framework route groups, dynamic segments, and canonical IMP product directories are the exceptions.",
          change,
        ),
      );
    }
  }

  violations.push(...tokenViolations(filePath, change, existingDirectories));
  const shape = shapeViolation(filePath, change);
  if (shape) violations.push(shape);
  return dedupe(violations);
}

/**
 * @param {string} filePath
 * @param {string} change
 */
function forbiddenIntroduction(filePath, change) {
  if (filePath === "archive/src" || filePath.startsWith("archive/src/")) {
    return finding(
      CODES.PROTECTED,
      filePath,
      "no-importable-archive-source",
      "Do not park retired executable source under archive/src. Git history is the archive for executable code.",
      change,
    );
  }
  if (filePath.startsWith(".cursor/rules/") || filePath.startsWith(".agents/")) {
    return finding(
      CODES.PROTECTED,
      filePath,
      "no-second-agent-rules",
      "AGENTS.md is the sole agent operating contract. Do not add .cursor/rules or a duplicate .agents skill tree.",
      change,
    );
  }
  if (isGenerated(filePath)) {
    return finding(
      CODES.PROTECTED,
      filePath,
      "generated-output",
      "Do not commit generated test output, coverage, or build artifacts. Ignore them locally or keep them as CI artifacts.",
      change,
    );
  }
  if (filePath.startsWith("test-results-customer-ordering/")) {
    return finding(
      CODES.PROTECTED,
      filePath,
      "protected-evidence",
      "Do not add files under the protected customer-ordering evidence prefix. Keep new generated output in an ignored runtime directory.",
      change,
    );
  }
  return null;
}

/**
 * @param {{ kind: string, path: string, previousPath?: string }} change
 */
function mutationViolations(change) {
  const target = change.kind === "renamed" || change.kind === "copied" ? change.previousPath : change.path;
  if (!target) return [];
  if (change.kind === "added") return [];
  const violations = [];
  if (isImmutableMigration(target)) {
    violations.push(
      finding(
        CODES.PROTECTED,
        target,
        "immutable-migration",
        "Do not edit, rename, or delete an existing Drizzle SQL migration or snapshot. Add a new migration instead.",
        change.kind,
      ),
    );
  }
  if (
    (target === "drizzle/meta/_journal.json" || target === "drizzle/migration-integrity.json") &&
    (change.kind === "deleted" || change.kind === "renamed" || change.kind === "copied")
  ) {
    violations.push(
      finding(
        CODES.PROTECTED,
        target,
        "immutable-migration",
        "Do not delete or rename Drizzle journal or migration-integrity metadata. A new migration may update the journal in place.",
        change.kind,
      ),
    );
  }
  if (target.startsWith("docs/platform/history/")) {
    const supportingIndexEdit = target === "docs/platform/history/README.md" && change.kind === "modified";
    if (!supportingIndexEdit) {
      violations.push(
        finding(
          CODES.PROTECTED,
          target,
          "immutable-history",
          "Do not edit, rename, or delete an immutable historical snapshot. docs/platform/history/README.md is the supporting index and may be updated in place. Add a new snapshot only when governance reconciliation requires one.",
          change.kind,
        ),
      );
    }
  }
  if (
    target.startsWith("test-results-customer-ordering/") &&
    (change.kind === "deleted" || change.kind === "renamed" || change.kind === "copied")
  ) {
    violations.push(
      finding(
        CODES.PROTECTED,
        target,
        "protected-evidence",
        "Do not delete or rename protected customer-ordering evidence in a hygiene change. Disposition requires a separate authorized review.",
        change.kind,
      ),
    );
  }
  return violations;
}

/**
 * @param {{ kind: "added" | "renamed" | "copied" | "modified" | "deleted", path: string, previousPath?: string }} change
 * @param {{ existingDirectories?: Set<string> | null }} [options]
 */
export function evaluateChange(change, options = {}) {
  const kind = change.kind;
  const filePath = norm(change.path);
  if (kind === "modified" || kind === "deleted") {
    return dedupe(mutationViolations({ ...change, path: filePath }));
  }
  if (kind === "added" || kind === "renamed" || kind === "copied") {
    const introduced = introductionViolations(filePath, options).map((item) => ({ ...item, change: kind }));
    const forbidden = forbiddenIntroduction(filePath, kind);
    const mutated = kind === "added" ? [] : mutationViolations({ ...change, path: filePath, previousPath: change.previousPath ? norm(change.previousPath) : undefined });
    return dedupe([...introduced, ...(forbidden ? [forbidden] : []), ...mutated]);
  }
  return [];
}

/**
 * @param {string} repo
 * @param {string[]} args
 */
function git(repo, args) {
  return spawnSync("git", ["-C", repo, ...args], { encoding: "utf8" });
}

/**
 * @param {string} repo
 * @param {string | undefined} rev
 */
function verifyCommit(repo, rev) {
  if (!rev || /^0+$/.test(rev)) return null;
  const parsed = git(repo, ["rev-parse", "--verify", `${rev}^{commit}`]);
  if (parsed.status !== 0) return null;
  return parsed.stdout.trim();
}

/**
 * @param {string} text
 */
function parseNameStatusZ(text) {
  const parts = text.split("\0");
  if (parts.at(-1) === "") parts.pop();
  /** @type {Array<{ kind: "added" | "renamed" | "copied" | "modified" | "deleted", path: string, previousPath?: string }>} */
  const changes = [];
  for (let index = 0; index < parts.length; ) {
    const status = parts[index++];
    if (!status) break;
    if (status.startsWith("R") || status.startsWith("C")) {
      const previousPath = parts[index++];
      const nextPath = parts[index++];
      if (!previousPath || !nextPath) break;
      changes.push({
        kind: status.startsWith("R") ? "renamed" : "copied",
        path: norm(nextPath),
        previousPath: norm(previousPath),
      });
      continue;
    }
    const filePath = parts[index++];
    if (!filePath) break;
    let kind = "modified";
    if (status.startsWith("A")) kind = "added";
    else if (status.startsWith("D")) kind = "deleted";
    changes.push({ kind, path: norm(filePath) });
  }
  return changes;
}

/**
 * @param {string} text
 */
function parseStatusZ(text) {
  const records = text.split("\0");
  if (records.at(-1) === "") records.pop();
  /** @type {Array<{ kind: "added" | "renamed" | "copied" | "modified" | "deleted", path: string, previousPath?: string }>} */
  const changes = [];
  for (let index = 0; index < records.length; index += 1) {
    const record = records[index] ?? "";
    if (record.length < 4) continue;
    const xy = record.slice(0, 2);
    const filePath = norm(record.slice(3));
    // Porcelain v1 -z renames are "to from": this record is the destination,
    // and the next NUL-terminated record is the source. git diff --name-status -z
    // is the opposite order and is parsed by parseNameStatusZ.
    if (xy.includes("R") || xy.includes("C")) {
      const sourcePath = records[index + 1];
      index += 1;
      if (!sourcePath) break;
      changes.push({
        kind: xy.includes("R") ? "renamed" : "copied",
        path: filePath,
        previousPath: norm(sourcePath),
      });
      continue;
    }
    if (xy === "??" || xy.includes("A")) changes.push({ kind: "added", path: filePath });
    else if (xy.includes("D")) changes.push({ kind: "deleted", path: filePath });
    else if (xy.includes("M") || xy.includes("T")) changes.push({ kind: "modified", path: filePath });
  }
  return changes;
}

/**
 * @param {Array<{ kind: string, path: string, previousPath?: string }>} left
 * @param {Array<{ kind: string, path: string, previousPath?: string }>} right
 */
function mergeChanges(left, right) {
  const rank = { added: 4, renamed: 4, copied: 4, deleted: 2, modified: 1 };
  const map = new Map();
  for (const change of [...left, ...right]) {
    const current = map.get(change.path);
    if (!current || (rank[change.kind] ?? 0) > (rank[current.kind] ?? 0)) map.set(change.path, change);
  }
  return [...map.values()];
}

/**
 * @param {{ code: string, change: string, path: string, rule: string, remediation: string }} item
 */
function formatFinding(item) {
  return `${item.code} change=${item.change} path=${item.path} rule=${item.rule} remediation=${item.remediation}`;
}

/**
 * @param {string[]} argv
 */
export function parseArgs(argv) {
  /** @type {{ repo: string, base?: string, head?: string, includeWorktree: boolean, help: boolean }} */
  const opts = {
    repo: process.cwd(),
    base: process.env.REPO_HYGIENE_BASE || undefined,
    head: process.env.REPO_HYGIENE_HEAD || undefined,
    includeWorktree: true,
    help: false,
  };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--repo") opts.repo = argv[++index] ?? opts.repo;
    else if (arg === "--base") opts.base = argv[++index];
    else if (arg === "--head") opts.head = argv[++index];
    else if (arg === "--no-worktree") opts.includeWorktree = false;
    else if (arg === "--help") opts.help = true;
  }
  if (opts.base === "") opts.base = undefined;
  if (opts.head === "") opts.head = undefined;
  return opts;
}

/**
 * @param {{ repo?: string, base?: string, head?: string, includeWorktree?: boolean }} options
 */
export function runRepositoryHygiene(options) {
  const repo = path.resolve(options.repo ?? process.cwd());
  const head = verifyCommit(repo, options.head ?? "HEAD");
  if (!head) {
    return {
      exitCode: 2,
      lines: [
        formatFinding(
          finding(
            CODES.BASELINE,
            options.head ?? "HEAD",
            "comparison-head",
            "The head commit is not present. Fetch full history before classifying new paths. The checker does not pass without that provenance.",
            "unavailable",
          ),
        ),
      ],
    };
  }

  let requestedBase = options.base;
  if (!requestedBase) {
    const origin = verifyCommit(repo, "origin/main");
    if (!origin) {
      return {
        exitCode: 2,
        lines: [
          formatFinding(
            finding(
              CODES.BASELINE,
              "origin/main",
              "comparison-base",
              "No --base or REPO_HYGIENE_BASE was provided, and origin/main is not available. Pass the pull-request base commit. The checker does not pass when the comparison base is missing.",
              "unavailable",
            ),
          ),
        ],
      };
    }
    const mergeBase = git(repo, ["merge-base", head, origin]);
    if (mergeBase.status !== 0) {
      return {
        exitCode: 2,
        lines: [
          formatFinding(
            finding(
              CODES.BASELINE,
              "origin/main",
              "comparison-base",
              "HEAD and origin/main have no merge base. Fetch the missing history. The checker does not pass when the comparison base cannot be resolved.",
              "unavailable",
            ),
          ),
        ],
      };
    }
    requestedBase = mergeBase.stdout.trim();
  }

  const base = verifyCommit(repo, requestedBase);
  if (!base) {
    return {
      exitCode: 2,
      lines: [
        formatFinding(
          finding(
            CODES.BASELINE,
            requestedBase,
            "comparison-base",
            "The comparison base is missing, shallow, or not a commit (including the all-zero push sentinel). Fetch the base with full history. The checker does not treat a missing base as a pass.",
            "unavailable",
          ),
        ),
      ],
    };
  }

  const mergeBase = git(repo, ["merge-base", base, head]);
  if (mergeBase.status !== 0) {
    return {
      exitCode: 2,
      lines: [
        formatFinding(
          finding(
            CODES.BASELINE,
            base,
            "comparison-base",
            "The base and head commits have no merge base. The checker does not pass when new and grandfathered paths cannot be distinguished.",
            "unavailable",
          ),
        ),
      ],
    };
  }

  const diff = git(repo, ["diff", "--name-status", "--find-renames", "-z", `${base}...${head}`]);
  if (diff.status !== 0) {
    return {
      exitCode: 2,
      lines: [
        formatFinding(
          finding(
            CODES.BASELINE,
            base,
            "comparison-base",
            "git diff against the comparison base failed. The checker does not pass when the change set cannot be read.",
            "unavailable",
          ),
        ),
      ],
    };
  }

  const directories = git(repo, ["ls-tree", "-r", "-d", "--name-only", base]);
  if (directories.status !== 0) {
    return {
      exitCode: 2,
      lines: [
        formatFinding(
          finding(
            CODES.BASELINE,
            base,
            "comparison-base",
            "The base tree directories could not be listed. The checker does not pass when it cannot tell a new directory from a legacy one.",
            "unavailable",
          ),
        ),
      ],
    };
  }
  const existingDirectories = new Set(directories.stdout.split("\n").filter(Boolean));

  let changes = parseNameStatusZ(diff.stdout);
  if (options.includeWorktree !== false) {
    const status = git(repo, ["status", "--porcelain=v1", "-z", "-uall"]);
    if (status.status !== 0) {
      return {
        exitCode: 2,
        lines: [
          formatFinding(
            finding(
              CODES.BASELINE,
              repo,
              "worktree-status",
              "git status failed, so uncommitted paths could not be classified. The checker does not pass without that provenance.",
              "unavailable",
            ),
          ),
        ],
      };
    }
    changes = mergeChanges(changes, parseStatusZ(status.stdout));
  }

  /** @type {Array<{ code: string, path: string, rule: string, remediation: string, change: string }>} */
  const strict = [];
  const strictPaths = new Set();
  for (const change of changes) {
    const evaluated = evaluateChange(change, { existingDirectories });
    if (change.kind === "added" || change.kind === "renamed" || change.kind === "copied") strictPaths.add(change.path);
    strict.push(...evaluated);
  }

  const listed = git(repo, ["ls-files", "-z"]);
  if (listed.status !== 0) {
    return {
      exitCode: 2,
      lines: [
        formatFinding(
          finding(
            CODES.BASELINE,
            repo,
            "tracked-files",
            "git ls-files failed, so the legacy baseline could not be reported. The checker does not pass without that inventory.",
            "unavailable",
          ),
        ),
      ],
    };
  }
  const tracked = listed.stdout.split("\0").filter(Boolean).map(norm);
  /** @type {Array<{ code: string, path: string, rule: string, remediation: string, change: string }>} */
  const baseline = [];
  for (const filePath of tracked) {
    if (strictPaths.has(filePath)) continue;
    for (const item of introductionViolations(filePath, { existingDirectories })) {
      baseline.push({
        ...item,
        change: "grandfathered",
        remediation: "Grandfathered path. This does not fail the check. Rename or move it only in a separately authorized cleanup.",
      });
    }
  }
  baseline.sort((left, right) => (left.path < right.path ? -1 : left.path > right.path ? 1 : left.rule < right.rule ? -1 : 1));

  const lines = [`REPO_HYGIENE_COMPARISON base=${base} head=${head}`];
  for (const item of strict) lines.push(formatFinding(item));
  const naming = baseline.filter((item) => item.code === CODES.NAMING).length;
  const placement = baseline.filter((item) => item.code === CODES.PLACEMENT).length;
  lines.push(`REPO_HYGIENE_BASELINE_SUMMARY naming=${naming} placement=${placement} tracked=${tracked.length}`);
  for (const item of baseline.slice(0, 12)) {
    lines.push(
      `REPO_HYGIENE_BASELINE code=${item.code} change=grandfathered path=${item.path} rule=${item.rule} remediation=${item.remediation}`,
    );
  }
  if (strict.length === 0) {
    lines.push(`REPO_HYGIENE_PASS strict_violations=0 baseline_naming=${naming} baseline_placement=${placement}`);
  }
  return { exitCode: strict.length === 0 ? 0 : 1, lines };
}

function main() {
  const opts = parseArgs(process.argv.slice(2));
  if (opts.help) {
    console.log(
      "Usage: node scripts/repository/check-repository-conventions.mjs [--base SHA] [--head SHA] [--repo DIR] [--no-worktree]",
    );
    return 0;
  }
  const result = runRepositoryHygiene(opts);
  for (const line of result.lines) console.log(line);
  return result.exitCode;
}

const invoked = process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href;
if (invoked) process.exit(main());
