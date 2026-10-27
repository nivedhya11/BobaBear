import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Historical design archive and Figma tooling — not shipped app code,
    // so they shouldn't gate `npm run lint`.
    "archive/design-history/**",
    "figma-sync/**",
    // Generated Vitest coverage report — not shipped app code.
    "coverage/**",
    // Compiled customer-auth service output (IMP-009) — not source.
    "dist-customer-auth/**",
    // Compiled workforce-auth service output (IMP-010) — not source.
    "dist-workforce-auth/**",
    // Compiled customer-commerce service output (IMP-024) — not source.
    "dist-customer-commerce/**",
    // Local tooling caches (Playwright browsers, etc.) — never linted.
    ".cache/**",
    // Playwright HTML reports / result dumps — not source.
    "playwright-report/**",
    "playwright-report-*/**",
    "test-results/**",
    "test-results-*/**",
    "artifacts/**",
  ]),
  // Configuration-boundary enforcement (ADR-015 / IMP-003): application
  // source must go through the centralized, typed configuration module
  // instead of reading `process.env` directly. The only approved
  // exceptions are the config module itself and the Next.js instrumentation
  // entry point (a documented, narrow framework-bootstrap exception — see
  // src/instrumentation.ts). Tests exercise the boundary with explicit
  // source objects, not by reading the real process environment.
  {
    files: ["src/**/*.{ts,tsx,js,jsx}"],
    ignores: [
      "src/platform/config/**",
      "src/instrumentation.ts",
      // The customer-auth HTTP service (IMP-009) is a standalone Node
      // process, not part of the Next.js web process — `main.ts` is its own
      // narrow, documented executable boundary, exactly like
      // `src/instrumentation.ts` above. Every other module under
      // `src/server/customer-auth/**` still goes through `./config.ts`.
      "src/server/customer-auth/main.ts",
      // The workforce-auth HTTP service (IMP-010) is a standalone Node
      // process — `main.ts` is its own narrow, documented executable
      // boundary, matching customer-auth above.
      "src/server/workforce-auth/main.ts",
      // The customer-commerce HTTP service (IMP-024) is a standalone Node
      // process — `main.ts` is its own narrow, documented executable
      // boundary, matching customer-auth / workforce-auth. `e2e-fake-main.ts`
      // is the E2E-only fake Payment entry (same process-env boundary).
      "src/server/customer-commerce/main.ts",
      "src/server/customer-commerce/e2e-fake-main.ts",
      // The Operations HTTP service (IMP-029) is likewise a standalone
      // Node process; only this executable entry may read process.env.
      "src/server/operations/main.ts",
      "**/*.test.{ts,tsx}",
      // Pre-existing, out-of-scope legacy usage (NEXT_PUBLIC_SITE_URL /
      // NEXT_PUBLIC_GA_MEASUREMENT_ID) that predates IMP-003 and is wired
      // through the existing GitHub Pages deploy workflow. Reported as a
      // known limitation rather than migrated — see AGENTS.md section 29.
      "src/lib/site.ts",
      "src/components/Analytics.tsx",
      "src/lib/customer-location/maps-js-config.ts",
    ],
    rules: {
      "no-restricted-properties": [
        "error",
        {
          object: "process",
          property: "env",
          message:
            "Do not read process.env directly. Import the typed configuration boundary from src/platform/config instead (see AGENTS.md).",
        },
      ],
    },
  },
  // Database-boundary enforcement (IMP-004): application source must go
  // through the centralized database module instead of importing the raw
  // Postgres driver or constructing a Pool directly. The only approved
  // exception is the database boundary itself.
  {
    files: ["src/**/*.{ts,tsx,js,jsx}"],
    ignores: ["src/platform/database/**", "**/*.test.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "pg",
              message:
                "Do not import 'pg' directly. Use src/platform/database instead (see AGENTS.md).",
            },
            {
              name: "drizzle-orm/node-postgres",
              message:
                "Do not import 'drizzle-orm/node-postgres' directly. Use src/platform/database instead (see AGENTS.md).",
            },
            {
              name: "drizzle-orm/node-postgres/migrator",
              message:
                "Do not import the Drizzle migrator directly. Use src/platform/database instead (see AGENTS.md).",
            },
          ],
        },
      ],
    },
  },
  // Browser authority boundary (ARCH-G11 / D-368). The static-export graph
  // must not take a runtime dependency on server, database, or legacy menu
  // authority. This is preventive enforcement of the existing boundary, not
  // a new architecture rule.
  //
  // Flat config replaces `no-restricted-imports` for a file when a later
  // block sets that rule. The database bans above are therefore repeated
  // here so client files keep them.
  //
  // Patterns are anchored regexes, not `**/server/**`. That gitignore form
  // also matches the legitimate Next.js module `next/server`. Only alias
  // `@/server` and relative paths that address `server` or `src/server`
  // are forbidden. `src/server/**`, `src/platform/**`, `src/instrumentation.ts`,
  // and the Node service entrypoints are outside these globs, so
  // server-to-server imports and the framework bootstrap stay allowed.
  // Tests are not browser runtime and stay out of this block.
  {
    files: [
      "src/app/**/*.{ts,tsx,js,jsx}",
      "src/components/**/*.{ts,tsx,js,jsx}",
      "src/lib/**/*.{ts,tsx,js,jsx}",
    ],
    ignores: ["**/*.test.{ts,tsx}", "**/*.spec.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "pg",
              message:
                "Do not import 'pg' directly. Use src/platform/database instead (see AGENTS.md).",
            },
            {
              name: "drizzle-orm/node-postgres",
              message:
                "Do not import 'drizzle-orm/node-postgres' directly. Use src/platform/database instead (see AGENTS.md).",
            },
            {
              name: "drizzle-orm/node-postgres/migrator",
              message:
                "Do not import the Drizzle migrator directly. Use src/platform/database instead (see AGENTS.md).",
            },
          ],
          patterns: [
            {
              regex:
                "^(?:@/server(?:/.*)?|(?:\\.{1,2}/)+(?:src/)?server(?:/.*)?)$",
              caseSensitive: false,
              allowTypeImports: true,
              message:
                "Do not import server authority into a browser-facing module. Commercial truth stays on the server (ARCH-G11).",
            },
            {
              regex:
                "^(?:@/platform/database(?:/.*)?|(?:\\.{1,2}/)+(?:src/)?platform/database(?:/.*)?)$",
              caseSensitive: false,
              allowTypeImports: true,
              message:
                "Do not import the database runtime into a browser-facing module. Persistence stays on the server (ARCH-G11).",
            },
            {
              regex:
                "^(?:@/data/(?:menu|ordering-catalog)\\.json|(?:\\.{1,2}/)+(?:src/)?data/(?:menu|ordering-catalog)\\.json)(?:\\?.*)?$",
              caseSensitive: false,
              allowTypeImports: true,
              message:
                "Do not import legacy menu artifacts into a browser-facing module. The customer menu is the customer-commerce read projection (D-368).",
            },
          ],
        },
      ],
    },
  },
]);

export default eslintConfig;
