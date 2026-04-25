---
source_file: "caiocore\agent\tools\filesystem.py"
type: "code"
community: "Community 1"
location: "L109"
tags:
  - graphify/code
  - graphify/INFERRED
  - community/Community_1
---

# EditFileTool

## Connections
- [[.__init__()_16]] - `method` [EXTRACTED]
- [[._run_subagent()]] - `calls` [INFERRED]
- [[.execute()_10]] - `method` [EXTRACTED]
- [[Agent loop the core processing engine.]] - `uses` [INFERRED]
- [[AgentLoop]] - `uses` [INFERRED]
- [[Announce the subagent result to the main agent via the message bus.]] - `uses` [INFERRED]
- [[Build a focused system prompt for the subagent.]] - `uses` [INFERRED]
- [[Close MCP connections.]] - `uses` [INFERRED]
- [[Connect to configured MCP servers (one-time, lazy).]] - `uses` [INFERRED]
- [[Delegate to MemoryStore.consolidate().]] - `uses` [INFERRED]
- [[Execute the subagent task and announce the result.]] - `uses` [INFERRED]
- [[Format tool calls as concise hint, e.g. 'web_search(query)'.]] - `uses` [INFERRED]
- [[Manages background subagent execution.          Subagents are lightweight agen]] - `uses` [INFERRED]
- [[Process a message directly (for CLI or cron usage).]] - `uses` [INFERRED]
- [[Process a single inbound message and return the response.]] - `uses` [INFERRED]
- [[Public entry point to handle a message from any channel (Web, API, etc.).]] - `uses` [INFERRED]
- [[Register the default set of tools.]] - `uses` [INFERRED]
- [[Remove think…think blocks that some models embed in content.]] - `uses` [INFERRED]
- [[Return the number of currently running subagents.]] - `uses` [INFERRED]
- [[Run the agent iteration loop. Returns (final_content, tools_used).]] - `uses` [INFERRED]
- [[Run the agent loop, processing messages from the bus.]] - `uses` [INFERRED]
- [[Spawn a subagent to execute a task in the background.                  Args]] - `uses` [INFERRED]
- [[Subagent manager for background task execution.]] - `uses` [INFERRED]
- [[SubagentManager]] - `uses` [INFERRED]
- [[Tenta o modelo principal, depois os fallbacks em ordem.]] - `uses` [INFERRED]
- [[The agent loop is the core processing engine.      It     1. Receives messag]] - `uses` [INFERRED]
- [[Tool]] - `inherits` [EXTRACTED]
- [[Tool_1]] - `uses` [INFERRED]
- [[Tool to edit a file by replacing text.]] - `rationale_for` [EXTRACTED]
- [[Try to extract tool calls from JSON blocks in text content.]] - `uses` [INFERRED]
- [[Update context for all tools that need routing info.]] - `uses` [INFERRED]
- [[filesystem.py]] - `contains` [EXTRACTED]

#graphify/code #graphify/INFERRED #community/Community_1