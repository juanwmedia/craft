---
name: close
description: Reconcile the living board against what was actually built. Trues up data.json, settles the open assumptions, graduates the few durable findings to docs/craft, puts the diff to a fresh-context reviewer, and proposes commits. The final step after /build. Use when the user says "done", "let's commit", "wrap up", or wants to close a feature.
disable-model-invocation: true
argument-hint: feature-slug
allowed-tools: Read, Edit, Write, Glob, Grep, Bash, Skill, Agent
---

Craft: Shape to Spec to Build to **Close**.

Close answers **what actually shipped, and what of it must outlive the feature**. Because `/build` kept the board current, this is a truth-up, not a reconstruction: brief, one sentence where one does.

Board: `docs/craft/<slug>/data.json` (contract: `${CLAUDE_PLUGIN_ROOT}/lib/schema.md`). The reconciliation, what graduates and the commits are the human's calls, surfaced, never silent (`references/modes.md`, shared with `/build`).

## 0. Resolve the feature

Arg given: that slug. None: the `in-progress` feature; several, ask. None at all: reconcile the session's git changes without a board.

## 1. Reconcile the board against reality

`/craft:board <slug>` with `Skill`, so the reconciliation is visible. Read `docs/craft/CONTEXT.md` and follow its pointers; none yet (`/shape` never ran): create it from `${CLAUDE_PLUGIN_ROOT}/references/context-template.md` before anything graduates. Then `git diff` and `git status`, and walk `data.json` against them:

- Each **task**: `status` matches reality, `done` only if truly done. Note any deviation from the planned approach.
- Each **AC**: `done` where the code satisfies it; a partial or unbuilt one is the human's decision; behaviour built beyond the WHAT gets an AC.
- **Coverage** still holds: every AC covered by at least one task.
- **The visuals**: `howItWorks` still draws the mechanism that got built, `howItLooks` still shows the screen that shipped. Drift is a finding: redraw, or say on the board that it is stale and why.

## 2. Settle the open assumptions

Every `assumptions[]` entry still `open`: did it hold? `resolved` or `invalidated`. An invalidated one is a finding, not a shrug: say what it costs now and whether it needs a follow-up. Still unknown: stays `open` with `checkAt` moved forward, never dropped in silence.

## 3. Graduate, sparingly

The board's `frictions` and the invalidated assumptions are the staging area. Promote **almost nothing**: only what a frontier model could not infer from the code, and when in doubt, the code and git are the record.

- **Cross-cutting gotchas and conventions**: `docs/craft/conventions.md`, one line each.
- **Cross-cutting decisions**: `docs/craft/decisions.md`, a **tribunal with presumption of guilt**. An entry clears all four, cross-feature, impossible to infer, important, stable, or it does not go in. One telegraphic line. The file is created only when something passes, seeded with the tribunal header (the mission, the four criteria, "telegraphic; only /close writes").
- **Terms the feature coined**: `docs/craft/glossary.md`, one line each with its `_Avoid_`. A term born while building dies here unless someone writes it down.
- Feature-specific frictions stay on the board.

Before writing a line to any of the three, `/craft:evaluate` on the graduation list with `Skill`: a false claim that graduates here is permanent. `/close` is the only writer of `conventions.md` and `decisions.md`; the glossary is `/shape`'s first, and `/close` grows it. Craft never writes `CLAUDE.md`: a line that belongs there is said in the report, and the human copies it or not.

## 4. Review, then propose commits

`craft:review` (`Agent`) with the frozen ACs and the full diff: it grades the result, not the reasoning that produced it. Every `refuted` reaches the human before anything else. Then propose **atomic commits with WHY-focused messages** and wait for approval.

## Guardrails

- Never commit without explicit approval. No AI attribution in commit messages. No destructive git.
- Never leave a durable lesson buried in a feature doc, and never save one the code already tells.
