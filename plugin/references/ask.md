# Ask

Facts are your job and decisions belong to whoever answers: if the code answers a question, read the code and never ask it.

When the phase starts, run `git config --get craft.detached` once, or read the `[craft]` section of the repository's `.git/config` when `git` itself cannot start.

| The flag | Who answers | How you ask |
|---|---|---|
| `true` | `craft:act-as-me` | Every question, a trivial yes or no included, with the phase, the work's folder, the options and your recommendation first |
| Anything else, or no key | The human | Every question that can be answered now with `AskUserQuestion`, in as many calls as it takes, your recommendation first; only a trivial yes or no goes in plain text |

When `craft:act-as-me` answers, an approval or a confirmation is a question like any other: a change it asks for is made, then the draft is approved without asking again. Append one block per answer to `detached.md` in the work's folder, created with the folder: the phase, the question, the answer and the why. When it answers `Cannot decide` or does not start, write that block too, stop and name the question.

With more than one work open, name its slug in every question.
