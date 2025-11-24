<template>
  <div class="operation-preview">
    <div class="preview-header">
      <q-icon name="visibility" size="20px" color="primary" class="q-mr-sm" />
      <span class="header-title">Operation Preview</span>
    </div>

    <div class="preview-content">
      <!-- Original Value -->
      <div class="preview-section">
        <div class="section-label">Sample Input:</div>
        <div class="value-display original-value">
          <code>{{ displayOriginalValue }}</code>
        </div>
      </div>

      <!-- Operation Arrow & Syntax -->
      <div class="operation-indicator">
        <q-icon name="arrow_downward" size="20px" color="primary" />
        <div v-if="operation" class="operation-syntax">
          <code>{{ operation }}</code>
        </div>
      </div>

      <!-- Result / Error -->
      <div class="preview-section">
        <div class="section-label">Result:</div>

        <!-- Loading State -->
        <div v-if="loading" class="loading-state">
          <q-spinner-dots color="primary" size="24px" />
          <span class="loading-text">Testing operation...</span>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="error-state">
          <div class="error-banner">
            <q-icon name="error" size="24px" color="negative" />
            <div class="error-content">
              <div class="error-title">Operation Failed</div>
              <div class="error-message">{{ error }}</div>
            </div>
          </div>
        </div>

        <!-- Success State -->
        <div v-else-if="transformedValue !== null" class="value-display result-value success">
          <q-icon name="check_circle" size="18px" color="positive" class="q-mr-sm" />
          <code>{{ displayTransformedValue }}</code>
        </div>

        <!-- No Result Yet -->
        <div v-else class="no-result">
          <q-icon name="info" size="18px" color="grey-6" class="q-mr-sm" />
          <span>Configure operation and click "Test" to see results</span>
        </div>
      </div>

      <!-- Success Indicator -->
      <div v-if="!loading && !error && transformedValue !== null" class="success-indicator">
        <q-banner class="success-banner" dense>
          <template #avatar>
            <q-icon name="check_circle" color="positive" />
          </template>
          Operation executed successfully!
        </q-banner>
      </div>

      <!-- Copy Operation Button -->
      <div v-if="operation" class="preview-actions">
        <q-btn
          flat
          dense
          icon="content_copy"
          label="Copy Operation Syntax"
          color="primary"
          size="sm"
          @click="copyOperationSyntax"
          no-caps
        >
          <q-tooltip>Copy to clipboard</q-tooltip>
        </q-btn>
      </div>
    </div>
  </div>
</template>

<script>
import { computed, getCurrentInstance } from 'vue'

export default {
  name: 'OperationPreview',
  props: {
    originalValue: {
      type: [String, Number, Object],
      default: null
    },
    transformedValue: {
      type: [String, Number, Object],
      default: null
    },
    error: {
      type: String,
      default: null
    },
    loading: {
      type: Boolean,
      default: false
    },
    operation: {
      type: String,
      default: null
    }
  },
  setup (props) {
    const { proxy } = getCurrentInstance()
    const $q = proxy.$q

    // Computed
    const displayOriginalValue = computed(() => {
      if (props.originalValue === null || props.originalValue === undefined) {
        return 'No sample data available'
      }
      if (typeof props.originalValue === 'object') {
        return JSON.stringify(props.originalValue, null, 2)
      }
      return String(props.originalValue)
    })

    const displayTransformedValue = computed(() => {
      if (props.transformedValue === null || props.transformedValue === undefined) {
        return 'null'
      }
      if (typeof props.transformedValue === 'object') {
        return JSON.stringify(props.transformedValue, null, 2)
      }
      return String(props.transformedValue)
    })

    // Methods
    const copyOperationSyntax = () => {
      if (!props.operation) return

      navigator.clipboard.writeText(props.operation).then(() => {
        $q.notify({
          type: 'positive',
          message: 'Operation syntax copied to clipboard',
          position: 'top',
          timeout: 2000,
          icon: 'check_circle'
        })
      }).catch(() => {
        $q.notify({
          type: 'negative',
          message: 'Failed to copy to clipboard',
          position: 'top',
          timeout: 2000,
          icon: 'error'
        })
      })
    }

    return {
      displayOriginalValue,
      displayTransformedValue,
      copyOperationSyntax
    }
  }
}
</script>

<style lang="scss" scoped>
.operation-preview {
  margin-top: 16px;
  padding: 16px;
  border-radius: 6px;
  border: 1px solid #2196f3;
  background: rgba(33, 150, 243, 0.05);
}

.preview-header {
  display: flex;
  align-items: center;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(33, 150, 243, 0.3);
  margin-bottom: 16px;
}

.header-title {
  font-size: 14px;
  font-weight: 600;
  color: #2196f3;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.preview-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.preview-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.section-label {
  font-size: 12px;
  font-weight: 600;
  color: rgba(227, 242, 253, 0.6);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.value-display {
  padding: 12px;
  border-radius: 4px;
  font-family: monospace;
  font-size: 13px;
  word-wrap: break-word;
  overflow-wrap: break-word;

  code {
    color: inherit;
    white-space: pre-wrap;
  }
}

.original-value {
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #E3F2FD;
}

.result-value {
  display: flex;
  align-items: center;

  &.success {
    background: rgba(76, 175, 80, 0.1);
    border: 1px solid rgba(76, 175, 80, 0.3);
    color: #A5D6A7;
  }
}

.operation-indicator {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  margin: 8px 0;
}

.operation-syntax {
  padding: 8px 12px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 4px;
  width: 100%;
  text-align: center;

  code {
    font-family: monospace;
    font-size: 12px;
    color: rgba(227, 242, 253, 0.6);
    font-style: italic;
  }
}

.loading-state {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: rgba(33, 150, 243, 0.1);
  border-radius: 4px;
}

.loading-text {
  font-size: 13px;
  color: #2196f3;
  font-style: italic;
}

.error-state {
  padding: 12px;
  background: rgba(244, 67, 54, 0.1);
  border: 1px solid rgba(244, 67, 54, 0.3);
  border-radius: 4px;
}

.error-banner {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.error-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.error-title {
  font-size: 14px;
  font-weight: 600;
  color: #f44336;
}

.error-message {
  font-size: 13px;
  color: rgba(244, 67, 54, 0.9);
  line-height: 1.5;
}

.no-result {
  display: flex;
  align-items: center;
  padding: 12px;
  background: rgba(158, 158, 158, 0.1);
  border: 1px dashed rgba(158, 158, 158, 0.3);
  border-radius: 4px;
  font-size: 13px;
  color: rgba(227, 242, 253, 0.6);
}

.success-indicator {
  margin-top: 8px;
}

.success-banner {
  background: rgba(76, 175, 80, 0.1);
  border-left: 4px solid #4caf50;
  color: #A5D6A7;
  font-size: 13px;
}

.preview-actions {
  display: flex;
  justify-content: flex-end;
  padding-top: 12px;
  border-top: 1px solid rgba(33, 150, 243, 0.2);
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .operation-preview {
    padding: 12px;
  }

  .value-display {
    font-size: 12px;
    padding: 10px;
  }

  .operation-syntax code {
    font-size: 11px;
  }

  .preview-actions {
    justify-content: stretch;

    .q-btn {
      flex: 1;
    }
  }
}
</style>
