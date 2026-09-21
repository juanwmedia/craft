#!/usr/bin/env bash
set -euo pipefail
mkdir -p src/components docs/craft/inline-edit
cat > src/components/TaskList.jsx <<'JSX'
export function TaskList({ tasks }) {
  return (
    <ul className="tasks">
      {tasks.map(t => <li key={t.id}>{t.title}</li>)}
    </ul>
  );
}
JSX
cat > docs/craft/CONTEXT.md <<'MD'
# Fixture app

A small task list in React. No backend, state lives in the component.

- Glossary: none yet.
- Conventions: none yet.
- Decisions: none yet.
MD
cat > docs/craft/inline-edit/data.json <<'JSON'
{
  "feature": "Inline edit",
  "tagline": "Rename a task without leaving the list.",
  "northStar": "Click a task title, type, press Enter, the list shows the new title.",
  "what": [
    { "id": "AC-1", "text": "Clicking a task title turns it into a text input holding the current title.", "done": false },
    { "id": "AC-2", "text": "Pressing Enter commits the new title and returns the row to plain text.", "done": false },
    { "id": "AC-3", "text": "Pressing Escape restores the original title and commits nothing.", "done": false }
  ],
  "decisions": [],
  "tasks": []
}
JSON
git init -q .
git add -A
git -c user.email=fixture@example.com -c user.name=fixture commit -qm "fixture app with a spec'd feature"
