# Craft

Lessons the code cannot tell:

- Implement writes its own lines first in a builder's prompt (`Work in this tree, ...`) and the slice's `### <name>` further down. Anything that watches builders finds the slice by the first `### ` line, never the first line.
- Implement does not run a `done:` command as written: it batches and rewrites checks (`for n in one two three four; do ... done`), so nothing can tell a slice's check by its command.
- In an interactive session, parallel builders enter `agent.spawn` in the same instant. A mod hook awaits what it needs before it reads and replaces its state, or one spawn overwrites the other.
- `/craft:bar off` is kept in the mod's store across sessions, so a live try of the bar starts with `/craft:bar on`.
