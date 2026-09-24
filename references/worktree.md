# Worktree

A new work is born in the tree it will be built in, and the changes already in this one are not its own, so offer once to move the work to a new worktree with `EnterWorktree`. Declined, work here.

A new worktree has the tracked files and nothing else. When the repo has no `.worktreeinclude`, find every file git ignores that a fresh checkout needs to run (env files, a local database, whatever this project keeps out of git) and propose it with the offer, in `.gitignore` syntax, in the repo root. 

Installed dependencies are not files to copy: whoever works in the tree installs them. When nothing is needed, propose nothing.

Accepted, write `.worktreeinclude` first, then call `EnterWorktree` with the work's slug as the name, and carry on there.
