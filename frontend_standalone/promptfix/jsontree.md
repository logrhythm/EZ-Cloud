# JSON Tree Display Improvements for Step 5 Mapping

## Problem Statement
The JSON tree on Step 5 (Field Mapping) is currently displaying raw JSON data with all values, which is verbose and difficult to navigate. It needs to show a clean schema view with aggregated values as hints.

## Current Behavior (Issues)
- Displays complete JSON structure including all literal values
- Shows repeated array elements like `[0]`, `[1]`, `[2]`, etc., creating visual clutter
- No value aggregation or summarization
- Difficult to understand the schema structure when dealing with large datasets
- No clear indication that fields are clickable for mapping

## Desired Behavior

### 1. Schema-Only Display
- Show **only the schema structure** (field names and types)
- **Hide actual values** from the tree nodes
- Display values as **tooltip hints** when hovering over nodes
- Example:
  ```
  Current:  user: "john.doe@example.com"
  Desired:  user  (hover shows: "john.doe@example.com", "jane.smith@example.com", ...)
  ```

### 2. Array Handling

#### 2.1 Primitive Arrays (no objects inside)
- Display **only one array node** with aggregated values
- Show value aggregation in tooltip
- Example:
  ```
  Current:  tags[0]: "security"
            tags[1]: "audit"
            tags[2]: "critical"
  Desired:  tags[]  (hover shows: ["security", "audit", "critical", ...])
  ```

#### 2.2 Object Arrays (JSON objects inside)
- Display **single array element** without index notation `[0]`, `[1]`, etc.
- Show the **unique schema** of the object(s) inside the array
- Aggregate all values from all array instances
- Display aggregated values as tooltip hint
- Example:
  ```
  Current:  events[0]
              └─ user: "john"
              └─ action: "login"
            events[1]
              └─ user: "jane"
              └─ action: "logout"
  
  Desired:  events[]
              └─ user  (hover shows: "john", "jane", "alice", ...)
              └─ action  (hover shows: "login", "logout", "view", ...)
  ```

### 3. Multi-Line Log Support
- When `sampleData.dataStructure === 'multi-line'`:
  - **Parse all log lines** from the sample data
  - Extract and **merge schemas** from all lines
  - Build a **unified schema** showing all unique fields discovered across all logs
  - Aggregate values from all log lines per field
  - Display aggregated values as tooltip hints
- Example:
  ```
  Log 1: { "user": "john", "action": "login" }
  Log 2: { "user": "jane", "ip": "192.168.1.1" }
  Log 3: { "user": "alice", "action": "view", "ip": "10.0.0.5" }
  
  Tree Display:
  $
    └─ user    (hover: "john", "jane", "alice")
    └─ action  (hover: "login", "view")
    └─ ip      (hover: "192.168.1.1", "10.0.0.5")
  ```

### 4. Hover Interaction
- On hover over any node/attribute, show a **tooltip message**:
  - Primary message: `"Click on '{fieldname}' to map it to a LogRhythm field"`
  - Secondary line: Show aggregated sample values (first 3-5 unique values)
- Example tooltip:
  ```
  Click on 'user.email' to map it to a LogRhythm field
  Sample values: "john@example.com", "jane@example.com", "alice@example.com" ...
  ```

### 5. Visual Indicators
- Add a **type icon** next to each field (string, number, boolean, array, object)
- Show **mapped status** (checkmark icon) for already-mapped fields
- Highlight **clickable fields** on hover with cursor change

## Implementation Requirements

### Data Processing
1. **Schema Extraction Service** (`MappingService.buildTreeStructure`):
   - Extract schema without values
   - Detect field types (string, number, boolean, array, object)
   - Handle array normalization (remove index notation)
   - Merge schemas from multi-line logs

2. **Value Aggregation Service** (new method):
   - Collect all unique values per field across dataset
   - Limit aggregation to first N unique values (e.g., 10-20)
   - Store aggregated values in node metadata

3. **Multi-Line Parser** (new or enhanced):
   - Parse all log lines when `dataStructure === 'multi-line'`
   - Build unified schema from all parsed logs
   - Aggregate values per field across all logs

### Component Updates (`JsonTreeViewer.vue`)
1. Modify tree node rendering:
   - Display only field names (no values)
   - Add type icons
   - Add mapped status indicators

2. Implement hover tooltip:
   - Show "Click on '{field}' to map" message
   - Display aggregated sample values
   - Show data type

3. Update click handler:
   - Ensure proper JSON path generation
   - Pass aggregated values to mapping dialog

### Edge Cases
- Handle deeply nested arrays of arrays
- Handle mixed-type arrays (arrays containing both primitives and objects)
- Handle empty arrays
- Handle null/undefined values
- Handle very large value sets (limit aggregation)
- Handle special characters in field names

## Validation Checklist
- [ ] Single-line JSON: Schema displayed without values
- [ ] Primitive arrays: Single node with aggregated values in tooltip
- [ ] Object arrays: Single element showing unique schema with aggregated values
- [ ] Multi-line logs: Unified schema with values from all logs
- [ ] Hover: Tooltip shows "Click to map" message and sample values
- [ ] Mapped fields: Show visual indicator (checkmark)
- [ ] Large datasets: Performance remains acceptable (no lag)
- [ ] Edge cases: Empty arrays, null values, special characters handled gracefully

## Files to Modify
1. `src/services/wizard/mappingService.js`:
   - `buildTreeStructure()` - Enhance to extract schema only
   - `extractJsonPaths()` - Update to handle normalized array paths
   - Add new method: `aggregateValues(data, path)` - Collect unique values per field

2. `src/components/wizard/components/JsonTreeViewer.vue`:
   - Update node rendering (remove value display)
   - Add tooltip component
   - Add hover interactions
   - Update styling for schema-only view

3. `src/components/wizard/steps/Step5_Mapping.vue`:
   - Update `buildJsonTree()` to call enhanced services
   - Handle multi-line log parsing
   - Pass aggregated values to tree component

## Expected Outcome
- Clean, readable schema tree view
- Users can quickly understand data structure
- Easy identification of available fields for mapping
- Clear call-to-action on hover
- Better performance with large datasets
- Consistent experience across single-line and multi-line logs  
