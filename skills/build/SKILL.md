---
name: build
description: Design, plan, and implement a feature. Reads the approved spec, enters plan mode to produce a tech-plan with design decisions and atomic tasks, then executes using subagents and native task tracking. Iterates until stable.
disable-model-invocation: false
argument-hint: feature-slug
allowed-tools: Read, Edit, Write, Glob, Grep, Bash, Agent, AskUserQuestion, EnterPlanMode, ExitPlanMode, TaskCreate, TaskUpdate, TaskList, TaskGet
---

Part of the **Craft** methodology (Spec → **Build** → Close).

Replaces the v1 pipeline of /refine → /arrange → /forge with a single skill that uses native plan mode and task system.

## 0. Resolve feature

1. If the user passed an argument (e.g., `/build user-auth`), use it as the feature slug.
2. If no argument, read `docs/specs/index.yaml` and find features with an approved `spec.md` but no `tech-plan.md`.
3. If exactly ONE feature matches, use it. Tell the user: "Working on **[feature-slug]**."
4. If MULTIPLE features match, list them and ask: "Which feature? [list]"
5. If ZERO features match: "No features have an approved spec without a tech-plan. Run `/spec` first."
6. If a feature has `status: in-progress` in `index.yaml` AND `tech-plan.md` exists with unchecked tasks (`- [ ]`), this is a **resume**. Skip to the resume protocol (section 1.5).

## 1. Prerequisites

Read `docs/specs/<feature>/spec.md`. If it doesn't exist or `status` is not `approved`, STOP:
> "This feature needs an approved spec first. Run `/spec <feature>` to create one."

Also read:
- Project context file (CLAUDE.md) for architecture, conventions, stack
- `docs/specs/decisions.md` for cross-cutting decisions — do not contradict them
- Related tech-plans in `docs/specs/` for patterns to reuse

### Backward compatibility

If v1 artifacts (`tech-spec.md`, `plan.md`) exist in the feature directory, use them as reference but produce your own `tech-plan.md`. Do not modify or depend on v1 artifacts.

## 1.5. Resume protocol

When resuming a feature from a previous session:

1. Read `tech-plan.md` — understand design decisions, completed tasks, iteration log
2. Count completed vs remaining tasks. Report: "Resuming **[feature-slug]**: N of M tasks done. Next: Task K: [description]."
3. Create native tasks (`TaskCreate`) for remaining unchecked tasks only
4. Continue execution from the next unchecked task (step 5)
5. Do NOT re-enter plan mode unless the remaining tasks need adjustment

## 2. Enter plan mode

Call `EnterPlanMode`. In plan mode:

1. Read the spec completely
2. Explore the codebase — use `Agent(Explore)` to find:
   - Existing patterns, utilities, types that can be reused
   - Similar features already implemented (follow their patterns)
   - Database schema, API contracts, component structure
3. Design the architecture:
   - Which layers are touched? (DB, backend, API, frontend)
   - What's the data flow?
   - New models, migrations, routes needed?
4. Identify non-obvious decisions and their trade-offs
5. Decompose into the most atomic tasks possible
6. Analyze parallelizability: which tasks are truly independent?
7. Write the tech-plan to `docs/specs/<feature>/tech-plan.md`

### tech-plan.md structure

```markdown
---
title: "Feature Title — Technical Plan"
status: draft
based_on_spec_version: 1
created: YYYY-MM-DD
last_updated: YYYY-MM-DD
---

# Feature Title — Technical Plan

## Design Decisions

### D1: Decision Title
- **Context**: Why this decision needs to be made
- **Options considered**:
  1. Option A — (trade-offs)
  2. Option B — (trade-offs)
- **Chosen**: Option B — rationale

## Tasks

### Batch 1: Foundation (parallel)
- [ ] **T1**: Description
  - **File(s)**: `path/to/file`
  - **Covers**: AC-1 "description of criterion"
- [ ] **T2**: Description
  - **File(s)**: `path/to/file`
  - **Covers**: AC-2 "description of criterion"

### Batch 2: Core logic (after batch 1)
- [ ] **T3**: Description
  - **File(s)**: `path/to/file`
  - **Covers**: AC-1 "description", AC-3 "description"

## Iteration Log
```

### Cross-cutting decisions

If a decision affects MORE than this one feature, it belongs in `docs/specs/decisions.md` — not just in this tech-plan. Add it there AND reference it here.

## 3. Exit plan mode, get approval

Call `ExitPlanMode`. The user reviews the tech-plan. Iterate until approved. Update `tech-plan.md` frontmatter: `status: approved`.

## 3.5. Verify coverage

Before executing, verify complete AC-to-task coverage:

1. List every acceptance criterion from `spec.md`
2. For each AC, confirm at least one task has `Covers: AC-N`
3. For each task, confirm it covers at least one AC
4. Present the coverage check:

> **Coverage: 12/12 ACs covered. 0 orphan tasks.**

If uncovered ACs exist, add tasks for them before proceeding. If orphan tasks exist (tasks covering no AC), either find their AC or remove them.

## 4. Create native tasks

For each task in the tech-plan, call `TaskCreate`:
- Subject: task description (e.g., "T1: Create users migration")
- Description: file paths, AC references, batch info, what to implement

This creates a visible, trackable task list that the user sees in real time. During execution:
- Call `TaskUpdate` with `status: "in_progress"` BEFORE starting each task
- Call `TaskUpdate` with `status: "completed"` AFTER the task passes verification
- The user sees: completed tasks (checked, struck through), the current task (in progress with spinner), and pending tasks — a live progress dashboard throughout the build.

## 5. Execute

Work through tasks batch by batch.

### Parallelization

- For parallel-safe tasks in the same batch: spawn subagents via `Agent` tool
- Each subagent receives ONLY: the task description, relevant file paths, and test commands
- For sequential tasks: execute directly
- Spawn teams of subagents when the batch size warrants it
- **Prioritize control over speed** — if unsure whether tasks are independent, run them sequentially

### Subagent reporting

Each subagent reports back with one of:
- **DONE** — task completed, tests pass (if applicable). Include: files changed, lines added/removed.
- **DONE_WITH_CONCERNS** — completed but something unexpected was found. Include: what the concern is, whether it affects other tasks.
- **BLOCKED** — cannot proceed. Include: what's missing, what decision is needed.

After all subagents in a batch complete:
- Review results — read the actual code changes (do NOT trust reports blindly)
- For `DONE_WITH_CONCERNS`: investigate the concern before starting the next batch
- For `BLOCKED`: resolve the blocker, then re-run the task

### Model selection for subagents

When spawning subagents, use the `model` parameter of the `Agent` tool:
- **haiku**: scaffolding, configuration files, static content, simple file creation
- **sonnet**: implementation with business logic, tests, API endpoints, data processing
- **opus**: tasks requiring deep architectural reasoning or complex multi-file coordination

Default to sonnet when unsure. Use haiku aggressively for mechanical tasks to save tokens.

### Task completion

After each task:
1. `TaskUpdate` to mark complete
2. Update `tech-plan.md`: change `- [ ]` to `- [x]`

### Testing

Write tests when they add value:
- **Always test**: business logic, data integrity, authentication, payment flows, API contracts
- **Judgment call**: UI scaffolding, configuration, simple wiring, static content
- When writing tests, prefer test-first (write the test, see it fail, then implement)

### When things go wrong

**Test fails unexpectedly**: investigate the root cause, fix, continue.

**Plan assumption invalid**: re-enter plan mode (`EnterPlanMode`), adjust the tech-plan, append to the Iteration Log, exit plan mode, continue from the adjusted point.

**Spec gap found** (missing edge case, behavior not contemplated):

- **Non-blocking gap**: note it for `/close` reconciliation. Continue.
- **Blocking gap** (downstream tasks depend on the answer): PAUSE. Ask the user a focused clarification question via `AskUserQuestion`. Record the decision in the tech-plan's Design Decisions section with prefix `[Clarified during build]`. Continue. The spec itself is NOT modified — formal reconciliation happens in `/close`.

Never update `spec.md` during build. Never increment `spec_version` during build. Clarifications are design decisions, not spec amendments.

**Premise broken** (fundamental approach doesn't work): STOP completely. Announce:
> "The current approach cannot continue because [reason]. Suggest re-running `/build` with a different approach."
Summarize what was done, what works, what doesn't.

### Iteration Log

When re-entering plan mode, append an entry:

```markdown
## Iteration Log

### B1 — 2026-03-22
- Initial plan: 8 tasks, 3 parallel batches
- Result: 6/8 done. T7 failed — API doesn't support SSE

### B2 — 2026-03-22
- Changed SSE → WebSockets. Replaced T7-T8, added T9
- Result: All pass
```

The Iteration Log tracks what changed, why, and the outcome. It is append-only.

## 6. Transition

When all tasks are complete:
> "All tasks complete. You can:
> - Run `/evaluate` to audit all changes against the spec
> - Run `/close` to reconcile specs, persist learnings, and commit
>
> `/evaluate` is optional but catches implementation-spec misalignment."

## Guardrails

- The tech-plan is the contract. Never skip tasks. If a task seems unnecessary, flag it — don't silently skip.
- Spec gaps are noted, not fixed. Spec reconciliation happens in `/close`.
- **NO COMMITS during /build.** All commits are proposed in `/close` and require user approval.
- Iterate the plan as needed — the Iteration Log tracks changes.
- Never proceed without an approved spec.
- Update `docs/specs/index.yaml`: set feature status to `in-progress` when execution starts.
