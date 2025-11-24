<template>
  <div class="datetime-builder">
    <div class="builder-header">
      <q-icon name="schedule" size="20px" color="primary" />
      <span class="builder-title">DateTime Format Builder</span>
    </div>

    <div class="builder-content">
      <!-- Common Format Templates -->
      <div class="template-section">
        <div class="section-label">Quick Templates:</div>
        <div class="template-chips">
          <q-chip
            v-for="template in templates"
            :key="template.name"
            clickable
            :outline="selectedTemplate !== template.name"
            color="primary"
            text-color="white"
            @click="applyTemplate(template)"
          >
            <q-icon :name="template.icon" size="18px" class="q-mr-xs" />
            {{ template.label }}
          </q-chip>
        </div>
      </div>

      <!-- Format String Input -->
      <div class="format-input-section">
        <q-input
          v-model="format"
          outlined
          dense
          label="Format String"
          placeholder="yyyy-MM-dd HH:mm:ss"
          bg-color="white"
          color="black"
          class="format-input"
          @update:model-value="handleFormatChange"
        >
          <template v-slot:prepend>
            <q-icon name="text_format" color="primary" />
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
                Enter date/time format string<br/>
                Example: yyyy-MM-dd HH:mm:ss
              </q-tooltip>
            </q-btn>
          </template>
        </q-input>

        <div v-if="formatError" class="format-error">
          <q-icon name="error_outline" size="16px" />
          {{ formatError }}
        </div>
        <div v-else-if="format" class="format-info">
          <q-icon name="check_circle" size="16px" color="positive" />
          Valid format string
        </div>
      </div>

      <!-- Format Builder Tokens -->
      <div class="token-builder-section">
        <div class="section-label">Format Builder:</div>
        <div class="token-grid">
          <div
            v-for="token in formatTokens"
            :key="token.token"
            class="token-chip"
            @click="insertToken(token.token)"
          >
            <div class="token-value">{{ token.token }}</div>
            <div class="token-label">{{ token.label }}</div>
          </div>
        </div>
      </div>

      <!-- Live Preview -->
      <div class="preview-section">
        <div class="section-label">Preview:</div>
        <div class="preview-box">
          <div class="preview-row">
            <span class="preview-label">Format:</span>
            <code class="preview-value">{{ format || 'No format specified' }}</code>
          </div>
          <div class="preview-row">
            <span class="preview-label">Sample Output:</span>
            <code class="preview-value">{{ previewOutput }}</code>
          </div>
        </div>
      </div>

      <!-- Format Reference Guide -->
      <div class="format-guide">
        <div class="guide-toggle" @click="showGuide = !showGuide">
          <q-icon :name="showGuide ? 'expand_less' : 'expand_more'" />
          Format Tokens Reference
        </div>
        <q-slide-transition>
          <div v-show="showGuide" class="guide-content">
            <div class="guide-section">
              <div class="guide-section-title">Date Tokens:</div>
              <div class="guide-row">
                <code>yyyy</code> = 4-digit year (2024)
              </div>
              <div class="guide-row">
                <code>yy</code> = 2-digit year (24)
              </div>
              <div class="guide-row">
                <code>MMMM</code> = full month name (January)
              </div>
              <div class="guide-row">
                <code>MMM</code> = short month name (Jan)
              </div>
              <div class="guide-row">
                <code>MM</code> = 2-digit month (01-12)
              </div>
              <div class="guide-row">
                <code>M</code> = month (1-12)
              </div>
              <div class="guide-row">
                <code>dd</code> = 2-digit day (01-31)
              </div>
              <div class="guide-row">
                <code>d</code> = day (1-31)
              </div>
            </div>

            <div class="guide-section">
              <div class="guide-section-title">Time Tokens:</div>
              <div class="guide-row">
                <code>HH</code> = 2-digit hour 24h (00-23)
              </div>
              <div class="guide-row">
                <code>H</code> = hour 24h (0-23)
              </div>
              <div class="guide-row">
                <code>hh</code> = 2-digit hour 12h (01-12)
              </div>
              <div class="guide-row">
                <code>h</code> = hour 12h (1-12)
              </div>
              <div class="guide-row">
                <code>mm</code> = 2-digit minutes (00-59)
              </div>
              <div class="guide-row">
                <code>m</code> = minutes (0-59)
              </div>
              <div class="guide-row">
                <code>ss</code> = 2-digit seconds (00-59)
              </div>
              <div class="guide-row">
                <code>s</code> = seconds (0-59)
              </div>
              <div class="guide-row">
                <code>SSS</code> = milliseconds (000-999)
              </div>
              <div class="guide-row">
                <code>SSSSSS</code> = microseconds
              </div>
              <div class="guide-row">
                <code>a</code> = AM/PM marker
              </div>
            </div>

            <div class="guide-section">
              <div class="guide-section-title">Timezone Tokens:</div>
              <div class="guide-row">
                <code>Z</code> = timezone offset (+0000)
              </div>
              <div class="guide-row">
                <code>z</code> = timezone abbreviation (EST)
              </div>
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
  name: 'DateTimeFormatBuilder',
  props: {
    modelValue: {
      type: String,
      default: 'yyyy-MM-dd HH:mm:ss'
    },
    sampleTimestamp: {
      type: [Number, String],
      default: null
    }
  },
  emits: ['update:modelValue'],
  setup (props, { emit }) {
    const format = ref(props.modelValue || 'yyyy-MM-dd HH:mm:ss')
    const formatError = ref(null)
    const selectedTemplate = ref(null)
    const showGuide = ref(false)

    const templates = [
      {
        name: 'iso8601',
        label: 'ISO 8601',
        icon: 'language',
        format: 'yyyy-MM-dd\'T\'HH:mm:ss\'Z\'',
        description: 'International standard format'
      },
      {
        name: 'us-datetime',
        label: 'US DateTime',
        icon: 'flag',
        format: 'MM/dd/yyyy hh:mm:ss a',
        description: 'US date and time with AM/PM'
      },
      {
        name: 'eu-datetime',
        label: 'EU DateTime',
        icon: 'flag',
        format: 'dd/MM/yyyy HH:mm:ss',
        description: 'European date and time'
      },
      {
        name: 'date-only',
        label: 'Date Only',
        icon: 'today',
        format: 'yyyy-MM-dd',
        description: 'Date without time'
      },
      {
        name: 'time-only',
        label: 'Time Only',
        icon: 'access_time',
        format: 'HH:mm:ss',
        description: 'Time without date'
      },
      {
        name: 'readable',
        label: 'Readable',
        icon: 'article',
        format: 'MMMM dd, yyyy hh:mm:ss a',
        description: 'Human-readable format'
      }
    ]

    const formatTokens = [
      { token: 'yyyy', label: 'Year (4-digit)' },
      { token: 'MM', label: 'Month (01-12)' },
      { token: 'dd', label: 'Day (01-31)' },
      { token: 'HH', label: 'Hour (00-23)' },
      { token: 'mm', label: 'Minute (00-59)' },
      { token: 'ss', label: 'Second (00-59)' },
      { token: 'SSS', label: 'Millisecond' },
      { token: 'a', label: 'AM/PM' },
      { token: '-', label: 'Dash' },
      { token: '/', label: 'Slash' },
      { token: ':', label: 'Colon' },
      { token: ' ', label: 'Space' }
    ]

    const previewOutput = computed(() => {
      if (!format.value) return 'No format specified'

      // Use sample timestamp or current time
      const timestamp = props.sampleTimestamp || Date.now()
      const date = new Date(typeof timestamp === 'number' ? timestamp : parseInt(timestamp))

      if (isNaN(date.getTime())) {
        return 'Invalid timestamp'
      }

      try {
        // Simple format preview (not full implementation)
        let output = format.value
        output = output.replace(/yyyy/g, date.getFullYear())
        output = output.replace(/yy/g, String(date.getFullYear()).slice(-2))
        output = output.replace(/MMMM/g, date.toLocaleString('en-US', { month: 'long' }))
        output = output.replace(/MMM/g, date.toLocaleString('en-US', { month: 'short' }))
        output = output.replace(/MM/g, String(date.getMonth() + 1).padStart(2, '0'))
        output = output.replace(/M/g, date.getMonth() + 1)
        output = output.replace(/dd/g, String(date.getDate()).padStart(2, '0'))
        output = output.replace(/d/g, date.getDate())
        output = output.replace(/HH/g, String(date.getHours()).padStart(2, '0'))
        output = output.replace(/H/g, date.getHours())
        const hours12 = date.getHours() % 12 || 12
        output = output.replace(/hh/g, String(hours12).padStart(2, '0'))
        output = output.replace(/h/g, hours12)
        output = output.replace(/mm/g, String(date.getMinutes()).padStart(2, '0'))
        output = output.replace(/m/g, date.getMinutes())
        output = output.replace(/ss/g, String(date.getSeconds()).padStart(2, '0'))
        output = output.replace(/s/g, date.getSeconds())
        output = output.replace(/SSS/g, String(date.getMilliseconds()).padStart(3, '0'))
        output = output.replace(/a/g, date.getHours() >= 12 ? 'PM' : 'AM')

        return output
      } catch (e) {
        return 'Preview error'
      }
    })

    const applyTemplate = (template) => {
      selectedTemplate.value = template.name
      format.value = template.format
      validateFormat()
      emitValue()
    }

    const validateFormat = () => {
      if (!format.value) {
        formatError.value = 'Format is required'
        return false
      }

      // Basic validation - check for common format tokens
      const validTokens = /[yMdHhmsSSaz\s\-:/,'T]/g
      const cleanFormat = format.value.replace(validTokens, '')
      if (cleanFormat.length > 0) {
        formatError.value = 'Format contains invalid characters'
        return false
      }

      formatError.value = null
      return true
    }

    const handleFormatChange = () => {
      selectedTemplate.value = null
      validateFormat()
      emitValue()
    }

    const insertToken = (token) => {
      format.value = format.value + token
      validateFormat()
      emitValue()
    }

    const emitValue = () => {
      emit('update:modelValue', format.value)
    }

    // Watch for external changes
    watch(() => props.modelValue, (newVal) => {
      if (newVal !== format.value) {
        format.value = newVal || 'yyyy-MM-dd HH:mm:ss'
      }
    })

    return {
      format,
      formatError,
      selectedTemplate,
      showGuide,
      templates,
      formatTokens,
      previewOutput,
      applyTemplate,
      handleFormatChange,
      insertToken
    }
  }
}
</script>

<style lang="scss" scoped>
.datetime-builder {
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

.template-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.format-input {
  ::v-deep .q-field__control {
    font-family: 'Roboto Mono', monospace;
  }
}

.format-error,
.format-info {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  margin-top: 8px;
}

.format-error {
  color: #FF9800;
}

.format-info {
  color: #4CAF50;
}

.token-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 8px;
}

.token-chip {
  background: rgba(33, 150, 243, 0.1);
  border: 1px solid rgba(33, 150, 243, 0.3);
  border-radius: 6px;
  padding: 8px;
  text-align: center;
  cursor: pointer;
  transition: all 150ms;

  &:hover {
    background: rgba(33, 150, 243, 0.2);
    border-color: rgba(33, 150, 243, 0.5);
    transform: translateY(-2px);
  }

  &:active {
    transform: translateY(0);
  }
}

.token-value {
  font-family: 'Roboto Mono', monospace;
  font-size: 13px;
  font-weight: 600;
  color: #64b5f6;
  margin-bottom: 4px;
}

.token-label {
  font-size: 10px;
  color: rgba(227, 242, 253, 0.5);
}

.preview-box {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 6px;
  padding: 12px;
}

.preview-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;

  &:last-child {
    margin-bottom: 0;
  }
}

.preview-label {
  font-size: 12px;
  font-weight: 600;
  color: rgba(227, 242, 253, 0.7);
  min-width: 100px;
}

.preview-value {
  background: rgba(33, 150, 243, 0.15);
  padding: 4px 8px;
  border-radius: 4px;
  font-family: 'Roboto Mono', monospace;
  font-size: 13px;
  color: #64b5f6;
  flex: 1;
}

.format-guide {
  margin-top: 8px;
  background: rgba(76, 175, 80, 0.08);
  border: 1px solid rgba(76, 175, 80, 0.3);
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
  color: #4CAF50;
  transition: background 150ms;

  &:hover {
    background: rgba(76, 175, 80, 0.12);
  }
}

.guide-content {
  padding: 12px;
  border-top: 1px solid rgba(76, 175, 80, 0.2);
}

.guide-section {
  margin-bottom: 16px;

  &:last-child {
    margin-bottom: 0;
  }
}

.guide-section-title {
  font-size: 12px;
  font-weight: 600;
  color: #4CAF50;
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.guide-row {
  font-size: 12px;
  color: rgba(227, 242, 253, 0.7);
  margin-bottom: 6px;
  padding-left: 12px;

  &:last-child {
    margin-bottom: 0;
  }

  code {
    background: rgba(0, 0, 0, 0.3);
    padding: 2px 6px;
    border-radius: 3px;
    font-family: 'Roboto Mono', monospace;
    color: #81C784;
    margin-right: 8px;
  }
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .template-chips {
    flex-direction: column;
  }

  .token-grid {
    grid-template-columns: repeat(3, 1fr);
  }

  .preview-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }

  .preview-label {
    min-width: auto;
  }
}
</style>
