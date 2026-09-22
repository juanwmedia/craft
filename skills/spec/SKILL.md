---
name: spec
description: Define WHAT to build, as a living visual doc. Runs a collaborative Q&A and writes the feature's data.json (north star, acceptance criteria, phases with usable outcomes) so the WHAT appears on the board as you define it. Decisions and tasks come later in /build.
disable-model-invocation: true
argument-hint: feature-slug
allowed-tools: Read, Edit, Write, Glob, Grep, Bash, Agent, AskUserQuestion, Skill, EnterWorktree
---

Craft: Shape to **Spec** to Build to Close.

Spec answers **what counts as done**. Never how.

Board: `docs/craft/<slug>/data.json` (contract: `${CLAUDE_PLUGIN_ROOT}/lib/schema.md`). All board content is English.

## Produces

- `feature`, `tagline`, `northStar`: the spine, agreed before anything else.
- `phases[]`: vertical slices, each shipping one usable `outcome`. Only when the feature has more than one slice.
- `what[]`: acceptance criteria, indivisible and testable, each assigned to a phase.
- `howItLooks[]`: the look, when `/shape` did not settle it.

Nothing else. Decisions and tasks belong to `/build`.

## 1. Bootstrap

The Offer (`${CLAUDE_PLUGIN_ROOT}/references/worktree.md`) settles the tree. Then, in the chosen tree, `docs/craft/<slug>/`: a `data.json` there means you are updating (`/shape` wrote it): read it first, never overwrite it without consent. None: write a minimal skeleton (`tree` when one was opened, `feature`, `tagline`, empty `what` and `phases`) so the board has something to render. Read `docs/craft/CONTEXT.md` and follow its pointers (read-only; no file means `/shape` never ran), and flag any conflict. Then the visuals, when the board has them (`schema.md` says how each one is read).

## 2. Open the board

`/craft:board <slug>` with `Skill`. The WHAT shows up live as you fill `data.json`; the board stays up through build and close.

## 3. Ask only what `/shape` did not answer

Read `exploration.resolved` and the glossary first and synthesise from them. What they do not cover is yours to ask. A blocking fork with real branches goes back to `/shape <slug>`; one missing answer does not.

Discussion proportional to complexity. Challenge assumptions (edge cases, implicit requirements, conflicts with existing specs). Detect gaps (error and empty states, permissions, boundaries). Offer the simpler or reusable shape. **Reject vague words** ("basic", "simple", "standard") until the behaviour is concrete. Ask in conversation, one focused round at a time, by impact; `AskUserQuestion` only for real forks, where the options are closed.

## 4. Agree the spine

`northStar`: the usable outcome of the whole feature, what "done" feels like. Then, only if the feature has more than one usable slice, `phases[]` with buy-in before any AC: the spine bounds the AC work and keeps it from sprawling. Two cuts are usually possible, and that is a fork: `AskUserQuestion`. Each phase ships **one usable, testable thing on screen** (its `outcome`); phase 1 proves the core assumption (`${CLAUDE_PLUGIN_ROOT}/references/discipline.md`). Cut each phase as simple as it can be: the smallest slice that still ships something coherent, and a phase that can lose a piece and keep its outcome usable loses it. Simplicity is measured by the outcome, never by a number: no file counts, no task counts.

## 5. Derive the ACs, one at a time

With a drawing, it is the source: every labeled arrow is a behaviour, every crossed boundary an error or empty state to ask about, every `howItLooks` screen a visible state. Without one, the ACs come from the conversation. Minimal, indivisible, testable, each assigned to a phase, each confirmed with the human and persisted before the next. Tiny batches only if they ask. **Never a finished set for one-shot approval**: that is the failure this step guards against. Shape: `{ "id": "AC-1", "text": "...", "done": false, "phase": "<phase id>" }`.

## 6. How it looks (UI features only)

`/shape` may have settled it, and then there is nothing to redo. Empty and the feature has a UI: settle it now, following `${CLAUDE_PLUGIN_ROOT}/references/how-it-looks.md`, and point `data.json` at the result.

With the ACs written you can do the one thing `/shape` could not: **pin the look to them**. A numbered pin on the element, a panel mapping each number to its `AC-<n>`, the visual twin of `covers`. Worth it on a file you authored; a Figma link or a canvas gets no pins, and that is fine.

## 7. Audit

Walk the ACs against: multiplicity, lifecycle (CRUD), ownership, empty state, failure modes, boundaries, dependencies, temporal triggers. Resolve every gap with the human, update `data.json`. Then `craft:evaluate` (`Agent`) on the cut: the board's path, `phases[]` and `what[]`. An AC that is not testable, two that contradict each other, a claim about the code that is not true, each comes back as a finding. Resolve each with the human before presenting.

## 8. Leave

Show the board; iterate until they approve. Then `/build <slug>`. The board stays up.

## Guardrails

- **WHAT, not HOW.** No decisions, architecture, types, file paths or tasks: those are `/build`'s. At spec time the board's Decisions and HOW columns are empty **by design**.
- **The human decides what the thing is.** There is no mode that hands that over.
