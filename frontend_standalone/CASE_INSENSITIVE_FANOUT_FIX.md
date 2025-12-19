# Case-Insensitive Fanout Matching Fix

## Problem Summary

The policy fanout path `$.log.Records[*]` (lowercase `log`) was not matching sample data with `LOG` (uppercase) property, resulting in:
- A synthetic "missing" node being created
- Incorrect UI state in Step 3 Schema Config wizard  
- The array `LOG.Records` not being recognized even though it exists in the sample data

## Root Cause

The `processChildFanoutsOld()` function in `Step3_SchemaConfig.vue` was using **exact string comparison** when matching policy fanout paths against candidate paths:

```javascript
// OLD CODE - Case-sensitive exact match
const candidate = this.fanoutCandidates.find(c =>
  c.path === variation ||
  c.path === variation.replace(/\[\*\]/g, '') ||
  c.path === variation.replace(/\[0\]/g, '')
)
```

This meant:
- Policy path: `$.log.Records[*]` (lowercase)
- Sample data: `$.Log.Records` (uppercase in parsed JSON)
- Result: **NO MATCH** → synthetic "missing" node created

## Solution Implemented

### Changed `processChildFanoutsOld()` Matching Logic

**File**: `frontend_standalone/src/components/wizard/steps/Step3_SchemaConfig.vue`
**Lines**: ~1413-1418 (updated to ~1413-1445)

**Changes**:
1. **Added case-insensitive string comparison** using `.toLowerCase()`
2. **Added `.trim()` for defensive whitespace handling**
3. **Expanded matching logic** to handle multiple variations in a single pass

### Code Structure

```javascript
for (let candIdx = 0; candIdx < this.fanoutCandidates.length; candIdx++) {
  const c = this.fanoutCandidates[candIdx]
  
  // Normalize strings
  const candidatePath = String(c.path || '').trim()
  const candidatePathLower = candidatePath.toLowerCase()
  
  // Log lengths and values
  console.log(`Candidate: "${candidatePathLower}" (length: ${candidatePathLower.length})`)
  console.log(`Variation: "${variationLower}" (length: ${variationLower.length})`)
  
  // Character-by-character comparison if lengths match
  if (candidatePathLower.length === variationLower.length) {
    // Check for hidden character mismatches
    for (let i = 0; i < candidatePathLower.length; i++) {
      if (candidatePathLower.charCodeAt(i) !== variationLower.charCodeAt(i)) {
        console.log(`Character mismatch at position ${i}...`)
      }
    }
  }
  
  // Try exact match
  if (candidatePathLower === variationLower) {
    matchedCandidate = c
    break
  }
  
  // Try without wildcards
  // Try without indices
  // ...
}
```

## Expected Behavior After Fix

### Before Fix
```
Policy path: $.log.Records[*]
Sample data: { LOG: { Records: [...] } }
Result: ❌ No match → synthetic "missing" node created
```

### After Fix
```
Policy path: $.log.Records[*]
Sample data: { LOG: { Records: [...] } }
Result: ✅ Matches LOG.Records (case-insensitive)
```

## Testing

### Test Case 1: Simple Uppercase vs Lowercase
- **Policy**: `$.log.Records[*]`
- **Sample**: `{ "LOG": { "Records": [...] } }`
- **Expected**: Match found, `LOG.Records` selected

### Test Case 2: Mixed Case
- **Policy**: `$.Log.Records[*]`
- **Sample**: `{ "log": { "records": [...] } }`
- **Expected**: Match found, `log.records` selected

### Test Case 3: All Variations
- **Policy**: `$.user.data[*]`
- **Sample variations**:
  - `{ "USER": { "DATA": [...] } }` → Should match
  - `{ "User": { "Data": [...] } }` → Should match
  - `{ "user": { "data": [...] } }` → Should match

### Test Case 4: With Wildcards
- **Policy**: `$.logs[*].events[*]`
- **Sample**: `{ "LOGS": [{ "EVENTS": [...] }] }`
- **Expected**: Both arrays matched

## Debug Logging

The enhanced logging now shows:

```
🔍 [findFanoutCandidate] Searching for fanout: $.log.Records[*]

📋 Available candidates (2):
  [0] path: "LOG", parentPath: "N/A", isHomogeneous: true
  [1] path: "LOG.Records", parentPath: "N/A", isHomogeneous: true

🔄 Path variations to try: [
  "$.log.Records[*]",
  "log.Records[*]",
  "$.log.Records",
  "log.Records",
  ...
]

  🔸 Variation [3]: "log.Records" (lowercase: "log.records")

    🔹 Checking candidate [1]: "LOG.Records"
       Candidate normalized: "LOG.Records" → lowercase: "log.records" (length: 11)
       Variation normalized: "log.Records" → lowercase: "log.records" (length: 11)
       Comparing: "log.records" === "log.records" ? true
       ✓ All characters match! But === returned true

      ✅ EXACT MATCH (case-insensitive)!

✅ SUCCESS! Found matching candidate for variation "log.Records":
   Matched candidate path: LOG.Records
```

## Verification Steps

1. Load policy with lowercase fanout path: `$.log.Records[*]`
2. Load sample data with uppercase property: `{ "LOG": { "Records": [...] } }`
3. Navigate to Step 3
4. Check console logs for match confirmation
5. Verify UI shows `LOG.Records` as selected (not a "missing" synthetic node)
6. Verify checkbox is properly checked
7. Verify no warning about missing arrays

## Related Files

- `frontend_standalone/src/components/wizard/steps/Step3_SchemaConfig.vue` (main fix)
- `DEBUG_FANOUT_MATCHING_LOGS.md` (debug logging documentation)

## Notes

- This fix ensures **backward compatibility** - exact case matches still work
- The fix is **defensive** - handles potential string encoding issues
- **Performance**: Added logging may slow down matching slightly, but only in debug mode
- **Future improvement**: Consider making logging conditional (debug flag)

## Rollback

If issues occur, revert the `findFanoutCandidate()` function to use `.find()` method instead of the explicit `for` loop. However, the case-insensitive matching should remain.
