# Post-merge local branch hygiene

Subordinate to `AGENTS.md`. Non-authoritative. Canonical authorities named by `AGENTS.md` prevail. On canonical conflict, STOP. Do not reinterpret the conflict.

This is local workspace hygiene for the completed task branch. It does not authorize deleting unrelated remote branches. Remote head deletion after merge remains the separate branch-lifecycle rule in `AGENTS.md`, including GitHub automatic head-branch deletion.

`main` is permanent. Explicitly required deployment branches may remain only while actively used. Normal task, feature, fix, chore, and governance branches are short-lived and their remote head must be deleted after merge; GitHub automatic head-branch deletion must remain enabled. Close and delete stale, abandoned, or superseded unmerged branches after verifying their unique work is not required. Retain a non-main branch only for a concrete active or future purpose. Git history and merged pull requests are the historical archive. Never delete genuinely required unique unmerged work without first explicitly resolving it.

After a task pull request is merged and the required post-merge CI and CodeQL evidence has passed:

```text
git switch main
git fetch origin --prune
git pull --ff-only
git branch -d <completed-task-branch>
```

If `git branch -d` refuses:

1. Do not immediately force-delete.
2. First verify the pull request is merged or deliberately superseded, and inspect whether the local branch contains unique work.
3. Run `git cherry origin/main <completed-task-branch>`. Any line beginning with `+` means that commit is not in `origin/main`. Preserve the branch and STOP. Do not force-delete.
4. A cherry result with no `+` lines is one signal only. It must not be treated as sufficient proof by itself under squash or rebase merge histories.
5. Inspect commit and content equivalence as necessary.
6. Only after proving there is no unique work worth preserving:

```text
git branch -D <completed-task-branch>
```

Additional mandatory safety:

- Never delete an open or unmerged task branch merely because another task finished.
- Never delete a branch with known or uncertain unique work.
- Never delete an active investigation or candidate branch that belongs to another gate or task.

Final desired local state after successful closeout:

- checked out on `main`
- clean working tree
- local `main` current with `origin/main`
- the completed task branch absent
