# Detached: try

What it took to run: a toy repository made for the try (`greeter`, with `docs/craft/greet/` shaped and planned, a slice whose body says `Hi <name>` while `shape.md` and `plan.md` fix `Hello, <name>!`), a local bare repository as its `origin`, and `git config --local craft.detached true`. Every session loaded this plugin from the working tree with `--plugin-dir`. The headless runs used `claude -p`, which has nobody to answer, as a routine has. The interactive run drove a real `claude` session in a pseudo terminal and read its screen with `pyte`.

## Turning the mode on and off in words: passed

Two headless sessions in a fresh repository asked in plain words to turn detached mode on, then off. Each called the `craft:detached` skill by itself (`on`, then `off`), the flag went from unset to `true` and back to unset, and each answered one line naming the routine's first message. Proof: the git config read before and after each session; the traces were read and not kept.

## Implement hands a need its owner's slice contradicts to the agent: passed

`/craft:implement greet` ran headless with the flag on. The builder followed the slice and returned `Hi Ada`; the review refuted it against `shape.md` and `plan.md`; implement sent both findings to `craft:act-as-me` instead of the human, rebuilt the slice with its answer (`Hello, <name>!`) and the second review confirmed it. `detached.md` holds both blocks with phase, question, answer and why. No `AskUserQuestion` call, no commit. Proof: [implement-detached.md](try/implement-detached.md); the trace was read and not kept.

## The bar says detached while the flag is on: passed

In the interactive session, after `/craft:bar on`, `/craft:close greet` drew `craft greet · close · detached` above the prompt with the `x` at its end, and `⠴ evaluate 0:04` while the audit agent ran. Proof: [bar-detached.txt](try/bar-detached.txt), [close-end.txt](try/close-end.txt).

## The X hides the bar and keeps the choice: passed

With close finished, ctrl+x tab put the focus on the bar and Enter pressed the `x`: the bar was gone from the next frame, nothing reached the prompt, and the plugin's store now says `"hidden": true`. Proof: [bar-after-x.txt](try/bar-after-x.txt), [store-after-x.json](try/store-after-x.json).

## Close commits and pushes on the agent's yes: passed

`/craft:close greet` reconciled `slices.md`, had the audit, sent the commit, branch and pull request question to `craft:act-as-me` and, on its yes, created the branch `greet`, committed three files and pushed to `origin` with the machine's own git. The remote now has `greet` at the same commit. Seen on the way: close changed one word of the approved commit body after the approval, to mention the close answers too, and said so in its report. Proof: [close-git.txt](try/close-git.txt), [close-detached.md](try/close-detached.md).

## The agent from a cloud routine: skipped

A cloud routine checks out the repository from GitHub and loads the installed plugin, and neither holds this work until it is released. The headless runs above are the same situation with nobody to ask, run on this machine.

## The agent from the desktop app: skipped

The desktop app loads the installed plugin, which is still 4.8.1 without `craft:act-as-me`. The interactive terminal session above runs the same engine.
