---
name: craft-serve
description: Start or confirm the Craft board server for this project. Idempotent, checks the port first and never launches a second server. Invoke it manually anytime; /spec, /build and /close run this same check automatically.
model: haiku
argument-hint: "[port]"
allowed-tools: Bash
---

Idempotent, **visible** launcher for the Craft board (`${CLAUDE_PLUGIN_ROOT}/lib/craft-serve.js`).
One server per port; never double-launch. Port is `7331` unless an argument overrides it.

## 1. Is it already running?
Run:
`curl -s -o /dev/null -w "%{http_code}" http://localhost:7331/`
- `200` → it's already live (the user may have started it in their own terminal, or a prior turn did). Report **"Board already running → http://localhost:7331/"** and **stop**. Do nothing. Respect the existing server.
- anything else (`000`, empty, error) → it's down. Go to step 2.

## 2. Launch it, visibly
Launch as a **tracked background process** so the shell-running indicator shows in Claude Code:
`node "${CLAUDE_PLUGIN_ROOT}/lib/craft-serve.js" --root docs/craft --repo . --port 7331`
Run it with the **background mechanism** (the run-in-background option). **Do NOT** use `cmd &` inside a foreground command; that runs untracked and is invisible to the user. Then report the dashboard URL **`http://localhost:7331/`**.

## Manual use
You (the user) can run it yourself in your own terminal instead; it then persists across Claude sessions:
`node "${CLAUDE_PLUGIN_ROOT}/lib/craft-serve.js" --root docs/craft --repo . --port 7331`
Any Craft skill will detect it via step 1 and not relaunch.

## Guardrails
- **Always do step 1 before step 2**: one server per port, never two.
- When Claude launches it, it **must be visible** (tracked background), never `&`.
- This skill never edits files or touches git. It only checks and (if needed) launches.
