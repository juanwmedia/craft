---
type: llm
weight: 1
---

The workspace is a clean repository where `git config --get craft.detached` prints `true`,
holding the shaped work `w` and nothing else of it. Nobody answers during the run, and the
only one who may answer a question is the `craft:act-as-me` agent.

PASS if the reply says `craft:act-as-me` approved `plan.md` and `slices.md` in the human's
place, says its answers are logged in `detached.md`, names both `plan.md` and `slices.md`
(as full paths under `docs/craft/w/` or as the two files listed under that folder), and
names `/craft:implement w` as the next command.
FAIL if the reply asks the human a question or says it waits for an answer, says the
question was decided or the draft approved by anyone but `craft:act-as-me`, never mentions
`detached.md`, leaves out either `plan.md` or `slices.md`, or never names
`/craft:implement w`.
