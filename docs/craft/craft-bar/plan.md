# Craft bar: plan

## What

Craft gains a TypeScript mod that draws one line above the prompt with the slug, the phase, a square per slice while implementing and the running craft agent, and a `/craft:bar` command that hides or shows it. `hooks/hooks.json` names `hooks/register.ts`, which holds only the wiring: Claude Code's events, `$` and the drawing. The logic lives in `hooks/bar.ts` as plain functions: reading the slice names from `slices.md`, finding the slug, keeping the state, and saying what the line holds as a list of coloured pieces that `register.ts` turns into `Box` and `Text`. `register.ts` passes `bar.ts` plain values, never `$`, since a hooks module cannot hand `$` to an imported function. Imports carry no extension, as the built-in mods write them. Every hook awaits what it needs before it reads and replaces the state, so two events that run at once never overwrite each other.

`skills/bar/SKILL.md` makes `/craft:bar` exist, with `disable-model-invocation: true` so Claude never runs it on its own; its body only runs where mods do not, and says in one line that the bar needs Claude Code mods. Paths are resolved from `$.session.root()`, which follows a worktree move. Everything is tested with `claude plugin test` in one file, `tests/bar.test.ts`: the kit fires the events and mocks the clock and the store, and the test answers `$.session.root()` and `$.fs` with its own hooks. When Claude Code loads a plugin that has a mod with `--plugin-dir`, it writes the declarations and their `tsconfig.json` into `.claude-plugin/types/` (which ignores itself in git) and a root `tsconfig.json` that only extends that one; the `bar` slice keeps the root file as Claude Code writes it, so `tsc -p .` type-checks `hooks/` and `tests/` against the running version. The README says how the bar works. `/craft:status` and every other skill stay as they are.

## Acceptance

- Before this session runs a craft phase command or a `craft:` agent, nothing is drawn above the prompt but what Claude Code draws there. Proven by `bar`.
- After `/craft:<phase> <slug>` for `shape`, `plan`, `implement`, `try` or `close`, with `docs/craft/<slug>/` present, the line reads the `craft` label, the slug and the phase. Proven by `bar`. Phase names follow `skills/*/SKILL.md:2`.
- A path inside `docs/craft/<slug>/` as the first argument gives that slug, as `references/work.md:9` reads it. Proven by `bar`.
- For a new idea, the slug is the one folder under `docs/craft/` that appeared after the command ran, shown once a main-loop turn ends; until then the line shows the phase alone. Proven by `bar`. Follows `references/work.md:15`.
- `/craft:status`, `/craft:wtf` and agents of other types change nothing on the line. Proven by `bar`.
- While the phase is `implement`, the line shows one square per `### ` slice of the work's `slices.md` and how many are built of the total. Proven by `bar`. Reads the format of `references/slice.md:3`.
- A running `craft:build` agent whose prompt holds `### <name>` on a line of its own, below other lines, turns that slice's square to building. Proven by `bar`. Follows `skills/implement/SKILL.md:18`.
- A slice's square turns built once one of its builders has ended, and building again while a relaunched builder runs. Proven by `bar`.
- Two craft agents spawned at the same moment are both kept. Proven by `bar`.
- While a craft agent runs, the line ends with a spinner frame, the oldest running agent's name (its slice, or its type without `craft:`), its elapsed time as `m:ss`, and `+N` for the others; with none running, no spinner. Proven by `bar`.
- `/craft:bar off` hides the line and `/craft:bar on` shows it, each answering one line of text and kept in the store for every session; a bare `/craft:bar` switches it. Proven by `bar`.
- While a survey holds the band, the mod draws nothing of its own. Proven by `bar`.
- `hooks/` and `tests/` type-check with `tsc` against the declarations Claude Code generates for the running version. Proven by `bar`.
- The README says the bar shows above the prompt, that `/craft:bar off` hides it and `/craft:bar on` brings it back. Proven by `readme`. The README also shows `look/band.png`, a capture of `look/band.html`.
