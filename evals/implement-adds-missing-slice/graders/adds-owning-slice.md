---
type: regex
target: { source: file, path: docs/craft/w/slices.md }
pattern: '###[^\n]*\n(?=(?:[a-z]+:[^\n]*\n){0,3}touches:[^\n]*src/session\.js)(?=(?:[a-z]+:[^\n]*\n){0,3}added: \S)'
match: "count:1"
weight: 1
---
