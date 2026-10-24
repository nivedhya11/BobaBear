#!/usr/bin/env bash
# PG-C1 disposable engineering proof — rootless Podman only.
#
# Creates uniquely named run-owned volumes/containers. Never touches
# boba-staging, production, postgres-data, or other shared volumes.
# SECURITY_EXCEPTION_RENEWAL=NO; TRIVY_OR_SCA_BYPASS=NO; no blanket :U.
#
# WAL recovery closure (PG-C1-WAL-RECOVERY-CLOSURE-R2): the proof commits a
# distinct post-backup marker, resolves the exact WAL segment holding that
# commit, forces a WAL switch, verifies THAT segment file in the pgBackRest
# repository, restores into a run-owned disposable target and proves the
# marker is present there. A negative case interrupts archiving and shows the
# same verification cannot produce PASS and a restore lacks the marker.
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
CTR_RESTORE_NEG="${RUN_ID}-restore-neg"
VOL_PG="${RUN_ID}-pgdata"
VOL_REPO="${RUN_ID}-pgbackrest"
VOL_RESTORE="${RUN_ID}-restore-pgdata"
VOL_RESTORE_NEG="${RUN_ID}-restore-neg-pgdata"
HOST_BAD_DIR="${EVIDENCE_DIR}/bad-bind-pgdata"

# Recovery targets: render pgBackRest config INTO the target volume so
# restore_command keeps working after the one-shot restore job exits, and the
# target can start with archive_mode OFF (a recovery target must never push
# its new timeline into the source repository).
RESTORE_CONF_IN_VOL="/var/lib/postgresql/boba-pgbackrest-restore.conf"
TARGET_OWNER_MARKER="/var/lib/postgresql/.boba-recovery-target-owner"
PGDATA_IN_VOL="/var/lib/postgresql/18/docker"

# Disposable, run-local secrets. Random (not STAMP-derived) so committed
# evidence cannot be used to reconstruct them; never echoed into logs.
rand_token() { head -c 48 /dev/urandom | base64 | tr -dc 'A-Za-z0-9' | head -c 32; }
CIPHER_PASS="c1-proof-cipher-$(rand_token)"
PG_PASS="c1-proof-pg-$(rand_token)"
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
  podman rm -f "${CTR}" "${CTR_RESTORE}" "${CTR_RESTORE_NEG}" >/dev/null 2>&1 || true
  podman volume rm -f "${VOL_PG}" "${VOL_REPO}" "${VOL_RESTORE}" "${VOL_RESTORE_NEG}" >/dev/null 2>&1 || true
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
    # Slim, committable extract (full JSON stays local under artifacts/).
    python3 - "${TRIVY_JSON}" "${EVIDENCE_DIR}/trivy-ds0002-extract.json" <<'PY' || true
import json, sys
src, dst = sys.argv[1], sys.argv[2]
data = json.load(open(src))
hits, targets = [], []
for r in data.get("Results") or []:
    mis = (r.get("Misconfigurations") or r.get("Misconfs") or [])
    targets.append({"Target": r.get("Target"), "Class": r.get("Class"), "Type": r.get("Type"), "MisconfCount": len(mis)})
    for m in mis:
        mid = m.get("ID") or m.get("AVDID") or ""
        if mid == "DS-0002" or "DS-0002" in (m.get("Title") or ""):
            hits.append(mid or m.get("Title"))
json.dump({"ds0002_hits": hits, "ds0002_absent": not hits, "result_targets": targets}, open(dst, "w"), indent=2)
PY
  fi
else
  record "trivy_ds0002" "FAIL" "pinned trivy binary unavailable; snap trivy cannot use rootless podman"
fi
rm -f "${IMAGE_TAR}"

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

psql_at() {
  # psql_at <container> <sql>  — single statement, autocommit, tuples only.
  podman exec "$1" psql -U postgres -d postgres -v ON_ERROR_STOP=1 -Atc "$2"
}

PGBR="pgbackrest --config=/etc/pgbackrest/pgbackrest.conf --stanza=${STANZA}"
REPO_ARCHIVE_DIR="/var/lib/pgbackrest/repo-gen-${GENERATION}/archive/${STANZA}"

# Specific-segment archive verification. The historical check (archived_count > 0
# or "any archive file exists") is insufficient: the repository already contains
# pre-backup segments, so it passes even when the post-backup segment never
# reaches the repository. This function PASSes only when the exact segment file
# <SEG>-<checksum>* exists under the stanza archive path AND pg_stat_archiver
# reports last_archived_wal >= SEG. Prints the repository path on success.
verify_segment_archived() {
  local ctr="$1" seg="$2" timeout_s="$3"
  local i repo_hit last_ok
  for i in $(seq 1 "${timeout_s}"); do
    repo_hit="$(podman exec "${ctr}" bash -c "find '${REPO_ARCHIVE_DIR}' -type f -name '${seg}-*' 2>/dev/null | head -n1" || true)"
    last_ok="$(psql_at "${ctr}" "SELECT coalesce(last_archived_wal,'') FROM pg_stat_archiver;" 2>/dev/null || true)"
    if [ -n "${repo_hit}" ] && [ -n "${last_ok}" ] && [[ ! "${last_ok}" < "${seg}" ]]; then
      echo "${repo_hit}"
      return 0
    fi
    sleep 1
  done
  return 1
}

archiver_stats() {
  psql_at "$1" "SELECT archived_count||' '||coalesce(last_archived_wal,'-')||' '||failed_count||' '||coalesce(last_failed_wal,'-') FROM pg_stat_archiver;" 2>/dev/null || echo "unavailable"
}

# Provision a uniquely owned disposable recovery target volume (never the
# source PGDATA), stamping an ownership marker that the restore job must find.
provision_target() {
  local vol="$1"
  podman volume create "${vol}" >/dev/null
  podman run --rm \
    -v "${vol}:/var/lib/postgresql:Z" \
    --entrypoint bash "${IMAGE_C1}" \
    -c "set -eu; test ! -e '${PGDATA_IN_VOL}/PG_VERSION'; printf '%s\n' '${RUN_ID}' > '${TARGET_OWNER_MARKER}'"
}

# Restore latest backup into an owned target volume; recovery plays WAL from the
# repository via archive-get (restore_command generated by pgBackRest).
restore_into_target() {
  local vol="$1" job_name="$2"
  podman run --rm --name "${job_name}" \
    "${common_env[@]}" \
    -e BOBA_PGBACKREST_ARCHIVE=0 \
    -v "${vol}:/var/lib/postgresql:Z" \
    -v "${VOL_REPO}:/var/lib/pgbackrest:Z" \
    --entrypoint bash \
    "${IMAGE_C1}" \
    -c "
      set -euo pipefail
      test \"\$(cat '${TARGET_OWNER_MARKER}')\" = '${RUN_ID}' || { echo 'target not owned by this run' >&2; exit 97; }
      test ! -e '${PGDATA_IN_VOL}/PG_VERSION' || { echo 'target already initialized; refusing' >&2; exit 98; }
      mkdir -p '${PGDATA_IN_VOL}'
      export BOBA_PGBACKREST_REPO_MODE=posix
      export BOBA_PGBACKREST_GENERATION=${GENERATION}
      export PGDATA='${PGDATA_IN_VOL}'
      umask 077
      /usr/local/bin/boba-render-pgbackrest-conf > '${RESTORE_CONF_IN_VOL}'
      chmod 600 '${RESTORE_CONF_IN_VOL}'
      pgbackrest --config='${RESTORE_CONF_IN_VOL}' --stanza=${STANZA} \
        --pg1-path='${PGDATA_IN_VOL}' --log-level-console=info restore
      test -f '${PGDATA_IN_VOL}/PG_VERSION'
      test -f '${PGDATA_IN_VOL}/recovery.signal'
      echo '--- postgresql.auto.conf (generated restore_command) ---'
      grep -E 'restore_command|recovery_target' '${PGDATA_IN_VOL}/postgresql.auto.conf' || true
    "
}

# Start a restored target with archive_mode OFF and wait until recovery
# finishes (pg_is_in_recovery() = false). PGBACKREST_CONFIG env guarantees
# archive-get finds the rendered config even if restore_command omits --config.
start_target_and_wait_promoted() {
  local vol="$1" ctr="$2"
  podman run -d --name "${ctr}" \
    "${common_env[@]}" \
    -e BOBA_PGBACKREST_ARCHIVE=0 \
    -e PGBACKREST_CONFIG="${RESTORE_CONF_IN_VOL}" \
    -v "${vol}:/var/lib/postgresql:Z" \
    -v "${VOL_REPO}:/var/lib/pgbackrest:Z" \
    "${IMAGE_C1}" >/dev/null
  wait_ready "${ctr}" 60 || return 1
  local i inrec
  for i in $(seq 1 60); do
    inrec="$(psql_at "${ctr}" "SELECT pg_is_in_recovery();" 2>/dev/null || echo "?")"
    if [ "${inrec}" = "f" ]; then
      return 0
    fi
    sleep 1
  done
  return 1
}

target_recovery_facts() {
  # Prints: replay_lsn timeline archive_mode
  local ctr="$1"
  psql_at "${ctr}" "SELECT coalesce(pg_last_wal_replay_lsn()::text,'-')||' '||(SELECT timeline_id FROM pg_control_checkpoint())||' '||current_setting('archive_mode');" 2>/dev/null || echo "- - -"
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
  record "post_backup_marker_committed" "FAIL" "skipped"
  record "wal_marker_segment_archived" "FAIL" "skipped"
  record "isolated_restore_recovery_complete" "FAIL" "skipped"
  record "restored_post_backup_marker" "FAIL" "skipped"
  record "negative_interrupted_archive_detected" "FAIL" "skipped"
  record "legacy_archive_count_check_insufficient" "FAIL" "skipped"
  record "negative_restore_lacks_unarchived_marker" "FAIL" "skipped"
else
  record "archive_on_startup" "PASS" "archive_mode enabled via C1 entrypoint"
  # Ensure stanza + repo path exist for already-initialized PGDATA
  set +e
  podman exec "${CTR}" bash -c "
    set -euo pipefail
    ${PGBR} stanza-create
    ${PGBR} check
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
    ${PGBR} backup --type=full
    ${PGBR} info
    ${PGBR} verify
  "
  BAK_RC=$?
  set -e
  if [ "${BAK_RC}" -eq 0 ]; then
    record "pgbackrest_backup_info_verify" "PASS" "full backup + info + verify"
  else
    record "pgbackrest_backup_info_verify" "FAIL" "rc=${BAK_RC}"
  fi

  # ------------------------------------------------------------------
  # POST-BACKUP WAL PROOF (positive). The marker is committed AFTER the full
  # backup, so it can only reach a recovery target through archived WAL.
  # ------------------------------------------------------------------
  echo "=== post-backup marker -> specific WAL segment -> archive verification ==="
  MARKER_VALUE="post-backup-marker-${RUN_ID}"
  LSN_BEFORE="$(psql_at "${CTR}" "SELECT pg_current_wal_insert_lsn();")"
  SEG_BEFORE="$(psql_at "${CTR}" "SELECT pg_walfile_name('${LSN_BEFORE}'::pg_lsn);")"
  # Separate autocommit statement: the commit record is durably written before
  # psql returns, so the LSN captured next is >= the end of that commit record.
  psql_at "${CTR}" "INSERT INTO c1_proof VALUES (2, '${MARKER_VALUE}');" >/dev/null
  MARKER_LSN="$(psql_at "${CTR}" "SELECT pg_current_wal_lsn();")"
  MARKER_SEG="$(psql_at "${CTR}" "SELECT pg_walfile_name('${MARKER_LSN}'::pg_lsn);")"
  echo "marker_value=${MARKER_VALUE}"
  echo "lsn_before_insert=${LSN_BEFORE} (segment ${SEG_BEFORE})"
  echo "lsn_after_commit=${MARKER_LSN} (segment ${MARKER_SEG})"
  if [ -n "${MARKER_SEG}" ] && [[ "${MARKER_SEG}" =~ ^[0-9A-F]{24}$ ]]; then
    record "post_backup_marker_committed" "PASS" "lsn=${MARKER_LSN} segment=${MARKER_SEG} (insert began in ${SEG_BEFORE})"
  else
    record "post_backup_marker_committed" "FAIL" "could not resolve WAL segment for marker (lsn='${MARKER_LSN}')"
  fi

  SWITCH_LSN="$(psql_at "${CTR}" "SELECT pg_switch_wal();")"
  SWITCH_SEG="$(psql_at "${CTR}" "SELECT pg_walfile_name('${SWITCH_LSN}'::pg_lsn);")"
  echo "pg_switch_wal=${SWITCH_LSN} (completed segment ${SWITCH_SEG})"

  WAL_SEGMENTS_REQUIRED="${MARKER_SEG}"
  if [ "${SEG_BEFORE}" != "${MARKER_SEG}" ]; then
    WAL_SEGMENTS_REQUIRED="${SEG_BEFORE} ${MARKER_SEG}"
  fi
  WAL_OK=1
  WAL_NOTE=""
  for seg in ${WAL_SEGMENTS_REQUIRED}; do
    if hit="$(verify_segment_archived "${CTR}" "${seg}" 90)"; then
      WAL_NOTE="${WAL_NOTE}${seg} -> ${hit#"${REPO_ARCHIVE_DIR}/"}; "
    else
      WAL_OK=0
      WAL_NOTE="${WAL_NOTE}${seg} NOT archived within 90s; "
    fi
  done
  echo "pg_stat_archiver (archived_count last_archived failed_count last_failed): $(archiver_stats "${CTR}")"
  podman exec "${CTR}" bash -c "${PGBR} info" || true
  if [ "${WAL_OK}" -eq 1 ]; then
    record "wal_marker_segment_archived" "PASS" "${WAL_NOTE%; }"
  else
    record "wal_marker_segment_archived" "FAIL" "${WAL_NOTE%; }"
  fi

  # ------------------------------------------------------------------
  # Isolated restore into a uniquely owned disposable recovery target.
  # Source is stopped first so WAL can only come from the repository.
  # ------------------------------------------------------------------
  echo "=== isolated restore into owned recovery target ${VOL_RESTORE} ==="
  podman stop "${CTR}" >/dev/null
  provision_target "${VOL_RESTORE}"
  set +e
  restore_into_target "${VOL_RESTORE}" "${CTR_RESTORE}-job"
  RESTORE_RC=$?
  set -e
  if [ "${RESTORE_RC}" -ne 0 ]; then
    record "isolated_restore_recovery_complete" "FAIL" "pgbackrest restore rc=${RESTORE_RC}"
    record "restored_post_backup_marker" "FAIL" "skipped; restore failed"
  elif ! start_target_and_wait_promoted "${VOL_RESTORE}" "${CTR_RESTORE}"; then
    podman logs "${CTR_RESTORE}" >&2 || true
    record "isolated_restore_recovery_complete" "FAIL" "restored target did not finish recovery"
    record "restored_post_backup_marker" "FAIL" "skipped; recovery incomplete"
  else
    read -r REPLAY_LSN TARGET_TL TARGET_ARCHIVE_MODE <<<"$(target_recovery_facts "${CTR_RESTORE}")"
    podman logs "${CTR_RESTORE}" > "${EVIDENCE_DIR}/restore-target.log" 2>&1 || true
    RESTORED_SEG_LINE="$(grep -E "restored log file \"${MARKER_SEG}\" from archive" "${EVIDENCE_DIR}/restore-target.log" | head -n1 || true)"
    grep -E 'restored log file|consistent recovery state|archive recovery complete|selected new timeline|database system is ready' \
      "${EVIDENCE_DIR}/restore-target.log" || true
    REPLAY_GE_MARKER="$(psql_at "${CTR_RESTORE}" "SELECT ('${REPLAY_LSN}'::pg_lsn >= '${MARKER_LSN}'::pg_lsn);" 2>/dev/null || echo "?")"
    if [ "${TARGET_ARCHIVE_MODE}" = "off" ] && [ "${REPLAY_GE_MARKER}" = "t" ] && [ -n "${RESTORED_SEG_LINE}" ]; then
      record "isolated_restore_recovery_complete" "PASS" "target=${VOL_RESTORE}; replay_lsn=${REPLAY_LSN} >= marker_lsn=${MARKER_LSN}; timeline=${TARGET_TL}; archive_mode=off; '${MARKER_SEG}' fetched from archive"
    else
      record "isolated_restore_recovery_complete" "FAIL" "replay_lsn=${REPLAY_LSN} marker_lsn=${MARKER_LSN} replay>=marker=${REPLAY_GE_MARKER} timeline=${TARGET_TL} archive_mode=${TARGET_ARCHIVE_MODE} segment_fetch_log=${RESTORED_SEG_LINE:-none}"
    fi
    ROW1="$(psql_at "${CTR_RESTORE}" "SELECT note FROM c1_proof WHERE id=1;" 2>/dev/null || true)"
    ROW2="$(psql_at "${CTR_RESTORE}" "SELECT note FROM c1_proof WHERE id=2;" 2>/dev/null || true)"
    if [ "${ROW1}" = "before-backup" ] && [ "${ROW2}" = "${MARKER_VALUE}" ]; then
      record "restored_post_backup_marker" "PASS" "pre-backup row present AND post-backup marker '${MARKER_VALUE}' present in restored target"
    else
      record "restored_post_backup_marker" "FAIL" "id1='${ROW1}' id2='${ROW2}' expected id2='${MARKER_VALUE}'"
    fi
    podman rm -f "${CTR_RESTORE}" >/dev/null 2>&1 || true
  fi

  # ------------------------------------------------------------------
  # NEGATIVE: interrupted post-backup archiving must NOT produce PASS.
  # Repository archive path is made unavailable (owner chmod 000; non-root
  # pgbackrest cannot bypass DAC), then a new marker is committed and WAL is
  # switched. The same verification function must FAIL, and a restore from
  # the repository must NOT contain the unarchived marker.
  # ------------------------------------------------------------------
  echo "=== NEGATIVE: interrupted post-backup archiving ==="
  podman start "${CTR}" >/dev/null
  if ! wait_ready "${CTR}" 60; then
    podman logs "${CTR}" >&2 || true
    record "negative_interrupted_archive_detected" "FAIL" "source did not restart for negative phase"
    record "legacy_archive_count_check_insufficient" "FAIL" "skipped"
    record "negative_restore_lacks_unarchived_marker" "FAIL" "skipped"
  else
    NEG_MARKER_VALUE="neg-unarchived-marker-${RUN_ID}"
    STATS_BEFORE_NEG="$(archiver_stats "${CTR}")"
    podman exec "${CTR}" bash -c "chmod 000 '${REPO_ARCHIVE_DIR}' && stat -c '%A %U %n' '${REPO_ARCHIVE_DIR}'"
    psql_at "${CTR}" "INSERT INTO c1_proof VALUES (3, '${NEG_MARKER_VALUE}');" >/dev/null
    NEG_LSN="$(psql_at "${CTR}" "SELECT pg_current_wal_lsn();")"
    NEG_SEG="$(psql_at "${CTR}" "SELECT pg_walfile_name('${NEG_LSN}'::pg_lsn);")"
    NEG_SWITCH_LSN="$(psql_at "${CTR}" "SELECT pg_switch_wal();")"
    echo "neg_marker_lsn=${NEG_LSN} segment=${NEG_SEG} switch=${NEG_SWITCH_LSN}"
    set +e
    NEG_HIT="$(verify_segment_archived "${CTR}" "${NEG_SEG}" 30)"
    NEG_VERIFY_RC=$?
    set -e
    STATS_AFTER_NEG="$(archiver_stats "${CTR}")"
    echo "pg_stat_archiver before negative: ${STATS_BEFORE_NEG}"
    echo "pg_stat_archiver after negative : ${STATS_AFTER_NEG}"
    read -r NEG_ARCHIVED_COUNT _ NEG_FAILED_COUNT NEG_LAST_FAILED <<<"${STATS_AFTER_NEG}"
    if [ "${NEG_VERIFY_RC}" -ne 0 ] && [ "${NEG_FAILED_COUNT:-0}" -gt 0 ] && [ "${NEG_LAST_FAILED}" = "${NEG_SEG}" ]; then
      record "negative_interrupted_archive_detected" "PASS" "verify_segment_archived(${NEG_SEG}) returned FAIL within 30s; failed_count=${NEG_FAILED_COUNT} last_failed_wal=${NEG_LAST_FAILED}"
    else
      record "negative_interrupted_archive_detected" "FAIL" "verify rc=${NEG_VERIFY_RC} hit='${NEG_HIT}' stats='${STATS_AFTER_NEG}' (a PASS here would be a false positive)"
    fi
    # Demonstrate why the historical check was insufficient: under this same
    # interrupted-archiving state, "archived_count > 0 OR any archive file
    # exists" is still true (pre-backup segments are archived) and would have
    # reported PASS. PASS below means the insufficiency is demonstrated.
    if [ "${NEG_ARCHIVED_COUNT:-0}" -gt 0 ] && [ "${NEG_VERIFY_RC}" -ne 0 ]; then
      record "legacy_archive_count_check_insufficient" "PASS" "archived_count=${NEG_ARCHIVED_COUNT} > 0 while ${NEG_SEG} is unarchived: legacy check would have been a false PASS"
    else
      record "legacy_archive_count_check_insufficient" "FAIL" "archived_count=${NEG_ARCHIVED_COUNT:-?} verify_rc=${NEG_VERIFY_RC}"
    fi

    # Stop source with the segment still unarchived, restore repo permissions
    # (owner-only chmod via a one-shot helper; no root, no chown), then restore
    # into a second owned target: the negative marker must be absent.
    podman stop "${CTR}" >/dev/null
    podman run --rm \
      -v "${VOL_REPO}:/var/lib/pgbackrest:Z" \
      --entrypoint bash "${IMAGE_C1}" \
      -c "chmod 750 '${REPO_ARCHIVE_DIR}' && find '${REPO_ARCHIVE_DIR}' -type f -name '${NEG_SEG}-*' | grep -q . && echo 'UNEXPECTED: negative segment present in repo' && exit 99 || echo 'negative segment absent from repository (expected)'"
    provision_target "${VOL_RESTORE_NEG}"
    set +e
    restore_into_target "${VOL_RESTORE_NEG}" "${CTR_RESTORE_NEG}-job"
    NEG_RESTORE_RC=$?
    set -e
    if [ "${NEG_RESTORE_RC}" -ne 0 ]; then
      record "negative_restore_lacks_unarchived_marker" "FAIL" "pgbackrest restore rc=${NEG_RESTORE_RC}"
    elif ! start_target_and_wait_promoted "${VOL_RESTORE_NEG}" "${CTR_RESTORE_NEG}"; then
      podman logs "${CTR_RESTORE_NEG}" >&2 || true
      record "negative_restore_lacks_unarchived_marker" "FAIL" "negative target did not finish recovery"
    else
      podman logs "${CTR_RESTORE_NEG}" > "${EVIDENCE_DIR}/restore-target-negative.log" 2>&1 || true
      grep -E 'restored log file|could not|archive recovery complete|selected new timeline' \
        "${EVIDENCE_DIR}/restore-target-negative.log" | head -n 12 || true
      read -r NEG_REPLAY_LSN NEG_TL _ <<<"$(target_recovery_facts "${CTR_RESTORE_NEG}")"
      NROW2="$(psql_at "${CTR_RESTORE_NEG}" "SELECT note FROM c1_proof WHERE id=2;" 2>/dev/null || true)"
      NROW3="$(psql_at "${CTR_RESTORE_NEG}" "SELECT coalesce((SELECT note FROM c1_proof WHERE id=3),'<absent>');" 2>/dev/null || true)"
      if [ "${NROW2}" = "${MARKER_VALUE}" ] && [ "${NROW3}" = "<absent>" ]; then
        record "negative_restore_lacks_unarchived_marker" "PASS" "archived marker present, unarchived '${NEG_MARKER_VALUE}' absent; replay_lsn=${NEG_REPLAY_LSN} < neg_lsn=${NEG_LSN}; timeline=${NEG_TL}"
      else
        record "negative_restore_lacks_unarchived_marker" "FAIL" "id2='${NROW2}' id3='${NROW3}' (unarchived marker must be absent)"
      fi
      podman rm -f "${CTR_RESTORE_NEG}" >/dev/null 2>&1 || true
    fi
  fi
  # Source stays stopped; later cases use fresh containers.
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

# --- S3-shaped repository config (render-only; NO live provider credentials) ---
# Assesses that the C1 image renders the production-shaped repo1-type=s3 config
# and fails closed on incomplete / non-distinct credentials. Placeholder values
# are obviously synthetic and never leave this process. Live Spaces behaviour
# is NOT exercised and stays UNVERIFIED.
echo "=== S3-shaped pgBackRest config render (no live credentials) ==="
S3_RENDER="${EVIDENCE_DIR}/s3-shape-render.conf"
set +e
podman run --rm --network=none \
  -e BOBA_PGBACKREST_REPO_MODE=s3 \
  -e BOBA_PGBACKREST_GENERATION="${GENERATION}" \
  -e BOBA_PGBACKREST_STANZA="${STANZA}" \
  -e PGBACKREST_CIPHER_PASS="${CIPHER_PASS}" \
  -e BOBA_RECOVERY_PHYSICAL_SPACES_BUCKET="c1-proof-physical-bucket-placeholder" \
  -e BOBA_RECOVERY_PHYSICAL_SPACES_ENDPOINT="https://placeholder.invalid/" \
  -e BOBA_RECOVERY_PHYSICAL_SPACES_REGION="placeholder-region" \
  -e BOBA_PHYSICAL_SPACES_ACCESS_KEY_ID="c1-proof-physical-placeholder-id" \
  -e BOBA_PHYSICAL_SPACES_SECRET_ACCESS_KEY="c1-proof-physical-placeholder-value" \
  -e BOBA_LOGICAL_SPACES_ACCESS_KEY_ID="c1-proof-logical-placeholder-id" \
  -e BOBA_RECOVERY_LOGICAL_SPACES_BUCKET="c1-proof-logical-bucket-placeholder" \
  --entrypoint /usr/local/bin/boba-render-pgbackrest-conf "${IMAGE_C1}" > "${S3_RENDER}"
S3_RC=$?
# Fail-closed: missing credentials
podman run --rm --network=none \
  -e BOBA_PGBACKREST_REPO_MODE=s3 -e BOBA_PGBACKREST_GENERATION="${GENERATION}" \
  -e PGBACKREST_CIPHER_PASS="${CIPHER_PASS}" \
  --entrypoint /usr/local/bin/boba-render-pgbackrest-conf "${IMAGE_C1}" >/dev/null 2>&1
S3_MISSING_RC=$?
# Fail-closed: Layer 1 physical == Layer 2 logical bucket
podman run --rm --network=none \
  -e BOBA_PGBACKREST_REPO_MODE=s3 -e BOBA_PGBACKREST_GENERATION="${GENERATION}" \
  -e PGBACKREST_CIPHER_PASS="${CIPHER_PASS}" \
  -e BOBA_RECOVERY_PHYSICAL_SPACES_BUCKET="same-bucket-placeholder" \
  -e BOBA_RECOVERY_PHYSICAL_SPACES_ENDPOINT="placeholder.invalid" \
  -e BOBA_RECOVERY_PHYSICAL_SPACES_REGION="placeholder-region" \
  -e BOBA_PHYSICAL_SPACES_ACCESS_KEY_ID="c1-proof-physical-placeholder-id" \
  -e BOBA_PHYSICAL_SPACES_SECRET_ACCESS_KEY="c1-proof-physical-placeholder-value" \
  -e BOBA_RECOVERY_LOGICAL_SPACES_BUCKET="same-bucket-placeholder" \
  --entrypoint /usr/local/bin/boba-render-pgbackrest-conf "${IMAGE_C1}" >/dev/null 2>&1
S3_SAME_RC=$?
set -e
cat "${S3_RENDER}" || true
if [ "${S3_RC}" -eq 0 ] \
  && grep -q '^repo1-type=s3$' "${S3_RENDER}" \
  && grep -q "^repo1-path=/repo-gen-${GENERATION}$" "${S3_RENDER}" \
  && grep -q '^repo1-s3-endpoint=placeholder.invalid$' "${S3_RENDER}" \
  && grep -q '^repo1-s3-uri-style=path$' "${S3_RENDER}" \
  && grep -q '^repo1-cipher-type=aes-256-cbc$' "${S3_RENDER}" \
  && ! grep -q -i 'placeholder-value' "${S3_RENDER}" \
  && [ "${S3_MISSING_RC}" -ne 0 ] && [ "${S3_SAME_RC}" -ne 0 ]; then
  record "s3_repo_shape_render" "PASS" "repo1-type=s3 rendered as non-root; secrets not written; missing-creds rc=${S3_MISSING_RC}; same-bucket rc=${S3_SAME_RC} (render-only)"
else
  record "s3_repo_shape_render" "FAIL" "render rc=${S3_RC} missing rc=${S3_MISSING_RC} same rc=${S3_SAME_RC}; see s3-shape-render.conf"
fi
record "s3_live_repo" "UNVERIFIED" "no live Spaces credentials in proof; S3 archive-push/restore not exercised"

# --- summary ---
{
  echo "# PG-C1 disposable proof summary"
  echo
  echo "- RUN_ID: \`${RUN_ID}\`"
  echo "- STAMP: \`${STAMP}\`"
  echo "- IMAGE_C1: \`${IMAGE_C1}\`"
  echo "- EXPECTED_HOST_UID_FOR_CONTAINER_999: \`${EXPECTED_HOST_FOR_999}\`"
  echo "- DOCKER_AVAILABLE: \`${DOCKER_AVAILABLE}\`"
  echo "- POST_BACKUP_MARKER: \`${MARKER_VALUE:-n/a}\` lsn=\`${MARKER_LSN:-n/a}\` segment=\`${MARKER_SEG:-n/a}\`"
  echo "- NEGATIVE_MARKER: \`${NEG_MARKER_VALUE:-n/a}\` lsn=\`${NEG_LSN:-n/a}\` segment=\`${NEG_SEG:-n/a}\`"
  echo "- RECOVERY_TARGETS: \`${VOL_RESTORE}\`, \`${VOL_RESTORE_NEG}\` (run-owned; source PGDATA never a target)"
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
