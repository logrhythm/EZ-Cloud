<template>
  <div class="prefix-operation-config">
    <div class="config-header">
      <q-icon name="text_fields" size="20px" color="primary" class="q-mr-sm" />
      <span class="header-title">Prefix Configuration</span>
    </div>

    <div class="config-content q-gutter-md">
      <!-- Prefix Input -->
      <div class="form-group">
        <label class="field-label">
          Prefix String *
          <q-tooltip>Text to add at the beginning of the value</q-tooltip>
        </label>
        <q-input
          v-model="localPrefix"
          outlined
          dense
          placeholder="Enter prefix (e.g., SERVER-)"
          class="prefix-input"
          :error="!localPrefix"
          error-message="Prefix is required"
          @update:model-value="handlePrefixChange"
        >
          <template #prepend>
            <q-icon name="text_fields" size="xs" />
          </template>
          <template #append>
            <q-btn
              v-if="localPrefix"
              flat
              round
              dense
              icon="clear"
              size="xs"
              @click="clearPrefix"
            >
              <q-tooltip>Clear prefix</q-tooltip>
            </q-btn>
          </template>
        </q-input>
        <div class="field-hint">
          This text will be added to the beginning of the field value
        </div>
      </div>

      <!-- Common Prefixes (Suggestions) -->
      <div class="form-group">
        <label class="field-label">Common Prefixes (Quick Insert)</label>
        <div class="prefix-suggestions">
          <q-chip
            v-for="suggestion in commonPrefixes"
            :key="suggestion"
            clickable
            color="primary"
            text-color="white"
            size="sm"
            @click="insertPrefix(suggestion)"
          >
            {{ suggestion }}
          </q-chip>
        </div>
      </div>

      <!-- Operation Preview -->
      <operation-preview
        v-if="localPrefix && !isArrayInput"
        :original-value="sampleValue"
        :transformed-value="previewResult"
        :error="previewError"
        :loading="isTestingOperation"
        :operation="operationSyntax"
      />

      <!-- Array Validation Results -->
      <div v-if="localPrefix && isArrayInput" class="validation-results q-mt-md">
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
                <code class="input-value">{{ result.input }}</code>
                <q-icon name="arrow_forward" size="xs" class="q-mx-xs" />
                <code class="output-value-valid">
                  {{ result.output }}
                </code>
              </q-item-label>
            </q-item-section>

            <q-item-section side>
              <q-badge color="positive">
                Prefixed
              </q-badge>
            </q-item-section>
          </q-item>
        </q-list>

        <!-- Summary -->
        <div class="validation-summary q-mt-sm">
          <q-chip color="positive" text-color="white" icon="check_circle">
            {{ sampleValuesArray.length }} Prefixed
          </q-chip>
        </div>
      </div>

      <!-- Test Button -->
      <div class="action-buttons">
        <q-btn
          :loading="isTestingOperation"
          :disable="!localPrefix"
          color="primary"
          icon="play_arrow"
          label="Test Prefix"
          @click="testOperation"
          no-caps
          unelevated
          class="test-btn"
        >
          <template #loading>
            <q-spinner-dots size="20px" />
          </template>
        </q-btn>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch } from 'vue'
import { buildOperationSyntax } from '../../../utils/operationParser'
import MappingService from '../../../services/wizard/mappingService'
import OperationPreview from './OperationPreview.vue'

export default {
  name: 'PrefixOperationConfig',
  components: {
    OperationPreview
  },
  props: {
    modelValue: {
      type: Object,
      default: () => ({
        prefix: ''
      })
    },
    sampleValue: {
      type: [String, Number, Array],
      default: ''
    }
  },
  emits: ['update:modelValue'],
  setup (props, { emit }) {
    const localPrefix = ref(props.modelValue?.prefix || '')
    const isTestingOperation = ref(false)
    const previewResult = ref(null)
    const previewError = ref(null)

    // Common prefix suggestions
    const commonPrefixes = ref([
      'SERVER-',
      'USER-',
      'APP-',
      'LOG-',
      'EVENT-',
      'ID-',
      'REF-',
      'ALERT-'
    ])

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

    // Apply prefix to a single value
    const applyPrefix = (input) => {
      if (!localPrefix.value) return input
      return localPrefix.value + String(input)
    }

    // Validate all values in the array
    const validationResults = computed(() => {
      if (!isArrayInput.value) {
        return []
      }

      return sampleValuesArray.value.map((value, idx) => {
        const output = applyPrefix(value)
        return {
          index: idx,
          input: String(value),
          output
        }
      })
    })

    // Computed
    const operationSyntax = computed(() => {
      if (!localPrefix.value) return ''
      return buildOperationSyntax('PREFIX', null, {
        prefix: localPrefix.value
      })
    })

    // Methods
    const handlePrefixChange = () => {
      emitChange()
      if (localPrefix.value) {
        testOperation()
      }
    }

    const insertPrefix = (prefix) => {
      localPrefix.value = prefix
      handlePrefixChange()
    }

    const clearPrefix = () => {
      localPrefix.value = ''
      previewResult.value = null
      previewError.value = null
      emitChange()
    }

    const testOperation = async () => {
      if (!localPrefix.value) return

      isTestingOperation.value = true
      previewError.value = null

      try {
        const result = await MappingService.testOperation(operationSyntax.value, props.sampleValue)

        if (result.success) {
          previewResult.value = result.output
          previewError.value = null
        } else {
          previewResult.value = null
          previewError.value = result.error
        }
      } catch (error) {
        previewError.value = error.message || 'Prefix test failed'
        previewResult.value = null
      } finally {
        isTestingOperation.value = false
      }
    }

    const emitChange = () => {
      emit('update:modelValue', {
        prefix: localPrefix.value
      })
    }

    // Watch for external changes
    watch(() => props.modelValue, (newVal) => {
      if (newVal) {
        localPrefix.value = newVal.prefix || ''
      }
    }, { deep: true })

    // Auto-test when sample value changes
    watch(() => props.sampleValue, () => {
      if (localPrefix.value) {
        testOperation()
      }
    })

    // Initial test if prefix is already set
    if (localPrefix.value) {
      testOperation()
    }

    return {
      localPrefix,
      isTestingOperation,
      previewResult,
      previewError,
      commonPrefixes,
      operationSyntax,
      handlePrefixChange,
      insertPrefix,
      clearPrefix,
      testOperation,
      // Array validation
      isArrayInput,
      sampleValuesArray,
      validationResults
    }
  }
}
</script>

<style lang="scss" scoped>
.prefix-operation-config {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.config-header {
  display: flex;
  align-items: center;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.header-title {
  font-size: 15px;
  font-weight: 600;
  color: #E3F2FD;
}

.config-content {
  display: flex;
  flex-direction: column;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.field-label {
  font-size: 14px;
  font-weight: 500;
  color: #E3F2FD;
  display: flex;
  align-items: center;
  gap: 4px;
}

.prefix-input {
  ::v-deep .q-field__control {
    font-family: 'Roboto Mono', monospace;
    font-size: 14px;
    background: rgba(255, 255, 255, 0.05);
  }
}

.field-hint {
  font-size: 12px;
  color: rgba(227, 242, 253, 0.5);
  margin-top: 4px;
}

.prefix-suggestions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.action-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 8px;
}

.test-btn {
  padding: 8px 16px;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  letter-spacing: 0.5px;
}

.action-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 8px;
}

.test-btn {
  padding: 8px 16px;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  letter-spacing: 0.5px;
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

/* Mobile Responsive */
@media (max-width: 768px) {
  .config-header {
    font-size: 14px;
  }

  .prefix-suggestions {
    justify-content: flex-start;
  }

  .action-buttons {
    justify-content: stretch;

    .test-btn {
      flex: 1;
    }
  }
}
</style>
