# Normal JSON Field Dropdown Fix - JSONPath Notation for Multiline NDJSON

## Problem Summary
Normal JSON attributes in multiline NDJSON data were appearing with incorrect JSONPath notation in the Step 4 field dropdown.

### Symptoms
- Fields showing as `$[*].recordId`, `$[*].title` instead of `$.recordId`, `$.title`
- Console logs showed:
  ```
  [FilterRuleService] Found 3 sample values for field '$[*].recordId': (3) ['601', '602', '603']
  [FilterRuleService] Found 3 sample values for field '$[*].title': (3) ['PayloadOne', 'PayloadTwo', 'PayloadThree']
  [FilterRuleService] Detected multiline NDJSON array, using first element for structure traversal
  ```

### What Was Working
- Stringified JSON fields (from Step 3's "Convert to JSON" selections) were showing correctly
- Example: `$.configString.version`, `$.settingsBlob.build`

## Root Cause Analysis

### Understanding the Data Flow

1. **DataProcessor (dataProcessingService.js)**
   - When parsing multiline NDJSON, stores data as an array of objects
   - The `analyzeDataStructure` method creates paths like `$[0].recordId`, `$[0].title`
   - This is because it traverses the array and creates paths for each element

2. **FilterRuleService (filterRuleService.js)**
   - Line 134: Normalizes paths by converting `[0]` to `[*]`:
     ```javascript
     const normalizedPath = node.path.replace(/\[\d+\]/g, '[*]')
     ```
   - This converted `$[0].recordId` ’ `$[*].recordId`

### The Conceptual Error

**Multiline NDJSON Semantics:**
- Each line/record is an independent JSON object
- Records are processed individually, not as an array
- Fields should use `$.fieldName` notation (relative to each record)
- The `[*]` notation should ONLY be used for actual nested arrays WITHIN each record

**Example:**
```json
{"recordId": "601", "title": "PayloadOne", "items": [1, 2, 3]}
{"recordId": "602", "title": "PayloadTwo", "items": [4, 5, 6]}
{"recordId": "603", "title": "PayloadThree", "items": [7, 8, 9]}
```

Correct JSONPath notation:
-  `$.recordId` - top-level field in each record
-  `$.title` - top-level field in each record
-  `$.items[*]` - array WITHIN each record
- L `$[*].recordId` - incorrect for NDJSON (implies filtering an array)

## Solution Implementation

### Changes Made to `/src/services/wizard/filterRuleService.js`

#### 1. Path Adjustment for Multiline NDJSON (Lines 197-207)
Added logic to detect and adjust paths for multiline NDJSON data:

```javascript
// For multiline NDJSON, we need to adjust the dataStructure to use $. notation instead of $[*].
// This is because in NDJSON, each record is processed independently, not as an array.
let adjustedDataStructure = dataStructure
if (isMultilineNdjson && dataStructure.type === 'array' && dataStructure.children && dataStructure.children.length > 0) {
  // Take the first child's structure and adjust its path to start with $ instead of $[0]
  const firstChild = dataStructure.children[0]
  if (firstChild && firstChild.path && firstChild.path.startsWith('$[0]')) {
    console.log('[FilterRuleService] Adjusting paths for multiline NDJSON: converting $[0]. to $.')
    adjustedDataStructure = this._adjustPathsForNdjson(firstChild)
  }
}
```

**Why this works:**
- Detects multiline NDJSON by checking if data is an array
- Takes the first element's structure (which has `$[0].` paths)
- Adjusts all paths to use `$.` notation instead
- This happens BEFORE the normalization step, so `[0]` never gets converted to `[*]`

#### 2. Path Adjustment Helper Method (Lines 289-318)
Added `_adjustPathsForNdjson` method to recursively convert paths:

```javascript
static _adjustPathsForNdjson (structure) {
  if (!structure) return structure

  // Clone the structure to avoid mutations
  const adjusted = { ...structure }

  // Adjust the path: convert $[0] to $ and $[0]. to $.
  if (adjusted.path) {
    adjusted.path = adjusted.path.replace(/^\$\[0\]\.?/, '$.')
    // Also handle cases where path is exactly $[0]
    if (adjusted.path === '$[0]') {
      adjusted.path = '$'
    }
  }

  // Recursively adjust children
  if (adjusted.children && Array.isArray(adjusted.children)) {
    adjusted.children = adjusted.children.map(child => this._adjustPathsForNdjson(child))
  }

  return adjusted
}
```

**Path transformations:**
- `$[0].recordId` ’ `$.recordId`
- `$[0].title` ’ `$.title`
- `$[0].config.version` ’ `$.config.version`
- `$[0].items[0]` ’ `$.items[0]` (then normalized to `$.items[*]`)

#### 3. Sample Value Extraction Fix (Lines 629-638)
Fixed `_getSampleValuesForField` to properly handle multiline NDJSON:

```javascript
} else {
  // Simple path without array notation (e.g., $.field)
  // For multiline NDJSON (root array), iterate through all records
  // For single objects, wrap in array for consistent processing
  if (Array.isArray(data)) {
    records = data.slice(0, CONSTANTS.MAX_TEST_RECORDS)
  } else {
    records = [data]
  }
  fieldName = fieldPath.replace(/^\$\.?/, '')
}
```

**Before:**
```javascript
records = [data]  // Wrapped entire array in another array
```

**After:**
```javascript
if (Array.isArray(data)) {
  records = data.slice(0, CONSTANTS.MAX_TEST_RECORDS)  // Use array elements directly
} else {
  records = [data]  // Wrap single object
}
```

**Why this matters:**
- For multiline NDJSON with path `$.recordId`, we need to extract `recordId` from EACH record
- Old code: `records = [data]` ’ `[[{record1}, {record2}, {record3}]]` ’ tried to access `recordId` on the array itself L
- New code: `records = data` ’ `[{record1}, {record2}, {record3}]` ’ accesses `recordId` on each record 

## Expected Behavior After Fix

### Console Output
```
[FilterRuleService] Detected multiline NDJSON array, using first element for structure traversal
[FilterRuleService] Adjusting paths for multiline NDJSON: converting $[0]. to $.
[FilterRuleService] Found 3 sample values for field '$.recordId': (3) ['601', '602', '603']
[FilterRuleService] Found 3 sample values for field '$.title': (3) ['PayloadOne', 'PayloadTwo', 'PayloadThree']
```

### Field Dropdown Display
-  `@.recordId` (path: `$.recordId`)
-  `@.title` (path: `$.title`)
-  `@.configString.version` (path: `$.configString.version`) - from stringified JSON
-  `@.items[*]` (path: `$.items[*]`) - for nested arrays within records

### Filter Expression Generation
When user creates a filter condition:
- Field: `@.recordId`
- Operator: `==`
- Value: `601`

Generated expression:
```
@.recordId == '601'
```

This will correctly filter each NDJSON record where `recordId` equals '601'.

## Testing Recommendations

### Test Case 1: Multiline NDJSON with Top-Level Fields
**Input:**
```json
{"recordId": "601", "title": "PayloadOne"}
{"recordId": "602", "title": "PayloadTwo"}
{"recordId": "603", "title": "PayloadThree"}
```

**Expected:**
- Fields show as `@.recordId`, `@.title`
- Sample values extracted correctly for each field
- Filter expressions use `@.recordId`, not `@[*].recordId`

### Test Case 2: Multiline NDJSON with Nested Arrays
**Input:**
```json
{"recordId": "601", "items": [{"id": 1}, {"id": 2}]}
{"recordId": "602", "items": [{"id": 3}, {"id": 4}]}
```

**Expected:**
- Top-level fields: `@.recordId` (no `[*]`)
- Nested arrays: `@.items[*].id` (with `[*]` for the nested array)

### Test Case 3: Multiline NDJSON with Stringified JSON
**Input:**
```json
{"recordId": "601", "configString": "{\"version\": \"1.0\"}"}
{"recordId": "602", "configString": "{\"version\": \"2.0\"}"}
```

**After Step 3 "Convert to JSON":**
- Normal fields: `@.recordId`
- Stringified fields: `@.configString.version`
- All use `$.` notation, none use `$[*].`

### Test Case 4: Single JSON Object (Non-NDJSON)
**Input:**
```json
{"recordId": "601", "title": "PayloadOne"}
```

**Expected:**
- Fields still show as `@.recordId`, `@.title`
- No path adjustment needed (already using `$.` notation)
- Sample values work correctly

## Related Files

- **Fixed File:** `/src/services/wizard/filterRuleService.js`
- **Data Structure Source:** `/src/services/wizard/dataProcessingService.js` (analyzeDataStructure method)
- **Affected Component:** `/src/components/wizard/steps/Step4_FilterConfig.vue`

## Additional Notes

### Why Stringified JSON Fields Were Working
Stringified JSON field extraction (Step 3) uses a different code path:
- Line 224-236 in filterRuleService.js
- Calls `_extractNestedFieldsFromJsonString` which builds paths from scratch
- Starts with the parent field path (e.g., `$.configString`)
- Appends nested fields (e.g., `.version`)
- Result: `$.configString.version` (no `[*]` involved)

### Future Considerations
If the system needs to support filtering on actual JSON arrays (not NDJSON), we may need to:
1. Add a data type detection step to distinguish between:
   - Multiline NDJSON (array of independent records)
   - Single JSON with nested array (one record with array field)
2. Apply path adjustment only for true NDJSON, not for nested arrays

### Performance Impact
- Minimal: Path adjustment is a one-time operation during field extraction
- Recursive structure cloning is limited by MAX_FIELD_DEPTH (10 levels)
- Sample value extraction limit already in place (MAX_TEST_RECORDS: 1000)

## Verification Steps

1. Upload multiline NDJSON data in Step 2
2. Navigate to Step 4 (Filter Rules)
3. Check field dropdown - should show `@.fieldName` notation
4. Check browser console - paths should show as `$.fieldName`
5. Create filter conditions - expressions should use `@.fieldName`
6. Test filter against sample data - should match records correctly

## Conclusion

This fix ensures that multiline NDJSON data is handled with correct JSONPath semantics, where each record is processed independently using `$.fieldName` notation rather than treating the entire dataset as an array with `$[*].fieldName` notation. This aligns with how NDJSON is conceptually structured and how filtering operations will be applied in the LogRhythm SMA policy.
