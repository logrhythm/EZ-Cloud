/**
 * Schema Rule Service for JSON Policy Builder Wizard
 * Handles business logic for Step 3: Schema Rule Configuration
 * - Convert to JSON: Identifies and processes stringified JSON fields
 * - Fanout: Identifies array fields and builds parent path relationships
 */

import { DataProcessor } from './dataProcessingService'

/**
 * SchemaRuleService class for wizard Step 3
 * Provides methods for schema rule generation and analysis
 */
export class SchemaRuleService {
  /**
   * Analyze parsed data to find fields that should be converted to JSON
   * @param {Object|Array} parsedData - The parsed JSON data from Step 2
   * @returns {Array} List of field paths that contain stringified JSON
   */
  static findConvertToJsonCandidates (parsedData) {
    if (!parsedData) {
      return []
    }

    // Use DataProcessor's existing findStringifiedJsonFields method
    return DataProcessor.findStringifiedJsonFields(parsedData)
  }

  /**
   * Analyze parsed data to find array fields for fanout processing
   * @param {Object|Array} parsedData - The parsed JSON data from Step 2
   * @param {Object} dataStructure - The analyzed structure from DataProcessor
   * @returns {Array} List of array field objects with path and metadata
   */
  static findFanoutCandidates (parsedData, dataStructure) {
    if (!dataStructure) {
      console.log('[findFanoutCandidates] No dataStructure provided')
      return []
    }

    console.log('[findFanoutCandidates] dataStructure:', dataStructure)

    // Find all array fields in the structure
    const arrayPaths = DataProcessor.findArrayFields(dataStructure)
    console.log('[findFanoutCandidates] arrayPaths returned:', arrayPaths)

    // Build array field objects with metadata
    const arrayFields = []

    for (const path of arrayPaths) {
      console.log('[findFanoutCandidates] Analyzing path:', path)
      const arrayInfo = this._analyzeArrayField(path, dataStructure)
      console.log('[findFanoutCandidates] arrayInfo for', path, ':', arrayInfo)
      if (arrayInfo) {
        // Convert path to JsonTreeViewer format (remove $ prefix)
        const viewerPath = arrayInfo.path.replace(/^\$\.?/, '')
        arrayFields.push({
          ...arrayInfo,
          path: viewerPath,
          // Also convert parentPath if it exists
          parentPath: arrayInfo.parentPath ? arrayInfo.parentPath.replace(/^\$\.?/, '') : null
        })
        console.log('[findFanoutCandidates] Converted path for viewer:', viewerPath)
      }
    }

    console.log('[findFanoutCandidates] Final arrayFields:', arrayFields)
    return arrayFields
  }

  /**
   * Analyze an array field to extract metadata
   * @param {string} path - JSONPath to the array field
   * @param {Object} dataStructure - The analyzed structure from DataProcessor
   * @returns {Object} Array field metadata
   * @private
   */
  static _analyzeArrayField (path, dataStructure) {
    // Find the node in the structure that matches the path
    const node = this._findNodeByPath(path, dataStructure)

    if (!node || node.type !== 'array') {
      return null
    }

    return {
      path,
      isHomogeneous: node.isHomogeneous || false,
      elementType: node.elementType || 'unknown',
      sampleSize: node.children ? node.children.length : 0,
      parentPath: this._extractParentPath(path)
    }
  }

  /**
   * Find a node in the data structure by its path
   * @param {string} targetPath - The path to find
   * @param {Object} structure - The data structure to search
   * @returns {Object|null} The matching node or null
   * @private
   */
  static _findNodeByPath (targetPath, structure) {
    if (!structure || !targetPath) {
      console.log('[_findNodeByPath] Invalid input - targetPath:', targetPath, 'structure:', structure)
      return null
    }

    // Normalize both paths for comparison (replace all array indices with [0])
    const normalizedTarget = targetPath.replace(/\[(\d+)\]/g, '[0]')
    const normalizedStructure = structure.path ? structure.path.replace(/\[(\d+)\]/g, '[0]') : ''

    // If this is the target node (compare normalized paths)
    if (normalizedStructure === normalizedTarget) {
      console.log('[_findNodeByPath] Found match! targetPath:', targetPath, '-> structure.path:', structure.path)
      return structure
    }

    // Recursively search children
    if (structure.children && Array.isArray(structure.children)) {
      for (const child of structure.children) {
        const found = this._findNodeByPath(targetPath, child)
        if (found) {
          return found
        }
      }
    }

    return null
  }

  /**
   * Extract parent path from a JSONPath string
   * @param {string} path - JSONPath string
   * @returns {string|null} Parent path or null if at root
   * @private
   */
  static _extractParentPath (path) {
    if (!path || path === '$') {
      return null
    }

    // Find the last dot or bracket
    const lastDot = path.lastIndexOf('.')
    const lastBracket = path.lastIndexOf('[')

    // Determine which comes last
    const lastSeparator = Math.max(lastDot, lastBracket)

    if (lastSeparator === -1) {
      // No parent (this is a root-level field)
      return null
    }

    // If last separator is a bracket, go back to find the field name
    if (lastBracket > lastDot) {
      // Return up to the bracket (exclude the bracket itself)
      return path.substring(0, lastBracket)
    }

    // Return up to the last dot
    return path.substring(0, lastDot)
  }

  /**
   * Build the schema rule childfanouts structure based on selected arrays
   * @param {Array} selectedArrayPaths - Array of selected array field paths
   * @param {Array} allArrayFields - All available array field metadata
   * @returns {Array} Childfanouts array structure for policy
   */
  static buildChildFanouts (selectedArrayPaths, allArrayFields) {
    const childfanouts = []

    // Create a map of paths to field metadata for quick lookup
    const fieldMap = {}
    for (const field of allArrayFields) {
      fieldMap[field.path] = field
    }

    // Process each selected array path
    for (const path of selectedArrayPaths) {
      const field = fieldMap[path]
      if (!field) {
        console.warn(`Array field not found in metadata: ${path}`)
        continue
      }

      // Determine the parent path
      let parentpath = null

      // Check if this array is nested within another selected array
      for (const otherPath of selectedArrayPaths) {
        if (otherPath !== path && path.startsWith(otherPath)) {
          // This array is nested within another selected array
          // Set parentpath to the immediate parent array that's selected
          if (!parentpath || otherPath.length > parentpath.length) {
            parentpath = otherPath
          }
        }
      }

      // Convert path to relative path if parent exists
      let fieldPath = path
      if (parentpath) {
        // Remove parent path prefix to make it relative
        // For example: $.departments[*].teams[*] with parent $.departments[*]
        // should become $.teams[*]
        fieldPath = '$' + path.substring(parentpath.length)
      }

      // Add [*] to indicate array fanout if not already present
      if (!fieldPath.endsWith('[*]') && !fieldPath.includes('[*]')) {
        // Find where to add [*]
        // If path ends with array index like [0], replace with [*]
        if (fieldPath.match(/\[\d+\]$/)) {
          fieldPath = fieldPath.replace(/\[\d+\]$/, '[*]')
        } else {
          // Otherwise append [*]
          fieldPath += '[*]'
        }
      }

      // Similarly process parent path
      if (parentpath) {
        if (!parentpath.endsWith('[*]') && !parentpath.includes('[*]')) {
          if (parentpath.match(/\[\d+\]$/)) {
            parentpath = parentpath.replace(/\[\d+\]$/, '[*]')
          } else {
            parentpath += '[*]'
          }
        }
      }

      childfanouts.push({
        field: fieldPath,
        parentpath: parentpath
      })
    }

    return childfanouts
  }

  /**
   * Generate the complete schema rule object for the policy
   * @param {Array} convertToJsonFields - Selected fields to convert to JSON
   * @param {Array} childfanouts - Built childfanouts array
   * @returns {Object} Complete schema rule object
   */
  static generateSchemaRule (convertToJsonFields, childfanouts) {
    const schemaRule = {}

    // Add ConvertoJson if there are selected fields
    if (convertToJsonFields && convertToJsonFields.length > 0) {
      schemaRule.ConvertoJson = convertToJsonFields
    }

    // Add childfanouts if there are selected arrays
    if (childfanouts && childfanouts.length > 0) {
      schemaRule.childfanouts = childfanouts
    }

    return schemaRule
  }

  /**
   * Validate Step 3 selections
   * @param {Object} schemaRules - Schema rules from store
   * @returns {Object} Validation result with isValid and errors
   */
  static validateSchemaRules (schemaRules) {
    const result = {
      isValid: true,
      errors: [],
      warnings: []
    }

    // Step 3 is optional, so it's valid even with no selections
    // However, we can add warnings if no selections are made

    if (!schemaRules) {
      result.warnings.push('No schema rules configured')
      return result
    }

    const hasConvertToJson = schemaRules.convertToJson && schemaRules.convertToJson.length > 0
    const hasFanout = schemaRules.fanout && schemaRules.fanout.length > 0

    if (!hasConvertToJson && !hasFanout) {
      result.warnings.push('No schema rules configured. This step can be skipped if not needed.')
    }

    // Validate Convert to JSON fields
    if (hasConvertToJson) {
      for (const field of schemaRules.convertToJson) {
        if (!this._isValidJsonPath(field)) {
          result.isValid = false
          result.errors.push(`Invalid JSONPath format: ${field}`)
        }
      }
    }

    // Validate Fanout fields
    if (hasFanout) {
      for (const field of schemaRules.fanout) {
        if (!this._isValidJsonPath(field)) {
          result.isValid = false
          result.errors.push(`Invalid JSONPath format: ${field}`)
        }
      }
    }

    return result
  }

  /**
   * Validate JSONPath format
   * @param {string} path - JSONPath to validate
   * @returns {boolean} True if valid
   * @private
   */
  static _isValidJsonPath (path) {
    if (!path || typeof path !== 'string') {
      return false
    }

    // Basic validation: should start with $ and contain valid characters
    return path.startsWith('$') && /^[$a-zA-Z0-9_.[\]*]+$/.test(path)
  }

  /**
   * Build a hierarchical tree structure for UI display
   * This creates a tree with proper nesting and parent relationships
   * @param {Object} dataStructure - The analyzed structure from DataProcessor
   * @param {Array} arrayFields - Array field metadata
   * @returns {Object} Tree structure optimized for UI rendering
   */
  static buildArrayTreeStructure (dataStructure, arrayFields) {
    if (!dataStructure || !arrayFields) {
      return null
    }

    // Create a map of array paths for quick lookup
    const arrayPathSet = new Set(arrayFields.map(f => f.path))

    // Build tree by traversing the structure
    const tree = this._buildTreeNode(dataStructure, arrayPathSet)

    return tree
  }

  /**
   * Recursively build tree node
   * @param {Object} node - Current node from data structure
   * @param {Set} arrayPathSet - Set of array paths
   * @returns {Object} Tree node
   * @private
   */
  static _buildTreeNode (node, arrayPathSet) {
    if (!node) {
      return null
    }

    const treeNode = {
      path: node.path,
      type: node.type,
      isArray: node.type === 'array',
      isSelectable: arrayPathSet.has(node.path),
      key: node.key || null,
      children: []
    }

    // Process children if they exist
    if (node.children && Array.isArray(node.children)) {
      for (const child of node.children) {
        // Skip ellipsis placeholders
        if (child.type === 'ellipsis') {
          continue
        }

        const childNode = this._buildTreeNode(child, arrayPathSet)
        if (childNode) {
          treeNode.children.push(childNode)
        }
      }
    }

    return treeNode
  }

  /**
   * Extract field name from JSONPath
   * @param {string} path - JSONPath string
   * @returns {string} Field name
   */
  static extractFieldName (path) {
    if (!path || typeof path !== 'string') {
      return ''
    }

    // Handle array index notation
    const withoutArrayIndex = path.replace(/\[\d+\]$/, '')

    // Get the last segment after a dot or the whole path if no dot
    const segments = withoutArrayIndex.split('.')
    return segments[segments.length - 1] || path
  }

  /**
   * Format field path for display
   * @param {string} path - JSONPath string
   * @returns {string} Formatted path
   */
  static formatPathForDisplay (path) {
    if (!path || typeof path !== 'string') {
      return ''
    }

    // Replace array indices with [*] for display
    return path.replace(/\[\d+\]/g, '[*]')
  }

  /**
   * ============================================================================
   * MULTI-LINE LOG SUPPORT METHODS
   * These methods handle aggregation of candidates across multiple log entries
   * ============================================================================
   */

  /**
   * Configuration constants for multi-line processing
   */
  static MAX_RECORDS = 50 // Maximum records to process for aggregation
  static MAX_ARRAY_SAMPLE = 10 // Maximum array elements to inspect

  /**
   * Normalize array path by replacing numeric indices with [0]
   * @param {string} path - JSONPath string
   * @returns {string} Normalized path
   * @example normalizeArrayPath('$[2].data.users[5].orders') // returns '$[0].data.users[0].orders'
   */
  static normalizeArrayPath (path) {
    if (!path || typeof path !== 'string') {
      return path
    }
    return path.replace(/\[(\d+)\]/g, '[0]')
  }

  /**
   * Find Convert to JSON candidates across multiple log entries
   * @param {Array} records - Array of log records
   * @returns {Array} Union of all JSON string field paths
   */
  static findConvertToJsonCandidatesMultiLine (records) {
    if (!Array.isArray(records) || records.length === 0) {
      return []
    }

    const jsonCandidates = new Set()
    const limit = Math.min(records.length, this.MAX_RECORDS)
    const successCounts = {} // Track parse success for each path

    // Scan each record
    for (let i = 0; i < limit; i++) {
      const record = records[i]
      if (!record || typeof record !== 'object') continue

      // Find stringified JSON fields in this record
      const fieldsInRecord = DataProcessor.findStringifiedJsonFields(record)

      // Add to candidates and track success
      for (const field of fieldsInRecord) {
        jsonCandidates.add(field)
        successCounts[field] = (successCounts[field] || 0) + 1
      }
    }

    // Filter candidates: include if success rate > 50% or present in at least 1 record
    // (since findStringifiedJsonFields already validates parsing)
    return Array.from(jsonCandidates)
  }

  /**
   * Find array fanout candidates across multiple log entries
   * @param {Array} records - Array of log records
   * @returns {Array} Aggregated array field metadata
   */
  static findFanoutCandidatesMultiLine (records) {
    if (!Array.isArray(records) || records.length === 0) {
      return []
    }

    const arrayMetadataMap = new Map() // key = normalized path, value = aggregated metadata
    const limit = Math.min(records.length, this.MAX_RECORDS)

    // Process each record
    for (let i = 0; i < limit; i++) {
      const record = records[i]
      if (!record || typeof record !== 'object') continue

      // Analyze structure for this record
      const structure = DataProcessor.analyzeDataStructure(record)

      // Find array fields
      const arrayPaths = DataProcessor.findArrayFields(structure)

      // Collect metadata for each array
      for (const path of arrayPaths) {
        const normalizedPath = this.normalizeArrayPath(path)
        const arrayInfo = this._analyzeArrayField(path, structure)

        if (!arrayInfo) continue

        // Get or create metadata entry
        let metadata = arrayMetadataMap.get(normalizedPath)

        if (!metadata) {
          // First occurrence of this array path
          metadata = {
            path: normalizedPath,
            isHomogeneous: arrayInfo.isHomogeneous,
            elementType: arrayInfo.elementType,
            sampleSize: 1,
            parentPath: arrayInfo.parentPath ? this.normalizeArrayPath(arrayInfo.parentPath) : null,
            homogeneousCount: arrayInfo.isHomogeneous ? 1 : 0
          }
          arrayMetadataMap.set(normalizedPath, metadata)
        } else {
          // Aggregate with existing metadata
          metadata.sampleSize++

          // Only homogeneous if ALL instances were homogeneous
          if (arrayInfo.isHomogeneous) {
            metadata.homogeneousCount++
          }

          // Update element type (keep first non-null consensus)
          if (!metadata.elementType && arrayInfo.elementType) {
            metadata.elementType = arrayInfo.elementType
          } else if (arrayInfo.elementType && arrayInfo.elementType !== metadata.elementType) {
            metadata.elementType = 'mixed'
          }
        }
      }
    }

    // Finalize metadata
    const arrayFields = []
    for (const metadata of arrayMetadataMap.values()) {
      // isHomogeneous is true only if ALL instances were homogeneous
      metadata.isHomogeneous = metadata.homogeneousCount === metadata.sampleSize

      // Convert path to JsonTreeViewer format (remove $ prefix)
      const viewerPath = metadata.path.replace(/^\$\.?/, '')

      arrayFields.push({
        path: viewerPath,
        isHomogeneous: metadata.isHomogeneous,
        elementType: metadata.elementType || 'unknown',
        sampleSize: Math.min(metadata.sampleSize, 25), // Cap at 25 as per spec
        parentPath: metadata.parentPath ? metadata.parentPath.replace(/^\$\.?/, '') : null
      })
    }

    return arrayFields
  }

  /**
   * Build a representative structure by deep union of multiple records
   * @param {Array} records - Array of log records
   * @returns {Object} Synthetic representative object
   */
  static buildRepresentativeStructure (records) {
    if (!Array.isArray(records) || records.length === 0) {
      return {}
    }

    const limit = Math.min(records.length, this.MAX_RECORDS)
    let representative = records[0]

    // Union each subsequent record into the representative
    for (let i = 1; i < limit; i++) {
      representative = this._deepUnion(representative, records[i])
    }

    return representative
  }

  /**
   * Perform deep union of two objects
   * @param {*} obj1 - First object
   * @param {*} obj2 - Second object
   * @returns {*} Unioned result
   * @private
   */
  static _deepUnion (obj1, obj2) {
    // Handle null/undefined cases
    if (obj1 == null) return obj2
    if (obj2 == null) return obj1

    // If types differ, prefer obj1
    if (typeof obj1 !== typeof obj2) return obj1

    // Handle primitives
    if (typeof obj1 !== 'object') return obj1

    // Handle arrays
    if (Array.isArray(obj1) && Array.isArray(obj2)) {
      // If both arrays have objects, union their first elements
      if (obj1.length > 0 && obj2.length > 0) {
        const first1 = obj1[0]
        const first2 = obj2[0]

        if (first1 != null && first2 != null &&
            typeof first1 === 'object' && !Array.isArray(first1) &&
            typeof first2 === 'object' && !Array.isArray(first2)) {
          // Union the first elements
          return [this._deepUnion(first1, first2)]
        }
      }

      // For arrays of primitives, keep the shortest non-empty example
      if (obj1.length > 0) return obj1.slice(0, Math.min(obj1.length, this.MAX_ARRAY_SAMPLE))
      if (obj2.length > 0) return obj2.slice(0, Math.min(obj2.length, this.MAX_ARRAY_SAMPLE))
      return []
    }

    // Handle objects - union keys
    if (!Array.isArray(obj1) && !Array.isArray(obj2)) {
      const result = { ...obj1 }

      // Add keys from obj2 that don't exist in obj1
      for (const key of Object.keys(obj2)) {
        if (key in result) {
          // Key exists in both - recursively union
          result[key] = this._deepUnion(result[key], obj2[key])
        } else {
          // Key only in obj2 - add it
          result[key] = obj2[key]
        }
      }

      return result
    }

    // Default: prefer obj1
    return obj1
  }

  /**
   * Analyze sample data with multi-line support
   * @param {Object|Array} parsedData - The parsed data (single object or array of objects)
   * @param {Object} dataStructure - The data structure from DataProcessor
   * @param {boolean} isMultiLine - Whether this is multi-line data
   * @returns {Object} Analysis result with convertToJsonCandidates and fanoutCandidates
   */
  static analyzeSampleDataWithMultiLineSupport (parsedData, dataStructure, isMultiLine) {
    if (!parsedData) {
      return {
        convertToJsonCandidates: [],
        fanoutCandidates: [],
        representativeData: null
      }
    }

    // Single-line mode: use existing logic
    if (!isMultiLine) {
      return {
        convertToJsonCandidates: this.findConvertToJsonCandidates(parsedData),
        fanoutCandidates: this.findFanoutCandidates(parsedData, dataStructure),
        representativeData: parsedData
      }
    }

    // Multi-line mode: aggregate across records
    const records = Array.isArray(parsedData) ? parsedData : [parsedData]

    if (records.length === 0) {
      return {
        convertToJsonCandidates: [],
        fanoutCandidates: [],
        representativeData: null
      }
    }

    // Build representative structure
    const representativeData = this.buildRepresentativeStructure(records)

    // Find candidates across all records
    const convertToJsonCandidates = this.findConvertToJsonCandidatesMultiLine(records)
    const fanoutCandidates = this.findFanoutCandidatesMultiLine(records)

    return {
      convertToJsonCandidates,
      fanoutCandidates,
      representativeData
    }
  }

  /**
   * ============================================================================
   * DYNAMIC FANOUT DETECTION FROM PARSED JSON STRINGS
   * These methods handle detecting arrays within stringified JSON fields
   * ============================================================================
   */

  /**
   * Parse a stringified JSON field and extract array candidates
   * @param {Object|Array} data - The data containing the field
   * @param {string} fieldPath - The path to the stringified JSON field
   * @returns {Object} Parsing result with arrays and parsed structure
   */
  static parseJsonFieldForArrays (data, fieldPath) {
    console.log('╔═══════════════════════════════════════════════════════════════════════')
    console.log('║ [DEBUG SchemaRuleService.parseJsonFieldForArrays] Called')
    console.log('║   fieldPath:', JSON.stringify(fieldPath))
    console.log('╚═══════════════════════════════════════════════════════════════════════')

    const result = {
      success: false,
      parsedData: null,
      arrayPaths: [],
      error: null
    }

    try {
      // Get the field value from the data
      const fieldValue = this._getValueByPath(data, fieldPath)
      console.log('[DEBUG] Field value type:', typeof fieldValue)
      console.log('[DEBUG] Field value length:', fieldValue?.length)

      if (!fieldValue || typeof fieldValue !== 'string') {
        result.error = 'Field is not a string'
        console.log('[DEBUG] Error:', result.error)
        return result
      }

      // Try to parse the JSON string
      const parsedValue = JSON.parse(fieldValue)
      result.parsedData = parsedValue
      result.success = true
      console.log('[DEBUG] Successfully parsed JSON, type:', typeof parsedValue)

      // Find all array paths within the parsed structure
      result.arrayPaths = this._findArrayPathsInParsedJson(parsedValue, fieldPath)

      console.log('╔═══════════════════════════════════════════════════════════════════════')
      console.log('║ [DEBUG SchemaRuleService.parseJsonFieldForArrays] Result')
      console.log('║   success:', result.success)
      console.log('║   arrayPaths.length:', result.arrayPaths.length)
      console.log('║   arrayPaths:')
      result.arrayPaths.forEach((arr, idx) => {
        console.log(`║     [${idx}] path: "${arr.path}", parentPath: "${arr.parentPath}", isParsedField: ${arr.isParsedField}`)
      })
      console.log('╚═══════════════════════════════════════════════════════════════════════')

      return result
    } catch (error) {
      result.error = `Failed to parse JSON: ${error.message}`
      console.log('[DEBUG] Exception:', result.error)
      return result
    }
  }

  /**
   * Find all array paths within a parsed JSON structure
   * @param {*} data - The parsed JSON data
   * @param {string} parentPath - The parent field path
   * @param {string} currentPath - Current path within the parsed structure
   * @returns {Array} Array of array path objects
   * @private
   */
  static _findArrayPathsInParsedJson (data, parentPath, currentPath = '') {
    const arrayPaths = []

    // Helper to build the full path
    const buildFullPath = (subPath) => {
      if (!subPath) return parentPath
      return `${parentPath}.${subPath}`
    }

    // Recursive traversal
    const traverse = (obj, path = '') => {
      if (obj === null || obj === undefined) return

      if (Array.isArray(obj)) {
        // Found an array - add it to the candidates
        const fullPath = buildFullPath(path)
        const arrayInfo = this._analyzeArrayStructure(obj)

        arrayPaths.push({
          path: fullPath,
          relativePath: path || '(root)',
          isHomogeneous: arrayInfo.isHomogeneous,
          elementType: arrayInfo.elementType,
          sampleSize: obj.length,
          parentPath: parentPath,
          isParsedField: true // Mark as coming from a parsed field
        })

        // Traverse array elements
        if (obj.length > 0 && typeof obj[0] === 'object' && obj[0] !== null) {
          traverse(obj[0], path ? `${path}[0]` : '[0]')
        }
      } else if (typeof obj === 'object') {
        // Traverse object properties
        for (const key in obj) {
          const nextPath = path ? `${path}.${key}` : key
          traverse(obj[key], nextPath)
        }
      }
    }

    traverse(data)
    return arrayPaths
  }

  /**
   * Analyze an array's structure to determine homogeneity and element type
   * @param {Array} array - The array to analyze
   * @returns {Object} Analysis result with isHomogeneous and elementType
   * @private
   */
  static _analyzeArrayStructure (array) {
    if (!Array.isArray(array) || array.length === 0) {
      return {
        isHomogeneous: true,
        elementType: 'empty'
      }
    }

    // Check the type of the first element
    const firstElement = array[0]
    const firstType = Array.isArray(firstElement)
      ? 'array'
      : (firstElement === null
          ? 'null'
          : typeof firstElement)

    // Check if all elements have the same type
    let isHomogeneous = true
    for (let i = 1; i < Math.min(array.length, 10); i++) {
      const element = array[i]
      const elementType = Array.isArray(element)
        ? 'array'
        : (element === null
            ? 'null'
            : typeof element)

      if (elementType !== firstType) {
        isHomogeneous = false
        break
      }
    }

    return {
      isHomogeneous,
      elementType: firstType
    }
  }

  /**
   * Get a value from an object by path (supports nested paths and arrays)
   * @param {Object|Array} obj - The object to traverse
   * @param {string} path - The path to the value (e.g., 'field', 'parent.field', 'array[0].field')
   * @returns {*} The value at the path or undefined
   * @private
   */
  static _getValueByPath (obj, path) {
    if (!obj || !path) return undefined

    // Remove leading $ if present (JSONPath notation)
    const cleanPath = path.replace(/^\$\.?/, '')
    if (!cleanPath) return obj

    // Split path by dots and brackets
    const parts = cleanPath.split(/\.|\[|\]/).filter(p => p !== '')

    let current = obj
    for (const part of parts) {
      if (current === null || current === undefined) return undefined

      // Handle array indices
      if (/^\d+$/.test(part)) {
        current = current[parseInt(part)]
      } else {
        current = current[part]
      }
    }

    return current
  }

  /**
   * Merge parsed JSON arrays into existing fanout candidates
   * @param {Array} existingCandidates - Existing fanout candidates
   * @param {Array} parsedArrays - Arrays discovered from parsed JSON fields
   * @returns {Array} Combined fanout candidates
   */
  static mergeParsedArraysIntoFanoutCandidates (existingCandidates, parsedArrays) {
    // Create a map of existing candidates by path for deduplication
    const candidateMap = new Map()

    // Add existing candidates
    for (const candidate of existingCandidates) {
      candidateMap.set(candidate.path, candidate)
    }

    // Add parsed arrays
    for (const parsedArray of parsedArrays) {
      if (!candidateMap.has(parsedArray.path)) {
        candidateMap.set(parsedArray.path, parsedArray)
      }
    }

    return Array.from(candidateMap.values())
  }

  /**
   * Remove parsed arrays from fanout candidates when a JSON field is deselected
   * @param {Array} candidates - Current fanout candidates
   * @param {string} jsonFieldPath - The path to the deselected JSON field
   * @returns {Array} Updated fanout candidates
   */
  static removeParsedArraysFromField (candidates, jsonFieldPath) {
    console.log('╔═══════════════════════════════════════════════════════════════════════')
    console.log('║ [DEBUG SchemaRuleService.removeParsedArraysFromField] Called')
    console.log('╠═══════════════════════════════════════════════════════════════════════')
    console.log('║ Input jsonFieldPath:', JSON.stringify(jsonFieldPath))
    console.log('║ Input candidates.length:', candidates.length)
    console.log('║ Input candidates:')
    candidates.forEach((c, idx) => {
      console.log(`║   [${idx}] path: "${c.path}", isParsedField: ${c.isParsedField}, parentPath: "${c.parentPath || 'N/A'}"`)
    })
    console.log('╠═══════════════════════════════════════════════════════════════════════')
    console.log('║ Filtering Logic:')
    console.log('║   Remove if: (isParsedField === true) AND (parentPath === "' + jsonFieldPath + '")')
    console.log('╚═══════════════════════════════════════════════════════════════════════')

    // Filter out candidates that came from this parsed field
    const filtered = candidates.filter(candidate => {
      // Check if this candidate is from the parsed field
      const shouldRemove = candidate.isParsedField && candidate.parentPath === jsonFieldPath

      if (shouldRemove) {
        console.log(`║   [REMOVING] path: "${candidate.path}", isParsedField: ${candidate.isParsedField}, parentPath: "${candidate.parentPath}"`)
      } else {
        console.log(`║   [KEEPING] path: "${candidate.path}", isParsedField: ${candidate.isParsedField}, parentPath: "${candidate.parentPath || 'N/A'}"`)
      }

      return !shouldRemove
    })

    console.log('╔═══════════════════════════════════════════════════════════════════════')
    console.log('║ [DEBUG SchemaRuleService.removeParsedArraysFromField] Result')
    console.log('║ Original count:', candidates.length, '→ Filtered count:', filtered.length)
    console.log('║ Removed:', candidates.length - filtered.length, 'candidates')
    console.log('║ Filtered candidates:')
    filtered.forEach((c, idx) => {
      console.log(`║   [${idx}] path: "${c.path}", isParsedField: ${c.isParsedField}, parentPath: "${c.parentPath || 'N/A'}"`)
    })
    console.log('╚═══════════════════════════════════════════════════════════════════════')

    return filtered
  }

  /**
   * Update representative data by merging parsed JSON fields
   * @param {Object} baseData - The base representative data
   * @param {Array} selectedJsonFields - Selected Convert to JSON fields
   * @returns {Object} Updated representative data with parsed JSON fields
   */
  static updateRepresentativeDataWithParsedFields (baseData, selectedJsonFields) {
    if (!baseData || !selectedJsonFields || selectedJsonFields.length === 0) {
      return baseData
    }

    // Create a deep copy to avoid mutation
    let updatedData
    try {
      updatedData = JSON.parse(JSON.stringify(baseData))
    } catch (e) {
      console.error('Error cloning representative data:', e)
      return baseData
    }

    // Parse and replace each selected JSON field
    for (const fieldPath of selectedJsonFields) {
      try {
        const fieldValue = this._getValueByPath(updatedData, fieldPath)

        if (fieldValue && typeof fieldValue === 'string') {
          const parsedValue = JSON.parse(fieldValue)
          // Replace the string with the parsed object
          this._setValueByPath(updatedData, fieldPath, parsedValue)
        }
      } catch (error) {
        console.warn(`Failed to parse JSON field ${fieldPath}:`, error.message)
        // Continue with other fields
      }
    }

    return updatedData
  }

  /**
   * Set a value in an object by path (supports nested paths and arrays)
   * @param {Object|Array} obj - The object to modify
   * @param {string} path - The path to set (e.g., 'field', 'parent.field', 'array[0].field')
   * @param {*} value - The value to set
   * @private
   */
  static _setValueByPath (obj, path, value) {
    if (!obj || !path) return

    // Remove leading $ if present (JSONPath notation)
    const cleanPath = path.replace(/^\$\.?/, '')
    if (!cleanPath) return

    // Split path by dots and brackets
    const parts = cleanPath.split(/\.|\[|\]/).filter(p => p !== '')

    let current = obj
    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i]

      if (current[part] === undefined) {
        // Create missing intermediate objects
        const nextPart = parts[i + 1]
        current[part] = /^\d+$/.test(nextPart) ? [] : {}
      }

      current = current[part]
    }

    // Set the final value
    const lastPart = parts[parts.length - 1]
    current[lastPart] = value
  }
}

export default {
  SchemaRuleService
}
