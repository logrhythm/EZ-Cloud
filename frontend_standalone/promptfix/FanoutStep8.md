# Schema Rule Fanout Configuration - Step 7 (Final Review) Enhancement

## Overview
Restructure the `schemaRule` section in Step 7 (Final Review/Export) to use a new `childfanouts` array structure that properly represents parent-child relationships between nested arrays.

## Problem Statement
The current implementation doesn't properly capture the hierarchical relationship between nested fanout arrays. We need a structure that shows which arrays are nested within other arrays, with proper relative paths.

## New Schema Rule Structure

### Top-Level Structure
```json
{
  "schemaRule": {
    "childfanouts": [
      // Array of fanout configurations (see below)
    ],
    "convertToJson": ["$.response", "$.value"]  // Existing JSON-to-String fields (unchanged)
  }
}
```

### Key Changes
1. **New attribute**: `childfanouts` - Array of fanout configuration objects
2. **Keep existing**: `convertToJson` - Works as currently implemented (no changes needed)
3. **Remove**: Old fanout input field implementation (deprecated)

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

### Expected childfanouts Output
```json
{
  "childfanouts": [
    {
      "field": "$.tags[*]",
      "parentpath": null
    },
    {
      "field": "$.numbersList[*]",
      "parentpath": null
    },
    {
      "field": "$.outerArray[*]",
      "parentpath": null
    },
    {
      "field": "$.innerArrayLevel1[*]",
      "parentpath": "$.outerArray[*]"
    },
    {
      "field": "$.innerArrayLevel2[*]",
      "parentpath": "$.innerArrayLevel1[*]"
    },
    {
      "field": "$.dataItems[*]",
      "parentpath": null
    },
    {
      "field": "$.subItems[*]",
      "parentpath": "$.dataItems[*]"
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

### Step 3 (Schema Rules) Changes
1. When user selects arrays for fanout in Step 3, track the hierarchy
2. Build a tree structure showing parent-child relationships
3. Store this hierarchy in Vuex state

### Step 7 (Export/Review) Changes
1. Replace old fanout structure with new `childfanouts` array
2. Generate childfanouts array from fanout selections in Step 3
3. For each selected fanout array:
   - Determine if it has a parent array
   - If yes, set `parentpath` to parent array's path
   - If no, set `parentpath` to `null`
   - Set `field` to the array's path (absolute for root, relative for nested)

### Validation Rules
1. **No circular references**: A cannot be parent of B if B is parent of A
2. **Parent must exist**: If `parentpath` is not null, it must exist as a `field` in childfanouts
3. **Unique fields**: No duplicate `field` values in childfanouts array
4. **Path format**: All paths must use `[*]` notation for arrays

## Data Flow

### Current Flow (Before)
```
Step 3 → Vuex (flat array of fanouts) → Step 7 (old format)
```

### New Flow (After)
```
Step 3 → Vuex (hierarchical fanout tree) → Step 7 (childfanouts array)
```

## Edge Cases

1. **No fanouts selected**: `childfanouts` = `[]` (empty array)
2. **Only root-level fanouts**: All entries have `parentpath: null`
3. **Multiple root arrays**: Multiple entries with `parentpath: null`
4. **Sibling nested arrays**: Can have same parent
   ```json
   [
     { "field": "$.parent[*]", "parentpath": null },
     { "field": "$.child1[*]", "parentpath": "$.parent[*]" },
     { "field": "$.child2[*]", "parentpath": "$.parent[*]" }
   ]
   ```

## Backward Compatibility

### Migration Strategy
- Existing policies with old fanout format should be migrated
- Add migration logic to convert old format → new format
- Log warnings for deprecated fanout structure

### Old Format (Deprecated)
```json
{
  "fanout": ["$.array1[*]", "$.array2[*]"]  // Flat array (OLD)
}
```

### New Format
```json
{
  "childfanouts": [
    { "field": "$.array1[*]", "parentpath": null },
    { "field": "$.array2[*]", "parentpath": null }
  ]
}
```

## Testing Scenarios

1. **Single root array**: Verify `parentpath: null`
2. **Nested array (2 levels)**: Verify parent-child relationship
3. **Deeply nested (3+ levels)**: Verify chain of relationships
4. **Multiple root arrays**: Verify all have `parentpath: null`
5. **Sibling arrays**: Verify same parent, different fields
6. **No fanouts**: Verify empty array

## Files to Modify

1. **Step 3 Component**: Track fanout hierarchy during selection
2. **Vuex Store** (`wizard.js`): Update state to store hierarchical structure
3. **Step 7 Component**: Generate `childfanouts` array from hierarchy
4. **Export Service**: Format output with new structure
5. **Validation Service**: Add validation rules for childfanouts

## Summary

The new `childfanouts` structure provides:
- ✅ Clear parent-child relationships between nested arrays
- ✅ Proper hierarchical representation
- ✅ Validation of relationships
- ✅ Support for deeply nested arrays
- ✅ Maintains existing `convertToJson` functionality
- ✅ Better data model for complex JSON structures
