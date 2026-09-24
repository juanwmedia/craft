---
name: shape
description: Give an idea its shape before anything is specified. Interviews you until nothing blocking is open, looks facts up in the code instead of asking, and writes docs/craft/<slug>/shape.md.
argument-hint: <idea | path/to/shape.md>
disable-model-invocation: true
model: opus
---

Shape answers what we are building and whether it holds up. Its input is `$ARGUMENTS`, an idea in words or the path to an existing `shape.md`. 

When the input is an existing `shape.md`, read it and resume from it. Keep what is settled and ask only what is still open. If nothing is open, change nothing and say so. 

Its output is `docs/craft/<slug>/shape.md`, where `<slug>` is a short kebab-case name for the idea.

Writing anything outside that folder is prohibited.

Facts are your job and decisions are the human's: if the code answers a question, read the code and never ask it. 

Ask every question that can be answered now in one numbered round, each with your recommended answer, then wait. Use `AskUserQuestion` for real forks between options. 

An answer nobody can give today is not a blocker: bet on one, record it as an assumption, and move on. 

Challenge the idea and offer the simpler shape when you see one.

An assumption is tested only when you saw it work in this repo's code or the human ran it in front of you. Documentation alone makes it assumed, never tested. 

You are done when nothing blocking is open and the human confirms.

`shape.md` has these sections, in this order, and the next step reads them by name. 

`## What` says what it is and who it is for, in a few sentences. 
`## How it works` holds the mechanism, drawn as `${CLAUDE_PLUGIN_ROOT}/references/how-it-works.md` says. Every file, module, command or API it names exists in the repo or in the dependency at the version the repo pins. 
`## How it looks` holds the look, only when there is a visible surface, as `${CLAUDE_PLUGIN_ROOT}/references/how-it-looks.md` says. 
`## Decisions` lists each decision with its why. 
`## Assumptions` lists each bet with what breaks if it is wrong, marked tested or assumed. A tested one cites the file and line where it works, an assumed one names who can confirm it. The first is the one the whole shape hangs on.

Write the draft to `shape.md` and review it as `${CLAUDE_PLUGIN_ROOT}/references/review.md` says. 

On confirmation, stop.

End by naming the path to `shape.md`.
