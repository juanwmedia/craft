#!/usr/bin/env bash
set -euo pipefail
mkdir -p src test docs/craft/logout
cat > src/token.js <<'JS'
export const TOKEN_TTL_MINUTES = 15;
export function createToken(email) {
  return { email, value: crypto.randomUUID(), expiresInMinutes: TOKEN_TTL_MINUTES };
}
JS
cat > src/session.js <<'JS'
export const SESSION_TTL_MINUTES = 60;
export function startSession(token) {
  return { email: token.email, expiresInMinutes: SESSION_TTL_MINUTES };
}
JS
cat > test/token.test.js <<'JS'
import { test } from 'node:test';
import assert from 'node:assert';
import { createToken, TOKEN_TTL_MINUTES } from '../src/token.js';
test('a token lasts the ttl', () => {
  assert.equal(createToken('a@b.c').expiresInMinutes, TOKEN_TTL_MINUTES);
});
JS
cat > docs/craft/logout/plan.md <<'MD'
# Logout

## What

Add logout. A new `endSession(session)` in `src/session.js` marks the session as ended and revokes the token that started it, so `isTokenRevoked` reports that token as revoked. Nothing validates tokens today, so no caller rejects a revoked token yet; that is out of scope. Revocation lives in `src/token.js` as a module-level set of revoked token values, and a session keeps a reference to its token so `endSession` can find it. Tests use Node's built-in test runner.

## Acceptance

- After `revokeToken(token)`, `isTokenRevoked(token)` returns `true`. Proven by `token-revocation`.
- `isTokenRevoked(token)` returns `false` for a token that was never revoked. Proven by `token-revocation`.
- After `endSession(session)`, `session.ended` is `true`. Proven by `end-session`.
- After `endSession(session)`, `isTokenRevoked(session.token)` is `true`. Proven by `end-session`.
MD
cat > docs/craft/logout/slices.md <<'MD'
# Logout slices

### token-revocation
touches: src/token.js, test/token.test.js
after:
done: `node --test test/token.test.js` exits 0 and prints `✔ a token lasts the ttl`, `✔ only a revoked token reports revoked`, `ℹ tests 2`, `ℹ suites 0`, `ℹ pass 2`, `ℹ fail 0`, `ℹ cancelled 0`, `ℹ skipped 0`, `ℹ todo 0`, plus timings (each `✔` line's trailing duration and `ℹ duration_ms`) that vary

Add a module-level `Set` of revoked token values to `src/token.js`, with `revokeToken(token)` adding `token.value` to it and `isTokenRevoked(token)` checking it. Keying on `token.value` works because `createToken` gives each token a unique `value` (src/token.js:3). Add one test named `only a revoked token reports revoked` to `test/token.test.js` that creates two tokens, revokes one, and checks that only that one reports revoked. The existing test stays, so the file runs two tests.

### end-session
touches: src/session.js, test/logout.test.js
after: token-revocation
done: `node --test test/logout.test.js` exits 0 and prints `✔ ending a session revokes its token`, `ℹ tests 1`, `ℹ suites 0`, `ℹ pass 1`, `ℹ fail 0`, `ℹ cancelled 0`, `ℹ skipped 0`, `ℹ todo 0`, plus timings (the `✔` line's trailing duration and `ℹ duration_ms`) that vary

`startSession(token)` also stores `token` on the session it returns, so `endSession` can reach it. Add `endSession(session)`, which sets `session.ended = true` and calls `revokeToken(session.token)` imported from `src/token.js`. `test/logout.test.js` holds one test named `ending a session revokes its token`, written like `test/token.test.js`: it creates a token, starts a session with it, ends the session, and checks that `session.ended` is `true` and `isTokenRevoked(session.token)` is `true`.
MD
git init -q .
git add -A
git -c user.email=fixture@example.com -c user.name=fixture commit -qm "fixture app"
