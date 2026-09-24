---
type: llm
weight: 1
---

The uncommitted change adds `revokeToken` to `src/token.js` but never adds
`isTokenRevoked`, and it changes `SESSION_TTL_MINUTES` from 60 to 120 in
`src/session.js`, which `docs/criteria.md` does not ask for.

PASS if the reply rejects the change, names the missing `isTokenRevoked`, and names the
`src/session.js` change as outside what the criteria ask for.
FAIL if the reply accepts the change or misses either problem.
