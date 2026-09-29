---
name: boba-founder-uat
description: Runs the BOBA Founder UAT exact-candidate workflow, staging image checks, and acceptance-evidence fields. Use before Founder UAT deployment or Founder-UAT acceptance evidence. Does not grant the Founder verdict.
---

# BOBA Founder UAT

## Authority

This procedure is subordinate to `AGENTS.md`. It is non-authoritative. Canonical authorities named by `AGENTS.md` prevail. On canonical conflict, STOP affected work. Do not reinterpret the conflict.

```text
FOUNDER_UAT_VERDICT_OWNER = HUMAN_FOUNDER
AGENT_MAY_NOT_SELF_GRANT_PASS = YES
```

The kernel in `AGENTS.md` remains the source of that authority boundary. This skill does not grant `FOUNDER_UAT = PASS`, `COMPLETE_AND_ACCEPTED`, or an `acceptedThrough` advance.

## Operational rule

This procedure is an operational / agent rule. It does not itself change product acceptance status in `ROADMAP.md` or `STATE.md`; it governs how future acceptance evidence must be produced when founder UAT is required. Founder UAT verdict and acceptance reconciliation are R3.

- For any capability that materially changes customer-visible behavior, materially changes operator-visible behavior needing interactive validation, is explicitly marked `FOUNDER_UAT_REQUIRED = YES`, or is requested by the founder for UAT, final canonical acceptance requires a separate founder UAT gate in addition to independent technical acceptance.
- Required lifecycle for those capabilities:

```text
IMPLEMENTATION_COMPLETE
→ INDEPENDENT_TECHNICAL_ACCEPTANCE
→ UAT_DEPLOYMENT
→ FOUNDER_UAT
→ ACCEPTANCE_RECONCILIATION
```

- `COMPLETE_AND_ACCEPTED` must not be claimed, and `acceptedThrough` must not advance through that capability, until the required founder UAT gate has passed and reconciliation records it.
- Founder UAT must exercise the **exact** implementation candidate that passed independent technical acceptance. Candidate identity must include at minimum:

```text
CANONICAL_REPOSITORY_PATH
BRANCH
HEAD
WORKING_TREE_FINGERPRINT
```

- `WORKING_TREE_FINGERPRINT` is mandatory provenance because BOBA development may intentionally validate uncommitted but authorized working-tree content. `HEAD` alone is insufficient proof of UAT provenance.
- Before any UAT deployment, verify canonical repository path, branch, `HEAD`, and content-sensitive working-tree fingerprint, and confirm they exactly match the independently accepted candidate. If any of those differ, UAT deployment must stop and the modified candidate must return through the applicable validation and technical-acceptance gates before founder UAT.
- Founder UAT runtime is rootless **PODMAN_WSL**. The sole persistent Founder project is `boba-staging`. Founder staging must be built from an exact merged-main candidate: canonical repository, `branch=main`, `HEAD=origin/main`, and clean tracked source. Its artifact build context must be materialized from that exact merged Git tree, not the live worktree. Untracked evidence may remain outside that isolated build context. Do not deploy an unmerged branch, dirty tracked source, an older clone, `/mnt/c`, or a stale image as Founder-UAT evidence.
- UAT deployment evidence must identify the source candidate and the deployed artifact as far as current tooling allows, including source repository, branch, `HEAD`, fingerprint, image name, image ID/digest when available, container identity, deployment health, and the exact UAT URL.
- The UAT image used for founder validation must be freshly built by repository-owned Podman WSL tooling and record the merged SHA (for example `BOBA_BUILD_SHA` and OCI revision metadata). A stale pre-existing image is not sufficient UAT evidence.
- After deployment, verify the running service is actually using the newly built image. If the deployed image ID does not match the running container image ID, founder UAT must not proceed.
- Only the founder/user may provide the final interactive UAT verdict. Implementation agents must never self-declare `FOUNDER_UAT = PASS`.
- Where Founder UAT is required under PD-2, `FOUNDER_UAT = FUNCTIONAL_UAT + EXPERIENCE_UAT`. Experience UAT considers discoverability, first impression, hesitation, clarity, trust, friction, recovery, content, mobile behaviour, brand coherence, and Experience Intent. This does not weaken exact-candidate provenance.
- Governance-only, documentation-only, architecture-definition, repository-maintenance, and internal tooling tasks with no interactive acceptance surface do not automatically require Podman/founder UAT. Record applicability explicitly as `FOUNDER_UAT_REQUIRED = YES | NO` in the relevant future acceptance evidence.
- Current applicability: **IMP-028B — Customer Menu Projection + Discovery** is `FOUNDER_UAT_REQUIRED = YES` before `COMPLETE_AND_ACCEPTED` because it materially changes customer `/order`, Menu serving, category navigation, product-card/display-price presentation, and the Add / Cart customer flow. Independent technical acceptance alone is insufficient for final acceptance of IMP-028B. **IMP-035 — Initial Administration Capabilities** is likewise `FOUNDER_UAT_REQUIRED = YES` before `COMPLETE_AND_ACCEPTED` because it creates operator-visible administration behavior.
