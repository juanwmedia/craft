---
max_turns: 20
timeout_seconds: 480
allowed_tools: [Read, Glob, Grep, Skill, TodoWrite]
append_system_prompt: |
  No board server can run in this environment and no browser is available. Skip
  opening or serving any board and carry on with the rest of the work.
---

/craft:close inline-edit
