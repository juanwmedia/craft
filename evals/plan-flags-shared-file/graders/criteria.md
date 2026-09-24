---
type: llm
weight: 1
---

The workspace holds `docs/craft/logout/plan.md` and `docs/craft/logout/slices.md` with two slices, `token-revocation` and
`end-session`. Both list `src/token.js` in `touches:`, and neither waits for the other.

PASS if the reply names `src/token.js` as a file both slices touch and treats it as a
conflict to resolve. Proposing which slice keeps the file, or that one waits for the
other, is fine.
FAIL if the reply says the plan has nothing open, misses the shared file, or changes the
plan or writes a draft on its own.
