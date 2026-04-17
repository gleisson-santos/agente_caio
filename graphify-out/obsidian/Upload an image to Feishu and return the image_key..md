---
source_file: "caiocore\channels\feishu.py"
type: "rationale"
community: "Community None"
location: "L435"
tags:
  - graphify/rationale
  - graphify/INFERRED
  - community/Community_None
---

# Upload an image to Feishu and return the image_key.

## Connections
- [[._upload_image_sync()]] - `rationale_for` [EXTRACTED]
- [[BaseChannel]] - `uses` [INFERRED]
- [[FeishuConfig]] - `uses` [INFERRED]
- [[MessageBus]] - `uses` [INFERRED]
- [[OutboundMessage]] - `uses` [INFERRED]

#graphify/rationale #graphify/INFERRED #community/Community_None