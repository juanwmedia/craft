# Tools

What the worktree hook does for the tools that live on the machine, not in the repo. The shipped scripts (`lib/worktree-create.sh`, `lib/worktree-remove.sh`) know git and the files of the repo and nothing else; `/worktree` adds a tool's lines from here: the shared variant when it finds the tool serving the repo, the private variant for every tool the machine has. A new tool is a new section in this file, never a line in a skill or in the shipped scripts. So every block must be safe to run on any repo of any machine: `command -v` guards the binary, and the block's own runtime check guards the action. A section's detection sentence says when the shared hook copies its lines; the block's guard says when they act. A block that acts on `command -v` alone is a bug in the private hook, which visits repos its tool has never heard of.

Each section says how to tell the tool is in use, the lines for the create hook (they run inside the new tree, after the dependencies, with `$name`, `$path` and `$main`, the main tree's absolute path, set), the lines for the remove hook (they run before `git worktree remove`, with `$path` set), and what bit us.

## Herd

Serves a directory as `<name>.test`. A tree under `.claude/worktrees/` is not a direct child of a parked directory, so it has no domain until it is linked. The tree links as `<site>-<slug>.test`, `<site>` being the domain Herd already serves for the main tree: a feature has no domain of its own, the repo does, so the tree's domain names repo plus feature and two repos with the same slug cannot collide. In use when `command -v herd` finds it and `herd links` or `herd parked` lists this repo (a parked project never shows in `herd links`; both print the site name and the project's own path, which is where the create block reads at run time).

Create:

```bash herd-create
if command -v herd >/dev/null; then
  row=$({ herd links; herd parked; } 2>/dev/null | grep -F " $main " || true)
  if [ -n "$row" ]; then
    site=$(printf '%s' "$row" | head -1 | cut -d'|' -f2 | tr -d ' ')
    [ -n "$site" ] || site=$(basename "$main")
    herd link "$site-$name" >&2 && echo "herd link $site-$name" >&2 || echo "herd link failed, tree kept" >&2
  fi
fi
```

Remove:

```bash herd-remove
sites="$HOME/Library/Application Support/Herd/config/valet/Sites"
if command -v herd >/dev/null && [ -d "$sites" ]; then
  for s in "$sites"/*; do
    if [ -e "$s" ] && [ "$s" -ef "$path" ]; then
      herd unlink "$(basename "$s")" >&2 && echo "herd unlink $(basename "$s")" >&2 || echo "herd unlink failed" >&2
    fi
  done
fi
```

`herd unlink` takes a name, not a path, and a slug can match a site that already exists: the remove block unlinks by inode (`-ef`, symlinks followed), never by name, so it only takes down a link that resolves to this very tree, whatever it was called, old `<slug>.test` links from before the composed names included. Without the `-ef` test a field test took down a site nothing in the flow had created.

The capture greps plain `-F`, which reads every line both commands print, and the `|| true` only absorbs the no-match exit. `grep -q` broke here once: under the script's `pipefail` it exits on the first match, the command still feeding the pipe dies on the broken pipe, the whole condition reads false, and a served repo silently got no link.
