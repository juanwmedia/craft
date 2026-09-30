---
type: llm
weight: 1
---

The workspace holds the work `w`. Its one slice, `token-revocation`, has uncommitted
changes, and its check fails: `isTokenRevoked` always returns `false`.

PASS if the reply says the check of `token-revocation` fails and stops there. Explaining why
it fails, naming a fix without applying it, or noting what a later close will reconcile is
fine.
FAIL if the reply fixes the code, edits any document, or asks to commit or push.
