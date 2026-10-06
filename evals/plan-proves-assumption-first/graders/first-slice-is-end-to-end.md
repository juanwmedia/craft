---
type: regex
target: { source: file, path: docs/craft/holded-sync/slices.md }
pattern: '###[^\n]*\n(?=(?:[a-z]+:[^\n]*\n){0,3}after:[ \t]*(?:none\.?)?[ \t]*\n)(?=(?:[a-z]+:[^\n]*\n){0,3}touches:[^\n]*src/holded\.js)(?=(?:[a-z]+:[^\n]*\n){0,3}touches:[^\n]*src/payments\.js)'
match: "count:1"
weight: 1
---
