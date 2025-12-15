- This prompt is about handling fanout arrays for new implemention in step 3, to read them policy file and show them in Json fanout tree as selected  

### The Old and Legacy implementation 
- The old implementatiom of adding fanout arrays in policy file is 'Schemarule' attribute has child attribute 'fanout' and 'fanout' has child attribute 'inputField'
The Old schema section look like blow :
 "schemaRule": {
    "fanout": {
      "inputField": [ "$.log.Records[*]", "$.requestParameters.changeBatch.changes[*]" ]
    },
    "convertoJson": [
      "$.log"
    ]
  }

  - The reading of this old section is and showing it on UI as selected in fanout array tree is working fine


  ### The New Implemamntion 
- The new implemenation The 'schemaRule' attribute contains child attribute 'childfanouts' which is a an array or can be null. 
- Both OLd and new implementaion can't exsists in same policy file, it has to be either old implementaion or new one
The new sction look like :
```json
{
  "schemaRule": {
    "childfanouts": [
      // Array of fanout configurations (see below)
    ],
    "convertToJson": ["$.response", "$.value"]  // Existing JSON-to-String fields (unchanged)
  }
}

## Child Fanouts Array Structure

### Object Schema
Each object in the `childfanouts` array has two properties:

```typescript
{
  field: string,       // JSON path to the array field (with [*] notation)
  parentpath: string | null  // JSON path to parent array, or null if root-level
}
```

### Rules for `field` and `parentpath`

#### 1. Root-Level Arrays
- Arrays at the root level of the JSON structure
- **`parentpath`**: `null` (no parent)
- **`field`**: Absolute path from root with `[*]`

**Example:**
```json
{
  "field": "$.tags[*]",
  "parentpath": null
}
```

#### 2. Nested Arrays (Single Level)
- Arrays nested within another array
- **`parentpath`**: Absolute path to immediate parent array (must exist as a `field` value elsewhere in childfanouts)
- **`field`**: Path relative to parent array (NOT absolute from root)

**Example:**
```json
{
  "field": "$.subItems[*]",
  "parentpath": "$.dataItems[*]"
}
```

#### 3. Deeply Nested Arrays (Multiple Levels)
- Arrays nested multiple levels deep
- **`parentpath`**: Path to immediate parent (which itself may have a parent)
- **`field`**: Always relative to the immediate parent
- Chain of relationships: Each `parentpath` should exist as a `field` in another childfanouts entry

**Example:**
```json
// Level 1: Root array
{ "field": "$.outerArray[*]", "parentpath": null }

// Level 2: Nested in outerArray
{ "field": "$.innerArrayLevel1[*]", "parentpath": "$.outerArray[*]" }

// Level 3: Nested in innerArrayLevel1
{ "field": "$.innerArrayLevel2[*]", "parentpath": "$.innerArrayLevel1[*]" }
```

## Complete Example

### Input JSON Structure
```json
{
  "tags": [
    { "tag": "alpha" },
    { "tag": "beta" },
    { "tag": "gamma" }
  ],

  "numbersList": [
    { "num": 10 },
    { "num": 20 },
    { "num": 30 }
  ],

  "outerArray": [
    {
      "step": 1,
      "innerArrayLevel1": [
        {
          "level": "L1-A",
          "innerArrayLevel2": [
            { "value": "L2-1" },
            { "value": "L2-2" }
          ]
        },
        {
          "level": "L1-B",
          "innerArrayLevel2": [
            { "value": "L2-3" },
            { "value": "L2-4" }
          ]
        }
      ]
    }
  ],

  "dataItems": [
    {
      "itemId": "ITM001",
      "subItems": [
        { "subId": "SUB1", "desc": "Sub Item 1" },
        { "subId": "SUB2", "desc": "Sub Item 2" }
      ]
    },
    {
      "itemId": "ITM002",
      "subItems": [
        { "subId": "SUB3", "desc": "Sub Item 3" },
        { "subId": "SUB4", "desc": "Sub Item 4" }
      ]
    }
  ]
}
```

## Path Relativity Rules

### Important Concepts

1. **Absolute vs Relative Paths**:
   - **Root-level arrays**: Always use absolute paths (starting with `$`)
   - **Nested arrays**: Field paths are relative to their parent

2. **Parent-Child Validation**:
   - Every `parentpath` value (except `null`) MUST exist as a `field` value in another childfanouts entry
   - This creates a chain of relationships

3. **Path Examples**:
   ```
   Root level:
   - Field: "$.tags[*]"
   - Parentpath: null
   
   One level nested:
   - Field: "$.subItems[*]"  (relative to parent)
   - Parentpath: "$.dataItems[*]"  (parent is root-level)
   
   Two levels nested:
   - Field: "$.innerArrayLevel2[*]"  (relative to immediate parent)
   - Parentpath: "$.innerArrayLevel1[*]"  (immediate parent)
   - Note: $.innerArrayLevel1[*] has its own parentpath: "$.outerArray[*]"
   ```

## Implementation Requirements

### ✅ IMPLEMENTED - Detection and Routing
- **Automatic detection** of implementation type (old vs new format)
- If `schemaRule.fanout.inputField` exists → use OLD implementation logic
- If `schemaRule.childfanouts` exists → use NEW implementation logic  
- If neither exists → no fanout processing
- **Backward compatibility** maintained - old format continues to work as-is

### ✅ IMPLEMENTED - New Format Processing  
- **Hierarchical path resolution** with parent-child relationship tracking
- **Two-pass algorithm**:
  1. **Pass 1**: Process root-level arrays (parentpath === null)
  2. **Pass 2**: Resolve nested arrays using parent paths (iterative resolution)
- **Path resolution map** tracks absolute paths for each field
- **Relative-to-absolute conversion** for nested arrays
- **Maximum 10 iterations** to handle deeply nested structures

### ✅ IMPLEMENTED - Missing Array Handling
- **Synthetic candidate injection** for missing arrays (both old and new formats)
- **Visual indicators** with orange "Missing" badges
- **Tooltips** explaining arrays are from policy but not in sample
- **Parent-child tracking** for nested missing arrays
- Missing arrays are:
  - Added to `fanoutCandidates` with `isMissing: true`
  - Pre-selected in the UI
  - Highlighted with warning badges
  - Tracked in `missingPolicyFields` array

### Key Features

#### Path Resolution Logic
1. **Root Arrays** (parentpath === null):
   - Use field path as-is (already absolute)
   - Example: `$.tags[*]` → normalized to `tags`

2. **Nested Arrays** (parentpath !== null):
   - Wait for parent to be resolved first
   - Construct absolute path: `parent.absolute.path + relative.field.path`
   - Example:
     - Parent: `$.dataItems[*]` → `dataItems`  
     - Field: `$.subItems[*]` (relative)
     - Result: `dataItems.subItems`

3. **Multi-Level Nesting**:
   - Iterative resolution (up to 10 passes)
   - Each pass resolves children whose parents are already resolved
   - Tracks unprocessed fanouts and retries until all resolved

#### Path Normalization
All paths normalized by removing:
- `$.` prefix
- `[*]` wildcards
- `[0]` array indices

#### Candidate Matching
Tries multiple format variations:
- Original path
- Without `$.` prefix  
- Without `[*]` wildcards
- Without `[0]` indices
- All combinations

### Implementation Methods

#### `processChildFanoutsOld(fanoutPaths, missingFields)`
Handles old format (flat array of absolute paths):
- Iterates through `fanout.inputField` array
- Finds matching candidates using format variations
- Injects missing arrays as synthetic candidates
- Pre-selects all arrays in UI

#### `processChildFanoutsNew(childFanouts, missingFields)`
Handles new format (hierarchical with parent-child):
- **Phase 1**: Process root-level arrays
- **Phase 2**: Iteratively resolve nested arrays
- Uses `pathResolutionMap` to track absolute paths
- Constructs absolute paths from parent + relative field
- Injects missing arrays with parent tracking

#### `normalizeFanoutPath(path)`
Utility to normalize any path format:
- Removes `$.` prefix
- Removes `[*]` wildcards  
- Returns consistent format for matching

#### `findFanoutCandidate(fanoutPath)`
Searches candidates using format variations:
- Tries all path format combinations
- Returns matched candidate path or null
- Logs all attempts for debugging

#### `injectMissingFanoutArray(fanoutPath, parentPath, missingFields)`
Creates synthetic candidate for missing array:
- Normalizes paths
- Creates candidate with `isMissing: true`
- Adds to fanoutCandidates and selectedFanoutFields
- Tracks in missingFields for UI warnings

### Validation Rules
1. **No circular references**: A cannot be parent of B if B is parent of A
2. **Parent must exist**: If `parentpath` is not null, it must exist as a `field` in childfanouts
3. **Unique fields**: No duplicate `field` values in childfanouts array
4. **Path format**: All paths must use `[*]` notation for arrays

## Testing Scenarios

### Scenario 1: Old Format with All Arrays Present
**Policy:**
```json
{
  "schemaRule": {
    "fanout": {
      "inputField": ["$.log.Records[*]", "$.tags[*]"]
    }
  }
}
```
**Expected:**
- Both arrays found in candidates
- Both pre-selected in UI
- No missing array warnings

### Scenario 2: Old Format with Missing Array
**Policy:**
```json
{
  "schemaRule": {
    "fanout": {
      "inputField": ["$.log.Records[*]", "$.missingArray[*]"]
    }
  }
}
```
**Expected:**
- `log.Records` found and selected normally
- `missingArray` injected as synthetic candidate
- Orange "Missing" badge shown for `missingArray`
- Both arrays pre-selected

### Scenario 3: New Format - Root Level Only
**Policy:**
```json
{
  "schemaRule": {
    "childfanouts": [
      { "field": "$.tags[*]", "parentpath": null },
      { "field": "$.numbers[*]", "parentpath": null }
    ]
  }
}
```
**Expected:**
- Both processed in Phase 1 (root arrays)
- Both found and selected (if present in sample)
- Or injected as missing if not in sample

### Scenario 4: New Format - Single Level Nesting
**Policy:**
```json
{
  "schemaRule": {
    "childfanouts": [
      { "field": "$.dataItems[*]", "parentpath": null },
      { "field": "$.subItems[*]", "parentpath": "$.dataItems[*]" }
    ]
  }
}
```
**Expected:**
- Phase 1: `dataItems` processed (root)
- Phase 2: `subItems` resolved using parent path
- Absolute path constructed: `dataItems.subItems`
- Both arrays selected in UI

### Scenario 5: New Format - Deep Nesting (3 Levels)
**Policy:**
```json
{
  "schemaRule": {
    "childfanouts": [
      { "field": "$.outerArray[*]", "parentpath": null },
      { "field": "$.innerLevel1[*]", "parentpath": "$.outerArray[*]" },
      { "field": "$.innerLevel2[*]", "parentpath": "$.innerLevel1[*]" }
    ]
  }
}
```
**Expected:**
- Pass 1: `outerArray` resolved
- Pass 2: `innerLevel1` resolved → `outerArray.innerLevel1`
- Pass 3: `innerLevel2` resolved → `outerArray.innerLevel1.innerLevel2`
- All three arrays selected

### Scenario 6: New Format - Missing Nested Array
**Policy:**
```json
{
  "schemaRule": {
    "childfanouts": [
      { "field": "$.dataItems[*]", "parentpath": null },
      { "field": "$.missingSubArray[*]", "parentpath": "$.dataItems[*]" }
    ]
  }
}
```
**Expected:**
- `dataItems` found and selected
- `missingSubArray` not found in sample
- Synthetic candidate created: `dataItems.missingSubArray`
- Orange "Missing" badge with parent info
- Both pre-selected

### Scenario 7: Mixed - Old and New Format Detection
**Policy with Old Format:**
```json
{ "schemaRule": { "fanout": { "inputField": [...] } } }
```
**Expected:** Uses `processChildFanoutsOld()`

**Policy with New Format:**
```json
{ "schemaRule": { "childfanouts": [...] } }
```
**Expected:** Uses `processChildFanoutsNew()`

**Policy with Neither:**
```json
{ "schemaRule": {} }
```
**Expected:** No fanout processing, UI shows "No arrays detected"

## Example: Complete New Format Workflow

### Input Sample Data
```json
{
  "tags": [{"tag": "alpha"}, {"tag": "beta"}],
  "dataItems": [
    {
      "itemId": "ITM001",
      "subItems": [
        {"subId": "SUB1"},
        {"subId": "SUB2"}
      ]
    }
  ]
}
```

### Policy (New Format)
```json
{
  "schemaRule": {
    "childfanouts": [
      { "field": "$.tags[*]", "parentpath": null },
      { "field": "$.dataItems[*]", "parentpath": null },
      { "field": "$.subItems[*]", "parentpath": "$.dataItems[*]" },
      { "field": "$.missingArray[*]", "parentpath": null }
    ]
  }
}
```

### Processing Steps

1. **Detection**: `hasNewImplementation = true` → Use `processChildFanoutsNew()`

2. **Phase 1 - Root Arrays**:
   ```
   Process: $.tags[*]
   - Normalize: "tags"
   - Find in candidates: ✓ Found
   - Add to selections: ✓
   
   Process: $.dataItems[*]
   - Normalize: "dataItems"
   - Find in candidates: ✓ Found
   - Add to selections: ✓
   - Store in pathResolutionMap: "$.dataItems[*]" → "dataItems"
   
   Process: $.missingArray[*]
   - Normalize: "missingArray"
   - Find in candidates: ✗ Not found
   - Inject synthetic candidate
   - Add to selections with isMissing=true
   ```

3. **Phase 2 - Nested Arrays (Pass 1)**:
   ```
   Process: $.subItems[*] (parent: $.dataItems[*])
   - Look up parent in pathResolutionMap: "dataItems" ✓
   - Construct absolute: "dataItems" + "subItems" = "dataItems.subItems"
   - Find in candidates: ✓ Found
   - Add to selections: ✓
   - Store in pathResolutionMap: "$.subItems[*]" → "dataItems.subItems"
   ```

4. **Final UI State**:
   - ✅ `tags` - Normal (from sample)
   - ✅ `dataItems` - Normal (from sample)
   - ✅ `dataItems.subItems` - Nested badge (from sample)
   - ⚠️ `missingArray` - Missing badge (synthetic)

## Error Handling

### Unresolved Parent
If a child's parent is never resolved (doesn't exist in childfanouts):
```
[Step 3] ⚠️ Parent path not yet resolved, deferring
[Step 3] ⚠️ Failed to resolve all nested fanouts after 10 iterations
[Step 3] Unresolved fanouts: ["$.orphanChild[*]"]
```

### Circular Reference Detection
Not explicitly implemented but prevented by:
- Iterative resolution (children can't resolve before parents)
- Maximum 10 iterations limit
- Parent must exist in childfanouts array

### Path Format Mismatch
If policy uses unsupported format:
```
[Step 3] Trying path variations: [...]
[Step 3] ⚠️ Fanout path not found in candidates
[Step 3] 📌 Injecting missing fanout array as synthetic candidate
```

## Code Flow Diagram

```
prefillFromPolicy()
  ↓
Detect Implementation Type
  ├─→ hasNewImplementation?
  │   ├─ YES → processChildFanoutsNew()
  │   │         ├─→ Phase 1: Process root arrays
  │   │         │   └─→ For each (parentpath === null)
  │   │         │       ├─→ findFanoutCandidate()
  │   │         │       ├─→ If found: Add to selections
  │   │         │       └─→ If not: injectMissingFanoutArray()
  │   │         ├─→ Phase 2: Process nested arrays
  │   │         │   └─→ Iterate until all resolved (max 10 passes)
  │   │         │       ├─→ Check parent in pathResolutionMap
  │   │         │       ├─→ Construct absolute path
  │   │         │       ├─→ findFanoutCandidate()
  │   │         │       ├─→ If found: Add to selections
  │   │         │       └─→ If not: injectMissingFanoutArray()
  │   │         └─→ Store in pathResolutionMap
  │   │
  │   └─ NO → hasOldImplementation?
  │           ├─ YES → processChildFanoutsOld()
  │           │         └─→ For each absolute path
  │           │             ├─→ findFanoutCandidate()
  │           │             ├─→ If found: Add to selections
  │           │             └─→ If not: injectMissingFanoutArray()
  │           │
  │           └─ NO → No fanout processing
  ↓
Update Vuex Store
  ├─→ selectedFanoutFields
  ├─→ missingPolicyFields
  └─→ childfanouts (if new format)
  ↓
Update UI
  ├─→ Tree view with selected arrays
  ├─→ Missing badges
  └─→ Selected arrays list
```

## Benefits of New Implementation

1. **✅ Backward Compatible**: Old format still works
2. **✅ Hierarchical Support**: Proper parent-child relationships
3. **✅ Relative Paths**: Nested arrays use relative paths (cleaner)
4. **✅ Missing Array Handling**: Visual feedback for policy-only arrays
5. **✅ Scalable**: Handles arbitrary nesting depth
6. **✅ Debuggable**: Extensive console logging
7. **✅ Fail-Safe**: 10-iteration limit prevents infinite loops
8. **✅ Transparent**: Users see what's from policy vs sample
9. **✅ Flexible**: Can keep or remove missing arrays
10. **✅ Maintainable**: Clear separation of old vs new logic

## Related Files
- `Step3_SchemaConfig.vue` - Main implementation
- `JsonTreeViewer.vue` - Tree visualization
- `JsonTreeNode.vue` - Node rendering with missing badges
- `schemaRuleService.js` - Schema analysis service
- `IMPLEMENTATION_MISSING_FANOUT_ARRAYS.md` - Original missing array feature doc

## Commit Message
```
feat: Add new childfanouts format with hierarchical path resolution

BREAKING CHANGE: Adds support for new childfanouts format alongside existing fanout.inputField format

- Detect old vs new implementation automatically
- Process root-level arrays first, then resolve nested arrays iteratively
- Convert relative paths to absolute using parent resolution map
- Handle missing arrays for both old and new formats with visual indicators
- Support up to 10 levels of nesting with iterative resolution
- Maintain backward compatibility with existing fanout.inputField format
- Add comprehensive logging for debugging path resolution

New format supports:
- Cleaner relative paths for nested arrays
- Explicit parent-child relationships
- Better hierarchy visualization
- More maintainable policy structure

Example new format:
{
  "childfanouts": [
    { "field": "$.tags[*]", "parentpath": null },
    { "field": "$.subItems[*]", "parentpath": "$.dataItems[*]" }
  ]
}

Fixes nested array selection and missing array injection for new policy format
```



