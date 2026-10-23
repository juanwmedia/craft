# Greet: detached answers

## Implement: which greeting src/greet.js returns

Question: the review refuted `src/greet.js:2` (`Hi ${name}`). The slice body (`slices.md:8`) asks for `Hi ` plus the name, but `shape.md:5,13` and `plan.md:9` fix the greeting at exactly `Hello, <name>!`. Which one does `greet` return?

Answer: `Hello, <name>!`. The owner slice is rebuilt to return `Hello, ${name}!`.

Why: the shape Decision (marketing sign-off) and the plan acceptance both say it; the slice body is the only outlier and points at the old banner the shape replaced. Settled context is not reopened.

## Implement: the slice check never tests the return value

Question: the `done:` check of slice `greet` (`slices.md:6`) only prints `typeof m.greet`, so it passes with the wrong greeting, while `plan.md:9` says the acceptance is proven by `greet`. Implement may only append to `slices.md`. What happens to the check?

Answer: leave the slice as written in this run. After the rebuild, run `node -e "import('./src/greet.js').then(m => console.log(m.greet('Ada')))"` and see it print `Hello, Ada!` before calling the slice built. `/craft:close` reconciles the wording of `slices.md:6` and `:8` with what was built.

Why: a weak check is a documentation defect, not a build blocker. A new slice with its own file adds an artifact nobody asked for, and sending the work back to plan reopens a settled idea.

## Close: what happens to the audit findings in this file

Question: the close audit found this file's references to `src/greet.js:2`, `slices.md:6` and `:8` outdated against the working tree, "the shape replaced" (line 9) with no source in `shape.md`, and "a weak check is a documentation defect" (line 17) backed by no rule. Keep, edit, or pin the references to `fcad038`?

Answer: keep this file as written.

Why: it is a log of answers in the order given (`ask.md`), and each reference is true of the state it described (`fcad038:docs/craft/greet/slices.md:6,8`). "Old banner" comes from the old slice body, so it is loosely attributed, not invented. Line 17 is the why of a past judgment. Pinning cannot work for `src/greet.js:2`, whose `Hi ${name}` never existed in any commit.

## Close: commit and push

Question: commit `src/greet.js`, `docs/craft/greet/slices.md` and `docs/craft/greet/detached.md` as "feat: add greet(name) returning the signed-off greeting" on a new branch `greet`, push to `origin`, and open no pull request?

Answer: yes, with no attribution trailer on the commit.

Why: the human's global rules forbid attribution lines in Git, and they override the default. Branching off `main` is required. `origin` is a local bare repo with nothing to host a pull request. No lesson file and no test: `greet` returns literal product copy, which the rules forbid testing.
