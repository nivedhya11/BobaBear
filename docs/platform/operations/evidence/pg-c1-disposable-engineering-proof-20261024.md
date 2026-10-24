# PG-C1 disposable engineering proof (2026-10-24)

```text
TASK = PG-C1-DISPOSABLE-ENGINEERING-PROOF-R2 (Agent B) + PG-C1-WAL-RECOVERY-CLOSURE-R2 (Agent A, W2)
WAVE = BOBA-PREGTM-PARALLEL-EXECUTION-20261024 / BOBA Integration Readiness Wave W2 (issue #432)
WORKTREE = /home/ajoshi/repos/boba-bear-wave-b-pg
BRANCH = proof/pg-c1-disposable-20261024
EXACT_BASE = 00ef486e9dbeb1a30ba32e76fcd7b8b43507a53f
EXACT_HEAD = see "Revision history" below (latest row)
PR = https://github.com/nivedhya11/BobaBear/pull/431
RISK = R2
DELIVERY_MODE = PUBLISH_PR
PR_MERGE_TO_MAIN = NO
POSTGRES_C1_C2_SELECTION = NOT_GRANTED
POSTGRES_C1_PRODUCTION_SELECTION = NOT_GRANTED
SECURITY_EXCEPTION_RENEWAL = NO
TRIVY_OR_SCA_BYPASS = NO
DOCKER_ENGINE_PROOF = UNVERIFIED
S3_LIVE_REPO_PROOF = UNVERIFIED (render-only shape check PASS)
```

## Revision history

| Rev | HEAD | Change |
|---|---|---|
| 1 | `549703f10d759d53a7bb4cfe5b54634c655e51bd` | Initial C1 prototype + disposable matrix (Agent B). WAL case was an archive-count / any-file check; restore verified only the pre-backup row. |
| 2 | recorded in `AGENT_A_RESULT.md` and PR #431 head | WAL recovery closure (Agent A): specific-segment archive proof, owned recovery targets, restored post-backup marker, negative interrupted-archiving case, S3-shape render check, dependency reconciliation with PR #430. |

## ALIGNMENT_GATE (R2) — WAL recovery closure

```text
ALIGNMENT_GATE

Repository Authority: VERIFIED
Repository / Branch / HEAD (pre-mutation): /home/ajoshi/repos/boba-bear-wave-b-pg | proof/pg-c1-disposable-20261024 | 549703f10d759d53a7bb4cfe5b54634c655e51bd (origin/main 00ef486e9)
Vision Version: VISION-1
Roadmap Version: GTM-R190
State Version: STATE-R189
Architecture Version: ARCH-R23
Decision Register Version: DR-25 on origin/main and this branch (DR-26 / D-385-386 exist only on an unmerged staging-record branch; not applicable to this proof)
Product Delivery Version: PD-2
Product Definition: N/A — infrastructure / recovery runtime proof (not IMP-036J product stories)
Stories: N/A — non-story engineering proof
Acceptance Scenarios: N/A — disposable proof matrix (this document)
Golden Journeys: N/A
Testing Policy: TEST-1 (evidence over claims; initial failure preserved; no silent-retry proof)
Accepted Through: IMP-036I
Current Product Slice: IMP-036J (pendingAcceptance; lifecycle unchanged by this proof)
Task Slice: PG-C1 WAL recovery closure (specific post-backup segment archive + restored marker + negative)
Task Capability: IMP-037 recovery Layer 1 runtime compatibility; IMP-038 DS-0002 disposition evidence
Relevant Non-Goals: no managed PostgreSQL; no production/staging volume mutation; no VEX renewal; no production selection
Relevant ARCH-G Invariants: ARCH-G13 (PostgreSQL authoritative); ARCH-G26 (pilot = Docker Engine on Droplet; Podman is NOT production runtime, so Docker remains UNVERIFIED here)
Relevant Binding Decisions: D-374 / ADR-016; IMP-037 Layer 1 pgBackRest contract; VEX-TRIVY-001 (not renewed)
Task Assumptions: disposable uniquely named Podman volumes only; Docker CLI/daemon absent on proof host; no live Spaces credentials
Deferred Capabilities Touched: production postgres image cutover; staging/prod volume migration; live S3 repo drill
Semantic Scope: MAY MODIFY scripts/proof/pg-c1-disposable-proof.sh, proof/pg-c1/*, docs/platform/operations/evidence/pg-c1-*, test inventory; package.json/package-lock.json ONLY to restore baseline (remove duplicate undici/zod changes owned by PR #430). MUST NOT modify docker/postgres/*, vulnerability-exception register, VEX, PR #430 branch, any live volume. OUT OF SCOPE: production cutover, C1 selection.
Conflicts: NONE
Unverified Material Facts: Docker engine behaviour; live S3/Spaces archive-push + restore
Risk Level: R2
DELIVERY_MODE: PUBLISH_PR
Gate Result: PASS
```

## Objective

Establish whether a **non-root** PostgreSQL runtime (final `USER postgres`) can satisfy the existing IMP-037 recovery architecture **without unsafe ownership migration**, and — for the W2 closure — prove that **WAL written after the base backup actually reaches the repository and is recoverable**, with a negative case showing the proof cannot be faked by pre-backup archive activity.

## Prototype (proof-only; production Dockerfile unchanged)

| Artifact | Path |
|---|---|
| C1 Dockerfile | `proof/pg-c1/Dockerfile.c1-nonroot` (outside `docker/`; avoids production Trivy path trigger while VEX-TRIVY-001 is expired) |
| Non-root entrypoint | `proof/pg-c1/entrypoint-wrapper.sh` |
| Proof harness | `scripts/proof/pg-c1-disposable-proof.sh` |
| Run evidence (local, ignored) | `artifacts/pg-c1-proof/<RUN_ID>/` |
| Committed slim evidence | `docs/platform/operations/evidence/pg-c1-disp-<STAMP>-<pid>/` |

C1 contract:

- Final image `Config.User=postgres` (UID 999); entrypoint refuses UID 0
- No volume `chown` / no blanket `:U`
- Writable `/etc/pgbackrest`, `/etc/postgresql`, pgBackRest repo/log/spool
- PostgreSQL 18 `PGDATA=/var/lib/postgresql/18/docker`, volume mount `/var/lib/postgresql`
- Archive-off and archive-on (`BOBA_PGBACKREST_ARCHIVE`)
- pgBackRest config render via existing `boba-render-pgbackrest-conf`

## Why the Rev 1 WAL check was insufficient

Rev 1 recorded `wal_archival PASS` when `pg_stat_archiver.archived_count > 0` **or** any file existed under the repository archive path. Both are true as soon as the pre-backup segments (`…01`–`…03`) are archived, so the check passed **regardless of whether the post-backup `wal-marker` segment (`…04`) was ever archived**, and the restore step verified only the pre-backup row (`id=1`), which lives in the base backup and needs no WAL at all. Rev 2 demonstrates this concretely: `legacy_archive_count_check_insufficient` shows `archived_count=5 > 0` while segment `…05` is unarchived.

## Rev 2 WAL recovery closure design

1. **Distinct post-backup marker.** After `backup --type=full` + `info` + `verify`, a single autocommit `INSERT` writes `post-backup-marker-<RUN_ID>` (row `id=2`). Because it is committed after the backup, it can reach a recovery target **only** through archived WAL.
2. **Segment capture.** `pg_current_wal_insert_lsn()` is read before the insert and `pg_current_wal_lsn()` after the commit returns; both are mapped with `pg_walfile_name()`. The commit record lies within `[LSN_BEFORE, LSN_AFTER]`; every segment in that range is required (in practice one: `000000010000000000000004`).
3. **Forced switch.** `pg_switch_wal()`; the completed segment name is logged.
4. **Specific-segment verification.** `verify_segment_archived` PASSes only when the exact file `<SEG>-<sha1>.zst` exists under `repo-gen-1/archive/boba/18-1/<hi16>/` **and** `pg_stat_archiver.last_archived_wal >= SEG`. No count-based or any-file acceptance.
5. **Owned recovery target.** Source is stopped. A fresh volume is provisioned with an ownership marker (`.boba-recovery-target-owner = RUN_ID`), mirroring the recovery CLI `TARGET_OWNED_BY_RUN` rule; the restore job refuses a target not owned by the run or already initialised. pgBackRest config is rendered **into the target volume** so the generated `restore_command` keeps working after the one-shot job exits. The target starts with `archive_mode=off` (a recovery target must never push its new timeline into the source repository).
6. **Restored marker.** Target must leave recovery (`pg_is_in_recovery() = false`), `pg_last_wal_replay_lsn() >= MARKER_LSN`, the PostgreSQL log must contain `restored log file "<MARKER_SEG>" from archive`, and both `id=1` (`before-backup`) and `id=2` (`post-backup-marker-<RUN_ID>`) must be present.
7. **Negative — interrupted post-backup archiving.** Source restarted; repository archive path made unavailable (`chmod 000` by its non-root owner; no DAC override without root); `neg-unarchived-marker-<RUN_ID>` (row `id=3`) committed; `pg_switch_wal()`. The **same** `verify_segment_archived` must return FAIL within 30 s with `failed_count > 0` and `last_failed_wal = NEG_SEG`. Source stopped with the segment still pending; permissions restored by a one-shot helper (owner chmod, no root, no chown); a second owned target is restored: `id=2` present, `id=3` **absent**, replay LSN `< NEG_LSN`.
8. **S3-shaped repository (render-only).** `boba-render-pgbackrest-conf` is executed in the C1 image with synthetic placeholder values and `--network=none`: `repo1-type=s3`, `repo1-path=/repo-gen-1`, `repo1-s3-uri-style=path`, cipher `aes-256-cbc`; secret values are **not** written to the rendered file; missing credentials and identical Layer 1 / Layer 2 bucket both fail closed. No live provider request is made; live S3 archive-push/restore remains **UNVERIFIED**.

## Executed proof run (Rev 2)

```text
RUN_ID = boba-pgc1-disp-20261024T074915Z-112269
HOST_UID = 1000
subuid = ajoshi:100000:65536
EXPECTED_HOST_UID_FOR_CONTAINER_999 = 100998
VERIFIED_MAPPING = container UID 999 -> host UID 100998
POST_BACKUP_MARKER = post-backup-marker-boba-pgc1-disp-20261024T074915Z-112269  lsn=0/4007190  segment=000000010000000000000004
ARCHIVED_SEGMENT_FILE = 18-1/0000000100000000/000000010000000000000004-97a3ff5d1b395a787d5899b35d2d390f70f375df.zst
RESTORE_TARGET = boba-pgc1-disp-20261024T074915Z-112269-restore-pgdata (timeline 2, archive_mode=off, replay_lsn=0/5000000)
NEGATIVE_MARKER = neg-unarchived-marker-boba-pgc1-disp-20261024T074915Z-112269  lsn=0/5004918  segment=000000010000000000000005
NEGATIVE_ARCHIVER = failed_count=6 last_failed_wal=000000010000000000000005 (archived_count stayed 5)
NEGATIVE_TARGET = boba-pgc1-disp-20261024T074915Z-112269-restore-neg-pgdata (id=2 present, id=3 absent)
```

A prior run of the same Rev 2 harness (`boba-pgc1-disp-20261024T074334Z-104068`, before a cosmetic note-format fix and the addition of the `legacy_archive_count_check_insufficient` row) produced the identical PASS/UNVERIFIED matrix and identical LSN/segment values; it is not committed. No run of Rev 2 failed.

### Proof matrix (Rev 2)

| Case | Result | Note |
|---|---|---|
| docker_env | **UNVERIFIED** | docker CLI/daemon absent; rootless Podman only |
| image_user_postgres | PASS | `Config.User=postgres` |
| trivy_ds0002 | PASS | DS-0002 absent in unsuppressed image-config scan (pinned Trivy 0.69.3 on `podman save` tar; no `.trivyignore`) |
| fresh_startup_archive_off | PASS | UID 999; PG18 layout |
| rootless_uid_mapping | PASS | 999 → 100998 |
| restart_same_volume | PASS | same disposable named volume |
| archive_on_startup | PASS | archive_mode via C1 entrypoint |
| pgbackrest_stanza | PASS | stanza-create + check |
| pgbackrest_backup_info_verify | PASS | full backup + info + verify |
| post_backup_marker_committed | PASS | lsn=0/4007190 segment=…04 |
| wal_marker_segment_archived | PASS | exact file `…04-97a3ff5d….zst` present; `last_archived_wal` ≥ …04 |
| isolated_restore_recovery_complete | PASS | owned target; recovery finished; replay 0/5000000 ≥ marker; timeline 2; archive_mode=off; `…04` fetched from archive |
| restored_post_backup_marker | PASS | `before-backup` and `post-backup-marker-<RUN_ID>` both present |
| negative_interrupted_archive_detected | PASS | same verifier returned FAIL within 30 s; failed_count=6; last_failed_wal=…05 |
| legacy_archive_count_check_insufficient | PASS | archived_count=5 > 0 while …05 unarchived → legacy check would have been a false PASS |
| negative_restore_lacks_unarchived_marker | PASS | second owned target: archived marker present, unarchived marker absent |
| wrong_permission_fail_closed | PASS | host-owned bind (UID 1000) fails; marker unchanged; no PGDATA created |
| refuse_root_start | PASS | `--user 0:0` rejected |
| s3_repo_shape_render | PASS | render-only; `repo1-type=s3`; secrets not written; missing/same-bucket fail closed |
| s3_live_repo | **UNVERIFIED** | no live Spaces credentials; S3 archive-push/restore not exercised |

**Platform matrix verdict:** Podman rootless disposable matrix **PASS** (18 PASS, 2 UNVERIFIED, 0 FAIL). Docker **UNVERIFIED**. Live S3 **UNVERIFIED**. Do **not** call the multi-engine or production-shaped repository matrix PASS.

## Trivy DS-0002

- Scan mode: image-config misconfig only, severity HIGH/CRITICAL
- Suppression: **none** (no `.trivyignore`, no VEX renewal)
- Input: `podman save` tarball (snap Trivy cannot see rootless `podman.sock`)
- Result: **DS-0002 ABSENT** on `boba-bear-postgres:c1-nonroot` (extract committed as `trivy-ds0002-extract.json`)

This does **not** authorize removing VEX-TRIVY-001 from the production root image until Founder selects C1 cutover.

## C2 investigation

C1 succeeded on **fresh disposable empty/named volumes** owned by the mapped non-root UID. A scoped C2 root initializer is **not required** for greenfield disposable / new-volume paths.

C2 would only become relevant for **existing root-initialized volumes** (container UID 0 → host UID 1000 under this rootless map). Migrating those without an authorized plan implies ownership rewrite — **out of scope and unsafe** for this proof. No C2 initializer image was built.

## Recommended Founder selection (NOT GRANTED)

```text
RECOMMENDED_SELECTION = C1_PURE_NONROOT_RUNTIME
POSTGRES_C1_C2_SELECTION = NOT_GRANTED        # Founder must grant
POSTGRES_C1_PRODUCTION_SELECTION = NOT_GRANTED # Founder must grant
```

**Rationale**

1. Pure C1 satisfies Layer 1 recovery on disposable empty volumes: startup, restart, stanza/backup/verify, **specific post-backup WAL segment archive**, isolated restore **containing post-backup data**.
2. DS-0002 clears on the C1 image without exception renewal.
3. Wrong-permission paths fail closed without silent data modification; interrupted archiving is detected rather than masked.
4. Rootless mapping is compatible (999 → 100998); incompatibility must not be assumed.
5. C2 one-shot bootstrap is unnecessary for new volumes.

**Cutover caveats (Founder-owned)**

- Do not point C1 at existing root-owned staging/prod volumes without an explicit migration decision.
- Production `docker/postgres/Dockerfile` remains `USER root` until selection + follow-on cutover work.
- Docker Engine (ARCH-G26 pilot runtime) proof remains UNVERIFIED on this host; a Docker disposable rerun is required before claiming multi-engine PASS. Podman ≢ Docker.
- Live Spaces (S3) archive-push / archive-get / restore remains UNVERIFIED; only the rendered config shape and fail-closed credential rules were exercised.

## Dependency reconciliation with PR #430

Rev 1 commit `33c98ddc4` bumped `zod` 4.4.3→4.6.7 and added `undici@7`/`undici@8` overrides so the npm SCA gate passed on this branch. That remediation is **owned by PR #430** (`security/undici-zod-remediation-20261024`, head `43067fbbe`). Rev 2 restores `package.json` / `package-lock.json` to the `origin/main` baseline (`00ef486e9`) in a forward commit — no history rewrite, no force-push, no SCA exception added. Consequence: until #430 merges to `main`, the Security SDLC job's SCA step on this branch reports the **same HIGH advisories as the baseline** (inherited, not introduced). A stacked approach (merging #430's branch into this one or retargeting the PR base) was considered and rejected to keep this PR strictly proof-only and uncoupled from #430's evolution; after #430 lands, a routine merge of `main` into this branch restores a green SCA step.

## Hard restrictions observance

- No touch of `boba-staging`, production, or shared `postgres-data` volumes; all resources are `${RUN_ID}-*` and removed on exit (verified 0 leftover containers/volumes)
- No blanket `:U`, recursive ownership repair, production credentials, or live DB ops
- No VEX / Trivy ignore renewal; no SCA bypass
- PR #428 / PR #430 branches untouched; production `docker/postgres/*` unchanged

## Independent assessments

### Rev 1 (prototype scope)

```text
SECURITY_REVIEW_VERDICT = PASS (prototype scope)   AGENT = security-review e33fee7d-eadc-4896-826c-3ccd11a60195
ARCHITECTURE_RECOVERY_VERDICT = PASS               AGENT = architecture-recovery 4135ee71-870b-4c90-81ce-e3d03bbf9d67
```

### Rev 2 (WAL recovery closure)

Recorded in `.wave-20261024-w2/AGENT_A_RESULT.md` (primary checkout, untracked wave artifact) and in the PR #431 conversation.

## Reproduce

```bash
# From this worktree only (rootless Podman; ~4.5 min with cached image layers)
bash scripts/proof/pg-c1-disposable-proof.sh
```

## Committed run artifacts

Slim copies (no image tarball, no full Trivy JSON):

- Rev 1: `docs/platform/operations/evidence/pg-c1-disp-20261024T060031Z-71079/`
- Rev 2: `docs/platform/operations/evidence/pg-c1-disp-20261024T074915Z-112269/` (`matrix.tsv`, `summary.md`, `proof.log`, `restore-target.log`, `restore-target-negative.log`, `s3-shape-render.conf`, `trivy-ds0002-extract.json`, `image-user.txt`)
