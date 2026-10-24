# PG-C1 disposable engineering proof (2026-10-24)

```text
TASK = PG-C1-DISPOSABLE-ENGINEERING-PROOF-R2
WAVE = BOBA-PREGTM-PARALLEL-EXECUTION-20261024
AGENT = B
WORKTREE = /home/ajoshi/repos/boba-bear-wave-b-pg
BRANCH = proof/pg-c1-disposable-20261024
EXACT_BASE = 00ef486e9dbeb1a30ba32e76fcd7b8b43507a53f
RISK = R2
DELIVERY_MODE = PUBLISH_PR
POSTGRES_C1_C2_SELECTION = NOT_GRANTED
SECURITY_EXCEPTION_RENEWAL = NO
TRIVY_OR_SCA_BYPASS = NO
```

## ALIGNMENT_GATE (R2)

```text
ALIGNMENT_GATE

Repository Authority: VERIFIED
Repository / Branch / HEAD (pre-mutation): /home/ajoshi/repos/boba-bear-wave-b-pg | proof/pg-c1-disposable-20261024 | 00ef486e9dbeb1a30ba32e76fcd7b8b43507a53f
Vision Version: VISION-1
Roadmap Version: GTM-R190
State Version: STATE-R189
Architecture Version: ARCH-R23
Decision Register Version: DR-25
Product Delivery Version: PD-2
Product Definition: N/A — infrastructure / recovery runtime proof (not IMP-036J product stories)
Stories: N/A — PRE-PD-1 / non-story engineering proof
Acceptance Scenarios: N/A — disposable proof matrix (this document)
Golden Journeys: N/A
Testing Policy: TEST-1 (evidence over claims; no silent-retry proof)
Accepted Through: IMP-036I
Current Product Slice: IMP-036J (lifecycle unchanged by this proof)
Task Slice: PG-C1 disposable non-root PostgreSQL + pgBackRest runtime proof
Task Capability: IMP-037 recovery Layer 1 runtime compatibility + IMP-038 DS-0002 disposition evidence
Relevant Non-Goals: no managed PostgreSQL; no production volume mutation; no VEX renewal
Relevant ARCH-G Invariants: ARCH-G13 (PostgreSQL authoritative); ARCH-G26 (self-hosted PG18 + recovery obligations)
Relevant Binding Decisions: D-374 / ADR-016 pilot hosting; IMP-037 Layer 1 pgBackRest contract; VEX-TRIVY-001 DS-0002 (ACTIVE, not renewed here)
Task Assumptions: disposable uniquely named Podman volumes only; Docker engine absent on this host
Deferred Capabilities Touched: production postgres image cutover; staging/prod volume migration
Semantic Scope: MAY ADD proof-only C1 non-root image + harness + evidence; MUST NOT modify PR #428, staging/prod volumes, or renew Trivy exceptions
Conflicts: NONE verified
Unverified Material Facts: Docker-shaped init (no docker CLI/daemon on proof host)
Risk Level: R2
DELIVERY_MODE: PUBLISH_PR
Gate Result: PASS
```

## Objective

Establish whether a **non-root** PostgreSQL runtime (final `USER postgres`) can satisfy the existing IMP-037 recovery architecture **without unsafe ownership migration**. Prefer pure C1. Scoped one-shot C2 initializer only if proof establishes necessity. Founder selection is **not** self-granted.

## Prototype (proof-only; production Dockerfile unchanged)

| Artifact | Path |
|---|---|
| C1 Dockerfile | `docker/postgres/Dockerfile.c1-nonroot` |
| Non-root entrypoint | `docker/postgres/c1-nonroot/entrypoint-wrapper.sh` |
| Proof harness | `scripts/proof/pg-c1-disposable-proof.sh` |
| Run evidence (local) | `artifacts/pg-c1-proof/<RUN_ID>/` |

Build:

```bash
podman build -f docker/postgres/Dockerfile -t localhost/boba-bear-postgres:c1-base .
podman build -f docker/postgres/Dockerfile.c1-nonroot \
  --build-arg BASE_IMAGE=localhost/boba-bear-postgres:c1-base \
  -t localhost/boba-bear-postgres:c1-nonroot .
```

C1 contract:

- Final image `Config.User=postgres` (UID 999)
- Entrypoint refuses UID 0
- No volume `chown` / no blanket `:U`
- Writable `/etc/pgbackrest`, `/etc/postgresql`, pgBackRest repo/log/spool
- PostgreSQL 18 `PGDATA=/var/lib/postgresql/18/docker` with volume mount `/var/lib/postgresql`
- Archive-off and archive-on (`BOBA_PGBACKREST_ARCHIVE`)
- pgBackRest config render via existing `boba-render-pgbackrest-conf` (posix disposable mode)

## Executed proof run

```text
RUN_ID = boba-pgc1-disp-20261024T060031Z-71079
HOST_UID = 1000
subuid = ajoshi:100000:65536
EXPECTED_HOST_UID_FOR_CONTAINER_999 = 100998
VERIFIED_MAPPING = container UID 999 -> host UID 100998
```

### Proof matrix

| Case | Result | Note |
|---|---|---|
| docker_env | **UNVERIFIED** | docker CLI/daemon absent; rootless Podman only |
| image_user_postgres | PASS | `Config.User=postgres` |
| trivy_ds0002 | PASS | DS-0002 absent in unsuppressed image-config scan (pinned Trivy on `podman save` tar; no `.trivyignore`) |
| fresh_startup_archive_off | PASS | UID 999; PG18 layout |
| rootless_uid_mapping | PASS | 999 → 100998 |
| restart_same_volume | PASS | same disposable named volume |
| archive_on_startup | PASS | archive_mode via C1 entrypoint |
| pgbackrest_stanza | PASS | stanza-create + check |
| pgbackrest_backup_info_verify | PASS | full backup + info + verify |
| wal_archival | PASS | archive evidence present |
| isolated_restore | PASS | restore into separate disposable volume; row verified |
| wrong_permission_fail_closed | PASS | host-owned bind (UID 1000) fails; marker unchanged; no silent PGDATA create |
| refuse_root_start | PASS | `--user 0:0` rejected |

**Platform matrix verdict:** Podman rootless disposable matrix **PASS**. Docker **UNVERIFIED**. Do **not** call the full multi-engine platform matrix PASS.

## Trivy DS-0002

- Scan mode: image-config misconfig only, severity HIGH/CRITICAL
- Suppression: **none** (no `.trivyignore`, no VEX renewal)
- Input: `podman save` tarball (snap Trivy cannot see rootless `podman.sock`)
- Result: **DS-0002 ABSENT** on `boba-bear-postgres:c1-nonroot`

This does **not** authorize removing VEX-TRIVY-001 from the production root image until Founder selects C1 cutover.

## C2 investigation

C1 succeeded on **fresh disposable empty/named volumes** owned by the mapped non-root UID. Therefore a scoped C2 root initializer is **not required** for greenfield disposable / new-volume paths.

C2 would only become relevant for **existing root-initialized volumes** (container UID 0 → host UID 1000 under this rootless map). Migrating those without an authorized plan implies ownership rewrite — **out of scope and unsafe** for this proof. No C2 initializer image was built; root-image DS-0002 was not relocated into an unscanned helper.

## Recommended Founder selection (NOT GRANTED)

```text
RECOMMENDED_SELECTION = C1_PURE_NONROOT_RUNTIME
POSTGRES_C1_C2_SELECTION = NOT_GRANTED  # Founder must grant
```

**Rationale**

1. Pure C1 satisfies Layer 1 recovery on disposable empty volumes: startup, restart, stanza/backup/verify, WAL archive, isolated restore.
2. DS-0002 clears on the C1 image without exception renewal.
3. Wrong-permission paths fail closed without silent data modification.
4. Rootless mapping **is compatible** (999 → 100998); incompatibility must not be assumed.
5. C2 one-shot bootstrap is unnecessary for new volumes; using C2 to paper over live root-owned data would be a separate consequential migration, not this proof.

**Cutover caveats (Founder-owned)**

- Do not point C1 at existing root-owned staging/prod volumes without an explicit migration decision.
- Production `docker/postgres/Dockerfile` remains root/`USER root` until selection + follow-on cutover work.
- Docker engine proof remains UNVERIFIED on this host; require a Docker disposable rerun before claiming multi-engine PASS.

## Hard restrictions observance

- No touch of `boba-staging`, production, or shared `postgres-data` volumes
- No blanket `:U`, recursive ownership repair, production credentials, or live DB ops
- No VEX / Trivy ignore renewal
- PR #428 untouched

## Independent assessments

### Security review

```text
SECURITY_REVIEW_VERDICT = PASS (prototype scope)
AGENT = security-review e33fee7d-eadc-4896-826c-3ccd11a60195
```

- C1 avoids volume ownership migration; refuses root; no `:U` / recursive repair.
- DS-0002 cleared without suppressions; does not authorize production VEX removal.
- Wrong-permission and root-start paths fail closed.
- Harness constrained to `${RUN_ID}-*` disposable resources.
- Pure C1 justified for greenfield; existing root-owned volumes remain a separate Founder migration.

### Architecture / recovery review

```text
ARCHITECTURE_RECOVERY_VERDICT = PASS
C1_FIT = YES
C2_NECESSITY_FOR_GREENFIELD = NO
RECOMMENDED_FOUNDER_SELECTION = C1
AGENT = architecture-recovery 4135ee71-870b-4c90-81ce-e3d03bbf9d67
```

- Layer 1 archive/backup/WAL/isolated-restore contracts held on disposable volumes.
- PG18 layout + restore-not-into-source-PGDATA observed.
- C2 not required for empty/new volumes; Docker and live root-volume migration remain open cutover gaps.
- Production-shaped Spaces (S3) repo path not exercised in this posix disposable proof.

## Reproduce

```bash
# From this worktree only
bash scripts/proof/pg-c1-disposable-proof.sh
```

## Committed run artifacts

Slim copies (no image tarball):

`docs/platform/operations/evidence/pg-c1-disp-20261024T060031Z-71079/`

