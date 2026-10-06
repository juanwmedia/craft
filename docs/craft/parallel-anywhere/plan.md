# Parallel anywhere: plan

## What

Two trace graders make the implement evals measure what was only assumed: `builders-at-once` checks that implement's two independent `craft:build` agents run at the same time, and `reviewers-at-once` checks the same for its reviewers when the checks are slow. Nothing in `skills/`, `references/` or `README.md` changes; this changes how Craft is evaluated, not Craft.

A grader passes when a second agent of its type starts (a `task_started` line) before the first one's `task_notification` line, in the run's trace. Each grader ships only when the eval it is added to passes 3 of 3 with it, every grader included.

## Acceptance

- `implement-reviews-once-when-checks-are-fast` passes 3 of 3 with `builders-at-once` among its graders: both builders run at the same time, and the review still goes to one reviewer. Proven by `fast`.
- `implement-reviews-each-slice-when-checks-are-slow` passes 3 of 3 with `builders-at-once` and `reviewers-at-once` among its graders: the two builders run at the same time, and so do the two reviewers. Proven by `slow`.
