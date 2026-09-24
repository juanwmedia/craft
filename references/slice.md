# Slice

A slice is one piece of work an agent can finish alone. Each is a `### <name>` under `## Slices`, with three lines before its body.

`touches:` lists the only files it may change, existing or new.
`after:` lists the slices it waits for, if any.
`done:` is the command that proves the slice and what it prints when it passes. It may rely only on the files it touches and on the slices it lists in `after:`.

The body says what changes and why, in a few sentences.

Two slices never share a file in `touches:`. 

A file everyone needs (a package manifest, a lockfile, a route registry, a migration) belongs to exactly one slice, and the others wait for it with `after:`.

Slices that share no file and do not wait for each other can run at the same time.
