---
source_file: "caiocore\channels\mochat.py"
type: "code"
community: "Community 0"
location: "L215"
tags:
  - graphify/code
  - graphify/EXTRACTED
  - community/Community_0
---

# MochatChannel

## Connections
- [[.__init__()_48]] - `method` [EXTRACTED]
- [[._api_send()]] - `method` [EXTRACTED]
- [[._build_notify_handler()]] - `method` [EXTRACTED]
- [[._cancel_delay_timers()]] - `method` [EXTRACTED]
- [[._delay_flush_after()]] - `method` [EXTRACTED]
- [[._dispatch_entries()]] - `method` [EXTRACTED]
- [[._enqueue_delayed_entry()]] - `method` [EXTRACTED]
- [[._ensure_fallback_workers()]] - `method` [EXTRACTED]
- [[._flush_delayed_entries()]] - `method` [EXTRACTED]
- [[._handle_notify_chat_message()]] - `method` [EXTRACTED]
- [[._handle_notify_inbox_append()]] - `method` [EXTRACTED]
- [[._handle_watch_payload()]] - `method` [EXTRACTED]
- [[._init_channels()]] - `calls` [INFERRED]
- [[._load_session_cursors()]] - `method` [EXTRACTED]
- [[._mark_session_cursor()]] - `method` [EXTRACTED]
- [[._panel_poll_worker()]] - `method` [EXTRACTED]
- [[._post_json()]] - `method` [EXTRACTED]
- [[._process_inbound_event()]] - `method` [EXTRACTED]
- [[._refresh_loop()]] - `method` [EXTRACTED]
- [[._refresh_panels()]] - `method` [EXTRACTED]
- [[._refresh_sessions_directory()]] - `method` [EXTRACTED]
- [[._refresh_targets()]] - `method` [EXTRACTED]
- [[._remember_message_id()]] - `method` [EXTRACTED]
- [[._save_cursor_debounced()]] - `method` [EXTRACTED]
- [[._save_session_cursors()]] - `method` [EXTRACTED]
- [[._seed_targets_from_config()]] - `method` [EXTRACTED]
- [[._session_watch_worker()]] - `method` [EXTRACTED]
- [[._socket_call()]] - `method` [EXTRACTED]
- [[._start_socket_client()]] - `method` [EXTRACTED]
- [[._stop_fallback_workers()]] - `method` [EXTRACTED]
- [[._subscribe_all()]] - `method` [EXTRACTED]
- [[._subscribe_panels()]] - `method` [EXTRACTED]
- [[._subscribe_sessions()]] - `method` [EXTRACTED]
- [[.send()_5]] - `method` [EXTRACTED]
- [[.start()_7]] - `method` [EXTRACTED]
- [[.stop()_8]] - `method` [EXTRACTED]
- [[BaseChannel]] - `uses` [INFERRED]
- [[BaseChannel_1]] - `inherits` [EXTRACTED]
- [[ChannelManager]] - `uses` [INFERRED]
- [[Dispatch outbound messages to the appropriate channel.]] - `uses` [INFERRED]
- [[Get a channel by name.]] - `uses` [INFERRED]
- [[Get list of enabled channel names.]] - `uses` [INFERRED]
- [[Get status of all channels.]] - `uses` [INFERRED]
- [[Initialize channels based on config. Only creates if not already exists.]] - `uses` [INFERRED]
- [[Manages chat channels and coordinates message routing.          Responsibiliti]] - `uses` [INFERRED]
- [[MessageBus]] - `uses` [INFERRED]
- [[Mochat channel using socket.io with fallback polling workers.]] - `rationale_for` [EXTRACTED]
- [[MochatConfig]] - `uses` [INFERRED]
- [[OutboundMessage]] - `uses` [INFERRED]
- [[Session management for conversation history.]] - `uses` [INFERRED]
- [[Start a channel and log any exceptions.]] - `uses` [INFERRED]
- [[Start all channels and the outbound dispatcher.]] - `uses` [INFERRED]
- [[Stop all channels and the dispatcher.]] - `uses` [INFERRED]
- [[Sync running channels with the provided config (Hot-reload).]] - `uses` [INFERRED]
- [[mochat.py]] - `contains` [EXTRACTED]

#graphify/code #graphify/EXTRACTED #community/Community_0