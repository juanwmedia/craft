#!/bin/bash
# Craft WorktreeCreate hook. Creates the tree from HEAD and prepares it; every if block after the cd is guarded, remove the ones this project does not need, keep the rest.
set -euo pipefail
input=$(cat)
name=$(printf '%s' "$input" | sed -n 's/.*"name"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p')
if [ -z "$name" ]; then echo "no name in hook input" >&2; exit 1; fi
main=$(git worktree list --porcelain | head -1 | cut -d' ' -f2-)
branch="worktree-$name"
path="$main/.claude/worktrees/$name"

git worktree add -b "$branch" "$path" HEAD >&2
trap 'git -C "$main" worktree remove --force "$path" >&2 2>/dev/null || true; git -C "$main" branch -D "$branch" >&2 2>/dev/null || true; echo "preparation failed, tree removed" >&2' ERR
cd "$path"

if [ -f "$main/.env" ] && [ ! -f .env ]; then cp "$main/.env" .env; echo "copied .env" >&2; fi
for db in "$main"/database/*.sqlite; do if [ -f "$db" ]; then mkdir -p database; cp "$db" database/; echo "copied $(basename "$db")" >&2; fi; done
if [ -f composer.json ]; then if command -v composer >/dev/null; then composer install --no-interaction >&2; echo "composer install" >&2; else echo "composer.json found, composer not on PATH, dependencies not installed" >&2; fi; fi
if [ -f pnpm-lock.yaml ]; then if command -v pnpm >/dev/null; then pnpm install --frozen-lockfile >&2; echo "pnpm install" >&2; else echo "pnpm-lock.yaml found, pnpm not on PATH, dependencies not installed" >&2; fi; fi
if [ -f package-lock.json ]; then if command -v npm >/dev/null; then npm ci >&2; echo "npm ci" >&2; else echo "package-lock.json found, npm not on PATH, dependencies not installed" >&2; fi; fi
if [ -f yarn.lock ]; then if command -v yarn >/dev/null; then yarn install --frozen-lockfile >&2; echo "yarn install" >&2; else echo "yarn.lock found, yarn not on PATH, dependencies not installed" >&2; fi; fi
if [ -f package.json ] && [ ! -f package-lock.json ] && [ ! -f pnpm-lock.yaml ] && [ ! -f yarn.lock ]; then if command -v npm >/dev/null; then npm install >&2; echo "npm install" >&2; else echo "package.json found, npm not on PATH, dependencies not installed" >&2; fi; fi

echo "$path"
