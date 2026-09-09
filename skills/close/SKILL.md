---
name: close
description: Reconcile the living board against what was actually built. Trues up data.json, graduates gotchas to CLAUDE.md and terms to the glossary, and proposes commits. The final step after /build. Use after completing implementation work, when the user says "done", "let's commit", "wrap up", or wants to close a feature.
disable-model-invocation: true
argument-hint: feature-slug
allowed-tools: Read, Edit, Write, Glob, Grep, Bash, Skill
---

Part of the **Craft** methodology (Shape → Spec → Build → **Close**).

Close reconciles the **living board** (`docs/craft/<feature>/data.json`) against what was actually built, graduates the durable findings, and proposes commits. Because `/build` kept the board current as it worked (its persistence rule), close is mostly a **final truth-up + graduation + commit**, not a from-scratch reconstruction.

**Collaboration mode** (`references/modes.md`), default **`in the loop`**: the reconciliation, what graduates to `CLAUDE.md` / `decisions.md`, and the commits are the human's calls, surfaced, never silent. (Close is `disable-model-invocation: true`: the human always invokes it.)

## 0. Resolve feature
Arg given → that slug. No arg → the `in-progress` feature (its `data.json`); if several, ask. If none, reconcile the session's git changes without a feature.

## 1. Reconcile the board against reality
Open the board with `/craft:board <feature>` so the reconciliation is visible. Run `git diff` and `git status` to see what actually changed. Walk `data.json` against it:
- Each **task** → `status` matches reality (`done` only if truly done). Note any deviation from the planned approach.
- Each **AC** (`what`) → mark `done` where the built code satisfies it; flag any **partial or unbuilt** AC for a user decision; add an AC for behavior built beyond the original WHAT.
- **Coverage holds**: every AC still covered by ≥1 task (no new gaps).
- **The visuals**: `howItWorks` still draws the mechanism that got built, `howItLooks` still shows the screen that shipped. Drift is a finding, not a detail: redraw it, or say on the board that it is stale and why.
The board IS the record; make it accurate. It should already be close (build persisted as it went); fix any drift.

## 2. Graduate the durable findings: sparingly
The board's `frictions` are the staging area. Promote **almost nothing**.
- **Cross-cutting gotchas / conventions** → `CLAUDE.md` (durable, always-loaded), only if a frontier model couldn't infer it from the code. One line each.
- **Cross-cutting decisions** → `docs/craft/decisions.md`, a **tribunal with presumption of guilt**. An entry must clear all four, cross-feature, impossible-to-infer, important, stable, or it doesn't go in. Passes → write it **telegraphically** (one line). `/close` is the only writer. **Create the file only when something genuinely passes**: if it doesn't exist, seed it with the tribunal header before the first entry, the mission + the four criteria + "telegraphic; only /close writes". Nothing qualifies → no file.
- **Terms the feature coined** (a module, a boundary, a word you and the human ended up using) → the glossary in `CONTEXT.md`, one line each with its `_Avoid_`. A term born while building dies here unless someone writes it down.
- Feature-specific frictions stay in the board.
Default to NOT saving. When in doubt, the code and git are the record.

## 3. Settle the open assumptions
Walk every `assumptions[]` entry still `open`. For each: did it hold? Set `resolved` or `invalidated`. An invalidated one is a finding, not a shrug: say what it costs now and whether it needs a follow-up. Anything still genuinely unknown stays `open` with its `checkAt` moved forward, never silently dropped.

## 4. Propose commits
Propose **atomic commits with WHY-focused messages**. Present them for approval, **never commit without it** (no proactive commits). **No AI / "Claude" attribution in commit messages** (project rule). No destructive git operations.

## Guardrails
- **Be brief and pragmatic**: close is a truth-up, not a report. One sentence where one sentence does; don't ramble.
- Save only what a frontier model couldn't infer from the code. When in doubt, don't save it.
- Board↔reality reconciliation is mandatory, the board must match what was built.
- Gotchas graduate to `CLAUDE.md`; don't leave durable lessons buried in a feature doc.
- No commits without explicit user approval. No AI attribution. No destructive git.
