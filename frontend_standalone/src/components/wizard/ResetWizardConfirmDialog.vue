<template>
  <q-dialog
    ref="resetDialog"
    v-model="showDialog"
    persistent
    @hide="onDialogHide"
    no-backdrop-dismiss
    aria-labelledby="reset-wizard-title"
    aria-describedby="reset-wizard-description"
  >
    <q-card class="wizard-dialog reset-wizard-dialog">
      <q-card-section class="dialog-header">
        <div id="reset-wizard-title" class="text-h6">Reset Wizard</div>
      </q-card-section>

      <q-card-section>
        <p id="reset-wizard-description">Are you sure you want to reset the wizard?</p>
        <p class="text-caption text-grey-6">
          <q-icon name="warning" color="warning" size="16px" class="q-mr-xs" aria-hidden="true" />
          This will clear all your selections across all steps and restart the wizard.
          This action cannot be undone.
        </p>
      </q-card-section>

      <q-card-actions align="right" class="dialog-actions">
        <q-btn
          flat
          label="Cancel"
          color="grey-7"
          @click="cancel"
          class="wizard-btn wizard-btn--ghost"
          data-cy="reset-wizard-cancel"
          ref="cancelButton"
        />
        <q-btn
          unelevated
          label="Reset Wizard"
          color="negative"
          @click="confirmReset"
          class="wizard-btn wizard-btn--warning"
          data-cy="reset-wizard-confirm"
          ref="resetButton"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>
/**
 * Reset Wizard Confirmation Dialog Component
 *
 * This component displays a modal confirmation dialog when the user attempts to reset the wizard.
 * It provides clear messaging about the consequences of resetting and requires explicit
 * confirmation before proceeding with the reset action.
 *
 * Features:
 * - Accessible with proper ARIA attributes and keyboard navigation
 * - Focus management for keyboard users
 * - Clear warning about the irreversible nature of the action
 * - Confirmation and cancellation options
 */
export default {
  name: 'ResetWizardConfirmDialog',

  props: {
    value: {
      type: Boolean,
      default: false
    }
  },

  data () {
    return {
      showDialog: this.value
    }
  },

  watch: {
    value (val) {
      this.showDialog = val
    }
  },

  methods: {
    /**
     * Shows the reset confirmation dialog and manages focus
     * Sets focus on the cancel button by default as a safety measure
     */
    show () {
      this.showDialog = true
      // Use nextTick to ensure DOM is updated before focusing
      this.$nextTick(() => {
        // Focus on cancel button by default (safer option)
        if (this.$refs.cancelButton) {
          this.$refs.cancelButton.$el.focus()
        }
      })
    },

    /**
     * Hides the reset confirmation dialog
     */
    hide () {
      this.showDialog = false
    },

    /**
     * Handles dialog hide event and updates v-model binding
     */
    onDialogHide () {
      this.$emit('input', false)
    },

    /**
     * Handles cancel button click
     * Hides dialog and emits cancel event
     */
    cancel () {
      this.hide()
      this.$emit('cancel')
    },

    /**
     * Handles confirm button click
     * Emits confirm event to trigger reset and hides the dialog
     */
    confirmReset () {
      this.$emit('confirm')
      this.hide()
    }
  },

  /**
   * Set up keyboard event listeners for dialog
   */
  mounted () {
    // Handle escape key press
    this.$refs.resetDialog.$el.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.cancel()
      }
    })
  }
}
</script>

<style lang="scss" scoped>
.reset-wizard-dialog {
  min-width: 400px;
  border-radius: 12px;

  @media (max-width: 600px) {
    min-width: 90vw;
  }
}

.dialog-header {
  background: var(--q-color-grey-1);
  border-bottom: 1px solid var(--q-color-grey-3);

  .dark-theme & {
    background: var(--q-color-grey-9);
    border-color: var(--q-color-grey-8);
  }

  .text-h6 {
    font-weight: 600;
  }
}

.dialog-actions {
  padding: 1rem;
  border-top: 1px solid var(--q-color-grey-3);

  .dark-theme & {
    border-color: var(--q-color-grey-8);
  }
}

.wizard-btn {
  border-radius: 6px;
  font-weight: 500;
  padding: 8px 16px;
  transition: all 200ms ease;

  &--warning {
    box-shadow: 0 2px 4px rgba(var(--q-negative-rgb), 0.3);

    &:hover:not(:disabled) {
      box-shadow: 0 4px 8px rgba(var(--q-negative-rgb), 0.4);
      transform: translateY(-1px);
    }
  }

  &--ghost {
    &:hover:not(:disabled) {
      background: var(--q-color-grey-2);
    }

    .dark-theme & {
      &:hover:not(:disabled) {
        background: var(--q-color-grey-8);
      }
    }
  }
}
</style>
