import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import {
  chmodSync,
  existsSync,
  mkdtempSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const lib = path.join(here, "lib/c1-proof-cleanup.sh");
const proof = path.join(here, "pg-c1-production-candidate-proof.sh");

const FAKE_PODMAN = `#!/usr/bin/env bash
set -u
if [ -z "\${PODMAN_LOG:-}" ] || [ -z "\${PODMAN_STATE:-}" ]; then
  echo "fake podman missing PODMAN_LOG or PODMAN_STATE" >&2
  exit 99
fi
{
  printf 'CALL'
  for arg in "\$@"; do
    printf '\\t%s' "\$arg"
  done
  printf '\\n'
} >> "\$PODMAN_LOG"

state_file() {
  case "\$1" in
    container) printf '%s/containers\\n' "\$PODMAN_STATE" ;;
    volume) printf '%s/volumes\\n' "\$PODMAN_STATE" ;;
    image) printf '%s/images\\n' "\$PODMAN_STATE" ;;
    *) printf '%s/%s\\n' "\$PODMAN_STATE" "\$1" ;;
  esac
}

line_matches_token() {
  local kind="\$1" token="\$2" line="\$3" id name
  case "\$kind" in
    container|image)
      id="\${line%% *}"
      name="\${line#* }"
      [ "\$token" = "\$id" ] || [ "\$token" = "\$name" ]
      ;;
    volume)
      [ "\$token" = "\$line" ]
      ;;
    *)
      return 1
      ;;
  esac
}

token_present() {
  local kind="\$1" token="\$2" line
  while IFS= read -r line || [ -n "\$line" ]; do
    [ -n "\$line" ] || continue
    if line_matches_token "\$kind" "\$token" "\$line"; then
      return 0
    fi
  done < "\$(state_file "\$kind")"
  return 1
}

drop_token() {
  local kind="\$1" token="\$2" line tmp
  tmp="\$(state_file "\$kind").tmp"
  : > "\$tmp"
  while IFS= read -r line || [ -n "\$line" ]; do
    [ -n "\$line" ] || continue
    if line_matches_token "\$kind" "\$token" "\$line"; then
      continue
    fi
    printf '%s\\n' "\$line" >> "\$tmp"
  done < "\$(state_file "\$kind")"
  mv "\$tmp" "\$(state_file "\$kind")"
}

last_arg() {
  if [ "\$#" -eq 0 ]; then
    return 1
  fi
  printf '%s\\n' "\${@: -1}"
}

cmd="\$1"
shift
case "\$cmd" in
  ps)
    if [ -s "\$(state_file container)" ]; then
      cat "\$(state_file container)"
    fi
    exit 0
    ;;
  rm)
    token="\$(last_arg "\$@")"
    if token_present container "\$token"; then
      if [ "\${C1_PROOF_CLEANUP_ATTEMPT:-1}" -ge "\${FAKE_REMOVE_ON_ATTEMPT:-1}" ]; then
        drop_token container "\$token"
      fi
      exit 0
    fi
    exit 1
    ;;
  rmi)
    token="\$(last_arg "\$@")"
    if token_present image "\$token"; then
      if [ "\${FAKE_IMAGE_REMOVE:-1}" = "1" ]; then
        drop_token image "\$token"
      fi
      exit 0
    fi
    exit 1
    ;;
  volume)
    sub="\$1"
    shift
    case "\$sub" in
      ls)
        if [ -s "\$(state_file volume)" ]; then
          cat "\$(state_file volume)"
        fi
        exit 0
        ;;
      rm)
        token="\$(last_arg "\$@")"
        if token_present volume "\$token"; then
          if [ "\${FAKE_VOLUME_REMOVE:-1}" = "1" ]; then
            drop_token volume "\$token"
          fi
          exit 0
        fi
        exit 1
        ;;
      *)
        echo "unexpected volume subcommand: \$sub" >&2
        exit 99
        ;;
    esac
    ;;
  image)
    sub="\$1"
    shift
    token="\$(last_arg "\$@")"
    case "\$sub" in
      exists)
        if token_present image "\$token"; then
          exit 0
        fi
        exit 1
        ;;
      inspect)
        if token_present image "\$token"; then
          awk -v tag="\$token" '\$2==tag { print \$1; found=1 } END { exit found?0:1 }' "\$(state_file image)"
          exit \$?
        fi
        exit 1
        ;;
      *)
        echo "unexpected image subcommand: \$sub" >&2
        exit 99
        ;;
    esac
    ;;
  *)
    echo "unexpected podman command: \$cmd" >&2
    exit 99
    ;;
esac
`;

function sh(value) {
  return `'${String(value).replace(/'/g, `'\\''`)}'`;
}

function readCalls(logPath) {
  const text = readFileSync(logPath, "utf8");
  return text
    .split("\n")
    .filter((line) => line.startsWith("CALL\t") || line === "CALL")
    .map((line) => (line === "CALL" ? [] : line.slice("CALL\t".length).split("\t")));
}

function field(text, key) {
  const match = text.match(new RegExp(`^${key}=(.*)$`, "m"));
  assert.ok(match, `missing ${key} in cleanup evidence`);
  return match[1];
}

function section(text, name) {
  const match = text.match(new RegExp(`${name}<<EOF\\n([\\s\\S]*?)\\n?EOF`));
  assert.ok(match, `missing section ${name}`);
  return match[1] ?? "";
}

function makeWorld() {
  const root = mkdtempSync(path.join(tmpdir(), "c1-proof-cleanup-"));
  const bin = path.join(root, "bin");
  const state = path.join(root, "state");
  mkdirSync(bin);
  mkdirSync(state);
  writeFileSync(path.join(state, "containers"), "");
  writeFileSync(path.join(state, "volumes"), "");
  writeFileSync(path.join(state, "images"), "");
  writeFileSync(path.join(bin, "podman"), FAKE_PODMAN, { mode: 0o755 });
  chmodSync(path.join(bin, "podman"), 0o755);
  return {
    root,
    bin,
    state,
    log: path.join(root, "podman.log"),
    evidence: path.join(root, "cleanup.txt"),
  };
}

function writeLines(file, lines) {
  writeFileSync(file, lines.length === 0 ? "" : `${lines.join("\n")}\n`);
}

function runCleanup(world, options) {
  const names = options.names ?? [];
  const ids = options.ids ?? [];
  const volumes = options.volumes ?? [];
  const image = options.image ?? "";
  const runId = options.runId;
  writeLines(
    path.join(world.state, "containers"),
    (options.containers ?? []).map((item) => `${item.id} ${item.name}`),
  );
  writeLines(
    path.join(world.state, "volumes"),
    (options.volumesPresent ?? []).map((item) => item),
  );
  writeLines(
    path.join(world.state, "images"),
    (options.images ?? []).map((item) => `${item.id} ${item.tag}`),
  );
  const script = `
set -u
source ${sh(lib)}
export C1_PROOF_CLEANUP_ATTEMPTS="\${C1_PROOF_CLEANUP_ATTEMPTS:-5}"
export C1_PROOF_CLEANUP_SLEEP_SECONDS="\${C1_PROOF_CLEANUP_SLEEP_SECONDS:-0}"
set +e
c1_proof_cleanup ${sh(runId)} ${sh(world.evidence)} \\
  --names ${names.map(sh).join(" ")} \\
  --ids ${ids.map(sh).join(" ")} \\
  --volumes ${volumes.map(sh).join(" ")} \\
  ${image ? `--image ${sh(image)}` : ""} \\
  --
status=\$?
printf 'FUNCTION_STATUS=%s\\n' "\$status"
printf 'MATRIX_RESULT=%s\\n' "\$(c1_proof_cleanup_matrix_result ${sh(world.evidence)})"
printf 'MATRIX_NOTE=%s\\n' "\$(c1_proof_cleanup_matrix_note ${sh(world.evidence)})"
exit "\$status"
`;
  return spawnSync("bash", ["-c", script], {
    encoding: "utf8",
    env: {
      PATH: `${world.bin}:/usr/bin:/bin`,
      HOME: process.env.HOME || "/tmp",
      PODMAN_LOG: world.log,
      PODMAN_STATE: world.state,
      C1_PROOF_CLEANUP_ATTEMPTS: options.attempts ?? "5",
      C1_PROOF_CLEANUP_SLEEP_SECONDS: "0",
      FAKE_REMOVE_ON_ATTEMPT: options.removeOnAttempt ?? "1",
      FAKE_VOLUME_REMOVE: options.volumeRemove ?? "1",
      FAKE_IMAGE_REMOVE: options.imageRemove ?? "1",
    },
  });
}

function cleanupText(world) {
  return readFileSync(world.evidence, "utf8");
}

test("proof script syntax and run-owned cleanup wiring", () => {
  for (const file of [lib, proof]) {
    const syntax = spawnSync("bash", ["-n", file], { encoding: "utf8" });
    assert.equal(syntax.status, 0, syntax.stderr);
  }
  const src = readFileSync(proof, "utf8");
  const runCalls = src.match(/^\s*podman run\b/gm) || [];
  assert.equal(runCalls.length, 1);
  assert.match(src, /source "\$\{ROOT\}\/scripts\/proof\/lib\/c1-proof-cleanup\.sh"/);
  assert.match(src, /c1_proof_install_exit_trap/);
  assert.match(src, /IMAGE="localhost\/boba-bear-postgres:\$\{RUN_ID\}"/);
  assert.doesNotMatch(src, /trap cleanup EXIT/);
  assert.doesNotMatch(src, /podman rm -a/);
  assert.doesNotMatch(src, /volume prune/);
  assert.doesNotMatch(src, /podman rmi -a/);
  assert.doesNotMatch(src, /--filter "name=c1-proof-b-/);
  assert.match(src, /c1_proof_classify_result/);
  assert.match(src, /c1_proof_release_registry/);
  assert.match(src, /c1_proof_finalize_cleanup_evidence/);
  assert.match(src, /C1_PROOF_REACHED_END=1/);
  assert.match(src, /\$\{C1_REGISTRY_DIR\}\/image/);
  assert.doesNotMatch(
    src,
    /rm -rf "\$\{HOST_BAD\}" "\$\{TMP\}" "\$\{TRIVY_WD\}" "\$\{C1_REGISTRY_DIR\}"/,
  );
});

test("production image specifies non-root USER postgres", () => {
  const dockerfile = readFileSync(path.join(here, "../../docker/postgres/Dockerfile"), "utf8");
  const users = [...dockerfile.matchAll(/^USER\s+(\S+)/gm)].map((match) => match[1]);
  assert.equal(users[users.length - 1], "postgres");
});

test("rm exit 0 with a container still present fails closed", () => {
  const world = makeWorld();
  const runId = "c1-proof-b-0123456789ab-121212";
  const name = `${runId}-bad-owner`;
  const id = "f1fd857bd9a4a8e736639853ce6308c1d623b8399edb92d13c07e5f0d767b2ff";
  try {
    const result = runCleanup(world, {
      runId,
      names: [name],
      ids: [id],
      containers: [{ id, name }],
      removeOnAttempt: "99",
    });
    assert.notEqual(result.status, 0, result.stderr);
    assert.match(result.stdout, /FUNCTION_STATUS=[1-9]/);
    assert.match(result.stdout, /MATRIX_RESULT=FAIL/);
    assert.match(result.stdout, /MATRIX_NOTE=cleanup_exit=1;/);
    assert.doesNotMatch(result.stdout, /MATRIX_NOTE=.*PASS/);
    const evidence = cleanupText(world);
    assert.equal(field(evidence, "cleanup_exit"), "1");
    assert.equal(field(evidence, "cleanup_attempts"), "5");
    assert.match(section(evidence, "leftover_containers"), new RegExp(name));
    const calls = readCalls(world.log);
    assert.ok(calls.some((argv) => argv[0] === "rm" && argv.includes(name)));
    assert.ok(calls.some((argv) => argv[0] === "rm" && argv.includes(id)));

    const matrix = path.join(world.root, "matrix.tsv");
    writeFileSync(
      matrix,
      [
        "final_image_uid\tPASS\tuid ok",
        "fresh_start_restart\tPASS\trestart ok",
        "docker_engine\tUNVERIFIED\tdocker unused",
        "s3_live_spaces\tUNVERIFIED\tno live spaces",
        "",
      ].join("\n"),
    );
    const classified = spawnSync(
      "bash",
      [
        "-c",
        `source ${sh(lib)}; c1_proof_classify_result ${sh(matrix)} ${sh(world.evidence)}`,
      ],
      { encoding: "utf8" },
    );
    assert.equal(classified.status, 1, classified.stderr);
    assert.equal(classified.stdout.trim(), "PROOF_RESULT=FAIL");
    assert.doesNotMatch(classified.stdout, /PASS/);
  } finally {
    rmSync(world.root, { recursive: true, force: true });
  }
});

test("a later bounded attempt removes the container", () => {
  const world = makeWorld();
  const runId = "c1-proof-b-0123456789ab-121213";
  const name = `${runId}-pg`;
  const id = "49ddc4d755875394b3edc45fde35506907b84d2f192904ce5116459f20f4c64f";
  const image = `localhost/boba-bear-postgres:${runId}`;
  try {
    const result = runCleanup(world, {
      runId,
      names: [name],
      ids: [id],
      image,
      containers: [{ id, name }],
      images: [{ id: "sha256:abc123", tag: image }],
      removeOnAttempt: "3",
    });
    assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
    const evidence = cleanupText(world);
    const attempts = Number(field(evidence, "cleanup_attempts"));
    assert.equal(field(evidence, "cleanup_exit"), "0");
    assert.equal(field(evidence, "image_id"), "sha256:abc123");
    assert.equal(field(evidence, "image_removed"), "YES");
    assert.ok(attempts > 1, `attempts=${attempts}`);
    assert.ok(attempts <= 5, `attempts=${attempts}`);
    assert.equal(attempts, 3);
    assert.equal(section(evidence, "leftover_containers").trim(), "");
    assert.match(result.stdout, /MATRIX_RESULT=PASS/);
    assert.match(result.stdout, /cleanup_exit=0/);
    const calls = readCalls(world.log);
    const inspectAt = calls.findIndex((argv) => argv[0] === "image" && argv[1] === "inspect");
    const rmiAt = calls.findIndex((argv) => argv[0] === "rmi");
    assert.ok(inspectAt >= 0 && rmiAt > inspectAt);
  } finally {
    rmSync(world.root, { recursive: true, force: true });
  }
});

test("rm non-zero because the container is already absent still verifies clean", () => {
  const world = makeWorld();
  const runId = "c1-proof-b-0123456789ab-121214";
  const name = `${runId}-root`;
  const id = "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
  try {
    const result = runCleanup(world, {
      runId,
      names: [name],
      ids: [id],
      containers: [],
    });
    assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
    const evidence = cleanupText(world);
    assert.equal(field(evidence, "cleanup_exit"), "0");
    assert.equal(field(evidence, "cleanup_attempts"), "1");
    assert.equal(section(evidence, "leftover_containers").trim(), "");
    const calls = readCalls(world.log);
    assert.ok(calls.some((argv) => argv[0] === "rm" && argv.includes(name)));
  } finally {
    rmSync(world.root, { recursive: true, force: true });
  }
});

test("unrelated containers are never passed to rm or volume rm", () => {
  const world = makeWorld();
  const runId = "c1-proof-b-0123456789ab-121215";
  const name = `${runId}-pg`;
  const id = "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb";
  const unrelated = [
    "unruffled_blackwell",
    "laughing_grothendieck",
    "c1-proof-b-ffffffffffffffff-999999-pg",
  ];
  try {
    const result = runCleanup(world, {
      runId,
      names: [name],
      ids: [id],
      volumes: [`${runId}-pgdata`],
      containers: [
        { id, name },
        { id: "cccc1111cccc1111cccc1111cccc1111cccc1111cccc1111cccc1111cccc1111", name: unrelated[0] },
        { id: "cccc2222cccc2222cccc2222cccc2222cccc2222cccc2222cccc2222cccc2222", name: unrelated[1] },
        { id: "cccc3333cccc3333cccc3333cccc3333cccc3333cccc3333cccc3333cccc3333", name: unrelated[2] },
      ],
      volumesPresent: [`${runId}-pgdata`, "unruffled_blackwell", "laughing_grothendieck"],
    });
    assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
    assert.equal(field(cleanupText(world), "cleanup_exit"), "0");
    const calls = readCalls(world.log);
    for (const argv of calls) {
      assert.equal(argv.includes("prune"), false, argv.join(" "));
      const removesContainers = argv[0] === "rm";
      const removesVolumes = argv[0] === "volume" && argv[1] === "rm";
      const removesImages = argv[0] === "rmi";
      if (removesContainers || removesVolumes || removesImages) {
        assert.equal(argv.includes("-a"), false, argv.join(" "));
        assert.equal(argv.includes("--all"), false, argv.join(" "));
        for (const foreign of unrelated) {
          assert.equal(argv.includes(foreign), false, argv.join(" "));
        }
      }
    }
    const containersLeft = readFileSync(path.join(world.state, "containers"), "utf8");
    for (const foreign of unrelated) {
      assert.match(containersLeft, new RegExp(foreign));
    }
    assert.doesNotMatch(containersLeft, new RegExp(` ${name}$`, "m"));
    const volumesLeft = readFileSync(path.join(world.state, "volumes"), "utf8");
    assert.match(volumesLeft, /unruffled_blackwell/);
    assert.match(volumesLeft, /laughing_grothendieck/);
    assert.doesNotMatch(volumesLeft, new RegExp(`^${runId}-pgdata$`, "m"));
  } finally {
    rmSync(world.root, { recursive: true, force: true });
  }
});

test("a volume that survives every retry is cleanup_exit=1", () => {
  const world = makeWorld();
  const runId = "c1-proof-b-0123456789ab-121216";
  const volume = `${runId}-pgdata`;
  try {
    const result = runCleanup(world, {
      runId,
      volumes: [volume],
      volumesPresent: [volume],
      volumeRemove: "0",
    });
    assert.notEqual(result.status, 0, result.stderr);
    const evidence = cleanupText(world);
    assert.equal(field(evidence, "cleanup_exit"), "1");
    assert.equal(field(evidence, "cleanup_attempts"), "5");
    assert.match(section(evidence, "leftover_volumes"), new RegExp(`^${volume}$`, "m"));
    assert.match(result.stdout, /MATRIX_RESULT=FAIL/);
    assert.doesNotMatch(result.stdout, /MATRIX_NOTE=.*PASS/);
  } finally {
    rmSync(world.root, { recursive: true, force: true });
  }
});

test("EXIT trap keeps a failing status instead of returning 0", () => {
  const world = makeWorld();
  const runId = "c1-proof-b-0123456789ab-121217";
  const scriptPath = path.join(world.root, "trap.sh");
  try {
    writeFileSync(
      scriptPath,
      `#!/usr/bin/env bash
set -euo pipefail
source ${sh(lib)}
c1_proof_cleanup_hook() { return 0; }
C1_RUN_ID=${sh(runId)}
C1_CLEANUP_EVIDENCE=${sh(world.evidence)}
C1_IMAGE_REF=""
C1_CONTAINER_NAMES=()
C1_CONTAINER_IDS=()
C1_VOLUME_NAMES=()
c1_proof_install_exit_trap
c1_proof_cleanup "\$C1_RUN_ID" "\$C1_CLEANUP_EVIDENCE" --names --ids --volumes --
exit 1
`,
      { mode: 0o755 },
    );
    const result = spawnSync("bash", [scriptPath], {
      encoding: "utf8",
      env: {
        PATH: `${world.bin}:/usr/bin:/bin`,
        HOME: process.env.HOME || "/tmp",
        PODMAN_LOG: world.log,
        PODMAN_STATE: world.state,
        C1_PROOF_CLEANUP_ATTEMPTS: "5",
        C1_PROOF_CLEANUP_SLEEP_SECONDS: "0",
      },
    });
    assert.equal(result.status, 1, `${result.stdout}\n${result.stderr}`);
    assert.equal(field(cleanupText(world), "cleanup_exit"), "0");
  } finally {
    rmSync(world.root, { recursive: true, force: true });
  }
});

test("failed removal stays incomplete and the exit trap retries only this run", () => {
  const world = makeWorld();
  const runId = "c1-proof-b-0123456789ab-121219";
  const ownedName = `${runId}-bad-owner`;
  const ownedId = "f1fd857bd9a4a8e736639853ce6308c1d623b8399edb92d13c07e5f0d767b2ff";
  const foreignName = "unruffled_blackwell";
  const foreignId = "cccc1111cccc1111cccc1111cccc1111cccc1111cccc1111cccc1111cccc1111";
  const foreignVolume = "laughing_grothendieck";
  const ownedVolume = `${runId}-pgdata`;
  const sentinel = path.join(world.root, "outside-run-sentinel");
  writeFileSync(sentinel, "keep\n");
  writeLines(path.join(world.state, "containers"), [
    `${ownedId} ${ownedName}`,
    `${foreignId} ${foreignName}`,
  ]);
  writeLines(path.join(world.state, "volumes"), [ownedVolume, foreignVolume]);
  writeFileSync(path.join(world.state, "rm-count"), "0\n");
  const fake = `#!/usr/bin/env bash
set -u
log() {
  {
    printf 'CALL'
    for arg in "\$@"; do
      printf '\\t%s' "\$arg"
    done
    printf '\\n'
  } >> "\$PODMAN_LOG"
}
log "\$@"
cmd="\$1"
shift
state_file() {
  printf '%s/%s\\n' "\$PODMAN_STATE" "\$1"
}
token_present() {
  local kind="\$1" token="\$2" line id name
  while IFS= read -r line || [ -n "\$line" ]; do
    [ -n "\$line" ] || continue
    if [ "\$kind" = "volume" ]; then
      [ "\$line" = "\$token" ] && return 0
    else
      id="\${line%% *}"
      name="\${line#* }"
      [ "\$token" = "\$id" ] || [ "\$token" = "\$name" ] && return 0
    fi
  done < "\$(state_file "\$kind")"
  return 1
}
drop_token() {
  local kind="\$1" token="\$2" line id name tmp
  tmp="\$(state_file "\$kind").tmp"
  : > "\$tmp"
  while IFS= read -r line || [ -n "\$line" ]; do
    [ -n "\$line" ] || continue
    if [ "\$kind" = "volume" ]; then
      [ "\$line" = "\$token" ] && continue
    else
      id="\${line%% *}"
      name="\${line#* }"
      if [ "\$token" = "\$id" ] || [ "\$token" = "\$name" ]; then
        continue
      fi
    fi
    printf '%s\\n' "\$line" >> "\$tmp"
  done < "\$(state_file "\$kind")"
  mv "\$tmp" "\$(state_file "\$kind")"
}
case "\$cmd" in
  ps)
    cat "\$(state_file containers)" 2>/dev/null || true
    exit 0
    ;;
  rm)
    token="\${@: -1}"
    count="\$(cat "\$(state_file rm-count)")"
    count=\$((count + 1))
    printf '%s\\n' "\$count" > "\$(state_file rm-count)"
    if [ "\$token" = "${foreignName}" ] || [ "\$token" = "${foreignId}" ]; then
      printf 'foreign-rm %s\\n' "\$token" >> "\$(state_file leaks)"
      exit 1
    fi
    if [ "\$count" -le 10 ]; then
      exit 0
    fi
    drop_token containers "\$token"
    exit 0
    ;;
  volume)
    sub="\$1"
    shift
    if [ "\$sub" = "ls" ]; then
      cat "\$(state_file volumes)" 2>/dev/null || true
      exit 0
    fi
    if [ "\$sub" = "rm" ]; then
      token="\${@: -1}"
      if [ "\$token" = "${foreignVolume}" ]; then
        printf 'foreign-volume %s\\n' "\$token" >> "\$(state_file leaks)"
        exit 1
      fi
      if token_present volumes "\$token"; then
        drop_token volumes "\$token"
      fi
      exit 0
    fi
    echo "unexpected volume subcommand" >&2
    exit 99
    ;;
  network)
    printf 'network %s\\n' "\$*" >> "\$(state_file leaks)"
    exit 99
    ;;
  *)
    echo "unexpected podman command: \$cmd" >&2
    exit 99
    ;;
esac
`;
  writeFileSync(path.join(world.bin, "podman"), fake, { mode: 0o755 });
  chmodSync(path.join(world.bin, "podman"), 0o755);
  const scriptPath = path.join(world.root, "trap-retry.sh");
  writeFileSync(
    scriptPath,
    `#!/usr/bin/env bash
set -u
source ${sh(lib)}
export C1_PROOF_CLEANUP_ATTEMPTS=5
export C1_PROOF_CLEANUP_SLEEP_SECONDS=0
C1_RUN_ID=${sh(runId)}
C1_CLEANUP_EVIDENCE=${sh(world.evidence)}
C1_IMAGE_REF=""
C1_CONTAINER_NAMES=(${sh(ownedName)})
C1_CONTAINER_IDS=(${sh(ownedId)})
C1_VOLUME_NAMES=(${sh(ownedVolume)})
C1_CLEANED=0
C1_CLEANUP_EXIT=0
c1_proof_install_exit_trap
set +e
c1_proof_cleanup_registered
explicit=\$?
set -e
printf 'AFTER_EXPLICIT cleaned=%s cleanup_exit=%s status=%s\\n' "\${C1_CLEANED}" "\${C1_CLEANUP_EXIT}" "\${explicit}"
exit 0
`,
    { mode: 0o755 },
  );
  try {
    const result = spawnSync("bash", [scriptPath], {
      encoding: "utf8",
      env: {
        PATH: `${world.bin}:/usr/bin:/bin`,
        HOME: process.env.HOME || "/tmp",
        PODMAN_LOG: world.log,
        PODMAN_STATE: world.state,
        C1_PROOF_CLEANUP_ATTEMPTS: "5",
        C1_PROOF_CLEANUP_SLEEP_SECONDS: "0",
      },
    });
    assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
    assert.match(result.stdout, /AFTER_EXPLICIT cleaned=0 cleanup_exit=1 status=1/);
    const evidence = cleanupText(world);
    assert.equal(field(evidence, "cleanup_exit"), "0");
    assert.equal(section(evidence, "leftover_containers").trim(), "");
    assert.equal(section(evidence, "leftover_volumes").trim(), "");
    const containersLeft = readFileSync(path.join(world.state, "containers"), "utf8");
    assert.match(containersLeft, new RegExp(foreignName));
    assert.doesNotMatch(containersLeft, new RegExp(ownedName));
    const volumesLeft = readFileSync(path.join(world.state, "volumes"), "utf8");
    assert.match(volumesLeft, new RegExp(`^${foreignVolume}$`, "m"));
    assert.doesNotMatch(volumesLeft, new RegExp(`^${ownedVolume}$`, "m"));
    assert.equal(existsSync(path.join(world.state, "leaks")), false);
    assert.equal(readFileSync(sentinel, "utf8"), "keep\n");
    const calls = readCalls(world.log);
    assert.equal(calls.some((argv) => argv[0] === "network"), false);
    assert.equal(calls.some((argv) => argv.includes(foreignName) || argv.includes(foreignId)), false);
    assert.equal(calls.some((argv) => argv.includes(foreignVolume)), false);
    const rmCalls = calls.filter((argv) => argv[0] === "rm").length;
    assert.ok(rmCalls > 10, `expected a trap retry after the failed attempts, rmCalls=${rmCalls}`);
  } finally {
    rmSync(world.root, { recursive: true, force: true });
  }
});

test("classifier rejects a FAIL row even when cleanup_exit is 0", () => {
  const world = makeWorld();
  try {
    writeFileSync(
      world.evidence,
      [
        "run_id=c1-proof-b-0123456789ab-121218",
        "cleanup_exit=0",
        "cleanup_attempts=1",
        "image_ref=",
        "image_id=",
        "image_removed=NO",
        "leftover_containers<<EOF",
        "EOF",
        "leftover_volumes<<EOF",
        "EOF",
        "leftover_images<<EOF",
        "EOF",
        "",
      ].join("\n"),
    );
    const matrix = path.join(world.root, "matrix.tsv");
    writeFileSync(
      matrix,
      ["docker_engine\tUNVERIFIED\tdocker\n", "fresh_start_restart\tFAIL\tnot ready\n"].join(""),
    );
    const failed = spawnSync(
      "bash",
      ["-c", `source ${sh(lib)}; c1_proof_classify_result ${sh(matrix)} ${sh(world.evidence)}`],
      { encoding: "utf8" },
    );
    assert.equal(failed.status, 1);
    assert.equal(failed.stdout.trim(), "PROOF_RESULT=FAIL");

    writeFileSync(
      matrix,
      ["docker_engine\tUNVERIFIED\tdocker\n", "fresh_start_restart\tPASS\tready\n"].join(""),
    );
    const passed = spawnSync(
      "bash",
      ["-c", `source ${sh(lib)}; c1_proof_classify_result ${sh(matrix)} ${sh(world.evidence)}`],
      { encoding: "utf8" },
    );
    assert.equal(passed.status, 0, passed.stderr);
    assert.equal(passed.stdout.trim(), "PROOF_RESULT=PASS_WITH_UNVERIFIED");
  } finally {
    rmSync(world.root, { recursive: true, force: true });
  }
});

function registryPath(runId) {
  return `/tmp/boba-c1-proof-registry-${runId}`;
}

function writeRegistry(dir, fields) {
  mkdirSync(dir, { recursive: true });
  writeFileSync(path.join(dir, "names"), fields.names.length ? `${fields.names.join("\n")}\n` : "");
  writeFileSync(path.join(dir, "ids"), fields.ids.length ? `${fields.ids.join("\n")}\n` : "");
  writeFileSync(path.join(dir, "volumes"), fields.volumes.length ? `${fields.volumes.join("\n")}\n` : "");
  writeFileSync(path.join(dir, "image"), fields.image ? `${fields.image}\n` : "");
}

function cleanupRows(matrixText) {
  return matrixText
    .split("\n")
    .filter((line) => line.startsWith("cleanup\t"));
}

function runBash(world, script, extraEnv = {}) {
  return spawnSync("bash", ["-c", script], {
    encoding: "utf8",
    env: {
      PATH: `${world.bin}:/usr/bin:/bin`,
      HOME: process.env.HOME || "/tmp",
      PODMAN_LOG: world.log,
      PODMAN_STATE: world.state,
      C1_PROOF_CLEANUP_ATTEMPTS: "5",
      C1_PROOF_CLEANUP_SLEEP_SECONDS: "0",
      ...extraEnv,
    },
  });
}

test("initial cleanup succeeds and releases the registry only after verification", () => {
  const world = makeWorld();
  const runId = "c1-proof-b-cleanupfix-success1";
  const registry = registryPath(runId);
  const name = `${runId}-pg`;
  const id = "1111111111111111111111111111111111111111111111111111111111111111";
  const volume = `${runId}-pgdata`;
  const image = `localhost/boba-bear-postgres:${runId}`;
  const foreign = "unruffled_blackwell";
  const foreignVolume = "boba-bear_postgres-data";
  const sentinel = path.join(world.root, "sentinel");
  mkdirSync(sentinel);
  writeFileSync(path.join(sentinel, "keep.txt"), "keep\n");
  writeLines(path.join(world.state, "containers"), [
    `${id} ${name}`,
    `cccc1111cccc1111cccc1111cccc1111cccc1111cccc1111cccc1111cccc1111 ${foreign}`,
  ]);
  writeLines(path.join(world.state, "volumes"), [volume, foreignVolume, "laughing_grothendieck"]);
  writeLines(path.join(world.state, "images"), [`sha256:abc123 ${image}`]);
  const scriptPath = path.join(world.root, "success.sh");
  writeFileSync(
    scriptPath,
    `#!/usr/bin/env bash
set -u
source ${sh(lib)}
export C1_PROOF_CLEANUP_ATTEMPTS=5
export C1_PROOF_CLEANUP_SLEEP_SECONDS=0
C1_RUN_ID=${sh(runId)}
C1_CLEANUP_EVIDENCE=${sh(world.evidence)}
C1_REGISTRY_DIR=${sh(registry)}
C1_IMAGE_REF=""
C1_CONTAINER_NAMES=()
C1_CONTAINER_IDS=()
C1_VOLUME_NAMES=()
C1_CLEANED=0
C1_CLEANUP_EXIT=0
c1_proof_cleanup_hook() { c1_proof_release_registry || true; return 0; }
c1_proof_install_exit_trap
c1_proof_cleanup_registered || true
if [ "\${C1_CLEANED}" != "1" ] || [ ! -d "\${C1_REGISTRY_DIR}" ]; then
  printf 'REGISTRY_RELEASED_BEFORE_HOOK cleaned=%s\\n' "\${C1_CLEANED}"
  exit 9
fi
printf 'BEFORE_HOOK cleaned=%s registry=present\\n' "\${C1_CLEANED}"
c1_proof_cleanup_hook || true
if [ -d "\${C1_REGISTRY_DIR}" ]; then
  echo REGISTRY_STILL_PRESENT
  exit 9
fi
echo REGISTRY_RELEASED
exit 0
`,
    { mode: 0o755 },
  );
  try {
    rmSync(registry, { recursive: true, force: true });
    writeRegistry(registry, { names: [name], ids: [id], volumes: [volume], image });
    const result = runBash(world, `bash ${sh(scriptPath)}`);
    assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
    assert.match(result.stdout, /BEFORE_HOOK cleaned=1 registry=present/);
    assert.match(result.stdout, /REGISTRY_RELEASED/);
    assert.equal(existsSync(registry), false);
    const evidence = cleanupText(world);
    assert.equal(field(evidence, "cleanup_exit"), "0");
    assert.equal(field(evidence, "image_ref"), image);
    assert.equal(section(evidence, "leftover_containers").trim(), "");
    assert.equal(section(evidence, "leftover_volumes").trim(), "");
    assert.equal(section(evidence, "leftover_images").trim(), "");
    const containersLeft = readFileSync(path.join(world.state, "containers"), "utf8");
    assert.match(containersLeft, new RegExp(foreign));
    assert.doesNotMatch(containersLeft, new RegExp(name));
    const volumesLeft = readFileSync(path.join(world.state, "volumes"), "utf8");
    assert.match(volumesLeft, new RegExp(`^${foreignVolume}$`, "m"));
    assert.match(volumesLeft, /laughing_grothendieck/);
    assert.doesNotMatch(volumesLeft, new RegExp(`^${volume}$`, "m"));
    assert.equal(readFileSync(path.join(sentinel, "keep.txt"), "utf8"), "keep\n");
    const calls = readCalls(world.log);
    assert.equal(calls.some((argv) => argv.includes(foreign) || argv.includes(foreignVolume)), false);
    assert.equal(calls.some((argv) => argv.includes("boba-bear_postgres-data") && argv.includes("rm")), false);
  } finally {
    rmSync(registry, { recursive: true, force: true });
    rmSync(world.root, { recursive: true, force: true });
  }
});

test("failed cleanup keeps the registry and the EXIT trap retries those identities", () => {
  const world = makeWorld();
  const runId = "c1-proof-b-cleanupfix-retry1";
  const registry = registryPath(runId);
  const name = `${runId}-bad-owner`;
  const id = "f1fd857bd9a4a8e736639853ce6308c1d623b8399edb92d13c07e5f0d767b2ff";
  const volume = `${runId}-pgdata`;
  const image = `localhost/boba-bear-postgres:${runId}`;
  const foreign = "unruffled_blackwell";
  const foreignId = "cccc1111cccc1111cccc1111cccc1111cccc1111cccc1111cccc1111cccc1111";
  const foreignVolume = "boba-bear_postgres-data";
  const sentinel = path.join(world.root, "sentinel");
  mkdirSync(sentinel);
  writeFileSync(path.join(sentinel, "keep.txt"), "keep\n");
  writeLines(path.join(world.state, "containers"), [`${id} ${name}`, `${foreignId} ${foreign}`]);
  writeLines(path.join(world.state, "volumes"), [volume, foreignVolume]);
  writeLines(path.join(world.state, "images"), [`sha256:abc123 ${image}`]);
  writeFileSync(path.join(world.state, "rm-count"), "0\n");
  const matrix = path.join(world.root, "matrix.tsv");
  writeFileSync(matrix, "fresh_start_restart\tPASS\tready\ncleanup\tFAIL\tintermediate attempt\n");
  const fake = `#!/usr/bin/env bash
set -u
{
  printf 'CALL'
  for arg in "\$@"; do
    printf '\\t%s' "\$arg"
  done
  printf '\\n'
} >> "\$PODMAN_LOG"
cmd="\$1"
shift
state_file() { printf '%s/%s\\n' "\$PODMAN_STATE" "\$1"; }
line_matches() {
  local kind="\$1" token="\$2" line="\$3" id name
  if [ "\$kind" = "volume" ]; then
    [ "\$line" = "\$token" ]
    return
  fi
  id="\${line%% *}"
  name="\${line#* }"
  [ "\$token" = "\$id" ] || [ "\$token" = "\$name" ]
}
drop_token() {
  local kind="\$1" token="\$2" line tmp
  tmp="\$(state_file "\$kind").tmp"
  : > "\$tmp"
  while IFS= read -r line || [ -n "\$line" ]; do
    [ -n "\$line" ] || continue
    if line_matches "\$kind" "\$token" "\$line"; then
      continue
    fi
    printf '%s\\n' "\$line" >> "\$tmp"
  done < "\$(state_file "\$kind")"
  mv "\$tmp" "\$(state_file "\$kind")"
}
token="\${@: -1}"
case "\$cmd" in
  ps)
    cat "\$(state_file containers)" 2>/dev/null || true
    exit 0
    ;;
  rm)
    count="\$(cat "\$(state_file rm-count)")"
    count=\$((count + 1))
    printf '%s\\n' "\$count" > "\$(state_file rm-count)"
    if [ "\$count" -le 10 ]; then
      exit 0
    fi
    drop_token containers "\$token"
    exit 0
    ;;
  rmi)
    drop_token images "\$token"
    exit 0
    ;;
  volume)
    sub="\$1"
    shift
    token="\${@: -1}"
    if [ "\$sub" = "ls" ]; then
      cat "\$(state_file volumes)" 2>/dev/null || true
      exit 0
    fi
    if [ "\$sub" = "rm" ]; then
      drop_token volumes "\$token"
      exit 0
    fi
    exit 99
    ;;
  image)
    sub="\$1"
    shift
    token="\${@: -1}"
    if [ "\$sub" = "exists" ]; then
      if grep -q " \${token}\$" "\$(state_file images)"; then
        exit 0
      fi
      exit 1
    fi
    if [ "\$sub" = "inspect" ]; then
      awk -v tag="\$token" '\$2==tag { print \$1; found=1 } END { exit found?0:1 }' "\$(state_file images)"
      exit \$?
    fi
    exit 99
    ;;
  *)
    echo "unexpected podman command: \$cmd" >&2
    exit 99
    ;;
esac
`;
  writeFileSync(path.join(world.bin, "podman"), fake, { mode: 0o755 });
  const scriptPath = path.join(world.root, "retry.sh");
  writeFileSync(
    scriptPath,
    `#!/usr/bin/env bash
set -u
source ${sh(lib)}
export C1_PROOF_CLEANUP_ATTEMPTS=5
export C1_PROOF_CLEANUP_SLEEP_SECONDS=0
C1_RUN_ID=${sh(runId)}
C1_CLEANUP_EVIDENCE=${sh(world.evidence)}
C1_REGISTRY_DIR=${sh(registry)}
C1_IMAGE_REF=""
C1_CONTAINER_NAMES=()
C1_CONTAINER_IDS=()
C1_VOLUME_NAMES=()
C1_CLEANED=0
C1_CLEANUP_EXIT=0
MATRIX_FILE=${sh(matrix)}
c1_proof_cleanup_hook() { c1_proof_release_registry || true; return 0; }
c1_proof_finalize_cleanup_evidence() {
  c1_proof_upsert_cleanup_matrix "\${MATRIX_FILE}" "\${C1_CLEANUP_EVIDENCE}" || true
}
c1_proof_install_exit_trap
c1_proof_cleanup_registered || true
c1_proof_cleanup_hook || true
if [ ! -f "\${C1_REGISTRY_DIR}/names" ] || [ ! -f "\${C1_REGISTRY_DIR}/image" ]; then
  echo REGISTRY_DELETED_EARLY
  exit 9
fi
echo REGISTRY_RETAINED
C1_CONTAINER_NAMES=()
C1_CONTAINER_IDS=()
C1_VOLUME_NAMES=()
C1_IMAGE_REF=""
: > "\${PODMAN_LOG}"
exit 0
`,
    { mode: 0o755 },
  );
  try {
    rmSync(registry, { recursive: true, force: true });
    writeRegistry(registry, { names: [name], ids: [id], volumes: [volume], image });
    const result = runBash(world, `bash ${sh(scriptPath)}`);
    assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
    assert.match(result.stdout, /REGISTRY_RETAINED/);
    assert.equal(existsSync(registry), false);
    const evidence = cleanupText(world);
    assert.equal(field(evidence, "cleanup_exit"), "0");
    assert.equal(field(evidence, "image_ref"), image);
    assert.equal(section(evidence, "leftover_containers").trim(), "");
    assert.equal(section(evidence, "leftover_volumes").trim(), "");
    const rows = cleanupRows(readFileSync(matrix, "utf8"));
    assert.deepEqual(rows.map((line) => line.split("\t")[1]), ["PASS"]);
    const containersLeft = readFileSync(path.join(world.state, "containers"), "utf8");
    assert.match(containersLeft, new RegExp(foreign));
    assert.doesNotMatch(containersLeft, new RegExp(name));
    const volumesLeft = readFileSync(path.join(world.state, "volumes"), "utf8");
    assert.match(volumesLeft, new RegExp(`^${foreignVolume}$`, "m"));
    assert.doesNotMatch(volumesLeft, new RegExp(`^${volume}$`, "m"));
    assert.equal(readFileSync(path.join(sentinel, "keep.txt"), "utf8"), "keep\n");
    const calls = readCalls(world.log);
    const rmi = calls.filter((argv) => argv[0] === "rmi" && argv.includes(image));
    assert.equal(rmi.length >= 1, true);
    assert.equal(calls.some((argv) => argv[0] === "rm" && argv.includes(name)), true);
    assert.equal(calls.some((argv) => argv[0] === "rm" && argv.includes(id)), true);
    assert.equal(calls.some((argv) => argv.includes(foreign) || argv.includes(foreignId) || argv.includes(foreignVolume)), false);
  } finally {
    rmSync(registry, { recursive: true, force: true });
    rmSync(world.root, { recursive: true, force: true });
  }
});

test("permanent cleanup failure keeps leftovers, the registry, and a FAIL row", () => {
  const world = makeWorld();
  const runId = "c1-proof-b-cleanupfix-fail1";
  const registry = registryPath(runId);
  const name = `${runId}-root`;
  const id = "49ddc4d755875394b3edc45fde35506907b84d2f192904ce5116459f20f4c64f";
  const volume = `${runId}-pgdata`;
  const image = `localhost/boba-bear-postgres:${runId}`;
  const matrix = path.join(world.root, "matrix.tsv");
  writeFileSync(matrix, "cleanup\tFAIL\tintermediate attempt\n");
  writeLines(path.join(world.state, "containers"), [`${id} ${name}`]);
  writeLines(path.join(world.state, "volumes"), [volume, "boba-bear_postgres-data"]);
  writeLines(path.join(world.state, "images"), [`sha256:abc123 ${image}`]);
  const scriptPath = path.join(world.root, "fail.sh");
  writeFileSync(
    scriptPath,
    `#!/usr/bin/env bash
set -u
source ${sh(lib)}
export C1_PROOF_CLEANUP_ATTEMPTS=5
export C1_PROOF_CLEANUP_SLEEP_SECONDS=0
C1_RUN_ID=${sh(runId)}
C1_CLEANUP_EVIDENCE=${sh(world.evidence)}
C1_REGISTRY_DIR=${sh(registry)}
C1_IMAGE_REF=""
C1_CONTAINER_NAMES=()
C1_CONTAINER_IDS=()
C1_VOLUME_NAMES=()
C1_CLEANED=0
MATRIX_FILE=${sh(matrix)}
c1_proof_cleanup_hook() { c1_proof_release_registry || true; return 0; }
c1_proof_finalize_cleanup_evidence() {
  c1_proof_upsert_cleanup_matrix "\${MATRIX_FILE}" "\${C1_CLEANUP_EVIDENCE}" || true
}
c1_proof_install_exit_trap
c1_proof_cleanup_registered || true
c1_proof_cleanup_hook || true
exit 0
`,
    { mode: 0o755 },
  );
  try {
    rmSync(registry, { recursive: true, force: true });
    writeRegistry(registry, { names: [name], ids: [id], volumes: [volume], image });
    const result = runBash(world, `bash ${sh(scriptPath)}`, {
      FAKE_REMOVE_ON_ATTEMPT: "99",
      FAKE_VOLUME_REMOVE: "0",
      FAKE_IMAGE_REMOVE: "0",
    });
    assert.equal(result.status, 1, `${result.stdout}\n${result.stderr}`);
    assert.equal(existsSync(path.join(registry, "names")), true);
    assert.equal(existsSync(path.join(registry, "image")), true);
    const evidence = cleanupText(world);
    assert.equal(field(evidence, "cleanup_exit"), "1");
    assert.match(section(evidence, "leftover_containers"), new RegExp(name));
    assert.match(section(evidence, "leftover_volumes"), new RegExp(`^${volume}$`, "m"));
    assert.match(section(evidence, "leftover_images"), new RegExp(image));
    const rows = cleanupRows(readFileSync(matrix, "utf8"));
    assert.deepEqual(rows.map((line) => line.split("\t")[1]), ["FAIL"]);
    const volumesLeft = readFileSync(path.join(world.state, "volumes"), "utf8");
    assert.match(volumesLeft, /^boba-bear_postgres-data$/m);
    const calls = readCalls(world.log);
    assert.equal(calls.some((argv) => argv.includes("boba-bear_postgres-data")), false);
  } finally {
    rmSync(registry, { recursive: true, force: true });
    rmSync(world.root, { recursive: true, force: true });
  }
});

test("a failing verification command cannot mark cleanup successful", () => {
  const world = makeWorld();
  const runId = "c1-proof-b-cleanupfix-verify1";
  const name = `${runId}-pg`;
  const id = "2222222222222222222222222222222222222222222222222222222222222222";
  const image = `localhost/boba-bear-postgres:${runId}`;
  const fake = `#!/usr/bin/env bash
set -u
{
  printf 'CALL'
  for arg in "\$@"; do
    printf '\\t%s' "\$arg"
  done
  printf '\\n'
} >> "\$PODMAN_LOG"
cmd="\$1"
shift
if [ "\$cmd" = "ps" ]; then
  echo "podman ps failed" >&2
  exit 2
fi
if [ "\$cmd" = "volume" ]; then
  exit 0
fi
if [ "\$cmd" = "image" ]; then
  sub="\$1"
  if [ "\$sub" = "inspect" ]; then
    echo sha256:abc123
    exit 0
  fi
  if [ "\$sub" = "exists" ]; then
    echo "podman image exists failed" >&2
    exit 2
  fi
fi
exit 0
`;
  writeFileSync(path.join(world.bin, "podman"), fake, { mode: 0o755 });
  try {
    const result = runCleanup(world, {
      runId,
      names: [name],
      ids: [id],
      image,
      containers: [{ id, name }],
      images: [{ id: "sha256:abc123", tag: image }],
    });
    assert.notEqual(result.status, 0, result.stdout);
    const evidence = cleanupText(world);
    assert.equal(field(evidence, "cleanup_exit"), "1");
    assert.match(section(evidence, "leftover_containers"), /VERIFY_FAILED/);
    assert.match(section(evidence, "leftover_images"), /VERIFY_FAILED/);
    assert.match(result.stdout, /MATRIX_RESULT=FAIL/);
  } finally {
    rmSync(world.root, { recursive: true, force: true });
  }
});

test("an empty retry does not replace a failed cleanup result", () => {
  const world = makeWorld();
  const runId = "c1-proof-b-cleanupfix-vacuous1";
  const name = `${runId}-pg`;
  const matrix = path.join(world.root, "matrix.tsv");
  const failedEvidence = [
    `run_id=${runId}`,
    "cleanup_exit=1",
    "cleanup_attempts=5",
    "image_ref=",
    "image_id=",
    "image_removed=NO",
    "leftover_containers<<EOF",
    `abcd ${name}`,
    "EOF",
    "leftover_volumes<<EOF",
    `${runId}-pgdata`,
    "EOF",
    "leftover_images<<EOF",
    "EOF",
    "",
  ].join("\n");
  writeFileSync(world.evidence, failedEvidence);
  writeFileSync(matrix, `cleanup\tFAIL\tleftovers recorded in cleanup evidence\n`);
  const script = `
set -u
source ${sh(lib)}
c1_proof_cleanup ${sh(runId)} ${sh(world.evidence)} --names --ids --volumes --
status=\$?
printf 'FUNCTION_STATUS=%s\\n' "\$status"
printf 'CLEANED=%s\\n' "\${C1_CLEANED}"
c1_proof_upsert_cleanup_matrix ${sh(matrix)} ${sh(world.evidence)}
exit "\$status"
`;
  try {
    const result = runBash(world, script);
    assert.notEqual(result.status, 0, result.stdout);
    assert.match(result.stdout, /FUNCTION_STATUS=1/);
    assert.match(result.stdout, /CLEANED=0/);
    assert.equal(cleanupText(world), failedEvidence);
    const rows = cleanupRows(readFileSync(matrix, "utf8"));
    assert.deepEqual(rows.map((line) => line.split("\t")[1]), ["FAIL"]);
  } finally {
    rmSync(world.root, { recursive: true, force: true });
  }
});

test("registry release stays inside the disposable prefix", () => {
  const world = makeWorld();
  const runId = "c1-proof-b-cleanupfix-prefix1";
  const registry = registryPath(runId);
  const outside = path.join(world.root, "not-a-registry");
  mkdirSync(outside);
  writeFileSync(path.join(outside, "keep.txt"), "keep\n");
  const script = `
set -u
source ${sh(lib)}
C1_CLEANED=0
C1_REGISTRY_DIR=${sh(registry)}
c1_proof_release_registry
if [ ! -d ${sh(registry)} ]; then
  echo RELEASED_WHILE_DIRTY
  exit 9
fi
C1_CLEANED=1
C1_REGISTRY_DIR=${sh(outside)}
if c1_proof_release_registry; then
  echo RELEASED_OUTSIDE_PREFIX
  exit 9
fi
if [ ! -f ${sh(path.join(outside, "keep.txt"))} ]; then
  echo OUTSIDE_REMOVED
  exit 9
fi
C1_REGISTRY_DIR=${sh(registry)}
c1_proof_release_registry
if [ -d ${sh(registry)} ]; then
  echo REGISTERED_DIR_REMAINED
  exit 9
fi
echo PREFIX_OK
`;
  try {
    rmSync(registry, { recursive: true, force: true });
    mkdirSync(registry);
    writeFileSync(path.join(registry, "names"), `${runId}-pg\n`);
    const result = runBash(world, script);
    assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
    assert.match(result.stdout, /PREFIX_OK/);
    assert.equal(existsSync(registry), false);
    assert.equal(readFileSync(path.join(outside, "keep.txt"), "utf8"), "keep\n");
  } finally {
    rmSync(registry, { recursive: true, force: true });
    rmSync(world.root, { recursive: true, force: true });
  }
});

test("interruption cleanup stays on this run and preserves the failed script status", () => {
  const world = makeWorld();
  const runId = "c1-proof-b-cleanupfix-interrupt1";
  const registry = registryPath(runId);
  const name = `${runId}-pg`;
  const id = "3333333333333333333333333333333333333333333333333333333333333333";
  const volume = `${runId}-pgdata`;
  const image = `localhost/boba-bear-postgres:${runId}`;
  const foreign = "laughing_grothendieck";
  const runTmp = path.join(world.root, "run-tmp");
  const sentinel = path.join(world.root, "sentinel");
  mkdirSync(runTmp);
  mkdirSync(sentinel);
  writeFileSync(path.join(runTmp, "temp.txt"), "temp\n");
  writeFileSync(path.join(sentinel, "keep.txt"), "keep\n");
  writeLines(path.join(world.state, "containers"), [
    `${id} ${name}`,
    `dddd1111dddd1111dddd1111dddd1111dddd1111dddd1111dddd1111dddd1111 ${foreign}`,
  ]);
  writeLines(path.join(world.state, "volumes"), [volume, "boba-bear_postgres-data"]);
  writeLines(path.join(world.state, "images"), [`sha256:abc123 ${image}`]);
  const scriptPath = path.join(world.root, "interrupt.sh");
  writeFileSync(
    scriptPath,
    `#!/usr/bin/env bash
set -u
source ${sh(lib)}
export C1_PROOF_CLEANUP_ATTEMPTS=5
export C1_PROOF_CLEANUP_SLEEP_SECONDS=0
C1_RUN_ID=${sh(runId)}
C1_CLEANUP_EVIDENCE=${sh(world.evidence)}
C1_REGISTRY_DIR=${sh(registry)}
C1_IMAGE_REF=""
C1_CONTAINER_NAMES=()
C1_CONTAINER_IDS=()
C1_VOLUME_NAMES=()
C1_CLEANED=0
c1_proof_cleanup_hook() {
  rm -rf ${sh(runTmp)} >/dev/null 2>&1 || true
  c1_proof_release_registry || true
  return 0
}
c1_proof_install_exit_trap
echo INTERRUPT
exit 1
`,
    { mode: 0o755 },
  );
  try {
    rmSync(registry, { recursive: true, force: true });
    writeRegistry(registry, { names: [name], ids: [id], volumes: [volume], image });
    const result = runBash(world, `bash ${sh(scriptPath)}`);
    assert.equal(result.status, 1, `${result.stdout}\n${result.stderr}`);
    assert.match(result.stdout, /INTERRUPT/);
    assert.equal(existsSync(runTmp), false);
    assert.equal(existsSync(registry), false);
    assert.equal(readFileSync(path.join(sentinel, "keep.txt"), "utf8"), "keep\n");
    const evidence = cleanupText(world);
    assert.equal(field(evidence, "cleanup_exit"), "0");
    assert.equal(field(evidence, "image_ref"), image);
    const containersLeft = readFileSync(path.join(world.state, "containers"), "utf8");
    assert.match(containersLeft, new RegExp(foreign));
    assert.doesNotMatch(containersLeft, new RegExp(name));
    const volumesLeft = readFileSync(path.join(world.state, "volumes"), "utf8");
    assert.match(volumesLeft, /^boba-bear_postgres-data$/m);
    assert.doesNotMatch(volumesLeft, new RegExp(`^${volume}$`, "m"));
    const calls = readCalls(world.log);
    assert.equal(calls.some((argv) => argv.includes(foreign) || argv.includes("boba-bear_postgres-data")), false);
  } finally {
    rmSync(registry, { recursive: true, force: true });
    rmSync(world.root, { recursive: true, force: true });
  }
});

function podmanCmd(args, timeout = 8000) {
  return spawnSync("podman", args, { encoding: "utf8", timeout });
}

const podmanProbe = podmanCmd(["version", "--format", "{{.Client.Version}}"], 8000);
const podmanAvailable = !podmanProbe.error && podmanProbe.status === 0;

test("disposable podman cleanup removes only the registered run volume", { skip: !podmanAvailable }, (t) => {
  const runId = `c1-proof-b-cleanupfix-podman-${process.pid}`;
  const volume = `${runId}-pgdata`;
  const realVolume = "boba-bear_postgres-data";
  assert.notEqual(volume, realVolume);
  const evidenceDir = mkdtempSync(path.join(tmpdir(), "c1-proof-podman-"));
  const evidence = path.join(evidenceDir, "cleanup.txt");
  const realBefore = podmanCmd(["volume", "exists", realVolume]);
  const created = podmanCmd(["volume", "create", volume]);
  if (created.error || created.status !== 0) {
    rmSync(evidenceDir, { recursive: true, force: true });
    t.skip(`podman volume create unavailable: ${created.error?.message || created.stderr}`);
    return;
  }
  try {
    const script = `
set -u
source ${sh(lib)}
export C1_PROOF_CLEANUP_ATTEMPTS=3
export C1_PROOF_CLEANUP_SLEEP_SECONDS=0
c1_proof_cleanup ${sh(runId)} ${sh(evidence)} --names --ids --volumes ${sh(volume)} --
`;
    const result = spawnSync("bash", ["-c", script], {
      encoding: "utf8",
      timeout: 20000,
      env: { ...process.env, PATH: process.env.PATH },
    });
    if (result.error && result.error.code === "ETIMEDOUT") {
      t.skip(`podman cleanup timed out: ${result.error.message}`);
      return;
    }
    assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
    const evidenceText = readFileSync(evidence, "utf8");
    assert.equal(field(evidenceText, "cleanup_exit"), "0");
    const gone = podmanCmd(["volume", "exists", volume]);
    assert.notEqual(gone.status, 0);
    const realAfter = podmanCmd(["volume", "exists", realVolume]);
    assert.equal(realAfter.status === 0, realBefore.status === 0);
  } finally {
    podmanCmd(["volume", "rm", "-f", volume]);
    rmSync(evidenceDir, { recursive: true, force: true });
  }
});
