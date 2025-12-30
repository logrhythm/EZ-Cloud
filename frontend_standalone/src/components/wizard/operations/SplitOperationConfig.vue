<template>
  <div class="split-operation-config">
    <q-banner class="operation-info-banner q-mb-md">
      <template v-slot:avatar>
        <q-icon name="call_split" color="primary" />
      </template>
      <div class="text-body1">
        <strong>SPLIT Operation</strong> - Splits a string by a delimiter and returns a specific index
      </div>
      <div class="text-body2 q-mt-sm">
        Use this to extract a specific part from delimited text.
      </div>
    </q-banner>

    <div class="row q-col-gutter-md">
      <!-- Delimiter Input -->
      <div class="col-12 col-md-6">
        <q-input
          v-model="localParams.delimiter"
          label="Delimiter"
          hint="Character(s) to split on (empty = split every character)"
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
                Enter the character or string that separates the values.
                Examples: "," for CSV, "=" for key-value pairs, "" (empty) to split every character
              </q-tooltip>
            </q-icon>
          </template>
        </q-input>
      </div>

      <!-- Index Input -->
      <div class="col-12 col-md-6">
        <q-input
          v-model.number="localParams.index"
          type="number"
          label="Index *"
          hint="Position of the part to extract (0-based)"
          outlined
          dense
          min="0"
          bg-color="white"
          :error="!!validationErrors.index"
          :error-message="validationErrors.index"
          @update:model-value="updateParams"
        >
          <template v-slot:append>
            <q-icon name="help_outline" color="grey">
              <q-tooltip max-width="300px">
                Index of the part to extract (0-based).
                For "a,b,c" split by ",", index 0 is "a", index 1 is "b", etc.
              </q-tooltip>
            </q-icon>
          </template>
        </q-input>
      </div>
    </div>

    <!-- Common delimiters quick selection -->
    <div class="common-delimiters q-mt-md">
      <div class="section-label">Quick Select:</div>
      <div class="delimiter-chips">
        <q-chip
          v-for="delim in commonDelimiters"
          :key="delim.value"
          clickable
          outline
          color="primary"
          text-color="white"
          @click="selectDelimiter(delim.value)"
        >
          {{ delim.label }}
        </q-chip>
      </div>
    </div>

    <div class="preview-section">
      <div class="preview-header">
        <q-icon name="visibility" class="q-mr-xs" />
        <span>Live Preview & Validation</span>
      </div>

      <!-- Array Validation Results -->
      <div v-if="isArrayInput" class="validation-results q-mt-md">
        <div class="validation-header">
          <q-icon name="fact_check" class="q-mr-xs" />
          <span>Validation Results ({{ sampleValuesArray.length }} value{{ sampleValuesArray.length !== 1 ? 's' : '' }})</span>
        </div>

        <q-list bordered separator class="validation-list">
          <q-item
            v-for="(result, index) in validationResults"
            :key="index"
            :class="result.isValid ? 'valid-item' : 'invalid-item'"
          >
            <q-item-section avatar>
              <q-icon
                :name="result.isValid ? 'check_circle' : 'error'"
                :color="result.isValid ? 'positive' : 'negative'"
                size="sm"
              />
            </q-item-section>

            <q-item-section>
              <q-item-label>
                <code class="input-value">{{ result.input }}</code>
                <q-icon name="arrow_forward" size="xs" class="q-mx-xs" />
                <code :class="result.isValid ? 'output-value-valid' : 'output-value-invalid'">
                  {{ result.output }}
                </code>
              </q-item-label>
              <q-item-label caption v-if="!result.isValid" class="error-caption">
                {{ result.error }}
              </q-item-label>
            </q-item-section>

            <q-item-section side>
              <q-badge :color="result.isValid ? 'positive' : 'negative'">
                {{ result.isValid ? 'Valid' : 'Invalid' }}
              </q-badge>
            </q-item-section>
          </q-item>
        </q-list>

        <!-- Summary -->
        <div class="validation-summary q-mt-sm">
          <q-chip color="positive" text-color="white" icon="check_circle">
            {{ validCount }} Valid
          </q-chip>
          <q-chip color="negative" text-color="white" icon="error">
            {{ invalidCount }} Invalid
          </q-chip>
        </div>
      </div>

      <!-- Single Value Preview -->
      <div v-else class="preview-content">
        <div class="preview-row">
          <div class="preview-label">Sample Input:</div>
          <div class="preview-value code">{{ sampleValue || 'key=value' }}</div>
        </div>
        <div class="preview-row">
          <div class="preview-label">Output:</div>
          <div class="preview-value code">{{ previewOutput }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch } from 'vue'

export default {
  name: 'SplitOperationConfig',

  props: {
    value: { // Vue 2 uses 'value' prop, not 'modelValue'
      type: Object,
      default: () => ({
        delimiter: '',
        index: 0
      })
    },
    fieldPath: {
      type: String,
      required: true
    },
    sampleValue: {
      type: [String, Number, Object, Array],
      default: null
    }
  },

  // Vue 2 emits 'input' event, not 'update:modelValue'

  setup (props, { emit }) {
    const localParams = ref({
      delimiter: props.value?.delimiter !== undefined ? props.value.delimiter : '',
      index: props.value?.index !== undefined ? props.value.index : 0
    })

    const validationErrors = ref({})

    const commonDelimiters = [
      { label: 'Comma (,)', value: ',' },
      { label: 'Space ( )', value: ' ' },
      { label: 'Equals (=)', value: '=' },
      { label: 'Semicolon (;)', value: ';' },
      { label: 'Colon (:)', value: ':' },
      { label: 'Pipe (|)', value: '|' },
      { label: 'Tab (\\t)', value: '\t' }
    ]

    // Validate parameters
    const validateParams = () => {
      const errors = {}

      // Note: Empty delimiter is VALID (splits every character)
      // Only check if delimiter is null or undefined
      if (localParams.value.delimiter === null || localParams.value.delimiter === undefined) {
        errors.delimiter = 'Delimiter cannot be null or undefined'
      }

      if (localParams.value.index === null || localParams.value.index === undefined || localParams.value.index < 0) {
        errors.index = 'Index must be 0 or higher'
      }

      validationErrors.value = errors
      return Object.keys(errors).length === 0
    }

    // Update params and emit change event
    const updateParams = () => {
      validateParams()
      // Vue 2 uses 'input' event for v-model
      emit('input', {
        delimiter: localParams.value.delimiter,
        index: localParams.value.index
      })
    }

    // Select a predefined delimiter
    const selectDelimiter = (value) => {
      localParams.value.delimiter = value
      updateParams()
    }

    // Check if sample value is an array
    const isArrayInput = computed(() => {
      return Array.isArray(props.sampleValue) && props.sampleValue.length > 0
    })

    // Get array of sample values
    const sampleValuesArray = computed(() => {
      if (Array.isArray(props.sampleValue)) {
        return props.sampleValue
      }
      return props.sampleValue !== null && props.sampleValue !== undefined ? [props.sampleValue] : []
    })

    // Perform split operation on a single value
    const performSplit = (input, delimiter, index) => {
      if (!delimiter) {
        return {
          isValid: false,
          output: 'N/A',
          error: 'Delimiter is required'
        }
      }

      if (typeof input !== 'string') {
        return {
          isValid: false,
          output: 'N/A',
          error: 'Input is not a string'
        }
      }

      try {
        const parts = input.split(delimiter)

        if (index >= parts.length) {
          return {
            isValid: false,
            output: `Index ${index} out of bounds`,
            error: `Max index: ${parts.length - 1}`
          }
        }

        return {
          isValid: true,
          output: parts[index] || '(empty string)',
          error: null
        }
      } catch (error) {
        return {
          isValid: false,
          output: 'Error',
          error: error.message
        }
      }
    }

    // Validate all values in the array
    const validationResults = computed(() => {
      if (!isArrayInput.value) {
        return []
      }

      return sampleValuesArray.value.map((value, idx) => {
        const result = performSplit(value, localParams.value.delimiter, localParams.value.index)
        return {
          index: idx,
          input: value,
          isValid: result.isValid,
          output: result.output,
          error: result.error
        }
      })
    })

    // Count valid and invalid results
    const validCount = computed(() => {
      return validationResults.value.filter(r => r.isValid).length
    })

    const invalidCount = computed(() => {
      return validationResults.value.filter(r => !r.isValid).length
    })

    // Compute a preview of the operation result (for single value)
    const previewOutput = computed(() => {
      const input = props.sampleValue || 'key=value'

      if (!localParams.value.delimiter) {
        return '(Set a delimiter)'
      }

      try {
        if (typeof input === 'string') {
          const parts = input.split(localParams.value.delimiter)
          const index = localParams.value.index

          if (index >= parts.length) {
            return `(Index ${index} is out of bounds. Max: ${parts.length - 1})`
          }

          return parts[index] || '(empty string)'
        }
        return '(Input is not a string)'
      } catch (error) {
        return `Error: ${error.message}`
      }
    })

    // Watch for user changes to localParams and emit to parent
    // Use immediate: true to emit initial values when component mounts
    // Vue 2 uses 'input' event for v-model
    watch(localParams, (newVal, oldVal) => {
      console.log('[SplitOperationConfig] localParams changed')
      console.log('  Old:', JSON.stringify(oldVal))
      console.log('  New:', JSON.stringify(newVal))
      console.log('  Emitting input event (Vue 2 v-model)...')

      emit('input', {
        delimiter: newVal.delimiter,
        index: newVal.index
      })
    }, { immediate: true, deep: true })

    // Watch for external prop changes (from parent)
    // Don't emit back to avoid infinite loop
    watch(() => props.value, (newVal) => {
      if (newVal) {
        // Only update if different to avoid triggering the localParams watcher unnecessarily
        if (newVal.delimiter !== localParams.value.delimiter || newVal.index !== localParams.value.index) {
          console.log('[SplitOperationConfig] props.value changed from parent, updating localParams')
          localParams.value = {
            delimiter: newVal.delimiter !== undefined ? newVal.delimiter : '',
            index: newVal.index !== undefined ? newVal.index : 0
          }
        }
      }
    }, { deep: true })

    return {
      localParams,
      validationErrors,
      commonDelimiters,
      selectDelimiter,
      updateParams,
      previewOutput,
      // Array validation
      isArrayInput,
      sampleValuesArray,
      validationResults,
      validCount,
      invalidCount
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

.split-operation-config {
  padding: 8px 0;
}

.section-label {
  font-size: 14px;
  color: #2196f3;
  font-weight: 500;
  margin-bottom: 8px;
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
  margin-top: 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.05);
}

.preview-header {
  font-weight: 500;
  color: #2196f3;
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
  width: 110px;
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
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
}

.code {
  font-family: 'Courier New', monospace;
  background-color: rgba(0, 0, 0, 0.2);
  padding: 4px 8px;
  border-radius: 4px;
}

/* Validation Results */
.validation-results {
  margin-top: 16px;
}

.validation-header {
  font-weight: 500;
  color: #2196f3;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  font-size: 14px;
}

.validation-list {
  max-height: 300px;
  overflow-y: auto;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 6px;
}

.valid-item {
  background: rgba(76, 175, 80, 0.05) !important;
  border-left: 3px solid #4caf50 !important;
}

.invalid-item {
  background: rgba(244, 67, 54, 0.05) !important;
  border-left: 3px solid #f44336 !important;
}

.input-value {
  font-family: 'Courier New', monospace;
  background-color: rgba(33, 150, 243, 0.2);
  padding: 2px 6px;
  border-radius: 3px;
  color: #64b5f6;
  font-weight: 500;
}

.output-value-valid {
  font-family: 'Courier New', monospace;
  background-color: rgba(76, 175, 80, 0.2);
  padding: 2px 6px;
  border-radius: 3px;
  color: #81c784;
  font-weight: 500;
}

.output-value-invalid {
  font-family: 'Courier New', monospace;
  background-color: rgba(244, 67, 54, 0.2);
  padding: 2px 6px;
  border-radius: 3px;
  color: #e57373;
  font-weight: 500;
}

.error-caption {
  color: #f44336 !important;
  font-size: 12px;
  margin-top: 4px;
}

.validation-summary {
  display: flex;
  gap: 8px;
  margin-top: 12px;
  justify-content: flex-start;
}

@media (max-width: 768px) {
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
