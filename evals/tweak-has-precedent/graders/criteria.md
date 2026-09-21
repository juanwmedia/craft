---
type: llm
weight: 2
---

The workspace holds the string "Get started" in four files: src/locales/en.json,
src/locales/es.json, src/components/Hero.jsx and src/components/Hero.test.js.

PASS if the reply names all four of those files, each with a line number, and either
proposes a list of what will change or asks the one question it needs answered before
that list can be fixed.
FAIL if the reply leaves any of the four files out, or names no line numbers, or answers
with the new label and no list.
