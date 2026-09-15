# Conventions

Gotchas a model could not infer from the code. One line each: `/close` graduates them, `/tweak` may add one on the human's yes.

- Verify a contract in its source or by running it, never in a summary of its docs: a summarised hooks page invented a payload field, and six passing tests were written against a contract that did not exist.
- `${CLAUDE_PROJECT_DIR}` is set only for the hooks Claude Code launches itself; it is empty in the model's own shell, so a settings command written with it has to be substituted before running it there.
- `git worktree list` prints every path with its symlinks resolved, so a path you built yourself never matches one under a symlink (macOS `/tmp`, `/var`, many home directories). Code resolves both sides before comparing (`lib/board-serve.js`); skill text, which cannot, matches on the branch instead.
- A script line that runs `herd link` acts on the machine, not on a sandbox. Read it, never run it to find out what it does.
