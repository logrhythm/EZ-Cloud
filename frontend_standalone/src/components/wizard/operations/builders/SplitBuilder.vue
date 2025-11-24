<template>
  <div class="split-builder">
    <div class="builder-header">
      <q-icon name="splitscreen" size="20px" color="primary" />
      <span class="builder-title">Split Configuration Builder</span>
    </div>

    <div class="builder-content">
      <!-- Delimiter Presets -->
      <div class="delimiter-section">
        <div class="section-label">Common Delimiters:</div>
        <div class="delimiter-chips">
          <q-chip
            v-for="preset in delimiterPresets"
            :key="preset.name"
            clickable
            :outline="delimiter !== preset.value"
            color="primary"
            text-color="white"
            @click="selectDelimiter(preset.value)"
          >
            <q-icon :name="preset.icon" size="18px" class="q-mr-xs" />
            {{ preset.label }}
          </q-chip>
        </div>
      </div>

      <!-- Custom Delimiter Input -->
      <div class="custom-delimiter-section">
        <q-input
          v-model="delimiter"
          outlined
          dense
          label="Delimiter"
          placeholder="Enter delimiter character(s)"
          bg-color="white"
          color="black"
          class="delimiter-input"
          @update:model-value="handleDelimiterChange"
        >
          <template v-slot:prepend>
            <q-icon name="more_vert" color="primary" />
          </template>
          <template v-slot:append>
            <q-btn
              flat
              dense
              round
              icon="help_outline"
              size="sm"
            >
              <q-tooltip>
                Character(s) to split the text by<br/>
                Examples: , | ; : space tab
              </q-tooltip>
            </q-btn>
          </template>
        </q-input>

        <div v-if="delimiterError" class="delimiter-error">
          <q-icon name="error_outline" size="16px" />
          {{ delimiterError }}
        </div>
      </div>

      <!-- Split Preview -->
      <div v-if="splitParts.length > 0" class="preview-section">
        <div class="section-label">Split Result ({{ splitParts.length }} parts):</div>
        <div class="split-parts">
          <div
            v-for="(part, idx) in splitParts"
            :key="idx"
            class="split-part"
            :class="{ 'selected': idx === index }"
            @click="selectIndex(idx)"
          >
            <div class="part-index">Index {{ idx }}</div>
            <div class="part-value">
              <code>{{ truncate(part, 50) }}</code>
            </div>
            <q-icon
              v-if="idx === index"
              name="check_circle"
              size="20px"
              color="primary"
              class="part-selected-icon"
            />
          </div>
        </div>
      </div>

      <!-- Index Selector -->
      <div class="index-section">
        <q-input
          v-model.number="index"
          outlined
          dense
          type="number"
          label="Index to Extract"
          min="0"
          :max="maxIndex"
          bg-color="white"
          color="black"
          @update:model-value="handleIndexChange"
        >
          <template v-slot:prepend>
            <q-icon name="filter_1" color="primary" />
          </template>
          <template v-slot:hint>
            Select which part to extract (0-based index)
          </template>
        </q-input>

        <div v-if="maxIndex >= 0" class="index-info">
          <q-icon name="info" size="16px" />
          Valid range: 0 to {{ maxIndex }}
        </div>
      </div>

      <!-- Example -->
      <div class="example-section">
        <div class="section-label">Example:</div>
        <div class="example-box">
          <div class="example-row">
            <span class="example-label">Input:</span>
            <code class="example-value">{{ exampleInput }}</code>
          </div>
          <div class="example-row">
            <span class="example-label">Delimiter:</span>
            <code class="example-value">{{ displayDelimiter }}</code>
          </div>
          <div class="example-row">
            <span class="example-label">Index:</span>
            <code class="example-value">{{ index }}</code>
          </div>
          <div class="example-row">
            <span class="example-label">Result:</span>
            <code class="example-value result">{{ extractedValue }}</code>
          </div>
        </div>
      </div>

      <!-- Quick Guide -->
      <div class="quick-guide">
        <div class="guide-toggle" @click="showGuide = !showGuide">
          <q-icon :name="showGuide ? 'expand_less' : 'expand_more'" />
          How Split Works
        </div>
        <q-slide-transition>
          <div v-show="showGuide" class="guide-content">
            <div class="guide-text">
              The SPLIT operation divides text into parts using a delimiter, then extracts the part at the specified index.
            </div>
            <div class="guide-example">
              <strong>Example:</strong> "apple,banana,cherry" split by "," at index 1 → "banana"
            </div>
            <div class="guide-text">
              <strong>Index 0</strong> = first part<br/>
              <strong>Index 1</strong> = second part<br/>
              <strong>Index 2</strong> = third part, etc.
            </div>
          </div>
        </q-slide-transition>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch } from 'vue'

export default {
  name: 'SplitBuilder',
  props: {
    modelValue: {
      type: Object,
      default: () => ({ delimiter: ',', index: 0 })
    },
    sampleValue: {
      type: [String, Number],
      default: ''
    }
  },
  emits: ['update:modelValue'],
  setup (props, { emit }) {
    const delimiter = ref(props.modelValue?.delimiter || ',')
    const index = ref(props.modelValue?.index || 0)
    const delimiterError = ref(null)
    const showGuide = ref(false)

    const delimiterPresets = [
      { name: 'comma', label: 'Comma', value: ',', icon: 'more_vert' },
      { name: 'pipe', label: 'Pipe', value: '|', icon: 'more_vert' },
      { name: 'semicolon', label: 'Semicolon', value: ';', icon: 'more_vert' },
      { name: 'space', label: 'Space', value: ' ', icon: 'space_bar' },
      { name: 'tab', label: 'Tab', value: '\t', icon: 'keyboard_tab' },
      { name: 'equals', label: 'Equals', value: '=', icon: 'drag_handle' },
      { name: 'colon', label: 'Colon', value: ':', icon: 'more_vert' }
    ]

    const exampleInput = computed(() => {
      return String(props.sampleValue || 'value1,value2,value3')
    })

    const displayDelimiter = computed(() => {
      if (delimiter.value === ' ') return '[space]'
      if (delimiter.value === '\t') return '[tab]'
      if (delimiter.value === '\n') return '[newline]'
      return delimiter.value || '[empty]'
    })

    const splitParts = computed(() => {
      if (!exampleInput.value || !delimiter.value) return []
      try {
        return exampleInput.value.split(delimiter.value)
      } catch (e) {
        return []
      }
    })

    const maxIndex = computed(() => {
      return Math.max(0, splitParts.value.length - 1)
    })

    const extractedValue = computed(() => {
      if (splitParts.value.length === 0) return '[no result]'
      if (index.value < 0 || index.value >= splitParts.value.length) {
        return '[index out of range]'
      }
      return splitParts.value[index.value]
    })

    const selectDelimiter = (value) => {
      delimiter.value = value
      validateDelimiter()
      emitValue()
    }

    const selectIndex = (idx) => {
      index.value = idx
      emitValue()
    }

    const validateDelimiter = () => {
      if (!delimiter.value && delimiter.value !== '') {
        delimiterError.value = 'Delimiter is required'
        return false
      }

      delimiterError.value = null
      return true
    }

    const handleDelimiterChange = () => {
      validateDelimiter()
      emitValue()
    }

    const handleIndexChange = () => {
      // Clamp index to valid range
      if (index.value < 0) index.value = 0
      if (index.value > maxIndex.value) index.value = maxIndex.value
      emitValue()
    }

    const emitValue = () => {
      emit('update:modelValue', {
        delimiter: delimiter.value,
        index: index.value
      })
    }

    const truncate = (text, maxLength) => {
      if (!text) return ''
      const str = String(text)
      if (str.length <= maxLength) return str
      return str.substring(0, maxLength) + '...'
    }

    // Watch for external changes
    watch(() => props.modelValue, (newVal) => {
      if (newVal) {
        if (newVal.delimiter !== delimiter.value) {
          delimiter.value = newVal.delimiter || ','
        }
        if (newVal.index !== index.value) {
          index.value = newVal.index || 0
        }
      }
    }, { deep: true })

    return {
      delimiter,
      index,
      delimiterError,
      showGuide,
      delimiterPresets,
      exampleInput,
      displayDelimiter,
      splitParts,
      maxIndex,
      extractedValue,
      selectDelimiter,
      selectIndex,
      handleDelimiterChange,
      handleIndexChange,
      truncate
    }
  }
}
</script>

<style lang="scss" scoped>
.split-builder {
  background: rgba(0, 0, 0, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 8px;
  padding: 16px;
}

.builder-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.12);
}

.builder-title {
  font-size: 14px;
  font-weight: 600;
  color: #E3F2FD;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.builder-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.section-label {
  font-size: 12px;
  font-weight: 600;
  color: rgba(227, 242, 253, 0.6);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 8px;
}

.delimiter-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.delimiter-input {
  ::v-deep .q-field__control {
    font-family: 'Roboto Mono', monospace;
  }
}

.delimiter-error {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  margin-top: 8px;
  color: #FF9800;
}

.split-parts {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.split-part {
  position: relative;
  background: rgba(255, 255, 255, 0.05);
  border: 2px solid rgba(255, 255, 255, 0.12);
  border-radius: 6px;
  padding: 12px;
  cursor: pointer;
  transition: all 150ms;

  &:hover {
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(33, 150, 243, 0.5);
  }

  &.selected {
    background: rgba(33, 150, 243, 0.15);
    border-color: #2196F3;
    box-shadow: 0 0 0 2px rgba(33, 150, 243, 0.3);
  }
}

.part-index {
  font-size: 11px;
  font-weight: 600;
  color: rgba(227, 242, 253, 0.5);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 6px;
}

.part-value {
  font-size: 13px;
  color: rgba(227, 242, 253, 0.9);

  code {
    background: rgba(33, 150, 243, 0.1);
    padding: 4px 8px;
    border-radius: 3px;
    font-family: 'Roboto Mono', monospace;
    color: #64b5f6;
  }
}

.part-selected-icon {
  position: absolute;
  top: 12px;
  right: 12px;
}

.index-info {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  margin-top: 8px;
  color: rgba(227, 242, 253, 0.7);
}

.example-box {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 6px;
  padding: 12px;
}

.example-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;

  &:last-child {
    margin-bottom: 0;
  }
}

.example-label {
  font-size: 12px;
  font-weight: 600;
  color: rgba(227, 242, 253, 0.7);
  min-width: 80px;
}

.example-value {
  background: rgba(33, 150, 243, 0.1);
  padding: 4px 8px;
  border-radius: 4px;
  font-family: 'Roboto Mono', monospace;
  font-size: 13px;
  color: #64b5f6;
  flex: 1;

  &.result {
    background: rgba(76, 175, 80, 0.15);
    color: #81C784;
    font-weight: 600;
  }
}

.quick-guide {
  margin-top: 8px;
  background: rgba(255, 152, 0, 0.08);
  border: 1px solid rgba(255, 152, 0, 0.3);
  border-radius: 6px;
  overflow: hidden;
}

.guide-toggle {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 600;
  color: #FF9800;
  transition: background 150ms;

  &:hover {
    background: rgba(255, 152, 0, 0.12);
  }
}

.guide-content {
  padding: 12px;
  border-top: 1px solid rgba(255, 152, 0, 0.2);
}

.guide-text {
  font-size: 12px;
  color: rgba(227, 242, 253, 0.7);
  line-height: 1.5;
  margin-bottom: 12px;

  &:last-child {
    margin-bottom: 0;
  }
}

.guide-example {
  font-size: 12px;
  color: rgba(227, 242, 253, 0.8);
  background: rgba(255, 152, 0, 0.1);
  padding: 8px;
  border-radius: 4px;
  margin-bottom: 12px;
  font-family: 'Roboto Mono', monospace;

  strong {
    color: #FFB74D;
  }
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .delimiter-chips {
    flex-direction: column;
  }

  .example-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }

  .example-label {
    min-width: auto;
  }
}
</style>
