<template>
  <div class="json-tree-viewer q-pa-sm">
    <div v-if="!data || Object.keys(data).length === 0" class="text-grey q-pa-md">
      No data to display
    </div>
    <div v-else-if="isMetadataObject" class="text-negative q-pa-md">
      <q-icon name="error" size="24px" class="q-mr-sm" />
      Error: Received metadata object instead of JSON data. Please check console for details.
    </div>
    <div v-else-if="selectionMode === 'array' && arrayPaths.length === 0" class="text-grey q-pa-md text-center">
      <q-icon name="info" size="48px" class="q-mb-md" />
      <p>No array fields detected in the data structure.</p>
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
          @toggle-node="toggleNode"
          @select-field="selectField"
        />
        <!-- No debug info needed here -->
      </div>
    </div>
  </div>
</template>

<script>
import { defineComponent, ref, computed, watch, provide } from 'vue'
import JsonTreeNode from './JsonTreeNode.vue'

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
    }
  },

  emits: ['update:selected', 'node-toggled', 'field-selected', 'select-field'],

  setup (props, { emit }) {
    // Track expanded nodes - initialize with root expanded
    const expandedNodes = ref(new Set(['root']))

    // Track selected field paths
    console.log('JsonTreeViewer initialSelectedPaths:', props.initialSelectedPaths)
    const selectedPaths = ref(Array.isArray(props.initialSelectedPaths) ? [...props.initialSelectedPaths] : [])

    // Log selected paths after initialization
    console.log('JsonTreeViewer selectedPaths after initialization:', selectedPaths.value)

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
        console.log(`[getFieldValueByPath] Getting value at path '${path}', parts:`, parts)
        let current = obj

        for (const part of parts) {
          if (current === undefined || current === null) {
            console.log(`[getFieldValueByPath] Current is null/undefined at part '${part}'`)
            return undefined
          }
          if (typeof current !== 'object') {
            console.log(`[getFieldValueByPath] Current is not an object at part '${part}', type:`, typeof current)
            return undefined
          }

          // Handle numeric indices properly
          const index = /^\d+$/.test(part) ? parseInt(part) : part
          console.log(`[getFieldValueByPath] Accessing part '${part}' (index: ${index})`)
          current = current[index]
          console.log('[getFieldValueByPath] Current value:', current)
        }

        console.log(`[getFieldValueByPath] Final value at '${path}':`, current)
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
      console.log(`[copyArrayPathsStructure] Called with targetPath: '${targetPath}'`)
      console.log('[copyArrayPathsStructure] allArrayPaths:', allArrayPaths)

      // Get the value at the target path
      const value = getFieldValueByPath(source, targetPath)

      console.log(`[copyArrayPathsStructure] value at '${targetPath}':`, value)

      if (!value) {
        console.log('[copyArrayPathsStructure] No value found, returning null')
        return null
      }

      // If this is an array, we need to copy it and check if its elements contain nested arrays
      if (Array.isArray(value)) {
        // Build the prefix to check for nested arrays
        // If targetPath is empty (root level), don't add a separator
        const pathPrefix = targetPath ? `${targetPath}[` : '['

        // Check if there are any nested arrays within this array's elements
        const hasNestedArrays = allArrayPaths.some(path => {
          // Check if path starts with targetPath[ (for nested arrays in this array)
          if (path.startsWith(pathPrefix)) return true

          // Also check for paths like targetPath. (for objects containing arrays)
          if (targetPath && path.startsWith(targetPath + '.')) return true

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

              console.log(`[copyArrayPathsStructure] Checking property '${key}' at childPath: ${childPath}`)
              console.log('[copyArrayPathsStructure] allArrayPaths:', allArrayPaths)

              // Check if this property or its descendants contain arrays
              // We need to check multiple patterns because the array path might not include [0]
              const leadsToArray = allArrayPaths.some(arrayPath => {
                // Direct match (e.g., 'projects[0].teams' === 'projects[0].teams')
                if (arrayPath === childPath) {
                  console.log(`[copyArrayPathsStructure]   ✓ Direct match: ${arrayPath} === ${childPath}`)
                  return true
                }

                // Check if array path starts with this child path followed by array index
                // (e.g., 'projects[0].teams[0].members' starts with 'projects[0].teams[')
                if (arrayPath.startsWith(childPath + '[')) {
                  console.log(`[copyArrayPathsStructure]   ✓ Array index match: ${arrayPath} starts with ${childPath}[`)
                  return true
                }

                // Check if array path starts with this child path followed by a dot
                // (e.g., 'projects[0].teams[0].members' starts with 'projects[0].teams.')
                if (arrayPath.startsWith(childPath + '.')) {
                  console.log(`[copyArrayPathsStructure]   ✓ Nested property match: ${arrayPath} starts with ${childPath}.`)
                  return true
                }

                return false
              })

              console.log(`[copyArrayPathsStructure] Property '${key}' leadsToArray: ${leadsToArray}`)

              if (leadsToArray) {
                // Recursively copy this branch
                console.log(`[copyArrayPathsStructure] Recursively processing: ${childPath}`)
                const childValue = copyArrayPathsStructure(source, childPath, allArrayPaths)
                console.log('[copyArrayPathsStructure] Recursive call returned:', childValue)
                if (childValue !== null && childValue !== undefined) {
                  processedElement[key] = childValue
                  console.log(`[copyArrayPathsStructure] Added '${key}' to processedElement, value:`, processedElement[key])
                } else {
                  console.log(`[copyArrayPathsStructure] ✗ childValue is null/undefined, not adding '${key}'`)
                }
              }
            }

            // Only add the processed element if it has properties
            if (Object.keys(processedElement).length > 0) {
              arrayCopy.push(processedElement)
              console.log('[copyArrayPathsStructure] Added processedElement to arrayCopy:', processedElement)
            } else {
              console.log('[copyArrayPathsStructure] ✗ processedElement is empty, not adding to arrayCopy')
            }
          }

          console.log(`[copyArrayPathsStructure] Returning arrayCopy (length: ${arrayCopy.length}):`, arrayCopy)
          const result = arrayCopy.length > 0 ? arrayCopy : value
          console.log('[copyArrayPathsStructure] Final array result:', result)
          return result
        }

        // Return the array as-is if it has no nested arrays
        console.log('[copyArrayPathsStructure] Array has no nested arrays, returning as-is:', value)
        return value
      } else if (typeof value === 'object' && value !== null) {
        // For objects, recursively process properties that lead to arrays
        console.log(`[copyArrayPathsStructure] Processing object at '${targetPath}'`)
        const result = {}

        for (const key in value) {
          const childPath = targetPath ? `${targetPath}.${key}` : key

          console.log(`[copyArrayPathsStructure] Checking object property '${key}' at childPath: ${childPath}`)

          // Check if this property or its descendants contain arrays
          const leadsToArray = allArrayPaths.some(arrayPath => {
            // Direct match
            if (arrayPath === childPath) {
              console.log(`[copyArrayPathsStructure]   ✓ Object property direct match: ${arrayPath} === ${childPath}`)
              return true
            }

            // Check if array path starts with this child path
            if (arrayPath.startsWith(childPath + '[')) {
              console.log(`[copyArrayPathsStructure]   ✓ Object property array match: ${arrayPath} starts with ${childPath}[`)
              return true
            }
            if (arrayPath.startsWith(childPath + '.')) {
              console.log(`[copyArrayPathsStructure]   ✓ Object property nested match: ${arrayPath} starts with ${childPath}.`)
              return true
            }

            return false
          })

          console.log(`[copyArrayPathsStructure] Object property '${key}' leadsToArray: ${leadsToArray}`)

          if (leadsToArray) {
            console.log(`[copyArrayPathsStructure] Recursively processing object property: ${childPath}`)
            const childValue = copyArrayPathsStructure(source, childPath, allArrayPaths)
            console.log('[copyArrayPathsStructure] Object property recursive call returned:', childValue)
            if (childValue !== null && childValue !== undefined) {
              result[key] = childValue
              console.log(`[copyArrayPathsStructure] Added object property '${key}' to result`)
            } else {
              console.log(`[copyArrayPathsStructure] ✗ Object property childValue is null/undefined, not adding '${key}'`)
            }
          }
        }

        console.log('[copyArrayPathsStructure] Object processing complete, result:', result)
        const finalResult = Object.keys(result).length > 0 ? result : null
        console.log('[copyArrayPathsStructure] Returning object result:', finalResult)
        return finalResult
      }

      console.log('[copyArrayPathsStructure] Value is not array or object, returning null')
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

      console.log('filterToArraysOnly - Input data:', data)
      console.log('filterToArraysOnly - Array paths:', arrayPaths)

      // Special handling: if root is an array, start from first item
      const isRootArray = Array.isArray(data)
      const sourceData = isRootArray && data.length > 0 ? data[0] : data

      console.log('filterToArraysOnly - Source data (from first item):', sourceData)

      // Normalize array paths - remove leading [0]. prefix for root arrays
      const normalizedPaths = arrayPaths.map(path => {
        if (path.startsWith('[')) {
          const normalized = path.replace(/^\[\d+\]\.?/, '')
          console.log(`  Normalized path: ${path} -> ${normalized}`)
          return normalized
        }
        return path
      }).filter(p => p && p.trim() !== '') // Remove empty paths

      console.log('filterToArraysOnly - Normalized paths:', normalizedPaths)

      // Use the new recursive approach to build the filtered structure
      // Start from the root and recursively copy only paths that lead to arrays
      const filtered = copyArrayPathsStructure(sourceData, '', normalizedPaths)

      console.log('filterToArraysOnly - Output:', filtered)
      const result = filtered || sourceData
      console.log('filterToArraysOnly - Final result:', result)
      return result
    }

    // Helper used when arrayOnlyMode === true. This was previously missing, causing a no-undef lint error.
    // It prunes the data to only show array paths and their ancestor scaffolding.
    const pruneToArraysOnly = (data) => {
      try {
        return filterToArraysOnly(data, arrayPaths.value)
      } catch (e) {
        console.error('pruneToArraysOnly error:', e)
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

      if (hasMetadataStructure) {
        console.error('JsonTreeViewer received metadata object instead of raw JSON', data)
      }

      return hasMetadataStructure
    })

    // Processed data with parsed JSON
    const processedData = computed(() => {
      // Check if the input data is valid
      if (!props.data) {
        console.warn('Empty data provided to JsonTreeViewer')
        return {}
      }

      // Handle different types of data
      const dataToProcess = props.data

      // Check if we got a metadata object instead of raw JSON
      if (isMetadataObject.value) {
        console.warn('Received metadata object instead of raw JSON in JsonTreeViewer', props.data)

        // Return a simple structure rather than trying to process the metadata
        return { error: 'Invalid data format. Please check the console for details.' }
      }

      // Handle primitive types (convert to object representation)
      if (typeof dataToProcess !== 'object' || dataToProcess === null) {
        console.warn('Non-object data provided to JsonTreeViewer:', dataToProcess)
        return { value: dataToProcess }
      }

      // Start with a deep copy of the original data
      let processed
      try {
        processed = JSON.parse(JSON.stringify(props.data))
      } catch (e) {
        return { error: 'Could not process data structure' }
      }

      console.log('JsonTreeViewer processedData input:', dataToProcess)

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
              console.error(`Error parsing JSON at ${path}:`, error)
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

      console.log('JsonTreeViewer processedData output:', processed)
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
          console.warn('Skipping metadata object in arrayPaths:', obj)
          return
        }

        // Use normalized path for uniqueness checks
        const pathForCheck = normalizedPath || path

        if (Array.isArray(obj)) {
          // Only add the path if we haven't processed this structure yet
          // Make sure the path exists and isn't empty before adding it
          if (path && path.trim() !== '' && !processedPaths.has(pathForCheck)) {
            // Add to paths array and mark as processed
            console.log('Adding array path:', path)
            paths.push(path)
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
      console.log('Detected array paths:', paths)
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

      console.log('Normalized array paths:', normalized)
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
          console.warn('Skipping metadata object in potentialJsonPaths:', obj)
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

    // Select/deselect a field
    const selectField = (path, type) => {
      // Handle both formats - object with type property and direct type string
      const typeValue = typeof type === 'object' ? type.type : type
      const nodePath = typeof type === 'object' ? path : path
      const nodeInfo = typeof type === 'object' ? type : { type: type }

      console.log('JsonTreeViewer.selectField called - Path:', nodePath, 'Type:', typeValue, 'NodeInfo:', nodeInfo)
      console.log('Current selectedPaths:', selectedPaths.value)

      const index = selectedPaths.value.findIndex(p => p === nodePath)
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
        console.log(`Selected array item field: ${nodePath}, field name: ${fieldName}`)

        // Check if another array item with the same field is already selected
        // and use that existing selection rather than adding a duplicate
        existingPathIndex = selectedPaths.value.findIndex(p => {
          // Match other array indices for the same field name
          return p.match(/^\[\d+\]\.\w+/) && p.split('.')[1] === fieldName
        })

        if (existingPathIndex >= 0 && index < 0) {
          // If another instance is selected, use that one's path instead
          // This ensures we don't add duplicates but still track the selection
          console.log(`Using existing selection: ${selectedPaths.value[existingPathIndex]}`)
          path = selectedPaths.value[existingPathIndex]
        }
      }

      // Check which index to use - either the original one or existingPathIndex if applicable
      const effectiveIndex = (nodePath.match(/^\[\d+\]\.\w+/) && existingPathIndex >= 0 && index < 0) ? existingPathIndex : index

      if (effectiveIndex >= 0) {
        // Deselect
        console.log(`Deselecting path: ${nodePath}`)
        selectedPaths.value.splice(effectiveIndex, 1)
      } else {
        // Select
        console.log(`Selecting path: ${nodePath}`)
        selectedPaths.value.push(nodePath)
      }

      console.log('Updated selectedPaths:', selectedPaths.value)

      // Emit events for different handlers
      console.log('Emitting events - update:selected, field-selected, select-field')
      emit('update:selected', [...selectedPaths.value])
      emit('field-selected', {
        path: nodePath,
        selected: index < 0,
        type: typeValue
      })
      emit('select-field', nodePath, nodeInfo)
    }

    // Watch for changes in initial selected paths
    watch(() => props.initialSelectedPaths, (newPaths) => {
      console.log('JsonTreeViewer: initialSelectedPaths changed:', newPaths)

      // Ensure we have valid array to spread
      if (Array.isArray(newPaths)) {
        console.log('JsonTreeViewer: Updating selectedPaths with new values:', newPaths)
        // Always set selectedPaths to a fresh copy of newPaths, even if empty
        selectedPaths.value = [...newPaths]
      } else {
        console.log('JsonTreeViewer: initialSelectedPaths is invalid (not an array):', newPaths)
        // Initialize as empty array if not an array
        selectedPaths.value = []
      }

      console.log('JsonTreeViewer: selectedPaths after update:', selectedPaths.value)
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
     */
    const autoExpandArrayContainers = () => {
      if (props.selectionMode !== 'array') return

      console.log('[autoExpandArrayContainers] Starting auto-expansion for array mode...')
      console.log('[autoExpandArrayContainers] arrayPaths:', arrayPaths.value)

      // Find all paths that need to be expanded to show arrays
      const pathsToExpand = new Set()

      arrayPaths.value.forEach(arrayPath => {
        console.log(`[autoExpandArrayContainers] Processing arrayPath: ${arrayPath}`)

        // Build all parent paths that need to be expanded
        // e.g., "projects[0].teams[0].members" -> ["projects", "projects[0]", "projects[0].teams", "projects[0].teams[0]"]
        let currentPath = ''
        const parts = []

        // Split by dots and brackets, keeping all tokens including dots
        const tokens = arrayPath.split(/(\[\d+\]|\.)/g).filter(t => t && t.trim())

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

        // Add all parent paths (but not the array itself)
        console.log(`  → Parts for ${arrayPath}:`, parts)
        parts.forEach((part, idx) => {
          const isLastPart = idx === parts.length - 1
          const isArrayPath = part === arrayPath
          console.log(`    Part[${idx}]: "${part}", isLastPart: ${isLastPart}, isArrayPath: ${isArrayPath}`)

          // Don't expand the final array path itself, only its containers
          if (idx < parts.length - 1 || part !== arrayPath) {
            pathsToExpand.add(part)
            console.log(`      ✓ Will expand: ${part}`)
          } else {
            console.log(`      ✗ Skip (is the array itself): ${part}`)
          }
        })
      })

      console.log(`[autoExpandArrayContainers] Expanding ${pathsToExpand.size} paths:`, Array.from(pathsToExpand))

      // Expand all the container paths
      // Create a new Set to trigger reactivity
      const newExpandedNodes = new Set(expandedNodes.value)
      pathsToExpand.forEach(path => {
        if (!newExpandedNodes.has(path)) {
          newExpandedNodes.add(path)
          console.log(`  [autoExpandArrayContainers] Adding to expanded nodes: ${path}`)
        }
      })

      // Replace the ref to trigger reactivity
      expandedNodes.value = newExpandedNodes

      console.log('[autoExpandArrayContainers] Auto-expansion complete')
      console.log('[autoExpandArrayContainers] Total expanded nodes:', expandedNodes.value.size)
      console.log('[autoExpandArrayContainers] Final expanded nodes:', Array.from(expandedNodes.value))
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
  max-height: none;
  overflow: visible;
  border: 1px solid rgba(0, 0, 0, 0.12);
  border-radius: 4px;
  background-color: #fff;

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
}

.json-tree {
  padding: 0.5rem;
  overflow-x: auto; /* Add horizontal scrolling for wide structures */
}
</style>
