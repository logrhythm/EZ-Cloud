# Wizard Backend Services Documentation

This directory contains all backend logic and services for the JSON Policy Builder Wizard Step 1 (Introduction & Project Setup).

## Overview

The backend implementation for Step 1 is organized into modular, reusable services that handle:

- **Data validation** (field-level and form-level)
- **Policy file processing** (parsing, validation, analysis)
- **Error handling** (centralized error management and recovery)
- **State management** (Vuex actions and mutations)
- **Utility functions** (debouncing, auto-save, formatting)

## Architecture

```
src/services/wizard/
├── index.js                      # Service exports
├── validationService.js          # Validation logic
├── policyFileService.js          # Policy file operations
├── errorHandlingService.js       # Error handling
├── utilityService.js             # Utility functions
└── README.md                     # This file

src/store/modules/wizard/
└── step1Actions.js               # Step 1 Vuex actions
```

## Services

### 1. Validation Service (`validationService.js`)

Provides comprehensive validation for all Step 1 inputs.

#### Key Classes

- **`Validator`**: Base validator with common validation rules
- **`Step1Validator`**: Step 1-specific validation logic
- **`AsyncValidator`**: Asynchronous validation operations
- **`ValidationResult`**: Structured validation results

#### Usage Example

```javascript
import { Step1Validator } from '@/services/wizard/validationService'

// Validate project name
const result = Step1Validator.validateProjectName('My Policy')

if (result.isValid) {
  console.log('Valid project name')
} else {
  console.error('Validation errors:', result.errors)
}

// Validate create mode
const createValidation = Step1Validator.validateCreateMode({
  name: 'My Policy',
  description: 'Test policy'
})

// Validate update mode
const updateValidation = Step1Validator.validateUpdateMode(
  projectConfig,
  existingPolicy
)
```

#### Validation Rules

**Project Name**:
- Required
- Minimum 3 characters
- Maximum 100 characters
- Alphanumeric, spaces, hyphens, underscores only
- No reserved names (system, default, admin, root, test)

**Project Description**:
- Optional
- Maximum 500 characters

**Policy File**:
- Required for update mode
- Must be .json file
- Maximum 5MB size
- Must contain valid JSON
- Must have valid policy structure

### 2. Policy File Service (`policyFileService.js`)

Handles all policy file operations including reading, parsing, validating, and analyzing policy files.

#### Key Classes

- **`PolicyFileService`**: Main service for file operations
- **`PolicyFileProcessingResult`**: Processing result structure
- **`PolicyMetadata`**: Extracted policy metadata
- **`PolicyAnalysisResult`**: Policy analysis data

#### Usage Example

```javascript
import PolicyFileService from '@/services/wizard/policyFileService'

// Process uploaded file
const result = await PolicyFileService.processPolicyFile(file, {
  validateOnly: false,
  extractMetadata: true,
  analyzePolicy: true,
  deepValidation: true
})

if (result.success) {
  console.log('Policy:', result.policy)
  console.log('Metadata:', result.metadata)
  console.log('Analysis:', result.analysisResult)
} else {
  console.error('Errors:', result.errors)
}

// Create preview
const preview = PolicyFileService.createPolicyPreview(policy, 500)

// Export policy
const json = PolicyFileService.exportPolicyToJson(policy, {
  pretty: true,
  indent: 2,
  includeMetadata: true
})
```

#### Features

- **File Reading**: Safe file reading with error handling
- **JSON Parsing**: Robust JSON parsing with detailed error messages
- **Validation**: Multi-level validation (structure, security, performance)
- **Metadata Extraction**: Automatic extraction of policy metadata
- **Policy Analysis**: Detailed analysis of policy contents
- **Security Checks**: Detection of potentially dangerous patterns
- **Performance Analysis**: Identification of performance concerns

### 3. Error Handling Service (`errorHandlingService.js`)

Centralized error handling with recovery suggestions and error tracking.

#### Key Classes

- **`WizardError`**: Custom error class with context
- **`RecoverySuggestion`**: Recovery action suggestions
- **`ErrorHandlerService`**: Main error handling service

#### Usage Example

```javascript
import errorHandlerService, { WizardError, ErrorTypes, ErrorSeverity } from '@/services/wizard/errorHandlingService'

// Handle an error
try {
  // Some operation
  throw new Error('File processing failed')
} catch (error) {
  const handledError = errorHandlerService.handleError(error, {
    step: 0,
    field: 'policyFile',
    metadata: { fileName: 'policy.json' }
  })

  // handledError includes recovery suggestions
  console.log(handledError.recovery.actions)
}

// Create custom error
throw new WizardError('Invalid policy structure', {
  type: ErrorTypes.VALIDATION,
  severity: ErrorSeverity.HIGH,
  code: 'INVALID_STRUCTURE',
  step: 0,
  field: 'policyFile'
})

// Get error log
const recentErrors = errorHandlerService.getErrorLog({ limit: 10 })
```

#### Error Types

- **VALIDATION**: Input validation errors
- **FILE_PROCESSING**: File operation errors
- **NETWORK**: Network-related errors
- **STATE_MANAGEMENT**: State/store errors
- **PARSING**: JSON parsing errors
- **BUSINESS_LOGIC**: Business rule violations
- **SYSTEM**: System-level errors
- **UNKNOWN**: Unclassified errors

#### Recovery Strategies

- **RETRY**: User can retry the operation
- **RESET**: Reset to previous state
- **SKIP**: Skip the problematic step
- **MANUAL**: Manual intervention required
- **AUTO**: Automatic recovery possible
- **NONE**: No recovery available

### 4. Utility Service (`utilityService.js`)

Common utility functions for the wizard.

#### Key Features

- **Debouncing**: Delay function execution
- **Throttling**: Limit execution rate
- **Auto-Save**: Automatic state persistence
- **Deep Clone/Compare**: Object manipulation
- **Formatting**: Bytes, timestamps, relative time
- **Storage**: LocalStorage wrapper
- **Retry Logic**: Exponential backoff retry

#### Usage Example

```javascript
import { debounce, AutoSaveManager, formatBytes, storage } from '@/services/wizard/utilityService'

// Debounce validation
const debouncedValidate = debounce(validateField, 300)
input.addEventListener('input', debouncedValidate)

// Auto-save manager
const autoSave = new AutoSaveManager({
  enabled: true,
  interval: 30000,
  onSave: async () => {
    await dispatch('saveState')
  }
})
autoSave.start()
autoSave.markDirty() // Mark when data changes

// Format file size
console.log(formatBytes(1024)) // "1 KB"

// Storage operations
storage.set('wizardState', stateData)
const state = storage.get('wizardState', defaultState)
```

## Vuex Integration

### Step 1 Actions (`store/modules/wizard/step1Actions.js`)

Contains all Step 1 business logic actions.

#### Available Actions

```javascript
// Initialize Step 1
await dispatch('initializeStep1')

// Update project name
await dispatch('updateProjectName', 'My Policy')

// Update description
await dispatch('updateProjectDescription', 'Policy description')

// Change wizard mode
await dispatch('changeWizardMode', 'create' | 'update')

// Process policy file
await dispatch('processPolicyFileUpload', file)

// Validate create mode
await dispatch('validateStep1Create')

// Validate update mode
await dispatch('validateStep1Update')

// Proceed to next step
await dispatch('proceedFromStep1')

// Auto-save
await dispatch('autoSaveStep1')

// Reset step
await dispatch('resetStep1')

// Get summary
const summary = getters.getStep1Summary()
```

#### Action Flow

1. **User Input** → Validation → State Update
2. **File Upload** → File Processing → Policy Validation → State Update
3. **Proceed** → Validation → Save State → Navigate

#### State Structure

```javascript
{
  projectConfig: {
    name: '',
    description: '',
    mode: 'create', // or 'update'
    existingPolicy: null,
    createdAt: null,
    lastModified: null
  },
  steps: [
    {
      id: 'introduction',
      status: 'pending', // or 'in_progress', 'completed', 'error'
      isValid: false,
      validationErrors: []
    }
  ]
}
```

## Error Handling Strategy

### 1. Input Validation Errors

```javascript
// Validation errors are non-blocking
// User sees inline errors but can continue typing
const result = await dispatch('updateProjectName', name)
if (!result.validation.isValid) {
  // Show inline error messages
  showFieldError(result.validation.errors)
}
```

### 2. File Processing Errors

```javascript
// File errors block progression
try {
  const result = await dispatch('processPolicyFileUpload', file)
  if (!result.success) {
    // Show error dialog with recovery options
    showErrorDialog(result.error)
  }
} catch (error) {
  // Critical error - show full error modal
  showCriticalError(error)
}
```

### 3. State Management Errors

```javascript
// State errors trigger recovery suggestions
const result = await dispatch('proceedFromStep1')
if (!result.success) {
  // Show recovery options
  if (result.error.recovery) {
    showRecoveryDialog(result.error.recovery)
  }
}
```

## Testing Considerations

### Unit Tests

Test each service independently:

```javascript
// validationService.test.js
describe('Step1Validator', () => {
  test('validates project name correctly', () => {
    const result = Step1Validator.validateProjectName('Valid Name')
    expect(result.isValid).toBe(true)
  })

  test('rejects invalid project name', () => {
    const result = Step1Validator.validateProjectName('a')
    expect(result.isValid).toBe(false)
    expect(result.errors[0].message).toContain('at least 3 characters')
  })
})
```

### Integration Tests

Test action flows:

```javascript
// step1Actions.test.js
describe('Step 1 Actions', () => {
  test('complete create flow', async () => {
    await dispatch('initializeStep1')
    await dispatch('updateProjectName', 'Test Policy')
    const result = await dispatch('proceedFromStep1')
    expect(result.success).toBe(true)
  })
})
```

## Best Practices

### 1. Always Validate Before Proceeding

```javascript
// Bad
await dispatch('nextStep')

// Good
const validation = await dispatch('validateStep1Create')
if (validation.success) {
  await dispatch('nextStep')
}
```

### 2. Handle Errors Gracefully

```javascript
try {
  await dispatch('processPolicyFileUpload', file)
} catch (error) {
  // Show user-friendly error message
  // Log technical details for debugging
  console.error('Technical error:', error)
  showUserMessage('Failed to process file. Please try again.')
}
```

### 3. Use Debouncing for Input Validation

```javascript
// Bad - validates on every keystroke
watch: {
  'projectConfig.name'(newVal) {
    this.validateField('name')
  }
}

// Good - debounced validation
methods: {
  onNameInput: debounce(function(value) {
    this.dispatch('updateProjectName', value)
  }, 300)
}
```

### 4. Provide User Feedback

```javascript
// Show loading state
commit('SET_LOADING', { isLoading: true, message: 'Processing...' })

try {
  await processData()
} finally {
  // Always clear loading state
  commit('SET_LOADING', { isLoading: false })
}
```

## Performance Considerations

### 1. Lazy Loading

Services are loaded only when needed:

```javascript
// Component level
async mounted() {
  // Services loaded on demand
  const { Step1Validator } = await import('@/services/wizard/validationService')
}
```

### 2. Debounced Validation

Input validation is debounced to reduce unnecessary processing:

```javascript
const debouncedValidate = debounce(validateField, 300)
```

### 3. Auto-Save Throttling

Auto-save uses throttling to prevent excessive saves:

```javascript
const autoSave = new AutoSaveManager({
  interval: 30000 // Save at most every 30 seconds
})
```

## Security Considerations

### 1. Input Sanitization

All user inputs are sanitized:

```javascript
Validator.sanitizeInput(userInput)
```

### 2. File Validation

Strict file validation prevents malicious uploads:

- File type checking (only .json)
- File size limits (5MB max)
- JSON structure validation
- Security pattern detection

### 3. XSS Prevention

No user input is rendered as HTML without sanitization.

## Debugging

### Enable Debug Logging

```javascript
// Auto-save debug
const autoSave = new AutoSaveManager({ debug: true })

// Error handler debug
if (process.env.NODE_ENV === 'development') {
  console.log('[Debug]', error)
}
```

### Inspect Validation Results

```javascript
const result = Step1Validator.validateProjectName(name)
console.log('Validation Result:', {
  isValid: result.isValid,
  errors: result.errors,
  warnings: result.warnings,
  info: result.info
})
```

### Monitor State Changes

```javascript
// Vuex subscriptions
store.subscribe((mutation, state) => {
  console.log('Mutation:', mutation.type)
  console.log('State:', state.wizard.projectConfig)
})
```

## Future Enhancements

### Planned Features

1. **Offline Support**: Service worker integration for offline operation
2. **Conflict Resolution**: Handle concurrent edits
3. **Version History**: Track policy file versions
4. **Template System**: Pre-configured policy templates
5. **Collaboration**: Multi-user editing support
6. **Advanced Validation**: Schema-based validation
7. **Performance Metrics**: Track validation/processing times
8. **A/B Testing**: Test different validation strategies

## Troubleshooting

### Common Issues

**Issue**: Validation not triggering
```javascript
// Ensure validation is called after state update
await dispatch('updateProjectName', name)
// Validation happens automatically in the action
```

**Issue**: File upload fails
```javascript
// Check file constraints
- Maximum 5MB
- Must be .json extension
- Must contain valid JSON
```

**Issue**: Auto-save not working
```javascript
// Ensure auto-save is started
autoSave.start()

// Mark data as dirty when changed
autoSave.markDirty()
```

## Support

For questions or issues:
1. Check this documentation
2. Review service source code
3. Check error logs in browser console
4. Contact the development team

## License

Internal use only - LogRhythm EZ-Cloud-Fresh Project
