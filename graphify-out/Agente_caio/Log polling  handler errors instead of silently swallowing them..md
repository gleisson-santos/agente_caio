---
source_file: "caiocore\channels\telegram.py"
type: "rationale"
community: "Community 0"
location: "L486"
tags:
  - graphify/rationale
  - graphify/INFERRED
  - community/Community_0
---

# Log polling / handler errors instead of silently swallowing them.

## Connections
- [[._on_error()]] - `rationale_for` [EXTRACTED]
- [[BaseChannel]] - `uses` [INFERRED]
- [[GroqTranscriptionProvider]] - `uses` [INFERRED]
- [[MessageBus]] - `uses` [INFERRED]
- [[OutboundMessage]] - `uses` [INFERRED]
- [[TelegramConfig]] - `uses` [INFERRED]

#graphify/rationale #graphify/INFERRED #community/Community_0