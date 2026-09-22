---
name: shape
description: Give what you are about to build its shape before anything is specified, a feature in a project, a project from nothing, or an idea with no repo yet. Interviews you until nothing blocking is open, looks facts up in the code instead of asking, proves technology hands-on, and draws how it works on the feature board. Use before /spec.
disable-model-invocation: true
argument-hint: [feature-slug | context]
allowed-tools: Read, Write, Edit, Glob, Grep, Bash, WebFetch, WebSearch, AskUserQuestion, Skill, Artifact, EnterWorktree
---

Craft: **Shape** to Spec to Build to Close.

Shape answers **what are we building, and does it hold up**.

Board: `docs/craft/<slug>/data.json` (contract: `${CLAUDE_PLUGIN_ROOT}/lib/schema.md`). All board content is English.

## Produces

- `resolved[]`: every question answered, each with the why behind it.
- `exploration`: capabilities marked tested or assumed, constraints, sources, decision candidates.
- `howItWorks`: the mechanism drawing at `how-it-works.svg`.
- `assumptions[]`: what you are betting on, what breaks if it is wrong, when it gets checked.
- `howItLooks`: the look, when it gets settled here rather than in `/spec`.
- `artifacts[]`: published visuals, `url` plus local `file`, only when asked for.
- Glossary terms, written straight into `docs/craft/glossary.md`.

Nothing else. Idea mode may produce none of it.

## 0. Route

Slug given, feature mode. Kebab-case.
A repo with no code and no slug, a project to start: ask the three lines (what it is, for whom, built with what) and the first feature's slug, then feature mode; `docs/craft/CONTEXT.md` from the three lines is written in the chosen tree. "Start it" or "only test the idea" is a closed fork: `AskUserQuestion`.
No repo, idea mode: a throwaway prototype, no board until the idea survives.

Feature mode: the Offer (`${CLAUDE_PLUGIN_ROOT}/references/worktree.md`) settles the tree, **before anything is written**. Then, in the chosen tree, `docs/craft/<slug>/`: a `data.json` already there means you are resuming, read it and never overwrite it; none: write a minimal `data.json` (`tree` first when a tree was opened, as Open says). Open the board with `/craft:board <slug>`. Read `docs/craft/CONTEXT.md` and follow its pointers (read-only). No `CONTEXT.md` yet: create it from `${CLAUDE_PLUGIN_ROOT}/references/context-template.md`, the project in three lines plus the pointers.

## 1. Interview until nothing blocking is open

Ask **every question that can be answered now, in one numbered round**, each carrying your recommended answer. Then wait. A question that depends on an answer you have not heard yet belongs to a later round.

- **Facts are your job, decisions are theirs.** If the code answers it, read the code. Never ask what you can look up.
- Explain before asking when the question needs context, and never explain a component from memory. Read it first. Pitch it at their level: CLAUDE.md and the conversation say what they already know.
- Challenge. Offer the simpler shape when you see one.
- `AskUserQuestion` for real forks.
- Write each answer to `resolved[]` with its **why**. Persist as you go, never at the end.
- An answer you cannot get today is not a blocker. Write it as an `assumption` with what breaks if it is wrong, and move on.
- Done when nothing **blocking** is open and they confirm. Not when you run out of questions.

## 2. Prove what you assumed

Only for technology you cannot settle by reading. They touch it, you guide: install, hello world, the features this feature needs, then push until it breaks. Encourage deviation, the unexpected result teaches most. Mark each capability `tested: true` (hands-on, or confirmed by reading this repo's code) or `false` (assumed from docs alone). Record constraints and sources. **The browser is earned, not the default**: use it only for what is observable nowhere else, through Claude in Chrome or the Chrome DevTools MCP.

## 3. Draw how it works

Load the `artifact-diagramming` skill (`Skill`) and draw the mechanism by its rules: what earns a diagram, labeled arrows, the boundary the decision turns on, `viewBox`, markers, theming. Never hand-author the SVG without it.

Two things that skill cannot know. The drawing is a standalone file, `docs/craft/<slug>/how-it-works.svg`, not a figure inside a page: no `<figure>`, no `<figcaption>`, the SVG element is the whole file. And the caption is the `caption` field of `howItWorks` in `data.json`, never a line inside the drawing. Reference the file from `data.json` as `howItWorks`; the board inlines it, which is what makes `currentColor` load-bearing here.

**If you cannot draw it, it is not shaped.** One exception: nothing here has a mechanism (no flow, no boundary crossed, no state change). Then write the sentence instead, record it as a finding, and say the thing may be too small to be a feature.

## 4. Settle how it looks, or say you did not

Optional, and cheapest right here because the mechanism is already drawn. Follow `${CLAUDE_PLUGIN_ROOT}/references/how-it-looks.md`. Leaving it to `/spec` is fine; leaving it in silence is not, that is an assumption on the board.

Anything beyond these two visuals is on request only.

## 5. Leave

- `exploration.verifiedAt` gets the current commit (`git rev-parse HEAD`): the SHA the capabilities were verified against, so a later consumer can diff a file against it instead of re-reading everything.
- Glossary terms go to `docs/craft/glossary.md` **now**, one `_Avoid_` line each. Spec reads them minutes later.
- Decision candidates stay in `exploration.decisions`. `/close` decides which reach `docs/craft/decisions.md`.
- Then `/spec <slug>`.

## Guardrails

- No production code. Throwaway experiments only.
- Never `tested: true` from documentation alone.
- Write the visual, look once, publish. Never loop on screenshots. The drawing, and any file inside a worktree, is written with `Write`, never a shell heredoc: the isolation guard refuses them.
- Idea mode may end with nothing on disk. That is a valid outcome.
