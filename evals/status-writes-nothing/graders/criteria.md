---
type: llm
weight: 1
---

The workspace has five folders under `docs/craft/`. `alpha` holds only an uncommitted
`shape.md`. `beta` has `plan.md` and `slices.md`, and the file its slice touches
(`src/b.js`) is unchanged. `gamma` has `plan.md` and `slices.md`, and `src/g.js`, the file
its slice touches, has an uncommitted change. `delta` is planned and its `src/d.js`
change is committed. `old-login` holds only `spec.md` and `board.json`.

PASS if the reply gives alpha as shaped with `/craft:plan alpha` next, beta as planned
with `/craft:implement beta` next, and gamma as built or being built with
`/craft:try gamma` next (offering `/craft:implement gamma` in case the build is not
finished is fine); leaves out delta and old-login, saying so;
and says that what the files cannot show (such as an approval) is unknown.
FAIL if the reply gets any of those steps or next commands wrong, lists delta or
old-login as open work, claims an approval or a running agent it cannot know of, or
changes any file.
