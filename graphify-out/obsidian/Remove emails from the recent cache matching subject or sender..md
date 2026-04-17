---
source_file: "caiocore\channels\email.py"
type: "rationale"
community: "Community None"
location: "L250"
tags:
  - graphify/rationale
  - graphify/INFERRED
  - community/Community_None
---

# Remove emails from the recent cache matching subject or sender.

## Connections
- [[.remove_from_cache()]] - `rationale_for` [EXTRACTED]
- [[BaseChannel]] - `uses` [INFERRED]
- [[EmailConfig]] - `uses` [INFERRED]
- [[MessageBus]] - `uses` [INFERRED]
- [[OutboundMessage]] - `uses` [INFERRED]

#graphify/rationale #graphify/INFERRED #community/Community_None