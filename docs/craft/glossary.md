# Glossary

- **tree**: any working tree of a repo, the main checkout or a linked worktree; the board treats them alike. _Avoid_: checkout, copy.
- **owner**: the tree whose branch changed a board since it diverged from the main tree, or holds it untracked; the main tree owns what no linked tree does. _Avoid_: active tree, live copy.
- **shadow**: a board present in a linked tree that its branch never changed; never shown. _Avoid_: stale copy, duplicate.
- **registry**: the file next to the PID listing the main tree of every repo that ever ran /board; pruned of missing paths at each scan. _Avoid_: config, cache.
- **one-step close**: /close's last offer: merge into the main branch, remove the worktree and its branch, return the session to the main tree. _Avoid_: auto-merge, finish.
