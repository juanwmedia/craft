# How it works

Load the `artifact-diagramming` skill with `Skill` and draw the mechanism by its rules: what earns a diagram, labeled arrows, the boundary the decision turns on, `viewBox`, markers and theming. 

The drawing is a standalone file, `docs/craft/<slug>/how-it-works.svg`, not a figure inside a page. 

The SVG element is the whole file, with no `<figure>` and no `<figcaption>`, and it uses `currentColor` so it follows whatever theme renders it. 

Embed the drawing with `![How it works](how-it-works.svg)` and put the caption, the one-line claim the drawing makes, on the line below.

If you cannot draw it, it is not shaped. 

The one exception is a thing with no mechanism at all: no flow, no boundary crossed, no state change. Then write the sentence instead, and say the idea may be too small to be a feature.

Write the drawing with `Write`, look at it once, and move on.
