---
type: regex
target: trace
pattern: '"subtype":"task_started","task_id":"([\w-]+)"(?=[^\n]*"subagent_type":"craft:review")[^\n]*"task_type":"local_agent"[^\n]*\n(?:(?![^\n]*"subtype":"task_notification","task_id":"\1")[^\n]*\n)*?[^\n]*"subtype":"task_started","task_id":"(?!\1")[\w-]+"(?=[^\n]*"subagent_type":"craft:review")[^\n]*"task_type":"local_agent"'
weight: 1
---
