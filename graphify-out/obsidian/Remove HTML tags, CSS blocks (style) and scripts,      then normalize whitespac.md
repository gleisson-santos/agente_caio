---
source_file: "caiocore\channels\email.py"
type: "rationale"
community: "Community None"
location: "L26"
tags:
  - graphify/rationale
  - graphify/INFERRED
  - community/Community_None
---

# Remove HTML tags, CSS blocks (style) and scripts,      then normalize whitespac

## Connections
- [[BaseChannel]] - `uses` [INFERRED]
- [[EmailConfig]] - `uses` [INFERRED]
- [[MessageBus]] - `uses` [INFERRED]
- [[OutboundMessage]] - `uses` [INFERRED]
- [[clean_email_body()]] - `rationale_for` [EXTRACTED]

#graphify/rationale #graphify/INFERRED #community/Community_None