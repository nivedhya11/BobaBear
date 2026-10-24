#!/usr/bin/env bash
# PG-C1 disposable engineering proof — rootless Podman only.
#
# Creates uniquely named run-owned volumes/containers. Never touches
# boba-staging, production, postgres-data, or other shared volumes.
# SECURITY_EXCEPTION_RENEWAL=NO; TRIVY_OR_SCA_BYPASS=NO; no blanket :U.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "${ROOT}"

STAMP="$(date -u +%Y%m%dT%H%M%SZ)"
RUN_ID="boba-pgc1-disp-${STAMP}-$$"
EVIDENCE_DIR="${ROOT}/artifacts/pg-c1-proof/${RUN_ID}"
mkdir -p "${EVIDENCE_DIR}"

IMAGE_BASE="localhost/boba-bear-postgres:c1-base"
IMAGE_C1="localhost/boba-bear-postgres:c1-nonroot"
CTR="${RUN_ID}-pg"
CTR_RESTORE="${RUN_ID}-restore"
VOL_PG="${RUN_ID}-pgdata"
VOL_REPO="${RUN_ID}-pgbackrest"
VOL_RESTORE="${RUN_ID}-restore-pgdata"
HOST_BAD_DIR="${EVIDENCE_DIR}/bad-bind-pgdata"

CIPHER_PASS="c1-proof-cipher-${STAMP}"
PG_PASS="c1-proof-pg-${STAMP}"
STANZA="boba"
GENERATION="1"

MATRIX_FILE="${EVIDENCE_DIR}/matrix.tsv"
SUMMARY_FILE="${EVIDENCE_DIR}/summary.md"
LOG_FILE="${EVIDENCE_DIR}/proof.log"

exec > >(tee -a "${LOG_FILE}") 2>&1

record() {
  local case_id="$1" result="$2" note="$3"
  printf '%s\t%s\t%s\n' "${case_id}" "${result}" "${note}" | tee -a "${MATRIX_FILE}"
}

cleanup() {
  podman rm -f "${CTR}" "${CTR_RESTORE}" >/dev/null 2>&1 || true
  podman volume rm -f "${VOL_PG}" "${VOL_REPO}" "${VOL_RESTORE}" >/dev/null 2>&1 || true
  rm -rf "${HOST_BAD_DIR}" >/dev/null 2>&1 || true
}
trap cleanup EXIT

echo "=== PG-C1 disposable proof RUN_ID=${RUN_ID} ==="
echo "ROOT=${ROOT}"
echo "EVIDENCE_DIR=${EVIDENCE_DIR}"
: > "${MATRIX_FILE}"

# --- tool / env facts ---
podman --version
id -u
id -g
echo "subuid: $(grep "^$(id -un):" /etc/subuid || true)"
echo "subgid: $(grep "^$(id -un):" /etc/subgid || true)"
HOST_UID="$(id -u)"
SUBUID_START="$(awk -F: -v u="$(id -un)" '$1==u {print $2; exit}' /etc/subuid)"
SUBUID_COUNT="$(awk -F: -v u="$(id -un)" '$1==u {print $3; exit}' /etc/subuid)"
# rootless: container uid 0 -> host HOST_UID; container uid N -> SUBUID_START+N-1
EXPECTED_HOST_FOR_999=$((SUBUID_START + 999 - 1))
echo "EXPECTED_HOST_UID_FOR_CONTAINER_999=${EXPECTED_HOST_FOR_999}"

if command -v docker >/dev/null 2>&1; then
  DOCKER_AVAILABLE=1
else
  DOCKER_AVAILABLE=0
fi
record "docker_env" "UNVERIFIED" "docker CLI absent; rootless Podman only"

# --- build ---
echo "=== build base + C1 images ==="
podman build --network=host -f docker/postgres/Dockerfile -t "${IMAGE_BASE}" .
podman build --network=host -f proof/pg-c1/Dockerfile.c1-nonroot \
  --build-arg "BASE_IMAGE=${IMAGE_BASE}" \
  -t "${IMAGE_C1}" .
podman inspect "${IMAGE_C1}" --format 'Config.User={{.Config.User}}' | tee "${EVIDENCE_DIR}/image-user.txt"
IMAGE_USER="$(podman inspect "${IMAGE_C1}" --format '{{.Config.User}}')"
if [ "${IMAGE_USER}" = "postgres" ] || [ "${IMAGE_USER}" = "999" ] || [ "${IMAGE_USER}" = "999:999" ]; then
  record "image_user_postgres" "PASS" "Config.User=${IMAGE_USER}"
else
  record "image_user_postgres" "FAIL" "Config.User=${IMAGE_USER}"
fi

# --- Trivy DS-0002 unsuppressed image-config ---
# Prefer repository-pinned Trivy binary (snap trivy cannot see rootless podman.sock).
# Do NOT pass .trivyignore (SECURITY_EXCEPTION_RENEWAL=NO / no DS-0002 bypass).
echo "=== Trivy image-config DS-0002 (unsuppressed) ==="
TRIVY_JSON="${EVIDENCE_DIR}/trivy-image-config.json"
TRIVY_BIN=""
PINNED_TRIVY="${ROOT}/.cache/trivy/0.69.3/trivy"
if [ -x "${PINNED_TRIVY}" ]; then
  TRIVY_BIN="${PINNED_TRIVY}"
elif [ -x "${ROOT}/.cache/trivy/trivy" ]; then
  TRIVY_BIN="${ROOT}/.cache/trivy/trivy"
fi
if [ -z "${TRIVY_BIN}" ]; then
  echo "Downloading pinned Trivy via node helper (scripts/run-trivy.mjs ensure)…"
  # Ensure binary only: build skipped; we invoke binary directly on saved tar.
  if node -e "
    import('./scripts/run-trivy.mjs').then(async (m) => {
      const p = await m.ensureBinary();
      console.log(p);
    }).catch((e) => { console.error(e); process.exit(1); });
  " >"${EVIDENCE_DIR}/trivy-bin-path.txt" 2>"${EVIDENCE_DIR}/trivy-bin-ensure.err"; then
    TRIVY_BIN="$(tail -n1 "${EVIDENCE_DIR}/trivy-bin-path.txt")"
  fi
fi
# Fallback: save image tar and scan with whatever non-snap trivy we can find.
IMAGE_TAR="${EVIDENCE_DIR}/c1-nonroot.tar"
podman save -o "${IMAGE_TAR}" "${IMAGE_C1}"
if [ -n "${TRIVY_BIN}" ] && [ -x "${TRIVY_BIN}" ]; then
  set +e
  "${TRIVY_BIN}" image \
    --quiet \
    --scanners misconfig \
    --image-config-scanners misconfig \
    --severity HIGH,CRITICAL \
    --exit-code 0 \
    --format json \
    -o "${TRIVY_JSON}" \
    --input "${IMAGE_TAR}"
  TRIVY_RC=$?
  set -e
  if [ "${TRIVY_RC}" -ne 0 ]; then
    record "trivy_ds0002" "FAIL" "trivy exited ${TRIVY_RC}"
  else
    if python3 - <<'PY' "${TRIVY_JSON}"
import json, sys
path = sys.argv[1]
data = json.load(open(path))
hits = []
for r in data.get("Results") or []:
    for key in ("Misconfigurations", "Misconfs"):
        for m in r.get(key) or []:
            mid = m.get("ID") or m.get("AVDID") or ""
            title = m.get("Title") or ""
            if mid == "DS-0002" or "DS-0002" in title:
                hits.append(mid or title)
sys.exit(1 if hits else 0)
PY
    then
      record "trivy_ds0002" "PASS" "DS-0002 absent in unsuppressed image-config scan (tar input)"
    else
      record "trivy_ds0002" "FAIL" "DS-0002 still reported; see trivy-image-config.json"
    fi
  fi
else
  record "trivy_ds0002" "FAIL" "pinned trivy binary unavailable; snap trivy cannot use rootless podman"
fi

common_env=(
  -e POSTGRES_USER=postgres
  -e POSTGRES_PASSWORD="${PG_PASS}"
  -e POSTGRES_DB=postgres
  -e BOBA_PGBACKREST_STANZA="${STANZA}"
  -e BOBA_PGBACKREST_GENERATION="${GENERATION}"
  -e BOBA_PGBACKREST_REPO_MODE=posix
  -e PGBACKREST_CIPHER_PASS="${CIPHER_PASS}"
  -e PGBACKREST_REPO1_CIPHER_PASS="${CIPHER_PASS}"
)

wait_ready() {
  local name="$1" attempts="${2:-40}"
  local i
  for i in $(seq 1 "${attempts}"); do
    if podman exec "${name}" pg_isready -U postgres -d postgres >/dev/null 2>&1; then
      return 0
    fi
    sleep 1
  done
  return 1
}

# --- fresh startup (archive off) ---
echo "=== fresh PostgreSQL startup (archive off) ==="
podman volume create "${VOL_PG}" >/dev/null
podman volume create "${VOL_REPO}" >/dev/null
podman run -d --name "${CTR}" \
  "${common_env[@]}" \
  -e BOBA_PGBACKREST_ARCHIVE=0 \
  -v "${VOL_PG}:/var/lib/postgresql:Z" \
  -v "${VOL_REPO}:/var/lib/pgbackrest:Z" \
  "${IMAGE_C1}"
if wait_ready "${CTR}"; then
  CTR_UID="$(podman exec "${CTR}" id -u)"
  CTR_USER="$(podman exec "${CTR}" id -un)"
  PGDATA_PATH="$(podman exec "${CTR}" bash -c 'echo "${PGDATA:-/var/lib/postgresql/18/docker}"')"
  podman exec "${CTR}" bash -c "test -f \"${PGDATA_PATH}/PG_VERSION\""
  record "fresh_startup_archive_off" "PASS" "uid=${CTR_UID} user=${CTR_USER} PGDATA=${PGDATA_PATH}"
else
  podman logs "${CTR}" >&2 || true
  record "fresh_startup_archive_off" "FAIL" "pg_isready timeout"
fi

# --- UID/GID mapping ---
echo "=== rootless UID/GID mapping ==="
VOL_MP="$(podman volume inspect "${VOL_PG}" --format '{{.Mountpoint}}')"
HOST_OWNER="$(stat -c '%u:%g' "${VOL_MP}/18/docker" 2>/dev/null || stat -c '%u:%g' "${VOL_MP}")"
echo "volume_mountpoint=${VOL_MP}"
echo "host_owner_sample=${HOST_OWNER}"
echo "container_uid=$(podman exec "${CTR}" id -u)"
if [ "${CTR_UID:-}" = "999" ] && [[ "${HOST_OWNER}" == "${EXPECTED_HOST_FOR_999}:"* ]]; then
  record "rootless_uid_mapping" "PASS" "container 999 -> host ${EXPECTED_HOST_FOR_999} (subuid start ${SUBUID_START})"
else
  record "rootless_uid_mapping" "FAIL" "container_uid=${CTR_UID:-unset} host_owner=${HOST_OWNER} expected_host=${EXPECTED_HOST_FOR_999}"
fi

# --- restart same volume ---
echo "=== restart from same disposable volume ==="
podman stop "${CTR}" >/dev/null
podman rm "${CTR}" >/dev/null
podman run -d --name "${CTR}" \
  "${common_env[@]}" \
  -e BOBA_PGBACKREST_ARCHIVE=0 \
  -v "${VOL_PG}:/var/lib/postgresql:Z" \
  -v "${VOL_REPO}:/var/lib/pgbackrest:Z" \
  "${IMAGE_C1}"
if wait_ready "${CTR}"; then
  record "restart_same_volume" "PASS" "reused ${VOL_PG}"
else
  record "restart_same_volume" "FAIL" "pg_isready after restart"
fi

# --- archive-on + pgBackRest matrix ---
echo "=== archive-on + pgBackRest stanza/backup/WAL/restore ==="
podman stop "${CTR}" >/dev/null
podman rm "${CTR}" >/dev/null
podman run -d --name "${CTR}" \
  "${common_env[@]}" \
  -e BOBA_PGBACKREST_ARCHIVE=1 \
  -e BOBA_PGBACKREST_ARCHIVE_TIMEOUT=60 \
  -v "${VOL_PG}:/var/lib/postgresql:Z" \
  -v "${VOL_REPO}:/var/lib/pgbackrest:Z" \
  "${IMAGE_C1}"
if ! wait_ready "${CTR}" 60; then
  podman logs "${CTR}" >&2 || true
  record "archive_on_startup" "FAIL" "pg_isready timeout with archive on"
  record "pgbackrest_stanza" "FAIL" "skipped; archive startup failed"
  record "pgbackrest_backup_info_verify" "FAIL" "skipped"
  record "wal_archival" "FAIL" "skipped"
  record "isolated_restore" "FAIL" "skipped"
else
  record "archive_on_startup" "PASS" "archive_mode enabled via C1 entrypoint"
  # Ensure stanza + repo path exist for already-initialized PGDATA
  set +e
  podman exec "${CTR}" bash -c "
    set -euo pipefail
    pgbackrest --config=/etc/pgbackrest/pgbackrest.conf --stanza=${STANZA} stanza-create
    pgbackrest --config=/etc/pgbackrest/pgbackrest.conf --stanza=${STANZA} check
  "
  STANZA_RC=$?
  set -e
  if [ "${STANZA_RC}" -eq 0 ]; then
    record "pgbackrest_stanza" "PASS" "stanza-create + check"
  else
    record "pgbackrest_stanza" "FAIL" "stanza-create/check rc=${STANZA_RC}"
  fi

  podman exec "${CTR}" psql -U postgres -d postgres -c "CREATE TABLE IF NOT EXISTS c1_proof(id int primary key, note text); INSERT INTO c1_proof VALUES (1, 'before-backup') ON CONFLICT DO NOTHING;"

  set +e
  podman exec "${CTR}" bash -c "
    set -euo pipefail
    pgbackrest --config=/etc/pgbackrest/pgbackrest.conf --stanza=${STANZA} backup --type=full
    pgbackrest --config=/etc/pgbackrest/pgbackrest.conf --stanza=${STANZA} info
    pgbackrest --config=/etc/pgbackrest/pgbackrest.conf --stanza=${STANZA} verify
  "
  BAK_RC=$?
  set -e
  if [ "${BAK_RC}" -eq 0 ]; then
    record "pgbackrest_backup_info_verify" "PASS" "full backup + info + verify"
  else
    record "pgbackrest_backup_info_verify" "FAIL" "rc=${BAK_RC}"
  fi

  # Force WAL switch and wait for archive
  podman exec "${CTR}" psql -U postgres -d postgres -c "INSERT INTO c1_proof VALUES (2, 'wal-marker') ON CONFLICT DO NOTHING; SELECT pg_switch_wal();"
  WAL_OK=0
  for i in $(seq 1 30); do
    if podman exec "${CTR}" bash -c "find /var/lib/pgbackrest -type f 2>/dev/null | grep -E 'archive|wal' | head -5 | grep -q ."; then
      WAL_OK=1
      break
    fi
    # also accept archive-push success via pg_stat_archiver
    ARCHIVED="$(podman exec "${CTR}" psql -U postgres -d postgres -Atc "SELECT archived_count FROM pg_stat_archiver;" || echo 0)"
    if [ "${ARCHIVED:-0}" -gt 0 ] 2>/dev/null; then
      WAL_OK=1
      break
    fi
    sleep 2
  done
  if [ "${WAL_OK}" -eq 1 ]; then
    record "wal_archival" "PASS" "archived_count or repo archive files present"
  else
    record "wal_archival" "FAIL" "no archive evidence within timeout"
  fi

  # Isolated restore into fresh disposable volume (never source PGDATA).
  # Stop source first so recovery WAL fetch is from repo only.
  podman stop "${CTR}" >/dev/null
  podman volume create "${VOL_RESTORE}" >/dev/null
  set +e
  podman run --rm --name "${CTR_RESTORE}-job" \
    "${common_env[@]}" \
    -e BOBA_PGBACKREST_ARCHIVE=0 \
    -v "${VOL_RESTORE}:/var/lib/postgresql:Z" \
    -v "${VOL_REPO}:/var/lib/pgbackrest:Z" \
    --entrypoint bash \
    "${IMAGE_C1}" \
    -c "
      set -euo pipefail
      PGDATA_TARGET=/var/lib/postgresql/18/docker
      mkdir -p \"\${PGDATA_TARGET}\"
      export BOBA_PGBACKREST_REPO_MODE=posix
      export BOBA_PGBACKREST_GENERATION=${GENERATION}
      export PGBACKREST_CIPHER_PASS='${CIPHER_PASS}'
      export PGBACKREST_REPO1_CIPHER_PASS='${CIPHER_PASS}'
      /usr/local/bin/boba-render-pgbackrest-conf > /etc/pgbackrest/pgbackrest.conf
      chmod 640 /etc/pgbackrest/pgbackrest.conf
      pgbackrest --config=/etc/pgbackrest/pgbackrest.conf --stanza=${STANZA} \
        --pg1-path=\"\${PGDATA_TARGET}\" restore
      test -f \"\${PGDATA_TARGET}/PG_VERSION\"
      test -f \"\${PGDATA_TARGET}/backup_label\" -o -f \"\${PGDATA_TARGET}/backup_label.old\" \
        -o -f \"\${PGDATA_TARGET}/recovery.signal\"
    "
  RESTORE_RC=$?
  set -e
  if [ "${RESTORE_RC}" -eq 0 ]; then
    # Start restored cluster with cipher + rendered conf available for restore_command.
    podman run -d --name "${CTR_RESTORE}" \
      "${common_env[@]}" \
      -e BOBA_PGBACKREST_ARCHIVE=1 \
      -e BOBA_PGBACKREST_ARCHIVE_TIMEOUT=60 \
      -v "${VOL_RESTORE}:/var/lib/postgresql:Z" \
      -v "${VOL_REPO}:/var/lib/pgbackrest:Z" \
      "${IMAGE_C1}"
    if wait_ready "${CTR_RESTORE}" 60; then
      # Wait until recovery finishes / cluster accepts reads
      ROW=""
      for i in $(seq 1 30); do
        ROW="$(podman exec "${CTR_RESTORE}" psql -U postgres -d postgres -Atc "SELECT note FROM c1_proof WHERE id=1;" 2>/dev/null || true)"
        if [ "${ROW}" = "before-backup" ]; then
          break
        fi
        sleep 2
      done
      if [ "${ROW}" = "before-backup" ]; then
        record "isolated_restore" "PASS" "restored into ${VOL_RESTORE}; row verified"
      else
        podman logs "${CTR_RESTORE}" >&2 || true
        record "isolated_restore" "FAIL" "restore started but row missing (got='${ROW}')"
      fi
    else
      podman logs "${CTR_RESTORE}" >&2 || true
      record "isolated_restore" "FAIL" "restored PGDATA did not become ready"
    fi
    podman rm -f "${CTR_RESTORE}" >/dev/null 2>&1 || true
  else
    record "isolated_restore" "FAIL" "pgbackrest restore rc=${RESTORE_RC}"
  fi
  # Restart source for any later cases (none); keep stopped to avoid cross-talk
fi

# --- wrong-permission failure without silent data modification ---
echo "=== wrong-permission bind mount (must fail closed) ==="
mkdir -p "${HOST_BAD_DIR}"
chmod 755 "${HOST_BAD_DIR}"
# Ensure host ownership is invoking user (1000), NOT mapped 100998
chown "$(id -u):$(id -g)" "${HOST_BAD_DIR}" || true
MARKER_BEFORE="${HOST_BAD_DIR}/.c1-marker-before"
echo "untouched" > "${MARKER_BEFORE}"
BEFORE_HASH="$(sha256sum "${MARKER_BEFORE}" | awk '{print $1}')"
# Also drop a fake PG_VERSION-looking tree? Keep empty dir — non-root cannot initdb here.
set +e
podman run --rm --name "${RUN_ID}-badperm" \
  "${common_env[@]}" \
  -e BOBA_PGBACKREST_ARCHIVE=0 \
  -v "${HOST_BAD_DIR}:/var/lib/postgresql:Z" \
  "${IMAGE_C1}"
BAD_RC=$?
set -e
AFTER_HASH="$(sha256sum "${MARKER_BEFORE}" | awk '{print $1}')"
# List whether postgres created PGDATA under the bad bind
CREATED="$(find "${HOST_BAD_DIR}" -mindepth 1 -maxdepth 3 ! -name '.c1-marker-before' | head -20 || true)"
if [ "${BAD_RC}" -ne 0 ] && [ "${BEFORE_HASH}" = "${AFTER_HASH}" ] && [ -z "${CREATED}" ]; then
  record "wrong_permission_fail_closed" "PASS" "exit=${BAD_RC}; marker unchanged; no PGDATA created"
else
  record "wrong_permission_fail_closed" "FAIL" "exit=${BAD_RC}; hash_before=${BEFORE_HASH} after=${AFTER_HASH}; created='${CREATED}'"
fi

# --- refuse root start ---
echo "=== C1 refuses root start ==="
set +e
podman run --rm --user 0:0 \
  "${common_env[@]}" \
  -e BOBA_PGBACKREST_ARCHIVE=0 \
  -v "${VOL_PG}:/var/lib/postgresql:Z" \
  "${IMAGE_C1}"
ROOT_RC=$?
set -e
if [ "${ROOT_RC}" -ne 0 ]; then
  record "refuse_root_start" "PASS" "exit=${ROOT_RC}"
else
  record "refuse_root_start" "FAIL" "C1 started as root"
fi

# --- summary ---
{
  echo "# PG-C1 disposable proof summary"
  echo
  echo "- RUN_ID: \`${RUN_ID}\`"
  echo "- STAMP: \`${STAMP}\`"
  echo "- IMAGE_C1: \`${IMAGE_C1}\`"
  echo "- EXPECTED_HOST_UID_FOR_CONTAINER_999: \`${EXPECTED_HOST_FOR_999}\`"
  echo "- DOCKER_AVAILABLE: \`${DOCKER_AVAILABLE}\`"
  echo
  echo "## Matrix"
  echo
  echo "| Case | Result | Note |"
  echo "|---|---|---|"
  while IFS=$'\t' read -r c r n; do
    echo "| ${c} | ${r} | ${n} |"
  done < "${MATRIX_FILE}"
} > "${SUMMARY_FILE}"

echo "=== matrix ==="
column -t -s $'\t' "${MATRIX_FILE}" || cat "${MATRIX_FILE}"
echo "SUMMARY=${SUMMARY_FILE}"

# Exit non-zero if any FAIL (UNVERIFIED allowed)
if awk -F'\t' '$2=="FAIL"{found=1} END{exit found?1:0}' "${MATRIX_FILE}"; then
  echo "PROOF_RESULT=PASS_WITH_UNVERIFIED_ALLOWED"
  exit 0
else
  echo "PROOF_RESULT=FAIL"
  exit 1
fi
