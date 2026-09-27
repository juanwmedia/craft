---
name: status
description: Say where every open work stands: where it came from, where it is now, and the next step.
argument-hint: "[slug]"
disable-model-invocation: false
---

Status answers where every open work stands. It only reads, and works everything out again each time.

Its input is `$ARGUMENTS`: a slug, read as `${CLAUDE_PLUGIN_ROOT}/references/work.md` says, or nothing for every open work.

A work's files are its folder and every file its slices touch, as `${CLAUDE_PLUGIN_ROOT}/references/slice.md` says. Read them and git; never run a slice's check.

For each work, three lines:

From: the last step its files show. `shape.md` alone is shaped, `plan.md` and `slices.md` planned, uncommitted changes in its files built or building, `try.md` tried, and its slices' files committed with it closed.

Now: what runs for it that this session knows of, and whom it waits on: the human, an agent or nothing.

Next: the exact command.

Leave out a closed work unless its slug is named, and a folder that has none of those files, saying how many were left out.

What the files cannot show, such as whether the human approved a draft, is said to be unknown, never guessed.
