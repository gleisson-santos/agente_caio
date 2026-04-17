---
source_file: "caiocore\channels\slack.py"
type: "rationale"
community: "Community None"
location: "L22"
tags:
  - graphify/rationale
  - graphify/INFERRED
  - community/Community_None
---

# Slack channel using Socket Mode.

## Connections
- [[BaseChannel]] - `uses` [INFERRED]
- [[MessageBus]] - `uses` [INFERRED]
- [[OutboundMessage]] - `uses` [INFERRED]
- [[SlackChannel]] - `rationale_for` [EXTRACTED]
- [[SlackConfig]] - `uses` [INFERRED]

#graphify/rationale #graphify/INFERRED #community/Community_None