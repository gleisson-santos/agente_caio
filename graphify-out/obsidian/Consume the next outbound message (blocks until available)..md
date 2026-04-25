---
source_file: "caiocore\bus\queue.py"
type: "rationale"
community: "Community 0"
location: "L33"
tags:
  - graphify/rationale
  - graphify/INFERRED
  - community/Community_0
---

# Consume the next outbound message (blocks until available).

## Connections
- [[.consume_outbound()]] - `rationale_for` [EXTRACTED]
- [[InboundMessage]] - `uses` [INFERRED]
- [[OutboundMessage]] - `uses` [INFERRED]

#graphify/rationale #graphify/INFERRED #community/Community_0