/**
 * Vuex Actions for Step 1: Introduction & Project Setup
 * Contains all business logic for Step 1 operations
 */

import { Step1Validator, AsyncValidator } from '../../../services/wizard/validationService'
import PolicyFileService from '../../../services/wizard/policyFileService'
import errorHandlerService, { WizardError, ErrorTypes, ErrorSeverity } from '../../../services/wizard/errorHandlingService'

/**
 * Step 1 Actions
 */
export default {
  /**
   * Initialize Step 1
   */
  async initializeStep1 ({ commit, state }) {
    try {
      commit('SET_LOADING', { isLoading: true, message: 'Initializing wizard...' })

      // Robust saved-state detection: check for any meaningful saved fields
      const hasSavedState = Boolean(state && state.projectConfig && (
        (typeof state.projectConfig.name === 'string' && state.projectConfig.name.trim() !== '') ||
        (typeof state.projectConfig.mode === 'string' && state.projectConfig.mode !== 'create') ||
        !!state.projectConfig.existingPolicy ||
        !!state.projectConfig.createdAt
      ))

      if (!hasSavedState) {
        // Set default values
        commit('UPDATE_PROJECT_CONFIG', {
          mode: 'create',
          name: '',
          description: '',
          createdAt: new Date().toISOString()
        })
      }

      // Mark step as in progress
      commit('SET_CURRENT_STEP', 0)

      return { success: true }
    } catch (error) {
      const handledError = errorHandlerService.handleError(error, {
        step: 0,
        metadata: { action: 'initializeStep1' }
      })
      commit('ADD_GLOBAL_ERROR', handledError)
      return { success: false, error: handledError }
    } finally {
      commit('SET_LOADING', { isLoading: false })
    }
  },

  /**
   * Update project name with validation
   */
  async updateProjectName ({ commit, dispatch }, name) {
    try {
      // Sanitize input
      const sanitized = (typeof name === 'string') ? name.trim() : ''

      // Update immediately for responsive UI
      commit('UPDATE_PROJECT_CONFIG', { name: sanitized })

      // Synchronous validation
      const validation = Step1Validator.validateProjectName(sanitized)

      // Prepare standardized result shape
      const result = {
        success: true,
        validation,
        name: sanitized,
        asyncValidation: null
      }

      // Only run async validation for non-empty, syntactically valid names
      if (sanitized && validation.isValid) {
        try {
          const asyncValidation = await AsyncValidator.checkPolicyNameExists(sanitized)
          result.asyncValidation = asyncValidation

          // include warnings if present (do not treat warnings as failure)
          if (asyncValidation && Array.isArray(asyncValidation.warnings) && asyncValidation.warnings.length > 0) {
            result.warnings = asyncValidation.warnings
          }
        } catch (asyncErr) {
          // If async check fails, capture a warning but don't block the update
          const asyncHandled = errorHandlerService.handleError(asyncErr, {
            step: 0,
            field: 'name',
            metadata: { action: 'checkPolicyNameExists', value: sanitized }
          })
          result.asyncValidation = { isValid: true, warnings: [asyncHandled.message || 'Name check failed'] }
        }
      }

      return result
    } catch (error) {
      const handledError = errorHandlerService.handleError(error, {
        step: 0,
        field: 'name',
        metadata: { action: 'updateProjectName', value: name }
      })
      commit('ADD_GLOBAL_ERROR', handledError)
      return { success: false, error: handledError }
    }
  },

  /**
   * Update project description
   */
  async updateProjectDescription ({ commit }, description) {
    try {
      const sanitized = description?.trim() || ''

      commit('UPDATE_PROJECT_CONFIG', { description: sanitized })

      // Validate
      const validation = Step1Validator.validateProjectDescription(sanitized)

      return { success: true, validation, description: sanitized }
    } catch (error) {
      const handledError = errorHandlerService.handleError(error, {
        step: 0,
        field: 'description',
        metadata: { action: 'updateProjectDescription' }
      })
      commit('ADD_GLOBAL_ERROR', handledError)
      return { success: false, error: handledError }
    }
  },

  /**
   * Change wizard mode (create/update)
   */
  async changeWizardMode ({ commit, dispatch }, mode) {
    try {
      if (!['create', 'update'].includes(mode)) {
        throw new WizardError('Invalid wizard mode', {
          type: ErrorTypes.VALIDATION,
          severity: ErrorSeverity.HIGH,
          code: 'INVALID_MODE',
          step: 0
        })
      }

      // Clear mode-specific data when switching
      if (mode === 'create') {
        commit('UPDATE_PROJECT_CONFIG', {
          mode,
          existingPolicy: null
        })
      } else {
        commit('UPDATE_PROJECT_CONFIG', { mode })
      }

      // Reset step validation
      commit('RESET_STEP_STATUS', 0)

      return { success: true, mode }
    } catch (error) {
      const handledError = errorHandlerService.handleError(error, {
        step: 0,
        field: 'mode',
        metadata: { action: 'changeWizardMode', value: mode }
      })
      commit('ADD_GLOBAL_ERROR', handledError)
      return { success: false, error: handledError }
    }
  },

  /**
   * Process policy file upload
   */
  async processPolicyFileUpload ({ commit, dispatch, state }, file) {
    try {
      commit('SET_LOADING', { isLoading: true, message: 'Processing policy file...' })

      // Validate input
      if (!file) {
        throw new WizardError('No file provided', {
          type: ErrorTypes.VALIDATION,
          severity: ErrorSeverity.MEDIUM,
          code: 'NO_FILE',
          step: 0,
          field: 'policyFile'
        })
      }

      // Validate and process file
      const result = await PolicyFileService.processPolicyFile(file, {
        validateOnly: false,
        extractMetadata: true,
        analyzePolicy: true,
        deepValidation: true
      })

      if (!result || result.success !== true) {
        // Create user-friendly error
        const errors = (result && Array.isArray(result.errors)) ? result.errors : []
        const errorMessage = errors.length > 0
          ? (errors[0].message || String(errors[0]))
          : 'Failed to process policy file'

        throw new WizardError(errorMessage, {
          type: ErrorTypes.FILE_PROCESSING,
          severity: ErrorSeverity.HIGH,
          code: 'FILE_PROCESSING_FAILED',
          step: 0,
          field: 'policyFile',
          metadata: Object.assign({ fileName: file.name, fileSize: file.size }, { errors })
        })
      }

      // Store the processed policy (use safe fallbacks)
      commit('UPDATE_PROJECT_CONFIG', {
        existingPolicy: result.policy || null,
        name: (result.metadata && result.metadata.name) || state.projectConfig.name,
        description: (result.metadata && result.metadata.description) || state.projectConfig.description
      })

      // Store analysis for later steps (guarded access)
      const analysis = result.analysisResult || result.analysis || null
      if (analysis) {
        const schemaRules = analysis.schemaRules || {}
        if (Array.isArray(schemaRules.convertToJson) && schemaRules.convertToJson.length > 0) {
          commit('UPDATE_SCHEMA_RULES', { convertToJson: schemaRules.convertToJson })
        }

        if (Array.isArray(schemaRules.fanout) && schemaRules.fanout.length > 0) {
          commit('UPDATE_SCHEMA_RULES', { fanout: schemaRules.fanout })
        }

        // Pre-populate filter rules if available (string or object)
        if (analysis.filterRules) {
          commit('UPDATE_FILTER_RULES', { expression: analysis.filterRules })
        }

        // Pre-populate field mappings if available
        if (Array.isArray(analysis.mappings) && analysis.mappings.length > 0) {
          commit('UPDATE_FIELD_MAPPINGS', { mappings: analysis.mappings })
        }
      }

      return {
        success: true,
        policy: result.policy,
        metadata: result.metadata || null,
        analysis: analysis,
        validation: result.validationResult || null,
        warnings: result.warnings || []
      }
    } catch (error) {
      const handledError = errorHandlerService.handleError(error, {
        step: 0,
        field: 'policyFile',
        metadata: Object.assign({ action: 'processPolicyFileUpload' }, { fileName: file?.name, fileSize: file?.size })
      })
      commit('ADD_GLOBAL_ERROR', handledError)
      return { success: false, error: handledError }
    } finally {
      commit('SET_LOADING', { isLoading: false })
    }
  },

  /**
   * Validate Step 1 for "create" mode
   */
  async validateStep1Create ({ state, commit }) {
    try {
      const validation = Step1Validator.validateCreateMode(state.projectConfig)

      if (validation.isValid) {
        commit('COMPLETE_STEP', 0)
      } else {
        commit('MARK_STEP_ERROR', {
          stepIndex: 0,
          errors: validation.errors.map(e => e.message)
        })
      }

      return {
        success: validation.isValid,
        validation,
        errors: validation.errors,
        warnings: validation.warnings
      }
    } catch (error) {
      const handledError = errorHandlerService.handleError(error, {
        step: 0,
        metadata: { action: 'validateStep1Create' }
      })
      commit('ADD_GLOBAL_ERROR', handledError)
      return { success: false, error: handledError }
    }
  },

  /**
   * Validate Step 1 for "update" mode
   */
  async validateStep1Update ({ state, commit }) {
    try {
      const validation = Step1Validator.validateUpdateMode(
        state.projectConfig,
        state.projectConfig.existingPolicy
      )

      if (validation.isValid) {
        commit('COMPLETE_STEP', 0)
      } else {
        commit('MARK_STEP_ERROR', {
          stepIndex: 0,
          errors: validation.errors.map(e => e.message)
        })
      }

      return {
        success: validation.isValid,
        validation,
        errors: validation.errors,
        warnings: validation.warnings
      }
    } catch (error) {
      const handledError = errorHandlerService.handleError(error, {
        step: 0,
        metadata: { action: 'validateStep1Update' }
      })
      commit('ADD_GLOBAL_ERROR', handledError)
      return { success: false, error: handledError }
    }
  },

  /**
   * Validate and proceed to next step
   */
  async proceedFromStep1 ({ state, dispatch, commit }) {
    try {
      commit('SET_LOADING', { isLoading: true, message: 'Validating...' })

      // Validate based on mode
      const result = state.projectConfig.mode === 'create'
        ? await dispatch('validateStep1Create')
        : await dispatch('validateStep1Update')

      if (!result || !result.success) {
        throw new WizardError('Please fix all validation errors before proceeding', {
          type: ErrorTypes.VALIDATION,
          severity: ErrorSeverity.MEDIUM,
          code: 'VALIDATION_FAILED',
          step: 0,
          metadata: {
            errors: (result && result.errors) || [],
            warnings: (result && result.warnings) || []
          }
        })
      }

      // Save state and ensure it succeeded
      const saveResult = await dispatch('saveState')
      if (!saveResult || saveResult.success !== true) {
        throw new WizardError('Failed to save wizard state before navigation', {
          type: ErrorTypes.STATE_MANAGEMENT,
          severity: ErrorSeverity.HIGH,
          code: 'SAVE_STATE_FAILED',
          step: 0,
          metadata: { saveResult }
        })
      }

      // Proceed to next step and ensure navigation succeeded
      const navigated = await dispatch('nextStep')
      if (!navigated || navigated.success !== true) {
        throw new WizardError('Failed to navigate to next step', {
          type: ErrorTypes.STATE_MANAGEMENT,
          severity: ErrorSeverity.HIGH,
          code: 'NAVIGATION_FAILED',
          step: 0,
          metadata: { navigated }
        })
      }

      return { success: true }
    } catch (error) {
      const handledError = errorHandlerService.handleError(error, {
        step: 0,
        metadata: { action: 'proceedFromStep1' }
      })
      commit('ADD_GLOBAL_ERROR', handledError)
      return { success: false, error: handledError }
    } finally {
      commit('SET_LOADING', { isLoading: false })
    }
  },

  /**
   * Auto-save Step 1 data
   */
  async autoSaveStep1 ({ state, dispatch }) {
    try {
      // Only auto-save if there's meaningful data
      if (!state.projectConfig.name && !state.projectConfig.description) {
        return { success: true, skipped: true }
      }

      await dispatch('saveState')

      return { success: true, skipped: false }
    } catch (error) {
      // Don't show error to user for auto-save failures
      console.warn('Auto-save failed:', error)
      return { success: false, error }
    }
  },

  /**
   * Reset Step 1
   */
  async resetStep1 ({ commit, dispatch }) {
    try {
      // Reset project config to defaults
      commit('UPDATE_PROJECT_CONFIG', {
        name: '',
        description: '',
        mode: 'create',
        existingPolicy: null,
        createdAt: new Date().toISOString(),
        lastModified: null
      })

      // Clear step validation
      commit('RESET_STEP_STATUS', 0)

      // Clear related errors
      commit('CLEAR_GLOBAL_ERRORS')

      return { success: true }
    } catch (error) {
      const handledError = errorHandlerService.handleError(error, {
        step: 0,
        metadata: { action: 'resetStep1' }
      })
      commit('ADD_GLOBAL_ERROR', handledError)
      return { success: false, error: handledError }
    }
  },

  /**
   * Get Step 1 summary for review
   */
  getStep1Summary ({ state }) {
    return {
      mode: state?.projectConfig?.mode || 'create',
      projectName: state?.projectConfig?.name || '',
      projectDescription: state?.projectConfig?.description || '',
      hasExistingPolicy: (state?.projectConfig?.mode === 'update') && !!state?.projectConfig?.existingPolicy,
      isComplete: !!(state?.steps && Array.isArray(state.steps) && state.steps[0] && state.steps[0].isValid),
      createdAt: state?.projectConfig?.createdAt || null,
      lastModified: state?.projectConfig?.lastModified || null
    }
  }
}
