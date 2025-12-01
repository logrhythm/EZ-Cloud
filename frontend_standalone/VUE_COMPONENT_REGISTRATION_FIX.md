# Vue Component Registration Issue - Root Cause Analysis & Fix

## Issue Summary
**Warning Message:**
```
[Vue warn]: Unknown custom element: <subtransform-card> - did you register the component correctly?
For recursive components, make sure to provide the "name" option.
```

**Location:** Step 6 SubTransform Configuration page

---

## Root Cause Analysis

### The Problem
The Vue warning was caused by a **kebab-case vs PascalCase inconsistency** in how the recursive component `SubTransformCard` was being referenced in templates.

### Technical Details

1. **Component Registration (Correct)**
   - File: `/src/components/wizard/steps/Step6_SubTransformConfig.vue`
   - Lines 181, 194
   - The component was properly imported and registered:
     ```javascript
     import SubTransformCard from '../SubTransformCard.vue'

     components: {
       SubTransformCard,
       // ... other components
     }
     ```

2. **Component Definition (Correct)**
   - File: `/src/components/wizard/SubTransformCard.vue`
   - Line 327
   - The component had the correct `name` option:
     ```javascript
     export default {
       name: 'SubTransformCard',
       // ...
     }
     ```

3. **Component Usage (The Issue)**
   - **In Step6_SubTransformConfig.vue (line 140):** Used as `<subtransform-card>` (kebab-case)
   - **In SubTransformCard.vue (line 299):** Used as `<subtransform-card>` (kebab-case) - RECURSIVE CALL

### Why This Caused the Warning

In Vue 2, **recursive components** (components that reference themselves) have special behavior:

- Vue normally auto-converts PascalCase component names to kebab-case
- However, for **recursive components**, Vue relies on the `name` option to resolve self-references
- When using kebab-case in the template (`<subtransform-card>`), Vue 2 sometimes has trouble matching it to the PascalCase name (`SubTransformCard`) during recursive rendering
- This is especially problematic during the **initial render** when the component tree is being constructed

The warning appears because:
1. Vue sees `<subtransform-card>` in the template
2. It looks for a registered component with that exact name
3. It only finds `SubTransformCard` (PascalCase)
4. During recursive rendering, the case mismatch causes confusion

---

## The Solution

### Approach: Use PascalCase Consistently
Changed all template references to use **PascalCase** (`<SubTransformCard>`) to match the component's registered name.

### Changes Made

#### 1. Step6_SubTransformConfig.vue
**File:** `/src/components/wizard/steps/Step6_SubTransformConfig.vue`
**Line:** 140

**Before:**
```vue
<subtransform-card
  v-for="(subtransform, index) in subTransformsList"
  :key="subtransform.id"
  ...
/>
```

**After:**
```vue
<SubTransformCard
  v-for="(subtransform, index) in subTransformsList"
  :key="subtransform.id"
  ...
/>
```

#### 2. SubTransformCard.vue (Recursive Self-Reference)
**File:** `/src/components/wizard/SubTransformCard.vue`
**Line:** 299

**Before:**
```vue
<subtransform-card
  v-for="(nested, nIndex) in subtransform.subTransforms"
  :key="nested.id"
  ...
/>
```

**After:**
```vue
<SubTransformCard
  v-for="(nested, nIndex) in subtransform.subTransforms"
  :key="nested.id"
  ...
/>
```

---

## Why This Fix Works

### Vue 2 Recursive Component Resolution
- When a component has `name: 'SubTransformCard'`, Vue registers it with that exact name
- Using `<SubTransformCard>` in the template creates a direct, unambiguous reference
- Vue's component resolution algorithm can now clearly match the template tag to the registered component
- This works for both parent-child relationships AND recursive self-references

### Benefits of PascalCase
1. **Consistency:** Matches JavaScript/Vue naming conventions
2. **Clarity:** Makes it obvious you're using a component (not a native HTML element)
3. **Type Safety:** Better IDE autocomplete and linting support
4. **Recursive Safety:** Explicit naming prevents resolution issues in recursive scenarios

---

## Alternative Solutions (Not Chosen)

### Option 1: Explicit Self-Registration (Problematic)
```javascript
components: {
  SubTransformCard: () => import('./SubTransformCard.vue')
}
```
**Issue:** Creates circular dependency and can cause infinite loops during module resolution.

### Option 2: Change `name` to kebab-case (Bad Practice)
```javascript
export default {
  name: 'subtransform-card'
}
```
**Issue:** Violates Vue style guide and JavaScript naming conventions. Component names should be PascalCase.

### Option 3: Manual Component Resolution (Overkill)
Using `Vue.component()` for global registration.
**Issue:** Unnecessary complexity, defeats the purpose of component-scoped registration.

---

## Verification

### What to Test
1. ✅ Navigate to Step 6 (SubTransform Configuration)
2. ✅ Check browser console - no Vue warnings should appear
3. ✅ Add a SubTransform - verify it renders correctly
4. ✅ Add a nested SubTransform - verify recursive rendering works
5. ✅ Expand/collapse SubTransforms - verify interactions work
6. ✅ Edit conditions and transforms - verify modals open correctly

### Expected Behavior
- No console warnings about unregistered components
- SubTransform cards render with proper styling
- Nested SubTransforms display with correct indentation and depth indicators
- All interactive features (edit, delete, reorder, add nested) work as expected

---

## Best Practices for Recursive Components

### 1. Always Use PascalCase in Templates
```vue
<!-- CORRECT -->
<MyComponent />

<!-- AVOID -->
<my-component />
```

### 2. Always Define `name` Option
```javascript
export default {
  name: 'MyComponent',  // Required for recursive components
  // ...
}
```

### 3. Avoid Deep Nesting
Implement depth limits to prevent performance issues:
```javascript
props: {
  depth: { type: Number, default: 0 },
  maxDepth: { type: Number, default: 3 }
},
computed: {
  canAddNested() {
    return this.depth < this.maxDepth
  }
}
```

### 4. Document Recursive Behavior
Always add comments explaining that a component is recursive and what it represents.

---

## Files Modified

1. `/src/components/wizard/steps/Step6_SubTransformConfig.vue` (line 140)
2. `/src/components/wizard/SubTransformCard.vue` (line 299, 323-325)

## Impact
- **Low Risk:** Pure template syntax change
- **No Logic Changes:** Component behavior remains identical
- **No Breaking Changes:** Props, events, and data flow unchanged
- **Performance:** No impact, purely cosmetic fix

---

## Summary

**Root Cause:** Kebab-case component reference (`<subtransform-card>`) didn't match PascalCase component name (`SubTransformCard`) in recursive rendering context.

**Solution:** Changed all template references to use PascalCase (`<SubTransformCard>`) to match the component's registered name.

**Result:** Vue can now correctly resolve the component during recursive rendering, eliminating the warning.

---

**Date Fixed:** 2025-11-26
**Fixed By:** Frontend UI Prototyper Agent
**Reported By:** frontend-tech-lead
