---
source_file: "caiocore\channels\slack.py"
type: "rationale"
community: "Community 0"
location: "L22"
tags:
  - graphify/rationale
  - graphify/INFERRED
  - community/Community_0
---

# Slack channel using Socket Mode.

## Connections
- [[BaseChannel]] - `uses` [INFERRED]
- [[MessageBus]] - `uses` [INFERRED]
- [[OutboundMessage]] - `uses` [INFERRED]
- [[SlackChannel]] - `rationale_for` [EXTRACTED]
- [[SlackConfig]] - `uses` [INFERRED]

#graphify/rationale #graphify/INFERRED #community/Community_0