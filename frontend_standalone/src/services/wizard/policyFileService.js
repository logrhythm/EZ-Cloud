/**
 * Policy File Service
 * Handles policy file operations: parsing, validation, analysis, and processing
 */

import { Step1Validator, ValidationResult, ValidationSeverity } from './validationService.js'

/**
 * Policy file processing result
 */
export class PolicyFileProcessingResult {
  constructor () {
    this.success = false
    this.policy = null
    this.metadata = null
    this.validationResult = new ValidationResult()
    this.analysisResult = null
    this.errors = []
    this.warnings = []
  }
}

/**
 * Policy metadata extracted from file
 */
export class PolicyMetadata {
  constructor (policy) {
    this.name = policy.name || null
    this.description = policy.description || null
    this.version = policy.version || '1.0'
    this.author = policy.author || null
    this.createdDate = policy.createdDate || null
    this.modifiedDate = policy.modifiedDate || new Date().toISOString()
    this.policyType = this.detectPolicyType(policy)
    this.complexity = this.calculateComplexity(policy)
  }

  detectPolicyType (policy) {
    if (policy.transforms && policy.schemarule && policy.filter) {
      return 'complete'
    } else if (policy.transforms) {
      return 'mapping-only'
    } else if (policy.schemarule) {
      return 'schema-only'
    } else if (policy.filter) {
      return 'filter-only'
    }
    return 'unknown'
  }

  calculateComplexity (policy) {
    let score = 0

    if (policy.transforms) {
      score += policy.transforms.length
    }

    if (policy.schemarule) {
      if (policy.schemarule.ConvertoJson) {
        score += policy.schemarule.ConvertoJson.length * 2
      }
      if (policy.schemarule.childfanouts) {
        score += policy.schemarule.childfanouts.length * 3
      }
    }

    if (policy.filter) {
      score += 5
    }

    if (score < 5) return 'simple'
    if (score < 15) return 'moderate'
    return 'complex'
  }
}

/**
 * Policy analysis result
 */
export class PolicyAnalysisResult {
  constructor (policy) {
    this.fieldCount = 0
    this.schemaRules = {
      convertToJson: [],
      fanout: []
    }
    this.filterRules = null
    this.mappings = []
    this.statistics = {
      totalMappings: 0,
      schemaRuleCount: 0,
      filterConditions: 0,
      estimatedProcessingTime: 0
    }

    if (policy) {
      this.analyzePolicy(policy)
    }
  }

  analyzePolicy (policy) {
    // Analyze transforms/mappings
    if (policy.transforms && Array.isArray(policy.transforms)) {
      this.mappings = policy.transforms
      this.statistics.totalMappings = policy.transforms.length

      // Count unique fields
      const uniqueFields = new Set()
      policy.transforms.forEach(transform => {
        if (transform.inputRule) {
          uniqueFields.add(transform.inputRule)
        }
        if (transform.LRSchemaField) {
          uniqueFields.add(transform.LRSchemaField)
        }
      })
      this.fieldCount = uniqueFields.size
    }

    // Analyze schema rules
    if (policy.schemarule) {
      if (policy.schemarule.ConvertoJson) {
        this.schemaRules.convertToJson = policy.schemarule.ConvertoJson
        this.statistics.schemaRuleCount += policy.schemarule.ConvertoJson.length
      }

      if (policy.schemarule.childfanouts) {
        this.schemaRules.fanout = policy.schemarule.childfanouts
        this.statistics.schemaRuleCount += policy.schemarule.childfanouts.length
      }
    }

    // Analyze filter rules
    if (policy.filter) {
      this.filterRules = policy.filter
      // Count AND/OR operators as approximate condition count
      const andCount = (policy.filter.match(/&&/g) || []).length
      const orCount = (policy.filter.match(/\|\|/g) || []).length
      this.statistics.filterConditions = andCount + orCount + 1
    }

    // Estimate processing complexity
    this.statistics.estimatedProcessingTime = this.estimateProcessingTime()
  }

  estimateProcessingTime () {
    // Simple heuristic: base time + time per operation
    let time = 100 // base ms

    time += this.statistics.totalMappings * 10
    time += this.statistics.schemaRuleCount * 50
    time += this.statistics.filterConditions * 20

    return time
  }
}

/**
 * Policy File Service
 */
export class PolicyFileService {
  /**
   * Read file as text
   */
  static async readFileAsText (file) {
    // Accept either a File/Blob or raw string or an object with a text() method
    if (typeof file === 'string') return Promise.resolve(file)

    if (file && typeof file.text === 'function') {
      // Some environments provide a text() method (Blob, Response)
      try {
        return await file.text()
      } catch (err) {
        // Fall through to FileReader if available
      }
    }

    return new Promise((resolve, reject) => {
      const reader = new FileReader()

      reader.onload = (event) => {
        resolve(event.target.result)
      }

      reader.onerror = (error) => {
        reject(new Error(`Failed to read file: ${error.message || 'Unknown error'}`))
      }

      // Security check: validate file object
      if (!file || !(file instanceof File || file instanceof Blob)) {
        reject(new Error('Invalid file object'))
        return
      }

      try {
        reader.readAsText(file)
      } catch (error) {
        reject(new Error(`Failed to initiate file read: ${error.message}`))
      }
    })
  }

  /**
   * Parse JSON file content
   */
  static async parseJsonContent (content) {
    try {
      // Sanitize content (remove BOM if present)
      let sanitized = (typeof content === 'string') ? content.replace(/^\uFEFF/, '') : ''

      // Use centralized sanitizer+extractor if available to ensure UI/tool parity
      let jsonText
      if (Step1Validator.sanitizeAndExtractJson && typeof Step1Validator.sanitizeAndExtractJson === 'function') {
        jsonText = Step1Validator.sanitizeAndExtractJson(sanitized)
      } else {
        // Fallback: strip comments + remove trailing commas + extract
        if (Step1Validator.stripCommentsPreserveStrings) {
          sanitized = Step1Validator.stripCommentsPreserveStrings(sanitized)
        }
        sanitized = sanitized.replace(/,\s*(\}|\])/g, '$1')
        jsonText = (Step1Validator.extractJsonFromText && typeof Step1Validator.extractJsonFromText === 'function') ? Step1Validator.extractJsonFromText(sanitized) : sanitized
      }

      // Parse JSON
      const parsed = JSON.parse(jsonText)

      return {
        success: true,
        data: parsed,
        error: null
      }
    } catch (error) {
      return {
        success: false,
        data: null,
        error: {
          message: error.message,
          position: this.extractJsonErrorPosition(error.message),
          suggestion: this.getJsonErrorSuggestion(error.message)
        }
      }
    }
  }

  /**
   * Extract error position from JSON parse error
   */
  static extractJsonErrorPosition (errorMessage) {
    const match = errorMessage.match(/position (\d+)/i)
    return match ? parseInt(match[1]) : null
  }

  /**
   * Get helpful suggestion for JSON parse errors
   */
  static getJsonErrorSuggestion (errorMessage) {
    if (errorMessage.includes('Unexpected token')) {
      return 'Check for missing commas, brackets, or quotes in your JSON'
    } else if (errorMessage.includes('Unexpected end')) {
      return 'Your JSON appears to be incomplete. Check for missing closing brackets or braces'
    } else if (errorMessage.includes('Unexpected string')) {
      return 'Check for missing commas between properties'
    }
    return 'Verify your JSON is properly formatted'
  }

  /**
   * Validate policy file
   */
  static async validatePolicyFile (file) {
    const result = new PolicyFileProcessingResult()

    try {
      // Step 1: Validate file object
      const fileValidation = Step1Validator.validateFile(file)
      if (!fileValidation.isValid) {
        result.validationResult = fileValidation
        result.errors = fileValidation.errors
        return result
      }

      // Step 2: Read file content
      let content
      try {
        content = await this.readFileAsText(file)
      } catch (error) {
        result.validationResult.addError('file', `Failed to read file: ${error.message}`)
        result.errors.push(error.message)
        return result
      }

      // Step 3: Validate JSON content
      const contentValidation = Step1Validator.validateJsonContent(content)
      if (!contentValidation.isValid) {
        result.validationResult = contentValidation
        result.errors = contentValidation.errors
        return result
      }

      // Step 4: Parse JSON
      const parseResult = await this.parseJsonContent(content)
      if (!parseResult.success) {
        result.validationResult.addError('content', parseResult.error.message)
        if (parseResult.error.suggestion) {
          result.validationResult.addError('content', parseResult.error.suggestion, ValidationSeverity.INFO)
        }
        result.errors.push(parseResult.error.message)
        return result
      }

      result.policy = parseResult.data

      // Step 5: Validate policy structure
      const structureValidation = Step1Validator.validatePolicyStructure(result.policy)
      result.validationResult = structureValidation

      if (!structureValidation.isValid) {
        result.errors = structureValidation.errors
        return result
      }

      // Step 6: Extract metadata
      result.metadata = new PolicyMetadata(result.policy)

      // Step 7: Analyze policy
      result.analysisResult = new PolicyAnalysisResult(result.policy)

      // Mark as successful
      result.success = true
      result.warnings = structureValidation.warnings

      return result
    } catch (error) {
      result.validationResult.addError('unknown', `Unexpected error: ${error.message}`)
      result.errors.push(error.message)
      return result
    }
  }

  /**
   * Process policy file (full pipeline)
   */
  static async processPolicyFile (file, options = {}) {
    const {
      deepValidation = false
    } = options

    const result = await this.validatePolicyFile(file)

    // If validation failed, return early
    if (!result.success) {
      return result
    }

    // Perform deep validation if requested
    if (deepValidation) {
      const deepValidation = await this.performDeepValidation(result.policy)
      if (!deepValidation.isValid) {
        result.validationResult.warnings.push(...deepValidation.warnings)
        result.warnings.push(...deepValidation.warnings)
      }
    }

    return result
  }

  /**
   * Perform deep validation (checks for deprecated fields, security issues, etc.)
   */
  static async performDeepValidation (policy) {
    const result = new ValidationResult()

    // Check for deprecated fields
    const deprecatedFields = this.checkDeprecatedFields(policy)
    if (deprecatedFields.length > 0) {
      deprecatedFields.forEach(field => {
        result.addError('policy', `Deprecated field detected: ${field}`, ValidationSeverity.WARNING)
      })
    }

    // Check for potential security issues
    const securityIssues = this.checkSecurityIssues(policy)
    if (securityIssues.length > 0) {
      securityIssues.forEach(issue => {
        result.addError('policy', `Security concern: ${issue}`, ValidationSeverity.WARNING)
      })
    }

    // Check for performance concerns
    const performanceIssues = this.checkPerformanceIssues(policy)
    if (performanceIssues.length > 0) {
      performanceIssues.forEach(issue => {
        result.addError('policy', `Performance concern: ${issue}`, ValidationSeverity.INFO)
      })
    }

    return result
  }

  /**
   * Check for deprecated fields
   */
  static checkDeprecatedFields (policy) {
    const deprecated = []
    const deprecatedFieldMap = {
      // Add deprecated fields as they are identified
      oldFieldName: 'newFieldName'
    }

    Object.keys(deprecatedFieldMap).forEach(oldField => {
      if (policy[oldField]) {
        deprecated.push(`${oldField} (use ${deprecatedFieldMap[oldField]} instead)`)
      }
    })

    return deprecated
  }

  /**
   * Check for security issues
   */
  static checkSecurityIssues (policy) {
    const issues = []

    // Check for potentially dangerous patterns in filters
    if (policy.filter) {
      // Check for script injection patterns
      if (policy.filter.includes('<script') || policy.filter.includes('javascript:')) {
        issues.push('Potentially dangerous script patterns in filter')
      }

      // Check for overly permissive filters
      if (policy.filter.includes('.*') || policy.filter.includes('*')) {
        issues.push('Overly permissive filter pattern detected')
      }
    }

    // Check transforms for security issues
    if (policy.transforms) {
      policy.transforms.forEach((transform, index) => {
        if (transform.inputRule && typeof transform.inputRule === 'string') {
          // Check for potentially dangerous JSONPath expressions
          if (transform.inputRule.includes('..') && transform.inputRule.split('..').length > 3) {
            issues.push(`Transform ${index}: Deep recursive JSONPath may cause performance issues`)
          }
        }
      })
    }

    return issues
  }

  /**
   * Check for performance issues
   */
  static checkPerformanceIssues (policy) {
    const issues = []

    // Check for excessive number of transforms
    if (policy.transforms && policy.transforms.length > 100) {
      issues.push(`Large number of transforms (${policy.transforms.length}) may impact performance`)
    }

    // Check for complex nested fanouts
    if (policy.schemarule && policy.schemarule.childfanouts) {
      const maxDepth = this.calculateFanoutDepth(policy.schemarule.childfanouts)
      if (maxDepth > 5) {
        issues.push(`Deep fanout nesting (${maxDepth} levels) may impact performance`)
      }
    }

    // Check for complex filter expressions
    if (policy.filter) {
      const complexity = (policy.filter.match(/&&|\|\|/g) || []).length
      if (complexity > 10) {
        issues.push(`Complex filter expression (${complexity} conditions) may impact performance`)
      }
    }

    return issues
  }

  /**
   * Calculate maximum fanout depth
   */
  static calculateFanoutDepth (fanouts) {
    const depthMap = new Map()
    let maxDepth = 1

    fanouts.forEach(fanout => {
      if (!fanout.parentpath) {
        depthMap.set(fanout.field, 1)
      } else {
        const parentDepth = depthMap.get(fanout.parentpath) || 1
        const currentDepth = parentDepth + 1
        depthMap.set(fanout.field, currentDepth)
        maxDepth = Math.max(maxDepth, currentDepth)
      }
    })

    return maxDepth
  }

  /**
   * Create a preview of policy file content
   */
  static createPolicyPreview (policy, maxLength = 500) {
    try {
      const jsonString = JSON.stringify(policy, null, 2)

      if (jsonString.length <= maxLength) {
        return jsonString
      }

      return jsonString.substring(0, maxLength) + '\n\n... (truncated)'
    } catch (error) {
      return `Error creating preview: ${error.message}`
    }
  }

  /**
   * Export policy to JSON string
   */
  static exportPolicyToJson (policy, options = {}) {
    const {
      pretty = true,
      indent = 2,
      includeMetadata = false
    } = options

    try {
      let exportPolicy = { ...policy }

      if (includeMetadata) {
        exportPolicy = {
          ...exportPolicy,
          exportedAt: new Date().toISOString(),
          exportedBy: 'JSON Policy Builder Wizard'
        }
      }

      return pretty
        ? JSON.stringify(exportPolicy, null, indent)
        : JSON.stringify(exportPolicy)
    } catch (error) {
      throw new Error(`Failed to export policy: ${error.message}`)
    }
  }

  /**
   * Compare two policies
   */
  static comparePolicies (policy1, policy2) {
    const differences = {
      added: [],
      removed: [],
      modified: [],
      unchanged: []
    }

    // This would implement detailed comparison logic
    // For now, return a basic structure
    // Could be expanded to use a diff library like 'deep-diff'

    return differences
  }
}

export default PolicyFileService
