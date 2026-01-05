<template>
  <div class="math-operation-config">
    <q-banner class="operation-info-banner q-mb-md">
      <template v-slot:avatar>
        <q-icon :name="operationIcon" color="positive" />
      </template>
      <div class="text-body1">
        <strong>{{ operationTitle }} Operation</strong> - {{ operationDescription }}
      </div>
      <div class="text-body2 q-mt-sm">
        {{ operationInstructions }}
      </div>
    </q-banner>

    <div class="row q-col-gutter-md">
      <!-- Value Input -->
      <div class="col-12 col-md-6">
        <q-input
          v-model.number="operationValue"
          type="number"
          :label="valueLabel"
          :hint="valueHint"
          outlined
          dense
          bg-color="white"
          :error="!!validationErrors.value"
          :error-message="validationErrors.value"
          @update:model-value="handleValueChange"
        >
          <template v-slot:before>
            <q-chip
              v-if="operationType"
              color="positive"
              text-color="white"
              dense
              square
              class="operation-chip"
            >
              {{ operationSymbol }}
            </q-chip>
          </template>
        </q-input>
      </div>
    </div>

    <!-- Common values quick selection -->
    <div class="common-values q-mt-md">
      <div class="section-label">Quick Select:</div>
      <div class="values-chips">
        <q-chip
          v-for="val in commonValues"
          :key="val"
          clickable
          outline
          color="positive"
          text-color="white"
          @click="selectValue(val)"
        >
          {{ operationSymbol }} {{ val }}
        </q-chip>
      </div>
    </div>

    <!-- Live Preview & Validation - Only show after user interaction -->
    <div v-if="showPreview" class="preview-section q-mt-md">
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
  name: 'MathOperationConfig',

  props: {
    modelValue: {
      type: Object,
      default: () => ({
        value: 0
      })
    },
    operationType: {
      type: String,
      required: true,
      validator: (value) => [
        OPERATION_TYPES.ADD,
        OPERATION_TYPES.SUBTRACT,
        OPERATION_TYPES.MULTIPLY,
        OPERATION_TYPES.DIVIDE
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
    // Use a simple numeric ref instead of nested object structure
    const operationValue = ref(props.modelValue?.value !== undefined ? props.modelValue.value : 0)

    const validationErrors = ref({})
    // Show preview if there's already a value configured (editing existing operation)
    const showPreview = ref(props.modelValue?.value !== undefined && props.modelValue.value !== 0)

    const commonValues = [1, 5, 10, 100, 1000]

    // Operation-specific metadata
    const operationTitle = computed(() => {
      switch (props.operationType) {
        case OPERATION_TYPES.ADD: return 'Add'
        case OPERATION_TYPES.SUBTRACT: return 'Subtract'
        case OPERATION_TYPES.MULTIPLY: return 'Multiply'
        case OPERATION_TYPES.DIVIDE: return 'Divide'
        default: return ''
      }
    })

    const operationDescription = computed(() => {
      switch (props.operationType) {
        case OPERATION_TYPES.ADD: return 'Adds a number to a JSON value'
        case OPERATION_TYPES.SUBTRACT: return 'Subtracts a number from a JSON value'
        case OPERATION_TYPES.MULTIPLY: return 'Multiplies a JSON value by a number'
        case OPERATION_TYPES.DIVIDE: return 'Divides a JSON value by a number'
        default: return ''
      }
    })

    const operationInstructions = computed(() => {
      switch (props.operationType) {
        case OPERATION_TYPES.ADD: return 'Enter a number to add to the field value.'
        case OPERATION_TYPES.SUBTRACT: return 'Enter a number to subtract from the field value.'
        case OPERATION_TYPES.MULTIPLY: return 'Enter a number to multiply the field value by.'
        case OPERATION_TYPES.DIVIDE: return 'Enter a number to divide the field value by.'
        default: return ''
      }
    })

    const operationIcon = computed(() => {
      switch (props.operationType) {
        case OPERATION_TYPES.ADD: return 'add'
        case OPERATION_TYPES.SUBTRACT: return 'remove'
        case OPERATION_TYPES.MULTIPLY: return 'close'
        case OPERATION_TYPES.DIVIDE: return 'unfold_less'
        default: return ''
      }
    })

    const operationSymbol = computed(() => {
      switch (props.operationType) {
        case OPERATION_TYPES.ADD: return '+'
        case OPERATION_TYPES.SUBTRACT: return '-'
        case OPERATION_TYPES.MULTIPLY: return '×'
        case OPERATION_TYPES.DIVIDE: return '÷'
        default: return ''
      }
    })

    const valueLabel = computed(() => {
      switch (props.operationType) {
        case OPERATION_TYPES.ADD: return 'Value to add *'
        case OPERATION_TYPES.SUBTRACT: return 'Value to subtract *'
        case OPERATION_TYPES.MULTIPLY: return 'Value to multiply by *'
        case OPERATION_TYPES.DIVIDE: return 'Value to divide by *'
        default: return 'Value *'
      }
    })

    const valueHint = computed(() => {
      switch (props.operationType) {
        case OPERATION_TYPES.ADD: return 'Number to add to the field'
        case OPERATION_TYPES.SUBTRACT: return 'Number to subtract from the field'
        case OPERATION_TYPES.MULTIPLY: return 'Number to multiply the field by'
        case OPERATION_TYPES.DIVIDE: return 'Number to divide the field by'
        default: return ''
      }
    })

    // Validate parameters
    const validateParams = () => {
      const errors = {}

      if (operationValue.value === undefined || operationValue.value === null) {
        errors.value = 'Value is required'
      }

      if (props.operationType === OPERATION_TYPES.DIVIDE && operationValue.value === 0) {
        errors.value = 'Cannot divide by zero'
      }

      validationErrors.value = errors
      return Object.keys(errors).length === 0
    }

    // Update params and emit change event
    const updateParams = () => {
      validateParams()
      const payload = {
        value: operationValue.value
      }
      emit('update:modelValue', payload)
      emit('input', payload) // Vue 2 compatibility
    }

    // Handle value change - show preview after first interaction
    const handleValueChange = () => {
      showPreview.value = true
      updateParams()
    }

    // Select a predefined value
    const selectValue = (value) => {
      operationValue.value = value
      showPreview.value = true // Show preview when quick selecting
      updateParams()
    }

    // Check if sample value is an array
    const isArrayInput = computed(() => {
      return Array.isArray(props.sampleValue) && props.sampleValue.length > 0
    })

    // Extract array of sample values
    const sampleValuesArray = computed(() => {
      if (isArrayInput.value) {
        return props.sampleValue
      }
      return []
    })

    // Perform math operation on a single value
    const performMathOperation = (input, operationValue) => {
      // Validate inputs
      if (operationValue === undefined || operationValue === null) {
        return {
          isValid: false,
          output: 'N/A',
          error: 'Operation value is required'
        }
      }

      if (props.operationType === OPERATION_TYPES.DIVIDE && operationValue === 0) {
        return {
          isValid: false,
          output: 'N/A',
          error: 'Cannot divide by zero'
        }
      }

      // Convert input to number
      const numInput = Number(input)
      if (isNaN(numInput)) {
        return {
          isValid: false,
          output: 'N/A',
          error: 'Input is not a valid number'
        }
      }

      try {
        let result
        switch (props.operationType) {
          case OPERATION_TYPES.ADD:
            result = numInput + operationValue
            break
          case OPERATION_TYPES.SUBTRACT:
            result = numInput - operationValue
            break
          case OPERATION_TYPES.MULTIPLY:
            result = numInput * operationValue
            break
          case OPERATION_TYPES.DIVIDE:
            result = numInput / operationValue
            break
          default:
            return {
              isValid: false,
              output: 'N/A',
              error: 'Unknown operation type'
            }
        }

        return {
          isValid: true,
          output: result,
          error: null
        }
      } catch (error) {
        console.error('[MathOperationConfig] Error performing math operation:', {
          operationType: props.operationType,
          input,
          operationValue,
          error: error.message
        })
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
        const result = performMathOperation(value, operationValue.value)
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

    // Display values for preview
    const displayInput = computed(() => {
      const input = props.sampleValue !== null ? props.sampleValue : 100
      return typeof input === 'number' ? input : 'Not a number'
    })

    const displayOperation = computed(() => {
      const input = props.sampleValue !== null ? props.sampleValue : 100
      if (typeof input !== 'number') return 'N/A'

      switch (props.operationType) {
        case OPERATION_TYPES.ADD:
          return `${input} + ${operationValue.value}`
        case OPERATION_TYPES.SUBTRACT:
          return `${input} - ${operationValue.value}`
        case OPERATION_TYPES.MULTIPLY:
          return `${input} × ${operationValue.value}`
        case OPERATION_TYPES.DIVIDE:
          return `${input} ÷ ${operationValue.value}`
        default:
          return 'N/A'
      }
    })

    // Compute a preview of the operation result
    const previewOutput = computed(() => {
      const input = props.sampleValue !== null ? props.sampleValue : 100

      if (typeof input !== 'number') {
        return 'Not a number'
      }

      try {
        switch (props.operationType) {
          case OPERATION_TYPES.ADD:
            return input + operationValue.value
          case OPERATION_TYPES.SUBTRACT:
            return input - operationValue.value
          case OPERATION_TYPES.MULTIPLY:
            return input * operationValue.value
          case OPERATION_TYPES.DIVIDE:
            if (operationValue.value === 0) {
              return 'Error: Division by zero'
            }
            return input / operationValue.value
          default:
            return 'N/A'
        }
      } catch (error) {
        console.error('[MathOperationConfig] Error computing preview output:', {
          operationType: props.operationType,
          sampleValue: props.sampleValue,
          operationValue: operationValue.value,
          error: error.message
        })
        return `Error: ${error.message}`
      }
    })

    // Watch for external prop changes
    watch(() => props.modelValue, (newVal, oldVal) => {
      if (newVal && newVal.value !== undefined) {
        // Only update if value actually changed
        if (operationValue.value !== newVal.value) {
          operationValue.value = newVal.value
          // If value is being set from parent, show preview
          if (newVal.value !== 0) {
            showPreview.value = true
          }
        }
      }
    }, { deep: true })

    // Debug watcher for showPreview
    watch(showPreview, (newVal, oldVal) => {
    })

    // Watch operationValue to show preview when user types in the textbox
    watch(operationValue, (newVal, oldVal) => {
      // If user has entered a value, show preview
      if (newVal !== undefined && newVal !== null && !showPreview.value) {
        showPreview.value = true
      }
      // Always emit the updated value to parent
      updateParams()
    })

    return {
      operationValue,
      validationErrors,
      showPreview,
      commonValues,
      operationTitle,
      operationDescription,
      operationInstructions,
      operationIcon,
      operationSymbol,
      valueLabel,
      valueHint,
      selectValue,
      updateParams,
      handleValueChange,
      isArrayInput,
      sampleValuesArray,
      validationResults,
      validCount,
      invalidCount,
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

.math-operation-config {
  padding: 8px 0;
}

.section-label {
  font-size: 14px;
  color: #4caf50;
  font-weight: 500;
  margin-bottom: 8px;
}

.common-values {
  margin: 16px 0;
}

.values-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.operation-chip {
  font-weight: bold;
  font-size: 16px;
  min-width: 24px;
  justify-content: center;
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
  color: #4caf50;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
}

.validation-results {
  margin-top: 12px;
}

.validation-header {
  font-weight: 500;
  color: #4caf50;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  font-size: 14px;
}

.validation-list {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 6px;
  overflow: hidden;
}

.valid-item {
  background: rgba(76, 175, 80, 0.05);
}

.invalid-item {
  background: rgba(244, 67, 54, 0.05);
}

.input-value {
  font-family: 'Courier New', monospace;
  background-color: rgba(33, 150, 243, 0.15);
  color: #64b5f6;
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 13px;
}

.output-value-valid {
  font-family: 'Courier New', monospace;
  background-color: rgba(76, 175, 80, 0.15);
  color: #81c784;
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 13px;
}

.output-value-invalid {
  font-family: 'Courier New', monospace;
  background-color: rgba(244, 67, 54, 0.15);
  color: #e57373;
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 13px;
}

.error-caption {
  color: #e57373 !important;
  font-size: 12px;
  margin-top: 4px;
}

.validation-summary {
  display: flex;
  gap: 8px;
  justify-content: flex-start;
  flex-wrap: wrap;
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
