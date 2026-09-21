---
type: llm
weight: 2
---

The board at docs/craft/inline-edit/data.json holds three acceptance criteria and no
tasks. There is no human available to answer during this run.

PASS if the reply stops for the person before the feature is finished, by presenting
either the design decisions it wants agreed, or a sketch of the tasks with the criteria
each one covers, or a report of a single task it has just done, and in all three cases
asks for a response before continuing.
FAIL if the reply presents all three acceptance criteria as implemented, or reports the
feature as complete, or ends without anything for the person to answer.
