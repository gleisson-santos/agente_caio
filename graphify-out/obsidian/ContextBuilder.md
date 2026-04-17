---
source_file: "caiocore\agent\context.py"
type: "code"
community: "Community None"
location: "L15"
tags:
  - graphify/code
  - graphify/INFERRED
  - community/Community_None
---

# ContextBuilder

## Connections
- [[.__init__()]] - `method` [EXTRACTED]
- [[.__init__()_1]] - `calls` [INFERRED]
- [[._build_user_content()]] - `method` [EXTRACTED]
- [[._get_identity()]] - `method` [EXTRACTED]
- [[._load_bootstrap_files()]] - `method` [EXTRACTED]
- [[.add_assistant_message()]] - `method` [EXTRACTED]
- [[.add_tool_result()]] - `method` [EXTRACTED]
- [[.build_messages()]] - `method` [EXTRACTED]
- [[.build_system_prompt()]] - `method` [EXTRACTED]
- [[Agent loop the core processing engine.]] - `uses` [INFERRED]
- [[AgentLoop]] - `uses` [INFERRED]
- [[Builds the context (system prompt + messages) for the agent.          Assemble]] - `rationale_for` [EXTRACTED]
- [[Close MCP connections.]] - `uses` [INFERRED]
- [[Connect to configured MCP servers (one-time, lazy).]] - `uses` [INFERRED]
- [[Delegate to MemoryStore.consolidate().]] - `uses` [INFERRED]
- [[Format tool calls as concise hint, e.g. 'web_search(query)'.]] - `uses` [INFERRED]
- [[MemoryStore]] - `uses` [INFERRED]
- [[Process a message directly (for CLI or cron usage).]] - `uses` [INFERRED]
- [[Process a single inbound message and return the response.]] - `uses` [INFERRED]
- [[Public entry point to handle a message from any channel (Web, API, etc.).]] - `uses` [INFERRED]
- [[Register the default set of tools.]] - `uses` [INFERRED]
- [[Remove think…think blocks that some models embed in content.]] - `uses` [INFERRED]
- [[Run the agent iteration loop. Returns (final_content, tools_used).]] - `uses` [INFERRED]
- [[Run the agent loop, processing messages from the bus.]] - `uses` [INFERRED]
- [[SkillsLoader]] - `uses` [INFERRED]
- [[Tenta o modelo principal, depois os fallbacks em ordem.]] - `uses` [INFERRED]
- [[The agent loop is the core processing engine.      It     1. Receives messag]] - `uses` [INFERRED]
- [[Try to extract tool calls from JSON blocks in text content.]] - `uses` [INFERRED]
- [[Update context for all tools that need routing info.]] - `uses` [INFERRED]
- [[context.py]] - `contains` [EXTRACTED]

#graphify/code #graphify/INFERRED #community/Community_None