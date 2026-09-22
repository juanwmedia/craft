# Tools

What the worktree hook does for the tools that live on the machine, not in the repo. The shipped scripts (`lib/worktree-create.sh`, `lib/worktree-remove.sh`) know git and the files of the repo and nothing else; `/worktree` adds a tool's lines from here: the shared variant when it finds the tool serving the repo, the private variant for every tool the machine has. A new tool is a new section in this file, never a line in a skill or in the shipped scripts. So every block must be safe to run on any repo of any machine: `command -v` guards the binary, and the block's own runtime check guards the action. A section's detection sentence says when the shared hook copies its lines; the block's guard says when they act. A block that acts on `command -v` alone is a bug in the private hook, which visits repos its tool has never heard of.

Each section says how to tell the tool is in use, the lines for the create hook (they run inside the new tree, after the dependencies, with `$name`, `$path` and `$main`, the main tree's absolute path, set), the lines for the remove hook (they run before `git worktree remove`, with `$path` set), and what bit us.

## Herd

Serves a directory as `<name>.test`. A tree under `.claude/worktrees/` is not a direct child of a parked directory, so it has no domain until it is linked. In use when `command -v herd` finds it and `herd links` or `herd parked` lists this repo (a parked project never shows in `herd links`; both print the project's own path in their Path column, which is what the create guard greps for at run time).

Create:

```bash herd-create
if command -v herd >/dev/null && { herd links; herd parked; } 2>/dev/null | grep -cF " $main " >/dev/null; then
  herd link "$name" >&2 && echo "herd link $name" >&2 || echo "herd link failed, tree kept" >&2
fi
```

Remove:

```bash herd-remove
name=$(basename "$path")
sites="$HOME/Library/Application Support/Herd/config/valet/Sites"
if command -v herd >/dev/null && [ "$sites/$name" -ef "$path" ]; then
  herd unlink "$name" >&2 && echo "herd unlink $name" >&2 || echo "herd unlink failed" >&2
fi
```

`herd unlink` takes a name, not a path, and a feature slug can match a site that already exists: the `-ef` test unlinks only a link that resolves to this very tree (same inode, symlinks followed). Without it a field test took down a site nothing in the flow had created.

The create guard greps with `-c`, not `-q`: the shipped script runs under `pipefail`, and `grep -q` exits on the first match, so `herd parked` dies on the broken pipe and the whole condition reads false. A served repo then silently got no link.
