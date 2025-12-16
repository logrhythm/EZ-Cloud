<template>
  <div class="wizard-container" :class="{ 'dark-theme': darkMode }">
    <!-- Wizard Header -->
    <div class="wizard-header">
      <div class="header-content">
        <div class="wizard-title">
          <img src="../../logo/night.svg" class="q-mr-md" style="height: 36px; width: auto;" alt="LogRhythm Logo" />
          <div>
            <h1 class="text-h4 q-mb-none">JSON Policy Builder Wizard</h1>
            <p class="text-subtitle2 text-grey-6 q-mb-none">
              Create LogRhythm policies step-by-step
            </p>
          </div>
        </div>

        <div class="header-actions">
          <!-- Help Toggle -->
          <q-btn
            flat
            dense
            round
            icon="help_outline"
            color="grey-7"
            @click="toggleHelp"
            class="q-mr-sm"
          >
            <q-tooltip>Show Help</q-tooltip>
          </q-btn>

          <!-- Exit Wizard -->
          <q-btn
            flat
            dense
            round
            icon="close"
            color="grey-7"
            @click="showExitDialog = true"
          >
            <q-tooltip>Exit Wizard</q-tooltip>
          </q-btn>
        </div>
      </div>

      <!-- Progress Bar -->
      <div class="progress-container">
        <div class="progress-info">
          <span class="text-caption text-grey-6">
            Step {{ currentStep + 1 }} of {{ steps.length }}
          </span>
          <span class="text-caption text-grey-6">
            {{ progressPercentage }}% Complete
          </span>
        </div>
        <q-linear-progress
          :value="progressPercentage / 100"
          size="4px"
          color="primary"
          track-color="grey-3"
          class="wizard-progress-bar"
          animation-speed="300"
        />
      </div>
    </div>

    <!-- Main Content Area -->
    <div class="wizard-main" :class="{ 'help-visible': showHelp }">
      <!-- Navigation Sidebar -->
      <div class="wizard-sidebar" :class="{ 'collapsed': sidebarCollapsed }">
        <WizardNavigation
          :steps="steps"
          :current-step="currentStep"
          :completed-steps="completedSteps"
          @navigate="navigateToStep"
          @toggle-sidebar="sidebarCollapsed = !sidebarCollapsed"
          @reset-wizard="showResetWizardConfirmation"
        />
      </div>

      <!-- Step Content -->
      <div class="wizard-content">
        <div class="step-container">
          <!-- Loading Overlay -->
          <q-inner-loading :showing="isLoading" class="wizard-loading">
            <div class="loading-content">
              <q-spinner-dots size="50px" color="primary" />
              <p class="text-body2 q-mt-md text-center">{{ loadingMessage }}</p>
            </div>
          </q-inner-loading>

          <!-- Step Content with Transition -->
          <transition
            name="wizard-step"
            mode="out-in"
            @before-enter="onStepEnter"
            @after-leave="onStepLeave"
          >
            <component
              :is="currentStepComponent"
              :key="currentStep"
              class="step-content"
              @step-valid="onStepValid"
              @step-invalid="onStepInvalid"
              @next-step="nextStep"
              @prev-step="previousStep"
            />
          </transition>
        </div>

        <!-- Auto-save indicator (floating) -->
        <transition name="fade">
          <q-chip
            v-if="lastSaved && showSaveIndicator"
            icon="check_circle"
            color="positive"
            text-color="white"
            dense
            class="save-indicator floating-save-indicator"
          >
            Saved {{ formatTimeAgo(lastSaved) }}
          </q-chip>
        </transition>
      </div>

      <!-- Help Panel -->
      <div class="wizard-help" :class="{ 'visible': showHelp }">
        <div class="help-header">
          <h6 class="q-mb-none">Help & Tips</h6>
          <q-btn
            flat
            dense
            round
            icon="close"
            @click="showHelp = false"
            size="sm"
          />
        </div>
        <div class="help-content">
          <WizardHelp :current-step="getCurrentStep.id" />
        </div>
      </div>
    </div>

    <!-- Exit Confirmation Dialog -->
    <q-dialog v-model="showExitDialog">
      <q-card class="wizard-dialog">
        <q-card-section class="dialog-header">
          <div class="text-h6">Exit Wizard</div>
        </q-card-section>

        <q-card-section>
          <p>Are you sure you want to exit the wizard?</p>
          <p class="text-caption text-grey-6">
            Your progress will be saved automatically and you can resume later.
          </p>
        </q-card-section>

        <q-card-actions align="right" class="dialog-actions">
          <q-btn
            flat
            label="Cancel"
            @click="showExitDialog = false"
            class="wizard-btn wizard-btn--ghost"
          />
          <q-btn
            unelevated
            label="Exit"
            color="primary"
            @click="exitWizard"
            class="wizard-btn wizard-btn--primary"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Reset Wizard Confirmation Dialog -->
    <ResetWizardConfirmDialog
      v-model="showResetDialog"
      @confirm="resetWizard"
    />

    <!-- Error Messages -->
    <div class="error-messages">
      <transition-group name="error-message" tag="div">
        <q-banner
          v-for="error in globalErrors"
          :key="error.id"
          dense
          inline-actions
          color="negative"
          text-color="white"
          icon="error"
          class="error-banner q-mb-sm"
        >
          {{ error.message }}
          <template v-slot:action>
            <q-btn
              flat
              dense
              icon="close"
              @click="clearError(error.id)"
              class="text-white"
            />
          </template>
        </q-banner>
      </transition-group>
    </div>
  </div>
</template>

<script>
import { mapState, mapGetters, mapActions } from 'vuex'
import { themeService } from '../../boot/theme-service'
import WizardNavigation from './WizardNavigation.vue'
import WizardHelp from './WizardHelp.vue'
import ResetWizardConfirmDialog from './ResetWizardConfirmDialog.vue'
import debounce from 'lodash/debounce'

// Step Components (lazy loaded)
const Step1Introduction = () => import('./steps/Step1_Introduction.vue')
const Step2DataUpload = () => import('./steps/Step2_DataUpload.vue')
const Step3SchemaConfig = () => import('./steps/Step3_SchemaConfig.vue')
const Step4FilterConfig = () => import('./steps/Step4_FilterConfig.vue')
const Step5Mapping = () => import('./steps/Step5_Mapping.vue')
const Step6SubTransformConfig = () => import('./steps/Step6_SubTransformConfig.vue')
const Step7Export = () => import('./steps/Step7_Export.vue')

export default {
  name: 'WizardContainer',

  components: {
    WizardNavigation,
    WizardHelp,
    ResetWizardConfirmDialog
  },

  data () {
    return {
      showExitDialog: false,
      showResetDialog: false,
      showSaveIndicator: false,
      sidebarCollapsed: false,
      autoSaveTimer: null,
      stepTransitioning: false,
      themeChangeListener: null,
      // ensure debouncedSave always exists to avoid "not a function" errors
      debouncedSave: null
    }
  },

  computed: {
    ...mapState('wizard', [
      'steps',
      'currentStep',
      'completedSteps',
      'ui',
      'errors'
    ]),

    ...mapGetters('wizard', [
      'getCurrentStep',
      'getProgressPercentage',
      'isStepValid',
      'canNavigateToStep',
      'isReadyForExport',
      'hasGlobalErrors'
    ]),

    // UI computed properties
    progressPercentage () {
      return this.getProgressPercentage
    },

    isLoading () {
      return this.ui.isLoading
    },

    loadingMessage () {
      return this.ui.loadingMessage || 'Processing...'
    },

    showHelp () {
      return this.ui.showHelp
    },

    // Use theme service for dark mode status to ensure consistency
    darkMode () {
      // Single source of truth - always get from theme service
      return themeService.isDarkMode()
    },

    lastSaved () {
      return this.ui.lastSaved
    },

    globalErrors () {
      return this.errors.global || []
    },

    isCurrentStepValid () {
      return this.isStepValid(this.currentStep)
    },

    currentStepComponent () {
      const stepComponents = {
        0: Step1Introduction,
        1: Step2DataUpload,
        2: Step3SchemaConfig,
        3: Step4FilterConfig,
        4: Step5Mapping,
        5: Step6SubTransformConfig,
        6: Step7Export
      }
      return stepComponents[this.currentStep] || Step1Introduction
    }
  },

  watch: {
    // Watch for changes to save state
    '$store.state.wizard': {
      handler () {
        if (this.ui.autoSave && typeof this.debouncedSave === 'function') {
          this.debouncedSave()
        }
      },
      deep: true
    },

    // Show save indicator when saved
    lastSaved (newValue, oldValue) {
      if (newValue && newValue !== oldValue) {
        this.showSaveIndicator = true
        setTimeout(() => {
          this.showSaveIndicator = false
        }, 3000)
      }
    }
  },

  async created () {
    // Initialize wizard state
    await this.initializeWizard()

    // Setup auto-save
    this.setupAutoSave()
  },

  mounted () {
    // No theme change listeners needed - always dark mode
  },

  beforeDestroy () {
    // Cleanup
    if (this.autoSaveTimer) {
      clearTimeout(this.autoSaveTimer)
    }
    // Cancel debounced save if present
    if (this.debouncedSave && typeof this.debouncedSave.cancel === 'function') {
      this.debouncedSave.cancel()
    }
  },

  methods: {
    ...mapActions('wizard', [
      'navigateToStep',
      'nextStep',
      'previousStep',
      'validateCurrentStep',
      'saveState',
      'loadState',
      'clearState',
      'generatePolicy',
      'resetWizard'
    ]),

    async initializeWizard () {
      try {
        // Try to load saved state first
        const loaded = await this.loadState()

        if (!loaded) {
          // Initialize new wizard session
          this.$store.commit('wizard/UPDATE_PROJECT_CONFIG', {
            createdAt: new Date().toISOString(),
            createdBy: 'user' // This could come from auth
          })
        }

        // Set initial step status
        this.$store.commit('wizard/SET_CURRENT_STEP', this.currentStep)
      } catch (error) {
        console.error('Failed to initialize wizard:', error)
        this.$store.commit('wizard/ADD_GLOBAL_ERROR', {
          message: 'Failed to initialize wizard. Starting fresh.',
          type: 'warning'
        })
      }
    },

    setupAutoSave () {
      // Use lodash debounce directly to avoid relying on injected helpers
      this.debouncedSave = debounce(() => {
        try {
          // call action to save state; ensure we don't mutate store here
          this.saveState()
        } catch (e) {
          // swallow to avoid unhandled errors during rapid updates
          console.error('Auto-save failed:', e)
        }
      }, 2000)
    },

    // Navigation methods
    async onNavigateToStep (stepIndex) {
      if (this.stepTransitioning) return

      try {
        this.stepTransitioning = true
        await this.navigateToStep(stepIndex)
      } finally {
        this.stepTransitioning = false
      }
    },

    // Step event handlers
    onStepValid (stepIndex = this.currentStep) {
      this.$store.commit('wizard/COMPLETE_STEP', stepIndex)
    },

    onStepInvalid (errors, stepIndex = this.currentStep) {
      this.$store.commit('wizard/MARK_STEP_ERROR', {
        stepIndex,
        errors: Array.isArray(errors) ? errors : [errors]
      })
    },

    // Transition handlers
    onStepEnter () {
      this.stepTransitioning = true
    },

    onStepLeave () {
      setTimeout(() => {
        this.stepTransitioning = false
      }, 300)
    },

    // UI methods
    toggleHelp () {
      this.$store.commit('wizard/TOGGLE_HELP')
    },

    async exitWizard () {
      try {
        await this.saveState()
        this.showExitDialog = false

        // Navigate back to main application
        this.$router.push('/')
      } catch (error) {
        console.error('Error exiting wizard:', error)
      }
    },

    async generateFinalPolicy () {
      try {
        await this.generatePolicy()
        // Navigate to final step if not already there
        if (this.currentStep !== this.steps.length - 1) {
          await this.navigateToStep(this.steps.length - 1)
        }
      } catch (error) {
        this.$store.commit('wizard/ADD_GLOBAL_ERROR', {
          message: 'Failed to generate policy. Please check your configuration.',
          type: 'error'
        })
      }
    },

    /**
     * Shows the reset wizard confirmation dialog
     * This displays a modal confirmation dialog asking the user to confirm
     * they want to reset all wizard data
     */
    showResetWizardConfirmation () {
      this.showResetDialog = true
    },

    /**
     * Resets the wizard to its initial state and navigates to the first step
     * This method:
     * 1. Shows a loading state
     * 2. Clears all wizard state data from local storage and Vuex store
     * 3. Re-initializes the wizard with a clean state
     * 4. Navigates back to step 1
     * 5. Notifies the user that the reset was successful
     */
    async resetWizard () {
      try {
        // Show loading state
        this.$store.commit('wizard/SET_LOADING', {
          isLoading: true,
          message: 'Resetting wizard...'
        })

        // Wait briefly to ensure loading state is shown
        await new Promise(resolve => setTimeout(resolve, 300))

        // Call the store action to clear the wizard state
        await this.$store.dispatch('wizard/clearState')

        // Re-initialize the wizard with fresh state
        await this.initializeWizard()

        // Navigate to the first step
        await this.navigateToStep(0)

        // Notify user of successful reset
        this.$q.notify({
          type: 'positive',
          message: 'Wizard has been reset successfully',
          timeout: 3000
        })
      } catch (error) {
        console.error('Error resetting wizard:', error)
        this.$store.commit('wizard/ADD_GLOBAL_ERROR', {
          message: 'Failed to reset wizard. Please try again.',
          type: 'error'
        })
      } finally {
        // Hide loading state
        this.$store.commit('wizard/SET_LOADING', { isLoading: false })
      }
    },

    // Error handling
    clearError (errorId) {
      const errors = this.globalErrors.filter(error => error.id !== errorId)
      this.$store.commit('wizard/CLEAR_GLOBAL_ERRORS')
      errors.forEach(error => {
        this.$store.commit('wizard/ADD_GLOBAL_ERROR', error)
      })
    },

    // Utility methods
    formatTimeAgo (timestamp) {
      const now = new Date()
      const time = new Date(timestamp)
      const diffMs = now - time
      const diffMins = Math.floor(diffMs / 60000)

      if (diffMins === 0) return 'just now'
      if (diffMins === 1) return '1 minute ago'
      if (diffMins < 60) return `${diffMins} minutes ago`

      const diffHours = Math.floor(diffMins / 60)
      if (diffHours === 1) return '1 hour ago'
      if (diffHours < 24) return `${diffHours} hours ago`

      return time.toLocaleDateString()
    }
  }
}
</script>

<style lang="scss" scoped>
.wizard-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--q-color-grey-1);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  transition: background 0.3s ease;

  &.dark-theme {
    background: #1a1a1a !important;
    color: var(--text-color-dark) !important;
  }
}

// Force dark mode styles for Wizard in dark mode
:root.Night .wizard-container {
  background: #1a1a1a !important;
  color: var(--text-color-dark) !important;
}

.wizard-header {
  background: white;
  border-bottom: 1px solid var(--q-color-grey-3);
  padding: 1rem 1.5rem 0;
  position: sticky;
  top: 0;
  z-index: 100;

  .dark-theme & {
    background: #232323;
    border-color: var(--q-color-grey-8);
  }
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.wizard-title {
  display: flex;
  align-items: center;

  h1 {
    color: var(--q-color-grey-9);
    font-weight: 600;

    .dark-theme & {
      color: var(--q-dark-page);
    }
  }
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.progress-container {
  margin-bottom: 1rem;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.wizard-progress-bar {
  border-radius: 2px;
}

.wizard-main {
  flex: 1;
  display: flex;
  transition: all 300ms ease;

  &.help-visible {
    .wizard-content {
      margin-right: 320px;
    }
  }
}

.wizard-sidebar {
  width: 280px;
  background: white;
  border-right: 1px solid var(--q-color-grey-3);
  transition: all 300ms ease;

  &.collapsed {
    width: 64px;
  }

  .dark-theme & {
    background: #1a1a1a;
    border-color: var(--q-color-grey-8);
  }
}

.wizard-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0; // Prevent flex overflow
  transition: margin 300ms ease;
}

.step-container {
  flex: 1;
  position: relative;
  display: flex;
  flex-direction: column;
}

.step-content {
  flex: 1;
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

// Wizard controls removed as requested by the user

.wizard-help {
  position: fixed;
  top: 0;
  right: -320px;
  width: 320px;
  height: 100vh;
  background: white;
  border-left: 1px solid var(--q-color-grey-3);
  transition: right 300ms ease;
  z-index: 200;

  &.visible {
    right: 0;
  }

  .dark-theme & {
    background: var(--q-dark);
    border-color: var(--q-color-grey-8);
  }
}

.help-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid var(--q-color-grey-3);

  .dark-theme & {
    border-color: var(--q-color-grey-8);
  }
}

.help-content {
  padding: 1rem;
  height: calc(100vh - 60px);
  overflow-y: auto;
}

.wizard-loading {
  background: rgba(255, 255, 255, 0.9);

  .dark-theme & {
    background: rgba(0, 0, 0, 0.8);
  }
}

.loading-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.error-messages {
  position: fixed;
  top: 80px;
  right: 1rem;
  z-index: 300;
  max-width: 400px;
}

.save-indicator {
  opacity: 0.8;
}

.floating-save-indicator {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 900;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

// Wizard-specific button styles
.wizard-btn {
  border-radius: 6px;
  font-weight: 500;
  padding: 8px 16px;
  transition: all 200ms ease;

  &--primary {
    box-shadow: 0 2px 4px rgba(25, 118, 210, 0.3);

    &:hover:not(:disabled) {
      box-shadow: 0 4px 8px rgba(25, 118, 210, 0.4);
      transform: translateY(-1px);
    }
  }

  &--secondary {
    &:hover:not(:disabled) {
      background: rgba(25, 118, 210, 0.04);
    }
  }

  &--ghost {
    &:hover:not(:disabled) {
      background: var(--q-color-grey-2);
    }
  }
}

// Transition animations
.wizard-step-enter-active,
.wizard-step-leave-active {
  transition: all 400ms cubic-bezier(0.4, 0.0, 0.2, 1);
}

.wizard-step-enter {
  opacity: 0;
  transform: translateX(30px);
}

.wizard-step-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}

.error-message-enter-active,
.error-message-leave-active {
  transition: all 300ms ease;
}

.error-message-enter {
  opacity: 0;
  transform: translateX(100%);
}

.error-message-leave-to {
  opacity: 0;
  transform: translateX(100%);
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
@media (max-width: 1024px) {
  .wizard-main.help-visible .wizard-content {
    margin-right: 0;
  }

  .wizard-help {
    width: 100%;
    right: -100%;
  }
}

@media (max-width: 768px) {
  .wizard-sidebar {
    position: absolute;
    left: -280px;
    height: 100%;
    z-index: 150;

    &.collapsed {
      left: -64px;
    }
  }

  .step-content {
    padding: 1rem;
  }

  .header-content {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }

  .wizard-title h1 {
    font-size: 1.5rem;
  }
}
</style>
