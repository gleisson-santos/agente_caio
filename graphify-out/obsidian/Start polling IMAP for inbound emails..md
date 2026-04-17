---
source_file: "caiocore\channels\email.py"
type: "rationale"
community: "Community None"
location: "L106"
tags:
  - graphify/rationale
  - graphify/INFERRED
  - community/Community_None
---

# Start polling IMAP for inbound emails.

## Connections
- [[.start()_4]] - `rationale_for` [EXTRACTED]
- [[BaseChannel]] - `uses` [INFERRED]
- [[EmailConfig]] - `uses` [INFERRED]
- [[MessageBus]] - `uses` [INFERRED]
- [[OutboundMessage]] - `uses` [INFERRED]

#graphify/rationale #graphify/INFERRED #community/Community_None