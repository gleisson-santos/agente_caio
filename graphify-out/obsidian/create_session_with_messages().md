---
source_file: "tests\test_consolidate_offset.py"
type: "code"
community: "Community None"
location: "L12"
tags:
  - graphify/code
  - graphify/EXTRACTED
  - community/Community_None
---

# create_session_with_messages()

## Connections
- [[.add_message()]] - `calls` [INFERRED]
- [[.test_archive_all_consolidates_everything()]] - `calls` [EXTRACTED]
- [[.test_archive_all_resets_last_consolidated()]] - `calls` [EXTRACTED]
- [[.test_archive_all_vs_normal_consolidation()]] - `calls` [EXTRACTED]
- [[.test_clear_resets_last_consolidated()]] - `calls` [EXTRACTED]
- [[.test_clear_resets_session()]] - `calls` [EXTRACTED]
- [[.test_consolidation_does_not_modify_messages_list()]] - `calls` [EXTRACTED]
- [[.test_consolidation_needed_when_messages_exceed_window()]] - `calls` [EXTRACTED]
- [[.test_consolidation_only_updates_last_consolidated()]] - `calls` [EXTRACTED]
- [[.test_consolidation_skipped_when_no_new_messages()]] - `calls` [EXTRACTED]
- [[.test_consolidation_skipped_when_within_keep_count()]] - `calls` [EXTRACTED]
- [[.test_exactly_keep_count_messages()]] - `calls` [EXTRACTED]
- [[.test_get_history_after_reload()]] - `calls` [EXTRACTED]
- [[.test_get_history_does_not_modify_messages()]] - `calls` [EXTRACTED]
- [[.test_get_history_stable_for_same_session()]] - `calls` [EXTRACTED]
- [[.test_get_history_with_all_messages()]] - `calls` [EXTRACTED]
- [[.test_just_over_keep_count()]] - `calls` [EXTRACTED]
- [[.test_last_consolidated_exceeds_message_count()]] - `calls` [EXTRACTED]
- [[.test_last_consolidated_negative_value()]] - `calls` [EXTRACTED]
- [[.test_last_consolidated_persistence()]] - `calls` [EXTRACTED]
- [[.test_messages_added_after_consolidation()]] - `calls` [EXTRACTED]
- [[.test_messages_list_never_modified()]] - `calls` [EXTRACTED]
- [[.test_persistence_roundtrip()]] - `calls` [EXTRACTED]
- [[.test_session_with_gaps_in_consolidation()]] - `calls` [EXTRACTED]
- [[.test_slice_behavior_when_indices_overlap()]] - `calls` [EXTRACTED]
- [[.test_slice_extracts_correct_range()]] - `calls` [EXTRACTED]
- [[.test_slice_when_keep_count_exceeds_messages()]] - `calls` [EXTRACTED]
- [[.test_slice_with_partial_consolidation()]] - `calls` [EXTRACTED]
- [[.test_slice_with_various_keep_counts()]] - `calls` [EXTRACTED]
- [[.test_very_large_session()]] - `calls` [EXTRACTED]
- [[Create a session and add the specified number of messages.      Args]] - `rationale_for` [EXTRACTED]
- [[Session]] - `calls` [INFERRED]
- [[test_consolidate_offset.py]] - `contains` [EXTRACTED]

#graphify/code #graphify/EXTRACTED #community/Community_None