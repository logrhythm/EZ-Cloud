<template>
  <div class="datetime-formatter-config">
    <div class="config-header">
      <q-icon name="schedule" size="20px" color="orange-6" class="q-mr-sm" />
      <span class="header-title">DateTime Format Configuration</span>
    </div>

    <div class="config-content q-gutter-md">
      <!-- Format Pattern Input -->
      <div class="form-group">
        <label class="field-label">
          Format Pattern (optional)
          <q-tooltip>Leave blank for default LogRhythm format</q-tooltip>
        </label>
        <q-input
          v-model="localFormat"
          outlined
          dense
          placeholder="yyyy-MM-dd HH:mm:ss.SSS"
          class="format-input"
          :class="{ 'input-valid': isFormatValid, 'input-invalid': !isFormatValid && localFormat }"
          :error="!isFormatValid && localFormat !== ''"
          :error-message="formatError"
          @update:model-value="debouncedValidate"
        >
          <template #prepend>
            <q-icon name="calendar_today" size="xs" />
          </template>
          <template #append>
            <q-btn
              v-if="localFormat"
              flat
              round
              dense
              icon="clear"
              size="xs"
              @click="clearFormat"
            >
              <q-tooltip>Clear format (use default)</q-tooltip>
            </q-btn>
          </template>
        </q-input>
        <div class="field-hint">
          Leave blank for default LogRhythm format, or specify a custom pattern
        </div>
      </div>

      <!-- Quick Presets -->
      <div class="form-group">
        <label class="field-label">Quick Presets</label>
        <div class="preset-buttons">
          <q-btn
            v-for="preset in presetOptions"
            :key="preset.name"
            :class="['preset-btn', { active: localFormat === preset.pattern }]"
            :label="preset.name"
            size="sm"
            no-caps
            outline
            @click="insertPreset(preset)"
          >
            <q-tooltip>
              <div class="preset-tooltip">
                <div>Pattern: {{ preset.pattern || 'Default' }}</div>
                <div>Example: {{ preset.example }}</div>
              </div>
            </q-tooltip>
          </q-btn>
        </div>
      </div>

      <!-- Pattern Builder (Expandable) -->
      <q-expansion-item
        icon="build"
        label="Pattern Builder"
        header-class="pattern-builder-header"
        dense
      >
        <q-card flat class="pattern-builder-card">
          <q-card-section>
            <div class="builder-content">
              <!-- Date Components -->
              <div class="builder-section">
                <div class="section-title">Date Components</div>
                <div class="component-row">
                  <div class="component-field">
                    <label>Year</label>
                    <q-select
                      v-model="builderComponents.year"
                      :options="formatComponents.year"
                      emit-value
                      map-options
                      option-value="value"
                      option-label="label"
                      dense
                      outlined
                      @update:model-value="buildFormatFromComponents"
                    />
                  </div>
                  <div class="component-field">
                    <label>Month</label>
                    <q-select
                      v-model="builderComponents.month"
                      :options="formatComponents.month"
                      emit-value
                      map-options
                      option-value="value"
                      option-label="label"
                      dense
                      outlined
                      @update:model-value="buildFormatFromComponents"
                    />
                  </div>
                  <div class="component-field">
                    <label>Day</label>
                    <q-select
                      v-model="builderComponents.day"
                      :options="formatComponents.day"
                      emit-value
                      map-options
                      option-value="value"
                      option-label="label"
                      dense
                      outlined
                      @update:model-value="buildFormatFromComponents"
                    />
                  </div>
                </div>
              </div>

              <!-- Time Components -->
              <div class="builder-section">
                <div class="section-title">Time Components</div>
                <div class="component-row">
                  <div class="component-field">
                    <label>Hour</label>
                    <q-select
                      v-model="builderComponents.hour"
                      :options="formatComponents.hour"
                      emit-value
                      map-options
                      option-value="value"
                      option-label="label"
                      dense
                      outlined
                      @update:model-value="buildFormatFromComponents"
                    />
                  </div>
                  <div class="component-field">
                    <label>Minute</label>
                    <q-select
                      v-model="builderComponents.minute"
                      :options="formatComponents.minute"
                      emit-value
                      map-options
                      option-value="value"
                      option-label="label"
                      dense
                      outlined
                      @update:model-value="buildFormatFromComponents"
                    />
                  </div>
                  <div class="component-field">
                    <label>Second</label>
                    <q-select
                      v-model="builderComponents.second"
                      :options="formatComponents.second"
                      emit-value
                      map-options
                      option-value="value"
                      option-label="label"
                      dense
                      outlined
                      @update:model-value="buildFormatFromComponents"
                    />
                  </div>
                </div>
              </div>

              <!-- Additional Components -->
              <div class="builder-section">
                <div class="section-title">Additional</div>
                <div class="component-row">
                  <div class="component-field">
                    <label>Millisecond</label>
                    <q-select
                      v-model="builderComponents.millisecond"
                      :options="formatComponents.millisecond"
                      emit-value
                      map-options
                      option-value="value"
                      option-label="label"
                      dense
                      outlined
                      @update:model-value="buildFormatFromComponents"
                    />
                  </div>
                  <div class="component-field">
                    <label>Timezone</label>
                    <q-select
                      v-model="builderComponents.timezone"
                      :options="formatComponents.timezone"
                      emit-value
                      map-options
                      option-value="value"
                      option-label="label"
                      dense
                      outlined
                      @update:model-value="buildFormatFromComponents"
                    />
                  </div>
                  <div class="component-field">
                    <label>AM/PM</label>
                    <q-select
                      v-model="builderComponents.ampm"
                      :options="formatComponents.ampm"
                      emit-value
                      map-options
                      option-value="value"
                      option-label="label"
                      dense
                      outlined
                      @update:model-value="buildFormatFromComponents"
                    />
                  </div>
                </div>
              </div>

              <!-- Generated Pattern -->
              <div class="generated-pattern">
                <strong>Generated Pattern:</strong>
                <code>{{ generatedPattern || 'Select components above' }}</code>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </q-expansion-item>

      <!-- Pattern Reference (Expandable) -->
      <q-expansion-item
        icon="help_outline"
        label="Pattern Reference"
        header-class="pattern-reference-header"
        dense
      >
        <q-card flat class="pattern-reference-card">
          <q-card-section>
            <div class="reference-content">
              <div class="reference-row">
                <code>yyyy</code>
                <span>4-digit year (2023)</span>
              </div>
              <div class="reference-row">
                <code>yy</code>
                <span>2-digit year (23)</span>
              </div>
              <div class="reference-row">
                <code>MM</code>
                <span>Month (01-12)</span>
              </div>
              <div class="reference-row">
                <code>dd</code>
                <span>Day (01-31)</span>
              </div>
              <div class="reference-row">
                <code>HH</code>
                <span>Hour 24-hr (00-23)</span>
              </div>
              <div class="reference-row">
                <code>hh</code>
                <span>Hour 12-hr (01-12)</span>
              </div>
              <div class="reference-row">
                <code>mm</code>
                <span>Minute (00-59)</span>
              </div>
              <div class="reference-row">
                <code>ss</code>
                <span>Second (00-59)</span>
              </div>
              <div class="reference-row">
                <code>SSS</code>
                <span>Millisecond (000-999)</span>
              </div>
              <div class="reference-row">
                <code>K</code>
                <span>Timezone offset (+00:00)</span>
              </div>
              <div class="reference-row">
                <code>Z</code>
                <span>UTC indicator (Z)</span>
              </div>
              <div class="reference-row">
                <code>tt</code>
                <span>AM/PM designator</span>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </q-expansion-item>

      <!-- Preview -->
      <div v-if="sampleValue" class="preview-section">
        <div class="preview-header">
          <q-icon name="visibility" size="18px" class="q-mr-sm" />
          <span>Preview</span>
        </div>
        <div class="preview-content">
          <div class="preview-row">
            <span class="preview-label">Sample Input:</span>
            <code class="preview-value">{{ sampleValue }}</code>
          </div>
          <div v-if="localFormat" class="preview-row">
            <span class="preview-label">Format Pattern:</span>
            <code class="preview-value">{{ localFormat }}</code>
          </div>
          <div v-else class="preview-row">
            <span class="preview-label">Format:</span>
            <code class="preview-value">Default LogRhythm format</code>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch } from 'vue'
import { debounce } from 'quasar'
import { DATETIME_FORMAT_PRESETS, FORMAT_COMPONENTS } from '../../../constants/operations'
import { validateDateTimeFormat } from '../../../utils/operationParser'

export default {
  name: 'DateTimeFormatterConfig',
  props: {
    modelValue: {
      type: String,
      default: ''
    },
    sampleValue: {
      type: String,
      default: ''
    }
  },
  emits: ['update:modelValue'],
  setup (props, { emit }) {
    const localFormat = ref(props.modelValue || '')
    const isFormatValid = ref(true)
    const formatError = ref(null)
    const generatedPattern = ref('')

    const builderComponents = ref({
      year: 'yyyy',
      month: 'MM',
      day: 'dd',
      hour: 'HH',
      minute: 'mm',
      second: 'ss',
      millisecond: '',
      timezone: '',
      ampm: ''
    })

    // Computed
    const presetOptions = computed(() => DATETIME_FORMAT_PRESETS)
    const formatComponents = computed(() => FORMAT_COMPONENTS)

    // Methods
    const validateFormat = () => {
      if (!localFormat.value) {
        isFormatValid.value = true
        formatError.value = null
        emitChange()
        return
      }

      const validation = validateDateTimeFormat(localFormat.value)
      isFormatValid.value = validation.isValid
      formatError.value = validation.error

      if (isFormatValid.value) {
        emitChange()
      }
    }

    const debouncedValidate = debounce(validateFormat, 300)

    const insertPreset = (preset) => {
      localFormat.value = preset.pattern
      validateFormat()
    }

    const clearFormat = () => {
      localFormat.value = ''
      formatError.value = null
      isFormatValid.value = true
      emitChange()
    }

    const buildFormatFromComponents = () => {
      const parts = []

      // Date part
      if (builderComponents.value.year) {
        parts.push(builderComponents.value.year)
      }
      if (builderComponents.value.month) {
        parts.push(builderComponents.value.month)
      }
      if (builderComponents.value.day) {
        parts.push(builderComponents.value.day)
      }

      const datePart = parts.join('-')
      parts.length = 0

      // Time part
      if (builderComponents.value.hour) {
        parts.push(builderComponents.value.hour)
      }
      if (builderComponents.value.minute) {
        parts.push(builderComponents.value.minute)
      }
      if (builderComponents.value.second) {
        parts.push(builderComponents.value.second)
      }

      let timePart = parts.join(':')

      // Add milliseconds
      if (builderComponents.value.millisecond) {
        timePart += `.${builderComponents.value.millisecond}`
      }

      // Add AM/PM
      if (builderComponents.value.ampm) {
        timePart += ` ${builderComponents.value.ampm}`
      }

      // Combine date and time
      let pattern = datePart
      if (timePart) {
        pattern += `T${timePart}`
      }

      // Add timezone
      if (builderComponents.value.timezone) {
        pattern += builderComponents.value.timezone
      }

      generatedPattern.value = pattern
      localFormat.value = pattern
      validateFormat()
    }

    const emitChange = () => {
      emit('update:modelValue', localFormat.value)
    }

    // Watch for external changes
    watch(() => props.modelValue, (newVal) => {
      localFormat.value = newVal || ''
      validateFormat()
    })

    // Initial validation
    if (localFormat.value) {
      validateFormat()
    }

    return {
      localFormat,
      isFormatValid,
      formatError,
      generatedPattern,
      builderComponents,
      presetOptions,
      formatComponents,
      debouncedValidate,
      insertPreset,
      clearFormat,
      buildFormatFromComponents
    }
  }
}
</script>

<style lang="scss" scoped>
.datetime-formatter-config {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: 16px;
  padding: 16px;
  border-radius: 6px;
  border: 1px solid rgba(255, 152, 0, 0.3);
  background: rgba(255, 152, 0, 0.05);
}

.config-header {
  display: flex;
  align-items: center;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(255, 152, 0, 0.2);
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

.format-input {
  ::v-deep .q-field__control {
    font-family: 'Roboto Mono', monospace;
    font-size: 13px;
    background: rgba(255, 255, 255, 0.05);
  }

  &.input-valid {
    ::v-deep .q-field__control {
      border-color: #4caf50;
      background: rgba(76, 175, 80, 0.05);
    }
  }

  &.input-invalid {
    ::v-deep .q-field__control {
      border-color: #f44336;
      background: rgba(244, 67, 54, 0.05);
    }
  }
}

.field-hint {
  font-size: 12px;
  color: rgba(227, 242, 253, 0.5);
  margin-top: 4px;
}

.preset-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.preset-btn {
  border-color: rgba(255, 152, 0, 0.5);
  color: #ff9800;

  &:hover {
    background: rgba(255, 152, 0, 0.1);
    border-color: #ff9800;
  }

  &.active {
    background: #ff9800;
    color: white;
    border-color: #ff9800;
  }
}

.preset-tooltip {
  font-size: 12px;
  line-height: 1.5;
}

.pattern-builder-header,
.pattern-reference-header {
  background: rgba(255, 255, 255, 0.05);
  color: #ff9800;
  font-size: 13px;
  font-weight: 500;
}

.pattern-builder-card,
.pattern-reference-card {
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.builder-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.builder-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.section-title {
  font-size: 13px;
  font-weight: 600;
  color: #ff9800;
  margin-bottom: 4px;
}

.component-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 12px;
}

.component-field {
  display: flex;
  flex-direction: column;
  gap: 4px;

  label {
    font-size: 12px;
    color: rgba(227, 242, 253, 0.7);
  }
}

.generated-pattern {
  padding: 12px;
  background: rgba(255, 152, 0, 0.1);
  border-left: 3px solid #ff9800;
  border-radius: 4px;

  strong {
    display: block;
    font-size: 13px;
    color: #ff9800;
    margin-bottom: 8px;
  }

  code {
    font-family: monospace;
    font-size: 14px;
    color: #A5D6A7;
  }
}

.reference-content {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 8px;
}

.reference-row {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 13px;

  code {
    font-family: monospace;
    background: rgba(255, 152, 0, 0.2);
    padding: 2px 6px;
    border-radius: 3px;
    color: #ff9800;
    min-width: 50px;
    text-align: center;
  }

  span {
    color: rgba(227, 242, 253, 0.7);
  }
}

.preview-section {
  padding: 12px;
  background: rgba(33, 150, 243, 0.1);
  border-left: 3px solid #2196f3;
  border-radius: 4px;
}

.preview-header {
  display: flex;
  align-items: center;
  font-size: 13px;
  font-weight: 600;
  color: #2196f3;
  margin-bottom: 12px;
}

.preview-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.preview-row {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.preview-label {
  font-size: 12px;
  color: rgba(227, 242, 253, 0.6);
}

.preview-value {
  font-family: monospace;
  font-size: 13px;
  color: #A5D6A7;
  background: rgba(0, 0, 0, 0.2);
  padding: 6px 8px;
  border-radius: 3px;
  display: block;
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .component-row {
    grid-template-columns: 1fr;
  }

  .reference-content {
    grid-template-columns: 1fr;
  }

  .preset-buttons {
    flex-direction: column;

    .preset-btn {
      width: 100%;
    }
  }
}
</style>
