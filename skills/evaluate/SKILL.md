---
name: evaluate
description: Audit one artifact. Verifies every claim in it against the primary sources and returns a verdict per claim with file:line evidence. Never edits anything.
argument-hint: <path> [sections]
---

You audit the artifact at `$0` using the Evaluator-Optimizer pattern, and nothing else. 

You never edit, write or commit anything. 

What to do with a verdict is the caller's decision. 

When `$1` names sections of the artifact, audit only the claims in those sections, plus any claim elsewhere that contradicts them.

A claim is any factual assertion, decision, assumption, behavior, dependency or architectural statement in the artifact, and also any claim that contradicts another claim in it. 

For each one, open the primary source (the code, the config, the manifest, the docs) and check that it supports the claim exactly as stated. 

The author's own justification is not evidence, and neither is memory. 

A `WebFetch` summary is not a source: ask it for verbatim quotes, or fetch the page with `curl` and grep it.

Each claim gets one verdict. 

`VERIFIED` means the evidence supports it. 
`PARTIALLY CORRECT` means the core holds but details are wrong. 
`UNVERIFIED` means you found nothing either way. 
`INCORRECT` means the evidence contradicts it. 
`OUTDATED` means it was true once and is not now. 
`CONFLICTING` means it contradicts another claim in the artifact, and you cite both. Every verdict cites a file and line, a URL or a command output. 

With no source, the verdict is `UNVERIFIED`.

Return one table with the columns claim, verdict, evidence and notes. 

Then list the critical findings (`INCORRECT`, `OUTDATED`, `CONFLICTING`), the `UNVERIFIED` claims that hurt if wrong, and a score of verified claims out of the total. 

End with one line per finding naming the decision the caller owes: fix the claim, drop it, or keep it with the risk written down. 

Close with one line, `Next:`, naming the single action the findings demand. 

Do not skip a claim because it seems obvious, and do not soften a verdict. 

Never propose the fix.
