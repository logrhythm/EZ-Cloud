/**
 * Schema Rule Service for JSON Policy Builder Wizard
 * Handles business logic for Step 3: Schema Rule Configuration
 * - Convert to JSON: Identifies and processes stringified JSON fields
 * - Fanout: Identifies array fields and builds parent path relationships
 */

import { DataProcessor } from './dataProcessingService.js'
import { PathNormalizer } from './pathNormalizer.js'

/**
 * Phase 3: Case-insensitive property access helper
 * Get a property from an object in a case-insensitive manner
 * @param {Object} obj - The object to search
 * @param {String} propertyName - The property name to find (case-insensitive)
 * @returns {*} The property value, or undefined if not found
 */
function getCaseInsensitiveProperty (obj, propertyName) {
  if (!obj || typeof obj !== 'object') return undefined

  const lowerPropName = propertyName.toLowerCase()
  const keys = Object.keys(obj)

  for (const key of keys) {
    if (key.toLowerCase() === lowerPropName) {
      return obj[key]
    }
  }

  return undefined
}

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
      return []
    }
    // Find all array fields in the structure
    const arrayPaths = DataProcessor.findArrayFields(dataStructure)
    // Build array field objects with metadata
    const arrayFields = []

    for (const path of arrayPaths) {
      const arrayInfo = this._analyzeArrayField(path, dataStructure)
      if (arrayInfo) {
        // Normalize path using PathNormalizer to show array hierarchy with [*]
        // This converts paths like "$.arr1[0].childarr[1]" to "arr1[*].childarr[*]"
        const normalizedPath = PathNormalizer.normalize(arrayInfo.path)
        const normalizedParentPath = arrayInfo.parentPath ? PathNormalizer.normalize(arrayInfo.parentPath) : null

        arrayFields.push({
          ...arrayInfo,
          path: normalizedPath,
          parentPath: normalizedParentPath
        })
      }
    }
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
      return null
    }

    // Normalize both paths for comparison (replace all array indices with [0])
    const normalizedTarget = targetPath.replace(/\[(\d+)\]/g, '[0]')
    const normalizedStructure = structure.path ? structure.path.replace(/\[(\d+)\]/g, '[0]') : ''

    // If this is the target node (compare normalized paths)
    if (normalizedStructure === normalizedTarget) {
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
   * This creates the new hierarchical structure with proper parent-child relationships
   *
   * Rules:
   * - Root-level arrays: parentpath = null, field has absolute path from root with $.
   * - Nested arrays: parentpath references parent array field, field is relative to parent
   * - Every non-null parentpath must exist as a field value elsewhere in childfanouts
   * - All array paths must use [*] notation
   *
   * @param {Array} selectedArrayPaths - Array of selected array field paths
   * @param {Array} allArrayFields - All available array field metadata
   * @returns {Array} Childfanouts array structure for policy
   */
  static buildChildFanouts (selectedArrayPaths, allArrayFields) {
    // Handle empty or invalid input
    if (!selectedArrayPaths || !Array.isArray(selectedArrayPaths) || selectedArrayPaths.length === 0) {
      return []
    }

    if (!allArrayFields || !Array.isArray(allArrayFields) || allArrayFields.length === 0) {
      // If no metadata is provided, construct synthetic metadata for the selected paths
      const syntheticFields = selectedArrayPaths.map(path => ({
        path: path,
        isHomogeneous: true,
        elementType: 'unknown',
        sampleSize: 1,
        parentPath: null,
        isSynthetic: true
      }))
      allArrayFields = syntheticFields
    }

    // Normalize all paths to ensure they start with $ and have [*] notation
    const normalizedPaths = selectedArrayPaths.map(path => this._normalizeArrayPathForPolicy(path))

    // Build parent-child relationships
    // Sort paths by depth (root arrays first, then nested arrays)
    const sortedPaths = [...normalizedPaths].sort((a, b) => {
      const depthA = (a.match(/\./g) || []).length
      const depthB = (b.match(/\./g) || []).length
      return depthA - depthB
    })

    const childfanouts = []
    // Map to track full path -> field value mapping
    const pathToFieldMap = new Map()

    // Process each path to determine its parent
    for (const currentPath of sortedPaths) {
      // Find the immediate parent (longest matching path that's not the current path)
      let parentFullPath = null
      let longestMatch = 0

      for (const potentialParent of sortedPaths) {
        if (potentialParent === currentPath) continue

        // Check if currentPath is nested within potentialParent
        // For a path to be a parent, the child path must start with parent path
        // and have additional segments after it
        if (currentPath.startsWith(potentialParent)) {
          // Extract the part after the parent path
          const remainder = currentPath.substring(potentialParent.length)

          // Check if remainder starts with a dot or bracket (indicates nesting)
          if (remainder.startsWith('.') || remainder.startsWith('[')) {
            // This is a valid parent relationship
            // Use the longest (most specific) parent
            if (potentialParent.length > longestMatch) {
              longestMatch = potentialParent.length
              parentFullPath = potentialParent
            }
          }
        }
      }

      // Determine the field path
      let fieldPath = currentPath

      if (parentFullPath) {
        // This is a nested array - make the path relative to parent
        let remainder = currentPath.substring(parentFullPath.length)

        // Build relative path starting with $
        // CRITICAL: Preserve [*] notation in the remainder
        if (remainder.startsWith('.')) {
          // Example: $.outerArray[*].innerArray[*] with parent $.outerArray[*]
          // remainder = ".innerArray[*]"
          // fieldPath should be "$.innerArray[*]"
          fieldPath = '$' + remainder
        } else if (remainder.startsWith('[')) {
          // Handle case where nested array is accessed via bracket notation
          // e.g., parent is $.items[*] and child is $.items[*][*].subArray[*]
          // remainder = "[*].subArray[*]" → should become "$.subArray[*]"
          // Remove the leading [*] and optional dot
          remainder = remainder.replace(/^\[\*\]\.?/, '')

          // Also remove any numeric [0] indices that might still be there
          remainder = remainder.replace(/^\[\d+\]\.?/, '')

          if (remainder.startsWith('.')) {
            fieldPath = '$' + remainder
          } else if (remainder) {
            fieldPath = '$.' + remainder
          } else {
            // Edge case: remainder is empty after stripping [*]
            // This shouldn't happen with properly normalized paths
            fieldPath = currentPath
          }
        } else {
          // Fallback: use full path with $
          fieldPath = '$.' + remainder.replace(/^\./, '')
        }

        // CRITICAL FIX: Ensure the field path ends with [*] for arrays
        // If the original currentPath had [*] but our fieldPath doesn't, add it
        if (currentPath.endsWith('[*]') && !fieldPath.endsWith('[*]')) {
          fieldPath += '[*]'
        }
      } else {
        // Root-level array - use absolute path as-is (already starts with $)
      }

      // Store the mapping of full path to field value
      pathToFieldMap.set(currentPath, fieldPath)

      // Get the parentpath value: use the parent's field value from the map
      // This ensures parentpath references the parent entry's field value
      const parentpathValue = parentFullPath ? pathToFieldMap.get(parentFullPath) : null

      // Add to childfanouts array
      childfanouts.push({
        field: fieldPath,
        parentpath: parentpathValue
      })
    }
    childfanouts.forEach((cf, idx) => {
    })
    return childfanouts
  }

  /**
   * Build datafanout structure according to the new schema rules
   *
   * Rules:
   * 1. Single array: datafanout = that array, childfanouts = null
   * 2. Multiple arrays with one top-level: datafanout = top array, childfanouts = children
   * 3. Multiple top-level arrays: datafanout = null, childfanouts = all arrays
   *
   * @param {Array} selectedArrayPaths - Array paths selected by user (e.g., ["Log.Records", "Log.Records[*].changes"])
   * @param {Array} allArrayFields - All available array field metadata (with parentPath info)
   * @returns {Object} Object with { datafanout: string|null, childfanouts: Array|null }
   */
  static buildDataFanoutStructure (selectedArrayPaths, allArrayFields) {
    // Handle empty or invalid input
    if (!selectedArrayPaths || !Array.isArray(selectedArrayPaths) || selectedArrayPaths.length === 0) {
      return { datafanout: null, childfanouts: null }
    }

    // Normalize all paths
    const normalizedPaths = selectedArrayPaths.map(path => this._normalizeArrayPathForPolicy(path))

    // Rule 1: Single array selection
    if (normalizedPaths.length === 1) {
      return {
        datafanout: normalizedPaths[0],
        childfanouts: null
      }
    }

    // Find top-level arrays (those with parentpath = null)
    const topLevelArrays = []
    const childArrays = []

    normalizedPaths.forEach(path => {
      // Find metadata for this path (case-insensitive)
      const metadata = allArrayFields?.find(field =>
        field.path && field.path.toLowerCase() === path.toLowerCase()
      )

      // Check if it's a top-level array
      // A top-level array has no parent or its parent is null
      const isTopLevel = !metadata?.parentPath || metadata.parentPath === null || metadata.parentPath === ''

      if (isTopLevel) {
        topLevelArrays.push(path)
      } else {
        childArrays.push({
          path: path,
          parentPath: metadata.parentPath
        })
      }
    })

    // Rule 2: Multiple arrays with one top-level array
    if (topLevelArrays.length === 1) {
      // Build childfanouts using existing method
      const childfanouts = this.buildChildFanouts(normalizedPaths, allArrayFields)

      // Filter out the top-level array from childfanouts (it should only contain children)
      const topLevelPath = topLevelArrays[0]
      const filteredChildfanouts = childfanouts.filter(cf => {
        // Case-insensitive comparison
        return cf.field.toLowerCase() !== topLevelPath.toLowerCase()
      })

      return {
        datafanout: topLevelPath,
        childfanouts: filteredChildfanouts.length > 0 ? filteredChildfanouts : null
      }
    }

    // Rule 3: Multiple top-level arrays
    const childfanouts = this.buildChildFanouts(normalizedPaths, allArrayFields)

    return {
      datafanout: null,
      childfanouts: childfanouts
    }
  }

  /**
   * Helper method to normalize array path for policy export
   * @param {string} path - Array path to normalize
   * @returns {string} Normalized path
   * @private
   */
  static _normalizeArrayPathForPolicy (path) {
    if (!path || typeof path !== 'string') {
      return path
    }

    // Remove any leading/trailing whitespace
    let normalized = path.trim()

    // Step 1: Remove any leading array notation that represents root-level array access
    // Examples: "[0].field" → "field", "$[0].field" → "field"
    if (normalized.startsWith('[')) {
      normalized = normalized.replace(/^\[\d+\]\.?/, '').replace(/^\[\*\]\.?/, '')
    }
    if (normalized.startsWith('$[')) {
      normalized = normalized.replace(/^\$\[\d+\]\.?/, '').replace(/^\$\[\*\]\.?/, '')
    }

    // Step 2: Ensure path starts with $.
    if (!normalized.startsWith('$')) {
      normalized = `$.${normalized}`
    }

    // Step 3: Replace all numeric array indices [0], [1], etc. with [*]
    // This handles both single and nested arrays correctly
    // Example: $.outerArray[0].innerArray[5] → $.outerArray[*].innerArray[*]
    normalized = normalized.replace(/\[\d+\]/g, '[*]')

    // Step 4: If the path doesn't end with [*], append it
    // This handles cases where the input is just an attribute name without indices
    // Example: "$.tags" → "$.tags[*]"
    if (!normalized.endsWith('[*]')) {
      normalized += '[*]'
    }

    return normalized
  }

  /**
   * Deduplicate fanout candidates using case-insensitive path matching
   * This prevents duplicate array paths when both $.Log and $.LOG are selected
   *
   * @param {Array} candidates - Array of fanout candidate objects with {path, ...}
   * @returns {Array} Deduplicated array of fanout candidates
   */
  static deduplicateFanoutCandidates (candidates) {
    if (!candidates || !Array.isArray(candidates) || candidates.length === 0) {
      return []
    }
    // Use a Map with lowercase path as key to detect duplicates
    const uniqueCandidatesMap = new Map()

    candidates.forEach(candidate => {
      const path = candidate.path
      if (!path) return

      const lowerPath = path.toLowerCase()

      // If we haven't seen this path (case-insensitive), add it
      if (!uniqueCandidatesMap.has(lowerPath)) {
        uniqueCandidatesMap.set(lowerPath, candidate)
      }
    })

    const deduplicated = Array.from(uniqueCandidatesMap.values())
    return deduplicated
  }

  /**
   * Validate that an array path has correct format
   * @param {string} path - Path to validate
   * @returns {boolean} True if valid
   * @private
   */
  static _isValidArrayPath (path) {
    if (!path || typeof path !== 'string') {
      return false
    }

    // Path must end with [*]
    if (!path.endsWith('[*]')) {
      return false
    }

    // Path must start with $.
    if (!path.startsWith('$.')) {
      return false
    }

    // No $.[*] or $[*]. patterns allowed at the START (bracket must be suffix to attribute name, not prefix)
    if (path.includes('$.[*]') || path.includes('$[*].')) {
      return false
    }

    // Check for invalid patterns where [*] comes BEFORE the attribute name
    // Invalid: $.[*]attr, Valid: $.attr[*] or $.parent[*].child[*]
    // The pattern .[*] is only valid if followed by a dot (for nested arrays)
    // Use regex to ensure [*] is always a suffix: must be followed by end-of-string or a dot
    const validPattern = /^\$\.([a-zA-Z0-9_]+\[\*\])(\.([a-zA-Z0-9_]+\[\*\]))*$/
    if (!validPattern.test(path)) {
      return false
    }

    return true
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
   * Validate Step 3 selections including childfanouts structure
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
    const hasChildFanouts = schemaRules.childfanouts && schemaRules.childfanouts.length > 0

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

    // Validate childfanouts structure
    if (hasChildFanouts) {
      const childFanoutsValidation = this.validateChildFanouts(schemaRules.childfanouts)
      if (!childFanoutsValidation.isValid) {
        result.isValid = false
        result.errors.push(...childFanoutsValidation.errors)
      }
      if (childFanoutsValidation.warnings.length > 0) {
        result.warnings.push(...childFanoutsValidation.warnings)
      }
    }

    return result
  }

  /**
   * Validate childfanouts array structure
   * @param {Array} childfanouts - Childfanouts array to validate
   * @returns {Object} Validation result with isValid, errors, and warnings
   */
  static validateChildFanouts (childfanouts) {
    const result = {
      isValid: true,
      errors: [],
      warnings: []
    }

    if (!childfanouts || !Array.isArray(childfanouts)) {
      result.isValid = false
      result.errors.push('Childfanouts must be an array')
      return result
    }

    if (childfanouts.length === 0) {
      // Empty array is valid
      return result
    }

    // Track all field values for validation
    const fieldValues = new Set()
    const parentpathValues = new Set()

    // Validate each childfanout entry
    for (let i = 0; i < childfanouts.length; i++) {
      const entry = childfanouts[i]

      // 1. Validate structure
      if (!entry || typeof entry !== 'object') {
        result.isValid = false
        result.errors.push(`Childfanout entry ${i} is not an object`)
        continue
      }

      if (!entry.field || typeof entry.field !== 'string') {
        result.isValid = false
        result.errors.push(`Childfanout entry ${i} missing or invalid 'field' property`)
        continue
      }

      if (entry.parentpath !== null && typeof entry.parentpath !== 'string') {
        result.isValid = false
        result.errors.push(`Childfanout entry ${i} has invalid 'parentpath' property (must be string or null)`)
        continue
      }

      // 2. Validate path format - all paths must use [*] notation
      if (!entry.field.includes('[*]')) {
        result.isValid = false
        result.errors.push(`Childfanout entry ${i} field "${entry.field}" must use [*] notation for arrays`)
      }

      if (entry.parentpath && !entry.parentpath.includes('[*]')) {
        result.isValid = false
        result.errors.push(`Childfanout entry ${i} parentpath "${entry.parentpath}" must use [*] notation for arrays`)
      }

      // 3. Check for duplicate field values
      if (fieldValues.has(entry.field)) {
        result.isValid = false
        result.errors.push(`Duplicate field value found: "${entry.field}"`)
      }
      fieldValues.add(entry.field)

      // 4. Track parentpath values
      if (entry.parentpath !== null) {
        parentpathValues.add(entry.parentpath)
      }
    }

    // 5. Validate that every non-null parentpath exists as a field value
    for (const parentpath of parentpathValues) {
      if (!fieldValues.has(parentpath)) {
        result.isValid = false
        result.errors.push(`Parentpath "${parentpath}" does not exist as a field in childfanouts`)
      }
    }

    // 6. Check for circular references
    const circularCheck = this._checkCircularReferences(childfanouts)
    if (!circularCheck.isValid) {
      result.isValid = false
      result.errors.push(...circularCheck.errors)
    }

    return result
  }

  /**
   * Check for circular references in childfanouts
   * @param {Array} childfanouts - Childfanouts array
   * @returns {Object} Validation result
   * @private
   */
  static _checkCircularReferences (childfanouts) {
    const result = {
      isValid: true,
      errors: []
    }

    // Build parent-child map
    const parentMap = new Map()
    for (const entry of childfanouts) {
      if (entry.parentpath !== null) {
        parentMap.set(entry.field, entry.parentpath)
      }
    }

    // Check each field for circular references by traversing up the parent chain
    for (const entry of childfanouts) {
      const visited = new Set()
      let current = entry.field

      while (current) {
        if (visited.has(current)) {
          result.isValid = false
          result.errors.push(`Circular reference detected in path: ${Array.from(visited).join(' -> ')} -> ${current}`)
          break
        }

        visited.add(current)
        current = parentMap.get(current)
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

      // Normalize path using PathNormalizer to show array hierarchy with [*]
      const normalizedPath = PathNormalizer.normalize(metadata.path)
      const normalizedParentPath = metadata.parentPath ? PathNormalizer.normalize(metadata.parentPath) : null

      arrayFields.push({
        path: normalizedPath,
        isHomogeneous: metadata.isHomogeneous,
        elementType: metadata.elementType || 'unknown',
        sampleSize: Math.min(metadata.sampleSize, 25), // Cap at 25 as per spec
        parentPath: normalizedParentPath
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
    const result = {
      success: false,
      parsedData: null,
      arrayPaths: [],
      error: null
    }

    try {
      // Get the field value from the data
      const fieldValue = this._getValueByPath(data, fieldPath)
      if (!fieldValue || typeof fieldValue !== 'string') {
        result.error = 'Field is not a string'
        return result
      }

      // Try to parse the JSON string
      const parsedValue = JSON.parse(fieldValue)
      result.parsedData = parsedValue
      result.success = true
      // Find all array paths within the parsed structure
      result.arrayPaths = this._findArrayPathsInParsedJson(parsedValue, fieldPath)
      result.arrayPaths.forEach((arr, idx) => {
      })
      return result
    } catch (error) {
      result.error = `Failed to parse JSON: ${error.message}`
      return result
    }
  }

  /**
   * Find all array paths within a parsed JSON structure
   * Supports nested fanout arrays where child arrays are relative to parent array context
   * @param {*} data - The parsed JSON data
   * @param {string} parentPath - The parent field path (e.g., "$.log" or "log")
   * @param {string} currentPath - Current path within the parsed structure
   * @returns {Array} Array of array path objects
   * @private
   */
  static _findArrayPathsInParsedJson (data, parentPath, currentPath = '') {
    const arrayPaths = []

    // Normalize parentPath: Remove $.  prefix to ensure consistent path format
    // This ensures all generated fanout array paths are without the $. prefix
    const normalizedParentPath = parentPath.startsWith('$.') ? parentPath.substring(2) : parentPath

    // Helper to build the full path (without $. prefix)
    const buildFullPath = (subPath) => {
      return !subPath ? normalizedParentPath : `${normalizedParentPath}.${subPath}`
    }

    // Recursive traversal with parent array tracking
    const traverse = (obj, path = '', insideArrayContext = null) => {
      if (obj === null || obj === undefined) return

      if (Array.isArray(obj)) {
        // Found an array
        const fullPath = buildFullPath(path)
        const arrayInfo = this._analyzeArrayStructure(obj)

        // Determine if this is a root array or nested array
        const isNestedArray = insideArrayContext !== null
        const relativePath = isNestedArray
          ? path.replace(/^\$\./, '') // Remove $. prefix for relative paths
          : path || '(root)'
        arrayPaths.push({
          path: fullPath,
          relativePath: relativePath,
          isHomogeneous: arrayInfo.isHomogeneous,
          elementType: arrayInfo.elementType,
          sampleSize: obj.length,
          parentPath: isNestedArray ? insideArrayContext : normalizedParentPath,
          isParsedField: true, // Mark as coming from a parsed field
          isNestedFanout: isNestedArray // Flag to indicate this is a nested fanout array
        })

        // Traverse array elements to find nested arrays
        // Pass the current array's full path as the parent context for nested arrays
        if (obj.length > 0 && typeof obj[0] === 'object' && obj[0] !== null) {
          // Continue traversal inside the array element, marking we're in an array context
          // Start with empty string so fieldPath builds correctly from root
          traverseObject(obj[0], '', fullPath)
        }
      } else if (typeof obj === 'object') {
        // Traverse object properties
        for (const key in obj) {
          const nextPath = path ? `${path}.${key}` : key
          traverse(obj[key], nextPath, insideArrayContext)
        }
      }
    }

    // Separate function to traverse object properties inside an array element
    const traverseObject = (obj, pathPrefix, parentArrayPath) => {
      if (!obj || typeof obj !== 'object') return

      for (const key in obj) {
        const value = obj[key]
        const fieldPath = pathPrefix ? `${pathPrefix}.${key}` : key

        if (Array.isArray(value)) {
          // Found a nested array inside a parent array element
          const arrayInfo = this._analyzeArrayStructure(value)

          // Build the absolute path by combining parent + child
          // The fieldPath is already relative to the array element, so just append it
          const absolutePath = `${parentArrayPath}[*].${fieldPath}`

          arrayPaths.push({
            path: absolutePath, // Store fully-qualified absolute path
            relativePath: `$.${fieldPath}`, // Relative path with $. prefix for reference
            isHomogeneous: arrayInfo.isHomogeneous,
            elementType: arrayInfo.elementType,
            sampleSize: value.length,
            parentPath: parentArrayPath, // Reference to parent array
            isParsedField: true,
            isNestedFanout: true // This is a nested fanout array
          })

          // Continue traversing deeper into nested array elements
          // CRITICAL FIX: Reset pathPrefix to empty string when entering a new array context
          // This prevents path duplication in deeply nested arrays
          if (value.length > 0 && typeof value[0] === 'object' && value[0] !== null) {
            traverseObject(value[0], '', absolutePath)
          }
        } else if (value && typeof value === 'object') {
          // Continue traversing nested objects
          traverseObject(value, fieldPath, parentArrayPath)
        }
      }
    }

    traverse(data)

    // CRITICAL: Normalize all paths using PathNormalizer to ensure consistent format
    // This prevents duplicates caused by different path formats
    const normalizedArrayPaths = arrayPaths.map(arrayPath => {
      // Normalize both path and parentPath using PathNormalizer
      const normalizedPath = PathNormalizer.normalize(arrayPath.path)
      const normalizedParentPath = arrayPath.parentPath ? PathNormalizer.normalize(arrayPath.parentPath) : null

      return {
        ...arrayPath,
        path: normalizedPath,
        parentPath: normalizedParentPath
      }
    })
    return normalizedArrayPaths
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
   * Phase 3: Updated to use case-insensitive property access
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
        // Phase 3: Use case-insensitive property access for object properties
        current = getCaseInsensitiveProperty(current, part)
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
    // Create a map of existing candidates by NORMALIZED path for proper deduplication
    // Normalize paths to avoid duplicates due to different formats (with/without $. prefix)
    const candidateMap = new Map()

    // Helper to normalize path for deduplication
    const normalizePath = (path) => {
      // Remove $. prefix if present
      let normalized = path.startsWith('$.') ? path.substring(2) : path
      // Replace numeric indices with [*] for consistency
      normalized = normalized.replace(/\[\d+\]/g, '[*]')
      return normalized
    }

    // Add existing candidates
    for (const candidate of existingCandidates) {
      const normalizedPath = normalizePath(candidate.path)
      // Only add if not already present (first wins in case of duplicates)
      if (!candidateMap.has(normalizedPath)) {
        candidateMap.set(normalizedPath, {
          ...candidate,
          path: candidate.path // Keep original path format
        })
      }
    }

    // Add parsed arrays
    for (const parsedArray of parsedArrays) {
      const normalizedPath = normalizePath(parsedArray.path)
      // Only add if not already present
      if (!candidateMap.has(normalizedPath)) {
        candidateMap.set(normalizedPath, {
          ...parsedArray,
          path: parsedArray.path // Keep original path format
        })
      }
    }

    const result = Array.from(candidateMap.values())
    return result
  }

  /**
   * Remove parsed arrays from fanout candidates when a JSON field is deselected
   * @param {Array} candidates - Current fanout candidates
   * @param {string} jsonFieldPath - The path to the deselected JSON field
   * @returns {Array} Updated fanout candidates
   */
  static removeParsedArraysFromField (candidates, jsonFieldPath) {
    // Filter out candidates that came from this parsed field
    const filtered = candidates.filter(candidate => {
      // Check if this candidate is from the parsed field
      const shouldRemove = candidate.isParsedField && candidate.parentPath === jsonFieldPath
      return !shouldRemove
    })
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
