---
name: close
description: Reconcile the work's documents with what was built, then commit and push it.
argument-hint: <slug>
disable-model-invocation: false
---

Close answers whether the work's documents still match what was built. It is the only step that commits, pushes or opens a pull request, and it runs again every time the work changes.

Its input is `$ARGUMENTS`, read as `${CLAUDE_PLUGIN_ROOT}/references/work.md` says. Its slices are in the work's `slices.md`, as `${CLAUDE_PLUGIN_ROOT}/references/slice.md` says.

The work's files are its folder and every file its slices list. What changed since the last close is what git shows uncommitted in them. With nothing uncommitted, say there is nothing to close and stop.

Run every slice's check. If one fails, say which and stop without writing anything.

Then bring the documents up to date with the code:

- In `slices.md`, make the files each slice lists match the files it changed.
- In `shape.md`, mark each assumption tested, with the `file:line` where it works, or broken, with what it costs now.
- Redraw a drawing only when the mechanism or the look changed, as `${CLAUDE_PLUGIN_ROOT}/references/how-it-works.md` and `${CLAUDE_PLUGIN_ROOT}/references/how-it-looks.md` say.

Review every document that changed as `${CLAUDE_PLUGIN_ROOT}/references/review.md` says.

A lesson is what a model could not infer by itself, from an assumption that broke or a slice added while building. Write each one worth keeping in the repo's `CLAUDE.md`, or `AGENTS.md` when there is none, in the style it already has. With neither, ask the human whether to create one.

Before anything leaves this machine, ask the human once with `AskUserQuestion`: the files to commit (the work's files, plus where a lesson went), the commit message (what changed and why), a branch named after the slug when this is the main branch or `develop` (the human may name another), and whether to open a pull request when the branch has none. A yes creates the branch if one was proposed, commits only those files, pushes (which updates the branch's pull request if it has one) and opens the pull request if asked.

End with what was committed, where it was pushed, the pull request link if there is one, the assumptions that broke, and the lessons written.
