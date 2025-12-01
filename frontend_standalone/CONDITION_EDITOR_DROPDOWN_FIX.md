# ConditionEditorModal Dropdown Fix - Vue 2 Syntax Correction

## Issue Summary
**Critical Bug**: In the ConditionEditorModal component, dropdown selections were not working. When users clicked on dropdown menu items:
- ❌ Dropdown didn't close/minimize
- ❌ Selected text was NOT shown in the field
- ❌ No response to user interaction

## Root Cause
The component was using **Vue 3 event syntax** (`@update:model-value`) instead of **Vue 2 syntax** (`@input`) for Quasar 1.x components.

## Components Fixed

### 1. Field Selector Dropdown (Line 126)
**Before (Vue 3 - WRONG):**
```vue
<q-select
  v-model="condition.field"
  :options="fieldOptions"
  @update:model-value="(value) => onFieldChange(index, value)"
/>
```

**After (Vue 2 - CORRECT):**
```vue
<q-select
  v-model="condition.field"
  :options="fieldOptions"
  @input="(value) => onFieldChange(index, value)"
/>
```

### 2. Operator Selector Dropdown (Line 158)
**Before (Vue 3 - WRONG):**
```vue
<q-select
  v-model="condition.operator"
  :options="getOperatorsForCondition(condition)"
  @update:model-value="(value) => onOperatorChange(index, value)"
/>
```

**After (Vue 2 - CORRECT):**
```vue
<q-select
  v-model="condition.operator"
  :options="getOperatorsForCondition(condition)"
  @input="(value) => onOperatorChange(index, value)"
/>
```

### 3. Logical Operator Radio Buttons (Lines 223, 231)
**Before (Vue 3 - WRONG):**
```vue
<q-radio
  v-model="condition.logicalOperator"
  val="AND"
  @update:model-value="() => onLogicalOperatorChange(index)"
/>
<q-radio
  v-model="condition.logicalOperator"
  val="OR"
  @update:model-value="() => onLogicalOperatorChange(index)"
/>
```

**After (Vue 2 - CORRECT):**
```vue
<q-radio
  v-model="condition.logicalOperator"
  val="AND"
  @input="() => onLogicalOperatorChange(index)"
/>
<q-radio
  v-model="condition.logicalOperator"
  val="OR"
  @input="() => onLogicalOperatorChange(index)"
/>
```

## Technical Details

### Vue 2 vs Vue 3 Event Handling
- **Vue 2 (Quasar 1.x)**: Uses `@input` event for v-model changes
- **Vue 3 (Quasar 2.x)**: Uses `@update:model-value` event for v-model changes

### Event Binding in Quasar 1.x Components
| Component | Vue 2 Event | Vue 3 Event |
|-----------|-------------|-------------|
| q-select  | @input      | @update:model-value |
| q-radio   | @input      | @update:model-value |
| q-checkbox| @input      | @update:model-value |
| q-toggle  | @input      | @update:model-value |

## Files Modified
- **File**: `/src/components/wizard/modals/ConditionEditorModal.vue`
- **Lines Changed**: 126, 158, 223, 231

## Verification
Run this command to confirm no Vue 3 syntax remains:
```bash
grep -n "update:model-value" /src/components/wizard/modals/ConditionEditorModal.vue
```
Expected output: (no results)

## Testing Checklist
- [ ] Open Step 6 (SubTransform Config)
- [ ] Click "Edit Condition" button on any SubTransform card
- [ ] In the ConditionEditorModal:
  - [ ] Expand the **Field** dropdown
  - [ ] Click on a field option
  - [ ] **Expected**: Dropdown closes, selected field displays in the input
  - [ ] Expand the **Operator** dropdown
  - [ ] Click on an operator option
  - [ ] **Expected**: Dropdown closes, selected operator displays in the input
  - [ ] Add a second condition
  - [ ] Toggle the **AND/OR** radio button
  - [ ] **Expected**: Radio button selection changes immediately
- [ ] Verify the filter expression preview updates correctly
- [ ] Click "Save Condition" and verify the condition is saved

## Expected Behavior After Fix
✅ Field dropdown closes immediately upon selection
✅ Selected field name appears in the Field input
✅ Operator dropdown closes immediately upon selection
✅ Selected operator appears in the Operator input
✅ AND/OR radio buttons toggle correctly
✅ Filter expression preview updates in real-time
✅ All dropdown interactions feel responsive and intuitive

## Additional Notes
- The Value input field (line 162) already uses proper Vue 2 event handling with `@input-value` and `@new-value`, so it was not modified
- The v-model bindings are correct throughout - only the explicit event handlers needed fixing
- This is consistent with the fix applied to SubTransformConfigModal earlier

## Related Issues
- Same pattern was found and fixed in SubTransformConfigModal.vue
- Root cause: Mixing Vue 3 patterns into Vue 2 codebase
- Recommendation: Add ESLint rule to catch `@update:model-value` in Vue 2 projects

---
**Status**: ✅ Fixed
**Verified**: All Vue 3 syntax replaced with Vue 2 syntax
**Ready for Testing**: Yes
