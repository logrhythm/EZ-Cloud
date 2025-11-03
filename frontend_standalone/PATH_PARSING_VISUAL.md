# Path Parsing Fix - Visual Explanation

## The Problem (Before Fix)

```
Input: "projects[0].teams[0].members"

                    ┌─ Filter removes dots
                    ↓
Split: ['projects', '[0]', '.', 'teams', '[0]', '.', 'members']
                             ❌                 ❌
                          REMOVED            REMOVED

Filtered: ['projects', '[0]', 'teams', '[0]', 'members']
                              ↑ No dot marker!

Build paths without knowing where dots should be:
  1. 'projects'
  2. 'projects[0]'
  3. 'projects[0]teams'        ❌ WRONG - no dot
  4. 'projects[0]teams[0]'     ❌ WRONG - no dot
  5. 'projects[0]teams[0]members'  ❌ WRONG - no dot
```

## The Solution (After Fix)

```
Input: "projects[0].teams[0].members"

                    ┌─ Keep dots, just trim whitespace
                    ↓
Split: ['projects', '[0]', '.', 'teams', '[0]', '.', 'members']
                             ✓                  ✓
                          KEPT               KEPT

Process token by token:

Token: 'projects' (property)
  currentPath = '' → 'projects'
  Result: 'projects'
  ✓

Token: '[0]' (index)
  currentPath = 'projects' → 'projects[0]'
  Result: 'projects[0]'
  ✓

Token: '.' (delimiter)
  Skip (will add before next property)
  ⏭

Token: 'teams' (property)
  currentPath = 'projects[0]'
  Add dot? Yes (currentPath is not empty)
  currentPath → 'projects[0]' + '.' + 'teams' = 'projects[0].teams'
  Result: 'projects[0].teams'
  ✅

Token: '[0]' (index)
  currentPath = 'projects[0].teams' → 'projects[0].teams[0]'
  Result: 'projects[0].teams[0]'
  ✅

Token: '.' (delimiter)
  Skip
  ⏭

Token: 'members' (property)
  currentPath = 'projects[0].teams[0]'
  Add dot? Yes (currentPath is not empty)
  currentPath → 'projects[0].teams[0]' + '.' + 'members'
  Result: 'projects[0].teams[0].members'
  ✅

Final paths:
  1. 'projects'
  2. 'projects[0]'
  3. 'projects[0].teams'          ✅ CORRECT - has dot
  4. 'projects[0].teams[0]'       ✅ CORRECT - has dot
  5. 'projects[0].teams[0].members'  ✅ CORRECT - has dot
```

## Visual Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│  Input: "projects[0].teams[0].members"                      │
└─────────────────────────────────────────────────────────────┘
                            │
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  Split with regex: /(\[\d+\]|\.)/g                          │
│  Result: ['projects','[0]','.','teams','[0]','.','members'] │
└─────────────────────────────────────────────────────────────┘
                            │
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  Process each token:                                         │
│                                                              │
│  Token Type       │ Action                 │ currentPath    │
│  ────────────────────────────────────────────────────────── │
│  'projects'       │ Add to path            │ 'projects'     │
│  (property)       │ Push to parts          │                │
│  ────────────────────────────────────────────────────────── │
│  '[0]'            │ Append to path         │ 'projects[0]'  │
│  (index)          │ Push to parts          │                │
│  ────────────────────────────────────────────────────────── │
│  '.'              │ Skip (continue)        │ no change      │
│  (delimiter)      │                        │                │
│  ────────────────────────────────────────────────────────── │
│  'teams'          │ Add dot + property     │ 'projects[0].  │
│  (property)       │ Push to parts          │  teams'        │
│  ────────────────────────────────────────────────────────── │
│  '[0]'            │ Append to path         │ 'projects[0].  │
│  (index)          │ Push to parts          │  teams[0]'     │
│  ────────────────────────────────────────────────────────── │
│  '.'              │ Skip (continue)        │ no change      │
│  (delimiter)      │                        │                │
│  ────────────────────────────────────────────────────────── │
│  'members'        │ Add dot + property     │ 'projects[0].  │
│  (property)       │ Push to parts          │  teams[0].     │
│                   │                        │  members'      │
└─────────────────────────────────────────────────────────────┘
                            │
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  Final parts array:                                          │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  'projects'                                            │ │
│  │  'projects[0]'                                         │ │
│  │  'projects[0].teams'            ← ✅ Has dot           │ │
│  │  'projects[0].teams[0]'         ← ✅ Has dot           │ │
│  │  'projects[0].teams[0].members' ← ✅ Has dot           │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                            │
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  Add to expandedNodes Set (except last item)                │
└─────────────────────────────────────────────────────────────┘
                            │
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  Result: All container nodes expanded ✅                     │
│  • projects         → expanded                              │
│  • projects[0]      → expanded                              │
│  • projects[0].teams → expanded (NOW WORKS!)                │
│  • projects[0].teams[0] → expanded (NOW WORKS!)             │
└─────────────────────────────────────────────────────────────┘
```

## Before vs After Comparison

### BEFORE (Broken)
```javascript
expandedNodes Set contains:
  'projects'
  'projects[0]'
  'projects[0]teams'        // ← Path doesn't match actual node path
  'projects[0]teams[0]'     // ← Path doesn't match actual node path

Actual node paths in tree:
  'projects'                // ✓ Match found → expanded
  'projects[0]'             // ✓ Match found → expanded
  'projects[0].teams'       // ❌ NO MATCH → collapsed
  'projects[0].teams[0]'    // ❌ NO MATCH → collapsed
  'projects[0].teams[0].members'  // ❌ NOT VISIBLE

Result: Nested arrays hidden ❌
```

### AFTER (Fixed)
```javascript
expandedNodes Set contains:
  'projects'
  'projects[0]'
  'projects[0].teams'       // ✓ Dots preserved
  'projects[0].teams[0]'    // ✓ Dots preserved

Actual node paths in tree:
  'projects'                // ✓ Match found → expanded
  'projects[0]'             // ✓ Match found → expanded
  'projects[0].teams'       // ✓ MATCH FOUND → expanded
  'projects[0].teams[0]'    // ✓ MATCH FOUND → expanded
  'projects[0].teams[0].members'  // ✓ VISIBLE

Result: All nested arrays visible ✅
```

## Key Insight

The fix ensures that the paths stored in `expandedNodes` exactly match the paths used by `JsonTreeNode` components to identify themselves. This is critical for the expansion logic to work:

```javascript
// In JsonTreeNode.vue
const isExpanded = computed(() => expandedNodes.has(nodePath.value))
                                                    ↑
                                    Must match paths in expandedNodes Set!
```

When paths don't match:
- `expandedNodes.has('projects[0]teams')` → false (path not in set)
- Node stays collapsed
- Children not rendered
- Arrays invisible

When paths match:
- `expandedNodes.has('projects[0].teams')` → true (path found!)
- Node expands
- Children rendered
- Arrays visible ✅
