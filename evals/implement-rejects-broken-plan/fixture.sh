#!/usr/bin/env bash
set -euo pipefail
mkdir -p src docs/craft/w
cat > src/token.js <<'JS'
export const TOKEN_TTL_MINUTES = 15;
export function createToken(email) {
  return { email, value: crypto.randomUUID(), expiresInMinutes: TOKEN_TTL_MINUTES };
}
JS
cat > docs/craft/w/plan.md <<'MD'
# Work

## What

Token revocation, an audit log and a startup banner.

## Acceptance

- A revoked token reports revoked and another does not.
- Creating a token records a `token-created` event.
- `banner()` returns `Craft ready` and the Node version.

## Slices

### token-revocation
touches: src/token.js, test/token.test.js
after:
done: `node --test test/token.test.js` reports `fail 0`

Add `revokeToken(token)` and `isTokenRevoked(token)` to `src/token.js`, backed by a module-level `Set` of revoked values. The test revokes one of two tokens and checks only that one reports revoked.

### audit-log
touches: src/audit.js, src/token.js, test/audit.test.js
after:
done: `node --test test/audit.test.js` reports `fail 0`

Add `src/audit.js` with `recordEvent(type, email)` and `listEvents()`, and make `createToken` in `src/token.js` record a `token-created` event. The test creates a token and checks that `listEvents()` holds that event.

### banner
touches: src/banner.js
after:
done: `node --version` prints `v24.20.0`

Add `src/banner.js` exporting `banner()`, which returns `Craft ready` followed by the running Node version.
MD
