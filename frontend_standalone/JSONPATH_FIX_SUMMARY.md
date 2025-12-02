# JSONPath Notation Fix Summary

## Issue
Normal JSON fields in multiline NDJSON were showing with incorrect `$[*].` notation instead of `$.` notation in Step 4 field dropdown.

## Root Cause
- DataProcessor creates paths like `$[0].recordId` for array elements
- FilterRuleService normalized these to `$[*].recordId`
- But for NDJSON, each record is independent - should use `$.recordId`

## Solution
Added logic to detect multiline NDJSON and adjust paths:
1. Convert `$[0].` → `$.` for top-level fields
2. Keep `[*]` only for actual nested arrays within records
3. Fix sample value extraction to iterate through array records

## Files Modified
- `/src/services/wizard/filterRuleService.js`
  - Added `_adjustPathsForNdjson()` helper method
  - Modified path adjustment logic (lines 197-209)
  - Fixed sample value extraction (lines 629-638)

## Testing
```json
{"recordId": "601", "title": "PayloadOne"}
{"recordId": "602", "title": "PayloadTwo"}
```

**Before:** `$[*].recordId`, `$[*].title`
**After:** `$.recordId`, `$.title` ✅

## Documentation
See `NORMAL_JSON_FIELD_DROPDOWN_FIX_DETAILED.md` for comprehensive details.
