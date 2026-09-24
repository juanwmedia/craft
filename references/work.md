# Work

Each piece of work lives in its own folder, `docs/craft/<slug>/`, where `<slug>` is a short kebab-case name for it. 

The slug is how the human names the work in every command.

When the first word of `$ARGUMENTS` is the slug of a folder that exists, or the input is a path inside one, that is the work. 

The files in its folder are its context, and the rest of the input is what changed since they were written.

Otherwise the input is a new idea, or the path to a file with context from elsewhere. The slug is the one that context names, or else a new name for it.

What the context settles is not reopened: work only on what changed and what it leaves open. With nothing changed and nothing open, change nothing and say so.
