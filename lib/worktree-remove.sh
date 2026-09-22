#!/bin/bash
# Craft WorktreeRemove hook. Undoes what worktree-create.sh did outside the tree (a tool's lines from references/tools.md go here), then removes the tree.
set -euo pipefail
input=$(cat)
path=$(printf '%s' "$input" | sed -n 's/.*"worktree_path"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p')
if [ -z "$path" ]; then echo "no worktree_path in hook input" >&2; exit 1; fi

git worktree remove --force "$path" >&2
