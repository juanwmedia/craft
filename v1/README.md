# CRAFT v1 (archived)

This directory is a frozen snapshot of CRAFT v1, the original 5-skill pipeline methodology.

## What v1 was

CRAFT stood for: **C**ontextualize > **R**efine > **A**rrange > **F**orge > **T**eardown.

Each letter was a standalone skill (slash command) producing a versioned artifact:

| Skill | Purpose | Artifact |
|-------|---------|----------|
| /contextualize | Product spec (the WHAT) | spec.md |
| /refine | Technical spec (the HOW) | tech-spec.md |
| /arrange | Implementation plan (atomic tasks) | plan.md |
| /forge | TDD execution (RED-GREEN-Verify) | code + tests |
| /teardown | Session close, commits, handoff | updated index + commits |

Plus two auxiliary skills (/evaluate, /understand) and a dashboard (/craft).

## Why it changed

v2 consolidates the pipeline into 3 skills (/spec, /build, /close) because:

- **Three steps before any code** — Refine and Arrange created two intermediate artifacts (tech-spec.md, plan.md) before writing a single line. For most features, this friction was disproportionate.
- **Native plan mode replaces custom planning** — The agent's built-in plan mode and task system make dedicated /arrange and /forge skills redundant.
- **No good iteration story** — When something failed post-Forge, there was no clean way to iterate without restarting the cycle or bypassing it entirely.
- **Spec reconciliation was missing** — v1 updated specs mid-execution (noisy versioning). v2 reconciles specs with reality at the end, once.
- **TDD rigidity** — The strict RED-GREEN-Verify per 1-minute task was overkill for configuration, UI scaffolding, and simple wiring. v2 trusts the agent's judgment on when tests add value.

## Contents

All 8 original skill files, exactly as they were at the time of archival. See `README-original.md` for the full v1 documentation.

## Frozen

This directory is never modified after the archival commit.
