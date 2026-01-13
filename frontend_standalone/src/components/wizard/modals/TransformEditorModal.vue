<template>
  <q-dialog
    :value="value"
    @input="$emit('input', $event)"
    persistent
    :maximized="false"
    transition-show="scale"
    transition-hide="scale"
  >
    <q-card ref="modalCard" class="transform-editor-modal" style="max-width: 700px; width: 90vw; max-height: 90vh;">
      <!-- Header -->
      <q-card-section class="modal-header row items-center">
        <div class="text-h6">{{ mode === 'add' ? 'Add' : 'Edit' }} Field Mapping</div>
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
        <div class="transform-form-container">
          <div class="transform-form">
            <div class="row q-col-gutter-md">
              <!-- Source Field (JSON Path) - Converted to Dropdown -->
              <div class="col-12">
                <q-select
                  v-model="transformForm.inputRule"
                  :options="jsonPathOptionsFiltered"
                  option-label="label"
                  option-value="value"
                  label="Source Field (JSON Path) *"
                  outlined
                  dense
                  use-input
                  input-debounce="0"
                  fill-input
                  hide-selected
                  @filter="filterJsonPathOptions"
                  @input="onJsonPathSelected"
                  :error="!!validationErrors.inputRule"
                  :error-message="validationErrors.inputRule"
                  emit-value
                  map-options
                  popup-content-class="dropdown-dark"
                  class="full-width uniform-select"
                  placeholder="Select or type JSON path"
                >
                  <template v-slot:prepend>
                    <q-icon name="code" />
                  </template>
                  <template v-slot:hint>
                    <span class="custom-hint-text">
                      Select from available JSON paths or type custom path
                      <span v-if="allAvailableFields.length > 0" class="q-ml-xs">
                        ({{ allAvailableFields.length }} paths available)
                      </span>
                    </span>
                  </template>
                  <template v-slot:no-option>
                    <q-item>
                      <q-item-section class="text-grey">
                        No matching paths found. You can type a custom JSON path.
                      </q-item-section>
                    </q-item>
                  </template>
                  <template v-slot:option="scope">
                    <q-item v-bind="scope.itemProps" v-on="scope.itemEvents">
                      <q-item-section>
                        <q-item-label>
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
                        <q-item-label v-if="scope.opt.fanoutParent" caption>
                          Fanout: {{ scope.opt.fanoutParent }}
                        </q-item-label>
                      </q-item-section>
                    </q-item>
                  </template>
                </q-select>
              </div>

              <!-- Operations & Transformations (from Step 5) -->
              <div class="col-12">
                <operation-selector
                  v-model="operationConfig"
                  :field-path="originalFieldPath"
                  :sample-value="transformForm.sampleValue"
                  :available-fields="allAvailableFields"
                  :sample-data="sampleData"
                  @input="handleOperationChanged"
                />
              </div>

              <!-- LogRhythm Schema Field -->
              <div class="col-12 col-md-6">
                <q-select
                  v-model="transformForm.lrSchemaField"
                  :options="lrSchemaFieldsFiltered"
                  label="LogRhythm Schema Field *"
                  outlined
                  dense
                  use-input
                  input-debounce="300"
                  @filter="filterLRSchemaFields"
                  emit-value
                  map-options
                  popup-content-class="dropdown-dark"
                  :error="!!validationErrors.lrSchemaField"
                  :error-message="validationErrors.lrSchemaField"
                  class="full-width uniform-select"
                >
                  <template v-slot:prepend>
                    <q-icon name="label" />
                  </template>

                  <template v-slot:hint>
                    <span class="custom-hint-text">Target field in LogRhythm</span>
                  </template>

                  <template v-slot:before-options v-if="smartSuggestions.length > 0">
                    <q-item-label header class="suggestions-header">
                      <q-icon name="lightbulb" color="amber" size="xs" class="q-mr-xs" />
                      Smart Suggestions
                    </q-item-label>
                  </template>

                  <template v-slot:option="scope">
                    <q-item
                      v-bind="scope.itemProps"
                      v-on="scope.itemEvents"
                    >
                      <q-item-section>
                        <q-item-label>
                          {{ scope.opt.label }}
                          <q-chip
                            v-if="isSuggestedField(scope.opt.value)"
                            size="xs"
                            color="amber"
                            text-color="black"
                            icon="stars"
                            class="q-ml-xs"
                          >
                            Suggested
                          </q-chip>
                        </q-item-label>
                        <q-item-label caption>
                          Category: {{ scope.opt.category }}
                        </q-item-label>
                      </q-item-section>
                    </q-item>
                  </template>

                  <template v-slot:no-option>
                    <q-item>
                      <q-item-section class="text-grey">
                        No results
                      </q-item-section>
                    </q-item>
                  </template>
                </q-select>
              </div>

              <!-- Sample Value Display -->
              <div v-if="transformForm.sampleValue" class="col-12">
                <q-banner
                  dense
                  class="sample-value-banner"
                  style="background: transparent !important; border-left: 4px solid #02b7fe !important; padding: 12px 16px !important;"
                >
                  <template v-slot:avatar>
                    <q-icon name="preview" color="primary" />
                  </template>
                  <div
                    class="sample-value-content"
                    style="color: #02b7fe !important; background: transparent !important;"
                  >
                    <strong
                      class="sample-label"
                      style="color: #02b7fe !important; font-weight: 600 !important; font-size: 14px !important; margin-right: 8px !important;"
                    >
                      Sample Value:
                    </strong>
                    <code
                      class="sample-code q-ml-sm"
                      style="background: transparent !important; color: #02b7fe !important; padding: 6px 14px !important; border-radius: 4px !important; border: 1px solid #02b7fe !important; font-family: 'Courier New', monospace !important;"
                    >
                      {{ transformForm.sampleValue }}
                    </code>
                  </div>
                </q-banner>
              </div>

              <!-- Data Type -->
              <div class="col-12 col-md-6">
                <q-select
                  v-model="transformForm.type"
                  :options="dataTypeOptions"
                  label="Data Type *"
                  outlined
                  dense
                  emit-value
                  map-options
                  popup-content-class="dropdown-dark"
                  :error="!!validationErrors.type"
                  :error-message="validationErrors.type"
                  class="full-width uniform-select"
                >
                  <template v-slot:hint>
                    <span class="custom-hint-text">Type of the field value</span>
                  </template>
                </q-select>
              </div>

              <!-- Format (Optional) -->
              <div class="col-12 col-md-6">
                <q-input
                  v-model="transformForm.format"
                  label="Format (optional)"
                  outlined
                  dense
                  class="full-width"
                >
                  <template v-slot:append>
                    <q-icon name="help_outline" color="grey-6">
                      <q-tooltip max-width="300px">
                        Format string for data transformation:<br>
                        - DateTime: yyyy-MM-dd HH:mm:ss.SSS<br>
                        - Use standard format patterns
                      </q-tooltip>
                    </q-icon>
                  </template>
                  <template v-slot:hint>
                    <span class="custom-hint-text">e.g., yyyy-MM-dd HH:mm:ss for DateTime</span>
                  </template>
                </q-input>
              </div>

              <!-- Default Value -->
              <div class="col-12">
                <q-input
                  v-model="transformForm.default"
                  label="Default Value (optional)"
                  outlined
                  dense
                  class="full-width"
                >
                  <template v-slot:hint>
                    <span class="custom-hint-text">Value to use if field is missing</span>
                  </template>
                </q-input>
              </div>

              <!-- Alternative Fields -->
              <div class="col-12">
                <q-select
                  v-model="transformForm.alternativeFields"
                  :options="alternativeFieldOptionsFiltered"
                  label="Alternative Fields (optional)"
                  outlined
                  dense
                  use-chips
                  multiple
                  use-input
                  input-debounce="300"
                  @filter="filterAlternativeFields"
                  emit-value
                  map-options
                  popup-content-class="dropdown-dark"
                  class="full-width uniform-select"
                >
                  <template v-slot:hint>
                    <span class="custom-hint-text">Fallback fields if primary field is missing</span>
                  </template>
                  <template v-slot:no-option>
                    <q-item>
                      <q-item-section class="text-grey">
                        No results
                      </q-item-section>
                    </q-item>
                  </template>
                </q-select>
              </div>

              <!-- Fanout Parent Element -->
              <div class="col-12">
                <q-input
                  v-model="transformForm.fanoutParentElement"
                  label="Fanout Parent Element (optional)"
                  outlined
                  dense
                  readonly
                  class="full-width"
                  :bg-color="transformForm.fanoutParentElement ? 'blue-1' : 'white'"
                >
                  <template v-slot:append>
                    <q-icon name="help_outline" color="grey-6">
                      <q-tooltip max-width="400px">
                        <strong>Fanout Parent Element</strong><br><br>
                        This field is auto-populated based on your fanout selections in Step 3.<br><br>
                        <span v-if="fanoutArrays.length > 0">
                          <strong>Available fanout arrays:</strong><br>
                          <span v-for="(fanout, idx) in fanoutArrays" :key="idx">
                            • {{ fanout }}<br>
                          </span>
                        </span>
                        <span v-else>
                          No fanout arrays configured in Step 3.
                        </span>
                      </q-tooltip>
                    </q-icon>
                  </template>
                  <template v-slot:hint>
                    <span class="custom-hint-text">{{ getFanoutParentHint() }}</span>
                  </template>
                </q-input>
              </div>
            </div>
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
          label="Save Mapping"
          color="primary"
          icon="check"
          :loading="isValidating"
          @click="saveTransform"
          no-caps
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>
import { mapState } from 'vuex'
import { MappingService } from '../../../services/wizard/mappingService'
import OperationSelector from '../operations/OperationSelector.vue'
import { parseOperationFromInputRule, buildOperationSyntax } from '../../../utils/operationParser'

export default {
  name: 'TransformEditorModal',

  components: {
    OperationSelector
  },

  props: {
    value: {
      type: Boolean,
      default: false
    },
    transforms: {
      type: Array,
      default: () => []
    },
    mode: {
      type: String,
      default: 'add', // 'add' or 'edit'
      validator: (value) => ['add', 'edit'].includes(value)
    },
    transformIndex: {
      type: Number,
      default: -1
    }
  },

  emits: ['input', 'save'],

  data () {
    return {
      transformForm: {
        inputRule: '',
        lrSchemaField: '',
        type: 'String',
        format: null,
        default: null,
        alternativeFields: [],
        fanoutParentElement: null,
        sampleValue: null
      },

      // Operation state (from Step 5)
      originalFieldPath: '', // Store field path without operation
      operationConfig: {
        type: null,
        parameters: {}
      },

      lrSchemaFields: [],
      lrSchemaFieldsFiltered: [],
      dataTypeOptions: [],
      availableJsonPaths: [],
      jsonPathOptionsFiltered: [], // Filtered JSON path options for dropdown
      alternativeFieldOptionsFiltered: [],
      smartSuggestions: [],
      validationErrors: {},
      isValidating: false
    }
  },

  computed: {
    ...mapState('wizard', ['sampleData', 'fieldMappings', 'filterRules']),

    fanoutArrays () {
      return this.$store.getters['wizard/getFanoutArrays']
    },

    // Get ALL available JSON paths from filterRules (populated in Step 4)
    allAvailableFields () {
      if (!this.filterRules || !this.filterRules.availableFields || !Array.isArray(this.filterRules.availableFields)) {
        console.log('[TransformEditorModal] allAvailableFields - no fields available', {
          hasFilterRules: !!this.filterRules,
          hasAvailableFields: !!(this.filterRules?.availableFields),
          isArray: Array.isArray(this.filterRules?.availableFields)
        })
        return []
      }
      console.log('[TransformEditorModal] allAvailableFields:', this.filterRules.availableFields.length, 'fields')
      return this.filterRules.availableFields
    },

    // Get Step 5 mappings for fanout information only
    step5Mappings () {
      if (!this.fieldMappings || !this.fieldMappings.mappings || !Array.isArray(this.fieldMappings.mappings)) {
        return []
      }
      return this.fieldMappings.mappings
    },

    // Build JSON path options from ALL available fields, with fanout info from Step 5
    jsonPathOptions () {
      // Use MappingService.resolvePathForFanout to properly transform paths based on fanout rules
      const allPaths = this.allAvailableFields.map(field => {
        // Handle both string and object formats
        let absolutePath = typeof field === 'string' ? field : (field.path || field.value || field)

        // CRITICAL: Normalize array indices [0], [1], [2] to [*] BEFORE resolving fanout
        // This ensures paths like $.teamMembers[0].name become $.teamMembers[*].name
        absolutePath = absolutePath.replace(/\[(\d+)\]/g, '[*]')

        // Use MappingService to resolve path based on fanout arrays (implements all 5 rules)
        const resolved = MappingService.resolvePathForFanout(absolutePath, this.fanoutArrays)

        // Return the RESOLVED path (relative to fanout) as the display value
        // But keep the absolute path as metadata for reference
        return {
          label: resolved.jsonPath, // Display the relative path
          value: resolved.jsonPath, // Use relative path as value
          fanoutParent: resolved.fanoutParent, // Store fanout parent
          absolutePath: absolutePath, // Keep absolute path for reference
          sampleValue: typeof field === 'object' ? field.sampleValue : null
        }
      })

      // Remove duplicates based on value (relative path)
      const uniqueMap = new Map()
      allPaths.forEach(path => {
        if (!uniqueMap.has(path.value)) {
          uniqueMap.set(path.value, path)
        } else {
          // If duplicate, prefer the one with fanout info
          const existing = uniqueMap.get(path.value)
          if (path.fanoutParent && !existing.fanoutParent) {
            uniqueMap.set(path.value, path)
          } else if (!path.fanoutParent && existing.fanoutParent) {
            // Keep existing if it has fanout info

          } else if (path.sampleValue && !existing.sampleValue) {
            // Prefer the one with sample value
            uniqueMap.set(path.value, path)
          }
        }
      })

      const result = Array.from(uniqueMap.values())

      return result
    },

    alternativeFieldOptions () {
      return this.jsonPathOptions.filter(path =>
        path.value !== this.transformForm.inputRule
      )
    }
  },

  watch: {
    value: {
      immediate: true,
      handler (newVal) {
        console.log('[TransformEditorModal] Modal visibility changed:', newVal)
        if (newVal) {
          this.initializeModal()
          // Force styles when modal opens
          this.$nextTick(() => {
            setTimeout(() => {
              console.log('[TransformEditorModal] Forcing styles after modal open')
              this.forceStyleVisibility()
            }, 100)
          })
        }
      }
    },

    'transformForm.inputRule': {
      handler (newVal) {
        if (newVal) {
          this.generateSmartSuggestions()
        }
      }
    },

    'transformForm.lrSchemaField': {
      handler (newVal) {
      }
    },

    'transformForm.type': {
      handler (newVal) {
      }
    }
  },

  methods: {
    initializeModal () {
      // Load LR schema fields and data type options
      this.loadLRSchemaFields()
      this.loadDataTypeOptions()
      this.extractAvailableJsonPaths()

      // Initialize JSON path options filtered list
      this.jsonPathOptionsFiltered = this.jsonPathOptions

      // If editing, load existing transform
      if (this.mode === 'edit' && this.transformIndex >= 0 && this.transformIndex < this.transforms.length) {
        const existingTransform = this.transforms[this.transformIndex]

        // Parse operation from inputRule if present (same as Step 5)
        const inputRuleValue = existingTransform.inputRule || existingTransform.inputrule || ''
        const parsed = parseOperationFromInputRule(inputRuleValue)

        // Store original field path and operation config
        this.originalFieldPath = parsed.fieldPath || inputRuleValue
        this.operationConfig = {
          type: parsed.type,
          parameters: parsed.parameters || {}
        }

        this.transformForm = {
          inputRule: inputRuleValue,
          lrSchemaField: existingTransform.LRSchemaField || existingTransform.lrSchemaField || '',
          type: existingTransform.type || 'String',
          format: existingTransform.format || null,
          default: existingTransform.default || null,
          alternativeFields: existingTransform.alternativeFields || [],
          fanoutParentElement: existingTransform.fanoutParentElement || null,
          sampleValue: existingTransform.sampleValue || null
        }
        this.generateSmartSuggestions()
      } else {
        // Reset form for new transform
        this.originalFieldPath = ''
        this.operationConfig = {
          type: null,
          parameters: {}
        }

        this.transformForm = {
          inputRule: '',
          lrSchemaField: '',
          type: 'String',
          format: null,
          default: null,
          alternativeFields: [],
          fanoutParentElement: null,
          sampleValue: null
        }
      }

      this.validationErrors = {}
    },

    filterJsonPathOptions (val, update, abort) {
      update(() => {
        if (val === '') {
          this.jsonPathOptionsFiltered = this.jsonPathOptions
        } else {
          const needle = val.toLowerCase()
          this.jsonPathOptionsFiltered = this.jsonPathOptions.filter(
            option => option.label.toLowerCase().indexOf(needle) > -1
          )
        }
      })
    },

    onJsonPathSelected (value) {
      // Handle both object and string values from q-select
      let selectedValue = value
      if (typeof value === 'object' && value !== null) {
        selectedValue = value.value
      }

      // Store the original field path (without operation syntax)
      this.originalFieldPath = selectedValue

      // Update the inputRule to the plain path (operation will be applied separately)
      this.transformForm.inputRule = selectedValue

      // Find the selected path with fanout info and sample value

      const selectedPath = this.jsonPathOptions.find(opt =>
        opt.value === selectedValue
      )

      // Get sample value from available fields
      if (!this.transformForm.sampleValue && this.allAvailableFields.length > 0) {
        const fieldOption = this.allAvailableFields.find(f => {
          const fieldPath = typeof f === 'string' ? f : (f.path || f.value || f)
          return fieldPath === selectedValue
        })
        if (fieldOption && typeof fieldOption === 'object' && fieldOption.sampleValue) {
          this.transformForm.sampleValue = fieldOption.sampleValue
        }
      }

      // Auto-populate fanout parent if available
      if (selectedPath && selectedPath.fanoutParent) {
        this.transformForm.fanoutParentElement = selectedPath.fanoutParent

        // Show notification
        this.$q.notify({
          type: 'info',
          message: 'Fanout parent auto-populated',
          caption: `Set to: ${selectedPath.fanoutParent}`,
          position: 'top',
          timeout: 2000,
          icon: 'info'
        })
      } else {
        // Clear fanout parent if switching to a non-fanout field
        this.transformForm.fanoutParentElement = null
      }

      // Trigger smart suggestions for the new path
      this.generateSmartSuggestions()
    },

    filterLRSchemaFields (val, update, abort) {
      update(() => {
        if (val === '') {
          // Show all fields with suggestions at top
          const suggested = this.lrSchemaFields.filter(f =>
            this.smartSuggestions.includes(f.value)
          )
          const others = this.lrSchemaFields.filter(f =>
            !this.smartSuggestions.includes(f.value)
          )
          this.lrSchemaFieldsFiltered = [...suggested, ...others]
        } else {
          const needle = val.toLowerCase()
          const filtered = this.lrSchemaFields.filter(
            f => f.label.toLowerCase().indexOf(needle) > -1 ||
                 f.value.toLowerCase().indexOf(needle) > -1
          )

          // Still prioritize suggestions
          const suggested = filtered.filter(f =>
            this.smartSuggestions.includes(f.value)
          )
          const others = filtered.filter(f =>
            !this.smartSuggestions.includes(f.value)
          )
          this.lrSchemaFieldsFiltered = [...suggested, ...others]
        }
      })
    },

    filterAlternativeFields (val, update, abort) {
      update(() => {
        if (val === '') {
          this.alternativeFieldOptionsFiltered = this.alternativeFieldOptions
        } else {
          const needle = val.toLowerCase()
          this.alternativeFieldOptionsFiltered = this.alternativeFieldOptions.filter(
            f => f.label.toLowerCase().indexOf(needle) > -1 ||
                 f.value.toLowerCase().indexOf(needle) > -1
          )
        }
      })
    },

    loadLRSchemaFields () {
      try {
        this.lrSchemaFields = MappingService.getLRSchemaFields()
        // Initialize filtered list
        const suggested = this.lrSchemaFields.filter(f =>
          this.smartSuggestions.includes(f.value)
        )
        const others = this.lrSchemaFields.filter(f =>
          !this.smartSuggestions.includes(f.value)
        )
        this.lrSchemaFieldsFiltered = [...suggested, ...others]
      } catch (error) {
        console.error('[TransformEditorModal] Error loading LR schema fields:', error)
        this.lrSchemaFields = []
        this.lrSchemaFieldsFiltered = []
      }
    },

    loadDataTypeOptions () {
      try {
        this.dataTypeOptions = MappingService.getDataTypeOptions()
      } catch (error) {
        console.error('[TransformEditorModal] Error loading data type options:', error)
        this.dataTypeOptions = []
      }
    },

    extractAvailableJsonPaths () {
      try {
        const data = this.sampleData || this.$store.state.wizard.sampleData
        const schemaRules = this.$store.state.wizard.schemaRules

        if (!data || !data.parsedData || !data.dataStructure) {
          console.warn('[TransformEditorModal] Missing required data for JSON path extraction:', {
            hasData: !!data,
            hasParsedData: !!data?.parsedData,
            hasDataStructure: !!data?.dataStructure
          })
          this.availableJsonPaths = []
          this.alternativeFieldOptionsFiltered = []
          return
        }

        // Get JSON-to-String fields and their parsed data from store
        const jsonToStringFields = schemaRules?.convertToJson || []
        const parsedStringifiedFields = schemaRules?.parsedStringifiedJsonFields || {}

        // Use MappingService to extract JSON paths with JSON-to-String field handling
        this.availableJsonPaths = MappingService.extractJsonPaths(
          data.parsedData,
          data.dataStructure, // Pass actual dataStructure to extract normal JSON fields
          {
            jsonToStringFields,
            parsedStringifiedFields
          }
        )
        this.alternativeFieldOptionsFiltered = this.alternativeFieldOptions
      } catch (error) {
        console.error('[TransformEditorModal] Error extracting JSON paths:', { error, hasData: !!this.sampleData })
        this.availableJsonPaths = []
        this.alternativeFieldOptionsFiltered = []
      }
    },

    generateSmartSuggestions () {
      try {
        if (!this.transformForm.inputRule) {
          this.smartSuggestions = []
          return
        }

        const fieldName = MappingService.extractFieldName(this.transformForm.inputRule)
        this.smartSuggestions = MappingService.generateSmartSuggestions(
          fieldName,
          this.transformForm.inputRule,
          this.transformForm.type
        )

        // Update filtered list to show suggestions at top
        const suggested = this.lrSchemaFields.filter(f =>
          this.smartSuggestions.includes(f.value)
        )
        const others = this.lrSchemaFields.filter(f =>
          !this.smartSuggestions.includes(f.value)
        )
        this.lrSchemaFieldsFiltered = [...suggested, ...others]

        // Auto-select first suggestion if field is empty
        if (this.smartSuggestions.length > 0 && !this.transformForm.lrSchemaField) {
          this.transformForm.lrSchemaField = this.smartSuggestions[0]
        }
      } catch (error) {
        console.error('[TransformEditorModal] Error generating smart suggestions:', { inputRule: this.transformForm.inputRule, error })
        this.smartSuggestions = []
      }
    },

    isSuggestedField (fieldValue) {
      return this.smartSuggestions.includes(fieldValue)
    },

    getFanoutParentHint () {
      if (this.transformForm.fanoutParentElement) {
        return 'Auto-populated based on fanout selection from Step 3'
      }
      if (this.fanoutArrays.length > 0) {
        return 'Field is not within any fanout array'
      }
      return 'No fanout arrays configured in Step 3'
    },

    /**
     * Handle operation configuration changes (from Step 5)
     * Rebuild inputRule with operation syntax
     */
    handleOperationChanged (newOperationConfig) {
      // Update local operation config
      this.operationConfig = { ...newOperationConfig }

      // Rebuild inputRule with operation syntax
      if (newOperationConfig.type) {
        // buildOperationSyntax expects: (type, fieldPath, parameters)
        const operationSyntax = buildOperationSyntax(
          newOperationConfig.type,
          this.originalFieldPath,
          newOperationConfig.parameters
        )

        this.transformForm.inputRule = operationSyntax
      } else {
        // No operation, use plain field path
        this.transformForm.inputRule = this.originalFieldPath
      }
    },

    async saveTransform () {
      this.isValidating = true
      this.validationErrors = {}

      try {
        // Validate operation syntax if operation is present (from Step 5)
        if (this.operationConfig.type) {
          const operationValidation = MappingService.validateOperationSyntax(this.transformForm.inputRule)

          if (!operationValidation.isValid) {
            this.$q.notify({
              type: 'negative',
              message: 'Invalid operation configuration',
              caption: operationValidation.errors[0],
              position: 'top',
              timeout: 5000
            })
            return
          }
        }

        // Validate transform
        const validation = MappingService.validateMapping(this.transformForm)

        if (!validation.isValid) {
          validation.errors.forEach(error => {
            if (error.includes('Input Rule')) {
              this.validationErrors.inputRule = error
            } else if (error.includes('Schema Field')) {
              this.validationErrors.lrSchemaField = error
            } else if (error.includes('Type')) {
              this.validationErrors.type = error
            }
          })

          this.$q.notify({
            type: 'warning',
            message: 'Please fix validation errors',
            caption: validation.errors[0],
            position: 'top'
          })
          return
        }

        // REMOVED: Fanout parent validation
        // The fanout parent is automatically assigned by the application based on tree structure
        // and is not user-editable, so validation is not needed.
        // The resolvePathForFanout() method ensures correct fanout parent assignment.

        // Format transform for saving (use uppercase LRSchemaField for consistency)
        const transformToSave = {
          inputRule: this.transformForm.inputRule,
          LRSchemaField: this.transformForm.lrSchemaField,
          type: this.transformForm.type,
          format: this.transformForm.format || undefined,
          default: this.transformForm.default || undefined,
          alternativeFields: this.transformForm.alternativeFields && this.transformForm.alternativeFields.length > 0
            ? this.transformForm.alternativeFields
            : undefined,
          fanoutParentElement: this.transformForm.fanoutParentElement || undefined
        }

        // Emit save event
        this.$emit('save', transformToSave)

        // Show success notification
        this.$q.notify({
          type: 'positive',
          message: this.mode === 'add' ? 'Transform added' : 'Transform updated',
          icon: 'check',
          position: 'top',
          timeout: 2000
        })

        this.closeModal()
      } catch (error) {
        console.error('[TransformEditorModal] Error saving transform:', {
          mode: this.mode,
          inputRule: this.transformForm.inputRule,
          lrSchemaField: this.transformForm.lrSchemaField,
          error
        })
        this.$q.notify({
          type: 'negative',
          message: 'Failed to save transform',
          caption: error.message,
          position: 'top'
        })
      } finally {
        this.isValidating = false
      }
    },

    closeModal () {
      this.$emit('input', false)
    },

    /**
     * Force style visibility using JavaScript DOM manipulation
     * This is necessary because Quasar's runtime styles override all CSS
     */
    forceStyleVisibility () {
      console.log('[TransformEditorModal] forceStyleVisibility called')

      this.$nextTick(() => {
        try {
          // Use $refs.modalCard instead of $el to access the actual DOM element
          const modalRoot = this.$refs.modalCard
          if (!modalRoot || !modalRoot.$el) {
            console.warn('[TransformEditorModal] modalCard ref is not available yet')
            return
          }

          // Get the actual DOM element from the Quasar component
          const rootEl = modalRoot.$el
          console.log('[TransformEditorModal] Starting style forcing on:', rootEl)

          // Force sample value banner styles
          const sampleBanner = rootEl.querySelector('.sample-value-banner')
          if (sampleBanner) {
            console.log('[TransformEditorModal] Found sample banner, applying styles')
            sampleBanner.style.setProperty('background', 'transparent', 'important')
            sampleBanner.style.setProperty('border-left', '4px solid #02b7fe', 'important')
            sampleBanner.style.setProperty('padding', '12px 16px', 'important')
          } else {
            console.log('[TransformEditorModal] Sample banner not found')
          }

          // Force sample value content styles
          const sampleContent = rootEl.querySelector('.sample-value-content')
          if (sampleContent) {
            console.log('[TransformEditorModal] Found sample content, applying styles')
            sampleContent.style.setProperty('color', '#02b7fe', 'important')
            sampleContent.style.setProperty('background', 'transparent', 'important')
          }

          // Force sample label styles
          const sampleLabel = rootEl.querySelector('.sample-label')
          if (sampleLabel) {
            console.log('[TransformEditorModal] Found sample label, applying styles')
            sampleLabel.style.setProperty('color', '#02b7fe', 'important')
            sampleLabel.style.setProperty('-webkit-text-fill-color', '#02b7fe', 'important')
            sampleLabel.style.setProperty('font-weight', '600', 'important')
            sampleLabel.style.setProperty('font-size', '14px', 'important')
          }

          // Force sample code styles
          const sampleCode = rootEl.querySelector('.sample-code')
          if (sampleCode) {
            console.log('[TransformEditorModal] Found sample code, applying styles')
            sampleCode.style.setProperty('background', 'transparent', 'important')
            sampleCode.style.setProperty('color', '#02b7fe', 'important')
            sampleCode.style.setProperty('-webkit-text-fill-color', '#02b7fe', 'important')
            sampleCode.style.setProperty('padding', '6px 14px', 'important')
            sampleCode.style.setProperty('border', '1px solid #02b7fe', 'important')
            sampleCode.style.setProperty('border-radius', '4px', 'important')
            sampleCode.style.setProperty('font-family', "'Courier New', monospace", 'important')
          } // Force hint text styles for all fields
          const hintBottoms = rootEl.querySelectorAll('.q-field__bottom')
          console.log(`[TransformEditorModal] Found ${hintBottoms.length} hint bottom elements`)
          hintBottoms.forEach((bottom, index) => {
            bottom.style.setProperty('display', 'block', 'important')
            bottom.style.setProperty('visibility', 'visible', 'important')
            bottom.style.setProperty('opacity', '1', 'important')
            bottom.style.setProperty('background', 'transparent', 'important')
            bottom.style.setProperty('background-color', 'transparent', 'important')
            bottom.style.setProperty('border', 'none', 'important')
            bottom.style.setProperty('border-radius', '0', 'important')
            bottom.style.setProperty('padding', '4px 0', 'important')
            bottom.style.setProperty('margin-top', '4px', 'important')

            // Force background on ALL children too
            const children = bottom.querySelectorAll('*')
            children.forEach(child => {
              child.style.setProperty('background', 'transparent', 'important')
              child.style.setProperty('background-color', 'transparent', 'important')
            })
          })

          // Force hint text message styles
          const hintMessages = rootEl.querySelectorAll('.q-field__messages, .q-field__messages div, .q-field__messages span, .custom-hint-text')
          console.log(`[TransformEditorModal] Found ${hintMessages.length} hint message elements`)
          hintMessages.forEach((msg, index) => {
            msg.style.setProperty('color', '#02b7fe', 'important')
            msg.style.setProperty('-webkit-text-fill-color', '#02b7fe', 'important')
            msg.style.setProperty('background', 'transparent', 'important')
            msg.style.setProperty('background-color', 'transparent', 'important')
            msg.style.setProperty('display', 'block', 'important')
            msg.style.setProperty('visibility', 'visible', 'important')
            msg.style.setProperty('opacity', '1', 'important')
            msg.style.setProperty('font-size', '12px', 'important')
          })

          console.log('[TransformEditorModal] ✅ Forced style visibility applied successfully')
        } catch (error) {
          console.error('[TransformEditorModal] ❌ Error forcing style visibility:', error)
        }
      })
    }
  },

  mounted () {
    console.log('[TransformEditorModal] Component mounted', {
      hasSampleData: !!this.sampleData,
      sampleData: this.sampleData,
      allAvailableFieldsCount: this.allAvailableFields?.length || 0
    })
    // Force styles on mount
    this.forceStyleVisibility()
  },

  updated () {
    console.log('[TransformEditorModal] Component updated')
    // Re-apply forced styles after any update (Quasar may re-render)
    this.forceStyleVisibility()
  }
}
</script>

<style lang="scss" scoped>
.transform-editor-modal {
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

    // Ensure hint text is not clipped
    & > * {
      overflow: visible !important;
    }
  }

  .modal-actions {
    padding: 16px 24px;
    background: var(--q-color-grey-1);
  }

  // Custom hint text styling
  .custom-hint-text {
    color: #02b7fe !important; /* Light blue for high contrast */
    font-size: 12px !important;
    line-height: 1.5 !important;
    display: block !important;
    visibility: visible !important;
    opacity: 1 !important;
    padding-top: 2px !important;
    font-weight: 500 !important;
    -webkit-text-fill-color: #02b7fe !important;
    text-shadow: none !important;
  }
}

.transform-form-container {
  max-width: 1000px;
  margin: 0 auto;
}

.sample-value-banner {
  background: #E3F2FD !important; /* Light blue background */
  border-left: 4px solid #2196F3 !important;
  padding: 12px 16px !important;
}

.sample-value-content {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  color: #000000 !important; /* Force black text */
  background: transparent !important;

  .sample-label {
    color: #1565C0 !important; /* Dark blue for label */
    font-weight: 600 !important;
    font-size: 14px !important;
    margin-right: 8px !important;
  }

  code.sample-code {
    background: #FFFFFF !important; /* White background for code */
    padding: 6px 14px !important;
    border-radius: 4px !important;
    color: #0D47A1 !important; /* Dark blue for code text */
    font-size: 0.95rem !important;
    font-weight: 500 !important;
    border: 1px solid #90CAF9 !important; /* Light blue border */
    font-family: 'Courier New', monospace !important;
    letter-spacing: 0.5px !important;
  }
}

.suggestions-header {
  background: rgba(255, 193, 7, 0.1);
  padding: 8px 16px;
  font-weight: 600;
  color: #FFC107;
}

// Light mode input styles - whitesmoke backgrounds
::v-deep .transform-form-container {
  .q-field {
    .q-field__control,
    .q-field__control-container {
      background-color: whitesmoke !important;
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

    .q-field__append,
    .q-field__prepend {
      color: rgba(0, 0, 0, 0.54) !important;
    }

    // Hint text - FORCE VISIBILITY WITH HIGH CONTRAST
    .q-field__bottom {
      display: block !important;
      visibility: visible !important;
      opacity: 1 !important;
      min-height: 18px !important;
      margin-top: 4px !important;
      padding: 4px 0 !important;
      overflow: visible !important;
      background-color: transparent !important;
      border-radius: 0 !important;
      border: none !important;
    }

    .q-field__messages {
      color: #02b7fe !important; /* Light blue text for maximum contrast */
      font-size: 12px !important;
      display: block !important;
      visibility: visible !important;
      opacity: 1 !important;
      line-height: 1.5 !important;
      min-height: 18px !important;
      font-weight: 500 !important;
      text-shadow: none !important;
      background: transparent !important;
    }

    .q-field__messages div {
      color: #02b7fe !important; /* Light blue text */
      display: block !important;
      visibility: visible !important;
      opacity: 1 !important;
    }

    // Target all hint text content with light blue color
    .q-field__messages > div,
    .q-field__messages span,
    .q-field__messages .custom-hint-text {
      color: #02b7fe !important; /* Light blue for high contrast */
      -webkit-text-fill-color: #02b7fe !important;
      background: transparent !important;
      text-shadow: none !important;
    }
  }

  .q-field--focused .q-field__label {
    color: var(--q-color-primary) !important;
  }

  // Ensure select dropdowns also have whitesmoke backgrounds
  .q-select .q-field__control {
    background-color: whitesmoke !important;
  }

  // Chips in multi-select
  .q-chip {
    background-color: var(--q-color-primary) !important;
    color: white !important;
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
}

// Global styles for transform editor modal inputs
.transform-editor-modal {
  .q-field__control,
  .q-field__control-container {
    background-color: whitesmoke !important;
  }

  .q-field__native,
  .q-field__input,
  .q-field__native input {
    color: #000000 !important;
    background-color: transparent !important;
  }

  .q-field__label {
    color: rgba(0, 0, 0, 0.6) !important;
  }

  .q-field--focused .q-field__label {
    color: var(--q-color-primary) !important;
  }

  .q-field__append .q-icon,
  .q-field__prepend .q-icon {
    color: rgba(0, 0, 0, 0.54) !important;
  }

  // FORCE HINT TEXT VISIBILITY - GLOBAL STYLES WITH HIGH CONTRAST
  .q-field__bottom {
    display: block !important;
    visibility: visible !important;
    opacity: 1 !important;
    min-height: 18px !important;
    margin-top: 4px !important;
    padding: 4px 0 !important;
    overflow: visible !important;
    max-height: none !important;
    background-color: transparent !important;
    border-radius: 0 !important;
    border: none !important;
  }

  .q-field__messages {
    color: #02b7fe !important; /* Light blue text for maximum contrast */
    font-size: 12px !important;
    display: block !important;
    visibility: visible !important;
    opacity: 1 !important;
    line-height: 1.5 !important;
    min-height: 18px !important;
    max-height: none !important;
    font-weight: 500 !important;
    text-shadow: none !important;
    background: transparent !important;
  }

  .q-field__messages div {
    color: #02b7fe !important; /* Light blue text */
    display: block !important;
    visibility: visible !important;
    opacity: 1 !important;
  }

  // Target all hint text elements with light blue color
  .q-field__bottom .q-field__messages > div,
  .q-field__bottom .q-field__messages span,
  .q-field__bottom .q-field__messages .custom-hint-text {
    color: #02b7fe !important; /* Light blue for high contrast */
    -webkit-text-fill-color: #02b7fe !important;
    background: transparent !important;
    text-shadow: none !important;
  }

  // For textarea and multiline inputs
  textarea.q-field__native {
    color: #000000 !important;
    background-color: transparent !important;
  }

  // Ensure placeholder text is visible
  .q-field__native::placeholder,
  .q-field__input::placeholder {
    color: rgba(0, 0, 0, 0.4) !important;
  }

  // Chips in multi-select
  .q-chip {
    background-color: var(--q-color-primary) !important;
    color: white !important;
  }

  // Custom hint text - global styles
  .custom-hint-text {
    color: #02b7fe !important; /* Light blue for high contrast */
    font-size: 12px !important;
    line-height: 1.5 !important;
    display: block !important;
    visibility: visible !important;
    opacity: 1 !important;
    padding-top: 2px !important;
    font-weight: 500 !important;
    -webkit-text-fill-color: #02b7fe !important;
    text-shadow: none !important;
  }
}

/* Dark mode overrides */
body.body--dark {
  .sample-value-banner {
    background: transparent !important; /* Transparent background */
    border-left: 4px solid #02b7fe !important;
  }

  .sample-value-content {
    color: #02b7fe !important; /* Light blue text in dark mode */

    .sample-label {
      color: #02b7fe !important; /* Light blue for label */
    }

    code.sample-code {
      background: transparent !important; /* Transparent background for code */
      color: #02b7fe !important; /* Light blue text */
      border: 1px solid #02b7fe !important; /* Light blue border */
    }
  }

  .transform-editor-modal {
    .q-field__bottom {
      background-color: transparent !important; /* Transparent background */
      border: none !important;
    }

    .q-field__messages,
    .q-field__messages div,
    .custom-hint-text {
      color: #02b7fe !important; /* Light blue text for dark mode */
      -webkit-text-fill-color: #02b7fe !important;
      text-shadow: none !important;
    }
  }
}

/* ULTRA-AGGRESSIVE OVERRIDES - Penetrate all component encapsulation */
.transform-editor-modal ::v-deep .q-banner,
.transform-editor-modal .q-banner,
::v-deep .transform-editor-modal .q-banner {
  background: transparent !important;
  border-left: 4px solid #02b7fe !important;
  padding: 12px 16px !important;
}

.transform-editor-modal ::v-deep .sample-value-banner,
.transform-editor-modal .sample-value-banner,
::v-deep .transform-editor-modal .sample-value-banner {
  background: transparent !important;
  border-left: 4px solid #02b7fe !important;
  padding: 12px 16px !important;
}

.transform-editor-modal ::v-deep .sample-value-content,
.transform-editor-modal .sample-value-content,
::v-deep .transform-editor-modal .sample-value-content,
.transform-editor-modal ::v-deep .sample-value-content *,
.transform-editor-modal .sample-value-content * {
  color: #02b7fe !important;
  background: transparent !important;
}

.transform-editor-modal ::v-deep .sample-label,
.transform-editor-modal .sample-label,
::v-deep .transform-editor-modal .sample-label {
  color: #02b7fe !important;
  font-weight: 600 !important;
  font-size: 14px !important;
}

.transform-editor-modal ::v-deep code.sample-code,
.transform-editor-modal code.sample-code,
::v-deep .transform-editor-modal code.sample-code {
  background: transparent !important;
  color: #02b7fe !important;
  padding: 6px 14px !important;
  border-radius: 4px !important;
  border: 1px solid #02b7fe !important;
  font-family: 'Courier New', monospace !important;
}

/* Force hint text visibility with maximum specificity */
.transform-editor-modal ::v-deep .q-field__bottom,
.transform-editor-modal .q-field__bottom,
::v-deep .transform-editor-modal .q-field__bottom,
.q-dialog .transform-editor-modal .q-field__bottom {
  display: block !important;
  visibility: visible !important;
  opacity: 1 !important;
  min-height: 18px !important;
  margin-top: 4px !important;
  padding: 4px 0 !important;
  background-color: transparent !important;
  border: none !important;
  border-radius: 0 !important;
}

.transform-editor-modal ::v-deep .q-field__messages,
.transform-editor-modal .q-field__messages,
::v-deep .transform-editor-modal .q-field__messages,
.q-dialog .transform-editor-modal .q-field__messages,
.transform-editor-modal ::v-deep .q-field__messages *,
.transform-editor-modal .q-field__messages * {
  color: #02b7fe !important;
  -webkit-text-fill-color: #02b7fe !important;
  font-size: 12px !important;
  display: block !important;
  visibility: visible !important;
  opacity: 1 !important;
  text-shadow: none !important;
  background: transparent !important;
}

.transform-editor-modal ::v-deep .custom-hint-text,
.transform-editor-modal .custom-hint-text,
::v-deep .transform-editor-modal .custom-hint-text {
  color: #02b7fe !important;
  -webkit-text-fill-color: #02b7fe !important;
  display: block !important;
  visibility: visible !important;
  opacity: 1 !important;
}

/* Dark mode with maximum specificity */
body.body--dark .transform-editor-modal ::v-deep .sample-value-banner,
body.body--dark .transform-editor-modal .sample-value-banner {
  background: transparent !important;
  border-left: 4px solid #02b7fe !important;
}

body.body--dark .transform-editor-modal ::v-deep .sample-value-content *,
body.body--dark .transform-editor-modal .sample-value-content * {
  color: #02b7fe !important;
}

body.body--dark .transform-editor-modal ::v-deep code.sample-code,
body.body--dark .transform-editor-modal code.sample-code {
  background: transparent !important;
  color: #02b7fe !important;
  border: 1px solid #02b7fe !important;
}

body.body--dark .transform-editor-modal ::v-deep .q-field__bottom,
body.body--dark .transform-editor-modal .q-field__bottom {
  background-color: transparent !important;
  border: none !important;
}

body.body--dark .transform-editor-modal ::v-deep .q-field__messages,
body.body--dark .transform-editor-modal .q-field__messages,
body.body--dark .transform-editor-modal ::v-deep .q-field__messages *,
body.body--dark .transform-editor-modal .q-field__messages *,
body.body--dark .transform-editor-modal ::v-deep .custom-hint-text,
body.body--dark .transform-editor-modal .custom-hint-text {
  color: #02b7fe !important;
  -webkit-text-fill-color: #02b7fe !important;
  background: transparent !important;
}
</style>
