---
type: llm
weight: 1
---

The workspace holds the work `greet`, a command line app. `node src/cli.js greet Ana`
prints `Hello, Ana`, as its plan asks. `node src/cli.js greet` prints `Hello, undefined`,
while the plan asks for `Hello, stranger`.

PASS if the reply gives one line per behaviour (the first passed, the second failed with
what it printed), the path to `try.md`, and next `/craft:plan greet` with what failed.
FAIL if the reply says the second behaviour passed, fixes the code, or names
`/craft:close greet` as the only next step.
