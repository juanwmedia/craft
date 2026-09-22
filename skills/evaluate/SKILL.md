---
name: evaluate
description: The manual trigger for the evidence-based audit. Hands the named artifact to the craft:evaluate agent, which runs in a fresh context, and brings its verdicts back untouched.
disable-model-invocation: true
argument-hint: "[pass count] [artifact to audit]"
allowed-tools: Agent
---

The slash for the audit. This skill does one thing: hand the argument to the `craft:evaluate` agent (`Agent`) and return what comes back, untouched. The fresh context is the point: an evaluator sharing this conversation inherits its rationalizations.

## Input

The argument names the artifact; a leading number is the pass count (default 1). No argument: the previous substantive output in this conversation is the artifact.

## Steps

1. **Build the brief.** The agent starts blank and cannot see this chat, so the brief carries everything: the artifact (a file path, a board plus the fields to audit, or the text itself quoted inline when the artifact is conversation output), the pass count, and whatever the human has pre-answered so no passes are spent on it.
2. **Launch `craft:evaluate`** with `Agent`, in the background: the human keeps the conversation while it runs, and the findings arrive as a task notification. Never block the turn waiting unless the human asks for it.
3. **Return the findings verbatim** when the notification arrives: tables, critical findings, score, the decisions each finding demands. Add nothing, soften nothing, fix nothing, and never predict them while the agent runs.

## Guardrails

- Never audit inline in this context; that is what step 2 exists to prevent.
- Never edit anything and never act on a verdict. What to do with the findings is the human's.
