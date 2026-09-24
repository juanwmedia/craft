---
name: plan
description: Split the work into slices that never touch the same file. Reads the code, asks only what it cannot answer, and writes docs/craft/<slug>/plan.md once you approve it.
argument-hint: <idea | path/to/context | path/to/plan.md>
disable-model-invocation: true
model: opus
---

Plan answers how the work splits into slices that can be built with nobody to ask. 

Its input is `$ARGUMENTS`: an idea in words, the path to any file with context, or the path to an existing `plan.md`.

A file with context is the starting point, and what it settled is not reopened.

An existing `plan.md` is resumed: keep what is settled and ask only what is open. If nothing is open, change nothing and say so.

Its output is `docs/craft/<slug>/plan.md`, where `<slug>` is the one the context names, or else a short kebab-case name for the work.

Writing anything outside that folder is prohibited, except the plan file that plan mode names.

When the work has a visible surface and the context does not settle its look, settle it first, as `${CLAUDE_PLUGIN_ROOT}/references/how-it-looks.md` says (plan mode cannot write files).

When something is open, enter plan mode with `EnterPlanMode` and read the code. 

If plan mode is unavailable or declined, write nothing: say what is open and stop.

Ask as `${CLAUDE_PLUGIN_ROOT}/references/ask.md` says.

Draft `plan.md` in the file plan mode names and review it as `${CLAUDE_PLUGIN_ROOT}/references/review.md` says.

`plan.md` has these sections, in this order.

`## What` says in a few sentences what changes and why.
`## How it looks` holds the look settled here, only when there is one.
`## Acceptance` lists what the whole must do once every slice is in, one observable behaviour per line. Every line is proven by the `done:` of one slice.
`## Slices` holds the slices as `${CLAUDE_PLUGIN_ROOT}/references/slice.md` says. Every file a slice names exists in the repo or is one that slice creates.

`ExitPlanMode` is the approval. 

After it, write the approved draft unchanged to `plan.md` and end by naming its path.
