---
source_file: "caiocore\channels\email.py"
type: "rationale"
community: "Community 0"
location: "L1"
tags:
  - graphify/rationale
  - graphify/INFERRED
  - community/Community_0
---

# Email channel implementation using IMAP polling + SMTP replies.

## Connections
- [[BaseChannel]] - `uses` [INFERRED]
- [[EmailConfig]] - `uses` [INFERRED]
- [[MessageBus]] - `uses` [INFERRED]
- [[OutboundMessage]] - `uses` [INFERRED]
- [[email.py]] - `rationale_for` [EXTRACTED]

#graphify/rationale #graphify/INFERRED #community/Community_0