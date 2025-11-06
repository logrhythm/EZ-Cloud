# Dynamic Fanout Detection from Parsed JSON Strings

## Requirement

On Step 3 (Schema Configuration), when a user selects a "Convert to JSON" checkbox for a stringified JSON field:

1. **Parse the stringified JSON** field to extract its nested structure
2. **Detect any arrays** within the parsed JSON data
3. **Dynamically add** these newly discovered arrays to the Fanout card's tree viewer
4. **Show them as selectable** fanout candidates alongside existing arrays

When the checkbox is **deselected**:

1. **Remove** the arrays that were discovered from that parsed JSON field
2. **Update** the fanout tree viewer to hide those arrays
3. **Preserve** any user selections for arrays that still exist

## Implementation Notes

- The parsing should happen in real-time as checkboxes are toggled
- Parsed JSON arrays should be clearly identified in the tree (e.g., with a badge or icon indicating they come from a parsed field)
- Path naming should reflect the parsed origin (e.g., `originalField.parsedArray`)
- Error handling: If the stringified JSON cannot be parsed, show a warning but don't break the UI
- The parsed structure should be merged with the existing data structure for the fanout tree

## Example

Given a log with a stringified JSON field:
```json
{
  "timestamp": "2025-01-01T10:00:00Z",
  "details": "{\"users\": [{\"id\": 1, \"roles\": [\"admin\", \"user\"]}], \"metadata\": {\"tags\": [\"prod\", \"api\"]}}"
}
```

When user checks "details" in Convert to JSON:
- Fanout tree should show:
  - `details.users` (array of objects)
  - `details.users[0].roles` (array of strings)
  - `details.metadata.tags` (array of strings)

When user unchecks "details":
- Remove `details.users`, `details.users[0].roles`, and `details.metadata.tags` from the fanout tree