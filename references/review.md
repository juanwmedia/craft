# Review

Write the result first, then review it in a fresh context. The first pass covers everything. After a fix or an edit, pass only what changed since the last pass, with the findings it answers.

## A draft

Hand the `craft:evaluate` agent its path. Until its verdict the draft is frozen: talk about anything, but change it, approve it or build on it only after the verdict. Fix what it refutes, and audit again only when a fix changes a decision or a claim a decision rests on. Only a clean draft goes to the human, by its path, never pasted.

## A code change

Hand the `craft:review` agent the change (a diff range or a list of files) and the files that say what the change must do. A change built as several slices goes to one agent per slice, all at once, when running their checks is what makes the review slow, each with its slice's files and those of the slices it waits for. A change whose checks run fast goes to one agent. A split change is confirmed when every agent confirms its slice. If it is not confirmed, fix it and review again while the findings change. An uncertain verdict with no findings goes to the human as it is. 

The same findings twice in a row are a wall: stop and give the human the findings. A confirmed change is ready to ship.
