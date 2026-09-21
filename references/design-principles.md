# Craft design principles

Why the methodology is shaped the way it is. Skills, schema fields, and templates inherit these.

## One feature, one place
Everything Craft produces for a feature lives in a single home: its **board** (`docs/craft/<feature>/data.json`, rendered by the shared template, live-reloading). How it works, how it looks, the WHAT (acceptance criteria), the HOW (decisions + tasks), execution status, and frictions. All in one view, never scattered across `shape.md` / `spec.md` / `tech-plan.md`. When a new kind of artifact appears (e.g. shaping findings), it gets a place **on the board**, not a separate file.

## Better format, for humans
Human-facing artifacts are HTML built for legibility (colors, shapes, arrows, live reload), not raw markdown. (Agent-only references stay markdown; the repo README is the one human-facing exception, by GitHub convention.)

## The board is the truth; the HTML is a view
`data.json` is the single source of truth; the HTML is generated from it. Edit the JSON, the view live-reloads.

## Lenses vs producers
The lifecycle skills (`/shape` → `/spec` → `/build` → `/close`) **produce** the feature; their output lives on the board. `craft:evaluate` and `craft:review` are **lenses**: they audit, they do not own board content, and they run in a fresh context so they never inherit the author's reasoning. "One feature, one place" governs producers; lenses are exempt.

Explaining is not a lens of its own. `/shape` teaches while it interviews (explain before asking, never from memory), so understanding is a move inside a producer, not a skill beside it.
