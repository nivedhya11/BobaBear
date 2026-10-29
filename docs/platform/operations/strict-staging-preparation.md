# Strict staging preparation

Supporting operator contract for the Founder-approved strict-staging direction.
This document does not deploy staging, accept IMP-036J, accept IMP-037, or activate
IMP-038 or IMP-039.

```text
STRICT_STAGING_DIRECTION = FOUNDER_APPROVED
LIVE_STAGING_DEPLOYMENT = NOT_AUTHORIZED
RECOVERY_PROOF_BINDING = DESIGN_DEPENDENCY
CANDIDATE_PREPARATION_COMMAND = npm run env:staging:prepare-candidate
CANDIDATE_PREPARATION_EXECUTION = NOT_AUTHORIZED
ACTIVATION_REQUIRES_ASSERT_PREFLIGHT = YES
```

## Identities

1. Authoritative source repository: `/home/ajoshi/repos/boba-bear-platform`.
2. Independently accepted Git commit and tree: pinned `refs/heads/main` on
   `nivedhya11/BobaBear`, equal to local `HEAD` and `HEAD^{tree}`.
3. Isolated artifact context: a disposable `git archive` under the system temp
   directory, verified, then removed. It is not the protected checkout.
4. Candidate image: built only by the separate preparation command, from that
   archive, then scanned. The evidence record binds source SHA, source tree,
   image id, and digest. It is written outside the protected checkout.
   Preparation does not authorize deployment.
5. Running staging container: must match that recorded revision and image id.
   Project `boba-staging`. Volume `boba-staging_postgres-data` is preserved.
   Activation does not build a new image.

`protectedCheckoutUsed` is true when the artifact context realpath is inside the
canonical checkout. A dry-run from that checkout can still observe an isolated
context. An operator boolean cannot set the flag false.

## Two phases

Phase A is `npm run env:staging:prepare-candidate`. It checks source isolation,
strict configuration, and the current publishing policy, then may materialize a
verified archive, build candidate images, scan them, and write image-security
evidence outside the protected checkout. It does not call
`assertPreflightAllowsDeployment`. It does not stop containers, migrate,
bootstrap, or compose up. `PREPARATION_ELIGIBLE` is not deployment
authorization. Running the command is not authorized by this document.

Phase B is `npm run env:staging:deploy`. Activation (stop, env write, migrate,
bootstrap, compose up) runs only after `assertPreflightAllowsDeployment`.
Full preflight requires image-security evidence bound to this source SHA, tree,
image id, and digest, and a fresh inspect that matches that evidence. Missing,
stale, or rebound evidence blocks activation before any runtime mutation.
Preflight does not build images. Activation does not build a replacement image
after that gate. Source CI does not supply image-security proof.

## Strict environment

When `BOBA_BEAR_ENV=staging`, projection requires one HTTPS non-loopback origin
shared by `BOBA_BEAR_PUBLIC_ORIGIN`, `BOBA_BEAR_AUTHORIZED_STAGING_ORIGIN`,
`CUSTOMER_AUTH_BASE_URL`, and `WORKFORCE_AUTH_BASE_URL`; explicit
`BOBA_BEAR_ALLOW_UNSAFE_ADAPTERS=false`; a release; trusted-proxy hops `1`;
and `BOBA_BEAR_STAGING_TLS_TERMINATION` equal to a shipped allowlist entry.

The shipped allowlist is empty. A token in that allowlist is a configuration
assertion, not independent DNS or TLS evidence. Hostname, DNS authority,
certificate method, and TLS termination point are not invented here. Local
`docker:env:init` remains the local contract and is not a staging fallback.
Every runtime service must carry the same valid public origin; a missing or
malformed service origin is not ignored when other services agree.

## Recovery and database

The live collector keeps `RECOVERY_PROOF_BINDING = DESIGN_DEPENDENCY`. A
qualifying backup record is not a staging restore checkpoint. The checkpoint
qualifier can accept a complete synthetic chain only in isolated tests, and
that result has no operational authority.

Locked rules already applied by that qualifier:

- Both IMP-037 layers, linked by backup `RUN_ID` and artifact checksum.
- Fresh run-owned PostgreSQL 18 recovery target, distinct from `boba-staging`.
- Image rollback or forward correction. Database restore is not routine rollback.
- Exact candidate SHA and tree. Unknown migration ledger labels block.
- Existing Layer 1 / Layer 2 / RPO age limits, rechecked at evaluation time.

These Founder decisions remain, so the live binding cannot pass:

- `STAGING_EVIDENCE_ROOT_UNNAMED` — proposed private root is not selected.
- `STAGING_DATABASE_VOLUME_IDENTITY_UNBOUND` — volume name is known; the live
  cluster system identifier has not been observed.
- `STAGING_FRESHNESS_WINDOW_UNDECIDED` — no extra staging restore-proof window
  is adopted here.
- `LEDGER_STATE_MAPPING_UNDECIDED` — hash comparison is not a known-safe label.

Database probes that compare migration hashes do not emit `APPLIED_CURRENT` or
`LEDGER_CURRENT`. Duplicate auth-account checks return a group count only and
are not run against the persistent staging database by this preparation change.

## Secret files

New secret files are created mode `0600`. Existing insecure files are rejected
and not chmodded by preflight or by the staging copy. Separate authorization is
required before anyone changes live permissions. That later action is limited to
`lstat`, then `chmod 600` on a regular file or `chmod 700` on `.env.staging`,
then `lstat` again. Do not print file contents. Paths:

- `/home/ajoshi/repos/boba-bear-platform/.env.docker.local`
- `/home/ajoshi/repos/boba-bear-platform/.env.local`
- `/home/ajoshi/repos/boba-bear-platform/.env.runtime.docker.local`
- `/home/ajoshi/repos/boba-bear-platform/.env.migration.docker.local`
- `/home/ajoshi/repos/boba-bear-platform/.env.customer-auth.docker.local`
- `/home/ajoshi/repos/boba-bear-platform/.env.workforce-auth.docker.local`
- `/home/ajoshi/repos/boba-bear-platform/.env.customer-commerce.docker.local`
- `/home/ajoshi/repos/boba-bear-platform/.env.operations.docker.local`
- the same names under `/home/ajoshi/repos/boba-bear-platform/.env.staging/`

## Payment

Staging `razorpay` accepts only a `rzp_test_` key id with the existing secret
fields. `rzp_live_` and ambiguous key ids fail before an HTTP client is built.
Production acceptance of either key prefix is unchanged. `disabled` still
cannot seal an order.

## Gates that remain closed

Gate A needs an authorized hostname, DNS, certificate, TLS termination token,
secret-permission remediation, and verified test payment credentials.

Gate B needs an authorized read-only staging database preflight, a Founder
decision that binds restore proof to this database and volume, and a ledger
label mapping.

Gate C needs a fresh correlated image from a separately authorized preparation,
a complete preflight PASS, and explicit deployment authorization. Preparation
evidence alone does not open this gate.

Gate D is Founder Functional UAT, Founder Experience UAT, and formal acceptance.
None of these gates authorizes the next.
