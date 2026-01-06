<template>
  <div class="step-introduction">
    <!-- Step Header -->
    <div class="step-header">
      <div class="step-icon">
        <q-icon name="play_circle_outline" size="48px" class="text-primary" />
      </div>
      <div class="step-title-section">
        <h2 class="step-title">Welcome to the JSON Policy Builder</h2>
        <p class="step-subtitle">
          This wizard will guide you through creating a LogRhythm JSON parsing policy step-by-step.
          Let's start by setting up your project.
        </p>
      </div>
    </div>

    <div class="step-content">

      <!-- Mode Selection Card -->
      <q-card class="mode-card wizard-card">
        <q-card-section class="card-header">
          <div class="card-title">
            <q-icon name="alt_route" class="q-mr-sm" />
            Wizard Mode
          </div>
          <p class="card-description">
            Choose how you want to work with the policy wizard.
          </p>
        </q-card-section>

        <q-card-section class="card-content">
          <q-option-group
            v-model="projectMode"
            :options="modeOptions"
            color="primary"
            class="mode-selection"
          />

          <!-- Policy Name Input (shown when creating a new policy OR when policy is uploaded in update mode) -->
          <div v-if="projectConfig.mode === 'create' || (projectConfig.mode === 'update' && existingPolicyPreview)" class="policy-name-input q-mt-md">
            <q-input
              v-model="projectName"
              label="Policy Name *"
              :hint="projectConfig.mode === 'create' ? 'Enter a name for your new policy' : 'Edit the policy name (will update the exported policy)'"
              outlined
              dense
              :error="errors.name.length > 0"
              :error-message="errors.name[0]"
              @blur="validateField('name')"
              @input="onFieldChange('name')"
              class="wizard-input"
              maxlength="100"
            >
              <template v-slot:prepend>
                <q-icon name="label" class="q-mr-sm" style="color: var(--lr-bright-border);" />
              </template>
            </q-input>
          </div>

          <!-- Mode Description -->
          <div class="mode-description">
            <q-card
              flat
              bordered
              class="description-card"
              :class="`mode-${projectConfig.mode}`"
            >
              <q-card-section>
                <div class="mode-info">
                  <q-icon
                    :name="selectedModeInfo.icon"
                    size="24px"
                    :class="selectedModeInfo.icon === 'edit' ? 'text-primary q-mr-sm' : `text-${selectedModeInfo.color} q-mr-sm`"
                  />
                  <div>
                    <div class="text-h6 q-mb-xs">{{ selectedModeInfo.title }}</div>
                    <div class="text-body2 text-grey-7">{{ selectedModeInfo.description }}</div>
                  </div>
                </div>

                <!-- Features List -->
                <q-list dense class="q-mt-md">
                  <q-item
                    v-for="feature in selectedModeInfo.features"
                    :key="feature"
                    class="q-px-none q-py-xs"
                  >
                    <q-item-section avatar>
                      <q-icon name="check_circle" size="16px" color="positive" />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label class="text-body2">{{ feature }}</q-item-label>
                    </q-item-section>
                  </q-item>
                </q-list>
              </q-card-section>
            </q-card>
          </div>

          <!-- File Upload for Update Mode -->
          <transition name="slide-fade">
            <div v-if="projectConfig.mode === 'update'" class="update-section">
              <q-separator class="q-my-lg" />

              <div class="upload-header">
                <q-icon name="cloud_upload" class="q-mr-sm" />
                <span class="text-h6">Upload Existing Policy</span>
              </div>

              <q-file
                ref="policyFileInput"
                v-model="existingPolicyFile"
                :key="fileInputKey"
                accept=".json"
                outlined
                dense
                label="Choose policy file"
                hint="Select a JSON policy file to update"
                :error="errors.existingPolicy.length > 0"
                :error-message="errors.existingPolicy[0]"
                @input="onFileUpload"
                class="wizard-file-input q-mt-md"
              >
                <template v-slot:prepend>
                  <q-icon name="attach_file" class="q-mr-sm" style="color: var(--lr-bright-border);" />
                </template>
              </q-file>

              <!-- File Preview & Metadata -->
              <transition name="fade">
                <div v-if="existingPolicyPreview" class="file-preview q-mt-md">
                  <!-- Policy Metadata Card -->
                  <q-card v-if="policyUpload.metadata" flat bordered class="metadata-card q-mb-md">
                    <q-card-section>
                      <div class="preview-header">
                        <q-icon name="info" class="q-mr-sm text-info" />
                        <span class="text-subtitle2">Policy Information</span>
                        <q-space />
                        <q-btn
                          flat
                          dense
                          icon="close"
                          label="Clear Policy"
                          color="negative"
                          @click="clearUploadedPolicy"
                          class="text-caption"
                        >
                          <q-tooltip>Clear uploaded policy and start over</q-tooltip>
                        </q-btn>
                      </div>
                      <div class="metadata-content q-mt-md">
                        <div class="metadata-row">
                          <span class="metadata-label">Original Policy Name:</span>
                          <span class="metadata-value">{{ policyUpload.metadata.policyName || 'N/A' }}</span>
                        </div>
                        <q-banner v-if="projectConfig.name !== policyUpload.metadata.policyName" dense class="q-mt-sm" style="background: rgba(33, 150, 243, 0.1); border-left: 4px solid var(--q-primary);">
                          <template v-slot:avatar>
                            <q-icon name="info" color="primary" />
                          </template>
                          <div class="text-caption">
                            Policy will be exported with updated name: <strong>{{ projectConfig.name }}</strong>
                          </div>
                        </q-banner>
                        <div class="metadata-row">
                          <span class="metadata-label">Complexity:</span>
                          <q-chip
                            dense
                            :color="getComplexityColor(policyUpload.metadata.complexity)"
                            text-color="white"
                            size="sm"
                          >
                            {{ policyUpload.metadata.complexity }}
                          </q-chip>
                        </div>
                        <div class="metadata-row">
                          <span class="metadata-label">Field Mappings:</span>
                          <span class="metadata-value">{{ policyUpload.metadata.transformCount }}</span>
                        </div>
                        <div class="metadata-row">
                          <span class="metadata-label">Has Filter:</span>
                          <q-icon
                            :name="policyUpload.metadata.hasFilter ? 'check_circle' : 'cancel'"
                            :color="policyUpload.metadata.hasFilter ? 'positive' : 'grey'"
                            size="sm"
                          />
                        </div>
                        <div class="metadata-row">
                          <span class="metadata-label">Has Schema Rules:</span>
                          <q-icon
                            :name="policyUpload.metadata.hasSchemaRule ? 'check_circle' : 'cancel'"
                            :color="policyUpload.metadata.hasSchemaRule ? 'positive' : 'grey'"
                            size="sm"
                          />
                        </div>
                        <div class="metadata-row" v-if="policyUpload.metadata.hasSubTransforms">
                          <span class="metadata-label">SubTransforms:</span>
                          <span class="metadata-value">{{ policyUpload.metadata.subTransformCount }}</span>
                        </div>
                      </div>
                    </q-card-section>
                  </q-card>

                  <!-- Policy Preview Card -->
                  <q-card flat bordered class="preview-card">
                    <q-card-section>
                      <div class="preview-header">
                        <q-icon name="preview" class="q-mr-sm" />
                        <span class="text-subtitle2">Policy Preview (first 500 chars)</span>
                      </div>
                      <pre class="policy-preview">{{ existingPolicyPreview }}</pre>
                    </q-card-section>
                  </q-card>

                  <!-- Validation Warnings -->
                  <q-card
                    v-if="policyUpload.validationResult.warnings && policyUpload.validationResult.warnings.length > 0"
                    flat
                    bordered
                    class="warnings-card q-mt-md"
                  >
                    <q-card-section>
                      <div class="preview-header">
                        <q-icon name="warning" class="q-mr-sm text-warning" />
                        <span class="text-subtitle2">Validation Warnings</span>
                      </div>
                      <q-list dense class="q-mt-sm">
                        <q-item
                          v-for="(warning, index) in policyUpload.validationResult.warnings"
                          :key="`warning-${index}`"
                          class="warning-item"
                        >
                          <q-item-section avatar>
                            <q-icon name="warning" color="warning" size="sm" />
                          </q-item-section>
                          <q-item-section>
                            <q-item-label class="text-caption">{{ warning }}</q-item-label>
                          </q-item-section>
                        </q-item>
                      </q-list>
                    </q-card-section>
                  </q-card>
                </div>
              </transition>
            </div>
          </transition>
        </q-card-section>
      </q-card>

      <!-- Getting Started Tips -->
      <q-card class="tips-card wizard-card">
        <q-card-section class="card-header">
          <div class="card-title">
            <q-icon name="lightbulb" class="q-mr-sm" />
            Getting Started Tips
          </div>
        </q-card-section>

        <q-card-section class="card-content">
          <q-list>
            <q-item class="tip-item">
              <q-item-section avatar>
                <q-avatar color="primary" text-color="white" size="32px">
                  <q-icon name="data_object" />
                </q-avatar>
              </q-item-section>
              <q-item-section>
                <q-item-label class="text-weight-medium">Prepare Sample Data</q-item-label>
                <q-item-label caption>
                  Have representative JSON samples ready for the next step. These will be used to
                  analyze structure and create appropriate parsing rules.
                </q-item-label>
              </q-item-section>
            </q-item>

            <q-item class="tip-item">
              <q-item-section avatar>
                <q-avatar color="secondary" text-color="white" size="32px">
                  <q-icon name="schema" />
                </q-avatar>
              </q-item-section>
              <q-item-section>
                <q-item-label class="text-weight-medium">Understand Your Data</q-item-label>
                <q-item-label caption>
                  Know which fields contain nested JSON, arrays that need fanout processing,
                  and key fields for filtering and mapping.
                </q-item-label>
              </q-item-section>
            </q-item>

            <q-item class="tip-item">
              <q-item-section avatar>
                <q-avatar color="accent" text-color="white" size="32px">
                  <q-icon name="help_outline" />
                </q-avatar>
              </q-item-section>
              <q-item-section>
                <q-item-label class="text-weight-medium">Use the Help System</q-item-label>
                <q-item-label caption>
                  Each step provides contextual help and examples. Click the help button
                  in the top right corner for detailed guidance.
                </q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>
      </q-card>
    </div>

    <!-- Step Actions -->
    <div class="step-actions">
      <q-btn
        unelevated
        color="primary"
        icon-right="arrow_forward"
        label="Start Building Policy"
        :disable="!isStepValid"
        @click="proceedToNext"
        class="wizard-btn wizard-btn--primary"
        size="lg"
      >
        <q-tooltip v-if="!isStepValid" anchor="top middle" self="bottom middle">
          Please complete all required fields to continue
        </q-tooltip>
      </q-btn>
    </div>
  </div>
</template>

<script>
import { mapState, mapMutations, mapActions } from 'vuex'
import { Step1Validator } from '../../../../tooling/validationService.cjs.js'

export default {
  name: 'Step1_Introduction',

  data () {
    return {
      existingPolicyFile: null,
      existingPolicyPreview: null,
      fileInputKey: 0, // Used to force re-render of file input to prevent caching
      lastFileContentHash: null, // Hash of the last uploaded file content to detect changes
      errors: {
        name: [],
        description: [],
        existingPolicy: []
      },
      modeOptions: [
        {
          label: 'Create New Policy',
          value: 'create',
          icon: 'add_circle',
          color: 'primary'
        },
        {
          label: 'Update Existing Policy',
          value: 'update',
          icon: 'edit',
          color: 'primary' /* changed from 'secondary' to 'primary' so edit icon renders blue */
        }
      ]
    }
  },

  computed: {
    ...mapState('wizard', ['projectConfig', 'policyUpload']),

    // Computed getter/setter wrappers to avoid direct mutation of Vuex state by v-model
    projectMode: {
      get () {
        return this.projectConfig?.mode || 'create'
      },
      set (val) {
        // Use mutation to update mode safely
        this.UPDATE_PROJECT_CONFIG({ mode: val })
      }
    },

    projectName: {
      get () {
        return this.projectConfig?.name || ''
      },
      set (val) {
        this.UPDATE_PROJECT_CONFIG({ name: val })
      }
    },

    selectedModeInfo () {
      const modeData = {
        create: {
          title: 'Create New Policy',
          description: 'Build a brand new JSON parsing policy from scratch using the guided workflow.',
          icon: 'add_circle',
          color: 'primary',
          features: [
            'Step-by-step guided process',
            'Automatic structure analysis',
            'Smart field detection',
            'Built-in validation',
            'Export ready policy'
          ]
        },
        update: {
          title: 'Update Existing Policy',
          description: 'Import and modify an existing policy configuration with enhanced editing tools.',
          icon: 'edit',
          color: 'primary', /* changed from 'secondary' to 'primary' */
          features: [
            'Import existing configuration',
            'Preserve custom modifications',
            'Backward compatibility'
          ]
        }
      }
      return modeData[this.projectConfig.mode] || modeData.create
    },

    isStepValid () {
      if (this.projectConfig.mode === 'create') {
        return Boolean(this.projectConfig.name?.trim())
      } else if (this.projectConfig.mode === 'update') {
        // For update mode: Check if we have a valid uploaded policy AND a policy name
        // Note: We check uploadedPolicyData instead of existingPolicyFile because
        // File objects cannot be persisted in Vuex
        return Boolean(
          this.policyUpload.validationResult.valid &&
          this.policyUpload.uploadedPolicyData &&
          this.projectConfig.name?.trim()
        )
      }
      return false
    }
  },

  watch: {
    // Watch for mode changes to clear file-related state
    'projectConfig.mode' (newMode, oldMode) {
      if (oldMode && newMode !== oldMode) {
        // Clear file-related errors when switching modes
        this.errors.existingPolicy = []

        // Only clear file data when switching FROM update mode
        if (oldMode === 'update') {
          this.existingPolicyFile = null
          this.existingPolicyPreview = null
          this.clearPolicyFile()
          // Increment key to force re-render of file input (clear cache)
          this.fileInputKey++

          // Clear project name when switching to create mode
          // (prevent auto-population from uploaded policy)
          if (newMode === 'create') {
            this.UPDATE_PROJECT_CONFIG({ name: '' })
          }
        }

        // Emit validation status
        this.$emit('step-valid')
      }
    }
  },

  mounted () {
    // Restore file upload state if policy is already uploaded in update mode
    // Do this BEFORE validation to ensure file state is correct
    if (this.projectConfig.mode === 'update' && this.policyUpload.uploadedPolicyData) {
      // Note: We cannot restore the actual File object from Vuex as File objects
      // cannot be serialized. Instead, we just restore the preview and metadata.
      // The q-file component will show as empty, but the policy data is preserved.

      // Restore the preview from the uploaded policy data
      const policy = this.policyUpload.uploadedPolicyData
      this.existingPolicyPreview = JSON.stringify(policy, null, 2).substring(0, 500) + '...'

      // Clear any existing policy errors since we have a valid file
      this.errors.existingPolicy = []
    }

    // Clear name errors if the policy name is already populated (from uploaded file or previous input)
    if (this.projectConfig.name && this.projectConfig.name.trim()) {
      this.errors.name = []
    }

    // Validate on mount only if fields are empty or in create mode
    // In update mode with uploaded policy, skip validation to avoid red highlighting
    if (this.projectConfig.mode === 'create' || !this.policyUpload.uploadedPolicyData) {
      this.validateAllFields()
    }
  },

  methods: {
    ...mapMutations('wizard', [
      'UPDATE_PROJECT_CONFIG',
      'CLEAR_UPLOADED_POLICY',
      'RESET_FIELD_MAPPINGS',
      'UPDATE_SCHEMA_RULES',
      'RESET_FILTER_RULES',
      'RESET_SUBTRANSFORMS',
      'SET_SAMPLE_DATA',
      'SET_PARSED_DATA',
      'UPDATE_DATA_VALIDATION'
    ]),
    ...mapActions('wizard', ['uploadPolicyFile', 'clearPolicyFile']),

    onFieldChange (fieldName) {
      // Clear errors when user starts typing
      this.errors[fieldName] = []

      // Update store
      this.UPDATE_PROJECT_CONFIG({
        [fieldName]: this.projectConfig[fieldName]
      })

      // Emit validation status
      this.$emit('step-valid')
    },

    validateField (fieldName) {
      // Skip validation for policy name in update mode when policy data is uploaded
      if (fieldName === 'name' &&
          this.projectConfig.mode === 'update' &&
          this.policyUpload.uploadedPolicyData) {
        // Clear any existing errors
        this.errors.name = []
        return true
      }

      // Delegate validation to centralized service
      let validationResult

      switch (fieldName) {
        case 'name':
          validationResult = Step1Validator.validateProjectName(this.projectConfig[fieldName])
          break
        case 'description':
          validationResult = Step1Validator.validateProjectDescription(this.projectConfig[fieldName])
          break
        default:
          return true
      }

      // Extract error messages from validation result
      this.errors[fieldName] = validationResult.errors.map(error => error.message)

      return validationResult.isValid
    },

    validateAllFields () {
      let validationResult

      if (this.projectConfig.mode === 'create') {
        // Use centralized validation for create mode
        validationResult = Step1Validator.validateCreateMode(this.projectConfig)

        // Map validation errors to component error state
        this.errors.name = validationResult.getErrorsByField('name').map(e => e.message)
        this.errors.description = validationResult.getErrorsByField('description').map(e => e.message)
      } else if (this.projectConfig.mode === 'update') {
        // Use centralized validation for update mode
        validationResult = Step1Validator.validateUpdateMode(
          this.projectConfig,
          this.projectConfig.existingPolicy
        )

        // Map validation errors to component error state
        this.errors.existingPolicy = validationResult.getErrorsByField('existingPolicy').map(e => e.message)

        // Only validate the policy name if no file has been uploaded yet
        // Once a file is uploaded, skip name validation (policy name comes from uploaded file)
        if (!this.policyUpload.uploadedPolicyData) {
          const nameValidation = Step1Validator.validateProjectName(this.projectConfig.name)
          this.errors.name = nameValidation.errors.map(e => e.message)
        } else {
          // Clear name errors when file is uploaded (name comes from file or user edited it)
          this.errors.name = []
        }

        // Also check if policy data exists (not just the file object)
        if (!this.policyUpload.uploadedPolicyData) {
          this.errors.existingPolicy = ['Please select a policy file']
          return false
        }
      }

      return validationResult ? validationResult.isValid : false
    },

    async onFileUpload (file) {
      this.errors.existingPolicy = []

      if (!file) {
        this.existingPolicyPreview = null
        return
      }

      // Store file metadata for later use
      const fileName = file.name

      try {
        // Force read the actual file content from disk to avoid browser caching
        const fileContent = await this.readFileAsText(file)

        // Calculate hash of the file content
        const currentHash = this.simpleHash(fileContent)

        // Strip JavaScript-style comments from the JSON before parsing
        // This allows policy files to contain // and /* */ comments for documentation
        const fileContentWithoutComments = this.stripCommentsFromJson(fileContent)

        // Parse the JSON to verify we're reading the actual current file
        let parsedContent
        try {
          parsedContent = JSON.parse(fileContentWithoutComments)
        } catch (parseError) {
          throw new Error('Invalid JSON file: ' + parseError.message)
        }

        // Check if this is a different file than the currently uploaded one by comparing content
        const previousPolicyData = this.policyUpload.uploadedPolicyData
        const isDifferentFile = !previousPolicyData ||
                                JSON.stringify(parsedContent) !== JSON.stringify(previousPolicyData)

        // Store the hash for next comparison
        this.lastFileContentHash = currentHash

        // Use the new Vuex action to upload and validate the policy file
        const validationResult = await this.uploadPolicyFile(file)

        // Handle validation errors
        if (!validationResult.valid || validationResult.errors?.length > 0) {
          this.errors.existingPolicy = validationResult.errors || ['Unknown validation error']
          this.existingPolicyPreview = null
          this.$emit('step-invalid', 'Policy file validation failed')

          // Clear file input after error
          this.$nextTick(() => {
            this.existingPolicyFile = null
            this.fileInputKey++
          })

          return
        }

        // Success: Policy is valid and stored in Vuex
        const parsedPolicy = validationResult.policy

        // Create preview using the freshly read content
        this.existingPolicyPreview = JSON.stringify(parsedPolicy, null, 2).substring(0, 500) + '...'

        // Always update policy name from uploaded file (overwrite any previous value)
        if (parsedPolicy.name) {
          this.UPDATE_PROJECT_CONFIG({ name: parsedPolicy.name })
          // Clear name errors since we just updated with a valid name from the file
          this.errors.name = []
        }

        // If this is a different file, clear all downstream state
        if (isDifferentFile) {
          this.clearDownstreamState()
        }

        // Display warnings if any
        if (validationResult.warnings && validationResult.warnings.length > 0) {
          const warningCount = validationResult.warnings?.length || 0
          this.$q?.notify({
            type: 'warning',
            message: 'Policy uploaded with ' + warningCount + ' warning(s). Check console for details.',
            timeout: 3000
          })
        }

        // Display success message with file info to confirm correct file was loaded
        const policyName = parsedPolicy.name || fileName
        this.$q?.notify({
          type: 'positive',
          message: 'Policy "' + policyName + '" uploaded successfully!',
          timeout: 3000
        })

        // Emit validation status
        this.$emit('step-valid')

        // Clear the file input AFTER successful processing to allow re-upload
        this.$nextTick(() => {
          this.existingPolicyFile = null
          this.fileInputKey++
        })
      } catch (error) {
        console.error('File upload failed:', error)

        this.errors.existingPolicy = [error.message || 'An error occurred while processing the file']
        this.existingPolicyPreview = null
        this.$emit('step-invalid', error.message)

        // Clear file input after error
        this.$nextTick(() => {
          this.existingPolicyFile = null
          this.fileInputKey++
        })
      }
    },

    clearDownstreamState () {
      // Clear sample data
      this.SET_SAMPLE_DATA({
        inputMethod: 'manual',
        rawData: '',
        parsedData: null,
        logType: null,
        validationResult: {
          isValid: false,
          errors: [],
          warnings: []
        },
        dataStructure: null,
        dataStats: {
          recordCount: 0,
          fieldCount: 0,
          nestedLevels: 0
        }
      })

      this.SET_PARSED_DATA({
        parsedData: null,
        dataStructure: null,
        dataStats: {
          recordCount: 0,
          fieldCount: 0,
          nestedLevels: 0
        }
      })

      this.UPDATE_DATA_VALIDATION({
        isValid: false,
        errors: [],
        warnings: []
      })

      // Clear schema rules
      this.UPDATE_SCHEMA_RULES({
        convertToJson: [],
        fanout: [],
        childfanouts: [],
        detectedStringifiedJson: [],
        manualSelections: [],
        parsedStringifiedJsonFields: {}
      })

      // Clear field mappings
      this.RESET_FIELD_MAPPINGS()

      // Clear filter rules
      this.RESET_FILTER_RULES()

      // Clear subtransforms
      this.RESET_SUBTRANSFORMS()
    },

    // Simple hash function for string comparison
    simpleHash (str) {
      let hash = 0
      if (str.length === 0) return hash
      for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i)
        hash = ((hash << 5) - hash) + char
        hash = hash & hash // Convert to 32bit integer
      }
      return hash.toString(16)
    },

    // Strip JavaScript-style comments from JSON text while preserving strings
    // Supports both single-line and multi-line comments
    // Comments inside quoted strings are preserved
    stripCommentsFromJson (text) {
      if (!text || typeof text !== 'string') return text

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
          // Start escape sequence inside string
          escape = true
          out += ch
          continue
        }

        if (ch === '"') {
          inString = !inString
          out += ch
          continue
        }

        if (!inString) {
          // Detect single-line comment
          if (ch === '/' && text[i + 1] === '/') {
            // Skip until end of line
            i += 2
            while (i < text.length && text[i] !== '\n') i++
            continue
          }

          // Detect multi-line comment
          if (ch === '/' && text[i + 1] === '*') {
            i += 2
            while (i < text.length && !(text[i] === '*' && text[i + 1] === '/')) i++
            i += 1 // Will be incremented by loop
            continue
          }
        }

        out += ch
      }

      return out
    },

    readFileAsText (file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader()

        reader.onload = (event) => {
          resolve(event.target.result)
        }

        reader.onerror = (error) => {
          // Properly handle the error instead of ignoring
          if (error) {
            reject(new Error('Failed to read file: ' + error.message))
          } else {
            reject(new Error('Failed to read file'))
          }
        }

        reader.readAsText(file)
      })
    },

    async proceedToNext () {
      // Final validation using centralized service
      if (!this.validateAllFields()) {
        this.$emit('step-invalid', 'Please fix validation errors before continuing')
        return
      }

      if (!this.isStepValid) {
        this.$emit('step-invalid', 'Please complete all required fields')
        return
      }

      // Only clear state when in CREATE mode
      // In UPDATE mode, preserve all changes made in subsequent steps
      if (this.projectConfig.mode === 'create') {
        // Clear uploaded policy data (in case user switched from update to create)
        this.CLEAR_UPLOADED_POLICY()

        // Clear all downstream state
        this.clearDownstreamState()
      }

      // Mark step as valid and proceed
      this.$emit('step-valid')
      this.$emit('next-step')
    },

    clearUploadedPolicy () {
      this.clearPolicyFile()
      this.existingPolicyFile = null
      this.existingPolicyPreview = null
      this.errors.existingPolicy = []
      this.lastFileContentHash = null // Clear the hash

      // Increment key to force re-render of file input (clear cache)
      this.fileInputKey++

      // Also clear the actual file input element value to prevent caching
      this.$nextTick(() => {
        const fileInput = this.$el.querySelector('input[type="file"]')
        if (fileInput) {
          fileInput.value = ''
        }
      })

      this.$emit('step-invalid')

      this.$q?.notify({
        type: 'info',
        message: 'Policy cleared. You can upload a new policy file.',
        timeout: 2000
      })
    },

    getComplexityColor (complexity) {
      switch (complexity) {
        case 'simple':
          return 'green'
        case 'moderate':
          return 'orange'
        case 'complex':
          return 'red'
        default:
          return 'grey'
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.step-introduction {
  max-width: 900px;
  margin: 0 auto;
}

.step-header {
  display: flex;
  align-items: flex-start;
  margin-bottom: 2rem;
  padding-bottom: 2rem;
  border-bottom: 1px solid var(--q-color-grey-3);

  .dark-theme & {
    border-color: var(--q-color-grey-8);
  }
}

.step-icon {
  margin-right: 1.5rem;
  padding: 1rem;
  background: rgba(25, 118, 210, 0.1);
  border-radius: 12px;
}

.step-title-section {
  flex: 1;
}

.step-title {
  font-size: 2rem;
  font-weight: 600;
  color: var(--q-color-grey-9);
  margin: 0 0 0.5rem 0;

  .dark-theme & {
    color: var(--q-color-grey-2);
  }
}

.step-subtitle {
  font-size: 1.125rem;
  color: #ffffff; /* changed from var(--q-color-grey-7) */
  margin: 0;
  line-height: 1.5;

  .dark-theme & {
    color: var(--q-color-grey-4);
  }
}

.step-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  margin-bottom: 3rem;
}

.wizard-card {
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: all 300ms ease;

  &:hover {
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
    transform: translateY(-2px);
  }

  .dark-theme & {
    background: var(--q-dark);
  }
}

.card-header {
  background: var(--q-color-grey-1);
  border-bottom: 1px solid var(--q-color-grey-3);

  .dark-theme & {
    background: var(--q-color-grey-9);
    border-color: var(--q-color-grey-8);
  }
}

.card-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--q-color-grey-9);
  display: flex;
  align-items: center;
  margin-bottom: 0.5rem;

  .dark-theme & {
    color: var(--q-color-grey-2);
  }
}

.card-description {
  color: var(--q-color-grey-6);
  margin: 0;
  line-height: 1.4;

  .dark-theme & {
    color: var(--q-color-grey-5);
  }
}

.card-content {
  padding: 2rem;
}

.form-grid {
  display: grid;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.wizard-input,
.wizard-textarea {
  .q-field__control {
    border-radius: 8px;
  }

  &.q-field--error .q-field__control {
    animation: shake 0.4s ease-in-out;
  }
}

.wizard-file-input {
  .q-field__control {
    border: 2px dashed var(--q-color-grey-4);
    border-radius: 8px;
    background: var(--q-color-grey-1);

    &:hover {
      border-color: var(--q-primary);
      background: rgba(25, 118, 210, 0.04);
    }
  }

  .dark-theme & {
    .q-field__control {
      background: var(--q-color-grey-9);
      border-color: var(--q-color-grey-7);
    }
  }
}

.mode-selection {
  .q-radio {
    padding: 1rem;
    border-radius: 8px;
    border: 2px solid var(--q-color-grey-3);
    margin-bottom: 0.75rem;
    transition: all 200ms ease;

    &:hover {
      border-color: var(--q-color-grey-4);
      background: var(--q-color-grey-1);
    }

    &.q-radio--checked {
      border-color: var(--q-primary);
      background: rgba(25, 118, 210, 0.04);
    }

    .dark-theme & {
      border-color: var(--q-color-grey-8);

      &:hover {
        background: var(--q-color-grey-9);
      }

      &.q-radio--checked {
        background: rgba(25, 118, 210, 0.1);
      }
    }
  }
}

.mode-description {
  margin-top: 1.5rem;
}

.description-card {
  border-radius: 8px;

  &.mode-create {
    border-left: 4px solid var(--q-primary);
  }

  &.mode-update {
    border-left: 4px solid var(--q-secondary);
  }
}

.mode-info {
  display: flex;
  align-items: flex-start;
}

.update-section {
  margin-top: 1.5rem;
}

.upload-header {
  display: flex;
  align-items: center;
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--q-color-grey-9);
  margin-bottom: 1rem;

  .dark-theme & {
    color: var(--q-color-grey-2);
  }
}

.file-preview {
  .preview-card,
  .metadata-card,
  .warnings-card {
    border-radius: 8px;
    background: var(--q-color-grey-1);

    .dark-theme & {
      background: var(--q-color-grey-9);
    }
  }

  .metadata-card {
    border-left: 4px solid var(--q-info);
  }

  .warnings-card {
    border-left: 4px solid var(--q-warning);
  }
}

.preview-header {
  display: flex;
  align-items: center;
  font-weight: 600;
  margin-bottom: 1rem;
}

.metadata-content {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.metadata-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem;
  background: rgba(0, 0, 0, 0.02);
  border-radius: 4px;

  .dark-theme & {
    background: rgba(255, 255, 255, 0.02);
  }
}

.metadata-label {
  font-weight: 500;
  color: var(--q-color-grey-7);

  .dark-theme & {
    color: var(--q-color-grey-4);
  }
}

.metadata-value {
  font-weight: 600;
  color: var(--q-color-grey-9);

  .dark-theme & {
    color: var(--q-color-grey-2);
  }
}

.warning-item {
  background: rgba(var(--q-warning-rgb), 0.05);
  border-radius: 4px;
  margin-bottom: 0.25rem;
}

.policy-preview {
  font-family: 'Monaco', 'Menlo', monospace;
  font-size: 12px;
  line-height: 1.4;
  color: var(--q-color-grey-8);
  background: white;
  padding: 1rem;
  border-radius: 6px;
  border: 1px solid var(--q-color-grey-3);
  overflow-x: auto;
  max-height: 200px;
  overflow-y: auto;

  .dark-theme & {
    background: var(--q-color-grey-10);
    color: var(--q-color-grey-3);
    border-color: var(--q-color-grey-8);
  }
}

.tips-card {
  background: linear-gradient(135deg, rgba(25, 118, 210, 0.02) 0%, rgba(156, 39, 176, 0.02) 100%);

  .card-header {
    background: transparent;
    border-bottom: 1px solid rgba(25, 118, 210, 0.1);
  }
}

.tip-item {
  padding: 1rem 0;

  &:not(:last-child) {
    border-bottom: 1px solid var(--q-color-grey-3);
  }

  .dark-theme & {
    &:not(:last-child) {
      border-color: var(--q-color-grey-8);
    }
  }
}

.step-actions {
  display: flex;
  justify-content: center;
  padding-top: 2rem;
  border-top: 1px solid var(--q-color-grey-3);

  .dark-theme & {
    border-color: var(--q-color-grey-8);
  }
}

.wizard-btn--primary {
  padding: 1rem 2rem;
  font-size: 1.125rem;
  font-weight: 600;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(25, 118, 210, 0.3);

  &:hover:not(:disabled) {
    box-shadow: 0 6px 20px rgba(25, 118, 210, 0.4);
    transform: translateY(-2px);
  }

  &:active {
    transform: translateY(0);
  }
}

/* Strong override: ensure Quasar outlined pseudo-elements render a visible border for the policy name input */
.policy-name-input ::v-deep .q-field__control {
  position: relative !important;
  border: 2px solid var(--q-primary) !important;
  background-clip: padding-box !important;
  box-shadow: none !important;
}

/* Force visibility and sizing for Quasar's pseudo-elements used by outlined fields */
.policy-name-input ::v-deep .q-field__control::before,
.policy-name-input ::v-deep .q-field__control::after {
  content: "" !important;
  position: absolute !important;
  top: 0 !important;
  right: 0 !important;
  bottom: 0 !important;
  left: 0 !important;
  border-radius: 8px !important;
  border: 2px solid var(--q-primary) !important;
  box-sizing: border-box !important;
  pointer-events: none !important;
  opacity: 1 !important;
  transform: none !important;
}

/* Focused state - stronger outline */
.policy-name-input ::v-deep .q-field--focused .q-field__control::before {
  border-color: var(--q-primary) !important;
  box-shadow: 0 0 0 6px rgba(25, 118, 210, 0.12) !important;
}

/* Error state should override with red */
.policy-name-input ::v-deep .q-field--error .q-field__control,
.policy-name-input ::v-deep .q-field--error .q-field__control::before,
.policy-name-input ::v-deep .q-field--error .q-field__control::after {
  border-color: #ff6b6b !important;
  box-shadow: none !important;
}

/* Prevent the input native background from masking the outline */
.policy-name-input ::v-deep .q-field__native {
  background: transparent !important;
}

/* Focused state - stronger outline */
.policy-name-input .wizard-input.q-field--focused .q-field__control,
.policy-name-input .wizard-input.q-field--focused .q-field__control::before {
  border-color: var(--q-primary);
  box-shadow: 0 0 0 6px rgba(25, 118, 210, 0.12);
}

/* Ensure Quasar internal bottom/hint/error text within the policy name input doesn't override custom styles */
.policy-name-input ::v-deep .q-field__bottom {
  color: #ffffff !important; /* match subtitle text color */
}

.policy-name-input ::v-deep .q-field__hint,
.policy-name-input ::v-deep .q-field__message {
  color: rgba(255, 255, 255, 0.85) !important;
}

/* Preserve error visibility: when field has error, show red error text */
.policy-name-input ::v-deep .q-field--error .q-field__bottom {
  color: #ff6b6b !important; /* soft red for errors */
}

/* Ensure control border/color stays themed */
.policy-name-input ::v-deep .q-field__control {
  border-color: var(--q-primary) !important;
  box-shadow: 0 0 0 4px rgba(25, 118, 210, 0.06) !important;
}

/* Global control border overrides for this page - ensure controls show theme blue border and override defaults */
.step-introduction ::v-deep .q-field__control,
.step-introduction ::v-deep .q-file__control,
.step-introduction ::v-deep .q-select__control,
.step-introduction ::v-deep .q-radio,
.step-introduction ::v-deep .q-btn,
.step-introduction ::v-deep .q-chip {
  border: 1px solid var(--q-primary) !important;
  border-radius: 8px !important;
}

/* Brighter border theme for this page */
.step-introduction {
  --lr-bright-border: #42a5f5; /* brighter blue */
  --lr-bright-border-rgba: 66,165,245; /* RGB for glow */
}

/* Apply brighter border color to all controls and outlined pseudo-elements (high specificity) */
.step-introduction ::v-deep .q-field__control,
.step-introduction ::v-deep .q-field__control::before,
.step-introduction ::v-deep .q-field__control::after,
.step-introduction ::v-deep .q-file__control,
.step-introduction ::v-deep .q-file__control::before,
.step-introduction ::v-deep .q-file__control::after,
.step-introduction ::v-deep .q-select__control,
.step-introduction ::v-deep .q-select__control::before,
.step-introduction ::v-deep .q-select__control::after,
.step-introduction ::v-deep .q-radio,
.step-introduction ::v-deep .q-btn,
.step-introduction ::v-deep .q-chip {
  border-color: var(--lr-bright-border) !important;
  border: 1px solid var(--lr-bright-border) !important;
}

/* Policy name specific stronger border width */
.policy-name-input ::v-deep .q-field__control,
.policy-name-input ::v-deep .q-field__control::before,
.policy-name-input ::v-deep .q-field__control::after {
  border-color: var(--lr-bright-border) !important;
  border: 2px solid var(--lr-bright-border) !important;
}

/* Focus/active glow using the brighter RGB */
.step-introduction ::v-deep .q-field--focused .q-field__control::before,
.step-introduction ::v-deep .q-file--focused .q-file__control::before,
.step-introduction ::v-deep .q-btn:focus,
.step-introduction ::v-deep .q-radio.q-radio--checked {
  border-color: var(--lr-bright-border) !important;
  box-shadow: 0 0 0 6px rgba(var(--lr-bright-border-rgba), 0.12) !important;
  outline: none !important;
}

/* Ensure error still overrides with red */
.step-introduction ::v-deep .q-field--error .q-field__control,
.step-introduction ::v-deep .q-field--error .q-field__control::before,
.step-introduction ::v-deep .q-field--error .q-field__control::after,
.step-introduction ::v-deep .q-file--error .q-file__control {
  border-color: #ff6b6b !important;
  box-shadow: none !important;
}

/* Enforce 1px border for policy name input (override previous 2px rules) */
.policy-name-input ::v-deep .q-field__control,
.policy-name-input ::v-deep .q-field__control::before,
.policy-name-input ::v-deep .q-field__control::after,
.policy-name-input ::v-deep .wizard-input .q-field__control::before {
  border-width: 1px !important;
  border-style: solid !important;
  border-color: var(--lr-bright-border, var(--q-primary)) !important;
  box-shadow: none !important;
}

/* Mode option radios: unselected should show subtle bright-blue border instead of gray/none */
.mode-selection ::v-deep .q-radio {
  border: 1px solid var(--lr-bright-border) !important;
  border-radius: 8px !important;
  background: transparent !important;
  box-shadow: none !important;
  transition: all 150ms ease !important;
}

/* Hover state for clearer affordance */
.mode-selection ::v-deep .q-radio:hover {
  border-color: var(--lr-bright-border) !important;
  background: rgba(var(--lr-bright-border-rgba, 66,165,245), 0.04) !important;
}

/* Checked state keeps stronger background/glow */
.mode-selection ::v-deep .q-radio.q-radio--checked {
  border: 1px solid var(--lr-bright-border) !important;
  background: rgba(var(--lr-bright-border-rgba, 66,165,245), 0.08) !important;
  box-shadow: 0 0 0 4px rgba(var(--lr-bright-border-rgba, 66,165,245), 0.06) inset !important;
}

/* Ensure option wrappers rendered by q-option-group using aria-checked also get the blue border */
.mode-selection ::v-deep [aria-checked="true"],
.mode-selection ::v-deep [role="option"][aria-checked="true"] {
  border: 1px solid var(--lr-bright-border) !important;
  border-radius: 8px !important;
}

/* Fix: force radio inner color and svg fill for both q-radio--checked and aria-checked wrappers
   This ensures the radio dot fills with the bright blue in all rendering modes (q-radio or q-option). */
.step-introduction ::v-deep .mode-selection .q-radio.q-radio--checked .q-radio__inner,
.step-introduction ::v-deep .mode-selection [aria-checked="true"] .q-radio__inner,
.step-introduction ::v-deep .mode-selection [role="option"][aria-checked="true"] .q-radio__inner {
  color: var(--lr-bright-border) !important;
}

/* Explicitly set SVG path/circle fill where currentColor may not propagate */
.step-introduction ::v-deep .mode-selection .q-radio.q-radio--checked .q-radio__bg path,
.step-introduction ::v-deep .mode-selection [aria-checked="true"] .q-radio__bg path,
.step-introduction ::v-deep .mode-selection [role="option"][aria-checked="true"] .q-radio__bg path,
.step-introduction ::v-deep .mode-selection .q-radio.q-radio--checked .q-radio__bg circle,
.step-introduction ::v-deep .mode-selection [aria-checked="true"] .q-radio__bg circle {
  fill: var(--lr-bright-border) !important;
  color: var(--lr-bright-border) !important;
}

/* Also ensure .q-radio__inner--truthy uses our bright color when inside mode-selection */
.step-introduction ::v-deep .mode-selection .q-radio__inner--truthy {
  color: var(--lr-bright-border) !important;
}

/* Final override: remove visual border from the whole option tile containers for mode-selection
   Keep the small internal radio dot and the policy-name input borders intact. */
.mode-selection ::v-deep .q-item,
.mode-selection ::v-deep .q-option,
.mode-selection ::v-deep [role="option"],
.mode-selection ::v-deep .q-item__section,
.mode-selection ::v-deep .q-item__label {
  border: none !important;
  background: transparent !important;
  box-shadow: none !important;
}

/* Also remove border on the q-radio wrapper when it's inside an option tile (so tiles look borderless) */
.mode-selection ::v-deep .q-radio {
  border: none !important;
  background: transparent !important;
  box-shadow: none !important;
}

/* Preserve policy name input border explicitly to avoid accidental removal */
.policy-name-input ::v-deep .q-field__control,
.policy-name-input ::v-deep .q-field__control::before,
.policy-name-input ::v-deep .q-field__control::after {
  border: 1px solid var(--lr-bright-border, var(--q-primary)) !important;
}

/* Ensure the update-mode file input hint/error text is white for readability */
.update-section ::v-deep .wizard-file-input ::v-deep .q-field__hint,
.update-section ::v-deep .wizard-file-input ::v-deep .q-field__message,
.update-section ::v-deep .wizard-file-input ::v-deep .q-field__bottom {
  color: #ffffff !important;
}

/* Ensure all q-field bottom (hint / message / error) text is white within this step */
.step-introduction ::v-deep .q-field__bottom {
  color: #ffffff !important;
}

/* Animations */
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-4px); }
  75% { transform: translateX(4px); }
}

.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 400ms ease;
}

.slide-fade-enter {
  opacity: 0;
  transform: translateY(-20px);
}

.slide-fade-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 300ms ease;
}

.fade-enter,
.fade-leave-to {
  opacity: 0;
}

/* Responsive design */
@media (max-width: 768px) {
  .step-header {
    flex-direction: column;
    text-align: center;

    .step-icon {
      align-self: center;
      margin-right: 0;
      margin-bottom: 1rem;
    }
  }

  .step-title {
    font-size: 1.5rem;
  }

  .step-subtitle {
    font-size: 1rem;
  }

  .card-content {
    padding: 1.5rem;
  }

  .mode-selection .q-radio {
    padding: 0.75rem;
  }
}

/* Make the inner of unselected radios use a neutral gray for better contrast */
.step-introduction ::v-deep .mode-selection .q-radio:not(.q-radio--checked) .q-radio__inner,
.step-introduction ::v-deep .mode-selection [role="option"][aria-checked="false"] .q-radio__inner,
.step-introduction ::v-deep .mode-selection [aria-checked="false"] .q-radio__inner {
  color: #9e9e9e !important; /* neutral gray */
  fill: #9e9e9e !important;
}
</style>
