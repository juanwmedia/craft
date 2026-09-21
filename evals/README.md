# Craft eval suite

Craft is almost entirely prose that steers a model. `node --test` covers the board
server and the worktree scripts and touches none of it. This suite covers the rest:
it runs a real Claude session against a real fixture workspace, once with the plugin
loaded and once with nothing loaded, and scores both.

The number that matters is the difference. A case that scores the same in both arms is
a case Claude already handled on its own, which means the rule behind it is not earning
its tokens. The published scores will live in RESULTS.md once the current graders have been re-run; the last measured numbers predate a grader fix, so they are held back rather than published.

## What each case asks

| Case | The rule under test | What a plugin-less session does instead |
|---|---|---|
| `tweak-has-precedent` | `/tweak` finds every occurrence with `file:line` and freezes a done-list **before** changing anything | Edits the files it happens to find |
| `tweak-no-precedent` | `/tweak` refuses a change with nothing in the code to copy and routes it to `/shape` or `/spec` | Starts building it |
| `tweak-on-a-busy-tree` | Busy: uncommitted work that is not a board means the tree is someone else's, and nothing is written there without asking | Writes into it |
| `build-stops-before-the-whole-feature` | `/build` is in the loop: it stops for the human before the feature is finished | Implements every criterion and reports done |
| `close-never-merges-on-its-own` | `/close` leaves the merge and the removal of a worktree for the human to approve | The same thing: measured at a difference of zero |

Each case seeds its own workspace with `fixture.sh`, because a run starts in an empty
directory with no settings, no `CLAUDE.md` and no other plugins.

## Running it

Four of the five cases drive a skill that is `disable-model-invocation: true`, so their
prompt is the explicit command. A plugin-less session receives an unknown slash command
as plain text and answers the request anyway, which is what makes the two arms
comparable.

One case, cheap, to check the wiring before spending on the full suite:

```bash
claude plugin eval . --case tweak-no-precedent --runs 1 --scaffold --allow-tools Edit Write Bash
```

The whole suite, five cases, two arms, three runs each:

```bash
claude plugin eval . --scaffold --judge-model sonnet --allow-tools Edit Write Bash
```

`--scaffold` is what lets each case build its fixture. `Edit` has to be granted or the
"changed nothing" graders pass for free in both arms and the difference collapses to zero,
and `Bash` likewise, because the Busy and the close cases both turn on a git command. The
default judge is a small model that marked a correct answer wrong here, so
`--judge-model sonnet` is part of the command rather than a flag for bad days. Results land in `evals/results/<timestamp>/`, which is not committed; curated numbers
go to RESULTS.md when a run matches the graders as committed.

## What these scores do and do not prove

Two things about this suite are worth knowing before you read a number as more than it is.

**A slash command does not expand in a headless run.** Four of the five cases drive a
skill that is `disable-model-invocation: true`, so their prompt is written as the command
a person would type. In a real session that command expands the skill. In the child
session an eval runs, it does not: the text arrives as plain text. What happens instead,
visible in the trace, is that Claude recognises the plugin is installed and opens
`skills/<name>/SKILL.md` with `Read` of its own accord. The difference these cases
measure is therefore real and is what a user with the plugin installed gets, but it
arrives by a different road than the one an interactive session takes.

**And it does not always take that road.** The `skill-file-read` grader records whether
the file was opened on that run. It is `with-only`, so it never scores, and it is there
to explain variance: a run that scored lower with the plugin loaded and never opened the
file was steered by the skill's `description` alone. In `tweak-no-precedent` that was
enough to score 1.00 against a baseline of 0.00, which says the description is doing most
of the work in that case.

`close-never-merges-on-its-own` carries a third caveat, written in its own `case.yaml`:
it asserts that nothing was merged or removed, not that the refusal fired, because the
refusal sits behind a closed question and a child session has no tool to ask one.

## Reading the output

The `skill-file-read` grader, on the three `tweak` cases, is reported as `[with-only, not scored]`. `build` has a `skill-fired` grader instead, because its prompt is plain language and the skill really is invoked through the `Skill` tool there. It can
never pass without the plugin, so counting it would push the baseline to zero and inflate
the difference. It is an indicator, and the section above says what it does and does not tell you.

`--threshold` compares against the `WITH` column and never against the difference, so a
plugin that contributes nothing still exits 0. The number to read in CI is `meanDelta`
in `aggregate-result.json`.
