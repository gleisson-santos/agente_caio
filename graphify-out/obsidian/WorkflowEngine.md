---
source_file: "caiocore\agent\workflow.py"
type: "code"
community: "Community 1"
location: "L15"
tags:
  - graphify/code
  - graphify/INFERRED
  - community/Community_1
---

# WorkflowEngine

## Connections
- [[.__init__()_1]] - `calls` [INFERRED]
- [[.__init__()_7]] - `method` [EXTRACTED]
- [[._handle_llm()]] - `method` [EXTRACTED]
- [[._handle_notify()]] - `method` [EXTRACTED]
- [[._handle_tool()]] - `method` [EXTRACTED]
- [[._render_template_obj()]] - `method` [EXTRACTED]
- [[._render_template_str()]] - `method` [EXTRACTED]
- [[.execute()]] - `method` [EXTRACTED]
- [[Agent loop the core processing engine.]] - `uses` [INFERRED]
- [[AgentLoop]] - `uses` [INFERRED]
- [[Close MCP connections.]] - `uses` [INFERRED]
- [[Connect to configured MCP servers (one-time, lazy).]] - `uses` [INFERRED]
- [[Delegate to MemoryStore.consolidate().]] - `uses` [INFERRED]
- [[Format tool calls as concise hint, e.g. 'web_search(query)'.]] - `uses` [INFERRED]
- [[InboundMessage]] - `uses` [INFERRED]
- [[MessageBus]] - `uses` [INFERRED]
- [[OutboundMessage]] - `uses` [INFERRED]
- [[Process a message directly (for CLI or cron usage).]] - `uses` [INFERRED]
- [[Process a single inbound message and return the response.]] - `uses` [INFERRED]
- [[Public entry point to handle a message from any channel (Web, API, etc.).]] - `uses` [INFERRED]
- [[Register the default set of tools.]] - `uses` [INFERRED]
- [[Remove think…think blocks that some models embed in content.]] - `uses` [INFERRED]
- [[Run the agent iteration loop. Returns (final_content, tools_used).]] - `uses` [INFERRED]
- [[Run the agent loop, processing messages from the bus.]] - `uses` [INFERRED]
- [[Structured Workflow Engine for AgentOS.          Allows defining a sequence of]] - `rationale_for` [EXTRACTED]
- [[Tenta o modelo principal, depois os fallbacks em ordem.]] - `uses` [INFERRED]
- [[The agent loop is the core processing engine.      It     1. Receives messag]] - `uses` [INFERRED]
- [[Try to extract tool calls from JSON blocks in text content.]] - `uses` [INFERRED]
- [[Update context for all tools that need routing info.]] - `uses` [INFERRED]
- [[workflow.py]] - `contains` [EXTRACTED]

#graphify/code #graphify/INFERRED #community/Community_1