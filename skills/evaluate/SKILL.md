---
name: evaluate
description: Evaluator-Optimizer pattern. Critically evaluates every claim, decision, and assertion from the previous output against verifiable evidence from code, documentation, configuration, and other sources. Use after producing a plan, report, analysis, or code changes to audit them for accuracy before acting, or when the user asks to verify, fact-check, or double-check the previous output.
disable-model-invocation: false
argument-hint: "[passes] [what to audit]"
allowed-tools: Read, Grep, Glob, Bash, WebFetch, WebSearch
---

Apply the Evaluator-Optimizer pattern from Agentic AI. Act as a ruthless, evidence-based auditor of the previous output (plan, report, code changes, analysis, or any artifact produced in this conversation).

## Input

Arguments: `$ARGUMENTS`

The argument is the scope. A leading number is the pass count (default 1). Whatever follows names the artifact to audit; when it does, "the previous output" below means that artifact, not the chat. No argument: the previous output in this conversation, one pass.

A caller names the artifact and gets the findings back. Evaluate never edits anything; what to do with a verdict is the caller's.

## What to evaluate

Identify every discrete claim in the previous output. A "claim" is any:
- Factual assertion ("this file does X", "the API returns Y")
- Decision or recommendation ("we should use X because Y")
- Assumption ("the current implementation handles Z")
- Behavioral description ("when the user does X, Y happens")
- Dependency or version reference ("library X supports Y")
- Architectural statement ("module A communicates with module B via C")
- Claim that contradicts ANOTHER claim in the same output. Internal consistency is evaluated claim-vs-claim, not only claim-vs-evidence

## How to evaluate

For EACH claim, you MUST:

1. **Locate the primary source of truth**: the actual code, config file, documentation, API response, or dependency manifest. Do not rely on memory. Open and read the file.
2. **Verify or refute**: does the evidence support the claim exactly as stated?
3. **Classify** using the following verdicts:
   - `VERIFIED`: evidence directly supports the claim
   - `PARTIALLY CORRECT`: the core idea holds but details are wrong or incomplete
   - `UNVERIFIED`: no evidence found to confirm or deny (flag for manual review)
   - `INCORRECT`: evidence directly contradicts the claim
   - `OUTDATED`: was true at some point but current state differs
   - `CONFLICTING`: the claim contradicts another claim in the same output (cite both). Includes the same fact or rule stated twice with diverging wording, and pairs of rules that demand incompatible actions with no stated precedence. Each claim can be individually VERIFIED and the pair still be a defect

## Evidence rules

- Every verdict MUST cite a specific source: file path + line number, URL, command output, or config key.
- "I believe" or "typically" is not evidence. If you cannot find a source, the verdict is `UNVERIFIED`.
- The author's own stated justification is not evidence. Re-derive every verdict from primary sources: an evaluator that adopts the author's rationale inherits the author's blind spots and drifts toward `VERIFIED`.
- When verifying behavior, prefer reading the actual code over documentation (docs can be stale).
- When verifying external libraries or APIs, use WebSearch/WebFetch if local docs are insufficient.

## Output

After evaluating all claims, produce a summary table:

```
| # | Claim (short) | Verdict | Evidence | Notes |
|---|---------------|---------|----------|-------|
```

Then provide:
- **Critical findings**: anything `INCORRECT`, `OUTDATED` or `CONFLICTING`. Explain the discrepancy in detail
- **Risks**: anything `UNVERIFIED` that has high impact if wrong
- **Score**: X/N claims verified, a simple reliability metric

## Multiple passes

Passes change LENS. A repeated sweep with the same lens mostly re-finds the same things, while different lenses surface near-disjoint finding sets:

- **Pass 1, accuracy**: evaluate the original output as described above.
- **Pass 2, internal consistency**: claims vs claims. Contradictions, the same fact stated twice with drift, rule pairs with unstated precedence (`CONFLICTING`).
- **Pass 3, omissions**: what load-bearing claim is missing? Unstated assumptions the output silently depends on, edge cases it never addresses, sources it should have consulted but didn't.
- **Final pass (4+)**: evaluate your OWN previous evaluations. Did you miss claims? Did you misread evidence? Did you verify superficially? Apply the same rigor to your own findings. Mark any corrections as `SELF-CORRECTED` in the table.

Each pass must produce its own table. Label them: `### Pass 1, accuracy`, `### Pass 2, internal consistency`, etc.

## Guardrails

- Do not suggest fixes or improvements. Your ONLY job is to verify. Optimization comes after.
- Do not skip claims because they "seem obvious." Verify everything.
- Do not soften verdicts. If it's wrong, it's `INCORRECT`.
- If the previous output is too large, group related claims and evaluate the groups, but still verify each group against sources.
- Time and tokens are not a constraint. Thoroughness is.
- For the highest-stakes audits, prefer running this skill in a FRESH conversation that receives only the artifact and access to the sources: an evaluator sharing the author's conversation inherits its rationalizations, and author-blind evaluation consistently finds what same-context review cannot.
