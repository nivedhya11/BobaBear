/**
 * Build-only input checks for the candidate archive.
 *
 * These helpers read committed Compose and Dockerfile text supplied by the caller.
 * They do not open operational secret files. A private env-file or secret build
 * input fails closed.
 */
import path from "node:path";

/** Public build args already declared on the staging candidate services. */
export const AUTHORIZED_COMPOSE_BUILD_ARGS = Object.freeze([
  "NEXT_PUBLIC_SITE_URL",
  "NEXT_PUBLIC_GA_MEASUREMENT_ID",
  "NEXT_PUBLIC_BOBA_BEAR_GOOGLE_MAPS_BROWSER_KEY",
  "BOBA_BEAR_IMAGE_RELEASE",
  "BOBA_BUILD_SHA",
]);

/** Services built by the inactive candidate build. Not a deployment set. */
export const CANDIDATE_BUILD_SERVICES = Object.freeze([
  "app",
  "migrate",
  "customer-auth",
  "workforce-auth",
  "customer-commerce",
  "operations",
]);

const AUTHORIZED_ARG_NAMES = new Set(AUTHORIZED_COMPOSE_BUILD_ARGS);
const SECRET_ARG_NAME = /SECRET|PASSWORD|TOKEN|CREDENTIAL|PRIVATE_KEY|WEBHOOK|DATABASE_URL|ALLOW_UNSAFE/i;

/**
 * Refuse a path that is the operational staging secret directory or a file inside it.
 * @param {unknown} filePath
 * @param {unknown} repositoryRoot
 */
export function assertOperationalStagingSecretUnread(filePath, repositoryRoot) {
  if (typeof filePath !== "string" || typeof repositoryRoot !== "string") {
    throw new Error("BUILD_ONLY_STAGING_SECRET_READ_REFUSED");
  }
  const resolved = path.resolve(filePath);
  const staging = path.resolve(repositoryRoot, ".env.staging");
  if (resolved === staging || resolved.startsWith(`${staging}${path.sep}`)) {
    throw new Error("BUILD_ONLY_STAGING_SECRET_READ_REFUSED");
  }
}

/**
 * @param {unknown} composeText
 * @returns {{
 *   ok: boolean,
 *   reason: string | null,
 *   unsafeAdapterArgsAbsent: boolean,
 *   serviceEnvFileConsumedByBuild: boolean,
 *   argsByService?: Record<string, string[]>,
 * }}
 */
export function evaluateCommittedComposeBuildIsolation(composeText) {
  const refused = (reason) => ({
    ok: false,
    reason,
    unsafeAdapterArgsAbsent: false,
    serviceEnvFileConsumedByBuild: true,
  });
  if (typeof composeText !== "string" || composeText.trim().length === 0) {
    return refused("COMPOSE_BUILD_SOURCE_UNREADABLE");
  }

  /** @type {Map<string, string[]>} */
  const buildBlocks = new Map();
  let service = null;
  let inBuild = false;
  /** @type {string[] | null} */
  let block = null;
  for (const line of composeText.split(/\r?\n/)) {
    const serviceMatch = /^  ([a-z0-9-]+):\s*(?:#.*)?$/.exec(line);
    if (serviceMatch) {
      service = serviceMatch[1];
      inBuild = false;
      block = null;
      continue;
    }
    if (!service) continue;
    if (/^    build:\s*$/.test(line)) {
      inBuild = true;
      block = [];
      buildBlocks.set(service, block);
      continue;
    }
    if (!inBuild || !block) continue;
    if (/^    \S/.test(line)) {
      inBuild = false;
      block = null;
      continue;
    }
    block.push(line);
  }

  for (const name of CANDIDATE_BUILD_SERVICES) {
    if (!buildBlocks.has(name)) return refused(`COMPOSE_BUILD_SERVICE_MISSING ${name}`);
  }

  /** @type {Record<string, string[]>} */
  const argsByService = {};
  for (const name of CANDIDATE_BUILD_SERVICES) {
    const blockLines = buildBlocks.get(name) ?? [];
    const text = blockLines.join("\n");
    if (/\bsecrets\s*:/.test(text) || /\benv_file\s*:/.test(text) || text.includes(".env.staging")) {
      return refused(`COMPOSE_BUILD_PRIVATE_ENV_DEPENDENCY ${name}`);
    }
    /** @type {string[]} */
    const argNames = [];
    for (const line of blockLines) {
      const arg = /^        ([A-Z][A-Z0-9_]*):\s*(.*)$/.exec(line);
      if (!arg) continue;
      const key = arg[1];
      const value = arg[2];
      if (!AUTHORIZED_ARG_NAMES.has(key) || SECRET_ARG_NAME.test(key)) {
        return refused(`COMPOSE_BUILD_ARG_UNAUTHORIZED ${name} ${key}`);
      }
      if (value.includes(".env.staging") || value.includes(".env.runtime") || value.includes(".env.docker")) {
        return refused(`COMPOSE_BUILD_ENV_FILE_REFERENCE ${name}`);
      }
      const interpolations = [...value.matchAll(/\$\{([A-Z0-9_]+)/g)].map((match) => match[1]);
      for (const variable of interpolations) {
        if (!AUTHORIZED_ARG_NAMES.has(variable) || SECRET_ARG_NAME.test(variable)) {
          return refused(`COMPOSE_BUILD_INTERPOLATION_UNAUTHORIZED ${name} ${variable}`);
        }
      }
      argNames.push(key);
    }
    if (!argNames.includes("BOBA_BUILD_SHA")) return refused(`COMPOSE_BUILD_SHA_UNBOUND ${name}`);
    argsByService[name] = argNames;
  }

  return {
    ok: true,
    reason: null,
    unsafeAdapterArgsAbsent: true,
    serviceEnvFileConsumedByBuild: false,
    argsByService,
  };
}

/**
 * @param {unknown} dockerfileText
 * @returns {{ ok: boolean, reason: string | null }}
 */
export function evaluateCommittedDockerfileBuildIsolation(dockerfileText) {
  if (typeof dockerfileText !== "string" || dockerfileText.trim().length === 0) {
    return { ok: false, reason: "DOCKERFILE_UNREADABLE" };
  }
  if (dockerfileText.includes(".env.staging")) {
    return { ok: false, reason: "DOCKERFILE_PRIVATE_ENV_DEPENDENCY" };
  }
  if (/^\s*(?:COPY|ADD)\b.*(?:^|\s)\.env(?:\s|$)/m.test(dockerfileText)) {
    return { ok: false, reason: "DOCKERFILE_PRIVATE_ENV_DEPENDENCY" };
  }
  return { ok: true, reason: null };
}
