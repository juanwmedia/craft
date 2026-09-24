# Craft

A minimalistic (and opinionated) approach to building things with AI agents: use all the help they can give, keep control of what gets built, and enjoy building it.

## The idea

You decide what agents cannot infer: the domain, the architecture, the structure of what gets built. Those are human decisions, and getting them right is the real work. `/craft:shape` and `/craft:plan` are where you spend your time.

Code is cheap. Once the uncertainty is gone and the decisions are written down, the choices left are small enough for an agent to make alone. `/craft:implement` builds, checks and retries with nobody to ask, and reaches you only when it needs a decision the documents did not make.

Every step is reviewed in a fresh context: the documents against the code before you see them, the code against the documents once it is built. After the first review, each one narrows to what the last fix changed, while every check still runs over the whole change.

Work runs in parallel only when it can: two slices build at once only when they share no file and neither waits for the other.

## Flow

Each piece of work has a slug, the same word in every command, and everything written about it lives in `docs/craft/<slug>/` as markdown.

1. `/craft:shape <idea>` settles with you what we are building, and writes `shape.md`.
2. `/craft:plan <slug>` splits it into slices that never share a file, each with a check, and writes `plan.md` and `slices.md` once you approve.
3. `/craft:implement <slug>` gives each slice its own agent, runs the check itself, and retries with a fresh agent while each try fails differently. Then it reviews the whole change. It never commits.
4. `/craft:close <slug>` updates the documents to match what was built, keeps the few lessons the code cannot tell, and asks you once before it commits, pushes and opens the pull request. Nothing else commits.

Every command is idempotent: run it again and it only works on what changed or is still missing. A slice whose check already passes is left alone, and close with nothing new says so and stops.

When something changes, run `/craft:plan <slug> <what changed>`, then implement and close again.

When shape or plan starts new work in a tree with uncommitted changes, it offers to move it to its own worktree.

## Extending it

Skills say what a step does, references say how, and a skill only points to references, never to another skill. Add a step by adding a skill, change a rule by editing one reference.

Craft is built on Claude Code. The skills and references are plain markdown, so the ideas carry to any harness with skills and subagents; the tool names (`EnterPlanMode`, `AskUserQuestion`, `EnterWorktree`) are the part to swap.
