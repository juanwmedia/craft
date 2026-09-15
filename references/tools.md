# Tools

What a project's hook does for the tools that live on the machine, not in the repo. The shipped scripts (`lib/worktree-create.sh`, `lib/worktree-remove.sh`) know git and the files of the repo and nothing else; `/worktree` adds a tool's lines when it finds the tool, from here. A new tool is a new section in this file, never a line in a skill or in the shipped scripts. Every line stays guarded with `command -v`, so the committed hook is harmless on a machine without the tool.

Each section says how to tell the tool is in use, the lines for the create hook (they run inside the new tree, after the dependencies, with `$name` and `$path` set), the lines for the remove hook (they run before `git worktree remove`, with `$path` set), and what bit us.

## Herd

Serves a directory as `<name>.test`. A tree under `.claude/worktrees/` is not a direct child of a parked directory, so it has no domain until it is linked. In use when `command -v herd` finds it and `herd links` lists this repo.

Create:

```bash herd-create
if command -v herd >/dev/null; then herd link "$name" >&2 && echo "herd link $name" >&2 || echo "herd link failed, tree kept" >&2; fi
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
