---
name: close
description: Reconcile the work's documents with what was built, then commit and push it.
argument-hint: <slug>
disable-model-invocation: false
---

Close answers whether the work's documents still match the artifact created. 

It is the only step that commits, pushes or opens a pull request, and it runs again every time the work changes.

Its input is `$ARGUMENTS`, read as `${CLAUDE_PLUGIN_ROOT}/references/work.md` says.

Its slices are in the work's `slices.md`, as `${CLAUDE_PLUGIN_ROOT}/references/slice.md` says.

The work's files are its folder and every file a slice touches. 

What changed since the last close is what git shows uncommitted in those files. With nothing uncommitted there, say there is nothing to close and stop.

Run every slice's check. If one fails, say which and stop without writing anything.

Then bring the documents up to date with the code.

In `slices.md`, compare each slice's `touches:` with the files that actually changed, and fix the difference.
In `shape.md`, mark each assumption tested, with the `file:line` where it works, or broken, with what it costs now.

Redraw a drawing only when the mechanism or the look changed, as `${CLAUDE_PLUGIN_ROOT}/references/how-it-works.md` and `${CLAUDE_PLUGIN_ROOT}/references/how-it-looks.md` say.

When a document changed, review it as `${CLAUDE_PLUGIN_ROOT}/references/review.md` says.

A lesson is something a model could not infer by itself, and it comes from an assumption that broke or a slice added while building.

If you really find a valuable lesson (or lessons), write each one in the repo's `CLAUDE.md`, in the style it already has. With no `CLAUDE.md`, use `AGENTS.md`. With neither, ask the human whether to create one.

Before anything leaves this machine, ask the human once with `AskUserQuestion`. Show the files to commit (the work's files, plus the file a lesson went to) and the commit message, which says what changed and why. 

On the repo's main branch or `develop`, propose a branch named after the slug and let the human name another. 

When the branch has no pull request, ask in the same question whether to open one.

A yes does all of it: create the branch if there is one, commit only those files, push, and open the pull request if asked. 

When the branch already has a pull request, the push updates it.

End with what was committed, where it was pushed, the pull request link if there is one, the assumptions that broke, and the lessons written.
