---
name: build
description: Design, plan, and implement a feature as a LIVING VISUAL DOC. Reads the feature's data.json, serves it as an interactive HTML board (craft-serve) the human watches in real time, decides the tasks conversationally with the user, then executes in the loop — updating the board live, pausing on every task and at gates. Use when the user wants to implement, code, or build a specified feature.
disable-model-invocation: false
argument-hint: feature-slug
allowed-tools: Read, Edit, Write, Glob, Grep, Bash, Agent, AskUserQuestion, TaskCreate, TaskUpdate, TaskList, TaskGet
---

Part of the **Craft** methodology (Explore (optional) → Spec → **Build** → Close).

Build turns a spec into working code through a **living visual document the human stays inside** — not a markdown plan dumped for one-shot approval. The feature's truth is `docs/specs/<feature>/data.json` (contract: `~/code/craft/lib/schema.md`). It renders as an interactive board via `~/code/craft/lib/craft-serve.js`, **live-reloading as you update the JSON**. The board is both the plan and, during execution, the live record.

All `data.json` content is **English** (canonical), regardless of interaction language.

## 0. Resolve feature
1. Arg given (`/build user-auth`) → that slug.
2. No arg → find `docs/specs/*/data.json` with unfinished tasks; if one, use it; if many, ask.
3. No data.json anywhere → "Run `/spec` first." Stop.

## 1. Prerequisites
Read `docs/specs/<feature>/data.json` (the WHAT + decisions). Read CLAUDE.md (conventions) and `docs/specs/decisions.md` (cross-cutting decisions to respect — **read-only**; only `/close` writes there).

## 2. Ensure the board is live (it usually already is)
The board is the feature's home for its **whole lifecycle** — normally already up from `/spec`. Run the **`craft-serve`** check-and-launch (idempotent: `curl`s the port, launches a **visible tracked** background process only if down, never a second one). Open `http://localhost:7331/f/<feature>/` if needed. From here you only **update `data.json`** and the board live-reloads — `build` fills the HOW (tasks) + live status on top of the WHAT `/spec` put there.

## 3. Collaboration mode — default `in the loop`
See `references/modes.md` (shared across all skills). Default **`in the loop`**: the human is in every task, trivial ones included.
- **`in the loop`** (DEFAULT) — co-design the HOW, then execute task by task; pause on **every** task (trivial included), phase boundaries, and gotchas. Per task: make the change, then report file(s) / what / why and leave the diff one click away; wait for "next".
- **`above the loop`** — the human states the goal and validates the result (start and end, not the middle); execute the agreed plan and report at the checkpoint they set (the end, or per phase).
Switchable mid-run ("go ahead" / "stop, show me"). Never silently leave `in the loop`. The granularity dial is the human's, live ("stream the trivial ones" / "stop on everything").

## 4. Decide the approach — decisions first, tasks only sketched
Do NOT disappear and reappear with a finished plan. Co-design out loud:
1. State the slicing rule first and get buy-in: **each phase ships ONE usable, testable thing on screen — not a skeleton, something you can actually run.** That decides the phase cut. (Scope discipline: `references/discipline.md` — max ~4 phases, else split into features.)
2. Agree the **key design `decisions`** for the phase — the few interdependent, architectural choices that must precede code (the *why* behind the cómo; these are HOW, so they live here in build, never in spec). One at a time; the user reshapes. Use `AskUserQuestion` for real forks. Persist each to `data.json` — the Decisions column fills live.
3. **Sketch** the phase's tasks lightly — `id`, title, `phase`, `covers`, `weight`/`gate` — just enough to see the shape and check coverage. Do NOT fully spec them here: each task's detail is decided right before you build it (step 6), and the list may grow or change as the build teaches you.

## 5. Coverage check
Every AC (`what`) in the phase must be covered by ≥1 sketched task (its `covers` includes the AC id). The board flags an uncovered AC red ("gap"). Close gaps in the sketch before building — report "Coverage: N/N, 0 gaps." Re-check at the phase boundary, since tasks may have been added or reshaped while building.

## 6. Build the phase — the interleaved loop (the gates)
Go task by task, in order. For **each** task, in `in the loop` (default): decide its detail with the human if there's a real choice → make the change → ⏸ report **what file(s)**, **what** changed, **what it covers** (task/AC), and **why** that way; leave the diff one click away (editor / "view diff"). They request a change / edit it / discuss / say "next". Don't pre-announce — report once done so they validate a real diff. **Persist to `data.json` as you go** (it is the live truth): set `status:"done"`, and add or reshape tasks as the build teaches you.
- **phase boundary** → ⏸ ALWAYS stop: re-check coverage, then "it's on screen — go run the outcome", and wait.
- **gotcha / surprise / plan turned out wrong** → add a `friction` (with `relatesTo`) to `data.json` — a red card appears — and STOP to surface it. Never bury it.

**Who executes.** In `in the loop`, execution is **inline** — the model that decided with the human writes the code (no execution subagent; it would break the per-task gate and the shared understanding). You may delegate noisy **read-only** recon (grep, file-mapping) to an Explore subagent — never the writing. In `above the loop`, you may delegate execution of the agreed plan to a subagent that reports at the checkpoint (its model the human's choice — Opus for minimal-oversight quality, Sonnet as a cost lever).

The granularity dial is the human's, live: "stream the trivial ones" loosens to stopping only on substantial/`gate` + phase boundaries; "stop on everything" is the floor.

## Persistence rule
`data.json` is the single source of truth; the HTML is a generated view. Update the JSON: on every task status change, when adding a task / decision / friction, when a gotcha appears. Surgical edits (a status flip is a few characters). It is **less** bookkeeping than a markdown plan, not more — one place, mechanical, and the live board makes any staleness visible.

## Conventions
- **Enumerate, never abstract.** Name every file touched; "I created the data layer" is banned.
- **You tag triviality (`weight`); the human decides what to open** (`view diff`). Grouping is for stopping points, never for hiding.
- Do not modify other features' files — log discoveries as cross-cutting frictions for /close.

## 7. Transition
When all tasks are done and each phase's outcome is verified on screen, suggest `/close` to reconcile, capture findings (gotchas graduate to CLAUDE.md), and commit.

## Guardrails
- The board is the contract and the live record — keep it current at all times.
- No data.json → run `/spec` first.
- `in the loop` is the default (`references/modes.md`); stopping on every task and surfacing gates is mandatory, not optional — never silently leave it.
- Commits are deferred to /close.
