# Wizard Backend Services Documentation

This directory contains all backend logic and services for the LogRhythm JSON Policy Builder Wizard.

## Overview

The backend implementation is organized into modular, reusable services that handle:

- **Data validation** (field-level and form-level)
- **Policy file processing** (parsing, validation, analysis)
- **Data processing** (JSON parsing, structure analysis, detection)
- **Error handling** (centralized error management and recovery)
- **State management** (Vuex actions and mutations)
- **Utility functions** (debouncing, auto-save, formatting)

## Architecture

```
src/services/wizard/
├── index.js                      # Service exports
├── validationService.js          # Validation logic
├── policyFileService.js          # Policy file operations
├── dataProcessingService.js      # JSON data processing
├── errorHandlingService.js       # Error handling
├── utilityService.js             # Utility functions
├── dataProcessingService.test.js # Tests for data processing
└── README.md                     # This file

src/store/modules/wizard/
└── step1Actions.js               # Step 1 Vuex actions
```

## Services

### 1. Validation Service (`validationService.js`)

Provides comprehensive validation for all wizard inputs.

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

### 3. Data Processing Service (`dataProcessingService.js`)

Provides specialized JSON data handling for Step 2, including parsing, structure analysis, and feature detection.

#### Key Classes

- **`DataProcessor`**: Main class for processing JSON data

#### Usage Example

```javascript
import { DataProcessor } from '@/services/wizard/dataProcessingService'

// Process raw JSON data
const result = await DataProcessor.processSampleData(jsonString, 'manual')

if (result.validationResult.isValid) {
  console.log('Parsed data:', result.parsedData)
  console.log('Data structure:', result.dataStructure)
  console.log('Data statistics:', result.dataStats)
} else {
  console.error('Validation errors:', result.validationResult.errors)
}

// Find array fields in structure
const arrayFields = DataProcessor.findArrayFields(result.dataStructure)

// Find stringified JSON fields
const stringifiedJsonFields = DataProcessor.findStringifiedJsonFields(result.parsedData)

// Format JSON
const formattedJson = DataProcessor.formatJson(jsonString)
```

#### Features

- **JSON Parsing**: Robust JSON parsing with detailed error reporting
- **Structure Analysis**: Deep analysis of JSON structure with metadata
- **Array Detection**: Find and classify array fields for fanout
- **Stringified JSON Detection**: Identify fields containing stringified JSON
- **Data Statistics**: Calculate metrics about the data (record count, field count, nesting levels)
- **Data Formatting**: Pretty-print JSON data with proper indentation
- **Validation**: Comprehensive validation with specific error messages

### 4. Error Handling Service (`errorHandlingService.js`)

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

### 5. Utility Service (`utilityService.js`)

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

### State Management for Wizard

Contains Vuex actions and mutations for wizard steps.

#### Available Actions

```javascript
// Step 1 actions
await dispatch('initializeStep1')
await dispatch('updateProjectName', 'My Policy')
await dispatch('updateProjectDescription', 'Policy description')
await dispatch('changeWizardMode', 'create' | 'update')
await dispatch('processPolicyFileUpload', file)

// Step 2 actions
await dispatch('processSampleData', { rawData, inputMethod })
await dispatch('updateSchemaRules', { convertToJson: jsonFields })
await dispatch('updateSchemaRules', { fanout: arrayFields })

// Navigation actions
await dispatch('navigateToStep', stepIndex)
await dispatch('nextStep')
await dispatch('previousStep')
await dispatch('validateCurrentStep')

// State persistence
await dispatch('saveState')
await dispatch('loadState')
await dispatch('clearState')

// Policy generation
await dispatch('generatePolicy')
```

#### State Structure

```javascript
{
  // Navigation state
  currentStep: 0,
  completedSteps: [],

  // Step status tracking
  steps: [
    {
      id: 'introduction',
      status: 'pending', // or 'in_progress', 'completed', 'error'
      isValid: false,
      validationErrors: []
    },
    {
      id: 'dataupload',
      status: 'pending',
      isValid: false,
      validationErrors: []
    },
    // ... other steps
  ],

  // Project configuration (Step 1)
  projectConfig: {
    name: '',
    description: '',
    mode: 'create', // or 'update'
    existingPolicy: null,
    createdBy: '',
    createdAt: null,
    lastModified: null
  },

  // Sample data (Step 2)
  sampleData: {
    inputMethod: 'manual', // manual, file, multiple
    rawData: '',
    parsedData: null,
    dataStructure: null,
    dataStats: {
      recordCount: 0,
      fieldCount: 0,
      nestedLevels: 0
    },
    validationResult: {
      isValid: false,
      errors: [],
      warnings: []
    }
  },

  // Schema rules (Step 3)
  schemaRules: {
    convertToJson: [],
    fanout: [],
    detectedStringifiedJson: [],
    manualSelections: []
  },

  // ... other step data
}
```

## Testing

### Running Tests

To run the tests for the Data Processing Service:

```bash
# Assuming Jest or similar test runner is configured
jest dataProcessingService.test.js

# Or manual browser testing
# Open the test file in a browser with appropriate module loading
```

### Test Coverage

The `dataProcessingService.test.js` file includes tests for:

- Processing single JSON objects
- Processing JSON arrays
- Processing multiple JSON objects (one per line)
- Handling invalid JSON input
- Detecting stringified JSON fields
- Finding array fields
- Formatting JSON

## Best Practices

### 1. Centralize Business Logic

```javascript
// Bad: Logic in component
methods: {
  async validateJsonData() {
    try {
      const parsedData = JSON.parse(this.rawData)
      // Component-level processing...
    } catch (e) {
      this.error = e.message
    }
  }
}

// Good: Use service
methods: {
  async validateJsonData() {
    const result = await DataProcessor.processSampleData(this.rawData)
    this.updateState(result)
  }
}
```

### 2. Handle Errors Gracefully

```javascript
try {
  const result = await DataProcessor.processSampleData(rawData)
  // Use result
} catch (error) {
  console.error('Processing error:', error)
  // Show user-friendly message
}
```

### 3. Use Debouncing for Input Validation

```javascript
// Use debounced validation for real-time input
const debouncedValidate = debounce(() => {
  DataProcessor.processSampleData(this.rawData)
}, 500)

// Call on input events
onInput() {
  debouncedValidate()
}
```

## License

Internal use only - LogRhythm EZ-Cloud-Fresh Project