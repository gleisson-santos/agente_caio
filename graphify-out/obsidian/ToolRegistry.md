---
source_file: "caiocore\agent\tools\registry.py"
type: "code"
community: "Community 1"
location: "L8"
tags:
  - graphify/code
  - graphify/INFERRED
  - community/Community_1
---

# ToolRegistry

## Connections
- [[.__contains__()]] - `method` [EXTRACTED]
- [[.__init__()_1]] - `calls` [INFERRED]
- [[.__init__()_22]] - `method` [EXTRACTED]
- [[.__len__()]] - `method` [EXTRACTED]
- [[._run_subagent()]] - `calls` [INFERRED]
- [[.execute()_17]] - `method` [EXTRACTED]
- [[.get()]] - `method` [EXTRACTED]
- [[.get_definitions()]] - `method` [EXTRACTED]
- [[.has()]] - `method` [EXTRACTED]
- [[.register()]] - `method` [EXTRACTED]
- [[.unregister()]] - `method` [EXTRACTED]
- [[Agent loop the core processing engine.]] - `uses` [INFERRED]
- [[AgentLoop]] - `uses` [INFERRED]
- [[Announce the subagent result to the main agent via the message bus.]] - `uses` [INFERRED]
- [[Build a focused system prompt for the subagent.]] - `uses` [INFERRED]
- [[Close MCP connections.]] - `uses` [INFERRED]
- [[Connect to configured MCP servers (one-time, lazy).]] - `uses` [INFERRED]
- [[Connect to configured MCP servers and register their tools.]] - `uses` [INFERRED]
- [[Delegate to MemoryStore.consolidate().]] - `uses` [INFERRED]
- [[Execute the subagent task and announce the result.]] - `uses` [INFERRED]
- [[Format tool calls as concise hint, e.g. 'web_search(query)'.]] - `uses` [INFERRED]
- [[MCP client connects to MCP servers and wraps their tools as native caio tools.]] - `uses` [INFERRED]
- [[MCPToolWrapper]] - `uses` [INFERRED]
- [[Manages background subagent execution.          Subagents are lightweight agen]] - `uses` [INFERRED]
- [[Process a message directly (for CLI or cron usage).]] - `uses` [INFERRED]
- [[Process a single inbound message and return the response.]] - `uses` [INFERRED]
- [[Public entry point to handle a message from any channel (Web, API, etc.).]] - `uses` [INFERRED]
- [[Register the default set of tools.]] - `uses` [INFERRED]
- [[Registry for agent tools.          Allows dynamic registration and execution o]] - `rationale_for` [EXTRACTED]
- [[Remove think…think blocks that some models embed in content.]] - `uses` [INFERRED]
- [[Return the number of currently running subagents.]] - `uses` [INFERRED]
- [[Run the agent iteration loop. Returns (final_content, tools_used).]] - `uses` [INFERRED]
- [[Run the agent loop, processing messages from the bus.]] - `uses` [INFERRED]
- [[SampleTool]] - `uses` [INFERRED]
- [[Spawn a subagent to execute a task in the background.                  Args]] - `uses` [INFERRED]
- [[Subagent manager for background task execution.]] - `uses` [INFERRED]
- [[SubagentManager]] - `uses` [INFERRED]
- [[Tenta o modelo principal, depois os fallbacks em ordem.]] - `uses` [INFERRED]
- [[The agent loop is the core processing engine.      It     1. Receives messag]] - `uses` [INFERRED]
- [[Tool_1]] - `uses` [INFERRED]
- [[Try to extract tool calls from JSON blocks in text content.]] - `uses` [INFERRED]
- [[Update context for all tools that need routing info.]] - `uses` [INFERRED]
- [[Wraps a single MCP server tool as a caio Tool.]] - `uses` [INFERRED]
- [[registry.py]] - `contains` [EXTRACTED]
- [[test_registry_returns_validation_error()]] - `calls` [INFERRED]

#graphify/code #graphify/INFERRED #community/Community_1