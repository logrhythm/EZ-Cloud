<template>
  <div v-if="shouldShowNode" class="json-tree-node" :style="{ paddingLeft: `${level * 12}px` }">
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
      </template>
      <template v-else-if="isArrayItem">
        <span class="node-array-index">[{{ arrayIndex }}]</span>
        <span class="node-key" v-if="displayKey !== `[${arrayIndex}]`">{{ displayKey }}</span>
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
      <!-- Preview text removed for cleaner UI in array selection mode -->

      <!-- Selection indicators for arrays and potential JSON strings -->
      <div class="selection-controls" v-if="isSelectable">
        <q-checkbox
          v-if="isArray && (selectionMode === 'array' || selectionMode === 'both')"
          :value="isSelectedArray"
          dense
          color="primary"
          @input="selectField('array')"
        />

        <q-checkbox
          v-if="isPotentialJson && (selectionMode === 'json' || selectionMode === 'both')"
          :value="isSelectedJson"
          dense
          color="secondary"
          @input="selectField('json')"
        />

        <!-- Warning badge for missing arrays -->
        <q-badge
          v-if="isArray && isMissingArray"
          color="orange"
          text-color="white"
          class="q-ml-sm"
        >
          <q-icon name="warning" size="xs" class="q-mr-xs" />
          Missing
        </q-badge>
      </div>

      <!-- Debug indicator for array paths -->
      <!-- Removed debug indicator -->
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
          :missing-array-paths="missingArrayPaths"
          @toggle-node="(p) => $emit('toggle-node', p)"
          @select-field="(p, t) => $emit('select-field', p, t)"
        />
      </template>
      <template v-else-if="isArray">
        <div v-if="node.length === 0" class="empty-array">[]</div>
        <template v-else>
          <div class="array-container">
            <!-- Debug: Log what we're about to render -->
            <template v-if="false">{{ logArrayRender() }}</template>
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
              :missing-array-paths="missingArrayPaths"
              @toggle-node="(p) => $emit('toggle-node', p)"
              @select-field="(p, t) => $emit('select-field', p, t)"
            />
          </div>
        </template>
      </template>
    </div>
  </div>
</template>

<script>
import { defineComponent, computed, inject } from 'vue'
import { PathNormalizer } from '../../services/wizard/pathNormalizer'

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
    },

    /**
     * Paths of arrays that are missing from sample data but defined in policy
     */
    missingArrayPaths: {
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
     */ const containsArrays = (value, childKey, currentPath) => {
      try {
        if (value === null || value === undefined) return false

        // Build the full path for this child
        const childPath = currentPath === 'root' ? childKey : `${currentPath}.${childKey}`

        // Normalize the path for comparison (e.g., projects[0] -> projects[*])
        const normalizedChildPath = PathNormalizer.normalize(childPath)

        // Check if this specific normalized path is in arrayPaths
        if (props.arrayPaths.includes(normalizedChildPath)) {
          return true
        }

        // If the value itself is an array, check if any nested path starts with this childPath
        if (Array.isArray(value)) {
          const result = props.arrayPaths.some(arrayPath => {
            const exactMatch = arrayPath === normalizedChildPath
            const dotMatch = arrayPath.startsWith(normalizedChildPath + '.')
            const bracketMatch = arrayPath.startsWith(normalizedChildPath + '[')

            return exactMatch || dotMatch || bracketMatch
          })
          return result
        }

        // If it's an object, recursively check if it contains arrays
        if (typeof value === 'object') {
          const result = props.arrayPaths.some(arrayPath => {
            const matchesDot = arrayPath.startsWith(normalizedChildPath + '.')
            const matchesBracket = arrayPath.startsWith(normalizedChildPath + '[')

            return matchesDot || matchesBracket
          })
          return result
        }

        return false
      } catch (error) {
        console.error('[JsonTreeNode] Error in containsArrays', { childKey, currentPath, error: error.message })
        return false
      }
    }

    // Computed properties for node type detection
    const isObject = computed(() => {
      if (typeof props.node !== 'object' || props.node === null) {
        return false
      }

      // Check if this is a metadata object with type/children/path structure
      if (props.node && typeof props.node === 'object' && !Array.isArray(props.node) &&
          props.node.type && props.node.children && (props.node.path || props.node.key)) {
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
      return (isObject.value && Object.keys(props.node).length > 0) ||
        (isArray.value && props.node.length > 0)
    })

    const isExpanded = computed(() => {
      if (!expandedNodes || !expandedNodes.value) {
        console.error('[JsonTreeNode] expandedNodes is undefined - tree expansion will not work', { path: props.path })
        return false
      }
      return expandedNodes.value.has(props.path)
    })

    /**
     * Determine if this node should be shown in the tree
     * In array selection mode, only show arrays and objects/items that contain arrays
     */
    const shouldShowNode = computed(() => {
      // Always show root node
      if (props.isRoot) {
        return true
      }

      // In non-array modes, show all nodes
      if (selectionMode !== 'array') {
        return true
      }

      // In array selection mode:
      // 1. Show if this is an array
      if (isArray.value) {
        return true
      }

      // 2. Show if this is an object that contains arrays (check filteredObjectChildren)
      if (isObject.value) {
        // Check if this object has any children that contain arrays
        const hasArrayChildren = Object.entries(props.node).some(([childKey, childValue]) => {
          return containsArrays(childValue, childKey, props.path)
        })
        return hasArrayChildren
      }

      // 3. Don't show primitive values in array selection mode
      return false
    })

    // Determine if this node is selectable (array or potential JSON)
    const isSelectable = computed(() => {
      return isArray.value || isPotentialJson.value
    })

    // Check if this node is a potential JSON string
    const isPotentialJson = computed(() => {
      if (!isString.value) return false

      // Case-insensitive comparison
      const normalizedPath = PathNormalizer.normalize(props.path, {
        removePrefix: true,
        removeWildcards: false,
        removeIndices: true
      }).toLowerCase()

      return props.potentialJsonPaths.some(jsonPath => {
        const normalizedJsonPath = PathNormalizer.normalize(jsonPath, {
          removePrefix: true,
          removeWildcards: false,
          removeIndices: true
        }).toLowerCase()
        return normalizedJsonPath === normalizedPath
      })
    })

    // Check if this node is selected as array or JSON
    const isSelectedArray = computed(() => {
      // Normalize both current path and selected paths using PathNormalizer
      const normalizedCurrentPath = PathNormalizer.normalize(props.path, {
        removePrefix: true,
        removeWildcards: false,
        removeIndices: true
      }).toLowerCase() // Case-insensitive comparison

      // Check if any selected path matches this path (after normalization)
      const pathIncluded = props.selectedPaths.some(selectedPath => {
        const normalizedSelectedPath = PathNormalizer.normalize(selectedPath, {
          removePrefix: true,
          removeWildcards: false,
          removeIndices: true
        }).toLowerCase() // Case-insensitive comparison

        // Exact match
        if (normalizedSelectedPath === normalizedCurrentPath) {
          return true
        }

        // For nested fanout arrays: check if the current path ends with the selected path
        // This handles cases where:
        //   - currentPath: "log.Records[0].requestParameters.changeBatch.changes"
        //   - selectedPath: "$.requestParameters.changeBatch.changes" (relative to parent)
        // After normalization:
        //   - currentPath: "log.records[*].requestparameters.changebatch.changes"
        //   - selectedPath: "requestparameters.changebatch.changes"
        // The current path should end with ".requestparameters.changebatch.changes"
        if (normalizedCurrentPath.endsWith('.' + normalizedSelectedPath) ||
            normalizedCurrentPath.endsWith('[*].' + normalizedSelectedPath)) {
          return true
        }

        return false
      })

      // Check if this path is in arrayPaths (also normalize for comparison)
      const isArrayPath = props.arrayPaths.some(arrayPath => {
        const normalizedArrayPath = PathNormalizer.normalize(arrayPath, {
          removePrefix: true,
          removeWildcards: false,
          removeIndices: true
        }).toLowerCase() // Case-insensitive comparison
        return normalizedArrayPath === normalizedCurrentPath
      })

      return pathIncluded && isArrayPath
    })

    /**
     * Check if this array is marked as missing from sample data
     */
    const isMissingArray = computed(() => {
      if (!isArray.value) return false

      // Normalize current path using PathNormalizer
      const normalizedCurrentPath = PathNormalizer.normalize(props.path, {
        removePrefix: true,
        removeWildcards: false,
        removeIndices: true
      }).toLowerCase() // Case-insensitive comparison

      // Check if this path is in the missing arrays list
      return props.missingArrayPaths.some(missingPath => {
        const normalizedMissingPath = PathNormalizer.normalize(missingPath, {
          removePrefix: true,
          removeWildcards: false,
          removeIndices: true
        }).toLowerCase() // Case-insensitive comparison
        return normalizedMissingPath === normalizedCurrentPath ||
               normalizedCurrentPath.endsWith('.' + normalizedMissingPath)
      })
    })

    const isSelectedJson = computed(() => {
      // Normalize current path using PathNormalizer
      const normalizedCurrentPath = PathNormalizer.normalize(props.path, {
        removePrefix: true,
        removeWildcards: false,
        removeIndices: true
      }).toLowerCase() // Case-insensitive comparison

      // Check if any selected path matches this path (after normalization)
      const pathIncluded = props.selectedPaths.some(selectedPath => {
        const normalizedSelectedPath = PathNormalizer.normalize(selectedPath, {
          removePrefix: true,
          removeWildcards: false,
          removeIndices: true
        }).toLowerCase() // Case-insensitive comparison
        return normalizedSelectedPath === normalizedCurrentPath
      })

      // Case-insensitive check for potential JSON paths
      const isPotentialJsonPath = props.potentialJsonPaths.some(jsonPath => {
        const normalizedJsonPath = PathNormalizer.normalize(jsonPath, {
          removePrefix: true,
          removeWildcards: false,
          removeIndices: true
        }).toLowerCase()
        return normalizedJsonPath === normalizedCurrentPath
      })

      return pathIncluded && isPotentialJsonPath
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

      // Validate inputs
      if (childKey === undefined || childKey === null) {
        console.error('[JsonTreeNode] Invalid childKey in getChildPath', { path: props.path, childKey })
        return props.path
      }

      // Special handling for array items to create better paths
      if (Array.isArray(props.node)) {
        // For array items, return path with array index notation
        return `${props.path}[${childKey}]`
      }

      return `${props.path}.${childKey}`
    }

    const toggleNode = () => {
      if (!isExpandable.value) return
      if (!expandedNodes || !expandedNodes.value) {
        console.error('[JsonTreeNode] Cannot toggle node - expandedNodes is undefined', { path: props.path })
        return
      }
      emit('toggle-node', props.path)
    }

    const selectField = (type) => {
      // Validate field selection
      if (!props.path) {
        console.error('[JsonTreeNode] Cannot select field - path is undefined', { type })
        return
      }

      // Create a node type object to provide more context for selection
      const nodeInfo = {
        type: type,
        isArray: isArray.value,
        isPotentialJson: isPotentialJson.value,
        path: props.path
      }

      // Emit event for selection
      emit('select-field', props.path, nodeInfo)
    }

    // Computed to check if children should be rendered
    const shouldRenderChildren = computed(() => {
      return isExpanded.value && isExpandable.value
    })

    /**
     * Filter object children to only show properties that contain arrays
     */
    const filteredObjectChildren = computed(() => {
      if (!isObject.value) {
        return []
      }

      // When in array selection mode, only show children that contain arrays
      if (selectionMode === 'array') {
        const entries = Object.entries(props.node)

        const filtered = entries.filter(([childKey, childValue]) => {
          return containsArrays(childValue, childKey, props.path)
        })

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

      try {
        const items = props.node.slice(0, 20)

        // When in array selection mode, check if array items contain nested arrays
        if (selectionMode === 'array') {
          // Get the first item to check structure
          if (items.length === 0) return []

          const firstItem = items[0]

          // Check if this array itself is in the arrayPaths (it's selectable)
          const normalizedPath = PathNormalizer.normalize(props.path)
          const isThisArraySelectable = props.arrayPaths.includes(normalizedPath)

          // If this array itself is selectable (a leaf array or an array of primitives),
          // show its items for preview purposes (limited to first 20)
          if (isThisArraySelectable) {
            return items
          }

          // If array items are objects, check if they contain nested arrays
          if (typeof firstItem === 'object' && firstItem !== null && !Array.isArray(firstItem)) {
            // Check if any property in the first item leads to an array
            const hasNestedArrays = Object.keys(firstItem).some(key => {
              const keyToCheck = key

              // Normalize the current path to use [*] wildcard for comparison
              const normalizedCurrentPath = PathNormalizer.normalize(props.path).toLowerCase() // Case-insensitive

              // When checking a property of an array element, the path should include [*]
              const expectedPathPrefix = `${normalizedCurrentPath}[*].${keyToCheck.toLowerCase()}` // Case-insensitive

              // Check if any arrayPath starts with this prefix
              const matches = props.arrayPaths.some(arrayPath => {
                const normalizedArrayPath = PathNormalizer.normalize(arrayPath).toLowerCase() // Case-insensitive
                // Direct match: projects[*].teams[*].members
                if (normalizedArrayPath === expectedPathPrefix) {
                  return true
                }

                // Prefix match with array index: projects[*].teams[*].members[*]...
                if (normalizedArrayPath.startsWith(expectedPathPrefix + '[*]')) {
                  return true
                }

                // Also check for deeper nesting with dot notation
                if (normalizedArrayPath.startsWith(expectedPathPrefix + '.')) {
                  return true
                }

                return false
              })

              return matches
            })

            // If there are nested arrays, show the items so users can navigate to them
            if (hasNestedArrays) {
              return items
            }

            // Otherwise, don't show the items since they don't contain arrays
            return []
          }

          // For non-object array items (primitives or arrays), don't show them in array mode
          // unless this array itself is selectable (which we already checked above)
          return []
        }

        // In other modes, show all items
        return items
      } catch (error) {
        console.error('[JsonTreeNode] Error filtering array children', { path: props.path, error: error.message })
        return []
      }
    })

    // Function to log what's about to be rendered (empty for production)
    const logArrayRender = () => {
      return ''
    }

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
      isMissingArray,
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
      filteredArrayChildren,
      logArrayRender
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
  flex-wrap: nowrap; /* Prevent wrapping */
  min-height: 28px; /* Ensure consistent height */

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
  margin-left: 8px; /* Small gap after label */
  display: flex;
  gap: 8px;
  opacity: 1;
  visibility: visible;
  z-index: 10;
  flex-shrink: 0; /* Prevent shrinking */
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

/* Style for missing array indicators */
.node-content:has(.selection-controls .q-badge) {
  background-color: rgba(255, 152, 0, 0.05);
  border-left: 2px solid #ff9800;
  padding-left: 4px;
  margin-left: -6px;
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
