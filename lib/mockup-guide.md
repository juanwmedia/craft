# Craft mockup guide

A Craft mockup is a **self-contained HTML explainer of a UI feature's screen** — what we're
building *and why each piece is the way it is* (pins → decisions). Lives at `docs/specs/<feature>/mockup.html`, embedded in the board's iframe
(so its styles are isolated — no namespacing needed). Pointer in `data.json`: `"mockup": { "title", "file" }`.

This guide is **atoms + contract, not compositions.** It exists so mockups look like one family
and so you don't re-derive the basics each time. **The screen layout itself is always yours** —
every feature's screen is different; don't follow a prescribed composition.

---

## Fixed — the atoms (use these, don't reinvent)

### Tokens (reuse the board palette so the mockup looks native)
```
--bg:#0d0f14  --panel:#161922  --line:#272c37  --ink:#e8eaed  --mut:#9aa3b2
--blue:#60a5fa  --green:#34d399  --amber:#fbbf24  --pin/red:#f87171  --violet:#a78bfa
font: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif
```
The annotation/notes chrome uses the dark palette. The **device screen interior** (the product
UI being mocked) can be light — it's the real app surface.

### Annotation convention (this is what makes it a Craft mockup)
Numbered **pins** anchored on elements, each linking to the *why*:
- Pin = a small red circle with a white number, absolutely positioned on the element's corner.
- A **notes panel** lists each number → one line + the **decision / AC ref** it embodies (e.g. `D2`, `AC-7`).
- Count, placement, and wording are **yours** — but every pin should reference a real decision or AC. No decorative pins.
```html
<span class="pin">2</span>  <!-- on the element -->
<!-- notes: 2 → "Scenario snippet — runnable, read-mode so we don't telegraph. D4" -->
```
```css
.pin{position:absolute;width:20px;height:20px;border-radius:50%;background:#f87171;color:#0b1220;
  font-size:11px;font-weight:800;display:flex;align-items:center;justify-content:center;box-shadow:0 0 0 3px rgba(248,113,113,.25)}
```

### Contract
- **Self-contained**: own `<style>`, no external fonts / CSS / JS, no network calls.
- **English**, like all Craft artifacts.
- **One screen, scannable** — a mockup orients, it is not the real app.

---

## Optional — primitives (grab or ignore)
A **browser frame** for web screens (three dots + a fake URL bar), a **phone frame** for mobile,
a plain **panel** for a component. Reach for one if it helps; skip it if it doesn't.
```html
<div class="chrome"><i style="background:#ff5f57"></i><i style="background:#febc2e"></i><i style="background:#28c840"></i>
  <span class="url">frontendleap.com/en/…</span></div>
```

---

## Yours — the composition (don't guide this)
What the screen shows, its layout, its elements, its content, its arrangement. This is the
bespoke, creative part — the reason a mockup can't be templated. **Everything not listed above is yours.**

Worked example: `docs/specs/spot-the-slop/mockup.html`.
