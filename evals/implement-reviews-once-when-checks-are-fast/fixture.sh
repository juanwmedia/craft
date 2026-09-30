#!/usr/bin/env bash
set -euo pipefail
G="git -c user.email=fixture@example.com -c user.name=fixture"
mkdir -p src test docs/craft/ttl
cat > src/token.js <<'JS'
export const TOKEN_TTL_MINUTES = 15;
JS
cat > src/session.js <<'JS'
export const SESSION_TTL_MINUTES = 60;
JS
cat > docs/craft/ttl/plan.md <<'MD'
# TTL

## What

Tokens last 10 minutes and sessions 30.

## Acceptance

- `TOKEN_TTL_MINUTES` is 10. Proven by `token-ttl`.
- `SESSION_TTL_MINUTES` is 30. Proven by `session-ttl`.
MD
cat > docs/craft/ttl/slices.md <<'MD'
# Slices

### token-ttl
touches: src/token.js, test/token.test.js
after:
done: `node --test test/token.test.js` prints `ℹ fail 0`

Set `TOKEN_TTL_MINUTES` to 10 in `src/token.js`. `test/token.test.js` imports it and asserts it equals 10.

### session-ttl
touches: src/session.js, test/session.test.js
after:
done: `node --test test/session.test.js` prints `ℹ fail 0`

Set `SESSION_TTL_MINUTES` to 30 in `src/session.js`. `test/session.test.js` imports it and asserts it equals 30.
MD
git init -q .
$G add -A
$G commit -qm "ttl planned"
