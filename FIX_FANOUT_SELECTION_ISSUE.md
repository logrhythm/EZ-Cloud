# Fix: Fanout Array Not Getting Selected from Policy File

## Issue
When uploading a policy file (e.g., `gsuite.json`) in **Update mode**, the fanout array defined in the policy was not being automatically selected in Step 3 (Schema Configuration), even though it existed in the sample data.

### Symptoms
- Console log showed: `[Step 3] Update mode but no policy schemaRule found`
- The `prefillFromPolicy()` method was never being called
- The fanout array `$.response.events[*]` from the policy was not pre-selected in the UI

## Root Cause
In the `mounted()` hook of `Step3_SchemaConfig.vue`, the code was checking for `policyData.schemaRule` with **case-sensitive** property access:

```javascript
if (policyData && policyData.schemaRule) {
  // This fails when the policy uses "schemarule" (lowercase 'r')
  await this.prefillFromPolicy(policyData.schemaRule)
}
```

However, the `gsuite.json` policy file uses **lowercase `schemarule`**:
```json
{
  "schemarule": {
    "fanout": {
      "InputField": [ "$.response.events[*]" ]
    }
  }
}
```

This caused the condition to fail, preventing `prefillFromPolicy()` from being called.

## Solution
Updated the `mounted()` hook to use **case-insensitive property access** with the existing `getCaseInsensitiveProperty` helper function:

```javascript
if (policyData) {
  // Use case-insensitive property access for schemaRule
  const schemaRule = getCaseInsensitiveProperty(policyData, 'schemaRule')
  
  if (schemaRule) {
    console.log('[Step 3] Update mode detected with policy data - initiating pre-fill')
    await this.prefillFromPolicy(schemaRule)
  } else {
    console.log('[Step 3] Update mode but no policy schemaRule found')
  }
}
```

## Files Modified
- `frontend_standalone/src/components/wizard/steps/Step3_SchemaConfig.vue`
  - Updated `mounted()` hook to use case-insensitive property access when checking for `schemaRule`

## Testing
The fix now handles both:
- ✅ `schemaRule` (PascalCase with uppercase 'R')
- ✅ `schemarule` (lowercase)
- ✅ `SCHEMARULE` (all uppercase)
- ✅ Any other casing variation

### Expected Behavior After Fix
1. When uploading `gsuite.json` in Update mode
2. Navigate to Step 3 (Schema Configuration)
3. The fanout array `$.response.events` should be **automatically pre-selected**
4. Console should show:
   ```
   [Step 3] Update mode detected with policy data - initiating pre-fill
   [Step 3] === USING OLD IMPLEMENTATION (fanout.inputField) ===
   [Step 3] ✅ Added fanout path to selections: $.response.events
   ```

## Related Changes
This fix complements the earlier case-insensitive implementations:
- `getCaseInsensitiveProperty()` helper function (already existed in Step 3)
- Case-insensitive access for `fanout`, `inputField`, `childfanouts` (already implemented)
- Case-insensitive validation in `policyValidator.js` (already implemented)

## Date
December 16, 2025
