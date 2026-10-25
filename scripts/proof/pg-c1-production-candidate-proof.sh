#!/usr/bin/env bash
# Disposable Podman proof of Agent A's production-shaped PostgreSQL image.
#
# Builds docker/postgres/Dockerfile from a fetched commit via git archive.
# Does not check out Agent A's branch and does not modify docker/postgres.
# The old proof Dockerfile is not the candidate. Docker Engine is not used.
#
# Run-owned cleanup removes only this run's exact container names, container
# IDs, volumes, and image tag. RUN_ID is that identity. No staging project,
# no live Spaces calls.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "${ROOT}"
# shellcheck source=lib/c1-proof-cleanup.sh
source "${ROOT}/scripts/proof/lib/c1-proof-cleanup.sh"

if [ "$(git rev-parse --show-toplevel)" != "/home/ajoshi/repos/boba-bear-c1-pg-proof" ]; then
  echo "refusing: proof script must run in /home/ajoshi/repos/boba-bear-c1-pg-proof" >&2
  exit 3
fi
if [ "$(git branch --show-current)" != "proof/pg-c1-engine-recovery-20261024" ]; then
  echo "refusing: proof script must stay on proof/pg-c1-engine-recovery-20261024" >&2
  exit 3
fi

SOURCE_SHA_INPUT="${1:-${SOURCE_SHA:-}}"
SOURCE_REPO="${SOURCE_REPO:-/home/ajoshi/repos/boba-bear-c1-pg-source}"
SOURCE_BRANCH="${SOURCE_BRANCH:-fix/postgres-c1-nonroot-runtime-20261024}"
if [ -z "${SOURCE_SHA_INPUT}" ]; then
  echo "usage: $0 <source-sha>" >&2
  exit 2
fi
if [[ ! "${SOURCE_SHA_INPUT}" =~ ^[0-9a-fA-F]{7,40}$ ]]; then
  echo "refusing: source sha is not hex" >&2
  exit 2
fi

PROOF_HEAD_BEFORE="$(git rev-parse HEAD)"
git fetch --no-tags "${SOURCE_REPO}" "refs/heads/${SOURCE_BRANCH}"
if [ "$(git rev-parse HEAD)" != "${PROOF_HEAD_BEFORE}" ]; then
  echo "refusing: fetch moved proof HEAD" >&2
  exit 3
fi
if [ "$(git branch --show-current)" != "proof/pg-c1-engine-recovery-20261024" ]; then
  echo "refusing: fetch changed branch" >&2
  exit 3
fi

SOURCE_SHA="$(git rev-parse "${SOURCE_SHA_INPUT}^{commit}")"
if ! git merge-base --is-ancestor "${SOURCE_SHA}" FETCH_HEAD; then
  echo "refusing: ${SOURCE_SHA} is not on fetched ${SOURCE_BRANCH}" >&2
  exit 2
fi

SHA12="${SOURCE_SHA:0:12}"
STAMP="$(date -u +%Y%m%dT%H%M%SZ)"
RUN_ID="c1-proof-b-${SHA12}-$(date -u +%H%M%S)"
TMP="/tmp/boba-c1-proof-${SOURCE_SHA}"
HOST_BAD="/tmp/boba-c1-proof-${SOURCE_SHA}-bad"
EVIDENCE_DIR="${ROOT}/docs/platform/operations/evidence/pg-c1-prod-candidate-${STAMP}"
IMAGE="localhost/boba-bear-postgres:${RUN_ID}"
TRIVY_BIN="/snap/bin/trivy"
TRIVY_WD="/tmp/boba-c1-proof-${SOURCE_SHA}-trivy"

CTR="${RUN_ID}-pg"
CTR_RESTORE="${RUN_ID}-restore"
CTR_RESTORE_NEG="${RUN_ID}-restore-neg"
CTR_BAD="${RUN_ID}-bad-owner"
CTR_ROOT="${RUN_ID}-root"
CTR_S3FAIL="${RUN_ID}-s3-fail"
CTR_ARCHOFF="${RUN_ID}-archoff-s3"
VOL_PG="${RUN_ID}-pgdata"
VOL_REPO="${RUN_ID}-pgbackrest"
VOL_RESTORE="${RUN_ID}-restore-pgdata"
VOL_RESTORE_NEG="${RUN_ID}-restore-neg-pgdata"
VOL_S3FAIL="${RUN_ID}-s3fail-pgdata"

mkdir -p "${EVIDENCE_DIR}"
MATRIX_FILE="${EVIDENCE_DIR}/matrix.tsv"
FACTS_FILE="${EVIDENCE_DIR}/facts.txt"
LOG_FILE="${EVIDENCE_DIR}/proof.log"
SUMMARY_FILE="${EVIDENCE_DIR}/summary.md"
: > "${MATRIX_FILE}"
: > "${FACTS_FILE}"

exec > >(tee -a "${LOG_FILE}") 2>&1

record() {
  local case_id="$1" result="$2" note="$3"
  note="${note//$'\t'/ }"
  note="${note//$'\n'/ }"
  printf '%s\t%s\t%s\n' "${case_id}" "${result}" "${note}" | tee -a "${MATRIX_FILE}"
}

fact() {
  printf '%s=%s\n' "$1" "$2" | tee -a "${FACTS_FILE}"
}

C1_RUN_ID="${RUN_ID}"
C1_CLEANUP_EVIDENCE="${EVIDENCE_DIR}/cleanup.txt"
C1_IMAGE_REF="${IMAGE}"
C1_CONTAINER_NAMES=()
C1_CONTAINER_IDS=()
C1_VOLUME_NAMES=()
C1_CLEANED=0
C1_CLEANUP_EXIT=0
C1_REGISTRY_DIR="/tmp/boba-c1-proof-registry-${RUN_ID}"
mkdir -p "${C1_REGISTRY_DIR}"
C1_CONTAINER_NAME_FILE="${C1_REGISTRY_DIR}/names"
C1_CONTAINER_ID_FILE="${C1_REGISTRY_DIR}/ids"
C1_VOLUME_NAME_FILE="${C1_REGISTRY_DIR}/volumes"
: > "${C1_CONTAINER_NAME_FILE}"
: > "${C1_CONTAINER_ID_FILE}"
: > "${C1_VOLUME_NAME_FILE}"

c1_proof_append_unique_file() {
  local file="$1"
  local -n dest="$2"
  local line existing seen
  [ -f "${file}" ] || return 0
  while IFS= read -r line || [ -n "${line}" ]; do
    [ -n "${line}" ] || continue
    seen=0
    if [ "${#dest[@]}" -gt 0 ]; then
      for existing in "${dest[@]}"; do
        if [ "${existing}" = "${line}" ]; then
          seen=1
          break
        fi
      done
    fi
    if [ "${seen}" -eq 0 ]; then
      dest+=("${line}")
    fi
  done < "${file}"
}

c1_proof_load_registration() {
  C1_CONTAINER_NAMES=()
  C1_CONTAINER_IDS=()
  C1_VOLUME_NAMES=()
  c1_proof_append_unique_file "${C1_CONTAINER_NAME_FILE}" C1_CONTAINER_NAMES
  c1_proof_append_unique_file "${C1_CONTAINER_ID_FILE}" C1_CONTAINER_IDS
  c1_proof_append_unique_file "${C1_VOLUME_NAME_FILE}" C1_VOLUME_NAMES
}

c1_proof_cleanup_hook() {
  rm -rf "${HOST_BAD}" "${TMP}" "${TRIVY_WD}" "${C1_REGISTRY_DIR}" >/dev/null 2>&1 || true
  rm -f "${EVIDENCE_DIR}/image.tar" >/dev/null 2>&1 || true
  return 0
}

c1_podman_run() {
  local name="" prev="" arg rc=0 id="" errexit=0
  for arg in "$@"; do
    if [ "${prev}" = "--name" ]; then
      name="${arg}"
    fi
    prev="${arg}"
  done
  if [ -z "${name}" ]; then
    echo "refusing: podman run without --name" >&2
    return 1
  fi
  case "${name}" in
    "${RUN_ID}"|"${RUN_ID}-"*) ;;
    *)
      echo "refusing: container name ${name} is not owned by RUN_ID ${RUN_ID}" >&2
      return 1
      ;;
  esac
  printf '%s\n' "${name}" >> "${C1_CONTAINER_NAME_FILE}"
  case $- in
    *e*) errexit=1 ;;
  esac
  set +e
  podman run --label "boba.c1.run=${RUN_ID}" "$@"
  rc=$?
  id="$(podman inspect "${name}" --format '{{.Id}}' 2>/dev/null || true)"
  if [ "${errexit}" -eq 1 ]; then
    set -e
  fi
  if [ -n "${id}" ]; then
    printf '%s\n' "${id}" >> "${C1_CONTAINER_ID_FILE}"
  fi
  return "${rc}"
}

remember_volume() {
  printf '%s\n' "$1" >> "${C1_VOLUME_NAME_FILE}"
  podman volume inspect "$1" --format 'volume_name={{.Name}} mountpoint={{.Mountpoint}} created={{.CreatedAt}}' \
    | tee -a "${FACTS_FILE}"
}

remember_container() {
  podman inspect "$1" --format 'container_name={{.Name}} id={{.Id}} image={{.Image}}' \
    | tee -a "${FACTS_FILE}" || true
}

c1_proof_install_exit_trap

echo "=== production-candidate proof RUN_ID=${RUN_ID} SOURCE_SHA=${SOURCE_SHA} ==="
fact RUN_ID "${RUN_ID}"
fact SOURCE_SHA "${SOURCE_SHA}"
fact SOURCE_BRANCH "${SOURCE_BRANCH}"
fact PROOF_HEAD "${PROOF_HEAD_BEFORE}"
fact ENGINE podman
fact DOCKER_ENGINE UNVERIFIED

podman --version | tee "${EVIDENCE_DIR}/engine.txt"
fact PODMAN_VERSION "$(podman --version | awk '{print $NF}')"
if [ -x "${TRIVY_BIN}" ]; then
  "${TRIVY_BIN}" --version | head -n 2 | tee -a "${EVIDENCE_DIR}/engine.txt"
  fact TRIVY_BIN "${TRIVY_BIN}"
  fact TRIVY_VERSION "$("${TRIVY_BIN}" --version | awk 'NR==1{print $2}')"
else
  fact TRIVY_BIN "MISSING"
fi
id -u | tee -a "${EVIDENCE_DIR}/engine.txt"
id -g | tee -a "${EVIDENCE_DIR}/engine.txt"
echo "subuid: $(grep "^$(id -un):" /etc/subuid || true)" | tee -a "${EVIDENCE_DIR}/engine.txt"
echo "subgid: $(grep "^$(id -un):" /etc/subgid || true)" | tee -a "${EVIDENCE_DIR}/engine.txt"
HOST_UID="$(id -u)"
SUBUID_START="$(awk -F: -v u="$(id -un)" '$1==u {print $2; exit}' /etc/subuid)"
EXPECTED_HOST_FOR_999=$((SUBUID_START + 999 - 1))
fact HOST_UID "${HOST_UID}"
fact SUBUID_START "${SUBUID_START}"
fact EXPECTED_HOST_UID_FOR_CONTAINER_999 "${EXPECTED_HOST_FOR_999}"
{
  echo "host_uid=${HOST_UID}"
  echo "subuid_start=${SUBUID_START}"
  echo "expected_host_uid_for_container_999=${EXPECTED_HOST_FOR_999}"
} | tee "${EVIDENCE_DIR}/uid-map.txt"

if command -v docker >/dev/null 2>&1; then
  record "docker_engine" "UNVERIFIED" "docker CLI exists but this proof does not use it and does not claim Docker equivalence"
else
  record "docker_engine" "UNVERIFIED" "docker CLI absent; DOCKER_ENGINE=UNVERIFIED; Podman is additional evidence only"
fi
fact DOCKER_CLI "ABSENT_OR_UNUSED"

echo "=== archive ${SOURCE_SHA} ==="
rm -rf "${TMP}"
mkdir -p "${TMP}"
git archive "${SOURCE_SHA}" | tar -x -C "${TMP}"
test -f "${TMP}/docker/postgres/Dockerfile"
DOCKERFILE_SHA256="$(sha256sum "${TMP}/docker/postgres/Dockerfile" | awk '{print $1}')"
ENTRYPOINT_SHA256="$(sha256sum "${TMP}/docker/postgres/pgbackrest/entrypoint-wrapper.sh" | awk '{print $1}')"
fact DOCKERFILE_SHA256 "${DOCKERFILE_SHA256}"
fact ENTRYPOINT_SHA256 "${ENTRYPOINT_SHA256}"
grep -n '^USER ' "${TMP}/docker/postgres/Dockerfile" | tee "${EVIDENCE_DIR}/dockerfile-user.txt"
echo "dockerfile_sha256=${DOCKERFILE_SHA256}" >> "${EVIDENCE_DIR}/dockerfile-user.txt"
echo "entrypoint_sha256=${ENTRYPOINT_SHA256}" >> "${EVIDENCE_DIR}/dockerfile-user.txt"

echo "=== build production Dockerfile ==="
if [ "${SKIP_BUILD:-}" = "1" ] && podman image exists "${IMAGE}"; then
  echo "SKIP_BUILD=1 reusing ${IMAGE}"
else
  podman rmi -f "${IMAGE}" >/dev/null 2>&1 || true
  podman build --network=host \
    --label "boba.c1.proof=c1-proof-b-${SHA12}" \
    --label "boba.c1.run=${RUN_ID}" \
    --label "boba.c1.source-sha=${SOURCE_SHA}" \
    -f "${TMP}/docker/postgres/Dockerfile" \
    -t "${IMAGE}" \
    "${TMP}"
fi

IMAGE_ID="$(podman image inspect "${IMAGE}" --format '{{.Id}}')"
CONFIG_USER="$(podman image inspect "${IMAGE}" --format '{{.Config.User}}')"
fact IMAGE_REF "${IMAGE}"
fact IMAGE_ID "${IMAGE_ID}"
fact CONFIG_USER "${CONFIG_USER}"
{
  echo "image_ref=${IMAGE}"
  echo "image_id=${IMAGE_ID}"
  echo "config_user=${CONFIG_USER}"
  echo "source_sha=${SOURCE_SHA}"
} | tee "${EVIDENCE_DIR}/image-inspect.txt"
podman image inspect "${IMAGE}" --format 'Id={{.Id}} User={{.Config.User}} Entrypoint={{.Config.Entrypoint}} Cmd={{.Config.Cmd}}' \
  | tee -a "${EVIDENCE_DIR}/image-inspect.txt"

RUNTIME_ID_TEXT="$(c1_podman_run --rm --name "${RUN_ID}-id" --entrypoint id "${IMAGE}")"
echo "${RUNTIME_ID_TEXT}" | tee -a "${EVIDENCE_DIR}/image-inspect.txt"
RUNTIME_UID="$(c1_podman_run --rm --name "${RUN_ID}-id-uid" --entrypoint id "${IMAGE}" -u)"
RUNTIME_USER="$(c1_podman_run --rm --name "${RUN_ID}-id-user" --entrypoint id "${IMAGE}" -un)"
fact RUNTIME_UID "${RUNTIME_UID}"
fact RUNTIME_USER "${RUNTIME_USER}"
if { [ "${CONFIG_USER}" = "postgres" ] || [ "${CONFIG_USER}" = "999" ] || [ "${CONFIG_USER}" = "999:999" ]; } \
  && [ "${RUNTIME_UID}" = "999" ] && [ "${RUNTIME_USER}" = "postgres" ]; then
  record "final_image_uid" "PASS" "Config.User=${CONFIG_USER}; runtime id=${RUNTIME_UID}(${RUNTIME_USER}); image_id=${IMAGE_ID}"
else
  record "final_image_uid" "FAIL" "Config.User=${CONFIG_USER}; runtime id=${RUNTIME_UID}(${RUNTIME_USER}); image_id=${IMAGE_ID}"
fi

PGDATA_PATH="$(podman image inspect "${IMAGE}" --format '{{range .Config.Env}}{{println .}}{{end}}' | sed -n 's/^PGDATA=//p' | head -n1)"
if [ -z "${PGDATA_PATH}" ]; then
  PGDATA_PATH="/var/lib/postgresql/18/docker"
fi
fact PGDATA_PATH "${PGDATA_PATH}"
echo "PGDATA_PATH=${PGDATA_PATH}"

rand_token() { head -c 48 /dev/urandom | base64 | tr -dc 'A-Za-z0-9' | head -c 32; }
CIPHER_PASS="c1-proof-cipher-$(rand_token)"
PG_PASS="c1-proof-pg-$(rand_token)"
STANZA="boba"
GENERATION="1"
export CIPHER_PASS PG_PASS EVIDENCE_DIR

common_env=(
  -e POSTGRES_USER=postgres
  -e POSTGRES_PASSWORD="${PG_PASS}"
  -e POSTGRES_DB=postgres
  -e "PGDATA=${PGDATA_PATH}"
  -e BOBA_PGBACKREST_STANZA="${STANZA}"
  -e BOBA_PGBACKREST_GENERATION="${GENERATION}"
  -e BOBA_PGBACKREST_REPO_MODE=posix
  -e PGBACKREST_CIPHER_PASS="${CIPHER_PASS}"
  -e PGBACKREST_REPO1_CIPHER_PASS="${CIPHER_PASS}"
)

wait_ready() {
  local name="$1" attempts="${2:-90}"
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
  podman exec "$1" psql -U postgres -d postgres -v ON_ERROR_STOP=1 -Atc "$2"
}

PGBR="pgbackrest --config=/etc/pgbackrest/pgbackrest.conf --stanza=${STANZA}"
REPO_ARCHIVE_DIR="/var/lib/pgbackrest/repo-gen-${GENERATION}/archive/${STANZA}"
RESTORE_CONF_IN_VOL="/var/lib/postgresql/boba-pgbackrest-restore.conf"
TARGET_OWNER_MARKER="/var/lib/postgresql/.boba-recovery-target-owner"

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

provision_target() {
  local vol="$1"
  podman volume create --label "boba.c1.proof=c1-proof-b-${SHA12}" --label "boba.c1.run=${RUN_ID}" "${vol}" >/dev/null
  remember_volume "${vol}"
  c1_podman_run --rm --name "${vol}-provision" \
    --label "boba.c1.proof=c1-proof-b-${SHA12}" \
    -v "${vol}:/var/lib/postgresql:Z" \
    --entrypoint bash "${IMAGE}" \
    -c "set -eu; id; stat -c 'owner=%u mode=%a path=%n' /var/lib/postgresql; test ! -e '${PGDATA_PATH}/PG_VERSION'; printf '%s\n' '${RUN_ID}' > '${TARGET_OWNER_MARKER}'"
}

restore_into_target() {
  local vol="$1" job_name="$2"
  c1_podman_run --rm --name "${job_name}" \
    --label "boba.c1.proof=c1-proof-b-${SHA12}" \
    "${common_env[@]}" \
    -e BOBA_PGBACKREST_ARCHIVE=0 \
    -v "${vol}:/var/lib/postgresql:Z" \
    -v "${VOL_REPO}:/var/lib/pgbackrest:Z" \
    --entrypoint bash \
    "${IMAGE}" \
    -c "
      set -euo pipefail
      test \"\$(cat '${TARGET_OWNER_MARKER}')\" = '${RUN_ID}' || { echo 'target not owned by this run' >&2; exit 97; }
      test ! -e '${PGDATA_PATH}/PG_VERSION' || { echo 'target already initialized; refusing' >&2; exit 98; }
      mkdir -p '${PGDATA_PATH}'
      export BOBA_PGBACKREST_REPO_MODE=posix
      export BOBA_PGBACKREST_GENERATION=${GENERATION}
      export PGDATA='${PGDATA_PATH}'
      umask 077
      /usr/local/bin/boba-render-pgbackrest-conf > '${RESTORE_CONF_IN_VOL}'
      chmod 600 '${RESTORE_CONF_IN_VOL}'
      pgbackrest --config='${RESTORE_CONF_IN_VOL}' --stanza=${STANZA} \
        --pg1-path='${PGDATA_PATH}' --log-level-console=info restore
      test -f '${PGDATA_PATH}/PG_VERSION'
      test -f '${PGDATA_PATH}/recovery.signal'
      echo '--- postgresql.auto.conf ---'
      grep -E 'restore_command|recovery_target' '${PGDATA_PATH}/postgresql.auto.conf' || true
    "
}

start_target_and_wait_promoted() {
  local vol="$1" ctr="$2"
  c1_podman_run -d --name "${ctr}" \
    --label "boba.c1.proof=c1-proof-b-${SHA12}" \
    "${common_env[@]}" \
    -e BOBA_PGBACKREST_ARCHIVE=0 \
    -e "PGBACKREST_CONFIG=${RESTORE_CONF_IN_VOL}" \
    -v "${vol}:/var/lib/postgresql:Z" \
    -v "${VOL_REPO}:/var/lib/pgbackrest:Z" \
    "${IMAGE}" >/dev/null
  remember_container "${ctr}"
  wait_ready "${ctr}" 90 || return 1
  local i inrec
  for i in $(seq 1 90); do
    inrec="$(psql_at "${ctr}" "SELECT pg_is_in_recovery();" 2>/dev/null || echo "?")"
    if [ "${inrec}" = "f" ]; then
      return 0
    fi
    sleep 1
  done
  return 1
}

target_recovery_facts() {
  psql_at "${1}" "SELECT coalesce(pg_last_wal_replay_lsn()::text,'-')||' '||(SELECT timeline_id FROM pg_control_checkpoint())||' '||current_setting('archive_mode');" 2>/dev/null || echo "- - -"
}

snapshot_tree() {
  local dir="$1"
  find "${dir}" -printf '%P %s\n' | sort
}

echo "=== row 2: fresh start and restart on a new volume ==="
podman volume create --label "boba.c1.proof=c1-proof-b-${SHA12}" --label "boba.c1.run=${RUN_ID}" "${VOL_PG}" >/dev/null
remember_volume "${VOL_PG}"
podman volume create --label "boba.c1.proof=c1-proof-b-${SHA12}" --label "boba.c1.run=${RUN_ID}" "${VOL_REPO}" >/dev/null
remember_volume "${VOL_REPO}"
c1_podman_run -d --name "${CTR}" \
  --label "boba.c1.proof=c1-proof-b-${SHA12}" \
  "${common_env[@]}" \
  -e BOBA_PGBACKREST_ARCHIVE=0 \
  -v "${VOL_PG}:/var/lib/postgresql:Z" \
  -v "${VOL_REPO}:/var/lib/pgbackrest:Z" \
  "${IMAGE}" >/dev/null
remember_container "${CTR}"
FRESH_OK=0
RESTART_OK=0
OWNED_OK=0
if wait_ready "${CTR}" 90; then
  CTR_UID="$(podman exec "${CTR}" id -u)"
  CTR_USER="$(podman exec "${CTR}" id -un)"
  MOUNT_OWNER="$(podman exec "${CTR}" stat -c '%u:%g %a' /var/lib/postgresql)"
  if ! podman exec "${CTR}" test -f "${PGDATA_PATH}/PG_VERSION"; then
    echo "PG_VERSION missing after fresh start" >&2
    MOUNT_OWNER="missing-pgdata"
  fi
  VOL_MP="$(podman volume inspect "${VOL_PG}" --format '{{.Mountpoint}}')"
  HOST_OWNER="$(stat -c '%u:%g' "${VOL_MP}")"
  echo "mount_owner_inside=${MOUNT_OWNER}" | tee -a "${EVIDENCE_DIR}/uid-map.txt"
  echo "host_owner_volume=${HOST_OWNER}" | tee -a "${EVIDENCE_DIR}/uid-map.txt"
  echo "container_uid=${CTR_UID}" | tee -a "${EVIDENCE_DIR}/uid-map.txt"
  if [ "${CTR_UID}" = "999" ] && [ "${CTR_USER}" = "postgres" ] && [[ "${MOUNT_OWNER}" == 999:* ]] \
    && [[ "${HOST_OWNER}" == "${EXPECTED_HOST_FOR_999}:"* ]]; then
    OWNED_OK=1
    FRESH_OK=1
  fi
else
  podman logs "${CTR}" > "${EVIDENCE_DIR}/fresh-start.log" 2>&1 || true
fi

if [ "${FRESH_OK}" = "1" ]; then
  podman stop "${CTR}" >/dev/null
  podman rm "${CTR}" >/dev/null
  c1_podman_run -d --name "${CTR}" \
    --label "boba.c1.proof=c1-proof-b-${SHA12}" \
    "${common_env[@]}" \
    -e BOBA_PGBACKREST_ARCHIVE=0 \
    -v "${VOL_PG}:/var/lib/postgresql:Z" \
    -v "${VOL_REPO}:/var/lib/pgbackrest:Z" \
    "${IMAGE}" >/dev/null
  remember_container "${CTR}"
  if wait_ready "${CTR}" 90; then
    RESTART_OK=1
  else
    podman logs "${CTR}" > "${EVIDENCE_DIR}/restart.log" 2>&1 || true
  fi
fi
if [ "${FRESH_OK}" = "1" ] && [ "${RESTART_OK}" = "1" ] && [ "${OWNED_OK}" = "1" ]; then
  record "fresh_start_restart" "PASS" "new volume ${VOL_PG} owned inside by 999 and on host by ${EXPECTED_HOST_FOR_999}; fresh start and restart ready; no :U"
else
  record "fresh_start_restart" "FAIL" "fresh=${FRESH_OK} restart=${RESTART_OK} owned=${OWNED_OK} uid=${CTR_UID:-unset} host_owner=${HOST_OWNER:-unset}"
fi

echo "=== row 3: incorrectly owned bind must fail closed ==="
rm -rf "${HOST_BAD}"
mkdir -p "${HOST_BAD}/18/docker"
printf 'untouched\n' > "${HOST_BAD}/.mount-sentinel"
printf 'untouched\n' > "${HOST_BAD}/18/docker/.pgdata-sentinel"
chmod 755 "${HOST_BAD}" "${HOST_BAD}/18" "${HOST_BAD}/18/docker"
chown "$(id -u):$(id -g)" "${HOST_BAD}" "${HOST_BAD}/18" "${HOST_BAD}/18/docker" "${HOST_BAD}/.mount-sentinel" "${HOST_BAD}/18/docker/.pgdata-sentinel" || true
BEFORE_SNAP="$(snapshot_tree "${HOST_BAD}")"
BEFORE_HASH="$(sha256sum "${HOST_BAD}/.mount-sentinel" "${HOST_BAD}/18/docker/.pgdata-sentinel" | sha256sum | awk '{print $1}')"
c1_podman_run -d --name "${CTR_BAD}" \
  --label "boba.c1.proof=c1-proof-b-${SHA12}" \
  "${common_env[@]}" \
  -e BOBA_PGBACKREST_ARCHIVE=0 \
  -v "${HOST_BAD}:/var/lib/postgresql:Z" \
  "${IMAGE}" >/dev/null
remember_container "${CTR_BAD}"
BAD_STATE="running"
for _ in $(seq 1 25); do
  BAD_STATE="$(podman inspect "${CTR_BAD}" --format '{{.State.Status}}' 2>/dev/null || echo missing)"
  if [ "${BAD_STATE}" != "running" ]; then
    break
  fi
  sleep 1
done
if [ "${BAD_STATE}" = "running" ]; then
  podman stop "${CTR_BAD}" >/dev/null 2>&1 || true
fi
BAD_RC="$(podman inspect "${CTR_BAD}" --format '{{.State.ExitCode}}' 2>/dev/null || echo 999)"
podman logs "${CTR_BAD}" > "${EVIDENCE_DIR}/bad-owner.log" 2>&1 || true
AFTER_SNAP="$(snapshot_tree "${HOST_BAD}")"
AFTER_HASH="$(sha256sum "${HOST_BAD}/.mount-sentinel" "${HOST_BAD}/18/docker/.pgdata-sentinel" | sha256sum | awk '{print $1}')"
if [ "${BAD_RC}" != "0" ] && [ "${BAD_STATE}" != "running" ] && [ "${BEFORE_HASH}" = "${AFTER_HASH}" ] && [ "${BEFORE_SNAP}" = "${AFTER_SNAP}" ] && [ "${OWNED_OK}" = "1" ]; then
  record "volume_ownership_fail_closed" "PASS" "correctly owned new volume succeeded; incorrect host-owned bind exit=${BAD_RC}; both sentinels and tree snapshot unchanged"
else
  record "volume_ownership_fail_closed" "FAIL" "owned_ok=${OWNED_OK} exit=${BAD_RC} state=${BAD_STATE} hash_same=$([ "${BEFORE_HASH}" = "${AFTER_HASH}" ] && echo yes || echo no) tree_same=$([ "${BEFORE_SNAP}" = "${AFTER_SNAP}" ] && echo yes || echo no)"
fi
printf '%s\n' "${BEFORE_SNAP}" > "${EVIDENCE_DIR}/bad-owner-before.txt"
printf '%s\n' "${AFTER_SNAP}" > "${EVIDENCE_DIR}/bad-owner-after.txt"

echo "=== row 4: forced root rejection ==="
# No proof-data volume: uid 0 is rejected before PGDATA is touched.
set +e
c1_podman_run -d --name "${CTR_ROOT}" \
  --label "boba.c1.proof=c1-proof-b-${SHA12}" \
  --user 0:0 \
  "${common_env[@]}" \
  -e BOBA_PGBACKREST_ARCHIVE=0 \
  "${IMAGE}" >/dev/null
ROOT_START_RC=$?
set -e
echo "root_start_rc=${ROOT_START_RC}"
remember_container "${CTR_ROOT}"
ROOT_STATE="running"
for _ in $(seq 1 20); do
  ROOT_STATE="$(podman inspect "${CTR_ROOT}" --format '{{.State.Status}}' 2>/dev/null || echo missing)"
  if [ "${ROOT_STATE}" != "running" ]; then
    break
  fi
  sleep 1
done
if [ "${ROOT_STATE}" = "running" ]; then
  podman stop "${CTR_ROOT}" >/dev/null 2>&1 || true
fi
ROOT_RC="$(podman inspect "${CTR_ROOT}" --format '{{.State.ExitCode}}' 2>/dev/null || echo 999)"
podman logs "${CTR_ROOT}" > "${EVIDENCE_DIR}/root-reject.log" 2>&1 || true
if [ "${ROOT_RC}" != "0" ] && [ "${ROOT_STATE}" != "running" ] && grep -Eiq 'refusing to start as root|refusing.*root' "${EVIDENCE_DIR}/root-reject.log"; then
  record "forced_root_rejection" "PASS" "--user 0 exit=${ROOT_RC}; log refuses root"
else
  record "forced_root_rejection" "FAIL" "--user 0 exit=${ROOT_RC} state=${ROOT_STATE}; see root-reject.log"
fi

echo "=== row 10: unsuppressed Trivy ==="
# Snap Trivy cannot read /tmp (private mount namespace). The archive must live
# on a non-hidden path under $HOME. It is removed before the script exits.
mkdir -p "${TRIVY_WD}"
: > "${EVIDENCE_DIR}/empty.trivyignore"
IMAGE_TAR="${EVIDENCE_DIR}/image.tar"
TRIVY_JSON="${EVIDENCE_DIR}/trivy-report.json"
TRIVY_ERR="${EVIDENCE_DIR}/trivy.stderr.txt"
if [ ! -x "${TRIVY_BIN}" ]; then
  record "trivy_unsuppressed" "FAIL" "snap trivy missing at ${TRIVY_BIN}"
else
  podman save -o "${IMAGE_TAR}" "${IMAGE}"
  set +e
  (
    cd "${EVIDENCE_DIR}"
    "${TRIVY_BIN}" image \
      --input "${IMAGE_TAR}" \
      --scanners vuln,misconfig,secret \
      --image-config-scanners misconfig \
      --severity UNKNOWN,LOW,MEDIUM,HIGH,CRITICAL \
      --exit-code 0 \
      --format json \
      --output "${TRIVY_JSON}" \
      --ignorefile "${EVIDENCE_DIR}/empty.trivyignore" \
      --no-progress
  ) > "${EVIDENCE_DIR}/trivy.stdout.txt" 2> "${TRIVY_ERR}"
  TRIVY_RC=$?
  set -e
  rm -f "${IMAGE_TAR}"
  python3 - "${TRIVY_JSON}" "${EVIDENCE_DIR}/trivy-ds0002.json" "${SOURCE_SHA}" "${IMAGE_ID}" "${TRIVY_RC}" <<'PY'
import json, sys
src, dst, sha, image_id, rc = sys.argv[1:]
report = {
  "source_sha": sha,
  "image_id": image_id,
  "trivy_exit": int(rc),
  "ignorefile": "empty",
  "repo_trivyignore_passed": False,
  "vex_passed": False,
  "scanners": ["vuln", "misconfig", "secret"],
  "image_config_scanners": ["misconfig"],
  "ds0002_present": None,
  "ds0002_hits": [],
  "high_critical_vulns": [],
  "misconfig_ids": [],
}
try:
    data = json.load(open(src))
except Exception as exc:
    report["parse_error"] = str(exc)
    json.dump(report, open(dst, "w"), indent=2)
    sys.exit(0)
for result in data.get("Results") or []:
    for key in ("Misconfigurations", "Misconfs"):
        for item in result.get(key) or []:
            mid = item.get("ID") or item.get("AVDID") or ""
            title = item.get("Title") or ""
            report["misconfig_ids"].append(mid or title)
            if mid == "DS-0002" or "DS-0002" in title or "DS-0002" in (item.get("Description") or ""):
                report["ds0002_hits"].append({
                    "id": mid,
                    "title": title,
                    "severity": item.get("Severity"),
                    "target": result.get("Target"),
                    "class": result.get("Class"),
                })
    for vuln in result.get("Vulnerabilities") or []:
        sev = vuln.get("Severity")
        if sev in ("HIGH", "CRITICAL"):
            report["high_critical_vulns"].append({
                "id": vuln.get("VulnerabilityID"),
                "severity": sev,
                "pkg": vuln.get("PkgName"),
                "target": result.get("Target"),
            })
report["ds0002_present"] = bool(report["ds0002_hits"])
report["high_critical_vuln_count"] = len(report["high_critical_vulns"])
# Keep the bound summary small enough to read; full IDs remain in trivy-report.json.
report["high_critical_vulns"] = report["high_critical_vulns"][:40]
report["misconfig_ids"] = sorted(set(report["misconfig_ids"]))
json.dump(report, open(dst, "w"), indent=2)
print(f"ds0002_present={report['ds0002_present']} high_critical_vuln_count={report['high_critical_vuln_count']}")
PY
  DS_LINE="$(python3 -c 'import json,sys; d=json.load(open(sys.argv[1])); print("present" if d.get("ds0002_present") else "absent"); print(d.get("high_critical_vuln_count"))' "${EVIDENCE_DIR}/trivy-ds0002.json")"
  DS_STATE="$(printf '%s\n' "${DS_LINE}" | sed -n '1p')"
  DS_COUNT="$(printf '%s\n' "${DS_LINE}" | sed -n '2p')"
  fact DS0002 "${DS_STATE}"
  fact TRIVY_HIGH_CRITICAL_COUNT "${DS_COUNT}"
  if [ "${TRIVY_RC}" -eq 0 ] && [ "${DS_STATE}" = "absent" ]; then
    record "trivy_unsuppressed" "PASS" "DS-0002 absent; empty ignorefile; VEX not passed; bound to ${SOURCE_SHA} ${IMAGE_ID}; high_critical_count=${DS_COUNT}; not the six-image CI gate"
  elif [ "${TRIVY_RC}" -ne 0 ]; then
    record "trivy_unsuppressed" "FAIL" "trivy exit=${TRIVY_RC}; see trivy.stderr.txt"
  else
    record "trivy_unsuppressed" "FAIL" "DS-0002 ${DS_STATE}; bound to ${SOURCE_SHA} ${IMAGE_ID}; high_critical_count=${DS_COUNT}"
  fi
fi

echo "=== rows 5-8: backup, specific WAL, restore, interrupted archive ==="
MARKER_VALUE=""
MARKER_LSN=""
MARKER_SEG=""
NEG_MARKER_VALUE=""
NEG_LSN=""
NEG_SEG=""
if [ "${RESTART_OK}" != "1" ]; then
  record "pgbackrest_full_backup" "FAIL" "not executed: owned database did not restart"
  record "post_backup_wal_segment" "FAIL" "not executed: owned database did not restart"
  record "isolated_restore_marker" "FAIL" "not executed: owned database did not restart"
  record "interrupted_archive_failure" "FAIL" "not executed: owned database did not restart"
else
  podman stop "${CTR}" >/dev/null
  podman rm "${CTR}" >/dev/null
  c1_podman_run -d --name "${CTR}" \
    --label "boba.c1.proof=c1-proof-b-${SHA12}" \
    "${common_env[@]}" \
    -e BOBA_PGBACKREST_ARCHIVE=1 \
    -e BOBA_PGBACKREST_ARCHIVE_TIMEOUT=60 \
    -v "${VOL_PG}:/var/lib/postgresql:Z" \
    -v "${VOL_REPO}:/var/lib/pgbackrest:Z" \
    "${IMAGE}" >/dev/null
  remember_container "${CTR}"
  if ! wait_ready "${CTR}" 90; then
    podman logs "${CTR}" > "${EVIDENCE_DIR}/archive-on.log" 2>&1 || true
    record "pgbackrest_full_backup" "FAIL" "archive-on start did not become ready"
    record "post_backup_wal_segment" "FAIL" "not executed: archive-on start failed"
    record "isolated_restore_marker" "FAIL" "not executed: archive-on start failed"
    record "interrupted_archive_failure" "FAIL" "not executed: archive-on start failed"
  else
    set +e
    podman exec "${CTR}" bash -c "set -euo pipefail; ${PGBR} stanza-create; ${PGBR} check" \
      > "${EVIDENCE_DIR}/stanza.log" 2>&1
    STANZA_RC=$?
    set -e
    psql_at "${CTR}" "CREATE TABLE IF NOT EXISTS c1_proof(id int primary key, note text); INSERT INTO c1_proof VALUES (1, 'before-backup') ON CONFLICT DO NOTHING;" >/dev/null
    set +e
    podman exec "${CTR}" bash -c "set -euo pipefail; ${PGBR} backup --type=full; ${PGBR} info; ${PGBR} verify" \
      > "${EVIDENCE_DIR}/backup.log" 2>&1
    BAK_RC=$?
    set -e
    if [ "${STANZA_RC}" -eq 0 ] && [ "${BAK_RC}" -eq 0 ]; then
      record "pgbackrest_full_backup" "PASS" "stanza-create + check + backup --type=full + info + verify"
    else
      record "pgbackrest_full_backup" "FAIL" "stanza_rc=${STANZA_RC} backup_rc=${BAK_RC}"
    fi

    if [ "${BAK_RC}" -ne 0 ]; then
      record "post_backup_wal_segment" "FAIL" "not executed: full backup failed"
      record "isolated_restore_marker" "FAIL" "not executed: full backup failed"
      record "interrupted_archive_failure" "FAIL" "not executed: full backup failed"
    else
      MARKER_VALUE="post-backup-marker-${RUN_ID}"
      psql_at "${CTR}" "INSERT INTO c1_proof VALUES (2, '${MARKER_VALUE}');" >/dev/null
      MARKER_LSN="$(psql_at "${CTR}" "SELECT pg_current_wal_lsn();")"
      MARKER_SEG="$(psql_at "${CTR}" "SELECT pg_walfile_name('${MARKER_LSN}'::pg_lsn);")"
      SWITCH_LSN="$(psql_at "${CTR}" "SELECT pg_switch_wal();")"
      echo "marker_lsn=${MARKER_LSN} marker_seg=${MARKER_SEG} switch_lsn=${SWITCH_LSN}" | tee "${EVIDENCE_DIR}/wal-marker.txt"
      WAL_HIT=""
      WAL_OK=0
      if [[ "${MARKER_SEG}" =~ ^[0-9A-F]{24}$ ]]; then
        if WAL_HIT="$(verify_segment_archived "${CTR}" "${MARKER_SEG}" 90)"; then
          WAL_OK=1
        fi
      fi
      echo "archiver $(archiver_stats "${CTR}")" | tee -a "${EVIDENCE_DIR}/wal-marker.txt"
      echo "segment_hit=${WAL_HIT}" | tee -a "${EVIDENCE_DIR}/wal-marker.txt"
      if [ "${WAL_OK}" = "1" ]; then
        record "post_backup_wal_segment" "PASS" "pg_current_wal_lsn=${MARKER_LSN} pg_walfile_name=${MARKER_SEG} after pg_switch_wal=${SWITCH_LSN}; exact file ${WAL_HIT}"
      else
        record "post_backup_wal_segment" "FAIL" "segment=${MARKER_SEG:-unset} lsn=${MARKER_LSN:-unset} not found as an exact archive file"
      fi

      echo "=== isolated restore ==="
      podman stop "${CTR}" >/dev/null
      if [ "${WAL_OK}" != "1" ]; then
        record "isolated_restore_marker" "FAIL" "not executed: marker segment was not archived"
      else
        provision_target "${VOL_RESTORE}"
        set +e
        restore_into_target "${VOL_RESTORE}" "${CTR_RESTORE}-job" > "${EVIDENCE_DIR}/restore-job.log" 2>&1
        RESTORE_RC=$?
        set -e
        if [ "${RESTORE_RC}" -ne 0 ]; then
          record "isolated_restore_marker" "FAIL" "pgbackrest restore exit=${RESTORE_RC}"
        elif ! start_target_and_wait_promoted "${VOL_RESTORE}" "${CTR_RESTORE}"; then
          podman logs "${CTR_RESTORE}" > "${EVIDENCE_DIR}/restore-target.log" 2>&1 || true
          record "isolated_restore_marker" "FAIL" "restored database did not finish recovery"
        else
          podman logs "${CTR_RESTORE}" > "${EVIDENCE_DIR}/restore-target.log" 2>&1 || true
          read -r REPLAY_LSN _TARGET_TL _TARGET_ARCHIVE <<<"$(target_recovery_facts "${CTR_RESTORE}")"
          REPLAY_GE="$(psql_at "${CTR_RESTORE}" "SELECT ('${REPLAY_LSN}'::pg_lsn >= '${MARKER_LSN}'::pg_lsn);" 2>/dev/null || echo "?")"
          ROW2="$(psql_at "${CTR_RESTORE}" "SELECT note FROM c1_proof WHERE id=2;" 2>/dev/null || true)"
          echo "replay_lsn=${REPLAY_LSN} replay_ge_marker=${REPLAY_GE} row2=${ROW2}" | tee -a "${EVIDENCE_DIR}/wal-marker.txt"
          if [ "${ROW2}" = "${MARKER_VALUE}" ] && [ "${REPLAY_GE}" = "t" ]; then
            record "isolated_restore_marker" "PASS" "restored database contains ${MARKER_VALUE}; replay_lsn=${REPLAY_LSN} >= marker_lsn=${MARKER_LSN}"
          else
            record "isolated_restore_marker" "FAIL" "row2='${ROW2}' replay_lsn=${REPLAY_LSN} replay_ge=${REPLAY_GE}"
          fi
          podman rm -f "${CTR_RESTORE}" >/dev/null 2>&1 || true
        fi
      fi

      echo "=== interrupted archive ==="
      podman start "${CTR}" >/dev/null || true
      if ! wait_ready "${CTR}" 90; then
        podman logs "${CTR}" > "${EVIDENCE_DIR}/negative-restart.log" 2>&1 || true
        record "interrupted_archive_failure" "FAIL" "source did not restart for interrupted-archive case"
      else
        NEG_MARKER_VALUE="neg-unarchived-marker-${RUN_ID}"
        set +e
        podman exec "${CTR}" bash -c "chmod 000 '${REPO_ARCHIVE_DIR}' && stat -c '%A %u %n' '${REPO_ARCHIVE_DIR}'" \
          | tee "${EVIDENCE_DIR}/negative-archive-mode.txt"
        CHMOD_RC="${PIPESTATUS[0]}"
        set -e
        echo "chmod_rc=${CHMOD_RC}" | tee -a "${EVIDENCE_DIR}/negative-archive-mode.txt"
        psql_at "${CTR}" "INSERT INTO c1_proof VALUES (3, '${NEG_MARKER_VALUE}');" >/dev/null
        NEG_LSN="$(psql_at "${CTR}" "SELECT pg_current_wal_lsn();")"
        NEG_SEG="$(psql_at "${CTR}" "SELECT pg_walfile_name('${NEG_LSN}'::pg_lsn);")"
        NEG_SWITCH="$(psql_at "${CTR}" "SELECT pg_switch_wal();")"
        echo "neg_lsn=${NEG_LSN} neg_seg=${NEG_SEG} neg_switch=${NEG_SWITCH}" | tee -a "${EVIDENCE_DIR}/negative-archive-mode.txt"
        set +e
        NEG_HIT="$(verify_segment_archived "${CTR}" "${NEG_SEG}" 30)"
        NEG_VERIFY_RC=$?
        set -e
        STATS_AFTER="$(archiver_stats "${CTR}")"
        echo "archiver_after=${STATS_AFTER} verify_rc=${NEG_VERIFY_RC}" | tee -a "${EVIDENCE_DIR}/negative-archive-mode.txt"
        read -r NEG_ARCHIVED_COUNT _NEG_LAST_OK NEG_FAILED_COUNT NEG_LAST_FAILED <<<"${STATS_AFTER}"
        podman stop "${CTR}" >/dev/null || true
        set +e
        c1_podman_run --rm --name "${RUN_ID}-chmod-restore" \
          --label "boba.c1.proof=c1-proof-b-${SHA12}" \
          -v "${VOL_REPO}:/var/lib/pgbackrest:Z" \
          --entrypoint bash "${IMAGE}" \
          -c "chmod 750 '${REPO_ARCHIVE_DIR}'; if find '${REPO_ARCHIVE_DIR}' -type f -name '${NEG_SEG}-*' | grep -q .; then echo NEG_SEGMENT_PRESENT; exit 99; else echo NEG_SEGMENT_ABSENT; fi" \
          > "${EVIDENCE_DIR}/negative-segment-check.txt" 2>&1
        NEG_ABSENT_RC=$?
        set -e
        cat "${EVIDENCE_DIR}/negative-segment-check.txt" | tee -a "${EVIDENCE_DIR}/negative-archive-mode.txt"
        provision_target "${VOL_RESTORE_NEG}"
        set +e
        restore_into_target "${VOL_RESTORE_NEG}" "${CTR_RESTORE_NEG}-job" > "${EVIDENCE_DIR}/restore-negative-job.log" 2>&1
        NEG_RESTORE_RC=$?
        set -e
        NEG_ROW3="unavailable"
        NEG_ROW2=""
        if [ "${NEG_RESTORE_RC}" -eq 0 ] && start_target_and_wait_promoted "${VOL_RESTORE_NEG}" "${CTR_RESTORE_NEG}"; then
          NEG_ROW2="$(psql_at "${CTR_RESTORE_NEG}" "SELECT note FROM c1_proof WHERE id=2;" 2>/dev/null || true)"
          NEG_ROW3="$(psql_at "${CTR_RESTORE_NEG}" "SELECT coalesce((SELECT note FROM c1_proof WHERE id=3),'<absent>');" 2>/dev/null || true)"
          podman logs "${CTR_RESTORE_NEG}" > "${EVIDENCE_DIR}/restore-negative-target.log" 2>&1 || true
          podman rm -f "${CTR_RESTORE_NEG}" >/dev/null 2>&1 || true
        fi
        FALSE_PASS="no"
        if [ "${NEG_ARCHIVED_COUNT:-0}" -gt 0 ] && [ "${NEG_VERIFY_RC}" -ne 0 ]; then
          FALSE_PASS="yes"
        fi
        if [ "${CHMOD_RC:-1}" -eq 0 ] \
          && [ "${NEG_VERIFY_RC}" -ne 0 ] \
          && [ "${NEG_FAILED_COUNT:-0}" -gt 0 ] \
          && [ "${NEG_LAST_FAILED}" = "${NEG_SEG}" ] \
          && [ "${NEG_ABSENT_RC}" -eq 0 ] \
          && [ "${NEG_ROW2}" = "${MARKER_VALUE}" ] \
          && [ "${NEG_ROW3}" = "<absent>" ] \
          && [ "${FALSE_PASS}" = "yes" ]; then
          record "interrupted_archive_failure" "PASS" "verifier failed for ${NEG_SEG}; failed_count=${NEG_FAILED_COUNT}; last_failed_wal=${NEG_LAST_FAILED}; second restore lacks ${NEG_MARKER_VALUE}; bare archived_count=${NEG_ARCHIVED_COUNT} would have been a false PASS"
        else
          record "interrupted_archive_failure" "FAIL" "chmod_rc=${CHMOD_RC:-?} verify_rc=${NEG_VERIFY_RC} failed_count=${NEG_FAILED_COUNT:-?} last_failed_wal=${NEG_LAST_FAILED:-?} absent_rc=${NEG_ABSENT_RC} row2='${NEG_ROW2}' row3='${NEG_ROW3}' false_pass_demo=${FALSE_PASS} stats='${STATS_AFTER}'"
        fi
      fi
    fi
  fi
fi

echo "=== row 11: synthetic S3 render, network none ==="
S3_RENDER="${EVIDENCE_DIR}/s3-shape-render.conf"
set +e
c1_podman_run --rm --network=none --name "${RUN_ID}-s3-render" \
  --label "boba.c1.proof=c1-proof-b-${SHA12}" \
  -e BOBA_PGBACKREST_REPO_MODE=s3 \
  -e BOBA_PGBACKREST_GENERATION="${GENERATION}" \
  -e BOBA_PGBACKREST_STANZA="${STANZA}" \
  -e "PGDATA=${PGDATA_PATH}" \
  -e PGBACKREST_CIPHER_PASS="${CIPHER_PASS}" \
  -e BOBA_RECOVERY_PHYSICAL_SPACES_BUCKET="c1-proof-physical-bucket-placeholder" \
  -e BOBA_RECOVERY_PHYSICAL_SPACES_ENDPOINT="https://placeholder.invalid/" \
  -e BOBA_RECOVERY_PHYSICAL_SPACES_REGION="placeholder-region" \
  -e BOBA_PHYSICAL_SPACES_ACCESS_KEY_ID="c1-proof-physical-placeholder-id" \
  -e BOBA_PHYSICAL_SPACES_SECRET_ACCESS_KEY="c1-proof-physical-placeholder-value" \
  -e BOBA_LOGICAL_SPACES_ACCESS_KEY_ID="c1-proof-logical-placeholder-id" \
  -e BOBA_RECOVERY_LOGICAL_SPACES_BUCKET="c1-proof-logical-bucket-placeholder" \
  --entrypoint /usr/local/bin/boba-render-pgbackrest-conf "${IMAGE}" > "${S3_RENDER}"
S3_RC=$?
c1_podman_run --rm --network=none --name "${RUN_ID}-s3-missing" \
  --label "boba.c1.proof=c1-proof-b-${SHA12}" \
  -e BOBA_PGBACKREST_REPO_MODE=s3 \
  -e BOBA_PGBACKREST_GENERATION="${GENERATION}" \
  -e PGBACKREST_CIPHER_PASS="${CIPHER_PASS}" \
  --entrypoint /usr/local/bin/boba-render-pgbackrest-conf "${IMAGE}" >/dev/null 2>"${EVIDENCE_DIR}/s3-missing.stderr.txt"
S3_MISSING_RC=$?
c1_podman_run --rm --network=none --name "${RUN_ID}-s3-same" \
  --label "boba.c1.proof=c1-proof-b-${SHA12}" \
  -e BOBA_PGBACKREST_REPO_MODE=s3 \
  -e BOBA_PGBACKREST_GENERATION="${GENERATION}" \
  -e PGBACKREST_CIPHER_PASS="${CIPHER_PASS}" \
  -e BOBA_RECOVERY_PHYSICAL_SPACES_BUCKET="same-bucket-placeholder" \
  -e BOBA_RECOVERY_PHYSICAL_SPACES_ENDPOINT="placeholder.invalid" \
  -e BOBA_RECOVERY_PHYSICAL_SPACES_REGION="placeholder-region" \
  -e BOBA_PHYSICAL_SPACES_ACCESS_KEY_ID="c1-proof-physical-placeholder-id" \
  -e BOBA_PHYSICAL_SPACES_SECRET_ACCESS_KEY="c1-proof-physical-placeholder-value" \
  -e BOBA_RECOVERY_LOGICAL_SPACES_BUCKET="same-bucket-placeholder" \
  --entrypoint /usr/local/bin/boba-render-pgbackrest-conf "${IMAGE}" >/dev/null 2>"${EVIDENCE_DIR}/s3-same.stderr.txt"
S3_SAME_RC=$?
set -e

podman volume create --label "boba.c1.proof=c1-proof-b-${SHA12}" --label "boba.c1.run=${RUN_ID}" "${VOL_S3FAIL}" >/dev/null
remember_volume "${VOL_S3FAIL}"
c1_podman_run -d --name "${CTR_S3FAIL}" \
  --network=none \
  --label "boba.c1.proof=c1-proof-b-${SHA12}" \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD="${PG_PASS}" \
  -e POSTGRES_DB=postgres \
  -e "PGDATA=${PGDATA_PATH}" \
  -e BOBA_PGBACKREST_ARCHIVE=1 \
  -e BOBA_PGBACKREST_REPO_MODE=s3 \
  -e BOBA_PGBACKREST_GENERATION="${GENERATION}" \
  -e PGBACKREST_CIPHER_PASS="${CIPHER_PASS}" \
  -v "${VOL_S3FAIL}:/var/lib/postgresql:Z" \
  "${IMAGE}" >/dev/null
remember_container "${CTR_S3FAIL}"
S3FAIL_STATE="running"
for _ in $(seq 1 25); do
  S3FAIL_STATE="$(podman inspect "${CTR_S3FAIL}" --format '{{.State.Status}}' 2>/dev/null || echo missing)"
  if [ "${S3FAIL_STATE}" != "running" ]; then
    break
  fi
  sleep 1
done
if [ "${S3FAIL_STATE}" = "running" ]; then
  podman stop "${CTR_S3FAIL}" >/dev/null 2>&1 || true
fi
S3FAIL_RC="$(podman inspect "${CTR_S3FAIL}" --format '{{.State.ExitCode}}' 2>/dev/null || echo 999)"
podman logs "${CTR_S3FAIL}" > "${EVIDENCE_DIR}/s3-fail-closed.log" 2>&1 || true
set +e
c1_podman_run --rm --name "${RUN_ID}-s3fail-check" \
  -v "${VOL_S3FAIL}:/var/lib/postgresql:Z" \
  --entrypoint bash "${IMAGE}" \
  -c "if test -f '${PGDATA_PATH}/PG_VERSION'; then echo present; exit 0; else echo absent; exit 1; fi"
S3FAIL_PG_RC=$?
set -e
if [ "${S3FAIL_PG_RC}" -eq 0 ]; then
  S3FAIL_PG="present"
else
  S3FAIL_PG="absent"
fi

ARCHOFF_READY="no"
if [ "${RESTART_OK}" = "1" ]; then
  podman rm -f "${CTR}" >/dev/null 2>&1 || true
  c1_podman_run -d --name "${CTR_ARCHOFF}" \
    --network=none \
    --label "boba.c1.proof=c1-proof-b-${SHA12}" \
    -e POSTGRES_USER=postgres \
    -e POSTGRES_PASSWORD="${PG_PASS}" \
    -e POSTGRES_DB=postgres \
    -e "PGDATA=${PGDATA_PATH}" \
    -e BOBA_PGBACKREST_ARCHIVE=0 \
    -e BOBA_PGBACKREST_GENERATION="${GENERATION}" \
    -e PGBACKREST_CIPHER_PASS="${CIPHER_PASS}" \
    -v "${VOL_PG}:/var/lib/postgresql:Z" \
    "${IMAGE}" >/dev/null
  remember_container "${CTR_ARCHOFF}"
  if wait_ready "${CTR_ARCHOFF}" 40; then
    ARCHOFF_READY="yes"
  fi
  podman logs "${CTR_ARCHOFF}" > "${EVIDENCE_DIR}/archive-disabled-incomplete-s3.log" 2>&1 || true
  podman rm -f "${CTR_ARCHOFF}" >/dev/null 2>&1 || true
fi

S3_SECRET_LEAK="no"
if grep -q 'c1-proof-physical-placeholder-value' "${S3_RENDER}" 2>/dev/null; then
  S3_SECRET_LEAK="yes"
fi
RENDER_OK="no"
if [ "${S3_RC}" -eq 0 ] \
  && grep -q '^repo1-type=s3$' "${S3_RENDER}" \
  && grep -q "^repo1-path=/repo-gen-${GENERATION}$" "${S3_RENDER}" \
  && grep -q '^repo1-s3-endpoint=placeholder.invalid$' "${S3_RENDER}" \
  && grep -q '^repo1-s3-uri-style=path$' "${S3_RENDER}" \
  && grep -q '^repo1-cipher-type=aes-256-cbc$' "${S3_RENDER}" \
  && [ "${S3_SECRET_LEAK}" = "no" ] \
  && [ "${S3_MISSING_RC}" -ne 0 ] \
  && [ "${S3_SAME_RC}" -ne 0 ]; then
  RENDER_OK="yes"
fi
S3_RUNTIME_OK="no"
if [ "${S3FAIL_RC}" != "0" ] && [ "${S3FAIL_STATE}" != "running" ] && [ "${S3FAIL_PG}" = "absent" ] \
  && grep -Eiq 'Spaces|render failed|refusing' "${EVIDENCE_DIR}/s3-fail-closed.log"; then
  S3_RUNTIME_OK="yes"
fi
if [ "${RENDER_OK}" = "yes" ] && [ "${S3_RUNTIME_OK}" = "yes" ]; then
  record "s3_synthetic_render" "PASS" "network=none render repo1-type=s3; secret not written; missing-creds rc=${S3_MISSING_RC}; same-bucket rc=${S3_SAME_RC}; archive=1 incomplete S3 exit=${S3FAIL_RC} and PGDATA absent; archive=0 with incomplete S3 became_ready=${ARCHOFF_READY} (fail-closed only when archive is enabled)"
else
  record "s3_synthetic_render" "FAIL" "render_ok=${RENDER_OK} rc=${S3_RC} missing=${S3_MISSING_RC} same=${S3_SAME_RC} leak=${S3_SECRET_LEAK} runtime_ok=${S3_RUNTIME_OK} s3fail_rc=${S3FAIL_RC} pgdata=${S3FAIL_PG} archoff_ready=${ARCHOFF_READY}"
fi
record "s3_live_spaces" "UNVERIFIED" "S3_LIVE_SPACES=UNVERIFIED; no credentials and no bucket changes; synthetic network-free render only"

c1_proof_cleanup_registered || true
cat "${EVIDENCE_DIR}/cleanup.txt" >> "${FACTS_FILE}" || true
cleanup_result="$(c1_proof_cleanup_matrix_result "${EVIDENCE_DIR}/cleanup.txt")"
cleanup_note="$(c1_proof_cleanup_matrix_note "${EVIDENCE_DIR}/cleanup.txt")"
record "cleanup" "${cleanup_result}" "${cleanup_note}"
c1_proof_cleanup_hook || true

python3 - <<'PY'
import os, pathlib
secrets = [os.environ.get("CIPHER_PASS", ""), os.environ.get("PG_PASS", "")]
root = pathlib.Path(os.environ["EVIDENCE_DIR"])
for path in root.rglob("*"):
    if not path.is_file() or path.stat().st_size > 20_000_000:
        continue
    data = path.read_bytes()
    if b"\0" in data[:1024]:
        continue
    text = data.decode("utf-8", "replace")
    new = text
    for secret in secrets:
        if secret:
            new = new.replace(secret, "[REDACTED]")
    if new != text:
        path.write_text(new)
        print(f"redacted {path.name}")
PY

{
  echo "# PG-C1 production-candidate proof"
  echo
  echo "- RUN_ID: \`${RUN_ID}\`"
  echo "- SOURCE_SHA: \`${SOURCE_SHA}\`"
  echo "- IMAGE_ID: \`${IMAGE_ID}\`"
  echo "- ENGINE: podman $(podman --version | awk '{print $NF}')"
  echo "- DOCKER_ENGINE: UNVERIFIED"
  echo "- S3_LIVE_SPACES: UNVERIFIED"
  echo "- CONFIG_USER: \`${CONFIG_USER}\`"
  echo "- RUNTIME_UID: \`${RUNTIME_UID} (${RUNTIME_USER})\`"
  echo
  echo "| Case | Result | Note |"
  echo "|---|---|---|"
  while IFS=$'\t' read -r c r n; do
    echo "| ${c} | ${r} | ${n} |"
  done < "${MATRIX_FILE}"
} > "${SUMMARY_FILE}"

echo "=== matrix ==="
cat "${MATRIX_FILE}"
echo "EVIDENCE_DIR=${EVIDENCE_DIR}"

set +e
c1_proof_classify_result "${MATRIX_FILE}" "${EVIDENCE_DIR}/cleanup.txt"
classify_rc=$?
set -e
exit "${classify_rc}"
