# Changelog

## Unreleased (towards 3.0.0)

**Breaking.** A 2.1 board has to move from `docs/specs/<feature>/` to `docs/craft/<feature>/`, or `craft-serve` will not find it. Inside `data.json`, `mockup` (an object) becomes `howItLooks` (an array, one entry per screen). `/explore` and `/understand` are gone, `/shape` replaces both.

- `/shape` is the first phase: it interviews until nothing blocking is open, proves what it assumed hands-on, and leaves the mechanism drawn at `how-it-works.svg`. If you cannot draw it, it is not shaped.
- The board separates the two visuals a feature has. **How it works** is the mechanism, mandatory in shape. **How it looks** is the screens, optional, and either `/shape` or `/spec` may settle it. Whoever settles it first owns it; the other reads it and moves on. Leaving it undecided is fine, leaving it undecided in silence is an assumption on the board.
- `references/how-it-looks.md` is the one procedure both phases point at: record a Figma link or screenshots when they already exist, otherwise generate the screens in Claude Design through the MCP, 2 to 4 named directions at sketch fidelity when the look is open. Every write carries `if_match` from the last read, so a human editing the same file in Claude Design is never clobbered.
- `howItLooks[]` is one entry per screen. Images and static `.dc.html` artboards render on the board, several of them as a grid, each clickable to open full size. A Figma entry is a link alone.
- How it works and how it looks fold away, and the choice survives the live reload, so the board stays readable once the build starts and the tasks are what you are watching.
- New on the board: `assumptions[]` (what we are betting on, what breaks if it is wrong, when it gets checked, carried to `/close`), `artifacts[]` (published visuals with their live URL and their local source), and `exploration.resolved[]`, every question answered with the why behind it, which is what stops `/spec` from asking it again.
- `/spec` no longer reopens what `/shape` settled. It reads `resolved[]` and the glossary and synthesises from them; a blocking fork with real branches routes back to `/shape`.
- `/build` loads the `frontend-design` skill before the first component when the feature has a UI, with `howItLooks` as the brief.
- Skills reference the plugin through `${CLAUDE_PLUGIN_ROOT}`, not an absolute path, so they work on any machine. Board paths moved from `docs/specs` to `docs/craft`.
- Plugin metadata lives in `plugin.json` alone: the marketplace entry is name and source, and inherits the rest. One version number, no drift.
- Gone: the `ui-designer` agent (it needed an MCP that was never connected) and `lib/mockup-guide.md` (it duplicated the bundled `artifact-design` skill).
