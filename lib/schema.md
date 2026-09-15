# Craft Visual: feature data schema (the contract)

A feature's **truth** lives in `docs/craft/<feature>/data.json`. The shared template
(`lib/doc-template.html`) renders it; `lib/board-serve.js` serves it live with `/diff`
and live-reload. This file is the contract every view depends on, **keep field names
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
| `northStar` | string | always | The usable outcome: what "done" feels like, not a skeleton. |
| `phases` | array | conditional (multi-phase) | Delivery increments, each a vertical cut that puts something **usable on screen** (its `outcome`). See below. |
| `decisions` | array | always | The **How**: design decisions with their why. See below. |
| `tasks` | array | always (during build) | The work, live. See below. |
| `what` | array | always | Acceptance criteria. See below. |
| `frictions` | array | conditional | Known traps / blind spots. See below. |
| `assumptions` | array | conditional | What we are betting on while unresolved. Born in any phase, checked by `/close`. See below. |
| `howItWorks` | object | conditional | `{ file, caption }` pointing at the feature's `how-it-works.svg`, hand-authored in `/shape`. The SVG is text: `Read` it, and its labels and arrows are the mechanism. The board inlines the SVG so its `currentColor` follows the theme, so author it in `currentColor`, not literal hues. `caption` is the one-line claim **below** the figure: do not repeat it as a subtitle inside the SVG. |
| `artifacts` | array | conditional | Published visuals with their live URL and their local source. See below. |
| `howItLooks` | array | conditional (UI features) | The look, one entry per screen. See below. Filled in `/shape` or in `/spec`, whichever gets there first. Distinct from `howItWorks`, which is the mechanism. |
| `dependsOn` | array | optional | Feature slugs this one depends on, rendered on the dashboard as chips (colored by the dep's status). |
| `tree` | object | conditional (a tree was opened) | `{ "branch": "worktree-<slug>", "from": "<branch the session was on>" }`. Written first, before any other field, by whoever opened the feature's tree (`${CLAUDE_PLUGIN_ROOT}/references/worktree.md`); `/close` merges into `from`. The field stays after the close, the record of where the feature was built, so whoever reads it checks `git worktree list` before believing the tree is still there. Absent: the feature builds where it is. |
| `exploration` | object | conditional (if `/shape` ran) | The capabilities map: question, capabilities (tested/assumed), constraints, tech decisions, open questions. Renders in a collapsed section at the foot of the board. See below. |

## `phases[]`  (delivery increments)
`{ "id": "2a", "label": "Phase 2a, clickable slice", "state": "done|active|todo",
   "outcome": "Open /en/spot-the-slop, type a diagnosis, SlopMentat replies." }`
- A phase = a vertical increment that ships **one usable, testable thing on screen** (its `outcome`), not a skeleton.
- The board groups tasks (via each task's `phase` field) under their phase header, and the **phase-boundary gate** (`⏸ your turn, go test it`) falls at the end of each phase.
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

## `what[]`  (acceptance criteria, the WHAT)
`{ "id": "AC-1", "text": "...", "done": true|false, "phase": "2a", "evidence": "..." }`
- `phase` groups the AC under its phase block.
- `evidence` is optional and written at `/close`: what was run to satisfy this AC, and what of it was not run. No template renders it; it is there so the next reader can tell a criterion that was exercised from one that was reasoned about.
- Every AC must be **covered by ≥1 task** (a task's `covers` includes this AC's id); an AC with no covering task renders as a **gap** (red).

## `assumptions[]`  (what we are betting on)
`{ "id": "AS1", "text": "Tracking events will exist by phase 3.",
   "ifWrong": "Ships without analytics; a follow-up, not rework.",
   "blocking": false, "checkAt": "phase 3", "relatesTo": "AC-4",
   "status": "open|resolved|invalidated" }`
- `ifWrong` is the field that does the work: without it you cannot judge whether starting is worth it. An assumption with no `ifWrong` is a note.
- `blocking: true` means the phase that owns it cannot exit. In `/shape` that is exactly the completion criterion: you leave when nothing blocking is open.
- Distinct from a `friction`: a friction is something you already hit, an assumption is something you are betting on.
- `checkAt`: a phase id, `close`, or a date. `/close` walks every `open` assumption and asks.
- Rendered as a visible amber card next to the frictions, never collapsed away. A `blocking: true` one renders red, because it is the thing stopping a phase from closing.

## `artifacts[]`  (published visuals)
`{ "id": "A1", "title": "Export flow", "kind": "diagram|mockup|explorable",
   "url": "https://claude.ai/...", "file": "artifacts/export-flow.html", "createdAt": "2026-09-09" }`
- `file` is not optional: republishing the same local source redeploys to the same `url`. Without it, "update it" means rebuilding from scratch.
- The required `how-it-works.svg` is **not** an artifact. It is local, in git, and depends on nothing external.

## `howItLooks[]`  (the look)
`[ { "title": "Export panel", "source": "design|figma|screenshot|authored",
     "url": "https://claude.ai/design/p/<id>?file=<path>",
     "file": "look/panel.png", "width": 1440, "height": 900 } ]`
- **One entry per screen.** A feature with a list, an empty state and a mobile view has three.
- `file` is what the board draws: an image (`.png .jpg .webp .gif .svg`), or an HTML or `.dc.html` file in an iframe scaled to the column by `width`/`height` (defaults 1440x900). `url` is where the entry links out.
- Either may be absent. A Figma entry is a `url` alone; a screenshot is a `file` alone.
- Reading one: a `file` is readable (`Read` shows an image, an artboard is HTML text). A `url` alone is readable only through its MCP (Figma, `claude-design`); without that MCP, say so and go by the `title`. Never describe a link you could not open.
- One entry renders full width, several render as a grid. Screenshots live in `docs/craft/<slug>/look/`.
- Durable URLs only: the `?file=` link to a Claude Design page, the Figma file. Never a preview link with a token in it.
- How to get one: `${CLAUDE_PLUGIN_ROOT}/references/how-it-looks.md`.

## `frictions[]`
`{ "title": "...", "text": "...", "relatesTo": "T16" }`
- `relatesTo` (optional): an AC id or task id this friction hangs off → it renders inside that phase's block. **Absent ⇒ cross-cutting** → renders in a general "Cross-cutting frictions" block.

## `exploration`  (the capabilities map, from `/shape`)
`{ "question": "...", "capabilities": [ { "text": "...", "tested": true } ], "constraints": ["..."], "decisions": [ { "text": "we'll use X because Y" } ], "openQuestions": ["..."], "sources": ["url"] }`
- `resolved`: `[ { "q": "...", "a": "...", "why": "..." } ]` the interview outcome from `/shape`. The `why` is what lets a later phase tell whether the answer still holds.
- `openQuestions` is superseded by top-level `assumptions[]`, which carries an owner, a consequence and a check point instead of a bare string.
- `glossary`: `[ { "term": "...", "is": "...", "avoid": ["..."] } ]` the terms settled while shaping. Also written straight into `docs/craft/glossary.md`, which is what `/spec` reads.
- Written by `/shape`. Optional: present only when a feature was shaped.
- `capabilities[].tested`: `true` = verified hands-on (✓), `false` = assumed from docs (○).
- `decisions` here are **technology** choices (what to build with), distinct from the top-level `decisions[]` (the feature's design/HOW decisions made in `/build`).
- `sources` (optional): doc/reference URLs.
- Renders in a **collapsed "Exploration" section at the foot of the board**: the research origin, present but tucked away.

---

## Storage model (decision A)
- `data.json` = the committed truth (small, diffs cleanly).
- `lib/doc-template.html` = the shared view (CSS + renderer), evolved **once** for all features.
- Served: `board-serve` injects `data.json` into the template at request time (live-reload on data change).
- Offline / GitHub / sharing: `craft bake <feature>` produces a single self-contained HTML with the data embedded.
- The template supports both: if an embedded `#feature-data` block is present it uses it (baked); otherwise it fetches `./data.json` (served).
