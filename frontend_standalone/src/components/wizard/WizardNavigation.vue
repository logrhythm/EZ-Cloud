<template>
  <div class="wizard-navigation" :class="{ collapsed }">
    <!-- Sidebar Toggle -->
    <div class="nav-header">
      <q-btn
        flat
        dense
        round
        :icon="collapsed ? 'menu' : 'menu_open'"
        @click="$emit('toggle-sidebar')"
        class="sidebar-toggle"
        size="sm"
        tabindex="0"
        aria-label="Toggle navigation sidebar"
      >
        <q-tooltip v-if="collapsed" anchor="center right" self="center left">
          Expand Navigation
        </q-tooltip>
      </q-btn>

      <transition name="nav-title">
        <div v-if="!collapsed" class="nav-title">
          <span class="text-subtitle2 text-weight-medium">Steps</span>
        </div>
      </transition>

    </div>

    <!-- Steps List -->
    <div class="nav-content">
      <transition-group name="step-item" tag="div" class="steps-list">
        <div
          v-for="(step, index) in steps"
          :key="step.id"
          class="step-item"
          :class="getStepClasses(step, index)"
          @click="handleStepClick(step, index)"
        >
          <!-- Step Indicator -->
          <div class="step-indicator">
            <!-- Step Number / Status Icon -->
            <div class="step-icon-container">
              <q-icon
                v-if="step.status === 'completed'"
                name="check_circle"
                class="step-icon completed"
                size="24px"
              />
              <q-icon
                v-else-if="step.status === 'error'"
                name="error"
                class="step-icon error"
                size="24px"
              />
              <q-icon
                v-else-if="step.status === 'in_progress'"
                name="radio_button_checked"
                class="step-icon active"
                size="24px"
              />
              <div v-else class="step-number">{{ index + 1 }}</div>
            </div>

            <!-- Connection Line -->
            <div
              v-if="index < steps.length - 1"
              class="step-connector"
              :class="{ active: isStepCompleted(index) }"
            />
          </div>

          <!-- Step Content -->
          <transition name="step-content">
            <div v-if="!collapsed" class="step-content">
              <div class="step-title">{{ step.title }}</div>
              <div class="step-description">{{ step.description }}</div>

              <!-- Step Status Badge -->
              <div v-if="step.status !== 'pending'" class="step-status">
                <q-chip
                  dense
                  :color="getStatusColor(step.status)"
                  :text-color="getStatusTextColor(step.status)"
                  :icon="getStatusIcon(step.status)"
                  class="status-chip"
                >
                  {{ getStatusLabel(step.status) }}
                </q-chip>
              </div>

              <!-- Validation Errors -->
              <div v-if="step.validationErrors && step.validationErrors.length" class="step-errors">
                <div
                  v-for="(error, errorIndex) in step.validationErrors.slice(0, 2)"
                  :key="errorIndex"
                  class="error-item"
                >
                  <q-icon name="warning" size="xs" class="text-negative q-mr-xs" />
                  <span class="text-caption">{{ error }}</span>
                </div>
                <div v-if="step.validationErrors.length > 2" class="text-caption text-grey-6">
                  +{{ step.validationErrors.length - 2 }} more errors
                </div>
              </div>
            </div>
          </transition>

          <!-- Tooltip for collapsed state -->
          <q-tooltip
            v-if="collapsed"
            anchor="center right"
            self="center left"
            :delay="500"
          >
            <div class="tooltip-content">
              <div class="text-weight-medium">{{ step.title }}</div>
              <div class="text-caption">{{ step.description }}</div>
              <div v-if="step.status !== 'pending'" class="q-mt-xs">
                Status: {{ getStatusLabel(step.status) }}
              </div>
            </div>
          </q-tooltip>
        </div>
      </transition-group>

      <!-- Progress Summary (collapsed view) -->
      <transition name="progress-summary">
        <div v-if="collapsed" class="progress-summary">
          <q-circular-progress
            :value="progressPercentage"
            size="40px"
            :thickness="0.15"
            color="primary"
            track-color="grey-3"
            class="progress-circle"
          >
            <div class="text-caption text-weight-bold">
              {{ completedSteps.length }}/{{ steps.length }}
            </div>
          </q-circular-progress>
        </div>
      </transition>

      <!-- Quick Actions (expanded view) -->
      <transition name="quick-actions">
        <div v-if="!collapsed" class="quick-actions">
          <q-separator class="q-my-md" />

          <div class="action-buttons">
            <q-btn
              flat
              dense
              icon="refresh"
              label="Reset Wizard"
              @click="$emit('reset-wizard')"
              class="action-btn"
              size="sm"
            />
          </div>
        </div>
      </transition>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'WizardNavigation',

  props: {
    steps: {
      type: Array,
      required: true
    },
    currentStep: {
      type: Number,
      required: true
    },
    completedSteps: {
      type: Array,
      default: () => []
    },
    collapsed: {
      type: Boolean,
      default: false
    }
  },

  computed: {
    ...mapGetters('wizard', [
      'getProgressPercentage',
      'canNavigateToStep'
    ]),

    progressPercentage () {
      return this.getProgressPercentage
    }
  },

  methods: {
    getStepClasses (step, index) {
      return {
        'step-current': index === this.currentStep,
        'step-completed': step.status === 'completed',
        'step-error': step.status === 'error',
        'step-in-progress': step.status === 'in_progress',
        'step-disabled': !this.canNavigateToStep(index),
        'step-clickable': this.canNavigateToStep(index)
      }
    },

    isStepCompleted (index) {
      return this.completedSteps.includes(index) || this.steps[index]?.status === 'completed'
    },

    handleStepClick (step, index) {
      if (this.canNavigateToStep(index) && index !== this.currentStep) {
        this.$emit('navigate', index)
      }
    },

    getStatusColor (status) {
      const colors = {
        completed: 'positive',
        error: 'negative',
        in_progress: 'primary',
        warning: 'warning'
      }
      return colors[status] || 'grey'
    },

    getStatusTextColor (status) {
      return status === 'warning' ? 'black' : 'white'
    },

    getStatusIcon (status) {
      const icons = {
        completed: 'check',
        error: 'error',
        in_progress: 'play_arrow',
        warning: 'warning'
      }
      return icons[status] || 'info'
    },

    getStatusLabel (status) {
      const labels = {
        completed: 'Complete',
        error: 'Has Errors',
        in_progress: 'Active',
        warning: 'Warning',
        pending: 'Pending'
      }
      return labels[status] || 'Unknown'
    }
  }
}
</script>

<style lang="scss" scoped>
.wizard-navigation {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: white;
  transition: all 300ms cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;

  .dark-theme & {
    background: var(--q-dark);
  }

  &.collapsed {
    .nav-content {
      padding: 1rem 0.5rem;
    }

    .step-item {
      padding: 0.75rem 0;
      justify-content: center;

      .step-content {
        display: none;
      }
    }
  }
}

.nav-header {
  display: flex;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid var(--q-color-grey-3);
  min-height: 64px;
  position: relative;

  .dark-theme & {
    border-color: var(--q-color-grey-8);
  }

  .body--dark & {
    border-color: var(--border-dark);
  }

}

.sidebar-toggle {
  color: var(--q-color-grey-7);

  &:hover {
    background: var(--q-color-grey-2);
  }

  &:focus-visible {
    outline: var(--focus-ring-width-desktop) var(--focus-ring-style) var(--primary-light);
    outline-offset: var(--focus-ring-offset);
  }

  .dark-theme &, .body--dark & {
    color: var(--q-color-grey-5);

    &:hover {
      background: var(--q-color-grey-8);
    }

    &:focus-visible {
      outline-color: var(--primary-dark);
    }
  }
}

.nav-title {
  margin-left: 0.75rem;
  color: var(--q-color-grey-8);

  .dark-theme & {
    color: var(--q-color-grey-4);
  }
}

.nav-content {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
}

.steps-list {
  position: relative;
}

.step-item {
  display: flex;
  align-items: flex-start;
  padding: 1rem 0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 200ms ease;
  position: relative;

  &.step-clickable:hover {
    background: rgba(25, 118, 210, 0.04);
    transform: translateX(2px);
  }

  &.step-current {
    background: rgba(25, 118, 210, 0.08);
    border-left: 3px solid var(--q-primary);
    padding-left: calc(1rem - 3px);

    .step-title {
      font-weight: 600;
      color: var(--q-primary);
    }
  }

  &.step-completed {
    .step-title {
      color: var(--q-positive);
    }
  }

  &.step-error {
    background: rgba(244, 67, 54, 0.04);
    border-left: 3px solid var(--q-negative);
    padding-left: calc(1rem - 3px);

    .step-title {
      color: var(--q-negative);
    }
  }

  &.step-disabled {
    opacity: 0.6;
    cursor: not-allowed;

    &:hover {
      background: transparent;
      transform: none;
    }
  }
}

.step-indicator {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-right: 0.75rem;
  position: relative;
}

.step-icon-container {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.08); /* Lighter background for better contrast */
  position: relative;
  z-index: 1;

  .dark-theme & {
    background: rgba(255, 255, 255, 0.12); /* Lighter background in dark mode for better visibility */
  }

  /* Add subtle border for better definition */
  border: 1px solid rgba(0, 0, 0, 0.12);

  .dark-theme & {
    border: 1px solid rgba(255, 255, 255, 0.18);
  }

  /* Highlight current step with colored background */
  .step-current & {
    background: rgba(33, 150, 243, 0.12);
    border-color: var(--q-primary);
  }
}

.step-icon {
  &.completed {
    color: var(--q-positive);
    background: transparent; /* Removed white background to prevent hiding text */
    border-radius: 50%;
  }

  &.error {
    color: var(--q-negative);
    background: transparent; /* Removed white background to prevent hiding text */
    border-radius: 50%;
  }

  &.active {
    color: var(--q-primary);
    background: transparent; /* Removed white background to prevent hiding text */
    border-radius: 50%;
  }
}

.step-number {
  font-size: 14px;
  font-weight: 600;
  color: var(--q-color-grey-8); /* Darker for better contrast */

  .step-current & {
    color: var(--q-primary);
    font-weight: 700; /* Bolder for active step */
  }

  .step-completed & {
    color: var(--q-positive);
  }

  .dark-theme & {
    color: var(--q-color-grey-3); /* Lighter in dark mode */
  }

  .dark-theme .step-current & {
    color: var(--q-primary);
  }
}

.step-connector {
  position: absolute;
  top: 32px;
  left: 50%;
  transform: translateX(-50%);
  width: 2px;
  height: 40px;
  background: var(--q-color-grey-4);
  transition: background 300ms ease;

  &.active {
    background: var(--q-positive);
  }

  .dark-theme & {
    background: var(--q-color-grey-7);

    &.active {
      background: var(--q-positive);
    }
  }
}

.step-content {
  flex: 1;
  min-width: 0;
}

.step-title {
  font-size: 14px;
  font-weight: 500;
  color: var(--q-color-grey-9);
  margin-bottom: 0.25rem;
  line-height: 1.2;

  .dark-theme & {
    color: var(--q-color-grey-2);
  }
}

.step-description {
  font-size: 12px;
  color: var(--q-color-grey-6);
  line-height: 1.3;
  margin-bottom: 0.5rem;

  .dark-theme & {
    color: var(--q-color-grey-5);
  }
}

.step-status {
  margin-bottom: 0.5rem;
}

.status-chip {
  font-size: 10px;
  height: 20px;
}

.step-errors {
  .error-item {
    display: flex;
    align-items: flex-start;
    margin-bottom: 0.25rem;
    font-size: 11px;
    color: var(--q-negative);
  }
}

.progress-summary {
  display: flex;
  justify-content: center;
  padding: 1rem 0;
  border-top: 1px solid var(--q-color-grey-3);

  .dark-theme & {
    border-color: var(--q-color-grey-8);
  }
}

.progress-circle {
  display: flex;
  align-items: center;
  justify-content: center;
}

.quick-actions {
  margin-top: auto;
  padding-top: 1rem;
}

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.action-btn {
  justify-content: flex-start;
  text-align: left;
  color: var(--q-color-grey-7);
  font-size: 12px;
  padding: 0.5rem;
  border-radius: 4px;

  &:hover {
    background: var(--q-color-grey-2);
  }

  .dark-theme & {
    color: var(--q-color-grey-4);

    &:hover {
      background: var(--q-color-grey-8);
    }
  }
}

.tooltip-content {
  max-width: 200px;
}

// Transition animations
.nav-title-enter-active,
.nav-title-leave-active {
  transition: all 250ms ease;
}

.nav-title-enter,
.nav-title-leave-to {
  opacity: 0;
  transform: translateX(-10px);
}

.step-content-enter-active,
.step-content-leave-active {
  transition: all 300ms ease;
}

.step-content-enter,
.step-content-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}

.step-item-enter-active,
.step-item-leave-active {
  transition: all 300ms ease;
}

.step-item-enter,
.step-item-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.progress-summary-enter-active,
.progress-summary-leave-active {
  transition: all 300ms ease;
}

.progress-summary-enter,
.progress-summary-leave-to {
  opacity: 0;
  transform: scale(0.8);
}

.quick-actions-enter-active,
.quick-actions-leave-active {
  transition: all 300ms ease;
}

.quick-actions-enter,
.quick-actions-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

// Responsive adjustments
@media (max-width: 768px) {
  .step-item {
    padding: 0.75rem 0;
  }

  .step-title {
    font-size: 13px;
  }

  .step-description {
    font-size: 11px;
  }

}

/* Mobile optimization */
@media (max-width: 600px) {
  .sidebar-toggle,
  .action-btn {
    min-height: 44px;
    min-width: 44px;
    padding: 12px !important;
  }

  .nav-header {
    padding: 0.75rem 0.5rem;
  }
}
</style>
