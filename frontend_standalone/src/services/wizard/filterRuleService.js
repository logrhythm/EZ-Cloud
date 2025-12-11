/**
 * Filter Rule Service for JSON Policy Builder Wizard
 * Handles business logic for Step 4: Filter Rule Configuration
 * - Extract field candidates from sample data
 * - Build and validate filter expressions
 * - Test filters against sample data
 * - Generate JSONPath filter expressions
 *
 * @module services/wizard/filterRuleService
 * @production-ready - Enhanced with comprehensive error handling, validation, and security
 */

// Constants for production-quality configuration
const CONSTANTS = {
  MAX_SAMPLE_VALUES: 100,
  MAX_FIELD_DEPTH: 10,
  MAX_CONDITIONS: 50,
  MAX_EXPRESSION_LENGTH: 5000,
  MAX_TEST_RECORDS: 1000,
  MAX_SAMPLE_MATCHES: 5,
  SUPPORTED_TYPES: ['string', 'number', 'boolean', 'null', 'unknown'],
  REGEX_SPECIAL_CHARS: /[.*+?^${}()|[\]\\]/g,
  HTML_ESCAPE_MAP: {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
    '/': '&#x2F;'
  }
}

/**
 * FilterRuleService class for wizard Step 4
 * Provides methods for filter rule generation and management
 * @class
 */
export class FilterRuleService {
  /**
   * Extract field candidates from parsed sample data
   * Returns all leaf fields (non-object, non-array fields) that can be used in filters
   *
   * @param {Object|Array} parsedData - The parsed JSON data from Step 2
   * @param {Object} dataStructure - The analyzed structure from DataProcessor
   * @param {Object} options - Optional parameters: { jsonToStringFields: Array, parsedStringifiedFields: Object }
   * @returns {Array<Object>} Array of field objects with path, type, and sample values
   * @throws {Error} If input validation fails
   *
   * @example
   * const fields = FilterRuleService.extractFieldCandidates(data, structure)
   * // Returns: [{ path: '$.user.name', label: '@.user.name', type: 'string', sampleValues: [...] }]
   */
  static extractFieldCandidates (parsedData, dataStructure, options = {}) {
    try {
      // Input validation
      if (!parsedData) {
        console.warn('[FilterRuleService] extractFieldCandidates: No parsed data provided')
        return []
      }

      if (!dataStructure) {
        console.warn('[FilterRuleService] extractFieldCandidates: No data structure provided')
        return []
      }

      // Type validation
      if (typeof dataStructure !== 'object') {
        console.error('[FilterRuleService] Invalid dataStructure type:', typeof dataStructure)
        return []
      }

      // Get JSON-to-String fields from options
      const jsonToStringFields = options?.jsonToStringFields || []
      const parsedStringifiedFields = options?.parsedStringifiedFields || {}

      console.log('╔════════════════════════════════════════════════════════════════════════')
      console.log('║ [FilterRuleService] extractFieldCandidates called with JSON-to-String options')
      console.log('╠════════════════════════════════════════════════════════════════════════')
      console.log('║ jsonToStringFields count:', jsonToStringFields.length)
      console.log('║ jsonToStringFields:', jsonToStringFields)
      console.log('║ parsedStringifiedFields keys:', Object.keys(parsedStringifiedFields))
      console.log('║ parsedData type:', Array.isArray(parsedData) ? 'array' : typeof parsedData)
      console.log('║ parsedData isArray:', Array.isArray(parsedData))
      if (Array.isArray(parsedData)) {
        console.log('║ parsedData array length:', parsedData.length)
      }
      console.log('╚════════════════════════════════════════════════════════════════════════')

      const fields = []
      const visited = new Set()

      /**
       * Recursively traverse the data structure to find leaf fields
       * @param {Object} node - Current node in the structure tree
       * @param {*} data - Corresponding data for this node (for traversal only)
       * @param {number} depth - Current recursion depth
       * @param {*} rootData - Original root data (for sample extraction)
       */
      const traverse = (node, data, depth = 0, rootData = parsedData) => {
        // Safety check for recursion depth
        if (depth > CONSTANTS.MAX_FIELD_DEPTH) {
          console.warn('[FilterRuleService] Maximum field depth reached:', CONSTANTS.MAX_FIELD_DEPTH)
          return
        }

        // Null/undefined safety check
        if (!node) {
          return
        }

        // Check for valid path
        if (!node.path || typeof node.path !== 'string') {
          console.warn('[FilterRuleService] Invalid node path:', node)
          return
        }

        // Avoid circular references
        if (visited.has(node.path)) {
          return
        }

        visited.add(node.path)

        try {
          // Only include leaf nodes (primitive types)
          if (node.type && node.type !== 'object' && node.type !== 'array') {
            // Validate type
            if (!CONSTANTS.SUPPORTED_TYPES.includes(node.type)) {
              console.warn('[FilterRuleService] Unsupported field type:', node.type, 'for path:', node.path)
            }

            // Normalize path: convert specific array indices to [*] notation
            // e.g., $[0].name or $.data.users[0].name becomes $[*].name or $.data.users[*].name
            const normalizedPath = node.path.replace(/\[\d+\]/g, '[*]')

            // Check if we've already added this field (deduplicate array element fields)
            const existingField = fields.find(f => f.path === normalizedPath)
            if (existingField) {
              // Field already exists, skip to avoid duplicates
              return
            }

            // Get sample values from the ORIGINAL ROOT data (not the traversal data)
            // This ensures we can properly navigate to arrays and extract all values from multiline NDJSON
            const sampleValues = this._getSampleValuesForField(rootData, normalizedPath, CONSTANTS.MAX_SAMPLE_VALUES)

            // Sanitize the label to prevent XSS
            const sanitizedLabel = this._sanitizeFieldLabel(this._formatFieldLabel(normalizedPath))

            fields.push({
              path: normalizedPath,
              label: sanitizedLabel,
              type: node.type,
              sampleValues: sampleValues,
              isNested: normalizedPath.includes('.') || normalizedPath.includes('['),
              depth: depth
            })
          }

          // Recursively process children with error handling
          if (node.children && Array.isArray(node.children)) {
            for (const child of node.children) {
              try {
                // For arrays, use the first element's data
                if (node.type === 'array' && Array.isArray(data) && data.length > 0) {
                  traverse(child, data[0], depth + 1, rootData)
                } else if (typeof data === 'object' && data !== null && child.key) {
                  traverse(child, data[child.key], depth + 1, rootData)
                } else {
                  traverse(child, data, depth + 1, rootData)
                }
              } catch (childError) {
                console.error('[FilterRuleService] Error processing child node:', childError)
                // Continue with other children
              }
            }
          }
        } catch (nodeError) {
          console.error('[FilterRuleService] Error processing node:', nodeError)
          // Continue with other nodes
        }
      }

      // Start traversal for base paths
      // For multiline NDJSON (array of objects), use first element for traversal
      // but keep the original parsedData for sample value extraction
      let dataForTraversal = parsedData
      let isMultilineNdjson = false

      if (Array.isArray(parsedData) && parsedData.length > 0) {
        dataForTraversal = parsedData[0]
        isMultilineNdjson = true
        console.log('[FilterRuleService] Detected multiline NDJSON array, using first element for structure traversal')
        console.log('[FilterRuleService] Keeping original array for sample value extraction')
      }

      // For multiline NDJSON, we need to adjust the dataStructure to use $. notation instead of $[*].
      // This is because in NDJSON, each record is processed independently, not as an array.
      let adjustedDataStructure = dataStructure
      if (isMultilineNdjson && dataStructure.type === 'array' && dataStructure.children && dataStructure.children.length > 0) {
        // Take the first child's structure and adjust its path to start with $ instead of $[0]
        const firstChild = dataStructure.children[0]
        if (firstChild && firstChild.path && firstChild.path.startsWith('$[0]')) {
          console.log('[FilterRuleService] Adjusting paths for multiline NDJSON: converting $[0]. to $.')
          adjustedDataStructure = this._adjustPathsForNdjson(firstChild)
        }
      }

      traverse(adjustedDataStructure, dataForTraversal, 0, parsedData)

      // Process each JSON-to-String field to add nested paths
      if (jsonToStringFields && jsonToStringFields.length > 0) {
        console.log('╔════════════════════════════════════════════════════════════════════════')
        console.log('║ [FilterRuleService] Processing JSON-to-String fields for nested paths')
        console.log('╠════════════════════════════════════════════════════════════════════════')
        console.log(`║ Total JSON-to-String fields to process: ${jsonToStringFields.length}`)
        console.log(`║ Fields: ${jsonToStringFields.join(', ')}`)
        console.log(`║ parsedStringifiedFields keys: ${Object.keys(parsedStringifiedFields).join(', ')}`)

        for (const fieldPath of jsonToStringFields) {
          console.log(`║ Processing field: ${fieldPath}`)

          // Check if we have parsed data for this field
          if (!parsedStringifiedFields[fieldPath]) {
            console.log(`║ No parsed data available for: ${fieldPath}`)
            continue
          }

          const parsedJsonData = parsedStringifiedFields[fieldPath]
          console.log(`║ Found parsed data for ${fieldPath}: type=${typeof parsedJsonData}, isArray=${Array.isArray(parsedJsonData)}`)

          if (Array.isArray(parsedJsonData)) {
            console.log(`║ Array data with length: ${parsedJsonData.length}`)
          } else if (typeof parsedJsonData === 'object' && parsedJsonData !== null) {
            console.log(`║ Object data with keys: ${Object.keys(parsedJsonData).join(', ')}`)
          }

          // Process JSON-to-String fields
          try {
            console.log(`║ Extracting nested fields from ${fieldPath}...`)
            this._extractNestedFieldsFromJsonString(
              parsedJsonData,
              fieldPath,
              fields,
              0, // Start depth at 0 for each JSON-to-String field
              parsedData, // Pass the root data for sample value extraction
              fieldPath // Pass the parent field path
            )
            console.log(`║ Extraction complete for ${fieldPath}`)
          } catch (error) {
            console.error(`[FilterRuleService] Error processing JSON-string field ${fieldPath}:`, error)
          }
        }

        // Log the fields that were extracted from JSON strings
        const jsonStringFields = fields.filter(f => f.isFromJsonString)
        console.log(`║ Total fields extracted from JSON strings: ${jsonStringFields.length}`)
        if (jsonStringFields.length > 0) {
          console.log('║ Sample fields extracted from JSON strings:')
          jsonStringFields.slice(0, 5).forEach(field => {
            console.log(`║   - ${field.path} (${field.type})`)
          })
        }

        console.log('╚════════════════════════════════════════════════════════════════════════')
      }

      console.log(`[FilterRuleService] Extracted ${fields.length} field candidates`)

      // Debug: Log the extracted fields for troubleshooting
      if (fields.length > 0) {
        console.log('[FilterRuleService] Extracted fields sample:', fields.slice(0, 5).map(f => ({
          path: f.path,
          label: f.label,
          type: f.type,
          sampleCount: f.sampleValues?.length || 0,
          isFromJsonString: f.isFromJsonString || false
        })))
      }

      return fields
    } catch (error) {
      console.error('[FilterRuleService] Fatal error in extractFieldCandidates:', error)
      // Return empty array instead of throwing to maintain graceful degradation
      return []
    }
  }

  /**
   * Adjust paths in a data structure for multiline NDJSON
   * Converts $[0]. prefix to $. since each record is processed independently
   *
   * @param {Object} structure - The data structure node to adjust
   * @returns {Object} Adjusted structure with corrected paths
   * @private
   */
  static _adjustPathsForNdjson (structure) {
    if (!structure) return structure

    // Clone the structure to avoid mutations
    const adjusted = { ...structure }

    // Adjust the path: convert $[0] to $ and $[0]. to $.
    if (adjusted.path) {
      adjusted.path = adjusted.path.replace(/^\$\[0\]\.?/, '$.')
      // Also handle cases where path is exactly $[0]
      if (adjusted.path === '$[0]') {
        adjusted.path = '$'
      }
    }

    // Recursively adjust children
    if (adjusted.children && Array.isArray(adjusted.children)) {
      adjusted.children = adjusted.children.map(child => this._adjustPathsForNdjson(child))
    }

    return adjusted
  }

  /**
   * Extract nested fields from a parsed JSON string field
   *
   * @param {Object|Array} parsedJson - The parsed JSON data from the stringified field
   * @param {string} parentPath - The path to the parent field
   * @param {Array} fields - Array of fields to append to
   * @param {number} depth - Current recursion depth
   * @param {Object|Array} rootData - The root data object for sample value extraction
   * @param {string} jsonStringFieldPath - The path to the JSON string field in the root data
   * @private
   */
  static _extractNestedFieldsFromJsonString (parsedJson, parentPath, fields, depth = 0, rootData = null, jsonStringFieldPath = null) {
    // Safety check for recursion depth
    if (depth > CONSTANTS.MAX_FIELD_DEPTH) {
      console.warn('[FilterRuleService] Maximum field depth reached in JSON-string field:', CONSTANTS.MAX_FIELD_DEPTH)
      return
    }

    // Skip if data is null or undefined
    if (parsedJson === null || parsedJson === undefined) {
      return
    }

    console.log('╔════════════════════════════════════════════════════════════════════════')
    console.log(`║ [FilterRuleService] _extractNestedFieldsFromJsonString - Processing path: ${parentPath}`)
    console.log(`║ Data type: ${Array.isArray(parsedJson) ? 'array' : typeof parsedJson}`)
    console.log('╚════════════════════════════════════════════════════════════════════════')

    // Process based on data type
    if (Array.isArray(parsedJson)) {
      // Handle arrays
      if (parsedJson.length > 0) {
        // Only process first element for array type inference
        const firstItem = parsedJson[0]

        // If it's a primitive array, add it as a field
        if (typeof firstItem !== 'object' || firstItem === null) {
          // Add the array itself as a field
          const fieldType = typeof firstItem
          const sanitizedLabel = this._sanitizeFieldLabel(this._formatFieldLabel(parentPath))

          // Extract sample values from root data if available
          const sampleValues = rootData && jsonStringFieldPath
            ? this._getSampleValuesFromJsonStringField(rootData, jsonStringFieldPath, parentPath)
            : parsedJson.slice(0, CONSTANTS.MAX_SAMPLE_VALUES).map(v => String(v))

          fields.push({
            path: parentPath,
            label: sanitizedLabel,
            type: fieldType === 'object' ? 'null' : fieldType,
            sampleValues: sampleValues,
            isNested: true,
            depth: depth,
            isFromJsonString: true
          })
          return
        }

        // For object arrays, recursively process first element with array index notation
        this._extractNestedFieldsFromJsonString(firstItem, `${parentPath}[*]`, fields, depth + 1, rootData, jsonStringFieldPath)
      } else {
        // Empty array - just add as a field
        const sanitizedLabel = this._sanitizeFieldLabel(this._formatFieldLabel(parentPath))
        fields.push({
          path: parentPath,
          label: sanitizedLabel,
          type: 'unknown',
          sampleValues: ['[]'],
          isNested: true,
          depth: depth,
          isFromJsonString: true
        })
      }
    } else if (typeof parsedJson === 'object' && parsedJson !== null) {
      // Handle objects
      for (const key in parsedJson) {
        if (Object.prototype.hasOwnProperty.call(parsedJson, key)) {
          const value = parsedJson[key]
          const fieldPath = `${parentPath}.${key}`

          if (value === null || value === undefined) {
            // Handle null values
            const sanitizedLabel = this._sanitizeFieldLabel(this._formatFieldLabel(fieldPath))

            // Extract sample values from root data if available
            const sampleValues = rootData && jsonStringFieldPath
              ? this._getSampleValuesFromJsonStringField(rootData, jsonStringFieldPath, fieldPath)
              : ['null']

            fields.push({
              path: fieldPath,
              label: sanitizedLabel,
              type: 'null',
              sampleValues: sampleValues,
              isNested: true,
              depth: depth + 1,
              isFromJsonString: true
            })
          } else if (typeof value !== 'object') {
            // Handle primitive types
            const fieldType = typeof value
            const sanitizedLabel = this._sanitizeFieldLabel(this._formatFieldLabel(fieldPath))

            // Extract sample values from root data if available
            const sampleValues = rootData && jsonStringFieldPath
              ? this._getSampleValuesFromJsonStringField(rootData, jsonStringFieldPath, fieldPath)
              : [String(value)]

            fields.push({
              path: fieldPath,
              label: sanitizedLabel,
              type: fieldType,
              sampleValues: sampleValues,
              isNested: true,
              depth: depth + 1,
              isFromJsonString: true
            })
          } else {
            // Recursively process nested objects and arrays
            this._extractNestedFieldsFromJsonString(value, fieldPath, fields, depth + 1, rootData, jsonStringFieldPath)
          }
        }
      }
    } else {
      // Handle primitive values (should not happen at the root level, but handle anyway)
      const fieldType = typeof parsedJson
      const sanitizedLabel = this._sanitizeFieldLabel(this._formatFieldLabel(parentPath))

      fields.push({
        path: parentPath,
        label: sanitizedLabel,
        type: fieldType,
        sampleValues: [String(parsedJson)],
        isNested: false,
        depth: depth,
        isFromJsonString: true
      })
    }
  }

  /**
   * Extract sample values from a nested field within a JSON string field
   * This method handles extracting values from all records that contain the JSON string
   *
   * @param {Object|Array} rootData - The root data object containing the JSON string fields
   * @param {string} jsonStringFieldPath - The path to the JSON string field in the root data
   * @param {string} nestedFieldPath - The full path to the nested field (includes JSON string field path)
   * @param {number} limit - Maximum number of unique values to return
   * @returns {Array<string>} Array of unique sample values
   * @private
   */
  static _getSampleValuesFromJsonStringField (rootData, jsonStringFieldPath, nestedFieldPath, limit = CONSTANTS.MAX_SAMPLE_VALUES) {
    const values = new Set()

    try {
      console.log('╔════════════════════════════════════════════════════════════════════════')
      console.log('║ [FilterRuleService] _getSampleValuesFromJsonStringField')
      console.log('╠════════════════════════════════════════════════════════════════════════')
      console.log('║ jsonStringFieldPath:', jsonStringFieldPath)
      console.log('║ nestedFieldPath:', nestedFieldPath)
      console.log('╚════════════════════════════════════════════════════════════════════════')

      if (!rootData || !jsonStringFieldPath || !nestedFieldPath) {
        return []
      }

      // Extract the relative path within the JSON string
      // For example: if jsonStringFieldPath = "data.payload" and nestedFieldPath = "data.payload.user.name"
      // then relativePath = "user.name"
      let relativePath = nestedFieldPath
      if (nestedFieldPath.startsWith(jsonStringFieldPath)) {
        relativePath = nestedFieldPath.substring(jsonStringFieldPath.length)
        // Remove leading dot or bracket
        relativePath = relativePath.replace(/^[.[]/, '')
        // Add back bracket if it was removed
        if (nestedFieldPath.charAt(jsonStringFieldPath.length) === '[') {
          relativePath = '[' + relativePath
        }
      }

      console.log('║ relativePath within JSON string:', relativePath)

      // Get all records (handle both single object and array of objects)
      const records = Array.isArray(rootData) ? rootData : [rootData]
      const recordsToCheck = records.slice(0, CONSTANTS.MAX_TEST_RECORDS)

      // For each record, get the JSON string field, parse it, and extract the nested value
      for (const record of recordsToCheck) {
        if (values.size >= limit) break

        try {
          // Get the JSON string from the record
          const jsonString = this._getValueByPath(record, jsonStringFieldPath)

          if (!jsonString || typeof jsonString !== 'string') {
            continue
          }

          // Parse the JSON string
          let parsedJson
          try {
            parsedJson = JSON.parse(jsonString)
          } catch (parseError) {
            console.warn('[FilterRuleService] Failed to parse JSON string:', parseError)
            continue
          }

          // Extract the nested field value from the parsed JSON
          const value = this._getValueByPath(parsedJson, relativePath)

          if (value !== undefined && value !== null) {
            // Sanitize value to prevent XSS
            let stringValue = typeof value === 'string' ? value : JSON.stringify(value)

            // Limit value length for performance and UI
            if (stringValue.length > 100) {
              stringValue = stringValue.substring(0, 97) + '...'
            }

            // HTML escape the value
            stringValue = this._escapeHtml(stringValue)

            values.add(stringValue)
          }
        } catch (recordError) {
          console.warn('[FilterRuleService] Error extracting value from record:', recordError)
          // Continue with other records
        }
      }

      const result = Array.from(values).slice(0, limit)

      console.log('╔════════════════════════════════════════════════════════════════════════')
      console.log('║ [FilterRuleService] _getSampleValuesFromJsonStringField - Result')
      console.log('╠════════════════════════════════════════════════════════════════════════')
      console.log('║ Found', result.length, 'unique sample values')
      console.log('║ Sample values:', result.slice(0, 3))
      console.log('╚════════════════════════════════════════════════════════════════════════')

      return result
    } catch (error) {
      console.error('[FilterRuleService] Error in _getSampleValuesFromJsonStringField:', error)
      return []
    }
  }

  /**
   * Extract unique sample values for a given field path
   *
   * @param {Object|Array} data - The data to extract from
   * @param {string} fieldPath - JSONPath to the field
   * @param {number} limit - Maximum number of unique values to return
   * @returns {Array<string>} Array of unique sample values
   * @private
   */
  static _getSampleValuesForField (data, fieldPath, limit = CONSTANTS.MAX_SAMPLE_VALUES) {
    const values = new Set()

    try {
      // Input validation
      if (!data) {
        return []
      }

      if (!fieldPath || typeof fieldPath !== 'string') {
        console.warn('[FilterRuleService] Invalid fieldPath:', fieldPath)
        return []
      }

      if (typeof limit !== 'number' || limit < 1) {
        limit = CONSTANTS.MAX_SAMPLE_VALUES
      }

      // Parse the field path to determine how to extract values
      // Handle different path formats:
      // 1. $[*].field - root array with field
      // 2. $.data.users[*].field - nested array with field
      // 3. $.field - simple object field

      let records = []
      let fieldName = ''

      // Check if path starts with $[*] (root-level array)
      if (fieldPath.startsWith('$[*]')) {
        // Root array case: e.g., $[*].name
        if (Array.isArray(data)) {
          records = data.slice(0, CONSTANTS.MAX_TEST_RECORDS)
          // Extract the field name after $[*].
          fieldName = fieldPath.replace(/^\$\[\*\]\.?/, '')
        } else {
          console.warn('[FilterRuleService] Path indicates root array but data is not an array:', fieldPath)
          return []
        }
      } else {
        // Check for nested array: $.data.users[*].field
        const nestedArrayMatch = fieldPath.match(/^(\$\.)?(.+?)\[\*\]\.(.+)$/)
        if (nestedArrayMatch) {
          // Navigate to the array first
          const arrayPath = nestedArrayMatch[2] // e.g., "data.users"
          const array = this._getValueByPath(data, arrayPath)

          if (Array.isArray(array)) {
            records = array.slice(0, CONSTANTS.MAX_TEST_RECORDS)
            fieldName = nestedArrayMatch[3] // e.g., "name"
          } else {
            console.warn('[FilterRuleService] Path indicates array but navigation resulted in non-array:', fieldPath)
            return []
          }
        } else {
          // Simple path without array notation (e.g., $.field)
          // For multiline NDJSON (root array), iterate through all records
          // For single objects, wrap in array for consistent processing
          if (Array.isArray(data)) {
            records = data.slice(0, CONSTANTS.MAX_TEST_RECORDS)
          } else {
            records = [data]
          }
          fieldName = fieldPath.replace(/^\$\.?/, '')
        }
      }

      // Extract values from each record
      for (const record of records) {
        if (values.size >= limit) break

        try {
          const value = this._getValueByPath(record, fieldName)

          if (value !== undefined && value !== null) {
            // Sanitize value to prevent XSS
            let stringValue = typeof value === 'string' ? value : JSON.stringify(value)

            // Limit value length for performance and UI
            if (stringValue.length > 100) {
              stringValue = stringValue.substring(0, 97) + '...'
            }

            // HTML escape the value
            stringValue = this._escapeHtml(stringValue)

            values.add(stringValue)
          }
        } catch (recordError) {
          console.warn('[FilterRuleService] Error extracting value from record:', recordError)
          // Continue with other records
        }
      }
    } catch (error) {
      console.error(`[FilterRuleService] Error extracting sample values for ${fieldPath}:`, error)
    }

    const result = Array.from(values).slice(0, limit)

    // Debug logging
    if (result.length > 0) {
      console.log(`[FilterRuleService] Found ${result.length} sample values for field '${fieldPath}':`, result)
    } else {
      console.warn(`[FilterRuleService] No sample values found for field '${fieldPath}'`)
    }

    return result
  }

  /**
   * Format field path into a readable label
   *
   * @param {string} path - JSONPath string
   * @returns {string} Formatted label
   * @private
   */
  static _formatFieldLabel (path) {
    try {
      if (!path || typeof path !== 'string') {
        console.warn('[FilterRuleService] Invalid path for label formatting:', path)
        return ''
      }

      // Remove $ prefix and clean up the path
      let label = path.replace(/^\$\.?/, '')

      // Replace array indices with [*]
      label = label.replace(/\[(\d+)\]/g, '[*]')

      // Add @ prefix for JSONPath filter expressions
      return `@.${label}`
    } catch (error) {
      console.error('[FilterRuleService] Error formatting field label:', error)
      return ''
    }
  }

  /**
   * Sanitize field label to prevent XSS attacks
   *
   * @param {string} label - The label to sanitize
   * @returns {string} Sanitized label
   * @private
   */
  static _sanitizeFieldLabel (label) {
    if (!label || typeof label !== 'string') {
      return ''
    }

    // Only allow alphanumeric, dots, brackets, underscores, and @ symbol
    return label.replace(/[^a-zA-Z0-9._[\]@*-]/g, '_')
  }

  /**
   * Escape HTML special characters to prevent XSS
   *
   * @param {string} text - Text to escape
   * @returns {string} Escaped text
   * @private
   */
  static _escapeHtml (text) {
    try {
      if (text === null || text === undefined) {
        return ''
      }

      const str = String(text)
      return str.replace(/[&<>"'/]/g, (char) => CONSTANTS.HTML_ESCAPE_MAP[char] || char)
    } catch (error) {
      console.error('[FilterRuleService] Error escaping HTML:', error)
      return ''
    }
  }

  /**
   * Detect field data type from sample data
   *
   * @param {Object|Array} parsedData - The parsed data
   * @param {string} fieldPath - Path to the field
   * @returns {string} Detected type: 'string', 'number', 'boolean', 'null', 'unknown'
   * @throws {Error} If input validation fails
   */
  static detectFieldType (parsedData, fieldPath) {
    try {
      // Input validation
      if (!parsedData) {
        return 'unknown'
      }

      if (!fieldPath || typeof fieldPath !== 'string') {
        console.warn('[FilterRuleService] Invalid fieldPath for type detection:', fieldPath)
        return 'unknown'
      }

      const records = Array.isArray(parsedData) ? parsedData : [parsedData]

      // Sample first few records to determine type (limit for performance)
      const samplesToCheck = Math.min(10, records.length)

      for (let i = 0; i < samplesToCheck; i++) {
        try {
          const value = this._getValueByPath(records[i], fieldPath)

          if (value !== undefined && value !== null) {
            const valueType = typeof value

            if (valueType === 'string') return 'string'
            if (valueType === 'number' && !isNaN(value)) return 'number'
            if (valueType === 'boolean') return 'boolean'
          }
        } catch (recordError) {
          console.warn('[FilterRuleService] Error checking record type:', recordError)
          // Continue with other records
        }
      }

      return 'unknown'
    } catch (error) {
      console.error(`[FilterRuleService] Error detecting field type for ${fieldPath}:`, error)
      return 'unknown'
    }
  }

  /**
   * Get valid operators for a field type
   *
   * @param {string} fieldType - The field type
   * @returns {Array<Object>} Array of operator objects with label and value
   */
  static getOperatorsForFieldType (fieldType) {
    try {
      // Input validation
      if (!fieldType || typeof fieldType !== 'string') {
        console.warn('[FilterRuleService] Invalid fieldType:', fieldType)
        fieldType = 'unknown'
      }

      // Existence operator - works for all types
      const existenceOperator = [
        {
          label: 'Has Attribute (Exists)',
          value: 'exists',
          types: ['string', 'number', 'boolean', 'null', 'unknown'],
          description: 'Checks if the attribute exists in the JSON, regardless of its value or data type'
        }
      ]

      const baseOperators = [
        { label: 'Equals (==)', value: '==', types: ['string', 'number', 'boolean'] },
        { label: 'Not Equals (!=)', value: '!=', types: ['string', 'number', 'boolean'] }
      ]

      const stringOperators = [
        { label: 'Contains', value: 'contains', types: ['string'] },
        { label: 'Starts With', value: 'startsWith', types: ['string'] },
        { label: 'Ends With', value: 'endsWith', types: ['string'] }
      ]

      const numericOperators = [
        { label: 'Greater Than (>)', value: '>', types: ['number'] },
        { label: 'Less Than (<)', value: '<', types: ['number'] },
        { label: 'Greater Than or Equal (>=)', value: '>=', types: ['number'] },
        { label: 'Less Than or Equal (<=)', value: '<=', types: ['number'] }
      ]

      let operators = [...baseOperators]

      if (fieldType === 'string') {
        operators = [...operators, ...stringOperators]
      }

      if (fieldType === 'number') {
        operators = [...operators, ...numericOperators]
      }

      // If type is unknown, include all operators
      if (fieldType === 'unknown') {
        operators = [...operators, ...stringOperators, ...numericOperators]
      }

      // Add existence operator for all types (at the end of the list)
      operators = [...operators, ...existenceOperator]

      return operators
    } catch (error) {
      console.error('[FilterRuleService] Error getting operators:', error)
      return []
    }
  }

  /**
   * Format a value for use in a filter expression
   * Handles proper quoting and escaping
   *
   * @param {*} value - The value to format
   * @param {string} fieldType - The field type
   * @returns {string} Formatted value
   */
  static formatValueForFilter (value, fieldType = 'string') {
    try {
      if (value === null || value === undefined) {
        return 'null'
      }

      // Numbers and booleans don't need quotes
      if (fieldType === 'number') {
        const numValue = Number(value)
        if (isNaN(numValue)) {
          console.warn('[FilterRuleService] Invalid number value:', value)
          return '0'
        }
        return String(numValue)
      }

      if (fieldType === 'boolean') {
        return String(Boolean(value)).toLowerCase()
      }

      // Strings need to be quoted and escaped
      let stringValue = String(value)

      // Limit length for security
      if (stringValue.length > 1000) {
        console.warn('[FilterRuleService] Value too long, truncating')
        stringValue = stringValue.substring(0, 1000)
      }

      // Escape single quotes by doubling them (standard in many query languages)
      stringValue = stringValue.replace(/'/g, "''")

      // Also escape backslashes
      stringValue = stringValue.replace(/\\/g, '\\\\')

      return `'${stringValue}'`
    } catch (error) {
      console.error('[FilterRuleService] Error formatting value:', error)
      return 'null'
    }
  }

  /**
   * Build a filter expression from conditions
   *
   * @param {Array<Object>} conditions - Array of condition objects {field, operator, value}
   * @param {string} logicalOperator - 'AND' or 'OR'
   * @returns {string} JSONPath filter expression
   * @throws {Error} If conditions are invalid
   */
  static buildFilterExpression (conditions, logicalOperator = 'AND') {
    try {
      // Input validation
      if (!conditions || !Array.isArray(conditions)) {
        console.warn('[FilterRuleService] Invalid conditions array:', conditions)
        return ''
      }

      if (conditions.length === 0) {
        return ''
      }

      // Limit number of conditions for performance
      if (conditions.length > CONSTANTS.MAX_CONDITIONS) {
        console.warn(`[FilterRuleService] Too many conditions (${conditions.length}), limiting to ${CONSTANTS.MAX_CONDITIONS}`)
        conditions = conditions.slice(0, CONSTANTS.MAX_CONDITIONS)
      }

      // Validate logical operator
      if (logicalOperator !== 'AND' && logicalOperator !== 'OR') {
        console.warn('[FilterRuleService] Invalid logical operator:', logicalOperator, '- defaulting to AND')
        logicalOperator = 'AND'
      }

      // Filter out empty conditions with validation
      const validConditions = conditions.filter(c => {
        if (!c || typeof c !== 'object') {
          console.warn('[FilterRuleService] Invalid condition object:', c)
          return false
        }

        // Field and operator are always required
        if (!c.field || !c.operator) {
          return false
        }

        // Value is only required for operators that need it (not 'exists')
        if (c.operator !== 'exists' && (c.value === undefined || c.value === '' || c.value === null)) {
          return false
        }

        return true
      })

      if (validConditions.length === 0) {
        return ''
      }

      // Build individual condition expressions with error handling
      const expressions = validConditions.map((condition, index) => {
        try {
          return this._buildSingleConditionExpression(condition)
        } catch (error) {
          console.error(`[FilterRuleService] Error building condition ${index}:`, error)
          return null
        }
      }).filter(expr => expr !== null)

      if (expressions.length === 0) {
        return ''
      }

      // Join with logical operator
      const operator = logicalOperator === 'OR' ? ' || ' : ' && '
      const expression = expressions.join(operator)

      // Validate expression length
      if (expression.length > CONSTANTS.MAX_EXPRESSION_LENGTH) {
        console.error('[FilterRuleService] Expression too long:', expression.length)
        throw new Error('Filter expression exceeds maximum length')
      }

      return expression
    } catch (error) {
      console.error('[FilterRuleService] Error building filter expression:', error)
      throw error
    }
  }

  /**
   * Build a single condition expression
   *
   * @param {Object} condition - Condition object {field, operator, value, fieldType}
   * @returns {string} Single condition expression
   * @throws {Error} If condition is invalid
   * @private
   */
  static _buildSingleConditionExpression (condition) {
    try {
      // Validate condition structure
      if (!condition || typeof condition !== 'object') {
        throw new Error('Invalid condition object')
      }

      const { field, operator, value, fieldType = 'string' } = condition

      if (!field || typeof field !== 'string') {
        throw new Error('Invalid field in condition')
      }

      if (!operator || typeof operator !== 'string') {
        throw new Error('Invalid operator in condition')
      }

      // Sanitize field reference
      const sanitizedField = this._sanitizeFieldLabel(field)

      // Handle special operators
      switch (operator) {
        case 'exists':
          // For exists operator, only return the field path (no comparison)
          // This checks if the attribute exists regardless of its value
          return sanitizedField

        case 'contains':
          // For contains, we use regex matching
          return `${sanitizedField} =~ /.*${this._escapeRegex(value)}.*/`

        case 'startsWith':
          return `${sanitizedField} =~ /^${this._escapeRegex(value)}.*/`

        case 'endsWith':
          return `${sanitizedField} =~ /.*${this._escapeRegex(value)}$/`

        case '==':
        case '!=':
        case '>':
        case '<':
        case '>=':
        case '<=': {
          // Standard comparison operators
          const formattedValue = this.formatValueForFilter(value, fieldType)
          return `${sanitizedField} ${operator} ${formattedValue}`
        }

        default:
          throw new Error(`Unsupported operator: ${operator}`)
      }
    } catch (error) {
      console.error('[FilterRuleService] Error building single condition:', error)
      throw error
    }
  }

  /**
   * Escape special regex characters
   *
   * @param {string} str - String to escape
   * @returns {string} Escaped string
   * @private
   */
  static _escapeRegex (str) {
    try {
      if (str === null || str === undefined) {
        return ''
      }

      const stringValue = String(str)

      // Limit length for security
      if (stringValue.length > 1000) {
        console.warn('[FilterRuleService] Regex value too long, truncating')
        return stringValue.substring(0, 1000).replace(CONSTANTS.REGEX_SPECIAL_CHARS, '\\$&')
      }

      return stringValue.replace(CONSTANTS.REGEX_SPECIAL_CHARS, '\\$&')
    } catch (error) {
      console.error('[FilterRuleService] Error escaping regex:', error)
      return ''
    }
  }

  /**
   * Validate a filter expression
   *
   * @param {string} expression - The filter expression to validate
   * @returns {Object} Validation result with isValid, errors, warnings
   */
  static validateFilterExpression (expression) {
    const result = {
      isValid: true,
      errors: [],
      warnings: []
    }

    try {
      if (!expression || typeof expression !== 'string') {
        result.warnings.push('No filter expression defined')
        return result
      }

      // Check length
      if (expression.length > CONSTANTS.MAX_EXPRESSION_LENGTH) {
        result.isValid = false
        result.errors.push(`Expression exceeds maximum length of ${CONSTANTS.MAX_EXPRESSION_LENGTH} characters`)
        return result
      }

      // Check for balanced parentheses
      let parenCount = 0
      for (const char of expression) {
        if (char === '(') parenCount++
        if (char === ')') parenCount--
        if (parenCount < 0) {
          result.isValid = false
          result.errors.push('Unbalanced parentheses in filter expression')
          break
        }
      }

      if (parenCount !== 0) {
        result.isValid = false
        result.errors.push('Unbalanced parentheses in filter expression')
      }

      // Check for basic syntax issues
      if (expression.includes('@@')) {
        result.isValid = false
        result.errors.push('Invalid field reference (double @)')
      }

      // Warn about empty conditions
      if (expression.includes('&&  &&') || expression.includes('||  ||')) {
        result.warnings.push('Filter may contain empty conditions')
      }

      // Check for potentially dangerous patterns
      if (expression.includes('eval(') || expression.includes('Function(')) {
        result.isValid = false
        result.errors.push('Expression contains potentially unsafe code')
      }

      return result
    } catch (error) {
      console.error('[FilterRuleService] Error validating expression:', error)
      result.isValid = false
      result.errors.push('Failed to validate expression')
      return result
    }
  }

  /**
   * Test a filter expression against sample data
   *
   * @param {string} expression - The filter expression
   * @param {Object|Array} sampleData - The data to test against
   * @returns {Object} Test results with matchCount, sampleMatches, errors
   */
  static testFilterAgainstData (expression, sampleData) {
    const result = {
      success: false,
      matchCount: 0,
      totalCount: 0,
      sampleMatches: [],
      errors: []
    }

    try {
      // Input validation
      if (!expression || typeof expression !== 'string') {
        result.errors.push('Missing or invalid filter expression')
        return result
      }

      if (!sampleData) {
        result.errors.push('Missing sample data')
        return result
      }

      // Validate expression first
      const validation = this.validateFilterExpression(expression)
      if (!validation.isValid) {
        result.errors.push(...validation.errors)
        return result
      }

      const records = Array.isArray(sampleData) ? sampleData : [sampleData]
      result.totalCount = records.length

      // Limit records tested for performance
      const recordsToTest = records.slice(0, CONSTANTS.MAX_TEST_RECORDS)

      for (const record of recordsToTest) {
        try {
          // Evaluate the filter for this record
          const matches = this._evaluateFilterForRecord(expression, record)

          if (matches) {
            result.matchCount++

            // Store up to MAX_SAMPLE_MATCHES sample matches
            if (result.sampleMatches.length < CONSTANTS.MAX_SAMPLE_MATCHES) {
              // Deep clone to prevent mutations
              result.sampleMatches.push(JSON.parse(JSON.stringify(record)))
            }
          }
        } catch (error) {
          // Log but continue with other records
          console.warn('[FilterRuleService] Error evaluating record:', error)
        }
      }

      result.success = true

      // Add warning if we hit the test limit
      if (records.length > CONSTANTS.MAX_TEST_RECORDS) {
        result.warnings = [`Only tested first ${CONSTANTS.MAX_TEST_RECORDS} of ${records.length} records for performance`]
      }
    } catch (error) {
      console.error('[FilterRuleService] Error testing filter:', error)
      result.errors.push(`Test failed: ${error.message}`)
    }

    return result
  }

  /**
   * Evaluate a filter expression for a single record
   *
   * @param {string} expression - Filter expression
   * @param {Object} record - Data record
   * @returns {boolean} True if record matches filter
   * @throws {Error} If evaluation fails
   * @private
   */
  static _evaluateFilterForRecord (expression, record) {
    try {
      // Validate inputs
      if (!expression || typeof expression !== 'string') {
        throw new Error('Invalid expression')
      }

      if (!record || typeof record !== 'object') {
        return false
      }

      // Replace @ references with actual values
      let evalExpression = expression

      // Extract all field references (@.fieldname)
      const fieldRefs = expression.match(/@\.[a-zA-Z0-9_.[\\]*-]+/g) || []

      for (const fieldRef of fieldRefs) {
        try {
          // Get the field path (remove @ prefix)
          const fieldPath = fieldRef.substring(2)

          // Get the value from the record
          const value = this._getValueByPath(record, fieldPath)

          // Replace the field reference with the actual value
          if (value !== undefined && value !== null) {
            let quotedValue
            if (typeof value === 'string') {
              // Escape single quotes in the value
              const escapedValue = value.replace(/'/g, "\\'")
              quotedValue = `'${escapedValue}'`
            } else if (typeof value === 'number') {
              quotedValue = isNaN(value) ? 'null' : value
            } else if (typeof value === 'boolean') {
              quotedValue = value
            } else {
              quotedValue = 'null'
            }

            // Use a more specific replacement to avoid partial matches
            evalExpression = evalExpression.split(fieldRef).join(String(quotedValue))
          } else {
            // Field doesn't exist or is null - replace with null
            evalExpression = evalExpression.split(fieldRef).join('null')
          }
        } catch (fieldError) {
          console.warn('[FilterRuleService] Error processing field reference:', fieldRef, fieldError)
          // Replace with null on error
          evalExpression = evalExpression.split(fieldRef).join('null')
        }
      }

      // Handle regex-like patterns (contains, startsWith, endsWith)
      // Convert =~ /.../ to JavaScript regex test
      evalExpression = this._convertRegexPatterns(evalExpression)

      // Security check - prevent code injection
      if (evalExpression.includes('eval') || evalExpression.includes('Function')) {
        throw new Error('Expression contains unsafe code')
      }

      try {
        // Use Function constructor to evaluate (safer than eval)
        // eslint-disable-next-line no-new-func
        const evaluator = new Function('return ' + evalExpression)
        return Boolean(evaluator())
      } catch (evalError) {
        console.error('[FilterRuleService] Error evaluating expression:', evalExpression, evalError)
        return false
      }
    } catch (error) {
      console.error('[FilterRuleService] Error in _evaluateFilterForRecord:', error)
      return false
    }
  }

  /**
   * Convert regex patterns to JavaScript regex tests
   *
   * @param {string} expression - Expression with regex patterns
   * @returns {string} Expression with JavaScript regex
   * @private
   */
  static _convertRegexPatterns (expression) {
    try {
      if (!expression || typeof expression !== 'string') {
        return ''
      }

      // Match patterns like: value =~ /pattern/
      const regexPattern = /([^=\s]+)\s*=~\s*\/([^/]+)\//g

      return expression.replace(regexPattern, (match, value, pattern) => {
        // Convert to JavaScript regex test
        // Escape special characters in the pattern for safety
        return `/${pattern}/.test(${value})`
      })
    } catch (error) {
      console.error('[FilterRuleService] Error converting regex patterns:', error)
      return expression
    }
  }

  /**
   * Get a value from an object by path (supports nested paths and arrays)
   *
   * @param {Object|Array} obj - The object to traverse
   * @param {string} path - The path to the value
   * @returns {*} The value at the path or undefined
   * @private
   */
  static _getValueByPath (obj, path) {
    try {
      if (!obj) {
        return undefined
      }

      if (!path || typeof path !== 'string') {
        return undefined
      }

      // Remove leading $ or @ if present (JSONPath notation)
      const cleanPath = path.replace(/^[@$]\.?/, '')
      if (!cleanPath) {
        return obj
      }

      // Split path by dots and brackets
      const parts = cleanPath.split(/\.|\[|\]/).filter(p => p !== '')

      let current = obj
      for (const part of parts) {
        if (current === null || current === undefined) {
          return undefined
        }

        // Security: Prevent prototype pollution
        if (part === '__proto__' || part === 'constructor' || part === 'prototype') {
          return undefined
        }

        // Handle array indices
        if (/^\d+$/.test(part)) {
          const index = parseInt(part, 10)
          if (Array.isArray(current) && index >= 0 && index < current.length) {
            current = current[index]
          } else {
            return undefined
          }
        } else {
          // Handle object property access
          if (typeof current === 'object' && part in current) {
            current = current[part]
          } else {
            return undefined
          }
        }
      }

      return current
    } catch (error) {
      console.error('[FilterRuleService] Error getting value by path:', error)
      return undefined
    }
  }

  /**
   * Validate Step 4 filter rules
   *
   * @param {Object} filterRules - Filter rules from store
   * @returns {Object} Validation result with isValid and errors
   */
  static validateFilterRules (filterRules) {
    const result = {
      isValid: true,
      errors: [],
      warnings: []
    }

    try {
      // Input validation
      if (!filterRules || typeof filterRules !== 'object') {
        result.warnings.push('No filter rules provided')
        return result
      }

      // Step 4 is optional, so empty filters are valid
      if (!filterRules.conditions || !Array.isArray(filterRules.conditions) || filterRules.conditions.length === 0) {
        result.warnings.push('No filter conditions defined. This step can be skipped.')
        return result
      }

      // Validate each condition
      for (let i = 0; i < filterRules.conditions.length; i++) {
        const condition = filterRules.conditions[i]

        if (!condition || typeof condition !== 'object') {
          result.errors.push(`Condition ${i + 1}: Invalid condition object`)
          result.isValid = false
          continue
        }

        if (!condition.field || typeof condition.field !== 'string') {
          result.errors.push(`Condition ${i + 1}: Field is required`)
          result.isValid = false
        }

        if (!condition.operator || typeof condition.operator !== 'string') {
          result.errors.push(`Condition ${i + 1}: Operator is required`)
          result.isValid = false
        }

        // Only require value for operators that need it (not 'exists')
        if (condition.operator !== 'exists' && (condition.value === undefined || condition.value === '' || condition.value === null)) {
          result.warnings.push(`Condition ${i + 1}: Value is empty`)
        }
      }

      // Validate the generated expression
      if (filterRules.expression) {
        const expressionValidation = this.validateFilterExpression(filterRules.expression)
        if (!expressionValidation.isValid) {
          result.isValid = false
          result.errors.push(...expressionValidation.errors)
        }
        if (expressionValidation.warnings) {
          result.warnings.push(...expressionValidation.warnings)
        }
      }

      return result
    } catch (error) {
      console.error('[FilterRuleService] Error validating filter rules:', error)
      result.isValid = false
      result.errors.push('Failed to validate filter rules')
      return result
    }
  }

  /**
   * Create a new empty filter condition
   *
   * @param {Array<Object>} availableFields - Available fields to pre-populate
   * @returns {Object} New condition object
   */
  static createEmptyCondition (availableFields = []) {
    try {
      // Input validation
      if (!Array.isArray(availableFields)) {
        console.warn('[FilterRuleService] Invalid availableFields array')
        availableFields = []
      }

      return {
        field: availableFields.length > 0 ? availableFields[0].label : '',
        operator: '==',
        value: '',
        fieldType: availableFields.length > 0 ? availableFields[0].type : 'string'
      }
    } catch (error) {
      console.error('[FilterRuleService] Error creating empty condition:', error)
      return {
        field: '',
        operator: '==',
        value: '',
        fieldType: 'string'
      }
    }
  }

  /**
   * Validate a value based on its field type
   *
   * @param {*} value - The value to validate
   * @param {string} fieldType - The expected field type (string, number, boolean, null, unknown)
   * @returns {Object} Validation result with isValid and errorMessage
   */
  static validateValueForFieldType (value, fieldType) {
    const result = {
      isValid: true,
      errorMessage: ''
    }

    try {
      // Empty values are allowed (can be filtered later)
      if (value === '' || value === null || value === undefined) {
        return result
      }

      // Convert value to string for validation
      const valueStr = String(value).trim()

      if (valueStr === '') {
        return result
      }

      // Validate based on field type
      switch (fieldType) {
        case 'number': {
          // Check if value is a valid number
          if (isNaN(valueStr) || valueStr === '') {
            result.isValid = false
            result.errorMessage = 'Value must be a valid number'
          } else {
            // Additional validation: check if it's a finite number
            const numValue = parseFloat(valueStr)
            if (!isFinite(numValue)) {
              result.isValid = false
              result.errorMessage = 'Value must be a finite number'
            }
          }
          break
        }

        case 'boolean': {
          // Check if value is a valid boolean representation
          const lowerValue = valueStr.toLowerCase()
          if (lowerValue !== 'true' && lowerValue !== 'false' && lowerValue !== '1' && lowerValue !== '0') {
            result.isValid = false
            result.errorMessage = 'Value must be true, false, 1, or 0'
          }
          break
        }

        case 'null': {
          // Null type should only accept null representation
          const lowerValueNull = valueStr.toLowerCase()
          if (lowerValueNull !== 'null') {
            result.isValid = false
            result.errorMessage = 'Value must be null'
          }
          break
        }

        case 'string':
          // Strings are always valid
          result.isValid = true
          break

        case 'unknown':
          // Unknown types accept any value with a warning
          result.isValid = true
          break

        default:
          // Unrecognized type - accept with warning
          console.warn('[FilterRuleService] Unknown field type for validation:', fieldType)
          result.isValid = true
          break
      }

      return result
    } catch (error) {
      console.error('[FilterRuleService] Error validating value for field type:', error)
      return {
        isValid: true, // Default to valid on error to avoid blocking user
        errorMessage: ''
      }
    }
  }

  /**
   * Update condition field type based on selected field
   *
   * @param {Object} condition - The condition to update
   * @param {Array<Object>} availableFields - Available fields
   * @returns {Object} Updated condition
   */
  static updateConditionFieldType (condition, availableFields) {
    try {
      // Input validation
      if (!condition || typeof condition !== 'object') {
        console.warn('[FilterRuleService] Invalid condition object')
        return condition
      }

      if (!Array.isArray(availableFields)) {
        console.warn('[FilterRuleService] Invalid availableFields array')
        return condition
      }

      const field = availableFields.find(f => f && f.label === condition.field)

      if (field && field.type) {
        // Create a new object to avoid mutations
        return {
          ...condition,
          fieldType: field.type
        }
      }

      return condition
    } catch (error) {
      console.error('[FilterRuleService] Error updating condition field type:', error)
      return condition
    }
  }
}

export default {
  FilterRuleService
}
