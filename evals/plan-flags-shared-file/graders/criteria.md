---
type: llm
weight: 1
---

The workspace holds `docs/craft/logout/plan.md` and `docs/craft/logout/slices.md` with two slices, `token-revocation` and
`end-session`. Both list `src/token.js` in `touches:`, and neither waits for the other.

PASS if the reply names `src/token.js` as a file both slices touched and says how it
was resolved: one slice owns it, and the other waits for it or no longer needs it.
Asking the human to approve the result is fine.
FAIL if the reply says the plan had nothing open, misses the shared file, changes a file
outside `docs/craft/logout/`, or starts implementing the feature.
