# Path Parsing Bug Fix - CRITICAL

## Problem Identified

**Issue:** Nested arrays were not displaying in the JsonTreeViewer because the auto-expansion paths were being corrupted during parsing.

**Console Evidence:**
```javascript
[autoExpandArrayContainers] Processing arrayPath: projects[0].teams[0].members
→ Will expand: projects
→ Will expand: projects[0]
→ Will expand: projects[0]teams        // ❌ WRONG - missing dot
→ Will expand: projects[0]teams[0]     // ❌ WRONG - missing dot
→ Will expand: projects[0]teams[0]members  // ❌ WRONG - missing dot
```

**Expected (Correct) Output:**
```javascript
→ Will expand: projects
→ Will expand: projects[0]
→ Will expand: projects[0].teams       // ✅ WITH DOT
→ Will expand: projects[0].teams[0]    // ✅ WITH DOT
→ Will expand: projects[0].teams[0].members  // ✅ WITH DOT
```

## Root Cause

**File:** `/mnt/g/GO_Workspace/src/github.com/logrhythm/EZ-Cloud-Fresh/frontend_standalone/src/components/wizard/JsonTreeViewer.vue`

**Function:** `autoExpandArrayContainers()` (lines 674-736)

**Buggy Code (Line 696):**
```javascript
const tokens = arrayPath.split(/(\[\d+\]|\.)/g).filter(t => t && t !== '.')
```

**Problem:** The `.filter(t => t !== '.')` was removing all dot tokens from the array, making it impossible to know where dots should be inserted when rebuilding paths.

## The Fix

**Changed Line 696 from:**
```javascript
const tokens = arrayPath.split(/(\[\d+\]|\.)/g).filter(t => t && t !== '.')
```

**To:**
```javascript
const tokens = arrayPath.split(/(\[\d+\]|\.)/g).filter(t => t && t.trim())
```

**Changed Lines 698-715 from:**
```javascript
for (let i = 0; i < tokens.length; i++) {
  const token = tokens[i]

  if (token.startsWith('[')) {
    // Array index - append to current path
    currentPath += token
    parts.push(currentPath)
  } else {
    // Property name
    if (currentPath && !currentPath.endsWith(']')) {
      currentPath += '.'
    }
    currentPath += token
    parts.push(currentPath)
  }
}
```

**To:**
```javascript
for (let i = 0; i < tokens.length; i++) {
  const token = tokens[i]

  if (token === '.') {
    // Skip dot token, it will be added when we encounter the next property
    continue
  } else if (token.startsWith('[')) {
    // Array index - append to current path
    currentPath += token
    parts.push(currentPath)
  } else {
    // Property name
    if (currentPath) {
      currentPath += '.'
    }
    currentPath += token
    parts.push(currentPath)
  }
}
```

## How the Fix Works

### Step-by-Step for: `"projects[0].teams[0].members"`

**1. Split the path into tokens:**
```javascript
['projects', '[0]', '.', 'teams', '[0]', '.', 'members']
```

**2. Process each token:**
- **Token: 'projects'** (property)
  - currentPath = '' → '' + 'projects' = 'projects'
  - Add to parts: ['projects']

- **Token: '[0]'** (array index)
  - currentPath = 'projects' → 'projects' + '[0]' = 'projects[0]'
  - Add to parts: ['projects', 'projects[0]']

- **Token: '.'** (delimiter)
  - Skip (will add dot before next property)

- **Token: 'teams'** (property)
  - currentPath = 'projects[0]' → 'projects[0]' + '.' + 'teams' = 'projects[0].teams'
  - Add to parts: ['projects', 'projects[0]', 'projects[0].teams']

- **Token: '[0]'** (array index)
  - currentPath = 'projects[0].teams' → 'projects[0].teams' + '[0]' = 'projects[0].teams[0]'
  - Add to parts: ['projects', 'projects[0]', 'projects[0].teams', 'projects[0].teams[0]']

- **Token: '.'** (delimiter)
  - Skip

- **Token: 'members'** (property)
  - currentPath = 'projects[0].teams[0]' → 'projects[0].teams[0]' + '.' + 'members' = 'projects[0].teams[0].members'
  - Add to parts: ['projects', 'projects[0]', 'projects[0].teams', 'projects[0].teams[0]', 'projects[0].teams[0].members']

**3. Final paths array:**
```javascript
[
  'projects',
  'projects[0]',
  'projects[0].teams',          // ✅ DOT PRESERVED
  'projects[0].teams[0]',       // ✅ DOT PRESERVED
  'projects[0].teams[0].members' // ✅ DOT PRESERVED
]
```

## Verification Test Results

**Test Command:**
```bash
node test_path_parsing.js
```

**Results for "projects[0].teams[0].members":**
```
Tokens: [ 'projects', '[0]', '.', 'teams', '[0]', '.', 'members' ]
Generated paths:
  1. projects
  2. projects[0]
  3. projects[0].teams          ✅ CORRECT
  4. projects[0].teams[0]       ✅ CORRECT
  5. projects[0].teams[0].members  ✅ CORRECT
```

## Expected Impact

After this fix:
- ✅ All nested arrays will be visible without manual expansion
- ✅ Path matching will work correctly in `expandedNodes` Set
- ✅ JsonTreeNode components will receive correct paths for rendering
- ✅ All 4 checkboxes should be displayed: projects, teams, members, skills

## Testing Instructions

1. **Open the wizard in browser:**
   - Navigate to Step 3 (Schema Config)
   - Load the test schema with nested arrays

2. **Check console logs for:**
   ```javascript
   [autoExpandArrayContainers] Processing arrayPath: projects[0].teams[0].members
   → Will expand: projects
   → Will expand: projects[0]
   → Will expand: projects[0].teams        // ✅ Must have dot
   → Will expand: projects[0].teams[0]     // ✅ Must have dot
   ```

3. **Visual verification:**
   - All nested arrays should be visible
   - 4 checkboxes should appear: projects, teams, members, skills
   - No need to manually expand any nodes

## Files Modified

- **JsonTreeViewer.vue** (lines 696, 701-715)
  - Fixed path parsing logic in `autoExpandArrayContainers()` function

## Files Created (for testing)

- **test_path_parsing.js**
  - Standalone verification script
  - Tests the fixed algorithm with multiple test cases

## Commit Message Suggestion

```
Fix path parsing bug in nested array auto-expansion

Problem: Dots were being stripped from paths when building auto-expansion
paths for nested arrays, causing path mismatches and invisible arrays.

Example: "projects[0].teams" was becoming "projects[0]teams"

Solution: Keep dot tokens during split and explicitly handle them during
path reconstruction, ensuring dots are preserved between properties.

Impact: All nested arrays now display correctly without manual expansion.
```

## Related Issues

This fix resolves:
- Nested arrays not displaying in JsonTreeViewer
- Auto-expansion not working for deeply nested structures
- Path matching failures in expandedNodes Set
- Missing checkboxes for nested array selection
