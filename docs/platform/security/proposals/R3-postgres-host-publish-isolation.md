---
Status: PROPOSAL — R3 operational change (not authorized by Trivy DS-0002 gate repair)
Authority required: Founder / R3 (compose networking + staging/production bind posture)
Compliance claim: NONE
Related: IMP-038 §15; IMP-039 origin/firewall ownership; compose.yaml postgres ports
---

# R3 proposal — PostgreSQL host publish isolation

## Observation (source-verified; reachability unproven)

Recorded during the Trivy DS-0002 security-gate repair. **No compose or live port
binding was modified under that authorization.**

| Fact | Evidence | Certainty |
|---|---|---|
| Default Compose publishes PostgreSQL on all host interfaces via `${POSTGRES_HOST_PORT:-5433}:5432` | `compose.yaml` `services.postgres.ports` | VERIFIED |
| Staging default host port is `5433` when `POSTGRES_HOST_PORT` is unset | Same mapping default | VERIFIED |
| External internet reachability of any live staging/production listener | Not probed (network mutation / live staging ops out of scope) | UNVERIFIED |
| Production firewall / DB isolation evidence that would compensate for host publish | Not available in this task’s evidence set; IMP-039 owns live DO firewall realization | UNAVAILABLE |

```text
DEFAULT_COMPOSE_PUBLISHES_POSTGRES_ALL_INTERFACES: YES
STAGING_PORT_5433_BINDS_ALL_INTERFACES_WHEN_UNSCOPED: YES
EXTERNAL_REACHABILITY: UNPROVEN
PRODUCTION_FIREWALL_DB_ISOLATION_EVIDENCE: UNAVAILABLE
```

Compose short-syntax `HOST:CONTAINER` without an explicit bind address publishes on
`0.0.0.0` (all IPv4 interfaces) on Docker/Podman. This is a **host publish posture**
finding, orthogonal to image-config DS-0002 (root USER).

## Proposed correction (requires explicit R3 authorization)

Prefer one of the following, chosen by Founder/ops with environment inventory:

1. **Loopback-only publish (dev/staging default)**  
   Change mapping to `127.0.0.1:${POSTGRES_HOST_PORT:-5433}:5432` so the host port is
   not reachable from other LAN/WAN interfaces.
2. **Remove host publish for shared/staging profiles**  
   Keep Postgres on the Compose network only; require `podman exec` / jump-host /
   approved admin path for SQL access.
3. **Production**  
   Ensure no public Droplet publish of `5432`/`5433`; rely on DO Cloud Firewall +
   private network (IMP-039 ownership for live firewall mutation). Do not treat
   Compose defaults as production exposure proof without inventory.

## Compatibility impact

| Consumer | Impact if loopback-scoped or unpublished |
|---|---|
| Local app containers on Compose network | None (service DNS `postgres:5432` unchanged) |
| Host-side `psql` / GUI on `localhost:5433` | Remains OK under option 1; breaks under option 2 unless exec path documented |
| Remote operator laptops targeting host:5433 | Breaks; require VPN/jump/SSH tunnel |
| CI jobs using Compose network service name | None |
| Existing Founder-staging runbooks assuming LAN bind | May need runbook update |

## Rollback

Revert the Compose port mapping commit / redeploy previous Compose file. No data
migration. Confirm `podman/docker compose ps` port column matches the prior publish
mode before closing the change.

## Non-goals of this proposal document

- Does **not** authorize the change.
- Does **not** renew `VEX-TRIVY-001`.
- Does **not** modify live staging/production listeners.
- Does **not** claim external reachability or compliance certification.
