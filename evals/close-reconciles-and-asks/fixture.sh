#!/usr/bin/env bash
set -euo pipefail
G="git -c user.email=fixture@example.com -c user.name=fixture"
mkdir -p src test docs/craft/w
cat > src/token.js <<'JS'
export const TOKEN_TTL_MINUTES = 15;
export function createToken(email) {
  return { email, value: crypto.randomUUID(), expiresInMinutes: TOKEN_TTL_MINUTES };
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
cat > docs/craft/w/shape.md <<'MD'
# Token revocation

## What

A token can be revoked, and a revoked token reports it.

## How it works

`src/token.js` keeps the revoked token values in a module-level set, and `isTokenRevoked` checks it.

## Decisions

- **Key on `token.value`.** Every token gets a unique value from `crypto.randomUUID()`.

## Assumptions

1. **Assumed. Node's built-in test runner is enough, with no test dependency.** If wrong, the check needs a package. Juan can confirm.
MD
cat > docs/craft/w/plan.md <<'MD'
# Token revocation

## What

Revoke a token and ask whether it is revoked.

## Acceptance

- After `revokeToken(token)`, `isTokenRevoked(token)` returns `true`, and another token returns `false`. Proven by `token-revocation`.
MD
cat > docs/craft/w/slices.md <<'MD'
# Slices

### token-revocation
touches: src/token.js, test/token.test.js
after:
done: `node --test test/token.test.js` prints `ℹ fail 0`

Add `revokeToken(token)` and `isTokenRevoked(token)` to `src/token.js`, and a test that revokes one of two tokens and checks only that one reports revoked.
MD
git init -q .
$G add -A
$G commit -qm "token revocation planned"
cat > src/revocations.js <<'JS'
export const revoked = new Set();
JS
cat > src/token.js <<'JS'
import { revoked } from './revocations.js';
export const TOKEN_TTL_MINUTES = 15;
export function createToken(email) {
  return { email, value: crypto.randomUUID(), expiresInMinutes: TOKEN_TTL_MINUTES };
}
export function revokeToken(token) {
  revoked.add(token.value);
}
export function isTokenRevoked(token) {
  return revoked.has(token.value);
}
JS
cat >> test/token.test.js <<'JS'
import { revokeToken, isTokenRevoked } from '../src/token.js';
test('only a revoked token reports revoked', () => {
  const a = createToken('a@b.c');
  const b = createToken('b@b.c');
  revokeToken(a);
  assert.equal(isTokenRevoked(a), true);
  assert.equal(isTokenRevoked(b), false);
});
JS
printf 'console.log(1)
' > probe-audit.mjs
