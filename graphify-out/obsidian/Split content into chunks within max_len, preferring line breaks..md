---
source_file: "caiocore\channels\discord.py"
type: "rationale"
community: "Community None"
location: "L24"
tags:
  - graphify/rationale
  - graphify/INFERRED
  - community/Community_None
---

# Split content into chunks within max_len, preferring line breaks.

## Connections
- [[BaseChannel]] - `uses` [INFERRED]
- [[DiscordConfig]] - `uses` [INFERRED]
- [[MessageBus]] - `uses` [INFERRED]
- [[OutboundMessage]] - `uses` [INFERRED]
- [[_split_message()]] - `rationale_for` [EXTRACTED]

#graphify/rationale #graphify/INFERRED #community/Community_None