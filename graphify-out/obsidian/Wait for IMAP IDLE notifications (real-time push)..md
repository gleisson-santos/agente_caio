---
source_file: "caiocore\channels\email.py"
type: "rationale"
community: "Community None"
location: "L187"
tags:
  - graphify/rationale
  - graphify/INFERRED
  - community/Community_None
---

# Wait for IMAP IDLE notifications (real-time push).

## Connections
- [[._idle_loop()]] - `rationale_for` [EXTRACTED]
- [[BaseChannel]] - `uses` [INFERRED]
- [[EmailConfig]] - `uses` [INFERRED]
- [[MessageBus]] - `uses` [INFERRED]
- [[OutboundMessage]] - `uses` [INFERRED]

#graphify/rationale #graphify/INFERRED #community/Community_None