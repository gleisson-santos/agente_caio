---
source_file: "caiocore\channels\email.py"
type: "rationale"
community: "Community None"
location: "L357"
tags:
  - graphify/rationale
  - graphify/INFERRED
  - community/Community_None
---

# Poll IMAP and return parsed unread messages.

## Connections
- [[._fetch_new_messages()]] - `rationale_for` [EXTRACTED]
- [[BaseChannel]] - `uses` [INFERRED]
- [[EmailConfig]] - `uses` [INFERRED]
- [[MessageBus]] - `uses` [INFERRED]
- [[OutboundMessage]] - `uses` [INFERRED]

#graphify/rationale #graphify/INFERRED #community/Community_None