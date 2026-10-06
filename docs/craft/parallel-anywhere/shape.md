# Parallel anywhere

## What

The implement evals grade, on the run's trace, that implement does what `skills/implement/SKILL.md:18` and `references/review.md:11` ask: slices that wait for nothing get `craft:build` agents that start at once, and reviewers start at once when the checks are slow. Until now that was assumed; no grader looked at it. For whoever changes Craft: a change that stops those agents from running at once fails an eval instead of passing unnoticed.

This work started as one rule in `references/work.md` that would let any step split work across agents at once. Its first assumption broke (see Assumptions), so the rule and every trim it needed were dropped, and nothing in `skills/` or `references/` changes.

## How it works

![How it works](how-it-works.svg)
Every agent writes a `task_started` line to the trace when it starts and a `task_notification` line when it ends, so a regex on the trace passes only when a second `craft:build` agent starts before the first one ends.

## Decisions

- Only graders change. Twelve runs gave no measured gain from a general rule, and moving the three parallel rules into one place would only save a few words while risking implement's builders, so nothing in `skills/`, `references/` or `README.md` changes.
- `builders-at-once` goes into `evals/implement-reviews-each-slice-when-checks-are-slow` and `evals/implement-reviews-once-when-checks-are-fast`, whose two slices wait for nothing. `reviewers-at-once` goes into the slow one only, because the fast one must use one reviewer.
- Both are `regex` graders with `target: trace`, the type `claude plugin eval` documents for reading the run's messages, one per line. The pattern matches a `task_started` line for the agent type, then a second such line for another task before the first task's `task_notification`.
- A grader ships only after it passes 3 of 3 on every eval it is added to, as that eval stands. One that fails is not loosened: it means implement does not start those agents at once, or such agents leave no `task_started` line, and either goes to the human.
- The work's documents live in `docs/craft/parallel-anywhere/` and are committed with the change. The human chose this in the first interview of this work, on 2026-10-06.

## Assumptions

- Implement launches both builders so that the second starts before the first ends, and each leaves a `task_started` line. Every builder ran in the background in all 18 runs; a foreground builder was never seen, so the grader is untested for it (foreground reviewers do leave the line). If wrong, `builders-at-once` fails on behaviour that was assumed correct, which is itself the finding. Tested: `evals/implement-reviews-once-when-checks-are-fast/graders/builders-at-once.md:4` passed in 9 of 9 runs of that eval and 9 of 9 of `implement-reviews-each-slice-when-checks-are-slow`, on 2026-10-06; in every run both background `craft:build` agents started before either ended.
- With slow checks, implement starts the two reviewers at once, not one after the other. If wrong, `reviewers-at-once` fails and the split review costs time without saving it. Tested: `evals/implement-reviews-each-slice-when-checks-are-slow/graders/reviewers-at-once.md:4` passed in 9 of 9 runs on 2026-10-06.
- Broken: a rule in `references/work.md`, with no word in `references/how-it-looks.md`, would make shape draw its look directions with one agent each, at once. Two batches of 6 runs, 3 with the rule and 3 without in each. The first had a descriptive sentence and the prompt `/craft:shape reminder-banner`: 3 runs drew (2 without the rule, 1 with it), the rest stopped to ask about the look. The second had an imperative sentence and the prompt `/craft:shape reminder-banner draw the look`: all 6 drew. In all 9 runs that drew, the main session wrote every direction itself, and no agent but `craft:evaluate` started in any of the 12. Every run with the imperative sentence shows it read. Traces with the imperative wording: base `/private/tmp/e-hJb8P8`, `/private/tmp/e-XDmK9X`, `/private/tmp/e-aN1nyu`; new `/private/tmp/e-mQO0uI`, `/private/tmp/e-ukUvHF`, `/private/tmp/e-F1f54g` (each `out/trace.jsonl`). It costs nothing now: the rule was never shipped.
