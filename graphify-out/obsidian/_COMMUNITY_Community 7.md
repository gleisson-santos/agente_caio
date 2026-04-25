---
type: community
members: 40
---

# Community 7

**Members:** 40 nodes

## Members
- [[.__init__()_32]] - code - caiocore\agents\events.py
- [[._build_notify_handler()]] - code - caiocore\channels\mochat.py
- [[._init_db()]] - code - caiocore\agents\events.py
- [[._start_socket_client()]] - code - caiocore\channels\mochat.py
- [[._validate()]] - code - caiocore\agent\tools\base.py
- [[.broadcast()]] - code - bridge\src\server.ts
- [[.cleanup()]] - code - caiocore\agents\events.py
- [[.connect()]] - code - bridge\src\whatsapp.ts
- [[.constructor()]] - code - bridge\src\server.ts
- [[.constructor()_1]] - code - bridge\src\whatsapp.ts
- [[.count_by_type()]] - code - caiocore\agents\events.py
- [[.execute()_25]] - code - tests\test_tool_validation.py
- [[.extractMessageContent()]] - code - bridge\src\whatsapp.ts
- [[.handleCommand()]] - code - bridge\src\server.ts
- [[.sendMessage()]] - code - bridge\src\whatsapp.ts
- [[.setupClient()]] - code - bridge\src\server.ts
- [[.start()]] - code - bridge\src\server.ts
- [[.upsert()]] - code - caiocore\agents\events.py
- [[.validate_params()]] - code - caiocore\agent\tools\base.py
- [[BridgeServer]] - code - bridge\src\server.ts
- [[Count events grouped by type.]] - rationale - caiocore\agents\events.py
- [[Create the events table if it doesn't exist.]] - rationale - caiocore\agents\events.py
- [[Delete events older than keep_days. Returns count deleted.]] - rationale - caiocore\agents\events.py
- [[SampleTool]] - code - tests\test_tool_validation.py
- [[Update the latest event for agent+event_type, or insert if none exists.]] - rationale - caiocore\agents\events.py
- [[Validate tool parameters against JSON schema. Returns error list (empty if valid]] - rationale - caiocore\agent\tools\base.py
- [[WhatsAppClient]] - code - bridge\src\whatsapp.ts
- [[description()_13]] - code - tests\test_tool_validation.py
- [[index.ts]] - code - bridge\src\index.ts
- [[name()_13]] - code - tests\test_tool_validation.py
- [[parameters()_13]] - code - tests\test_tool_validation.py
- [[server.ts]] - code - bridge\src\server.ts
- [[test_registry_returns_validation_error()]] - code - tests\test_tool_validation.py
- [[test_tool_validation.py]] - code - tests\test_tool_validation.py
- [[test_validate_params_enum_and_min_length()]] - code - tests\test_tool_validation.py
- [[test_validate_params_ignores_unknown_fields()]] - code - tests\test_tool_validation.py
- [[test_validate_params_missing_required()]] - code - tests\test_tool_validation.py
- [[test_validate_params_nested_object_and_array()]] - code - tests\test_tool_validation.py
- [[test_validate_params_type_and_range()]] - code - tests\test_tool_validation.py
- [[whatsapp.ts]] - code - bridge\src\whatsapp.ts

## Live Query (requires Dataview plugin)

```dataview
TABLE source_file, type FROM #community/Community_7
SORT file.name ASC
```

## Connections to other communities
- 13 edges to [[_COMMUNITY_Community 3]]
- 10 edges to [[_COMMUNITY_Community 1]]
- 6 edges to [[_COMMUNITY_Community 0]]
- 3 edges to [[_COMMUNITY_Community 4]]

## Top bridge nodes
- [[._start_socket_client()]] - degree 5, connects to 3 communities
- [[.connect()]] - degree 12, connects to 2 communities
- [[.validate_params()]] - degree 10, connects to 2 communities
- [[.execute()_25]] - degree 10, connects to 2 communities
- [[._validate()]] - degree 3, connects to 2 communities