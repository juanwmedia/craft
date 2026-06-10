# Craft design principles

Why the methodology is shaped the way it is. Skills, schema fields, and templates inherit these.

## One feature, one place
Everything Craft produces for a feature lives in a single home — its **board** (`docs/specs/<feature>/data.json`, rendered by the shared template, live-reloading). Exploration, the WHAT (acceptance criteria), the HOW (decisions + tasks), execution status, frictions, and any mockup — all in one view, never scattered across `explore.md` / `spec.md` / `tech-plan.md`. When a new kind of artifact appears (e.g. exploration findings), it gets a place **on the board**, not a separate file.

## Better format, for humans
Human-facing artifacts are HTML built for legibility — colors, shapes, arrows, live reload — not raw markdown. (Agent-only references stay markdown; the repo README is the one human-facing exception, by GitHub convention.)

## The board is the truth; the HTML is a view
`data.json` is the single source of truth; the HTML is generated from it. Edit the JSON, the view live-reloads.

## Lenses vs producers
The lifecycle skills (`/explore` → `/spec` → `/build` → `/close`) **produce** the feature; their output lives on the board. `/evaluate` (audit) and `/understand` (explain) are **lenses** — they review or teach, they don't own board content. "One feature, one place" governs producers; lenses are exempt (but still default `in the loop`).
