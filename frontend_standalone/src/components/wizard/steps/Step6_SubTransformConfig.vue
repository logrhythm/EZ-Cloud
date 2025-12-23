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

    <!-- Advanced Feature Warning Banner -->
    <q-banner
      dense
      rounded
      class="advanced-feature-banner q-mb-md"
    >
      <template v-slot:avatar>
        <q-icon name="lightbulb" color="amber-8" size="32px" />
      </template>
      <div class="banner-content">
        <div class="banner-title">Advanced Feature</div>
        <div class="banner-message">
          This step is intended for <strong>advanced use cases only</strong>.
          For most users, we recommend exploring the option of creating a new policy file
          instead of configuring SubTransforms.
        </div>
      </div>
    </q-banner>

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
        aria-label="Go to previous step"
      />

      <q-btn
        unelevated
        color="primary"
        icon-right="arrow_forward"
        label="Continue to Export"
        :loading="isSaving"
        @click="proceedToNext"
        class="wizard-btn wizard-btn--primary"
        aria-label="Continue to export step"
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
      isSaving: false,
      // Update mode state
      isLoadingFromPolicy: false,
      missingPolicyFields: [] // Track fields from policy that don't exist in sample data
    }
  },

  computed: {
    ...mapState('wizard', {
      subTransformsList: state => state.subTransforms.subTransformsList,
      skipSubTransforms: state => state.subTransforms.skipSubTransforms,
      sampleData: state => state.sampleData,
      schemaRules: state => state.schemaRules,
      projectConfig: state => state.projectConfig,
      policyUpload: state => state.policyUpload
    }),

    /**
     * Check if application is in update mode
     * @returns {boolean}
     */
    isUpdateMode () {
      return this.projectConfig?.mode === 'update' &&
             this.policyUpload?.uploadedPolicyData !== null
    },

    /**
     * Get available JSON paths from sample data for field validation
     * @returns {Array}
     */
    availableJsonPaths () {
      // Import MappingService to extract paths
      const MappingService = require('../../../services/wizard/mappingService').MappingService

      if (!this.sampleData?.parsedData || !this.sampleData?.dataStructure) {
        return []
      }

      try {
        return MappingService.extractJsonPaths(
          this.sampleData.parsedData,
          this.sampleData.dataStructure,
          {
            jsonToStringFields: this.schemaRules?.convertToJson || [],
            parsedStringifiedFields: this.schemaRules?.parsedStringifiedJsonFields || {}
          }
        )
      } catch (error) {
        console.error('[Step 6] Error extracting JSON paths:', error)
        return []
      }
    }
  },

  watch: {
    skipSubTransforms: {
      immediate: true,
      handler (value) {
        this.localSkipSubTransforms = value
      }
    },

    // Watch for changes in subTransforms list from Vuex store
    // This ensures component reacts when store is reset
    subTransformsList: {
      handler (newList) {
        console.log('[Step 6] Detected subTransformsList change in store:', newList?.length || 0)
        // The component already reads from Vuex directly via computed property
        // So we just need to validate the step when the list changes
        this.validateStep()
      },
      deep: true
    }
  },

  mounted () {
    // Listen for expand/collapse all events
    this.$root.$on('subtransform-expand-all', this.handleExpandAll)
    this.$root.$on('subtransform-collapse-all', this.handleCollapseAll)

    // Check if in update mode and pre-fill from policy
    if (this.isUpdateMode && this.policyUpload.uploadedPolicyData) {
      // Check if sub-transforms were already loaded from store
      const hasExistingSubTransforms = this.subTransformsList && this.subTransformsList.length > 0

      if (!hasExistingSubTransforms) {
        console.log('[Step 6] Update mode detected - will pre-fill from policy')

        // Wait for component to be fully mounted before prefilling
        this.$nextTick(async () => {
          await this.prefillFromPolicy(this.policyUpload.uploadedPolicyData)
        })
      } else {
        console.log('[Step 6] Update mode detected but sub-transforms already loaded from store - skipping prefill')
      }
    }

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

      console.log('[Step 6] Setting currentCondition:', this.currentCondition)

      // Use $nextTick to ensure the condition prop is updated before opening the modal
      this.$nextTick(() => {
        // Open condition editor modal
        this.conditionDialog = true

        console.log('[Step 6] conditionDialog is now:', this.conditionDialog)
        console.log('[Step 6] currentCondition prop should be set to:', this.currentCondition)
      })
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
     * Check if a field path exists in the current sample data
     * @param {string} fieldPath - The field path to check (e.g., "@.type", "$.name", "$.@metadata.beat")
     * @param {string} fanoutParent - Optional fanout parent element
     * @returns {boolean}
     */
    checkFieldExistsInSampleData (fieldPath, fanoutParent = null) {
      if (!fieldPath || !this.availableJsonPaths) {
        console.log('[Step 6] checkFieldExistsInSampleData - early return:', { fieldPath, hasAvailablePaths: !!this.availableJsonPaths })
        return false
      }

      /**
       * Normalize a path for comparison
       * Handles multiple formats:
       * - @.field -> field
       * - $.field -> field
       * - @.@metadata.beat -> @metadata.beat (@ is part of property name)
       * - $.@metadata.beat -> @metadata.beat
       */
      const normalizePath = (path) => {
        if (!path) return ''
        let normalized = path.trim()

        // Convert @. prefix to $. for consistency
        if (normalized.startsWith('@.')) {
          normalized = '$.' + normalized.substring(2)
        }

        // Ensure it starts with $.
        if (!normalized.startsWith('$.')) {
          normalized = '$.' + normalized
        }

        // Remove the leading $. for comparison
        normalized = normalized.substring(2)

        // Remove array indices [0], [1], etc. for comparison (but keep [*])
        normalized = normalized.replace(/\[\d+\]/g, '')

        // Remove [*] for comparison
        normalized = normalized.replace(/\[\*\]/g, '')

        return normalized.toLowerCase()
      }

      const normalizedFieldPath = normalizePath(fieldPath)

      console.log('[Step 6] Checking field existence:', {
        originalPath: fieldPath,
        normalizedPath: normalizedFieldPath,
        availablePathsCount: this.availableJsonPaths.length
      })

      // Check if field exists in available paths - CASE-INSENSITIVE
      const found = this.availableJsonPaths.some(pathObj => {
        const pathValue = pathObj.value || pathObj.label || ''
        const normalizedAvailablePath = normalizePath(pathValue)

        // Try exact normalized match
        if (normalizedAvailablePath === normalizedFieldPath) {
          console.log('[Step 6] ✓ FOUND match:', {
            fieldPath,
            matchedAgainst: pathValue
          })
          return true
        }

        return false
      })

      if (!found) {
        console.log('[Step 6] ⚠️  NOT FOUND:', {
          fieldPath,
          normalizedPath: normalizedFieldPath,
          sampleAvailablePaths: this.availableJsonPaths.slice(0, 5).map(p => ({
            original: p.value || p.label,
            normalized: normalizePath(p.value || p.label)
          }))
        })
      }

      return found
    },

    /**
     * Extract field references from a JSONPath condition expression
     * @param {string} condition - The condition expression (e.g., "@.type=='access'", "@.errorMessage || @.errorCode")
     * @returns {Array<string>} - Array of field paths referenced in the condition
     */
    extractFieldsFromCondition (condition) {
      if (!condition || typeof condition !== 'string') {
        return []
      }

      // Enhanced pattern to match:
      // - @.fieldName
      // - @.@metadata.beat (@ can be part of property name)
      // - @['fieldName'] or @["fieldName"]
      // - Nested paths like @.response.events[*].type
      const fieldPattern = /@\.[a-zA-Z_@][\w.@[\]'"*]*/g
      const matches = condition.match(fieldPattern) || []

      console.log('[Step 6] Extracting fields from condition:', {
        condition,
        rawMatches: matches
      })

      // Clean up the matches - extract just the field path part
      const cleanedFields = matches.map(match => {
        // Remove comparison operators and values
        // For example: "@.type=='access'" -> "@.type"
        let cleaned = match

        // Split on comparison operators
        const operators = ['==', '!=', '>=', '<=', '>', '<', '&&', '||', ' ']
        for (const op of operators) {
          const index = cleaned.indexOf(op)
          if (index > 0) {
            cleaned = cleaned.substring(0, index)
            break
          }
        }

        // Remove quotes if present
        cleaned = cleaned.replace(/['"]/g, '')

        // Convert bracket notation to dot notation
        cleaned = cleaned.replace(/@\['([^']+)'\]/g, '@.$1')
        cleaned = cleaned.replace(/@\["([^"]+)"\]/g, '@.$1')

        return cleaned
      })

      // Remove duplicates
      const uniqueFields = [...new Set(cleanedFields)]

      console.log('[Step 6] Extracted field paths:', uniqueFields)

      return uniqueFields
    },

    /**
     * Validate a condition against sample data
     * @param {string} condition - The condition expression
     * @param {string} fanoutParent - Optional fanout parent element
     * @returns {Object} - { isValid: boolean, missingFields: Array }
     */
    validateCondition (condition, fanoutParent = null) {
      // Null or empty condition is a catch-all rule (always valid)
      if (!condition || condition.trim() === '') {
        return { isValid: true, missingFields: [] }
      }

      const fields = this.extractFieldsFromCondition(condition)
      const missingFields = []

      for (const field of fields) {
        if (!this.checkFieldExistsInSampleData(field, fanoutParent)) {
          missingFields.push(field)
        }
      }

      return {
        isValid: missingFields.length === 0,
        missingFields
      }
    },

    /**
     * Validate transform mappings against sample data
     * @param {Array} transforms - Array of transform objects
     * @param {string} fanoutParent - Optional fanout parent element
     * @returns {Object} - { isValid: boolean, missingFields: Array }
     */
    validateSubTransformMappings (transforms, fanoutParent = null) {
      if (!Array.isArray(transforms) || transforms.length === 0) {
        return { isValid: true, missingFields: [] }
      }

      const missingFields = []

      for (const transform of transforms) {
        const inputRule = transform.inputRule
        if (inputRule && !this.checkFieldExistsInSampleData(inputRule, fanoutParent)) {
          missingFields.push({
            field: inputRule,
            lrField: transform.LRSchemaField || 'unknown'
          })
        }

        // Check alternative fields if present
        if (transform.alternativeFields && Array.isArray(transform.alternativeFields)) {
          for (const altField of transform.alternativeFields) {
            if (altField && !this.checkFieldExistsInSampleData(altField, fanoutParent)) {
              missingFields.push({
                field: altField,
                lrField: transform.LRSchemaField || 'unknown',
                isAlternative: true
              })
            }
          }
        }
      }

      return {
        isValid: missingFields.length === 0,
        missingFields
      }
    },

    /**
     * Normalize data type from policy format to UI format
     * @param {string} type - The type from policy
     * @returns {string}
     */
    normalizeDataType (type) {
      if (!type) return 'String'

      const typeMap = {
        string: 'String',
        String: 'String',
        number: 'Number',
        Number: 'Number',
        integer: 'Number',
        Integer: 'Number',
        decimal: 'Decimal',
        Decimal: 'Decimal',
        float: 'Decimal',
        Float: 'Decimal',
        boolean: 'Boolean',
        Boolean: 'Boolean',
        datetime: 'DateTime',
        DateTime: 'DateTime',
        date: 'DateTime',
        Date: 'DateTime'
      }

      return typeMap[type] || 'String'
    },

    /**
     * Pre-fill Step 6 from uploaded policy data (Update mode)
     * Extracts subtransforms from policy and populates the UI
     * @param {Object} policyData - The uploaded policy data
     * @async
     */
    async prefillFromPolicy (policyData) {
      try {
        console.log('============================================================')
        console.log('[Step 6] prefillFromPolicy: Starting pre-fill process')
        console.log('============================================================')

        this.isLoadingFromPolicy = true

        // Wait for component to be fully ready
        await this.$nextTick()
        await this.$nextTick()

        // Extract subtransforms from policy (case-insensitive)
        const subtransforms = this.getCaseInsensitiveProperty(policyData, 'subtransforms') || []

        if (!Array.isArray(subtransforms) || subtransforms.length === 0) {
          console.log('[Step 6] No subtransforms found in policy')
          this.isLoadingFromPolicy = false
          return
        }

        console.log('[Step 6] Found', subtransforms.length, 'subtransforms in policy')

        // Track missing fields globally
        const allMissingFields = []

        // Process each subtransform
        for (let index = 0; index < subtransforms.length; index++) {
          const subtransform = subtransforms[index]

          console.log('------------------------------------------------------------')
          console.log('[Step 6] Processing subtransform', index + 1)
          console.log('  condition:', subtransform.condition)
          console.log('  exitonmatch:', subtransform.exitonmatch)
          console.log('  transforms count:', subtransform.transforms?.length || 0)

          // Extract properties with case-insensitive access
          const condition = this.getCaseInsensitiveProperty(subtransform, 'condition') || ''
          const exitonmatch = this.getCaseInsensitiveProperty(subtransform, 'exitonmatch') === true
          const transforms = this.getCaseInsensitiveProperty(subtransform, 'transforms') || []
          const fanoutParentElement = this.getCaseInsensitiveProperty(subtransform, 'FanoutParentElement') || null

          // Validate condition
          const conditionValidation = this.validateCondition(
            condition,
            fanoutParentElement
          )

          if (!conditionValidation.isValid) {
            console.warn('[Step 6] Condition references missing fields:', conditionValidation.missingFields)
            conditionValidation.missingFields.forEach(field => {
              allMissingFields.push({
                subtransformIndex: index,
                type: 'subtransform-condition',
                field,
                message: `Condition field "${field}" not found in sample data`
              })
            })
          }

          // Validate transform mappings
          const mappingValidation = this.validateSubTransformMappings(
            transforms,
            fanoutParentElement
          )

          if (!mappingValidation.isValid) {
            console.warn('[Step 6] Transform mappings reference missing fields:', mappingValidation.missingFields)
            mappingValidation.missingFields.forEach(missingField => {
              allMissingFields.push({
                subtransformIndex: index,
                type: 'subtransform-mapping',
                field: missingField.field,
                lrField: missingField.lrField,
                isAlternative: missingField.isAlternative,
                message: `Mapping field "${missingField.field}" not found in sample data`
              })
            })
          }

          // Create subtransform object for UI
          const newSubTransform = {
            id: this.generateUUID(),
            name: `SubTransform ${index + 1}`,
            condition: condition,
            exitOnMatch: exitonmatch,
            transforms: transforms.map(transform => {
              const inputRule = this.getCaseInsensitiveProperty(transform, 'inputRule') || ''
              const lrSchemaField = this.getCaseInsensitiveProperty(transform, 'LRSchemaField') || ''
              const transformFanoutParent = this.getCaseInsensitiveProperty(transform, 'FanoutParentElement') || null
              const type = this.getCaseInsensitiveProperty(transform, 'type')
              const defaultValue = this.getCaseInsensitiveProperty(transform, 'default')
              const alternativeFields = this.getCaseInsensitiveProperty(transform, 'alternativeFields')
              const format = this.getCaseInsensitiveProperty(transform, 'format') || ''
              const subtransforms = this.getCaseInsensitiveProperty(transform, 'subtransforms') || null

              return {
                inputRule: inputRule,
                lrSchemaField: lrSchemaField,
                fanoutParentElement: transformFanoutParent,
                dataType: this.normalizeDataType(type),
                defaultValue: defaultValue !== null ? String(defaultValue) : '',
                alternativeFields: Array.isArray(alternativeFields) ? alternativeFields : [],
                format: format,
                subtransforms: subtransforms,
                // Add metadata for missing field tracking
                _isMissingField: !this.checkFieldExistsInSampleData(inputRule),
                _originalInputRule: inputRule
              }
            }),
            subTransforms: [], // Nested subtransforms (future support)
            // Track missing fields for this subtransform
            _missingConditionFields: conditionValidation.missingFields,
            _missingMappingFields: mappingValidation.missingFields
          }

          // Add subtransform to store
          this.addSubTransformAction(newSubTransform)

          console.log('[Step 6] Added subtransform to store:', newSubTransform.name)
        }

        // Store missing fields globally
        this.missingPolicyFields = allMissingFields

        console.log('============================================================')
        console.log('[Step 6] Pre-fill completed successfully')
        console.log('  Total subtransforms loaded:', subtransforms.length)
        console.log('  Missing fields:', allMissingFields.length)
        console.log('============================================================')

        // Force UI update
        await this.$nextTick()
        this.$forceUpdate()

        // Validate the step
        this.validateStep()

        // Show success notification
        const missingCount = allMissingFields.length
        const notificationType = missingCount > 0 ? 'warning' : 'positive'
        const baseMessage = 'Sub-transforms loaded from policy'
        const caption = `${subtransforms.length} sub-transform${subtransforms.length !== 1 ? 's' : ''} loaded`
        const missingCaption = missingCount > 0
          ? ` (${missingCount} field${missingCount !== 1 ? 's' : ''} not found in sample data)`
          : ''

        this.$q.notify({
          type: notificationType,
          message: baseMessage,
          caption: caption + missingCaption,
          timeout: missingCount > 0 ? 5000 : 3000,
          position: 'top',
          icon: missingCount > 0 ? 'warning' : 'check_circle'
        })
      } catch (error) {
        console.error('============================================================')
        console.error('[Step 6] Error in prefillFromPolicy:', error)
        console.error('============================================================')

        this.$q.notify({
          type: 'negative',
          message: 'Failed to load sub-transforms from policy',
          caption: error.message || 'An unexpected error occurred',
          timeout: 5000,
          position: 'top'
        })
      } finally {
        this.isLoadingFromPolicy = false
      }
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
    },

    /**
     * Helper function to get a property from an object in a case-insensitive manner
     * @param {Object} obj - The object to search
     * @param {string} key - The property name to find (case-insensitive)
     * @returns {*} - The value of the property, or undefined if not found
     */
    getCaseInsensitiveProperty (obj, key) {
      if (!obj || typeof obj !== 'object') {
        return undefined
      }

      // First try exact match
      if (key in obj) {
        return obj[key]
      }

      // Try case-insensitive match
      const lowerKey = key.toLowerCase()
      const foundKey = Object.keys(obj).find(k => k.toLowerCase() === lowerKey)
      return foundKey ? obj[foundKey] : undefined
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

  .advanced-feature-banner {
    background: linear-gradient(135deg, rgba(255, 193, 7, 0.12) 0%, rgba(255, 193, 7, 0.06) 100%);
    border-left: 4px solid #f57f17;
    padding: 16px 20px;

    .banner-content {
      .banner-title {
        font-size: 16px;
        font-weight: 600;
        color: #f57f17;
        margin-bottom: 8px;
      }

      .banner-message {
        font-size: 14px;
        line-height: 1.6;
        color: var(--q-dark);

        strong {
          color: #f57f17;
          font-weight: 600;
        }
      }
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

    .advanced-feature-banner {
      background: linear-gradient(135deg, rgba(255, 193, 7, 0.18) 0%, rgba(255, 193, 7, 0.1) 100%);
      border-left-color: #ffb300;

      .banner-content {
        .banner-title {
          color: #ffb300;
        }

        .banner-message {
          color: rgba(255, 255, 255, 0.87);

          strong {
            color: #ffb300;
          }
        }
      }
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
