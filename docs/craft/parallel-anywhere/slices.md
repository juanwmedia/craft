# Parallel anywhere: slices

### fast
touches: evals/implement-reviews-once-when-checks-are-fast/graders/builders-at-once.md
after:
done: `g=evals/implement-reviews-once-when-checks-are-fast/graders/builders-at-once.md; f=$(mktemp -d)/run.json; test -f $g && grep -c 'target: trace' $g && grep -o 'subagent_type":"craft:build"' $g | wc -l | tr -d ' ' && claude plugin eval . --scaffold --trust-plugin --allow-tools Bash Write Edit --judge-model sonnet -j 3 --no-publish --threshold 0 --ablation none --keep-temp --case implement-reviews-once-when-checks-are-fast --json $f > /dev/null 2>&1; test -f $g && node -e "const r=JSON.parse(require('fs').readFileSync('$f','utf8')).cases[0].arms.with; console.log(r.filter(x=>!x.error&&x.graders.some(g=>g.name==='builders-at-once')&&x.graders.every(g=>g.passed)).length+'/'+r.length)"` prints `1`, `2`, `3/3`

`builders-at-once` is a `regex` grader with `target: trace` and `weight: 1`, in the frontmatter style of the eval's other graders, whose pattern matches a `craft:build` agent's `task_started` line followed by another `craft:build` agent's `task_started` line before the first one's `task_notification`:

`"subtype":"task_started","task_id":"([\w-]+)"(?=[^\n]*"subagent_type":"craft:build")[^\n]*"task_type":"local_agent"[^\n]*\n(?:(?![^\n]*"subtype":"task_notification","task_id":"\1")[^\n]*\n)*?[^\n]*"subtype":"task_started","task_id":"(?!\1")[\w-]+"(?=[^\n]*"subagent_type":"craft:build")[^\n]*"task_type":"local_agent"`

This slice proves the assumption the shape hangs on: that implement starts its builders at once and that they leave these lines. If the check fails because no run shows two `craft:build` agents overlapping, report the traces; do not loosen the pattern.

### slow
touches: evals/implement-reviews-each-slice-when-checks-are-slow/graders/builders-at-once.md, evals/implement-reviews-each-slice-when-checks-are-slow/graders/reviewers-at-once.md
after: fast
done: `d=evals/implement-reviews-each-slice-when-checks-are-slow/graders; f=$(mktemp -d)/run.json; test -f $d/builders-at-once.md && test -f $d/reviewers-at-once.md && grep -o 'subagent_type":"craft:build"' $d/builders-at-once.md | wc -l | tr -d ' ' && grep -o 'subagent_type":"craft:review"' $d/reviewers-at-once.md | wc -l | tr -d ' ' && claude plugin eval . --scaffold --trust-plugin --allow-tools Bash Write Edit --judge-model sonnet -j 3 --no-publish --threshold 0 --ablation none --keep-temp --case implement-reviews-each-slice-when-checks-are-slow --json $f > /dev/null 2>&1; test -f $d/reviewers-at-once.md && node -e "const r=JSON.parse(require('fs').readFileSync('$f','utf8')).cases[0].arms.with; console.log(r.filter(x=>!x.error&&['builders-at-once','reviewers-at-once'].every(n=>x.graders.some(g=>g.name===n))&&x.graders.every(g=>g.passed)).length+'/'+r.length)"` prints `2`, `2`, `3/3`

`builders-at-once` is the file `fast` wrote, copied as it is. `reviewers-at-once` is the same grader with `craft:review` in place of `craft:build` in both lookaheads.
