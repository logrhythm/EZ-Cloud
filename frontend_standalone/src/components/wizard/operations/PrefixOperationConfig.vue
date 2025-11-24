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
        v-if="localPrefix"
        :original-value="sampleValue"
        :transformed-value="previewResult"
        :error="previewError"
        :loading="isTestingOperation"
        :operation="operationSyntax"
      />

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
      type: [String, Number],
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
      testOperation
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
