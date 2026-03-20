---
name: forge
description: Use when a feature has an approved plan and you're ready to implement. Executes atomic tasks with TDD (RED-GREEN-verify) in supervised, sequential, or parallel mode. Learning mode ON by default.
disable-model-invocation: false
argument-hint: feature-slug
allowed-tools: Read, Edit, Write, Glob, Grep, Bash, Agent, AskUserQuestion
---

Part of the **CRAFT** methodology (Contextualize → Refine → Arrange → **F**orge → Teardown).

Executes the implementation plan task by task with strict TDD discipline.

## 0. Resolve feature

1. If the user passed an argument (e.g., `/forge dojo-streaming`), use it as the feature slug.
2. If no argument, read `docs/specs/index.yaml` and find features that have a `plan.md` with unchecked tasks (`- [ ]`).
3. If exactly ONE feature matches, use it. Tell the user: "Working on **[feature-slug]**."
4. If MULTIPLE features match, list them and ask: "Which feature? [list]"
5. If ZERO features match: "No features have a plan with pending tasks. Run `/arrange` first."

## Prerequisites

Read `docs/specs/<feature>/plan.md`. If it doesn't exist, STOP:
> "This feature needs a plan first. Run `/arrange` to create one."

Also read `docs/specs/<feature>/spec.md`, `docs/specs/<feature>/tech-spec.md`, and `docs/specs/decisions.md` (cross-cutting decisions) for reference during execution.

## 1. Load state

1. Read `plan.md` and find the first unchecked task `- [ ]`
2. Count completed vs remaining tasks
3. Report: "Task N of M: [description]."

## 2. Choose execution mode

Ask the user (only on first task of the session — remember the choice):

- **Supervised** (default): one task at a time, show results, wait for explicit approval before advancing
- **Sequential**: task by task, auto-advancing after verify. For confident sessions in familiar domains
- **Parallel**: launch subagents for the next batch of parallel-safe tasks. For mechanical/repetitive work

If the user doesn't specify, use **supervised**.

## 3. Learning mode

Learning is **ON by default**. The user can disable it:
- "no-learn" or "brief" when choosing execution mode → disable for this session

When learning is ON, after each task's GREEN step succeeds, show a learning block before the approval prompt (supervised) or before advancing (sequential).

### Learning block structure

**What we did**: One sentence summary of the change.

**Why this task exists**: Which acceptance criterion it covers (with full description, not just the code). Why it comes at this point in the plan — what had to exist before it, what it enables after.

**How it connects**:
- ← Depends on: "T3: Add turn_count column" (done ✓)
- → Enables: "T7: Gate questions at turn threshold" (pending)
- ⊕ Resolves: "Users can track conversation progress" (AC-2, spec §3)

**Framework/domain concept** (only when touching unfamiliar patterns):
Detect from CLAUDE.md and project context whether the pattern is likely new to the user. Explain the relevant framework concept in 2-3 sentences. E.g., Eloquent's `increment()`, Laravel's service container, Vue's `defineModel` macro, Inertia's shared props. If the pattern is standard in the project (already used elsewhere), skip this section.

Rules:
- Never use bare codes. Always `T3: "Add turn_count column"`, never just `T3`.
- The learning block is part of the task completion, not a separate step. It appears BEFORE the approval prompt in supervised mode.

## Supervised mode

For each unchecked task:

### BEFORE
Show the task context:
> "**Task N of M**: [description]"
> **Why**: [Why field from plan — AC reference with description, dependencies, what it enables]

### RED
1. Read the task's RED step
2. Write the test exactly as specified
3. Run the test command
4. **Verify it FAILS**. If it passes, the test is wrong — fix it until it fails for the right reason.
5. Show the failure to the user

### GREEN
1. Read the task's GREEN step
2. Write the minimal code to make the test pass
3. Run the test command
4. **Verify it PASSES**. If it fails, fix the code (not the test).
5. Show the passing result

### AFTER
1. Show diff summary (files changed, lines added/removed)
2. Show learning block (if learning ON)
3. Update `plan.md`: change `- [ ]` to `- [x]` for this task
4. Ask: **"Approve (a) / Fix (f) / Skip (s) / Stop (x)?"**
   - **Approve**: continue to next task
   - **Fix**: user explains what's wrong, agent fixes, re-runs verify, then asks again
   - **Skip**: flag task as skipped with reason in plan.md, continue to next
   - **Stop**: halt execution, summarize progress ("Completed N of M tasks. Next: Task K: [description]")

### If something goes wrong during a task
- **Test doesn't fail in RED**: the test is wrong, or the behavior already exists. Investigate before proceeding.
- **Code doesn't pass in GREEN after reasonable effort**: the task may be too big or the tech-spec may be wrong. STOP and decompose.

### Discovery protocol

When you or the user discover something the spec/tech-spec/plan didn't anticipate, classify and act:

#### Level 1: Detail gap — missing detail, doesn't change architecture
Example: "The spec says 'show error' but doesn't specify the error text."

1. Pause current task
2. Note the gap in the learning block or task summary
3. Make the reasonable decision, document it
4. Continue — Teardown will capture it as an implicit decision

No upstream changes. No version increments.

#### Level 2: Spec gap — missing edge case, missing AC, behavior not contemplated
Example: "What happens if the stream cuts mid-JSON block? The spec doesn't cover this."

1. STOP current task
2. Announce: "Discovery: [description]. This requires a spec amendment."
3. Amend inline (do NOT exit forge or re-run /contextualize):
   a. Open `spec.md` → add the missing AC or update existing ones → `spec_version++`
   b. Open `tech-spec.md` → update if architecture is affected → `based_on_spec_version` = new
   c. Open `plan.md` → add new tasks at the end for the new AC, update traceability matrix
   d. Mark new tasks with `(added during forge, from AC-N: "description")`
   e. Update `index.yaml` → `spec_version` = new
4. Present the amendment to user:
   > "Spec gap found: [description].
   > Updated:
   > - spec.md: added AC-N: 'description' (v1 → v2)
   > - tech-spec.md: [updated / no change needed]
   > - plan.md: added tasks TN, TN+1 for new AC
   >
   > Approve amendment? (yes / modify / reject)"
5. If approved → continue forge from where you stopped
6. If modified → apply user's changes, then continue
7. If rejected → skip the gap, add `<!-- KNOWN GAP: [description] — rejected by user -->` to spec.md

#### Level 3: Premise broken — fundamental approach doesn't work
Example: "SSE can't handle binary payloads; we need WebSocket instead."

1. STOP completely
2. Announce: "Premise broken: [description]. The current approach cannot continue."
3. Do NOT attempt inline fixes. This requires re-thinking the architecture.
4. Summarize what was done, what works, what doesn't:
   > "Completed tasks 1-6. Tasks 1-3 (description) are invalidated by this discovery.
   > Tasks 4-6 (description) may be reusable with a different approach."
5. Tell the user:
   > "Run `/refine [feature-slug]` to redesign the technical approach.
   > The spec (what we want) is still valid — only the how needs to change.
   > After /refine, run /arrange to create a new plan, then /forge to continue."
6. Mark invalidated tasks in plan.md with `<!-- invalidated: [reason] -->`
7. Do NOT delete any completed work — it may be partially reusable

## Sequential mode

Same as supervised mode but without the approval prompt. After each task's verify step passes:
1. Show learning block (if learning ON)
2. Mark task complete in `plan.md`
3. Brief summary: "Task N done. [what was implemented]. Next: Task N+1: [description]."
4. Continue to next task automatically

### Post-batch review (sequential mode)

After every 5 completed tasks, launch a review subagent via `Agent` tool with this prompt:

"Review the following code changes against the acceptance criteria.
You are a spec-compliance reviewer, not a cheerleader.

Acceptance criteria to verify:
[list the ACs that the completed tasks should cover, with full descriptions]

Files changed:
[git diff output for the relevant files]

For each AC, answer:
1. Is it fully implemented? Partially? Not at all?
2. Is there code that doesn't map to any AC? (over-implementation)
3. Are there test gaps? (behavior tested but edge case missed)

Do NOT trust the implementer's report. Verify independently by reading the actual code."

Present review results to user. If issues found, address before continuing.

## Parallel mode

1. Identify the next batch of parallel-safe tasks (same batch group, or all tasks marked `parallel-safe: yes`)
2. For each task in the batch, launch a subagent via `Agent` tool:
   - **Give the subagent ONLY**: the task text (inline, never a file reference), the project path, and the test/verify commands
   - **Never give**: session history, other tasks, full plan, spec/tech-spec content beyond what the task needs
   - The subagent executes RED → GREEN → verify independently
3. Each subagent reports one of:
   - `DONE` — task completed, tests pass
   - `DONE_WITH_CONCERNS` — completed but something unexpected was found
   - `BLOCKED` — cannot proceed, needs information or a decision
4. After all subagents complete:
   - Review results — read the actual code changes and test results (do NOT trust the report blindly)
   - Mark completed tasks in `plan.md`
   - For `DONE_WITH_CONCERNS`: investigate the concern, decide if it requires a spec update
   - For `BLOCKED`: resolve the blocker, then re-run the task
5. Present consolidated results to the user for review

### Post-batch review (parallel mode)

After each batch completes, launch a review subagent (same prompt as sequential mode review above). Present results to user before starting the next batch.

## Cross-cutting rules

These are non-negotiable. No exceptions. No rationalizations.

1. **No production code without a failing test.** Write the test first. Watch it fail. Then write code. If you wrote code before the test, delete it and start over.

2. **Never skip the RED step.** Run the test. See the failure output. Then proceed. "I know it will fail" is not acceptable — run it.

3. **Verify before claiming done.** Run the command. Read the output. In the current message. Then claim the result. Never say "should work" or "probably passes."

4. **If the plan diverges from reality: stop.** Update spec/tech-spec (version++), adjust the plan, then continue. Never push through with outdated assumptions.

5. **If a task takes more than 2 minutes, it's too big.** Stop, decompose it into smaller tasks in the plan, then continue.

6. **One behavior per task.** Don't combine unrelated changes. Each task = one test = one behavior.

## Rationalization table

If you catch yourself thinking any of these, STOP. Read the response. Follow it.

| Thought | Response |
|---------|----------|
| "This is too simple to need a test" | Write it. If it's simple, it takes 30 seconds. |
| "I already know this test will fail/pass" | Run it. "I know" is not evidence. Show the output. |
| "I can combine these two tasks into one" | No. One task, one behavior, one test. The plan is the contract. |
| "The spec is slightly wrong, I'll adjust while coding" | STOP. Go back. Update the spec (version++). Then continue. |
| "This verify step is redundant" | Run the command. Read the output. Claim AFTER evidence. |
| "I'll write the test after the implementation" | Delete the implementation. Write the test first. Watch it fail. Then rewrite. |
| "This task is just boilerplate, no test needed" | Boilerplate breaks too. Write the test. |
| "The user won't notice if I skip this" | The plan is visible. Skipping breaks trust. Flag it, don't skip. |
| "I can be faster if I do the next batch too" | In supervised mode, you stop. In sequential, follow the plan. Speed is not the goal — correctness is. |

## Guardrails

- Never modify tasks you haven't reached yet. Execute in order (respecting batch parallelism).
- Never skip a task. If a task seems unnecessary, flag it to the user — don't silently skip.
- The plan is the contract. If it says "write test X", write test X. Don't improvise a different approach.
- After completing ALL tasks:
  > "All tasks complete. You can:
  > - Run `/evaluate` to audit all changes against the spec (recommended)
  > - Run `/teardown` to close the session
  >
  > `/evaluate` will verify every implementation claim against the actual code and spec."
