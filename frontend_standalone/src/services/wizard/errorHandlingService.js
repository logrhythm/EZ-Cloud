/**
 * Error Handling Service for Wizard
 * Centralized error handling, logging, and recovery suggestions
 */

/**
 * Error types
 */
export const ErrorTypes = {
  VALIDATION: 'validation',
  FILE_PROCESSING: 'file_processing',
  NETWORK: 'network',
  STATE_MANAGEMENT: 'state_management',
  PARSING: 'parsing',
  BUSINESS_LOGIC: 'business_logic',
  SYSTEM: 'system',
  UNKNOWN: 'unknown'
}

/**
 * Error severity levels
 */
export const ErrorSeverity = {
  CRITICAL: 'critical', // Blocks progress, requires immediate action
  HIGH: 'high', // Major issue, significantly impacts functionality
  MEDIUM: 'medium', // Moderate issue, workaround available
  LOW: 'low', // Minor issue, minimal impact
  INFO: 'info' // Informational, not an actual error
}

/**
 * Error recovery strategies
 */
export const RecoveryStrategy = {
  RETRY: 'retry', // User can retry the operation
  RESET: 'reset', // Reset to previous state
  SKIP: 'skip', // Skip the problematic step
  MANUAL: 'manual', // Manual intervention required
  AUTO: 'auto', // Automatic recovery possible
  NONE: 'none' // No recovery available
}

/**
 * Wizard Error class
 */
export class WizardError extends Error {
  constructor (message, options = {}) {
    super(message)
    this.name = 'WizardError'
    this.type = options.type || ErrorTypes.UNKNOWN
    this.severity = options.severity || ErrorSeverity.MEDIUM
    this.code = options.code || 'WIZARD_ERROR'
    this.step = options.step || null
    this.field = options.field || null
    this.originalError = options.originalError || null
    this.timestamp = new Date().toISOString()
    this.recoverable = options.recoverable !== false
    this.recovery = options.recovery || null
    this.metadata = options.metadata || {}
  }

  toJSON () {
    return {
      name: this.name,
      message: this.message,
      type: this.type,
      severity: this.severity,
      code: this.code,
      step: this.step,
      field: this.field,
      timestamp: this.timestamp,
      recoverable: this.recoverable,
      recovery: this.recovery && typeof this.recovery.toJSON === 'function'
        ? this.recovery.toJSON()
        : this.recovery,
      metadata: this.metadata,
      stack: this.stack
    }
  }
}

/**
 * Error recovery suggestion
 */
export class RecoverySuggestion {
  constructor (strategy, options = {}) {
    this.strategy = strategy
    this.title = options.title || 'Recovery Options'
    this.description = options.description || ''
    this.actions = options.actions || []
    this.autoRecoverable = options.autoRecoverable || false
    this.priority = options.priority || 0
  }

  addAction (label, handler, metadata = {}) {
    this.actions.push({
      label,
      handler,
      metadata,
      id: `action_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`
    })
    return this
  }

  // Provide a safe, serializable representation that omits handler functions
  toJSON () {
    return {
      strategy: this.strategy,
      title: this.title,
      description: this.description,
      autoRecoverable: this.autoRecoverable,
      priority: this.priority,
      actions: this.actions.map(a => ({
        id: a.id,
        label: a.label,
        metadata: a.metadata || {}
      }))
    }
  }
}

/**
 * Error Handler Service
 */
export class ErrorHandlerService {
  constructor () {
    this.errorLog = []
    this.maxLogSize = 100
    this.listeners = []
  }

  /**
   * Handle an error
   */
  handleError (error, context = {}) {
    const wizardError = this.normalizeError(error, context)

    // Log error
    this.logError(wizardError)

    // Generate recovery suggestion
    wizardError.recovery = this.generateRecoverySuggestion(wizardError)

    // Notify listeners
    this.notifyListeners(wizardError)

    // Return processed error
    return wizardError
  }

  /**
   * Normalize error to WizardError
   */
  normalizeError (error, context = {}) {
    if (error instanceof WizardError) {
      return error
    }

    // Determine error type and severity
    const errorInfo = this.analyzeError(error)

    return new WizardError(error.message || 'An unknown error occurred', {
      type: errorInfo.type,
      severity: errorInfo.severity,
      code: error.code || errorInfo.code,
      step: context.step || null,
      field: context.field || null,
      originalError: error,
      metadata: context.metadata || {}
    })
  }

  /**
   * Analyze error to determine type and severity
   */
  analyzeError (error) {
    // Normalize incoming error to a string for robust classification
    let raw = ''
    if (typeof error === 'string') raw = error
    else if (error && typeof error.message === 'string') raw = error.message
    else {
      try {
        raw = error ? JSON.stringify(error) : ''
      } catch {
        raw = String(error)
      }
    }

    const message = String(raw).toLowerCase()

    // Network errors
    if (/\b(network|fetch|timeout)\b/.test(message)) {
      return {
        type: ErrorTypes.NETWORK,
        severity: ErrorSeverity.HIGH,
        code: 'NETWORK_ERROR'
      }
    }

    // File processing errors
    if (/\b(file|read|upload)\b/.test(message)) {
      return {
        type: ErrorTypes.FILE_PROCESSING,
        severity: ErrorSeverity.MEDIUM,
        code: 'FILE_ERROR'
      }
    }

    // JSON parsing errors
    if (/\b(json|parse|unexpected token)\b/.test(message)) {
      return {
        type: ErrorTypes.PARSING,
        severity: ErrorSeverity.HIGH,
        code: 'PARSE_ERROR'
      }
    }

    // Validation errors
    if (/\b(invalid|required|validation)\b/.test(message)) {
      return {
        type: ErrorTypes.VALIDATION,
        severity: ErrorSeverity.LOW,
        code: 'VALIDATION_ERROR'
      }
    }

    // Default
    return {
      type: ErrorTypes.UNKNOWN,
      severity: ErrorSeverity.MEDIUM,
      code: 'UNKNOWN_ERROR'
    }
  }

  /**
   * Generate recovery suggestion based on error
   */
  generateRecoverySuggestion (error) {
    switch (error.type) {
      case ErrorTypes.VALIDATION:
        return this.createValidationRecovery(error)

      case ErrorTypes.FILE_PROCESSING:
        return this.createFileProcessingRecovery(error)

      case ErrorTypes.PARSING:
        return this.createParsingRecovery(error)

      case ErrorTypes.NETWORK:
        return this.createNetworkRecovery(error)

      case ErrorTypes.STATE_MANAGEMENT:
        return this.createStateRecovery(error)

      default:
        return this.createGenericRecovery(error)
    }
  }

  /**
   * Create validation error recovery
   */
  createValidationRecovery (error) {
    const recovery = new RecoverySuggestion(RecoveryStrategy.MANUAL, {
      title: 'Fix Validation Error',
      description: 'Please correct the validation errors to continue.',
      autoRecoverable: false
    })

    recovery.addAction('Review Field', () => {
      // Handler would focus the problematic field
      console.log('Focusing field:', error.field)
    }, { field: error.field })

    recovery.addAction('Clear Field', () => {
      // Handler would clear the field
      console.log('Clearing field:', error.field)
    }, { field: error.field })

    return recovery
  }

  /**
   * Create file processing error recovery
   */
  createFileProcessingRecovery (error) {
    const recovery = new RecoverySuggestion(RecoveryStrategy.RETRY, {
      title: 'File Processing Failed',
      description: 'There was a problem processing your file.',
      autoRecoverable: false
    })

    recovery.addAction('Try Different File', () => {
      console.log('Prompting for new file')
    })

    recovery.addAction('Check File Format', () => {
      console.log('Showing file format requirements')
    })

    if ((error && (error.message || '').toLowerCase().includes('size')) || String(error).toLowerCase().includes('size')) {
      recovery.addAction('Reduce File Size', () => {
        console.log('Showing file size tips')
      })
    }

    return recovery
  }

  /**
   * Create parsing error recovery
   */
  createParsingRecovery (error) {
    const recovery = new RecoverySuggestion(RecoveryStrategy.MANUAL, {
      title: 'JSON Parsing Error',
      description: 'The file contains invalid JSON. Please correct the format.',
      autoRecoverable: false
    })

    // Do not capture the full error in the handler closure; store minimal metadata instead
    recovery.addAction('Validate JSON', () => {
      console.log('Opening JSON validator')
    }, { message: (error && error.message) ? String(error.message).slice(0, 200) : '' })

    recovery.addAction('View Error Details', () => {
      console.log('Showing parsing error details')
    }, { message: (error && error.message) ? String(error.message).slice(0, 200) : '' })

    recovery.addAction('Use Different File', () => {
      console.log('Prompting for new file')
    })

    return recovery
  }

  /**
   * Create network error recovery
   */
  createNetworkRecovery (_error) {
    const recovery = new RecoverySuggestion(RecoveryStrategy.RETRY, {
      title: 'Network Error',
      description: 'A network error occurred. Please check your connection.',
      autoRecoverable: true,
      priority: 1
    })

    recovery.addAction('Retry', () => {
      console.log('Retrying operation')
    }, { autoRetry: true })

    recovery.addAction('Work Offline', () => {
      console.log('Switching to offline mode')
    })

    return recovery
  }

  /**
   * Create state management error recovery
   */
  createStateRecovery (error) {
    const recovery = new RecoverySuggestion(RecoveryStrategy.RESET, {
      title: 'State Error',
      description: 'There was a problem with the application state.',
      autoRecoverable: false
    })

    // Avoid capturing full error in closures; include a short message snippet in metadata
    const snippet = (error && error.message) ? String(error.message).slice(0, 200) : ''

    recovery.addAction('Reset Step', () => {
      console.log('Resetting current step')
    }, { message: snippet })

    recovery.addAction('Reset Wizard', () => {
      console.log('Resetting entire wizard')
    }, { message: snippet })

    recovery.addAction('Save Progress', () => {
      console.log('Saving current progress')
    }, { message: snippet })

    return recovery
  }

  /**
   * Create generic recovery
   */
  createGenericRecovery (error) {
    const recovery = new RecoverySuggestion(RecoveryStrategy.MANUAL, {
      title: 'An Error Occurred',
      description: (error && error.message) ? String(error.message) : (String(error) || 'An unexpected error occurred.'),
      autoRecoverable: false
    })

    recovery.addAction('Retry', () => {
      console.log('Retrying operation')
    })

    recovery.addAction('Contact Support', () => {
      console.log('Opening support dialog')
    }, { errorDetails: (error && typeof error.toJSON === 'function') ? error.toJSON() : { message: String(error) } })

    return recovery
  }

  /**
   * Log error
   */
  logError (error) {
    this.errorLog.push({
      error: error.toJSON ? error.toJSON() : error,
      timestamp: new Date().toISOString()
    })

    // Maintain max log size
    if (this.errorLog.length > this.maxLogSize) {
      this.errorLog.shift()
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('[WizardError]', error)
    }
  }

  /**
   * Get error log
   */
  getErrorLog (options = {}) {
    const {
      limit = 10,
      type = null,
      severity = null,
      step = null
    } = options

    let filtered = [...this.errorLog]

    if (type) {
      filtered = filtered.filter(entry => entry.error.type === type)
    }

    if (severity) {
      filtered = filtered.filter(entry => entry.error.severity === severity)
    }

    if (step) {
      filtered = filtered.filter(entry => entry.error.step === step)
    }

    return filtered.slice(-limit)
  }

  /**
   * Clear error log
   */
  clearErrorLog () {
    this.errorLog = []
  }

  /**
   * Add error listener
   */
  addListener (listener) {
    if (typeof listener === 'function') {
      this.listeners.push(listener)
    }
  }

  /**
   * Remove error listener
   */
  removeListener (listener) {
    const index = this.listeners.indexOf(listener)
    if (index > -1) {
      this.listeners.splice(index, 1)
    }
  }

  /**
   * Notify all listeners
   */
  notifyListeners (error) {
    this.listeners.forEach(listener => {
      try {
        listener(error)
      } catch (listenerError) {
        console.error('Error in listener:', listenerError)
      }
    })
  }

  /**
   * Format error for display
   */
  formatError (error) {
    const wizardError = error instanceof WizardError ? error : this.normalizeError(error)

    return {
      title: this.getErrorTitle(wizardError),
      message: wizardError.message,
      severity: wizardError.severity,
      actions: wizardError.recovery?.actions || [],
      dismissible: wizardError.severity !== ErrorSeverity.CRITICAL
    }
  }

  /**
   * Get user-friendly error title
   */
  getErrorTitle (error) {
    const titles = {
      [ErrorTypes.VALIDATION]: 'Validation Error',
      [ErrorTypes.FILE_PROCESSING]: 'File Processing Error',
      [ErrorTypes.NETWORK]: 'Network Error',
      [ErrorTypes.PARSING]: 'Parsing Error',
      [ErrorTypes.STATE_MANAGEMENT]: 'Application State Error',
      [ErrorTypes.BUSINESS_LOGIC]: 'Processing Error',
      [ErrorTypes.SYSTEM]: 'System Error',
      [ErrorTypes.UNKNOWN]: 'Unexpected Error'
    }

    return titles[error.type] || 'Error'
  }
}

// Singleton instance
const errorHandlerService = new ErrorHandlerService()

export default errorHandlerService

// Export convenience functions
export const handleError = (error, context) => errorHandlerService.handleError(error, context)
export const getErrorLog = (options) => errorHandlerService.getErrorLog(options)
export const clearErrorLog = () => errorHandlerService.clearErrorLog()
export const addErrorListener = (listener) => errorHandlerService.addListener(listener)
export const removeErrorListener = (listener) => errorHandlerService.removeListener(listener)
export const formatError = (error) => errorHandlerService.formatError(error)
