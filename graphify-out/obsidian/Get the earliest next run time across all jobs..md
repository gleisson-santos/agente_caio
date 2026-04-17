---
source_file: "caiocore\cron\service.py"
type: "rationale"
community: "Community None"
location: "L193"
tags:
  - graphify/rationale
  - graphify/INFERRED
  - community/Community_None
---

# Get the earliest next run time across all jobs.

## Connections
- [[._get_next_wake_ms()]] - `rationale_for` [EXTRACTED]
- [[CronJob]] - `uses` [INFERRED]
- [[CronJobState]] - `uses` [INFERRED]
- [[CronPayload]] - `uses` [INFERRED]
- [[CronSchedule]] - `uses` [INFERRED]
- [[CronStore]] - `uses` [INFERRED]

#graphify/rationale #graphify/INFERRED #community/Community_None