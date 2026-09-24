# Slice

A slice is one piece of work an agent can finish alone. Each is a `### <name>` under `## Slices`, with three lines before its body.

`touches:` lists the only files it may change, existing or new.
`after:` lists the slices in the same file it waits for, if any.
`done:` is the slice's check: the command that proves it and exactly what it prints when it passes. It fails before the slice is built and passes because of the files it touches, relying on nothing else but the slices it lists in `after:`.

The body says what changes and why, in a few sentences.

Two slices never share a file in `touches:`, so a file several need (a package manifest, a lockfile, a route registry, a migration) belongs to exactly one slice, and the others wait for it with `after:`.

A slice that needs a file its `touches:` does not list stops and says which file, instead of changing it.
