#!/bin/bash
# Craft WorktreeRemove hook. Undoes what worktree-create.sh did outside the tree, then removes the tree. The unlink only fires on a link that points at this very tree: a name collision must never take down a site this hook did not create.
set -euo pipefail
input=$(cat)
path=$(printf '%s' "$input" | node -e 'let d="";process.stdin.on("data",c=>d+=c).on("end",()=>process.stdout.write(JSON.parse(d).worktree_path))')
name=$(basename "$path")

sites="$HOME/Library/Application Support/Herd/config/valet/Sites"
if command -v herd >/dev/null && [ -L "$sites/$name" ] && [ "$(readlink "$sites/$name")" = "$path" ]; then
  herd unlink "$name" >&2 && echo "herd unlink $name" >&2 || echo "herd unlink failed" >&2
fi
git worktree remove --force "$path" >&2
