#!/usr/bin/env bash
set -euo pipefail
mkdir -p src test docs/craft/logout
cat > src/token.js <<'JS'
export const TOKEN_TTL_MINUTES = 15;
export function createToken(email) {
  return { email, value: crypto.randomUUID(), expiresInMinutes: TOKEN_TTL_MINUTES };
}
const revokedTokens = new Set();
export function revokeToken(token) {
  revokedTokens.add(token.value);
}
export function isTokenRevoked(token) {
  return revokedTokens.has(token.value);
}
JS
cat > src/audit.js <<'JS'
const events = [];
export function recordEvent(type, email) {
  events.push({ type, email });
}
export function listEvents() {
  return [...events];
}
JS
cat > test/token.test.js <<'JS'
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createToken, revokeToken, isTokenRevoked } from '../src/token.js';
test('only the revoked token reports revoked', () => {
  const a = createToken('a@example.com');
  const b = createToken('b@example.com');
  revokeToken(a);
  assert.equal(isTokenRevoked(a), true);
  assert.equal(isTokenRevoked(b), false);
});
JS
cat > test/audit.test.js <<'JS'
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { recordEvent, listEvents } from '../src/audit.js';
test('listEvents returns recorded events in order', () => {
  recordEvent('login', 'a@example.com');
  recordEvent('logout', 'a@example.com');
  assert.deepEqual(listEvents(), [{ type: 'login', email: 'a@example.com' }, { type: 'logout', email: 'a@example.com' }]);
});
JS
cat > docs/craft/logout/plan.md <<'MD'
# Logout helpers

## What

Token revocation and an audit log.

## Acceptance

- A revoked token reports revoked and another does not.
- Recorded events come back in order.

## Slices

### token-revocation
touches: src/token.js, test/token.test.js
after:
done: `node --test test/token.test.js` reports `fail 0`

Add `revokeToken(token)` and `isTokenRevoked(token)` to `src/token.js`, backed by a module-level `Set` of revoked values. The test revokes one of two tokens and checks only that one reports revoked.

### audit-log
touches: src/audit.js, test/audit.test.js
after:
done: `node --test test/audit.test.js` reports `fail 0`

Add `src/audit.js` with an in-memory list of events, `recordEvent(type, email)` appending `{ type, email }` and `listEvents()` returning a copy of the list. The test records two events and checks that `listEvents()` returns both in order.
MD
