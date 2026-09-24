#!/usr/bin/env bash
set -euo pipefail
mkdir -p src docs/craft/w
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
cat > docs/craft/w/plan.md <<'MD'
# Work

## What

Token revocation, with sessions shortened to 30 minutes.

## Acceptance

- A revoked token reports revoked and another does not.
- A session started from any token expires in 30 minutes.
MD
cat > docs/craft/w/slices.md <<'MD'
# Slices

### token-revocation
touches: src/token.js, test/token.test.js
after:
done: `node --test test/token.test.js` reports `fail 0`

Add a module-level `Set` of revoked token values to `src/token.js`, with `revokeToken(token)` adding `token.value` to it and `isTokenRevoked(token)` checking it. The test creates two tokens, revokes one, and checks that only that one reports revoked.
MD
git init -q .
git add -A
git -c user.email=fixture@example.com -c user.name=fixture commit -qm "fixture app"
