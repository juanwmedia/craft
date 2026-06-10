# Craft Visual — feature data schema (the contract)

A feature's **truth** lives in `docs/specs/<feature>/data.json`. The shared template
(`lib/doc-template.html`) renders it; `lib/craft-serve.js` serves it live with `/diff`
and live-reload. This file is the contract every view depends on — **keep field names
stable**, because multiple views (spec doc, dashboard, future templates) read them.

Conventions:
- Truth is structured (this JSON). HTML is **generated**, never hand-edited.
- All content is **English** (the canonical language).
- `weight: "substantial"` ⇒ always a **gate** (I stop, even when the dial is loosened). `"trivial"` ⇒ still stops by default `in the loop`; streams only when the human dials it loose.
- A slice is "done / usable" when its related `what` (acceptance criteria) flip to `done`.

---

## Top level

| field | type | presence | meaning |
|-------|------|----------|---------|
| `feature` | string | always | Display name. |
| `tagline` | string | always | One line: what + why. |
| `northStar` | string | always | The usable outcome — what "done" feels like, not a skeleton. |
| `phases` | array | conditional (multi-phase) | Delivery increments — each a vertical cut that puts something **usable on screen** (its `outcome`). See below. |
| `decisions` | array | always | The **How** — design decisions with their why. See below. |
| `tasks` | array | always (during build) | The work, live. See below. |
| `what` | array | always | Acceptance criteria. See below. |
| `frictions` | array | conditional | Known traps / blind spots. See below. |
| `mockup` | object | conditional (UI features) | `{ title, file }` → a self-contained HTML file in the feature dir, authored following `mockup-guide.md`, embedded in an iframe. The bespoke-visual escape hatch (same idea as an Explore SVG diagram). |
| `dependsOn` | array | optional | Feature slugs this one depends on — rendered on the dashboard as chips (colored by the dep's status). |
| `exploration` | object | conditional (if `/explore` ran) | The capabilities map — question, capabilities (tested/assumed), constraints, tech decisions, open questions. Renders in a collapsed section at the foot of the board. See below. |

## `phases[]`  (delivery increments)
`{ "id": "2a", "label": "Phase 2a — clickable slice", "state": "done|active|todo",
   "outcome": "Open /en/spot-the-slop, type a diagnosis, SlopMentat replies." }`
- A phase = a vertical increment that ships **one usable, testable thing on screen** (its `outcome`) — not a skeleton. Max ~4 per feature; more = split into features.
- The board groups tasks (via each task's `phase` field) under their phase header, and the **phase-boundary gate** (`⏸ your turn — go test it`) falls at the end of each phase.
- Tasks with no matching `phase` render ungrouped at the end.

## `decisions[]`  (the How)
`{ "id": "D2", "title": "...", "why": "...", "links": "D4" }`
- `links` (optional): id of a related decision/task, rendered as "↳ links to …".

## `tasks[]`
`{ "id": "T1", "title": "...", "files": "human-readable list",
   "diffFile": "repo/relative/path.ext",   // optional → enables real "view diff"
   "weight": "trivial|substantial",
   "status": "todo|doing|done",
   "phase": "2a",                           // optional → groups under a phases[] entry
   "covers": ["AC-1", "AC-7"],              // optional → the WHAT↔HOW link (acceptance criteria this task satisfies)
   "gate": true,                            // optional → explicit "I stop here"
   "why": "..." }`                          // optional

## `what[]`  (acceptance criteria — the WHAT)
`{ "id": "AC-1", "text": "...", "done": true|false, "phase": "2a" }`
- `phase` groups the AC under its phase block. Every AC must be **covered by ≥1 task** (a task's `covers` includes this AC's id); an AC with no covering task renders as a **gap** (red).

## `frictions[]`
`{ "title": "...", "text": "...", "relatesTo": "T16" }`
- `relatesTo` (optional): an AC id or task id this friction hangs off → it renders inside that phase's block. **Absent ⇒ cross-cutting** → renders in a general "Cross-cutting frictions" block.

## `exploration`  (the capabilities map — from `/explore`)
`{ "question": "...", "capabilities": [ { "text": "...", "tested": true } ], "constraints": ["..."], "decisions": [ { "text": "we'll use X because Y" } ], "openQuestions": ["..."], "sources": ["url"] }`
- Written by `/explore` — replaces the old standalone `explore.md`. Optional: present only when a feature was explored.
- `capabilities[].tested`: `true` = verified hands-on (✓), `false` = assumed from docs (○).
- `decisions` here are **technology** choices (what to build with), distinct from the top-level `decisions[]` (the feature's design/HOW decisions made in `/build`).
- `sources` (optional): doc/reference URLs.
- Renders in a **collapsed "Exploration" section at the foot of the board** — the research origin, present but tucked away.

---

## Storage model (decision A)
- `data.json` = the committed truth (small, diffs cleanly).
- `lib/doc-template.html` = the shared view (CSS + renderer), evolved **once** for all features.
- Served: `craft-serve` injects `data.json` into the template at request time (live-reload on data change).
- Offline / GitHub / sharing: `craft bake <feature>` produces a single self-contained HTML with the data embedded.
- The template supports both: if an embedded `#feature-data` block is present it uses it (baked); otherwise it fetches `./data.json` (served).
