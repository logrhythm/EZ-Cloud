/**
 * Validation Service for JSON Policy Builder Wizard
 * Provides comprehensive validation logic for all wizard steps
 */

/**
 * Validation rule types
 */
const ValidationRuleTypes = {
  REQUIRED: 'required',
  MIN_LENGTH: 'minLength',
  MAX_LENGTH: 'maxLength',
  PATTERN: 'pattern',
  CUSTOM: 'custom',
  JSON_FORMAT: 'jsonFormat',
  FILE_TYPE: 'fileType',
  FILE_SIZE: 'fileSize'
}

/**
 * Validation error severity levels
 */
const ValidationSeverity = {
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info'
}

/**
 * Step 1: Introduction validation rules
 */
const Step1ValidationRules = {
  projectName: {
    required: true,
    minLength: 3,
    maxLength: 100,
    pattern: /^[a-zA-Z0-9\s\-_]+$/,
    messages: {
      required: 'Policy name is required',
      minLength: 'Policy name must be at least 3 characters',
      maxLength: 'Policy name must not exceed 100 characters',
      pattern: 'Policy name can only contain letters, numbers, spaces, hyphens, and underscores'
    }
  },
  projectDescription: {
    required: false,
    maxLength: 500,
    messages: {
      maxLength: 'Description must not exceed 500 characters'
    }
  },
  policyFile: {
    required: true,
    fileType: ['.json'],
    maxFileSize: 5 * 1024 * 1024, // 5MB
    messages: {
      required: 'Policy file is required when updating an existing policy',
      fileType: 'Only JSON files are accepted',
      maxFileSize: 'File size must be less than 5MB'
    }
  }
}

/**
 * Validation result structure
 */
class ValidationResult {
  constructor (isValid = true, errors = [], warnings = [], info = []) {
    this.isValid = isValid
    this.errors = errors
    this.warnings = warnings
    this.info = info
  }

  addError (field, message, severity = ValidationSeverity.ERROR) {
    const error = { field, message, severity, timestamp: Date.now() }

    if (severity === ValidationSeverity.ERROR) {
      this.errors.push(error)
      this.isValid = false
    } else if (severity === ValidationSeverity.WARNING) {
      this.warnings.push(error)
    } else {
      this.info.push(error)
    }
  }

  // Convenience helpers
  addWarning (field, message) {
    this.addError(field, message, ValidationSeverity.WARNING)
  }

  addInfo (field, message) {
    this.addError(field, message, ValidationSeverity.INFO)
  }

  hasErrors () {
    return this.errors.length > 0
  }

  hasWarnings () {
    return this.warnings.length > 0
  }

  getErrorsByField (field) {
    return this.errors.filter(e => e.field === field)
  }

  getAllMessages () {
    return [...this.errors, ...this.warnings, ...this.info]
  }
}

/**
 * Base Validator class
 */
class Validator {
  /**
   * Validate a field against a set of rules
   * fieldName: optional field key to use when emitting errors (defaults to 'value')
   */
  static validateField (value, rules, fieldName = 'value') {
    const result = new ValidationResult()

    // Normalize value for checks
    const isNullish = value === null || value === undefined
    const normalized = isNullish ? '' : value

    // Required validation
    if (rules.required && !this.isPresent(normalized)) {
      result.addError(fieldName, rules.messages?.required || 'This field is required')
      return result
    }

    // Skip other validations if value is empty and not required
    if (!this.isPresent(normalized) && !rules.required) {
      return result
    }

    // Min length validation
    if (rules.minLength && String(normalized).length < rules.minLength) {
      result.addError(fieldName, rules.messages?.minLength || `Minimum length is ${rules.minLength} characters`)
    }

    // Max length validation
    if (rules.maxLength && String(normalized).length > rules.maxLength) {
      result.addError(fieldName, rules.messages?.maxLength || `Maximum length is ${rules.maxLength} characters`)
    }

    // Pattern validation
    if (rules.pattern && typeof normalized === 'string' && !rules.pattern.test(normalized)) {
      result.addError(fieldName, rules.messages?.pattern || 'Invalid format')
    }

    // Custom validation
    if (rules.custom && typeof rules.custom === 'function') {
      const customResult = rules.custom(normalized)
      if (customResult && customResult.isValid === false) {
        result.addError(fieldName, customResult.message || 'Validation failed')
      }
    }

    return result
  }

  /**
   * Check if value is present (not null, undefined, or empty string)
   */
  static isPresent (value) {
    return value !== null && value !== undefined && value !== ''
  }

  /**
   * Sanitize input to prevent XSS
   */
  static sanitizeInput (input) {
    if (typeof input !== 'string') return input

    return input
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
  }

  /**
   * Validate email format
   */
  static isValidEmail (email) {
    // Simple email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  /**
   * Validate URL format
   */
  static isValidUrl (url) {
    try {
      const urlObj = new URL(url)
      return Boolean(urlObj)
    } catch {
      return false
    }
  }
}

/**
 * Step 1 specific validators
 */
class Step1Validator extends Validator {
  /**
   * Validate project name
   */
  static validateProjectName (name) {
    const rules = Step1ValidationRules.projectName
    const normalized = (typeof name === 'string') ? name.trim() : ''
    const result = this.validateField(normalized, rules, 'name')

    // Additional business logic validation
    if (result.isValid && normalized) {
      // Check for reserved names
      const reservedNames = ['system', 'default', 'admin', 'root', 'test']
      const lowerName = normalized.toLowerCase()
      if (reservedNames.includes(lowerName)) {
        result.addWarning('name', 'This name is reserved and cannot be used')
      }

      // Check for common naming issues
      if (normalized.includes('  ')) {
        result.addWarning('name', 'Multiple consecutive spaces are not recommended')
      }
    }

    return result
  }

  /**
   * Validate project description
   */
  static validateProjectDescription (description) {
    const rules = Step1ValidationRules.projectDescription
    const normalized = (typeof description === 'string') ? description.trim() : ''
    return this.validateField(normalized, rules, 'description')
  }

  /**
   * Validate complete Step 1 data for "create" mode
   */
  static validateCreateMode (projectConfig = {}) {
    const result = new ValidationResult()

    // Validate project name
    const nameResult = this.validateProjectName(projectConfig.name)
    if (!nameResult.isValid) {
      nameResult.errors.forEach(error => result.addError('name', error.message))
    }
    nameResult.warnings.forEach(warning => result.addWarning('name', warning.message))

    // Validate description (optional but recommended)
    const descResult = this.validateProjectDescription(projectConfig.description)
    if (!descResult.isValid) {
      descResult.errors.forEach(error => result.addError('description', error.message))
    }

    // Add recommendation if description is missing
    const descVal = projectConfig.description ? String(projectConfig.description).trim() : ''
    if (!descVal) {
      result.addInfo('description', 'Adding a description helps document the policy purpose')
    }

    return result
  }

  /**
   * Validate complete Step 1 data for "update" mode
   */
  static validateUpdateMode (projectConfig = {}, existingPolicy) {
    const result = new ValidationResult()

    // Validate existing policy is provided
    if (!existingPolicy) {
      result.addError('existingPolicy', 'Policy file is required for update mode')
      return result
    }

    // Validate policy structure
    const policyValidation = this.validatePolicyStructure(existingPolicy)
    if (!policyValidation.isValid) {
      policyValidation.errors.forEach(error => result.addError('existingPolicy', error.message))
    }

    // Auto-populate validation (informational)
    if (existingPolicy && existingPolicy.name && !projectConfig.name) {
      result.addInfo('name', 'Policy name can be auto-populated from file')
    }

    return result
  }

  /**
   * Validate policy file structure
   */
  static validatePolicyStructure (policy) {
    const result = new ValidationResult()

    if (!policy || typeof policy !== 'object') {
      result.addError('policy', 'Invalid policy structure: must be an object')
      return result
    }

    // Check for required fields based on policy type
    // Normalize schemarule variants: accept schemarule, schemaRule, schemarules, schema_rules, etc.
    // IMPORTANT: Do NOT mutate the input policy object (it may be from Vuex store)
    const rawSchema = policy.schemarule || policy.schemaRule || policy.schemarules || policy.schema_rules || null
    let schemarule = null
    if (rawSchema && typeof rawSchema === 'object') {
      // Accept different nested names: ConvertoJson / convertoJson / convertToJson
      const convertoJson = rawSchema.ConvertoJson || rawSchema.convertoJson || rawSchema.convertToJson || rawSchema.convertojson || rawSchema.ConvertoJSON || null
      // Accept fanout/childfanouts/fanouts
      const childfanouts = rawSchema.childfanouts || rawSchema.childFanouts || rawSchema.fanout || rawSchema.fanouts || rawSchema.child_fanouts || null

      schemarule = {
        ConvertoJson: Array.isArray(convertoJson) ? convertoJson : (convertoJson ? [convertoJson] : []),
        childfanouts: Array.isArray(childfanouts) ? childfanouts : (childfanouts ? [childfanouts] : [])
      }
    }

    // Use normalized schemarule for validation checks (DO NOT mutate policy object)
    const normalizedSchemaRule = schemarule || policy.schemarule

    const hasTransforms = Array.isArray(policy.transforms) && policy.transforms.length > 0
    const hasSchemaRule = normalizedSchemaRule && typeof normalizedSchemaRule === 'object' && ((Array.isArray(normalizedSchemaRule.ConvertoJson) && normalizedSchemaRule.ConvertoJson.length > 0) || (Array.isArray(normalizedSchemaRule.childfanouts) && normalizedSchemaRule.childfanouts.length > 0))
    const hasFilter = policy.filter !== undefined && policy.filter !== null && policy.filter !== ''

    // At least one of these should be present for a valid policy
    if (!hasTransforms && !hasSchemaRule && !hasFilter) {
      result.addError('policy', 'Policy must contain at least one of: transforms, schemarule, or filter')
    }

    // Validate transforms structure if present
    if (policy.transforms && !Array.isArray(policy.transforms)) {
      result.addError('transforms', 'Transforms must be an array')
    }

    // Validate schemarule structure if present (use normalized version)
    if (normalizedSchemaRule) {
      if (normalizedSchemaRule.ConvertoJson && !Array.isArray(normalizedSchemaRule.ConvertoJson)) {
        result.addError('schemarule', 'ConvertoJson must be an array')
      }

      if (normalizedSchemaRule.childfanouts && !Array.isArray(normalizedSchemaRule.childfanouts)) {
        result.addError('schemarule', 'childfanouts must be an array')
      }
    }

    // Validate filter format if present
    if (policy.filter !== null && policy.filter !== undefined) {
      if (typeof policy.filter !== 'string') {
        result.addError('filter', 'Filter must be a string')
      }
    }

    // Add informational messages about policy contents
    if (hasTransforms) {
      result.addInfo('policy', `Policy contains ${policy.transforms.length} field mapping(s)`)
    }

    if (hasSchemaRule && normalizedSchemaRule) {
      if (normalizedSchemaRule.ConvertoJson && normalizedSchemaRule.ConvertoJson.length > 0) {
        result.addInfo('policy', `Policy contains ${normalizedSchemaRule.ConvertoJson.length} JSON conversion rule(s)`)
      }
      if (normalizedSchemaRule.childfanouts && normalizedSchemaRule.childfanouts.length > 0) {
        result.addInfo('policy', `Policy contains ${normalizedSchemaRule.childfanouts.length} fanout rule(s)`)
      }
    }

    return result
  }

  /**
   * Validate file before upload
   */
  static validateFile (file) {
    const result = new ValidationResult()
    const rules = Step1ValidationRules.policyFile

    if (!file) {
      result.addError('file', rules.messages.required)
      return result
    }

    // Validate file type
    const fileName = (file.name || '').toLowerCase()
    const validExtensions = rules.fileType || []
    const hasValidExtension = validExtensions.some(ext => fileName.endsWith(ext))

    if (!hasValidExtension) {
      result.addError('file', rules.messages.fileType)
    }

    // Validate file size
    if (typeof file.size === 'number' && file.size > rules.maxFileSize) {
      result.addError('file', rules.messages.maxFileSize)
    }

    // Check file size is not zero
    if (file.size === 0) {
      result.addError('file', 'File is empty')
    }

    // Add informational message about file size
    const fileSizeKB = Math.round((file.size || 0) / 1024)
    if (fileSizeKB > 0) {
      result.addInfo('file', `File size: ${fileSizeKB} KB`)
    }

    return result
  }

  /**
   * Validate JSON content
   */
  static validateJsonContent (content) {
    const result = new ValidationResult()

    if (typeof content !== 'string' || content.trim() === '') {
      result.addError('content', 'File content is empty')
      return result
    }

    try {
      const cleaned = ValidationUtils.sanitizeJsonText(content)

      const parsed = JSON.parse(cleaned)

      // Validate it's an object
      if (typeof parsed !== 'object' || parsed === null) {
        result.addError('content', 'JSON must be an object, not a primitive value')
      }

      return result
    } catch (error) {
      result.addError('content', `Invalid JSON format: ${error.message}`)
      return result
    }
  }

  /**
   * Extract JSON object substring from arbitrary text by finding the first '{'
   * and matching closing '}'. Handles nested braces and ignores braces inside strings.
   * Returns the JSON substring or null if not found/matched.
   */
  static extractJsonFromText (text) {
    if (!text || typeof text !== 'string') return null

    const startIndex = text.indexOf('{')
    if (startIndex === -1) return null

    let braceCount = 0
    let inString = false
    let escape = false

    for (let i = startIndex; i < text.length; i++) {
      const ch = text[i]

      if (escape) {
        escape = false
        continue
      }

      if (ch === '\\') {
        // next character is escaped when inside a string
        if (inString) escape = true
        continue
      }

      if (ch === '"') {
        inString = !inString
        continue
      }

      if (!inString) {
        if (ch === '{') braceCount++
        else if (ch === '}') {
          braceCount--
          if (braceCount === 0) {
            return text.slice(startIndex, i + 1)
          }
        }
      }
    }

    return null
  }

  /**
   * Sanitize and extract JSON substring for parsing.
   * Returns the JSON substring ready to JSON.parse or throws if not found.
   */
  static sanitizeAndExtractJson (text) {
    if (!text || typeof text !== 'string') throw new Error('Content is empty or not text')

    // Remove BOM if present
    text = text.replace(/^\uFEFF/, '')

    let cleaned = ''
    if (ValidationUtils && typeof ValidationUtils.sanitizeJsonText === 'function') {
      cleaned = ValidationUtils.sanitizeJsonText(text)
    } else {
      // Fallback simple stripping: remove JS comments while preserving strings
      // Implement a minimal stripper similar to other helper implementations
      let out = ''
      let inString = false
      let escape = false
      for (let i = 0; i < text.length; i++) {
        const ch = text[i]
        if (escape) {
          out += ch
          escape = false
          continue
        }
        if (ch === '\\') {
          out += ch
          escape = true
          continue
        }
        if (ch === '"') {
          inString = !inString
          out += ch
          continue
        }
        if (!inString) {
          if (ch === '/' && text[i + 1] === '/') {
            i += 2
            while (i < text.length && text[i] !== '\n' && text[i] !== '\r') i++
            continue
          }
          if (ch === '/' && text[i + 1] === '*') {
            i += 2
            while (i < text.length && !(text[i] === '*' && text[i + 1] === '/')) i++
            i += 1
            continue
          }
        }
        out += ch
      }
      cleaned = out.replace(/,\s*(\}|\])/g, '$1')
    }

    const jsonText = this.extractJsonFromText(cleaned) || cleaned
    if (!jsonText || typeof jsonText !== 'string' || jsonText.trim() === '') {
      throw new Error('Could not locate JSON start or matching end brace in policy file')
    }

    return jsonText
  }
}

/**
 * Async validators for operations requiring external checks
 */
class AsyncValidator {
  /**
   * Check if policy name already exists (stub - would integrate with backend)
   */
  static async checkPolicyNameExists (name) {
    // This would make an API call to check if name exists
    // For now, return a mock validation
    return new Promise((resolve) => {
      setTimeout(() => {
        const result = new ValidationResult()
        // Mock: Check against a local list
        const existingNames = [] // Would come from API

        const lowerName = (typeof name === 'string') ? name.toLowerCase() : ''
        if (lowerName && existingNames.includes(lowerName)) {
          result.addWarning('name', 'A policy with this name already exists')
        }

        resolve(result)
      }, 100)
    })
  }

  /**
   * Validate policy file integrity (deep validation)
   */
  static async validatePolicyFileIntegrity (policy) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const result = Step1Validator.validatePolicyStructure(policy)

        // Additional async checks could be performed here
        // - Check for deprecated fields
        // - Validate against schema version
        // - Check for security issues

        resolve(result)
      }, 200)
    })
  }
}

/**
 * Validation utilities
 */
const ValidationUtils = {
  /**
   * Debounce validation for real-time input
   */
  debounce (fn, delay = 300) {
    let timeoutId
    return function (...args) {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(() => fn.apply(this, args), delay)
    }
  },

  /**
   * Format validation errors for display
   */
  formatErrors (errors) {
    return errors.map(error => ({
      ...error,
      displayMessage: this.formatErrorMessage(error)
    }))
  },

  /**
   * Format single error message
   */
  formatErrorMessage (error) {
    const severityPrefix = {
      [ValidationSeverity.ERROR]: '❌',
      [ValidationSeverity.WARNING]: '⚠️',
      [ValidationSeverity.INFO]: 'ℹ️'
    }

    return `${severityPrefix[error.severity] || ''} ${error.message}`
  },

  /**
   * Combine multiple validation results
   */
  combineResults (...results) {
    const combined = new ValidationResult()

    results.forEach(result => {
      if (result && result.errors) {
        result.errors.forEach(error => combined.errors.push(error))
      }
      if (result && result.warnings) {
        result.warnings.forEach(warning => combined.warnings.push(warning))
      }
      if (result && result.info) {
        result.info.forEach(info => combined.info.push(info))
      }
    })

    combined.isValid = combined.errors.length === 0

    return combined
  },

  /**
   * Sanitize JSON-like text by removing JavaScript-style comments
   * and trailing commas while preserving string literals. Returns
   * the cleaned string ready for JSON.parse.
   */
  sanitizeJsonText (text) {
    if (typeof text !== 'string' || text.length === 0) return ''

    let out = ''
    let inString = false
    let escape = false

    for (let i = 0; i < text.length; i++) {
      const ch = text[i]

      if (escape) {
        out += ch
        escape = false
        continue
      }

      if (ch === '\\') {
        // start escape sequence
        out += ch
        escape = true
        continue
      }

      if (ch === '"') {
        inString = !inString
        out += ch
        continue
      }

      if (!inString) {
        // single-line comment
        if (ch === '/' && text[i + 1] === '/') {
          i += 2
          while (i < text.length && text[i] !== '\n' && text[i] !== '\r') i++
          continue
        }

        // multi-line comment
        if (ch === '/' && text[i + 1] === '*') {
          i += 2
          while (i < text.length && !(text[i] === '*' && text[i + 1] === '/')) i++
          i += 1 // skip closing '/'
          continue
        }
      }

      out += ch
    }

    // Remove trailing commas before } or ]
    return out.replace(/,\s*(\}|\])/g, '$1')
  }
}

module.exports.__default = {
  Validator,
  Step1Validator,
  AsyncValidator,
  ValidationResult,
  ValidationRuleTypes,
  ValidationSeverity,
  ValidationUtils
}

module.exports = Object.assign({}, module.exports.__default || {}, { Validator, Step1Validator, AsyncValidator, ValidationResult, ValidationRuleTypes, ValidationSeverity, ValidationUtils })
