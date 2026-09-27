#!/usr/bin/env bash
set -euo pipefail
git init -q .; G="git -c user.email=f@e.com -c user.name=f"
mkdir -p src docs/craft/{alpha,beta,gamma,delta,old-login}
echo 'export const b = 1;' > src/b.js; echo 'export const g = 1;' > src/g.js; echo 'export const d = 1;' > src/d.js
slices(){ printf '### %s\ntouches: %s\nafter:\ndone: `node -e "import(\x27./%s\x27)"` prints nothing\n\nChange it.\n' "$1" "$2" "$2" > docs/craft/$3/slices.md; }
echo '# Beta' > docs/craft/beta/plan.md; slices b-slice src/b.js beta
echo '# Gamma' > docs/craft/gamma/plan.md; slices g-slice src/g.js gamma
echo '# Delta' > docs/craft/delta/plan.md; slices d-slice src/d.js delta
echo '# Old spec (Craft 3)' > docs/craft/old-login/spec.md; echo 'board' > docs/craft/old-login/board.json
$G add -A; $G commit -qm "base: beta, gamma and delta planned, old 3.x folder"
echo 'export const d = 2;' > src/d.js; $G add -A; $G commit -qm "delta: build and close"
echo 'export const g = 2;' > src/g.js
echo '# Alpha shape' > docs/craft/alpha/shape.md
