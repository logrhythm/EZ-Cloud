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
            v-model="projectConfig.mode"
            :options="modeOptions"
            color="primary"
            @input="onModeChange"
            class="mode-selection"
          />

          <!-- Policy Name Input (shown when creating a new policy) -->
          <div v-if="projectConfig.mode === 'create'" class="policy-name-input q-mt-md">
            <q-input
              v-model="projectConfig.name"
              label="Policy Name *"
              hint="Enter a name for your new policy"
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
                <q-icon name="label" />
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
                    :class="`text-${selectedModeInfo.color}`"
                    class="q-mr-sm"
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
                v-model="existingPolicyFile"
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
                  <q-icon name="attach_file" />
                </template>
              </q-file>

              <!-- File Preview -->
              <transition name="fade">
                <div v-if="existingPolicyPreview" class="file-preview q-mt-md">
                  <q-card flat bordered class="preview-card">
                    <q-card-section>
                      <div class="preview-header">
                        <q-icon name="preview" class="q-mr-sm" />
                        <span class="text-subtitle2">Policy Preview</span>
                      </div>
                      <pre class="policy-preview">{{ existingPolicyPreview }}</pre>
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
import { mapState, mapMutations } from 'vuex'

export default {
  name: 'Step1_Introduction',

  data () {
    return {
      existingPolicyFile: null,
      existingPolicyPreview: null,
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
          color: 'secondary'
        }
      ]
    }
  },

  computed: {
    ...mapState('wizard', ['projectConfig']),

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
          color: 'secondary',
          features: [
            'Import existing configuration',
            'Visual diff comparison',
            'Preserve custom modifications',
            'Version history tracking',
            'Backward compatibility'
          ]
        }
      }
      return modeData[this.projectConfig.mode] || modeData.create
    },

    isStepValid () {
      return Boolean(
        (this.projectConfig.mode === 'create' && this.projectConfig.name?.trim()) ||
        (this.projectConfig.mode === 'update' && this.existingPolicyFile)
      )
    }
  },

  mounted () {
    // Validate on mount if fields have values
    this.validateAllFields()

    // Set focus to first input
    this.$nextTick(() => {
      const firstInput = this.$el.querySelector('input[type="text"]')
      if (firstInput) firstInput.focus()
    })
  },

  methods: {
    ...mapMutations('wizard', ['UPDATE_PROJECT_CONFIG']),

    onFieldChange (fieldName) {
      // Clear errors when user starts typing
      this.errors[fieldName] = []

      // Update store
      this.UPDATE_PROJECT_CONFIG({
        [fieldName]: this.projectConfig[fieldName]
      })

      // Emit validation status
      this.$emit('step-valid', this.isStepValid)
    },

    validateField (fieldName) {
      const value = this.projectConfig[fieldName]?.trim()
      const errors = []

      switch (fieldName) {
        case 'name':
          if (!value) {
            errors.push('Policy name is required')
          } else if (value.length < 3) {
            errors.push('Policy name must be at least 3 characters')
          } else if (!/^[a-zA-Z0-9\s\-_]+$/.test(value)) {
            errors.push('Policy name can only contain letters, numbers, spaces, hyphens, and underscores')
          }
          break
      }

      this.errors[fieldName] = errors
      return errors.length === 0
    },

    validateAllFields () {
      let isValid = true

      if (this.projectConfig.mode === 'create') {
        if (!this.validateField('name')) {
          isValid = false
        }
      } else if (this.projectConfig.mode === 'update') {
        if (this.existingPolicyFile === null) {
          this.errors.existingPolicy = ['Please select a policy file']
          isValid = false
        }
      }

      return isValid
    },

    onModeChange () {
      // Clear file-related errors when switching modes
      this.errors.existingPolicy = []
      this.existingPolicyFile = null
      this.existingPolicyPreview = null

      // Update store
      this.UPDATE_PROJECT_CONFIG({
        mode: this.projectConfig.mode,
        existingPolicy: null
      })

      // Emit validation status
      this.$emit('step-valid', this.isStepValid)
    },

    async onFileUpload (file) {
      this.errors.existingPolicy = []

      if (!file) {
        this.existingPolicyPreview = null
        return
      }

      try {
        // Validate file type
        if (!file.name.toLowerCase().endsWith('.json')) {
          throw new Error('Please select a JSON file')
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          throw new Error('File size must be less than 5MB')
        }

        // Read and parse file
        const fileContent = await this.readFileAsText(file)

        try {
          const parsedPolicy = JSON.parse(fileContent)

          // Basic policy structure validation
          if (!this.isValidPolicyStructure(parsedPolicy)) {
            throw new Error('Invalid policy structure. Please select a valid LogRhythm policy file.')
          }

          // Store parsed policy
          this.UPDATE_PROJECT_CONFIG({
            existingPolicy: parsedPolicy
          })

          // Create preview
          this.existingPolicyPreview = JSON.stringify(parsedPolicy, null, 2).substring(0, 500) + '...'

          // Auto-populate fields from policy if empty
          if (!this.projectConfig.name && parsedPolicy.name) {
            this.UPDATE_PROJECT_CONFIG({ name: parsedPolicy.name })
          }
        } catch (parseError) {
          throw new Error('Invalid JSON format. Please check the file and try again.')
        }
      } catch (error) {
        this.errors.existingPolicy = [error.message]
        this.existingPolicyFile = null
        this.existingPolicyPreview = null
      }

      // Emit validation status
      this.$emit('step-valid', this.isStepValid)
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

    isValidPolicyStructure (policy) {
      // Basic validation of policy structure
      return (
        typeof policy === 'object' &&
        policy !== null &&
        (policy.transforms || policy.schemarule || policy.filter !== undefined)
      )
    },

    async proceedToNext () {
      // Final validation
      if (!this.validateAllFields()) {
        this.$emit('step-invalid', 'Please fix validation errors before continuing')
        return
      }

      if (!this.isStepValid) {
        this.$emit('step-invalid', 'Please complete all required fields')
        return
      }

      // Mark step as valid and proceed
      this.$emit('step-valid')
      this.$emit('next-step')
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
  color: var(--q-color-grey-7);
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
  .preview-card {
    border-radius: 8px;
    background: var(--q-color-grey-1);

    .dark-theme & {
      background: var(--q-color-grey-9);
    }
  }
}

.preview-header {
  display: flex;
  align-items: center;
  font-weight: 600;
  margin-bottom: 1rem;
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

// Animations
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

// Responsive design
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
</style>
