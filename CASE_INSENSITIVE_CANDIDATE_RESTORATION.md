# Case-Insensitive Candidate Restoration Fix

## Problem Description
After implementing the case-insensitive deduplication fix in Step 3, a new issue appeared when navigating back to Step 3 from Step 4:

1. User configures policy with `$.Log` (mixed case) as convert-to-JSON field
2. User goes to Step 4, then returns to Step 3
3. `analyzeSampleData()` runs again and rebuilds candidates from sample data
4. Sample data has `$.LOG` (uppercase)
5. UI shows `$.LOG` (incorrect casing) as an unchecked candidate
6. Store still has `$.Log` as the selected field
7. Fanout structure is correct, but the displayed candidate is wrong

## Root Cause
When `analyzeSampleData()` rebuilds the `convertToJsonCandidates` array from sample data, it replaces the entire candidate list with values from the sample data. Even though the validation logic checks if selected fields exist (case-insensitive), it doesn't **replace the candidate items** with the policy/store versions.

Flow:
1. `analyzeSampleData()` runs → candidates = `["$.LOG"]` (from sample)
2. Validation checks: `"$.log"` (lowercased selection) exists in lowercased candidates? Yes
3. Selection is kept as valid
4. BUT: candidate array still has `$.LOG`, not `$.Log`
5. UI renders the candidate list with `$.LOG`

## Solution
After rebuilding candidates from sample data in `analyzeSampleData()`, we now:

1. **Replace candidates with policy/store versions** (case-insensitive match)
   - For each candidate from sample data, check if a selected field matches (case-insensitive)
   - If yes, replace the candidate with the selected field's version
   - This ensures the UI shows the correct casing from the policy/store

2. **Add missing selected fields to candidates**
   - If a selected field doesn't exist in sample data candidates, add it to the list
   - This handles fields that were in the policy but missing from the current sample

## Code Changes

### File: `Step3_SchemaConfig.vue`

**Location:** `analyzeSampleData()` method, after rebuilding candidates

**Added logic:**
```javascript
// Replace candidates with policy/store versions (case-insensitive match)
// This ensures the UI shows the correct casing from the policy/store
const adjustedCandidates = this.convertToJsonCandidates.map(candidate => {
  const candidateLower = candidate.toLowerCase()
  const matchingSelection = this.selectedConvertToJsonFields.find(
    selected => selected.toLowerCase() === candidateLower
  )
  return matchingSelection || candidate
})

// Also add any selected fields that weren't found in candidates (missing from sample)
const candidatesLower = new Set(adjustedCandidates.map(c => c.toLowerCase()))
const missingSelections = this.selectedConvertToJsonFields.filter(
  selected => !candidatesLower.has(selected.toLowerCase())
)

if (missingSelections.length > 0) {
  console.log('Some selections are missing from sample data:', missingSelections)
  adjustedCandidates.push(...missingSelections)
}

this.convertToJsonCandidates = adjustedCandidates
```

## Test Scenarios

### Scenario 1: Return to Step 3 with Case Mismatch
1. Create policy with `$.Log` (mixed case) as convert-to-JSON field
2. Provide sample data with `$.LOG` (uppercase)
3. Enter Step 3 → should show `$.Log` (checked)
4. Go to Step 4
5. Return to Step 3
6. **Expected:** UI shows `$.Log` (checked) - not `$.LOG`
7. **Actual (after fix):** ✅ Shows `$.Log` (checked)

### Scenario 2: Field Missing from Sample Data
1. Create policy with `$.CustomField` as convert-to-JSON field
2. Provide sample data without `$.CustomField`
3. Enter Step 3
4. **Expected:** UI shows `$.CustomField` (checked, marked as missing)
5. Navigate away and back
6. **Expected:** UI still shows `$.CustomField` (checked, marked as missing)
7. **Actual (after fix):** ✅ Shows `$.CustomField` (checked, marked as missing)

### Scenario 3: Multiple Case Variations
1. Create policy with `$.Field1`, `$.field2` (mixed cases)
2. Provide sample data with `$.FIELD1`, `$.FIELD2` (uppercase)
3. Enter Step 3 → should show policy versions (checked)
4. Navigate to Step 4 and back
5. **Expected:** UI shows `$.Field1`, `$.field2` (checked) - not sample data versions
6. **Actual (after fix):** ✅ Shows policy versions (checked)

### Scenario 4: Fanout Structure Preservation
1. Select `$.Log` as convert-to-JSON field (policy has `$.Log`, sample has `$.LOG`)
2. Select child fanout array `$.Log.Events[*]`
3. Navigate to Step 4 and back to Step 3
4. **Expected:** UI shows `$.Log` (checked) with `$.Log.Events[*]` child fanout (checked)
5. **Actual (after fix):** ✅ Fanout structure preserved with correct casing

## Related Fixes
This fix builds on the previous case-insensitive deduplication fix:
- **Previous fix:** Prevented duplicate candidates in `prefillFromPolicy()`
- **This fix:** Ensures candidate list always uses policy/store versions after re-analysis

## Benefits
1. ✅ Consistent UI display regardless of navigation path
2. ✅ Policy/store version always takes precedence over sample data version
3. ✅ Handles missing fields gracefully
4. ✅ Preserves fanout structure with correct casing
5. ✅ No duplicate candidates
6. ✅ Case-insensitive matching throughout

## Verification
After this fix:
- Compile: ✅ No errors
- Navigation: ✅ Forward and backward navigation preserves selections
- Casing: ✅ Policy/store casing always displayed
- Structure: ✅ Fanout arrays and child selections preserved
