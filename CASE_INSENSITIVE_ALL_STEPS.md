# Case-Insensitive Property Access Across All Wizard Steps

## Overview
This document describes the implementation of case-insensitive property access across all wizard steps (Steps 3-7) to handle policy files with varying property name casing.

## Implementation Date
December 16, 2025

## Problem Statement
Policy JSON files can have properties with different casing conventions:
- `filter` vs `Filter`
- `transforms` vs `Transforms`
- `subtransforms` vs `SubTransforms`
- `convertoJson` vs `ConvertoJson`
- `inputRule` vs `InputRule`
- `LRSchemaField` vs `lrSchemaField`

Previously, the wizard steps accessed these properties directly, causing failures when the casing didn't match expectations.

## Solution
Added a `getCaseInsensitiveProperty()` helper function to each wizard step component that:
1. First attempts an exact property match
2. Falls back to case-insensitive matching if exact match fails
3. Returns `undefined` if property is not found

## Files Modified

### 1. Step 3: Schema Configuration (`Step3_SchemaConfig.vue`)
**Changes:**
- Added `getCaseInsensitiveProperty()` helper function
- Updated `prefillFromPolicy()` to use case-insensitive access for:
  - `convertoJson` / `ConvertoJson`
  - `fanout` / `Fanout`
  - `inputField` / `InputField`
  - `childfanouts` / `ChildFanouts`
- Updated `processChildFanoutsNew()` to use case-insensitive access for:
  - `field` / `Field`
  - `parentpath` / `ParentPath`

**Status:** ✅ Implemented and verified

### 2. Step 4: Filter Configuration (`Step4_FilterConfig.vue`)
**Changes:**
- Added `getCaseInsensitiveProperty()` helper function
- Updated `prefillFromPolicy()` to use case-insensitive access for:
  - `filter` / `Filter`

**Status:** ✅ Implemented and verified

### 3. Step 5: Field Mapping (`Step5_Mapping.vue`)
**Changes:**
- Added `getCaseInsensitiveProperty()` helper function
- Updated `prefillFromPolicy()` to use case-insensitive access for:
  - `transforms` / `Transforms`
  - `inputRule` / `InputRule`
  - `LRSchemaField` / `lrSchemaField`
  - `type` / `Type`
  - `format` / `Format`
  - `default` / `Default`
  - `alternativeFields` / `AlternativeFields`
  - `FanoutParentElement` / `fanoutParentElement`

**Status:** ✅ Implemented and verified

### 6. Step 6: SubTransform Configuration (`Step6_SubTransformConfig.vue`)
**Changes:**
- Added `getCaseInsensitiveProperty()` helper function
- Updated `prefillFromPolicy()` to use case-insensitive access for:
  - `subtransforms` / `SubTransforms`
  - `condition` / `Condition`
  - `exitonmatch` / `ExitOnMatch`
  - `transforms` / `Transforms`
  - `FanoutParentElement` / `fanoutParentElement`
  - `inputRule` / `InputRule`
  - `LRSchemaField` / `lrSchemaField`
  - `type` / `Type`
  - `default` / `Default`
  - `alternativeFields` / `AlternativeFields`
  - `format` / `Format`
  - `subtransforms` / `SubTransforms` (nested)

**Status:** ✅ Implemented and verified

### 7. Step 7: Export (`Step7_Export.vue`)
**Changes:**
- Added `getCaseInsensitiveProperty()` helper function
- Ready for future case-insensitive property access needs during policy generation/export

**Status:** ✅ Implemented and verified

## Helper Function Implementation

```javascript
/**
 * Helper function to get a property from an object in a case-insensitive manner
 * @param {Object} obj - The object to search
 * @param {string} key - The property name to find (case-insensitive)
 * @returns {*} - The value of the property, or undefined if not found
 */
getCaseInsensitiveProperty (obj, key) {
  if (!obj || typeof obj !== 'object') {
    return undefined
  }

  // First try exact match
  if (key in obj) {
    return obj[key]
  }

  // Try case-insensitive match
  const lowerKey = key.toLowerCase()
  const foundKey = Object.keys(obj).find(k => k.toLowerCase() === lowerKey)
  return foundKey ? obj[foundKey] : undefined
}
```

## Usage Examples

### Step 3 - Schema Configuration
```javascript
// OLD (case-sensitive)
const convertToJsonFields = schemaRule.convertoJson || schemaRule.ConvertoJson || []

// NEW (case-insensitive)
const convertToJsonFields = this.getCaseInsensitiveProperty(schemaRule, 'convertoJson') || []
```

### Step 4 - Filter Configuration
```javascript
// OLD (case-sensitive)
const filterExpression = policyData?.filter || policyData?.Filter || ''

// NEW (case-insensitive)
const filterExpression = this.getCaseInsensitiveProperty(policyData, 'filter') || ''
```

### Step 5 - Field Mapping
```javascript
// OLD (case-sensitive)
const transforms = policyData?.transforms || policyData?.Transforms || []

// NEW (case-insensitive)
const transforms = this.getCaseInsensitiveProperty(policyData, 'transforms') || []
```

### Step 6 - SubTransform Configuration
```javascript
// OLD (case-sensitive)
const subtransforms = policyData?.subtransforms || []

// NEW (case-insensitive)
const subtransforms = this.getCaseInsensitiveProperty(policyData, 'subtransforms') || []
```

## Benefits

1. **Robustness**: Handles policy files with any property casing convention
2. **Flexibility**: Works with:
   - camelCase (e.g., `convertoJson`)
   - PascalCase (e.g., `ConvertoJson`)
   - Mixed casing (e.g., `CONVERTOjson`)
3. **Backward Compatibility**: Maintains support for existing policies
4. **Consistency**: Same helper function pattern across all steps
5. **Future-Proof**: Easy to extend to additional properties

## Testing Scenarios

All steps now support policies with:
- ✅ Lowercase properties (`filter`, `transforms`, `subtransforms`)
- ✅ Uppercase properties (`FILTER`, `TRANSFORMS`, `SUBTRANSFORMS`)
- ✅ PascalCase properties (`Filter`, `Transforms`, `SubTransforms`)
- ✅ camelCase properties (`convertoJson`, `inputRule`, `lrSchemaField`)
- ✅ Mixed casing in any combination

## Compilation Status

- **Step 3**: ✅ No errors
- **Step 4**: ✅ No errors
- **Step 5**: ✅ No errors (1 pre-existing CSS lint warning unrelated to changes)
- **Step 6**: ✅ No errors
- **Step 7**: ✅ No errors

## Related Documentation

- [CASE_INSENSITIVE_VALIDATION_FIX.md](./CASE_INSENSITIVE_VALIDATION_FIX.md) - Policy validator case-insensitive changes
- [JAVASCRIPT_COMMENT_SUPPORT.md](./JAVASCRIPT_COMMENT_SUPPORT.md) - JavaScript comment stripping feature

## Notes

- The `getCaseInsensitiveProperty()` helper is implemented as a component method in each step
- Exact property name matches are prioritized over case-insensitive matches for performance
- The helper returns `undefined` for missing properties, allowing fallback to default values
- All nested property access within objects also uses the helper for complete coverage
