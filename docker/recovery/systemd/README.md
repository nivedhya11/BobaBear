# IMP-037 recovery systemd unit/timer templates

These files are **templates** for operator-controlled host scheduling of Layer 1
and Layer 2 backup oneshots. They are **not** installed, enabled, or started by
the IMP-037 repository implementation packet.

```text
INSTALL_PERFORMED_BY_PACKET: NO
R3_OPERATOR_ACTION_REQUIRED: YES
```

## Units

| Unit | Schedule |
|---|---|
| `boba-recovery-layer1-full.timer` | weekly `Sun *-*-* 02:15:00` + `RandomizedDelaySec=15m` |
| `boba-recovery-layer1-diff.timer` | daily `*-*-* 02:45:00` |
| `boba-recovery-layer2-logical.timer` | daily `*-*-* 03:15:00` |

Each `.service` is `Type=oneshot`, uses `WorkingDirectory=%h/boba-bear-platform`,
optional `EnvironmentFile=-%h/boba-bear-platform/.env.recovery.local`, and runs
through `scripts/recovery/systemd/run-with-flock.sh` so heavy ops share the
host-local flock. Continuous WAL archive-push must **never** use that flock.

Layer 1 units invoke `npm run recovery -- backup layer1 --source-class=...`.
That CLI runs `docker compose exec -T postgres pgbackrest` inside the PostgreSQL
service. Do not point ExecStart at a host `pgbackrest` binary or a backup sidecar.

### Explicit source classification (required)

Scheduled units expand an explicit non-secret env var into the CLI flag:

```text
BOBA_RECOVERY_SOURCE_CLASSIFICATION=production|staging
ExecStart=... --source-class=${BOBA_RECOVERY_SOURCE_CLASSIFICATION}
```

Set the variable in `.env.recovery.local` (loaded via `EnvironmentFile=`). systemd
substitutes it into `--source-class` before exec. An unset/empty value reaches the
CLI as an empty class and is **BLOCKED** (no silent production default). Presence
of the variable is not authority by itself — the CLI still validates
`production|staging` and contradiction markers.

Do **not** hardcode `production` in the unit templates.

## Operator install (R3 only — do not automate from CI)

1. Confirm repository path matches `WorkingDirectory` / `%h/boba-bear-platform`.
2. Set `BOBA_RECOVERY_SOURCE_CLASSIFICATION` explicitly in `.env.recovery.local`.
3. Copy or symlink units into `/etc/systemd/system/` (or user systemd).
4. `systemctl daemon-reload`
5. `systemctl enable --now boba-recovery-layer1-full.timer` (and sibling timers)
6. Validate: `npm run recovery:systemd:validate`

## Validation without install

```bash
npm run recovery:systemd:validate
node scripts/recovery/cli.mjs systemd validate --json
```

When `systemd-analyze` is absent, validation falls back to required-key parsing.
