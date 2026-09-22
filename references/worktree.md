# Worktrees

One feature, one tree, on the human's yes. `/shape` and `/spec` offer the worktree once, at the feature's birth; accepted, the feature lives in `.claude/worktrees/<slug>` on branch `worktree-<slug>` until `/close` merges it, the main tree stays clean, and the board shows every tree. Declined, the feature builds in the tree it was born in, its board carries no `tree`, and the Busy rule below treats its work like anyone's. Uncommitted work that is not a board means the tree is taken, and whoever wants to write there asks first.

The names are what Claude Code's worktree tool produces on its own. Craft never renames them and never runs `git worktree` where the tool can do the job.

## Offer

Input: a feature slug and the tree the session stands in, before anything is written. The fork is only for a feature that has nothing yet; anything that already exists made the choice, so first:

- `<repo>/.claude/worktrees/<slug>` exists (`<repo>` is the main tree, the first entry of `git worktree list --porcelain`, as Open defines it): Enter it (below) and resume the board inside; no fork. This comes before looking for a board, because a board opened inside a tree is not visible from the main tree.
- Only the branch `worktree-<slug>` exists (its tree was removed by hand): Open step 1 recovers it, prune and re-add; no fork.
- `docs/craft/<slug>/data.json` right here holds a `tree`, and neither the worktree nor the branch `worktree-<slug>` exists: the feature was closed; update the board where it is, no fork and no new tree.
- `docs/craft/<slug>/data.json` right here with no `tree`: the human already declined; work where the board is, no fork.
- A repo with no commit yet: no fork, Open step 0 governs.

None of those: run Busy below, then one closed fork (`AskUserQuestion`): open the feature's worktree (recommended; Open below), or build here in this tree. A busy tree puts the uncommitted work in the question, named, because "here" means writing next to it; what happens to that work (commit, stash, leave it) is the human's, outside this fork, and the worktree option needs nothing done to it, the new tree cuts clean from HEAD. On "here": the board carries no `tree`, the feature stays where it starts, and the skill says so.

## Open

Input: the slug, and a session standing in any tree of the repo. `<repo>` below is the main tree, the first entry of `git worktree list --porcelain`; every path is absolute from it, never relative to the tree you happen to be in. Run **before writing anything** for the feature: untracked files do not travel into a new tree.

0. No commit yet (`git rev-parse --verify HEAD` fails): there is nothing to branch from. Work in the main tree and say so; the first `/close` commits, and the next feature gets the Offer.
1. `<repo>/.claude/worktrees/<slug>` already exists: Enter it (below) and stop here; `tree.from` is on its board, or, when the tree has no board yet, the branch checked out in the tree you are standing in. Only the branch `worktree-<slug>` exists (its tree was removed by hand): `git worktree prune` first, because git still has the deleted tree registered and refuses to add it back until that record is cleared, then `git worktree add <repo>/.claude/worktrees/<slug> worktree-<slug>`, then Enter; no hook runs on that path, so say the tree is bare.
2. Note the branch the session is on: `git branch --show-current`. It is `tree.from` on the board. Empty (detached HEAD): stop, a feature needs a branch to come back to.
3. Does the project have a `WorktreeCreate` hook? Look for `hooks.WorktreeCreate` in `.claude/settings.json`, `.claude/settings.local.json` and the user settings (`~/.claude/settings.json`, or `settings.json` under `CLAUDE_CONFIG_DIR` when that variable is set). None: run `/craft:worktree` with `Skill` first; it either writes the hook or says there is nothing to prepare.
4. With a hook: `EnterWorktree` with `name: <slug>`. Claude Code hands the hook `{name}` and reads the tree's absolute path from its stdout; the shipped script puts it at `<repo>/.claude/worktrees/<slug>` on `worktree-<slug>` from HEAD and prepares it. When it succeeds, what the hook printed does not reach the session (the tool result says only that the worktree was created), so the preparation report is what you find once you are inside, not what it said. The hook is the project's, so check what it did after entering: the cwd is `<repo>/.claude/worktrees/<slug>`, `git branch --show-current` is `worktree-<slug>`, and `git rev-parse HEAD` equals `git rev-parse <step 2 branch>` (cut from where you stood). Anything else: say exactly what differs and stop; a hook that puts trees elsewhere is the project's to fix, not Craft's to guess around. Then report what the tree actually got, by looking: the files the project's hook copies (`.env`, `database/`) and the dependencies it installs (`node_modules`, `vendor`). Every check here runs from inside the tree, plain: the worktree isolation guard refuses `git -C <repo>` forms, and `git rev-parse <step 2 branch>` resolves the same ref from where you stand. Anything to be written inside the tree goes through `Write`, never a shell heredoc, which the same guard refuses. A tree that came back bare although a hook is configured (an entry written this session, or a session whose project root is not this repo, so its entry never loaded): one closed fork (`AskUserQuestion`), run the prepare steps the hook's script body names by hand, right here, reporting each, or continue bare. Never silently either.
   Without one: `git worktree add <repo>/.claude/worktrees/<slug> -b worktree-<slug> HEAD`, then `EnterWorktree` with `path: <repo>/.claude/worktrees/<slug>`. Say that the tree is bare: code and nothing else.
   A hook that fails is the one case where its output does come back: the tool result carries the error with the hook's own stderr in it, so report that and stop, and the session stays where it was. The shipped script removes the tree and the branch it just created when a step fails, and never touches a tree that already existed; a project's own hook may not, and one that ends with a plain `exit` runs no trap at all, so look for `branch refs/heads/worktree-<slug>` in `git worktree list --porcelain` and say whether that tree was left behind. Only say it: removing someone else's half-made tree is not yours to do.
5. Hand the caller `branch` (`worktree-<slug>`) and `from` (step 2): the skill that writes the board puts them in `tree` before any other field; a caller with no board (a tweak) keeps them for Close.

## Enter

Input: a slug whose tree exists. The session's cwd is already under `.claude/worktrees/<slug>`: nothing to do. Otherwise `EnterWorktree` with `path: <repo>/.claude/worktrees/<slug>`. A tree entered by path is not removed by `ExitWorktree remove`; Close below does not rely on it.

## Busy

Input: the current tree, any tree. `git status --porcelain -uall` with every line under `docs/craft/` or `.claude/worktrees/` dropped (boards and Craft's own trees are never someone else's work). `-uall` is what makes the drop work: without it git collapses an untracked directory to `?? docs/` or `?? .claude/`, which neither prefix matches, and a tree holding only a board would read busy. Anything left means uncommitted work that is not a board: the tree is busy. A busy tree is never written to without asking; a clean one is used as is.

## Close

Input: `tree.branch` and `tree.from`, from the board or from whoever opened the tree; `<path>` below is `<repo>/.claude/worktrees/<slug>`, `<slug>` being `tree.branch` without its `worktree-` prefix; `<home>` is the tree that holds `tree.from`, the path listed with `branch refs/heads/<tree.from>` in `git worktree list --porcelain` (not listed: stop, the branch to merge into is checked out nowhere); every commit already approved and made. Never run without the human's yes to it, given where the fork named it.

Two refusals before anything runs, one command and one sentence each:

- `git -C <path> status --porcelain` prints anything, the board included (no `-uall` drops here): say what it is and stop. Approved commits being made is not proof the tree is empty, and the removal may be a hook that forces it.
- `ExitWorktree` with `action: keep`, always (a no-op outside the tree), then `git branch --show-current` in the cwd. Still `tree.branch`: the session was launched inside the tree, cannot leave it, and cannot outlive the directory it stands in. Print the three commands below, every placeholder filled in and joined with `&&` so the first failure stops the rest (a conflict is then theirs to abort or resolve; nothing is removed), as one `bash` block for the human to run from any shell outside the tree, and stop. Never a path comparison: `git worktree list` resolves symlinks and a cwd never matches a path you built.

Then three commands, each of them cwd-proof. Each one runs, its exit code is read, and the first failure stops the close and shows git's own output, which already names the conflict or the file that would be overwritten: nothing after it runs, nothing is removed, the tree stays on the board.

1. `git -C <home> merge <tree.branch>`. A conflict leaves `MERGE_HEAD`: `git -C <home> merge --abort`, then report the files git listed.
2. The `WorktreeRemove` hook when a `hooks.WorktreeRemove` entry exists in any of the places Open step 3 looks, project or user scope: the script the entry's command names, fed what Claude Code would send it: `cd <home> && echo '{"hook_event_name":"WorktreeRemove","worktree_path":"<path>"}' | <script>` (the `cd` is what makes it cwd-proof: the script resolves the repo from where it runs). A project entry's command names the script through `${CLAUDE_PROJECT_DIR}`, read as `<home>`; the script not in `<home>` (hook files reach a tree only once committed): say so, the tool it undoes stays linked, and `git -C <home> worktree remove <path>` instead. A user entry's command is already an absolute path on this machine; the file missing there means the private hook is broken: say so and the same git command. No entry: the same git command.
3. `git -C <home> branch -d <tree.branch>`.

Report: merged into `tree.from`, tree removed, branch deleted, and where the session now stands (the tree `ExitWorktree` returned it to, or where it already was).

Choosing a PR instead skips this whole procedure, refusals included: nothing is merged and nothing is removed, so a tree with uncommitted work in it is no obstacle. The tree stays, on the board, until the human removes it.
