---
source_file: "caiocore\channels\discord.py"
type: "rationale"
community: "Community 0"
location: "L148"
tags:
  - graphify/rationale
  - graphify/INFERRED
  - community/Community_0
---

# Main gateway loop: identify, heartbeat, dispatch events.

## Connections
- [[._gateway_loop()]] - `rationale_for` [EXTRACTED]
- [[BaseChannel]] - `uses` [INFERRED]
- [[DiscordConfig]] - `uses` [INFERRED]
- [[MessageBus]] - `uses` [INFERRED]
- [[OutboundMessage]] - `uses` [INFERRED]

#graphify/rationale #graphify/INFERRED #community/Community_0