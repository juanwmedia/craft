---
name: build
description: Decide the HOW and implement it, task by task, on the feature's living board. Reads data.json, agrees the design decisions and sketches the tasks with the human, then executes in the loop, updating the board live and pausing on every task and at every phase boundary. Use when the user wants to implement, code, or build a specified feature.
disable-model-invocation: false
argument-hint: feature-slug
allowed-tools: Read, Edit, Write, Glob, Grep, Bash, Agent, AskUserQuestion, Skill
---

Craft: Shape to Spec to **Build** to Close.

Build answers **how**, then does it, with the human inside every step.

Board: `docs/craft/<slug>/data.json` (contract: `${CLAUDE_PLUGIN_ROOT}/lib/schema.md`). It is the single source of truth and the HTML is a generated view: update the JSON on every status change, every task, decision or friction, and the board live-reloads. All board content is English.

## 0. Resolve the feature

Arg given: that slug. None: the `data.json` under `docs/craft/*/` with unfinished tasks; several, ask. None anywhere: "Run `/spec` first", and stop.

## 1. Read

`data.json` (the WHAT), and `docs/craft/CONTEXT.md` following its pointers (glossary, conventions, decisions; read-only here). Then the visuals, when the board has them (`schema.md` says how each one is read): the drawing is the map for the decisions and for every task.

## 2. Open the board

`/craft:board <slug>` with `Skill` if it is not up already (it usually is, since `/spec`).

## 3. Collaboration mode (default: `in the loop`)

`references/modes.md`, shared with `/close`. **`in the loop`**: the human is in every task, trivial ones included. **`above the loop`**: they state the goal and validate the result, present at the start and the end, not the middle. Entered only on their word ("go ahead"), left on their word ("stop, show me"). Never silently leave `in the loop`.

## 4. Decide the approach, out loud

The phases come from `/spec`; take the first not done. No `phases[]`: the whole feature is the one phase. Never disappear and reappear with a finished plan.

1. Agree the phase's **key `decisions`**: the few interdependent, architectural choices that must precede code, each with its why. One at a time, the human reshapes; `AskUserQuestion` for real forks. Persist each; the Decisions column fills live.
2. **Sketch** the phase's tasks lightly (`id`, title, `phase`, `covers`, `weight`, `gate`): enough to see the shape and check coverage, no more. Each task's detail is decided right before it is built, and the list may grow as the build teaches you.
3. **Coverage**: every AC in the phase covered by at least one task (`covers`). The board flags a gap red. Close every gap in the sketch, then report "Coverage: N/N, 0 gaps."

## 5. Build the phase

**`in the loop`** (default). Task by task, in order. Decide the task's detail with the human when there is a real choice, make the change, then ⏸ report: which file(s), what changed, what it covers (task / AC), why that way, the diff one click away. Never pre-announce; they validate a real diff, then request a change, edit it, discuss, or say "next". Execution is inline: the model that decided with the human writes the code, no execution subagent, it would break the per-task gate. Noisy read-only recon (grep, file mapping) may go to the built-in Explore subagent, never the writing. The granularity dial is theirs, live: "stream the trivial ones" stops only on substantial or `gate` tasks and phase boundaries; "stop on everything" is the floor.

**`above the loop`.** Hand the phase to the `craft:delegate` agent (`Agent`): the board is its brief, plus one line from the human on what it must not touch, the boundary it cannot infer. It runs the phase boundary itself and reports once with a proposed commit. Sonnet by default, Opus when the human says so. The human reads the report; nothing else reaches them.

**Phase boundary** in `in the loop`, always, in this order:
1. Coverage again: every AC in the phase covered by a `done` task.
2. `/craft:evaluate` on the phase's coverage claims, with `Skill`.
3. `craft:review` (`Agent`) with the working tree diff (everything since the feature started, commits are `/close`'s) and the ACs of every phase done so far, this one included: a phase that breaks an earlier one is caught here, not in `/close`.
4. ⏸ Present the phase with what came back: each finding with its citation and the fix you propose. The human decides what gets fixed. Then "it's on screen, go run the outcome", and wait.

**A gotcha, a surprise, a plan that turned out wrong, code that no longer fits the drawing**: a `friction` with `relatesTo` on the board (a red card appears) and ⏸ stop to surface it. Never bury it.

**Writing UI?** Load the `frontend-design` skill before the first component: it is the aesthetic direction, and `howItLooks` on the board is the brief. Match what is already there before inventing anything.

## 6. Leave

All tasks done and every phase's outcome verified on screen: tell the story in a few lines, what got built, the decisions that shaped it and their why, what stayed open (assumptions, frictions). Not task by task, they saw those. Then suggest `/close`. Commits are `/close`'s.

## Guardrails

- **Enumerate, never abstract.** Name every file touched; "I created the data layer" is banned.
- **You tag triviality (`weight`); the human decides what to open.** Grouping is for stopping points, never for hiding.
- Do not modify other features' files. Log discoveries as cross-cutting frictions for `/close`.
