# PG-C1 production-candidate proof (2026-10-24)

```text
TASK = PG-C1-ENGINE-RECOVERY-SECURITY-R2
WAVE = BOBA-C1-GTM-PROOF-SOURCE-20261024
WORKTREE = /home/ajoshi/repos/boba-bear-c1-pg-proof
BRANCH = proof/pg-c1-engine-recovery-20261024
CANDIDATE_SOURCE_SHA = 27be227a1753d5a3897b186c2a2f9bb7650c317d
CANDIDATE_STATUS = FINAL
CANDIDATE_PR = https://github.com/nivedhya11/BobaBear/pull/448
IMAGE_REF = localhost/boba-bear-postgres:c1-proof-b-27be227a1753
IMAGE_ID = 7aa79098f94e2f20bd4e1735dac0363397fc17355d0e340572565fa7ef6740d5
ENGINE = podman 4.9.3
DOCKER_ENGINE = UNVERIFIED
S3_LIVE_SPACES = UNVERIFIED
VEX_CHANGED = NO
TRIVY_IGNORE_PASSED = NO
DOCKER_POSTGRES_DIFF = NO
SECURITY_EXCEPTION_RENEWAL = NO
```

## ALIGNMENT_GATE

```text
ALIGNMENT_GATE

Repository Authority: VERIFIED
Repository / Branch / HEAD (pre-mutation): /home/ajoshi/repos/boba-bear-c1-pg-proof | proof/pg-c1-engine-recovery-20261024 | a6155378b799e06a95b28c593ac1a340d7ca9245
Vision Version: VISION-1
Roadmap Version: GTM-R190
State Version: STATE-R189
Architecture Version: ARCH-R23
Decision Register Version: DR-25
Product Delivery Version: PD-2
Product Definition: N/A — infrastructure / recovery runtime proof (not IMP-036J product stories)
Stories: N/A — non-story engineering proof
Acceptance Scenarios: N/A — disposable proof matrix
Golden Journeys: N/A
Testing Policy: TEST-1 (evidence over claims; initial harness abort preserved)
Accepted Through: IMP-036I
Current Product Slice: IMP-036J
Task Slice: PG-C1-ENGINE-RECOVERY-SECURITY-R2
Task Capability: disposable proof of the production-shaped PostgreSQL image at Agent A's FINAL sha
Relevant Non-Goals: no managed PostgreSQL; no production or staging volume mutation; no VEX renewal; no Docker equivalence; no C1 production selection
Relevant ARCH-G Invariants: ARCH-G13 (PostgreSQL authoritative); ARCH-G26 (pilot runtime is Docker Engine; Podman is not that runtime)
Relevant Binding Decisions: D-374 / ADR-016; IMP-037 Layer 1 pgBackRest contract; VEX not renewed
Task Assumptions: build docker/postgres/Dockerfile from A's sha via git archive; disposable Podman resources only; Docker CLI absent; no live Spaces credentials
Deferred Capabilities Touched: none implemented (cutover, volume migration, and live S3 remain deferred)
Semantic Scope: proof script, evidence, and test inventory if the generator requires it. Production Dockerfile, VEX, and .trivyignore were not modified.
Conflicts: NONE
Unverified Material Facts: Docker Engine behaviour; live S3/Spaces archive-push and restore
Risk Level: R2
DELIVERY_MODE: PUBLISH_PR
Gate Result: PASS
```

## What was built

The candidate image is Agent A's production Dockerfile at FINAL sha `27be227a1753d5a3897b186c2a2f9bb7650c317d`, archived with `git archive` into `/tmp/boba-c1-proof-<sha>`. The proof did not check out `fix/postgres-c1-nonroot-runtime-20261024`. The old proof Dockerfile was not the candidate.

`Config.User=postgres`. A default container `id` is `999(postgres)`. Rootless host mapping for container UID 999 is host UID 100998 (`subuid` start 100000).

## Harness abort kept separate

`pg-c1-prod-candidate-20261024T171004Z/` passed image UID, fresh start, wrong-owner refusal, and root refusal, then stopped. Snap Trivy cannot read `/tmp`, so the image tar saved there was invisible. The result parser then exited and the cleanup trap removed the disposable database before backup and restore. That directory is the initial failure. It is not the published matrix.

The complete run is `pg-c1-prod-candidate-20261024T171813Z/`. It reused the same image id. The tar for that scan was written under the evidence directory, which the snap can read, and was deleted after the scan.

## Podman matrix

Engine `podman 4.9.3`. This is additional evidence. It is not a Docker pass.

| Row | Engine | Result | Evidence |
|---|---|---|---|
| final_image_uid | podman | PASS | `Config.User=postgres`, runtime uid 999 |
| fresh_start_restart | podman | PASS | new volume owned by 999 inside and 100998 on the host; restart ready; no `:U` |
| volume_ownership_fail_closed | podman | PASS | host-owned bind exit 1; sentinels unchanged; log refuses ownership repair |
| forced_root_rejection | podman | PASS | `--user 0` exit 1; `refusing to start as root` |
| pgbackrest_full_backup | podman | PASS | stanza-create, check, full backup, info, verify |
| post_backup_wal_segment | podman | PASS | LSN `0/5006B50` file `000000010000000000000005-2968a326826d0dceec40080157ad731a78351567.zst` |
| isolated_restore_marker | podman | PASS | restored row is the post-backup marker; replay LSN `0/7000000` >= `0/5006B50` |
| interrupted_archive_failure | podman | PASS | verifier failed for `...0007`; `failed_count=24`; `last_failed_wal=...0007`; second restore lacks the second marker; `archived_count=7` would have been a false PASS |
| cleanup | podman | PASS | script exit 1 left two exited containers; follow-up `podman rm -f` exit 0; final lists empty; image tag removed exit 0 |
| trivy_unsuppressed | podman image / snap trivy 0.52.2 | PASS | DS-0002 absent; empty ignore file; VEX not passed; 86 HIGH/CRITICAL package findings recorded and not waived |
| s3_synthetic_render | podman, `--network=none` | PASS | `repo1-type=s3`; secret not written; missing credentials and same-bucket render fail; archive=1 incomplete S3 exits 1 and does not create PGDATA |
| docker_engine | — | UNVERIFIED | `DOCKER_ENGINE=UNVERIFIED`. Docker CLI is absent. |
| s3_live_spaces | — | UNVERIFIED | `S3_LIVE_SPACES=UNVERIFIED`. No credentials and no bucket changes. |

Archive disabled with incomplete S3 became ready. The entrypoint fail-closes incomplete Spaces config when archive is enabled. It does not consult that config when archive is disabled. That is the contract exercised here.

Podman totals for the published run: 11 PASS, 2 UNVERIFIED, 0 FAIL.

## Trivy

Direct scan of this image only: vuln, misconfig, and secret, plus image-config misconfig. Severity filter was not used to hide DS-0002. The repository `.trivyignore` was not passed. No VEX file was passed. DS-0002 is absent. The scan also reported 86 HIGH/CRITICAL package findings. Those findings are not waived by this proof. This scan is not the six-image CI gate.

## Cleanup

Run id `c1-proof-b-27be227a1753-171813`. The script's own cleanup left exited containers `bad-owner` (`f1fd857bd9a4…`) and `root` (`49ddc4d75587…`). Follow-up `podman rm -f` of those IDs exited 0. A later list of containers and volumes named `c1-proof-b-27be227a1753` was empty. `podman rmi` of `localhost/boba-bear-postgres:c1-proof-b-27be227a1753` exited 0. The image id above is the id that was tested, recorded before removal.

No staging project, live database, or Spaces bucket was changed.
