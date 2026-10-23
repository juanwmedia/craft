# Ask

Facts are your job and decisions belong to whoever answers: if the code answers a question, read the code and never ask it.

Whoever answers is the human, or `craft:act-as-me` when `git config --get craft.detached` prints `true`. The phase runs that command once when it starts, and when `git` itself cannot start it reads `craft.detached` from the repository's `.git/config` instead (a `[craft]` section with `detached = true`), where only a readable config that lacks the key, or says anything but `true`, means off.

When the human answers, ask every question that can be answered now with `AskUserQuestion`, in as many calls as it takes, your recommended answer first in each. Only a trivial yes or no goes in plain text.

When `craft:act-as-me` answers, every question goes to it, the ones `AskUserQuestion` would carry and the trivial yes or no alike, with the phase, the work's folder and the question with its options and your recommendation first. An approval or a confirmation is a question like any other: a change it asks for is made, then the draft is approved without asking again. Append the answer and its why to `detached.md` in the work's folder, created with the folder, as one block per question with the phase, the question, the answer and the why, in order. When it answers `Cannot decide` or does not start, stop, name the question and write that block too.

With more than one work open, name its slug in every question.
