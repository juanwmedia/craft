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
git init -q .
$G add -A
$G commit -qm "token revocation shaped"
git config --local craft.detached true
