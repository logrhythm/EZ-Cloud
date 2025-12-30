<template>
  <div class="concat-operation-config">
    <q-banner class="operation-info-banner q-mb-md">
      <template v-slot:avatar>
        <q-icon :name="operationType === 'Concat' ? 'add_link' : 'merge_type'" color="warning" />
      </template>
      <div class="text-body1">
        <strong>{{ operationType === 'Concat' ? 'Concat' : 'ConcatArray' }} Operation</strong>
        - {{ operationType === 'Concat' ? 'Concatenates two or more string values' : 'Joins array elements with a delimiter' }}
      </div>
      <div class="text-body2 q-mt-sm">
        {{ operationType === 'Concat'
          ? 'Use this to join multiple string values together.'
          : 'Use this to convert an array into a delimited string.'
        }}
      </div>
    </q-banner>

    <div class="row q-col-gutter-md">
      <!-- Concat Operation -->
      <template v-if="operationType === 'Concat'">
        <div class="col-12">
          <div class="section-label">Values to Join:</div>
          <div v-for="(val, index) in localParams.values" :key="index" class="concat-input-row q-mb-sm">
            <q-input
              v-model="localParams.values[index]"
              :label="`Value ${index + 1}${index < 2 ? ' *' : ''}`"
              outlined
              dense
              bg-color="white"
              class="concat-input"
              @update:model-value="updateParams"
            />
            <q-btn
              v-if="index >= 2"
              round
              flat
              size="sm"
              icon="remove"
              color="negative"
              @click="removeValue(index)"
            />
          </div>
          <q-btn
            unelevated
            rounded
            size="sm"
            color="primary"
            icon="add"
            label="Add Another Value"
            class="q-mt-sm"
            @click="addValue"
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
          <div class="preview-label">Sample Input:</div>
          <div class="preview-value code">{{ displayInput }}</div>
        </div>
        <div class="preview-row">
          <div class="preview-label">Operation:</div>
          <div class="preview-value code">{{ displayOperation }}</div>
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
import { OPERATION_TYPES } from '../../../constants/operations'

export default {
  name: 'ConcatOperationConfig',

  props: {
    modelValue: {
      type: Object,
      default: () => ({
        values: ['', ''],
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
    }
  },

  emits: ['update:modelValue', 'input'],

  setup (props, { emit }) {
    // Initialize with proper defaults based on operation type
    const localParams = ref({
      values: props.operationType === OPERATION_TYPES.CONCAT
        ? (props.modelValue?.values || ['', ''])
        : undefined,
      delimiter: props.operationType === OPERATION_TYPES.CONCATARRAY
        ? (props.modelValue?.delimiter || ',')
        : undefined
    })

    const validationErrors = ref({})

    const commonDelimiters = [
      { label: 'Comma (,)', value: ',' },
      { label: 'Space ( )', value: ' ' },
      { label: 'No delimiter', value: '' },
      { label: 'Pipe (|)', value: '|' },
      { label: 'Dash (-)', value: '-' },
      { label: 'Colon (:)', value: ':' }
    ]

    // Add a new value to Concat operation
    const addValue = () => {
      if (props.operationType === OPERATION_TYPES.CONCAT) {
        localParams.value.values.push('')
        updateParams()
      }
    }

    // Remove a value from Concat operation
    const removeValue = (index) => {
      if (props.operationType === OPERATION_TYPES.CONCAT && index >= 2) {
        localParams.value.values.splice(index, 1)
        updateParams()
      }
    }

    // Select a predefined delimiter for ConcatArray operation
    const selectDelimiter = (value) => {
      if (props.operationType === OPERATION_TYPES.CONCATARRAY) {
        localParams.value.delimiter = value
        updateParams()
      }
    }

    // Validate parameters
    const validateParams = () => {
      const errors = {}

      if (props.operationType === OPERATION_TYPES.CONCAT) {
        if (!localParams.value.values || localParams.value.values.length < 2) {
          errors.values = 'At least two values are required'
        }
      } else if (props.operationType === OPERATION_TYPES.CONCATARRAY) {
        // Delimiter can be empty, so no validation needed here
      }

      validationErrors.value = errors
      return Object.keys(errors).length === 0
    }

    // Update params and emit change event
    const updateParams = () => {
      validateParams()

      const payload = props.operationType === OPERATION_TYPES.CONCAT
        ? { values: localParams.value.values }
        : { delimiter: localParams.value.delimiter }

      // Emit both events for Vue 2/3 compatibility
      emit('update:modelValue', payload)
      emit('input', payload)
    }

    // Display values for preview
    const displayInput = computed(() => {
      if (props.operationType === OPERATION_TYPES.CONCAT) {
        return 'N/A (This operation uses the values below)'
      } else {
        const input = props.sampleValue !== null ? props.sampleValue : ['a', 'b', 'c']
        return Array.isArray(input) ? JSON.stringify(input) : 'Not an array'
      }
    })

    const displayOperation = computed(() => {
      if (props.operationType === OPERATION_TYPES.CONCAT) {
        return localParams.value.values.map(val =>
          val ? `"${val}"` : '""'
        ).join(' + ')
      } else {
        const delimiter = localParams.value.delimiter !== undefined
          ? `"${localParams.value.delimiter}"`
          : '","'
        return `join(array, ${delimiter})`
      }
    })

    // Compute a preview of the operation result
    const previewOutput = computed(() => {
      try {
        if (props.operationType === OPERATION_TYPES.CONCAT) {
          return localParams.value.values.join('')
        } else {
          const input = props.sampleValue !== null ? props.sampleValue : ['a', 'b', 'c']

          if (!Array.isArray(input)) {
            return 'Not an array'
          }

          return input.join(localParams.value.delimiter)
        }
      } catch (error) {
        return `Error: ${error.message}`
      }
    })

    // Watch for external prop changes
    watch(() => props.modelValue, (newVal) => {
      if (newVal) {
        if (props.operationType === OPERATION_TYPES.CONCAT) {
          localParams.value = {
            values: newVal.values || ['', '']
          }
        } else {
          localParams.value = {
            delimiter: newVal.delimiter || ','
          }
        }
      }
    }, { deep: true })

    // Watch localParams and emit immediately on mount
    watch(localParams, (newVal) => {
      console.log('[ConcatOperationConfig] localParams changed:', JSON.stringify(newVal, null, 2))

      const payload = props.operationType === OPERATION_TYPES.CONCAT
        ? { values: newVal.values }
        : { delimiter: newVal.delimiter }

      // Emit both events for Vue 2/3 compatibility
      emit('update:modelValue', payload)
      emit('input', payload)
    }, { immediate: true, deep: true })

    return {
      localParams,
      validationErrors,
      commonDelimiters,
      addValue,
      removeValue,
      selectDelimiter,
      updateParams,
      displayInput,
      displayOperation,
      previewOutput
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
  margin-bottom: 8px;
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
  margin-top: 16px;
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
