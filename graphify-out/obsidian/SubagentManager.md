---
source_file: "caiocore\agent\subagent.py"
type: "code"
community: "Community None"
location: "L20"
tags:
  - graphify/code
  - graphify/INFERRED
  - community/Community_None
---

# SubagentManager

## Connections
- [[.__init__()_1]] - `calls` [INFERRED]
- [[.__init__()_5]] - `method` [EXTRACTED]
- [[._announce_result()]] - `method` [EXTRACTED]
- [[._build_subagent_prompt()]] - `method` [EXTRACTED]
- [[._run_subagent()]] - `method` [EXTRACTED]
- [[.get_running_count()]] - `method` [EXTRACTED]
- [[.spawn()]] - `method` [EXTRACTED]
- [[Agent loop the core processing engine.]] - `uses` [INFERRED]
- [[AgentLoop]] - `uses` [INFERRED]
- [[Close MCP connections.]] - `uses` [INFERRED]
- [[Connect to configured MCP servers (one-time, lazy).]] - `uses` [INFERRED]
- [[Delegate to MemoryStore.consolidate().]] - `uses` [INFERRED]
- [[EditFileTool]] - `uses` [INFERRED]
- [[ExecTool]] - `uses` [INFERRED]
- [[ExecToolConfig]] - `uses` [INFERRED]
- [[Format tool calls as concise hint, e.g. 'web_search(query)'.]] - `uses` [INFERRED]
- [[InboundMessage]] - `uses` [INFERRED]
- [[LLMProvider]] - `uses` [INFERRED]
- [[ListDirTool]] - `uses` [INFERRED]
- [[Manages background subagent execution.          Subagents are lightweight agen]] - `rationale_for` [EXTRACTED]
- [[MessageBus]] - `uses` [INFERRED]
- [[Process a message directly (for CLI or cron usage).]] - `uses` [INFERRED]
- [[Process a single inbound message and return the response.]] - `uses` [INFERRED]
- [[Public entry point to handle a message from any channel (Web, API, etc.).]] - `uses` [INFERRED]
- [[ReadFileTool]] - `uses` [INFERRED]
- [[Register the default set of tools.]] - `uses` [INFERRED]
- [[Remove think…think blocks that some models embed in content.]] - `uses` [INFERRED]
- [[Run the agent iteration loop. Returns (final_content, tools_used).]] - `uses` [INFERRED]
- [[Run the agent loop, processing messages from the bus.]] - `uses` [INFERRED]
- [[Set the origin context for subagent announcements.]] - `uses` [INFERRED]
- [[Spawn a subagent to execute the given task.]] - `uses` [INFERRED]
- [[Spawn tool for creating background subagents.]] - `uses` [INFERRED]
- [[SpawnTool]] - `uses` [INFERRED]
- [[Tenta o modelo principal, depois os fallbacks em ordem.]] - `uses` [INFERRED]
- [[The agent loop is the core processing engine.      It     1. Receives messag]] - `uses` [INFERRED]
- [[Tool to spawn a subagent for background task execution.          The subagent]] - `uses` [INFERRED]
- [[ToolRegistry]] - `uses` [INFERRED]
- [[Try to extract tool calls from JSON blocks in text content.]] - `uses` [INFERRED]
- [[Update context for all tools that need routing info.]] - `uses` [INFERRED]
- [[WebFetchTool]] - `uses` [INFERRED]
- [[WebSearchTool]] - `uses` [INFERRED]
- [[WriteFileTool]] - `uses` [INFERRED]
- [[subagent.py]] - `contains` [EXTRACTED]

#graphify/code #graphify/INFERRED #community/Community_None