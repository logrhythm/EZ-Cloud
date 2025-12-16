<template>
  <div class="step-filter-config">
    <div class="step-header">
      <div class="step-icon">
        <q-icon name="filter_alt" size="48px" class="text-primary" />
      </div>
      <div class="step-title-section">
        <h2 class="step-title">Filter Rule Configuration</h2>
        <p class="step-subtitle">
          Define filtering conditions to select relevant data.
          Filter rules are optional and help narrow down which logs to process.
        </p>
      </div>
    </div>

    <div class="step-content">
      <q-card class="wizard-card filter-builder-card">
        <q-card-section class="card-header">
          <div class="card-title">
            <q-icon name="filter_list" class="q-mr-sm" />
            Filter Rule Builder
          </div>
          <p class="card-description">
            Create filter conditions to determine when parsing rules apply.
            Conditions are evaluated against your sample data.
          </p>
        </q-card-section>

        <q-card-section>
          <!-- Loading State -->
          <div v-if="isExtractingFields" class="loading-state">
            <q-spinner color="primary" size="48px" />
            <p class="loading-message">Extracting fields from sample data...</p>
          </div>

          <!-- No Sample Data Warning -->
          <div v-else-if="availableFields.length === 0" class="no-fields-warning">
            <q-icon name="warning" size="48px" color="warning" />
            <p class="no-fields-message">
              No fields available for filtering.
              Please complete Step 2 (Sample Data) first.
            </p>
          </div>

          <!-- Filter Builder -->
          <div v-else>
            <!-- Filter Conditions -->
            <div class="filter-conditions">
              <div class="conditions-header">
                <h6 class="conditions-title">
                  Filter Conditions
                  <q-chip
                    v-if="localConditions.length > 0"
                    color="primary"
                    text-color="white"
                    size="sm"
                    class="q-ml-sm"
                    aria-label="Number of filter conditions"
                  >
                    {{ localConditions.length }}
                  </q-chip>
                </h6>
              </div>

              <!-- Reordering Feature Info Banner -->
              <div v-if="localConditions.length > 1" class="reorder-info-banner">
                <q-icon name="info" size="20px" color="primary" class="q-mr-sm" />
                <div class="reorder-info-text">
                  <strong>Tip:</strong> You can reorder conditions by dragging the
                  <q-icon name="drag_indicator" size="16px" class="inline-icon" />
                  handle, or using the
                  <q-icon name="keyboard_arrow_up" size="16px" class="inline-icon" />
                  <q-icon name="keyboard_arrow_down" size="16px" class="inline-icon" />
                  buttons to change the evaluation order.
                </div>
              </div>

              <!-- Empty State -->
              <div v-if="localConditions.length === 0" class="empty-conditions">
                <q-icon name="info" size="48px" color="grey-6" />
                <p class="empty-message">
                  No filter conditions defined yet.
                  Click "Add Condition" below to create your first filter.
                </p>
              </div>

              <!-- Condition Cards with Per-Condition Operators -->
              <div
                v-for="(condition, index) in localConditions"
                :key="condition.id || `condition-${index}`"
                class="filter-condition-wrapper"
                draggable="true"
                @dragstart="onDragStart($event, index)"
                @dragover="onDragOver($event, index)"
                @dragenter="onDragEnter($event, index)"
                @dragleave="onDragLeave($event, index)"
                @drop="onDrop($event, index)"
                @dragend="onDragEnd"
                :class="{ 'dragging': draggedIndex === index, 'drag-over': dragOverIndex === index }"
              >
                <!-- Condition Card -->
                <q-card flat bordered class="condition-card">
                  <q-card-section>
                    <!-- Reorder Controls Row -->
                    <div class="reorder-controls">
                      <div class="drag-handle" :title="`Drag to reorder condition ${index + 1}`">
                        <q-icon name="drag_indicator" size="20px" color="grey-6" />
                      </div>
                      <div class="reorder-buttons">
                        <q-btn
                          flat
                          dense
                          round
                          size="sm"
                          color="grey-7"
                          icon="keyboard_arrow_up"
                          :disable="index === 0 || isSaving"
                          @click="moveConditionUp(index)"
                          :aria-label="`Move condition ${index + 1} up`"
                        >
                          <q-tooltip>Move up</q-tooltip>
                        </q-btn>
                        <q-btn
                          flat
                          dense
                          round
                          size="sm"
                          color="grey-7"
                          icon="keyboard_arrow_down"
                          :disable="index === localConditions.length - 1 || isSaving"
                          @click="moveConditionDown(index)"
                          :aria-label="`Move condition ${index + 1} down`"
                        >
                          <q-tooltip>Move down</q-tooltip>
                        </q-btn>
                      </div>
                      <div class="condition-number">
                        Condition {{ index + 1 }}
                      </div>
                    </div>

                    <div class="condition-row">
                      <!-- Field Selector -->
                      <div class="condition-field-wrapper">
                        <q-select
                          :ref="`fieldSelect_${index}`"
                          v-model="condition.field"
                          :options="fieldOptions"
                          outlined
                          dense
                          label="Field"
                          class="condition-field"
                          emit-value
                          map-options
                          option-value="value"
                          option-label="label"
                          options-dense
                          bg-color="white"
                          color="primary"
                          popup-content-class="dropdown-dark"
                          popup-content-style="z-index: 9999;"
                          :disable="isSaving"
                          @input="(value) => onFieldChange(index, value)"
                          @popup-show="onDropdownOpen('field', index)"
                          :aria-label="`Select field for condition ${index + 1}`"
                          :aria-describedby="`field-hint-${index}`"
                        >
                          <template v-slot:option="scope">
                            <q-item
                              v-bind="scope.itemProps"
                              class="dropdown-item"
                              @click.native="() => handleFieldItemClick(index, scope.opt.value)"
                              clickable
                            >
                              <q-item-section>
                                <q-item-label>
                                  {{ scope.opt.label }}
                                  <q-badge
                                    v-if="isFieldMissing(scope.opt.value)"
                                    color="orange"
                                    text-color="white"
                                    class="q-ml-xs"
                                  >
                                    missing
                                  </q-badge>
                                </q-item-label>
                                <q-item-label caption>{{ scope.opt.type }}</q-item-label>
                              </q-item-section>
                            </q-item>
                          </template>
                        </q-select>

                        <!-- Missing Field Warning Badge -->
                        <q-badge
                          v-if="isFieldMissing(condition.field)"
                          color="orange"
                          text-color="white"
                          class="missing-field-badge"
                        >
                          <q-icon name="warning" size="14px" class="q-mr-xs" />
                          missing
                          <q-tooltip>
                            {{ getFieldWarningMessage(condition.field) }}
                          </q-tooltip>
                        </q-badge>
                      </div>
                      <span :id="`field-hint-${index}`" class="sr-only">
                        Choose a field from your sample data to create a filter condition
                      </span>

                      <!-- Operator Selector -->
                      <q-select
                        v-model="condition.operator"
                        :options="getOperatorsForCondition(condition)"
                        outlined
                        dense
                        label="Operator"
                        class="condition-operator"
                        emit-value
                        map-options
                        option-value="value"
                        option-label="label"
                        options-dense
                        bg-color="white"
                        color="primary"
                        popup-content-class="dropdown-dark"
                        :disable="isSaving"
                        @input="(value) => onOperatorChange(index, value)"
                        @popup-show="onDropdownOpen('operator', index)"
                        :aria-label="`Select operator for condition ${index + 1}`"
                      />

                      <!-- Value Input with Suggestions (Hidden for 'exists' operator) -->
                      <div v-if="condition.operator !== 'exists'" class="condition-value-group">
                        <q-select
                          v-model="condition.value"
                          :options="getSampleValuesForField(condition.field)"
                          outlined
                          dense
                          :label="`Value${condition.fieldType ? ' (' + condition.fieldType + ')' : ''}`"
                          class="condition-value"
                          use-input
                          input-debounce="300"
                          new-value-mode="add-unique"
                          hide-selected
                          fill-input
                          bg-color="white"
                          color="primary"
                          popup-content-class="dropdown-dark"
                          :disable="isSaving"
                          :error="!!(conditionValidation[index] && !conditionValidation[index].isValid)"
                          :error-message="conditionValidation[index] && conditionValidation[index].errorMessage || ''"
                          @input-value="(val) => onValueInputChange(index, val)"
                          @filter="(val, update) => onValueFilter(index, val, update)"
                          @new-value="(inputValue, doneFn) => onValueNew(index, inputValue, doneFn)"
                          @popup-show="onDropdownOpen('value', index)"
                          :aria-label="`Enter value for condition ${index + 1}`"
                        >
                          <template v-slot:no-option>
                            <q-item>
                              <q-item-section class="text-grey">
                                Type to enter a custom value
                              </q-item-section>
                            </q-item>
                          </template>
                        </q-select>

                        <!-- Case Insensitive Checkbox (for contains operator only) -->
                        <q-checkbox
                          v-if="condition.operator === 'contains'"
                          v-model="condition.caseInsensitive"
                          label="Case Insensitive"
                          color="primary"
                          :disable="isSaving"
                          @input="() => onCaseInsensitiveChange(index)"
                          class="case-insensitive-checkbox"
                          :aria-label="`Toggle case-insensitive matching for condition ${index + 1}`"
                        >
                          <q-tooltip>
                            When checked, the search will ignore case differences (e.g., "Test" will match "test", "TEST", etc.)
                          </q-tooltip>
                        </q-checkbox>
                      </div>

                      <!-- Placeholder for 'exists' operator (shows helpful text) -->
                      <div
                        v-else
                        class="condition-value-placeholder"
                        :title="'No value needed - checks if attribute exists'"
                      >
                        <q-icon name="check_circle" color="positive" size="sm" class="q-mr-xs" />
                        <span class="placeholder-text">No value needed</span>
                        <q-tooltip>
                          The "Has Attribute" operator checks if the field exists in the JSON, regardless of its value or data type.
                        </q-tooltip>
                      </div>

                      <!-- Remove Button -->
                      <q-btn
                        flat
                        round
                        color="negative"
                        icon="close"
                        :disable="isSaving"
                        @click="removeCondition(index)"
                        :aria-label="`Remove condition ${index + 1}`"
                      >
                        <q-tooltip>Remove condition</q-tooltip>
                      </q-btn>
                    </div>
                  </q-card-section>
                </q-card>

                <!-- Logical Operator Section (between conditions) -->
                <div
                  v-if="index < localConditions.length - 1"
                  class="logical-operator-section"
                >
                  <!-- Top Connector Line -->
                  <div
                    class="connector-line connector-top"
                    :class="getConnectorClass(condition.logicalOperator)"
                  />

                  <!-- AND/OR Radio Buttons -->
                  <div class="logical-operator-radio-group">
                    <q-radio
                      v-model="condition.logicalOperator"
                      val="AND"
                      label="AND"
                      color="primary"
                      :disable="isSaving"
                      @input="() => onLogicalOperatorChange(index)"
                      class="logical-operator-radio logical-operator-radio--and"
                    />
                    <q-radio
                      v-model="condition.logicalOperator"
                      val="OR"
                      label="OR"
                      color="accent"
                      :disable="isSaving"
                      @input="() => onLogicalOperatorChange(index)"
                      class="logical-operator-radio logical-operator-radio--or"
                    />
                  </div>

                  <!-- Bottom Connector Line -->
                  <div
                    class="connector-line connector-bottom"
                    :class="getConnectorClass(condition.logicalOperator)"
                  />
                </div>
              </div>

              <!-- Add Condition Button -->
              <div class="q-mt-md q-mb-lg">
                <q-btn
                  unelevated
                  color="primary"
                  icon="add"
                  label="Add Condition"
                  :disable="isSaving || availableFields.length === 0"
                  @click="addCondition"
                  no-caps
                  class="add-condition-btn"
                  aria-label="Add new filter condition"
                />
              </div>
            </div>

            <q-separator class="q-my-md" />

            <!-- Filter Expression Preview -->
            <div class="filter-preview">
              <h6 class="preview-title">Generated Filter Expression</h6>

              <q-card flat bordered class="expression-card">
                <q-card-section>
                  <code v-if="generatedExpression" class="filter-expression" aria-label="Generated filter expression">
                    {{ generatedExpression }}
                  </code>
                  <div v-else class="no-expression">
                    No filter expression generated yet
                  </div>
                </q-card-section>
              </q-card>

              <!-- Action Buttons -->
              <div class="preview-actions q-mt-md">
                <q-btn
                  unelevated
                  color="primary"
                  icon="content_copy"
                  label="Copy Expression"
                  :disable="!generatedExpression || isSaving"
                  @click="copyExpression"
                  no-caps
                  class="copy-expression-btn"
                  aria-label="Copy filter expression to clipboard"
                />
              </div>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </div>

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
        label="Continue to Field Mapping"
        :loading="isSaving"
        @click="proceedToNext"
        class="wizard-btn wizard-btn--primary"
        aria-label="Continue to field mapping step"
      />
    </div>
  </div>
</template>

<script>
import { mapState, mapMutations } from 'vuex'
import { FilterRuleService } from '../../../services/wizard/filterRuleService'

/**
 * Step 4: Filter Configuration Component
 * Production-ready implementation with comprehensive error handling,
 * loading states, accessibility, and performance optimizations
 *
 * @component
 * @production-ready
 */
export default {
  name: 'Step4_FilterConfig',

  data () {
    return {
      // Local state (deep cloned to prevent mutations)
      localConditions: [],
      availableFields: [],
      generatedExpression: '',

      // Loading states
      isExtractingFields: false,
      isSaving: false,

      // Debounce timer
      expressionUpdateTimer: null,

      // Component lifecycle flag
      isDestroyed: false,

      // Track last processed data to detect changes
      lastProcessedRawData: null,

      // Validation state for each condition
      conditionValidation: {},

      // Drag and drop state
      draggedIndex: null,
      dragOverIndex: null,

      // Track missing fields from policy (Update mode)
      missingPolicyFields: []
    }
  },

  computed: {
    ...mapState('wizard', ['sampleData', 'filterRules', 'schemaRules', 'projectConfig', 'policyUpload']),

    /**
     * Check if application is in update mode
     * @returns {boolean}
     */
    isUpdateMode () {
      return this.projectConfig?.mode === 'update' &&
             this.policyUpload?.uploadedPolicyData !== null
    },

    /**
     * Format field options for the select dropdown
     * @returns {Array<Object>} Formatted field options
     */
    fieldOptions () {
      try {
        if (!Array.isArray(this.availableFields)) {
          console.warn('[Step 4] availableFields is not an array:', this.availableFields)
          return []
        }

        // Remove duplicates by field value using a Set
        const uniqueFields = []
        const seenValues = new Set()

        for (const field of this.availableFields) {
          const value = field.label || ''

          // Only add if we haven't seen this value before
          if (value && !seenValues.has(value)) {
            seenValues.add(value)
            uniqueFields.push({
              label: field.label || '',
              value: field.label || '',
              type: field.type || 'unknown',
              sampleValues: field.sampleValues || []
            })
          }
        }

        return uniqueFields
      } catch (error) {
        console.error('[Step 4] Error formatting field options:', error)
        return []
      }
    }
  },

  watch: {
    /**
     * Watch for changes in sample data raw data to detect data changes
     * This watcher resets filter state when JSON data is uploaded/changed
     */
    'sampleData.rawData': {
      handler (newData, oldData) {
        // Only reset if:
        // 1. Data actually changed
        // 2. We have previously processed data
        // 3. Component is not destroyed
        if (newData !== oldData && newData !== this.lastProcessedRawData && this.lastProcessedRawData !== null && !this.isDestroyed) {
          console.log('[Step 4] Sample data changed - resetting filter state')
          this.resetFilterState()
          this.lastProcessedRawData = newData
        }
      },
      immediate: false
    },

    /**
     * Watch for changes in parsed data to re-extract fields
     */
    'sampleData.parsedData': {
      handler (newData) {
        if (newData && !this.isDestroyed) {
          console.log('[Step 4] Parsed data changed - re-extracting fields')
          this.extractFieldsFromSampleData()
        }
      },
      immediate: true
    },

    /**
     * Watch for changes in schemaRules (JSON-to-String selections) to re-extract fields
     * This enables real-time updates when user checks/unchecks JSON-to-String in Step 3
     */
    'schemaRules.convertToJson': {
      handler (newFields, oldFields) {
        if (!this.isDestroyed && this.sampleData?.parsedData) {
          // Check if the arrays are different
          const newFieldsStr = JSON.stringify(newFields || [])
          const oldFieldsStr = JSON.stringify(oldFields || [])

          if (newFieldsStr !== oldFieldsStr) {
            console.log('╔════════════════════════════════════════════════════════════════════════')
            console.log('║ [Step 4] JSON-to-String selections changed - re-extracting fields')
            console.log('╠════════════════════════════════════════════════════════════════════════')
            console.log('║ Old fields:', oldFields || [])
            console.log('║ New fields:', newFields || [])
            console.log('╚════════════════════════════════════════════════════════════════════════')

            this.extractFieldsFromSampleData()
          }
        }
      },
      deep: true,
      immediate: false
    },

    /**
     * Watch for changes in parsed stringified JSON fields
     * This ensures fields are updated when JSON string parsing completes
     */
    'schemaRules.parsedStringifiedJsonFields': {
      handler (newParsed, oldParsed) {
        if (!this.isDestroyed && this.sampleData?.parsedData) {
          // Check if the objects are different
          const newKeys = Object.keys(newParsed || {}).sort().join(',')
          const oldKeys = Object.keys(oldParsed || {}).sort().join(',')

          if (newKeys !== oldKeys) {
            console.log('╔════════════════════════════════════════════════════════════════════════')
            console.log('║ [Step 4] Parsed stringified JSON fields updated - re-extracting fields')
            console.log('╠════════════════════════════════════════════════════════════════════════')
            console.log('║ Old keys:', oldKeys || '(none)')
            console.log('║ New keys:', newKeys || '(none)')
            console.log('╚════════════════════════════════════════════════════════════════════════')

            this.extractFieldsFromSampleData()
          }
        }
      },
      deep: true,
      immediate: false
    }
  },

  methods: {
    ...mapMutations('wizard', [
      'UPDATE_FILTER_RULES',
      'SET_FILTER_AVAILABLE_FIELDS',
      'SET_FILTER_EXPRESSION',
      'RESET_FILTER_RULES'
    ]),

    /**
     * Simple debounce implementation
     * @param {Function} func - Function to debounce
     * @param {number} delay - Delay in milliseconds
     * @returns {Function} Debounced function
     * @private
     */
    _createDebounce (func, delay) {
      let timeoutId
      return function (...args) {
        clearTimeout(timeoutId)
        timeoutId = setTimeout(() => {
          func.apply(this, args)
        }, delay)
      }
    },

    /**
     * Debounced version of updateFilterExpression
     * Created in created() hook
     */
    debouncedUpdateExpression () {
      if (this.expressionUpdateTimer) {
        clearTimeout(this.expressionUpdateTimer)
      }

      this.expressionUpdateTimer = setTimeout(() => {
        this.updateFilterExpression()
      }, 300)
    },

    /**
     * Extract available fields from sample data
     * @async
     */
    async extractFieldsFromSampleData () {
      // Prevent execution if component is destroyed
      if (this.isDestroyed) {
        return
      }

      // Validate required data
      if (!this.sampleData || !this.sampleData.parsedData || !this.sampleData.dataStructure) {
        this.availableFields = []
        return
      }

      // Set loading state
      this.isExtractingFields = true

      try {
        // Prepare options for JSON-to-String field processing
        const options = {
          jsonToStringFields: this.schemaRules?.convertToJson || [],
          parsedStringifiedFields: this.schemaRules?.parsedStringifiedJsonFields || {}
        }

        console.log('╔════════════════════════════════════════════════════════════════════════')
        console.log('║ [Step 4] Extracting fields with JSON-to-String support')
        console.log('╠════════════════════════════════════════════════════════════════════════')
        console.log('║ convertToJson fields:', options.jsonToStringFields)
        console.log('║ parsedStringifiedJsonFields keys:', Object.keys(options.parsedStringifiedFields))
        console.log('╚════════════════════════════════════════════════════════════════════════')

        // Use FilterRuleService to extract field candidates with error handling
        const fields = FilterRuleService.extractFieldCandidates(
          this.sampleData.parsedData,
          this.sampleData.dataStructure,
          options
        )

        // Validate extracted fields
        if (!Array.isArray(fields)) {
          throw new Error('Invalid fields array returned from service')
        }

        // Update local and store state
        this.availableFields = fields
        this.SET_FILTER_AVAILABLE_FIELDS(fields)

        // Show notification if no fields found
        if (fields.length === 0) {
          this.$q.notify({
            type: 'warning',
            message: 'No filterable fields found in sample data',
            caption: 'Your data may not contain suitable fields for filtering',
            position: 'top',
            timeout: 3000
          })
        }
      } catch (error) {
        console.error('[Step 4] Error extracting fields:', error)
        this.availableFields = []

        this.$q.notify({
          type: 'negative',
          message: 'Failed to extract fields from sample data',
          caption: error.message || 'An unexpected error occurred',
          position: 'top',
          timeout: 5000
        })
      } finally {
        // Clear loading state
        this.isExtractingFields = false
      }
    },

    /**
     * Reset filter state when sample data changes
     * Clears all conditions, expression, and test results
     */
    resetFilterState () {
      console.log('[Step 4] Resetting filter state due to data change')

      try {
        // Clear local conditions
        this.localConditions = []

        // Clear generated expression
        this.generatedExpression = ''

        // Reset store
        this.RESET_FILTER_RULES()

        // Re-extract fields from new data
        this.extractFieldsFromSampleData()

        // Notify user
        this.$q.notify({
          type: 'info',
          message: 'Filter conditions reset due to sample data change',
          caption: 'Please reconfigure your filters based on the new data',
          position: 'top',
          timeout: 3000,
          icon: 'info'
        })

        console.log('[Step 4] Filter state reset complete')
      } catch (error) {
        console.error('[Step 4] Error resetting filter state:', error)
        this.$q.notify({
          type: 'negative',
          message: 'Failed to reset filter state',
          caption: error.message || 'An unexpected error occurred',
          position: 'top'
        })
      }
    },

    /**
     * Validate a condition before adding/updating
     * @param {Object} condition - Condition to validate
     * @returns {Object} Validation result
     * @private
     */
    _validateCondition (condition) {
      const errors = []

      if (!condition || typeof condition !== 'object') {
        errors.push('Invalid condition object')
        return { isValid: false, errors }
      }

      if (!condition.field || typeof condition.field !== 'string') {
        errors.push('Field is required')
      }

      if (!condition.operator || typeof condition.operator !== 'string') {
        errors.push('Operator is required')
      }

      if (condition.value === null || condition.value === undefined || condition.value === '') {
        errors.push('Value is required')
      }

      return {
        isValid: errors.length === 0,
        errors
      }
    },

    /**
     * Add a new empty condition with per-condition operator
     */
    addCondition () {
      console.log('[Step 4] addCondition called')

      try {
        // Validate available fields
        if (!Array.isArray(this.availableFields) || this.availableFields.length === 0) {
          this.$q.notify({
            type: 'warning',
            message: 'No fields available',
            caption: 'Please ensure sample data is loaded',
            position: 'top'
          })
          return
        }

        // Get the index for the new condition
        const newIndex = this.localConditions.length

        // Create new condition with unique ID and logicalOperator
        const newCondition = {
          id: `condition-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          field: this.availableFields[0]?.label || '',
          operator: '==',
          value: '',
          fieldType: this.availableFields[0]?.type || 'string',
          logicalOperator: 'AND', // Default for next condition
          caseInsensitive: false // Default case sensitivity for contains operator
        }

        // Add to local conditions
        this.localConditions.push(newCondition)

        // Initialize validation state for the new condition
        this.$set(this.conditionValidation, newIndex, {
          isValid: true,
          errorMessage: ''
        })

        // Update expression
        this.debouncedUpdateExpression()

        console.log(`[Step 4] Condition ${this.localConditions.length} added`)

        // Provide feedback
        this.$q.notify({
          type: 'info',
          message: 'Condition added',
          icon: 'add',
          position: 'top',
          timeout: 1500
        })
      } catch (error) {
        console.error('[Step 4] Error adding condition:', error)
        this.$q.notify({
          type: 'negative',
          message: 'Failed to add condition',
          caption: error.message || 'An unexpected error occurred',
          position: 'top'
        })
      }
    },

    /**
     * Handle logical operator change
     * @param {number} index - Index of condition whose operator changed
     */
    onLogicalOperatorChange (index) {
      try {
        const condition = this.localConditions[index]
        if (!condition) {
          console.warn('[Step 4] Condition not found at index:', index)
          return
        }

        console.log(`[Step 4] Logical operator changed to ${condition.logicalOperator} between conditions ${index + 1} and ${index + 2}`)

        // Update expression
        this.debouncedUpdateExpression()
      } catch (error) {
        console.error('[Step 4] Error handling logical operator change:', error)
      }
    },

    /**
     * Get connector class based on operator
     * @param {string} operator - The logical operator ('AND' or 'OR')
     * @returns {string} CSS class name
     */
    getConnectorClass (operator) {
      return operator === 'AND' ? 'connector-and' : 'connector-or'
    },

    /**
     * Remove a condition by index
     * @param {number} index - Index of condition to remove
     */
    removeCondition (index) {
      try {
        // Validate index
        if (typeof index !== 'number' || index < 0 || index >= this.localConditions.length) {
          throw new Error('Invalid condition index')
        }

        // Remove condition
        this.localConditions.splice(index, 1)

        // Remove validation state for this condition
        this.$delete(this.conditionValidation, index)

        // Re-index validation states (shift down)
        const newValidation = {}
        Object.keys(this.conditionValidation).forEach(key => {
          const keyIndex = parseInt(key, 10)
          if (keyIndex > index) {
            newValidation[keyIndex - 1] = this.conditionValidation[keyIndex]
          } else if (keyIndex < index) {
            newValidation[keyIndex] = this.conditionValidation[keyIndex]
          }
        })
        this.conditionValidation = newValidation

        // Update expression
        this.debouncedUpdateExpression()

        // Provide feedback
        this.$q.notify({
          type: 'info',
          message: 'Condition removed',
          icon: 'delete',
          position: 'top',
          timeout: 1500
        })
      } catch (error) {
        console.error('[Step 4] Error removing condition:', error)
        this.$q.notify({
          type: 'negative',
          message: 'Failed to remove condition',
          caption: error.message || 'An unexpected error occurred',
          position: 'top'
        })
      }
    },

    /**
     * Log dropdown open event
     * @param {string} type - Type of dropdown (field, operator, value)
     * @param {number} index - Condition index
     */
    onDropdownOpen (type, index) {
      console.log(`[Step 4] Dropdown opened - Type: ${type}, Condition Index: ${index}`)
    },

    /**
     * Manual handler for field item clicks
     * @param {number} index - Condition index
     * @param {string} value - Selected field value
     */
    handleFieldItemClick (index, value) {
      console.log(`[Step 4] Field selected - Index: ${index}, Value: ${value}`)

      // Manually update v-model
      this.localConditions[index].field = value

      // Call the regular field change handler
      this.onFieldChange(index, value)

      // Close the dropdown manually
      this.$nextTick(() => {
        const selectRef = this.$refs[`fieldSelect_${index}`]
        if (selectRef && selectRef.hidePopup) {
          selectRef.hidePopup()
        } else if (selectRef && Array.isArray(selectRef) && selectRef[0] && selectRef[0].hidePopup) {
          // Handle case where ref is an array
          selectRef[0].hidePopup()
        }
      })
    },

    /**
     * Handle field change to update field type
     * @param {number} index - Index of condition being updated
     * @param {string} value - The selected field value
     */
    onFieldChange (index, value) {
      console.log(`[Step 4] Field change - Index: ${index}, Value: ${value}`)

      try {
        // Validate index
        if (typeof index !== 'number' || index < 0 || index >= this.localConditions.length) {
          throw new Error('Invalid condition index')
        }

        // Get current condition
        const condition = this.localConditions[index]

        if (!condition) {
          throw new Error('Condition not found')
        }

        // Update the field value
        condition.field = value

        // Update condition field type using service
        const updatedCondition = FilterRuleService.updateConditionFieldType(
          condition,
          this.availableFields
        )

        // Reset operator and value when field changes
        updatedCondition.operator = '=='
        updatedCondition.value = ''

        // Update local state (ensure immutability and reactivity)
        this.$set(this.localConditions, index, JSON.parse(JSON.stringify(updatedCondition)))

        // Clear validation state for this condition
        this.$set(this.conditionValidation, index, {
          isValid: true,
          errorMessage: ''
        })

        console.log('[Step 4] Field updated with reset operator and value:', this.localConditions[index])

        // Update expression
        this.debouncedUpdateExpression()
      } catch (error) {
        console.error('[Step 4] Error handling field change:', error)
        this.$q.notify({
          type: 'negative',
          message: 'Failed to update field',
          caption: error.message || 'An unexpected error occurred',
          position: 'top'
        })
      }
    },

    /**
     * Handle operator change
     * @param {number} index - Index of condition being updated
     * @param {string} value - The selected operator value
     */
    onOperatorChange (index, value) {
      console.log(`[Step 4] Operator change - Index: ${index}, Value: ${value}`)

      try {
        // Validate index
        if (typeof index !== 'number' || index < 0 || index >= this.localConditions.length) {
          throw new Error('Invalid condition index')
        }

        // Update the operator value
        const condition = this.localConditions[index]
        condition.operator = value

        // Update expression
        this.debouncedUpdateExpression()
      } catch (error) {
        console.error('[Step 4] Error handling operator change:', error)
      }
    },

    /**
     * Handle case-insensitive checkbox change
     * @param {number} index - Index of condition being updated
     */
    onCaseInsensitiveChange (index) {
      console.log(`[Step 4] Case insensitive change - Index: ${index}`)

      try {
        // Validate index
        if (typeof index !== 'number' || index < 0 || index >= this.localConditions.length) {
          throw new Error('Invalid condition index')
        }

        // Update expression
        this.debouncedUpdateExpression()
      } catch (error) {
        console.error('[Step 4] Error handling case-insensitive change:', error)
      }
    },

    /**
     * Handle value input change (when user types in the input field)
     * @param {number} index - Index of condition being updated
     * @param {string} val - The input value being typed
     */
    onValueInputChange (index, val) {
      console.log(`[Step 4] Value input change - Index: ${index}, Input: ${val}`)

      try {
        // Validate index
        if (typeof index !== 'number' || index < 0 || index >= this.localConditions.length) {
          throw new Error('Invalid condition index')
        }

        // Update the value as user types
        const condition = this.localConditions[index]

        // Only update if val is a string (to avoid null/undefined issues)
        if (typeof val === 'string') {
          condition.value = val

          // Validate the value based on field type
          this.validateConditionValue(index)

          // Update expression with debounce
          this.debouncedUpdateExpression()
        }
      } catch (error) {
        console.error('[Step 4] Error handling value input change:', error)
      }
    },

    /**
     * Handle value filter (for dropdown suggestions)
     * @param {number} index - Index of condition being updated
     * @param {string} val - The filter value
     * @param {Function} update - Callback to update filtered options
     */
    onValueFilter (index, val, update) {
      try {
        // Get sample values for the field
        const sampleValues = this.getSampleValuesForField(this.localConditions[index]?.field)

        if (val === '') {
          update(() => {
            // Return all sample values when input is empty
            return sampleValues
          })
          return
        }

        update(() => {
          // Filter sample values based on input
          const needle = val.toLowerCase()
          return sampleValues.filter(v => v && v.toLowerCase().indexOf(needle) > -1)
        })
      } catch (error) {
        console.error('[Step 4] Error filtering values:', error)
        update(() => [])
      }
    },

    /**
     * Handle value change
     * @param {number} index - Index of condition being updated
     * @param {string} value - The entered/selected value
     */
    onValueChange (index, value) {
      console.log(`[Step 4] Value change - Index: ${index}, Value: ${value}`)

      try {
        // Validate index
        if (typeof index !== 'number' || index < 0 || index >= this.localConditions.length) {
          throw new Error('Invalid condition index')
        }

        // Update the value
        const condition = this.localConditions[index]
        condition.value = value

        // Validate the value based on field type
        this.validateConditionValue(index)

        // Update expression
        this.debouncedUpdateExpression()
      } catch (error) {
        console.error('[Step 4] Error handling value change:', error)
      }
    },

    /**
     * Handle new custom value creation in value dropdown
     * @param {number} index - Index of condition being updated
     * @param {string} inputValue - The user-entered value
     * @param {Function} doneFn - Callback to finalize the value
     */
    onValueNew (index, inputValue, doneFn) {
      console.log(`[Step 4] New value created - Index: ${index}, Value: ${inputValue}`)

      try {
        // Validate index
        if (typeof index !== 'number' || index < 0 || index >= this.localConditions.length) {
          throw new Error('Invalid condition index')
        }

        // Validate input value
        if (!inputValue || typeof inputValue !== 'string') {
          console.warn('[Step 4] Invalid input value')
          doneFn(null, 'add-unique')
          return
        }

        // Trim the input value
        const trimmedValue = inputValue.trim()

        if (trimmedValue === '') {
          console.warn('[Step 4] Empty input value')
          doneFn(null, 'add-unique')
          return
        }

        // Accept the custom value
        doneFn(trimmedValue, 'add-unique')

        // Update the condition value
        const condition = this.localConditions[index]
        condition.value = trimmedValue

        // Validate the value based on field type
        this.validateConditionValue(index)

        // Update expression
        this.debouncedUpdateExpression()

        console.log(`[Step 4] Custom value accepted: ${trimmedValue}`)
      } catch (error) {
        console.error('[Step 4] Error handling new value:', error)
        doneFn(null, 'add-unique')
      }
    },

    /**
     * Get operators for a specific condition based on its field type
     * @param {Object} condition - The condition object
     * @returns {Array<Object>} Available operators
     */
    getOperatorsForCondition (condition) {
      try {
        if (!condition || typeof condition !== 'object') {
          return []
        }

        const fieldType = condition.fieldType || 'string'
        return FilterRuleService.getOperatorsForFieldType(fieldType)
      } catch (error) {
        console.error('[Step 4] Error getting operators:', error)
        return []
      }
    },

    /**
     * Get sample values for a field
     * @param {string} fieldLabel - The field label
     * @returns {Array<string>} Sample values
     */
    getSampleValuesForField (fieldLabel) {
      try {
        if (!fieldLabel || typeof fieldLabel !== 'string') {
          return []
        }

        if (!Array.isArray(this.availableFields)) {
          return []
        }

        const field = this.availableFields.find(f => f && f.label === fieldLabel)
        return field && Array.isArray(field.sampleValues) ? field.sampleValues : []
      } catch (error) {
        console.error('[Step 4] Error getting sample values:', error)
        return []
      }
    },

    /**
     * Validate a condition's value based on its field type
     * @param {number} index - Index of condition to validate
     */
    validateConditionValue (index) {
      try {
        // Validate index
        if (typeof index !== 'number' || index < 0 || index >= this.localConditions.length) {
          console.warn('[Step 4] Invalid condition index for validation:', index)
          return
        }

        const condition = this.localConditions[index]

        if (!condition) {
          console.warn('[Step 4] Condition not found at index:', index)
          return
        }

        // Get field type (default to 'string' if not set)
        const fieldType = condition.fieldType || 'string'

        // Validate the value using FilterRuleService
        const validation = FilterRuleService.validateValueForFieldType(condition.value, fieldType)

        // Update validation state using Vue.set for reactivity
        this.$set(this.conditionValidation, index, {
          isValid: validation.isValid,
          errorMessage: validation.errorMessage || ''
        })

        console.log(`[Step 4] Condition ${index} validation:`, validation)

        return validation
      } catch (error) {
        console.error('[Step 4] Error validating condition value:', error)
        // Set as valid on error to avoid blocking user
        this.$set(this.conditionValidation, index, {
          isValid: true,
          errorMessage: ''
        })
        return { isValid: true, errorMessage: '' }
      }
    },

    /**
     * Update the generated filter expression using per-condition operators
     */
    updateFilterExpression () {
      try {
        // Validate inputs
        if (!Array.isArray(this.localConditions)) {
          console.warn('[Step 4] Invalid localConditions array')
          this.generatedExpression = ''
          return
        }

        if (this.localConditions.length === 0) {
          this.generatedExpression = ''
          return
        }

        // Build expression with per-condition operators
        let expression = ''

        this.localConditions.forEach((condition, index) => {
          // Skip incomplete conditions
          // Note: 'exists' operator doesn't need a value
          if (!condition.field || !condition.operator) {
            return
          }

          // Skip conditions that require a value but don't have one
          if (condition.operator !== 'exists' && (condition.value === '' || condition.value === null || condition.value === undefined)) {
            return
          }

          try {
            // Build single condition using service
            const conditionExpr = FilterRuleService._buildSingleConditionExpression(condition)

            // Add to expression
            if (expression) {
              // Use the PREVIOUS condition's logicalOperator to connect
              const prevCondition = this.localConditions[index - 1]
              const operator = prevCondition && prevCondition.logicalOperator === 'OR' ? ' || ' : ' && '
              expression += operator + conditionExpr
            } else {
              expression = conditionExpr
            }
          } catch (error) {
            console.error(`[Step 4] Error building condition ${index}:`, error)
          }
        })

        // Update local and store state
        this.generatedExpression = expression || ''
        this.SET_FILTER_EXPRESSION(this.generatedExpression)

        console.log('[Step 4] Expression updated:', this.generatedExpression)
      } catch (error) {
        console.error('[Step 4] Error building filter expression:', error)
        this.generatedExpression = ''

        this.$q.notify({
          type: 'negative',
          message: 'Failed to build filter expression',
          caption: error.message || 'An unexpected error occurred',
          position: 'top'
        })
      }
    },

    /**
     * Copy filter expression to clipboard
     * @async
     */
    async copyExpression () {
      if (!this.generatedExpression || typeof this.generatedExpression !== 'string') {
        return
      }

      try {
        // Check for clipboard API support
        if (!navigator.clipboard) {
          throw new Error('Clipboard API not supported')
        }

        await navigator.clipboard.writeText(this.generatedExpression)

        this.$q.notify({
          type: 'info',
          message: 'Filter expression copied to clipboard',
          icon: 'content_copy',
          position: 'top',
          timeout: 2000
        })
      } catch (error) {
        console.error('[Step 4] Failed to copy:', error)

        // Fallback method
        try {
          const textArea = document.createElement('textarea')
          textArea.value = this.generatedExpression
          textArea.style.position = 'fixed'
          textArea.style.left = '-9999px'
          document.body.appendChild(textArea)
          textArea.select()
          document.execCommand('copy')
          document.body.removeChild(textArea)

          this.$q.notify({
            type: 'info',
            message: 'Filter expression copied to clipboard',
            icon: 'content_copy',
            position: 'top',
            timeout: 2000
          })
        } catch (fallbackError) {
          console.error('[Step 4] Fallback copy failed:', fallbackError)
          this.$q.notify({
            type: 'negative',
            message: 'Failed to copy to clipboard',
            caption: 'Please copy manually',
            position: 'top'
          })
        }
      }
    },

    /**
     * Save filter rules and proceed to next step
     * @async
     */
    async proceedToNext () {
      // Set saving state
      this.isSaving = true

      try {
        // Check if at least one filter condition is defined
        if (!this.localConditions || this.localConditions.length === 0) {
          this.$q.notify({
            type: 'warning',
            message: 'At least one filter condition is required',
            caption: 'Please add at least one filter condition before proceeding',
            position: 'top',
            timeout: 4000,
            icon: 'warning'
          })

          // Clear saving state and return
          this.isSaving = false
          return
        }

        // Check if all conditions are complete (have field, operator, and value when required)
        // Note: 'exists' operator doesn't require a value
        const incompleteConditions = this.localConditions.filter(condition => {
          if (!condition.field || !condition.operator) {
            return true
          }
          // Only require value for operators that need it (not 'exists')
          if (condition.operator !== 'exists' && (condition.value === '' || condition.value === null || condition.value === undefined)) {
            return true
          }
          return false
        })

        if (incompleteConditions.length > 0) {
          this.$q.notify({
            type: 'warning',
            message: 'All filter conditions must be complete',
            caption: 'Please fill in all required fields for each condition',
            position: 'top',
            timeout: 4000,
            icon: 'warning'
          })

          // Clear saving state and return
          this.isSaving = false
          return
        }

        // Check for value type validation errors
        const hasValidationErrors = Object.keys(this.conditionValidation).some(key => {
          const validation = this.conditionValidation[key]
          return validation && !validation.isValid
        })

        if (hasValidationErrors) {
          // Collect all validation error messages
          const errorMessages = []
          Object.keys(this.conditionValidation).forEach(key => {
            const validation = this.conditionValidation[key]
            if (validation && !validation.isValid && validation.errorMessage) {
              errorMessages.push(`Condition ${parseInt(key, 10) + 1}: ${validation.errorMessage}`)
            }
          })

          this.$q.notify({
            type: 'warning',
            message: 'Please fix validation errors before proceeding',
            caption: errorMessages.join(', '),
            position: 'top',
            timeout: 5000
          })

          // Clear saving state and return
          this.isSaving = false
          return
        }

        // Build filter rules object (no global operator anymore)
        const filterRules = {
          conditions: JSON.parse(JSON.stringify(this.localConditions)), // Deep clone with per-condition operators
          expression: this.generatedExpression
        }

        // Validate filter rules using service
        const validation = FilterRuleService.validateFilterRules(filterRules)

        // Show warnings if any
        if (validation.warnings && validation.warnings.length > 0) {
          console.warn('[Step 4] Validation warnings:', validation.warnings)
        }

        // Check for errors (but allow proceeding since filter is optional)
        if (!validation.isValid) {
          console.warn('[Step 4] Validation errors:', validation.errors)

          this.$q.notify({
            type: 'warning',
            message: 'Filter validation issues detected',
            caption: validation.errors.join(', '),
            position: 'top',
            timeout: 5000
          })
          // Don't return - allow proceeding since filter is optional
        }

        // Save to store
        this.UPDATE_FILTER_RULES(filterRules)

        // Emit events
        this.$emit('step-valid')
        this.$emit('next-step')
      } catch (error) {
        console.error('[Step 4] Error saving filter rules:', error)

        this.$q.notify({
          type: 'negative',
          message: 'Failed to save filter rules',
          caption: error.message || 'An unexpected error occurred',
          position: 'top',
          timeout: 5000
        })
      } finally {
        // Clear saving state
        this.isSaving = false
      }
    },

    /**
     * Handle drag start event
     * @param {DragEvent} event - The drag event
     * @param {number} index - Index of the condition being dragged
     */
    onDragStart (event, index) {
      console.log(`[Step 4] Drag start - Index: ${index}`)
      this.draggedIndex = index
      event.dataTransfer.effectAllowed = 'move'
      event.dataTransfer.setData('text/html', event.target.innerHTML)

      // Add dragging class after a brief delay to avoid visual glitch
      setTimeout(() => {
        event.target.classList.add('dragging')
      }, 0)
    },

    /**
     * Handle drag over event
     * @param {DragEvent} event - The drag event
     * @param {number} index - Index of the condition being dragged over
     */
    onDragOver (event, index) {
      event.preventDefault()
      event.dataTransfer.dropEffect = 'move'

      if (this.draggedIndex !== null && this.draggedIndex !== index) {
        this.dragOverIndex = index
      }
    },

    /**
     * Handle drag enter event
     * @param {DragEvent} event - The drag event
     * @param {number} index - Index of the condition being entered
     */
    onDragEnter (event, index) {
      if (this.draggedIndex !== null && this.draggedIndex !== index) {
        this.dragOverIndex = index
      }
    },

    /**
     * Handle drag leave event
     * @param {DragEvent} event - The drag event
     * @param {number} index - Index of the condition being left
     */
    onDragLeave (event, index) {
      // Only clear if we're actually leaving (not entering a child)
      if (event.target.classList.contains('filter-condition-wrapper')) {
        this.dragOverIndex = null
      }
    },

    /**
     * Handle drop event
     * @param {DragEvent} event - The drag event
     * @param {number} dropIndex - Index where the condition is being dropped
     */
    onDrop (event, dropIndex) {
      event.preventDefault()
      event.stopPropagation()

      console.log(`[Step 4] Drop - From: ${this.draggedIndex}, To: ${dropIndex}`)

      if (this.draggedIndex !== null && this.draggedIndex !== dropIndex) {
        this.reorderCondition(this.draggedIndex, dropIndex)
      }

      this.dragOverIndex = null
    },

    /**
     * Handle drag end event
     * @param {DragEvent} event - The drag event
     */
    onDragEnd (event) {
      console.log('[Step 4] Drag end')
      this.draggedIndex = null
      this.dragOverIndex = null
      event.target.classList.remove('dragging')
    },

    /**
     * Reorder a condition from one index to another
     * @param {number} fromIndex - Source index
     * @param {number} toIndex - Destination index
     */
    reorderCondition (fromIndex, toIndex) {
      try {
        console.log(`[Step 4] Reordering condition from ${fromIndex} to ${toIndex}`)

        // Validate indices
        if (
          typeof fromIndex !== 'number' ||
          typeof toIndex !== 'number' ||
          fromIndex < 0 ||
          toIndex < 0 ||
          fromIndex >= this.localConditions.length ||
          toIndex >= this.localConditions.length ||
          fromIndex === toIndex
        ) {
          console.warn('[Step 4] Invalid reorder indices')
          return
        }

        // Remove the condition from its current position
        const movedCondition = this.localConditions.splice(fromIndex, 1)[0]

        // Insert it at the new position
        this.localConditions.splice(toIndex, 0, movedCondition)

        // Reorder validation states
        const newValidation = {}

        // Rebuild validation object with new indices
        this.localConditions.forEach((condition, index) => {
          // Find the old index for this condition
          const oldIndex = index === toIndex ? fromIndex : (fromIndex < toIndex ? (index < toIndex ? index : index + 1) : (index <= toIndex ? index - 1 : index))
          newValidation[index] = this.conditionValidation[oldIndex] || { isValid: true, errorMessage: '' }
        })

        this.conditionValidation = newValidation

        // Update expression
        this.debouncedUpdateExpression()

        // Provide feedback
        this.$q.notify({
          type: 'info',
          message: `Condition moved from position ${fromIndex + 1} to ${toIndex + 1}`,
          icon: 'swap_vert',
          position: 'top',
          timeout: 1500
        })

        console.log('[Step 4] Condition reordered successfully')
      } catch (error) {
        console.error('[Step 4] Error reordering condition:', error)
        this.$q.notify({
          type: 'negative',
          message: 'Failed to reorder condition',
          caption: error.message || 'An unexpected error occurred',
          position: 'top'
        })
      }
    },

    /**
     * Move condition up by one position
     * @param {number} index - Index of condition to move up
     */
    moveConditionUp (index) {
      if (index > 0) {
        this.reorderCondition(index, index - 1)
      }
    },

    /**
     * Move condition down by one position
     * @param {number} index - Index of condition to move down
     */
    moveConditionDown (index) {
      if (index < this.localConditions.length - 1) {
        this.reorderCondition(index, index + 1)
      }
    },

    /**
     * Restore state from store with migration support
     */
    restoreStateFromStore () {
      try {
        if (!this.filterRules || typeof this.filterRules !== 'object') {
          return
        }

        // Restore conditions (deep clone to prevent mutations)
        if (this.filterRules.conditions && Array.isArray(this.filterRules.conditions) && this.filterRules.conditions.length > 0) {
          this.localConditions = JSON.parse(JSON.stringify(this.filterRules.conditions))

          // Migration: Add logicalOperator to conditions that don't have it
          this.localConditions.forEach((condition, index) => {
            // Add unique ID if missing
            if (!condition.id) {
              condition.id = `condition-${Date.now()}-${index}`
            }

            // Add logicalOperator if missing (migrate from old global operator)
            if (!Object.prototype.hasOwnProperty.call(condition, 'logicalOperator')) {
              // Use global operator if available, otherwise default to AND
              condition.logicalOperator = this.filterRules.operator || 'AND'
            }

            // Initialize validation state for restored conditions
            this.$set(this.conditionValidation, index, {
              isValid: true,
              errorMessage: ''
            })

            // Validate the restored value
            if (condition.value && condition.value !== '') {
              this.validateConditionValue(index)
            }
          })

          console.log('[Step 4] Restored and migrated conditions:', this.localConditions.length)
        }

        // Restore expression
        if (this.filterRules.expression && typeof this.filterRules.expression === 'string') {
          this.generatedExpression = this.filterRules.expression
        }

        // Restore available fields
        if (this.filterRules.availableFields && Array.isArray(this.filterRules.availableFields) && this.filterRules.availableFields.length > 0) {
          this.availableFields = JSON.parse(JSON.stringify(this.filterRules.availableFields))
        }
      } catch (error) {
        console.error('[Step 4] Error restoring state:', error)
        // Don't notify user - this is not critical
      }
    },

    /**
     * Check if a field path exists in the sample data
     * @param {string} fieldPath - Field path (e.g., "@.user.name")
     * @returns {boolean} - True if field exists in sample data
     */
    checkFieldExistsInSampleData (fieldPath) {
      try {
        // Normalize the field path
        const normalizedPath = fieldPath.replace(/^[@$]\./, '')

        // Check if field exists in availableFields
        const fieldExists = this.availableFields.some(f =>
          f.label === fieldPath ||
          f.label === `@.${normalizedPath}` ||
          f.path === fieldPath ||
          f.path === normalizedPath
        )

        console.log(`[Step 4] Field existence check: "${fieldPath}" → ${fieldExists}`)
        return fieldExists
      } catch (error) {
        console.error('[Step 4] Error checking field existence:', error)
        return false
      }
    },

    /**
     * Check if a field is marked as missing from sample data
     * @param {string} fieldPath - The field path to check
     * @returns {boolean} - True if field is missing
     */
    isFieldMissing (fieldPath) {
      return this.missingPolicyFields.some(f => f.path === fieldPath)
    },

    /**
     * Get warning message for a missing field
     * @param {string} fieldPath - The field path
     * @returns {string} - Warning message
     */
    getFieldWarningMessage (fieldPath) {
      const missing = this.missingPolicyFields.find(f => f.path === fieldPath)
      return missing?.message || ''
    },

    /**
     * Pre-fill Step 4 from uploaded policy data (Update mode)
     * Extracts filter configuration from policy and populates UI
     * @param {Object} policyData - The uploaded policy data
     * @async
     */
    async prefillFromPolicy (policyData) {
      try {
        console.log('╔══════════════════════════════════════════════════════════════════════════════')
        console.log('║ [Step 4] prefillFromPolicy: Starting pre-fill process')
        console.log('╠══════════════════════════════════════════════════════════════════════════════')
        console.log('║ policyData:', JSON.stringify(policyData, null, 2))
        console.log('╚══════════════════════════════════════════════════════════════════════════════')

        // Wait for field extraction to complete
        await this.$nextTick()
        await this.$nextTick()

        // Extract filter expression from policy
        const filterExpression = policyData?.filter || policyData?.Filter || ''

        if (!filterExpression || typeof filterExpression !== 'string') {
          console.log('[Step 4] No filter expression found in policy')
          return
        }

        console.log('[Step 4] Found filter expression in policy:', filterExpression)

        // Parse the filter expression
        const parseResult = FilterRuleService.parseFilterExpression(filterExpression)

        if (!parseResult.success || !parseResult.conditions || parseResult.conditions.length === 0) {
          console.error('[Step 4] Failed to parse filter expression:', parseResult.error)
          this.$q.notify({
            type: 'warning',
            message: 'Could not parse filter expression from policy',
            caption: parseResult.error || 'Invalid filter format',
            position: 'top',
            timeout: 4000
          })
          return
        }

        console.log('[Step 4] Successfully parsed', parseResult.conditions.length, 'conditions')

        // Track missing fields
        const missingFields = []

        // Process each parsed condition
        const conditionsToAdd = []

        for (const condition of parseResult.conditions) {
          console.log('╔══════════════════════════════════════════════════════════════════════════════')
          console.log('║ [Step 4] Processing condition from policy')
          console.log('╠══════════════════════════════════════════════════════════════════════════════')
          console.log('║ Field:', condition.field)
          console.log('║ Operator:', condition.operator)
          console.log('║ Value:', condition.value)
          console.log('║ Logical Operator:', condition.logicalOperator)
          console.log('╚══════════════════════════════════════════════════════════════════════════════')

          // Check if field exists in sample data
          const fieldExists = this.checkFieldExistsInSampleData(condition.field)

          if (!fieldExists) {
            console.warn('║ ❌ Field from policy NOT FOUND in sample data:', condition.field)

            // Inject missing field into availableFields
            const normalizedPath = condition.field.replace(/^@\./, '')
            const syntheticField = {
              path: normalizedPath,
              label: condition.field,
              type: condition.fieldType || 'string',
              sampleValues: [],
              isNested: normalizedPath.includes('.') || normalizedPath.includes('['),
              isMissing: true
            }

            // Add to availableFields
            this.availableFields.push(syntheticField)

            // Track as missing
            missingFields.push({
              type: 'filter',
              path: condition.field,
              message: 'Field defined in policy but not found in current sample data',
              reason: 'missing'
            })

            console.log('║ ✓ Injected missing field into availableFields:', condition.field)
          } else {
            console.log('║ ✅ Field from policy FOUND in sample data:', condition.field)

            // Update field type from availableFields
            const matchingField = this.availableFields.find(f =>
              f.label === condition.field ||
              f.label === `@.${condition.field.replace(/^@\./, '')}`
            )

            if (matchingField && matchingField.type) {
              condition.fieldType = matchingField.type
            }
          }

          // Add condition to the list
          conditionsToAdd.push(condition)
        }

        // Store missing fields
        this.missingPolicyFields = missingFields

        // Set local conditions
        this.localConditions = conditionsToAdd

        // Initialize validation state for all conditions
        conditionsToAdd.forEach((condition, index) => {
          this.$set(this.conditionValidation, index, {
            isValid: true,
            errorMessage: ''
          })
        })

        // Update filter expression
        this.updateFilterExpression()

        // Update Vuex store
        this.UPDATE_FILTER_RULES({
          conditions: [...this.localConditions],
          expression: this.generatedExpression,
          availableFields: [...this.availableFields]
        })

        console.log('╔══════════════════════════════════════════════════════════════════════════════')
        console.log('║ [Step 4] Pre-fill completed successfully')
        console.log('╠══════════════════════════════════════════════════════════════════════════════')
        console.log('║ Total conditions loaded:', this.localConditions.length)
        console.log('║ Missing fields:', missingFields.length)
        console.log('╚══════════════════════════════════════════════════════════════════════════════')

        // Force UI update
        await this.$nextTick()
        this.$forceUpdate()

        // Show success notification
        const missingCount = missingFields.length
        const notificationType = missingCount > 0 ? 'warning' : 'positive'
        const baseMessage = 'Filter configuration loaded from policy'
        const caption = `${this.localConditions.length} condition${this.localConditions.length !== 1 ? 's' : ''} loaded`
        const missingCaption = missingCount > 0
          ? ` (${missingCount} field${missingCount !== 1 ? 's' : ''} not found in sample data)`
          : ''

        this.$q.notify({
          type: notificationType,
          message: baseMessage,
          caption: caption + missingCaption,
          timeout: missingCount > 0 ? 5000 : 3000,
          position: 'top',
          icon: missingCount > 0 ? 'warning' : undefined
        })
      } catch (error) {
        console.error('╔══════════════════════════════════════════════════════════════════════════════')
        console.error('║ [Step 4] Error in prefillFromPolicy:', error)
        console.error('╚══════════════════════════════════════════════════════════════════════════════')

        this.$q.notify({
          type: 'negative',
          message: 'Failed to load filter configuration from policy',
          caption: error.message || 'An unexpected error occurred',
          timeout: 5000,
          position: 'top'
        })
      }
    }

    // ...existing code...
  },

  created () {
    try {
      // Initialize last processed data tracking
      if (this.sampleData && this.sampleData.rawData) {
        this.lastProcessedRawData = this.sampleData.rawData
        console.log('[Step 4] Initialized lastProcessedRawData tracking')
      }

      // Extract fields from sample data
      this.extractFieldsFromSampleData()

      // Restore previous state from store
      this.restoreStateFromStore()

      // Check if in update mode and pre-fill from policy
      if (this.isUpdateMode && this.policyUpload.uploadedPolicyData) {
        console.log('[Step 4] Update mode detected - will pre-fill from policy')

        // Wait for field extraction to complete before prefilling
        this.$nextTick(async () => {
          await this.prefillFromPolicy(this.policyUpload.uploadedPolicyData)
        })
      }
    } catch (error) {
      console.error('[Step 4] Error during initialization:', error)
    }
  },

  beforeDestroy () {
    // Set destroyed flag
    this.isDestroyed = true

    try {
      // Clear any pending timers
      if (this.expressionUpdateTimer) {
        clearTimeout(this.expressionUpdateTimer)
        this.expressionUpdateTimer = null
      }

      // Save current state before component is destroyed (deep clone)
      const filterRules = {
        conditions: JSON.parse(JSON.stringify(this.localConditions)),
        expression: this.generatedExpression
      }

      this.UPDATE_FILTER_RULES(filterRules)
    } catch (error) {
      console.error('[Step 4] Error saving filter rules on destroy:', error)
    }
  }
}
</script>

<style lang="scss" scoped>
.step-filter-config {
  max-width: 1000px;
  margin: 0 auto;
}

.step-header {
  display: flex;
  align-items: flex-start;
  margin-bottom: 2rem;
  padding-bottom: 2rem;
  border-bottom: 1px solid var(--q-color-grey-3);
}

.step-icon {
  margin-right: 1.5rem;
  padding: 1rem;
  background: rgba(25, 118, 210, 0.1);
  border-radius: 12px;
}

.step-title {
  font-size: 2rem;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
}

.step-subtitle {
  font-size: 1.125rem;
  color: var(--q-color-grey-7);
  margin: 0;
}

.step-content {
  margin-bottom: 3rem;
}

.step-actions {
  display: flex;
  justify-content: space-between;
  padding-top: 2rem;
  border-top: 1px solid var(--q-color-grey-3);
}

.wizard-btn {
  padding: 8px 16px;
  border-radius: 6px;
}

/* Card styles */
.card-header {
  background: var(--q-color-grey-1);
  border-bottom: 1px solid var(--q-color-grey-3);
}

.card-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--q-color-grey-9);
  display: flex;
  align-items: center;
  margin-bottom: 0.5rem;
}

.card-description {
  color: var(--q-color-grey-6);
  margin: 0;
  line-height: 1.4;
}

/* Loading state */
.loading-state {
  text-align: center;
  padding: 3rem 2rem;
}

.loading-message {
  color: var(--q-color-grey-7);
  font-size: 1.125rem;
  margin-top: 1rem;
}

/* No fields warning */
.no-fields-warning {
  text-align: center;
  padding: 3rem 2rem;
}

.no-fields-message {
  color: var(--q-color-grey-7);
  font-size: 1.125rem;
  margin-top: 1rem;
}

/* Conditions */
.conditions-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.conditions-title {
  margin: 0;
  font-size: 1.1rem;
  color: var(--q-color-grey-8);
  display: flex;
  align-items: center;
}

/* Reorder Info Banner */
.reorder-info-banner {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  margin-bottom: 1rem;
  background: rgba(33, 150, 243, 0.1);
  border: 1px solid rgba(33, 150, 243, 0.3);
  border-radius: 8px;
  animation: slideIn 0.4s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.reorder-info-text {
  flex: 1;
  font-size: 0.875rem;
  line-height: 1.5;
  color: var(--q-color-grey-8);

  strong {
    color: var(--q-color-primary);
    font-weight: 600;
  }
}

.inline-icon {
  vertical-align: middle;
  margin: 0 2px;
  color: var(--q-color-grey-7);
}

.empty-conditions {
  text-align: center;
  padding: 3rem 2rem;
  background: var(--q-color-grey-1);
  border-radius: 8px;
  margin-bottom: 1rem;
}

.empty-message {
  color: var(--q-color-grey-7);
  font-size: 1rem;
  margin-top: 1rem;
}

/* Condition wrapper for new layout */
.filter-condition-wrapper {
  margin-bottom: 0;
  cursor: move;
  transition: all 0.3s ease;
  position: relative;

  &.dragging {
    opacity: 0.5;
    transform: scale(0.95);
  }

  &.drag-over {
    transform: translateY(-4px);

    &::before {
      content: '';
      position: absolute;
      top: -4px;
      left: 0;
      right: 0;
      height: 4px;
      background: var(--q-color-primary);
      border-radius: 2px;
      animation: pulse 0.5s ease-in-out infinite alternate;
    }
  }
}

@keyframes pulse {
  from {
    opacity: 0.6;
  }
  to {
    opacity: 1;
  }
}

/* Reorder Controls */
.reorder-controls {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.drag-handle {
  cursor: grab;
  display: flex;
  align-items: center;
  padding: 4px;
  border-radius: 4px;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }

  &:active {
    cursor: grabbing;
    background-color: rgba(255, 255, 255, 0.15);
  }

  .q-icon {
    transition: color 0.2s ease;
  }

  &:hover .q-icon {
    color: var(--q-color-primary) !important;
  }
}

.reorder-buttons {
  display: flex;
  gap: 4px;
}

.condition-number {
  color: rgba(255, 255, 255, 0.7);
  font-size: 13px;
  font-weight: 500;
  margin-left: auto;
  padding: 4px 12px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
}

/* Condition Card with enhanced styling */
.condition-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 8px;
  margin-bottom: 0;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(255, 255, 255, 0.2);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
}

.condition-row {
  display: flex;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 8px;
}

.condition-field {
  flex: 1;
  min-width: 150px;
}

.condition-operator {
  flex: 1;
  min-width: 120px;
}

.condition-value {
  flex: 2;
  min-width: 150px;
}

.condition-value-group {
  flex: 2;
  min-width: 150px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.case-insensitive-checkbox {
  margin-left: 4px;
  font-size: 13px;
}

.condition-value-placeholder {
  flex: 2;
  min-width:  150px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px 12px;
  border: 1px solid rgba(0, 200, 83, 0.3);
  border-radius: 4px;
  background: rgba(0, 200, 83, 0.05);
  color: var(--q-color-positive);
  font-size: 14px;
  font-weight: 500;
  cursor: help;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(0, 200, 83, 0.1);
    border-color: rgba(0, 200, 83, 0.5);
  }

  .placeholder-text {
    color: var(--q-color-positive);
  }
}

/* Logical Operator Section with Visual Connectors */
.logical-operator-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 12px 0;
  padding: 8px 0;
}

/* Connector Lines with Color Coding */
.connector-line {
  width: 2px;
  height: 20px;
  transition: background-color 0.3s ease, box-shadow 0.3s ease;

  &.connector-and {
    background: rgba(2, 183, 254, 0.7); // Primary blue
    box-shadow: 0 0 4px rgba(2, 183, 254, 0.4);
  }

  &.connector-or {
    background: rgba(156, 39, 176, 0.7); // Purple accent
    box-shadow: 0 0 4px rgba(156, 39, 176, 0.4);
  }
}

/* Logical Operator Radio Group Styling */
.logical-operator-radio-group {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 24px;
  padding: 8px 16px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.05);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.logical-operator-radio {
  ::v-deep .q-radio__label {
    font-weight: 600;
    font-size: 13px;
    text-transform: uppercase;
    letter-spacing: 0.5px;

    color: rgba(255, 255, 255, 0.8);
  }

  ::v-deep .q-radio__inner {
    transition: all 0.2s ease;
  }

  &:hover ::v-deep .q-radio__inner {
    transform: scale(1.1);
  }

  // Enhanced checked state styling for AND (primary color - blue)
  &--and ::v-deep .q-radio__inner {
    .q-radio__bg {
      transition: all 0.2s ease;
    }
  }

  &--and.q-radio--truthy ::v-deep .q-radio__inner .q-radio__bg {
    color: #02b7fe !important; // Primary blue
    border-color: #02b7fe !important;
    background: rgba(2, 183, 254, 0.2);
  }

  // Enhanced checked state styling for OR (accent color - purple)
  &--or ::v-deep .q-radio__inner {
    .q-radio__bg {
      transition: all 0.2s ease;
    }
  }

  &--or.q-radio--truthy ::v-deep .q-radio__inner .q-radio__bg {
    color: #9C27B0 !important; // Purple accent
    border-color: #9C27B0 !important;
    background: rgba(156, 39, 176, 0.2);
  }

  // Ensure proper inner circle visibility when checked
  ::v-deep .q-radio__inner--truthy {
    .q-radio__check {
      opacity: 1 !important;
      transform: scale(1) !important;
    }
  }

  // Unchecked state - dimmed but visible
  &:not(.q-radio--truthy) ::v-deep .q-radio__inner .q-radio__bg {
    border-color: rgba(255, 255, 255, 0.3);
    opacity: 0.6;
  }

  // Hover state for unchecked
  &:not(.q-radio--truthy):hover ::v-deep .q-radio__inner .q-radio__bg {
    border-color: rgba(255, 255, 255, 0.5);
    opacity: 0.8;
  }
}

/* Add Condition Button with Blue Background */
.add-condition-btn {
  min-width: 200px;
  border-radius: 8px;
  font-weight: 500;
  padding: 10px 20px;
  transition: all 0.3s ease;
  background-color: var(--q-color-primary);
  color: white;

  &:hover:not([disabled]) {
    background-color: #1976d2 !important; // Slightly darker blue
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(33, 150, 243, 0.4);
  }

  ::v-deep .q-btn__content {
    color: white;
  }

  &[disabled] {
    opacity: 0.6;
  }
}

/* Copy Expression Button - matching Add Condition button style */
.copy-expression-btn {
  min-width: 180px;
  border-radius: 8px;
  font-weight: 500;
  padding: 10px 20px;
  transition: all 0.3s ease;
  background-color: var(--q-color-primary);
  color: white;

  &:hover:not([disabled]) {
    background-color: #1976d2 !important; // Slightly darker blue
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(33, 150, 243, 0.4);
  }

  ::v-deep .q-btn__content {
    color: white;
  }

  ::v-deep .q-icon {
    color: white;
  }

  &[disabled] {
    opacity: 0.6;
    cursor: not-allowed;
  }
}

/* Expression preview */
.preview-title {
  margin-top: 0;
  margin-bottom: 1rem;
  font-size: 1.1rem;
  color: var(--q-color-grey-8);
}

.expression-card {
  background-color: var(--q-color-grey-1);
  border-radius: 6px;
}

.filter-expression {
  font-family: monospace;
  font-size: 0.95rem;
  white-space: pre-wrap;
  word-break: break-word;
  color: var(--q-color-primary);
  display: block;
  padding: 0.5rem;
}

.no-expression {
  color: var(--q-color-grey-6);
  font-style: italic;
  padding: 0.5rem;
}

/* Accessibility - screen reader only text */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}

/* Style the q-select input fields to have proper contrast */
::v-deep .condition-field,
::v-deep .condition-operator,
::v-deep .condition-value {
  .q-field__control {
    background-color: #ffffff !important;
    color: #000000 !important;
  }

  .q-field__native,
  .q-field__input {
    color: #000000 !important;
    background-color: transparent !important;
  }

  .q-field__label {
    color: rgba(0, 0, 0, 0.6) !important;
  }

  .q-field__control:before {
    border-color: rgba(0, 0, 0, 0.24) !important;
  }

  &.q-field--focused .q-field__label {
    color: var(--q-color-primary) !important;
  }

  &.q-field--focused .q-field__control:before {
    border-color: var(--q-color-primary) !important;
  }

  // Error state styling with better visibility
  &.q-field--error .q-field__label {
    color: #ff0000 !important;
    font-weight: 500;
  }

  &.q-field--error .q-field__control:before {
    border-color: #ff0000 !important;
    border-width: 2px !important;
  }

  &.q-field--error .q-field__control:after {
    border-color: #ff0000 !important;
  }

  // Error message styling
  .q-field__messages {
    color: #ff0000 !important;
    font-weight: 600;
    font-size: 13px;
    margin-top: 6px;
    padding: 0 12px;
    min-height: 20px;
    display: block !important;
    visibility: visible !important;
  }

  .q-field__bottom {
    padding-top: 6px;
    min-height: 24px;

    > div {
      color: #ff0000 !important;
      font-weight: 600;
      font-size: 13px;
      display: block !important;
      visibility: visible !important;
    }
  }

  // Ensure error messages are always shown when field has error
  &.q-field--error {
    .q-field__bottom {
      display: block !important;
      visibility: visible !important;
    }

    .q-field__messages {
      display: block !important;
      visibility: visible !important;
    }
  }

  // Ensure the selected value is visible
  .q-field__marginal {
    color: #000000 !important;
  }

  // Error icon visibility
  &.q-field--error .q-field__append {
    .q-icon {
      color: #ff0000 !important;
    }
  }

  // Style the actual text display area
  input {
    color: #000000 !important;
    background-color: transparent !important;
  }

  // For use-input mode in q-select
  .q-field__control-container {
    input {
      color: #000000 !important;
      background-color: transparent !important;
    }
  }
}

/* Dropdown styling with black background and white text */
::v-deep .dropdown-dark {
  background-color: #000000 !important;
}

::v-deep .dropdown-dark .q-menu {
  background-color: #000000 !important;
}

::v-deep .dropdown-dark .q-virtual-scroll__content {
  background-color: #000000 !important;
}

::v-deep .dropdown-dark .q-list {
  background-color: #000000 !important;
}

::v-deep .dropdown-dark .q-item {
  color: #ffffff !important;
  background-color: #000000 !important;
  transition: background-color 0.2s ease, color 0.2s ease;
}

::v-deep .dropdown-dark .q-item:hover,
::v-deep .dropdown-dark .q-item--active,
::v-deep .dropdown-dark .q-manual-focusable--focused {
  background-color: #2196f3 !important;
  color: #ffffff !important;
}

::v-deep .dropdown-dark .q-item__label {
  color: #ffffff !important;
}

::v-deep .dropdown-dark .q-item:hover .q-item__label,
::v-deep .dropdown-dark .q-item--active .q-item__label,
::v-deep .dropdown-dark .q-manual-focusable--focused .q-item__label {
  color: #ffffff !important;
}

::v-deep .dropdown-dark .q-item__label--caption {
  color: #b0b0b0 !important;
}

::v-deep .dropdown-dark .q-item:hover .q-item__label--caption,
::v-deep .dropdown-dark .q-item--active .q-item__label--caption,
::v-deep .dropdown-dark .q-manual-focusable--focused .q-item__label--caption {
  color: #e3f2fd !important;
}

/* Ensure the dropdown item has proper styling */
::v-deep .dropdown-item {
  color: #ffffff !important;
  background-color: transparent !important;
}

::v-deep .dropdown-item:hover {
  background-color: #2196f3 !important;
}

::v-deep .q-select__dropdown-icon {
  color: var(--q-color-primary) !important;
}

/* Responsive */
@media (max-width: 768px) {
  .condition-row {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }

  .condition-field,
  .condition-operator,
  .condition-value {
    width: 100% !important;
    min-width: unset;
    flex: 1 1 100%;
  }

  .logical-operator-radio-group {
    width: 100%;
    max-width: 300px;
    justify-content: space-around;
  }

  .add-condition-btn {
    width: 100%;
    min-width: unset;
  }

  .logical-operator-section {
    margin: 16px 0;
  }

  .reorder-controls {
    flex-wrap: wrap;
  }

  .condition-number {
    order: -1;
    flex: 1 1 100%;
    text-align: center;
    margin-left: 0;
    margin-bottom: 8px;
  }

  .drag-handle {
    flex: 1;
  }

  .reorder-buttons {
    flex: 1;
    justify-content: flex-end;
  }

  .reorder-info-banner {
    flex-direction: column;
    align-items: flex-start;
    padding: 10px 12px;

    .q-icon:first-child {
      margin-bottom: 8px;
    }
  }

  .reorder-info-text {
    font-size: 0.8125rem;
  }
}
</style>

<style lang="scss">
/* Global unscoped styles for dropdown menus */
.dropdown-dark.q-menu {
  background-color: #000000 !important;
}

.dropdown-dark {
  background-color: #000000 !important;

  .q-menu {
    background-color: #000000 !important;
  }

  .q-virtual-scroll__content {
    background-color: #000000 !important;
  }

  .q-list {
    background-color: #000000 !important;
  }

  .q-item {
    color: #ffffff !important;
    background-color: #000000 !important;
    transition: background-color 0.2s ease, color 0.2s ease;

    &:hover,
    &.q-item--active,
    &.q-manual-focusable--focused {
      background-color: #2196f3 !important;
      color: #ffffff !important;
    }
  }

  .q-item__label {
    color: #ffffff !important;
  }

  .q-item:hover .q-item__label,
  .q-item--active .q-item__label,
  .q-manual-focusable--focused .q-item__label {
    color: #ffffff !important;
  }

  .q-item__label--caption {
    color: #b0b0b0 !important;
  }

  .q-item:hover .q-item__label--caption,
  .q-item--active .q-item__label--caption,
  .q-manual-focusable--focused .q-item__label--caption {
    color: #e3f2fd !important;
  }
}

/* Global styles for condition inputs to ensure white background */
.condition-field,
.condition-operator,
.condition-value {
  input {
    color: #000000 !important;
    background-color: transparent !important;
  }

  .q-field__native {
    color: #000000 !important;
  }

  .q-field__control {
    background-color: #ffffff !important;
  }
}
</style>
