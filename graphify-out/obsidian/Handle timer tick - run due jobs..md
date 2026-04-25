---
source_file: "caiocore\cron\service.py"
type: "rationale"
community: "Community 2"
location: "L220"
tags:
  - graphify/rationale
  - graphify/INFERRED
  - community/Community_2
---

# Handle timer tick - run due jobs.

## Connections
- [[._on_timer()]] - `rationale_for` [EXTRACTED]
- [[CronJob]] - `uses` [INFERRED]
- [[CronJobState]] - `uses` [INFERRED]
- [[CronPayload]] - `uses` [INFERRED]
- [[CronSchedule]] - `uses` [INFERRED]
- [[CronStore]] - `uses` [INFERRED]

#graphify/rationale #graphify/INFERRED #community/Community_2