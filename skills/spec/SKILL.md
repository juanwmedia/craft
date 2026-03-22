---
name: spec
description: Define what to build. Without argument shows the feature dashboard. With a feature slug, produces a versioned spec.md with user stories and acceptance criteria inside docs/specs/<feature>/.
disable-model-invocation: false
argument-hint: [feature-slug]
allowed-tools: Read, Edit, Write, Glob, Grep, AskUserQuestion, Agent
---

Part of the **Craft** methodology (**Spec** → Build → Close).

## Without argument — Dashboard

When no feature slug is provided, show a read-only status overview.

1. Read `docs/specs/index.yaml`
2. If it doesn't exist: "No features tracked yet. Run `/spec <feature-slug>` to start."
3. Group features by status
4. Display:

> **Craft Status — [Project Name]**
>
> | Status | Count | Features |
> |--------|-------|----------|
> | done | 8 | core-flow, bilingual, guest-flow, ... |
> | in-progress | 4 | conversation-blocks, off-catalog, ... |
> | spec-ready | 1 | question-gating |
> | draft | 6 | streaming, knowledge-graph, ... |
>
> **Active work**: question-gating — spec approved, no tech-plan yet.
> **Suggested**: Run `/build question-gating` to design and implement.

For a single feature (`/spec dojo-streaming`), check which artifacts exist:
- `spec.md` → read frontmatter (status, version)
- `tech-plan.md` → read frontmatter (status, based_on_spec_version)

Display status, current phase, and suggested next action.

**Dashboard mode is READ-ONLY. It never creates or modifies files.**

---

## With argument — Spec mode

Produces the **product spec** (the WHAT) for a single feature. One spec per feature, never a monolith.

### 1. Find or create the specs infrastructure

1. Check if CLAUDE.md (or equivalent project context file) exists.
   - If NO context file AND no `docs/specs/` directory AND minimal source code:
     this is a greenfield project. Ask the user:
     > "This looks like a new project. I'll set up the basics:
     > - Create a minimal CLAUDE.md with project name and stack
     > - Create docs/specs/index.yaml
     > Want me to proceed, or do you already have these elsewhere?"
   - Bootstrap: create CLAUDE.md with project name, stack (ask user), and empty conventions section. Create docs/specs/index.yaml with project name.
2. Look for `docs/specs/index.yaml`. If it doesn't exist, create it with the project name.
3. Ask the user for a feature slug (kebab-case, e.g. `dojo-streaming`, `user-auth`).
4. Create `docs/specs/<feature>/` directory if it doesn't exist.
5. If `docs/specs/<feature>/spec.md` already exists, read it — you're updating, not creating from scratch.

### 2. Understand existing state

Read the project context file (CLAUDE.md) and `docs/specs/index.yaml` to understand:
- Existing features and their statuses
- Architecture, conventions, domain language
- Dependencies between features
- What has already been built

### 3. Critical analysis — back and forth

Before writing anything, engage in collaborative discussion. Depth proportional to complexity.

**Challenge assumptions:**
- What edge cases are missing? (empty states, errors, concurrency, permissions)
- Are there implicit assumptions the user hasn't stated?
- Does this conflict with existing specs or architectural decisions?

**Detect gaps:**
- What happens when things go wrong? (network failure, invalid input, timeouts)
- What about states the user didn't mention? (first-time user, empty data, max limits)
- Are there security or data integrity implications?

**Propose alternatives:**
- Is there a simpler way to achieve the same behavior?
- Could an existing pattern in the project be reused?

**Force clarity:**
- Do not accept vague requirements — ask until the behavior is concrete
- Flag EVERY ambiguous word: "basic", "simple", "compact", "minimal", "standard", "normal"

Use `AskUserQuestion` — one focused round at a time, not 20 questions at once. Prioritize by impact.

### 4. Visual design gate

For features that involve UI:

1. Ask: **"Do you have a design/mockup for this feature?"**
2. Three paths:
   - **User has a design** → ask to share it. Cross-check against requirements.
   - **Generate with Stitch** → launch `ui-designer` subagent via `Agent` tool, passing the feature name and requirements.
   - **User wants to skip** → annotate in spec with `> No visual reference provided.`
3. If a design exists, review it against the requirements: are there UI states not covered? Scenarios without visible UI?

Backend-only features skip this step.

### 5. Write the spec

Write `docs/specs/<feature>/spec.md` with this structure:

```markdown
---
title: "Feature Title"
status: draft
spec_version: 1
created: YYYY-MM-DD
last_updated: YYYY-MM-DD
---

# Feature Title

## Overview
(1-2 paragraphs: what and why)

## User Stories
1. A user must be able to...
2. A user must be able to...

## Acceptance Criteria
1. GIVEN ... WHEN ... THEN ...
2. GIVEN ... WHEN ... THEN ...

## Out of Scope
- What this feature does NOT do

## Open Questions
- Anything unresolved (or "None" if everything is clear)
```

### 6. Spec audit — evaluator-optimizer pass

Before presenting, attack every user story and acceptance criterion against:

| Dimension | Question |
|-----------|----------|
| Multiplicity | One or many? Upper limit? |
| Lifecycle | Create, read, update, delete — which are intentionally excluded? |
| Ownership | Who can see/modify this? |
| Empty state | What before any data exists? |
| Failure | What when external services fail? Validation fails? |
| Boundaries | Max lengths, counts, rate limits? What at the boundary? |
| Dependencies | Does this assume another feature exists? |
| Temporal | "Daily", "each time" — what's the actual trigger? |

Collect gaps, present to user, resolve, update spec.

### 7. Present for review

Show the complete spec to the user BEFORE writing to disk. Wait for explicit approval or corrections. Iterate until approved.

### 8. Update index

After the spec is approved and written:

1. Update `docs/specs/index.yaml` — add or update the feature entry:
   ```yaml
   - name: feature-slug
     title: Feature Title
     status: spec-ready
     priority: P1
     spec_version: 1
     depends-on: [other-feature, another-feature]
   ```
2. Set `status: draft` in the spec frontmatter to `status: approved`.

### 9. Transition

Tell the user:
> "Spec approved. You can:
> - Run `/evaluate` to audit the spec for completeness
> - Run `/build` to design, plan, and implement
>
> `/evaluate` is optional but recommended for complex or high-risk features."

## Guardrails

- This skill produces the WHAT, never the HOW. No architecture, types, file paths, or implementation details.
- Never overwrite existing specs without user consent. If updating, increment `spec_version`.
- Never mark specs as completed — that's `/close`'s job.
- Each feature gets its own directory and spec. Never append to a monolith.
- When invoked without argument, this skill is read-only (dashboard mode). It never creates or modifies files in dashboard mode.
