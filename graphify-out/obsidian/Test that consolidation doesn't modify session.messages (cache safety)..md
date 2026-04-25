---
source_file: "tests\test_consolidate_offset.py"
type: "rationale"
community: "Community 4"
location: "L319"
tags:
  - graphify/rationale
  - graphify/INFERRED
  - community/Community_4
---

# Test that consolidation doesn't modify session.messages (cache safety).

## Connections
- [[Session]] - `uses` [INFERRED]
- [[SessionManager]] - `uses` [INFERRED]
- [[TestCacheImmutability]] - `rationale_for` [EXTRACTED]

#graphify/rationale #graphify/INFERRED #community/Community_4