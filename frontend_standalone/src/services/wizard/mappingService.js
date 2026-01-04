/**
 * Mapping Service for JSON Policy Builder Wizard
 * Handles business logic for Step 5: Field Mapping Configuration
 * - Extract JSON paths from sample data
 * - Validate mapping entries
 * - Build mapping previews
 * - Generate mapping configurations for policy export
 *
 * @module services/wizard/mappingService
 * @production-ready - Enhanced with comprehensive error handling, validation, and security
 */

// Import case-insensitive utilities for Phase 2 JSONPath field matching
import { getCaseInsensitiveProperty } from './utilityService'

// Constants for production-quality configuration
const CONSTANTS = {
  MAX_FIELD_DEPTH: 10,
  MAX_MAPPINGS: 100,
  MAX_JSON_PATHS: 500,
  MAX_ALTERNATIVE_FIELDS: 5,
  MAX_PATH_LENGTH: 500,
  SUPPORTED_DATA_TYPES: ['String', 'DateTime', 'Number', 'Decimal', 'Boolean'],
  DATETIME_FORMAT_REGEX: /^[yMdHhmsS:\-/\s.TZ]+$/,
  HTML_ESCAPE_MAP: {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
    '/': '&#x2F;'
  },
  // LogRhythm schema field categories for validation
  LR_FIELD_CATEGORIES: {
    TEMPORAL: ['normal_msg_date', 'log_date', 'time', 'minutes', 'seconds', 'milliseconds'],
    NETWORK: ['srcip', 'srcport', 'dstip', 'dstport', 'src_mac', 'dst_mac', 'sip', 'dip', 'snatip', 'dnatip', 'smac', 'dmac', 'sinterface', 'dinterface', 'sname', 'dname', 'sport', 'dport', 'snatport', 'dnatport', 'protnum', 'protname', 'kilobytesin', 'kilobytesout', 'kilobytes', 'packetsin', 'packetsout'],
    IDENTITY: ['login', 'user', 'domain', 'sender', 'recipient', 'account', 'group', 'domainimpacted', 'domainorigin'],
    PROCESS: ['process_id', 'process_name', 'parent_process_id', 'parent_process_name', 'command', 'process', 'processid', 'parentprocessid', 'parentprocessname', 'parentprocesspath'],
    SECURITY: ['hash', 'subject', 'object', 'action', 'status', 'result_code', 'objectname', 'objecttype', 'policy', 'result', 'reason', 'sessiontype', 'severity', 'threatname', 'threatid', 'cve', 'serialnumber'],
    CONTENT: ['url', 'user_agent', 'session_id', 'vendor_msg_id', 'message', 'useragent', 'responsecode', 'version', 'session', 'vendorinfo', 'original_message'],
    DEVICE: ['beatname', 'device_type', 'fullyqualifiedbeatname', 'vmid'],
    METRICS: ['quantity', 'amount', 'size', 'rate'],
    CUSTOM: ['augmented', 'tag1', 'tag2', 'tag3', 'tag4', 'tag5', 'tag6', 'tag7', 'tag8', 'tag9', 'tag10']
  }
}

/**
 * MappingService class for wizard Step 5
 * Provides methods for field mapping generation and management
 * @class
 */
export class MappingService {
  /**
   * Extract all available JSON paths from parsed sample data
   * Returns all possible field paths that can be mapped
   *
   * @param {Object|Array} parsedData - The parsed JSON data from Step 2
   * @param {Object} dataStructure - The analyzed structure from DataProcessor
   * @param {Object} options - Optional parameters: { jsonToStringFields: Array, parsedStringifiedFields: Object }
   * @returns {Array<Object>} Array of path objects with value, label, type
   * @throws {Error} If input validation fails
   *
   * @example
   * const paths = MappingService.extractJsonPaths(data, structure)
   * // Returns: [{ value: '$.user.name', label: '$.user.name', type: 'string', sampleValue: 'John' }]
   */
  static extractJsonPaths (parsedData, dataStructure, options = {}) {
    try {
      // Input validation
      if (!parsedData) {
        console.warn('[MappingService] extractJsonPaths: No parsed data provided')
        return []
      }

      if (!dataStructure) {
        console.warn('[MappingService] extractJsonPaths: No data structure provided')
        return []
      }

      // Type validation
      if (typeof dataStructure !== 'object') {
        console.error('[MappingService] Invalid dataStructure type:', typeof dataStructure)
        return []
      }

      // Get JSON-to-String fields from options
      const jsonToStringFields = options?.jsonToStringFields || []
      const parsedStringifiedFields = options?.parsedStringifiedFields || {}

      console.log('╔════════════════════════════════════════════════════════════════════════')
      console.log('║ [MappingService] extractJsonPaths called with JSON-to-String options')
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

      const paths = []
      const visited = new Set()

      /**
       * Recursively traverse the data structure to extract all JSON paths
       * @param {Object} node - Current node in the structure tree
       * @param {*} data - Corresponding data for this node
       * @param {number} depth - Current recursion depth
       */
      const traverse = (node, data, depth = 0) => {
        // Safety check for recursion depth
        if (depth > CONSTANTS.MAX_FIELD_DEPTH) {
          console.warn('[MappingService] Maximum field depth reached:', CONSTANTS.MAX_FIELD_DEPTH)
          return
        }

        // Null/undefined safety check
        if (!node) {
          return
        }

        // Check for valid path
        if (!node.path || typeof node.path !== 'string') {
          console.warn('[MappingService] Invalid node path:', node)
          return
        }

        // Validate path length
        if (node.path.length > CONSTANTS.MAX_PATH_LENGTH) {
          console.warn('[MappingService] Path too long:', node.path.length)
          return
        }

        // Avoid circular references
        if (visited.has(node.path)) {
          return
        }

        visited.add(node.path)

        // Limit total number of paths for performance
        if (paths.length >= CONSTANTS.MAX_JSON_PATHS) {
          console.warn('[MappingService] Maximum JSON paths limit reached:', CONSTANTS.MAX_JSON_PATHS)
          return
        }

        try {
          // Include all leaf nodes (primitive types) for mapping
          if (node.type && node.type !== 'object' && node.type !== 'array') {
            // Get a sample value from the data
            // For multiline NDJSON (array of objects), extract from first object
            let dataForSample = parsedData
            if (Array.isArray(parsedData) && parsedData.length > 0) {
              dataForSample = parsedData[0]
              console.log('[MappingService] Using first array element for sample extraction:', node.path)
            }
            const sampleValue = this._getSampleValueForPath(dataForSample, node.path)

            // Sanitize the path
            const sanitizedPath = this._sanitizeJsonPath(node.path)

            paths.push({
              value: sanitizedPath,
              label: sanitizedPath,
              type: node.type,
              sampleValue: sampleValue,
              isNested: sanitizedPath.includes('.') || sanitizedPath.includes('['),
              depth: depth
            })
          }

          // Recursively process children with error handling
          if (node.children && Array.isArray(node.children)) {
            for (const child of node.children) {
              try {
                // For arrays, use the first element's data
                if (node.type === 'array' && Array.isArray(data) && data.length > 0) {
                  traverse(child, data[0], depth + 1)
                } else if (typeof data === 'object' && data !== null && child.key) {
                  traverse(child, data[child.key], depth + 1)
                } else {
                  traverse(child, data, depth + 1)
                }
              } catch (childError) {
                console.error('[MappingService] Error processing child node:', childError)
                // Continue with other children
              }
            }
          }
        } catch (nodeError) {
          console.error('[MappingService] Error processing node:', nodeError)
          // Continue with other nodes
        }
      }

      // Start traversal for base paths
      // For multiline NDJSON (array of objects), use first element for traversal
      let dataForTraversal = parsedData
      if (Array.isArray(parsedData) && parsedData.length > 0) {
        dataForTraversal = parsedData[0]
        console.log('[MappingService] Detected multiline NDJSON array, using first element for structure traversal')
      }
      traverse(dataStructure, dataForTraversal, 0)

      // Process each JSON-to-String field to add nested paths
      if (jsonToStringFields && jsonToStringFields.length > 0) {
        console.log('╔════════════════════════════════════════════════════════════════════════')
        console.log('║ [MappingService] Processing JSON-to-String fields for nested paths')
        console.log('╠════════════════════════════════════════════════════════════════════════')

        for (const fieldPath of jsonToStringFields) {
          console.log(`║ Processing field: ${fieldPath}`)

          // Check if we have parsed data for this field
          if (!parsedStringifiedFields[fieldPath]) {
            console.log(`║ No parsed data available for: ${fieldPath}`)
            continue
          }

          const parsedData = parsedStringifiedFields[fieldPath]
          console.log(`║ Found parsed data: ${typeof parsedData}`)

          // Create a temporary structure for traversal
          // If it's an object, create a structure with the object as the root
          // If it's an array, create a structure with the array as the root
          let tempStructure = null
          if (Array.isArray(parsedData)) {
            tempStructure = {
              path: fieldPath,
              type: 'array',
              children: []
            }
            // Add children based on first element if available
            if (parsedData.length > 0) {
              const firstItem = parsedData[0]
              if (typeof firstItem === 'object' && firstItem !== null) {
                for (const key in firstItem) {
                  if (Object.prototype.hasOwnProperty.call(firstItem, key)) {
                    const childType = typeof firstItem[key]
                    tempStructure.children.push({
                      path: `${fieldPath}.${key}`,
                      key: key,
                      type: childType === 'object' && firstItem[key] !== null
                        ? (Array.isArray(firstItem[key]) ? 'array' : 'object')
                        : childType
                    })
                  }
                }
              }
            }
          } else if (typeof parsedData === 'object' && parsedData !== null) {
            tempStructure = {
              path: fieldPath,
              type: 'object',
              children: []
            }
            // Add children based on keys
            for (const key in parsedData) {
              if (Object.prototype.hasOwnProperty.call(parsedData, key)) {
                const childType = typeof parsedData[key]
                tempStructure.children.push({
                  path: `${fieldPath}.${key}`,
                  key: key,
                  type: childType === 'object' && parsedData[key] !== null
                    ? (Array.isArray(parsedData[key]) ? 'array' : 'object')
                    : childType
                })
              }
            }
          }

          if (tempStructure) {
            console.log(`║ Created temp structure with ${tempStructure.children?.length || 0} children`)
            // Traverse the temp structure to extract paths
            try {
              // Create a new set to track visited paths for this specific field
              // to avoid conflicts with the main traversal
              const tempVisited = new Set()

              // Define a special traverse function for JSON-to-String fields
              const traverseJsonStringField = (node, data, depth = 0, parentPath = fieldPath) => {
                // Use same depth limit as main traversal
                if (depth > CONSTANTS.MAX_FIELD_DEPTH) {
                  return
                }

                // Skip null nodes
                if (!node) {
                  return
                }

                // Skip nodes without path or with invalid path
                if (!node.path) {
                  return
                }

                // Avoid circular references within this specific traversal
                if (tempVisited.has(node.path)) {
                  return
                }
                tempVisited.add(node.path)

                // Respect the same max path limit
                if (paths.length >= CONSTANTS.MAX_JSON_PATHS) {
                  return
                }

                try {
                  // Add the current node as a path if it's a leaf node
                  if (node.type && node.type !== 'object' && node.type !== 'array') {
                    // Get sample value from the stringified JSON field's parsed data
                    // For multiline data inside the parsed stringified field, use first element
                    let dataForNestedSample = parsedData
                    if (Array.isArray(parsedData) && parsedData.length > 0) {
                      dataForNestedSample = parsedData[0]
                      console.log('[MappingService] Using first array element for nested JSON string sample extraction:', node.path)
                    }

                    const sampleValue = this._getNestedValueByPath(
                      dataForNestedSample,
                      node.path.substring(fieldPath.length + 1) // Remove parent field path + dot
                    )

                    // Use the same path sanitization
                    const sanitizedPath = this._sanitizeJsonPath(node.path)

                    paths.push({
                      value: sanitizedPath,
                      label: sanitizedPath,
                      type: node.type,
                      sampleValue: sampleValue,
                      isNested: true, // Always true since these are nested inside a field
                      depth: depth,
                      isFromJsonString: true // Mark as coming from a JSON-to-String field
                    })
                  }

                  // Recursively process children
                  if (node.children && Array.isArray(node.children)) {
                    for (const child of node.children) {
                      try {
                        // For arrays, use the first element if available
                        if (node.type === 'array' && Array.isArray(data) && data.length > 0) {
                          traverseJsonStringField(child, data[0], depth + 1, parentPath)
                        } else if (typeof data === 'object' && data !== null && child.key) {
                          traverseJsonStringField(child, data[child.key], depth + 1, parentPath)
                        } else {
                          traverseJsonStringField(child, data, depth + 1, parentPath)
                        }
                      } catch (childError) {
                        console.error(`[MappingService] Error processing JSON-string child node: ${childError.message}`)
                      }
                    }
                  }
                } catch (nodeError) {
                  console.error(`[MappingService] Error processing JSON-string node: ${nodeError.message}`)
                }
              }

              // Start traversal for the JSON-to-String field
              traverseJsonStringField(tempStructure, parsedData, 0)
            } catch (traverseError) {
              console.error(`[MappingService] Error traversing JSON-string field ${fieldPath}:`, traverseError)
            }
          } else {
            console.log(`║ Could not create temp structure for ${fieldPath}, data is not a valid object or array`)
          }
        }
        console.log('╚════════════════════════════════════════════════════════════════════════')
      }

      console.log(`[MappingService] Extracted ${paths.length} JSON paths`)

      // Debug: Log the extracted paths for troubleshooting
      if (paths.length > 0) {
        console.log('[MappingService] Sample paths:', paths.slice(0, 5).map(p => ({
          path: p.value,
          type: p.type,
          sample: p.sampleValue,
          isFromJsonString: p.isFromJsonString || false
        })))
      }

      return paths
    } catch (error) {
      console.error('[MappingService] Fatal error in extractJsonPaths:', error)
      // Return empty array instead of throwing to maintain graceful degradation
      return []
    }
  }

  /**
   * Get a sample value for a given JSON path
   *
   * @param {Object|Array} data - The data to extract from
   * @param {string} path - JSONPath to the field
   * @returns {string|null} Sample value or null
   * @private
   */
  static _getSampleValueForPath (data, path) {
    try {
      if (!data || !path) {
        return null
      }

      // Get the value using helper method
      const value = this._getValueByPath(data, path)

      if (value === undefined || value === null) {
        return null
      }

      // Format the value for display
      let displayValue = typeof value === 'string' ? value : JSON.stringify(value)

      // Limit length for UI
      if (displayValue.length > 50) {
        displayValue = displayValue.substring(0, 47) + '...'
      }

      // HTML escape the value
      return this._escapeHtml(displayValue)
    } catch (error) {
      console.error('[MappingService] Error getting sample value:', error)
      return null
    }
  }

  /**
   * Sanitize a JSON path to prevent XSS
   *
   * @param {string} path - The path to sanitize
   * @returns {string} Sanitized path
   * @private
   */
  static _sanitizeJsonPath (path) {
    if (!path || typeof path !== 'string') {
      return ''
    }

    // Only allow valid JSON path characters (including @ for fields like @metadata, @timestamp)
    return path.replace(/[^a-zA-Z0-9._[\]$*@-]/g, '_')
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
      console.error('[MappingService] Error escaping HTML:', error)
      return ''
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

      // Remove leading $ if present (JSONPath notation)
      const cleanPath = path.replace(/^\$\.?/, '')
      if (!cleanPath) {
        return obj
      }

      // Split path by dots and brackets
      const parts = cleanPath.split(/\.|\[|\]/).filter(p => p !== '' && p !== '*')

      let current = obj

      // Handle root array case
      if (Array.isArray(obj) && parts.length > 0) {
        // For arrays, try to get the first element
        current = obj[0]
        if (!current) {
          return undefined
        }
      }

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
          // Handle object property access - CASE-INSENSITIVE (Phase 2)
          if (typeof current === 'object') {
            current = getCaseInsensitiveProperty(current, part)
            if (current === undefined) {
              return undefined
            }
          } else {
            return undefined
          }
        }
      }

      return current
    } catch (error) {
      console.error('[MappingService] Error getting value by path:', error)
      return undefined
    }
  }

  /**
   * Get a nested value from parsed JSON string data
   * This is similar to _getValueByPath but optimized for parsed JSON string fields
   *
   * @param {Object|Array} obj - The parsed JSON object/array
   * @param {string} path - The nested path within the JSON (without parent path)
   * @returns {*} The value at the path or undefined
   * @private
   */
  static _getNestedValueByPath (obj, path) {
    try {
      if (!obj) {
        return undefined
      }

      if (!path || typeof path !== 'string') {
        return undefined
      }

      // For root object/array
      if (path === '') {
        return obj
      }

      // Split path by dots and handle bracket notation
      const parts = path.split(/\.|\[|\]/).filter(p => p !== '')

      let current = obj

      for (const part of parts) {
        if (current === null || current === undefined) {
          return undefined
        }

        // Security check
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
          // Handle object property access - CASE-INSENSITIVE (Phase 2)
          if (typeof current === 'object') {
            current = getCaseInsensitiveProperty(current, part)
            if (current === undefined) {
              return undefined
            }
          } else {
            return undefined
          }
        }
      }

      return current
    } catch (error) {
      console.error('[MappingService] Error getting nested value by path:', error)
      return undefined
    }
  }

  /**
   * Validate a mapping entry
   *
   * @param {Object} mapping - Mapping object to validate
   * @returns {Object} Validation result with isValid, errors, warnings
   */
  static validateMapping (mapping) {
    const result = {
      isValid: true,
      errors: [],
      warnings: []
    }

    try {
      // Input validation
      if (!mapping || typeof mapping !== 'object') {
        result.isValid = false
        result.errors.push('Invalid mapping object')
        return result
      }

      // Required fields validation
      if (!mapping.inputRule || typeof mapping.inputRule !== 'string') {
        result.isValid = false
        result.errors.push('Input Rule (JSON Path) is required')
      } else {
        // Validate JSON path format
        if (!mapping.inputRule.startsWith('$')) {
          result.warnings.push('JSON Path should start with $')
        }

        // Validate path length
        if (mapping.inputRule.length > CONSTANTS.MAX_PATH_LENGTH) {
          result.isValid = false
          result.errors.push(`JSON Path exceeds maximum length of ${CONSTANTS.MAX_PATH_LENGTH} characters`)
        }
      }

      if (!mapping.lrSchemaField || typeof mapping.lrSchemaField !== 'string') {
        result.isValid = false
        result.errors.push('LogRhythm Schema Field is required')
      } else {
        // Validate LogRhythm field format (alphanumeric, underscore)
        if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(mapping.lrSchemaField)) {
          result.warnings.push('LogRhythm field should contain only letters, numbers, and underscores')
        }
      }

      if (!mapping.type || typeof mapping.type !== 'string') {
        result.isValid = false
        result.errors.push('Data Type is required')
      } else {
        // Validate data type
        if (!CONSTANTS.SUPPORTED_DATA_TYPES.includes(mapping.type)) {
          result.isValid = false
          result.errors.push(`Invalid data type: ${mapping.type}. Supported types: ${CONSTANTS.SUPPORTED_DATA_TYPES.join(', ')}`)
        }
      }

      // Optional field validation
      if (mapping.format) {
        if (typeof mapping.format !== 'string') {
          result.warnings.push('Format should be a string')
        } else if (mapping.type === 'DateTime') {
          // Validate DateTime format string
          if (!CONSTANTS.DATETIME_FORMAT_REGEX.test(mapping.format)) {
            result.warnings.push('DateTime format may be invalid. Use patterns like yyyy-MM-dd HH:mm:ss')
          }
        }
      }

      if (mapping.default !== null && mapping.default !== undefined) {
        // Validate default value type compatibility
        if (mapping.type === 'Number' || mapping.type === 'Decimal') {
          if (isNaN(mapping.default)) {
            result.warnings.push('Default value should be numeric for Number/Decimal type')
          }
        }
      }

      if (mapping.alternativeFields) {
        if (!Array.isArray(mapping.alternativeFields)) {
          result.warnings.push('Alternative fields should be an array')
        } else {
          // Validate alternative field count
          if (mapping.alternativeFields.length > CONSTANTS.MAX_ALTERNATIVE_FIELDS) {
            result.warnings.push(`Too many alternative fields (${mapping.alternativeFields.length}). Maximum recommended: ${CONSTANTS.MAX_ALTERNATIVE_FIELDS}`)
          }

          // Validate each alternative field
          for (const altField of mapping.alternativeFields) {
            if (typeof altField !== 'string') {
              result.warnings.push('Alternative field should be a string (JSON Path)')
            } else if (!altField.startsWith('$')) {
              result.warnings.push('Alternative field should start with $ (JSON Path)')
            }
          }
        }
      }

      // FanoutParentElement validation
      if (mapping.fanoutParentElement) {
        if (typeof mapping.fanoutParentElement !== 'string') {
          result.warnings.push('Fanout Parent Element should be a string (JSON Path)')
        } else if (!mapping.fanoutParentElement.includes('[*]')) {
          result.warnings.push('Fanout Parent Element should include [*] to indicate array iteration')
        }
      }

      return result
    } catch (error) {
      console.error('[MappingService] Error validating mapping:', error)
      result.isValid = false
      result.errors.push(`Validation failed: ${error.message}`)
      return result
    }
  }

  /**
   * Check for duplicate mappings
   *
   * @param {Object} mapping - Mapping to check
   * @param {Array<Object>} existingMappings - Existing mappings
   * @returns {Object} Result with isDuplicate, duplicateField, message
   */
  static checkDuplicateMapping (mapping, existingMappings) {
    try {
      // Input validation
      if (!mapping || typeof mapping !== 'object') {
        return { isDuplicate: false, duplicateField: null, message: '' }
      }

      if (!Array.isArray(existingMappings)) {
        return { isDuplicate: false, duplicateField: null, message: '' }
      }

      // NOTE: One JSON attribute (inputRule) CAN be mapped to multiple LR Schema fields - this is ALLOWED
      // We do NOT check for duplicate inputRule anymore

      // Check for duplicate lrSchemaField (same LogRhythm field)
      // One LR Schema field can ONLY be mapped to a single JSON attribute - this is NOT ALLOWED
      const duplicateLRField = existingMappings.find(m =>
        m.lrSchemaField === mapping.lrSchemaField && m.id !== mapping.id
      )

      if (duplicateLRField) {
        return {
          isDuplicate: true,
          duplicateField: 'lrSchemaField',
          message: `LogRhythm field "${mapping.lrSchemaField}" is already mapped from "${duplicateLRField.inputRule}"`
        }
      }

      return { isDuplicate: false, duplicateField: null, message: '' }
    } catch (error) {
      console.error('[MappingService] Error checking duplicate mapping:', error)
      return { isDuplicate: false, duplicateField: null, message: '' }
    }
  }

  /**
   * Get available data type options
   *
   * @returns {Array<Object>} Array of data type options with label and value
   */
  static getDataTypeOptions () {
    return CONSTANTS.SUPPORTED_DATA_TYPES.map(type => ({
      label: type,
      value: type
    }))
  }

  /**
   * Get common LogRhythm schema fields grouped by category
   *
   * @returns {Array<Object>} Array of field options with label, value, category
   */
  static getLRSchemaFields () {
    const fields = []

    for (const [category, fieldNames] of Object.entries(CONSTANTS.LR_FIELD_CATEGORIES)) {
      for (const field of fieldNames) {
        fields.push({
          label: field,
          value: field,
          category: category.toLowerCase()
        })
      }
    }

    // Sort alphabetically
    fields.sort((a, b) => a.label.localeCompare(b.label))

    return fields
  }

  /**
   * Get recommended LogRhythm field based on JSON path and data type
   *
   * @param {string} jsonPath - The JSON path
   * @param {string} dataType - The data type
   * @param {*} sampleValue - Sample value from data
   * @returns {string|null} Recommended LR field or null
   */
  static getRecommendedLRField (jsonPath, dataType, sampleValue = null) {
    try {
      if (!jsonPath || typeof jsonPath !== 'string') {
        return null
      }

      const lowerPath = jsonPath.toLowerCase()

      // DateTime field recommendations
      if (dataType === 'DateTime' || lowerPath.includes('time') || lowerPath.includes('date')) {
        return 'normal_msg_date'
      }

      // Network field recommendations
      if (lowerPath.includes('sourceip') || lowerPath.includes('src_ip') || lowerPath.includes('source.ip')) {
        return 'srcip'
      }
      if (lowerPath.includes('destip') || lowerPath.includes('dst_ip') || lowerPath.includes('destination.ip')) {
        return 'dstip'
      }
      if (lowerPath.includes('sourceport') || lowerPath.includes('src_port') || lowerPath.includes('source.port')) {
        return 'srcport'
      }
      if (lowerPath.includes('destport') || lowerPath.includes('dst_port') || lowerPath.includes('destination.port')) {
        return 'dstport'
      }

      // Identity field recommendations
      if (lowerPath.includes('user') || lowerPath.includes('username') || lowerPath.includes('login')) {
        return 'login'
      }
      if (lowerPath.includes('domain')) {
        return 'domain'
      }

      // Process field recommendations
      if (lowerPath.includes('processid') || lowerPath.includes('pid')) {
        return 'process_id'
      }
      if (lowerPath.includes('processname') || lowerPath.includes('process.name')) {
        return 'process_name'
      }
      if (lowerPath.includes('command') || lowerPath.includes('cmdline')) {
        return 'command'
      }

      // Security field recommendations
      if (lowerPath.includes('hash') || lowerPath.includes('md5') || lowerPath.includes('sha')) {
        return 'hash'
      }
      if (lowerPath.includes('action')) {
        return 'action'
      }
      if (lowerPath.includes('status') || lowerPath.includes('result')) {
        return 'status'
      }

      // Content field recommendations
      if (lowerPath.includes('url')) {
        return 'url'
      }
      if (lowerPath.includes('useragent') || lowerPath.includes('user_agent')) {
        return 'user_agent'
      }
      if (lowerPath.includes('session') || lowerPath.includes('sessionid')) {
        return 'session_id'
      }
      if (lowerPath.includes('message') || lowerPath.includes('msg')) {
        return 'message'
      }

      return null
    } catch (error) {
      console.error('[MappingService] Error getting recommended LR field:', error)
      return null
    }
  }

  /**
   * Build a mapping preview showing how data will be transformed
   *
   * @param {Array<Object>} mappings - The mappings to preview
   * @param {Object|Array} sampleData - Sample data to transform
   * @returns {Object} Preview result with transformedData, errors, warnings
   */
  static buildMappingPreview (mappings, sampleData) {
    const result = {
      success: false,
      transformedData: [],
      errors: [],
      warnings: []
    }

    try {
      // Input validation
      if (!Array.isArray(mappings) || mappings.length === 0) {
        result.warnings.push('No mappings to preview')
        return result
      }

      if (!sampleData) {
        result.errors.push('No sample data available')
        return result
      }

      // Normalize sample data to array
      const records = Array.isArray(sampleData) ? sampleData.slice(0, 5) : [sampleData]

      // Transform each record
      for (const record of records) {
        const transformedRecord = {}

        for (const mapping of mappings) {
          try {
            // Get value from record using inputRule
            const value = this._getValueByPath(record, mapping.inputRule)

            // Apply transformation based on type
            let transformedValue = value

            if (value !== undefined && value !== null) {
              // Type-specific transformations
              if (mapping.type === 'Number' || mapping.type === 'Decimal') {
                transformedValue = Number(value)
                if (isNaN(transformedValue)) {
                  transformedValue = mapping.default || 0
                }
              } else if (mapping.type === 'Boolean') {
                transformedValue = Boolean(value)
              } else if (mapping.type === 'String') {
                transformedValue = String(value)
              }
            } else {
              // Check alternative fields
              if (mapping.alternativeFields && Array.isArray(mapping.alternativeFields)) {
                for (const altField of mapping.alternativeFields) {
                  const altValue = this._getValueByPath(record, altField)
                  if (altValue !== undefined && altValue !== null) {
                    transformedValue = altValue
                    break
                  }
                }
              }

              // Use default if still null
              if ((transformedValue === undefined || transformedValue === null) && mapping.default) {
                transformedValue = mapping.default
              }
            }

            // Add to transformed record
            transformedRecord[mapping.lrSchemaField] = transformedValue
          } catch (mappingError) {
            console.error('[MappingService] Error applying mapping:', mappingError)
            result.warnings.push(`Failed to apply mapping for ${mapping.inputRule}`)
          }
        }

        result.transformedData.push(transformedRecord)
      }

      result.success = true
      return result
    } catch (error) {
      console.error('[MappingService] Error building mapping preview:', error)
      result.errors.push(`Preview failed: ${error.message}`)
      return result
    }
  }

  /**
   * Validate all mappings
   *
   * @param {Array<Object>} mappings - Mappings to validate
   * @returns {Object} Validation result with isValid, errors, warnings
   */
  static validateAllMappings (mappings) {
    const result = {
      isValid: true,
      errors: [],
      warnings: []
    }

    try {
      // Input validation
      if (!Array.isArray(mappings)) {
        result.isValid = false
        result.errors.push('Mappings must be an array')
        return result
      }

      if (mappings.length === 0) {
        result.isValid = false
        result.errors.push('At least one mapping is required')
        return result
      }

      // Check mapping limit
      if (mappings.length > CONSTANTS.MAX_MAPPINGS) {
        result.warnings.push(`Too many mappings (${mappings.length}). Maximum recommended: ${CONSTANTS.MAX_MAPPINGS}`)
      }

      // Validate each mapping
      for (let i = 0; i < mappings.length; i++) {
        const mapping = mappings[i]
        const validation = this.validateMapping(mapping)

        if (!validation.isValid) {
          result.isValid = false
          validation.errors.forEach(err => {
            result.errors.push(`Mapping ${i + 1}: ${err}`)
          })
        }

        if (validation.warnings && validation.warnings.length > 0) {
          validation.warnings.forEach(warn => {
            result.warnings.push(`Mapping ${i + 1}: ${warn}`)
          })
        }

        // Check for duplicates
        const duplicateCheck = this.checkDuplicateMapping(mapping, mappings)
        if (duplicateCheck.isDuplicate) {
          result.isValid = false
          result.errors.push(`Mapping ${i + 1}: ${duplicateCheck.message}`)
        }
      }

      // Check for required LogRhythm fields
      const hasTimestamp = mappings.some(m => m.lrSchemaField === 'normal_msg_date' || m.lrSchemaField === 'log_date')
      if (!hasTimestamp) {
        result.warnings.push('No timestamp field (normal_msg_date) is mapped. This is highly recommended.')
      }

      return result
    } catch (error) {
      console.error('[MappingService] Error validating all mappings:', error)
      result.isValid = false
      result.errors.push(`Validation failed: ${error.message}`)
      return result
    }
  }

  /**
   * Create a new empty mapping
   *
   * @param {Array<Object>} availableJsonPaths - Available JSON paths
   * @returns {Object} New mapping object
   */
  static createEmptyMapping (availableJsonPaths = []) {
    try {
      return {
        id: `mapping-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        inputRule: availableJsonPaths.length > 0 ? availableJsonPaths[0].value : '',
        lrSchemaField: '',
        type: 'String',
        format: null,
        default: null,
        alternativeFields: [],
        fanoutParentElement: null
      }
    } catch (error) {
      console.error('[MappingService] Error creating empty mapping:', error)
      return {
        id: `mapping-${Date.now()}`,
        inputRule: '',
        lrSchemaField: '',
        type: 'String',
        format: null,
        default: null,
        alternativeFields: [],
        fanoutParentElement: null
      }
    }
  }

  /**
   * Export mappings to policy format
   *
   * @param {Array<Object>} mappings - Mappings to export
   * @returns {Array<Object>} Mappings in policy format
   */
  static exportToPolicyFormat (mappings) {
    try {
      if (!Array.isArray(mappings)) {
        return []
      }

      return mappings.map(mapping => ({
        inputRule: mapping.inputRule,
        LRSchemaField: mapping.lrSchemaField,
        type: mapping.type,
        default: mapping.default || null,
        alternativeFields: mapping.alternativeFields && mapping.alternativeFields.length > 0
          ? mapping.alternativeFields
          : null,
        format: mapping.format || null,
        FanoutParentElement: mapping.fanoutParentElement || null
      }))
    } catch (error) {
      console.error('[MappingService] Error exporting mappings:', error)
      return []
    }
  }

  /**
   * Build tree structure from sample data for JSON tree viewer
   * This creates a hierarchical tree with all fields for mapping visualization
   * Enhanced to support schema-only view with value aggregation
   *
   * @param {Object|Array} parsedData - The parsed JSON data
   * @param {Object} dataStructure - Optional pre-analyzed structure
   * @param {Object} options - Build options { schemaOnly: boolean, aggregateValues: boolean, multiLine: boolean }
   * @returns {Object} Tree structure with nodes
   */
  static buildTreeStructure (parsedData, dataStructure = null, options = {}) {
    try {
      if (!parsedData) {
        return null
      }

      // Default options
      const opts = {
        schemaOnly: true, // Show schema only (no values in tree)
        aggregateValues: true, // Collect aggregated values for tooltips
        multiLine: false, // Handle multi-line log parsing
        ...options
      }

      // If dataStructure is provided, enhance it with aggregated values
      if (dataStructure) {
        if (opts.aggregateValues) {
          return this._enhanceTreeWithAggregatedValues(dataStructure, parsedData)
        }
        return dataStructure
      }

      // Handle multi-line: if it's an array of objects, merge schemas across all
      if (opts.multiLine && Array.isArray(parsedData) && parsedData.length > 0) {
        return this._buildMergedSchemaTree(parsedData, opts)
      }

      // Build from parsedData with options
      return this._buildSchemaTree(parsedData, '$', 0, opts)
    } catch (error) {
      console.error('[MappingService] Error building tree structure:', error)
      return null
    }
  }

  /**
   * Recursively build tree structure from data
   *
   * @param {*} data - Current data node
   * @param {string} path - Current JSON path
   * @param {number} depth - Current depth
   * @returns {Object} Tree node
   * @private
   */
  static _buildTreeFromData (data, path = '$', depth = 0) {
    // Safety check for recursion depth
    if (depth > CONSTANTS.MAX_FIELD_DEPTH) {
      return null
    }

    const node = {
      path: path,
      type: this._getDataType(data),
      value: null,
      children: []
    }

    if (data === null) {
      node.type = 'null'
      node.value = 'null'
    } else if (Array.isArray(data)) {
      node.value = `Array[${data.length}]`

      // Add children from first array element
      if (data.length > 0) {
        const firstElement = data[0]
        if (typeof firstElement === 'object' && firstElement !== null) {
          for (const key in firstElement) {
            if (Object.prototype.hasOwnProperty.call(firstElement, key)) {
              const childPath = `${path}[*].${key}`
              const childNode = this._buildTreeFromData(firstElement[key], childPath, depth + 1)
              if (childNode) {
                childNode.key = key
                node.children.push(childNode)
              }
            }
          }
        } else {
          // Primitive array
          const childPath = `${path}[*]`
          const childNode = this._buildTreeFromData(firstElement, childPath, depth + 1)
          if (childNode) {
            node.children.push(childNode)
          }
        }
      }
    } else if (typeof data === 'object') {
      const keys = Object.keys(data)
      node.value = `Object{${keys.length}}`

      for (const key in data) {
        if (Object.prototype.hasOwnProperty.call(data, key)) {
          const childPath = path === '$' ? `$.${key}` : `${path}.${key}`
          const childNode = this._buildTreeFromData(data[key], childPath, depth + 1)
          if (childNode) {
            childNode.key = key
            node.children.push(childNode)
          }
        }
      }
    } else {
      // Primitive value
      node.value = data
    }

    return node
  }

  /**
   * Get data type for a value
   *
   * @param {*} data - The data to check
   * @returns {string} Type name
   * @private
   */
  static _getDataType (data) {
    if (data === null) return 'null'
    if (Array.isArray(data)) return 'array'
    if (typeof data === 'object') return 'object'
    if (typeof data === 'boolean') return 'boolean'
    if (typeof data === 'number') return 'number'
    if (typeof data === 'string') return 'string'
    return 'unknown'
  }

  /**
   * Build merged schema tree from multiple log objects (multi-line support)
   * Merges all unique fields from all log objects and aggregates their values
   *
   * @param {Array} logsArray - Array of log objects
   * @param {Object} options - Build options
   * @returns {Object} Merged tree structure
   * @private
   */
  static _buildMergedSchemaTree (logsArray, options = {}) {
    try {
      // Merge all schemas
      const mergedSchema = this._mergeObjectSchemas(logsArray)

      // Build root node
      const root = {
        path: '$',
        type: 'object',
        value: `Object{${Object.keys(mergedSchema).length}}`,
        children: [],
        aggregatedValues: []
      }

      // Build children from merged schema
      for (const key in mergedSchema) {
        if (Object.prototype.hasOwnProperty.call(mergedSchema, key)) {
          const childPath = `$.${key}`
          const childValues = this._collectValuesFromObjects(logsArray, key)

          // Determine type from first non-null value
          let childType = mergedSchema[key].type
          if (!childType) {
            const firstValue = childValues.find(v => v !== null && v !== undefined)
            childType = this._getDataType(firstValue)
          }

          const childNode = this._buildSchemaTreeNode(
            childType,
            childPath,
            key,
            1,
            childValues,
            options
          )

          if (childNode) {
            root.children.push(childNode)
          }
        }
      }

      return root
    } catch (error) {
      console.error('[MappingService] Error building merged schema tree:', error)
      return null
    }
  }

  /**
   * Build schema-only tree structure with value aggregation
   * Removes array indices and aggregates values from all instances
   *
   * @param {*} data - Current data node
   * @param {string} path - Current JSON path
   * @param {number} depth - Current depth
   * @param {Object} options - Build options
   * @returns {Object} Tree node
   * @private
   */
  static _buildSchemaTree (data, path = '$', depth = 0, options = {}) {
    // Safety check for recursion depth
    if (depth > CONSTANTS.MAX_FIELD_DEPTH) {
      return null
    }

    const node = {
      path: path,
      type: this._getDataType(data),
      value: null, // No value in schema view
      children: [],
      aggregatedValues: [] // Store aggregated values for tooltip
    }

    if (data === null) {
      node.type = 'null'
      node.aggregatedValues = ['null']
    } else if (Array.isArray(data)) {
      // Array handling
      node.value = `Array[${data.length}]`

      if (data.length > 0) {
        const firstElement = data[0]

        if (typeof firstElement === 'object' && firstElement !== null && !Array.isArray(firstElement)) {
          // Object array - build schema from all unique fields across all array elements
          const mergedSchema = this._mergeArrayObjectSchemas(data)

          for (const key in mergedSchema) {
            if (Object.prototype.hasOwnProperty.call(mergedSchema, key)) {
              // Use [*] notation instead of [0], [1], etc.
              const childPath = `${path}[*].${key}`
              const childValues = this._collectValuesFromArrayObjects(data, key)
              const childNode = this._buildSchemaTreeNode(mergedSchema[key].type, childPath, key, depth + 1, childValues, options)

              if (childNode) {
                node.children.push(childNode)
              }
            }
          }
        } else {
          // Primitive array - single node with aggregated values
          const childPath = `${path}[*]`
          const childValues = this._collectValuesFromPrimitiveArray(data)
          const childNode = {
            path: childPath,
            type: this._getDataType(firstElement),
            value: null,
            children: [],
            aggregatedValues: childValues
          }
          node.children.push(childNode)
        }
      }
    } else if (typeof data === 'object') {
      const keys = Object.keys(data)
      node.value = `Object{${keys.length}}`

      for (const key in data) {
        if (Object.prototype.hasOwnProperty.call(data, key)) {
          const childPath = path === '$' ? `$.${key}` : `${path}.${key}`
          const childValue = data[key]
          const childValues = [childValue]

          const childNode = this._buildSchemaTreeNode(
            this._getDataType(childValue),
            childPath,
            key,
            depth + 1,
            childValues,
            options
          )

          if (childNode) {
            node.children.push(childNode)
          }
        }
      }
    } else {
      // Primitive value
      if (options.aggregateValues) {
        node.aggregatedValues = [data]
      }
    }

    return node
  }

  /**
   * Build a schema tree node recursively
   *
   * @param {string} type - Data type
   * @param {string} path - JSON path
   * @param {string} key - Object key
   * @param {number} depth - Current depth
   * @param {Array} values - Collected values
   * @param {Object} options - Build options
   * @returns {Object} Tree node
   * @private
   */
  static _buildSchemaTreeNode (type, path, key, depth, values, options) {
    if (depth > CONSTANTS.MAX_FIELD_DEPTH) {
      return null
    }

    const node = {
      path: path,
      key: key,
      type: type,
      value: null,
      children: [],
      aggregatedValues: options.aggregateValues ? this._limitAggregatedValues(values) : []
    }

    // For arrays and objects, recursively build children
    if (type === 'array' && values.length > 0) {
      const firstArray = values.find(v => Array.isArray(v))
      if (firstArray && firstArray.length > 0) {
        const firstElement = firstArray[0]

        if (typeof firstElement === 'object' && firstElement !== null) {
          // Merge schemas from all arrays
          const allArrays = values.filter(v => Array.isArray(v))
          const mergedSchema = this._mergeMultipleArraySchemas(allArrays)

          for (const childKey in mergedSchema) {
            if (Object.prototype.hasOwnProperty.call(mergedSchema, childKey)) {
              const childPath = `${path}[*].${childKey}`
              const childValues = this._collectValuesFromMultipleArrays(allArrays, childKey)
              const childNode = this._buildSchemaTreeNode(
                mergedSchema[childKey].type,
                childPath,
                childKey,
                depth + 1,
                childValues,
                options
              )
              if (childNode) {
                node.children.push(childNode)
              }
            }
          }
        } else {
          // Primitive array
          const childPath = `${path}[*]`
          const childValues = this._collectValuesFromMultiplePrimitiveArrays(values)
          node.children.push({
            path: childPath,
            type: this._getDataType(firstElement),
            value: null,
            children: [],
            aggregatedValues: childValues
          })
        }
      }
      node.value = 'Array'
    } else if (type === 'object' && values.length > 0) {
      // Merge object schemas from all values
      const mergedSchema = this._mergeObjectSchemas(values)

      for (const childKey in mergedSchema) {
        if (Object.prototype.hasOwnProperty.call(mergedSchema, childKey)) {
          const childPath = `${path}.${childKey}`
          const childValues = this._collectValuesFromObjects(values, childKey)
          const childNode = this._buildSchemaTreeNode(
            mergedSchema[childKey].type,
            childPath,
            childKey,
            depth + 1,
            childValues,
            options
          )
          if (childNode) {
            node.children.push(childNode)
          }
        }
      }
      node.value = 'Object'
    }

    return node
  }

  /**
   * Merge schemas from all objects in an array to get unique fields
   *
   * @param {Array} arrayData - Array of objects
   * @returns {Object} Merged schema with all unique fields
   * @private
   */
  static _mergeArrayObjectSchemas (arrayData) {
    const schema = {}

    for (const obj of arrayData) {
      if (typeof obj === 'object' && obj !== null) {
        for (const key in obj) {
          if (Object.prototype.hasOwnProperty.call(obj, key)) {
            if (!schema[key]) {
              schema[key] = {
                type: this._getDataType(obj[key]),
                values: []
              }
            }
            schema[key].values.push(obj[key])
          }
        }
      }
    }

    return schema
  }

  /**
   * Merge schemas from multiple objects
   *
   * @param {Array} objects - Array of object values
   * @returns {Object} Merged schema
   * @private
   */
  static _mergeObjectSchemas (objects) {
    const schema = {}

    for (const obj of objects) {
      if (typeof obj === 'object' && obj !== null && !Array.isArray(obj)) {
        for (const key in obj) {
          if (Object.prototype.hasOwnProperty.call(obj, key)) {
            if (!schema[key]) {
              schema[key] = {
                type: this._getDataType(obj[key])
              }
            }
          }
        }
      }
    }

    return schema
  }

  /**
   * Merge schemas from multiple arrays
   *
   * @param {Array} arrays - Array of array values
   * @returns {Object} Merged schema
   * @private
   */
  static _mergeMultipleArraySchemas (arrays) {
    const schema = {}

    for (const arr of arrays) {
      if (Array.isArray(arr)) {
        const arrSchema = this._mergeArrayObjectSchemas(arr)
        for (const key in arrSchema) {
          if (Object.prototype.hasOwnProperty.call(arrSchema, key)) {
            if (!schema[key]) {
              schema[key] = arrSchema[key]
            }
          }
        }
      }
    }

    return schema
  }

  /**
   * Collect values for a specific key from all objects in an array
   *
   * @param {Array} arrayData - Array of objects
   * @param {string} key - Key to collect values for
   * @returns {Array} Collected values
   * @private
   */
  static _collectValuesFromArrayObjects (arrayData, key) {
    const values = []

    for (const obj of arrayData) {
      if (typeof obj === 'object' && obj !== null && key in obj) {
        values.push(obj[key])
      }
    }

    return this._limitAggregatedValues(values)
  }

  /**
   * Collect values from multiple arrays for a specific key
   *
   * @param {Array} arrays - Array of arrays
   * @param {string} key - Key to collect
   * @returns {Array} Collected values
   * @private
   */
  static _collectValuesFromMultipleArrays (arrays, key) {
    const values = []

    for (const arr of arrays) {
      if (Array.isArray(arr)) {
        for (const obj of arr) {
          if (typeof obj === 'object' && obj !== null && key in obj) {
            values.push(obj[key])
          }
        }
      }
    }

    return this._limitAggregatedValues(values)
  }

  /**
   * Collect values from objects for a specific key
   *
   * @param {Array} objects - Array of objects
   * @param {string} key - Key to collect
   * @returns {Array} Collected values
   * @private
   */
  static _collectValuesFromObjects (objects, key) {
    const values = []

    for (const obj of objects) {
      if (typeof obj === 'object' && obj !== null && key in obj) {
        values.push(obj[key])
      }
    }

    return this._limitAggregatedValues(values)
  }

  /**
   * Collect all values from a primitive array
   *
   * @param {Array} arrayData - Primitive array
   * @returns {Array} Collected values
   * @private
   */
  static _collectValuesFromPrimitiveArray (arrayData) {
    return this._limitAggregatedValues(arrayData)
  }

  /**
   * Collect values from multiple primitive arrays
   *
   * @param {Array} arrays - Array of arrays
   * @returns {Array} Collected values
   * @private
   */
  static _collectValuesFromMultiplePrimitiveArrays (arrays) {
    const values = []

    for (const arr of arrays) {
      if (Array.isArray(arr)) {
        values.push(...arr)
      }
    }

    return this._limitAggregatedValues(values)
  }

  /**
   * Limit aggregated values to unique values and max count
   *
   * @param {Array} values - Values to limit
   * @returns {Array} Limited unique values
   * @private
   */
  static _limitAggregatedValues (values) {
    try {
      // Remove null/undefined
      const filtered = values.filter(v => v !== null && v !== undefined)

      // Get unique values (serialize objects for comparison)
      const seen = new Set()
      const unique = []

      for (const value of filtered) {
        const key = typeof value === 'object' ? JSON.stringify(value) : String(value)
        if (!seen.has(key)) {
          seen.add(key)
          unique.push(value)
        }

        // Limit to 20 unique values
        if (unique.length >= 20) {
          break
        }
      }

      return unique
    } catch (error) {
      console.error('[MappingService] Error limiting aggregated values:', error)
      return values.slice(0, 20)
    }
  }

  /**
   * Enhance existing tree structure with aggregated values
   *
   * @param {Object} tree - Existing tree structure
   * @param {*} data - Data to aggregate from
   * @returns {Object} Enhanced tree
   * @private
   */
  static _enhanceTreeWithAggregatedValues (tree, data) {
    try {
      if (!tree || !data) {
        return tree
      }

      // Clone tree
      const enhancedTree = JSON.parse(JSON.stringify(tree))

      // Recursively enhance with values
      this._enhanceNodeWithValues(enhancedTree, data)

      return enhancedTree
    } catch (error) {
      console.error('[MappingService] Error enhancing tree with values:', error)
      return tree
    }
  }

  /**
   * Recursively enhance tree nodes with aggregated values
   *
   * @param {Object} node - Tree node
   * @param {*} data - Corresponding data
   * @private
   */
  static _enhanceNodeWithValues (node, data) {
    if (!node || !data) {
      return
    }

    // Initialize aggregatedValues if not present
    if (!node.aggregatedValues) {
      node.aggregatedValues = []
    }

    // Collect values based on node type
    if (node.type === 'array' && Array.isArray(data)) {
      // For array nodes, collect values from array elements
      if (node.children && node.children.length > 0) {
        for (const child of node.children) {
          if (child.key) {
            // Object array child
            const values = this._collectValuesFromArrayObjects(data, child.key)
            child.aggregatedValues = values
            // Recursively enhance children
            for (const obj of data) {
              if (typeof obj === 'object' && obj !== null && child.key in obj) {
                this._enhanceNodeWithValues(child, obj[child.key])
              }
            }
          } else {
            // Primitive array
            child.aggregatedValues = this._collectValuesFromPrimitiveArray(data)
          }
        }
      }
    } else if (node.type === 'object' && typeof data === 'object' && !Array.isArray(data)) {
      // For object nodes, enhance children
      if (node.children && node.children.length > 0) {
        for (const child of node.children) {
          if (child.key && child.key in data) {
            child.aggregatedValues = [data[child.key]]
            this._enhanceNodeWithValues(child, data[child.key])
          }
        }
      }
    } else {
      // Primitive value
      if (data !== null && data !== undefined) {
        node.aggregatedValues = [data]
      }
    }
  }

  /**
   * Generate smart suggestions for LogRhythm schema field based on JSON field name
   * Analyzes field name patterns to suggest the most appropriate LR field
   *
   * @param {string} jsonFieldName - The JSON field name (extracted from path)
   * @param {string} jsonPath - Full JSON path
   * @param {string} dataType - Data type of the field
   * @returns {Array<string>} Array of suggested LR field names (ordered by relevance)
   */
  static generateSmartSuggestions (jsonFieldName, jsonPath, dataType) {
    try {
      const suggestions = []

      if (!jsonFieldName) {
        return suggestions
      }

      const lowerName = jsonFieldName.toLowerCase()
      const lowerPath = jsonPath ? jsonPath.toLowerCase() : ''

      // DateTime field suggestions
      if (dataType === 'DateTime' || lowerName.includes('time') || lowerName.includes('date') ||
          lowerName === 'timestamp' || lowerName === 'datetime') {
        suggestions.push('normal_msg_date')
        if (lowerName.includes('log')) {
          suggestions.push('log_date')
        }
        return suggestions
      }

      // Network field suggestions - IP addresses
      if (lowerName.includes('sourceip') || lowerName.includes('src_ip') ||
          lowerName.includes('srcip') || lowerName === 'sip' ||
          (lowerPath.includes('source') && (lowerName === 'ip' || lowerName === 'address'))) {
        suggestions.push('srcip')
        return suggestions
      }

      if (lowerName.includes('destip') || lowerName.includes('dst_ip') ||
          lowerName.includes('dstip') || lowerName === 'dip' ||
          (lowerPath.includes('destination') && (lowerName === 'ip' || lowerName === 'address'))) {
        suggestions.push('dstip')
        return suggestions
      }

      // Network field suggestions - Ports
      if (lowerName.includes('sourceport') || lowerName.includes('src_port') ||
          lowerName.includes('srcport') || lowerName === 'sport' ||
          (lowerPath.includes('source') && lowerName === 'port')) {
        suggestions.push('srcport')
        return suggestions
      }

      if (lowerName.includes('destport') || lowerName.includes('dst_port') ||
          lowerName.includes('dstport') || lowerName === 'dport' ||
          (lowerPath.includes('destination') && lowerName === 'port')) {
        suggestions.push('dstport')
        return suggestions
      }

      // Network field suggestions - MAC addresses
      if (lowerName.includes('src_mac') || lowerName.includes('srcmac') ||
          (lowerPath.includes('source') && lowerName.includes('mac'))) {
        suggestions.push('src_mac')
        return suggestions
      }

      if (lowerName.includes('dst_mac') || lowerName.includes('dstmac') ||
          (lowerPath.includes('destination') && lowerName.includes('mac'))) {
        suggestions.push('dst_mac')
        return suggestions
      }

      // Identity field suggestions
      if (lowerName === 'user' || lowerName === 'username' ||
          lowerName === 'login' || lowerName === 'userid' ||
          lowerName === 'account' || lowerName === 'accountname') {
        suggestions.push('login')
        if (lowerPath.includes('source') || lowerName.includes('src')) {
          suggestions.unshift('login') // Keep as primary
        }
        return suggestions
      }

      if (lowerName === 'domain' || lowerName === 'fqdn' ||
          (lowerName === 'hostname' && lowerName.includes('domain'))) {
        suggestions.push('domain')
        return suggestions
      }

      if (lowerName === 'hostname' || lowerName === 'host' ||
          lowerName === 'computername' || lowerName === 'machine') {
        suggestions.push('hostname')
        return suggestions
      }

      if (lowerName.includes('sender') || lowerName === 'from') {
        suggestions.push('sender')
        return suggestions
      }

      if (lowerName.includes('recipient') || lowerName === 'to' || lowerName === 'rcpt') {
        suggestions.push('recipient')
        return suggestions
      }

      // Process field suggestions
      if (lowerName === 'processid' || lowerName === 'pid' || lowerName === 'process_id') {
        suggestions.push('process_id')
        return suggestions
      }

      if (lowerName === 'processname' || lowerName === 'process_name' ||
          lowerName === 'procname' || lowerName === 'imagename') {
        suggestions.push('process_name')
        return suggestions
      }

      if (lowerName === 'parentprocessid' || lowerName === 'ppid' ||
          lowerName === 'parent_process_id') {
        suggestions.push('parent_process_id')
        return suggestions
      }

      if (lowerName === 'parentprocessname' || lowerName === 'parent_process_name') {
        suggestions.push('parent_process_name')
        return suggestions
      }

      if (lowerName === 'command' || lowerName === 'commandline' ||
          lowerName === 'cmdline' || lowerName === 'cmd') {
        suggestions.push('command')
        return suggestions
      }

      // Security field suggestions
      if (lowerName.includes('hash') || lowerName === 'md5' ||
          lowerName === 'sha1' || lowerName === 'sha256' || lowerName === 'checksum') {
        suggestions.push('hash')
        return suggestions
      }

      if (lowerName === 'action' || lowerName === 'operation' || lowerName === 'event') {
        suggestions.push('action')
        return suggestions
      }

      if (lowerName === 'subject' || lowerName === 'actor') {
        suggestions.push('subject')
        return suggestions
      }

      if (lowerName === 'object' || lowerName === 'target' || lowerName === 'resource') {
        suggestions.push('object')
        return suggestions
      }

      if (lowerName === 'status' || lowerName === 'state' || lowerName === 'outcome') {
        suggestions.push('status')
        return suggestions
      }

      if (lowerName === 'result' || lowerName === 'resultcode' ||
          lowerName === 'result_code' || lowerName === 'returncode') {
        suggestions.push('result_code')
        return suggestions
      }

      // Content field suggestions
      if (lowerName === 'url' || lowerName === 'uri' || lowerName === 'link') {
        suggestions.push('url')
        return suggestions
      }

      if (lowerName === 'useragent' || lowerName === 'user_agent' ||
          lowerName === 'ua' || lowerName === 'browser') {
        suggestions.push('user_agent')
        return suggestions
      }

      if (lowerName.includes('session') || lowerName === 'sessionid' ||
          lowerName === 'session_id' || lowerName === 'sid') {
        suggestions.push('session_id')
        return suggestions
      }

      if (lowerName === 'message' || lowerName === 'msg' ||
          lowerName === 'description' || lowerName === 'text') {
        suggestions.push('message')
        return suggestions
      }

      if (lowerName.includes('vendor') && lowerName.includes('msg')) {
        suggestions.push('vendor_msg_id')
        return suggestions
      }

      return suggestions
    } catch (error) {
      console.error('[MappingService] Error generating smart suggestions:', error)
      return []
    }
  }

  /**
   * Find a tree node by JSON path
   * Used for "highlight in tree" functionality
   *
   * @param {Object} tree - Tree structure
   * @param {string} jsonPath - JSON path to find
   * @returns {Object|null} Found node or null
   */
  static findNodeByPath (tree, jsonPath) {
    try {
      if (!tree || !jsonPath) {
        return null
      }

      // Recursive search function
      const search = (node) => {
        if (!node) return null

        if (node.path === jsonPath) {
          return node
        }

        if (node.children && Array.isArray(node.children)) {
          for (const child of node.children) {
            const found = search(child)
            if (found) return found
          }
        }

        return null
      }

      return search(tree)
    } catch (error) {
      console.error('[MappingService] Error finding node by path:', error)
      return null
    }
  }

  /**
   * Get all parent paths for a given JSON path
   * Used for expanding tree to show a specific node
   *
   * @param {string} jsonPath - JSON path
   * @returns {Array<string>} Array of parent paths
   */
  static getParentPaths (jsonPath) {
    try {
      if (!jsonPath || jsonPath === '$') {
        return []
      }

      const paths = []
      const current = jsonPath

      // Remove array indices and build parent paths
      const parts = current.split(/\.|\[/).filter(p => p && !p.includes(']'))

      let path = '$'
      for (let i = 1; i < parts.length; i++) {
        path += `.${parts[i]}`
        paths.push(path)
      }

      return paths
    } catch (error) {
      console.error('[MappingService] Error getting parent paths:', error)
      return []
    }
  }

  /**
   * Extract field name from JSON path
   * Used for generating suggestions
   *
   * @param {string} jsonPath - JSON path (e.g., "$.user.name")
   * @returns {string} Field name (e.g., "name")
   */
  static extractFieldName (jsonPath) {
    try {
      if (!jsonPath || typeof jsonPath !== 'string') {
        return ''
      }

      // Remove $ prefix and array notation
      const cleaned = jsonPath.replace(/^\$\.?/, '').replace(/\[\*\]/g, '')

      // Get last segment
      const parts = cleaned.split('.')
      return parts[parts.length - 1] || ''
    } catch (error) {
      console.error('[MappingService] Error extracting field name:', error)
      return ''
    }
  }

  /**
   * Merge parsed stringified JSON fields into the tree structure
   * This replaces string nodes with their parsed JSON structure
   *
   * @param {Object} tree - The original tree structure
   * @param {Object} parsedFieldsMap - Map of field paths to their parsed JSON data
   * @param {Object|Array} originalData - The original sample data
   * @returns {Object} Enhanced tree with parsed JSON fields expanded
   */
  static mergeStringifiedJsonIntoTree (tree, parsedFieldsMap, originalData) {
    try {
      console.log('╔════════════════════════════════════════════════════════════════════════')
      console.log('║ [MappingService] mergeStringifiedJsonIntoTree - START')
      console.log('╠════════════════════════════════════════════════════════════════════════')
      console.log('║ parsedFieldsMap keys:', Object.keys(parsedFieldsMap || {}))
      console.log('║ parsedFieldsMap:', JSON.stringify(parsedFieldsMap, null, 2))
      console.log('║ tree exists:', !!tree)
      console.log('║ tree.path:', tree?.path)
      console.log('║ tree.children count:', tree?.children?.length || 0)
      console.log('╚════════════════════════════════════════════════════════════════════════')

      if (!tree || !parsedFieldsMap || Object.keys(parsedFieldsMap).length === 0) {
        console.log('[MappingService] No parsed fields to merge, returning original tree')
        return tree
      }

      // Log the entire tree structure for debugging
      console.log('╔════════════════════════════════════════════════════════════════════════')
      console.log('║ [MappingService] TREE STRUCTURE BEFORE MERGE:')
      console.log('╠════════════════════════════════════════════════════════════════════════')
      this._logTreeStructure(tree, 0)
      console.log('╚════════════════════════════════════════════════════════════════════════')

      // Clone the tree to avoid mutation
      const enhancedTree = JSON.parse(JSON.stringify(tree))

      // For each parsed field, find its node in the tree and expand it
      for (const [fieldPath, parsedData] of Object.entries(parsedFieldsMap)) {
        console.log('╔════════════════════════════════════════════════════════════════════════')
        console.log(`║ [MappingService] Processing parsed field: "${fieldPath}"`)
        console.log('╠════════════════════════════════════════════════════════════════════════')
        console.log('║ parsedData type:', typeof parsedData)
        console.log('║ parsedData:', JSON.stringify(parsedData, null, 2))
        console.log('╚════════════════════════════════════════════════════════════════════════')

        // Find the node in the tree
        console.log(`[MappingService] Calling _findNodeByPathInTree for "${fieldPath}"...`)
        const node = this._findNodeByPathInTree(enhancedTree, fieldPath)

        if (node) {
          console.log('╔════════════════════════════════════════════════════════════════════════')
          console.log(`║ [MappingService] ✓ FOUND NODE for ${fieldPath}`)
          console.log('╠════════════════════════════════════════════════════════════════════════')
          console.log('║ node.path:', node.path)
          console.log('║ node.type:', node.type)
          console.log('║ node.children count:', node.children?.length || 0)
          console.log('╚════════════════════════════════════════════════════════════════════════')

          // Build a subtree from the parsed data
          console.log('[MappingService] Building subtree from parsed data...')
          const parsedSubtree = this._buildSchemaTree(parsedData, fieldPath, 0, {
            schemaOnly: true,
            aggregateValues: true,
            multiLine: false
          })

          console.log('╔════════════════════════════════════════════════════════════════════════')
          console.log('║ [MappingService] Built Parsed Subtree:')
          console.log('╠════════════════════════════════════════════════════════════════════════')
          console.log('║ parsedSubtree exists:', !!parsedSubtree)
          console.log('║ parsedSubtree.type:', parsedSubtree?.type)
          console.log('║ parsedSubtree.children count:', parsedSubtree?.children?.length || 0)
          if (parsedSubtree && parsedSubtree.children) {
            console.log('║ parsedSubtree.children paths:')
            parsedSubtree.children.forEach((child, idx) => {
              console.log(`║   [${idx}] ${child.path} (${child.type})`)
            })
          }
          console.log('╚════════════════════════════════════════════════════════════════════════')

          // Replace the string node with the parsed subtree
          if (parsedSubtree && parsedSubtree.children) {
            // Add children from parsed JSON to this node
            node.children = parsedSubtree.children

            // Update node type to object if it was parsed successfully
            if (parsedSubtree.type === 'object' || parsedSubtree.type === 'array') {
              node.type = parsedSubtree.type
            }

            // Mark as expanded from stringified JSON
            node.isExpandedStringifiedJson = true

            console.log('╔════════════════════════════════════════════════════════════════════════')
            console.log(`║ [MappingService] ✓ Successfully expanded ${fieldPath}`)
            console.log('║ New children count:', node.children.length)
            console.log('║ New type:', node.type)
            console.log('╚════════════════════════════════════════════════════════════════════════')
          } else {
            console.log('╔════════════════════════════════════════════════════════════════════════')
            console.log(`║ [MappingService] ✗ Failed to build subtree for ${fieldPath}`)
            console.log('║ parsedSubtree is null or has no children')
            console.log('╚════════════════════════════════════════════════════════════════════════')
          }
        } else {
          console.log('╔════════════════════════════════════════════════════════════════════════')
          console.log(`║ [MappingService] ✗ Could not find node for path: ${fieldPath}`)
          console.log('║ This is the ROOT CAUSE of the issue!')
          console.log('╚════════════════════════════════════════════════════════════════════════')
        }
      }

      console.log('╔════════════════════════════════════════════════════════════════════════')
      console.log('║ [MappingService] TREE STRUCTURE AFTER MERGE:')
      console.log('╠════════════════════════════════════════════════════════════════════════')
      this._logTreeStructure(enhancedTree, 0)
      console.log('╚════════════════════════════════════════════════════════════════════════')

      return enhancedTree
    } catch (error) {
      console.error('[MappingService] Error merging stringified JSON into tree:', error)
      return tree
    }
  }

  /**
   * Helper method to log tree structure recursively
   * @private
   */
  static _logTreeStructure (node, depth = 0) {
    if (!node) return
    const indent = '  '.repeat(depth)
    console.log(`${indent}${node.path} (${node.type}) [children: ${node.children?.length || 0}]`)
    if (node.children && Array.isArray(node.children) && depth < 3) {
      node.children.forEach(child => this._logTreeStructure(child, depth + 1))
    }
  }

  /**
   * Resolve JSON path based on fanout array selections
   * Converts absolute paths to relative paths when within fanout arrays
   *
   * @param {string} absolutePath - The full JSONPath (e.g., $.teamMembers[*].contact.tasks[*].title)
   * @param {Array<string>} fanoutArrays - Array of fanout parent paths from Step 3
   * @returns {Object} { jsonPath, fanoutParent }
   *
   * @example
   * // No fanout
   * resolvePathForFanout('$.teamMembers[*].name', [])
   * // => { jsonPath: '$.teamMembers[*].name', fanoutParent: null }
   *
   * // Single fanout on teamMembers
   * resolvePathForFanout('$.teamMembers[*].name', ['$.teamMembers'])
   * // => { jsonPath: '$.name', fanoutParent: '$.teamMembers' }
   *
   * // Nested fanout on teamMembers and tasks
   * resolvePathForFanout('$.teamMembers[*].contact.tasks[*].title', ['$.teamMembers', '$.teamMembers[*].contact.tasks'])
   * // => { jsonPath: '$.title', fanoutParent: '$.teamMembers[*].contact.tasks' }
   */
  static resolvePathForFanout (absolutePath, fanoutArrays) {
    try {
      console.log('╔═══════════════════════════════════════════════════════════════════════')
      console.log('║ [MappingService] resolvePathForFanout - START')
      console.log('╠═══════════════════════════════════════════════════════════════════════')
      console.log('║ absolutePath:', absolutePath)
      console.log('║ fanoutArrays:', JSON.stringify(fanoutArrays))
      console.log('╚═══════════════════════════════════════════════════════════════════════')

      // If no fanout arrays, return absolute path
      if (!fanoutArrays || fanoutArrays.length === 0) {
        console.log('[MappingService] No fanout arrays - returning absolute path')
        return {
          jsonPath: absolutePath,
          fanoutParent: null
        }
      }

      // Normalize path for comparison (handle [*] vs [0] notation)
      const normalizePath = (path) => {
        if (!path) return ''
        // Replace numeric indices [0], [1], [2] with [*]
        // Also handle paths without brackets
        let normalized = path
          .replace(/\[(\d+)\]/g, '[*]') // Convert [0], [1], [2] to [*]
          .replace(/\[\*\]/g, '[*]') // Ensure consistent [*] format

        // Ensure $ prefix for consistency
        if (!normalized.startsWith('$')) {
          normalized = '$.' + normalized
        }

        return normalized
      }

      const normalizedPath = normalizePath(absolutePath)
      console.log('[MappingService] normalizedPath:', normalizedPath)

      // Sort fanout arrays by depth (deepest first) to find nearest parent
      const sortedFanouts = [...fanoutArrays]
        .map(f => normalizePath(f))
        .filter(f => f) // Remove empty strings
        .sort((a, b) => {
          // Count depth by number of dots and brackets
          const depthA = (a.match(/\./g) || []).length + (a.match(/\[/g) || []).length
          const depthB = (b.match(/\./g) || []).length + (b.match(/\[/g) || []).length
          return depthB - depthA // Deepest first
        })

      console.log('[MappingService] sortedFanouts:', JSON.stringify(sortedFanouts))

      // Find the nearest fanout parent that contains this path
      let nearestFanout = null

      for (let i = 0; i < sortedFanouts.length; i++) {
        const normalizedFanout = sortedFanouts[i]

        // Build the fanout prefix to check if path is within this fanout
        // The fanout might be "$.teamMembers" or "$.teamMembers[*]"
        // We need to check if the path starts with this fanout

        let fanoutPrefix = normalizedFanout
        // Remove trailing [*] for prefix comparison
        if (fanoutPrefix.endsWith('[*]')) {
          fanoutPrefix = fanoutPrefix.substring(0, fanoutPrefix.length - 3)
        }

        console.log(`[MappingService] Checking fanout: "${normalizedFanout}", prefix: "${fanoutPrefix}"`)
        console.log(`[MappingService] Does "${normalizedPath}" start with "${fanoutPrefix}"?`)

        // Check if path is within this fanout
        // Path must start with fanout prefix followed by . or [
        if (normalizedPath === fanoutPrefix ||
            normalizedPath === normalizedFanout ||
            normalizedPath.startsWith(fanoutPrefix + '.') ||
            normalizedPath.startsWith(fanoutPrefix + '[')) {
          nearestFanout = normalizedFanout // Use the normalized version with [*]
          console.log(`[MappingService] ✓ MATCH FOUND! fanout: "${normalizedFanout}" matches path: "${normalizedPath}"`)
          break
        }
      }

      // If no fanout parent found, return absolute path
      if (!nearestFanout) {
        console.log('[MappingService] No matching fanout parent - returning absolute path')
        return {
          jsonPath: absolutePath,
          fanoutParent: null
        }
      }

      // Make path relative to fanout parent
      // Remove the fanout parent prefix and replace with $
      let relativePath = normalizedPath
      let fanoutPrefix = nearestFanout

      // Remove trailing [*] for prefix removal
      if (fanoutPrefix.endsWith('[*]')) {
        fanoutPrefix = fanoutPrefix.substring(0, fanoutPrefix.length - 3)
      }

      console.log('[MappingService] Making path relative')
      console.log('[MappingService] fanoutPrefix for removal:', fanoutPrefix)
      console.log('[MappingService] normalizedPath:', normalizedPath)

      if (normalizedPath.startsWith(fanoutPrefix + '.')) {
        // Path is deeper than fanout - make it relative
        // e.g., "$.teamMembers[*].contact.tasks[*].title" with fanout "$.teamMembers[*]"
        // becomes "$.contact.tasks[*].title"
        relativePath = '$' + normalizedPath.substring(fanoutPrefix.length)
        console.log('[MappingService] Relative path (deeper):', relativePath)
      } else if (normalizedPath.startsWith(fanoutPrefix + '[')) {
        // Path continues with array notation after fanout
        // e.g., "$.teamMembers[*].tasks" with fanout "$.teamMembers"
        // becomes "$[*].tasks" then cleaned to "$.tasks"
        const afterPrefix = normalizedPath.substring(fanoutPrefix.length)
        if (afterPrefix.startsWith('[*].')) {
          relativePath = '$.' + afterPrefix.substring(4) // Skip [*].
        } else if (afterPrefix === '[*]') {
          relativePath = '$'
        } else {
          relativePath = '$' + afterPrefix
        }
        console.log('[MappingService] Relative path (array notation):', relativePath)
      } else if (normalizedPath === fanoutPrefix || normalizedPath === fanoutPrefix + '[*]') {
        // Path is exactly the fanout array itself
        relativePath = '$'
        console.log('[MappingService] Relative path (exact match):', relativePath)
      }

      // Clean up path
      relativePath = relativePath.replace(/^\$\.\./, '$.') // Fix $.. to $.
      relativePath = relativePath.replace(/\.\[/g, '[') // Fix .[*] to [*]

      console.log('[MappingService] Final relative path after cleanup:', relativePath)

      // Ensure fanout parent has [*] notation at the end
      let fanoutParentResult = nearestFanout
      if (!fanoutParentResult.endsWith('[*]') && !fanoutParentResult.endsWith(']')) {
        // If fanout doesn't end with array notation, add it
        fanoutParentResult = fanoutParentResult + '[*]'
        console.log('[MappingService] Added [*] to fanout parent:', fanoutParentResult)
      }

      console.log('╔═══════════════════════════════════════════════════════════════════════')
      console.log('║ [MappingService] resolvePathForFanout - RESULT')
      console.log('╠═══════════════════════════════════════════════════════════════════════')
      console.log('║ jsonPath:', relativePath)
      console.log('║ fanoutParent:', fanoutParentResult)
      console.log('╚═══════════════════════════════════════════════════════════════════════')

      return {
        jsonPath: relativePath,
        fanoutParent: fanoutParentResult
      }
    } catch (error) {
      console.error('[MappingService] Error in resolvePathForFanout:', error)
      // Return original path on error
      return {
        jsonPath: absolutePath,
        fanoutParent: null
      }
    }
  }

  /**
   * Validate that fanout parent is in the fanout arrays list
   *
   * @param {string} fanoutParent - The fanout parent element to validate
   * @param {Array<string>} fanoutArrays - Array of valid fanout arrays from Step 3
   * @returns {boolean} True if valid or no fanout parent, false otherwise
   */
  static validateFanoutParentElement (fanoutParent, fanoutArrays) {
    try {
      // No fanout parent is valid
      if (!fanoutParent) {
        return true
      }

      // No fanout arrays means fanout parent should not be set
      if (!fanoutArrays || fanoutArrays.length === 0) {
        return false
      }

      console.log('[MappingService] validateFanoutParentElement - START')
      console.log('  fanoutParent:', fanoutParent)
      console.log('  fanoutArrays:', fanoutArrays)

      // Normalize both for comparison
      const normalizePath = (path) => {
        if (!path) return ''
        return path
          .replace(/\[(\d+)\]/g, '[*]') // Normalize array indices
          .replace(/\[\*\]$/, '') // Remove trailing [*]
          .replace(/^\$\./, '') // Remove $. prefix if present
          .replace(/^\$/, '') // Remove $ prefix if present alone
      }

      const normalized = normalizePath(fanoutParent)
      console.log('  normalizedParent:', normalized)

      // Check if this fanout parent exists in the fanout arrays
      const isValid = fanoutArrays.some(f => {
        const normalizedFanout = normalizePath(f)
        console.log(`    Comparing: "${normalized}" === "${normalizedFanout}"?`, normalized === normalizedFanout)
        return normalizedFanout === normalized
      })

      console.log('[MappingService] validateFanoutParentElement - RESULT:', isValid)
      return isValid
    } catch (error) {
      console.error('[MappingService] Error validating fanout parent:', error)
      return false
    }
  }

  /**
   * Find a node in the tree by its path
   *
   * @param {Object} tree - The tree structure
   * @param {string} targetPath - The path to find
   * @returns {Object|null} The found node or null
   * @private
   */
  static _findNodeByPathInTree (tree, targetPath) {
    if (!tree || !targetPath) {
      console.log('[MappingService] _findNodeByPathInTree: Invalid parameters', { tree: !!tree, targetPath })
      return null
    }

    console.log(`[MappingService] _findNodeByPathInTree: Searching for "${targetPath}"`)
    console.log(`[MappingService] _findNodeByPathInTree: Current node path: "${tree.path}"`)

    // Try multiple normalization strategies to find matches
    const normalizeForComparison = (path) => {
      if (!path) return ''
      return path
        .replace(/^\$\.?/, '') // Remove $ prefix
        .replace(/\[\d+\]/g, '') // Remove numeric array indices like [0], [1], [2]
        .replace(/\[\*\]/g, '') // Remove [*] array notation
        .replace(/^\./, '') // Remove leading dot if present
        .trim()
        .toLowerCase() // *** CASE-INSENSITIVE: Convert to lowercase for comparison ***
    }

    const normalizedTarget = normalizeForComparison(targetPath)
    const normalizedNodePath = normalizeForComparison(tree.path)

    console.log(`[MappingService] _findNodeByPathInTree: Normalized target: "${normalizedTarget}"`)
    console.log(`[MappingService] _findNodeByPathInTree: Normalized node: "${normalizedNodePath}"`)

    // Try exact match first (case-insensitive)
    if (tree.path.toLowerCase() === targetPath.toLowerCase()) {
      console.log('[MappingService] _findNodeByPathInTree: ✓ EXACT MATCH FOUND (case-insensitive)!')
      return tree
    }

    // Try normalized match (already case-insensitive due to toLowerCase in normalization)
    if (normalizedNodePath === normalizedTarget) {
      console.log('[MappingService] _findNodeByPathInTree: ✓ NORMALIZED MATCH FOUND (case-insensitive)!')
      return tree
    }

    // Try with $ prefix added to target (case-insensitive)
    if (tree.path.toLowerCase() === `$.${normalizedTarget}`.toLowerCase()) {
      console.log('[MappingService] _findNodeByPathInTree: ✓ MATCH WITH $ PREFIX (case-insensitive)!')
      return tree
    }

    // Try without $ prefix on both (case-insensitive)
    if (tree.path.replace(/^\$\.?/, '').toLowerCase() === normalizedTarget) {
      console.log('[MappingService] _findNodeByPathInTree: ✓ MATCH WITHOUT $ PREFIX (case-insensitive)!')
      return tree
    }

    // Recursively search children
    if (tree.children && Array.isArray(tree.children)) {
      console.log(`[MappingService] _findNodeByPathInTree: Searching ${tree.children.length} children...`)
      for (let i = 0; i < tree.children.length; i++) {
        const child = tree.children[i]
        console.log(`[MappingService] _findNodeByPathInTree: Checking child ${i}: "${child.path}"`)
        const found = this._findNodeByPathInTree(child, targetPath)
        if (found) {
          console.log(`[MappingService] _findNodeByPathInTree: ✓ FOUND IN CHILD ${i}!`)
          return found
        }
      }
    }

    console.log('[MappingService] _findNodeByPathInTree: ✗ Not found in this branch')
    return null
  }

  // ============================================================================
  // OPERATIONS & FORMATTERS SUPPORT
  // ============================================================================

  /**
   * Validate operation syntax in inputRule
   * Checks if the operation syntax is valid and parameters are correct
   *
   * @param {string} inputRule - The inputRule that may contain an operation
   * @returns {Object} Validation result { isValid, errors, warnings }
   */
  static validateOperationSyntax (inputRule) {
    const result = {
      isValid: true,
      errors: [],
      warnings: []
    }

    try {
      if (!inputRule || typeof inputRule !== 'string') {
        result.warnings.push('No input rule provided')
        return result
      }

      // Import parser utilities
      const { parseOperationFromInputRule } = require('../../utils/operationParser')
      const { validateRegexPattern, validateCaptureGroup } = require('../../utils/operationParser')

      // Parse the operation
      const parsed = parseOperationFromInputRule(inputRule)

      // If no operation, just validate as JSON path
      if (!parsed.type) {
        // Basic JSON path validation
        if (!inputRule.startsWith('$')) {
          result.warnings.push('JSON path should start with $')
        }
        return result
      }

      // Validate based on operation type
      if (parsed.type === 'REGEX') {
        // Validate regex pattern
        if (!parsed.parameters.pattern) {
          result.isValid = false
          result.errors.push('REGEX operation requires a pattern parameter')
          return result
        }

        const patternValidation = validateRegexPattern(parsed.parameters.pattern)
        if (!patternValidation.isValid) {
          result.isValid = false
          result.errors.push(`Invalid regex pattern: ${patternValidation.error}`)
          return result
        }

        // Validate capture group
        if (parsed.parameters.captureGroup === undefined) {
          result.isValid = false
          result.errors.push('REGEX operation requires a captureGroup parameter')
          return result
        }

        const groupValidation = validateCaptureGroup(
          parsed.parameters.pattern,
          parsed.parameters.captureGroup
        )

        if (!groupValidation.isValid) {
          result.isValid = false
          result.errors.push(groupValidation.error)
        }
      } else if (parsed.type === 'LookUp' || parsed.type === 'LookUpStartsWith') {
        // Validate table name
        if (!parsed.parameters.tableName) {
          result.isValid = false
          result.errors.push(`${parsed.type} operation requires a tableName parameter`)
          return result
        }

        // Note: Table existence validation would require backend API call
        result.warnings.push(`Table "${parsed.parameters.tableName}" existence not verified`)
      } else if (parsed.type === 'PREFIX') {
        // Validate prefix
        if (parsed.parameters.prefix === undefined || parsed.parameters.prefix === null) {
          result.isValid = false
          result.errors.push('PREFIX operation requires a prefix parameter')
          return result
        }

        if (parsed.parameters.prefix === '') {
          result.warnings.push('PREFIX is empty - this will have no effect')
        }
      }

      return result
    } catch (error) {
      console.error('[MappingService] Error validating operation syntax:', error)
      result.isValid = false
      result.errors.push(`Operation validation failed: ${error.message}`)
      return result
    }
  }

  /**
   * Test operation on sample data
   * Executes the operation against sample data to show preview
   *
   * @param {string} inputRule - The inputRule with operation
   * @param {*} sampleValue - Sample value to test on
   * @returns {Object} Test result { success, output, error }
   */
  static testOperation (inputRule, sampleValue) {
    try {
      if (!inputRule) {
        return {
          success: false,
          output: null,
          error: 'No input rule provided'
        }
      }

      // Import parser
      const { parseOperationFromInputRule } = require('../../utils/operationParser')

      // Parse the operation
      const parsed = parseOperationFromInputRule(inputRule)

      // If no operation, return the sample value as-is
      if (!parsed.type) {
        return {
          success: true,
          output: sampleValue,
          error: null
        }
      }

      // Execute operation based on type
      if (parsed.type === 'REGEX') {
        return this._testRegexOperation(parsed.parameters, sampleValue)
      } else if (parsed.type === 'LookUp') {
        return this._testLookupOperation(parsed.parameters, sampleValue, false)
      } else if (parsed.type === 'LookUpStartsWith') {
        return this._testLookupOperation(parsed.parameters, sampleValue, true)
      } else if (parsed.type === 'PREFIX') {
        return this._testPrefixOperation(parsed.parameters, sampleValue)
      }

      return {
        success: false,
        output: null,
        error: `Unknown operation type: ${parsed.type}`
      }
    } catch (error) {
      console.error('[MappingService] Error testing operation:', error)
      return {
        success: false,
        output: null,
        error: error.message
      }
    }
  }

  /**
   * Test REGEX operation
   * @private
   */
  static _testRegexOperation (parameters, sampleValue) {
    try {
      const { pattern, captureGroup } = parameters

      // Extract pattern without slashes
      const patternContent = pattern.slice(1, -1)
      const regex = new RegExp(patternContent)

      // Convert sample value to string
      const strValue = String(sampleValue || '')

      // Test regex
      const match = strValue.match(regex)

      if (!match) {
        return {
          success: false,
          output: null,
          error: 'Regex pattern did not match the sample value'
        }
      }

      // Extract capture group
      if (captureGroup >= match.length) {
        return {
          success: false,
          output: null,
          error: `Capture group ${captureGroup} not found (pattern has ${match.length - 1} groups)`
        }
      }

      const extracted = match[captureGroup]

      return {
        success: true,
        output: extracted,
        error: null
      }
    } catch (error) {
      return {
        success: false,
        output: null,
        error: `Regex execution failed: ${error.message}`
      }
    }
  }

  /**
   * Test LookUp operation
   * @private
   */
  static _testLookupOperation (parameters, sampleValue, startsWith = false) {
    try {
      const { tableName } = parameters

      // Mock lookup implementation
      // In production, this would query an actual lookup table
      const mockTables = {
        HTTP_STATUS_CODES: {
          200: 'OK',
          201: 'Created',
          400: 'Bad Request',
          401: 'Unauthorized',
          403: 'Forbidden',
          404: 'Not Found',
          500: 'Internal Server Error'
        },
        SYSLOG_SEVERITY: {
          0: 'Emergency',
          1: 'Alert',
          2: 'Critical',
          3: 'Error',
          4: 'Warning',
          5: 'Notice',
          6: 'Informational',
          7: 'Debug'
        }
      }

      const table = mockTables[tableName]

      if (!table) {
        return {
          success: false,
          output: null,
          error: `Lookup table "${tableName}" not available in test mode`
        }
      }

      const key = String(sampleValue || '')

      if (startsWith) {
        // Find first entry that starts with the key
        const entry = Object.entries(table).find(([k]) => k.startsWith(key))
        if (entry) {
          return {
            success: true,
            output: entry[1],
            error: null
          }
        }
      } else {
        // Exact lookup
        const value = table[key]
        if (value !== undefined) {
          return {
            success: true,
            output: value,
            error: null
          }
        }
      }

      return {
        success: false,
        output: null,
        error: `No matching entry found for "${key}" in table "${tableName}"`
      }
    } catch (error) {
      return {
        success: false,
        output: null,
        error: `Lookup failed: ${error.message}`
      }
    }
  }

  /**
   * Test PREFIX operation
   * @private
   */
  static _testPrefixOperation (parameters, sampleValue) {
    try {
      const { prefix } = parameters

      if (sampleValue === null || sampleValue === undefined) {
        return {
          success: true,
          output: prefix,
          error: null
        }
      }

      const result = prefix + String(sampleValue)

      return {
        success: true,
        output: result,
        error: null
      }
    } catch (error) {
      return {
        success: false,
        output: null,
        error: `Prefix operation failed: ${error.message}`
      }
    }
  }
}

export default {
  MappingService
}
