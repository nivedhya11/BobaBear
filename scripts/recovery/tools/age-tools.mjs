/**
 * Resolve age / age-keygen for IMP-037 Layer 2.
 *
 * Prefer host binaries. When both are absent, run age from the recovery
 * PostgreSQL image without starting PostgreSQL and without becoming root or
 * database UID 999. The image USER remains postgres; this helper is a separate
 * `podman|docker run` with `--entrypoint` set to the age binary.
 *
 * Callers pass absolute `-i`/`-o` paths and positional ciphertext paths.
 * Files that sit directly in `/tmp`, `/var/tmp`, `/home`, or `/` are mounted
 * individually so those directories are never bind-mounted wholesale.
 * Identity files and their directories are not chmod'd.
 */
import { spawnSync } from "node:child_process";
import {
  appendFileSync,
  chmodSync,
  existsSync,
  lstatSync,
  mkdtempSync,
  realpathSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { resolveContainerCli } from "../docker-exec.mjs";
import { resolveAgeBinary } from "../layer2/age.mjs";

const DEFAULT_AGE_IMAGES = ["boba-bear-postgres:local", "localhost/boba-bear-postgres:local"];
const AGE_BINARY = "/usr/bin/age";
const AGE_KEYGEN_BINARY = "/usr/bin/age-keygen";
const WHOLESALE_MOUNT_ROOTS = new Set(["/", "/home", "/tmp", "/var/tmp"]);

const AGE_VALUE_FLAGS = new Map([
  ["-o", "output"],
  ["--output", "output"],
  ["-i", "identity"],
  ["--identity", "identity"],
  ["-r", "skip"],
  ["--recipient", "skip"],
  ["-R", "skip"],
  ["--recipients-file", "skip"],
  ["-j", "skip"],
]);

const AGE_BOOL_FLAGS = new Set([
  "-e",
  "--encrypt",
  "-d",
  "--decrypt",
  "-a",
  "--armor",
  "-p",
  "--passphrase",
  "-y",
  "-h",
  "--help",
  "--version",
]);

/**
 * @param {NodeJS.ProcessEnv} env
 * @returns {string[]}
 */
function imageCandidates(env) {
  const override =
    typeof env.BOBA_RECOVERY_AGE_IMAGE === "string" ? env.BOBA_RECOVERY_AGE_IMAGE.trim() : "";
  if (override) return [override];
  return DEFAULT_AGE_IMAGES;
}

/**
 * @param {string} cli
 * @param {NodeJS.ProcessEnv} env
 * @returns {{ ok: true, rootless: boolean, engine: "podman" | "docker" } | { ok: false, reason: string }}
 */
function detectRootless(cli, env) {
  if (cli === "podman") {
    const result = spawnSync(cli, ["info", "--format", "{{.Host.Security.Rootless}}"], {
      encoding: "utf8",
      timeout: 20_000,
      env,
      shell: false,
    });
    const value = String(result.stdout ?? "").trim().toLowerCase();
    if (result.status !== 0 || (value !== "true" && value !== "false")) {
      return {
        ok: false,
        reason: "ambiguous podman rootless detection; refusing to run the age helper as root",
      };
    }
    return { ok: true, rootless: value === "true", engine: "podman" };
  }
  if (cli === "docker") {
    const result = spawnSync(cli, ["info", "--format", "{{json .SecurityOptions}}"], {
      encoding: "utf8",
      timeout: 20_000,
      env,
      shell: false,
    });
    if (result.status !== 0) {
      return {
        ok: false,
        reason: "ambiguous docker rootless detection; refusing to run the age helper as root",
      };
    }
    let parsed;
    try {
      parsed = JSON.parse(String(result.stdout ?? "").trim());
    } catch {
      return {
        ok: false,
        reason: "ambiguous docker rootless detection; refusing to run the age helper as root",
      };
    }
    if (!Array.isArray(parsed)) {
      return {
        ok: false,
        reason: "ambiguous docker rootless detection; refusing to run the age helper as root",
      };
    }
    const rootless = parsed.some((entry) => String(entry).toLowerCase().includes("rootless"));
    return { ok: true, rootless, engine: "docker" };
  }
  return { ok: false, reason: `unsupported container engine ${cli}` };
}

/**
 * @param {string} cli
 * @param {string} image
 * @param {string} binary
 * @param {NodeJS.ProcessEnv} env
 */
function probeImageBinary(cli, image, binary, env) {
  return spawnSync(
    cli,
    [
      "run",
      "--rm",
      "--network=none",
      "--cap-drop=ALL",
      "--security-opt=no-new-privileges",
      "--entrypoint",
      binary,
      image,
      "--version",
    ],
    { encoding: "utf8", timeout: 60_000, env, shell: false },
  );
}

/**
 * @param {string[]} ageArgs
 * @returns {{ identity: string[], output: string[], positional: string[] }}
 */
function classifyAgeOperands(ageArgs) {
  if (!Array.isArray(ageArgs)) {
    throw new Error("age helper refused non-array arguments");
  }
  const identity = [];
  const output = [];
  const positional = [];
  for (let index = 0; index < ageArgs.length; index += 1) {
    const arg = ageArgs[index];
    if (typeof arg !== "string") {
      throw new Error("age helper refused a non-string argument");
    }
    if (arg === "--") {
      positional.push(...ageArgs.slice(index + 1));
      break;
    }
    if (arg.startsWith("--") && arg.includes("=")) {
      const eq = arg.indexOf("=");
      const flag = arg.slice(0, eq);
      const value = arg.slice(eq + 1);
      const kind = AGE_VALUE_FLAGS.get(flag);
      if (!kind) throw new Error(`age helper refused unrecognized option ${flag}`);
      if (kind === "output") output.push(value);
      else if (kind === "identity") identity.push(value);
      continue;
    }
    if (arg.startsWith("-") && arg !== "-") {
      if (AGE_BOOL_FLAGS.has(arg)) continue;
      const kind = AGE_VALUE_FLAGS.get(arg);
      if (!kind) throw new Error(`age helper refused unrecognized option ${arg}`);
      const value = ageArgs[index + 1];
      if (typeof value !== "string") throw new Error(`age helper missing value for ${arg}`);
      index += 1;
      if (kind === "output") output.push(value);
      else if (kind === "identity") identity.push(value);
      continue;
    }
    positional.push(arg);
  }
  return { identity, output, positional };
}

/**
 * @param {string} filePath
 * @returns {string}
 */
function absoluteOperand(filePath) {
  if (filePath === "-") return filePath;
  if (filePath.includes("\0") || filePath.includes("\n") || filePath.includes(":")) {
    throw new Error("age helper refused a path that cannot be bind-mounted safely");
  }
  const abs = path.resolve(filePath);
  if (!path.isAbsolute(abs)) {
    throw new Error("age helper refused a non-absolute path");
  }
  return abs;
}

/**
 * @param {string} dir
 * @returns {boolean}
 */
function isWholesaleMountRoot(dir) {
  return WHOLESALE_MOUNT_ROOTS.has(path.resolve(dir));
}

/**
 * @param {Map<string, { source: string, dest: string, mode: "ro" | "rw" }>} mounts
 * @param {string} source
 * @param {string} dest
 * @param {boolean} writable
 */
function addMount(mounts, source, dest, writable) {
  if (isWholesaleMountRoot(source) || isWholesaleMountRoot(dest)) {
    throw new Error("age helper refused to mount a wholesale host directory");
  }
  const prev = mounts.get(dest);
  if (!prev) {
    mounts.set(dest, { source, dest, mode: writable ? "rw" : "ro" });
    return;
  }
  if (prev.source !== source) {
    throw new Error("age helper refused conflicting bind mounts");
  }
  if (writable) prev.mode = "rw";
}

/**
 * @param {string} filePath
 * @param {boolean} writable
 * @param {string} binary
 * @param {Map<string, { source: string, dest: string, mode: "ro" | "rw" }>} mounts
 */
function addOperandMount(filePath, writable, binary, mounts) {
  if (filePath === "-") return;
  const abs = absoluteOperand(filePath);
  const parent = path.dirname(abs);
  if (!existsSync(parent)) {
    throw new Error("age helper refused a path whose parent does not exist");
  }
  const parentStat = lstatSync(parent);
  if (!parentStat.isDirectory()) {
    throw new Error("age helper refused a path whose parent is not a directory");
  }
  const parentReal = realpathSync(parent);
  if (isWholesaleMountRoot(parent) || isWholesaleMountRoot(parentReal)) {
    if (!existsSync(abs)) {
      if (!writable) {
        throw new Error("age helper refused to mount a missing read-only path");
      }
      if (binary === AGE_KEYGEN_BINARY) {
        throw new Error(
          "age-keygen output is directly in a wholesale mount root; refusing to mount that directory or pre-create an exclusive output",
        );
      }
      writeFileSync(abs, "", { flag: "wx", mode: 0o600 });
    }
    addMount(mounts, realpathSync(abs), abs, writable);
    return;
  }
  addMount(mounts, parentReal, path.resolve(parent), writable);
}

/**
 * Container argv for `spawn(cli, argv)`. Does not start a container.
 * Filesystem lookups choose bind mounts; there is no daemon call and no
 * chmod of an existing identity file.
 *
 * @param {{ cli: string, rootless: boolean, engine: string, uid: number, gid: number, binary: string, image: string, ageArgs: string[] }} spec
 * @returns {string[]}
 */
export function buildAgeContainerArgv(spec) {
  const { cli, rootless, engine, uid, gid, binary, image, ageArgs } = spec ?? {};
  if (typeof rootless !== "boolean") {
    throw new Error("ambiguous rootless detection; refusing to run the age helper as root");
  }
  if (engine !== "podman" && engine !== "docker") {
    throw new Error("age helper refused an unsupported container engine");
  }
  if (cli !== engine) {
    throw new Error("age helper refused inconsistent container cli and engine");
  }
  if (rootless && engine !== "podman") {
    throw new Error(
      "rootless Docker has no keep-id user namespace; refusing to run the age helper as root or as an unmapped uid",
    );
  }
  if (!Number.isInteger(uid) || !Number.isInteger(gid) || uid <= 0 || gid < 0) {
    throw new Error("age helper refused uid 0 or a non-numeric host uid/gid");
  }
  if (binary !== AGE_BINARY && binary !== AGE_KEYGEN_BINARY) {
    throw new Error("age helper refused an unexpected in-image binary");
  }
  if (typeof image !== "string" || image.length === 0 || /\s/.test(image) || image.startsWith("-")) {
    throw new Error("age helper refused an invalid image reference");
  }

  const { identity, output, positional } = classifyAgeOperands(ageArgs);
  /** @type {Map<string, { source: string, dest: string, mode: "ro" | "rw" }>} */
  const mounts = new Map();
  for (const file of identity) addOperandMount(file, false, binary, mounts);
  for (const file of positional) addOperandMount(file, false, binary, mounts);
  for (const file of output) addOperandMount(file, true, binary, mounts);

  const argv = [
    "run",
    "--rm",
    "-i",
    "--network=none",
    "--cap-drop=ALL",
    "--security-opt=no-new-privileges",
  ];
  if (rootless) argv.push("--userns=keep-id");
  argv.push("--user", `${uid}:${gid}`, "--entrypoint", binary);
  const ordered = [...mounts.values()].sort((a, b) => (a.dest < b.dest ? -1 : a.dest > b.dest ? 1 : 0));
  for (const mount of ordered) {
    argv.push("-v", `${mount.source}:${mount.dest}:${mount.mode}`);
  }
  argv.push(image, ...ageArgs);
  return argv;
}

/**
 * Run one container age command. A non-zero age status is returned as-is.
 * There is no second attempt as root or as UID 999.
 *
 * @param {{ cli: string, rootless: boolean, engine: string, uid: number, gid: number, binary: string, image: string, ageArgs: string[] }} spec
 * @param {{ spawnSync?: typeof spawnSync, env?: NodeJS.ProcessEnv, argvLogPath?: string }} [deps]
 * @returns {number}
 */
export function executeAgeContainer(spec, deps = {}) {
  const argv = buildAgeContainerArgv(spec);
  const logPath = deps.argvLogPath ?? process.env.BOBA_AGE_CONTAINER_ARGV_LOG;
  if (typeof logPath === "string" && path.isAbsolute(logPath)) {
    appendFileSync(logPath, `${JSON.stringify({ argv })}\n`, { mode: 0o600 });
  }
  const run = deps.spawnSync ?? spawnSync;
  const result = run(spec.cli, argv, {
    encoding: "utf8",
    shell: false,
    stdio: "inherit",
    env: deps.env ?? process.env,
  });
  if (result?.error) return 127;
  return typeof result?.status === "number" ? result.status : 1;
}

/**
 * @param {string} dir
 * @param {string} name
 * @param {{ cli: string, rootless: boolean, engine: "podman" | "docker", uid: number, gid: number, binary: string, image: string }} config
 */
function writeLauncher(dir, name, config) {
  const file = path.join(dir, name);
  const moduleUrl = pathToFileURL(fileURLToPath(import.meta.url)).href;
  const body = `#!/usr/bin/env node
import { executeAgeContainer } from ${JSON.stringify(moduleUrl)};

const status = executeAgeContainer({
  cli: ${JSON.stringify(config.cli)},
  rootless: ${config.rootless ? "true" : "false"},
  engine: ${JSON.stringify(config.engine)},
  uid: ${config.uid},
  gid: ${config.gid},
  binary: ${JSON.stringify(config.binary)},
  image: ${JSON.stringify(config.image)},
  ageArgs: process.argv.slice(2),
});
process.exit(status);
`;
  writeFileSync(file, body, { encoding: "utf8", mode: 0o755 });
  chmodSync(file, 0o755);
  return file;
}

/**
 * @returns {{ ok: true, uid: number, gid: number } | { ok: false, reason: string }}
 */
function invokingUser() {
  if (typeof process.getuid !== "function" || typeof process.getgid !== "function") {
    return { ok: false, reason: "host uid/gid unavailable; refusing to run the age helper as root" };
  }
  const uid = process.getuid();
  const gid = process.getgid();
  if (!Number.isInteger(uid) || !Number.isInteger(gid) || uid < 0 || gid < 0) {
    return { ok: false, reason: "host uid/gid unreadable; refusing to run the age helper as root" };
  }
  if (uid === 0) {
    return { ok: false, reason: "invoking user is uid 0; refusing to run the age helper as root" };
  }
  return { ok: true, uid, gid };
}

/**
 * @param {NodeJS.ProcessEnv} [env]
 * @returns {{ ok: true, ageBin: string, ageKeygenBin: string, via: "host"|"container"|"env", image?: string, cleanupDir?: string } | { ok: false, reason: string }}
 */
export function resolveAgeTools(env = process.env) {
  const ageBinEnv = resolveAgeBinary(env);
  const keygenEnv =
    typeof env.BOBA_RECOVERY_AGE_KEYGEN_BIN === "string" && env.BOBA_RECOVERY_AGE_KEYGEN_BIN.trim()
      ? env.BOBA_RECOVERY_AGE_KEYGEN_BIN.trim()
      : "age-keygen";

  const probeOpts = { encoding: "utf8", timeout: 10_000, env, shell: false };
  const ageProbe = spawnSync(ageBinEnv, ["--version"], probeOpts);
  const keygenProbe = spawnSync(keygenEnv, ["--version"], probeOpts);
  const ageOk =
    !ageProbe.error &&
    (ageProbe.status === 0 || String(ageProbe.stdout ?? "").toLowerCase().includes("age"));
  const keygenOk = !keygenProbe.error && keygenProbe.status === 0;
  if (ageOk && keygenOk) {
    return {
      ok: true,
      ageBin: ageBinEnv,
      ageKeygenBin: keygenEnv,
      via: ageBinEnv === "age" ? "host" : "env",
    };
  }

  const cli = resolveContainerCli();
  if (!cli) {
    return {
      ok: false,
      reason: "age/age-keygen unavailable on host and no container runtime for disposable age tools",
    };
  }

  let image = null;
  for (const candidate of imageCandidates(env)) {
    const inspect = spawnSync(cli, ["image", "inspect", candidate], {
      encoding: "utf8",
      timeout: 20_000,
      env,
      shell: false,
    });
    if (inspect.status === 0) {
      image = candidate;
      break;
    }
  }
  if (!image) {
    return {
      ok: false,
      reason:
        "age/age-keygen unavailable on host; build boba-bear-postgres:local (ships age) or install age",
    };
  }

  const runtime = detectRootless(cli, env);
  if (!runtime.ok) return runtime;
  if (runtime.rootless && runtime.engine !== "podman") {
    return {
      ok: false,
      reason:
        "rootless Docker has no keep-id user namespace; refusing to run the age helper as root or as an unmapped uid",
    };
  }
  const user = invokingUser();
  if (!user.ok) return user;

  const ageInImage = probeImageBinary(cli, image, AGE_BINARY, env);
  const keygenInImage = probeImageBinary(cli, image, AGE_KEYGEN_BINARY, env);
  if (ageInImage.status !== 0 || keygenInImage.status !== 0) {
    return {
      ok: false,
      reason: `recovery image ${image} does not provide ${AGE_BINARY} and ${AGE_KEYGEN_BINARY}`,
    };
  }

  const dir = mkdtempSync(path.join(os.tmpdir(), "boba-age-tools-"));
  const shared = {
    cli,
    rootless: runtime.rootless,
    engine: runtime.engine,
    uid: user.uid,
    gid: user.gid,
    image,
  };
  return {
    ok: true,
    ageBin: writeLauncher(dir, "age", { ...shared, binary: AGE_BINARY }),
    ageKeygenBin: writeLauncher(dir, "age-keygen", { ...shared, binary: AGE_KEYGEN_BINARY }),
    via: "container",
    image,
    cleanupDir: dir,
  };
}

/**
 * @param {string | undefined} cleanupDir
 */
export function cleanupAgeTools(cleanupDir) {
  if (!cleanupDir || !existsSync(cleanupDir)) return;
  rmSync(cleanupDir, { recursive: true, force: true });
}
