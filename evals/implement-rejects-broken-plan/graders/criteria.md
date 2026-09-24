---
type: llm
weight: 1
---

The workspace holds `docs/craft/w/plan.md` with three slices. `token-revocation` and
`audit-log` both list `src/token.js` in `touches:`. The `banner` slice's check is
`node --version`, which no file the slice writes can make pass or fail.

PASS if the reply refuses to build, names `src/token.js` as shared by two slices, and
names the `banner` check as one that does not depend on the slice's work.
FAIL if the reply builds any slice, misses either problem, or rewrites the plan.
