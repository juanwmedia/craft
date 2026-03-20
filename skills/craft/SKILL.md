---
name: craft
description: Use to check the status of a feature or see an overview of all features. Shows current phase, completed tasks, and next action. Not an orchestrator — a dashboard.
disable-model-invocation: false
argument-hint: feature-slug
allowed-tools: Read, Glob, Grep
---

Feature status dashboard for the CRAFT methodology.

## What it does

Reads `docs/specs/index.yaml` and the feature's directory to show:
- Which artifacts exist (spec, tech-spec, plan)
- Current status and phase
- Progress (if plan exists: X of Y tasks done)
- Suggested next action

## Usage

The user may provide a feature slug as argument: `/craft dojo-streaming`
If no argument, show an overview of all features.

## Single feature view

When a feature slug is provided:

1. Read `docs/specs/index.yaml` — find the feature entry
2. Check which files exist in `docs/specs/<feature>/`:
   - `spec.md` → read frontmatter (status, version)
   - `tech-spec.md` → read frontmatter (status, based_on_spec_version)
   - `plan.md` → read frontmatter + count checked/unchecked tasks
3. Display:

> **Feature: dojo-streaming** (draft, P2)
>
> | Artifact | Status | Version |
> |----------|--------|---------|
> | spec.md | approved | v1 |
> | tech-spec.md | not found | — |
> | plan.md | not found | — |
>
> **Current phase**: Refine (spec approved, no tech-spec yet)
> **Next action**: Run `/refine` to create the technical specification.
> **Dependencies**: dojo-core-flow (done ✓)

If a plan exists with tasks:

> **Progress**: 8 of 14 tasks done (57%)
> **Next task**: T9: "Validate answer submission format"
> **Next action**: Run `/forge` to continue execution.

## Overview (no argument)

When no feature slug is provided:

1. Read `docs/specs/index.yaml`
2. Group features by status
3. Display:

> **CRAFT Status — [Project Name]**
>
> | Status | Count | Features |
> |--------|-------|----------|
> | done | 8 | core-flow, bilingual, guest-flow, ... |
> | in-progress | 4 | conversation-blocks, off-catalog, ... |
> | planned | 1 | question-gating (14 tasks, 0 done) |
> | draft | 6 | streaming, knowledge-graph, ... |
>
> **Active work**: question-gating — Forge phase, 0 of 14 tasks done.
> **Suggested**: Run `/forge` to start executing the plan.

## Guardrails

- This skill is READ-ONLY. It never creates or modifies files.
- It does NOT orchestrate — it reports status and suggests the next manual action.
- Keep the output concise. The goal is a 5-second situational awareness check.
