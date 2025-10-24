/**
 * Data Processing Service for JSON Policy Builder Wizard
 * Handles sample data validation, parsing, and analysis for Step 2
 */

import { ValidationResult } from './validationService'

/**
 * DataProcessing class for wizard Step 2
 * Provides methods for JSON data handling and analysis
 */
export class DataProcessor {
  /**
   * Process raw JSON data input
   * @param {string} rawData - Raw JSON string input
   * @param {string} inputMethod - Input method (manual, file, multiple)
   * @returns {Object} Processing result with validation, parsed data, and analysis
   */
  static async processSampleData (rawData, inputMethod = 'manual') {
    const result = {
      validationResult: new ValidationResult(),
      parsedData: null,
      dataStructure: null,
      dataStats: {
        recordCount: 0,
        fieldCount: 0,
        nestedLevels: 0
      }
    }

    if (!rawData || typeof rawData !== 'string' || rawData.trim() === '') {
      result.validationResult.addError('data', 'No data provided')
      return result
    }

    try {
      // Parse JSON based on input method
      if (inputMethod === 'multiple') {
        // Handle multiple JSON objects (one per line)
        await this._processMultipleJson(rawData, result)
      } else {
        // Handle single JSON object or array
        await this._processSingleJson(rawData, result)
      }

      // If parsing was successful, analyze the structure
      if (result.parsedData && result.validationResult.isValid) {
        // Analyze JSON structure
        result.dataStructure = this.analyzeDataStructure(result.parsedData)

        // Calculate statistics
        result.dataStats.fieldCount = this.countUniqueFields(result.dataStructure)
        result.dataStats.nestedLevels = this.getMaxNestingLevel(result.dataStructure)

        // Add warnings for complex structures if needed
        this._addComplexityWarnings(result)
      }

      return result
    } catch (error) {
      // Handle any unexpected errors
      result.validationResult.addError('data', `Error processing data: ${error.message}`)
      console.error('Error in processSampleData:', error)
      return result
    }
  }

  /**
   * Process a single JSON object or array
   * @private
   */
  static async _processSingleJson (rawData, result) {
    try {
      // Attempt to parse the JSON
      result.parsedData = JSON.parse(rawData)

      // Set record count based on parsed data type
      result.dataStats.recordCount = Array.isArray(result.parsedData) ? result.parsedData.length : 1

      // Validate basic structure
      this._validateJsonStructure(result.parsedData, result.validationResult)
    } catch (parseError) {
      // Try to provide helpful error message for parsing failures
      const errorLocation = this._getJsonErrorLocation(rawData, parseError)
      result.validationResult.addError('data', `Invalid JSON format: ${parseError.message}${errorLocation}`)
    }
  }

  /**
   * Process multiple JSON objects (one per line)
   * @private
   */
  static async _processMultipleJson (rawData, result) {
    try {
      const lines = rawData.trim().split('\n').filter(line => line && line.trim())
      const parsedObjects = []
      const parseErrors = []

      // Try to parse each line
      lines.forEach((line, index) => {
        try {
          const parsedLine = JSON.parse(line)
          parsedObjects.push(parsedLine)
        } catch (lineError) {
          parseErrors.push(`Line ${index + 1}: ${lineError.message}`)
        }
      })

      // Set the parsed result to the array of objects
      result.parsedData = parsedObjects
      result.dataStats.recordCount = parsedObjects.length

      // Check if we have any successful parses
      if (parsedObjects.length === 0) {
        result.validationResult.addError('data', 'No valid JSON objects found')
        if (parseErrors.length > 0) {
          // Report first few errors
          parseErrors.slice(0, 3).forEach(error => {
            result.validationResult.addError('data', error)
          })
          if (parseErrors.length > 3) {
            result.validationResult.addError('data', `...and ${parseErrors.length - 3} more errors`)
          }
        }
      } else if (parseErrors.length > 0) {
        // Some lines were valid, but others had errors
        result.validationResult.addWarning('data', `${parseErrors.length} of ${lines.length} lines could not be parsed`)
        // Still consider this valid since we have some good data
        result.validationResult.isValid = true
      } else {
        // All lines parsed successfully
        result.validationResult.isValid = true
      }

      // Validate structure of the first object as representative
      if (parsedObjects.length > 0) {
        this._validateJsonStructure(parsedObjects[0], result.validationResult)
      }
    } catch (error) {
      result.validationResult.addError('data', `Error processing multi-line JSON: ${error.message}`)
    }
  }

  /**
   * Validate basic JSON structure requirements
   * @private
   */
  static _validateJsonStructure (data, validationResult) {
    // Ensure we have an object or array to work with
    if (data === null) {
      validationResult.addError('data', 'JSON cannot be null')
      return false
    }

    if (typeof data !== 'object') {
      validationResult.addError('data', 'JSON must be an object or array, not a primitive value')
      return false
    }

    // For arrays, verify they have contents
    if (Array.isArray(data) && data.length === 0) {
      validationResult.addWarning('data', 'JSON array is empty')
    }

    // Success
    validationResult.isValid = true
    return true
  }

  /**
   * Try to get location information for JSON parse errors
   * @private
   */
  static _getJsonErrorLocation (rawData, parseError) {
    // Extract line and position from error message if available
    const positionMatch = parseError.message.match(/position (\d+)/)
    if (positionMatch && positionMatch[1]) {
      const position = parseInt(positionMatch[1])

      // Get the line number by counting newlines
      const beforeError = rawData.substring(0, position)
      const lineNumber = (beforeError.match(/\n/g) || []).length + 1

      // Get the column by finding the last newline before error
      const lastNewline = beforeError.lastIndexOf('\n')
      const column = lastNewline === -1 ? position + 1 : position - lastNewline

      return ` (around line ${lineNumber}, column ${column})`
    }
    return ''
  }

  /**
   * Add warnings for complex JSON structures
   * @private
   */
  static _addComplexityWarnings (result) {
    // Check for deeply nested structures
    if (result.dataStats.nestedLevels > 5) {
      result.validationResult.addWarning(
        'complexity',
        `Deeply nested JSON (${result.dataStats.nestedLevels} levels) may impact performance`
      )
    }

    // Check for very wide structures (many fields)
    if (result.dataStats.fieldCount > 100) {
      result.validationResult.addWarning(
        'complexity',
        `Large number of fields (${result.dataStats.fieldCount}) may impact performance`
      )
    }

    // Check for very large record sets
    if (result.dataStats.recordCount > 1000) {
      result.validationResult.addWarning(
        'complexity',
        `Large dataset (${result.dataStats.recordCount} records) may impact browser performance`
      )
    }
  }

  /**
   * Analyze JSON data structure to create tree representation
   * @param {Object|Array} data - The parsed JSON data
   * @param {string} parentPath - JSONPath to the parent node (for recursion)
   * @returns {Object} Tree structure with metadata for UI display
   */
  static analyzeDataStructure (data, parentPath = '$') {
    // Base case for primitives
    if (data === null || typeof data !== 'object') {
      return {
        type: data === null ? 'null' : typeof data,
        value: data,
        path: parentPath
      }
    }

    // Handle arrays
    if (Array.isArray(data)) {
      const children = []
      let isHomogeneous = true
      let firstItemType = null

      // Process sample of array for performance (max 10 items)
      const sampleSize = Math.min(data.length, 10)

      if (data.length > 0) {
        // Analyze first item
        const firstItem = this.analyzeDataStructure(data[0], `${parentPath}[0]`)
        firstItemType = firstItem.type
        children.push(firstItem)

        // Analyze remaining sample items
        for (let i = 1; i < sampleSize; i++) {
          const item = this.analyzeDataStructure(data[i], `${parentPath}[${i}]`)
          children.push(item)

          // Check if item type matches the first
          if (item.type !== firstItemType) {
            isHomogeneous = false
          }
        }

        // For large arrays, add a placeholder for remaining items
        if (data.length > sampleSize) {
          children.push({
            type: 'ellipsis',
            path: `${parentPath}[...]`,
            value: `${data.length - sampleSize} more items`
          })
        }
      }

      return {
        type: 'array',
        path: parentPath,
        value: `Array[${data.length}]`,
        children,
        isHomogeneous,
        elementType: data.length > 0 ? firstItemType : 'unknown'
      }
    }

    // Handle objects
    const keys = Object.keys(data)
    const children = []

    for (const key of keys) {
      const childPath = `${parentPath}.${key}`
      const child = this.analyzeDataStructure(data[key], childPath)
      children.push({
        key,
        ...child
      })
    }

    return {
      type: 'object',
      path: parentPath,
      value: `Object{${keys.length}}`,
      children
    }
  }

  /**
   * Count unique fields in the JSON structure
   * @param {Object} structure - The analyzed structure from analyzeDataStructure
   * @returns {number} Count of unique fields
   */
  static countUniqueFields (structure) {
    if (!structure || !structure.type) return 0

    // Base case for primitive types
    if (structure.type !== 'object' && structure.type !== 'array') {
      return 1
    }

    // If no children or empty array/object
    if (!structure.children || !Array.isArray(structure.children) || structure.children.length === 0) {
      return 1
    }

    // For objects and arrays, sum up child fields
    let count = 0

    // For arrays, only count unique fields in the structure, not each element
    if (structure.type === 'array' && structure.isHomogeneous && structure.children.length > 0) {
      // For homogeneous arrays, count fields in first element
      count = this.countUniqueFields(structure.children[0])
    } else {
      // For objects or heterogeneous arrays, sum all children
      for (const child of structure.children) {
        // Skip ellipsis placeholder
        if (child.type === 'ellipsis') continue
        count += this.countUniqueFields(child)
      }
    }

    return count
  }

  /**
   * Calculate maximum nesting level in JSON structure
   * @param {Object} structure - The analyzed structure from analyzeDataStructure
   * @returns {number} Maximum nesting depth
   */
  static getMaxNestingLevel (structure, level = 0) {
    if (!structure || !structure.type) return level

    // Base case for primitive types
    if (structure.type !== 'object' && structure.type !== 'array') {
      return level
    }

    // If no children or empty array/object
    if (!structure.children || !Array.isArray(structure.children) || structure.children.length === 0) {
      return level
    }

    // Find the maximum depth among children
    let maxChildLevel = level

    for (const child of structure.children) {
      // Skip ellipsis placeholder
      if (child.type === 'ellipsis') continue
      const childLevel = this.getMaxNestingLevel(child, level + 1)
      maxChildLevel = Math.max(maxChildLevel, childLevel)
    }

    return maxChildLevel
  }

  /**
   * Find fields containing arrays in the JSON structure
   * @param {Object} structure - The analyzed structure from analyzeDataStructure
   * @returns {Array} List of paths to array fields
   */
  static findArrayFields (structure) {
    const arrayFields = []

    // Function for recursive traversal
    const traverse = (node, isRoot = false) => {
      // Skip traversal for invalid nodes
      if (!node || !node.type) return

      // If this node is an array (but not the root), add its path
      if (node.type === 'array' && !isRoot) {
        arrayFields.push(node.path)
      }

      // Continue traversal for objects and arrays
      if ((node.type === 'object' || node.type === 'array') && node.children) {
        node.children.forEach(child => {
          if (child.type !== 'ellipsis') {
            traverse(child)
          }
        })
      }
    }

    // Start traversal
    traverse(structure, true)
    return arrayFields
  }

  /**
   * Find fields likely containing stringified JSON
   * @param {Object|Array} data - The parsed JSON data
   * @returns {Array} List of paths to stringified JSON fields
   */
  static findStringifiedJsonFields (data) {
    const jsonFields = []

    // Function for recursive traversal
    const traverse = (obj, path = '$') => {
      if (obj === null || typeof obj !== 'object') return

      if (Array.isArray(obj)) {
        // Check sample of array elements for large arrays
        const sampleSize = Math.min(obj.length, 10)

        for (let i = 0; i < sampleSize; i++) {
          traverse(obj[i], `${path}[${i}]`)
        }
      } else {
        // Process each key in object
        for (const [key, value] of Object.entries(obj)) {
          const currentPath = `${path}.${key}`

          if (typeof value === 'string') {
            // Check if string might be JSON
            if (this._looksLikeJson(value)) {
              jsonFields.push(currentPath)
            }
          } else if (value !== null && typeof value === 'object') {
            // Recursively traverse nested objects/arrays
            traverse(value, currentPath)
          }
        }
      }
    }

    // Start traversal
    traverse(data)
    return jsonFields
  }

  /**
   * Check if string looks like it might contain JSON
   * @private
   */
  static _looksLikeJson (str) {
    if (typeof str !== 'string') return false

    // Trim whitespace
    const trimmed = str.trim()

    // Empty string is not JSON
    if (!trimmed) return false

    // Check for characteristic JSON starting and ending patterns
    const startsWithObjectBrace = trimmed.startsWith('{') && trimmed.endsWith('}')
    const startsWithArrayBracket = trimmed.startsWith('[') && trimmed.endsWith(']')

    if (!(startsWithObjectBrace || startsWithArrayBracket)) {
      return false
    }

    // Check for other JSON indicators (quotes, colons for key-value pairs)
    const hasQuotes = trimmed.includes('"')
    const hasColons = trimmed.includes(':')

    // For objects, require quotes and colons
    if (startsWithObjectBrace && (!hasQuotes || !hasColons)) {
      return false
    }

    // Basic length check (must be reasonable length to be JSON)
    if (trimmed.length < 5) {
      return false
    }

    // Try parsing to confirm
    try {
      const parsed = JSON.parse(trimmed)
      // Verify it's an actual object/array
      return parsed !== null && typeof parsed === 'object'
    } catch (e) {
      return false
    }
  }

  /**
   * Try to parse a string as JSON and return the parsed value
   * @param {string} str - The string to parse
   * @returns {Object|null} Parsed JSON or null if invalid
   */
  static parseStringifiedJson (str) {
    if (!str || typeof str !== 'string') return null

    try {
      return JSON.parse(str)
    } catch (e) {
      return null
    }
  }

  /**
   * Format JSON string with proper indentation
   * @param {string} jsonString - JSON string to format
   * @returns {string} Formatted JSON string
   */
  static formatJson (jsonString) {
    try {
      const obj = JSON.parse(jsonString)
      return JSON.stringify(obj, null, 2)
    } catch (e) {
      // Return original if parsing fails
      return jsonString
    }
  }
}

export default {
  DataProcessor
}
