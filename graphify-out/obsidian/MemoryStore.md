---
source_file: "caiocore\agent\memory.py"
type: "code"
community: "Community 1"
location: "L45"
tags:
  - graphify/code
  - graphify/INFERRED
  - community/Community_1
---

# MemoryStore

## Connections
- [[.__init__()]] - `calls` [INFERRED]
- [[.__init__()_2]] - `method` [EXTRACTED]
- [[._consolidate_memory()]] - `calls` [INFERRED]
- [[.append_history()]] - `method` [EXTRACTED]
- [[.consolidate()]] - `method` [EXTRACTED]
- [[.get_memory_context()]] - `method` [EXTRACTED]
- [[.read_long_term()]] - `method` [EXTRACTED]
- [[.write_long_term()]] - `method` [EXTRACTED]
- [[Add a tool result to the message list.                  Args             mes]] - `uses` [INFERRED]
- [[Add an assistant message to the message list.                  Args]] - `uses` [INFERRED]
- [[Agent loop the core processing engine.]] - `uses` [INFERRED]
- [[AgentLoop]] - `uses` [INFERRED]
- [[Build the complete message list for an LLM call.          Args             h]] - `uses` [INFERRED]
- [[Build the system prompt from bootstrap files, memory, and skills.]] - `uses` [INFERRED]
- [[Build user message content with optional base64-encoded images.]] - `uses` [INFERRED]
- [[Builds the context (system prompt + messages) for the agent.          Assemble]] - `uses` [INFERRED]
- [[Close MCP connections.]] - `uses` [INFERRED]
- [[Connect to configured MCP servers (one-time, lazy).]] - `uses` [INFERRED]
- [[Context builder for assembling agent prompts.]] - `uses` [INFERRED]
- [[ContextBuilder]] - `uses` [INFERRED]
- [[Delegate to MemoryStore.consolidate().]] - `uses` [INFERRED]
- [[Format tool calls as concise hint, e.g. 'web_search(query)'.]] - `uses` [INFERRED]
- [[Get the core identity section.]] - `uses` [INFERRED]
- [[LLMProvider]] - `uses` [INFERRED]
- [[Load all bootstrap files from workspace.]] - `uses` [INFERRED]
- [[Process a message directly (for CLI or cron usage).]] - `uses` [INFERRED]
- [[Process a single inbound message and return the response.]] - `uses` [INFERRED]
- [[Public entry point to handle a message from any channel (Web, API, etc.).]] - `uses` [INFERRED]
- [[Register the default set of tools.]] - `uses` [INFERRED]
- [[Remove think…think blocks that some models embed in content.]] - `uses` [INFERRED]
- [[Run the agent iteration loop. Returns (final_content, tools_used).]] - `uses` [INFERRED]
- [[Run the agent loop, processing messages from the bus.]] - `uses` [INFERRED]
- [[Session]] - `uses` [INFERRED]
- [[Tenta o modelo principal, depois os fallbacks em ordem.]] - `uses` [INFERRED]
- [[The agent loop is the core processing engine.      It     1. Receives messag]] - `uses` [INFERRED]
- [[Try to extract tool calls from JSON blocks in text content.]] - `uses` [INFERRED]
- [[Two-layer memory MEMORY.md (long-term facts) + HISTORY.md (grep-searchable log)]] - `rationale_for` [EXTRACTED]
- [[Update context for all tools that need routing info.]] - `uses` [INFERRED]
- [[memory.py]] - `contains` [EXTRACTED]

#graphify/code #graphify/INFERRED #community/Community_1