---
type: llm
weight: 1
---

The workspace is a clean repository where `git config --get craft.detached` prints `true`.
Nobody answers during the run, and the only one who may answer a question is the
`craft:act-as-me` agent. Assumptions the shape records as assumed are part of a finished
shape and are not questions.

PASS if the reply says `craft:act-as-me` answered in the human's place and confirmed the
draft, says its answers are logged in `detached.md`, and names both `shape.md` and `/craft:plan`.
FAIL if the reply asks the human a question or says it waits for an answer, says a question
was decided or the draft approved by anyone but `craft:act-as-me`, never mentions
`detached.md`, or leaves out `shape.md` or `/craft:plan`.
