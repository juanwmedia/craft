---
name: teardown
description: Use when finishing a session or completing a feature. Reviews changes, updates specs and index, proposes commits, and creates a handoff for the next session. The Teardown phase of CRAFT.
disable-model-invocation: true
argument-hint: feature-slug
allowed-tools: Read, Edit, Glob, Grep, Bash
---

Part of the **CRAFT** methodology (Contextualize → Refine → Arrange → Forge → **T**eardown).

Closes a session cleanly. Everything needed for the next session to start without re-explanation.

## 0. Resolve feature

1. If the user passed an argument (e.g., `/teardown dojo-streaming`), use it as the feature slug.
2. If no argument, read `docs/specs/index.yaml` and find features with status `in-progress`.
3. If exactly ONE feature matches, use it. Tell the user: "Closing session for **[feature-slug]**."
4. If MULTIPLE features match, list them and ask: "Which feature? [list]"
5. If ZERO features match, proceed without a specific feature — review all git changes in the session.

## 1. Review changes

Run `git diff` and `git status` to understand what changed in this session.

## 2. Capture implicit decisions

Identify decisions NOT self-evident from the code:
- Why this approach over alternatives
- Trade-offs accepted and their reasoning
- Constraints discovered during implementation

If the feature has a tech-spec (`docs/specs/<feature>/tech-spec.md`), update it:
- Add new decisions discovered during Forge (increment version)
- Flag anything that diverged from the original design

If any decision affects MORE than this feature, add it to `docs/specs/decisions.md` (cross-cutting decisions). Feature-specific decisions stay in the tech-spec only.

## 3. Update plan progress

If a plan exists (`docs/specs/<feature>/plan.md`):
- Verify all completed tasks are marked `- [x]`
- Note any deviations from the original plan
- If tasks remain, they are the handoff for the next session

## 4. Update feature index

If `docs/specs/index.yaml` exists, update the feature's status:
- All plan tasks done → `status: done`
- Some tasks done → `status: in-progress`
- Spec or tech-spec changed → update `spec_version` in index

## 5. Update project context

If project-level context changed (new conventions, gotchas, architectural decisions), update CLAUDE.md:
- Keep entries concise — one line per decision
- Do NOT duplicate what's in the tech-spec
- Do NOT document what's self-evident from code or manifests

## 6. Update specs file

If `docs/specs/<feature>/spec.md` has acceptance criteria that were verified during this session:
- Mark completed criteria or features with a `<!-- verified -->` comment
- Do NOT delete or modify the criteria text — just mark it

## 7. Propose commits

Based on the changes, propose atomic commit(s):
- Each commit should be a coherent unit of work
- Commit message explains WHY, not just WHAT
- Include relevant files — never `git add -A` blindly
- Present the commit(s) to the user for approval

## 8. Session summary

If tasks remain in the plan, summarize the handoff:
> "Completed tasks 1-8 of 15. Next session starts at Task 9: [description]. The spec and tech-spec are up to date."

If the feature is complete:
> "Feature [name] is complete. All tasks done, tests passing. Index updated to `status: done`."

## Guardrails

- Do not duplicate what is already in the global context file
- Do not document what can be inferred from manifest files
- Do not document what is self-evident from the code
- Keep entries concise — one line per decision when possible
- Preserve the existing structure and format of all files
- Never force-push, reset, or perform destructive git operations
