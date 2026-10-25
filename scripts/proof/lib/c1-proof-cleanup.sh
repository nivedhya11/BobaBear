#!/usr/bin/env bash
# Run-owned Podman cleanup for the PG-C1 production-candidate proof.
#
# Sourced by the proof script and by negative tests. Removal lists are the
# exact names and IDs the caller recorded for one RUN_ID. Verification of
# those identities decides cleanup_exit. C1_CLEANED is set only after that
# verification shows the registered resources are gone, so a failed attempt
# stays retryable from the EXIT trap. The trap preserves the incoming status
# and forces status 1 when a retry still leaves run-owned resources.
#
# Env:
#   C1_PROOF_CLEANUP_ATTEMPTS       default 5
#   C1_PROOF_CLEANUP_SLEEP_SECONDS  default 1

c1_proof_cleanup_positive_int() {
  local value="$1" fallback="$2"
  if [[ "${value}" =~ ^[1-9][0-9]*$ ]]; then
    printf '%s\n' "${value}"
  else
    printf '%s\n' "${fallback}"
  fi
}

c1_proof_cleanup_sleep_seconds() {
  local value="$1"
  if [[ "${value}" =~ ^[0-9]+([.][0-9]+)?$ ]]; then
    printf '%s\n' "${value}"
  else
    printf '%s\n' "1"
  fi
}

# True (status 0) when the evidence file is missing, cleanup_exit is not 0,
# or any leftover section contains a line.
c1_proof_cleanup_file_failed() {
  local evidence="$1" exit_code=""
  if [ ! -f "${evidence}" ]; then
    return 0
  fi
  exit_code="$(awk -F= '$1=="cleanup_exit" { print $2; exit }' "${evidence}")"
  if [ "${exit_code}" != "0" ]; then
    return 0
  fi
  if awk '
    /^leftover_[[:alnum:]_]+<<EOF$/ { grab=1; next }
    grab && /^EOF$/ { grab=0; next }
    grab && $0 != "" { found=1 }
    END { exit found ? 0 : 1 }
  ' "${evidence}"; then
    return 0
  fi
  return 1
}

c1_proof_cleanup_matrix_result() {
  local evidence="$1"
  if c1_proof_cleanup_file_failed "${evidence}"; then
    printf 'FAIL\n'
  else
    printf 'PASS\n'
  fi
}

c1_proof_cleanup_matrix_note() {
  local evidence="$1" exit_code="missing"
  if [ -f "${evidence}" ]; then
    exit_code="$(awk -F= '$1=="cleanup_exit" { print $2; exit }' "${evidence}")"
    [ -n "${exit_code}" ] || exit_code="missing"
  fi
  if c1_proof_cleanup_file_failed "${evidence}"; then
    printf 'cleanup_exit=%s; leftovers recorded in cleanup evidence\n' "${exit_code}"
  else
    printf 'no leftover run-owned containers, volumes, or image; cleanup_exit=0\n'
  fi
}

# Prints PROOF_RESULT and returns 0 only for PASS_WITH_UNVERIFIED.
# Any matrix FAIL, cleanup_exit other than 0, or a non-empty leftover list
# prints PROOF_RESULT=FAIL and returns 1.
c1_proof_classify_result() {
  local matrix="$1" evidence="$2" failed=0
  if [ ! -f "${matrix}" ] || c1_proof_cleanup_file_failed "${evidence}"; then
    failed=1
  elif awk -F'\t' '$2=="FAIL" { found=1 } END { exit found ? 0 : 1 }' "${matrix}"; then
    failed=1
  fi
  if [ "${failed}" -eq 1 ]; then
    printf 'PROOF_RESULT=FAIL\n'
    return 1
  fi
  printf 'PROOF_RESULT=PASS_WITH_UNVERIFIED\n'
  return 0
}

c1_proof_install_exit_trap() {
  trap 'c1_proof_exit_trap $?' EXIT
}

# Incoming status is the first argument ($? from the trap string).
# Do not return from this function. A return inside an EXIT trap replaces
# the script status.
c1_proof_exit_trap() {
  local incoming="${1:-1}" status
  trap - EXIT
  if ! [[ "${incoming}" =~ ^[0-9]+$ ]]; then
    incoming=1
  fi
  status="${incoming}"
  if [ "${C1_CLEANED:-0}" != "1" ]; then
    if ! c1_proof_cleanup_registered; then
      if [ "${status}" -eq 0 ]; then
        status=1
      fi
    fi
  fi
  if [ "${C1_CLEANUP_EXIT:-0}" != "0" ]; then
    if [ "${status}" -eq 0 ]; then
      status=1
    fi
  fi
  if declare -F c1_proof_cleanup_hook >/dev/null 2>&1; then
    c1_proof_cleanup_hook || true
  fi
  exit "${status}"
}

c1_proof_cleanup_registered() {
  if declare -F c1_proof_load_registration >/dev/null 2>&1; then
    c1_proof_load_registration || true
  fi
  c1_proof_cleanup "${C1_RUN_ID}" "${C1_CLEANUP_EVIDENCE}" \
    --names "${C1_CONTAINER_NAMES[@]}" \
    --ids "${C1_CONTAINER_IDS[@]}" \
    --volumes "${C1_VOLUME_NAMES[@]}" \
    --image ${C1_IMAGE_REF:+"${C1_IMAGE_REF}"} \
    --
}

# c1_proof_cleanup RUN_ID EVIDENCE --names N... --ids ID... --volumes V... --image REF --
c1_proof_cleanup() {
  local run_id="$1" evidence_file="$2"
  shift 2
  local -a names=() ids=() volumes=()
  local image="" mode="names" arg
  local errexit=0 attempt=0 max_attempts=5 sleep_seconds=1
  local cleanup_exit=1 verify_failed=0 image_id="" image_removed="NO"
  local -a left_containers=() left_volumes=() left_images=()
  local ps_out="" vol_out="" line id name want matched rc=0
  local containers_text="" volumes_text="" images_text="" tmp_file=""

  case $- in
    *e*) errexit=1 ;;
  esac
  set +e

  while [ "$#" -gt 0 ]; do
    arg="$1"
    case "${arg}" in
      --names) mode="names" ;;
      --ids) mode="ids" ;;
      --volumes) mode="volumes" ;;
      --image) mode="image" ;;
      --) break ;;
      *)
        case "${mode}" in
          names) names+=("${arg}") ;;
          ids) ids+=("${arg}") ;;
          volumes) volumes+=("${arg}") ;;
          image) image="${arg}" ;;
        esac
        ;;
    esac
    shift
  done

  if [ -z "${run_id}" ] || [ -z "${evidence_file}" ]; then
    C1_CLEANUP_EXIT=1
    C1_CLEANED=0
    if [ "${errexit}" -eq 1 ]; then
      set -e
    fi
    return 1
  fi

  max_attempts="$(c1_proof_cleanup_positive_int "${C1_PROOF_CLEANUP_ATTEMPTS:-5}" 5)"
  sleep_seconds="$(c1_proof_cleanup_sleep_seconds "${C1_PROOF_CLEANUP_SLEEP_SECONDS:-1}")"

  if [ -n "${image}" ]; then
    image_id="$(podman image inspect --format '{{.Id}}' -- "${image}" 2>/dev/null || true)"
  fi

  cleanup_exit=1
  while [ "${attempt}" -lt "${max_attempts}" ]; do
    attempt=$((attempt + 1))
    C1_PROOF_CLEANUP_ATTEMPT="${attempt}"
    export C1_PROOF_CLEANUP_ATTEMPT

    if [ "${#names[@]}" -gt 0 ]; then
      for name in "${names[@]}"; do
        podman rm -f -- "${name}" >/dev/null 2>&1 || true
      done
    fi
    if [ "${#ids[@]}" -gt 0 ]; then
      for id in "${ids[@]}"; do
        podman rm -f -- "${id}" >/dev/null 2>&1 || true
      done
    fi
    if [ "${#volumes[@]}" -gt 0 ]; then
      for name in "${volumes[@]}"; do
        podman volume rm -f -- "${name}" >/dev/null 2>&1 || true
      done
    fi
    if [ -n "${image}" ]; then
      podman rmi -- "${image}" >/dev/null 2>&1 || true
    fi

    verify_failed=0
    left_containers=()
    left_volumes=()
    left_images=()

    ps_out="$(podman ps -a --no-trunc --format '{{.ID}} {{.Names}}' 2>/dev/null)"
    rc=$?
    if [ "${rc}" -ne 0 ]; then
      verify_failed=1
      left_containers+=("VERIFY_FAILED")
    else
      while IFS= read -r line; do
        [ -n "${line}" ] || continue
        id="${line%% *}"
        name="${line#* }"
        matched=0
        if [ "${#names[@]}" -gt 0 ]; then
          for want in "${names[@]}"; do
            if [ "${name}" = "${want}" ]; then
              matched=1
            fi
          done
        fi
        if [ "${matched}" -eq 0 ] && [ "${#ids[@]}" -gt 0 ]; then
          for want in "${ids[@]}"; do
            if [ "${id}" = "${want}" ]; then
              matched=1
            fi
          done
        fi
        if [ "${matched}" -eq 1 ]; then
          left_containers+=("${line}")
        fi
      done <<< "${ps_out}"
    fi

    vol_out="$(podman volume ls --format '{{.Name}}' 2>/dev/null)"
    rc=$?
    if [ "${rc}" -ne 0 ]; then
      verify_failed=1
      left_volumes+=("VERIFY_FAILED")
    elif [ "${#volumes[@]}" -gt 0 ]; then
      while IFS= read -r line; do
        [ -n "${line}" ] || continue
        for want in "${volumes[@]}"; do
          if [ "${line}" = "${want}" ]; then
            left_volumes+=("${line}")
          fi
        done
      done <<< "${vol_out}"
    fi

    if [ -n "${image}" ]; then
      if podman image exists -- "${image}" >/dev/null 2>&1; then
        left_images+=("${image}")
      fi
    fi

    if [ "${verify_failed}" -eq 0 ] \
      && [ "${#left_containers[@]}" -eq 0 ] \
      && [ "${#left_volumes[@]}" -eq 0 ] \
      && [ "${#left_images[@]}" -eq 0 ]; then
      cleanup_exit=0
      break
    fi
    if [ "${attempt}" -lt "${max_attempts}" ]; then
      sleep "${sleep_seconds}"
    fi
  done

  if [ -z "${image}" ]; then
    image_removed="NO"
  elif [ "${#left_images[@]}" -eq 0 ] && [ "${verify_failed}" -eq 0 ]; then
    image_removed="YES"
  else
    image_removed="NO"
  fi

  containers_text=""
  volumes_text=""
  images_text=""
  if [ "${#left_containers[@]}" -gt 0 ]; then
    containers_text="$(printf '%s\n' "${left_containers[@]}")"
  fi
  if [ "${#left_volumes[@]}" -gt 0 ]; then
    volumes_text="$(printf '%s\n' "${left_volumes[@]}")"
  fi
  if [ "${#left_images[@]}" -gt 0 ]; then
    images_text="$(printf '%s\n' "${left_images[@]}")"
  fi

  mkdir -p "$(dirname "${evidence_file}")" 2>/dev/null
  tmp_file="${evidence_file}.tmp.$$"
  {
    printf 'run_id=%s\n' "${run_id}"
    printf 'cleanup_exit=%s\n' "${cleanup_exit}"
    printf 'cleanup_attempts=%s\n' "${attempt}"
    printf 'image_ref=%s\n' "${image}"
    printf 'image_id=%s\n' "${image_id}"
    printf 'image_removed=%s\n' "${image_removed}"
    printf 'leftover_containers<<EOF\n'
    if [ -n "${containers_text}" ]; then
      printf '%s\n' "${containers_text}"
    fi
    printf 'EOF\n'
    printf 'leftover_volumes<<EOF\n'
    if [ -n "${volumes_text}" ]; then
      printf '%s\n' "${volumes_text}"
    fi
    printf 'EOF\n'
    printf 'leftover_images<<EOF\n'
    if [ -n "${images_text}" ]; then
      printf '%s\n' "${images_text}"
    fi
    printf 'EOF\n'
  } > "${tmp_file}"
  if [ "$?" -ne 0 ]; then
    cleanup_exit=1
  else
    mv "${tmp_file}" "${evidence_file}" || cleanup_exit=1
  fi

  C1_CLEANUP_EXIT="${cleanup_exit}"
  if [ "${cleanup_exit}" -eq 0 ]; then
    C1_CLEANED=1
  else
    C1_CLEANED=0
  fi
  if [ "${errexit}" -eq 1 ]; then
    set -e
  fi
  if [ "${cleanup_exit}" -eq 0 ]; then
    return 0
  fi
  return 1
}
