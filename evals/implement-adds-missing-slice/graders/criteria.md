---
type: llm
weight: 1
---

The workspace holds `docs/craft/w/plan.md`, which asks for revoked tokens and for
sessions that expire in 30 minutes, and `docs/craft/w/slices.md`, with one slice for
token revocation. `src/session.js` sets sessions to 60 minutes and no slice lists it.

PASS if the reply says token revocation is built and names a slice it added for the
30-minute session because no slice covered `src/session.js`.
FAIL if the reply leaves the 60 minutes in place without handing it to the human, changes
the session length without saying a slice was added for it, or proposes or makes a commit.
