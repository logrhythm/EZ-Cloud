// JSON Policy Builder Wizard - Vuex Store Module
// Manages state for the wizard steps, form data, and navigation

import step1Actions from './modules/wizard/step1Actions'
import { storage } from '../services/wizard/utilityService'
import { Step1Validator } from '../services/wizard/validationService'

const STORAGE_KEY = 'json-policy-wizard-state'

// Step definitions with metadata
const WIZARD_STEPS = [
  {
    id: 'introduction',
    title: 'Introduction',
    description: 'Project setup and mode selection',
    icon: 'play_circle_outline',
    order: 0,
    required: true
  },
  {
    id: 'dataupload',
    title: 'Sample Data',
    description: 'Upload or input sample JSON data',
    icon: 'cloud_upload',
    order: 1,
    required: true
  },
  {
    id: 'schemaconfig',
    title: 'Schema Rules',
    description: 'Configure JSON parsing rules',
    icon: 'schema',
    order: 2,
    required: false
  },
  {
    id: 'filterconfig',
    title: 'Filter Rules',
    description: 'Define data filtering conditions',
    icon: 'filter_alt',
    order: 3,
    required: false
  },
  {
    id: 'mapping',
    title: 'Field Mapping',
    description: 'Map fields to LogRhythm schema',
    icon: 'account_tree',
    order: 4,
    required: true
  },
  {
    id: 'subtransform',
    title: 'SubTransform Configuration',
    description: 'Configure conditional field mappings',
    icon: 'account_tree_outline',
    order: 5,
    required: false
  },
  {
    id: 'review',
    title: 'Review & Export',
    description: 'Review policy and export',
    icon: 'preview',
    order: 6,
    required: true
  }
]

// Initial state factory
const getInitialState = () => ({
  // Navigation state
  currentStep: 0,
  completedSteps: [],
  stepValidation: {},
  canNavigateToStep: {},

  // Step status tracking
  steps: WIZARD_STEPS.map(step => ({
    ...step,
    status: 'pending', // pending, in_progress, completed, error
    isValid: false,
    validationErrors: []
  })),

  // Project configuration (Step 1)
  projectConfig: {
    name: '',
    description: '',
    mode: 'create', // create, update
    existingPolicy: null,
    createdBy: '',
    createdAt: null,
    lastModified: null
  },

  // Policy file upload state (for update mode - Phase 1)
  policyUpload: {
    uploadedFile: null, // Original File object
    uploadedPolicyData: null, // Parsed policy JSON
    validationResult: {
      valid: false,
      errors: [],
      warnings: []
    },
    metadata: null, // Policy metadata (name, complexity, etc.)
    isUploading: false,
    uploadError: null
  },

  // Sample data (Step 2)
  sampleData: {
    inputMethod: 'manual', // manual, file, multiple
    rawData: '',
    parsedData: null,
    logType: null, // 'single', 'multiline', or null
    uploadedFileName: null, // Store file name for file upload method
    validationResult: {
      isValid: false,
      errors: [],
      warnings: []
    },
    dataStructure: null, // Analyzed structure for UI display
    dataStats: {
      recordCount: 0,
      fieldCount: 0,
      nestedLevels: 0
    }
  },

  // Schema rules (Step 3)
  schemaRules: {
    convertToJson: [], // Fields to parse as JSON
    fanout: [], // Array fields for fanout processing
    childfanouts: [], // Built childfanouts structure for policy
    detectedStringifiedJson: [], // Auto-detected stringified JSON fields
    manualSelections: [], // User manual selections
    parsedStringifiedJsonFields: {} // Map of field paths to their parsed JSON data
  },

  // Filter rules (Step 4)
  filterRules: {
    conditions: [], // Filter conditions
    operator: 'AND', // AND, OR
    expression: '', // Generated filter expression
    testResults: null, // Results of testing filter against sample data
    availableFields: [] // Fields extracted from sample data
  },

  // Field mapping (Step 5)
  fieldMappings: {
    mappings: [], // Individual field mappings
    unmappedFields: [], // Fields without mappings
    validationIssues: [], // Mapping validation issues
    previewResults: null // Preview of mapping results
  },

  // SubTransform configuration (Step 6)
  subTransforms: {
    skipSubTransforms: false, // User choice to skip SubTransforms
    subTransformsList: [], // Array of SubTransform objects
    testResults: {
      lastRun: null,
      executionTrace: [],
      finalOutput: {}
    },
    validationIssues: [], // Validation errors
    templates: [] // Pre-built SubTransform templates
  },

  // Generated policy (Step 7)
  generatedPolicy: {
    policy: null, // Complete SMA policy object
    policyJson: '', // JSON string representation
    exportOptions: {
      format: 'json', // json, yaml
      includeComments: true,
      minify: false
    },
    validationResult: null
  },

  // UI state
  ui: {
    isLoading: false,
    loadingMessage: '',
    showHelp: false,
    helpContext: '',
    sidebarCollapsed: false,
    autoSave: true,
    lastSaved: null
  },

  // Error handling
  errors: {
    global: [],
    byStep: {},
    recovery: null // Recovery suggestions
  }
})

// State
const state = getInitialState()

// Getters
const getters = {
  // Navigation getters
  getCurrentStep: (state) => state.steps[state.currentStep] || null,
  getStepById: (state) => (stepId) => state.steps.find(step => step.id === stepId),
  getStepByIndex: (state) => (index) => state.steps[index],
  getProgressPercentage: (state) => {
    const completedCount = state.completedSteps.length
    const totalCount = state.steps.length
    return totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0
  },

  // Step status getters
  isStepCompleted: (state) => (stepIndex) => state.completedSteps.includes(stepIndex),
  isStepValid: (state) => (stepIndex) => state.steps[stepIndex]?.isValid || false,
  canNavigateToStep: (state) => (targetIndex) => {
    // Can navigate to current step, previous steps, or next step if current is complete
    return targetIndex <= state.currentStep ||
           (targetIndex === state.currentStep + 1 && state.steps[state.currentStep]?.isValid)
  },

  // Data getters
  hasValidSampleData: (state) => state.sampleData.validationResult.isValid,
  getParsedDataStructure: (state) => state.sampleData.dataStructure,
  getFieldMappingCount: (state) => state.fieldMappings.mappings.length,
  getUnmappedFieldCount: (state) => state.fieldMappings.unmappedFields.length,

  // Fanout arrays getter for Step 5 path resolution
  getFanoutArrays: (state) => state.schemaRules?.fanout || [],

  // Policy generation getters
  isReadyForExport: (state) => {
    return state.projectConfig.name &&
           state.sampleData.validationResult.isValid &&
           state.fieldMappings.mappings.length > 0
  },
  getGeneratedPolicySize: (state) => {
    return state.generatedPolicy.policyJson
      ? new Blob([state.generatedPolicy.policyJson]).size
      : 0
  },

  // Error getters
  getStepErrors: (state) => (stepIndex) => {
    const step = state.steps[stepIndex]
    return step ? step.validationErrors : []
  },
  hasGlobalErrors: (state) => state.errors.global.length > 0,
  getRecoveryOptions: (state) => state.errors.recovery
}

// Mutations
const mutations = {
  // Navigation mutations
  SET_CURRENT_STEP (state, stepIndex) {
    if (typeof stepIndex !== 'number' || isNaN(stepIndex)) {
      console.warn('SET_CURRENT_STEP called with invalid stepIndex:', stepIndex)
      return
    }

    if (stepIndex < 0 || stepIndex >= state.steps.length) {
      console.warn('SET_CURRENT_STEP: stepIndex out of range, resetting to 0:', stepIndex)
      stepIndex = 0
    }

    state.currentStep = stepIndex

    // Ensure step object exists
    if (!state.steps[stepIndex]) {
      state.steps[stepIndex] = { status: 'in_progress', isValid: false, validationErrors: [] }
    } else {
      state.steps[stepIndex].status = 'in_progress'
    }
  },

  COMPLETE_STEP (state, stepIndex) {
    if (typeof stepIndex !== 'number' || isNaN(stepIndex)) {
      console.warn('COMPLETE_STEP called with invalid stepIndex:', stepIndex)
      return
    }

    if (stepIndex >= 0 && stepIndex < state.steps.length) {
      if (!state.completedSteps.includes(stepIndex)) {
        state.completedSteps.push(stepIndex)
      }

      // Ensure step object exists
      if (!state.steps[stepIndex]) {
        state.steps[stepIndex] = { status: 'completed', isValid: true, validationErrors: [] }
      } else {
        state.steps[stepIndex].status = 'completed'
        state.steps[stepIndex].isValid = true
        state.steps[stepIndex].validationErrors = []
      }
    } else {
      console.warn('COMPLETE_STEP: stepIndex out of range, ignoring:', stepIndex)
    }
  },

  MARK_STEP_ERROR (state, { stepIndex, errors = [] }) {
    if (typeof stepIndex !== 'number' || isNaN(stepIndex)) {
      console.warn('MARK_STEP_ERROR called with invalid stepIndex:', stepIndex)
      return
    }

    if (stepIndex >= 0 && stepIndex < state.steps.length) {
      if (!state.steps[stepIndex]) {
        state.steps[stepIndex] = { status: 'error', isValid: false, validationErrors: Array.isArray(errors) ? errors : [errors] }
      } else {
        state.steps[stepIndex].status = 'error'
        state.steps[stepIndex].isValid = false
        state.steps[stepIndex].validationErrors = Array.isArray(errors) ? errors : [errors]
      }
    } else {
      console.warn('MARK_STEP_ERROR: stepIndex out of range, ignoring:', stepIndex)
    }
  },

  RESET_STEP_STATUS (state, stepIndex) {
    if (typeof stepIndex !== 'number' || isNaN(stepIndex)) {
      console.warn('RESET_STEP_STATUS called with invalid stepIndex:', stepIndex)
      return
    }

    if (stepIndex >= 0 && stepIndex < state.steps.length) {
      if (!state.steps[stepIndex]) {
        state.steps[stepIndex] = { status: 'pending', isValid: false, validationErrors: [] }
      } else {
        state.steps[stepIndex].status = 'pending'
        state.steps[stepIndex].isValid = false
        state.steps[stepIndex].validationErrors = []
      }

      // Remove from completed steps
      const completedIndex = state.completedSteps.indexOf(stepIndex)
      if (completedIndex > -1) {
        state.completedSteps.splice(completedIndex, 1)
      }
    } else {
      console.warn('RESET_STEP_STATUS: stepIndex out of range, ignoring:', stepIndex)
    }
  },

  // Project config mutations
  UPDATE_PROJECT_CONFIG (state, config) {
    state.projectConfig = { ...state.projectConfig, ...config }
    state.projectConfig.lastModified = new Date().toISOString()
  },

  // Policy upload mutations (Phase 1)
  SET_UPLOADED_POLICY_FILE (state, file) {
    state.policyUpload.uploadedFile = file
  },

  SET_UPLOADED_POLICY_DATA (state, { policyData, validationResult, metadata }) {
    state.policyUpload.uploadedPolicyData = policyData
    state.policyUpload.validationResult = validationResult || { valid: false, errors: [], warnings: [] }
    state.policyUpload.metadata = metadata || null
  },

  SET_POLICY_UPLOAD_LOADING (state, isLoading) {
    state.policyUpload.isUploading = isLoading
  },

  SET_POLICY_UPLOAD_ERROR (state, error) {
    state.policyUpload.uploadError = error
  },

  CLEAR_UPLOADED_POLICY (state) {
    state.policyUpload = {
      uploadedFile: null,
      uploadedPolicyData: null,
      validationResult: { valid: false, errors: [], warnings: [] },
      metadata: null,
      isUploading: false,
      uploadError: null
    }
  },

  // Sample data mutations
  SET_SAMPLE_DATA (state, data) {
    state.sampleData = { ...state.sampleData, ...data }
  },

  SET_PARSED_DATA (state, { parsedData, dataStructure, dataStats }) {
    state.sampleData.parsedData = parsedData
    state.sampleData.dataStructure = dataStructure
    state.sampleData.dataStats = dataStats || state.sampleData.dataStats
  },

  UPDATE_DATA_VALIDATION (state, validationResult) {
    state.sampleData.validationResult = validationResult
  },

  // Schema rules mutations
  UPDATE_SCHEMA_RULES (state, rules) {
    // Preserve parsedStringifiedJsonFields when updating schema rules
    // This ensures parsed JSON data is not lost when updating other properties
    const preservedParsedFields = state.schemaRules.parsedStringifiedJsonFields || {}
    state.schemaRules = {
      ...state.schemaRules,
      ...rules,
      // Explicitly preserve parsedStringifiedJsonFields unless it's being explicitly updated
      parsedStringifiedJsonFields: rules.parsedStringifiedJsonFields !== undefined
        ? rules.parsedStringifiedJsonFields
        : preservedParsedFields
    }
  },

  ADD_CONVERT_TO_JSON_FIELD (state, fieldPath) {
    if (!state.schemaRules.convertToJson.includes(fieldPath)) {
      state.schemaRules.convertToJson.push(fieldPath)
    }
  },

  REMOVE_CONVERT_TO_JSON_FIELD (state, fieldPath) {
    const index = state.schemaRules.convertToJson.indexOf(fieldPath)
    if (index > -1) {
      state.schemaRules.convertToJson.splice(index, 1)
    }
  },

  ADD_FANOUT_FIELD (state, fieldPath) {
    if (!state.schemaRules.fanout.includes(fieldPath)) {
      state.schemaRules.fanout.push(fieldPath)
    }
  },

  REMOVE_FANOUT_FIELD (state, fieldPath) {
    const index = state.schemaRules.fanout.indexOf(fieldPath)
    if (index > -1) {
      state.schemaRules.fanout.splice(index, 1)
    }
  },

  SET_PARSED_STRINGIFIED_JSON (state, { fieldPath, parsedData }) {
    console.log('╔════════════════════════════════════════════════════════════════════════')
    console.log('║ [Vuex] SET_PARSED_STRINGIFIED_JSON mutation called')
    console.log('╠════════════════════════════════════════════════════════════════════════')
    console.log('║ fieldPath:', fieldPath)
    console.log('║ parsedData type:', typeof parsedData)
    console.log('║ parsedData:', JSON.stringify(parsedData, null, 2))
    console.log('║ Before mutation - parsedStringifiedJsonFields exists:', !!state.schemaRules.parsedStringifiedJsonFields)
    console.log('║ Before mutation - keys:', state.schemaRules.parsedStringifiedJsonFields ? Object.keys(state.schemaRules.parsedStringifiedJsonFields) : 'N/A')
    console.log('╚════════════════════════════════════════════════════════════════════════')

    if (!state.schemaRules.parsedStringifiedJsonFields) {
      state.schemaRules.parsedStringifiedJsonFields = {}
      console.log('[Vuex] Initialized parsedStringifiedJsonFields object')
    }
    state.schemaRules.parsedStringifiedJsonFields[fieldPath] = parsedData

    console.log('╔════════════════════════════════════════════════════════════════════════')
    console.log('║ [Vuex] After mutation - state updated')
    console.log('╠════════════════════════════════════════════════════════════════════════')
    console.log('║ parsedStringifiedJsonFields keys:', Object.keys(state.schemaRules.parsedStringifiedJsonFields))
    console.log('║ parsedStringifiedJsonFields[', fieldPath, ']:', state.schemaRules.parsedStringifiedJsonFields[fieldPath])
    console.log('╚════════════════════════════════════════════════════════════════════════')
  },

  REMOVE_PARSED_STRINGIFIED_JSON (state, fieldPath) {
    if (state.schemaRules.parsedStringifiedJsonFields) {
      delete state.schemaRules.parsedStringifiedJsonFields[fieldPath]
    }
  },

  SET_CHILD_FANOUTS (state, childFanouts) {
    console.log('[Vuex] SET_CHILD_FANOUTS mutation called with:', childFanouts)
    state.schemaRules.childfanouts = childFanouts || []
  },

  SET_CONVERT_TO_JSON_FIELDS (state, fields) {
    console.log('[Vuex] SET_CONVERT_TO_JSON_FIELDS mutation called with:', fields)
    state.schemaRules.convertToJson = fields || []
  },

  SET_SCHEMA_TYPE (state, schemaType) {
    console.log('[Vuex] SET_SCHEMA_TYPE mutation called with:', schemaType)
    // Store schema type if needed (multiline vs singleline)
    // Currently not used in state structure, but adding for future extensibility
    state.schemaRules.schemaType = schemaType
  },

  // Filter rules mutations
  UPDATE_FILTER_RULES (state, rules) {
    state.filterRules = { ...state.filterRules, ...rules }
  },

  ADD_FILTER_CONDITION (state, condition) {
    state.filterRules.conditions.push(condition)
  },

  UPDATE_FILTER_CONDITION (state, { index, condition }) {
    if (index >= 0 && index < state.filterRules.conditions.length) {
      state.filterRules.conditions[index] = condition
    }
  },

  REMOVE_FILTER_CONDITION (state, index) {
    if (index >= 0 && index < state.filterRules.conditions.length) {
      state.filterRules.conditions.splice(index, 1)
    }
  },

  RESET_FILTER_RULES (state) {
    state.filterRules = {
      conditions: [],
      operator: 'AND',
      expression: '',
      testResults: null,
      availableFields: []
    }
  },

  SET_FILTER_AVAILABLE_FIELDS (state, fields) {
    state.filterRules.availableFields = fields
  },

  SET_FILTER_TEST_RESULTS (state, results) {
    state.filterRules.testResults = results
  },

  SET_FILTER_EXPRESSION (state, expression) {
    state.filterRules.expression = expression
  },

  // Field mapping mutations
  UPDATE_FIELD_MAPPINGS (state, mappings) {
    state.fieldMappings = { ...state.fieldMappings, ...mappings }
  },

  ADD_FIELD_MAPPING (state, mapping) {
    state.fieldMappings.mappings.push(mapping)
  },

  UPDATE_FIELD_MAPPING (state, { index, mapping }) {
    if (index >= 0 && index < state.fieldMappings.mappings.length) {
      state.fieldMappings.mappings[index] = mapping
    }
  },

  REMOVE_FIELD_MAPPING (state, index) {
    if (index >= 0 && index < state.fieldMappings.mappings.length) {
      state.fieldMappings.mappings.splice(index, 1)
    }
  },

  RESET_FIELD_MAPPINGS (state) {
    console.log('[Vuex] RESET_FIELD_MAPPINGS mutation called')
    state.fieldMappings = {
      mappings: [],
      unmappedFields: [],
      validationIssues: [],
      previewResults: null
    }
  },

  // SubTransform mutations (Step 6)
  ADD_SUBTRANSFORM (state, subtransform) {
    state.subTransforms.subTransformsList.push(subtransform)
  },

  UPDATE_SUBTRANSFORM (state, { id, updates }) {
    const updateSubTransformRecursive = (list) => {
      for (let i = 0; i < list.length; i++) {
        if (list[i].id === id) {
          // Use Object.assign to update in place to maintain Vue reactivity
          Object.assign(list[i], updates)
          return true
        }
        if (list[i].subTransforms && list[i].subTransforms.length > 0) {
          if (updateSubTransformRecursive(list[i].subTransforms)) {
            return true
          }
        }
      }
      return false
    }
    updateSubTransformRecursive(state.subTransforms.subTransformsList)
  },

  DELETE_SUBTRANSFORM (state, id) {
    const deleteSubTransformRecursive = (list) => {
      for (let i = 0; i < list.length; i++) {
        if (list[i].id === id) {
          list.splice(i, 1)
          return true
        }
        if (list[i].subTransforms && list[i].subTransforms.length > 0) {
          if (deleteSubTransformRecursive(list[i].subTransforms)) {
            return true
          }
        }
      }
      return false
    }
    deleteSubTransformRecursive(state.subTransforms.subTransformsList)
  },

  REORDER_SUBTRANSFORMS (state, { oldIndex, newIndex }) {
    const list = state.subTransforms.subTransformsList
    if (oldIndex >= 0 && oldIndex < list.length && newIndex >= 0 && newIndex < list.length) {
      const item = list.splice(oldIndex, 1)[0]
      list.splice(newIndex, 0, item)
    }
  },

  SET_SKIP_SUBTRANSFORMS (state, value) {
    state.subTransforms.skipSubTransforms = value
  },

  SET_SUBTRANSFORM_TEST_RESULTS (state, results) {
    state.subTransforms.testResults = results
  },

  RESET_SUBTRANSFORMS (state) {
    console.log('[Vuex] RESET_SUBTRANSFORMS mutation called')
    state.subTransforms = {
      skipSubTransforms: false,
      subTransformsList: [],
      testResults: {
        lastRun: null,
        executionTrace: [],
        finalOutput: {}
      },
      validationIssues: [],
      templates: []
    }
  },

  // Generated policy mutations
  SET_GENERATED_POLICY (state, { policy, policyJson }) {
    state.generatedPolicy.policy = policy
    state.generatedPolicy.policyJson = policyJson
  },

  UPDATE_EXPORT_OPTIONS (state, options) {
    state.generatedPolicy.exportOptions = { ...state.generatedPolicy.exportOptions, ...options }
  },

  // UI state mutations
  SET_LOADING (state, { isLoading, message = '' }) {
    state.ui.isLoading = isLoading
    state.ui.loadingMessage = message
  },

  TOGGLE_HELP (state, { show = null, context = '' } = {}) {
    state.ui.showHelp = show !== null ? show : !state.ui.showHelp
    if (context) state.ui.helpContext = context
  },

  TOGGLE_SIDEBAR (state) {
    state.ui.sidebarCollapsed = !state.ui.sidebarCollapsed
  },

  UPDATE_LAST_SAVED (state) {
    state.ui.lastSaved = new Date().toISOString()
  },

  // Error handling mutations
  ADD_GLOBAL_ERROR (state, error) {
    state.errors.global.push({
      id: Date.now(),
      message: error.message || error,
      type: error.type || 'error',
      timestamp: new Date().toISOString(),
      recoverable: error.recoverable !== false
    })
  },

  CLEAR_GLOBAL_ERRORS (state) {
    state.errors.global = []
  },

  SET_RECOVERY_OPTIONS (state, recovery) {
    state.errors.recovery = recovery
  },

  // State management
  RESET_WIZARD (state) {
    // Preserve Vue reactivity by copying properties instead of replacing the object
    const newState = getInitialState()
    Object.keys(newState).forEach(key => { state[key] = newState[key] })
    // Note: Theme state is now managed by the theme-service
    // No need to directly manipulate DOM here
  },

  RESTORE_STATE (state, savedState) {
    // Apply only if savedState looks valid (basic shape check)
    if (savedState && Array.isArray(savedState.steps)) {
      // Merge with defaults to ensure missing keys are present
      const sanitized = { ...getInitialState(), ...savedState }
      Object.keys(sanitized).forEach(key => { state[key] = sanitized[key] })
    } else {
      console.warn('RESTORE_STATE called with invalid saved state')
    }
  }
}

// Actions
const actions = {
  // Import Step 1 actions
  ...step1Actions,

  // Navigation actions
  async navigateToStep ({ commit, getters, state }, stepIndex) {
    try {
      // Validate navigation is allowed
      if (!getters.canNavigateToStep(stepIndex)) {
        throw new Error(`Cannot navigate to step ${stepIndex}`)
      }

      // Mark previous step status
      if (state.currentStep !== stepIndex && getters.isStepValid(state.currentStep)) {
        commit('COMPLETE_STEP', state.currentStep)
      }

      commit('SET_CURRENT_STEP', stepIndex)

      // Auto-save state
      // if (dispatch) {
      //   await dispatch('saveState')
      // }

      return true
    } catch (error) {
      commit('ADD_GLOBAL_ERROR', error)
      return false
    }
  },

  async nextStep ({ dispatch, state }) {
    const nextIndex = state.currentStep + 1
    if (nextIndex < state.steps.length) {
      return await dispatch('navigateToStep', nextIndex)
    }
    return false
  },

  async previousStep ({ dispatch, state }) {
    const prevIndex = state.currentStep - 1
    if (prevIndex >= 0) {
      return await dispatch('navigateToStep', prevIndex)
    }
    return false
  },

  // Step validation actions
  async validateCurrentStep ({ commit, state, getters }) {
    const currentStep = getters.getCurrentStep
    if (!currentStep) {
      commit('ADD_GLOBAL_ERROR', new Error('Invalid current step'))
      return { isValid: false, errors: ['Invalid current step'] }
    }

    let isValid = true
    let errors = []

    try {
      switch (currentStep.id) {
        case 'introduction':
          // Use central Step1 validators to determine validity
          if (state.projectConfig.mode === 'create') {
            const validation = Step1Validator.validateCreateMode(state.projectConfig)
            isValid = validation.isValid
            if (!isValid) errors = validation.errors.map(e => e.message)
          } else {
            const validation = Step1Validator.validateUpdateMode(state.projectConfig, state.projectConfig.existingPolicy)
            isValid = validation.isValid
            if (!isValid) errors = validation.errors.map(e => e.message)
          }
          break

        case 'dataupload':
          isValid = state.sampleData.validationResult.isValid
          if (!isValid) errors = state.sampleData.validationResult.errors
          break

        case 'schemaconfig':
          // Step 3 is optional, so it's always valid
          // We just validate the format of selections if any exist
          isValid = true
          if (state.schemaRules.convertToJson && state.schemaRules.convertToJson.length > 0) {
            // Validate JSONPath format for convertToJson fields
            for (const field of state.schemaRules.convertToJson) {
              if (!field || typeof field !== 'string' || !field.startsWith('$')) {
                isValid = false
                errors.push(`Invalid JSONPath format for Convert to JSON field: ${field}`)
              }
            }
          }
          if (state.schemaRules.fanout && state.schemaRules.fanout.length > 0) {
            // Validate JSONPath format for fanout fields
            for (const field of state.schemaRules.fanout) {
              if (!field || typeof field !== 'string' || !field.startsWith('$')) {
                isValid = false
                errors.push(`Invalid JSONPath format for Fanout field: ${field}`)
              }
            }
          }
          break

        case 'filterconfig':
          // Step 4 is optional, so it's always valid
          // We validate the format of conditions if any exist
          isValid = true
          if (state.filterRules.conditions && state.filterRules.conditions.length > 0) {
            for (let i = 0; i < state.filterRules.conditions.length; i++) {
              const condition = state.filterRules.conditions[i]
              if (!condition.field || !condition.operator) {
                isValid = false
                errors.push(`Filter condition ${i + 1} is incomplete`)
              }
            }
          }
          break

        case 'mapping':
          isValid = state.fieldMappings.mappings.length > 0
          if (!isValid) errors.push('At least one field mapping is required')
          break

        case 'subtransform':
          // Step 6 is optional - valid if skipped or has at least one SubTransform
          isValid = state.subTransforms.skipSubTransforms ||
                    state.subTransforms.subTransformsList.length > 0
          if (!isValid) {
            // If not skipping and no SubTransforms, add warning but allow navigation
            isValid = true // Make it valid anyway since it's optional
          }
          break

        case 'review':
          // Final step - always valid if we got here
          isValid = true
          break

        // Add other step validations as needed
      }

      if (isValid) {
        commit('COMPLETE_STEP', state.currentStep)
      } else {
        commit('MARK_STEP_ERROR', { stepIndex: state.currentStep, errors })
      }

      return { isValid, errors }
    } catch (error) {
      commit('ADD_GLOBAL_ERROR', error)
      return { isValid: false, errors: [error.message] }
    }
  },

  // Data processing actions
  async processSampleData ({ commit }, { rawData, inputMethod = 'manual' }) {
    commit('SET_LOADING', { isLoading: true, message: 'Processing sample data...' })

    try {
      let parsedData
      let dataStructure
      const validationResult = { isValid: false, errors: [], warnings: [] }
      const dataStats = { recordCount: 0, fieldCount: 0, nestedLevels: 0 }

      // Normalize rawData to string to avoid crashes when non-string provided
      rawData = (typeof rawData === 'string') ? rawData : String(rawData || '')

      // Parse JSON data
      try {
        if (inputMethod === 'multiple') {
          // Handle multiple JSON objects (one per line)
          const lines = rawData.trim().split('\n').filter(line => line && line.trim())
          parsedData = lines.map(line => JSON.parse(line))
          dataStats.recordCount = parsedData.length
        } else {
          // Handle single JSON object or array
          parsedData = JSON.parse(rawData)
          dataStats.recordCount = Array.isArray(parsedData) ? parsedData.length : 1
        }

        validationResult.isValid = true

        // Analyze data structure
        dataStructure = analyzeDataStructure(parsedData)
        dataStats.fieldCount = countFields(dataStructure)
        dataStats.nestedLevels = getMaxNestingLevel(dataStructure)
      } catch (parseError) {
        validationResult.errors.push(`Invalid JSON: ${parseError.message}`)
      }

      // Update state
      commit('SET_SAMPLE_DATA', { rawData, inputMethod })
      commit('SET_PARSED_DATA', { parsedData, dataStructure, dataStats })
      commit('UPDATE_DATA_VALIDATION', validationResult)

      return validationResult
    } catch (error) {
      commit('ADD_GLOBAL_ERROR', error)
      return { isValid: false, errors: [error.message], warnings: [] }
    } finally {
      commit('SET_LOADING', { isLoading: false })
    }
  },

  // SubTransform actions (Step 6)
  addSubTransformAction ({ commit }, subtransform) {
    commit('ADD_SUBTRANSFORM', subtransform)
  },

  updateSubTransformAction ({ commit }, payload) {
    commit('UPDATE_SUBTRANSFORM', payload)
  },

  deleteSubTransformAction ({ commit }, id) {
    commit('DELETE_SUBTRANSFORM', id)
  },

  reorderSubTransformAction ({ commit }, payload) {
    commit('REORDER_SUBTRANSFORMS', payload)
  },

  setSkipSubTransforms ({ commit }, value) {
    commit('SET_SKIP_SUBTRANSFORMS', value)
  },

  async testSubTransforms ({ commit, state }, sampleData) {
    try {
      // TODO: Implement test logic in Phase 6
      // This will evaluate SubTransforms against sample data
      const results = {
        lastRun: new Date().toISOString(),
        executionTrace: [],
        finalOutput: {}
      }
      commit('SET_SUBTRANSFORM_TEST_RESULTS', results)
      return results
    } catch (error) {
      commit('ADD_GLOBAL_ERROR', error)
      return null
    }
  },

  // State persistence actions
  async saveState ({ state }) {
    try {
      const stateToSave = {
        ...state,
        ui: {
          ...state.ui,
          lastSaved: new Date().toISOString()
        }
      }
      return storage.set(STORAGE_KEY, stateToSave)
    } catch (error) {
      console.error('Failed to save wizard state:', error)
      return false
    }
  },

  async loadState ({ commit }) {
    try {
      const parsedState = storage.get(STORAGE_KEY, null)
      if (parsedState) {
        commit('RESTORE_STATE', parsedState)
        return true
      }
      return false
    } catch (error) {
      console.error('Failed to load wizard state:', error)
      return false
    }
  },

  /**
   * Clears the wizard state completely, resetting it to the initial state
   * This will remove data from all steps and navigate back to the first step
   */
  async clearState ({ commit, state }) {
    try {
      console.log('[Vuex] clearState action called - resetting all wizard state')

      // Remove saved state from storage
      storage.remove(STORAGE_KEY)

      // Reset wizard state completely
      commit('RESET_WIZARD')

      // Explicitly reset all step-specific state to ensure clean reset
      commit('RESET_FILTER_RULES')
      commit('RESET_FIELD_MAPPINGS')
      commit('RESET_SUBTRANSFORMS')

      // Reset current step to 0 (first step)
      commit('SET_CURRENT_STEP', 0)

      // Clear status for all steps
      for (let i = 0; i < state.steps.length; i++) {
        commit('RESET_STEP_STATUS', i)
      }

      console.log('[Vuex] clearState completed - all state reset')

      return true
    } catch (error) {
      console.error('Failed to clear wizard state:', error)
      return false
    }
  },

  // Policy file upload actions (Phase 1)
  async uploadPolicyFile ({ commit }, file) {
    // Import the PolicyValidator service dynamically
    const { PolicyValidator } = await import('../services/wizard/policyValidator.js')

    commit('SET_POLICY_UPLOAD_LOADING', true)
    commit('SET_POLICY_UPLOAD_ERROR', null)

    try {
      console.log('[Vuex] uploadPolicyFile: Starting validation for file:', file?.name)

      // Validate the policy file
      const validationResult = await PolicyValidator.validatePolicyFile(file)

      console.log('[Vuex] uploadPolicyFile: Validation result:', {
        valid: validationResult.valid,
        errorCount: validationResult.errors.length,
        warningCount: validationResult.warnings.length
      })

      // Store the file object
      commit('SET_UPLOADED_POLICY_FILE', file)

      // Store the validation result and parsed policy data
      commit('SET_UPLOADED_POLICY_DATA', {
        policyData: validationResult.policy,
        validationResult: {
          valid: validationResult.valid,
          errors: validationResult.errors,
          warnings: validationResult.warnings
        },
        metadata: validationResult.metadata
      })

      // If validation succeeded, also update projectConfig.existingPolicy
      if (validationResult.valid && validationResult.policy) {
        commit('UPDATE_PROJECT_CONFIG', {
          existingPolicy: validationResult.policy
        })

        console.log('[Vuex] uploadPolicyFile: Policy successfully uploaded and stored')
      } else {
        console.warn('[Vuex] uploadPolicyFile: Validation failed with errors:', validationResult.errors)
      }

      return validationResult
    } catch (error) {
      console.error('[Vuex] uploadPolicyFile: Unexpected error:', error)
      const errorMessage = error.message || 'Unexpected error during file upload'
      commit('SET_POLICY_UPLOAD_ERROR', errorMessage)
      commit('SET_UPLOADED_POLICY_DATA', {
        policyData: null,
        validationResult: {
          valid: false,
          errors: [errorMessage],
          warnings: []
        },
        metadata: null
      })

      return {
        valid: false,
        errors: [errorMessage],
        warnings: [],
        policy: null,
        metadata: null
      }
    } finally {
      commit('SET_POLICY_UPLOAD_LOADING', false)
    }
  },

  clearPolicyFile ({ commit }) {
    console.log('[Vuex] clearPolicyFile: Clearing uploaded policy')
    commit('CLEAR_UPLOADED_POLICY')
    commit('UPDATE_PROJECT_CONFIG', {
      existingPolicy: null,
      mode: 'create'
    })
  },

  // Policy generation actions
  async generatePolicy ({ commit, state }) {
    commit('SET_LOADING', { isLoading: true, message: 'Generating policy...' })

    try {
      // Use the existing buildSmaPolicyTransformFromParams mixin logic
      // This would integrate with the existing policy building functionality
      // (policyData is not used, so removed to fix lint error)

      // This would call the existing buildSmaPolicyTransformFromParams method
      // For now, create a basic policy structure
      const policy = {
        name: state.projectConfig.name,
        description: state.projectConfig.description,
        filter: state.filterRules.expression || null,
        schemarule: {},
        // Clean transforms - remove UI-only attributes like sampleValue and id
        transforms: state.fieldMappings.mappings.map(mapping => {
          const cleanMapping = { ...mapping }
          delete cleanMapping.sampleValue
          delete cleanMapping.id
          delete cleanMapping.originalInputRule // Remove UI tracking field
          return cleanMapping
        })
      }

      // Build schema rule section
      if (state.schemaRules.convertToJson && state.schemaRules.convertToJson.length > 0) {
        policy.schemarule.ConvertoJson = state.schemaRules.convertToJson
      }

      // Add childfanouts if present (new hierarchical structure)
      if (state.schemaRules.childfanouts && state.schemaRules.childfanouts.length > 0) {
        policy.schemarule.childfanouts = state.schemaRules.childfanouts
      }

      // Remove schemarule if empty
      if (Object.keys(policy.schemarule).length === 0) {
        delete policy.schemarule
      }

      // Add subtransforms if not skipped (Step 6 - SubTransform Configuration)
      if (!state.subTransforms.skipSubTransforms &&
          state.subTransforms.subTransformsList &&
          state.subTransforms.subTransformsList.length > 0) {
        // Recursively clean subtransforms
        const cleanSubTransforms = (subtransformsList) => {
          return subtransformsList.map(subtransform => {
            const cleanSubtransform = { ...subtransform }

            // Remove UI-only properties from subtransform
            delete cleanSubtransform.id
            delete cleanSubtransform.name

            // Clean nested transforms within subtransform
            if (cleanSubtransform.transforms && Array.isArray(cleanSubtransform.transforms)) {
              cleanSubtransform.transforms = cleanSubtransform.transforms.map(transform => {
                const cleanTransform = { ...transform }
                delete cleanTransform.sampleValue
                delete cleanTransform.id
                delete cleanTransform.originalInputRule // Remove UI tracking field
                delete cleanTransform._originalInputRule // Remove UI tracking field (subtransform variant)
                return cleanTransform
              })
            }

            // Recursively clean nested subtransforms
            if (cleanSubtransform.subTransforms && Array.isArray(cleanSubtransform.subTransforms) && cleanSubtransform.subTransforms.length > 0) {
              cleanSubtransform.subTransforms = cleanSubTransforms(cleanSubtransform.subTransforms)
            }

            return cleanSubtransform
          })
        }

        policy.subtransforms = cleanSubTransforms(state.subTransforms.subTransformsList)
      }

      const policyJson = JSON.stringify(policy, null, 2)

      commit('SET_GENERATED_POLICY', { policy, policyJson })

      return policy
    } catch (error) {
      commit('ADD_GLOBAL_ERROR', error)
      throw error
    } finally {
      commit('SET_LOADING', { isLoading: false })
    }
  }
}

// Helper functions
function analyzeDataStructure (data) {
  // Recursive function to analyze JSON structure
  // This would create a tree representation of the data structure
  // Implementation details would depend on requirements
  return {} // Placeholder
}

function countFields (structure) {
  // Count total number of fields in the structure
  return 0 // Placeholder
}

function getMaxNestingLevel (structure) {
  // Calculate maximum nesting depth
  return 0 // Placeholder
}

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
}
