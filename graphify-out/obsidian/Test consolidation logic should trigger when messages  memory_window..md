---
source_file: "tests\test_consolidate_offset.py"
type: "rationale"
community: "Community 4"
location: "L182"
tags:
  - graphify/rationale
  - graphify/INFERRED
  - community/Community_4
---

# Test consolidation logic: should trigger when messages > memory_window.

## Connections
- [[.test_consolidation_needed_when_messages_exceed_window()]] - `rationale_for` [EXTRACTED]
- [[Session]] - `uses` [INFERRED]
- [[SessionManager]] - `uses` [INFERRED]

#graphify/rationale #graphify/INFERRED #community/Community_4