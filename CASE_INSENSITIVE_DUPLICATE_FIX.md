# Case-Insensitive Duplicate Fix for Convert-to-JSON Candidates

## Problem Statement

When loading a policy file in Update mode, duplicate convert-to-JSON candidates appeared in the UI when the policy and sample data used different casing for the same field. For example:

- Sample data contains: `$.LOG` (uppercase)
- Policy references: `$.Log` (title case)
- **Result**: Both `$.LOG` and `$.Log` appeared in the UI as separate candidates

This caused confusion and incorrect behavior because:
1. Only one version should be displayed (the policy version takes precedence)
2. The wrong version might be selected
3. Users see duplicate candidates that represent the same logical field

## Root Cause

The issue occurred in the `prefillFromPolicy` method in `Step3_SchemaConfig.vue`:

1. **Sample Data Analysis** (`analyzeSampleData`):
   - `SchemaRuleService.analyzeSampleDataWithMultiLineSupport` calls `DataProcessor.findStringifiedJsonFields`
   - This traverses the sample data and generates candidates based on the actual casing in the sample data
   - Example: If sample data has `LOG`, it generates `$.LOG`

2. **Policy Prefill** (`prefillFromPolicy`):
   - Reads the policy's `convertToJson` array (e.g., `["$.Log"]`)
   - Checked if the field exists in `convertToJsonCandidates` using **case-sensitive** comparison
   - Since `$.Log` !== `$.LOG`, it was treated as a new candidate and added to the array
   - **Result**: Both `$.LOG` and `$.Log` in the candidates array

## Solution

Implemented **case-insensitive deduplication** in `prefillFromPolicy`:

### 1. Case-Insensitive Duplicate Detection

When processing fields from the policy, we now:

1. Check for **exact match** first (preferred)
2. Check for **case-insensitive match** (to detect duplicates)
3. If a case-insensitive duplicate is found:
   - **Replace** the existing candidate with the policy version
   - This ensures only one version appears in the UI
   - The policy version takes precedence (more authoritative)

```javascript
// Check for EXACT match first
const exactMatchIndex = this.convertToJsonCandidates.indexOf(fieldPath)

// Check for CASE-INSENSITIVE match (to handle duplicates like $.LOG vs $.Log)
const normalizedFieldPath = fieldPath.toLowerCase()
const caseInsensitiveMatchIndex = this.convertToJsonCandidates.findIndex(
  candidate => candidate.toLowerCase() === normalizedFieldPath
)

if (exactMatchIndex !== -1) {
  // Exact match - use as-is
  fieldsToSelect.push(fieldPath)
} else if (caseInsensitiveMatchIndex !== -1) {
  // Case-insensitive duplicate - REPLACE with policy version
  this.convertToJsonCandidates.splice(caseInsensitiveMatchIndex, 1, fieldPath)
  fieldsToSelect.push(fieldPath)
} else {
  // Not found - add new candidate
  this.convertToJsonCandidates.push(fieldPath)
  fieldsToSelect.push(fieldPath)
}
```

### 2. Case-Insensitive Selection Validation

Updated the selection validation in `analyzeSampleData` to use case-insensitive comparison:

```javascript
// Before: Case-sensitive validation
const validSelections = this.selectedConvertToJsonFields.filter(field =>
  this.convertToJsonCandidates.includes(field)
)

// After: Case-insensitive validation
const validSelections = this.selectedConvertToJsonFields.filter(field => {
  const normalizedField = field.toLowerCase()
  return this.convertToJsonCandidates.some(candidate => 
    candidate.toLowerCase() === normalizedField
  )
})
```

## Behavior After Fix

### Scenario 1: Policy and Sample Data Use Different Casing

**Sample Data:**
```json
{
  "LOG": "{\"user\":\"admin\",\"action\":\"login\"}"
}
```

**Policy:**
```json
{
  "convertToJson": ["$.Log"]
}
```

**Before Fix:**
- Candidates: `["$.LOG", "$.Log"]`
- Selection: `["$.Log"]`
- User sees both options, causing confusion

**After Fix:**
- Candidates: `["$.Log"]` (policy version replaces sample data version)
- Selection: `["$.Log"]`
- User sees only one option, correctly selected

### Scenario 2: Policy and Sample Data Use Same Casing

**Sample Data:**
```json
{
  "Log": "{\"user\":\"admin\",\"action\":\"login\"}"
}
```

**Policy:**
```json
{
  "convertToJson": ["$.Log"]
}
```

**Behavior:**
- Candidates: `["$.Log"]`
- Selection: `["$.Log"]`
- No change needed, works as before

### Scenario 3: Policy References Missing Field (Different Case)

**Sample Data:**
```json
{
  "LOG": "{\"user\":\"admin\",\"action\":\"login\"}"
}
```

**Policy:**
```json
{
  "convertToJson": ["$.log"]
}
```

**Behavior:**
- The `checkFieldExistsInSampleData` method uses **case-insensitive** property access
- Field is found in sample data (even though casing differs)
- Candidates: `["$.log"]` (policy version replaces sample data version)
- Selection: `["$.log"]`
- No warning displayed (field exists)

## Files Modified

### `Step3_SchemaConfig.vue`

#### Location 1: `prefillFromPolicy` method (lines ~1200-1230)
- **Change**: Added case-insensitive duplicate detection and replacement
- **Purpose**: Prevent duplicate candidates when policy and sample data use different casing

#### Location 2: `analyzeSampleData` method (lines ~860-880)
- **Change**: Updated selection validation to use case-insensitive comparison
- **Purpose**: Ensure selections remain valid even when candidate casing changes

## Testing Recommendations

### Test Case 1: Different Casing in Policy vs Sample Data
1. Load sample data with field `LOG` containing stringified JSON
2. Load policy with `convertToJson: ["$.Log"]`
3. **Expected**: Only `$.Log` appears in candidates, correctly selected

### Test Case 2: Multiple Fields with Mixed Casing
1. Sample data: `{ "LOG": "...", "data": "...", "Message": "..." }`
2. Policy: `{ "convertToJson": ["$.Log", "$.DATA", "$.message"] }`
3. **Expected**: Each field appears once with policy casing, all selected

### Test Case 3: Sample Data Refresh with Different Casing
1. Load policy with `convertToJson: ["$.Log"]`
2. Load sample data with `LOG` field
3. Refresh sample data (same field but maybe different case)
4. **Expected**: Selection persists, no duplicates appear

### Test Case 4: Manual Selection Then Policy Load
1. Manually select `$.LOG` from candidates
2. Load policy with `convertToJson: ["$.Log"]`
3. **Expected**: Candidate updates to `$.Log`, selection persists

## Related Documentation

- `CASE_INSENSITIVE_COMPREHENSIVE_AUDIT.md` - Complete audit of all case-insensitive property access
- `CASE_INSENSITIVE_VALIDATION_FIX.md` - Earlier fixes for case-insensitive validation
- `CASE_INSENSITIVE_ALL_STEPS.md` - Step-by-step audit process

## Summary

The fix ensures that:
1. ✅ Only one version of each field appears in the UI (no duplicates)
2. ✅ The policy version takes precedence over sample data version
3. ✅ Case-insensitive matching works consistently throughout the component
4. ✅ Selections remain valid when casing changes
5. ✅ Users have a clear, unambiguous UI without confusion

This completes the case-insensitive implementation for Step 3, ensuring robust handling of field name casing variations between policy files and sample data.
