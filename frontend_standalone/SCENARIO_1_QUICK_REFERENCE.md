# Scenario 1: Quick Reference Guide

## Implementation Overview

**Feature:** Handle missing "String to JSON" fields in Update Mode
**Component:** `Step3_SchemaConfig.vue`
**Date:** 2025-12-12

## Key Components

### 1. Data Property
```javascript
missingPolicyFields: [] // Tracks { type, path, message }
```

### 2. Field Existence Check
```javascript
checkFieldExistsInSampleData(fieldPath)
// Returns: boolean
// Handles: nested paths, arrays, wildcards
```

### 3. Missing Field Check
```javascript
isFieldMissing(fieldPath)
// Returns: boolean
// Used in template for conditional rendering
```

### 4. Pre-fill Logic
```javascript
prefillFromPolicy(schemaRule)
// Enhanced to:
// - Check field existence
// - Track missing fields
// - Add missing fields to candidates
// - Skip parsing for missing fields
// - Show warning notifications
```

## UI Components

### Warning Indicator
```vue
<q-icon
  v-if="isFieldMissing(field)"
  name="warning"
  color="warning"
  size="sm"
  class="q-ml-xs"
>
  <q-tooltip>
    This field is defined in the policy but not found in the current sample data
  </q-tooltip>
</q-icon>
```

### Badge
```vue
<q-badge v-if="!isFieldMissing(field)" color="primary">string</q-badge>
<q-badge v-else color="warning">missing</q-badge>
```

### Caption
```vue
<q-item-label caption>
  <span v-if="!isFieldMissing(field)">Contains stringified JSON</span>
  <span v-else class="text-warning">
    <q-icon name="info" size="xs" class="q-mr-xs" />
    Not found in current sample data
  </span>
</q-item-label>
```

## Visual States

### Normal Field (Exists)
```
☑️ $.log         [string]
   Contains stringified JSON
```

### Missing Field (Not in Data)
```
☑️ $.log  ⚠️     [missing]
   ℹ️ Not found in current sample data
   (Tooltip: "This field is defined in the policy but not found in the current sample data")
```

## Notification Examples

### All Fields Present
```
✅ Schema configuration loaded from policy
   1 string-to-JSON fields, 0 fanout arrays
```

### Some Fields Missing
```
⚠️ Schema configuration loaded from policy
   3 string-to-JSON fields, 0 fanout arrays (2 fields not found in sample data)
```

## Console Logging Pattern

```javascript
// Field exists
[Step 3] Field "$.log" EXISTS in sample data
[Step 3] Field from policy FOUND in sample data: $.log

// Field missing
[Step 3] Field from policy NOT FOUND in sample data: $.log
[Step 3] Added missing field to convertToJsonCandidates: $.log
[Step 3] Missing fields: [...]
```

## Key Behaviors

1. **Missing fields are STILL displayed**
   - Added to `convertToJsonCandidates`
   - Checkbox is checked
   - Reflects policy configuration

2. **Visual distinction is clear**
   - Warning icon (⚠️)
   - Warning badge ("missing")
   - Warning text color (orange/yellow)
   - Explanatory tooltip

3. **No errors thrown**
   - Graceful handling of missing fields
   - Skips parsing for missing fields
   - Comprehensive error handling

4. **User is informed**
   - Warning notification
   - Count of missing fields
   - Tooltip explanation

## Testing Quick Commands

```bash
# Start dev server
npm run dev

# In browser console, check for logs
# Filter by: [Step 3]

# Look for:
# - "Field from policy NOT FOUND in sample data"
# - "Added missing field to convertToJsonCandidates"
# - "Missing fields: [...]"
```

## Common Issues & Solutions

### Issue: Warning not showing
**Check:**
1. Is `isFieldMissing()` returning true?
2. Is field in `missingPolicyFields` array?
3. Console logs show field was detected as missing?

### Issue: Field not displayed at all
**Check:**
1. Was field added to `convertToJsonCandidates`?
2. Check console for "Added missing field to convertToJsonCandidates"
3. Verify `prefillFromPolicy` completed successfully

### Issue: Checkbox not checked
**Check:**
1. Is field in `selectedConvertToJsonFields`?
2. Check `fieldsToSelect` array in console logs
3. Verify pre-fill logic executed

### Issue: Parsing errors
**Check:**
1. Missing fields should NOT be parsed
2. Check `existingFields` filter logic
3. Verify only existing fields passed to `updateFanoutCandidatesFromParsedJson`

## Code Locations

| Feature | Location | Line Range (approx) |
|---------|----------|---------------------|
| Data property | Step3_SchemaConfig.vue | ~266 |
| checkFieldExistsInSampleData | Step3_SchemaConfig.vue | ~477-547 |
| isFieldMissing | Step3_SchemaConfig.vue | ~554-558 |
| prefillFromPolicy (enhanced) | Step3_SchemaConfig.vue | ~798-878 |
| Template - Available Fields | Step3_SchemaConfig.vue | ~43-90 |
| Template - Selected Fields | Step3_SchemaConfig.vue | ~106-141 |
| CSS Styles | Step3_SchemaConfig.vue | ~1761-1772 |

## Related Files

- Main implementation: `src/components/wizard/steps/Step3_SchemaConfig.vue`
- Vuex store: `src/store/wizardModule.js`
- Feature doc: `prompt/updatefeature.md`
- Implementation summary: `SCENARIO_1_IMPLEMENTATION_SUMMARY.md`
- Test guide: `TEST_SCENARIO_1.md`

## Next Steps

After Scenario 1 is validated:
1. Implement Scenario 2: Missing fanout array fields
2. Implement Scenario 3: Missing fields in Step 5 mappings
3. Add unit tests
4. Update user documentation

## Support

For questions or issues:
1. Check console logs (`[Step 3]` prefix)
2. Review implementation summary
3. Review test guide
4. Check browser DevTools for errors
5. Verify sample data and policy file formats

## Version Info

- Implementation: v1.0
- Component: Step3_SchemaConfig.vue
- Feature: Update Mode - Phase 2, Scenario 1
- Status: ✅ Implemented, Ready for Testing
