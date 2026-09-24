---
name: implement
description: Build a set of slices above the loop. Runs every slice whose wait is over in parallel, one agent each on files no other slice touches, checks each slice itself and retries it while it makes progress, and reviews the whole change once every slice is built. Never commits.
argument-hint: <slug | path/to/slices>
disable-model-invocation: true
---

Implement answers whether the slices are built. 

Its input is `$ARGUMENTS`, read as `${CLAUDE_PLUGIN_ROOT}/references/work.md` says. What it builds is the work's file of slices, as `${CLAUDE_PLUGIN_ROOT}/references/slice.md` says.

Check the file against `slice.md` and stop, changing nothing, if it breaks a rule. 

Then run every slice's check: one that already passes is built and left alone, so running Implement again only works what is still missing. 

Work in the tree you were launched in.

Launch one `general-purpose` agent for every slice that waits for nothing unbuilt, all at once, and the next ones as soon as their wait is over. 

Each agent gets its slice as written, the path to `slice.md` and the reports of the slices it waited for. 

It never commits, stops before anything that changes something outside this machine (a push, a deploy, a message), runs its check and reports what it changed and what the check printed. 

With nobody to ask, it takes the smallest choice the slice allows and reports it.

When an agent reports, run its check yourself and act on what happens:

| What happens | What you do |
|---|---|
| The check fails | Put the slice's files back as they were and launch a fresh agent with the slice, the last report and what the check printed |
| It fails again, differently | Keep retrying |
| It fails the same way twice in a row | A wall: the slice is not built and nothing that waits for it starts |
| It fails on a file another running slice is changing | Run the check again once that slice is done, without counting it as an attempt |
| Every open slice hits a wall the same way | Stop everything: the ground is broken, not the code |
| The agent stopped for a file another unbuilt slice lists | Wait until that slice is built and launch again; if that slice hits a wall, this one is not built |
| The agent stopped for any other file | The slice is not built, and the end report names the file |
| The agent ends with no report, or a tool it needs is down | Launch once more; if that fails too, stop everything and say what broke |

When every slice is built and this run changed something, review the change as `${CLAUDE_PLUGIN_ROOT}/references/review.md` says, with the file of slices as what it must do. 

A round of fixes launches one fresh agent for each slice a finding points at, with its slice and those findings, starting from the code already built. A finding on a file no slice lists goes to the human as it is.

When the round ends, run every check again: a built slice that now fails goes back to the table, and the next review gets only the files the fixed slices list.

End with one line per slice (built, at a wall and why, or stopped and the file it needed) and what the review hands to the human. Never offer to commit.
