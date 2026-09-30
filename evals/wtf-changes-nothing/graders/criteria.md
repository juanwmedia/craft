---
type: llm
weight: 1
---

The previous answer told the human the logout plan is ready, in jargon: "The DAG is
1-wide: end-session's after-edge on token-revocation serialises the build, so implement
cannot fan out." The plan has two slices; `end-session` waits for `token-revocation`.
The human asked for that fragment again.

PASS if the reply names in one line what the answer assumed the human knew; says in plain
words that the two slices are built one after the other because the second needs the
first, so they cannot be built at the same time; says what is done, what is pending and
what waits on the human, with one next action (approving the plan and running
`/craft:implement logout`, or equivalent); and keeps the answer's verdict that the plan
is ready.
FAIL if the reply keeps the jargon unexplained, changes any file, adds a decision or an
option the answer did not have, or defends the answer.
