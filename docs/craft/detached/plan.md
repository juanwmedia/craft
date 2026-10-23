# Detached

## What

Craft gets a second mode. With `craft.detached` set to `true` in the repository's local git config, every decision a phase would hand to the human goes to `craft:act-as-me`, a new agent on Fable 5.1 that answers in a fresh context as an extremely pragmatic senior software engineer who takes nothing for granted, and each answer is appended to `detached.md` in the work's folder with its phase, question, answer and why. No rule in craft hands a decision to "the human" any more: every one of them hands it to whoever answers, and `references/ask.md` says who that is in each mode. `/craft:detached on|off` flips the flag, the bar says `detached` while it is on and gains an X that hides it, and every phase but implement gets an eval that runs it with the flag on. The first slice proves the one assumption the shape hangs on: an agent whose frontmatter says `model: fable` answers as Fable. The version goes to 4.9.0.

## Acceptance

- Launched from a session on this plugin, `craft:act-as-me` names `claude-fable-5-1` as its model. Proven by `agent`.
- With the flag on, `/craft:shape` on a new idea asks `craft:act-as-me` for its decisions, the final confirmation of the draft included, writes `shape.md`, and leaves `detached.md` in the work's folder with the phase, each question, its answer and why. Proven by `agent`.
- With the flag on, `/craft:plan <slug>` has its approval of `plan.md` and `slices.md` answered by `craft:act-as-me` and logged in `detached.md`. Proven by `plan-detached`.
- With the flag on, `/craft:implement <slug>` hands a need that its owner's slice contradicts to `craft:act-as-me`, logs it and never commits. Proven live in `/craft:try detached`, as the human chose while building.
- With the flag on, `/craft:try <slug>` has a try that would leave the machine decided by `craft:act-as-me`, logs it, writes `try.md` and changes no code. Proven by `try-detached`.
- With the flag on, `/craft:close <slug>` has its commit, branch and pull request question answered by `craft:act-as-me`, logs it, and commits and pushes on a yes. Proven by `close-detached`, whose sandbox lets the push be attempted but not received; the real push is in `try.md`.
- `references/worktree.md`, `references/review.md` and the plan, implement, try and close skills name no human and no `AskUserQuestion` when they hand over a decision: each asks as `references/ask.md` says. Proven by `rules`, whose check greps the word human in all six and `AskUserQuestion` in the worktree offer, try and close, the three that named it.
- `/craft:detached on` sets `craft.detached` to `true` in the repository's local git config, `/craft:detached off` removes it, and each answers one line naming the mode. Proven by `detached-skill`.
- While the flag is `true`, the bar draws `detached` after the phase, and drops it once a main-loop turn ends with the flag gone, as a piece after the phase piece at `hooks/bar.ts:127`. Proven by `bar`.
- A press on the X at the end of the bar hides it and keeps the choice in the store, as `/craft:bar off` does at `hooks/register.ts:89`. Proven by `bar`.
- The README names `/craft:detached on`, `craft:act-as-me`, `detached.md` and the routine's first message; the changelog has a 4.9.0 entry and the plugin manifest says 4.9.0. Proven by `docs`.
- Both switch skills, `/craft:detached` and `/craft:bar`, can be invoked by the model, so a prompt written in words turns the mode on. Proven by `bar-skill`; the path from words was seen live in `try.md`.
