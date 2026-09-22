---
name: worktree
description: Prepare worktrees, once, private to this machine (recommended) or shared with the repo. Reads the repo, proposes the WorktreeCreate and WorktreeRemove hook that gives every new worktree its dependencies, env, database and local domain, and writes it on your yes. Says "nothing to prepare" when a bare worktree already serves. Run it again when the project changes.
disable-model-invocation: false
allowed-tools: Read, Write, Edit, Glob, Grep, Bash, AskUserQuestion
---

A new worktree has the code and nothing else. This skill gives the machine or the project the hook Claude Code runs whenever a worktree is created or removed, so a feature's tree is ready to run before anyone types in it.

## Input

The repo the session is in. Nothing else.

## 1. Read what a new tree would lack

Look, never guess: `package.json` and its lockfile when there is one (`package-lock.json`, `pnpm-lock.yaml`, `yarn.lock`), `composer.json`, a `.env` next to a `.env.example`, `database/*.sqlite`, and every tool `${CLAUDE_PLUGIN_ROOT}/references/tools.md` says how to detect. Existing hooks next: a `hooks.WorktreeCreate` entry in the user settings (`settings.json` under !`echo "${CLAUDE_CONFIG_DIR:-$HOME/.claude}"`) means this machine already has its private hook: say so and diff its scripts against what step 3 would propose today. Identical: stop. Different (a newer shipped script, a tool installed since, or the human's own hand edits): say what differs and stop; the hand edits are theirs, never overwritten unasked. Updating happens on their ask, through steps 3 and 4, private, no fork on the variant, the machine already chose. One in `.claude/settings.json` or `.claude/settings.local.json` means the project already chose shared: only the shared variant may update it, and two hooks would both run, so never propose a private one next to it.

## 2. Nothing found

No `package.json`, no composer, no env, no database, no tool from the reference: say "nothing to prepare, a bare worktree serves this project", write nothing, stop.

## 3. Propose

First, one closed fork (`AskUserQuestion`): **private** (recommended), the hook lives in this machine's user config and serves every repo on it, nothing touches the project or its git; or **shared**, the hook lives in the repo's `.claude/` and reaches teammates once committed. A team repo whose `.claude/` is under an agreement is the private case.

- **Private**: the two shipped scripts, `${CLAUDE_PLUGIN_ROOT}/lib/worktree-create.sh` and `${CLAUDE_PLUGIN_ROOT}/lib/worktree-remove.sh`, complete and untrimmed: every preparation line is guarded by the file or binary it needs, so the one hook enters where a repo matches and stays inert where it does not. Trimming here is a bug, the next repo needs the lines this one does not. Add the lines of every tool section from the reference whose tool this machine has. Destination: `hooks/` under the user config directory from step 1, and one `WorktreeCreate` plus one `WorktreeRemove` entry in that directory's `settings.json`, in exactly the shape of `${CLAUDE_PLUGIN_ROOT}/lib/worktree-hooks.json` (read it, never retype the structure) with each command replaced by the script's absolute path: this file never leaves the machine, so absolute is correct here.
- **Shared**: the same two scripts trimmed to what step 1 found: every guarded line whose file the project does not have goes, the `git worktree add` and the `echo "$path"` stay, and each tool found adds the lines its section of the reference gives, where the section says they go. Destination: `.claude/hooks/` and the `hooks` entry merged into `.claude/settings.json`. The entry ships at `${CLAUDE_PLUGIN_ROOT}/lib/worktree-hooks.json`: read it and merge it verbatim, never retype it and never resolve its commands. They name a variable Claude Code expands at run time, in the main tree and inside a worktree alike; `.claude/settings.json` is committed, and a path starting with `/Users/` only works on the machine that wrote it.

Show the scripts in full and the settings entry, then one closed fork (`AskUserQuestion`): write it, or not. A hook already present at the chosen destination: show the diff against it instead.

## 4. Write

On yes, private: the two scripts into the user config directory's `hooks/`, executable (`chmod +x`), and the two entries merged into that directory's `settings.json`, every other key untouched, the file created when absent. On yes, shared: `.claude/hooks/worktree-create.sh` and `.claude/hooks/worktree-remove.sh`, executable, and the entry from `${CLAUDE_PLUGIN_ROOT}/lib/worktree-hooks.json` merged into `.claude/settings.json` the same way. On no: nothing.

## Output

What was written, enumerated, and what each new worktree will get; or "nothing to prepare"; or "not written". Then the one honest caveat: Claude Code reads project hooks from the settings of the project root the session was launched at, so a session launched above or beside the repo never loads the repo's entry, restart or not, and a settings edit this session may not be picked up before the next tree. When a tree comes back bare anyway, the Open procedure in `${CLAUDE_PLUGIN_ROOT}/references/worktree.md` offers to prepare it by hand. Shared only: the three files belong to the project and reach a worktree only once they are committed: until then a tree opened from inside another tree is created bare, because the hook is not in its checkout. Committing them is the human's call, as every commit is.

## Guardrails

- Never run the hook, never install anything: the hook installs, on the next worktree.
- Private writes the two scripts and the user `settings.json`; shared writes the three project files. Never both at once, never `CLAUDE.md`, never `.gitignore`, never `settings.local.json`.
- A tool that lives on the machine and not in the repo is a section of `${CLAUDE_PLUGIN_ROOT}/references/tools.md`, never a line in this skill or in the shipped scripts. Its lines stay guarded twice, `command -v` for the machine and the block's own runtime check for the repo, so the hook is harmless wherever it lands.
