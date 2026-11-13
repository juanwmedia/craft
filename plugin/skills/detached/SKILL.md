---
name: detached
description: Turn detached mode on or off for this repository, so every question a craft phase would put to the human goes to craft:act-as-me instead.
argument-hint: "[on | off]"
disable-model-invocation: false
---

Detached mode is the flag `craft.detached` in this repository's local git config. Its input is `$ARGUMENTS`.

- `on`: run `git config --local craft.detached true`.
- `off`: run `git config --local --unset craft.detached`. A missing key is already off, so its exit status 5 is not an error.
- Nothing: read the flag with `git config --get craft.detached`. When it prints `true`, do `off`, otherwise do `on`.

Run nothing else, and read and write nothing else.

Answer one line and nothing more: `Detached mode is on in this repository.` or `Detached mode is off in this repository.`
