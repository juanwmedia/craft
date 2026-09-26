---
name: try
description: Try the built work live and keep the proof.
argument-hint: <slug [what changed]>
disable-model-invocation: false
---

Try answers whether the built work does, live, what its context says it must do.

Its input is `$ARGUMENTS`, read as `${CLAUDE_PLUGIN_ROOT}/references/work.md` says. Its output is `try.md` in the work's folder, with its captures in `try/`. It never changes code, and what it took to run the app (a build, a migration) goes at the top of `try.md`.

Try each thing the work must do the most direct way this session allows: a browser, a request, a log, the database. Whoever tries a thing tries it from start to end. What cannot be seen live says why.

Before a try leaves this machine (a real mail, a record in someone else's service), ask the human once with `AskUserQuestion`, naming what it will leave outside.

Tries that share neither the browser nor the data may run at once, each by its own agent. Only you write `try.md`.

`try.md` says, for each thing, passed, failed or skipped, how it was tried and what was seen, with a link to what it kept as proof.

End with one line per thing, the path to `try.md`, and the next command: `/craft:close <slug>`, or `/craft:plan <slug> <what failed>`.
