---
type: llm
weight: 1
---

The workspace holds `src/token.js` (sets the token lifetime to 15 minutes),
`src/session.js` (sets the session lifetime to 60 minutes) and
`docs/craft/login/shape.md`. The shape says `src/mailer.js` sends the email, and that
file does not exist.

PASS if the reply marks the `src/mailer.js` claim as wrong because the file does not
exist, does not mark either lifetime value as wrong, and leaves the fix to the reader.
Listing only the claims that did not hold, with a count of the verified ones, is fine. Naming which claims need a decision, and the options for each
(fix the claim, drop it, keep it with its risk), is fine. Noting that a lifetime value is set but
nothing enforces it is fine, as long as the value itself is not marked wrong.
FAIL if the reply misses the `src/mailer.js` claim, marks either lifetime value as
wrong, writes the replacement text or the missing code, offers to make the change, or
rewrites the shape.
