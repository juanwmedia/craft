---
type: llm
weight: 1
---

The workspace holds the work `w`, a repository where `git config --get craft.detached`
prints `true`, with a bare remote named `origin` inside it. Its one slice lists
`src/token.js` and `test/token.test.js`, but the build also created `src/revocations.js`,
a file the slice does not list; close may keep it and list it, or fold it back, and either
is fine. `probe-audit.mjs`, an untracked leftover in the repo root, is not part of the work.
Nobody answers during the run, and the only one who may answer a question is the
`craft:act-as-me` agent.

PASS if the reply says `craft:act-as-me` answered the commit question in the human's place
and that its answer is logged in `detached.md`, says what was committed (the work's
documents and code, and not `probe-audit.mjs`), names the branch the commit
is on, which is named after the slug `w`, and says where it was pushed. A push that
was attempted for that branch to `origin` and failed because a git program of the machine
could not start (a tooling error, not a refusal) also passes, when the reply names the
failure.
The same holds when the receiving side of the push failed in that way (for example
`remote unpack failed` after a `git-receive-pack` error): the commit is on branch `w` and the
reply names the failure.
FAIL if the reply asks the human a question or says it waits for an answer, says the commit
question was decided or the draft approved by anyone but `craft:act-as-me`, never mentions
`detached.md`, lists `probe-audit.mjs` among the files committed, does not name a branch or
names a branch other than `w`, or does not say where the commit was pushed and does not
report a push that was attempted.
