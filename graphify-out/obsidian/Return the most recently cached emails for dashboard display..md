---
source_file: "caiocore\channels\email.py"
type: "rationale"
community: "Community None"
location: "L101"
tags:
  - graphify/rationale
  - graphify/INFERRED
  - community/Community_None
---

# Return the most recently cached emails for dashboard display.

## Connections
- [[.get_recent_emails()]] - `rationale_for` [EXTRACTED]
- [[BaseChannel]] - `uses` [INFERRED]
- [[EmailConfig]] - `uses` [INFERRED]
- [[MessageBus]] - `uses` [INFERRED]
- [[OutboundMessage]] - `uses` [INFERRED]

#graphify/rationale #graphify/INFERRED #community/Community_None