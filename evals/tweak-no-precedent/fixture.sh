#!/usr/bin/env bash
set -euo pipefail
mkdir -p src/locales src/components
cat > src/locales/en.json <<'JSON'
{
  "nav.home": "Home",
  "cta.primary": "Get started",
  "nav.pricing": "Pricing"
}
JSON
cat > src/locales/es.json <<'JSON'
{
  "nav.home": "Inicio",
  "cta.primary": "Get started",
  "nav.pricing": "Precios"
}
JSON
cat > src/components/Hero.jsx <<'JSX'
export function Hero() {
  return (
    <section className="hero">
      <h1>Ship it on Friday</h1>
      <button className="cta">Get started</button>
    </section>
  );
}
JSX
cat > src/components/Hero.test.js <<'JS'
import { render, screen } from '@testing-library/react';
import { Hero } from './Hero';

test('the hero shows the primary call to action', () => {
  render(<Hero />);
  expect(screen.getByText('Get started')).toBeInTheDocument();
});
JS
cat > package.json <<'JSON'
{ "name": "fixture-app", "version": "1.0.0", "private": true }
JSON
git init -q .
git add -A
git -c user.email=fixture@example.com -c user.name=fixture commit -qm "fixture app"
