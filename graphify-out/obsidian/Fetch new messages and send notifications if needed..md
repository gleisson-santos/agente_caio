---
source_file: "caiocore\channels\email.py"
type: "rationale"
community: "Community None"
location: "L135"
tags:
  - graphify/rationale
  - graphify/INFERRED
  - community/Community_None
---

# Fetch new messages and send notifications if needed.

## Connections
- [[._check_and_notify()]] - `rationale_for` [EXTRACTED]
- [[BaseChannel]] - `uses` [INFERRED]
- [[EmailConfig]] - `uses` [INFERRED]
- [[MessageBus]] - `uses` [INFERRED]
- [[OutboundMessage]] - `uses` [INFERRED]

#graphify/rationale #graphify/INFERRED #community/Community_None