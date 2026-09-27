---
type: llm
weight: 1
---

The workspace holds a complete `docs/craft/logout/plan.md` and `slices.md` for a logout feature and the
two source files it builds on. Its two slices touch different files, and the second waits
for the first. Nothing in it is open.

PASS if the reply says the plan has nothing open and leaves it as it is. Pointing at
things it left alone is fine. Neither slice is built yet, so saying that both checks
fail today, or that both slices are still to build, is expected and is not something
open in the plan. Asking the human to approve it as it stands, or naming the next
command, is fine.
FAIL if the reply asks a question the plan already answers, rewrites a slice, or starts
implementing the feature.
