/**
 * Wizard Services Index
 * Central export point for all wizard services
 */

// Validation Service
export {
  Validator,
  Step1Validator,
  AsyncValidator,
  ValidationResult,
  ValidationRuleTypes,
  ValidationSeverity,
  ValidationUtils,
  Step1ValidationRules
} from './validationService'

// Policy File Service
export {
  PolicyFileService,
  PolicyFileProcessingResult,
  PolicyMetadata,
  PolicyAnalysisResult
} from './policyFileService'

// Error Handling Service
export {
  default as errorHandlerService,
  WizardError,
  ErrorTypes,
  ErrorSeverity,
  RecoveryStrategy,
  RecoverySuggestion,
  ErrorHandlerService,
  handleError,
  getErrorLog,
  clearErrorLog,
  addErrorListener,
  removeErrorListener,
  formatError
} from './errorHandlingService'

// Utility Service
export {
  debounce,
  throttle,
  AutoSaveManager,
  deepClone,
  deepEqual,
  generateId,
  formatBytes,
  formatTimestamp,
  formatRelativeTime,
  retry,
  sleep,
  truncate,
  sanitizeFilename,
  getFileExtension,
  isValidJsonPath,
  safeJsonParse,
  safeJsonStringify,
  storage
} from './utilityService'

// Data Processing Service
export { DataProcessor } from './dataProcessingService'

// Schema Rule Service
export { SchemaRuleService } from './schemaRuleService'

// Filter Rule Service
export { FilterRuleService } from './filterRuleService'

// Default export with all services (use ES imports to keep module syntax consistent)
import validationService from './validationService'
import policyFileService from './policyFileService'
import errorHandlerService from './errorHandlingService'
import utilityService from './utilityService'
import { DataProcessor } from './dataProcessingService'
import { SchemaRuleService } from './schemaRuleService'
import { FilterRuleService } from './filterRuleService'

export default {
  validation: validationService,
  policyFile: policyFileService,
  errorHandler: errorHandlerService,
  utility: utilityService,
  dataProcessor: DataProcessor,
  schemaRule: SchemaRuleService,
  filterRule: FilterRuleService
}
