#!/usr/bin/env bash
set -euo pipefail
mkdir -p docs/craft/inline-edit src
cat > src/TaskList.jsx <<'JSX'
export function TaskList({ tasks }) {
  return <ul>{tasks.map(t => <li key={t.id}>{t.title}</li>)}</ul>;
}
JSX
cat > docs/craft/CONTEXT.md <<'MD'
# Fixture app

A small task list in React. No backend.
MD
cat > docs/craft/inline-edit/data.json <<'JSON'
{
  "feature": "Inline edit",
  "tagline": "Rename a task without leaving the list.",
  "northStar": "Click a title, type, press Enter, the list shows the new title.",
  "tree": { "branch": "worktree-inline-edit", "from": "main" },
  "what": [
    { "id": "AC-1", "text": "Clicking a task title turns it into a text input.", "done": true },
    { "id": "AC-2", "text": "Enter commits the new title.", "done": true }
  ],
  "decisions": [],
  "tasks": [
    { "id": "T1", "title": "Inline input", "files": "src/TaskList.jsx", "weight": "substantial", "status": "done", "covers": ["AC-1", "AC-2"] }
  ]
}
JSON
git init -q -b main .
git add -A
git -c user.email=fixture@example.com -c user.name=fixture commit -qm "fixture app with a board"
git worktree add -q .claude/worktrees/inline-edit -b worktree-inline-edit HEAD
# The feature's tree holds work that was never committed. Closing it would take that work with it.
cat >> .claude/worktrees/inline-edit/src/TaskList.jsx <<'JSX'
// unfinished: the escape key still commits
JSX
