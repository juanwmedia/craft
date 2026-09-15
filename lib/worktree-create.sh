#!/bin/bash
# Craft WorktreeCreate hook. Creates the tree from HEAD and prepares it; every if block after the cd is guarded, remove the ones this project does not need, keep the rest.
set -euo pipefail
input=$(cat)
name=$(printf '%s' "$input" | node -e 'let d="";process.stdin.on("data",c=>d+=c).on("end",()=>process.stdout.write(JSON.parse(d).name))')
main=$(git worktree list --porcelain | head -1 | cut -d' ' -f2-)
branch="worktree-$name"
path="$main/.claude/worktrees/$name"

git worktree add -b "$branch" "$path" HEAD >&2
trap 'git -C "$main" worktree remove --force "$path" >&2 2>/dev/null || true; git -C "$main" branch -D "$branch" >&2 2>/dev/null || true; echo "preparation failed, tree removed" >&2' ERR
cd "$path"

if [ -f "$main/.env" ] && [ ! -f .env ]; then cp "$main/.env" .env; echo "copied .env" >&2; fi
for db in "$main"/database/*.sqlite; do if [ -f "$db" ]; then mkdir -p database; cp "$db" database/; echo "copied $(basename "$db")" >&2; fi; done
if [ -f composer.json ]; then composer install --no-interaction >&2; echo "composer install" >&2; fi
if [ -f pnpm-lock.yaml ]; then pnpm install --frozen-lockfile >&2; echo "pnpm install" >&2; fi
if [ -f package-lock.json ]; then npm ci >&2; echo "npm ci" >&2; fi
if [ -f yarn.lock ]; then yarn install --frozen-lockfile >&2; echo "yarn install" >&2; fi
if [ -f package.json ] && [ ! -f package-lock.json ] && [ ! -f pnpm-lock.yaml ] && [ ! -f yarn.lock ]; then npm install >&2; echo "npm install" >&2; fi
if command -v herd >/dev/null; then herd link "$name" >&2 && echo "herd link $name" >&2 || echo "herd link failed, tree kept" >&2; fi

echo "$path"
