# Review

Write the result first, then review it in a fresh context. The first pass covers everything. After a fix or an edit, pass only what changed since the last pass, with the findings it answers.

## A draft

Run the `craft:evaluate` skill on its path. Anything refuted means fix the draft and audit again. Only a clean draft goes to the human, by its path, never pasted.

## A code change

Hand the `craft:review` agent the change (a diff range or a list of files) and the file that says what the change must do. If it is not confirmed, fix it and review again while the findings change. An uncertain verdict with no findings goes to the human as it is. 

The same findings twice in a row are a wall: stop and give the human the findings. A confirmed change is ready to ship.
