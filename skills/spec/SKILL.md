---
name: spec
description: Define what to build. Without argument shows the feature dashboard. With a feature slug, produces a versioned spec.md with user stories and acceptance criteria inside docs/specs/<feature>/. Use when the user wants to plan a feature, define requirements, write acceptance criteria, or asks "what should we build?"
disable-model-invocation: false
argument-hint: [feature-slug]
allowed-tools: Read, Edit, Write, Glob, Grep, AskUserQuestion, Agent
---

Part of the **Craft** methodology (**Explore** (optional) → **Spec** → Build → Close).

## Without argument — Dashboard

Show a read-only status overview:

1. Read `docs/specs/index.yaml`
2. If missing: "No features tracked yet. Run `/spec <feature-slug>` to start."
3. Group features by status, show phase progress inline for phased features
4. Display as a table with status, count, and feature names
5. For a single feature, show which artifacts exist and suggest next action

Dashboard mode is read-only. It never creates or modifies files.

---

## With argument — Spec mode

Produces the **product spec** (the WHAT) for a single feature.

### 1. Bootstrap infrastructure

- Check/create `docs/specs/index.yaml` and `docs/specs/<feature>/` directory
- For greenfield projects (no CLAUDE.md, no specs, minimal source): offer to bootstrap basics
- If `spec.md` already exists, you're updating — read it first

### 2. Understand existing state

Read CLAUDE.md, `index.yaml`, and any existing `explore.md` for this feature. The exploration documents technology decisions and constraints that inform the spec.

### 3. Critical analysis

Engage in collaborative discussion proportional to complexity:
- Challenge assumptions: edge cases, implicit requirements, conflicts with existing specs
- Detect gaps: error states, empty states, permissions, boundaries
- Propose alternatives: simpler approaches, reusable patterns
- Force clarity: reject vague words ("basic", "simple", "standard") until behavior is concrete

Use `AskUserQuestion` — one focused round at a time. Prioritize by impact.

### 4. Visual design gate

For UI features:
1. Ask if the user has a design
2. Three paths: user provides one, generate with `ui-designer` agent, or skip (annotate in spec)
3. If design exists, cross-check against requirements

Backend-only features skip this step.

### 5. Write the spec

Write `docs/specs/<feature>/spec.md`:

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

## Acceptance Criteria
1. GIVEN ... WHEN ... THEN ...

## Out of Scope
- What this feature does NOT do

## Open Questions
- Anything unresolved (or "None")
```

### 6. Scope check — propose phases if large

After writing, assess scope:
- **Small** (≤10 ACs, ≤8 tasks): single phase, proceed normally
- **Large** (>10 ACs or >8 tasks or crosses multiple layers): propose phases

When proposing phases:
- Phase 1 is always a vertical slice proving the core assumption end-to-end
- Each phase is independently shippable with its own ACs

Apply scope discipline (see `references/discipline.md`).

Add a `## Phases` section if applicable. Tell the user the scope assessment and ask for approval.

### 7. Spec audit

Before presenting, self-evaluate against: multiplicity, lifecycle (CRUD), ownership, empty state, failure modes, boundaries, dependencies, temporal triggers.

Collect gaps, present to user, resolve, update spec.

### 8. Present for review

Show the complete spec before writing to disk. Iterate until approved.

### 9. Update index

After approval:
- Add/update the feature in `docs/specs/index.yaml` with name, title, status, priority, spec_version, phases if applicable
- Set spec frontmatter status to `approved`

### 10. Transition

Suggest `/evaluate` for a completeness audit or `/build` to start implementation.

## Guardrails

- This skill produces the WHAT, not the HOW. No architecture, types, or file paths.
- Do not overwrite existing specs without user consent. Increment `spec_version` on updates.
- Each feature gets its own directory and spec.
- Dashboard mode is read-only.
