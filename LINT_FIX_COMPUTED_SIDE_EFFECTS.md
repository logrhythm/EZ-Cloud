# Lint Error Fix - No Side Effects in Computed Properties ✅

## Issue
ESLint error in `Step5_Mapping.vue`:
```
986:7  error  Unexpected side effect in "mappedPathsSet" computed property  vue/no-side-effects-in-computed-properties
```

## Problem
The `mappedPathsSet` computed property was modifying component state (`this.mappedPathsCaseInsensitiveMap`) as a side effect:

```javascript
// BAD: Side effect in computed property
mappedPathsSet () {
  const paths = new Set()
  const caseInsensitiveMap = new Map()
  
  // ... build the map ...
  
  // ❌ SIDE EFFECT - modifying component state
  this.mappedPathsCaseInsensitiveMap = caseInsensitiveMap
  
  return paths
}
```

## Solution
Created a separate computed property `mappedPathsCaseInsensitiveMap` to build the case-insensitive map without side effects:

### Before:
- `mappedPathsSet` (computed) - returned Set of paths + side effect of updating component data
- `mappedPathsCaseInsensitiveMap` (data property) - stored the map

### After:
- `mappedPathsCaseInsensitiveMap` (computed) - returns the case-insensitive Map
- `mappedPathsSet` (computed) - returns Set of paths (no side effects)

## Changes Made

### 1. Created New Computed Property
**File:** `Step5_Mapping.vue`

```javascript
/**
 * Build a case-insensitive map for mapped paths
 * Map structure: lowercase path -> [original paths with their actual casing]
 */
mappedPathsCaseInsensitiveMap () {
  const caseInsensitiveMap = new Map()

  this.localMappings.forEach(m => {
    if (m.inputRule) {
      // Store case-insensitive version of inputRule
      const originalPath = m.inputRule
      const lowerPath = originalPath.toLowerCase()
      if (!caseInsensitiveMap.has(lowerPath)) {
        caseInsensitiveMap.set(lowerPath, [])
      }
      caseInsensitiveMap.get(lowerPath).push(originalPath)

      // If mapping has fanout parent, also store reconstructed tree path
      if (m.fanoutParentElement) {
        // ... build fanout tree path ...
        const treePath = `${fanoutParent}[*].${basePath}`
        
        const lowerTreePath = treePath.toLowerCase()
        if (!caseInsensitiveMap.has(lowerTreePath)) {
          caseInsensitiveMap.set(lowerTreePath, [])
        }
        caseInsensitiveMap.get(lowerTreePath).push(treePath)
      }
    }
  })

  return caseInsensitiveMap
}
```

### 2. Cleaned Up mappedPathsSet
**File:** `Step5_Mapping.vue`

Removed the side effect:
```javascript
mappedPathsSet () {
  const paths = new Set()

  this.localMappings.forEach(m => {
    if (m.inputRule) {
      paths.add(m.inputRule)

      // If mapping has fanout parent, add reconstructed path
      if (m.fanoutParentElement) {
        // ... build tree path ...
        const treePath = `${fanoutParent}[*].${basePath}`
        paths.add(treePath)
      }
    }
  })

  // ✅ NO SIDE EFFECTS - just return the Set
  return paths
}
```

### 3. Removed Data Property
**File:** `Step5_Mapping.vue`

Removed from `data()`:
```javascript
// REMOVED - now a computed property instead
// mappedPathsCaseInsensitiveMap: new Map(),
```

## Benefits

### 1. **Vue Best Practices** ✅
- Computed properties are now pure functions
- No side effects that could cause unexpected behavior
- Follows Vue.js style guide recommendations

### 2. **Better Reactivity** ✅
- Computed properties automatically track dependencies
- Both `mappedPathsSet` and `mappedPathsCaseInsensitiveMap` update when `localMappings` changes
- More predictable and maintainable

### 3. **Performance** ✅
- Computed properties are cached based on reactive dependencies
- Only recalculated when `localMappings` changes
- Efficient for repeated access

### 4. **Code Quality** ✅
- Passes ESLint validation
- Cleaner separation of concerns
- Each computed property has a single responsibility

## How It Works Now

### Template Usage (No Change Required)
```vue
<json-tree-viewer
  :mapped-paths="mappedPathsSet"
  :mapped-paths-case-map="mappedPathsCaseInsensitiveMap"
  <!-- both are now computed properties -->
/>
```

### Reactive Flow
1. User modifies `localMappings` (add/edit/delete mapping)
2. Both computed properties automatically recalculate:
   - `mappedPathsSet` rebuilds the Set of paths
   - `mappedPathsCaseInsensitiveMap` rebuilds the case-insensitive Map
3. Changes propagate to JsonTreeViewer → JsonTreeNode
4. Tree highlights update automatically

### Example
```javascript
// When a mapping is added/removed:
this.localMappings.push(newMapping)

// Vue automatically:
// 1. Detects change to localMappings
// 2. Recalculates mappedPathsSet (returns new Set)
// 3. Recalculates mappedPathsCaseInsensitiveMap (returns new Map)
// 4. Updates tree viewer with new props
// 5. Tree nodes re-render with updated highlighting
```

## Testing

### Verification Steps
1. ✅ No ESLint errors
2. ✅ Case-insensitive highlighting still works
3. ✅ Tree updates when mappings change
4. ✅ No console warnings about side effects

### Test Cases
- Add a mapping → tree highlights update ✅
- Edit a mapping → tree highlights update ✅
- Delete a mapping → tree highlights update ✅
- Case mismatch (policy: `$.eventName`, sample: `$.EventName`) → highlighted ✅

## Files Modified
1. ✅ `frontend_standalone/src/components/wizard/steps/Step5_Mapping.vue`
   - Created `mappedPathsCaseInsensitiveMap` computed property
   - Cleaned up `mappedPathsSet` computed property (removed side effect)
   - Removed `mappedPathsCaseInsensitiveMap` from data properties

## Validation Status
- ✅ ESLint: No errors
- ✅ TypeScript: No errors
- ✅ Functionality: Preserved (case-insensitive highlighting works)
- ✅ Performance: Improved (better Vue reactivity caching)

## Related Documentation
- [Vue Style Guide - Computed Property Side Effects](https://vuejs.org/style-guide/rules-essential.html#avoid-side-effects-in-computed-properties)
- ESLint Rule: `vue/no-side-effects-in-computed-properties`
