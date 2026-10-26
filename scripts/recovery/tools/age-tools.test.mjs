/**
 * Container-backed age helper: host preference, non-root argv, and Podman fallback.
 * Live Docker is not executed. DOCKER_ENGINE=UNVERIFIED when the docker CLI is absent.
 */
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { chmodSync, existsSync, mkdtempSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { decryptFromAge, encryptToAge } from "../layer2/age.mjs";
import {
  buildAgeContainerArgv,
  cleanupAgeTools,
  executeAgeContainer,
  resolveAgeTools,
} from "./age-tools.mjs";

const REUSE_IMAGES = [
  "localhost/boba-bear-postgres:c1-src-a",
  "localhost/boba-bear-postgres:c1-nonroot",
  "boba-bear-postgres:local",
  "localhost/boba-bear-postgres:local",
];

function mountsOf(argv) {
  const mounts = [];
  for (let index = 0; index < argv.length; index += 1) {
    if (argv[index] === "-v") mounts.push(argv[index + 1]);
  }
  return mounts;
}

function assertNoWholesale(mounts) {
  for (const mount of mounts) {
    const [source, dest] = mount.split(":");
    for (const banned of ["/", "/home", "/tmp", "/var/tmp"]) {
      assert.notEqual(source, banned, mount);
      assert.notEqual(dest, banned, mount);
    }
  }
}

function assertHostUser(argv, uid, gid) {
  const userAt = argv.indexOf("--user");
  assert.ok(userAt > 0);
  assert.equal(argv[userAt + 1], `${uid}:${gid}`);
  assert.notEqual(argv[userAt + 1], "0");
  assert.equal(String(argv[userAt + 1]).startsWith("0:"), false);
  assert.equal(argv.includes("--user=0"), false);
  assert.equal(argv.includes("--privileged"), false);
}

function writeFakeTool(dir, name) {
  const file = path.join(dir, name);
  writeFileSync(file, "#!/bin/sh\nprintf '%s\\n' v1.2.1\nexit 0\n", { mode: 0o755 });
  chmodSync(file, 0o755);
  return file;
}

function baseSpec(overrides = {}) {
  return {
    cli: "podman",
    rootless: true,
    engine: "podman",
    uid: 1000,
    gid: 1000,
    binary: "/usr/bin/age",
    image: "example:local",
    ageArgs: ["--version"],
    ...overrides,
  };
}

test("host binaries present resolve via host or env and do not build container argv", () => {
  const root = mkdtempSync(path.join(os.tmpdir(), "boba-age-host-"));
  try {
    writeFakeTool(root, "age");
    writeFakeTool(root, "age-keygen");
    const env = {
      ...process.env,
      PATH: `${root}${path.delimiter}${process.env.PATH ?? ""}`,
    };
    delete env.BOBA_RECOVERY_AGE_BIN;
    delete env.AGE_BIN;
    delete env.BOBA_RECOVERY_AGE_KEYGEN_BIN;
    delete env.BOBA_RECOVERY_AGE_IMAGE;
    const host = resolveAgeTools(env);
    assert.equal(host.ok, true, host.reason);
    assert.equal(host.via, "host");
    assert.equal(host.ageBin, "age");
    assert.equal(host.ageKeygenBin, "age-keygen");
    assert.equal(host.cleanupDir, undefined);

    const envBin = writeFakeTool(root, "age-env");
    const fromEnv = resolveAgeTools({
      ...env,
      BOBA_RECOVERY_AGE_BIN: envBin,
    });
    assert.equal(fromEnv.ok, true, fromEnv.reason);
    assert.equal(fromEnv.via, "env");
    assert.equal(fromEnv.ageBin, envBin);
    assert.equal(fromEnv.cleanupDir, undefined);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("rootless podman argv keeps the host id, pins the age entrypoint, and mounts only parents", () => {
  const identityDir = mkdtempSync(path.join(os.tmpdir(), "boba-age-id-"));
  const outputDir = mkdtempSync(path.join(os.tmpdir(), "boba-age-out-"));
  const inputDir = mkdtempSync(path.join(os.tmpdir(), "boba-age-in-"));
  chmodSync(identityDir, 0o700);
  const identity = path.join(identityDir, "key.txt");
  const output = path.join(outputDir, "plain.bin");
  const input = path.join(inputDir, "cipher.age");
  writeFileSync(identity, "not-a-real-key\n", { mode: 0o600 });
  writeFileSync(input, "ciphertext\n", { mode: 0o600 });
  try {
    const argv = buildAgeContainerArgv(
      baseSpec({
        ageArgs: ["-d", "-i", identity, "-o", output, input],
      }),
    );
    assert.ok(argv.includes("--userns=keep-id"));
    assert.equal(argv[argv.indexOf("--entrypoint") + 1], "/usr/bin/age");
    assert.ok(argv.includes("--network=none"));
    assert.ok(argv.includes("--cap-drop=ALL"));
    assert.ok(argv.includes("--security-opt=no-new-privileges"));
    assert.ok(argv.includes("--rm"));
    assertHostUser(argv, 1000, 1000);
    const imageAt = argv.indexOf("example:local");
    assert.ok(argv.indexOf("-i") >= 0 && argv.indexOf("-i") < imageAt);
    const mounts = mountsOf(argv);
    assertNoWholesale(mounts);
    assert.ok(mounts.includes(`${identityDir}:${identityDir}:ro`), mounts.join("\n"));
    assert.ok(mounts.includes(`${outputDir}:${outputDir}:rw`), mounts.join("\n"));
    assert.ok(mounts.includes(`${inputDir}:${inputDir}:ro`), mounts.join("\n"));
    assert.equal(mounts.some((mount) => mount.startsWith("/home:") || mount.startsWith("/tmp:")), false);
  } finally {
    rmSync(identityDir, { recursive: true, force: true });
    rmSync(outputDir, { recursive: true, force: true });
    rmSync(inputDir, { recursive: true, force: true });
  }
});

test("files directly in a wholesale tmp directory are mounted individually", () => {
  const input = path.join(os.tmpdir(), `boba-age-argv-${process.pid}-in`);
  const output = path.join(os.tmpdir(), `boba-age-argv-${process.pid}-out`);
  writeFileSync(input, "x", { mode: 0o600 });
  try {
    const parent = path.resolve(os.tmpdir());
    const argv = buildAgeContainerArgv(
      baseSpec({
        ageArgs: ["-o", output, input],
      }),
    );
    const mounts = mountsOf(argv);
    assertNoWholesale(mounts);
    if (parent === "/tmp" || parent === "/var/tmp" || parent === "/home" || parent === "/") {
      assert.ok(mounts.some((mount) => mount.startsWith(`${input}:`)));
      assert.ok(mounts.some((mount) => mount.startsWith(`${output}:`) && mount.endsWith(":rw")));
      assert.equal(existsSync(output), true);
      assert.equal(statSync(output).mode & 0o777, 0o600);
    }
  } finally {
    rmSync(input, { force: true });
    rmSync(output, { force: true });
  }
});

test("rootful engine argv uses the host uid and gid without keep-id or user 0", () => {
  const argv = buildAgeContainerArgv(
    baseSpec({
      cli: "docker",
      rootless: false,
      engine: "docker",
      uid: 1000,
      gid: 1000,
    }),
  );
  assert.equal(argv.includes("--userns=keep-id"), false);
  assertHostUser(argv, 1000, 1000);
  assert.equal(argv[argv.indexOf("--entrypoint") + 1], "/usr/bin/age");
  assert.ok(argv.includes("--network=none"));
});

test("rootless docker fails closed and does not emit --user 0", () => {
  assert.throws(
    () =>
      buildAgeContainerArgv(
        baseSpec({
          cli: "docker",
          rootless: true,
          engine: "docker",
        }),
      ),
    /rootless Docker/,
  );
  let thrown = "";
  try {
    buildAgeContainerArgv(
      baseSpec({
        cli: "docker",
        rootless: true,
        engine: "docker",
        uid: 0,
        gid: 0,
      }),
    );
  } catch (error) {
    thrown = error instanceof Error ? error.message : String(error);
  }
  assert.match(thrown, /rootless Docker/);
  assert.equal(thrown.includes("--user 0"), false);
});

test("an inaccessible identity is not retried as root", () => {
  const root = mkdtempSync(path.join(os.tmpdir(), "boba-age-locked-"));
  chmodSync(root, 0o700);
  const identity = path.join(root, "key.txt");
  const output = path.join(root, "plain.bin");
  const input = path.join(root, "cipher.age");
  writeFileSync(identity, "AGE-SECRET-KEY-1TEST\n", { mode: 0o600 });
  writeFileSync(input, "ciphertext\n", { mode: 0o600 });
  chmodSync(identity, 0o000);
  const calls = [];
  try {
    const status = executeAgeContainer(
      baseSpec({
        ageArgs: ["-d", "-i", identity, "-o", output, input],
      }),
      {
        spawnSync(command, args) {
          calls.push({ command, args });
          return { status: 1, stderr: "permission denied" };
        },
      },
    );
    assert.equal(status, 1);
    assert.equal(calls.length, 1);
    assert.equal(calls[0].command, "podman");
    assertHostUser(calls[0].args, 1000, 1000);
    assert.equal(JSON.stringify(calls).includes("AGE-SECRET-KEY-"), false);
    assert.equal(statSync(identity).mode & 0o777, 0o000);
    assert.equal(statSync(root).mode & 0o777, 0o700);
  } finally {
    chmodSync(identity, 0o600);
    rmSync(root, { recursive: true, force: true });
  }
});

test("private identity stays private while the helper runs as the host user and the image stays non-root", () => {
  const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
  const dockerfile = readFileSync(path.join(repoRoot, "docker/postgres/Dockerfile"), "utf8");
  const entrypoint = readFileSync(
    path.join(repoRoot, "docker/postgres/pgbackrest/entrypoint-wrapper.sh"),
    "utf8",
  );
  const users = [...dockerfile.matchAll(/^USER\s+(\S+)\s*$/gm)].map((match) => match[1]);
  assert.equal(users.at(-1), "postgres");
  assert.match(entrypoint, /refusing to start as root/);

  const identityDir = mkdtempSync(path.join(os.tmpdir(), "boba-age-private-"));
  chmodSync(identityDir, 0o700);
  const identity = path.join(identityDir, "key.txt");
  const ciphertext = path.join(identityDir, "cipher.age");
  const output = path.join(identityDir, "plain.bin");
  writeFileSync(identity, "AGE-SECRET-KEY-1PRIVATE\n", { mode: 0o600 });
  chmodSync(identity, 0o600);
  writeFileSync(ciphertext, "ciphertext\n", { mode: 0o600 });
  const uid = process.getuid();
  const gid = process.getgid();
  try {
    const argv = buildAgeContainerArgv(
      baseSpec({
        uid,
        gid,
        ageArgs: ["-d", "-i", identity, "-o", output, ciphertext],
      }),
    );
    assertHostUser(argv, uid, gid);
    assert.equal(argv.includes("999:999"), false);
    assert.equal(argv.includes("--user=999"), false);
    assert.equal(statSync(identity).mode & 0o777, 0o600);
    assert.equal(statSync(identityDir).mode & 0o777, 0o700);

    const status = executeAgeContainer(
      baseSpec({
        uid,
        gid,
        ageArgs: ["-d", "-i", identity, "-o", output, ciphertext],
      }),
      {
        spawnSync(_command, args) {
          const user = args[args.indexOf("--user") + 1];
          if (user !== `${uid}:${gid}`) return { status: 1, stderr: "unexpected user" };
          if (user === "999:999" || user === "0" || String(user).startsWith("0:")) {
            return { status: 1, stderr: "refusing image default or root" };
          }
          if ((statSync(identity).mode & 0o777) !== 0o600) return { status: 1, stderr: "identity mode changed" };
          if ((statSync(identityDir).mode & 0o777) !== 0o700) return { status: 1, stderr: "directory mode changed" };
          writeFileSync(output, "private-round-trip\n", { mode: 0o600 });
          return { status: 0 };
        },
      },
    );
    assert.equal(status, 0);
    assert.equal(readFileSync(output, "utf8"), "private-round-trip\n");
    assert.equal(statSync(identity).mode & 0o777, 0o600);
    assert.equal(statSync(identityDir).mode & 0o777, 0o700);
    assert.equal(readFileSync(identity, "utf8"), "AGE-SECRET-KEY-1PRIVATE\n");
  } finally {
    rmSync(identityDir, { recursive: true, force: true });
  }
});

test("container engines are detected separately and Docker is not implied", () => {
  const docker = spawnSync("docker", ["info", "--format", "{{.ServerVersion}}"], {
    encoding: "utf8",
    timeout: 15_000,
    shell: false,
  });
  const podman = spawnSync("podman", ["info", "--format", "{{.Host.Security.Rootless}}"], {
    encoding: "utf8",
    timeout: 20_000,
    shell: false,
  });
  if (docker.error?.code === "ENOENT" || docker.status !== 0) {
    console.log("DOCKER_ENGINE=NOT_AVAILABLE");
  } else {
    console.log(`DOCKER_ENGINE=AVAILABLE server=${String(docker.stdout).trim()}`);
  }
  if (podman.error?.code === "ENOENT" || podman.status !== 0) {
    console.log("PODMAN=NOT_AVAILABLE");
  } else {
    console.log(`PODMAN=AVAILABLE rootless=${String(podman.stdout).trim()}`);
  }
  assert.equal(docker.error?.code === "ENOENT" || docker.status !== 0 || docker.status === 0, true);
});

test("live Docker engine is not contacted", () => {
  const docker = spawnSync("docker", ["--version"], { encoding: "utf8", shell: false });
  console.log("DOCKER_ENGINE=UNVERIFIED");
  if (docker.error?.code === "ENOENT") {
    assert.equal(docker.error.code, "ENOENT");
    return;
  }
  assert.equal(docker.status, 0, docker.stderr);
});

test("podman container fallback round-trips age without root", { timeout: 180_000 }, async (t) => {
  const podman = spawnSync("podman", ["--version"], { encoding: "utf8", shell: false });
  if (podman.status !== 0) {
    t.skip("podman is not available");
    return;
  }
  let image = null;
  for (const candidate of REUSE_IMAGES) {
    const inspect = spawnSync("podman", ["image", "inspect", candidate], {
      encoding: "utf8",
      timeout: 20_000,
      shell: false,
    });
    if (inspect.status !== 0) continue;
    const probe = spawnSync(
      "podman",
      [
        "run",
        "--rm",
        "--network=none",
        "--cap-drop=ALL",
        "--security-opt=no-new-privileges",
        "--entrypoint",
        "/usr/bin/age",
        candidate,
        "--version",
      ],
      { encoding: "utf8", timeout: 60_000, shell: false },
    );
    if (probe.status === 0) {
      image = candidate;
      break;
    }
  }
  if (!image) {
    t.skip("podman image with age is not present");
    return;
  }
  console.log(`PODMAN_AGE_IMAGE=${image}`);

  const pathParts = (process.env.PATH ?? "").split(path.delimiter).filter((dir) => {
    if (!dir) return false;
    return !existsSync(path.join(dir, "age")) && !existsSync(path.join(dir, "age-keygen"));
  });
  const env = {
    ...process.env,
    PATH: pathParts.join(path.delimiter),
    BOBA_RECOVERY_AGE_IMAGE: image,
  };
  delete env.BOBA_RECOVERY_AGE_BIN;
  delete env.AGE_BIN;
  delete env.BOBA_RECOVERY_AGE_KEYGEN_BIN;

  const tools = resolveAgeTools(env);
  const root = mkdtempSync(path.join(os.tmpdir(), "boba-age-live-"));
  chmodSync(root, 0o700);
  const identity = path.join(root, "key.txt");
  const logPath = path.join(root, "argv-log");
  let ciphertextPath;
  try {
    assert.equal(tools.ok, true, tools.reason);
    assert.equal(tools.via, "container");
    const keygen = spawnSync(tools.ageKeygenBin, ["-o", identity], {
      encoding: "utf8",
      timeout: 60_000,
      env,
      shell: false,
    });
    assert.equal(keygen.status, 0, keygen.stderr);
    const recipient = /Public key:\s*(age1[a-z0-9]+)/i.exec(`${keygen.stdout ?? ""}\n${keygen.stderr ?? ""}`);
    assert.ok(recipient, "age-keygen public key missing");
    assert.equal(statSync(identity).mode & 0o777, 0o600);
    assert.equal(statSync(identity).uid, process.getuid());
    assert.equal(statSync(root).mode & 0o777, 0o700);

    const enc = await encryptToAge({
      plaintext: Buffer.from("container-fallback-plaintext"),
      recipients: [recipient[1]],
      ageBin: tools.ageBin,
    });
    assert.equal(enc.ok, true, enc.reason);
    ciphertextPath = enc.outputPath;
    const dec = await decryptFromAge({
      ciphertext: enc.ciphertext,
      identityFile: identity,
      ageBin: tools.ageBin,
    });
    assert.equal(dec.ok, true, dec.reason);
    assert.equal(Buffer.from(dec.plaintext).toString("utf8"), "container-fallback-plaintext");
    assert.equal(statSync(identity).mode & 0o777, 0o600);
    assert.equal(statSync(root).mode & 0o777, 0o700);

    chmodSync(identity, 0o000);
    const output = path.join(root, "denied.bin");
    const denied = spawnSync(tools.ageBin, ["-d", "-i", identity, "-o", output, enc.outputPath], {
      encoding: "utf8",
      timeout: 60_000,
      env: { ...env, BOBA_AGE_CONTAINER_ARGV_LOG: logPath },
      shell: false,
    });
    assert.notEqual(denied.status, 0);
    assert.equal(`${denied.stdout ?? ""}${denied.stderr ?? ""}`.includes("AGE-SECRET-KEY-"), false);
    const logged = readFileSync(logPath, "utf8");
    assert.equal(logged.includes("AGE-SECRET-KEY-"), false);
    const records = logged
      .trim()
      .split("\n")
      .filter(Boolean)
      .map((line) => JSON.parse(line));
    assert.equal(records.length, 1);
    assertHostUser(records[0].argv, process.getuid(), process.getgid());
    assert.equal(records[0].argv[records[0].argv.indexOf("--entrypoint") + 1], "/usr/bin/age");
    assert.ok(records[0].argv.includes("--userns=keep-id"));
  } finally {
    try {
      chmodSync(identity, 0o600);
    } catch {
      // identity may not exist if resolve failed
    }
    cleanupAgeTools(tools.cleanupDir);
    if (ciphertextPath) rmSync(ciphertextPath, { force: true });
    rmSync(root, { recursive: true, force: true });
  }
});
