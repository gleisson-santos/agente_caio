---
source_file: "caiocore\channels\evolution.py"
type: "rationale"
community: "Community 0"
location: "L80"
tags:
  - graphify/rationale
  - graphify/INFERRED
  - community/Community_0
---

# Process incoming webhook from Evolution API.         Called by the FastAPI route

## Connections
- [[.handle_webhook()]] - `rationale_for` [EXTRACTED]
- [[BaseChannel]] - `uses` [INFERRED]
- [[EvolutionConfig]] - `uses` [INFERRED]
- [[MessageBus]] - `uses` [INFERRED]
- [[OutboundMessage]] - `uses` [INFERRED]

#graphify/rationale #graphify/INFERRED #community/Community_0