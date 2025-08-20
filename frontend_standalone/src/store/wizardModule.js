// JSON Policy Builder Wizard - Vuex Store Module
// Manages state for the wizard steps, form data, and navigation

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
    id: 'review',
    title: 'Review & Export',
    description: 'Review policy and export',
    icon: 'preview',
    order: 5,
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

  // Sample data (Step 2)
  sampleData: {
    inputMethod: 'manual', // manual, file, multiple
    rawData: '',
    parsedData: null,
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
    detectedStringifiedJson: [], // Auto-detected stringified JSON fields
    manualSelections: [] // User manual selections
  },

  // Filter rules (Step 4)
  filterRules: {
    conditions: [], // Filter conditions
    operator: 'AND', // AND, OR
    expression: '', // Generated filter expression
    testResults: null // Results of testing filter against sample data
  },

  // Field mapping (Step 5)
  fieldMappings: {
    mappings: [], // Individual field mappings
    unmappedFields: [], // Fields without mappings
    validationIssues: [], // Mapping validation issues
    previewResults: null // Preview of mapping results
  },

  // Generated policy (Step 6)
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
  getCurrentStep: (state) => state.steps[state.currentStep],
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
    if (stepIndex >= 0 && stepIndex < state.steps.length) {
      state.currentStep = stepIndex
      state.steps[stepIndex].status = 'in_progress'
    }
  },

  COMPLETE_STEP (state, stepIndex) {
    if (stepIndex >= 0 && stepIndex < state.steps.length) {
      if (!state.completedSteps.includes(stepIndex)) {
        state.completedSteps.push(stepIndex)
      }
      state.steps[stepIndex].status = 'completed'
      state.steps[stepIndex].isValid = true
      state.steps[stepIndex].validationErrors = []
    }
  },

  MARK_STEP_ERROR (state, { stepIndex, errors = [] }) {
    if (stepIndex >= 0 && stepIndex < state.steps.length) {
      state.steps[stepIndex].status = 'error'
      state.steps[stepIndex].isValid = false
      state.steps[stepIndex].validationErrors = Array.isArray(errors) ? errors : [errors]
    }
  },

  RESET_STEP_STATUS (state, stepIndex) {
    if (stepIndex >= 0 && stepIndex < state.steps.length) {
      state.steps[stepIndex].status = 'pending'
      state.steps[stepIndex].isValid = false
      state.steps[stepIndex].validationErrors = []
      // Remove from completed steps
      const completedIndex = state.completedSteps.indexOf(stepIndex)
      if (completedIndex > -1) {
        state.completedSteps.splice(completedIndex, 1)
      }
    }
  },

  // Project config mutations
  UPDATE_PROJECT_CONFIG (state, config) {
    state.projectConfig = { ...state.projectConfig, ...config }
    state.projectConfig.lastModified = new Date().toISOString()
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
    state.schemaRules = { ...state.schemaRules, ...rules }
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
    Object.assign(state, getInitialState())
    // Note: Theme state is now managed by the theme-service
    // No need to directly manipulate DOM here
  },

  RESTORE_STATE (state, savedState) {
    Object.assign(state, savedState)
  }
}

// Actions
const actions = {
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
    let isValid = true
    let errors = []

    try {
      switch (currentStep.id) {
        case 'introduction':
          isValid = Boolean(state.projectConfig.name && state.projectConfig.description)
          if (!isValid) errors.push('Project name and description are required')
          break

        case 'dataupload':
          isValid = state.sampleData.validationResult.isValid
          if (!isValid) errors = state.sampleData.validationResult.errors
          break

        case 'mapping':
          isValid = state.fieldMappings.mappings.length > 0
          if (!isValid) errors.push('At least one field mapping is required')
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

      // Parse JSON data
      try {
        if (inputMethod === 'multiple') {
          // Handle multiple JSON objects (one per line)
          const lines = rawData.trim().split('\n').filter(line => line.trim())
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
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave))
      return true
    } catch (error) {
      console.error('Failed to save wizard state:', error)
      return false
    }
  },

  async loadState ({ commit }) {
    try {
      const savedState = localStorage.getItem(STORAGE_KEY)
      if (savedState) {
        const parsedState = JSON.parse(savedState)
        commit('RESTORE_STATE', parsedState)
        return true
      }
      return false
    } catch (error) {
      console.error('Failed to load wizard state:', error)
      return false
    }
  },

  async clearState ({ commit }) {
    try {
      localStorage.removeItem(STORAGE_KEY)
      commit('RESET_WIZARD')
      return true
    } catch (error) {
      console.error('Failed to clear wizard state:', error)
      return false
    }
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
        schemarule: {
          ConvertoJson: state.schemaRules.convertToJson.length ? state.schemaRules.convertToJson : null,
          fanout: {
            InputField: state.schemaRules.fanout.length ? state.schemaRules.fanout : null
          }
        },
        transforms: state.fieldMappings.mappings
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
