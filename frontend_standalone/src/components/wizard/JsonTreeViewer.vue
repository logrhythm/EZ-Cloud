<template>
  <div class="json-tree-viewer">
    <div v-if="!data || Object.keys(data).length === 0" class="text-grey q-pa-md">
      No data to display
    </div>
    <div v-else-if="isMetadataObject" class="text-negative q-pa-md">
      <q-icon name="error" size="24px" class="q-mr-sm" />
      Error: Received metadata object instead of JSON data. Please check console for details.
    </div>
    <div v-else-if="selectionMode === 'array' && arrayPaths.length === 0" class="text-grey q-pa-md">
      No array fields detected in the data structure.
    </div>
    <div v-else class="tree-container">
      <div class="json-tree">
        <json-tree-node
          :node="processedData"
          :path="'root'"
          :level="0"
          :is-root="true"
          :selected-paths="selectedPaths"
          :potential-json-paths="potentialJsonPaths"
          :array-paths="selectionMode === 'array' ? normalizedArrayPaths : arrayPaths"
          :missing-array-paths="missingArrayPaths"
          @toggle-node="toggleNode"
          @select-field="selectField"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { defineComponent, ref, computed, watch, provide } from 'vue'
import JsonTreeNode from './JsonTreeNode.vue'
import { PathNormalizer } from '../../services/wizard/pathNormalizer'

export default defineComponent({
  name: 'JsonTreeViewer',

  components: {
    JsonTreeNode
  },

  props: {
    /**
     * The JSON data to display in the tree view
     */
    data: {
      type: [Object, Array],
      required: true
    },

    /**
     * Mode of selection ('array' for array fanout, 'json' for stringified JSON)
     */
    selectionMode: {
      type: String,
      default: 'array',
      validator: (value) => ['array', 'json', 'both'].includes(value)
    },

    /**
     * Initially selected field paths
     */
    initialSelectedPaths: {
      type: Array,
      default: () => []
    },

    /**
     * If true, only array fields and their ancestor scaffolding are shown
     */
    arrayOnlyMode: {
      type: Boolean,
      default: false
    },

    /**
     * Array of paths that are missing from sample data but defined in policy
     */
    missingArrayPaths: {
      type: Array,
      default: () => []
    }
  },

  emits: ['update:selected', 'node-toggled', 'field-selected', 'select-field'],

  setup (props, { emit }) {
    // Track expanded nodes - initialize with root expanded
    const expandedNodes = ref(new Set(['root']))

    // Track selected field paths
    const selectedPaths = ref(Array.isArray(props.initialSelectedPaths) ? [...props.initialSelectedPaths] : [])

    // Log selected paths after initialization

    // Track parsed JSON strings
    const parsedJsonFields = ref(new Map())

    /**
     * Get a field value from an object by path
     */
    const getFieldValueByPath = (obj, path) => {
      if (!obj || !path || path === 'root') return obj

      try {
        // Handle array indices in path
        const parts = path.replace(/\[(\d+)\]/g, '.$1').split('.')
        let current = obj

        for (const part of parts) {
          if (current === undefined || current === null) {
            return undefined
          }
          if (typeof current !== 'object') {
            return undefined
          }

          // Handle numeric indices properly
          const index = /^\d+$/.test(part) ? parseInt(part) : part
          current = current[index]
        }

        return current
      } catch (e) {
        console.error(`Error getting value at path '${path}':`, e)
        return undefined
      }
    }

    /**
     * Set a field value in an object by path
     */
    const setFieldValueByPath = (obj, path, value) => {
      if (!obj || !path || path === 'root') {
        return value // Replace the entire object
      }

      try {
        // Create a deep copy first
        const result = JSON.parse(JSON.stringify(obj))

        // Handle array indices in path
        const parts = path.replace(/\[(\d+)\]/g, '.$1').split('.')
        const lastPart = parts.pop()

        // Navigate to the parent object
        let current = result
        for (const part of parts) {
          // Handle numeric indices properly
          const index = /^\d+$/.test(part) ? parseInt(part) : part

          if (current[index] === undefined) {
            // Create missing objects/arrays in the path
            const nextPartRaw = parts[parts.indexOf(part) + 1] || lastPart
            const isNextNumeric = /^\d+$/.test(nextPartRaw)
            current[index] = isNextNumeric ? [] : {}
          }
          current = current[index]
        }

        // Set the value - handle numeric indices for the last part too
        const finalIndex = /^\d+$/.test(lastPart) ? parseInt(lastPart) : lastPart
        current[finalIndex] = value
        return result
      } catch (e) {
        console.error(`Error setting value at path '${path}':`, e)
        return obj // Return original object unchanged on error
      }
    }

    /**
     * Helper function to recursively copy only the parts of source that lead to arrays
     * This preserves the complete structure of array elements that contain nested arrays
     */
    const copyArrayPathsStructure = (source, targetPath, allArrayPaths) => {
      // Get the value at the target path
      const value = getFieldValueByPath(source, targetPath)

      if (!value) {
        return null
      }

      // If this is an array, we need to copy it and check if its elements contain nested arrays
      if (Array.isArray(value)) {
        // Build the prefix to check for nested arrays
        // IMPORTANT: Normalize the targetPath to use [*] wildcards for comparison
        const normalizedTargetPath = PathNormalizer.normalize(targetPath)
        const pathPrefix = normalizedTargetPath ? `${normalizedTargetPath}[` : '['

        // Check if there are any nested arrays within this array's elements
        const hasNestedArrays = allArrayPaths.some(path => {
          // Check if path starts with normalizedTargetPath[ (for nested arrays in this array)
          if (path.startsWith(pathPrefix)) {
            return true
          }

          // Also check for paths like normalizedTargetPath. (for objects containing arrays)
          if (normalizedTargetPath && path.startsWith(normalizedTargetPath + '.')) {
            return true
          }

          return false
        })

        if (hasNestedArrays && value.length > 0) {
          // Copy the array and recursively process its first element if it's an object
          const arrayCopy = []

          // Process first element if it contains nested arrays
          const firstElement = value[0]
          if (typeof firstElement === 'object' && firstElement !== null && !Array.isArray(firstElement)) {
            const processedElement = {}

            // For each property in the first element, check if it leads to an array
            for (const key in firstElement) {
              // Build the child path correctly - this is the path to this property within the first array element
              const childPath = targetPath ? `${targetPath}[0].${key}` : `[0].${key}`

              // IMPORTANT: Normalize the childPath to use [*] wildcards for comparison
              const normalizedChildPath = PathNormalizer.normalize(childPath)

              // Check if this property or its descendants contain arrays
              // Compare using normalized paths (with [*] wildcards)
              const leadsToArray = allArrayPaths.some(arrayPath => {
                // Direct match (e.g., 'projects[*].teams' === 'projects[*].teams')
                if (arrayPath === normalizedChildPath) {
                  return true
                }

                // Check if array path starts with this child path followed by array index
                // (e.g., 'projects[*].teams[*].members' starts with 'projects[*].teams[')
                if (arrayPath.startsWith(normalizedChildPath + '[')) {
                  return true
                }

                // Check if array path starts with this child path followed by a dot
                // (e.g., 'projects[*].teams[*].members' starts with 'projects[*].teams.')
                if (arrayPath.startsWith(normalizedChildPath + '.')) {
                  return true
                }

                return false
              })

              if (leadsToArray) {
                // Recursively copy this branch
                const childValue = copyArrayPathsStructure(source, childPath, allArrayPaths)
                if (childValue !== null && childValue !== undefined) {
                  processedElement[key] = childValue
                }
              }
            }

            // Only add the processed element if it has properties
            if (Object.keys(processedElement).length > 0) {
              arrayCopy.push(processedElement)
            }
          }

          const result = arrayCopy.length > 0 ? arrayCopy : value
          return result
        }

        // Return the array as-is if it has no nested arrays
        return value
      } else if (typeof value === 'object' && value !== null) {
        // For objects, recursively process properties that lead to arrays
        const result = {}

        for (const key in value) {
          const childPath = targetPath ? `${targetPath}.${key}` : key

          // IMPORTANT: Normalize the childPath to use [*] wildcards for comparison
          const normalizedChildPath = PathNormalizer.normalize(childPath)

          // Check if this property or its descendants contain arrays
          // Compare using normalized paths (with [*] wildcards)
          const leadsToArray = allArrayPaths.some(arrayPath => {
            // Direct match
            if (arrayPath === normalizedChildPath) {
              return true
            }

            // Check if array path starts with this child path
            if (arrayPath.startsWith(normalizedChildPath + '[')) {
              return true
            }
            if (arrayPath.startsWith(normalizedChildPath + '.')) {
              return true
            }

            return false
          })

          if (leadsToArray) {
            const childValue = copyArrayPathsStructure(source, childPath, allArrayPaths)
            if (childValue !== null && childValue !== undefined) {
              result[key] = childValue
            }
          }
        }

        const finalResult = Object.keys(result).length > 0 ? result : null
        return finalResult
      }

      return null
    }

    /**
     * Filter data to show only array fields and their paths
     * This builds a hierarchical structure showing all nested arrays
     */
    const filterToArraysOnly = (data, arrayPaths) => {
      if (!data || !arrayPaths || arrayPaths.length === 0) {
        return data
      }

      // Special handling: if root is an array, start from first item
      const isRootArray = Array.isArray(data)
      const sourceData = isRootArray && data.length > 0 ? data[0] : data

      // Normalize array paths using PathNormalizer - remove leading [0]. prefix for root arrays
      const normalizedPaths = arrayPaths.map(path => {
        if (path.startsWith('[')) {
          const normalized = path.replace(/^\[\d+\]\.?/, '')
          return normalized
        }
        return path
      }).filter(p => p && p.trim() !== '') // Remove empty paths

      // Use the new recursive approach to build the filtered structure
      // Start from the root and recursively copy only paths that lead to arrays
      const filtered = copyArrayPathsStructure(sourceData, '', normalizedPaths)

      const result = filtered || sourceData
      return result
    }

    // Helper used when arrayOnlyMode === true. This was previously missing, causing a no-undef lint error.
    // It prunes the data to only show array paths and their ancestor scaffolding.
    const pruneToArraysOnly = (data) => {
      try {
        return filterToArraysOnly(data, arrayPaths.value)
      } catch (e) {
        console.error('Error in pruneToArraysOnly', e)
        return data
      }
    }

    // Check if we received a metadata object instead of raw JSON
    const isMetadataObject = computed(() => {
      const data = props.data
      if (!data || typeof data !== 'object') return false

      // Check for typical metadata structure patterns
      // More robust check for metadata objects - must have type, children, and either path or key properties
      const hasMetadataStructure = typeof data === 'object' &&
                                 !Array.isArray(data) &&
                                 data.type &&
                                 data.children &&
                                 (data.path || data.key)

      return hasMetadataStructure
    })

    // Processed data with parsed JSON
    const processedData = computed(() => {
      // Check if the input data is valid
      if (!props.data) {
        return {}
      }

      // Handle different types of data
      const dataToProcess = props.data

      // Check if we got a metadata object instead of raw JSON
      if (isMetadataObject.value) {
        // Return a simple structure rather than trying to process the metadata
        return { error: 'Invalid data format. Please check the console for details.' }
      }

      // Handle primitive types (convert to object representation)
      if (typeof dataToProcess !== 'object' || dataToProcess === null) {
        return { value: dataToProcess }
      }

      // Start with a deep copy of the original data
      let processed
      try {
        processed = JSON.parse(JSON.stringify(props.data))
      } catch (e) {
        return { error: 'Could not process data structure' }
      }

      // Apply all JSON parsing based on selected fields
      selectedPaths.value.forEach(path => {
        if (potentialJsonPaths.value.includes(path)) {
          const value = getFieldValueByPath(processed, path)
          if (typeof value === 'string') {
            try {
              // Parse the JSON string
              const parsedValue = JSON.parse(value)
              // Store the parsed result
              parsedJsonFields.value.set(path, parsedValue)
              // Update the processed data
              processed = setFieldValueByPath(processed, path, parsedValue)
            } catch (error) {
              console.error('Error parsing JSON', error)
            }
          }
        }
      })

      // If selection mode is 'array', filter to show only arrays
      if (props.selectionMode === 'array' && props.arrayOnlyMode) {
        processed = pruneToArraysOnly(processed)
      } else if (props.selectionMode === 'array' && arrayPaths.value.length > 0) {
        processed = filterToArraysOnly(processed, arrayPaths.value)
      }

      return processed
    })

    // Detect array paths and potential JSON string paths
    const arrayPaths = computed(() => {
      const paths = []
      const processedPaths = new Set() // Track processed paths to avoid duplicates

      const traverse = (obj, path = '', normalizedPath = '') => {
        if (obj === null || obj === undefined) return

        // Skip metadata objects with type/children structure
        if (typeof obj === 'object' && obj !== null && !Array.isArray(obj) &&
            obj.type && obj.children && (obj.path || obj.key)) {
          return
        }

        // Use normalized path for uniqueness checks
        const pathForCheck = normalizedPath || path

        if (Array.isArray(obj)) {
          // Only add the path if we haven't processed this structure yet
          // Make sure the path exists and isn't empty before adding it
          if (path && path.trim() !== '' && !processedPaths.has(pathForCheck)) {
            // Normalize the path to use [*] wildcards instead of [0], [1], etc.
            const normalizedArrayPath = PathNormalizer.normalize(path, {
              removePrefix: true,
              removeWildcards: false,
              removeIndices: true
            })
            paths.push(normalizedArrayPath)
            processedPaths.add(pathForCheck)
          }

          if (obj.length > 0) {
            // Check if array items have consistent structure
            const hasSameStructure = obj.length >= 2 &&
                                   checkArrayItemsHaveSameStructure(obj.slice(0, Math.min(5, obj.length)))

            if (hasSameStructure && obj.every(item => typeof item === 'object' && item !== null)) {
              // Process just the first item but with a normalized path
              const firstItem = obj[0]
              const itemNormalizedPath = path ? `${path}[*]` : '[*]' // Using * to indicate any array index
              const itemPath = path ? `${path}[0]` : '[0]' // Use first item for actual reference

              traverse(firstItem, itemPath, itemNormalizedPath)
            } else {
              // If items have different structures, process each separately
              const maxItems = Math.min(obj.length, 5)
              for (let i = 0; i < maxItems; i++) {
                if (typeof obj[i] === 'object' && obj[i] !== null) {
                  traverse(obj[i], `${path}[${i}]`)
                }
              }
            }
          }
        } else if (typeof obj === 'object') {
          for (const key in obj) {
            const nextPath = path ? `${path}.${key}` : key
            const nextNormalizedPath = normalizedPath ? `${normalizedPath}.${key}` : key
            traverse(obj[key], nextPath, nextNormalizedPath)
          }
        }
      }

      // Helper to check if array items have the same structure
      function checkArrayItemsHaveSameStructure (items) {
        if (!items || items.length < 2) return true
        if (!items.every(item => item && typeof item === 'object')) return false

        // Compare object keys of first two items to check for structural similarity
        const firstItemKeys = Object.keys(items[0]).sort().join(',')
        return items.slice(1).every(item => {
          return Object.keys(item).sort().join(',') === firstItemKeys
        })
      }

      // Start traversal with props.data
      traverse(props.data)
      return paths
    })

    // Normalized array paths for display when filtering to arrays only
    // This removes the leading [0]. prefix when root is an array
    const normalizedArrayPaths = computed(() => {
      // Check if root is an array
      const isRootArray = Array.isArray(props.data)
      if (!isRootArray) {
        return arrayPaths.value
      }

      // Normalize paths by removing leading [0].
      const normalized = arrayPaths.value.map(path => {
        if (path.startsWith('[')) {
          return path.replace(/^\[\d+\]\.?/, '')
        }
        return path
      }).filter(p => p && p.trim() !== '')

      return normalized
    })

    const potentialJsonPaths = computed(() => {
      const paths = []
      // const uniqueStructures = new Map() // Map to track unique structures in arrays (unused)

      const traverse = (obj, path = '', normalizedPath = '') => {
        if (obj === null || obj === undefined) return

        // Skip metadata objects with type/children structure
        if (typeof obj === 'object' && obj !== null && !Array.isArray(obj) &&
            obj.type && obj.children && (obj.path || obj.key)) {
          return
        }

        // Use normalized path for uniqueness checks
        // const pathForCheck = normalizedPath || path // Currently unused

        if (typeof obj === 'string') {
          // Check if the string might be JSON
          if ((obj.startsWith('{') && obj.endsWith('}')) ||
              (obj.startsWith('[') && obj.endsWith(']'))) {
            try {
              JSON.parse(obj)
              paths.push(path)
            } catch (e) {
              // Not valid JSON, ignore
            }
          }
        } else if (Array.isArray(obj)) {
          if (obj.length > 0) {
            // Check if array items have the same structure
            const hasSameStructure = checkArrayItemsHaveSameStructure(obj)

            if (hasSameStructure && obj.every(item => typeof item === 'object' && item !== null)) {
              // Process just the first item but use a normalized path for structure analysis
              const firstItem = obj[0]
              const itemNormalizedPath = path ? `${path}[*]` : '[*]' // Using * to indicate any array index
              const itemPath = path ? `${path}[0]` : '[0]' // Use first item's path for actual reference

              traverse(firstItem, itemPath, itemNormalizedPath)
            } else {
              // If items have different structures, process each separately
              const maxItems = Math.min(obj.length, 5)
              for (let i = 0; i < maxItems; i++) {
                if (typeof obj[i] === 'object' && obj[i] !== null) {
                  traverse(obj[i], `${path}[${i}]`)
                }
              }
            }
          }
        } else if (typeof obj === 'object') {
          for (const key in obj) {
            const nextPath = path ? `${path}.${key}` : key
            const nextNormalizedPath = normalizedPath ? `${normalizedPath}.${key}` : key
            traverse(obj[key], nextPath, nextNormalizedPath)
          }
        }
      }

      // Helper to check if array items have the same structure
      function checkArrayItemsHaveSameStructure (items) {
        if (items.length < 2) return true
        if (!items.every(item => item && typeof item === 'object')) return false

        // Compare object keys of first two items to check for structural similarity
        const firstItemKeys = Object.keys(items[0]).sort().join(',')
        return items.slice(1, 5).every(item => {
          return Object.keys(item).sort().join(',') === firstItemKeys
        })
      }

      traverse(props.data)
      return paths
    })

    // Toggle node expansion
    const toggleNode = (path) => {
      if (expandedNodes.value.has(path)) {
        expandedNodes.value.delete(path)
      } else {
        expandedNodes.value.add(path)
      }

      emit('node-toggled', {
        path,
        expanded: expandedNodes.value.has(path)
      })
    }

    // Provide expandedNodes to child components to prevent infinite recursion
    provide('expandedNodes', expandedNodes)
    // Provide selectionMode to child components
    provide('selectionMode', props.selectionMode)

    /**
     * Get all parent array paths for a given array path
     * Example: "requestParameters.changeBatch.changes" -> ["requestParameters.changeBatch", "requestParameters"]
     * Example: "$.LOG.events.data" -> ["$.LOG.events", "$.LOG"]
     * @param {string} arrayPath - The full path to the array
     * @returns {Array<string>} - Array of parent paths (from immediate parent to root)
     */
    const getParentArrayPaths = (arrayPath) => {
      const parentPaths = []

      if (!arrayPath || arrayPath === 'root') {
        return parentPaths
      }

      // Normalize the input path to ensure we're working with [*] wildcards
      const normalizedPath = PathNormalizer.normalize(arrayPath, {
        removePrefix: true,
        removeWildcards: false,
        removeIndices: true
      })

      // Remove array brackets from the path for segmentation
      // e.g., "arr1[*].childarr[*]" -> "arr1.childarr"
      const pathWithoutBrackets = normalizedPath.replace(/\[\*\]/g, '')
      const segments = pathWithoutBrackets.split('.')

      // Build parent paths from most specific to least specific
      // e.g., "a.b.c.d" -> ["a.b.c", "a.b", "a"]
      for (let i = segments.length - 1; i > 0; i--) {
        const parentPathBase = segments.slice(0, i).join('.')

        // Check all array paths to see if any match this parent
        const matchingParent = arrayPaths.value.find(ap => {
          const normalizedAp = PathNormalizer.normalize(ap, {
            removePrefix: true,
            removeWildcards: false,
            removeIndices: true
          })

          // Remove brackets for comparison
          const apWithoutBrackets = normalizedAp.replace(/\[\*\]/g, '')

          const matches = apWithoutBrackets === parentPathBase

          return matches
        })

        if (matchingParent) {
          // Store the normalized version with [*] wildcards
          const normalizedParent = PathNormalizer.normalize(matchingParent, {
            removePrefix: true,
            removeWildcards: false,
            removeIndices: true
          })
          parentPaths.push(normalizedParent)
        }
      }

      return parentPaths
    }

    /**
     * Get all child array paths for a given parent array path
     * Example: "requestParameters" -> ["requestParameters.changeBatch", "requestParameters.changeBatch.changes"]
     * Example: "$.LOG" -> ["$.LOG.events", "$.LOG.events.data"]
     * @param {string} parentPath - The path to the parent array
     * @returns {Array<string>} - Array of child paths (all nested arrays under this parent)
     */
    const getChildArrayPaths = (parentPath) => {
      const childPaths = []

      if (!parentPath) {
        return childPaths
      }

      // Normalize the parent path to use [*] wildcards
      const normalizedParent = PathNormalizer.normalize(parentPath, {
        removePrefix: true,
        removeWildcards: false,
        removeIndices: true
      })

      // Remove brackets from parent for prefix matching
      const parentWithoutBrackets = normalizedParent.replace(/\[\*\]/g, '')

      // Find all arrays that are children of this parent path
      arrayPaths.value.forEach(arrayPath => {
        const normalizedArrayPath = PathNormalizer.normalize(arrayPath, {
          removePrefix: true,
          removeWildcards: false,
          removeIndices: true
        })

        // Skip if this is the parent itself
        if (normalizedArrayPath === normalizedParent) {
          return
        }

        // Remove brackets from child for comparison
        const arrayPathWithoutBrackets = normalizedArrayPath.replace(/\[\*\]/g, '')

        // Check if this is a child by seeing if it starts with the parent path
        const isChild = arrayPathWithoutBrackets.startsWith(parentWithoutBrackets + '.')

        if (isChild) {
          childPaths.push(normalizedArrayPath)
        }
      })

      return childPaths
    }

    // Select/deselect a field
    const selectField = (path, type) => {
      // Handle both formats - object with type property and direct type string
      const typeValue = typeof type === 'object' ? type.type : type
      const nodePath = typeof type === 'object' ? path : path
      const nodeInfo = typeof type === 'object' ? type : { type: type }

      // Normalize the path for array selections to use [*] wildcards
      let normalizedPath = nodePath
      if (typeValue === 'array') {
        normalizedPath = PathNormalizer.normalize(nodePath, {
          removePrefix: true,
          removeWildcards: false,
          removeIndices: true
        })
      }

      const index = selectedPaths.value.findIndex(p => p === normalizedPath)
      let existingPathIndex = -1 // Initialize existingPathIndex with a default value

      // Check if the selection mode matches the field type
      const isValidSelection = (
        (props.selectionMode === 'array' && typeValue === 'array') ||
        (props.selectionMode === 'json' && typeValue === 'json') ||
        (props.selectionMode === 'both')
      )

      if (!isValidSelection) {
        return
      }

      // Check if we're dealing with an array item path like [0].field_name
      if (nodePath && nodePath.match(/^\[\d+\]\.\w+/)) {
        const fieldName = nodePath.split('.')[1]

        // Check if another array item with the same field is already selected
        // and use that existing selection rather than adding a duplicate
        existingPathIndex = selectedPaths.value.findIndex(p => {
          // Match other array indices for the same field name
          return p.match(/^\[\d+\]\.\w+/) && p.split('.')[1] === fieldName
        })

        if (existingPathIndex >= 0 && index < 0) {
          // If another instance is selected, use that one's path instead
          // This ensures we don't add duplicates but still track the selection
          normalizedPath = selectedPaths.value[existingPathIndex]
        }
      }

      // Check which index to use - either the original one or existingPathIndex if applicable
      const effectiveIndex = (nodePath.match(/^\[\d+\]\.\w+/) && existingPathIndex >= 0 && index < 0) ? existingPathIndex : index

      if (effectiveIndex >= 0) {
        // Deselect
        selectedPaths.value.splice(effectiveIndex, 1)

        // Auto-deselect all child arrays when deselecting a parent array (for fanout mode)
        if (props.selectionMode === 'array' && typeValue === 'array') {
          const childPaths = getChildArrayPaths(normalizedPath)

          for (const childPath of childPaths) {
            // Check if child is currently selected
            const childIndex = selectedPaths.value.findIndex(p => p === childPath)
            if (childIndex >= 0) {
              // Child is selected, auto-deselect it
              selectedPaths.value.splice(childIndex, 1)
            }
          }
        }
      } else {
        // Select
        selectedPaths.value.push(normalizedPath)

        // Auto-select all parent arrays when selecting a child array (for fanout mode)
        if (props.selectionMode === 'array' && typeValue === 'array') {
          const parentPaths = getParentArrayPaths(normalizedPath)

          for (const parentPath of parentPaths) {
            // Check if parent is already selected
            const parentIndex = selectedPaths.value.findIndex(p => p === parentPath)
            if (parentIndex < 0) {
              // Parent not selected, auto-select it
              selectedPaths.value.push(parentPath)
            }
          }
        }
      }

      // Emit events for different handlers
      emit('update:selected', [...selectedPaths.value])
      emit('field-selected', {
        path: normalizedPath,
        selected: index < 0,
        type: typeValue
      })
      emit('select-field', normalizedPath, nodeInfo)
    }

    // Watch for changes in initial selected paths
    watch(() => props.initialSelectedPaths, (newPaths) => {
      // Ensure we have valid array to spread
      if (Array.isArray(newPaths)) {
        // Always set selectedPaths to a fresh copy of newPaths, even if empty
        selectedPaths.value = [...newPaths]
      } else {
        // Initialize as empty array if not an array
        selectedPaths.value = []
      }
    }, { deep: true, immediate: true })

    // Auto-expand nodes to show the structure on mount
    const autoExpandNodes = (obj, currentPath = 'root', depth = 0, maxDepth = 6) => {
      // increase maxDepth for deeper arrays
      if (depth > maxDepth) return

      if (!obj || typeof obj !== 'object') return

      // Expand current node
      expandedNodes.value.add(currentPath)

      if (Array.isArray(obj)) {
        // For arrays, expand the first item if it's an object
        if (obj.length > 0 && typeof obj[0] === 'object') {
          const firstItemPath = currentPath === 'root' ? '[0]' : `${currentPath}[0]`
          autoExpandNodes(obj[0], firstItemPath, depth + 1, maxDepth)
        }
      } else {
        // For objects, expand all child properties
        for (const key in obj) {
          const childPath = currentPath === 'root' ? key : `${currentPath}.${key}`
          autoExpandNodes(obj[key], childPath, depth + 1, maxDepth)
        }
      }
    }

    /**
     * Auto-expand nodes that contain nested arrays in array selection mode
     * This ensures all nested arrays are visible without manual expansion
     * CRITICAL FIX: Expands actual numeric-indexed array items (e.g., [0], [1])
     */
    const autoExpandArrayContainers = () => {
      if (props.selectionMode !== 'array') return

      const pathsToExpand = new Set()

      /**
       * Recursively expand all paths needed to reach an array
       * Converts wildcard paths like log.Records[*].changes[*] to actual paths like log.Records[0].changes[0]
       */
      const expandPathWithIndices = (pathWithWildcards, currentData = props.data, currentPath = '') => {
        // Split the path into segments
        const segments = pathWithWildcards.split(/\.|\[/)

        let data = currentData
        let builtPath = currentPath

        for (let i = 0; i < segments.length; i++) {
          let segment = segments[i]

          // Skip empty segments
          if (!segment) continue

          // Handle array indices (both [*] and [0])
          if (segment.includes(']')) {
            segment = segment.replace(']', '')

            // Check if this is a wildcard [*]
            if (segment === '*') {
              // We need to expand all items in the current array
              if (Array.isArray(data)) {
                // Expand each array item
                for (let idx = 0; idx < data.length; idx++) {
                  const itemPath = `${builtPath}[${idx}]`
                  pathsToExpand.add(itemPath)

                  // Recursively process the rest of the path for this item
                  const remainingSegments = segments.slice(i + 1)
                  if (remainingSegments.length > 0) {
                    const remainingPath = remainingSegments.join('.')
                      .replace(/\.\[/g, '[') // Fix array notation
                      .replace(/^\./, '') // Remove leading dot

                    if (remainingPath) {
                      expandPathWithIndices(remainingPath, data[idx], itemPath)
                    }
                  }
                }
                return // We've processed all items, done with this branch
              }
            } else {
              // Specific numeric index
              const idx = parseInt(segment)
              builtPath += `[${idx}]`

              if (Array.isArray(data) && data[idx] !== undefined) {
                data = data[idx]
                pathsToExpand.add(builtPath)
              } else {
                return
              }
            }
          } else {
            // Regular property
            if (builtPath) {
              builtPath += '.'
            }
            builtPath += segment

            if (data && typeof data === 'object' && segment in data) {
              data = data[segment]
              pathsToExpand.add(builtPath)
            } else {
              return
            }
          }
        }
      }

      // Process each array path
      arrayPaths.value.forEach(arrayPath => {
        // Convert path with wildcards to actual indexed paths
        expandPathWithIndices(arrayPath)
      })

      // Expand all the container paths
      const newExpandedNodes = new Set(expandedNodes.value)
      pathsToExpand.forEach(path => {
        if (!newExpandedNodes.has(path)) {
          newExpandedNodes.add(path)
        }
      })

      expandedNodes.value = newExpandedNodes
    }

    // Auto-expand on data change
    watch(() => props.data, (newData) => {
      if (newData && !isMetadataObject.value) {
        // Clear previous expansions and auto-expand new data
        expandedNodes.value.clear()
        autoExpandNodes(newData)

        // CRITICAL FIX: Auto-expand array containers after detecting arrays
        // Use nextTick to ensure arrayPaths is computed first
        setTimeout(() => {
          autoExpandArrayContainers()
        }, 100)
      }
    }, { immediate: true })

    return {
      expandedNodes,
      selectedPaths,
      arrayPaths,
      normalizedArrayPaths,
      potentialJsonPaths,
      processedData,
      parsedJsonFields,
      toggleNode,
      selectField,
      isMetadataObject
    }
  }
})
</script>

<style lang="scss" scoped>
.json-tree-viewer {
  max-height: 600px; /* Increased height for better visibility */
  overflow-y: auto; /* Enable vertical scrolling */
  overflow-x: hidden; /* Hide horizontal overflow */
  border: 1px solid rgba(0, 0, 0, 0.12);
  border-radius: 4px;
  background-color: #fff;
  padding: 0; /* Remove padding to maximize space */

  .body--dark & {
    background-color: var(--q-dark);
    border-color: var(--q-color-grey-8, #424242);
  }

  /* Make sure checkboxes are visible */
  .q-checkbox {
    opacity: 1;
    visibility: visible;
    pointer-events: auto;
  }

  /* Highlight array rows */
  .json-tree-node:has(.debug-indicator) {
    background-color: rgba(25, 118, 210, 0.05);
  }
}

.tree-container {
  font-family: monospace;
  font-size: 14px;
  line-height: 1.5;
  min-height: 200px; /* Minimum height for better UX */
  max-height: 600px; /* Match parent max-height */
  overflow-y: auto; /* Enable scrolling */
  overflow-x: hidden; /* Prevent horizontal scroll */
}

.json-tree {
  padding: 0.5rem;
  padding-right: 2rem; /* Extra right padding for checkboxes */
}
</style>
