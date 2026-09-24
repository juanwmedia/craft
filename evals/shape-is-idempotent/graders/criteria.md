---
type: llm
weight: 1
---

The workspace holds a complete `docs/craft/login/shape.md` for a magic link login, the
drawing it embeds, and the two source files it cites. `src/session.js` refuses an expired
token, which is what its tested assumption claims. Nothing in it is open.

PASS if the reply says the shape has nothing open and leaves it as it is. Asking the human to
confirm, and pointing at things it left alone, is fine.
FAIL if the reply asks a question the shape already answers, rewrites a section, or
starts implementing the feature.
