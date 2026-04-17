---
source_file: "caiocore\channels\telegram.py"
type: "rationale"
community: "Community None"
location: "L475"
tags:
  - graphify/rationale
  - graphify/INFERRED
  - community/Community_None
---

# Repeatedly send 'typing' action until cancelled.

## Connections
- [[._typing_loop()]] - `rationale_for` [EXTRACTED]
- [[BaseChannel]] - `uses` [INFERRED]
- [[GroqTranscriptionProvider]] - `uses` [INFERRED]
- [[MessageBus]] - `uses` [INFERRED]
- [[OutboundMessage]] - `uses` [INFERRED]
- [[TelegramConfig]] - `uses` [INFERRED]

#graphify/rationale #graphify/INFERRED #community/Community_None