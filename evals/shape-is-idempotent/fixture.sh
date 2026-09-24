#!/usr/bin/env bash
set -euo pipefail
mkdir -p src docs/craft/login
cat > src/token.js <<'JS'
export const TOKEN_TTL_MINUTES = 15;
export function createToken(email) {
  return { email, value: crypto.randomUUID(), expiresAt: Date.now() + TOKEN_TTL_MINUTES * 60_000 };
}
JS
cat > src/session.js <<'JS'
export function startSession(token) {
  if (Date.now() > token.expiresAt) throw new Error("expired token");
  return { email: token.email };
}
JS
cat > docs/craft/login/how-it-works.svg <<'SVG'
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 80" fill="none" stroke="currentColor"><rect x="10" y="20" width="140" height="40"/><text x="80" y="45" fill="currentColor" stroke="none" text-anchor="middle">createToken</text><line x1="150" y1="40" x2="330" y2="40"/><text x="240" y="32" fill="currentColor" stroke="none" text-anchor="middle">token, 15 min</text><rect x="330" y="20" width="140" height="40"/><text x="400" y="45" fill="currentColor" stroke="none" text-anchor="middle">startSession</text></svg>
SVG
cat > docs/craft/login/shape.md <<'MD'
# Magic link login

## What

Sign in with a link sent by email, for people who forget their password.

## How it works

![How it works](how-it-works.svg)
A token from `createToken` becomes a session in `startSession`, unless it has expired.

## Decisions

- Tokens expire after 15 minutes, because a link left in an inbox should not open a session a day later.

## Assumptions

- An expired token cannot start a session, which is what makes an old link harmless. Tested: `src/session.js:2`.
- Nobody shares an inbox, or a link opens someone else's session. Assumed, product can confirm it.
MD
git init -q .
git add -A
git -c user.email=fixture@example.com -c user.name=fixture commit -qm "fixture app"
