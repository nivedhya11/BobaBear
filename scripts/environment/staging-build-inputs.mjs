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
const PRIVATE_ENV_REFERENCE = /(?:^|[^\w])\.env(?:[^\w]|$)/;

function containsPrivateEnvReference(text) {
  return PRIVATE_ENV_REFERENCE.test(text);
}

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
    if (CANDIDATE_BUILD_SERVICES.includes(service) && /^    build:\s+\S/.test(line)) {
      return refused(`COMPOSE_BUILD_LINE_UNAUTHORIZED ${service}`);
    }
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
    if (containsPrivateEnvReference(text) || /\bsecrets\s*:/.test(text) || /\benv_file\s*:/.test(text)) {
      return refused(`COMPOSE_BUILD_PRIVATE_ENV_DEPENDENCY ${name}`);
    }
    for (const variable of [...text.matchAll(/\$\{([A-Z0-9_]+)/g)].map((match) => match[1])) {
      if (!AUTHORIZED_ARG_NAMES.has(variable) || SECRET_ARG_NAME.test(variable)) {
        return refused(`COMPOSE_BUILD_INTERPOLATION_UNAUTHORIZED ${name} ${variable}`);
      }
    }
    let context = null;
    let dockerfile = null;
    /** @type {string[]} */
    const argNames = [];
    for (const line of blockLines) {
      if (/^      context: \.$/.test(line)) {
        context = ".";
        continue;
      }
      if (/^      dockerfile: Dockerfile$/.test(line)) {
        dockerfile = "Dockerfile";
        continue;
      }
      if (/^      target: [a-z0-9-]+$/.test(line) || /^      args:$/.test(line)) continue;
      const arg = /^        ([A-Z][A-Z0-9_]*):[ \t]+(.*)$/.exec(line);
      if (arg) {
        if (!AUTHORIZED_ARG_NAMES.has(arg[1]) || SECRET_ARG_NAME.test(arg[1])) {
          return refused(`COMPOSE_BUILD_ARG_UNAUTHORIZED ${name} ${arg[1]}`);
        }
        argNames.push(arg[1]);
        continue;
      }
      return refused(`COMPOSE_BUILD_LINE_UNAUTHORIZED ${name}`);
    }
    if (context !== ".") return refused(`COMPOSE_BUILD_CONTEXT_UNBOUND ${name}`);
    if (dockerfile !== "Dockerfile") return refused(`COMPOSE_BUILD_DOCKERFILE_UNBOUND ${name}`);
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
  for (const line of dockerfileText.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (trimmed.length === 0 || trimmed.startsWith("#")) continue;
    if (containsPrivateEnvReference(trimmed)) {
      return { ok: false, reason: "DOCKERFILE_PRIVATE_ENV_DEPENDENCY" };
    }
  }
  return { ok: true, reason: null };
}
