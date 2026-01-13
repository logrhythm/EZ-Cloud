<template>
  <div class="epoch-datetime-config">
    <q-banner class="operation-info-banner q-mb-md">
      <template v-slot:avatar>
        <q-icon name="schedule" color="primary" />
      </template>
      <div class="text-body1">
        <strong>{{ operationTitle }} Operation</strong> - {{ operationDescription }}
      </div>
      <div class="text-body2 q-mt-sm">
        {{ operationInstructions }}
      </div>
    </q-banner>

    <div class="no-config-message">
      <q-icon name="info" size="24px" color="primary" />
      <span>This operation requires no additional configuration.</span>
    </div>

    <!-- Live Preview & Validation -->
    <div class="preview-section q-mt-md">
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
          <div class="preview-value code">{{ displayInput }}</div>
        </div>
        <div class="preview-row">
          <div class="preview-label">Operation:</div>
          <div class="preview-value code">{{ operationTitle }}</div>
        </div>
        <div class="preview-row">
          <div class="preview-label">Output:</div>
          <div :class="['preview-value', 'code', previewError ? 'error-value' : 'success-value']">
            {{ previewOutput }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { computed, watch } from 'vue'
import { OPERATION_TYPES } from '../../../constants/operations'

export default {
  name: 'EpochDateTimeConfig',

  props: {
    modelValue: {
      type: Object,
      default: () => ({})
    },
    operationType: {
      type: String,
      required: true,
      validator: (value) => [
        OPERATION_TYPES.EPOCHSECS_TO_DATETIME,
        OPERATION_TYPES.EPOCHMILLIS_TO_DATETIME,
        OPERATION_TYPES.EPOCHMICROS_TO_DATETIME,
        OPERATION_TYPES.CONVERT_DATETIME
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

  emits: ['update:modelValue'],

  setup (props, { emit }) {
    // Operation-specific metadata
    const operationTitle = computed(() => {
      switch (props.operationType) {
        case OPERATION_TYPES.EPOCHSECS_TO_DATETIME: return 'Epoch Seconds to DateTime'
        case OPERATION_TYPES.EPOCHMILLIS_TO_DATETIME: return 'Epoch MilliSeconds to DateTime'
        case OPERATION_TYPES.EPOCHMICROS_TO_DATETIME: return 'Epoch MicroSeconds to DateTime'
        case OPERATION_TYPES.CONVERT_DATETIME: return 'Convert To DateTime Format'
        default: return ''
      }
    })

    const operationDescription = computed(() => {
      switch (props.operationType) {
        case OPERATION_TYPES.EPOCHSECS_TO_DATETIME: return 'Converts Unix timestamp (seconds) to DateTime'
        case OPERATION_TYPES.EPOCHMILLIS_TO_DATETIME: return 'Converts Unix timestamp (milliseconds) to DateTime'
        case OPERATION_TYPES.EPOCHMICROS_TO_DATETIME: return 'Converts Unix timestamp (microseconds) to DateTime'
        case OPERATION_TYPES.CONVERT_DATETIME: return 'Converts date-time from one format to another'
        default: return ''
      }
    })

    const operationInstructions = computed(() => {
      switch (props.operationType) {
        case OPERATION_TYPES.EPOCHSECS_TO_DATETIME: return 'Converts Unix epoch time in seconds to a human-readable datetime format using system defaults.'
        case OPERATION_TYPES.EPOCHMILLIS_TO_DATETIME: return 'Converts Unix epoch time in milliseconds to a human-readable datetime format using system defaults.'
        case OPERATION_TYPES.EPOCHMICROS_TO_DATETIME: return 'Converts Unix epoch time in microseconds to a human-readable datetime format using system defaults.'
        case OPERATION_TYPES.CONVERT_DATETIME: return 'Converts date-time from one format to another with the specified output format.'
        default: return ''
      }
    })

    // Check if sample value is an array
    const isArrayInput = computed(() => {
      return Array.isArray(props.sampleValue)
    })

    // Get array of sample values
    const sampleValuesArray = computed(() => {
      if (Array.isArray(props.sampleValue)) {
        return props.sampleValue
      }
      return []
    })

    // Display input for preview
    const displayInput = computed(() => {
      if (props.operationType === OPERATION_TYPES.CONVERT_DATETIME) {
        return 'Current time (now)'
      }

      // Default sample values based on operation type
      let defaultValue
      switch (props.operationType) {
        case OPERATION_TYPES.EPOCHSECS_TO_DATETIME:
          defaultValue = 1634567890
          break
        case OPERATION_TYPES.EPOCHMILLIS_TO_DATETIME:
          defaultValue = 1634567890000
          break
        case OPERATION_TYPES.EPOCHMICROS_TO_DATETIME:
          defaultValue = 1634567890000000
          break
        default:
          defaultValue = 0
      }

      const input = props.sampleValue !== null && props.sampleValue !== undefined ? props.sampleValue : defaultValue
      return typeof input === 'number' ? input : input
    })

    // Convert timestamp to datetime string
    const convertToDateTime = (value) => {
      try {
        if (props.operationType === OPERATION_TYPES.CONVERT_DATETIME) {
          return formatDate(new Date())
        }

        if (typeof value !== 'number') {
          return { error: 'Not a numeric timestamp', isValid: false }
        }

        let timestamp
        switch (props.operationType) {
          case OPERATION_TYPES.EPOCHSECS_TO_DATETIME:
            timestamp = value * 1000 // Convert seconds to milliseconds
            break
          case OPERATION_TYPES.EPOCHMILLIS_TO_DATETIME:
            timestamp = value // Already in milliseconds
            break
          case OPERATION_TYPES.EPOCHMICROS_TO_DATETIME:
            timestamp = Math.floor(value / 1000) // Convert microseconds to milliseconds
            break
          default:
            timestamp = 0
        }

        const date = new Date(timestamp)

        // Check if date is valid
        if (isNaN(date.getTime())) {
          return { error: 'Invalid timestamp', isValid: false }
        }

        return { output: formatDate(date), isValid: true }
      } catch (error) {
        return { error: error.message, isValid: false }
      }
    }

    // Format date to string
    const formatDate = (date) => {
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      const hours = String(date.getHours()).padStart(2, '0')
      const minutes = String(date.getMinutes()).padStart(2, '0')
      const seconds = String(date.getSeconds()).padStart(2, '0')
      const milliseconds = String(date.getMilliseconds()).padStart(3, '0')

      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}.${milliseconds}`
    }

    // Compute preview output for single value
    const previewOutput = computed(() => {
      const result = convertToDateTime(displayInput.value)

      if (result.isValid === false) {
        return result.error
      }

      return result.output
    })

    // Check if preview has error
    const previewError = computed(() => {
      const result = convertToDateTime(displayInput.value)
      return result.isValid === false
    })

    // Validation results for array input
    const validationResults = computed(() => {
      if (!isArrayInput.value) return []

      return sampleValuesArray.value.map(value => {
        const result = convertToDateTime(value)
        return {
          input: value,
          output: result.output || result.error,
          isValid: result.isValid !== false,
          error: result.error
        }
      })
    })

    // Count valid/invalid results
    const validCount = computed(() => {
      return validationResults.value.filter(r => r.isValid).length
    })

    const invalidCount = computed(() => {
      return validationResults.value.filter(r => !r.isValid).length
    })

    // Emit empty object on mount (no parameters needed)
    watch(() => props.modelValue, () => {
      emit('update:modelValue', {})
    })

    return {
      operationTitle,
      operationDescription,
      operationInstructions,
      isArrayInput,
      sampleValuesArray,
      displayInput,
      previewOutput,
      previewError,
      validationResults,
      validCount,
      invalidCount
    }
  }
}
</script>

<style scoped>
.epoch-datetime-config {
  padding: 8px 0;
}

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

.no-config-message {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: rgba(33, 150, 243, 0.05);
  border: 1px dashed rgba(33, 150, 243, 0.3);
  border-radius: 6px;
  color: rgba(227, 242, 253, 0.7);
  font-size: 14px;
  font-style: italic;
  margin-top: 8px;
}

/* Preview Section */
.preview-section {
  margin-top: 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.05);
}

.preview-header {
  font-weight: 500;
  color: #ff5722;
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

.success-value {
  color: #4caf50 !important;
  background-color: rgba(76, 175, 80, 0.1) !important;
}

.error-value {
  color: #f44336 !important;
  background-color: rgba(244, 67, 54, 0.1) !important;
}

/* Validation Results */
.validation-results {
  margin-top: 12px;
}

.validation-header {
  font-weight: 500;
  color: #ff5722;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
}

.validation-list {
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  overflow: hidden;
}

.valid-item {
  background: rgba(76, 175, 80, 0.05);
  border-left: 3px solid #4caf50;
}

.invalid-item {
  background: rgba(244, 67, 54, 0.05);
  border-left: 3px solid #f44336;
}

.input-value {
  color: #90caf9;
  background: rgba(33, 150, 243, 0.1);
  padding: 2px 6px;
  border-radius: 3px;
  font-family: monospace;
  font-size: 13px;
}

.output-value-valid {
  color: #4caf50;
  background: rgba(76, 175, 80, 0.1);
  padding: 2px 6px;
  border-radius: 3px;
  font-family: monospace;
  font-size: 13px;
}

.output-value-invalid {
  color: #f44336;
  background: rgba(244, 67, 54, 0.1);
  padding: 2px 6px;
  border-radius: 3px;
  font-family: monospace;
  font-size: 13px;
}

.error-caption {
  color: #f44336 !important;
  font-size: 12px;
  margin-top: 4px;
}

.validation-summary {
  display: flex;
  gap: 8px;
  justify-content: flex-start;
  margin-top: 12px;
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
