---
source_file: "caiocore\channels\email.py"
type: "rationale"
community: "Community 0"
location: "L59"
tags:
  - graphify/rationale
  - graphify/INFERRED
  - community/Community_0
---

# Email channel.      Inbound:     - Poll IMAP mailbox for unread messages.

## Connections
- [[BaseChannel]] - `uses` [INFERRED]
- [[EmailChannel]] - `rationale_for` [EXTRACTED]
- [[EmailConfig]] - `uses` [INFERRED]
- [[MessageBus]] - `uses` [INFERRED]
- [[OutboundMessage]] - `uses` [INFERRED]

#graphify/rationale #graphify/INFERRED #community/Community_0