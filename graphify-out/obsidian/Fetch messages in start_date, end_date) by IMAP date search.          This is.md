---
source_file: "caiocore\channels\email.py"
type: "rationale"
community: "Community None"
location: "L371"
tags:
  - graphify/rationale
  - graphify/INFERRED
  - community/Community_None
---

# Fetch messages in [start_date, end_date) by IMAP date search.          This is

## Connections
- [[.fetch_messages_between_dates()]] - `rationale_for` [EXTRACTED]
- [[BaseChannel]] - `uses` [INFERRED]
- [[EmailConfig]] - `uses` [INFERRED]
- [[MessageBus]] - `uses` [INFERRED]
- [[OutboundMessage]] - `uses` [INFERRED]

#graphify/rationale #graphify/INFERRED #community/Community_None