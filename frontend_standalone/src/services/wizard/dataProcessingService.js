/**
 * Data Processing Service for JSON Policy Builder Wizard
 * Handles sample data validation, parsing, and analysis for Step 2
 */

import { ValidationResult } from './validationService.js'

/**
 * DataProcessing class for wizard Step 2
 * Provides methods for JSON data handling and analysis
 */
export class DataProcessor {
  /**
   * Log types enum
   * Used to distinguish between different log file types
   */
  static LogTypes = {
    SINGLE: 'single', // Single log entry
    MULTILINE: 'multiline', // Multiple log entries
    UNKNOWN: 'unknown' // Cannot determine or invalid
  }

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
      },
      logType: this.LogTypes.UNKNOWN // Track detected log type
    }

    if (!rawData || typeof rawData !== 'string' || rawData.trim() === '') {
      result.validationResult.addError('data', 'The file is empty or contains only whitespace')
      return result
    }

    try {
      // Detect the log type for file uploads (automatic detection)
      if (inputMethod === 'file') {
        result.logType = this.detectLogType(rawData)
      } else if (inputMethod === 'multiple') {
        // For multiple input mode, explicitly set to multiline
        result.logType = this.LogTypes.MULTILINE
        await this._processMultipleJson(rawData, result)
      } else {
        // For manual input, try to autodetect if not specified
        result.logType = this.detectLogType(rawData)
        await this._processSingleJson(rawData, result)
      }

      // Process based on detected or specified log type
      if (inputMethod === 'file') {
        if (result.logType === this.LogTypes.MULTILINE) {
          await this._processMultipleJson(rawData, result)
        } else {
          await this._processSingleJson(rawData, result)
        }
      }

      // If parsing was successful, analyze the structure
      if (result.parsedData && result.validationResult.isValid) {
        // Analyze JSON structure
        // IMPORTANT FIX: For multiline data (array of objects), analyze the structure of
        // a single representative object, not the array wrapper itself.
        // This ensures we detect arrays WITHIN the objects, not the top-level array of records.
        let dataToAnalyze = result.parsedData

        if (result.logType === this.LogTypes.MULTILINE && Array.isArray(result.parsedData)) {
          // For multiline logs, build a representative structure by merging all objects
          // This allows us to detect all possible fields and arrays across all log entries
          dataToAnalyze = this._buildRepresentativeObject(result.parsedData)
        }

        result.dataStructure = this.analyzeDataStructure(dataToAnalyze)

        // Calculate statistics
        result.dataStats.fieldCount = this.countUniqueFields(result.dataStructure)
        result.dataStats.nestedLevels = this.getMaxNestingLevel(result.dataStructure)

        // Add warnings for complex structures if needed
        this._addComplexityWarnings(result)

        // Run specific validations based on log type
        if (result.logType === this.LogTypes.MULTILINE) {
          this._validateMultilineLog(result)
        } else if (result.logType === this.LogTypes.SINGLE) {
          this._validateSingleLog(result)
        }
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
   * Detect whether the provided JSON data is a single log entry or multiple log entries
   * @param {string} rawData - Raw JSON string input
   * @returns {string} Log type (SINGLE, MULTILINE, or UNKNOWN)
   */
  static detectLogType (rawData) {
    if (!rawData || typeof rawData !== 'string') {
      return this.LogTypes.UNKNOWN
    }

    // Trim the data and do basic checks
    const trimmedData = rawData.trim()
    if (!trimmedData) {
      return this.LogTypes.UNKNOWN
    }

    try {
      // Check for newline-separated JSON objects (multiline)
      const lines = trimmedData.split(/\r?\n/).filter(line => line.trim())

      // If we have multiple non-empty lines
      if (lines.length > 1) {
        // Try to parse each line as JSON
        let validJsonCount = 0
        for (let i = 0; i < Math.min(lines.length, 5); i++) { // Check up to 5 lines
          try {
            JSON.parse(lines[i].trim())
            validJsonCount++
          } catch (e) {
            // Not a valid JSON line
          }
        }

        // If at least 2 lines parsed as valid JSON, it's likely a multiline log
        if (validJsonCount >= 2) {
          return this.LogTypes.MULTILINE
        }
      }

      // Try parsing as a single JSON object
      const parsed = JSON.parse(trimmedData)

      // If it's an array with multiple entries, it might be a collection of logs
      if (Array.isArray(parsed) && parsed.length > 1) {
        // Check if array entries have similar structure (likely logs)
        if (this._hasSimilarStructure(parsed)) {
          return this.LogTypes.MULTILINE
        }
      }

      // Default to single log if we got here
      return this.LogTypes.SINGLE
    } catch (error) {
      // If parsing failed, we can't determine the type
      return this.LogTypes.UNKNOWN
    }
  }

  /**
   * Check if an array of objects has similar structure (for log detection)
   * @param {Array} array - Array of objects to check
   * @returns {boolean} True if objects have similar structure
   * @private
   */
  static _hasSimilarStructure (array) {
    if (!Array.isArray(array) || array.length < 2) {
      return false
    }

    // Take first 3 items as samples
    const sampleSize = Math.min(array.length, 3)
    const samples = array.slice(0, sampleSize)

    // Check if all samples are objects
    if (!samples.every(item => item !== null && typeof item === 'object' && !Array.isArray(item))) {
      return false
    }

    // Get keys from the first sample
    const firstKeys = Object.keys(samples[0])
    if (firstKeys.length === 0) {
      return false
    }

    // Check if at least 50% of keys are shared across samples
    let commonKeyCount = 0
    for (const key of firstKeys) {
      let keyExists = true
      for (let i = 1; i < samples.length; i++) {
        if (!(key in samples[i])) {
          keyExists = false
          break
        }
      }
      if (keyExists) {
        commonKeyCount++
      }
    }

    // Calculate similarity as percentage of common keys
    const similarityRatio = commonKeyCount / firstKeys.length
    return similarityRatio >= 0.5 // At least 50% similar
  }

  /**
   * Build a representative object by deep-merging multiple log objects
   * This creates a synthetic object that contains all possible fields and structures
   * found across multiple log entries.
   * @param {Array} records - Array of log objects to merge
   * @returns {Object} Representative merged object
   * @private
   */
  static _buildRepresentativeObject (records) {
    if (!Array.isArray(records) || records.length === 0) {
      return {}
    }

    // Start with the first record as the base
    let representative = JSON.parse(JSON.stringify(records[0]))

    // Merge each subsequent record
    const maxRecords = Math.min(records.length, 50) // Limit to 50 records for performance
    for (let i = 1; i < maxRecords; i++) {
      representative = this._deepMerge(representative, records[i])
    }

    return representative
  }

  /**
   * Deep merge two objects, combining all keys and nested structures
   * @param {*} target - Target object
   * @param {*} source - Source object to merge
   * @returns {*} Merged result
   * @private
   */
  static _deepMerge (target, source) {
    // Handle null/undefined cases
    if (target == null) return source
    if (source == null) return target

    // If types differ, prefer target
    if (typeof target !== typeof source) return target

    // Handle primitives
    if (typeof target !== 'object') return target

    // Handle arrays
    if (Array.isArray(target) && Array.isArray(source)) {
      // For arrays, merge the first elements if they're objects
      if (target.length > 0 && source.length > 0) {
        const first1 = target[0]
        const first2 = source[0]

        if (first1 != null && first2 != null &&
            typeof first1 === 'object' && !Array.isArray(first1) &&
            typeof first2 === 'object' && !Array.isArray(first2)) {
          // Merge the first elements
          return [this._deepMerge(first1, first2)]
        }
      }

      // For arrays of primitives or empty arrays, keep the longer one
      return target.length >= source.length ? target : source
    }

    // Handle objects - union keys
    if (!Array.isArray(target) && !Array.isArray(source)) {
      const result = { ...target }

      // Add keys from source that don't exist in target
      for (const key of Object.keys(source)) {
        if (key in result) {
          // Key exists in both - recursively merge
          result[key] = this._deepMerge(result[key], source[key])
        } else {
          // Key only in source - add it
          result[key] = source[key]
        }
      }

      return result
    }

    // Default: prefer target
    return target
  }

  /**
   * Process a single JSON object or array
   * @private
   */
  static async _processSingleJson (rawData, result) {
    try {
      // Check if the file is empty or contains only whitespace
      if (!rawData || typeof rawData !== 'string' || rawData.trim() === '') {
        result.validationResult.addError('data', 'The file is empty or contains only whitespace')
        return
      }

      // Attempt to parse the JSON
      result.parsedData = JSON.parse(rawData)

      // Set record count based on parsed data type
      result.dataStats.recordCount = Array.isArray(result.parsedData) ? result.parsedData.length : 1

      // Validate basic structure
      this._validateJsonStructure(result.parsedData, result.validationResult)

      // Set the log type if not already set
      if (result.logType === this.LogTypes.UNKNOWN) {
        result.logType = this.LogTypes.SINGLE
      }
    } catch (parseError) {
      // Try to provide helpful error message for parsing failures
      const errorLocation = this._getJsonErrorLocation(rawData, parseError)
      result.validationResult.addError('data', `Invalid JSON format: ${parseError.message}${errorLocation}`)
    }
  }

  /**
   * Validate a single log entry with specific rules
   * @param {Object} result - Processing result object
   * @private
   */
  static _validateSingleLog (result) {
    if (!result.parsedData) return

    // Basic structure checks
    if (Array.isArray(result.parsedData)) {
      // For arrays, check if it should be treated as a collection or a single entry with array data
      if (result.parsedData.length > 1) {
        // If array has multiple items but was processed as single log, warn user
        result.validationResult.addWarning(
          'data',
          'Multiple objects detected in array. Consider using multiline mode if these are separate log entries.'
        )
      }
    } else if (typeof result.parsedData === 'object') {
      // For single object entries, look for key fields expected in logs
      const keys = Object.keys(result.parsedData)

      // Check for common log fields
      const commonLogFields = ['timestamp', 'time', 'date', 'datetime', 'message', 'msg', 'event']
      const hasCommonFields = commonLogFields.some(field =>
        keys.some(key => key.toLowerCase().includes(field.toLowerCase()))
      )

      if (!hasCommonFields) {
        result.validationResult.addWarning(
          'data',
          'No common log fields detected (timestamp, message, event). Verify this is a valid log format.'
        )
      }

      // Check for minimum information required
      if (keys.length < 3) {
        result.validationResult.addWarning(
          'data',
          'Log entry has very few fields. Log parsing may be limited with this data.'
        )
      }
    }
  }

  /**
   * Process multiple JSON objects (one per line)
   * @private
   */
  static async _processMultipleJson (rawData, result) {
    try {
      // Check if the file is empty or contains only whitespace
      if (!rawData || typeof rawData !== 'string' || rawData.trim() === '') {
        result.validationResult.addError('data', 'The file is empty or contains only whitespace')
        return
      }

      const lines = rawData.trim().split(/\r?\n/).filter(line => line && line.trim())
      const parsedObjects = []
      const parseErrors = []

      // Try to parse each line
      lines.forEach((line, index) => {
        try {
          const parsedLine = JSON.parse(line.trim())
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

      // Set the log type to multiline if not already set
      if (result.logType === this.LogTypes.UNKNOWN) {
        result.logType = this.LogTypes.MULTILINE
      }
    } catch (error) {
      result.validationResult.addError('data', `Error processing multi-line JSON: ${error.message}`)
    }
  }

  /**
   * Validate multiline logs with specific rules
   * @param {Object} result - Processing result object
   * @private
   */
  static _validateMultilineLog (result) {
    if (!result.parsedData || !Array.isArray(result.parsedData) || result.parsedData.length === 0) {
      return
    }

    const logs = result.parsedData

    // Check 1: Validate we have enough logs for analysis
    if (logs.length < 2) {
      result.validationResult.addWarning(
        'data',
        'Only one log entry detected. Multiline mode works best with multiple log entries.'
      )
      return
    }

    // Check 2: Validate logs have consistent structure
    // First, check that all entries are objects
    if (!logs.every(log => log !== null && typeof log === 'object' && !Array.isArray(log))) {
      result.validationResult.addWarning(
        'data',
        'Some log entries are not JSON objects. All entries should be objects for consistent processing.'
      )
    }

    // Check 3: Analyze consistency of fields across logs
    const allFields = new Set()
    const fieldCounts = {}

    // Collect all unique fields and count occurrences
    logs.forEach(log => {
      if (log && typeof log === 'object' && !Array.isArray(log)) {
        Object.keys(log).forEach(key => {
          allFields.add(key)
          fieldCounts[key] = (fieldCounts[key] || 0) + 1
        })
      }
    })

    // Check for inconsistent fields (present in less than 50% of logs)
    const inconsistentFields = []
    const threshold = logs.length * 0.5

    allFields.forEach(field => {
      if (fieldCounts[field] < threshold) {
        inconsistentFields.push({ field, count: fieldCounts[field] })
      }
    })

    // Add warning if there are inconsistent fields
    if (inconsistentFields.length > 0) {
      const fieldsToShow = inconsistentFields
        .slice(0, 3)
        .map(f => `"${f.field}" (${f.count}/${logs.length})`)
        .join(', ')

      const more = inconsistentFields.length > 3 ? ` and ${inconsistentFields.length - 3} more` : ''

      result.validationResult.addWarning(
        'data',
        `Inconsistent fields detected: ${fieldsToShow}${more}. These fields appear in less than 50% of logs.`
      )
    }

    // Check 4: Verify timestamp consistency if timestamps are present
    const timestampFields = ['timestamp', 'time', 'date', '@timestamp', 'eventTime']
    const timestampField = timestampFields.find(field =>
      logs.some(log => log && typeof log === 'object' && field in log)
    )

    if (timestampField) {
      // Count logs with and without the timestamp field
      const withTimestamp = logs.filter(log =>
        log && typeof log === 'object' && timestampField in log
      ).length

      if (withTimestamp < logs.length) {
        result.validationResult.addWarning(
          'data',
          `Timestamp field "${timestampField}" is present in only ${withTimestamp} of ${logs.length} logs.`
        )
      }
    } else {
      result.validationResult.addWarning(
        'data',
        'No common timestamp field found. Time-based analysis may be limited.'
      )
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
    const normalizedPaths = new Set()

    // Function for recursive traversal
    const traverse = (node, isRoot = false) => {
      // Skip traversal for invalid nodes
      if (!node || !node.type) return

      // If this node is an array (but not the root), add its path
      if (node.type === 'array' && !isRoot) {
        // Normalize path for deduplication check (but keep original for return)
        // e.g., both $.projects[0].teams and $.projects[1].teams normalize to $.projects[0].teams
        const normalizedPath = node.path.replace(/\[(\d+)\]/g, '[0]')

        // Only add if we haven't seen this normalized path before
        if (!normalizedPaths.has(normalizedPath)) {
          normalizedPaths.add(normalizedPath)
          // Push the normalized path so all arrays have consistent [0] indices
          arrayFields.push(normalizedPath)
        }
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
