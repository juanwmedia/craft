---
name: tweak
description: Change something that already has a shape, without the ceremony. Copy, tracking events, expand UI and such. Looks the precedent up in the code, agrees a short done-list with you, changes it step by step or all at once, puts the diff to craft:review and proposes one commit. Use for updates and extensions with a precedent; a change with none is /shape or /spec.
disable-model-invocation: true
argument-hint: what to change
allowed-tools: Read, Edit, Write, Glob, Grep, Bash, Agent, AskUserQuestion, Skill, EnterWorktree, ExitWorktree
---

Craft for what already has a shape: the lifecycle in one skill, without the ceremony.

Tweak answers **what changes, against what it copies**. No board, no drawing, no spec file: the conversation is the spec and the commit is the record.

## Input

The argument is what to change, in the human's words. Read `docs/craft/CONTEXT.md` and follow its pointers first; none: go on without and say so. `CLAUDE.md` and the code's conventions are the invariants.

Then Busy (`${CLAUDE_PLUGIN_ROOT}/references/worktree.md`). A busy tree is one closed fork (`AskUserQuestion`): open a tree named `tweak-<the argument, kebab-case, cut so the name stays within 64 characters>`, merged and removed at the end (Open, same file), or continue here. A clean tree is used as is, no question.

## 1. Find the precedent

Before asking anything, look it up: every occurrence of what changes (each locale, each variant, any test that asserts it) and, for an addition, the existing thing it copies. Show it on screen with `file:line`. A closed board's `how-it-works.svg` counts as precedent, read-only. Ask only what the code cannot answer, in one round; a closed fork is `AskUserQuestion`.

## 2. Agree the done-list

As few lines as it takes, five at most, each testable and each pointing at its precedent. Agreed in one round in conversation, then frozen.

The gate is the pointer, not the size. A line with nothing in the code to point at, or a decision the precedent does not answer and someone will ask about later, means there is something to draw: stop, this is `/shape` or `/spec`. A list that does not fit one round is a spec.

## 3. Change it, step by step or all at once

The list frozen, one closed fork (`AskUserQuestion`), unless the human already said how. **Step by step**: one change, then its report (which file, what changed, which line of the list, why that way), and wait. **All at once**: every change, then the same report lines once, at the end. Step by step is the default, and the mode never switches silently. Either way the execution stays in this session: no subagents.

## 4. Review, then propose the commit

`craft:review` (`Agent`) with the done-list as the ACs and `git diff`. Its findings reach the human with their citations; the human decides what gets fixed. A gotcha worth keeping goes into `conventions.md` on the human's explicit yes and before the commit is proposed, never after, so it rides in it and does not leave the tree dirty. Then propose one commit, its body the done-list, and wait for approval. Commit made, a tweak that opened a tree runs Close (`${CLAUDE_PLUGIN_ROOT}/references/worktree.md`): merged, removed, session back where it started.

## Output

The changed files, enumerated. The done-list, each line evidenced or not. The review's verdict and its open leads. A gotcha the code does not tell, if one surfaced: the one line that went into `docs/craft/conventions.md`, or the one you declined. The proposed commit, not run; on the tree path, the commit made, where it was merged, and that the tree is gone.

## Guardrails

- Never open or write a board. Inside `docs/craft/`, the only write is one gotcha line in `conventions.md`, on the human's explicit yes, never one the code already tells; no `CONTEXT.md` yet: create it from `${CLAUDE_PLUGIN_ROOT}/references/context-template.md` first, so the line has a door.
- Scope: the files the done-list names and their tests. A discovery outside it is reported, not absorbed.
- Never commit without explicit approval. No AI attribution in commit messages. No destructive git.
