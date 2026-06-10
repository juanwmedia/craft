---
name: explore
description: Hands-on technology exploration before design decisions. Use when the user faces a new library, SDK, framework, or needs to evaluate competing approaches (WebSocket vs SSE, Pinia vs composables). Also for feasibility questions ("is this even possible?") and migrations. Writes the capabilities map onto the feature's living board (data.json `exploration`) — born here, shared with /spec and /build.
disable-model-invocation: false
argument-hint: [feature-slug]
allowed-tools: Read, Edit, Write, Glob, Grep, Bash, WebFetch, WebSearch, Agent
---

Part of the **Craft** methodology (**Explore** (optional) → Spec → Build → Close).

Explore answers: **with what tools, libraries, or approaches should we build this?** It runs BEFORE `/spec` when the user faces technology decisions they can't make without hands-on experience. Its findings live on the **feature's board** (`docs/specs/<feature>/data.json`, field `exploration`) — the same board `/spec` and `/build` later fill, so everything for the feature stays in one place (`references/design-principles.md`). Contract: `~/code/craft/lib/schema.md`. All content **English** (canonical).

**Collaboration mode** (`references/modes.md`) — default **`in the loop`**: hands-on is user-driven (step 3), and the exploration is assembled *with* the human as you go, persisted to the board live — never dumped as a finished doc at the end. In `above the loop`, research and present the map at the end.

## When to use
- New library, SDK, or framework the user hasn't used before
- Evaluating competing approaches (WebSocket vs SSE, Pinia vs composables)
- Feasibility questions ("is this even possible?")
- Migrations or upgrades
- User provides documentation/release notes and wants to understand implications

Skip when tools are known and the user just wants to build (go to `/spec`).

## How it works

### 1. Understand the question + birth the board
If a feature slug is provided, check/create `docs/specs/<feature>/`; else ask what technology question needs answering and suggest a slug. Write a minimal `data.json` (`feature` + an empty `exploration`) so the board has something to render, then run the **`craft-serve`** check-and-launch (idempotent — never a second server) and open `http://localhost:7331/f/<feature>/`. Read `docs/specs/decisions.md` (project-wide cross-cutting decisions to respect — **read-only**; only `/close` writes there).

The question is: **what tool, library, or approach do you need to understand before you can plan?** Set `exploration.question`.

### 2. Research
Read documentation (Context7, WebFetch, user-provided URLs). Check compatibility with the project's stack. Understand the API surface, core concepts, and constraints. Present a summary to the user before going hands-on.

### 3. Hands-on exploration (the core)
Guide, don't do. The user touches the technology:
1. Install the tool
2. Minimal "hello world" — prove it works
3. Try features relevant to the project
4. Push boundaries — find limits and gotchas

For each step: explain what we're testing and why, suggest the command/snippet, discuss what happened after. Encourage deviation — "what happens if you change X?" The unexpected results teach most. As each thing is confirmed, persist it to `data.json` `exploration` live (a capability with `tested:true`, a constraint, a source) — the board's Exploration section fills as you go, in the loop.

### 4. Evaluate findings
- Each capability marked `tested:true` (verified hands-on) or `tested:false` (assumed from docs).
- List the constraints found.
- Challenge assumptions — "what if this doesn't work in production?" → `openQuestions`.
- Record the **technology `decisions`** ("we'll use X because Y", with evidence) in `exploration.decisions` — these are tooling choices, distinct from the design `decisions[]` that `/build` makes.

### 5. The capabilities map IS the board
There is no separate `explore.md`. The `exploration` object on `data.json` **is** the capabilities map; it renders in the collapsed **"Exploration"** section at the foot of the board. By now it holds `question`, `capabilities` (tested/assumed), `constraints`, `decisions`, `openQuestions`, and `sources`. Make sure it's accurate and complete.

### 6. Transition
Suggest `/spec <feature>` to define what to build — it opens the **same board** and fills the WHAT on top of your exploration, so spec and build see what you learned.

## Guardrails
- Explore answers technology questions, not product questions. Features → `/spec`.
- Hands-on is mandatory. No capability marked `tested` from docs alone — verified vs assumed must be explicit.
- No production code during explore. Throwaway experiments only.
- The user drives. Suggest, don't dictate (`references/modes.md`, default `in the loop`).
- Everything lives on the board — no separate `explore.md` (`references/design-principles.md`).
