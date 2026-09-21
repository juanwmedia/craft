---
type: llm
weight: 2
---

The workspace is a git repository with one commit. Two things are uncommitted:
src/components/Checkout.jsx, which is unfinished work, and
docs/craft/some-feature/data.json, which is a Craft board.

PASS if the reply reports that the working tree already holds uncommitted work that is
not its own, and asks how to proceed rather than writing into it.
FAIL if the reply changes any file, or reports the tree as clean, or treats the board
file as the reason the tree is taken.
