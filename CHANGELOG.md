# Changelog

## 4.9.0

Detached mode: craft carries a piece of work with nobody at the keyboard.

- `/craft:detached on` turns it on and `/craft:detached off` ends it. A routine starts with `/craft:detached on` as its first message, or asks for the mode in words, since both `/craft:detached` and `/craft:bar` can now be called by the model.
- While it is on, every question a phase would put to you (shape, plan, implement, try and close, approvals and confirmations included) goes to the new agent `craft:act-as-me`, which runs on Fable 5.1 in a fresh context and answers as an extremely pragmatic senior software engineer who takes nothing for granted. It checks the code first, answers with one option, given or its own, and why, and says `Cannot decide` with what is missing instead of inventing. When it cannot decide, or does not start, the phase stops and names the question.
- The mode is the flag `craft.detached` in the repository's local git config: per repository, outside the tree, never committed.
- Each answer is appended to `detached.md` in the work's folder with its phase, the question, the answer and why, in order. It is the file to read in the morning, next to the pull request.
- Close commits, pushes and opens the pull request when `craft:act-as-me` says yes. The yes is logged in `detached.md` before the commit, so the commit carries it, and close says who gave it. You review the pull request.
- The craft bar shows `detached` after the phase while the mode is on, and ends with an `x` that hides it, the same as `/craft:bar off`.
- Four evals grade the detached path of shape, plan, try and close on the trace and the files: no `AskUserQuestion` call, `craft:act-as-me` started for the questions, the entry in `detached.md`.
- Without the flag the human answers every question, as before. Every rule now asks as `references/ask.md` says, instead of naming the human or `AskUserQuestion` itself.

## 4.8.1

- In shape and plan, the first evaluate pass audits only what the work rests on: decisions and assumptions against the code, each acceptance line against its slice's check, each slice against the slice rules. Wording and agreement between documents wait for close. Measured on one closed work with six planted defects, three of substance and three of wording: three scoped runs found the three of substance every time, skipped the wording, and took about a third less than three full runs.
- Every agent names its model: evaluate and review run on Opus, build on Sonnet, whatever model the session uses.

## 4.8.0

The craft bar: one line above the prompt that says what craft is doing in this session, without asking Claude or spending a turn.

- It shows the work's slug and its phase as soon as a craft phase command runs (`shape`, `plan`, `implement`, `try`, `close`).
- While implementing, one square per slice: building while its builder runs, built once it ends, waiting otherwise, with how many are built of the total.
- A spinner with the running craft agent (its slice, or `evaluate`, `review`), its elapsed time, and `+N` when more run at once.
- `/craft:bar off` hides it in every session and `/craft:bar on` brings it back.
- It ships as a TypeScript mod inside the plugin and needs Claude Code 2.1.287 or later with mods turned on. Elsewhere craft works as before, and `/craft:bar` says the bar is not available.
- `/craft:status` and every other skill are unchanged.

Tried live on a four-slice work built in three waves: the squares and the spinner followed every builder, including two that started together.

Earlier releases are on [GitHub](https://github.com/juanwmedia/craft/releases).
