---
name: close
description: Reconcile what was built against what was specified. Updates specs, captures findings, proposes commits, and persists learnings. The final step after /build.
disable-model-invocation: true
argument-hint: feature-slug
allowed-tools: Read, Edit, Glob, Grep, Bash
---

Part of the **Craft** methodology (Explore (optional) → Spec → Build → **Close**).

Closes a feature or session. Reconciles artifacts with reality and persists everything the next session needs.

## 0. Resolve feature

1. If the user passed an argument (e.g., `/close user-auth`), use it as the feature slug.
2. If no argument, read `docs/specs/index.yaml` and find features with status `in-progress`.
3. If exactly ONE feature matches, use it. Tell the user: "Closing **[feature-slug]**."
4. If MULTIPLE features match, list them and ask: "Which feature? [list]"
5. If ZERO features match, proceed without a specific feature — review all git changes in the session.

## 1. Review changes

Run `git diff` and `git status` to understand the full scope of what changed.

## 2. Reconcile spec.md

Compare `docs/specs/<feature>/spec.md` acceptance criteria against what was actually built:

- **ACs fully implemented** → mark with `<!-- verified -->`
- **ACs partially implemented** → note what's missing, flag for user decision
- **ACs not implemented** → flag: descope or mark as remaining work
- **Behavior built that isn't in the spec** → add new ACs, describe what was built and why
- **ACs that changed during implementation** → update the criterion text to match reality

After reconciliation, increment `spec_version` and update `last_updated`.

This is the KEY difference from v1: spec reconciliation happens here, once, after the work stabilizes — not mid-execution where it creates noisy versioning.

## 3. Reconcile tech-plan.md

- Verify all completed tasks are marked `- [x]`
- Note any deviations from the original plan
- Ensure the Iteration Log is clear and complete
- If tasks remain, they are the handoff for the next session

## 4. Capture findings

Identify decisions and discoveries NOT self-evident from the code:

- **Cross-cutting decisions** (affect multiple features) → add to `docs/specs/decisions.md`
- **Project-level conventions or gotchas** → add to `CLAUDE.md`
- **Feature-specific decisions** → already captured in tech-plan.md Design Decisions

Rules:
- Keep entries concise — one line per decision when possible
- Do NOT duplicate what's in the tech-plan
- Do NOT document what is self-evident from the code
- Do NOT document what can be inferred from manifest files

## 5. Update index.yaml

Update `docs/specs/index.yaml`:
- All tasks done → `status: done`
- Tasks remain → `status: in-progress`
- Spec version changed → update `spec_version` in index

## 6. Pre-commit checks

Before proposing commits, run two automated checks:

### Security scan

Search the diff for hardcoded secrets:
- API keys, tokens, passwords (patterns: `sk-`, `ghp_`, `AKIA`, `password =`, `secret =`)
- Private keys (`-----BEGIN.*PRIVATE KEY-----`)
- Connection strings with credentials

If found: **STOP. Flag to user. Do not propose commits until resolved.**

### Quality gate

Detect the project's quality tools from manifest files (`package.json`, `composer.json`, `pyproject.toml`, `Cargo.toml`) and run them:
- Formatter (prettier, black, gofmt)
- Linter (eslint, phpstan, ruff, clippy)
- Type checker (tsc, mypy, phpstan)

If any fail: fix the issues before proposing commits. These are mechanical errors, not spec-related — fix them silently unless the fix is non-trivial.

## 7. Propose commits

Based on the changes, propose atomic commit(s):
- Each commit should be a coherent unit of work
- Commit messages explain WHY, not just WHAT
- Include relevant files — never `git add -A` blindly
- Confirm pre-commit checks (step 6) passed before presenting commits
- Present the commit(s) to the user for approval
- **Never commit without explicit user approval**

## 8. Transition

If the feature is complete:
> "Feature **[name]** complete. All tasks done, spec reconciled to v[N]. Index updated to `done`."

If tasks remain:
> "Session closed. Completed N of M tasks. Next: Task K: [description]. Spec reconciled to v[N]."

Always suggest:
> "Run `/evaluate` for a final audit of all changes against the spec."

## Guardrails

- Spec reconciliation is mandatory — never skip it.
- No commits without user approval.
- Never force-push, reset, or perform destructive git operations.
- Do not duplicate what is already in the project context file.
- Do not document what can be inferred from manifest files.
- Do not document what is self-evident from the code.
- Keep entries concise — one line per decision when possible.
- Preserve the existing structure and format of all files.
