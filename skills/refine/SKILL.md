---
name: refine
description: Use when a feature has an approved spec and needs a technical specification before implementation. Produces a versioned tech-spec.md with architecture, interfaces, decisions, and edge cases.
disable-model-invocation: false
argument-hint: feature-slug
allowed-tools: Read, Edit, Write, Glob, Grep, Bash, AskUserQuestion, Agent
---

Part of the **CRAFT** methodology (Contextualize → **R**efine → Arrange → Forge → Teardown).

Produces the **technical specification** (the HOW) for a single feature. Bridges the gap between "what we want" and "how we build it."

## 0. Resolve feature

1. If the user passed an argument (e.g., `/refine dojo-streaming`), use it as the feature slug.
2. If no argument, read `docs/specs/index.yaml` and find features with an approved `spec.md` but no `tech-spec.md`.
3. If exactly ONE feature matches, use it. Tell the user: "Working on **[feature-slug]**."
4. If MULTIPLE features match, list them and ask: "Which feature? [list]"
5. If ZERO features match: "No features have an approved spec without a tech-spec. Run `/contextualize` first."

## Prerequisites

Read `docs/specs/<feature>/spec.md`. If it doesn't exist or `status` is not `approved`, STOP:
> "This feature needs an approved spec first. Run `/contextualize` to create one."

### If you discover a spec gap during design

If the spec is incomplete or ambiguous and you can't design the architecture without resolving it:
1. Update `spec.md` inline — add the missing AC or clarify the ambiguous one (`spec_version++`)
2. Tell the user what you changed and why
3. Continue refine against the updated spec

Do NOT exit refine to re-run /contextualize. The back-and-forth is normal.

## 1. Gather context

1. Read the feature's `spec.md` (the WHAT)
2. Read the project context file (CLAUDE.md) for architecture, conventions, stack
3. Read `docs/specs/decisions.md` for cross-cutting decisions — do not contradict them
4. Read related tech-specs in `docs/specs/` for patterns to reuse
5. Explore the codebase — use `Agent(Explore)` to find:
   - Existing patterns, utilities, types that can be reused
   - Similar features already implemented (follow their patterns)
   - Database schema, API contracts, component structure

## 2. Design architecture

Determine how this feature fits into the existing system:
- Which layers are touched? (DB, backend service, controller, API, frontend component, composable)
- What's the data flow?
- Are there new models, migrations, routes needed?

## 3. Define interfaces and types

Write the EXACT code for key interfaces — not pseudocode:
- Database schemas / migrations
- TypeScript types and interfaces
- PHP classes, methods, return types
- API request/response shapes
- Structured output schemas (if AI/LLM involved)

## 4. Document decisions

For every non-obvious decision, use this format:

```markdown
### D1: Decision Title
- **Context**: Why this decision needs to be made
- **Options considered**:
  1. Option A — (trade-offs)
  2. Option B — (trade-offs)
  3. Option C — (trade-offs)
- **Chosen option**: Option B — (rationale)
```

### Cross-cutting decisions

If a decision affects MORE than this one feature (e.g., "all Dojo features use single-agent", "never reveal solutions"), it belongs in `docs/specs/decisions.md` — not just in this tech-spec. Add it there AND reference it here.

Rule: **"Why do we do X across the whole project?" → decisions.md. "Why does THIS feature use Y?" → this tech-spec only.**

## 5. Edge cases

Create a table:

```markdown
| Edge case | Handling |
|-----------|----------|
| User submits empty form | Validation error, form not cleared |
| API timeout | Retry once, then error message |
```

## 6. File inventory

List every file that will be created or modified:

```markdown
| File | Action | Description |
|------|--------|-------------|
| `app/Services/Foo.php` | Create | New service for X |
| `resources/js/components/Bar.vue` | Modify | Add Y prop |
| `tests/Feature/FooTest.php` | Create | Tests for service |
```

## 7. Dependencies

Document:
- **Requires**: which other features must exist first
- **Required by**: which future features depend on this one
- **External**: new packages, APIs, services needed

## 8. Write the tech-spec

Write `docs/specs/<feature>/tech-spec.md`:

```markdown
---
title: "Feature Title — Technical Specification"
status: draft
based_on_spec_version: 1
created: YYYY-MM-DD
last_updated: YYYY-MM-DD
---

# Feature Title — Technical Specification

## Architecture
(how it fits, data flow, diagram if helpful)

## Key Interfaces / Types
(exact code)

## Decisions
### D1: ...

## Edge Cases
| Edge case | Handling |
|-----------|----------|

## File Inventory
| File | Action | Description |
|------|--------|-------------|

## Dependencies
(requires, required by, external)
```

## 9. Present for review

Show the complete tech-spec to the user. Iterate until approved.

## 10. Update index

Update `docs/specs/index.yaml`: set feature status to `tech-ready`.
Update tech-spec frontmatter: `status: approved`.

## 11. Transition

Tell the user:
> "Tech spec approved. You can:
> - Run `/evaluate` to audit the technical design against the spec
> - Run `/arrange` to create the implementation plan with atomic tasks
>
> `/evaluate` is optional but catches spec-to-design misalignment early."

## Guardrails

- Never proceed without an approved spec. The spec is the source of truth for WHAT.
- If you discover the spec is incomplete or wrong during design, STOP. Tell the user. Update the spec (increment `spec_version`) before continuing.
- The tech-spec must be concrete enough that any competent developer (or agent) could implement from it without asking questions.
- `based_on_spec_version` in the frontmatter links the tech-spec to the spec version it was designed against. If the spec changes, the tech-spec may need updating.
