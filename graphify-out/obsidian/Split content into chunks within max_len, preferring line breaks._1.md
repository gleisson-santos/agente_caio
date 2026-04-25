---
source_file: "caiocore\channels\telegram.py"
type: "rationale"
community: "Community 0"
location: "L89"
tags:
  - graphify/rationale
  - graphify/INFERRED
  - community/Community_0
---

# Split content into chunks within max_len, preferring line breaks.

## Connections
- [[BaseChannel]] - `uses` [INFERRED]
- [[GroqTranscriptionProvider]] - `uses` [INFERRED]
- [[MessageBus]] - `uses` [INFERRED]
- [[OutboundMessage]] - `uses` [INFERRED]
- [[TelegramConfig]] - `uses` [INFERRED]
- [[_split_message()_1]] - `rationale_for` [EXTRACTED]

#graphify/rationale #graphify/INFERRED #community/Community_0