#!/usr/bin/env bash
set -euo pipefail
mkdir -p src docs/craft/login
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
cat > docs/craft/login/shape.md <<'MD'
# Magic link login

## What

Sign in with a link sent by email, for people who forget their password.

## How it works

`createToken` in `src/token.js` makes a token, `src/mailer.js` sends the email with the link, and `startSession` in `src/session.js` turns the token into a session.

## Decisions

- `src/token.js` sets the token lifetime to 15 minutes.
- `src/session.js` sets the session lifetime to 60 minutes.

## Assumptions

- Nobody shares an inbox, or a link opens someone else's session. Assumed, product can confirm it.
MD
git init -q .
git add -A
git -c user.email=fixture@example.com -c user.name=fixture commit -qm "fixture app"
