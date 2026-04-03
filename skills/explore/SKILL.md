Part of the **Craft** methodology (**Explore** (optional) → Spec → Build → Close).

Explore answers: **with what tools, libraries, or approaches should we build this?** It runs BEFORE `/spec` when the user faces technology decisions they can't make without hands-on experience.

## When to use Explore

Trigger `/explore` when ANY of these are true:
- The user wants to adopt a new library, SDK, or framework they haven't used before
- The user needs to evaluate competing approaches (WebSocket vs SSE, Pinia vs composables, etc.)
- The user asks "is this even possible?" — a feasibility question
- The user is migrating or upgrading (Laravel 12 → 13, raw API → SDK, etc.)
- The user provides documentation URLs, blog posts, or release notes and wants to understand implications

Do NOT use `/explore` when:
- The tools are known and the user just wants to build (go to `/spec`)
- It's a simple feature using established patterns (go to `/spec`)
- The user already knows the answer and just wants validation (use `/evaluate`)

## How Explore works

### Phase 1: Understand the question

1. If a feature slug is provided (`/explore dojo-v2`), check if `docs/specs/<feature>/` exists. Create it if not.
2. If no slug is provided, ask: "What technology question do you need answered?" Then suggest a slug.
3. Read any existing project context: CLAUDE.md, related specs, architecture docs.
4. Ask the user: **"What are you trying to figure out?"**
   - NOT "what do you want to build" (that's spec)
   - NOT "how do you want to build it" (that's build)
   - The question is: **what tool, library, or approach do you need to understand before you can plan?**
5. From the answer, identify:
   - What technology/library to explore
   - What specific questions need answers
   - What the user already knows vs. what's new

### Phase 2: Research

Before putting anything in the user's hands, understand the technology:

1. **Read documentation** — use Boost search-docs, Context7, WebFetch, or the user's provided URLs
2. **Check compatibility** — does it work with the project's stack? Check version constraints, dependencies
3. **Understand the API surface** — what primitives does the tool offer? What are the core concepts?
4. **Identify constraints** — what CAN'T it do? What assumptions does it make?
5. **Find relevant examples** — official examples, patterns from docs, community usage

Present a summary to the user: "Here's what I found. The SDK offers X, Y, Z. It requires A, constrains B. Shall we try it hands-on?"

### Phase 3: Hands-on exploration (THE CORE OF THIS SKILL)

This is what makes `/explore` different from reading docs. The user TOUCHES the technology.

**Guide, don't do.** Suggest what to try, let the user run it. When the user runs a command or writes code themselves, they build muscle memory and intuition that reading can't provide.

**Incremental steps.** Start with the simplest possible thing that works:
1. Install the tool
2. Minimal "hello world" — prove it works at all
3. Try the specific features relevant to the project
4. Push boundaries — find the limits, the constraints, the gotchas

**For each step:**
- Explain WHAT we're testing and WHY before the user runs it
- Suggest the exact command or code snippet
- After the user runs it: discuss what happened, what it means, what we learned
- If it fails: diagnose together, adjust, retry

**Encourage the user to deviate.** "What happens if you change X?" "Try calling it without Y — what breaks?" The unexpected results teach more than the expected ones.

**Ask questions, don't lecture.** "What do you think this method does?" "Does this remind you of anything in the current codebase?" "What would break if we used this in production?"

### Phase 4: Evaluate what we learned

After hands-on exploration, run an evaluation pass (evaluator-optimizer pattern):

1. **List every capability discovered** — what does the tool actually do?
2. **List every constraint discovered** — what can't it do? What surprised us?
3. **Verify claims against evidence** — did we test this in Tinker, or are we assuming?
4. **Flag unverified items** — things we believe but haven't tested. These become "test before building" items.
5. **Challenge assumptions** — "We assumed X works. What if it doesn't? What's the fallback?"

Present findings to the user for discussion. The user may spot things the evaluation missed.

### Phase 5: Write the capabilities map

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

## Tools explored
- Tool 1 — version, what it does

## Capabilities discovered

### Primitives available
- Capability 1 — what it does, how to use it
- Capability 2 — ...

### Verified hands-on
- [x] Capability A — tested in Tinker/browser, works
- [x] Capability B — tested, works with caveats
- [ ] Capability C — NOT tested, assumed from docs

### Constraints
- Constraint 1 — what it can't do, or what it requires
- Constraint 2 — ...

## Decisions made
- Decision 1 — we'll use X because Y (with evidence)
- Decision 2 — we won't use Z because W

## Open questions (test before building)
- Question 1 — needs empirical verification
- Question 2 — depends on frontend testing

## Impact on existing architecture
- What changes if we adopt this
- What stays the same
```

### Phase 6: Transition

Tell the user:
> "Exploration complete. `explore.md` is ready.
> - Run `/spec <feature>` to define what to build (the spec will read the exploration)
> - Or continue exploring if questions remain"

## Guardrails

- **Explore answers technology questions, not product questions.** If the user starts describing features ("the student should see X"), redirect to `/spec`.
- **Hands-on is mandatory.** Do not write `explore.md` based solely on reading docs. The user must run at least one thing themselves — Tinker, browser, CLI.
- **Verified vs. assumed must be explicit.** Every capability is either `[x] tested` or `[ ] assumed`. No ambiguity.
- **No implementation during explore.** Don't write production code. Tinker experiments, throwaway scripts, temp files. If the user starts building, redirect to `/build`.
- **Explore can be short.** If the tool is simple and the questions are few, the exploration might take 15 minutes. Don't pad it. Write the capabilities map and move on.
- **The user drives.** Suggest, don't dictate. The user runs commands. The user asks questions. The user decides when they understand enough. Your job is to guide, challenge, and document.
- **Always evaluate.** Before writing `explore.md`, run at least one evaluation pass on the findings. Flag anything unverified.
