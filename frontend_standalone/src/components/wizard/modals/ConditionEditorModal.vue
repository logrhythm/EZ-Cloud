<template>
  <q-dialog
    :value="value"
    @input="$emit('input', $event)"
    persistent
    :maximized="false"
    transition-show="scale"
    transition-hide="scale"
  >
    <q-card class="condition-editor-modal" style="max-width: 900px; width: 90vw; max-height: 90vh;">
      <!-- Header -->
      <q-card-section class="modal-header row items-center">
        <div class="text-h6">Edit Condition</div>
        <q-space />
        <q-btn
          icon="close"
          flat
          round
          dense
          @click="closeModal"
        />
      </q-card-section>

      <q-separator />

      <!-- Content -->
      <q-card-section class="modal-content">
        <div class="condition-builder">
          <!-- Instructions Banner -->
          <div class="instructions-banner q-mb-md">
            <q-icon name="info" size="20px" class="q-mr-sm" />
            <div class="instructions-text">
              Build a filter expression to determine when this SubTransform should apply.
              Conditions are evaluated against your parsed JSON data.
            </div>
          </div>

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
                >
                  {{ localConditions.length }}
                </q-chip>
              </h6>
            </div>

            <!-- Empty State -->
            <div v-if="localConditions.length === 0" class="empty-conditions">
              <q-icon name="info" size="48px" color="grey-6" />
              <p class="empty-message">
                No filter conditions defined yet.
                Click "Add Condition" below to create your first filter.
              </p>
            </div>

            <!-- Condition Cards -->
            <div
              v-for="(condition, index) in localConditions"
              :key="condition.id || `condition-${index}`"
              class="filter-condition-wrapper"
            >
              <!-- Condition Card -->
              <q-card flat bordered class="condition-card">
                <q-card-section>
                  <!-- Reorder Controls Row -->
                  <div class="reorder-controls">
                    <div class="drag-handle">
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
                        :disable="index === 0"
                        @click="moveConditionUp(index)"
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
                        :disable="index === localConditions.length - 1"
                        @click="moveConditionDown(index)"
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
                    <q-select
                      v-model="condition.field"
                      :options="fieldOptions"
                      outlined
                      dense
                      label="Field"
                      class="condition-field"
                      emit-value
                      map-options
                      options-dense
                      bg-color="white"
                      color="primary"
                      popup-content-class="dropdown-dark"
                      @input="(value) => onFieldChange(index, value)"
                    >
                      <template v-slot:option="scope">
                        <q-item
                          v-bind="scope.itemProps"
                          v-on="scope.itemEvents"
                        >
                          <q-item-section>
                            <q-item-label>
                              <span v-if="scope.opt.isJsonField" class="json-field-indicator">
                                <q-icon name="data_object" color="info" size="xs" />
                              </span>
                              {{ scope.opt.label }}
                              <q-badge
                                v-if="scope.opt.fanoutParent"
                                color="blue"
                                text-color="white"
                                class="q-ml-xs"
                              >
                                Has Fanout
                              </q-badge>
                            </q-item-label>
                            <q-item-label caption>
                              <span>{{ scope.opt.type }}</span>
                              <span v-if="scope.opt.isJsonField" class="json-field-tag">JSON</span>
                            </q-item-label>
                            <q-item-label v-if="scope.opt.fanoutParent" caption>
                              Fanout: {{ scope.opt.fanoutParent }}
                            </q-item-label>
                          </q-item-section>
                        </q-item>
                      </template>
                    </q-select>

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
                      options-dense
                      bg-color="white"
                      color="primary"
                      popup-content-class="dropdown-dark"
                      @input="(value) => onOperatorChange(index, value)"
                    />

                    <!-- Value Input (Hidden for 'exists' operator) -->
                    <q-select
                      v-if="condition.operator !== 'exists'"
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
                      :error="!!(conditionValidation[index] && !conditionValidation[index].isValid)"
                      :error-message="conditionValidation[index] && conditionValidation[index].errorMessage || ''"
                      @input-value="(val) => onValueInputChange(index, val)"
                      @new-value="(inputValue, doneFn) => onValueNew(index, inputValue, doneFn)"
                    >
                      <template v-slot:no-option>
                        <q-item>
                          <q-item-section class="text-grey">
                            Type to enter a custom value
                          </q-item-section>
                        </q-item>
                      </template>
                    </q-select>

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
                      @click="removeCondition(index)"
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
                    @input="() => onLogicalOperatorChange(index)"
                    class="logical-operator-radio logical-operator-radio--and"
                  />
                  <q-radio
                    v-model="condition.logicalOperator"
                    val="OR"
                    label="OR"
                    color="accent"
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
            <div class="q-mt-md">
              <q-btn
                unelevated
                color="primary"
                icon="add"
                label="Add Condition"
                :disable="availableFields.length === 0"
                @click="addCondition"
                no-caps
                class="add-condition-btn"
              />
            </div>
          </div>

          <q-separator class="q-my-md" />

          <!-- Filter Expression Preview -->
          <div class="filter-preview">
            <h6 class="preview-title">Generated Filter Expression</h6>

            <q-card flat bordered class="expression-card">
              <q-card-section>
                <code v-if="generatedExpression" class="filter-expression">
                  {{ generatedExpression }}
                </code>
                <div v-else class="no-expression">
                  No filter expression generated yet
                </div>
              </q-card-section>
            </q-card>
          </div>
        </div>
      </q-card-section>

      <q-separator />

      <!-- Footer Actions -->
      <q-card-actions align="right" class="modal-actions">
        <q-btn
          flat
          label="Cancel"
          color="grey"
          @click="closeModal"
          no-caps
        />
        <q-btn
          unelevated
          label="Save Condition"
          color="primary"
          icon="check"
          :disable="!generatedExpression"
          @click="saveCondition"
          no-caps
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>
import { mapState } from 'vuex'
import { FilterRuleService } from '../../../services/wizard/filterRuleService'

export default {
  name: 'ConditionEditorModal',

  props: {
    value: {
      type: Boolean,
      default: false
    },
    condition: {
      type: String,
      default: ''
    }
  },

  emits: ['input', 'save'],

  data () {
    return {
      localConditions: [],
      availableFields: [],
      generatedExpression: '',
      conditionValidation: {},
      expressionUpdateTimer: null
    }
  },

  computed: {
    ...mapState('wizard', ['sampleData']),

    // Get fanout arrays from Vuex (same as TransformEditorModal)
    fanoutArrays () {
      return this.$store.getters['wizard/getFanoutArrays']
    },

    fieldOptions () {
      try {
        if (!Array.isArray(this.availableFields)) {
          return []
        }

        console.log('╔════════════════════════════════════════════════════════════════════════')
        console.log('║ [ConditionEditorModal] Computing fieldOptions')
        console.log('╠════════════════════════════════════════════════════════════════════════')
        console.log(`║ Total available fields: ${this.availableFields.length}`)

        // Count fields from JSON strings
        const jsonStringFields = this.availableFields.filter(f => f.isFromJsonString)
        console.log(`║ Fields from JSON strings: ${jsonStringFields.length}`)

        // Count normal fields
        const normalFields = this.availableFields.filter(f => !f.isFromJsonString)
        console.log(`║ Normal fields: ${normalFields.length}`)

        const uniqueFields = []
        const seenValues = new Set()

        for (const field of this.availableFields) {
          const value = field.label || ''
          const path = field.path || ''
          const isJsonField = field.isFromJsonString || false
          const fanoutParent = field.fanoutParent || null

          if (value && !seenValues.has(value)) {
            seenValues.add(value)
            uniqueFields.push({
              label: field.label || '',
              value: field.label || '',
              type: field.type || 'unknown',
              sampleValues: field.sampleValues || [],
              path: path,
              isJsonField: isJsonField,
              fanoutParent: fanoutParent // ADD fanout parent to field options (SAME as TransformEditorModal)
            })
          }
        }

        console.log(`║ Unique field options: ${uniqueFields.length}`)
        console.log(`║ Field options with fanout: ${uniqueFields.filter(f => f.fanoutParent).length}`)

        // Log sample fields for verification
        if (uniqueFields.length > 0) {
          console.log('║ Sample normal fields:')
          uniqueFields.filter(f => !f.isJsonField).slice(0, 3)
            .forEach(f => console.log(`║   - ${f.label} (${f.type})${f.fanoutParent ? ` [Fanout: ${f.fanoutParent}]` : ''}`))

          console.log('║ Sample JSON string fields:')
          uniqueFields.filter(f => f.isJsonField).slice(0, 3)
            .forEach(f => console.log(`║   - ${f.label} (${f.type})${f.fanoutParent ? ` [Fanout: ${f.fanoutParent}]` : ''}`))
        }

        console.log('╚════════════════════════════════════════════════════════════════════════')

        return uniqueFields
      } catch (error) {
        console.error('[ConditionEditorModal] Error formatting field options:', error)
        return []
      }
    }
  },

  watch: {
    value: {
      immediate: true,
      handler (newVal) {
        console.log('[ConditionEditorModal] value changed to:', newVal)
        if (newVal) {
          console.log('[ConditionEditorModal] Initializing modal...')
          this.initializeModal()
        }
      }
    },
    condition: {
      immediate: false,
      handler (newVal, oldVal) {
        console.log('[ConditionEditorModal] condition prop changed:', {
          old: oldVal,
          new: newVal,
          dialogOpen: this.value
        })
        // Re-initialize if dialog is already open and condition changes
        if (this.value && newVal !== oldVal) {
          console.log('[ConditionEditorModal] Re-initializing with new condition...')
          this.initializeModal()
        }
      }
    }
  },

  methods: {
    initializeModal () {
      console.log('[ConditionEditorModal] ========== INITIALIZE MODAL ==========')
      console.log('[ConditionEditorModal] Existing condition prop:', this.condition)

      // Extract fields from sample data
      this.extractFieldsFromSampleData()

      console.log('[ConditionEditorModal] Available fields extracted:', this.availableFields.length)
      console.log('[ConditionEditorModal] Field options:', JSON.parse(JSON.stringify(this.fieldOptions)))

      // Parse existing condition
      if (this.condition) {
        console.log('[ConditionEditorModal] Parsing existing condition...')
        this.parseExistingCondition(this.condition)
      } else {
        console.log('[ConditionEditorModal] No existing condition, starting fresh')
        this.localConditions = []
        this.generatedExpression = ''
      }

      console.log('[ConditionEditorModal] Initialization complete, localConditions:', JSON.parse(JSON.stringify(this.localConditions)))
      console.log('[ConditionEditorModal] ========== INITIALIZE MODAL END ==========')
    },

    extractFieldsFromSampleData () {
      try {
        const data = this.sampleData
        const schemaRules = this.$store.state.wizard.schemaRules

        if (!data || !data.parsedData || !data.dataStructure) {
          this.availableFields = []
          return
        }

        console.log('╔════════════════════════════════════════════════════════════════════════')
        console.log('║ [ConditionEditorModal] extractFieldsFromSampleData - START')
        console.log('╠════════════════════════════════════════════════════════════════════════')
        console.log('║ Using MappingService.extractJsonPaths (same as Step 5 Source Field dropdown)')

        // Import MappingService to use the same field extraction as Step 5
        const MappingService = require('../../../services/wizard/mappingService').MappingService

        // Use MappingService.extractJsonPaths - SAME as Step 5's Source Field dropdown
        const jsonPaths = MappingService.extractJsonPaths(
          data.parsedData,
          data.dataStructure,
          {
            jsonToStringFields: schemaRules?.convertToJson || [],
            parsedStringifiedFields: schemaRules?.parsedStringifiedJsonFields || {}
          }
        )

        console.log('║ Total JSON paths extracted:', jsonPaths.length)
        console.log('║ Fanout arrays:', JSON.stringify(this.fanoutArrays))
        console.log('║ Fanout arrays count:', this.fanoutArrays.length)

        // Convert to the format expected by ConditionEditorModal
        // MappingService returns: { label, value, type, sampleValue }
        // We need: { label, value, type, sampleValues, path, isJsonField, fanoutParent }
        this.availableFields = jsonPaths.map(pathObj => {
          // Determine if this is from a JSON string field by checking if it contains parsed field markers
          const isFromJsonString = pathObj.label?.includes('(parsed)') || false

          // Get the absolute path and NORMALIZE array indices [0], [1], [2] to [*]
          // This ensures paths like $.teamMembers[0].name become $.teamMembers[*].name
          let absolutePath = pathObj.value || ''
          absolutePath = absolutePath.replace(/\[(\d+)\]/g, '[*]')

          // Use MappingService.resolvePathForFanout to get fanout information (SAME as TransformEditorModal)
          const resolved = MappingService.resolvePathForFanout(absolutePath, this.fanoutArrays)

          console.log(`║ Field: ${absolutePath} → Resolved: ${resolved.jsonPath}, Fanout: ${resolved.fanoutParent || 'none'}`)

          // Use the RESOLVED path (relative to fanout) as label and value
          // This ensures fields within fanout arrays show as $.id instead of $.teamMembers[*].id
          return {
            label: resolved.jsonPath, // Use resolved relative path (e.g., $.id for fanout fields)
            value: resolved.jsonPath, // Use resolved relative path as value
            type: pathObj.type || 'string',
            sampleValues: pathObj.sampleValue ? [pathObj.sampleValue] : [],
            path: resolved.jsonPath, // Use resolved path
            isJsonField: isFromJsonString,
            isFromJsonString: isFromJsonString,
            fanoutParent: resolved.fanoutParent // ADD fanout parent information (SAME as TransformEditorModal)
          }
        })

        console.log('║ Total available fields:', this.availableFields.length)
        console.log('║ Fields from JSON-to-String fields:',
          this.availableFields.filter(f => f.isFromJsonString).length)

        // Log sample fields for debugging
        if (this.availableFields.length > 0) {
          const normalFields = this.availableFields.filter(f => !f.isFromJsonString).slice(0, 3)
          const jsonStringFields = this.availableFields.filter(f => f.isFromJsonString).slice(0, 3)

          console.log('║ Sample normal fields:')
          normalFields.forEach(f => console.log(`║   - ${f.path} (${f.type})`))

          if (jsonStringFields.length > 0) {
            console.log('║ Sample JSON string fields:')
            jsonStringFields.forEach(f => console.log(`║   - ${f.path} (${f.type})`))
          }
        }

        console.log('╚════════════════════════════════════════════════════════════════════════')
      } catch (error) {
        console.error('[ConditionEditorModal] Error extracting fields:', error)
        this.availableFields = []
      }
    },

    parseExistingCondition (conditionString) {
      try {
        console.log('[ConditionEditorModal] parseExistingCondition called with:', conditionString)

        // Use FilterRuleService's robust parser instead of custom parsing
        const parseResult = FilterRuleService.parseFilterExpression(conditionString)

        console.log('[ConditionEditorModal] Parse result:', JSON.parse(JSON.stringify(parseResult)))

        if (!parseResult.success || !parseResult.conditions || parseResult.conditions.length === 0) {
          console.warn('[ConditionEditorModal] Failed to parse condition or no conditions found')
          this.localConditions = []
          this.updateFilterExpression()
          return
        }

        // Match parsed conditions with available fields to get correct field types
        const conditions = parseResult.conditions.map(parsedCondition => {
          const fieldInfo = this.availableFields.find(f => f.label === parsedCondition.field)

          return {
            id: parsedCondition.id || `condition-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            field: parsedCondition.field,
            operator: parsedCondition.operator,
            value: parsedCondition.value || '',
            fieldType: fieldInfo?.type || parsedCondition.fieldType || 'string',
            logicalOperator: parsedCondition.logicalOperator || 'AND',
            caseInsensitive: parsedCondition.caseInsensitive
          }
        })

        console.log('[ConditionEditorModal] Mapped conditions with field types:', JSON.parse(JSON.stringify(conditions)))

        this.localConditions = conditions
        this.updateFilterExpression()
      } catch (error) {
        console.error('[ConditionEditorModal] Error parsing condition:', error)
        this.localConditions = []
      }
    },

    addCondition () {
      console.log('[ConditionEditorModal] ========== ADD CONDITION ==========')
      console.log('[ConditionEditorModal] Available fields:', this.availableFields.length)

      if (!Array.isArray(this.availableFields) || this.availableFields.length === 0) {
        console.error('[ConditionEditorModal] No fields available for new condition')
        this.$q.notify({
          type: 'warning',
          message: 'No fields available',
          position: 'top'
        })
        return
      }

      const newIndex = this.localConditions.length
      console.log('[ConditionEditorModal] New condition will be at index:', newIndex)

      const newCondition = {
        id: `condition-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        field: this.availableFields[0]?.label || '',
        operator: '==',
        value: '',
        fieldType: this.availableFields[0]?.type || 'string',
        logicalOperator: 'AND'
      }

      console.log('[ConditionEditorModal] New condition object:', JSON.parse(JSON.stringify(newCondition)))

      this.localConditions.push(newCondition)

      console.log('[ConditionEditorModal] localConditions after push:', JSON.parse(JSON.stringify(this.localConditions)))

      this.$set(this.conditionValidation, newIndex, {
        isValid: true,
        errorMessage: ''
      })

      this.debouncedUpdateExpression()

      console.log('[ConditionEditorModal] ========== ADD CONDITION END ==========')
    },

    removeCondition (index) {
      if (typeof index !== 'number' || index < 0 || index >= this.localConditions.length) {
        return
      }

      this.localConditions.splice(index, 1)
      this.$delete(this.conditionValidation, index)

      // Re-index validation states
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

      this.debouncedUpdateExpression()
    },

    moveConditionUp (index) {
      if (index > 0 && index < this.localConditions.length) {
        const temp = this.localConditions[index]
        this.$set(this.localConditions, index, this.localConditions[index - 1])
        this.$set(this.localConditions, index - 1, temp)
        this.debouncedUpdateExpression()
      }
    },

    moveConditionDown (index) {
      if (index >= 0 && index < this.localConditions.length - 1) {
        const temp = this.localConditions[index]
        this.$set(this.localConditions, index, this.localConditions[index + 1])
        this.$set(this.localConditions, index + 1, temp)
        this.debouncedUpdateExpression()
      }
    },

    onFieldChange (index, value) {
      console.log('[ConditionEditorModal] ========== FIELD CHANGE START ==========')
      console.log('[ConditionEditorModal] onFieldChange called with:', {
        index,
        value,
        valueType: typeof value
      })
      console.log('[ConditionEditorModal] localConditions array length:', this.localConditions.length)
      console.log('[ConditionEditorModal] localConditions BEFORE:', JSON.parse(JSON.stringify(this.localConditions)))

      if (typeof index !== 'number' || index < 0 || index >= this.localConditions.length) {
        console.error('[ConditionEditorModal] Invalid index, returning:', { index, arrayLength: this.localConditions.length })
        return
      }

      const condition = this.localConditions[index]
      console.log('[ConditionEditorModal] Current condition object:', JSON.parse(JSON.stringify(condition)))
      console.log('[ConditionEditorModal] Current condition.field:', condition.field)

      // Create updated condition with new field value
      const conditionWithNewField = { ...condition, field: value }
      console.log('[ConditionEditorModal] Condition with new field:', JSON.parse(JSON.stringify(conditionWithNewField)))

      // Update field type based on selected field
      const updatedCondition = FilterRuleService.updateConditionFieldType(
        conditionWithNewField,
        this.availableFields
      )

      console.log('[ConditionEditorModal] After FilterRuleService.updateConditionFieldType:', JSON.parse(JSON.stringify(updatedCondition)))
      console.log('[ConditionEditorModal] Updated fieldType:', updatedCondition.fieldType)

      // Reset operator and value when field changes
      updatedCondition.operator = '=='
      updatedCondition.value = ''

      console.log('[ConditionEditorModal] Final updatedCondition (with reset operator/value):', JSON.parse(JSON.stringify(updatedCondition)))

      // Use $set to ensure Vue 2 reactivity for array element replacement
      this.$set(this.localConditions, index, updatedCondition)

      console.log('[ConditionEditorModal] localConditions AFTER $set:', JSON.parse(JSON.stringify(this.localConditions)))
      console.log('[ConditionEditorModal] Verify field was set:', this.localConditions[index].field)

      // Reset validation for this condition
      this.$set(this.conditionValidation, index, {
        isValid: true,
        errorMessage: ''
      })

      console.log('[ConditionEditorModal] Validation reset for index:', index)

      // Update the generated expression
      this.debouncedUpdateExpression()

      console.log('[ConditionEditorModal] ========== FIELD CHANGE END ==========')
    },

    onOperatorChange (index, value) {
      console.log('[ConditionEditorModal] onOperatorChange called:', { index, value })

      if (typeof index !== 'number' || index < 0 || index >= this.localConditions.length) {
        console.error('[ConditionEditorModal] Invalid index in onOperatorChange')
        return
      }

      const condition = this.localConditions[index]
      console.log('[ConditionEditorModal] Current condition before operator change:', JSON.parse(JSON.stringify(condition)))

      // Create updated condition with new operator
      const updatedCondition = { ...condition, operator: value }
      console.log('[ConditionEditorModal] Updated condition with new operator:', JSON.parse(JSON.stringify(updatedCondition)))

      // Use $set for Vue 2 reactivity
      this.$set(this.localConditions, index, updatedCondition)

      console.log('[ConditionEditorModal] Operator change complete, condition:', JSON.parse(JSON.stringify(this.localConditions[index])))

      this.debouncedUpdateExpression()
    },

    onValueInputChange (index, val) {
      if (typeof index !== 'number' || index < 0 || index >= this.localConditions.length) {
        return
      }

      const condition = this.localConditions[index]

      if (typeof val === 'string') {
        condition.value = val
        this.validateConditionValue(index)
        this.debouncedUpdateExpression()
      }
    },

    onValueNew (index, inputValue, doneFn) {
      if (typeof index !== 'number' || index < 0 || index >= this.localConditions.length) {
        doneFn(null, 'add-unique')
        return
      }

      if (!inputValue || typeof inputValue !== 'string') {
        doneFn(null, 'add-unique')
        return
      }

      const trimmedValue = inputValue.trim()

      if (trimmedValue === '') {
        doneFn(null, 'add-unique')
        return
      }

      doneFn(trimmedValue, 'add-unique')

      const condition = this.localConditions[index]
      condition.value = trimmedValue

      this.validateConditionValue(index)
      this.debouncedUpdateExpression()
    },

    onLogicalOperatorChange (index) {
      this.debouncedUpdateExpression()
    },

    getOperatorsForCondition (condition) {
      try {
        if (!condition || typeof condition !== 'object') {
          return []
        }

        const fieldType = condition.fieldType || 'string'
        return FilterRuleService.getOperatorsForFieldType(fieldType)
      } catch (error) {
        console.error('[ConditionEditorModal] Error getting operators:', error)
        return []
      }
    },

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
        console.error('[ConditionEditorModal] Error getting sample values:', error)
        return []
      }
    },

    validateConditionValue (index) {
      try {
        if (typeof index !== 'number' || index < 0 || index >= this.localConditions.length) {
          return
        }

        const condition = this.localConditions[index]

        if (!condition) {
          return
        }

        const fieldType = condition.fieldType || 'string'
        const validation = FilterRuleService.validateValueForFieldType(condition.value, fieldType)

        this.$set(this.conditionValidation, index, {
          isValid: validation.isValid,
          errorMessage: validation.errorMessage || ''
        })

        return validation
      } catch (error) {
        console.error('[ConditionEditorModal] Error validating condition value:', error)
        this.$set(this.conditionValidation, index, {
          isValid: true,
          errorMessage: ''
        })
        return { isValid: true, errorMessage: '' }
      }
    },

    getConnectorClass (operator) {
      return operator === 'AND' ? 'connector-and' : 'connector-or'
    },

    debouncedUpdateExpression () {
      if (this.expressionUpdateTimer) {
        clearTimeout(this.expressionUpdateTimer)
      }

      this.expressionUpdateTimer = setTimeout(() => {
        this.updateFilterExpression()
      }, 300)
    },

    updateFilterExpression () {
      try {
        if (!Array.isArray(this.localConditions)) {
          this.generatedExpression = ''
          return
        }

        if (this.localConditions.length === 0) {
          this.generatedExpression = ''
          return
        }

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
            const conditionExpr = FilterRuleService._buildSingleConditionExpression(condition)

            if (expression) {
              const prevCondition = this.localConditions[index - 1]
              const operator = prevCondition && prevCondition.logicalOperator === 'OR' ? ' || ' : ' && '
              expression += operator + conditionExpr
            } else {
              expression = conditionExpr
            }
          } catch (error) {
            console.error(`[ConditionEditorModal] Error building condition ${index}:`, error)
          }
        })

        this.generatedExpression = expression || ''
      } catch (error) {
        console.error('[ConditionEditorModal] Error building filter expression:', error)
        this.generatedExpression = ''
      }
    },

    saveCondition () {
      if (!this.generatedExpression) {
        this.$q.notify({
          type: 'warning',
          message: 'Please define at least one condition',
          position: 'top'
        })
        return
      }

      // Check for incomplete conditions
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
          message: 'All conditions must be complete',
          caption: 'Please fill in all fields (Field, Operator, and Value) for each condition',
          position: 'top'
        })
        return
      }

      // Check for validation errors
      const hasValidationErrors = Object.keys(this.conditionValidation).some(key => {
        const validation = this.conditionValidation[key]
        return validation && !validation.isValid
      })

      if (hasValidationErrors) {
        this.$q.notify({
          type: 'warning',
          message: 'Please fix validation errors before saving',
          position: 'top'
        })
        return
      }

      this.$emit('save', this.generatedExpression)
      this.closeModal()
    },

    closeModal () {
      this.$emit('input', false)
    }
  },

  beforeDestroy () {
    if (this.expressionUpdateTimer) {
      clearTimeout(this.expressionUpdateTimer)
      this.expressionUpdateTimer = null
    }
  }
}
</script>

<style lang="scss" scoped>
.condition-editor-modal {
  display: flex;
  flex-direction: column;

  .modal-header {
    background: var(--q-color-grey-10);
    color: white;
  }

  .modal-content {
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
    padding: 24px;
    max-height: calc(90vh - 140px); /* Account for header and footer */
  }

  .modal-actions {
    padding: 16px 24px;
    background: var(--q-color-grey-1);
  }
}

.condition-builder {
  max-width: 1000px;
  margin: 0 auto;
}

.instructions-banner {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  background: rgba(33, 150, 243, 0.1);
  border-left: 4px solid #2196F3;
  border-radius: 8px;

  .instructions-text {
    flex: 1;
    font-size: 14px;
    line-height: 1.5;
  }
}

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

.filter-condition-wrapper {
  margin-bottom: 0;
}

.condition-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 8px;
  margin-bottom: 0;
}

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

.condition-row {
  display: flex;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 8px;
}

.condition-field {
  flex: 2;
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

.condition-value-placeholder {
  flex: 2;
  min-width: 150px;
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

.logical-operator-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 12px 0;
  padding: 8px 0;
}

.connector-line {
  width: 2px;
  height: 20px;

  &.connector-and {
    background: rgba(2, 183, 254, 0.7);
  }

  &.connector-or {
    background: rgba(156, 39, 176, 0.7);
  }
}

.logical-operator-radio-group {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 24px;
  padding: 8px 16px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.05);
}

.add-condition-btn {
  min-width: 200px;
  border-radius: 8px;
  font-weight: 500;
  padding: 10px 20px;
}

.filter-preview {
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
}

// Dark mode input styles
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
  }

  .q-field__label {
    color: rgba(0, 0, 0, 0.6) !important;
  }
}
</style>

<style lang="scss">
// Global dropdown styles
.dropdown-dark.q-menu {
  background-color: #000000 !important;

  .q-item {
    color: #ffffff !important;
    background-color: #000000 !important;

    &:hover {
      background-color: #2196f3 !important;
    }
  }

  .q-item__label {
    color: #ffffff !important;
  }

  .json-field-indicator {
    margin-right: 4px;
    display: inline-flex;
    vertical-align: middle;
  }

  .json-field-tag {
    background: #0288d1;
    color: white;
    border-radius: 4px;
    padding: 1px 4px;
    font-size: 10px;
    margin-left: 4px;
    display: inline-block;
    text-transform: uppercase;
  }
}
</style>
