---
source_file: "caiocore\channels\mochat.py"
type: "rationale"
community: "Community None"
location: "L74"
tags:
  - graphify/rationale
  - graphify/INFERRED
  - community/Community_None
---

# Return *value* if it's a dict, else empty dict.

## Connections
- [[BaseChannel]] - `uses` [INFERRED]
- [[MessageBus]] - `uses` [INFERRED]
- [[MochatConfig]] - `uses` [INFERRED]
- [[OutboundMessage]] - `uses` [INFERRED]
- [[_safe_dict()]] - `rationale_for` [EXTRACTED]

#graphify/rationale #graphify/INFERRED #community/Community_None