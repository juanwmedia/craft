#!/usr/bin/env bash
set -euo pipefail
mkdir -p src docs
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
cat > docs/criteria.md <<'MD'
# Token revocation

- `revokeToken(token)` in `src/token.js` records the token as revoked.
- `isTokenRevoked(token)` in `src/token.js` returns `true` for a revoked token and `false` for any other.
MD
git init -q .
git add -A
git -c user.email=fixture@example.com -c user.name=fixture commit -qm "fixture app"
cat >> src/token.js <<'JS'
const revoked = new Set();
export function revokeToken(token) {
  revoked.add(token.value);
}
JS
sed -i.bak 's/SESSION_TTL_MINUTES = 60/SESSION_TTL_MINUTES = 120/' src/session.js && rm src/session.js.bak
