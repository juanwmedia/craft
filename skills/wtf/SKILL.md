---
name: wtf
description: Re-explain the last answer when the human did not understand it. Names the context the answer assumed, says it again in plain language, and states where the work stands. Fires when the human says they are lost, asks what something means, or quotes a fragment that did not land.
disable-model-invocation: false
argument-hint: "[the fragment that did not land]"
allowed-tools: Read, Grep, Glob
---

Something did not land. The job is to say it again so it lands: not to defend it, not to advance the work.

## Input

The argument is the fragment the human quotes; none means the last substantive answer in this conversation. The re-explanation is written in the language the human is speaking.

## 1. Name the missing context

One line: what the answer assumed the human knew and they did not ("this assumed you knew what X is"). A term coined mid-session is the usual suspect; so is a mechanism explained three days of scrollback ago.

## 2. Say it again, plainly

What it means for the human first, the mechanics after. Numbered when multi-step, one bounded action per line. No term the human has not used themselves; a term that cannot be avoided gets one line of definition where it first appears. Five items per list at most; more than five means grouping, not scrolling.

## 3. Where things stand

Three lines at most: done, pending, waiting on the human. Then exactly one next action, small enough to take in the next two minutes. Nothing pending: say so and end.

## Guardrails

- Never advance the work: no edits, no commits, no commands beyond reading what the re-explanation itself needs.
- Never defend the original wording and never say "as I already said". The failure was the answer's, not the reader's.
- Never introduce a decision or an option the original answer did not contain. New information discovered while re-explaining is named as new, and the skill stops there.
