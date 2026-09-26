---
name: plan
description: Split the work into slices that never touch the same file. Reads the code, asks only what it cannot answer.
argument-hint: <slug [what changed] | idea | path/to/context>
disable-model-invocation: false
---

Plan answers how the work splits into slices that can be built with nobody to ask. 

Its input is `$ARGUMENTS`, read as `${CLAUDE_PLUGIN_ROOT}/references/work.md` says.

When the work is new and this tree holds uncommitted changes, read `${CLAUDE_PLUGIN_ROOT}/references/worktree.md` before anything else.

Its output is `plan.md` and `slices.md` in the work's folder. A change to a slice that is already built becomes a new slice, or a check that fails again until the change is in.

Writing anything outside that folder is prohibited.

When the work has a visible surface and the context does not settle its look, settle it first, as `${CLAUDE_PLUGIN_ROOT}/references/how-it-looks.md` says.

Read the code, and ask what it cannot answer as `${CLAUDE_PLUGIN_ROOT}/references/ask.md` says.

Write both, then review them as `${CLAUDE_PLUGIN_ROOT}/references/review.md` says.

`plan.md` has these sections, in this order.

`## What` says in a few sentences what changes and why.
`## How it looks` holds the look settled here, only when there is one.
`## Acceptance` lists what the whole must do once every slice is in, one observable behaviour per line. Every line is proven by one slice's check and names that slice. A line that follows a pattern the code already has ends with the `file:line` where that pattern lives.

`slices.md` holds the slices as `${CLAUDE_PLUGIN_ROOT}/references/slice.md` says. Every file a slice names exists in the repo or is one that slice creates.

Then ask the human to approve both, naming their paths. A change asked for goes into both and through review again. End by naming both paths and the next command, `/craft:implement <slug>`.
