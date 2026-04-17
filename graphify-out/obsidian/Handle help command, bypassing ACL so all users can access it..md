---
source_file: "caiocore\channels\telegram.py"
type: "rationale"
community: "Community None"
location: "L334"
tags:
  - graphify/rationale
  - graphify/INFERRED
  - community/Community_None
---

# Handle /help command, bypassing ACL so all users can access it.

## Connections
- [[._on_help()]] - `rationale_for` [EXTRACTED]
- [[BaseChannel]] - `uses` [INFERRED]
- [[GroqTranscriptionProvider]] - `uses` [INFERRED]
- [[MessageBus]] - `uses` [INFERRED]
- [[OutboundMessage]] - `uses` [INFERRED]
- [[TelegramConfig]] - `uses` [INFERRED]

#graphify/rationale #graphify/INFERRED #community/Community_None