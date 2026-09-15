#!/bin/bash
# Craft WorktreeRemove hook. Undoes what worktree-create.sh did outside the tree, then removes the tree.
set -euo pipefail
input=$(cat)
path=$(printf '%s' "$input" | node -e 'let d="";process.stdin.on("data",c=>d+=c).on("end",()=>process.stdout.write(JSON.parse(d).worktree_path))')
name=$(basename "$path")

if command -v herd >/dev/null; then herd unlink "$name" >&2 || echo "herd unlink failed" >&2; fi
git worktree remove --force "$path" >&2
