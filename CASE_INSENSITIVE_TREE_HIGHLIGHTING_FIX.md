# Case-Insensitive Tree Highlighting Fix ✅

## Issue Description
When field mappings from the policy file had different casing than the sample data (e.g., policy has `$.eventName` but sample data has `$.EventName`), those fields were not being highlighted with a checkmark (✓) in the JSON tree viewer, even though they were mapped.

## Root Cause
The tree highlighting logic used **exact case-sensitive matching** to check if a path was mapped:
```javascript
// OLD CODE - Case-sensitive
isMapped () {
  return this.mappedPaths.has(this.data.path)  // Fails if cases don't match
}
```

## Solution Implemented

### 1. Created Case-Insensitive Mapping Index
**File:** `Step5_Mapping.vue`

Updated the `mappedPathsSet` computed property to build a case-insensitive lookup map:
```javascript
mappedPathsSet () {
  const paths = new Set()
  const caseInsensitiveMap = new Map()  // NEW: lowercase -> [original paths]

  this.localMappings.forEach(m => {
    if (m.inputRule) {
      // Store original path
      paths.add(m.inputRule)
      
      // Store case-insensitive version
      const lowerPath = m.inputRule.toLowerCase()
      if (!caseInsensitiveMap.has(lowerPath)) {
        caseInsensitiveMap.set(lowerPath, [])
      }
      caseInsensitiveMap.get(lowerPath).push(m.inputRule)
      
      // ... handle fanout paths similarly
    }
  })

  // Store map for use in tree node checking
  this.mappedPathsCaseInsensitiveMap = caseInsensitiveMap
  
  return paths
}
```

### 2. Added Data Property
**File:** `Step5_Mapping.vue`

Added new data property to store the case-insensitive map:
```javascript
data () {
  return {
    // ...existing properties
    
    // Case-insensitive path mapping for tree highlighting
    mappedPathsCaseInsensitiveMap: new Map(), // Map<lowercase path, [original paths]>
  }
}
```

### 3. Passed Map to Tree Components
**File:** `Step5_Mapping.vue`

Updated both desktop and mobile tree viewer instances:
```vue
<json-tree-viewer
  :data="jsonTreeData"
  :mapped-paths="mappedPathsSet"
  :mapped-paths-case-map="mappedPathsCaseInsensitiveMap"  <!-- NEW -->
  :highlighted-path="highlightedPath"
  :clickable-mode="true"
  :search-query="treeSearchQuery"
  @toggle-node="toggleNode"
  @node-click="handleTreeNodeClick"
/>
```

### 4. Updated JsonTreeViewer Component
**File:** `JsonTreeViewer.vue`

Added prop and passed it down to child nodes:
```javascript
props: {
  // ...existing props
  
  // NEW: Case-insensitive map for mapped paths
  mappedPathsCaseMap: {
    type: Map,
    default: () => new Map()
  }
}
```

### 5. Updated JsonTreeNode Component
**File:** `JsonTreeNode.vue`

#### Added Prop:
```javascript
props: {
  // ...existing props
  
  // NEW: Case-insensitive map for mapped paths
  mappedPathsCaseMap: {
    type: Map,
    default: () => new Map()
  }
}
```

#### Updated isMapped Computed Property (Case-Insensitive):
```javascript
isMapped () {
  if (!this.data.path) return false
  
  // First try exact match (fast path)
  if (this.mappedPaths.has(this.data.path)) {
    return true
  }
  
  // If no exact match, check case-insensitive map
  if (this.mappedPathsCaseMap && this.mappedPathsCaseMap.size > 0) {
    const lowerPath = this.data.path.toLowerCase()
    return this.mappedPathsCaseMap.has(lowerPath)
  }
  
  return false
}
```

#### Updated isHighlighted Computed Property (Case-Insensitive):
```javascript
isHighlighted () {
  if (!this.highlightedPath || !this.data.path) return false
  
  // First try exact match
  if (this.highlightedPath === this.data.path) {
    return true
  }
  
  // Try case-insensitive match
  return this.highlightedPath.toLowerCase() === this.data.path.toLowerCase()
}
```

## Files Modified
1. ✅ `frontend_standalone/src/components/wizard/steps/Step5_Mapping.vue`
   - Updated `mappedPathsSet` computed property
   - Added `mappedPathsCaseInsensitiveMap` data property
   - Passed map to JsonTreeViewer (desktop and mobile views)

2. ✅ `frontend_standalone/src/components/wizard/components/JsonTreeViewer.vue`
   - Added `mappedPathsCaseMap` prop
   - Passed prop to JsonTreeNode children

3. ✅ `frontend_standalone/src/components/wizard/components/JsonTreeNode.vue`
   - Added `mappedPathsCaseMap` prop
   - Updated `isMapped()` to use case-insensitive matching
   - Updated `isHighlighted()` to use case-insensitive matching
   - Passed prop to recursive child nodes

## How It Works

### Mapping Index Building (Step5_Mapping.vue)
1. When mappings are loaded, create a Map where:
   - **Key:** Lowercase version of path (e.g., `$.eventname`)
   - **Value:** Array of original paths with various casings (e.g., `['$.eventName', '$.EventName']`)

2. This map is built for both:
   - Direct inputRule paths
   - Reconstructed fanout paths (e.g., `$.parent[*].field`)

### Tree Node Checking (JsonTreeNode.vue)
1. When rendering a tree node, first try **exact match** (fast path)
2. If no exact match, convert the node's path to lowercase and check the case-insensitive map
3. If found in the map → show checkmark ✓
4. If not found → no checkmark

### Example Scenarios

#### Scenario 1: Exact Match (Fast Path)
- **Policy:** `$.timestamp`
- **Sample Data:** `$.timestamp`
- **Result:** ✓ Immediate match via Set.has()

#### Scenario 2: Case Mismatch (Case-Insensitive Match)
- **Policy:** `$.eventName`
- **Sample Data:** `$.EventName`
- **Result:** ✓ Match via case-insensitive map
  - Node path: `$.EventName` → lowercase: `$.eventname`
  - Map lookup: `mappedPathsCaseInsensitiveMap.has('$.eventname')` → `true`

#### Scenario 3: Fanout Field Case Mismatch
- **Policy:** `$.Records[*].userIdentity` (relative path from fanout parent)
- **Sample Data Tree:** `$.records[*].useridentity`
- **Result:** ✓ Match via case-insensitive map
  - Reconstructed path: `$.Records[*].userIdentity`
  - Tree path: `$.records[*].useridentity`
  - Both converted to lowercase → match found

## Performance Considerations

### Optimizations
1. **Fast Path First:** Exact match check happens first (O(1) Set lookup)
2. **Lazy Evaluation:** Case-insensitive check only runs if exact match fails
3. **Map Size Check:** Skip case-insensitive logic if map is empty
4. **Single Lowercase Conversion:** Each path converted to lowercase only once during map building

### Complexity
- **Exact Match:** O(1) - Set.has()
- **Case-Insensitive Match:** O(1) - Map.has() with lowercase key
- **Total:** O(1) for both paths

## Testing Recommendations

### Test Cases to Verify

1. **All Lowercase Policy, Title Case Sample**
   - Policy: `$.eventname`
   - Sample: `$.EventName`
   - Expected: ✓ Highlighted

2. **Title Case Policy, All Lowercase Sample**
   - Policy: `$.EventName`
   - Sample: `$.eventname`
   - Expected: ✓ Highlighted

3. **Mixed Case Policy and Sample**
   - Policy: `$.userIdentity.userName`
   - Sample: `$.UserIdentity.Username`
   - Expected: ✓ Highlighted

4. **Fanout Fields with Case Mismatch**
   - Policy: `$.Records[*].eventName`
   - Sample Tree: `$.records[*].EventName`
   - Expected: ✓ Highlighted

5. **Exact Match (Baseline)**
   - Policy: `$.timestamp`
   - Sample: `$.timestamp`
   - Expected: ✓ Highlighted (fast path)

6. **No Match**
   - Policy: `$.eventType`
   - Sample: `$.eventName` (different field)
   - Expected: No highlight (correct behavior)

## Benefits

1. ✅ **Consistent Highlighting:** Fields mapped from policy are highlighted regardless of case differences
2. ✅ **Better User Experience:** Users can see which fields are mapped even with case mismatches
3. ✅ **Update Mode Compatibility:** Works seamlessly with policy upload feature
4. ✅ **Performance Maintained:** Fast path ensures no performance degradation for exact matches
5. ✅ **Backward Compatible:** Exact matches still work the same way

## Validation Status
- ✅ No TypeScript/ESLint errors
- ✅ All files successfully edited
- ✅ Prop passing chain complete: Step5 → JsonTreeViewer → JsonTreeNode
- ✅ Both desktop and mobile views updated

## Related Features
This fix complements the existing case-insensitive features:
- Case-insensitive field matching in Step 3 (Schema Config)
- Case-insensitive property access utilities
- Policy upload and prefill functionality
