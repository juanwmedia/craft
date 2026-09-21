## Scope discipline

- Each phase delivers ONE user-visible outcome. Multiple outcomes = separate features, not phases.
- No nested phases, no grab-bag names (polish, misc, cleanup).
- Do not modify other features' files. Log discoveries for /close.
- If scope expands beyond the original ACs, pause. Don't absorb it silently: whether what remains becomes its own feature is the human's call. `/build`'s phase boundary sets the count that triggers the question.

## Interface discipline

- Every agent carries its contract in its own file: the frontmatter, an **Input** section and an **Output** section. A skill's contract is its frontmatter (`description`, `argument-hint`, `allowed-tools`), and the ones that also carry **Input** and **Output** keep them true. There is no other contract document.
- A caller may name another skill or agent and rely on that contract. Nothing below it: not how it works, not what it does internally.
