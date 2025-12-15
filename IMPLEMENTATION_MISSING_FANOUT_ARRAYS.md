# Implementation: Missing Fanout Arrays Handling

## Overview
This implementation adds logic to handle missing fanout arrays in Step 3 of the Schema Config wizard. When a policy file defines fanout arrays that are not present in the sample data, the UI now:
1. Injects these missing arrays as synthetic candidates into the fanout tree
2. Pre-selects them to reflect the policy configuration
3. Visually highlights them with warning badges and tooltips
4. Displays them in the selected arrays list with appropriate indicators

## Problem Statement
Previously, when a policy defined fanout arrays like `$.requestParameters.changeBatch.changes[*]` that didn't exist in the sample data, they would not appear in the fanout tree and could not be selected. This created a mismatch between the policy definition and what the UI could represent.

## Solution
The solution injects missing arrays as synthetic nodes in three key areas:
1. **Data Layer**: Creates synthetic candidate objects with `isMissing: true` metadata
2. **Tree Structure**: Injects synthetic array nodes into the tree data structure
3. **Visual Feedback**: Displays warning badges in both the tree view and selected arrays list

## Changes Made

### 1. Step3_SchemaConfig.vue

#### A. Missing Array Injection in `prefillFromPolicy` Method
**Location**: Lines ~1217-1264

When processing fanout paths from the policy, if a path is not found in candidates:
```javascript
// Inject missing fanout array as a synthetic candidate
const normalizedPath = fanoutPath.replace(/^\$\./, '').replace(/\[\*\]/g, '')

const syntheticCandidate = {
  path: normalizedPath,
  parentPath: null,
  isHomogeneous: true,
  elementType: 'unknown',
  isParsedField: false,
  isNestedFanout: false,
  isMissing: true, // Mark as missing from sample data
  originalPolicyPath: fanoutPath
}

// Add to fanoutCandidates and selectedFanoutFields
this.fanoutCandidates.push(syntheticCandidate)
this.selectedFanoutFields.push(normalizedPath)

// Track in missing fields for warning display
missingFields.push({
  type: 'fanout',
  path: normalizedPath,
  message: 'Array field defined in policy but not found in current sample data',
  reason: 'missing',
  originalPath: fanoutPath
})
```

The same logic was applied for child fanouts (nested arrays).

#### B. Computed Property: `missingFanoutArrayPaths`
**Location**: Lines ~383-390

Extracts the paths of missing fanout arrays for tree visualization:
```javascript
missingFanoutArrayPaths () {
  return this.fanoutCandidates
    .filter(c => c.isMissing)
    .map(c => c.path)
}
```

#### C. Enhanced `fanoutArrayTreeData` Computed Property
**Location**: Lines ~401-468

Injects synthetic nodes for missing arrays into the tree structure:
```javascript
// Inject synthetic nodes for missing fanout arrays
const missingArrays = this.fanoutCandidates.filter(c => c.isMissing)
if (missingArrays.length > 0) {
  data = JSON.parse(JSON.stringify(data)) // Clone to avoid mutations
  
  for (const missingArray of missingArrays) {
    const path = missingArray.path
    const parts = path.split('.')
    
    // Navigate/create the path in the data structure
    let current = data
    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i]
      if (!current[part]) {
        current[part] = {} // Create intermediate object
      }
      current = current[part]
    }
    
    // Set the final array node with a marker
    const lastPart = parts[parts.length - 1]
    if (!current[lastPart]) {
      current[lastPart] = []
      current[lastPart].__isMissing = true
    }
  }
}
```

#### D. Helper Method: `isFanoutArrayMissing`
**Location**: Lines ~995-1002

Checks if a fanout array is marked as missing:
```javascript
isFanoutArrayMissing (arrayPath) {
  const candidate = this.fanoutCandidates.find(f => f.path === arrayPath)
  return candidate?.isMissing || false
}
```

#### E. Template Updates
**Location**: Lines ~241 (tree viewer), ~267-317 (selected arrays list)

1. **Tree Viewer**: Pass missing array paths to JsonTreeViewer:
```vue
<JsonTreeViewer
  :missing-array-paths="missingFanoutArrayPaths"
  ...
/>
```

2. **Selected Arrays List**: Add warning badge for missing arrays:
```vue
<q-badge
  v-if="isFanoutArrayMissing(array)"
  color="orange"
  text-color="white"
  class="q-ml-sm"
>
  <q-icon name="warning" size="xs" class="q-mr-xs" />
  Missing
  <q-tooltip>
    This array is defined in the policy but not found in the current sample data
  </q-tooltip>
</q-badge>
```

### 2. JsonTreeViewer.vue

#### A. New Prop: `missingArrayPaths`
**Location**: Lines ~74-79

Accepts the list of missing array paths from parent:
```javascript
missingArrayPaths: {
  type: Array,
  default: () => []
}
```

#### B. Pass Prop to Child Nodes
**Location**: Lines ~24

Passes missing array paths to JsonTreeNode:
```vue
<json-tree-node
  :missing-array-paths="missingArrayPaths"
  ...
/>
```

### 3. JsonTreeNode.vue

#### A. New Prop: `missingArrayPaths`
**Location**: Lines ~189-195

Receives missing array paths from parent:
```javascript
missingArrayPaths: {
  type: Array,
  default: () => []
}
```

#### B. Computed Property: `isMissingArray`
**Location**: Lines ~446-463

Determines if the current array node is missing from sample data:
```javascript
const isMissingArray = computed(() => {
  if (!isArray.value) return false
  
  const normalizePath = (path) => {
    if (!path) return ''
    return path
      .replace(/^\$\.?/, '') // Remove $. or $ prefix
      .replace(/\[0\]$/, '') // Remove [0] suffix
      .replace(/\[\*\]$/, '') // Remove [*] suffix
  }

  const normalizedCurrentPath = normalizePath(props.path)
  
  return props.missingArrayPaths.some(missingPath => {
    const normalizedMissingPath = normalizePath(missingPath)
    return normalizedMissingPath === normalizedCurrentPath ||
           normalizedCurrentPath.endsWith('.' + normalizedMissingPath)
  })
})
```

#### C. Template: Warning Badge
**Location**: Lines ~73-82

Displays warning badge for missing arrays:
```vue
<q-badge
  v-if="isArray && isMissingArray"
  color="orange"
  text-color="white"
  class="q-ml-sm"
>
  <q-icon name="warning" size="xs" class="q-mr-xs" />
  Missing
  <q-tooltip>
    This array is defined in the policy but not found in the current sample data
  </q-tooltip>
</q-badge>
```

#### D. Pass Prop to Child Nodes
**Location**: Lines ~109, ~128

Passes missing array paths to child nodes recursively:
```vue
<json-tree-node
  :missing-array-paths="missingArrayPaths"
  ...
/>
```

#### E. CSS Styling
**Location**: Lines ~927-932

Visual highlighting for missing array nodes:
```css
/* Style for missing array indicators */
.node-content:has(.selection-controls .q-badge) {
  background-color: rgba(255, 152, 0, 0.05);
  border-left: 2px solid #ff9800;
  padding-left: 4px;
  margin-left: -6px;
}
```

#### F. Expose `isMissingArray` in Setup Return
**Location**: Lines ~771

Added to the return statement to make it available in template:
```javascript
return {
  ...
  isMissingArray,
  ...
}
```

## User Experience

### When Loading a Policy with Missing Arrays

1. **Step 3 Loads**: The wizard analyzes the policy and compares fanout arrays with sample data

2. **Missing Arrays Injected**: Arrays like `$.requestParameters.changeBatch.changes[*]` that don't exist in sample data are:
   - Created as synthetic candidates with `isMissing: true`
   - Automatically selected (checked) to reflect policy configuration
   - Injected into the tree structure with synthetic parent nodes if needed

3. **Visual Indicators**:
   - **In Tree**: Orange "Missing" badge next to the checkbox with tooltip
   - **In Selected List**: Same orange "Missing" badge with explanatory tooltip
   - **Background Highlight**: Subtle orange background and left border for missing array rows
   - **Caption**: "Not found in current sample data" message

4. **User Can**:
   - See all arrays defined in the policy, even if missing
   - Understand which arrays are missing via clear visual cues
   - Keep them selected to maintain policy fidelity
   - Deselect them if desired (e.g., if they're no longer needed)

### Example Scenario

**Policy defines**: 
- `$.log.Records[*]` (exists in sample)
- `$.requestParameters.changeBatch.changes[*]` (missing from sample)

**Result in UI**:
- Both arrays appear in the tree
- Both are checked
- First array: Normal appearance
- Second array: Orange "Missing" badge with warning icon
- User sees clear indication of what's in sample vs. what's policy-only

## Technical Details

### Path Normalization
Missing arrays are normalized to remove:
- `$.` prefix
- `[*]` wildcards
- `[0]` indices

This ensures consistent matching across different path formats.

### Synthetic Node Structure
```javascript
{
  path: "requestParameters.changeBatch.changes",
  parentPath: null,
  isHomogeneous: true,
  elementType: "unknown",
  isParsedField: false,
  isNestedFanout: false,
  isMissing: true,
  originalPolicyPath: "$.requestParameters.changeBatch.changes[*]"
}
```

### Tree Data Injection
The implementation creates intermediate objects as needed:
```
data = {
  requestParameters: {          // Created if missing
    changeBatch: {              // Created if missing
      changes: []               // Created with __isMissing marker
    }
  }
}
```

## Benefits

1. **Policy Fidelity**: UI accurately represents all arrays in the policy, not just those in sample data
2. **Transparency**: Users see exactly what's missing with clear visual indicators
3. **Flexibility**: Users can keep or remove missing arrays as needed
4. **No Data Loss**: Policy configuration is preserved during round-trip editing
5. **Better UX**: Clear tooltips and badges explain the situation to users

## Testing Scenarios

### Scenario 1: Policy with Missing Top-Level Array
- Policy: `$.missingArray[*]`
- Sample: No `missingArray` field
- Expected: Array appears in tree with warning badge, pre-selected

### Scenario 2: Policy with Missing Nested Array
- Policy: `$.log.Records[*]`, `$.requestParameters.changeBatch.changes[*]`
- Sample: Has `log.Records` but not `requestParameters.changeBatch.changes`
- Expected: Both arrays appear, first normal, second with warning badge

### Scenario 3: Policy with Multiple Missing Arrays
- Policy: Three arrays, two missing
- Expected: All three appear, two with warning badges

### Scenario 4: User Deselects Missing Array
- Action: User unchecks missing array
- Expected: Array remains in tree (still visible), just unchecked

## Future Enhancements

1. **Smart Detection**: Suggest similar paths if exact match not found
2. **Path Editor**: Allow users to edit missing array paths directly in UI
3. **Sample Data Upload**: Provide option to upload alternate sample with missing arrays
4. **Validation**: Warn if many arrays are missing (suggests wrong sample data)
5. **Documentation Link**: Add help link explaining why arrays might be missing

## Related Files
- `Step3_SchemaConfig.vue`: Main wizard step component
- `JsonTreeViewer.vue`: Tree visualization component
- `JsonTreeNode.vue`: Individual tree node component
- `schemaRuleService.js`: Schema analysis service (unchanged but related)

## Commit Message
```
feat: Inject and highlight missing fanout arrays in Step 3 wizard

- Inject policy-defined fanout arrays that don't exist in sample data
- Add synthetic candidates with isMissing metadata
- Display orange warning badges in tree and selected list
- Create intermediate parent nodes as needed for missing arrays
- Enhance visual feedback with tooltips and background highlighting
- Preserve policy fidelity during round-trip editing

Fixes issue where nested fanout arrays from policy were not shown
in the UI when missing from sample data (e.g., 
$.requestParameters.changeBatch.changes[*])
```
