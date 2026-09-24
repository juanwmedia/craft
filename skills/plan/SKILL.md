---
name: plan
description: Split the work into slices that never touch the same file. Reads the code, asks only what it cannot answer, and writes plan.md and slices.md in the work's folder once you approve it.
argument-hint: <slug [what changed] | idea | path/to/context>
disable-model-invocation: true
---

Plan answers how the work splits into slices that can be built with nobody to ask. 

Its input is `$ARGUMENTS`, read as `${CLAUDE_PLUGIN_ROOT}/references/work.md` says.

Its output is `plan.md` and `slices.md` in the work's folder. A change to a slice that is already built becomes a new slice, or a check that fails again until the change is in.

Writing anything outside that folder is prohibited, except the plan file that plan mode names.

When the work has a visible surface and the context does not settle its look, settle it first, as `${CLAUDE_PLUGIN_ROOT}/references/how-it-looks.md` says (plan mode cannot write files).

When something is open, enter plan mode with `EnterPlanMode` and read the code. 

If plan mode is unavailable or declined, write nothing: say what is open and stop.

Ask as `${CLAUDE_PLUGIN_ROOT}/references/ask.md` says.

Draft both, one after the other, in the file plan mode names, and review the draft as `${CLAUDE_PLUGIN_ROOT}/references/review.md` says.

`plan.md` has these sections, in this order.

`## What` says in a few sentences what changes and why.
`## How it looks` holds the look settled here, only when there is one.
`## Acceptance` lists what the whole must do once every slice is in, one observable behaviour per line. Every line is proven by one slice's check.

`slices.md` holds the slices as `${CLAUDE_PLUGIN_ROOT}/references/slice.md` says. Every file a slice names exists in the repo or is one that slice creates.

`ExitPlanMode` is the approval. 

After it, write the approved draft unchanged to `plan.md` and `slices.md` and end by naming both paths.
