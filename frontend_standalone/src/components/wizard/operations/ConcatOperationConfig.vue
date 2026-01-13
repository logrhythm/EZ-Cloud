<template>
  <div class="concat-operation-config">
    <q-banner class="operation-info-banner q-mb-md">
      <template v-slot:avatar>
        <q-icon :name="operationType === 'Concat' ? 'add_link' : 'merge_type'" color="warning" />
      </template>
      <div class="text-body1">
        <strong>{{ operationType === 'Concat' ? 'Concat' : 'ConcatArray' }} Operation</strong>
        - {{ operationType === 'Concat' ? 'Concatenates multiple values with delimiters' : 'Joins array elements with a delimiter' }}
      </div>
      <div class="text-body2 q-mt-sm">
        {{ operationType === 'Concat'
          ? 'Use this to join multiple string values together with custom separators.'
          : 'Use this to convert an array into a delimited string.'
        }}
      </div>
    </q-banner>

    <div class="row q-col-gutter-md">
      <!-- Concat Operation -->
      <template v-if="operationType === 'Concat'">
        <div class="col-12">
          <div class="section-label">Value & Delimiter Pairs:</div>

          <!-- Rows Grid -->
          <div class="concat-rows">
            <div
              v-for="(pair, index) in localParams.pairs"
              :key="index"
              class="concat-row q-mb-md"
            >
              <div class="row-header">
                <span class="row-number">Row {{ index + 1 }}</span>
                <div class="row-controls">
                  <q-btn
                    v-if="index > 0"
                    icon="arrow_upward"
                    flat
                    round
                    dense
                    size="sm"
                    color="primary"
                    @click="moveRowUp(index)"
                  >
                    <q-tooltip>Move Up</q-tooltip>
                  </q-btn>
                  <q-btn
                    v-if="index < localParams.pairs.length - 1"
                    icon="arrow_downward"
                    flat
                    round
                    dense
                    size="sm"
                    color="primary"
                    @click="moveRowDown(index)"
                  >
                    <q-tooltip>Move Down</q-tooltip>
                  </q-btn>
                  <q-btn
                    v-if="localParams.pairs.length > 1"
                    icon="delete"
                    flat
                    round
                    dense
                    size="sm"
                    color="negative"
                    @click="removeRow(index)"
                  >
                    <q-tooltip>Remove Row</q-tooltip>
                  </q-btn>
                </div>
              </div>

              <div class="row-inputs">
                <!-- Value Input -->
                <div class="input-container">
                  <q-select
                    v-model="pair.value"
                    :options="filteredValueOptions"
                    label="Value *"
                    hint="JSON path or static text"
                    outlined
                    dense
                    bg-color="whitesmoke"
                    use-input
                    fill-input
                    hide-selected
                    input-debounce="0"
                    new-value-mode="add-unique"
                    @filter="filterValueOptions"
                    @new-value="createValue"
                    @input-value="(val) => handleInputValue(pair, val)"
                    @update:model-value="updateParams"
                  >
                    <template v-slot:prepend>
                      <q-icon :name="pair.value && pair.value.startsWith('$.') ? 'code' : 'text_fields'" />
                    </template>
                  </q-select>

                  <!-- Fanout Info Label -->
                  <div v-if="getFanoutInfo(pair.value)" class="fanout-info-label">
                    <q-icon name="account_tree" size="xs" class="q-mr-xs" />
                    <span class="fanout-label-text">
                      Fanout: <strong>{{ getFanoutInfo(pair.value) }}</strong>
                    </span>
                  </div>
                </div>

                <!-- Delimiter Input -->
                <div class="input-container">
                  <q-select
                    v-model="pair.delimiter"
                    :options="delimiterOptions"
                    label="Delimiter"
                    hint="Separator (can be empty)"
                    outlined
                    dense
                    bg-color="whitesmoke"
                    use-input
                    input-debounce="0"
                    emit-value
                    map-options
                    @new-value="createDelimiter"
                    @update:model-value="updateParams"
                  >
                    <template v-slot:prepend>
                      <q-icon name="compare_arrows" />
                    </template>
                  </q-select>
                </div>
              </div>
            </div>
          </div>

          <!-- Add Row Button -->
          <q-btn
            unelevated
            rounded
            size="md"
            color="primary"
            icon="add"
            label="Add Value & Delimiter"
            class="q-mt-sm"
            @click="addRow"
          />
        </div>
      </template>

      <!-- ConcatArray Operation -->
      <template v-else>
        <div class="col-12 col-md-6">
          <q-input
            v-model="localParams.delimiter"
            label="Delimiter *"
            hint="Character(s) to join the array elements with"
            outlined
            dense
            bg-color="white"
            :error="!!validationErrors.delimiter"
            :error-message="validationErrors.delimiter"
            @update:model-value="updateParams"
          >
            <template v-slot:append>
              <q-icon name="help_outline" color="grey">
                <q-tooltip max-width="300px">
                  Enter the character or string to place between array elements.
                  Examples: "," for CSV, " " for space-separated, etc.
                </q-tooltip>
              </q-icon>
            </template>
          </q-input>

          <!-- Common delimiters quick selection -->
          <div class="common-delimiters q-mt-md">
            <div class="section-label">Quick Select:</div>
            <div class="delimiter-chips">
              <q-chip
                v-for="delim in commonDelimiters"
                :key="delim.value"
                clickable
                outline
                color="warning"
                text-color="white"
                @click="selectDelimiter(delim.value)"
              >
                {{ delim.label }}
              </q-chip>
            </div>
          </div>
        </div>
      </template>
    </div>

    <div class="preview-section">
      <div class="preview-header">
        <q-icon name="visibility" class="q-mr-xs" />
        <span>Live Preview & Validation</span>
      </div>

      <div class="preview-content">
        <div class="preview-row">
          <div class="preview-label">Syntax:</div>
          <div class="preview-value code">{{ syntaxPreview }}</div>
        </div>
        <div class="preview-row">
          <div class="preview-label">Output Example:</div>
          <div class="preview-value code">{{ outputPreview }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { OPERATION_TYPES } from '../../../constants/operations'
import { buildOperationSyntax } from '../../../utils/operationParser'
import { MappingService } from '../../../services/wizard/mappingService'

export default {
  name: 'ConcatOperationConfig',

  props: {
    modelValue: {
      type: Object,
      default: () => ({
        pairs: [{ value: '', delimiter: '' }],
        delimiter: ','
      })
    },
    operationType: {
      type: String,
      required: true,
      validator: (value) => [
        OPERATION_TYPES.CONCAT,
        OPERATION_TYPES.CONCATARRAY
      ].includes(value)
    },
    fieldPath: {
      type: String,
      required: true
    },
    sampleValue: {
      type: [String, Number, Object, Array],
      default: null
    },
    availableFields: {
      type: Array,
      default: () => []
    },
    sampleData: {
      type: Object,
      default: null
    }
  },

  data () {
    // Initialize with proper defaults based on operation type
    // For Concat operation, check if modelValue has meaningful pairs (not just empty ones)
    const hasMeaningfulPairs = this.modelValue?.pairs?.length > 0 &&
                               this.modelValue.pairs.some(p => p.value && p.value.trim() !== '')

    const initialPairs = this.operationType === OPERATION_TYPES.CONCAT
      ? (hasMeaningfulPairs
          ? this.modelValue.pairs
          : [{ value: this.fieldPath || '', delimiter: '' }])
      : undefined

    return {
      localParams: {
        pairs: initialPairs,
        delimiter: this.operationType === OPERATION_TYPES.CONCATARRAY
          ? (this.modelValue?.delimiter || ',')
          : undefined
      },
      validationErrors: {},
      valueOptions: [],
      filteredValueOptions: [],
      fanoutMappings: {}, // Map of field path -> fanout parent
      isUpdatingFromParent: false, // Flag to prevent circular updates
      commonDelimiters: [
        { label: 'Comma (,)', value: ',' },
        { label: 'Space ( )', value: ' ' },
        { label: 'No delimiter', value: '' },
        { label: 'Pipe (|)', value: '|' },
        { label: 'Dash (-)', value: '-' },
        { label: 'Colon (:)', value: ':' },
        { label: 'Semicolon (;)', value: ';' },
        { label: 'Underscore (_)', value: '_' },
        { label: 'Slash (/)', value: '/' }
      ]
    }
  },

  computed: {
    ...mapState('wizard', {
      vuexSampleData: 'sampleData',
      vuexFilterRules: 'filterRules'
    }),

    // Get fanout arrays from store
    fanoutArrays () {
      return this.$store.getters['wizard/getFanoutArrays'] || []
    },

    // Get convertToJson fields and parsed data from store
    jsonToStringFields () {
      const schemaRules = this.$store.state.wizard?.schemaRules
      return schemaRules?.convertToJson || []
    },

    parsedStringifiedFields () {
      const schemaRules = this.$store.state.wizard?.schemaRules
      return schemaRules?.parsedStringifiedJsonFields || {}
    },

    // Get available fields from store
    storeAvailableFields () {
      if (this.vuexFilterRules && this.vuexFilterRules.availableFields && Array.isArray(this.vuexFilterRules.availableFields)) {
        return this.vuexFilterRules.availableFields
      }
      return []
    },

    // Get sample data from store
    storeSampleData () {
      if (this.vuexSampleData && (this.vuexSampleData.parsedData || this.vuexSampleData.dataStructure)) {
        return this.vuexSampleData
      }
      return null
    },

    delimiterOptions () {
      return this.commonDelimiters.map(d => ({
        label: d.label,
        value: d.value
      }))
    },

    // Syntax preview using the actual builder
    syntaxPreview () {
      try {
        if (this.operationType === OPERATION_TYPES.CONCAT) {
          const syntax = buildOperationSyntax(
            OPERATION_TYPES.CONCAT,
            null,
            { pairs: this.localParams.pairs }
          )
          return syntax || 'Invalid configuration'
        } else {
          const syntax = buildOperationSyntax(
            OPERATION_TYPES.CONCATARRAY,
            this.fieldPath,
            { delimiter: this.localParams.delimiter }
          )
          return syntax || 'Invalid configuration'
        }
      } catch (error) {
        return `Error: ${error.message}`
      }
    },

    // Compute a preview of the operation result
    outputPreview () {
      try {
        if (this.operationType === OPERATION_TYPES.CONCAT) {
          // Simulate concatenation
          return this.localParams.pairs
            .map((pair, index) => {
              const value = pair.value.startsWith('$.')
                ? `[${pair.value}]`
                : pair.value
              const delimiter = index < this.localParams.pairs.length - 1
                ? pair.delimiter
                : ''
              return value + delimiter
            })
            .join('')
        } else {
          const input = this.sampleValue !== null ? this.sampleValue : ['a', 'b', 'c']

          if (!Array.isArray(input)) {
            return 'Not an array'
          }

          return input.join(this.localParams.delimiter)
        }
      } catch (error) {
        return `Error: ${error.message}`
      }
    }
  },

  watch: {
    availableFields: {
      handler () {
        this.populateValueOptions()
      },
      deep: true
    },

    sampleData: {
      handler () {
        this.populateValueOptions()
      },
      deep: true
    },

    vuexSampleData: {
      handler (newVal) {
        if (newVal) {
          this.populateValueOptions()
        }
      },
      deep: true
    },

    'vuexFilterRules.availableFields': {
      handler (newVal) {
        if (newVal && newVal.length > 0) {
          this.populateValueOptions()
        }
      },
      deep: true
    },

    modelValue: {
      handler (newVal, oldVal) {
        if (!newVal || this.isUpdatingFromParent) {
          return
        }

        // Only update if the change is coming from outside (not from our own updateParams)
        // Check if the new value is actually different from current localParams
        if (this.operationType === OPERATION_TYPES.CONCAT) {
          const newPairs = newVal.pairs || [{ value: this.fieldPath || '', delimiter: '' }]

          // Only update if pairs actually changed (deep comparison)
          const currentPairs = JSON.stringify(this.localParams.pairs)
          const incomingPairs = JSON.stringify(newPairs)

          if (currentPairs !== incomingPairs) {
            this.isUpdatingFromParent = true
            this.localParams = {
              pairs: newPairs
            }
            this.isUpdatingFromParent = false
          }
        } else {
          if (this.localParams.delimiter !== newVal.delimiter) {
            this.isUpdatingFromParent = true
            this.localParams = {
              delimiter: newVal.delimiter || ','
            }
            this.isUpdatingFromParent = false
          }
        }
      },
      deep: true
    },

    fieldPath (newVal, oldVal) {
      // If fieldPath changes and we're in Concat mode with only one empty row, update it
      if (this.operationType === OPERATION_TYPES.CONCAT &&
          this.localParams.pairs?.length === 1 &&
          (!this.localParams.pairs[0].value || this.localParams.pairs[0].value === oldVal)) {
        this.localParams.pairs[0].value = newVal || ''
        this.updateParams()
      }
    },

    localParams: {
      handler (newVal, oldVal) {
        if (!this.isUpdatingFromParent) {
          this.updateParams()
        }
      },
      immediate: true,
      deep: true
    }
  },

  mounted () {
    // Initialize value options
    this.populateValueOptions()
  },

  methods: {
    /**
     * Populate value options from sample data using MappingService.extractJsonPaths
     * This matches the logic in TransformEditorModal.vue exactly
     */
    populateValueOptions () {
      try {
        // Get sample data from store (same as TransformEditorModal)
        const storeSampleData = this.$store?.state?.wizard?.sampleData

        if (!storeSampleData || (!storeSampleData.parsedData && !storeSampleData.dataStructure)) {
          this.valueOptions = []
          this.filteredValueOptions = []
          return
        }

        // Get fanout arrays from store (same as TransformEditorModal)
        const fanoutArrays = this.$store?.getters?.['wizard/getFanoutArrays'] || []

        // Get convertToJson fields and parsed data from store (same as TransformEditorModal)
        const schemaRules = this.$store?.state?.wizard?.schemaRules
        const jsonToStringFields = schemaRules?.convertToJson || []
        const parsedStringifiedFields = schemaRules?.parsedStringifiedJsonFields || {}

        // Use MappingService.extractJsonPaths with convertToJson options (EXACTLY like TransformEditorModal)
        const extractedPaths = MappingService.extractJsonPaths(
          storeSampleData.parsedData,
          storeSampleData.dataStructure,
          {
            jsonToStringFields,
            parsedStringifiedFields
          }
        )

        if (!extractedPaths || extractedPaths.length === 0) {
          this.valueOptions = []
          this.filteredValueOptions = []
          return
        }

        // Apply fanout transformation to all extracted paths (EXACTLY like TransformEditorModal)
        let transformedPaths = extractedPaths.map(pathObj => {
          // extractJsonPaths returns objects with { value, label, type, sampleValue }
          // Extract the path string from the object
          const absolutePath = typeof pathObj === 'string' ? pathObj : pathObj.value

          if (!absolutePath || typeof absolutePath !== 'string') {
            return null
          }

          // Normalize array indices [0], [1], [2] to [*] BEFORE resolving fanout
          const normalizedPath = absolutePath.replace(/\[(\d+)\]/g, '[*]')

          // Use MappingService to resolve path based on fanout arrays
          const resolved = MappingService.resolvePathForFanout(normalizedPath, fanoutArrays)

          // Store the fanout mapping for this path
          if (resolved.fanoutParent) {
            this.fanoutMappings[resolved.jsonPath] = resolved.fanoutParent
          }

          // Return the RESOLVED path (relative to fanout)
          return resolved.jsonPath
        }).filter(Boolean) // Remove any null values from invalid paths

        // Remove duplicates
        transformedPaths = [...new Set(transformedPaths)]

        this.valueOptions = transformedPaths
        this.filteredValueOptions = transformedPaths
      } catch (error) {
        console.error('[ConcatOperationConfig] Error populating value options:', error)
        this.valueOptions = []
        this.filteredValueOptions = []
      }
    },

    // Add a new row to Concat operation
    addRow () {
      if (this.operationType === OPERATION_TYPES.CONCAT) {
        this.localParams.pairs.push({ value: '', delimiter: '' })
        this.updateParams()
      }
    },

    // Remove a row from Concat operation
    removeRow (index) {
      if (this.operationType === OPERATION_TYPES.CONCAT && this.localParams.pairs.length > 1) {
        this.localParams.pairs.splice(index, 1)
        this.updateParams()
      }
    },

    // Move row up
    moveRowUp (index) {
      if (index > 0) {
        const pairs = this.localParams.pairs
        const temp = pairs[index]
        pairs[index] = pairs[index - 1]
        pairs[index - 1] = temp
        this.updateParams()
      }
    },

    // Move row down
    moveRowDown (index) {
      const pairs = this.localParams.pairs
      if (index < pairs.length - 1) {
        const temp = pairs[index]
        pairs[index] = pairs[index + 1]
        pairs[index + 1] = temp
        this.updateParams()
      }
    },

    // Filter value options for dropdown
    filterValueOptions (val, update) {
      update(() => {
        if (val === '') {
          this.filteredValueOptions = this.valueOptions
        } else {
          const needle = val.toLowerCase()
          this.filteredValueOptions = this.valueOptions.filter(
            v => v.toLowerCase().indexOf(needle) > -1
          )
        }
      })
    },

    // Create custom value
    createValue (val, done) {
      if (val.length > 0) {
        if (!this.valueOptions.includes(val)) {
          this.valueOptions.push(val)
        }
        done(val, 'add-unique')
      }
    },

    // Handle input value changes - this captures typed text
    handleInputValue (pair, val) {
      // If user is typing and the value is not empty, update the pair value directly
      if (val && val.trim() !== '') {
        pair.value = val

        // Add to options if not already there
        if (!this.valueOptions.includes(val)) {
          this.valueOptions.push(val)
        }
      }
    },

    // Create custom delimiter
    createDelimiter (val, done) {
      done(val, 'add-unique')
    },

    // Select a predefined delimiter for ConcatArray operation
    selectDelimiter (value) {
      if (this.operationType === OPERATION_TYPES.CONCATARRAY) {
        this.localParams.delimiter = value
        this.updateParams()
      }
    },

    // Validate parameters
    validateParams () {
      const errors = {}

      if (this.operationType === OPERATION_TYPES.CONCAT) {
        if (!this.localParams.pairs || this.localParams.pairs.length === 0) {
          errors.pairs = 'At least one value is required'
        } else {
          // Check if any value is empty
          const hasEmptyValue = this.localParams.pairs.some(p => !p.value || p.value.trim() === '')
          if (hasEmptyValue) {
            errors.pairs = 'All values must be filled'
          }
        }
      }

      this.validationErrors = errors
      return Object.keys(errors).length === 0
    },

    // Update params and emit change event
    updateParams () {
      this.validateParams()

      const payload = this.operationType === OPERATION_TYPES.CONCAT
        ? { pairs: this.localParams.pairs }
        : { delimiter: this.localParams.delimiter }

      // Emit both events for Vue 2/3 compatibility
      this.$emit('update:modelValue', payload)
      this.$emit('input', payload)
    },

    /**
     * Get fanout information for a given field path
     * Returns the fanout parent path if the field is derived from a fanout array
     */
    getFanoutInfo (fieldPath) {
      if (!fieldPath || typeof fieldPath !== 'string') {
        return null
      }

      // Check if we have a stored fanout mapping for this path
      return this.fanoutMappings[fieldPath] || null
    }
  }
}
</script>

<style scoped>
.operation-info-banner {
  background: rgba(33, 150, 243, 0.1) !important;
  border-left: 3px solid #2196F3 !important;
  color: rgba(227, 242, 253, 0.9) !important;

  ::v-deep .q-banner__avatar {
    color: #2196F3 !important;
  }

  ::v-deep .text-body1,
  ::v-deep .text-body2 {
    color: rgba(227, 242, 253, 0.9) !important;
  }

  ::v-deep strong {
    color: #2196F3;
  }
}

.concat-operation-config {
  padding: 8px 0;
}

.section-label {
  font-size: 14px;
  color: #ff9800;
  font-weight: 500;
  margin-bottom: 12px;
}

/* Concat Rows Grid */
.concat-rows {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.concat-row {
  padding: 16px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
}

.row-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.row-number {
  font-size: 13px;
  font-weight: 600;
  color: #2196f3;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.row-controls {
  display: flex;
  align-items: center;
  gap: 4px;
}

.row-inputs {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.input-container {
  display: flex;
  flex-direction: column;
}

.fanout-info-label {
  display: flex;
  align-items: center;
  margin-top: 4px;
  padding: 4px 8px;
  background: rgba(33, 150, 243, 0.1);
  border-left: 3px solid #2196f3;
  border-radius: 4px;
  font-size: 11px;
  color: #2196f3;
}

.fanout-label-text {
  color: rgba(33, 150, 243, 0.9);
}

.fanout-label-text strong {
  color: #2196f3;
  font-weight: 600;
}

.concat-input-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.concat-input {
  flex: 1;
}

.common-delimiters {
  margin: 16px 0;
}

.delimiter-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.preview-section {
  margin-top: 24px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.05);
}

.preview-header {
  font-weight: 500;
  color: #ff9800;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
}

.preview-content {
  margin-top: 8px;
  padding: 12px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 6px;
}

.preview-row {
  display: flex;
  margin-bottom: 12px;
  flex-wrap: wrap;
}

.preview-row:last-child {
  margin-bottom: 0;
}

.preview-label {
  width: 130px;
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
  font-weight: 500;
}

.preview-value {
  flex: 1;
  color: #e3f2fd;
  word-break: break-all;
}

.code {
  font-family: 'Courier New', monospace;
  background-color: rgba(0, 0, 0, 0.2);
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 13px;
}

@media (max-width: 768px) {
  .row-inputs {
    grid-template-columns: 1fr;
  }

  .preview-row {
    flex-direction: column;
  }

  .preview-label {
    width: 100%;
    margin-bottom: 4px;
  }

  .preview-value {
    width: 100%;
  }
}
</style>
