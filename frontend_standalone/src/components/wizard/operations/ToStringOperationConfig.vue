<template>
  <div class="tostring-operation-config">
    <q-banner class="operation-info-banner q-mb-md">
      <template v-slot:avatar>
        <q-icon name="text_fields" color="purple" />
      </template>
      <div class="text-body1">
        <strong>ToString Operation</strong> - Converts a value to a String
      </div>
      <div class="text-body2 q-mt-sm">
        This operation doesn't require any additional configuration.
        It will convert the input field value to a string representation.
      </div>
    </q-banner>

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
            class="valid-item"
          >
            <q-item-section avatar>
              <q-icon
                name="check_circle"
                color="positive"
                size="sm"
              />
            </q-item-section>

            <q-item-section>
              <q-item-label>
                <code class="input-value">{{ result.input }} ({{ result.type }})</code>
                <q-icon name="arrow_forward" size="xs" class="q-mx-xs" />
                <code class="output-value-valid">
                  {{ result.output }}
                </code>
              </q-item-label>
            </q-item-section>

            <q-item-section side>
              <q-badge color="positive">
                Valid
              </q-badge>
            </q-item-section>
          </q-item>
        </q-list>

        <!-- Summary -->
        <div class="validation-summary q-mt-sm">
          <q-chip color="positive" text-color="white" icon="check_circle">
            {{ sampleValuesArray.length }} Converted
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
          <div class="preview-label">Type:</div>
          <div class="preview-value code">{{ displayType }}</div>
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
import { computed } from 'vue'

export default {
  name: 'ToStringOperationConfig',

  props: {
    modelValue: {
      type: Object,
      default: () => ({})
    },
    fieldPath: {
      type: String,
      required: true
    },
    sampleValue: {
      type: [String, Number, Boolean, Object, Array],
      default: null
    }
  },

  emits: ['update:modelValue'],

  setup (props) {
    // ToString operation doesn't need parameters, so we have an empty object

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

    // Convert a single value to string
    const convertToString = (input) => {
      let type = 'unknown'
      let output = ''

      if (input === null) {
        type = 'null'
        output = '"null"'
      } else if (input === undefined) {
        type = 'undefined'
        output = '"undefined"'
      } else if (Array.isArray(input)) {
        type = 'array'
        output = `"${JSON.stringify(input)}"`
      } else if (typeof input === 'object') {
        type = 'object'
        output = `"${JSON.stringify(input)}"`
      } else {
        type = typeof input
        output = `"${String(input)}"`
      }

      return { type, output }
    }

    // Validate all values in the array
    const validationResults = computed(() => {
      if (!isArrayInput.value) {
        return []
      }

      return sampleValuesArray.value.map((value, idx) => {
        const result = convertToString(value)
        return {
          index: idx,
          input: value === null ? 'null' : (value === undefined ? 'undefined' : (typeof value === 'object' ? JSON.stringify(value) : String(value))),
          type: result.type,
          output: result.output
        }
      })
    })

    // Display values for preview (single value)
    const displayInput = computed(() => {
      const input = props.sampleValue

      if (input === null || input === undefined) {
        return '123'
      }

      if (typeof input === 'object') {
        return JSON.stringify(input)
      }

      return String(input)
    })

    const displayType = computed(() => {
      const input = props.sampleValue

      if (input === null) {
        return 'null'
      }

      if (input === undefined) {
        return 'undefined'
      }

      if (Array.isArray(input)) {
        return 'array'
      }

      return typeof input
    })

    // Compute a preview of the operation result
    const previewOutput = computed(() => {
      const input = props.sampleValue

      if (input === null) {
        return '"null"'
      }

      if (input === undefined) {
        return '"undefined"'
      }

      if (typeof input === 'object') {
        return `"${JSON.stringify(input)}"`
      }

      return `"${String(input)}"`
    })

    return {
      displayInput,
      displayType,
      previewOutput,
      // Array validation
      isArrayInput,
      sampleValuesArray,
      validationResults
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

.tostring-operation-config {
  padding: 8px 0;
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
  color: #9c27b0;
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
  color: #9c27b0;
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
