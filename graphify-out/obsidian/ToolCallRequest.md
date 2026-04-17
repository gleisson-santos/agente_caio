---
source_file: "caiocore\providers\base.py"
type: "code"
community: "Community None"
location: "L9"
tags:
  - graphify/code
  - graphify/INFERRED
  - community/Community_None
---

# ToolCallRequest

## Connections
- [[._parse()]] - `calls` [INFERRED]
- [[._parse_response()]] - `calls` [INFERRED]
- [[._try_extract_tool_calls()]] - `calls` [INFERRED]
- [[A tool call request from the LLM.]] - `rationale_for` [EXTRACTED]
- [[Agent loop the core processing engine.]] - `uses` [INFERRED]
- [[AgentLoop]] - `uses` [INFERRED]
- [[Apply model-specific parameter overrides from the registry.]] - `uses` [INFERRED]
- [[Close MCP connections.]] - `uses` [INFERRED]
- [[Connect to configured MCP servers (one-time, lazy).]] - `uses` [INFERRED]
- [[Convert OpenAI function-calling schema to Codex flat format.]] - `uses` [INFERRED]
- [[CustomProvider]] - `uses` [INFERRED]
- [[Delegate to MemoryStore.consolidate().]] - `uses` [INFERRED]
- [[Direct OpenAI-compatible provider — bypasses LiteLLM.]] - `uses` [INFERRED]
- [[Format tool calls as concise hint, e.g. 'web_search(query)'.]] - `uses` [INFERRED]
- [[Get the default model.]] - `uses` [INFERRED]
- [[LLM provider using LiteLLM for multi-provider support.          Supports OpenR]] - `uses` [INFERRED]
- [[LiteLLM provider implementation for multi-provider support.]] - `uses` [INFERRED]
- [[LiteLLMProvider]] - `uses` [INFERRED]
- [[Normalize explicit provider prefixes like `github-copilot...`.]] - `uses` [INFERRED]
- [[OpenAI Codex Responses Provider.]] - `uses` [INFERRED]
- [[OpenAICodexProvider]] - `uses` [INFERRED]
- [[Parse LiteLLM response into our standard format.]] - `uses` [INFERRED]
- [[Process a message directly (for CLI or cron usage).]] - `uses` [INFERRED]
- [[Process a single inbound message and return the response.]] - `uses` [INFERRED]
- [[Public entry point to handle a message from any channel (Web, API, etc.).]] - `uses` [INFERRED]
- [[Register the default set of tools.]] - `uses` [INFERRED]
- [[Remove think…think blocks that some models embed in content.]] - `uses` [INFERRED]
- [[Resolve model name by applying providergateway prefixes.]] - `uses` [INFERRED]
- [[Return True when the provider supports cache_control on content blocks.]] - `uses` [INFERRED]
- [[Return copies of messages and tools with cache_control injected.]] - `uses` [INFERRED]
- [[Run the agent iteration loop. Returns (final_content, tools_used).]] - `uses` [INFERRED]
- [[Run the agent loop, processing messages from the bus.]] - `uses` [INFERRED]
- [[Send a chat completion request via LiteLLM.                  Args]] - `uses` [INFERRED]
- [[Set environment variables based on detected provider.]] - `uses` [INFERRED]
- [[Strip non-standard keys and ensure assistant messages have a content key.]] - `uses` [INFERRED]
- [[Tenta o modelo principal, depois os fallbacks em ordem.]] - `uses` [INFERRED]
- [[The agent loop is the core processing engine.      It     1. Receives messag]] - `uses` [INFERRED]
- [[Try to extract tool calls from JSON blocks in text content.]] - `uses` [INFERRED]
- [[Update context for all tools that need routing info.]] - `uses` [INFERRED]
- [[Use Codex OAuth to call the Responses API.]] - `uses` [INFERRED]
- [[_consume_sse()]] - `calls` [INFERRED]
- [[base.py_2]] - `contains` [EXTRACTED]

#graphify/code #graphify/INFERRED #community/Community_None