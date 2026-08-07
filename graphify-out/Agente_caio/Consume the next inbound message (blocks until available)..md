---
source_file: "caiocore\bus\queue.py"
type: "rationale"
community: "Community 1"
location: "L25"
tags:
  - graphify/rationale
  - graphify/INFERRED
  - community/Community_1
---

# Consume the next inbound message (blocks until available).

## Connections
- [[.consume_inbound()]] - `rationale_for` [EXTRACTED]
- [[InboundMessage]] - `uses` [INFERRED]
- [[OutboundMessage]] - `uses` [INFERRED]

#graphify/rationale #graphify/INFERRED #community/Community_1