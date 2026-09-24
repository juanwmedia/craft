---
name: implement
description: Build a set of slices above the loop. Runs every slice whose wait is over in parallel, one agent each on files no other slice touches, checks each slice itself and retries it while it makes progress, and reviews the whole change once every slice is built. Never commits.
argument-hint: <slug | path/to/slices>
disable-model-invocation: true
---

Implement answers whether the slices are built. 

Its input is `$ARGUMENTS`, read as `${CLAUDE_PLUGIN_ROOT}/references/work.md` says. What it builds is the work's `slices.md`, as `${CLAUDE_PLUGIN_ROOT}/references/slice.md` says, and what the whole must do is the rest of the work's context.

Check the file against `slice.md` and stop, changing nothing, if it breaks a rule. 

Then run every slice's check: one that already passes is built and left alone, so running Implement again only works what is still missing. 

Work in the tree you were launched in.

Launch one `craft:build` agent for every slice that waits for nothing unbuilt, all at once, and the next ones as soon as their wait is over. Each gets its slice as written, the path to `slice.md` and the reports of the slices it waited for.

A need is a change a file must get: an agent stopped for a file it does not list, or a review finding points at one. The file's owner is the slice that lists it. A slice that stopped for a need is launched again once the need is met, and is not built if it never is.

When an agent reports, run its check yourself, and act on what happens and on every need:

| What happens | What you do |
|---|---|
| The check fails the first time, or differently from the last | Put the slice's files back as they were and launch a fresh agent with the slice, the last report and what the check printed |
| It fails the same way twice in a row | A wall: the slice is not built and nothing that waits for it starts |
| Every open slice hits a wall the same way | Stop everything: the ground is broken, not the code |
| A need whose owner is not built yet | Wait for the owner |
| A need whose owner is built | Launch a fresh agent for the owner with its slice and the need, starting from the code already built |
| A need on a file with no owner, which the context asks for and nothing in it rules out | Append one slice that owns the file to `slices.md`, with `added:`, check it against `slice.md` and run it like any other |
| A need its owner's own slice contradicts, one that comes from an `added:` slice, or any other | It goes to the human as it is |
| The agent ends with no report, or a tool it needs is down | Launch once more; if that fails too, stop everything and say what broke |

You are the only one who writes `slices.md`, and only by appending.

When every slice is built and this run changed something, review the change as `${CLAUDE_PLUGIN_ROOT}/references/review.md` says: the files every slice lists, against the work's context. Each finding is a need on the file it points at.

When a round of fixes ends, run every check again: a built slice that now fails goes back to the table, and the next review gets only the files the fixed or added slices list.

End with one line per slice (built, at a wall and why, or stopped and the file it needed), marking the ones added this run, and what the review hands to the human. Never offer to commit.
