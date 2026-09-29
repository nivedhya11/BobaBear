# Governed working-tree fingerprint

Subordinate to `AGENTS.md`. Non-authoritative. Canonical authorities named by `AGENTS.md` prevail. On canonical conflict, STOP. Do not reinterpret the conflict.

Canonical command: `npm run working-tree:fingerprint` (`scripts/working-tree-fingerprint.mjs`).

`WORKING_TREE_FINGERPRINT` is **content-sensitive** across tracked working-tree files and non-ignored untracked repository files (paths and contents). It is deterministic, path-sensitive, and order-independent with respect to filesystem enumeration. It respects `.gitignore`. It does not hash `.git` object-database bytes, `.git` logs, the `.git/index` file, `node_modules`, or other ignored/build outputs.

Do not substitute `git status --porcelain | sha256sum` (or hashing porcelain paths only when they are files). Default porcelain reports an already-untracked directory as one entry, so edits or additions underneath that directory do not change a porcelain-only hash and are not exact-content authority.

`npm run project:consistency` emits the current content-sensitive fingerprint as an informational finding. `npm run governance:fingerprint` remains a separate canonical-document manifest hash.

```text
WORKING_TREE_FINGERPRINT_COMMAND = npm run working-tree:fingerprint
PORCELAIN_STATUS_HASH_IS_NOT_FINGERPRINT = YES
```

Governed milestones that require provenance, including Founder UAT exact-candidate identity, use this command. `HEAD` alone is not that fingerprint.
