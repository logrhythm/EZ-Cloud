# Vue Warning Fix: Missing Required Prop modelValue

## Issue Description
Vue was generating a console warning:
```
WizardContainer.vue:162 [Vue warn]: Missing required prop: "modelValue"

found in

---> <ConditionEditorModal> at src/components/wizard/modals/ConditionEditorModal.vue
       <Step6SubTransformConfig> at src/components/wizard/steps/Step6_SubTransformConfig.vue
         <WizardContainer> at src/components/wizard/WizardContainer.vue
```

## Root Cause Analysis

### Problem
Both `ConditionEditorModal` and `TransformEditorModal` components defined `modelValue` as a **required prop**:

```javascript
props: {
  modelValue: {
    type: Boolean,
    required: true  // This was causing the warning
  },
  // ... other props
}
```

### Why the Warning Occurred
1. The modals are used with `v-model` directive in `Step6_SubTransformConfig.vue`:
   ```vue
   <condition-editor-modal
     v-model="conditionDialog"
     :condition="currentCondition"
     :sample-data="sampleData"
     @save="saveCondition"
   />
   ```

2. The `conditionDialog` and `transformDialog` data properties are initialized as `false`
3. The modal components are **always rendered in the DOM**, even when closed
4. During initial render, Vue validates that all required props are present
5. Since `v-model` is just syntactic sugar for `:model-value="conditionDialog"`, the prop is technically present
6. However, Vue's prop validation was still triggering the warning because the prop was marked as `required: true`

## Solution Implemented

Changed the `modelValue` prop definition in both modal components from `required: true` to `default: false`:

### Files Modified

#### 1. /src/components/wizard/modals/ConditionEditorModal.vue
**Before:**
```javascript
props: {
  modelValue: {
    type: Boolean,
    required: true
  },
  // ...
}
```

**After:**
```javascript
props: {
  modelValue: {
    type: Boolean,
    default: false
  },
  // ...
}
```

#### 2. /src/components/wizard/modals/TransformEditorModal.vue
**Before:**
```javascript
props: {
  modelValue: {
    type: Boolean,
    required: true
  },
  // ...
}
```

**After:**
```javascript
props: {
  modelValue: {
    type: Boolean,
    default: false
  },
  // ...
}
```

## Why This Fix Works

1. **Removes the Required Constraint**: Dialog/modal components that use `v-model` don't need `modelValue` to be required since they always receive it through the `v-model` directive
2. **Provides a Safe Default**: Setting `default: false` ensures the modal starts in a closed state if no value is provided
3. **Follows Vue Best Practices**: For dialog components, `modelValue` should have a default value rather than being required
4. **Maintains Functionality**: The `v-model` directive continues to work exactly as before, but without the warning

## Verification

After this change:
- The Vue warning should no longer appear in the console
- Both modals continue to function correctly
- Opening/closing behavior remains unchanged
- The `v-model` two-way binding continues to work as expected

## Related Components

The fix was applied consistently to both modal components:
- `ConditionEditorModal.vue` - Used for editing SubTransform filter conditions
- `TransformEditorModal.vue` - Used for editing field mapping transforms

Both components share the same pattern and were fixed in the same way to maintain consistency across the codebase.
