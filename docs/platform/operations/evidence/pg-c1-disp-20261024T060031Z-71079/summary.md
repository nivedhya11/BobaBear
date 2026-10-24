# PG-C1 disposable proof summary

- RUN_ID: `boba-pgc1-disp-20261024T060031Z-71079`
- STAMP: `20261024T060031Z`
- IMAGE_C1: `localhost/boba-bear-postgres:c1-nonroot`
- EXPECTED_HOST_UID_FOR_CONTAINER_999: `100998`
- DOCKER_AVAILABLE: `0`

## Matrix

| Case | Result | Note |
|---|---|---|
| docker_env | UNVERIFIED | docker CLI absent; rootless Podman only |
| image_user_postgres | PASS | Config.User=postgres |
| trivy_ds0002 | PASS | DS-0002 absent in unsuppressed image-config scan (tar input) |
| fresh_startup_archive_off | PASS | uid=999 user=postgres PGDATA=/var/lib/postgresql/18/docker |
| rootless_uid_mapping | PASS | container 999 -> host 100998 (subuid start 100000) |
| restart_same_volume | PASS | reused boba-pgc1-disp-20261024T060031Z-71079-pgdata |
| archive_on_startup | PASS | archive_mode enabled via C1 entrypoint |
| pgbackrest_stanza | PASS | stanza-create + check |
| pgbackrest_backup_info_verify | PASS | full backup + info + verify |
| wal_archival | PASS | archived_count or repo archive files present |
| isolated_restore | PASS | restored into boba-pgc1-disp-20261024T060031Z-71079-restore-pgdata; row verified |
| wrong_permission_fail_closed | PASS | exit=1; marker unchanged; no PGDATA created |
| refuse_root_start | PASS | exit=1 |
