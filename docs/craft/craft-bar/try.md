# Craft bar: try

To run it: an interactive `claude --plugin-dir <this worktree>` (2.1.292) in a throwaway git repo holding a planned work `gamma` (four slices, one per file, in three waves), driven through a pseudo-terminal and read from its screen. `/craft:implement gamma` ran for real there and built all four slices. Two headless runs of the same implement, with a probe mod logging what the main loop and the spawns carried, explain what the screen showed. Nothing in this repo's code was run against.

## Results

- **Nothing drawn before craft: passed.** The screen before any craft command shows the prompt with nothing above it but Claude Code's own row. [01-before-craft](try/01-before-craft.txt)
- **Label, slug and phase: passed.** Seconds after `/craft:implement gamma`, the row above the prompt read `craft gamma · implement · □□□□ 0/4`. [02-implement-start](try/02-implement-start.txt)
- **Squares from `slices.md`: passed.** Four squares and `0/4` for gamma's four slices.
- **Spinner, name and time: failed on the name.** A spinner and a ticking `m:ss` showed while each builder ran and went away when it ended, and `review` showed for the `craft:review` agent. But every builder was named `build`, not its slice: implement's prompt opens with its own lines (`Work in this tree, no worktree: ...`) and carries the slice's `### <name>` further down. [03-band-timeline](try/03-band-timeline.txt)
- **`+N` for parallel agents: failed.** Slices `two` and `three` were built at once, and the line showed one `build` and no `+1` for that whole wave. [03-band-timeline](try/03-band-timeline.txt)
- **Square building while its builder runs: failed.** It follows from the name: no builder was matched to its slice, so no square turned building.
- **Square built or red from its check: failed.** All four slices were built and passed, and the line still ended at `□□□□ 0/4`. Implement never ran a check as its `done:` line writes it: it ran them rewritten, as `for n in one two three four; do printf "%s: " $n; out=$(cat src/$n.txt 2>&1); [ "$out" = "$n" ] && echo PASS || echo "FAIL ($out)"; done` and as `cat src/two.txt && cat src/three.txt && git status --short`. [04-implement-end](try/04-implement-end.txt)
- **`/craft:bar off`, `on` and bare: passed.** Each answered one line (`The craft bar is off.`, `The craft bar is on.`, then the bare one `The craft bar is off.`), and the line was gone while off. [06-bar-off](try/06-bar-off.txt), [07-bar-on](try/07-bar-on.txt), [08-bar-bare](try/08-bar-bare.txt)
- **Yields to a survey: passed.** After `/craft:bar on`, Claude Code's session survey held the band and the bar drew nothing over it. [07-bar-on](try/07-bar-on.txt)
- **A new idea's slug while shaping: skipped.** It needs a shape interview to create the folder; the kit test covers it.
- **The Desktop Code tab: skipped.** This session can only drive a terminal; the human confirms it there.

## After the fix

The plan changed on what failed above (builders named by the first `### ` line anywhere in the prompt, squares by builders only, every hook awaiting before it touches the state) and `bar` was rebuilt. The same live `/craft:implement gamma` ran again, with a mod logging every spawn beside the bar. The bar was switched on first: the run before ended on a bare `/craft:bar`, which switched it off, and that choice holds across sessions as designed.

- **Spinner, name and time: passed.** Each builder showed by its slice (`one`, `two`, `four`) and the review as `review`, each from `0:00`. [10-band-timeline-after-fix](try/10-band-timeline-after-fix.txt)
- **`+N` for parallel agents: passed.** `two` and `three` entered `agent.spawn` in the same tenth of a second, and the line read `■▣▣□ 1/4 · ⠹ two 0:00 +1`. The first try's missing `+1` was the old hook losing one of the two. [12-spawn-log](try/12-spawn-log.txt)
- **Square building while its builder runs, built once it ends: passed.** The squares went `▣□□□ 0/4`, `■□□□ 1/4`, `■▣▣□ 1/4`, `■▣■□ 2/4`, `■■■□ 3/4`, `■■■▣ 3/4`, `■■■■ 4/4`, with `two` still named after `three` ended. [10-band-timeline-after-fix](try/10-band-timeline-after-fix.txt)
- **The line once implement ends: passed.** `craft gamma · implement · ■■■■ 4/4`, with no spinner. [11-implement-end-after-fix](try/11-implement-end-after-fix.txt)
- **A relaunched builder: skipped.** No slice failed its check in this run; the kit test covers it.
