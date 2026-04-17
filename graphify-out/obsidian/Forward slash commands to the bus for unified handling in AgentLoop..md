---
source_file: "caiocore\channels\telegram.py"
type: "rationale"
community: "Community None"
location: "L355"
tags:
  - graphify/rationale
  - graphify/INFERRED
  - community/Community_None
---

# Forward slash commands to the bus for unified handling in AgentLoop.

## Connections
- [[._forward_command()]] - `rationale_for` [EXTRACTED]
- [[BaseChannel]] - `uses` [INFERRED]
- [[GroqTranscriptionProvider]] - `uses` [INFERRED]
- [[MessageBus]] - `uses` [INFERRED]
- [[OutboundMessage]] - `uses` [INFERRED]
- [[TelegramConfig]] - `uses` [INFERRED]

#graphify/rationale #graphify/INFERRED #community/Community_None