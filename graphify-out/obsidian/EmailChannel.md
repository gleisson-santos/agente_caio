---
source_file: "caiocore\channels\email.py"
type: "code"
community: "Community None"
location: "L58"
tags:
  - graphify/code
  - graphify/INFERRED
  - community/Community_None
---

# EmailChannel

## Connections
- [[.__init__()_44]] - `method` [EXTRACTED]
- [[._check_and_notify()]] - `method` [EXTRACTED]
- [[._fetch_messages()]] - `method` [EXTRACTED]
- [[._fetch_new_messages()]] - `method` [EXTRACTED]
- [[._idle_loop()]] - `method` [EXTRACTED]
- [[._init_channels()]] - `calls` [INFERRED]
- [[._reply_subject()]] - `method` [EXTRACTED]
- [[._smtp_send()]] - `method` [EXTRACTED]
- [[._validate_config()]] - `method` [EXTRACTED]
- [[.fetch_messages_between_dates()]] - `method` [EXTRACTED]
- [[.get_recent_emails()]] - `method` [EXTRACTED]
- [[.remove_from_cache()]] - `method` [EXTRACTED]
- [[.send()_2]] - `method` [EXTRACTED]
- [[.start()_4]] - `method` [EXTRACTED]
- [[.stop()_5]] - `method` [EXTRACTED]
- [[BaseChannel]] - `uses` [INFERRED]
- [[BaseChannel_1]] - `inherits` [EXTRACTED]
- [[ChannelManager]] - `uses` [INFERRED]
- [[Dispatch outbound messages to the appropriate channel.]] - `uses` [INFERRED]
- [[Email channel.      Inbound     - Poll IMAP mailbox for unread messages.]] - `rationale_for` [EXTRACTED]
- [[EmailConfig]] - `uses` [INFERRED]
- [[Get a channel by name.]] - `uses` [INFERRED]
- [[Get list of enabled channel names.]] - `uses` [INFERRED]
- [[Get status of all channels.]] - `uses` [INFERRED]
- [[Initialize channels based on config. Only creates if not already exists.]] - `uses` [INFERRED]
- [[Manages chat channels and coordinates message routing.          Responsibiliti]] - `uses` [INFERRED]
- [[MessageBus]] - `uses` [INFERRED]
- [[OutboundMessage]] - `uses` [INFERRED]
- [[Session management for conversation history.]] - `uses` [INFERRED]
- [[Start a channel and log any exceptions.]] - `uses` [INFERRED]
- [[Start all channels and the outbound dispatcher.]] - `uses` [INFERRED]
- [[Stop all channels and the dispatcher.]] - `uses` [INFERRED]
- [[Sync running channels with the provided config (Hot-reload).]] - `uses` [INFERRED]
- [[email.py]] - `contains` [EXTRACTED]
- [[test_fetch_messages_between_dates_uses_imap_since_before_without_mark_seen()]] - `calls` [INFERRED]
- [[test_fetch_new_messages_parses_unseen_and_marks_seen()]] - `calls` [INFERRED]
- [[test_send_skips_when_auto_reply_disabled()]] - `calls` [INFERRED]
- [[test_send_skips_when_consent_not_granted()]] - `calls` [INFERRED]
- [[test_send_uses_smtp_and_reply_subject()]] - `calls` [INFERRED]
- [[test_start_returns_immediately_without_consent()]] - `calls` [INFERRED]

#graphify/code #graphify/INFERRED #community/Community_None