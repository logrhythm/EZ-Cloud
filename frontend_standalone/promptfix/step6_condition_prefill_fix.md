# Step 6 SubTransform Condition Pre-fill Fix

## Issue Description

When clicking "Add/Edit Conditions" on a SubTransform card in Step 6, the popup dialog was opening but **not pre-filling** the existing condition into the filter builder component. The condition was correctly displayed on the card itself, but the modal's filter builder was empty.

## Root Cause

The issue was caused by **Vue reactivity timing** in the modal initialization process:

1. **In Step6_SubTransformConfig.vue** (parent component):
   - When `editCondition()` was called, it set `this.currentCondition` and then immediately set `this.conditionDialog = true`
   - These changes happened synchronously in the same tick

2. **In ConditionEditorModal.vue** (child component):
   - The modal only watched the `value` prop (dialog visibility), NOT the `condition` prop
   - When `value` changed to `true`, it immediately called `initializeModal()`
   - However, the `condition` prop might not have been fully propagated yet due to Vue's reactivity batching
   - As a result, `this.condition` was often empty or stale when `initializeModal()` ran

## Solution Implemented

### 1. **Added watcher for `condition` prop in ConditionEditorModal.vue**

```javascript
watch: {
  value: {
    immediate: true,
    handler (newVal) {
      if (newVal) {
        this.initializeModal()
      }
    }
  },
  condition: {
    immediate: false,
    handler (newVal, oldVal) {
      // Re-initialize if dialog is already open and condition changes
      if (this.value && newVal !== oldVal) {
        console.log('[ConditionEditorModal] Re-initializing with new condition...')
        this.initializeModal()
      }
    }
  }
}
```

**Why this works:**
- Now the modal watches BOTH the dialog visibility AND the condition prop
- If the condition changes while the dialog is already open, it re-initializes with the new condition
- This handles the case where the condition prop updates after the dialog opens

### 2. **Added $nextTick in Step6_SubTransformConfig.vue**

```javascript
editCondition (subtransformId) {
  // Find the SubTransform
  const subtransform = this.findSubTransform(subtransformId, this.subTransformsList)

  // Set current editing state
  this.editingSubTransformId = subtransformId
  this.currentCondition = subtransform.condition || ''

  // Use $nextTick to ensure the condition prop is updated before opening the modal
  this.$nextTick(() => {
    this.conditionDialog = true
  })
}
```

**Why this works:**
- `$nextTick` ensures that Vue has finished processing the `currentCondition` update
- The condition prop is fully propagated to the child component before the dialog opens
- This prevents the race condition where the modal initializes before receiving the condition

## Testing Verification

### Expected Behavior (FIXED):
1. ✅ Transform cards display condition correctly
2. ✅ Clicking "Add/Edit Conditions" opens the popup
3. ✅ The condition is **pre-filled** in the filter builder
4. ✅ All condition fields (field, operator, value, logical operators) are correctly populated
5. ✅ User can edit the pre-filled condition
6. ✅ Saving updates the condition in the SubTransform card

### Test Cases:

**Test Case 1: Simple Condition**
- SubTransform condition: `@.errorMessage == "failure"`
- Expected: Modal opens with one condition row:
  - Field: `@.errorMessage`
  - Operator: `==`
  - Value: `"failure"`

**Test Case 2: Multiple Conditions with Logical Operators**
- SubTransform condition: `@.errorCode == "500" && @.severity == "high"`
- Expected: Modal opens with two condition rows:
  - Condition 1: Field=`@.errorCode`, Operator=`==`, Value=`"500"`, LogicalOp=`AND`
  - Condition 2: Field=`@.severity`, Operator=`==`, Value=`"high"`

**Test Case 3: Complex Condition with OR**
- SubTransform condition: `@.errorMessage == "failure" || @.errorCode == "404"`
- Expected: Modal opens with two condition rows connected by OR operator

**Test Case 4: Empty/Catch-All Condition**
- SubTransform condition: `""` (empty string)
- Expected: Modal opens with empty state, no conditions pre-filled

**Test Case 5: Exists Operator**
- SubTransform condition: `@.errorMessage`
- Expected: Modal opens with one condition row:
  - Field: `@.errorMessage`
  - Operator: `exists` (Has Attribute)
  - Value: (no value needed)

## Code Flow After Fix

```
User clicks "Add/Edit Conditions" on SubTransform card
    ↓
SubTransformCard.vue emits 'edit-condition' event with subtransform ID
    ↓
Step6_SubTransformConfig.vue receives event
    ↓
editCondition() method:
  1. Finds the subtransform by ID
  2. Sets this.currentCondition = subtransform.condition
  3. Waits for $nextTick (ensures prop update)
  4. Sets this.conditionDialog = true
    ↓
ConditionEditorModal.vue receives props:
  - value: true (opens dialog)
  - condition: "@.errorMessage == 'failure'" (example)
    ↓
Modal's 'value' watcher triggers → initializeModal()
    ↓
initializeModal():
  1. Extracts fields from sample data
  2. Parses existing condition (this.condition)
  3. Populates localConditions array with parsed data
  4. Updates generated expression preview
    ↓
IF condition prop changes (race condition scenario):
  Modal's 'condition' watcher triggers → re-initializeModal()
    ↓
Result: Filter builder is pre-filled with condition data ✅
```

## Files Modified

1. **src/components/wizard/modals/ConditionEditorModal.vue**
   - Added watcher for `condition` prop
   - Ensures re-initialization when condition changes while dialog is open

2. **src/components/wizard/steps/Step6_SubTransformConfig.vue**
   - Wrapped `this.conditionDialog = true` in `$nextTick()`
   - Ensures condition prop is updated before opening modal

## Consistency with Step 4

This fix ensures Step 6 (SubTransform conditions) behaves **consistently** with Step 4 (Filter Rules):
- Both pre-fill existing conditions when editing
- Both parse complex expressions with multiple conditions
- Both support all operators (==, !=, >, <, contains, exists, etc.)
- Both handle logical operators (AND, OR)

## Additional Notes

- The fix includes extensive console logging for debugging
- No changes to the condition parsing logic (parseExistingCondition method)
- No changes to the FilterRuleService
- Works for all condition types: simple, complex, multiple, exists, etc.
- No performance impact - $nextTick is lightweight and only delays by one tick

## Verification Commands

```bash
# Run the application
npm run dev

# Test Steps:
# 1. Navigate to Step 6 (SubTransform Configuration)
# 2. Ensure there are SubTransforms with conditions (either from policy upload or manually created)
# 3. Click "Add/Edit Conditions" on any SubTransform card
# 4. Verify the condition is pre-filled in the modal's filter builder
# 5. Edit the condition and save
# 6. Verify the updated condition appears on the card
```

## Success Criteria

✅ All conditions are properly pre-filled when editing SubTransforms
✅ No regression in existing functionality
✅ Consistent behavior with Step 4 Filter Rules
✅ Works for all condition types (simple, complex, multiple, logical operators)
✅ User can edit pre-filled conditions
✅ Saved changes are reflected in the SubTransform card

---

**Issue Status:** RESOLVED ✅
**Date:** 2025-12-15
**Developer:** Frontend Prototype Developer (Claude Code)
