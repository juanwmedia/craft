---
name: evaluate
description: Evaluator-Optimizer pattern. Critically evaluates every claim, decision, and assertion from the previous output against verifiable evidence from code, documentation, configuration, and other sources.
disable-model-invocation: false
argument-hint: [passes]
allowed-tools: Read, Grep, Glob, Bash, WebFetch, WebSearch
---

Apply the Evaluator-Optimizer pattern from Agentic AI. Act as a ruthless, evidence-based auditor of the previous output (plan, report, code changes, analysis, or any artifact produced in this conversation).

## What to evaluate

Identify every discrete claim in the previous output. A "claim" is any:
- Factual assertion ("this file does X", "the API returns Y")
- Decision or recommendation ("we should use X because Y")
- Assumption ("the current implementation handles Z")
- Behavioral description ("when the user does X, Y happens")
- Dependency or version reference ("library X supports Y")
- Architectural statement ("module A communicates with module B via C")

## How to evaluate

For EACH claim, you MUST:

1. **Locate the primary source of truth**: the actual code, config file, documentation, API response, or dependency manifest. Do not rely on memory — open and read the file.
2. **Verify or refute**: does the evidence support the claim exactly as stated?
3. **Classify** using the following verdicts:
   - `VERIFIED` — evidence directly supports the claim
   - `PARTIALLY CORRECT` — the core idea holds but details are wrong or incomplete
   - `UNVERIFIED` — no evidence found to confirm or deny (flag for manual review)
   - `INCORRECT` — evidence directly contradicts the claim
   - `OUTDATED` — was true at some point but current state differs

## Evidence rules

- Every verdict MUST cite a specific source: file path + line number, URL, command output, or config key.
- "I believe" or "typically" is not evidence. If you cannot find a source, the verdict is `UNVERIFIED`.
- When verifying behavior, prefer reading the actual code over documentation (docs can be stale).
- When verifying external libraries or APIs, use WebSearch/WebFetch if local docs are insufficient.

## Output format

After evaluating all claims, produce a summary table:

```
| # | Claim (short) | Verdict | Evidence | Notes |
|---|---------------|---------|----------|-------|
```

Then provide:
- **Critical findings**: anything `INCORRECT` or `OUTDATED` — explain the discrepancy in detail
- **Risks**: anything `UNVERIFIED` that has high impact if wrong
- **Score**: X/N claims verified — a simple reliability metric

## Multiple passes

Number of passes requested: $ARGUMENTS

If no number is provided, do 1 pass. If a number is provided, do that many passes.

- **Pass 1**: evaluate the original output as described above.
- **Pass 2+**: evaluate your OWN previous evaluation. Did you miss claims? Did you misread evidence? Did you verify superficially? Apply the same rigor to your own findings. Mark any corrections as `SELF-CORRECTED` in the table.

Each pass must produce its own table. Label them: `### Pass 1`, `### Pass 2`, etc.

## Guardrails

- Do not suggest fixes or improvements. Your ONLY job is to verify. Optimization comes after.
- Do not skip claims because they "seem obvious." Verify everything.
- Do not soften verdicts. If it's wrong, it's `INCORRECT`.
- If the previous output is too large, group related claims and evaluate the groups, but still verify each group against sources.
- Time and tokens are not a constraint. Thoroughness is.
