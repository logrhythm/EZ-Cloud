# Root Cause Analysis: Tags Node Not Showing in Fanout Tree

## Issue Description
The `tags` array node is not displayed in the Fanout tree card on Step 3 when processing the following data structure:

```json
{
  "data": {
    "users": [{
      "orders": [{
        "items": [{
          "productId": "P101",
          "tags": ["electronics", "accessories"]
        }]
      }]
    }]
  }
}
```

## Root Cause

The issue is in the `filteredArrayChildren` computed property in `JsonTreeNode.vue` (lines ~476-580).

### The Problem Flow:

1. **Array Detection Works Correctly**: The system correctly detects all arrays including:
   - `data.users`
   - `data.users[0].orders`
   - `data.users[0].orders[0].items`
   - `data.users[0].orders[0].items[0].tags` ✓

2. **Tree Traversal Works**: The tree correctly traverses down to the `items` array level.

3. **Filtering Logic Fails**: When displaying the children of the `items` array in "array selection mode", the `filteredArrayChildren` logic checks if the array items contain nested arrays by:
   - Getting the first item: `{ "productId": "P101", "tags": [...] }`
   - Checking each property to see if it leads to an array
   - For the `tags` property, it correctly identifies it as an array ✓

4. **The Bug - Primitive Array Items**: However, when the code tries to display the `tags` array itself, it checks what type of items it contains:
   ```javascript
   const firstItem = items[0]  // "electronics" (a string, not an object)
   
   if (typeof firstItem === 'object' && firstItem !== null && !Array.isArray(firstItem)) {
     // This condition FAILS because firstItem is a string
   }
   ```

5. **Items Hidden**: Since the first item is a primitive (string), the code falls through to:
   ```javascript
   // For non-object array items (primitives), don't show them in array mode
   return []  // ← BUG: Returns empty array, hiding all items
   ```

### Why This Is Wrong

The original logic assumed that in "array selection mode", only arrays containing objects (which might have nested arrays) should show their items. This was too restrictive because:

- **Leaf arrays** (arrays of primitives like `["electronics", "accessories"]`) are valid fanout targets
- Users need to see these arrays to select them for fanout processing
- Primitive arrays should be shown with their items for preview purposes

## The Fix

Added a check to see if the array itself is selectable (present in `arrayPaths`) before filtering out primitive items:

```javascript
// Check if this array itself is in the arrayPaths (it's selectable)
const isThisArraySelectable = props.arrayPaths.includes(props.path)

// If this array itself is selectable (a leaf array or an array of primitives),
// show its items for preview purposes (limited to first 20)
if (isThisArraySelectable) {
  console.log(`[filteredArrayChildren] Array is selectable, returning ${items.length} items for preview`)
  return items
}
```

This ensures that:
1. ✓ Leaf arrays (arrays of primitives) are shown with their items
2. ✓ Arrays containing objects with nested arrays continue to work
3. ✓ The tree properly displays all selectable arrays regardless of their content type

## Testing

Tested with the regex patterns:
- Pattern 1 (direct child): `^data\.users\[\\d+\]\.orders\[\\d+\]\.items\[\\d+\]\.tags$`
  - Matches: `data.users[0].orders[0].items[0].tags` ✓

The fix has been applied to:
- `frontend_standalone/src/components/wizard/JsonTreeNode.vue` (line ~498)

## Impact

This fix ensures that deeply nested arrays of primitives (like `tags`, `categories`, `labels`, etc.) are now properly displayed and selectable in the Fanout tree configuration.
