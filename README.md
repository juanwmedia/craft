# Craft

The human decides the domain in shape and plan, and the models infer everything after it. A good `shape.md` and `plan.md` carry enough context for every later choice, so the work keeps going on its own, retrying and fixing what fails, and reaches the human only when it needs a decision those documents did not make or something that is not code breaks.

A reviewer always finds something, so reviewing the same thing again and hoping it comes back clean never ends. The orchestrator, which holds the context found along the way, narrows every review after the first to what the last fixes changed and the findings they answer, closing in like concentric circles. Only judgment narrows: every mechanical check still runs over the whole change after each fix, so a fix that breaks something outside the circle is still caught.

## Flow

A feature is named by its slug, the same word in every command, and everything written about it lives in `docs/craft/<slug>/`.

Each feature runs in its own worktree. When a new one starts in a tree with uncommitted changes, shape and plan offer to move it to a new worktree first, and write `.worktreeinclude` when the repo has none. In the desktop app, Worktree location set to Custom keeps the trees outside the repo.

1. `/craft:shape <idea>` settles what we are building with you and writes `shape.md`.
2. `/craft:plan <slug>` splits it into slices that never share a file, with a check each, and writes `plan.md` (what the whole must do) and `slices.md` (the slices) once you approve it.
3. `/craft:implement <slug>` builds every slice it can in parallel, retries what fails, and reviews the whole change once every slice is built. When the Acceptance needs a file no slice owns, it adds a slice to `slices.md` itself, but it never touches `plan.md` and never commits.
4. `/craft:close <slug>` reconciles `shape.md`, `plan.md` and `slices.md` with what was actually built, because they will have drifted: the slices, the assumptions that held or broke, the drawings that no longer match. It keeps the few lessons the code cannot tell, then commits and pushes so you can deploy it to testing.

When something changes, before or after a deploy, name the slug and say what changed: `/craft:plan <slug> <what changed>`, then implement and close again. Every command is safe to run again: it works only on what changed or is still missing.
