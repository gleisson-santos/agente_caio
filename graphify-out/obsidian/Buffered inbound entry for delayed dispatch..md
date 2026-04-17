---
source_file: "caiocore\channels\mochat.py"
type: "rationale"
community: "Community None"
location: "L44"
tags:
  - graphify/rationale
  - graphify/INFERRED
  - community/Community_None
---

# Buffered inbound entry for delayed dispatch.

## Connections
- [[BaseChannel]] - `uses` [INFERRED]
- [[MessageBus]] - `uses` [INFERRED]
- [[MochatBufferedEntry]] - `rationale_for` [EXTRACTED]
- [[MochatConfig]] - `uses` [INFERRED]
- [[OutboundMessage]] - `uses` [INFERRED]

#graphify/rationale #graphify/INFERRED #community/Community_None