# Nested Fanout Array Detection Fix

## Problem

The system was not detecting nested fanout arrays like `$.requestParameters.changeBatch.changes[*]` when they were inside a parent fanout array like `$.log.Records[*]`.

## Root Cause

The fanout array hierarchy works as follows:
- **Index 0**: Root/parent array (e.g., `$.log.Records[*]`)
- **Index 1+**: Child arrays with **relative paths** from inside the parent array context

For example, in the AWS CloudTrail policy:
```json
"fanout": {
  "inputField": [
    "$.log.Records[*]",                              // Index 0: Parent array
    "$.requestParameters.changeBatch.changes[*]"     // Index 1: Child array (relative to Records)
  ]
}
```

The path `$.requestParameters.changeBatch.changes[*]` is **relative to each element** within `$.log.Records[*]`.

The absolute path would be:
```
$.log.Records[*].requestParameters.changeBatch.changes[*]
```

But the policy stores the child array as a **relative path** starting from the parent fanout context.

## Solution

### 1. Enhanced Array Detection (`schemaRuleService.js`)

Updated `_findArrayPathsInParsedJson()` to:

1. **Detect root-level arrays** in parsed JSON fields (e.g., `Records[*]` inside `$.log`)
2. **Traverse into array elements** to find nested arrays
3. **Store nested arrays with relative paths** (e.g., `$.requestParameters.changeBatch.changes[*]`)
4. **Track parent-child relationships** using `isNestedFanout` flag and `parentPath` property

Key improvements:
- Added `traverseObject()` helper to recursively search inside array elements
- Added `isNestedFanout` flag to distinguish nested arrays from root arrays
- Properly constructs relative paths for nested arrays
- Maintains parent array reference for UI display

### 2. Enhanced UI Display (`Step3_SchemaConfig.vue`)

Updated the component to:

1. **Display nested fanout indicator** with an orange badge showing "Nested Fanout"
2. **Show parent array reference** in the array info caption
3. **Provide helpful tooltip** explaining nested fanout processing

### 3. Visual Indicators

The UI now shows:
- **Purple badge** "Parsed JSON" - for arrays found in stringified JSON fields
- **Orange badge** "Nested Fanout" - for arrays nested within other fanout arrays
- **Caption info** - showing parent array relationship and array characteristics

## Expected Behavior

When the user:
1. Selects `$.log` for "Convert to JSON"
2. The system parses the JSON and discovers:
   - `$.log.Records[*]` (root array)
   - `$.requestParameters.changeBatch.changes[*]` (nested array, relative to Records)

Both arrays will now appear in the fanout tree selection, with the nested array properly marked.

## Testing

To test with the AWS CloudTrail sample:

1. **Upload the sample data**: `cloudtrail_parsing_action_mult_STRINGIFIED.json`
2. **Step 2**: Parse the data
3. **Step 3**: 
   - Select `$.log` for "Convert to JSON"
   - Verify both arrays appear:
     - ✓ `$.log.Records[*]`
     - ✓ `$.requestParameters.changeBatch.changes[*]` (marked as nested)
   - Select both arrays for fanout processing

## Policy Schema

The resulting policy will have:
```json
"schemaRule": {
  "fanout": {
    "inputField": [
      "$.log.Records[*]",                              // Parent array (index 0)
      "$.requestParameters.changeBatch.changes[*]"     // Child array (index 1, relative to parent)
    ]
  },
  "convertoJson": [
    "$.log"
  ]
}
```

## Processing Logic

When processing logs with this schema:

1. Parse `$.log` string to JSON
2. Fanout `Records[*]` array → creates N records (one per Record element)
3. For each Record, fanout `$.requestParameters.changeBatch.changes[*]` → creates M sub-records
4. Result: N × M total records processed

For the sample data:
- 1 Record in `Records[*]`
- 3 changes in `changes[*]` 
- Result: **3 total records** (1 × 3)

## Files Changed

1. **schemaRuleService.js**
   - Enhanced `_findArrayPathsInParsedJson()` method
   - Added nested array detection logic
   - Added relative path construction

2. **Step3_SchemaConfig.vue**
   - Enhanced `getArrayFieldInfo()` to show nested fanout info
   - Added visual badge for nested fanout arrays
   - Added tooltip explaining nested fanout behavior

## Related Issues

- Fixes nested fanout array detection
- Improves relative path handling in multi-level fanout scenarios
- Enhances UI to clearly indicate parent-child array relationships
