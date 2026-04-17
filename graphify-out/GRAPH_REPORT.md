# Graph Report - .  (2026-04-16)

## Corpus Check
- 156 files · ~300,331 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1849 nodes · 5537 edges · 77 communities detected
- Extraction: 42% EXTRACTED · 58% INFERRED · 0% AMBIGUOUS · INFERRED: 3226 edges (avg confidence: 0.56)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Community 10|Community 10]]
- [[_COMMUNITY_Community 11|Community 11]]
- [[_COMMUNITY_Community 12|Community 12]]
- [[_COMMUNITY_Community 13|Community 13]]
- [[_COMMUNITY_Community 14|Community 14]]
- [[_COMMUNITY_Community 15|Community 15]]
- [[_COMMUNITY_Community 16|Community 16]]
- [[_COMMUNITY_Community 17|Community 17]]
- [[_COMMUNITY_Community 18|Community 18]]
- [[_COMMUNITY_Community 19|Community 19]]
- [[_COMMUNITY_Community 20|Community 20]]
- [[_COMMUNITY_Community 21|Community 21]]
- [[_COMMUNITY_Community 22|Community 22]]
- [[_COMMUNITY_Community 23|Community 23]]
- [[_COMMUNITY_Community 24|Community 24]]
- [[_COMMUNITY_Community 25|Community 25]]
- [[_COMMUNITY_Community 26|Community 26]]
- [[_COMMUNITY_Community 27|Community 27]]
- [[_COMMUNITY_Community 28|Community 28]]
- [[_COMMUNITY_Community 29|Community 29]]
- [[_COMMUNITY_Community 30|Community 30]]
- [[_COMMUNITY_Community 31|Community 31]]
- [[_COMMUNITY_Community 32|Community 32]]
- [[_COMMUNITY_Community 33|Community 33]]
- [[_COMMUNITY_Community 34|Community 34]]
- [[_COMMUNITY_Community 35|Community 35]]
- [[_COMMUNITY_Community 36|Community 36]]
- [[_COMMUNITY_Community 37|Community 37]]
- [[_COMMUNITY_Community 38|Community 38]]
- [[_COMMUNITY_Community 39|Community 39]]
- [[_COMMUNITY_Community 40|Community 40]]
- [[_COMMUNITY_Community 41|Community 41]]
- [[_COMMUNITY_Community 42|Community 42]]
- [[_COMMUNITY_Community 43|Community 43]]
- [[_COMMUNITY_Community 44|Community 44]]
- [[_COMMUNITY_Community 45|Community 45]]
- [[_COMMUNITY_Community 46|Community 46]]
- [[_COMMUNITY_Community 47|Community 47]]
- [[_COMMUNITY_Community 48|Community 48]]
- [[_COMMUNITY_Community 49|Community 49]]
- [[_COMMUNITY_Community 50|Community 50]]
- [[_COMMUNITY_Community 51|Community 51]]
- [[_COMMUNITY_Community 52|Community 52]]
- [[_COMMUNITY_Community 53|Community 53]]
- [[_COMMUNITY_Community 54|Community 54]]
- [[_COMMUNITY_Community 55|Community 55]]
- [[_COMMUNITY_Community 56|Community 56]]
- [[_COMMUNITY_Community 57|Community 57]]
- [[_COMMUNITY_Community 58|Community 58]]
- [[_COMMUNITY_Community 59|Community 59]]
- [[_COMMUNITY_Community 60|Community 60]]
- [[_COMMUNITY_Community 61|Community 61]]
- [[_COMMUNITY_Community 62|Community 62]]
- [[_COMMUNITY_Community 63|Community 63]]
- [[_COMMUNITY_Community 64|Community 64]]
- [[_COMMUNITY_Community 65|Community 65]]
- [[_COMMUNITY_Community 66|Community 66]]
- [[_COMMUNITY_Community 67|Community 67]]
- [[_COMMUNITY_Community 68|Community 68]]
- [[_COMMUNITY_Community 69|Community 69]]
- [[_COMMUNITY_Community 70|Community 70]]
- [[_COMMUNITY_Community 71|Community 71]]
- [[_COMMUNITY_Community 72|Community 72]]
- [[_COMMUNITY_Community 73|Community 73]]
- [[_COMMUNITY_Community 74|Community 74]]
- [[_COMMUNITY_Community 75|Community 75]]
- [[_COMMUNITY_Community 76|Community 76]]

## God Nodes (most connected - your core abstractions)
1. `MessageBus` - 222 edges
2. `OutboundMessage` - 221 edges
3. `BaseChannel` - 155 edges
4. `SessionManager` - 108 edges
5. `Tool` - 104 edges
6. `Session` - 92 edges
7. `InboundMessage` - 80 edges
8. `AgentLoop` - 77 edges
9. `GoogleCalendarTool` - 75 edges
10. `CronService` - 73 edges

## Surprising Connections (you probably didn't know these)
- `A2A Protocol — Agent-to-Agent communication tool.  Enables Caio to send messages` --uses--> `Tool`  [INFERRED]
  caiocore\agent\tools\a2a.py → caiocore\agent\tools\base.py
- `Browser Control Tool — web automation using Selenium.` --uses--> `Tool`  [INFERRED]
  caiocore\agent\tools\browser.py → caiocore\agent\tools\base.py
- `Synchronous IMAP delete (runs in executor).` --uses--> `Tool`  [INFERRED]
  caiocore\agent\tools\email_delete.py → caiocore\agent\tools\base.py
- `Email reading tool: search and read emails from IMAP inbox.` --uses--> `Tool`  [INFERRED]
  caiocore\agent\tools\email_read.py → caiocore\agent\tools\base.py
- `Decode encoded email header (e.g. =?UTF-8?b?...?=).` --uses--> `Tool`  [INFERRED]
  caiocore\agent\tools\email_read.py → caiocore\agent\tools\base.py

## Communities

### Community 0 - "Community 0"
Cohesion: 0.02
Nodes (251): BaseChannel, Check if the channel is running., Abstract base class for chat channel implementations.          Each channel (T, Initialize the channel.                  Args:             config: Channel-sp, Start the channel and begin listening for messages.                  This shou, Stop the channel and clean up resources., Send a message through this channel.                  Args:             msg:, Check if a sender is allowed to use this bot.                  Args: (+243 more)

### Community 1 - "Community 1"
Cohesion: 0.03
Nodes (170): A2ASendTool, Send a message to a remote agent via HTTP., a2a_info(), A2AInboundMessage, A2AResponse, A2A (Agent-to-Agent) server endpoint — receives messages from remote agents., Receive a message from a remote agent via A2A protocol., Return A2A endpoint metadata for agent discovery. (+162 more)

### Community 2 - "Community 2"
Cohesion: 0.02
Nodes (184): ABC, chat_ping(), create_task(), delete_document(), delete_task(), DocGenerateRequest, download_document(), evolution_webhook() (+176 more)

### Community 3 - "Community 3"
Cohesion: 0.02
Nodes (153): BaseSettings, agent(), channels_login(), channels_status(), _create_workspace_templates(), cron_add(), cron_enable(), cron_list() (+145 more)

### Community 4 - "Community 4"
Cohesion: 0.04
Nodes (66): A conversation session.      Stores messages in JSONL format for easy reading, Add a message to the session., Get recent messages in LLM format, preserving tool metadata., Get an existing session or create a new one.                  Args:, Session, assert_messages_content(), create_session_with_messages(), get_old_messages() (+58 more)

### Community 5 - "Community 5"
Cohesion: 0.04
Nodes (50): _login_github_copilot(), detect_project_type(), main(), Detect project type and available linters., Run a single linter and return results., run_linter(), _build_config(), _check_prerequisites() (+42 more)

### Community 6 - "Community 6"
Cohesion: 0.05
Nodes (58): ai_generate_document(), create_docx(), create_pdf(), create_pptx(), create_xlsx(), ensure_out(), generate_from_ai_content(), get_template_content() (+50 more)

### Community 7 - "Community 7"
Cohesion: 0.06
Nodes (16): Validate tool parameters against JSON schema. Returns error list (empty if valid, Count events grouped by type., Delete events older than keep_days. Returns count deleted., Create the events table if it doesn't exist., Store a new event. Returns the event ID., Update the latest event for agent+event_type, or insert if none exists., Clear all messages and reset session to initial state., BridgeServer (+8 more)

### Community 8 - "Community 8"
Cohesion: 0.09
Nodes (18): Load all bootstrap files from workspace., Build the system prompt from bootstrap files, memory, and skills., Get the core identity section., Skills loader for agent capabilities., Build a summary of all skills (name, description, path, availability)., Loader for agent skills.          Skills are markdown files (SKILL.md) that te, Get a description of missing requirements., Get the description of a skill from its frontmatter. (+10 more)

### Community 9 - "Community 9"
Cohesion: 0.09
Nodes (20): ensure_dir(), get_data_path(), get_sessions_path(), get_skills_path(), get_workspace_path(), parse_session_key(), Utility functions for caiocore., Get the caiocore data directory (~/.caiocore or CAIOCORE_HOME). (+12 more)

### Community 10 - "Community 10"
Cohesion: 0.13
Nodes (11): check_hardcoded_strings(), check_locale_completeness(), find_locale_files(), flatten_keys(), main(), Flatten nested dict keys., Check for hardcoded strings in code files., Find translation/locale files. (+3 more)

### Community 11 - "Community 11"
Cohesion: 0.1
Nodes (6): useAgents(), DashboardPage(), Sidebar(), SpecialistChatTray(), useTasks(), TasksPage()

### Community 12 - "Community 12"
Cohesion: 0.18
Nodes (17): construir_pdf(), criar_estilos(), criar_grafico_barras(), criar_grafico_pizza(), criar_lista_bullets(), criar_paragrafo(), criar_pdf(), criar_tabela() (+9 more)

### Community 13 - "Community 13"
Cohesion: 0.13
Nodes (1): Base LLM provider interface.

### Community 14 - "Community 14"
Cohesion: 0.24
Nodes (13): _build_headers(), _consume_sse(), _convert_messages(), _convert_tools(), _convert_user_message(), _friendly_error(), _iter_sse(), _map_finish_reason() (+5 more)

### Community 15 - "Community 15"
Cohesion: 0.22
Nodes (3): EventBroadcaster, Event types for the message bus., Manages SSE clients for real-time event broadcasting.

### Community 16 - "Community 16"
Cohesion: 0.25
Nodes (7): chat_message(), ChatRequest, ChatResponse, get_chat_history(), Chat handler for the Dashboard — bridges FastAPI to the AgentLoop., Retrieve chat history for a dashboard session., Process a chat message using the real Caio AgentLoop.

### Community 17 - "Community 17"
Cohesion: 0.29
Nodes (6): _decode_header(), _extract_body(), Email reading tool: search and read emails from IMAP inbox., Synchronous IMAP fetch (runs in executor)., Decode encoded email header (e.g. =?UTF-8?b?...?=)., Extract plain text body from email message.

### Community 18 - "Community 18"
Cohesion: 0.36
Nodes (7): check_api_code(), check_openapi_spec(), find_api_files(), main(), Find API-related files., Check OpenAPI/Swagger specification., Check API code for common issues.

### Community 19 - "Community 19"
Cohesion: 0.36
Nodes (7): check_page(), find_web_pages(), is_page_file(), main(), Check a single web page for GEO elements., Check if this file is likely a public-facing page., Find public-facing web pages only.

### Community 20 - "Community 20"
Cohesion: 0.36
Nodes (7): check_page(), find_pages(), is_page_file(), main(), Check if this file is likely a public-facing page., Find page files to check., Check a single page for SEO issues.

### Community 21 - "Community 21"
Cohesion: 0.29
Nodes (2): _parse_pages(), PDF Reader Tool — extracts text from PDF files using PyMuPDF.

### Community 22 - "Community 22"
Cohesion: 0.52
Nodes (2): main(), UXAuditor

### Community 23 - "Community 23"
Cohesion: 0.52
Nodes (2): main(), MobileAuditor

### Community 24 - "Community 24"
Cohesion: 0.43
Nodes (5): cachedFetch(), enrichAgent(), _isCacheValid(), normalizeMetrics(), normalizeStatus()

### Community 25 - "Community 25"
Cohesion: 0.33
Nodes (1): Shell execution tool.

### Community 26 - "Community 26"
Cohesion: 0.47
Nodes (5): find_schema_files(), main(), Find database schema files., Validate Prisma schema file., validate_prisma_schema()

### Community 27 - "Community 27"
Cohesion: 0.47
Nodes (5): check_accessibility(), find_html_files(), main(), Find all HTML/JSX/TSX files., Check a single file for accessibility issues.

### Community 28 - "Community 28"
Cohesion: 0.47
Nodes (5): check_python_coverage(), check_typescript_coverage(), main(), Check TypeScript type coverage., Check Python type hints coverage.

### Community 29 - "Community 29"
Cohesion: 0.4
Nodes (2): getAgentSessionId(), SpecialistChatPage()

### Community 30 - "Community 30"
Cohesion: 0.4
Nodes (1): A2A Protocol — Agent-to-Agent communication tool.  Enables Caio to send messages

### Community 31 - "Community 31"
Cohesion: 0.4
Nodes (1): Browser Control Tool — web automation using Selenium.

### Community 32 - "Community 32"
Cohesion: 0.4
Nodes (1): Message tool for sending messages to users.

### Community 33 - "Community 33"
Cohesion: 0.4
Nodes (1): Voice/TTS Tool — text-to-speech using OpenAI TTS API.

### Community 34 - "Community 34"
Cohesion: 0.4
Nodes (4): Run basic accessibility check., Run basic browser test on URL., run_accessibility_check(), run_basic_test()

### Community 35 - "Community 35"
Cohesion: 0.5
Nodes (0): 

### Community 36 - "Community 36"
Cohesion: 0.5
Nodes (0): 

### Community 37 - "Community 37"
Cohesion: 0.5
Nodes (1): Async message queue for decoupled channel-agent communication.

### Community 38 - "Community 38"
Cohesion: 0.67
Nodes (2): get_docx_text(), Simple docx to text extractor using zipfile/xml.

### Community 39 - "Community 39"
Cohesion: 0.67
Nodes (0): 

### Community 40 - "Community 40"
Cohesion: 1.0
Nodes (2): CaioPage(), getDailySessionId()

### Community 41 - "Community 41"
Cohesion: 0.67
Nodes (0): 

### Community 42 - "Community 42"
Cohesion: 1.0
Nodes (2): migrate(), replace_in_file()

### Community 43 - "Community 43"
Cohesion: 1.0
Nodes (1): Entry point for running nanobot as a module: python -m nanobot

### Community 44 - "Community 44"
Cohesion: 1.0
Nodes (0): 

### Community 45 - "Community 45"
Cohesion: 1.0
Nodes (0): 

### Community 46 - "Community 46"
Cohesion: 1.0
Nodes (0): 

### Community 47 - "Community 47"
Cohesion: 1.0
Nodes (0): 

### Community 48 - "Community 48"
Cohesion: 1.0
Nodes (0): 

### Community 49 - "Community 49"
Cohesion: 1.0
Nodes (0): 

### Community 50 - "Community 50"
Cohesion: 1.0
Nodes (0): 

### Community 51 - "Community 51"
Cohesion: 1.0
Nodes (0): 

### Community 52 - "Community 52"
Cohesion: 1.0
Nodes (0): 

### Community 53 - "Community 53"
Cohesion: 1.0
Nodes (0): 

### Community 54 - "Community 54"
Cohesion: 1.0
Nodes (0): 

### Community 55 - "Community 55"
Cohesion: 1.0
Nodes (0): 

### Community 56 - "Community 56"
Cohesion: 1.0
Nodes (0): 

### Community 57 - "Community 57"
Cohesion: 1.0
Nodes (0): 

### Community 58 - "Community 58"
Cohesion: 1.0
Nodes (1): Check if response contains tool calls.

### Community 59 - "Community 59"
Cohesion: 1.0
Nodes (1): Description of what the tool does.

### Community 60 - "Community 60"
Cohesion: 1.0
Nodes (1): JSON Schema for tool parameters.

### Community 61 - "Community 61"
Cohesion: 1.0
Nodes (1): Execute the tool with given parameters.                  Args:             **

### Community 62 - "Community 62"
Cohesion: 1.0
Nodes (0): 

### Community 63 - "Community 63"
Cohesion: 1.0
Nodes (1): Background loop — override in each agent subclass.

### Community 64 - "Community 64"
Cohesion: 1.0
Nodes (1): Unique key for session identification.

### Community 65 - "Community 65"
Cohesion: 1.0
Nodes (1): Get expanded workspace path.

### Community 66 - "Community 66"
Cohesion: 1.0
Nodes (0): 

### Community 67 - "Community 67"
Cohesion: 1.0
Nodes (0): 

### Community 68 - "Community 68"
Cohesion: 1.0
Nodes (1): Send a chat completion request.                  Args:             messages:

### Community 69 - "Community 69"
Cohesion: 1.0
Nodes (1): Get the default model for this provider.

### Community 70 - "Community 70"
Cohesion: 1.0
Nodes (0): 

### Community 71 - "Community 71"
Cohesion: 1.0
Nodes (0): 

### Community 72 - "Community 72"
Cohesion: 1.0
Nodes (0): 

### Community 73 - "Community 73"
Cohesion: 1.0
Nodes (0): 

### Community 74 - "Community 74"
Cohesion: 1.0
Nodes (0): 

### Community 75 - "Community 75"
Cohesion: 1.0
Nodes (0): 

### Community 76 - "Community 76"
Cohesion: 1.0
Nodes (0): 

## Knowledge Gaps
- **230 isolated node(s):** `Entry point for running nanobot as a module: python -m nanobot`, `Two-layer memory: MEMORY.md (long-term facts) + HISTORY.md (grep-searchable log)`, `Skills loader for agent capabilities.`, `Loader for agent skills.          Skills are markdown files (SKILL.md) that te`, `List all available skills.                  Args:             filter_unavaila` (+225 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `Community 43`** (2 nodes): `__main__.py`, `Entry point for running nanobot as a module: python -m nanobot`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 44`** (2 nodes): `App()`, `App.jsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 45`** (2 nodes): `DomainSetupBanner.jsx`, `DomainSetupBanner()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 46`** (2 nodes): `NotificationFeed.jsx`, `NotificationFeed()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 47`** (2 nodes): `PageHeader.jsx`, `PageHeader()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 48`** (2 nodes): `SpecialistChat.jsx`, `SpecialistChat()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 49`** (2 nodes): `StatusBadge.jsx`, `StatusBadge()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 50`** (2 nodes): `DocumentsPage.jsx`, `DocumentsPage()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 51`** (2 nodes): `SettingsPage.jsx`, `SettingsPage()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 52`** (2 nodes): `test_cron_add_rejects_invalid_timezone()`, `test_cron_commands.py`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 53`** (2 nodes): `fetch_openapi()`, `export_db.py`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 54`** (2 nodes): `create_md()`, `force_create_missing.py`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 55`** (2 nodes): `create_md()`, `mass_create_agents.py`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 56`** (1 nodes): `types.d.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 57`** (1 nodes): `__init__.py`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 58`** (1 nodes): `Check if response contains tool calls.`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 59`** (1 nodes): `Description of what the tool does.`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 60`** (1 nodes): `JSON Schema for tool parameters.`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 61`** (1 nodes): `Execute the tool with given parameters.                  Args:             **`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 62`** (1 nodes): `__init__.py`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 63`** (1 nodes): `Background loop — override in each agent subclass.`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 64`** (1 nodes): `Unique key for session identification.`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 65`** (1 nodes): `Get expanded workspace path.`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 66`** (1 nodes): `__init__.py`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 67`** (1 nodes): `__init__.py`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 68`** (1 nodes): `Send a chat completion request.                  Args:             messages:`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 69`** (1 nodes): `Get the default model for this provider.`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 70`** (1 nodes): `eslint.config.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 71`** (1 nodes): `vite.config.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 72`** (1 nodes): `main.jsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 73`** (1 nodes): `check_import.py`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 74`** (1 nodes): `csv_to_db.py`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 75`** (1 nodes): `debug_tools.py`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 76`** (1 nodes): `sync_out.ps1`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `OutboundMessage` connect `Community 0` to `Community 32`, `Community 1`, `Community 2`, `Community 3`, `Community 37`, `Community 5`, `Community 13`, `Community 15`?**
  _High betweenness centrality (0.102) - this node is a cross-community bridge._
- **Why does `MessageBus` connect `Community 0` to `Community 1`, `Community 2`, `Community 3`, `Community 5`, `Community 37`, `Community 13`?**
  _High betweenness centrality (0.099) - this node is a cross-community bridge._
- **Why does `SessionManager` connect `Community 3` to `Community 1`, `Community 2`, `Community 4`, `Community 6`, `Community 9`?**
  _High betweenness centrality (0.077) - this node is a cross-community bridge._
- **Are the 215 inferred relationships involving `MessageBus` (e.g. with `AgentLoop` and `Agent loop: the core processing engine.`) actually correct?**
  _`MessageBus` has 215 INFERRED edges - model-reasoned connections that need verification._
- **Are the 219 inferred relationships involving `OutboundMessage` (e.g. with `AgentLoop` and `Agent loop: the core processing engine.`) actually correct?**
  _`OutboundMessage` has 219 INFERRED edges - model-reasoned connections that need verification._
- **Are the 149 inferred relationships involving `BaseChannel` (e.g. with `InboundMessage` and `OutboundMessage`) actually correct?**
  _`BaseChannel` has 149 INFERRED edges - model-reasoned connections that need verification._
- **Are the 98 inferred relationships involving `SessionManager` (e.g. with `AgentLoop` and `Agent loop: the core processing engine.`) actually correct?**
  _`SessionManager` has 98 INFERRED edges - model-reasoned connections that need verification._