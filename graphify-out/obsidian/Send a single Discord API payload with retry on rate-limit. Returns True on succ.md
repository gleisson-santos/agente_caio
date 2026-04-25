---
source_file: "caiocore\channels\discord.py"
type: "rationale"
community: "Community 0"
location: "L128"
tags:
  - graphify/rationale
  - graphify/INFERRED
  - community/Community_0
---

# Send a single Discord API payload with retry on rate-limit. Returns True on succ

## Connections
- [[._send_payload()]] - `rationale_for` [EXTRACTED]
- [[BaseChannel]] - `uses` [INFERRED]
- [[DiscordConfig]] - `uses` [INFERRED]
- [[MessageBus]] - `uses` [INFERRED]
- [[OutboundMessage]] - `uses` [INFERRED]

#graphify/rationale #graphify/INFERRED #community/Community_0