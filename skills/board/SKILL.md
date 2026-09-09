---
name: board
description: Open the Craft board. Starts the server if it is down and prints the URL of a feature's board, or of the dashboard when no slug is given. `stop` shuts it down. Idempotent, never launches a second server.
disable-model-invocation: false
argument-hint: "[feature-slug | stop]"
allowed-tools: Bash
---

The one launcher for the Craft board. `/shape`, `/spec`, `/build` and `/close` all come through here; nobody else starts a server. The port lives in `${CLAUDE_PLUGIN_ROOT}/lib/board-serve.js` and nowhere else: never type one, never assume one, read every URL from what the script prints.

`SERVE` below is `node "${CLAUDE_PLUGIN_ROOT}/lib/board-serve.js"`.

## `stop`

Run `SERVE --stop` and say what it printed. When it reports a port held by something it did not start, **that is the answer**: say it, with the pid, and stop. That process may not be yours to kill.

## Anything else

1. **`SERVE --url`.** It prints the dashboard URL and exits 0 when a board is already up, exits 1 when nothing is there. Whoever started it, leave it alone.
2. **Exit 1? Start it**: `SERVE --root docs/craft --repo .` with the **background mechanism** (`run_in_background`), never `cmd &`, which runs untracked and invisible. It prints the URL on its first line. A server started this way dies with the session; the same command in the user's own terminal outlives it.
3. **Say the URL, one line.** That URL plus `f/<slug>/` for a feature, the URL bare for the dashboard. A slug with no `docs/craft/<slug>/data.json`: say so and list the slugs that do have one.

## Guardrails

- Step 1 before step 2, always: one server per port, never two.
- Tracked background, never `&`.
- This skill never edits files and never touches git.
