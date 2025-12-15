/**
 * Policy Validator Service
 * Provides validation for policy JSON files in update mode
 * Phase 1: File upload and validation only (no pre-fill functionality)
 */

/**
 * Validation result structure for policy files
 */
export class PolicyValidationResult {
  constructor () {
    this.valid = false
    this.errors = []
    this.warnings = []
    this.policy = null
    this.metadata = null
  }

  addError (message) {
    this.errors.push(message)
    this.valid = false
  }

  addWarning (message) {
    this.warnings.push(message)
  }

  hasErrors () {
    return this.errors.length > 0
  }

  hasWarnings () {
    return this.warnings.length > 0
  }
}

/**
 * Policy metadata extracted from validated policy
 */
export class PolicyMetadata {
  constructor (policy) {
    this.policyName = policy.name || null
    this.hasFilter = Boolean(policy.filter)
    this.hasTransforms = Boolean(policy.transforms && policy.transforms.length > 0)
    this.hasSchemaRule = Boolean(policy.schemaRule || policy.schemarule)
    this.hasSubTransforms = Boolean(policy.subtransforms && policy.subtransforms.length > 0)
    this.transformCount = policy.transforms ? policy.transforms.length : 0
    this.subTransformCount = policy.subtransforms ? policy.subtransforms.length : 0
    this.complexity = this.calculateComplexity(policy)
  }

  calculateComplexity (policy) {
    let score = 0

    if (policy.transforms) {
      score += policy.transforms.length
    }

    const schemaRule = policy.schemaRule || policy.schemarule
    if (schemaRule) {
      if (schemaRule.ConvertoJson || schemaRule.convertoJson || schemaRule.convertToJson) {
        const field = schemaRule.ConvertoJson || schemaRule.convertoJson || schemaRule.convertToJson
        score += (Array.isArray(field) ? field.length : 1) * 2
      }
      if (schemaRule.childfanouts || schemaRule.fanout) {
        const field = schemaRule.childfanouts || schemaRule.fanout
        score += (Array.isArray(field) ? field.length : 1) * 3
      }
    }

    if (policy.filter) {
      score += 5
    }

    if (policy.subtransforms) {
      score += policy.subtransforms.length * 2
    }

    if (score < 5) return 'simple'
    if (score < 15) return 'moderate'
    return 'complex'
  }
}

/**
 * Policy Validator Service
 * Main service for validating policy JSON files
 */
export class PolicyValidator {
  /**
   * File size limit (5MB)
   */
  static MAX_FILE_SIZE = 5 * 1024 * 1024

  /**
   * Validate a policy file
   * @param {File} file - The file object to validate
   * @returns {Promise<PolicyValidationResult>}
   */
  static async validatePolicyFile (file) {
    const result = new PolicyValidationResult()

    try {
      // Step 1: Validate file object and properties
      const fileValidation = this.validateFileProperties(file)
      if (!fileValidation.valid) {
        result.errors.push(...fileValidation.errors)
        result.warnings.push(...fileValidation.warnings)
        return result
      }

      // Step 2: Read file content
      let content
      try {
        content = await this.readFileContent(file)
      } catch (error) {
        result.addError(`Failed to read file: ${error.message}`)
        return result
      }

      // Step 3: Parse JSON content
      let parsedPolicy
      try {
        parsedPolicy = this.parseJsonContent(content)
      } catch (error) {
        result.addError(`Invalid JSON format: ${error.message}`)
        return result
      }

      // DEBUG: Log parsed policy structure
      console.log('[PolicyValidator] Parsed policy:', JSON.stringify(parsedPolicy, null, 2))

      // Step 4: Validate policy structure
      const structureValidation = this.validatePolicyStructure(parsedPolicy)
      if (!structureValidation.valid) {
        result.errors.push(...structureValidation.errors)
        result.warnings.push(...structureValidation.warnings)
        return result
      }

      // Step 5: Validate policy data types
      const dataTypeValidation = this.validatePolicyDataTypes(parsedPolicy)
      if (!dataTypeValidation.valid) {
        result.errors.push(...dataTypeValidation.errors)
        result.warnings.push(...dataTypeValidation.warnings)
      }

      // Step 6: Validate JSONPath expressions (basic)
      const pathValidation = this.validatePathExpressions(parsedPolicy)
      if (!pathValidation.valid) {
        result.warnings.push(...pathValidation.errors)
      }

      // Success: Extract metadata and mark as valid
      result.policy = parsedPolicy
      result.metadata = new PolicyMetadata(parsedPolicy)
      result.valid = !result.hasErrors()
      result.warnings.push(...structureValidation.warnings)

      return result
    } catch (error) {
      result.addError(`Unexpected error during validation: ${error.message}`)
      return result
    }
  }

  /**
   * Validate file properties (size, type, etc.)
   */
  static validateFileProperties (file) {
    const result = new PolicyValidationResult()

    if (!file) {
      result.addError('No file provided')
      return result
    }

    // Validate file type
    const fileName = file.name || ''
    if (!fileName.toLowerCase().endsWith('.json')) {
      result.addError('Invalid file type (must be .json)')
      return result
    }

    // Validate file size
    if (file.size > this.MAX_FILE_SIZE) {
      result.addError('File too large (max 5MB)')
      return result
    }

    // Check if file is empty
    if (file.size === 0) {
      result.addError('File is empty')
      return result
    }

    // File properties are valid
    result.valid = true
    return result
  }

  /**
   * Read file content as text
   */
  static readFileContent (file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()

      reader.onload = (event) => {
        resolve(event.target.result)
      }

      reader.onerror = () => {
        reject(new Error('Failed to read file'))
      }

      reader.readAsText(file)
    })
  }

  /**
   * Strip single-line comments (// ...) from JSON content
   * Preserves // inside quoted strings (e.g., URLs, paths)
   * @param {string} jsonString - Raw JSON content with potential comments
   * @returns {string} - Cleaned JSON without comments
   */
  static stripJsonComments (jsonString) {
    const lines = jsonString.split('\n')
    const cleanedLines = []

    for (const line of lines) {
      let inString = false
      let escaped = false
      let cleanLine = ''

      for (let i = 0; i < line.length; i++) {
        const char = line[i]
        const nextChar = line[i + 1]

        // Check for escape character
        if (char === '\\' && !escaped) {
          escaped = true
          cleanLine += char
          continue
        }

        // Check for string boundaries (double quotes)
        if (char === '"' && !escaped) {
          inString = !inString
          cleanLine += char
          escaped = false
          continue
        }

        // Check for comment start (outside strings)
        if (char === '/' && nextChar === '/' && !inString) {
          // Rest of line is a comment, stop processing this line
          break
        }

        cleanLine += char
        escaped = false
      }

      // Only add lines that have content after trimming
      const trimmed = cleanLine.trim()
      if (trimmed.length > 0) {
        cleanedLines.push(cleanLine)
      }
    }

    return cleanedLines.join('\n')
  }

  /**
   * Parse JSON content with error handling
   */
  static parseJsonContent (content) {
    if (!content || content.trim() === '') {
      throw new Error('File content is empty')
    }

    try {
      // Remove BOM if present
      let sanitized = content.replace(/^\uFEFF/, '').trim()

      // Log original content length for debugging
      console.log('[PolicyValidator] Original file length:', content.length, 'chars')

      // Strip comments from JSON content
      sanitized = this.stripJsonComments(sanitized)

      // Log cleaned content length for debugging
      console.log('[PolicyValidator] Cleaned file length:', sanitized.length, 'chars')
      console.log('[PolicyValidator] Stripped comments:', content.length - sanitized.length, 'chars')

      // Try to parse JSON
      const parsed = JSON.parse(sanitized)

      // Validate it's an object
      if (typeof parsed !== 'object' || parsed === null) {
        throw new Error('Policy must be a JSON object, not a primitive value')
      }

      return parsed
    } catch (error) {
      // Enhance error message
      if (error instanceof SyntaxError) {
        throw new Error(`Invalid JSON syntax: ${error.message}`)
      }
      throw error
    }
  }

  /**
   * Validate policy structure (required fields and format)
   */
  static validatePolicyStructure (policy) {
    const result = new PolicyValidationResult()

    if (!policy || typeof policy !== 'object') {
      result.addError('Policy must be an object')
      return result
    }

    // Check for policy name (recommended but not strictly required)
    if (!policy.name || typeof policy.name !== 'string' || policy.name.trim() === '') {
      result.addWarning('Policy name is missing or empty (recommended)')
    }

    // Normalize schemarule variants
    const schemaRule = policy.schemaRule || policy.schemarule
    const filter = policy.filter
    const transforms = policy.transforms
    const subtransforms = policy.subtransforms

    // Check that at least one of the main sections exists
    const hasTransforms = Array.isArray(transforms) && transforms.length > 0
    const hasSchemaRule = schemaRule && typeof schemaRule === 'object'
    const hasFilter = filter !== undefined && filter !== null && filter !== ''
    // hasSubTransforms is checked but not required for policy validation
    // It's tracked in PolicyMetadata for informational purposes only

    if (!hasTransforms && !hasSchemaRule && !hasFilter) {
      result.addError('Policy must contain at least one of: "filter", "transforms", or "schemaRule"')
      return result
    }

    // Validate transforms structure if present
    if (policy.transforms !== undefined) {
      if (!Array.isArray(transforms)) {
        result.addError('Field "transforms" must be an array')
      } else if (transforms.length === 0) {
        result.addWarning('Transforms array is empty')
      }
    }

    // Validate schemaRule structure if present
    if (schemaRule !== undefined) {
      if (typeof schemaRule !== 'object') {
        result.addError('Field "schemaRule" must be an object')
      } else {
        // Check schemaRule sub-fields
        const convertoJson = schemaRule.ConvertoJson || schemaRule.convertoJson || schemaRule.convertToJson
        const fanout = schemaRule.fanout
        const childfanouts = schemaRule.childfanouts

        // DEBUG: Log schemaRule validation
        console.log('[PolicyValidator] Validating schemaRule:', {
          hasSchemaRule: !!schemaRule,
          convertoJson: convertoJson,
          convertoJsonType: typeof convertoJson,
          convertoJsonIsNull: convertoJson === null,
          convertoJsonIsArray: Array.isArray(convertoJson),
          fanout: fanout,
          fanoutType: typeof fanout,
          fanoutIsNull: fanout === null,
          fanoutIsObject: typeof fanout === 'object',
          fanoutInputField: fanout?.inputField,
          fanoutInputFieldType: typeof fanout?.inputField,
          fanoutInputFieldIsNull: fanout?.inputField === null,
          fanoutInputFieldIsArray: Array.isArray(fanout?.inputField),
          childfanouts: childfanouts,
          childfanoutsType: typeof childfanouts,
          childfanoutsIsNull: childfanouts === null,
          childfanoutsIsArray: Array.isArray(childfanouts)
        })

        // Allow null/undefined for convertoJson - only validate if it's not null/undefined
        if (convertoJson !== undefined && convertoJson !== null && !Array.isArray(convertoJson)) {
          result.addError('Field "convertoJson" must be an array when provided')
        }

        // Validate fanout object and its inputField
        // fanout itself should be an object (or null/undefined)
        if (fanout !== undefined && fanout !== null) {
          if (typeof fanout !== 'object') {
            result.addError('Field "fanout" must be an object when provided')
          } else {
            // Now validate fanout.inputField if it exists
            const inputField = fanout.inputField
            // Only validate inputField if it's not null/undefined
            if (inputField !== undefined && inputField !== null && !Array.isArray(inputField)) {
              result.addError('Field "fanout.inputField" must be an array when provided')
            }
          }
        }

        // Allow null/undefined for childfanouts - only validate if it's not null/undefined
        if (childfanouts !== undefined && childfanouts !== null && !Array.isArray(childfanouts)) {
          result.addError('Field "childfanouts" must be an array when provided')
        }
      }
    }

    // Validate filter structure if present
    if (filter !== undefined && filter !== null) {
      if (typeof filter !== 'string') {
        result.addError('Field "filter" must be a string')
      }
    }

    // Validate subtransforms structure if present
    if (policy.subtransforms !== undefined) {
      if (!Array.isArray(subtransforms)) {
        result.addError('Field "subtransforms" must be an array')
      } else if (subtransforms.length === 0) {
        result.addWarning('SubTransforms array is empty')
      }
    }

    result.valid = !result.hasErrors()
    return result
  }

  /**
   * Validate data types in policy fields
   */
  static validatePolicyDataTypes (policy) {
    const result = new PolicyValidationResult()

    // Validate transforms if present
    if (Array.isArray(policy.transforms)) {
      policy.transforms.forEach((transform, index) => {
        if (typeof transform !== 'object') {
          result.addError(`Transform at index ${index} must be an object`)
          return
        }

        // Validate required transform fields
        if (!transform.sourcePath && !transform.inputRule) {
          result.addWarning(`Transform at index ${index} is missing "sourcePath" field`)
        }

        if (!transform.targetField && !transform.LRSchemaField) {
          result.addWarning(`Transform at index ${index} is missing "targetField" field`)
        }

        // Validate transformations array if present
        if (transform.transformations !== undefined) {
          if (!Array.isArray(transform.transformations)) {
            result.addError(`Transform at index ${index}: "transformations" must be an array`)
          }
        }
      })
    }

    // Validate schemaRule data types
    const schemaRule = policy.schemaRule || policy.schemarule
    if (schemaRule) {
      const convertoJson = schemaRule.ConvertoJson || schemaRule.convertoJson || schemaRule.convertToJson
      if (Array.isArray(convertoJson)) {
        convertoJson.forEach((path, index) => {
          if (typeof path !== 'string') {
            result.addError(`convertoJson at index ${index} must be a string`)
          }
        })
      }

      const fanout = schemaRule.fanout
      // Only validate fanout.inputField if it exists and is not null
      if (fanout && fanout.inputField !== null && fanout.inputField !== undefined) {
        if (Array.isArray(fanout.inputField)) {
          fanout.inputField.forEach((path, index) => {
            if (typeof path !== 'string') {
              result.addError(`fanout.inputField at index ${index} must be a string`)
            }
          })
        }
      }

      const childfanouts = schemaRule.childfanouts
      if (Array.isArray(childfanouts)) {
        childfanouts.forEach((fanout, index) => {
          if (typeof fanout !== 'object') {
            result.addError(`childfanout at index ${index} must be an object`)
            return
          }

          if (!fanout.field || typeof fanout.field !== 'string') {
            result.addError(`childfanout at index ${index} is missing "field" property`)
          }
        })
      }
    }

    // Validate subtransforms if present
    if (Array.isArray(policy.subtransforms)) {
      policy.subtransforms.forEach((subtransform, index) => {
        if (typeof subtransform !== 'object') {
          result.addError(`SubTransform at index ${index} must be an object`)
          return
        }

        // Validate condition field
        // - null: Acts as a catch-all/default case (always matches)
        // - string: JSONPath condition expression to evaluate
        // - undefined/missing: Also treated as catch-all
        if (subtransform.condition !== undefined &&
            subtransform.condition !== null &&
            typeof subtransform.condition !== 'string') {
          result.addError(`SubTransform at index ${index}: "condition" must be a string or null`)
        }

        if (!subtransform.transforms || !Array.isArray(subtransform.transforms)) {
          result.addError(`SubTransform at index ${index} is missing "transforms" array`)
        }
      })
    }

    result.valid = !result.hasErrors()
    return result
  }

  /**
   * Validate JSONPath expressions (basic validation)
   */
  static validatePathExpressions (policy) {
    const result = new PolicyValidationResult()

    // Helper to validate a path string
    const validatePath = (path, context) => {
      if (typeof path !== 'string') return

      // Basic JSONPath validation - must start with $ or @
      if (!path.startsWith('$') && !path.startsWith('@')) {
        result.addError(`${context}: Invalid JSONPath "${path}" (must start with $ or @)`)
      }

      // Check for common syntax errors
      if (path.includes('..') && path.includes('[*]')) {
        result.addWarning(`${context}: Path "${path}" uses both recursive descent (..) and array wildcard ([*]) which may be inefficient`)
      }
    }

    // Validate transforms paths
    if (Array.isArray(policy.transforms)) {
      policy.transforms.forEach((transform, index) => {
        if (transform.sourcePath) {
          validatePath(transform.sourcePath, `Transform ${index} sourcePath`)
        }
        if (transform.inputRule) {
          validatePath(transform.inputRule, `Transform ${index} inputRule`)
        }
      })
    }

    // Validate schemaRule paths
    const schemaRule = policy.schemaRule || policy.schemarule
    if (schemaRule) {
      const convertoJson = schemaRule.ConvertoJson || schemaRule.convertoJson || schemaRule.convertToJson
      if (Array.isArray(convertoJson)) {
        convertoJson.forEach((path, index) => {
          validatePath(path, `convertoJson ${index}`)
        })
      }

      const fanout = schemaRule.fanout
      // Only validate paths if fanout.inputField exists, is not null, and is an array
      if (fanout && fanout.inputField !== null && fanout.inputField !== undefined && Array.isArray(fanout.inputField)) {
        fanout.inputField.forEach((path, index) => {
          validatePath(path, `fanout.inputField ${index}`)
        })
      }

      const childfanouts = schemaRule.childfanouts
      if (Array.isArray(childfanouts)) {
        childfanouts.forEach((fanout, index) => {
          if (fanout.field) {
            validatePath(fanout.field, `childfanout ${index} field`)
          }
          if (fanout.parentpath) {
            validatePath(fanout.parentpath, `childfanout ${index} parentpath`)
          }
        })
      }
    }

    // Validate subtransform paths
    if (Array.isArray(policy.subtransforms)) {
      policy.subtransforms.forEach((subtransform, index) => {
        if (Array.isArray(subtransform.transforms)) {
          subtransform.transforms.forEach((transform, tIndex) => {
            if (transform.sourcePath) {
              validatePath(transform.sourcePath, `SubTransform ${index} Transform ${tIndex} sourcePath`)
            }
            if (transform.inputRule) {
              validatePath(transform.inputRule, `SubTransform ${index} Transform ${tIndex} inputRule`)
            }
          })
        }
      })
    }

    result.valid = !result.hasErrors()
    return result
  }
}

/**
 * Validate policy data object directly (for already-parsed policies)
 * @param {Object} policyData - Parsed policy object
 * @returns {PolicyValidationResult}
 */
export function validatePolicyData (policyData) {
  const result = new PolicyValidationResult()

  if (!policyData) {
    result.addError('No policy data provided')
    return result
  }

  // Validate structure
  const structureValidation = PolicyValidator.validatePolicyStructure(policyData)
  if (!structureValidation.valid) {
    result.errors.push(...structureValidation.errors)
    result.warnings.push(...structureValidation.warnings)
    return result
  }

  // Validate data types
  const dataTypeValidation = PolicyValidator.validatePolicyDataTypes(policyData)
  if (!dataTypeValidation.valid) {
    result.errors.push(...dataTypeValidation.errors)
    result.warnings.push(...dataTypeValidation.warnings)
  }

  // Validate path expressions
  const pathValidation = PolicyValidator.validatePathExpressions(policyData)
  if (!pathValidation.valid) {
    result.warnings.push(...pathValidation.errors)
  }

  // Success
  result.policy = policyData
  result.metadata = new PolicyMetadata(policyData)
  result.valid = !result.hasErrors()
  result.warnings.push(...structureValidation.warnings)

  return result
}

export default {
  PolicyValidator,
  PolicyValidationResult,
  PolicyMetadata,
  validatePolicyData
}
