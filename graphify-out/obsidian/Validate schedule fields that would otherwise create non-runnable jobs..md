---
source_file: "caiocore\cron\service.py"
type: "rationale"
community: "Community None"
location: "L49"
tags:
  - graphify/rationale
  - graphify/INFERRED
  - community/Community_None
---

# Validate schedule fields that would otherwise create non-runnable jobs.

## Connections
- [[CronJob]] - `uses` [INFERRED]
- [[CronJobState]] - `uses` [INFERRED]
- [[CronPayload]] - `uses` [INFERRED]
- [[CronSchedule]] - `uses` [INFERRED]
- [[CronStore]] - `uses` [INFERRED]
- [[_validate_schedule_for_add()]] - `rationale_for` [EXTRACTED]

#graphify/rationale #graphify/INFERRED #community/Community_None