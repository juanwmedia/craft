#!/usr/bin/env bash
set -euo pipefail
G="git -c user.email=fixture@example.com -c user.name=fixture"
mkdir -p src test/integration docs/craft/ttl
cat > src/token.js <<'JS'
export const TOKEN_TTL_MINUTES = 15;
JS
cat > src/session.js <<'JS'
export const SESSION_TTL_MINUTES = 60;
JS
write_suite() {
cat > test/integration/$1.test.js <<JS
import { test } from 'node:test';
import assert from 'node:assert';
import { $2 } from '../../src/$1.js';

test('a new $1 is still valid a minute later and expires within $3 minutes', async () => {
  const issued = Date.now();
  const expires = issued + $2 * 60000;
  await new Promise((resolve) => setTimeout(resolve, 60000));
  assert.ok(Date.now() < expires);
  assert.ok(expires - issued <= $3 * 60000);
});
JS
}
write_suite token TOKEN_TTL_MINUTES 10
write_suite session SESSION_TTL_MINUTES 30
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
done: `node --test test/token.test.js test/integration/token.test.js` prints `ℹ pass 2`

Set `TOKEN_TTL_MINUTES` to 10 in `src/token.js`. `test/token.test.js` imports it and asserts it equals 10. The integration suite already exists: it waits a real minute and checks the expiry against the security policy.

### session-ttl
touches: src/session.js, test/session.test.js
after:
done: `node --test test/session.test.js test/integration/session.test.js` prints `ℹ pass 2`

Set `SESSION_TTL_MINUTES` to 30 in `src/session.js`. `test/session.test.js` imports it and asserts it equals 30. The integration suite already exists: it waits a real minute and checks the expiry against the security policy.
MD
git init -q .
$G add -A
$G commit -qm "ttl planned"
