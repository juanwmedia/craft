---
name: build
description: Design, plan, and implement a feature. Reads the approved spec, enters plan mode to produce a tech-plan with design decisions and atomic tasks, then executes using subagents and native task tracking. Iterates until stable. Use when the user wants to implement, code, or build a specified feature.
disable-model-invocation: false
argument-hint: feature-slug
allowed-tools: Read, Edit, Write, Glob, Grep, Bash, Agent, AskUserQuestion, EnterPlanMode, ExitPlanMode, TaskCreate, TaskUpdate, TaskList, TaskGet
---

Part of the **Craft** methodology (Explore (optional) → Spec → **Build** → Close).

Spec defines the WHAT. This skill produces the HOW — architecture, tasks, and working code.

## 0. Resolve feature

1. If the user passed an argument (e.g., `/build user-auth`), use it as the feature slug.
2. If no argument, read `docs/specs/index.yaml` and find features with an approved `spec.md` but no `tech-plan.md`.
3. If exactly one matches, use it.
4. If multiple match, list them and ask.
5. If zero match: "No features have an approved spec without a tech-plan. Run `/spec` first."
6. If status is `in-progress` with unchecked tasks in `tech-plan.md`, this is a **resume** — skip to section 1.5.

## 1. Prerequisites

Read `docs/specs/<feature>/spec.md`. If missing or not approved, stop — spec needed first.

Also read: CLAUDE.md (conventions), `docs/specs/decisions.md` (cross-cutting decisions), related tech-plans (patterns to reuse).

## 1.5. Resume protocol

When resuming from a previous session:
1. Read `tech-plan.md` — understand design decisions, completed tasks, iteration log
2. Report progress: "Resuming **[slug]**: N of M tasks done. Next: Task K."
3. Create native tasks for remaining unchecked tasks only
4. Continue execution from next unchecked task (step 5)
5. Do not re-enter plan mode unless remaining tasks need adjustment

## 2. Enter plan mode

Call `EnterPlanMode`. In plan mode:

1. Read the spec completely
2. Explore the codebase — find existing patterns, utilities, similar features
3. Design the architecture: layers touched, data flow, new models/migrations/routes
4. Identify non-obvious decisions and trade-offs
5. Decompose into atomic tasks, analyze parallelizability
6. Write `docs/specs/<feature>/tech-plan.md`

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
- **Context**: Why this decision matters
- **Options**: A (trade-offs), B (trade-offs)
- **Chosen**: B — rationale

## Tasks

### Batch 1: Foundation (parallel)
- [ ] **T1**: Description — File(s): `path` — Covers: AC-1
- [ ] **T2**: Description — File(s): `path` — Covers: AC-2

### Batch 2: Core logic (after batch 1)
- [ ] **T3**: Description — File(s): `path` — Covers: AC-1, AC-3

## Iteration Log
```

Cross-cutting decisions go in BOTH the tech-plan AND `docs/specs/decisions.md`.

## 3. Exit plan mode, get approval

Call `ExitPlanMode`. User reviews. Iterate until approved. Set `tech-plan.md` status to `approved`.

## 3.5. Verify coverage

Before executing, verify every AC has at least one task and every task covers at least one AC. Report: "Coverage: N/N ACs covered. 0 orphan tasks." Add tasks for gaps.

## 3.6. Scope discipline

Apply scope discipline (see `references/discipline.md`).

Commits are deferred to /close so reconciliation sees the full change set. Do not modify other features' files — log discoveries in `## Cross-Feature Discoveries` for /close to surface.

## 4. Create native tasks

For each task, call `TaskCreate`. During execution:
- `TaskUpdate` with `in_progress` before starting each task
- `TaskUpdate` with `completed` after verification

## 5. Execute

Work through tasks batch by batch.

### Parallelization

For parallel-safe tasks: spawn subagents via `Agent`. Each receives only the task description, file paths, and test commands. For sequential tasks: execute directly. Prioritize control over speed when independence is uncertain.

### Model selection for subagents

- **haiku**: scaffolding, config, static content
- **sonnet**: business logic, tests, API endpoints (default)
- **opus**: deep architectural reasoning, complex multi-file coordination

### Subagent reporting

Each subagent reports: **DONE** (files changed, tests pass), **DONE_WITH_CONCERNS** (unexpected finding), or **BLOCKED** (needs decision). Review actual code after each batch — do not trust reports blindly.

### Task completion

After each task: `TaskUpdate` to complete, update tech-plan (`- [ ]` → `- [x]`).

### Testing

Always test: business logic, data integrity, auth, payments, API contracts. Judgment call for: UI scaffolding, config, static content. Prefer test-first when writing tests.

### When things go wrong

- **Test fails**: investigate root cause, fix, continue.
- **Plan assumption invalid**: re-enter plan mode, adjust, append to Iteration Log, continue.
- **Spec gap (non-blocking)**: note for /close reconciliation, continue.
- **Spec gap (blocking)**: ask user via `AskUserQuestion`, record in Design Decisions with `[Clarified during build]`, continue. Do not modify spec.md — reconciliation happens in /close.
- **Premise broken**: stop. Announce what failed and why. Summarize what works and what doesn't.

### Iteration Log

When re-entering plan mode, append what changed, why, and the outcome. Append-only.

## 6. Transition

When all tasks complete, suggest `/close` to reconcile and commit, or `/evaluate` for a final audit.

Update `docs/specs/index.yaml` status to `in-progress` when execution starts.

## Guardrails

- The tech-plan is the contract. Flag unnecessary tasks — don't silently skip.
- Spec gaps are noted, not fixed. Reconciliation happens in /close.
- Iterate the plan as needed — the Iteration Log tracks changes.
- Do not proceed without an approved spec.
