#!/usr/bin/env -S node --import tsx
/**
 * S3 configuration projection adapter.
 *
 * Projects the Founder-staging Compose env stack for each application
 * service through the real `validateSource` (the same rules `loadConfig`
 * enforces at process start) and emits a SECRET-SAFE JSON summary:
 * service, processKind, env file names, whether BOBA_BEAR_ENV resolves to an
 * approved AppEnvironment, ok/issues (key + value-free message only).
 *
 * It never prints, returns, or logs raw environment values. Values are read
 * only to be handed to `validateSource`, whose issue messages are value-free
 * by design (ADR-015). Nothing is mutated.
 *
 * Usage:
 *   node --import tsx scripts/environment/staging-config-projection.ts --json \
 *     --env-dir .env.staging --repository-root .
 *
 * D-385 / AD-PF-01: `BOBA_BEAR_ENV=local` is Local UAT, not strict staging.
 * This adapter reports that truthfully; it does not relax any rule.
 */
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

import { extractValues, parseEnvFile } from "../database/lib/env-file.mjs";
import { validateSource } from "../../src/platform/config/schema";
import { APP_ENVIRONMENTS, type EnvSource, type ProcessKind } from "../../src/platform/config/types";

export interface ProjectionTarget {
  readonly service: string;
  readonly processKind: ProcessKind;
  /** Compose `env_file` order (later overrides earlier). */
  readonly envFiles: readonly string[];
}

/**
 * Mirrors compose.yaml `env_file` stacks per service. A unit test cross-checks
 * this table against compose.yaml so it cannot silently drift.
 */
export const STAGING_CONFIG_PROJECTION_TARGETS: readonly ProjectionTarget[] = Object.freeze([
  {
    service: "customer-auth",
    processKind: "worker",
    envFiles: [".env.runtime.docker.local", ".env.customer-auth.docker.local"],
  },
  {
    service: "workforce-auth",
    processKind: "worker",
    envFiles: [".env.runtime.docker.local", ".env.workforce-auth.docker.local"],
  },
  {
    service: "customer-commerce",
    processKind: "worker",
    envFiles: [
      ".env.runtime.docker.local",
      ".env.customer-auth.docker.local",
      ".env.customer-commerce.docker.local",
    ],
  },
  {
    service: "operations",
    processKind: "worker",
    envFiles: [
      ".env.runtime.docker.local",
      ".env.workforce-auth.docker.local",
      ".env.operations.docker.local",
    ],
  },
  {
    service: "migrate",
    processKind: "migration",
    envFiles: [".env.migration.docker.local"],
  },
]);

export interface SecretSafeProjection {
  readonly service: string;
  readonly processKind: ProcessKind;
  readonly envFiles: readonly string[];
  readonly envFilesPresent: boolean;
  /** Approved AppEnvironment value, or "INVALID" / "MISSING". Never a free-form raw value. */
  readonly environment: string;
  readonly nodeEnvSource: "dockerfile" | "env-file" | "absent";
  readonly ok: boolean;
  readonly issues: ReadonlyArray<{ readonly key: string; readonly message: string }>;
}

interface ResolveOptions {
  readonly stagingEnvDir: string;
  readonly repositoryRoot: string;
  readonly dockerfileNodeEnv: string | null;
  readonly readFile?: (p: string, enc: "utf8") => string;
  readonly exists?: (p: string) => boolean;
}

/** Read `ENV NODE_ENV=<value>` from the Dockerfile runtime stages (observation only). */
export function readDockerfileNodeEnv(dockerfileText: string): string | null {
  const matches = [...dockerfileText.matchAll(/^\s*(?:ENV\s+)?NODE_ENV=(\S+)/gm)].map((m) => m[1]);
  if (matches.length === 0) return null;
  const unique = new Set(matches);
  return unique.size === 1 ? matches[0] : null;
}

function classifyEnvironment(raw: string | undefined): string {
  if (raw === undefined || raw.length === 0) return "MISSING";
  return (APP_ENVIRONMENTS as readonly string[]).includes(raw) ? raw : "INVALID";
}

/**
 * Project one service. The merged source never leaves this function.
 */
export function projectTarget(target: ProjectionTarget, options: ResolveOptions): SecretSafeProjection {
  const readFile = options.readFile ?? ((p: string, enc: "utf8") => readFileSync(p, enc));
  const exists = options.exists ?? existsSync;
  const merged: Record<string, string> = {};
  let allPresent = true;
  for (const file of target.envFiles) {
    const stagingPath = path.join(options.stagingEnvDir, file);
    const repoPath = path.join(options.repositoryRoot, file);
    const filePath = exists(stagingPath) ? stagingPath : exists(repoPath) ? repoPath : null;
    if (!filePath) {
      allPresent = false;
      continue;
    }
    let content: string;
    try {
      content = readFile(filePath, "utf8");
    } catch {
      allPresent = false;
      continue;
    }
    const extracted = extractValues(parseEnvFile(content));
    if (!extracted.ok) {
      allPresent = false;
      continue;
    }
    Object.assign(merged, extracted.values);
  }

  let nodeEnvSource: SecretSafeProjection["nodeEnvSource"] = "absent";
  if (Object.prototype.hasOwnProperty.call(merged, "NODE_ENV")) {
    nodeEnvSource = "env-file";
  } else if (options.dockerfileNodeEnv) {
    merged.NODE_ENV = options.dockerfileNodeEnv;
    nodeEnvSource = "dockerfile";
  }

  const environment = classifyEnvironment(merged.BOBA_BEAR_ENV);
  if (!allPresent) {
    return {
      service: target.service,
      processKind: target.processKind,
      envFiles: target.envFiles,
      envFilesPresent: false,
      environment,
      nodeEnvSource,
      ok: false,
      issues: [{ key: "ENV_STACK", message: "One or more Compose env files are missing or unreadable." }],
    };
  }

  const source: EnvSource = merged;
  const result = validateSource({ processKind: target.processKind, source });
  return {
    service: target.service,
    processKind: target.processKind,
    envFiles: target.envFiles,
    envFilesPresent: true,
    environment,
    nodeEnvSource,
    ok: result.ok,
    issues: result.ok ? [] : result.issues.map((issue) => ({ key: issue.key, message: issue.message })),
  };
}

export function projectAll(options: ResolveOptions, targets = STAGING_CONFIG_PROJECTION_TARGETS): SecretSafeProjection[] {
  return targets.map((target) => projectTarget(target, options));
}

function parseArgs(argv: readonly string[]): { json: boolean; envDir: string | null; repositoryRoot: string | null } {
  let json = false;
  let envDir: string | null = null;
  let repositoryRoot: string | null = null;
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--json") json = true;
    else if (arg === "--env-dir") envDir = argv[++i] ?? null;
    else if (arg.startsWith("--env-dir=")) envDir = arg.slice("--env-dir=".length);
    else if (arg === "--repository-root") repositoryRoot = argv[++i] ?? null;
    else if (arg.startsWith("--repository-root=")) repositoryRoot = arg.slice("--repository-root=".length);
  }
  return { json, envDir, repositoryRoot };
}

function main(): void {
  const scriptDir = path.dirname(fileURLToPath(import.meta.url));
  const args = parseArgs(process.argv.slice(2));
  const repositoryRoot = path.resolve(args.repositoryRoot ?? path.resolve(scriptDir, "..", ".."));
  const stagingEnvDir = path.resolve(args.envDir ?? path.join(repositoryRoot, ".env.staging"));
  let dockerfileNodeEnv: string | null = null;
  try {
    dockerfileNodeEnv = readDockerfileNodeEnv(readFileSync(path.join(repositoryRoot, "Dockerfile"), "utf8"));
  } catch {
    dockerfileNodeEnv = null;
  }
  const projections = projectAll({ stagingEnvDir, repositoryRoot, dockerfileNodeEnv });
  if (args.json) {
    process.stdout.write(`${JSON.stringify({ schema: "staging-config-projection-v1", projections })}\n`);
    return;
  }
  for (const projection of projections) {
    console.log(
      `CONFIG_PROJECTION ${projection.service} processKind=${projection.processKind} environment=${projection.environment} ok=${projection.ok ? "YES" : "NO"}`,
    );
    for (const issue of projection.issues) {
      console.log(`CONFIG_PROJECTION_ISSUE ${projection.service} ${issue.key}: ${issue.message}`);
    }
  }
}

const isCli = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isCli) main();
