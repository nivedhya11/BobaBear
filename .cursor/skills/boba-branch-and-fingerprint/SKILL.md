---
name: boba-branch-and-fingerprint
description: Computes the governed BOBA working-tree fingerprint and performs post-merge local branch hygiene. Use before a governed fingerprint or before deleting a completed task branch after merge.
---

# BOBA branch hygiene and fingerprint

## Authority

This procedure is subordinate to `AGENTS.md`. It is non-authoritative. Canonical authorities named by `AGENTS.md` prevail. On canonical conflict, STOP affected work. Do not reinterpret the conflict.

Repository safety invariants remain in `AGENTS.md`, including no force-push or history rewrite without R3, no unreviewed direct `main` mutation, preservation of dirty or unique work, and no deletion of unique or uncertain branch work. This skill does not authorize those actions.

## Which reference

- Governed working-tree fingerprint: [references/fingerprint.md](references/fingerprint.md)
- Post-merge local branch hygiene: [references/post-merge.md](references/post-merge.md)

Read the applicable reference before the action. If it cannot be read, STOP the affected action.

```text
BRANCH_CLEANUP_ONLY_AFTER_REQUIRED_MACHINE_PROOF = YES
DO_NOT_DELETE_UNIQUE_OR_UNCERTAIN_BRANCH_WORK = YES
WORKING_TREE_FINGERPRINT_COMMAND = npm run working-tree:fingerprint
PORCELAIN_STATUS_HASH_IS_NOT_FINGERPRINT = YES
```
