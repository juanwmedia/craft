# Changelog

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
