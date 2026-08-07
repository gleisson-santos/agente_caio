---
type: community
members: 131
---

# Community 4

**Members:** 131 nodes

## Members
- [[._cancel_delay_timers()]] - code - caiocore\channels\mochat.py
- [[._get_legacy_session_path()]] - code - caiocore\session\manager.py
- [[._get_session_path()]] - code - caiocore\session\manager.py
- [[._load()]] - code - caiocore\session\manager.py
- [[._save_cursor_debounced()]] - code - caiocore\channels\mochat.py
- [[._save_session_cursors()]] - code - caiocore\channels\mochat.py
- [[._stop_fallback_workers()]] - code - caiocore\channels\mochat.py
- [[.add_message()]] - code - caiocore\session\manager.py
- [[.clear()]] - code - caiocore\session\manager.py
- [[.disconnect()]] - code - bridge\src\whatsapp.ts
- [[.get_history()]] - code - caiocore\session\manager.py
- [[.get_or_create()]] - code - caiocore\session\manager.py
- [[.invalidate()]] - code - caiocore\session\manager.py
- [[.list_sessions()]] - code - caiocore\session\manager.py
- [[.save()]] - code - caiocore\session\manager.py
- [[.stop()]] - code - bridge\src\server.ts
- [[.stop()_8]] - code - caiocore\channels\mochat.py
- [[.test_add_messages_appends_only()]] - code - tests\test_consolidate_offset.py
- [[.test_archive_all_consolidates_everything()]] - code - tests\test_consolidate_offset.py
- [[.test_archive_all_resets_last_consolidated()]] - code - tests\test_consolidate_offset.py
- [[.test_archive_all_vs_normal_consolidation()]] - code - tests\test_consolidate_offset.py
- [[.test_clear_resets_last_consolidated()]] - code - tests\test_consolidate_offset.py
- [[.test_clear_resets_session()]] - code - tests\test_consolidate_offset.py
- [[.test_consolidation_does_not_modify_messages_list()]] - code - tests\test_consolidate_offset.py
- [[.test_consolidation_needed_when_messages_exceed_window()]] - code - tests\test_consolidate_offset.py
- [[.test_consolidation_only_updates_last_consolidated()]] - code - tests\test_consolidate_offset.py
- [[.test_consolidation_skipped_when_no_new_messages()]] - code - tests\test_consolidate_offset.py
- [[.test_consolidation_skipped_when_within_keep_count()]] - code - tests\test_consolidate_offset.py
- [[.test_empty_session_consolidation()]] - code - tests\test_consolidate_offset.py
- [[.test_exactly_keep_count_messages()]] - code - tests\test_consolidate_offset.py
- [[.test_get_history_after_reload()]] - code - tests\test_consolidate_offset.py
- [[.test_get_history_does_not_modify_messages()]] - code - tests\test_consolidate_offset.py
- [[.test_get_history_returns_most_recent()]] - code - tests\test_consolidate_offset.py
- [[.test_get_history_stable_for_same_session()]] - code - tests\test_consolidate_offset.py
- [[.test_get_history_with_all_messages()]] - code - tests\test_consolidate_offset.py
- [[.test_initial_last_consolidated_zero()]] - code - tests\test_consolidate_offset.py
- [[.test_initial_state()]] - code - tests\test_consolidate_offset.py
- [[.test_just_over_keep_count()]] - code - tests\test_consolidate_offset.py
- [[.test_last_consolidated_exceeds_message_count()]] - code - tests\test_consolidate_offset.py
- [[.test_last_consolidated_negative_value()]] - code - tests\test_consolidate_offset.py
- [[.test_last_consolidated_persistence()]] - code - tests\test_consolidate_offset.py
- [[.test_messages_added_after_consolidation()]] - code - tests\test_consolidate_offset.py
- [[.test_messages_list_never_modified()]] - code - tests\test_consolidate_offset.py
- [[.test_persistence_roundtrip()]] - code - tests\test_consolidate_offset.py
- [[.test_session_with_gaps_in_consolidation()]] - code - tests\test_consolidate_offset.py
- [[.test_single_message_session()]] - code - tests\test_consolidate_offset.py
- [[.test_slice_behavior_when_indices_overlap()]] - code - tests\test_consolidate_offset.py
- [[.test_slice_extracts_correct_range()]] - code - tests\test_consolidate_offset.py
- [[.test_slice_when_keep_count_exceeds_messages()]] - code - tests\test_consolidate_offset.py
- [[.test_slice_with_partial_consolidation()]] - code - tests\test_consolidate_offset.py
- [[.test_slice_with_various_keep_counts()]] - code - tests\test_consolidate_offset.py
- [[.test_very_large_session()]] - code - tests\test_consolidate_offset.py
- [[A conversation session.      Stores messages in JSONL format for easy reading]] - rationale - caiocore\session\manager.py
- [[Add a message to the session.]] - rationale - caiocore\session\manager.py
- [[Assert that messages contain expected content from start to end index.      Ar]] - rationale - tests\test_consolidate_offset.py
- [[Clear all messages and reset session to initial state.]] - rationale - caiocore\session\manager.py
- [[Convert a string to a safe filename.]] - rationale - caiocore\utils\helpers.py
- [[Create a session and add the specified number of messages.      Args]] - rationale - tests\test_consolidate_offset.py
- [[Extract messages that would be consolidated using the standard slice logic.]] - rationale - tests\test_consolidate_offset.py
- [[Get an existing session or create a new one.                  Args]] - rationale - caiocore\session\manager.py
- [[Get recent messages in LLM format, preserving tool metadata.]] - rationale - caiocore\session\manager.py
- [[Get the file path for a session.]] - rationale - caiocore\session\manager.py
- [[Legacy global session path (~.caiocoresessions).]] - rationale - caiocore\session\manager.py
- [[List all sessions.                  Returns             List of session info]] - rationale - caiocore\session\manager.py
- [[Load a session from disk.]] - rationale - caiocore\session\manager.py
- [[Manages conversation sessions.      Sessions are stored as JSONL files in the]] - rationale - caiocore\session\manager.py
- [[Remove a session from the in-memory cache.]] - rationale - caiocore\session\manager.py
- [[Save a session to disk.]] - rationale - caiocore\session\manager.py
- [[Session]] - code - caiocore\session\manager.py
- [[SessionManager]] - code - caiocore\session\manager.py
- [[Test Session message immutability for cache efficiency.]] - rationale - tests\test_consolidate_offset.py
- [[Test Session persistence and reload.]] - rationale - tests\test_consolidate_offset.py
- [[Test archive_all mode (used by new command).]] - rationale - tests\test_consolidate_offset.py
- [[Test archive_all=True consolidates all messages.]] - rationale - tests\test_consolidate_offset.py
- [[Test behavior when last_consolidated  len(messages) (data corruption).]] - rationale - tests\test_consolidate_offset.py
- [[Test behavior with negative last_consolidated (invalid state).]] - rationale - tests\test_consolidate_offset.py
- [[Test consolidation behavior with empty session.]] - rationale - tests\test_consolidate_offset.py
- [[Test consolidation logic should trigger when messages  memory_window.]] - rationale - tests\test_consolidate_offset.py
- [[Test consolidation skipped when messages_to_process = 0.]] - rationale - tests\test_consolidate_offset.py
- [[Test consolidation skipped when total messages = keep_count.]] - rationale - tests\test_consolidate_offset.py
- [[Test consolidation trigger conditions and logic.]] - rationale - tests\test_consolidate_offset.py
- [[Test consolidation with single message.]] - rationale - tests\test_consolidate_offset.py
- [[Test consolidation with very large message count.]] - rationale - tests\test_consolidate_offset.py
- [[Test correct behavior when new messages arrive after consolidation.]] - rationale - tests\test_consolidate_offset.py
- [[Test difference between archive_all and normal consolidation.]] - rationale - tests\test_consolidate_offset.py
- [[Test empty sessions and boundary conditions.]] - rationale - tests\test_consolidate_offset.py
- [[Test get_history returns the most recent messages.]] - rationale - tests\test_consolidate_offset.py
- [[Test get_history with max_messages larger than actual.]] - rationale - tests\test_consolidate_offset.py
- [[Test last_consolidated edge cases and data corruption scenarios.]] - rationale - tests\test_consolidate_offset.py
- [[Test last_consolidated tracking to avoid duplicate processing.]] - rationale - tests\test_consolidate_offset.py
- [[Test session management with cache-friendly message handling.]] - rationale - tests\test_consolidate_offset.py
- [[Test session with exactly keep_count messages.]] - rationale - tests\test_consolidate_offset.py
- [[Test session with one message over keep_count.]] - rationale - tests\test_consolidate_offset.py
- [[Test session with potential gaps in consolidation history.]] - rationale - tests\test_consolidate_offset.py
- [[Test slice behavior when last_consolidated = total - keep_count.]] - rationale - tests\test_consolidate_offset.py
- [[Test slice behavior with different keep_count values.]] - rationale - tests\test_consolidate_offset.py
- [[Test slice when keep_count  len(messages).]] - rationale - tests\test_consolidate_offset.py
- [[Test slice when some messages already consolidated.]] - rationale - tests\test_consolidate_offset.py
- [[Test that adding messages only appends, never modifies.]] - rationale - tests\test_consolidate_offset.py
- [[Test that archive_all mode resets last_consolidated to 0.]] - rationale - tests\test_consolidate_offset.py
- [[Test that clear() properly resets session.]] - rationale - tests\test_consolidate_offset.py
- [[Test that clear() resets last_consolidated to 0.]] - rationale - tests\test_consolidate_offset.py
- [[Test that consolidation doesn't modify session.messages (cache safety).]] - rationale - tests\test_consolidate_offset.py
- [[Test that consolidation leaves messages list unchanged.]] - rationale - tests\test_consolidate_offset.py
- [[Test that consolidation only updates last_consolidated field.]] - rationale - tests\test_consolidate_offset.py
- [[Test that get_history doesn't modify messages list.]] - rationale - tests\test_consolidate_offset.py
- [[Test that get_history returns same content for same max_messages.]] - rationale - tests\test_consolidate_offset.py
- [[Test that get_history works correctly after reload.]] - rationale - tests\test_consolidate_offset.py
- [[Test that last_consolidated persists across saveload.]] - rationale - tests\test_consolidate_offset.py
- [[Test that messages list is never modified after creation.]] - rationale - tests\test_consolidate_offset.py
- [[Test that messages persist across saveload.]] - rationale - tests\test_consolidate_offset.py
- [[Test that new session has empty messages list.]] - rationale - tests\test_consolidate_offset.py
- [[Test that new session starts with last_consolidated=0.]] - rationale - tests\test_consolidate_offset.py
- [[Test that slice extracts the correct message range.]] - rationale - tests\test_consolidate_offset.py
- [[Test the slice logic messageslast_consolidated-keep_count.]] - rationale - tests\test_consolidate_offset.py
- [[TestArchiveAllMode]] - code - tests\test_consolidate_offset.py
- [[TestCacheImmutability]] - code - tests\test_consolidate_offset.py
- [[TestConsolidationTriggerConditions]] - code - tests\test_consolidate_offset.py
- [[TestEmptyAndBoundarySessions]] - code - tests\test_consolidate_offset.py
- [[TestLastConsolidatedEdgeCases]] - code - tests\test_consolidate_offset.py
- [[TestSessionImmutableHistory]] - code - tests\test_consolidate_offset.py
- [[TestSessionLastConsolidated]] - code - tests\test_consolidate_offset.py
- [[TestSessionPersistence]] - code - tests\test_consolidate_offset.py
- [[TestSliceLogic]] - code - tests\test_consolidate_offset.py
- [[assert_messages_content()]] - code - tests\test_consolidate_offset.py
- [[create_session_with_messages()]] - code - tests\test_consolidate_offset.py
- [[get_old_messages()]] - code - tests\test_consolidate_offset.py
- [[manager.py_1]] - code - caiocore\session\manager.py
- [[safe_filename()]] - code - caiocore\utils\helpers.py
- [[temp_manager()]] - code - tests\test_consolidate_offset.py
- [[test_consolidate_offset.py]] - code - tests\test_consolidate_offset.py

## Live Query (requires Dataview plugin)

```dataview
TABLE source_file, type FROM #community/Community_4
SORT file.name ASC
```

## Connections to other communities
- 45 edges to [[_COMMUNITY_Community 1]]
- 22 edges to [[_COMMUNITY_Community 2]]
- 11 edges to [[_COMMUNITY_Community 0]]
- 4 edges to [[_COMMUNITY_Community 3]]
- 4 edges to [[_COMMUNITY_Community 6]]
- 3 edges to [[_COMMUNITY_Community 7]]
- 2 edges to [[_COMMUNITY_Community 15]]
- 2 edges to [[_COMMUNITY_Community 16]]
- 2 edges to [[_COMMUNITY_Community 13]]
- 2 edges to [[_COMMUNITY_Community 12]]
- 1 edge to [[_COMMUNITY_Community 5]]
- 1 edge to [[_COMMUNITY_Community 20]]

## Top bridge nodes
- [[.save()]] - degree 16, connects to 5 communities
- [[.clear()]] - degree 14, connects to 4 communities
- [[SessionManager]] - degree 108, connects to 3 communities
- [[Session]] - degree 92, connects to 2 communities
- [[.get_history()]] - degree 10, connects to 2 communities