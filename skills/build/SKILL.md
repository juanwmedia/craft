---
name: build
description: Design, plan, and implement a feature as a LIVING VISUAL DOC. Reads the feature's data.json, serves it as an interactive HTML board the human watches in real time, decides the tasks conversationally with the user, then executes in the loop, updating the board live, pausing on every task and at gates. Use when the user wants to implement, code, or build a specified feature.
disable-model-invocation: false
argument-hint: feature-slug
allowed-tools: Read, Edit, Write, Glob, Grep, Bash, Agent, AskUserQuestion, Skill, TaskCreate, TaskUpdate, TaskList, TaskGet
---

Part of the **Craft** methodology (Shape → Spec → **Build** → Close).

Build turns a spec into working code through a **living visual document the human stays inside**, not a markdown plan dumped for one-shot approval. The feature's truth is `docs/craft/<feature>/data.json` (contract: `${CLAUDE_PLUGIN_ROOT}/lib/schema.md`). It renders as an interactive board, **live-reloading as you update the JSON**. The board is both the plan and, during execution, the live record.

All `data.json` content is **English** (canonical), regardless of interaction language.

## 0. Resolve feature
1. Arg given (`/build user-auth`) → that slug.
2. No arg → find `docs/craft/*/data.json` with unfinished tasks; if one, use it; if many, ask.
3. No data.json anywhere → "Run `/spec` first." Stop.

## 1. Prerequisites
Read `docs/craft/<feature>/data.json` (the WHAT + decisions) and `docs/craft/CONTEXT.md`, following its pointers (glossary, conventions, decisions; **read-only**, only `/close` writes there).

## 2. Ensure the board is live (it usually already is)
The board is the feature's home for its **whole lifecycle**: normally already up from `/spec`. Run `/craft:board <feature>` if it is not. From here you only **update `data.json`** and the board live-reloads; `build` fills the HOW (tasks) + live status on top of the WHAT `/spec` put there.

## 3. Collaboration mode (default: `in the loop`)
`references/modes.md`, shared with `/close`. **`in the loop`**: the human is in every task, trivial ones included. **`above the loop`**: they state the goal and validate the result, present at the start and the end, not the middle. Entered only on their word ("go ahead"), left on their word ("stop, show me"). Never silently leave `in the loop`.

## 4. Decide the approach: decisions first, tasks only sketched
Do NOT disappear and reappear with a finished plan. Co-design out loud:
1. State the slicing rule first and get buy-in: **each phase ships ONE usable, testable thing on screen. Not a skeleton, something you can actually run.** That decides the phase cut. (Scope discipline: `references/discipline.md`; max ~4 phases, else split into features.)
2. Agree the **key design `decisions`** for the phase: the few interdependent, architectural choices that must precede code (the *why* behind the cómo; these are HOW, so they live here in build, never in spec). One at a time; the user reshapes. Use `AskUserQuestion` for real forks. Persist each to `data.json`; the Decisions column fills live.
3. **Sketch** the phase's tasks lightly (`id`, title, `phase`, `covers`, `weight`/`gate`): just enough to see the shape and check coverage. Do NOT fully spec them here: each task's detail is decided right before you build it (step 6), and the list may grow or change as the build teaches you.

## 5. Coverage check
Every AC (`what`) in the phase must be covered by ≥1 sketched task (its `covers` includes the AC id). The board flags an uncovered AC red ("gap"). Close gaps in the sketch before building, then report "Coverage: N/N, 0 gaps." Re-check at the phase boundary, since tasks may have been added or reshaped while building.

## 6. Build the phase

**`in the loop`** (default). Task by task, in order. Decide the task's detail with the human when there is a real choice, make the change, then ⏸ report: which file(s), what changed, what it covers (task / AC), why that way, the diff one click away. Never pre-announce; they validate a real diff, then request a change, edit it, discuss, or say "next". Execution is inline: the model that decided with the human writes the code, no execution subagent, it would break the per-task gate. Noisy read-only recon (grep, file mapping) may go to the built-in Explore subagent, never the writing. The granularity dial is theirs, live: "stream the trivial ones" stops only on substantial or `gate` tasks and phase boundaries; "stop on everything" is the floor.

**`above the loop`.** Hand the phase to the `craft:delegate` agent (`Agent`): the board is its brief, plus one line from the human on what it must not touch, the boundary it cannot infer. It runs the phase boundary itself and reports once with a proposed commit. Sonnet by default, Opus when the human says so. The human reads the report; nothing else reaches them.

**Phase boundary** in `in the loop`, always, in this order:
1. Coverage: every AC in the phase covered by a `done` task.
2. `/craft:evaluate` on the phase's coverage claims, with `Skill`.
3. `craft:review` (`Agent`) with the frozen ACs and the phase's diff.
4. ⏸ Present the phase with what came back: each finding with its citation and the fix you propose. The human decides what gets fixed. Then "it's on screen, go run the outcome", and wait.

**A gotcha, a surprise, a plan that turned out wrong**: a `friction` with `relatesTo` on the board (a red card appears) and ⏸ stop to surface it. Never bury it.

**Writing UI?** Load the `frontend-design` skill before the first component: it is the aesthetic direction, and `howItLooks` on the board is the brief. Match what is already there before inventing anything.

## Persistence rule
`data.json` is the single source of truth; the HTML is a generated view. Update the JSON: on every task status change, when adding a task / decision / friction, when a gotcha appears. Surgical edits (a status flip is a few characters). It is **less** bookkeeping than a markdown plan, not more: one place, mechanical, and the live board makes any staleness visible.

## Conventions
- **Enumerate, never abstract.** Name every file touched; "I created the data layer" is banned.
- **You tag triviality (`weight`); the human decides what to open** (`view diff`). Grouping is for stopping points, never for hiding.
- Do not modify other features' files. Log discoveries as cross-cutting frictions for /close.

## 7. Transition
When all tasks are done and each phase's outcome is verified on screen, suggest `/close` to reconcile, capture findings, and commit.

## Guardrails
- The board is the contract and the live record. Keep it current at all times.
- No data.json → run `/spec` first.
- `in the loop` is the default (`references/modes.md`); stopping on every task and surfacing gates is mandatory, not optional. Never silently leave it.
- Commits are deferred to /close.
