# 🔧 Fix: Auto-Expand Nodes Containing Nested Arrays

## Problem
Nested arrays (`members`, `skills`) are **detected** but not **visible** because their parent object nodes (like `teams[0]`) need to be manually expanded.

## Solution
Auto-expand nodes that contain nested arrays when in array selection mode.

---

## Implementation

### Option 1: Auto-expand in JsonTreeViewer (RECOMMENDED)

**File**: `src/components/wizard/JsonTreeViewer.vue`

Add this method and call it after data is loaded:

```javascript
// Add this method to the component
methods: {
  // ... existing methods ...

  /**
   * Auto-expand nodes that contain nested arrays in array selection mode
   */
  autoExpandArrayContainers() {
    if (this.selectionMode !== 'array') return;

    console.log('[autoExpandArrayContainers] Starting auto-expansion...');

    // Find all paths that need to be expanded
    const pathsToExpand = new Set();

    this.arrayPaths.forEach(arrayPath => {
      console.log(`[autoExpandArrayContainers] Processing arrayPath: ${arrayPath}`);

      // Split path into segments
      // e.g., "projects[0].teams[0].members" -> ["projects", "projects[0]", "projects[0].teams", "projects[0].teams[0]"]
      const segments = [];
      let currentPath = '';

      // Split by dots and brackets
      const parts = arrayPath.split(/(\[\d+\]|\.)/).filter(p => p && p !== '.');

      parts.forEach(part => {
        if (part.startsWith('[')) {
          // Array index
          currentPath += part;
          segments.push(currentPath);
        } else {
          // Property name
          if (currentPath) currentPath += '.';
          currentPath += part;
          segments.push(currentPath);
        }
      });

      // Add all parent paths to expansion set
      segments.forEach(segment => {
        if (segment !== arrayPath) {
          // Don't expand the array itself, only its containers
          pathsToExpand.add(segment);
          console.log(`  → Will expand: ${segment}`);
        }
      });
    });

    // Expand all the paths
    console.log(`[autoExpandArrayContainers] Expanding ${pathsToExpand.size} paths:`, Array.from(pathsToExpand));

    pathsToExpand.forEach(path => {
      if (!this.expandedNodes.has(path)) {
        this.expandedNodes.add(path);
      }
    });

    console.log('[autoExpandArrayContainers] Auto-expansion complete');
  },

  // Update the existing loadSampleData method
  async loadSampleData() {
    // ... existing code ...

    // After loading data, auto-expand array containers
    this.$nextTick(() => {
      this.autoExpandArrayContainers();
    });
  }
}
```

**Also update the `watch` for jsonData**:

```javascript
watch: {
  jsonData: {
    immediate: true,
    handler(newData) {
      if (newData) {
        this.detectArrayFields(newData);
        this.detectJsonFields(newData);

        // Auto-expand after detection
        this.$nextTick(() => {
          this.autoExpandArrayContainers();
        });
      }
    }
  }
}
```

---

### Option 2: Auto-expand in JsonTreeNode (ALTERNATIVE)

**File**: `src/components/wizard/JsonTreeNode.vue`

Modify the component to auto-expand nodes that contain arrays:

```javascript
// Add to setup() function, after the expandedNodes inject
onMounted(() => {
  // In array selection mode, auto-expand this node if it contains arrays
  if (selectionMode === 'array' && !props.isRoot && isObject.value && !isExpanded.value) {
    // Check if this node contains any arrays in its children
    const hasArrayChildren = Object.entries(props.node).some(([childKey, childValue]) => {
      return containsArrays(childValue, childKey, props.path);
    });

    if (hasArrayChildren) {
      console.log(`[AutoExpand] Expanding ${props.path} because it contains arrays`);
      // Wait a tick to ensure parent is rendered
      nextTick(() => {
        if (!expandedNodes.value.has(props.path)) {
          emit('toggle-node', props.path);
        }
      });
    }
  }
});
```

**Import onMounted and nextTick**:

```javascript
import { defineComponent, computed, inject, onMounted, nextTick } from 'vue'
```

---

## Testing

After applying the fix:

1. **Clear cache and reload** the wizard
2. **Load test data** with nested arrays
3. **Verify** that all 4 arrays are immediately visible with checkboxes
4. **No manual expansion** should be needed

### Expected Result

```javascript
✅ Checkboxes visible: 4
✅ Arrays visible: ["projects", "teams", "members", "skills"]
✅ All nodes auto-expanded
✅ Status: FIXED
```

---

## Fallback: Manual Expansion Helper

If auto-expansion causes issues, provide a "Expand All" button:

**In JsonTreeViewer.vue template**:

```vue
<div class="tree-controls">
  <q-btn
    v-if="selectionMode === 'array'"
    outline
    color="primary"
    size="sm"
    icon="unfold_more"
    label="Expand All Arrays"
    @click="expandAllArrayPaths"
  />
</div>
```

**In methods**:

```javascript
methods: {
  expandAllArrayPaths() {
    console.log('[expandAllArrayPaths] Expanding all array container paths...');

    // Expand all paths that lead to arrays
    this.arrayPaths.forEach(arrayPath => {
      const pathParts = arrayPath.split(/(?=\[)|(?=\.)/);
      let currentPath = '';

      pathParts.forEach(part => {
        currentPath += part.replace(/^\./, '');
        if (!this.expandedNodes.has(currentPath)) {
          this.expandedNodes.add(currentPath);
        }
      });
    });

    console.log('[expandAllArrayPaths] Expanded paths:', Array.from(this.expandedNodes));
  }
}
```

---

## Which Option to Choose?

| Option | Pros | Cons |
|--------|------|------|
| **Option 1** (JsonTreeViewer) | - Centralized logic<br>- Runs once after data load<br>- Easier to debug | - Requires path parsing |
| **Option 2** (JsonTreeNode) | - Component-level control<br>- More granular | - Runs for every node<br>- More complex lifecycle |
| **Fallback** (Manual button) | - User control<br>- Safe | - Extra step required |

**Recommendation**: Start with **Option 1** (JsonTreeViewer auto-expansion) for the cleanest solution.

---

## Debug Commands After Fix

```javascript
// Verify auto-expansion worked
console.log('Expanded nodes:', Array.from(window.__vue__?.$children[0]?.expandedNodes || []));

// Count visible checkboxes
console.log('Visible checkboxes:', document.querySelectorAll('.q-checkbox').length);

// List array names
const names = Array.from(document.querySelectorAll('.q-checkbox')).map(cb => {
  const keyEl = cb.closest('.node-content')?.querySelector('.node-key, .node-array-index');
  return keyEl?.textContent.trim().replace(':', '') || 'UNKNOWN';
});
console.log('Array names:', names);
```
