#!/usr/bin/env bash
set -euo pipefail
mkdir -p src/locales src/components docs/craft/some-feature
cat > src/locales/en.json <<'JSON'
{ "nav.home": "Home", "cta.primary": "Get started" }
JSON
cat > src/components/Hero.jsx <<'JSX'
export function Hero() {
  return <button className="cta">Get started</button>;
}
JSX
git init -q .
git add -A
git -c user.email=fixture@example.com -c user.name=fixture commit -qm "fixture app"
# Someone else's unfinished work, and a board. Only the first one makes the tree busy.
cat > src/components/Checkout.jsx <<'JSX'
export function Checkout() {
  // half written, do not ship
  return null;
}
JSX
printf '{"feature":"Some feature"}' > docs/craft/some-feature/data.json
