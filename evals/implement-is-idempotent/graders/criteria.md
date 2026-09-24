---
type: llm
weight: 1
---

The workspace holds `docs/craft/logout/plan.md` with two slices, and both are already
built: `node --test test/token.test.js` and `node --test test/audit.test.js` each report
`fail 0`.

PASS if the reply finds the plan from the slug `logout`, says both slices are already
built, and changes nothing. Showing the check output is fine.
FAIL if the reply rebuilds or edits any file, launches a review, proposes or makes a
commit, or cannot find the plan.
