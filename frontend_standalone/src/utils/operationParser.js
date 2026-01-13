/**
 * Operation Parser Utility
 * Handles parsing and building operation syntax for field mappings
 *
 * @module utils/operationParser
 */

import { OPERATION_TYPES, OPERATION_METADATA } from '../constants/operations'

/**
 * Helper function to parse comma-separated arguments from a function call
 * Handles quoted strings correctly
 * @param {string} argsStr - The arguments string (e.g., "$.path, ',', $.path2, '-'")
 * @returns {Array<string>} Array of parsed arguments
 */
function parseArgumentList (argsStr) {
  const args = []
  let current = ''
  let inQuotes = false
  let quoteChar = null
  let escapeNext = false

  for (let i = 0; i < argsStr.length; i++) {
    const char = argsStr[i]

    if (escapeNext) {
      current += char
      escapeNext = false
      continue
    }

    if (char === '\\') {
      escapeNext = true
      current += char
      continue
    }

    if ((char === '"' || char === "'") && !inQuotes) {
      inQuotes = true
      quoteChar = char
      continue
    }

    if (char === quoteChar && inQuotes) {
      inQuotes = false
      quoteChar = null
      continue
    }

    if (char === ',' && !inQuotes) {
      args.push(current.trim())
      current = ''
      continue
    }

    current += char
  }

  if (current.trim()) {
    args.push(current.trim())
  }

  return args
}

/**
 * Parse operation syntax from inputRule string
 * Extracts operation type, field path, and parameters
 *
 * @param {string} inputRule - The inputRule that may contain an operation
 * @returns {Object} Parsed operation { type, fieldPath, parameters }
 *
 * @example
 * parseOperationFromInputRule('Regex($.message, /IP: (\d+\.\d+\.\d+\.\d+)/, 1)')
 * // Returns: {
 * //   type: 'REGEX',
 * //   fieldPath: '$.message',
 * //   parameters: { pattern: '/IP: (\d+\.\d+\.\d+\.\d+)/', captureGroup: 1 }
 * // }
 */
export function parseOperationFromInputRule (inputRule) {
  try {
    // Input validation
    if (!inputRule || typeof inputRule !== 'string') {
      return {
        type: null,
        fieldPath: inputRule || '',
        parameters: {}
      }
    }

    const trimmed = inputRule.trim()

    // Check for REGEX operation (case-insensitive: REGEX or Regex)
    // Format: Regex($.field.path, /pattern/, captureGroup)
    // captureGroup can be numeric (0, 1, 2, ...) or alphanumeric (named groups)
    const regexMatch = trimmed.match(/^Regex\((.*?),\s*(\/.*?\/),\s*([0-9a-zA-Z_]+)\)$/i)
    if (regexMatch) {
      const captureGroupRaw = regexMatch[3].trim()
      // Convert to number if it's purely numeric, otherwise keep as string
      const captureGroup = /^\d+$/.test(captureGroupRaw) ? parseInt(captureGroupRaw, 10) : captureGroupRaw

      return {
        type: OPERATION_TYPES.REGEX,
        fieldPath: regexMatch[1].trim(),
        parameters: {
          pattern: regexMatch[2].trim(),
          captureGroup: captureGroup
        }
      }
    }

    // Check for LookUp operation (case-insensitive)
    // Format: LookUp(tableName, $.field.path)
    const lookupMatch = trimmed.match(/^LookUp\((.*?),\s*(.*?)\)$/i)
    if (lookupMatch) {
      return {
        type: OPERATION_TYPES.LOOKUP,
        fieldPath: lookupMatch[2].trim(),
        parameters: {
          tableName: lookupMatch[1].trim()
        }
      }
    }

    // Check for LookUpStartsWith operation (case-insensitive)
    // Format: LookUpStartsWith(tableName, $.field.path)
    const lookupStartsMatch = trimmed.match(/^LookUpStartsWith\((.*?),\s*(.*?)\)$/i)
    if (lookupStartsMatch) {
      return {
        type: OPERATION_TYPES.LOOKUP_STARTS_WITH,
        fieldPath: lookupStartsMatch[2].trim(),
        parameters: {
          tableName: lookupStartsMatch[1].trim()
        }
      }
    }

    // Check for PREFIX operation (case-insensitive)
    // Format: PREFIX('prefix_string')
    const prefixMatch = trimmed.match(/^PREFIX\('(.*?)'\)$/i)
    if (prefixMatch) {
      return {
        type: OPERATION_TYPES.PREFIX,
        fieldPath: null, // PREFIX doesn't use a field path
        parameters: {
          prefix: prefixMatch[1]
        }
      }
    }

    // Check for IsIP operation (case-insensitive)
    // Format: IsIP($.field.path)
    const isIpMatch = trimmed.match(/^IsIP\((.*?)\)$/i)
    if (isIpMatch) {
      return {
        type: OPERATION_TYPES.ISIP,
        fieldPath: isIpMatch[1].trim(),
        parameters: {}
      }
    }

    // Check for SPLIT operation (case-insensitive)
    // Format: SPLIT($.field.path, 'delimiter', index)
    // Updated regex to handle empty delimiters and be more specific about field path
    const splitMatch = trimmed.match(/^SPLIT\(([$.\w[\]]+),\s*['"](.*)['"],\s*(\d+)\)$/i)
    if (splitMatch) {
      return {
        type: OPERATION_TYPES.SPLIT,
        fieldPath: splitMatch[1].trim(),
        parameters: {
          delimiter: splitMatch[2], // Can be empty string
          index: parseInt(splitMatch[3], 10)
        }
      }
    }

    // Check for Concat operation (case-insensitive)
    // NEW FORMAT: concat(value1, delimiter1, value2, delimiter2, ...)
    // OLD FORMAT: Concat(['value1', 'value2', ...]) - for backward compatibility

    // Try new format first
    const concatNewMatch = trimmed.match(/^concat\((.*)\)$/i)
    if (concatNewMatch) {
      try {
        const argsStr = concatNewMatch[1].trim()

        // Check if it's the old array format
        if (argsStr.startsWith('[') && argsStr.endsWith(']')) {
          // Old format - migrate to new format
          const arrayContent = argsStr.slice(1, -1).trim()
          const valueMatches = arrayContent.match(/(['"])(.*?)\1(?:,\s*)?/g) || []
          const values = valueMatches.map(v => v.replace(/^['"]|['"],?$/g, ''))

          // Convert to pairs with empty delimiters
          const pairs = values.map(value => ({
            value: value,
            delimiter: ''
          }))

          return {
            type: OPERATION_TYPES.CONCAT,
            fieldPath: null,
            parameters: { pairs }
          }
        }

        // New format - parse alternating value/delimiter pattern
        const args = parseArgumentList(argsStr)

        // Split into value-delimiter pairs
        const pairs = []
        for (let i = 0; i < args.length; i += 2) {
          pairs.push({
            value: args[i],
            delimiter: args[i + 1] || '' // Delimiter optional for last item
          })
        }

        return {
          type: OPERATION_TYPES.CONCAT,
          fieldPath: null,
          parameters: { pairs }
        }
      } catch (e) {
        console.error('[OperationParser] Error parsing Concat arguments:', e)
        return {
          type: OPERATION_TYPES.CONCAT,
          fieldPath: null,
          parameters: {
            pairs: [{ value: '', delimiter: '' }]
          }
        }
      }
    }

    // Check for ConcatArray operation (case-insensitive)
    // Format: ConcatArray($.field.path, 'delimiter')
    const concatArrayMatch = trimmed.match(/^ConcatArray\((.*?),\s*['"](.*?)['"]?\)$/i)
    if (concatArrayMatch) {
      return {
        type: OPERATION_TYPES.CONCATARRAY,
        fieldPath: concatArrayMatch[1].trim(),
        parameters: {
          delimiter: concatArrayMatch[2]
        }
      }
    }

    // Check for ToString operation
    // Format: tostring($.field.path) or ToString($.field.path)
    const toStringMatch = trimmed.match(/^tostring\((.*?)\)$/i)
    if (toStringMatch) {
      return {
        type: OPERATION_TYPES.TOSTRING,
        fieldPath: toStringMatch[1].trim(),
        parameters: {}
      }
    }

    // Check for DateTime operations (case-insensitive)
    // Format: EpochSectoDateTime($.field.path, 'format')
    const epochSecMatch = trimmed.match(/^EpochSectoDateTime\((.*?),\s*['"](.+?)['"]?\)$/i)
    if (epochSecMatch) {
      return {
        type: OPERATION_TYPES.EPOCHSECS_TO_DATETIME,
        fieldPath: epochSecMatch[1].trim(),
        parameters: {
          format: epochSecMatch[2]
        }
      }
    }

    // Format: EpochMilliSectoDateTime($.field.path, 'format')
    const epochMilliSecMatch = trimmed.match(/^EpochMilliSectoDateTime\((.*?),\s*['"](.+?)['"]?\)$/i)
    if (epochMilliSecMatch) {
      return {
        type: OPERATION_TYPES.EPOCHMILLIS_TO_DATETIME,
        fieldPath: epochMilliSecMatch[1].trim(),
        parameters: {
          format: epochMilliSecMatch[2]
        }
      }
    }

    // Format: EpochMicroSectoDateTime($.field.path, 'format')
    const epochMicroSecMatch = trimmed.match(/^EpochMicroSectoDateTime\((.*?),\s*['"](.+?)['"]?\)$/i)
    if (epochMicroSecMatch) {
      return {
        type: OPERATION_TYPES.EPOCHMICROS_TO_DATETIME,
        fieldPath: epochMicroSecMatch[1].trim(),
        parameters: {
          format: epochMicroSecMatch[2]
        }
      }
    }

    // Format: convertdatetime($.path)
    const convertDateTimeMatch = trimmed.match(/^convertdatetime\((.*?)\)$/i)
    if (convertDateTimeMatch) {
      return {
        type: OPERATION_TYPES.CONVERT_DATETIME,
        fieldPath: convertDateTimeMatch[1].trim(),
        parameters: {}
      }
    }

    // Check for Math operations
    // Format: add($.field.path, value)
    const addMatch = trimmed.match(/^add\((.*?),\s*(-?\d+(?:\.\d+)?)\)$/i)
    if (addMatch) {
      return {
        type: OPERATION_TYPES.ADD,
        fieldPath: addMatch[1].trim(),
        parameters: {
          value: parseFloat(addMatch[2])
        }
      }
    }

    // Format: subtract($.field.path, value)
    const subtractMatch = trimmed.match(/^subtract\((.*?),\s*(-?\d+(?:\.\d+)?)\)$/i)
    if (subtractMatch) {
      return {
        type: OPERATION_TYPES.SUBTRACT,
        fieldPath: subtractMatch[1].trim(),
        parameters: {
          value: parseFloat(subtractMatch[2])
        }
      }
    }

    // Format: multiply($.field.path, value)
    const multiplyMatch = trimmed.match(/^multiply\((.*?),\s*(-?\d+(?:\.\d+)?)\)$/i)
    if (multiplyMatch) {
      return {
        type: OPERATION_TYPES.MULTIPLY,
        fieldPath: multiplyMatch[1].trim(),
        parameters: {
          value: parseFloat(multiplyMatch[2])
        }
      }
    }

    // Format: divide($.field.path, value)
    const divideMatch = trimmed.match(/^divide\((.*?),\s*(-?\d+(?:\.\d+)?)\)$/i)
    if (divideMatch) {
      return {
        type: OPERATION_TYPES.DIVIDE,
        fieldPath: divideMatch[1].trim(),
        parameters: {
          value: parseFloat(divideMatch[2])
        }
      }
    }

    // No operation found, treat as plain field path
    return {
      type: null,
      fieldPath: trimmed,
      parameters: {}
    }
  } catch (error) {
    console.error('[OperationParser] Error parsing operation:', error)
    return {
      type: null,
      fieldPath: inputRule || '',
      parameters: {}
    }
  }
}

/**
 * Normalize operation type to match OPERATION_TYPES constant (case-insensitive)
 * @param {string} type - Operation type to normalize
 * @returns {string|null} Normalized operation type or null if not found
 */
function normalizeOperationType (type) {
  if (!type) return null

  // Convert to string and get lowercase version for comparison
  const typeLower = String(type).toLowerCase()

  // Find matching OPERATION_TYPES constant (case-insensitive)
  for (const value of Object.values(OPERATION_TYPES)) {
    if (value && String(value).toLowerCase() === typeLower) {
      return value // Return the canonical constant value
    }
  }

  // If no match found, return original type (for backward compatibility)
  return type
}

/**
 * Build operation syntax string from components
 * Constructs the inputRule string with proper operation syntax
 *
 * @param {string} type - Operation type (from OPERATION_TYPES)
 * @param {string} fieldPath - JSON path to the field
 * @param {Object} parameters - Operation-specific parameters
 * @returns {string} Complete operation syntax
 *
 * @example
 * buildOperationSyntax('REGEX', '$.message', { pattern: '/IP: (\d+\.\d+\.\d+\.\d+)/', captureGroup: 1 })
 * // Returns: 'Regex($.message, /IP: (\d+\.\d+\.\d+\.\d+)/, 1)'
 */
export function buildOperationSyntax (type, fieldPath, parameters = {}) {
  try {
    // Normalize operation type for case-insensitive comparison
    const normalizedType = normalizeOperationType(type)

    // If no operation type, return field path as-is
    if (!normalizedType || normalizedType === OPERATION_TYPES.NONE) {
      return fieldPath || ''
    }

    switch (normalizedType) {
      case OPERATION_TYPES.REGEX:
        // Gracefully handle incomplete configuration - return null instead of throwing
        if (!parameters.pattern) {
          return null
        }
        if (parameters.captureGroup === undefined || parameters.captureGroup === null) {
          return null
        }
        // Format: Regex($.jsonPath, /pattern/, captureGroupName)
        // Pattern already includes slashes, captureGroup can be string or number
        return `Regex(${fieldPath},${parameters.pattern},${parameters.captureGroup})`

      case OPERATION_TYPES.LOOKUP:
        if (!parameters.tableName) {
          return null
        }
        return `LookUp(${parameters.tableName},${fieldPath})`

      case OPERATION_TYPES.LOOKUP_STARTS_WITH:
        if (!parameters.tableName) {
          return null
        }
        return `LookUpStartsWith(${parameters.tableName},${fieldPath})`

      case OPERATION_TYPES.PREFIX: {
        if (parameters.prefix === undefined || parameters.prefix === null) {
          return null
        }
        // Escape single quotes in prefix
        const escapedPrefix = parameters.prefix.replace(/'/g, "\\'")
        return `PREFIX('${escapedPrefix}')`
      }

      // String Operations
      case OPERATION_TYPES.ISIP:
        return `IsIP(${fieldPath},true)`

      case OPERATION_TYPES.SPLIT:
        if (parameters.delimiter === undefined || parameters.delimiter === null || parameters.index === undefined || parameters.index === null) {
          return null
        }
        return `SPLIT(${fieldPath},'${parameters.delimiter}',${parameters.index})`

      // Array Operations
      case OPERATION_TYPES.CONCAT: {
        // New format: concat(value1, delimiter1, value2, delimiter2, ...)
        if (!parameters.pairs || !Array.isArray(parameters.pairs) || parameters.pairs.length === 0) {
          return null
        }

        const args = []
        parameters.pairs.forEach((pair, index) => {
          // Add value (quote if static text, don't quote if JSON path)
          const value = pair.value.startsWith('$.')
            ? pair.value
            : `'${pair.value.replace(/'/g, "\\'")}'`
          args.push(value)

          // Add delimiter (always quote it, even if empty)
          // Always add delimiter argument for all pairs, including the last one
          // If delimiter is empty, output '' as an explicit argument
          const delimiter = pair.delimiter !== undefined && pair.delimiter !== null
            ? pair.delimiter
            : ''
          args.push(`'${delimiter.replace(/'/g, "\\'")}'`)
        })

        return `concat(${args.join(',')})`
      }

      case OPERATION_TYPES.CONCATARRAY: {
        if (parameters.delimiter === undefined || parameters.delimiter === null) {
          return null
        }
        return `ConcatArray(${fieldPath},'${parameters.delimiter}')`
      }

      // Type Conversion
      case OPERATION_TYPES.TOSTRING:
        return `tostring(${fieldPath})`

      // DateTime Operations (parameter-free)
      case OPERATION_TYPES.EPOCHSECS_TO_DATETIME:
        return `epochsectodatetime(${fieldPath})`

      case OPERATION_TYPES.EPOCHMILLIS_TO_DATETIME:
        return `epochmillitodatetime(${fieldPath})`

      case OPERATION_TYPES.EPOCHMICROS_TO_DATETIME:
        return `epochmicrotodatetime(${fieldPath})`

      case OPERATION_TYPES.CONVERT_DATETIME:
        return `convertdatetime(${fieldPath})`

      // Math Operations
      case OPERATION_TYPES.ADD:
        if (parameters.value === undefined) {
          return null
        }
        return `add(${fieldPath},${parameters.value})`

      case OPERATION_TYPES.SUBTRACT:
        if (parameters.value === undefined) {
          return null
        }
        return `subtract(${fieldPath},${parameters.value})`

      case OPERATION_TYPES.MULTIPLY:
        if (parameters.value === undefined) {
          return null
        }
        return `multiply(${fieldPath},${parameters.value})`

      case OPERATION_TYPES.DIVIDE:
        if (parameters.value === undefined) {
          return null
        }
        if (parameters.value === 0) {
          console.warn('[OperationParser] divide operation cannot have a value of 0 (division by zero)')
          return null
        }
        return `divide(${fieldPath},${parameters.value})`

      default:
        console.warn(`[OperationParser] Unknown operation type: ${type} (normalized: ${normalizedType})`)
        return fieldPath || ''
    }
  } catch (error) {
    console.error('[OperationParser] Error building operation syntax:', error)
    console.error('Error details:', error.stack)
    return fieldPath || ''
  }
}

/**
 * Get human-readable label for operation type
 *
 * @param {string} type - Operation type
 * @returns {string} Display label
 */
export function getOperationTypeLabel (type) {
  if (!type || type === OPERATION_TYPES.NONE) {
    return 'No Operation'
  }

  const metadata = OPERATION_METADATA[type]
  return metadata ? metadata.label : 'Unknown Operation'
}

/**
 * Get icon name for operation type
 *
 * @param {string} type - Operation type
 * @returns {string} Material icon name
 */
export function getOperationTypeIcon (type) {
  if (!type || type === OPERATION_TYPES.NONE) {
    return 'remove_circle_outline'
  }

  const metadata = OPERATION_METADATA[type]
  return metadata ? metadata.icon : 'help_outline'
}

/**
 * Get color for operation type
 *
 * @param {string} type - Operation type
 * @returns {string} Color hex code
 */
export function getOperationTypeColor (type) {
  if (!type || type === OPERATION_TYPES.NONE) {
    return '#9e9e9e'
  }

  const metadata = OPERATION_METADATA[type]
  return metadata ? metadata.color : '#9e9e9e'
}

/**
 * Validate regex pattern syntax
 *
 * @param {string} pattern - Regex pattern (with slashes)
 * @returns {Object} Validation result { isValid, error }
 */
export function validateRegexPattern (pattern) {
  try {
    if (!pattern || typeof pattern !== 'string') {
      return {
        isValid: false,
        error: 'Pattern is required'
      }
    }

    // Check for proper regex format with slashes
    if (!pattern.startsWith('/') || !pattern.endsWith('/')) {
      return {
        isValid: false,
        error: 'Pattern must be enclosed in forward slashes (e.g., /pattern/)'
      }
    }

    // Extract pattern without slashes
    const patternContent = pattern.slice(1, -1)

    if (!patternContent) {
      return {
        isValid: false,
        error: 'Pattern cannot be empty'
      }
    }

    // Try to create RegExp to validate syntax
    // If no error thrown, pattern is valid
    // eslint-disable-next-line no-new
    new RegExp(patternContent)

    return {
      isValid: true,
      error: null
    }
  } catch (error) {
    return {
      isValid: false,
      error: `Invalid regex syntax: ${error.message}`
    }
  }
}

/**
 * Validate capture group against pattern
 * Supports both numeric capture groups (0, 1, 2, ...) and named capture groups (e.g., 'username', 'email')
 *
 * @param {string} pattern - Regex pattern
 * @param {number|string} captureGroup - Capture group index or name
 * @returns {Object} Validation result { isValid, error, maxGroups }
 */
export function validateCaptureGroup (pattern, captureGroup) {
  try {
    if (captureGroup === undefined || captureGroup === null || captureGroup === '') {
      return {
        isValid: false,
        error: 'Capture group is required',
        maxGroups: 0
      }
    }

    // Check if it's a numeric capture group
    const isNumeric = /^\d+$/.test(String(captureGroup))

    if (isNumeric) {
      const numericGroup = parseInt(captureGroup, 10)

      if (numericGroup < 0) {
        return {
          isValid: false,
          error: 'Capture group cannot be negative',
          maxGroups: 0
        }
      }

      // Count capture groups in pattern
      const patternContent = pattern.slice(1, -1)
      const regex = new RegExp(patternContent)

      // Test with a sample string to count groups
      const testMatch = 'test sample string 123 456'.match(regex)
      const maxGroups = testMatch ? testMatch.length - 1 : 0

      if (numericGroup > maxGroups) {
        return {
          isValid: false,
          error: `Capture group ${numericGroup} not found. Pattern has ${maxGroups} group(s).`,
          maxGroups: maxGroups
        }
      }

      return {
        isValid: true,
        error: null,
        maxGroups: maxGroups
      }
    } else {
      // Named capture group - validate format (alphanumeric and underscore)
      const namedGroupPattern = /^[a-zA-Z_][a-zA-Z0-9_]*$/

      if (!namedGroupPattern.test(String(captureGroup))) {
        return {
          isValid: false,
          error: 'Named capture group must start with a letter or underscore and contain only alphanumeric characters and underscores',
          maxGroups: 0
        }
      }

      // Check if the named group exists in the pattern
      const patternContent = pattern.slice(1, -1)
      const namedGroupRegex = new RegExp(`\\(\\?<${captureGroup}>`)

      if (!namedGroupRegex.test(patternContent)) {
        return {
          isValid: false,
          error: `Named capture group '${captureGroup}' not found in pattern. Use syntax: (?<${captureGroup}>...)`,
          maxGroups: 0
        }
      }

      return {
        isValid: true,
        error: null,
        maxGroups: 0 // Named groups don't have numeric max
      }
    }
  } catch (error) {
    return {
      isValid: false,
      error: `Cannot validate capture group: ${error.message}`,
      maxGroups: 0
    }
  }
}

/**
 * Extract field name from JSON path for display
 *
 * @param {string} jsonPath - JSON path (e.g., "$.user.name")
 * @returns {string} Field name (e.g., "name")
 */
export function extractFieldName (jsonPath) {
  try {
    if (!jsonPath || typeof jsonPath !== 'string') {
      return ''
    }

    // Remove $ prefix and array notation
    const cleaned = jsonPath.replace(/^\$\.?/, '').replace(/\[\*\]/g, '').replace(/\[\d+\]/g, '')

    // Get last segment
    const parts = cleaned.split('.')
    return parts[parts.length - 1] || ''
  } catch (error) {
    console.error('[OperationParser] Error extracting field name:', error)
    return ''
  }
}

/**
 * Validate DateTime format pattern
 *
 * @param {string} format - DateTime format pattern
 * @returns {Object} Validation result { isValid, error }
 */
export function validateDateTimeFormat (format) {
  try {
    if (!format || typeof format !== 'string') {
      // Empty format is valid (uses default)
      return {
        isValid: true,
        error: null
      }
    }

    // Check for valid DateTime format characters
    const validChars = /^[yMdHhmsStTKzZ:\-/\s.]+$/
    if (!validChars.test(format)) {
      return {
        isValid: false,
        error: 'Format contains invalid characters. Use: y, M, d, H, h, m, s, S, t, T, K, z, Z, :, -, /, space, .'
      }
    }

    // Check for common mistakes
    if (format.includes('HH') && format.includes('tt')) {
      return {
        isValid: false,
        error: 'Cannot use 24-hour format (HH) with AM/PM (tt). Use hh for 12-hour format.'
      }
    }

    if (format.includes('YYYY')) {
      return {
        isValid: false,
        error: 'Use "yyyy" (lowercase) for year, not "YYYY"'
      }
    }

    if (format.includes('DD')) {
      return {
        isValid: false,
        error: 'Use "dd" (lowercase) for day, not "DD"'
      }
    }

    return {
      isValid: true,
      error: null
    }
  } catch (error) {
    return {
      isValid: false,
      error: `Format validation failed: ${error.message}`
    }
  }
}

export default {
  parseOperationFromInputRule,
  buildOperationSyntax,
  getOperationTypeLabel,
  getOperationTypeIcon,
  getOperationTypeColor,
  validateRegexPattern,
  validateCaptureGroup,
  extractFieldName,
  validateDateTimeFormat
}
