---
name: spec
description: Define WHAT to build, as a living visual doc. Without an argument, shows the feature dashboard. With a feature slug, runs a collaborative Q&A and writes the feature's data.json (north star, acceptance criteria, phases with usable outcomes) — birthing the board (craft-serve) so the WHAT appears on screen as you define it. Decisions and tasks come later in /build.
disable-model-invocation: false
argument-hint: [feature-slug]
allowed-tools: Read, Edit, Write, Glob, Grep, Bash, AskUserQuestion, Agent
---

Part of the **Craft** methodology (Explore (optional) → **Spec** → Build → Close).

Spec produces the **WHAT** (never the HOW). It writes the feature's `docs/specs/<feature>/data.json` and **ensures the living board is up** (`craft-serve`) — born here, or already at `/explore` if you ran it — so the WHAT renders on screen as you define it. The same doc `/build` later fills with tasks. Contract: `~/code/craft/lib/schema.md`. All content is **English** (canonical), regardless of interaction language.

WHAT = `feature`, `tagline`, `northStar`, `what` (acceptance criteria), `phases` (with usable `outcome`s). **NOT** decisions, tasks, architecture, or file paths — those belong to `/build`.

**Collaboration mode** (`references/modes.md`) — default **`in the loop`**: the human is in every decision at the smallest grain. The numbered flow below *is* the in-the-loop flow — the spine (northStar + phases) first, then ACs **one at a time**. In `above the loop`, compress it: take the goal, draft the spec, present at the end.

## Without an argument — Dashboard
Ensure the server is running (`node ~/code/craft/lib/craft-serve.js --root docs/specs --repo <repo-root> --port 7331`) and open `http://localhost:7331/` — the visual dashboard: every feature as a card (status, phase progress, AC coverage, dependency chips) + cross-cutting decisions; click a card to open its board. Read-only.

## With an argument — Spec mode

### 1. Bootstrap
Check/create `docs/specs/<feature>/`. If `data.json` exists, you are **updating** — read it first. Otherwise write a minimal skeleton (`feature`, `tagline`, empty `what` and `phases`) so the board has something to render. Read `docs/specs/decisions.md` (cross-cutting decisions to respect — **read-only**; only `/close` writes there) and flag any conflict.

### 2. Ensure the board is live
Run the **`craft-serve`** check-and-launch (idempotent): it `curl`s `http://localhost:7331/` and, **only if down**, launches the server as a **visible tracked background process** — never a second one. The user may also have started it in their own terminal; either way it's respected. Then open this feature's board at `http://localhost:7331/f/<feature>/`. As you fill `data.json`, the WHAT shows up live; it stays up through build and close.

### 3. Critical analysis — collaborative (the heart)
Discussion proportional to complexity. Challenge assumptions (edge cases, implicit requirements, conflicts with existing specs). Detect gaps (error/empty states, permissions, boundaries). Propose simpler or reusable approaches. **Reject vague words** ("basic", "simple", "standard") until the behavior is concrete. Use `AskUserQuestion` — one focused round at a time, prioritized by impact.

### 4. Agree the spine — northStar, then phases (before any ACs)
Set `northStar` (the usable outcome of the whole feature — what "done" feels like). Then, **if the feature has more than one usable slice**, propose `phases[]` and get buy-in *before* deriving any acceptance criteria — the spine bounds the AC work that follows and keeps it from sprawling. Each phase is a **vertical slice that ships ONE usable, testable thing on screen** (its `outcome`); Phase 1 proves the core assumption. Scope discipline (`references/discipline.md`): ≤ ~4 phases, else split into features. A single-slice feature has no phasing step — go straight to step 5.

### 5. Derive the WHAT — one AC at a time (in the loop)
With the spine agreed, derive acceptance criteria **in minimal, indivisible units, one at a time** (or tiny batches — the human's live dial), each assigned to a phase, confirming each with the human and persisting to `data.json` as you go (the board updates live). **Never present a finished set of many ACs for one-shot approval** — that is the failure this guards against. Each: `{ "id": "AC-1", "text": "...", "done": false, "phase": "<phase id>" }`, concrete and testable. (UI feature? `mockup` comes in step 6.)

### 6. Visual design gate (UI features only)
If the feature has a UI, address the design now (skip for backend-only):
1. Ask whether the user already has a design or a reference to follow.
2. Two paths (no external services): (a) **author the annotated mockup yourself**, following `~/code/craft/lib/mockup-guide.md` — a self-contained `docs/specs/<feature>/mockup.html` with pins linking elements to their decisions/ACs; (b) skip and note it.
3. Point `data.json` at it (`"mockup": { "title", "file": "mockup.html" }`). It renders at the top of the board ("What we're building") and cross-checks the ACs against the intended UI.

### 7. Spec audit
Self-evaluate the ACs against: multiplicity, lifecycle (CRUD), ownership, empty state, failure modes, boundaries, dependencies, temporal triggers. Surface gaps, resolve with the user, update `data.json`.

### 8. Present + register
Show the board for review; iterate until the user approves. Then update `docs/specs/index.yaml` (name, title, status, priority, phases, depends-on).

### 9. Transition
Suggest `/build` (decisions + tasks + code on top of this WHAT) or `/evaluate` (audit). Leave the board running.

## Guardrails
- **WHAT, not HOW.** No decisions, architecture, types, file paths, or tasks — those belong to `/build`. At spec-time the board's Decisions and HOW (tasks) columns stay empty **by design**; that is correct, not missing.
- **In the loop by default** (`references/modes.md`): agree the spine (northStar + phases) first, then derive ACs **one at a time** — never present a finished AC set for one-shot approval.
- Coverage (every AC ↔ ≥1 task) is verified in `/build`; here just make every AC concrete and assigned to a phase.
- All `data.json` content English.
- Do not overwrite an existing `data.json` without consent.
- Dashboard mode is read-only.
