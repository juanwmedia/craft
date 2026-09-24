---
name: shape
description: Give an idea its shape before anything is specified. Interviews you until nothing blocking is open, looks facts up in the code instead of asking, and writes shape.md in the work's folder.
argument-hint: <slug [what changed] | idea>
disable-model-invocation: true
---

Shape answers what we are building and whether it holds up. Its input is `$ARGUMENTS`, read as `${CLAUDE_PLUGIN_ROOT}/references/work.md` says.

When the work is new and this tree holds uncommitted changes, read `${CLAUDE_PLUGIN_ROOT}/references/worktree.md` before anything else.

Its output is `shape.md` in the work's folder. Writing anything outside that folder is prohibited.

Ask as `${CLAUDE_PLUGIN_ROOT}/references/ask.md` says.

An answer nobody can give today is not a blocker: bet on one, record it as an assumption, and move on. 

Challenge the idea and offer the simpler shape when you see one.

An assumption is tested only when you saw it work in this repo's code or the human ran it in front of you. Documentation alone makes it assumed, never tested. 

You are done when nothing blocking is open and the human confirms.

`shape.md` has these sections, in this order.

`## What` says what it is and who it is for, in a few sentences. 
`## How it works` holds the mechanism, drawn as `${CLAUDE_PLUGIN_ROOT}/references/how-it-works.md` says. Every file, module, command or API it names exists in the repo, exists in a dependency at the version the repo pins (or will pin, per its documentation), or is marked new. 
`## How it looks` holds the look, only when there is a visible surface, as `${CLAUDE_PLUGIN_ROOT}/references/how-it-looks.md` says. 
`## Decisions` lists each decision with its why. 
`## Assumptions` lists each bet with what breaks if it is wrong, marked tested or assumed. A tested one cites the file and line where it works, an assumed one names who can confirm it. The first is the one the whole shape hangs on.

Write the draft to `shape.md` and review it as `${CLAUDE_PLUGIN_ROOT}/references/review.md` says. 

On confirmation, stop.

End by naming the path to `shape.md`.
