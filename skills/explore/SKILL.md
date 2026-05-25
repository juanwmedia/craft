---
name: explore
description: Hands-on technology exploration before design decisions. Use when the user faces a new library, SDK, framework, or needs to evaluate competing approaches (WebSocket vs SSE, Pinia vs composables). Also for feasibility questions ("is this even possible?") and migrations. Produces a capabilities map (explore.md) that informs /spec.
disable-model-invocation: false
argument-hint: [feature-slug]
allowed-tools: Read, Edit, Write, Glob, Grep, Bash, WebFetch, WebSearch, Agent
---

Part of the **Craft** methodology (**Explore** (optional) → Spec → Build → Close).

Explore answers: **with what tools, libraries, or approaches should we build this?** It runs BEFORE `/spec` when the user faces technology decisions they can't make without hands-on experience.

## When to use

- New library, SDK, or framework the user hasn't used before
- Evaluating competing approaches (WebSocket vs SSE, Pinia vs composables)
- Feasibility questions ("is this even possible?")
- Migrations or upgrades.
- User provides documentation/release notes and wants to understand implications

Skip when tools are known and the user just wants to build (go to `/spec`).

## How it works

### 1. Understand the question

If a feature slug is provided, check/create `docs/specs/<feature>/`. If not, ask what technology question needs answering and suggest a slug.

The question is: **what tool, library, or approach do you need to understand before you can plan?**

### 2. Research

Read documentation (Context7, WebFetch, user-provided URLs). Check compatibility with the project's stack. Understand the API surface, core concepts, and constraints.

Present a summary to the user before going hands-on.

### 3. Hands-on exploration (the core)

Guide, don't do. The user touches the technology:
1. Install the tool
2. Minimal "hello world" — prove it works
3. Try features relevant to the project
4. Push boundaries — find limits and gotchas

For each step: explain what we're testing and why, suggest the command/snippet, discuss what happened after.

Encourage deviation. "What happens if you change X?" The unexpected results teach most.

### 4. Evaluate findings

Run an evaluation pass:
- List capabilities discovered and constraints found
- Mark each as `[x] tested` or `[ ] assumed from docs`
- Challenge assumptions — "what if this doesn't work in production?"

### 5. Write the capabilities map

Write `docs/specs/<feature>/explore.md`:

```markdown
---
title: "Feature — Technology Exploration"
status: completed
created: YYYY-MM-DD
tools_explored: [tool-1, tool-2]
---

# Feature — Technology Exploration

## Question
What we set out to answer.

## Capabilities discovered
- [x] Capability A — tested, works
- [ ] Capability B — assumed from docs

## Constraints
- What it can't do or requires

## Decisions made
- We'll use X because Y (with evidence)

## Open questions
- Needs verification before building
```

### 6. Transition

Suggest `/spec <feature>` to define what to build. The spec reads the exploration.

## Guardrails

- Explore answers technology questions, not product questions. Features → `/spec`.
- Hands-on is mandatory. No `explore.md` from docs alone.
- Verified vs. assumed must be explicit.
- No production code during explore. Throwaway experiments only.
- The user drives. Suggest, don't dictate.
