#!/usr/bin/env bash
set -euo pipefail
G="git -c user.email=fixture@example.com -c user.name=fixture"
mkdir -p src
cat > src/token.js <<'JS'
export const TOKEN_TTL_MINUTES = 15;
export function createToken(email) {
  return { email, value: crypto.randomUUID(), expiresInMinutes: TOKEN_TTL_MINUTES };
}
JS
git init -q .
$G add -A
$G commit -qm "app"
git config --local craft.detached true
