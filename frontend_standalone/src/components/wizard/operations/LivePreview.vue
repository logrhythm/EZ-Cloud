<template>
  <div class="live-preview-panel">
    <div class="preview-header">
      <q-icon name="preview" size="20px" color="primary" />
      <span class="preview-title">Live Preview</span>
      <q-space />
      <q-toggle
        v-model="autoPreview"
        label="Auto-update"
        size="xs"
        color="primary"
        dense
      />
    </div>

    <div class="preview-content">
      <div class="preview-row">
        <div class="preview-label">Input:</div>
        <div class="preview-value input-value">
          <code>{{ truncate(displaySampleValue, 100) }}</code>
        </div>
      </div>

      <div class="preview-arrow">
        <q-icon name="arrow_forward" size="24px" color="grey-6" />
      </div>

      <div class="preview-row">
        <div class="preview-label">Output:</div>
        <div class="preview-value output-value" :class="resultClass">
          <template v-if="isLoading">
            <q-spinner-dots color="primary" size="24px" />
            <span class="preview-loading">Processing...</span>
          </template>
          <template v-else-if="error">
            <q-icon name="error_outline" size="20px" color="warning" />
            <span class="preview-error">{{ error }}</span>
          </template>
          <template v-else-if="result !== null">
            <q-icon name="check_circle" size="20px" color="positive" />
            <code>{{ truncate(result, 100) }}</code>
          </template>
          <template v-else>
            <span class="preview-placeholder">Configure operation to see preview</span>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch } from 'vue'
import { buildOperationSyntax } from '../../../utils/operationParser'

export default {
  name: 'LivePreview',
  props: {
    operationType: {
      type: String,
      default: null
    },
    parameters: {
      type: Object,
      default: () => ({})
    },
    sampleValue: {
      type: [String, Number, Object, Array],
      default: null
    },
    fieldPath: {
      type: String,
      default: ''
    }
  },
  emits: [],
  setup (props) {
    const autoPreview = ref(true)
    const isLoading = ref(false)
    const result = ref(null)
    const error = ref(null)
    let debounceTimer = null

    const displaySampleValue = computed(() => {
      if (props.sampleValue === null || props.sampleValue === undefined) {
        return 'No sample data'
      }
      if (typeof props.sampleValue === 'object') {
        return JSON.stringify(props.sampleValue)
      }
      return String(props.sampleValue)
    })

    const resultClass = computed(() => {
      if (error.value) return 'has-error'
      if (result.value !== null) return 'has-result'
      return ''
    })

    const truncate = (value, length) => {
      if (!value) return ''
      const str = String(value)
      return str.length > length ? str.substring(0, length) + '...' : str
    }

    const updatePreview = async () => {
      if (!autoPreview.value || !props.operationType) {
        result.value = null
        error.value = null
        return
      }

      isLoading.value = true
      error.value = null

      try {
        // Build the operation syntax
        const operationSyntax = buildOperationSyntax(
          props.operationType,
          props.fieldPath,
          props.parameters
        )

        // Handle null/undefined syntax (incomplete configuration)
        if (!operationSyntax) {
          result.value = null
          error.value = null
          isLoading.value = false
          return
        }

        // Simulate preview (in real implementation, this would call the actual operation)
        await new Promise(resolve => setTimeout(resolve, 200))

        // For now, show the operation syntax as the result
        // In production, this should execute the actual operation on sample data
        result.value = `[Operation: ${operationSyntax}]`

        // TODO: Integrate with actual operation execution service
        // result.value = await executeOperation(operationSyntax, props.sampleValue)
      } catch (err) {
        error.value = err.message || 'Preview failed'
        result.value = null
      } finally {
        isLoading.value = false
      }
    }

    const debouncedUpdate = () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer)
      }
      debounceTimer = setTimeout(() => {
        updatePreview()
      }, 300)
    }

    // Watch for changes
    watch(() => props.operationType, debouncedUpdate, { immediate: true })
    watch(() => props.parameters, debouncedUpdate, { deep: true })
    watch(autoPreview, (newVal) => {
      if (newVal) {
        updatePreview()
      }
    })

    return {
      autoPreview,
      isLoading,
      result,
      error,
      displaySampleValue,
      resultClass,
      truncate
    }
  }
}
</script>

<style lang="scss" scoped>
.live-preview-panel {
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 8px;
  padding: 16px;
  margin-top: 16px;
}

.preview-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.12);
}

.preview-title {
  flex: 1;
  font-size: 14px;
  font-weight: 600;
  color: #E3F2FD;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.preview-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
  align-items: stretch;
}

.preview-row {
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;
}

.preview-label {
  font-size: 12px;
  font-weight: 600;
  color: rgba(227, 242, 253, 0.6);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.preview-value {
  padding: 12px;
  border-radius: 6px;
  font-family: 'Roboto Mono', monospace;
  font-size: 13px;
  line-height: 1.5;
  word-break: break-all;

  code {
    color: inherit;
    background: transparent;
  }

  &.input-value {
    background: rgba(255, 255, 255, 0.05);
    color: rgba(227, 242, 253, 0.8);
    border: 1px solid rgba(255, 255, 255, 0.12);
  }

  &.output-value {
    background: rgba(33, 150, 243, 0.08);
    color: #64b5f6;
    border: 1px solid rgba(33, 150, 243, 0.3);
    display: flex;
    align-items: center;
    gap: 8px;
    min-height: 48px;

    &.has-error {
      background: rgba(255, 152, 0, 0.08);
      border-color: rgba(255, 152, 0, 0.3);
      color: #ffb74d;
    }

    &.has-result {
      background: rgba(76, 175, 80, 0.08);
      border-color: rgba(76, 175, 80, 0.3);
      color: #81c784;
    }
  }
}

.preview-arrow {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  margin: 0;

  .q-icon {
    transform: rotate(90deg);
  }
}

.preview-loading,
.preview-error,
.preview-placeholder {
  font-size: 13px;
}

.preview-placeholder {
  color: rgba(227, 242, 253, 0.4);
  font-style: italic;
}

.preview-error {
  word-break: break-word;
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .live-preview-panel {
    padding: 12px;
  }

  .preview-header {
    flex-wrap: wrap;
    gap: 6px;
  }

  .preview-title {
    font-size: 13px;
  }

  .preview-content {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .preview-arrow {
    margin-top: 0;

    .q-icon {
      transform: rotate(90deg);
    }
  }

  .preview-value {
    padding: 10px;
    font-size: 12px;
  }
}
</style>
