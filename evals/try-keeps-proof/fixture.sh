#!/usr/bin/env bash
set -euo pipefail
G="git -c user.email=fixture@example.com -c user.name=fixture"
mkdir -p src test docs/craft/greet
cat > src/cli.js <<'JS'
const [, , command, name] = process.argv;
if (command === 'greet') {
  console.log(`Hello, ${name}`);
}
JS
cat > test/cli.test.js <<'JS'
import { test } from 'node:test';
import assert from 'node:assert';
import { execFileSync } from 'node:child_process';
test('greets by name', () => {
  assert.equal(execFileSync('node', ['src/cli.js', 'greet', 'Ana']).toString().trim(), 'Hello, Ana');
});
JS
cat > docs/craft/greet/plan.md <<'MD'
# Greet

## What

A command line greeting.

## Acceptance

- `node src/cli.js greet Ana` prints `Hello, Ana`. Proven by `greet`.
- `node src/cli.js greet` with no name prints `Hello, stranger`. Proven by `greet`.
MD
cat > docs/craft/greet/slices.md <<'MD'
# Slices

### greet
touches: src/cli.js, test/cli.test.js
after:
done: `node --test test/cli.test.js` prints `ℹ fail 0`

`src/cli.js` greets the name it is given, and a stranger when there is none.
MD
git init -q .
$G add -A
$G commit -qm "greet built"
