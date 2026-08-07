---
source_file: "caiocore\channels\email.py"
type: "rationale"
community: "Community 0"
location: "L250"
tags:
  - graphify/rationale
  - graphify/INFERRED
  - community/Community_0
---

# Remove emails from the recent cache matching subject or sender.

## Connections
- [[.remove_from_cache()]] - `rationale_for` [EXTRACTED]
- [[BaseChannel]] - `uses` [INFERRED]
- [[EmailConfig]] - `uses` [INFERRED]
- [[MessageBus]] - `uses` [INFERRED]
- [[OutboundMessage]] - `uses` [INFERRED]

#graphify/rationale #graphify/INFERRED #community/Community_0