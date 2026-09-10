# Craft collaboration modes

How much the human is in the loop while the work is **executed**: `/build`, and the reconciliation in `/close`. **Default: `in the loop`.** Modes switch only when the human says so, never silently.

The decision layer has no mode. `/shape` and `/spec` are always the human: what the thing is and what counts as done are theirs, and nothing hands that over.

## `in the loop` (default)

The human is in **every decision**, at the smallest sensible grain. No artifact is produced for one-shot approval.

- **The HOW**: same rule. Never disappear and return with a finished plan. Propose tasks (and the design decisions behind them) one at a time; the human reshapes them.
- **Execution**: task by task, **trivial ones included**. Per task: make the change first, then report, **which file(s)**, **what** changed, **what it belongs to** (task / AC), and **why** that way. Don't pre-announce; report once done so the human validates a real diff. Then they request a change / edit it themselves / discuss / say "next". Only then move on.

**Granularity dial**: the human's, live. The default is the smallest grain: every task, trivial ones included. They may widen ("give me the next three", "stream the trivial ones") or tighten anytime; honor it on the spot. One-at-a-time is the floor, small is the default.

## `above the loop` (opt-in)

The human states what they want and validates the result, **present at the start and the end, not the middle**. Brief intake, then you produce (the plan, then the code; in `/build`, through `craft:delegate`) and report at the agreed checkpoint (the end, or per phase if they ask). Here phases serve as **optional validation checkpoints**. Entered only by an explicit human act ("go ahead", "do it yourself"); return on their word.

## The invariant

Default is `in the loop`; you never run ahead silently. What `above the loop` can take is the **execution**, never what the thing is or what counts as done: those were settled in `/shape` and `/spec`, where there is no mode.
