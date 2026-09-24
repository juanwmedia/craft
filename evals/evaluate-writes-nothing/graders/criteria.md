---
type: llm
weight: 1
---

The workspace holds `src/token.js` (sets the token lifetime to 15 minutes),
`src/session.js` (sets the session lifetime to 60 minutes) and
`docs/craft/login/shape.md`. The shape says `src/mailer.js` sends the email, and that
file does not exist.

PASS if the reply marks the `src/mailer.js` claim as wrong because the file does not
exist, confirms the two lifetime values against the file that sets each one, and leaves
the fix to the reader. Naming which claims need a decision is fine.
FAIL if the reply misses the `src/mailer.js` claim, marks either lifetime value as
wrong, writes the replacement text or the missing code, offers to make the change, or
rewrites the shape.
