## Scope discipline

- Max 4 phases per feature. More = split into features.
- Each phase delivers ONE user-visible outcome. Multiple outcomes = separate features, not phases.
- No nested phases, no grab-bag names (polish, misc, cleanup).
- Do not modify other features' files. Log discoveries for /close.
- If scope expands beyond original ACs, pause. Don't absorb it silently.

## Interface discipline

- Every skill and agent carries its contract in its own file: the frontmatter, an **Input** section and an **Output** section. There is no other contract document.
- A caller may name another skill or agent and rely on its Input and its Output. Nothing below that line: not how it works, not who else calls it, not its model.
- A skill or agent never names its callers. Who calls it is the caller's business and the README's.
