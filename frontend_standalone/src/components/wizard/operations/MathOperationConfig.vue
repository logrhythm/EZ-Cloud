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
          v-model.number="localParams.value"
          type="number"
          :label="valueLabel"
          :hint="valueHint"
          outlined
          dense
          bg-color="white"
          :error="!!validationErrors.value"
          :error-message="validationErrors.value"
          @update:model-value="updateParams"
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

    <div class="preview-section">
      <div class="preview-header">
        <q-icon name="visibility" class="q-mr-xs" />
        <span>Preview</span>
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
      type: [String, Number, Object],
      default: null
    }
  },

  emits: ['update:modelValue'],

  setup (props, { emit }) {
    const localParams = ref({
      value: props.modelValue?.value !== undefined ? props.modelValue.value : 0
    })

    const validationErrors = ref({})

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

      if (localParams.value.value === undefined || localParams.value.value === null) {
        errors.value = 'Value is required'
      }

      if (props.operationType === OPERATION_TYPES.DIVIDE && localParams.value.value === 0) {
        errors.value = 'Cannot divide by zero'
      }

      validationErrors.value = errors
      return Object.keys(errors).length === 0
    }

    // Update params and emit change event
    const updateParams = () => {
      validateParams()
      emit('update:modelValue', {
        value: localParams.value.value
      })
    }

    // Select a predefined value
    const selectValue = (value) => {
      localParams.value.value = value
      updateParams()
    }

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
          return `${input} + ${localParams.value.value}`
        case OPERATION_TYPES.SUBTRACT:
          return `${input} - ${localParams.value.value}`
        case OPERATION_TYPES.MULTIPLY:
          return `${input} × ${localParams.value.value}`
        case OPERATION_TYPES.DIVIDE:
          return `${input} ÷ ${localParams.value.value}`
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
            return input + localParams.value.value
          case OPERATION_TYPES.SUBTRACT:
            return input - localParams.value.value
          case OPERATION_TYPES.MULTIPLY:
            return input * localParams.value.value
          case OPERATION_TYPES.DIVIDE:
            if (localParams.value.value === 0) {
              return 'Error: Division by zero'
            }
            return input / localParams.value.value
          default:
            return 'N/A'
        }
      } catch (error) {
        return `Error: ${error.message}`
      }
    })

    // Watch for external prop changes
    watch(() => props.modelValue, (newVal) => {
      if (newVal) {
        localParams.value = {
          value: newVal.value !== undefined ? newVal.value : 0
        }
      }
    }, { deep: true })

    return {
      localParams,
      validationErrors,
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
