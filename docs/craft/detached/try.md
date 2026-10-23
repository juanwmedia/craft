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

## The agent from a cloud routine: passed

After 4.9.0 was released, a one-off routine on the `wmedia` environment, with this repository as its only source, sent three messages in order: `/craft:detached on`, `/craft:shape` with a small idea and "never commit or push", and a command that prints the flag and every `detached.md`. The session started in `/home/user/craft` and loaded craft 4.9.0 from there. The first message set the flag to `true`. Shape sent its six questions to an agent and wrote `detached.md` with six blocks of phase, question, answer and why; the run called `AskUserQuestion` zero times and committed nothing, though a stop hook of the environment asked it to. The log shows the `Agent` call and a prompt in `act-as-me`'s form, not the agent type. Shape did not finish: its evaluate pass refuted 7 of 20 claims of the draft, which says nothing about the mode. Proof: [cloud-detached.md](try/cloud-detached.md), https://claude.ai/code/session_014ReY6tCEsTPtc1SXHsRtaU.

A second routine with two sources, `wmedia` and this repository, starts in `/home/user`, which is no repository. `/craft:detached on` there set the flag in `/home/user/wmedia`, a repository the model picked by itself, and said which. It works, and it is the model's guess. Proof: https://claude.ai/code/session_01Xh1WyXTGFgV6Q4SjJrWbMt.

## The bar from the desktop app: passed, once it saw phases the model starts

In the desktop app on 4.9.0 the bar drew above the prompt with its `x`, and the human's press hid it: the installed plugin's store went to `"hidden": true`. The bar said only `craft`: in that session the model had started `craft:plan` and `craft:implement` with the Skill tool, the bar learned a phase only from a typed command, and the craft agents alone made it active. So it never said the work, the phase or `detached` for a phase the model started, in a routine asked in words or in any session. The bar now also reads the Skill tool's call (`hooks/register.ts:117`). In an interactive session with this tree, the flag on and the model asked in words to run `craft:close demo`, the bar drew `craft demo · close · detached` with its `x`. Proof: [desktop-bar.png](try/desktop-bar.png), [store-desktop-after-x.json](try/store-desktop-after-x.json), [bar-skill-tool.txt](try/bar-skill-tool.txt).

## The bar from claude.ai/code: does not draw

In a web session on the `wmedia` environment with this repository, `/craft:bar on` answered from the mod, and `/craft:close detached`, twice, drew no bar. The mod's API raises the band above the prompt on the terminal and the desktop only, so the web has no bar, `detached` and `x` included.
