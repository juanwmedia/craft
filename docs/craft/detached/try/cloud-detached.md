# Detached

## shape: where the version comes from
- Question: read `${CLAUDE_PLUGIN_ROOT}/.claude-plugin/plugin.json`, `claude plugin list`, or `git describe`?
- Answer: `${CLAUDE_PLUGIN_ROOT}/.claude-plugin/plugin.json`.
- Why: it is the only source that names what is loaded, the cache copy or the `--plugin-dir` tree; the list misses `--plugin-dir`, git misses both and breaks outside this repo.

## shape: the answer line
- Question: `craft 4.9.0` alone, or with the root path or a git sha?
- Answer: `craft <version>` and nothing else.
- Why: the idea asks for one line, the version; nothing in the repo asks for a path or a sha.

## shape: model invocation
- Question: `disable-model-invocation: false`?
- Answer: yes.
- Why: all nine skills set it, and a routine asking for the version in words is the same need detached had.

## shape: read-only
- Question: one Read of that file, no Bash, no writes?
- Answer: yes, with detached's line "Run nothing else, and read and write nothing else."
- Why: there is nothing to compute.

## shape: never commit or push
- Question: record that this work's close stops before its commit question?
- Answer: yes.
- Why: that is what "Never commit or push anything" means for this work.

## shape: README, CHANGELOG, eval
- Question: add a README line, a CHANGELOG entry and an eval?
- Answer: yes to all three; the eval greps the line with a pattern, not the literal version.
- Why: every skill has its line and its eval; a literal version breaks on every bump.
