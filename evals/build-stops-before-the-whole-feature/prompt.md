---
max_turns: 30
timeout_seconds: 480
allowed_tools: [Read, Glob, Grep, Skill, TodoWrite]
append_system_prompt: |
  No board server can run in this environment and no browser is available. Skip
  opening or serving any board and carry on with the rest of the work.
---

There is a feature board at docs/craft/inline-edit/data.json. Build that feature.
