# Child Fanouts - Quick Reference Guide

## Policy Format Comparison

### Old Format (Still Supported)
```json
{
  "schemaRule": {
    "fanout": {
      "inputField": [
        "$.log.Records[*]",
        "$.requestParameters.changeBatch.changes[*]"
      ]
    }
  }
}
```
- **Pros**: Simple, flat structure
- **Cons**: All paths must be absolute, no hierarchy information

### New Format (Recommended)
```json
{
  "schemaRule": {
    "childfanouts": [
      { "field": "$.log.Records[*]", "parentpath": null },
      { "field": "$.requestParameters.changeBatch.changes[*]", "parentpath": "$.log.Records[*]" }
    ]
  }
}
```
- **Pros**: Hierarchical, relative paths, clearer relationships
- **Cons**: Slightly more verbose

## Quick Rules

### Root-Level Arrays
```json
{ "field": "$.arrayName[*]", "parentpath": null }
```
- Always has `parentpath: null`
- Field path is absolute from root

### Nested Arrays  
```json
{ "field": "$.childArray[*]", "parentpath": "$.parentArray[*]" }
```
- Has non-null `parentpath`
- Field path is relative to parent
- Parent must exist as another field in childfanouts

### Deep Nesting (3+ Levels)
```json
[
  { "field": "$.level1[*]", "parentpath": null },
  { "field": "$.level2[*]", "parentpath": "$.level1[*]" },
  { "field": "$.level3[*]", "parentpath": "$.level2[*]" }
]
```
- Chain of parent-child relationships
- Each level resolved before the next

## How It Works

### Detection
```
1. Check if `schemaRule.childfanouts` exists
2. If yes → NEW format
3. If no, check if `schemaRule.fanout.inputField` exists  
4. If yes → OLD format
5. If neither → No fanout processing
```

### Processing (New Format)
```
Phase 1: Root Arrays
└─ For each array with parentpath === null:
   ├─ Find in sample data
   ├─ If found: Select it
   └─ If not found: Inject as missing

Phase 2: Nested Arrays (Iterative)
└─ Repeat until all resolved (max 10 times):
   └─ For each array with parentpath !== null:
      ├─ Look up parent's absolute path
      ├─ If parent not resolved: Skip this iteration
      ├─ If parent resolved:
      │  ├─ Build absolute path (parent + field)
      │  ├─ Find in sample data
      │  ├─ If found: Select it
      │  └─ If not found: Inject as missing
      └─ Store absolute path for children
```

## Common Scenarios

### Scenario: All Arrays Present in Sample
✅ Arrays are found and selected normally
✅ No missing badges
✅ Tree shows all arrays as checkable

### Scenario: Some Arrays Missing from Sample
⚠️ Missing arrays injected as synthetic candidates
⚠️ Orange "Missing" badge shown
⚠️ Arrays pre-selected to match policy
✅ User can see what's in policy vs. sample

### Scenario: Nested Array Missing
⚠️ Parent array may exist, child array missing
⚠️ Synthetic child created with parent info
⚠️ Full path constructed and shown
⚠️ "Nested array not found" message

## Troubleshooting

### Problem: Child Array Not Showing
**Check:**
- Is parent defined in childfanouts?
- Does parent have `parentpath: null` or valid parent reference?
- Is field path relative to parent (no absolute root path)?

**Solution:** Verify parent-child chain is complete

### Problem: Circular Reference Error
**Check:**
- A cannot be parent of B if B is parent of A
- Each array can have only one parent

**Solution:** Break the circular dependency

### Problem: "Failed to resolve after 10 iterations"
**Check:**
- Parent references form a valid tree (no orphans)
- No circular dependencies
- All parent paths exist as field values

**Solution:** Fix broken parent references

## Code Locations

### Main Implementation
File: `frontend_standalone/src/components/wizard/steps/Step3_SchemaConfig.vue`

**Methods:**
- `prefillFromPolicy()` - Entry point, detects format
- `processChildFanoutsOld()` - Handles old format
- `processChildFanoutsNew()` - Handles new format
- `normalizeFanoutPath()` - Path normalization
- `findFanoutCandidate()` - Find in candidates
- `injectMissingFanoutArray()` - Create synthetic candidate

### Supporting Components
- `JsonTreeViewer.vue` - Tree visualization
- `JsonTreeNode.vue` - Node rendering with missing badges
- `schemaRuleService.js` - Schema analysis

## Logging

### Enable Debug Logging
All methods include extensive console logging:
```javascript
console.log('[Step 3] Processing child fanouts (NEW FORMAT)')
console.log('[Step 3] ✅ Added fanout path to selections:', matchedPath)
console.warn('[Step 3] ⚠️ Child fanout path not found')
```

### Key Log Prefixes
- `[Step 3]` - Main flow
- `✅` - Success
- `⚠️` - Warning  
- `❌` - Error
- `📌` - Injection of synthetic candidate

## Testing Checklist

```
☐ Old format - all present
☐ Old format - some missing
☐ New format - root only
☐ New format - 1 level nesting
☐ New format - 3+ level nesting
☐ New format - missing root
☐ New format - missing nested
☐ Empty policy (no fanouts)
☐ Large dataset (performance)
☐ Deeply nested (10+ levels)
```

## Migration Guide

### From Old to New Format

**Before (Old):**
```json
{
  "fanout": {
    "inputField": [
      "$.items[*]",
      "$.items[*].subItems[*]"
    ]
  }
}
```

**After (New):**
```json
{
  "childfanouts": [
    { "field": "$.items[*]", "parentpath": null },
    { "field": "$.subItems[*]", "parentpath": "$.items[*]" }
  ]
}
```

**Benefits:**
- ✅ Clearer hierarchy
- ✅ Relative paths easier to maintain
- ✅ Better visual in UI
- ✅ More scalable for deep nesting

**No Need to Migrate:** Old format still works perfectly!

## Best Practices

### 1. Order Matters (New Format)
- List root arrays first
- Then immediate children
- Then their children, etc.
(Algorithm handles any order, but this is clearer)

### 2. Consistent Path Format
- Always use `$.` prefix
- Always use `[*]` for arrays
- Don't mix `[0]` with `[*]`

### 3. Test Incrementally
- Start with root arrays
- Add one nesting level at a time
- Verify in UI before adding more

### 4. Document Parent Relationships
```json
{
  "childfanouts": [
    // Root level - customer records
    { "field": "$.customers[*]", "parentpath": null },
    
    // Level 2 - orders per customer
    { "field": "$.orders[*]", "parentpath": "$.customers[*]" },
    
    // Level 3 - items per order
    { "field": "$.items[*]", "parentpath": "$.orders[*]" }
  ]
}
```

## FAQ

**Q: Can I mix old and new formats?**
A: No, use one or the other per policy file.

**Q: What if I have multiple root arrays?**
A: Perfect! List them all with `parentpath: null`

**Q: Can a child have multiple parents?**
A: No, each array has exactly one parent (or null for root).

**Q: What's the maximum nesting depth?**
A: Theoretically unlimited, but algorithm limits to 10 iterations for safety.

**Q: What if array is missing from sample?**
A: It's injected as synthetic candidate with orange "Missing" badge.

**Q: Can I remove missing arrays?**
A: Yes! Uncheck them in the UI. They're just pre-selected.

**Q: Does this affect Step 5 transforms?**
A: No, transforms continue to use the same FanoutParentElement paths.

## Support

**Documentation:**
- `step3ChildFanoutfix.md` - Detailed implementation guide
- `IMPLEMENTATION_CHILD_FANOUTS_SUMMARY.md` - Summary
- `IMPLEMENTATION_MISSING_FANOUT_ARRAYS.md` - Missing arrays feature

**Debugging:**
- Check browser console for `[Step 3]` logs
- Verify fanoutCandidates array in Vue DevTools
- Check selectedFanoutFields array
- Inspect missingPolicyFields for warnings

**Common Issues:**
1. Arrays not showing → Check path format
2. Nested not resolved → Verify parent exists
3. Wrong absolute path → Check path normalization
4. Performance → Reduce nesting depth

---

**Last Updated:** December 14, 2025
**Version:** 1.0
**Status:** ✅ Fully Implemented
