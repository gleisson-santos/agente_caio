---
source_file: "caiocore\channels\telegram.py"
type: "rationale"
community: "Community None"
location: "L109"
tags:
  - graphify/rationale
  - graphify/INFERRED
  - community/Community_None
---

# Telegram channel using long polling.          Simple and reliable - no webhook

## Connections
- [[BaseChannel]] - `uses` [INFERRED]
- [[GroqTranscriptionProvider]] - `uses` [INFERRED]
- [[MessageBus]] - `uses` [INFERRED]
- [[OutboundMessage]] - `uses` [INFERRED]
- [[TelegramChannel]] - `rationale_for` [EXTRACTED]
- [[TelegramConfig]] - `uses` [INFERRED]

#graphify/rationale #graphify/INFERRED #community/Community_None