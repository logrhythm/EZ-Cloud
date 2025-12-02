<template>
  <div class="step-subtransform-config">
    <div class="step-header">
      <div class="step-icon">
        <q-icon name="account_tree_outline" size="48px" class="text-primary" />
      </div>
      <div class="step-title-section">
        <h2 class="step-title">SubTransform Configuration</h2>
        <p class="step-subtitle">
          Define conditional field mappings that apply based on runtime data conditions.
          SubTransforms are optional but powerful for handling dynamic log structures.
        </p>
      </div>
    </div>

    <!-- Instructions Banner -->
    <div class="instructions-banner">
      <q-icon name="info" size="24px" class="q-mr-sm" />
      <div class="instructions-content">
        <strong>What are SubTransforms?</strong>
        <span class="q-ml-sm">
          SubTransforms apply different field mappings based on conditions. For example,
          "login" events might need different fields than "access" events.
        </span>
      </div>
      <q-space />
      <div class="subtransform-progress">
        <q-chip color="secondary" text-color="white" icon="account_tree">
          {{ subTransformsList.length }} configured
        </q-chip>
      </div>
    </div>

    <div class="step-content">
      <!-- Empty State -->
      <div v-if="subTransformsList.length === 0" class="empty-state-subtransform">
        <q-card flat class="empty-state-card">
          <q-card-section class="text-center">
            <q-icon name="account_tree_outline" size="96px" color="grey-5" />
            <h3 class="empty-state-title q-mt-md q-mb-sm">No SubTransforms Configured</h3>
            <p class="empty-state-description text-body2 text-grey-7">
              SubTransforms apply conditional logic to transform fields based on parsed data.
              Add your first SubTransform to create dynamic field mappings.
            </p>

            <div class="use-cases q-mt-lg">
              <h6 class="text-subtitle2 q-mb-sm">Common Use Cases:</h6>
              <q-list dense class="text-left" style="max-width: 600px; margin: 0 auto;">
                <q-item>
                  <q-item-section avatar>
                    <q-icon name="check_circle" color="primary" />
                  </q-item-section>
                  <q-item-section>
                    Route different event types to different field structures
                  </q-item-section>
                </q-item>
                <q-item>
                  <q-item-section avatar>
                    <q-icon name="check_circle" color="primary" />
                  </q-item-section>
                  <q-item-section>
                    Add extra fields only when severity is high
                  </q-item-section>
                </q-item>
                <q-item>
                  <q-item-section avatar>
                    <q-icon name="check_circle" color="primary" />
                  </q-item-section>
                  <q-item-section>
                    Handle vendor-specific data variations
                  </q-item-section>
                </q-item>
              </q-list>
            </div>

            <div class="q-mt-xl">
              <q-checkbox
                v-model="localSkipSubTransforms"
                label="Skip SubTransforms (use only base transforms from Step 5)"
                @input="updateSkipSubTransforms"
                class="q-mb-lg"
              />
            </div>

            <div class="empty-state-actions">
              <q-btn
                unelevated
                color="blue"
                text-color="black"
                icon="add"
                label="Add First SubTransform"
                @click="addSubTransform"
                no-caps
                size="lg"
              />
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- SubTransform Workspace -->
      <div v-else class="subtransform-workspace">
        <!-- Toolbar -->
        <div class="subtransform-toolbar q-mb-md">
          <div class="toolbar-left">
            <q-btn
              unelevated
              color="blue"
              text-color="black"
              icon="add"
              label="Add SubTransform"
              @click="addSubTransform"
              no-caps
            />
          </div>

          <q-space />

          <div class="toolbar-right">
            <q-btn
              flat
              dense
              icon="unfold_more"
              label="Expand All"
              @click="expandAll"
              no-caps
            />
            <q-btn
              flat
              dense
              icon="unfold_less"
              label="Collapse All"
              @click="collapseAll"
              no-caps
              class="q-ml-sm"
            />
          </div>
        </div>

        <!-- SubTransform List -->
        <div class="subtransform-list">
          <SubTransformCard
            v-for="(subtransform, index) in subTransformsList"
            :key="subtransform.id"
            :subtransform="subtransform"
            :index="index"
            :depth="0"
            :max-depth="3"
            :is-last="index === subTransformsList.length - 1"
            @update="updateSubTransform"
            @delete="deleteSubTransform"
            @reorder="reorderSubTransform"
            @add-nested="addNestedSubTransform"
            @edit-condition="editCondition"
            @edit-transform="editTransform"
            class="q-mb-md"
          />
        </div>
      </div>
    </div>

    <!-- Navigation Buttons -->
    <div class="step-actions">
      <q-btn
        flat
        icon="arrow_back"
        label="Previous"
        :disable="isSaving"
        @click="$emit('prev-step')"
        class="wizard-btn wizard-btn--secondary"
      />

      <q-btn
        unelevated
        color="primary"
        icon-right="arrow_forward"
        label="Continue to Export"
        :loading="isSaving"
        @click="proceedToNext"
        class="wizard-btn wizard-btn--primary"
      />
    </div>

    <!-- Condition Editor Modal -->
    <ConditionEditorModal
      v-model="conditionDialog"
      :condition="currentCondition"
      @save="saveCondition"
    />

    <!-- Transform Editor Modal -->
    <TransformEditorModal
      v-model="transformDialog"
      :transforms="currentTransforms"
      :mode="editingTransformMode"
      :transform-index="editingTransformIndex"
      @save="saveTransform"
    />
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'
// Importing SubTransformCard for recursive display of nested SubTransforms
import SubTransformCard from '../SubTransformCard.vue'
import ConditionEditorModal from '../modals/ConditionEditorModal.vue'
import TransformEditorModal from '../modals/TransformEditorModal.vue'

// Debug: Verify SubTransformCard is imported correctly
console.log('[Step6] SubTransformCard import:', SubTransformCard)
console.log('[Step6] SubTransformCard.name:', SubTransformCard?.name)

export default {
  name: 'Step6SubTransformConfig',

  components: {
    // eslint-disable-next-line vue/no-unused-components
    SubTransformCard,
    ConditionEditorModal,
    TransformEditorModal
  },

  data () {
    return {
      localSkipSubTransforms: false,
      // Modal state
      conditionDialog: false,
      transformDialog: false,
      editingSubTransformId: null,
      editingTransformIndex: null,
      editingTransformMode: null,
      currentCondition: '',
      currentTransforms: [],
      // Navigation state
      isSaving: false
    }
  },

  computed: {
    ...mapState('wizard', {
      subTransformsList: state => state.subTransforms.subTransformsList,
      skipSubTransforms: state => state.subTransforms.skipSubTransforms
    })
  },

  watch: {
    skipSubTransforms: {
      immediate: true,
      handler (value) {
        this.localSkipSubTransforms = value
      }
    }
  },

  mounted () {
    // Listen for expand/collapse all events
    this.$root.$on('subtransform-expand-all', this.handleExpandAll)
    this.$root.$on('subtransform-collapse-all', this.handleCollapseAll)

    // Emit step validation
    this.validateStep()
  },

  beforeDestroy () {
    this.$root.$off('subtransform-expand-all', this.handleExpandAll)
    this.$root.$off('subtransform-collapse-all', this.handleCollapseAll)
  },

  methods: {
    ...mapActions('wizard', [
      'addSubTransformAction',
      'updateSubTransformAction',
      'deleteSubTransformAction',
      'reorderSubTransformAction',
      'setSkipSubTransforms',
      'nextStep',
      'previousStep'
    ]),

    addSubTransform () {
      const newSubTransform = {
        id: this.generateUUID(),
        name: `SubTransform ${this.subTransformsList.length + 1}`,
        condition: '',
        exitOnMatch: false,
        transforms: [],
        subTransforms: []
      }
      this.addSubTransformAction(newSubTransform)
      this.validateStep()
    },

    updateSubTransform (payload) {
      this.updateSubTransformAction(payload)
      this.validateStep()
    },

    deleteSubTransform (id) {
      this.$q.dialog({
        title: 'Delete SubTransform?',
        message: 'This action cannot be undone. All nested SubTransforms will also be deleted.',
        cancel: true,
        persistent: true,
        color: 'negative'
      }).onOk(() => {
        this.deleteSubTransformAction(id)
        this.validateStep()
      })
    },

    reorderSubTransform ({ oldIndex, newIndex }) {
      this.reorderSubTransformAction({ oldIndex, newIndex })
    },

    addNestedSubTransform (parentId) {
      // This will be handled by the card component
      console.log('Add nested to:', parentId)
    },

    updateSkipSubTransforms (value) {
      this.setSkipSubTransforms(value)
      this.validateStep()
    },

    expandAll () {
      this.$root.$emit('subtransform-expand-all')
    },

    collapseAll () {
      this.$root.$emit('subtransform-collapse-all')
    },

    editCondition (subtransformId) {
      console.log('[Step 6] Edit condition for SubTransform:', subtransformId)

      // Find the SubTransform recursively
      const subtransform = this.findSubTransform(subtransformId, this.subTransformsList)

      if (!subtransform) {
        console.error('[Step 6] SubTransform not found:', subtransformId)
        this.$q.notify({
          type: 'negative',
          message: 'SubTransform not found',
          position: 'top'
        })
        return
      }

      // Set current editing state
      this.editingSubTransformId = subtransformId
      this.currentCondition = subtransform.condition || ''

      // Open condition editor modal
      this.conditionDialog = true

      console.log('[Step 6] conditionDialog is now:', this.conditionDialog)
      console.log('[Step 6] currentCondition:', this.currentCondition)
    },

    editTransform (payload) {
      console.log('[Step 6] Edit transform:', payload)

      const { subtransformId, transformIndex, mode } = payload

      // Find the SubTransform recursively
      const subtransform = this.findSubTransform(subtransformId, this.subTransformsList)

      if (!subtransform) {
        console.error('[Step 6] SubTransform not found:', subtransformId)
        this.$q.notify({
          type: 'negative',
          message: 'SubTransform not found',
          position: 'top'
        })
        return
      }

      // Set current editing state
      this.editingSubTransformId = subtransformId
      this.editingTransformIndex = transformIndex
      this.editingTransformMode = mode
      this.currentTransforms = subtransform.transforms || []

      // Open transform editor modal
      this.transformDialog = true

      console.log('[Step 6] transformDialog is now:', this.transformDialog)
      console.log('[Step 6] editingTransformMode:', this.editingTransformMode)
      console.log('[Step 6] currentTransforms:', this.currentTransforms)
    },

    saveCondition (conditionExpression) {
      console.log('[Step 6] Save condition:', conditionExpression)

      if (!this.editingSubTransformId) {
        console.error('[Step 6] No SubTransform ID set for editing')
        return
      }

      // Update the SubTransform with new condition
      this.updateSubTransformAction({
        id: this.editingSubTransformId,
        updates: { condition: conditionExpression }
      })

      // Reset editing state
      this.editingSubTransformId = null
      this.currentCondition = ''

      // Show success notification
      this.$q.notify({
        type: 'positive',
        message: 'Condition updated successfully',
        icon: 'check',
        position: 'top',
        timeout: 2000
      })
    },

    saveTransform (transformData) {
      console.log('[Step 6] Save transform:', transformData)

      if (!this.editingSubTransformId) {
        console.error('[Step 6] No SubTransform ID set for editing')
        return
      }

      // Find the SubTransform to update
      const subtransform = this.findSubTransform(this.editingSubTransformId, this.subTransformsList)

      if (!subtransform) {
        console.error('[Step 6] SubTransform not found:', this.editingSubTransformId)
        return
      }

      // Clone transforms array
      const updatedTransforms = [...(subtransform.transforms || [])]

      if (this.editingTransformMode === 'add') {
        // Add new transform
        updatedTransforms.push(transformData)
      } else if (this.editingTransformMode === 'edit' && this.editingTransformIndex >= 0) {
        // Update existing transform
        updatedTransforms[this.editingTransformIndex] = transformData
      }

      // Update the SubTransform with new transforms
      this.updateSubTransformAction({
        id: this.editingSubTransformId,
        updates: { transforms: updatedTransforms }
      })

      // Reset editing state
      this.editingSubTransformId = null
      this.editingTransformIndex = null
      this.editingTransformMode = null
      this.currentTransforms = []

      // Show success notification
      this.$q.notify({
        type: 'positive',
        message: this.editingTransformMode === 'add' ? 'Transform added successfully' : 'Transform updated successfully',
        icon: 'check',
        position: 'top',
        timeout: 2000
      })
    },

    findSubTransform (id, list) {
      // Recursive function to find SubTransform by ID
      for (const item of list) {
        if (item.id === id) {
          return item
        }
        if (item.subTransforms && item.subTransforms.length > 0) {
          const found = this.findSubTransform(id, item.subTransforms)
          if (found) {
            return found
          }
        }
      }
      return null
    },

    handleExpandAll () {
      // Handled by individual cards
    },

    handleCollapseAll () {
      // Handled by individual cards
    },

    validateStep () {
      // Step 6 is optional, so always valid
      // But we can add validation for individual SubTransforms
      const isValid = this.localSkipSubTransforms || this.subTransformsList.length > 0

      // Emit step-valid without arguments - WizardContainer will use currentStep by default
      if (isValid) {
        this.$emit('step-valid')
      } else {
        this.$emit('step-invalid', ['At least one SubTransform is required, or enable "Skip SubTransforms"'])
      }
    },

    generateUUID () {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = Math.random() * 16 | 0
        const v = c === 'x' ? r : (r & 0x3 | 0x8)
        return v.toString(16)
      })
    },

    /**
     * Handle navigation to next step
     * Validates the step and saves the state before proceeding
     */
    async proceedToNext () {
      try {
        this.isSaving = true

        // Validate step (Step 6 is optional - valid if skipped or has at least one SubTransform)
        const isValid = this.localSkipSubTransforms || this.subTransformsList.length > 0

        if (!isValid) {
          this.$q.notify({
            type: 'warning',
            message: 'Please add at least one SubTransform or enable "Skip SubTransforms"',
            position: 'top',
            timeout: 3000
          })
          this.isSaving = false
          return
        }

        // Emit step validation event to mark it as valid
        this.$emit('step-valid')

        // Navigate to the next step (using the action from Vuex)
        this.$emit('next-step')
      } catch (error) {
        console.error('[Step 6] Error proceeding to next step:', error)
        this.$q.notify({
          type: 'negative',
          message: 'Failed to proceed to next step',
          caption: error.message,
          position: 'top'
        })
      } finally {
        this.isSaving = false
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.step-subtransform-config {
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  padding: 24px;

  .step-header {
    display: flex;
    align-items: center;
    margin-bottom: 32px;
    gap: 20px;

    .step-icon {
      flex-shrink: 0;
    }

    .step-title-section {
      flex: 1;

      .step-title {
        font-size: 28px;
        font-weight: 500;
        margin: 0 0 8px 0;
        color: var(--q-primary);
      }

      .step-subtitle {
        font-size: 14px;
        color: var(--q-dark);
        opacity: 0.7;
        margin: 0;
        line-height: 1.6;
      }
    }
  }

  .instructions-banner {
    display: flex;
    align-items: center;
    padding: 16px 20px;
    background: var(--q-primary);
    background: linear-gradient(135deg, rgba(25, 118, 210, 0.1) 0%, rgba(25, 118, 210, 0.05) 100%);
    border-left: 4px solid var(--q-primary);
    border-radius: 8px;
    margin-bottom: 24px;

    .instructions-content {
      flex: 1;
      font-size: 14px;

      strong {
        color: var(--q-primary);
      }
    }

    .subtransform-progress {
      flex-shrink: 0;
    }
  }

  .step-content {
    .empty-state-subtransform {
      .empty-state-card {
        max-width: 800px;
        margin: 40px auto;
        border: 2px dashed var(--q-grey-4);
        border-radius: 12px;
      }

      .empty-state-title {
        font-size: 24px;
        font-weight: 500;
        color: var(--q-dark);
      }

      .empty-state-description {
        max-width: 600px;
        margin: 0 auto;
      }

      .use-cases {
        h6 {
          font-weight: 600;
          color: var(--q-dark);
        }
      }

      .empty-state-actions {
        margin-top: 32px;
      }
    }

    .subtransform-workspace {
      .subtransform-toolbar {
        display: flex;
        align-items: center;
        padding: 16px;
        background: var(--q-grey-1);
        border-radius: 8px;

        .toolbar-left,
        .toolbar-right {
          display: flex;
          align-items: center;
          gap: 8px;
        }
      }

      .subtransform-list {
        margin-top: 24px;
      }
    }
  }
}

// Dark mode adjustments
body.body--dark {
  .step-subtransform-config {
    .step-header {
      .step-title-section {
        .step-subtitle {
          color: var(--q-dark);
        }
      }
    }

    .instructions-banner {
      background: linear-gradient(135deg, rgba(66, 165, 245, 0.15) 0%, rgba(66, 165, 245, 0.08) 100%);
    }

    .step-content {
      .subtransform-workspace {
        .subtransform-toolbar {
          background: var(--q-dark-page);
        }
      }
    }
  }
}

/* Step Actions */
.step-actions {
  display: flex;
  justify-content: space-between;
  padding-top: 2rem;
  border-top: 1px solid var(--q-color-grey-3);
  margin-top: 2rem;
}

.wizard-btn {
  padding: 8px 16px;
  border-radius: 6px;
}

/* Dark mode adjustments for step actions */
body.body--dark .step-actions {
  border-color: var(--q-color-grey-8);
}
</style>
