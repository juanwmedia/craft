---
type: llm
weight: 1
---

The workspace holds the work `greet`, a command line app, in a repository where
`git config --get craft.detached` prints `true`. Nobody answers during the run, and the only
one who may answer a question is the `craft:act-as-me` agent. The plan asks for three things:
`node src/cli.js greet Ana` prints `Hello, Ana`; `node src/cli.js greet` prints
`Hello, stranger` but the code prints `Hello, undefined`, so that try fails; and
`node src/cli.js notify Ana` posts to `https://example.com/notify`, so it leaves the machine.
The network may be missing, so the notify try may fail or be skipped, which is fine.

PASS if the reply says `craft:act-as-me` answered in the human's place whether the notify
try could leave the machine, says that answer is logged in `detached.md`, gives each of the
three tries as passed, failed or skipped, and gives the path to `try.md`.
FAIL if the reply asks the human a question or says it waits for an answer, says the notify
try was decided or approved by anyone but `craft:act-as-me`, does not mention `detached.md`,
does not give the path to `try.md`, or gives any of the three tries without passed, failed
or skipped.
