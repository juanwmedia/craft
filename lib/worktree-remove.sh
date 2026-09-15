#!/bin/bash
# Craft WorktreeRemove hook. Undoes what worktree-create.sh did outside the tree (a tool's lines from references/tools.md go here), then removes the tree.
set -euo pipefail
input=$(cat)
path=$(printf '%s' "$input" | node -e 'let d="";process.stdin.on("data",c=>d+=c).on("end",()=>process.stdout.write(JSON.parse(d).worktree_path))')

git worktree remove --force "$path" >&2
