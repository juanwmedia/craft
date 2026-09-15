---
name: worktree
description: Prepare a project for worktrees, once. Reads the repo, proposes the WorktreeCreate and WorktreeRemove hook that gives every new worktree its dependencies, env, database and local domain, and writes it on your yes. Says "nothing to prepare" when a bare worktree already serves. Run it again when the project changes.
disable-model-invocation: false
allowed-tools: Read, Write, Edit, Glob, Grep, Bash, AskUserQuestion
---

A new worktree has the code and nothing else. This skill gives the project the hook Claude Code runs whenever a worktree is created or removed, so a feature's tree is ready to run before anyone types in it.

## Input

The repo the session is in. Nothing else.

## 1. Read what a new tree would lack

Look, never guess: `package.json` and its lockfile when there is one (`package-lock.json`, `pnpm-lock.yaml`, `yarn.lock`), `composer.json`, a `.env` next to a `.env.example`, `database/*.sqlite`, and whether Herd serves this directory (`herd links`). Existing hook files under `.claude/hooks/` and a `hooks.WorktreeCreate` entry in `.claude/settings.json`, `.claude/settings.local.json` or `~/.claude/settings.json`; one found outside the project file is reported and nothing is proposed, two hooks would both run.

## 2. Nothing found

No `package.json`, no composer, no env, no database, no Herd: say "nothing to prepare, a bare worktree serves this project", write nothing, stop.

## 3. Propose

Two scripts, `${CLAUDE_PLUGIN_ROOT}/lib/worktree-create.sh` and `${CLAUDE_PLUGIN_ROOT}/lib/worktree-remove.sh`, trimmed to what step 1 found: every guarded line whose file the project does not have goes, the `git worktree add` and the `echo "$path"` stay. Show both scripts in full and the `hooks` entry for `.claude/settings.json`, one `WorktreeCreate` and one `WorktreeRemove`, each `type: command` whose command is exactly `${CLAUDE_PROJECT_DIR}/.claude/hooks/<script>`, that string and not an absolute path: `.claude/settings.json` is committed, and a path starting with `/Users/` only works on the machine that wrote it. Claude Code expands the variable, in the main tree and inside a worktree alike. A hook already present: show the diff against it instead. One closed fork (`AskUserQuestion`): write it, or not.

## 4. Write

On yes: `.claude/hooks/worktree-create.sh` and `.claude/hooks/worktree-remove.sh`, executable (`chmod +x`), and the `hooks` entry merged into `.claude/settings.json`, every other key untouched, the file created when absent. On no: nothing.

## Output

The three files written, enumerated, and what each new worktree will get; or "nothing to prepare"; or "not written". A hook takes effect on the next worktree, this session included. Say also that the three files belong to the project and reach a worktree only once they are committed: until then a tree opened from inside another tree is created bare, because the hook is not in its checkout. Committing them is the human's call, as every commit is.

## Guardrails

- Never run the hook, never install anything: the hook installs, on the next worktree.
- Only those three files. Never `CLAUDE.md`, never `.gitignore`, never `settings.local.json`.
- Machine-specific lines (`herd`) stay guarded with `command -v`, so the committed hook is harmless on a machine without the tool.
