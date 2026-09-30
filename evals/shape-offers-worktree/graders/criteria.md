---
type: llm
weight: 1
---

The workspace holds an uncommitted change to `src/session.js` that has nothing to do with
the new work, token revocation. `.env` is ignored by git and a fresh checkout needs it.
The human gives no answer during the run.

PASS if the reply offers to move the new work to its own worktree because the tree holds
changes that are not the new work's, and proposes `.env` for `.worktreeinclude`.
FAIL if the reply never mentions a worktree, commits, stashes or reverts the change to
`src/session.js`, or treats that change as part of token revocation.
