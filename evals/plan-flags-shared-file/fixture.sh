#!/usr/bin/env bash
set -euo pipefail
mkdir -p src docs/craft/logout
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
cat > docs/craft/logout/plan.md <<'MD'
# Logout

## What

Add logout. A new `endSession(session)` in `src/session.js` marks the session as ended and revokes the token that started it, so that token can no longer be treated as valid. Revocation lives in `src/token.js` as a module-level set of revoked token values, and a session keeps a reference to its token so `endSession` can find it. A test drives the whole flow with Node's built-in test runner, since the repo has no package.json or test runner.

## Acceptance

- `revokeToken(token)` makes `isTokenRevoked(token)` return `true` for that token, while a token that was never revoked returns `false`.
- After `endSession(session)`, `session.ended` is `true` and `isTokenRevoked(session.token)` is `true`.
- Ending one session leaves every other token unrevoked.

## Slices

### token-revocation
touches: src/token.js, test/token.test.js
after:
done: `node --test test/token.test.js` reports `fail 0`

Add a module-level `Set` of revoked token values to `src/token.js`, with `revokeToken(token)` adding `token.value` to it and `isTokenRevoked(token)` checking it. The test creates two tokens, revokes one, and checks that only that one reports revoked.

### end-session
touches: src/session.js, src/token.js, test/logout.test.js
after:
done: `node --test test/logout.test.js` reports `fail 0`

`startSession(token)` also stores `token` on the session it returns. Add `endSession(session)`, which sets `session.ended = true` and calls `revokeToken(session.token)` from `src/token.js`. The test creates two tokens, starts a session with the first, ends it, then checks that the session has `ended`, that the first token is revoked, and that the second is not.
MD
git init -q .
git add -A
git -c user.email=fixture@example.com -c user.name=fixture commit -qm "fixture app"
