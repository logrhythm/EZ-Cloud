<template>
  <div class="split-operation-config">
    <q-banner class="operation-info-banner q-mb-md">
      <template v-slot:avatar>
        <q-icon name="call_split" color="primary" />
      </template>
      <div class="text-body1">
        <strong>SPLIT Operation</strong> - Splits a string by a delimiter and returns a specific index
      </div>
      <div class="text-body2 q-mt-sm">
        Use this to extract a specific part from delimited text.
      </div>
    </q-banner>

    <div class="row q-col-gutter-md">
      <!-- Delimiter Input -->
      <div class="col-12 col-md-6">
        <q-input
          v-model="localParams.delimiter"
          label="Delimiter *"
          hint="Character(s) to split the string on"
          outlined
          dense
          bg-color="white"
          :error="!!validationErrors.delimiter"
          :error-message="validationErrors.delimiter"
          @update:model-value="updateParams"
        >
          <template v-slot:append>
            <q-icon name="help_outline" color="grey">
              <q-tooltip max-width="300px">
                Enter the character or string that separates the values.
                Examples: "," for CSV, "=" for key-value pairs
              </q-tooltip>
            </q-icon>
          </template>
        </q-input>
      </div>

      <!-- Index Input -->
      <div class="col-12 col-md-6">
        <q-input
          v-model.number="localParams.index"
          type="number"
          label="Index *"
          hint="Position of the part to extract (0-based)"
          outlined
          dense
          min="0"
          bg-color="white"
          :error="!!validationErrors.index"
          :error-message="validationErrors.index"
          @update:model-value="updateParams"
        >
          <template v-slot:append>
            <q-icon name="help_outline" color="grey">
              <q-tooltip max-width="300px">
                Index of the part to extract (0-based).
                For "a,b,c" split by ",", index 0 is "a", index 1 is "b", etc.
              </q-tooltip>
            </q-icon>
          </template>
        </q-input>
      </div>
    </div>

    <!-- Common delimiters quick selection -->
    <div class="common-delimiters q-mt-md">
      <div class="section-label">Quick Select:</div>
      <div class="delimiter-chips">
        <q-chip
          v-for="delim in commonDelimiters"
          :key="delim.value"
          clickable
          outline
          color="primary"
          text-color="white"
          @click="selectDelimiter(delim.value)"
        >
          {{ delim.label }}
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
          <div class="preview-value code">{{ sampleValue || 'key=value' }}</div>
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

export default {
  name: 'SplitOperationConfig',

  props: {
    modelValue: {
      type: Object,
      default: () => ({
        delimiter: '',
        index: 0
      })
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
      delimiter: props.modelValue?.delimiter || '',
      index: props.modelValue?.index !== undefined ? props.modelValue.index : 0
    })

    const validationErrors = ref({})

    const commonDelimiters = [
      { label: 'Comma (,)', value: ',' },
      { label: 'Space ( )', value: ' ' },
      { label: 'Equals (=)', value: '=' },
      { label: 'Semicolon (;)', value: ';' },
      { label: 'Colon (:)', value: ':' },
      { label: 'Pipe (|)', value: '|' },
      { label: 'Tab (\\t)', value: '\t' }
    ]

    // Validate parameters
    const validateParams = () => {
      const errors = {}

      if (!localParams.value.delimiter) {
        errors.delimiter = 'Delimiter is required'
      }

      if (localParams.value.index < 0) {
        errors.index = 'Index must be 0 or higher'
      }

      validationErrors.value = errors
      return Object.keys(errors).length === 0
    }

    // Update params and emit change event
    const updateParams = () => {
      validateParams()
      emit('update:modelValue', {
        delimiter: localParams.value.delimiter,
        index: localParams.value.index
      })
    }

    // Select a predefined delimiter
    const selectDelimiter = (value) => {
      localParams.value.delimiter = value
      updateParams()
    }

    // Compute a preview of the operation result
    const previewOutput = computed(() => {
      const input = props.sampleValue || 'key=value'

      if (!localParams.value.delimiter) {
        return '(Set a delimiter)'
      }

      try {
        if (typeof input === 'string') {
          const parts = input.split(localParams.value.delimiter)
          const index = localParams.value.index

          if (index >= parts.length) {
            return `(Index ${index} is out of bounds. Max: ${parts.length - 1})`
          }

          return parts[index] || '(empty string)'
        }
        return '(Input is not a string)'
      } catch (error) {
        return `Error: ${error.message}`
      }
    })

    // Watch for external prop changes
    watch(() => props.modelValue, (newVal) => {
      if (newVal) {
        localParams.value = {
          delimiter: newVal.delimiter || '',
          index: newVal.index !== undefined ? newVal.index : 0
        }
      }
    }, { deep: true })

    return {
      localParams,
      validationErrors,
      commonDelimiters,
      selectDelimiter,
      updateParams,
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

.split-operation-config {
  padding: 8px 0;
}

.section-label {
  font-size: 14px;
  color: #2196f3;
  font-weight: 500;
  margin-bottom: 8px;
}

.common-delimiters {
  margin: 16px 0;
}

.delimiter-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
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
