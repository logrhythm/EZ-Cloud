<template>
  <div v-if="shouldShowNode" class="json-tree-node" :style="{ paddingLeft: `${level * 20}px` }">
    <div
      class="node-content"
      :class="{
        'node-expandable': isExpandable,
        'node-expanded': isExpanded && isExpandable,
        'node-array-item': isArrayItem
      }"
    >
      <!-- Toggle expand/collapse icon for objects and arrays -->
      <q-icon
        v-if="isExpandable"
        :name="isExpanded ? 'expand_more' : 'chevron_right'"
        size="1.2em"
        class="cursor-pointer toggle-icon"
        @click="toggleNode"
      />
      <span v-else class="node-spacer"></span>

      <!-- Node key and value display -->
      <template v-if="isRoot">
        <span class="node-key root-node">{{ getNodeType(node) }}</span>
        <q-badge v-if="isArray" color="primary" class="q-ml-xs">Array ({{ node.length }} items)</q-badge>
        <q-badge v-else-if="isObject && selectionMode !== 'array'" color="secondary" class="q-ml-xs">Object ({{ Object.keys(node).length }} properties)</q-badge>
        <q-badge v-else-if="isObject && selectionMode === 'array'" color="secondary" class="q-ml-xs">Object ({{ filteredObjectChildren.length }} arrays)</q-badge>
      </template>
      <template v-else-if="isArrayItem">
        <span class="node-array-index">[{{ arrayIndex }}]</span>
        <span class="node-key" v-if="displayKey !== `[${arrayIndex}]`">{{ displayKey }}</span>
        <q-badge v-if="isObject || isArray" color="info" class="q-ml-xs">{{ isArray ? 'Array' : 'Object' }}</q-badge>
      </template>
      <template v-else>
        <span class="node-key">{{ displayKey }}:</span>
      </template>

      <template v-if="!isExpandable">
        <span
          class="node-value"
          :class="{
            'node-string': isString,
            'node-number': isNumber,
            'node-boolean': isBoolean,
            'node-null': isNull
          }"
        >{{ displayValue }}</span>
      </template>
      <template v-else>
        <span class="node-preview">{{ nodePreview }}</span>
      </template>

      <!-- Selection indicators for arrays and potential JSON strings -->
      <div class="selection-controls" v-if="isSelectable">
        <q-checkbox
          v-if="isArray && (selectionMode === 'array' || selectionMode === 'both')"
          :value="isSelectedArray"
          dense
          color="primary"
          @input="selectField('array')"
          @vue:mounted="() => console.log(`✓ Array checkbox rendered for path: ${path}`)"
        >
          <q-tooltip>Select for array fanout</q-tooltip>
        </q-checkbox>

        <q-checkbox
          v-if="isPotentialJson && (selectionMode === 'json' || selectionMode === 'both')"
          :value="isSelectedJson"
          dense
          color="secondary"
          @input="selectField('json')"
        >
          <q-tooltip>Select for JSON parsing</q-tooltip>
        </q-checkbox>
      </div>

      <!-- Debug indicator for array paths -->
      <span v-if="isArray && arrayPaths.includes(path)" class="debug-indicator q-ml-sm">
        <q-badge color="blue">Array Path</q-badge>
      </span>
    </div>

    <!-- Render children nodes when expanded -->
    <div v-if="isExpanded && isExpandable" class="node-children">
      <template v-if="isObject">
        <json-tree-node
          v-for="([childKey, childValue], index) in filteredObjectChildren"
          :key="`${path}-${childKey}-${index}`"
          :node="childValue"
          :path="getChildPath(childKey)"
          :level="level + 1"
          :is-root="false"
          :selected-paths="selectedPaths"
          :potential-json-paths="potentialJsonPaths"
          :array-paths="arrayPaths"
          @toggle-node="(p) => $emit('toggle-node', p)"
          @select-field="(p, t) => $emit('select-field', p, t)"
        />
      </template>
      <template v-else-if="isArray">
        <div v-if="node.length === 0" class="empty-array">[]</div>
        <template v-else>
          <div class="array-container">
            <div v-if="node.length > 20" class="array-notice q-mb-sm">
              <q-badge color="warning" outline>Showing first 20 of {{ node.length }} items</q-badge>
            </div>
            <json-tree-node
              v-for="(item, index) in filteredArrayChildren"
              :key="`${path}-${index}`"
              :node="item"
              :path="`${path}[${index}]`"
              :level="level + 1"
              :is-root="false"
              :selected-paths="selectedPaths"
              :potential-json-paths="potentialJsonPaths"
              :array-paths="arrayPaths"
              @toggle-node="(p) => $emit('toggle-node', p)"
              @select-field="(p, t) => $emit('select-field', p, t)"
            />
            <div v-if="node.length > 20" class="array-ellipsis">...</div>
          </div>
        </template>
      </template>
    </div>
  </div>
</template>

<script>
import { defineComponent, computed, inject } from 'vue'

export default defineComponent({
  name: 'JsonTreeNode',

  props: {
    /**
     * The node data (object, array, or primitive)
     */
    node: {
      type: [Object, Array, String, Number, Boolean],
      required: true
    },

    /**
     * Path to this node in the JSON structure (e.g., 'data.results[0].id')
     */
    path: {
      type: String,
      required: true
    },

    /**
     * Nesting level for indentation
     */
    level: {
      type: Number,
      default: 0
    },

    /**
     * Whether this is the root node
     */
    isRoot: {
      type: Boolean,
      default: false
    },

    /**
     * Array of currently selected field paths
     */
    selectedPaths: {
      type: Array,
      default: () => []
    },

    /**
     * Paths of fields detected as potential JSON strings
     */
    potentialJsonPaths: {
      type: Array,
      default: () => []
    },

    /**
     * Paths of fields detected as arrays
     */
    arrayPaths: {
      type: Array,
      default: () => []
    }
  },

  emits: ['toggle-node', 'select-field'],

  setup (props, { emit }) {
    // Access parent's expandedNodes Set to determine expansion state
    // Important: We use a reactive reference here to ensure changes are tracked
    const expandedNodes = inject('expandedNodes')
    // Fall back to an empty set if not provided (shouldn't happen with our fix)
    if (!expandedNodes) {
      console.warn('expandedNodes not provided to JsonTreeNode - this may cause recursion issues')
    }
    const selectionMode = inject('selectionMode', 'both')

    /**
     * Helper function to check if a value contains any arrays (directly or nested)
     */
    const containsArrays = (value, childKey, currentPath) => {
      if (value === null || value === undefined) return false

      // Build the full path for this child
      const childPath = currentPath === 'root' ? childKey : `${currentPath}.${childKey}`

      // Special logging for tags to debug the issue
      if (childKey === 'tags') {
        console.log('[containsArrays] ⚠️ CHECKING TAGS PROPERTY ⚠️')
        console.log(`[containsArrays] childKey="${childKey}", currentPath="${currentPath}", childPath="${childPath}"`)
        console.log('[containsArrays] Value:', value)
        console.log(`[containsArrays] Value type: ${Array.isArray(value) ? 'Array' : typeof value}`)
        console.log('[containsArrays] Value length:', Array.isArray(value) ? value.length : 'N/A')
        console.log('[containsArrays] Available arrayPaths:', props.arrayPaths)
        console.log(`[containsArrays] Checking if arrayPaths includes "${childPath}":`, props.arrayPaths.includes(childPath))
      }

      // Check if this specific path is in arrayPaths
      if (props.arrayPaths.includes(childPath)) {
        if (childKey === 'tags') console.log(`  ✓ Direct match found for tags: ${childPath}`)
        return true
      }

      // If the value itself is an array, check if any nested path starts with this childPath
      if (Array.isArray(value)) {
        const result = props.arrayPaths.some(arrayPath =>
          arrayPath === childPath || arrayPath.startsWith(childPath + '.')
        )
        if (childKey === 'tags') console.log(`  Array check result for tags: ${result}`)
        return result
      }

      // If it's an object, recursively check if it contains arrays
      if (typeof value === 'object') {
        // Check if any array path is nested under this object path
        const result = props.arrayPaths.some(arrayPath => {
          const matchesDot = arrayPath.startsWith(childPath + '.')
          const matchesBracket = arrayPath.startsWith(childPath + '[')
          return matchesDot || matchesBracket
        })
        return result
      }

      if (childKey === 'tags') console.log('  ✗ No match found for tags')
      return false
    }

    // Computed properties for node type detection
    const isObject = computed(() => {
      if (typeof props.node !== 'object' || props.node === null) {
        return false
      }

      // Check if this is a metadata object with type/children/path structure
      if (props.node && typeof props.node === 'object' && !Array.isArray(props.node) &&
          props.node.type && props.node.children && (props.node.path || props.node.key)) {
        console.warn('Detected metadata object in JsonTreeNode', props.node)
        // This is likely a metadata object, not the actual data
        return false
      }

      return !Array.isArray(props.node)
    })

    const isArray = computed(() => Array.isArray(props.node))
    const isArrayItem = computed(() => Boolean(props.path && props.path.match(/\[\d+\]$/)))
    const arrayIndex = computed(() => {
      if (!isArrayItem.value) return -1
      const match = props.path.match(/\[(\d+)\]$/)
      return match ? parseInt(match[1]) : -1
    })
    const isString = computed(() => typeof props.node === 'string')
    const isNumber = computed(() => typeof props.node === 'number')
    const isBoolean = computed(() => typeof props.node === 'boolean')
    const isNull = computed(() => props.node === null)

    const isExpandable = computed(() => {
      const result = (isObject.value && Object.keys(props.node).length > 0) ||
        (isArray.value && props.node.length > 0)

      // Debug logging for items[0] node
      if (props.path === 'data.users[0].orders[0].items[0]') {
        console.log(`[isExpandable] Path: ${props.path}`)
        console.log(`  - isObject: ${isObject.value}`)
        console.log(`  - isArray: ${isArray.value}`)
        console.log('  - Object keys:', isObject.value ? Object.keys(props.node) : 'N/A')
        console.log('  - Object keys length:', isObject.value ? Object.keys(props.node).length : 0)
        console.log(`  - result: ${result}`)
      }

      return result
    })

    const isExpanded = computed(() => {
      const result = expandedNodes.value.has(props.path)

      // Debug logging for items[0] node
      if (props.path === 'data.users[0].orders[0].items[0]') {
        console.log(`[isExpanded] Path: ${props.path}`)
        console.log(`  - expandedNodes has this path: ${result}`)
        console.log(`  - expandedNodes size: ${expandedNodes.value.size}`)
        console.log('  - expandedNodes contents:', Array.from(expandedNodes.value))
      }

      return result
    })

    /**
     * Determine if this node should be shown in the tree
     * In array selection mode, only show arrays and objects/items that contain arrays
     */
    const shouldShowNode = computed(() => {
      // Always show root node
      if (props.isRoot) {
        console.log('[shouldShowNode] ROOT node - always showing')
        return true
      }

      // In non-array modes, show all nodes
      if (selectionMode !== 'array') {
        return true
      }

      console.log(`[shouldShowNode] Checking node at path: ${props.path}`)
      console.log(`  - isArray: ${isArray.value}`)
      console.log(`  - isObject: ${isObject.value}`)
      console.log(`  - node keys: ${isObject.value ? Object.keys(props.node).join(', ') : 'N/A'}`)
      console.log(`  - arrayPaths available: ${props.arrayPaths.length}`, props.arrayPaths)

      // In array selection mode:
      // 1. Show if this is an array
      if (isArray.value) {
        console.log('  → SHOW (is array)')
        return true
      }

      // 2. Show if this is an object that contains arrays (check filteredObjectChildren)
      if (isObject.value) {
        // Check if this object has any children that contain arrays
        const hasArrayChildren = Object.entries(props.node).some(([childKey, childValue]) => {
          const result = containsArrays(childValue, childKey, props.path)
          if (result) {
            console.log(`  → Child '${childKey}' contains arrays`)
          }
          return result
        })
        console.log(`  → ${hasArrayChildren ? 'SHOW' : 'HIDE'} (object ${hasArrayChildren ? 'has' : 'has no'} array children)`)
        return hasArrayChildren
      }

      // 3. Don't show primitive values in array selection mode
      console.log('  → HIDE (primitive value)')
      return false
    })

    // Determine if this node is selectable (array or potential JSON)
    const isSelectable = computed(() => {
      const result = isArray.value || isPotentialJson.value
      // Log selectable nodes to help with debugging
      if (isArray.value) {
        console.log(`[isSelectable] Array node at path: ${props.path}, selectable: ${result}, shouldShowNode: ${shouldShowNode.value}`)
      }
      return result
    })

    // Check if this node is a potential JSON string
    const isPotentialJson = computed(() => {
      if (!isString.value) return false

      return props.potentialJsonPaths.includes(props.path)
    })

    // Check if this node is selected as array or JSON
    const isSelectedArray = computed(() => {
      // Check if this path is included in the selected paths and is an array path
      const pathIncluded = props.selectedPaths.includes(props.path)
      const isArrayPath = props.arrayPaths.includes(props.path)
      const result = pathIncluded && isArrayPath

      // Only log for array nodes to reduce noise
      if (isArray.value) {
        console.log(`isSelectedArray computed - Path: ${props.path}`)
        console.log('  - pathIncluded:', pathIncluded)
        console.log('  - isArrayPath:', isArrayPath)
        console.log('  - result:', result)
        console.log('  - props.selectedPaths:', props.selectedPaths)
        console.log('  - props.arrayPaths:', props.arrayPaths)
      }

      return result
    })

    const isSelectedJson = computed(() => {
      return props.selectedPaths.includes(props.path) && props.potentialJsonPaths.includes(props.path)
    })

    // Display helpers
    const displayKey = computed(() => {
      const parts = props.path.split('.')
      const key = parts.pop()

      // Handle array indices
      if (key && key.includes('[')) {
        // Extract the field name without the array index
        // If it's just an index (like '[0]'), return the index
        const fieldName = key.substring(0, key.indexOf('[')) || key

        // If this is a direct array access pattern like '[0]', '[1]', etc.,
        // use the object property name instead of showing the array index
        if (fieldName === key && isObject.value && props.node) {
          const objKeys = Object.keys(props.node)
          return objKeys.length > 0 ? objKeys[0] : fieldName
        }
        return fieldName
      }

      // If we have a nested object in an array, get its proper name
      if (isArrayItem.value && isObject.value) {
        return key
      }
      return key
    })

    const displayValue = computed(() => {
      if (isString.value) return `"${props.node}"`
      if (isNull.value) return 'null'
      return String(props.node)
    })

    const nodePreview = computed(() => {
      if (isObject.value) {
        const keys = Object.keys(props.node)
        if (keys.length === 0) return '{}'
        return `{ ${keys.join(', ')} }`
      } else if (isArray.value) {
        if (props.node.length === 0) return '[]'
        // Show first few items as preview
        const previewItems = props.node.slice(0, 3).map(item => {
          if (typeof item === 'object' && item !== null) {
            return Array.isArray(item) ? '[...]' : '{...}'
          } else if (typeof item === 'string') {
            return item.length > 10 ? `"${item.substring(0, 10)}..."` : `"${item}"`
          }
          return String(item)
        })
        const suffix = props.node.length > 3 ? `, ... ${props.node.length - 3} more` : ''
        return `[ ${previewItems.join(', ')}${suffix} ]`
      }
      return ''
    })

    // Methods
    const getNodeType = (node) => {
      if (Array.isArray(node)) return 'Array'
      if (typeof node === 'object' && node !== null) return 'Object'
      return typeof node
    }

    const getChildPath = (childKey) => {
      if (props.path === 'root') return childKey

      // Special handling for array items to create better paths
      if (Array.isArray(props.node)) {
        // For array items, return path with array index notation
        return `${props.path}[${childKey}]`
      }

      return `${props.path}.${childKey}`
    }

    const toggleNode = () => {
      if (!isExpandable.value) return
      emit('toggle-node', props.path)
    }

    const selectField = (type) => {
      // Create a node type object to provide more context for selection
      const nodeInfo = {
        type: type,
        isArray: isArray.value,
        isPotentialJson: isPotentialJson.value,
        path: props.path
      }
      console.log(`JsonTreeNode.selectField called - Path: ${props.path}, type: ${type}`, nodeInfo)
      console.log('Emitting select-field event with:', props.path, nodeInfo)

      // Emit both events for compatibility
      emit('select-field', props.path, nodeInfo)
    }

    // Debug computed to check if children should be rendered
    const shouldRenderChildren = computed(() => {
      const result = isExpanded.value && isExpandable.value

      // Debug logging for items[0] node
      if (props.path === 'data.users[0].orders[0].items[0]') {
        console.log(`[shouldRenderChildren] Path: ${props.path}`)
        console.log(`  - isExpanded: ${isExpanded.value}`)
        console.log(`  - isExpandable: ${isExpandable.value}`)
        console.log(`  - result: ${result}`)
        console.log(`  - isObject: ${isObject.value}`)
        console.log(`  - selectionMode: ${selectionMode}`)
      }

      return result
    })

    /**
     * Filter object children to only show properties that contain arrays
     */
    const filteredObjectChildren = computed(() => {
      if (!isObject.value) {
        console.log(`[filteredObjectChildren] Not an object at path: ${props.path}`)
        return []
      }

      // When in array selection mode, only show children that contain arrays
      if (selectionMode === 'array') {
        console.log(`[filteredObjectChildren] 🔍 START Filtering object at path: ${props.path}`)
        console.log(`[filteredObjectChildren] isExpanded: ${isExpanded.value}, isExpandable: ${isExpandable.value}`)
        console.log('[filteredObjectChildren] Object keys:', Object.keys(props.node))
        console.log('[filteredObjectChildren] About to call Object.entries...')

        const entries = Object.entries(props.node)
        console.log(`[filteredObjectChildren] Object.entries returned ${entries.length} entries`)

        const filtered = entries.filter(([childKey, childValue]) => {
          console.log(`[filteredObjectChildren] 🔎 Filtering childKey: '${childKey}'`)
          const result = containsArrays(childValue, childKey, props.path)
          console.log(`[filteredObjectChildren] ✓ Key '${childKey}' contains arrays? ${result}`)
          return result
        })

        console.log('[filteredObjectChildren] 🎯 Final filtered result:', filtered.map(([k]) => k))
        console.log(`[filteredObjectChildren] ✅ DONE - Returning ${filtered.length} entries`)
        return filtered
      }

      // In other modes, show all children
      return Object.entries(props.node)
    })

    /**
     * Filter array children to only show items that contain nested arrays
     */
    const filteredArrayChildren = computed(() => {
      if (!isArray.value) return []

      const items = props.node.slice(0, 20)

      // When in array selection mode, check if array items contain nested arrays
      if (selectionMode === 'array') {
        // Get the first item to check structure
        if (items.length === 0) return []

        const firstItem = items[0]

        console.log(`[filteredArrayChildren] Checking array at path: ${props.path}`)
        console.log('[filteredArrayChildren] First item type:', typeof firstItem, Array.isArray(firstItem) ? 'Array' : '')
        console.log('[filteredArrayChildren] Available arrayPaths:', props.arrayPaths)

        // Check if this array itself is in the arrayPaths (it's selectable)
        const isThisArraySelectable = props.arrayPaths.includes(props.path)
        console.log('[filteredArrayChildren] Is this array selectable?', isThisArraySelectable)

        // If this array itself is selectable (a leaf array or an array of primitives),
        // show its items for preview purposes (limited to first 20)
        if (isThisArraySelectable) {
          console.log(`[filteredArrayChildren] Array is selectable, returning ${items.length} items for preview`)
          return items
        }

        // If array items are objects, check if they contain nested arrays
        if (typeof firstItem === 'object' && firstItem !== null && !Array.isArray(firstItem)) {
          console.log('[filteredArrayChildren] First item keys:', Object.keys(firstItem))

          // Check if any property in the first item leads to an array
          // IMPORTANT: Check for ANY index [0], [1], [2], etc., not just [0]
          const hasNestedArrays = Object.keys(firstItem).some(key => {
            // Build path patterns that match any array index
            const pathPattern = `${props.path}`
            const keyToCheck = key

            console.log(`[filteredArrayChildren] Checking if property '${key}' leads to arrays`)
            console.log(`  pathPattern: ${pathPattern}`)
            console.log(`  keyToCheck: ${keyToCheck}`)

            // Check if any arrayPath matches this structure
            const matches = props.arrayPaths.some(arrayPath => {
              // Pattern 1: Direct child array like "projects[0].teams"
              // arrayPath should match: pathPattern[<any_index>].keyToCheck
              const directChildPattern = new RegExp(`^${pathPattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\[\\d+\\]\\.${keyToCheck}$`)
              if (directChildPattern.test(arrayPath)) {
                console.log(`  ✓ Pattern 1 match: ${arrayPath} is direct child of ${pathPattern}[*].${keyToCheck}`)
                return true
              }

              // Pattern 2: Nested array deeper in the structure like "projects[0].teams[0].members"
              // arrayPath should match: pathPattern[<any_index>].keyToCheck[<any_index>]...
              // This means the path starts with our pattern, has an array index, then our key, then continues
              const nestedPattern = new RegExp(`^${pathPattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\[\\d+\\]\\.${keyToCheck}\\[`)
              if (nestedPattern.test(arrayPath)) {
                console.log(`  ✓ Pattern 2 match: ${arrayPath} is nested under ${pathPattern}[*].${keyToCheck}[*]...`)
                return true
              }

              // Pattern 3: Even deeper nesting like "projects[0].teams[0].members[0].skills"
              // Check if arrayPath contains our pathPattern, then [index], then .keyToCheck
              const deepNestedRegex = new RegExp(`${pathPattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\[\\d+\\]\\.${keyToCheck}\\[\\d+\\]\\.`)
              if (deepNestedRegex.test(arrayPath)) {
                console.log(`  ✓ Pattern 3 match: ${arrayPath} is deeply nested under ${pathPattern}[*].${keyToCheck}[*]...`)
                return true
              }

              return false
            })

            if (matches) {
              console.log(`  ✓ RESULT: Property '${key}' leads to arrays`)
            } else {
              console.log(`  ✗ RESULT: Property '${key}' does NOT lead to arrays`)
            }

            return matches
          })

          console.log('[filteredArrayChildren] hasNestedArrays result:', hasNestedArrays)

          // If there are nested arrays, show the items so users can navigate to them
          if (hasNestedArrays) {
            console.log(`[filteredArrayChildren] Returning ${items.length} items`)
            return items
          }

          // Otherwise, don't show the items since they don't contain arrays
          console.log('[filteredArrayChildren] No nested arrays found, returning empty')
          return []
        }

        // For non-object array items (primitives or arrays), don't show them in array mode
        // unless this array itself is selectable (which we already checked above)
        console.log('[filteredArrayChildren] Non-object items, returning empty')
        return []
      }

      // In other modes, show all items
      return items
    })

    return {
      isObject,
      isArray,
      isArrayItem,
      arrayIndex,
      isString,
      isNumber,
      isBoolean,
      isNull,
      isExpandable,
      isExpanded,
      shouldRenderChildren,
      shouldShowNode,
      isSelectable,
      isPotentialJson,
      isSelectedArray,
      isSelectedJson,
      displayKey,
      displayValue,
      nodePreview,
      getNodeType,
      getChildPath,
      toggleNode,
      selectField,
      selectionMode,
      filteredObjectChildren,
      filteredArrayChildren
    }
  }
})
</script>

<style lang="scss" scoped>
.json-tree-node {
  position: relative;
}

.node-content {
  display: flex;
  align-items: center;
  padding: 2px 0;
  cursor: default;

  &:hover {
    background-color: rgba(0, 0, 0, 0.03);

    .body--dark & {
      background-color: rgba(255, 255, 255, 0.03);
    }
  }
}

.node-expandable {
  cursor: pointer;
}

.toggle-icon {
  margin-right: 4px;
  transition: transform 0.2s;
}

.node-expanded > .toggle-icon {
  transform: rotate(0);
}

.node-spacer {
  width: 1.2em;
  display: inline-block;
}

.node-array-index {
  font-weight: normal;
  color: #1976d2;
  margin-right: 4px;

  .body--dark & {
    color: #64b5f6;
  }
}

.node-key {
  font-weight: bold;
  color: #881391;
  margin-right: 4px;

  .body--dark & {
    color: #bb86fc; /* Use a purple color that's visible in dark mode */
  }
}

.root-node {
  color: #000000;

  .body--dark & {
    color: #ffffff;
  }
}

.node-value {
  margin-right: 4px;

  .body--dark & {
    color: var(--q-color-grey-3, #e0e0e0);
  }
}

.node-string {
  color: #c41a16;

  .body--dark & {
    color: #ff6b6b;
  }
}

.node-number {
  color: #1a1aa6;

  .body--dark & {
    color: #4fc3f7;
  }
}

.node-boolean {
  color: #0000ff;

  .body--dark & {
    color: #64b5f6;
  }
}

.node-null {
  color: #808080;
  font-style: italic;

  .body--dark & {
    color: #aaaaaa;
  }
}

.node-preview {
  color: #999;
  font-style: italic;

  .body--dark & {
    color: #bdbdbd;
  }
}

.selection-controls {
  margin-left: 8px;
  display: flex;
  gap: 8px;
  opacity: 1;
  visibility: visible;
  z-index: 10;
}

/* Make array nodes more prominent */
.json-tree-node {
  &:hover {
    background-color: rgba(25, 118, 210, 0.05);
  }
}

.node-array-item {
  border-left: 2px solid rgba(25, 118, 210, 0.3);
  margin-left: -6px;
  padding-left: 4px;
  position: relative;

  &:before {
    content: '';
    position: absolute;
    left: -6px;
    top: 0;
    width: 4px;
    height: 100%;
    background-color: rgba(25, 118, 210, 0.05);
  }

  &:hover:before {
    background-color: rgba(25, 118, 210, 0.1);
  }
}

/* Style the debug indicator */
.debug-indicator {
  margin-left: 8px;
}

.node-children {
  margin-left: 4px;
}

.empty-array {
  color: #999;
  padding-left: 20px;
  font-style: italic;

  .body--dark & {
    color: #bdbdbd;
  }
}

.array-container {
  position: relative;
  padding-left: 4px;
  border-left: 1px dashed rgba(25, 118, 210, 0.3);
}

.array-notice {
  font-size: 0.8rem;
  font-style: italic;
}

.array-ellipsis {
  color: #999;
  font-style: italic;
  padding-left: 20px;
  margin-top: 4px;
  font-size: 1.2rem;

  .body--dark & {
    color: #bdbdbd;
  }
}
</style>
