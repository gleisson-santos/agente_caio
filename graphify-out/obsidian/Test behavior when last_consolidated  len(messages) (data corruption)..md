---
source_file: "tests\test_consolidate_offset.py"
type: "rationale"
community: "Community None"
location: "L227"
tags:
  - graphify/rationale
  - graphify/INFERRED
  - community/Community_None
---

# Test behavior when last_consolidated > len(messages) (data corruption).

## Connections
- [[.test_last_consolidated_exceeds_message_count()]] - `rationale_for` [EXTRACTED]
- [[Session]] - `uses` [INFERRED]
- [[SessionManager]] - `uses` [INFERRED]

#graphify/rationale #graphify/INFERRED #community/Community_None