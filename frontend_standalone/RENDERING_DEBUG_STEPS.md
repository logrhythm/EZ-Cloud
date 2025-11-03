# 🔍 Deep Dive Debug: Array Rendering Issue

## Current Status
- ✅ **Detection**: All 4 arrays detected in `arrayPaths`
- ❌ **Rendering**: Only 2 arrays showing checkboxes
- 🎯 **Hypothesis**: Array elements need manual expansion to reveal nested arrays

## Immediate Action: Open Debug Page

```bash
# Open this file in your browser while the wizard is running
debug_rendering_issue.html
```

This will run 6 diagnostic steps to identify the exact issue.

---

## Manual Console Debug Commands

### Step 1: Check Current State
```javascript
console.clear();
console.log('=== CURRENT STATE ===');

const checkboxes = document.querySelectorAll('.q-checkbox');
console.log('Visible checkboxes:', checkboxes.length);

const arrayNames = Array.from(checkboxes).map(cb => {
  const parent = cb.closest('.node-content');
  const keyEl = parent?.querySelector('.node-key, .node-array-index');
  return keyEl ? keyEl.textContent.trim().replace(':', '') : 'UNKNOWN';
});
console.log('Array names:', arrayNames);
```

### Step 2: Check Expansion State
```javascript
console.log('\n=== EXPANSION STATE ===');

const expandableNodes = document.querySelectorAll('.node-expandable');
console.log('Total expandable nodes:', expandableNodes.length);

expandableNodes.forEach((node, idx) => {
  const isExpanded = node.classList.contains('node-expanded');
  const keyEl = node.querySelector('.node-key, .node-array-index');
  const key = keyEl ? keyEl.textContent.trim() : 'UNKNOWN';

  console.log(`${idx + 1}. "${key}" - Expanded: ${isExpanded}`);
});
```

### Step 3: Manually Expand All Nodes
```javascript
console.log('\n=== EXPANDING ALL NODES ===');

const collapsedIcons = document.querySelectorAll('.toggle-icon[name="chevron_right"]');
console.log('Found', collapsedIcons.length, 'collapsed nodes');

collapsedIcons.forEach(icon => {
  const nodeContent = icon.closest('.node-content');
  const keyEl = nodeContent?.querySelector('.node-key, .node-array-index');
  const key = keyEl ? keyEl.textContent.trim() : 'UNKNOWN';
  console.log('Expanding:', key);
  icon.click();
});

// Wait for render
setTimeout(() => {
  console.log('\n=== AFTER EXPANSION ===');
  const newCheckboxes = document.querySelectorAll('.q-checkbox');
  console.log('Checkboxes now:', newCheckboxes.length);

  const newArrayNames = Array.from(newCheckboxes).map(cb => {
    const parent = cb.closest('.node-content');
    const keyEl = parent?.querySelector('.node-key, .node-array-index');
    return keyEl ? keyEl.textContent.trim().replace(':', '') : 'UNKNOWN';
  });
  console.log('Arrays now:', newArrayNames);

  if (newCheckboxes.length === 4) {
    console.log('%c✅ SUCCESS! All 4 arrays are now visible!', 'color: green; font-weight: bold; font-size: 16px');
    console.log('%c👉 The issue is: Nodes need to be manually expanded', 'color: blue; font-weight: bold');
  } else {
    console.log('%c❌ STILL BROKEN', 'color: red; font-weight: bold; font-size: 16px');
    console.log('%c👉 The issue is NOT just expansion', 'color: orange; font-weight: bold');
  }
}, 1000);
```

### Step 4: Trace filteredObjectChildren
```javascript
console.log('\n=== CHECKING FILTERED CHILDREN ===');

// This will trigger when you expand nodes
// Watch for these log patterns:
// - [containsArrays] Checking...
// - [filteredObjectChildren] ...
// - Check if "members" and "skills" pass the containsArrays check
```

### Step 5: Check DOM Hierarchy
```javascript
console.log('\n=== DOM HIERARCHY ===');

function printTree(element, depth = 0) {
  if (depth > 5) return;

  const indent = '  '.repeat(depth);
  const keyEl = element.querySelector(':scope > .node-content .node-key, :scope > .node-content .node-array-index');
  const key = keyEl ? keyEl.textContent.trim() : 'ROOT';
  const hasCheckbox = !!element.querySelector(':scope > .node-content .q-checkbox');
  const isExpanded = element.querySelector(':scope > .node-content')?.classList.contains('node-expanded');

  console.log(`${indent}${key}${hasCheckbox ? ' ✓' : ''}${isExpanded ? ' [EXP]' : ''}`);

  const childrenContainer = element.querySelector(':scope > .node-children');
  if (childrenContainer) {
    const childNodes = childrenContainer.querySelectorAll(':scope > .json-tree-node');
    childNodes.forEach(child => printTree(child, depth + 1));
  }
}

const rootNode = document.querySelector('.json-tree-node');
if (rootNode) printTree(rootNode);
```

---

## Expected Outcomes

### ✅ If Step 3 Shows Success
**Problem**: Nodes need manual expansion to reveal nested arrays
**Solution**: Implement auto-expansion for nodes that contain nested arrays

### ❌ If Step 3 Still Shows Broken
**Problem**: `containsArrays` or `filteredObjectChildren` is filtering out nested arrays
**Solution**: Fix the filtering logic in JsonTreeNode.vue

---

## Next Steps Based on Results

### Scenario A: Manual Expansion Works
If clicking expand icons reveals all 4 arrays with checkboxes, then the issue is that **array element objects (like `teams[0]`) aren't auto-expanding**.

**Fix**: Modify JsonTreeNode.vue to auto-expand nodes that contain nested arrays in array selection mode.

### Scenario B: Manual Expansion Doesn't Help
If expanding all nodes still only shows 2 arrays, then the issue is **`containsArrays` returning false for nested arrays**.

**Fix**: Debug the `containsArrays` function to see why it's not detecting `members` and `skills` arrays inside `teams[0]` objects.

### Scenario C: Arrays Exist But Hidden
If DOM shows nodes but they're hidden (CSS display:none), then there's a **rendering condition issue**.

**Fix**: Check `v-if` conditions in the template.

---

## Quick Test: Auto-Expand Everything

Run this to force-expand every node:

```javascript
// NUCLEAR OPTION: Expand everything
let attempts = 0;
const maxAttempts = 10;

function expandAll() {
  const collapsed = document.querySelectorAll('.toggle-icon[name="chevron_right"]');
  if (collapsed.length === 0 || attempts >= maxAttempts) {
    console.log('Expansion complete. Attempts:', attempts);

    const checkboxes = document.querySelectorAll('.q-checkbox');
    const arrayNames = Array.from(checkboxes).map(cb => {
      const parent = cb.closest('.node-content');
      const keyEl = parent?.querySelector('.node-key, .node-array-index');
      return keyEl ? keyEl.textContent.trim().replace(':', '') : 'UNKNOWN';
    });

    console.log(`Final result: ${checkboxes.length} checkboxes`);
    console.log('Arrays:', arrayNames);

    if (checkboxes.length === 4) {
      console.log('%c✅ FIX CONFIRMED: Auto-expansion needed!', 'color: green; font-weight: bold; font-size: 18px');
    } else {
      console.log('%c❌ DEEPER ISSUE: Not just expansion', 'color: red; font-weight: bold; font-size: 18px');
    }
    return;
  }

  collapsed.forEach(icon => icon.click());
  attempts++;
  setTimeout(expandAll, 300);
}

expandAll();
```

---

## Report Back

After running these tests, report:
1. **How many checkboxes appear after expanding all nodes?**
2. **Which array names are visible after expansion?**
3. **Any console errors or warnings?**
4. **Screenshot of the DOM hierarchy from Step 5?**

This will tell us exactly what fix is needed.
