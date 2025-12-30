<template>
  <div class="isip-operation-config">
    <q-banner class="operation-info-banner q-mb-md">
      <template v-slot:avatar>
        <q-icon name="info" color="primary" />
      </template>
      <div class="text-body1">
        <strong>IsIP Operation</strong> - Validates if a value is an IP address
      </div>
      <div class="text-body2 q-mt-sm">
        This operation doesn't require any additional configuration.
        It will check if the input field contains a valid IPv4 or IPv6 address.
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
            </q-item-section>

            <q-item-section side>
              <q-badge :color="result.isValid ? 'positive' : 'negative'">
                {{ result.isValid ? 'Valid IP' : 'Not an IP' }}
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
          <div class="preview-value code">{{ sampleValue || '192.168.1.1' }}</div>
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
  name: 'IsIPOperationConfig',

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
      type: [String, Number, Object, Array],
      default: null
    }
  },

  emits: ['update:modelValue'],

  setup (props) {
    // IsIP operation doesn't need parameters, so we have an empty object

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

    // Validate if a value is an IP address
    const validateIP = (input) => {
      // Simple regex to check if the input is an IP address
      const ipv4Regex = /^(?:\d{1,3}\.){3}\d{1,3}$/
      const ipv6Regex = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/

      if (typeof input !== 'string') {
        return {
          isValid: false,
          output: 'false'
        }
      }

      const isValid = ipv4Regex.test(input) || ipv6Regex.test(input)
      return {
        isValid,
        output: isValid ? 'true' : 'false'
      }
    }

    // Validate all values in the array
    const validationResults = computed(() => {
      if (!isArrayInput.value) {
        return []
      }

      return sampleValuesArray.value.map((value, idx) => {
        const result = validateIP(value)
        return {
          index: idx,
          input: value,
          isValid: result.isValid,
          output: result.output
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

    // Compute a preview of the operation result (single value)
    const previewOutput = computed(() => {
      const input = props.sampleValue || '192.168.1.1'

      // Simple regex to check if the input is an IP address
      const ipv4Regex = /^(?:\d{1,3}\.){3}\d{1,3}$/
      const ipv6Regex = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/

      if (typeof input === 'string' && (ipv4Regex.test(input) || ipv6Regex.test(input))) {
        return 'true (Valid IP)'
      } else {
        return 'false (Not an IP)'
      }
    })

    return {
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

.isip-operation-config {
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
