# JSON Path Extraction Fix for Multiline Data (NDJSON/JSONL)

## Problem Statement
When users upload multiline JSON data (NDJSON/JSONL format) in Step 2, the JSON path extraction in Step 4 (Filter Conditions) and Step 6 (Field Mapping) is incorrectly treating the entire dataset as an array, resulting in wrong JSON path syntax.

## Current Behavior (INCORRECT)

### Input Format: Multiline JSON (NDJSON/JSONL)
Each line is a separate, complete JSON object:
```json
{"id":101,"name":"SampleRecord","description":"This is a simple JSON with 20 attributes.","active":true,"count":42,"price":199.99,"rating":4.7,"createdAt":"2025-02-15T10:30:00Z","updatedAt":"2025-02-16T12:45:00Z","category":"General","status":"Available","priority":3,"tags":["alpha","beta","gamma"],"owner":"Manish","isVerified":false,"location":"USA","nestedObject":{"code":"N123","valid":true,"level":5},"numbersList":[10,20,30,40,50],"remarks":"All fields populated successfully."}
{"id":102,"name":"SampleRecord2","description":"This is a simple JSON with 20 attributes.","active":false,"count":55,"price":149.49,"rating":4.5,"createdAt":"2025-03-01T08:20:00Z","updatedAt":"2025-03-02T09:10:00Z","category":"General","status":"OutOfStock","priority":2,"tags":["delta","epsilon","zeta"],"owner":"Manish","isVerified":true,"location":"Canada","nestedObject":{"code":"N456","valid":false,"level":3},"numbersList":[5,15,25,35],"remarks":"Record updated with variations."}
{"id":103,"name":"SampleRecord3","description":"This is a simple JSON with 20 attributes.","active":true,"count":88,"price":249.00,"rating":4.9,"createdAt":"2025-04-10T12:00:00Z","updatedAt":"2025-04-10T12:30:00Z","category":"Premium","status":"Available","priority":1,"tags":["theta","lambda","omega"],"owner":"Manish","isVerified":true,"location":"UK","nestedObject":{"code":"N789","valid":true,"level":9},"numbersList":[100,200,300],"remarks":"High priority premium record."}
{"id":104,"name":"SampleRecord4","description":"This is a simple JSON with 20 attributes.","active":false,"count":23,"price":89.99,"rating":3.8,"createdAt":"2025-05-22T14:55:00Z","updatedAt":"2025-05-22T15:10:00Z","category":"Basic","status":"Archived","priority":4,"tags":["red","green","blue"],"owner":"Manish","isVerified":false,"location":"India","nestedObject":{"code":"N321","valid":true,"level":1},"numbersList":[2,4,6,8,10],"remarks":"Archived due to low usage."}
{"id":105,"name":"SampleRecord5","description":"This is a simple JSON with 20 attributes.","active":true,"count":67,"price":179.75,"rating":4.2,"createdAt":"2025-06-05T09:40:00Z","updatedAt":"2025-06-05T10:00:00Z","category":"Standard","status":"Available","priority":2,"tags":["one","two","three"],"owner":"Manish","isVerified":true,"location":"Germany","nestedObject":{"code":"N654","valid":false,"level":7},"numbersList":[12,24,36,48],"remarks":"Standard record with mid-level priority."}
```

### Current (Wrong) Field Dropdown Values:
The system is treating this as an array of objects and generating paths like:
- `$.[*].id` ❌
- `$.[*].description` ❌
- `$.[*].tags[*]` ❌
- `$.[*].nestedObject.code` ❌
- `$.[*].active` ❌
- `$.[*].location` ❌

**Issue**: The system wraps everything with `$.[*].` because it incorrectly assumes the multiline data is an array at the root level.

## Expected Behavior (CORRECT)

### Correct JSON Path Generation:
For multiline NDJSON/JSONL data, each line is an **individual** JSON object, NOT an array element. Therefore, paths should be:
- `$.id` ✅
- `$.description` ✅
- `$.tags[*]` ✅ (tags itself is an array within each object)
- `$.nestedObject.code` ✅
- `$.active` ✅
- `$.location` ✅
- `$.numbersList[*]` ✅

**Rationale**: Each line is processed independently. When the system processes one record at a time, it should reference fields from the root of that single object, not from an array index.

## Root Cause Analysis

### Single-line JSON (Working Correctly) ✅
When user provides a single JSON object or manually inputs JSON:
```json
{"id":101,"name":"SampleRecord","description":"Test"}
```
The system correctly generates: `$.id`, `$.name`, `$.description`

### Multiline JSON (Currently Broken) ❌
When user uploads multiline JSON (NDJSON), the system:
1. Parses the data as an array of objects: `[{...}, {...}, ...]`
2. Treats the root as an array with `$.[*]` prefix
3. This is incorrect for NDJSON format where each line is independent

## Technical Requirements

### 1. Detect Multiline Format
- Check if `sampleData` has a `isMultiline` or similar flag in Vuex state
- This flag should be set in Step 2 when data is uploaded/parsed
- Differentiate between:
  - **Single JSON Object**: `{"key": "value"}`
  - **JSON Array**: `[{"key": "value"}, ...]`
  - **Multiline NDJSON**: `{"key": "value"}\n{"key": "value"}`

### 2. Conditional Path Extraction Logic
In the JSON path extraction logic (likely in `FilterRuleService`, `MappingService`, or similar):

```javascript
// Pseudocode
if (isMultiline || isNDJSON) {
  // Parse FIRST line as representative schema
  const firstRecord = parseFirstLine(rawData)
  // Extract paths from single object (no array wrapper)
  paths = extractPaths(firstRecord, '$')
  // Result: $.id, $.name, $.tags[*], etc.
} else if (isArray(parsedData)) {
  // Existing array logic
  paths = extractPaths(parsedData, '$.[*]')
} else {
  // Single object
  paths = extractPaths(parsedData, '$')
}
```

### 3. Update Affected Components

#### Step 4 - Filter Conditions (`Step4_FilterConfig.vue`)
- Method: `extractFieldsFromSampleData()`
- Check `sampleData.isMultiline` flag
- Call appropriate extraction logic based on format
- Update `availableFields` with correct paths

#### Step 6 - Field Mapping (`TransformEditorModal.vue`)
- Method: `extractAvailableJsonPaths()`
- Check `sampleData.isMultiline` flag
- Use `MappingService.extractJsonPaths()` with multiline awareness
- Update `availableJsonPaths` with correct paths

### 4. Vuex State Updates
Ensure the wizard Vuex store has:
```javascript
state: {
  sampleData: {
    rawData: '', // Original input
    parsedData: {}, // or []
    dataStructure: 'single' | 'array' | 'multiline',
    isMultiline: false, // Flag for NDJSON detection
    // ... other properties
  }
}
```

### 5. Schema Merging for Multiline
Since each line in NDJSON might have slightly different fields:
- Parse multiple lines (e.g., first 5-10 records)
- Merge schemas to get all unique field paths
- Example: If line 1 has `{"a": 1}` and line 2 has `{"b": 2}`, show both `$.a` and `$.b`

## Implementation Steps

1. **Step 2 Enhancement**: 
   - Detect multiline format during data upload
   - Set `isMultiline: true` flag in Vuex state
   - Store data structure type: 'single', 'array', or 'multiline'

2. **Service Layer Updates**:
   - Update `FilterRuleService.extractFieldsFromData()` to handle multiline
   - Update `MappingService.extractJsonPaths()` to handle multiline
   - Add helper: `parseMultilineJson(rawData)` to extract first/multiple records

3. **Step 4 Updates**:
   - Check `sampleData.isMultiline` or `sampleData.dataStructure === 'multiline'`
   - Call appropriate extraction logic
   - Verify dropdown shows `$.id` instead of `$.[*].id`

4. **Step 6 Updates**:
   - Same multiline detection logic as Step 4
   - Ensure consistency between Step 4 and Step 6 dropdowns

5. **Testing**:
   - Test with single-line JSON: `{"id": 1}`
   - Test with JSON array: `[{"id": 1}, {"id": 2}]`
   - Test with multiline NDJSON: Each line is separate JSON
   - Verify paths are generated correctly for each format

## Edge Cases to Handle

1. **Empty lines** in multiline data - skip them
2. **Invalid JSON lines** - log warning, continue with valid lines
3. **Mixed schemas** - merge all unique paths from multiple lines
4. **Very large files** - parse only first N lines (e.g., 10-20) for schema detection
5. **Nested arrays** within objects - still use `[*]` for actual array fields like `$.tags[*]`

## Expected Outcome

After fix:
- ✅ Single JSON object → paths like `$.id`, `$.name`
- ✅ JSON array → paths like `$.[*].id`, `$.[*].name` (existing behavior)
- ✅ Multiline NDJSON → paths like `$.id`, `$.name` (NEW FIX)
- ✅ Consistent behavior in both Step 4 (Filter) and Step 6 (Mapping) dropdowns

## Files Likely to Modify

1. **Vuex Store**: `src/store/modules/wizard.js` - Add `isMultiline` flag
2. **Step 2 Component**: Detection and flag setting during data upload
3. **FilterRuleService**: `src/services/wizard/filterRuleService.js` - Extraction logic
4. **MappingService**: `src/services/wizard/mappingService.js` - Path extraction
5. **Step4_FilterConfig.vue**: Use multiline-aware extraction
6. **TransformEditorModal.vue**: Use multiline-aware extraction