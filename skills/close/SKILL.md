---
name: close
description: Reconcile what was built against what was specified. Updates specs, captures findings, proposes commits. The final step after /build. Use after completing implementation work, when the user says "done", "let's commit", "wrap up", or wants to close a feature.
disable-model-invocation: true
argument-hint: feature-slug
allowed-tools: Read, Edit, Glob, Grep, Bash
---

Part of the **Craft** methodology (Explore (optional) → Spec → Build → **Close**).

## 0. Resolve feature

1. If the user passed an argument (e.g., `/close user-auth`), use it as the feature slug.
2. If no argument, read `docs/specs/index.yaml` and find features with status `in-progress`.
3. If exactly one matches, use it. Tell the user which feature you're closing.
4. If multiple match, list them and ask.
5. If zero match, review all git changes in the session without a specific feature context.

## 1. Review and reconcile

Run `git diff` and `git status` to understand what changed.

Compare `docs/specs/<feature>/spec.md` acceptance criteria against what was actually built:
- Mark implemented ACs as verified
- Flag partially or unimplemented ACs for user decision
- Add new ACs for behavior built beyond the original spec
- Update changed ACs to match reality

Apply scope discipline (see `references/discipline.md`). If violated, stop and resolve before continuing.

Reconcile `docs/specs/<feature>/tech-plan.md`:
- Mark completed tasks
- Note deviations in the Iteration Log

Increment `spec_version` and update `last_updated`.

## 2. Capture findings

Identify decisions not self-evident from the code:
- Cross-cutting decisions (affect multiple features) → `docs/specs/decisions.md`
- Project conventions or gotchas → `CLAUDE.md`

One line per decision. Do not duplicate what's in the tech-plan or inferable from the code.

## 3. Propose commits

Update `docs/specs/index.yaml` status (`done` or `in-progress`).

Propose atomic commits with WHY-focused messages. Present to user for approval — never commit without it.

Suggest `/evaluate` if the user wants a final audit.

## Guardrails

- Spec reconciliation is mandatory.
- No commits without user approval.
- No destructive git operations.
- Keep findings concise — if it's in the code, it doesn't need documenting.
