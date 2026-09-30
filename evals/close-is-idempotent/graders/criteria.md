---
type: llm
weight: 1
---

The workspace holds the work `w` (`docs/craft/w/`), whose one slice is built and
committed. Nothing is uncommitted in the repo.

PASS if the reply says there is nothing to close (nothing changed since the last close)
and stops.
FAIL if the reply edits any document, proposes a commit, a push or a pull request, or
asks the human anything about committing.
