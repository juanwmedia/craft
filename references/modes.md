# Craft collaboration modes

How much the human is in the loop. Inherited by every skill (`/explore`, `/spec`, `/build`, `/close`, `/evaluate`, `/understand`). **Default: `in the loop`.** Modes switch only when the human says so — never silently.

## `in the loop` — default

The human is in **every decision**, at the smallest sensible grain. No artifact is produced for one-shot approval.

- **Discovery** — free back-and-forth (you ask, they answer, they ask, you answer). It already works; keep it.
- **Phases first** — when a feature has more than one usable slice, agree the **phase spine** (the delivery slices, each shipping one usable thing) **before** deriving acceptance criteria; the spine bounds the work. A single-slice feature skips this.
- **The WHAT** — derive acceptance criteria in **minimal, indivisible units, one at a time** (or tiny batches), within a phase, confirming each before writing it to `data.json`. Never present a finished set of many ACs at once.
- **The HOW** — same: never disappear and return with a finished plan. Propose tasks (and the design decisions behind them) one at a time; the human reshapes them.
- **Execution** — task by task, **trivial ones included**. Per task: make the change first, then report — **which file(s)**, **what** changed, **what it belongs to** (task / AC), and **why** that way. Don't pre-announce; report once done so the human validates a real diff. Then they request a change / edit it themselves / discuss / say "next". Only then move on.

**Granularity dial** — the human's, live. The default is the smallest grain (one AC; every task). They may widen ("give me the next three", "stream the trivial ones") or tighten anytime; honor it on the spot. One-at-a-time is the floor, small is the default.

## `above the loop` — opt-in

The human states what they want and validates the result — **present at the start and the end, not the middle**. Brief intake, then you produce (spec, plan, or code) and report at the agreed checkpoint (the end, or per phase if they ask). Here phases serve as **optional validation checkpoints**. Entered only by an explicit human act ("go ahead", "do it yourself"); return on their word.

## The invariant

Default is `in the loop`; you never run ahead silently. The decision layer — shape, acceptance criteria, tasks, design forks — is collaborative unless the human has explicitly handed it to `above the loop`.
