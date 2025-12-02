<template>
  <q-dialog
    :value="value"
    @input="$emit('input', $event)"
    persistent
    :maximized="false"
    transition-show="scale"
    transition-hide="scale"
  >
    <q-card class="transform-editor-modal" style="max-width: 700px; width: 90vw; max-height: 90vh;">
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
                <q-banner dense class="sample-value-banner">
                  <template v-slot:avatar>
                    <q-icon name="preview" />
                  </template>
                  <div class="sample-value-content">
                    <strong>Sample Value:</strong>
                    <code class="q-ml-sm">{{ transformForm.sampleValue }}</code>
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
        return []
      }
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
      console.log('╔════════════════════════════════════════════════════════════════════════')
      console.log('║ [TransformEditorModal] jsonPathOptions - Computing options with fanout resolution')
      console.log('╠════════════════════════════════════════════════════════════════════════')
      console.log('║ allAvailableFields count:', this.allAvailableFields.length)
      console.log('║ fanoutArrays:', JSON.stringify(this.fanoutArrays))
      console.log('║ fanoutArrays count:', this.fanoutArrays.length)
      console.log('╚════════════════════════════════════════════════════════════════════════')

      // Use MappingService.resolvePathForFanout to properly transform paths based on fanout rules
      const allPaths = this.allAvailableFields.map(field => {
        // Handle both string and object formats
        const absolutePath = typeof field === 'string' ? field : (field.path || field.value || field)

        console.log('╔════════════════════════════════════════════════════════════════════════')
        console.log('║ Processing field:', absolutePath)
        console.log('╠════════════════════════════════════════════════════════════════════════')

        // Use MappingService to resolve path based on fanout arrays (implements all 5 rules)
        const resolved = MappingService.resolvePathForFanout(absolutePath, this.fanoutArrays)

        console.log('║ Resolved path:', resolved.jsonPath)
        console.log('║ Fanout parent:', resolved.fanoutParent)
        console.log('╚════════════════════════════════════════════════════════════════════════')

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
      console.log('╔════════════════════════════════════════════════════════════════════════')
      console.log('║ [TransformEditorModal] jsonPathOptions - Final result')
      console.log('╠════════════════════════════════════════════════════════════════════════')
      console.log('║ Total options:', result.length)
      console.log('║ Options with fanout:', result.filter(r => r.fanoutParent).length)
      console.log('║ Sample options with fanout:')
      result.filter(r => r.fanoutParent).slice(0, 5).forEach(opt => {
        console.log('║   - Label:', opt.label, '→ Fanout:', opt.fanoutParent)
      })
      console.log('║ Sample options without fanout:')
      result.filter(r => !r.fanoutParent).slice(0, 5).forEach(opt => {
        console.log('║   - Label:', opt.label)
      })
      console.log('╚════════════════════════════════════════════════════════════════════════')

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
        console.log('[TransformEditorModal] value changed to:', newVal)
        if (newVal) {
          console.log('[TransformEditorModal] Initializing modal...')
          this.initializeModal()
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
        console.log('[TransformEditorModal] lrSchemaField changed to:', newVal)
      }
    },

    'transformForm.type': {
      handler (newVal) {
        console.log('[TransformEditorModal] type changed to:', newVal)
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

        console.log('[TransformEditorModal] Edit mode - Parsed operation:', {
          type: parsed.type,
          fieldPath: parsed.fieldPath,
          parameters: parsed.parameters
        })

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
      console.log('╔════════════════════════════════════════════════════════════════════════')
      console.log('║ [TransformEditorModal] onJsonPathSelected - START')
      console.log('╠════════════════════════════════════════════════════════════════════════')
      console.log('║ Raw value:', value)
      console.log('║ Type:', typeof value)
      console.log('╚════════════════════════════════════════════════════════════════════════')

      // Handle both object and string values from q-select
      let selectedValue = value
      if (typeof value === 'object' && value !== null) {
        selectedValue = value.value
        console.log('║ Extracted value from object:', selectedValue)
      }

      // Store the original field path (without operation syntax)
      this.originalFieldPath = selectedValue

      // Update the inputRule to the plain path (operation will be applied separately)
      this.transformForm.inputRule = selectedValue

      // Find the selected path with fanout info and sample value
      console.log('╔════════════════════════════════════════════════════════════════════════')
      console.log('║ [TransformEditorModal] Searching for selected path in jsonPathOptions')
      console.log('╠════════════════════════════════════════════════════════════════════════')
      console.log('║ Looking for:', selectedValue)
      console.log('║ Total options:', this.jsonPathOptions.length)
      console.log('╚════════════════════════════════════════════════════════════════════════')

      const selectedPath = this.jsonPathOptions.find(opt =>
        opt.value === selectedValue
      )

      console.log('╔════════════════════════════════════════════════════════════════════════')
      console.log('║ [TransformEditorModal] Search result:')
      console.log('╠════════════════════════════════════════════════════════════════════════')
      if (selectedPath) {
        console.log('║ ✓ FOUND selected path object')
        console.log('║   value:', selectedPath.value)
        console.log('║   label:', selectedPath.label)
        console.log('║   fanoutParent:', selectedPath.fanoutParent)
      } else {
        console.log('║ ✗ NOT FOUND - selectedPath is null/undefined')
        console.log('║ Available options (first 5):')
        this.jsonPathOptions.slice(0, 5).forEach((opt, idx) => {
          console.log(`║   [${idx}] value: ${opt.value}, fanoutParent: ${opt.fanoutParent}`)
        })
      }
      console.log('╚════════════════════════════════════════════════════════════════════════')

      // Get sample value from available fields
      if (!this.transformForm.sampleValue && this.allAvailableFields.length > 0) {
        const fieldOption = this.allAvailableFields.find(f => {
          const fieldPath = typeof f === 'string' ? f : (f.path || f.value || f)
          return fieldPath === selectedValue
        })
        if (fieldOption && typeof fieldOption === 'object' && fieldOption.sampleValue) {
          this.transformForm.sampleValue = fieldOption.sampleValue
          console.log('║ Found sample value:', this.transformForm.sampleValue)
        }
      }

      // Auto-populate fanout parent if available
      if (selectedPath && selectedPath.fanoutParent) {
        console.log('╔════════════════════════════════════════════════════════════════════════')
        console.log('║ [TransformEditorModal] ✓ AUTO-POPULATING FANOUT PARENT')
        console.log('╠════════════════════════════════════════════════════════════════════════')
        console.log('║ Fanout parent value:', selectedPath.fanoutParent)
        console.log('║ Before update - transformForm.fanoutParentElement:', this.transformForm.fanoutParentElement)
        console.log('╚════════════════════════════════════════════════════════════════════════')

        this.transformForm.fanoutParentElement = selectedPath.fanoutParent

        console.log('╔════════════════════════════════════════════════════════════════════════')
        console.log('║ After update - transformForm.fanoutParentElement:', this.transformForm.fanoutParentElement)
        console.log('╚════════════════════════════════════════════════════════════════════════')

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
        console.log('╔════════════════════════════════════════════════════════════════════════')
        console.log('║ [TransformEditorModal] ✗ NO FANOUT PARENT FOUND')
        console.log('╠════════════════════════════════════════════════════════════════════════')
        console.log('║ selectedPath exists?', !!selectedPath)
        console.log('║ selectedPath.fanoutParent:', selectedPath?.fanoutParent)
        console.log('║ Reason: ', !selectedPath ? 'Path not found in jsonPathOptions' : 'Path has no fanoutParent property')
        console.log('╚════════════════════════════════════════════════════════════════════════')

        // Clear fanout parent if switching to a non-fanout field
        this.transformForm.fanoutParentElement = null
      }

      // Trigger smart suggestions for the new path
      this.generateSmartSuggestions()

      console.log('╔════════════════════════════════════════════════════════════════════════')
      console.log('║ [TransformEditorModal] onJsonPathSelected - END')
      console.log('║ Final transformForm.fanoutParentElement:', this.transformForm.fanoutParentElement)
      console.log('╚════════════════════════════════════════════════════════════════════════')
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

        console.log('╔════════════════════════════════════════════════════════════════════════')
        console.log('║ [TransformEditorModal] extractAvailableJsonPaths - START')
        console.log('╠════════════════════════════════════════════════════════════════════════')
        console.log('║ Checking for JSON-to-String fields to include in JSON path extraction')

        // Get JSON-to-String fields and their parsed data from store
        const jsonToStringFields = schemaRules?.convertToJson || []
        const parsedStringifiedFields = schemaRules?.parsedStringifiedJsonFields || {}

        console.log('║ Found jsonToStringFields count:', jsonToStringFields.length)
        console.log('║ Found parsedStringifiedFields keys:', Object.keys(parsedStringifiedFields))
        console.log('╚════════════════════════════════════════════════════════════════════════')

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

        console.log('╔════════════════════════════════════════════════════════════════════════')
        console.log('║ [TransformEditorModal] extractAvailableJsonPaths - COMPLETE')
        console.log('╠════════════════════════════════════════════════════════════════════════')
        console.log('║ Total extracted paths:', this.availableJsonPaths.length)
        const normalPaths = this.availableJsonPaths.filter(p => !p.isFromJsonString)
        const jsonStringPaths = this.availableJsonPaths.filter(p => p.isFromJsonString)
        console.log('║ Normal JSON field paths:', normalPaths.length)
        console.log('║ JSON-to-String field paths:', jsonStringPaths.length)

        // Log sample fields for debugging
        if (normalPaths.length > 0) {
          console.log('║ Sample normal JSON fields:')
          normalPaths.slice(0, 3).forEach(p => console.log(`║   - ${p.value} (${p.type})`))
        }
        if (jsonStringPaths.length > 0) {
          console.log('║ Sample JSON-to-String fields:')
          jsonStringPaths.slice(0, 3).forEach(p => console.log(`║   - ${p.value} (${p.type})`))
        }
        console.log('╚════════════════════════════════════════════════════════════════════════')
      } catch (error) {
        console.error('[TransformEditorModal] Error extracting JSON paths:', error)
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
        console.error('[TransformEditorModal] Error generating suggestions:', error)
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
      console.log('[TransformEditorModal] handleOperationChanged:', newOperationConfig)

      // Update local operation config
      this.operationConfig = { ...newOperationConfig }

      // Rebuild inputRule with operation syntax
      if (newOperationConfig.type) {
        const operationSyntax = buildOperationSyntax({
          type: newOperationConfig.type,
          fieldPath: this.originalFieldPath,
          params: newOperationConfig.parameters
        })

        this.transformForm.inputRule = operationSyntax
        console.log('[TransformEditorModal] Built operation syntax:', operationSyntax)
      } else {
        // No operation, use plain field path
        this.transformForm.inputRule = this.originalFieldPath
        console.log('[TransformEditorModal] No operation, using plain path:', this.originalFieldPath)
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

        // Validate fanout parent if present
        if (this.transformForm.fanoutParentElement) {
          const isValidFanout = MappingService.validateFanoutParentElement(
            this.transformForm.fanoutParentElement,
            this.fanoutArrays
          )

          if (!isValidFanout) {
            this.validationErrors.fanoutParentElement = 'Invalid fanout parent element'
            this.$q.notify({
              type: 'negative',
              message: 'Invalid fanout parent element',
              caption: 'The fanout parent must be one of the arrays selected in Step 3',
              position: 'top'
            })
            return
          }
        }

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
        console.error('[TransformEditorModal] Error saving transform:', error)
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
    }
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
    color: #42A5F5 !important;
    font-size: 12px !important;
    line-height: 1.4 !important;
    display: block !important;
    visibility: visible !important;
    opacity: 1 !important;
    padding-top: 2px !important;
  }
}

.transform-form-container {
  max-width: 1000px;
  margin: 0 auto;
}

.sample-value-banner {
  background: rgba(33, 150, 243, 0.1);
  border-left: 3px solid #2196F3;
}

.sample-value-content {
  display: flex;
  align-items: center;
  flex-wrap: wrap;

  code {
    background: rgba(0, 0, 0, 0.2);
    padding: 2px 8px;
    border-radius: 4px;
    color: #A5D6A7;
    font-size: 0.9rem;
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

    // Hint text - FORCE VISIBILITY
    .q-field__bottom {
      display: block !important;
      visibility: visible !important;
      opacity: 1 !important;
      min-height: 20px !important;
      margin-top: 4px !important;
      padding-top: 4px !important;
      overflow: visible !important;
    }

    .q-field__messages {
      color: #42A5F5 !important;
      font-size: 12px !important;
      display: block !important;
      visibility: visible !important;
      opacity: 1 !important;
      line-height: 1.4 !important;
      min-height: 18px !important;
    }

    .q-field__messages div {
      color: #42A5F5 !important;
      display: block !important;
      visibility: visible !important;
      opacity: 1 !important;
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

  // FORCE HINT TEXT VISIBILITY - GLOBAL STYLES
  .q-field__bottom {
    display: block !important;
    visibility: visible !important;
    opacity: 1 !important;
    min-height: 20px !important;
    margin-top: 4px !important;
    padding-top: 4px !important;
    overflow: visible !important;
    max-height: none !important;
  }

  .q-field__messages {
    color: #42A5F5 !important;
    font-size: 12px !important;
    display: block !important;
    visibility: visible !important;
    opacity: 1 !important;
    line-height: 1.4 !important;
    min-height: 18px !important;
    max-height: none !important;
  }

  .q-field__messages div {
    color: #42A5F5 !important;
    display: block !important;
    visibility: visible !important;
    opacity: 1 !important;
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
    color: #42A5F5 !important;
    font-size: 12px !important;
    line-height: 1.4 !important;
    display: block !important;
    visibility: visible !important;
    opacity: 1 !important;
    padding-top: 2px !important;
    font-weight: normal !important;
  }
}
</style>
