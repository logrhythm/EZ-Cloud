<template>
  <div class="lookup-operation-config">
    <div class="config-header">
      <q-icon
        :name="operationType === 'LookUp' ? 'table_chart' : 'search'"
        size="20px"
        color="primary"
        class="q-mr-sm"
      />
      <span class="header-title">
        {{ operationType === 'LookUp' ? 'Lookup Table' : 'Lookup with Prefix' }} Configuration
      </span>
    </div>

    <div class="config-content q-gutter-md">
      <!-- Operation Type Toggle (if both types supported) -->
      <div v-if="showTypeToggle" class="form-group">
        <label class="field-label">Operation Type</label>
        <q-btn-toggle
          v-model="localOperationType"
          :options="operationTypeOptions"
          spread
          no-caps
          unelevated
          toggle-color="primary"
          color="grey-8"
          @update:model-value="handleOperationTypeChange"
        />
      </div>

      <!-- Table Name Selection -->
      <div class="form-group">
        <label class="field-label">
          Lookup Table *
          <q-tooltip>Select a predefined lookup table</q-tooltip>
        </label>
        <q-select
          v-model="localTableName"
          :options="tableOptions"
          outlined
          dense
          emit-value
          map-options
          option-value="name"
          option-label="label"
          placeholder="Select a lookup table..."
          class="table-select"
          :error="!localTableName"
          @update:model-value="handleTableChange"
        >
          <template #prepend>
            <q-icon name="table_chart" size="xs" />
          </template>
          <template #option="scope">
            <q-item v-bind="scope.itemProps">
              <q-item-section avatar>
                <q-icon name="table_chart" color="primary" />
              </q-item-section>
              <q-item-section>
                <q-item-label>{{ scope.opt.label }}</q-item-label>
                <q-item-label caption>{{ scope.opt.description }}</q-item-label>
                <q-item-label caption class="table-example">
                  {{ scope.opt.example }}
                </q-item-label>
              </q-item-section>
            </q-item>
          </template>
        </q-select>
        <div v-if="selectedTable" class="field-hint">
          {{ selectedTable.description }}
        </div>
      </div>

      <!-- Available Tables Info -->
      <div class="info-panel">
        <q-icon name="info" size="18px" color="info" class="q-mr-sm" />
        <div class="info-content">
          <strong>Available Tables:</strong>
          <div class="table-list">
            <div v-for="table in tableOptions" :key="table.name" class="table-item">
              <q-chip
                size="sm"
                :color="localTableName === table.name ? 'primary' : 'grey-7'"
                text-color="white"
                dense
              >
                {{ table.label }}
              </q-chip>
            </div>
          </div>
        </div>
      </div>

      <!-- Table Preview (Expandable) -->
      <q-expansion-item
        v-if="selectedTable"
        icon="visibility"
        label="Preview Table Contents"
        header-class="table-preview-header"
        dense
      >
        <q-card flat class="table-preview-card">
          <q-card-section>
            <div class="preview-content">
              <p class="preview-label">Example Mappings:</p>
              <code class="preview-text">{{ selectedTable.example }}</code>
              <p class="preview-note">
                This table will be used to transform values during log processing.
              </p>
            </div>
          </q-card-section>
        </q-card>
      </q-expansion-item>

      <!-- Operation Preview -->
      <operation-preview
        v-if="localTableName"
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
          :disable="!localTableName"
          color="primary"
          icon="play_arrow"
          label="Test Lookup"
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
import { LOOKUP_TABLES, OPERATION_TYPES } from '../../../constants/operations'
import { buildOperationSyntax } from '../../../utils/operationParser'
import MappingService from '../../../services/wizard/mappingService'
import OperationPreview from './OperationPreview.vue'

export default {
  name: 'LookupOperationConfig',
  components: {
    OperationPreview
  },
  props: {
    modelValue: {
      type: Object,
      default: () => ({
        tableName: ''
      })
    },
    fieldPath: {
      type: String,
      required: true
    },
    sampleValue: {
      type: [String, Number],
      default: ''
    },
    operationType: {
      type: String,
      default: 'LookUp',
      validator: (value) => ['LookUp', 'LookUpStartsWith'].includes(value)
    }
  },
  emits: ['update:modelValue'],
  setup (props, { emit }) {
    const localTableName = ref(props.modelValue?.tableName || '')
    const localOperationType = ref(props.operationType)
    const isTestingOperation = ref(false)
    const previewResult = ref(null)
    const previewError = ref(null)

    // Computed
    const tableOptions = computed(() => LOOKUP_TABLES)

    const selectedTable = computed(() => {
      return LOOKUP_TABLES.find(table => table.name === localTableName.value)
    })

    const showTypeToggle = computed(() => {
      // For now, we'll keep it simple and not show the toggle
      // Can be enabled in future if needed
      return false
    })

    const operationTypeOptions = computed(() => [
      { label: 'Exact Match', value: OPERATION_TYPES.LOOKUP },
      { label: 'Starts With', value: OPERATION_TYPES.LOOKUP_STARTS_WITH }
    ])

    const operationSyntax = computed(() => {
      if (!localTableName.value) return ''
      return buildOperationSyntax(localOperationType.value, props.fieldPath, {
        tableName: localTableName.value
      })
    })

    // Methods
    const handleTableChange = (tableName) => {
      emitChange()
      if (tableName) {
        testOperation()
      }
    }

    const handleOperationTypeChange = () => {
      emitChange()
      if (localTableName.value) {
        testOperation()
      }
    }

    const testOperation = async () => {
      if (!localTableName.value) return

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
        previewError.value = error.message || 'Lookup test failed'
        previewResult.value = null
      } finally {
        isTestingOperation.value = false
      }
    }

    const emitChange = () => {
      emit('update:modelValue', {
        tableName: localTableName.value
      })
    }

    // Watch for external changes
    watch(() => props.modelValue, (newVal) => {
      if (newVal) {
        localTableName.value = newVal.tableName || ''
      }
    }, { deep: true })

    watch(() => props.operationType, (newVal) => {
      localOperationType.value = newVal
    })

    // Auto-test when sample value changes
    watch(() => props.sampleValue, () => {
      if (localTableName.value) {
        testOperation()
      }
    })

    // Initial test if table is already selected
    if (localTableName.value) {
      testOperation()
    }

    return {
      localTableName,
      localOperationType,
      isTestingOperation,
      previewResult,
      previewError,
      tableOptions,
      selectedTable,
      showTypeToggle,
      operationTypeOptions,
      operationSyntax,
      handleTableChange,
      handleOperationTypeChange,
      testOperation
    }
  }
}
</script>

<style lang="scss" scoped>
.lookup-operation-config {
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

.table-select {
  ::v-deep .q-field__control {
    background: rgba(255, 255, 255, 0.05);
  }
}

.field-hint {
  font-size: 12px;
  color: rgba(227, 242, 253, 0.5);
  margin-top: 4px;
  font-style: italic;
}

.table-example {
  font-size: 11px;
  color: rgba(76, 175, 80, 0.8);
  margin-top: 4px;
  font-family: monospace;
}

.info-panel {
  display: flex;
  align-items: flex-start;
  padding: 12px;
  background: rgba(33, 150, 243, 0.1);
  border-left: 3px solid #2196f3;
  border-radius: 4px;
}

.info-content {
  flex: 1;
  font-size: 13px;
  color: #E3F2FD;

  strong {
    display: block;
    margin-bottom: 8px;
  }
}

.table-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
}

.table-item {
  display: inline-flex;
}

.table-preview-header {
  background: rgba(255, 255, 255, 0.05);
  color: #2196f3;
  font-size: 13px;
  font-weight: 500;
}

.table-preview-card {
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.preview-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.preview-label {
  font-size: 13px;
  font-weight: 600;
  color: #E3F2FD;
  margin: 0;
}

.preview-text {
  font-family: monospace;
  font-size: 12px;
  color: #A5D6A7;
  background: rgba(0, 0, 0, 0.3);
  padding: 8px 12px;
  border-radius: 4px;
  display: block;
}

.preview-note {
  font-size: 12px;
  color: rgba(227, 242, 253, 0.5);
  margin: 0;
  font-style: italic;
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

  .table-list {
    flex-direction: column;
  }

  .action-buttons {
    justify-content: stretch;

    .test-btn {
      flex: 1;
    }
  }
}
</style>
