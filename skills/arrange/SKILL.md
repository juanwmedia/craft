---
name: arrange
description: Use when a feature has an approved tech-spec and needs an implementation plan with atomic tasks. Produces plan.md with 1-2 minute TDD tasks, traceability matrix, and Why rationale per task.
disable-model-invocation: false
argument-hint: feature-slug
allowed-tools: Read, Edit, Write, Glob, Grep, AskUserQuestion
---

Part of the **CRAFT** methodology (Contextualize → Refine → **A**rrange → Forge → Teardown).

Produces the **implementation plan** — atomic tasks of 1-2 minutes each with TDD steps, rationale, and parallelizability markers.

## 0. Resolve feature

1. If the user passed an argument (e.g., `/arrange dojo-streaming`), use it as the feature slug.
2. If no argument, read `docs/specs/index.yaml` and find features with an approved `tech-spec.md` but no `plan.md`.
3. If exactly ONE feature matches, use it. Tell the user: "Working on **[feature-slug]**."
4. If MULTIPLE features match, list them and ask: "Which feature? [list]"
5. If ZERO features match: "No features have an approved tech-spec without a plan. Run `/refine` first."

## Prerequisites

Read `docs/specs/<feature>/spec.md` AND `docs/specs/<feature>/tech-spec.md`. If either doesn't exist or isn't approved, STOP:
> "This feature needs an approved spec and tech-spec first. Run `/contextualize` then `/refine`."

### If you discover gaps during planning

If the spec or tech-spec doesn't cover something you need to plan for:
1. Classify: is it a spec gap (missing AC) or a tech-spec gap (missing design decision)?
2. Update the relevant artifact inline (version++)
3. Tell the user what you changed
4. Continue planning against the updated artifacts

Do NOT exit arrange to re-run earlier phases. Amend and continue.

If the tech-spec's fundamental approach seems unworkable from a planning perspective, STOP:
> "The technical approach in the tech-spec may not work because [reason]. Run `/refine [feature-slug]` to redesign."

## 1. Analyze the tech-spec

Read the tech-spec completely. Identify:
- Every file in the File Inventory
- Every interface/type to implement
- Every decision that affects implementation order
- Dependencies between components (what must exist before what)

## 2. Decompose into atomic tasks

Each task is 1-2 minutes of work. If you can't describe it in one sentence, decompose further.

Every task MUST have ALL of these fields:

```markdown
- [ ] **Task N**: One-sentence description
  - **File**: `exact/path/to/file.ext`
  - **Why**: Covers "AC description" (AC-N). Depends on "T(N-1) description". Enables "T(N+1) description".
  - **RED**: Write test `testName` in `test/path/file.test.ext` that asserts [specific behavior]. Run `[test command]`. Expect FAIL.
  - **GREEN**: [Concise but unambiguous description of what code to write]. Run `[test command]`. Expect PASS.
  - **Verify**: `[exact command]` → expected output
  - **Parallel-safe**: yes | no | after-task-N
```

### Rules for task decomposition

1. **Test infrastructure first**: if a new test file, factory, or fixture is needed, that's task 1.
2. **One file per task** when possible. If a task touches 2+ files, it must be because they're tightly coupled (e.g., a type and its only consumer).
3. **Backend before frontend**: API/service changes before the components that consume them.
4. **Schema before logic**: migrations/types before the code that uses them.
5. **Never combine RED and GREEN across different behaviors**. One test, one behavior, one task.
6. **Every task MUST reference at least one acceptance criterion** in the Why field. If a task doesn't map to any AC, it's either infrastructure (note it as "Infrastructure: enables AC-N") or shouldn't exist.
7. **Never use bare codes**. Always include a 5-8 word description: `AC-3: "Turn counter triggers question gating"`, never just `AC-3`.

### Parallelizability rules

- `yes`: task has no dependency on other uncompleted tasks. Can run in a fresh subagent.
- `no`: task depends on a specific prior task's output. Must run sequentially.
- `after-task-N`: task can run in parallel with others, but only after task N completes.

Group tasks into batches where possible:
```markdown
### Batch 1 (parallel)
- [ ] Task 1 ...
- [ ] Task 2 ...
- [ ] Task 3 ...

### Batch 2 (after batch 1)
- [ ] Task 4 (after-task-1) ...
- [ ] Task 5 (after-task-2) ...
```

## 3. Build the traceability matrix

Before writing the plan, verify complete coverage by building a traceability matrix:

```markdown
## Traceability

| Criterion | Tasks |
|-----------|-------|
| AC-1: "Short description of criterion" | T1 (short desc), T3 (short desc) |
| AC-2: "Short description of criterion" | T2 (short desc), T4 (short desc), T5 (short desc) |

- Uncovered criteria: (list any AC without tasks, or "none")
- Orphan tasks: (list any tasks without AC reference, or "none — all tasks map to criteria")
```

If there are uncovered criteria, create tasks for them. If there are orphan tasks, either find their AC or remove them.

## 4. Write the plan

Write `docs/specs/<feature>/plan.md`:

```markdown
---
title: "Feature Title — Implementation Plan"
based_on_tech_spec_version: 1
created: YYYY-MM-DD
---

# Feature Title — Implementation Plan

## Summary
- Total tasks: N
- Parallel batches: M
- Estimated parallel execution: ~X minutes (N tasks at 1-2 min, M sequential batches)

## Traceability

| Criterion | Tasks |
|-----------|-------|
| AC-1: "Short description" | T1 (short desc), T3 (short desc) |
| AC-2: "Short description" | T2 (short desc), T5 (short desc) |

- Uncovered criteria: none
- Orphan tasks: none

## Test commands
- Backend: `php artisan test --filter=FeatureTest`
- Frontend: `npx vitest run path/to/test`
- Full suite: `php artisan test && npm run test:run`

## Tasks

### Batch 1: Foundation (parallel)
- [ ] **Task 1**: ...
- [ ] **Task 2**: ...

### Batch 2: Core logic (sequential, after batch 1)
- [ ] **Task 3**: ...
- [ ] **Task 4**: ...

### Batch 3: Integration (parallel, after batch 2)
- [ ] **Task 5**: ...
- [ ] **Task 6**: ...
```

## 5. Self-review

Before presenting, check:
- Can each task be completed in under 2 minutes? If not, decompose.
- Does every task have RED, GREEN, Verify, and Why? No exceptions.
- Does every task's Why reference at least one AC with description (never bare codes)?
- Are parallelizability markers correct? Would running two "parallel" tasks simultaneously cause conflicts?
- Is the test command correct for the project's stack?
- Does the plan cover EVERY file in the tech-spec's File Inventory?
- Does the traceability matrix show complete coverage? No uncovered criteria, no orphan tasks?

## 6. Present for review

Show the complete plan to the user. Ask:
> "Does each task look like 1-2 minutes of work? Should any be decomposed further?"

Iterate until approved.

## 7. Update index

Update `docs/specs/index.yaml`: set feature status to `planned`.

## 8. Transition

Tell the user:
> "Plan approved. You can:
> - Run `/evaluate` to audit the plan against the spec and tech-spec
> - Run `/forge` to start executing
>
> `/evaluate` is optional but catches task-spec misalignment before you start building."

## Guardrails

- Never include implementation code in the plan. The plan says WHAT to write, not the exact code. The exact code is written during Forge following TDD.
- If the tech-spec is ambiguous about something, STOP. Update the tech-spec (increment version) before creating the plan.
- The plan is a contract: if a task says "write test X that asserts Y", that's exactly what Forge will do. Be precise.
- Tasks must be self-contained enough that a subagent with zero context (only the task text + project files) can execute them.
