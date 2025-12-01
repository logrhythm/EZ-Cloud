# Modal Opening Issue - Root Cause and Fix

## Issue Summary
Modals (ConditionEditorModal and TransformEditorModal) were not opening despite event handlers being called correctly and dialog variables being set to `true`.

## Root Cause Identified
The modal components were using **Vue 3 v-model syntax** while the project uses **Vue 2 + Quasar 1.x**.

### The Problem

#### Vue 3 Syntax (What the modals had):
```vue
<!-- In Modal Component -->
<q-dialog
  :model-value="modelValue"
  @update:model-value="$emit('update:modelValue', $event)"
>

<!-- Props -->
props: {
  modelValue: { type: Boolean, default: false }
}

<!-- Emits -->
emits: ['update:modelValue', 'save']
```

#### Vue 2 Syntax (What they needed):
```vue
<!-- In Modal Component -->
<q-dialog
  :value="value"
  @input="$emit('input', $event)"
>

<!-- Props -->
props: {
  value: { type: Boolean, default: false }
}

<!-- Emits -->
emits: ['input', 'save']
```

### Why This Caused the Issue

In **Vue 2**, when you use `v-model` on a custom component:
```vue
<ConditionEditorModal v-model="conditionDialog" />
```

It translates to:
```vue
<ConditionEditorModal
  :value="conditionDialog"
  @input="conditionDialog = $event"
/>
```

In **Vue 3**, `v-model` translates to:
```vue
<ConditionEditorModal
  :model-value="conditionDialog"
  @update:model-value="conditionDialog = $event"
/>
```

**The modals were expecting Vue 3 props (`model-value`) but receiving Vue 2 props (`value`)**, causing the binding to fail silently. The variables were being set to `true` in the parent component, but the modal component never received the update.

## Files Fixed

### 1. `/src/components/wizard/modals/ConditionEditorModal.vue`
**Changes:**
- ✅ Changed `<q-dialog :model-value="modelValue"` to `:value="value"`
- ✅ Changed `@update:model-value="..."` to `@input="..."`
- ✅ Changed prop name from `modelValue` to `value`
- ✅ Changed emit from `'update:modelValue'` to `'input'`
- ✅ Changed watcher from `modelValue` to `value`
- ✅ Updated `closeModal()` to emit `'input'` instead of `'update:modelValue'`
- ✅ Added debug console logs to track value changes

### 2. `/src/components/wizard/modals/TransformEditorModal.vue`
**Changes:**
- ✅ Changed `<q-dialog :model-value="modelValue"` to `:value="value"`
- ✅ Changed `@update:model-value="..."` to `@input="..."`
- ✅ Changed prop name from `modelValue` to `value`
- ✅ Changed emit from `'update:modelValue'` to `'input'`
- ✅ Changed watcher from `modelValue` to `value`
- ✅ Updated `closeModal()` to emit `'input'` instead of `'update:modelValue'`
- ✅ Added debug console logs to track value changes

### 3. `/src/components/wizard/steps/Step6_SubTransformConfig.vue`
**Changes:**
- ✅ Added debug console logs in `editCondition()` to track dialog state
- ✅ Added debug console logs in `editTransform()` to track dialog state

## Testing Verification

### Expected Console Output (After Fix)
When clicking "Edit Condition" button:
```
[Step 6] Edit condition for SubTransform: bb929be1-bf33-43c7-9ae2-765047d494a6
[Step 6] conditionDialog is now: true
[Step 6] currentCondition: <condition expression>
[ConditionEditorModal] value changed to: true
[ConditionEditorModal] Initializing modal...
```

When clicking "Add Transform" button:
```
[Step 6] Edit transform: {subtransformId: '...', transformIndex: -1, mode: 'add'}
[Step 6] transformDialog is now: true
[Step 6] editingTransformMode: add
[Step 6] currentTransforms: []
[TransformEditorModal] value changed to: true
[TransformEditorModal] Initializing modal...
```

### Before Fix (What Was Happening)
- Parent component: `conditionDialog = true` ✅ (worked)
- Modal component: Never received the value change ❌ (failed)
- Result: Modal stayed closed ❌

### After Fix (Expected Behavior)
- Parent component: `conditionDialog = true` ✅
- Modal component: Receives `value = true` via prop ✅
- Watcher fires: `initializeModal()` is called ✅
- Result: Modal opens ✅

## Lessons Learned

1. **Always verify Vue version compatibility** when using component v-model bindings
2. **Vue 2 uses `:value` + `@input`**, not `:model-value` + `@update:model-value`
3. **Silent failures** can occur when prop names don't match what v-model expects
4. **Debug logs** are essential for tracking data flow in complex component hierarchies

## Related Documentation

- Vue 2 Custom v-model: https://v2.vuejs.org/v2/guide/components-custom-events.html#Customizing-Component-v-model
- Vue 3 v-model changes: https://v3-migration.vuejs.org/breaking-changes/v-model.html
- Quasar 1.x (Vue 2): https://v1.quasar.dev/

## Date Fixed
2025-11-26
