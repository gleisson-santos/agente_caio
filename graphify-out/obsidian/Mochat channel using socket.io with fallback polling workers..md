---
source_file: "caiocore\channels\mochat.py"
type: "rationale"
community: "Community 0"
location: "L216"
tags:
  - graphify/rationale
  - graphify/INFERRED
  - community/Community_0
---

# Mochat channel using socket.io with fallback polling workers.

## Connections
- [[BaseChannel]] - `uses` [INFERRED]
- [[MessageBus]] - `uses` [INFERRED]
- [[MochatChannel]] - `rationale_for` [EXTRACTED]
- [[MochatConfig]] - `uses` [INFERRED]
- [[OutboundMessage]] - `uses` [INFERRED]

#graphify/rationale #graphify/INFERRED #community/Community_0