---
type: community
members: 9
---

# Community 20

**Members:** 9 nodes

## Members
- [[Chat handler for the Dashboard — bridges FastAPI to the AgentLoop.]] - rationale - caiocore\server\chat_handler.py
- [[ChatRequest]] - code - caiocore\server\chat_handler.py
- [[ChatResponse]] - code - caiocore\server\chat_handler.py
- [[Process a chat message using the real Caio AgentLoop.]] - rationale - caiocore\server\chat_handler.py
- [[Retrieve chat history for a dashboard session.]] - rationale - caiocore\server\chat_handler.py
- [[chat_handler.py]] - code - caiocore\server\chat_handler.py
- [[chat_message()]] - code - caiocore\server\chat_handler.py
- [[get_agent()]] - code - caiocore\server\chat_handler.py
- [[get_chat_history()]] - code - caiocore\server\chat_handler.py

## Live Query (requires Dataview plugin)

```dataview
TABLE source_file, type FROM #community/Community_20
SORT file.name ASC
```

## Connections to other communities
- 3 edges to [[_COMMUNITY_Community 3]]
- 1 edge to [[_COMMUNITY_Community 1]]
- 1 edge to [[_COMMUNITY_Community 4]]

## Top bridge nodes
- [[get_chat_history()]] - degree 4, connects to 2 communities
- [[chat_message()]] - degree 4, connects to 1 community
- [[ChatResponse]] - degree 3, connects to 1 community
- [[ChatRequest]] - degree 2, connects to 1 community