# JSON Path Dropdown Enhancement - Parse JSON-to-String Fields

## Problem Statement
The JSON path dropdowns in Step 4 (Filter Conditions) and Step 6 (Add Field Mapping modal) are not showing all available values when JSON-to-String transformations are applied in Step 3.

## Current Behavior
1. **Step 3 (Schema Rules)**: User selects "JSON to String" checkboxes for certain fields
2. **Step 4 (Filter Conditions)**: The Fields dropdown does NOT parse the JSON-to-String fields
   - These fields appear as simple string fields
   - Their nested JSON paths are not extracted and displayed in the dropdown

## Expected Behavior
1. **Parse JSON-to-String Fields**: When a field is marked as "JSON to String" in Step 3:
   - The system should parse the content of that field as JSON
   - Extract all nested JSON paths from within that stringified JSON field
   - Add these nested paths to the Fields dropdown on step 4, filter rule screen

2. **Display Nested Paths**: The JSON path dropdown should show:
   - All original JSON paths from the sample data
   - All nested paths from fields marked as "JSON to String"
   - All Arrays and fanout selection in step 4 field dropdown
   - Use dot notation or bracket notation to indicate the nesting level
   - Example: If `data.payload` is marked as JSON-to-String and contains `{message: "...", timestamp: "..."}`, show:
     - `data.payload.message`
     - `data.payload.timestamp`

3. **Real-time Updates**: When the user navigates back to Step 3 and:
   - **Checks** a "JSON to String" checkbox → Dropdown should immediately update to include nested paths
   - **Unchecks** a "JSON to String" checkbox → Dropdown should remove those nested paths

## Affected Components
1. **Step 4 - Filter Conditions**:
   - JSON path dropdown in condition builder
   - File: Likely in filter/condition components

## Implementation Requirements
1. Monitor Vuex store for JSON-to-String field selections from Step 3
2. When extracting JSON paths, check which fields are marked as JSON-to-String
3. Parse the sample data for those fields and extract nested paths
4. Combine original paths + nested paths from JSON-to-String fields
5. Ensure reactivity - watch for changes to JSON-to-String selections
6. Update  Step 4 drop down

## Technical Notes
- JSON-to-String configuration is likely stored in Vuex state (wizard module)
- Sample data parsing happens in MappingService or similar service
- Need to handle edge cases: invalid JSON, deeply nested structures, circular references
- Consider performance impact of re-parsing on every navigation